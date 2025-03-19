(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[549],{3609:(e,t,a)=>{Promise.resolve().then(a.bind(a,4292))},3271:(e,t,a)=>{"use strict";a.d(t,{default:()=>n});var s=a(4884),r=a(4843),l=a(6244);function n(e){let{flavorProfile:t,t:a,color:n}=e,o=(0,r.useRef)(null);return(0,r.useEffect)(()=>{if(!o.current||!t)return;let e=l.Ltv(o.current);e.selectAll("*").remove();let s=e.append("g").attr("transform","translate(".concat(150,",").concat(150,")")),r=2*Math.PI/5,i=l.m4Y().domain([0,10]).range([0,100]);for(let e=1;e<=5;e++){let t=e/5;s.append("circle").attr("r",100*t).attr("class","gridCircle").style("fill","none").style("stroke","#374151").style("stroke-width","0.5")}for(let e=0;e<5;e++){let t=r*e;s.append("line").attr("x1",0).attr("y1",0).attr("x2",100*Math.cos(t-Math.PI/2)).attr("y2",100*Math.sin(t-Math.PI/2)).attr("class","line").style("stroke","#70717a").style("stroke-width","0.5")}let d=[t.booziness,t.sweetness,t.sourness,t.body,t.complexity].map((e,t)=>{let a=r*t-Math.PI/2;return[i(e)*Math.cos(a),i(e)*Math.sin(a)]}),c=l.n8j();s.append("path").datum(d).attr("d",c.curve(l.Lx9)).attr("fill",n).attr("stroke",n).attr("stroke-width",2);let m=[a.booziness,a.sweetness,a.sourness,a.body,a.complexity];for(let e=0;e<5;e++){let t=r*e-Math.PI/2,a=120*Math.cos(t),l=120*Math.sin(t);s.append("text").attr("x",a).attr("y",l).attr("text-anchor","middle").attr("dominant-baseline","middle").attr("fill","white").style("font-size","12px").text(m[e])}},[t,a,n]),(0,s.jsx)("svg",{ref:o,width:300,height:300,viewBox:"0 0 ".concat(300," ").concat(300),className:"mx-auto"})}},4292:(e,t,a)=>{"use strict";a.d(t,{TwistFinder:()=>z});var s=a(4884),r=a(4843),l=a(8760),n=a(6838),o=a(7265),i=a(4507);let d=(0,i.A)("ChevronsUpDown",[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]]);var c=a(2654),m=a(654),u=a(7583),p=a(1664);function f(e){var t;let{options:a,value:l,onValueChange:n,placeholder:i="Select option...",searchPlaceholder:f="Search...",emptyText:h="No results found.",className:x}=e,[g,b]=r.useState(!1);return(0,s.jsxs)(p.AM,{open:g,onOpenChange:b,children:[(0,s.jsx)(p.Wv,{asChild:!0,children:(0,s.jsxs)(o.$,{variant:"outline",role:"combobox","aria-expanded":g,className:(0,m.cn)("w-full justify-between",x),children:[l?null===(t=a.find(e=>e.value===l))||void 0===t?void 0:t.label:i,(0,s.jsx)(d,{className:"ml-2 h-4 w-4 shrink-0 opacity-50"})]})}),(0,s.jsx)(p.hl,{className:"w-full p-0",children:(0,s.jsxs)(u.uB,{children:[(0,s.jsx)(u.G7,{placeholder:f}),(0,s.jsxs)(u.oI,{children:[(0,s.jsx)(u.xL,{children:h}),(0,s.jsx)(u.L$,{children:a.map(e=>(0,s.jsxs)(u.h_,{value:e.value,onSelect:e=>{n(e===l?"":e),b(!1)},children:[(0,s.jsx)(c.A,{className:(0,m.cn)("mr-2 h-4 w-4",l===e.value?"opacity-100":"opacity-0")}),e.label]},e.value))})]})]})})]})}var h=a(5959);function x(e,t){let a=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!e||!t||!Array.isArray(e)||!Array.isArray(t))return 5;let s=e.map(e=>{var t;return e?"string"==typeof e?e.toLowerCase():(null===(t=e.name)||void 0===t?void 0:t.en)?e.name.en.toLowerCase():"":""}).filter(Boolean),r=t.map(e=>{var t;return e?"string"==typeof e?e.toLowerCase():(null===(t=e.name)||void 0===t?void 0:t.en)?e.name.en.toLowerCase():"":""}).filter(Boolean),l=0;if(a){let e=Math.max(s.length,r.length);for(let t=0;t<e;t++){let a=s[t],n=r[t];a&&n?a!==n&&(l+=1+(e-t)*.2):l+=1}}else{let e=new Set(s),t=new Set(r);for(let a of e)!t.has(a)&&l++;for(let a of t)!e.has(a)&&l++}return l}var g=a(3271),b=a(9854),y=a(3890);function v(e){let{cocktail:t,hideTitle:a=!1}=e,{language:r}=(0,l.o)(),o=n.P[r];return(0,s.jsxs)("div",{children:[!a&&(0,s.jsx)("div",{className:"mb-4 flex justify-between items-start gap-x-2",children:(0,s.jsxs)("div",{children:[(0,s.jsx)("h3",{className:"text-4xl mb-1",children:t.name.en}),"zh"===r&&(0,s.jsx)("div",{className:"text-gray-400",children:t.name.zh})]})}),t.flavor_descriptors&&(0,s.jsx)("div",{className:"mb-4",children:(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:t.flavor_descriptors.map((e,t)=>(0,s.jsx)(y.FlavorDescriptor,{descriptor:e,language:r,onClick:e=>e.stopPropagation()},t))})}),(0,s.jsx)("div",{className:"mt-8",children:(0,s.jsx)(g.default,{flavorProfile:t.flavor_profile,t:o,color:(e=>{var t;if(!(null===(t=e.flavor_descriptors)||void 0===t?void 0:t.length))return"rgba(255, 185, 0, 0.5)";let a=e.flavor_descriptors[0].en.toLowerCase();return b.g[a]||"rgba(255, 185, 0, 0.5)"})(t)})}),(0,s.jsxs)("div",{className:"mt-4",children:[(0,s.jsx)("h4",{className:"text-gray-400",children:o.ingredients}),(0,s.jsx)("ul",{className:"mt-1",children:[...t.base_spirits,...t.liqueurs,...t.ingredients].map((e,t)=>(0,s.jsxs)("li",{className:"flex justify-between",children:[e.name[r],(0,s.jsxs)("span",{className:"text-gray-400",children:[e.amount," ",e.unit[r]]})]},t))})]})]})}var j=a(465),N=a(732),w=a(5263);let k=(0,i.A)("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);var _=a(9260);function C(e){let{twists:t,baseCocktail:a,onFindAgain:i}=e,{language:d}=(0,l.o)(),c=n.P[d],[m,u]=(0,r.useState)(!0);return(0,s.jsxs)(N.P.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:.1},children:[(0,s.jsxs)("button",{onClick:()=>u(!m),className:"w-full text-left group",children:[(0,s.jsxs)("h2",{className:"text-3xl mb-2 group-hover:opacity-80 transition-opacity",children:[(0,s.jsx)("span",{className:"font-medium",children:a.name.en}),(0,s.jsxs)("span",{className:"font-extralight",children:[" ",c.twists]})]}),"zh"===d&&(0,s.jsx)("p",{className:"text-muted-foreground mb-4",children:a.name.zh})]}),(0,s.jsxs)("div",{className:"mb-8",children:[(0,s.jsxs)("button",{onClick:()=>u(!m),className:"flex items-center gap-2 mb-2 text-muted-foreground hover:text-foreground transition-colors",children:[m?(0,s.jsx)(k,{size:20}):(0,s.jsx)(_.A,{size:20}),(0,s.jsx)("span",{children:c.seeMore})]}),(0,s.jsx)(w.N,{children:m&&(0,s.jsx)(N.P.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0,marginBottom:0},transition:{duration:.3},className:"overflow-hidden",children:(0,s.jsx)(v,{cocktail:a,hideTitle:!0})})})]}),(0,s.jsx)(o.$,{className:"mb-8",onClick:i,children:c.reset}),(0,s.jsx)("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:t.map((e,t)=>{let{cocktail:a,distance:r}=e;return(0,s.jsx)(N.P.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.3,delay:.1*t},children:(0,s.jsx)(j.CocktailCard,{cocktail:a,distance:r})},a.name.en)})})]})}function z(e){let{cocktails:t}=e,{language:a}=(0,l.o)(),i=n.P[a],[d,c]=(0,r.useState)(""),[u,p]=(0,r.useState)([]),[g,b]=(0,r.useState)(!1),y=t.map(e=>({label:"".concat(e.name.en," / ").concat(e.name.zh),value:e.name.en})).sort((e,t)=>e.label.localeCompare(t.label)),j=d?t.find(e=>e.name.en===d):null;return g&&j?(0,s.jsx)(C,{twists:u,baseCocktail:j,onFindAgain:()=>{b(!1),c(""),p([])}}):(0,s.jsxs)("div",{children:[(0,s.jsx)("h1",{className:"text-3xl mb-8",children:i.findTwists}),(0,s.jsx)("p",{className:"text-muted-foreground mb-2",children:i.findTwistsDescription}),(0,s.jsxs)("div",{className:"max-w-md mb-8",children:[(0,s.jsx)(f,{options:y,value:d,onValueChange:c,placeholder:i.selectCocktail,searchPlaceholder:i.search,emptyText:i.noResultsFound,className:"mb-4"}),(0,s.jsxs)("div",{className:"flex gap-2 mt-4",children:[(0,s.jsx)(o.$,{className:"flex-1",onClick:()=>{if(!d)return;let e=t.find(e=>e.name.en===d);e&&(p(t.filter(e=>e.name.en!==d).map(t=>{var a,s,r,l;let n;let o=(a=e,s=t,0===a.flavor_profile.booziness!=(0===s.flavor_profile.booziness)?1e3:0+4*x(a.base_spirits,s.base_spirits,!0)+3*x(a.liqueurs,s.liqueurs,!0)+2.5*x(a.ingredients,s.ingredients,!0)+1.5*(r=a.flavor_profile,l=s.flavor_profile,n=0+Math.abs(r.body-l.body)+Math.abs(r.complexity-l.complexity)+Math.abs(r.sourness-l.sourness)+Math.abs(r.sweetness-l.sweetness),null!==r.bubbles&&null!==l.bubbles&&(n+=r.bubbles!==l.bubbles?1:0),n)+x(Array.isArray(a.flavor_descriptors)?a.flavor_descriptors.map(e=>e.en):[],Array.isArray(s.flavor_descriptors)?s.flavor_descriptors.map(e=>e.en):[],!1));return{cocktail:t,distance:o}}).sort((e,t)=>e.distance-t.distance).slice(0,10)),b(!0),(0,h.sendGAEvent)("twist_finder",{action:"find_twists",base_cocktail:d}))},disabled:!d,children:i.findTwists}),(0,s.jsx)(o.$,{className:"flex-1",variant:"outline",onClick:()=>window.open("/".concat(a,"/cocktails/").concat((0,m.Yv)((null==j?void 0:j.name.en)||"")),"_blank"),disabled:!d,children:i.seeMore})]}),j&&(0,s.jsx)("div",{className:"mt-8",children:(0,s.jsx)(v,{cocktail:j})})]})]})}},7583:(e,t,a)=>{"use strict";a.d(t,{uB:()=>u,xL:()=>h,L$:()=>x,G7:()=>p,h_:()=>b,oI:()=>f,fx:()=>g});var s=a(4884),r=a(4843),l=a(9184),n=a(5930),o=a(654),i=a(2723),d=a(4766);i.bL,i.l9;let c=i.ZL;i.bm;let m=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(i.hJ,{ref:t,className:(0,o.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...r})});m.displayName=i.hJ.displayName,r.forwardRef((e,t)=>{let{className:a,children:r,...l}=e;return(0,s.jsxs)(c,{children:[(0,s.jsx)(m,{}),(0,s.jsxs)(i.UC,{ref:t,className:(0,o.cn)("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",a),...l,children:[r,(0,s.jsxs)(i.bm,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[(0,s.jsx)(d.A,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})}).displayName=i.UC.displayName,r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(i.hE,{ref:t,className:(0,o.cn)("text-lg font-semibold leading-none tracking-tight",a),...r})}).displayName=i.hE.displayName,r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(i.VY,{ref:t,className:(0,o.cn)("text-sm text-muted-foreground",a),...r})}).displayName=i.VY.displayName;let u=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.uB,{ref:t,className:(0,o.cn)("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",a),...r})});u.displayName=l.uB.displayName;let p=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsxs)("div",{className:"flex items-center border-b px-3","cmdk-input-wrapper":"",children:[(0,s.jsx)(n.A,{className:"mr-2 h-4 w-4 shrink-0 opacity-50"}),(0,s.jsx)(l.uB.Input,{ref:t,className:(0,o.cn)("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",a),...r})]})});p.displayName=l.uB.Input.displayName;let f=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.uB.List,{ref:t,className:(0,o.cn)("max-h-[300px] overflow-y-auto overflow-x-hidden",a),...r})});f.displayName=l.uB.List.displayName;let h=r.forwardRef((e,t)=>(0,s.jsx)(l.uB.Empty,{ref:t,className:"py-6 text-center text-sm",...e}));h.displayName=l.uB.Empty.displayName;let x=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.uB.Group,{ref:t,className:(0,o.cn)("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",a),...r})});x.displayName=l.uB.Group.displayName;let g=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.uB.Separator,{ref:t,className:(0,o.cn)("-mx-1 h-px bg-border",a),...r})});g.displayName=l.uB.Separator.displayName;let b=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.uB.Item,{ref:t,className:(0,o.cn)("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",a),...r})});b.displayName=l.uB.Item.displayName},1664:(e,t,a)=>{"use strict";a.d(t,{AM:()=>o,Wv:()=>i,hl:()=>d});var s=a(4884),r=a(4843),l=a(9375),n=a(654);let o=l.bL,i=l.l9;l.Mz;let d=r.forwardRef((e,t)=>{let{className:a,align:r="center",sideOffset:o=4,...i}=e;return(0,s.jsx)(l.ZL,{children:(0,s.jsx)(l.UC,{ref:t,align:r,sideOffset:o,className:(0,n.cn)("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",a),...i})})});d.displayName=l.UC.displayName},9854:(e,t,a)=>{"use strict";a.d(t,{$W:()=>s,RM:()=>r,g:()=>l});let s="https://forms.gle/U2mTzPo1i9vUUccX9",r="https://www.buymeacoffee.com/coolsunwind",l={bitter:"rgba(139, 69, 19, 0.5)",salty:"rgba(0, 191, 255, 0.5)",umami:"rgba(255, 140, 0, 0.5)",fruity:"rgba(255, 99, 132, 0.5)",citrus:"rgba(255, 215, 0, 0.5)",herbal:"rgba(50, 205, 50, 0.5)",spicy:"rgba(255, 69, 0, 0.5)",floral:"rgba(255, 20, 147, 0.5)",tropical:"rgba(0, 128, 0, 0.5)",nutty:"rgba(139, 69, 19, 0.5)",chocolate:"rgba(210, 105, 30, 0.5)",coffee:"rgba(101, 67, 33, 0.5)",vanilla:"rgba(245, 222, 179, 0.5)",smoky:"rgba(112, 128, 144, 0.5)",earth:"rgba(139, 69, 19, 0.5)",savory:"rgba(255, 140, 0, 0.5)",creamy:"rgba(255, 228, 196, 0.5)",woody:"rgba(101, 67, 33, 0.5)",grassy:"rgba(34, 139, 34, 0.5)",yeasty:"rgba(218, 165, 32, 0.5)"}}},e=>{var t=t=>e(e.s=t);e.O(0,[888,966,149,847,244,465,449,919,358],()=>t(3609)),_N_E=e.O()}]);