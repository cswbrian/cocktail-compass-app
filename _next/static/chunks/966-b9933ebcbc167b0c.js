"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[966],{952:(e,t,n)=>{n.d(t,{Eq:()=>l});var r=new WeakMap,o=new WeakMap,a={},i=0,u=function(e){return e&&(e.host||u(e.parentNode))},c=function(e,t,n,c){var l=(Array.isArray(e)?e:[e]).map(function(e){if(t.contains(e))return e;var n=u(e);return n&&t.contains(n)?n:(console.error("aria-hidden",e,"in not contained inside",t,". Doing nothing"),null)}).filter(function(e){return!!e});a[n]||(a[n]=new WeakMap);var s=a[n],d=[],f=new Set,v=new Set(l),p=function(e){!e||f.has(e)||(f.add(e),p(e.parentNode))};l.forEach(p);var m=function(e){!e||v.has(e)||Array.prototype.forEach.call(e.children,function(e){if(f.has(e))m(e);else try{var t=e.getAttribute(c),a=null!==t&&"false"!==t,i=(r.get(e)||0)+1,u=(s.get(e)||0)+1;r.set(e,i),s.set(e,u),d.push(e),1===i&&a&&o.set(e,!0),1===u&&e.setAttribute(n,"true"),a||e.setAttribute(c,"true")}catch(t){console.error("aria-hidden: cannot operate on ",e,t)}})};return m(t),f.clear(),i++,function(){d.forEach(function(e){var t=r.get(e)-1,a=s.get(e)-1;r.set(e,t),s.set(e,a),t||(o.has(e)||e.removeAttribute(c),o.delete(e)),a||e.removeAttribute(n)}),--i||(r=new WeakMap,r=new WeakMap,o=new WeakMap,a={})}},l=function(e,t,n){void 0===n&&(n="data-aria-hidden");var r,o=Array.from(Array.isArray(e)?e:[e]),a=t||(r=e,"undefined"==typeof document?null:(Array.isArray(r)?r[0]:r).ownerDocument.body);return a?(o.push.apply(o,Array.from(a.querySelectorAll("[aria-live]"))),c(o,a,n,"aria-hidden")):function(){return null}}},4766:(e,t,n)=>{n.d(t,{A:()=>r});let r=(0,n(4507).A)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},9313:(e,t,n)=>{n.d(t,{E9:()=>a,Mi:()=>r,pN:()=>o,xi:()=>i});var r="right-scroll-bar-position",o="width-before-scroll-bar",a="with-scroll-bars-hidden",i="--removed-body-scroll-bar-size"},4346:(e,t,n)=>{n.d(t,{jp:()=>m});var r=n(4843),o=n(7847),a=n(9313),i={left:0,top:0,right:0,gap:0},u=function(e){return parseInt(e||"",10)||0},c=function(e){var t=window.getComputedStyle(document.body),n=t["padding"===e?"paddingLeft":"marginLeft"],r=t["padding"===e?"paddingTop":"marginTop"],o=t["padding"===e?"paddingRight":"marginRight"];return[u(n),u(r),u(o)]},l=function(e){if(void 0===e&&(e="margin"),"undefined"==typeof window)return i;var t=c(e),n=document.documentElement.clientWidth,r=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,r-n+t[2]-t[0])}},s=(0,o.T0)(),d="data-scroll-locked",f=function(e,t,n,r){var o=e.left,i=e.top,u=e.right,c=e.gap;return void 0===n&&(n="margin"),"\n  .".concat(a.E9," {\n   overflow: hidden ").concat(r,";\n   padding-right: ").concat(c,"px ").concat(r,";\n  }\n  body[").concat(d,"] {\n    overflow: hidden ").concat(r,";\n    overscroll-behavior: contain;\n    ").concat([t&&"position: relative ".concat(r,";"),"margin"===n&&"\n    padding-left: ".concat(o,"px;\n    padding-top: ").concat(i,"px;\n    padding-right: ").concat(u,"px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(c,"px ").concat(r,";\n    "),"padding"===n&&"padding-right: ".concat(c,"px ").concat(r,";")].filter(Boolean).join(""),"\n  }\n  \n  .").concat(a.Mi," {\n    right: ").concat(c,"px ").concat(r,";\n  }\n  \n  .").concat(a.pN," {\n    margin-right: ").concat(c,"px ").concat(r,";\n  }\n  \n  .").concat(a.Mi," .").concat(a.Mi," {\n    right: 0 ").concat(r,";\n  }\n  \n  .").concat(a.pN," .").concat(a.pN," {\n    margin-right: 0 ").concat(r,";\n  }\n  \n  body[").concat(d,"] {\n    ").concat(a.xi,": ").concat(c,"px;\n  }\n")},v=function(){var e=parseInt(document.body.getAttribute(d)||"0",10);return isFinite(e)?e:0},p=function(){r.useEffect(function(){return document.body.setAttribute(d,(v()+1).toString()),function(){var e=v()-1;e<=0?document.body.removeAttribute(d):document.body.setAttribute(d,e.toString())}},[])},m=function(e){var t=e.noRelative,n=e.noImportant,o=e.gapMode,a=void 0===o?"margin":o;p();var i=r.useMemo(function(){return l(a)},[a]);return r.createElement(s,{styles:f(i,!t,a,n?"":"!important")})}},4581:(e,t,n)=>{n.d(t,{A:()=>L});var r=n(769),o=n(4843),a=n(9313),i=n(3611),u=(0,n(7581).f)(),c=function(){},l=o.forwardRef(function(e,t){var n=o.useRef(null),a=o.useState({onScrollCapture:c,onWheelCapture:c,onTouchMoveCapture:c}),l=a[0],s=a[1],d=e.forwardProps,f=e.children,v=e.className,p=e.removeScrollBar,m=e.enabled,h=e.shards,g=e.sideCar,y=e.noIsolation,E=e.inert,b=e.allowPinchZoom,w=e.as,C=e.gapMode,x=(0,r.Tt)(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),R=(0,i.S)([n,t]),D=(0,r.Cl)((0,r.Cl)({},x),l);return o.createElement(o.Fragment,null,m&&o.createElement(g,{sideCar:u,removeScrollBar:p,shards:h,noIsolation:y,inert:E,setCallbacks:s,allowPinchZoom:!!b,lockRef:n,gapMode:C}),d?o.cloneElement(o.Children.only(f),(0,r.Cl)((0,r.Cl)({},D),{ref:R})):o.createElement(void 0===w?"div":w,(0,r.Cl)({},D,{className:v,ref:R}),f))});l.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1},l.classNames={fullWidth:a.pN,zeroRight:a.Mi};var s=n(3949),d=n(4346),f=n(7847),v=!1;if("undefined"!=typeof window)try{var p=Object.defineProperty({},"passive",{get:function(){return v=!0,!0}});window.addEventListener("test",p,p),window.removeEventListener("test",p,p)}catch(e){v=!1}var m=!!v&&{passive:!1},h=function(e,t){if(!(e instanceof Element))return!1;var n=window.getComputedStyle(e);return"hidden"!==n[t]&&!(n.overflowY===n.overflowX&&"TEXTAREA"!==e.tagName&&"visible"===n[t])},g=function(e,t){var n=t.ownerDocument,r=t;do{if("undefined"!=typeof ShadowRoot&&r instanceof ShadowRoot&&(r=r.host),y(e,r)){var o=E(e,r);if(o[1]>o[2])return!0}r=r.parentNode}while(r&&r!==n.body);return!1},y=function(e,t){return"v"===e?h(t,"overflowY"):h(t,"overflowX")},E=function(e,t){return"v"===e?[t.scrollTop,t.scrollHeight,t.clientHeight]:[t.scrollLeft,t.scrollWidth,t.clientWidth]},b=function(e,t,n,r,o){var a,i=(a=window.getComputedStyle(t).direction,"h"===e&&"rtl"===a?-1:1),u=i*r,c=n.target,l=t.contains(c),s=!1,d=u>0,f=0,v=0;do{var p=E(e,c),m=p[0],h=p[1]-p[2]-i*m;(m||h)&&y(e,c)&&(f+=h,v+=m),c instanceof ShadowRoot?c=c.host:c=c.parentNode}while(!l&&c!==document.body||l&&(t.contains(c)||t===c));return d&&(o&&1>Math.abs(f)||!o&&u>f)?s=!0:!d&&(o&&1>Math.abs(v)||!o&&-u>v)&&(s=!0),s},w=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},C=function(e){return[e.deltaX,e.deltaY]},x=function(e){return e&&"current"in e?e.current:e},R=0,D=[];let N=(0,s.m)(u,function(e){var t=o.useRef([]),n=o.useRef([0,0]),a=o.useRef(),i=o.useState(R++)[0],u=o.useState(f.T0)[0],c=o.useRef(e);o.useEffect(function(){c.current=e},[e]),o.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(i));var t=(0,r.fX)([e.lockRef.current],(e.shards||[]).map(x),!0).filter(Boolean);return t.forEach(function(e){return e.classList.add("allow-interactivity-".concat(i))}),function(){document.body.classList.remove("block-interactivity-".concat(i)),t.forEach(function(e){return e.classList.remove("allow-interactivity-".concat(i))})}}},[e.inert,e.lockRef.current,e.shards]);var l=o.useCallback(function(e,t){if("touches"in e&&2===e.touches.length||"wheel"===e.type&&e.ctrlKey)return!c.current.allowPinchZoom;var r,o=w(e),i=n.current,u="deltaX"in e?e.deltaX:i[0]-o[0],l="deltaY"in e?e.deltaY:i[1]-o[1],s=e.target,d=Math.abs(u)>Math.abs(l)?"h":"v";if("touches"in e&&"h"===d&&"range"===s.type)return!1;var f=g(d,s);if(!f)return!0;if(f?r=d:(r="v"===d?"h":"v",f=g(d,s)),!f)return!1;if(!a.current&&"changedTouches"in e&&(u||l)&&(a.current=r),!r)return!0;var v=a.current||r;return b(v,t,e,"h"===v?u:l,!0)},[]),s=o.useCallback(function(e){if(D.length&&D[D.length-1]===u){var n="deltaY"in e?C(e):w(e),r=t.current.filter(function(t){var r;return t.name===e.type&&(t.target===e.target||e.target===t.shadowParent)&&(r=t.delta)[0]===n[0]&&r[1]===n[1]})[0];if(r&&r.should){e.cancelable&&e.preventDefault();return}if(!r){var o=(c.current.shards||[]).map(x).filter(Boolean).filter(function(t){return t.contains(e.target)});(o.length>0?l(e,o[0]):!c.current.noIsolation)&&e.cancelable&&e.preventDefault()}}},[]),v=o.useCallback(function(e,n,r,o){var a={name:e,delta:n,target:r,should:o,shadowParent:function(e){for(var t=null;null!==e;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}(r)};t.current.push(a),setTimeout(function(){t.current=t.current.filter(function(e){return e!==a})},1)},[]),p=o.useCallback(function(e){n.current=w(e),a.current=void 0},[]),h=o.useCallback(function(t){v(t.type,C(t),t.target,l(t,e.lockRef.current))},[]),y=o.useCallback(function(t){v(t.type,w(t),t.target,l(t,e.lockRef.current))},[]);o.useEffect(function(){return D.push(u),e.setCallbacks({onScrollCapture:h,onWheelCapture:h,onTouchMoveCapture:y}),document.addEventListener("wheel",s,m),document.addEventListener("touchmove",s,m),document.addEventListener("touchstart",p,m),function(){D=D.filter(function(e){return e!==u}),document.removeEventListener("wheel",s,m),document.removeEventListener("touchmove",s,m),document.removeEventListener("touchstart",p,m)}},[]);var E=e.removeScrollBar,N=e.inert;return o.createElement(o.Fragment,null,N?o.createElement(u,{styles:"\n  .block-interactivity-".concat(i," {pointer-events: none;}\n  .allow-interactivity-").concat(i," {pointer-events: all;}\n")}):null,E?o.createElement(d.jp,{gapMode:e.gapMode}):null)});var S=o.forwardRef(function(e,t){return o.createElement(l,(0,r.Cl)({},e,{ref:t,sideCar:N}))});S.classNames=l.classNames;let L=S},7847:(e,t,n)=>{n.d(t,{T0:()=>u});var r,o=n(4843),a=function(){var e=0,t=null;return{add:function(o){if(0==e&&(t=function(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=r||n.nc;return t&&e.setAttribute("nonce",t),e}())){var a,i;(a=t).styleSheet?a.styleSheet.cssText=o:a.appendChild(document.createTextNode(o)),i=t,(document.head||document.getElementsByTagName("head")[0]).appendChild(i)}e++},remove:function(){--e||!t||(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},i=function(){var e=a();return function(t,n){o.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&n])}},u=function(){var e=i();return function(t){return e(t.styles,t.dynamic),null}}},3611:(e,t,n)=>{n.d(t,{S:()=>u});var r=n(4843);function o(e,t){return"function"==typeof e?e(t):e&&(e.current=t),e}var a="undefined"!=typeof window?r.useLayoutEffect:r.useEffect,i=new WeakMap;function u(e,t){var n,u,c,l=(n=t||null,u=function(t){return e.forEach(function(e){return o(e,t)})},(c=(0,r.useState)(function(){return{value:n,callback:u,facade:{get current(){return c.value},set current(value){var e=c.value;e!==value&&(c.value=value,c.callback(value,e))}}}})[0]).callback=u,c.facade);return a(function(){var t=i.get(l);if(t){var n=new Set(t),r=new Set(e),a=l.current;n.forEach(function(e){r.has(e)||o(e,null)}),r.forEach(function(e){n.has(e)||o(e,a)})}i.set(l,e)},[e]),l}},3949:(e,t,n)=>{n.d(t,{m:()=>i});var r=n(769),o=n(4843),a=function(e){var t=e.sideCar,n=(0,r.Tt)(e,["sideCar"]);if(!t)throw Error("Sidecar: please provide `sideCar` property to import the right car");var a=t.read();if(!a)throw Error("Sidecar medium not found");return o.createElement(a,(0,r.Cl)({},n))};function i(e,t){return e.useMedium(t),a}a.isSideCarExport=!0},7581:(e,t,n)=>{n.d(t,{f:()=>a});var r=n(769);function o(e){return e}function a(e){void 0===e&&(e={});var t,n,a,i=(void 0===t&&(t=o),n=[],a=!1,{read:function(){if(a)throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return n.length?n[n.length-1]:null},useMedium:function(e){var r=t(e,a);return n.push(r),function(){n=n.filter(function(e){return e!==r})}},assignSyncMedium:function(e){for(a=!0;n.length;){var t=n;n=[],t.forEach(e)}n={push:function(t){return e(t)},filter:function(){return n}}},assignMedium:function(e){a=!0;var t=[];if(n.length){var r=n;n=[],r.forEach(e),t=n}var o=function(){var n=t;t=[],n.forEach(e)},i=function(){return Promise.resolve().then(o)};i(),n={push:function(e){t.push(e),i()},filter:function(e){return t=t.filter(e),n}}}});return i.options=(0,r.Cl)({async:!0,ssr:!1},e),i}},2723:(e,t,n)=>{n.d(t,{UC:()=>et,VY:()=>er,ZL:()=>$,bL:()=>J,bm:()=>eo,hE:()=>en,hJ:()=>ee,l9:()=>Q});var r=n(4843),o=n(5020),a=n(4280),i=n(5852),u=n(2137),c=n(7765),l=n(3852),s=n(5332),d=n(4220),f=n(8397),v=n(5835),p=n(3704),m=n(4581),h=n(952),g=n(7881),y=n(4884),E="Dialog",[b,w]=(0,i.A)(E),[C,x]=b(E),R=e=>{let{__scopeDialog:t,children:n,open:o,defaultOpen:a,onOpenChange:i,modal:l=!0}=e,s=r.useRef(null),d=r.useRef(null),[f=!1,v]=(0,c.i)({prop:o,defaultProp:a,onChange:i});return(0,y.jsx)(C,{scope:t,triggerRef:s,contentRef:d,contentId:(0,u.B)(),titleId:(0,u.B)(),descriptionId:(0,u.B)(),open:f,onOpenChange:v,onOpenToggle:r.useCallback(()=>v(e=>!e),[v]),modal:l,children:n})};R.displayName=E;var D="DialogTrigger",N=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=x(D,n),u=(0,a.s)(t,i.triggerRef);return(0,y.jsx)(v.sG.button,{type:"button","aria-haspopup":"dialog","aria-expanded":i.open,"aria-controls":i.contentId,"data-state":Y(i.open),...r,ref:u,onClick:(0,o.m)(e.onClick,i.onOpenToggle)})});N.displayName=D;var S="DialogPortal",[L,k]=b(S,{forceMount:void 0}),T=e=>{let{__scopeDialog:t,forceMount:n,children:o,container:a}=e,i=x(S,t);return(0,y.jsx)(L,{scope:t,forceMount:n,children:r.Children.map(o,e=>(0,y.jsx)(f.C,{present:n||i.open,children:(0,y.jsx)(d.Z,{asChild:!0,container:a,children:e})}))})};T.displayName=S;var A="DialogOverlay",M=r.forwardRef((e,t)=>{let n=k(A,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=x(A,e.__scopeDialog);return a.modal?(0,y.jsx)(f.C,{present:r||a.open,children:(0,y.jsx)(P,{...o,ref:t})}):null});M.displayName=A;var P=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=x(A,n);return(0,y.jsx)(m.A,{as:g.DX,allowPinchZoom:!0,shards:[o.contentRef],children:(0,y.jsx)(v.sG.div,{"data-state":Y(o.open),...r,ref:t,style:{pointerEvents:"auto",...r.style}})})}),I="DialogContent",O=r.forwardRef((e,t)=>{let n=k(I,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=x(I,e.__scopeDialog);return(0,y.jsx)(f.C,{present:r||a.open,children:a.modal?(0,y.jsx)(j,{...o,ref:t}):(0,y.jsx)(F,{...o,ref:t})})});O.displayName=I;var j=r.forwardRef((e,t)=>{let n=x(I,e.__scopeDialog),i=r.useRef(null),u=(0,a.s)(t,n.contentRef,i);return r.useEffect(()=>{let e=i.current;if(e)return(0,h.Eq)(e)},[]),(0,y.jsx)(W,{...e,ref:u,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,o.m)(e.onCloseAutoFocus,e=>{var t;e.preventDefault(),null===(t=n.triggerRef.current)||void 0===t||t.focus()}),onPointerDownOutside:(0,o.m)(e.onPointerDownOutside,e=>{let t=e.detail.originalEvent,n=0===t.button&&!0===t.ctrlKey;(2===t.button||n)&&e.preventDefault()}),onFocusOutside:(0,o.m)(e.onFocusOutside,e=>e.preventDefault())})}),F=r.forwardRef((e,t)=>{let n=x(I,e.__scopeDialog),o=r.useRef(!1),a=r.useRef(!1);return(0,y.jsx)(W,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:t=>{var r,i;null===(r=e.onCloseAutoFocus)||void 0===r||r.call(e,t),t.defaultPrevented||(o.current||null===(i=n.triggerRef.current)||void 0===i||i.focus(),t.preventDefault()),o.current=!1,a.current=!1},onInteractOutside:t=>{var r,i;null===(r=e.onInteractOutside)||void 0===r||r.call(e,t),t.defaultPrevented||(o.current=!0,"pointerdown"!==t.detail.originalEvent.type||(a.current=!0));let u=t.target;(null===(i=n.triggerRef.current)||void 0===i?void 0:i.contains(u))&&t.preventDefault(),"focusin"===t.detail.originalEvent.type&&a.current&&t.preventDefault()}})}),W=r.forwardRef((e,t)=>{let{__scopeDialog:n,trapFocus:o,onOpenAutoFocus:i,onCloseAutoFocus:u,...c}=e,d=x(I,n),f=r.useRef(null),v=(0,a.s)(t,f);return(0,p.Oh)(),(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(s.n,{asChild:!0,loop:!0,trapped:o,onMountAutoFocus:i,onUnmountAutoFocus:u,children:(0,y.jsx)(l.qW,{role:"dialog",id:d.contentId,"aria-describedby":d.descriptionId,"aria-labelledby":d.titleId,"data-state":Y(d.open),...c,ref:v,onDismiss:()=>d.onOpenChange(!1)})}),(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(U,{titleId:d.titleId}),(0,y.jsx)(V,{contentRef:f,descriptionId:d.descriptionId})]})]})}),_="DialogTitle",B=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=x(_,n);return(0,y.jsx)(v.sG.h2,{id:o.titleId,...r,ref:t})});B.displayName=_;var K="DialogDescription",X=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=x(K,n);return(0,y.jsx)(v.sG.p,{id:o.descriptionId,...r,ref:t})});X.displayName=K;var q="DialogClose",G=r.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,a=x(q,n);return(0,y.jsx)(v.sG.button,{type:"button",...r,ref:t,onClick:(0,o.m)(e.onClick,()=>a.onOpenChange(!1))})});function Y(e){return e?"open":"closed"}G.displayName=q;var Z="DialogTitleWarning",[z,H]=(0,i.q)(Z,{contentName:I,titleName:_,docsSlug:"dialog"}),U=e=>{let{titleId:t}=e,n=H(Z),o="`".concat(n.contentName,"` requires a `").concat(n.titleName,"` for the component to be accessible for screen reader users.\n\nIf you want to hide the `").concat(n.titleName,"`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/").concat(n.docsSlug);return r.useEffect(()=>{t&&!document.getElementById(t)&&console.error(o)},[o,t]),null},V=e=>{let{contentRef:t,descriptionId:n}=e,o=H("DialogDescriptionWarning"),a="Warning: Missing `Description` or `aria-describedby={undefined}` for {".concat(o.contentName,"}.");return r.useEffect(()=>{var e;let r=null===(e=t.current)||void 0===e?void 0:e.getAttribute("aria-describedby");n&&r&&!document.getElementById(n)&&console.warn(a)},[a,t,n]),null},J=R,Q=N,$=T,ee=M,et=O,en=B,er=X,eo=G},3852:(e,t,n)=>{n.d(t,{qW:()=>f});var r,o=n(4843),a=n(5020),i=n(5835),u=n(4280),c=n(9661),l=n(4884),s="dismissableLayer.update",d=o.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),f=o.forwardRef((e,t)=>{var n,f;let{disableOutsidePointerEvents:m=!1,onEscapeKeyDown:h,onPointerDownOutside:g,onFocusOutside:y,onInteractOutside:E,onDismiss:b,...w}=e,C=o.useContext(d),[x,R]=o.useState(null),D=null!==(f=null==x?void 0:x.ownerDocument)&&void 0!==f?f:null===(n=globalThis)||void 0===n?void 0:n.document,[,N]=o.useState({}),S=(0,u.s)(t,e=>R(e)),L=Array.from(C.layers),[k]=[...C.layersWithOutsidePointerEventsDisabled].slice(-1),T=L.indexOf(k),A=x?L.indexOf(x):-1,M=C.layersWithOutsidePointerEventsDisabled.size>0,P=A>=T,I=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,c.c)(e),a=o.useRef(!1),i=o.useRef(()=>{});return o.useEffect(()=>{let e=e=>{if(e.target&&!a.current){let t=function(){p("dismissableLayer.pointerDownOutside",r,o,{discrete:!0})},o={originalEvent:e};"touch"===e.pointerType?(n.removeEventListener("click",i.current),i.current=t,n.addEventListener("click",i.current,{once:!0})):t()}else n.removeEventListener("click",i.current);a.current=!1},t=window.setTimeout(()=>{n.addEventListener("pointerdown",e)},0);return()=>{window.clearTimeout(t),n.removeEventListener("pointerdown",e),n.removeEventListener("click",i.current)}},[n,r]),{onPointerDownCapture:()=>a.current=!0}}(e=>{let t=e.target,n=[...C.branches].some(e=>e.contains(t));!P||n||(null==g||g(e),null==E||E(e),e.defaultPrevented||null==b||b())},D),O=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,c.c)(e),a=o.useRef(!1);return o.useEffect(()=>{let e=e=>{e.target&&!a.current&&p("dismissableLayer.focusOutside",r,{originalEvent:e},{discrete:!1})};return n.addEventListener("focusin",e),()=>n.removeEventListener("focusin",e)},[n,r]),{onFocusCapture:()=>a.current=!0,onBlurCapture:()=>a.current=!1}}(e=>{let t=e.target;[...C.branches].some(e=>e.contains(t))||(null==y||y(e),null==E||E(e),e.defaultPrevented||null==b||b())},D);return!function(e,t=globalThis?.document){let n=(0,c.c)(e);o.useEffect(()=>{let e=e=>{"Escape"===e.key&&n(e)};return t.addEventListener("keydown",e,{capture:!0}),()=>t.removeEventListener("keydown",e,{capture:!0})},[n,t])}(e=>{A!==C.layers.size-1||(null==h||h(e),!e.defaultPrevented&&b&&(e.preventDefault(),b()))},D),o.useEffect(()=>{if(x)return m&&(0===C.layersWithOutsidePointerEventsDisabled.size&&(r=D.body.style.pointerEvents,D.body.style.pointerEvents="none"),C.layersWithOutsidePointerEventsDisabled.add(x)),C.layers.add(x),v(),()=>{m&&1===C.layersWithOutsidePointerEventsDisabled.size&&(D.body.style.pointerEvents=r)}},[x,D,m,C]),o.useEffect(()=>()=>{x&&(C.layers.delete(x),C.layersWithOutsidePointerEventsDisabled.delete(x),v())},[x,C]),o.useEffect(()=>{let e=()=>N({});return document.addEventListener(s,e),()=>document.removeEventListener(s,e)},[]),(0,l.jsx)(i.sG.div,{...w,ref:S,style:{pointerEvents:M?P?"auto":"none":void 0,...e.style},onFocusCapture:(0,a.m)(e.onFocusCapture,O.onFocusCapture),onBlurCapture:(0,a.m)(e.onBlurCapture,O.onBlurCapture),onPointerDownCapture:(0,a.m)(e.onPointerDownCapture,I.onPointerDownCapture)})});function v(){let e=new CustomEvent(s);document.dispatchEvent(e)}function p(e,t,n,r){let{discrete:o}=r,a=n.originalEvent.target,u=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:n});t&&a.addEventListener(e,t,{once:!0}),o?(0,i.hO)(a,u):a.dispatchEvent(u)}f.displayName="DismissableLayer",o.forwardRef((e,t)=>{let n=o.useContext(d),r=o.useRef(null),a=(0,u.s)(t,r);return o.useEffect(()=>{let e=r.current;if(e)return n.branches.add(e),()=>{n.branches.delete(e)}},[n.branches]),(0,l.jsx)(i.sG.div,{...e,ref:a})}).displayName="DismissableLayerBranch"},3704:(e,t,n)=>{n.d(t,{Oh:()=>a});var r=n(4843),o=0;function a(){r.useEffect(()=>{var e,t;let n=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",null!==(e=n[0])&&void 0!==e?e:i()),document.body.insertAdjacentElement("beforeend",null!==(t=n[1])&&void 0!==t?t:i()),o++,()=>{1===o&&document.querySelectorAll("[data-radix-focus-guard]").forEach(e=>e.remove()),o--}},[])}function i(){let e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}},5332:(e,t,n)=>{n.d(t,{n:()=>d});var r=n(4843),o=n(4280),a=n(5835),i=n(9661),u=n(4884),c="focusScope.autoFocusOnMount",l="focusScope.autoFocusOnUnmount",s={bubbles:!1,cancelable:!0},d=r.forwardRef((e,t)=>{let{loop:n=!1,trapped:d=!1,onMountAutoFocus:h,onUnmountAutoFocus:g,...y}=e,[E,b]=r.useState(null),w=(0,i.c)(h),C=(0,i.c)(g),x=r.useRef(null),R=(0,o.s)(t,e=>b(e)),D=r.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;r.useEffect(()=>{if(d){let e=function(e){if(D.paused||!E)return;let t=e.target;E.contains(t)?x.current=t:p(x.current,{select:!0})},t=function(e){if(D.paused||!E)return;let t=e.relatedTarget;null===t||E.contains(t)||p(x.current,{select:!0})};document.addEventListener("focusin",e),document.addEventListener("focusout",t);let n=new MutationObserver(function(e){if(document.activeElement===document.body)for(let t of e)t.removedNodes.length>0&&p(E)});return E&&n.observe(E,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",e),document.removeEventListener("focusout",t),n.disconnect()}}},[d,E,D.paused]),r.useEffect(()=>{if(E){m.add(D);let e=document.activeElement;if(!E.contains(e)){let t=new CustomEvent(c,s);E.addEventListener(c,w),E.dispatchEvent(t),t.defaultPrevented||(function(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=document.activeElement;for(let r of e)if(p(r,{select:t}),document.activeElement!==n)return}(f(E).filter(e=>"A"!==e.tagName),{select:!0}),document.activeElement===e&&p(E))}return()=>{E.removeEventListener(c,w),setTimeout(()=>{let t=new CustomEvent(l,s);E.addEventListener(l,C),E.dispatchEvent(t),t.defaultPrevented||p(null!=e?e:document.body,{select:!0}),E.removeEventListener(l,C),m.remove(D)},0)}}},[E,w,C,D]);let N=r.useCallback(e=>{if(!n&&!d||D.paused)return;let t="Tab"===e.key&&!e.altKey&&!e.ctrlKey&&!e.metaKey,r=document.activeElement;if(t&&r){let t=e.currentTarget,[o,a]=function(e){let t=f(e);return[v(t,e),v(t.reverse(),e)]}(t);o&&a?e.shiftKey||r!==a?e.shiftKey&&r===o&&(e.preventDefault(),n&&p(a,{select:!0})):(e.preventDefault(),n&&p(o,{select:!0})):r===t&&e.preventDefault()}},[n,d,D.paused]);return(0,u.jsx)(a.sG.div,{tabIndex:-1,...y,ref:R,onKeyDown:N})});function f(e){let t=[],n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>{let t="INPUT"===e.tagName&&"hidden"===e.type;return e.disabled||e.hidden||t?NodeFilter.FILTER_SKIP:e.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;n.nextNode();)t.push(n.currentNode);return t}function v(e,t){for(let n of e)if(!function(e,t){let{upTo:n}=t;if("hidden"===getComputedStyle(e).visibility)return!0;for(;e&&(void 0===n||e!==n);){if("none"===getComputedStyle(e).display)return!0;e=e.parentElement}return!1}(n,{upTo:t}))return n}function p(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(e&&e.focus){var n;let r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&(n=e)instanceof HTMLInputElement&&"select"in n&&t&&e.select()}}d.displayName="FocusScope";var m=function(){let e=[];return{add(t){let n=e[0];t!==n&&(null==n||n.pause()),(e=h(e,t)).unshift(t)},remove(t){var n;null===(n=(e=h(e,t))[0])||void 0===n||n.resume()}}}();function h(e,t){let n=[...e],r=n.indexOf(t);return -1!==r&&n.splice(r,1),n}},4220:(e,t,n)=>{n.d(t,{Z:()=>c});var r=n(4843),o=n(6537),a=n(5835),i=n(267),u=n(4884),c=r.forwardRef((e,t)=>{var n,c;let{container:l,...s}=e,[d,f]=r.useState(!1);(0,i.N)(()=>f(!0),[]);let v=l||d&&(null===(c=globalThis)||void 0===c?void 0:null===(n=c.document)||void 0===n?void 0:n.body);return v?o.createPortal((0,u.jsx)(a.sG.div,{...s,ref:t}),v):null});c.displayName="Portal"}}]);