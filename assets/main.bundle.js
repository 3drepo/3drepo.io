(()=>{var Xa={107:(w,m,r)=>{var l;l=function(){"use strict";return{}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},144:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p,f=!1)=>{if(n instanceof l)return n;try{return new l(n,p)}catch(c){if(!f)return null;throw c}};w.exports=i},203:(w,m,r)=>{var l,i;l=[r(8543),r(107)],i=function(n,p){"use strict";return p.createHTMLDocument=function(){var f=n.implementation.createHTMLDocument("").body;return f.innerHTML="<form></form><form></form>",f.childNodes.length===2}(),p}.apply(m,l),i!==void 0&&(w.exports=i)},210:(w,m,r)=>{var l;l=function(){"use strict";return/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source}.call(m,r,m,w),l!==void 0&&(w.exports=l)},211:(w,m,r)=>{var l;l=function(){"use strict";return/<([a-z][^\/\0>\x20\t\r\n\f]*)/i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},270:(w,m,r)=>{"use strict";const l=r(3908),i=r(8311),n=(p,f,c)=>{let o=null,h=null,y=null;try{y=new i(f,c)}catch(s){return null}return p.forEach(s=>{y.test(s)&&(!o||h.compare(s)===1)&&(o=s,h=new l(o,c))}),o};w.exports=n},301:()=>{(function(){if(typeof Prism=="undefined"||typeof document=="undefined")return;var w=[],m={},r=function(){};Prism.plugins.toolbar={};var l=Prism.plugins.toolbar.registerButton=function(p,f){var c;if(typeof f=="function"?c=f:c=function(o){var h;return typeof f.onClick=="function"?(h=document.createElement("button"),h.type="button",h.addEventListener("click",function(){f.onClick.call(this,o)})):typeof f.url=="string"?(h=document.createElement("a"),h.href=f.url):h=document.createElement("span"),f.className&&h.classList.add(f.className),h.textContent=f.text,h},p in m){console.warn('There is a button with the key "'+p+'" registered already.');return}w.push(m[p]=c)};function i(p){for(;p;){var f=p.getAttribute("data-toolbar-order");if(f!=null)return f=f.trim(),f.length?f.split(/\s*,\s*/g):[];p=p.parentElement}}var n=Prism.plugins.toolbar.hook=function(p){var f=p.element.parentNode;if(!(!f||!/pre/i.test(f.nodeName))&&!f.parentNode.classList.contains("code-toolbar")){var c=document.createElement("div");c.classList.add("code-toolbar"),f.parentNode.insertBefore(c,f),c.appendChild(f);var o=document.createElement("div");o.classList.add("toolbar");var h=w,y=i(p.element);y&&(h=y.map(function(s){return m[s]||r})),h.forEach(function(s){var g=s(p);if(g){var u=document.createElement("div");u.classList.add("toolbar-item"),u.appendChild(g),o.appendChild(u)}}),c.appendChild(o)}};l("label",function(p){var f=p.element.parentNode;if(!(!f||!/pre/i.test(f.nodeName))&&f.hasAttribute("data-label")){var c,o,h=f.getAttribute("data-label");try{o=document.querySelector("template#"+h)}catch(y){}return o?c=o.content:(f.hasAttribute("data-url")?(c=document.createElement("a"),c.href=f.getAttribute("data-url")):c=document.createElement("span"),c.textContent=h),c}}),Prism.hooks.add("complete",n)})()},336:(w,m,r)=>{var l,i,l,i;l=[r(8411)],i=function(n){"use strict";l=[],i=function(){return n}.apply(m,l),i!==void 0&&(w.exports=i)}.apply(m,l),i!==void 0&&(w.exports=i)},403:(w,m,r)=>{var l,i;l=[r(210)],i=function(n){"use strict";return new RegExp("^(?:([+-])=|)("+n+")([a-z%]*)$","i")}.apply(m,l),i!==void 0&&(w.exports=i)},541:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(7623),r(107)],i=function(n,p,f,c){"use strict";return function(){function o(){if(T){b.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",T.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",f.appendChild(b).appendChild(T);var _=window.getComputedStyle(T);y=_.top!=="1%",v=h(_.marginLeft)===12,T.style.right="60%",u=h(_.right)===36,s=h(_.width)===36,T.style.position="absolute",g=h(T.offsetWidth/3)===12,f.removeChild(b),T=null}}function h(_){return Math.round(parseFloat(_))}var y,s,g,u,d,v,b=p.createElement("div"),T=p.createElement("div");T.style&&(T.style.backgroundClip="content-box",T.cloneNode(!0).style.backgroundClip="",c.clearCloneStyle=T.style.backgroundClip==="content-box",n.extend(c,{boxSizingReliable:function(){return o(),s},pixelBoxStyles:function(){return o(),u},pixelPosition:function(){return o(),y},reliableMarginLeft:function(){return o(),v},scrollboxSize:function(){return o(),g},reliableTrDimensions:function(){var _,A,E,I;return d==null&&(_=p.createElement("table"),A=p.createElement("tr"),E=p.createElement("div"),_.style.cssText="position:absolute;left:-11111px;border-collapse:separate",A.style.cssText="box-sizing:content-box;border:1px solid",A.style.height="1px",E.style.height="9px",E.style.display="block",f.appendChild(_).appendChild(A).appendChild(E),I=window.getComputedStyle(A),d=parseInt(I.height,10)+parseInt(I.borderTopWidth,10)+parseInt(I.borderBottomWidth,10)===A.offsetHeight,f.removeChild(_)),d}}))}(),c}.apply(m,l),i!==void 0&&(w.exports=i)},560:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p,f)=>new l(n,f).compare(new l(p,f));w.exports=i},685:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";n.contains=function(p,f){var c=f&&f.parentNode;return p===c||!!(c&&c.nodeType===1&&(p.contains?p.contains(c):p.compareDocumentPosition&&p.compareDocumentPosition(c)&16))}}.apply(m,l),i!==void 0&&(w.exports=i)},759:(w,m,r)=>{var l,i;l=[r(9192)],i=function(n){"use strict";function p(f,c){for(var o=0,h=f.length;o<h;o++)n.set(f[o],"globalEval",!c||n.get(c[o],"globalEval"))}return p}.apply(m,l),i!==void 0&&(w.exports=i)},909:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p,f)=>{const c=new l(n,f),o=new l(p,f);return c.compare(o)||c.compareBuild(o)};w.exports=i},945:(w,m,r)=>{var l,i;l=[r(210)],i=function(n){"use strict";return new RegExp("^("+n+")(?!px)[a-z%]+$","i")}.apply(m,l),i!==void 0&&(w.exports=i)},981:(w,m,r)=>{var l,i;l=[r(8411),r(1801),r(2512)],i=function(n){"use strict";return n.fn.delay=function(p,f){return p=n.fx&&n.fx.speeds[p]||p,f=f||"fx",this.queue(f,function(c,o){var h=window.setTimeout(c,p);o.stop=function(){window.clearTimeout(h)}})},n.fn.delay}.apply(m,l),i!==void 0&&(w.exports=i)},1044:(w,m,r)=>{var l,i;l=[r(4773)],i=function(n){"use strict";var p={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};return p.tbody=p.tfoot=p.colgroup=p.caption=p.thead,p.th=p.td,n.option||(p.optgroup=p.option=[1,"<select multiple='multiple'>","</select>"]),p}.apply(m,l),i!==void 0&&(w.exports=i)},1074:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";return n.parseXML=function(p){var f,c;if(!p||typeof p!="string")return null;try{f=new window.DOMParser().parseFromString(p,"text/xml")}catch(o){}return c=f&&f.getElementsByTagName("parsererror")[0],(!f||c)&&n.error("Invalid XML: "+(c?n.map(c.childNodes,function(o){return o.textContent}).join(`
`):p)),f},n.parseXML}.apply(m,l),i!==void 0&&(w.exports=i)},1114:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";n.readyException=function(p){window.setTimeout(function(){throw p})}}.apply(m,l),i!==void 0&&(w.exports=i)},1123:w=>{"use strict";const m=/^[0-9]+$/,r=(i,n)=>{const p=m.test(i),f=m.test(n);return p&&f&&(i=+i,n=+n),i===n?0:p&&!f?-1:f&&!p?1:i<n?-1:1},l=(i,n)=>r(n,i);w.exports={compareIdentifiers:r,rcompareIdentifiers:l}},1193:(w,m,r)=>{var l;l=function(){"use strict";return/^$|^module$|\/(?:java|ecma)script/i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1205:(w,m,r)=>{var l;l=function(){"use strict";return/\?/}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1261:(w,m,r)=>{"use strict";const l=r(3908),i=r(8311),n=r(5580),p=(f,c)=>{f=new i(f,c);let o=new l("0.0.0");if(f.test(o)||(o=new l("0.0.0-0"),f.test(o)))return o;o=null;for(let h=0;h<f.set.length;++h){const y=f.set[h];let s=null;y.forEach(g=>{const u=new l(g.semver.version);switch(g.operator){case">":u.prerelease.length===0?u.patch++:u.prerelease.push(0),u.raw=u.format();case"":case">=":(!s||n(u,s))&&(s=u);break;case"<":case"<=":break;default:throw new Error(`Unexpected operation: ${g.operator}`)}}),s&&(!o||n(o,s))&&(o=s)}return o&&f.test(o)?o:null};w.exports=p},1338:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.splice}.apply(m,l),i!==void 0&&(w.exports=i)},1382:(w,m,r)=>{var l;l=function(){"use strict";return function(n){return typeof n=="function"&&typeof n.nodeType!="number"&&typeof n.item!="function"}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1402:(w,m,r)=>{var l,i;l=[r(8320)],i=function(n){"use strict";return n.hasOwnProperty}.apply(m,l),i!==void 0&&(w.exports=i)},1483:(w,m,r)=>{var l;l=function(){"use strict";return["Top","Right","Bottom","Left"]}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1580:(w,m,r)=>{var l,i;l=[r(9978)],i=function(n){"use strict";return n._evalUrl=function(p,f,c){return n.ajax({url:p,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(o){n.globalEval(o,f,c)}})},n._evalUrl}.apply(m,l),i!==void 0&&(w.exports=i)},1628:(w,m,r)=>{var l;l=function(){"use strict";return{guid:Date.now()}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1729:(w,m,r)=>{"use strict";const l=r(144),i=(n,p)=>{const f=l(n,p);return f&&f.prerelease.length?f.prerelease:null};w.exports=i},1763:(w,m,r)=>{"use strict";const l=r(560),i=(n,p)=>l(n,p,!0);w.exports=i},1791:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(1114),r(6599)],i=function(n,p){"use strict";var f=n.Deferred();n.fn.ready=function(o){return f.then(o).catch(function(h){n.readyException(h)}),this},n.extend({isReady:!1,readyWait:1,ready:function(o){(o===!0?--n.readyWait:n.isReady)||(n.isReady=!0,!(o!==!0&&--n.readyWait>0)&&f.resolveWith(p,[n]))}}),n.ready.then=f.then;function c(){p.removeEventListener("DOMContentLoaded",c),window.removeEventListener("load",c),n.ready()}p.readyState==="complete"||p.readyState!=="loading"&&!p.documentElement.doScroll?window.setTimeout(n.ready):(p.addEventListener("DOMContentLoaded",c),window.addEventListener("load",c))}.apply(m,l),i!==void 0&&(w.exports=i)},1801:(w,m,r)=>{var l,i;l=[r(8411),r(9192),r(6599),r(3682)],i=function(n,p){"use strict";return n.extend({queue:function(f,c,o){var h;if(f)return c=(c||"fx")+"queue",h=p.get(f,c),o&&(!h||Array.isArray(o)?h=p.access(f,c,n.makeArray(o)):h.push(o)),h||[]},dequeue:function(f,c){c=c||"fx";var o=n.queue(f,c),h=o.length,y=o.shift(),s=n._queueHooks(f,c),g=function(){n.dequeue(f,c)};y==="inprogress"&&(y=o.shift(),h--),y&&(c==="fx"&&o.unshift("inprogress"),delete s.stop,y.call(f,g,s)),!h&&s&&s.empty.fire()},_queueHooks:function(f,c){var o=c+"queueHooks";return p.get(f,o)||p.access(f,o,{empty:n.Callbacks("once memory").add(function(){p.remove(f,[c+"queue",o])})})}}),n.fn.extend({queue:function(f,c){var o=2;return typeof f!="string"&&(c=f,f="fx",o--),arguments.length<o?n.queue(this[0],f):c===void 0?this:this.each(function(){var h=n.queue(this,f,c);n._queueHooks(this,f),f==="fx"&&h[0]!=="inprogress"&&n.dequeue(this,f)})},dequeue:function(f){return this.each(function(){n.dequeue(this,f)})},clearQueue:function(f){return this.queue(f||"fx",[])},promise:function(f,c){var o,h=1,y=n.Deferred(),s=this,g=this.length,u=function(){--h||y.resolveWith(s,[s])};for(typeof f!="string"&&(c=f,f=void 0),f=f||"fx";g--;)o=p.get(s[g],f+"queueHooks"),o&&o.empty&&(h++,o.empty.add(u));return u(),y.promise(c)}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},1821:(w,m,r)=>{var l;l=function(){"use strict";return function(i,n,p){var f,c,o={};for(c in n)o[c]=i.style[c],i.style[c]=n[c];f=p.call(i);for(c in n)i.style[c]=o[c];return f}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},1832:(w,m,r)=>{"use strict";const l=r(144),i=(n,p)=>{const f=l(n,null,!0),c=l(p,null,!0),o=f.compare(c);if(o===0)return null;const h=o>0,y=h?f:c,s=h?c:f,g=!!y.prerelease.length;if(!!s.prerelease.length&&!g){if(!s.patch&&!s.minor)return"major";if(s.compareMain(y)===0)return s.minor&&!s.patch?"minor":"patch"}const d=g?"pre":"";return f.major!==c.major?d+"major":f.minor!==c.minor?d+"minor":f.patch!==c.patch?d+"patch":"prerelease"};w.exports=i},1896:(w,m,r)=>{var l,i;l=[r(8411),r(4553)],i=function(n){"use strict";n.expr.pseudos.hidden=function(p){return!n.expr.pseudos.visible(p)},n.expr.pseudos.visible=function(p){return!!(p.offsetWidth||p.offsetHeight||p.getClientRects().length)}}.apply(m,l),i!==void 0&&(w.exports=i)},2111:(w,m,r)=>{"use strict";const l=r(4641),i=r(3999),n=r(5580),p=r(4089),f=r(7059),c=r(5200),o=(h,y,s,g)=>{switch(y){case"===":return typeof h=="object"&&(h=h.version),typeof s=="object"&&(s=s.version),h===s;case"!==":return typeof h=="object"&&(h=h.version),typeof s=="object"&&(s=s.version),h!==s;case"":case"=":case"==":return l(h,s,g);case"!=":return i(h,s,g);case">":return n(h,s,g);case">=":return p(h,s,g);case"<":return f(h,s,g);case"<=":return c(h,s,g);default:throw new TypeError(`Invalid operator: ${y}`)}};w.exports=o},2122:(w,m,r)=>{var l,i;l=[r(1402)],i=function(n){"use strict";return n.toString}.apply(m,l),i!==void 0&&(w.exports=i)},2155:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";var p=window.jQuery,f=window.$;n.noConflict=function(c){return window.$===n&&(window.$=f),c&&window.jQuery===n&&(window.jQuery=p),n},typeof noGlobal=="undefined"&&(window.jQuery=window.$=n)}.apply(m,l),i!==void 0&&(w.exports=i)},2189:w=>{var m=function(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32},r=-1,l=1,i=0;m.Diff=function(n,p){return[n,p]},m.prototype.diff_main=function(n,p,f,c){typeof c=="undefined"&&(this.Diff_Timeout<=0?c=Number.MAX_VALUE:c=new Date().getTime()+this.Diff_Timeout*1e3);var o=c;if(n==null||p==null)throw new Error("Null input. (diff_main)");if(n==p)return n?[new m.Diff(i,n)]:[];typeof f=="undefined"&&(f=!0);var h=f,y=this.diff_commonPrefix(n,p),s=n.substring(0,y);n=n.substring(y),p=p.substring(y),y=this.diff_commonSuffix(n,p);var g=n.substring(n.length-y);n=n.substring(0,n.length-y),p=p.substring(0,p.length-y);var u=this.diff_compute_(n,p,h,o);return s&&u.unshift(new m.Diff(i,s)),g&&u.push(new m.Diff(i,g)),this.diff_cleanupMerge(u),u},m.prototype.diff_compute_=function(n,p,f,c){var o;if(!n)return[new m.Diff(l,p)];if(!p)return[new m.Diff(r,n)];var h=n.length>p.length?n:p,y=n.length>p.length?p:n,s=h.indexOf(y);if(s!=-1)return o=[new m.Diff(l,h.substring(0,s)),new m.Diff(i,y),new m.Diff(l,h.substring(s+y.length))],n.length>p.length&&(o[0][0]=o[2][0]=r),o;if(y.length==1)return[new m.Diff(r,n),new m.Diff(l,p)];var g=this.diff_halfMatch_(n,p);if(g){var u=g[0],d=g[1],v=g[2],b=g[3],T=g[4],_=this.diff_main(u,v,f,c),A=this.diff_main(d,b,f,c);return _.concat([new m.Diff(i,T)],A)}return f&&n.length>100&&p.length>100?this.diff_lineMode_(n,p,c):this.diff_bisect_(n,p,c)},m.prototype.diff_lineMode_=function(n,p,f){var c=this.diff_linesToChars_(n,p);n=c.chars1,p=c.chars2;var o=c.lineArray,h=this.diff_main(n,p,!1,f);this.diff_charsToLines_(h,o),this.diff_cleanupSemantic(h),h.push(new m.Diff(i,""));for(var y=0,s=0,g=0,u="",d="";y<h.length;){switch(h[y][0]){case l:g++,d+=h[y][1];break;case r:s++,u+=h[y][1];break;case i:if(s>=1&&g>=1){h.splice(y-s-g,s+g),y=y-s-g;for(var v=this.diff_main(u,d,!1,f),b=v.length-1;b>=0;b--)h.splice(y,0,v[b]);y=y+v.length}g=0,s=0,u="",d="";break}y++}return h.pop(),h},m.prototype.diff_bisect_=function(n,p,f){for(var c=n.length,o=p.length,h=Math.ceil((c+o)/2),y=h,s=2*h,g=new Array(s),u=new Array(s),d=0;d<s;d++)g[d]=-1,u[d]=-1;g[y+1]=0,u[y+1]=0;for(var v=c-o,b=v%2!=0,T=0,_=0,A=0,E=0,I=0;I<h&&!(new Date().getTime()>f);I++){for(var N=-I+T;N<=I-_;N+=2){var B=y+N,C;N==-I||N!=I&&g[B-1]<g[B+1]?C=g[B+1]:C=g[B-1]+1;for(var D=C-N;C<c&&D<o&&n.charAt(C)==p.charAt(D);)C++,D++;if(g[B]=C,C>c)_+=2;else if(D>o)T+=2;else if(b){var P=y+v-N;if(P>=0&&P<s&&u[P]!=-1){var R=c-u[P];if(C>=R)return this.diff_bisectSplit_(n,p,C,D,f)}}}for(var O=-I+A;O<=I-E;O+=2){var P=y+O,R;O==-I||O!=I&&u[P-1]<u[P+1]?R=u[P+1]:R=u[P-1]+1;for(var H=R-O;R<c&&H<o&&n.charAt(c-R-1)==p.charAt(o-H-1);)R++,H++;if(u[P]=R,R>c)E+=2;else if(H>o)A+=2;else if(!b){var B=y+v-O;if(B>=0&&B<s&&g[B]!=-1){var C=g[B],D=y+C-B;if(R=c-R,C>=R)return this.diff_bisectSplit_(n,p,C,D,f)}}}}return[new m.Diff(r,n),new m.Diff(l,p)]},m.prototype.diff_bisectSplit_=function(n,p,f,c,o){var h=n.substring(0,f),y=p.substring(0,c),s=n.substring(f),g=p.substring(c),u=this.diff_main(h,y,!1,o),d=this.diff_main(s,g,!1,o);return u.concat(d)},m.prototype.diff_linesToChars_=function(n,p){var f=[],c={};f[0]="";function o(g){for(var u="",d=0,v=-1,b=f.length;v<g.length-1;){v=g.indexOf(`
`,d),v==-1&&(v=g.length-1);var T=g.substring(d,v+1);(c.hasOwnProperty?c.hasOwnProperty(T):c[T]!==void 0)?u+=String.fromCharCode(c[T]):(b==h&&(T=g.substring(d),v=g.length),u+=String.fromCharCode(b),c[T]=b,f[b++]=T),d=v+1}return u}var h=4e4,y=o(n);h=65535;var s=o(p);return{chars1:y,chars2:s,lineArray:f}},m.prototype.diff_charsToLines_=function(n,p){for(var f=0;f<n.length;f++){for(var c=n[f][1],o=[],h=0;h<c.length;h++)o[h]=p[c.charCodeAt(h)];n[f][1]=o.join("")}},m.prototype.diff_commonPrefix=function(n,p){if(!n||!p||n.charAt(0)!=p.charAt(0))return 0;for(var f=0,c=Math.min(n.length,p.length),o=c,h=0;f<o;)n.substring(h,o)==p.substring(h,o)?(f=o,h=f):c=o,o=Math.floor((c-f)/2+f);return o},m.prototype.diff_commonSuffix=function(n,p){if(!n||!p||n.charAt(n.length-1)!=p.charAt(p.length-1))return 0;for(var f=0,c=Math.min(n.length,p.length),o=c,h=0;f<o;)n.substring(n.length-o,n.length-h)==p.substring(p.length-o,p.length-h)?(f=o,h=f):c=o,o=Math.floor((c-f)/2+f);return o},m.prototype.diff_commonOverlap_=function(n,p){var f=n.length,c=p.length;if(f==0||c==0)return 0;f>c?n=n.substring(f-c):f<c&&(p=p.substring(0,f));var o=Math.min(f,c);if(n==p)return o;for(var h=0,y=1;;){var s=n.substring(o-y),g=p.indexOf(s);if(g==-1)return h;y+=g,(g==0||n.substring(o-y)==p.substring(0,y))&&(h=y,y++)}},m.prototype.diff_halfMatch_=function(n,p){if(this.Diff_Timeout<=0)return null;var f=n.length>p.length?n:p,c=n.length>p.length?p:n;if(f.length<4||c.length*2<f.length)return null;var o=this;function h(_,A,E){for(var I=_.substring(E,E+Math.floor(_.length/4)),N=-1,B="",C,D,P,R;(N=A.indexOf(I,N+1))!=-1;){var O=o.diff_commonPrefix(_.substring(E),A.substring(N)),H=o.diff_commonSuffix(_.substring(0,E),A.substring(0,N));B.length<H+O&&(B=A.substring(N-H,N)+A.substring(N,N+O),C=_.substring(0,E-H),D=_.substring(E+O),P=A.substring(0,N-H),R=A.substring(N+O))}return B.length*2>=_.length?[C,D,P,R,B]:null}var y=h(f,c,Math.ceil(f.length/4)),s=h(f,c,Math.ceil(f.length/2)),g;if(!y&&!s)return null;s?y?g=y[4].length>s[4].length?y:s:g=s:g=y;var u,d,v,b;n.length>p.length?(u=g[0],d=g[1],v=g[2],b=g[3]):(v=g[0],b=g[1],u=g[2],d=g[3]);var T=g[4];return[u,d,v,b,T]},m.prototype.diff_cleanupSemantic=function(n){for(var p=!1,f=[],c=0,o=null,h=0,y=0,s=0,g=0,u=0;h<n.length;)n[h][0]==i?(f[c++]=h,y=g,s=u,g=0,u=0,o=n[h][1]):(n[h][0]==l?g+=n[h][1].length:u+=n[h][1].length,o&&o.length<=Math.max(y,s)&&o.length<=Math.max(g,u)&&(n.splice(f[c-1],0,new m.Diff(r,o)),n[f[c-1]+1][0]=l,c--,c--,h=c>0?f[c-1]:-1,y=0,s=0,g=0,u=0,o=null,p=!0)),h++;for(p&&this.diff_cleanupMerge(n),this.diff_cleanupSemanticLossless(n),h=1;h<n.length;){if(n[h-1][0]==r&&n[h][0]==l){var d=n[h-1][1],v=n[h][1],b=this.diff_commonOverlap_(d,v),T=this.diff_commonOverlap_(v,d);b>=T?(b>=d.length/2||b>=v.length/2)&&(n.splice(h,0,new m.Diff(i,v.substring(0,b))),n[h-1][1]=d.substring(0,d.length-b),n[h+1][1]=v.substring(b),h++):(T>=d.length/2||T>=v.length/2)&&(n.splice(h,0,new m.Diff(i,d.substring(0,T))),n[h-1][0]=l,n[h-1][1]=v.substring(0,v.length-T),n[h+1][0]=r,n[h+1][1]=d.substring(T),h++),h++}h++}},m.prototype.diff_cleanupSemanticLossless=function(n){function p(T,_){if(!T||!_)return 6;var A=T.charAt(T.length-1),E=_.charAt(0),I=A.match(m.nonAlphaNumericRegex_),N=E.match(m.nonAlphaNumericRegex_),B=I&&A.match(m.whitespaceRegex_),C=N&&E.match(m.whitespaceRegex_),D=B&&A.match(m.linebreakRegex_),P=C&&E.match(m.linebreakRegex_),R=D&&T.match(m.blanklineEndRegex_),O=P&&_.match(m.blanklineStartRegex_);return R||O?5:D||P?4:I&&!B&&C?3:B||C?2:I||N?1:0}for(var f=1;f<n.length-1;){if(n[f-1][0]==i&&n[f+1][0]==i){var c=n[f-1][1],o=n[f][1],h=n[f+1][1],y=this.diff_commonSuffix(c,o);if(y){var s=o.substring(o.length-y);c=c.substring(0,c.length-y),o=s+o.substring(0,o.length-y),h=s+h}for(var g=c,u=o,d=h,v=p(c,o)+p(o,h);o.charAt(0)===h.charAt(0);){c+=o.charAt(0),o=o.substring(1)+h.charAt(0),h=h.substring(1);var b=p(c,o)+p(o,h);b>=v&&(v=b,g=c,u=o,d=h)}n[f-1][1]!=g&&(g?n[f-1][1]=g:(n.splice(f-1,1),f--),n[f][1]=u,d?n[f+1][1]=d:(n.splice(f+1,1),f--))}f++}},m.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/,m.whitespaceRegex_=/\s/,m.linebreakRegex_=/[\r\n]/,m.blanklineEndRegex_=/\n\r?\n$/,m.blanklineStartRegex_=/^\r?\n\r?\n/,m.prototype.diff_cleanupEfficiency=function(n){for(var p=!1,f=[],c=0,o=null,h=0,y=!1,s=!1,g=!1,u=!1;h<n.length;)n[h][0]==i?(n[h][1].length<this.Diff_EditCost&&(g||u)?(f[c++]=h,y=g,s=u,o=n[h][1]):(c=0,o=null),g=u=!1):(n[h][0]==r?u=!0:g=!0,o&&(y&&s&&g&&u||o.length<this.Diff_EditCost/2&&y+s+g+u==3)&&(n.splice(f[c-1],0,new m.Diff(r,o)),n[f[c-1]+1][0]=l,c--,o=null,y&&s?(g=u=!0,c=0):(c--,h=c>0?f[c-1]:-1,g=u=!1),p=!0)),h++;p&&this.diff_cleanupMerge(n)},m.prototype.diff_cleanupMerge=function(n){n.push(new m.Diff(i,""));for(var p=0,f=0,c=0,o="",h="",y;p<n.length;)switch(n[p][0]){case l:c++,h+=n[p][1],p++;break;case r:f++,o+=n[p][1],p++;break;case i:f+c>1?(f!==0&&c!==0&&(y=this.diff_commonPrefix(h,o),y!==0&&(p-f-c>0&&n[p-f-c-1][0]==i?n[p-f-c-1][1]+=h.substring(0,y):(n.splice(0,0,new m.Diff(i,h.substring(0,y))),p++),h=h.substring(y),o=o.substring(y)),y=this.diff_commonSuffix(h,o),y!==0&&(n[p][1]=h.substring(h.length-y)+n[p][1],h=h.substring(0,h.length-y),o=o.substring(0,o.length-y))),p-=f+c,n.splice(p,f+c),o.length&&(n.splice(p,0,new m.Diff(r,o)),p++),h.length&&(n.splice(p,0,new m.Diff(l,h)),p++),p++):p!==0&&n[p-1][0]==i?(n[p-1][1]+=n[p][1],n.splice(p,1)):p++,c=0,f=0,o="",h="";break}n[n.length-1][1]===""&&n.pop();var s=!1;for(p=1;p<n.length-1;)n[p-1][0]==i&&n[p+1][0]==i&&(n[p][1].substring(n[p][1].length-n[p-1][1].length)==n[p-1][1]?(n[p][1]=n[p-1][1]+n[p][1].substring(0,n[p][1].length-n[p-1][1].length),n[p+1][1]=n[p-1][1]+n[p+1][1],n.splice(p-1,1),s=!0):n[p][1].substring(0,n[p+1][1].length)==n[p+1][1]&&(n[p-1][1]+=n[p+1][1],n[p][1]=n[p][1].substring(n[p+1][1].length)+n[p+1][1],n.splice(p+1,1),s=!0)),p++;s&&this.diff_cleanupMerge(n)},m.prototype.diff_xIndex=function(n,p){var f=0,c=0,o=0,h=0,y;for(y=0;y<n.length&&(n[y][0]!==l&&(f+=n[y][1].length),n[y][0]!==r&&(c+=n[y][1].length),!(f>p));y++)o=f,h=c;return n.length!=y&&n[y][0]===r?h:h+(p-o)},m.prototype.diff_prettyHtml=function(n){for(var p=[],f=/&/g,c=/</g,o=/>/g,h=/\n/g,y=0;y<n.length;y++){var s=n[y][0],g=n[y][1],u=g.replace(f,"&amp;").replace(c,"&lt;").replace(o,"&gt;").replace(h,"&para;<br>");switch(s){case l:p[y]='<ins style="background:#e6ffe6;">'+u+"</ins>";break;case r:p[y]='<del style="background:#ffe6e6;">'+u+"</del>";break;case i:p[y]="<span>"+u+"</span>";break}}return p.join("")},m.prototype.diff_text1=function(n){for(var p=[],f=0;f<n.length;f++)n[f][0]!==l&&(p[f]=n[f][1]);return p.join("")},m.prototype.diff_text2=function(n){for(var p=[],f=0;f<n.length;f++)n[f][0]!==r&&(p[f]=n[f][1]);return p.join("")},m.prototype.diff_levenshtein=function(n){for(var p=0,f=0,c=0,o=0;o<n.length;o++){var h=n[o][0],y=n[o][1];switch(h){case l:f+=y.length;break;case r:c+=y.length;break;case i:p+=Math.max(f,c),f=0,c=0;break}}return p+=Math.max(f,c),p},m.prototype.diff_toDelta=function(n){for(var p=[],f=0;f<n.length;f++)switch(n[f][0]){case l:p[f]="+"+encodeURI(n[f][1]);break;case r:p[f]="-"+n[f][1].length;break;case i:p[f]="="+n[f][1].length;break}return p.join("	").replace(/%20/g," ")},m.prototype.diff_fromDelta=function(n,p){for(var f=[],c=0,o=0,h=p.split(/\t/g),y=0;y<h.length;y++){var s=h[y].substring(1);switch(h[y].charAt(0)){case"+":try{f[c++]=new m.Diff(l,decodeURI(s))}catch(d){throw new Error("Illegal escape in diff_fromDelta: "+s)}break;case"-":case"=":var g=parseInt(s,10);if(isNaN(g)||g<0)throw new Error("Invalid number in diff_fromDelta: "+s);var u=n.substring(o,o+=g);h[y].charAt(0)=="="?f[c++]=new m.Diff(i,u):f[c++]=new m.Diff(r,u);break;default:if(h[y])throw new Error("Invalid diff operation in diff_fromDelta: "+h[y])}}if(o!=n.length)throw new Error("Delta length ("+o+") does not equal source text length ("+n.length+").");return f},m.prototype.match_main=function(n,p,f){if(n==null||p==null||f==null)throw new Error("Null input. (match_main)");return f=Math.max(0,Math.min(f,n.length)),n==p?0:n.length?n.substring(f,f+p.length)==p?f:this.match_bitap_(n,p,f):-1},m.prototype.match_bitap_=function(n,p,f){if(p.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var c=this.match_alphabet_(p),o=this;function h(C,D){var P=C/p.length,R=Math.abs(f-D);return o.Match_Distance?P+R/o.Match_Distance:R?1:P}var y=this.Match_Threshold,s=n.indexOf(p,f);s!=-1&&(y=Math.min(h(0,s),y),s=n.lastIndexOf(p,f+p.length),s!=-1&&(y=Math.min(h(0,s),y)));var g=1<<p.length-1;s=-1;for(var u,d,v=p.length+n.length,b,T=0;T<p.length;T++){for(u=0,d=v;u<d;)h(T,f+d)<=y?u=d:v=d,d=Math.floor((v-u)/2+u);v=d;var _=Math.max(1,f-d+1),A=Math.min(f+d,n.length)+p.length,E=Array(A+2);E[A+1]=(1<<T)-1;for(var I=A;I>=_;I--){var N=c[n.charAt(I-1)];if(T===0?E[I]=(E[I+1]<<1|1)&N:E[I]=(E[I+1]<<1|1)&N|((b[I+1]|b[I])<<1|1)|b[I+1],E[I]&g){var B=h(T,I-1);if(B<=y)if(y=B,s=I-1,s>f)_=Math.max(1,2*f-s);else break}}if(h(T+1,f)>y)break;b=E}return s},m.prototype.match_alphabet_=function(n){for(var p={},f=0;f<n.length;f++)p[n.charAt(f)]=0;for(var f=0;f<n.length;f++)p[n.charAt(f)]|=1<<n.length-f-1;return p},m.prototype.patch_addContext_=function(n,p){if(p.length!=0){if(n.start2===null)throw Error("patch not initialized");for(var f=p.substring(n.start2,n.start2+n.length1),c=0;p.indexOf(f)!=p.lastIndexOf(f)&&f.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)c+=this.Patch_Margin,f=p.substring(n.start2-c,n.start2+n.length1+c);c+=this.Patch_Margin;var o=p.substring(n.start2-c,n.start2);o&&n.diffs.unshift(new m.Diff(i,o));var h=p.substring(n.start2+n.length1,n.start2+n.length1+c);h&&n.diffs.push(new m.Diff(i,h)),n.start1-=o.length,n.start2-=o.length,n.length1+=o.length+h.length,n.length2+=o.length+h.length}},m.prototype.patch_make=function(n,p,f){var c,o;if(typeof n=="string"&&typeof p=="string"&&typeof f=="undefined")c=n,o=this.diff_main(c,p,!0),o.length>2&&(this.diff_cleanupSemantic(o),this.diff_cleanupEfficiency(o));else if(n&&typeof n=="object"&&typeof p=="undefined"&&typeof f=="undefined")o=n,c=this.diff_text1(o);else if(typeof n=="string"&&p&&typeof p=="object"&&typeof f=="undefined")c=n,o=p;else if(typeof n=="string"&&typeof p=="string"&&f&&typeof f=="object")c=n,o=f;else throw new Error("Unknown call format to patch_make.");if(o.length===0)return[];for(var h=[],y=new m.patch_obj,s=0,g=0,u=0,d=c,v=c,b=0;b<o.length;b++){var T=o[b][0],_=o[b][1];switch(!s&&T!==i&&(y.start1=g,y.start2=u),T){case l:y.diffs[s++]=o[b],y.length2+=_.length,v=v.substring(0,u)+_+v.substring(u);break;case r:y.length1+=_.length,y.diffs[s++]=o[b],v=v.substring(0,u)+v.substring(u+_.length);break;case i:_.length<=2*this.Patch_Margin&&s&&o.length!=b+1?(y.diffs[s++]=o[b],y.length1+=_.length,y.length2+=_.length):_.length>=2*this.Patch_Margin&&s&&(this.patch_addContext_(y,d),h.push(y),y=new m.patch_obj,s=0,d=v,g=u);break}T!==l&&(g+=_.length),T!==r&&(u+=_.length)}return s&&(this.patch_addContext_(y,d),h.push(y)),h},m.prototype.patch_deepCopy=function(n){for(var p=[],f=0;f<n.length;f++){var c=n[f],o=new m.patch_obj;o.diffs=[];for(var h=0;h<c.diffs.length;h++)o.diffs[h]=new m.Diff(c.diffs[h][0],c.diffs[h][1]);o.start1=c.start1,o.start2=c.start2,o.length1=c.length1,o.length2=c.length2,p[f]=o}return p},m.prototype.patch_apply=function(n,p){if(n.length==0)return[p,[]];n=this.patch_deepCopy(n);var f=this.patch_addPadding(n);p=f+p+f,this.patch_splitMax(n);for(var c=0,o=[],h=0;h<n.length;h++){var y=n[h].start2+c,s=this.diff_text1(n[h].diffs),g,u=-1;if(s.length>this.Match_MaxBits?(g=this.match_main(p,s.substring(0,this.Match_MaxBits),y),g!=-1&&(u=this.match_main(p,s.substring(s.length-this.Match_MaxBits),y+s.length-this.Match_MaxBits),(u==-1||g>=u)&&(g=-1))):g=this.match_main(p,s,y),g==-1)o[h]=!1,c-=n[h].length2-n[h].length1;else{o[h]=!0,c=g-y;var d;if(u==-1?d=p.substring(g,g+s.length):d=p.substring(g,u+this.Match_MaxBits),s==d)p=p.substring(0,g)+this.diff_text2(n[h].diffs)+p.substring(g+s.length);else{var v=this.diff_main(s,d,!1);if(s.length>this.Match_MaxBits&&this.diff_levenshtein(v)/s.length>this.Patch_DeleteThreshold)o[h]=!1;else{this.diff_cleanupSemanticLossless(v);for(var b=0,T,_=0;_<n[h].diffs.length;_++){var A=n[h].diffs[_];A[0]!==i&&(T=this.diff_xIndex(v,b)),A[0]===l?p=p.substring(0,g+T)+A[1]+p.substring(g+T):A[0]===r&&(p=p.substring(0,g+T)+p.substring(g+this.diff_xIndex(v,b+A[1].length))),A[0]!==r&&(b+=A[1].length)}}}}}return p=p.substring(f.length,p.length-f.length),[p,o]},m.prototype.patch_addPadding=function(n){for(var p=this.Patch_Margin,f="",c=1;c<=p;c++)f+=String.fromCharCode(c);for(var c=0;c<n.length;c++)n[c].start1+=p,n[c].start2+=p;var o=n[0],h=o.diffs;if(h.length==0||h[0][0]!=i)h.unshift(new m.Diff(i,f)),o.start1-=p,o.start2-=p,o.length1+=p,o.length2+=p;else if(p>h[0][1].length){var y=p-h[0][1].length;h[0][1]=f.substring(h[0][1].length)+h[0][1],o.start1-=y,o.start2-=y,o.length1+=y,o.length2+=y}if(o=n[n.length-1],h=o.diffs,h.length==0||h[h.length-1][0]!=i)h.push(new m.Diff(i,f)),o.length1+=p,o.length2+=p;else if(p>h[h.length-1][1].length){var y=p-h[h.length-1][1].length;h[h.length-1][1]+=f.substring(0,y),o.length1+=y,o.length2+=y}return f},m.prototype.patch_splitMax=function(n){for(var p=this.Match_MaxBits,f=0;f<n.length;f++)if(!(n[f].length1<=p)){var c=n[f];n.splice(f--,1);for(var o=c.start1,h=c.start2,y="";c.diffs.length!==0;){var s=new m.patch_obj,g=!0;for(s.start1=o-y.length,s.start2=h-y.length,y!==""&&(s.length1=s.length2=y.length,s.diffs.push(new m.Diff(i,y)));c.diffs.length!==0&&s.length1<p-this.Patch_Margin;){var u=c.diffs[0][0],d=c.diffs[0][1];u===l?(s.length2+=d.length,h+=d.length,s.diffs.push(c.diffs.shift()),g=!1):u===r&&s.diffs.length==1&&s.diffs[0][0]==i&&d.length>2*p?(s.length1+=d.length,o+=d.length,g=!1,s.diffs.push(new m.Diff(u,d)),c.diffs.shift()):(d=d.substring(0,p-s.length1-this.Patch_Margin),s.length1+=d.length,o+=d.length,u===i?(s.length2+=d.length,h+=d.length):g=!1,s.diffs.push(new m.Diff(u,d)),d==c.diffs[0][1]?c.diffs.shift():c.diffs[0][1]=c.diffs[0][1].substring(d.length))}y=this.diff_text2(s.diffs),y=y.substring(y.length-this.Patch_Margin);var v=this.diff_text1(c.diffs).substring(0,this.Patch_Margin);v!==""&&(s.length1+=v.length,s.length2+=v.length,s.diffs.length!==0&&s.diffs[s.diffs.length-1][0]===i?s.diffs[s.diffs.length-1][1]+=v:s.diffs.push(new m.Diff(i,v))),g||n.splice(++f,0,s)}}},m.prototype.patch_toText=function(n){for(var p=[],f=0;f<n.length;f++)p[f]=n[f];return p.join("")},m.prototype.patch_fromText=function(n){var p=[];if(!n)return p;for(var f=n.split(`
`),c=0,o=/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;c<f.length;){var h=f[c].match(o);if(!h)throw new Error("Invalid patch string: "+f[c]);var y=new m.patch_obj;for(p.push(y),y.start1=parseInt(h[1],10),h[2]===""?(y.start1--,y.length1=1):h[2]=="0"?y.length1=0:(y.start1--,y.length1=parseInt(h[2],10)),y.start2=parseInt(h[3],10),h[4]===""?(y.start2--,y.length2=1):h[4]=="0"?y.length2=0:(y.start2--,y.length2=parseInt(h[4],10)),c++;c<f.length;){var s=f[c].charAt(0);try{var g=decodeURI(f[c].substring(1))}catch(u){throw new Error("Illegal escape in patch_fromText: "+g)}if(s=="-")y.diffs.push(new m.Diff(r,g));else if(s=="+")y.diffs.push(new m.Diff(l,g));else if(s==" ")y.diffs.push(new m.Diff(i,g));else{if(s=="@")break;if(s!=="")throw new Error('Invalid patch mode "'+s+'" in: '+g)}c++}}return p},m.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0},m.patch_obj.prototype.toString=function(){var n,p;this.length1===0?n=this.start1+",0":this.length1==1?n=this.start1+1:n=this.start1+1+","+this.length1,this.length2===0?p=this.start2+",0":this.length2==1?p=this.start2+1:p=this.start2+1+","+this.length2;for(var f=["@@ -"+n+" +"+p+` @@
`],c,o=0;o<this.diffs.length;o++){switch(this.diffs[o][0]){case l:c="+";break;case r:c="-";break;case i:c=" ";break}f[o+1]=c+encodeURI(this.diffs[o][1])+`
`}return f.join("").replace(/%20/g," ")},w.exports=m,w.exports.diff_match_patch=m,w.exports.DIFF_DELETE=r,w.exports.DIFF_INSERT=l,w.exports.DIFF_EQUAL=i},2208:()=>{+function(w){"use strict";function m(i,n){this.$body=w(document.body),this.$scrollElement=w(i).is(document.body)?w(window):w(i),this.options=w.extend({},m.DEFAULTS,n),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",w.proxy(this.process,this)),this.refresh(),this.process()}m.VERSION="3.4.1",m.DEFAULTS={offset:10},m.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},m.prototype.refresh=function(){var i=this,n="offset",p=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),w.isWindow(this.$scrollElement[0])||(n="position",p=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var f=w(this),c=f.data("target")||f.attr("href"),o=/^#./.test(c)&&w(c);return o&&o.length&&o.is(":visible")&&[[o[n]().top+p,c]]||null}).sort(function(f,c){return f[0]-c[0]}).each(function(){i.offsets.push(this[0]),i.targets.push(this[1])})},m.prototype.process=function(){var i=this.$scrollElement.scrollTop()+this.options.offset,n=this.getScrollHeight(),p=this.options.offset+n-this.$scrollElement.height(),f=this.offsets,c=this.targets,o=this.activeTarget,h;if(this.scrollHeight!=n&&this.refresh(),i>=p)return o!=(h=c[c.length-1])&&this.activate(h);if(o&&i<f[0])return this.activeTarget=null,this.clear();for(h=f.length;h--;)o!=c[h]&&i>=f[h]&&(f[h+1]===void 0||i<f[h+1])&&this.activate(c[h])},m.prototype.activate=function(i){this.activeTarget=i,this.clear();var n=this.selector+'[data-target="'+i+'"],'+this.selector+'[href="'+i+'"]',p=w(n).parents("li").addClass("active");p.parent(".dropdown-menu").length&&(p=p.closest("li.dropdown").addClass("active")),p.trigger("activate.bs.scrollspy")},m.prototype.clear=function(){w(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};function r(i){return this.each(function(){var n=w(this),p=n.data("bs.scrollspy"),f=typeof i=="object"&&i;p||n.data("bs.scrollspy",p=new m(this,f)),typeof i=="string"&&p[i]()})}var l=w.fn.scrollspy;w.fn.scrollspy=r,w.fn.scrollspy.Constructor=m,w.fn.scrollspy.noConflict=function(){return w.fn.scrollspy=l,this},w(window).on("load.bs.scrollspy.data-api",function(){w('[data-spy="scroll"]').each(function(){var i=w(this);r.call(i,i.data())})})}(jQuery)},2283:(w,m,r)=>{var l;l=function(){"use strict";return[]}.call(m,r,m,w),l!==void 0&&(w.exports=l)},2332:(w,m,r)=>{var l;l=function(){"use strict";return Object.getPrototypeOf}.call(m,r,m,w),l!==void 0&&(w.exports=l)},2334:function(w){/**!

 @license
 handlebars v4.7.8

Copyright (C) 2011-2019 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/(function(m,r){w.exports=r()})(this,function(){return function(m){function r(i){if(l[i])return l[i].exports;var n=l[i]={exports:{},id:i,loaded:!1};return m[i].call(n.exports,n,n.exports,r),n.loaded=!0,n.exports}var l={};return r.m=m,r.c=l,r.p="",r(0)}([function(m,r,l){"use strict";function i(){var A=T();return A.compile=function(E,I){return y.compile(E,I,A)},A.precompile=function(E,I){return y.precompile(E,I,A)},A.AST=o.default,A.Compiler=y.Compiler,A.JavaScriptCompiler=g.default,A.Parser=h.parser,A.parse=h.parse,A.parseWithoutProcessing=h.parseWithoutProcessing,A}var n=l(1).default;r.__esModule=!0;var p=l(2),f=n(p),c=l(84),o=n(c),h=l(85),y=l(90),s=l(91),g=n(s),u=l(88),d=n(u),v=l(83),b=n(v),T=f.default.create,_=i();_.create=i,b.default(_),_.Visitor=d.default,_.default=_,r.default=_,m.exports=r.default},function(m,r){"use strict";r.default=function(l){return l&&l.__esModule?l:{default:l}},r.__esModule=!0},function(m,r,l){"use strict";function i(){var A=new c.HandlebarsEnvironment;return u.extend(A,c),A.SafeString=h.default,A.Exception=s.default,A.Utils=u,A.escapeExpression=u.escapeExpression,A.VM=v,A.template=function(E){return v.template(E,A)},A}var n=l(3).default,p=l(1).default;r.__esModule=!0;var f=l(4),c=n(f),o=l(77),h=p(o),y=l(6),s=p(y),g=l(5),u=n(g),d=l(78),v=n(d),b=l(83),T=p(b),_=i();_.create=i,T.default(_),_.default=_,r.default=_,m.exports=r.default},function(m,r){"use strict";r.default=function(l){if(l&&l.__esModule)return l;var i={};if(l!=null)for(var n in l)Object.prototype.hasOwnProperty.call(l,n)&&(i[n]=l[n]);return i.default=l,i},r.__esModule=!0},function(m,r,l){"use strict";function i(A,E,I){this.helpers=A||{},this.partials=E||{},this.decorators=I||{},o.registerDefaultHelpers(this),h.registerDefaultDecorators(this)}var n=l(1).default;r.__esModule=!0,r.HandlebarsEnvironment=i;var p=l(5),f=l(6),c=n(f),o=l(10),h=l(70),y=l(72),s=n(y),g=l(73),u="4.7.8";r.VERSION=u;var d=8;r.COMPILER_REVISION=d;var v=7;r.LAST_COMPATIBLE_COMPILER_REVISION=v;var b={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1",7:">= 4.0.0 <4.3.0",8:">= 4.3.0"};r.REVISION_CHANGES=b;var T="[object Object]";i.prototype={constructor:i,logger:s.default,log:s.default.log,registerHelper:function(A,E){if(p.toString.call(A)===T){if(E)throw new c.default("Arg not supported with multiple helpers");p.extend(this.helpers,A)}else this.helpers[A]=E},unregisterHelper:function(A){delete this.helpers[A]},registerPartial:function(A,E){if(p.toString.call(A)===T)p.extend(this.partials,A);else{if(typeof E=="undefined")throw new c.default('Attempting to register a partial called "'+A+'" as undefined');this.partials[A]=E}},unregisterPartial:function(A){delete this.partials[A]},registerDecorator:function(A,E){if(p.toString.call(A)===T){if(E)throw new c.default("Arg not supported with multiple decorators");p.extend(this.decorators,A)}else this.decorators[A]=E},unregisterDecorator:function(A){delete this.decorators[A]},resetLoggedPropertyAccesses:function(){g.resetLoggedProperties()}};var _=s.default.log;r.log=_,r.createFrame=p.createFrame,r.logger=s.default},function(m,r){"use strict";function l(b){return y[b]}function i(b){for(var T=1;T<arguments.length;T++)for(var _ in arguments[T])Object.prototype.hasOwnProperty.call(arguments[T],_)&&(b[_]=arguments[T][_]);return b}function n(b,T){for(var _=0,A=b.length;_<A;_++)if(b[_]===T)return _;return-1}function p(b){if(typeof b!="string"){if(b&&b.toHTML)return b.toHTML();if(b==null)return"";if(!b)return b+"";b=""+b}return g.test(b)?b.replace(s,l):b}function f(b){return!b&&b!==0||!(!v(b)||b.length!==0)}function c(b){var T=i({},b);return T._parent=b,T}function o(b,T){return b.path=T,b}function h(b,T){return(b?b+".":"")+T}r.__esModule=!0,r.extend=i,r.indexOf=n,r.escapeExpression=p,r.isEmpty=f,r.createFrame=c,r.blockParams=o,r.appendContextPath=h;var y={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;","=":"&#x3D;"},s=/[&<>"'`=]/g,g=/[&<>"'`=]/,u=Object.prototype.toString;r.toString=u;var d=function(b){return typeof b=="function"};d(/x/)&&(r.isFunction=d=function(b){return typeof b=="function"&&u.call(b)==="[object Function]"}),r.isFunction=d;var v=Array.isArray||function(b){return!(!b||typeof b!="object")&&u.call(b)==="[object Array]"};r.isArray=v},function(m,r,l){"use strict";function i(f,c){var o=c&&c.loc,h=void 0,y=void 0,s=void 0,g=void 0;o&&(h=o.start.line,y=o.end.line,s=o.start.column,g=o.end.column,f+=" - "+h+":"+s);for(var u=Error.prototype.constructor.call(this,f),d=0;d<p.length;d++)this[p[d]]=u[p[d]];Error.captureStackTrace&&Error.captureStackTrace(this,i);try{o&&(this.lineNumber=h,this.endLineNumber=y,n?(Object.defineProperty(this,"column",{value:s,enumerable:!0}),Object.defineProperty(this,"endColumn",{value:g,enumerable:!0})):(this.column=s,this.endColumn=g))}catch(v){}}var n=l(7).default;r.__esModule=!0;var p=["description","fileName","lineNumber","endLineNumber","message","name","number","stack"];i.prototype=new Error,r.default=i,m.exports=r.default},function(m,r,l){m.exports={default:l(8),__esModule:!0}},function(m,r,l){var i=l(9);m.exports=function(n,p,f){return i.setDesc(n,p,f)}},function(m,r){var l=Object;m.exports={create:l.create,getProto:l.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:l.getOwnPropertyDescriptor,setDesc:l.defineProperty,setDescs:l.defineProperties,getKeys:l.keys,getNames:l.getOwnPropertyNames,getSymbols:l.getOwnPropertySymbols,each:[].forEach}},function(m,r,l){"use strict";function i(E){c.default(E),h.default(E),s.default(E),u.default(E),v.default(E),T.default(E),A.default(E)}function n(E,I,N){E.helpers[I]&&(E.hooks[I]=E.helpers[I],N||delete E.helpers[I])}var p=l(1).default;r.__esModule=!0,r.registerDefaultHelpers=i,r.moveHelperToHooks=n;var f=l(11),c=p(f),o=l(12),h=p(o),y=l(65),s=p(y),g=l(66),u=p(g),d=l(67),v=p(d),b=l(68),T=p(b),_=l(69),A=p(_)},function(m,r,l){"use strict";r.__esModule=!0;var i=l(5);r.default=function(n){n.registerHelper("blockHelperMissing",function(p,f){var c=f.inverse,o=f.fn;if(p===!0)return o(this);if(p===!1||p==null)return c(this);if(i.isArray(p))return p.length>0?(f.ids&&(f.ids=[f.name]),n.helpers.each(p,f)):c(this);if(f.data&&f.ids){var h=i.createFrame(f.data);h.contextPath=i.appendContextPath(f.data.contextPath,f.name),f={data:h}}return o(p,f)})},m.exports=r.default},function(m,r,l){"use strict";var i=l(13).default,n=l(43).default,p=l(55).default,f=l(60).default,c=l(1).default;r.__esModule=!0;var o=l(5),h=l(6),y=c(h);r.default=function(s){s.registerHelper("each",function(g,u){function d(D,P,R){A&&(A.key=D,A.index=P,A.first=P===0,A.last=!!R,E&&(A.contextPath=E+D)),_+=v(g[D],{data:A,blockParams:o.blockParams([g[D],D],[E+D,null])})}if(!u)throw new y.default("Must pass iterator to #each");var v=u.fn,b=u.inverse,T=0,_="",A=void 0,E=void 0;if(u.data&&u.ids&&(E=o.appendContextPath(u.data.contextPath,u.ids[0])+"."),o.isFunction(g)&&(g=g.call(this)),u.data&&(A=o.createFrame(u.data)),g&&typeof g=="object")if(o.isArray(g))for(var I=g.length;T<I;T++)T in g&&d(T,T,T===g.length-1);else if(typeof i=="function"&&g[n]){for(var N=[],B=p(g),C=B.next();!C.done;C=B.next())N.push(C.value);g=N;for(var I=g.length;T<I;T++)d(T,T,T===g.length-1)}else(function(){var D=void 0;f(g).forEach(function(P){D!==void 0&&d(D,T-1),D=P,T++}),D!==void 0&&d(D,T-1,!0)})();return T===0&&(_=b(this)),_})},m.exports=r.default},function(m,r,l){m.exports={default:l(14),__esModule:!0}},function(m,r,l){l(15),l(42),m.exports=l(21).Symbol},function(m,r,l){"use strict";var i=l(9),n=l(16),p=l(17),f=l(18),c=l(20),o=l(24),h=l(19),y=l(27),s=l(28),g=l(30),u=l(29),d=l(31),v=l(36),b=l(37),T=l(38),_=l(39),A=l(32),E=l(26),I=i.getDesc,N=i.setDesc,B=i.create,C=v.get,D=n.Symbol,P=n.JSON,R=P&&P.stringify,O=!1,H=u("_hidden"),$=i.isEnum,j=y("symbol-registry"),G=y("symbols"),L=typeof D=="function",W=Object.prototype,U=f&&h(function(){return B(N({},"a",{get:function(){return N(this,"a",{value:7}).a}})).a!=7})?function(fe,xe,Te){var Le=I(W,xe);Le&&delete W[xe],N(fe,xe,Te),Le&&fe!==W&&N(W,xe,Le)}:N,Q=function(fe){var xe=G[fe]=B(D.prototype);return xe._k=fe,f&&O&&U(W,fe,{configurable:!0,set:function(Te){p(this,H)&&p(this[H],fe)&&(this[H][fe]=!1),U(this,fe,E(1,Te))}}),xe},ne=function(fe){return typeof fe=="symbol"},se=function(fe,xe,Te){return Te&&p(G,xe)?(Te.enumerable?(p(fe,H)&&fe[H][xe]&&(fe[H][xe]=!1),Te=B(Te,{enumerable:E(0,!1)})):(p(fe,H)||N(fe,H,E(1,{})),fe[H][xe]=!0),U(fe,xe,Te)):N(fe,xe,Te)},X=function(fe,xe){_(fe);for(var Te,Le=b(xe=A(xe)),ht=0,Ut=Le.length;Ut>ht;)se(fe,Te=Le[ht++],xe[Te]);return fe},ge=function(fe,xe){return xe===void 0?B(fe):X(B(fe),xe)},be=function(fe){var xe=$.call(this,fe);return!(xe||!p(this,fe)||!p(G,fe)||p(this,H)&&this[H][fe])||xe},_e=function(fe,xe){var Te=I(fe=A(fe),xe);return!Te||!p(G,xe)||p(fe,H)&&fe[H][xe]||(Te.enumerable=!0),Te},Be=function(fe){for(var xe,Te=C(A(fe)),Le=[],ht=0;Te.length>ht;)p(G,xe=Te[ht++])||xe==H||Le.push(xe);return Le},st=function(fe){for(var xe,Te=C(A(fe)),Le=[],ht=0;Te.length>ht;)p(G,xe=Te[ht++])&&Le.push(G[xe]);return Le},bt=function(fe){if(fe!==void 0&&!ne(fe)){for(var xe,Te,Le=[fe],ht=1,Ut=arguments;Ut.length>ht;)Le.push(Ut[ht++]);return xe=Le[1],typeof xe=="function"&&(Te=xe),!Te&&T(xe)||(xe=function(tt,Me){if(Te&&(Me=Te.call(this,tt,Me)),!ne(Me))return Me}),Le[1]=xe,R.apply(P,Le)}},At=h(function(){var fe=D();return R([fe])!="[null]"||R({a:fe})!="{}"||R(Object(fe))!="{}"});L||(D=function(){if(ne(this))throw TypeError("Symbol is not a constructor");return Q(g(arguments.length>0?arguments[0]:void 0))},o(D.prototype,"toString",function(){return this._k}),ne=function(fe){return fe instanceof D},i.create=ge,i.isEnum=be,i.getDesc=_e,i.setDesc=se,i.setDescs=X,i.getNames=v.get=Be,i.getSymbols=st,f&&!l(41)&&o(W,"propertyIsEnumerable",be,!0));var Dt={for:function(fe){return p(j,fe+="")?j[fe]:j[fe]=D(fe)},keyFor:function(fe){return d(j,fe)},useSetter:function(){O=!0},useSimple:function(){O=!1}};i.each.call("hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),function(fe){var xe=u(fe);Dt[fe]=L?xe:Q(xe)}),O=!0,c(c.G+c.W,{Symbol:D}),c(c.S,"Symbol",Dt),c(c.S+c.F*!L,"Object",{create:ge,defineProperty:se,defineProperties:X,getOwnPropertyDescriptor:_e,getOwnPropertyNames:Be,getOwnPropertySymbols:st}),P&&c(c.S+c.F*(!L||At),"JSON",{stringify:bt}),s(D,"Symbol"),s(Math,"Math",!0),s(n.JSON,"JSON",!0)},function(m,r){var l=m.exports=typeof window!="undefined"&&window.Math==Math?window:typeof self!="undefined"&&self.Math==Math?self:Function("return this")();typeof __g=="number"&&(__g=l)},function(m,r){var l={}.hasOwnProperty;m.exports=function(i,n){return l.call(i,n)}},function(m,r,l){m.exports=!l(19)(function(){return Object.defineProperty({},"a",{get:function(){return 7}}).a!=7})},function(m,r){m.exports=function(l){try{return!!l()}catch(i){return!0}}},function(m,r,l){var i=l(16),n=l(21),p=l(22),f="prototype",c=function(o,h,y){var s,g,u,d=o&c.F,v=o&c.G,b=o&c.S,T=o&c.P,_=o&c.B,A=o&c.W,E=v?n:n[h]||(n[h]={}),I=v?i:b?i[h]:(i[h]||{})[f];v&&(y=h);for(s in y)g=!d&&I&&s in I,g&&s in E||(u=g?I[s]:y[s],E[s]=v&&typeof I[s]!="function"?y[s]:_&&g?p(u,i):A&&I[s]==u?function(N){var B=function(C){return this instanceof N?new N(C):N(C)};return B[f]=N[f],B}(u):T&&typeof u=="function"?p(Function.call,u):u,T&&((E[f]||(E[f]={}))[s]=u))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,m.exports=c},function(m,r){var l=m.exports={version:"1.2.6"};typeof __e=="number"&&(__e=l)},function(m,r,l){var i=l(23);m.exports=function(n,p,f){if(i(n),p===void 0)return n;switch(f){case 1:return function(c){return n.call(p,c)};case 2:return function(c,o){return n.call(p,c,o)};case 3:return function(c,o,h){return n.call(p,c,o,h)}}return function(){return n.apply(p,arguments)}}},function(m,r){m.exports=function(l){if(typeof l!="function")throw TypeError(l+" is not a function!");return l}},function(m,r,l){m.exports=l(25)},function(m,r,l){var i=l(9),n=l(26);m.exports=l(18)?function(p,f,c){return i.setDesc(p,f,n(1,c))}:function(p,f,c){return p[f]=c,p}},function(m,r){m.exports=function(l,i){return{enumerable:!(1&l),configurable:!(2&l),writable:!(4&l),value:i}}},function(m,r,l){var i=l(16),n="__core-js_shared__",p=i[n]||(i[n]={});m.exports=function(f){return p[f]||(p[f]={})}},function(m,r,l){var i=l(9).setDesc,n=l(17),p=l(29)("toStringTag");m.exports=function(f,c,o){f&&!n(f=o?f:f.prototype,p)&&i(f,p,{configurable:!0,value:c})}},function(m,r,l){var i=l(27)("wks"),n=l(30),p=l(16).Symbol;m.exports=function(f){return i[f]||(i[f]=p&&p[f]||(p||n)("Symbol."+f))}},function(m,r){var l=0,i=Math.random();m.exports=function(n){return"Symbol(".concat(n===void 0?"":n,")_",(++l+i).toString(36))}},function(m,r,l){var i=l(9),n=l(32);m.exports=function(p,f){for(var c,o=n(p),h=i.getKeys(o),y=h.length,s=0;y>s;)if(o[c=h[s++]]===f)return c}},function(m,r,l){var i=l(33),n=l(35);m.exports=function(p){return i(n(p))}},function(m,r,l){var i=l(34);m.exports=Object("z").propertyIsEnumerable(0)?Object:function(n){return i(n)=="String"?n.split(""):Object(n)}},function(m,r){var l={}.toString;m.exports=function(i){return l.call(i).slice(8,-1)}},function(m,r){m.exports=function(l){if(l==null)throw TypeError("Can't call method on  "+l);return l}},function(m,r,l){var i=l(32),n=l(9).getNames,p={}.toString,f=typeof window=="object"&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],c=function(o){try{return n(o)}catch(h){return f.slice()}};m.exports.get=function(o){return f&&p.call(o)=="[object Window]"?c(o):n(i(o))}},function(m,r,l){var i=l(9);m.exports=function(n){var p=i.getKeys(n),f=i.getSymbols;if(f)for(var c,o=f(n),h=i.isEnum,y=0;o.length>y;)h.call(n,c=o[y++])&&p.push(c);return p}},function(m,r,l){var i=l(34);m.exports=Array.isArray||function(n){return i(n)=="Array"}},function(m,r,l){var i=l(40);m.exports=function(n){if(!i(n))throw TypeError(n+" is not an object!");return n}},function(m,r){m.exports=function(l){return typeof l=="object"?l!==null:typeof l=="function"}},function(m,r){m.exports=!0},function(m,r){},function(m,r,l){m.exports={default:l(44),__esModule:!0}},function(m,r,l){l(45),l(51),m.exports=l(29)("iterator")},function(m,r,l){"use strict";var i=l(46)(!0);l(48)(String,"String",function(n){this._t=String(n),this._i=0},function(){var n,p=this._t,f=this._i;return f>=p.length?{value:void 0,done:!0}:(n=i(p,f),this._i+=n.length,{value:n,done:!1})})},function(m,r,l){var i=l(47),n=l(35);m.exports=function(p){return function(f,c){var o,h,y=String(n(f)),s=i(c),g=y.length;return s<0||s>=g?p?"":void 0:(o=y.charCodeAt(s),o<55296||o>56319||s+1===g||(h=y.charCodeAt(s+1))<56320||h>57343?p?y.charAt(s):o:p?y.slice(s,s+2):(o-55296<<10)+(h-56320)+65536)}}},function(m,r){var l=Math.ceil,i=Math.floor;m.exports=function(n){return isNaN(n=+n)?0:(n>0?i:l)(n)}},function(m,r,l){"use strict";var i=l(41),n=l(20),p=l(24),f=l(25),c=l(17),o=l(49),h=l(50),y=l(28),s=l(9).getProto,g=l(29)("iterator"),u=!([].keys&&"next"in[].keys()),d="@@iterator",v="keys",b="values",T=function(){return this};m.exports=function(_,A,E,I,N,B,C){h(E,A,I);var D,P,R=function(U){if(!u&&U in j)return j[U];switch(U){case v:return function(){return new E(this,U)};case b:return function(){return new E(this,U)}}return function(){return new E(this,U)}},O=A+" Iterator",H=N==b,$=!1,j=_.prototype,G=j[g]||j[d]||N&&j[N],L=G||R(N);if(G){var W=s(L.call(new _));y(W,O,!0),!i&&c(j,d)&&f(W,g,T),H&&G.name!==b&&($=!0,L=function(){return G.call(this)})}if(i&&!C||!u&&!$&&j[g]||f(j,g,L),o[A]=L,o[O]=T,N)if(D={values:H?L:R(b),keys:B?L:R(v),entries:H?R("entries"):L},C)for(P in D)P in j||p(j,P,D[P]);else n(n.P+n.F*(u||$),A,D);return D}},function(m,r){m.exports={}},function(m,r,l){"use strict";var i=l(9),n=l(26),p=l(28),f={};l(25)(f,l(29)("iterator"),function(){return this}),m.exports=function(c,o,h){c.prototype=i.create(f,{next:n(1,h)}),p(c,o+" Iterator")}},function(m,r,l){l(52);var i=l(49);i.NodeList=i.HTMLCollection=i.Array},function(m,r,l){"use strict";var i=l(53),n=l(54),p=l(49),f=l(32);m.exports=l(48)(Array,"Array",function(c,o){this._t=f(c),this._i=0,this._k=o},function(){var c=this._t,o=this._k,h=this._i++;return!c||h>=c.length?(this._t=void 0,n(1)):o=="keys"?n(0,h):o=="values"?n(0,c[h]):n(0,[h,c[h]])},"values"),p.Arguments=p.Array,i("keys"),i("values"),i("entries")},function(m,r){m.exports=function(){}},function(m,r){m.exports=function(l,i){return{value:i,done:!!l}}},function(m,r,l){m.exports={default:l(56),__esModule:!0}},function(m,r,l){l(51),l(45),m.exports=l(57)},function(m,r,l){var i=l(39),n=l(58);m.exports=l(21).getIterator=function(p){var f=n(p);if(typeof f!="function")throw TypeError(p+" is not iterable!");return i(f.call(p))}},function(m,r,l){var i=l(59),n=l(29)("iterator"),p=l(49);m.exports=l(21).getIteratorMethod=function(f){if(f!=null)return f[n]||f["@@iterator"]||p[i(f)]}},function(m,r,l){var i=l(34),n=l(29)("toStringTag"),p=i(function(){return arguments}())=="Arguments";m.exports=function(f){var c,o,h;return f===void 0?"Undefined":f===null?"Null":typeof(o=(c=Object(f))[n])=="string"?o:p?i(c):(h=i(c))=="Object"&&typeof c.callee=="function"?"Arguments":h}},function(m,r,l){m.exports={default:l(61),__esModule:!0}},function(m,r,l){l(62),m.exports=l(21).Object.keys},function(m,r,l){var i=l(63);l(64)("keys",function(n){return function(p){return n(i(p))}})},function(m,r,l){var i=l(35);m.exports=function(n){return Object(i(n))}},function(m,r,l){var i=l(20),n=l(21),p=l(19);m.exports=function(f,c){var o=(n.Object||{})[f]||Object[f],h={};h[f]=c(o),i(i.S+i.F*p(function(){o(1)}),"Object",h)}},function(m,r,l){"use strict";var i=l(1).default;r.__esModule=!0;var n=l(6),p=i(n);r.default=function(f){f.registerHelper("helperMissing",function(){if(arguments.length!==1)throw new p.default('Missing helper: "'+arguments[arguments.length-1].name+'"')})},m.exports=r.default},function(m,r,l){"use strict";var i=l(1).default;r.__esModule=!0;var n=l(5),p=l(6),f=i(p);r.default=function(c){c.registerHelper("if",function(o,h){if(arguments.length!=2)throw new f.default("#if requires exactly one argument");return n.isFunction(o)&&(o=o.call(this)),!h.hash.includeZero&&!o||n.isEmpty(o)?h.inverse(this):h.fn(this)}),c.registerHelper("unless",function(o,h){if(arguments.length!=2)throw new f.default("#unless requires exactly one argument");return c.helpers.if.call(this,o,{fn:h.inverse,inverse:h.fn,hash:h.hash})})},m.exports=r.default},function(m,r){"use strict";r.__esModule=!0,r.default=function(l){l.registerHelper("log",function(){for(var i=[void 0],n=arguments[arguments.length-1],p=0;p<arguments.length-1;p++)i.push(arguments[p]);var f=1;n.hash.level!=null?f=n.hash.level:n.data&&n.data.level!=null&&(f=n.data.level),i[0]=f,l.log.apply(l,i)})},m.exports=r.default},function(m,r){"use strict";r.__esModule=!0,r.default=function(l){l.registerHelper("lookup",function(i,n,p){return i&&p.lookupProperty(i,n)})},m.exports=r.default},function(m,r,l){"use strict";var i=l(1).default;r.__esModule=!0;var n=l(5),p=l(6),f=i(p);r.default=function(c){c.registerHelper("with",function(o,h){if(arguments.length!=2)throw new f.default("#with requires exactly one argument");n.isFunction(o)&&(o=o.call(this));var y=h.fn;if(n.isEmpty(o))return h.inverse(this);var s=h.data;return h.data&&h.ids&&(s=n.createFrame(h.data),s.contextPath=n.appendContextPath(h.data.contextPath,h.ids[0])),y(o,{data:s,blockParams:n.blockParams([o],[s&&s.contextPath])})})},m.exports=r.default},function(m,r,l){"use strict";function i(c){f.default(c)}var n=l(1).default;r.__esModule=!0,r.registerDefaultDecorators=i;var p=l(71),f=n(p)},function(m,r,l){"use strict";r.__esModule=!0;var i=l(5);r.default=function(n){n.registerDecorator("inline",function(p,f,c,o){var h=p;return f.partials||(f.partials={},h=function(y,s){var g=c.partials;c.partials=i.extend({},g,f.partials);var u=p(y,s);return c.partials=g,u}),f.partials[o.args[0]]=o.fn,h})},m.exports=r.default},function(m,r,l){"use strict";r.__esModule=!0;var i=l(5),n={methodMap:["debug","info","warn","error"],level:"info",lookupLevel:function(p){if(typeof p=="string"){var f=i.indexOf(n.methodMap,p.toLowerCase());p=f>=0?f:parseInt(p,10)}return p},log:function(p){if(p=n.lookupLevel(p),typeof console!="undefined"&&n.lookupLevel(n.level)<=p){var f=n.methodMap[p];console[f]||(f="log");for(var c=arguments.length,o=Array(c>1?c-1:0),h=1;h<c;h++)o[h-1]=arguments[h];console[f].apply(console,o)}}};r.default=n,m.exports=r.default},function(m,r,l){"use strict";function i(v){var b=o(null);b.constructor=!1,b.__defineGetter__=!1,b.__defineSetter__=!1,b.__lookupGetter__=!1;var T=o(null);return T.__proto__=!1,{properties:{whitelist:s.createNewLookupObject(T,v.allowedProtoProperties),defaultValue:v.allowProtoPropertiesByDefault},methods:{whitelist:s.createNewLookupObject(b,v.allowedProtoMethods),defaultValue:v.allowProtoMethodsByDefault}}}function n(v,b,T){return p(typeof v=="function"?b.methods:b.properties,T)}function p(v,b){return v.whitelist[b]!==void 0?v.whitelist[b]===!0:v.defaultValue!==void 0?v.defaultValue:(f(b),!1)}function f(v){d[v]!==!0&&(d[v]=!0,u.default.log("error",'Handlebars: Access has been denied to resolve the property "'+v+`" because it is not an "own property" of its parent.
You can add a runtime option to disable the check or this warning:
See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details`))}function c(){h(d).forEach(function(v){delete d[v]})}var o=l(74).default,h=l(60).default,y=l(1).default;r.__esModule=!0,r.createProtoAccessControl=i,r.resultIsAllowed=n,r.resetLoggedProperties=c;var s=l(76),g=l(72),u=y(g),d=o(null)},function(m,r,l){m.exports={default:l(75),__esModule:!0}},function(m,r,l){var i=l(9);m.exports=function(n,p){return i.create(n,p)}},function(m,r,l){"use strict";function i(){for(var f=arguments.length,c=Array(f),o=0;o<f;o++)c[o]=arguments[o];return p.extend.apply(void 0,[n(null)].concat(c))}var n=l(74).default;r.__esModule=!0,r.createNewLookupObject=i;var p=l(5)},function(m,r){"use strict";function l(i){this.string=i}r.__esModule=!0,l.prototype.toString=l.prototype.toHTML=function(){return""+this.string},r.default=l,m.exports=r.default},function(m,r,l){"use strict";function i(D){var P=D&&D[0]||1,R=I.COMPILER_REVISION;if(!(P>=I.LAST_COMPATIBLE_COMPILER_REVISION&&P<=I.COMPILER_REVISION)){if(P<I.LAST_COMPATIBLE_COMPILER_REVISION){var O=I.REVISION_CHANGES[R],H=I.REVISION_CHANGES[P];throw new E.default("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+O+") or downgrade your runtime to an older version ("+H+").")}throw new E.default("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+D[1]+").")}}function n(D,P){function R(j,G,L){L.hash&&(G=_.extend({},G,L.hash),L.ids&&(L.ids[0]=!0)),j=P.VM.resolvePartial.call(this,j,G,L);var W=_.extend({},L,{hooks:this.hooks,protoAccessControl:this.protoAccessControl}),U=P.VM.invokePartial.call(this,j,G,W);if(U==null&&P.compile&&(L.partials[L.name]=P.compile(j,D.compilerOptions,P),U=L.partials[L.name](G,W)),U!=null){if(L.indent){for(var Q=U.split(`
`),ne=0,se=Q.length;ne<se&&(Q[ne]||ne+1!==se);ne++)Q[ne]=L.indent+Q[ne];U=Q.join(`
`)}return U}throw new E.default("The partial "+L.name+" could not be compiled when running in runtime-only mode")}function O(j){function G(ne){return""+D.main($,ne,$.helpers,$.partials,W,Q,U)}var L=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],W=L.data;O._setup(L),!L.partial&&D.useData&&(W=h(j,W));var U=void 0,Q=D.useBlockParams?[]:void 0;return D.useDepths&&(U=L.depths?j!=L.depths[0]?[j].concat(L.depths):L.depths:[j]),(G=y(D.main,G,$,L.depths||[],W,Q))(j,L)}if(!P)throw new E.default("No environment passed to template");if(!D||!D.main)throw new E.default("Unknown template object: "+typeof D);D.main.decorator=D.main_d,P.VM.checkRevision(D.compiler);var H=D.compiler&&D.compiler[0]===7,$={strict:function(j,G,L){if(!(j&&G in j))throw new E.default('"'+G+'" not defined in '+j,{loc:L});return $.lookupProperty(j,G)},lookupProperty:function(j,G){var L=j[G];return L==null||Object.prototype.hasOwnProperty.call(j,G)||C.resultIsAllowed(L,$.protoAccessControl,G)?L:void 0},lookup:function(j,G){for(var L=j.length,W=0;W<L;W++){var U=j[W]&&$.lookupProperty(j[W],G);if(U!=null)return j[W][G]}},lambda:function(j,G){return typeof j=="function"?j.call(G):j},escapeExpression:_.escapeExpression,invokePartial:R,fn:function(j){var G=D[j];return G.decorator=D[j+"_d"],G},programs:[],program:function(j,G,L,W,U){var Q=this.programs[j],ne=this.fn(j);return G||U||W||L?Q=p(this,j,ne,G,L,W,U):Q||(Q=this.programs[j]=p(this,j,ne)),Q},data:function(j,G){for(;j&&G--;)j=j._parent;return j},mergeIfNeeded:function(j,G){var L=j||G;return j&&G&&j!==G&&(L=_.extend({},G,j)),L},nullContext:u({}),noop:P.VM.noop,compilerInfo:D.compiler};return O.isTop=!0,O._setup=function(j){if(j.partial)$.protoAccessControl=j.protoAccessControl,$.helpers=j.helpers,$.partials=j.partials,$.decorators=j.decorators,$.hooks=j.hooks;else{var G=_.extend({},P.helpers,j.helpers);s(G,$),$.helpers=G,D.usePartial&&($.partials=$.mergeIfNeeded(j.partials,P.partials)),(D.usePartial||D.useDecorators)&&($.decorators=_.extend({},P.decorators,j.decorators)),$.hooks={},$.protoAccessControl=C.createProtoAccessControl(j);var L=j.allowCallsToHelperMissing||H;N.moveHelperToHooks($,"helperMissing",L),N.moveHelperToHooks($,"blockHelperMissing",L)}},O._child=function(j,G,L,W){if(D.useBlockParams&&!L)throw new E.default("must pass block params");if(D.useDepths&&!W)throw new E.default("must pass parent depths");return p($,j,D[j],G,0,L,W)},O}function p(D,P,R,O,H,$,j){function G(L){var W=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],U=j;return!j||L==j[0]||L===D.nullContext&&j[0]===null||(U=[L].concat(j)),R(D,L,D.helpers,D.partials,W.data||O,$&&[W.blockParams].concat($),U)}return G=y(R,G,D,j,O,$),G.program=P,G.depth=j?j.length:0,G.blockParams=H||0,G}function f(D,P,R){return D?D.call||R.name||(R.name=D,D=R.partials[D]):D=R.name==="@partial-block"?R.data["partial-block"]:R.partials[R.name],D}function c(D,P,R){var O=R.data&&R.data["partial-block"];R.partial=!0,R.ids&&(R.data.contextPath=R.ids[0]||R.data.contextPath);var H=void 0;if(R.fn&&R.fn!==o&&function(){R.data=I.createFrame(R.data);var $=R.fn;H=R.data["partial-block"]=function(j){var G=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];return G.data=I.createFrame(G.data),G.data["partial-block"]=O,$(j,G)},$.partials&&(R.partials=_.extend({},R.partials,$.partials))}(),D===void 0&&H&&(D=H),D===void 0)throw new E.default("The partial "+R.name+" could not be found");if(D instanceof Function)return D(P,R)}function o(){return""}function h(D,P){return P&&"root"in P||(P=P?I.createFrame(P):{},P.root=D),P}function y(D,P,R,O,H,$){if(D.decorator){var j={};P=D.decorator(P,j,R,O&&O[0],H,$,O),_.extend(P,j)}return P}function s(D,P){d(D).forEach(function(R){var O=D[R];D[R]=g(O,P)})}function g(D,P){var R=P.lookupProperty;return B.wrapHelper(D,function(O){return _.extend({lookupProperty:R},O)})}var u=l(79).default,d=l(60).default,v=l(3).default,b=l(1).default;r.__esModule=!0,r.checkRevision=i,r.template=n,r.wrapProgram=p,r.resolvePartial=f,r.invokePartial=c,r.noop=o;var T=l(5),_=v(T),A=l(6),E=b(A),I=l(4),N=l(10),B=l(82),C=l(73)},function(m,r,l){m.exports={default:l(80),__esModule:!0}},function(m,r,l){l(81),m.exports=l(21).Object.seal},function(m,r,l){var i=l(40);l(64)("seal",function(n){return function(p){return n&&i(p)?n(p):p}})},function(m,r){"use strict";function l(i,n){if(typeof i!="function")return i;var p=function(){var f=arguments[arguments.length-1];return arguments[arguments.length-1]=n(f),i.apply(this,arguments)};return p}r.__esModule=!0,r.wrapHelper=l},function(m,r){"use strict";r.__esModule=!0,r.default=function(l){(function(){typeof globalThis!="object"&&(Object.prototype.__defineGetter__("__magic__",function(){return this}),__magic__.globalThis=__magic__,delete Object.prototype.__magic__)})();var i=globalThis.Handlebars;l.noConflict=function(){return globalThis.Handlebars===l&&(globalThis.Handlebars=i),l}},m.exports=r.default},function(m,r){"use strict";r.__esModule=!0;var l={helpers:{helperExpression:function(i){return i.type==="SubExpression"||(i.type==="MustacheStatement"||i.type==="BlockStatement")&&!!(i.params&&i.params.length||i.hash)},scopedId:function(i){return/^\.|this\b/.test(i.original)},simpleId:function(i){return i.parts.length===1&&!l.helpers.scopedId(i)&&!i.depth}}};r.default=l,m.exports=r.default},function(m,r,l){"use strict";function i(v,b){if(v.type==="Program")return v;o.default.yy=d,d.locInfo=function(_){return new d.SourceLocation(b&&b.srcName,_)};var T=o.default.parse(v);return T}function n(v,b){var T=i(v,b),_=new y.default(b);return _.accept(T)}var p=l(1).default,f=l(3).default;r.__esModule=!0,r.parseWithoutProcessing=i,r.parse=n;var c=l(86),o=p(c),h=l(87),y=p(h),s=l(89),g=f(s),u=l(5);r.parser=o.default;var d={};u.extend(d,g)},function(m,r){"use strict";r.__esModule=!0;var l=function(){function i(){this.yy={}}var n={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,partialBlock:12,content:13,COMMENT:14,CONTENT:15,openRawBlock:16,rawBlock_repetition0:17,END_RAW_BLOCK:18,OPEN_RAW_BLOCK:19,helperName:20,openRawBlock_repetition0:21,openRawBlock_option0:22,CLOSE_RAW_BLOCK:23,openBlock:24,block_option0:25,closeBlock:26,openInverse:27,block_option1:28,OPEN_BLOCK:29,openBlock_repetition0:30,openBlock_option0:31,openBlock_option1:32,CLOSE:33,OPEN_INVERSE:34,openInverse_repetition0:35,openInverse_option0:36,openInverse_option1:37,openInverseChain:38,OPEN_INVERSE_CHAIN:39,openInverseChain_repetition0:40,openInverseChain_option0:41,openInverseChain_option1:42,inverseAndProgram:43,INVERSE:44,inverseChain:45,inverseChain_option0:46,OPEN_ENDBLOCK:47,OPEN:48,mustache_repetition0:49,mustache_option0:50,OPEN_UNESCAPED:51,mustache_repetition1:52,mustache_option1:53,CLOSE_UNESCAPED:54,OPEN_PARTIAL:55,partialName:56,partial_repetition0:57,partial_option0:58,openPartialBlock:59,OPEN_PARTIAL_BLOCK:60,openPartialBlock_repetition0:61,openPartialBlock_option0:62,param:63,sexpr:64,OPEN_SEXPR:65,sexpr_repetition0:66,sexpr_option0:67,CLOSE_SEXPR:68,hash:69,hash_repetition_plus0:70,hashSegment:71,ID:72,EQUALS:73,blockParams:74,OPEN_BLOCK_PARAMS:75,blockParams_repetition_plus0:76,CLOSE_BLOCK_PARAMS:77,path:78,dataName:79,STRING:80,NUMBER:81,BOOLEAN:82,UNDEFINED:83,NULL:84,DATA:85,pathSegments:86,SEP:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,0],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function(f,c,o,h,y,s,g){var u=s.length-1;switch(y){case 1:return s[u-1];case 2:this.$=h.prepareProgram(s[u]);break;case 3:this.$=s[u];break;case 4:this.$=s[u];break;case 5:this.$=s[u];break;case 6:this.$=s[u];break;case 7:this.$=s[u];break;case 8:this.$=s[u];break;case 9:this.$={type:"CommentStatement",value:h.stripComment(s[u]),strip:h.stripFlags(s[u],s[u]),loc:h.locInfo(this._$)};break;case 10:this.$={type:"ContentStatement",original:s[u],value:s[u],loc:h.locInfo(this._$)};break;case 11:this.$=h.prepareRawBlock(s[u-2],s[u-1],s[u],this._$);break;case 12:this.$={path:s[u-3],params:s[u-2],hash:s[u-1]};break;case 13:this.$=h.prepareBlock(s[u-3],s[u-2],s[u-1],s[u],!1,this._$);break;case 14:this.$=h.prepareBlock(s[u-3],s[u-2],s[u-1],s[u],!0,this._$);break;case 15:this.$={open:s[u-5],path:s[u-4],params:s[u-3],hash:s[u-2],blockParams:s[u-1],strip:h.stripFlags(s[u-5],s[u])};break;case 16:this.$={path:s[u-4],params:s[u-3],hash:s[u-2],blockParams:s[u-1],strip:h.stripFlags(s[u-5],s[u])};break;case 17:this.$={path:s[u-4],params:s[u-3],hash:s[u-2],blockParams:s[u-1],strip:h.stripFlags(s[u-5],s[u])};break;case 18:this.$={strip:h.stripFlags(s[u-1],s[u-1]),program:s[u]};break;case 19:var d=h.prepareBlock(s[u-2],s[u-1],s[u],s[u],!1,this._$),v=h.prepareProgram([d],s[u-1].loc);v.chained=!0,this.$={strip:s[u-2].strip,program:v,chain:!0};break;case 20:this.$=s[u];break;case 21:this.$={path:s[u-1],strip:h.stripFlags(s[u-2],s[u])};break;case 22:this.$=h.prepareMustache(s[u-3],s[u-2],s[u-1],s[u-4],h.stripFlags(s[u-4],s[u]),this._$);break;case 23:this.$=h.prepareMustache(s[u-3],s[u-2],s[u-1],s[u-4],h.stripFlags(s[u-4],s[u]),this._$);break;case 24:this.$={type:"PartialStatement",name:s[u-3],params:s[u-2],hash:s[u-1],indent:"",strip:h.stripFlags(s[u-4],s[u]),loc:h.locInfo(this._$)};break;case 25:this.$=h.preparePartialBlock(s[u-2],s[u-1],s[u],this._$);break;case 26:this.$={path:s[u-3],params:s[u-2],hash:s[u-1],strip:h.stripFlags(s[u-4],s[u])};break;case 27:this.$=s[u];break;case 28:this.$=s[u];break;case 29:this.$={type:"SubExpression",path:s[u-3],params:s[u-2],hash:s[u-1],loc:h.locInfo(this._$)};break;case 30:this.$={type:"Hash",pairs:s[u],loc:h.locInfo(this._$)};break;case 31:this.$={type:"HashPair",key:h.id(s[u-2]),value:s[u],loc:h.locInfo(this._$)};break;case 32:this.$=h.id(s[u-1]);break;case 33:this.$=s[u];break;case 34:this.$=s[u];break;case 35:this.$={type:"StringLiteral",value:s[u],original:s[u],loc:h.locInfo(this._$)};break;case 36:this.$={type:"NumberLiteral",value:Number(s[u]),original:Number(s[u]),loc:h.locInfo(this._$)};break;case 37:this.$={type:"BooleanLiteral",value:s[u]==="true",original:s[u]==="true",loc:h.locInfo(this._$)};break;case 38:this.$={type:"UndefinedLiteral",original:void 0,value:void 0,loc:h.locInfo(this._$)};break;case 39:this.$={type:"NullLiteral",original:null,value:null,loc:h.locInfo(this._$)};break;case 40:this.$=s[u];break;case 41:this.$=s[u];break;case 42:this.$=h.preparePath(!0,s[u],this._$);break;case 43:this.$=h.preparePath(!1,s[u],this._$);break;case 44:s[u-2].push({part:h.id(s[u]),original:s[u],separator:s[u-1]}),this.$=s[u-2];break;case 45:this.$=[{part:h.id(s[u]),original:s[u]}];break;case 46:this.$=[];break;case 47:s[u-1].push(s[u]);break;case 48:this.$=[];break;case 49:s[u-1].push(s[u]);break;case 50:this.$=[];break;case 51:s[u-1].push(s[u]);break;case 58:this.$=[];break;case 59:s[u-1].push(s[u]);break;case 64:this.$=[];break;case 65:s[u-1].push(s[u]);break;case 70:this.$=[];break;case 71:s[u-1].push(s[u]);break;case 78:this.$=[];break;case 79:s[u-1].push(s[u]);break;case 82:this.$=[];break;case 83:s[u-1].push(s[u]);break;case 86:this.$=[];break;case 87:s[u-1].push(s[u]);break;case 90:this.$=[];break;case 91:s[u-1].push(s[u]);break;case 94:this.$=[];break;case 95:s[u-1].push(s[u]);break;case 98:this.$=[s[u]];break;case 99:s[u-1].push(s[u]);break;case 100:this.$=[s[u]];break;case 101:s[u-1].push(s[u])}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{15:[2,48],17:39,18:[2,48]},{20:41,56:40,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:44,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:45,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:41,56:48,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:49,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,50]},{72:[1,35],86:51},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:52,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:53,38:55,39:[1,57],43:56,44:[1,58],45:54,47:[2,54]},{28:59,43:60,44:[1,58],47:[2,56]},{13:62,15:[1,20],18:[1,61]},{33:[2,86],57:63,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:64,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:65,47:[1,66]},{30:67,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:68,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:69,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:70,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:74,33:[2,80],50:71,63:72,64:75,65:[1,43],69:73,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,79]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,50]},{20:74,53:80,54:[2,84],63:81,64:75,65:[1,43],69:82,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:83,47:[1,66]},{47:[2,55]},{4:84,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:85,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:86,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:87,47:[1,66]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:74,33:[2,88],58:88,63:89,64:75,65:[1,43],69:90,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:91,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:92,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,31:93,33:[2,60],63:94,64:75,65:[1,43],69:95,70:76,71:77,72:[1,78],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,66],36:96,63:97,64:75,65:[1,43],69:98,70:76,71:77,72:[1,78],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,22:99,23:[2,52],63:100,64:75,65:[1,43],69:101,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,92],62:102,63:103,64:75,65:[1,43],69:104,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,105]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:106,72:[1,107],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,108],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,109]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:55,39:[1,57],43:56,44:[1,58],45:111,46:110,47:[2,76]},{33:[2,70],40:112,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,113]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:74,63:115,64:75,65:[1,43],67:114,68:[2,96],69:116,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,117]},{32:118,33:[2,62],74:119,75:[1,120]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:121,74:122,75:[1,120]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,123]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,124]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,108]},{20:74,63:125,64:75,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:74,33:[2,72],41:126,63:127,64:75,65:[1,43],69:128,70:76,71:77,72:[1,78],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,129]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,130]},{33:[2,63]},{72:[1,132],76:131},{33:[1,133]},{33:[2,69]},{15:[2,12],18:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:134,74:135,75:[1,120]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,137],77:[1,136]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,138]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],54:[2,55],56:[2,20],60:[2,57],73:[2,81],82:[2,85],86:[2,18],90:[2,89],101:[2,53],104:[2,93],110:[2,19],111:[2,77],116:[2,97],119:[2,63],122:[2,69],135:[2,75],136:[2,32]},parseError:function(f,c){throw new Error(f)},parse:function(f){function c(){var $;return $=o.lexer.lex()||1,typeof $!="number"&&($=o.symbols_[$]||$),$}var o=this,h=[0],y=[null],s=[],g=this.table,u="",d=0,v=0,b=0;this.lexer.setInput(f),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,typeof this.lexer.yylloc=="undefined"&&(this.lexer.yylloc={});var T=this.lexer.yylloc;s.push(T);var _=this.lexer.options&&this.lexer.options.ranges;typeof this.yy.parseError=="function"&&(this.parseError=this.yy.parseError);for(var A,E,I,N,B,C,D,P,R,O={};;){if(I=h[h.length-1],this.defaultActions[I]?N=this.defaultActions[I]:(A!==null&&typeof A!="undefined"||(A=c()),N=g[I]&&g[I][A]),typeof N=="undefined"||!N.length||!N[0]){var H="";if(!b){R=[];for(C in g[I])this.terminals_[C]&&C>2&&R.push("'"+this.terminals_[C]+"'");H=this.lexer.showPosition?"Parse error on line "+(d+1)+`:
`+this.lexer.showPosition()+`
Expecting `+R.join(", ")+", got '"+(this.terminals_[A]||A)+"'":"Parse error on line "+(d+1)+": Unexpected "+(A==1?"end of input":"'"+(this.terminals_[A]||A)+"'"),this.parseError(H,{text:this.lexer.match,token:this.terminals_[A]||A,line:this.lexer.yylineno,loc:T,expected:R})}}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+I+", token: "+A);switch(N[0]){case 1:h.push(A),y.push(this.lexer.yytext),s.push(this.lexer.yylloc),h.push(N[1]),A=null,E?(A=E,E=null):(v=this.lexer.yyleng,u=this.lexer.yytext,d=this.lexer.yylineno,T=this.lexer.yylloc,b>0&&b--);break;case 2:if(D=this.productions_[N[1]][1],O.$=y[y.length-D],O._$={first_line:s[s.length-(D||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(D||1)].first_column,last_column:s[s.length-1].last_column},_&&(O._$.range=[s[s.length-(D||1)].range[0],s[s.length-1].range[1]]),B=this.performAction.call(O,u,v,d,this.yy,N[1],y,s),typeof B!="undefined")return B;D&&(h=h.slice(0,-1*D*2),y=y.slice(0,-1*D),s=s.slice(0,-1*D)),h.push(this.productions_[N[1]][0]),y.push(O.$),s.push(O._$),P=g[h[h.length-2]][h[h.length-1]],h.push(P);break;case 3:return!0}}return!0}},p=function(){var f={EOF:1,parseError:function(c,o){if(!this.yy.parser)throw new Error(c);this.yy.parser.parseError(c,o)},setInput:function(c){return this._input=c,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var c=this._input[0];this.yytext+=c,this.yyleng++,this.offset++,this.match+=c,this.matched+=c;var o=c.match(/(?:\r\n?|\n).*/g);return o?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),c},unput:function(c){var o=c.length,h=c.split(/(?:\r\n?|\n)/g);this._input=c+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-o-1),this.offset-=o;var y=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),h.length-1&&(this.yylineno-=h.length-1);var s=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:h?(h.length===y.length?this.yylloc.first_column:0)+y[y.length-h.length].length-h[0].length:this.yylloc.first_column-o},this.options.ranges&&(this.yylloc.range=[s[0],s[0]+this.yyleng-o]),this},more:function(){return this._more=!0,this},less:function(c){this.unput(this.match.slice(c))},pastInput:function(){var c=this.matched.substr(0,this.matched.length-this.match.length);return(c.length>20?"...":"")+c.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var c=this.match;return c.length<20&&(c+=this._input.substr(0,20-c.length)),(c.substr(0,20)+(c.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var c=this.pastInput(),o=new Array(c.length+1).join("-");return c+this.upcomingInput()+`
`+o+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var c,o,h,y,s;this._more||(this.yytext="",this.match="");for(var g=this._currentRules(),u=0;u<g.length&&(h=this._input.match(this.rules[g[u]]),!h||o&&!(h[0].length>o[0].length)||(o=h,y=u,this.options.flex));u++);return o?(s=o[0].match(/(?:\r\n?|\n).*/g),s&&(this.yylineno+=s.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:s?s[s.length-1].length-s[s.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],c=this.performAction.call(this,this.yy,this,g[y],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),c||void 0):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var c=this.next();return typeof c!="undefined"?c:this.lex()},begin:function(c){this.conditionStack.push(c)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(c){this.begin(c)}};return f.options={},f.performAction=function(c,o,h,y){function s(g,u){return o.yytext=o.yytext.substring(g,o.yyleng-u+g)}switch(h){case 0:if(o.yytext.slice(-2)==="\\\\"?(s(0,1),this.begin("mu")):o.yytext.slice(-1)==="\\"?(s(0,1),this.begin("emu")):this.begin("mu"),o.yytext)return 15;break;case 1:return 15;case 2:return this.popState(),15;case 3:return this.begin("raw"),15;case 4:return this.popState(),this.conditionStack[this.conditionStack.length-1]==="raw"?15:(s(5,9),"END_RAW_BLOCK");case 5:return 15;case 6:return this.popState(),14;case 7:return 65;case 8:return 68;case 9:return 19;case 10:return this.popState(),this.begin("raw"),23;case 11:return 55;case 12:return 60;case 13:return 29;case 14:return 47;case 15:return this.popState(),44;case 16:return this.popState(),44;case 17:return 34;case 18:return 39;case 19:return 51;case 20:return 48;case 21:this.unput(o.yytext),this.popState(),this.begin("com");break;case 22:return this.popState(),14;case 23:return 48;case 24:return 73;case 25:return 72;case 26:return 72;case 27:return 87;case 28:break;case 29:return this.popState(),54;case 30:return this.popState(),33;case 31:return o.yytext=s(1,2).replace(/\\"/g,'"'),80;case 32:return o.yytext=s(1,2).replace(/\\'/g,"'"),80;case 33:return 85;case 34:return 82;case 35:return 82;case 36:return 83;case 37:return 84;case 38:return 81;case 39:return 75;case 40:return 77;case 41:return 72;case 42:return o.yytext=o.yytext.replace(/\\([\\\]])/g,"$1"),72;case 43:return"INVALID";case 44:return 5}},f.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]+?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/],f.conditions={mu:{rules:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[6],inclusive:!1},raw:{rules:[3,4,5],inclusive:!1},INITIAL:{rules:[0,1,44],inclusive:!0}},f}();return n.lexer=p,i.prototype=n,n.Parser=i,new i}();r.default=l,m.exports=r.default},function(m,r,l){"use strict";function i(){var s=arguments.length<=0||arguments[0]===void 0?{}:arguments[0];this.options=s}function n(s,g,u){g===void 0&&(g=s.length);var d=s[g-1],v=s[g-2];return d?d.type==="ContentStatement"?(v||!u?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(d.original):void 0:u}function p(s,g,u){g===void 0&&(g=-1);var d=s[g+1],v=s[g+2];return d?d.type==="ContentStatement"?(v||!u?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(d.original):void 0:u}function f(s,g,u){var d=s[g==null?0:g+1];if(d&&d.type==="ContentStatement"&&(u||!d.rightStripped)){var v=d.value;d.value=d.value.replace(u?/^\s+/:/^[ \t]*\r?\n?/,""),d.rightStripped=d.value!==v}}function c(s,g,u){var d=s[g==null?s.length-1:g-1];if(d&&d.type==="ContentStatement"&&(u||!d.leftStripped)){var v=d.value;return d.value=d.value.replace(u?/\s+$/:/[ \t]+$/,""),d.leftStripped=d.value!==v,d.leftStripped}}var o=l(1).default;r.__esModule=!0;var h=l(88),y=o(h);i.prototype=new y.default,i.prototype.Program=function(s){var g=!this.options.ignoreStandalone,u=!this.isRootSeen;this.isRootSeen=!0;for(var d=s.body,v=0,b=d.length;v<b;v++){var T=d[v],_=this.accept(T);if(_){var A=n(d,v,u),E=p(d,v,u),I=_.openStandalone&&A,N=_.closeStandalone&&E,B=_.inlineStandalone&&A&&E;_.close&&f(d,v,!0),_.open&&c(d,v,!0),g&&B&&(f(d,v),c(d,v)&&T.type==="PartialStatement"&&(T.indent=/([ \t]+$)/.exec(d[v-1].original)[1])),g&&I&&(f((T.program||T.inverse).body),c(d,v)),g&&N&&(f(d,v),c((T.inverse||T.program).body))}}return s},i.prototype.BlockStatement=i.prototype.DecoratorBlock=i.prototype.PartialBlockStatement=function(s){this.accept(s.program),this.accept(s.inverse);var g=s.program||s.inverse,u=s.program&&s.inverse,d=u,v=u;if(u&&u.chained)for(d=u.body[0].program;v.chained;)v=v.body[v.body.length-1].program;var b={open:s.openStrip.open,close:s.closeStrip.close,openStandalone:p(g.body),closeStandalone:n((d||g).body)};if(s.openStrip.close&&f(g.body,null,!0),u){var T=s.inverseStrip;T.open&&c(g.body,null,!0),T.close&&f(d.body,null,!0),s.closeStrip.open&&c(v.body,null,!0),!this.options.ignoreStandalone&&n(g.body)&&p(d.body)&&(c(g.body),f(d.body))}else s.closeStrip.open&&c(g.body,null,!0);return b},i.prototype.Decorator=i.prototype.MustacheStatement=function(s){return s.strip},i.prototype.PartialStatement=i.prototype.CommentStatement=function(s){var g=s.strip||{};return{inlineStandalone:!0,open:g.open,close:g.close}},r.default=i,m.exports=r.default},function(m,r,l){"use strict";function i(){this.parents=[]}function n(y){this.acceptRequired(y,"path"),this.acceptArray(y.params),this.acceptKey(y,"hash")}function p(y){n.call(this,y),this.acceptKey(y,"program"),this.acceptKey(y,"inverse")}function f(y){this.acceptRequired(y,"name"),this.acceptArray(y.params),this.acceptKey(y,"hash")}var c=l(1).default;r.__esModule=!0;var o=l(6),h=c(o);i.prototype={constructor:i,mutating:!1,acceptKey:function(y,s){var g=this.accept(y[s]);if(this.mutating){if(g&&!i.prototype[g.type])throw new h.default('Unexpected node type "'+g.type+'" found when accepting '+s+" on "+y.type);y[s]=g}},acceptRequired:function(y,s){if(this.acceptKey(y,s),!y[s])throw new h.default(y.type+" requires "+s)},acceptArray:function(y){for(var s=0,g=y.length;s<g;s++)this.acceptKey(y,s),y[s]||(y.splice(s,1),s--,g--)},accept:function(y){if(y){if(!this[y.type])throw new h.default("Unknown type: "+y.type,y);this.current&&this.parents.unshift(this.current),this.current=y;var s=this[y.type](y);return this.current=this.parents.shift(),!this.mutating||s?s:s!==!1?y:void 0}},Program:function(y){this.acceptArray(y.body)},MustacheStatement:n,Decorator:n,BlockStatement:p,DecoratorBlock:p,PartialStatement:f,PartialBlockStatement:function(y){f.call(this,y),this.acceptKey(y,"program")},ContentStatement:function(){},CommentStatement:function(){},SubExpression:n,PathExpression:function(){},StringLiteral:function(){},NumberLiteral:function(){},BooleanLiteral:function(){},UndefinedLiteral:function(){},NullLiteral:function(){},Hash:function(y){this.acceptArray(y.pairs)},HashPair:function(y){this.acceptRequired(y,"value")}},r.default=i,m.exports=r.default},function(m,r,l){"use strict";function i(T,_){if(_=_.path?_.path.original:_,T.path.original!==_){var A={loc:T.path.loc};throw new b.default(T.path.original+" doesn't match "+_,A)}}function n(T,_){this.source=T,this.start={line:_.first_line,column:_.first_column},this.end={line:_.last_line,column:_.last_column}}function p(T){return/^\[.*\]$/.test(T)?T.substring(1,T.length-1):T}function f(T,_){return{open:T.charAt(2)==="~",close:_.charAt(_.length-3)==="~"}}function c(T){return T.replace(/^\{\{~?!-?-?/,"").replace(/-?-?~?\}\}$/,"")}function o(T,_,A){A=this.locInfo(A);for(var E=T?"@":"",I=[],N=0,B=0,C=_.length;B<C;B++){var D=_[B].part,P=_[B].original!==D;if(E+=(_[B].separator||"")+D,P||D!==".."&&D!=="."&&D!=="this")I.push(D);else{if(I.length>0)throw new b.default("Invalid path: "+E,{loc:A});D===".."&&N++}}return{type:"PathExpression",data:T,depth:N,parts:I,original:E,loc:A}}function h(T,_,A,E,I,N){var B=E.charAt(3)||E.charAt(2),C=B!=="{"&&B!=="&",D=/\*/.test(E);return{type:D?"Decorator":"MustacheStatement",path:T,params:_,hash:A,escaped:C,strip:I,loc:this.locInfo(N)}}function y(T,_,A,E){i(T,A),E=this.locInfo(E);var I={type:"Program",body:_,strip:{},loc:E};return{type:"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:I,openStrip:{},inverseStrip:{},closeStrip:{},loc:E}}function s(T,_,A,E,I,N){E&&E.path&&i(T,E);var B=/\*/.test(T.open);_.blockParams=T.blockParams;var C=void 0,D=void 0;if(A){if(B)throw new b.default("Unexpected inverse block on decorator",A);A.chain&&(A.program.body[0].closeStrip=E.strip),D=A.strip,C=A.program}return I&&(I=C,C=_,_=I),{type:B?"DecoratorBlock":"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:_,inverse:C,openStrip:T.strip,inverseStrip:D,closeStrip:E&&E.strip,loc:this.locInfo(N)}}function g(T,_){if(!_&&T.length){var A=T[0].loc,E=T[T.length-1].loc;A&&E&&(_={source:A.source,start:{line:A.start.line,column:A.start.column},end:{line:E.end.line,column:E.end.column}})}return{type:"Program",body:T,strip:{},loc:_}}function u(T,_,A,E){return i(T,A),{type:"PartialBlockStatement",name:T.path,params:T.params,hash:T.hash,program:_,openStrip:T.strip,closeStrip:A&&A.strip,loc:this.locInfo(E)}}var d=l(1).default;r.__esModule=!0,r.SourceLocation=n,r.id=p,r.stripFlags=f,r.stripComment=c,r.preparePath=o,r.prepareMustache=h,r.prepareRawBlock=y,r.prepareBlock=s,r.prepareProgram=g,r.preparePartialBlock=u;var v=l(6),b=d(v)},function(m,r,l){"use strict";function i(){}function n(b,T,_){if(b==null||typeof b!="string"&&b.type!=="Program")throw new s.default("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+b);T=T||{},"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var A=_.parse(b,T),E=new _.Compiler().compile(A,T);return new _.JavaScriptCompiler().compile(E,T)}function p(b,T,_){function A(){var N=_.parse(b,T),B=new _.Compiler().compile(N,T),C=new _.JavaScriptCompiler().compile(B,T,void 0,!0);return _.template(C)}function E(N,B){return I||(I=A()),I.call(this,N,B)}if(T===void 0&&(T={}),b==null||typeof b!="string"&&b.type!=="Program")throw new s.default("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+b);T=g.extend({},T),"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var I=void 0;return E._setup=function(N){return I||(I=A()),I._setup(N)},E._child=function(N,B,C,D){return I||(I=A()),I._child(N,B,C,D)},E}function f(b,T){if(b===T)return!0;if(g.isArray(b)&&g.isArray(T)&&b.length===T.length){for(var _=0;_<b.length;_++)if(!f(b[_],T[_]))return!1;return!0}}function c(b){if(!b.path.parts){var T=b.path;b.path={type:"PathExpression",data:!1,depth:0,parts:[T.original+""],original:T.original+"",loc:T.loc}}}var o=l(74).default,h=l(1).default;r.__esModule=!0,r.Compiler=i,r.precompile=n,r.compile=p;var y=l(6),s=h(y),g=l(5),u=l(84),d=h(u),v=[].slice;i.prototype={compiler:i,equals:function(b){var T=this.opcodes.length;if(b.opcodes.length!==T)return!1;for(var _=0;_<T;_++){var A=this.opcodes[_],E=b.opcodes[_];if(A.opcode!==E.opcode||!f(A.args,E.args))return!1}T=this.children.length;for(var _=0;_<T;_++)if(!this.children[_].equals(b.children[_]))return!1;return!0},guid:0,compile:function(b,T){return this.sourceNode=[],this.opcodes=[],this.children=[],this.options=T,this.stringParams=T.stringParams,this.trackIds=T.trackIds,T.blockParams=T.blockParams||[],T.knownHelpers=g.extend(o(null),{helperMissing:!0,blockHelperMissing:!0,each:!0,if:!0,unless:!0,with:!0,log:!0,lookup:!0},T.knownHelpers),this.accept(b)},compileProgram:function(b){var T=new this.compiler,_=T.compile(b,this.options),A=this.guid++;return this.usePartial=this.usePartial||_.usePartial,this.children[A]=_,this.useDepths=this.useDepths||_.useDepths,A},accept:function(b){if(!this[b.type])throw new s.default("Unknown type: "+b.type,b);this.sourceNode.unshift(b);var T=this[b.type](b);return this.sourceNode.shift(),T},Program:function(b){this.options.blockParams.unshift(b.blockParams);for(var T=b.body,_=T.length,A=0;A<_;A++)this.accept(T[A]);return this.options.blockParams.shift(),this.isSimple=_===1,this.blockParams=b.blockParams?b.blockParams.length:0,this},BlockStatement:function(b){c(b);var T=b.program,_=b.inverse;T=T&&this.compileProgram(T),_=_&&this.compileProgram(_);var A=this.classifySexpr(b);A==="helper"?this.helperSexpr(b,T,_):A==="simple"?(this.simpleSexpr(b),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("blockValue",b.path.original)):(this.ambiguousSexpr(b,T,_),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},DecoratorBlock:function(b){var T=b.program&&this.compileProgram(b.program),_=this.setupFullMustacheParams(b,T,void 0),A=b.path;this.useDecorators=!0,this.opcode("registerDecorator",_.length,A.original)},PartialStatement:function(b){this.usePartial=!0;var T=b.program;T&&(T=this.compileProgram(b.program));var _=b.params;if(_.length>1)throw new s.default("Unsupported number of partial arguments: "+_.length,b);_.length||(this.options.explicitPartialContext?this.opcode("pushLiteral","undefined"):_.push({type:"PathExpression",parts:[],depth:0}));var A=b.name.original,E=b.name.type==="SubExpression";E&&this.accept(b.name),this.setupFullMustacheParams(b,T,void 0,!0);var I=b.indent||"";this.options.preventIndent&&I&&(this.opcode("appendContent",I),I=""),this.opcode("invokePartial",E,A,I),this.opcode("append")},PartialBlockStatement:function(b){this.PartialStatement(b)},MustacheStatement:function(b){this.SubExpression(b),b.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},Decorator:function(b){this.DecoratorBlock(b)},ContentStatement:function(b){b.value&&this.opcode("appendContent",b.value)},CommentStatement:function(){},SubExpression:function(b){c(b);var T=this.classifySexpr(b);T==="simple"?this.simpleSexpr(b):T==="helper"?this.helperSexpr(b):this.ambiguousSexpr(b)},ambiguousSexpr:function(b,T,_){var A=b.path,E=A.parts[0],I=T!=null||_!=null;this.opcode("getContext",A.depth),this.opcode("pushProgram",T),this.opcode("pushProgram",_),A.strict=!0,this.accept(A),this.opcode("invokeAmbiguous",E,I)},simpleSexpr:function(b){var T=b.path;T.strict=!0,this.accept(T),this.opcode("resolvePossibleLambda")},helperSexpr:function(b,T,_){var A=this.setupFullMustacheParams(b,T,_),E=b.path,I=E.parts[0];if(this.options.knownHelpers[I])this.opcode("invokeKnownHelper",A.length,I);else{if(this.options.knownHelpersOnly)throw new s.default("You specified knownHelpersOnly, but used the unknown helper "+I,b);E.strict=!0,E.falsy=!0,this.accept(E),this.opcode("invokeHelper",A.length,E.original,d.default.helpers.simpleId(E))}},PathExpression:function(b){this.addDepth(b.depth),this.opcode("getContext",b.depth);var T=b.parts[0],_=d.default.helpers.scopedId(b),A=!b.depth&&!_&&this.blockParamIndex(T);A?this.opcode("lookupBlockParam",A,b.parts):T?b.data?(this.options.data=!0,this.opcode("lookupData",b.depth,b.parts,b.strict)):this.opcode("lookupOnContext",b.parts,b.falsy,b.strict,_):this.opcode("pushContext")},StringLiteral:function(b){this.opcode("pushString",b.value)},NumberLiteral:function(b){this.opcode("pushLiteral",b.value)},BooleanLiteral:function(b){this.opcode("pushLiteral",b.value)},UndefinedLiteral:function(){this.opcode("pushLiteral","undefined")},NullLiteral:function(){this.opcode("pushLiteral","null")},Hash:function(b){var T=b.pairs,_=0,A=T.length;for(this.opcode("pushHash");_<A;_++)this.pushParam(T[_].value);for(;_--;)this.opcode("assignToHash",T[_].key);this.opcode("popHash")},opcode:function(b){this.opcodes.push({opcode:b,args:v.call(arguments,1),loc:this.sourceNode[0].loc})},addDepth:function(b){b&&(this.useDepths=!0)},classifySexpr:function(b){var T=d.default.helpers.simpleId(b.path),_=T&&!!this.blockParamIndex(b.path.parts[0]),A=!_&&d.default.helpers.helperExpression(b),E=!_&&(A||T);if(E&&!A){var I=b.path.parts[0],N=this.options;N.knownHelpers[I]?A=!0:N.knownHelpersOnly&&(E=!1)}return A?"helper":E?"ambiguous":"simple"},pushParams:function(b){for(var T=0,_=b.length;T<_;T++)this.pushParam(b[T])},pushParam:function(b){var T=b.value!=null?b.value:b.original||"";if(this.stringParams)T.replace&&(T=T.replace(/^(\.?\.\/)*/g,"").replace(/\//g,".")),b.depth&&this.addDepth(b.depth),this.opcode("getContext",b.depth||0),this.opcode("pushStringParam",T,b.type),b.type==="SubExpression"&&this.accept(b);else{if(this.trackIds){var _=void 0;if(!b.parts||d.default.helpers.scopedId(b)||b.depth||(_=this.blockParamIndex(b.parts[0])),_){var A=b.parts.slice(1).join(".");this.opcode("pushId","BlockParam",_,A)}else T=b.original||T,T.replace&&(T=T.replace(/^this(?:\.|$)/,"").replace(/^\.\//,"").replace(/^\.$/,"")),this.opcode("pushId",b.type,T)}this.accept(b)}},setupFullMustacheParams:function(b,T,_,A){var E=b.params;return this.pushParams(E),this.opcode("pushProgram",T),this.opcode("pushProgram",_),b.hash?this.accept(b.hash):this.opcode("emptyHash",A),E},blockParamIndex:function(b){for(var T=0,_=this.options.blockParams.length;T<_;T++){var A=this.options.blockParams[T],E=A&&g.indexOf(A,b);if(A&&E>=0)return[T,E]}}}},function(m,r,l){"use strict";function i(d){this.value=d}function n(){}function p(d,v,b,T,_){var A=v.popStack(),E=b.length;for(d&&E--;T<E;T++)A=v.nameLookup(A,b[T],_);return d?[v.aliasable("container.strict"),"(",A,", ",v.quotedString(b[T]),", ",JSON.stringify(v.source.currentLocation)," )"]:A}var f=l(60).default,c=l(1).default;r.__esModule=!0;var o=l(4),h=l(6),y=c(h),s=l(5),g=l(92),u=c(g);n.prototype={nameLookup:function(d,v){return this.internalNameLookup(d,v)},depthedLookup:function(d){return[this.aliasable("container.lookup"),"(depths, ",JSON.stringify(d),")"]},compilerInfo:function(){var d=o.COMPILER_REVISION,v=o.REVISION_CHANGES[d];return[d,v]},appendToBuffer:function(d,v,b){return s.isArray(d)||(d=[d]),d=this.source.wrap(d,v),this.environment.isSimple?["return ",d,";"]:b?["buffer += ",d,";"]:(d.appendToBuffer=!0,d)},initializeBuffer:function(){return this.quotedString("")},internalNameLookup:function(d,v){return this.lookupPropertyFunctionIsUsed=!0,["lookupProperty(",d,",",JSON.stringify(v),")"]},lookupPropertyFunctionIsUsed:!1,compile:function(d,v,b,T){this.environment=d,this.options=v,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!T,this.name=this.environment.name,this.isChild=!!b,this.context=b||{decorators:[],programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.blockParams=[],this.compileChildren(d,v),this.useDepths=this.useDepths||d.useDepths||d.useDecorators||this.options.compat,this.useBlockParams=this.useBlockParams||d.useBlockParams;var _=d.opcodes,A=void 0,E=void 0,I=void 0,N=void 0;for(I=0,N=_.length;I<N;I++)A=_[I],this.source.currentLocation=A.loc,E=E||A.loc,this[A.opcode].apply(this,A.args);if(this.source.currentLocation=E,this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new y.default("Compile completed with content left on stack");this.decorators.isEmpty()?this.decorators=void 0:(this.useDecorators=!0,this.decorators.prepend(["var decorators = container.decorators, ",this.lookupPropertyFunctionVarDeclaration(),`;
`]),this.decorators.push("return fn;"),T?this.decorators=Function.apply(this,["fn","props","container","depth0","data","blockParams","depths",this.decorators.merge()]):(this.decorators.prepend(`function(fn, props, container, depth0, data, blockParams, depths) {
`),this.decorators.push(`}
`),this.decorators=this.decorators.merge()));var B=this.createFunctionContext(T);if(this.isChild)return B;var C={compiler:this.compilerInfo(),main:B};this.decorators&&(C.main_d=this.decorators,C.useDecorators=!0);var D=this.context,P=D.programs,R=D.decorators;for(I=0,N=P.length;I<N;I++)P[I]&&(C[I]=P[I],R[I]&&(C[I+"_d"]=R[I],C.useDecorators=!0));return this.environment.usePartial&&(C.usePartial=!0),this.options.data&&(C.useData=!0),this.useDepths&&(C.useDepths=!0),this.useBlockParams&&(C.useBlockParams=!0),this.options.compat&&(C.compat=!0),T?C.compilerOptions=this.options:(C.compiler=JSON.stringify(C.compiler),this.source.currentLocation={start:{line:1,column:0}},C=this.objectLiteral(C),v.srcName?(C=C.toStringWithSourceMap({file:v.destName}),C.map=C.map&&C.map.toString()):C=C.toString()),C},preamble:function(){this.lastContext=0,this.source=new u.default(this.options.srcName),this.decorators=new u.default(this.options.srcName)},createFunctionContext:function(d){var v=this,b="",T=this.stackVars.concat(this.registers.list);T.length>0&&(b+=", "+T.join(", "));var _=0;f(this.aliases).forEach(function(I){var N=v.aliases[I];N.children&&N.referenceCount>1&&(b+=", alias"+ ++_+"="+I,N.children[0]="alias"+_)}),this.lookupPropertyFunctionIsUsed&&(b+=", "+this.lookupPropertyFunctionVarDeclaration());var A=["container","depth0","helpers","partials","data"];(this.useBlockParams||this.useDepths)&&A.push("blockParams"),this.useDepths&&A.push("depths");var E=this.mergeSource(b);return d?(A.push(E),Function.apply(this,A)):this.source.wrap(["function(",A.join(","),`) {
  `,E,"}"])},mergeSource:function(d){var v=this.environment.isSimple,b=!this.forceBuffer,T=void 0,_=void 0,A=void 0,E=void 0;return this.source.each(function(I){I.appendToBuffer?(A?I.prepend("  + "):A=I,E=I):(A&&(_?A.prepend("buffer += "):T=!0,E.add(";"),A=E=void 0),_=!0,v||(b=!1))}),b?A?(A.prepend("return "),E.add(";")):_||this.source.push('return "";'):(d+=", buffer = "+(T?"":this.initializeBuffer()),A?(A.prepend("return buffer + "),E.add(";")):this.source.push("return buffer;")),d&&this.source.prepend("var "+d.substring(2)+(T?"":`;
`)),this.source.merge()},lookupPropertyFunctionVarDeclaration:function(){return`
      lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    }
    `.trim()},blockValue:function(d){var v=this.aliasable("container.hooks.blockHelperMissing"),b=[this.contextName(0)];this.setupHelperArgs(d,0,b);var T=this.popStack();b.splice(1,0,T),this.push(this.source.functionCall(v,"call",b))},ambiguousBlockValue:function(){var d=this.aliasable("container.hooks.blockHelperMissing"),v=[this.contextName(0)];this.setupHelperArgs("",0,v,!0),this.flushInline();var b=this.topStack();v.splice(1,0,b),this.pushSource(["if (!",this.lastHelper,") { ",b," = ",this.source.functionCall(d,"call",v),"}"])},appendContent:function(d){this.pendingContent?d=this.pendingContent+d:this.pendingLocation=this.source.currentLocation,this.pendingContent=d},append:function(){if(this.isInline())this.replaceStack(function(v){return[" != null ? ",v,' : ""']}),this.pushSource(this.appendToBuffer(this.popStack()));else{var d=this.popStack();this.pushSource(["if (",d," != null) { ",this.appendToBuffer(d,void 0,!0)," }"]),this.environment.isSimple&&this.pushSource(["else { ",this.appendToBuffer("''",void 0,!0)," }"])}},appendEscaped:function(){this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"),"(",this.popStack(),")"]))},getContext:function(d){this.lastContext=d},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(d,v,b,T){var _=0;T||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(d[_++])),this.resolvePath("context",d,_,v,b)},lookupBlockParam:function(d,v){this.useBlockParams=!0,this.push(["blockParams[",d[0],"][",d[1],"]"]),this.resolvePath("context",v,1)},lookupData:function(d,v,b){d?this.pushStackLiteral("container.data(data, "+d+")"):this.pushStackLiteral("data"),this.resolvePath("data",v,0,!0,b)},resolvePath:function(d,v,b,T,_){var A=this;if(this.options.strict||this.options.assumeObjects)return void this.push(p(this.options.strict&&_,this,v,b,d));for(var E=v.length;b<E;b++)this.replaceStack(function(I){var N=A.nameLookup(I,v[b],d);return T?[" && ",N]:[" != null ? ",N," : ",I]})},resolvePossibleLambda:function(){this.push([this.aliasable("container.lambda"),"(",this.popStack(),", ",this.contextName(0),")"])},pushStringParam:function(d,v){this.pushContext(),this.pushString(v),v!=="SubExpression"&&(typeof d=="string"?this.pushString(d):this.pushStackLiteral(d))},emptyHash:function(d){this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}")),this.pushStackLiteral(d?"undefined":"{}")},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:{},types:[],contexts:[],ids:[]}},popHash:function(){var d=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push(this.objectLiteral(d.ids)),this.stringParams&&(this.push(this.objectLiteral(d.contexts)),this.push(this.objectLiteral(d.types))),this.push(this.objectLiteral(d.values))},pushString:function(d){this.pushStackLiteral(this.quotedString(d))},pushLiteral:function(d){this.pushStackLiteral(d)},pushProgram:function(d){d!=null?this.pushStackLiteral(this.programExpression(d)):this.pushStackLiteral(null)},registerDecorator:function(d,v){var b=this.nameLookup("decorators",v,"decorator"),T=this.setupHelperArgs(v,d);this.decorators.push(["fn = ",this.decorators.functionCall(b,"",["fn","props","container",T])," || fn;"])},invokeHelper:function(d,v,b){var T=this.popStack(),_=this.setupHelper(d,v),A=[];b&&A.push(_.name),A.push(T),this.options.strict||A.push(this.aliasable("container.hooks.helperMissing"));var E=["(",this.itemsSeparatedBy(A,"||"),")"],I=this.source.functionCall(E,"call",_.callParams);this.push(I)},itemsSeparatedBy:function(d,v){var b=[];b.push(d[0]);for(var T=1;T<d.length;T++)b.push(v,d[T]);return b},invokeKnownHelper:function(d,v){var b=this.setupHelper(d,v);this.push(this.source.functionCall(b.name,"call",b.callParams))},invokeAmbiguous:function(d,v){this.useRegister("helper");var b=this.popStack();this.emptyHash();var T=this.setupHelper(0,d,v),_=this.lastHelper=this.nameLookup("helpers",d,"helper"),A=["(","(helper = ",_," || ",b,")"];this.options.strict||(A[0]="(helper = ",A.push(" != null ? helper : ",this.aliasable("container.hooks.helperMissing"))),this.push(["(",A,T.paramsInit?["),(",T.paramsInit]:[],"),","(typeof helper === ",this.aliasable('"function"')," ? ",this.source.functionCall("helper","call",T.callParams)," : helper))"])},invokePartial:function(d,v,b){var T=[],_=this.setupParams(v,1,T);d&&(v=this.popStack(),delete _.name),b&&(_.indent=JSON.stringify(b)),_.helpers="helpers",_.partials="partials",_.decorators="container.decorators",d?T.unshift(v):T.unshift(this.nameLookup("partials",v,"partial")),this.options.compat&&(_.depths="depths"),_=this.objectLiteral(_),T.push(_),this.push(this.source.functionCall("container.invokePartial","",T))},assignToHash:function(d){var v=this.popStack(),b=void 0,T=void 0,_=void 0;this.trackIds&&(_=this.popStack()),this.stringParams&&(T=this.popStack(),b=this.popStack());var A=this.hash;b&&(A.contexts[d]=b),T&&(A.types[d]=T),_&&(A.ids[d]=_),A.values[d]=v},pushId:function(d,v,b){d==="BlockParam"?this.pushStackLiteral("blockParams["+v[0]+"].path["+v[1]+"]"+(b?" + "+JSON.stringify("."+b):"")):d==="PathExpression"?this.pushString(v):d==="SubExpression"?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:n,compileChildren:function(d,v){for(var b=d.children,T=void 0,_=void 0,A=0,E=b.length;A<E;A++){T=b[A],_=new this.compiler;var I=this.matchExistingProgram(T);if(I==null){this.context.programs.push("");var N=this.context.programs.length;T.index=N,T.name="program"+N,this.context.programs[N]=_.compile(T,v,this.context,!this.precompile),this.context.decorators[N]=_.decorators,this.context.environments[N]=T,this.useDepths=this.useDepths||_.useDepths,this.useBlockParams=this.useBlockParams||_.useBlockParams,T.useDepths=this.useDepths,T.useBlockParams=this.useBlockParams}else T.index=I.index,T.name="program"+I.index,this.useDepths=this.useDepths||I.useDepths,this.useBlockParams=this.useBlockParams||I.useBlockParams}},matchExistingProgram:function(d){for(var v=0,b=this.context.environments.length;v<b;v++){var T=this.context.environments[v];if(T&&T.equals(d))return T}},programExpression:function(d){var v=this.environment.children[d],b=[v.index,"data",v.blockParams];return(this.useBlockParams||this.useDepths)&&b.push("blockParams"),this.useDepths&&b.push("depths"),"container.program("+b.join(", ")+")"},useRegister:function(d){this.registers[d]||(this.registers[d]=!0,this.registers.list.push(d))},push:function(d){return d instanceof i||(d=this.source.wrap(d)),this.inlineStack.push(d),d},pushStackLiteral:function(d){this.push(new i(d))},pushSource:function(d){this.pendingContent&&(this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation)),this.pendingContent=void 0),d&&this.source.push(d)},replaceStack:function(d){var v=["("],b=void 0,T=void 0,_=void 0;if(!this.isInline())throw new y.default("replaceStack on non-inline");var A=this.popStack(!0);if(A instanceof i)b=[A.value],v=["(",b],_=!0;else{T=!0;var E=this.incrStack();v=["((",this.push(E)," = ",A,")"],b=this.topStack()}var I=d.call(this,b);_||this.popStack(),T&&this.stackSlot--,this.push(v.concat(I,")"))},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var d=this.inlineStack;this.inlineStack=[];for(var v=0,b=d.length;v<b;v++){var T=d[v];if(T instanceof i)this.compileStack.push(T);else{var _=this.incrStack();this.pushSource([_," = ",T,";"]),this.compileStack.push(_)}}},isInline:function(){return this.inlineStack.length},popStack:function(d){var v=this.isInline(),b=(v?this.inlineStack:this.compileStack).pop();if(!d&&b instanceof i)return b.value;if(!v){if(!this.stackSlot)throw new y.default("Invalid stack pop");this.stackSlot--}return b},topStack:function(){var d=this.isInline()?this.inlineStack:this.compileStack,v=d[d.length-1];return v instanceof i?v.value:v},contextName:function(d){return this.useDepths&&d?"depths["+d+"]":"depth"+d},quotedString:function(d){return this.source.quotedString(d)},objectLiteral:function(d){return this.source.objectLiteral(d)},aliasable:function(d){var v=this.aliases[d];return v?(v.referenceCount++,v):(v=this.aliases[d]=this.source.wrap(d),v.aliasable=!0,v.referenceCount=1,v)},setupHelper:function(d,v,b){var T=[],_=this.setupHelperArgs(v,d,T,b),A=this.nameLookup("helpers",v,"helper"),E=this.aliasable(this.contextName(0)+" != null ? "+this.contextName(0)+" : (container.nullContext || {})");return{params:T,paramsInit:_,name:A,callParams:[E].concat(T)}},setupParams:function(d,v,b){var T={},_=[],A=[],E=[],I=!b,N=void 0;I&&(b=[]),T.name=this.quotedString(d),T.hash=this.popStack(),this.trackIds&&(T.hashIds=this.popStack()),this.stringParams&&(T.hashTypes=this.popStack(),T.hashContexts=this.popStack());var B=this.popStack(),C=this.popStack();(C||B)&&(T.fn=C||"container.noop",T.inverse=B||"container.noop");for(var D=v;D--;)N=this.popStack(),b[D]=N,this.trackIds&&(E[D]=this.popStack()),this.stringParams&&(A[D]=this.popStack(),_[D]=this.popStack());return I&&(T.args=this.source.generateArray(b)),this.trackIds&&(T.ids=this.source.generateArray(E)),this.stringParams&&(T.types=this.source.generateArray(A),T.contexts=this.source.generateArray(_)),this.options.data&&(T.data="data"),this.useBlockParams&&(T.blockParams="blockParams"),T},setupHelperArgs:function(d,v,b,T){var _=this.setupParams(d,v,b);return _.loc=JSON.stringify(this.source.currentLocation),_=this.objectLiteral(_),T?(this.useRegister("options"),b.push("options"),["options=",_]):b?(b.push(_),""):_}},function(){for(var d="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" "),v=n.RESERVED_WORDS={},b=0,T=d.length;b<T;b++)v[d[b]]=!0}(),n.isValidJavaScriptVariableName=function(d){return!n.RESERVED_WORDS[d]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(d)},r.default=n,m.exports=r.default},function(m,r,l){"use strict";function i(o,h,y){if(f.isArray(o)){for(var s=[],g=0,u=o.length;g<u;g++)s.push(h.wrap(o[g],y));return s}return typeof o=="boolean"||typeof o=="number"?o+"":o}function n(o){this.srcFile=o,this.source=[]}var p=l(60).default;r.__esModule=!0;var f=l(5),c=void 0;try{}catch(o){}c||(c=function(o,h,y,s){this.src="",s&&this.add(s)},c.prototype={add:function(o){f.isArray(o)&&(o=o.join("")),this.src+=o},prepend:function(o){f.isArray(o)&&(o=o.join("")),this.src=o+this.src},toStringWithSourceMap:function(){return{code:this.toString()}},toString:function(){return this.src}}),n.prototype={isEmpty:function(){return!this.source.length},prepend:function(o,h){this.source.unshift(this.wrap(o,h))},push:function(o,h){this.source.push(this.wrap(o,h))},merge:function(){var o=this.empty();return this.each(function(h){o.add(["  ",h,`
`])}),o},each:function(o){for(var h=0,y=this.source.length;h<y;h++)o(this.source[h])},empty:function(){var o=this.currentLocation||{start:{}};return new c(o.start.line,o.start.column,this.srcFile)},wrap:function(o){var h=arguments.length<=1||arguments[1]===void 0?this.currentLocation||{start:{}}:arguments[1];return o instanceof c?o:(o=i(o,this,h),new c(h.start.line,h.start.column,this.srcFile,o))},functionCall:function(o,h,y){return y=this.generateList(y),this.wrap([o,h?"."+h+"(":"(",y,")"])},quotedString:function(o){return'"'+(o+"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(o){var h=this,y=[];p(o).forEach(function(g){var u=i(o[g],h);u!=="undefined"&&y.push([h.quotedString(g),":",u])});var s=this.generateList(y);return s.prepend("{"),s.add("}"),s},generateList:function(o){for(var h=this.empty(),y=0,s=o.length;y<s;y++)y&&h.add(","),h.add(i(o[y],this));return h},generateArray:function(o){var h=this.generateList(o);return h.prepend("["),h.add("]"),h}},r.default=n,m.exports=r.default}])})},2342:()=>{Prism.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest=Prism.languages.python,Prism.languages.py=Prism.languages.python},2512:(w,m,r)=>{var l,i;l=[r(8411),r(9758),r(8543),r(1382),r(403),r(9091),r(1483),r(4385),r(5748),r(9192),r(4213),r(9340),r(1801),r(6599),r(2569),r(7957),r(9229),r(4560)],i=function(n,p,f,c,o,h,y,s,g,u,d){"use strict";var v,b,T=/^(?:toggle|show|hide)$/,_=/queueHooks$/;function A(){b&&(f.hidden===!1&&window.requestAnimationFrame?window.requestAnimationFrame(A):window.setTimeout(A,n.fx.interval),n.fx.tick())}function E(){return window.setTimeout(function(){v=void 0}),v=Date.now()}function I(P,R){var O,H=0,$={height:P};for(R=R?1:0;H<4;H+=2-R)O=y[H],$["margin"+O]=$["padding"+O]=P;return R&&($.opacity=$.width=P),$}function N(P,R,O){for(var H,$=(D.tweeners[R]||[]).concat(D.tweeners["*"]),j=0,G=$.length;j<G;j++)if(H=$[j].call(O,R,P))return H}function B(P,R,O){var H,$,j,G,L,W,U,Q,ne="width"in R||"height"in R,se=this,X={},ge=P.style,be=P.nodeType&&s(P),_e=u.get(P,"fxshow");O.queue||(G=n._queueHooks(P,"fx"),G.unqueued==null&&(G.unqueued=0,L=G.empty.fire,G.empty.fire=function(){G.unqueued||L()}),G.unqueued++,se.always(function(){se.always(function(){G.unqueued--,n.queue(P,"fx").length||G.empty.fire()})}));for(H in R)if($=R[H],T.test($)){if(delete R[H],j=j||$==="toggle",$===(be?"hide":"show"))if($==="show"&&_e&&_e[H]!==void 0)be=!0;else continue;X[H]=_e&&_e[H]||n.style(P,H)}if(W=!n.isEmptyObject(R),!(!W&&n.isEmptyObject(X))){ne&&P.nodeType===1&&(O.overflow=[ge.overflow,ge.overflowX,ge.overflowY],U=_e&&_e.display,U==null&&(U=u.get(P,"display")),Q=n.css(P,"display"),Q==="none"&&(U?Q=U:(d([P],!0),U=P.style.display||U,Q=n.css(P,"display"),d([P]))),(Q==="inline"||Q==="inline-block"&&U!=null)&&n.css(P,"float")==="none"&&(W||(se.done(function(){ge.display=U}),U==null&&(Q=ge.display,U=Q==="none"?"":Q)),ge.display="inline-block")),O.overflow&&(ge.overflow="hidden",se.always(function(){ge.overflow=O.overflow[0],ge.overflowX=O.overflow[1],ge.overflowY=O.overflow[2]})),W=!1;for(H in X)W||(_e?"hidden"in _e&&(be=_e.hidden):_e=u.access(P,"fxshow",{display:U}),j&&(_e.hidden=!be),be&&d([P],!0),se.done(function(){be||d([P]),u.remove(P,"fxshow");for(H in X)n.style(P,H,X[H])})),W=N(be?_e[H]:0,H,se),H in _e||(_e[H]=W.start,be&&(W.end=W.start,W.start=0))}}function C(P,R){var O,H,$,j,G;for(O in P)if(H=p(O),$=R[H],j=P[O],Array.isArray(j)&&($=j[1],j=P[O]=j[0]),O!==H&&(P[H]=j,delete P[O]),G=n.cssHooks[H],G&&"expand"in G){j=G.expand(j),delete P[H];for(O in j)O in P||(P[O]=j[O],R[O]=$)}else R[H]=$}function D(P,R,O){var H,$,j=0,G=D.prefilters.length,L=n.Deferred().always(function(){delete W.elem}),W=function(){if($)return!1;for(var ne=v||E(),se=Math.max(0,U.startTime+U.duration-ne),X=se/U.duration||0,ge=1-X,be=0,_e=U.tweens.length;be<_e;be++)U.tweens[be].run(ge);return L.notifyWith(P,[U,ge,se]),ge<1&&_e?se:(_e||L.notifyWith(P,[U,1,0]),L.resolveWith(P,[U]),!1)},U=L.promise({elem:P,props:n.extend({},R),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},O),originalProperties:R,originalOptions:O,startTime:v||E(),duration:O.duration,tweens:[],createTween:function(ne,se){var X=n.Tween(P,U.opts,ne,se,U.opts.specialEasing[ne]||U.opts.easing);return U.tweens.push(X),X},stop:function(ne){var se=0,X=ne?U.tweens.length:0;if($)return this;for($=!0;se<X;se++)U.tweens[se].run(1);return ne?(L.notifyWith(P,[U,1,0]),L.resolveWith(P,[U,ne])):L.rejectWith(P,[U,ne]),this}}),Q=U.props;for(C(Q,U.opts.specialEasing);j<G;j++)if(H=D.prefilters[j].call(U,P,Q,U.opts),H)return c(H.stop)&&(n._queueHooks(U.elem,U.opts.queue).stop=H.stop.bind(H)),H;return n.map(Q,N,U),c(U.opts.start)&&U.opts.start.call(P,U),U.progress(U.opts.progress).done(U.opts.done,U.opts.complete).fail(U.opts.fail).always(U.opts.always),n.fx.timer(n.extend(W,{elem:P,anim:U,queue:U.opts.queue})),U}return n.Animation=n.extend(D,{tweeners:{"*":[function(P,R){var O=this.createTween(P,R);return g(O.elem,P,o.exec(R),O),O}]},tweener:function(P,R){c(P)?(R=P,P=["*"]):P=P.match(h);for(var O,H=0,$=P.length;H<$;H++)O=P[H],D.tweeners[O]=D.tweeners[O]||[],D.tweeners[O].unshift(R)},prefilters:[B],prefilter:function(P,R){R?D.prefilters.unshift(P):D.prefilters.push(P)}}),n.speed=function(P,R,O){var H=P&&typeof P=="object"?n.extend({},P):{complete:O||!O&&R||c(P)&&P,duration:P,easing:O&&R||R&&!c(R)&&R};return n.fx.off?H.duration=0:typeof H.duration!="number"&&(H.duration in n.fx.speeds?H.duration=n.fx.speeds[H.duration]:H.duration=n.fx.speeds._default),(H.queue==null||H.queue===!0)&&(H.queue="fx"),H.old=H.complete,H.complete=function(){c(H.old)&&H.old.call(this),H.queue&&n.dequeue(this,H.queue)},H},n.fn.extend({fadeTo:function(P,R,O,H){return this.filter(s).css("opacity",0).show().end().animate({opacity:R},P,O,H)},animate:function(P,R,O,H){var $=n.isEmptyObject(P),j=n.speed(R,O,H),G=function(){var L=D(this,n.extend({},P),j);($||u.get(this,"finish"))&&L.stop(!0)};return G.finish=G,$||j.queue===!1?this.each(G):this.queue(j.queue,G)},stop:function(P,R,O){var H=function($){var j=$.stop;delete $.stop,j(O)};return typeof P!="string"&&(O=R,R=P,P=void 0),R&&this.queue(P||"fx",[]),this.each(function(){var $=!0,j=P!=null&&P+"queueHooks",G=n.timers,L=u.get(this);if(j)L[j]&&L[j].stop&&H(L[j]);else for(j in L)L[j]&&L[j].stop&&_.test(j)&&H(L[j]);for(j=G.length;j--;)G[j].elem===this&&(P==null||G[j].queue===P)&&(G[j].anim.stop(O),$=!1,G.splice(j,1));($||!O)&&n.dequeue(this,P)})},finish:function(P){return P!==!1&&(P=P||"fx"),this.each(function(){var R,O=u.get(this),H=O[P+"queue"],$=O[P+"queueHooks"],j=n.timers,G=H?H.length:0;for(O.finish=!0,n.queue(this,P,[]),$&&$.stop&&$.stop.call(this,!0),R=j.length;R--;)j[R].elem===this&&j[R].queue===P&&(j[R].anim.stop(!0),j.splice(R,1));for(R=0;R<G;R++)H[R]&&H[R].finish&&H[R].finish.call(this);delete O.finish})}}),n.each(["toggle","show","hide"],function(P,R){var O=n.fn[R];n.fn[R]=function(H,$,j){return H==null||typeof H=="boolean"?O.apply(this,arguments):this.animate(I(R,!0),H,$,j)}}),n.each({slideDown:I("show"),slideUp:I("hide"),slideToggle:I("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(P,R){n.fn[P]=function(O,H,$){return this.animate(R,O,H,$)}}),n.timers=[],n.fx.tick=function(){var P,R=0,O=n.timers;for(v=Date.now();R<O.length;R++)P=O[R],!P()&&O[R]===P&&O.splice(R--,1);O.length||n.fx.stop(),v=void 0},n.fx.timer=function(P){n.timers.push(P),n.fx.start()},n.fx.interval=13,n.fx.start=function(){b||(b=!0,A())},n.fx.stop=function(){b=null},n.fx.speeds={slow:600,fast:200,_default:400},n}.apply(m,l),i!==void 0&&(w.exports=i)},2514:()=>{Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},Prism.languages.webmanifest=Prism.languages.json},2525:(w,m,r)=>{"use strict";const l=r(7638),i=r(560);w.exports=(n,p,f)=>{const c=[];let o=null,h=null;const y=n.sort((d,v)=>i(d,v,f));for(const d of y)l(d,p,f)?(h=d,o||(o=d)):(h&&c.push([o,h]),h=null,o=null);o&&c.push([o,null]);const s=[];for(const[d,v]of c)d===v?s.push(d):!v&&d===y[0]?s.push("*"):v?d===y[0]?s.push(`<=${v}`):s.push(`${d} - ${v}`):s.push(`>=${d}`);const g=s.join(" || "),u=typeof p.raw=="string"?p.raw:String(p);return g.length<u.length?g:p}},2543:function(w,m,r){w=r.nmd(w);var l;/**
* @license
* Lodash <https://lodash.com/>
* Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
* Released under MIT license <https://lodash.com/license>
* Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
* Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
*/(function(){var i,n="4.17.21",p=200,f="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",c="Expected a function",o="Invalid `variable` option passed into `_.template`",h="__lodash_hash_undefined__",y=500,s="__lodash_placeholder__",g=1,u=2,d=4,v=1,b=2,T=1,_=2,A=4,E=8,I=16,N=32,B=64,C=128,D=256,P=512,R=30,O="...",H=800,$=16,j=1,G=2,L=3,W=1/0,U=9007199254740991,Q=17976931348623157e292,ne=0/0,se=4294967295,X=se-1,ge=se>>>1,be=[["ary",C],["bind",T],["bindKey",_],["curry",E],["curryRight",I],["flip",P],["partial",N],["partialRight",B],["rearg",D]],_e="[object Arguments]",Be="[object Array]",st="[object AsyncFunction]",bt="[object Boolean]",At="[object Date]",Dt="[object DOMException]",fe="[object Error]",xe="[object Function]",Te="[object GeneratorFunction]",Le="[object Map]",ht="[object Number]",Ut="[object Null]",tt="[object Object]",Me="[object Promise]",de="[object Proxy]",Ce="[object RegExp]",Pe="[object Set]",J="[object String]",ve="[object Symbol]",he="[object Undefined]",ye="[object WeakMap]",Oe="[object WeakSet]",Ve="[object ArrayBuffer]",Ue="[object DataView]",qe="[object Float32Array]",et="[object Float64Array]",pt="[object Int8Array]",mt="[object Int16Array]",Bt="[object Int32Array]",kt="[object Uint8Array]",Pt="[object Uint8ClampedArray]",fn="[object Uint16Array]",dn="[object Uint32Array]",Pn=/\b__p \+= '';/g,On=/\b(__p \+=) '' \+/g,Ft=/(__e\(.*?\)|\b__t\)) \+\n'';/g,Bn=/&(?:amp|lt|gt|quot|#39);/g,Tt=/[&<>"']/g,Fn=RegExp(Bn.source),F=RegExp(Tt.source),q=/<%-([\s\S]+?)%>/g,Z=/<%([\s\S]+?)%>/g,ee=/<%=([\s\S]+?)%>/g,oe=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Ae=/^\w*$/,Se=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Re=/[\\^$.*+?()[\]{}|]/g,Ee=RegExp(Re.source),$e=/^\s+/,re=/\s/,ie=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,le=/\{\n\/\* \[wrapped with (.+)\] \*/,pe=/,? & /,Ie=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,je=/[()=,{}\[\]\/\s]/,Ne=/\\(\\)?/g,lt=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,St=/\w*$/,Ct=/^[-+]0x[0-9a-f]+$/i,gt=/^0b[01]+$/i,ot=/^\[object .+?Constructor\]$/,nt=/^0o[0-7]+$/i,fr=/^(?:0|[1-9]\d*)$/,Es=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,ai=/($^)/,qn=/['\n\r\u2028\u2029\\]/g,wi="\\ud800-\\udfff",Za="\\u0300-\\u036f",Qa="\\ufe20-\\ufe2f",ep="\\u20d0-\\u20ff",ws=Za+Qa+ep,_s="\\u2700-\\u27bf",Ps="a-z\\xdf-\\xf6\\xf8-\\xff",tp="\\xac\\xb1\\xd7\\xf7",np="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",ip="\\u2000-\\u206f",rp=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",Is="A-Z\\xc0-\\xd6\\xd8-\\xde",xs="\\ufe0e\\ufe0f",Ds=tp+np+ip+rp,dr="['\u2019]",sp="["+wi+"]",Rs="["+Ds+"]",_i="["+ws+"]",Cs="\\d+",op="["+_s+"]",Ns="["+Ps+"]",Ms="[^"+wi+Ds+Cs+_s+Ps+Is+"]",hr="\\ud83c[\\udffb-\\udfff]",ap="(?:"+_i+"|"+hr+")",ks="[^"+wi+"]",mr="(?:\\ud83c[\\udde6-\\uddff]){2}",gr="[\\ud800-\\udbff][\\udc00-\\udfff]",zn="["+Is+"]",Ls="\\u200d",Os="(?:"+Ns+"|"+Ms+")",pp="(?:"+zn+"|"+Ms+")",Bs="(?:"+dr+"(?:d|ll|m|re|s|t|ve))?",Fs="(?:"+dr+"(?:D|LL|M|RE|S|T|VE))?",js=ap+"?",Hs="["+xs+"]?",lp="(?:"+Ls+"(?:"+[ks,mr,gr].join("|")+")"+Hs+js+")*",up="\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])",cp="\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])",Gs=Hs+js+lp,fp="(?:"+[op,mr,gr].join("|")+")"+Gs,dp="(?:"+[ks+_i+"?",_i,mr,gr,sp].join("|")+")",hp=RegExp(dr,"g"),mp=RegExp(_i,"g"),yr=RegExp(hr+"(?="+hr+")|"+dp+Gs,"g"),gp=RegExp([zn+"?"+Ns+"+"+Bs+"(?="+[Rs,zn,"$"].join("|")+")",pp+"+"+Fs+"(?="+[Rs,zn+Os,"$"].join("|")+")",zn+"?"+Os+"+"+Bs,zn+"+"+Fs,cp,up,Cs,fp].join("|"),"g"),yp=RegExp("["+Ls+wi+ws+xs+"]"),vp=/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,bp=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"],Ap=-1,dt={};dt[qe]=dt[et]=dt[pt]=dt[mt]=dt[Bt]=dt[kt]=dt[Pt]=dt[fn]=dt[dn]=!0,dt[_e]=dt[Be]=dt[Ve]=dt[bt]=dt[Ue]=dt[At]=dt[fe]=dt[xe]=dt[Le]=dt[ht]=dt[tt]=dt[Ce]=dt[Pe]=dt[J]=dt[ye]=!1;var ft={};ft[_e]=ft[Be]=ft[Ve]=ft[Ue]=ft[bt]=ft[At]=ft[qe]=ft[et]=ft[pt]=ft[mt]=ft[Bt]=ft[Le]=ft[ht]=ft[tt]=ft[Ce]=ft[Pe]=ft[J]=ft[ve]=ft[kt]=ft[Pt]=ft[fn]=ft[dn]=!0,ft[fe]=ft[xe]=ft[ye]=!1;var Tp={\u00C0:"A",\u00C1:"A",\u00C2:"A",\u00C3:"A",\u00C4:"A",\u00C5:"A",\u00E0:"a",\u00E1:"a",\u00E2:"a",\u00E3:"a",\u00E4:"a",\u00E5:"a",\u00C7:"C",\u00E7:"c",\u00D0:"D",\u00F0:"d",\u00C8:"E",\u00C9:"E",\u00CA:"E",\u00CB:"E",\u00E8:"e",\u00E9:"e",\u00EA:"e",\u00EB:"e",\u00CC:"I",\u00CD:"I",\u00CE:"I",\u00CF:"I",\u00EC:"i",\u00ED:"i",\u00EE:"i",\u00EF:"i",\u00D1:"N",\u00F1:"n",\u00D2:"O",\u00D3:"O",\u00D4:"O",\u00D5:"O",\u00D6:"O",\u00D8:"O",\u00F2:"o",\u00F3:"o",\u00F4:"o",\u00F5:"o",\u00F6:"o",\u00F8:"o",\u00D9:"U",\u00DA:"U",\u00DB:"U",\u00DC:"U",\u00F9:"u",\u00FA:"u",\u00FB:"u",\u00FC:"u",\u00DD:"Y",\u00FD:"y",\u00FF:"y",\u00C6:"Ae",\u00E6:"ae",\u00DE:"Th",\u00FE:"th",\u00DF:"ss",\u0100:"A",\u0102:"A",\u0104:"A",\u0101:"a",\u0103:"a",\u0105:"a",\u0106:"C",\u0108:"C",\u010A:"C",\u010C:"C",\u0107:"c",\u0109:"c",\u010B:"c",\u010D:"c",\u010E:"D",\u0110:"D",\u010F:"d",\u0111:"d",\u0112:"E",\u0114:"E",\u0116:"E",\u0118:"E",\u011A:"E",\u0113:"e",\u0115:"e",\u0117:"e",\u0119:"e",\u011B:"e",\u011C:"G",\u011E:"G",\u0120:"G",\u0122:"G",\u011D:"g",\u011F:"g",\u0121:"g",\u0123:"g",\u0124:"H",\u0126:"H",\u0125:"h",\u0127:"h",\u0128:"I",\u012A:"I",\u012C:"I",\u012E:"I",\u0130:"I",\u0129:"i",\u012B:"i",\u012D:"i",\u012F:"i",\u0131:"i",\u0134:"J",\u0135:"j",\u0136:"K",\u0137:"k",\u0138:"k",\u0139:"L",\u013B:"L",\u013D:"L",\u013F:"L",\u0141:"L",\u013A:"l",\u013C:"l",\u013E:"l",\u0140:"l",\u0142:"l",\u0143:"N",\u0145:"N",\u0147:"N",\u014A:"N",\u0144:"n",\u0146:"n",\u0148:"n",\u014B:"n",\u014C:"O",\u014E:"O",\u0150:"O",\u014D:"o",\u014F:"o",\u0151:"o",\u0154:"R",\u0156:"R",\u0158:"R",\u0155:"r",\u0157:"r",\u0159:"r",\u015A:"S",\u015C:"S",\u015E:"S",\u0160:"S",\u015B:"s",\u015D:"s",\u015F:"s",\u0161:"s",\u0162:"T",\u0164:"T",\u0166:"T",\u0163:"t",\u0165:"t",\u0167:"t",\u0168:"U",\u016A:"U",\u016C:"U",\u016E:"U",\u0170:"U",\u0172:"U",\u0169:"u",\u016B:"u",\u016D:"u",\u016F:"u",\u0171:"u",\u0173:"u",\u0174:"W",\u0175:"w",\u0176:"Y",\u0177:"y",\u0178:"Y",\u0179:"Z",\u017B:"Z",\u017D:"Z",\u017A:"z",\u017C:"z",\u017E:"z",\u0132:"IJ",\u0133:"ij",\u0152:"Oe",\u0153:"oe",\u0149:"'n",\u017F:"s"},Sp={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ep={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"},wp={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},_p=parseFloat,Pp=parseInt,Us=typeof r.g=="object"&&r.g&&r.g.Object===Object&&r.g,Ip=typeof self=="object"&&self&&self.Object===Object&&self,Nt=Us||Ip||Function("return this")(),Vs=m&&!m.nodeType&&m,pi=Vs&&!0&&w&&!w.nodeType&&w,$s=pi&&pi.exports===Vs,vr=$s&&Us.process,Qt=function(){try{var z=pi&&pi.require&&pi.require("util").types;return z||vr&&vr.binding&&vr.binding("util")}catch(ae){}}(),Ws=Qt&&Qt.isArrayBuffer,Ks=Qt&&Qt.isDate,qs=Qt&&Qt.isMap,zs=Qt&&Qt.isRegExp,Ys=Qt&&Qt.isSet,Js=Qt&&Qt.isTypedArray;function qt(z,ae,te){switch(te.length){case 0:return z.call(ae);case 1:return z.call(ae,te[0]);case 2:return z.call(ae,te[0],te[1]);case 3:return z.call(ae,te[0],te[1],te[2])}return z.apply(ae,te)}function xp(z,ae,te,De){for(var We=-1,rt=z==null?0:z.length;++We<rt;){var It=z[We];ae(De,It,te(It),z)}return De}function en(z,ae){for(var te=-1,De=z==null?0:z.length;++te<De&&ae(z[te],te,z)!==!1;);return z}function Dp(z,ae){for(var te=z==null?0:z.length;te--&&ae(z[te],te,z)!==!1;);return z}function Xs(z,ae){for(var te=-1,De=z==null?0:z.length;++te<De;)if(!ae(z[te],te,z))return!1;return!0}function In(z,ae){for(var te=-1,De=z==null?0:z.length,We=0,rt=[];++te<De;){var It=z[te];ae(It,te,z)&&(rt[We++]=It)}return rt}function Pi(z,ae){var te=z==null?0:z.length;return!!te&&Yn(z,ae,0)>-1}function br(z,ae,te){for(var De=-1,We=z==null?0:z.length;++De<We;)if(te(ae,z[De]))return!0;return!1}function yt(z,ae){for(var te=-1,De=z==null?0:z.length,We=Array(De);++te<De;)We[te]=ae(z[te],te,z);return We}function xn(z,ae){for(var te=-1,De=ae.length,We=z.length;++te<De;)z[We+te]=ae[te];return z}function Ar(z,ae,te,De){var We=-1,rt=z==null?0:z.length;for(De&&rt&&(te=z[++We]);++We<rt;)te=ae(te,z[We],We,z);return te}function Rp(z,ae,te,De){var We=z==null?0:z.length;for(De&&We&&(te=z[--We]);We--;)te=ae(te,z[We],We,z);return te}function Tr(z,ae){for(var te=-1,De=z==null?0:z.length;++te<De;)if(ae(z[te],te,z))return!0;return!1}var Cp=Sr("length");function Np(z){return z.split("")}function Mp(z){return z.match(Ie)||[]}function Zs(z,ae,te){var De;return te(z,function(We,rt,It){if(ae(We,rt,It))return De=rt,!1}),De}function Ii(z,ae,te,De){for(var We=z.length,rt=te+(De?1:-1);De?rt--:++rt<We;)if(ae(z[rt],rt,z))return rt;return-1}function Yn(z,ae,te){return ae===ae?Wp(z,ae,te):Ii(z,Qs,te)}function kp(z,ae,te,De){for(var We=te-1,rt=z.length;++We<rt;)if(De(z[We],ae))return We;return-1}function Qs(z){return z!==z}function eo(z,ae){var te=z==null?0:z.length;return te?wr(z,ae)/te:ne}function Sr(z){return function(ae){return ae==null?i:ae[z]}}function Er(z){return function(ae){return z==null?i:z[ae]}}function to(z,ae,te,De,We){return We(z,function(rt,It,ct){te=De?(De=!1,rt):ae(te,rt,It,ct)}),te}function Lp(z,ae){var te=z.length;for(z.sort(ae);te--;)z[te]=z[te].value;return z}function wr(z,ae){for(var te,De=-1,We=z.length;++De<We;){var rt=ae(z[De]);rt!==i&&(te=te===i?rt:te+rt)}return te}function _r(z,ae){for(var te=-1,De=Array(z);++te<z;)De[te]=ae(te);return De}function Op(z,ae){return yt(ae,function(te){return[te,z[te]]})}function no(z){return z&&z.slice(0,oo(z)+1).replace($e,"")}function zt(z){return function(ae){return z(ae)}}function Pr(z,ae){return yt(ae,function(te){return z[te]})}function li(z,ae){return z.has(ae)}function io(z,ae){for(var te=-1,De=z.length;++te<De&&Yn(ae,z[te],0)>-1;);return te}function ro(z,ae){for(var te=z.length;te--&&Yn(ae,z[te],0)>-1;);return te}function Bp(z,ae){for(var te=z.length,De=0;te--;)z[te]===ae&&++De;return De}var Fp=Er(Tp),jp=Er(Sp);function Hp(z){return"\\"+wp[z]}function Gp(z,ae){return z==null?i:z[ae]}function Jn(z){return yp.test(z)}function Up(z){return vp.test(z)}function Vp(z){for(var ae,te=[];!(ae=z.next()).done;)te.push(ae.value);return te}function Ir(z){var ae=-1,te=Array(z.size);return z.forEach(function(De,We){te[++ae]=[We,De]}),te}function so(z,ae){return function(te){return z(ae(te))}}function Dn(z,ae){for(var te=-1,De=z.length,We=0,rt=[];++te<De;){var It=z[te];(It===ae||It===s)&&(z[te]=s,rt[We++]=te)}return rt}function xi(z){var ae=-1,te=Array(z.size);return z.forEach(function(De){te[++ae]=De}),te}function $p(z){var ae=-1,te=Array(z.size);return z.forEach(function(De){te[++ae]=[De,De]}),te}function Wp(z,ae,te){for(var De=te-1,We=z.length;++De<We;)if(z[De]===ae)return De;return-1}function Kp(z,ae,te){for(var De=te+1;De--;)if(z[De]===ae)return De;return De}function Xn(z){return Jn(z)?zp(z):Cp(z)}function pn(z){return Jn(z)?Yp(z):Np(z)}function oo(z){for(var ae=z.length;ae--&&re.test(z.charAt(ae)););return ae}var qp=Er(Ep);function zp(z){for(var ae=yr.lastIndex=0;yr.test(z);)++ae;return ae}function Yp(z){return z.match(yr)||[]}function Jp(z){return z.match(gp)||[]}var Xp=function z(ae){ae=ae==null?Nt:Di.defaults(Nt.Object(),ae,Di.pick(Nt,bp));var te=ae.Array,De=ae.Date,We=ae.Error,rt=ae.Function,It=ae.Math,ct=ae.Object,xr=ae.RegExp,Zp=ae.String,tn=ae.TypeError,Ri=te.prototype,Qp=rt.prototype,Zn=ct.prototype,Ci=ae["__core-js_shared__"],Ni=Qp.toString,ut=Zn.hasOwnProperty,el=0,ao=function(){var e=/[^.]+$/.exec(Ci&&Ci.keys&&Ci.keys.IE_PROTO||"");return e?"Symbol(src)_1."+e:""}(),Mi=Zn.toString,tl=Ni.call(ct),nl=Nt._,il=xr("^"+Ni.call(ut).replace(Re,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),ki=$s?ae.Buffer:i,Rn=ae.Symbol,Li=ae.Uint8Array,po=ki?ki.allocUnsafe:i,Oi=so(ct.getPrototypeOf,ct),lo=ct.create,uo=Zn.propertyIsEnumerable,Bi=Ri.splice,co=Rn?Rn.isConcatSpreadable:i,ui=Rn?Rn.iterator:i,jn=Rn?Rn.toStringTag:i,Fi=function(){try{var e=$n(ct,"defineProperty");return e({},"",{}),e}catch(t){}}(),rl=ae.clearTimeout!==Nt.clearTimeout&&ae.clearTimeout,sl=De&&De.now!==Nt.Date.now&&De.now,ol=ae.setTimeout!==Nt.setTimeout&&ae.setTimeout,ji=It.ceil,Hi=It.floor,Dr=ct.getOwnPropertySymbols,al=ki?ki.isBuffer:i,fo=ae.isFinite,pl=Ri.join,ll=so(ct.keys,ct),xt=It.max,Lt=It.min,ul=De.now,cl=ae.parseInt,ho=It.random,fl=Ri.reverse,Rr=$n(ae,"DataView"),ci=$n(ae,"Map"),Cr=$n(ae,"Promise"),Qn=$n(ae,"Set"),fi=$n(ae,"WeakMap"),di=$n(ct,"create"),Gi=fi&&new fi,ei={},dl=Wn(Rr),hl=Wn(ci),ml=Wn(Cr),gl=Wn(Qn),yl=Wn(fi),Ui=Rn?Rn.prototype:i,hi=Ui?Ui.valueOf:i,mo=Ui?Ui.toString:i;function M(e){if(Et(e)&&!Ke(e)&&!(e instanceof Ze)){if(e instanceof nn)return e;if(ut.call(e,"__wrapped__"))return ga(e)}return new nn(e)}var ti=function(){function e(){}return function(t){if(!vt(t))return{};if(lo)return lo(t);e.prototype=t;var a=new e;return e.prototype=i,a}}();function Vi(){}function nn(e,t){this.__wrapped__=e,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=i}M.templateSettings={escape:q,evaluate:Z,interpolate:ee,variable:"",imports:{_:M}},M.prototype=Vi.prototype,M.prototype.constructor=M,nn.prototype=ti(Vi.prototype),nn.prototype.constructor=nn;function Ze(e){this.__wrapped__=e,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=se,this.__views__=[]}function vl(){var e=new Ze(this.__wrapped__);return e.__actions__=Vt(this.__actions__),e.__dir__=this.__dir__,e.__filtered__=this.__filtered__,e.__iteratees__=Vt(this.__iteratees__),e.__takeCount__=this.__takeCount__,e.__views__=Vt(this.__views__),e}function bl(){if(this.__filtered__){var e=new Ze(this);e.__dir__=-1,e.__filtered__=!0}else e=this.clone(),e.__dir__*=-1;return e}function Al(){var e=this.__wrapped__.value(),t=this.__dir__,a=Ke(e),S=t<0,x=a?e.length:0,k=N0(0,x,this.__views__),V=k.start,K=k.end,Y=K-V,ue=S?K:V-1,ce=this.__iteratees__,me=ce.length,we=0,ke=Lt(Y,this.__takeCount__);if(!a||!S&&x==Y&&ke==Y)return jo(e,this.__actions__);var He=[];e:for(;Y--&&we<ke;){ue+=t;for(var Ye=-1,Ge=e[ue];++Ye<me;){var Xe=ce[Ye],Qe=Xe.iteratee,Xt=Xe.type,Gt=Qe(Ge);if(Xt==G)Ge=Gt;else if(!Gt){if(Xt==j)continue e;break e}}He[we++]=Ge}return He}Ze.prototype=ti(Vi.prototype),Ze.prototype.constructor=Ze;function Hn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Tl(){this.__data__=di?di(null):{},this.size=0}function Sl(e){var t=this.has(e)&&delete this.__data__[e];return this.size-=t?1:0,t}function El(e){var t=this.__data__;if(di){var a=t[e];return a===h?i:a}return ut.call(t,e)?t[e]:i}function wl(e){var t=this.__data__;return di?t[e]!==i:ut.call(t,e)}function _l(e,t){var a=this.__data__;return this.size+=this.has(e)?0:1,a[e]=di&&t===i?h:t,this}Hn.prototype.clear=Tl,Hn.prototype.delete=Sl,Hn.prototype.get=El,Hn.prototype.has=wl,Hn.prototype.set=_l;function yn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Pl(){this.__data__=[],this.size=0}function Il(e){var t=this.__data__,a=$i(t,e);if(a<0)return!1;var S=t.length-1;return a==S?t.pop():Bi.call(t,a,1),--this.size,!0}function xl(e){var t=this.__data__,a=$i(t,e);return a<0?i:t[a][1]}function Dl(e){return $i(this.__data__,e)>-1}function Rl(e,t){var a=this.__data__,S=$i(a,e);return S<0?(++this.size,a.push([e,t])):a[S][1]=t,this}yn.prototype.clear=Pl,yn.prototype.delete=Il,yn.prototype.get=xl,yn.prototype.has=Dl,yn.prototype.set=Rl;function vn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Cl(){this.size=0,this.__data__={hash:new Hn,map:new(ci||yn),string:new Hn}}function Nl(e){var t=nr(this,e).delete(e);return this.size-=t?1:0,t}function Ml(e){return nr(this,e).get(e)}function kl(e){return nr(this,e).has(e)}function Ll(e,t){var a=nr(this,e),S=a.size;return a.set(e,t),this.size+=a.size==S?0:1,this}vn.prototype.clear=Cl,vn.prototype.delete=Nl,vn.prototype.get=Ml,vn.prototype.has=kl,vn.prototype.set=Ll;function Gn(e){var t=-1,a=e==null?0:e.length;for(this.__data__=new vn;++t<a;)this.add(e[t])}function Ol(e){return this.__data__.set(e,h),this}function Bl(e){return this.__data__.has(e)}Gn.prototype.add=Gn.prototype.push=Ol,Gn.prototype.has=Bl;function ln(e){var t=this.__data__=new yn(e);this.size=t.size}function Fl(){this.__data__=new yn,this.size=0}function jl(e){var t=this.__data__,a=t.delete(e);return this.size=t.size,a}function Hl(e){return this.__data__.get(e)}function Gl(e){return this.__data__.has(e)}function Ul(e,t){var a=this.__data__;if(a instanceof yn){var S=a.__data__;if(!ci||S.length<p-1)return S.push([e,t]),this.size=++a.size,this;a=this.__data__=new vn(S)}return a.set(e,t),this.size=a.size,this}ln.prototype.clear=Fl,ln.prototype.delete=jl,ln.prototype.get=Hl,ln.prototype.has=Gl,ln.prototype.set=Ul;function go(e,t){var a=Ke(e),S=!a&&Kn(e),x=!a&&!S&&Ln(e),k=!a&&!S&&!x&&si(e),V=a||S||x||k,K=V?_r(e.length,Zp):[],Y=K.length;for(var ue in e)(t||ut.call(e,ue))&&!(V&&(ue=="length"||x&&(ue=="offset"||ue=="parent")||k&&(ue=="buffer"||ue=="byteLength"||ue=="byteOffset")||Sn(ue,Y)))&&K.push(ue);return K}function yo(e){var t=e.length;return t?e[Ur(0,t-1)]:i}function Vl(e,t){return ir(Vt(e),Un(t,0,e.length))}function $l(e){return ir(Vt(e))}function Nr(e,t,a){(a!==i&&!un(e[t],a)||a===i&&!(t in e))&&bn(e,t,a)}function mi(e,t,a){var S=e[t];(!(ut.call(e,t)&&un(S,a))||a===i&&!(t in e))&&bn(e,t,a)}function $i(e,t){for(var a=e.length;a--;)if(un(e[a][0],t))return a;return-1}function Wl(e,t,a,S){return Cn(e,function(x,k,V){t(S,x,a(x),V)}),S}function vo(e,t){return e&&mn(t,Rt(t),e)}function Kl(e,t){return e&&mn(t,Wt(t),e)}function bn(e,t,a){t=="__proto__"&&Fi?Fi(e,t,{configurable:!0,enumerable:!0,value:a,writable:!0}):e[t]=a}function Mr(e,t){for(var a=-1,S=t.length,x=te(S),k=e==null;++a<S;)x[a]=k?i:ds(e,t[a]);return x}function Un(e,t,a){return e===e&&(a!==i&&(e=e<=a?e:a),t!==i&&(e=e>=t?e:t)),e}function rn(e,t,a,S,x,k){var V,K=t&g,Y=t&u,ue=t&d;if(a&&(V=x?a(e,S,x,k):a(e)),V!==i)return V;if(!vt(e))return e;var ce=Ke(e);if(ce){if(V=k0(e),!K)return Vt(e,V)}else{var me=Ot(e),we=me==xe||me==Te;if(Ln(e))return Uo(e,K);if(me==tt||me==_e||we&&!x){if(V=Y||we?{}:aa(e),!K)return Y?E0(e,Kl(V,e)):S0(e,vo(V,e))}else{if(!ft[me])return x?e:{};V=L0(e,me,K)}}k||(k=new ln);var ke=k.get(e);if(ke)return ke;k.set(e,V),Oa(e)?e.forEach(function(Ge){V.add(rn(Ge,t,a,Ge,e,k))}):ka(e)&&e.forEach(function(Ge,Xe){V.set(Xe,rn(Ge,t,a,Xe,e,k))});var He=ue?Y?Qr:Zr:Y?Wt:Rt,Ye=ce?i:He(e);return en(Ye||e,function(Ge,Xe){Ye&&(Xe=Ge,Ge=e[Xe]),mi(V,Xe,rn(Ge,t,a,Xe,e,k))}),V}function ql(e){var t=Rt(e);return function(a){return bo(a,e,t)}}function bo(e,t,a){var S=a.length;if(e==null)return!S;for(e=ct(e);S--;){var x=a[S],k=t[x],V=e[x];if(V===i&&!(x in e)||!k(V))return!1}return!0}function Ao(e,t,a){if(typeof e!="function")throw new tn(c);return Si(function(){e.apply(i,a)},t)}function gi(e,t,a,S){var x=-1,k=Pi,V=!0,K=e.length,Y=[],ue=t.length;if(!K)return Y;a&&(t=yt(t,zt(a))),S?(k=br,V=!1):t.length>=p&&(k=li,V=!1,t=new Gn(t));e:for(;++x<K;){var ce=e[x],me=a==null?ce:a(ce);if(ce=S||ce!==0?ce:0,V&&me===me){for(var we=ue;we--;)if(t[we]===me)continue e;Y.push(ce)}else k(t,me,S)||Y.push(ce)}return Y}var Cn=qo(hn),To=qo(Lr,!0);function zl(e,t){var a=!0;return Cn(e,function(S,x,k){return a=!!t(S,x,k),a}),a}function Wi(e,t,a){for(var S=-1,x=e.length;++S<x;){var k=e[S],V=t(k);if(V!=null&&(K===i?V===V&&!Jt(V):a(V,K)))var K=V,Y=k}return Y}function Yl(e,t,a,S){var x=e.length;for(a=ze(a),a<0&&(a=-a>x?0:x+a),S=S===i||S>x?x:ze(S),S<0&&(S+=x),S=a>S?0:Fa(S);a<S;)e[a++]=t;return e}function So(e,t){var a=[];return Cn(e,function(S,x,k){t(S,x,k)&&a.push(S)}),a}function Mt(e,t,a,S,x){var k=-1,V=e.length;for(a||(a=B0),x||(x=[]);++k<V;){var K=e[k];t>0&&a(K)?t>1?Mt(K,t-1,a,S,x):xn(x,K):S||(x[x.length]=K)}return x}var kr=zo(),Eo=zo(!0);function hn(e,t){return e&&kr(e,t,Rt)}function Lr(e,t){return e&&Eo(e,t,Rt)}function Ki(e,t){return In(t,function(a){return En(e[a])})}function Vn(e,t){t=Mn(t,e);for(var a=0,S=t.length;e!=null&&a<S;)e=e[gn(t[a++])];return a&&a==S?e:i}function wo(e,t,a){var S=t(e);return Ke(e)?S:xn(S,a(e))}function jt(e){return e==null?e===i?he:Ut:jn&&jn in ct(e)?C0(e):$0(e)}function Or(e,t){return e>t}function Jl(e,t){return e!=null&&ut.call(e,t)}function Xl(e,t){return e!=null&&t in ct(e)}function Zl(e,t,a){return e>=Lt(t,a)&&e<xt(t,a)}function Br(e,t,a){for(var S=a?br:Pi,x=e[0].length,k=e.length,V=k,K=te(k),Y=1/0,ue=[];V--;){var ce=e[V];V&&t&&(ce=yt(ce,zt(t))),Y=Lt(ce.length,Y),K[V]=!a&&(t||x>=120&&ce.length>=120)?new Gn(V&&ce):i}ce=e[0];var me=-1,we=K[0];e:for(;++me<x&&ue.length<Y;){var ke=ce[me],He=t?t(ke):ke;if(ke=a||ke!==0?ke:0,!(we?li(we,He):S(ue,He,a))){for(V=k;--V;){var Ye=K[V];if(!(Ye?li(Ye,He):S(e[V],He,a)))continue e}we&&we.push(He),ue.push(ke)}}return ue}function Ql(e,t,a,S){return hn(e,function(x,k,V){t(S,a(x),k,V)}),S}function yi(e,t,a){t=Mn(t,e),e=ca(e,t);var S=e==null?e:e[gn(on(t))];return S==null?i:qt(S,e,a)}function _o(e){return Et(e)&&jt(e)==_e}function e0(e){return Et(e)&&jt(e)==Ve}function t0(e){return Et(e)&&jt(e)==At}function vi(e,t,a,S,x){return e===t?!0:e==null||t==null||!Et(e)&&!Et(t)?e!==e&&t!==t:n0(e,t,a,S,vi,x)}function n0(e,t,a,S,x,k){var V=Ke(e),K=Ke(t),Y=V?Be:Ot(e),ue=K?Be:Ot(t);Y=Y==_e?tt:Y,ue=ue==_e?tt:ue;var ce=Y==tt,me=ue==tt,we=Y==ue;if(we&&Ln(e)){if(!Ln(t))return!1;V=!0,ce=!1}if(we&&!ce)return k||(k=new ln),V||si(e)?ra(e,t,a,S,x,k):D0(e,t,Y,a,S,x,k);if(!(a&v)){var ke=ce&&ut.call(e,"__wrapped__"),He=me&&ut.call(t,"__wrapped__");if(ke||He){var Ye=ke?e.value():e,Ge=He?t.value():t;return k||(k=new ln),x(Ye,Ge,a,S,k)}}return we?(k||(k=new ln),R0(e,t,a,S,x,k)):!1}function i0(e){return Et(e)&&Ot(e)==Le}function Fr(e,t,a,S){var x=a.length,k=x,V=!S;if(e==null)return!k;for(e=ct(e);x--;){var K=a[x];if(V&&K[2]?K[1]!==e[K[0]]:!(K[0]in e))return!1}for(;++x<k;){K=a[x];var Y=K[0],ue=e[Y],ce=K[1];if(V&&K[2]){if(ue===i&&!(Y in e))return!1}else{var me=new ln;if(S)var we=S(ue,ce,Y,e,t,me);if(!(we===i?vi(ce,ue,v|b,S,me):we))return!1}}return!0}function Po(e){if(!vt(e)||j0(e))return!1;var t=En(e)?il:ot;return t.test(Wn(e))}function r0(e){return Et(e)&&jt(e)==Ce}function s0(e){return Et(e)&&Ot(e)==Pe}function o0(e){return Et(e)&&lr(e.length)&&!!dt[jt(e)]}function Io(e){return typeof e=="function"?e:e==null?Kt:typeof e=="object"?Ke(e)?Ro(e[0],e[1]):Do(e):Ya(e)}function jr(e){if(!Ti(e))return ll(e);var t=[];for(var a in ct(e))ut.call(e,a)&&a!="constructor"&&t.push(a);return t}function a0(e){if(!vt(e))return V0(e);var t=Ti(e),a=[];for(var S in e)S=="constructor"&&(t||!ut.call(e,S))||a.push(S);return a}function Hr(e,t){return e<t}function xo(e,t){var a=-1,S=$t(e)?te(e.length):[];return Cn(e,function(x,k,V){S[++a]=t(x,k,V)}),S}function Do(e){var t=ts(e);return t.length==1&&t[0][2]?la(t[0][0],t[0][1]):function(a){return a===e||Fr(a,e,t)}}function Ro(e,t){return is(e)&&pa(t)?la(gn(e),t):function(a){var S=ds(a,e);return S===i&&S===t?hs(a,e):vi(t,S,v|b)}}function qi(e,t,a,S,x){e!==t&&kr(t,function(k,V){if(x||(x=new ln),vt(k))p0(e,t,V,a,qi,S,x);else{var K=S?S(ss(e,V),k,V+"",e,t,x):i;K===i&&(K=k),Nr(e,V,K)}},Wt)}function p0(e,t,a,S,x,k,V){var K=ss(e,a),Y=ss(t,a),ue=V.get(Y);if(ue){Nr(e,a,ue);return}var ce=k?k(K,Y,a+"",e,t,V):i,me=ce===i;if(me){var we=Ke(Y),ke=!we&&Ln(Y),He=!we&&!ke&&si(Y);ce=Y,we||ke||He?Ke(K)?ce=K:wt(K)?ce=Vt(K):ke?(me=!1,ce=Uo(Y,!0)):He?(me=!1,ce=Vo(Y,!0)):ce=[]:Ei(Y)||Kn(Y)?(ce=K,Kn(K)?ce=ja(K):(!vt(K)||En(K))&&(ce=aa(Y))):me=!1}me&&(V.set(Y,ce),x(ce,Y,S,k,V),V.delete(Y)),Nr(e,a,ce)}function Co(e,t){var a=e.length;if(a)return t+=t<0?a:0,Sn(t,a)?e[t]:i}function No(e,t,a){t.length?t=yt(t,function(k){return Ke(k)?function(V){return Vn(V,k.length===1?k[0]:k)}:k}):t=[Kt];var S=-1;t=yt(t,zt(Fe()));var x=xo(e,function(k,V,K){var Y=yt(t,function(ue){return ue(k)});return{criteria:Y,index:++S,value:k}});return Lp(x,function(k,V){return T0(k,V,a)})}function l0(e,t){return Mo(e,t,function(a,S){return hs(e,S)})}function Mo(e,t,a){for(var S=-1,x=t.length,k={};++S<x;){var V=t[S],K=Vn(e,V);a(K,V)&&bi(k,Mn(V,e),K)}return k}function u0(e){return function(t){return Vn(t,e)}}function Gr(e,t,a,S){var x=S?kp:Yn,k=-1,V=t.length,K=e;for(e===t&&(t=Vt(t)),a&&(K=yt(e,zt(a)));++k<V;)for(var Y=0,ue=t[k],ce=a?a(ue):ue;(Y=x(K,ce,Y,S))>-1;)K!==e&&Bi.call(K,Y,1),Bi.call(e,Y,1);return e}function ko(e,t){for(var a=e?t.length:0,S=a-1;a--;){var x=t[a];if(a==S||x!==k){var k=x;Sn(x)?Bi.call(e,x,1):Wr(e,x)}}return e}function Ur(e,t){return e+Hi(ho()*(t-e+1))}function c0(e,t,a,S){for(var x=-1,k=xt(ji((t-e)/(a||1)),0),V=te(k);k--;)V[S?k:++x]=e,e+=a;return V}function Vr(e,t){var a="";if(!e||t<1||t>U)return a;do t%2&&(a+=e),t=Hi(t/2),t&&(e+=e);while(t);return a}function Je(e,t){return os(ua(e,t,Kt),e+"")}function f0(e){return yo(oi(e))}function d0(e,t){var a=oi(e);return ir(a,Un(t,0,a.length))}function bi(e,t,a,S){if(!vt(e))return e;t=Mn(t,e);for(var x=-1,k=t.length,V=k-1,K=e;K!=null&&++x<k;){var Y=gn(t[x]),ue=a;if(Y==="__proto__"||Y==="constructor"||Y==="prototype")return e;if(x!=V){var ce=K[Y];ue=S?S(ce,Y,K):i,ue===i&&(ue=vt(ce)?ce:Sn(t[x+1])?[]:{})}mi(K,Y,ue),K=K[Y]}return e}var Lo=Gi?function(e,t){return Gi.set(e,t),e}:Kt,h0=Fi?function(e,t){return Fi(e,"toString",{configurable:!0,enumerable:!1,value:gs(t),writable:!0})}:Kt;function m0(e){return ir(oi(e))}function sn(e,t,a){var S=-1,x=e.length;t<0&&(t=-t>x?0:x+t),a=a>x?x:a,a<0&&(a+=x),x=t>a?0:a-t>>>0,t>>>=0;for(var k=te(x);++S<x;)k[S]=e[S+t];return k}function g0(e,t){var a;return Cn(e,function(S,x,k){return a=t(S,x,k),!a}),!!a}function zi(e,t,a){var S=0,x=e==null?S:e.length;if(typeof t=="number"&&t===t&&x<=ge){for(;S<x;){var k=S+x>>>1,V=e[k];V!==null&&!Jt(V)&&(a?V<=t:V<t)?S=k+1:x=k}return x}return $r(e,t,Kt,a)}function $r(e,t,a,S){var x=0,k=e==null?0:e.length;if(k===0)return 0;t=a(t);for(var V=t!==t,K=t===null,Y=Jt(t),ue=t===i;x<k;){var ce=Hi((x+k)/2),me=a(e[ce]),we=me!==i,ke=me===null,He=me===me,Ye=Jt(me);if(V)var Ge=S||He;else ue?Ge=He&&(S||we):K?Ge=He&&we&&(S||!ke):Y?Ge=He&&we&&!ke&&(S||!Ye):ke||Ye?Ge=!1:Ge=S?me<=t:me<t;Ge?x=ce+1:k=ce}return Lt(k,X)}function Oo(e,t){for(var a=-1,S=e.length,x=0,k=[];++a<S;){var V=e[a],K=t?t(V):V;if(!a||!un(K,Y)){var Y=K;k[x++]=V===0?0:V}}return k}function Bo(e){return typeof e=="number"?e:Jt(e)?ne:+e}function Yt(e){if(typeof e=="string")return e;if(Ke(e))return yt(e,Yt)+"";if(Jt(e))return mo?mo.call(e):"";var t=e+"";return t=="0"&&1/e==-W?"-0":t}function Nn(e,t,a){var S=-1,x=Pi,k=e.length,V=!0,K=[],Y=K;if(a)V=!1,x=br;else if(k>=p){var ue=t?null:I0(e);if(ue)return xi(ue);V=!1,x=li,Y=new Gn}else Y=t?[]:K;e:for(;++S<k;){var ce=e[S],me=t?t(ce):ce;if(ce=a||ce!==0?ce:0,V&&me===me){for(var we=Y.length;we--;)if(Y[we]===me)continue e;t&&Y.push(me),K.push(ce)}else x(Y,me,a)||(Y!==K&&Y.push(me),K.push(ce))}return K}function Wr(e,t){return t=Mn(t,e),e=ca(e,t),e==null||delete e[gn(on(t))]}function Fo(e,t,a,S){return bi(e,t,a(Vn(e,t)),S)}function Yi(e,t,a,S){for(var x=e.length,k=S?x:-1;(S?k--:++k<x)&&t(e[k],k,e););return a?sn(e,S?0:k,S?k+1:x):sn(e,S?k+1:0,S?x:k)}function jo(e,t){var a=e;return a instanceof Ze&&(a=a.value()),Ar(t,function(S,x){return x.func.apply(x.thisArg,xn([S],x.args))},a)}function Kr(e,t,a){var S=e.length;if(S<2)return S?Nn(e[0]):[];for(var x=-1,k=te(S);++x<S;)for(var V=e[x],K=-1;++K<S;)K!=x&&(k[x]=gi(k[x]||V,e[K],t,a));return Nn(Mt(k,1),t,a)}function Ho(e,t,a){for(var S=-1,x=e.length,k=t.length,V={};++S<x;){var K=S<k?t[S]:i;a(V,e[S],K)}return V}function qr(e){return wt(e)?e:[]}function zr(e){return typeof e=="function"?e:Kt}function Mn(e,t){return Ke(e)?e:is(e,t)?[e]:ma(at(e))}var y0=Je;function kn(e,t,a){var S=e.length;return a=a===i?S:a,!t&&a>=S?e:sn(e,t,a)}var Go=rl||function(e){return Nt.clearTimeout(e)};function Uo(e,t){if(t)return e.slice();var a=e.length,S=po?po(a):new e.constructor(a);return e.copy(S),S}function Yr(e){var t=new e.constructor(e.byteLength);return new Li(t).set(new Li(e)),t}function v0(e,t){var a=t?Yr(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.byteLength)}function b0(e){var t=new e.constructor(e.source,St.exec(e));return t.lastIndex=e.lastIndex,t}function A0(e){return hi?ct(hi.call(e)):{}}function Vo(e,t){var a=t?Yr(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.length)}function $o(e,t){if(e!==t){var a=e!==i,S=e===null,x=e===e,k=Jt(e),V=t!==i,K=t===null,Y=t===t,ue=Jt(t);if(!K&&!ue&&!k&&e>t||k&&V&&Y&&!K&&!ue||S&&V&&Y||!a&&Y||!x)return 1;if(!S&&!k&&!ue&&e<t||ue&&a&&x&&!S&&!k||K&&a&&x||!V&&x||!Y)return-1}return 0}function T0(e,t,a){for(var S=-1,x=e.criteria,k=t.criteria,V=x.length,K=a.length;++S<V;){var Y=$o(x[S],k[S]);if(Y){if(S>=K)return Y;var ue=a[S];return Y*(ue=="desc"?-1:1)}}return e.index-t.index}function Wo(e,t,a,S){for(var x=-1,k=e.length,V=a.length,K=-1,Y=t.length,ue=xt(k-V,0),ce=te(Y+ue),me=!S;++K<Y;)ce[K]=t[K];for(;++x<V;)(me||x<k)&&(ce[a[x]]=e[x]);for(;ue--;)ce[K++]=e[x++];return ce}function Ko(e,t,a,S){for(var x=-1,k=e.length,V=-1,K=a.length,Y=-1,ue=t.length,ce=xt(k-K,0),me=te(ce+ue),we=!S;++x<ce;)me[x]=e[x];for(var ke=x;++Y<ue;)me[ke+Y]=t[Y];for(;++V<K;)(we||x<k)&&(me[ke+a[V]]=e[x++]);return me}function Vt(e,t){var a=-1,S=e.length;for(t||(t=te(S));++a<S;)t[a]=e[a];return t}function mn(e,t,a,S){var x=!a;a||(a={});for(var k=-1,V=t.length;++k<V;){var K=t[k],Y=S?S(a[K],e[K],K,a,e):i;Y===i&&(Y=e[K]),x?bn(a,K,Y):mi(a,K,Y)}return a}function S0(e,t){return mn(e,ns(e),t)}function E0(e,t){return mn(e,sa(e),t)}function Ji(e,t){return function(a,S){var x=Ke(a)?xp:Wl,k=t?t():{};return x(a,e,Fe(S,2),k)}}function ni(e){return Je(function(t,a){var S=-1,x=a.length,k=x>1?a[x-1]:i,V=x>2?a[2]:i;for(k=e.length>3&&typeof k=="function"?(x--,k):i,V&&Ht(a[0],a[1],V)&&(k=x<3?i:k,x=1),t=ct(t);++S<x;){var K=a[S];K&&e(t,K,S,k)}return t})}function qo(e,t){return function(a,S){if(a==null)return a;if(!$t(a))return e(a,S);for(var x=a.length,k=t?x:-1,V=ct(a);(t?k--:++k<x)&&S(V[k],k,V)!==!1;);return a}}function zo(e){return function(t,a,S){for(var x=-1,k=ct(t),V=S(t),K=V.length;K--;){var Y=V[e?K:++x];if(a(k[Y],Y,k)===!1)break}return t}}function w0(e,t,a){var S=t&T,x=Ai(e);function k(){var V=this&&this!==Nt&&this instanceof k?x:e;return V.apply(S?a:this,arguments)}return k}function Yo(e){return function(t){t=at(t);var a=Jn(t)?pn(t):i,S=a?a[0]:t.charAt(0),x=a?kn(a,1).join(""):t.slice(1);return S[e]()+x}}function ii(e){return function(t){return Ar(qa(Ka(t).replace(hp,"")),e,"")}}function Ai(e){return function(){var t=arguments;switch(t.length){case 0:return new e;case 1:return new e(t[0]);case 2:return new e(t[0],t[1]);case 3:return new e(t[0],t[1],t[2]);case 4:return new e(t[0],t[1],t[2],t[3]);case 5:return new e(t[0],t[1],t[2],t[3],t[4]);case 6:return new e(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new e(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var a=ti(e.prototype),S=e.apply(a,t);return vt(S)?S:a}}function _0(e,t,a){var S=Ai(e);function x(){for(var k=arguments.length,V=te(k),K=k,Y=ri(x);K--;)V[K]=arguments[K];var ue=k<3&&V[0]!==Y&&V[k-1]!==Y?[]:Dn(V,Y);if(k-=ue.length,k<a)return ea(e,t,Xi,x.placeholder,i,V,ue,i,i,a-k);var ce=this&&this!==Nt&&this instanceof x?S:e;return qt(ce,this,V)}return x}function Jo(e){return function(t,a,S){var x=ct(t);if(!$t(t)){var k=Fe(a,3);t=Rt(t),a=function(K){return k(x[K],K,x)}}var V=e(t,a,S);return V>-1?x[k?t[V]:V]:i}}function Xo(e){return Tn(function(t){var a=t.length,S=a,x=nn.prototype.thru;for(e&&t.reverse();S--;){var k=t[S];if(typeof k!="function")throw new tn(c);if(x&&!V&&tr(k)=="wrapper")var V=new nn([],!0)}for(S=V?S:a;++S<a;){k=t[S];var K=tr(k),Y=K=="wrapper"?es(k):i;Y&&rs(Y[0])&&Y[1]==(C|E|N|D)&&!Y[4].length&&Y[9]==1?V=V[tr(Y[0])].apply(V,Y[3]):V=k.length==1&&rs(k)?V[K]():V.thru(k)}return function(){var ue=arguments,ce=ue[0];if(V&&ue.length==1&&Ke(ce))return V.plant(ce).value();for(var me=0,we=a?t[me].apply(this,ue):ce;++me<a;)we=t[me].call(this,we);return we}})}function Xi(e,t,a,S,x,k,V,K,Y,ue){var ce=t&C,me=t&T,we=t&_,ke=t&(E|I),He=t&P,Ye=we?i:Ai(e);function Ge(){for(var Xe=arguments.length,Qe=te(Xe),Xt=Xe;Xt--;)Qe[Xt]=arguments[Xt];if(ke)var Gt=ri(Ge),Zt=Bp(Qe,Gt);if(S&&(Qe=Wo(Qe,S,x,ke)),k&&(Qe=Ko(Qe,k,V,ke)),Xe-=Zt,ke&&Xe<ue){var _t=Dn(Qe,Gt);return ea(e,t,Xi,Ge.placeholder,a,Qe,_t,K,Y,ue-Xe)}var cn=me?a:this,_n=we?cn[e]:e;return Xe=Qe.length,K?Qe=W0(Qe,K):He&&Xe>1&&Qe.reverse(),ce&&Y<Xe&&(Qe.length=Y),this&&this!==Nt&&this instanceof Ge&&(_n=Ye||Ai(_n)),_n.apply(cn,Qe)}return Ge}function Zo(e,t){return function(a,S){return Ql(a,e,t(S),{})}}function Zi(e,t){return function(a,S){var x;if(a===i&&S===i)return t;if(a!==i&&(x=a),S!==i){if(x===i)return S;typeof a=="string"||typeof S=="string"?(a=Yt(a),S=Yt(S)):(a=Bo(a),S=Bo(S)),x=e(a,S)}return x}}function Jr(e){return Tn(function(t){return t=yt(t,zt(Fe())),Je(function(a){var S=this;return e(t,function(x){return qt(x,S,a)})})})}function Qi(e,t){t=t===i?" ":Yt(t);var a=t.length;if(a<2)return a?Vr(t,e):t;var S=Vr(t,ji(e/Xn(t)));return Jn(t)?kn(pn(S),0,e).join(""):S.slice(0,e)}function P0(e,t,a,S){var x=t&T,k=Ai(e);function V(){for(var K=-1,Y=arguments.length,ue=-1,ce=S.length,me=te(ce+Y),we=this&&this!==Nt&&this instanceof V?k:e;++ue<ce;)me[ue]=S[ue];for(;Y--;)me[ue++]=arguments[++K];return qt(we,x?a:this,me)}return V}function Qo(e){return function(t,a,S){return S&&typeof S!="number"&&Ht(t,a,S)&&(a=S=i),t=wn(t),a===i?(a=t,t=0):a=wn(a),S=S===i?t<a?1:-1:wn(S),c0(t,a,S,e)}}function er(e){return function(t,a){return typeof t=="string"&&typeof a=="string"||(t=an(t),a=an(a)),e(t,a)}}function ea(e,t,a,S,x,k,V,K,Y,ue){var ce=t&E,me=ce?V:i,we=ce?i:V,ke=ce?k:i,He=ce?i:k;t|=ce?N:B,t&=~(ce?B:N),t&A||(t&=~(T|_));var Ye=[e,t,x,ke,me,He,we,K,Y,ue],Ge=a.apply(i,Ye);return rs(e)&&fa(Ge,Ye),Ge.placeholder=S,da(Ge,e,t)}function Xr(e){var t=It[e];return function(a,S){if(a=an(a),S=S==null?0:Lt(ze(S),292),S&&fo(a)){var x=(at(a)+"e").split("e"),k=t(x[0]+"e"+(+x[1]+S));return x=(at(k)+"e").split("e"),+(x[0]+"e"+(+x[1]-S))}return t(a)}}var I0=Qn&&1/xi(new Qn([,-0]))[1]==W?function(e){return new Qn(e)}:bs;function ta(e){return function(t){var a=Ot(t);return a==Le?Ir(t):a==Pe?$p(t):Op(t,e(t))}}function An(e,t,a,S,x,k,V,K){var Y=t&_;if(!Y&&typeof e!="function")throw new tn(c);var ue=S?S.length:0;if(ue||(t&=~(N|B),S=x=i),V=V===i?V:xt(ze(V),0),K=K===i?K:ze(K),ue-=x?x.length:0,t&B){var ce=S,me=x;S=x=i}var we=Y?i:es(e),ke=[e,t,a,S,x,ce,me,k,V,K];if(we&&U0(ke,we),e=ke[0],t=ke[1],a=ke[2],S=ke[3],x=ke[4],K=ke[9]=ke[9]===i?Y?0:e.length:xt(ke[9]-ue,0),!K&&t&(E|I)&&(t&=~(E|I)),!t||t==T)var He=w0(e,t,a);else t==E||t==I?He=_0(e,t,K):(t==N||t==(T|N))&&!x.length?He=P0(e,t,a,S):He=Xi.apply(i,ke);var Ye=we?Lo:fa;return da(Ye(He,ke),e,t)}function na(e,t,a,S){return e===i||un(e,Zn[a])&&!ut.call(S,a)?t:e}function ia(e,t,a,S,x,k){return vt(e)&&vt(t)&&(k.set(t,e),qi(e,t,i,ia,k),k.delete(t)),e}function x0(e){return Ei(e)?i:e}function ra(e,t,a,S,x,k){var V=a&v,K=e.length,Y=t.length;if(K!=Y&&!(V&&Y>K))return!1;var ue=k.get(e),ce=k.get(t);if(ue&&ce)return ue==t&&ce==e;var me=-1,we=!0,ke=a&b?new Gn:i;for(k.set(e,t),k.set(t,e);++me<K;){var He=e[me],Ye=t[me];if(S)var Ge=V?S(Ye,He,me,t,e,k):S(He,Ye,me,e,t,k);if(Ge!==i){if(Ge)continue;we=!1;break}if(ke){if(!Tr(t,function(Xe,Qe){if(!li(ke,Qe)&&(He===Xe||x(He,Xe,a,S,k)))return ke.push(Qe)})){we=!1;break}}else if(!(He===Ye||x(He,Ye,a,S,k))){we=!1;break}}return k.delete(e),k.delete(t),we}function D0(e,t,a,S,x,k,V){switch(a){case Ue:if(e.byteLength!=t.byteLength||e.byteOffset!=t.byteOffset)return!1;e=e.buffer,t=t.buffer;case Ve:return!(e.byteLength!=t.byteLength||!k(new Li(e),new Li(t)));case bt:case At:case ht:return un(+e,+t);case fe:return e.name==t.name&&e.message==t.message;case Ce:case J:return e==t+"";case Le:var K=Ir;case Pe:var Y=S&v;if(K||(K=xi),e.size!=t.size&&!Y)return!1;var ue=V.get(e);if(ue)return ue==t;S|=b,V.set(e,t);var ce=ra(K(e),K(t),S,x,k,V);return V.delete(e),ce;case ve:if(hi)return hi.call(e)==hi.call(t)}return!1}function R0(e,t,a,S,x,k){var V=a&v,K=Zr(e),Y=K.length,ue=Zr(t),ce=ue.length;if(Y!=ce&&!V)return!1;for(var me=Y;me--;){var we=K[me];if(!(V?we in t:ut.call(t,we)))return!1}var ke=k.get(e),He=k.get(t);if(ke&&He)return ke==t&&He==e;var Ye=!0;k.set(e,t),k.set(t,e);for(var Ge=V;++me<Y;){we=K[me];var Xe=e[we],Qe=t[we];if(S)var Xt=V?S(Qe,Xe,we,t,e,k):S(Xe,Qe,we,e,t,k);if(!(Xt===i?Xe===Qe||x(Xe,Qe,a,S,k):Xt)){Ye=!1;break}Ge||(Ge=we=="constructor")}if(Ye&&!Ge){var Gt=e.constructor,Zt=t.constructor;Gt!=Zt&&"constructor"in e&&"constructor"in t&&!(typeof Gt=="function"&&Gt instanceof Gt&&typeof Zt=="function"&&Zt instanceof Zt)&&(Ye=!1)}return k.delete(e),k.delete(t),Ye}function Tn(e){return os(ua(e,i,ba),e+"")}function Zr(e){return wo(e,Rt,ns)}function Qr(e){return wo(e,Wt,sa)}var es=Gi?function(e){return Gi.get(e)}:bs;function tr(e){for(var t=e.name+"",a=ei[t],S=ut.call(ei,t)?a.length:0;S--;){var x=a[S],k=x.func;if(k==null||k==e)return x.name}return t}function ri(e){var t=ut.call(M,"placeholder")?M:e;return t.placeholder}function Fe(){var e=M.iteratee||ys;return e=e===ys?Io:e,arguments.length?e(arguments[0],arguments[1]):e}function nr(e,t){var a=e.__data__;return F0(t)?a[typeof t=="string"?"string":"hash"]:a.map}function ts(e){for(var t=Rt(e),a=t.length;a--;){var S=t[a],x=e[S];t[a]=[S,x,pa(x)]}return t}function $n(e,t){var a=Gp(e,t);return Po(a)?a:i}function C0(e){var t=ut.call(e,jn),a=e[jn];try{e[jn]=i;var S=!0}catch(k){}var x=Mi.call(e);return S&&(t?e[jn]=a:delete e[jn]),x}var ns=Dr?function(e){return e==null?[]:(e=ct(e),In(Dr(e),function(t){return uo.call(e,t)}))}:As,sa=Dr?function(e){for(var t=[];e;)xn(t,ns(e)),e=Oi(e);return t}:As,Ot=jt;(Rr&&Ot(new Rr(new ArrayBuffer(1)))!=Ue||ci&&Ot(new ci)!=Le||Cr&&Ot(Cr.resolve())!=Me||Qn&&Ot(new Qn)!=Pe||fi&&Ot(new fi)!=ye)&&(Ot=function(e){var t=jt(e),a=t==tt?e.constructor:i,S=a?Wn(a):"";if(S)switch(S){case dl:return Ue;case hl:return Le;case ml:return Me;case gl:return Pe;case yl:return ye}return t});function N0(e,t,a){for(var S=-1,x=a.length;++S<x;){var k=a[S],V=k.size;switch(k.type){case"drop":e+=V;break;case"dropRight":t-=V;break;case"take":t=Lt(t,e+V);break;case"takeRight":e=xt(e,t-V);break}}return{start:e,end:t}}function M0(e){var t=e.match(le);return t?t[1].split(pe):[]}function oa(e,t,a){t=Mn(t,e);for(var S=-1,x=t.length,k=!1;++S<x;){var V=gn(t[S]);if(!(k=e!=null&&a(e,V)))break;e=e[V]}return k||++S!=x?k:(x=e==null?0:e.length,!!x&&lr(x)&&Sn(V,x)&&(Ke(e)||Kn(e)))}function k0(e){var t=e.length,a=new e.constructor(t);return t&&typeof e[0]=="string"&&ut.call(e,"index")&&(a.index=e.index,a.input=e.input),a}function aa(e){return typeof e.constructor=="function"&&!Ti(e)?ti(Oi(e)):{}}function L0(e,t,a){var S=e.constructor;switch(t){case Ve:return Yr(e);case bt:case At:return new S(+e);case Ue:return v0(e,a);case qe:case et:case pt:case mt:case Bt:case kt:case Pt:case fn:case dn:return Vo(e,a);case Le:return new S;case ht:case J:return new S(e);case Ce:return b0(e);case Pe:return new S;case ve:return A0(e)}}function O0(e,t){var a=t.length;if(!a)return e;var S=a-1;return t[S]=(a>1?"& ":"")+t[S],t=t.join(a>2?", ":" "),e.replace(ie,`{
/* [wrapped with `+t+`] */
`)}function B0(e){return Ke(e)||Kn(e)||!!(co&&e&&e[co])}function Sn(e,t){var a=typeof e;return t=t==null?U:t,!!t&&(a=="number"||a!="symbol"&&fr.test(e))&&e>-1&&e%1==0&&e<t}function Ht(e,t,a){if(!vt(a))return!1;var S=typeof t;return(S=="number"?$t(a)&&Sn(t,a.length):S=="string"&&t in a)?un(a[t],e):!1}function is(e,t){if(Ke(e))return!1;var a=typeof e;return a=="number"||a=="symbol"||a=="boolean"||e==null||Jt(e)?!0:Ae.test(e)||!oe.test(e)||t!=null&&e in ct(t)}function F0(e){var t=typeof e;return t=="string"||t=="number"||t=="symbol"||t=="boolean"?e!=="__proto__":e===null}function rs(e){var t=tr(e),a=M[t];if(typeof a!="function"||!(t in Ze.prototype))return!1;if(e===a)return!0;var S=es(a);return!!S&&e===S[0]}function j0(e){return!!ao&&ao in e}var H0=Ci?En:Ts;function Ti(e){var t=e&&e.constructor,a=typeof t=="function"&&t.prototype||Zn;return e===a}function pa(e){return e===e&&!vt(e)}function la(e,t){return function(a){return a==null?!1:a[e]===t&&(t!==i||e in ct(a))}}function G0(e){var t=ar(e,function(S){return a.size===y&&a.clear(),S}),a=t.cache;return t}function U0(e,t){var a=e[1],S=t[1],x=a|S,k=x<(T|_|C),V=S==C&&a==E||S==C&&a==D&&e[7].length<=t[8]||S==(C|D)&&t[7].length<=t[8]&&a==E;if(!(k||V))return e;S&T&&(e[2]=t[2],x|=a&T?0:A);var K=t[3];if(K){var Y=e[3];e[3]=Y?Wo(Y,K,t[4]):K,e[4]=Y?Dn(e[3],s):t[4]}return K=t[5],K&&(Y=e[5],e[5]=Y?Ko(Y,K,t[6]):K,e[6]=Y?Dn(e[5],s):t[6]),K=t[7],K&&(e[7]=K),S&C&&(e[8]=e[8]==null?t[8]:Lt(e[8],t[8])),e[9]==null&&(e[9]=t[9]),e[0]=t[0],e[1]=x,e}function V0(e){var t=[];if(e!=null)for(var a in ct(e))t.push(a);return t}function $0(e){return Mi.call(e)}function ua(e,t,a){return t=xt(t===i?e.length-1:t,0),function(){for(var S=arguments,x=-1,k=xt(S.length-t,0),V=te(k);++x<k;)V[x]=S[t+x];x=-1;for(var K=te(t+1);++x<t;)K[x]=S[x];return K[t]=a(V),qt(e,this,K)}}function ca(e,t){return t.length<2?e:Vn(e,sn(t,0,-1))}function W0(e,t){for(var a=e.length,S=Lt(t.length,a),x=Vt(e);S--;){var k=t[S];e[S]=Sn(k,a)?x[k]:i}return e}function ss(e,t){if(!(t==="constructor"&&typeof e[t]=="function")&&t!="__proto__")return e[t]}var fa=ha(Lo),Si=ol||function(e,t){return Nt.setTimeout(e,t)},os=ha(h0);function da(e,t,a){var S=t+"";return os(e,O0(S,K0(M0(S),a)))}function ha(e){var t=0,a=0;return function(){var S=ul(),x=$-(S-a);if(a=S,x>0){if(++t>=H)return arguments[0]}else t=0;return e.apply(i,arguments)}}function ir(e,t){var a=-1,S=e.length,x=S-1;for(t=t===i?S:t;++a<t;){var k=Ur(a,x),V=e[k];e[k]=e[a],e[a]=V}return e.length=t,e}var ma=G0(function(e){var t=[];return e.charCodeAt(0)===46&&t.push(""),e.replace(Se,function(a,S,x,k){t.push(x?k.replace(Ne,"$1"):S||a)}),t});function gn(e){if(typeof e=="string"||Jt(e))return e;var t=e+"";return t=="0"&&1/e==-W?"-0":t}function Wn(e){if(e!=null){try{return Ni.call(e)}catch(t){}try{return e+""}catch(t){}}return""}function K0(e,t){return en(be,function(a){var S="_."+a[0];t&a[1]&&!Pi(e,S)&&e.push(S)}),e.sort()}function ga(e){if(e instanceof Ze)return e.clone();var t=new nn(e.__wrapped__,e.__chain__);return t.__actions__=Vt(e.__actions__),t.__index__=e.__index__,t.__values__=e.__values__,t}function q0(e,t,a){(a?Ht(e,t,a):t===i)?t=1:t=xt(ze(t),0);var S=e==null?0:e.length;if(!S||t<1)return[];for(var x=0,k=0,V=te(ji(S/t));x<S;)V[k++]=sn(e,x,x+=t);return V}function z0(e){for(var t=-1,a=e==null?0:e.length,S=0,x=[];++t<a;){var k=e[t];k&&(x[S++]=k)}return x}function Y0(){var e=arguments.length;if(!e)return[];for(var t=te(e-1),a=arguments[0],S=e;S--;)t[S-1]=arguments[S];return xn(Ke(a)?Vt(a):[a],Mt(t,1))}var J0=Je(function(e,t){return wt(e)?gi(e,Mt(t,1,wt,!0)):[]}),X0=Je(function(e,t){var a=on(t);return wt(a)&&(a=i),wt(e)?gi(e,Mt(t,1,wt,!0),Fe(a,2)):[]}),Z0=Je(function(e,t){var a=on(t);return wt(a)&&(a=i),wt(e)?gi(e,Mt(t,1,wt,!0),i,a):[]});function Q0(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:ze(t),sn(e,t<0?0:t,S)):[]}function eu(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:ze(t),t=S-t,sn(e,0,t<0?0:t)):[]}function tu(e,t){return e&&e.length?Yi(e,Fe(t,3),!0,!0):[]}function nu(e,t){return e&&e.length?Yi(e,Fe(t,3),!0):[]}function iu(e,t,a,S){var x=e==null?0:e.length;return x?(a&&typeof a!="number"&&Ht(e,t,a)&&(a=0,S=x),Yl(e,t,a,S)):[]}function ya(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=a==null?0:ze(a);return x<0&&(x=xt(S+x,0)),Ii(e,Fe(t,3),x)}function va(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=S-1;return a!==i&&(x=ze(a),x=a<0?xt(S+x,0):Lt(x,S-1)),Ii(e,Fe(t,3),x,!0)}function ba(e){var t=e==null?0:e.length;return t?Mt(e,1):[]}function ru(e){var t=e==null?0:e.length;return t?Mt(e,W):[]}function su(e,t){var a=e==null?0:e.length;return a?(t=t===i?1:ze(t),Mt(e,t)):[]}function ou(e){for(var t=-1,a=e==null?0:e.length,S={};++t<a;){var x=e[t];S[x[0]]=x[1]}return S}function Aa(e){return e&&e.length?e[0]:i}function au(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=a==null?0:ze(a);return x<0&&(x=xt(S+x,0)),Yn(e,t,x)}function pu(e){var t=e==null?0:e.length;return t?sn(e,0,-1):[]}var lu=Je(function(e){var t=yt(e,qr);return t.length&&t[0]===e[0]?Br(t):[]}),uu=Je(function(e){var t=on(e),a=yt(e,qr);return t===on(a)?t=i:a.pop(),a.length&&a[0]===e[0]?Br(a,Fe(t,2)):[]}),cu=Je(function(e){var t=on(e),a=yt(e,qr);return t=typeof t=="function"?t:i,t&&a.pop(),a.length&&a[0]===e[0]?Br(a,i,t):[]});function fu(e,t){return e==null?"":pl.call(e,t)}function on(e){var t=e==null?0:e.length;return t?e[t-1]:i}function du(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=S;return a!==i&&(x=ze(a),x=x<0?xt(S+x,0):Lt(x,S-1)),t===t?Kp(e,t,x):Ii(e,Qs,x,!0)}function hu(e,t){return e&&e.length?Co(e,ze(t)):i}var mu=Je(Ta);function Ta(e,t){return e&&e.length&&t&&t.length?Gr(e,t):e}function gu(e,t,a){return e&&e.length&&t&&t.length?Gr(e,t,Fe(a,2)):e}function yu(e,t,a){return e&&e.length&&t&&t.length?Gr(e,t,i,a):e}var vu=Tn(function(e,t){var a=e==null?0:e.length,S=Mr(e,t);return ko(e,yt(t,function(x){return Sn(x,a)?+x:x}).sort($o)),S});function bu(e,t){var a=[];if(!(e&&e.length))return a;var S=-1,x=[],k=e.length;for(t=Fe(t,3);++S<k;){var V=e[S];t(V,S,e)&&(a.push(V),x.push(S))}return ko(e,x),a}function as(e){return e==null?e:fl.call(e)}function Au(e,t,a){var S=e==null?0:e.length;return S?(a&&typeof a!="number"&&Ht(e,t,a)?(t=0,a=S):(t=t==null?0:ze(t),a=a===i?S:ze(a)),sn(e,t,a)):[]}function Tu(e,t){return zi(e,t)}function Su(e,t,a){return $r(e,t,Fe(a,2))}function Eu(e,t){var a=e==null?0:e.length;if(a){var S=zi(e,t);if(S<a&&un(e[S],t))return S}return-1}function wu(e,t){return zi(e,t,!0)}function _u(e,t,a){return $r(e,t,Fe(a,2),!0)}function Pu(e,t){var a=e==null?0:e.length;if(a){var S=zi(e,t,!0)-1;if(un(e[S],t))return S}return-1}function Iu(e){return e&&e.length?Oo(e):[]}function xu(e,t){return e&&e.length?Oo(e,Fe(t,2)):[]}function Du(e){var t=e==null?0:e.length;return t?sn(e,1,t):[]}function Ru(e,t,a){return e&&e.length?(t=a||t===i?1:ze(t),sn(e,0,t<0?0:t)):[]}function Cu(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:ze(t),t=S-t,sn(e,t<0?0:t,S)):[]}function Nu(e,t){return e&&e.length?Yi(e,Fe(t,3),!1,!0):[]}function Mu(e,t){return e&&e.length?Yi(e,Fe(t,3)):[]}var ku=Je(function(e){return Nn(Mt(e,1,wt,!0))}),Lu=Je(function(e){var t=on(e);return wt(t)&&(t=i),Nn(Mt(e,1,wt,!0),Fe(t,2))}),Ou=Je(function(e){var t=on(e);return t=typeof t=="function"?t:i,Nn(Mt(e,1,wt,!0),i,t)});function Bu(e){return e&&e.length?Nn(e):[]}function Fu(e,t){return e&&e.length?Nn(e,Fe(t,2)):[]}function ju(e,t){return t=typeof t=="function"?t:i,e&&e.length?Nn(e,i,t):[]}function ps(e){if(!(e&&e.length))return[];var t=0;return e=In(e,function(a){if(wt(a))return t=xt(a.length,t),!0}),_r(t,function(a){return yt(e,Sr(a))})}function Sa(e,t){if(!(e&&e.length))return[];var a=ps(e);return t==null?a:yt(a,function(S){return qt(t,i,S)})}var Hu=Je(function(e,t){return wt(e)?gi(e,t):[]}),Gu=Je(function(e){return Kr(In(e,wt))}),Uu=Je(function(e){var t=on(e);return wt(t)&&(t=i),Kr(In(e,wt),Fe(t,2))}),Vu=Je(function(e){var t=on(e);return t=typeof t=="function"?t:i,Kr(In(e,wt),i,t)}),$u=Je(ps);function Wu(e,t){return Ho(e||[],t||[],mi)}function Ku(e,t){return Ho(e||[],t||[],bi)}var qu=Je(function(e){var t=e.length,a=t>1?e[t-1]:i;return a=typeof a=="function"?(e.pop(),a):i,Sa(e,a)});function Ea(e){var t=M(e);return t.__chain__=!0,t}function zu(e,t){return t(e),e}function rr(e,t){return t(e)}var Yu=Tn(function(e){var t=e.length,a=t?e[0]:0,S=this.__wrapped__,x=function(k){return Mr(k,e)};return t>1||this.__actions__.length||!(S instanceof Ze)||!Sn(a)?this.thru(x):(S=S.slice(a,+a+(t?1:0)),S.__actions__.push({func:rr,args:[x],thisArg:i}),new nn(S,this.__chain__).thru(function(k){return t&&!k.length&&k.push(i),k}))});function Ju(){return Ea(this)}function Xu(){return new nn(this.value(),this.__chain__)}function Zu(){this.__values__===i&&(this.__values__=Ba(this.value()));var e=this.__index__>=this.__values__.length,t=e?i:this.__values__[this.__index__++];return{done:e,value:t}}function Qu(){return this}function ec(e){for(var t,a=this;a instanceof Vi;){var S=ga(a);S.__index__=0,S.__values__=i,t?x.__wrapped__=S:t=S;var x=S;a=a.__wrapped__}return x.__wrapped__=e,t}function tc(){var e=this.__wrapped__;if(e instanceof Ze){var t=e;return this.__actions__.length&&(t=new Ze(this)),t=t.reverse(),t.__actions__.push({func:rr,args:[as],thisArg:i}),new nn(t,this.__chain__)}return this.thru(as)}function nc(){return jo(this.__wrapped__,this.__actions__)}var ic=Ji(function(e,t,a){ut.call(e,a)?++e[a]:bn(e,a,1)});function rc(e,t,a){var S=Ke(e)?Xs:zl;return a&&Ht(e,t,a)&&(t=i),S(e,Fe(t,3))}function sc(e,t){var a=Ke(e)?In:So;return a(e,Fe(t,3))}var oc=Jo(ya),ac=Jo(va);function pc(e,t){return Mt(sr(e,t),1)}function lc(e,t){return Mt(sr(e,t),W)}function uc(e,t,a){return a=a===i?1:ze(a),Mt(sr(e,t),a)}function wa(e,t){var a=Ke(e)?en:Cn;return a(e,Fe(t,3))}function _a(e,t){var a=Ke(e)?Dp:To;return a(e,Fe(t,3))}var cc=Ji(function(e,t,a){ut.call(e,a)?e[a].push(t):bn(e,a,[t])});function fc(e,t,a,S){e=$t(e)?e:oi(e),a=a&&!S?ze(a):0;var x=e.length;return a<0&&(a=xt(x+a,0)),ur(e)?a<=x&&e.indexOf(t,a)>-1:!!x&&Yn(e,t,a)>-1}var dc=Je(function(e,t,a){var S=-1,x=typeof t=="function",k=$t(e)?te(e.length):[];return Cn(e,function(V){k[++S]=x?qt(t,V,a):yi(V,t,a)}),k}),hc=Ji(function(e,t,a){bn(e,a,t)});function sr(e,t){var a=Ke(e)?yt:xo;return a(e,Fe(t,3))}function mc(e,t,a,S){return e==null?[]:(Ke(t)||(t=t==null?[]:[t]),a=S?i:a,Ke(a)||(a=a==null?[]:[a]),No(e,t,a))}var gc=Ji(function(e,t,a){e[a?0:1].push(t)},function(){return[[],[]]});function yc(e,t,a){var S=Ke(e)?Ar:to,x=arguments.length<3;return S(e,Fe(t,4),a,x,Cn)}function vc(e,t,a){var S=Ke(e)?Rp:to,x=arguments.length<3;return S(e,Fe(t,4),a,x,To)}function bc(e,t){var a=Ke(e)?In:So;return a(e,pr(Fe(t,3)))}function Ac(e){var t=Ke(e)?yo:f0;return t(e)}function Tc(e,t,a){(a?Ht(e,t,a):t===i)?t=1:t=ze(t);var S=Ke(e)?Vl:d0;return S(e,t)}function Sc(e){var t=Ke(e)?$l:m0;return t(e)}function Ec(e){if(e==null)return 0;if($t(e))return ur(e)?Xn(e):e.length;var t=Ot(e);return t==Le||t==Pe?e.size:jr(e).length}function wc(e,t,a){var S=Ke(e)?Tr:g0;return a&&Ht(e,t,a)&&(t=i),S(e,Fe(t,3))}var _c=Je(function(e,t){if(e==null)return[];var a=t.length;return a>1&&Ht(e,t[0],t[1])?t=[]:a>2&&Ht(t[0],t[1],t[2])&&(t=[t[0]]),No(e,Mt(t,1),[])}),or=sl||function(){return Nt.Date.now()};function Pc(e,t){if(typeof t!="function")throw new tn(c);return e=ze(e),function(){if(--e<1)return t.apply(this,arguments)}}function Pa(e,t,a){return t=a?i:t,t=e&&t==null?e.length:t,An(e,C,i,i,i,i,t)}function Ia(e,t){var a;if(typeof t!="function")throw new tn(c);return e=ze(e),function(){return--e>0&&(a=t.apply(this,arguments)),e<=1&&(t=i),a}}var ls=Je(function(e,t,a){var S=T;if(a.length){var x=Dn(a,ri(ls));S|=N}return An(e,S,t,a,x)}),xa=Je(function(e,t,a){var S=T|_;if(a.length){var x=Dn(a,ri(xa));S|=N}return An(t,S,e,a,x)});function Da(e,t,a){t=a?i:t;var S=An(e,E,i,i,i,i,i,t);return S.placeholder=Da.placeholder,S}function Ra(e,t,a){t=a?i:t;var S=An(e,I,i,i,i,i,i,t);return S.placeholder=Ra.placeholder,S}function Ca(e,t,a){var S,x,k,V,K,Y,ue=0,ce=!1,me=!1,we=!0;if(typeof e!="function")throw new tn(c);t=an(t)||0,vt(a)&&(ce=!!a.leading,me="maxWait"in a,k=me?xt(an(a.maxWait)||0,t):k,we="trailing"in a?!!a.trailing:we);function ke(_t){var cn=S,_n=x;return S=x=i,ue=_t,V=e.apply(_n,cn),V}function He(_t){return ue=_t,K=Si(Xe,t),ce?ke(_t):V}function Ye(_t){var cn=_t-Y,_n=_t-ue,Ja=t-cn;return me?Lt(Ja,k-_n):Ja}function Ge(_t){var cn=_t-Y,_n=_t-ue;return Y===i||cn>=t||cn<0||me&&_n>=k}function Xe(){var _t=or();if(Ge(_t))return Qe(_t);K=Si(Xe,Ye(_t))}function Qe(_t){return K=i,we&&S?ke(_t):(S=x=i,V)}function Xt(){K!==i&&Go(K),ue=0,S=Y=x=K=i}function Gt(){return K===i?V:Qe(or())}function Zt(){var _t=or(),cn=Ge(_t);if(S=arguments,x=this,Y=_t,cn){if(K===i)return He(Y);if(me)return Go(K),K=Si(Xe,t),ke(Y)}return K===i&&(K=Si(Xe,t)),V}return Zt.cancel=Xt,Zt.flush=Gt,Zt}var Ic=Je(function(e,t){return Ao(e,1,t)}),xc=Je(function(e,t,a){return Ao(e,an(t)||0,a)});function Dc(e){return An(e,P)}function ar(e,t){if(typeof e!="function"||t!=null&&typeof t!="function")throw new tn(c);var a=function(){var S=arguments,x=t?t.apply(this,S):S[0],k=a.cache;if(k.has(x))return k.get(x);var V=e.apply(this,S);return a.cache=k.set(x,V)||k,V};return a.cache=new(ar.Cache||vn),a}ar.Cache=vn;function pr(e){if(typeof e!="function")throw new tn(c);return function(){var t=arguments;switch(t.length){case 0:return!e.call(this);case 1:return!e.call(this,t[0]);case 2:return!e.call(this,t[0],t[1]);case 3:return!e.call(this,t[0],t[1],t[2])}return!e.apply(this,t)}}function Rc(e){return Ia(2,e)}var Cc=y0(function(e,t){t=t.length==1&&Ke(t[0])?yt(t[0],zt(Fe())):yt(Mt(t,1),zt(Fe()));var a=t.length;return Je(function(S){for(var x=-1,k=Lt(S.length,a);++x<k;)S[x]=t[x].call(this,S[x]);return qt(e,this,S)})}),us=Je(function(e,t){var a=Dn(t,ri(us));return An(e,N,i,t,a)}),Na=Je(function(e,t){var a=Dn(t,ri(Na));return An(e,B,i,t,a)}),Nc=Tn(function(e,t){return An(e,D,i,i,i,t)});function Mc(e,t){if(typeof e!="function")throw new tn(c);return t=t===i?t:ze(t),Je(e,t)}function kc(e,t){if(typeof e!="function")throw new tn(c);return t=t==null?0:xt(ze(t),0),Je(function(a){var S=a[t],x=kn(a,0,t);return S&&xn(x,S),qt(e,this,x)})}function Lc(e,t,a){var S=!0,x=!0;if(typeof e!="function")throw new tn(c);return vt(a)&&(S="leading"in a?!!a.leading:S,x="trailing"in a?!!a.trailing:x),Ca(e,t,{leading:S,maxWait:t,trailing:x})}function Oc(e){return Pa(e,1)}function Bc(e,t){return us(zr(t),e)}function Fc(){if(!arguments.length)return[];var e=arguments[0];return Ke(e)?e:[e]}function jc(e){return rn(e,d)}function Hc(e,t){return t=typeof t=="function"?t:i,rn(e,d,t)}function Gc(e){return rn(e,g|d)}function Uc(e,t){return t=typeof t=="function"?t:i,rn(e,g|d,t)}function Vc(e,t){return t==null||bo(e,t,Rt(t))}function un(e,t){return e===t||e!==e&&t!==t}var $c=er(Or),Wc=er(function(e,t){return e>=t}),Kn=_o(function(){return arguments}())?_o:function(e){return Et(e)&&ut.call(e,"callee")&&!uo.call(e,"callee")},Ke=te.isArray,Kc=Ws?zt(Ws):e0;function $t(e){return e!=null&&lr(e.length)&&!En(e)}function wt(e){return Et(e)&&$t(e)}function qc(e){return e===!0||e===!1||Et(e)&&jt(e)==bt}var Ln=al||Ts,zc=Ks?zt(Ks):t0;function Yc(e){return Et(e)&&e.nodeType===1&&!Ei(e)}function Jc(e){if(e==null)return!0;if($t(e)&&(Ke(e)||typeof e=="string"||typeof e.splice=="function"||Ln(e)||si(e)||Kn(e)))return!e.length;var t=Ot(e);if(t==Le||t==Pe)return!e.size;if(Ti(e))return!jr(e).length;for(var a in e)if(ut.call(e,a))return!1;return!0}function Xc(e,t){return vi(e,t)}function Zc(e,t,a){a=typeof a=="function"?a:i;var S=a?a(e,t):i;return S===i?vi(e,t,i,a):!!S}function cs(e){if(!Et(e))return!1;var t=jt(e);return t==fe||t==Dt||typeof e.message=="string"&&typeof e.name=="string"&&!Ei(e)}function Qc(e){return typeof e=="number"&&fo(e)}function En(e){if(!vt(e))return!1;var t=jt(e);return t==xe||t==Te||t==st||t==de}function Ma(e){return typeof e=="number"&&e==ze(e)}function lr(e){return typeof e=="number"&&e>-1&&e%1==0&&e<=U}function vt(e){var t=typeof e;return e!=null&&(t=="object"||t=="function")}function Et(e){return e!=null&&typeof e=="object"}var ka=qs?zt(qs):i0;function ef(e,t){return e===t||Fr(e,t,ts(t))}function tf(e,t,a){return a=typeof a=="function"?a:i,Fr(e,t,ts(t),a)}function nf(e){return La(e)&&e!=+e}function rf(e){if(H0(e))throw new We(f);return Po(e)}function sf(e){return e===null}function of(e){return e==null}function La(e){return typeof e=="number"||Et(e)&&jt(e)==ht}function Ei(e){if(!Et(e)||jt(e)!=tt)return!1;var t=Oi(e);if(t===null)return!0;var a=ut.call(t,"constructor")&&t.constructor;return typeof a=="function"&&a instanceof a&&Ni.call(a)==tl}var fs=zs?zt(zs):r0;function af(e){return Ma(e)&&e>=-U&&e<=U}var Oa=Ys?zt(Ys):s0;function ur(e){return typeof e=="string"||!Ke(e)&&Et(e)&&jt(e)==J}function Jt(e){return typeof e=="symbol"||Et(e)&&jt(e)==ve}var si=Js?zt(Js):o0;function pf(e){return e===i}function lf(e){return Et(e)&&Ot(e)==ye}function uf(e){return Et(e)&&jt(e)==Oe}var cf=er(Hr),ff=er(function(e,t){return e<=t});function Ba(e){if(!e)return[];if($t(e))return ur(e)?pn(e):Vt(e);if(ui&&e[ui])return Vp(e[ui]());var t=Ot(e),a=t==Le?Ir:t==Pe?xi:oi;return a(e)}function wn(e){if(!e)return e===0?e:0;if(e=an(e),e===W||e===-W){var t=e<0?-1:1;return t*Q}return e===e?e:0}function ze(e){var t=wn(e),a=t%1;return t===t?a?t-a:t:0}function Fa(e){return e?Un(ze(e),0,se):0}function an(e){if(typeof e=="number")return e;if(Jt(e))return ne;if(vt(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=vt(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=no(e);var a=gt.test(e);return a||nt.test(e)?Pp(e.slice(2),a?2:8):Ct.test(e)?ne:+e}function ja(e){return mn(e,Wt(e))}function df(e){return e?Un(ze(e),-U,U):e===0?e:0}function at(e){return e==null?"":Yt(e)}var hf=ni(function(e,t){if(Ti(t)||$t(t)){mn(t,Rt(t),e);return}for(var a in t)ut.call(t,a)&&mi(e,a,t[a])}),Ha=ni(function(e,t){mn(t,Wt(t),e)}),cr=ni(function(e,t,a,S){mn(t,Wt(t),e,S)}),mf=ni(function(e,t,a,S){mn(t,Rt(t),e,S)}),gf=Tn(Mr);function yf(e,t){var a=ti(e);return t==null?a:vo(a,t)}var vf=Je(function(e,t){e=ct(e);var a=-1,S=t.length,x=S>2?t[2]:i;for(x&&Ht(t[0],t[1],x)&&(S=1);++a<S;)for(var k=t[a],V=Wt(k),K=-1,Y=V.length;++K<Y;){var ue=V[K],ce=e[ue];(ce===i||un(ce,Zn[ue])&&!ut.call(e,ue))&&(e[ue]=k[ue])}return e}),bf=Je(function(e){return e.push(i,ia),qt(Ga,i,e)});function Af(e,t){return Zs(e,Fe(t,3),hn)}function Tf(e,t){return Zs(e,Fe(t,3),Lr)}function Sf(e,t){return e==null?e:kr(e,Fe(t,3),Wt)}function Ef(e,t){return e==null?e:Eo(e,Fe(t,3),Wt)}function wf(e,t){return e&&hn(e,Fe(t,3))}function _f(e,t){return e&&Lr(e,Fe(t,3))}function Pf(e){return e==null?[]:Ki(e,Rt(e))}function If(e){return e==null?[]:Ki(e,Wt(e))}function ds(e,t,a){var S=e==null?i:Vn(e,t);return S===i?a:S}function xf(e,t){return e!=null&&oa(e,t,Jl)}function hs(e,t){return e!=null&&oa(e,t,Xl)}var Df=Zo(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Mi.call(t)),e[t]=a},gs(Kt)),Rf=Zo(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Mi.call(t)),ut.call(e,t)?e[t].push(a):e[t]=[a]},Fe),Cf=Je(yi);function Rt(e){return $t(e)?go(e):jr(e)}function Wt(e){return $t(e)?go(e,!0):a0(e)}function Nf(e,t){var a={};return t=Fe(t,3),hn(e,function(S,x,k){bn(a,t(S,x,k),S)}),a}function Mf(e,t){var a={};return t=Fe(t,3),hn(e,function(S,x,k){bn(a,x,t(S,x,k))}),a}var kf=ni(function(e,t,a){qi(e,t,a)}),Ga=ni(function(e,t,a,S){qi(e,t,a,S)}),Lf=Tn(function(e,t){var a={};if(e==null)return a;var S=!1;t=yt(t,function(k){return k=Mn(k,e),S||(S=k.length>1),k}),mn(e,Qr(e),a),S&&(a=rn(a,g|u|d,x0));for(var x=t.length;x--;)Wr(a,t[x]);return a});function Of(e,t){return Ua(e,pr(Fe(t)))}var Bf=Tn(function(e,t){return e==null?{}:l0(e,t)});function Ua(e,t){if(e==null)return{};var a=yt(Qr(e),function(S){return[S]});return t=Fe(t),Mo(e,a,function(S,x){return t(S,x[0])})}function Ff(e,t,a){t=Mn(t,e);var S=-1,x=t.length;for(x||(x=1,e=i);++S<x;){var k=e==null?i:e[gn(t[S])];k===i&&(S=x,k=a),e=En(k)?k.call(e):k}return e}function jf(e,t,a){return e==null?e:bi(e,t,a)}function Hf(e,t,a,S){return S=typeof S=="function"?S:i,e==null?e:bi(e,t,a,S)}var Va=ta(Rt),$a=ta(Wt);function Gf(e,t,a){var S=Ke(e),x=S||Ln(e)||si(e);if(t=Fe(t,4),a==null){var k=e&&e.constructor;x?a=S?new k:[]:vt(e)?a=En(k)?ti(Oi(e)):{}:a={}}return(x?en:hn)(e,function(V,K,Y){return t(a,V,K,Y)}),a}function Uf(e,t){return e==null?!0:Wr(e,t)}function Vf(e,t,a){return e==null?e:Fo(e,t,zr(a))}function $f(e,t,a,S){return S=typeof S=="function"?S:i,e==null?e:Fo(e,t,zr(a),S)}function oi(e){return e==null?[]:Pr(e,Rt(e))}function Wf(e){return e==null?[]:Pr(e,Wt(e))}function Kf(e,t,a){return a===i&&(a=t,t=i),a!==i&&(a=an(a),a=a===a?a:0),t!==i&&(t=an(t),t=t===t?t:0),Un(an(e),t,a)}function qf(e,t,a){return t=wn(t),a===i?(a=t,t=0):a=wn(a),e=an(e),Zl(e,t,a)}function zf(e,t,a){if(a&&typeof a!="boolean"&&Ht(e,t,a)&&(t=a=i),a===i&&(typeof t=="boolean"?(a=t,t=i):typeof e=="boolean"&&(a=e,e=i)),e===i&&t===i?(e=0,t=1):(e=wn(e),t===i?(t=e,e=0):t=wn(t)),e>t){var S=e;e=t,t=S}if(a||e%1||t%1){var x=ho();return Lt(e+x*(t-e+_p("1e-"+((x+"").length-1))),t)}return Ur(e,t)}var Yf=ii(function(e,t,a){return t=t.toLowerCase(),e+(a?Wa(t):t)});function Wa(e){return ms(at(e).toLowerCase())}function Ka(e){return e=at(e),e&&e.replace(Es,Fp).replace(mp,"")}function Jf(e,t,a){e=at(e),t=Yt(t);var S=e.length;a=a===i?S:Un(ze(a),0,S);var x=a;return a-=t.length,a>=0&&e.slice(a,x)==t}function Xf(e){return e=at(e),e&&F.test(e)?e.replace(Tt,jp):e}function Zf(e){return e=at(e),e&&Ee.test(e)?e.replace(Re,"\\$&"):e}var Qf=ii(function(e,t,a){return e+(a?"-":"")+t.toLowerCase()}),ed=ii(function(e,t,a){return e+(a?" ":"")+t.toLowerCase()}),td=Yo("toLowerCase");function nd(e,t,a){e=at(e),t=ze(t);var S=t?Xn(e):0;if(!t||S>=t)return e;var x=(t-S)/2;return Qi(Hi(x),a)+e+Qi(ji(x),a)}function id(e,t,a){e=at(e),t=ze(t);var S=t?Xn(e):0;return t&&S<t?e+Qi(t-S,a):e}function rd(e,t,a){e=at(e),t=ze(t);var S=t?Xn(e):0;return t&&S<t?Qi(t-S,a)+e:e}function sd(e,t,a){return a||t==null?t=0:t&&(t=+t),cl(at(e).replace($e,""),t||0)}function od(e,t,a){return(a?Ht(e,t,a):t===i)?t=1:t=ze(t),Vr(at(e),t)}function ad(){var e=arguments,t=at(e[0]);return e.length<3?t:t.replace(e[1],e[2])}var pd=ii(function(e,t,a){return e+(a?"_":"")+t.toLowerCase()});function ld(e,t,a){return a&&typeof a!="number"&&Ht(e,t,a)&&(t=a=i),a=a===i?se:a>>>0,a?(e=at(e),e&&(typeof t=="string"||t!=null&&!fs(t))&&(t=Yt(t),!t&&Jn(e))?kn(pn(e),0,a):e.split(t,a)):[]}var ud=ii(function(e,t,a){return e+(a?" ":"")+ms(t)});function cd(e,t,a){return e=at(e),a=a==null?0:Un(ze(a),0,e.length),t=Yt(t),e.slice(a,a+t.length)==t}function fd(e,t,a){var S=M.templateSettings;a&&Ht(e,t,a)&&(t=i),e=at(e),t=cr({},t,S,na);var x=cr({},t.imports,S.imports,na),k=Rt(x),V=Pr(x,k),K,Y,ue=0,ce=t.interpolate||ai,me="__p += '",we=xr((t.escape||ai).source+"|"+ce.source+"|"+(ce===ee?lt:ai).source+"|"+(t.evaluate||ai).source+"|$","g"),ke="//# sourceURL="+(ut.call(t,"sourceURL")?(t.sourceURL+"").replace(/\s/g," "):"lodash.templateSources["+ ++Ap+"]")+`
`;e.replace(we,function(Ge,Xe,Qe,Xt,Gt,Zt){return Qe||(Qe=Xt),me+=e.slice(ue,Zt).replace(qn,Hp),Xe&&(K=!0,me+=`' +
__e(`+Xe+`) +
'`),Gt&&(Y=!0,me+=`';
`+Gt+`;
__p += '`),Qe&&(me+=`' +
((__t = (`+Qe+`)) == null ? '' : __t) +
'`),ue=Zt+Ge.length,Ge}),me+=`';
`;var He=ut.call(t,"variable")&&t.variable;if(!He)me=`with (obj) {
`+me+`
}
`;else if(je.test(He))throw new We(o);me=(Y?me.replace(Pn,""):me).replace(On,"$1").replace(Ft,"$1;"),me="function("+(He||"obj")+`) {
`+(He?"":`obj || (obj = {});
`)+"var __t, __p = ''"+(K?", __e = _.escape":"")+(Y?`, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
`:`;
`)+me+`return __p
}`;var Ye=za(function(){return rt(k,ke+"return "+me).apply(i,V)});if(Ye.source=me,cs(Ye))throw Ye;return Ye}function dd(e){return at(e).toLowerCase()}function hd(e){return at(e).toUpperCase()}function md(e,t,a){if(e=at(e),e&&(a||t===i))return no(e);if(!e||!(t=Yt(t)))return e;var S=pn(e),x=pn(t),k=io(S,x),V=ro(S,x)+1;return kn(S,k,V).join("")}function gd(e,t,a){if(e=at(e),e&&(a||t===i))return e.slice(0,oo(e)+1);if(!e||!(t=Yt(t)))return e;var S=pn(e),x=ro(S,pn(t))+1;return kn(S,0,x).join("")}function yd(e,t,a){if(e=at(e),e&&(a||t===i))return e.replace($e,"");if(!e||!(t=Yt(t)))return e;var S=pn(e),x=io(S,pn(t));return kn(S,x).join("")}function vd(e,t){var a=R,S=O;if(vt(t)){var x="separator"in t?t.separator:x;a="length"in t?ze(t.length):a,S="omission"in t?Yt(t.omission):S}e=at(e);var k=e.length;if(Jn(e)){var V=pn(e);k=V.length}if(a>=k)return e;var K=a-Xn(S);if(K<1)return S;var Y=V?kn(V,0,K).join(""):e.slice(0,K);if(x===i)return Y+S;if(V&&(K+=Y.length-K),fs(x)){if(e.slice(K).search(x)){var ue,ce=Y;for(x.global||(x=xr(x.source,at(St.exec(x))+"g")),x.lastIndex=0;ue=x.exec(ce);)var me=ue.index;Y=Y.slice(0,me===i?K:me)}}else if(e.indexOf(Yt(x),K)!=K){var we=Y.lastIndexOf(x);we>-1&&(Y=Y.slice(0,we))}return Y+S}function bd(e){return e=at(e),e&&Fn.test(e)?e.replace(Bn,qp):e}var Ad=ii(function(e,t,a){return e+(a?" ":"")+t.toUpperCase()}),ms=Yo("toUpperCase");function qa(e,t,a){return e=at(e),t=a?i:t,t===i?Up(e)?Jp(e):Mp(e):e.match(t)||[]}var za=Je(function(e,t){try{return qt(e,i,t)}catch(a){return cs(a)?a:new We(a)}}),Td=Tn(function(e,t){return en(t,function(a){a=gn(a),bn(e,a,ls(e[a],e))}),e});function Sd(e){var t=e==null?0:e.length,a=Fe();return e=t?yt(e,function(S){if(typeof S[1]!="function")throw new tn(c);return[a(S[0]),S[1]]}):[],Je(function(S){for(var x=-1;++x<t;){var k=e[x];if(qt(k[0],this,S))return qt(k[1],this,S)}})}function Ed(e){return ql(rn(e,g))}function gs(e){return function(){return e}}function wd(e,t){return e==null||e!==e?t:e}var _d=Xo(),Pd=Xo(!0);function Kt(e){return e}function ys(e){return Io(typeof e=="function"?e:rn(e,g))}function Id(e){return Do(rn(e,g))}function xd(e,t){return Ro(e,rn(t,g))}var Dd=Je(function(e,t){return function(a){return yi(a,e,t)}}),Rd=Je(function(e,t){return function(a){return yi(e,a,t)}});function vs(e,t,a){var S=Rt(t),x=Ki(t,S);a==null&&!(vt(t)&&(x.length||!S.length))&&(a=t,t=e,e=this,x=Ki(t,Rt(t)));var k=!(vt(a)&&"chain"in a)||!!a.chain,V=En(e);return en(x,function(K){var Y=t[K];e[K]=Y,V&&(e.prototype[K]=function(){var ue=this.__chain__;if(k||ue){var ce=e(this.__wrapped__),me=ce.__actions__=Vt(this.__actions__);return me.push({func:Y,args:arguments,thisArg:e}),ce.__chain__=ue,ce}return Y.apply(e,xn([this.value()],arguments))})}),e}function Cd(){return Nt._===this&&(Nt._=nl),this}function bs(){}function Nd(e){return e=ze(e),Je(function(t){return Co(t,e)})}var Md=Jr(yt),kd=Jr(Xs),Ld=Jr(Tr);function Ya(e){return is(e)?Sr(gn(e)):u0(e)}function Od(e){return function(t){return e==null?i:Vn(e,t)}}var Bd=Qo(),Fd=Qo(!0);function As(){return[]}function Ts(){return!1}function jd(){return{}}function Hd(){return""}function Gd(){return!0}function Ud(e,t){if(e=ze(e),e<1||e>U)return[];var a=se,S=Lt(e,se);t=Fe(t),e-=se;for(var x=_r(S,t);++a<e;)t(a);return x}function Vd(e){return Ke(e)?yt(e,gn):Jt(e)?[e]:Vt(ma(at(e)))}function $d(e){var t=++el;return at(e)+t}var Wd=Zi(function(e,t){return e+t},0),Kd=Xr("ceil"),qd=Zi(function(e,t){return e/t},1),zd=Xr("floor");function Yd(e){return e&&e.length?Wi(e,Kt,Or):i}function Jd(e,t){return e&&e.length?Wi(e,Fe(t,2),Or):i}function Xd(e){return eo(e,Kt)}function Zd(e,t){return eo(e,Fe(t,2))}function Qd(e){return e&&e.length?Wi(e,Kt,Hr):i}function eh(e,t){return e&&e.length?Wi(e,Fe(t,2),Hr):i}var th=Zi(function(e,t){return e*t},1),nh=Xr("round"),ih=Zi(function(e,t){return e-t},0);function rh(e){return e&&e.length?wr(e,Kt):0}function sh(e,t){return e&&e.length?wr(e,Fe(t,2)):0}return M.after=Pc,M.ary=Pa,M.assign=hf,M.assignIn=Ha,M.assignInWith=cr,M.assignWith=mf,M.at=gf,M.before=Ia,M.bind=ls,M.bindAll=Td,M.bindKey=xa,M.castArray=Fc,M.chain=Ea,M.chunk=q0,M.compact=z0,M.concat=Y0,M.cond=Sd,M.conforms=Ed,M.constant=gs,M.countBy=ic,M.create=yf,M.curry=Da,M.curryRight=Ra,M.debounce=Ca,M.defaults=vf,M.defaultsDeep=bf,M.defer=Ic,M.delay=xc,M.difference=J0,M.differenceBy=X0,M.differenceWith=Z0,M.drop=Q0,M.dropRight=eu,M.dropRightWhile=tu,M.dropWhile=nu,M.fill=iu,M.filter=sc,M.flatMap=pc,M.flatMapDeep=lc,M.flatMapDepth=uc,M.flatten=ba,M.flattenDeep=ru,M.flattenDepth=su,M.flip=Dc,M.flow=_d,M.flowRight=Pd,M.fromPairs=ou,M.functions=Pf,M.functionsIn=If,M.groupBy=cc,M.initial=pu,M.intersection=lu,M.intersectionBy=uu,M.intersectionWith=cu,M.invert=Df,M.invertBy=Rf,M.invokeMap=dc,M.iteratee=ys,M.keyBy=hc,M.keys=Rt,M.keysIn=Wt,M.map=sr,M.mapKeys=Nf,M.mapValues=Mf,M.matches=Id,M.matchesProperty=xd,M.memoize=ar,M.merge=kf,M.mergeWith=Ga,M.method=Dd,M.methodOf=Rd,M.mixin=vs,M.negate=pr,M.nthArg=Nd,M.omit=Lf,M.omitBy=Of,M.once=Rc,M.orderBy=mc,M.over=Md,M.overArgs=Cc,M.overEvery=kd,M.overSome=Ld,M.partial=us,M.partialRight=Na,M.partition=gc,M.pick=Bf,M.pickBy=Ua,M.property=Ya,M.propertyOf=Od,M.pull=mu,M.pullAll=Ta,M.pullAllBy=gu,M.pullAllWith=yu,M.pullAt=vu,M.range=Bd,M.rangeRight=Fd,M.rearg=Nc,M.reject=bc,M.remove=bu,M.rest=Mc,M.reverse=as,M.sampleSize=Tc,M.set=jf,M.setWith=Hf,M.shuffle=Sc,M.slice=Au,M.sortBy=_c,M.sortedUniq=Iu,M.sortedUniqBy=xu,M.split=ld,M.spread=kc,M.tail=Du,M.take=Ru,M.takeRight=Cu,M.takeRightWhile=Nu,M.takeWhile=Mu,M.tap=zu,M.throttle=Lc,M.thru=rr,M.toArray=Ba,M.toPairs=Va,M.toPairsIn=$a,M.toPath=Vd,M.toPlainObject=ja,M.transform=Gf,M.unary=Oc,M.union=ku,M.unionBy=Lu,M.unionWith=Ou,M.uniq=Bu,M.uniqBy=Fu,M.uniqWith=ju,M.unset=Uf,M.unzip=ps,M.unzipWith=Sa,M.update=Vf,M.updateWith=$f,M.values=oi,M.valuesIn=Wf,M.without=Hu,M.words=qa,M.wrap=Bc,M.xor=Gu,M.xorBy=Uu,M.xorWith=Vu,M.zip=$u,M.zipObject=Wu,M.zipObjectDeep=Ku,M.zipWith=qu,M.entries=Va,M.entriesIn=$a,M.extend=Ha,M.extendWith=cr,vs(M,M),M.add=Wd,M.attempt=za,M.camelCase=Yf,M.capitalize=Wa,M.ceil=Kd,M.clamp=Kf,M.clone=jc,M.cloneDeep=Gc,M.cloneDeepWith=Uc,M.cloneWith=Hc,M.conformsTo=Vc,M.deburr=Ka,M.defaultTo=wd,M.divide=qd,M.endsWith=Jf,M.eq=un,M.escape=Xf,M.escapeRegExp=Zf,M.every=rc,M.find=oc,M.findIndex=ya,M.findKey=Af,M.findLast=ac,M.findLastIndex=va,M.findLastKey=Tf,M.floor=zd,M.forEach=wa,M.forEachRight=_a,M.forIn=Sf,M.forInRight=Ef,M.forOwn=wf,M.forOwnRight=_f,M.get=ds,M.gt=$c,M.gte=Wc,M.has=xf,M.hasIn=hs,M.head=Aa,M.identity=Kt,M.includes=fc,M.indexOf=au,M.inRange=qf,M.invoke=Cf,M.isArguments=Kn,M.isArray=Ke,M.isArrayBuffer=Kc,M.isArrayLike=$t,M.isArrayLikeObject=wt,M.isBoolean=qc,M.isBuffer=Ln,M.isDate=zc,M.isElement=Yc,M.isEmpty=Jc,M.isEqual=Xc,M.isEqualWith=Zc,M.isError=cs,M.isFinite=Qc,M.isFunction=En,M.isInteger=Ma,M.isLength=lr,M.isMap=ka,M.isMatch=ef,M.isMatchWith=tf,M.isNaN=nf,M.isNative=rf,M.isNil=of,M.isNull=sf,M.isNumber=La,M.isObject=vt,M.isObjectLike=Et,M.isPlainObject=Ei,M.isRegExp=fs,M.isSafeInteger=af,M.isSet=Oa,M.isString=ur,M.isSymbol=Jt,M.isTypedArray=si,M.isUndefined=pf,M.isWeakMap=lf,M.isWeakSet=uf,M.join=fu,M.kebabCase=Qf,M.last=on,M.lastIndexOf=du,M.lowerCase=ed,M.lowerFirst=td,M.lt=cf,M.lte=ff,M.max=Yd,M.maxBy=Jd,M.mean=Xd,M.meanBy=Zd,M.min=Qd,M.minBy=eh,M.stubArray=As,M.stubFalse=Ts,M.stubObject=jd,M.stubString=Hd,M.stubTrue=Gd,M.multiply=th,M.nth=hu,M.noConflict=Cd,M.noop=bs,M.now=or,M.pad=nd,M.padEnd=id,M.padStart=rd,M.parseInt=sd,M.random=zf,M.reduce=yc,M.reduceRight=vc,M.repeat=od,M.replace=ad,M.result=Ff,M.round=nh,M.runInContext=z,M.sample=Ac,M.size=Ec,M.snakeCase=pd,M.some=wc,M.sortedIndex=Tu,M.sortedIndexBy=Su,M.sortedIndexOf=Eu,M.sortedLastIndex=wu,M.sortedLastIndexBy=_u,M.sortedLastIndexOf=Pu,M.startCase=ud,M.startsWith=cd,M.subtract=ih,M.sum=rh,M.sumBy=sh,M.template=fd,M.times=Ud,M.toFinite=wn,M.toInteger=ze,M.toLength=Fa,M.toLower=dd,M.toNumber=an,M.toSafeInteger=df,M.toString=at,M.toUpper=hd,M.trim=md,M.trimEnd=gd,M.trimStart=yd,M.truncate=vd,M.unescape=bd,M.uniqueId=$d,M.upperCase=Ad,M.upperFirst=ms,M.each=wa,M.eachRight=_a,M.first=Aa,vs(M,function(){var e={};return hn(M,function(t,a){ut.call(M.prototype,a)||(e[a]=t)}),e}(),{chain:!1}),M.VERSION=n,en(["bind","bindKey","curry","curryRight","partial","partialRight"],function(e){M[e].placeholder=M}),en(["drop","take"],function(e,t){Ze.prototype[e]=function(a){a=a===i?1:xt(ze(a),0);var S=this.__filtered__&&!t?new Ze(this):this.clone();return S.__filtered__?S.__takeCount__=Lt(a,S.__takeCount__):S.__views__.push({size:Lt(a,se),type:e+(S.__dir__<0?"Right":"")}),S},Ze.prototype[e+"Right"]=function(a){return this.reverse()[e](a).reverse()}}),en(["filter","map","takeWhile"],function(e,t){var a=t+1,S=a==j||a==L;Ze.prototype[e]=function(x){var k=this.clone();return k.__iteratees__.push({iteratee:Fe(x,3),type:a}),k.__filtered__=k.__filtered__||S,k}}),en(["head","last"],function(e,t){var a="take"+(t?"Right":"");Ze.prototype[e]=function(){return this[a](1).value()[0]}}),en(["initial","tail"],function(e,t){var a="drop"+(t?"":"Right");Ze.prototype[e]=function(){return this.__filtered__?new Ze(this):this[a](1)}}),Ze.prototype.compact=function(){return this.filter(Kt)},Ze.prototype.find=function(e){return this.filter(e).head()},Ze.prototype.findLast=function(e){return this.reverse().find(e)},Ze.prototype.invokeMap=Je(function(e,t){return typeof e=="function"?new Ze(this):this.map(function(a){return yi(a,e,t)})}),Ze.prototype.reject=function(e){return this.filter(pr(Fe(e)))},Ze.prototype.slice=function(e,t){e=ze(e);var a=this;return a.__filtered__&&(e>0||t<0)?new Ze(a):(e<0?a=a.takeRight(-e):e&&(a=a.drop(e)),t!==i&&(t=ze(t),a=t<0?a.dropRight(-t):a.take(t-e)),a)},Ze.prototype.takeRightWhile=function(e){return this.reverse().takeWhile(e).reverse()},Ze.prototype.toArray=function(){return this.take(se)},hn(Ze.prototype,function(e,t){var a=/^(?:filter|find|map|reject)|While$/.test(t),S=/^(?:head|last)$/.test(t),x=M[S?"take"+(t=="last"?"Right":""):t],k=S||/^find/.test(t);x&&(M.prototype[t]=function(){var V=this.__wrapped__,K=S?[1]:arguments,Y=V instanceof Ze,ue=K[0],ce=Y||Ke(V),me=function(Xe){var Qe=x.apply(M,xn([Xe],K));return S&&we?Qe[0]:Qe};ce&&a&&typeof ue=="function"&&ue.length!=1&&(Y=ce=!1);var we=this.__chain__,ke=!!this.__actions__.length,He=k&&!we,Ye=Y&&!ke;if(!k&&ce){V=Ye?V:new Ze(this);var Ge=e.apply(V,K);return Ge.__actions__.push({func:rr,args:[me],thisArg:i}),new nn(Ge,we)}return He&&Ye?e.apply(this,K):(Ge=this.thru(me),He?S?Ge.value()[0]:Ge.value():Ge)})}),en(["pop","push","shift","sort","splice","unshift"],function(e){var t=Ri[e],a=/^(?:push|sort|unshift)$/.test(e)?"tap":"thru",S=/^(?:pop|shift)$/.test(e);M.prototype[e]=function(){var x=arguments;if(S&&!this.__chain__){var k=this.value();return t.apply(Ke(k)?k:[],x)}return this[a](function(V){return t.apply(Ke(V)?V:[],x)})}}),hn(Ze.prototype,function(e,t){var a=M[t];if(a){var S=a.name+"";ut.call(ei,S)||(ei[S]=[]),ei[S].push({name:t,func:a})}}),ei[Xi(i,_).name]=[{name:"wrapper",func:i}],Ze.prototype.clone=vl,Ze.prototype.reverse=bl,Ze.prototype.value=Al,M.prototype.at=Yu,M.prototype.chain=Ju,M.prototype.commit=Xu,M.prototype.next=Zu,M.prototype.plant=ec,M.prototype.reverse=tc,M.prototype.toJSON=M.prototype.valueOf=M.prototype.value=nc,M.prototype.first=M.prototype.head,ui&&(M.prototype[ui]=Qu),M},Di=Xp();Nt._=Di,l=function(){return Di}.call(m,r,m,w),l!==i&&(w.exports=l)}).call(this)},2569:(w,m,r)=>{var l,i;l=[r(8411),r(2332),r(4733),r(8811),r(3617),r(2998),r(9773),r(9340),r(8269),r(4553)],i=function(n,p,f,c,o,h,y){"use strict";var s=/^(?:parents|prev(?:Until|All))/,g={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(d){var v=n(d,this),b=v.length;return this.filter(function(){for(var T=0;T<b;T++)if(n.contains(this,v[T]))return!0})},closest:function(d,v){var b,T=0,_=this.length,A=[],E=typeof d!="string"&&n(d);if(!h.test(d)){for(;T<_;T++)for(b=this[T];b&&b!==v;b=b.parentNode)if(b.nodeType<11&&(E?E.index(b)>-1:b.nodeType===1&&n.find.matchesSelector(b,d))){A.push(b);break}}return this.pushStack(A.length>1?n.uniqueSort(A):A)},index:function(d){return d?typeof d=="string"?f.call(n(d),this[0]):f.call(this,d.jquery?d[0]:d):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(d,v){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(d,v))))},addBack:function(d){return this.add(d==null?this.prevObject:this.prevObject.filter(d))}});function u(d,v){for(;(d=d[v])&&d.nodeType!==1;);return d}return n.each({parent:function(d){var v=d.parentNode;return v&&v.nodeType!==11?v:null},parents:function(d){return c(d,"parentNode")},parentsUntil:function(d,v,b){return c(d,"parentNode",b)},next:function(d){return u(d,"nextSibling")},prev:function(d){return u(d,"previousSibling")},nextAll:function(d){return c(d,"nextSibling")},prevAll:function(d){return c(d,"previousSibling")},nextUntil:function(d,v,b){return c(d,"nextSibling",b)},prevUntil:function(d,v,b){return c(d,"previousSibling",b)},siblings:function(d){return o((d.parentNode||{}).firstChild,d)},children:function(d){return o(d.firstChild)},contents:function(d){return d.contentDocument!=null&&p(d.contentDocument)?d.contentDocument:(y(d,"template")&&(d=d.content||d),n.merge([],d.childNodes))}},function(d,v){n.fn[d]=function(b,T){var _=n.map(this,v,b);return d.slice(-5)!=="Until"&&(T=b),T&&typeof T=="string"&&(_=n.filter(T,_)),this.length>1&&(g[d]||n.uniqueSort(_),s.test(d)&&_.reverse()),this.pushStack(_)}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},2710:(w,m,r)=>{var l,i;l=[r(8543)],i=function(n){"use strict";var p={type:!0,src:!0,nonce:!0,noModule:!0};function f(c,o,h){h=h||n;var y,s,g=h.createElement("script");if(g.text=c,o)for(y in p)s=o[y]||o.getAttribute&&o.getAttribute(y),s&&g.setAttribute(y,s);h.head.appendChild(g).parentNode.removeChild(g)}return f}.apply(m,l),i!==void 0&&(w.exports=i)},2726:(w,m,r)=>{var l,i;l=[r(8411),r(4553),r(2569),r(3682),r(6599),r(5850),r(1791),r(7076),r(1801),r(981),r(5549),r(8926),r(7957),r(1580),r(5868),r(9229),r(1896),r(3040),r(9978),r(4895),r(8498),r(4139),r(9165),r(1074),r(3814),r(2512),r(5547),r(7651),r(4041),r(6353),r(336),r(2155)],i=function(n){"use strict";return n}.apply(m,l),i!==void 0&&(w.exports=i)},2738:(w,m,r)=>{var l,i;l=[r(8411),r(8926),r(3985)],i=function(n){"use strict";n.fn.extend({bind:function(p,f,c){return this.on(p,null,f,c)},unbind:function(p,f){return this.off(p,null,f)},delegate:function(p,f,c,o){return this.on(f,p,c,o)},undelegate:function(p,f,c){return arguments.length===1?this.off(p,"**"):this.off(f,p||"**",c)},hover:function(p,f){return this.on("mouseenter",p).on("mouseleave",f||p)}}),n.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(p,f){n.fn[f]=function(c,o){return arguments.length>0?this.on(f,null,c,o):this.trigger(f)}})}.apply(m,l),i!==void 0&&(w.exports=i)},2938:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p)=>new l(n,p).major;w.exports=i},2998:(w,m,r)=>{var l,i;l=[r(8411),r(4553)],i=function(n){"use strict";return n.expr.match.needsContext}.apply(m,l),i!==void 0&&(w.exports=i)},3007:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p,f,c,o)=>{typeof f=="string"&&(o=c,c=f,f=void 0);try{return new l(n instanceof l?n.version:n,f).inc(p,c,o).version}catch(h){return null}};w.exports=i},3040:(w,m,r)=>{var l,i;l=[r(8411),r(8519),r(8404),r(1382),r(9340),r(2569),r(5933)],i=function(n,p,f,c){"use strict";var o=/\[\]$/,h=/\r?\n/g,y=/^(?:submit|button|image|reset|file)$/i,s=/^(?:input|select|textarea|keygen)/i;function g(u,d,v,b){var T;if(Array.isArray(d))n.each(d,function(_,A){v||o.test(u)?b(u,A):g(u+"["+(typeof A=="object"&&A!=null?_:"")+"]",A,v,b)});else if(!v&&p(d)==="object")for(T in d)g(u+"["+T+"]",d[T],v,b);else b(u,d)}return n.param=function(u,d){var v,b=[],T=function(_,A){var E=c(A)?A():A;b[b.length]=encodeURIComponent(_)+"="+encodeURIComponent(E==null?"":E)};if(u==null)return"";if(Array.isArray(u)||u.jquery&&!n.isPlainObject(u))n.each(u,function(){T(this.name,this.value)});else for(v in u)g(v,u[v],d,T);return b.join("&")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var u=n.prop(this,"elements");return u?n.makeArray(u):this}).filter(function(){var u=this.type;return this.name&&!n(this).is(":disabled")&&s.test(this.nodeName)&&!y.test(u)&&(this.checked||!f.test(u))}).map(function(u,d){var v=n(this).val();return v==null?null:Array.isArray(v)?n.map(v,function(b){return{name:d.name,value:b.replace(h,`\r
`)}}):{name:d.name,value:v.replace(h,`\r
`)}}).get()}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},3617:(w,m,r)=>{var l;l=function(){"use strict";return function(i,n){for(var p=[];i;i=i.nextSibling)i.nodeType===1&&i!==n&&p.push(i);return p}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},3629:(w,m,r)=>{var l;l=function(){"use strict";function i(n,p){return{get:function(){if(n()){delete this.get;return}return(this.get=p).apply(this,arguments)}}}return i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},3682:(w,m,r)=>{var l,i;l=[r(8411),r(8519),r(1382),r(9091)],i=function(n,p,f,c){"use strict";function o(h){var y={};return n.each(h.match(c)||[],function(s,g){y[g]=!0}),y}return n.Callbacks=function(h){h=typeof h=="string"?o(h):n.extend({},h);var y,s,g,u,d=[],v=[],b=-1,T=function(){for(u=u||h.once,g=y=!0;v.length;b=-1)for(s=v.shift();++b<d.length;)d[b].apply(s[0],s[1])===!1&&h.stopOnFalse&&(b=d.length,s=!1);h.memory||(s=!1),y=!1,u&&(s?d=[]:d="")},_={add:function(){return d&&(s&&!y&&(b=d.length-1,v.push(s)),function A(E){n.each(E,function(I,N){f(N)?(!h.unique||!_.has(N))&&d.push(N):N&&N.length&&p(N)!=="string"&&A(N)})}(arguments),s&&!y&&T()),this},remove:function(){return n.each(arguments,function(A,E){for(var I;(I=n.inArray(E,d,I))>-1;)d.splice(I,1),I<=b&&b--}),this},has:function(A){return A?n.inArray(A,d)>-1:d.length>0},empty:function(){return d&&(d=[]),this},disable:function(){return u=v=[],d=s="",this},disabled:function(){return!d},lock:function(){return u=v=[],!s&&!y&&(d=s=""),this},locked:function(){return!!u},fireWith:function(A,E){return u||(E=E||[],E=[A,E.slice?E.slice():E],v.push(E),y||T()),this},fire:function(){return _.fireWith(this,arguments),this},fired:function(){return!!g}};return _},n}.apply(m,l),i!==void 0&&(w.exports=i)},3814:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(3894),r(7414),r(203)],i=function(n,p,f,c,o){"use strict";return n.parseHTML=function(h,y,s){if(typeof h!="string")return[];typeof y=="boolean"&&(s=y,y=!1);var g,u,d;return y||(o.createHTMLDocument?(y=p.implementation.createHTMLDocument(""),g=y.createElement("base"),g.href=p.location.href,y.head.appendChild(g)):y=p),u=f.exec(h),d=!s&&[],u?[y.createElement(u[1])]:(u=c([h],y,d),d&&d.length&&n(d).remove(),n.merge([],u.childNodes))},n.parseHTML}.apply(m,l),i!==void 0&&(w.exports=i)},3874:(w,m,r)=>{"use strict";const l=r(8311),i=(n,p)=>{try{return new l(n,p).range||"*"}catch(f){return null}};w.exports=i},3894:(w,m,r)=>{var l;l=function(){"use strict";return/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},3904:(w,m,r)=>{"use strict";const l=Symbol("SemVer ANY");class i{static get ANY(){return l}constructor(g,u){if(u=n(u),g instanceof i){if(g.loose===!!u.loose)return g;g=g.value}g=g.trim().split(/\s+/).join(" "),o("comparator",g,u),this.options=u,this.loose=!!u.loose,this.parse(g),this.semver===l?this.value="":this.value=this.operator+this.semver.version,o("comp",this)}parse(g){const u=this.options.loose?p[f.COMPARATORLOOSE]:p[f.COMPARATOR],d=g.match(u);if(!d)throw new TypeError(`Invalid comparator: ${g}`);this.operator=d[1]!==void 0?d[1]:"",this.operator==="="&&(this.operator=""),d[2]?this.semver=new h(d[2],this.options.loose):this.semver=l}toString(){return this.value}test(g){if(o("Comparator.test",g,this.options.loose),this.semver===l||g===l)return!0;if(typeof g=="string")try{g=new h(g,this.options)}catch(u){return!1}return c(g,this.operator,this.semver,this.options)}intersects(g,u){if(!(g instanceof i))throw new TypeError("a Comparator is required");return this.operator===""?this.value===""?!0:new y(g.value,u).test(this.value):g.operator===""?g.value===""?!0:new y(this.value,u).test(g.semver):(u=n(u),u.includePrerelease&&(this.value==="<0.0.0-0"||g.value==="<0.0.0-0")||!u.includePrerelease&&(this.value.startsWith("<0.0.0")||g.value.startsWith("<0.0.0"))?!1:!!(this.operator.startsWith(">")&&g.operator.startsWith(">")||this.operator.startsWith("<")&&g.operator.startsWith("<")||this.semver.version===g.semver.version&&this.operator.includes("=")&&g.operator.includes("=")||c(this.semver,"<",g.semver,u)&&this.operator.startsWith(">")&&g.operator.startsWith("<")||c(this.semver,">",g.semver,u)&&this.operator.startsWith("<")&&g.operator.startsWith(">")))}}w.exports=i;const n=r(8587),{safeRe:p,t:f}=r(9718),c=r(2111),o=r(7272),h=r(3908),y=r(8311)},3908:(w,m,r)=>{"use strict";const l=r(7272),{MAX_LENGTH:i,MAX_SAFE_INTEGER:n}=r(6874),{safeRe:p,t:f}=r(9718),c=r(8587),{compareIdentifiers:o}=r(1123);class h{constructor(s,g){if(g=c(g),s instanceof h){if(s.loose===!!g.loose&&s.includePrerelease===!!g.includePrerelease)return s;s=s.version}else if(typeof s!="string")throw new TypeError(`Invalid version. Must be a string. Got type "${typeof s}".`);if(s.length>i)throw new TypeError(`version is longer than ${i} characters`);l("SemVer",s,g),this.options=g,this.loose=!!g.loose,this.includePrerelease=!!g.includePrerelease;const u=s.trim().match(g.loose?p[f.LOOSE]:p[f.FULL]);if(!u)throw new TypeError(`Invalid Version: ${s}`);if(this.raw=s,this.major=+u[1],this.minor=+u[2],this.patch=+u[3],this.major>n||this.major<0)throw new TypeError("Invalid major version");if(this.minor>n||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>n||this.patch<0)throw new TypeError("Invalid patch version");u[4]?this.prerelease=u[4].split(".").map(d=>{if(/^[0-9]+$/.test(d)){const v=+d;if(v>=0&&v<n)return v}return d}):this.prerelease=[],this.build=u[5]?u[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(s){if(l("SemVer.compare",this.version,this.options,s),!(s instanceof h)){if(typeof s=="string"&&s===this.version)return 0;s=new h(s,this.options)}return s.version===this.version?0:this.compareMain(s)||this.comparePre(s)}compareMain(s){return s instanceof h||(s=new h(s,this.options)),o(this.major,s.major)||o(this.minor,s.minor)||o(this.patch,s.patch)}comparePre(s){if(s instanceof h||(s=new h(s,this.options)),this.prerelease.length&&!s.prerelease.length)return-1;if(!this.prerelease.length&&s.prerelease.length)return 1;if(!this.prerelease.length&&!s.prerelease.length)return 0;let g=0;do{const u=this.prerelease[g],d=s.prerelease[g];if(l("prerelease compare",g,u,d),u===void 0&&d===void 0)return 0;if(d===void 0)return 1;if(u===void 0)return-1;if(u===d)continue;return o(u,d)}while(++g)}compareBuild(s){s instanceof h||(s=new h(s,this.options));let g=0;do{const u=this.build[g],d=s.build[g];if(l("build compare",g,u,d),u===void 0&&d===void 0)return 0;if(d===void 0)return 1;if(u===void 0)return-1;if(u===d)continue;return o(u,d)}while(++g)}inc(s,g,u){if(s.startsWith("pre")){if(!g&&u===!1)throw new Error("invalid increment argument: identifier is empty");if(g){const d=`-${g}`.match(this.options.loose?p[f.PRERELEASELOOSE]:p[f.PRERELEASE]);if(!d||d[1]!==g)throw new Error(`invalid identifier: ${g}`)}}switch(s){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",g,u);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",g,u);break;case"prepatch":this.prerelease.length=0,this.inc("patch",g,u),this.inc("pre",g,u);break;case"prerelease":this.prerelease.length===0&&this.inc("patch",g,u),this.inc("pre",g,u);break;case"release":if(this.prerelease.length===0)throw new Error(`version ${this.raw} is not a prerelease`);this.prerelease.length=0;break;case"major":(this.minor!==0||this.patch!==0||this.prerelease.length===0)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(this.patch!==0||this.prerelease.length===0)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":this.prerelease.length===0&&this.patch++,this.prerelease=[];break;case"pre":{const d=Number(u)?1:0;if(this.prerelease.length===0)this.prerelease=[d];else{let v=this.prerelease.length;for(;--v>=0;)typeof this.prerelease[v]=="number"&&(this.prerelease[v]++,v=-2);if(v===-1){if(g===this.prerelease.join(".")&&u===!1)throw new Error("invalid increment argument: identifier already exists");this.prerelease.push(d)}}if(g){let v=[g,d];u===!1&&(v=[g]),o(this.prerelease[0],g)===0?isNaN(this.prerelease[1])&&(this.prerelease=v):this.prerelease=v}break}default:throw new Error(`invalid increment argument: ${s}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}w.exports=h},3927:(w,m,r)=>{"use strict";const l=r(909),i=(n,p)=>n.sort((f,c)=>l(f,c,p));w.exports=i},3934:(w,m,r)=>{var l;l=function(){"use strict";return function(i){var n=i.ownerDocument.defaultView;return(!n||!n.opener)&&(n=window),n.getComputedStyle(i)}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},3985:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(9192),r(8149),r(1402),r(1382),r(7346),r(8926)],i=function(n,p,f,c,o,h,y){"use strict";var s=/^(?:focusinfocus|focusoutblur)$/,g=function(u){u.stopPropagation()};return n.extend(n.event,{trigger:function(u,d,v,b){var T,_,A,E,I,N,B,C,D=[v||p],P=o.call(u,"type")?u.type:u,R=o.call(u,"namespace")?u.namespace.split("."):[];if(_=C=A=v=v||p,!(v.nodeType===3||v.nodeType===8)&&!s.test(P+n.event.triggered)&&(P.indexOf(".")>-1&&(R=P.split("."),P=R.shift(),R.sort()),I=P.indexOf(":")<0&&"on"+P,u=u[n.expando]?u:new n.Event(P,typeof u=="object"&&u),u.isTrigger=b?2:3,u.namespace=R.join("."),u.rnamespace=u.namespace?new RegExp("(^|\\.)"+R.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,u.result=void 0,u.target||(u.target=v),d=d==null?[u]:n.makeArray(d,[u]),B=n.event.special[P]||{},!(!b&&B.trigger&&B.trigger.apply(v,d)===!1))){if(!b&&!B.noBubble&&!y(v)){for(E=B.delegateType||P,s.test(E+P)||(_=_.parentNode);_;_=_.parentNode)D.push(_),A=_;A===(v.ownerDocument||p)&&D.push(A.defaultView||A.parentWindow||window)}for(T=0;(_=D[T++])&&!u.isPropagationStopped();)C=_,u.type=T>1?E:B.bindType||P,N=(f.get(_,"events")||Object.create(null))[u.type]&&f.get(_,"handle"),N&&N.apply(_,d),N=I&&_[I],N&&N.apply&&c(_)&&(u.result=N.apply(_,d),u.result===!1&&u.preventDefault());return u.type=P,!b&&!u.isDefaultPrevented()&&(!B._default||B._default.apply(D.pop(),d)===!1)&&c(v)&&I&&h(v[P])&&!y(v)&&(A=v[I],A&&(v[I]=null),n.event.triggered=P,u.isPropagationStopped()&&C.addEventListener(P,g),v[P](),u.isPropagationStopped()&&C.removeEventListener(P,g),n.event.triggered=void 0,A&&(v[I]=A)),u.result}},simulate:function(u,d,v){var b=n.extend(new n.Event,v,{type:u,isSimulated:!0});n.event.trigger(b,null,d)}}),n.fn.extend({trigger:function(u,d){return this.each(function(){n.event.trigger(u,d,this)})},triggerHandler:function(u,d){var v=this[0];if(v)return n.event.trigger(u,d,v,!0)}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},3999:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)!==0;w.exports=i},4041:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(7346),r(9229)],i=function(n,p,f){"use strict";return n.each({Height:"height",Width:"width"},function(c,o){n.each({padding:"inner"+c,content:o,"":"outer"+c},function(h,y){n.fn[y]=function(s,g){var u=arguments.length&&(h||typeof s!="boolean"),d=h||(s===!0||g===!0?"margin":"border");return p(this,function(v,b,T){var _;return f(v)?y.indexOf("outer")===0?v["inner"+c]:v.document.documentElement["client"+c]:v.nodeType===9?(_=v.documentElement,Math.max(v.body["scroll"+c],_["scroll"+c],v.body["offset"+c],_["offset"+c],_["client"+c])):T===void 0?n.css(v,b,d):n.style(v,b,T,d)},o,u?s:void 0,u)}})}),n}.apply(m,l),i!==void 0&&(w.exports=i)},4089:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)>=0;w.exports=i},4122:(w,m,r)=>{var l,i;l=[r(8320)],i=function(n){"use strict";return n.toString}.apply(m,l),i!==void 0&&(w.exports=i)},4139:(w,m,r)=>{var l,i;l=[r(8411),r(1382),r(1628),r(1205),r(9978)],i=function(n,p,f,c){"use strict";var o=[],h=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var y=o.pop()||n.expando+"_"+f.guid++;return this[y]=!0,y}}),n.ajaxPrefilter("json jsonp",function(y,s,g){var u,d,v,b=y.jsonp!==!1&&(h.test(y.url)?"url":typeof y.data=="string"&&(y.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&h.test(y.data)&&"data");if(b||y.dataTypes[0]==="jsonp")return u=y.jsonpCallback=p(y.jsonpCallback)?y.jsonpCallback():y.jsonpCallback,b?y[b]=y[b].replace(h,"$1"+u):y.jsonp!==!1&&(y.url+=(c.test(y.url)?"&":"?")+y.jsonp+"="+u),y.converters["script json"]=function(){return v||n.error(u+" was not called"),v[0]},y.dataTypes[0]="json",d=window[u],window[u]=function(){v=arguments},g.always(function(){d===void 0?n(window).removeProp(u):window[u]=d,y[u]&&(y.jsonpCallback=s.jsonpCallback,o.push(u)),v&&p(d)&&d(v[0]),v=d=void 0}),"script"})}.apply(m,l),i!==void 0&&(w.exports=i)},4143:(w,m,r)=>{var l,i;l=[r(8411),r(9773)],i=function(n,p){"use strict";function f(c,o){var h;return typeof c.getElementsByTagName!="undefined"?h=c.getElementsByTagName(o||"*"):typeof c.querySelectorAll!="undefined"?h=c.querySelectorAll(o||"*"):h=[],o===void 0||o&&p(c,o)?n.merge([c],h):h}return f}.apply(m,l),i!==void 0&&(w.exports=i)},4172:(w,m,r)=>{var l,i;l=[r(8411),r(9758),r(9091),r(8149)],i=function(n,p,f,c){"use strict";function o(){this.expando=n.expando+o.uid++}return o.uid=1,o.prototype={cache:function(h){var y=h[this.expando];return y||(y={},c(h)&&(h.nodeType?h[this.expando]=y:Object.defineProperty(h,this.expando,{value:y,configurable:!0}))),y},set:function(h,y,s){var g,u=this.cache(h);if(typeof y=="string")u[p(y)]=s;else for(g in y)u[p(g)]=y[g];return u},get:function(h,y){return y===void 0?this.cache(h):h[this.expando]&&h[this.expando][p(y)]},access:function(h,y,s){return y===void 0||y&&typeof y=="string"&&s===void 0?this.get(h,y):(this.set(h,y,s),s!==void 0?s:y)},remove:function(h,y){var s,g=h[this.expando];if(g!==void 0){if(y!==void 0)for(Array.isArray(y)?y=y.map(p):(y=p(y),y=y in g?[y]:y.match(f)||[]),s=y.length;s--;)delete g[y[s]];(y===void 0||n.isEmptyObject(g))&&(h.nodeType?h[this.expando]=void 0:delete h[this.expando])}},hasData:function(h){var y=h[this.expando];return y!==void 0&&!n.isEmptyObject(y)}},o}.apply(m,l),i!==void 0&&(w.exports=i)},4213:(w,m,r)=>{var l,i;l=[r(8411),r(9192),r(4385)],i=function(n,p,f){"use strict";var c={};function o(y){var s,g=y.ownerDocument,u=y.nodeName,d=c[u];return d||(s=g.body.appendChild(g.createElement(u)),d=n.css(s,"display"),s.parentNode.removeChild(s),d==="none"&&(d="block"),c[u]=d,d)}function h(y,s){for(var g,u,d=[],v=0,b=y.length;v<b;v++)u=y[v],u.style&&(g=u.style.display,s?(g==="none"&&(d[v]=p.get(u,"display")||null,d[v]||(u.style.display="")),u.style.display===""&&f(u)&&(d[v]=o(u))):g!=="none"&&(d[v]="none",p.set(u,"display",g)));for(v=0;v<b;v++)d[v]!=null&&(y[v].style.display=d[v]);return y}return n.fn.extend({show:function(){return h(this,!0)},hide:function(){return h(this)},toggle:function(y){return typeof y=="boolean"?y?this.show():this.hide():this.each(function(){f(this)?n(this).show():n(this).hide()})}}),h}.apply(m,l),i!==void 0&&(w.exports=i)},4277:(w,m,r)=>{"use strict";const l=r(909),i=(n,p)=>n.sort((f,c)=>l(c,f,p));w.exports=i},4385:(w,m,r)=>{var l,i;l=[r(8411),r(5194)],i=function(n,p){"use strict";return function(f,c){return f=c||f,f.style.display==="none"||f.style.display===""&&p(f)&&n.css(f,"display")==="none"}}.apply(m,l),i!==void 0&&(w.exports=i)},4493:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p)=>new l(n,p).patch;w.exports=i},4553:(w,m,r)=>{var l,i;l=[r(8411),r(9773),r(2283),r(8543),r(4733),r(1402),r(7507),r(7298),r(5950),r(9518),r(1338),r(9619),r(8919),r(107),r(685),r(7410)],i=function(n,p,f,c,o,h,y,s,g,u,d,v,b,T){"use strict";var _=c,A=s;(function(){var E,I,N,B,C,D=A,P,R,O,H,$,j=n.expando,G=0,L=0,W=ve(),U=ve(),Q=ve(),ne=ve(),se=function(F,q){return F===q&&(C=!0),0},X="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",ge="(?:\\\\[\\da-fA-F]{1,6}"+v+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",be="\\["+v+"*("+ge+")(?:"+v+"*([*^$|!~]?=)"+v+`*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(`+ge+"))|)"+v+"*\\]",_e=":("+ge+`)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|`+be+")*)|.*)\\)|)",Be=new RegExp(v+"+","g"),st=new RegExp("^"+v+"*,"+v+"*"),bt=new RegExp("^"+v+"*([>+~]|"+v+")"+v+"*"),At=new RegExp(v+"|>"),Dt=new RegExp(_e),fe=new RegExp("^"+ge+"$"),xe={ID:new RegExp("^#("+ge+")"),CLASS:new RegExp("^\\.("+ge+")"),TAG:new RegExp("^("+ge+"|[*])"),ATTR:new RegExp("^"+be),PSEUDO:new RegExp("^"+_e),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+v+"*(even|odd|(([+-]|)(\\d*)n|)"+v+"*(?:([+-]|)"+v+"*(\\d+)|))"+v+"*\\)|)","i"),bool:new RegExp("^(?:"+X+")$","i"),needsContext:new RegExp("^"+v+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+v+"*((?:-\\d)?\\d*)"+v+"*\\)|)(?=[^-]|$)","i")},Te=/^(?:input|select|textarea|button)$/i,Le=/^h\d$/i,ht=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Ut=/[+~]/,tt=new RegExp("\\\\[\\da-fA-F]{1,6}"+v+"?|\\\\([^\\r\\n\\f])","g"),Me=function(F,q){var Z="0x"+F.slice(1)-65536;return q||(Z<0?String.fromCharCode(Z+65536):String.fromCharCode(Z>>10|55296,Z&1023|56320))},de=function(){pt()},Ce=Pt(function(F){return F.disabled===!0&&p(F,"fieldset")},{dir:"parentNode",next:"legend"});function Pe(){try{return P.activeElement}catch(F){}}try{D.apply(f=g.call(_.childNodes),_.childNodes),f[_.childNodes.length].nodeType}catch(F){D={apply:function(q,Z){A.apply(q,g.call(Z))},call:function(q){A.apply(q,g.call(arguments,1))}}}function J(F,q,Z,ee){var oe,Ae,Se,Re,Ee,$e,re,ie=q&&q.ownerDocument,le=q?q.nodeType:9;if(Z=Z||[],typeof F!="string"||!F||le!==1&&le!==9&&le!==11)return Z;if(!ee&&(pt(q),q=q||P,O)){if(le!==11&&(Ee=ht.exec(F)))if(oe=Ee[1]){if(le===9)if(Se=q.getElementById(oe)){if(Se.id===oe)return D.call(Z,Se),Z}else return Z;else if(ie&&(Se=ie.getElementById(oe))&&J.contains(q,Se)&&Se.id===oe)return D.call(Z,Se),Z}else{if(Ee[2])return D.apply(Z,q.getElementsByTagName(F)),Z;if((oe=Ee[3])&&q.getElementsByClassName)return D.apply(Z,q.getElementsByClassName(oe)),Z}if(!ne[F+" "]&&(!H||!H.test(F))){if(re=F,ie=q,le===1&&(At.test(F)||bt.test(F))){for(ie=Ut.test(F)&&et(q.parentNode)||q,(ie!=q||!T.scope)&&((Re=q.getAttribute("id"))?Re=n.escapeSelector(Re):q.setAttribute("id",Re=j)),$e=Bt(F),Ae=$e.length;Ae--;)$e[Ae]=(Re?"#"+Re:":scope")+" "+kt($e[Ae]);re=$e.join(",")}try{return D.apply(Z,ie.querySelectorAll(re)),Z}catch(pe){ne(F,!0)}finally{Re===j&&q.removeAttribute("id")}}}return Fn(F.replace(b,"$1"),q,Z,ee)}function ve(){var F=[];function q(Z,ee){return F.push(Z+" ")>I.cacheLength&&delete q[F.shift()],q[Z+" "]=ee}return q}function he(F){return F[j]=!0,F}function ye(F){var q=P.createElement("fieldset");try{return!!F(q)}catch(Z){return!1}finally{q.parentNode&&q.parentNode.removeChild(q),q=null}}function Oe(F){return function(q){return p(q,"input")&&q.type===F}}function Ve(F){return function(q){return(p(q,"input")||p(q,"button"))&&q.type===F}}function Ue(F){return function(q){return"form"in q?q.parentNode&&q.disabled===!1?"label"in q?"label"in q.parentNode?q.parentNode.disabled===F:q.disabled===F:q.isDisabled===F||q.isDisabled!==!F&&Ce(q)===F:q.disabled===F:"label"in q?q.disabled===F:!1}}function qe(F){return he(function(q){return q=+q,he(function(Z,ee){for(var oe,Ae=F([],Z.length,q),Se=Ae.length;Se--;)Z[oe=Ae[Se]]&&(Z[oe]=!(ee[oe]=Z[oe]))})})}function et(F){return F&&typeof F.getElementsByTagName!="undefined"&&F}function pt(F){var q,Z=F?F.ownerDocument||F:_;return Z==P||Z.nodeType!==9||!Z.documentElement||(P=Z,R=P.documentElement,O=!n.isXMLDoc(P),$=R.matches||R.webkitMatchesSelector||R.msMatchesSelector,R.msMatchesSelector&&_!=P&&(q=P.defaultView)&&q.top!==q&&q.addEventListener("unload",de),T.getById=ye(function(ee){return R.appendChild(ee).id=n.expando,!P.getElementsByName||!P.getElementsByName(n.expando).length}),T.disconnectedMatch=ye(function(ee){return $.call(ee,"*")}),T.scope=ye(function(){return P.querySelectorAll(":scope")}),T.cssHas=ye(function(){try{return P.querySelector(":has(*,:jqfake)"),!1}catch(ee){return!0}}),T.getById?(I.filter.ID=function(ee){var oe=ee.replace(tt,Me);return function(Ae){return Ae.getAttribute("id")===oe}},I.find.ID=function(ee,oe){if(typeof oe.getElementById!="undefined"&&O){var Ae=oe.getElementById(ee);return Ae?[Ae]:[]}}):(I.filter.ID=function(ee){var oe=ee.replace(tt,Me);return function(Ae){var Se=typeof Ae.getAttributeNode!="undefined"&&Ae.getAttributeNode("id");return Se&&Se.value===oe}},I.find.ID=function(ee,oe){if(typeof oe.getElementById!="undefined"&&O){var Ae,Se,Re,Ee=oe.getElementById(ee);if(Ee){if(Ae=Ee.getAttributeNode("id"),Ae&&Ae.value===ee)return[Ee];for(Re=oe.getElementsByName(ee),Se=0;Ee=Re[Se++];)if(Ae=Ee.getAttributeNode("id"),Ae&&Ae.value===ee)return[Ee]}return[]}}),I.find.TAG=function(ee,oe){return typeof oe.getElementsByTagName!="undefined"?oe.getElementsByTagName(ee):oe.querySelectorAll(ee)},I.find.CLASS=function(ee,oe){if(typeof oe.getElementsByClassName!="undefined"&&O)return oe.getElementsByClassName(ee)},H=[],ye(function(ee){var oe;R.appendChild(ee).innerHTML="<a id='"+j+"' href='' disabled='disabled'></a><select id='"+j+"-\r\\' disabled='disabled'><option selected=''></option></select>",ee.querySelectorAll("[selected]").length||H.push("\\["+v+"*(?:value|"+X+")"),ee.querySelectorAll("[id~="+j+"-]").length||H.push("~="),ee.querySelectorAll("a#"+j+"+*").length||H.push(".#.+[+~]"),ee.querySelectorAll(":checked").length||H.push(":checked"),oe=P.createElement("input"),oe.setAttribute("type","hidden"),ee.appendChild(oe).setAttribute("name","D"),R.appendChild(ee).disabled=!0,ee.querySelectorAll(":disabled").length!==2&&H.push(":enabled",":disabled"),oe=P.createElement("input"),oe.setAttribute("name",""),ee.appendChild(oe),ee.querySelectorAll("[name='']").length||H.push("\\["+v+"*name"+v+"*="+v+`*(?:''|"")`)}),T.cssHas||H.push(":has"),H=H.length&&new RegExp(H.join("|")),se=function(ee,oe){if(ee===oe)return C=!0,0;var Ae=!ee.compareDocumentPosition-!oe.compareDocumentPosition;return Ae||(Ae=(ee.ownerDocument||ee)==(oe.ownerDocument||oe)?ee.compareDocumentPosition(oe):1,Ae&1||!T.sortDetached&&oe.compareDocumentPosition(ee)===Ae?ee===P||ee.ownerDocument==_&&J.contains(_,ee)?-1:oe===P||oe.ownerDocument==_&&J.contains(_,oe)?1:B?o.call(B,ee)-o.call(B,oe):0:Ae&4?-1:1)}),P}J.matches=function(F,q){return J(F,null,null,q)},J.matchesSelector=function(F,q){if(pt(F),O&&!ne[q+" "]&&(!H||!H.test(q)))try{var Z=$.call(F,q);if(Z||T.disconnectedMatch||F.document&&F.document.nodeType!==11)return Z}catch(ee){ne(q,!0)}return J(q,P,null,[F]).length>0},J.contains=function(F,q){return(F.ownerDocument||F)!=P&&pt(F),n.contains(F,q)},J.attr=function(F,q){(F.ownerDocument||F)!=P&&pt(F);var Z=I.attrHandle[q.toLowerCase()],ee=Z&&h.call(I.attrHandle,q.toLowerCase())?Z(F,q,!O):void 0;return ee!==void 0?ee:F.getAttribute(q)},J.error=function(F){throw new Error("Syntax error, unrecognized expression: "+F)},n.uniqueSort=function(F){var q,Z=[],ee=0,oe=0;if(C=!T.sortStable,B=!T.sortStable&&g.call(F,0),u.call(F,se),C){for(;q=F[oe++];)q===F[oe]&&(ee=Z.push(oe));for(;ee--;)d.call(F,Z[ee],1)}return B=null,F},n.fn.uniqueSort=function(){return this.pushStack(n.uniqueSort(g.apply(this)))},I=n.expr={cacheLength:50,createPseudo:he,match:xe,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(F){return F[1]=F[1].replace(tt,Me),F[3]=(F[3]||F[4]||F[5]||"").replace(tt,Me),F[2]==="~="&&(F[3]=" "+F[3]+" "),F.slice(0,4)},CHILD:function(F){return F[1]=F[1].toLowerCase(),F[1].slice(0,3)==="nth"?(F[3]||J.error(F[0]),F[4]=+(F[4]?F[5]+(F[6]||1):2*(F[3]==="even"||F[3]==="odd")),F[5]=+(F[7]+F[8]||F[3]==="odd")):F[3]&&J.error(F[0]),F},PSEUDO:function(F){var q,Z=!F[6]&&F[2];return xe.CHILD.test(F[0])?null:(F[3]?F[2]=F[4]||F[5]||"":Z&&Dt.test(Z)&&(q=Bt(Z,!0))&&(q=Z.indexOf(")",Z.length-q)-Z.length)&&(F[0]=F[0].slice(0,q),F[2]=Z.slice(0,q)),F.slice(0,3))}},filter:{TAG:function(F){var q=F.replace(tt,Me).toLowerCase();return F==="*"?function(){return!0}:function(Z){return p(Z,q)}},CLASS:function(F){var q=W[F+" "];return q||(q=new RegExp("(^|"+v+")"+F+"("+v+"|$)"))&&W(F,function(Z){return q.test(typeof Z.className=="string"&&Z.className||typeof Z.getAttribute!="undefined"&&Z.getAttribute("class")||"")})},ATTR:function(F,q,Z){return function(ee){var oe=J.attr(ee,F);return oe==null?q==="!=":q?(oe+="",q==="="?oe===Z:q==="!="?oe!==Z:q==="^="?Z&&oe.indexOf(Z)===0:q==="*="?Z&&oe.indexOf(Z)>-1:q==="$="?Z&&oe.slice(-Z.length)===Z:q==="~="?(" "+oe.replace(Be," ")+" ").indexOf(Z)>-1:q==="|="?oe===Z||oe.slice(0,Z.length+1)===Z+"-":!1):!0}},CHILD:function(F,q,Z,ee,oe){var Ae=F.slice(0,3)!=="nth",Se=F.slice(-4)!=="last",Re=q==="of-type";return ee===1&&oe===0?function(Ee){return!!Ee.parentNode}:function(Ee,$e,re){var ie,le,pe,Ie,je,Ne=Ae!==Se?"nextSibling":"previousSibling",lt=Ee.parentNode,St=Re&&Ee.nodeName.toLowerCase(),Ct=!re&&!Re,gt=!1;if(lt){if(Ae){for(;Ne;){for(pe=Ee;pe=pe[Ne];)if(Re?p(pe,St):pe.nodeType===1)return!1;je=Ne=F==="only"&&!je&&"nextSibling"}return!0}if(je=[Se?lt.firstChild:lt.lastChild],Se&&Ct){for(le=lt[j]||(lt[j]={}),ie=le[F]||[],Ie=ie[0]===G&&ie[1],gt=Ie&&ie[2],pe=Ie&&lt.childNodes[Ie];pe=++Ie&&pe&&pe[Ne]||(gt=Ie=0)||je.pop();)if(pe.nodeType===1&&++gt&&pe===Ee){le[F]=[G,Ie,gt];break}}else if(Ct&&(le=Ee[j]||(Ee[j]={}),ie=le[F]||[],Ie=ie[0]===G&&ie[1],gt=Ie),gt===!1)for(;(pe=++Ie&&pe&&pe[Ne]||(gt=Ie=0)||je.pop())&&!((Re?p(pe,St):pe.nodeType===1)&&++gt&&(Ct&&(le=pe[j]||(pe[j]={}),le[F]=[G,gt]),pe===Ee)););return gt-=oe,gt===ee||gt%ee===0&&gt/ee>=0}}},PSEUDO:function(F,q){var Z,ee=I.pseudos[F]||I.setFilters[F.toLowerCase()]||J.error("unsupported pseudo: "+F);return ee[j]?ee(q):ee.length>1?(Z=[F,F,"",q],I.setFilters.hasOwnProperty(F.toLowerCase())?he(function(oe,Ae){for(var Se,Re=ee(oe,q),Ee=Re.length;Ee--;)Se=o.call(oe,Re[Ee]),oe[Se]=!(Ae[Se]=Re[Ee])}):function(oe){return ee(oe,0,Z)}):ee}},pseudos:{not:he(function(F){var q=[],Z=[],ee=Tt(F.replace(b,"$1"));return ee[j]?he(function(oe,Ae,Se,Re){for(var Ee,$e=ee(oe,null,Re,[]),re=oe.length;re--;)(Ee=$e[re])&&(oe[re]=!(Ae[re]=Ee))}):function(oe,Ae,Se){return q[0]=oe,ee(q,null,Se,Z),q[0]=null,!Z.pop()}}),has:he(function(F){return function(q){return J(F,q).length>0}}),contains:he(function(F){return F=F.replace(tt,Me),function(q){return(q.textContent||n.text(q)).indexOf(F)>-1}}),lang:he(function(F){return fe.test(F||"")||J.error("unsupported lang: "+F),F=F.replace(tt,Me).toLowerCase(),function(q){var Z;do if(Z=O?q.lang:q.getAttribute("xml:lang")||q.getAttribute("lang"))return Z=Z.toLowerCase(),Z===F||Z.indexOf(F+"-")===0;while((q=q.parentNode)&&q.nodeType===1);return!1}}),target:function(F){var q=window.location&&window.location.hash;return q&&q.slice(1)===F.id},root:function(F){return F===R},focus:function(F){return F===Pe()&&P.hasFocus()&&!!(F.type||F.href||~F.tabIndex)},enabled:Ue(!1),disabled:Ue(!0),checked:function(F){return p(F,"input")&&!!F.checked||p(F,"option")&&!!F.selected},selected:function(F){return F.parentNode&&F.parentNode.selectedIndex,F.selected===!0},empty:function(F){for(F=F.firstChild;F;F=F.nextSibling)if(F.nodeType<6)return!1;return!0},parent:function(F){return!I.pseudos.empty(F)},header:function(F){return Le.test(F.nodeName)},input:function(F){return Te.test(F.nodeName)},button:function(F){return p(F,"input")&&F.type==="button"||p(F,"button")},text:function(F){var q;return p(F,"input")&&F.type==="text"&&((q=F.getAttribute("type"))==null||q.toLowerCase()==="text")},first:qe(function(){return[0]}),last:qe(function(F,q){return[q-1]}),eq:qe(function(F,q,Z){return[Z<0?Z+q:Z]}),even:qe(function(F,q){for(var Z=0;Z<q;Z+=2)F.push(Z);return F}),odd:qe(function(F,q){for(var Z=1;Z<q;Z+=2)F.push(Z);return F}),lt:qe(function(F,q,Z){var ee;for(Z<0?ee=Z+q:Z>q?ee=q:ee=Z;--ee>=0;)F.push(ee);return F}),gt:qe(function(F,q,Z){for(var ee=Z<0?Z+q:Z;++ee<q;)F.push(ee);return F})}},I.pseudos.nth=I.pseudos.eq;for(E in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})I.pseudos[E]=Oe(E);for(E in{submit:!0,reset:!0})I.pseudos[E]=Ve(E);function mt(){}mt.prototype=I.filters=I.pseudos,I.setFilters=new mt;function Bt(F,q){var Z,ee,oe,Ae,Se,Re,Ee,$e=U[F+" "];if($e)return q?0:$e.slice(0);for(Se=F,Re=[],Ee=I.preFilter;Se;){(!Z||(ee=st.exec(Se)))&&(ee&&(Se=Se.slice(ee[0].length)||Se),Re.push(oe=[])),Z=!1,(ee=bt.exec(Se))&&(Z=ee.shift(),oe.push({value:Z,type:ee[0].replace(b," ")}),Se=Se.slice(Z.length));for(Ae in I.filter)(ee=xe[Ae].exec(Se))&&(!Ee[Ae]||(ee=Ee[Ae](ee)))&&(Z=ee.shift(),oe.push({value:Z,type:Ae,matches:ee}),Se=Se.slice(Z.length));if(!Z)break}return q?Se.length:Se?J.error(F):U(F,Re).slice(0)}function kt(F){for(var q=0,Z=F.length,ee="";q<Z;q++)ee+=F[q].value;return ee}function Pt(F,q,Z){var ee=q.dir,oe=q.next,Ae=oe||ee,Se=Z&&Ae==="parentNode",Re=L++;return q.first?function(Ee,$e,re){for(;Ee=Ee[ee];)if(Ee.nodeType===1||Se)return F(Ee,$e,re);return!1}:function(Ee,$e,re){var ie,le,pe=[G,Re];if(re){for(;Ee=Ee[ee];)if((Ee.nodeType===1||Se)&&F(Ee,$e,re))return!0}else for(;Ee=Ee[ee];)if(Ee.nodeType===1||Se)if(le=Ee[j]||(Ee[j]={}),oe&&p(Ee,oe))Ee=Ee[ee]||Ee;else{if((ie=le[Ae])&&ie[0]===G&&ie[1]===Re)return pe[2]=ie[2];if(le[Ae]=pe,pe[2]=F(Ee,$e,re))return!0}return!1}}function fn(F){return F.length>1?function(q,Z,ee){for(var oe=F.length;oe--;)if(!F[oe](q,Z,ee))return!1;return!0}:F[0]}function dn(F,q,Z){for(var ee=0,oe=q.length;ee<oe;ee++)J(F,q[ee],Z);return Z}function Pn(F,q,Z,ee,oe){for(var Ae,Se=[],Re=0,Ee=F.length,$e=q!=null;Re<Ee;Re++)(Ae=F[Re])&&(!Z||Z(Ae,ee,oe))&&(Se.push(Ae),$e&&q.push(Re));return Se}function On(F,q,Z,ee,oe,Ae){return ee&&!ee[j]&&(ee=On(ee)),oe&&!oe[j]&&(oe=On(oe,Ae)),he(function(Se,Re,Ee,$e){var re,ie,le,pe,Ie=[],je=[],Ne=Re.length,lt=Se||dn(q||"*",Ee.nodeType?[Ee]:Ee,[]),St=F&&(Se||!q)?Pn(lt,Ie,F,Ee,$e):lt;if(Z?(pe=oe||(Se?F:Ne||ee)?[]:Re,Z(St,pe,Ee,$e)):pe=St,ee)for(re=Pn(pe,je),ee(re,[],Ee,$e),ie=re.length;ie--;)(le=re[ie])&&(pe[je[ie]]=!(St[je[ie]]=le));if(Se){if(oe||F){if(oe){for(re=[],ie=pe.length;ie--;)(le=pe[ie])&&re.push(St[ie]=le);oe(null,pe=[],re,$e)}for(ie=pe.length;ie--;)(le=pe[ie])&&(re=oe?o.call(Se,le):Ie[ie])>-1&&(Se[re]=!(Re[re]=le))}}else pe=Pn(pe===Re?pe.splice(Ne,pe.length):pe),oe?oe(null,Re,pe,$e):D.apply(Re,pe)})}function Ft(F){for(var q,Z,ee,oe=F.length,Ae=I.relative[F[0].type],Se=Ae||I.relative[" "],Re=Ae?1:0,Ee=Pt(function(ie){return ie===q},Se,!0),$e=Pt(function(ie){return o.call(q,ie)>-1},Se,!0),re=[function(ie,le,pe){var Ie=!Ae&&(pe||le!=N)||((q=le).nodeType?Ee(ie,le,pe):$e(ie,le,pe));return q=null,Ie}];Re<oe;Re++)if(Z=I.relative[F[Re].type])re=[Pt(fn(re),Z)];else{if(Z=I.filter[F[Re].type].apply(null,F[Re].matches),Z[j]){for(ee=++Re;ee<oe&&!I.relative[F[ee].type];ee++);return On(Re>1&&fn(re),Re>1&&kt(F.slice(0,Re-1).concat({value:F[Re-2].type===" "?"*":""})).replace(b,"$1"),Z,Re<ee&&Ft(F.slice(Re,ee)),ee<oe&&Ft(F=F.slice(ee)),ee<oe&&kt(F))}re.push(Z)}return fn(re)}function Bn(F,q){var Z=q.length>0,ee=F.length>0,oe=function(Ae,Se,Re,Ee,$e){var re,ie,le,pe=0,Ie="0",je=Ae&&[],Ne=[],lt=N,St=Ae||ee&&I.find.TAG("*",$e),Ct=G+=lt==null?1:Math.random()||.1,gt=St.length;for($e&&(N=Se==P||Se||$e);Ie!==gt&&(re=St[Ie])!=null;Ie++){if(ee&&re){for(ie=0,!Se&&re.ownerDocument!=P&&(pt(re),Re=!O);le=F[ie++];)if(le(re,Se||P,Re)){D.call(Ee,re);break}$e&&(G=Ct)}Z&&((re=!le&&re)&&pe--,Ae&&je.push(re))}if(pe+=Ie,Z&&Ie!==pe){for(ie=0;le=q[ie++];)le(je,Ne,Se,Re);if(Ae){if(pe>0)for(;Ie--;)je[Ie]||Ne[Ie]||(Ne[Ie]=y.call(Ee));Ne=Pn(Ne)}D.apply(Ee,Ne),$e&&!Ae&&Ne.length>0&&pe+q.length>1&&n.uniqueSort(Ee)}return $e&&(G=Ct,N=lt),je};return Z?he(oe):oe}function Tt(F,q){var Z,ee=[],oe=[],Ae=Q[F+" "];if(!Ae){for(q||(q=Bt(F)),Z=q.length;Z--;)Ae=Ft(q[Z]),Ae[j]?ee.push(Ae):oe.push(Ae);Ae=Q(F,Bn(oe,ee)),Ae.selector=F}return Ae}function Fn(F,q,Z,ee){var oe,Ae,Se,Re,Ee,$e=typeof F=="function"&&F,re=!ee&&Bt(F=$e.selector||F);if(Z=Z||[],re.length===1){if(Ae=re[0]=re[0].slice(0),Ae.length>2&&(Se=Ae[0]).type==="ID"&&q.nodeType===9&&O&&I.relative[Ae[1].type]){if(q=(I.find.ID(Se.matches[0].replace(tt,Me),q)||[])[0],q)$e&&(q=q.parentNode);else return Z;F=F.slice(Ae.shift().value.length)}for(oe=xe.needsContext.test(F)?0:Ae.length;oe--&&(Se=Ae[oe],!I.relative[Re=Se.type]);)if((Ee=I.find[Re])&&(ee=Ee(Se.matches[0].replace(tt,Me),Ut.test(Ae[0].type)&&et(q.parentNode)||q))){if(Ae.splice(oe,1),F=ee.length&&kt(Ae),!F)return D.apply(Z,ee),Z;break}}return($e||Tt(F,re))(ee,q,!O,Z,!q||Ut.test(F)&&et(q.parentNode)||q),Z}T.sortStable=j.split("").sort(se).join("")===j,pt(),T.sortDetached=ye(function(F){return F.compareDocumentPosition(P.createElement("fieldset"))&1}),n.find=J,n.expr[":"]=n.expr.pseudos,n.unique=n.uniqueSort,J.compile=Tt,J.select=Fn,J.setDocument=pt,J.tokenize=Bt,J.escape=n.escapeSelector,J.getText=n.text,J.isXML=n.isXMLDoc,J.selectors=n.expr,J.support=n.support,J.uniqueSort=n.uniqueSort})()}.apply(m,l),i!==void 0&&(w.exports=i)},4560:(w,m,r)=>{var l,i;l=[r(8411),r(5744),r(9229)],i=function(n,p){"use strict";function f(c,o,h,y,s){return new f.prototype.init(c,o,h,y,s)}n.Tween=f,f.prototype={constructor:f,init:function(c,o,h,y,s,g){this.elem=c,this.prop=h,this.easing=s||n.easing._default,this.options=o,this.start=this.now=this.cur(),this.end=y,this.unit=g||(n.cssNumber[h]?"":"px")},cur:function(){var c=f.propHooks[this.prop];return c&&c.get?c.get(this):f.propHooks._default.get(this)},run:function(c){var o,h=f.propHooks[this.prop];return this.options.duration?this.pos=o=n.easing[this.easing](c,this.options.duration*c,0,1,this.options.duration):this.pos=o=c,this.now=(this.end-this.start)*o+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),h&&h.set?h.set(this):f.propHooks._default.set(this),this}},f.prototype.init.prototype=f.prototype,f.propHooks={_default:{get:function(c){var o;return c.elem.nodeType!==1||c.elem[c.prop]!=null&&c.elem.style[c.prop]==null?c.elem[c.prop]:(o=n.css(c.elem,c.prop,""),!o||o==="auto"?0:o)},set:function(c){n.fx.step[c.prop]?n.fx.step[c.prop](c):c.elem.nodeType===1&&(n.cssHooks[c.prop]||c.elem.style[p(c.prop)]!=null)?n.style(c.elem,c.prop,c.now+c.unit):c.elem[c.prop]=c.now}}},f.propHooks.scrollTop=f.propHooks.scrollLeft={set:function(c){c.elem.nodeType&&c.elem.parentNode&&(c.elem[c.prop]=c.now)}},n.easing={linear:function(c){return c},swing:function(c){return .5-Math.cos(c*Math.PI)/2},_default:"swing"},n.fx=f.prototype.init,n.fx.step={}}.apply(m,l),i!==void 0&&(w.exports=i)},4641:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)===0;w.exports=i},4733:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.indexOf}.apply(m,l),i!==void 0&&(w.exports=i)},4773:(w,m,r)=>{var l,i;l=[r(8543),r(107)],i=function(n,p){"use strict";return function(){var f=n.createDocumentFragment(),c=f.appendChild(n.createElement("div")),o=n.createElement("input");o.setAttribute("type","radio"),o.setAttribute("checked","checked"),o.setAttribute("name","t"),c.appendChild(o),p.checkClone=c.cloneNode(!0).cloneNode(!0).lastChild.checked,c.innerHTML="<textarea>x</textarea>",p.noCloneChecked=!!c.cloneNode(!0).lastChild.defaultValue,c.innerHTML="<option></option>",p.option=!!c.lastChild}(),p}.apply(m,l),i!==void 0&&(w.exports=i)},4784:()=>{(function(w){function m(o){return RegExp("(^(?:"+o+"):[ 	]*(?![ 	]))[^]+","i")}w.languages.http={"request-line":{pattern:/^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,inside:{method:{pattern:/^[A-Z]+\b/,alias:"property"},"request-target":{pattern:/^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,lookbehind:!0,alias:"url",inside:w.languages.uri},"http-version":{pattern:/^(\s)HTTP\/[\d.]+/,lookbehind:!0,alias:"property"}}},"response-status":{pattern:/^HTTP\/[\d.]+ \d+ .+/m,inside:{"http-version":{pattern:/^HTTP\/[\d.]+/,alias:"property"},"status-code":{pattern:/^(\s)\d+(?=\s)/,lookbehind:!0,alias:"number"},"reason-phrase":{pattern:/^(\s).+/,lookbehind:!0,alias:"string"}}},header:{pattern:/^[\w-]+:.+(?:(?:\r\n?|\n)[ \t].+)*/m,inside:{"header-value":[{pattern:m(/Content-Security-Policy/.source),lookbehind:!0,alias:["csp","languages-csp"],inside:w.languages.csp},{pattern:m(/Public-Key-Pins(?:-Report-Only)?/.source),lookbehind:!0,alias:["hpkp","languages-hpkp"],inside:w.languages.hpkp},{pattern:m(/Strict-Transport-Security/.source),lookbehind:!0,alias:["hsts","languages-hsts"],inside:w.languages.hsts},{pattern:m(/[^:]+/.source),lookbehind:!0}],"header-name":{pattern:/^[^:]+/,alias:"keyword"},punctuation:/^:/}}};var r=w.languages,l={"application/javascript":r.javascript,"application/json":r.json||r.javascript,"application/xml":r.xml,"text/xml":r.xml,"text/html":r.html,"text/css":r.css,"text/plain":r.plain},i={"application/json":!0,"application/xml":!0};function n(o){var h=o.replace(/^[a-z]+\//,""),y="\\w+/(?:[\\w.-]+\\+)+"+h+"(?![+\\w.-])";return"(?:"+o+"|"+y+")"}var p;for(var f in l)if(l[f]){p=p||{};var c=i[f]?n(f):f;p[f.replace(/\//g,"-")]={pattern:RegExp("("+/content-type:\s*/.source+c+/(?:(?:\r\n?|\n)[\w-].*)*(?:\r(?:\n|(?!\n))|\n)/.source+")"+/[^ \t\w-][\s\S]*/.source,"i"),lookbehind:!0,inside:l[f]}}p&&w.languages.insertBefore("http","header",p)})(Prism)},4856:()=>{+function(w){"use strict";var m=function(i,n){this.init("popover",i,n)};if(!w.fn.tooltip)throw new Error("Popover requires tooltip.js");m.VERSION="3.4.1",m.DEFAULTS=w.extend({},w.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),m.prototype=w.extend({},w.fn.tooltip.Constructor.prototype),m.prototype.constructor=m,m.prototype.getDefaults=function(){return m.DEFAULTS},m.prototype.setContent=function(){var i=this.tip(),n=this.getTitle(),p=this.getContent();if(this.options.html){var f=typeof p;this.options.sanitize&&(n=this.sanitizeHtml(n),f==="string"&&(p=this.sanitizeHtml(p))),i.find(".popover-title").html(n),i.find(".popover-content").children().detach().end()[f==="string"?"html":"append"](p)}else i.find(".popover-title").text(n),i.find(".popover-content").children().detach().end().text(p);i.removeClass("fade top bottom left right in"),i.find(".popover-title").html()||i.find(".popover-title").hide()},m.prototype.hasContent=function(){return this.getTitle()||this.getContent()},m.prototype.getContent=function(){var i=this.$element,n=this.options;return i.attr("data-content")||(typeof n.content=="function"?n.content.call(i[0]):n.content)},m.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};function r(i){return this.each(function(){var n=w(this),p=n.data("bs.popover"),f=typeof i=="object"&&i;!p&&/destroy|hide/.test(i)||(p||n.data("bs.popover",p=new m(this,f)),typeof i=="string"&&p[i]())})}var l=w.fn.popover;w.fn.popover=r,w.fn.popover.Constructor=m,w.fn.popover.noConflict=function(){return w.fn.popover=l,this}}(jQuery)},4895:(w,m,r)=>{var l,i;l=[r(8411),r(107),r(9978)],i=function(n,p){"use strict";n.ajaxSettings.xhr=function(){try{return new window.XMLHttpRequest}catch(o){}};var f={0:200,1223:204},c=n.ajaxSettings.xhr();p.cors=!!c&&"withCredentials"in c,p.ajax=c=!!c,n.ajaxTransport(function(o){var h,y;if(p.cors||c&&!o.crossDomain)return{send:function(s,g){var u,d=o.xhr();if(d.open(o.type,o.url,o.async,o.username,o.password),o.xhrFields)for(u in o.xhrFields)d[u]=o.xhrFields[u];o.mimeType&&d.overrideMimeType&&d.overrideMimeType(o.mimeType),!o.crossDomain&&!s["X-Requested-With"]&&(s["X-Requested-With"]="XMLHttpRequest");for(u in s)d.setRequestHeader(u,s[u]);h=function(v){return function(){h&&(h=y=d.onload=d.onerror=d.onabort=d.ontimeout=d.onreadystatechange=null,v==="abort"?d.abort():v==="error"?typeof d.status!="number"?g(0,"error"):g(d.status,d.statusText):g(f[d.status]||d.status,d.statusText,(d.responseType||"text")!=="text"||typeof d.responseText!="string"?{binary:d.response}:{text:d.responseText},d.getAllResponseHeaders()))}},d.onload=h(),y=d.onerror=d.ontimeout=h("error"),d.onabort!==void 0?d.onabort=y:d.onreadystatechange=function(){d.readyState===4&&window.setTimeout(function(){h&&y()})},h=h("abort");try{d.send(o.hasContent&&o.data||null)}catch(v){if(h)throw v}},abort:function(){h&&h()}}})}.apply(m,l),i!==void 0&&(w.exports=i)},4912:()=>{+function(w){"use strict";var m=".dropdown-backdrop",r='[data-toggle="dropdown"]',l=function(c){w(c).on("click.bs.dropdown",this.toggle)};l.VERSION="3.4.1";function i(c){var o=c.attr("data-target");o||(o=c.attr("href"),o=o&&/#[A-Za-z]/.test(o)&&o.replace(/.*(?=#[^\s]*$)/,""));var h=o!=="#"?w(document).find(o):null;return h&&h.length?h:c.parent()}function n(c){c&&c.which===3||(w(m).remove(),w(r).each(function(){var o=w(this),h=i(o),y={relatedTarget:this};h.hasClass("open")&&(c&&c.type=="click"&&/input|textarea/i.test(c.target.tagName)&&w.contains(h[0],c.target)||(h.trigger(c=w.Event("hide.bs.dropdown",y)),!c.isDefaultPrevented()&&(o.attr("aria-expanded","false"),h.removeClass("open").trigger(w.Event("hidden.bs.dropdown",y)))))}))}l.prototype.toggle=function(c){var o=w(this);if(!o.is(".disabled, :disabled")){var h=i(o),y=h.hasClass("open");if(n(),!y){"ontouchstart"in document.documentElement&&!h.closest(".navbar-nav").length&&w(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(w(this)).on("click",n);var s={relatedTarget:this};if(h.trigger(c=w.Event("show.bs.dropdown",s)),c.isDefaultPrevented())return;o.trigger("focus").attr("aria-expanded","true"),h.toggleClass("open").trigger(w.Event("shown.bs.dropdown",s))}return!1}},l.prototype.keydown=function(c){if(!(!/(38|40|27|32)/.test(c.which)||/input|textarea/i.test(c.target.tagName))){var o=w(this);if(c.preventDefault(),c.stopPropagation(),!o.is(".disabled, :disabled")){var h=i(o),y=h.hasClass("open");if(!y&&c.which!=27||y&&c.which==27)return c.which==27&&h.find(r).trigger("focus"),o.trigger("click");var s=" li:not(.disabled):visible a",g=h.find(".dropdown-menu"+s);if(g.length){var u=g.index(c.target);c.which==38&&u>0&&u--,c.which==40&&u<g.length-1&&u++,~u||(u=0),g.eq(u).trigger("focus")}}}};function p(c){return this.each(function(){var o=w(this),h=o.data("bs.dropdown");h||o.data("bs.dropdown",h=new l(this)),typeof c=="string"&&h[c].call(o)})}var f=w.fn.dropdown;w.fn.dropdown=p,w.fn.dropdown.Constructor=l,w.fn.dropdown.noConflict=function(){return w.fn.dropdown=f,this},w(document).on("click.bs.dropdown.data-api",n).on("click.bs.dropdown.data-api",".dropdown form",function(c){c.stopPropagation()}).on("click.bs.dropdown.data-api",r,l.prototype.toggle).on("keydown.bs.dropdown.data-api",r,l.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",l.prototype.keydown)}(jQuery)},5032:(w,m,r)=>{"use strict";const l=r(8311),i=r(3904),{ANY:n}=i,p=r(7638),f=r(560),c=(u,d,v={})=>{if(u===d)return!0;u=new l(u,v),d=new l(d,v);let b=!1;e:for(const T of u.set){for(const _ of d.set){const A=y(T,_,v);if(b=b||A!==null,A)continue e}if(b)return!1}return!0},o=[new i(">=0.0.0-0")],h=[new i(">=0.0.0")],y=(u,d,v)=>{if(u===d)return!0;if(u.length===1&&u[0].semver===n){if(d.length===1&&d[0].semver===n)return!0;v.includePrerelease?u=o:u=h}if(d.length===1&&d[0].semver===n){if(v.includePrerelease)return!0;d=h}const b=new Set;let T,_;for(const P of u)P.operator===">"||P.operator===">="?T=s(T,P,v):P.operator==="<"||P.operator==="<="?_=g(_,P,v):b.add(P.semver);if(b.size>1)return null;let A;if(T&&_){if(A=f(T.semver,_.semver,v),A>0)return null;if(A===0&&(T.operator!==">="||_.operator!=="<="))return null}for(const P of b){if(T&&!p(P,String(T),v)||_&&!p(P,String(_),v))return null;for(const R of d)if(!p(P,String(R),v))return!1;return!0}let E,I,N,B,C=_&&!v.includePrerelease&&_.semver.prerelease.length?_.semver:!1,D=T&&!v.includePrerelease&&T.semver.prerelease.length?T.semver:!1;C&&C.prerelease.length===1&&_.operator==="<"&&C.prerelease[0]===0&&(C=!1);for(const P of d){if(B=B||P.operator===">"||P.operator===">=",N=N||P.operator==="<"||P.operator==="<=",T){if(D&&P.semver.prerelease&&P.semver.prerelease.length&&P.semver.major===D.major&&P.semver.minor===D.minor&&P.semver.patch===D.patch&&(D=!1),P.operator===">"||P.operator===">="){if(E=s(T,P,v),E===P&&E!==T)return!1}else if(T.operator===">="&&!p(T.semver,String(P),v))return!1}if(_){if(C&&P.semver.prerelease&&P.semver.prerelease.length&&P.semver.major===C.major&&P.semver.minor===C.minor&&P.semver.patch===C.patch&&(C=!1),P.operator==="<"||P.operator==="<="){if(I=g(_,P,v),I===P&&I!==_)return!1}else if(_.operator==="<="&&!p(_.semver,String(P),v))return!1}if(!P.operator&&(_||T)&&A!==0)return!1}return!(T&&N&&!_&&A!==0||_&&B&&!T&&A!==0||D||C)},s=(u,d,v)=>{if(!u)return d;const b=f(u.semver,d.semver,v);return b>0?u:b<0||d.operator===">"&&u.operator===">="?d:u},g=(u,d,v)=>{if(!u)return d;const b=f(u.semver,d.semver,v);return b<0?u:b>0||d.operator==="<"&&u.operator==="<="?d:u};w.exports=c},5033:(w,m,r)=>{"use strict";const l=r(144),i=(n,p)=>{const f=l(n.trim().replace(/^[=v]+/,""),p);return f?f.version:null};w.exports=i},5194:(w,m,r)=>{var l,i;l=[r(8411),r(7623),r(685)],i=function(n,p){"use strict";var f=function(o){return n.contains(o.ownerDocument,o)},c={composed:!0};return p.getRootNode&&(f=function(o){return n.contains(o.ownerDocument,o)||o.getRootNode(c)===o.ownerDocument}),f}.apply(m,l),i!==void 0&&(w.exports=i)},5200:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)<=0;w.exports=i},5342:(w,m,r)=>{"use strict";const l=r(7075),i=(n,p,f)=>l(n,p,"<",f);w.exports=i},5547:(w,m,r)=>{var l,i;l=[r(8411),r(4553),r(2512)],i=function(n){"use strict";n.expr.pseudos.animated=function(p){return n.grep(n.timers,function(f){return p===f.elem}).length}}.apply(m,l),i!==void 0&&(w.exports=i)},5549:(w,m,r)=>{var l,i;l=[r(8411),r(6439),r(5933),r(9142),r(7065)],i=function(n){"use strict";return n}.apply(m,l),i!==void 0&&(w.exports=i)},5571:(w,m,r)=>{"use strict";const l=r(7075),i=(n,p,f)=>l(n,p,">",f);w.exports=i},5580:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)>0;w.exports=i},5581:(w,m,r)=>{var l,i;l=[r(8543),r(107)],i=function(n,p){"use strict";return function(){var f=n.createElement("input"),c=n.createElement("select"),o=c.appendChild(n.createElement("option"));f.type="checkbox",p.checkOn=f.value!=="",p.optSelected=o.selected,f=n.createElement("input"),f.value="t",f.type="radio",p.radioValue=f.value==="t"}(),p}.apply(m,l),i!==void 0&&(w.exports=i)},5744:(w,m,r)=>{var l,i;l=[r(8543),r(8411)],i=function(n,p){"use strict";var f=["Webkit","Moz","ms"],c=n.createElement("div").style,o={};function h(s){for(var g=s[0].toUpperCase()+s.slice(1),u=f.length;u--;)if(s=f[u]+g,s in c)return s}function y(s){var g=p.cssProps[s]||o[s];return g||(s in c?s:o[s]=h(s)||s)}return y}.apply(m,l),i!==void 0&&(w.exports=i)},5748:(w,m,r)=>{var l,i;l=[r(8411),r(403)],i=function(n,p){"use strict";function f(c,o,h,y){var s,g,u=20,d=y?function(){return y.cur()}:function(){return n.css(c,o,"")},v=d(),b=h&&h[3]||(n.cssNumber[o]?"":"px"),T=c.nodeType&&(n.cssNumber[o]||b!=="px"&&+v)&&p.exec(n.css(c,o));if(T&&T[3]!==b){for(v=v/2,b=b||T[3],T=+v||1;u--;)n.style(c,o,T+b),(1-g)*(1-(g=d()/v||.5))<=0&&(u=0),T=T/g;T=T*2,n.style(c,o,T+b),h=h||[]}return h&&(T=+T||+v||0,s=h[1]?T+(h[1]+1)*h[2]:+h[2],y&&(y.unit=b,y.start=T,y.end=s)),s}return f}.apply(m,l),i!==void 0&&(w.exports=i)},5780:(w,m,r)=>{var l;l=function(){"use strict";return window.location}.call(m,r,m,w),l!==void 0&&(w.exports=l)},5850:(w,m,r)=>{var l,i;l=[r(8411),r(6599)],i=function(n){"use strict";var p=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;n.Deferred.exceptionHook=function(f,c){window.console&&window.console.warn&&f&&p.test(f.name)&&window.console.warn("jQuery.Deferred exception: "+f.message,f.stack,c)}}.apply(m,l),i!==void 0&&(w.exports=i)},5868:(w,m,r)=>{var l,i;l=[r(8411),r(1382),r(9340),r(7957),r(2569)],i=function(n,p){"use strict";return n.fn.extend({wrapAll:function(f){var c;return this[0]&&(p(f)&&(f=f.call(this[0])),c=n(f,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&c.insertBefore(this[0]),c.map(function(){for(var o=this;o.firstElementChild;)o=o.firstElementChild;return o}).append(this)),this},wrapInner:function(f){return p(f)?this.each(function(c){n(this).wrapInner(f.call(this,c))}):this.each(function(){var c=n(this),o=c.contents();o.length?o.wrapAll(f):c.append(f)})},wrap:function(f){var c=p(f);return this.each(function(o){n(this).wrapAll(c?f.call(this,o):f)})},unwrap:function(f){return this.parent(f).not("body").each(function(){n(this).replaceWith(this.childNodes)}),this}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},5933:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(5581),r(4553)],i=function(n,p,f){"use strict";var c=/^(?:input|select|textarea|button)$/i,o=/^(?:a|area)$/i;n.fn.extend({prop:function(h,y){return p(this,n.prop,h,y,arguments.length>1)},removeProp:function(h){return this.each(function(){delete this[n.propFix[h]||h]})}}),n.extend({prop:function(h,y,s){var g,u,d=h.nodeType;if(!(d===3||d===8||d===2))return(d!==1||!n.isXMLDoc(h))&&(y=n.propFix[y]||y,u=n.propHooks[y]),s!==void 0?u&&"set"in u&&(g=u.set(h,s,y))!==void 0?g:h[y]=s:u&&"get"in u&&(g=u.get(h,y))!==null?g:h[y]},propHooks:{tabIndex:{get:function(h){var y=n.find.attr(h,"tabindex");return y?parseInt(y,10):c.test(h.nodeName)||o.test(h.nodeName)&&h.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),f.optSelected||(n.propHooks.selected={get:function(h){var y=h.parentNode;return y&&y.parentNode&&y.parentNode.selectedIndex,null},set:function(h){var y=h.parentNode;y&&(y.selectedIndex,y.parentNode&&y.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this})}.apply(m,l),i!==void 0&&(w.exports=i)},5950:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.slice}.apply(m,l),i!==void 0&&(w.exports=i)},6170:(w,m,r)=>{"use strict";const l=r(3908),i=r(144),{safeRe:n,t:p}=r(9718),f=(c,o)=>{if(c instanceof l)return c;if(typeof c=="number"&&(c=String(c)),typeof c!="string")return null;o=o||{};let h=null;if(!o.rtl)h=c.match(o.includePrerelease?n[p.COERCEFULL]:n[p.COERCE]);else{const v=o.includePrerelease?n[p.COERCERTLFULL]:n[p.COERCERTL];let b;for(;(b=v.exec(c))&&(!h||h.index+h[0].length!==c.length);)(!h||b.index+b[0].length!==h.index+h[0].length)&&(h=b),v.lastIndex=b.index+b[1].length+b[2].length;v.lastIndex=-1}if(h===null)return null;const y=h[2],s=h[3]||"0",g=h[4]||"0",u=o.includePrerelease&&h[5]?`-${h[5]}`:"",d=o.includePrerelease&&h[6]?`+${h[6]}`:"";return i(`${y}.${s}.${g}${u}${d}`,o)};w.exports=f},6254:(w,m,r)=>{"use strict";const l=r(3908),i=(n,p)=>new l(n,p).minor;w.exports=i},6353:(w,m,r)=>{var l,i;l=[r(8411),r(9773),r(9758),r(8519),r(1382),r(7346),r(5950),r(6962),r(2738)],i=function(n,p,f,c,o,h,y){"use strict";var s=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;n.proxy=function(g,u){var d,v,b;if(typeof u=="string"&&(d=g[u],u=g,g=d),!!o(g))return v=y.call(arguments,2),b=function(){return g.apply(u||this,v.concat(y.call(arguments)))},b.guid=g.guid=g.guid||n.guid++,b},n.holdReady=function(g){g?n.readyWait++:n.ready(!0)},n.isArray=Array.isArray,n.parseJSON=JSON.parse,n.nodeName=p,n.isFunction=o,n.isWindow=h,n.camelCase=f,n.type=c,n.now=Date.now,n.isNumeric=function(g){var u=n.type(g);return(u==="number"||u==="string")&&!isNaN(g-parseFloat(g))},n.trim=function(g){return g==null?"":(g+"").replace(s,"$1")}}.apply(m,l),i!==void 0&&(w.exports=i)},6439:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(9773),r(5581),r(9091),r(4553)],i=function(n,p,f,c,o){"use strict";var h,y=n.expr.attrHandle;n.fn.extend({attr:function(s,g){return p(this,n.attr,s,g,arguments.length>1)},removeAttr:function(s){return this.each(function(){n.removeAttr(this,s)})}}),n.extend({attr:function(s,g,u){var d,v,b=s.nodeType;if(!(b===3||b===8||b===2)){if(typeof s.getAttribute=="undefined")return n.prop(s,g,u);if((b!==1||!n.isXMLDoc(s))&&(v=n.attrHooks[g.toLowerCase()]||(n.expr.match.bool.test(g)?h:void 0)),u!==void 0){if(u===null){n.removeAttr(s,g);return}return v&&"set"in v&&(d=v.set(s,u,g))!==void 0?d:(s.setAttribute(g,u+""),u)}return v&&"get"in v&&(d=v.get(s,g))!==null?d:(d=n.find.attr(s,g),d==null?void 0:d)}},attrHooks:{type:{set:function(s,g){if(!c.radioValue&&g==="radio"&&f(s,"input")){var u=s.value;return s.setAttribute("type",g),u&&(s.value=u),g}}}},removeAttr:function(s,g){var u,d=0,v=g&&g.match(o);if(v&&s.nodeType===1)for(;u=v[d++];)s.removeAttribute(u)}}),h={set:function(s,g,u){return g===!1?n.removeAttr(s,u):s.setAttribute(u,u),u}},n.each(n.expr.match.bool.source.match(/\w+/g),function(s,g){var u=y[g]||n.find.attr;y[g]=function(d,v,b){var T,_,A=v.toLowerCase();return b||(_=y[A],y[A]=T,T=u(d,v,b)!=null?A:null,y[A]=_),T}})}.apply(m,l),i!==void 0&&(w.exports=i)},6599:(w,m,r)=>{var l,i;l=[r(8411),r(1382),r(5950),r(3682)],i=function(n,p,f){"use strict";function c(y){return y}function o(y){throw y}function h(y,s,g,u){var d;try{y&&p(d=y.promise)?d.call(y).done(s).fail(g):y&&p(d=y.then)?d.call(y,s,g):s.apply(void 0,[y].slice(u))}catch(v){g.apply(void 0,[v])}}return n.extend({Deferred:function(y){var s=[["notify","progress",n.Callbacks("memory"),n.Callbacks("memory"),2],["resolve","done",n.Callbacks("once memory"),n.Callbacks("once memory"),0,"resolved"],["reject","fail",n.Callbacks("once memory"),n.Callbacks("once memory"),1,"rejected"]],g="pending",u={state:function(){return g},always:function(){return d.done(arguments).fail(arguments),this},catch:function(v){return u.then(null,v)},pipe:function(){var v=arguments;return n.Deferred(function(b){n.each(s,function(T,_){var A=p(v[_[4]])&&v[_[4]];d[_[1]](function(){var E=A&&A.apply(this,arguments);E&&p(E.promise)?E.promise().progress(b.notify).done(b.resolve).fail(b.reject):b[_[0]+"With"](this,A?[E]:arguments)})}),v=null}).promise()},then:function(v,b,T){var _=0;function A(E,I,N,B){return function(){var C=this,D=arguments,P=function(){var O,H;if(!(E<_)){if(O=N.apply(C,D),O===I.promise())throw new TypeError("Thenable self-resolution");H=O&&(typeof O=="object"||typeof O=="function")&&O.then,p(H)?B?H.call(O,A(_,I,c,B),A(_,I,o,B)):(_++,H.call(O,A(_,I,c,B),A(_,I,o,B),A(_,I,c,I.notifyWith))):(N!==c&&(C=void 0,D=[O]),(B||I.resolveWith)(C,D))}},R=B?P:function(){try{P()}catch(O){n.Deferred.exceptionHook&&n.Deferred.exceptionHook(O,R.error),E+1>=_&&(N!==o&&(C=void 0,D=[O]),I.rejectWith(C,D))}};E?R():(n.Deferred.getErrorHook?R.error=n.Deferred.getErrorHook():n.Deferred.getStackHook&&(R.error=n.Deferred.getStackHook()),window.setTimeout(R))}}return n.Deferred(function(E){s[0][3].add(A(0,E,p(T)?T:c,E.notifyWith)),s[1][3].add(A(0,E,p(v)?v:c)),s[2][3].add(A(0,E,p(b)?b:o))}).promise()},promise:function(v){return v!=null?n.extend(v,u):u}},d={};return n.each(s,function(v,b){var T=b[2],_=b[5];u[b[1]]=T.add,_&&T.add(function(){g=_},s[3-v][2].disable,s[3-v][3].disable,s[0][2].lock,s[0][3].lock),T.add(b[3].fire),d[b[0]]=function(){return d[b[0]+"With"](this===d?void 0:this,arguments),this},d[b[0]+"With"]=T.fireWith}),u.promise(d),y&&y.call(d,d),d},when:function(y){var s=arguments.length,g=s,u=Array(g),d=f.call(arguments),v=n.Deferred(),b=function(T){return function(_){u[T]=this,d[T]=arguments.length>1?f.call(arguments):_,--s||v.resolveWith(u,d)}};if(s<=1&&(h(y,v.done(b(g)).resolve,v.reject,!s),v.state()==="pending"||p(d[g]&&d[g].then)))return v.then();for(;g--;)h(d[g],b(g),v.reject);return v.promise()}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},6756:(w,m,r)=>{var l,i;l=[r(8411),r(8519),r(1382)],i=function(n,p,f){"use strict";var c=function(o,h,y,s,g,u,d){var v=0,b=o.length,T=y==null;if(p(y)==="object"){g=!0;for(v in y)c(o,h,v,y[v],!0,u,d)}else if(s!==void 0&&(g=!0,f(s)||(d=!0),T&&(d?(h.call(o,s),h=null):(T=h,h=function(_,A,E){return T.call(n(_),E)})),h))for(;v<b;v++)h(o[v],y,d?s:s.call(o[v],v,h(o[v],y)));return g?o:T?h.call(o):b?h(o[0],y):u};return c}.apply(m,l),i!==void 0&&(w.exports=i)},6780:(w,m,r)=>{"use strict";const l=r(8311),i=(n,p,f)=>(n=new l(n,f),p=new l(p,f),n.intersects(p,f));w.exports=i},6874:w=>{"use strict";const m="2.0.0",l=Number.MAX_SAFE_INTEGER||9007199254740991,i=16,n=256-6,p=["major","premajor","minor","preminor","patch","prepatch","prerelease"];w.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:i,MAX_SAFE_BUILD_LENGTH:n,MAX_SAFE_INTEGER:l,RELEASE_TYPES:p,SEMVER_SPEC_VERSION:m,FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}},6953:(w,m,r)=>{"use strict";const l=r(144),i=(n,p)=>{const f=l(n,p);return f?f.version:null};w.exports=i},6962:(w,m,r)=>{var l,i;l=[r(8411),r(9978),r(8926)],i=function(n){"use strict";n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(p,f){n.fn[f]=function(c){return this.on(f,c)}})}.apply(m,l),i!==void 0&&(w.exports=i)},7022:()=>{(function(w){var m="\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b",r={pattern:/(^(["']?)\w+\2)[ \t]+\S.*/,lookbehind:!0,alias:"punctuation",inside:null},l={bash:r,environment:{pattern:RegExp("\\$"+m),alias:"constant"},variable:[{pattern:/\$?\(\([\s\S]+?\)\)/,greedy:!0,inside:{variable:[{pattern:/(^\$\(\([\s\S]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,operator:/--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,greedy:!0,inside:{variable:/^\$\(|^`|\)$|`$/}},{pattern:/\$\{[^}]+\}/,greedy:!0,inside:{operator:/:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,punctuation:/[\[\]]/,environment:{pattern:RegExp("(\\{)"+m),lookbehind:!0,alias:"constant"}}},/\$(?:\w+|[#?*!@$])/],entity:/\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/};w.languages.bash={shebang:{pattern:/^#!\s*\/.*/,alias:"important"},comment:{pattern:/(^|[^"{\\$])#.*/,lookbehind:!0},"function-name":[{pattern:/(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,lookbehind:!0,alias:"function"},{pattern:/\b[\w-]+(?=\s*\(\s*\)\s*\{)/,alias:"function"}],"for-or-select":{pattern:/(\b(?:for|select)\s+)\w+(?=\s+in\s)/,alias:"variable",lookbehind:!0},"assign-left":{pattern:/(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,inside:{environment:{pattern:RegExp("(^|[\\s;|&]|[<>]\\()"+m),lookbehind:!0,alias:"constant"}},alias:"variable",lookbehind:!0},parameter:{pattern:/(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,alias:"variable",lookbehind:!0},string:[{pattern:/((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,lookbehind:!0,greedy:!0,inside:l},{pattern:/((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,lookbehind:!0,greedy:!0,inside:{bash:r}},{pattern:/(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,lookbehind:!0,greedy:!0,inside:l},{pattern:/(^|[^$\\])'[^']*'/,lookbehind:!0,greedy:!0},{pattern:/\$'(?:[^'\\]|\\[\s\S])*'/,greedy:!0,inside:{entity:l.entity}}],environment:{pattern:RegExp("\\$?"+m),alias:"constant"},variable:l.variable,function:{pattern:/(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,lookbehind:!0},keyword:{pattern:/(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,lookbehind:!0},builtin:{pattern:/(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,lookbehind:!0,alias:"class-name"},boolean:{pattern:/(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,lookbehind:!0},"file-descriptor":{pattern:/\B&\d\b/,alias:"important"},operator:{pattern:/\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,inside:{"file-descriptor":{pattern:/^\d/,alias:"important"}}},punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,number:{pattern:/(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,lookbehind:!0}},r.inside=w.languages.bash;for(var i=["comment","function-name","for-or-select","assign-left","parameter","string","environment","function","keyword","builtin","boolean","file-descriptor","operator","punctuation","number"],n=l.variable[1].inside,p=0;p<i.length;p++)n[i[p]]=w.languages.bash[i[p]];w.languages.sh=w.languages.bash,w.languages.shell=w.languages.bash})(Prism)},7059:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(n,p,f)<0;w.exports=i},7065:(w,m,r)=>{var l,i;l=[r(8411),r(9266),r(5581),r(9773),r(1382),r(9340)],i=function(n,p,f,c,o){"use strict";var h=/\r/g;n.fn.extend({val:function(y){var s,g,u,d=this[0];return arguments.length?(u=o(y),this.each(function(v){var b;this.nodeType===1&&(u?b=y.call(this,v,n(this).val()):b=y,b==null?b="":typeof b=="number"?b+="":Array.isArray(b)&&(b=n.map(b,function(T){return T==null?"":T+""})),s=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],(!s||!("set"in s)||s.set(this,b,"value")===void 0)&&(this.value=b))})):d?(s=n.valHooks[d.type]||n.valHooks[d.nodeName.toLowerCase()],s&&"get"in s&&(g=s.get(d,"value"))!==void 0?g:(g=d.value,typeof g=="string"?g.replace(h,""):g==null?"":g)):void 0}}),n.extend({valHooks:{option:{get:function(y){var s=n.find.attr(y,"value");return s!=null?s:p(n.text(y))}},select:{get:function(y){var s,g,u,d=y.options,v=y.selectedIndex,b=y.type==="select-one",T=b?null:[],_=b?v+1:d.length;for(v<0?u=_:u=b?v:0;u<_;u++)if(g=d[u],(g.selected||u===v)&&!g.disabled&&(!g.parentNode.disabled||!c(g.parentNode,"optgroup"))){if(s=n(g).val(),b)return s;T.push(s)}return T},set:function(y,s){for(var g,u,d=y.options,v=n.makeArray(s),b=d.length;b--;)u=d[b],(u.selected=n.inArray(n.valHooks.option.get(u),v)>-1)&&(g=!0);return g||(y.selectedIndex=-1),v}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(y,s){if(Array.isArray(s))return y.checked=n.inArray(n(y).val(),s)>-1}},f.checkOn||(n.valHooks[this].get=function(y){return y.getAttribute("value")===null?"on":y.value})})}.apply(m,l),i!==void 0&&(w.exports=i)},7075:(w,m,r)=>{"use strict";const l=r(3908),i=r(3904),{ANY:n}=i,p=r(8311),f=r(7638),c=r(5580),o=r(7059),h=r(5200),y=r(4089),s=(g,u,d,v)=>{g=new l(g,v),u=new p(u,v);let b,T,_,A,E;switch(d){case">":b=c,T=h,_=o,A=">",E=">=";break;case"<":b=o,T=y,_=c,A="<",E="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(f(g,u,v))return!1;for(let I=0;I<u.set.length;++I){const N=u.set[I];let B=null,C=null;if(N.forEach(D=>{D.semver===n&&(D=new i(">=0.0.0")),B=B||D,C=C||D,b(D.semver,B.semver,v)?B=D:_(D.semver,C.semver,v)&&(C=D)}),B.operator===A||B.operator===E||(!C.operator||C.operator===A)&&T(g,C.semver))return!1;if(C.operator===E&&_(g,C.semver))return!1}return!0};w.exports=s},7076:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(9758),r(9192),r(7814)],i=function(n,p,f,c,o){"use strict";var h=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,y=/[A-Z]/g;function s(u){return u==="true"?!0:u==="false"?!1:u==="null"?null:u===+u+""?+u:h.test(u)?JSON.parse(u):u}function g(u,d,v){var b;if(v===void 0&&u.nodeType===1)if(b="data-"+d.replace(y,"-$&").toLowerCase(),v=u.getAttribute(b),typeof v=="string"){try{v=s(v)}catch(T){}o.set(u,d,v)}else v=void 0;return v}return n.extend({hasData:function(u){return o.hasData(u)||c.hasData(u)},data:function(u,d,v){return o.access(u,d,v)},removeData:function(u,d){o.remove(u,d)},_data:function(u,d,v){return c.access(u,d,v)},_removeData:function(u,d){c.remove(u,d)}}),n.fn.extend({data:function(u,d){var v,b,T,_=this[0],A=_&&_.attributes;if(u===void 0){if(this.length&&(T=o.get(_),_.nodeType===1&&!c.get(_,"hasDataAttrs"))){for(v=A.length;v--;)A[v]&&(b=A[v].name,b.indexOf("data-")===0&&(b=f(b.slice(5)),g(_,b,T[b])));c.set(_,"hasDataAttrs",!0)}return T}return typeof u=="object"?this.each(function(){o.set(this,u)}):p(this,function(E){var I;if(_&&E===void 0)return I=o.get(_,u),I!==void 0||(I=g(_,u),I!==void 0)?I:void 0;this.each(function(){o.set(this,u,E)})},null,d,arguments.length>1,null,!0)},removeData:function(u){return this.each(function(){o.remove(this,u)})}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},7272:w=>{"use strict";const m=typeof process=="object"&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...r)=>console.error("SEMVER",...r):()=>{};w.exports=m},7298:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.push}.apply(m,l),i!==void 0&&(w.exports=i)},7346:(w,m,r)=>{var l;l=function(){"use strict";return function(n){return n!=null&&n===n.window}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},7410:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";var p=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function f(c,o){return o?c==="\0"?"\uFFFD":c.slice(0,-1)+"\\"+c.charCodeAt(c.length-1).toString(16)+" ":"\\"+c}n.escapeSelector=function(c){return(c+"").replace(p,f)}}.apply(m,l),i!==void 0&&(w.exports=i)},7414:(w,m,r)=>{var l,i;l=[r(8411),r(8519),r(5194),r(211),r(1193),r(1044),r(4143),r(759)],i=function(n,p,f,c,o,h,y,s){"use strict";var g=/<|&#?\w+;/;function u(d,v,b,T,_){for(var A,E,I,N,B,C,D=v.createDocumentFragment(),P=[],R=0,O=d.length;R<O;R++)if(A=d[R],A||A===0)if(p(A)==="object")n.merge(P,A.nodeType?[A]:A);else if(!g.test(A))P.push(v.createTextNode(A));else{for(E=E||D.appendChild(v.createElement("div")),I=(c.exec(A)||["",""])[1].toLowerCase(),N=h[I]||h._default,E.innerHTML=N[1]+n.htmlPrefilter(A)+N[2],C=N[0];C--;)E=E.lastChild;n.merge(P,E.childNodes),E=D.firstChild,E.textContent=""}for(D.textContent="",R=0;A=P[R++];){if(T&&n.inArray(A,T)>-1){_&&_.push(A);continue}if(B=f(A),E=y(D.appendChild(A),"script"),B&&s(E),b)for(C=0;A=E[C++];)o.test(A.type||"")&&b.push(A)}return D}return u}.apply(m,l),i!==void 0&&(w.exports=i)},7507:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.pop}.apply(m,l),i!==void 0&&(w.exports=i)},7623:(w,m,r)=>{var l,i;l=[r(8543)],i=function(n){"use strict";return n.documentElement}.apply(m,l),i!==void 0&&(w.exports=i)},7631:(w,m,r)=>{"use strict";const l=r(8311),i=(n,p)=>new l(n,p).set.map(f=>f.map(c=>c.value).join(" ").trim().split(" "));w.exports=i},7638:(w,m,r)=>{"use strict";const l=r(8311),i=(n,p,f)=>{try{p=new l(p,f)}catch(c){return!1}return p.test(n)};w.exports=i},7651:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(7623),r(1382),r(945),r(9617),r(3629),r(541),r(7346),r(9340),r(9229),r(4553)],i=function(n,p,f,c,o,h,y,s,g){"use strict";return n.offset={setOffset:function(u,d,v){var b,T,_,A,E,I,N,B=n.css(u,"position"),C=n(u),D={};B==="static"&&(u.style.position="relative"),E=C.offset(),_=n.css(u,"top"),I=n.css(u,"left"),N=(B==="absolute"||B==="fixed")&&(_+I).indexOf("auto")>-1,N?(b=C.position(),A=b.top,T=b.left):(A=parseFloat(_)||0,T=parseFloat(I)||0),c(d)&&(d=d.call(u,v,n.extend({},E))),d.top!=null&&(D.top=d.top-E.top+A),d.left!=null&&(D.left=d.left-E.left+T),"using"in d?d.using.call(u,D):C.css(D)}},n.fn.extend({offset:function(u){if(arguments.length)return u===void 0?this:this.each(function(T){n.offset.setOffset(this,u,T)});var d,v,b=this[0];if(b)return b.getClientRects().length?(d=b.getBoundingClientRect(),v=b.ownerDocument.defaultView,{top:d.top+v.pageYOffset,left:d.left+v.pageXOffset}):{top:0,left:0}},position:function(){if(this[0]){var u,d,v,b=this[0],T={top:0,left:0};if(n.css(b,"position")==="fixed")d=b.getBoundingClientRect();else{for(d=this.offset(),v=b.ownerDocument,u=b.offsetParent||v.documentElement;u&&(u===v.body||u===v.documentElement)&&n.css(u,"position")==="static";)u=u.parentNode;u&&u!==b&&u.nodeType===1&&(T=n(u).offset(),T.top+=n.css(u,"borderTopWidth",!0),T.left+=n.css(u,"borderLeftWidth",!0))}return{top:d.top-T.top-n.css(b,"marginTop",!0),left:d.left-T.left-n.css(b,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var u=this.offsetParent;u&&n.css(u,"position")==="static";)u=u.offsetParent;return u||f})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(u,d){var v=d==="pageYOffset";n.fn[u]=function(b){return p(this,function(T,_,A){var E;if(g(T)?E=T:T.nodeType===9&&(E=T.defaultView),A===void 0)return E?E[d]:T[_];E?E.scrollTo(v?E.pageXOffset:A,v?A:E.pageYOffset):T[_]=A},u,b,arguments.length)}}),n.each(["top","left"],function(u,d){n.cssHooks[d]=y(s.pixelPosition,function(v,b){if(b)return b=h(v,d),o.test(b)?n(v).position()[d]+"px":b})}),n}.apply(m,l),i!==void 0&&(w.exports=i)},7814:(w,m,r)=>{var l,i;l=[r(4172)],i=function(n){"use strict";return new n}.apply(m,l),i!==void 0&&(w.exports=i)},7839:()=>{(function(w){w.languages.diff={coord:[/^(?:\*{3}|-{3}|\+{3}).*$/m,/^@@.*@@$/m,/^\d.*$/m]};var m={"deleted-sign":"-","deleted-arrow":"<","inserted-sign":"+","inserted-arrow":">",unchanged:" ",diff:"!"};Object.keys(m).forEach(function(r){var l=m[r],i=[];/^\w+$/.test(r)||i.push(/\w+/.exec(r)[0]),r==="diff"&&i.push("bold"),w.languages.diff[r]={pattern:RegExp("^(?:["+l+`].*(?:\r
?|
|(?![\\s\\S])))+`,"m"),alias:i,inside:{line:{pattern:/(.)(?=[\s\S]).*(?:\r\n?|\n)?/,lookbehind:!0},prefix:{pattern:/[\s\S]/,alias:/\w+/.exec(r)[0]}}}}),Object.defineProperty(w.languages.diff,"PREFIXES",{value:m})})(Prism)},7957:(w,m,r)=>{var l,i;l=[r(8411),r(5194),r(8305),r(1382),r(7298),r(8404),r(6756),r(211),r(1193),r(1044),r(4143),r(759),r(7414),r(4773),r(9192),r(7814),r(8149),r(2710),r(9773),r(9340),r(2569),r(4553),r(8926)],i=function(n,p,f,c,o,h,y,s,g,u,d,v,b,T,_,A,E,I,N){"use strict";var B=/<script|<style|<link/i,C=/checked\s*(?:[^=]|=\s*.checked.)/i,D=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function P(L,W){return N(L,"table")&&N(W.nodeType!==11?W:W.firstChild,"tr")&&n(L).children("tbody")[0]||L}function R(L){return L.type=(L.getAttribute("type")!==null)+"/"+L.type,L}function O(L){return(L.type||"").slice(0,5)==="true/"?L.type=L.type.slice(5):L.removeAttribute("type"),L}function H(L,W){var U,Q,ne,se,X,ge,be;if(W.nodeType===1){if(_.hasData(L)&&(se=_.get(L),be=se.events,be)){_.remove(W,"handle events");for(ne in be)for(U=0,Q=be[ne].length;U<Q;U++)n.event.add(W,ne,be[ne][U])}A.hasData(L)&&(X=A.access(L),ge=n.extend({},X),A.set(W,ge))}}function $(L,W){var U=W.nodeName.toLowerCase();U==="input"&&h.test(L.type)?W.checked=L.checked:(U==="input"||U==="textarea")&&(W.defaultValue=L.defaultValue)}function j(L,W,U,Q){W=f(W);var ne,se,X,ge,be,_e,Be=0,st=L.length,bt=st-1,At=W[0],Dt=c(At);if(Dt||st>1&&typeof At=="string"&&!T.checkClone&&C.test(At))return L.each(function(fe){var xe=L.eq(fe);Dt&&(W[0]=At.call(this,fe,xe.html())),j(xe,W,U,Q)});if(st&&(ne=b(W,L[0].ownerDocument,!1,L,Q),se=ne.firstChild,ne.childNodes.length===1&&(ne=se),se||Q)){for(X=n.map(d(ne,"script"),R),ge=X.length;Be<st;Be++)be=ne,Be!==bt&&(be=n.clone(be,!0,!0),ge&&n.merge(X,d(be,"script"))),U.call(L[Be],be,Be);if(ge)for(_e=X[X.length-1].ownerDocument,n.map(X,O),Be=0;Be<ge;Be++)be=X[Be],g.test(be.type||"")&&!_.access(be,"globalEval")&&n.contains(_e,be)&&(be.src&&(be.type||"").toLowerCase()!=="module"?n._evalUrl&&!be.noModule&&n._evalUrl(be.src,{nonce:be.nonce||be.getAttribute("nonce")},_e):I(be.textContent.replace(D,""),be,_e))}return L}function G(L,W,U){for(var Q,ne=W?n.filter(W,L):L,se=0;(Q=ne[se])!=null;se++)!U&&Q.nodeType===1&&n.cleanData(d(Q)),Q.parentNode&&(U&&p(Q)&&v(d(Q,"script")),Q.parentNode.removeChild(Q));return L}return n.extend({htmlPrefilter:function(L){return L},clone:function(L,W,U){var Q,ne,se,X,ge=L.cloneNode(!0),be=p(L);if(!T.noCloneChecked&&(L.nodeType===1||L.nodeType===11)&&!n.isXMLDoc(L))for(X=d(ge),se=d(L),Q=0,ne=se.length;Q<ne;Q++)$(se[Q],X[Q]);if(W)if(U)for(se=se||d(L),X=X||d(ge),Q=0,ne=se.length;Q<ne;Q++)H(se[Q],X[Q]);else H(L,ge);return X=d(ge,"script"),X.length>0&&v(X,!be&&d(L,"script")),ge},cleanData:function(L){for(var W,U,Q,ne=n.event.special,se=0;(U=L[se])!==void 0;se++)if(E(U)){if(W=U[_.expando]){if(W.events)for(Q in W.events)ne[Q]?n.event.remove(U,Q):n.removeEvent(U,Q,W.handle);U[_.expando]=void 0}U[A.expando]&&(U[A.expando]=void 0)}}}),n.fn.extend({detach:function(L){return G(this,L,!0)},remove:function(L){return G(this,L)},text:function(L){return y(this,function(W){return W===void 0?n.text(this):this.empty().each(function(){(this.nodeType===1||this.nodeType===11||this.nodeType===9)&&(this.textContent=W)})},null,L,arguments.length)},append:function(){return j(this,arguments,function(L){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var W=P(this,L);W.appendChild(L)}})},prepend:function(){return j(this,arguments,function(L){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var W=P(this,L);W.insertBefore(L,W.firstChild)}})},before:function(){return j(this,arguments,function(L){this.parentNode&&this.parentNode.insertBefore(L,this)})},after:function(){return j(this,arguments,function(L){this.parentNode&&this.parentNode.insertBefore(L,this.nextSibling)})},empty:function(){for(var L,W=0;(L=this[W])!=null;W++)L.nodeType===1&&(n.cleanData(d(L,!1)),L.textContent="");return this},clone:function(L,W){return L=L==null?!1:L,W=W==null?L:W,this.map(function(){return n.clone(this,L,W)})},html:function(L){return y(this,function(W){var U=this[0]||{},Q=0,ne=this.length;if(W===void 0&&U.nodeType===1)return U.innerHTML;if(typeof W=="string"&&!B.test(W)&&!u[(s.exec(W)||["",""])[1].toLowerCase()]){W=n.htmlPrefilter(W);try{for(;Q<ne;Q++)U=this[Q]||{},U.nodeType===1&&(n.cleanData(d(U,!1)),U.innerHTML=W);U=0}catch(se){}}U&&this.empty().append(W)},null,L,arguments.length)},replaceWith:function(){var L=[];return j(this,arguments,function(W){var U=this.parentNode;n.inArray(this,L)<0&&(n.cleanData(d(this)),U&&U.replaceChild(W,this))},L)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(L,W){n.fn[L]=function(U){for(var Q,ne=[],se=n(U),X=se.length-1,ge=0;ge<=X;ge++)Q=ge===X?this:this.clone(!0),n(se[ge])[W](Q),o.apply(ne,Q.get());return this.pushStack(ne)}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},8064:(w,m,r)=>{var l;l=function(){"use strict";return/^--/}.call(m,r,m,w),l!==void 0&&(w.exports=l)},8088:(w,m,r)=>{var l,i;l=[r(1483)],i=function(n){"use strict";return new RegExp(n.join("|"),"i")}.apply(m,l),i!==void 0&&(w.exports=i)},8149:(w,m,r)=>{var l;l=function(){"use strict";return function(i){return i.nodeType===1||i.nodeType===9||!+i.nodeType}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},8269:(w,m,r)=>{var l,i;l=[r(8411),r(4733),r(1382),r(2998),r(4553)],i=function(n,p,f,c){"use strict";function o(h,y,s){return f(y)?n.grep(h,function(g,u){return!!y.call(g,u,g)!==s}):y.nodeType?n.grep(h,function(g){return g===y!==s}):typeof y!="string"?n.grep(h,function(g){return p.call(y,g)>-1!==s}):n.filter(y,h,s)}n.filter=function(h,y,s){var g=y[0];return s&&(h=":not("+h+")"),y.length===1&&g.nodeType===1?n.find.matchesSelector(g,h)?[g]:[]:n.find.matches(h,n.grep(y,function(u){return u.nodeType===1}))},n.fn.extend({find:function(h){var y,s,g=this.length,u=this;if(typeof h!="string")return this.pushStack(n(h).filter(function(){for(y=0;y<g;y++)if(n.contains(u[y],this))return!0}));for(s=this.pushStack([]),y=0;y<g;y++)n.find(h,u[y],s);return g>1?n.uniqueSort(s):s},filter:function(h){return this.pushStack(o(this,h||[],!1))},not:function(h){return this.pushStack(o(this,h||[],!0))},is:function(h){return!!o(this,typeof h=="string"&&c.test(h)?n(h):h||[],!1).length}})}.apply(m,l),i!==void 0&&(w.exports=i)},8305:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.flat?function(p){return n.flat.call(p)}:function(p){return n.concat.apply([],p)}}.apply(m,l),i!==void 0&&(w.exports=i)},8311:(w,m,r)=>{"use strict";const l=/\s+/g;class i{constructor(L,W){if(W=f(W),L instanceof i)return L.loose===!!W.loose&&L.includePrerelease===!!W.includePrerelease?L:new i(L.raw,W);if(L instanceof c)return this.raw=L.value,this.set=[[L]],this.formatted=void 0,this;if(this.options=W,this.loose=!!W.loose,this.includePrerelease=!!W.includePrerelease,this.raw=L.trim().replace(l," "),this.set=this.raw.split("||").map(U=>this.parseRange(U.trim())).filter(U=>U.length),!this.set.length)throw new TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){const U=this.set[0];if(this.set=this.set.filter(Q=>!T(Q[0])),this.set.length===0)this.set=[U];else if(this.set.length>1){for(const Q of this.set)if(Q.length===1&&_(Q[0])){this.set=[Q];break}}}this.formatted=void 0}get range(){if(this.formatted===void 0){this.formatted="";for(let L=0;L<this.set.length;L++){L>0&&(this.formatted+="||");const W=this.set[L];for(let U=0;U<W.length;U++)U>0&&(this.formatted+=" "),this.formatted+=W[U].toString().trim()}}return this.formatted}format(){return this.range}toString(){return this.range}parseRange(L){const U=((this.options.includePrerelease&&v)|(this.options.loose&&b))+":"+L,Q=p.get(U);if(Q)return Q;const ne=this.options.loose,se=ne?y[s.HYPHENRANGELOOSE]:y[s.HYPHENRANGE];L=L.replace(se,$(this.options.includePrerelease)),o("hyphen replace",L),L=L.replace(y[s.COMPARATORTRIM],g),o("comparator trim",L),L=L.replace(y[s.TILDETRIM],u),o("tilde trim",L),L=L.replace(y[s.CARETTRIM],d),o("caret trim",L);let X=L.split(" ").map(Be=>E(Be,this.options)).join(" ").split(/\s+/).map(Be=>H(Be,this.options));ne&&(X=X.filter(Be=>(o("loose invalid filter",Be,this.options),!!Be.match(y[s.COMPARATORLOOSE])))),o("range list",X);const ge=new Map,be=X.map(Be=>new c(Be,this.options));for(const Be of be){if(T(Be))return[Be];ge.set(Be.value,Be)}ge.size>1&&ge.has("")&&ge.delete("");const _e=[...ge.values()];return p.set(U,_e),_e}intersects(L,W){if(!(L instanceof i))throw new TypeError("a Range is required");return this.set.some(U=>A(U,W)&&L.set.some(Q=>A(Q,W)&&U.every(ne=>Q.every(se=>ne.intersects(se,W)))))}test(L){if(!L)return!1;if(typeof L=="string")try{L=new h(L,this.options)}catch(W){return!1}for(let W=0;W<this.set.length;W++)if(j(this.set[W],L,this.options))return!0;return!1}}w.exports=i;const n=r(8794),p=new n,f=r(8587),c=r(3904),o=r(7272),h=r(3908),{safeRe:y,t:s,comparatorTrimReplace:g,tildeTrimReplace:u,caretTrimReplace:d}=r(9718),{FLAG_INCLUDE_PRERELEASE:v,FLAG_LOOSE:b}=r(6874),T=G=>G.value==="<0.0.0-0",_=G=>G.value==="",A=(G,L)=>{let W=!0;const U=G.slice();let Q=U.pop();for(;W&&U.length;)W=U.every(ne=>Q.intersects(ne,L)),Q=U.pop();return W},E=(G,L)=>(o("comp",G,L),G=C(G,L),o("caret",G),G=N(G,L),o("tildes",G),G=P(G,L),o("xrange",G),G=O(G,L),o("stars",G),G),I=G=>!G||G.toLowerCase()==="x"||G==="*",N=(G,L)=>G.trim().split(/\s+/).map(W=>B(W,L)).join(" "),B=(G,L)=>{const W=L.loose?y[s.TILDELOOSE]:y[s.TILDE];return G.replace(W,(U,Q,ne,se,X)=>{o("tilde",G,U,Q,ne,se,X);let ge;return I(Q)?ge="":I(ne)?ge=`>=${Q}.0.0 <${+Q+1}.0.0-0`:I(se)?ge=`>=${Q}.${ne}.0 <${Q}.${+ne+1}.0-0`:X?(o("replaceTilde pr",X),ge=`>=${Q}.${ne}.${se}-${X} <${Q}.${+ne+1}.0-0`):ge=`>=${Q}.${ne}.${se} <${Q}.${+ne+1}.0-0`,o("tilde return",ge),ge})},C=(G,L)=>G.trim().split(/\s+/).map(W=>D(W,L)).join(" "),D=(G,L)=>{o("caret",G,L);const W=L.loose?y[s.CARETLOOSE]:y[s.CARET],U=L.includePrerelease?"-0":"";return G.replace(W,(Q,ne,se,X,ge)=>{o("caret",G,Q,ne,se,X,ge);let be;return I(ne)?be="":I(se)?be=`>=${ne}.0.0${U} <${+ne+1}.0.0-0`:I(X)?ne==="0"?be=`>=${ne}.${se}.0${U} <${ne}.${+se+1}.0-0`:be=`>=${ne}.${se}.0${U} <${+ne+1}.0.0-0`:ge?(o("replaceCaret pr",ge),ne==="0"?se==="0"?be=`>=${ne}.${se}.${X}-${ge} <${ne}.${se}.${+X+1}-0`:be=`>=${ne}.${se}.${X}-${ge} <${ne}.${+se+1}.0-0`:be=`>=${ne}.${se}.${X}-${ge} <${+ne+1}.0.0-0`):(o("no pr"),ne==="0"?se==="0"?be=`>=${ne}.${se}.${X}${U} <${ne}.${se}.${+X+1}-0`:be=`>=${ne}.${se}.${X}${U} <${ne}.${+se+1}.0-0`:be=`>=${ne}.${se}.${X} <${+ne+1}.0.0-0`),o("caret return",be),be})},P=(G,L)=>(o("replaceXRanges",G,L),G.split(/\s+/).map(W=>R(W,L)).join(" ")),R=(G,L)=>{G=G.trim();const W=L.loose?y[s.XRANGELOOSE]:y[s.XRANGE];return G.replace(W,(U,Q,ne,se,X,ge)=>{o("xRange",G,U,Q,ne,se,X,ge);const be=I(ne),_e=be||I(se),Be=_e||I(X),st=Be;return Q==="="&&st&&(Q=""),ge=L.includePrerelease?"-0":"",be?Q===">"||Q==="<"?U="<0.0.0-0":U="*":Q&&st?(_e&&(se=0),X=0,Q===">"?(Q=">=",_e?(ne=+ne+1,se=0,X=0):(se=+se+1,X=0)):Q==="<="&&(Q="<",_e?ne=+ne+1:se=+se+1),Q==="<"&&(ge="-0"),U=`${Q+ne}.${se}.${X}${ge}`):_e?U=`>=${ne}.0.0${ge} <${+ne+1}.0.0-0`:Be&&(U=`>=${ne}.${se}.0${ge} <${ne}.${+se+1}.0-0`),o("xRange return",U),U})},O=(G,L)=>(o("replaceStars",G,L),G.trim().replace(y[s.STAR],"")),H=(G,L)=>(o("replaceGTE0",G,L),G.trim().replace(y[L.includePrerelease?s.GTE0PRE:s.GTE0],"")),$=G=>(L,W,U,Q,ne,se,X,ge,be,_e,Be,st)=>(I(U)?W="":I(Q)?W=`>=${U}.0.0${G?"-0":""}`:I(ne)?W=`>=${U}.${Q}.0${G?"-0":""}`:se?W=`>=${W}`:W=`>=${W}${G?"-0":""}`,I(be)?ge="":I(_e)?ge=`<${+be+1}.0.0-0`:I(Be)?ge=`<${be}.${+_e+1}.0-0`:st?ge=`<=${be}.${_e}.${Be}-${st}`:G?ge=`<${be}.${_e}.${+Be+1}-0`:ge=`<=${ge}`,`${W} ${ge}`.trim()),j=(G,L,W)=>{for(let U=0;U<G.length;U++)if(!G[U].test(L))return!1;if(L.prerelease.length&&!W.includePrerelease){for(let U=0;U<G.length;U++)if(o(G[U].semver),G[U].semver!==c.ANY&&G[U].semver.prerelease.length>0){const Q=G[U].semver;if(Q.major===L.major&&Q.minor===L.minor&&Q.patch===L.patch)return!0}return!1}return!0}},8320:(w,m,r)=>{var l;l=function(){"use strict";return{}}.call(m,r,m,w),l!==void 0&&(w.exports=l)},8347:()=>{(function(){if(typeof Prism!="undefined"){var w=/^diff-([\w-]+)/i,m=/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g,r=RegExp(/(?:__|[^\r\n<])*(?:\r\n?|\n|(?:__|[^\r\n<])(?![^\r\n]))/.source.replace(/__/g,function(){return m.source}),"gi"),l=!1;Prism.hooks.add("before-sanity-check",function(i){var n=i.language;w.test(n)&&!i.grammar&&(i.grammar=Prism.languages[n]=Prism.languages.diff)}),Prism.hooks.add("before-tokenize",function(i){!l&&!Prism.languages.diff&&!Prism.plugins.autoloader&&(l=!0,console.warn("Prism's Diff Highlight plugin requires the Diff language definition (prism-diff.js).Make sure the language definition is loaded or use Prism's Autoloader plugin."));var n=i.language;w.test(n)&&!Prism.languages[n]&&(Prism.languages[n]=Prism.languages.diff)}),Prism.hooks.add("wrap",function(i){var n,p;if(i.language!=="diff"){var f=w.exec(i.language);if(!f)return;n=f[1],p=Prism.languages[n]}var c=Prism.languages.diff&&Prism.languages.diff.PREFIXES;if(c&&i.type in c){var o=i.content.replace(m,""),h=o.replace(/&lt;/g,"<").replace(/&amp;/g,"&"),y=h.replace(/(^|[\r\n])./g,"$1"),s;p?s=Prism.highlight(y,p,n):s=Prism.util.encode(y);var g=new Prism.Token("prefix",c[i.type],[/\w+/.exec(i.type)[0]]),u=Prism.Token.stringify(g,i.language),d=[],v;for(r.lastIndex=0;v=r.exec(s);)d.push(u+v[0]);/(?:^|[\r\n]).$/.test(h)&&d.push(u),i.content=d.join(""),p&&i.classes.push("language-"+n)}})}})()},8404:(w,m,r)=>{var l;l=function(){"use strict";return/^(?:checkbox|radio)$/i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},8411:(w,m,r)=>{var l,i;l=[r(2283),r(2332),r(5950),r(8305),r(7298),r(4733),r(8320),r(4122),r(1402),r(2122),r(8928),r(107),r(1382),r(7346),r(2710),r(8519)],i=function(n,p,f,c,o,h,y,s,g,u,d,v,b,T,_,A){"use strict";var E="3.7.1",I=/HTML$/i,N=function(C,D){return new N.fn.init(C,D)};N.fn=N.prototype={jquery:E,constructor:N,length:0,toArray:function(){return f.call(this)},get:function(C){return C==null?f.call(this):C<0?this[C+this.length]:this[C]},pushStack:function(C){var D=N.merge(this.constructor(),C);return D.prevObject=this,D},each:function(C){return N.each(this,C)},map:function(C){return this.pushStack(N.map(this,function(D,P){return C.call(D,P,D)}))},slice:function(){return this.pushStack(f.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(N.grep(this,function(C,D){return(D+1)%2}))},odd:function(){return this.pushStack(N.grep(this,function(C,D){return D%2}))},eq:function(C){var D=this.length,P=+C+(C<0?D:0);return this.pushStack(P>=0&&P<D?[this[P]]:[])},end:function(){return this.prevObject||this.constructor()},push:o,sort:n.sort,splice:n.splice},N.extend=N.fn.extend=function(){var C,D,P,R,O,H,$=arguments[0]||{},j=1,G=arguments.length,L=!1;for(typeof $=="boolean"&&(L=$,$=arguments[j]||{},j++),typeof $!="object"&&!b($)&&($={}),j===G&&($=this,j--);j<G;j++)if((C=arguments[j])!=null)for(D in C)R=C[D],!(D==="__proto__"||$===R)&&(L&&R&&(N.isPlainObject(R)||(O=Array.isArray(R)))?(P=$[D],O&&!Array.isArray(P)?H=[]:!O&&!N.isPlainObject(P)?H={}:H=P,O=!1,$[D]=N.extend(L,H,R)):R!==void 0&&($[D]=R));return $},N.extend({expando:"jQuery"+(E+Math.random()).replace(/\D/g,""),isReady:!0,error:function(C){throw new Error(C)},noop:function(){},isPlainObject:function(C){var D,P;return!C||s.call(C)!=="[object Object]"?!1:(D=p(C),D?(P=g.call(D,"constructor")&&D.constructor,typeof P=="function"&&u.call(P)===d):!0)},isEmptyObject:function(C){var D;for(D in C)return!1;return!0},globalEval:function(C,D,P){_(C,{nonce:D&&D.nonce},P)},each:function(C,D){var P,R=0;if(B(C))for(P=C.length;R<P&&D.call(C[R],R,C[R])!==!1;R++);else for(R in C)if(D.call(C[R],R,C[R])===!1)break;return C},text:function(C){var D,P="",R=0,O=C.nodeType;if(!O)for(;D=C[R++];)P+=N.text(D);return O===1||O===11?C.textContent:O===9?C.documentElement.textContent:O===3||O===4?C.nodeValue:P},makeArray:function(C,D){var P=D||[];return C!=null&&(B(Object(C))?N.merge(P,typeof C=="string"?[C]:C):o.call(P,C)),P},inArray:function(C,D,P){return D==null?-1:h.call(D,C,P)},isXMLDoc:function(C){var D=C&&C.namespaceURI,P=C&&(C.ownerDocument||C).documentElement;return!I.test(D||P&&P.nodeName||"HTML")},merge:function(C,D){for(var P=+D.length,R=0,O=C.length;R<P;R++)C[O++]=D[R];return C.length=O,C},grep:function(C,D,P){for(var R,O=[],H=0,$=C.length,j=!P;H<$;H++)R=!D(C[H],H),R!==j&&O.push(C[H]);return O},map:function(C,D,P){var R,O,H=0,$=[];if(B(C))for(R=C.length;H<R;H++)O=D(C[H],H,P),O!=null&&$.push(O);else for(H in C)O=D(C[H],H,P),O!=null&&$.push(O);return c($)},guid:1,support:v}),typeof Symbol=="function"&&(N.fn[Symbol.iterator]=n[Symbol.iterator]),N.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(C,D){y["[object "+D+"]"]=D.toLowerCase()});function B(C){var D=!!C&&"length"in C&&C.length,P=A(C);return b(C)||T(C)?!1:P==="array"||D===0||typeof D=="number"&&D>0&&D-1 in C}return N}.apply(m,l),i!==void 0&&(w.exports=i)},8498:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(9978)],i=function(n,p){"use strict";n.ajaxPrefilter(function(f){f.crossDomain&&(f.contents.script=!1)}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(f){return n.globalEval(f),f}}}),n.ajaxPrefilter("script",function(f){f.cache===void 0&&(f.cache=!1),f.crossDomain&&(f.type="GET")}),n.ajaxTransport("script",function(f){if(f.crossDomain||f.scriptAttrs){var c,o;return{send:function(h,y){c=n("<script>").attr(f.scriptAttrs||{}).prop({charset:f.scriptCharset,src:f.url}).on("load error",o=function(s){c.remove(),o=null,s&&y(s.type==="error"?404:200,s.type)}),p.head.appendChild(c[0])},abort:function(){o&&o()}}}})}.apply(m,l),i!==void 0&&(w.exports=i)},8519:(w,m,r)=>{var l,i;l=[r(8320),r(4122)],i=function(n,p){"use strict";function f(c){return c==null?c+"":typeof c=="object"||typeof c=="function"?n[p.call(c)]||"object":typeof c}return f}.apply(m,l),i!==void 0&&(w.exports=i)},8543:(w,m,r)=>{var l;l=function(){"use strict";return window.document}.call(m,r,m,w),l!==void 0&&(w.exports=l)},8587:w=>{"use strict";const m=Object.freeze({loose:!0}),r=Object.freeze({}),l=i=>i?typeof i!="object"?m:i:r;w.exports=l},8794:w=>{"use strict";class m{constructor(){this.max=1e3,this.map=new Map}get(l){const i=this.map.get(l);if(i!==void 0)return this.map.delete(l),this.map.set(l,i),i}delete(l){return this.map.delete(l)}set(l,i){if(!this.delete(l)&&i!==void 0){if(this.map.size>=this.max){const p=this.map.keys().next().value;this.delete(p)}this.map.set(l,i)}return this}}w.exports=m},8811:(w,m,r)=>{var l,i;l=[r(8411)],i=function(n){"use strict";return function(p,f,c){for(var o=[],h=c!==void 0;(p=p[f])&&p.nodeType!==9;)if(p.nodeType===1){if(h&&n(p).is(c))break;o.push(p)}return o}}.apply(m,l),i!==void 0&&(w.exports=i)},8848:(w,m,r)=>{var l=typeof window!="undefined"?window:typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope?self:{};/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */var i=function(n){var p=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,f=0,c={},o={manual:n.Prism&&n.Prism.manual,disableWorkerMessageHandler:n.Prism&&n.Prism.disableWorkerMessageHandler,util:{encode:function A(E){return E instanceof h?new h(E.type,A(E.content),E.alias):Array.isArray(E)?E.map(A):E.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(A){return Object.prototype.toString.call(A).slice(8,-1)},objId:function(A){return A.__id||Object.defineProperty(A,"__id",{value:++f}),A.__id},clone:function A(E,I){I=I||{};var N,B;switch(o.util.type(E)){case"Object":if(B=o.util.objId(E),I[B])return I[B];N={},I[B]=N;for(var C in E)E.hasOwnProperty(C)&&(N[C]=A(E[C],I));return N;case"Array":return B=o.util.objId(E),I[B]?I[B]:(N=[],I[B]=N,E.forEach(function(D,P){N[P]=A(D,I)}),N);default:return E}},getLanguage:function(A){for(;A;){var E=p.exec(A.className);if(E)return E[1].toLowerCase();A=A.parentElement}return"none"},setLanguage:function(A,E){A.className=A.className.replace(RegExp(p,"gi"),""),A.classList.add("language-"+E)},currentScript:function(){if(typeof document=="undefined")return null;if(document.currentScript&&document.currentScript.tagName==="SCRIPT"&&1<2)return document.currentScript;try{throw new Error}catch(N){var A=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(N.stack)||[])[1];if(A){var E=document.getElementsByTagName("script");for(var I in E)if(E[I].src==A)return E[I]}return null}},isActive:function(A,E,I){for(var N="no-"+E;A;){var B=A.classList;if(B.contains(E))return!0;if(B.contains(N))return!1;A=A.parentElement}return!!I}},languages:{plain:c,plaintext:c,text:c,txt:c,extend:function(A,E){var I=o.util.clone(o.languages[A]);for(var N in E)I[N]=E[N];return I},insertBefore:function(A,E,I,N){N=N||o.languages;var B=N[A],C={};for(var D in B)if(B.hasOwnProperty(D)){if(D==E)for(var P in I)I.hasOwnProperty(P)&&(C[P]=I[P]);I.hasOwnProperty(D)||(C[D]=B[D])}var R=N[A];return N[A]=C,o.languages.DFS(o.languages,function(O,H){H===R&&O!=A&&(this[O]=C)}),C},DFS:function A(E,I,N,B){B=B||{};var C=o.util.objId;for(var D in E)if(E.hasOwnProperty(D)){I.call(E,D,E[D],N||D);var P=E[D],R=o.util.type(P);R==="Object"&&!B[C(P)]?(B[C(P)]=!0,A(P,I,null,B)):R==="Array"&&!B[C(P)]&&(B[C(P)]=!0,A(P,I,D,B))}}},plugins:{},highlightAll:function(A,E){o.highlightAllUnder(document,A,E)},highlightAllUnder:function(A,E,I){var N={callback:I,container:A,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};o.hooks.run("before-highlightall",N),N.elements=Array.prototype.slice.apply(N.container.querySelectorAll(N.selector)),o.hooks.run("before-all-elements-highlight",N);for(var B=0,C;C=N.elements[B++];)o.highlightElement(C,E===!0,N.callback)},highlightElement:function(A,E,I){var N=o.util.getLanguage(A),B=o.languages[N];o.util.setLanguage(A,N);var C=A.parentElement;C&&C.nodeName.toLowerCase()==="pre"&&o.util.setLanguage(C,N);var D=A.textContent,P={element:A,language:N,grammar:B,code:D};function R(H){P.highlightedCode=H,o.hooks.run("before-insert",P),P.element.innerHTML=P.highlightedCode,o.hooks.run("after-highlight",P),o.hooks.run("complete",P),I&&I.call(P.element)}if(o.hooks.run("before-sanity-check",P),C=P.element.parentElement,C&&C.nodeName.toLowerCase()==="pre"&&!C.hasAttribute("tabindex")&&C.setAttribute("tabindex","0"),!P.code){o.hooks.run("complete",P),I&&I.call(P.element);return}if(o.hooks.run("before-highlight",P),!P.grammar){R(o.util.encode(P.code));return}if(E&&n.Worker){var O=new Worker(o.filename);O.onmessage=function(H){R(H.data)},O.postMessage(JSON.stringify({language:P.language,code:P.code,immediateClose:!0}))}else R(o.highlight(P.code,P.grammar,P.language))},highlight:function(A,E,I){var N={code:A,grammar:E,language:I};if(o.hooks.run("before-tokenize",N),!N.grammar)throw new Error('The language "'+N.language+'" has no grammar.');return N.tokens=o.tokenize(N.code,N.grammar),o.hooks.run("after-tokenize",N),h.stringify(o.util.encode(N.tokens),N.language)},tokenize:function(A,E){var I=E.rest;if(I){for(var N in I)E[N]=I[N];delete E.rest}var B=new g;return u(B,B.head,A),s(A,B,E,B.head,0),v(B)},hooks:{all:{},add:function(A,E){var I=o.hooks.all;I[A]=I[A]||[],I[A].push(E)},run:function(A,E){var I=o.hooks.all[A];if(!(!I||!I.length))for(var N=0,B;B=I[N++];)B(E)}},Token:h};n.Prism=o;function h(A,E,I,N){this.type=A,this.content=E,this.alias=I,this.length=(N||"").length|0}h.stringify=function A(E,I){if(typeof E=="string")return E;if(Array.isArray(E)){var N="";return E.forEach(function(R){N+=A(R,I)}),N}var B={type:E.type,content:A(E.content,I),tag:"span",classes:["token",E.type],attributes:{},language:I},C=E.alias;C&&(Array.isArray(C)?Array.prototype.push.apply(B.classes,C):B.classes.push(C)),o.hooks.run("wrap",B);var D="";for(var P in B.attributes)D+=" "+P+'="'+(B.attributes[P]||"").replace(/"/g,"&quot;")+'"';return"<"+B.tag+' class="'+B.classes.join(" ")+'"'+D+">"+B.content+"</"+B.tag+">"};function y(A,E,I,N){A.lastIndex=E;var B=A.exec(I);if(B&&N&&B[1]){var C=B[1].length;B.index+=C,B[0]=B[0].slice(C)}return B}function s(A,E,I,N,B,C){for(var D in I)if(!(!I.hasOwnProperty(D)||!I[D])){var P=I[D];P=Array.isArray(P)?P:[P];for(var R=0;R<P.length;++R){if(C&&C.cause==D+","+R)return;var O=P[R],H=O.inside,$=!!O.lookbehind,j=!!O.greedy,G=O.alias;if(j&&!O.pattern.global){var L=O.pattern.toString().match(/[imsuy]*$/)[0];O.pattern=RegExp(O.pattern.source,L+"g")}for(var W=O.pattern||O,U=N.next,Q=B;U!==E.tail&&!(C&&Q>=C.reach);Q+=U.value.length,U=U.next){var ne=U.value;if(E.length>A.length)return;if(!(ne instanceof h)){var se=1,X;if(j){if(X=y(W,Q,A,$),!X||X.index>=A.length)break;var Be=X.index,ge=X.index+X[0].length,be=Q;for(be+=U.value.length;Be>=be;)U=U.next,be+=U.value.length;if(be-=U.value.length,Q=be,U.value instanceof h)continue;for(var _e=U;_e!==E.tail&&(be<ge||typeof _e.value=="string");_e=_e.next)se++,be+=_e.value.length;se--,ne=A.slice(Q,be),X.index-=Q}else if(X=y(W,0,ne,$),!X)continue;var Be=X.index,st=X[0],bt=ne.slice(0,Be),At=ne.slice(Be+st.length),Dt=Q+ne.length;C&&Dt>C.reach&&(C.reach=Dt);var fe=U.prev;bt&&(fe=u(E,fe,bt),Q+=bt.length),d(E,fe,se);var xe=new h(D,H?o.tokenize(st,H):st,G,st);if(U=u(E,fe,xe),At&&u(E,U,At),se>1){var Te={cause:D+","+R,reach:Dt};s(A,E,I,U.prev,Q,Te),C&&Te.reach>C.reach&&(C.reach=Te.reach)}}}}}}function g(){var A={value:null,prev:null,next:null},E={value:null,prev:A,next:null};A.next=E,this.head=A,this.tail=E,this.length=0}function u(A,E,I){var N=E.next,B={value:I,prev:E,next:N};return E.next=B,N.prev=B,A.length++,B}function d(A,E,I){for(var N=E.next,B=0;B<I&&N!==A.tail;B++)N=N.next;E.next=N,N.prev=E,A.length-=B}function v(A){for(var E=[],I=A.head.next;I!==A.tail;)E.push(I.value),I=I.next;return E}if(!n.document)return n.addEventListener&&(o.disableWorkerMessageHandler||n.addEventListener("message",function(A){var E=JSON.parse(A.data),I=E.language,N=E.code,B=E.immediateClose;n.postMessage(o.highlight(N,o.languages[I],I)),B&&n.close()},!1)),o;var b=o.util.currentScript();b&&(o.filename=b.src,b.hasAttribute("data-manual")&&(o.manual=!0));function T(){o.manual||o.highlightAll()}if(!o.manual){var _=document.readyState;_==="loading"||_==="interactive"&&b&&b.defer?document.addEventListener("DOMContentLoaded",T):window.requestAnimationFrame?window.requestAnimationFrame(T):window.setTimeout(T,16)}return o}(l);w.exports&&(w.exports=i),typeof r.g!="undefined"&&(r.g.Prism=i),i.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},i.languages.markup.tag.inside["attr-value"].inside.entity=i.languages.markup.entity,i.languages.markup.doctype.inside["internal-subset"].inside=i.languages.markup,i.hooks.add("wrap",function(n){n.type==="entity"&&(n.attributes.title=n.content.replace(/&amp;/,"&"))}),Object.defineProperty(i.languages.markup.tag,"addInlined",{value:function(p,f){var c={};c["language-"+f]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:i.languages[f]},c.cdata=/^<!\[CDATA\[|\]\]>$/i;var o={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:c}};o["language-"+f]={pattern:/[\s\S]+/,inside:i.languages[f]};var h={};h[p]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return p}),"i"),lookbehind:!0,greedy:!0,inside:o},i.languages.insertBefore("markup","cdata",h)}}),Object.defineProperty(i.languages.markup.tag,"addAttribute",{value:function(n,p){i.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+n+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[p,"language-"+p],inside:i.languages[p]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),i.languages.html=i.languages.markup,i.languages.mathml=i.languages.markup,i.languages.svg=i.languages.markup,i.languages.xml=i.languages.extend("markup",{}),i.languages.ssml=i.languages.xml,i.languages.atom=i.languages.xml,i.languages.rss=i.languages.xml,function(n){var p=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;n.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+p.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+p.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+p.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+p.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:p,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},n.languages.css.atrule.inside.rest=n.languages.css;var f=n.languages.markup;f&&(f.tag.addInlined("style","css"),f.tag.addAttribute("style","css"))}(i),i.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},i.languages.javascript=i.languages.extend("clike",{"class-name":[i.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),i.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,i.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:i.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:i.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:i.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:i.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:i.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),i.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:i.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),i.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),i.languages.markup&&(i.languages.markup.tag.addInlined("script","javascript"),i.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),i.languages.js=i.languages.javascript,function(){if(typeof i=="undefined"||typeof document=="undefined")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var n="Loading\u2026",p=function(b,T){return"\u2716 Error "+b+" while fetching file: "+T},f="\u2716 Error: File does not exist or is empty",c={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},o="data-src-status",h="loading",y="loaded",s="failed",g="pre[data-src]:not(["+o+'="'+y+'"]):not(['+o+'="'+h+'"])';function u(b,T,_){var A=new XMLHttpRequest;A.open("GET",b,!0),A.onreadystatechange=function(){A.readyState==4&&(A.status<400&&A.responseText?T(A.responseText):A.status>=400?_(p(A.status,A.statusText)):_(f))},A.send(null)}function d(b){var T=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(b||"");if(T){var _=Number(T[1]),A=T[2],E=T[3];return A?E?[_,Number(E)]:[_,void 0]:[_,_]}}i.hooks.add("before-highlightall",function(b){b.selector+=", "+g}),i.hooks.add("before-sanity-check",function(b){var T=b.element;if(T.matches(g)){b.code="",T.setAttribute(o,h);var _=T.appendChild(document.createElement("CODE"));_.textContent=n;var A=T.getAttribute("data-src"),E=b.language;if(E==="none"){var I=(/\.(\w+)$/.exec(A)||[,"none"])[1];E=c[I]||I}i.util.setLanguage(_,E),i.util.setLanguage(T,E);var N=i.plugins.autoloader;N&&N.loadLanguages(E),u(A,function(B){T.setAttribute(o,y);var C=d(T.getAttribute("data-range"));if(C){var D=B.split(/\r\n?|\n/g),P=C[0],R=C[1]==null?D.length:C[1];P<0&&(P+=D.length),P=Math.max(0,Math.min(P-1,D.length)),R<0&&(R+=D.length),R=Math.max(0,Math.min(R,D.length)),B=D.slice(P,R).join(`
`),T.hasAttribute("data-start")||T.setAttribute("data-start",String(P+1))}_.textContent=B,i.highlightElement(_)},function(B){T.setAttribute(o,s),_.textContent=B})}}),i.plugins.fileHighlight={highlight:function(T){for(var _=(T||document).querySelectorAll(g),A=0,E;E=_[A++];)i.highlightElement(E)}};var v=!1;i.fileHighlight=function(){v||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),v=!0),i.plugins.fileHighlight.highlight.apply(this,arguments)}}()},8919:(w,m,r)=>{var l,i;l=[r(9619)],i=function(n){"use strict";return new RegExp("^"+n+"+|((?:^|[^\\\\])(?:\\\\.)*)"+n+"+$","g")}.apply(m,l),i!==void 0&&(w.exports=i)},8926:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(7623),r(1382),r(9091),r(8404),r(5950),r(8149),r(9192),r(9773),r(9340),r(4553)],i=function(n,p,f,c,o,h,y,s,g,u){"use strict";var d=/^([^.]*)(?:\.(.+)|)/;function v(){return!0}function b(){return!1}function T(A,E,I,N,B,C){var D,P;if(typeof E=="object"){typeof I!="string"&&(N=N||I,I=void 0);for(P in E)T(A,P,I,N,E[P],C);return A}if(N==null&&B==null?(B=I,N=I=void 0):B==null&&(typeof I=="string"?(B=N,N=void 0):(B=N,N=I,I=void 0)),B===!1)B=b;else if(!B)return A;return C===1&&(D=B,B=function(R){return n().off(R),D.apply(this,arguments)},B.guid=D.guid||(D.guid=n.guid++)),A.each(function(){n.event.add(this,E,B,N,I)})}n.event={global:{},add:function(A,E,I,N,B){var C,D,P,R,O,H,$,j,G,L,W,U=g.get(A);if(s(A))for(I.handler&&(C=I,I=C.handler,B=C.selector),B&&n.find.matchesSelector(f,B),I.guid||(I.guid=n.guid++),(R=U.events)||(R=U.events=Object.create(null)),(D=U.handle)||(D=U.handle=function(Q){return typeof n!="undefined"&&n.event.triggered!==Q.type?n.event.dispatch.apply(A,arguments):void 0}),E=(E||"").match(o)||[""],O=E.length;O--;)P=d.exec(E[O])||[],G=W=P[1],L=(P[2]||"").split(".").sort(),G&&($=n.event.special[G]||{},G=(B?$.delegateType:$.bindType)||G,$=n.event.special[G]||{},H=n.extend({type:G,origType:W,data:N,handler:I,guid:I.guid,selector:B,needsContext:B&&n.expr.match.needsContext.test(B),namespace:L.join(".")},C),(j=R[G])||(j=R[G]=[],j.delegateCount=0,(!$.setup||$.setup.call(A,N,L,D)===!1)&&A.addEventListener&&A.addEventListener(G,D)),$.add&&($.add.call(A,H),H.handler.guid||(H.handler.guid=I.guid)),B?j.splice(j.delegateCount++,0,H):j.push(H),n.event.global[G]=!0)},remove:function(A,E,I,N,B){var C,D,P,R,O,H,$,j,G,L,W,U=g.hasData(A)&&g.get(A);if(!(!U||!(R=U.events))){for(E=(E||"").match(o)||[""],O=E.length;O--;){if(P=d.exec(E[O])||[],G=W=P[1],L=(P[2]||"").split(".").sort(),!G){for(G in R)n.event.remove(A,G+E[O],I,N,!0);continue}for($=n.event.special[G]||{},G=(N?$.delegateType:$.bindType)||G,j=R[G]||[],P=P[2]&&new RegExp("(^|\\.)"+L.join("\\.(?:.*\\.|)")+"(\\.|$)"),D=C=j.length;C--;)H=j[C],(B||W===H.origType)&&(!I||I.guid===H.guid)&&(!P||P.test(H.namespace))&&(!N||N===H.selector||N==="**"&&H.selector)&&(j.splice(C,1),H.selector&&j.delegateCount--,$.remove&&$.remove.call(A,H));D&&!j.length&&((!$.teardown||$.teardown.call(A,L,U.handle)===!1)&&n.removeEvent(A,G,U.handle),delete R[G])}n.isEmptyObject(R)&&g.remove(A,"handle events")}},dispatch:function(A){var E,I,N,B,C,D,P=new Array(arguments.length),R=n.event.fix(A),O=(g.get(this,"events")||Object.create(null))[R.type]||[],H=n.event.special[R.type]||{};for(P[0]=R,E=1;E<arguments.length;E++)P[E]=arguments[E];if(R.delegateTarget=this,!(H.preDispatch&&H.preDispatch.call(this,R)===!1)){for(D=n.event.handlers.call(this,R,O),E=0;(B=D[E++])&&!R.isPropagationStopped();)for(R.currentTarget=B.elem,I=0;(C=B.handlers[I++])&&!R.isImmediatePropagationStopped();)(!R.rnamespace||C.namespace===!1||R.rnamespace.test(C.namespace))&&(R.handleObj=C,R.data=C.data,N=((n.event.special[C.origType]||{}).handle||C.handler).apply(B.elem,P),N!==void 0&&(R.result=N)===!1&&(R.preventDefault(),R.stopPropagation()));return H.postDispatch&&H.postDispatch.call(this,R),R.result}},handlers:function(A,E){var I,N,B,C,D,P=[],R=E.delegateCount,O=A.target;if(R&&O.nodeType&&!(A.type==="click"&&A.button>=1)){for(;O!==this;O=O.parentNode||this)if(O.nodeType===1&&!(A.type==="click"&&O.disabled===!0)){for(C=[],D={},I=0;I<R;I++)N=E[I],B=N.selector+" ",D[B]===void 0&&(D[B]=N.needsContext?n(B,this).index(O)>-1:n.find(B,this,null,[O]).length),D[B]&&C.push(N);C.length&&P.push({elem:O,handlers:C})}}return O=this,R<E.length&&P.push({elem:O,handlers:E.slice(R)}),P},addProp:function(A,E){Object.defineProperty(n.Event.prototype,A,{enumerable:!0,configurable:!0,get:c(E)?function(){if(this.originalEvent)return E(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[A]},set:function(I){Object.defineProperty(this,A,{enumerable:!0,configurable:!0,writable:!0,value:I})}})},fix:function(A){return A[n.expando]?A:new n.Event(A)},special:{load:{noBubble:!0},click:{setup:function(A){var E=this||A;return h.test(E.type)&&E.click&&u(E,"input")&&_(E,"click",!0),!1},trigger:function(A){var E=this||A;return h.test(E.type)&&E.click&&u(E,"input")&&_(E,"click"),!0},_default:function(A){var E=A.target;return h.test(E.type)&&E.click&&u(E,"input")&&g.get(E,"click")||u(E,"a")}},beforeunload:{postDispatch:function(A){A.result!==void 0&&A.originalEvent&&(A.originalEvent.returnValue=A.result)}}}};function _(A,E,I){if(!I){g.get(A,E)===void 0&&n.event.add(A,E,v);return}g.set(A,E,!1),n.event.add(A,E,{namespace:!1,handler:function(N){var B,C=g.get(this,E);if(N.isTrigger&1&&this[E]){if(C)(n.event.special[E]||{}).delegateType&&N.stopPropagation();else if(C=y.call(arguments),g.set(this,E,C),this[E](),B=g.get(this,E),g.set(this,E,!1),C!==B)return N.stopImmediatePropagation(),N.preventDefault(),B}else C&&(g.set(this,E,n.event.trigger(C[0],C.slice(1),this)),N.stopPropagation(),N.isImmediatePropagationStopped=v)}})}return n.removeEvent=function(A,E,I){A.removeEventListener&&A.removeEventListener(E,I)},n.Event=function(A,E){if(!(this instanceof n.Event))return new n.Event(A,E);A&&A.type?(this.originalEvent=A,this.type=A.type,this.isDefaultPrevented=A.defaultPrevented||A.defaultPrevented===void 0&&A.returnValue===!1?v:b,this.target=A.target&&A.target.nodeType===3?A.target.parentNode:A.target,this.currentTarget=A.currentTarget,this.relatedTarget=A.relatedTarget):this.type=A,E&&n.extend(this,E),this.timeStamp=A&&A.timeStamp||Date.now(),this[n.expando]=!0},n.Event.prototype={constructor:n.Event,isDefaultPrevented:b,isPropagationStopped:b,isImmediatePropagationStopped:b,isSimulated:!1,preventDefault:function(){var A=this.originalEvent;this.isDefaultPrevented=v,A&&!this.isSimulated&&A.preventDefault()},stopPropagation:function(){var A=this.originalEvent;this.isPropagationStopped=v,A&&!this.isSimulated&&A.stopPropagation()},stopImmediatePropagation:function(){var A=this.originalEvent;this.isImmediatePropagationStopped=v,A&&!this.isSimulated&&A.stopImmediatePropagation(),this.stopPropagation()}},n.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},n.event.addProp),n.each({focus:"focusin",blur:"focusout"},function(A,E){function I(N){if(p.documentMode){var B=g.get(this,"handle"),C=n.event.fix(N);C.type=N.type==="focusin"?"focus":"blur",C.isSimulated=!0,B(N),C.target===C.currentTarget&&B(C)}else n.event.simulate(E,N.target,n.event.fix(N))}n.event.special[A]={setup:function(){var N;if(_(this,A,!0),p.documentMode)N=g.get(this,E),N||this.addEventListener(E,I),g.set(this,E,(N||0)+1);else return!1},trigger:function(){return _(this,A),!0},teardown:function(){var N;if(p.documentMode)N=g.get(this,E)-1,N?g.set(this,E,N):(this.removeEventListener(E,I),g.remove(this,E));else return!1},_default:function(N){return g.get(N.target,A)},delegateType:E},n.event.special[E]={setup:function(){var N=this.ownerDocument||this.document||this,B=p.documentMode?this:N,C=g.get(B,E);C||(p.documentMode?this.addEventListener(E,I):N.addEventListener(A,I,!0)),g.set(B,E,(C||0)+1)},teardown:function(){var N=this.ownerDocument||this.document||this,B=p.documentMode?this:N,C=g.get(B,E)-1;C?g.set(B,E,C):(p.documentMode?this.removeEventListener(E,I):N.removeEventListener(A,I,!0),g.remove(B,E))}}}),n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(A,E){n.event.special[A]={delegateType:E,bindType:E,handle:function(I){var N,B=this,C=I.relatedTarget,D=I.handleObj;return(!C||C!==B&&!n.contains(B,C))&&(I.type=D.origType,N=D.handler.apply(this,arguments),I.type=E),N}}}),n.fn.extend({on:function(A,E,I,N){return T(this,A,E,I,N)},one:function(A,E,I,N){return T(this,A,E,I,N,1)},off:function(A,E,I){var N,B;if(A&&A.preventDefault&&A.handleObj)return N=A.handleObj,n(A.delegateTarget).off(N.namespace?N.origType+"."+N.namespace:N.origType,N.selector,N.handler),this;if(typeof A=="object"){for(B in A)this.off(B,E,A[B]);return this}return(E===!1||typeof E=="function")&&(I=E,E=void 0),I===!1&&(I=b),this.each(function(){n.event.remove(this,A,I,E)})}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},8928:(w,m,r)=>{var l,i;l=[r(2122)],i=function(n){"use strict";return n.call(Object)}.apply(m,l),i!==void 0&&(w.exports=i)},9091:(w,m,r)=>{var l;l=function(){"use strict";return/[^\x20\t\r\n\f]+/g}.call(m,r,m,w),l!==void 0&&(w.exports=l)},9142:(w,m,r)=>{var l,i;l=[r(8411),r(9266),r(1382),r(9091),r(9192),r(9340)],i=function(n,p,f,c,o){"use strict";function h(s){return s.getAttribute&&s.getAttribute("class")||""}function y(s){return Array.isArray(s)?s:typeof s=="string"?s.match(c)||[]:[]}n.fn.extend({addClass:function(s){var g,u,d,v,b,T;return f(s)?this.each(function(_){n(this).addClass(s.call(this,_,h(this)))}):(g=y(s),g.length?this.each(function(){if(d=h(this),u=this.nodeType===1&&" "+p(d)+" ",u){for(b=0;b<g.length;b++)v=g[b],u.indexOf(" "+v+" ")<0&&(u+=v+" ");T=p(u),d!==T&&this.setAttribute("class",T)}}):this)},removeClass:function(s){var g,u,d,v,b,T;return f(s)?this.each(function(_){n(this).removeClass(s.call(this,_,h(this)))}):arguments.length?(g=y(s),g.length?this.each(function(){if(d=h(this),u=this.nodeType===1&&" "+p(d)+" ",u){for(b=0;b<g.length;b++)for(v=g[b];u.indexOf(" "+v+" ")>-1;)u=u.replace(" "+v+" "," ");T=p(u),d!==T&&this.setAttribute("class",T)}}):this):this.attr("class","")},toggleClass:function(s,g){var u,d,v,b,T=typeof s,_=T==="string"||Array.isArray(s);return f(s)?this.each(function(A){n(this).toggleClass(s.call(this,A,h(this),g),g)}):typeof g=="boolean"&&_?g?this.addClass(s):this.removeClass(s):(u=y(s),this.each(function(){if(_)for(b=n(this),v=0;v<u.length;v++)d=u[v],b.hasClass(d)?b.removeClass(d):b.addClass(d);else(s===void 0||T==="boolean")&&(d=h(this),d&&o.set(this,"__className__",d),this.setAttribute&&this.setAttribute("class",d||s===!1?"":o.get(this,"__className__")||""))}))},hasClass:function(s){var g,u,d=0;for(g=" "+s+" ";u=this[d++];)if(u.nodeType===1&&(" "+p(h(u))+" ").indexOf(g)>-1)return!0;return!1}})}.apply(m,l),i!==void 0&&(w.exports=i)},9165:(w,m,r)=>{var l,i;l=[r(8411),r(9266),r(1382),r(3814),r(9978),r(2569),r(7957),r(4553)],i=function(n,p,f){"use strict";n.fn.load=function(c,o,h){var y,s,g,u=this,d=c.indexOf(" ");return d>-1&&(y=p(c.slice(d)),c=c.slice(0,d)),f(o)?(h=o,o=void 0):o&&typeof o=="object"&&(s="POST"),u.length>0&&n.ajax({url:c,type:s||"GET",dataType:"html",data:o}).done(function(v){g=arguments,u.html(y?n("<div>").append(n.parseHTML(v)).find(y):v)}).always(h&&function(v,b){u.each(function(){h.apply(this,g||[v.responseText,b,v])})}),this}}.apply(m,l),i!==void 0&&(w.exports=i)},9192:(w,m,r)=>{var l,i;l=[r(4172)],i=function(n){"use strict";return new n}.apply(m,l),i!==void 0&&(w.exports=i)},9229:(w,m,r)=>{var l,i;l=[r(8411),r(6756),r(9758),r(9773),r(403),r(945),r(8064),r(1483),r(3934),r(1821),r(9617),r(5748),r(3629),r(541),r(5744),r(9340),r(1791),r(4553)],i=function(n,p,f,c,o,h,y,s,g,u,d,v,b,T,_){"use strict";var A=/^(none|table(?!-c[ea]).+)/,E={position:"absolute",visibility:"hidden",display:"block"},I={letterSpacing:"0",fontWeight:"400"};function N(D,P,R){var O=o.exec(P);return O?Math.max(0,O[2]-(R||0))+(O[3]||"px"):P}function B(D,P,R,O,H,$){var j=P==="width"?1:0,G=0,L=0,W=0;if(R===(O?"border":"content"))return 0;for(;j<4;j+=2)R==="margin"&&(W+=n.css(D,R+s[j],!0,H)),O?(R==="content"&&(L-=n.css(D,"padding"+s[j],!0,H)),R!=="margin"&&(L-=n.css(D,"border"+s[j]+"Width",!0,H))):(L+=n.css(D,"padding"+s[j],!0,H),R!=="padding"?L+=n.css(D,"border"+s[j]+"Width",!0,H):G+=n.css(D,"border"+s[j]+"Width",!0,H));return!O&&$>=0&&(L+=Math.max(0,Math.ceil(D["offset"+P[0].toUpperCase()+P.slice(1)]-$-L-G-.5))||0),L+W}function C(D,P,R){var O=g(D),H=!T.boxSizingReliable()||R,$=H&&n.css(D,"boxSizing",!1,O)==="border-box",j=$,G=d(D,P,O),L="offset"+P[0].toUpperCase()+P.slice(1);if(h.test(G)){if(!R)return G;G="auto"}return(!T.boxSizingReliable()&&$||!T.reliableTrDimensions()&&c(D,"tr")||G==="auto"||!parseFloat(G)&&n.css(D,"display",!1,O)==="inline")&&D.getClientRects().length&&($=n.css(D,"boxSizing",!1,O)==="border-box",j=L in D,j&&(G=D[L])),G=parseFloat(G)||0,G+B(D,P,R||($?"border":"content"),j,O,G)+"px"}return n.extend({cssHooks:{opacity:{get:function(D,P){if(P){var R=d(D,"opacity");return R===""?"1":R}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(D,P,R,O){if(!(!D||D.nodeType===3||D.nodeType===8||!D.style)){var H,$,j,G=f(P),L=y.test(P),W=D.style;if(L||(P=_(G)),j=n.cssHooks[P]||n.cssHooks[G],R!==void 0){if($=typeof R,$==="string"&&(H=o.exec(R))&&H[1]&&(R=v(D,P,H),$="number"),R==null||R!==R)return;$==="number"&&!L&&(R+=H&&H[3]||(n.cssNumber[G]?"":"px")),!T.clearCloneStyle&&R===""&&P.indexOf("background")===0&&(W[P]="inherit"),(!j||!("set"in j)||(R=j.set(D,R,O))!==void 0)&&(L?W.setProperty(P,R):W[P]=R)}else return j&&"get"in j&&(H=j.get(D,!1,O))!==void 0?H:W[P]}},css:function(D,P,R,O){var H,$,j,G=f(P),L=y.test(P);return L||(P=_(G)),j=n.cssHooks[P]||n.cssHooks[G],j&&"get"in j&&(H=j.get(D,!0,R)),H===void 0&&(H=d(D,P,O)),H==="normal"&&P in I&&(H=I[P]),R===""||R?($=parseFloat(H),R===!0||isFinite($)?$||0:H):H}}),n.each(["height","width"],function(D,P){n.cssHooks[P]={get:function(R,O,H){if(O)return A.test(n.css(R,"display"))&&(!R.getClientRects().length||!R.getBoundingClientRect().width)?u(R,E,function(){return C(R,P,H)}):C(R,P,H)},set:function(R,O,H){var $,j=g(R),G=!T.scrollboxSize()&&j.position==="absolute",L=G||H,W=L&&n.css(R,"boxSizing",!1,j)==="border-box",U=H?B(R,P,H,W,j):0;return W&&G&&(U-=Math.ceil(R["offset"+P[0].toUpperCase()+P.slice(1)]-parseFloat(j[P])-B(R,P,"border",!1,j)-.5)),U&&($=o.exec(O))&&($[3]||"px")!=="px"&&(R.style[P]=O,O=n.css(R,P)),N(R,O,U)}}}),n.cssHooks.marginLeft=b(T.reliableMarginLeft,function(D,P){if(P)return(parseFloat(d(D,"marginLeft"))||D.getBoundingClientRect().left-u(D,{marginLeft:0},function(){return D.getBoundingClientRect().left}))+"px"}),n.each({margin:"",padding:"",border:"Width"},function(D,P){n.cssHooks[D+P]={expand:function(R){for(var O=0,H={},$=typeof R=="string"?R.split(" "):[R];O<4;O++)H[D+s[O]+P]=$[O]||$[O-2]||$[0];return H}},D!=="margin"&&(n.cssHooks[D+P].set=N)}),n.fn.extend({css:function(D,P){return p(this,function(R,O,H){var $,j,G={},L=0;if(Array.isArray(O)){for($=g(R),j=O.length;L<j;L++)G[O[L]]=n.css(R,O[L],!1,$);return G}return H!==void 0?n.style(R,O,H):n.css(R,O)},D,P,arguments.length>1)}}),n}.apply(m,l),i!==void 0&&(w.exports=i)},9266:(w,m,r)=>{var l,i;l=[r(9091)],i=function(n){"use strict";function p(f){var c=f.match(n)||[];return c.join(" ")}return p}.apply(m,l),i!==void 0&&(w.exports=i)},9340:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(1382),r(3894),r(8269)],i=function(n,p,f,c){"use strict";var o,h=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,y=n.fn.init=function(s,g,u){var d,v;if(!s)return this;if(u=u||o,typeof s=="string")if(s[0]==="<"&&s[s.length-1]===">"&&s.length>=3?d=[null,s,null]:d=h.exec(s),d&&(d[1]||!g))if(d[1]){if(g=g instanceof n?g[0]:g,n.merge(this,n.parseHTML(d[1],g&&g.nodeType?g.ownerDocument||g:p,!0)),c.test(d[1])&&n.isPlainObject(g))for(d in g)f(this[d])?this[d](g[d]):this.attr(d,g[d]);return this}else return v=p.getElementById(d[2]),v&&(this[0]=v,this.length=1),this;else return!g||g.jquery?(g||u).find(s):this.constructor(g).find(s);else{if(s.nodeType)return this[0]=s,this.length=1,this;if(f(s))return u.ready!==void 0?u.ready(s):s(n)}return n.makeArray(s,this)};return y.prototype=n.fn,o=n(p),y}.apply(m,l),i!==void 0&&(w.exports=i)},9445:()=>{(function(){if(typeof Prism=="undefined"||typeof document=="undefined")return;if(!Prism.plugins.toolbar){console.warn("Copy to Clipboard plugin loaded before Toolbar plugin.");return}function w(n,p){n.addEventListener("click",function(){r(p)})}function m(n){var p=document.createElement("textarea");p.value=n.getText(),p.style.top="0",p.style.left="0",p.style.position="fixed",document.body.appendChild(p),p.focus(),p.select();try{var f=document.execCommand("copy");setTimeout(function(){f?n.success():n.error()},1)}catch(c){setTimeout(function(){n.error(c)},1)}document.body.removeChild(p)}function r(n){navigator.clipboard?navigator.clipboard.writeText(n.getText()).then(n.success,function(){m(n)}):m(n)}function l(n){window.getSelection().selectAllChildren(n)}function i(n){var p={copy:"Copy","copy-error":"Press Ctrl+C to copy","copy-success":"Copied!","copy-timeout":5e3},f="data-prismjs-";for(var c in p){for(var o=f+c,h=n;h&&!h.hasAttribute(o);)h=h.parentElement;h&&(p[c]=h.getAttribute(o))}return p}Prism.plugins.toolbar.registerButton("copy-to-clipboard",function(n){var p=n.element,f=i(p),c=document.createElement("button");c.className="copy-to-clipboard-button",c.setAttribute("type","button");var o=document.createElement("span");return c.appendChild(o),y("copy"),w(c,{getText:function(){return p.textContent},success:function(){y("copy-success"),h()},error:function(){y("copy-error"),setTimeout(function(){l(p)},1),h()}}),c;function h(){setTimeout(function(){y("copy")},f["copy-timeout"])}function y(s){o.textContent=f[s],c.setAttribute("data-copy-state",s)}})})()},9518:(w,m,r)=>{var l,i;l=[r(2283)],i=function(n){"use strict";return n.sort}.apply(m,l),i!==void 0&&(w.exports=i)},9589:(w,m,r)=>{"use strict";const l=r(9718),i=r(6874),n=r(3908),p=r(1123),f=r(144),c=r(6953),o=r(5033),h=r(3007),y=r(1832),s=r(2938),g=r(6254),u=r(4493),d=r(1729),v=r(560),b=r(9970),T=r(1763),_=r(909),A=r(3927),E=r(4277),I=r(5580),N=r(7059),B=r(4641),C=r(3999),D=r(4089),P=r(5200),R=r(2111),O=r(6170),H=r(3904),$=r(8311),j=r(7638),G=r(7631),L=r(9628),W=r(270),U=r(1261),Q=r(3874),ne=r(7075),se=r(5571),X=r(5342),ge=r(6780),be=r(2525),_e=r(5032);w.exports={parse:f,valid:c,clean:o,inc:h,diff:y,major:s,minor:g,patch:u,prerelease:d,compare:v,rcompare:b,compareLoose:T,compareBuild:_,sort:A,rsort:E,gt:I,lt:N,eq:B,neq:C,gte:D,lte:P,cmp:R,coerce:O,Comparator:H,Range:$,satisfies:j,toComparators:G,maxSatisfying:L,minSatisfying:W,minVersion:U,validRange:Q,outside:ne,gtr:se,ltr:X,intersects:ge,simplifyRange:be,subset:_e,SemVer:n,re:l.re,src:l.src,tokens:l.t,SEMVER_SPEC_VERSION:i.SEMVER_SPEC_VERSION,RELEASE_TYPES:i.RELEASE_TYPES,compareIdentifiers:p.compareIdentifiers,rcompareIdentifiers:p.rcompareIdentifiers}},9617:(w,m,r)=>{var l,i;l=[r(8411),r(5194),r(8088),r(945),r(3934),r(8064),r(8919),r(541)],i=function(n,p,f,c,o,h,y,s){"use strict";function g(u,d,v){var b,T,_,A,E=h.test(d),I=u.style;return v=v||o(u),v&&(A=v.getPropertyValue(d)||v[d],E&&A&&(A=A.replace(y,"$1")||void 0),A===""&&!p(u)&&(A=n.style(u,d)),!s.pixelBoxStyles()&&c.test(A)&&f.test(d)&&(b=I.width,T=I.minWidth,_=I.maxWidth,I.minWidth=I.maxWidth=I.width=A,A=v.width,I.width=b,I.minWidth=T,I.maxWidth=_)),A!==void 0?A+"":A}return g}.apply(m,l),i!==void 0&&(w.exports=i)},9619:(w,m,r)=>{var l;l=function(){"use strict";return"[\\x20\\t\\r\\n\\f]"}.call(m,r,m,w),l!==void 0&&(w.exports=l)},9628:(w,m,r)=>{"use strict";const l=r(3908),i=r(8311),n=(p,f,c)=>{let o=null,h=null,y=null;try{y=new i(f,c)}catch(s){return null}return p.forEach(s=>{y.test(s)&&(!o||h.compare(s)===-1)&&(o=s,h=new l(o,c))}),o};w.exports=n},9718:(w,m,r)=>{"use strict";const{MAX_SAFE_COMPONENT_LENGTH:l,MAX_SAFE_BUILD_LENGTH:i,MAX_LENGTH:n}=r(6874),p=r(7272);m=w.exports={};const f=m.re=[],c=m.safeRe=[],o=m.src=[],h=m.safeSrc=[],y=m.t={};let s=0;const g="[a-zA-Z0-9-]",u=[["\\s",1],["\\d",n],[g,i]],d=b=>{for(const[T,_]of u)b=b.split(`${T}*`).join(`${T}{0,${_}}`).split(`${T}+`).join(`${T}{1,${_}}`);return b},v=(b,T,_)=>{const A=d(T),E=s++;p(b,E,T),y[b]=E,o[E]=T,h[E]=A,f[E]=new RegExp(T,_?"g":void 0),c[E]=new RegExp(A,_?"g":void 0)};v("NUMERICIDENTIFIER","0|[1-9]\\d*"),v("NUMERICIDENTIFIERLOOSE","\\d+"),v("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${g}*`),v("MAINVERSION",`(${o[y.NUMERICIDENTIFIER]})\\.(${o[y.NUMERICIDENTIFIER]})\\.(${o[y.NUMERICIDENTIFIER]})`),v("MAINVERSIONLOOSE",`(${o[y.NUMERICIDENTIFIERLOOSE]})\\.(${o[y.NUMERICIDENTIFIERLOOSE]})\\.(${o[y.NUMERICIDENTIFIERLOOSE]})`),v("PRERELEASEIDENTIFIER",`(?:${o[y.NONNUMERICIDENTIFIER]}|${o[y.NUMERICIDENTIFIER]})`),v("PRERELEASEIDENTIFIERLOOSE",`(?:${o[y.NONNUMERICIDENTIFIER]}|${o[y.NUMERICIDENTIFIERLOOSE]})`),v("PRERELEASE",`(?:-(${o[y.PRERELEASEIDENTIFIER]}(?:\\.${o[y.PRERELEASEIDENTIFIER]})*))`),v("PRERELEASELOOSE",`(?:-?(${o[y.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[y.PRERELEASEIDENTIFIERLOOSE]})*))`),v("BUILDIDENTIFIER",`${g}+`),v("BUILD",`(?:\\+(${o[y.BUILDIDENTIFIER]}(?:\\.${o[y.BUILDIDENTIFIER]})*))`),v("FULLPLAIN",`v?${o[y.MAINVERSION]}${o[y.PRERELEASE]}?${o[y.BUILD]}?`),v("FULL",`^${o[y.FULLPLAIN]}$`),v("LOOSEPLAIN",`[v=\\s]*${o[y.MAINVERSIONLOOSE]}${o[y.PRERELEASELOOSE]}?${o[y.BUILD]}?`),v("LOOSE",`^${o[y.LOOSEPLAIN]}$`),v("GTLT","((?:<|>)?=?)"),v("XRANGEIDENTIFIERLOOSE",`${o[y.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),v("XRANGEIDENTIFIER",`${o[y.NUMERICIDENTIFIER]}|x|X|\\*`),v("XRANGEPLAIN",`[v=\\s]*(${o[y.XRANGEIDENTIFIER]})(?:\\.(${o[y.XRANGEIDENTIFIER]})(?:\\.(${o[y.XRANGEIDENTIFIER]})(?:${o[y.PRERELEASE]})?${o[y.BUILD]}?)?)?`),v("XRANGEPLAINLOOSE",`[v=\\s]*(${o[y.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[y.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[y.XRANGEIDENTIFIERLOOSE]})(?:${o[y.PRERELEASELOOSE]})?${o[y.BUILD]}?)?)?`),v("XRANGE",`^${o[y.GTLT]}\\s*${o[y.XRANGEPLAIN]}$`),v("XRANGELOOSE",`^${o[y.GTLT]}\\s*${o[y.XRANGEPLAINLOOSE]}$`),v("COERCEPLAIN",`(^|[^\\d])(\\d{1,${l}})(?:\\.(\\d{1,${l}}))?(?:\\.(\\d{1,${l}}))?`),v("COERCE",`${o[y.COERCEPLAIN]}(?:$|[^\\d])`),v("COERCEFULL",o[y.COERCEPLAIN]+`(?:${o[y.PRERELEASE]})?(?:${o[y.BUILD]})?(?:$|[^\\d])`),v("COERCERTL",o[y.COERCE],!0),v("COERCERTLFULL",o[y.COERCEFULL],!0),v("LONETILDE","(?:~>?)"),v("TILDETRIM",`(\\s*)${o[y.LONETILDE]}\\s+`,!0),m.tildeTrimReplace="$1~",v("TILDE",`^${o[y.LONETILDE]}${o[y.XRANGEPLAIN]}$`),v("TILDELOOSE",`^${o[y.LONETILDE]}${o[y.XRANGEPLAINLOOSE]}$`),v("LONECARET","(?:\\^)"),v("CARETTRIM",`(\\s*)${o[y.LONECARET]}\\s+`,!0),m.caretTrimReplace="$1^",v("CARET",`^${o[y.LONECARET]}${o[y.XRANGEPLAIN]}$`),v("CARETLOOSE",`^${o[y.LONECARET]}${o[y.XRANGEPLAINLOOSE]}$`),v("COMPARATORLOOSE",`^${o[y.GTLT]}\\s*(${o[y.LOOSEPLAIN]})$|^$`),v("COMPARATOR",`^${o[y.GTLT]}\\s*(${o[y.FULLPLAIN]})$|^$`),v("COMPARATORTRIM",`(\\s*)${o[y.GTLT]}\\s*(${o[y.LOOSEPLAIN]}|${o[y.XRANGEPLAIN]})`,!0),m.comparatorTrimReplace="$1$2$3",v("HYPHENRANGE",`^\\s*(${o[y.XRANGEPLAIN]})\\s+-\\s+(${o[y.XRANGEPLAIN]})\\s*$`),v("HYPHENRANGELOOSE",`^\\s*(${o[y.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[y.XRANGEPLAINLOOSE]})\\s*$`),v("STAR","(<|>)?=?\\s*\\*"),v("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),v("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")},9758:(w,m)=>{var r,l;r=[],l=function(){"use strict";var i=/^-ms-/,n=/-([a-z])/g;function p(c,o){return o.toUpperCase()}function f(c){return c.replace(i,"ms-").replace(n,p)}return f}.apply(m,r),l!==void 0&&(w.exports=l)},9773:(w,m,r)=>{var l;l=function(){"use strict";function i(n,p){return n.nodeName&&n.nodeName.toLowerCase()===p.toLowerCase()}return i}.call(m,r,m,w),l!==void 0&&(w.exports=l)},9898:()=>{+function(w){"use strict";var m=["sanitize","whiteList","sanitizeFn"],r=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],l=/^aria-[\w-]*$/i,i={"*":["class","dir","id","lang","role",l],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},n=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,p=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function f(s,g){var u=s.nodeName.toLowerCase();if(w.inArray(u,g)!==-1)return w.inArray(u,r)!==-1?Boolean(s.nodeValue.match(n)||s.nodeValue.match(p)):!0;for(var d=w(g).filter(function(T,_){return _ instanceof RegExp}),v=0,b=d.length;v<b;v++)if(u.match(d[v]))return!0;return!1}function c(s,g,u){if(s.length===0)return s;if(u&&typeof u=="function")return u(s);if(!document.implementation||!document.implementation.createHTMLDocument)return s;var d=document.implementation.createHTMLDocument("sanitization");d.body.innerHTML=s;for(var v=w.map(g,function(D,P){return P}),b=w(d.body).find("*"),T=0,_=b.length;T<_;T++){var A=b[T],E=A.nodeName.toLowerCase();if(w.inArray(E,v)===-1){A.parentNode.removeChild(A);continue}for(var I=w.map(A.attributes,function(D){return D}),N=[].concat(g["*"]||[],g[E]||[]),B=0,C=I.length;B<C;B++)f(I[B],N)||A.removeAttribute(I[B].nodeName)}return d.body.innerHTML}var o=function(s,g){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",s,g)};o.VERSION="3.4.1",o.TRANSITION_DURATION=150,o.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0},sanitize:!0,sanitizeFn:null,whiteList:i},o.prototype.init=function(s,g,u){if(this.enabled=!0,this.type=s,this.$element=w(g),this.options=this.getOptions(u),this.$viewport=this.options.viewport&&w(document).find(w.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var d=this.options.trigger.split(" "),v=d.length;v--;){var b=d[v];if(b=="click")this.$element.on("click."+this.type,this.options.selector,w.proxy(this.toggle,this));else if(b!="manual"){var T=b=="hover"?"mouseenter":"focusin",_=b=="hover"?"mouseleave":"focusout";this.$element.on(T+"."+this.type,this.options.selector,w.proxy(this.enter,this)),this.$element.on(_+"."+this.type,this.options.selector,w.proxy(this.leave,this))}}this.options.selector?this._options=w.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},o.prototype.getDefaults=function(){return o.DEFAULTS},o.prototype.getOptions=function(s){var g=this.$element.data();for(var u in g)g.hasOwnProperty(u)&&w.inArray(u,m)!==-1&&delete g[u];return s=w.extend({},this.getDefaults(),g,s),s.delay&&typeof s.delay=="number"&&(s.delay={show:s.delay,hide:s.delay}),s.sanitize&&(s.template=c(s.template,s.whiteList,s.sanitizeFn)),s},o.prototype.getDelegateOptions=function(){var s={},g=this.getDefaults();return this._options&&w.each(this._options,function(u,d){g[u]!=d&&(s[u]=d)}),s},o.prototype.enter=function(s){var g=s instanceof this.constructor?s:w(s.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),w(s.currentTarget).data("bs."+this.type,g)),s instanceof w.Event&&(g.inState[s.type=="focusin"?"focus":"hover"]=!0),g.tip().hasClass("in")||g.hoverState=="in"){g.hoverState="in";return}if(clearTimeout(g.timeout),g.hoverState="in",!g.options.delay||!g.options.delay.show)return g.show();g.timeout=setTimeout(function(){g.hoverState=="in"&&g.show()},g.options.delay.show)},o.prototype.isInStateTrue=function(){for(var s in this.inState)if(this.inState[s])return!0;return!1},o.prototype.leave=function(s){var g=s instanceof this.constructor?s:w(s.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),w(s.currentTarget).data("bs."+this.type,g)),s instanceof w.Event&&(g.inState[s.type=="focusout"?"focus":"hover"]=!1),!g.isInStateTrue()){if(clearTimeout(g.timeout),g.hoverState="out",!g.options.delay||!g.options.delay.hide)return g.hide();g.timeout=setTimeout(function(){g.hoverState=="out"&&g.hide()},g.options.delay.hide)}},o.prototype.show=function(){var s=w.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(s);var g=w.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(s.isDefaultPrevented()||!g)return;var u=this,d=this.tip(),v=this.getUID(this.type);this.setContent(),d.attr("id",v),this.$element.attr("aria-describedby",v),this.options.animation&&d.addClass("fade");var b=typeof this.options.placement=="function"?this.options.placement.call(this,d[0],this.$element[0]):this.options.placement,T=/\s?auto?\s?/i,_=T.test(b);_&&(b=b.replace(T,"")||"top"),d.detach().css({top:0,left:0,display:"block"}).addClass(b).data("bs."+this.type,this),this.options.container?d.appendTo(w(document).find(this.options.container)):d.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var A=this.getPosition(),E=d[0].offsetWidth,I=d[0].offsetHeight;if(_){var N=b,B=this.getPosition(this.$viewport);b=b=="bottom"&&A.bottom+I>B.bottom?"top":b=="top"&&A.top-I<B.top?"bottom":b=="right"&&A.right+E>B.width?"left":b=="left"&&A.left-E<B.left?"right":b,d.removeClass(N).addClass(b)}var C=this.getCalculatedOffset(b,A,E,I);this.applyPlacement(C,b);var D=function(){var P=u.hoverState;u.$element.trigger("shown.bs."+u.type),u.hoverState=null,P=="out"&&u.leave(u)};w.support.transition&&this.$tip.hasClass("fade")?d.one("bsTransitionEnd",D).emulateTransitionEnd(o.TRANSITION_DURATION):D()}},o.prototype.applyPlacement=function(s,g){var u=this.tip(),d=u[0].offsetWidth,v=u[0].offsetHeight,b=parseInt(u.css("margin-top"),10),T=parseInt(u.css("margin-left"),10);isNaN(b)&&(b=0),isNaN(T)&&(T=0),s.top+=b,s.left+=T,w.offset.setOffset(u[0],w.extend({using:function(C){u.css({top:Math.round(C.top),left:Math.round(C.left)})}},s),0),u.addClass("in");var _=u[0].offsetWidth,A=u[0].offsetHeight;g=="top"&&A!=v&&(s.top=s.top+v-A);var E=this.getViewportAdjustedDelta(g,s,_,A);E.left?s.left+=E.left:s.top+=E.top;var I=/top|bottom/.test(g),N=I?E.left*2-d+_:E.top*2-v+A,B=I?"offsetWidth":"offsetHeight";u.offset(s),this.replaceArrow(N,u[0][B],I)},o.prototype.replaceArrow=function(s,g,u){this.arrow().css(u?"left":"top",50*(1-s/g)+"%").css(u?"top":"left","")},o.prototype.setContent=function(){var s=this.tip(),g=this.getTitle();this.options.html?(this.options.sanitize&&(g=c(g,this.options.whiteList,this.options.sanitizeFn)),s.find(".tooltip-inner").html(g)):s.find(".tooltip-inner").text(g),s.removeClass("fade in top bottom left right")},o.prototype.hide=function(s){var g=this,u=w(this.$tip),d=w.Event("hide.bs."+this.type);function v(){g.hoverState!="in"&&u.detach(),g.$element&&g.$element.removeAttr("aria-describedby").trigger("hidden.bs."+g.type),s&&s()}if(this.$element.trigger(d),!d.isDefaultPrevented())return u.removeClass("in"),w.support.transition&&u.hasClass("fade")?u.one("bsTransitionEnd",v).emulateTransitionEnd(o.TRANSITION_DURATION):v(),this.hoverState=null,this},o.prototype.fixTitle=function(){var s=this.$element;(s.attr("title")||typeof s.attr("data-original-title")!="string")&&s.attr("data-original-title",s.attr("title")||"").attr("title","")},o.prototype.hasContent=function(){return this.getTitle()},o.prototype.getPosition=function(s){s=s||this.$element;var g=s[0],u=g.tagName=="BODY",d=g.getBoundingClientRect();d.width==null&&(d=w.extend({},d,{width:d.right-d.left,height:d.bottom-d.top}));var v=window.SVGElement&&g instanceof window.SVGElement,b=u?{top:0,left:0}:v?null:s.offset(),T={scroll:u?document.documentElement.scrollTop||document.body.scrollTop:s.scrollTop()},_=u?{width:w(window).width(),height:w(window).height()}:null;return w.extend({},d,T,_,b)},o.prototype.getCalculatedOffset=function(s,g,u,d){return s=="bottom"?{top:g.top+g.height,left:g.left+g.width/2-u/2}:s=="top"?{top:g.top-d,left:g.left+g.width/2-u/2}:s=="left"?{top:g.top+g.height/2-d/2,left:g.left-u}:{top:g.top+g.height/2-d/2,left:g.left+g.width}},o.prototype.getViewportAdjustedDelta=function(s,g,u,d){var v={top:0,left:0};if(!this.$viewport)return v;var b=this.options.viewport&&this.options.viewport.padding||0,T=this.getPosition(this.$viewport);if(/right|left/.test(s)){var _=g.top-b-T.scroll,A=g.top+b-T.scroll+d;_<T.top?v.top=T.top-_:A>T.top+T.height&&(v.top=T.top+T.height-A)}else{var E=g.left-b,I=g.left+b+u;E<T.left?v.left=T.left-E:I>T.right&&(v.left=T.left+T.width-I)}return v},o.prototype.getTitle=function(){var s,g=this.$element,u=this.options;return s=g.attr("data-original-title")||(typeof u.title=="function"?u.title.call(g[0]):u.title),s},o.prototype.getUID=function(s){do s+=~~(Math.random()*1e6);while(document.getElementById(s));return s},o.prototype.tip=function(){if(!this.$tip&&(this.$tip=w(this.options.template),this.$tip.length!=1))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},o.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},o.prototype.enable=function(){this.enabled=!0},o.prototype.disable=function(){this.enabled=!1},o.prototype.toggleEnabled=function(){this.enabled=!this.enabled},o.prototype.toggle=function(s){var g=this;s&&(g=w(s.currentTarget).data("bs."+this.type),g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),w(s.currentTarget).data("bs."+this.type,g))),s?(g.inState.click=!g.inState.click,g.isInStateTrue()?g.enter(g):g.leave(g)):g.tip().hasClass("in")?g.leave(g):g.enter(g)},o.prototype.destroy=function(){var s=this;clearTimeout(this.timeout),this.hide(function(){s.$element.off("."+s.type).removeData("bs."+s.type),s.$tip&&s.$tip.detach(),s.$tip=null,s.$arrow=null,s.$viewport=null,s.$element=null})},o.prototype.sanitizeHtml=function(s){return c(s,this.options.whiteList,this.options.sanitizeFn)};function h(s){return this.each(function(){var g=w(this),u=g.data("bs.tooltip"),d=typeof s=="object"&&s;!u&&/destroy|hide/.test(s)||(u||g.data("bs.tooltip",u=new o(this,d)),typeof s=="string"&&u[s]())})}var y=w.fn.tooltip;w.fn.tooltip=h,w.fn.tooltip.Constructor=o,w.fn.tooltip.noConflict=function(){return w.fn.tooltip=y,this}}(jQuery)},9954:()=>{+function(w){"use strict";var m=function(n){this.element=w(n)};m.VERSION="3.4.1",m.TRANSITION_DURATION=150,m.prototype.show=function(){var n=this.element,p=n.closest("ul:not(.dropdown-menu)"),f=n.data("target");if(f||(f=n.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,"")),!n.parent("li").hasClass("active")){var c=p.find(".active:last a"),o=w.Event("hide.bs.tab",{relatedTarget:n[0]}),h=w.Event("show.bs.tab",{relatedTarget:c[0]});if(c.trigger(o),n.trigger(h),!(h.isDefaultPrevented()||o.isDefaultPrevented())){var y=w(document).find(f);this.activate(n.closest("li"),p),this.activate(y,y.parent(),function(){c.trigger({type:"hidden.bs.tab",relatedTarget:n[0]}),n.trigger({type:"shown.bs.tab",relatedTarget:c[0]})})}}},m.prototype.activate=function(n,p,f){var c=p.find("> .active"),o=f&&w.support.transition&&(c.length&&c.hasClass("fade")||!!p.find("> .fade").length);function h(){c.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),n.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),o?(n[0].offsetWidth,n.addClass("in")):n.removeClass("fade"),n.parent(".dropdown-menu").length&&n.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),f&&f()}c.length&&o?c.one("bsTransitionEnd",h).emulateTransitionEnd(m.TRANSITION_DURATION):h(),c.removeClass("in")};function r(n){return this.each(function(){var p=w(this),f=p.data("bs.tab");f||p.data("bs.tab",f=new m(this)),typeof n=="string"&&f[n]()})}var l=w.fn.tab;w.fn.tab=r,w.fn.tab.Constructor=m,w.fn.tab.noConflict=function(){return w.fn.tab=l,this};var i=function(n){n.preventDefault(),r.call(w(this),"show")};w(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',i).on("click.bs.tab.data-api",'[data-toggle="pill"]',i)}(jQuery)},9970:(w,m,r)=>{"use strict";const l=r(560),i=(n,p,f)=>l(p,n,f);w.exports=i},9978:(w,m,r)=>{var l,i;l=[r(8411),r(8543),r(1382),r(9091),r(5780),r(1628),r(1205),r(9340),r(1074),r(3985),r(6599),r(3040)],i=function(n,p,f,c,o,h,y){"use strict";var s=/%20/g,g=/#.*$/,u=/([?&])_=[^&]*/,d=/^(.*?):[ \t]*([^\r\n]*)$/mg,v=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,b=/^(?:GET|HEAD)$/,T=/^\/\//,_={},A={},E="*/".concat("*"),I=p.createElement("a");I.href=o.href;function N(R){return function(O,H){typeof O!="string"&&(H=O,O="*");var $,j=0,G=O.toLowerCase().match(c)||[];if(f(H))for(;$=G[j++];)$[0]==="+"?($=$.slice(1)||"*",(R[$]=R[$]||[]).unshift(H)):(R[$]=R[$]||[]).push(H)}}function B(R,O,H,$){var j={},G=R===A;function L(W){var U;return j[W]=!0,n.each(R[W]||[],function(Q,ne){var se=ne(O,H,$);if(typeof se=="string"&&!G&&!j[se])return O.dataTypes.unshift(se),L(se),!1;if(G)return!(U=se)}),U}return L(O.dataTypes[0])||!j["*"]&&L("*")}function C(R,O){var H,$,j=n.ajaxSettings.flatOptions||{};for(H in O)O[H]!==void 0&&((j[H]?R:$||($={}))[H]=O[H]);return $&&n.extend(!0,R,$),R}function D(R,O,H){for(var $,j,G,L,W=R.contents,U=R.dataTypes;U[0]==="*";)U.shift(),$===void 0&&($=R.mimeType||O.getResponseHeader("Content-Type"));if($){for(j in W)if(W[j]&&W[j].test($)){U.unshift(j);break}}if(U[0]in H)G=U[0];else{for(j in H){if(!U[0]||R.converters[j+" "+U[0]]){G=j;break}L||(L=j)}G=G||L}if(G)return G!==U[0]&&U.unshift(G),H[G]}function P(R,O,H,$){var j,G,L,W,U,Q={},ne=R.dataTypes.slice();if(ne[1])for(L in R.converters)Q[L.toLowerCase()]=R.converters[L];for(G=ne.shift();G;)if(R.responseFields[G]&&(H[R.responseFields[G]]=O),!U&&$&&R.dataFilter&&(O=R.dataFilter(O,R.dataType)),U=G,G=ne.shift(),G){if(G==="*")G=U;else if(U!=="*"&&U!==G){if(L=Q[U+" "+G]||Q["* "+G],!L){for(j in Q)if(W=j.split(" "),W[1]===G&&(L=Q[U+" "+W[0]]||Q["* "+W[0]],L)){L===!0?L=Q[j]:Q[j]!==!0&&(G=W[0],ne.unshift(W[1]));break}}if(L!==!0)if(L&&R.throws)O=L(O);else try{O=L(O)}catch(se){return{state:"parsererror",error:L?se:"No conversion from "+U+" to "+G}}}}return{state:"success",data:O}}return n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:o.href,type:"GET",isLocal:v.test(o.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":E,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(R,O){return O?C(C(R,n.ajaxSettings),O):C(n.ajaxSettings,R)},ajaxPrefilter:N(_),ajaxTransport:N(A),ajax:function(R,O){typeof R=="object"&&(O=R,R=void 0),O=O||{};var H,$,j,G,L,W,U,Q,ne,se,X=n.ajaxSetup({},O),ge=X.context||X,be=X.context&&(ge.nodeType||ge.jquery)?n(ge):n.event,_e=n.Deferred(),Be=n.Callbacks("once memory"),st=X.statusCode||{},bt={},At={},Dt="canceled",fe={readyState:0,getResponseHeader:function(Te){var Le;if(U){if(!G)for(G={};Le=d.exec(j);)G[Le[1].toLowerCase()+" "]=(G[Le[1].toLowerCase()+" "]||[]).concat(Le[2]);Le=G[Te.toLowerCase()+" "]}return Le==null?null:Le.join(", ")},getAllResponseHeaders:function(){return U?j:null},setRequestHeader:function(Te,Le){return U==null&&(Te=At[Te.toLowerCase()]=At[Te.toLowerCase()]||Te,bt[Te]=Le),this},overrideMimeType:function(Te){return U==null&&(X.mimeType=Te),this},statusCode:function(Te){var Le;if(Te)if(U)fe.always(Te[fe.status]);else for(Le in Te)st[Le]=[st[Le],Te[Le]];return this},abort:function(Te){var Le=Te||Dt;return H&&H.abort(Le),xe(0,Le),this}};if(_e.promise(fe),X.url=((R||X.url||o.href)+"").replace(T,o.protocol+"//"),X.type=O.method||O.type||X.method||X.type,X.dataTypes=(X.dataType||"*").toLowerCase().match(c)||[""],X.crossDomain==null){W=p.createElement("a");try{W.href=X.url,W.href=W.href,X.crossDomain=I.protocol+"//"+I.host!=W.protocol+"//"+W.host}catch(Te){X.crossDomain=!0}}if(X.data&&X.processData&&typeof X.data!="string"&&(X.data=n.param(X.data,X.traditional)),B(_,X,O,fe),U)return fe;Q=n.event&&X.global,Q&&n.active++===0&&n.event.trigger("ajaxStart"),X.type=X.type.toUpperCase(),X.hasContent=!b.test(X.type),$=X.url.replace(g,""),X.hasContent?X.data&&X.processData&&(X.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&(X.data=X.data.replace(s,"+")):(se=X.url.slice($.length),X.data&&(X.processData||typeof X.data=="string")&&($+=(y.test($)?"&":"?")+X.data,delete X.data),X.cache===!1&&($=$.replace(u,"$1"),se=(y.test($)?"&":"?")+"_="+h.guid+++se),X.url=$+se),X.ifModified&&(n.lastModified[$]&&fe.setRequestHeader("If-Modified-Since",n.lastModified[$]),n.etag[$]&&fe.setRequestHeader("If-None-Match",n.etag[$])),(X.data&&X.hasContent&&X.contentType!==!1||O.contentType)&&fe.setRequestHeader("Content-Type",X.contentType),fe.setRequestHeader("Accept",X.dataTypes[0]&&X.accepts[X.dataTypes[0]]?X.accepts[X.dataTypes[0]]+(X.dataTypes[0]!=="*"?", "+E+"; q=0.01":""):X.accepts["*"]);for(ne in X.headers)fe.setRequestHeader(ne,X.headers[ne]);if(X.beforeSend&&(X.beforeSend.call(ge,fe,X)===!1||U))return fe.abort();if(Dt="abort",Be.add(X.complete),fe.done(X.success),fe.fail(X.error),H=B(A,X,O,fe),!H)xe(-1,"No Transport");else{if(fe.readyState=1,Q&&be.trigger("ajaxSend",[fe,X]),U)return fe;X.async&&X.timeout>0&&(L=window.setTimeout(function(){fe.abort("timeout")},X.timeout));try{U=!1,H.send(bt,xe)}catch(Te){if(U)throw Te;xe(-1,Te)}}function xe(Te,Le,ht,Ut){var tt,Me,de,Ce,Pe,J=Le;U||(U=!0,L&&window.clearTimeout(L),H=void 0,j=Ut||"",fe.readyState=Te>0?4:0,tt=Te>=200&&Te<300||Te===304,ht&&(Ce=D(X,fe,ht)),!tt&&n.inArray("script",X.dataTypes)>-1&&n.inArray("json",X.dataTypes)<0&&(X.converters["text script"]=function(){}),Ce=P(X,Ce,fe,tt),tt?(X.ifModified&&(Pe=fe.getResponseHeader("Last-Modified"),Pe&&(n.lastModified[$]=Pe),Pe=fe.getResponseHeader("etag"),Pe&&(n.etag[$]=Pe)),Te===204||X.type==="HEAD"?J="nocontent":Te===304?J="notmodified":(J=Ce.state,Me=Ce.data,de=Ce.error,tt=!de)):(de=J,(Te||!J)&&(J="error",Te<0&&(Te=0))),fe.status=Te,fe.statusText=(Le||J)+"",tt?_e.resolveWith(ge,[Me,J,fe]):_e.rejectWith(ge,[fe,J,de]),fe.statusCode(st),st=void 0,Q&&be.trigger(tt?"ajaxSuccess":"ajaxError",[fe,X,tt?Me:de]),Be.fireWith(ge,[fe,J]),Q&&(be.trigger("ajaxComplete",[fe,X]),--n.active||n.event.trigger("ajaxStop")))}return fe},getJSON:function(R,O,H){return n.get(R,O,H,"json")},getScript:function(R,O){return n.get(R,void 0,O,"script")}}),n.each(["get","post"],function(R,O){n[O]=function(H,$,j,G){return f($)&&(G=G||j,j=$,$=void 0),n.ajax(n.extend({url:H,type:O,dataType:G,data:$,success:j},n.isPlainObject(H)&&H))}}),n.ajaxPrefilter(function(R){var O;for(O in R.headers)O.toLowerCase()==="content-type"&&(R.contentType=R.headers[O]||"")}),n}.apply(m,l),i!==void 0&&(w.exports=i)}},Ss={};function it(w){var m=Ss[w];if(m!==void 0)return m.exports;var r=Ss[w]={id:w,loaded:!1,exports:{}};return Xa[w].call(r.exports,r,r.exports,it),r.loaded=!0,r.exports}it.n=w=>{var m=w&&w.__esModule?()=>w.default:()=>w;return it.d(m,{a:m}),m},it.d=(w,m)=>{for(var r in m)it.o(m,r)&&!it.o(w,r)&&Object.defineProperty(w,r,{enumerable:!0,get:m[r]})},it.g=function(){if(typeof globalThis=="object")return globalThis;try{return this||new Function("return this")()}catch(w){if(typeof window=="object")return window}}(),it.o=(w,m)=>Object.prototype.hasOwnProperty.call(w,m),it.nmd=w=>(w.paths=[],w.children||(w.children=[]),w);var oh={};(()=>{var tt;"use strict";var w=it(2726),m=it.n(w),r=it(2543),l=it(9589),i=it.n(l),n=it(2334),p=it.n(n),f=it(4912),c=it(9898),o=it(4856),h=it(2208),y=it(9954),s=it(8848),g=it.n(s),u=it(7022),d=it(7839),v=it(2514),b=it(4784),T=it(2342),_=it(301),A=it(9445),E=it(8347);class I{hydrate(de,Ce){const Pe=new URL(de,typeof window=="undefined"?"https://dummy.base":window.location.origin),J={};Pe.pathname.split("/").forEach((ve,he)=>{if(ve.charAt(0)===":"){const ye=ve.slice(1);typeof Ce[ye]!="undefined"&&(Pe.pathname=Pe.pathname.replace(ve,encodeURIComponent(Ce[ye])),J[ye]=Ce[ye])}});for(const ve in Ce)(typeof J[ve]=="undefined"||Pe.searchParams.has(ve))&&Pe.searchParams.set(ve,Ce[ve]);return Pe.toString()}}function N(){m()(".sample-request-send").off("click"),m()(".sample-request-send").on("click",function(Me){Me.preventDefault();const de=m()(this).parents("article"),Ce=de.data("group"),Pe=de.data("name"),J=de.data("version");P(Ce,Pe,J,m()(this).data("type"))}),m()(".sample-request-clear").off("click"),m()(".sample-request-clear").on("click",function(Me){Me.preventDefault();const de=m()(this).parents("article"),Ce=de.data("group"),Pe=de.data("name"),J=de.data("version");R(Ce,Pe,J)})}function B(Me){return Me.replace(/{(.+?)}/g,":$1")}function C(Me,de){const Ce=Me.find(".sample-request-url").val(),Pe=new I,J=B(Ce);return Pe.hydrate(J,de)}function D(Me){const de={};["header","query","body"].forEach(Pe=>{const J={};try{Me.find(m()(`[data-family="${Pe}"]:visible`)).each((ve,he)=>{const ye=he.dataset.name;let Oe=he.value;if(he.type==="checkbox")if(he.checked)Oe="on";else return!0;if(!Oe&&!he.dataset.optional&&he.type!=="checkbox")return m()(he).addClass("border-danger"),!0;J[ye]=Oe})}catch(ve){return}de[Pe]=J});const Ce=Me.find(m()('[data-family="body-json"]'));return Ce.is(":visible")?(de.body=Ce.val(),de.header["Content-Type"]="application/json"):de.header["Content-Type"]="multipart/form-data",de}function P(Me,de,Ce,Pe){const J=m()(`article[data-group="${Me}"][data-name="${de}"][data-version="${Ce}"]`),ve=D(J),he={};if(he.url=C(J,ve.query),he.headers=ve.header,he.headers["Content-Type"]==="application/json")he.data=ve.body;else if(he.headers["Content-Type"]==="multipart/form-data"){const Ve=new FormData;for(const[Ue,qe]of Object.entries(ve.body))Ve.append(Ue,qe);he.data=Ve,he.processData=!1,delete he.headers["Content-Type"],he.contentType=!1}he.type=Pe,he.success=ye,he.error=Oe,m().ajax(he),J.find(".sample-request-response").fadeTo(200,1),J.find(".sample-request-response-json").html("Loading...");function ye(Ve,Ue,qe){let et;try{et=JSON.parse(qe.responseText),et=JSON.stringify(et,null,4)}catch(pt){et=qe.responseText}J.find(".sample-request-response-json").text(et),g().highlightAll()}function Oe(Ve,Ue,qe){let et="Error "+Ve.status+": "+qe,pt;try{pt=JSON.parse(Ve.responseText),pt=JSON.stringify(pt,null,4)}catch(mt){pt=Ve.responseText}pt&&(et+=`
`+pt),J.find(".sample-request-response").is(":visible")&&J.find(".sample-request-response").fadeTo(1,.1),J.find(".sample-request-response").fadeTo(250,1),J.find(".sample-request-response-json").text(et),g().highlightAll()}}function R(Me,de,Ce){const Pe=m()('article[data-group="'+Me+'"][data-name="'+de+'"][data-version="'+Ce+'"]');Pe.find(".sample-request-response-json").html(""),Pe.find(".sample-request-response").hide(),Pe.find(".sample-request-input").each((ve,he)=>{he.value=he.placeholder!==he.dataset.name?he.placeholder:""});const J=Pe.find(".sample-request-url");J.val(J.prop("defaultValue"))}const O={"Allowed values:":"Valors permesos:","Compare all with predecessor":"Comparar tot amb versi\xF3 anterior","compare changes to:":"comparar canvis amb:","compared to":"comparat amb","Default value:":"Valor per defecte:",Description:"Descripci\xF3",Field:"Camp",General:"General","Generated with":"Generat amb",Name:"Nom","No response values.":"Sense valors en la resposta.",optional:"opcional",Parameter:"Par\xE0metre","Permission:":"Permisos:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3 d'exemple","show up to version:":"mostrar versi\xF3:","Size range:":"Tamany de rang:","Toggle navigation":"Canvia la navegaci\xF3",Type:"Tipus",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Premeu Ctrl+C per copiar","copied!":"Copiat!"},H={"Allowed values:":"Povolen\xE9 hodnoty:","Compare all with predecessor":"Porovnat v\u0161e s p\u0159edchoz\xEDmi verzemi","compare changes to:":"porovnat zm\u011Bny s:","compared to":"porovnat s","Default value:":"V\xFDchoz\xED hodnota:",Description:"Popis",Field:"Pole",General:"Obecn\xE9","Generated with":"Vygenerov\xE1no pomoc\xED",Name:"N\xE1zev","No response values.":"Nebyly vr\xE1ceny \u017E\xE1dn\xE9 hodnoty.",optional:"voliteln\xE9",Parameter:"Parametr","Permission:":"Opr\xE1vn\u011Bn\xED:",Response:"Odpov\u011B\u010F",Send:"Odeslat","Send a Sample Request":"Odeslat uk\xE1zkov\xFD po\u017Eadavek","show up to version:":"zobrazit po verzi:","Size range:":"Rozsah velikosti:","Toggle navigation":"P\u0159epnout navigaci",Type:"Typ",url:"url",Copy:"Kop\xEDrovat","Press Ctrl+C to copy":"Stisknut\xEDm kombinace kl\xE1ves Ctrl+C zkop\xEDrujte","copied!":"Zkop\xEDrovan\xFD!"},$={"Allowed values:":"Erlaubte Werte:","Compare all with predecessor":"Vergleiche alle mit ihren Vorg\xE4ngern","compare changes to:":"vergleiche \xC4nderungen mit:","compared to":"verglichen mit","Default value:":"Standardwert:",Description:"Beschreibung",Field:"Feld",General:"Allgemein","Generated with":"Erstellt mit",Name:"Name","No response values.":"Keine R\xFCckgabewerte.",optional:"optional",Parameter:"Parameter","Permission:":"Berechtigung:",Response:"Antwort",Send:"Senden","Send a Sample Request":"Eine Beispielanfrage senden","show up to version:":"zeige bis zur Version:","Size range:":"Gr\xF6\xDFenbereich:","Toggle navigation":"Navigation ein-/ausblenden",Type:"Typ",url:"url",Copy:"Kopieren","Press Ctrl+C to copy":"Dr\xFCcken Sie Ctrl+C zum kopieren","Copied!":"Kopiert!"},j={"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Comparar todo con versi\xF3n anterior","compare changes to:":"comparar cambios con:","compared to":"comparado con","Default value:":"Valor por defecto:",Description:"Descripci\xF3n",Field:"Campo",General:"General","Generated with":"Generado con",Name:"Nombre","No response values.":"Sin valores en la respuesta.",optional:"opcional",Parameter:"Par\xE1metro","Permission:":"Permisos:",Response:"Respuesta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3n de ejemplo","show up to version:":"mostrar a versi\xF3n:","Size range:":"Tama\xF1o de rango:","Toggle navigation":"Alternar navegaci\xF3n",Type:"Tipo",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Presione Ctrl+C para copiar","copied!":"\xA1Copiado!"},G={"Allowed values:":"Valeurs autoris\xE9es :",Body:"Corps","Compare all with predecessor":"Tout comparer avec ...","compare changes to:":"comparer les changements \xE0 :","compared to":"comparer \xE0","Default value:":"Valeur par d\xE9faut :",Description:"Description",Field:"Champ",General:"G\xE9n\xE9ral","Generated with":"G\xE9n\xE9r\xE9 avec",Header:"En-t\xEAte",Headers:"En-t\xEAtes",Name:"Nom","No response values.":"Aucune valeur de r\xE9ponse.","No value":"Aucune valeur",optional:"optionnel",Parameter:"Param\xE8tre",Parameters:"Param\xE8tres","Permission:":"Permission :","Query Parameter(s)":"Param\xE8tre(s) de la requ\xEAte","Query Parameters":"Param\xE8tres de la requ\xEAte","Request Body":"Corps de la requ\xEAte",required:"requis",Response:"R\xE9ponse",Send:"Envoyer","Send a Sample Request":"Envoyer une requ\xEAte repr\xE9sentative","show up to version:":"Montrer \xE0 partir de la version :","Size range:":"Ordre de grandeur :","Toggle navigation":"Basculer la navigation",Type:"Type",url:"url",Copy:"Copier","Press Ctrl+C to copy":"Appuyez sur Ctrl+C pour copier","copied!":"Copi\xE9!"},L={"Allowed values:":"Valori permessi:","Compare all with predecessor":"Confronta tutto con versioni precedenti","compare changes to:":"confronta modifiche con:","compared to":"confrontato con","Default value:":"Valore predefinito:",Description:"Descrizione",Field:"Campo",General:"Generale","Generated with":"Creato con",Name:"Nome","No response values.":"Nessun valore di risposta.",optional:"opzionale",Parameter:"Parametro","Permission:":"Permessi:",Response:"Risposta",Send:"Invia","Send a Sample Request":"Invia una richiesta di esempio","show up to version:":"mostra alla versione:","Size range:":"Intervallo dimensione:","Toggle navigation":"Attiva/disattiva la navigazione",Type:"Tipo",url:"url",Copy:"Copiare","Press Ctrl+C to copy":"Premere CTRL+C per copiare","copied!":"Copiato!"},W={"Allowed values:":"Toegestane waarden:","Compare all with predecessor":"Vergelijk alle met voorgaande versie","compare changes to:":"vergelijk veranderingen met:","compared to":"vergelijk met","Default value:":"Standaard waarde:",Description:"Omschrijving",Field:"Veld",General:"Algemeen","Generated with":"Gegenereerd met",Name:"Naam","No response values.":"Geen response waardes.",optional:"optioneel",Parameter:"Parameter","Permission:":"Permissie:",Response:"Antwoorden",Send:"Sturen","Send a Sample Request":"Stuur een sample aanvragen","show up to version:":"toon tot en met versie:","Size range:":"Maatbereik:","Toggle navigation":"Navigatie in-/uitschakelen",Type:"Type",url:"url",Copy:"Kopi\xEBren","Press Ctrl+C to copy":"Druk op Ctrl+C om te kopi\xEBren","copied!":"Gekopieerd!"},U={"Allowed values:":"Dozwolone warto\u015Bci:","Compare all with predecessor":"Por\xF3wnaj z poprzednimi wersjami","compare changes to:":"por\xF3wnaj zmiany do:","compared to":"por\xF3wnaj do:","Default value:":"Warto\u015B\u0107 domy\u015Blna:",Description:"Opis",Field:"Pole",General:"Generalnie","Generated with":"Wygenerowano z",Name:"Nazwa","No response values.":"Brak odpowiedzi.",optional:"opcjonalny",Parameter:"Parametr","Permission:":"Uprawnienia:",Response:"Odpowied\u017A",Send:"Wy\u015Blij","Send a Sample Request":"Wy\u015Blij przyk\u0142adowe \u017C\u0105danie","show up to version:":"poka\u017C do wersji:","Size range:":"Zakres rozmiaru:","Toggle navigation":"Prze\u0142\u0105cz nawigacj\u0119",Type:"Typ",url:"url",Copy:"Kopiowa\u0107","Press Ctrl+C to copy":"Naci\u015Bnij Ctrl+C, aby skopiowa\u0107","copied!":"Kopiowane!"},Q={"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Compare todos com antecessores","compare changes to:":"comparar altera\xE7\xF5es com:","compared to":"comparado com","Default value:":"Valor padr\xE3o:",Description:"Descri\xE7\xE3o",Field:"Campo",General:"Geral","Generated with":"Gerado com",Name:"Nome","No response values.":"Sem valores de resposta.",optional:"opcional",Parameter:"Par\xE2metro","Permission:":"Permiss\xE3o:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar um Exemplo de Pedido","show up to version:":"aparecer para a vers\xE3o:","Size range:":"Faixa de tamanho:","Toggle navigation":"Alternar navega\xE7\xE3o",Type:"Tipo",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Pressione Ctrl+C para copiar","copied!":"Copiado!"},ne={"Allowed values:":"Valori permise:","Compare all with predecessor":"Compar\u0103 toate cu versiunea precedent\u0103","compare changes to:":"compar\u0103 cu versiunea:","compared to":"comparat cu","Default value:":"Valoare implicit\u0103:",Description:"Descriere",Field:"C\xE2mp",General:"General","Generated with":"Generat cu",Name:"Nume","No response values.":"Nici o valoare returnat\u0103.",optional:"op\u021Bional",Parameter:"Parametru","Permission:":"Permisiune:",Response:"R\u0103spuns",Send:"Trimite","Send a Sample Request":"Trimite o cerere de prob\u0103","show up to version:":"arat\u0103 p\xE2n\u0103 la versiunea:","Size range:":"Interval permis:","Toggle navigation":"Comutarea navig\u0103rii",Type:"Tip",url:"url",Copy:"Copie","Press Ctrl+C to copy":"Ap\u0103sa\u021Bi Ctrl+C pentru a copia","copied!":"Copiat!"},se={"Allowed values:":"\u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F:","Compare all with predecessor":"\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0439 \u0432\u0435\u0440\u0441\u0438\u0435\u0439","compare changes to:":"\u0441\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441:","compared to":"\u0432 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0438 \u0441","Default value:":"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E:",Description:"\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",Field:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",General:"\u041E\u0431\u0449\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F","Generated with":"\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E",Name:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435","No response values.":"\u041D\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043E\u0442\u0432\u0435\u0442\u0430.",optional:"\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439",Parameter:"\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440","Permission:":"\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E:",Response:"\u041E\u0442\u0432\u0435\u0442",Send:"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C","Send a Sample Request":"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441","show up to version:":"\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0440\u0441\u0438\u044E:","Size range:":"\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F:","Toggle navigation":"\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438",Type:"\u0422\u0438\u043F",url:"URL",Copy:"\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C","Press Ctrl+C to copy":"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 Ctrl+C, \u0447\u0442\u043E\u0431\u044B \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C","copied!":"\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!"},X={"Allowed values:":"\u0130zin verilen de\u011Ferler:","Compare all with predecessor":"T\xFCm\xFCn\xFC \xF6ncekiler ile kar\u015F\u0131la\u015Ft\u0131r","compare changes to:":"de\u011Fi\u015Fiklikleri kar\u015F\u0131la\u015Ft\u0131r:","compared to":"kar\u015F\u0131la\u015Ft\u0131r","Default value:":"Varsay\u0131lan de\u011Fer:",Description:"A\xE7\u0131klama",Field:"Alan",General:"Genel","Generated with":"Olu\u015Fturan",Name:"\u0130sim","No response values.":"D\xF6n\xFC\u015F verisi yok.",optional:"opsiyonel",Parameter:"Parametre","Permission:":"\u0130zin:",Response:"D\xF6n\xFC\u015F",Send:"G\xF6nder","Send a Sample Request":"\xD6rnek istek g\xF6nder","show up to version:":"bu versiyona kadar g\xF6ster:","Size range:":"Boyut aral\u0131\u011F\u0131:","Toggle navigation":"Navigasyonu de\u011Fi\u015Ftir",Type:"Tip",url:"url",Copy:"Kopya etmek","Press Ctrl+C to copy":"Kopyalamak i\xE7in Ctrl+C tu\u015Flar\u0131na bas\u0131n","copied!":"Kopya -lanan!"},ge={"Allowed values:":"Gi\xE1 tr\u1ECB ch\u1EA5p nh\u1EADn:","Compare all with predecessor":"So s\xE1nh v\u1EDBi t\u1EA5t c\u1EA3 phi\xEAn b\u1EA3n tr\u01B0\u1EDBc","compare changes to:":"so s\xE1nh s\u1EF1 thay \u0111\u1ED5i v\u1EDBi:","compared to":"so s\xE1nh v\u1EDBi","Default value:":"Gi\xE1 tr\u1ECB m\u1EB7c \u0111\u1ECBnh:",Description:"Ch\xFA th\xEDch",Field:"Tr\u01B0\u1EDDng d\u1EEF li\u1EC7u",General:"T\u1ED5ng quan","Generated with":"\u0110\u01B0\u1EE3c t\u1EA1o b\u1EDFi",Name:"T\xEAn","No response values.":"Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 tr\u1EA3 v\u1EC1.",optional:"T\xF9y ch\u1ECDn",Parameter:"Tham s\u1ED1","Permission:":"Quy\u1EC1n h\u1EA1n:",Response:"K\u1EBFt qu\u1EA3",Send:"G\u1EEDi","Send a Sample Request":"G\u1EEDi m\u1ED9t y\xEAu c\u1EA7u m\u1EABu","show up to version:":"hi\u1EC3n th\u1ECB phi\xEAn b\u1EA3n:","Size range:":"K\xEDch c\u1EE1:","Toggle navigation":"Chuy\u1EC3n \u0111\u1ED5i \u0111i\u1EC1u h\u01B0\u1EDBng",Type:"Ki\u1EC3u",url:"li\xEAn k\u1EBFt",Copy:"B\u1EA3n sao","Press Ctrl+C to copy":"Nh\u1EA5n Ctrl+C \u0111\u1EC3 sao ch\xE9p","copied!":"Sao ch\xE9p!"},be={"Allowed values:":"\u5141\u8BB8\u503C:",Body:"\u8BF7\u6C42\u4F53","Compare all with predecessor":"\u4E0E\u6240\u6709\u4E4B\u524D\u7684\u7248\u672C\u6BD4\u8F83","compare changes to:":"\u5C06\u5F53\u524D\u7248\u672C\u4E0E\u6307\u5B9A\u7248\u672C\u6BD4\u8F83:","compared to":"\u76F8\u6BD4\u4E8E","Default value:":"\u9ED8\u8BA4\u503C:",DEPRECATED:"\u5F03\u7528",Description:"\u63CF\u8FF0","Error 4xx":"\u8BF7\u6C42\u5931\u8D25\uFF084xx\uFF09",Field:"\u5B57\u6BB5","Filter...":"\u7B5B\u9009\u2026",General:"\u6982\u8981","Generated with":"\u6784\u5EFA\u4E8E",Header:"\u8BF7\u6C42\u5934",Headers:"\u8BF7\u6C42\u5934",Name:"\u540D\u79F0","No response values.":"\u65E0\u8FD4\u56DE\u503C.","No value":"\u7A7A\u503C",optional:"\u53EF\u9009",Parameter:"\u53C2\u6570",Parameters:"\u53C2\u6570","Permission:":"\u6743\u9650:","Query Parameter(s)":"\u67E5\u8BE2\u53C2\u6570","Query Parameters":"\u67E5\u8BE2\u53C2\u6570","Request Body":"\u8BF7\u6C42\u6570\u636E",required:"\u5FC5\u9700",Reset:"\u91CD\u7F6E",Response:"\u8FD4\u56DE",Send:"\u53D1\u9001","Send a Sample Request":"\u53D1\u9001\u793A\u4F8B\u8BF7\u6C42","show up to version:":"\u663E\u793A\u6307\u5B9A\u7248\u672C:","Size range:":"\u53D6\u503C\u8303\u56F4:","Success 200":"\u8BF7\u6C42\u6210\u529F\uFF08200\uFF09","Toggle navigation":"\u5207\u63DB\u5C0E\u822A",Type:"\u7C7B\u578B",url:"\u5730\u5740",Copy:"\u590D\u5236\u6587\u672C","Press Ctrl+C to copy":"\u6309Ctrl+C\u590D\u5236","copied!":"\u6587\u672C\u5DF2\u590D\u5236!"},_e={ca:O,cn:be,cs:H,de:$,es:j,en:{},fr:G,it:L,nl:W,pl:U,pt:Q,pt_br:Q,ro:ne,ru:se,tr:X,vi:ge,zh:be,zh_cn:be},Be=((tt=window.navigator.language)!=null?tt:"en-GB").toLowerCase().substr(0,2);let st=_e[Be]?_e[Be]:_e.en;function bt(Me){const de=st[Me];return de===void 0?Me:de}function At(Me){if(!Object.prototype.hasOwnProperty.call(_e,Me))throw new Error(`Invalid value for language setting! Available values are ${Object.keys(_e).join(",")}`);st=_e[Me]}const Dt=Me=>{let de={};const Ce=(ve,he)=>he.split(".").reduce((ye,Oe)=>{if(ye){if(ye[Oe])return ye[Oe];if(Array.isArray(ye)&&ye[0]&&ye[0][Oe])return ye[0][Oe]}return null},ve),Pe=(ve,he,ye)=>{ve?Array.isArray(ve)?ve.length?ve[0][he]=ye:ve.push({[he]:ye}):ve[he]=ye:de[he]=ye};Me.forEach(ve=>{const{parentNode:he,field:ye,type:Oe}=ve[0],Ve=he?Ce(de,he.path):void 0,Ue=Ve?ye.substring(he.path.length+1):ye,qe=Oe.indexOf("[]")!==-1;Oe.indexOf("Object")!==-1?Pe(Ve,Ue,qe?[]:{}):Pe(Ve,Ue,qe?[]:ve[1])});const J=Object.keys(de);return J.length===1&&Me[0][0].optional&&(de=de[J[0]]),fe(de)};function fe(Me){return JSON.stringify(Me,null,4)}function xe(Me){const de=[];return Me.forEach(Ce=>{let Pe;switch(Ce.type.toLowerCase()){case"string":Pe=Ce.defaultValue||"";break;case"boolean":Pe=Boolean(Ce.defaultValue)||!1;break;case"number":Pe=parseInt(Ce.defaultValue||0,10);break;case"date":Pe=Ce.defaultValue||new Date().toLocaleDateString(window.navigator.language);break}de.push([Ce,Pe])}),Dt(de)}var Te=it(2189);class Le extends Te{constructor(de){super(),this.testMode=de}diffMain(de,Ce,Pe,J){return super.diff_main(this._stripHtml(de),this._stripHtml(Ce),Pe,J)}diffLineMode(de,Ce){const Pe=this.diff_linesToChars_(de,Ce),J=Pe.chars1,ve=Pe.chars2,he=Pe.lineArray,ye=super.diff_main(J,ve,!1);return this.diff_charsToLines_(ye,he),ye}diffPrettyHtml(de){const Ce=[],Pe=/&/g,J=/</g,ve=/>/g,he=/\n/g;for(let ye=0;ye<de.length;ye++){const Oe=de[ye][0],Ue=de[ye][1].replace(Pe,"&amp;").replace(J,"&lt;").replace(ve,"&gt;").replace(he,"&para;<br>");switch(Oe){case Te.DIFF_INSERT:Ce[ye]="<ins>"+Ue+"</ins>";break;case Te.DIFF_DELETE:Ce[ye]="<del>"+Ue+"</del>";break;case Te.DIFF_EQUAL:Ce[ye]="<span>"+Ue+"</span>";break}}return Ce.join("")}diffPrettyCode(de){const Ce=[],Pe=/\n/g;for(let J=0;J<de.length;J++){const ve=de[J][0],he=de[J][1],ye=he.match(Pe)?"":`
`;switch(ve){case Te.DIFF_INSERT:Ce[J]=he.replace(/^(.)/gm,"+ $1")+ye;break;case Te.DIFF_DELETE:Ce[J]=he.replace(/^(.)/gm,"- $1")+ye;break;case Te.DIFF_EQUAL:Ce[J]=he.replace(/^(.)/gm,"  $1");break}}return Ce.join("")}diffCleanupSemantic(de){return this.diff_cleanupSemantic(de)}_stripHtml(de){if(this.testMode)return de;const Ce=document.createElement("div");return Ce.innerHTML=de,Ce.textContent||Ce.innerText||""}}function ht(){p().registerHelper("markdown",function(J){return J&&(J=J.replace(/((\[(.*?)\])?\(#)((.+?):(.+?))(\))/mg,function(ve,he,ye,Oe,Ve,Ue,qe){const et=Oe||Ue+"/"+qe;return'<a href="#api-'+Ue+"-"+qe+'">'+et+"</a>"}),J)}),p().registerHelper("setInputType",function(J){switch(J){case"File":case"Email":case"Color":case"Number":case"Date":return J[0].toLowerCase()+J.substring(1);case"Boolean":return"checkbox";default:return"text"}});let Me;p().registerHelper("startTimer",function(J){return Me=new Date,""}),p().registerHelper("stopTimer",function(J){return console.log(new Date-Me),""}),p().registerHelper("__",function(J){return bt(J)}),p().registerHelper("cl",function(J){return console.log(J),""}),p().registerHelper("underscoreToSpace",function(J){return J.replace(/(_+)/g," ")}),p().registerHelper("removeDblQuotes",function(J){return J.replace(/"/g,"")}),p().registerHelper("assign",function(J){if(arguments.length>0){const ve=typeof arguments[1];let he=null;(ve==="string"||ve==="number"||ve==="boolean")&&(he=arguments[1]),p().registerHelper(J,function(){return he})}return""}),p().registerHelper("nl2br",function(J){return Ce(J)}),p().registerHelper("ifNotObject",function(J,ve){return J&&J.indexOf("Object")!==0?ve.fn(this):ve.inverse(this)}),p().registerHelper("ifCond",function(J,ve,he,ye){switch(ve){case"==":return J==he?ye.fn(this):ye.inverse(this);case"===":return J===he?ye.fn(this):ye.inverse(this);case"!=":return J!=he?ye.fn(this):ye.inverse(this);case"!==":return J!==he?ye.fn(this):ye.inverse(this);case"<":return J<he?ye.fn(this):ye.inverse(this);case"<=":return J<=he?ye.fn(this):ye.inverse(this);case">":return J>he?ye.fn(this):ye.inverse(this);case">=":return J>=he?ye.fn(this):ye.inverse(this);case"&&":return J&&he?ye.fn(this):ye.inverse(this);case"||":return J||he?ye.fn(this):ye.inverse(this);default:return ye.inverse(this)}});const de={};p().registerHelper("subTemplate",function(J,ve){de[J]||(de[J]=p().compile(document.getElementById("template-"+J).innerHTML));const he=de[J],ye=m().extend({},this,ve.hash);return new(p()).SafeString(he(ye))}),p().registerHelper("toLowerCase",function(J){return J&&typeof J=="string"?J.toLowerCase():""}),p().registerHelper("dot2bracket",function(J){const{parentNode:ve,field:he,isArray:ye}=J;let Oe="";if(ve){let Ve=J;do{const Ue=Ve.parentNode;Ue.isArray&&(Oe=`[]${Oe}`),Ue.parentNode?Oe=`[${Ue.field.substring(Ue.parentNode.path.length+1)}]${Oe}`:Oe=Ue.field+Oe,Ve=Ve.parentNode}while(Ve.parentNode);Oe+=`[${he.substring(ve.path.length+1)}]`}else Oe=he,ye&&(Oe+="[]");return Oe}),p().registerHelper("nestObject",function(J){const{parentNode:ve,field:he}=J;return ve?"&nbsp;&nbsp;".repeat(ve.path.split(".").length)+he.substring(ve.path.length+1):he});function Ce(J){return(""+J).replace(/(?:^|<\/pre>)[^]*?(?:<pre>|$)/g,ve=>ve.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,"$1<br>$2"))}p().registerHelper("each_compare_list_field",function(J,ve,he){const ye=he.hash.field,Oe=[];J&&J.forEach(function(Ue){const qe=Ue;qe.key=Ue[ye],Oe.push(qe)});const Ve=[];return ve&&ve.forEach(function(Ue){const qe=Ue;qe.key=Ue[ye],Ve.push(qe)}),Pe("key",Oe,Ve,he)}),p().registerHelper("each_compare_keys",function(J,ve,he){const ye=[];J&&Object.keys(J).forEach(function(Ue){const qe={};qe.value=J[Ue],qe.key=Ue,ye.push(qe)});const Oe=[];return ve&&Object.keys(ve).forEach(function(Ue){const qe={};qe.value=ve[Ue],qe.key=Ue,Oe.push(qe)}),Pe("key",ye,Oe,he)}),p().registerHelper("body2json",function(J,ve){return xe(J)}),p().registerHelper("each_compare_field",function(J,ve,he){return Pe("field",J,ve,he)}),p().registerHelper("each_compare_title",function(J,ve,he){return Pe("title",J,ve,he)}),p().registerHelper("reformat",function(J,ve){if(ve==="json")try{return JSON.stringify(JSON.parse(J.trim()),null,"    ")}catch(he){}return J}),p().registerHelper("showDiff",function(J,ve,he){let ye="";if(J===ve)ye=J;else{if(!J)return ve;if(!ve)return J;const Oe=new Le;if(he==="code"){const Ve=Oe.diffLineMode(ve,J);ye=Oe.diffPrettyCode(Ve)}else{const Ve=Oe.diffMain(ve,J);Oe.diffCleanupSemantic(Ve),ye=Oe.diffPrettyHtml(Ve),ye=ye.replace(/&para;/gm,""),he==="nl2br"&&(ye=Ce(ye))}}return ye});function Pe(J,ve,he,ye){const Oe=[];let Ve=0;ve&&ve.forEach(function(et){let pt=!1;if(he&&he.forEach(function(mt){if(et[J]===mt[J]){const Bt={typeSame:!0,source:et,compare:mt,index:Ve};Oe.push(Bt),pt=!0,Ve++}}),!pt){const mt={typeIns:!0,source:et,index:Ve};Oe.push(mt),Ve++}}),he&&he.forEach(function(et){let pt=!1;if(ve&&ve.forEach(function(mt){mt[J]===et[J]&&(pt=!0)}),!pt){const mt={typeDel:!0,compare:et,index:Ve};Oe.push(mt),Ve++}});let Ue="";const qe=Oe.length;for(const et in Oe)parseInt(et,10)===qe-1&&(Oe[et]._last=!0),Ue=Ue+ye.fn(Oe[et]);return Ue}}document.addEventListener("DOMContentLoaded",()=>{Ut(),N(),g().highlightAll()});function Ut(){var $e;let Me=[{type:"get",url:"/version",title:"Application version",name:"printVersion",group:"3D_Repo",description:"<p>Show current application version.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"VERSION",isArray:!1,description:"<p>API service version</p>"},{group:"200",type:"Object",optional:!1,field:"unity",isArray:!1,description:"<p>Unity viewer version</p>"},{group:"200",type:"Object",optional:!1,field:"navis",isArray:!1,description:"<p>Autodesk Navisworks version</p>"},{group:"200",type:"Object",optional:!1,field:"unitydll",isArray:!1,description:"<p>Unity viewer version</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"VERSION": "2.20.1",
	"unity": {
		"current": "2.20.0",
		"supported": []
	},
	"navis": {
		"current": "2.16.0",
		"supported": [
			"2.8.0"
		]
	},
	"unitydll": {
		"current": "2.8.0",
		"supported": []
	}
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"3D_Repo"},{type:"post",url:"/:teamspace/permissions",title:"Assign permissions",name:"createPermission",group:"Account_Permission",description:"<p>Assign account level permission to a user</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to assign permissions to</p>"},{group:"Body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}],success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"},{group:"200",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>Account Level Permission types</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	{
		"user": "bob",
		"permissions": [
			"create_project"
		]
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/permissions HTTP/1.1
{
	"user": "bob",
	"permissions": [
		"create_project"
	]
}`,type:"post"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"delete",url:"/:teamspace/permissions/:user",title:"Revoke permissions",name:"deletePermission",group:"Account_Permission",description:"<p>Revoke all permissions from a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to delete</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/permissions/alice HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"get",url:"/:teamspace/permissions",title:"List all permissions",name:"listPermissions",group:"Account_Permission",description:"<p>Get a list of all account permission objects for a teamspace</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"},{group:"200",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>Account level permissions</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	{
		"user": "alice",
		"permissions": [
			"teamspace_admin"
		]
	},
	{
		"user": "bob",
		"permissions": [
			"create_project"
		]
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/permissions HTTP/1.1",type:"get"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"put",url:"/:teamspace/permissions/:user",title:"Update permissions",name:"updatePermission",group:"Account_Permission",description:"<p>Update permissions assignment for a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to update</p>"}]}},body:[{group:"Body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}],success:{fields:{200:[{group:"200",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PUT /acme/permissions/alice HTTP/1.1
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"put"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"get",url:"/:account/avatar",title:"Get avatar",name:"getAvatar",group:"Account",description:"<p>Get user avatar.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>Account name</p>"}]}},success:{fields:{200:[{group:"200",type:"File",optional:!1,field:"avatar",isArray:!1,description:"<p>User Avatar Image</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
Content-Type: image/png

<binary image data>`,type:"binary"}]},error:{fields:{404:[{group:"404",optional:!1,field:"USER_DOES_NOT_HAVE_AVATAR",isArray:!1,description:"<p>User does not have an avatar</p>"}]},examples:[{title:"Error-Response:",content:`HTTP/1.1 404 Not Found
{
	"message": "User does not have an avatar",
	"status": 404,
	"code": "USER_DOES_NOT_HAVE_AVATAR",
	"place": "GET /alice/avatar"
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice/avatar HTTP/1.1",type:"get"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/:account.json",title:"List account information",name:"listInfo",group:"Account",description:"<p>Account information and list of projects grouped by teamspace that the user has access to.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"account.json",isArray:!1,description:"<p>Account name with .json extension</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"accounts",isArray:!0,description:"<p>User account</p>"},{group:"200",type:"Object",optional:!1,field:"billingInfo",isArray:!1,description:"<p>Billing information</p>"},{group:"200",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>User e-mail address</p>"},{group:"200",type:"String",optional:!1,field:"firstName",isArray:!1,description:"<p>First name</p>"},{group:"200",type:"String",optional:!1,field:"lastName",isArray:!1,description:"<p>Surname</p>"},{group:"200",type:"Boolean",optional:!1,field:"hasAvatar",isArray:!1,description:"<p>True if user account has an avatar</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"accounts": [
		{
			"account": "repoman",
			"models": [
				{
					"permissions": [
						"change_model_settings",
						"upload_files",
						"create_issue",
						"comment_issue",
						"view_issue",
						"view_model",
						"download_model",
						"edit_federation",
						"delete_federation",
						"delete_model",
						"manage_model_permission"
					],
					"model": "00000000-0000-0000-0000-000000000000",
					"name": "ufo",
					"status": "ok",
					"timestamp": "2016-07-26T15:52:11.000Z"
				}
			],
			"fedModels": [],
			"isAdmin": true,
			"permissions": [
				"teamspace_admin"
			],
			"quota": {
				"spaceLimit": 10485760,
				"collaboratorLimit": 5,
				"spaceUsed": 12478764
			},
			"projects": []
		},
		{
			"account": "breakingbad",
			"models": [
				{
					"permissions": [
						"view_issue",
						"view_model",
						"upload_files",
						"create_issue"
					],
					"model": "00000000-0000-0000-0000-000000000001",
					"name": "homelab",
					"status": "ok",
					"timestamp": null
				}
			],
			"fedModels": [
				{
					"federate": true,
					"permissions": [
						"change_model_settings",
						"upload_files",
						"create_issue",
						"comment_issue",
						"view_issue",
						"view_model",
						"download_model",
						"edit_federation",
						"delete_federation",
						"delete_model",
						"manage_model_permission"
					],
					"model": "00000000-0000-0000-0000-000000000003",
					"name": "fed1",
					"status": "ok",
					"timestamp": "2017-05-11T12:49:59.000Z",
					"subModels": [
						{
							"database": "breakingbad",
							"model": "00000000-0000-0000-0000-000000000001",
							"name": "homelab"
						},
						{
							"database": "breakingbad",
							"model": "00000000-0000-0000-0000-000000000002",
							"name": "laundrylab"
						}
					]
				}
			],
			"projects": [
				{
					"_id": "58f78c8ededbb13a982114ee",
					"name": "folder1",
					"permission": [],
					"models": [
						{
							"permissions": [
								"view_issue",
								"view_model",
								"upload_files",
								"create_issue"
							],
							"model": "00000000-0000-0000-0000-000000000004",
							"name": "laundrylab",
							"status": "ok",
							"timestamp": null
						}
					]
				}
			]
		}
	],
	"billingInfo": {
		"countryCode": "US",
		"postalCode": "0",
		"line2": "123",
		"city": "123",
		"line1": "123",
		"vat": "000",
		"company": "Universal Pictures",
		"_id": "59145aedf4f613668fba0f98"
	},
	"email":"alice@acme.co.uk",
	"firstName":"Alice",
	"lastName":"Allen",
	"hasAvatar": true,
	"jobs": [
		{
			"_id": "Director"
		},
		{
			"_id": "Actor"
		},
		{
			"_id": "Producer"
		}
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:account/avatar",title:"Upload avatar",name:"uploadAvatar",group:"Account",description:"<p>Upload a new avatar image. Only multipart form data content type will be accepted.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>Account name</p>"}]}},body:[{group:"Body",type:"File",optional:!1,field:"file",isArray:!1,description:"<p>Image to upload</p>"}],examples:[{title:"Example usage:",content:`POST /alice/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf

------WebKitFormBoundaryN8dwXAkcO1frCHLf
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<binary content>
------WebKitFormBoundaryN8dwXAkcO1frCHLf--`,type:"post"}],success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"status",isArray:!1,description:"<p>Status of Avatar upload.</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:teamspace/:model/revision/master/head/groups",title:"Create group",name:"createGroup",group:"Groups",description:"<p>Add a group to the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
{
	"name":"Group 1",
	"description":"This is the description text for the first group.",
	"author":"alice",
	"color":[255,0,0],
	"objects":[
		{
			"account":"acme",
			"model":"00000000-0000-0000-0000-000000000000",
			"shared_ids":[
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	]
}`,type:"post"},{title:"Example usage (smart group)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
{
	"name":"Smart 1",
	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
	"author":"alice",
	"color":[255,0,0],
	"objects":[],
	"rules":[
		{
			"field": {
				"operator": "IS",
				"values": ["Area"]
			},
			"operator":"GT",
			"values":[5]
		},
		{
			"field": {
				"operator": "IS",
				"values": ["IFC Type"]
			},
			"operator":"IS",
			"values":[
				"IfcWall",
				"IfcDoor"
			]
		}
	]
}`,type:"post"}],success:{examples:[{title:"Success-Response: (normal group)",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"name":"Group 1",
	"description":"This is the description text for the first group.",
	"author":"alice",
	"createdAt":"2018-03-09T10:45:00.000Z",
	"color":[255,0,0],
	"objects":[
		{
			"account":"acme",
			"model":"00000000-0000-0000-0000-000000000000",
			"ifc_guids":[],
			"shared_ids":[
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"rules":[]
}`,type:"json"},{title:"Success-Response: (smart group)",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000004",
	"name":"Smart 1",
	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
	"author":"alice",
	"createdAt":"2018-03-09T10:45:00.000Z",
	"color":[255,0,0],
	"objects":[
		{
			"account":"acme",
			"model":"00000000-0000-0000-0000-000000000000",
			"ifc_guids":[],
			"shared_ids":[
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"rules":[
		{
			"field": {
				"operator": "IS",
				"values": ["Area"]
			},
			"operator":"GT",
			"values":[5]
		},
		{
			"field": {
				"operator": "IS",
				"values": ["IFC Type"]
			},
			"operator":"IS",
			"values":[
				"IfcWall",
				"IfcDoor"
			]
		}
	]
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/revision/:revId/groups",title:"Create group",name:"createGroup",group:"Groups",description:"<p>Add a group to the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/:revId)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1
{
	"name":"Group 1",
	"description":"This is the description text for the first group.",
	"author":"alice",
	"color":[255,0,0],
	"objects":[
		{
			"account":"acme",
			"model":"00000000-0000-0000-0000-000000000000",
			"shared_ids":[
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	]
}`,type:"post"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}}},{type:"delete",url:"/:teamspace/:model/groups",title:"Delete groups",name:"deleteGroups",group:"Groups",description:"<p>Delete groups.</p>",query:[{group:"Query",type:"String",optional:!1,field:"ids",isArray:!1,description:"<p>Comma separated list of group IDs</p>"}],success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>Group deletion result (success|ERROR CODE)</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/groups?ids=00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003 HTTP/1.1",type:"delete"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/groups/export",title:"Export Groups",name:"exportGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ExportFederationGroups</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision/master/head/groups/:groupId",title:"Find group",name:"findGroup",group:"Groups",description:"<p>Find a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000004?ifcguids=true HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"This is the description text for the first group.",
	"name":"Group 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [],
			"shared_ids": [
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"},{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
	"name":"Smart 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [
				"2cx1GdQ9fAgRIWgfhfBb84",
				"13NEEUJ8DEE8fEH0aHgm2z",
				"3OLNF2_DL6hfPgh8Bw7fI7"
			],
			"shared_ids": [
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"rules":[
		{
			"field": {
				"operator": "IS",
				"values": ["Area"]
			},
			"operator":"GT",
			"values":[5]
		},
		{
			"field": {
				"operator": "IS",
				"values": ["IFC Type"]
			},
			"operator":"IS",
			"values":[
				"IfcWall",
				"IfcDoor"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000004"
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision/:revId/groups/:groupId",title:"Find group",name:"findGroup",group:"Groups",description:"<p>Find a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"}]}},examples:[{title:"Example usage (/:revId)",content:`
GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1`,type:"get"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"This is the description text for the first group.",
	"name":"Group 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [],
			"shared_ids": [
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"},{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
	"name":"Smart 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [
				"2cx1GdQ9fAgRIWgfhfBb84",
				"13NEEUJ8DEE8fEH0aHgm2z",
				"3OLNF2_DL6hfPgh8Bw7fI7"
			],
			"shared_ids": [
				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"rules":[
		{
			"field": {
				"operator": "IS",
				"values": ["Area"]
			},
			"operator":"GT",
			"values":[5]
		},
		{
			"field": {
				"operator": "IS",
				"values": ["IFC Type"]
			},
			"operator":"IS",
			"values":[
				"IfcWall",
				"IfcDoor"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000004"
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/groups/import",title:"Import Groups",name:"importGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ImportFederationGroups</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision/master/head/groups",title:"List all groups",name:"listGroups",group:"Groups",description:"<p>List all groups associated with the model.</p>",parameter:{fields:{Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noIssues",isArray:!1,description:"<p>Flag that hides groups for issues</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noRisks",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noViews",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of group objects</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	{
		"author":"alice",
		"color":[255,0,0],
		"createdAt":1520592300000,
		"description":"This is the description text for the first group.",
		"name":"Group 1",
		"objects":[
			{
				"account": "acme",
				"model": "00000000-0000-0000-0000-000000000000",
				"ifc_guids": [],
				"shared_ids": [
					"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
					"db18ef69-6d6e-49a0-846e-907346abb39d",
					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
					"3f881fa8-2b7b-443e-920f-396c1c85e903"
				]
			}
		],
		"updatedAt":1552128300000,
		"updatedBy":"alice",
		"_id":"00000000-0000-0000-0000-000000000002"
	},
	{
		"author":"alice",
		"color":[0,255,0],
		"createdAt":1520592300000,
		"description":"(No description)",
		"name":"Group 2",
		"objects":[
			{
				"account": "acme",
				"model": "00000000-0000-0000-0000-000000000000",
				"ifc_guids": [],
				"shared_ids": [
					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d"
				]
			}
		],
		"rules":[],
		"updatedAt":1552128300000,
		"updatedBy":"alice",
		"_id":"00000000-0000-0000-0000-000000000003"
	}
]`,type:"json"}]},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1",type:"get"},{title:"Example usage (no issue/risk groups)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?noIssues=true&noRisks=true HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?ifcguids=true HTTP/1.1",type:"get"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision/:revId/groups",title:"List all groups",name:"listGroups",group:"Groups",description:"<p>List all groups associated with the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noIssues",isArray:!1,description:"<p>Flag that hides groups for issues</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noRisks",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noViews",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of group objects</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	{
		"author":"alice",
		"color":[255,0,0],
		"createdAt":1520592300000,
		"description":"This is the description text for the first group.",
		"name":"Group 1",
		"objects":[
			{
				"account": "acme",
				"model": "00000000-0000-0000-0000-000000000000",
				"ifc_guids": [],
				"shared_ids": [
					"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
					"db18ef69-6d6e-49a0-846e-907346abb39d",
					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
					"3f881fa8-2b7b-443e-920f-396c1c85e903"
				]
			}
		],
		"updatedAt":1552128300000,
		"updatedBy":"alice",
		"_id":"00000000-0000-0000-0000-000000000002"
	},
	{
		"author":"alice",
		"color":[0,255,0],
		"createdAt":1520592300000,
		"description":"(No description)",
		"name":"Group 2",
		"objects":[
			{
				"account": "acme",
				"model": "00000000-0000-0000-0000-000000000000",
				"ifc_guids": [],
				"shared_ids": [
					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d"
				]
			}
		],
		"rules":[],
		"updatedAt":1552128300000,
		"updatedBy":"alice",
		"_id":"00000000-0000-0000-0000-000000000003"
	}
]`,type:"json"}]},examples:[{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1",type:"get"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"put",url:"/:teamspace/:model/revision/master/head/groups/:groupId/",title:"Update group",name:"updateGroup",group:"Groups",description:"<p>Update a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"Updated description text.",
	"name":"Group 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [],
			"shared_ids": [
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"put",url:"/:teamspace/:model/revision/:revId/groups/:groupId/",title:"Update group",name:"updateGroup",group:"Groups",description:"<p>Update a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/:revId)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"author":"alice",
	"color":[255,0,0],
	"createdAt":1520592300000,
	"description":"Updated description text.",
	"name":"Group 1",
	"objects":[
		{
			"account": "acme",
			"model": "00000000-0000-0000-0000-000000000000",
			"ifc_guids": [],
			"shared_ids": [
				"db18ef69-6d6e-49a0-846e-907346abb39d",
				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
				"3f881fa8-2b7b-443e-920f-396c1c85e903"
			]
		}
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revisions.json",title:"List all revisions",name:"listRevisions",group:"History",description:"<p>List all revisions for a model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Revisions",isArray:!1,description:"<p>object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000001",
		"author":"alice",
		"timestamp":"2009-06-06T00:00:00.000Z",
		"name":"00000000-0000-0000-0000-000000000001",
		"branch":"master"
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revisions.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"get",url:"/:teamspace/:model/revisions/:branch.json",title:"List all revisions by branch",name:"listRevisionsByBranch",group:"History",description:"<p>List all model revisions from a branch.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"branch.json",isArray:!1,description:"<p>Name of revision branch, followed by the .json extension</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"Revisions",isArray:!1,description:"<p>object for a branch</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000004",
		"author": "alice",
		"desc": "For coordination",
		"timestamp": "2015-10-21T07:28:00.000Z",
		"name":"00000000-0000-0000-0000-000000000004",
		"branch": "staging"
	},
	{
		"_id":"00000000-0000-0000-0000-000000000003",
		"author": "alice",
		"desc": "Roof access added",
		"timestamp": "1985-10-26T09:00:00.000Z",
		"name":"00000000-0000-0000-0000-000000000003",
		"branch": "staging"
	},
	{
		"_id":"00000000-0000-0000-0000-000000000002",
		"author": "alice",
		"desc": "Initial design",
		"timestamp": "1955-11-12T06:38:00.000Z",
		"name":"00000000-0000-0000-0000-000000000002",
		"branch": "staging"
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revisions/staging.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"patch",url:"/:teamspace/:model/revisions/:id",title:"Update revision status",name:"updateRevisionStatus",group:"History",description:"<p>Update the status of revision, setting it to void/active</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"id",isArray:!1,description:"<p>Unique Revision ID or tag</p>"}]},examples:[{title:"Input",content:`{
   "void": true
}`,type:"json"}]},success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"post",url:"/:teamspace/invitations",title:"Create/Update invitation",name:"createInvitation",group:"Invitations",description:"<p>It creates or updates an invitation with the permissions  and a job assigned to the invited email</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>The email to which the invitation will be sent</p>"},{group:"Body",type:"String",optional:!1,field:"job",isArray:!1,description:"<p>An existing job for the teamspace</p>"},{group:"Body",type:"Permissions",optional:!1,field:"permissions",isArray:!1,description:"<p>Valid permissions for the invited. If there is a teamspace_admin: true the rest of the permissions for that teamspace are ignored.</p>"},{group:"Permissions",type:"Boolean",optional:!0,field:"teamspace_admin",isArray:!1,description:"<p>Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.</p>",checked:!1},{group:"Permissions",type:"ProjectPermissions[]",optional:!0,field:"projects",isArray:!0,description:"<p>Permissions for projects and their models.</p>"},{group:"ProjectPermissions",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>The id of the project in which the project permissions will be applied for the invited user.</p>"},{group:"ProjectPermissions",type:"Boolean",optional:!0,field:"project_admin",isArray:!1,description:"<p>Flag indicating if the invited user will become a project administrator. If this flag is true the rest of the permissions are ignored.</p>",checked:!1},{group:"ProjectPermissions",type:"ModelPermissions[]",optional:!0,field:"models",isArray:!0,description:"<p>An array indicating the permissions for the models.</p>"},{group:"ModelPermissions",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The id of the model that will have the permission applied for the invited user.</p>"},{group:"ModelPermissions",type:"String",optional:!1,field:"permission",isArray:!1,description:"<p>The type of permission applied for the invited user. Valid values are 'viewer', 'commenter' or 'collaborator'</p>"}],examples:[{title:"Example usage (with projects and models, permissions):",content:`POST /teamSpace1/invitations HTTP/1.1
	{
		email:'invited@enterprise.com'
		job: 'jobA',
		permissions:{
			projects:[
				{
					project: '5bf7df65-f3a8-4337-8016-a63f00000000',
					models: [
						{ model: '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac', permission:'viewer'},
						{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission:'commenter'},
					]
				},
				{
					project: 'Bim Logo',
					project_admin: true
				}
			]
		}
	}`,type:"post"},{title:"Example usage (with teamspace admin):",content:`POST /teamSpace1/invitations HTTP/1.1
	{
		email:'anotherinvited@enterprise.com'
		job: 'jobA',
		permissions: {
			teamspace_admin: true
		}
	}`,type:"post"}],success:{examples:[{title:"Success (with projects and models, permissions)",content:`HTTP/1.1 200 OK
	{
		email:'invited@enterprise.com'
		job: 'jobA',
		permissions:{
			projects:[
				{
					project: '5bf7df65-f3a8-4337-8016-a63f00000000',
					models: [
						{ model: '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac', permission:'viewer'},
						{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission:'commenter'},
					]
				},
				{
					project: 'Bim Logo',
					project_admin: true
				}
			]
		}
	}`,type:"json"},{title:"Success (with teamspace admin)",content:`HTTP/1.1 200 OK
	{
		email:'anotherinvited@enterprise.com'
		job: 'jobA',
		permissions: {
			teamspace_admin: true
		}
	}`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"get",url:"/:teamspace/invitations",title:"Get invitations list",name:"getInvitations",group:"Invitations",description:"<p>It returns a list of invitations with their permissions and their jobs.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/invitations HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
[
  {
    "email": "7e634bae01db4f@mail.com",
    "job": "jobA",
    "permissions": {
      "teamspace_admin": true
    }
  },
  {
    "email": "93393d28f953@mail.com",
    "job": "jobA",
    "permissions": {
      "projects": [
        {
          "project": '5bf7df65-f3a8-4337-8016-a63f00000000',
          "project_admin": true
        }
      ]
    }
  },
  {
    "email": "48bc8da2f3bc@mail.com",
    "job": "jobA",
    "permissions": {
      "projects": [
        {
          "project": '5bf7df65-f3a8-4337-8016-a63f00000000',
          "models": [
            {
              "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
              "permission": "collaborator"
            }
          ]
        }
      ]
    }
  }
]`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"delete",url:"/:teamspace/invitations/:email",title:"Revokes an invitation",name:"removeInvitation",group:"Invitations",description:"<p>It revokes an invitation for a teamspace</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>Email of the user invitation that you wish to revoke</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/invitations/invited@enterprise.com HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"post",url:"/:teamspace/:model/issues/:issueId/resources",title:"Attach resources to an issue",name:"attachResource",group:"Issues",description:"<p>Attaches file or url resources to an issue. If the type of the resource is file it should be send as multipart/form-data. Both types at the same time cant be sent. So in order to attach files and urls it should be done with two different requests.</p> <p>This method triggers a chat event</p>",body:[{group:"File Resource - multipart/form-data",type:"File[]",optional:!1,field:"files",isArray:!0,description:"<p>The array of files to be attached</p>"},{group:"File Resource - multipart/form-data",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"},{group:"URL Resource",type:"String[]",optional:!1,field:"urls",isArray:!0,description:"<p>The array of urls to be attached</p>"},{group:"URL Resource",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the urls; it should have the same length as the url field</p>"}],success:{examples:[{title:"Success example result after two files has been uploaded",content:`
[
   {
      "_id":"7617f775-9eb7-4877-8ec3-98ea3457e519",
      "size":1422,
      "issueIds":[
         "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
      ],
      "name":"todo.txt",
      "user":"teamSpace1",
      "createdAt":1561973996461
   },
   {
      "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
      "size":2509356,
      "issueIds":[
         "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
      ],
      "name":"football.gif",
      "user":"teamSpace1",
      "createdAt":1561973996462
   }
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues/:issueId/comments",title:"Add comment to issue",name:"commentIssue",group:"Issues",body:[{group:"Body",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"},{group:"Body",type:"Viewpoint",optional:!0,field:"viewpoint",isArray:!1,description:"<p>The viewpoint associated with the comment</p>"}],parameter:{examples:[{title:"Request Body Example:",content:`{
  "comment": "This is a commment",
  "viewpoint": {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],\u2026}
}`,type:"json"}],fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},success:{examples:[{title:"Success",content:` HTTP/1.1 200 OK
{
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
    comment: "This is a commment",
    created: 1558534690327,
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
    owner: "username",
    viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],\u2026}
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",isArray:!1,description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>Comment with no text</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/comments",title:"Deletes an comment from an issue",name:"commentIssue",group:"Issues",body:[{group:"Body",type:"String",optional:!1,field:"guid",isArray:!1,description:"<p>The GUID of the comment to be deleted.</p>"}],parameter:{examples:[{title:"Request Body Example:",content:`{
   "guid": "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}],fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}},success:{examples:[{title:"Success",content:` HTTP/1.1 200 OK
{
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",isArray:!1,description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"401",isArray:!1,description:"<p>Not authorized, when the user is not the owner</p>"},{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>Issue comment sealed, when the user is trying to delete a comment that is sealed</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/resources",title:"Detach a resource from an issue",name:"detachResource",group:"Issues",description:"<p>Detachs a resource from an issue. If the issue is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",body:[{group:"Body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>The resource id to be detached</p>"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
   "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
   "size":2509356,
   "issueIds":[
   ],
   "name":"football.gif",
   "user":"teamSpace1",
   "createdAt":1561973996462
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId",title:"Get issue",name:"findIssue",group:"Issues",description:"<p>Find an issue with the requested Issue ID.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object",optional:!1,field:"issue",isArray:!1,description:"<p>The Issue matching the Issue ID</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
		account: "username"
		assigned_roles: []
		commentCount: 0
		created: 1542723030489
		creator_role: "3D Repo"
		desc: "(No Description)"
		model: "model_ID"
		modelCode: ""
		name: "Issue one"
		number: 1
		owner: "username"
		position: []
		priority: "none"
		rev_id: "revision_ID"
		scale: 1
		status: "open"
		thumbnail: "USERNAME/MODEL_ID/issues/ISSUE_ID/thumbnail.png"
		topic_type: "for_information"
		typePrefix: "Architectural"
		viewCount: 1
		viewpoint: {near: 24.057758331298828, far: 12028.87890625, fov: 1.0471975803375244,\u2026}
		__v: 0
		_id: "ISSUE_ID"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"ISSUE_NOT_FOUND",isArray:!1,description:"<p>Issue not found</p>"}]},examples:[{title:"HTTP/1.1 404 Not Found",content:`HTTP/1.1 404 Not Found
{
	 "place": "GET /issues/:issueId",
	 "status": 500,
	 "message": "Issue not found",
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.bcfzip",title:"Download issues BCF file",name:"getIssuesBCF",group:"Issues",description:"<p>Download issues as a BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Get Issues BCF zip file by revision ID",name:"getIssuesBCFTRid",group:"Issues",description:"<p>Get Issues BCF export based on revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshot.png",title:"Get issue viewpoint screenshot",name:"getScreenshot",group:"Issues",description:"<p>Get an issue viewpoint screenshot.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",isArray:!1,description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshotSmall.png",title:"Get smaller version of Issue screenshot",name:"getScreenshotSmall",group:"Issues",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Issue",isArray:!1,description:"<p>Screenshot.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",isArray:!1,description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/thumbnail.png",title:"Get issue thumbnail",name:"getThumbnail",group:"Issues",description:"<p>Retrieve screenshot thumbnail image for requested issue.</p>",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"thumbnail",isArray:!1,description:"<p>Thumbnail image</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues.bcfzip",title:"Import BCF file",name:"importBCF",group:"Issues",description:"<p>Upload issues BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues",title:"List Issues",name:"listIssues",group:"Issues",description:"<p>List all issues for model.</p>",success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
[
	{
		"_id":"ISSUE_ID",
		"creator_role":"Client","scale":1,
		"due_date":1543881600000,
		"priority":"low",
		"desc":"reverse",
		"topic_type":"for_information",
		"status":"for approval",
		"owner":"username",
		"created":1546217360002,
		"name":"Without reverse",
		"number":2,
		"rev_id":"REVISION_ID",
		"__v":0,
		"assigned_roles":["Architect"],
		"viewCount":1,
		"commentCount":0,
		"thumbnail":"nabile/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
		"position":[8341.8056640625,1279.962158203125,-3050.34521484375],
		"typePrefix":"sample",
		"modelCode":"",
		"account":"username",
		"model":"MODEL_ID",
		"viewpoint":
			{
				"near":54.739341735839844,
				"far":27369.669921875,
				"fov":1.0471975803375244,
				"aspect_ratio":1.451704502105713,
				"hideIfc":true,
				"guid":"9279d95e-3aee-49c2-ba45-9d2302044597",
				"_id":"5c296790e5f57704580ca00a",
				"type":"perspective",
				"screenshot":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshot.png",
				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
				"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
				"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
				"position":[-3360.6259765625,5111.28125,2853.4453125],
				"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
				"screenshotSmall":"nabile/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshotSmall.png"
			}
	}
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",isArray:!1,description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",isArray:!0,description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",isArray:!0,description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",isArray:!0,description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",isArray:!0,description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues",title:"List Issues by revision ID",name:"listIssuesByRevision",group:"Issues",description:"<p>Get all issues related to specific revision ID.</p>",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Issues",isArray:!1,description:"<p>Object</p>"}]},examples:[{title:"Success-Response",content:`
[
	{
		"_id":"issue_ID",
		"creator_role":"Client",
		"scale":1,
		"due_date":1547424000000,
		"priority":"low",
		"desc":"This is a description",
		"topic_type":"for_information",
		"status":"open","owner":"username",
		"created":1546626949432,
		"name":"An Issue for API",
		"number":3,
		"rev_id":"9cf31c6e-37cc-4625-8cee-270cf731059e",
		"__v":0,
		"assigned_roles":["Architect"],
		"viewCount":1,"commentCount":0,
		"thumbnail":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
		"position":[],
		"typePrefix":"sample",
		"modelCode":"",
		"account":"username",
		"model":"MODEL_ID",
		"viewpoint":
			{
				"near":54.739341735839844,
				"far":27369.669921875,
				"fov":1.0471975803375244,
				"aspect_ratio":2.522167444229126,
				"hideIfc":true,
				"guid":"5afbe23f-8307-42d0-ba77-f031922281ce",
				"_id":"5c2fa785b4af3c45f8f83c60",
				"type":"perspective",
				"screenshot":"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png",
				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
					"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
					"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
					"position":[-3360.6259765625,5111.28125,2853.4453125],
					"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
					"screenshotSmall"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png"}
	}
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",isArray:!1,description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",isArray:!0,description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",isArray:!0,description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",isArray:!0,description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",isArray:!0,description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues",title:"Create issue",name:"newIssue",group:"Issues",description:"<p>Creates a new issue.</p>",body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the issue</p>"},{group:"Body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>The roles assigned to the issue. Even though its an array (this is for future support of multiple assigned jobs), currently it has one or none elements correspoing to the available jobs in the teamaspace.</p>"},{group:"Body",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>The status of the issue. It can have a value of &quot;open&quot;,&quot;in progress&quot;,&quot;for approval&quot;, &quot;void&quot; or &quot;closed&quot;.</p>"},{group:"Body",type:"String",optional:!1,field:"priority",isArray:!1,description:"<p>The priority of the issue. It can have a value of &quot;none&quot;, &quot;low&quot;, &quot;medium&quot; or &quot;high&quot;.</p>"},{group:"Body",type:"String",optional:!1,field:"topic_type",isArray:!1,description:"<p>Type of the issue. It's value has to be one of the defined topic_types for the model. See <a href='#api-Model-createModel'>here</a> for more details.</p>"},{group:"Body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>The viewpoint of the issue, defining the position of the camera and the screenshot for that position.</p>"},{group:"Body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>The description of the created issue</p>"},{group:"Body",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>The vector defining the pin of the issue. If the pin doesnt has an issue its an empty array.</p>"}],examples:[{title:"Example usage:",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues HTTP/1.1
{
   "name": "Amazing issue",
   "assigned_roles": [
      "jobA"
   ],
   "status": "open",
   "priority": "none",
   "topic_type": "for_information",
   "viewpoint": {
      "right": [
         0.8471935391426086,
         -2.2351741790771484e-8,
         0.5312844514846802
      ],
      "up": [
         0.14098820090293884,
         0.9641460180282593,
         -0.22482173144817352
      ],
      "position": [
         -5828.818359375,
         5268.15625,
         7829.76171875
      ],
      "look_at": [
         -2445.6826171875,
         3515.4658203125,
         2434.966552734375
      ],
      "view_dir": [
         0.5122357606887817,
         -0.2653723657131195,
         -0.8168182373046875
      ],
      "near": 20.835742950439453,
      "far": 10417.87109375,
      "fov": 1.0471975803375244,
      "aspect_ratio": 4.031496047973633,
      "clippingPlanes": [],
      "override_groups": [
          {
              "color": [
         	     0,
         	     106,
         	     255,
         	     52
         	 ],
         	 "objects": [
                  {
                      "shared_ids": [
                          "ffd49cfd-57fb-4c31-84f7-02b41352b54f"
                      ],
                      "account": "teamSpace1",
                      "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
                  }
              ]
         },
         {
             "color": [
                 96,
                 237,
                 61
             ],
         	"objects": [
         	    {
                     "shared_ids": [
                         "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead"
                     ],
                     "account": "teamSpace1",
                     "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
                 }
             ]
         }
      ],
      "transformation_groups": [
          {
              "transformation": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
         	 "objects": [
                  {
                      "shared_ids": [
                          "ffd49cfd-57fb-4c31-84f7-02b41352b54f"
                      ],
                      "account": "teamSpace1",
                      "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
                  }
              ]
         },
         {
             "color": [
                 96,
                 237,
                 61
             ],
         	"objects": [
         	    {
                     "shared_ids": [
                         "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead"
                     ],
                     "account": "teamSpace1",
                     "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
                 }
             ]
         }
      ],
      "highlighted_group": {
      	"objects": [
      		{
      			"shared_ids": [
      				"60286d41-d897-4de6-a0ed-0929fa68be96"
      			],
      			"account": "teamSpace1",
      			"model": "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
      		}
      	],
      	"color": [
      		255,
      		255,
      		0
      	]
      },
      "hidden_group": {
      	"objects": [
      		{
      			"shared_ids": [
      				"57b0969f-6009-4e32-9153-2b17d3a3628b"
      			],
      			"account": "teamSpace1",
      			"model": "b1fceab8-b0e9-4e45-850b-b9888efd6521"
      		}
      	]
      }
      "hideIfc": true,
      "screenshot": "iVBORw0KGgoAAAANSUhEUgAACAAAA...ggg=="
   },
   "desc": "This is the most awesome issue ever",
   "position": [
      -3960.10205078125,
      4487.1552734375,
      3326.732177734375
   ]
}`,type:"post"}],success:{examples:[{title:"Success:",content:`{
   "name": "Amazing issue",
   "assigned_roles": [
      "jobA"
   ],
   "status": "open",
   "priority": "none",
   "topic_type": "for_information",
   "owner": "teamSpace1",
   "desc": "This is the most awesome issue ever",
   "rev_id": "330f909b-9279-41aa-a87c-1c46f53a8e93",
   "creator_role": "jobA",
   "scale": 1,
   "position": [
      -3960.10205078125,
      4487.1552734375,
      3326.732177734375
   ],
   "_id": "9ba5fb10-c8db-11e9-8f2a-ada77612c97e",
   "created": 1566918114625,
   "number": 1,
   "thumbnail": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/thumbnail.png",
   "typePrefix": "Structural",
   "modelCode": "",
   "account": "teamSpace1",
   "model": "3549ddf6-885d-4977-87f1-eeac43a0e818",
   "viewpoint": {
      "right": [
         0.8471935391426086,
         -2.2351741790771484e-8,
         0.5312844514846802
      ],
      "up": [
         0.14098820090293884,
         0.9641460180282593,
         -0.22482173144817352
      ],
      "position": [
         -5828.818359375,
         5268.15625,
         7829.76171875
      ],
      "look_at": [
         -2445.6826171875,
         3515.4658203125,
         2434.966552734375
      ],
      "view_dir": [
         0.5122357606887817,
         -0.2653723657131195,
         -0.8168182373046875
      ],
      "near": 20.835742950439453,
      "far": 10417.87109375,
      "fov": 1.0471975803375244,
      "aspect_ratio": 4.031496047973633,
      "clippingPlanes": [],
      "hidden_group_id": "119d5dc0-e223-11ea-8549-49012d4e4956",
      "highlighted_group_id" : "80c5a270-e223-11ea-8549-49012d4e4956",
      "override_group_ids": [
         "11952060-e223-11ea-8549-49012d4e4956",
         "bc5ca80-e6c7-11ea-bd51-ddd919e6418e"
      ],
      "transformation_group_ids": [
         "12345678-e223-11ea-8549-49012d4e4956",
         "12345678-e6c7-11ea-bd51-ddd919e6418e"
      ],
      "hideIfc": true,
      "screenshot": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/viewpoints/125ce196-852c-49ed-9a2f-f9a77aa03390/screenshot.png",
      "guid": "125ce196-852c-49ed-9a2f-f9a77aa03390",
      "screenshotSmall": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/viewpoints/125ce196-852c-49ed-9a2f-f9a77aa03390/screenshotSmall.png"
   },
   "comments": [],
   "extras": {
   }
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"post",url:"/:teamspace/:model/revision/:revId/issues",title:"Create issue on revision",name:"newIssueRev",group:"Issues",description:'<p>Creates a new issue for a particular revision. See <a href="#api-Issues-newIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Post Issues BCF zip file by revision ID",name:"postIssuesBCF",group:"Issues",description:"<p>Upload Issues BCF file using current revision ID.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>&quot;ok&quot; on success</p>"}]},examples:[{title:"Success-Response:",content:`HTTP
{
	"status":"ok"
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.html",title:"Issues response into as HTML",name:"renderIssuesHTML",group:"Issues",description:"<p>Render all Issues into a HTML webpage, response is rendered HTML.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.html",title:"Issues response into as HTML by revision ID",name:"renderIssuesHTMLRid",group:"Issues",description:"<p>Render all Issues into a HTML webpage based on current revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"patch",url:"/:teamspace/:model/issues/:issueId",title:"Update issue",name:"updateIssue",group:"Issues",description:"<p>Updates an issue. It takes the part of the issue that can be updated. The system will create a system comment within the issue describing which values were changed. The user needs to be the teamspace administrator, the project administrator, has the same job as the creator of the issue, or has the issue assigned. In the case that the issue has been assigned to the user, the user cannot change it to the &quot;closed&quot; status.</p> <p>If the issue is being updated to assigned to a job and the status of the issue has the value &quot;for_approval&quot;, then the status of the issue is automatically changed to &quot;in_progress&quot;.</p> <p>If the user is changing the issue to the &quot;for_approval&quot; status, the issue will be assigned to the job that the creator of the issue.</p>",body:[{group:"Body",type:"String[]",optional:!0,field:"assigned_roles",isArray:!0,description:"<p>Job roles assigned to the issue</p>"},{group:"Body",type:"String",optional:!0,field:"desc",isArray:!1,description:"<p>Description of issue</p>"},{group:"Body",type:"String",optional:!0,field:"status",isArray:!1,description:"<p>The status of issue (values: &quot;open&quot;, &quot;in progress&quot;, &quot;for approval&quot;, &quot;closed&quot;)</p>"},{group:"Body",type:"String",optional:!0,field:"topic_type",isArray:!1,description:"<p>Topic type of issue (see <a href='#api-Model-createModel'>here</a> for available types)</p>"},{group:"Body",type:"Number",size:"3..3",optional:!0,field:"position",isArray:!1,description:"<p>Vector defining the pin position of the issue; empty if the issue has no pin</p>"},{group:"Body",type:"Number",optional:!0,field:"due_date",isArray:!1,description:"<p>Due date timestamp for the issue</p>"},{group:"Body",type:"String",optional:!0,field:"priority",isArray:!1,description:"<p>The priority of the issue (values: &quot;none&quot;, &quot;low&quot;, &quot;medium&quot;, &quot;high&quot;)</p>"},{group:"Body",type:"Number",optional:!0,field:"scale",isArray:!1,description:"<p>The scale factor of the issue</p>"},{group:"Body",type:"Viewpoint",optional:!0,field:"viewpoint",isArray:!1,description:"<p>The viewpoint and screenshot of the issue</p>"},{group:"Body",type:"Number",optional:!0,field:"viewCount",isArray:!1,description:"<p>The viewcount of the issue</p>"},{group:"Body",type:"Object",optional:!0,field:"extras",isArray:!1,description:"<p>A field containing any extras that wanted to be saved in the issue (typically used by BCF)</p>"}],examples:[{title:"Example usage:",content:`PATCH /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e HTTP/1.1
{"status":"in progress"}`,type:"patch"}],success:{examples:[{title:"Success:",content:`{
   "_id": "98c39770-c8e2-11e9-8f2a-ada77612c97e",
   "name": "issue 2",
   "assigned_roles": [
      "jobC"
   ],
   "status": "in progress",
   "priority": "none",
   "topic_type": "for_information",
   "owner": "teamSpace1",
   "rev_id": "330f909b-9279-41aa-a87c-1c46f53a8e93",
   "creator_role": "jobA",
   "scale": 1,
   "created": 1566921116263,
   "desc": "(No Description)",
   "number": 2,
   "thumbnail": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/thumbnail.png",
   "comments": [
      {
         "guid": "febbe083-5a98-4711-8d60-d2ac06721f83",
         "created": 1566924049774,
         "owner": "teamSpace1",
         "action": {
            "property": "assigned_roles",
            "from": "",
            "to": "jobB"
         },
         "sealed": true
      },
      {
         "guid": "e8ba32b2-d58e-4c33-90f7-c6e0404ef1ee",
         "created": 1566924062287,
         "owner": "teamSpace1",
         "action": {
            "property": "assigned_roles",
            "from": "jobB",
            "to": "jobC"
         },
         "sealed": true
      },
      {
         "guid": "83117273-2698-4d2d-bd47-7cd31e6a7b14",
         "created": 1566924080277,
         "owner": "teamSpace1",
         "action": {
            "property": "status",
            "from": "open",
            "to": "in progress"
         }
      }
   ],
   "status_last_changed": 1566924080277,
   "account": "teamSpace1",
   "model": "3549ddf6-885d-4977-87f1-eeac43a0e818",
   "viewpoint": {
      "right": [
         0.9953137040138245,
         -4.656612873077393e-10,
         0.09669896215200424
      ],
      "up": [
         0.005437099374830723,
         0.9984180331230164,
         -0.05596357211470604
      ],
      "position": [
         -3083.33251953125,
         3886.8251953125,
         8998.2783203125
      ],
      "look_at": [
         -2445.680419921875,
         3515.46533203125,
         2434.984130859375
      ],
      "view_dir": [
         0.0965459868311882,
         -0.05622706934809685,
         -0.9937390685081482
      ],
      "near": 20.835796356201172,
      "far": 10417.8984375,
      "fov": 1.0471975803375244,
      "aspect_ratio": 3.1459293365478516,
      "clippingPlanes": [],
      "highlighted_group_id": "98b9d370-c8e2-11e9-8f2a-ada77612c97e",
      "hideIfc": true,
      "screenshot": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/viewpoints/a1167d5f-2434-4a50-a158-d6a6745e7d6a/screenshot.png",
      "guid": "a1167d5f-2434-4a50-a158-d6a6745e7d6a",
      "screenshotSmall": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/viewpoints/a1167d5f-2434-4a50-a158-d6a6745e7d6a/screenshotSmall.png"
   },
   "position": [],
   "extras": {
   }
}`,type:"json"}],fields:{200:[{group:"200",type:"Object",optional:!1,field:"Updated",isArray:!1,description:"<p>Issue Object.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"patch",url:"/:teamspace/:model/revision/:revId/issues/:issueId",title:"Update issue on revision",name:"updateIssueRev",group:"Issues",description:'<p>Updates an issue for a particular revision. See <a href="#api-Issues-updateIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/jobs/:jobId/:user",title:"Assign a job",name:"addUserToJob",group:"Jobs",description:"<p>Assign a job to a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"POST /acme/jobs/Job1/alice HTTP/1.1",type:"post"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"post",url:"/:teamspace/jobs",title:"Create a new job",name:"createJob",group:"Jobs",description:"<p>Create a new job on teamspace.</p>",body:[{group:"Body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Body",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}],success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"_id":"Job4",
	"color":"#ffff00"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/jobs HTTP/1.1
{
	"_id":"Job4",
	"color":"#ffff00"
}`,type:"post"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"delete",url:"/:teamspace/jobs/:jobId",title:"Delete a job",name:"deleteJob",group:"Jobs",description:"<p>Delete a job from teamspace.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/jobs/Job1 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"get",url:"/:teamspace/myJob",title:"Get user job",name:"getUserJob",group:"Jobs",description:"<p>Get job assigned to current user.</p>",examples:[{title:"Example usage:",content:"GET /acme/myJob HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"_id":"Job1",
	"color":"#ff0000"
}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs/colors",title:"List colours",name:"listColors",group:"Jobs",description:"<p>List job colours.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"String[]",optional:!1,field:"colors",isArray:!0,description:"<p>List of job colours</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	"#ff0000",
	"#00ff00",
	"#0000ff"
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs/colors HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs",title:"List all jobs",name:"listJobs",group:"Jobs",description:"<p>List of all jobs defined in teamspace.</p>",success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
[
	{
		"_id":"Job1",
		"color":"#ff0000"
	},
	{
		"_id":"Job2",
		"color":"#00ff00"
	},
	{
		"_id":"Job3",
		"color":"#0000ff"
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"put",url:"/:teamspace/jobs/:jobId",title:"Update job",name:"updateJob",group:"Jobs",description:"<p>Update job.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Body",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}],examples:[{title:"Example usage:",content:`PUT /acme/jobs/Job1 HTTP/1.1
{
	"_id":"Renamed Job",
	"color":"#00ffff"
}`,type:"put"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/4DTaskSequence.json",title:"Get All metadata for 4D Sequence Tags",name:"getAllIdsWith4DSequenceTag",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/4DTaskSequence.json",title:"Get All metadata with 4D Sequence Tags by revision",name:"getAllIdsWith4DSequenceTagRev",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/all.json",title:"Get all metadata",name:"getAllMetadata",group:"Meta",description:"<p>Get all objects in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"filter",isArray:!1,description:"<p>properties to filter for, comma separated</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/all.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   "data": [
      {
         "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
         "metadata": {
            "IFC Type": "IfcBuilding",
            "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
            "BuildingID": "n/a",
            "IsPermanentID": "True",
            "OccupancyType": "Private dwelling",
            "IsLandmarked": "True",
            "NumberOfStoreys": 2
         },
         "parents": [
            "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
         ]
      },
      {
         "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
         "metadata": {
            "IFC Type": "IfcSite",
            "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
         },
         "parents": [
            "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
         ]
      },
      {
         "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
         "metadata": {
            "IFC Type": "IfcBuildingElementProxy",
            "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
            "Reference": "LegoRoundTree"
         },
         "parents": [
            "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
         ]
      },
      {
         "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
         "metadata": {
            "IFC Type": "IfcBuildingStorey",
            "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
            "AboveGround": "False"
         },
         "parents": [
            "323a9900-ece1-4857-8980-ec96ffc7f681"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/all.json",title:"Get all metadata by revision",name:"getAllMetadataByRev",group:"Meta",description:"<p>Get all tree objects with their metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to get metadata from</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"filter",isArray:!1,description:"<p>properties to filter for, comma separated</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata",name:"getIdsWithMetadataField",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key (in the latest revision). It also returns the metadata value for that key.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey.json",isArray:!1,description:"<p>Unique metadata key</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/findObjsWith/IsLandmarked.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   "data": [
      {
         "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
         "metadata": {
            "value": "True"
         },
         "parents": [
            "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata in a revision",name:"getIdsWithMetadataFieldByRev",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key from a particular revision. See more details <a href='#api-Meta-getIdsWithMetadataField'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to get metadata from</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey.json",isArray:!1,description:"<p>Unique meta key</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/meta/:id.json",title:"Get metadata",name:"getMetadataById",group:"Meta",description:"<p>Get all metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"id.json",isArray:!1,description:"<p>Meta Unique ID with .json extension</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   "meta": [
      {
         "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
         "name": "LegoRoundTree:LegoRoundTree:302403",
         "metadata": {
            "IFC Type": "IfcBuildingElementProxy",
            "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
            "Reference": "LegoRoundTree"
         }
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/meta/keys",title:"Get array of metadata fields",name:"getMetadataFields",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/keys HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   "AboveGround",
   "BuildingID",
   "IFC GUID",
   "IFC Type",
   "IsLandmarked",
   "IsPermanentID",
   "NumberOfStoreys",
   "OccupancyType",
   "Reference"
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"post",url:"/:teamspace/:model/revision/master/head/meta/rules",title:"Filter metadata by rules",name:"queryMetadataByRules",group:"Meta",description:"<p>Get all objects matching filter rules in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"meshids",isArray:!1,description:"<p>Flag that returns Mesh IDs for matching rule queries</p>"},{group:"Query",type:"String",optional:!0,field:"filter",isArray:!1,description:"<p>properties to filter for, comma separated</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/rules HTTP/1.1
[
	{
		"field":"Area",
		"operator":"GT",
		"values":[5]
	},
	{
		"field":"IFC Type",
		"operator":"IS",
		"values":[
			"IfcWall",
			"IfcDoor"
		]
	}
]`,type:"post"},{title:"Example usage (mesh IDs)",content:"POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/rules?meshids=true HTTP/1.1",type:"post"}],success:{examples:[{title:"Success (metadata):",content:`{
   "data": [
      {
         "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
         "metadata": {
            "IFC Type": "IfcBuilding",
            "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
            "BuildingID": "n/a",
            "IsPermanentID": "True",
            "OccupancyType": "Private dwelling",
            "IsLandmarked": "True",
            "Area": 9000,
            "NumberOfStoreys": 2
         },
         "parents": [
            "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
         ]
      },
      {
         "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
         "metadata": {
            "IFC Type": "IfcWall",
            "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
         },
         "parents": [
            "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
         ]
      },
      {
         "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
         "metadata": {
            "IFC Type": "IfcBuildingElementProxy",
            "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
            "Area": 6,
            "Reference": "LegoRoundTree"
         },
         "parents": [
            "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
         ]
      },
      {
         "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
         "metadata": {
            "IFC Type": "IfcDoor",
            "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
            "AboveGround": "False"
         },
         "parents": [
            "323a9900-ece1-4857-8980-ec96ffc7f681"
         ]
      }
   ]
}`,type:"json"},{title:"Success (federation metadata):",content:`{
   "data": [],
   "subModels": [
      {
          "data": [
              {
                  "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
                  "metadata": {
                      "IFC Type": "IfcBuilding",
                      "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
                      "BuildingID": "n/a",
                      "IsPermanentID": "True",
                      "OccupancyType": "Private dwelling",
                      "IsLandmarked": "True",
                      "Area": 9000,
                      "NumberOfStoreys": 2
                  },
                  "parents": [
                      "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
                  ]
              },
              {
                  "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
                  "metadata": {
                      "IFC Type": "IfcWall",
                      "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
                  },
                  "parents": [
                      "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
                  ]
              },
              {
                  "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
                  "metadata": {
                      "IFC Type": "IfcBuildingElementProxy",
                      "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
                      "Area": 6,
                      "Reference": "LegoRoundTree"
                  },
                  "parents": [
                      "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
                  ]
              },
              {
                  "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
                  "metadata": {
                      "IFC Type": "IfcDoor",
                      "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
                      "AboveGround": "False"
                  },
                  "parents": [
                      "323a9900-ece1-4857-8980-ec96ffc7f681"
                  ]
              }
         ],
         "account": "acme",
         "model": "00000000-0000-0000-0000-000000000001"
      },
      {
          "data": [
              {
                  "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
                  "metadata": {
                      "IFC Type": "IfcBuilding",
                      "IFC GUID": "12tTo3QcxqWd5Gvc4sABCA",
                      "BuildingID": "Site B",
                      "IsPermanentID": "True",
                      "OccupancyType": "Private dwelling",
                      "IsLandmarked": "True",
                      "Area": 20,
                      "NumberOfStoreys": 1
                  },
                  "parents": [
                      "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
                  ]
              }
         ],
         "account": "acme",
         "model": "00000000-0000-0000-0000-000000000002"
      }
   ]
}`,type:"json"},{title:"Success (mesh IDs):",content:`[
	{
		"account": "acme",
		"model": "00000000-0000-0000-0000-000000000000",
		"mesh_ids": [
			"11111111-1111-1111-1111-111111111111",
			"22222222-2222-2222-2222-222222222222",
			"33333333-3333-3333-3333-333333333333",
			"44444444-4444-4444-4444-444444444444"
		]
	}
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"post",url:"/:teamspace/:model/revision/:rev/meta/rules",title:"Filter metadata by rules",name:"queryMetadataByRules",group:"Meta",description:"<p>Get all objects matching filter rules in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"meshids",isArray:!1,description:"<p>Flag that returns Mesh IDs for matching rule queries</p>"},{group:"Query",type:"String",optional:!0,field:"filter",isArray:!1,description:"<p>properties to filter for, comma separated</p>"}]}},success:{examples:[{title:"Success (metadata):",content:`{
   "data": [
      {
         "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
         "metadata": {
            "IFC Type": "IfcBuilding",
            "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
            "BuildingID": "n/a",
            "IsPermanentID": "True",
            "OccupancyType": "Private dwelling",
            "IsLandmarked": "True",
            "Area": 9000,
            "NumberOfStoreys": 2
         },
         "parents": [
            "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
         ]
      },
      {
         "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
         "metadata": {
            "IFC Type": "IfcWall",
            "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
         },
         "parents": [
            "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
         ]
      },
      {
         "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
         "metadata": {
            "IFC Type": "IfcBuildingElementProxy",
            "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
            "Area": 6,
            "Reference": "LegoRoundTree"
         },
         "parents": [
            "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
         ]
      },
      {
         "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
         "metadata": {
            "IFC Type": "IfcDoor",
            "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
            "AboveGround": "False"
         },
         "parents": [
            "323a9900-ece1-4857-8980-ec96ffc7f681"
         ]
      }
   ]
}`,type:"json"},{title:"Success (federation metadata):",content:`{
   "data": [],
   "subModels": [
      {
          "data": [
              {
                  "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
                  "metadata": {
                      "IFC Type": "IfcBuilding",
                      "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
                      "BuildingID": "n/a",
                      "IsPermanentID": "True",
                      "OccupancyType": "Private dwelling",
                      "IsLandmarked": "True",
                      "Area": 9000,
                      "NumberOfStoreys": 2
                  },
                  "parents": [
                      "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
                  ]
              },
              {
                  "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
                  "metadata": {
                      "IFC Type": "IfcWall",
                      "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
                  },
                  "parents": [
                      "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
                  ]
              },
              {
                  "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
                  "metadata": {
                      "IFC Type": "IfcBuildingElementProxy",
                      "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
                      "Area": 6,
                      "Reference": "LegoRoundTree"
                  },
                  "parents": [
                      "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
                  ]
              },
              {
                  "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
                  "metadata": {
                      "IFC Type": "IfcDoor",
                      "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
                      "AboveGround": "False"
                  },
                  "parents": [
                      "323a9900-ece1-4857-8980-ec96ffc7f681"
                  ]
              }
         ],
         "account": "acme",
         "model": "00000000-0000-0000-0000-000000000001"
      },
      {
          "data": [
              {
                  "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
                  "metadata": {
                      "IFC Type": "IfcBuilding",
                      "IFC GUID": "12tTo3QcxqWd5Gvc4sABCA",
                      "BuildingID": "Site B",
                      "IsPermanentID": "True",
                      "OccupancyType": "Private dwelling",
                      "IsLandmarked": "True",
                      "Area": 20,
                      "NumberOfStoreys": 1
                  },
                  "parents": [
                      "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
                  ]
              }
         ],
         "account": "acme",
         "model": "00000000-0000-0000-0000-000000000002"
      }
   ]
}`,type:"json"},{title:"Success (mesh IDs):",content:`[
	{
		"account": "acme",
		"model": "00000000-0000-0000-0000-000000000000",
		"mesh_ids": [
			"11111111-1111-1111-1111-111111111111",
			"22222222-2222-2222-2222-222222222222",
			"33333333-3333-3333-3333-333333333333",
			"44444444-4444-4444-4444-444444444444"
		]
	}
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"delete",url:"/:teamspace/:model",title:"Delete Model.",name:"deleteModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to delete.</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/17d09947-368e-4748-877f-d105842c6681 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success:",content:`{
   "account": "teamSpace1",
   "model": "17d09947-368e-4748-877f-d105842c6681"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/download/latest",title:"Download model",name:"downloadModel",group:"Model",description:"<p>It returns the model file using the latest revision.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to download.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/download/latest HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (with headers):",content:`
HTTP/1.1 200 OK
X-Powered-By: Express
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Length: 11964
Content-Disposition: attachment;filename=3DrepoBIM_blocks.obj
set-cookie: connect.sid=s%3Ax4mDfLE-NqmPUO5tSSxPAyMjgov6YRge.bVSUoML3obJNp1XuObpbtXY44RjgEhJtsTz%2FwhwIckE; Domain=local.3drepo.io; Path=/; Expires=Tue, 27 Aug 2019 12:18:34 GMT; HttpOnly
Date: Tue, 27 Aug 2019 11:18:34 GMT
Connection: keep-alive

/***** FILE CONTENTS ******\\`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/assetsMeta",title:"Get unity assets metadata",name:"getAssetsMeta",group:"Model",description:"<p>Get the lastest model's version unity assets metadata</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/assetsMeta HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
    superMeshes: [
         {
              _id: "<uuid string>",
             nVertices: 123,
             nFaces: 123,
             nUVChannels: 123,
             boundingBox: [[1, 2, 3], [3,4, 5]]
         },
    ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/settings/heliSpeed",title:"Get model heli speed",name:"getHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The modelId to get Heli speed for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{"heliSpeed":1}',type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/idMap.json",title:"Get ID map",name:"getIdMap",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model id to Get ID Map for.</p>"}]}},examples:[{title:"Example usage (federation):",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/idMap.json HTTP/1.1",type:"get"},{title:"Example usage (model):",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idMap.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (federation):",content:`{
   mainTree: {
      idMap: {
         261bf9df-64d7-4642-8bb2-0a79abd370ec: "d86573c9-beec-4f06-b194-18b6983a3d71",
         528c62e6-5cf8-4868-b5ff-733c128b4b4e: "6047f788-8317-45ff-b692-29e03071ec63",
         7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c: "7d9eefe0-2b8a-4de3-9acb-c216c9b48c9f",
         95744e20-4b4d-4fc1-8ba7-1f31ebf772b6: "d2c0e845-b392-429e-86bd-6c7453b78654",
         71634e9c-da2c-4ea7-bd04-44971d3fd8dc: "6e40ecbc-bb2f-4504-8f00-80b12fb04443",
         a70dd58c-c09e-4ed4-ac7e-914dbd145302: "f1a14ded-6528-4937-b31d-ce4b3ca813d8",
         d68cf5e7-4d0f-4702-8a92-c81b72928c54: "d012d6ba-01d2-4460-921e-72539a1ac197"
      }
   },
   subModels: [
      {
         account: "teamSpace1",
         model: "b1fceab8-b0e9-4e45-850b-b9888efd6521",
         idMap: {
            a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "57b0969f-6009-4e32-9153-2b17d3a3628b",
            33c36fee-622d-46a5-8be1-a1bd295aa7d1: "1e47d53e-cad8-489b-89ea-7c6c7b8d0e6c"
         }
      },
      {
         account: "teamSpace1",
         model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
         idMap: {
            8a1f9cad-18d8-47ce-9cbd-08ba53858ced: "60286d41-d897-4de6-a0ed-0929fa68be96",
            ea37c2ed-39d4-4236-843c-332d52876c96: "9c4be293-0d8f-4e37-b115-d2c752824bfe"
         }
      },
      {
         account: "teamSpace1",
         model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
         idMap: {
            8ef1c52e-8838-46dc-9825-efe46aa10041: "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead",
            ecc25d63-87e0-4600-ae60-f38f766bc9e4: "ffd49cfd-57fb-4c31-84f7-02b41352b54f",
            3abc5450-5db8-459b-80ea-cb9fca9ccedd: "a6947de3-25f4-4c2c-a150-22f0ed9ce4dd"
         }
      }
   ]
}`,type:"json"},{title:"Success (model):",content:`{
   mainTree: {
      idMap: {
         a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "57b0969f-6009-4e32-9153-2b17d3a3628b",
         33c36fee-622d-46a5-8be1-a1bd295aa7d1: "1e47d53e-cad8-489b-89ea-7c6c7b8d0e6c"
      }
   },
   subModels: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/idToMeshes.json",title:"Get ID to meshes",name:"getIdToMeshes",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get ID Meshes for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idToMeshes.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   mainTree: {
      a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: [
         "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
      ],
      33c36fee-622d-46a5-8be1-a1bd295aa7d1: [
         "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
      ]
   },
   subModels: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.json.mpc",title:"Get JSON Mpc",name:"getJsonMpc",group:"Model",description:"<p>Get the unity bundle mpc json file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model to get JSON Mpc for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid.json.mpc",isArray:!1,description:"<p>id of the json.mpc file</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   numberOfIDs: 1,
   maxGeoCount: 1,
   mapping: [
      {
         name: "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
         sharedID: "a876e59a-8cda-4d61-b438-c74ce7b8855d",
         min: [
            -3515.19556,
            -5790.91504,
            0
         ],
         max: [
            0,
            0,
            3502.927
         ],
         usage: [
            "92fc213b-1bab-49a4-b10e-f4368a52d500_0"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/modelProperties.json",title:"Get model properties",name:"getModelProperties",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get properties for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/modelProperties.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   properties: {
      hiddenNodes: []
   },
   subModels: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model.json",title:"Get model settings",name:"getModelSetting",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model.json",isArray:!1,description:"<p>The modelId to get settings for, with a json extension.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   _id: "3549ddf6-885d-4977-87f1-eeac43a0e818",
   timestamp: "2019-05-13T16:54:44.000Z",
   type: "Structural",
   desc: "",
   name: "Lego Tree",
   subModels: [],
   surveyPoints: [],
   properties: {
      unit: "mm"
   },
   permissions: [
      "change_model_settings",
      "upload_files",
      "create_issue",
      "comment_issue",
      "view_issue",
      "view_model",
      "download_model",
      "edit_federation",
      "delete_federation",
      "delete_model",
      "manage_model_permission"
   ],
   status: "ok",
   id: "3549ddf6-885d-4977-87f1-eeac43a0e818",
   model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
   account: "teamSpace1",
   headRevisions: {
   }
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/fulltree.json",title:"Get tree",name:"getModelTree",group:"Model",description:"<p>Returns the full tree for the model</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/fulltree.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   mainTree: {
      nodes: {
         account: "teamSpace1",
         project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
         type: "transformation",
         name: "RootNode",
         path: "73a41cea-4c6b-47ed-936b-3f5641aecb52",
         _id: "73a41cea-4c6b-47ed-936b-3f5641aecb52",
         shared_id: "4dd46b6f-099e-42cd-b045-6460200e7995",
         children: [
            {
               account: "teamSpace1",
               project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
               type: "transformation",
               name: "Fouliiferous Tree H64_2",
               path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f",
               _id: "33fe7c13-17a4-43d6-af03-ceae6880322f",
               shared_id: "b69a8384-c29d-4954-9efa-4c7bc14f1d3d",
               children: [
                  {
                     account: "teamSpace1",
                     project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
                     type: "mesh",
                     name: "Fouliiferous Tree H64",
                     path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f__ce413e99-8469-4ed0-86e3-ff50bf4fed89",
                     _id: "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
                     shared_id: "a876e59a-8cda-4d61-b438-c74ce7b8855d",
                     toggleState: "visible"
                  }
               ],
               toggleState: "visible"
            }
         ],
         toggleState: "visible"
      },
      idToName: {
         ce413e99-8469-4ed0-86e3-ff50bf4fed89: "Fouliiferous Tree H64",
         33fe7c13-17a4-43d6-af03-ceae6880322f: "Fouliiferous Tree H64_2",
         73a41cea-4c6b-47ed-936b-3f5641aecb52: "RootNode"
      }
   },
   subTrees: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/model/permissions",title:"Get multiple models permissions",name:"getMultipleModelsPermissions",group:"Model",description:"<p>Gets the permissions of a list of models</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace.</p>"}]}},query:[{group:"Query",type:"String",optional:!1,field:"models",isArray:!1,description:"<p>An array of model ids.</p>"}],examples:[{title:"Example usage:",content:"GET /teamSpace1/models/permissions?models=5ce7dd19-1252-4548-a9c9-4a5414f2e0c5,3549ddf6-885d-4977-87f1-eeac43a0e818 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   {
      model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
      name: "Lego Tree",
      permissions: [
         {
            user: "collaboratorTeamspace1Model1JobA",
            permission: "collaborator"
         },
         {
            user: "commenterTeamspace1Model1JobA",
            permission: "commenter"
         },
         {
            user: "projectshared"
         },
         {
            user: "fed"
         },
         {
            user: "teamSpace1"
         },
         {
            user: "unassignedTeamspace1UserJobA"
         },
         {
            user: "viewerTeamspace1Model1JobA"
         },
         {
            user: "viewerTeamspace1Model1JobB"
         },
         {
            user: "commenterTeamspace1Model1JobB"
         },
         {
            user: "collaboratorTeamspace1Model1JobB"
         },
         {
            user: "adminTeamspace1JobA"
         },
         {
            user: "adminTeamspace1JobB"
         },
         {
            user: "weirdTeamspace"
         }
      ],
      subModels: []
   },
   {
      model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
      federate: {
      },
      name: "Full Logo ",
      permissions: [
         {
            user: "viewerTeamspace1Model1JobA",
            permission: "viewer"
         },
         {
            user: "commenterTeamspace1Model1JobA",
            permission: "viewer"
         },
         {
            user: "collaboratorTeamspace1Model1JobA",
            permission: "commenter"
         },
         {
            user: "commenterTeamspace1Model1JobB",
            permission: "commenter"
         },
         {
            user: "collaboratorTeamspace1Model1JobB",
            permission: "collaborator"
         },
         {
            user: "projectshared",
            permission: "collaborator"
         },
         {
            user: "fed"
         },
         {
            user: "teamSpace1"
         },
         {
            user: "unassignedTeamspace1UserJobA"
         },
         {
            user: "viewerTeamspace1Model1JobB"
         },
         {
            user: "adminTeamspace1JobA"
         },
         {
            user: "adminTeamspace1JobB"
         },
         {
            user: "weirdTeamspace"
         }
      ],
      subModels: [
         {
            database: "teamSpace1",
            model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
         },
         {
            database: "teamSpace1",
            model: "b1fceab8-b0e9-4e45-850b-b9888efd6521"
         }
      ]
   }
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/repoAssets.json",title:"Get unity assets",name:"getRepoAssets",group:"Model",description:"<p>Get the lastest model's version assets. If RepoBundles are available, they are returned, otherwise AssetBundles are returned.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/repoAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   models: [
      {
         _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
         assets: [
            "92fc213b-1bab-49a4-b10e-f4368a52d500"
         ],
         database: "teamSpace1",
         model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
         offset: [
            -688.095458984375,
            6410.9140625,
            683.460205078125
         ],
         jsonFiles: [
            "92fc213b-1bab-49a4-b10e-f4368a52d500"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.repobundle",title:"Get RepoBundle by Id",name:"getRepoBundle",group:"Model",description:"<p>Gets an actual Repo Bundle file containing a set of assets. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid.repobundle",isArray:!1,description:"<p>id of the repo bundle file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idMap.json",title:"Get tree path by revision",name:"getRevIdMap",group:"Model",description:"<p>Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to ID map for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idToMeshes.json",title:"Get ID Meshes by revision",name:"getRevIdToMeshes",group:"Model",description:"<p>Get ID Meshes by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/modelProperties.json",title:"Get model properties by revision",name:"getRevModelProperties",group:"Model",description:"<p>Get model properties by revision. See more details <a href='#api-Model-getModelProperties'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/fulltree.json",title:"Get tree by revision",name:"getRevModelTree",group:"Model",description:"<p>Get full tree by revision. See more details <a href='#api-Model-getModelTree'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get Tree for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/srcAssets.json",title:"Get revision's src assets",name:"getRevSrcAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model to get src assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/4d48e3de-1c87-4fdf-87bf-d92c224eb3fe/srcAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
  "models": [
    {
      "database": "Repo3DDemo",
      "model": "011382b0-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "153cf665-2c84-4ff9-a9e2-ba495af8e6dc",
        "07c67b6c-4b02-435f-8639-ea88403c36f7",
        "2967230f-67fa-45dc-9686-161e45c7c8a2"
      ],
      "offset": [
        9.999999999999787,
        0,
        -9.999999999999787
      ]
    },
    {
      "database": "Repo3DDemo",
      "model": "01168ff0-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "89d5580a-3224-4e50-bbab-89d855c320e0"
      ],
      "offset": [
        1610,
        740,
        -2410
      ]
    },
    {
      "database": "Repo3DDemo",
      "model": "01153060-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "c14dbbee-a8fd-4ed8-8641-9e24737f8238"
      ],
      "offset": [
        -688.095458984375,
        6410.9140625,
        683.460205078125
      ]
    }
  ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/unityAssets.json",title:"Get revision's unity assets",name:"getRevUnityAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model to get unity assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   models: [
      {
         _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
         assets: [
            "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500.unity3d"
         ],
         database: "teamSpace1",
         model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
         offset: [
            -688.095458984375,
            6410.9140625,
            683.460205078125
         ],
         jsonFiles: [
            "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/unityAssets.json",title:"Get revision's unity assets",name:"getRevUnityAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision. If RepoBundles are available, they are returned, otherwise AssetBundles are returned.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model to get unity assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   models: [
      {
         _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
         assets: [
            "92fc213b-1bab-49a4-b10e-f4368a52d500"
         ],
         database: "teamSpace1",
         model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
         offset: [
            -688.095458984375,
            6410.9140625,
            683.460205078125
         ],
         jsonFiles: [
            "92fc213b-1bab-49a4-b10e-f4368a52d500"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/assetsMeta",title:"Get revision's metadata about the assets generated",name:"getRevUnityAssets",group:"Model",description:"<p>Get the model's assets metadata of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/assetsMeta HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
    superMeshes: [
         {
              _id: "<uuid string>",
             nVertices: 123,
             nFaces: 123,
             nUVChannels: 123,
             boundingBox: [[1, 2, 3], [3,4, 5]]
         },
    ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/permissions",title:"Get model permissions",name:"getSingleModelPermissions",group:"Model",description:"<p>Gets the permissions of a model</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get Permission for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/permissions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   {
      user: "viewerTeamspace1Model1JobA",
      permission: "viewer"
   },
   {
      user: "commenterTeamspace1Model1JobA",
      permission: "viewer"
   },
   {
      user: "collaboratorTeamspace1Model1JobA",
      permission: "commenter"
   },
   {
      user: "commenterTeamspace1Model1JobB",
      permission: "commenter"
   },
   {
      user: "collaboratorTeamspace1Model1JobB",
      permission: "collaborator"
   },
   {
      user: "projectshared",
      permission: "collaborator"
   },
   {
      user: "fed"
   },
   {
      user: "teamSpace1"
   },
   {
      user: "unassignedTeamspace1UserJobA"
   },
   {
      user: "viewerTeamspace1Model1JobB"
   },
   {
      user: "adminTeamspace1JobA"
   },
   {
      user: "adminTeamspace1JobB"
   },
   {
      user: "weirdTeamspace"
   }
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/srcAssets.json",title:"Get Src assets for the master branch",name:"getSrcAssets",group:"Model",description:"<p>Get the lastest model's version src assets</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/master/head/srcAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
  "models": [
    {
      "database": "Repo3DDemo",
      "model": "011382b0-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "153cf665-2c84-4ff9-a9e2-ba495af8e6dc",
        "07c67b6c-4b02-435f-8639-ea88403c36f7",
        "2967230f-67fa-45dc-9686-161e45c7c8a2"
      ],
      "offset": [
        9.999999999999787,
        0,
        -9.999999999999787
      ]
    },
    {
      "database": "Repo3DDemo",
      "model": "01168ff0-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "89d5580a-3224-4e50-bbab-89d855c320e0"
      ],
      "offset": [
        1610,
        740,
        -2410
      ]
    },
    {
      "database": "Repo3DDemo",
      "model": "01153060-2286-11eb-93c1-296aba26cc11",
      "assets": [
        "c14dbbee-a8fd-4ed8-8641-9e24737f8238"
      ],
      "offset": [
        -688.095458984375,
        6410.9140625,
        683.460205078125
      ]
    }
  ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:revId/subModelRevisions",title:"Get submodel revisions by rev",name:"getSubModelRevisionsByRev",group:"Model",description:"<p>In a federation it returns the submodels revisions of a particular federation revision. See more details <a href='#api-Model-getSubRevisionModels'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get properties for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/subModelRevisions",title:"Get submodels revisions",name:"getSubRevisionModels",group:"Model",description:"<p>In a federation it returns the submodels revisions of the latest federation revision.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get properties for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/subModelRevisions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   "b1fceab8-b0e9-4e45-850b-b9888efd6521": {
      "name": "block",
      "revisions": [
         {
            "_id": "ddcc3213-af61-4d30-921f-e502d1c2199c",
            "author": "teamSpace1",
            "tag": "block",
            "timestamp": "2019-05-02T16:16:49.000Z",
            "name": "ddcc3213-af61-4d30-921f-e502d1c2199c",
            "branch": "master"
         }
      ]
   },
   "7cf61b4f-acdf-4295-b2d0-9b45f9f27418": {
      "name": "letters",
      "revisions": [
         {
            "_id": "a1bcfa72-ff37-41ac-95ab-66e450a37896",
            "author": "teamSpace1",
            "tag": "letters",
            "timestamp": "2019-05-02T16:16:32.000Z",
            "name": "a1bcfa72-ff37-41ac-95ab-66e450a37896",
            "branch": "master"
         }
      ]
   },
   "2710bd65-37d3-4e7f-b2e0-ffe743ce943f": {
      "name": "pipes",
      "revisions": [
         {
            "_id": "9ee1190b-cd25-4467-8d38-5af7c77cab5a",
            "author": "teamSpace1",
            "tag": "pipes",
            "timestamp": "2019-05-02T16:17:04.000Z",
            "name": "9ee1190b-cd25-4467-8d38-5af7c77cab5a",
            "branch": "master"
         }
      ]
   }
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.texture",title:"Get a Texture by Id",name:"getTexture",group:"Model",description:"<p>Gets a texture by id. The id may be provided from a number of sources but most likely will be given in a mappings material properties. The metadata of the texture is provided in the response headers.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid.texture",isArray:!1,description:"<p>id of the texture file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/tree_path.json",title:"Get tree paths",name:"getTreePath",group:"Model",description:"<p>Returns the full tree path for the model and if the model is a federation of it submodels. These tree paths have the path to get to every object in the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get tree path for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/tree_path.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   mainTree: {
      idToPath: {
         d68cf5e7-4d0f-4702-8a92-c81b72928c54: "d68cf5e7-4d0f-4702-8a92-c81b72928c54",
         261bf9df-64d7-4642-8bb2-0a79abd370ec: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__528c62e6-5cf8-4868-b5ff-733c128b4b4e__261bf9df-64d7-4642-8bb2-0a79abd370ec",
         528c62e6-5cf8-4868-b5ff-733c128b4b4e: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__528c62e6-5cf8-4868-b5ff-733c128b4b4e",
         7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__95744e20-4b4d-4fc1-8ba7-1f31ebf772b6__7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c",
         71634e9c-da2c-4ea7-bd04-44971d3fd8dc: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__a70dd58c-c09e-4ed4-ac7e-914dbd145302__71634e9c-da2c-4ea7-bd04-44971d3fd8dc",
         95744e20-4b4d-4fc1-8ba7-1f31ebf772b6: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__95744e20-4b4d-4fc1-8ba7-1f31ebf772b6",
         a70dd58c-c09e-4ed4-ac7e-914dbd145302: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__a70dd58c-c09e-4ed4-ac7e-914dbd145302"
      }
   },
   subModels: [
      {
         account: "teamSpace1",
         model: "b1fceab8-b0e9-4e45-850b-b9888efd6521",
         idToPath: {
            a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "33c36fee-622d-46a5-8be1-a1bd295aa7d1__a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e",
            33c36fee-622d-46a5-8be1-a1bd295aa7d1: "33c36fee-622d-46a5-8be1-a1bd295aa7d1"
         }
      },
      {
         account: "teamSpace1",
         model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
         idToPath: {
            8a1f9cad-18d8-47ce-9cbd-08ba53858ced: "ea37c2ed-39d4-4236-843c-332d52876c96__8a1f9cad-18d8-47ce-9cbd-08ba53858ced",
            ea37c2ed-39d4-4236-843c-332d52876c96: "ea37c2ed-39d4-4236-843c-332d52876c96"
         }
      },
      {
         account: "teamSpace1",
         model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
         idToPath: {
            8ef1c52e-8838-46dc-9825-efe46aa10041: "3abc5450-5db8-459b-80ea-cb9fca9ccedd__8ef1c52e-8838-46dc-9825-efe46aa10041",
            ecc25d63-87e0-4600-ae60-f38f766bc9e4: "3abc5450-5db8-459b-80ea-cb9fca9ccedd__ecc25d63-87e0-4600-ae60-f38f766bc9e4",
            3abc5450-5db8-459b-80ea-cb9fca9ccedd: "3abc5450-5db8-459b-80ea-cb9fca9ccedd"
         }
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/tree_path.json",title:"Get tree path by revision",name:"getTreePathByRevision",group:"Model",description:"<p>Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get tree path for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/unityAssets.json",title:"Get unity assets",name:"getUnityAssets",group:"Model",description:"<p>Get the lastest model's version unity assets</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   models: [
      {
         _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
         assets: [
            "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500.unity3d"
         ],
         database: "teamSpace1",
         model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
         offset: [
            -688.095458984375,
            6410.9140625,
            683.460205078125
         ],
         jsonFiles: [
            "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc"
         ]
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.unity3d",title:"Get Unity Bundle",name:"getUnityBundle",group:"Model",description:"<p>Gets an actual unity bundle file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid.unity3d",isArray:!1,description:"<p>id of the unity bundle</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/searchtree.json",title:"Search model tree",name:"searchModelTree",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"}]}},query:[{group:"Query",type:"String",optional:!1,field:"searchString",isArray:!1,description:"<p>The string to use for search tree objects</p>"}],examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/searchtree.json?searchString=fou HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   {
      "_id": "33fe7c13-17a4-43d6-af03-ceae6880322f",
      "name": "Fouliiferous Tree H64_2",
      "account": "teamSpace1",
      "model": "3549ddf6-885d-4977-87f1-eeac43a0e818"
   },
   {
      "_id": "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
      "name": "Fouliiferous Tree H64",
      "account": "teamSpace1",
      "model": "3549ddf6-885d-4977-87f1-eeac43a0e818"
   }
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/searchtree.json",title:"Search model tree by revision",name:"searchModelTreeRev",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param. See more details <a href='#api-Model-searchModelTree'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},query:[{group:"Query",type:"String",optional:!1,field:"searchString",isArray:!1,description:"<p>The string to use for search tree objects</p>"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/heliSpeed",title:"Update model heli speed",name:"updateHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to Update Heli speed.</p>"}]}},body:[{group:"Body",type:"Number",optional:!1,field:"heliSpeed",isArray:!1,description:"<p>The value of the speed that will replace the heli speed.</p>"}],examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1
{"heliSpeed":3}`,type:"put"}],success:{examples:[{title:"Success:",content:"{}",type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model",title:"Update Federated Model",name:"updateModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Federated Model ID to update</p>"}]}},body:[{group:"Body",type:"Object[]",optional:!1,field:"subModels",isArray:!0,description:"<p>Information on the models that are going to get federated</p>"},{group:"SubModel",type:"String",optional:!1,field:"database",isArray:!1,description:"<p>The teamspace name which the model belongs to</p>"},{group:"SubModel",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id to be federated</p>"}],examples:[{title:"Example usage:",content:`PUT /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5 HTTP/1.1
{
   subModels: [
      {
         database: "teamSpace1",
         model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
      },
      {
         database: "teamSpace1",
         model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
      }
   ]
}`,type:"put"}],success:{examples:[{title:"Success:",content:`{
   account: "teamSpace1",
   model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
   setting: {
      _id: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
      federate: {
      },
      desc: "",
      name: "Full Logo test",
      timestamp: "2019-08-22T10:42:05.242Z",
      type: "Federation",
      subModels: [
         {
            database: "teamSpace1",
            model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
         },
         {
            database: "teamSpace1",
            model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
         }
      ],
      surveyPoints: [
         {
            position: [
               0,
               0,
               0
            ],
            latLong: [
               0,
               0
            ]
         }
      ],
      properties: {
         unit: "mm"
      },
      permissions: [
         {
            user: "viewerTeamspace1Model1JobA",
            permission: "viewer"
         },
         {
            user: "commenterTeamspace1Model1JobA",
            permission: "commenter"
         },
         {
            user: "collaboratorTeamspace1Model1JobA",
            permission: "collaborator"
         },
         {
            user: "commenterTeamspace1Model1JobB",
            permission: "commenter"
         },
         {
            user: "collaboratorTeamspace1Model1JobB",
            permission: "collaborator"
         }
      ],
      status: "ok"
   }
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/model/permissions",title:"Update multiple model permissions",name:"updateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},body:[{group:"Body",type:"Permission[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of user permissions</p>"},{group:"Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}],examples:[{title:"Example usage:",content:`PATCH /acme/models/permissions HTTP/1.1
[
   {
      model: "00000000-0000-0000-0000-000000000000",
      permissions: [
         {
            user: "alice",
            permission: "collaborator"
         },
         {
            user: "bob",
            permission: "commenter"
         },
         {
            user: "mike",
            permission: ""
         }
      ]
   },
   {
      model: "11111111-1111-1111-1111-111111111111",
      permissions: [
         {
            user: "charlie",
            permission: "viewer"
         }
      ]
   },
   {
      model: "22222222-2222-2222-2222-222222222222",
      permissions: [
         {
            user: "dave",
            permission: "commenter"
         },
         {
            user: "eve",
            permission: ""
         }
      ]
   }
]`,type:"patch"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
   "status": "ok"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/:model/permissions",title:"Update model permissions",name:"updateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},body:[{group:"Body",type:"Permission[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of user permissions</p>"},{group:"Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}],examples:[{title:"Example usage (add user permission):",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
[
   {
      user: "alice",
      permission: "collaborator"
   }
]`,type:"patch"},{title:"Example usage (add multiple user permissions):",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
[
   {
      user: "bob",
      permission: "commenter"
   },
   {
      user: "mike",
      permission: "viewer"
   }
]`,type:"patch"},{title:"Example usage (remove user permission):",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
[
   {
      user: "mike",
      permission: ""
   }
]`,type:"patch"}],success:{examples:[{title:"Success:",content:`{
   status: "ok"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/",title:"Update Model Settings",name:"updateSettings",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to update Settings.</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of the model to be created</p>"},{group:"Body",type:"String",optional:!1,field:"unit",isArray:!1,description:"<p>The unit in which the model is specified</p>"},{group:"Body",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers</p>"},{group:"Body",type:"String",optional:!1,field:"type",isArray:!1,description:"<p>The type of the model</p>"},{group:"Body",type:"Number",optional:!1,field:"angleFromNorth",isArray:!1,description:"<p>GIS bearing angle</p>"},{group:"Body",type:"Number",optional:!1,field:"elevation",isArray:!1,description:"<p>GIS elevation</p>"},{group:"Body",type:"Object[]",optional:!1,field:"surveyPoints",isArray:!0,description:"<p>an array containing GIS surveypoints</p>"},{group:"SurveyPoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>an array representing a three dimensional coordinate</p>"},{group:"SurveyPoint",type:"Number[]",optional:!1,field:"latLong",isArray:!0,description:"<p>an array representing a two dimensional coordinate for latitude and logitude</p>"}],examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings HTTP/1.1
{
   name: "Medieval",
   unit: "cm",
   code: "1233",
   type: "Architectural",
   angleFromNorth: 3,
   elevation: 0,
   surveyPoints: [
      {
         position: [
            4,
            -7,
            -1
         ],
         latLong: [
            1,
            2,
         ]
      }
   ]
}`,type:"put"}],success:{examples:[{title:"Success:",content:`{
   code: "stage",
   unit: "cm"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"delete",url:"/notifications",title:"Delete All notification",name:"deleteAllNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"delete",url:"/notifications/:id",title:"Delete a notification",name:"deleteNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications/:id",title:"Get a notification",name:"getNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications",title:"Get all notifications",name:"getNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications/:id",title:"Patch a notification",name:"patchNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications",title:"Patch all the user notifications",name:"patchNotification",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/:teamspace/:model/permission-templates",title:"List all model templates",name:"listModelTemplates",group:"PermissionTemplate",description:"<p>Get a list of model permission templates. Intended for users that have <code>manage_model_permission</code> privileges.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/permission-templates HTTP/1.1",type:"get"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>",success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"Template1",
		"permissions":[
			"view_model"
		]
	},
	{
		"_id":"Template2",
		"permissions":[
			"view_model",
			"view_issue"
		]
	}
]`,type:"json"}]}},{type:"get",url:"/:teamspace/permission-templates",title:"Get all templates",name:"listTemplates",group:"PermissionTemplate",description:"<p>Get a list of teamspace permission templates.</p>",examples:[{title:"Example usage:",content:"GET /acme/permission-templates HTTP/1.1",type:"get"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"Template1",
		"permissions":[
			"view_model"
		]
	},
	{
		"_id":"Template2",
		"permissions":[
			"view_model",
			"view_issue"
		]
	}
]`,type:"json"}]}},{type:"get",url:"/plans",title:"List all Plans",name:"listPlans",group:"Plan",version:"0.0.0",filename:"plan.js",groupTitle:"Plan"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>The code that users need to join in order to get the viewpoint.</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>The code that users need to join in order to get the viewpoint.</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/stream",title:"Streams a viewpoint",name:"streamPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>The code that users need to join in order to get the viewpoint.</p>"}]}},body:[{group:"Body",type:"Object",optional:!1,field:"StreamingViewpoint",isArray:!1,description:"<p>The viewpoint</p>"}],version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"post",url:"/:teamspace/projects",title:"Create project",name:"createProject",group:"Project",description:"<p>It creates a project. The name of the project is required.</p>",permission:[{name:"canCreateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the project to be created</p>"}],examples:[{title:"Example usage:",content:`POST /teamSpace1/projects HTTP/1.1
{name: "Classic project"}`,type:"post"}],success:{examples:[{title:"Success",content:`{
   name: "Classic project",
   _id: "5d5bec491c15383184eb7521",
   permissions: [
      "create_model",
      "create_federation",
      "admin_project",
      "edit_project",
      "delete_project",
      "upload_files_all_models",
      "edit_federation_all_models",
      "create_issue_all_models",
      "comment_issue_all_models",
      "view_issue_all_models",
      "view_model_all_models",
      "download_model_all_models",
      "change_model_settings_all_models"
   ],
   models: []
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"delete",url:"/:teamspace/projects/:project",title:"Delete project",name:"deleteProject",group:"Project",description:"<p>Deletes a project, including all the models and federations inside of it.</p>",permission:[{name:"canDeleteProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Project to delete</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success:",content:`{
   _id: "5d5bec491c15383184eb7521",
   name: "Classic project renamed",
   permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      }
   ],
   models: []
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects/:project",title:"Get project",name:"listProject",group:"Project",description:"<p>Get the details of a project; name, user permissions, modelids.</p>",permission:[{name:"canViewProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Project name to be queried</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   _id: "5d5bec491c15383184eb7521",
   name: "Classic project renamed",
   permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      },
      {
         user: "viewerTeamspace1Model1JobA",
         permissions: []
      },
      {
         user: "commenterTeamspace1Model1JobB",
         permissions: []
      },
      {
         user: "collaboratorTeamspace1Model1JobA",
         permissions: []
      }
   ],
   models: []
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects",title:"List projects",name:"listProjects",group:"Project",description:"<p>It returns a list of projects with their permissions and model ids.</p>",permission:[{name:"canListProjects"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   {
      _id: "5ccb1490b4626d30c05c9401",
      name: "Medieval",
      permissions: [
         {
            user: "projectshared",
            permissions: []
         },
         {
            user: "fed",
            permissions: []
         },
         {
            user: "teamSpace1",
            permissions: []
         },
         {
            user: "weirdTeamspace",
            permissions: []
         }
      ],
      models: [
         "50926a1f-1525-44ac-b6a1-d016949a13bb"
      ]
   },
   {
      _id: "5ccb1702b4626d30c05c9830",
      name: "Bim Logo",
      permissions: [
         {
            user: "projectshared",
            permissions: []
         },
         {
            user: "commenterTeamspace1Model1JobA",
            permissions: []
         },
         {
            user: "commenterTeamspace1Model1JobB",
            permissions: []
         },
         {
            user: "collaboratorTeamspace1Model1JobA",
            permissions: []
         },
         {
            user: "collaboratorTeamspace1Model1JobB",
            permissions: []
         },
         {
            user: "adminTeamspace1JobA",
            permissions: []
         },
         {
            user: "adminTeamspace1JobB",
            permissions: []
         },
         {
            user: "weirdTeamspace",
            permissions: []
         }
      ],
      models: [
         "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
         "b1fceab8-b0e9-4e45-850b-b9888efd6521",
         "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
         "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5"
      ]
   },
   {
      _id: "5d5bec491c15383184eb7521",
      name: "Classic project renamed",
      permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      },
      {
         user: "viewerTeamspace1Model1JobA",
         permissions: []
      },
      {
         user: "commenterTeamspace1Model1JobB",
         permissions: []
      },
      {
         user: "collaboratorTeamspace1Model1JobA",
         permissions: []
      }
   ],
      models: []
   }
]`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"patch",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProject",group:"Project",description:"<p>Update project properties (name, permissions)</p>",permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Name of project</p>"}]}},body:[{group:"Body",type:"String",optional:!0,field:"name",isArray:!1,description:"<p>Project name</p>"},{group:"Body",type:"ProjectPermission[]",optional:!0,field:"permissions",isArray:!0,description:"<p>List of user permissions</p>"},{group:"ProjectPermission",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>Username of user</p>"},{group:"ProjectPermission",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of user privileges</p>"}],examples:[{title:"Example usage (update permissions):",content:`PATCH /acme/ProjectAnvil HTTP/1.1
{
   permissions: [
      {
         user: "alice",
         permissions: [
            "admin_project"
         ]
      },
      {
         user: "mike",
         permissions: []
      }
   ]
}`,type:"patch"},{title:"Example usage (rename project):",content:`PATCH /acme/ProjectAnvil HTTP/1.1
{
   name: "ProjectInstantTunnel"
}`,type:"patch"},{title:"Example usage:",content:`PATCH /acme/ProjectInstantTunnel HTTP/1.1
{
   name: "Project Trebuchet",
   permissions: [
      {
         "user": "projectshared",
         "permissions": [
            "admin_project"
         ]
      }
   ]
}`,type:"patch"}],success:{examples:[{title:"Success-Response:",content:`{
   status: "ok"
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"put",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProjectPut",group:"Project",description:"<p>It updates a project. The name can be changed and the permissions as well as the permissions of users</p>",deprecated:{content:"use now (#Project:updateProject)"},permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>The name of the project to update</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the project to be created</p>"},{group:"Body",type:"Object[]",optional:!1,field:"permissions",isArray:!0,description:"<p>The permissions for each user from the project</p>"},{group:"Permissions",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>The username of the user to have it permission changed</p>"},{group:"Permissions",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>An array of permissions for the user to be assigned</p>"}],examples:[{title:"Example usage update permissions:",content:`PUT /teamSpace1/Classic%20project HTTP/1.1
{
   name: "Classic project",
   permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      },
      {
         user: "viewerTeamspace1Model1JobA",
         permissions: []
      },
      {
         user: "commenterTeamspace1Model1JobB",
         permissions: []
      },
      {
         user: "collaboratorTeamspace1Model1JobA",
         permissions: []
      }
   ]
}`,type:"put"},{title:"Example usage rename project:",content:`PUT /teamSpace1/Classic%20project HTTP/1.1
{name: "Classic project renamed"}`,type:"put"}],success:{examples:[{title:"Success update permissions:",content:`{
   _id: "5d5bec491c15383184eb7521",
   name: "Classic project",
   permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      }
   ],
   models: []
}`,type:"json"},{title:"Success rename project:",content:`{
   _id: "5d5bec491c15383184eb7521",
   name: "Classic project renamed",
   permissions: [
      {
         user: "projectshared",
         permissions: [
            "admin_project"
         ]
      }
   ],
   models: []
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/:model/resources/:resourceId",title:"Get resource file",name:"getResource",group:"Resources",description:"<p>Is the URL for downloading the resource file identified by the resourceId.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"resourceId",isArray:!1,description:"<p>The Id of the resource</p>"}]}},version:"0.0.0",filename:"resources.js",groupTitle:"Resources"},{type:"post",url:"/:teamspace/:model/risks/:riskId/resources",title:"Attach resources to a risk",name:"attachResourceRisk",group:"Risks",description:"<p>Attaches file or URL resources to a risk. If the type of the resource is file it should be sent as multipart/form-data. Both types at the same time cannot be sent. So in order to attach files and URLs it should be done with two different requests.</p> <p>This method triggers a chat event</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}},body:[{group:"file resource (multipart/form-data)",type:"File[]",optional:!1,field:"files",isArray:!0,description:"<p>The array of files to be attached</p>"},{group:"file resource (multipart/form-data)",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"},{group:"URL resource",type:"String[]",optional:!1,field:"urls",isArray:!0,description:"<p>The array of URLs to be attached</p>"},{group:"URL resource",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the URLs; it should have the same length as the URL field</p>"}],success:{examples:[{title:"Success example result after two files has been uploaded",content:`
[
   {
      "_id":"7617f775-9eb7-4877-8ec3-98ea3457e519",
      "size":1422,
      "riskIds":[
         "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
      ],
      "name":"todo.txt",
      "user":"teamSpace1",
      "createdAt":1561973996461
   },
   {
      "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
      "size":2509356,
      "riskIds":[
         "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
      ],
      "name":"football.gif",
      "user":"teamSpace1",
      "createdAt":1561973996462
   }
]`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model/risks/:riskId/comments",title:"Add a comment",name:"commentRisk",group:"Risks",description:"<p>Create a comment in a risk.</p>",body:[{group:"Body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Risk ID</p>"},{group:"Body",type:"String",optional:!1,field:"rev_id",isArray:!1,description:"<p>Revision ID</p>"},{group:"Body",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"}],success:{fields:{"Success 200":[{group:"Success 200",type:"String",optional:!1,field:"guid",isArray:!1,description:"<p>Comment ID</p>"},{group:"Success 200",type:"Number",optional:!1,field:"created",isArray:!1,description:"<p>Comment creation timestamp</p>"},{group:"Success 200",type:"String",optional:!1,field:"owner",isArray:!1,description:"<p>Comment owner</p>"},{group:"Success 200",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"}],Viewpoint:[{group:"Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of the camera</p>"},{group:"Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of the camera</p>"},{group:"Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position of the camera</p>"},{group:"Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Look at point of the camera</p>"},{group:"Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>View direction of the camera</p>"},{group:"Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Near clipping plane</p>"},{group:"Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Far clipping plane</p>"},{group:"Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Field of view in radians</p>"},{group:"Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the viewport</p>"},{group:"Viewpoint",type:"Object[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Array of clipping planes</p>"},{group:"Viewpoint",type:"Object[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>Array of override groups with colors and objects</p>"},{group:"Viewpoint",type:"Object[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>Array of transformation groups</p>"},{group:"Viewpoint",type:"Object",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>Highlighted group with objects and color</p>"},{group:"Viewpoint",type:"Object",optional:!0,field:"hidden_group",isArray:!1,description:"<p>Hidden group with objects</p>"},{group:"Viewpoint",type:"Boolean",optional:!0,field:"hideIfc",isArray:!1,description:"<p>Flag to hide IFC elements</p>"},{group:"Viewpoint",type:"String",optional:!0,field:"screenshot",isArray:!1,description:"<p>URL to screenshot image</p>"},{group:"Viewpoint",type:"String",optional:!0,field:"screenshotSmall",isArray:!1,description:"<p>URL to small screenshot image</p>"},{group:"Viewpoint",type:"String",optional:!0,field:"guid",isArray:!1,description:"<p>Unique identifier for the viewpoint</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"guid":"00000000-0000-0000-0000-000000000007",
	"created":1567172228143,
	"owner":"alice",
	"comment":"Comment 1",
	"viewpoint":{
		"right":[0.5,-0.1,0.5],
		"up":[0.3,0.9,-0.3],
		"position":[-50000.0,100000.0,150000.0],
		"look_at":[35000.0,50000.0,9000.0],
		"view_dir":[0.5,-0.5,-1.0],
		"near":500.0,
		"far":300000,
		"fov":1.05,
		"aspect_ratio":1.5,
		"clippingPlanes":[],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshot.png",
		"guid":"00000000-0000-0000-0000-000000000006",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshotSmall.png"
	}
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"comment":"Comment 1",
	"viewpoint":{
		"right":[0.5,-0.1,0.5],
		"up":[0.3,0.9,-0.3],
		"position":[-50000.0,100000.0,150000.0],
		"look_at":[35000.0,50000.0,9000.0],
		"view_dir":[0.5,-0.5,-1.0],
		"near":500.0,
		"far":300000,
		"fov":1.05,
		"aspect_ratio":1.5,
		"clippingPlanes":[],
		"highlighted_group_id":"",
		"screenshot":<base64 image>
	}
}`,type:"post"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"delete",url:"/:teamspace/:model/risks/:riskId/comments",title:"Delete a comment",name:"deleteComment",group:"Risks",description:"<p>Delete a risk comment.</p>",body:[{group:"Body",type:"String",optional:!1,field:"guid",isArray:!1,description:"<p>Comment ID</p>"}],examples:[{title:"Example usage:",content:`DELETE /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"delete"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/risks/:riskId/resources",title:"Detach a resource from a risk",name:"detachResourceRisk",group:"Risks",description:"<p>Detachs a resource from a risk. If the risk is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>The resource id to be detached</p>"}],success:{examples:[{title:"{",content:`
{
   "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
   "size":2509356,
   "riskIds":[
   ],
   "name":"football.gif",
   "user":"teamSpace1",
   "createdAt":1561973996462
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/mitigations/criteria",title:"Get mitigation criteria",name:"findMitigationCriteria",group:"Risks",description:"<p>Returns all mitigations criteria from mitigation suggestions.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/mitigations/criteria HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"associated_activity":[
		"All construction",
		"Site tests",
		"Logistics"
	],
	"category":[
		"safety_electricity"
	],
	"element":[
		"Doors",
		"Floors",
		"Pipes",
		"Vents",
		"Walls"
	],
	"location_desc":[
		"Tower 1 - Level 0",
		"Tower 1 - Level 1",
		"Tower 1 - Level 2",
		"Tower 2 - Level 0",
		"Tower 2 - Level 1",
		"Tower 3 - Level 0",
		"Tower 3 - Level 1",
		"Tower 3 - Level 2"
	],
	"mitigation_stage":[
		"Preliminary Design",
		"Detail Design",
		"Preconstruction",
		"Site work and Change Control"
	],
	"mitigation_type":[
		"Eliminate",
		"Reduce",
		"Control",
		"Inform"
	],
	"risk_factor":[
		"Factor 2",
		"Factor 5",
		"Factor 8"
	],
	"scope":[
		"General concrete",
		"In situ concrete"
	]
}`,type:"json"}]},version:"0.0.0",filename:"mitigation.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/mitigations",title:"Find mitigation suggestions",name:"findMitigationSuggestions",group:"Risks",description:"<p>Returns a list of suggestions for risk mitigation based on given criteria.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"associated_activity",isArray:!1,description:"<p>Risk associated activity</p>"},{group:"Request body",type:"String",optional:!0,field:"category",isArray:!1,description:"<p>Risk category</p>"},{group:"Request body",type:"String",optional:!0,field:"element",isArray:!1,description:"<p>Risk element type</p>"},{group:"Request body",type:"String",optional:!0,field:"location_desc",isArray:!1,description:"<p>Risk location description</p>"},{group:"Request body",type:"String",optional:!0,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!0,field:"scope",isArray:!1,description:"<p>Risk construction scope</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/mitigations HTTP/1.1
{
	"associated_activity":"",
	"category":"safety_fall",
	"element":"Doors",
	"location_desc":"Tower 3 - Level 2",
	"risk_factor":"Factor 9",
	"scope":"Tower 3"
}`,type:"post"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
[
	{
		"mitigation_desc":"Replace all openings required in floor slabs with precast service openings.",
		"mitigation_detail":"Replace openings larger than a standard anvil required in floor slabs with precast service openings from A/W 2020 catalogue.",
		"mitigation_stage":"Preliminary Design",
		"mitigation_type":"Eliminate"
	},
	{
		"mitigation_desc":"Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.",
		"mitigation_detail":"Safe walking surface joint covers for all joins and gaps. Covers should be strong enough to support any loads likely to be placed on it and fixed in position with bolts to prevent accidental dislodgement.",
		"mitigation_stage":"Detail Design",
		"mitigation_type":"Reduce"
	},
	{
		"mitigation_desc":"Provide warning markings and/or colour change.",
		"mitigation_detail":"Provide warning markings from approved list of markings and/or colour change using chart from Document XYZ.",
		"mitigation_stage":"Preconstruction",
		"mitigation_type":"Control"
	}
]`,type:"json"}]},version:"0.0.0",filename:"mitigation.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/:model/risks/:riskId",title:"Get a risk",name:"findRiskById",group:"Risks",description:"<p>Retrieve a risk. The response includes all comments and screenshot URLs.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object",optional:!1,field:"risk",isArray:!1,description:"<p>The Issue matching the Issue ID</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"account":"acme",
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"Column casting",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"created":1567156228976,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"model":"00000000-0000-0000-0000-000000000000",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"owner":"alice",
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"guid":"00000000-0000-0000-0000-000000000004",
		"hideIfc":true,
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7]
	}
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/screenshot.png",title:"Get risk screenshot",name:"getScreenshot",group:"Risks",description:"<p>Retrieve a risk screenshot image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Screenshot image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshot.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/screenshotSmall.png",title:"Get low-res screenshot",name:"getScreenshotSmall",group:"Risks",description:"<p>Retrieve a low-resolution risk screenshot image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Small screenshot image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshotSmall.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/thumbnail.png",title:"Get risk thumbnail",name:"getThumbnail",group:"Risks",description:"<p>Retrieve a risk thumbnail image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Thumbnail image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks",title:"List all risks",name:"listRisks",group:"Risks",description:"<p>Retrieve all model risks.</p>",query:[{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue ids to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"categories",isArray:!0,description:"<p>Array of categories to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"mitigationStatus",isArray:!0,description:"<p>Array of mitigation status to filter for</p>"},{group:"Query",type:"Number[]",optional:!0,field:"likelihoods",isArray:!0,description:"<p>Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"consequences",isArray:!0,description:"<p>Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLikelihoods",isArray:!0,description:"<p>Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"levelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualConsequences",isArray:!0,description:"<p>Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLevelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"}],success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000002",
		"account":"acme",
		"assigned_roles":[
			"Job1"
		],
		"associated_activity":"Column casting",
		"category":"safety_fall",
		"comments":[],
		"consequence":0,
		"created":1567156228976,
		"creator_role":"Job4",
		"desc":"Risk description that describes the risk",
		"element":"Doors",
		"level_of_risk":0,
		"likelihood":0,
		"location_desc":"Tower 3 - Level 2",
		"mitigation_desc":"Erect temporary barrier",
		"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
		"mitigation_stage":"Construction stage 5",
		"mitigation_status":"proposed",
		"mitigation_type":"Eliminate",
		"model":"00000000-0000-0000-0000-000000000000",
		"name":"Risk 1",
		"overall_level_of_risk":0,
		"owner":"alice",
		"position":[55000.0,80000.0,-10000.0],
		"residual_consequence":-1,
		"residual_level_of_risk":-1,
		"residual_likelihood":-1,
		"residual_risk":"",
		"rev_id":"00000000-0000-0000-0000-000000000001",
		"risk_factor":"Factor 9",
		"safetibase_id":"",
		"scope":"Tower 3",
		"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
		"viewpoint":{
			"aspect_ratio":1.4,
			"clippingPlanes":[],
			"far":300000,
			"fov":1.05,
			"guid":"00000000-0000-0000-0000-000000000004",
			"hideIfc":true,
			"look_at":[35000.0,40000.0,8000.0],
			"near":600.0,
			"position":[-70000.0,120000.0,150000.0],
			"right":[0.8,-0.3,0.6],
			"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
			"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
			"up":[0.3,0.9,-0.3],
			"view_dir":[0.5,-0.4,-0.7]
		}
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/risks",title:"List all risks of a revision",name:"listRisksByRevision",group:"Risks",description:"<p>Retrieve all model risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},query:[{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue ids to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"categories",isArray:!0,description:"<p>Array of categories to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"mitigationStatus",isArray:!0,description:"<p>Array of mitigation status to filter for</p>"},{group:"Query",type:"Number[]",optional:!0,field:"likelihoods",isArray:!0,description:"<p>Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"consequences",isArray:!0,description:"<p>Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLikelihoods",isArray:!0,description:"<p>Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"levelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLikelihoods",isArray:!0,description:"<p>Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualConsequences",isArray:!0,description:"<p>Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLevelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"}],success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000002",
		"account":"acme",
		"assigned_roles":[
			"Job1"
		],
		"associated_activity":"Column casting",
		"category":"safety_fall",
		"comments":[],
		"consequence":0,
		"created":1567156228976,
		"creator_role":"Job4",
		"desc":"Risk description that describes the risk",
		"element":"Doors",
		"level_of_risk":0,
		"likelihood":0,
		"location_desc":"Tower 3 - Level 2",
		"mitigation_desc":"Erect temporary barrier",
		"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
		"mitigation_stage":"Construction stage 5",
		"mitigation_status":"proposed",
		"mitigation_type":"Eliminate",
		"model":"00000000-0000-0000-0000-000000000000",
		"name":"Risk 1",
		"overall_level_of_risk":0,
		"owner":"alice",
		"position":[55000.0,80000.0,-10000.0],
		"residual_consequence":-1,
		"residual_level_of_risk":-1,
		"residual_likelihood":-1,
		"residual_risk":"",
		"rev_id":"00000000-0000-0000-0000-000000000001",
		"risk_factor":"Factor 9",
		"safetibase_id":"",
		"scope":"Tower 3",
		"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
		"viewpoint":{
			"aspect_ratio":1.4,
			"clippingPlanes":[],
			"far":300000,
			"fov":1.05,
			"guid":"00000000-0000-0000-0000-000000000004",
			"hideIfc":true,
			"look_at":[35000.0,40000.0,8000.0],
			"near":600.0,
			"position":[-70000.0,120000.0,150000.0],
			"right":[0.8,-0.3,0.6],
			"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
			"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
			"up":[0.3,0.9,-0.3],
			"view_dir":[0.5,-0.4,-0.7]
		}
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/:model/revision/:revId/risks.html",title:"Render risks for a revision as HTML",name:"renderRisksByRevisionHTML",group:"Risks",description:"<p>Retrieve HTML page of all risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},query:[{group:"Query",type:"String",optional:!1,field:"ids",isArray:!1,description:"<p>Risk IDs to show</p>"}],success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<html page>`,type:"html"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/:model/risks.html",title:"Render risks as HTML",name:"renderRisksHTML",group:"Risks",description:"<p>Retrieve HTML page of all risks.</p>",query:[{group:"Query",type:"String",optional:!1,field:"ids",isArray:!1,description:"<p>Risk IDs to show</p>"}],success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<html page>`,type:"html"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/risks",title:"Create a risk",name:"storeRisk",group:"Risks",description:"<p>Create a model risk.</p>",examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
{
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"hideIfc":true,
		"highlighted_group_id":"",
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7],
		"screenshot":<base64 image>
	}
}`,type:"post"},{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
{
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"hideIfc":true,
		"highlighted_group_id":"",
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7],
		"screenshot":<base64 image>
	}
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"account":"acme",
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"created":1567156228976,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"model":"00000000-0000-0000-0000-000000000000",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"owner":"alice",
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"guid":"00000000-0000-0000-0000-000000000004",
		"hideIfc":true,
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7]
	}
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Body",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>Risk pin coordinates</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"}]},{type:"post",url:"/:teamspace/:model/revision/:revId/risks",title:"Create a risk for a revision",name:"storeRiskForRevision",group:"Risks",description:"<p>Create a model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
{
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"hideIfc":true,
		"highlighted_group_id":"",
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7],
		"screenshot":<base64 image>
	}
}`,type:"post"},{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
{
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"hideIfc":true,
		"highlighted_group_id":"",
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7],
		"screenshot":<base64 image>
	}
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"account":"acme",
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"created":1567156228976,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"model":"00000000-0000-0000-0000-000000000000",
	"name":"Risk 1",
	"overall_level_of_risk":0,
	"owner":"alice",
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":-1,
	"residual_risk":"",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"guid":"00000000-0000-0000-0000-000000000004",
		"hideIfc":true,
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7]
	}
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Body",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>Risk pin coordinates</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"}]},{type:"patch",url:"/:teamspace/:model/risks/:riskId",title:"Update risk",name:"updateRisk",group:"Risks",description:"<p>Update model risk.</p>",examples:[{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
{
	"residual_likelihood":1
}`,type:"patch"},{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
{
	"residual_likelihood":1
}`,type:"patch"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"account":"acme",
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"created":1567156228976,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"model":"00000000-0000-0000-0000-000000000000",
	"name":"Risk 1",
	"owner":"alice",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":1,
	"residual_risk":"",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"guid":"00000000-0000-0000-0000-000000000004",
		"hideIfc":true,
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7]
	}
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Body",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>Risk pin coordinates</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"}]},{type:"patch",url:"/:teamspace/:model/revision/:revId/risks/:riskId",title:"Update risk for a revision",name:"updateRiskForRevision",group:"Risks",description:"<p>Update model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"right",isArray:!0,description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"up",isArray:!0,description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"look_at",isArray:!0,description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[]",optional:!1,field:"view_dir",isArray:!0,description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
{
	"residual_likelihood":1
}`,type:"patch"},{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
{
	"residual_likelihood":1
}`,type:"patch"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002",
	"account":"acme",
	"assigned_roles":[
		"Job1"
	],
	"associated_activity":"",
	"category":"safety_fall",
	"comments":[],
	"consequence":0,
	"created":1567156228976,
	"creator_role":"Job4",
	"desc":"Risk description that describes the risk",
	"element":"Doors",
	"level_of_risk":0,
	"likelihood":0,
	"location_desc":"Tower 3 - Level 2",
	"mitigation_desc":"Erect temporary barrier",
	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
	"mitigation_stage":"Construction stage 5",
	"mitigation_status":"proposed",
	"mitigation_type":"Eliminate",
	"model":"00000000-0000-0000-0000-000000000000",
	"name":"Risk 1",
	"owner":"alice",
	"overall_level_of_risk":0,
	"position":[55000.0,80000.0,-10000.0],
	"residual_consequence":-1,
	"residual_level_of_risk":-1,
	"residual_likelihood":1,
	"residual_risk":"",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"risk_factor":"Factor 9",
	"safetibase_id":"",
	"scope":"Tower 3",
	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
	"viewpoint":{
		"aspect_ratio":1.4,
		"clippingPlanes":[],
		"far":300000,
		"fov":1.05,
		"guid":"00000000-0000-0000-0000-000000000004",
		"hideIfc":true,
		"look_at":[35000.0,40000.0,8000.0],
		"near":600.0,
		"position":[-70000.0,120000.0,150000.0],
		"right":[0.8,-0.3,0.6],
		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
		"up":[0.3,0.9,-0.3],
		"view_dir":[0.5,-0.4,-0.7]
	}
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Body",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>Risk pin coordinates</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"}]},{type:"post",url:"/:teamspace/:model/sequences",title:"Create custom sequence",name:"createSequence",group:"Sequences",description:"<p>Create custom sequence for model.</p>",examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences HTTP/1.1
{
	"name":"Custom Sequence 1",
	"frames":[
		{
			"dateTime":1244246400000,
			"viewpoint":{
				"override_groups":[
					{
						"color":[
							0,
							255,
							0
						],
						"rules":[
							{
								"field":"IFC GUID",
								"operator":"IS",
								"values":[
									"0h79Q0rcfC1gOPK50yoFCv",
									"0K5o7g755EZw2RjNI7HcYK",
									"0yuGDtpaPCSBT7QB7wvN5I",
									"2HBVtaIWv07ud53r01WB6q"
								]
							}
						],
						"account":"acme",
						"model":"00000000-0000-0000-0000-000000000000"
					}
				],
				"hidden_group":{
					"rules":[
						{
							"field":"IFC GUID",
							"operator":"IS",
							"values":[
								"2S2omCydz5b9jSgrcLLblk",
								"0_U7q0Dzj6DfPp4VzMmTUt",
								"0iMv$JxRL67v6DoyA3RRwz",
								"1W4yiIKW92qAUdezi70DTY",
								"00ojKm$5f7luRCAjta0hsu",
								"0d2LnELub06glJ9mZh2up$",
								"37gui3POjDQgmIadjhr$ek",
								"3XAjSwznb6PfZG9t_wAFXi"
							]
						}
					],
					"account":"acme",
					"model":"00000000-0000-0000-0000-000000000000"
				}
			}
		},
		{
			"dateTime":1244246500000,
			"viewpoint":{
				"up":[0,1,0],
				"position":[38,38 ,125.080119148101],
				"look_at":[0,0,-163.080119148101],
				"view_dir":[0,0,-1],
				"right":[1,0,0],
				"fov":2.11248306530104,
				"aspect_ratio":0.875018933732738,
				"far":276.756120771945,
				"near":76.4241101223321
			}
		},
		{
			"dateTime":1244246700000,
			"viewpoint":{
				"override_groups":[
					{
						"color":[
							0,
							255,
							0
						],
						"rules":[
							{
								"field":"IFC GUID",
								"operator":"IS",
								"values":[
									"00ojKm$5f7luRCAjta0hsu"
								]
							}
						],
						"account":"acme",
						"model":"00000000-0000-0000-0000-000000000000"
					}
				]
			}
		},
		{
			"dateTime":1244419200000,
			"viewId":"00000000-0000-0001-0001-000000000001"
		},
		{
			"dateTime":1244458200000,
			"viewId":"00000000-0000-0001-0001-000000000002"
		},
		{
			"dateTime":1244484300000,
			"viewpoint": {}
		}
	]
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Create one or more activities",name:"createSequenceActivities",group:"Sequences",description:"<p>Creates a sequence activity tree.</p>",body:[{group:"Body",type:"Activity[]",optional:!1,field:"activity",isArray:!0,description:"<p>An array of the activity tree that will be created</p>"},{group:"Body",type:"Boolean",optional:!0,field:"overwrite",isArray:!1,description:"<p>This flag indicates whether the request will replace the currently stored activities or just added at the end of the currently stored activities array. If not present it will be considered as false.</p>",checked:!1}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Activity":[{group:"Type: Activity",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"startDate",isArray:!1,description:"<p>The starting timestamp date of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"endDate",isArray:!1,description:"<p>The ending timestamp date of the activity</p>"},{group:"Type: Activity",type:"Object",optional:!0,field:"resources",isArray:!1,description:"<p>The resources asoociated with the activity</p>"},{group:"Type: Activity",type:"KeyValue[]",optional:!0,field:"data",isArray:!0,description:"<p>An array of key value pairs with metadata for the activity</p>"},{group:"Type: Activity",type:"Activity[]",optional:!0,field:"subActivities",isArray:!0,description:"<p>An array of activities that will be children of the activity</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",isArray:!1,description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",isArray:!1,description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
{
  "overwrite": true,
  "activities": [
    {
      "name": "Clinic Construction",
      "startDate": 1603184400000,
      "endDate": 1613062800000,
      "data": [
        {
          "key": "Color",
          "value": "green"
        }
      ],
      "subActivities": [
        {
          "name": "Site Work & Logistics",
          "startDate": 1603184400000,
          "endDate": 1613062800000,
          "data": [
            {
              "key": "Height",
              "value": 12
            }
          ],
          "subActivities": [
            {
              "name": "Site Office Installation",
              "startDate": 1603184400000,
              "endDate": 1603213200000,
              "data": [
                {
                  "key": "Size",
                  "value": "Big"
                }
              ]
            },
            {
              "name": "Excavation",
              "startDate": 1603270800000,
              "endDate": 1603299600000
            }
          ]
        }
      ]
    }
  ]
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceId/legend",title:"Delete legend",name:"deleteLegend",group:"Sequences",description:"<p>Delete the legend associated to this sequence</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceId",title:"Delete sequence",name:"deleteSequence",group:"Sequences",description:"<p>Delete the custom sequence by ID</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"deleteSequenceActivity",group:"Sequences",description:"<p>Delete a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",isArray:!1,description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"editSequenceActivity",group:"Sequences",description:"<p>Edits a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",isArray:!1,description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",isArray:!1,description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",isArray:!1,description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1
{
   "name":"Renamed activity"
}`,type:"patch"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",body:[{group:"Body",type:"String",optional:!0,field:"name",isArray:!1,description:"<p>The name of the activity</p>"},{group:"Body",type:"Number",optional:!0,field:"startDate",isArray:!1,description:"<p>The starting timestamp date of the activity</p>"},{group:"Body",type:"Number",optional:!0,field:"endDate",isArray:!1,description:"<p>The ending timestamp date of the activity</p>"},{group:"Body",type:"String",optional:!0,field:"parent",isArray:!1,description:"<p>The parent id if it has one. This parent must exist previously</p>"},{group:"Body",type:"Object",optional:!0,field:"resources",isArray:!1,description:"<p>The resources asoociated with the activity</p>"},{group:"Body",type:"KeyValue[]",optional:!0,field:"data",isArray:!0,description:"<p>An array of key value pairs with metadata for the activity</p>"}]},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/legend",title:"get the legend",name:"getLegend",group:"Sequences",description:"<p>Get the legend for this sequence</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	  "Building works": "#aabbcc"
	  "Temporary works": "#ffffff66"
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId",title:"Get sequence",name:"getSequence",group:"Sequences",description:"<p>Get sequence by ID</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"teamspace":"alice",
	"model":"00000000-0000-0000-0000-000000000000",
	"rev_id":"00000000-0000-0000-0000-000000000001",
	"name":"Sequence 1",
	"frames":[
		{
			"dateTime":1244246400000,
			"state":"00000000-0000-0000-0001-000000000002"
		},
		{
			"dateTime":1244419200000,
			"state":"00000000-0000-0000-0002-000000000002"
		}
	],
	"_id":"00000000-0000-0000-0000-000000000002"
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Get all activities",name:"getSequenceActivities",group:"Sequences",description:"<p>Get all sequence activities.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:`GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
*`,type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"activities":[
		{
			"id":"00000000-0000-0001-0001-000000000001",
			"name":"Construction",
			"startDate":1244246400000,
			"endDate":1244246450000,
			"subActivities":[
				{
					"id":"00000000-0001-0001-0001-000000000001",
					"name":"Prepare site",
					"startDate":1244246400000,
					"endDate":1244246430000,
					"subActivities":[
						{
							"id":"00000001-0001-0001-0001-000000000001",
							"name":"Erect site hoarding",
							"startDate":1244246400000,
							"endDate":1244246410000
						},
						{
							"id":"00000002-0001-0001-0001-000000000001",
							"name":"Clear existing structures",
							"startDate":1244246410000,
							"endDate":1244246420000
						},
						{
							"id":"00000003-0001-0001-0001-000000000001",
							"name":"Smooth work surfaces",
							"startDate":1244246420000,
							"endDate":1244246430000
						}
					]
				},
				{
					"id":"00000001-0002-0001-0001-000000000001",
					"name":"Construct tunnel",
					"startDate":1244246430000,
					"endDate":1244246450000,
					"subActivities":[
						{
							"id":"00000001-0002-0001-0001-000000000001",
							"name":"Deploy instant tunnel",
							"startDate":1244246430000,
							"endDate":1244246440000
						},
						{
							"id":"00000002-0002-0001-0001-000000000001",
							"name":"Add road markings",
							"startDate":1244246440000,
							"endDate":1244246450000
						}
					]
				}
			]
		}
	]
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Get activity",name:"getSequenceActivityDetail",group:"Sequences",description:"<p>Get sequence activity details.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",isArray:!1,description:"<p>Activity ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/00000000-0000-0002-0001-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
 "id":"00000000-0000-0002-0001-000000000001",
 "name":"Construct tunnel",
 "sequenceId": "00000000-0000-0000-0001-000000000001",
 "parent": "00000130-2300-0002-0001-000567000001"
 "startDate": 1610000000000,
 "endDate": 1615483938124,
 "data":[
   {"key":"Name","value":"Construction"},
   {"key":"Status","value":"Planned"},
   {"key":"Is Compound Task","value":"Yes"},
   {"key":"Code","value":"ST00020"},
   {"key":"Planned Start","value":"15 Apr 2020 10:00:00"},
   {"key":"Type","value":"Work"},
   {"key":"Constraint","value":"No Constraint"},
   {"key":"Planned Finish","value":"11 Sep 2020 18:00:00"},
   {"key":"Percentage Complete","value":0},
   {"key":"Physical Volume Unity","value":"Unknown"},
   {"key":"Estimated Rate","value":0},
   {"key":"Planned Physical Volume","value":6.6},
   {"key":"Actual Physical Volume","value":0.9},
   {"key":"Remaining Physical Volume","value":5.7},
   {"key":"Budgeted Cost","value":30},
   {"key":"Actual Cost","value":9999.99}
 ]
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/state/:stateId",title:"Get state",name:"getSequenceState",group:"Sequences",description:"<p>Get state of model in sequence.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"stateId",isArray:!1,description:"<p>State unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/state/00000000-0000-0000-0001-000000000002 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"transparency":[
		{
			"value":1,
			"shared_ids":[
				11111111-1111-1111-1111-111111111111,
				22222222-2222-2222-2222-222222222222,
				33333333-3333-3333-3333-333333333333
			]
		}
	],
	"color":[
		{
			"value":[
				0,
				1,
				0
			],
			"shared_ids":[
				44444444-4444-4444-4444-444444444444,
				55555555-5555-5555-5555-555555555555,
				66666666-6666-6666-6666-666666666666
			]
		}
	],
	"transform":[
		{
			"value":[
				1, 0, 0, -0.0036411285400390625,
				0, 1, 0, 0.0012891292572021484,
				0, 0, 1, 0,
				0, 0, 0, 1
			],
			"shared_ids":[
				77777777-7777-7777-7777-777777777777,
				88888888-8888-8888-8888-888888888888,
				99999999-9999-9999-9999-999999999999
			]
		},
		{
			"value":[
				1, 0, 0, -0.0036411285400390625,
				0, 1, 0, 0.0012891292572021484,
				0, 0, 1, 0,
				0, 0, 0, 1
			],
			"shared_ids":[
				66666666-6666-6666-6666-666666666666
			]
		},
		{
			"value":[
				1, 0, 0, -0.0036411285400390625,
				0, 1, 0, 0.0012891292572021484,
				0, 0, 1, 0,
				0, 0, 0, 1
			],
			"shared_ids":[
				44444444-4444-4444-4444-444444444444,
				aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,
				bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,
				cccccccc-cccc-cccc-cccc-cccccccccccc
			]
		}
	]`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences",title:"List all sequences",name:"listSequences",group:"Sequences",description:"<p>List all sequences associated with the model.</p>",parameter:{fields:{Query:[{group:"Query",type:"String",optional:!0,field:"rev_id",isArray:!1,description:"<p>Revision unique ID</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences HTTP/1.1",type:"get"},{title:"Example usage (with revision)",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences?rev_id=00000000-0000-0000-0000-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"teamspace":"alice",
		"model":"00000000-0000-0000-0000-000000000000",
		"rev_id":"00000000-0000-0000-0000-000000000001",
		"name":"Sequence 1",
		"frames":[
			{
				"dateTime":1244246400000,
				"state":"00000000-0000-0000-0001-000000000002"
			},
			{
				"dateTime":1244419200000,
				"state":"00000000-0000-0000-0002-000000000002"
			}
		],
		"_id":"00000000-0000-0000-0000-000000000002"
	}
]`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceId/legend",title:"Add/Update legend",name:"updateLegend",group:"Sequences",description:"<p>Update/add a legend to this sequence</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},body:[{group:"Body",type:"Object",optional:!1,field:"legend",isArray:!1,description:"<p>Legend object with colors</p>"}],examples:[{title:"Example usage:",content:`PUT /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
{
	  "Building works": "#aabbcc",
	  "Temporary works": "#ffffff66"
}`,type:"put"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"patch",url:"/:teamspace/:model/sequences/:sequenceId",title:"Update a sequence",name:"updateSequence",group:"Sequences",description:"<p>Update a sequence (note: currently only name chance is supported</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"patch"},{title:"Example usage:",content:`{
	  "name": "Building works"
}`,type:"patch"}],body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The new name of the sequence</p>"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/subscriptions",title:"List subscriptions",name:"listSubscriptions",group:"Subscription",description:"<p>List all subscriptions for current user if applicable.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/subscriptions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
   basic: {
      collaborators: 0,
      data: 200
   },
   discretionary: {
      collaborators: "unlimited",
      data: 10240,
      expiryDate: null
   }
}`,type:"json"}]},error:{fields:{401:[{group:"401",optional:!1,field:"NOT_AUTHORIZED",isArray:!1,description:"<p>Not Authorized</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 401 Not Authorized
{
	"message":"Not Authorized",
	"status":401,"code":
	"NOT_AUTHORIZED",
	"value":9,
	"place":"GET /teamSpace1/subscriptions"
}`,type:"json"}]},version:"0.0.0",filename:"subscriptions.js",groupTitle:"Subscription"},{type:"post",url:"/:teamspace/members",title:"Add a team member",name:"addTeamMember",group:"Teamspace",description:"<p>Adds a user to a teamspace and assign it a job.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"job",isArray:!1,description:"<p>The job that the users going to have assigned</p>"},{group:"Body",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>The username of the user to become a member</p>"},{group:"Body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>The permisions to be assigned to the member it can be an empty array or have a &quot;teamspace_admin&quot; value.</p>"}],examples:[{title:"Example usage:",content:`POST /teamSpace1/members HTTP/1.1
{
   job: "jobA",
   user: "projectshared",
   permissions: []
}`,type:"post"}],success:{examples:[{title:"Success",content:`{
   job: "jobA",
   permissions: [],
   user: "projectshared",
   firstName: "Drink",
   lastName: "Coffee",
   company: null
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members/search/:searchString",title:"Search for non-members",name:"findUsersWithoutMembership",group:"Teamspace",description:"<p>It returns a list of users that dont belong to the teamspace and that their usernames matches partially with the string and if entered an email it only matches if the string is the entire email address.</p> <p>In the result it's included their username, first name, last name, company and roles in other teamspaces.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"searchString",isArray:!1,description:"<p>Search string provided to find member</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members/search/project HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK

[
   {
      user: "projectowner",
      roles: [
         {
            role: "team_member",
            db: "projectowner"
         }
      ],
      firstName: "Project",
      lastName: "Owner",
      company: null
   },
   {
      user: "projectshared",
      roles: [
         {
            role: "team_member",
            db: "projectshared"
         }
      ],
      firstName: "Drink",
      lastName: "Coffee",
      company: null
   },
   {
      user: "project_username",
      roles: [
         {
            role: "team_member",
            db: "project_username"
         }
      ],
      firstName: "George",
      lastName: "Crown",
       company: null
   },
]`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/addOns",title:"get enabled add ons",name:"getAddOns",group:"Teamspace",description:"<p>view the list of addOns enabled on this teamspace</p>",permission:[{name:"teamspace member"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success",content:`{
  vrEnabled: true,
  hereEnabled: true
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/billingInfo",title:"Get billing info",name:"getBillingInfo",group:"Teamspace",description:"<p>It returns the teamspace billing info.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/billingInfo HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   vat: "GB 365684514",
   line1: "10 Downing Street",
   postalCode: "SW1A 2AA",
   city: "London",
   company: "Teamspace one",
   countryCode: "GB",
   lastName: "Voorhees",
   firstName: "Jason"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members/:user",title:"Get member's info",name:"getMemberInfo",group:"Teamspace",description:"<p>It returns the teamspace's member small info .</p>",permission:[{name:"teamSpaceMember"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>The username of the user you wish to query</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   user: "viewerTeamspace1Model1JobB",
   firstName: "Alice",
   lastName: "Stratford",
   company: "Teamspace one",
   job: {"_id": "Job1", color: "#FFFFFF"}
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members",title:"Get members list",name:"getMemberList",group:"Teamspace",description:"<p>It returns a list of members identifying which of them are teamspace administrators, and their jobs.</p>",permission:[{name:"teamSpaceMember"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   members: [
      {
         user: "teamSpace1",
         firstName: "Teamspace",
         lastName: "One",
         company: "Teamspace one",
         permissions: [
            "teamspace_admin"
         ],
         job: "jobA",
         isCurrentUser: true
      },
      {
         user: "unassignedTeamspace1UserJobA",
         firstName: "John",
         lastName: "Williams",
         company: "Teamspace One",
         permissions: [],
         job: "jobA",
         isCurrentUser: false
      },
      {
         user: "viewerTeamspace1Model1JobB",
         firstName: "Alice",
         lastName: "Stratford",
         company: "Teamspace one",
         permissions: [],
         job: "jobB",
         isCurrentUser: false
      }
   ]
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/settings/mitigations.csv",title:"Download mitigations file",name:"getMitigationsFile",group:"Teamspace",description:"<p>Returns a CSV file containing all defined suggested risk mitigations.</p>",examples:[{title:"Example usage",content:"GET /acme/settings/mitigations.csv HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<Risk mitigations CSV file>`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/quota",title:"Get Quota Information",name:"getQuotaInfo",group:"Teamspace",description:"<p>It returns the quota information. Each teamspace has a space limit and a limit of collaborators. The values returned are  space used (both these values are in bytes) and the collaborator limit. If spaceLimit or collaboratorLimit are nulled it means that there are no space limit/member limit.</p>",permission:[{name:"teamSpaceAdmin"}],examples:[{title:"Example usage:",content:"GET /teamSpace1/quota HTTP/1.1",type:"get"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
    spaceLimit: 1048576,
	   collaboratorLimit: 12,
    spaceUsed: 2048
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/settings",title:"Get teamspace settings",name:"getTeamspaceSettings",group:"Teamspace",description:"<p>Returns all teamspace settings.</p>",examples:[{title:"Example usage",content:"GET /acme/settings HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"riskCategories":[
		"Commercial Issue",
		"Environmental Issue",
		"Health - Material effect",
		"Health - Mechanical effect",
		"Safety Issue - Fall",
		"Safety Issue - Trapped",
		"Safety Issue - Event",
		"Safety Issue - Handling",
		"Safety Issue - Struck",
		"Safety Issue - Public",
		"Social Issue",
		"Other Issue",
		"UNKNOWN"
	],
	"topicTypes":[
		"For information",
		"VR",
		"Clash",
		"Diff",
		"RFI",
		"Risk",
		"H&S",
		"Design",
		"Constructibility",
		"GIS"
	],
	"mitigationsUpdatedAt":1567156228976,
	"_id":"acme"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"delete",url:"/:teamspace/members/:user",title:"Remove from the teamspace",name:"removeTeamMember",group:"Teamspace",description:"<p>Removes a user from the teampspace.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>Username of the member to remove</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   user: "viewerTeamspace1Model1JobB",
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"patch",url:"/:teamspace/settings",title:"Update teamspace settings",name:"updateTeamspaceSettings",group:"Teamspace",description:"<p>Update teamspace settings.</p>",body:[{group:"Body",type:"String[]",optional:!0,field:"riskCategories",isArray:!0,description:"<p>List of risk categories</p>"},{group:"Body",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>List of issue topic types</p>"},{group:"Risk category",type:"String",optional:!1,field:"value",isArray:!1,description:"<p>Value of risk category</p>"},{group:"Risk category",type:"String",optional:!1,field:"label",isArray:!1,description:"<p>Label for risk category</p>"},{group:"Topic type",type:"String",optional:!1,field:"value",isArray:!1,description:"<p>Value of topic type</p>"},{group:"Topic type",type:"String",optional:!1,field:"label",isArray:!1,description:"<p>Label for topic type</p>"}],examples:[{title:"Example usage",content:`PUT /acme/settings HTTP/1.1
{
	"topicTypes":[
		"New Topic 1",
		"New Topic 2"
	],
	"riskCategories":[
		"New Category 1",
		"NEW CATEGORY 2"
	]
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"riskCategories":[
		"New Category 1",
		"NEW CATEGORY 2"
	],
	"topicTypes":[
		"New Topic 1",
		"New Topic 2"
	],
	"mitigationsUpdatedAt":1567156228976,
	"_id":"acme"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"post",url:"/:teamspace/settings/mitigations.csv",title:"Upload mitigations file",name:"uploadMitigationsFile",group:"Teamspace",description:"<p>Upload a risk mitigations CSV file to a teamspace.</p>",examples:[{title:"Example usage",content:`POST /acme/settings/mitigations.csv HTTP/1.1
<Risk mitigations CSV file>`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"ok"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/starredMeta",title:"Gets the starred metadata tags for the logged user",description:"<p>This endpoint returns the starred metadata tags. You can manage the starred metadata in the frontend from BIM (i) icon in the viewer.</p>",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
[
   "material",
   "color",
   "base offset"
]`,type:"json"}]},name:"GetStarredMetadataTags",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/starredModels",title:"Gets the starred models for the logged user",name:"GetStarredModels",group:"User",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
[
  {
    "teamspace": "ts1",
    "models": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"]
  },
  {
    "teamspace": "ts2",
    "models": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
  }
]`,type:"json"}]},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredMeta",title:"Replaces the whole starred metadata tags array for the logged user",name:"SetMetadataTags",group:"User",body:[{group:"Body",type:"String[]",optional:!1,field:"tags",isArray:!0,description:"<p>An array of tags to be starred</p>"}],parameter:{examples:[{title:"Input",content:`   [
   	"material",
	  	"color"
	  ]`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredModels",title:"Sets the whole starred models for the logged user",name:"SetStarredModels",group:"User",body:[{group:"Body",type:"Object[]",optional:!1,field:"starredModels",isArray:!0,description:"<p>Array of objects containing teamspace and models</p>"},{group:"starredModels",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Teamspace name</p>"},{group:"starredModels",type:"String[]",optional:!1,field:"models",isArray:!0,description:"<p>Array of model IDs</p>"}],parameter:{examples:[{title:"Input",content:`[
  {
    "teamspace": "user1",
    "models": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"]
  },
  {
    "teamspace": "user2",
    "models": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
  }
]`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredMeta",title:"Adds a starred metadata tag for the logged user",name:"StarMetadataTags",group:"User",body:[{group:"Body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>The tag to be starred</p>"}],parameter:{examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredModels",title:"Adds a starred models for the logged user",name:"StarModels",group:"User",body:[{group:"Body",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>teamspace where model resides</p>"},{group:"Body",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>model ID  to add</p>"}],parameter:{examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredMeta",title:"removes a starred metadata tag for the logged user if the tag exists",name:"UnstarMetadataTags",group:"User",body:[{group:"Body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>The tag to be starred</p>"}],parameter:{examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredModels",title:"removes a starred models for the logged user if the tag exists",name:"UnstarModels",group:"User",body:[{group:"Body",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>teamspace where model resides</p>"},{group:"Body",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>model ID  to remove</p>"}],parameter:{examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/apikey",title:"Deletes the current apikey for the logged user",name:"deleteApiKey",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/apikey",title:"Generates an apikey for the logged user",name:"generateApiKey",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   apiKey:"20f947a673dce5419ce187ca7998a68f"
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/me",title:"Gets the profile for the logged user",name:"getProfile",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   username: "jasonv",
   firstName: "Jason",
   lastName: "Voorhees",
   email: "jason@vorhees.com",
   hasAvatar: true
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/:teamspace/:model/viewpoints/",title:"Create view",name:"createView",group:"Views",description:"<p>Create a new view.</p>",body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"},{group:"Body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint</p>"},{group:"Body",type:"Object",optional:!1,field:"screenshot",isArray:!1,description:"<p>Screenshot</p>"},{group:"Body",type:"String",optional:!0,field:"clippingPlanes",isArray:!1,description:"<p>List of clipping planes</p>"},{group:"screenshot",type:"String",optional:!1,field:"base64",isArray:!1,description:"<p>Screenshot image in base64</p>"}],examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
{
	"clippingPlanes":[],
	"name":"View 3",
	"screenshot":{
		"base64":<base64 image>
	}
	"viewpoint":{
		"aspect_ratio":1.1715909242630005,
		"far":233419.5625,
		"fov":1.0471975803375244,
		"highlighted_group_id":"",
		"look_at":[34448.78125, 2989.078125, 17619.7265625],
		"near":466.839111328125,
		"position":[34448.78125, 163958.484375, 17620.015625],
		"right":[0.9999919533729553, -7.683411240577698e-9, 0.00400533527135849],
		"up":[0.00400533527135849, 0.0000017881393432617188, -0.9999920129776001],
		"view_dir":[-6.984919309616089e-10, -1, -0.0000017881393432617188]
	}
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000001"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/viewpoints/:viewId",title:"Delete view",name:"deleteView",group:"Views",description:"<p>Delete a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints/:viewId",title:"Get view",name:"findView",group:"Views",description:"<p>Retrieve a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"right",isArray:!1,description:"<p>The right vector of the viewpoint indicating the direction of right in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"up",isArray:!1,description:"<p>The up vector of the viewpoint indicating the direction of up in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>The position vector indicates where in the world the viewpoint is positioned.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"look_at",isArray:!1,description:"<p>The vector indicating where in the world the viewpoint is looking at.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"view_dir",isArray:!1,description:"<p>The vector indicating where is the viewpoint is looking at in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000001",
	"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png",
	"viewpoint":{
		"right":[1.0,-0.0,0.0],
		"up":[0.0,0.0,-1.0],
		"position":[35000.0,150000.0,20000.0],
		"look_at":[35000.0,3000.0,20000.0],
		"view_dir":[-0.0,-1,-0.0],
		"near":100.0,
		"far":100000.0,
		"fov":1.0,
		"aspect_ratio":1.185,
		"clippingPlanes":[],
		"highlighted_group_id":""
	},
	"clippingPlanes":[],
	"screenshot":{
		"thumbnailUrl":<binary image>,
		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
	},
	"name":"View1"
}`,type:"png"}],fields:{"View object":[{group:"View object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>View ID</p>"},{group:"View object",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"},{group:"View object",type:"String",optional:!1,field:"thumbnail",isArray:!1,description:"<p>Thumbnail image</p>"},{group:"View object",type:"ResultViewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint properties</p>"},{group:"View object",type:"Number[]",optional:!1,field:"clippingPlanes",isArray:!0,description:"<p>[DEPRECATED] Array of clipping planes</p>"},{group:"View object",type:"Object",optional:!1,field:"screenshot",isArray:!1,description:"<p>[DEPRECATED] Screenshot object</p>"}]}},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints/:viewId/thumbnail.png",title:"Get view thumbnail",name:"getThumbnail",group:"Views",description:"<p>Retrieve a view's thumbnail image.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000/thumbnail.png HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints",title:"List all views",name:"listViews",group:"Views",description:"<p>List all model views.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object[]",optional:!1,field:"views",isArray:!0,description:"<p>List of view objects</p>"}],"View object":[{group:"View object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>View ID</p>"},{group:"View object",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"},{group:"View object",type:"String",optional:!1,field:"thumbnail",isArray:!1,description:"<p>Thumbnail image</p>"},{group:"View object",type:"ResultViewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint properties</p>"},{group:"View object",type:"Number[]",optional:!1,field:"clippingPlanes",isArray:!0,description:"<p>[DEPRECATED] Array of clipping planes</p>"},{group:"View object",type:"Object",optional:!1,field:"screenshot",isArray:!1,description:"<p>[DEPRECATED] Screenshot object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000001",
		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png",
		"viewpoint":{
			"right":[1.0,-0.0,0.0],
			"up":[0.0,0.0,-1.0],
			"position":[35000.0,150000.0,20000.0],
			"look_at":[35000.0,3000.0,20000.0],
			"view_dir":[-0.0,-1,-0.0],
			"near":100.0,
			"far":100000.0,
			"fov":1.0,
			"aspect_ratio":1.185,
			"clippingPlanes":[],
			"highlighted_group_id":""
		},
		"clippingPlanes":[],
		"screenshot":{
			"thumbnailUrl":<binary image>,
			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
		},
		"name":"View1"
	},
	{
		"_id":"00000000-0000-0000-0000-000000000002",
		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000002/thumbnail.png",
		"viewpoint":{
			"right":[1.0,-0.0,0.5],
			"up":[0.0,0.0,-1.0],
			"position":[20000.0,-50000.0,10000.0],
			"look_at":[20000.0,5000.0,10000.0],
			"view_dir":[0.0,-1,0.0],
			"near":100.0,
			"far":100000.0,
			"fov":1.0,
			"aspect_ratio":1.185,
			"clippingPlanes":[],
			"highlighted_group_id":""
		},
		"clippingPlanes":[],
		"screenshot":{
			"thumbnailUrl":<binary image>,
			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000002/thumbnail.png"
		},
		"name":"View2"
	}
]`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1",type:"get"}],version:"0.0.0",filename:"view.js",groupTitle:"Views",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"right",isArray:!1,description:"<p>The right vector of the viewpoint indicating the direction of right in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"up",isArray:!1,description:"<p>The up vector of the viewpoint indicating the direction of up in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"position",isArray:!1,description:"<p>The position vector indicates where in the world the viewpoint is positioned.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"look_at",isArray:!1,description:"<p>The vector indicating where in the world the viewpoint is looking at.</p>"},{group:"Type: ResultViewpoint",type:"Number",size:"3..3",optional:!1,field:"view_dir",isArray:!1,description:"<p>The vector indicating where is the viewpoint is looking at in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[]",optional:!1,field:"normal",isArray:!0,description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"put",url:"/:teamspace/:model/viewpoints/:viewId",title:"Update view",name:"updateView",group:"Views",description:"<p>Update a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},body:[{group:"Body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"}],examples:[{title:"Example usage:",content:`PUT /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
{
	"name":"NewName"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000001"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"}];const de={name:"3D Repo V4 backend documentation",version:"5.17.1",description:"Backend documentation for v4 APIs. To view v5 API endpoints, please visition https://www.3drepo.io/docs",title:"3D Repo V4 Backend documentation",sampleUrl:!1,defaultVersion:"0.0.0",apidoc:"0.3.0",generator:{name:"apidoc",time:"Fri Jun 27 2025 14:16:56 GMT+0100 (British Summer Time)",url:"https://apidocjs.com",version:"1.2.0"}};ht();const Ce=p().compile(m()("#template-header").html()),Pe=p().compile(m()("#template-footer").html()),J=p().compile(m()("#template-article").html()),ve=p().compile(m()("#template-compare-article").html()),he=p().compile(m()("#template-generator").html()),ye=p().compile(m()("#template-project").html()),Oe=p().compile(m()("#template-sections").html()),Ve=p().compile(m()("#template-sidenav").html()),Ue={aloneDisplay:!1,showRequiredLabels:!1,withGenerator:!0,withCompare:!0};de.template=Object.assign(Ue,($e=de.template)!=null?$e:{}),de.template.forceLanguage&&At(de.template.forceLanguage);const qe=(0,r.groupBy)(Me,re=>re.group),et={};m().each(qe,(re,ie)=>{et[re]=(0,r.groupBy)(ie,le=>le.name)});const pt=[];m().each(et,(re,ie)=>{let le=[];m().each(ie,(pe,Ie)=>{const je=Ie[0].title;je&&le.push(je.toLowerCase()+"#~#"+pe)}),le.sort(),de.order&&(le=Re(le,de.order,"#~#")),le.forEach(pe=>{const je=pe.split("#~#")[1];ie[je].forEach(Ne=>{pt.push(Ne)})})}),Me=pt;let mt={};const Bt={};let kt={};kt[de.version]=1,m().each(Me,(re,ie)=>{mt[ie.group]=1,Bt[ie.group]=ie.groupTitle||ie.group,kt[ie.version]=1}),mt=Object.keys(mt),mt.sort(),de.order&&(mt=Ee(Bt,de.order)),kt=Object.keys(kt),kt.sort(i().compare),kt.reverse();const Pt=[];mt.forEach(re=>{Pt.push({group:re,isHeader:!0,title:Bt[re]});let ie="";Me.forEach(le=>{le.group===re&&(ie!==le.name?Pt.push({title:le.title,group:re,name:le.name,type:le.type,version:le.version,url:le.url}):Pt.push({title:le.title,group:re,hidden:!0,name:le.name,type:le.type,version:le.version,url:le.url}),ie=le.name)})});function fn(re,ie,le){let pe=!1;if(!ie)return pe;const Ie=ie.match(/<h(1|2).*?>(.+?)<\/h(1|2)>/gi);return Ie&&Ie.forEach(function(je){const Ne=je.substring(2,3),lt=je.replace(/<.+?>/g,""),St=je.match(/id="api-([^-]+)(?:-(.+))?"/),Ct=St?St[1]:null,gt=St?St[2]:null;Ne==="1"&&lt&&Ct&&(re.splice(le,0,{group:Ct,isHeader:!0,title:lt,isFixed:!0}),le++,pe=!0),Ne==="2"&&lt&&Ct&&gt&&(re.splice(le,0,{group:Ct,name:gt,isHeader:!1,title:lt,isFixed:!1,version:"1.0"}),le++)}),pe}let dn;if(de.header&&(dn=fn(Pt,de.header.content,0),dn||Pt.unshift({group:"_header",isHeader:!0,title:de.header.title==null?bt("General"):de.header.title,isFixed:!0})),de.footer){const re=Pt.length;dn=fn(Pt,de.footer.content,Pt.length),!dn&&de.footer.title!=null&&Pt.splice(re,0,{group:"_footer",isHeader:!0,title:de.footer.title,isFixed:!0})}const Pn=de.title?de.title:"apiDoc: "+de.name+" - "+de.version;m()(document).attr("title",Pn),m()("#loader").remove();const On={nav:Pt};m()("#sidenav").append(Ve(On)),m()("#generator").append(he(de)),(0,r.extend)(de,{versions:kt}),m()("#project").append(ye(de)),de.header&&m()("#header").append(Ce(de.header)),de.footer&&(m()("#footer").append(Pe(de.footer)),de.template.aloneDisplay&&document.getElementById("api-_footer").classList.add("hide"));const Ft={};let Bn="";mt.forEach(function(re){const ie=[];let le="",pe={},Ie=re,je="";Ft[re]={},Me.forEach(function(Ne){re===Ne.group&&(le!==Ne.name?(Me.forEach(function(lt){re===lt.group&&Ne.name===lt.name&&(Object.prototype.hasOwnProperty.call(Ft[Ne.group],Ne.name)||(Ft[Ne.group][Ne.name]=[]),Ft[Ne.group][Ne.name].push(lt.version))}),pe={article:Ne,versions:Ft[Ne.group][Ne.name]}):pe={article:Ne,hidden:!0,versions:Ft[Ne.group][Ne.name]},de.sampleUrl&&de.sampleUrl===!0&&(de.sampleUrl=window.location.origin),de.url&&pe.article.url.substr(0,4).toLowerCase()!=="http"&&(pe.article.url=de.url+pe.article.url),oe(pe,Ne),Ne.groupTitle&&(Ie=Ne.groupTitle),Ne.groupDescription&&(je=Ne.groupDescription),ie.push({article:J(pe),group:Ne.group,name:Ne.name,aloneDisplay:de.template.aloneDisplay}),le=Ne.name)}),pe={group:re,title:Ie,description:je,articles:ie,aloneDisplay:de.template.aloneDisplay},Bn+=Oe(pe)}),m()("#sections").append(Bn),de.template.aloneDisplay||(document.body.dataset.spy="scroll",m()("body").scrollspy({target:"#scrollingNav"})),m()(".form-control").on("focus change",function(){m()(this).removeClass("border-danger")}),m()(".sidenav").find("a").on("click",function(re){re.preventDefault();const ie=this.getAttribute("href");if(de.template.aloneDisplay){const le=document.querySelector(".sidenav > li.active");le&&le.classList.remove("active"),this.parentNode.classList.add("active")}else{const le=document.querySelector(ie);le&&m()("html,body").animate({scrollTop:le.offsetTop},400)}window.location.hash=ie});function Tt(re){let ie=!1;return m().each(re,le=>{ie=ie||(0,r.some)(re[le],pe=>pe.type)}),ie}function Fn(){m()('button[data-toggle="popover"]').popover().click(function(ie){ie.preventDefault()});const re=m()("#version strong").html();if(m()("#sidenav li").removeClass("is-new"),de.template.withCompare&&m()("#sidenav li[data-version='"+re+"']").each(function(){const ie=m()(this).data("group"),le=m()(this).data("name"),pe=m()("#sidenav li[data-group='"+ie+"'][data-name='"+le+"']").length,Ie=m()("#sidenav li[data-group='"+ie+"'][data-name='"+le+"']").index(m()(this));(pe===1||Ie===pe-1)&&m()(this).addClass("is-new")}),m()(".nav-tabs-examples a").click(function(ie){ie.preventDefault(),m()(this).tab("show")}),m()(".nav-tabs-examples").find("a:first").tab("show"),m()(".sample-request-content-type-switch").change(function(){m()(this).val()==="body-form-data"?(m()("#sample-request-body-json-input-"+m()(this).data("id")).hide(),m()("#sample-request-body-form-input-"+m()(this).data("id")).show()):(m()("#sample-request-body-form-input-"+m()(this).data("id")).hide(),m()("#sample-request-body-json-input-"+m()(this).data("id")).show())}),de.template.aloneDisplay&&(m()(".show-group").click(function(){const ie="."+m()(this).attr("data-group")+"-group",le="."+m()(this).attr("data-group")+"-article";m()(".show-api-group").addClass("hide"),m()(ie).removeClass("hide"),m()(".show-api-article").addClass("hide"),m()(le).removeClass("hide")}),m()(".show-api").click(function(){const ie=this.getAttribute("href").substring(1),le=document.getElementById("version").textContent.trim(),pe=`.${this.dataset.name}-article`,Ie=`[id="${ie}-${le}"]`,je=`.${this.dataset.group}-group`;m()(".show-api-group").addClass("hide"),m()(je).removeClass("hide"),m()(".show-api-article").addClass("hide");let Ne=m()(pe);m()(Ie).length&&(Ne=m()(Ie).parent()),Ne.removeClass("hide"),ie.match(/_(header|footer)/)&&document.getElementById(ie).classList.remove("hide")})),de.template.aloneDisplay||m()("body").scrollspy("refresh"),de.template.aloneDisplay){const ie=decodeURI(window.location.hash);if(ie!=null&&ie.length!==0){const le=document.getElementById("version").textContent.trim(),pe=document.querySelector(`li .${ie.slice(1)}-init`),Ie=document.querySelector(`li[data-version="${le}"] .show-api.${ie.slice(1)}-init`);let je=pe;Ie&&(je=Ie),je.click()}}}function F(re){typeof re=="undefined"?re=m()("#version strong").html():m()("#version strong").html(re),m()("article").addClass("hide"),m()("#sidenav li:not(.nav-fixed)").addClass("hide");const ie={};document.querySelectorAll("article[data-version]").forEach(le=>{const pe=le.dataset.group,Ie=le.dataset.name,je=le.dataset.version,Ne=pe+Ie;!ie[Ne]&&i().lte(je,re)&&(ie[Ne]=!0,document.querySelector(`article[data-group="${pe}"][data-name="${Ie}"][data-version="${je}"]`).classList.remove("hide"),document.querySelector(`#sidenav li[data-group="${pe}"][data-name="${Ie}"][data-version="${je}"]`).classList.remove("hide"),document.querySelector(`#sidenav li.nav-header[data-group="${pe}"]`).classList.remove("hide"))}),m()("article[data-version]").each(function(le){const pe=m()(this).data("group");m()("section#api-"+pe).removeClass("hide"),m()("section#api-"+pe+" article:visible").length===0?m()("section#api-"+pe).addClass("hide"):m()("section#api-"+pe).removeClass("hide")})}if(F(),m()("#versions li.version a").on("click",function(re){re.preventDefault(),F(m()(this).html())}),m()("#compareAllWithPredecessor").on("click",ee),m()("article .versions li.version a").on("click",Z),m().urlParam=function(re){const ie=new RegExp("[\\?&amp;]"+re+"=([^&amp;#]*)").exec(window.location.href);return ie&&ie[1]?ie[1]:null},m().urlParam("compare")&&m()("#compareAllWithPredecessor").trigger("click"),window.location.hash){const re=decodeURI(window.location.hash);m()(re).length>0&&m()("html,body").animate({scrollTop:parseInt(m()(re).offset().top)},0)}document.querySelector('[data-toggle="offcanvas"]').addEventListener("click",function(){const re=document.querySelector(".row-offcanvas");re&&re.classList.toggle("active")}),m()("#scrollingNav .sidenav-search input.search").focus(),m()('[data-action="filter-search"]').on("keyup",q(re=>{const ie=re.currentTarget.value.toLowerCase();m()(".sidenav a.nav-list-item").filter((le,pe)=>m()(pe).toggle(m()(pe).text().toLowerCase().indexOf(ie)>-1))},200)),m()("span.search-reset").on("click",function(){m()("#scrollingNav .sidenav-search input.search").val("").focus(),m()(".sidenav").find("a.nav-list-item").show()});function q(re,ie){let le=null;return(...pe)=>{clearTimeout(le),le=setTimeout(re.bind(this,...pe),ie||0)}}function Z(re){re.preventDefault();const ie=m()(this).parents("article"),le=m()(this).html(),pe=ie.find(".version"),Ie=pe.find("strong").html();pe.find("strong").html(le);const je=ie.data("group"),Ne=ie.data("name"),lt=ie.data("version"),St=ie.data("compare-version");if(St!==le&&!(!St&&lt===le)){if(St&&Ft[je][Ne][0]===le||lt===le)Se(je,Ne,lt);else{let Ct={},gt={};m().each(et[je][Ne],function(ai,qn){qn.version===lt&&(Ct=qn),qn.version===le&&(gt=qn)});const ot={article:Ct,compare:gt,versions:Ft[je][Ne]};ot.article.id=ot.article.group+"-"+ot.article.name+"-"+ot.article.version,ot.article.id=ot.article.id.replace(/\./g,"_"),ot.compare.id=ot.compare.group+"-"+ot.compare.name+"-"+ot.compare.version,ot.compare.id=ot.compare.id.replace(/\./g,"_");let nt=Ct;nt.header&&nt.header.fields&&(ot._hasTypeInHeaderFields=Tt(nt.header.fields)),nt.parameter&&nt.parameter.fields&&(ot._hasTypeInParameterFields=Tt(nt.parameter.fields)),nt.error&&nt.error.fields&&(ot._hasTypeInErrorFields=Tt(nt.error.fields)),nt.success&&nt.success.fields&&(ot._hasTypeInSuccessFields=Tt(nt.success.fields)),nt.info&&nt.info.fields&&(ot._hasTypeInInfoFields=Tt(nt.info.fields)),nt=gt,ot._hasTypeInHeaderFields!==!0&&nt.header&&nt.header.fields&&(ot._hasTypeInHeaderFields=Tt(nt.header.fields)),ot._hasTypeInParameterFields!==!0&&nt.parameter&&nt.parameter.fields&&(ot._hasTypeInParameterFields=Tt(nt.parameter.fields)),ot._hasTypeInErrorFields!==!0&&nt.error&&nt.error.fields&&(ot._hasTypeInErrorFields=Tt(nt.error.fields)),ot._hasTypeInSuccessFields!==!0&&nt.success&&nt.success.fields&&(ot._hasTypeInSuccessFields=Tt(nt.success.fields)),ot._hasTypeInInfoFields!==!0&&nt.info&&nt.info.fields&&(ot._hasTypeInInfoFields=Tt(nt.info.fields));const fr=ve(ot);ie.after(fr),ie.next().find(".versions li.version a").on("click",Z),m()("#sidenav li[data-group='"+je+"'][data-name='"+Ne+"'][data-version='"+Ie+"']").addClass("has-modifications"),ie.remove()}Fn(),g().highlightAll()}}function ee(re){re.preventDefault(),m()("article:visible .versions").each(function(){const le=m()(this).parents("article").data("version");let pe=null;m()(this).find("li.version a").each(function(){m()(this).html()<le&&!pe&&(pe=m()(this))}),pe&&pe.trigger("click")})}function oe(re,ie){re.id=re.article.group+"-"+re.article.name+"-"+re.article.version,re.id=re.id.replace(/\./g,"_"),ie.header&&ie.header.fields&&(re._hasTypeInHeaderFields=Tt(ie.header.fields)),ie.parameter&&ie.parameter.fields&&(re._hasTypeInParameterFields=Tt(ie.parameter.fields)),ie.error&&ie.error.fields&&(re._hasTypeInErrorFields=Tt(ie.error.fields)),ie.success&&ie.success.fields&&(re._hasTypeInSuccessFields=Tt(ie.success.fields)),ie.info&&ie.info.fields&&(re._hasTypeInInfoFields=Tt(ie.info.fields)),re.template=de.template}function Ae(re,ie,le){let pe={};m().each(et[re][ie],function(je,Ne){Ne.version===le&&(pe=Ne)});const Ie={article:pe,versions:Ft[re][ie]};return oe(Ie,pe),J(Ie)}function Se(re,ie,le){const pe=m()("article[data-group='"+re+"'][data-name='"+ie+"']:visible"),Ie=Ae(re,ie,le);pe.after(Ie),pe.next().find(".versions li.version a").on("click",Z),m()("#sidenav li[data-group='"+re+"'][data-name='"+ie+"'][data-version='"+le+"']").removeClass("has-modifications"),pe.remove()}function Re(re,ie,le){const pe=[];return ie.forEach(function(Ie){le?re.forEach(function(je){const Ne=je.split(le);(Ne[0]===Ie||Ne[1]===Ie)&&pe.push(je)}):re.forEach(function(je){je===Ie&&pe.push(Ie)})}),re.forEach(function(Ie){pe.indexOf(Ie)===-1&&pe.push(Ie)}),pe}function Ee(re,ie){const le=[];return ie.forEach(pe=>{Object.keys(re).forEach(Ie=>{re[Ie].replace(/_/g," ")===pe&&le.push(Ie)})}),Object.keys(re).forEach(pe=>{le.indexOf(pe)===-1&&le.push(pe)}),le}Fn()}})()})();
