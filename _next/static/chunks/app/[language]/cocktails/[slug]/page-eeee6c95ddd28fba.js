(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[815],{4038:(t,e,r)=>{Promise.resolve().then(r.bind(r,3890)),Promise.resolve().then(r.bind(r,3271)),Promise.resolve().then(r.t.bind(r,1968,23))},3890:(t,e,r)=>{"use strict";r.d(e,{FlavorDescriptor:()=>i});var a=r(4884),l=r(1968),o=r.n(l),n=r(654);let s={Bitter:"bg-teal-700 text-teal-50",Salty:"bg-blue-600 text-blue-50",Umami:"bg-orange-600 text-orange-50",Fruity:"bg-orange-500 text-orange-50",Citrus:"bg-yellow-400 text-yellow-900",Herbal:"bg-green-600 text-green-50",Spicy:"bg-red-600 text-red-50",Floral:"bg-purple-500 text-purple-50",Tropical:"bg-green-700 text-white",Nutty:"bg-amber-800 text-amber-50",Chocolate:"bg-amber-900 text-amber-50",Coffee:"bg-red-900 text-red-50",Vanilla:"bg-yellow-100 text-yellow-900",Smoky:"bg-gray-600 text-gray-50",Earth:"bg-stone-600 text-stone-50",Savory:"bg-orange-700 text-orange-50",Creamy:"bg-yellow-100 text-yellow-900",Woody:"bg-amber-900 text-amber-50",Grassy:"bg-lime-500 text-lime-50",Yeasty:"bg-yellow-200 text-yellow-900"};function i(t){let{descriptor:e,language:r,onClick:l}=t,i=s[e.en]||"bg-gray-700 text-gray-100";return(0,a.jsx)(o(),{href:"/".concat(r,"/flavours/").concat((0,n.Yv)(e.en)),className:"px-3 py-1 rounded-full text-sm hover:opacity-80 transition-colors ".concat(i),onClick:l,children:e[r]})}},3271:(t,e,r)=>{"use strict";r.d(e,{default:()=>n});var a=r(4884),l=r(4843),o=r(6244);function n(t){let{flavorProfile:e,t:r,color:n}=t,s=(0,l.useRef)(null);return(0,l.useEffect)(()=>{if(!s.current||!e)return;let t=o.Ltv(s.current);t.selectAll("*").remove();let a=t.append("g").attr("transform","translate(".concat(150,",").concat(150,")")),l=2*Math.PI/5,i=o.m4Y().domain([0,10]).range([0,100]);for(let t=1;t<=5;t++){let e=t/5;a.append("circle").attr("r",100*e).attr("class","gridCircle").style("fill","none").style("stroke","#374151").style("stroke-width","0.5")}for(let t=0;t<5;t++){let e=l*t;a.append("line").attr("x1",0).attr("y1",0).attr("x2",100*Math.cos(e-Math.PI/2)).attr("y2",100*Math.sin(e-Math.PI/2)).attr("class","line").style("stroke","#70717a").style("stroke-width","0.5")}let c=[e.booziness,e.sweetness,e.sourness,e.body,e.complexity].map((t,e)=>{let r=l*e-Math.PI/2;return[i(t)*Math.cos(r),i(t)*Math.sin(r)]}),g=o.n8j();a.append("path").datum(c).attr("d",g.curve(o.Lx9)).attr("fill",n).attr("stroke",n).attr("stroke-width",2);let b=[r.booziness,r.sweetness,r.sourness,r.body,r.complexity];for(let t=0;t<5;t++){let e=l*t-Math.PI/2,r=120*Math.cos(e),o=120*Math.sin(e);a.append("text").attr("x",r).attr("y",o).attr("text-anchor","middle").attr("dominant-baseline","middle").attr("fill","white").style("font-size","12px").text(b[t])}},[e,r,n]),(0,a.jsx)("svg",{ref:s,width:300,height:300,viewBox:"0 0 ".concat(300," ").concat(300),className:"mx-auto"})}},654:(t,e,r)=>{"use strict";r.d(e,{Yv:()=>n,cn:()=>o});var a=r(8273),l=r(726);function o(){for(var t=arguments.length,e=Array(t),r=0;r<t;r++)e[r]=arguments[r];return(0,l.QP)((0,a.$)(e))}function n(t){return t.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,"")}}},t=>{var e=e=>t(t.s=e);t.O(0,[391,244,449,919,358],()=>e(4038)),_N_E=t.O()}]);