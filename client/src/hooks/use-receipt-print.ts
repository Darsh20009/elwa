import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ReceiptPrintConfig {
  branchId: string;
  name: string;
  manufacturer: string;
  model: string;
  paperWidth: 58 | 80;
  adapter: "browser" | "usb-bridge";
  paired: boolean;
  online: boolean;
  lastSeenAt?: string | null;
  lastSuccessfulJob?: string | { id?: string; completedAt?: string } | null;
  canManage: boolean;
}
export interface ReceiptPreview {
  html: string;
  config: ReceiptPrintConfig;
  orderId: string;
  canReprint: boolean;
}
export interface ReceiptPrintJob {
  id: string;
  status: "pending" | "processing" | "spooled" | "completed" | "failed" | "unknown";
  errorCode?: string;
  canRetry?: boolean;
  bridgeOnline?: boolean;
  physicalConfirmed?: false;
}
export type PrintApiError = Error & { status?: number; body?: { jobId?: string } };
export async function receiptRequest<T>(method: string, path: string, data?: unknown): Promise<T> {
  const response = await apiRequest(method, `/api/receipt-print${path}`, data);
  return response.json();
}
export function useReceiptPrintConfig(branchId?: string | null) {
  return useQuery<ReceiptPrintConfig, PrintApiError>({
    queryKey: ["receipt-print-config", branchId],
    queryFn: () => receiptRequest("GET", `/config?branchId=${encodeURIComponent(branchId!)}`),
    enabled: !!branchId,
    staleTime: 0,
    retry: false,
  });
}
export function useReceiptPreview(orderId?: string | null) {
  return useQuery<ReceiptPreview, PrintApiError>({
    queryKey: ["receipt-print-preview", orderId],
    queryFn: () => receiptRequest("GET", `/orders/${encodeURIComponent(orderId!)}/preview`),
    enabled: !!orderId,
    staleTime: 0,
    retry: false,
  });
}
export function useReceiptPrintJob(scope: string, endpoint: "/jobs" | "/test", payload: Record<string, string>) {
  const [job, setJob] = useState<ReceiptPrintJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PrintApiError | null>(null);
  const [conflict, setConflict] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const keys = useRef<{ normal?: string; reprint?: string; reprintCompleted?: boolean }>({});
  const polls = useRef(0);
  const [pollCycle, setPollCycle] = useState(0);
  useEffect(() => {
    generation.current += 1;
    keys.current = {};
    polls.current = 0;
    lock.current = false;
    setJob(null); setError(null); setConflict(false); setTimedOut(false); setBusy(false);
    return () => { generation.current += 1; };
  }, [scope]);

  async function perform(action: () => Promise<ReceiptPrintJob>, isConflict = false) {
    if (lock.current) return;
    lock.current = true;
    const current = generation.current;
    setBusy(true); setError(null);
    try {
      let next: ReceiptPrintJob;
      try {
        next = await action();
        if (current === generation.current) setConflict(isConflict);
      } catch (cause) {
        const failure = cause as PrintApiError;
        if (failure.status !== 409 || !failure.body?.jobId) throw cause;
        if (current === generation.current) setConflict(true);
        next = await receiptRequest("GET", `/jobs/${encodeURIComponent(failure.body.jobId)}`);
      }
      if (current !== generation.current) return;
      if (isConflict && keys.current.reprint) keys.current.reprintCompleted = true;
      setJob(next); polls.current = 0; setTimedOut(false); setPollCycle(v => v + 1);
    } catch (cause) {
      if (current === generation.current) setError(cause as PrintApiError);
    } finally {
      if (current === generation.current) { lock.current = false; setBusy(false); }
    }
  }
  function submit(reprint = false) {
    if (reprint && keys.current.reprintCompleted) {
      keys.current.reprint = undefined;
      keys.current.reprintCompleted = false;
    }
    return perform(async () => {
      const kind = reprint ? "reprint" : "normal";
      if (!keys.current[kind]) {
        const storageKey = `elwa-receipt-print:${scope}:${kind}`;
        let saved: string | null = null;
        try { saved = sessionStorage.getItem(storageKey); } catch {}
        keys.current[kind] = saved || crypto.randomUUID();
        try { sessionStorage.setItem(storageKey, keys.current[kind]!); } catch {}
      }
      const result = await receiptRequest<ReceiptPrintJob>("POST", endpoint, { ...payload, idempotencyKey: keys.current[kind], reprint });
      if (reprint) keys.current.reprintCompleted = true;
      return result;
    });
  }
  function refresh() {
    if (job) return perform(() => receiptRequest("GET", `/jobs/${encodeURIComponent(job.id)}`), conflict);
  }
  function retry() {
    if (job?.status === "failed" && job.canRetry) {
      return perform(() => receiptRequest("POST", `/jobs/${encodeURIComponent(job.id)}/retry`, {}), conflict);
    }
  }
  useEffect(() => {
    if (!job || !["pending", "processing"].includes(job.status) || timedOut || busy || error) return;
    if (polls.current >= 20) { setTimedOut(true); return; }
    const current = generation.current;
    const timer = window.setTimeout(async () => {
      polls.current += 1;
      try {
        const next = await receiptRequest<ReceiptPrintJob>("GET", `/jobs/${encodeURIComponent(job.id)}`);
        if (current === generation.current) setJob(next);
      } catch (cause) {
        if (current === generation.current) setError(cause as PrintApiError);
      }
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [job, timedOut, busy, error, pollCycle]);
  return { job, busy, error, conflict, timedOut, submit, refresh, retry };
}
