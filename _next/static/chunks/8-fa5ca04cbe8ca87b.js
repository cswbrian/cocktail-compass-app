"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8],{5020:(e,t,r)=>{r.d(t,{m:()=>n});function n(e,t,{checkForDefaultPrevented:r=!0}={}){return function(n){if(e?.(n),!1===r||!n.defaultPrevented)return t?.(n)}}},4280:(e,t,r)=>{r.d(t,{s:()=>i,t:()=>l});var n=r(4843);function o(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}function l(...e){return t=>{let r=!1,n=e.map(e=>{let n=o(e,t);return r||"function"!=typeof n||(r=!0),n});if(r)return()=>{for(let t=0;t<n.length;t++){let r=n[t];"function"==typeof r?r():o(e[t],null)}}}}function i(...e){return n.useCallback(l(...e),e)}},5852:(e,t,r)=>{r.d(t,{A:()=>l});var n=r(4843),o=r(4884);function l(e,t=[]){let r=[],i=()=>{let t=r.map(e=>n.createContext(e));return function(r){let o=r?.[e]||t;return n.useMemo(()=>({[`__scope${e}`]:{...r,[e]:o}}),[r,o])}};return i.scopeName=e,[function(t,l){let i=n.createContext(l),a=r.length;r=[...r,l];let u=t=>{let{scope:r,children:l,...u}=t,s=r?.[e]?.[a]||i,d=n.useMemo(()=>u,Object.values(u));return(0,o.jsx)(s.Provider,{value:d,children:l})};return u.displayName=t+"Provider",[u,function(r,o){let u=o?.[e]?.[a]||i,s=n.useContext(u);if(s)return s;if(void 0!==l)return l;throw Error(`\`${r}\` must be used within \`${t}\``)}]},function(...e){let t=e[0];if(1===e.length)return t;let r=()=>{let r=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let o=r.reduce((t,{useScope:r,scopeName:n})=>{let o=r(e)[`__scope${n}`];return{...t,...o}},{});return n.useMemo(()=>({[`__scope${t.scopeName}`]:o}),[o])}};return r.scopeName=t.scopeName,r}(i,...t)]}},2294:(e,t,r)=>{r.d(t,{b:()=>a});var n=r(4843),o=r(5835),l=r(4884),i=n.forwardRef((e,t)=>(0,l.jsx)(o.sG.label,{...e,ref:t,onMouseDown:t=>{var r;t.target.closest("button, input, select, textarea")||(null===(r=e.onMouseDown)||void 0===r||r.call(e,t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));i.displayName="Label";var a=i},5835:(e,t,r)=>{r.d(t,{sG:()=>i});var n=r(4843);r(6537);var o=r(7881),l=r(4884),i=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=n.forwardRef((e,r)=>{let{asChild:n,...i}=e,a=n?o.DX:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,l.jsx)(a,{...i,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{})},3159:(e,t,r)=>{r.d(t,{Q6:()=>V,bL:()=>$,zi:()=>W,CC:()=>T});var n=r(4843);function o(e,[t,r]){return Math.min(r,Math.max(t,e))}var l=r(5020),i=r(4280),a=r(5852),u=r(9254),s=r(4884),d=n.createContext(void 0),c=r(5029),f=r(4155),p=r(5835),m=r(7881),v=["PageUp","PageDown"],h=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],w={"from-left":["Home","PageDown","ArrowDown","ArrowLeft"],"from-right":["Home","PageDown","ArrowDown","ArrowRight"],"from-bottom":["Home","PageDown","ArrowDown","ArrowLeft"],"from-top":["Home","PageDown","ArrowUp","ArrowLeft"]},y="Slider",[b,g,x]=function(e){let t=e+"CollectionProvider",[r,o]=(0,a.A)(t),[l,u]=r(t,{collectionRef:{current:null},itemMap:new Map}),d=e=>{let{scope:t,children:r}=e,o=n.useRef(null),i=n.useRef(new Map).current;return(0,s.jsx)(l,{scope:t,itemMap:i,collectionRef:o,children:r})};d.displayName=t;let c=e+"CollectionSlot",f=n.forwardRef((e,t)=>{let{scope:r,children:n}=e,o=u(c,r),l=(0,i.s)(t,o.collectionRef);return(0,s.jsx)(m.DX,{ref:l,children:n})});f.displayName=c;let p=e+"CollectionItemSlot",v="data-radix-collection-item",h=n.forwardRef((e,t)=>{let{scope:r,children:o,...l}=e,a=n.useRef(null),d=(0,i.s)(t,a),c=u(p,r);return n.useEffect(()=>(c.itemMap.set(a,{ref:a,...l}),()=>void c.itemMap.delete(a))),(0,s.jsx)(m.DX,{[v]:"",ref:d,children:o})});return h.displayName=p,[{Provider:d,Slot:f,ItemSlot:h},function(t){let r=u(e+"CollectionConsumer",t);return n.useCallback(()=>{let e=r.collectionRef.current;if(!e)return[];let t=Array.from(e.querySelectorAll("[".concat(v,"]")));return Array.from(r.itemMap.values()).sort((e,r)=>t.indexOf(e.ref.current)-t.indexOf(r.ref.current))},[r.collectionRef,r.itemMap])},o]}(y),[S,R]=(0,a.A)(y,[x]),[j,E]=S(y),C=n.forwardRef((e,t)=>{let{name:r,min:i=0,max:a=100,step:d=1,orientation:c="horizontal",disabled:f=!1,minStepsBetweenThumbs:p=0,defaultValue:m=[i],value:w,onValueChange:y=()=>{},onValueCommit:g=()=>{},inverted:x=!1,form:S,...R}=e,E=n.useRef(new Set),C=n.useRef(0),D="horizontal"===c?P:k,[M=[],A]=(0,u.i)({prop:w,defaultProp:m,onChange:e=>{var t;null===(t=[...E.current][C.current])||void 0===t||t.focus(),y(e)}}),N=n.useRef(M);function _(e,t){let{commit:r}=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{commit:!1},n=(String(d).split(".")[1]||"").length,l=o(function(e,t){let r=Math.pow(10,t);return Math.round(e*r)/r}(Math.round((e-i)/d)*d+i,n),[i,a]);A(function(){var e,n;let o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],i=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1?arguments[1]:void 0,r=arguments.length>2?arguments[2]:void 0,n=[...e];return n[r]=t,n.sort((e,t)=>e-t)}(o,l,t);if(e=i,!(!((n=p*d)>0)||Math.min(...e.slice(0,-1).map((t,r)=>e[r+1]-t))>=n))return o;{C.current=i.indexOf(l);let e=String(i)!==String(o);return e&&r&&g(i),e?i:o}})}return(0,s.jsx)(j,{scope:e.__scopeSlider,name:r,disabled:f,min:i,max:a,valueIndexToChangeRef:C,thumbs:E.current,values:M,orientation:c,form:S,children:(0,s.jsx)(b.Provider,{scope:e.__scopeSlider,children:(0,s.jsx)(b.Slot,{scope:e.__scopeSlider,children:(0,s.jsx)(D,{"aria-disabled":f,"data-disabled":f?"":void 0,...R,ref:t,onPointerDown:(0,l.m)(R.onPointerDown,()=>{f||(N.current=M)}),min:i,max:a,inverted:x,onSlideStart:f?void 0:function(e){let t=function(e,t){if(1===e.length)return 0;let r=e.map(e=>Math.abs(e-t)),n=Math.min(...r);return r.indexOf(n)}(M,e);_(e,t)},onSlideMove:f?void 0:function(e){_(e,C.current)},onSlideEnd:f?void 0:function(){let e=N.current[C.current];M[C.current]!==e&&g(M)},onHomeKeyDown:()=>!f&&_(i,0,{commit:!0}),onEndKeyDown:()=>!f&&_(a,M.length-1,{commit:!0}),onStepKeyDown:e=>{let{event:t,direction:r}=e;if(!f){let e=v.includes(t.key)||t.shiftKey&&h.includes(t.key),n=C.current;_(M[n]+d*(e?10:1)*r,n,{commit:!0})}}})})})})});C.displayName=y;var[D,M]=S(y,{startEdge:"left",endEdge:"right",size:"width",direction:1}),P=n.forwardRef((e,t)=>{let{min:r,max:o,dir:l,inverted:a,onSlideStart:u,onSlideMove:c,onSlideEnd:f,onStepKeyDown:p,...m}=e,[v,h]=n.useState(null),y=(0,i.s)(t,e=>h(e)),b=n.useRef(void 0),g=function(e){let t=n.useContext(d);return e||t||"ltr"}(l),x="ltr"===g,S=x&&!a||!x&&a;function R(e){let t=b.current||v.getBoundingClientRect(),n=K([0,t.width],S?[r,o]:[o,r]);return b.current=t,n(e-t.left)}return(0,s.jsx)(D,{scope:e.__scopeSlider,startEdge:S?"left":"right",endEdge:S?"right":"left",direction:S?1:-1,size:"width",children:(0,s.jsx)(A,{dir:g,"data-orientation":"horizontal",...m,ref:y,style:{...m.style,"--radix-slider-thumb-transform":"translateX(-50%)"},onSlideStart:e=>{let t=R(e.clientX);null==u||u(t)},onSlideMove:e=>{let t=R(e.clientX);null==c||c(t)},onSlideEnd:()=>{b.current=void 0,null==f||f()},onStepKeyDown:e=>{let t=w[S?"from-left":"from-right"].includes(e.key);null==p||p({event:e,direction:t?-1:1})}})})}),k=n.forwardRef((e,t)=>{let{min:r,max:o,inverted:l,onSlideStart:a,onSlideMove:u,onSlideEnd:d,onStepKeyDown:c,...f}=e,p=n.useRef(null),m=(0,i.s)(t,p),v=n.useRef(void 0),h=!l;function y(e){let t=v.current||p.current.getBoundingClientRect(),n=K([0,t.height],h?[o,r]:[r,o]);return v.current=t,n(e-t.top)}return(0,s.jsx)(D,{scope:e.__scopeSlider,startEdge:h?"bottom":"top",endEdge:h?"top":"bottom",size:"height",direction:h?1:-1,children:(0,s.jsx)(A,{"data-orientation":"vertical",...f,ref:m,style:{...f.style,"--radix-slider-thumb-transform":"translateY(50%)"},onSlideStart:e=>{let t=y(e.clientY);null==a||a(t)},onSlideMove:e=>{let t=y(e.clientY);null==u||u(t)},onSlideEnd:()=>{v.current=void 0,null==d||d()},onStepKeyDown:e=>{let t=w[h?"from-bottom":"from-top"].includes(e.key);null==c||c({event:e,direction:t?-1:1})}})})}),A=n.forwardRef((e,t)=>{let{__scopeSlider:r,onSlideStart:n,onSlideMove:o,onSlideEnd:i,onHomeKeyDown:a,onEndKeyDown:u,onStepKeyDown:d,...c}=e,f=E(y,r);return(0,s.jsx)(p.sG.span,{...c,ref:t,onKeyDown:(0,l.m)(e.onKeyDown,e=>{"Home"===e.key?(a(e),e.preventDefault()):"End"===e.key?(u(e),e.preventDefault()):v.concat(h).includes(e.key)&&(d(e),e.preventDefault())}),onPointerDown:(0,l.m)(e.onPointerDown,e=>{let t=e.target;t.setPointerCapture(e.pointerId),e.preventDefault(),f.thumbs.has(t)?t.focus():n(e)}),onPointerMove:(0,l.m)(e.onPointerMove,e=>{e.target.hasPointerCapture(e.pointerId)&&o(e)}),onPointerUp:(0,l.m)(e.onPointerUp,e=>{let t=e.target;t.hasPointerCapture(e.pointerId)&&(t.releasePointerCapture(e.pointerId),i(e))})})}),N="SliderTrack",_=n.forwardRef((e,t)=>{let{__scopeSlider:r,...n}=e,o=E(N,r);return(0,s.jsx)(p.sG.span,{"data-disabled":o.disabled?"":void 0,"data-orientation":o.orientation,...n,ref:t})});_.displayName=N;var O="SliderRange",z=n.forwardRef((e,t)=>{let{__scopeSlider:r,...o}=e,l=E(O,r),a=M(O,r),u=n.useRef(null),d=(0,i.s)(t,u),c=l.values.length,f=l.values.map(e=>G(e,l.min,l.max)),m=c>1?Math.min(...f):0,v=100-Math.max(...f);return(0,s.jsx)(p.sG.span,{"data-orientation":l.orientation,"data-disabled":l.disabled?"":void 0,...o,ref:d,style:{...e.style,[a.startEdge]:m+"%",[a.endEdge]:v+"%"}})});z.displayName=O;var I="SliderThumb",X=n.forwardRef((e,t)=>{let r=g(e.__scopeSlider),[o,l]=n.useState(null),a=(0,i.s)(t,e=>l(e)),u=n.useMemo(()=>o?r().findIndex(e=>e.ref.current===o):-1,[r,o]);return(0,s.jsx)(H,{...e,ref:a,index:u})}),H=n.forwardRef((e,t)=>{let{__scopeSlider:r,index:o,name:a,...u}=e,d=E(I,r),c=M(I,r),[m,v]=n.useState(null),h=(0,i.s)(t,e=>v(e)),w=!m||d.form||!!m.closest("form"),y=(0,f.X)(m),g=d.values[o],x=void 0===g?0:G(g,d.min,d.max),S=function(e,t){return t>2?"Value ".concat(e+1," of ").concat(t):2===t?["Minimum","Maximum"][e]:void 0}(o,d.values.length),R=null==y?void 0:y[c.size],j=R?function(e,t,r){let n=e/2,o=K([0,50],[0,n]);return(n-o(t)*r)*r}(R,x,c.direction):0;return n.useEffect(()=>{if(m)return d.thumbs.add(m),()=>{d.thumbs.delete(m)}},[m,d.thumbs]),(0,s.jsxs)("span",{style:{transform:"var(--radix-slider-thumb-transform)",position:"absolute",[c.startEdge]:"calc(".concat(x,"% + ").concat(j,"px)")},children:[(0,s.jsx)(b.ItemSlot,{scope:e.__scopeSlider,children:(0,s.jsx)(p.sG.span,{role:"slider","aria-label":e["aria-label"]||S,"aria-valuemin":d.min,"aria-valuenow":g,"aria-valuemax":d.max,"aria-orientation":d.orientation,"data-orientation":d.orientation,"data-disabled":d.disabled?"":void 0,tabIndex:d.disabled?void 0:0,...u,ref:h,style:void 0===g?{display:"none"}:e.style,onFocus:(0,l.m)(e.onFocus,()=>{d.valueIndexToChangeRef.current=o})})}),w&&(0,s.jsx)(L,{name:null!=a?a:d.name?d.name+(d.values.length>1?"[]":""):void 0,form:d.form,value:g},o)]})});X.displayName=I;var L=e=>{let{value:t,...r}=e,o=n.useRef(null),l=(0,c.Z)(t);return n.useEffect(()=>{let e=o.current,r=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;if(l!==t&&r){let n=new Event("input",{bubbles:!0});r.call(e,t),e.dispatchEvent(n)}},[l,t]),(0,s.jsx)("input",{style:{display:"none"},...r,ref:o,defaultValue:t})};function G(e,t,r){return o(100/(r-t)*(e-t),[0,100])}function K(e,t){return r=>{if(e[0]===e[1]||t[0]===t[1])return t[0];let n=(t[1]-t[0])/(e[1]-e[0]);return t[0]+n*(r-e[0])}}var $=C,T=_,V=z,W=X},7881:(e,t,r)=>{r.d(t,{DX:()=>i});var n=r(4843),o=r(4280),l=r(4884),i=n.forwardRef((e,t)=>{let{children:r,...o}=e,i=n.Children.toArray(r),u=i.find(s);if(u){let e=u.props.children,r=i.map(t=>t!==u?t:n.Children.count(e)>1?n.Children.only(null):n.isValidElement(e)?e.props.children:null);return(0,l.jsx)(a,{...o,ref:t,children:n.isValidElement(e)?n.cloneElement(e,void 0,r):null})}return(0,l.jsx)(a,{...o,ref:t,children:r})});i.displayName="Slot";var a=n.forwardRef((e,t)=>{let{children:r,...l}=e;if(n.isValidElement(r)){let e=function(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(r=(t=Object.getOwnPropertyDescriptor(e,"ref")?.get)&&"isReactWarning"in t&&t.isReactWarning)?e.props.ref:e.props.ref||e.ref}(r),i=function(e,t){let r={...t};for(let n in t){let o=e[n],l=t[n];/^on[A-Z]/.test(n)?o&&l?r[n]=(...e)=>{l(...e),o(...e)}:o&&(r[n]=o):"style"===n?r[n]={...o,...l}:"className"===n&&(r[n]=[o,l].filter(Boolean).join(" "))}return{...e,...r}}(l,r.props);return r.type!==n.Fragment&&(i.ref=t?(0,o.t)(t,e):e),n.cloneElement(r,i)}return n.Children.count(r)>1?n.Children.only(null):null});a.displayName="SlotClone";var u=({children:e})=>(0,l.jsx)(l.Fragment,{children:e});function s(e){return n.isValidElement(e)&&e.type===u}},8537:(e,t,r)=>{r.d(t,{bL:()=>S,zi:()=>R});var n=r(4843),o=r(5020),l=r(4280),i=r(5852),a=r(9254),u=r(5029),s=r(4155),d=r(5835),c=r(4884),f="Switch",[p,m]=(0,i.A)(f),[v,h]=p(f),w=n.forwardRef((e,t)=>{let{__scopeSwitch:r,name:i,checked:u,defaultChecked:s,required:f,disabled:p,value:m="on",onCheckedChange:h,form:w,...y}=e,[b,S]=n.useState(null),R=(0,l.s)(t,e=>S(e)),j=n.useRef(!1),E=!b||w||!!b.closest("form"),[C=!1,D]=(0,a.i)({prop:u,defaultProp:s,onChange:h});return(0,c.jsxs)(v,{scope:r,checked:C,disabled:p,children:[(0,c.jsx)(d.sG.button,{type:"button",role:"switch","aria-checked":C,"aria-required":f,"data-state":x(C),"data-disabled":p?"":void 0,disabled:p,value:m,...y,ref:R,onClick:(0,o.m)(e.onClick,e=>{D(e=>!e),E&&(j.current=e.isPropagationStopped(),j.current||e.stopPropagation())})}),E&&(0,c.jsx)(g,{control:b,bubbles:!j.current,name:i,value:m,checked:C,required:f,disabled:p,form:w,style:{transform:"translateX(-100%)"}})]})});w.displayName=f;var y="SwitchThumb",b=n.forwardRef((e,t)=>{let{__scopeSwitch:r,...n}=e,o=h(y,r);return(0,c.jsx)(d.sG.span,{"data-state":x(o.checked),"data-disabled":o.disabled?"":void 0,...n,ref:t})});b.displayName=y;var g=e=>{let{control:t,checked:r,bubbles:o=!0,...l}=e,i=n.useRef(null),a=(0,u.Z)(r),d=(0,s.X)(t);return n.useEffect(()=>{let e=i.current,t=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(a!==r&&t){let n=new Event("click",{bubbles:o});t.call(e,r),e.dispatchEvent(n)}},[a,r,o]),(0,c.jsx)("input",{type:"checkbox","aria-hidden":!0,defaultChecked:r,...l,tabIndex:-1,ref:i,style:{...e.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function x(e){return e?"checked":"unchecked"}var S=w,R=b},9254:(e,t,r)=>{r.d(t,{i:()=>l});var n=r(4843);function o(e){let t=n.useRef(e);return n.useEffect(()=>{t.current=e}),n.useMemo(()=>(...e)=>t.current?.(...e),[])}function l({prop:e,defaultProp:t,onChange:r=()=>{}}){let[l,i]=function({defaultProp:e,onChange:t}){let r=n.useState(e),[l]=r,i=n.useRef(l),a=o(t);return n.useEffect(()=>{i.current!==l&&(a(l),i.current=l)},[l,i,a]),r}({defaultProp:t,onChange:r}),a=void 0!==e,u=a?e:l,s=o(r);return[u,n.useCallback(t=>{if(a){let r="function"==typeof t?t(e):t;r!==e&&s(r)}else i(t)},[a,e,i,s])]}},5029:(e,t,r)=>{r.d(t,{Z:()=>o});var n=r(4843);function o(e){let t=n.useRef({value:e,previous:e});return n.useMemo(()=>(t.current.value!==e&&(t.current.previous=t.current.value,t.current.value=e),t.current.previous),[e])}},4155:(e,t,r)=>{r.d(t,{X:()=>l});var n=r(4843),o=globalThis?.document?n.useLayoutEffect:()=>{};function l(e){let[t,r]=n.useState(void 0);return o(()=>{if(e){r({width:e.offsetWidth,height:e.offsetHeight});let t=new ResizeObserver(t=>{let n,o;if(!Array.isArray(t)||!t.length)return;let l=t[0];if("borderBoxSize"in l){let e=l.borderBoxSize,t=Array.isArray(e)?e[0]:e;n=t.inlineSize,o=t.blockSize}else n=e.offsetWidth,o=e.offsetHeight;r({width:n,height:o})});return t.observe(e,{box:"border-box"}),()=>t.unobserve(e)}r(void 0)},[e]),t}},7158:(e,t,r)=>{r.d(t,{F:()=>i});var n=r(8273);let o=e=>"boolean"==typeof e?`${e}`:0===e?"0":e,l=n.$,i=(e,t)=>r=>{var n;if((null==t?void 0:t.variants)==null)return l(e,null==r?void 0:r.class,null==r?void 0:r.className);let{variants:i,defaultVariants:a}=t,u=Object.keys(i).map(e=>{let t=null==r?void 0:r[e],n=null==a?void 0:a[e];if(null===t)return null;let l=o(t)||o(n);return i[e][l]}),s=r&&Object.entries(r).reduce((e,t)=>{let[r,n]=t;return void 0===n||(e[r]=n),e},{});return l(e,u,null==t?void 0:null===(n=t.compoundVariants)||void 0===n?void 0:n.reduce((e,t)=>{let{class:r,className:n,...o}=t;return Object.entries(o).every(e=>{let[t,r]=e;return Array.isArray(r)?r.includes({...a,...s}[t]):({...a,...s})[t]===r})?[...e,r,n]:e},[]),null==r?void 0:r.class,null==r?void 0:r.className)}}}]);