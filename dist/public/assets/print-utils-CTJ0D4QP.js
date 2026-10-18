const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/thermal-printer-B7X3rKvM.js","assets/index-By66hAmt.js","assets/vendor-query-BqMXV_uZ.js","assets/vendor-ui-9iZ7_duB.js","assets/vendor-utils-UagjiSbi.js","assets/index-iubyTTqi.css","assets/receipt-template-C7E60-hI.js"])))=>i.map(i=>d[i]);
import{_ as C,x as fe}from"./index-By66hAmt.js";import{a as U}from"./browser-BJzWpxwN.js";import{J as ie}from"./JsBarcode-BLPKJiO0.js";import{n as ge}from"./receipt-template-C7E60-hI.js";const K=.15;function Te(){if(typeof navigator>"u")return!1;const e=navigator.userAgent||"",t=navigator.platform||"",i=/iPad|iPhone|iPod|CriOS|FxiOS|EdgiOS|OPiOS/i.test(e),s=t==="MacIntel"&&navigator.maxTouchPoints>1;return i||s}async function se(){try{const e=await fetch("/api/business-config",{credentials:"same-origin"});if(!e.ok)throw new Error(`Invoice settings request failed (${e.status})`);const t=await e.json();return ge(t?.receiptTemplate)}catch(e){return console.warn("[Receipt] Could not load saved invoice settings; keeping the current receipt layout.",e),ge(null)}}async function ce(e,t){return Promise.all(e.customCodes.filter(i=>i.enabled&&i.page===t).map(async i=>({id:i.id,label:i.label,qrDataUrl:await U.toDataURL(i.url,{width:180,margin:1,errorCorrectionLevel:"M"})})))}const F=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function he(e){return Object.entries(e.display).filter(([,t])=>!t).map(([t])=>`[data-invoice-section="${t}"]{display:none!important;}`).join("")}const X=new Map;function Pe(e){const t=typeof e.total=="number"?e.total:parseFloat(String(e.total).replace(/[^0-9.-]/g,""))||0,i=t/(1+K),s=t-i,c=e.date?new Date(e.date).toISOString():new Date().toISOString(),n=`zatca:${e.orderNumber}:${t.toFixed(2)}`;if(X.has(n))return;const r=oe({sellerName:S,vatNumber:e.vatNumber||Y,timestamp:c,totalWithVat:t.toFixed(2),vatAmount:s.toFixed(2)});U.toString(r,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"}).then(a=>{const o=a.replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"');X.set(n,o)}).catch(()=>{})}function Z(e){const t=String(e).trim(),i=t.replace(/\D/g,"");return i?`#${i.padStart(4,"0")}`:`#${t}`}function ee(e){const t=A(e.price??e.unitPrice);return t>0?t:A(e.coffeeItem.price)}function D(e){return e.selectedSize??e.customization?.selectedSize??void 0}function z(e){if(e.customization?.selectedItemAddons?.length)return e.customization.selectedItemAddons;const t=e.customization?.addons;return Array.isArray(t)&&t.length?t.map(i=>({nameAr:i.nameAr||i.name||String(i)})):[]}let R=[],M=!1,B=null;function ke(){B&&clearTimeout(B),B=setTimeout(()=>{M&&(console.warn("[Print] Watchdog: print job stuck >8s — resetting queue"),M=!1,B=null,R.length>0&&setTimeout(V,300))},8e3)}function Ne(){B&&(clearTimeout(B),B=null)}const J=typeof navigator<"u"&&/Android/i.test(navigator.userAgent),Ae=J;let W=null;function Se(){if(!Te()||typeof window>"u")return null;const e=window.open("about:blank","_blank");return e?(W={window:e,documents:[]},e.document.open(),e.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>تجهيز الطباعة</title><body style="font-family:Arial,sans-serif;padding:24px;text-align:center">جارٍ تجهيز الإيصال للطباعة…</body></html>'),e.document.close(),e):null}function le(e){const t=W;return!t||t.window.closed?!1:(t.documents.push(e),!0)}function De(e,t="إيصال إلوة"){const i=W;if(!i||i.window!==e||(W=null,e.closed||i.documents.length===0))return!1;try{const s=i.documents.map(l=>new DOMParser().parseFromString(l,"text/html")),c=s.flatMap(l=>Array.from(l.head.querySelectorAll("style")).map(d=>d.textContent||"")).join(`
`),n=s.map(l=>`<section class="airprint-page">${l.body.innerHTML}</section>`).join("");e.document.open(),e.document.write(`<!doctype html>
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
        <style>${c}</style>
      </head><body>${n}</body></html>`),e.document.close(),e.document.title=t;const r=e.document.createElement("div");r.className="airprint-controls no-print",r.setAttribute("dir","rtl");const a=e.document.createElement("span");a.textContent="الإيصال جاهز. اضغط طباعة واختر الطابعة من قائمة AirPrint.";const o=e.document.createElement("button");return o.type="button",o.textContent="طباعة",o.addEventListener("click",()=>{try{e.focus(),e.print()}catch(l){console.error("[Print] iPad AirPrint dialog could not open:",l)}}),r.append(a,o),e.document.body.prepend(r),!0}catch(s){return console.error("[Print] Could not prepare iPad AirPrint document:",s),!1}}function _e(e){W?.window===e&&(W=null);try{e&&!e.closed&&e.close()}catch{}}const Ce="'Segoe UI', Tahoma, Arial, 'Helvetica Neue', sans-serif",Q="__elwa_android_print_layer",ae="__elwa_android_print_style";async function be(e,t=4e3){const i=Array.from(e.querySelectorAll("img"));await Promise.all(i.map(s=>s.complete?Promise.resolve():new Promise(c=>{let n,r=!1;const a=()=>{r||(r=!0,n!==void 0&&window.clearTimeout(n),c())};n=window.setTimeout(a,t),s.addEventListener("load",a,{once:!0}),s.addEventListener("error",a,{once:!0})})))}function ye(e){document.getElementById(Q)?.remove(),document.getElementById(ae)?.remove();const i=(e.match(/@page\s*\{[^}]*\}/g)||[]).join(`
`),s=[];e.replace(/@page\s*\{[^}]*\}/g,"").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(l,d)=>(s.push(d.replace(/@page\s*\{[^}]*\}/g,"")),""));const n=(e.match(/<body([^>]*)>/i)||["",""])[1],r=(e.match(/<body[^>]*>([\s\S]*?)<\/body>/i)||["",""])[1],a=document.createElement("div");a.id=Q,/dir=["']?rtl/i.test(n)&&a.setAttribute("dir","rtl"),/lang=["']?ar/i.test(n)&&a.setAttribute("lang","ar"),a.innerHTML=r,a.style.cssText="display:none!important;position:absolute;top:0;left:0;z-index:-9999;",document.body.appendChild(a);const o=document.createElement("style");return o.id=ae,o.textContent=`
    /* @page outside @media so paper size applies to the print job */
    ${i}

    @media print {
      /* hide every direct child of body except our overlay */
      body > *:not(#${Q}) {
        display: none !important;
        visibility: hidden !important;
      }
      /* show the overlay as if it were the body */
      #${Q} {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        top: auto !important;
        left: auto !important;
        z-index: auto !important;
      }
      /* apply the original body-level styles to the overlay */
      ${s.join(`
`)}
    }
  `,document.head.appendChild(o),new Promise(l=>{let d=!1;const u=()=>{d||(d=!0,document.getElementById(Q)?.remove(),document.getElementById(ae)?.remove(),l())};window.addEventListener("afterprint",u,{once:!0}),be(a).then(()=>{requestAnimationFrame(()=>{setTimeout(()=>{try{window.print()}catch{u();return}setTimeout(u,500)},0)})})})}function de(e,t){return`<!DOCTYPE html><html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    @page { size: ${t} auto; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 4px; font-family: ${Ce}; direction: rtl; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    img { max-width: 100%; }
  </style>
</head>
<body>${e}</body>
</html>`}async function te(e,t,i){const s=i?e:de(e,t);if(le(s))return;if(J)return ye(s);const c=document.createElement("iframe");c.setAttribute("aria-hidden","true");const n=t==="A4"?794:t==="58mm"?220:302;c.style.cssText=`position:fixed;top:-9999px;left:-9999px;width:${n}px;height:1px;border:none;opacity:0;pointer-events:none;overflow:hidden;`,document.body.appendChild(c);const r=c.contentDocument||c.contentWindow?.document;if(!r){try{c.remove()}catch{}M=!1,setTimeout(V,300);return}r.open(),r.write(s),r.close();const a=c.contentWindow;if(!a){try{c.remove()}catch{}M=!1,setTimeout(V,300);return}return await be(r),await new Promise(o=>setTimeout(o,20)),new Promise(o=>{let l=!1;const d=()=>{l||(l=!0,setTimeout(()=>{try{c.remove()}catch{}o()},200))};a.addEventListener("afterprint",d,{once:!0}),setTimeout(d,2e3),requestAnimationFrame(()=>{setTimeout(()=>{try{a.print()}catch{d()}},0)})})}function V(){if(M||R.length===0)return;M=!0,ke();const{html:e,paperWidth:t,isFullDoc:i}=R.shift();te(e,t,i).catch(s=>console.warn("[Print] Error:",s)).finally(()=>{Ne(),M=!1,R.length>0&&setTimeout(V,80)})}function pe(e,t,i={}){const{paperWidth:s="80mm"}=i,n=/<html[\s>]/i.test(e)?e:de(e,s);return le(n)?W?.window||null:(R.push({html:n,paperWidth:s,isFullDoc:!0}),V(),null)}function ze(e,t="80mm"){const i=de(e,t);le(i)||(R.push({html:e,paperWidth:t,isFullDoc:!1}),V())}function xe(e,t="80mm"){const i=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><style>
    @page { size: ${t} auto; margin: 0; }
    html,body { margin:0; padding:0; background:#fff; }
    img { width: ${t}; display: block; margin: 0; padding: 0; }
  </style></head><body><img src="${e}" /></body></html>`;if(J){ye(i).catch(()=>{});return}const s=document.createElement("iframe");s.setAttribute("aria-hidden","true"),s.style.cssText="position:fixed;top:-9999px;left:-9999px;width:302px;height:1px;border:none;opacity:0;pointer-events:none;",document.body.appendChild(s);const c=s.contentDocument||s.contentWindow?.document;if(!c){try{s.remove()}catch{}return}c.open(),c.write(i),c.close();const n=c.querySelector("img");let r=!1;const a=()=>{r||(r=!0,setTimeout(()=>{try{s.remove()}catch{}},200))},o=()=>{s.contentWindow?.addEventListener("afterprint",a,{once:!0}),setTimeout(a,5e3),requestAnimationFrame(()=>{setTimeout(()=>{try{s.contentWindow?.print()}catch{a()}},0)})};n&&!n.complete?(n.onload=()=>setTimeout(o,100),n.onerror=()=>setTimeout(o,100)):setTimeout(o,200)}async function Ee(e,t="Elwa"){const{loadPrinterSettings:i,buildShiftReportEscPos:s,buildShiftReportCanvas:c,thermalPrint:n}=await C(async()=>{const{loadPrinterSettings:x,buildShiftReportEscPos:w,buildShiftReportCanvas:N,thermalPrint:m}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:x,buildShiftReportEscPos:w,buildShiftReportCanvas:N,thermalPrint:m}},__vite__mapDeps([0,1,2,3,4,5,6])),r=i(),a=x=>x?new Date(x).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}):"",o=x=>x?new Date(x).toLocaleDateString("ar-SA",{year:"numeric",month:"short",day:"numeric"}):"",l=e.openedAt||e.windowStart,d=e.closedAt||e.windowEnd,u=e.totalCash??e.totalCashSales??e.paymentBreakdown?.cash??0,f=e.totalCard??e.totalCardSales??(e.paymentBreakdown?.card??0)+(e.paymentBreakdown?.network??0),b=e.paymentBreakdown?.loyalty??0,h={shopName:t,reportTitle:e.reportTitle??(e.shiftNumber?"تقرير Z — إغلاق الوردية":e.isOngoing?"تقرير وردية جارية":"تقرير وردية مكتملة"),shiftNumber:e.shiftNumber,dateLabel:o(l),periodLabel:e.periodLabel,fromTime:a(l),toTime:e.isOngoing?"جارية...":a(d),cashierName:e.employeeName,totalOrders:e.totalOrders||0,totalSales:e.totalSales||0,totalCash:u,totalCard:f,totalLoyalty:b,productsByCategory:e.productsByCategory,paperWidth:r.paperWidth},g=await s(h);if(!(await n(g,"",r.paperWidth)).success){const w=(await c(h)).toDataURL("image/png");xe(w,r.paperWidth)}}async function Ie(e){const{loadPrinterSettings:t,buildRefundEscPos:i,buildRefundCanvas:s,thermalPrint:c}=await C(async()=>{const{loadPrinterSettings:o,buildRefundEscPos:l,buildRefundCanvas:d,thermalPrint:u}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:o,buildRefundEscPos:l,buildRefundCanvas:d,thermalPrint:u}},__vite__mapDeps([0,1,2,3,4,5,6])),n=t(),r={shopName:e.shopName||S,refundId:e.refundId,originalOrderNumber:e.originalOrderNumber,items:e.items,refundAmount:e.refundAmount,paymentMethod:e.paymentMethod,cashAmount:e.cashAmount,cardAmount:e.cardAmount,reason:e.reason,employeeName:e.employeeName,date:e.date,originalPaymentMethod:e.originalPaymentMethod,paperWidth:n.paperWidth};if(n.enabled&&n.mode!=="browser")try{const o=await i(r);if((await c(o,"",n.paperWidth)).success)return}catch(o){console.warn("[printRefundThermal] Hardware print failed:",o)}const a=await s(r);xe(a.toDataURL("image/png"),n.paperWidth)}const Y="312718675800003",S="إلوة",Re="Elwa",je="7025559423";function oe(e){const t=(d,u)=>{const b=new TextEncoder().encode(u),h=new Uint8Array(2+b.length);return h[0]=d,h[1]=b.length,h.set(b,2),h},i=t(1,e.sellerName),s=t(2,e.vatNumber),c=t(3,e.timestamp),n=t(4,e.totalWithVat),r=t(5,e.vatAmount),a=new Uint8Array(i.length+s.length+c.length+n.length+r.length);let o=0;a.set(i,o),o+=i.length,a.set(s,o),o+=s.length,a.set(c,o),o+=c.length,a.set(n,o),o+=n.length,a.set(r,o);let l="";return a.forEach(d=>{l+=String.fromCharCode(d)}),btoa(l)}function A(e){if(e==null)return 0;if(typeof e=="number")return e;const t=parseFloat(e.toString().replace(/[^0-9.-]/g,""));return isNaN(t)?0:t}function qe(e,t){return!t||t.trim()===""||t.trim()===e.trim()?`<span style="font-weight:600;">${e}</span>`:`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
    <span style="direction:ltr;text-align:left;font-size:10px;color:#444;flex:1;word-break:break-word;">${t}</span>
    <span style="direction:rtl;text-align:right;font-weight:600;flex:1;word-break:break-word;">${e}</span>
  </div>`}async function ve(e){await we(e,{autoPrint:!0})}async function me(e,t,i,s){const{buildReceiptBitmapEscPos:c}=await C(async()=>{const{buildReceiptBitmapEscPos:m}=await import("./thermal-printer-B7X3rKvM.js");return{buildReceiptBitmapEscPos:m}},__vite__mapDeps([0,1,2,3,4,5,6])),n=await se(),r=await ce(n,"customer"),a=A(e.total),o=a/(1+K),l=a-o,d=e.invoiceDiscount?A(e.invoiceDiscount):0,u=e.date?new Date(e.date).toISOString():new Date().toISOString(),{date:f,time:b}=G(e.date),h=oe({sellerName:S,vatNumber:e.vatNumber||Y,timestamp:u,totalWithVat:a.toFixed(2),vatAmount:l.toFixed(2)}),g=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),[v,x]=await Promise.all([(async()=>{if(!n.display.trackingBarcode)return"";try{const m=`${window.location.origin}/track/${g}`;return await U.toDataURL(m,{width:180,margin:1,errorCorrectionLevel:"M"})}catch{return""}})(),(async()=>{try{return await U.toDataURL(h,{width:140,margin:1,errorCorrectionLevel:"M"})}catch{return""}})()]);let w="";if(n.display.trackingBarcode)try{const m=document.createElement("canvas");ie(m,g,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),w=m.toDataURL("image/png")}catch(m){console.error("[Print] Could not generate order barcode:",m)}const N=(()=>{const m=(e.paymentMethod||"").toLowerCase();return m==="cash"?"نقدي":m==="apple_pay"||m==="paymob-apple-pay"||m==="neoleap-apple-pay"?"Apple Pay":m==="stc-pay"||m==="stc_pay"?"STC Pay":m==="mada"?"مدى":m==="card"||m==="network"||m==="pos"||m==="pos-network"?"شبكة":m==="loyalty"||m.includes("qirox")||m.includes("qahwa")||m==="loyalty-card"?"بطاقة ولاء":m==="geidea"||m==="paymob-card"||m==="paymob"?"بطاقة ائتمان":m==="bank_transfer"||m==="rajhi"||m==="alinma"?"تحويل بنكي":m==="split"?"نقدي + شبكة":e.paymentMethod||"غير محدد"})();return c({shopName:S,vatNumber:e.vatNumber||Y,branchName:e.branchName||void 0,orderNumber:e.orderNumber,orderDate:`${f} · ${b}`,cashierName:e.employeeName||"—",customerName:e.customerName&&e.customerName!=="عميل نقدي"?e.customerName:void 0,tableNumber:e.tableNumber,orderType:t||void 0,items:e.items.map(m=>({name:m.coffeeItem.nameAr,nameEn:m.coffeeItem.nameEn||"",qty:m.quantity,price:ee(m),addons:[...D(m)?[`الحجم: ${D(m)}`]:[],...z(m).map(_=>_.nameAr)].filter(Boolean)})),subtotal:o,vat:l,total:a,discount:d>0?d:void 0,splitPayment:e.splitPayment,paymentMethod:N,...e.cashReceived?{cashReceived:e.cashReceived}:{},logoDataUrl:"/elwa-invoice-logo.png?v=4",campaignHeaderDataUrl:n.mode==="campaign"?"/invoice-campaign-header.png":void 0,orderBarcodeDataUrl:w||void 0,trackingQrDataUrl:v||void 0,zatcaQrDataUrl:x||void 0,notes:e.notes,receiptTemplate:n,customCodes:r,paperWidth:i,feedLines:s})}async function Le(e,t="customer"){try{const{loadPrinterSettings:i,thermalPrint:s,buildEscPosKitchenTicketBitmap:c,getProfilesForRole:n,thermalPrintWithProfile:r}=await C(async()=>{const{loadPrinterSettings:o,thermalPrint:l,buildEscPosKitchenTicketBitmap:d,getProfilesForRole:u,thermalPrintWithProfile:f}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:o,thermalPrint:l,buildEscPosKitchenTicketBitmap:d,getProfilesForRole:u,thermalPrintWithProfile:f}},__vite__mapDeps([0,1,2,3,4,5,6])),a=i();if(a.enabled&&a.mode!=="browser"){const o=e.orderTypeName||e.orderType||"",l=o==="dine_in"||o==="dine-in"?"محلي":o==="takeaway"||o==="pickup"?"سفري":o==="delivery"?"توصيل":o==="car_pickup"||o==="car-pickup"?"استلام بالسيارة":o||"محلي",d=o==="car_pickup"||o==="car-pickup"?[e.carInfo?.carType,e.carInfo?.carColor||e.carColor,e.carInfo?.plateNumber||e.plateNumber?`لوحة: ${e.carInfo?.plateNumber||e.plateNumber}`:""].filter(Boolean).join(" | "):void 0,u=n("receipt"),f=n("kitchen");let b=!1;if(t==="customer"||t==="both"){const h=await me(e,l,a.paperWidth,a.feedLines??4);if(u.length>0){for(const g of u)await r(h,g);b=!0}else(await s(h,"",a.paperWidth)).success&&(b=!0)}if(t==="kitchen"||t==="both"){t==="both"&&await new Promise(g=>setTimeout(g,1200));const h=await c({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:l,cashierName:e.employeeName||"—",items:e.items.map(g=>({name:g.coffeeItem.nameAr,nameEn:g.coffeeItem.nameEn||"",qty:g.quantity,addons:[...D(g)?[`الحجم: ${D(g)}`]:[],...z(g).map(v=>v.nameAr)]})),notes:[d,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:a.paperWidth});if(f.length>0){for(const g of f)await r(h,g);b=!0}else(await s(h,"",a.paperWidth)).success&&(b=!0)}if(b)return}}catch(i){console.warn("[printReceiptSection] Thermal error, falling back to browser:",i)}if(t==="customer"||t==="both"){const i=await ne(e);R.push({html:i,paperWidth:"80mm",isFullDoc:!0})}if(t==="kitchen"||t==="both"){const i=re(e);R.push({html:i,paperWidth:"80mm",isFullDoc:!0})}V()}async function Oe(e){const t=await ne(e),i=re(e);await te(t,"80mm",!0),await new Promise(s=>setTimeout(s,300)),await te(i,"80mm",!0)}async function Fe(e){const t=`
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
  ${e.map(i=>{const s=new Date(i.createdAt),c=s.toLocaleDateString("ar-SA"),n=s.toLocaleTimeString("ar-SA");return`
    <div class="invoice-page">
      <div class="header">
        <h3>ملخص طلب موظف</h3>
        <div>رقم الطلب: ${Z(i.orderNumber)}</div>
        <div>التاريخ: ${c} ${n}</div>
      </div>
      <div class="content">
        ${(i.items||[]).map(r=>`
          <div class="row">
            <span>${r.name||r.coffeeItem?.nameAr}</span>
            <span>${r.quantity}</span>
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
  `;pe(t,"Bulk Employee Invoices",{paperWidth:"80mm"})}function G(e){try{const t=new Date(e);return isNaN(t.getTime())?{date:e,time:""}:{date:t.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"}),time:t.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}}catch{return{date:e,time:""}}}async function ne(e){const t=await se(),i=t.display,s=await ce(t,"customer"),c=he(t),n=t.mode==="campaign",r=A(e.total),a=r/(1+K),o=r-a,l=e.invoiceDiscount?A(e.invoiceDiscount):0,{date:d,time:u}=G(e.date),f=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,b=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let h="";if(t.display.trackingBarcode)try{const p=document.createElement("canvas");ie(p,b,{format:"CODE128",displayValue:!0,height:42,width:2,margin:4}),h=p.toDataURL("image/png")}catch(p){console.error("[Print] Could not generate order barcode:",p)}const g=e.orderTypeName||e.orderType||"",v=g==="dine_in"||g==="dine-in"?"محلي":g==="takeaway"||g==="pickup"?"سفري":g==="delivery"?"توصيل":g==="car_pickup"||g==="car-pickup"?"🚗 سيارة":g,x=e.date?new Date(e.date).toISOString():new Date().toISOString(),w=oe({sellerName:S,vatNumber:e.vatNumber||Y,timestamp:x,totalWithVat:r.toFixed(2),vatAmount:o.toFixed(2)}),N=`zatca:${e.orderNumber}:${r.toFixed(2)}`;let m=X.get(N)||"";if(!m)try{m=(await U.toString(w,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"'),X.set(N,m)}catch{}e.items.reduce((p,$)=>p+($.quantity||1),0),e.items.map(p=>{const $=ee(p),P=A(p.itemDiscount),E=p.quantity*$-P,L=z(p).map(H=>H.nameAr).join("، "),O=D(p),I=[O?`الحجم: ${O}`:"",L?`+ ${L}`:""].filter(Boolean).join(" · ");return`
      <div style="padding:6px 10px 0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:13px;line-height:1.7;">
          <span style="direction:ltr;flex-shrink:0;white-space:nowrap;font-weight:600;">﷼ ${E.toFixed(2)}</span>
          <span style="text-align:right;">
            ${p.coffeeItem.nameAr} &times;${p.quantity}
            ${I?`<br/><span style="font-size:11px;color:#666;">${I}</span>`:""}
            ${P>0?`<br/><span style="font-size:11px;color:#16a34a;">خصم -﷼${P.toFixed(2)}</span>`:""}
          </span>
        </div>
      </div>
      <div style="border-top:1px dashed #bbb;margin:6px 10px 0;"></div>`}).join("");const j=g==="car_pickup"||g==="car-pickup"?(()=>{const p=e.carInfo?.carType||"",$=e.carInfo?.carColor||e.carColor||"",P=e.carInfo?.plateNumber||e.plateNumber||"",E=[$,p,P?`لوحة: ${P}`:""].filter(Boolean);return E.length?`
    <div style="margin:0 10px 4px;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;padding:7px 10px;font-size:12px;font-weight:700;text-align:center;">
      🚗 ${E.join(" | ")}
    </div>`:""})():"",k=e.paymentMethod==="cash"?"نقدي":e.paymentMethod==="card"?"شبكة":e.paymentMethod==="split"?"مقسّم":e.paymentMethod==="qahwa-card"?"بطاقة إلوة":e.paymentMethod||"نقدي",q=e.paymentMethod==="cash"?"💵":e.paymentMethod==="card"?"💳":e.paymentMethod==="split"?"⇄":e.paymentMethod==="qahwa-card"?"🎴":"💵";e.loyaltyPoints&&`${e.loyaltyPoints}`;const T=n?'<img class="campaign-art" src="/invoice-campaign-header.png" alt="بالغوا بالدفاع عن وطنكم">':t.display.logo?`<div data-invoice-section="logo" style="text-align:center;padding:6px 0 10px;">
          <img src="/elwa-invoice-logo.png?v=4" alt="إلوة" style="width:110px;height:auto;max-height:56px;object-fit:contain;display:block;margin:0 auto;">
        </div>`:"",y=s.map(p=>`
    <div style="text-align:center;margin:8px 0;">
      <div style="font-weight:bold;font-size:12px;">${F(p.label)}</div>
      <img src="${p.qrDataUrl}" alt="" style="width:100px;height:100px;">
    </div>`).join("");return`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',Tahoma,Arial,sans-serif;direction:rtl;background:#d6d6d6;display:flex;justify-content:center;align-items:flex-start;padding:24px 10px;min-height:100vh;color:#000;}
.paper{background:#fff;width:302px;padding:12px 12px 10px;box-shadow:0 2px 8px rgba(0,0,0,.18),0 8px 32px rgba(0,0,0,.12);}
.campaign-art{display:block;width:calc(100% + 24px);max-width:none;height:auto;margin:-12px -12px 0;}
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
${c}
@media print{
  @page{size:80mm auto;margin:0;}
  body{background:#fff!important;padding:0!important;display:block!important;}
  .paper{width:80mm!important;box-shadow:none!important;}
}
</style></head><body><div class="paper">

  <!-- ══ رأس الفاتورة ══ -->
  <div class="header">
    ${n?"":'<div class="label">إيصال العميل (فاتورة ضريبية)</div>'}
    ${T}
    ${n?"":`<div class="website" data-invoice-section="poweredBy">${fe.website}</div>`}
    ${i.legalInfo?`<div class="head-line" data-invoice-section="legalInfo">الرقم الضريبي: ${e.vatNumber||Y}</div>`:""}
    ${i.orderNumber?`<div class="order-line" data-invoice-section="orderNumber">رقم الطلب: #${f}</div>`:""}
    ${h?`<div class="order-barcode" data-invoice-section="trackingBarcode"><img src="${h}" alt="باركود الطلب"></div>`:""}
    ${i.date?`<div class="head-line" data-invoice-section="date" style="direction:ltr;">${d} ${u}</div>`:""}
  </div>

  <!-- ══ بيانات الطلب ══ -->
  <div class="info-block">
    ${i.orderType?`<div data-invoice-section="orderType">${v?`نوع الطلب: ${v}`:""}</div>`:""}
    ${i.branchInfo&&e.branchName?`<div data-invoice-section="branchInfo">${F(e.branchName)}</div>`:""}
    ${e.tableNumber?`<div data-invoice-section="orderType">طاولة: ${e.tableNumber}</div>`:""}
    ${i.cashier&&e.employeeName?`<div data-invoice-section="cashier">الموظف: ${e.employeeName}</div>`:""}
  </div>

  <!-- ══ الأصناف ══ -->
  ${t.display.items?e.items.map(p=>{const $=ee(p),P=A(p.itemDiscount),E=p.quantity*$-P,L=z(p).map(H=>H.nameAr).join("، "),O=D(p),I=[O?`الحجم: ${O}`:"",L?`+ ${L}`:""].filter(Boolean).join(" · ");return`<div class="item-row" data-invoice-section="items">
      <div class="item-name">
        ${p.coffeeItem.nameAr} &times;${p.quantity}
        ${I?`<div class="item-extra">${I}</div>`:""}
        ${P>0?`<div class="item-disc">خصم -﷼${P.toFixed(2)}</div>`:""}
      </div>
      <div class="item-price">${E.toFixed(2)}</div>
    </div>`}).join(""):""}

  <!-- ══ الحساب ══ -->
  <div class="totals">
    ${t.display.totals?`<div data-invoice-section="totals" class="row"><span>المجموع (غير شامل الضريبة):</span><span>${a.toFixed(2)} ر.س</span></div>
    <div data-invoice-section="totals" class="row"><span>ضريبة القيمة المضافة (15%):</span><span>${o.toFixed(2)} ر.س</span></div>
    ${l>0?`<div data-invoice-section="totals" class="row" style="color:#16a34a;"><span>الخصم:</span><span>-${l.toFixed(2)} ر.س</span></div>`:""}
    <div data-invoice-section="totals" class="row total"><span>الإجمالي شامل الضريبة:</span><span>${r.toFixed(2)} ر.س</span></div>`:""}
    ${t.display.payment?`<div data-invoice-section="payment" class="row" style="margin-top:5px;font-size:11px;"><span>طريقة الدفع:</span><span>${q} ${k}</span></div>`:""}
    ${t.display.payment&&e.splitPayment?`
    <div data-invoice-section="payment" class="split-row row">${e.splitPayment.cash>0?`<span>نقدي: ${e.splitPayment.cash.toFixed(2)}</span>`:"<span></span>"}${e.splitPayment.card>0?`<span>شبكة: ${e.splitPayment.card.toFixed(2)}</span>`:""}</div>`:""}
    ${t.display.payment&&e.cashReceived&&e.cashReceived>0&&!e.splitPayment?`
    <div data-invoice-section="payment" class="change-box">
      <div class="change-row"><span>المبلغ المستلم:</span><span>${e.cashReceived.toFixed(2)} ر.س</span></div>
      <div class="change-row" style="font-weight:900;font-size:13px;margin-top:2px;"><span>الباقي للعميل:</span><span>${Math.max(0,e.cashReceived-r).toFixed(2)} ر.س</span></div>
    </div>`:""}
  </div>

  <!-- ══ بيانات السيارة ══ -->
  ${j}

  <!-- ══ ملاحظات ══ -->
  ${t.display.notes&&e.notes?`<div data-invoice-section="notes" class="notes-box"><strong>ملاحظات:</strong> ${F(e.notes)}</div>`:""}

  <!-- ══ كود QR ZATCA ══ -->
  ${m?`<div class="qr-container">${m}<div style="font-size:10px;margin-top:4px;">امسح للتحقق من الفاتورة</div></div>`:""}
  ${y}

  <!-- ══ نقاط الولاء ══ -->
  ${e.loyaltyPoints?`<div class="loyalty-box">⭐ +${e.loyaltyPoints} نقطة أضيفت لرصيدك</div>`:""}

  <!-- ══ التذييل ══ -->
  <div class="footer">
    <div data-invoice-section="poweredBy" style="font-weight:bold;margin-bottom:4px;">${fe.website}</div>
    ${t.display.thankYou?'<span data-invoice-section="thankYou">شكراً لزيارتكم!</span>':""}
  </div>

</div></body></html>`}function re(e){const{date:t,time:i}=G(e.date),s=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,c=e.orderTypeName||e.orderType||"",n=c==="dine_in"||c==="dine-in"?e.tableNumber?`محلي — طاولة رقم ${e.tableNumber}`:"محلي":c==="takeaway"||c==="pickup"?"سفري":c==="delivery"?"توصيل":c==="car_pickup"||c==="car-pickup"?"استلام بالسيارة":c,r=e.items.map(u=>{const f=z(u).map(h=>h.nameAr).join(" &bull; "),b=D(u);return`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start;">
        <div style="flex:1;padding-left:8px;">
          <div style="font-size:17px;font-weight:600;">${u.coffeeItem.nameAr}</div>
          ${b?`<div style="font-size:13px;color:#2563eb;margin-top:3px;">الحجم: ${b}</div>`:""}
          ${f?`<div style="font-size:13px;color:#555;margin-top:3px;">+ ${f}</div>`:""}
        </div>
        <div style="font-size:26px;font-weight:bold;border:2px solid #000;padding:2px 10px;border-radius:4px;flex-shrink:0;">x${u.quantity}</div>
      </div>`}).join(""),a=e.carInfo?.carType||"",o=e.carInfo?.carColor||e.carColor||"",l=e.carInfo?.plateNumber||e.plateNumber||"",d=[o,a,l?`لوحة: ${l}`:""].filter(Boolean);return`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
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
    <div class="order-num">#${s}</div>
    ${n?`<div style="font-size:13px;font-weight:700;color:#333;">${n}</div>`:""}
    ${e.tableNumber&&!(c==="dine_in"||c==="dine-in")?`<div class="table-badge">طاولة: ${e.tableNumber}</div>`:""}
    <div class="emp-line">الموظف: ${e.employeeName||"—"} &nbsp;|&nbsp; ${i} — ${t}</div>
  </div>

  <!-- ══ الأصناف ══ -->
  <div class="items">${r}</div>

  <!-- ══ بيانات السيارة ══ -->
  ${d.length?`<div class="car-box">🚗 ${d.join(" | ")}</div>`:""}

  <!-- ══ ملاحظات ══ -->
  ${e.notes?`
  <div class="notes-box">
    <div style="font-weight:900;color:#92400e;margin-bottom:4px;">⚠ ملاحظات العميل:</div>
    <div style="font-weight:700;">${e.notes}</div>
  </div>`:""}

  <div class="footer-note">يرجى التحقق من الأصناف قبل التسليم</div>

</div></body></html>`}async function we(e,t={}){const i=t.autoPrint!==void 0?t.autoPrint:!0;if(i)try{const{loadPrinterSettings:r,buildEscPosKitchenTicketBitmap:a,thermalPrint:o}=await C(async()=>{const{loadPrinterSettings:d,buildEscPosKitchenTicketBitmap:u,thermalPrint:f}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:d,buildEscPosKitchenTicketBitmap:u,thermalPrint:f}},__vite__mapDeps([0,1,2,3,4,5,6])),l=r();if(l.enabled&&l.mode!=="browser"){const d=e.orderTypeName||e.orderType||"",u=d==="dine_in"||d==="dine-in"?"محلي":d==="takeaway"||d==="pickup"?"سفري":d==="delivery"?"توصيل":d==="car_pickup"||d==="car-pickup"?"استلام بالسيارة":d||"محلي",f=e.carInfo?.carType||"",b=e.carInfo?.carColor||e.carColor||"",h=e.carInfo?.plateNumber||e.plateNumber||"",g=d==="car_pickup"||d==="car-pickup"?[f,b,h?`لوحة: ${h}`:""].filter(Boolean).join(" | "):void 0,v=await me(e,u,l.paperWidth,l.feedLines??4),x=Math.max(1,Math.min(5,l.customerCopies||1)),w=Math.max(1,Math.min(5,l.kitchenCopies||1)),{getProfilesForRole:N,thermalPrintWithProfile:m}=await C(async()=>{const{getProfilesForRole:T,thermalPrintWithProfile:y}=await import("./thermal-printer-B7X3rKvM.js");return{getProfilesForRole:T,thermalPrintWithProfile:y}},__vite__mapDeps([0,1,2,3,4,5,6])),_=N("receipt"),j=N("kitchen");let k={success:!1,mode:"error",error:""};if(_.length>0){for(const T of _)for(let y=0;y<x;y++)y>0&&await new Promise(p=>setTimeout(p,1200)),k=await m(v,T);k.success=!0}else{k=await o(v,"",l.paperWidth);for(let T=1;T<x&&k.success;T++)await new Promise(y=>setTimeout(y,1200)),k=await o(v,"",l.paperWidth)}if(k.success||_.length>0){if(l.autoKitchenCopy||j.length>0){const T=await a({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:u,cashierName:e.employeeName||"—",items:e.items.map(y=>({name:y.coffeeItem.nameAr,nameEn:y.coffeeItem.nameEn||"",qty:y.quantity,addons:[...D(y)?[`الحجم: ${D(y)}`]:[],...z(y).map(p=>p.nameAr)]})),notes:[g,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:l.paperWidth});if(await new Promise(y=>setTimeout(y,1200)),j.length>0)for(const y of j)for(let p=0;p<w;p++)p>0&&await new Promise($=>setTimeout($,1200)),await m(T,y);else if(l.autoKitchenCopy)for(let y=0;y<w;y++)y>0&&await new Promise(p=>setTimeout(p,1400)),await o(T,"",l.paperWidth)}return}const q=k.error||"فشلت الطباعة الحرارية";console.error("[PrintTaxInvoice] Hardware print failed — mode:",l.mode,"— error:",q),typeof window<"u"&&window.__qiroxPrintError!==void 0?window.__qiroxPrintError(q):window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:q,mode:l.mode}}));return}}catch(r){if(console.warn("[PrintTaxInvoice] Thermal print error:",r),window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:r?.message||"فشل الاتصال بالطابعة — تحقق من إعدادات الطابعة الحرارية",mode:"thermal"}})),J)return}Z(e.orderNumber);const s=await ne(e),c=re(e),n=r=>te(r,"80mm",!0);if(i){if(J){window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:"يرجى ضبط الطابعة الحرارية في إعدادات الطباعة",mode:"browser"}}));return}const{loadPrinterSettings:r}=await C(async()=>{const{loadPrinterSettings:d}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:d}},__vite__mapDeps([0,1,2,3,4,5,6])),a=r(),o=Math.max(1,Math.min(5,a.customerCopies||1)),l=a.autoKitchenCopy?Math.max(1,Math.min(5,a.kitchenCopies||1)):0;for(let d=0;d<o;d++)d>0&&await new Promise(u=>setTimeout(u,150)),await n(s);for(let d=0;d<l;d++)await new Promise(u=>setTimeout(u,150)),await n(c)}else await n(s),await new Promise(r=>setTimeout(r,300)),await n(c)}async function Be(e){const t=p=>String(p??"").replace(/[&<>"']/g,$=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[$]),i=A(e.total),s=i/(1+K),c=i-s,n=e.date?new Date(e.date):new Date,r=Number.isNaN(n.getTime())?new Date().toISOString():n.toISOString(),{date:a,time:o}=G(e.date),l=e.vatNumber||Y,d=e.crNumber||je,u=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let f="",b="";try{const p=document.createElement("canvas");ie(p,u,{format:"CODE128",displayValue:!0,height:48,width:2,margin:4}),f=p.toDataURL("image/png")}catch(p){console.error("[Print] Could not generate order barcode:",p)}try{const p=oe({sellerName:S,vatNumber:l,timestamp:r,totalWithVat:i.toFixed(2),vatAmount:c.toFixed(2)});b=await U.toDataURL(p,{width:150,margin:1,errorCorrectionLevel:"M"})}catch(p){console.error("[Print] Could not generate ZATCA QR:",p)}const h=e.items.map(p=>{const $=Math.max(1,Number(p.quantity)||1),P=ee(p),E=A(p.itemDiscount),L=Math.max(0,P*$-E),O=t(p.coffeeItem?.nameAr||p.coffeeItem?.nameEn||"منتج"),I=D(p),H=z(p).map($e=>t($e.nameAr)).filter(Boolean).join("، "),ue=[I?`الحجم: ${t(I)}`:"",H?`الإضافات: ${H}`:""].filter(Boolean).join(" · ");return`
      <tr>
        <td class="item-cell">${O}${ue?`<small>${ue}</small>`:""}</td>
        <td class="numeric">${$}</td>
        <td class="numeric">${P.toFixed(2)} ر.س</td>
        <td class="numeric">${L.toFixed(2)} ر.س</td>
      </tr>
    `}).join(""),g=A(e.invoiceDiscount??e.discount?.amount),v=t(e.invoiceNumber||e.orderNumber),x=t(e.customerName||"عميل نقدي"),w=t(e.customerPhone),N=t(e.branchName||S),m=t(e.branchAddress||""),_=t(e.employeeName),j=t(e.paymentMethod),k=t(e.tableNumber||""),q=f?`<img class="barcode" src="${f}" alt="Order barcode">`:`<strong>${t(e.orderNumber)}</strong>`,T=b?`<img class="zatca-qr" src="${b}" alt="ZATCA QR code"><small>رمز التحقق الضريبي</small>`:"",y=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>فاتورة ضريبية - ${v}</title>
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
          <div class="brand-name">${t(S)} · ${t(Re)}</div>
          <div class="brand-info">الرقم الضريبي: ${t(l)}<br>السجل التجاري: ${t(d)}</div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>فاتورة ضريبية</h1>
        <p>رقم الفاتورة: ${v}</p>
        <p>تاريخ الإصدار: ${t(a)} ${t(o)}</p>
      </div>
    </header>

    <section class="details">
      <div class="panel">
        <h2>بيانات العميل والفرع</h2>
        <div class="detail-line"><span>العميل</span><span>${x}</span></div>
        ${w?`<div class="detail-line"><span>الهاتف</span><span>${w}</span></div>`:""}
        <div class="detail-line"><span>الفرع</span><span>${N}</span></div>
        ${m?`<div class="detail-line"><span>العنوان</span><span>${m}</span></div>`:""}
      </div>
      <div class="panel">
        <h2>بيانات العملية</h2>
        <div class="detail-line"><span>رقم الطلب</span><span>${t(e.orderNumber)}</span></div>
        <div class="detail-line"><span>طريقة الدفع</span><span>${j}</span></div>
        ${_?`<div class="detail-line"><span>الموظف</span><span>${_}</span></div>`:""}
        ${k?`<div class="detail-line"><span>الطاولة</span><span>${k}</span></div>`:""}
      </div>
    </section>

    <section class="barcode-panel">
      <span>باركود الطلب</span>
      ${q}
    </section>

    <table class="items">
      <thead><tr><th>الصنف</th><th class="numeric">الكمية</th><th class="numeric">سعر الوحدة</th><th class="numeric">الإجمالي</th></tr></thead>
      <tbody>${h||'<tr><td colspan="4">لا توجد أصناف</td></tr>'}</tbody>
    </table>

    <section class="summary">
      <div class="summary-rows">
        ${g>0?`<div class="summary-line"><span>الخصم المسجل (ضمن الإجمالي)</span><span>${g.toFixed(2)} ر.س</span></div>`:""}
        <div class="summary-line"><span>المبلغ قبل ضريبة القيمة المضافة</span><span>${s.toFixed(2)} ر.س</span></div>
        <div class="summary-line"><span>ضريبة القيمة المضافة (${(K*100).toFixed(0)}%)</span><span>${c.toFixed(2)} ر.س</span></div>
        <div class="summary-line total"><span>الإجمالي شامل الضريبة</span><span>${i.toFixed(2)} ر.س</span></div>
      </div>
      <div class="zatca">${T}</div>
    </section>

    <footer class="footer">
      <div>شكراً لزيارتكم ${t(S)}.</div>
      ${e.notes?`<div>${t(e.notes)}</div>`:""}
    </footer>
  </main>
</body>
</html>
  `;pe(y,`فاتورة ضريبية - ${e.orderNumber}`,{paperWidth:"A4"})}async function Me(e){const t=await se(),i=await ce(t,"customer"),s=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),c=`${window.location.origin}/track/${s}`;let n="";if(t.display.trackingBarcode)try{n=(await U.toString(c,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"')}catch(f){console.error("Error generating order tracking QR:",f)}let r="";if(t.display.trackingBarcode)try{const f=document.createElement("canvas");ie(f,s,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),r=f.toDataURL("image/png")}catch(f){console.error("Error generating order barcode:",f)}const{date:a,time:o}=G(e.date),l=e.deliveryTypeAr||(e.deliveryType==="dine-in"?"في الكافيه":e.deliveryType==="delivery"?"توصيل":"استلام"),d=i.map(f=>`
    <div style="text-align:center;margin:8px 0;">
      <div style="font-weight:bold;font-size:12px;">${F(f.label)}</div>
      <img src="${f.qrDataUrl}" alt="" style="width:100px;height:100px;">
    </div>`).join(""),u=`
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
    .campaign-art { display:block; width:calc(100% + 32px); max-width:none; height:auto; margin:-16px -16px 0; }
    .campaign-order { margin:0 0 16px!important; }
    ${he(t)}
    @media print { body { margin: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${t.mode==="campaign"?'<img class="campaign-art" src="/invoice-campaign-header.png" alt="بالغوا بالدفاع عن وطنكم">':`${t.display.logo?'<img data-invoice-section="logo" class="brand-logo" src="/elwa-invoice-logo.png?v=4" alt="إلوة">':""}
           ${t.display.businessDetails?`<h1 data-invoice-section="businessDetails" class="company-name">${S}</h1>`:""}
           <p style="color: #666; font-size: 14px;">إيصال الاستلام</p>`}
      ${t.display.orderNumber?`<div class="order-badge ${t.mode==="campaign"?"campaign-order":""}" data-invoice-section="orderNumber">
        <div class="order-number">${Z(e.orderNumber)}</div>
      </div>`:""}
      ${r?`<img data-invoice-section="trackingBarcode" class="order-barcode" src="${r}" alt="باركود الطلب ${Z(e.orderNumber)}">`:""}
      <div data-invoice-section="orderType" class="order-type">${l}</div>
    </div>

    <div class="section">
      ${t.display.customer?`<div class="info-row" data-invoice-section="customer">
        <span>العميل:</span>
        <span style="font-weight: 600;">${F(e.customerName)}</span>
      </div>`:""}
      ${t.display.date?`<div class="info-row" data-invoice-section="date">
        <span>التاريخ:</span>
        <span>${a} - ${o}</span>
      </div>`:""}
      ${e.tableNumber?`
      <div class="info-row" data-invoice-section="orderType">
        <span>الطاولة:</span>
        <span style="font-weight: 700; font-size: 18px;">${F(e.tableNumber)}</span>
      </div>
      `:""}
    </div>

    ${t.display.items?`<div class="items-section" data-invoice-section="items">
      ${e.items.map(f=>{const b=z(f).map(h=>h.nameAr).join("، ");return`
        <div class="item-row" style="align-items:flex-start;">
          <div class="item-name" style="flex:1;">
            ${qe(f.coffeeItem.nameAr,f.coffeeItem.nameEn)}
            ${b?`<div style="font-size:11px;color:#92400e;margin-top:2px;">+ ${b}</div>`:""}
          </div>
          <span class="item-qty">x${f.quantity}</span>
        </div>`}).join("")}
    </div>`:""}

    ${t.display.totals?`<div class="total-section" data-invoice-section="totals">
      <p style="font-size: 14px; color: #92400e;">الإجمالي المدفوع</p>
      <p class="total-amount">${e.total} ر.س</p>
      ${t.display.payment?`<p data-invoice-section="payment" style="font-size: 12px; color: #666; margin-top: 4px;">${F(e.paymentMethod)}</p>`:""}
    </div>`:""}

    ${n?`
    <div class="qr-section" data-invoice-section="trackingBarcode">
      <div class="qr-title">تتبع الطلب</div>
      <div class="qr-container">${n}</div>
      <div class="qr-note">امسح الرمز لمتابعة حالة الطلب</div>
    </div>
    `:""}
    ${d}

    <div class="footer">
      ${t.display.thankYou?`<p data-invoice-section="thankYou" style="font-weight: 600;">شكراً لزيارتكم</p>
      <p data-invoice-section="thankYou">نتمنى لكم تجربة ممتعة</p>`:""}
      ${t.display.poweredBy?'<p data-invoice-section="poweredBy" style="margin-top: 8px;">@ELWA</p>':""}
    </div>
  </div>
</body>
</html>
  `;pe(u,`إيصال استلام - ${e.orderNumber}`,{paperWidth:"80mm"})}async function Ue(e){let t=!1;try{const{loadPrinterSettings:i,buildEscPosKitchenTicketBitmap:s,thermalPrint:c}=await C(async()=>{const{loadPrinterSettings:r,buildEscPosKitchenTicketBitmap:a,thermalPrint:o}=await import("./thermal-printer-B7X3rKvM.js");return{loadPrinterSettings:r,buildEscPosKitchenTicketBitmap:a,thermalPrint:o}},__vite__mapDeps([0,1,2,3,4,5,6])),n=i();if(t=n.enabled&&n.mode==="queue",n.enabled&&(n.autoPrint||n.mode==="queue")){const r=e.orderTypeName||(e.orderType==="dine_in"?"محلي":e.orderType==="takeaway"?"سفري":e.orderType==="delivery"?"توصيل":e.deliveryTypeAr||""),a=await me(e,r,n.paperWidth,n.feedLines??4),o=await c(a,"",n.paperWidth);if(console.log("[PrintAllReceipts] Result:",o.mode,o.success),o.success&&["webusb","bluetooth","network","queue","relay"].includes(o.mode)){if((o.mode==="webusb"||o.mode==="queue")&&n.autoKitchenCopy){await new Promise(u=>setTimeout(u,1200));const l=await s({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:r||void 0,cashierName:e.employeeName,items:e.items.map(u=>({name:u.coffeeItem.nameAr,qty:u.quantity,addons:z(u).map(f=>f.nameAr)})),notes:e.notes||void 0,paperWidth:n.paperWidth}),{thermalPrint:d}=await C(async()=>{const{thermalPrint:u}=await import("./thermal-printer-B7X3rKvM.js");return{thermalPrint:u}},__vite__mapDeps([0,1,2,3,4,5,6]));await d(l,"",n.paperWidth)}return o}if(t)return o}}catch(i){if(console.error("[PrintAllReceipts] Thermal printer error, falling back:",i),t)return{success:!1,mode:"queue",error:i instanceof Error?i.message:String(i)}}return await ve(e),{success:!0,mode:"browser"}}const Qe=Object.freeze(Object.defineProperty({__proto__:null,beginIOSAirPrintSession:Se,buildEmployeeReceiptPreviewHtml:re,buildReceiptPreviewHtml:ne,cancelIOSAirPrintSession:_e,finishIOSAirPrintSession:De,fmtOrderNum:Z,isAndroidDevice:Ae,openReceiptPreviewWindow:Oe,prewarmZatcaQr:Pe,printA4TaxInvoice:Be,printAllReceipts:Ue,printBulkEmployeeInvoices:Fe,printCustomerPickupReceipt:Me,printHtmlInPage:ze,printReceiptSection:Le,printRefundThermal:Ie,printShiftThermal:Ee,printTaxInvoice:we,printUnifiedReceipt:ve},Symbol.toStringTag,{value:"Module"}));export{Ee as a,we as b,Le as c,Ue as d,Se as e,Z as f,De as g,_e as h,Ae as i,Me as j,Be as k,Te as l,Pe as m,Ie as n,Oe as o,ze as p,ne as q,Qe as r};
