const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/thermal-printer-DNC3WoIX.js","assets/index-CrPXIBCw.js","assets/vendor-query-BqMXV_uZ.js","assets/vendor-ui-9iZ7_duB.js","assets/vendor-utils-UagjiSbi.js","assets/index-re13ISy5.css","assets/receipt-template-C5GZF-BR.js"])))=>i.map(i=>d[i]);
import{_ as R,x as ye}from"./index-CrPXIBCw.js";import{a as O}from"./browser-BJzWpxwN.js";import{J as re}from"./JsBarcode-BLPKJiO0.js";import{n as ve}from"./receipt-template-C5GZF-BR.js";const J=.15;function Se(){if(typeof navigator>"u")return!1;const e=navigator.userAgent||"",t=navigator.platform||"",i=/iPad|iPhone|iPod|CriOS|FxiOS|EdgiOS|OPiOS/i.test(e),r=t==="MacIntel"&&navigator.maxTouchPoints>1;return i||r}async function ae(){try{const e=await fetch("/api/business-config",{credentials:"same-origin"});if(!e.ok)throw new Error(`Invoice settings request failed (${e.status})`);const t=await e.json();return{template:ve(t.receiptTemplate),business:t}}catch(e){return console.warn("[Receipt] Could not load saved invoice settings; using safe receipt defaults.",e),{template:ve(null),business:{}}}}async function ge(e,t){return Promise.all(e.customCodes.filter(i=>i.enabled&&i.page===t).map(async i=>({id:i.id,label:i.label,qrDataUrl:await O.toDataURL(i.url,{width:180,margin:1,errorCorrectionLevel:"M"})})))}const A=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function we(e){return Object.entries(e.display).filter(([,t])=>!t).map(([t])=>`[data-invoice-section="${t}"]{display:none!important;}`).join("")}const ie=new Map;function De(e){const t=String(e.vatNumber||ee).trim();if(!t)return;const i=typeof e.total=="number"?e.total:parseFloat(String(e.total).replace(/[^0-9.-]/g,""))||0,r=i/(1+J),l=i-r,s=e.date?new Date(e.date).toISOString():new Date().toISOString(),a=e.sellerName||Y,o=`zatca:${e.orderNumber}:${i.toFixed(2)}:${t}:${a}`;if(ie.has(o))return;const n=ce({sellerName:a,vatNumber:t,timestamp:s,totalWithVat:i.toFixed(2),vatAmount:l.toFixed(2)});O.toString(n,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"}).then(d=>{const c=d.replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"');ie.set(o,c)}).catch(()=>{})}function G(e){const t=String(e).trim(),i=t.replace(/\D/g,"");return i?`#${i.padStart(4,"0")}`:`#${t}`}function oe(e){const t=C(e.price??e.unitPrice);return t>0?t:C(e.coffeeItem.price)}function E(e){return e.selectedSize??e.customization?.selectedSize??void 0}function q(e){if(e.customization?.selectedItemAddons?.length)return e.customization.selectedItemAddons;const t=e.customization?.addons;return Array.isArray(t)&&t.length?t.map(i=>({nameAr:i.nameAr||i.name||String(i)})):[]}let F=[],W=!1,U=null;function ze(){U&&clearTimeout(U),U=setTimeout(()=>{W&&(console.warn("[Print] Watchdog: print job stuck >8s — resetting queue"),W=!1,U=null,F.length>0&&setTimeout(H,300))},8e3)}function _e(){U&&(clearTimeout(U),U=null)}const X=typeof navigator<"u"&&/Android/i.test(navigator.userAgent),Ce=X;let V=null;function Ee(){if(!Se()||typeof window>"u")return null;const e=window.open("about:blank","_blank");return e?(V={window:e,documents:[]},e.document.open(),e.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>تجهيز الطباعة</title><body style="font-family:Arial,sans-serif;padding:24px;text-align:center">جارٍ تجهيز الإيصال للطباعة…</body></html>'),e.document.close(),e):null}function fe(e){const t=V;return!t||t.window.closed?!1:(t.documents.push(e),!0)}function Ie(e,t="إيصال إلوة"){const i=V;if(!i||i.window!==e||(V=null,e.closed||i.documents.length===0))return!1;try{const r=i.documents.map(d=>new DOMParser().parseFromString(d,"text/html")),l=r.flatMap(d=>Array.from(d.head.querySelectorAll("style")).map(c=>c.textContent||"")).join(`
`),s=r.map(d=>`<section class="airprint-page">${d.body.innerHTML}</section>`).join("");e.document.open(),e.document.write(`<!doctype html>
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
        <style>${l}</style>
      </head><body>${s}</body></html>`),e.document.close(),e.document.title=t;const a=e.document.createElement("div");a.className="airprint-controls no-print",a.setAttribute("dir","rtl");const o=e.document.createElement("span");o.textContent="الإيصال جاهز. اضغط طباعة واختر الطابعة من قائمة AirPrint.";const n=e.document.createElement("button");return n.type="button",n.textContent="طباعة",n.addEventListener("click",()=>{try{e.focus(),e.print()}catch(d){console.error("[Print] iPad AirPrint dialog could not open:",d)}}),a.append(o,n),e.document.body.prepend(a),!0}catch(r){return console.error("[Print] Could not prepare iPad AirPrint document:",r),!1}}function Re(e){V?.window===e&&(V=null);try{e&&!e.closed&&e.close()}catch{}}const qe="'Segoe UI', Tahoma, Arial, 'Helvetica Neue', sans-serif",Z="__elwa_android_print_layer",ue="__elwa_android_print_style";async function $e(e,t=4e3){const i=Array.from(e.querySelectorAll("img"));await Promise.all(i.map(r=>r.complete?Promise.resolve():new Promise(l=>{let s,a=!1;const o=()=>{a||(a=!0,s!==void 0&&window.clearTimeout(s),l())};s=window.setTimeout(o,t),r.addEventListener("load",o,{once:!0}),r.addEventListener("error",o,{once:!0})})))}function Ne(e){document.getElementById(Z)?.remove(),document.getElementById(ue)?.remove();const i=(e.match(/@page\s*\{[^}]*\}/g)||[]).join(`
`),r=[];e.replace(/@page\s*\{[^}]*\}/g,"").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(d,c)=>(r.push(c.replace(/@page\s*\{[^}]*\}/g,"")),""));const s=(e.match(/<body([^>]*)>/i)||["",""])[1],a=(e.match(/<body[^>]*>([\s\S]*?)<\/body>/i)||["",""])[1],o=document.createElement("div");o.id=Z,/dir=["']?rtl/i.test(s)&&o.setAttribute("dir","rtl"),/lang=["']?ar/i.test(s)&&o.setAttribute("lang","ar"),o.innerHTML=a,o.style.cssText="display:none!important;position:absolute;top:0;left:0;z-index:-9999;",document.body.appendChild(o);const n=document.createElement("style");return n.id=ue,n.textContent=`
    /* @page outside @media so paper size applies to the print job */
    ${i}

    @media print {
      /* hide every direct child of body except our overlay */
      body > *:not(#${Z}) {
        display: none !important;
        visibility: hidden !important;
      }
      /* show the overlay as if it were the body */
      #${Z} {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        top: auto !important;
        left: auto !important;
        z-index: auto !important;
      }
      /* apply the original body-level styles to the overlay */
      ${r.join(`
`)}
    }
  `,document.head.appendChild(n),new Promise(d=>{let c=!1;const m=()=>{c||(c=!0,document.getElementById(Z)?.remove(),document.getElementById(ue)?.remove(),d())};window.addEventListener("afterprint",m,{once:!0}),$e(o).then(()=>{requestAnimationFrame(()=>{setTimeout(()=>{try{window.print()}catch{m();return}setTimeout(m,500)},0)})})})}function he(e,t){return`<!DOCTYPE html><html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    @page { size: ${t} auto; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 4px; font-family: ${qe}; direction: rtl; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    img { max-width: 100%; }
  </style>
</head>
<body>${e}</body>
</html>`}async function ne(e,t,i){const r=i?e:he(e,t);if(fe(r))return;if(X)return Ne(r);const l=document.createElement("iframe");l.setAttribute("aria-hidden","true");const s=t==="A4"?794:t==="58mm"?220:302;l.style.cssText=`position:fixed;top:-9999px;left:-9999px;width:${s}px;height:1px;border:none;opacity:0;pointer-events:none;overflow:hidden;`,document.body.appendChild(l);const a=l.contentDocument||l.contentWindow?.document;if(!a){try{l.remove()}catch{}W=!1,setTimeout(H,300);return}a.open(),a.write(r),a.close();const o=l.contentWindow;if(!o){try{l.remove()}catch{}W=!1,setTimeout(H,300);return}return await $e(a),await new Promise(n=>setTimeout(n,20)),new Promise(n=>{let d=!1;const c=()=>{d||(d=!0,setTimeout(()=>{try{l.remove()}catch{}n()},200))};o.addEventListener("afterprint",c,{once:!0}),setTimeout(c,2e3),requestAnimationFrame(()=>{setTimeout(()=>{try{o.print()}catch{c()}},0)})})}function H(){if(W||F.length===0)return;W=!0,ze();const{html:e,paperWidth:t,isFullDoc:i}=F.shift();ne(e,t,i).catch(r=>console.warn("[Print] Error:",r)).finally(()=>{_e(),W=!1,F.length>0&&setTimeout(H,80)})}function be(e,t,i={}){const{paperWidth:r="80mm"}=i,s=/<html[\s>]/i.test(e)?e:he(e,r);return fe(s)?V?.window||null:(F.push({html:s,paperWidth:r,isFullDoc:!0}),H(),null)}function je(e,t="80mm"){const i=he(e,t);fe(i)||(F.push({html:e,paperWidth:t,isFullDoc:!1}),H())}function Te(e,t="80mm"){const i=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><style>
    @page { size: ${t} auto; margin: 0; }
    html,body { margin:0; padding:0; background:#fff; }
    img { width: ${t}; display: block; margin: 0; padding: 0; }
  </style></head><body><img src="${e}" /></body></html>`;if(X){Ne(i).catch(()=>{});return}const r=document.createElement("iframe");r.setAttribute("aria-hidden","true"),r.style.cssText="position:fixed;top:-9999px;left:-9999px;width:302px;height:1px;border:none;opacity:0;pointer-events:none;",document.body.appendChild(r);const l=r.contentDocument||r.contentWindow?.document;if(!l){try{r.remove()}catch{}return}l.open(),l.write(i),l.close();const s=l.querySelector("img");let a=!1;const o=()=>{a||(a=!0,setTimeout(()=>{try{r.remove()}catch{}},200))},n=()=>{r.contentWindow?.addEventListener("afterprint",o,{once:!0}),setTimeout(o,5e3),requestAnimationFrame(()=>{setTimeout(()=>{try{r.contentWindow?.print()}catch{o()}},0)})};s&&!s.complete?(s.onload=()=>setTimeout(n,100),s.onerror=()=>setTimeout(n,100)):setTimeout(n,200)}async function Be(e,t="Elwa"){const{loadPrinterSettings:i,buildShiftReportEscPos:r,buildShiftReportCanvas:l,thermalPrint:s}=await R(async()=>{const{loadPrinterSettings:v,buildShiftReportEscPos:T,buildShiftReportCanvas:w,thermalPrint:S}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:v,buildShiftReportEscPos:T,buildShiftReportCanvas:w,thermalPrint:S}},__vite__mapDeps([0,1,2,3,4,5,6])),a=i(),o=v=>v?new Date(v).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}):"",n=v=>v?new Date(v).toLocaleDateString("ar-SA",{year:"numeric",month:"short",day:"numeric"}):"",d=e.openedAt||e.windowStart,c=e.closedAt||e.windowEnd,m=e.totalCash??e.totalCashSales??e.paymentBreakdown?.cash??0,h=e.totalCard??e.totalCardSales??(e.paymentBreakdown?.card??0)+(e.paymentBreakdown?.network??0),b=e.paymentBreakdown?.loyalty??0,f={shopName:t,reportTitle:e.reportTitle??(e.shiftNumber?"تقرير Z — إغلاق الوردية":e.isOngoing?"تقرير وردية جارية":"تقرير وردية مكتملة"),shiftNumber:e.shiftNumber,dateLabel:n(d),periodLabel:e.periodLabel,fromTime:o(d),toTime:e.isOngoing?"جارية...":o(c),cashierName:e.employeeName,totalOrders:e.totalOrders||0,totalSales:e.totalSales||0,totalCash:m,totalCard:h,totalLoyalty:b,productsByCategory:e.productsByCategory,paperWidth:a.paperWidth},x=await r(f);if(!(await s(x,"",a.paperWidth)).success){const T=(await l(f)).toDataURL("image/png");Te(T,a.paperWidth)}}async function Le(e){const{loadPrinterSettings:t,buildRefundEscPos:i,buildRefundCanvas:r,thermalPrint:l}=await R(async()=>{const{loadPrinterSettings:n,buildRefundEscPos:d,buildRefundCanvas:c,thermalPrint:m}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:n,buildRefundEscPos:d,buildRefundCanvas:c,thermalPrint:m}},__vite__mapDeps([0,1,2,3,4,5,6])),s=t(),a={shopName:e.shopName||Y,refundId:e.refundId,originalOrderNumber:e.originalOrderNumber,items:e.items,refundAmount:e.refundAmount,paymentMethod:e.paymentMethod,cashAmount:e.cashAmount,cardAmount:e.cardAmount,reason:e.reason,employeeName:e.employeeName,date:e.date,originalPaymentMethod:e.originalPaymentMethod,paperWidth:s.paperWidth};if(s.enabled&&s.mode!=="browser")try{const n=await i(a);if((await l(n,"",s.paperWidth)).success)return}catch(n){console.warn("[printRefundThermal] Hardware print failed:",n)}const o=await r(a);Te(o.toDataURL("image/png"),s.paperWidth)}const ee="312718675800003",Y="إلوة",Fe="Elwa",se="4030534754";function ce(e){const t=(c,m)=>{const b=new TextEncoder().encode(m),f=new Uint8Array(2+b.length);return f[0]=c,f[1]=b.length,f.set(b,2),f},i=t(1,e.sellerName),r=t(2,e.vatNumber),l=t(3,e.timestamp),s=t(4,e.totalWithVat),a=t(5,e.vatAmount),o=new Uint8Array(i.length+r.length+l.length+s.length+a.length);let n=0;o.set(i,n),n+=i.length,o.set(r,n),n+=r.length,o.set(l,n),n+=l.length,o.set(s,n),n+=s.length,o.set(a,n);let d="";return o.forEach(c=>{d+=String.fromCharCode(c)}),btoa(d)}function C(e){if(e==null)return 0;if(typeof e=="number")return e;const t=parseFloat(e.toString().replace(/[^0-9.-]/g,""));return isNaN(t)?0:t}function Oe(e,t){return!t||t.trim()===""||t.trim()===e.trim()?`<span style="font-weight:600;">${e}</span>`:`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
    <span style="direction:ltr;text-align:left;font-size:10px;color:#444;flex:1;word-break:break-word;">${t}</span>
    <span style="direction:rtl;text-align:right;font-weight:600;flex:1;word-break:break-word;">${e}</span>
  </div>`}async function Pe(e){await ke(e,{autoPrint:!0})}async function xe(e,t,i,r){const{buildReceiptBitmapEscPos:l}=await R(async()=>{const{buildReceiptBitmapEscPos:p}=await import("./thermal-printer-DNC3WoIX.js");return{buildReceiptBitmapEscPos:p}},__vite__mapDeps([0,1,2,3,4,5,6])),{template:s,business:a}=await ae(),o=await ge(s,"customer"),n=a.tradeNameAr||Y,d=e.vatNumber||a.vatNumber||ee,c=e.crNumber||a.commercialRegistration||a.crNumber||se,m=C(e.total),h=m/(1+J),b=m-h,f=e.invoiceDiscount?C(e.invoiceDiscount):0,x=e.date?new Date(e.date).toISOString():new Date().toISOString(),{date:g,time:v}=te(e.date),T=ce({sellerName:n,vatNumber:d,timestamp:x,totalWithVat:m.toFixed(2),vatAmount:b.toFixed(2)}),w=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),[S,I]=await Promise.all([(async()=>{if(!s.display.trackingBarcode)return"";try{const p=`${window.location.origin}/track/${w}`;return await O.toDataURL(p,{width:180,margin:1,errorCorrectionLevel:"M"})}catch{return""}})(),(async()=>{try{return T?await O.toDataURL(T,{width:140,margin:1,errorCorrectionLevel:"M"}):""}catch{return""}})()]);let z="";if(s.display.orderBarcode)try{const p=document.createElement("canvas");re(p,w,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),z=p.toDataURL("image/png")}catch(p){console.error("[Print] Could not generate order barcode:",p)}const P=(()=>{const p=(e.paymentMethod||"").toLowerCase();return p==="cash"?"نقدي":p==="apple_pay"||p==="paymob-apple-pay"||p==="neoleap-apple-pay"?"Apple Pay":p==="stc-pay"||p==="stc_pay"?"STC Pay":p==="mada"?"مدى":p==="card"||p==="network"||p==="pos"||p==="pos-network"?"شبكة":p==="loyalty"||p.includes("qirox")||p.includes("qahwa")||p==="loyalty-card"?"بطاقة ولاء":p==="geidea"||p==="paymob-card"||p==="paymob"?"بطاقة ائتمان":p==="bank_transfer"||p==="rajhi"||p==="alinma"?"تحويل بنكي":p==="split"?"نقدي + شبكة":e.paymentMethod||"غير محدد"})();return l({shopName:n,vatNumber:d,commercialRegistration:c,branchName:e.branchName||void 0,orderNumber:e.orderNumber,orderDate:`${g} · ${v}`,cashierName:e.employeeName||"—",customerName:e.customerName&&e.customerName!=="عميل نقدي"?e.customerName:void 0,tableNumber:e.tableNumber,orderType:t||void 0,items:e.items.map(p=>({name:p.coffeeItem.nameAr,nameEn:p.coffeeItem.nameEn||"",qty:p.quantity,price:oe(p),addons:[...E(p)?[`الحجم: ${E(p)}`]:[],...q(p).map(N=>N.nameAr)].filter(Boolean)})),subtotal:h,vat:b,total:m,discount:f>0?f:void 0,splitPayment:e.splitPayment,paymentMethod:P,...e.cashReceived?{cashReceived:e.cashReceived}:{},logoDataUrl:"/elwa-invoice-logo.png?v=4",campaignHeaderDataUrl:s.mode==="campaign"?"/invoice-campaign-header.png":void 0,orderBarcodeDataUrl:z||void 0,trackingQrDataUrl:S||void 0,zatcaQrDataUrl:I||void 0,notes:e.notes,receiptTemplate:s,customCodes:o,paperWidth:i,feedLines:r})}async function Me(e,t="customer"){try{const{loadPrinterSettings:i,thermalPrint:r,buildEscPosKitchenTicketBitmap:l,getProfilesForRole:s,thermalPrintWithProfile:a}=await R(async()=>{const{loadPrinterSettings:n,thermalPrint:d,buildEscPosKitchenTicketBitmap:c,getProfilesForRole:m,thermalPrintWithProfile:h}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:n,thermalPrint:d,buildEscPosKitchenTicketBitmap:c,getProfilesForRole:m,thermalPrintWithProfile:h}},__vite__mapDeps([0,1,2,3,4,5,6])),o=i();if(o.enabled&&o.mode!=="browser"){const n=e.orderTypeName||e.orderType||"",d=n==="dine_in"||n==="dine-in"?"محلي":n==="takeaway"||n==="pickup"?"سفري":n==="delivery"?"توصيل":n==="car_pickup"||n==="car-pickup"?"استلام بالسيارة":n||"محلي",c=n==="car_pickup"||n==="car-pickup"?[e.carInfo?.carType,e.carInfo?.carColor||e.carColor,e.carInfo?.plateNumber||e.plateNumber?`لوحة: ${e.carInfo?.plateNumber||e.plateNumber}`:""].filter(Boolean).join(" | "):void 0,m=s("receipt"),h=s("kitchen");let b=!1;if(t==="customer"||t==="both"){const f=await xe(e,d,o.paperWidth,o.feedLines??4);if(m.length>0){for(const x of m)await a(f,x);b=!0}else(await r(f,"",o.paperWidth)).success&&(b=!0)}if(t==="kitchen"||t==="both"){t==="both"&&await new Promise(x=>setTimeout(x,1200));const f=await l({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:d,cashierName:e.employeeName||"—",items:e.items.map(x=>({name:x.coffeeItem.nameAr,nameEn:x.coffeeItem.nameEn||"",qty:x.quantity,addons:[...E(x)?[`الحجم: ${E(x)}`]:[],...q(x).map(g=>g.nameAr)]})),notes:[c,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:o.paperWidth});if(h.length>0){for(const x of h)await a(f,x);b=!0}else(await r(f,"",o.paperWidth)).success&&(b=!0)}if(b)return}}catch(i){console.warn("[printReceiptSection] Thermal error, falling back to browser:",i)}if(t==="customer"||t==="both"){const i=await de(e);F.push({html:i,paperWidth:"80mm",isFullDoc:!0})}if(t==="kitchen"||t==="both"){const i=le(e);F.push({html:i,paperWidth:"80mm",isFullDoc:!0})}H()}async function Ue(e){const t=await de(e),i=le(e);await ne(t,"80mm",!0),await new Promise(r=>setTimeout(r,300)),await ne(i,"80mm",!0)}async function We(e){const t=`
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
  ${e.map(i=>{const r=new Date(i.createdAt),l=r.toLocaleDateString("ar-SA"),s=r.toLocaleTimeString("ar-SA");return`
    <div class="invoice-page">
      <div class="header">
        <h3>ملخص طلب موظف</h3>
        <div>رقم الطلب: ${G(i.orderNumber)}</div>
        <div>التاريخ: ${l} ${s}</div>
      </div>
      <div class="content">
        ${(i.items||[]).map(a=>`
          <div class="row">
            <span>${a.name||a.coffeeItem?.nameAr}</span>
            <span>${a.quantity}</span>
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
  `;be(t,"Bulk Employee Invoices",{paperWidth:"80mm"})}function te(e){try{const t=new Date(e);return isNaN(t.getTime())?{date:e,time:""}:{date:t.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"}),time:t.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}}catch{return{date:e,time:""}}}async function de(e){const{template:t,business:i}=await ae(),r=t.display,l=await ge(t,"customer"),s=we(t),a=t.mode==="campaign",o=i.tradeNameAr||Y,n=e.vatNumber||i.vatNumber||ee,d=e.crNumber||i.commercialRegistration||i.crNumber||se,c=C(e.total),m=c/(1+J),h=c-m,b=e.invoiceDiscount?C(e.invoiceDiscount):0,{date:f,time:x}=te(e.date),g=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,v=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let T="";if(t.display.orderBarcode)try{const u=document.createElement("canvas");re(u,v,{format:"CODE128",displayValue:!0,height:42,width:2,margin:4}),T=u.toDataURL("image/png")}catch(u){console.error("[Print] Could not generate order barcode:",u)}const w=e.orderTypeName||e.orderType||"",S=w==="dine_in"||w==="dine-in"?"محلي":w==="takeaway"||w==="pickup"?"سفري":w==="delivery"?"توصيل":w==="car_pickup"||w==="car-pickup"?"🚗 سيارة":w,I=e.date?new Date(e.date).toISOString():new Date().toISOString(),z=ce({sellerName:o,vatNumber:n,timestamp:I,totalWithVat:c.toFixed(2),vatAmount:h.toFixed(2)}),P=`zatca:${e.orderNumber}:${c.toFixed(2)}:${n}:${o}`;let p=ie.get(P)||"";if(!p)try{p=(await O.toString(z,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"'),ie.set(P,p)}catch{}let N="";if(r.trackingBarcode)try{const u=`${window.location.origin}/track/${encodeURIComponent(v)}`;N=(await O.toString(u,{type:"svg",width:88,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="88"').replace(/height="\d+"/,'height="88"')}catch{}e.items.reduce((u,_)=>u+(_.quantity||1),0),e.items.map(u=>{const _=oe(u),D=C(u.itemDiscount),j=u.quantity*_-D,M=q(u).map(Q=>Q.nameAr).join("، "),B=E(u),L=[B?`الحجم: ${B}`:"",M?`+ ${M}`:""].filter(Boolean).join(" · ");return`
      <div style="padding:6px 10px 0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:13px;line-height:1.7;">
          <span style="direction:ltr;flex-shrink:0;white-space:nowrap;font-weight:600;">﷼ ${j.toFixed(2)}</span>
          <span style="text-align:right;">
            ${u.coffeeItem.nameAr} &times;${u.quantity}
            ${L?`<br/><span style="font-size:11px;color:#666;">${L}</span>`:""}
            ${D>0?`<br/><span style="font-size:11px;color:#16a34a;">خصم -﷼${D.toFixed(2)}</span>`:""}
          </span>
        </div>
      </div>
      <div style="border-top:1px dashed #bbb;margin:6px 10px 0;"></div>`}).join("");const k=w==="car_pickup"||w==="car-pickup"?(()=>{const u=e.carInfo?.carType||"",_=e.carInfo?.carColor||e.carColor||"",D=e.carInfo?.plateNumber||e.plateNumber||"",j=[_,u,D?`لوحة: ${D}`:""].filter(Boolean);return j.length?`
    <div style="margin:0 10px 4px;background:#fef9c3;border:1px solid #fbbf24;border-radius:6px;padding:7px 10px;font-size:12px;font-weight:700;text-align:center;">
      🚗 ${j.join(" | ")}
    </div>`:""})():"",K=e.paymentMethod==="cash"?"نقدي":e.paymentMethod==="card"?"شبكة":e.paymentMethod==="split"?"مقسّم":e.paymentMethod==="qahwa-card"?"بطاقة إلوة":e.paymentMethod||"نقدي",pe=e.paymentMethod==="cash"?"💵":e.paymentMethod==="card"?"💳":e.paymentMethod==="split"?"⇄":e.paymentMethod==="qahwa-card"?"🎴":"💵";e.loyaltyPoints&&`${e.loyaltyPoints}`;const me=a?'<img class="campaign-art" src="/invoice-campaign-header.png" alt="بالغوا بالدفاع عن وطنكم">':t.display.logo?`<div data-invoice-section="logo" style="text-align:center;padding:6px 0 10px;">
          <img src="/elwa-invoice-logo.png?v=4" alt="إلوة" style="width:110px;height:auto;max-height:56px;object-fit:contain;display:block;margin:0 auto;">
        </div>`:"",$=l.map(u=>`
    <div style="text-align:center;margin:8px 0;">
      <div style="font-weight:bold;font-size:12px;">${A(u.label)}</div>
      <img src="${u.qrDataUrl}" alt="" style="width:100px;height:100px;">
    </div>`).join("");return`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',Tahoma,Arial,sans-serif;direction:rtl;background:#d6d6d6;display:flex;justify-content:center;align-items:flex-start;padding:24px 10px;min-height:100vh;color:#000;}
.paper{background:#fff;width:302px;padding:12px 12px 10px;box-shadow:0 2px 8px rgba(0,0,0,.18),0 8px 32px rgba(0,0,0,.12);}
 .campaign-art{display:block;width:calc(100% + 24px);max-width:none;height:auto;margin:-12px -12px 0;}
 .campaign-order{display:block;clear:both;position:relative;z-index:1;background:#fff;font-size:18px;font-weight:900;margin:8px 0 10px;padding:8px 0;border-top:1px dashed #999;border-bottom:1px dashed #999;}
 .business-name{font-size:14px;font-weight:900;margin:4px 0;}
 .legal-info{font-size:11px;line-height:1.7;color:#444;}
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
${s}
@media print{
  @page{size:80mm auto;margin:0;}
  body{background:#fff!important;padding:0!important;display:block!important;}
  .paper{width:80mm!important;box-shadow:none!important;}
}
</style></head><body><div class="paper">

  <!-- ══ رأس الفاتورة ══ -->
  <div class="header">
    ${a?"":'<div class="label">إيصال العميل (فاتورة ضريبية)</div>'}
    ${me}
    ${a&&r.orderNumber?`<div class="campaign-order" data-invoice-section="orderNumber">رقم الطلب: #${g}</div>`:""}
    ${!a&&r.orderNumber?`<div class="order-line" data-invoice-section="orderNumber">رقم الطلب: #${g}</div>`:""}
    ${r.businessDetails?`<div class="business-name" data-invoice-section="businessDetails">${A(o)}</div>`:""}
    ${r.legalInfo?`<div class="legal-info" data-invoice-section="legalInfo"><div>الرقم الضريبي: ${A(n)}</div><div>السجل التجاري: ${A(d)}</div></div>`:""}
    ${a?"":`<div class="website" data-invoice-section="poweredBy">${ye.website}</div>`}
    ${r.orderBarcode&&T?`<div class="order-barcode" data-invoice-section="orderBarcode"><img src="${T}" alt="باركود الطلب"></div>`:""}
    ${r.date?`<div class="head-line" data-invoice-section="date" style="direction:ltr;">${f} ${x}</div>`:""}
  </div>

  <!-- ══ بيانات الطلب ══ -->
  <div class="info-block">
    ${r.orderType?`<div data-invoice-section="orderType">${S?`نوع الطلب: ${S}`:""}</div>`:""}
  ${r.branchInfo&&(e.branchName||i.address)?`<div data-invoice-section="branchInfo">${A(e.branchName||i.address)}</div>`:""}
    ${e.tableNumber?`<div data-invoice-section="orderType">طاولة: ${e.tableNumber}</div>`:""}
    ${r.cashier&&e.employeeName?`<div data-invoice-section="cashier">الموظف: ${e.employeeName}</div>`:""}
  </div>

  <!-- ══ الأصناف ══ -->
  ${t.display.items?e.items.map(u=>{const _=oe(u),D=C(u.itemDiscount),j=u.quantity*_-D,M=q(u).map(Q=>Q.nameAr).join("، "),B=E(u),L=[B?`الحجم: ${B}`:"",M?`+ ${M}`:""].filter(Boolean).join(" · ");return`<div class="item-row" data-invoice-section="items">
      <div class="item-name">
        ${u.coffeeItem.nameAr} &times;${u.quantity}
        ${L?`<div class="item-extra">${L}</div>`:""}
        ${D>0?`<div class="item-disc">خصم -﷼${D.toFixed(2)}</div>`:""}
      </div>
      <div class="item-price">${j.toFixed(2)}</div>
    </div>`}).join(""):""}

  <!-- ══ الحساب ══ -->
  <div class="totals">
    ${t.display.totals?`<div data-invoice-section="totals" class="row"><span>المجموع (غير شامل الضريبة):</span><span>${m.toFixed(2)} ر.س</span></div>
    <div data-invoice-section="totals" class="row"><span>ضريبة القيمة المضافة (15%):</span><span>${h.toFixed(2)} ر.س</span></div>
    ${b>0?`<div data-invoice-section="totals" class="row" style="color:#16a34a;"><span>الخصم:</span><span>-${b.toFixed(2)} ر.س</span></div>`:""}
    <div data-invoice-section="totals" class="row total"><span>الإجمالي شامل الضريبة:</span><span>${c.toFixed(2)} ر.س</span></div>`:""}
    ${t.display.payment?`<div data-invoice-section="payment" class="row" style="margin-top:5px;font-size:11px;"><span>طريقة الدفع:</span><span>${pe} ${K}</span></div>`:""}
    ${t.display.payment&&e.splitPayment?`
    <div data-invoice-section="payment" class="split-row row">${e.splitPayment.cash>0?`<span>نقدي: ${e.splitPayment.cash.toFixed(2)}</span>`:"<span></span>"}${e.splitPayment.card>0?`<span>شبكة: ${e.splitPayment.card.toFixed(2)}</span>`:""}</div>`:""}
    ${t.display.payment&&e.cashReceived&&e.cashReceived>0&&!e.splitPayment?`
    <div data-invoice-section="payment" class="change-box">
      <div class="change-row"><span>المبلغ المستلم:</span><span>${e.cashReceived.toFixed(2)} ر.س</span></div>
      <div class="change-row" style="font-weight:900;font-size:13px;margin-top:2px;"><span>الباقي للعميل:</span><span>${Math.max(0,e.cashReceived-c).toFixed(2)} ر.س</span></div>
    </div>`:""}
  </div>

  <!-- ══ بيانات السيارة ══ -->
  ${k}

  <!-- ══ ملاحظات ══ -->
  ${t.display.notes&&e.notes?`<div data-invoice-section="notes" class="notes-box"><strong>ملاحظات:</strong> ${A(e.notes)}</div>`:""}

  <!-- ══ كود QR ZATCA ══ -->
  ${N?`<div class="qr-container" data-invoice-section="trackingBarcode">${N}<div style="font-size:10px;margin-top:4px;">امسح لمتابعة حالة الطلب</div></div>`:""}
  ${p?`<div class="qr-container">${p}<div style="font-size:10px;margin-top:4px;">امسح للتحقق من الفاتورة</div></div>`:""}
  ${$}

  <!-- ══ نقاط الولاء ══ -->
  ${e.loyaltyPoints?`<div class="loyalty-box">⭐ +${e.loyaltyPoints} نقطة أضيفت لرصيدك</div>`:""}

  <!-- ══ التذييل ══ -->
  <div class="footer">
    <div data-invoice-section="poweredBy" style="font-weight:bold;margin-bottom:4px;">${ye.website}</div>
    ${t.display.thankYou?'<span data-invoice-section="thankYou">شكراً لزيارتكم!</span>':""}
  </div>

</div></body></html>`}function le(e){const{date:t,time:i}=te(e.date),r=String(e.orderNumber).replace(/\D/g,"").padStart(4,"0")||e.orderNumber,l=e.orderTypeName||e.orderType||"",s=l==="dine_in"||l==="dine-in"?e.tableNumber?`محلي — طاولة رقم ${e.tableNumber}`:"محلي":l==="takeaway"||l==="pickup"?"سفري":l==="delivery"?"توصيل":l==="car_pickup"||l==="car-pickup"?"استلام بالسيارة":l,a=e.items.map(m=>{const h=q(m).map(f=>f.nameAr).join(" &bull; "),b=E(m);return`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start;">
        <div style="flex:1;padding-left:8px;">
          <div style="font-size:17px;font-weight:600;">${m.coffeeItem.nameAr}</div>
          ${b?`<div style="font-size:13px;color:#2563eb;margin-top:3px;">الحجم: ${b}</div>`:""}
          ${h?`<div style="font-size:13px;color:#555;margin-top:3px;">+ ${h}</div>`:""}
        </div>
        <div style="font-size:26px;font-weight:bold;border:2px solid #000;padding:2px 10px;border-radius:4px;flex-shrink:0;">x${m.quantity}</div>
      </div>`}).join(""),o=e.carInfo?.carType||"",n=e.carInfo?.carColor||e.carColor||"",d=e.carInfo?.plateNumber||e.plateNumber||"",c=[n,o,d?`لوحة: ${d}`:""].filter(Boolean);return`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
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
    <div class="order-num">#${r}</div>
    ${s?`<div style="font-size:13px;font-weight:700;color:#333;">${s}</div>`:""}
    ${e.tableNumber&&!(l==="dine_in"||l==="dine-in")?`<div class="table-badge">طاولة: ${e.tableNumber}</div>`:""}
    <div class="emp-line">الموظف: ${e.employeeName||"—"} &nbsp;|&nbsp; ${i} — ${t}</div>
  </div>

  <!-- ══ الأصناف ══ -->
  <div class="items">${a}</div>

  <!-- ══ بيانات السيارة ══ -->
  ${c.length?`<div class="car-box">🚗 ${c.join(" | ")}</div>`:""}

  <!-- ══ ملاحظات ══ -->
  ${e.notes?`
  <div class="notes-box">
    <div style="font-weight:900;color:#92400e;margin-bottom:4px;">⚠ ملاحظات العميل:</div>
    <div style="font-weight:700;">${e.notes}</div>
  </div>`:""}

  <div class="footer-note">يرجى التحقق من الأصناف قبل التسليم</div>

</div></body></html>`}async function ke(e,t={}){const i=t.autoPrint!==void 0?t.autoPrint:!0;if(i)try{const{loadPrinterSettings:a,buildEscPosKitchenTicketBitmap:o,thermalPrint:n}=await R(async()=>{const{loadPrinterSettings:c,buildEscPosKitchenTicketBitmap:m,thermalPrint:h}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:c,buildEscPosKitchenTicketBitmap:m,thermalPrint:h}},__vite__mapDeps([0,1,2,3,4,5,6])),d=a();if(d.enabled&&d.mode!=="browser"){const c=e.orderTypeName||e.orderType||"",m=c==="dine_in"||c==="dine-in"?"محلي":c==="takeaway"||c==="pickup"?"سفري":c==="delivery"?"توصيل":c==="car_pickup"||c==="car-pickup"?"استلام بالسيارة":c||"محلي",h=e.carInfo?.carType||"",b=e.carInfo?.carColor||e.carColor||"",f=e.carInfo?.plateNumber||e.plateNumber||"",x=c==="car_pickup"||c==="car-pickup"?[h,b,f?`لوحة: ${f}`:""].filter(Boolean).join(" | "):void 0,g=await xe(e,m,d.paperWidth,d.feedLines??4),v=Math.max(1,Math.min(5,d.customerCopies||1)),T=Math.max(1,Math.min(5,d.kitchenCopies||1)),{getProfilesForRole:w,thermalPrintWithProfile:S}=await R(async()=>{const{getProfilesForRole:N,thermalPrintWithProfile:y}=await import("./thermal-printer-DNC3WoIX.js");return{getProfilesForRole:N,thermalPrintWithProfile:y}},__vite__mapDeps([0,1,2,3,4,5,6])),I=w("receipt"),z=w("kitchen");let P={success:!1,mode:"error",error:""};if(I.length>0){for(const N of I)for(let y=0;y<v;y++)y>0&&await new Promise(k=>setTimeout(k,1200)),P=await S(g,N);P.success=!0}else{P=await n(g,"",d.paperWidth);for(let N=1;N<v&&P.success;N++)await new Promise(y=>setTimeout(y,1200)),P=await n(g,"",d.paperWidth)}if(P.success||I.length>0){if(d.autoKitchenCopy||z.length>0){const N=await o({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:m,cashierName:e.employeeName||"—",items:e.items.map(y=>({name:y.coffeeItem.nameAr,nameEn:y.coffeeItem.nameEn||"",qty:y.quantity,addons:[...E(y)?[`الحجم: ${E(y)}`]:[],...q(y).map(k=>k.nameAr)]})),notes:[x,e.notes].filter(Boolean).join(" | ")||void 0,paperWidth:d.paperWidth});if(await new Promise(y=>setTimeout(y,1200)),z.length>0)for(const y of z)for(let k=0;k<T;k++)k>0&&await new Promise(K=>setTimeout(K,1200)),await S(N,y);else if(d.autoKitchenCopy)for(let y=0;y<T;y++)y>0&&await new Promise(k=>setTimeout(k,1400)),await n(N,"",d.paperWidth)}return}const p=P.error||"فشلت الطباعة الحرارية";console.error("[PrintTaxInvoice] Hardware print failed — mode:",d.mode,"— error:",p),typeof window<"u"&&window.__qiroxPrintError!==void 0?window.__qiroxPrintError(p):window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:p,mode:d.mode}}));return}}catch(a){if(console.warn("[PrintTaxInvoice] Thermal print error:",a),window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:a?.message||"فشل الاتصال بالطابعة — تحقق من إعدادات الطابعة الحرارية",mode:"thermal"}})),X)return}G(e.orderNumber);const r=await de(e),l=le(e),s=a=>ne(a,"80mm",!0);if(i){if(X){window.dispatchEvent(new CustomEvent("qirox:print-error",{detail:{error:"يرجى ضبط الطابعة الحرارية في إعدادات الطباعة",mode:"browser"}}));return}const{loadPrinterSettings:a}=await R(async()=>{const{loadPrinterSettings:c}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:c}},__vite__mapDeps([0,1,2,3,4,5,6])),o=a(),n=Math.max(1,Math.min(5,o.customerCopies||1)),d=o.autoKitchenCopy?Math.max(1,Math.min(5,o.kitchenCopies||1)):0;for(let c=0;c<n;c++)c>0&&await new Promise(m=>setTimeout(m,150)),await s(r);for(let c=0;c<d;c++)await new Promise(m=>setTimeout(m,150)),await s(l)}else await s(r),await new Promise(a=>setTimeout(a,300)),await s(l)}async function Ve(e){const{template:t,business:i}=await ae(),r=i.tradeNameAr||Y,l=i.tradeNameEn||Fe,s=e.vatNumber||i.vatNumber||ee,a=e.crNumber||i.commercialRegistration||i.crNumber||se,o=$=>String($??"").replace(/[&<>"']/g,u=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[u]),n=C(e.total),d=n/(1+J),c=n-d,m=e.date?new Date(e.date):new Date,h=Number.isNaN(m.getTime())?new Date().toISOString():m.toISOString(),{date:b,time:f}=te(e.date),x=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber);let g="",v="";if(t.display.orderBarcode)try{const $=document.createElement("canvas");re($,x,{format:"CODE128",displayValue:!0,height:48,width:2,margin:4}),g=$.toDataURL("image/png")}catch($){console.error("[Print] Could not generate order barcode:",$)}try{const $=ce({sellerName:r,vatNumber:s,timestamp:h,totalWithVat:n.toFixed(2),vatAmount:c.toFixed(2)});v=await O.toDataURL($,{width:150,margin:1,errorCorrectionLevel:"M"})}catch($){console.error("[Print] Could not generate ZATCA QR:",$)}const T=e.items.map($=>{const u=Math.max(1,Number($.quantity)||1),_=oe($),D=C($.itemDiscount),j=Math.max(0,_*u-D),M=o($.coffeeItem?.nameAr||$.coffeeItem?.nameEn||"منتج"),B=E($),L=q($).map(Ae=>o(Ae.nameAr)).filter(Boolean).join("، "),Q=[B?`الحجم: ${o(B)}`:"",L?`الإضافات: ${L}`:""].filter(Boolean).join(" · ");return`
      <tr>
        <td class="item-cell">${M}${Q?`<small>${Q}</small>`:""}</td>
        <td class="numeric">${u}</td>
        <td class="numeric">${_.toFixed(2)} ر.س</td>
        <td class="numeric">${j.toFixed(2)} ر.س</td>
      </tr>
    `}).join(""),w=C(e.invoiceDiscount??e.discount?.amount),S=o(e.invoiceNumber||e.orderNumber),I=o(e.customerName||"عميل نقدي"),z=o(e.customerPhone),P=o(e.branchName||r),p=o(e.branchAddress||i.address||""),N=o(e.employeeName),y=o(e.paymentMethod),k=o(e.tableNumber||""),K=t.display.orderBarcode&&g?`<section class="barcode-panel" data-invoice-section="orderBarcode">
        <span>باركود الطلب</span>
        <img class="barcode" src="${g}" alt="باركود الطلب">
      </section>`:"",pe=v?`<img class="zatca-qr" src="${v}" alt="ZATCA QR code"><small>رمز التحقق الضريبي</small>`:"",me=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>فاتورة ضريبية - ${S}</title>
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
        ${t.display.logo?'<img src="/elwa-invoice-logo.png?v=4" alt="إلوة">':""}
        <div>
          ${t.display.businessDetails?`<div class="brand-name" data-invoice-section="businessDetails">${o(r)} · ${o(l)}</div>`:""}
          ${t.display.legalInfo?`<div class="brand-info" data-invoice-section="legalInfo">الرقم الضريبي: ${o(s)}<br>السجل التجاري: ${o(a)}</div>`:""}
        </div>
      </div>
      <div class="invoice-title">
        <h1>فاتورة ضريبية</h1>
        ${t.display.orderNumber?`<p data-invoice-section="orderNumber">رقم الفاتورة: ${S}</p>`:""}
        <p>تاريخ الإصدار: ${o(b)} ${o(f)}</p>
      </div>
    </header>

    <section class="details">
      <div class="panel">
        <h2>بيانات العميل والفرع</h2>
        <div class="detail-line"><span>العميل</span><span>${I}</span></div>
        ${z?`<div class="detail-line"><span>الهاتف</span><span>${z}</span></div>`:""}
        <div class="detail-line"><span>الفرع</span><span>${P}</span></div>
        ${p?`<div class="detail-line"><span>العنوان</span><span>${p}</span></div>`:""}
      </div>
      <div class="panel">
        <h2>بيانات العملية</h2>
        ${t.display.orderNumber?`<div class="detail-line" data-invoice-section="orderNumber"><span>رقم الطلب</span><span>${o(e.orderNumber)}</span></div>`:""}
        <div class="detail-line"><span>طريقة الدفع</span><span>${y}</span></div>
        ${N?`<div class="detail-line"><span>الموظف</span><span>${N}</span></div>`:""}
        ${k?`<div class="detail-line"><span>الطاولة</span><span>${k}</span></div>`:""}
      </div>
    </section>

    ${K}

    <table class="items">
      <thead><tr><th>الصنف</th><th class="numeric">الكمية</th><th class="numeric">سعر الوحدة</th><th class="numeric">الإجمالي</th></tr></thead>
      <tbody>${T||'<tr><td colspan="4">لا توجد أصناف</td></tr>'}</tbody>
    </table>

    <section class="summary">
      <div class="summary-rows">
        ${w>0?`<div class="summary-line"><span>الخصم المسجل (ضمن الإجمالي)</span><span>${w.toFixed(2)} ر.س</span></div>`:""}
        <div class="summary-line"><span>المبلغ قبل ضريبة القيمة المضافة</span><span>${d.toFixed(2)} ر.س</span></div>
        <div class="summary-line"><span>ضريبة القيمة المضافة (${(J*100).toFixed(0)}%)</span><span>${c.toFixed(2)} ر.س</span></div>
        <div class="summary-line total"><span>الإجمالي شامل الضريبة</span><span>${n.toFixed(2)} ر.س</span></div>
      </div>
      <div class="zatca">${pe}</div>
    </section>

    <footer class="footer">
      <div>شكراً لزيارتكم ${o(Y)}.</div>
      ${e.notes?`<div>${o(e.notes)}</div>`:""}
    </footer>
  </main>
</body>
</html>
  `;be(me,`فاتورة ضريبية - ${e.orderNumber}`,{paperWidth:"A4"})}async function He(e){const{template:t,business:i}=await ae(),r=await ge(t,"customer"),l=i.tradeNameAr||Y,s=e.vatNumber||i.vatNumber||ee,a=e.crNumber||i.commercialRegistration||i.crNumber||se,o=String(e.orderNumber).replace(/\D/g,"")||String(e.orderNumber),n=`${window.location.origin}/track/${o}`;let d="";if(t.display.trackingBarcode)try{d=(await O.toString(n,{type:"svg",width:100,margin:1,errorCorrectionLevel:"M"})).replace(/<\?xml[^?]*\?>/g,"").replace(/width="\d+"/,'width="100"').replace(/height="\d+"/,'height="100"')}catch(g){console.error("Error generating order tracking QR:",g)}let c="";if(t.display.orderBarcode)try{const g=document.createElement("canvas");re(g,o,{format:"CODE128",displayValue:!0,height:46,width:2,margin:5}),c=g.toDataURL("image/png")}catch(g){console.error("Error generating order barcode:",g)}const{date:m,time:h}=te(e.date),b=e.deliveryTypeAr||(e.deliveryType==="dine-in"?"في الكافيه":e.deliveryType==="delivery"?"توصيل":"استلام"),f=r.map(g=>`
    <div style="text-align:center;margin:8px 0;">
      <div style="font-weight:bold;font-size:12px;">${A(g.label)}</div>
      <img src="${g.qrDataUrl}" alt="" style="width:100px;height:100px;">
    </div>`).join(""),x=`
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
    .campaign-art { display:block; width:calc(100% + 32px); max-width:none; height:auto; margin:-16px -16px 8px; }
    .campaign-order { display:block; clear:both; position:relative; z-index:1; width:100%; background:#fff; margin:4px 0 14px!important; padding:8px 0; border-top:1px dashed #999; border-bottom:1px dashed #999; }
    .business-legal { font-size:12px; line-height:1.8; color:#444; }
    ${we(t)}
    @media print { body { margin: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${t.mode==="campaign"?'<img class="campaign-art" src="/invoice-campaign-header.png" alt="بالغوا بالدفاع عن وطنكم">':`${t.display.logo?'<img data-invoice-section="logo" class="brand-logo" src="/elwa-invoice-logo.png?v=4" alt="إلوة">':""}`}
      ${t.display.orderNumber?`<div class="order-badge ${t.mode==="campaign"?"campaign-order":""}" data-invoice-section="orderNumber">
        <div class="order-number">${G(e.orderNumber)}</div>
      </div>`:""}
      ${t.display.businessDetails?`<h1 data-invoice-section="businessDetails" class="company-name">${A(l)}</h1>`:""}
      ${t.display.legalInfo?`<div class="business-legal" data-invoice-section="legalInfo">
        <div>الرقم الضريبي: ${A(s)}</div>
        <div>السجل التجاري: ${A(a)}</div>
      </div>`:""}
      ${t.mode!=="campaign"?'<p style="color: #666; font-size: 14px;">إيصال الاستلام</p>':""}
      ${t.display.orderBarcode&&c?`<img data-invoice-section="orderBarcode" class="order-barcode" src="${c}" alt="باركود الطلب ${G(e.orderNumber)}">`:""}
      <div data-invoice-section="orderType" class="order-type">${b}</div>
    </div>

    <div class="section">
      ${t.display.customer?`<div class="info-row" data-invoice-section="customer">
        <span>العميل:</span>
        <span style="font-weight: 600;">${A(e.customerName)}</span>
      </div>`:""}
      ${t.display.date?`<div class="info-row" data-invoice-section="date">
        <span>التاريخ:</span>
        <span>${m} - ${h}</span>
      </div>`:""}
      ${e.tableNumber?`
      <div class="info-row" data-invoice-section="orderType">
        <span>الطاولة:</span>
        <span style="font-weight: 700; font-size: 18px;">${A(e.tableNumber)}</span>
      </div>
      `:""}
    </div>

    ${t.display.items?`<div class="items-section" data-invoice-section="items">
      ${e.items.map(g=>{const v=q(g).map(T=>T.nameAr).join("، ");return`
        <div class="item-row" style="align-items:flex-start;">
          <div class="item-name" style="flex:1;">
            ${Oe(g.coffeeItem.nameAr,g.coffeeItem.nameEn)}
            ${v?`<div style="font-size:11px;color:#92400e;margin-top:2px;">+ ${v}</div>`:""}
          </div>
          <span class="item-qty">x${g.quantity}</span>
        </div>`}).join("")}
    </div>`:""}

    ${t.display.totals?`<div class="total-section" data-invoice-section="totals">
      <p style="font-size: 14px; color: #92400e;">الإجمالي المدفوع</p>
      <p class="total-amount">${e.total} ر.س</p>
      ${t.display.payment?`<p data-invoice-section="payment" style="font-size: 12px; color: #666; margin-top: 4px;">${A(e.paymentMethod)}</p>`:""}
    </div>`:""}

    ${d?`
    <div class="qr-section" data-invoice-section="trackingBarcode">
      <div class="qr-title">تتبع الطلب</div>
      <div class="qr-container">${d}</div>
      <div class="qr-note">امسح الرمز لمتابعة حالة الطلب</div>
    </div>
    `:""}
    ${f}

    <div class="footer">
      ${t.display.thankYou?`<p data-invoice-section="thankYou" style="font-weight: 600;">شكراً لزيارتكم</p>
      <p data-invoice-section="thankYou">نتمنى لكم تجربة ممتعة</p>`:""}
      ${t.display.poweredBy?'<p data-invoice-section="poweredBy" style="margin-top: 8px;">@ELWA</p>':""}
    </div>
  </div>
</body>
</html>
  `;be(x,`إيصال استلام - ${e.orderNumber}`,{paperWidth:"80mm"})}async function Ye(e){let t=!1;try{const{loadPrinterSettings:i,buildEscPosKitchenTicketBitmap:r,thermalPrint:l}=await R(async()=>{const{loadPrinterSettings:a,buildEscPosKitchenTicketBitmap:o,thermalPrint:n}=await import("./thermal-printer-DNC3WoIX.js");return{loadPrinterSettings:a,buildEscPosKitchenTicketBitmap:o,thermalPrint:n}},__vite__mapDeps([0,1,2,3,4,5,6])),s=i();if(t=s.enabled&&s.mode==="queue",s.enabled&&(s.autoPrint||s.mode==="queue")){const a=e.orderTypeName||(e.orderType==="dine_in"?"محلي":e.orderType==="takeaway"?"سفري":e.orderType==="delivery"?"توصيل":e.deliveryTypeAr||""),o=await xe(e,a,s.paperWidth,s.feedLines??4),n=await l(o,"",s.paperWidth);if(console.log("[PrintAllReceipts] Result:",n.mode,n.success),n.success&&["webusb","bluetooth","network","queue","relay"].includes(n.mode)){if((n.mode==="webusb"||n.mode==="queue")&&s.autoKitchenCopy){await new Promise(m=>setTimeout(m,1200));const d=await r({orderNumber:e.orderNumber,tableNumber:e.tableNumber,orderType:a||void 0,cashierName:e.employeeName,items:e.items.map(m=>({name:m.coffeeItem.nameAr,qty:m.quantity,addons:q(m).map(h=>h.nameAr)})),notes:e.notes||void 0,paperWidth:s.paperWidth}),{thermalPrint:c}=await R(async()=>{const{thermalPrint:m}=await import("./thermal-printer-DNC3WoIX.js");return{thermalPrint:m}},__vite__mapDeps([0,1,2,3,4,5,6]));await c(d,"",s.paperWidth)}return n}if(t)return n}}catch(i){if(console.error("[PrintAllReceipts] Thermal printer error, falling back:",i),t)return{success:!1,mode:"queue",error:i instanceof Error?i.message:String(i)}}return await Pe(e),{success:!0,mode:"browser"}}const Ge=Object.freeze(Object.defineProperty({__proto__:null,beginIOSAirPrintSession:Ee,buildEmployeeReceiptPreviewHtml:le,buildReceiptPreviewHtml:de,cancelIOSAirPrintSession:Re,finishIOSAirPrintSession:Ie,fmtOrderNum:G,isAndroidDevice:Ce,openReceiptPreviewWindow:Ue,prewarmZatcaQr:De,printA4TaxInvoice:Ve,printAllReceipts:Ye,printBulkEmployeeInvoices:We,printCustomerPickupReceipt:He,printHtmlInPage:je,printReceiptSection:Me,printRefundThermal:Le,printShiftThermal:Be,printTaxInvoice:ke,printUnifiedReceipt:Pe},Symbol.toStringTag,{value:"Module"}));export{Be as a,ke as b,Me as c,Ye as d,Ee as e,G as f,Ie as g,Re as h,Ce as i,He as j,Ve as k,Se as l,De as m,Le as n,Ue as o,je as p,de as q,Ge as r};
