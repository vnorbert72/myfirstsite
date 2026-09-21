const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-v6BOQW9O.js","assets/index-CyCHoJIB.js","assets/index-De5sJYqX.css"])))=>i.map(i=>d[i]);
import{m as r,u as c,r as h,j as e,B as p,a5 as x}from"./index-CyCHoJIB.js";import{a as y}from"./label-sntQJUlW.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=r("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=r("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=r("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=r("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);function _({targetId:a,filename:o="fitfusion-result.pdf",className:n}){const{t:s}=c(),[t,i]=h.useState(!1),u=async()=>{const d=document.getElementById(a);if(!d){console.warn(`PdfExportButton: element with id "${a}" not found`);return}i(!0);try{const l=(await x(async()=>{const{default:m}=await import("./html2pdf-v6BOQW9O.js").then(f=>f.h);return{default:m}},__vite__mapDeps([0,1,2]))).default;await l().from(d).set({margin:[10,10,10,10],filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["avoid-all","css","legacy"]}}).save()}catch(l){console.error("PDF export failed",l)}finally{i(!1)}};return e.jsxs(p,{onClick:u,variant:"outline",size:"sm",disabled:t,className:n,"data-testid":"button-export-pdf",children:[t?e.jsx(y,{className:"h-4 w-4 animate-spin"}):e.jsx(v,{className:"h-4 w-4"}),s("common.downloadPdf",{defaultValue:"Download PDF"})]})}function E({references:a,className:o}){const{t:n}=c();return a.length===0?null:e.jsxs("div",{className:`p-4 border rounded-lg bg-muted/30 space-y-3 ${o??""}`,"data-testid":"references-section",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-muted-foreground"}),e.jsx("h3",{className:"font-semibold text-sm",children:n("references.title",{defaultValue:"Scientific References"})})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:n("references.description",{defaultValue:"Calculations and recommendations are based on peer-reviewed research and guidelines from the following authoritative sources:"})}),e.jsx("ul",{className:"space-y-2 text-xs",children:a.map((s,t)=>e.jsxs("li",{className:"flex gap-2","data-testid":`reference-${t}`,children:[e.jsxs("span",{className:"text-muted-foreground shrink-0",children:["[",t+1,"]"]}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("a",{href:s.url,target:"_blank",rel:"noopener noreferrer nofollow",className:"text-primary hover:underline inline-flex items-start gap-1",children:[e.jsx("span",{children:s.title}),e.jsx(j,{className:"h-3 w-3 shrink-0 mt-0.5"})]}),e.jsx("div",{className:"text-muted-foreground",children:s.source})]})]},t))})]})}export{g as B,N as C,_ as P,E as R};
