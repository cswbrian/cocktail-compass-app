(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{3784:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,5751,23)),Promise.resolve().then(r.t.bind(r,1274,23)),Promise.resolve().then(r.t.bind(r,1350,23)),Promise.resolve().then(r.t.bind(r,366,23))},5751:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return h}});let n=r(3638),o=r(4001),u=n._(r(7749)),l=r(7474),a=r(124),i=r(642),s=r(6443),f=r(4479),c=r(348),d=r(9670);function p(e,t,r){"undefined"!=typeof window&&(async()=>e.prefetch(t,r))().catch(e=>{})}function y(e){return"string"==typeof e?e:(0,l.formatUrl)(e)}r(8713);let h=u.default.forwardRef(function(e,t){let r,n;let{href:l,as:h,children:b,prefetch:m=null,passHref:g,replace:_,shallow:v,scroll:P,onClick:E,onMouseEnter:O,onTouchStart:j,legacyBehavior:M=!1,...C}=e;r=b,M&&("string"==typeof r||"number"==typeof r)&&(r=(0,o.jsx)("a",{children:r}));let k=u.default.useContext(a.AppRouterContext),w=!1!==m,x=null===m?s.PrefetchKind.AUTO:s.PrefetchKind.FULL,{href:I,as:N}=u.default.useMemo(()=>{let e=y(l);return{href:e,as:h?y(h):e}},[l,h]),S=u.default.useRef(I),T=u.default.useRef(N);M&&(n=u.default.Children.only(r));let A=M?n&&"object"==typeof n&&n.ref:t,[R,U,F]=(0,i.useIntersection)({rootMargin:"200px"}),L=u.default.useCallback(e=>{(T.current!==N||S.current!==I)&&(F(),T.current=N,S.current=I),R(e)},[N,I,F,R]),K=(0,f.useMergedRef)(L,A);u.default.useEffect(()=>{k&&U&&w&&p(k,I,{kind:x})},[N,I,U,w,k,x]);let q={ref:K,onClick(e){M||"function"!=typeof E||E(e),M&&n.props&&"function"==typeof n.props.onClick&&n.props.onClick(e),k&&!e.defaultPrevented&&function(e,t,r,n,o,l,a){let{nodeName:i}=e.currentTarget;"A"===i.toUpperCase()&&function(e){let t=e.currentTarget.getAttribute("target");return t&&"_self"!==t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)||(e.preventDefault(),u.default.startTransition(()=>{let e=null==a||a;"beforePopState"in t?t[o?"replace":"push"](r,n,{shallow:l,scroll:e}):t[o?"replace":"push"](n||r,{scroll:e})}))}(e,k,I,N,_,v,P)},onMouseEnter(e){M||"function"!=typeof O||O(e),M&&n.props&&"function"==typeof n.props.onMouseEnter&&n.props.onMouseEnter(e),k&&w&&p(k,I,{kind:x})},onTouchStart:function(e){M||"function"!=typeof j||j(e),M&&n.props&&"function"==typeof n.props.onTouchStart&&n.props.onTouchStart(e),k&&w&&p(k,I,{kind:x})}};return(0,c.isAbsoluteUrl)(N)?q.href=N:M&&!g&&("a"!==n.type||"href"in n.props)||(q.href=(0,d.addBasePath)(N)),M?u.default.cloneElement(n,q):(0,o.jsx)("a",{...C,...q,children:r})});("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8201:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{cancelIdleCallback:function(){return n},requestIdleCallback:function(){return r}});let r="undefined"!=typeof self&&self.requestIdleCallback&&self.requestIdleCallback.bind(window)||function(e){let t=Date.now();return self.setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)},n="undefined"!=typeof self&&self.cancelIdleCallback&&self.cancelIdleCallback.bind(window)||function(e){return clearTimeout(e)};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},642:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"useIntersection",{enumerable:!0,get:function(){return i}});let n=r(7749),o=r(8201),u="function"==typeof IntersectionObserver,l=new Map,a=[];function i(e){let{rootRef:t,rootMargin:r,disabled:i}=e,s=i||!u,[f,c]=(0,n.useState)(!1),d=(0,n.useRef)(null),p=(0,n.useCallback)(e=>{d.current=e},[]);return(0,n.useEffect)(()=>{if(u){if(s||f)return;let e=d.current;if(e&&e.tagName)return function(e,t,r){let{id:n,observer:o,elements:u}=function(e){let t;let r={root:e.root||null,margin:e.rootMargin||""},n=a.find(e=>e.root===r.root&&e.margin===r.margin);if(n&&(t=l.get(n)))return t;let o=new Map;return t={id:r,observer:new IntersectionObserver(e=>{e.forEach(e=>{let t=o.get(e.target),r=e.isIntersecting||e.intersectionRatio>0;t&&r&&t(r)})},e),elements:o},a.push(r),l.set(r,t),t}(r);return u.set(e,t),o.observe(e),function(){if(u.delete(e),o.unobserve(e),0===u.size){o.disconnect(),l.delete(n);let e=a.findIndex(e=>e.root===n.root&&e.margin===n.margin);e>-1&&a.splice(e,1)}}}(e,e=>e&&c(e),{root:null==t?void 0:t.current,rootMargin:r})}else if(!f){let e=(0,o.requestIdleCallback)(()=>c(!0));return()=>(0,o.cancelIdleCallback)(e)}},[s,r,t,f,d.current]),[p,f,(0,n.useCallback)(()=>{c(!1)},[])]}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},4479:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"useMergedRef",{enumerable:!0,get:function(){return o}});let n=r(7749);function o(e,t){let r=(0,n.useRef)(()=>{}),o=(0,n.useRef)(()=>{});return(0,n.useMemo)(()=>e&&t?n=>{null===n?(r.current(),o.current()):(r.current=u(e,n),o.current=u(t,n))}:e||t,[e,t])}function u(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7474:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{formatUrl:function(){return u},formatWithValidation:function(){return a},urlObjectKeys:function(){return l}});let n=r(6479)._(r(7677)),o=/https?|ftp|gopher|file/;function u(e){let{auth:t,hostname:r}=e,u=e.protocol||"",l=e.pathname||"",a=e.hash||"",i=e.query||"",s=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?s=t+e.host:r&&(s=t+(~r.indexOf(":")?"["+r+"]":r),e.port&&(s+=":"+e.port)),i&&"object"==typeof i&&(i=String(n.urlQueryToSearchParams(i)));let f=e.search||i&&"?"+i||"";return u&&!u.endsWith(":")&&(u+=":"),e.slashes||(!u||o.test(u))&&!1!==s?(s="//"+(s||""),l&&"/"!==l[0]&&(l="/"+l)):s||(s=""),a&&"#"!==a[0]&&(a="#"+a),f&&"?"!==f[0]&&(f="?"+f),""+u+s+(l=l.replace(/[?#]/g,encodeURIComponent))+(f=f.replace("#","%23"))+a}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function a(e){return u(e)}},7677:(e,t)=>{"use strict";function r(e){let t={};return e.forEach((e,r)=>{void 0===t[r]?t[r]=e:Array.isArray(t[r])?t[r].push(e):t[r]=[t[r],e]}),t}function n(e){return"string"!=typeof e&&("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function o(e){let t=new URLSearchParams;return Object.entries(e).forEach(e=>{let[r,o]=e;Array.isArray(o)?o.forEach(e=>t.append(r,n(e))):t.set(r,n(o))}),t}function u(e){for(var t=arguments.length,r=Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];return r.forEach(t=>{Array.from(t.keys()).forEach(t=>e.delete(t)),t.forEach((t,r)=>e.append(r,t))}),e}Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{assign:function(){return u},searchParamsToUrlQuery:function(){return r},urlQueryToSearchParams:function(){return o}})},348:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{DecodeError:function(){return y},MiddlewareNotFoundError:function(){return g},MissingStaticPage:function(){return m},NormalizeError:function(){return h},PageNotFoundError:function(){return b},SP:function(){return d},ST:function(){return p},WEB_VITALS:function(){return r},execOnce:function(){return n},getDisplayName:function(){return i},getLocationOrigin:function(){return l},getURL:function(){return a},isAbsoluteUrl:function(){return u},isResSent:function(){return s},loadGetInitialProps:function(){return c},normalizeRepeatedSlashes:function(){return f},stringifyError:function(){return _}});let r=["CLS","FCP","FID","INP","LCP","TTFB"];function n(e){let t,r=!1;return function(){for(var n=arguments.length,o=Array(n),u=0;u<n;u++)o[u]=arguments[u];return r||(r=!0,t=e(...o)),t}}let o=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,u=e=>o.test(e);function l(){let{protocol:e,hostname:t,port:r}=window.location;return e+"//"+t+(r?":"+r:"")}function a(){let{href:e}=window.location,t=l();return e.substring(t.length)}function i(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function s(e){return e.finished||e.headersSent}function f(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?"?"+t.slice(1).join("?"):"")}async function c(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await c(t.Component,t.ctx)}:{};let n=await e.getInitialProps(t);if(r&&s(r))return n;if(!n)throw Error('"'+i(e)+'.getInitialProps()" should resolve to an object. But found "'+n+'" instead.');return n}let d="undefined"!=typeof performance,p=d&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class y extends Error{}class h extends Error{}class b extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message="Cannot find module for page: "+e}}class m extends Error{constructor(e,t){super(),this.message="Failed to load static file for page: "+e+" "+t}}class g extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function _(e){return JSON.stringify({message:e.message,stack:e.stack})}},366:()=>{},1274:e=>{e.exports={style:{fontFamily:"'Geist', 'Geist Fallback'",fontStyle:"normal"},className:"__className_88842e",variable:"__variable_88842e"}},1350:e=>{e.exports={style:{fontFamily:"'Geist Mono', 'Geist Mono Fallback'",fontStyle:"normal"},className:"__className_a0cd56",variable:"__variable_a0cd56"}}},e=>{var t=t=>e(e.s=t);e.O(0,[463,142,767,358],()=>t(3784)),_N_E=e.O()}]);