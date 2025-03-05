"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[444],{952:(e,t,n)=>{n.d(t,{Eq:()=>c});var r=new WeakMap,o=new WeakMap,a={},i=0,u=function(e){return e&&(e.host||u(e.parentNode))},l=function(e,t,n,l){var c=(Array.isArray(e)?e:[e]).map(function(e){if(t.contains(e))return e;var n=u(e);return n&&t.contains(n)?n:(console.error("aria-hidden",e,"in not contained inside",t,". Doing nothing"),null)}).filter(function(e){return!!e});a[n]||(a[n]=new WeakMap);var s=a[n],d=[],f=new Set,v=new Set(c),p=function(e){!e||f.has(e)||(f.add(e),p(e.parentNode))};c.forEach(p);var m=function(e){!e||v.has(e)||Array.prototype.forEach.call(e.children,function(e){if(f.has(e))m(e);else try{var t=e.getAttribute(l),a=null!==t&&"false"!==t,i=(r.get(e)||0)+1,u=(s.get(e)||0)+1;r.set(e,i),s.set(e,u),d.push(e),1===i&&a&&o.set(e,!0),1===u&&e.setAttribute(n,"true"),a||e.setAttribute(l,"true")}catch(t){console.error("aria-hidden: cannot operate on ",e,t)}})};return m(t),f.clear(),i++,function(){d.forEach(function(e){var t=r.get(e)-1,a=s.get(e)-1;r.set(e,t),s.set(e,a),t||(o.has(e)||e.removeAttribute(l),o.delete(e)),a||e.removeAttribute(n)}),--i||(r=new WeakMap,r=new WeakMap,o=new WeakMap,a={})}},c=function(e,t,n){void 0===n&&(n="data-aria-hidden");var r,o=Array.from(Array.isArray(e)?e:[e]),a=t||(r=e,"undefined"==typeof document?null:(Array.isArray(r)?r[0]:r).ownerDocument.body);return a?(o.push.apply(o,Array.from(a.querySelectorAll("[aria-live]"))),l(o,a,n,"aria-hidden")):function(){return null}}},4766:(e,t,n)=>{n.d(t,{A:()=>r});let r=(0,n(4507).A)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},9313:(e,t,n)=>{n.d(t,{E9:()=>a,Mi:()=>r,pN:()=>o,xi:()=>i});var r="right-scroll-bar-position",o="width-before-scroll-bar",a="with-scroll-bars-hidden",i="--removed-body-scroll-bar-size"},4346:(e,t,n)=>{n.d(t,{jp:()=>m});var r=n(4843),o=n(7847),a=n(9313),i={left:0,top:0,right:0,gap:0},u=function(e){return parseInt(e||"",10)||0},l=function(e){var t=window.getComputedStyle(document.body),n=t["padding"===e?"paddingLeft":"marginLeft"],r=t["padding"===e?"paddingTop":"marginTop"],o=t["padding"===e?"paddingRight":"marginRight"];return[u(n),u(r),u(o)]},c=function(e){if(void 0===e&&(e="margin"),"undefined"==typeof window)return i;var t=l(e),n=document.documentElement.clientWidth,r=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,r-n+t[2]-t[0])}},s=(0,o.T0)(),d="data-scroll-locked",f=function(e,t,n,r){var o=e.left,i=e.top,u=e.right,l=e.gap;return void 0===n&&(n="margin"),"\n  .".concat(a.E9," {\n   overflow: hidden ").concat(r,";\n   padding-right: ").concat(l,"px ").concat(r,";\n  }\n  body[").concat(d,"] {\n    overflow: hidden ").concat(r,";\n    overscroll-behavior: contain;\n    ").concat([t&&"position: relative ".concat(r,";"),"margin"===n&&"\n    padding-left: ".concat(o,"px;\n    padding-top: ").concat(i,"px;\n    padding-right: ").concat(u,"px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(l,"px ").concat(r,";\n    "),"padding"===n&&"padding-right: ".concat(l,"px ").concat(r,";")].filter(Boolean).join(""),"\n  }\n  \n  .").concat(a.Mi," {\n    right: ").concat(l,"px ").concat(r,";\n  }\n  \n  .").concat(a.pN," {\n    margin-right: ").concat(l,"px ").concat(r,";\n  }\n  \n  .").concat(a.Mi," .").concat(a.Mi," {\n    right: 0 ").concat(r,";\n  }\n  \n  .").concat(a.pN," .").concat(a.pN," {\n    margin-right: 0 ").concat(r,";\n  }\n  \n  body[").concat(d,"] {\n    ").concat(a.xi,": ").concat(l,"px;\n  }\n")},v=function(){var e=parseInt(document.body.getAttribute(d)||"0",10);return isFinite(e)?e:0},p=function(){r.useEffect(function(){return document.body.setAttribute(d,(v()+1).toString()),function(){var e=v()-1;e<=0?document.body.removeAttribute(d):document.body.setAttribute(d,e.toString())}},[])},m=function(e){var t=e.noRelative,n=e.noImportant,o=e.gapMode,a=void 0===o?"margin":o;p();var i=r.useMemo(function(){return c(a)},[a]);return r.createElement(s,{styles:f(i,!t,a,n?"":"!important")})}},4581:(e,t,n)=>{n.d(t,{A:()=>D});var r=n(769),o=n(4843),a=n(9313),i=n(3611),u=(0,n(7581).f)(),l=function(){},c=o.forwardRef(function(e,t){var n=o.useRef(null),a=o.useState({onScrollCapture:l,onWheelCapture:l,onTouchMoveCapture:l}),c=a[0],s=a[1],d=e.forwardProps,f=e.children,v=e.className,p=e.removeScrollBar,m=e.enabled,h=e.shards,g=e.sideCar,y=e.noIsolation,b=e.inert,E=e.allowPinchZoom,w=e.as,C=e.gapMode,N=(0,r.Tt)(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),x=(0,i.S)([n,t]),R=(0,r.Cl)((0,r.Cl)({},N),c);return o.createElement(o.Fragment,null,m&&o.createElement(g,{sideCar:u,removeScrollBar:p,shards:h,noIsolation:y,inert:b,setCallbacks:s,allowPinchZoom:!!E,lockRef:n,gapMode:C}),d?o.cloneElement(o.Children.only(f),(0,r.Cl)((0,r.Cl)({},R),{ref:x})):o.createElement(void 0===w?"div":w,(0,r.Cl)({},R,{className:v,ref:x}),f))});c.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1},c.classNames={fullWidth:a.pN,zeroRight:a.Mi};var s=n(3949),d=n(4346),f=n(7847),v=!1;if("undefined"!=typeof window)try{var p=Object.defineProperty({},"passive",{get:function(){return v=!0,!0}});window.addEventListener("test",p,p),window.removeEventListener("test",p,p)}catch(e){v=!1}var m=!!v&&{passive:!1},h=function(e,t){if(!(e instanceof Element))return!1;var n=window.getComputedStyle(e);return"hidden"!==n[t]&&!(n.overflowY===n.overflowX&&"TEXTAREA"!==e.tagName&&"visible"===n[t])},g=function(e,t){var n=t.ownerDocument,r=t;do{if("undefined"!=typeof ShadowRoot&&r instanceof ShadowRoot&&(r=r.host),y(e,r)){var o=b(e,r);if(o[1]>o[2])return!0}r=r.parentNode}while(r&&r!==n.body);return!1},y=function(e,t){return"v"===e?h(t,"overflowY"):h(t,"overflowX")},b=function(e,t){return"v"===e?[t.scrollTop,t.scrollHeight,t.clientHeight]:[t.scrollLeft,t.scrollWidth,t.clientWidth]},E=function(e,t,n,r,o){var a,i=(a=window.getComputedStyle(t).direction,"h"===e&&"rtl"===a?-1:1),u=i*r,l=n.target,c=t.contains(l),s=!1,d=u>0,f=0,v=0;do{var p=b(e,l),m=p[0],h=p[1]-p[2]-i*m;(m||h)&&y(e,l)&&(f+=h,v+=m),l instanceof ShadowRoot?l=l.host:l=l.parentNode}while(!c&&l!==document.body||c&&(t.contains(l)||t===l));return d&&(o&&1>Math.abs(f)||!o&&u>f)?s=!0:!d&&(o&&1>Math.abs(v)||!o&&-u>v)&&(s=!0),s},w=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},C=function(e){return[e.deltaX,e.deltaY]},N=function(e){return e&&"current"in e?e.current:e},x=0,R=[];let S=(0,s.m)(u,function(e){var t=o.useRef([]),n=o.useRef([0,0]),a=o.useRef(),i=o.useState(x++)[0],u=o.useState(f.T0)[0],l=o.useRef(e);o.useEffect(function(){l.current=e},[e]),o.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(i));var t=(0,r.fX)([e.lockRef.current],(e.shards||[]).map(N),!0).filter(Boolean);return t.forEach(function(e){return e.classList.add("allow-interactivity-".concat(i))}),function(){document.body.classList.remove("block-interactivity-".concat(i)),t.forEach(function(e){return e.classList.remove("allow-interactivity-".concat(i))})}}},[e.inert,e.lockRef.current,e.shards]);var c=o.useCallback(function(e,t){if("touches"in e&&2===e.touches.length||"wheel"===e.type&&e.ctrlKey)return!l.current.allowPinchZoom;var r,o=w(e),i=n.current,u="deltaX"in e?e.deltaX:i[0]-o[0],c="deltaY"in e?e.deltaY:i[1]-o[1],s=e.target,d=Math.abs(u)>Math.abs(c)?"h":"v";if("touches"in e&&"h"===d&&"range"===s.type)return!1;var f=g(d,s);if(!f)return!0;if(f?r=d:(r="v"===d?"h":"v",f=g(d,s)),!f)return!1;if(!a.current&&"changedTouches"in e&&(u||c)&&(a.current=r),!r)return!0;var v=a.current||r;return E(v,t,e,"h"===v?u:c,!0)},[]),s=o.useCallback(function(e){if(R.length&&R[R.length-1]===u){var n="deltaY"in e?C(e):w(e),r=t.current.filter(function(t){var r;return t.name===e.type&&(t.target===e.target||e.target===t.shadowParent)&&(r=t.delta)[0]===n[0]&&r[1]===n[1]})[0];if(r&&r.should){e.cancelable&&e.preventDefault();return}if(!r){var o=(l.current.shards||[]).map(N).filter(Boolean).filter(function(t){return t.contains(e.target)});(o.length>0?c(e,o[0]):!l.current.noIsolation)&&e.cancelable&&e.preventDefault()}}},[]),v=o.useCallback(function(e,n,r,o){var a={name:e,delta:n,target:r,should:o,shadowParent:function(e){for(var t=null;null!==e;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}(r)};t.current.push(a),setTimeout(function(){t.current=t.current.filter(function(e){return e!==a})},1)},[]),p=o.useCallback(function(e){n.current=w(e),a.current=void 0},[]),h=o.useCallback(function(t){v(t.type,C(t),t.target,c(t,e.lockRef.current))},[]),y=o.useCallback(function(t){v(t.type,w(t),t.target,c(t,e.lockRef.current))},[]);o.useEffect(function(){return R.push(u),e.setCallbacks({onScrollCapture:h,onWheelCapture:h,onTouchMoveCapture:y}),document.addEventListener("wheel",s,m),document.addEventListener("touchmove",s,m),document.addEventListener("touchstart",p,m),function(){R=R.filter(function(e){return e!==u}),document.removeEventListener("wheel",s,m),document.removeEventListener("touchmove",s,m),document.removeEventListener("touchstart",p,m)}},[]);var b=e.removeScrollBar,S=e.inert;return o.createElement(o.Fragment,null,S?o.createElement(u,{styles:"\n  .block-interactivity-".concat(i," {pointer-events: none;}\n  .allow-interactivity-").concat(i," {pointer-events: all;}\n")}):null,b?o.createElement(d.jp,{gapMode:e.gapMode}):null)});var A=o.forwardRef(function(e,t){return o.createElement(c,(0,r.Cl)({},e,{ref:t,sideCar:S}))});A.classNames=c.classNames;let D=A},7847:(e,t,n)=>{n.d(t,{T0:()=>u});var r,o=n(4843),a=function(){var e=0,t=null;return{add:function(o){if(0==e&&(t=function(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=r||n.nc;return t&&e.setAttribute("nonce",t),e}())){var a,i;(a=t).styleSheet?a.styleSheet.cssText=o:a.appendChild(document.createTextNode(o)),i=t,(document.head||document.getElementsByTagName("head")[0]).appendChild(i)}e++},remove:function(){--e||!t||(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},i=function(){var e=a();return function(t,n){o.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&n])}},u=function(){var e=i();return function(t){return e(t.styles,t.dynamic),null}}},3611:(e,t,n)=>{n.d(t,{S:()=>u});var r=n(4843);function o(e,t){return"function"==typeof e?e(t):e&&(e.current=t),e}var a="undefined"!=typeof window?r.useLayoutEffect:r.useEffect,i=new WeakMap;function u(e,t){var n,u,l,c=(n=t||null,u=function(t){return e.forEach(function(e){return o(e,t)})},(l=(0,r.useState)(function(){return{value:n,callback:u,facade:{get current(){return l.value},set current(value){var e=l.value;e!==value&&(l.value=value,l.callback(value,e))}}}})[0]).callback=u,l.facade);return a(function(){var t=i.get(c);if(t){var n=new Set(t),r=new Set(e),a=c.current;n.forEach(function(e){r.has(e)||o(e,null)}),r.forEach(function(e){n.has(e)||o(e,a)})}i.set(c,e)},[e]),c}},3949:(e,t,n)=>{n.d(t,{m:()=>i});var r=n(769),o=n(4843),a=function(e){var t=e.sideCar,n=(0,r.Tt)(e,["sideCar"]);if(!t)throw Error("Sidecar: please provide `sideCar` property to import the right car");var a=t.read();if(!a)throw Error("Sidecar medium not found");return o.createElement(a,(0,r.Cl)({},n))};function i(e,t){return e.useMedium(t),a}a.isSideCarExport=!0},7581:(e,t,n)=>{n.d(t,{f:()=>a});var r=n(769);function o(e){return e}function a(e){void 0===e&&(e={});var t,n,a,i=(void 0===t&&(t=o),n=[],a=!1,{read:function(){if(a)throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return n.length?n[n.length-1]:null},useMedium:function(e){var r=t(e,a);return n.push(r),function(){n=n.filter(function(e){return e!==r})}},assignSyncMedium:function(e){for(a=!0;n.length;){var t=n;n=[],t.forEach(e)}n={push:function(t){return e(t)},filter:function(){return n}}},assignMedium:function(e){a=!0;var t=[];if(n.length){var r=n;n=[],r.forEach(e),t=n}var o=function(){var n=t;t=[],n.forEach(e)},i=function(){return Promise.resolve().then(o)};i(),n={push:function(e){t.push(e),i()},filter:function(e){return t=t.filter(e),n}}}});return i.options=(0,r.Cl)({async:!0,ssr:!1},e),i}},5020:(e,t,n)=>{n.d(t,{m:()=>r});function r(e,t,{checkForDefaultPrevented:n=!0}={}){return function(r){if(e?.(r),!1===n||!r.defaultPrevented)return t?.(r)}}},67:(e,t,n)=>{n.d(t,{N:()=>l});var r=n(4843),o=n(5852),a=n(4280),i=n(7881),u=n(4884);function l(e){let t=e+"CollectionProvider",[n,l]=(0,o.A)(t),[c,s]=n(t,{collectionRef:{current:null},itemMap:new Map}),d=e=>{let{scope:t,children:n}=e,o=r.useRef(null),a=r.useRef(new Map).current;return(0,u.jsx)(c,{scope:t,itemMap:a,collectionRef:o,children:n})};d.displayName=t;let f=e+"CollectionSlot",v=r.forwardRef((e,t)=>{let{scope:n,children:r}=e,o=s(f,n),l=(0,a.s)(t,o.collectionRef);return(0,u.jsx)(i.DX,{ref:l,children:r})});v.displayName=f;let p=e+"CollectionItemSlot",m="data-radix-collection-item",h=r.forwardRef((e,t)=>{let{scope:n,children:o,...l}=e,c=r.useRef(null),d=(0,a.s)(t,c),f=s(p,n);return r.useEffect(()=>(f.itemMap.set(c,{ref:c,...l}),()=>void f.itemMap.delete(c))),(0,u.jsx)(i.DX,{[m]:"",ref:d,children:o})});return h.displayName=p,[{Provider:d,Slot:v,ItemSlot:h},function(t){let n=s(e+"CollectionConsumer",t);return r.useCallback(()=>{let e=n.collectionRef.current;if(!e)return[];let t=Array.from(e.querySelectorAll("[".concat(m,"]")));return Array.from(n.itemMap.values()).sort((e,n)=>t.indexOf(e.ref.current)-t.indexOf(n.ref.current))},[n.collectionRef,n.itemMap])},l]}},5852:(e,t,n)=>{n.d(t,{A:()=>i,q:()=>a});var r=n(4843),o=n(4884);function a(e,t){let n=r.createContext(t),a=e=>{let{children:t,...a}=e,i=r.useMemo(()=>a,Object.values(a));return(0,o.jsx)(n.Provider,{value:i,children:t})};return a.displayName=e+"Provider",[a,function(o){let a=r.useContext(n);if(a)return a;if(void 0!==t)return t;throw Error(`\`${o}\` must be used within \`${e}\``)}]}function i(e,t=[]){let n=[],a=()=>{let t=n.map(e=>r.createContext(e));return function(n){let o=n?.[e]||t;return r.useMemo(()=>({[`__scope${e}`]:{...n,[e]:o}}),[n,o])}};return a.scopeName=e,[function(t,a){let i=r.createContext(a),u=n.length;n=[...n,a];let l=t=>{let{scope:n,children:a,...l}=t,c=n?.[e]?.[u]||i,s=r.useMemo(()=>l,Object.values(l));return(0,o.jsx)(c.Provider,{value:s,children:a})};return l.displayName=t+"Provider",[l,function(n,o){let l=o?.[e]?.[u]||i,c=r.useContext(l);if(c)return c;if(void 0!==a)return a;throw Error(`\`${n}\` must be used within \`${t}\``)}]},function(...e){let t=e[0];if(1===e.length)return t;let n=()=>{let n=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let o=n.reduce((t,{useScope:n,scopeName:r})=>{let o=n(e)[`__scope${r}`];return{...t,...o}},{});return r.useMemo(()=>({[`__scope${t.scopeName}`]:o}),[o])}};return n.scopeName=t.scopeName,n}(a,...t)]}},2723:(e,t,n)=>{n.d(t,{UC:()=>et,VY:()=>er,ZL:()=>Q,bL:()=>V,bm:()=>eo,hE:()=>en,hJ:()=>ee,l9:()=>J});var r=n(4843),o=n(5020),a=n(4280),i=n(5852),u=n(2137),l=n(7765),c=n(3852),s=n(5332),d=n(4220),f=n(8397),v=n(5835),p=n(3704),m=n(4581),h=n(952),g=n(7881),y=n(4884),b="Dialog",[E,w]=(0,i.A)(b),[C,N]=E(b),x=e=>{let{__scopeDialog:t,children:n,open:o,defaultOpen:a,onOpenChange:i,modal:c=!0}=e,s=r.useRef(null),d=r.useRef(null),[f=!1,v]=(0,l.i)({prop:o,defaultProp:a,onChange:i});return(0,y.jsx)(C,{scope:t,triggerRef:s,contentRef:d,contentId:(0,u.B)(),titleId:(0,u.B)(),descriptionId:(0,u.B)(),open:f,onOpenChange:v,onOpenToggle:r.useCallback(()=>v(e=>!e),[v]),modal:c,children:n})};x.displayName=b;var R="DialogTrigger",S=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=N(R,n),u=(0,a.s)(t,i.triggerRef);return(0,y.jsx)(v.sG.button,{type:"button","aria-haspopup":"dialog","aria-expanded":i.open,"aria-controls":i.contentId,"data-state":q(i.open),...r,ref:u,onClick:(0,o.m)(e.onClick,i.onOpenToggle)})});S.displayName=R;var A="DialogPortal",[D,M]=E(A,{forceMount:void 0}),T=e=>{let{__scopeDialog:t,forceMount:n,children:o,container:a}=e,i=N(A,t);return(0,y.jsx)(D,{scope:t,forceMount:n,children:r.Children.map(o,e=>(0,y.jsx)(f.C,{present:n||i.open,children:(0,y.jsx)(d.Z,{asChild:!0,container:a,children:e})}))})};T.displayName=A;var O="DialogOverlay",P=r.forwardRef((e,t)=>{let n=M(O,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=N(O,e.__scopeDialog);return a.modal?(0,y.jsx)(f.C,{present:r||a.open,children:(0,y.jsx)(L,{...o,ref:t})}):null});P.displayName=O;var L=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=N(O,n);return(0,y.jsx)(m.A,{as:g.DX,allowPinchZoom:!0,shards:[o.contentRef],children:(0,y.jsx)(v.sG.div,{"data-state":q(o.open),...r,ref:t,style:{pointerEvents:"auto",...r.style}})})}),I="DialogContent",j=r.forwardRef((e,t)=>{let n=M(I,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=N(I,e.__scopeDialog);return(0,y.jsx)(f.C,{present:r||a.open,children:a.modal?(0,y.jsx)(k,{...o,ref:t}):(0,y.jsx)(F,{...o,ref:t})})});j.displayName=I;var k=r.forwardRef((e,t)=>{let n=N(I,e.__scopeDialog),i=r.useRef(null),u=(0,a.s)(t,n.contentRef,i);return r.useEffect(()=>{let e=i.current;if(e)return(0,h.Eq)(e)},[]),(0,y.jsx)(_,{...e,ref:u,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,o.m)(e.onCloseAutoFocus,e=>{var t;e.preventDefault(),null===(t=n.triggerRef.current)||void 0===t||t.focus()}),onPointerDownOutside:(0,o.m)(e.onPointerDownOutside,e=>{let t=e.detail.originalEvent,n=0===t.button&&!0===t.ctrlKey;(2===t.button||n)&&e.preventDefault()}),onFocusOutside:(0,o.m)(e.onFocusOutside,e=>e.preventDefault())})}),F=r.forwardRef((e,t)=>{let n=N(I,e.__scopeDialog),o=r.useRef(!1),a=r.useRef(!1);return(0,y.jsx)(_,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:t=>{var r,i;null===(r=e.onCloseAutoFocus)||void 0===r||r.call(e,t),t.defaultPrevented||(o.current||null===(i=n.triggerRef.current)||void 0===i||i.focus(),t.preventDefault()),o.current=!1,a.current=!1},onInteractOutside:t=>{var r,i;null===(r=e.onInteractOutside)||void 0===r||r.call(e,t),t.defaultPrevented||(o.current=!0,"pointerdown"!==t.detail.originalEvent.type||(a.current=!0));let u=t.target;(null===(i=n.triggerRef.current)||void 0===i?void 0:i.contains(u))&&t.preventDefault(),"focusin"===t.detail.originalEvent.type&&a.current&&t.preventDefault()}})}),_=r.forwardRef((e,t)=>{let{__scopeDialog:n,trapFocus:o,onOpenAutoFocus:i,onCloseAutoFocus:u,...l}=e,d=N(I,n),f=r.useRef(null),v=(0,a.s)(t,f);return(0,p.Oh)(),(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(s.n,{asChild:!0,loop:!0,trapped:o,onMountAutoFocus:i,onUnmountAutoFocus:u,children:(0,y.jsx)(c.qW,{role:"dialog",id:d.contentId,"aria-describedby":d.descriptionId,"aria-labelledby":d.titleId,"data-state":q(d.open),...l,ref:v,onDismiss:()=>d.onOpenChange(!1)})}),(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(Z,{titleId:d.titleId}),(0,y.jsx)(z,{contentRef:f,descriptionId:d.descriptionId})]})]})}),W="DialogTitle",B=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=N(W,n);return(0,y.jsx)(v.sG.h2,{id:o.titleId,...r,ref:t})});B.displayName=W;var U="DialogDescription",G=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=N(U,n);return(0,y.jsx)(v.sG.p,{id:o.descriptionId,...r,ref:t})});G.displayName=U;var K="DialogClose",X=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,a=N(K,n);return(0,y.jsx)(v.sG.button,{type:"button",...r,ref:t,onClick:(0,o.m)(e.onClick,()=>a.onOpenChange(!1))})});function q(e){return e?"open":"closed"}X.displayName=K;var $="DialogTitleWarning",[H,Y]=(0,i.q)($,{contentName:I,titleName:W,docsSlug:"dialog"}),Z=e=>{let{titleId:t}=e,n=Y($),o="`".concat(n.contentName,"` requires a `").concat(n.titleName,"` for the component to be accessible for screen reader users.\n\nIf you want to hide the `").concat(n.titleName,"`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/").concat(n.docsSlug);return r.useEffect(()=>{t&&!document.getElementById(t)&&console.error(o)},[o,t]),null},z=e=>{let{contentRef:t,descriptionId:n}=e,o=Y("DialogDescriptionWarning"),a="Warning: Missing `Description` or `aria-describedby={undefined}` for {".concat(o.contentName,"}.");return r.useEffect(()=>{var e;let r=null===(e=t.current)||void 0===e?void 0:e.getAttribute("aria-describedby");n&&r&&!document.getElementById(n)&&console.warn(a)},[a,t,n]),null},V=x,J=S,Q=T,ee=P,et=j,en=B,er=G,eo=X},2467:(e,t,n)=>{n.d(t,{jH:()=>a});var r=n(4843);n(4884);var o=r.createContext(void 0);function a(e){let t=r.useContext(o);return e||t||"ltr"}},3852:(e,t,n)=>{n.d(t,{qW:()=>f});var r,o=n(4843),a=n(5020),i=n(5835),u=n(4280),l=n(9661),c=n(4884),s="dismissableLayer.update",d=o.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),f=o.forwardRef((e,t)=>{var n,f;let{disableOutsidePointerEvents:m=!1,onEscapeKeyDown:h,onPointerDownOutside:g,onFocusOutside:y,onInteractOutside:b,onDismiss:E,...w}=e,C=o.useContext(d),[N,x]=o.useState(null),R=null!==(f=null==N?void 0:N.ownerDocument)&&void 0!==f?f:null===(n=globalThis)||void 0===n?void 0:n.document,[,S]=o.useState({}),A=(0,u.s)(t,e=>x(e)),D=Array.from(C.layers),[M]=[...C.layersWithOutsidePointerEventsDisabled].slice(-1),T=D.indexOf(M),O=N?D.indexOf(N):-1,P=C.layersWithOutsidePointerEventsDisabled.size>0,L=O>=T,I=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,l.c)(e),a=o.useRef(!1),i=o.useRef(()=>{});return o.useEffect(()=>{let e=e=>{if(e.target&&!a.current){let t=function(){p("dismissableLayer.pointerDownOutside",r,o,{discrete:!0})},o={originalEvent:e};"touch"===e.pointerType?(n.removeEventListener("click",i.current),i.current=t,n.addEventListener("click",i.current,{once:!0})):t()}else n.removeEventListener("click",i.current);a.current=!1},t=window.setTimeout(()=>{n.addEventListener("pointerdown",e)},0);return()=>{window.clearTimeout(t),n.removeEventListener("pointerdown",e),n.removeEventListener("click",i.current)}},[n,r]),{onPointerDownCapture:()=>a.current=!0}}(e=>{let t=e.target,n=[...C.branches].some(e=>e.contains(t));!L||n||(null==g||g(e),null==b||b(e),e.defaultPrevented||null==E||E())},R),j=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,l.c)(e),a=o.useRef(!1);return o.useEffect(()=>{let e=e=>{e.target&&!a.current&&p("dismissableLayer.focusOutside",r,{originalEvent:e},{discrete:!1})};return n.addEventListener("focusin",e),()=>n.removeEventListener("focusin",e)},[n,r]),{onFocusCapture:()=>a.current=!0,onBlurCapture:()=>a.current=!1}}(e=>{let t=e.target;[...C.branches].some(e=>e.contains(t))||(null==y||y(e),null==b||b(e),e.defaultPrevented||null==E||E())},R);return!function(e,t=globalThis?.document){let n=(0,l.c)(e);o.useEffect(()=>{let e=e=>{"Escape"===e.key&&n(e)};return t.addEventListener("keydown",e,{capture:!0}),()=>t.removeEventListener("keydown",e,{capture:!0})},[n,t])}(e=>{O!==C.layers.size-1||(null==h||h(e),!e.defaultPrevented&&E&&(e.preventDefault(),E()))},R),o.useEffect(()=>{if(N)return m&&(0===C.layersWithOutsidePointerEventsDisabled.size&&(r=R.body.style.pointerEvents,R.body.style.pointerEvents="none"),C.layersWithOutsidePointerEventsDisabled.add(N)),C.layers.add(N),v(),()=>{m&&1===C.layersWithOutsidePointerEventsDisabled.size&&(R.body.style.pointerEvents=r)}},[N,R,m,C]),o.useEffect(()=>()=>{N&&(C.layers.delete(N),C.layersWithOutsidePointerEventsDisabled.delete(N),v())},[N,C]),o.useEffect(()=>{let e=()=>S({});return document.addEventListener(s,e),()=>document.removeEventListener(s,e)},[]),(0,c.jsx)(i.sG.div,{...w,ref:A,style:{pointerEvents:P?L?"auto":"none":void 0,...e.style},onFocusCapture:(0,a.m)(e.onFocusCapture,j.onFocusCapture),onBlurCapture:(0,a.m)(e.onBlurCapture,j.onBlurCapture),onPointerDownCapture:(0,a.m)(e.onPointerDownCapture,I.onPointerDownCapture)})});function v(){let e=new CustomEvent(s);document.dispatchEvent(e)}function p(e,t,n,r){let{discrete:o}=r,a=n.originalEvent.target,u=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:n});t&&a.addEventListener(e,t,{once:!0}),o?(0,i.hO)(a,u):a.dispatchEvent(u)}f.displayName="DismissableLayer",o.forwardRef((e,t)=>{let n=o.useContext(d),r=o.useRef(null),a=(0,u.s)(t,r);return o.useEffect(()=>{let e=r.current;if(e)return n.branches.add(e),()=>{n.branches.delete(e)}},[n.branches]),(0,c.jsx)(i.sG.div,{...e,ref:a})}).displayName="DismissableLayerBranch"},3704:(e,t,n)=>{n.d(t,{Oh:()=>a});var r=n(4843),o=0;function a(){r.useEffect(()=>{var e,t;let n=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",null!==(e=n[0])&&void 0!==e?e:i()),document.body.insertAdjacentElement("beforeend",null!==(t=n[1])&&void 0!==t?t:i()),o++,()=>{1===o&&document.querySelectorAll("[data-radix-focus-guard]").forEach(e=>e.remove()),o--}},[])}function i(){let e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}},5332:(e,t,n)=>{n.d(t,{n:()=>d});var r=n(4843),o=n(4280),a=n(5835),i=n(9661),u=n(4884),l="focusScope.autoFocusOnMount",c="focusScope.autoFocusOnUnmount",s={bubbles:!1,cancelable:!0},d=r.forwardRef((e,t)=>{let{loop:n=!1,trapped:d=!1,onMountAutoFocus:h,onUnmountAutoFocus:g,...y}=e,[b,E]=r.useState(null),w=(0,i.c)(h),C=(0,i.c)(g),N=r.useRef(null),x=(0,o.s)(t,e=>E(e)),R=r.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;r.useEffect(()=>{if(d){let e=function(e){if(R.paused||!b)return;let t=e.target;b.contains(t)?N.current=t:p(N.current,{select:!0})},t=function(e){if(R.paused||!b)return;let t=e.relatedTarget;null===t||b.contains(t)||p(N.current,{select:!0})};document.addEventListener("focusin",e),document.addEventListener("focusout",t);let n=new MutationObserver(function(e){if(document.activeElement===document.body)for(let t of e)t.removedNodes.length>0&&p(b)});return b&&n.observe(b,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",e),document.removeEventListener("focusout",t),n.disconnect()}}},[d,b,R.paused]),r.useEffect(()=>{if(b){m.add(R);let e=document.activeElement;if(!b.contains(e)){let t=new CustomEvent(l,s);b.addEventListener(l,w),b.dispatchEvent(t),t.defaultPrevented||(function(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=document.activeElement;for(let r of e)if(p(r,{select:t}),document.activeElement!==n)return}(f(b).filter(e=>"A"!==e.tagName),{select:!0}),document.activeElement===e&&p(b))}return()=>{b.removeEventListener(l,w),setTimeout(()=>{let t=new CustomEvent(c,s);b.addEventListener(c,C),b.dispatchEvent(t),t.defaultPrevented||p(null!=e?e:document.body,{select:!0}),b.removeEventListener(c,C),m.remove(R)},0)}}},[b,w,C,R]);let S=r.useCallback(e=>{if(!n&&!d||R.paused)return;let t="Tab"===e.key&&!e.altKey&&!e.ctrlKey&&!e.metaKey,r=document.activeElement;if(t&&r){let t=e.currentTarget,[o,a]=function(e){let t=f(e);return[v(t,e),v(t.reverse(),e)]}(t);o&&a?e.shiftKey||r!==a?e.shiftKey&&r===o&&(e.preventDefault(),n&&p(a,{select:!0})):(e.preventDefault(),n&&p(o,{select:!0})):r===t&&e.preventDefault()}},[n,d,R.paused]);return(0,u.jsx)(a.sG.div,{tabIndex:-1,...y,ref:x,onKeyDown:S})});function f(e){let t=[],n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>{let t="INPUT"===e.tagName&&"hidden"===e.type;return e.disabled||e.hidden||t?NodeFilter.FILTER_SKIP:e.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;n.nextNode();)t.push(n.currentNode);return t}function v(e,t){for(let n of e)if(!function(e,t){let{upTo:n}=t;if("hidden"===getComputedStyle(e).visibility)return!0;for(;e&&(void 0===n||e!==n);){if("none"===getComputedStyle(e).display)return!0;e=e.parentElement}return!1}(n,{upTo:t}))return n}function p(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(e&&e.focus){var n;let r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&(n=e)instanceof HTMLInputElement&&"select"in n&&t&&e.select()}}d.displayName="FocusScope";var m=function(){let e=[];return{add(t){let n=e[0];t!==n&&(null==n||n.pause()),(e=h(e,t)).unshift(t)},remove(t){var n;null===(n=(e=h(e,t))[0])||void 0===n||n.resume()}}}();function h(e,t){let n=[...e],r=n.indexOf(t);return -1!==r&&n.splice(r,1),n}},2137:(e,t,n)=>{n.d(t,{B:()=>l});var r,o=n(4843),a=n(267),i=(r||(r=n.t(o,2)))["useId".toString()]||(()=>void 0),u=0;function l(e){let[t,n]=o.useState(i());return(0,a.N)(()=>{e||n(e=>e??String(u++))},[e]),e||(t?`radix-${t}`:"")}},4220:(e,t,n)=>{n.d(t,{Z:()=>l});var r=n(4843),o=n(6537),a=n(5835),i=n(267),u=n(4884),l=r.forwardRef((e,t)=>{var n,l;let{container:c,...s}=e,[d,f]=r.useState(!1);(0,i.N)(()=>f(!0),[]);let v=c||d&&(null===(l=globalThis)||void 0===l?void 0:null===(n=l.document)||void 0===n?void 0:n.body);return v?o.createPortal((0,u.jsx)(a.sG.div,{...s,ref:t}),v):null});l.displayName="Portal"},8397:(e,t,n)=>{n.d(t,{C:()=>i});var r=n(4843),o=n(4280),a=n(267),i=e=>{let{present:t,children:n}=e,i=function(e){var t,n;let[o,i]=r.useState(),l=r.useRef({}),c=r.useRef(e),s=r.useRef("none"),[d,f]=(t=e?"mounted":"unmounted",n={mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}},r.useReducer((e,t)=>{let r=n[e][t];return null!=r?r:e},t));return r.useEffect(()=>{let e=u(l.current);s.current="mounted"===d?e:"none"},[d]),(0,a.N)(()=>{let t=l.current,n=c.current;if(n!==e){let r=s.current,o=u(t);e?f("MOUNT"):"none"===o||(null==t?void 0:t.display)==="none"?f("UNMOUNT"):n&&r!==o?f("ANIMATION_OUT"):f("UNMOUNT"),c.current=e}},[e,f]),(0,a.N)(()=>{if(o){var e;let t;let n=null!==(e=o.ownerDocument.defaultView)&&void 0!==e?e:window,r=e=>{let r=u(l.current).includes(e.animationName);if(e.target===o&&r&&(f("ANIMATION_END"),!c.current)){let e=o.style.animationFillMode;o.style.animationFillMode="forwards",t=n.setTimeout(()=>{"forwards"===o.style.animationFillMode&&(o.style.animationFillMode=e)})}},a=e=>{e.target===o&&(s.current=u(l.current))};return o.addEventListener("animationstart",a),o.addEventListener("animationcancel",r),o.addEventListener("animationend",r),()=>{n.clearTimeout(t),o.removeEventListener("animationstart",a),o.removeEventListener("animationcancel",r),o.removeEventListener("animationend",r)}}f("ANIMATION_END")},[o,f]),{isPresent:["mounted","unmountSuspended"].includes(d),ref:r.useCallback(e=>{e&&(l.current=getComputedStyle(e)),i(e)},[])}}(t),l="function"==typeof n?n({present:i.isPresent}):r.Children.only(n),c=(0,o.s)(i.ref,function(e){var t,n;let r=null===(t=Object.getOwnPropertyDescriptor(e.props,"ref"))||void 0===t?void 0:t.get,o=r&&"isReactWarning"in r&&r.isReactWarning;return o?e.ref:(o=(r=null===(n=Object.getOwnPropertyDescriptor(e,"ref"))||void 0===n?void 0:n.get)&&"isReactWarning"in r&&r.isReactWarning)?e.props.ref:e.props.ref||e.ref}(l));return"function"==typeof n||i.isPresent?r.cloneElement(l,{ref:c}):null};function u(e){return(null==e?void 0:e.animationName)||"none"}i.displayName="Presence"},5835:(e,t,n)=>{n.d(t,{hO:()=>l,sG:()=>u});var r=n(4843),o=n(6537),a=n(7881),i=n(4884),u=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let n=r.forwardRef((e,n)=>{let{asChild:r,...o}=e,u=r?a.DX:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,i.jsx)(u,{...o,ref:n})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function l(e,t){e&&o.flushSync(()=>e.dispatchEvent(t))}},8901:(e,t,n)=>{n.d(t,{RG:()=>w,bL:()=>T,q7:()=>O});var r=n(4843),o=n(5020),a=n(67),i=n(4280),u=n(5852),l=n(2137),c=n(5835),s=n(9661),d=n(7765),f=n(2467),v=n(4884),p="rovingFocusGroup.onEntryFocus",m={bubbles:!1,cancelable:!0},h="RovingFocusGroup",[g,y,b]=(0,a.N)(h),[E,w]=(0,u.A)(h,[b]),[C,N]=E(h),x=r.forwardRef((e,t)=>(0,v.jsx)(g.Provider,{scope:e.__scopeRovingFocusGroup,children:(0,v.jsx)(g.Slot,{scope:e.__scopeRovingFocusGroup,children:(0,v.jsx)(R,{...e,ref:t})})}));x.displayName=h;var R=r.forwardRef((e,t)=>{let{__scopeRovingFocusGroup:n,orientation:a,loop:u=!1,dir:l,currentTabStopId:h,defaultCurrentTabStopId:g,onCurrentTabStopIdChange:b,onEntryFocus:E,preventScrollOnEntryFocus:w=!1,...N}=e,x=r.useRef(null),R=(0,i.s)(t,x),S=(0,f.jH)(l),[A=null,D]=(0,d.i)({prop:h,defaultProp:g,onChange:b}),[T,O]=r.useState(!1),P=(0,s.c)(E),L=y(n),I=r.useRef(!1),[j,k]=r.useState(0);return r.useEffect(()=>{let e=x.current;if(e)return e.addEventListener(p,P),()=>e.removeEventListener(p,P)},[P]),(0,v.jsx)(C,{scope:n,orientation:a,dir:S,loop:u,currentTabStopId:A,onItemFocus:r.useCallback(e=>D(e),[D]),onItemShiftTab:r.useCallback(()=>O(!0),[]),onFocusableItemAdd:r.useCallback(()=>k(e=>e+1),[]),onFocusableItemRemove:r.useCallback(()=>k(e=>e-1),[]),children:(0,v.jsx)(c.sG.div,{tabIndex:T||0===j?-1:0,"data-orientation":a,...N,ref:R,style:{outline:"none",...e.style},onMouseDown:(0,o.m)(e.onMouseDown,()=>{I.current=!0}),onFocus:(0,o.m)(e.onFocus,e=>{let t=!I.current;if(e.target===e.currentTarget&&t&&!T){let t=new CustomEvent(p,m);if(e.currentTarget.dispatchEvent(t),!t.defaultPrevented){let e=L().filter(e=>e.focusable);M([e.find(e=>e.active),e.find(e=>e.id===A),...e].filter(Boolean).map(e=>e.ref.current),w)}}I.current=!1}),onBlur:(0,o.m)(e.onBlur,()=>O(!1))})})}),S="RovingFocusGroupItem",A=r.forwardRef((e,t)=>{let{__scopeRovingFocusGroup:n,focusable:a=!0,active:i=!1,tabStopId:u,...s}=e,d=(0,l.B)(),f=u||d,p=N(S,n),m=p.currentTabStopId===f,h=y(n),{onFocusableItemAdd:b,onFocusableItemRemove:E}=p;return r.useEffect(()=>{if(a)return b(),()=>E()},[a,b,E]),(0,v.jsx)(g.ItemSlot,{scope:n,id:f,focusable:a,active:i,children:(0,v.jsx)(c.sG.span,{tabIndex:m?0:-1,"data-orientation":p.orientation,...s,ref:t,onMouseDown:(0,o.m)(e.onMouseDown,e=>{a?p.onItemFocus(f):e.preventDefault()}),onFocus:(0,o.m)(e.onFocus,()=>p.onItemFocus(f)),onKeyDown:(0,o.m)(e.onKeyDown,e=>{if("Tab"===e.key&&e.shiftKey){p.onItemShiftTab();return}if(e.target!==e.currentTarget)return;let t=function(e,t,n){var r;let o=(r=e.key,"rtl"!==n?r:"ArrowLeft"===r?"ArrowRight":"ArrowRight"===r?"ArrowLeft":r);if(!("vertical"===t&&["ArrowLeft","ArrowRight"].includes(o))&&!("horizontal"===t&&["ArrowUp","ArrowDown"].includes(o)))return D[o]}(e,p.orientation,p.dir);if(void 0!==t){if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();let n=h().filter(e=>e.focusable).map(e=>e.ref.current);if("last"===t)n.reverse();else if("prev"===t||"next"===t){"prev"===t&&n.reverse();let r=n.indexOf(e.currentTarget);n=p.loop?function(e,t){return e.map((n,r)=>e[(t+r)%e.length])}(n,r+1):n.slice(r+1)}setTimeout(()=>M(n))}})})})});A.displayName=S;var D={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function M(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=document.activeElement;for(let r of e)if(r===n||(r.focus({preventScroll:t}),document.activeElement!==n))return}var T=x,O=A},9661:(e,t,n)=>{n.d(t,{c:()=>o});var r=n(4843);function o(e){let t=r.useRef(e);return r.useEffect(()=>{t.current=e}),r.useMemo(()=>(...e)=>t.current?.(...e),[])}},7765:(e,t,n)=>{n.d(t,{i:()=>a});var r=n(4843),o=n(9661);function a({prop:e,defaultProp:t,onChange:n=()=>{}}){let[a,i]=function({defaultProp:e,onChange:t}){let n=r.useState(e),[a]=n,i=r.useRef(a),u=(0,o.c)(t);return r.useEffect(()=>{i.current!==a&&(u(a),i.current=a)},[a,i,u]),n}({defaultProp:t,onChange:n}),u=void 0!==e,l=u?e:a,c=(0,o.c)(n);return[l,r.useCallback(t=>{if(u){let n="function"==typeof t?t(e):t;n!==e&&c(n)}else i(t)},[u,e,i,c])]}},267:(e,t,n)=>{n.d(t,{N:()=>o});var r=n(4843),o=globalThis?.document?r.useLayoutEffect:()=>{}},769:(e,t,n)=>{n.d(t,{Cl:()=>r,Tt:()=>o,fX:()=>a});var r=function(){return(r=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function o(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);return n}function a(e,t,n){if(n||2==arguments.length)for(var r,o=0,a=t.length;o<a;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}Object.create,Object.create,"function"==typeof SuppressedError&&SuppressedError}}]);