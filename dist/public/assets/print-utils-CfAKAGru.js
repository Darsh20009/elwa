const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/thermal-printer--aFKh5K_.js","assets/index-B-HkTL2H.js","assets/vendor-query-B1_Ni85z.js","assets/vendor-ui-BoMV2J8O.js","assets/vendor-utils-UagjiSbi.js","assets/index-DpQ4HO-U.css"])))=>i.map(i=>d[i]);
import{_ as z,x as ce}from"./index-B-HkTL2H.js";import{a as L}from"./browser-BJzWpxwN.js";import{J as Y}from"./JsBarcode-CfpzKTHA.js";const B=.15;function xe(){if(typeof navigator>"u")return!1;const e=navigator.userAgent||"",t=navigator.platform||"",i=/iPad|iPhone|iPod|CriOS|FxiOS|EdgiOS|OPiOS/i.test(e),a=t==="MacIntel"&&navigator.maxTouchPoints>1;return i||a}const H=new Map;function ye(e){const t=typeof e.total=="number"?e.total:parseFloat(String(e.total).replace(/[^0-9.-]/g,""))||0,i=t/(1+B),a=t-i,d=e.date?new Date(e.date).toISOString():new Date().toISOString(),r=`zatca:${e.orderNumber}:${t.toFixed(2)}`;if(H.has(r))return;const l=Z({sellerName:_,vatNumber:e.vatNumber||O,timestamp:d,totalWithVat:t.toFixed(2),vatAmount:a.toFixed(2)});L.toString(l,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"}).then(c=>{const o=c.replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"');H.set(r,o)}).catch(()=>{})}function W(e){const t=String(e).trim(),i=t.replace(/\D/g,"");return i?`#${i.padStart(4,"0")}`:`#${t}`}function Q(e){const t=k(e.price??e.unitPrice);return t>0?t:k(e.coffeeItem.price)}function D(e){return e.selectedSize??e.customization?.selectedSize??void 0}function E(e){if(e.customization?.selectedItemAddons?.length)return e.customization.selectedItemAddons;const t=e.customization?.addons;return Array.isArray(t)&&t.length?t.map(i=>({nameAr:i.nameAr||i.name||String(i)})):[]}let I=[],j=!1,R=null;function ve(){R&&clearTimeout(R),R=setTimeout(()=>{j&&(console.warn("[Print] Watchdog: print job stuck >8s — resetting queue"),j=!1,R=null,I.length>0&&setTimeout(F,300))},8e3)}function we(){R&&(clearTimeout(R),R=null)}const U=typeof navigator<"u"&&/Android/i.test(navigator.userAgent),$e=U;let q=null;function Pe(){if(!xe()||typeof window>"u")return null;const e=window.open("about:blank","_blank");return e?(q={window:e,documents:[]},e.document.open(),e.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>تجهيز الطباعة</title><body style="font-family:Arial,sans-serif;padding:24px;text-align:center">جارٍ تجهيز الإيصال للطباعة…</body></html>'),e.document.close(),e):null}function ee(e){const t=q;return!t||t.window.closed?!1:(t.documents.push(e),!0)}function Te(e,t="إيصال إلوة"){const i=q;if(!i||i.window!==e||(q=null,e.closed||i.documents.length===0))return!1;try{const a=i.documents.map(n=>new DOMParser().parseFromString(n,"text/html")),d=a.flatMap(n=>Array.from(n.head.querySelectorAll("style")).map(s=>s.textContent||"")).join(`
`),r=a.map(n=>`<section class="airprint-page">${n.body.innerHTML}</section>`).join("");e.document.open(),e.document.write(`<!doctype html>
      <html lang="ar" dir="rtl"><head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <base href="${window.location.origin}/">
        <title></title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #f3f4f6; color: #111; }
          .airprint-controls { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 14px; background: #fff; border-bottom: 1px solid #d1d5db; font: 15px Arial, sans-serif; }
          .airprint-controls button { border: 0; border-radius: 8px; padding: 12px 22px; background: #14734a; color: #fff; font-size: 16px; font-weight: 700; }
          .airprint-page { background: #fff; margin: 16px auto; width: max-content; max-width: 100%; }
          @media print {
            body { background: #fff !important; }
            .airprint-controls { display: none !important; }
            .airprint-page { margin: 0; max-width: none; page-break-after: always; break-after: page; }
            .airprint-page:last-child { page-break-after: auto; break-after: auto; }
          }
        </style>
        <style>${d}</style>
      </head><body>${r}</body></html>`),e.document.close(),e.document.title=t;const l=e.document.createElement("div");l.className="airprint-controls no-print",l.setAttribute("dir","rtl");const c=e.document.createElement("span");c.textContent="الإيصال جاهز. اضغط طباعة واختر الطابعة من قائمة AirPrint.";const o=e.document.createElement("button");return o.type="button",o.textContent="طباعة",o.addEventListener("click",()=>{try{e.focus(),e.print()}catch(n){console.error("[Print] iPad AirPrint dialog could not open:",n)}}),l.append(c,o),e.document.body.prepend(l),!0}catch(a){return console.error("[Print] Could not prepare iPad AirPrint document:",a),!1}}function Ne(e){q?.window===e&&(q=null);try{e&&!e.closed&&e.close()}catch{}}const ke="'Segoe UI', Tahoma, Arial, 'Helvetica Neue', sans-serif",M="__elwa_android_print_layer",X="__elwa_android_print_style";async function le(e,t=4e3){const i=Array.from(e.querySelectorAll("img"));await Promise.all(i.map(a=>a.complete?Promise.resolve():new Promise(d=>{let r,l=!1;const c=()=>{l||(l=!0,r!==void 0&&window.clearTimeout(r),d())};r=window.setTimeout(c,t),a.addEventListener("load",c,{once:!0}),a.addEventListener("error",c,{once:!0})})))}function de(e){document.getElementById(M)?.remove(),document.getElementById(X)?.remove();const i=(e.match(/@page\s*\{[^}]*\}/g)||[]).join(`
`),a=[];e.replace(/@page\s*\{[^}]*\}/g,"").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(n,s)=>(a.push(s.replace(/@page\s*\{[^}]*\}/g,"")),""));const r=(e.match(/<body([^>]*)>/i)||["",""])[1],l=(e.match(/<body[^>]*>([\s\S]*?)<\/body>/i)||["",""])[1],c=document.createElement("div");c.id=M,/dir=["']?rtl/i.test(r)&&c.setAttribute("dir","rtl"),/lang=["']?ar/i.test(r)&&c.setAttribute("lang","ar"),c.innerHTML=l,c.style.cssText="display:none!important;position:absolute;top:0;left:0;z-index:-9999;",document.body.appendChild(c);const o=document.createElement("style");return o.id=X,o.textContent=`
    /* @page outside @media so paper size applies to the print job */
    ${i}

    @media print {
      /* hide every direct child of body except our overlay */
      body > *:not(#${M}) {
        display: none !important;
        visibility: hidden !important;
      }
      /* show the overlay as if it were the body */
      #${M} {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        top: auto !important;
        left: auto !important;
        z-index: auto !important;
      }
      /* apply the original body-level styles to the overlay */
      ${a.join(`
`)}
    }
  `,document.head.appendChild(o),new Promise(n=>{let s=!1;const m=()=>{s||(s=!0,document.getElementById(M)?.remove(),document.getElementById(X)?.remove(),n())};window.addEventListener("afterprint",m,{once:!0}),le(c).then(()=>{requestAnimationFrame(()=>{setTimeout(()=>{try{window.print()}catch{m();return}setTimeout(m,500)},0)})})})}function te(e,t){return`<!DOCTYPE html><html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    @page { size: ${t} auto; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 4px; font-family: ${ke}; direction: rtl; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    img { max-width: 100%; }
  </style>
</head>
<body>${e}</body>
</html>`}async function K(e,t,i){const a=i?e:te(e,t);if(ee(a))return;if(U)return de(a);const d=document.createElement("iframe");d.setAttribute("aria-hidden","true");const r=t==="A4"?794:t==="58mm"?220:302;d.style.cssText=`position:fixed;top:-9999px;left:-9999px;width:${r}px;height:1px;border:none;opacity:0;pointer-events:none;overflow:hidden;`,document.body.appendChild(d);const l=d.contentDocument||d.contentWindow?.document;if(!l){try{d.remove()}catch{}j=!1,setTimeout(F,300);return}l.open(),l.write(a),l.close();const c=d.contentWindow;if(!c){try{d.remove()}catch{}j=!1,setTimeout(F,300);return}return await le(l),await new Promise(o=>setTimeout(o,20)),new Promise(o=>{let n=!1;const s=()=>{n||(n=!0,setTimeout(()=>{try{d.remove()}catch{}o()},200))};c.addEventListener("afterprint",s,{once:!0}),setTimeout(s,2e3),requestAnimationFrame(()=>{setTimeout(()=>{try{c.print()}catch{s()}},0)})})}function F(){if(j||I.length===0)return;j=!0,ve();const{html:e,paperWidth:t,isFullDoc:i}=I.shift();K(e,t,i).catch(a=>console.warn("[Print] Error:",a)).finally(()=>{we(),j=!1,I.length>0&&setTimeout(F,80)})}function ie(e,t,i={}){const{paperWidth:a="80mm"}=i,r=/<html[\s>]/i.test(e)?e:te(e,a);return ee(r)?q?.window||null:(I.push({html:r,paperWidth:a,isFullDoc:!0}),F(),null)}function Ae(e,t="80mm"){const i=te(e,t);ee(i)||(I.push({html:e,paperWidth:t,isFullDoc:!1}),F())}function pe(e,t="80mm"){const i=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><style>
    @page { size: ${t} auto; margin: 0; }
    html,body { margin:0; padding:0; background:#fff; }
    img { width: ${t}; display: block; margin: 0; padding: 0; }
  </style></head><body><img src="${e}" /></body></html>`;if(U){de(i).catch(()=>{});return}const a=document.createElement("iframe");a.setAttribute("aria-hidden","true"),a.style.cssText="position:fixed;top:-9999px;left:-9999px;width:302px;height:1px;border:none;opacity:0;pointer-events:none;",document.body.appendChild(a);const d=a.contentDocument||a.contentWindow?.document;if(!d){try{a.remove()}catch{}return}d.open(),d.write(i),d.close();const r=d.querySelector("img");let l=!1;const c=()=>{l||(l=!0,setTimeout(()=>{try{a.remove()}catch{}},200))},o=()=>{a.contentWindow?.addEventListener("afterprint",c,{once:!0}),setTimeout(c,5e3),requestAnimationFrame(()=>{setTimeout(()=>{try{a.contentWindow?.print()}catch{c()}},0)})};r&&!r.complete?(r.onload=()=>setTimeout(o,100),r.onerror=()=>setTimeout(o,100)):setTimeout(o,200)}async function Se(e,t="Elwa"){const{loadPrinterSettings:i,buildShiftReportEscPos:a,buildShiftReportCanvas:d,thermalPrint:r}=await z(async()=>{const{loadPrinterSettings:w,buildShiftReportEscPos:p,buildShiftReportCanvas:A,thermalPrint:C}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:w,buildShiftReportEscPos:p,buildShiftReportCanvas:A,thermalPrint:C}},__vite__mapDeps([0,1,2,3,4,5])),l=i(),c=w=>w?new Date(w).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}):"",o=w=>w?new Date(w).toLocaleDateString("ar-SA",{year:"numeric",month:"short",day:"numeric"}):"",n=e.openedAt||e.windowStart,s=e.closedAt||e.windowEnd,m=e.totalCash??e.totalCashSales??e.paymentBreakdown?.cash??0,y=e.totalCard??e.totalCardSales??(e.paymentBreakdown?.card??0)+(e.paymentBreakdown?.network??0),b=e.paymentBreakdown?.loyalty??0,x={shopName:t,reportTitle:e.reportTitle??(e.shiftNumber?"تقرير Z — إغلاق الوردية":e.isOngoing?"تقرير وردية جارية":"تقرير وردية مكتملة"),shiftNumber:e.shiftNumber,dateLabel:o(n),periodLabel:e.periodLabel,fromTime:c(n),toTime:e.isOngoing?"جارية...":c(s),cashierName:e.employeeName,totalOrders:e.totalOrders||0,totalSales:e.totalSales||0,totalCash:m,totalCard:y,totalLoyalty:b,productsByCategory:e.productsByCategory,paperWidth:l.paperWidth},h=await a(x);if(!(await r(h,"",l.paperWidth)).success){const p=(await d(x)).toDataURL("image/png");pe(p,l.paperWidth)}}async function _e(e){const{loadPrinterSettings:t,buildRefundEscPos:i,buildRefundCanvas:a,thermalPrint:d}=await z(async()=>{const{loadPrinterSettings:o,buildRefundEscPos:n,buildRefundCanvas:s,thermalPrint:m}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:o,buildRefundEscPos:n,buildRefundCanvas:s,thermalPrint:m}},__vite__mapDeps([0,1,2,3,4,5])),r=t(),l={shopName:e.shopName||_,refundId:e.refundId,originalOrderNumber:e.originalOrderNumber,items:e.items,refundAmount:e.refundAmount,paymentMethod:e.paymentMethod,cashAmount:e.cashAmount,cardAmount:e.cardAmount,reason:e.reason,employeeName:e.employeeName,date:e.date,originalPaymentMethod:e.originalPaymentMethod,paperWidth:r.paperWidth};if(r.enabled&&r.mode!=="browser")try{const o=await i(l);if((await d(o,"",r.paperWidth)).success)return}catch(o){console.warn("[printRefundThermal] Hardware print failed:",o)}const c=await a(l);pe(c.toDataURL("image/png"),r.paperWidth)}const O="312718675800003",_="إلوة",De="Elwa",ze="7025559423";function Z(e){const t=(s,m)=>{const b=new TextEncoder().encode(m),x=new Uint8Array(2+b.length);return x[0]=s,x[1]=b.length,x.set(b,2),x},i=t(1,e.sellerName),a=t(2,e.vatNumber),d=t(3,e.timestamp),r=t(4,e.totalWithVat),l=t(5,e.vatAmount),c=new Uint8Array(i.length+a.length+d.length+r.length+l.length);let o=0;c.set(i,o),o+=i.length,c.set(a,o),o+=a.length,c.set(d,o),o+=d.length,c.set(r,o),o+=r.length,c.set(l,o);let n="";return c.forEach(s=>{n+=String.fromCharCode(s)}),btoa(n)}function k(e){if(e==null)return 0;if(typeof e=="number")return e;const t=parseFloat(e.toString().replace(/[^0-9.-]/g,""));return isNaN(t)?0:t}function Ee(e,t){return!t||t.trim()===""||t.trim()===e.trim()?`<span style="font-weight:600;">${e}</span>`:`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
    <span style="direction:ltr;text-align:left;font-size:10px;color:#444;flex:1;word-break:break-word;">${t}</span>
    <span style="direction:rtl;text-align:right;font-weight:600;flex:1;word-break:break-word;">${e}</span>
  </div>`}async function me(e){await ue(e,{autoPrint:!0})}async function oe(e,t,i,a){const{buildReceiptBitmapEscPos:d}=await z(async()=>{const{buildReceiptBitmapEscPos:p}=await import("./thermal-printer--aFKh5K_.js");return{buildReceiptBitmapEscPos:p}},__vite__mapDeps([0,1,2,3,4,5])),r=k(e.total),l=r/(1+B),c=r-l,o=e.invoiceDiscount?k(e.invoiceDiscount):0,n=e.date?new Date(e.date).toISOString():new Date().toISOString(),{date:s,time:m}=V(e.date),y=Z({sellerName:_,vatNumber:e.vatNumber||O,timestamp:n,totalWithVat:r.toFixed(2),vatAmount:c.toFixed(2)}),b=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),[x,h]=await Promise.all([(async()=>{try{const p=`${window.location.origin}/track/${b}`;return await L.toDataURL(p,{width:180,margin:1,errorCorrectionLevel:"M"})}catch{return""}})(),(async()=>{try{return await L.toDataURL(y,{width:140,margin:1,errorCorrectionLevel:"M"})}catch{return""}})()]);let P="";try{const p=document.createElement("canvas");Y(p,b,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),P=p.toDataURL("image/png")}catch(p){console.error("[Print] Could not generate order barcode:",p)}const w=(()=>{const p=(e.paymentMethod||"").toLowerCase();return p==="cash"?"نقدي":p==="apple_pay"||p==="paymob-apple-pay"||p==="neoleap-apple-pay"?"Apple Pay":p==="stc-pay"||p==="stc_pay"?"STC Pay":p==="mada"?"مدى":p==="card"||p==="network"||p==="pos"||p==="pos-network"?"شبكة":p==="loyalty"||p.includes("qirox")||p.includes("qahwa")||p==="loyalty-card"?"بطاقة ولاء":p==="geidea"||p==="paymob-card"||p==="paymob"?"بطاقة ائتمان":p==="bank_transfer"||p==="rajhi"||p==="alinma"?"تحويل بنكي":p==="split"?"نقدي + شبكة":e.paymentMethod||"غير محدد"})();return d({shopName:_,vatNumber:e.vatNumber||O,branchName:e.branchName||void 0,orderNumber:e.orderNumber,orderDate:`${s} · ${m}`,cashierName:e.employeeName||"—",customerName:e.customerName&&e.customerName!=="عميل نقدي"?e.customerName:void 0,tableNumber:e.tableNumber,orderType:t||void 0,items:e.items.map(p=>({name:p.coffeeItem.nameAr,nameEn:p.coffeeItem.nameEn||"",qty:p.quantity,price:Q(p),addons:[...D(p)?[`الحجم: ${D(p)}`]:[],...E(p).map(A=>A.nameAr)].filter(Boolean)})),subtotal:l,vat:c,total:r,discount:o>0?o:void 0,splitPayment:e.splitPayment,paymentMethod:w,...e.cashReceived?{cashReceived:e.cashReceived}:{},logoDataUrl:"/elwa-invoice-logo.png?v=4",orderBarcodeDataUrl:P||void 0,trackingQrDataUrl:x||void 0,zatcaQrDataUrl:h||void 0,paperWidth:i,feedLines:a})}async function Ce(e,t="customer"){try{const{loadPrinterSettings:i,thermalPrint:a,buildEscPosKitchenTicketBitmap:d,getProfilesForRole:r,thermalPrintWithProfile:l}=await z(async()=>{const{loadPrinterSettings:o,thermalPrint:n,buildEscPosKitchenTicketBitmap:s,getProfilesForRole:m,thermalPrintWithProfile:y}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:o,thermalPrint:n,buildEscPosKitchenTicketBitmap:s,getProfilesForRole:m,thermalPrintWithProfile:y}},__vite__mapDeps([0,1,2,3,4,5])),c=i();if(c.enabled&&c.mode!=="browser"){const o=e.orderTypeName||e.orderType||"",n=o==="dine_in"||o==="dine-in"?"محلي":o==="takeaway"||o==="pickup"?"سفري":o==="delivery"?"توصيل":o==="car_pickup"||o==="car-pickup"?"استلام بالسيارة":o||"محلي",s=o==="car_pickup"||o==="car-pickup"?[e.carInfo?.carType,e.carInfo?.carColor||e.carColor,e.carInfo?.plateNumber||e.plateNumber?`لوحة: ${e.carInfo?.plateNumber||e.plateNumber}`:""].filter(Boolean).join(" | "):void 0,m=r("receipt"),y=r("kitchen");let b=!1;if(t==="customer"||t==="both"){const x=await oe(e,n,c.paperWidth,c.feedLines??4);if(m.length>0){for(const h of m)await l(x,h);b=!0}else(await a(x,"",c.paperWidth)).success&&(b=!0)}if(t==="kitchen"||t==="both"){t==="both"&&await new Promise(h=>setTimeout(h,1200));const x=await d({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:n,cashierName:e.employeeName||"—",items:e.items.map(h=>({name:h.coffeeItem.nameAr,nameEn:h.coffeeItem.nameEn||"",qty:h.quantity,addons:[...D(h)?[`الحجم: ${D(h)}`]:[],...E(h).map(P=>P.nameAr)]})),notes:[s,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:c.paperWidth});if(y.length>0){for(const h of y)await l(x,h);b=!0}else(await a(x,"",c.paperWidth)).success&&(b=!0)}if(b)return}}catch(i){console.warn("[printReceiptSection] Thermal error, falling back to browser:",i)}if(t==="customer"||t==="both"){const i=await J(e);I.push({html:i,paperWidth:"80mm",isFullDoc:!0})}if(t==="kitchen"||t==="both"){const i=G(e);I.push({html:i,paperWidth:"80mm",isFullDoc:!0})}F()}async function Ie(e){const t=await J(e),i=G(e);await K(t,"80mm",!0),await new Promise(a=>setTimeout(a,300)),await K(i,"80mm",!0)}async function Re(e){const t=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
    .invoice-page { width: 80mm; padding: 10px; border-bottom: 2px dashed #000; page-break-after: always; }
    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; }
    .content { margin-top: 10px; }
    .row { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
  </style>
</head>
<body>
  ${e.map(i=>{const a=new Date(i.createdAt),d=a.toLocaleDateString("ar-SA"),r=a.toLocaleTimeString("ar-SA");return`
    <div class="invoice-page">
      <div class="header">
        <h3>ملخص طلب موظف</h3>
        <div>رقم الطلب: ${W(i.orderNumber)}</div>
        <div>التاريخ: ${d} ${r}</div>
      </div>
      <div class="content">
        ${(i.items||[]).map(l=>`
          <div class="row">
            <span>${l.name||l.coffeeItem?.nameAr}</span>
            <span>${l.quantity}</span>
          </div>
        `).join("")}
        <div class="row total">
          <span>الإجمالي:</span>
          <span>${i.totalAmount} ر.س</span>
        </div>
      </div>
    </div>
    `}).join("")}
</body>
</html>
  `;ie(t,"Bulk Employee Invoices",{paperWidth:"80mm"})}function V(e){try{const t=new Date(e);return isNaN(t.getTime())?{date:e,time:""}:{date:t.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"}),time:t.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}}catch{return{date:e,time:""}}}async function J(e){const t=k(e.total),i=t/(1+B),a=t-i,d=e.invoiceDiscount?k(e.invoiceDiscount):0,{date:r,time:l}=V(e.date),c=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,o=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let n="";try{const f=document.createElement("canvas");Y(f,o,{format:"CODE128",displayValue:!0,height:42,width:2,margin:4}),n=f.toDataURL("image/png")}catch(f){console.error("[Print] Could not generate order barcode:",f)}const s=e.orderTypeName||e.orderType||"",m=s==="dine_in"||s==="dine-in"?"محلي":s==="takeaway"||s==="pickup"?"سفري":s==="delivery"?"توصيل":s==="car_pickup"||s==="car-pickup"?"🚗 سيارة":s,y=e.date?new Date(e.date).toISOString():new Date().toISOString(),b=Z({sellerName:_,vatNumber:e.vatNumber||O,timestamp:y,totalWithVat:t.toFixed(2),vatAmount:a.toFixed(2)}),x=`zatca:${e.orderNumber}:${t.toFixed(2)}`;let h=H.get(x)||"";if(!h)try{h=(await L.toString(b,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"'),H.set(x,h)}catch{}e.items.reduce((f,T)=>f+(T.quantity||1),0),e.items.map(f=>{const T=Q(f),v=k(f.itemDiscount),N=f.quantity*T-v,$=E(f).map(S=>S.nameAr).join("، "),g=D(f),u=[g?`الحجم: ${g}`:"",$?`+ ${$}`:""].filter(Boolean).join(" · ");return`
      <div style="padding:6px 10px 0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:13px;line-height:1.7;">
          <span style="direction:ltr;flex-shrink:0;white-space:nowrap;font-weight:600;">﷼ ${N.toFixed(2)}</span>
          <span style="text-align:right;">
            ${f.coffeeItem.nameAr} &times;${f.quantity}
            ${u?`<br/><span style="font-size:11px;color:#666;">${u}</span>`:""}
            ${v>0?`<br/><span style="font-size:11px;color:#16a34a;">خصم -﷼${v.toFixed(2)}</span>`:""}
          </span>
        </div>
      </div>
      <div style="border-top:1px dashed #bbb;margin:6px 10px 0;"></div>`}).join("");const w=s==="car_pickup"||s==="car-pickup"?(()=>{const f=e.carInfo?.carType||"",T=e.carInfo?.carColor||e.carColor||"",v=e.carInfo?.plateNumber||e.plateNumber||"",N=[T,f,v?`لوحة: ${v}`:""].filter(Boolean);return N.length?`
    <div style="margin:0 10px 4px;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;padding:7px 10px;font-size:12px;font-weight:700;text-align:center;">
      🚗 ${N.join(" | ")}
    </div>`:""})():"",p=e.paymentMethod==="cash"?"نقدي":e.paymentMethod==="card"?"شبكة":e.paymentMethod==="split"?"مقسّم":e.paymentMethod==="qahwa-card"?"بطاقة إلوة":e.paymentMethod||"نقدي",A=e.paymentMethod==="cash"?"💵":e.paymentMethod==="card"?"💳":e.paymentMethod==="split"?"⇄":e.paymentMethod==="qahwa-card"?"🎴":"💵";return e.loyaltyPoints&&`${e.loyaltyPoints}`,`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',Tahoma,Arial,sans-serif;direction:rtl;background:#d6d6d6;display:flex;justify-content:center;align-items:flex-start;padding:24px 10px;min-height:100vh;color:#000;}
.paper{background:#fff;width:302px;padding:12px 12px 10px;box-shadow:0 2px 8px rgba(0,0,0,.18),0 8px 32px rgba(0,0,0,.12);}
.label{background:#000;color:#fff;padding:2px 8px;border-radius:4px;font-size:13px;font-weight:bold;margin-bottom:8px;display:inline-block;}
.header{text-align:center;border-bottom:1px solid #000;padding-bottom:10px;margin-bottom:10px;}
.website{font-size:13px;font-weight:bold;color:#b45309;margin-bottom:4px;}
.head-line{font-size:11.5px;margin:2px 0;}
.order-line{font-size:13px;font-weight:bold;margin-top:4px;}
.order-barcode{text-align:center;margin:5px 0 8px;}
.order-barcode img{width:190px;height:52px;object-fit:contain;}
.info-block{margin-bottom:10px;font-size:12px;border-bottom:1px dashed #ccc;padding-bottom:6px;}
.info-block div{padding:1px 0;}
.item-row{display:flex;justify-content:space-between;align-items:flex-start;padding:4px 0;border-bottom:1px dashed #eee;font-size:12.5px;}
.item-name{flex:1;text-align:right;font-weight:600;}
.item-extra{font-size:10.5px;color:#666;margin-top:2px;font-weight:400;}
.item-disc{font-size:10.5px;color:#16a34a;margin-top:2px;}
.item-price{width:60px;text-align:left;flex-shrink:0;direction:ltr;}
.totals{margin-top:10px;}
.row{display:flex;justify-content:space-between;margin:4px 0;font-size:12.5px;}
.row span:last-child{direction:ltr;}
.total{font-weight:bold;font-size:16px;border-top:2px solid #000;padding-top:6px;margin-top:8px;}
.split-row{font-size:11px;color:#555;margin:2px 0;}
.change-box{background:#f0fdf4;border:1px solid #86efac;border-radius:6px;margin:8px 0 2px;padding:6px 10px;}
.change-row{display:flex;justify-content:space-between;font-size:11.5px;color:#166534;}
.change-row span:last-child{direction:ltr;font-weight:700;}
.car-box{margin:8px 0 4px;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;padding:6px 10px;font-size:11.5px;font-weight:700;text-align:center;}
.notes-box{margin:8px 0 4px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:6px 10px;font-size:11.5px;line-height:1.7;}
.loyalty-box{margin:8px 0 4px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:6px 10px;text-align:center;font-size:11px;color:#166534;font-weight:700;}
.qr-container{text-align:center;margin-top:10px;}
.footer{text-align:center;margin-top:12px;font-size:11px;color:#666;}
@media print{
  @page{size:80mm auto;margin:0;}
  body{background:#fff!important;padding:0!important;display:block!important;}
  .paper{width:80mm!important;box-shadow:none!important;}
}
</style></head><body><div class="paper">

  <!-- ══ رأس الفاتورة ══ -->
  <div class="header">
    <div class="label">إيصال العميل (فاتورة ضريبية)</div>
    
    <div style="text-align:center;padding:6px 0 10px;">
      <img src="/elwa-invoice-logo.png?v=4" alt="إلوة" style="width:110px;height:auto;max-height:56px;object-fit:contain;display:block;margin:0 auto;">
    </div>
    <div class="website">${ce.website}</div>
    <div class="head-line">الرقم الضريبي: ${e.vatNumber||O}</div>
    <div class="order-line">رقم الطلب: #${c}</div>
    ${n?`<div class="order-barcode"><img src="${n}" alt="باركود الطلب"></div>`:""}
    <div class="head-line" style="direction:ltr;">${r} ${l}</div>
  </div>

  <!-- ══ بيانات الطلب ══ -->
  <div class="info-block">
    <div>${m?`نوع الطلب: ${m}`:""}</div>
    ${e.tableNumber?`<div>طاولة: ${e.tableNumber}</div>`:""}
    ${e.employeeName?`<div>الموظف: ${e.employeeName}</div>`:""}
  </div>

  <!-- ══ الأصناف ══ -->
  ${e.items.map(f=>{const T=Q(f),v=k(f.itemDiscount),N=f.quantity*T-v,$=E(f).map(S=>S.nameAr).join("، "),g=D(f),u=[g?`الحجم: ${g}`:"",$?`+ ${$}`:""].filter(Boolean).join(" · ");return`<div class="item-row">
      <div class="item-name">
        ${f.coffeeItem.nameAr} &times;${f.quantity}
        ${u?`<div class="item-extra">${u}</div>`:""}
        ${v>0?`<div class="item-disc">خصم -﷼${v.toFixed(2)}</div>`:""}
      </div>
      <div class="item-price">${N.toFixed(2)}</div>
    </div>`}).join("")}

  <!-- ══ الحساب ══ -->
  <div class="totals">
    <div class="row"><span>المجموع (غير شامل الضريبة):</span><span>${i.toFixed(2)} ر.س</span></div>
    <div class="row"><span>ضريبة القيمة المضافة (15%):</span><span>${a.toFixed(2)} ر.س</span></div>
    ${d>0?`<div class="row" style="color:#16a34a;"><span>الخصم:</span><span>-${d.toFixed(2)} ر.س</span></div>`:""}
    <div class="row total"><span>الإجمالي شامل الضريبة:</span><span>${t.toFixed(2)} ر.س</span></div>
    <div class="row" style="margin-top:5px;font-size:11px;"><span>طريقة الدفع:</span><span>${A} ${p}</span></div>
    ${e.splitPayment?`
    <div class="split-row row">${e.splitPayment.cash>0?`<span>نقدي: ${e.splitPayment.cash.toFixed(2)}</span>`:"<span></span>"}${e.splitPayment.card>0?`<span>شبكة: ${e.splitPayment.card.toFixed(2)}</span>`:""}</div>`:""}
    ${e.cashReceived&&e.cashReceived>0&&!e.splitPayment?`
    <div class="change-box">
      <div class="change-row"><span>المبلغ المستلم:</span><span>${e.cashReceived.toFixed(2)} ر.س</span></div>
      <div class="change-row" style="font-weight:900;font-size:13px;margin-top:2px;"><span>الباقي للعميل:</span><span>${Math.max(0,e.cashReceived-t).toFixed(2)} ر.س</span></div>
    </div>`:""}
  </div>

  <!-- ══ بيانات السيارة ══ -->
  ${w}

  <!-- ══ ملاحظات ══ -->
  ${e.notes?`<div class="notes-box"><strong>ملاحظات:</strong> ${e.notes}</div>`:""}

  <!-- ══ كود QR ZATCA ══ -->
  ${h?`<div class="qr-container">${h}<div style="font-size:10px;margin-top:4px;">امسح للتحقق من الفاتورة</div></div>`:""}

  <!-- ══ نقاط الولاء ══ -->
  ${e.loyaltyPoints?`<div class="loyalty-box">⭐ +${e.loyaltyPoints} نقطة أضيفت لرصيدك</div>`:""}

  <!-- ══ التذييل ══ -->
  <div class="footer">
    <div style="font-weight:bold;margin-bottom:4px;">${ce.website}</div>
    شكراً لزيارتكم!
  </div>

</div></body></html>`}function G(e){const{date:t,time:i}=V(e.date),a=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,d=e.orderTypeName||e.orderType||"",r=d==="dine_in"||d==="dine-in"?e.tableNumber?`محلي — طاولة رقم ${e.tableNumber}`:"محلي":d==="takeaway"||d==="pickup"?"سفري":d==="delivery"?"توصيل":d==="car_pickup"||d==="car-pickup"?"استلام بالسيارة":d,l=e.items.map(m=>{const y=E(m).map(x=>x.nameAr).join(" &bull; "),b=D(m);return`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start;">
        <div style="flex:1;padding-left:8px;">
          <div style="font-size:17px;font-weight:600;">${m.coffeeItem.nameAr}</div>
          ${b?`<div style="font-size:13px;color:#2563eb;margin-top:3px;">الحجم: ${b}</div>`:""}
          ${y?`<div style="font-size:13px;color:#555;margin-top:3px;">+ ${y}</div>`:""}
        </div>
        <div style="font-size:26px;font-weight:bold;border:2px solid #000;padding:2px 10px;border-radius:4px;flex-shrink:0;">x${m.quantity}</div>
      </div>`}).join(""),c=e.carInfo?.carType||"",o=e.carInfo?.carColor||e.carColor||"",n=e.carInfo?.plateNumber||e.plateNumber||"",s=[o,c,n?`لوحة: ${n}`:""].filter(Boolean);return`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',Tahoma,Arial,sans-serif;direction:rtl;background:#d6d6d6;display:flex;justify-content:center;align-items:flex-start;padding:24px 10px;min-height:100vh;color:#000;}
.paper{background:#fff;width:302px;padding:12px 12px 10px;box-shadow:0 2px 8px rgba(0,0,0,.18),0 8px 32px rgba(0,0,0,.12);}
.label{color:#fff;padding:2px 8px;border-radius:4px;font-size:13px;font-weight:bold;margin-bottom:8px;display:inline-block;}
.header{text-align:center;border-bottom:1px solid #000;padding-bottom:10px;margin-bottom:10px;}
.order-num{font-size:28px;font-weight:bold;margin:8px 0;}
.table-badge{font-size:16px;font-weight:bold;color:#b45309;border:2px solid #b45309;padding:3px 8px;margin-top:5px;display:inline-block;}
.emp-line{font-size:11px;color:#555;margin-top:6px;}
.car-box{margin:10px 0;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:700;text-align:center;}
.notes-box{margin-top:12px;background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.7;}
.footer-note{text-align:center;margin-top:12px;font-weight:bold;font-size:12px;border-top:1px dashed #000;padding-top:8px;}
@media print{
  @page{size:80mm auto;margin:0;}
  body{background:#fff!important;padding:0!important;display:block!important;}
  .paper{width:80mm!important;box-shadow:none!important;}
}
</style></head><body><div class="paper">

  <!-- ══ رأس الفاتورة ══ -->
  <div class="header">
    <div class="label" style="background:#444;">إيصال الموظف (التحضير)</div>
    <div class="order-num">#${a}</div>
    ${r?`<div style="font-size:13px;font-weight:700;color:#333;">${r}</div>`:""}
    ${e.tableNumber&&!(d==="dine_in"||d==="dine-in")?`<div class="table-badge">طاولة: ${e.tableNumber}</div>`:""}
    <div class="emp-line">الموظف: ${e.employeeName||"—"} &nbsp;|&nbsp; ${i} — ${t}</div>
  </div>

  <!-- ══ الأصناف ══ -->
  <div class="items">${l}</div>

  <!-- ══ بيانات السيارة ══ -->
  ${s.length?`<div class="car-box">🚗 ${s.join(" | ")}</div>`:""}

  <!-- ══ ملاحظات ══ -->
  ${e.notes?`
  <div class="notes-box">
    <div style="font-weight:900;color:#92400e;margin-bottom:4px;">⚠ ملاحظات العميل:</div>
    <div style="font-weight:700;">${e.notes}</div>
  </div>`:""}

  <div class="footer-note">يرجى التحقق من الأصناف قبل التسليم</div>

</div></body></html>`}async function ue(e,t={}){const i=t.autoPrint!==void 0?t.autoPrint:!0;if(i)try{const{loadPrinterSettings:l,buildEscPosKitchenTicketBitmap:c,thermalPrint:o}=await z(async()=>{const{loadPrinterSettings:s,buildEscPosKitchenTicketBitmap:m,thermalPrint:y}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:s,buildEscPosKitchenTicketBitmap:m,thermalPrint:y}},__vite__mapDeps([0,1,2,3,4,5])),n=l();if(n.enabled&&n.mode!=="browser"){const s=e.orderTypeName||e.orderType||"",m=s==="dine_in"||s==="dine-in"?"محلي":s==="takeaway"||s==="pickup"?"سفري":s==="delivery"?"توصيل":s==="car_pickup"||s==="car-pickup"?"استلام بالسيارة":s||"محلي",y=e.carInfo?.carType||"",b=e.carInfo?.carColor||e.carColor||"",x=e.carInfo?.plateNumber||e.plateNumber||"",h=s==="car_pickup"||s==="car-pickup"?[y,b,x?`لوحة: ${x}`:""].filter(Boolean).join(" | "):void 0,P=await oe(e,m,n.paperWidth,n.feedLines??4),w=Math.max(1,Math.min(5,n.customerCopies||1)),p=Math.max(1,Math.min(5,n.kitchenCopies||1)),{getProfilesForRole:A,thermalPrintWithProfile:C}=await z(async()=>{const{getProfilesForRole:$,thermalPrintWithProfile:g}=await import("./thermal-printer--aFKh5K_.js");return{getProfilesForRole:$,thermalPrintWithProfile:g}},__vite__mapDeps([0,1,2,3,4,5])),f=A("receipt"),T=A("kitchen");let v={success:!1,mode:"error",error:""};if(f.length>0){for(const $ of f)for(let g=0;g<w;g++)g>0&&await new Promise(u=>setTimeout(u,1200)),v=await C(P,$);v.success=!0}else{v=await o(P,"",n.paperWidth);for(let $=1;$<w&&v.success;$++)await new Promise(g=>setTimeout(g,1200)),v=await o(P,"",n.paperWidth)}if(v.success||f.length>0){if(n.autoKitchenCopy||T.length>0){const $=await c({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:m,cashierName:e.employeeName||"—",items:e.items.map(g=>({name:g.coffeeItem.nameAr,nameEn:g.coffeeItem.nameEn||"",qty:g.quantity,addons:[...D(g)?[`الحجم: ${D(g)}`]:[],...E(g).map(u=>u.nameAr)]})),notes:[h,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:n.paperWidth});if(await new Promise(g=>setTimeout(g,1200)),T.length>0)for(const g of T)for(let u=0;u<p;u++)u>0&&await new Promise(S=>setTimeout(S,1200)),await C($,g);else if(n.autoKitchenCopy)for(let g=0;g<p;g++)g>0&&await new Promise(u=>setTimeout(u,1400)),await o($,"",n.paperWidth)}return}const N=v.error||"فشلت الطباعة الحرارية";console.error("[PrintTaxInvoice] Hardware print failed — mode:",n.mode,"— error:",N),typeof window<"u"&&window.__qiroxPrintError!==void 0?window.__qiroxPrintError(N):window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:N,mode:n.mode}}));return}}catch(l){if(console.warn("[PrintTaxInvoice] Thermal print error:",l),window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:l?.message||"فشل الاتصال بالطابعة — تحقق من إعدادات الطابعة الحرارية",mode:"thermal"}})),U)return}W(e.orderNumber);const a=await J(e),d=G(e),r=l=>K(l,"80mm",!0);if(i){if(U){window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:"يرجى ضبط الطابعة الحرارية في إعدادات الطباعة",mode:"browser"}}));return}const{loadPrinterSettings:l}=await z(async()=>{const{loadPrinterSettings:s}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:s}},__vite__mapDeps([0,1,2,3,4,5])),c=l(),o=Math.max(1,Math.min(5,c.customerCopies||1)),n=c.autoKitchenCopy?Math.max(1,Math.min(5,c.kitchenCopies||1)):0;for(let s=0;s<o;s++)s>0&&await new Promise(m=>setTimeout(m,150)),await r(a);for(let s=0;s<n;s++)await new Promise(m=>setTimeout(m,150)),await r(d)}else await r(a),await new Promise(l=>setTimeout(l,300)),await r(d)}async function je(e){const t=u=>String(u??"").replace(/[&<>"']/g,S=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[S]),i=k(e.total),a=i/(1+B),d=i-a,r=e.date?new Date(e.date):new Date,l=Number.isNaN(r.getTime())?new Date().toISOString():r.toISOString(),{date:c,time:o}=V(e.date),n=e.vatNumber||O,s=e.crNumber||ze,m=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let y="",b="";try{const u=document.createElement("canvas");Y(u,m,{format:"CODE128",displayValue:!0,height:48,width:2,margin:4}),y=u.toDataURL("image/png")}catch(u){console.error("[Print] Could not generate order barcode:",u)}try{const u=Z({sellerName:_,vatNumber:n,timestamp:l,totalWithVat:i.toFixed(2),vatAmount:d.toFixed(2)});b=await L.toDataURL(u,{width:150,margin:1,errorCorrectionLevel:"M"})}catch(u){console.error("[Print] Could not generate ZATCA QR:",u)}const x=e.items.map(u=>{const S=Math.max(1,Number(u.quantity)||1),ne=Q(u),fe=k(u.itemDiscount),ge=Math.max(0,ne*S-fe),he=t(u.coffeeItem?.nameAr||u.coffeeItem?.nameEn||"منتج"),re=D(u),ae=E(u).map(be=>t(be.nameAr)).filter(Boolean).join("، "),se=[re?`الحجم: ${t(re)}`:"",ae?`الإضافات: ${ae}`:""].filter(Boolean).join(" · ");return`
      <tr>
        <td class="item-cell">${he}${se?`<small>${se}</small>`:""}</td>
        <td class="numeric">${S}</td>
        <td class="numeric">${ne.toFixed(2)} ر.س</td>
        <td class="numeric">${ge.toFixed(2)} ر.س</td>
      </tr>
    `}).join(""),h=k(e.invoiceDiscount??e.discount?.amount),P=t(e.invoiceNumber||e.orderNumber),w=t(e.customerName||"عميل نقدي"),p=t(e.customerPhone),A=t(e.branchName||_),C=t(e.branchAddress||""),f=t(e.employeeName),T=t(e.paymentMethod),v=t(e.tableNumber||""),N=y?`<img class="barcode" src="${y}" alt="Order barcode">`:`<strong>${t(e.orderNumber)}</strong>`,$=b?`<img class="zatca-qr" src="${b}" alt="ZATCA QR code"><small>رمز التحقق الضريبي</small>`:"",g=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>فاتورة ضريبية - ${P}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #17221d; font-family: Tahoma, Arial, sans-serif; }
    body { direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice { width: 100%; max-width: 186mm; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; border-bottom: 2px solid #16845b; padding-bottom: 16px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 76px; max-height: 68px; object-fit: contain; }
    .brand-name { font-size: 21px; font-weight: 700; color: #16845b; }
    .brand-info { color: #5e6a63; font-size: 10px; line-height: 1.8; }
    .invoice-title { text-align: left; }
    .invoice-title h1 { margin: 0 0 6px; color: #16845b; font-size: 24px; }
    .invoice-title p { margin: 3px 0; font-size: 11px; color: #4c5b52; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .panel { border: 1px solid #d7e3dc; border-radius: 8px; padding: 12px 14px; }
    .panel h2 { margin: 0 0 8px; font-size: 12px; color: #16845b; }
    .detail-line { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; font-size: 11px; }
    .detail-line span:last-child { font-weight: 600; text-align: left; }
    .barcode-panel { text-align: center; margin: 10px auto 16px; }
    .barcode { display: block; width: 200px; height: 62px; object-fit: contain; margin: 5px auto 0; }
    .items { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    .items thead { display: table-header-group; }
    .items th { padding: 9px 7px; background: #eaf4ee; border: 1px solid #cfddd4; color: #24563f; text-align: right; }
    .items td { padding: 9px 7px; border: 1px solid #e0e7e2; vertical-align: top; }
    .items tr { break-inside: avoid; page-break-inside: avoid; }
    .item-cell { width: 48%; font-weight: 600; }
    .item-cell small { display: block; margin-top: 3px; color: #68766d; font-size: 9px; font-weight: 400; }
    .numeric { text-align: left !important; direction: ltr; white-space: nowrap; }
    .summary { display: flex; justify-content: space-between; gap: 18px; align-items: flex-end; margin-top: 16px; }
    .summary-rows { width: 58%; }
    .summary-line { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5ebe7; font-size: 11px; }
    .summary-line.total { margin-top: 5px; padding: 10px 8px; border: 0; border-radius: 6px; background: #16845b; color: white; font-size: 16px; font-weight: 700; }
    .zatca { min-width: 130px; text-align: center; color: #536159; font-size: 10px; }
    .zatca-qr { display: block; width: 112px; height: 112px; margin: auto auto 5px; }
    .footer { border-top: 1px solid #d7e3dc; margin-top: 18px; padding-top: 10px; color: #647168; font-size: 10px; text-align: center; line-height: 1.8; }
    @media screen { body { padding: 10mm 0; } }
  </style>
</head>
<body>
  <main class="invoice">
    <header class="header">
      <div class="brand">
        <img src="/elwa-invoice-logo.png?v=4" alt="إلوة">
        <div>
          <div class="brand-name">${t(_)} · ${t(De)}</div>
          <div class="brand-info">الرقم الضريبي: ${t(n)}<br>السجل التجاري: ${t(s)}</div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>فاتورة ضريبية</h1>
        <p>رقم الفاتورة: ${P}</p>
        <p>تاريخ الإصدار: ${t(c)} ${t(o)}</p>
      </div>
    </header>

    <section class="details">
      <div class="panel">
        <h2>بيانات العميل والفرع</h2>
        <div class="detail-line"><span>العميل</span><span>${w}</span></div>
        ${p?`<div class="detail-line"><span>الهاتف</span><span>${p}</span></div>`:""}
        <div class="detail-line"><span>الفرع</span><span>${A}</span></div>
        ${C?`<div class="detail-line"><span>العنوان</span><span>${C}</span></div>`:""}
      </div>
      <div class="panel">
        <h2>بيانات العملية</h2>
        <div class="detail-line"><span>رقم الطلب</span><span>${t(e.orderNumber)}</span></div>
        <div class="detail-line"><span>طريقة الدفع</span><span>${T}</span></div>
        ${f?`<div class="detail-line"><span>الموظف</span><span>${f}</span></div>`:""}
        ${v?`<div class="detail-line"><span>الطاولة</span><span>${v}</span></div>`:""}
      </div>
    </section>

    <section class="barcode-panel">
      <span>باركود الطلب</span>
      ${N}
    </section>

    <table class="items">
      <thead><tr><th>الصنف</th><th class="numeric">الكمية</th><th class="numeric">سعر الوحدة</th><th class="numeric">الإجمالي</th></tr></thead>
      <tbody>${x||'<tr><td colspan="4">لا توجد أصناف</td></tr>'}</tbody>
    </table>

    <section class="summary">
      <div class="summary-rows">
        ${h>0?`<div class="summary-line"><span>الخصم المسجل (ضمن الإجمالي)</span><span>${h.toFixed(2)} ر.س</span></div>`:""}
        <div class="summary-line"><span>المبلغ قبل ضريبة القيمة المضافة</span><span>${a.toFixed(2)} ر.س</span></div>
        <div class="summary-line"><span>ضريبة القيمة المضافة (${(B*100).toFixed(0)}%)</span><span>${d.toFixed(2)} ر.س</span></div>
        <div class="summary-line total"><span>الإجمالي شامل الضريبة</span><span>${i.toFixed(2)} ر.س</span></div>
      </div>
      <div class="zatca">${$}</div>
    </section>

    <footer class="footer">
      <div>شكراً لزيارتكم ${t(_)}.</div>
      ${e.notes?`<div>${t(e.notes)}</div>`:""}
    </footer>
  </main>
</body>
</html>
  `;ie(g,`فاتورة ضريبية - ${e.orderNumber}`,{paperWidth:"A4"})}async function qe(e){const t=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),i=`${window.location.origin}/track/${t}`;let a="";try{a=(await L.toString(i,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"')}catch(n){console.error("Error generating order tracking QR:",n)}let d="";try{const n=document.createElement("canvas");Y(n,t,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),d=n.toDataURL("image/png")}catch(n){console.error("Error generating order barcode:",n)}const{date:r,time:l}=V(e.date),c=e.deliveryTypeAr||(e.deliveryType==="dine-in"?"في الكافيه":e.deliveryType==="delivery"?"توصيل":"استلام"),o=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>إيصال استلام - ${e.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #000; direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { max-width: 80mm; margin: 0 auto; padding: 16px; }
    .header { text-align: center; border-bottom: 3px solid #b45309; padding-bottom: 16px; margin-bottom: 16px; }
    .brand-logo { display: block; max-width: 58mm; max-height: 54px; object-fit: contain; margin: 0 auto 8px; }
    .company-name { font-size: 28px; font-weight: 700; color: #b45309; }
    .order-badge { display: inline-block; background: #fef3c7; border: 2px solid #b45309; padding: 12px 24px; border-radius: 12px; margin: 16px 0; }
    .order-number { font-size: 32px; font-weight: 700; color: #b45309; }
    .order-type { display: inline-block; background: ${e.deliveryType==="dine-in"?"#8b5cf6":e.deliveryType==="delivery"?"#10b981":"#3b82f6"}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 16px; font-weight: 600; margin-top: 8px; }
    .section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #ccc; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .items-section { background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .item-row:last-child { border-bottom: none; }
    .item-name { font-weight: 600; }
    .item-qty { background: #000; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 14px; }
    .total-section { background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 16px; }
    .total-amount { font-size: 28px; font-weight: 700; color: #b45309; }
    .qr-section { text-align: center; padding: 16px; border: 2px dashed #b45309; border-radius: 12px; background: #fffbeb; }
    .order-barcode { display: block; width: 190px; height: 58px; object-fit: contain; margin: 8px auto; }
    .qr-title { font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .qr-container img { width: 120px; height: 120px; }
    .qr-container svg { width: 120px; height: 120px; }
    .qr-note { font-size: 11px; color: #666; margin-top: 8px; }
    .footer { text-align: center; padding-top: 16px; font-size: 12px; color: #666; }
    @media print { body { margin: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <img class="brand-logo" src="/elwa-invoice-logo.png?v=4" alt="إلوة">
      <h1 class="company-name">${_}</h1>
      <p style="color: #666; font-size: 14px;">إيصال الاستلام</p>
      <div class="order-badge">
        <div class="order-number">${W(e.orderNumber)}</div>
      </div>
      ${d?`<img class="order-barcode" src="${d}" alt="باركود الطلب ${W(e.orderNumber)}">`:""}
      <div class="order-type">${c}</div>
    </div>

    <div class="section">
      <div class="info-row">
        <span>العميل:</span>
        <span style="font-weight: 600;">${e.customerName}</span>
      </div>
      <div class="info-row">
        <span>التاريخ:</span>
        <span>${r} - ${l}</span>
      </div>
      ${e.tableNumber?`
      <div class="info-row">
        <span>الطاولة:</span>
        <span style="font-weight: 700; font-size: 18px;">${e.tableNumber}</span>
      </div>
      `:""}
    </div>

    <div class="items-section">
      ${e.items.map(n=>{const s=E(n).map(m=>m.nameAr).join("، ");return`
        <div class="item-row" style="align-items:flex-start;">
          <div class="item-name" style="flex:1;">
            ${Ee(n.coffeeItem.nameAr,n.coffeeItem.nameEn)}
            ${s?`<div style="font-size:11px;color:#92400e;margin-top:2px;">+ ${s}</div>`:""}
          </div>
          <span class="item-qty">x${n.quantity}</span>
        </div>`}).join("")}
    </div>

    <div class="total-section">
      <p style="font-size: 14px; color: #92400e;">الإجمالي المدفوع</p>
      <p class="total-amount">${e.total} ر.س</p>
      <p style="font-size: 12px; color: #666; margin-top: 4px;">${e.paymentMethod}</p>
    </div>

    ${a?`
    <div class="qr-section">
      <div class="qr-title">تتبع الطلب</div>
      <div class="qr-container">${a}</div>
      <div class="qr-note">امسح الرمز لمتابعة حالة الطلب</div>
    </div>
    `:""}

    <div class="footer">
      <p style="font-weight: 600;">شكراً لزيارتكم</p>
      <p>نتمنى لكم تجربة ممتعة</p>
      <p style="margin-top: 8px;">@ELWA</p>
    </div>
  </div>
</body>
</html>
  `;ie(o,`إيصال استلام - ${e.orderNumber}`,{paperWidth:"80mm"})}async function Fe(e){let t=!1;try{const{loadPrinterSettings:i,buildEscPosKitchenTicketBitmap:a,thermalPrint:d}=await z(async()=>{const{loadPrinterSettings:l,buildEscPosKitchenTicketBitmap:c,thermalPrint:o}=await import("./thermal-printer--aFKh5K_.js");return{loadPrinterSettings:l,buildEscPosKitchenTicketBitmap:c,thermalPrint:o}},__vite__mapDeps([0,1,2,3,4,5])),r=i();if(t=r.enabled&&r.mode==="queue",r.enabled&&(r.autoPrint||r.mode==="queue")){const l=e.orderTypeName||(e.orderType==="dine_in"?"محلي":e.orderType==="takeaway"?"سفري":e.orderType==="delivery"?"توصيل":e.deliveryTypeAr||""),c=await oe(e,l,r.paperWidth,r.feedLines??4),o=await d(c,"",r.paperWidth);if(console.log("[PrintAllReceipts] Result:",o.mode,o.success),o.success&&["webusb","bluetooth","network","queue","relay"].includes(o.mode)){if((o.mode==="webusb"||o.mode==="queue")&&r.autoKitchenCopy){await new Promise(m=>setTimeout(m,1200));const n=await a({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:l||void 0,cashierName:e.employeeName,items:e.items.map(m=>({name:m.coffeeItem.nameAr,qty:m.quantity,addons:E(m).map(y=>y.nameAr)})),notes:e.notes||void 0,paperWidth:r.paperWidth}),{thermalPrint:s}=await z(async()=>{const{thermalPrint:m}=await import("./thermal-printer--aFKh5K_.js");return{thermalPrint:m}},__vite__mapDeps([0,1,2,3,4,5]));await s(n,"",r.paperWidth)}return o}if(t)return o}}catch(i){if(console.error("[PrintAllReceipts] Thermal printer error, falling back:",i),t)return{success:!1,mode:"queue",error:i instanceof Error?i.message:String(i)}}return await me(e),{success:!0,mode:"browser"}}const Be=Object.freeze(Object.defineProperty({__proto__:null,beginIOSAirPrintSession:Pe,buildEmployeeReceiptPreviewHtml:G,buildReceiptPreviewHtml:J,cancelIOSAirPrintSession:Ne,finishIOSAirPrintSession:Te,fmtOrderNum:W,isAndroidDevice:$e,openReceiptPreviewWindow:Ie,prewarmZatcaQr:ye,printA4TaxInvoice:je,printAllReceipts:Fe,printBulkEmployeeInvoices:Re,printCustomerPickupReceipt:qe,printHtmlInPage:Ae,printReceiptSection:Ce,printRefundThermal:_e,printShiftThermal:Se,printTaxInvoice:ue,printUnifiedReceipt:me},Symbol.toStringTag,{value:"Module"}));export{ue as a,Se as b,Ce as c,Fe as d,Pe as e,W as f,Te as g,Ne as h,$e as i,qe as j,je as k,xe as l,ye as m,_e as n,Ie as o,Ae as p,J as q,Be as r};
