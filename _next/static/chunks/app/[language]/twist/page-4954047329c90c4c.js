(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[549],{3609:(e,t,a)=>{Promise.resolve().then(a.bind(a,3100))},3271:(e,t,a)=>{"use strict";a.d(t,{default:()=>n});var r=a(4884),s=a(4843),l=a(6244);function n(e){let{flavorProfile:t,t:a,color:n}=e,i=(0,s.useRef)(null);return(0,s.useEffect)(()=>{if(!i.current||!t)return;let e=l.Ltv(i.current);e.selectAll("*").remove();let r=e.append("g").attr("transform","translate(".concat(150,",").concat(150,")")),s=2*Math.PI/5,o=l.m4Y().domain([0,10]).range([0,100]);for(let e=1;e<=5;e++){let t=e/5;r.append("circle").attr("r",100*t).attr("class","gridCircle").style("fill","none").style("stroke","#374151").style("stroke-width","0.5")}for(let e=0;e<5;e++){let t=s*e;r.append("line").attr("x1",0).attr("y1",0).attr("x2",100*Math.cos(t-Math.PI/2)).attr("y2",100*Math.sin(t-Math.PI/2)).attr("class","line").style("stroke","#70717a").style("stroke-width","0.5")}let c=[t.booziness,t.sweetness,t.sourness,t.body,t.complexity].map((e,t)=>{let a=s*t-Math.PI/2;return[o(e)*Math.cos(a),o(e)*Math.sin(a)]}),d=l.n8j();r.append("path").datum(c).attr("d",d.curve(l.Lx9)).attr("fill",n).attr("stroke",n).attr("stroke-width",2);let m=[a.booziness,a.sweetness,a.sourness,a.body,a.complexity];for(let e=0;e<5;e++){let t=s*e-Math.PI/2,a=120*Math.cos(t),l=120*Math.sin(t);r.append("text").attr("x",a).attr("y",l).attr("text-anchor","middle").attr("dominant-baseline","middle").attr("fill","white").style("font-size","12px").text(m[e])}},[t,a,n]),(0,r.jsx)("svg",{ref:i,width:300,height:300,viewBox:"0 0 ".concat(300," ").concat(300),className:"mx-auto"})}},3100:(e,t,a)=>{"use strict";a.d(t,{TwistFinder:()=>x});var r=a(4884),s=a(4843),l=a(8760),n=a(6838),i=a(465),o=a(7265),c=a(7367),d=a(5959);function m(e,t){if(!e||!t||!Array.isArray(e)||!Array.isArray(t))return 5;let a=new Set(e.map(e=>{var t;return e?"string"==typeof e?e.toLowerCase():(null===(t=e.name)||void 0===t?void 0:t.en)?e.name.en.toLowerCase():"":""}).filter(Boolean)),r=new Set(t.map(e=>{var t;return e?"string"==typeof e?e.toLowerCase():(null===(t=e.name)||void 0===t?void 0:t.en)?e.name.en.toLowerCase():"":""}).filter(Boolean)),s=0;for(let e of a)!r.has(e)&&s++;for(let e of r)!a.has(e)&&s++;return s}var h=a(3271),p=a(9854),u=a(3890),f=a(654);function v(e){let{cocktail:t}=e,{language:a}=(0,l.o)(),s=n.P[a],i="/".concat(a,"/cocktails/").concat((0,f.Yv)(t.name.en));return(0,r.jsxs)("div",{className:"",children:[(0,r.jsx)("div",{className:"mb-4 flex justify-between items-start gap-x-2",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h3",{className:"text-2xl mb-1",children:t.name.en}),"zh"===a&&(0,r.jsx)("div",{className:"text-gray-400 text-sm",children:t.name.zh})]})}),t.flavor_descriptors&&(0,r.jsx)("div",{className:"mb-4",children:(0,r.jsx)("div",{className:"flex flex-wrap gap-2",children:t.flavor_descriptors.map((e,t)=>(0,r.jsx)(u.FlavorDescriptor,{descriptor:e,language:a,onClick:e=>e.stopPropagation()},t))})}),(0,r.jsx)("div",{className:"mt-8",children:(0,r.jsx)(h.default,{flavorProfile:t.flavor_profile,t:s,color:(e=>{var t;if(!(null===(t=e.flavor_descriptors)||void 0===t?void 0:t.length))return"rgba(255, 185, 0, 0.5)";let a=e.flavor_descriptors[0].en.toLowerCase();return p.g[a]||"rgba(255, 185, 0, 0.5)"})(t)})}),(0,r.jsxs)("div",{className:"mt-4",children:[(0,r.jsx)("h4",{className:"text-gray-400",children:s.ingredients}),(0,r.jsx)("ul",{className:"mt-1",children:[...t.base_spirits,...t.liqueurs,...t.ingredients].map((e,t)=>(0,r.jsxs)("li",{className:"flex justify-between",children:[e.name[a],(0,r.jsxs)("span",{className:"text-gray-400",children:[e.amount," ",e.unit[a]]})]},t))})]}),(0,r.jsx)("div",{className:"mt-4",children:(0,r.jsx)(o.$,{onClick:e=>{e.stopPropagation(),window.open(i,"_blank")},variant:"outline",children:s.seeMore})})]})}function x(e){let{cocktails:t}=e,{language:a}=(0,l.o)(),h=n.P[a],[p,u]=(0,s.useState)([]),[f,x]=(0,s.useState)([]),y=t.map(e=>({label:"".concat(e.name.en," / ").concat(e.name.zh),value:e.name.en})),g=p.length?t.find(e=>e.name.en===p[0]):null;return(0,r.jsxs)("div",{children:[(0,r.jsxs)("div",{className:"max-w-md mb-8",children:[(0,r.jsx)(c.K,{options:y,value:p,onValueChange:u,placeholder:h.selectCocktail,maxCount:1,enableSelectAll:!1}),g&&(0,r.jsx)("div",{className:"mt-4 mb-4",children:(0,r.jsx)(v,{cocktail:g})}),(0,r.jsx)(o.$,{className:"w-full mt-4",onClick:()=>{if(!p.length)return;let e=t.find(e=>e.name.en===p[0]);e&&(x(t.filter(e=>e.name.en!==p[0]).map(t=>{let a=0+3*m(Array.isArray(e.flavor_profile)?e.flavor_profile:[],Array.isArray(t.flavor_profile)?t.flavor_profile:[])+2.5*m(Array.isArray(e.flavor_descriptors)?e.flavor_descriptors.map(e=>e.en):[],Array.isArray(t.flavor_descriptors)?t.flavor_descriptors.map(e=>e.en):[])+2*m(e.base_spirits,t.base_spirits)+1.5*m(e.liqueurs,t.liqueurs)+m(e.ingredients,t.ingredients);return{cocktail:t,distance:a}}).sort((e,t)=>e.distance-t.distance).slice(0,10)),(0,d.sendGAEvent)("twist_finder",{action:"find_twists",base_cocktail:p[0]}))},disabled:!p.length,children:h.findTwists})]}),f.length>0&&(0,r.jsxs)("div",{children:[(0,r.jsx)("h3",{className:"text-lg font-medium mb-4",children:h.suggestedTwists}),(0,r.jsx)("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:f.map(e=>{let{cocktail:t,distance:a}=e;return(0,r.jsx)(i.CocktailCard,{cocktail:t,distance:a},t.name.en)})})]})]})}},9260:(e,t,a)=>{"use strict";a.d(t,{A:()=>r});let r=(0,a(4507).A)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},651:(e,t,a)=>{"use strict";a.d(t,{A:()=>r});let r=(0,a(4507).A)("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},7152:(e,t,a)=>{"use strict";a.d(t,{A:()=>r});let r=(0,a(4507).A)("WandSparkles",[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]])},4832:(e,t,a)=>{"use strict";a.d(t,{b:()=>c});var r=a(4843),s=a(5835),l=a(4884),n="horizontal",i=["horizontal","vertical"],o=r.forwardRef((e,t)=>{let{decorative:a,orientation:r=n,...o}=e,c=i.includes(r)?r:n;return(0,l.jsx)(s.sG.div,{"data-orientation":c,...a?{role:"none"}:{"aria-orientation":"vertical"===c?c:void 0,role:"separator"},...o,ref:t})});o.displayName="Separator";var c=o}},e=>{var t=t=>e(e.s=t);e.O(0,[563,966,938,244,465,344,449,919,358],()=>t(3609)),_N_E=e.O()}]);