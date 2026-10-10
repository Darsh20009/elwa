export const managerRoles = ["admin", "owner", "manager", "branch_manager"];
export const isPrintManager = (employee: any) => managerRoles.includes(employee?.role);
export const mayAccessBranch = (employee: any, tenantId: string, branchId: string) =>
  Boolean(employee?.tenantId && employee.tenantId === tenantId &&
    (["admin", "owner"].includes(employee.role) || employee.branchId === branchId));
export const isBridgeOnline = (lastSeenAt: unknown, now = Date.now()) =>
  !!lastSeenAt && now - new Date(lastSeenAt as string).getTime() < 45_000;
export const canRetryJob = (status: string) => status === "failed";
export const allowedResult = (status: string) => ["spooled", "completed", "failed", "unknown"].includes(status);
