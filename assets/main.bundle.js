(()=>{var rp={9781:(w,v,s)=>{"use strict";const m=s(6049),i=Symbol("max"),n=Symbol("length"),p=Symbol("lengthCalculator"),c=Symbol("allowStale"),l=Symbol("maxAge"),o=Symbol("dispose"),u=Symbol("noDisposeOnSet"),h=Symbol("lruList"),r=Symbol("cache"),g=Symbol("updateAgeOnGet"),d=()=>1;class f{constructor(A){if(typeof A=="number"&&(A={max:A}),A||(A={}),A.max&&(typeof A.max!="number"||A.max<0))throw new TypeError("max must be a non-negative number");const I=this[i]=A.max||1/0,R=A.length||d;if(this[p]=typeof R!="function"?d:R,this[c]=A.stale||!1,A.maxAge&&typeof A.maxAge!="number")throw new TypeError("maxAge must be a number");this[l]=A.maxAge||0,this[o]=A.dispose,this[u]=A.noDisposeOnSet||!1,this[g]=A.updateAgeOnGet||!1,this.reset()}set max(A){if(typeof A!="number"||A<0)throw new TypeError("max must be a non-negative number");this[i]=A||1/0,T(this)}get max(){return this[i]}set allowStale(A){this[c]=!!A}get allowStale(){return this[c]}set maxAge(A){if(typeof A!="number")throw new TypeError("maxAge must be a non-negative number");this[l]=A,T(this)}get maxAge(){return this[l]}set lengthCalculator(A){typeof A!="function"&&(A=d),A!==this[p]&&(this[p]=A,this[n]=0,this[h].forEach(I=>{I.length=this[p](I.value,I.key),this[n]+=I.length})),T(this)}get lengthCalculator(){return this[p]}get length(){return this[n]}get itemCount(){return this[h].length}rforEach(A,I){I=I||this;for(let R=this[h].tail;R!==null;){const C=R.prev;x(this,A,R,I),R=C}}forEach(A,I){I=I||this;for(let R=this[h].head;R!==null;){const C=R.next;x(this,A,R,I),R=C}}keys(){return this[h].toArray().map(A=>A.key)}values(){return this[h].toArray().map(A=>A.value)}reset(){this[o]&&this[h]&&this[h].length&&this[h].forEach(A=>this[o](A.key,A.value)),this[r]=new Map,this[h]=new m,this[n]=0}dump(){return this[h].map(A=>y(this,A)?!1:{k:A.key,v:A.value,e:A.now+(A.maxAge||0)}).toArray().filter(A=>A)}dumpLru(){return this[h]}set(A,I,R){if(R=R||this[l],R&&typeof R!="number")throw new TypeError("maxAge must be a number");const C=R?Date.now():0,D=this[p](I,A);if(this[r].has(A)){if(D>this[i])return _(this,this[r].get(A)),!1;const k=this[r].get(A).value;return this[o]&&(this[u]||this[o](A,k.value)),k.now=C,k.maxAge=R,k.value=I,this[n]+=D-k.length,k.length=D,this.get(A),T(this),!0}const M=new P(A,I,D,C,R);return M.length>this[i]?(this[o]&&this[o](A,I),!1):(this[n]+=M.length,this[h].unshift(M),this[r].set(A,this[h].head),T(this),!0)}has(A){if(!this[r].has(A))return!1;const I=this[r].get(A).value;return!y(this,I)}get(A){return b(this,A,!0)}peek(A){return b(this,A,!1)}pop(){const A=this[h].tail;return A?(_(this,A),A.value):null}del(A){_(this,this[r].get(A))}load(A){this.reset();const I=Date.now();for(let R=A.length-1;R>=0;R--){const C=A[R],D=C.e||0;if(D===0)this.set(C.k,C.v);else{const M=D-I;M>0&&this.set(C.k,C.v,M)}}}prune(){this[r].forEach((A,I)=>b(this,I,!1))}}const b=(E,A,I)=>{const R=E[r].get(A);if(R){const C=R.value;if(y(E,C)){if(_(E,R),!E[c])return}else I&&(E[g]&&(R.value.now=Date.now()),E[h].unshiftNode(R));return C.value}},y=(E,A)=>{if(!A||!A.maxAge&&!E[l])return!1;const I=Date.now()-A.now;return A.maxAge?I>A.maxAge:E[l]&&I>E[l]},T=E=>{if(E[n]>E[i])for(let A=E[h].tail;E[n]>E[i]&&A!==null;){const I=A.prev;_(E,A),A=I}},_=(E,A)=>{if(A){const I=A.value;E[o]&&E[o](I.key,I.value),E[n]-=I.length,E[r].delete(I.key),E[h].removeNode(A)}};class P{constructor(A,I,R,C,D){this.key=A,this.value=I,this.length=R,this.now=C,this.maxAge=D||0}}const x=(E,A,I,R)=>{let C=I.value;y(E,C)&&(_(E,I),E[c]||(C=void 0)),C&&A.call(R,C.value,C.key,E)};w.exports=f},8325:(w,v,s)=>{const m=Symbol("SemVer ANY");class i{static get ANY(){return m}constructor(g,d){if(d=n(d),g instanceof i){if(g.loose===!!d.loose)return g;g=g.value}o("comparator",g,d),this.options=d,this.loose=!!d.loose,this.parse(g),this.semver===m?this.value="":this.value=this.operator+this.semver.version,o("comp",this)}parse(g){const d=this.options.loose?p[c.COMPARATORLOOSE]:p[c.COMPARATOR],f=g.match(d);if(!f)throw new TypeError(`Invalid comparator: ${g}`);this.operator=f[1]!==void 0?f[1]:"",this.operator==="="&&(this.operator=""),f[2]?this.semver=new u(f[2],this.options.loose):this.semver=m}toString(){return this.value}test(g){if(o("Comparator.test",g,this.options.loose),this.semver===m||g===m)return!0;if(typeof g=="string")try{g=new u(g,this.options)}catch(d){return!1}return l(g,this.operator,this.semver,this.options)}intersects(g,d){if(!(g instanceof i))throw new TypeError("a Comparator is required");if((!d||typeof d!="object")&&(d={loose:!!d,includePrerelease:!1}),this.operator==="")return this.value===""?!0:new h(g.value,d).test(this.value);if(g.operator==="")return g.value===""?!0:new h(this.value,d).test(g.semver);const f=(this.operator===">="||this.operator===">")&&(g.operator===">="||g.operator===">"),b=(this.operator==="<="||this.operator==="<")&&(g.operator==="<="||g.operator==="<"),y=this.semver.version===g.semver.version,T=(this.operator===">="||this.operator==="<=")&&(g.operator===">="||g.operator==="<="),_=l(this.semver,"<",g.semver,d)&&(this.operator===">="||this.operator===">")&&(g.operator==="<="||g.operator==="<"),P=l(this.semver,">",g.semver,d)&&(this.operator==="<="||this.operator==="<")&&(g.operator===">="||g.operator===">");return f||b||y&&T||_||P}}w.exports=i;const n=s(349),{re:p,t:c}=s(3259),l=s(5609),o=s(4903),u=s(1630),h=s(1459)},1459:(w,v,s)=>{class m{constructor(G,H){if(H=p(H),G instanceof m)return G.loose===!!H.loose&&G.includePrerelease===!!H.includePrerelease?G:new m(G.raw,H);if(G instanceof c)return this.raw=G.value,this.set=[[G]],this.format(),this;if(this.options=H,this.loose=!!H.loose,this.includePrerelease=!!H.includePrerelease,this.raw=G,this.set=G.split(/\s*\|\|\s*/).map($=>this.parseRange($.trim())).filter($=>$.length),!this.set.length)throw new TypeError(`Invalid SemVer Range: ${G}`);if(this.set.length>1){const $=this.set[0];if(this.set=this.set.filter(j=>!f(j[0])),this.set.length===0)this.set=[$];else if(this.set.length>1){for(const j of this.set)if(j.length===1&&b(j[0])){this.set=[j];break}}}this.format()}format(){return this.range=this.set.map(G=>G.join(" ").trim()).join("||").trim(),this.range}toString(){return this.range}parseRange(G){G=G.trim();const $=`parseRange:${Object.keys(this.options).join(",")}:${G}`,j=n.get($);if(j)return j;const K=this.options.loose,W=K?u[h.HYPHENRANGELOOSE]:u[h.HYPHENRANGE];G=G.replace(W,M(this.options.includePrerelease)),l("hyphen replace",G),G=G.replace(u[h.COMPARATORTRIM],r),l("comparator trim",G,u[h.COMPARATORTRIM]),G=G.replace(u[h.TILDETRIM],g),G=G.replace(u[h.CARETTRIM],d),G=G.split(/\s+/).join(" ");const te=K?u[h.COMPARATORLOOSE]:u[h.COMPARATOR],ae=G.split(" ").map(Ee=>T(Ee,this.options)).join(" ").split(/\s+/).map(Ee=>D(Ee,this.options)).filter(this.options.loose?Ee=>!!Ee.match(te):()=>!0).map(Ee=>new c(Ee,this.options)),me=ae.length,Q=new Map;for(const Ee of ae){if(f(Ee))return[Ee];Q.set(Ee.value,Ee)}Q.size>1&&Q.has("")&&Q.delete("");const ve=[...Q.values()];return n.set($,ve),ve}intersects(G,H){if(!(G instanceof m))throw new TypeError("a Range is required");return this.set.some($=>y($,H)&&G.set.some(j=>y(j,H)&&$.every(K=>j.every(W=>K.intersects(W,H)))))}test(G){if(!G)return!1;if(typeof G=="string")try{G=new o(G,this.options)}catch(H){return!1}for(let H=0;H<this.set.length;H++)if(B(this.set[H],G,this.options))return!0;return!1}}w.exports=m;const i=s(9781),n=new i({max:1e3}),p=s(349),c=s(8325),l=s(4903),o=s(1630),{re:u,t:h,comparatorTrimReplace:r,tildeTrimReplace:g,caretTrimReplace:d}=s(3259),f=k=>k.value==="<0.0.0-0",b=k=>k.value==="",y=(k,G)=>{let H=!0;const $=k.slice();let j=$.pop();for(;H&&$.length;)H=$.every(K=>j.intersects(K,G)),j=$.pop();return H},T=(k,G)=>(l("comp",k,G),k=E(k,G),l("caret",k),k=P(k,G),l("tildes",k),k=I(k,G),l("xrange",k),k=C(k,G),l("stars",k),k),_=k=>!k||k.toLowerCase()==="x"||k==="*",P=(k,G)=>k.trim().split(/\s+/).map(H=>x(H,G)).join(" "),x=(k,G)=>{const H=G.loose?u[h.TILDELOOSE]:u[h.TILDE];return k.replace(H,($,j,K,W,te)=>{l("tilde",k,$,j,K,W,te);let ae;return _(j)?ae="":_(K)?ae=`>=${j}.0.0 <${+j+1}.0.0-0`:_(W)?ae=`>=${j}.${K}.0 <${j}.${+K+1}.0-0`:te?(l("replaceTilde pr",te),ae=`>=${j}.${K}.${W}-${te} <${j}.${+K+1}.0-0`):ae=`>=${j}.${K}.${W} <${j}.${+K+1}.0-0`,l("tilde return",ae),ae})},E=(k,G)=>k.trim().split(/\s+/).map(H=>A(H,G)).join(" "),A=(k,G)=>{l("caret",k,G);const H=G.loose?u[h.CARETLOOSE]:u[h.CARET],$=G.includePrerelease?"-0":"";return k.replace(H,(j,K,W,te,ae)=>{l("caret",k,j,K,W,te,ae);let me;return _(K)?me="":_(W)?me=`>=${K}.0.0${$} <${+K+1}.0.0-0`:_(te)?K==="0"?me=`>=${K}.${W}.0${$} <${K}.${+W+1}.0-0`:me=`>=${K}.${W}.0${$} <${+K+1}.0.0-0`:ae?(l("replaceCaret pr",ae),K==="0"?W==="0"?me=`>=${K}.${W}.${te}-${ae} <${K}.${W}.${+te+1}-0`:me=`>=${K}.${W}.${te}-${ae} <${K}.${+W+1}.0-0`:me=`>=${K}.${W}.${te}-${ae} <${+K+1}.0.0-0`):(l("no pr"),K==="0"?W==="0"?me=`>=${K}.${W}.${te}${$} <${K}.${W}.${+te+1}-0`:me=`>=${K}.${W}.${te}${$} <${K}.${+W+1}.0-0`:me=`>=${K}.${W}.${te} <${+K+1}.0.0-0`),l("caret return",me),me})},I=(k,G)=>(l("replaceXRanges",k,G),k.split(/\s+/).map(H=>R(H,G)).join(" ")),R=(k,G)=>{k=k.trim();const H=G.loose?u[h.XRANGELOOSE]:u[h.XRANGE];return k.replace(H,($,j,K,W,te,ae)=>{l("xRange",k,$,j,K,W,te,ae);const me=_(K),Q=me||_(W),ve=Q||_(te),Ee=ve;return j==="="&&Ee&&(j=""),ae=G.includePrerelease?"-0":"",me?j===">"||j==="<"?$="<0.0.0-0":$="*":j&&Ee?(Q&&(W=0),te=0,j===">"?(j=">=",Q?(K=+K+1,W=0,te=0):(W=+W+1,te=0)):j==="<="&&(j="<",Q?K=+K+1:W=+W+1),j==="<"&&(ae="-0"),$=`${j+K}.${W}.${te}${ae}`):Q?$=`>=${K}.0.0${ae} <${+K+1}.0.0-0`:ve&&($=`>=${K}.${W}.0${ae} <${K}.${+W+1}.0-0`),l("xRange return",$),$})},C=(k,G)=>(l("replaceStars",k,G),k.trim().replace(u[h.STAR],"")),D=(k,G)=>(l("replaceGTE0",k,G),k.trim().replace(u[G.includePrerelease?h.GTE0PRE:h.GTE0],"")),M=k=>(G,H,$,j,K,W,te,ae,me,Q,ve,Ee,We)=>(_($)?H="":_(j)?H=`>=${$}.0.0${k?"-0":""}`:_(K)?H=`>=${$}.${j}.0${k?"-0":""}`:W?H=`>=${H}`:H=`>=${H}${k?"-0":""}`,_(me)?ae="":_(Q)?ae=`<${+me+1}.0.0-0`:_(ve)?ae=`<${me}.${+Q+1}.0-0`:Ee?ae=`<=${me}.${Q}.${ve}-${Ee}`:k?ae=`<${me}.${Q}.${+ve+1}-0`:ae=`<=${ae}`,`${H} ${ae}`.trim()),B=(k,G,H)=>{for(let $=0;$<k.length;$++)if(!k[$].test(G))return!1;if(G.prerelease.length&&!H.includePrerelease){for(let $=0;$<k.length;$++)if(l(k[$].semver),k[$].semver!==c.ANY&&k[$].semver.prerelease.length>0){const j=k[$].semver;if(j.major===G.major&&j.minor===G.minor&&j.patch===G.patch)return!0}return!1}return!0}},1630:(w,v,s)=>{const m=s(4903),{MAX_LENGTH:i,MAX_SAFE_INTEGER:n}=s(3325),{re:p,t:c}=s(3259),l=s(349),{compareIdentifiers:o}=s(7342);class u{constructor(r,g){if(g=l(g),r instanceof u){if(r.loose===!!g.loose&&r.includePrerelease===!!g.includePrerelease)return r;r=r.version}else if(typeof r!="string")throw new TypeError(`Invalid Version: ${r}`);if(r.length>i)throw new TypeError(`version is longer than ${i} characters`);m("SemVer",r,g),this.options=g,this.loose=!!g.loose,this.includePrerelease=!!g.includePrerelease;const d=r.trim().match(g.loose?p[c.LOOSE]:p[c.FULL]);if(!d)throw new TypeError(`Invalid Version: ${r}`);if(this.raw=r,this.major=+d[1],this.minor=+d[2],this.patch=+d[3],this.major>n||this.major<0)throw new TypeError("Invalid major version");if(this.minor>n||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>n||this.patch<0)throw new TypeError("Invalid patch version");d[4]?this.prerelease=d[4].split(".").map(f=>{if(/^[0-9]+$/.test(f)){const b=+f;if(b>=0&&b<n)return b}return f}):this.prerelease=[],this.build=d[5]?d[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(r){if(m("SemVer.compare",this.version,this.options,r),!(r instanceof u)){if(typeof r=="string"&&r===this.version)return 0;r=new u(r,this.options)}return r.version===this.version?0:this.compareMain(r)||this.comparePre(r)}compareMain(r){return r instanceof u||(r=new u(r,this.options)),o(this.major,r.major)||o(this.minor,r.minor)||o(this.patch,r.patch)}comparePre(r){if(r instanceof u||(r=new u(r,this.options)),this.prerelease.length&&!r.prerelease.length)return-1;if(!this.prerelease.length&&r.prerelease.length)return 1;if(!this.prerelease.length&&!r.prerelease.length)return 0;let g=0;do{const d=this.prerelease[g],f=r.prerelease[g];if(m("prerelease compare",g,d,f),d===void 0&&f===void 0)return 0;if(f===void 0)return 1;if(d===void 0)return-1;if(d===f)continue;return o(d,f)}while(++g)}compareBuild(r){r instanceof u||(r=new u(r,this.options));let g=0;do{const d=this.build[g],f=r.build[g];if(m("prerelease compare",g,d,f),d===void 0&&f===void 0)return 0;if(f===void 0)return 1;if(d===void 0)return-1;if(d===f)continue;return o(d,f)}while(++g)}inc(r,g){switch(r){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",g);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",g);break;case"prepatch":this.prerelease.length=0,this.inc("patch",g),this.inc("pre",g);break;case"prerelease":this.prerelease.length===0&&this.inc("patch",g),this.inc("pre",g);break;case"major":(this.minor!==0||this.patch!==0||this.prerelease.length===0)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(this.patch!==0||this.prerelease.length===0)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":this.prerelease.length===0&&this.patch++,this.prerelease=[];break;case"pre":if(this.prerelease.length===0)this.prerelease=[0];else{let d=this.prerelease.length;for(;--d>=0;)typeof this.prerelease[d]=="number"&&(this.prerelease[d]++,d=-2);d===-1&&this.prerelease.push(0)}g&&(this.prerelease[0]===g?isNaN(this.prerelease[1])&&(this.prerelease=[g,0]):this.prerelease=[g,0]);break;default:throw new Error(`invalid increment argument: ${r}`)}return this.format(),this.raw=this.version,this}}w.exports=u},7200:(w,v,s)=>{const m=s(8216),i=(n,p)=>{const c=m(n.trim().replace(/^[=v]+/,""),p);return c?c.version:null};w.exports=i},5609:(w,v,s)=>{const m=s(4594),i=s(3228),n=s(145),p=s(9778),c=s(5429),l=s(7888),o=(u,h,r,g)=>{switch(h){case"===":return typeof u=="object"&&(u=u.version),typeof r=="object"&&(r=r.version),u===r;case"!==":return typeof u=="object"&&(u=u.version),typeof r=="object"&&(r=r.version),u!==r;case"":case"=":case"==":return m(u,r,g);case"!=":return i(u,r,g);case">":return n(u,r,g);case">=":return p(u,r,g);case"<":return c(u,r,g);case"<=":return l(u,r,g);default:throw new TypeError(`Invalid operator: ${h}`)}};w.exports=o},9485:(w,v,s)=>{const m=s(1630),i=s(8216),{re:n,t:p}=s(3259),c=(l,o)=>{if(l instanceof m)return l;if(typeof l=="number"&&(l=String(l)),typeof l!="string")return null;o=o||{};let u=null;if(!o.rtl)u=l.match(n[p.COERCE]);else{let h;for(;(h=n[p.COERCERTL].exec(l))&&(!u||u.index+u[0].length!==l.length);)(!u||h.index+h[0].length!==u.index+u[0].length)&&(u=h),n[p.COERCERTL].lastIndex=h.index+h[1].length+h[2].length;n[p.COERCERTL].lastIndex=-1}return u===null?null:i(`${u[2]}.${u[3]||"0"}.${u[4]||"0"}`,o)};w.exports=c},7548:(w,v,s)=>{const m=s(1630),i=(n,p,c)=>{const l=new m(n,c),o=new m(p,c);return l.compare(o)||l.compareBuild(o)};w.exports=i},7317:(w,v,s)=>{const m=s(9123),i=(n,p)=>m(n,p,!0);w.exports=i},9123:(w,v,s)=>{const m=s(1630),i=(n,p,c)=>new m(n,c).compare(new m(p,c));w.exports=i},3444:(w,v,s)=>{const m=s(8216),i=s(4594),n=(p,c)=>{if(i(p,c))return null;{const l=m(p),o=m(c),u=l.prerelease.length||o.prerelease.length,h=u?"pre":"",r=u?"prerelease":"";for(const g in l)if((g==="major"||g==="minor"||g==="patch")&&l[g]!==o[g])return h+g;return r}};w.exports=n},4594:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)===0;w.exports=i},145:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)>0;w.exports=i},9778:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)>=0;w.exports=i},288:(w,v,s)=>{const m=s(1630),i=(n,p,c,l)=>{typeof c=="string"&&(l=c,c=void 0);try{return new m(n,c).inc(p,l).version}catch(o){return null}};w.exports=i},5429:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)<0;w.exports=i},7888:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)<=0;w.exports=i},5254:(w,v,s)=>{const m=s(1630),i=(n,p)=>new m(n,p).major;w.exports=i},9887:(w,v,s)=>{const m=s(1630),i=(n,p)=>new m(n,p).minor;w.exports=i},3228:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(n,p,c)!==0;w.exports=i},8216:(w,v,s)=>{const{MAX_LENGTH:m}=s(3325),{re:i,t:n}=s(3259),p=s(1630),c=s(349),l=(o,u)=>{if(u=c(u),o instanceof p)return o;if(typeof o!="string"||o.length>m||!(u.loose?i[n.LOOSE]:i[n.FULL]).test(o))return null;try{return new p(o,u)}catch(r){return null}};w.exports=l},8571:(w,v,s)=>{const m=s(1630),i=(n,p)=>new m(n,p).patch;w.exports=i},2115:(w,v,s)=>{const m=s(8216),i=(n,p)=>{const c=m(n,p);return c&&c.prerelease.length?c.prerelease:null};w.exports=i},6822:(w,v,s)=>{const m=s(9123),i=(n,p,c)=>m(p,n,c);w.exports=i},2490:(w,v,s)=>{const m=s(7548),i=(n,p)=>n.sort((c,l)=>m(l,c,p));w.exports=i},5374:(w,v,s)=>{const m=s(1459),i=(n,p,c)=>{try{p=new m(p,c)}catch(l){return!1}return p.test(n)};w.exports=i},6401:(w,v,s)=>{const m=s(7548),i=(n,p)=>n.sort((c,l)=>m(c,l,p));w.exports=i},5665:(w,v,s)=>{const m=s(8216),i=(n,p)=>{const c=m(n,p);return c?c.version:null};w.exports=i},7154:(w,v,s)=>{const m=s(3259);w.exports={re:m.re,src:m.src,tokens:m.t,SEMVER_SPEC_VERSION:s(3325).SEMVER_SPEC_VERSION,SemVer:s(1630),compareIdentifiers:s(7342).compareIdentifiers,rcompareIdentifiers:s(7342).rcompareIdentifiers,parse:s(8216),valid:s(5665),clean:s(7200),inc:s(288),diff:s(3444),major:s(5254),minor:s(9887),patch:s(8571),prerelease:s(2115),compare:s(9123),rcompare:s(6822),compareLoose:s(7317),compareBuild:s(7548),sort:s(6401),rsort:s(2490),gt:s(145),lt:s(5429),eq:s(4594),neq:s(3228),gte:s(9778),lte:s(7888),cmp:s(5609),coerce:s(9485),Comparator:s(8325),Range:s(1459),satisfies:s(5374),toComparators:s(6607),maxSatisfying:s(7530),minSatisfying:s(7527),minVersion:s(1346),validRange:s(3478),outside:s(841),gtr:s(8951),ltr:s(4666),intersects:s(6024),simplifyRange:s(2277),subset:s(8784)}},3325:w=>{const v="2.0.0",m=Number.MAX_SAFE_INTEGER||9007199254740991,i=16;w.exports={SEMVER_SPEC_VERSION:v,MAX_LENGTH:256,MAX_SAFE_INTEGER:m,MAX_SAFE_COMPONENT_LENGTH:i}},4903:w=>{const v=typeof process=="object"&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...s)=>console.error("SEMVER",...s):()=>{};w.exports=v},7342:w=>{const v=/^[0-9]+$/,s=(i,n)=>{const p=v.test(i),c=v.test(n);return p&&c&&(i=+i,n=+n),i===n?0:p&&!c?-1:c&&!p?1:i<n?-1:1},m=(i,n)=>s(n,i);w.exports={compareIdentifiers:s,rcompareIdentifiers:m}},349:w=>{const v=["includePrerelease","loose","rtl"],s=m=>m?typeof m!="object"?{loose:!0}:v.filter(i=>m[i]).reduce((i,n)=>(i[n]=!0,i),{}):{};w.exports=s},3259:(w,v,s)=>{const{MAX_SAFE_COMPONENT_LENGTH:m}=s(3325),i=s(4903);v=w.exports={};const n=v.re=[],p=v.src=[],c=v.t={};let l=0;const o=(u,h,r)=>{const g=l++;i(g,h),c[u]=g,p[g]=h,n[g]=new RegExp(h,r?"g":void 0)};o("NUMERICIDENTIFIER","0|[1-9]\\d*"),o("NUMERICIDENTIFIERLOOSE","[0-9]+"),o("NONNUMERICIDENTIFIER","\\d*[a-zA-Z-][a-zA-Z0-9-]*"),o("MAINVERSION",`(${p[c.NUMERICIDENTIFIER]})\\.(${p[c.NUMERICIDENTIFIER]})\\.(${p[c.NUMERICIDENTIFIER]})`),o("MAINVERSIONLOOSE",`(${p[c.NUMERICIDENTIFIERLOOSE]})\\.(${p[c.NUMERICIDENTIFIERLOOSE]})\\.(${p[c.NUMERICIDENTIFIERLOOSE]})`),o("PRERELEASEIDENTIFIER",`(?:${p[c.NUMERICIDENTIFIER]}|${p[c.NONNUMERICIDENTIFIER]})`),o("PRERELEASEIDENTIFIERLOOSE",`(?:${p[c.NUMERICIDENTIFIERLOOSE]}|${p[c.NONNUMERICIDENTIFIER]})`),o("PRERELEASE",`(?:-(${p[c.PRERELEASEIDENTIFIER]}(?:\\.${p[c.PRERELEASEIDENTIFIER]})*))`),o("PRERELEASELOOSE",`(?:-?(${p[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${p[c.PRERELEASEIDENTIFIERLOOSE]})*))`),o("BUILDIDENTIFIER","[0-9A-Za-z-]+"),o("BUILD",`(?:\\+(${p[c.BUILDIDENTIFIER]}(?:\\.${p[c.BUILDIDENTIFIER]})*))`),o("FULLPLAIN",`v?${p[c.MAINVERSION]}${p[c.PRERELEASE]}?${p[c.BUILD]}?`),o("FULL",`^${p[c.FULLPLAIN]}$`),o("LOOSEPLAIN",`[v=\\s]*${p[c.MAINVERSIONLOOSE]}${p[c.PRERELEASELOOSE]}?${p[c.BUILD]}?`),o("LOOSE",`^${p[c.LOOSEPLAIN]}$`),o("GTLT","((?:<|>)?=?)"),o("XRANGEIDENTIFIERLOOSE",`${p[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),o("XRANGEIDENTIFIER",`${p[c.NUMERICIDENTIFIER]}|x|X|\\*`),o("XRANGEPLAIN",`[v=\\s]*(${p[c.XRANGEIDENTIFIER]})(?:\\.(${p[c.XRANGEIDENTIFIER]})(?:\\.(${p[c.XRANGEIDENTIFIER]})(?:${p[c.PRERELEASE]})?${p[c.BUILD]}?)?)?`),o("XRANGEPLAINLOOSE",`[v=\\s]*(${p[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${p[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${p[c.XRANGEIDENTIFIERLOOSE]})(?:${p[c.PRERELEASELOOSE]})?${p[c.BUILD]}?)?)?`),o("XRANGE",`^${p[c.GTLT]}\\s*${p[c.XRANGEPLAIN]}$`),o("XRANGELOOSE",`^${p[c.GTLT]}\\s*${p[c.XRANGEPLAINLOOSE]}$`),o("COERCE",`(^|[^\\d])(\\d{1,${m}})(?:\\.(\\d{1,${m}}))?(?:\\.(\\d{1,${m}}))?(?:$|[^\\d])`),o("COERCERTL",p[c.COERCE],!0),o("LONETILDE","(?:~>?)"),o("TILDETRIM",`(\\s*)${p[c.LONETILDE]}\\s+`,!0),v.tildeTrimReplace="$1~",o("TILDE",`^${p[c.LONETILDE]}${p[c.XRANGEPLAIN]}$`),o("TILDELOOSE",`^${p[c.LONETILDE]}${p[c.XRANGEPLAINLOOSE]}$`),o("LONECARET","(?:\\^)"),o("CARETTRIM",`(\\s*)${p[c.LONECARET]}\\s+`,!0),v.caretTrimReplace="$1^",o("CARET",`^${p[c.LONECARET]}${p[c.XRANGEPLAIN]}$`),o("CARETLOOSE",`^${p[c.LONECARET]}${p[c.XRANGEPLAINLOOSE]}$`),o("COMPARATORLOOSE",`^${p[c.GTLT]}\\s*(${p[c.LOOSEPLAIN]})$|^$`),o("COMPARATOR",`^${p[c.GTLT]}\\s*(${p[c.FULLPLAIN]})$|^$`),o("COMPARATORTRIM",`(\\s*)${p[c.GTLT]}\\s*(${p[c.LOOSEPLAIN]}|${p[c.XRANGEPLAIN]})`,!0),v.comparatorTrimReplace="$1$2$3",o("HYPHENRANGE",`^\\s*(${p[c.XRANGEPLAIN]})\\s+-\\s+(${p[c.XRANGEPLAIN]})\\s*$`),o("HYPHENRANGELOOSE",`^\\s*(${p[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${p[c.XRANGEPLAINLOOSE]})\\s*$`),o("STAR","(<|>)?=?\\s*\\*"),o("GTE0","^\\s*>=\\s*0.0.0\\s*$"),o("GTE0PRE","^\\s*>=\\s*0.0.0-0\\s*$")},8951:(w,v,s)=>{const m=s(841),i=(n,p,c)=>m(n,p,">",c);w.exports=i},6024:(w,v,s)=>{const m=s(1459),i=(n,p,c)=>(n=new m(n,c),p=new m(p,c),n.intersects(p));w.exports=i},4666:(w,v,s)=>{const m=s(841),i=(n,p,c)=>m(n,p,"<",c);w.exports=i},7530:(w,v,s)=>{const m=s(1630),i=s(1459),n=(p,c,l)=>{let o=null,u=null,h=null;try{h=new i(c,l)}catch(r){return null}return p.forEach(r=>{h.test(r)&&(!o||u.compare(r)===-1)&&(o=r,u=new m(o,l))}),o};w.exports=n},7527:(w,v,s)=>{const m=s(1630),i=s(1459),n=(p,c,l)=>{let o=null,u=null,h=null;try{h=new i(c,l)}catch(r){return null}return p.forEach(r=>{h.test(r)&&(!o||u.compare(r)===1)&&(o=r,u=new m(o,l))}),o};w.exports=n},1346:(w,v,s)=>{const m=s(1630),i=s(1459),n=s(145),p=(c,l)=>{c=new i(c,l);let o=new m("0.0.0");if(c.test(o)||(o=new m("0.0.0-0"),c.test(o)))return o;o=null;for(let u=0;u<c.set.length;++u){const h=c.set[u];let r=null;h.forEach(g=>{const d=new m(g.semver.version);switch(g.operator){case">":d.prerelease.length===0?d.patch++:d.prerelease.push(0),d.raw=d.format();case"":case">=":(!r||n(d,r))&&(r=d);break;case"<":case"<=":break;default:throw new Error(`Unexpected operation: ${g.operator}`)}}),r&&(!o||n(o,r))&&(o=r)}return o&&c.test(o)?o:null};w.exports=p},841:(w,v,s)=>{const m=s(1630),i=s(8325),{ANY:n}=i,p=s(1459),c=s(5374),l=s(145),o=s(5429),u=s(7888),h=s(9778),r=(g,d,f,b)=>{g=new m(g,b),d=new p(d,b);let y,T,_,P,x;switch(f){case">":y=l,T=u,_=o,P=">",x=">=";break;case"<":y=o,T=h,_=l,P="<",x="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(c(g,d,b))return!1;for(let E=0;E<d.set.length;++E){const A=d.set[E];let I=null,R=null;if(A.forEach(C=>{C.semver===n&&(C=new i(">=0.0.0")),I=I||C,R=R||C,y(C.semver,I.semver,b)?I=C:_(C.semver,R.semver,b)&&(R=C)}),I.operator===P||I.operator===x||(!R.operator||R.operator===P)&&T(g,R.semver))return!1;if(R.operator===x&&_(g,R.semver))return!1}return!0};w.exports=r},2277:(w,v,s)=>{const m=s(5374),i=s(9123);w.exports=(n,p,c)=>{const l=[];let o=null,u=null;const h=n.sort((f,b)=>i(f,b,c));for(const f of h)m(f,p,c)?(u=f,o||(o=f)):(u&&l.push([o,u]),u=null,o=null);o&&l.push([o,null]);const r=[];for(const[f,b]of l)f===b?r.push(f):!b&&f===h[0]?r.push("*"):b?f===h[0]?r.push(`<=${b}`):r.push(`${f} - ${b}`):r.push(`>=${f}`);const g=r.join(" || "),d=typeof p.raw=="string"?p.raw:String(p);return g.length<d.length?g:p}},8784:(w,v,s)=>{const m=s(1459),i=s(8325),{ANY:n}=i,p=s(5374),c=s(9123),l=(r,g,d={})=>{if(r===g)return!0;r=new m(r,d),g=new m(g,d);let f=!1;e:for(const b of r.set){for(const y of g.set){const T=o(b,y,d);if(f=f||T!==null,T)continue e}if(f)return!1}return!0},o=(r,g,d)=>{if(r===g)return!0;if(r.length===1&&r[0].semver===n){if(g.length===1&&g[0].semver===n)return!0;d.includePrerelease?r=[new i(">=0.0.0-0")]:r=[new i(">=0.0.0")]}if(g.length===1&&g[0].semver===n){if(d.includePrerelease)return!0;g=[new i(">=0.0.0")]}const f=new Set;let b,y;for(const R of r)R.operator===">"||R.operator===">="?b=u(b,R,d):R.operator==="<"||R.operator==="<="?y=h(y,R,d):f.add(R.semver);if(f.size>1)return null;let T;if(b&&y){if(T=c(b.semver,y.semver,d),T>0)return null;if(T===0&&(b.operator!==">="||y.operator!=="<="))return null}for(const R of f){if(b&&!p(R,String(b),d)||y&&!p(R,String(y),d))return null;for(const C of g)if(!p(R,String(C),d))return!1;return!0}let _,P,x,E,A=y&&!d.includePrerelease&&y.semver.prerelease.length?y.semver:!1,I=b&&!d.includePrerelease&&b.semver.prerelease.length?b.semver:!1;A&&A.prerelease.length===1&&y.operator==="<"&&A.prerelease[0]===0&&(A=!1);for(const R of g){if(E=E||R.operator===">"||R.operator===">=",x=x||R.operator==="<"||R.operator==="<=",b){if(I&&R.semver.prerelease&&R.semver.prerelease.length&&R.semver.major===I.major&&R.semver.minor===I.minor&&R.semver.patch===I.patch&&(I=!1),R.operator===">"||R.operator===">="){if(_=u(b,R,d),_===R&&_!==b)return!1}else if(b.operator===">="&&!p(b.semver,String(R),d))return!1}if(y){if(A&&R.semver.prerelease&&R.semver.prerelease.length&&R.semver.major===A.major&&R.semver.minor===A.minor&&R.semver.patch===A.patch&&(A=!1),R.operator==="<"||R.operator==="<="){if(P=h(y,R,d),P===R&&P!==y)return!1}else if(y.operator==="<="&&!p(y.semver,String(R),d))return!1}if(!R.operator&&(y||b)&&T!==0)return!1}return!(b&&x&&!y&&T!==0||y&&E&&!b&&T!==0||I||A)},u=(r,g,d)=>{if(!r)return g;const f=c(r.semver,g.semver,d);return f>0?r:f<0||g.operator===">"&&r.operator===">="?g:r},h=(r,g,d)=>{if(!r)return g;const f=c(r.semver,g.semver,d);return f<0?r:f>0||g.operator==="<"&&r.operator==="<="?g:r};w.exports=l},6607:(w,v,s)=>{const m=s(1459),i=(n,p)=>new m(n,p).set.map(c=>c.map(l=>l.value).join(" ").trim().split(" "));w.exports=i},3478:(w,v,s)=>{const m=s(1459),i=(n,p)=>{try{return new m(n,p).range||"*"}catch(c){return null}};w.exports=i},45:w=>{"use strict";w.exports=function(v){v.prototype[Symbol.iterator]=function*(){for(let s=this.head;s;s=s.next)yield s.value}}},6049:(w,v,s)=>{"use strict";w.exports=m,m.Node=c,m.create=m;function m(l){var o=this;if(o instanceof m||(o=new m),o.tail=null,o.head=null,o.length=0,l&&typeof l.forEach=="function")l.forEach(function(r){o.push(r)});else if(arguments.length>0)for(var u=0,h=arguments.length;u<h;u++)o.push(arguments[u]);return o}m.prototype.removeNode=function(l){if(l.list!==this)throw new Error("removing node which does not belong to this list");var o=l.next,u=l.prev;return o&&(o.prev=u),u&&(u.next=o),l===this.head&&(this.head=o),l===this.tail&&(this.tail=u),l.list.length--,l.next=null,l.prev=null,l.list=null,o},m.prototype.unshiftNode=function(l){if(l!==this.head){l.list&&l.list.removeNode(l);var o=this.head;l.list=this,l.next=o,o&&(o.prev=l),this.head=l,this.tail||(this.tail=l),this.length++}},m.prototype.pushNode=function(l){if(l!==this.tail){l.list&&l.list.removeNode(l);var o=this.tail;l.list=this,l.prev=o,o&&(o.next=l),this.tail=l,this.head||(this.head=l),this.length++}},m.prototype.push=function(){for(var l=0,o=arguments.length;l<o;l++)n(this,arguments[l]);return this.length},m.prototype.unshift=function(){for(var l=0,o=arguments.length;l<o;l++)p(this,arguments[l]);return this.length},m.prototype.pop=function(){if(!!this.tail){var l=this.tail.value;return this.tail=this.tail.prev,this.tail?this.tail.next=null:this.head=null,this.length--,l}},m.prototype.shift=function(){if(!!this.head){var l=this.head.value;return this.head=this.head.next,this.head?this.head.prev=null:this.tail=null,this.length--,l}},m.prototype.forEach=function(l,o){o=o||this;for(var u=this.head,h=0;u!==null;h++)l.call(o,u.value,h,this),u=u.next},m.prototype.forEachReverse=function(l,o){o=o||this;for(var u=this.tail,h=this.length-1;u!==null;h--)l.call(o,u.value,h,this),u=u.prev},m.prototype.get=function(l){for(var o=0,u=this.head;u!==null&&o<l;o++)u=u.next;if(o===l&&u!==null)return u.value},m.prototype.getReverse=function(l){for(var o=0,u=this.tail;u!==null&&o<l;o++)u=u.prev;if(o===l&&u!==null)return u.value},m.prototype.map=function(l,o){o=o||this;for(var u=new m,h=this.head;h!==null;)u.push(l.call(o,h.value,this)),h=h.next;return u},m.prototype.mapReverse=function(l,o){o=o||this;for(var u=new m,h=this.tail;h!==null;)u.push(l.call(o,h.value,this)),h=h.prev;return u},m.prototype.reduce=function(l,o){var u,h=this.head;if(arguments.length>1)u=o;else if(this.head)h=this.head.next,u=this.head.value;else throw new TypeError("Reduce of empty list with no initial value");for(var r=0;h!==null;r++)u=l(u,h.value,r),h=h.next;return u},m.prototype.reduceReverse=function(l,o){var u,h=this.tail;if(arguments.length>1)u=o;else if(this.tail)h=this.tail.prev,u=this.tail.value;else throw new TypeError("Reduce of empty list with no initial value");for(var r=this.length-1;h!==null;r--)u=l(u,h.value,r),h=h.prev;return u},m.prototype.toArray=function(){for(var l=new Array(this.length),o=0,u=this.head;u!==null;o++)l[o]=u.value,u=u.next;return l},m.prototype.toArrayReverse=function(){for(var l=new Array(this.length),o=0,u=this.tail;u!==null;o++)l[o]=u.value,u=u.prev;return l},m.prototype.slice=function(l,o){o=o||this.length,o<0&&(o+=this.length),l=l||0,l<0&&(l+=this.length);var u=new m;if(o<l||o<0)return u;l<0&&(l=0),o>this.length&&(o=this.length);for(var h=0,r=this.head;r!==null&&h<l;h++)r=r.next;for(;r!==null&&h<o;h++,r=r.next)u.push(r.value);return u},m.prototype.sliceReverse=function(l,o){o=o||this.length,o<0&&(o+=this.length),l=l||0,l<0&&(l+=this.length);var u=new m;if(o<l||o<0)return u;l<0&&(l=0),o>this.length&&(o=this.length);for(var h=this.length,r=this.tail;r!==null&&h>o;h--)r=r.prev;for(;r!==null&&h>l;h--,r=r.prev)u.push(r.value);return u},m.prototype.splice=function(l,o,...u){l>this.length&&(l=this.length-1),l<0&&(l=this.length+l);for(var h=0,r=this.head;r!==null&&h<l;h++)r=r.next;for(var g=[],h=0;r&&h<o;h++)g.push(r.value),r=this.removeNode(r);r===null&&(r=this.tail),r!==this.head&&r!==this.tail&&(r=r.prev);for(var h=0;h<u.length;h++)r=i(this,r,u[h]);return g},m.prototype.reverse=function(){for(var l=this.head,o=this.tail,u=l;u!==null;u=u.prev){var h=u.prev;u.prev=u.next,u.next=h}return this.head=o,this.tail=l,this};function i(l,o,u){var h=o===l.head?new c(u,null,o,l):new c(u,o,o.next,l);return h.next===null&&(l.tail=h),h.prev===null&&(l.head=h),l.length++,h}function n(l,o){l.tail=new c(o,l.tail,null,l),l.head||(l.head=l.tail),l.length++}function p(l,o){l.head=new c(o,null,l.head,l),l.tail||(l.tail=l.head),l.length++}function c(l,o,u,h){if(!(this instanceof c))return new c(l,o,u,h);this.list=h,this.value=l,o?(o.next=this,this.prev=o):this.prev=null,u?(u.prev=this,this.next=u):this.next=null}try{s(45)(m)}catch(l){}},9737:()=>{+function(w){"use strict";var v=".dropdown-backdrop",s='[data-toggle="dropdown"]',m=function(l){w(l).on("click.bs.dropdown",this.toggle)};m.VERSION="3.4.1";function i(l){var o=l.attr("data-target");o||(o=l.attr("href"),o=o&&/#[A-Za-z]/.test(o)&&o.replace(/.*(?=#[^\s]*$)/,""));var u=o!=="#"?w(document).find(o):null;return u&&u.length?u:l.parent()}function n(l){l&&l.which===3||(w(v).remove(),w(s).each(function(){var o=w(this),u=i(o),h={relatedTarget:this};!u.hasClass("open")||l&&l.type=="click"&&/input|textarea/i.test(l.target.tagName)&&w.contains(u[0],l.target)||(u.trigger(l=w.Event("hide.bs.dropdown",h)),!l.isDefaultPrevented()&&(o.attr("aria-expanded","false"),u.removeClass("open").trigger(w.Event("hidden.bs.dropdown",h))))}))}m.prototype.toggle=function(l){var o=w(this);if(!o.is(".disabled, :disabled")){var u=i(o),h=u.hasClass("open");if(n(),!h){"ontouchstart"in document.documentElement&&!u.closest(".navbar-nav").length&&w(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(w(this)).on("click",n);var r={relatedTarget:this};if(u.trigger(l=w.Event("show.bs.dropdown",r)),l.isDefaultPrevented())return;o.trigger("focus").attr("aria-expanded","true"),u.toggleClass("open").trigger(w.Event("shown.bs.dropdown",r))}return!1}},m.prototype.keydown=function(l){if(!(!/(38|40|27|32)/.test(l.which)||/input|textarea/i.test(l.target.tagName))){var o=w(this);if(l.preventDefault(),l.stopPropagation(),!o.is(".disabled, :disabled")){var u=i(o),h=u.hasClass("open");if(!h&&l.which!=27||h&&l.which==27)return l.which==27&&u.find(s).trigger("focus"),o.trigger("click");var r=" li:not(.disabled):visible a",g=u.find(".dropdown-menu"+r);if(!!g.length){var d=g.index(l.target);l.which==38&&d>0&&d--,l.which==40&&d<g.length-1&&d++,~d||(d=0),g.eq(d).trigger("focus")}}}};function p(l){return this.each(function(){var o=w(this),u=o.data("bs.dropdown");u||o.data("bs.dropdown",u=new m(this)),typeof l=="string"&&u[l].call(o)})}var c=w.fn.dropdown;w.fn.dropdown=p,w.fn.dropdown.Constructor=m,w.fn.dropdown.noConflict=function(){return w.fn.dropdown=c,this},w(document).on("click.bs.dropdown.data-api",n).on("click.bs.dropdown.data-api",".dropdown form",function(l){l.stopPropagation()}).on("click.bs.dropdown.data-api",s,m.prototype.toggle).on("keydown.bs.dropdown.data-api",s,m.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",m.prototype.keydown)}(jQuery)},6927:()=>{+function(w){"use strict";var v=function(i,n){this.init("popover",i,n)};if(!w.fn.tooltip)throw new Error("Popover requires tooltip.js");v.VERSION="3.4.1",v.DEFAULTS=w.extend({},w.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),v.prototype=w.extend({},w.fn.tooltip.Constructor.prototype),v.prototype.constructor=v,v.prototype.getDefaults=function(){return v.DEFAULTS},v.prototype.setContent=function(){var i=this.tip(),n=this.getTitle(),p=this.getContent();if(this.options.html){var c=typeof p;this.options.sanitize&&(n=this.sanitizeHtml(n),c==="string"&&(p=this.sanitizeHtml(p))),i.find(".popover-title").html(n),i.find(".popover-content").children().detach().end()[c==="string"?"html":"append"](p)}else i.find(".popover-title").text(n),i.find(".popover-content").children().detach().end().text(p);i.removeClass("fade top bottom left right in"),i.find(".popover-title").html()||i.find(".popover-title").hide()},v.prototype.hasContent=function(){return this.getTitle()||this.getContent()},v.prototype.getContent=function(){var i=this.$element,n=this.options;return i.attr("data-content")||(typeof n.content=="function"?n.content.call(i[0]):n.content)},v.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};function s(i){return this.each(function(){var n=w(this),p=n.data("bs.popover"),c=typeof i=="object"&&i;!p&&/destroy|hide/.test(i)||(p||n.data("bs.popover",p=new v(this,c)),typeof i=="string"&&p[i]())})}var m=w.fn.popover;w.fn.popover=s,w.fn.popover.Constructor=v,w.fn.popover.noConflict=function(){return w.fn.popover=m,this}}(jQuery)},3497:()=>{+function(w){"use strict";function v(i,n){this.$body=w(document.body),this.$scrollElement=w(i).is(document.body)?w(window):w(i),this.options=w.extend({},v.DEFAULTS,n),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",w.proxy(this.process,this)),this.refresh(),this.process()}v.VERSION="3.4.1",v.DEFAULTS={offset:10},v.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},v.prototype.refresh=function(){var i=this,n="offset",p=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),w.isWindow(this.$scrollElement[0])||(n="position",p=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var c=w(this),l=c.data("target")||c.attr("href"),o=/^#./.test(l)&&w(l);return o&&o.length&&o.is(":visible")&&[[o[n]().top+p,l]]||null}).sort(function(c,l){return c[0]-l[0]}).each(function(){i.offsets.push(this[0]),i.targets.push(this[1])})},v.prototype.process=function(){var i=this.$scrollElement.scrollTop()+this.options.offset,n=this.getScrollHeight(),p=this.options.offset+n-this.$scrollElement.height(),c=this.offsets,l=this.targets,o=this.activeTarget,u;if(this.scrollHeight!=n&&this.refresh(),i>=p)return o!=(u=l[l.length-1])&&this.activate(u);if(o&&i<c[0])return this.activeTarget=null,this.clear();for(u=c.length;u--;)o!=l[u]&&i>=c[u]&&(c[u+1]===void 0||i<c[u+1])&&this.activate(l[u])},v.prototype.activate=function(i){this.activeTarget=i,this.clear();var n=this.selector+'[data-target="'+i+'"],'+this.selector+'[href="'+i+'"]',p=w(n).parents("li").addClass("active");p.parent(".dropdown-menu").length&&(p=p.closest("li.dropdown").addClass("active")),p.trigger("activate.bs.scrollspy")},v.prototype.clear=function(){w(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};function s(i){return this.each(function(){var n=w(this),p=n.data("bs.scrollspy"),c=typeof i=="object"&&i;p||n.data("bs.scrollspy",p=new v(this,c)),typeof i=="string"&&p[i]()})}var m=w.fn.scrollspy;w.fn.scrollspy=s,w.fn.scrollspy.Constructor=v,w.fn.scrollspy.noConflict=function(){return w.fn.scrollspy=m,this},w(window).on("load.bs.scrollspy.data-api",function(){w('[data-spy="scroll"]').each(function(){var i=w(this);s.call(i,i.data())})})}(jQuery)},7814:()=>{+function(w){"use strict";var v=function(n){this.element=w(n)};v.VERSION="3.4.1",v.TRANSITION_DURATION=150,v.prototype.show=function(){var n=this.element,p=n.closest("ul:not(.dropdown-menu)"),c=n.data("target");if(c||(c=n.attr("href"),c=c&&c.replace(/.*(?=#[^\s]*$)/,"")),!n.parent("li").hasClass("active")){var l=p.find(".active:last a"),o=w.Event("hide.bs.tab",{relatedTarget:n[0]}),u=w.Event("show.bs.tab",{relatedTarget:l[0]});if(l.trigger(o),n.trigger(u),!(u.isDefaultPrevented()||o.isDefaultPrevented())){var h=w(document).find(c);this.activate(n.closest("li"),p),this.activate(h,h.parent(),function(){l.trigger({type:"hidden.bs.tab",relatedTarget:n[0]}),n.trigger({type:"shown.bs.tab",relatedTarget:l[0]})})}}},v.prototype.activate=function(n,p,c){var l=p.find("> .active"),o=c&&w.support.transition&&(l.length&&l.hasClass("fade")||!!p.find("> .fade").length);function u(){l.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),n.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),o?(n[0].offsetWidth,n.addClass("in")):n.removeClass("fade"),n.parent(".dropdown-menu").length&&n.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),c&&c()}l.length&&o?l.one("bsTransitionEnd",u).emulateTransitionEnd(v.TRANSITION_DURATION):u(),l.removeClass("in")};function s(n){return this.each(function(){var p=w(this),c=p.data("bs.tab");c||p.data("bs.tab",c=new v(this)),typeof n=="string"&&c[n]()})}var m=w.fn.tab;w.fn.tab=s,w.fn.tab.Constructor=v,w.fn.tab.noConflict=function(){return w.fn.tab=m,this};var i=function(n){n.preventDefault(),s.call(w(this),"show")};w(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',i).on("click.bs.tab.data-api",'[data-toggle="pill"]',i)}(jQuery)},6278:()=>{+function(w){"use strict";var v=["sanitize","whiteList","sanitizeFn"],s=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],m=/^aria-[\w-]*$/i,i={"*":["class","dir","id","lang","role",m],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},n=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,p=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function c(r,g){var d=r.nodeName.toLowerCase();if(w.inArray(d,g)!==-1)return w.inArray(d,s)!==-1?Boolean(r.nodeValue.match(n)||r.nodeValue.match(p)):!0;for(var f=w(g).filter(function(T,_){return _ instanceof RegExp}),b=0,y=f.length;b<y;b++)if(d.match(f[b]))return!0;return!1}function l(r,g,d){if(r.length===0)return r;if(d&&typeof d=="function")return d(r);if(!document.implementation||!document.implementation.createHTMLDocument)return r;var f=document.implementation.createHTMLDocument("sanitization");f.body.innerHTML=r;for(var b=w.map(g,function(C,D){return D}),y=w(f.body).find("*"),T=0,_=y.length;T<_;T++){var P=y[T],x=P.nodeName.toLowerCase();if(w.inArray(x,b)===-1){P.parentNode.removeChild(P);continue}for(var E=w.map(P.attributes,function(C){return C}),A=[].concat(g["*"]||[],g[x]||[]),I=0,R=E.length;I<R;I++)c(E[I],A)||P.removeAttribute(E[I].nodeName)}return f.body.innerHTML}var o=function(r,g){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",r,g)};o.VERSION="3.4.1",o.TRANSITION_DURATION=150,o.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0},sanitize:!0,sanitizeFn:null,whiteList:i},o.prototype.init=function(r,g,d){if(this.enabled=!0,this.type=r,this.$element=w(g),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&w(document).find(w.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var f=this.options.trigger.split(" "),b=f.length;b--;){var y=f[b];if(y=="click")this.$element.on("click."+this.type,this.options.selector,w.proxy(this.toggle,this));else if(y!="manual"){var T=y=="hover"?"mouseenter":"focusin",_=y=="hover"?"mouseleave":"focusout";this.$element.on(T+"."+this.type,this.options.selector,w.proxy(this.enter,this)),this.$element.on(_+"."+this.type,this.options.selector,w.proxy(this.leave,this))}}this.options.selector?this._options=w.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},o.prototype.getDefaults=function(){return o.DEFAULTS},o.prototype.getOptions=function(r){var g=this.$element.data();for(var d in g)g.hasOwnProperty(d)&&w.inArray(d,v)!==-1&&delete g[d];return r=w.extend({},this.getDefaults(),g,r),r.delay&&typeof r.delay=="number"&&(r.delay={show:r.delay,hide:r.delay}),r.sanitize&&(r.template=l(r.template,r.whiteList,r.sanitizeFn)),r},o.prototype.getDelegateOptions=function(){var r={},g=this.getDefaults();return this._options&&w.each(this._options,function(d,f){g[d]!=f&&(r[d]=f)}),r},o.prototype.enter=function(r){var g=r instanceof this.constructor?r:w(r.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(r.currentTarget,this.getDelegateOptions()),w(r.currentTarget).data("bs."+this.type,g)),r instanceof w.Event&&(g.inState[r.type=="focusin"?"focus":"hover"]=!0),g.tip().hasClass("in")||g.hoverState=="in"){g.hoverState="in";return}if(clearTimeout(g.timeout),g.hoverState="in",!g.options.delay||!g.options.delay.show)return g.show();g.timeout=setTimeout(function(){g.hoverState=="in"&&g.show()},g.options.delay.show)},o.prototype.isInStateTrue=function(){for(var r in this.inState)if(this.inState[r])return!0;return!1},o.prototype.leave=function(r){var g=r instanceof this.constructor?r:w(r.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(r.currentTarget,this.getDelegateOptions()),w(r.currentTarget).data("bs."+this.type,g)),r instanceof w.Event&&(g.inState[r.type=="focusout"?"focus":"hover"]=!1),!g.isInStateTrue()){if(clearTimeout(g.timeout),g.hoverState="out",!g.options.delay||!g.options.delay.hide)return g.hide();g.timeout=setTimeout(function(){g.hoverState=="out"&&g.hide()},g.options.delay.hide)}},o.prototype.show=function(){var r=w.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(r);var g=w.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(r.isDefaultPrevented()||!g)return;var d=this,f=this.tip(),b=this.getUID(this.type);this.setContent(),f.attr("id",b),this.$element.attr("aria-describedby",b),this.options.animation&&f.addClass("fade");var y=typeof this.options.placement=="function"?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,T=/\s?auto?\s?/i,_=T.test(y);_&&(y=y.replace(T,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(y).data("bs."+this.type,this),this.options.container?f.appendTo(w(document).find(this.options.container)):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var P=this.getPosition(),x=f[0].offsetWidth,E=f[0].offsetHeight;if(_){var A=y,I=this.getPosition(this.$viewport);y=y=="bottom"&&P.bottom+E>I.bottom?"top":y=="top"&&P.top-E<I.top?"bottom":y=="right"&&P.right+x>I.width?"left":y=="left"&&P.left-x<I.left?"right":y,f.removeClass(A).addClass(y)}var R=this.getCalculatedOffset(y,P,x,E);this.applyPlacement(R,y);var C=function(){var D=d.hoverState;d.$element.trigger("shown.bs."+d.type),d.hoverState=null,D=="out"&&d.leave(d)};w.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",C).emulateTransitionEnd(o.TRANSITION_DURATION):C()}},o.prototype.applyPlacement=function(r,g){var d=this.tip(),f=d[0].offsetWidth,b=d[0].offsetHeight,y=parseInt(d.css("margin-top"),10),T=parseInt(d.css("margin-left"),10);isNaN(y)&&(y=0),isNaN(T)&&(T=0),r.top+=y,r.left+=T,w.offset.setOffset(d[0],w.extend({using:function(R){d.css({top:Math.round(R.top),left:Math.round(R.left)})}},r),0),d.addClass("in");var _=d[0].offsetWidth,P=d[0].offsetHeight;g=="top"&&P!=b&&(r.top=r.top+b-P);var x=this.getViewportAdjustedDelta(g,r,_,P);x.left?r.left+=x.left:r.top+=x.top;var E=/top|bottom/.test(g),A=E?x.left*2-f+_:x.top*2-b+P,I=E?"offsetWidth":"offsetHeight";d.offset(r),this.replaceArrow(A,d[0][I],E)},o.prototype.replaceArrow=function(r,g,d){this.arrow().css(d?"left":"top",50*(1-r/g)+"%").css(d?"top":"left","")},o.prototype.setContent=function(){var r=this.tip(),g=this.getTitle();this.options.html?(this.options.sanitize&&(g=l(g,this.options.whiteList,this.options.sanitizeFn)),r.find(".tooltip-inner").html(g)):r.find(".tooltip-inner").text(g),r.removeClass("fade in top bottom left right")},o.prototype.hide=function(r){var g=this,d=w(this.$tip),f=w.Event("hide.bs."+this.type);function b(){g.hoverState!="in"&&d.detach(),g.$element&&g.$element.removeAttr("aria-describedby").trigger("hidden.bs."+g.type),r&&r()}if(this.$element.trigger(f),!f.isDefaultPrevented())return d.removeClass("in"),w.support.transition&&d.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(o.TRANSITION_DURATION):b(),this.hoverState=null,this},o.prototype.fixTitle=function(){var r=this.$element;(r.attr("title")||typeof r.attr("data-original-title")!="string")&&r.attr("data-original-title",r.attr("title")||"").attr("title","")},o.prototype.hasContent=function(){return this.getTitle()},o.prototype.getPosition=function(r){r=r||this.$element;var g=r[0],d=g.tagName=="BODY",f=g.getBoundingClientRect();f.width==null&&(f=w.extend({},f,{width:f.right-f.left,height:f.bottom-f.top}));var b=window.SVGElement&&g instanceof window.SVGElement,y=d?{top:0,left:0}:b?null:r.offset(),T={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:r.scrollTop()},_=d?{width:w(window).width(),height:w(window).height()}:null;return w.extend({},f,T,_,y)},o.prototype.getCalculatedOffset=function(r,g,d,f){return r=="bottom"?{top:g.top+g.height,left:g.left+g.width/2-d/2}:r=="top"?{top:g.top-f,left:g.left+g.width/2-d/2}:r=="left"?{top:g.top+g.height/2-f/2,left:g.left-d}:{top:g.top+g.height/2-f/2,left:g.left+g.width}},o.prototype.getViewportAdjustedDelta=function(r,g,d,f){var b={top:0,left:0};if(!this.$viewport)return b;var y=this.options.viewport&&this.options.viewport.padding||0,T=this.getPosition(this.$viewport);if(/right|left/.test(r)){var _=g.top-y-T.scroll,P=g.top+y-T.scroll+f;_<T.top?b.top=T.top-_:P>T.top+T.height&&(b.top=T.top+T.height-P)}else{var x=g.left-y,E=g.left+y+d;x<T.left?b.left=T.left-x:E>T.right&&(b.left=T.left+T.width-E)}return b},o.prototype.getTitle=function(){var r,g=this.$element,d=this.options;return r=g.attr("data-original-title")||(typeof d.title=="function"?d.title.call(g[0]):d.title),r},o.prototype.getUID=function(r){do r+=~~(Math.random()*1e6);while(document.getElementById(r));return r},o.prototype.tip=function(){if(!this.$tip&&(this.$tip=w(this.options.template),this.$tip.length!=1))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},o.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},o.prototype.enable=function(){this.enabled=!0},o.prototype.disable=function(){this.enabled=!1},o.prototype.toggleEnabled=function(){this.enabled=!this.enabled},o.prototype.toggle=function(r){var g=this;r&&(g=w(r.currentTarget).data("bs."+this.type),g||(g=new this.constructor(r.currentTarget,this.getDelegateOptions()),w(r.currentTarget).data("bs."+this.type,g))),r?(g.inState.click=!g.inState.click,g.isInStateTrue()?g.enter(g):g.leave(g)):g.tip().hasClass("in")?g.leave(g):g.enter(g)},o.prototype.destroy=function(){var r=this;clearTimeout(this.timeout),this.hide(function(){r.$element.off("."+r.type).removeData("bs."+r.type),r.$tip&&r.$tip.detach(),r.$tip=null,r.$arrow=null,r.$viewport=null,r.$element=null})},o.prototype.sanitizeHtml=function(r){return l(r,this.options.whiteList,this.options.sanitizeFn)};function u(r){return this.each(function(){var g=w(this),d=g.data("bs.tooltip"),f=typeof r=="object"&&r;!d&&/destroy|hide/.test(r)||(d||g.data("bs.tooltip",d=new o(this,f)),typeof r=="string"&&d[r]())})}var h=w.fn.tooltip;w.fn.tooltip=u,w.fn.tooltip.Constructor=o,w.fn.tooltip.noConflict=function(){return w.fn.tooltip=h,this}}(jQuery)},2027:w=>{var v=function(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32},s=-1,m=1,i=0;v.Diff=function(n,p){return[n,p]},v.prototype.diff_main=function(n,p,c,l){typeof l=="undefined"&&(this.Diff_Timeout<=0?l=Number.MAX_VALUE:l=new Date().getTime()+this.Diff_Timeout*1e3);var o=l;if(n==null||p==null)throw new Error("Null input. (diff_main)");if(n==p)return n?[new v.Diff(i,n)]:[];typeof c=="undefined"&&(c=!0);var u=c,h=this.diff_commonPrefix(n,p),r=n.substring(0,h);n=n.substring(h),p=p.substring(h),h=this.diff_commonSuffix(n,p);var g=n.substring(n.length-h);n=n.substring(0,n.length-h),p=p.substring(0,p.length-h);var d=this.diff_compute_(n,p,u,o);return r&&d.unshift(new v.Diff(i,r)),g&&d.push(new v.Diff(i,g)),this.diff_cleanupMerge(d),d},v.prototype.diff_compute_=function(n,p,c,l){var o;if(!n)return[new v.Diff(m,p)];if(!p)return[new v.Diff(s,n)];var u=n.length>p.length?n:p,h=n.length>p.length?p:n,r=u.indexOf(h);if(r!=-1)return o=[new v.Diff(m,u.substring(0,r)),new v.Diff(i,h),new v.Diff(m,u.substring(r+h.length))],n.length>p.length&&(o[0][0]=o[2][0]=s),o;if(h.length==1)return[new v.Diff(s,n),new v.Diff(m,p)];var g=this.diff_halfMatch_(n,p);if(g){var d=g[0],f=g[1],b=g[2],y=g[3],T=g[4],_=this.diff_main(d,b,c,l),P=this.diff_main(f,y,c,l);return _.concat([new v.Diff(i,T)],P)}return c&&n.length>100&&p.length>100?this.diff_lineMode_(n,p,l):this.diff_bisect_(n,p,l)},v.prototype.diff_lineMode_=function(n,p,c){var l=this.diff_linesToChars_(n,p);n=l.chars1,p=l.chars2;var o=l.lineArray,u=this.diff_main(n,p,!1,c);this.diff_charsToLines_(u,o),this.diff_cleanupSemantic(u),u.push(new v.Diff(i,""));for(var h=0,r=0,g=0,d="",f="";h<u.length;){switch(u[h][0]){case m:g++,f+=u[h][1];break;case s:r++,d+=u[h][1];break;case i:if(r>=1&&g>=1){u.splice(h-r-g,r+g),h=h-r-g;for(var b=this.diff_main(d,f,!1,c),y=b.length-1;y>=0;y--)u.splice(h,0,b[y]);h=h+b.length}g=0,r=0,d="",f="";break}h++}return u.pop(),u},v.prototype.diff_bisect_=function(n,p,c){for(var l=n.length,o=p.length,u=Math.ceil((l+o)/2),h=u,r=2*u,g=new Array(r),d=new Array(r),f=0;f<r;f++)g[f]=-1,d[f]=-1;g[h+1]=0,d[h+1]=0;for(var b=l-o,y=b%2!=0,T=0,_=0,P=0,x=0,E=0;E<u&&!(new Date().getTime()>c);E++){for(var A=-E+T;A<=E-_;A+=2){var I=h+A,R;A==-E||A!=E&&g[I-1]<g[I+1]?R=g[I+1]:R=g[I-1]+1;for(var C=R-A;R<l&&C<o&&n.charAt(R)==p.charAt(C);)R++,C++;if(g[I]=R,R>l)_+=2;else if(C>o)T+=2;else if(y){var D=h+b-A;if(D>=0&&D<r&&d[D]!=-1){var M=l-d[D];if(R>=M)return this.diff_bisectSplit_(n,p,R,C,c)}}}for(var B=-E+P;B<=E-x;B+=2){var D=h+B,M;B==-E||B!=E&&d[D-1]<d[D+1]?M=d[D+1]:M=d[D-1]+1;for(var k=M-B;M<l&&k<o&&n.charAt(l-M-1)==p.charAt(o-k-1);)M++,k++;if(d[D]=M,M>l)x+=2;else if(k>o)P+=2;else if(!y){var I=h+b-B;if(I>=0&&I<r&&g[I]!=-1){var R=g[I],C=h+R-I;if(M=l-M,R>=M)return this.diff_bisectSplit_(n,p,R,C,c)}}}}return[new v.Diff(s,n),new v.Diff(m,p)]},v.prototype.diff_bisectSplit_=function(n,p,c,l,o){var u=n.substring(0,c),h=p.substring(0,l),r=n.substring(c),g=p.substring(l),d=this.diff_main(u,h,!1,o),f=this.diff_main(r,g,!1,o);return d.concat(f)},v.prototype.diff_linesToChars_=function(n,p){var c=[],l={};c[0]="";function o(g){for(var d="",f=0,b=-1,y=c.length;b<g.length-1;){b=g.indexOf(`
`,f),b==-1&&(b=g.length-1);var T=g.substring(f,b+1);(l.hasOwnProperty?l.hasOwnProperty(T):l[T]!==void 0)?d+=String.fromCharCode(l[T]):(y==u&&(T=g.substring(f),b=g.length),d+=String.fromCharCode(y),l[T]=y,c[y++]=T),f=b+1}return d}var u=4e4,h=o(n);u=65535;var r=o(p);return{chars1:h,chars2:r,lineArray:c}},v.prototype.diff_charsToLines_=function(n,p){for(var c=0;c<n.length;c++){for(var l=n[c][1],o=[],u=0;u<l.length;u++)o[u]=p[l.charCodeAt(u)];n[c][1]=o.join("")}},v.prototype.diff_commonPrefix=function(n,p){if(!n||!p||n.charAt(0)!=p.charAt(0))return 0;for(var c=0,l=Math.min(n.length,p.length),o=l,u=0;c<o;)n.substring(u,o)==p.substring(u,o)?(c=o,u=c):l=o,o=Math.floor((l-c)/2+c);return o},v.prototype.diff_commonSuffix=function(n,p){if(!n||!p||n.charAt(n.length-1)!=p.charAt(p.length-1))return 0;for(var c=0,l=Math.min(n.length,p.length),o=l,u=0;c<o;)n.substring(n.length-o,n.length-u)==p.substring(p.length-o,p.length-u)?(c=o,u=c):l=o,o=Math.floor((l-c)/2+c);return o},v.prototype.diff_commonOverlap_=function(n,p){var c=n.length,l=p.length;if(c==0||l==0)return 0;c>l?n=n.substring(c-l):c<l&&(p=p.substring(0,c));var o=Math.min(c,l);if(n==p)return o;for(var u=0,h=1;;){var r=n.substring(o-h),g=p.indexOf(r);if(g==-1)return u;h+=g,(g==0||n.substring(o-h)==p.substring(0,h))&&(u=h,h++)}},v.prototype.diff_halfMatch_=function(n,p){if(this.Diff_Timeout<=0)return null;var c=n.length>p.length?n:p,l=n.length>p.length?p:n;if(c.length<4||l.length*2<c.length)return null;var o=this;function u(_,P,x){for(var E=_.substring(x,x+Math.floor(_.length/4)),A=-1,I="",R,C,D,M;(A=P.indexOf(E,A+1))!=-1;){var B=o.diff_commonPrefix(_.substring(x),P.substring(A)),k=o.diff_commonSuffix(_.substring(0,x),P.substring(0,A));I.length<k+B&&(I=P.substring(A-k,A)+P.substring(A,A+B),R=_.substring(0,x-k),C=_.substring(x+B),D=P.substring(0,A-k),M=P.substring(A+B))}return I.length*2>=_.length?[R,C,D,M,I]:null}var h=u(c,l,Math.ceil(c.length/4)),r=u(c,l,Math.ceil(c.length/2)),g;if(!h&&!r)return null;r?h?g=h[4].length>r[4].length?h:r:g=r:g=h;var d,f,b,y;n.length>p.length?(d=g[0],f=g[1],b=g[2],y=g[3]):(b=g[0],y=g[1],d=g[2],f=g[3]);var T=g[4];return[d,f,b,y,T]},v.prototype.diff_cleanupSemantic=function(n){for(var p=!1,c=[],l=0,o=null,u=0,h=0,r=0,g=0,d=0;u<n.length;)n[u][0]==i?(c[l++]=u,h=g,r=d,g=0,d=0,o=n[u][1]):(n[u][0]==m?g+=n[u][1].length:d+=n[u][1].length,o&&o.length<=Math.max(h,r)&&o.length<=Math.max(g,d)&&(n.splice(c[l-1],0,new v.Diff(s,o)),n[c[l-1]+1][0]=m,l--,l--,u=l>0?c[l-1]:-1,h=0,r=0,g=0,d=0,o=null,p=!0)),u++;for(p&&this.diff_cleanupMerge(n),this.diff_cleanupSemanticLossless(n),u=1;u<n.length;){if(n[u-1][0]==s&&n[u][0]==m){var f=n[u-1][1],b=n[u][1],y=this.diff_commonOverlap_(f,b),T=this.diff_commonOverlap_(b,f);y>=T?(y>=f.length/2||y>=b.length/2)&&(n.splice(u,0,new v.Diff(i,b.substring(0,y))),n[u-1][1]=f.substring(0,f.length-y),n[u+1][1]=b.substring(y),u++):(T>=f.length/2||T>=b.length/2)&&(n.splice(u,0,new v.Diff(i,f.substring(0,T))),n[u-1][0]=m,n[u-1][1]=b.substring(0,b.length-T),n[u+1][0]=s,n[u+1][1]=f.substring(T),u++),u++}u++}},v.prototype.diff_cleanupSemanticLossless=function(n){function p(T,_){if(!T||!_)return 6;var P=T.charAt(T.length-1),x=_.charAt(0),E=P.match(v.nonAlphaNumericRegex_),A=x.match(v.nonAlphaNumericRegex_),I=E&&P.match(v.whitespaceRegex_),R=A&&x.match(v.whitespaceRegex_),C=I&&P.match(v.linebreakRegex_),D=R&&x.match(v.linebreakRegex_),M=C&&T.match(v.blanklineEndRegex_),B=D&&_.match(v.blanklineStartRegex_);return M||B?5:C||D?4:E&&!I&&R?3:I||R?2:E||A?1:0}for(var c=1;c<n.length-1;){if(n[c-1][0]==i&&n[c+1][0]==i){var l=n[c-1][1],o=n[c][1],u=n[c+1][1],h=this.diff_commonSuffix(l,o);if(h){var r=o.substring(o.length-h);l=l.substring(0,l.length-h),o=r+o.substring(0,o.length-h),u=r+u}for(var g=l,d=o,f=u,b=p(l,o)+p(o,u);o.charAt(0)===u.charAt(0);){l+=o.charAt(0),o=o.substring(1)+u.charAt(0),u=u.substring(1);var y=p(l,o)+p(o,u);y>=b&&(b=y,g=l,d=o,f=u)}n[c-1][1]!=g&&(g?n[c-1][1]=g:(n.splice(c-1,1),c--),n[c][1]=d,f?n[c+1][1]=f:(n.splice(c+1,1),c--))}c++}},v.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/,v.whitespaceRegex_=/\s/,v.linebreakRegex_=/[\r\n]/,v.blanklineEndRegex_=/\n\r?\n$/,v.blanklineStartRegex_=/^\r?\n\r?\n/,v.prototype.diff_cleanupEfficiency=function(n){for(var p=!1,c=[],l=0,o=null,u=0,h=!1,r=!1,g=!1,d=!1;u<n.length;)n[u][0]==i?(n[u][1].length<this.Diff_EditCost&&(g||d)?(c[l++]=u,h=g,r=d,o=n[u][1]):(l=0,o=null),g=d=!1):(n[u][0]==s?d=!0:g=!0,o&&(h&&r&&g&&d||o.length<this.Diff_EditCost/2&&h+r+g+d==3)&&(n.splice(c[l-1],0,new v.Diff(s,o)),n[c[l-1]+1][0]=m,l--,o=null,h&&r?(g=d=!0,l=0):(l--,u=l>0?c[l-1]:-1,g=d=!1),p=!0)),u++;p&&this.diff_cleanupMerge(n)},v.prototype.diff_cleanupMerge=function(n){n.push(new v.Diff(i,""));for(var p=0,c=0,l=0,o="",u="",h;p<n.length;)switch(n[p][0]){case m:l++,u+=n[p][1],p++;break;case s:c++,o+=n[p][1],p++;break;case i:c+l>1?(c!==0&&l!==0&&(h=this.diff_commonPrefix(u,o),h!==0&&(p-c-l>0&&n[p-c-l-1][0]==i?n[p-c-l-1][1]+=u.substring(0,h):(n.splice(0,0,new v.Diff(i,u.substring(0,h))),p++),u=u.substring(h),o=o.substring(h)),h=this.diff_commonSuffix(u,o),h!==0&&(n[p][1]=u.substring(u.length-h)+n[p][1],u=u.substring(0,u.length-h),o=o.substring(0,o.length-h))),p-=c+l,n.splice(p,c+l),o.length&&(n.splice(p,0,new v.Diff(s,o)),p++),u.length&&(n.splice(p,0,new v.Diff(m,u)),p++),p++):p!==0&&n[p-1][0]==i?(n[p-1][1]+=n[p][1],n.splice(p,1)):p++,l=0,c=0,o="",u="";break}n[n.length-1][1]===""&&n.pop();var r=!1;for(p=1;p<n.length-1;)n[p-1][0]==i&&n[p+1][0]==i&&(n[p][1].substring(n[p][1].length-n[p-1][1].length)==n[p-1][1]?(n[p][1]=n[p-1][1]+n[p][1].substring(0,n[p][1].length-n[p-1][1].length),n[p+1][1]=n[p-1][1]+n[p+1][1],n.splice(p-1,1),r=!0):n[p][1].substring(0,n[p+1][1].length)==n[p+1][1]&&(n[p-1][1]+=n[p+1][1],n[p][1]=n[p][1].substring(n[p+1][1].length)+n[p+1][1],n.splice(p+1,1),r=!0)),p++;r&&this.diff_cleanupMerge(n)},v.prototype.diff_xIndex=function(n,p){var c=0,l=0,o=0,u=0,h;for(h=0;h<n.length&&(n[h][0]!==m&&(c+=n[h][1].length),n[h][0]!==s&&(l+=n[h][1].length),!(c>p));h++)o=c,u=l;return n.length!=h&&n[h][0]===s?u:u+(p-o)},v.prototype.diff_prettyHtml=function(n){for(var p=[],c=/&/g,l=/</g,o=/>/g,u=/\n/g,h=0;h<n.length;h++){var r=n[h][0],g=n[h][1],d=g.replace(c,"&amp;").replace(l,"&lt;").replace(o,"&gt;").replace(u,"&para;<br>");switch(r){case m:p[h]='<ins style="background:#e6ffe6;">'+d+"</ins>";break;case s:p[h]='<del style="background:#ffe6e6;">'+d+"</del>";break;case i:p[h]="<span>"+d+"</span>";break}}return p.join("")},v.prototype.diff_text1=function(n){for(var p=[],c=0;c<n.length;c++)n[c][0]!==m&&(p[c]=n[c][1]);return p.join("")},v.prototype.diff_text2=function(n){for(var p=[],c=0;c<n.length;c++)n[c][0]!==s&&(p[c]=n[c][1]);return p.join("")},v.prototype.diff_levenshtein=function(n){for(var p=0,c=0,l=0,o=0;o<n.length;o++){var u=n[o][0],h=n[o][1];switch(u){case m:c+=h.length;break;case s:l+=h.length;break;case i:p+=Math.max(c,l),c=0,l=0;break}}return p+=Math.max(c,l),p},v.prototype.diff_toDelta=function(n){for(var p=[],c=0;c<n.length;c++)switch(n[c][0]){case m:p[c]="+"+encodeURI(n[c][1]);break;case s:p[c]="-"+n[c][1].length;break;case i:p[c]="="+n[c][1].length;break}return p.join("	").replace(/%20/g," ")},v.prototype.diff_fromDelta=function(n,p){for(var c=[],l=0,o=0,u=p.split(/\t/g),h=0;h<u.length;h++){var r=u[h].substring(1);switch(u[h].charAt(0)){case"+":try{c[l++]=new v.Diff(m,decodeURI(r))}catch(f){throw new Error("Illegal escape in diff_fromDelta: "+r)}break;case"-":case"=":var g=parseInt(r,10);if(isNaN(g)||g<0)throw new Error("Invalid number in diff_fromDelta: "+r);var d=n.substring(o,o+=g);u[h].charAt(0)=="="?c[l++]=new v.Diff(i,d):c[l++]=new v.Diff(s,d);break;default:if(u[h])throw new Error("Invalid diff operation in diff_fromDelta: "+u[h])}}if(o!=n.length)throw new Error("Delta length ("+o+") does not equal source text length ("+n.length+").");return c},v.prototype.match_main=function(n,p,c){if(n==null||p==null||c==null)throw new Error("Null input. (match_main)");return c=Math.max(0,Math.min(c,n.length)),n==p?0:n.length?n.substring(c,c+p.length)==p?c:this.match_bitap_(n,p,c):-1},v.prototype.match_bitap_=function(n,p,c){if(p.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var l=this.match_alphabet_(p),o=this;function u(R,C){var D=R/p.length,M=Math.abs(c-C);return o.Match_Distance?D+M/o.Match_Distance:M?1:D}var h=this.Match_Threshold,r=n.indexOf(p,c);r!=-1&&(h=Math.min(u(0,r),h),r=n.lastIndexOf(p,c+p.length),r!=-1&&(h=Math.min(u(0,r),h)));var g=1<<p.length-1;r=-1;for(var d,f,b=p.length+n.length,y,T=0;T<p.length;T++){for(d=0,f=b;d<f;)u(T,c+f)<=h?d=f:b=f,f=Math.floor((b-d)/2+d);b=f;var _=Math.max(1,c-f+1),P=Math.min(c+f,n.length)+p.length,x=Array(P+2);x[P+1]=(1<<T)-1;for(var E=P;E>=_;E--){var A=l[n.charAt(E-1)];if(T===0?x[E]=(x[E+1]<<1|1)&A:x[E]=(x[E+1]<<1|1)&A|((y[E+1]|y[E])<<1|1)|y[E+1],x[E]&g){var I=u(T,E-1);if(I<=h)if(h=I,r=E-1,r>c)_=Math.max(1,2*c-r);else break}}if(u(T+1,c)>h)break;y=x}return r},v.prototype.match_alphabet_=function(n){for(var p={},c=0;c<n.length;c++)p[n.charAt(c)]=0;for(var c=0;c<n.length;c++)p[n.charAt(c)]|=1<<n.length-c-1;return p},v.prototype.patch_addContext_=function(n,p){if(p.length!=0){if(n.start2===null)throw Error("patch not initialized");for(var c=p.substring(n.start2,n.start2+n.length1),l=0;p.indexOf(c)!=p.lastIndexOf(c)&&c.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)l+=this.Patch_Margin,c=p.substring(n.start2-l,n.start2+n.length1+l);l+=this.Patch_Margin;var o=p.substring(n.start2-l,n.start2);o&&n.diffs.unshift(new v.Diff(i,o));var u=p.substring(n.start2+n.length1,n.start2+n.length1+l);u&&n.diffs.push(new v.Diff(i,u)),n.start1-=o.length,n.start2-=o.length,n.length1+=o.length+u.length,n.length2+=o.length+u.length}},v.prototype.patch_make=function(n,p,c){var l,o;if(typeof n=="string"&&typeof p=="string"&&typeof c=="undefined")l=n,o=this.diff_main(l,p,!0),o.length>2&&(this.diff_cleanupSemantic(o),this.diff_cleanupEfficiency(o));else if(n&&typeof n=="object"&&typeof p=="undefined"&&typeof c=="undefined")o=n,l=this.diff_text1(o);else if(typeof n=="string"&&p&&typeof p=="object"&&typeof c=="undefined")l=n,o=p;else if(typeof n=="string"&&typeof p=="string"&&c&&typeof c=="object")l=n,o=c;else throw new Error("Unknown call format to patch_make.");if(o.length===0)return[];for(var u=[],h=new v.patch_obj,r=0,g=0,d=0,f=l,b=l,y=0;y<o.length;y++){var T=o[y][0],_=o[y][1];switch(!r&&T!==i&&(h.start1=g,h.start2=d),T){case m:h.diffs[r++]=o[y],h.length2+=_.length,b=b.substring(0,d)+_+b.substring(d);break;case s:h.length1+=_.length,h.diffs[r++]=o[y],b=b.substring(0,d)+b.substring(d+_.length);break;case i:_.length<=2*this.Patch_Margin&&r&&o.length!=y+1?(h.diffs[r++]=o[y],h.length1+=_.length,h.length2+=_.length):_.length>=2*this.Patch_Margin&&r&&(this.patch_addContext_(h,f),u.push(h),h=new v.patch_obj,r=0,f=b,g=d);break}T!==m&&(g+=_.length),T!==s&&(d+=_.length)}return r&&(this.patch_addContext_(h,f),u.push(h)),u},v.prototype.patch_deepCopy=function(n){for(var p=[],c=0;c<n.length;c++){var l=n[c],o=new v.patch_obj;o.diffs=[];for(var u=0;u<l.diffs.length;u++)o.diffs[u]=new v.Diff(l.diffs[u][0],l.diffs[u][1]);o.start1=l.start1,o.start2=l.start2,o.length1=l.length1,o.length2=l.length2,p[c]=o}return p},v.prototype.patch_apply=function(n,p){if(n.length==0)return[p,[]];n=this.patch_deepCopy(n);var c=this.patch_addPadding(n);p=c+p+c,this.patch_splitMax(n);for(var l=0,o=[],u=0;u<n.length;u++){var h=n[u].start2+l,r=this.diff_text1(n[u].diffs),g,d=-1;if(r.length>this.Match_MaxBits?(g=this.match_main(p,r.substring(0,this.Match_MaxBits),h),g!=-1&&(d=this.match_main(p,r.substring(r.length-this.Match_MaxBits),h+r.length-this.Match_MaxBits),(d==-1||g>=d)&&(g=-1))):g=this.match_main(p,r,h),g==-1)o[u]=!1,l-=n[u].length2-n[u].length1;else{o[u]=!0,l=g-h;var f;if(d==-1?f=p.substring(g,g+r.length):f=p.substring(g,d+this.Match_MaxBits),r==f)p=p.substring(0,g)+this.diff_text2(n[u].diffs)+p.substring(g+r.length);else{var b=this.diff_main(r,f,!1);if(r.length>this.Match_MaxBits&&this.diff_levenshtein(b)/r.length>this.Patch_DeleteThreshold)o[u]=!1;else{this.diff_cleanupSemanticLossless(b);for(var y=0,T,_=0;_<n[u].diffs.length;_++){var P=n[u].diffs[_];P[0]!==i&&(T=this.diff_xIndex(b,y)),P[0]===m?p=p.substring(0,g+T)+P[1]+p.substring(g+T):P[0]===s&&(p=p.substring(0,g+T)+p.substring(g+this.diff_xIndex(b,y+P[1].length))),P[0]!==s&&(y+=P[1].length)}}}}}return p=p.substring(c.length,p.length-c.length),[p,o]},v.prototype.patch_addPadding=function(n){for(var p=this.Patch_Margin,c="",l=1;l<=p;l++)c+=String.fromCharCode(l);for(var l=0;l<n.length;l++)n[l].start1+=p,n[l].start2+=p;var o=n[0],u=o.diffs;if(u.length==0||u[0][0]!=i)u.unshift(new v.Diff(i,c)),o.start1-=p,o.start2-=p,o.length1+=p,o.length2+=p;else if(p>u[0][1].length){var h=p-u[0][1].length;u[0][1]=c.substring(u[0][1].length)+u[0][1],o.start1-=h,o.start2-=h,o.length1+=h,o.length2+=h}if(o=n[n.length-1],u=o.diffs,u.length==0||u[u.length-1][0]!=i)u.push(new v.Diff(i,c)),o.length1+=p,o.length2+=p;else if(p>u[u.length-1][1].length){var h=p-u[u.length-1][1].length;u[u.length-1][1]+=c.substring(0,h),o.length1+=h,o.length2+=h}return c},v.prototype.patch_splitMax=function(n){for(var p=this.Match_MaxBits,c=0;c<n.length;c++)if(!(n[c].length1<=p)){var l=n[c];n.splice(c--,1);for(var o=l.start1,u=l.start2,h="";l.diffs.length!==0;){var r=new v.patch_obj,g=!0;for(r.start1=o-h.length,r.start2=u-h.length,h!==""&&(r.length1=r.length2=h.length,r.diffs.push(new v.Diff(i,h)));l.diffs.length!==0&&r.length1<p-this.Patch_Margin;){var d=l.diffs[0][0],f=l.diffs[0][1];d===m?(r.length2+=f.length,u+=f.length,r.diffs.push(l.diffs.shift()),g=!1):d===s&&r.diffs.length==1&&r.diffs[0][0]==i&&f.length>2*p?(r.length1+=f.length,o+=f.length,g=!1,r.diffs.push(new v.Diff(d,f)),l.diffs.shift()):(f=f.substring(0,p-r.length1-this.Patch_Margin),r.length1+=f.length,o+=f.length,d===i?(r.length2+=f.length,u+=f.length):g=!1,r.diffs.push(new v.Diff(d,f)),f==l.diffs[0][1]?l.diffs.shift():l.diffs[0][1]=l.diffs[0][1].substring(f.length))}h=this.diff_text2(r.diffs),h=h.substring(h.length-this.Patch_Margin);var b=this.diff_text1(l.diffs).substring(0,this.Patch_Margin);b!==""&&(r.length1+=b.length,r.length2+=b.length,r.diffs.length!==0&&r.diffs[r.diffs.length-1][0]===i?r.diffs[r.diffs.length-1][1]+=b:r.diffs.push(new v.Diff(i,b))),g||n.splice(++c,0,r)}}},v.prototype.patch_toText=function(n){for(var p=[],c=0;c<n.length;c++)p[c]=n[c];return p.join("")},v.prototype.patch_fromText=function(n){var p=[];if(!n)return p;for(var c=n.split(`
`),l=0,o=/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;l<c.length;){var u=c[l].match(o);if(!u)throw new Error("Invalid patch string: "+c[l]);var h=new v.patch_obj;for(p.push(h),h.start1=parseInt(u[1],10),u[2]===""?(h.start1--,h.length1=1):u[2]=="0"?h.length1=0:(h.start1--,h.length1=parseInt(u[2],10)),h.start2=parseInt(u[3],10),u[4]===""?(h.start2--,h.length2=1):u[4]=="0"?h.length2=0:(h.start2--,h.length2=parseInt(u[4],10)),l++;l<c.length;){var r=c[l].charAt(0);try{var g=decodeURI(c[l].substring(1))}catch(d){throw new Error("Illegal escape in patch_fromText: "+g)}if(r=="-")h.diffs.push(new v.Diff(s,g));else if(r=="+")h.diffs.push(new v.Diff(m,g));else if(r==" ")h.diffs.push(new v.Diff(i,g));else{if(r=="@")break;if(r!=="")throw new Error('Invalid patch mode "'+r+'" in: '+g)}l++}}return p},v.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0},v.patch_obj.prototype.toString=function(){var n,p;this.length1===0?n=this.start1+",0":this.length1==1?n=this.start1+1:n=this.start1+1+","+this.length1,this.length2===0?p=this.start2+",0":this.length2==1?p=this.start2+1:p=this.start2+1+","+this.length2;for(var c=["@@ -"+n+" +"+p+` @@
`],l,o=0;o<this.diffs.length;o++){switch(this.diffs[o][0]){case m:l="+";break;case s:l="-";break;case i:l=" ";break}c[o+1]=l+encodeURI(this.diffs[o][1])+`
`}return c.join("").replace(/%20/g," ")},w.exports=v,w.exports.diff_match_patch=v,w.exports.DIFF_DELETE=s,w.exports.DIFF_INSERT=m,w.exports.DIFF_EQUAL=i},177:function(w){/**!

 @license
 handlebars v4.7.7

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

*/(function(v,s){w.exports=s()})(this,function(){return function(v){function s(i){if(m[i])return m[i].exports;var n=m[i]={exports:{},id:i,loaded:!1};return v[i].call(n.exports,n,n.exports,s),n.loaded=!0,n.exports}var m={};return s.m=v,s.c=m,s.p="",s(0)}([function(v,s,m){"use strict";function i(){var P=T();return P.compile=function(x,E){return h.compile(x,E,P)},P.precompile=function(x,E){return h.precompile(x,E,P)},P.AST=o.default,P.Compiler=h.Compiler,P.JavaScriptCompiler=g.default,P.Parser=u.parser,P.parse=u.parse,P.parseWithoutProcessing=u.parseWithoutProcessing,P}var n=m(1).default;s.__esModule=!0;var p=m(2),c=n(p),l=m(45),o=n(l),u=m(46),h=m(51),r=m(52),g=n(r),d=m(49),f=n(d),b=m(44),y=n(b),T=c.default.create,_=i();_.create=i,y.default(_),_.Visitor=f.default,_.default=_,s.default=_,v.exports=s.default},function(v,s){"use strict";s.default=function(m){return m&&m.__esModule?m:{default:m}},s.__esModule=!0},function(v,s,m){"use strict";function i(){var P=new l.HandlebarsEnvironment;return d.extend(P,l),P.SafeString=u.default,P.Exception=r.default,P.Utils=d,P.escapeExpression=d.escapeExpression,P.VM=b,P.template=function(x){return b.template(x,P)},P}var n=m(3).default,p=m(1).default;s.__esModule=!0;var c=m(4),l=n(c),o=m(37),u=p(o),h=m(6),r=p(h),g=m(5),d=n(g),f=m(38),b=n(f),y=m(44),T=p(y),_=i();_.create=i,T.default(_),_.default=_,s.default=_,v.exports=s.default},function(v,s){"use strict";s.default=function(m){if(m&&m.__esModule)return m;var i={};if(m!=null)for(var n in m)Object.prototype.hasOwnProperty.call(m,n)&&(i[n]=m[n]);return i.default=m,i},s.__esModule=!0},function(v,s,m){"use strict";function i(P,x,E){this.helpers=P||{},this.partials=x||{},this.decorators=E||{},o.registerDefaultHelpers(this),u.registerDefaultDecorators(this)}var n=m(1).default;s.__esModule=!0,s.HandlebarsEnvironment=i;var p=m(5),c=m(6),l=n(c),o=m(10),u=m(30),h=m(32),r=n(h),g=m(33),d="4.7.7";s.VERSION=d;var f=8;s.COMPILER_REVISION=f;var b=7;s.LAST_COMPATIBLE_COMPILER_REVISION=b;var y={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1",7:">= 4.0.0 <4.3.0",8:">= 4.3.0"};s.REVISION_CHANGES=y;var T="[object Object]";i.prototype={constructor:i,logger:r.default,log:r.default.log,registerHelper:function(P,x){if(p.toString.call(P)===T){if(x)throw new l.default("Arg not supported with multiple helpers");p.extend(this.helpers,P)}else this.helpers[P]=x},unregisterHelper:function(P){delete this.helpers[P]},registerPartial:function(P,x){if(p.toString.call(P)===T)p.extend(this.partials,P);else{if(typeof x=="undefined")throw new l.default('Attempting to register a partial called "'+P+'" as undefined');this.partials[P]=x}},unregisterPartial:function(P){delete this.partials[P]},registerDecorator:function(P,x){if(p.toString.call(P)===T){if(x)throw new l.default("Arg not supported with multiple decorators");p.extend(this.decorators,P)}else this.decorators[P]=x},unregisterDecorator:function(P){delete this.decorators[P]},resetLoggedPropertyAccesses:function(){g.resetLoggedProperties()}};var _=r.default.log;s.log=_,s.createFrame=p.createFrame,s.logger=r.default},function(v,s){"use strict";function m(y){return h[y]}function i(y){for(var T=1;T<arguments.length;T++)for(var _ in arguments[T])Object.prototype.hasOwnProperty.call(arguments[T],_)&&(y[_]=arguments[T][_]);return y}function n(y,T){for(var _=0,P=y.length;_<P;_++)if(y[_]===T)return _;return-1}function p(y){if(typeof y!="string"){if(y&&y.toHTML)return y.toHTML();if(y==null)return"";if(!y)return y+"";y=""+y}return g.test(y)?y.replace(r,m):y}function c(y){return!y&&y!==0||!(!b(y)||y.length!==0)}function l(y){var T=i({},y);return T._parent=y,T}function o(y,T){return y.path=T,y}function u(y,T){return(y?y+".":"")+T}s.__esModule=!0,s.extend=i,s.indexOf=n,s.escapeExpression=p,s.isEmpty=c,s.createFrame=l,s.blockParams=o,s.appendContextPath=u;var h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;","=":"&#x3D;"},r=/[&<>"'`=]/g,g=/[&<>"'`=]/,d=Object.prototype.toString;s.toString=d;var f=function(y){return typeof y=="function"};f(/x/)&&(s.isFunction=f=function(y){return typeof y=="function"&&d.call(y)==="[object Function]"}),s.isFunction=f;var b=Array.isArray||function(y){return!(!y||typeof y!="object")&&d.call(y)==="[object Array]"};s.isArray=b},function(v,s,m){"use strict";function i(c,l){var o=l&&l.loc,u=void 0,h=void 0,r=void 0,g=void 0;o&&(u=o.start.line,h=o.end.line,r=o.start.column,g=o.end.column,c+=" - "+u+":"+r);for(var d=Error.prototype.constructor.call(this,c),f=0;f<p.length;f++)this[p[f]]=d[p[f]];Error.captureStackTrace&&Error.captureStackTrace(this,i);try{o&&(this.lineNumber=u,this.endLineNumber=h,n?(Object.defineProperty(this,"column",{value:r,enumerable:!0}),Object.defineProperty(this,"endColumn",{value:g,enumerable:!0})):(this.column=r,this.endColumn=g))}catch(b){}}var n=m(7).default;s.__esModule=!0;var p=["description","fileName","lineNumber","endLineNumber","message","name","number","stack"];i.prototype=new Error,s.default=i,v.exports=s.default},function(v,s,m){v.exports={default:m(8),__esModule:!0}},function(v,s,m){var i=m(9);v.exports=function(n,p,c){return i.setDesc(n,p,c)}},function(v,s){var m=Object;v.exports={create:m.create,getProto:m.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:m.getOwnPropertyDescriptor,setDesc:m.defineProperty,setDescs:m.defineProperties,getKeys:m.keys,getNames:m.getOwnPropertyNames,getSymbols:m.getOwnPropertySymbols,each:[].forEach}},function(v,s,m){"use strict";function i(x){l.default(x),u.default(x),r.default(x),d.default(x),b.default(x),T.default(x),P.default(x)}function n(x,E,A){x.helpers[E]&&(x.hooks[E]=x.helpers[E],A||delete x.helpers[E])}var p=m(1).default;s.__esModule=!0,s.registerDefaultHelpers=i,s.moveHelperToHooks=n;var c=m(11),l=p(c),o=m(12),u=p(o),h=m(25),r=p(h),g=m(26),d=p(g),f=m(27),b=p(f),y=m(28),T=p(y),_=m(29),P=p(_)},function(v,s,m){"use strict";s.__esModule=!0;var i=m(5);s.default=function(n){n.registerHelper("blockHelperMissing",function(p,c){var l=c.inverse,o=c.fn;if(p===!0)return o(this);if(p===!1||p==null)return l(this);if(i.isArray(p))return p.length>0?(c.ids&&(c.ids=[c.name]),n.helpers.each(p,c)):l(this);if(c.data&&c.ids){var u=i.createFrame(c.data);u.contextPath=i.appendContextPath(c.data.contextPath,c.name),c={data:u}}return o(p,c)})},v.exports=s.default},function(v,s,m){(function(i){"use strict";var n=m(13).default,p=m(1).default;s.__esModule=!0;var c=m(5),l=m(6),o=p(l);s.default=function(u){u.registerHelper("each",function(h,r){function g(I,R,C){T&&(T.key=I,T.index=R,T.first=R===0,T.last=!!C,_&&(T.contextPath=_+I)),y+=d(h[I],{data:T,blockParams:c.blockParams([h[I],I],[_+I,null])})}if(!r)throw new o.default("Must pass iterator to #each");var d=r.fn,f=r.inverse,b=0,y="",T=void 0,_=void 0;if(r.data&&r.ids&&(_=c.appendContextPath(r.data.contextPath,r.ids[0])+"."),c.isFunction(h)&&(h=h.call(this)),r.data&&(T=c.createFrame(r.data)),h&&typeof h=="object")if(c.isArray(h))for(var P=h.length;b<P;b++)b in h&&g(b,b,b===h.length-1);else if(i.Symbol&&h[i.Symbol.iterator]){for(var x=[],E=h[i.Symbol.iterator](),A=E.next();!A.done;A=E.next())x.push(A.value);h=x;for(var P=h.length;b<P;b++)g(b,b,b===h.length-1)}else(function(){var I=void 0;n(h).forEach(function(R){I!==void 0&&g(I,b-1),I=R,b++}),I!==void 0&&g(I,b-1,!0)})();return b===0&&(y=f(this)),y})},v.exports=s.default}).call(s,function(){return this}())},function(v,s,m){v.exports={default:m(14),__esModule:!0}},function(v,s,m){m(15),v.exports=m(21).Object.keys},function(v,s,m){var i=m(16);m(18)("keys",function(n){return function(p){return n(i(p))}})},function(v,s,m){var i=m(17);v.exports=function(n){return Object(i(n))}},function(v,s){v.exports=function(m){if(m==null)throw TypeError("Can't call method on  "+m);return m}},function(v,s,m){var i=m(19),n=m(21),p=m(24);v.exports=function(c,l){var o=(n.Object||{})[c]||Object[c],u={};u[c]=l(o),i(i.S+i.F*p(function(){o(1)}),"Object",u)}},function(v,s,m){var i=m(20),n=m(21),p=m(22),c="prototype",l=function(o,u,h){var r,g,d,f=o&l.F,b=o&l.G,y=o&l.S,T=o&l.P,_=o&l.B,P=o&l.W,x=b?n:n[u]||(n[u]={}),E=b?i:y?i[u]:(i[u]||{})[c];b&&(h=u);for(r in h)g=!f&&E&&r in E,g&&r in x||(d=g?E[r]:h[r],x[r]=b&&typeof E[r]!="function"?h[r]:_&&g?p(d,i):P&&E[r]==d?function(A){var I=function(R){return this instanceof A?new A(R):A(R)};return I[c]=A[c],I}(d):T&&typeof d=="function"?p(Function.call,d):d,T&&((x[c]||(x[c]={}))[r]=d))};l.F=1,l.G=2,l.S=4,l.P=8,l.B=16,l.W=32,v.exports=l},function(v,s){var m=v.exports=typeof window!="undefined"&&window.Math==Math?window:typeof self!="undefined"&&self.Math==Math?self:Function("return this")();typeof __g=="number"&&(__g=m)},function(v,s){var m=v.exports={version:"1.2.6"};typeof __e=="number"&&(__e=m)},function(v,s,m){var i=m(23);v.exports=function(n,p,c){if(i(n),p===void 0)return n;switch(c){case 1:return function(l){return n.call(p,l)};case 2:return function(l,o){return n.call(p,l,o)};case 3:return function(l,o,u){return n.call(p,l,o,u)}}return function(){return n.apply(p,arguments)}}},function(v,s){v.exports=function(m){if(typeof m!="function")throw TypeError(m+" is not a function!");return m}},function(v,s){v.exports=function(m){try{return!!m()}catch(i){return!0}}},function(v,s,m){"use strict";var i=m(1).default;s.__esModule=!0;var n=m(6),p=i(n);s.default=function(c){c.registerHelper("helperMissing",function(){if(arguments.length!==1)throw new p.default('Missing helper: "'+arguments[arguments.length-1].name+'"')})},v.exports=s.default},function(v,s,m){"use strict";var i=m(1).default;s.__esModule=!0;var n=m(5),p=m(6),c=i(p);s.default=function(l){l.registerHelper("if",function(o,u){if(arguments.length!=2)throw new c.default("#if requires exactly one argument");return n.isFunction(o)&&(o=o.call(this)),!u.hash.includeZero&&!o||n.isEmpty(o)?u.inverse(this):u.fn(this)}),l.registerHelper("unless",function(o,u){if(arguments.length!=2)throw new c.default("#unless requires exactly one argument");return l.helpers.if.call(this,o,{fn:u.inverse,inverse:u.fn,hash:u.hash})})},v.exports=s.default},function(v,s){"use strict";s.__esModule=!0,s.default=function(m){m.registerHelper("log",function(){for(var i=[void 0],n=arguments[arguments.length-1],p=0;p<arguments.length-1;p++)i.push(arguments[p]);var c=1;n.hash.level!=null?c=n.hash.level:n.data&&n.data.level!=null&&(c=n.data.level),i[0]=c,m.log.apply(m,i)})},v.exports=s.default},function(v,s){"use strict";s.__esModule=!0,s.default=function(m){m.registerHelper("lookup",function(i,n,p){return i&&p.lookupProperty(i,n)})},v.exports=s.default},function(v,s,m){"use strict";var i=m(1).default;s.__esModule=!0;var n=m(5),p=m(6),c=i(p);s.default=function(l){l.registerHelper("with",function(o,u){if(arguments.length!=2)throw new c.default("#with requires exactly one argument");n.isFunction(o)&&(o=o.call(this));var h=u.fn;if(n.isEmpty(o))return u.inverse(this);var r=u.data;return u.data&&u.ids&&(r=n.createFrame(u.data),r.contextPath=n.appendContextPath(u.data.contextPath,u.ids[0])),h(o,{data:r,blockParams:n.blockParams([o],[r&&r.contextPath])})})},v.exports=s.default},function(v,s,m){"use strict";function i(l){c.default(l)}var n=m(1).default;s.__esModule=!0,s.registerDefaultDecorators=i;var p=m(31),c=n(p)},function(v,s,m){"use strict";s.__esModule=!0;var i=m(5);s.default=function(n){n.registerDecorator("inline",function(p,c,l,o){var u=p;return c.partials||(c.partials={},u=function(h,r){var g=l.partials;l.partials=i.extend({},g,c.partials);var d=p(h,r);return l.partials=g,d}),c.partials[o.args[0]]=o.fn,u})},v.exports=s.default},function(v,s,m){"use strict";s.__esModule=!0;var i=m(5),n={methodMap:["debug","info","warn","error"],level:"info",lookupLevel:function(p){if(typeof p=="string"){var c=i.indexOf(n.methodMap,p.toLowerCase());p=c>=0?c:parseInt(p,10)}return p},log:function(p){if(p=n.lookupLevel(p),typeof console!="undefined"&&n.lookupLevel(n.level)<=p){var c=n.methodMap[p];console[c]||(c="log");for(var l=arguments.length,o=Array(l>1?l-1:0),u=1;u<l;u++)o[u-1]=arguments[u];console[c].apply(console,o)}}};s.default=n,v.exports=s.default},function(v,s,m){"use strict";function i(b){var y=o(null);y.constructor=!1,y.__defineGetter__=!1,y.__defineSetter__=!1,y.__lookupGetter__=!1;var T=o(null);return T.__proto__=!1,{properties:{whitelist:r.createNewLookupObject(T,b.allowedProtoProperties),defaultValue:b.allowProtoPropertiesByDefault},methods:{whitelist:r.createNewLookupObject(y,b.allowedProtoMethods),defaultValue:b.allowProtoMethodsByDefault}}}function n(b,y,T){return p(typeof b=="function"?y.methods:y.properties,T)}function p(b,y){return b.whitelist[y]!==void 0?b.whitelist[y]===!0:b.defaultValue!==void 0?b.defaultValue:(c(y),!1)}function c(b){f[b]!==!0&&(f[b]=!0,d.log("error",'Handlebars: Access has been denied to resolve the property "'+b+`" because it is not an "own property" of its parent.
You can add a runtime option to disable the check or this warning:
See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details`))}function l(){u(f).forEach(function(b){delete f[b]})}var o=m(34).default,u=m(13).default,h=m(3).default;s.__esModule=!0,s.createProtoAccessControl=i,s.resultIsAllowed=n,s.resetLoggedProperties=l;var r=m(36),g=m(32),d=h(g),f=o(null)},function(v,s,m){v.exports={default:m(35),__esModule:!0}},function(v,s,m){var i=m(9);v.exports=function(n,p){return i.create(n,p)}},function(v,s,m){"use strict";function i(){for(var c=arguments.length,l=Array(c),o=0;o<c;o++)l[o]=arguments[o];return p.extend.apply(void 0,[n(null)].concat(l))}var n=m(34).default;s.__esModule=!0,s.createNewLookupObject=i;var p=m(5)},function(v,s){"use strict";function m(i){this.string=i}s.__esModule=!0,m.prototype.toString=m.prototype.toHTML=function(){return""+this.string},s.default=m,v.exports=s.default},function(v,s,m){"use strict";function i(C){var D=C&&C[0]||1,M=E.COMPILER_REVISION;if(!(D>=E.LAST_COMPATIBLE_COMPILER_REVISION&&D<=E.COMPILER_REVISION)){if(D<E.LAST_COMPATIBLE_COMPILER_REVISION){var B=E.REVISION_CHANGES[M],k=E.REVISION_CHANGES[D];throw new x.default("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+B+") or downgrade your runtime to an older version ("+k+").")}throw new x.default("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+C[1]+").")}}function n(C,D){function M(H,$,j){j.hash&&($=_.extend({},$,j.hash),j.ids&&(j.ids[0]=!0)),H=D.VM.resolvePartial.call(this,H,$,j);var K=_.extend({},j,{hooks:this.hooks,protoAccessControl:this.protoAccessControl}),W=D.VM.invokePartial.call(this,H,$,K);if(W==null&&D.compile&&(j.partials[j.name]=D.compile(H,C.compilerOptions,D),W=j.partials[j.name]($,K)),W!=null){if(j.indent){for(var te=W.split(`
`),ae=0,me=te.length;ae<me&&(te[ae]||ae+1!==me);ae++)te[ae]=j.indent+te[ae];W=te.join(`
`)}return W}throw new x.default("The partial "+j.name+" could not be compiled when running in runtime-only mode")}function B(H){function $(ae){return""+C.main(G,ae,G.helpers,G.partials,K,te,W)}var j=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],K=j.data;B._setup(j),!j.partial&&C.useData&&(K=u(H,K));var W=void 0,te=C.useBlockParams?[]:void 0;return C.useDepths&&(W=j.depths?H!=j.depths[0]?[H].concat(j.depths):j.depths:[H]),($=h(C.main,$,G,j.depths||[],K,te))(H,j)}if(!D)throw new x.default("No environment passed to template");if(!C||!C.main)throw new x.default("Unknown template object: "+typeof C);C.main.decorator=C.main_d,D.VM.checkRevision(C.compiler);var k=C.compiler&&C.compiler[0]===7,G={strict:function(H,$,j){if(!(H&&$ in H))throw new x.default('"'+$+'" not defined in '+H,{loc:j});return G.lookupProperty(H,$)},lookupProperty:function(H,$){var j=H[$];return j==null||Object.prototype.hasOwnProperty.call(H,$)||R.resultIsAllowed(j,G.protoAccessControl,$)?j:void 0},lookup:function(H,$){for(var j=H.length,K=0;K<j;K++){var W=H[K]&&G.lookupProperty(H[K],$);if(W!=null)return H[K][$]}},lambda:function(H,$){return typeof H=="function"?H.call($):H},escapeExpression:_.escapeExpression,invokePartial:M,fn:function(H){var $=C[H];return $.decorator=C[H+"_d"],$},programs:[],program:function(H,$,j,K,W){var te=this.programs[H],ae=this.fn(H);return $||W||K||j?te=p(this,H,ae,$,j,K,W):te||(te=this.programs[H]=p(this,H,ae)),te},data:function(H,$){for(;H&&$--;)H=H._parent;return H},mergeIfNeeded:function(H,$){var j=H||$;return H&&$&&H!==$&&(j=_.extend({},$,H)),j},nullContext:d({}),noop:D.VM.noop,compilerInfo:C.compiler};return B.isTop=!0,B._setup=function(H){if(H.partial)G.protoAccessControl=H.protoAccessControl,G.helpers=H.helpers,G.partials=H.partials,G.decorators=H.decorators,G.hooks=H.hooks;else{var $=_.extend({},D.helpers,H.helpers);r($,G),G.helpers=$,C.usePartial&&(G.partials=G.mergeIfNeeded(H.partials,D.partials)),(C.usePartial||C.useDecorators)&&(G.decorators=_.extend({},D.decorators,H.decorators)),G.hooks={},G.protoAccessControl=R.createProtoAccessControl(H);var j=H.allowCallsToHelperMissing||k;A.moveHelperToHooks(G,"helperMissing",j),A.moveHelperToHooks(G,"blockHelperMissing",j)}},B._child=function(H,$,j,K){if(C.useBlockParams&&!j)throw new x.default("must pass block params");if(C.useDepths&&!K)throw new x.default("must pass parent depths");return p(G,H,C[H],$,0,j,K)},B}function p(C,D,M,B,k,G,H){function $(j){var K=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],W=H;return!H||j==H[0]||j===C.nullContext&&H[0]===null||(W=[j].concat(H)),M(C,j,C.helpers,C.partials,K.data||B,G&&[K.blockParams].concat(G),W)}return $=h(M,$,C,H,B,G),$.program=D,$.depth=H?H.length:0,$.blockParams=k||0,$}function c(C,D,M){return C?C.call||M.name||(M.name=C,C=M.partials[C]):C=M.name==="@partial-block"?M.data["partial-block"]:M.partials[M.name],C}function l(C,D,M){var B=M.data&&M.data["partial-block"];M.partial=!0,M.ids&&(M.data.contextPath=M.ids[0]||M.data.contextPath);var k=void 0;if(M.fn&&M.fn!==o&&function(){M.data=E.createFrame(M.data);var G=M.fn;k=M.data["partial-block"]=function(H){var $=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];return $.data=E.createFrame($.data),$.data["partial-block"]=B,G(H,$)},G.partials&&(M.partials=_.extend({},M.partials,G.partials))}(),C===void 0&&k&&(C=k),C===void 0)throw new x.default("The partial "+M.name+" could not be found");if(C instanceof Function)return C(D,M)}function o(){return""}function u(C,D){return D&&"root"in D||(D=D?E.createFrame(D):{},D.root=C),D}function h(C,D,M,B,k,G){if(C.decorator){var H={};D=C.decorator(D,H,M,B&&B[0],k,G,B),_.extend(D,H)}return D}function r(C,D){f(C).forEach(function(M){var B=C[M];C[M]=g(B,D)})}function g(C,D){var M=D.lookupProperty;return I.wrapHelper(C,function(B){return _.extend({lookupProperty:M},B)})}var d=m(39).default,f=m(13).default,b=m(3).default,y=m(1).default;s.__esModule=!0,s.checkRevision=i,s.template=n,s.wrapProgram=p,s.resolvePartial=c,s.invokePartial=l,s.noop=o;var T=m(5),_=b(T),P=m(6),x=y(P),E=m(4),A=m(10),I=m(43),R=m(33)},function(v,s,m){v.exports={default:m(40),__esModule:!0}},function(v,s,m){m(41),v.exports=m(21).Object.seal},function(v,s,m){var i=m(42);m(18)("seal",function(n){return function(p){return n&&i(p)?n(p):p}})},function(v,s){v.exports=function(m){return typeof m=="object"?m!==null:typeof m=="function"}},function(v,s){"use strict";function m(i,n){if(typeof i!="function")return i;var p=function(){var c=arguments[arguments.length-1];return arguments[arguments.length-1]=n(c),i.apply(this,arguments)};return p}s.__esModule=!0,s.wrapHelper=m},function(v,s){(function(m){"use strict";s.__esModule=!0,s.default=function(i){var n=typeof m!="undefined"?m:window,p=n.Handlebars;i.noConflict=function(){return n.Handlebars===i&&(n.Handlebars=p),i}},v.exports=s.default}).call(s,function(){return this}())},function(v,s){"use strict";s.__esModule=!0;var m={helpers:{helperExpression:function(i){return i.type==="SubExpression"||(i.type==="MustacheStatement"||i.type==="BlockStatement")&&!!(i.params&&i.params.length||i.hash)},scopedId:function(i){return/^\.|this\b/.test(i.original)},simpleId:function(i){return i.parts.length===1&&!m.helpers.scopedId(i)&&!i.depth}}};s.default=m,v.exports=s.default},function(v,s,m){"use strict";function i(b,y){if(b.type==="Program")return b;o.default.yy=f,f.locInfo=function(_){return new f.SourceLocation(y&&y.srcName,_)};var T=o.default.parse(b);return T}function n(b,y){var T=i(b,y),_=new h.default(y);return _.accept(T)}var p=m(1).default,c=m(3).default;s.__esModule=!0,s.parseWithoutProcessing=i,s.parse=n;var l=m(47),o=p(l),u=m(48),h=p(u),r=m(50),g=c(r),d=m(5);s.parser=o.default;var f={};d.extend(f,g)},function(v,s){"use strict";s.__esModule=!0;var m=function(){function i(){this.yy={}}var n={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,partialBlock:12,content:13,COMMENT:14,CONTENT:15,openRawBlock:16,rawBlock_repetition0:17,END_RAW_BLOCK:18,OPEN_RAW_BLOCK:19,helperName:20,openRawBlock_repetition0:21,openRawBlock_option0:22,CLOSE_RAW_BLOCK:23,openBlock:24,block_option0:25,closeBlock:26,openInverse:27,block_option1:28,OPEN_BLOCK:29,openBlock_repetition0:30,openBlock_option0:31,openBlock_option1:32,CLOSE:33,OPEN_INVERSE:34,openInverse_repetition0:35,openInverse_option0:36,openInverse_option1:37,openInverseChain:38,OPEN_INVERSE_CHAIN:39,openInverseChain_repetition0:40,openInverseChain_option0:41,openInverseChain_option1:42,inverseAndProgram:43,INVERSE:44,inverseChain:45,inverseChain_option0:46,OPEN_ENDBLOCK:47,OPEN:48,mustache_repetition0:49,mustache_option0:50,OPEN_UNESCAPED:51,mustache_repetition1:52,mustache_option1:53,CLOSE_UNESCAPED:54,OPEN_PARTIAL:55,partialName:56,partial_repetition0:57,partial_option0:58,openPartialBlock:59,OPEN_PARTIAL_BLOCK:60,openPartialBlock_repetition0:61,openPartialBlock_option0:62,param:63,sexpr:64,OPEN_SEXPR:65,sexpr_repetition0:66,sexpr_option0:67,CLOSE_SEXPR:68,hash:69,hash_repetition_plus0:70,hashSegment:71,ID:72,EQUALS:73,blockParams:74,OPEN_BLOCK_PARAMS:75,blockParams_repetition_plus0:76,CLOSE_BLOCK_PARAMS:77,path:78,dataName:79,STRING:80,NUMBER:81,BOOLEAN:82,UNDEFINED:83,NULL:84,DATA:85,pathSegments:86,SEP:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,0],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function(c,l,o,u,h,r,g){var d=r.length-1;switch(h){case 1:return r[d-1];case 2:this.$=u.prepareProgram(r[d]);break;case 3:this.$=r[d];break;case 4:this.$=r[d];break;case 5:this.$=r[d];break;case 6:this.$=r[d];break;case 7:this.$=r[d];break;case 8:this.$=r[d];break;case 9:this.$={type:"CommentStatement",value:u.stripComment(r[d]),strip:u.stripFlags(r[d],r[d]),loc:u.locInfo(this._$)};break;case 10:this.$={type:"ContentStatement",original:r[d],value:r[d],loc:u.locInfo(this._$)};break;case 11:this.$=u.prepareRawBlock(r[d-2],r[d-1],r[d],this._$);break;case 12:this.$={path:r[d-3],params:r[d-2],hash:r[d-1]};break;case 13:this.$=u.prepareBlock(r[d-3],r[d-2],r[d-1],r[d],!1,this._$);break;case 14:this.$=u.prepareBlock(r[d-3],r[d-2],r[d-1],r[d],!0,this._$);break;case 15:this.$={open:r[d-5],path:r[d-4],params:r[d-3],hash:r[d-2],blockParams:r[d-1],strip:u.stripFlags(r[d-5],r[d])};break;case 16:this.$={path:r[d-4],params:r[d-3],hash:r[d-2],blockParams:r[d-1],strip:u.stripFlags(r[d-5],r[d])};break;case 17:this.$={path:r[d-4],params:r[d-3],hash:r[d-2],blockParams:r[d-1],strip:u.stripFlags(r[d-5],r[d])};break;case 18:this.$={strip:u.stripFlags(r[d-1],r[d-1]),program:r[d]};break;case 19:var f=u.prepareBlock(r[d-2],r[d-1],r[d],r[d],!1,this._$),b=u.prepareProgram([f],r[d-1].loc);b.chained=!0,this.$={strip:r[d-2].strip,program:b,chain:!0};break;case 20:this.$=r[d];break;case 21:this.$={path:r[d-1],strip:u.stripFlags(r[d-2],r[d])};break;case 22:this.$=u.prepareMustache(r[d-3],r[d-2],r[d-1],r[d-4],u.stripFlags(r[d-4],r[d]),this._$);break;case 23:this.$=u.prepareMustache(r[d-3],r[d-2],r[d-1],r[d-4],u.stripFlags(r[d-4],r[d]),this._$);break;case 24:this.$={type:"PartialStatement",name:r[d-3],params:r[d-2],hash:r[d-1],indent:"",strip:u.stripFlags(r[d-4],r[d]),loc:u.locInfo(this._$)};break;case 25:this.$=u.preparePartialBlock(r[d-2],r[d-1],r[d],this._$);break;case 26:this.$={path:r[d-3],params:r[d-2],hash:r[d-1],strip:u.stripFlags(r[d-4],r[d])};break;case 27:this.$=r[d];break;case 28:this.$=r[d];break;case 29:this.$={type:"SubExpression",path:r[d-3],params:r[d-2],hash:r[d-1],loc:u.locInfo(this._$)};break;case 30:this.$={type:"Hash",pairs:r[d],loc:u.locInfo(this._$)};break;case 31:this.$={type:"HashPair",key:u.id(r[d-2]),value:r[d],loc:u.locInfo(this._$)};break;case 32:this.$=u.id(r[d-1]);break;case 33:this.$=r[d];break;case 34:this.$=r[d];break;case 35:this.$={type:"StringLiteral",value:r[d],original:r[d],loc:u.locInfo(this._$)};break;case 36:this.$={type:"NumberLiteral",value:Number(r[d]),original:Number(r[d]),loc:u.locInfo(this._$)};break;case 37:this.$={type:"BooleanLiteral",value:r[d]==="true",original:r[d]==="true",loc:u.locInfo(this._$)};break;case 38:this.$={type:"UndefinedLiteral",original:void 0,value:void 0,loc:u.locInfo(this._$)};break;case 39:this.$={type:"NullLiteral",original:null,value:null,loc:u.locInfo(this._$)};break;case 40:this.$=r[d];break;case 41:this.$=r[d];break;case 42:this.$=u.preparePath(!0,r[d],this._$);break;case 43:this.$=u.preparePath(!1,r[d],this._$);break;case 44:r[d-2].push({part:u.id(r[d]),original:r[d],separator:r[d-1]}),this.$=r[d-2];break;case 45:this.$=[{part:u.id(r[d]),original:r[d]}];break;case 46:this.$=[];break;case 47:r[d-1].push(r[d]);break;case 48:this.$=[];break;case 49:r[d-1].push(r[d]);break;case 50:this.$=[];break;case 51:r[d-1].push(r[d]);break;case 58:this.$=[];break;case 59:r[d-1].push(r[d]);break;case 64:this.$=[];break;case 65:r[d-1].push(r[d]);break;case 70:this.$=[];break;case 71:r[d-1].push(r[d]);break;case 78:this.$=[];break;case 79:r[d-1].push(r[d]);break;case 82:this.$=[];break;case 83:r[d-1].push(r[d]);break;case 86:this.$=[];break;case 87:r[d-1].push(r[d]);break;case 90:this.$=[];break;case 91:r[d-1].push(r[d]);break;case 94:this.$=[];break;case 95:r[d-1].push(r[d]);break;case 98:this.$=[r[d]];break;case 99:r[d-1].push(r[d]);break;case 100:this.$=[r[d]];break;case 101:r[d-1].push(r[d])}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{15:[2,48],17:39,18:[2,48]},{20:41,56:40,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:44,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:45,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:41,56:48,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:49,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,50]},{72:[1,35],86:51},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:52,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:53,38:55,39:[1,57],43:56,44:[1,58],45:54,47:[2,54]},{28:59,43:60,44:[1,58],47:[2,56]},{13:62,15:[1,20],18:[1,61]},{33:[2,86],57:63,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:64,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:65,47:[1,66]},{30:67,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:68,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:69,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:70,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:74,33:[2,80],50:71,63:72,64:75,65:[1,43],69:73,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,79]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,50]},{20:74,53:80,54:[2,84],63:81,64:75,65:[1,43],69:82,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:83,47:[1,66]},{47:[2,55]},{4:84,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:85,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:86,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:87,47:[1,66]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:74,33:[2,88],58:88,63:89,64:75,65:[1,43],69:90,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:91,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:92,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,31:93,33:[2,60],63:94,64:75,65:[1,43],69:95,70:76,71:77,72:[1,78],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,66],36:96,63:97,64:75,65:[1,43],69:98,70:76,71:77,72:[1,78],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,22:99,23:[2,52],63:100,64:75,65:[1,43],69:101,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,92],62:102,63:103,64:75,65:[1,43],69:104,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,105]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:106,72:[1,107],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,108],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,109]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:55,39:[1,57],43:56,44:[1,58],45:111,46:110,47:[2,76]},{33:[2,70],40:112,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,113]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:74,63:115,64:75,65:[1,43],67:114,68:[2,96],69:116,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,117]},{32:118,33:[2,62],74:119,75:[1,120]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:121,74:122,75:[1,120]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,123]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,124]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,108]},{20:74,63:125,64:75,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:74,33:[2,72],41:126,63:127,64:75,65:[1,43],69:128,70:76,71:77,72:[1,78],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,129]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,130]},{33:[2,63]},{72:[1,132],76:131},{33:[1,133]},{33:[2,69]},{15:[2,12],18:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:134,74:135,75:[1,120]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,137],77:[1,136]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,138]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],54:[2,55],56:[2,20],60:[2,57],73:[2,81],82:[2,85],86:[2,18],90:[2,89],101:[2,53],104:[2,93],110:[2,19],111:[2,77],116:[2,97],119:[2,63],122:[2,69],135:[2,75],136:[2,32]},parseError:function(c,l){throw new Error(c)},parse:function(c){function l(){var G;return G=o.lexer.lex()||1,typeof G!="number"&&(G=o.symbols_[G]||G),G}var o=this,u=[0],h=[null],r=[],g=this.table,d="",f=0,b=0,y=0;this.lexer.setInput(c),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,typeof this.lexer.yylloc=="undefined"&&(this.lexer.yylloc={});var T=this.lexer.yylloc;r.push(T);var _=this.lexer.options&&this.lexer.options.ranges;typeof this.yy.parseError=="function"&&(this.parseError=this.yy.parseError);for(var P,x,E,A,I,R,C,D,M,B={};;){if(E=u[u.length-1],this.defaultActions[E]?A=this.defaultActions[E]:(P!==null&&typeof P!="undefined"||(P=l()),A=g[E]&&g[E][P]),typeof A=="undefined"||!A.length||!A[0]){var k="";if(!y){M=[];for(R in g[E])this.terminals_[R]&&R>2&&M.push("'"+this.terminals_[R]+"'");k=this.lexer.showPosition?"Parse error on line "+(f+1)+`:
`+this.lexer.showPosition()+`
Expecting `+M.join(", ")+", got '"+(this.terminals_[P]||P)+"'":"Parse error on line "+(f+1)+": Unexpected "+(P==1?"end of input":"'"+(this.terminals_[P]||P)+"'"),this.parseError(k,{text:this.lexer.match,token:this.terminals_[P]||P,line:this.lexer.yylineno,loc:T,expected:M})}}if(A[0]instanceof Array&&A.length>1)throw new Error("Parse Error: multiple actions possible at state: "+E+", token: "+P);switch(A[0]){case 1:u.push(P),h.push(this.lexer.yytext),r.push(this.lexer.yylloc),u.push(A[1]),P=null,x?(P=x,x=null):(b=this.lexer.yyleng,d=this.lexer.yytext,f=this.lexer.yylineno,T=this.lexer.yylloc,y>0&&y--);break;case 2:if(C=this.productions_[A[1]][1],B.$=h[h.length-C],B._$={first_line:r[r.length-(C||1)].first_line,last_line:r[r.length-1].last_line,first_column:r[r.length-(C||1)].first_column,last_column:r[r.length-1].last_column},_&&(B._$.range=[r[r.length-(C||1)].range[0],r[r.length-1].range[1]]),I=this.performAction.call(B,d,b,f,this.yy,A[1],h,r),typeof I!="undefined")return I;C&&(u=u.slice(0,-1*C*2),h=h.slice(0,-1*C),r=r.slice(0,-1*C)),u.push(this.productions_[A[1]][0]),h.push(B.$),r.push(B._$),D=g[u[u.length-2]][u[u.length-1]],u.push(D);break;case 3:return!0}}return!0}},p=function(){var c={EOF:1,parseError:function(l,o){if(!this.yy.parser)throw new Error(l);this.yy.parser.parseError(l,o)},setInput:function(l){return this._input=l,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var l=this._input[0];this.yytext+=l,this.yyleng++,this.offset++,this.match+=l,this.matched+=l;var o=l.match(/(?:\r\n?|\n).*/g);return o?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),l},unput:function(l){var o=l.length,u=l.split(/(?:\r\n?|\n)/g);this._input=l+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-o-1),this.offset-=o;var h=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),u.length-1&&(this.yylineno-=u.length-1);var r=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:u?(u.length===h.length?this.yylloc.first_column:0)+h[h.length-u.length].length-u[0].length:this.yylloc.first_column-o},this.options.ranges&&(this.yylloc.range=[r[0],r[0]+this.yyleng-o]),this},more:function(){return this._more=!0,this},less:function(l){this.unput(this.match.slice(l))},pastInput:function(){var l=this.matched.substr(0,this.matched.length-this.match.length);return(l.length>20?"...":"")+l.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var l=this.match;return l.length<20&&(l+=this._input.substr(0,20-l.length)),(l.substr(0,20)+(l.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var l=this.pastInput(),o=new Array(l.length+1).join("-");return l+this.upcomingInput()+`
`+o+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var l,o,u,h,r;this._more||(this.yytext="",this.match="");for(var g=this._currentRules(),d=0;d<g.length&&(u=this._input.match(this.rules[g[d]]),!u||o&&!(u[0].length>o[0].length)||(o=u,h=d,this.options.flex));d++);return o?(r=o[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],l=this.performAction.call(this,this.yy,this,g[h],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),l||void 0):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var l=this.next();return typeof l!="undefined"?l:this.lex()},begin:function(l){this.conditionStack.push(l)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(l){this.begin(l)}};return c.options={},c.performAction=function(l,o,u,h){function r(g,d){return o.yytext=o.yytext.substring(g,o.yyleng-d+g)}switch(u){case 0:if(o.yytext.slice(-2)==="\\\\"?(r(0,1),this.begin("mu")):o.yytext.slice(-1)==="\\"?(r(0,1),this.begin("emu")):this.begin("mu"),o.yytext)return 15;break;case 1:return 15;case 2:return this.popState(),15;case 3:return this.begin("raw"),15;case 4:return this.popState(),this.conditionStack[this.conditionStack.length-1]==="raw"?15:(r(5,9),"END_RAW_BLOCK");case 5:return 15;case 6:return this.popState(),14;case 7:return 65;case 8:return 68;case 9:return 19;case 10:return this.popState(),this.begin("raw"),23;case 11:return 55;case 12:return 60;case 13:return 29;case 14:return 47;case 15:return this.popState(),44;case 16:return this.popState(),44;case 17:return 34;case 18:return 39;case 19:return 51;case 20:return 48;case 21:this.unput(o.yytext),this.popState(),this.begin("com");break;case 22:return this.popState(),14;case 23:return 48;case 24:return 73;case 25:return 72;case 26:return 72;case 27:return 87;case 28:break;case 29:return this.popState(),54;case 30:return this.popState(),33;case 31:return o.yytext=r(1,2).replace(/\\"/g,'"'),80;case 32:return o.yytext=r(1,2).replace(/\\'/g,"'"),80;case 33:return 85;case 34:return 82;case 35:return 82;case 36:return 83;case 37:return 84;case 38:return 81;case 39:return 75;case 40:return 77;case 41:return 72;case 42:return o.yytext=o.yytext.replace(/\\([\\\]])/g,"$1"),72;case 43:return"INVALID";case 44:return 5}},c.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^\/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]+?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/],c.conditions={mu:{rules:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[6],inclusive:!1},raw:{rules:[3,4,5],inclusive:!1},INITIAL:{rules:[0,1,44],inclusive:!0}},c}();return n.lexer=p,i.prototype=n,n.Parser=i,new i}();s.default=m,v.exports=s.default},function(v,s,m){"use strict";function i(){var r=arguments.length<=0||arguments[0]===void 0?{}:arguments[0];this.options=r}function n(r,g,d){g===void 0&&(g=r.length);var f=r[g-1],b=r[g-2];return f?f.type==="ContentStatement"?(b||!d?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(f.original):void 0:d}function p(r,g,d){g===void 0&&(g=-1);var f=r[g+1],b=r[g+2];return f?f.type==="ContentStatement"?(b||!d?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(f.original):void 0:d}function c(r,g,d){var f=r[g==null?0:g+1];if(f&&f.type==="ContentStatement"&&(d||!f.rightStripped)){var b=f.value;f.value=f.value.replace(d?/^\s+/:/^[ \t]*\r?\n?/,""),f.rightStripped=f.value!==b}}function l(r,g,d){var f=r[g==null?r.length-1:g-1];if(f&&f.type==="ContentStatement"&&(d||!f.leftStripped)){var b=f.value;return f.value=f.value.replace(d?/\s+$/:/[ \t]+$/,""),f.leftStripped=f.value!==b,f.leftStripped}}var o=m(1).default;s.__esModule=!0;var u=m(49),h=o(u);i.prototype=new h.default,i.prototype.Program=function(r){var g=!this.options.ignoreStandalone,d=!this.isRootSeen;this.isRootSeen=!0;for(var f=r.body,b=0,y=f.length;b<y;b++){var T=f[b],_=this.accept(T);if(_){var P=n(f,b,d),x=p(f,b,d),E=_.openStandalone&&P,A=_.closeStandalone&&x,I=_.inlineStandalone&&P&&x;_.close&&c(f,b,!0),_.open&&l(f,b,!0),g&&I&&(c(f,b),l(f,b)&&T.type==="PartialStatement"&&(T.indent=/([ \t]+$)/.exec(f[b-1].original)[1])),g&&E&&(c((T.program||T.inverse).body),l(f,b)),g&&A&&(c(f,b),l((T.inverse||T.program).body))}}return r},i.prototype.BlockStatement=i.prototype.DecoratorBlock=i.prototype.PartialBlockStatement=function(r){this.accept(r.program),this.accept(r.inverse);var g=r.program||r.inverse,d=r.program&&r.inverse,f=d,b=d;if(d&&d.chained)for(f=d.body[0].program;b.chained;)b=b.body[b.body.length-1].program;var y={open:r.openStrip.open,close:r.closeStrip.close,openStandalone:p(g.body),closeStandalone:n((f||g).body)};if(r.openStrip.close&&c(g.body,null,!0),d){var T=r.inverseStrip;T.open&&l(g.body,null,!0),T.close&&c(f.body,null,!0),r.closeStrip.open&&l(b.body,null,!0),!this.options.ignoreStandalone&&n(g.body)&&p(f.body)&&(l(g.body),c(f.body))}else r.closeStrip.open&&l(g.body,null,!0);return y},i.prototype.Decorator=i.prototype.MustacheStatement=function(r){return r.strip},i.prototype.PartialStatement=i.prototype.CommentStatement=function(r){var g=r.strip||{};return{inlineStandalone:!0,open:g.open,close:g.close}},s.default=i,v.exports=s.default},function(v,s,m){"use strict";function i(){this.parents=[]}function n(h){this.acceptRequired(h,"path"),this.acceptArray(h.params),this.acceptKey(h,"hash")}function p(h){n.call(this,h),this.acceptKey(h,"program"),this.acceptKey(h,"inverse")}function c(h){this.acceptRequired(h,"name"),this.acceptArray(h.params),this.acceptKey(h,"hash")}var l=m(1).default;s.__esModule=!0;var o=m(6),u=l(o);i.prototype={constructor:i,mutating:!1,acceptKey:function(h,r){var g=this.accept(h[r]);if(this.mutating){if(g&&!i.prototype[g.type])throw new u.default('Unexpected node type "'+g.type+'" found when accepting '+r+" on "+h.type);h[r]=g}},acceptRequired:function(h,r){if(this.acceptKey(h,r),!h[r])throw new u.default(h.type+" requires "+r)},acceptArray:function(h){for(var r=0,g=h.length;r<g;r++)this.acceptKey(h,r),h[r]||(h.splice(r,1),r--,g--)},accept:function(h){if(h){if(!this[h.type])throw new u.default("Unknown type: "+h.type,h);this.current&&this.parents.unshift(this.current),this.current=h;var r=this[h.type](h);return this.current=this.parents.shift(),!this.mutating||r?r:r!==!1?h:void 0}},Program:function(h){this.acceptArray(h.body)},MustacheStatement:n,Decorator:n,BlockStatement:p,DecoratorBlock:p,PartialStatement:c,PartialBlockStatement:function(h){c.call(this,h),this.acceptKey(h,"program")},ContentStatement:function(){},CommentStatement:function(){},SubExpression:n,PathExpression:function(){},StringLiteral:function(){},NumberLiteral:function(){},BooleanLiteral:function(){},UndefinedLiteral:function(){},NullLiteral:function(){},Hash:function(h){this.acceptArray(h.pairs)},HashPair:function(h){this.acceptRequired(h,"value")}},s.default=i,v.exports=s.default},function(v,s,m){"use strict";function i(T,_){if(_=_.path?_.path.original:_,T.path.original!==_){var P={loc:T.path.loc};throw new y.default(T.path.original+" doesn't match "+_,P)}}function n(T,_){this.source=T,this.start={line:_.first_line,column:_.first_column},this.end={line:_.last_line,column:_.last_column}}function p(T){return/^\[.*\]$/.test(T)?T.substring(1,T.length-1):T}function c(T,_){return{open:T.charAt(2)==="~",close:_.charAt(_.length-3)==="~"}}function l(T){return T.replace(/^\{\{~?!-?-?/,"").replace(/-?-?~?\}\}$/,"")}function o(T,_,P){P=this.locInfo(P);for(var x=T?"@":"",E=[],A=0,I=0,R=_.length;I<R;I++){var C=_[I].part,D=_[I].original!==C;if(x+=(_[I].separator||"")+C,D||C!==".."&&C!=="."&&C!=="this")E.push(C);else{if(E.length>0)throw new y.default("Invalid path: "+x,{loc:P});C===".."&&A++}}return{type:"PathExpression",data:T,depth:A,parts:E,original:x,loc:P}}function u(T,_,P,x,E,A){var I=x.charAt(3)||x.charAt(2),R=I!=="{"&&I!=="&",C=/\*/.test(x);return{type:C?"Decorator":"MustacheStatement",path:T,params:_,hash:P,escaped:R,strip:E,loc:this.locInfo(A)}}function h(T,_,P,x){i(T,P),x=this.locInfo(x);var E={type:"Program",body:_,strip:{},loc:x};return{type:"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:E,openStrip:{},inverseStrip:{},closeStrip:{},loc:x}}function r(T,_,P,x,E,A){x&&x.path&&i(T,x);var I=/\*/.test(T.open);_.blockParams=T.blockParams;var R=void 0,C=void 0;if(P){if(I)throw new y.default("Unexpected inverse block on decorator",P);P.chain&&(P.program.body[0].closeStrip=x.strip),C=P.strip,R=P.program}return E&&(E=R,R=_,_=E),{type:I?"DecoratorBlock":"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:_,inverse:R,openStrip:T.strip,inverseStrip:C,closeStrip:x&&x.strip,loc:this.locInfo(A)}}function g(T,_){if(!_&&T.length){var P=T[0].loc,x=T[T.length-1].loc;P&&x&&(_={source:P.source,start:{line:P.start.line,column:P.start.column},end:{line:x.end.line,column:x.end.column}})}return{type:"Program",body:T,strip:{},loc:_}}function d(T,_,P,x){return i(T,P),{type:"PartialBlockStatement",name:T.path,params:T.params,hash:T.hash,program:_,openStrip:T.strip,closeStrip:P&&P.strip,loc:this.locInfo(x)}}var f=m(1).default;s.__esModule=!0,s.SourceLocation=n,s.id=p,s.stripFlags=c,s.stripComment=l,s.preparePath=o,s.prepareMustache=u,s.prepareRawBlock=h,s.prepareBlock=r,s.prepareProgram=g,s.preparePartialBlock=d;var b=m(6),y=f(b)},function(v,s,m){"use strict";function i(){}function n(y,T,_){if(y==null||typeof y!="string"&&y.type!=="Program")throw new r.default("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+y);T=T||{},"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var P=_.parse(y,T),x=new _.Compiler().compile(P,T);return new _.JavaScriptCompiler().compile(x,T)}function p(y,T,_){function P(){var A=_.parse(y,T),I=new _.Compiler().compile(A,T),R=new _.JavaScriptCompiler().compile(I,T,void 0,!0);return _.template(R)}function x(A,I){return E||(E=P()),E.call(this,A,I)}if(T===void 0&&(T={}),y==null||typeof y!="string"&&y.type!=="Program")throw new r.default("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+y);T=g.extend({},T),"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var E=void 0;return x._setup=function(A){return E||(E=P()),E._setup(A)},x._child=function(A,I,R,C){return E||(E=P()),E._child(A,I,R,C)},x}function c(y,T){if(y===T)return!0;if(g.isArray(y)&&g.isArray(T)&&y.length===T.length){for(var _=0;_<y.length;_++)if(!c(y[_],T[_]))return!1;return!0}}function l(y){if(!y.path.parts){var T=y.path;y.path={type:"PathExpression",data:!1,depth:0,parts:[T.original+""],original:T.original+"",loc:T.loc}}}var o=m(34).default,u=m(1).default;s.__esModule=!0,s.Compiler=i,s.precompile=n,s.compile=p;var h=m(6),r=u(h),g=m(5),d=m(45),f=u(d),b=[].slice;i.prototype={compiler:i,equals:function(y){var T=this.opcodes.length;if(y.opcodes.length!==T)return!1;for(var _=0;_<T;_++){var P=this.opcodes[_],x=y.opcodes[_];if(P.opcode!==x.opcode||!c(P.args,x.args))return!1}T=this.children.length;for(var _=0;_<T;_++)if(!this.children[_].equals(y.children[_]))return!1;return!0},guid:0,compile:function(y,T){return this.sourceNode=[],this.opcodes=[],this.children=[],this.options=T,this.stringParams=T.stringParams,this.trackIds=T.trackIds,T.blockParams=T.blockParams||[],T.knownHelpers=g.extend(o(null),{helperMissing:!0,blockHelperMissing:!0,each:!0,if:!0,unless:!0,with:!0,log:!0,lookup:!0},T.knownHelpers),this.accept(y)},compileProgram:function(y){var T=new this.compiler,_=T.compile(y,this.options),P=this.guid++;return this.usePartial=this.usePartial||_.usePartial,this.children[P]=_,this.useDepths=this.useDepths||_.useDepths,P},accept:function(y){if(!this[y.type])throw new r.default("Unknown type: "+y.type,y);this.sourceNode.unshift(y);var T=this[y.type](y);return this.sourceNode.shift(),T},Program:function(y){this.options.blockParams.unshift(y.blockParams);for(var T=y.body,_=T.length,P=0;P<_;P++)this.accept(T[P]);return this.options.blockParams.shift(),this.isSimple=_===1,this.blockParams=y.blockParams?y.blockParams.length:0,this},BlockStatement:function(y){l(y);var T=y.program,_=y.inverse;T=T&&this.compileProgram(T),_=_&&this.compileProgram(_);var P=this.classifySexpr(y);P==="helper"?this.helperSexpr(y,T,_):P==="simple"?(this.simpleSexpr(y),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("blockValue",y.path.original)):(this.ambiguousSexpr(y,T,_),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},DecoratorBlock:function(y){var T=y.program&&this.compileProgram(y.program),_=this.setupFullMustacheParams(y,T,void 0),P=y.path;this.useDecorators=!0,this.opcode("registerDecorator",_.length,P.original)},PartialStatement:function(y){this.usePartial=!0;var T=y.program;T&&(T=this.compileProgram(y.program));var _=y.params;if(_.length>1)throw new r.default("Unsupported number of partial arguments: "+_.length,y);_.length||(this.options.explicitPartialContext?this.opcode("pushLiteral","undefined"):_.push({type:"PathExpression",parts:[],depth:0}));var P=y.name.original,x=y.name.type==="SubExpression";x&&this.accept(y.name),this.setupFullMustacheParams(y,T,void 0,!0);var E=y.indent||"";this.options.preventIndent&&E&&(this.opcode("appendContent",E),E=""),this.opcode("invokePartial",x,P,E),this.opcode("append")},PartialBlockStatement:function(y){this.PartialStatement(y)},MustacheStatement:function(y){this.SubExpression(y),y.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},Decorator:function(y){this.DecoratorBlock(y)},ContentStatement:function(y){y.value&&this.opcode("appendContent",y.value)},CommentStatement:function(){},SubExpression:function(y){l(y);var T=this.classifySexpr(y);T==="simple"?this.simpleSexpr(y):T==="helper"?this.helperSexpr(y):this.ambiguousSexpr(y)},ambiguousSexpr:function(y,T,_){var P=y.path,x=P.parts[0],E=T!=null||_!=null;this.opcode("getContext",P.depth),this.opcode("pushProgram",T),this.opcode("pushProgram",_),P.strict=!0,this.accept(P),this.opcode("invokeAmbiguous",x,E)},simpleSexpr:function(y){var T=y.path;T.strict=!0,this.accept(T),this.opcode("resolvePossibleLambda")},helperSexpr:function(y,T,_){var P=this.setupFullMustacheParams(y,T,_),x=y.path,E=x.parts[0];if(this.options.knownHelpers[E])this.opcode("invokeKnownHelper",P.length,E);else{if(this.options.knownHelpersOnly)throw new r.default("You specified knownHelpersOnly, but used the unknown helper "+E,y);x.strict=!0,x.falsy=!0,this.accept(x),this.opcode("invokeHelper",P.length,x.original,f.default.helpers.simpleId(x))}},PathExpression:function(y){this.addDepth(y.depth),this.opcode("getContext",y.depth);var T=y.parts[0],_=f.default.helpers.scopedId(y),P=!y.depth&&!_&&this.blockParamIndex(T);P?this.opcode("lookupBlockParam",P,y.parts):T?y.data?(this.options.data=!0,this.opcode("lookupData",y.depth,y.parts,y.strict)):this.opcode("lookupOnContext",y.parts,y.falsy,y.strict,_):this.opcode("pushContext")},StringLiteral:function(y){this.opcode("pushString",y.value)},NumberLiteral:function(y){this.opcode("pushLiteral",y.value)},BooleanLiteral:function(y){this.opcode("pushLiteral",y.value)},UndefinedLiteral:function(){this.opcode("pushLiteral","undefined")},NullLiteral:function(){this.opcode("pushLiteral","null")},Hash:function(y){var T=y.pairs,_=0,P=T.length;for(this.opcode("pushHash");_<P;_++)this.pushParam(T[_].value);for(;_--;)this.opcode("assignToHash",T[_].key);this.opcode("popHash")},opcode:function(y){this.opcodes.push({opcode:y,args:b.call(arguments,1),loc:this.sourceNode[0].loc})},addDepth:function(y){y&&(this.useDepths=!0)},classifySexpr:function(y){var T=f.default.helpers.simpleId(y.path),_=T&&!!this.blockParamIndex(y.path.parts[0]),P=!_&&f.default.helpers.helperExpression(y),x=!_&&(P||T);if(x&&!P){var E=y.path.parts[0],A=this.options;A.knownHelpers[E]?P=!0:A.knownHelpersOnly&&(x=!1)}return P?"helper":x?"ambiguous":"simple"},pushParams:function(y){for(var T=0,_=y.length;T<_;T++)this.pushParam(y[T])},pushParam:function(y){var T=y.value!=null?y.value:y.original||"";if(this.stringParams)T.replace&&(T=T.replace(/^(\.?\.\/)*/g,"").replace(/\//g,".")),y.depth&&this.addDepth(y.depth),this.opcode("getContext",y.depth||0),this.opcode("pushStringParam",T,y.type),y.type==="SubExpression"&&this.accept(y);else{if(this.trackIds){var _=void 0;if(!y.parts||f.default.helpers.scopedId(y)||y.depth||(_=this.blockParamIndex(y.parts[0])),_){var P=y.parts.slice(1).join(".");this.opcode("pushId","BlockParam",_,P)}else T=y.original||T,T.replace&&(T=T.replace(/^this(?:\.|$)/,"").replace(/^\.\//,"").replace(/^\.$/,"")),this.opcode("pushId",y.type,T)}this.accept(y)}},setupFullMustacheParams:function(y,T,_,P){var x=y.params;return this.pushParams(x),this.opcode("pushProgram",T),this.opcode("pushProgram",_),y.hash?this.accept(y.hash):this.opcode("emptyHash",P),x},blockParamIndex:function(y){for(var T=0,_=this.options.blockParams.length;T<_;T++){var P=this.options.blockParams[T],x=P&&g.indexOf(P,y);if(P&&x>=0)return[T,x]}}}},function(v,s,m){"use strict";function i(f){this.value=f}function n(){}function p(f,b,y,T){var _=b.popStack(),P=0,x=y.length;for(f&&x--;P<x;P++)_=b.nameLookup(_,y[P],T);return f?[b.aliasable("container.strict"),"(",_,", ",b.quotedString(y[P]),", ",JSON.stringify(b.source.currentLocation)," )"]:_}var c=m(13).default,l=m(1).default;s.__esModule=!0;var o=m(4),u=m(6),h=l(u),r=m(5),g=m(53),d=l(g);n.prototype={nameLookup:function(f,b){return this.internalNameLookup(f,b)},depthedLookup:function(f){return[this.aliasable("container.lookup"),"(depths, ",JSON.stringify(f),")"]},compilerInfo:function(){var f=o.COMPILER_REVISION,b=o.REVISION_CHANGES[f];return[f,b]},appendToBuffer:function(f,b,y){return r.isArray(f)||(f=[f]),f=this.source.wrap(f,b),this.environment.isSimple?["return ",f,";"]:y?["buffer += ",f,";"]:(f.appendToBuffer=!0,f)},initializeBuffer:function(){return this.quotedString("")},internalNameLookup:function(f,b){return this.lookupPropertyFunctionIsUsed=!0,["lookupProperty(",f,",",JSON.stringify(b),")"]},lookupPropertyFunctionIsUsed:!1,compile:function(f,b,y,T){this.environment=f,this.options=b,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!T,this.name=this.environment.name,this.isChild=!!y,this.context=y||{decorators:[],programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.blockParams=[],this.compileChildren(f,b),this.useDepths=this.useDepths||f.useDepths||f.useDecorators||this.options.compat,this.useBlockParams=this.useBlockParams||f.useBlockParams;var _=f.opcodes,P=void 0,x=void 0,E=void 0,A=void 0;for(E=0,A=_.length;E<A;E++)P=_[E],this.source.currentLocation=P.loc,x=x||P.loc,this[P.opcode].apply(this,P.args);if(this.source.currentLocation=x,this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new h.default("Compile completed with content left on stack");this.decorators.isEmpty()?this.decorators=void 0:(this.useDecorators=!0,this.decorators.prepend(["var decorators = container.decorators, ",this.lookupPropertyFunctionVarDeclaration(),`;
`]),this.decorators.push("return fn;"),T?this.decorators=Function.apply(this,["fn","props","container","depth0","data","blockParams","depths",this.decorators.merge()]):(this.decorators.prepend(`function(fn, props, container, depth0, data, blockParams, depths) {
`),this.decorators.push(`}
`),this.decorators=this.decorators.merge()));var I=this.createFunctionContext(T);if(this.isChild)return I;var R={compiler:this.compilerInfo(),main:I};this.decorators&&(R.main_d=this.decorators,R.useDecorators=!0);var C=this.context,D=C.programs,M=C.decorators;for(E=0,A=D.length;E<A;E++)D[E]&&(R[E]=D[E],M[E]&&(R[E+"_d"]=M[E],R.useDecorators=!0));return this.environment.usePartial&&(R.usePartial=!0),this.options.data&&(R.useData=!0),this.useDepths&&(R.useDepths=!0),this.useBlockParams&&(R.useBlockParams=!0),this.options.compat&&(R.compat=!0),T?R.compilerOptions=this.options:(R.compiler=JSON.stringify(R.compiler),this.source.currentLocation={start:{line:1,column:0}},R=this.objectLiteral(R),b.srcName?(R=R.toStringWithSourceMap({file:b.destName}),R.map=R.map&&R.map.toString()):R=R.toString()),R},preamble:function(){this.lastContext=0,this.source=new d.default(this.options.srcName),this.decorators=new d.default(this.options.srcName)},createFunctionContext:function(f){var b=this,y="",T=this.stackVars.concat(this.registers.list);T.length>0&&(y+=", "+T.join(", "));var _=0;c(this.aliases).forEach(function(E){var A=b.aliases[E];A.children&&A.referenceCount>1&&(y+=", alias"+ ++_+"="+E,A.children[0]="alias"+_)}),this.lookupPropertyFunctionIsUsed&&(y+=", "+this.lookupPropertyFunctionVarDeclaration());var P=["container","depth0","helpers","partials","data"];(this.useBlockParams||this.useDepths)&&P.push("blockParams"),this.useDepths&&P.push("depths");var x=this.mergeSource(y);return f?(P.push(x),Function.apply(this,P)):this.source.wrap(["function(",P.join(","),`) {
  `,x,"}"])},mergeSource:function(f){var b=this.environment.isSimple,y=!this.forceBuffer,T=void 0,_=void 0,P=void 0,x=void 0;return this.source.each(function(E){E.appendToBuffer?(P?E.prepend("  + "):P=E,x=E):(P&&(_?P.prepend("buffer += "):T=!0,x.add(";"),P=x=void 0),_=!0,b||(y=!1))}),y?P?(P.prepend("return "),x.add(";")):_||this.source.push('return "";'):(f+=", buffer = "+(T?"":this.initializeBuffer()),P?(P.prepend("return buffer + "),x.add(";")):this.source.push("return buffer;")),f&&this.source.prepend("var "+f.substring(2)+(T?"":`;
`)),this.source.merge()},lookupPropertyFunctionVarDeclaration:function(){return`
      lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    }
    `.trim()},blockValue:function(f){var b=this.aliasable("container.hooks.blockHelperMissing"),y=[this.contextName(0)];this.setupHelperArgs(f,0,y);var T=this.popStack();y.splice(1,0,T),this.push(this.source.functionCall(b,"call",y))},ambiguousBlockValue:function(){var f=this.aliasable("container.hooks.blockHelperMissing"),b=[this.contextName(0)];this.setupHelperArgs("",0,b,!0),this.flushInline();var y=this.topStack();b.splice(1,0,y),this.pushSource(["if (!",this.lastHelper,") { ",y," = ",this.source.functionCall(f,"call",b),"}"])},appendContent:function(f){this.pendingContent?f=this.pendingContent+f:this.pendingLocation=this.source.currentLocation,this.pendingContent=f},append:function(){if(this.isInline())this.replaceStack(function(b){return[" != null ? ",b,' : ""']}),this.pushSource(this.appendToBuffer(this.popStack()));else{var f=this.popStack();this.pushSource(["if (",f," != null) { ",this.appendToBuffer(f,void 0,!0)," }"]),this.environment.isSimple&&this.pushSource(["else { ",this.appendToBuffer("''",void 0,!0)," }"])}},appendEscaped:function(){this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"),"(",this.popStack(),")"]))},getContext:function(f){this.lastContext=f},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(f,b,y,T){var _=0;T||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(f[_++])),this.resolvePath("context",f,_,b,y)},lookupBlockParam:function(f,b){this.useBlockParams=!0,this.push(["blockParams[",f[0],"][",f[1],"]"]),this.resolvePath("context",b,1)},lookupData:function(f,b,y){f?this.pushStackLiteral("container.data(data, "+f+")"):this.pushStackLiteral("data"),this.resolvePath("data",b,0,!0,y)},resolvePath:function(f,b,y,T,_){var P=this;if(this.options.strict||this.options.assumeObjects)return void this.push(p(this.options.strict&&_,this,b,f));for(var x=b.length;y<x;y++)this.replaceStack(function(E){var A=P.nameLookup(E,b[y],f);return T?[" && ",A]:[" != null ? ",A," : ",E]})},resolvePossibleLambda:function(){this.push([this.aliasable("container.lambda"),"(",this.popStack(),", ",this.contextName(0),")"])},pushStringParam:function(f,b){this.pushContext(),this.pushString(b),b!=="SubExpression"&&(typeof f=="string"?this.pushString(f):this.pushStackLiteral(f))},emptyHash:function(f){this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}")),this.pushStackLiteral(f?"undefined":"{}")},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:{},types:[],contexts:[],ids:[]}},popHash:function(){var f=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push(this.objectLiteral(f.ids)),this.stringParams&&(this.push(this.objectLiteral(f.contexts)),this.push(this.objectLiteral(f.types))),this.push(this.objectLiteral(f.values))},pushString:function(f){this.pushStackLiteral(this.quotedString(f))},pushLiteral:function(f){this.pushStackLiteral(f)},pushProgram:function(f){f!=null?this.pushStackLiteral(this.programExpression(f)):this.pushStackLiteral(null)},registerDecorator:function(f,b){var y=this.nameLookup("decorators",b,"decorator"),T=this.setupHelperArgs(b,f);this.decorators.push(["fn = ",this.decorators.functionCall(y,"",["fn","props","container",T])," || fn;"])},invokeHelper:function(f,b,y){var T=this.popStack(),_=this.setupHelper(f,b),P=[];y&&P.push(_.name),P.push(T),this.options.strict||P.push(this.aliasable("container.hooks.helperMissing"));var x=["(",this.itemsSeparatedBy(P,"||"),")"],E=this.source.functionCall(x,"call",_.callParams);this.push(E)},itemsSeparatedBy:function(f,b){var y=[];y.push(f[0]);for(var T=1;T<f.length;T++)y.push(b,f[T]);return y},invokeKnownHelper:function(f,b){var y=this.setupHelper(f,b);this.push(this.source.functionCall(y.name,"call",y.callParams))},invokeAmbiguous:function(f,b){this.useRegister("helper");var y=this.popStack();this.emptyHash();var T=this.setupHelper(0,f,b),_=this.lastHelper=this.nameLookup("helpers",f,"helper"),P=["(","(helper = ",_," || ",y,")"];this.options.strict||(P[0]="(helper = ",P.push(" != null ? helper : ",this.aliasable("container.hooks.helperMissing"))),this.push(["(",P,T.paramsInit?["),(",T.paramsInit]:[],"),","(typeof helper === ",this.aliasable('"function"')," ? ",this.source.functionCall("helper","call",T.callParams)," : helper))"])},invokePartial:function(f,b,y){var T=[],_=this.setupParams(b,1,T);f&&(b=this.popStack(),delete _.name),y&&(_.indent=JSON.stringify(y)),_.helpers="helpers",_.partials="partials",_.decorators="container.decorators",f?T.unshift(b):T.unshift(this.nameLookup("partials",b,"partial")),this.options.compat&&(_.depths="depths"),_=this.objectLiteral(_),T.push(_),this.push(this.source.functionCall("container.invokePartial","",T))},assignToHash:function(f){var b=this.popStack(),y=void 0,T=void 0,_=void 0;this.trackIds&&(_=this.popStack()),this.stringParams&&(T=this.popStack(),y=this.popStack());var P=this.hash;y&&(P.contexts[f]=y),T&&(P.types[f]=T),_&&(P.ids[f]=_),P.values[f]=b},pushId:function(f,b,y){f==="BlockParam"?this.pushStackLiteral("blockParams["+b[0]+"].path["+b[1]+"]"+(y?" + "+JSON.stringify("."+y):"")):f==="PathExpression"?this.pushString(b):f==="SubExpression"?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:n,compileChildren:function(f,b){for(var y=f.children,T=void 0,_=void 0,P=0,x=y.length;P<x;P++){T=y[P],_=new this.compiler;var E=this.matchExistingProgram(T);if(E==null){this.context.programs.push("");var A=this.context.programs.length;T.index=A,T.name="program"+A,this.context.programs[A]=_.compile(T,b,this.context,!this.precompile),this.context.decorators[A]=_.decorators,this.context.environments[A]=T,this.useDepths=this.useDepths||_.useDepths,this.useBlockParams=this.useBlockParams||_.useBlockParams,T.useDepths=this.useDepths,T.useBlockParams=this.useBlockParams}else T.index=E.index,T.name="program"+E.index,this.useDepths=this.useDepths||E.useDepths,this.useBlockParams=this.useBlockParams||E.useBlockParams}},matchExistingProgram:function(f){for(var b=0,y=this.context.environments.length;b<y;b++){var T=this.context.environments[b];if(T&&T.equals(f))return T}},programExpression:function(f){var b=this.environment.children[f],y=[b.index,"data",b.blockParams];return(this.useBlockParams||this.useDepths)&&y.push("blockParams"),this.useDepths&&y.push("depths"),"container.program("+y.join(", ")+")"},useRegister:function(f){this.registers[f]||(this.registers[f]=!0,this.registers.list.push(f))},push:function(f){return f instanceof i||(f=this.source.wrap(f)),this.inlineStack.push(f),f},pushStackLiteral:function(f){this.push(new i(f))},pushSource:function(f){this.pendingContent&&(this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation)),this.pendingContent=void 0),f&&this.source.push(f)},replaceStack:function(f){var b=["("],y=void 0,T=void 0,_=void 0;if(!this.isInline())throw new h.default("replaceStack on non-inline");var P=this.popStack(!0);if(P instanceof i)y=[P.value],b=["(",y],_=!0;else{T=!0;var x=this.incrStack();b=["((",this.push(x)," = ",P,")"],y=this.topStack()}var E=f.call(this,y);_||this.popStack(),T&&this.stackSlot--,this.push(b.concat(E,")"))},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var f=this.inlineStack;this.inlineStack=[];for(var b=0,y=f.length;b<y;b++){var T=f[b];if(T instanceof i)this.compileStack.push(T);else{var _=this.incrStack();this.pushSource([_," = ",T,";"]),this.compileStack.push(_)}}},isInline:function(){return this.inlineStack.length},popStack:function(f){var b=this.isInline(),y=(b?this.inlineStack:this.compileStack).pop();if(!f&&y instanceof i)return y.value;if(!b){if(!this.stackSlot)throw new h.default("Invalid stack pop");this.stackSlot--}return y},topStack:function(){var f=this.isInline()?this.inlineStack:this.compileStack,b=f[f.length-1];return b instanceof i?b.value:b},contextName:function(f){return this.useDepths&&f?"depths["+f+"]":"depth"+f},quotedString:function(f){return this.source.quotedString(f)},objectLiteral:function(f){return this.source.objectLiteral(f)},aliasable:function(f){var b=this.aliases[f];return b?(b.referenceCount++,b):(b=this.aliases[f]=this.source.wrap(f),b.aliasable=!0,b.referenceCount=1,b)},setupHelper:function(f,b,y){var T=[],_=this.setupHelperArgs(b,f,T,y),P=this.nameLookup("helpers",b,"helper"),x=this.aliasable(this.contextName(0)+" != null ? "+this.contextName(0)+" : (container.nullContext || {})");return{params:T,paramsInit:_,name:P,callParams:[x].concat(T)}},setupParams:function(f,b,y){var T={},_=[],P=[],x=[],E=!y,A=void 0;E&&(y=[]),T.name=this.quotedString(f),T.hash=this.popStack(),this.trackIds&&(T.hashIds=this.popStack()),this.stringParams&&(T.hashTypes=this.popStack(),T.hashContexts=this.popStack());var I=this.popStack(),R=this.popStack();(R||I)&&(T.fn=R||"container.noop",T.inverse=I||"container.noop");for(var C=b;C--;)A=this.popStack(),y[C]=A,this.trackIds&&(x[C]=this.popStack()),this.stringParams&&(P[C]=this.popStack(),_[C]=this.popStack());return E&&(T.args=this.source.generateArray(y)),this.trackIds&&(T.ids=this.source.generateArray(x)),this.stringParams&&(T.types=this.source.generateArray(P),T.contexts=this.source.generateArray(_)),this.options.data&&(T.data="data"),this.useBlockParams&&(T.blockParams="blockParams"),T},setupHelperArgs:function(f,b,y,T){var _=this.setupParams(f,b,y);return _.loc=JSON.stringify(this.source.currentLocation),_=this.objectLiteral(_),T?(this.useRegister("options"),y.push("options"),["options=",_]):y?(y.push(_),""):_}},function(){for(var f="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" "),b=n.RESERVED_WORDS={},y=0,T=f.length;y<T;y++)b[f[y]]=!0}(),n.isValidJavaScriptVariableName=function(f){return!n.RESERVED_WORDS[f]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(f)},s.default=n,v.exports=s.default},function(v,s,m){"use strict";function i(o,u,h){if(c.isArray(o)){for(var r=[],g=0,d=o.length;g<d;g++)r.push(u.wrap(o[g],h));return r}return typeof o=="boolean"||typeof o=="number"?o+"":o}function n(o){this.srcFile=o,this.source=[]}var p=m(13).default;s.__esModule=!0;var c=m(5),l=void 0;try{}catch(o){}l||(l=function(o,u,h,r){this.src="",r&&this.add(r)},l.prototype={add:function(o){c.isArray(o)&&(o=o.join("")),this.src+=o},prepend:function(o){c.isArray(o)&&(o=o.join("")),this.src=o+this.src},toStringWithSourceMap:function(){return{code:this.toString()}},toString:function(){return this.src}}),n.prototype={isEmpty:function(){return!this.source.length},prepend:function(o,u){this.source.unshift(this.wrap(o,u))},push:function(o,u){this.source.push(this.wrap(o,u))},merge:function(){var o=this.empty();return this.each(function(u){o.add(["  ",u,`
`])}),o},each:function(o){for(var u=0,h=this.source.length;u<h;u++)o(this.source[u])},empty:function(){var o=this.currentLocation||{start:{}};return new l(o.start.line,o.start.column,this.srcFile)},wrap:function(o){var u=arguments.length<=1||arguments[1]===void 0?this.currentLocation||{start:{}}:arguments[1];return o instanceof l?o:(o=i(o,this,u),new l(u.start.line,u.start.column,this.srcFile,o))},functionCall:function(o,u,h){return h=this.generateList(h),this.wrap([o,u?"."+u+"(":"(",h,")"])},quotedString:function(o){return'"'+(o+"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(o){var u=this,h=[];p(o).forEach(function(g){var d=i(o[g],u);d!=="undefined"&&h.push([u.quotedString(g),":",d])});var r=this.generateList(h);return r.prepend("{"),r.add("}"),r},generateList:function(o){for(var u=this.empty(),h=0,r=o.length;h<r;h++)h&&u.add(","),u.add(i(o[h],this));return u},generateArray:function(o){var u=this.generateList(o);return u.prepend("["),u.add("]"),u}},s.default=n,v.exports=s.default}])})},9414:(w,v,s)=>{var m;/*!
* Sizzle CSS Selector Engine v2.3.6
* https://sizzlejs.com/
*
* Copyright JS Foundation and other contributors
* Released under the MIT license
* https://js.foundation/
*
* Date: 2021-02-16
*/(function(i){var n,p,c,l,o,u,h,r,g,d,f,b,y,T,_,P,x,E,A,I="sizzle"+1*new Date,R=i.document,C=0,D=0,M=tn(),B=tn(),k=tn(),G=tn(),H=function(O,U){return O===U&&(f=!0),0},$={}.hasOwnProperty,j=[],K=j.pop,W=j.push,te=j.push,ae=j.slice,me=function(O,U){for(var V=0,ie=O.length;V<ie;V++)if(O[V]===U)return V;return-1},Q="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",ve="[\\x20\\t\\r\\n\\f]",Ee="(?:\\\\[\\da-fA-F]{1,6}"+ve+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",We="\\["+ve+"*("+Ee+")(?:"+ve+"*([*^$|!~]?=)"+ve+`*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(`+Ee+"))|)"+ve+"*\\]",gt=":("+Ee+`)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|`+We+")*)|.*)\\)|)",Nt=new RegExp(ve+"+","g"),Dt=new RegExp("^"+ve+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ve+"+$","g"),Ct=new RegExp("^"+ve+"*,"+ve+"*"),$t=new RegExp("^"+ve+"*([>+~]|"+ve+")"+ve+"*"),qe=new RegExp(ve+"|>"),Ft=new RegExp(gt),Je=new RegExp("^"+Ee+"$"),et={ID:new RegExp("^#("+Ee+")"),CLASS:new RegExp("^\\.("+Ee+")"),TAG:new RegExp("^("+Ee+"|[*])"),ATTR:new RegExp("^"+We),PSEUDO:new RegExp("^"+gt),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ve+"*(even|odd|(([+-]|)(\\d*)n|)"+ve+"*(?:([+-]|)"+ve+"*(\\d+)|))"+ve+"*\\)|)","i"),bool:new RegExp("^(?:"+Q+")$","i"),needsContext:new RegExp("^"+ve+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ve+"*((?:-\\d)?\\d*)"+ve+"*\\)|)(?=[^-]|$)","i")},Wt=/HTML$/i,Fn=/^(?:input|select|textarea|button)$/i,Et=/^h\d$/i,Kt=/^[^{]+\{\s*\[native \w/,yn=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Ot=/[+~]/,lt=new RegExp("\\\\[\\da-fA-F]{1,6}"+ve+"?|\\\\([^\\r\\n\\f])","g"),ft=function(O,U){var V="0x"+O.slice(1)-65536;return U||(V<0?String.fromCharCode(V+65536):String.fromCharCode(V>>10|55296,V&1023|56320))},In=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ni=function(O,U){return U?O==="\0"?"\uFFFD":O.slice(0,-1)+"\\"+O.charCodeAt(O.length-1).toString(16)+" ":"\\"+O},en=function(){b()},yi=Re(function(O){return O.disabled===!0&&O.nodeName.toLowerCase()==="fieldset"},{dir:"parentNode",next:"legend"});try{te.apply(j=ae.call(R.childNodes),R.childNodes),j[R.childNodes.length].nodeType}catch(O){te={apply:j.length?function(U,V){W.apply(U,ae.call(V))}:function(U,V){for(var ie=U.length,Y=0;U[ie++]=V[Y++];);U.length=ie-1}}}function tt(O,U,V,ie){var Y,re,se,be,Pe,Me,Le,He=U&&U.ownerDocument,Ye=U?U.nodeType:9;if(V=V||[],typeof O!="string"||!O||Ye!==1&&Ye!==9&&Ye!==11)return V;if(!ie&&(b(U),U=U||y,_)){if(Ye!==11&&(Pe=yn.exec(O)))if(Y=Pe[1]){if(Ye===9)if(se=U.getElementById(Y)){if(se.id===Y)return V.push(se),V}else return V;else if(He&&(se=He.getElementById(Y))&&A(U,se)&&se.id===Y)return V.push(se),V}else{if(Pe[2])return te.apply(V,U.getElementsByTagName(O)),V;if((Y=Pe[3])&&p.getElementsByClassName&&U.getElementsByClassName)return te.apply(V,U.getElementsByClassName(Y)),V}if(p.qsa&&!G[O+" "]&&(!P||!P.test(O))&&(Ye!==1||U.nodeName.toLowerCase()!=="object")){if(Le=O,He=U,Ye===1&&(qe.test(O)||$t.test(O))){for(He=Ot.test(O)&&Te(U.parentNode)||U,(He!==U||!p.scope)&&((be=U.getAttribute("id"))?be=be.replace(In,ni):U.setAttribute("id",be=I)),Me=u(O),re=Me.length;re--;)Me[re]=(be?"#"+be:":scope")+" "+ke(Me[re]);Le=Me.join(",")}try{return te.apply(V,He.querySelectorAll(Le)),V}catch(at){G(O,!0)}finally{be===I&&U.removeAttribute("id")}}}return r(O.replace(Dt,"$1"),U,V,ie)}function tn(){var O=[];function U(V,ie){return O.push(V+" ")>c.cacheLength&&delete U[O.shift()],U[V+" "]=ie}return U}function Ht(O){return O[I]=!0,O}function fe(O){var U=y.createElement("fieldset");try{return!!O(U)}catch(V){return!1}finally{U.parentNode&&U.parentNode.removeChild(U),U=null}}function Z(O,U){for(var V=O.split("|"),ie=V.length;ie--;)c.attrHandle[V[ie]]=U}function de(O,U){var V=U&&O,ie=V&&O.nodeType===1&&U.nodeType===1&&O.sourceIndex-U.sourceIndex;if(ie)return ie;if(V){for(;V=V.nextSibling;)if(V===U)return-1}return O?1:-1}function _e(O){return function(U){var V=U.nodeName.toLowerCase();return V==="input"&&U.type===O}}function ne(O){return function(U){var V=U.nodeName.toLowerCase();return(V==="input"||V==="button")&&U.type===O}}function ge(O){return function(U){return"form"in U?U.parentNode&&U.disabled===!1?"label"in U?"label"in U.parentNode?U.parentNode.disabled===O:U.disabled===O:U.isDisabled===O||U.isDisabled!==!O&&yi(U)===O:U.disabled===O:"label"in U?U.disabled===O:!1}}function ce(O){return Ht(function(U){return U=+U,Ht(function(V,ie){for(var Y,re=O([],V.length,U),se=re.length;se--;)V[Y=re[se]]&&(V[Y]=!(ie[Y]=V[Y]))})})}function Te(O){return O&&typeof O.getElementsByTagName!="undefined"&&O}p=tt.support={},o=tt.isXML=function(O){var U=O&&O.namespaceURI,V=O&&(O.ownerDocument||O).documentElement;return!Wt.test(U||V&&V.nodeName||"HTML")},b=tt.setDocument=function(O){var U,V,ie=O?O.ownerDocument||O:R;return ie==y||ie.nodeType!==9||!ie.documentElement||(y=ie,T=y.documentElement,_=!o(y),R!=y&&(V=y.defaultView)&&V.top!==V&&(V.addEventListener?V.addEventListener("unload",en,!1):V.attachEvent&&V.attachEvent("onunload",en)),p.scope=fe(function(Y){return T.appendChild(Y).appendChild(y.createElement("div")),typeof Y.querySelectorAll!="undefined"&&!Y.querySelectorAll(":scope fieldset div").length}),p.attributes=fe(function(Y){return Y.className="i",!Y.getAttribute("className")}),p.getElementsByTagName=fe(function(Y){return Y.appendChild(y.createComment("")),!Y.getElementsByTagName("*").length}),p.getElementsByClassName=Kt.test(y.getElementsByClassName),p.getById=fe(function(Y){return T.appendChild(Y).id=I,!y.getElementsByName||!y.getElementsByName(I).length}),p.getById?(c.filter.ID=function(Y){var re=Y.replace(lt,ft);return function(se){return se.getAttribute("id")===re}},c.find.ID=function(Y,re){if(typeof re.getElementById!="undefined"&&_){var se=re.getElementById(Y);return se?[se]:[]}}):(c.filter.ID=function(Y){var re=Y.replace(lt,ft);return function(se){var be=typeof se.getAttributeNode!="undefined"&&se.getAttributeNode("id");return be&&be.value===re}},c.find.ID=function(Y,re){if(typeof re.getElementById!="undefined"&&_){var se,be,Pe,Me=re.getElementById(Y);if(Me){if(se=Me.getAttributeNode("id"),se&&se.value===Y)return[Me];for(Pe=re.getElementsByName(Y),be=0;Me=Pe[be++];)if(se=Me.getAttributeNode("id"),se&&se.value===Y)return[Me]}return[]}}),c.find.TAG=p.getElementsByTagName?function(Y,re){if(typeof re.getElementsByTagName!="undefined")return re.getElementsByTagName(Y);if(p.qsa)return re.querySelectorAll(Y)}:function(Y,re){var se,be=[],Pe=0,Me=re.getElementsByTagName(Y);if(Y==="*"){for(;se=Me[Pe++];)se.nodeType===1&&be.push(se);return be}return Me},c.find.CLASS=p.getElementsByClassName&&function(Y,re){if(typeof re.getElementsByClassName!="undefined"&&_)return re.getElementsByClassName(Y)},x=[],P=[],(p.qsa=Kt.test(y.querySelectorAll))&&(fe(function(Y){var re;T.appendChild(Y).innerHTML="<a id='"+I+"'></a><select id='"+I+"-\r\\' msallowcapture=''><option selected=''></option></select>",Y.querySelectorAll("[msallowcapture^='']").length&&P.push("[*^$]="+ve+`*(?:''|"")`),Y.querySelectorAll("[selected]").length||P.push("\\["+ve+"*(?:value|"+Q+")"),Y.querySelectorAll("[id~="+I+"-]").length||P.push("~="),re=y.createElement("input"),re.setAttribute("name",""),Y.appendChild(re),Y.querySelectorAll("[name='']").length||P.push("\\["+ve+"*name"+ve+"*="+ve+`*(?:''|"")`),Y.querySelectorAll(":checked").length||P.push(":checked"),Y.querySelectorAll("a#"+I+"+*").length||P.push(".#.+[+~]"),Y.querySelectorAll("\\\f"),P.push("[\\r\\n\\f]")}),fe(function(Y){Y.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var re=y.createElement("input");re.setAttribute("type","hidden"),Y.appendChild(re).setAttribute("name","D"),Y.querySelectorAll("[name=d]").length&&P.push("name"+ve+"*[*^$|!~]?="),Y.querySelectorAll(":enabled").length!==2&&P.push(":enabled",":disabled"),T.appendChild(Y).disabled=!0,Y.querySelectorAll(":disabled").length!==2&&P.push(":enabled",":disabled"),Y.querySelectorAll("*,:x"),P.push(",.*:")})),(p.matchesSelector=Kt.test(E=T.matches||T.webkitMatchesSelector||T.mozMatchesSelector||T.oMatchesSelector||T.msMatchesSelector))&&fe(function(Y){p.disconnectedMatch=E.call(Y,"*"),E.call(Y,"[s!='']:x"),x.push("!=",gt)}),P=P.length&&new RegExp(P.join("|")),x=x.length&&new RegExp(x.join("|")),U=Kt.test(T.compareDocumentPosition),A=U||Kt.test(T.contains)?function(Y,re){var se=Y.nodeType===9?Y.documentElement:Y,be=re&&re.parentNode;return Y===be||!!(be&&be.nodeType===1&&(se.contains?se.contains(be):Y.compareDocumentPosition&&Y.compareDocumentPosition(be)&16))}:function(Y,re){if(re){for(;re=re.parentNode;)if(re===Y)return!0}return!1},H=U?function(Y,re){if(Y===re)return f=!0,0;var se=!Y.compareDocumentPosition-!re.compareDocumentPosition;return se||(se=(Y.ownerDocument||Y)==(re.ownerDocument||re)?Y.compareDocumentPosition(re):1,se&1||!p.sortDetached&&re.compareDocumentPosition(Y)===se?Y==y||Y.ownerDocument==R&&A(R,Y)?-1:re==y||re.ownerDocument==R&&A(R,re)?1:d?me(d,Y)-me(d,re):0:se&4?-1:1)}:function(Y,re){if(Y===re)return f=!0,0;var se,be=0,Pe=Y.parentNode,Me=re.parentNode,Le=[Y],He=[re];if(!Pe||!Me)return Y==y?-1:re==y?1:Pe?-1:Me?1:d?me(d,Y)-me(d,re):0;if(Pe===Me)return de(Y,re);for(se=Y;se=se.parentNode;)Le.unshift(se);for(se=re;se=se.parentNode;)He.unshift(se);for(;Le[be]===He[be];)be++;return be?de(Le[be],He[be]):Le[be]==R?-1:He[be]==R?1:0}),y},tt.matches=function(O,U){return tt(O,null,null,U)},tt.matchesSelector=function(O,U){if(b(O),p.matchesSelector&&_&&!G[U+" "]&&(!x||!x.test(U))&&(!P||!P.test(U)))try{var V=E.call(O,U);if(V||p.disconnectedMatch||O.document&&O.document.nodeType!==11)return V}catch(ie){G(U,!0)}return tt(U,y,null,[O]).length>0},tt.contains=function(O,U){return(O.ownerDocument||O)!=y&&b(O),A(O,U)},tt.attr=function(O,U){(O.ownerDocument||O)!=y&&b(O);var V=c.attrHandle[U.toLowerCase()],ie=V&&$.call(c.attrHandle,U.toLowerCase())?V(O,U,!_):void 0;return ie!==void 0?ie:p.attributes||!_?O.getAttribute(U):(ie=O.getAttributeNode(U))&&ie.specified?ie.value:null},tt.escape=function(O){return(O+"").replace(In,ni)},tt.error=function(O){throw new Error("Syntax error, unrecognized expression: "+O)},tt.uniqueSort=function(O){var U,V=[],ie=0,Y=0;if(f=!p.detectDuplicates,d=!p.sortStable&&O.slice(0),O.sort(H),f){for(;U=O[Y++];)U===O[Y]&&(ie=V.push(Y));for(;ie--;)O.splice(V[ie],1)}return d=null,O},l=tt.getText=function(O){var U,V="",ie=0,Y=O.nodeType;if(Y){if(Y===1||Y===9||Y===11){if(typeof O.textContent=="string")return O.textContent;for(O=O.firstChild;O;O=O.nextSibling)V+=l(O)}else if(Y===3||Y===4)return O.nodeValue}else for(;U=O[ie++];)V+=l(U);return V},c=tt.selectors={cacheLength:50,createPseudo:Ht,match:et,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(O){return O[1]=O[1].replace(lt,ft),O[3]=(O[3]||O[4]||O[5]||"").replace(lt,ft),O[2]==="~="&&(O[3]=" "+O[3]+" "),O.slice(0,4)},CHILD:function(O){return O[1]=O[1].toLowerCase(),O[1].slice(0,3)==="nth"?(O[3]||tt.error(O[0]),O[4]=+(O[4]?O[5]+(O[6]||1):2*(O[3]==="even"||O[3]==="odd")),O[5]=+(O[7]+O[8]||O[3]==="odd")):O[3]&&tt.error(O[0]),O},PSEUDO:function(O){var U,V=!O[6]&&O[2];return et.CHILD.test(O[0])?null:(O[3]?O[2]=O[4]||O[5]||"":V&&Ft.test(V)&&(U=u(V,!0))&&(U=V.indexOf(")",V.length-U)-V.length)&&(O[0]=O[0].slice(0,U),O[2]=V.slice(0,U)),O.slice(0,3))}},filter:{TAG:function(O){var U=O.replace(lt,ft).toLowerCase();return O==="*"?function(){return!0}:function(V){return V.nodeName&&V.nodeName.toLowerCase()===U}},CLASS:function(O){var U=M[O+" "];return U||(U=new RegExp("(^|"+ve+")"+O+"("+ve+"|$)"))&&M(O,function(V){return U.test(typeof V.className=="string"&&V.className||typeof V.getAttribute!="undefined"&&V.getAttribute("class")||"")})},ATTR:function(O,U,V){return function(ie){var Y=tt.attr(ie,O);return Y==null?U==="!=":U?(Y+="",U==="="?Y===V:U==="!="?Y!==V:U==="^="?V&&Y.indexOf(V)===0:U==="*="?V&&Y.indexOf(V)>-1:U==="$="?V&&Y.slice(-V.length)===V:U==="~="?(" "+Y.replace(Nt," ")+" ").indexOf(V)>-1:U==="|="?Y===V||Y.slice(0,V.length+1)===V+"-":!1):!0}},CHILD:function(O,U,V,ie,Y){var re=O.slice(0,3)!=="nth",se=O.slice(-4)!=="last",be=U==="of-type";return ie===1&&Y===0?function(Pe){return!!Pe.parentNode}:function(Pe,Me,Le){var He,Ye,at,Oe,Pt,It,ye=re!==se?"nextSibling":"previousSibling",pe=Pe.parentNode,Se=be&&Pe.nodeName.toLowerCase(),we=!Le&&!be,Ne=!1;if(pe){if(re){for(;ye;){for(Oe=Pe;Oe=Oe[ye];)if(be?Oe.nodeName.toLowerCase()===Se:Oe.nodeType===1)return!1;It=ye=O==="only"&&!It&&"nextSibling"}return!0}if(It=[se?pe.firstChild:pe.lastChild],se&&we){for(Oe=pe,at=Oe[I]||(Oe[I]={}),Ye=at[Oe.uniqueID]||(at[Oe.uniqueID]={}),He=Ye[O]||[],Pt=He[0]===C&&He[1],Ne=Pt&&He[2],Oe=Pt&&pe.childNodes[Pt];Oe=++Pt&&Oe&&Oe[ye]||(Ne=Pt=0)||It.pop();)if(Oe.nodeType===1&&++Ne&&Oe===Pe){Ye[O]=[C,Pt,Ne];break}}else if(we&&(Oe=Pe,at=Oe[I]||(Oe[I]={}),Ye=at[Oe.uniqueID]||(at[Oe.uniqueID]={}),He=Ye[O]||[],Pt=He[0]===C&&He[1],Ne=Pt),Ne===!1)for(;(Oe=++Pt&&Oe&&Oe[ye]||(Ne=Pt=0)||It.pop())&&!((be?Oe.nodeName.toLowerCase()===Se:Oe.nodeType===1)&&++Ne&&(we&&(at=Oe[I]||(Oe[I]={}),Ye=at[Oe.uniqueID]||(at[Oe.uniqueID]={}),Ye[O]=[C,Ne]),Oe===Pe)););return Ne-=Y,Ne===ie||Ne%ie===0&&Ne/ie>=0}}},PSEUDO:function(O,U){var V,ie=c.pseudos[O]||c.setFilters[O.toLowerCase()]||tt.error("unsupported pseudo: "+O);return ie[I]?ie(U):ie.length>1?(V=[O,O,"",U],c.setFilters.hasOwnProperty(O.toLowerCase())?Ht(function(Y,re){for(var se,be=ie(Y,U),Pe=be.length;Pe--;)se=me(Y,be[Pe]),Y[se]=!(re[se]=be[Pe])}):function(Y){return ie(Y,0,V)}):ie}},pseudos:{not:Ht(function(O){var U=[],V=[],ie=h(O.replace(Dt,"$1"));return ie[I]?Ht(function(Y,re,se,be){for(var Pe,Me=ie(Y,null,be,[]),Le=Y.length;Le--;)(Pe=Me[Le])&&(Y[Le]=!(re[Le]=Pe))}):function(Y,re,se){return U[0]=Y,ie(U,null,se,V),U[0]=null,!V.pop()}}),has:Ht(function(O){return function(U){return tt(O,U).length>0}}),contains:Ht(function(O){return O=O.replace(lt,ft),function(U){return(U.textContent||l(U)).indexOf(O)>-1}}),lang:Ht(function(O){return Je.test(O||"")||tt.error("unsupported lang: "+O),O=O.replace(lt,ft).toLowerCase(),function(U){var V;do if(V=_?U.lang:U.getAttribute("xml:lang")||U.getAttribute("lang"))return V=V.toLowerCase(),V===O||V.indexOf(O+"-")===0;while((U=U.parentNode)&&U.nodeType===1);return!1}}),target:function(O){var U=i.location&&i.location.hash;return U&&U.slice(1)===O.id},root:function(O){return O===T},focus:function(O){return O===y.activeElement&&(!y.hasFocus||y.hasFocus())&&!!(O.type||O.href||~O.tabIndex)},enabled:ge(!1),disabled:ge(!0),checked:function(O){var U=O.nodeName.toLowerCase();return U==="input"&&!!O.checked||U==="option"&&!!O.selected},selected:function(O){return O.parentNode&&O.parentNode.selectedIndex,O.selected===!0},empty:function(O){for(O=O.firstChild;O;O=O.nextSibling)if(O.nodeType<6)return!1;return!0},parent:function(O){return!c.pseudos.empty(O)},header:function(O){return Et.test(O.nodeName)},input:function(O){return Fn.test(O.nodeName)},button:function(O){var U=O.nodeName.toLowerCase();return U==="input"&&O.type==="button"||U==="button"},text:function(O){var U;return O.nodeName.toLowerCase()==="input"&&O.type==="text"&&((U=O.getAttribute("type"))==null||U.toLowerCase()==="text")},first:ce(function(){return[0]}),last:ce(function(O,U){return[U-1]}),eq:ce(function(O,U,V){return[V<0?V+U:V]}),even:ce(function(O,U){for(var V=0;V<U;V+=2)O.push(V);return O}),odd:ce(function(O,U){for(var V=1;V<U;V+=2)O.push(V);return O}),lt:ce(function(O,U,V){for(var ie=V<0?V+U:V>U?U:V;--ie>=0;)O.push(ie);return O}),gt:ce(function(O,U,V){for(var ie=V<0?V+U:V;++ie<U;)O.push(ie);return O})}},c.pseudos.nth=c.pseudos.eq;for(n in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})c.pseudos[n]=_e(n);for(n in{submit:!0,reset:!0})c.pseudos[n]=ne(n);function Ce(){}Ce.prototype=c.filters=c.pseudos,c.setFilters=new Ce,u=tt.tokenize=function(O,U){var V,ie,Y,re,se,be,Pe,Me=B[O+" "];if(Me)return U?0:Me.slice(0);for(se=O,be=[],Pe=c.preFilter;se;){(!V||(ie=Ct.exec(se)))&&(ie&&(se=se.slice(ie[0].length)||se),be.push(Y=[])),V=!1,(ie=$t.exec(se))&&(V=ie.shift(),Y.push({value:V,type:ie[0].replace(Dt," ")}),se=se.slice(V.length));for(re in c.filter)(ie=et[re].exec(se))&&(!Pe[re]||(ie=Pe[re](ie)))&&(V=ie.shift(),Y.push({value:V,type:re,matches:ie}),se=se.slice(V.length));if(!V)break}return U?se.length:se?tt.error(O):B(O,be).slice(0)};function ke(O){for(var U=0,V=O.length,ie="";U<V;U++)ie+=O[U].value;return ie}function Re(O,U,V){var ie=U.dir,Y=U.next,re=Y||ie,se=V&&re==="parentNode",be=D++;return U.first?function(Pe,Me,Le){for(;Pe=Pe[ie];)if(Pe.nodeType===1||se)return O(Pe,Me,Le);return!1}:function(Pe,Me,Le){var He,Ye,at,Oe=[C,be];if(Le){for(;Pe=Pe[ie];)if((Pe.nodeType===1||se)&&O(Pe,Me,Le))return!0}else for(;Pe=Pe[ie];)if(Pe.nodeType===1||se)if(at=Pe[I]||(Pe[I]={}),Ye=at[Pe.uniqueID]||(at[Pe.uniqueID]={}),Y&&Y===Pe.nodeName.toLowerCase())Pe=Pe[ie]||Pe;else{if((He=Ye[re])&&He[0]===C&&He[1]===be)return Oe[2]=He[2];if(Ye[re]=Oe,Oe[2]=O(Pe,Me,Le))return!0}return!1}}function xe(O){return O.length>1?function(U,V,ie){for(var Y=O.length;Y--;)if(!O[Y](U,V,ie))return!1;return!0}:O[0]}function Fe(O,U,V){for(var ie=0,Y=U.length;ie<Y;ie++)tt(O,U[ie],V);return V}function $e(O,U,V,ie,Y){for(var re,se=[],be=0,Pe=O.length,Me=U!=null;be<Pe;be++)(re=O[be])&&(!V||V(re,ie,Y))&&(se.push(re),Me&&U.push(be));return se}function rt(O,U,V,ie,Y,re){return ie&&!ie[I]&&(ie=rt(ie)),Y&&!Y[I]&&(Y=rt(Y,re)),Ht(function(se,be,Pe,Me){var Le,He,Ye,at=[],Oe=[],Pt=be.length,It=se||Fe(U||"*",Pe.nodeType?[Pe]:Pe,[]),ye=O&&(se||!U)?$e(It,at,O,Pe,Me):It,pe=V?Y||(se?O:Pt||ie)?[]:be:ye;if(V&&V(ye,pe,Pe,Me),ie)for(Le=$e(pe,Oe),ie(Le,[],Pe,Me),He=Le.length;He--;)(Ye=Le[He])&&(pe[Oe[He]]=!(ye[Oe[He]]=Ye));if(se){if(Y||O){if(Y){for(Le=[],He=pe.length;He--;)(Ye=pe[He])&&Le.push(ye[He]=Ye);Y(null,pe=[],Le,Me)}for(He=pe.length;He--;)(Ye=pe[He])&&(Le=Y?me(se,Ye):at[He])>-1&&(se[Le]=!(be[Le]=Ye))}}else pe=$e(pe===be?pe.splice(Pt,pe.length):pe),Y?Y(null,be,pe,Me):te.apply(be,pe)})}function _t(O){for(var U,V,ie,Y=O.length,re=c.relative[O[0].type],se=re||c.relative[" "],be=re?1:0,Pe=Re(function(He){return He===U},se,!0),Me=Re(function(He){return me(U,He)>-1},se,!0),Le=[function(He,Ye,at){var Oe=!re&&(at||Ye!==g)||((U=Ye).nodeType?Pe(He,Ye,at):Me(He,Ye,at));return U=null,Oe}];be<Y;be++)if(V=c.relative[O[be].type])Le=[Re(xe(Le),V)];else{if(V=c.filter[O[be].type].apply(null,O[be].matches),V[I]){for(ie=++be;ie<Y&&!c.relative[O[ie].type];ie++);return rt(be>1&&xe(Le),be>1&&ke(O.slice(0,be-1).concat({value:O[be-2].type===" "?"*":""})).replace(Dt,"$1"),V,be<ie&&_t(O.slice(be,ie)),ie<Y&&_t(O=O.slice(ie)),ie<Y&&ke(O))}Le.push(V)}return xe(Le)}function Ve(O,U){var V=U.length>0,ie=O.length>0,Y=function(re,se,be,Pe,Me){var Le,He,Ye,at=0,Oe="0",Pt=re&&[],It=[],ye=g,pe=re||ie&&c.find.TAG("*",Me),Se=C+=ye==null?1:Math.random()||.1,we=pe.length;for(Me&&(g=se==y||se||Me);Oe!==we&&(Le=pe[Oe])!=null;Oe++){if(ie&&Le){for(He=0,!se&&Le.ownerDocument!=y&&(b(Le),be=!_);Ye=O[He++];)if(Ye(Le,se||y,be)){Pe.push(Le);break}Me&&(C=Se)}V&&((Le=!Ye&&Le)&&at--,re&&Pt.push(Le))}if(at+=Oe,V&&Oe!==at){for(He=0;Ye=U[He++];)Ye(Pt,It,se,be);if(re){if(at>0)for(;Oe--;)Pt[Oe]||It[Oe]||(It[Oe]=K.call(Pe));It=$e(It)}te.apply(Pe,It),Me&&!re&&It.length>0&&at+U.length>1&&tt.uniqueSort(Pe)}return Me&&(C=Se,g=ye),Pt};return V?Ht(Y):Y}h=tt.compile=function(O,U){var V,ie=[],Y=[],re=k[O+" "];if(!re){for(U||(U=u(O)),V=U.length;V--;)re=_t(U[V]),re[I]?ie.push(re):Y.push(re);re=k(O,Ve(Y,ie)),re.selector=O}return re},r=tt.select=function(O,U,V,ie){var Y,re,se,be,Pe,Me=typeof O=="function"&&O,Le=!ie&&u(O=Me.selector||O);if(V=V||[],Le.length===1){if(re=Le[0]=Le[0].slice(0),re.length>2&&(se=re[0]).type==="ID"&&U.nodeType===9&&_&&c.relative[re[1].type]){if(U=(c.find.ID(se.matches[0].replace(lt,ft),U)||[])[0],U)Me&&(U=U.parentNode);else return V;O=O.slice(re.shift().value.length)}for(Y=et.needsContext.test(O)?0:re.length;Y--&&(se=re[Y],!c.relative[be=se.type]);)if((Pe=c.find[be])&&(ie=Pe(se.matches[0].replace(lt,ft),Ot.test(re[0].type)&&Te(U.parentNode)||U))){if(re.splice(Y,1),O=ie.length&&ke(re),!O)return te.apply(V,ie),V;break}}return(Me||h(O,Le))(ie,U,!_,V,!U||Ot.test(O)&&Te(U.parentNode)||U),V},p.sortStable=I.split("").sort(H).join("")===I,p.detectDuplicates=!!f,b(),p.sortDetached=fe(function(O){return O.compareDocumentPosition(y.createElement("fieldset"))&1}),fe(function(O){return O.innerHTML="<a href='#'></a>",O.firstChild.getAttribute("href")==="#"})||Z("type|href|height|width",function(O,U,V){if(!V)return O.getAttribute(U,U.toLowerCase()==="type"?1:2)}),(!p.attributes||!fe(function(O){return O.innerHTML="<input/>",O.firstChild.setAttribute("value",""),O.firstChild.getAttribute("value")===""}))&&Z("value",function(O,U,V){if(!V&&O.nodeName.toLowerCase()==="input")return O.defaultValue}),fe(function(O){return O.getAttribute("disabled")==null})||Z(Q,function(O,U,V){var ie;if(!V)return O[U]===!0?U.toLowerCase():(ie=O.getAttributeNode(U))&&ie.specified?ie.value:null});var vt=i.Sizzle;tt.noConflict=function(){return i.Sizzle===tt&&(i.Sizzle=vt),tt},m=function(){return tt}.call(v,s,v,w),m!==void 0&&(w.exports=m)})(window)},7178:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(2134),s(8663),s(454),s(6981),s(7661),s(8048),s(461),s(1045),s(6525),s(5385)],i=function(n,p,c,l,o,u,h){"use strict";var r=/%20/g,g=/#.*$/,d=/([?&])_=[^&]*/,f=/^(.*?):[ \t]*([^\r\n]*)$/mg,b=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,y=/^(?:GET|HEAD)$/,T=/^\/\//,_={},P={},x="*/".concat("*"),E=p.createElement("a");E.href=o.href;function A(M){return function(B,k){typeof B!="string"&&(k=B,B="*");var G,H=0,$=B.toLowerCase().match(l)||[];if(c(k))for(;G=$[H++];)G[0]==="+"?(G=G.slice(1)||"*",(M[G]=M[G]||[]).unshift(k)):(M[G]=M[G]||[]).push(k)}}function I(M,B,k,G){var H={},$=M===P;function j(K){var W;return H[K]=!0,n.each(M[K]||[],function(te,ae){var me=ae(B,k,G);if(typeof me=="string"&&!$&&!H[me])return B.dataTypes.unshift(me),j(me),!1;if($)return!(W=me)}),W}return j(B.dataTypes[0])||!H["*"]&&j("*")}function R(M,B){var k,G,H=n.ajaxSettings.flatOptions||{};for(k in B)B[k]!==void 0&&((H[k]?M:G||(G={}))[k]=B[k]);return G&&n.extend(!0,M,G),M}function C(M,B,k){for(var G,H,$,j,K=M.contents,W=M.dataTypes;W[0]==="*";)W.shift(),G===void 0&&(G=M.mimeType||B.getResponseHeader("Content-Type"));if(G){for(H in K)if(K[H]&&K[H].test(G)){W.unshift(H);break}}if(W[0]in k)$=W[0];else{for(H in k){if(!W[0]||M.converters[H+" "+W[0]]){$=H;break}j||(j=H)}$=$||j}if($)return $!==W[0]&&W.unshift($),k[$]}function D(M,B,k,G){var H,$,j,K,W,te={},ae=M.dataTypes.slice();if(ae[1])for(j in M.converters)te[j.toLowerCase()]=M.converters[j];for($=ae.shift();$;)if(M.responseFields[$]&&(k[M.responseFields[$]]=B),!W&&G&&M.dataFilter&&(B=M.dataFilter(B,M.dataType)),W=$,$=ae.shift(),$){if($==="*")$=W;else if(W!=="*"&&W!==$){if(j=te[W+" "+$]||te["* "+$],!j){for(H in te)if(K=H.split(" "),K[1]===$&&(j=te[W+" "+K[0]]||te["* "+K[0]],j)){j===!0?j=te[H]:te[H]!==!0&&($=K[0],ae.unshift(K[1]));break}}if(j!==!0)if(j&&M.throws)B=j(B);else try{B=j(B)}catch(me){return{state:"parsererror",error:j?me:"No conversion from "+W+" to "+$}}}}return{state:"success",data:B}}return n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:o.href,type:"GET",isLocal:b.test(o.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":x,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(M,B){return B?R(R(M,n.ajaxSettings),B):R(n.ajaxSettings,M)},ajaxPrefilter:A(_),ajaxTransport:A(P),ajax:function(M,B){typeof M=="object"&&(B=M,M=void 0),B=B||{};var k,G,H,$,j,K,W,te,ae,me,Q=n.ajaxSetup({},B),ve=Q.context||Q,Ee=Q.context&&(ve.nodeType||ve.jquery)?n(ve):n.event,We=n.Deferred(),gt=n.Callbacks("once memory"),Nt=Q.statusCode||{},Dt={},Ct={},$t="canceled",qe={readyState:0,getResponseHeader:function(Je){var et;if(W){if(!$)for($={};et=f.exec(H);)$[et[1].toLowerCase()+" "]=($[et[1].toLowerCase()+" "]||[]).concat(et[2]);et=$[Je.toLowerCase()+" "]}return et==null?null:et.join(", ")},getAllResponseHeaders:function(){return W?H:null},setRequestHeader:function(Je,et){return W==null&&(Je=Ct[Je.toLowerCase()]=Ct[Je.toLowerCase()]||Je,Dt[Je]=et),this},overrideMimeType:function(Je){return W==null&&(Q.mimeType=Je),this},statusCode:function(Je){var et;if(Je)if(W)qe.always(Je[qe.status]);else for(et in Je)Nt[et]=[Nt[et],Je[et]];return this},abort:function(Je){var et=Je||$t;return k&&k.abort(et),Ft(0,et),this}};if(We.promise(qe),Q.url=((M||Q.url||o.href)+"").replace(T,o.protocol+"//"),Q.type=B.method||B.type||Q.method||Q.type,Q.dataTypes=(Q.dataType||"*").toLowerCase().match(l)||[""],Q.crossDomain==null){K=p.createElement("a");try{K.href=Q.url,K.href=K.href,Q.crossDomain=E.protocol+"//"+E.host!=K.protocol+"//"+K.host}catch(Je){Q.crossDomain=!0}}if(Q.data&&Q.processData&&typeof Q.data!="string"&&(Q.data=n.param(Q.data,Q.traditional)),I(_,Q,B,qe),W)return qe;te=n.event&&Q.global,te&&n.active++===0&&n.event.trigger("ajaxStart"),Q.type=Q.type.toUpperCase(),Q.hasContent=!y.test(Q.type),G=Q.url.replace(g,""),Q.hasContent?Q.data&&Q.processData&&(Q.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&(Q.data=Q.data.replace(r,"+")):(me=Q.url.slice(G.length),Q.data&&(Q.processData||typeof Q.data=="string")&&(G+=(h.test(G)?"&":"?")+Q.data,delete Q.data),Q.cache===!1&&(G=G.replace(d,"$1"),me=(h.test(G)?"&":"?")+"_="+u.guid+++me),Q.url=G+me),Q.ifModified&&(n.lastModified[G]&&qe.setRequestHeader("If-Modified-Since",n.lastModified[G]),n.etag[G]&&qe.setRequestHeader("If-None-Match",n.etag[G])),(Q.data&&Q.hasContent&&Q.contentType!==!1||B.contentType)&&qe.setRequestHeader("Content-Type",Q.contentType),qe.setRequestHeader("Accept",Q.dataTypes[0]&&Q.accepts[Q.dataTypes[0]]?Q.accepts[Q.dataTypes[0]]+(Q.dataTypes[0]!=="*"?", "+x+"; q=0.01":""):Q.accepts["*"]);for(ae in Q.headers)qe.setRequestHeader(ae,Q.headers[ae]);if(Q.beforeSend&&(Q.beforeSend.call(ve,qe,Q)===!1||W))return qe.abort();if($t="abort",gt.add(Q.complete),qe.done(Q.success),qe.fail(Q.error),k=I(P,Q,B,qe),!k)Ft(-1,"No Transport");else{if(qe.readyState=1,te&&Ee.trigger("ajaxSend",[qe,Q]),W)return qe;Q.async&&Q.timeout>0&&(j=window.setTimeout(function(){qe.abort("timeout")},Q.timeout));try{W=!1,k.send(Dt,Ft)}catch(Je){if(W)throw Je;Ft(-1,Je)}}function Ft(Je,et,Wt,Fn){var Et,Kt,yn,Ot,lt,ft=et;W||(W=!0,j&&window.clearTimeout(j),k=void 0,H=Fn||"",qe.readyState=Je>0?4:0,Et=Je>=200&&Je<300||Je===304,Wt&&(Ot=C(Q,qe,Wt)),!Et&&n.inArray("script",Q.dataTypes)>-1&&n.inArray("json",Q.dataTypes)<0&&(Q.converters["text script"]=function(){}),Ot=D(Q,Ot,qe,Et),Et?(Q.ifModified&&(lt=qe.getResponseHeader("Last-Modified"),lt&&(n.lastModified[G]=lt),lt=qe.getResponseHeader("etag"),lt&&(n.etag[G]=lt)),Je===204||Q.type==="HEAD"?ft="nocontent":Je===304?ft="notmodified":(ft=Ot.state,Kt=Ot.data,yn=Ot.error,Et=!yn)):(yn=ft,(Je||!ft)&&(ft="error",Je<0&&(Je=0))),qe.status=Je,qe.statusText=(et||ft)+"",Et?We.resolveWith(ve,[Kt,ft,qe]):We.rejectWith(ve,[qe,ft,yn]),qe.statusCode(Nt),Nt=void 0,te&&Ee.trigger(Et?"ajaxSuccess":"ajaxError",[qe,Q,Et?Kt:yn]),gt.fireWith(ve,[qe,ft]),te&&(Ee.trigger("ajaxComplete",[qe,Q]),--n.active||n.event.trigger("ajaxStop")))}return qe},getJSON:function(M,B,k){return n.get(M,B,k,"json")},getScript:function(M,B){return n.get(M,void 0,B,"script")}}),n.each(["get","post"],function(M,B){n[B]=function(k,G,H,$){return c(G)&&($=$||H,H=G,G=void 0),n.ajax(n.extend({url:k,type:B,dataType:$,data:G,success:H},n.isPlainObject(k)&&k))}}),n.ajaxPrefilter(function(M){var B;for(B in M.headers)B.toLowerCase()==="content-type"&&(M.contentType=M.headers[B]||"")}),n}.apply(v,m),i!==void 0&&(w.exports=i)},7533:(w,v,s)=>{var m,i;m=[s(8934),s(2134),s(6981),s(7661),s(7178)],i=function(n,p,c,l){"use strict";var o=[],u=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var h=o.pop()||n.expando+"_"+c.guid++;return this[h]=!0,h}}),n.ajaxPrefilter("json jsonp",function(h,r,g){var d,f,b,y=h.jsonp!==!1&&(u.test(h.url)?"url":typeof h.data=="string"&&(h.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&u.test(h.data)&&"data");if(y||h.dataTypes[0]==="jsonp")return d=h.jsonpCallback=p(h.jsonpCallback)?h.jsonpCallback():h.jsonpCallback,y?h[y]=h[y].replace(u,"$1"+d):h.jsonp!==!1&&(h.url+=(l.test(h.url)?"&":"?")+h.jsonp+"="+d),h.converters["script json"]=function(){return b||n.error(d+" was not called"),b[0]},h.dataTypes[0]="json",f=window[d],window[d]=function(){b=arguments},g.always(function(){f===void 0?n(window).removeProp(d):window[d]=f,h[d]&&(h.jsonpCallback=r.jsonpCallback,o.push(d)),b&&p(f)&&f(b[0]),b=f=void 0}),"script"})}.apply(v,m),i!==void 0&&(w.exports=i)},4581:(w,v,s)=>{var m,i;m=[s(8934),s(4552),s(2134),s(2889),s(7178),s(8482),s(2632),s(655)],i=function(n,p,c){"use strict";n.fn.load=function(l,o,u){var h,r,g,d=this,f=l.indexOf(" ");return f>-1&&(h=p(l.slice(f)),l=l.slice(0,f)),c(o)?(u=o,o=void 0):o&&typeof o=="object"&&(r="POST"),d.length>0&&n.ajax({url:l,type:r||"GET",dataType:"html",data:o}).done(function(b){g=arguments,d.html(h?n("<div>").append(n.parseHTML(b)).find(h):b)}).always(u&&function(b,y){d.each(function(){u.apply(this,g||[b.responseText,y,b])})}),this}}.apply(v,m),i!==void 0&&(w.exports=i)},5488:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(7178)],i=function(n,p){"use strict";n.ajaxPrefilter(function(c){c.crossDomain&&(c.contents.script=!1)}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(c){return n.globalEval(c),c}}}),n.ajaxPrefilter("script",function(c){c.cache===void 0&&(c.cache=!1),c.crossDomain&&(c.type="GET")}),n.ajaxTransport("script",function(c){if(c.crossDomain||c.scriptAttrs){var l,o;return{send:function(u,h){l=n("<script>").attr(c.scriptAttrs||{}).prop({charset:c.scriptCharset,src:c.url}).on("load error",o=function(r){l.remove(),o=null,r&&h(r.type==="error"?404:200,r.type)}),p.head.appendChild(l[0])},abort:function(){o&&o()}}}})}.apply(v,m),i!==void 0&&(w.exports=i)},454:(w,v,s)=>{var m;m=function(){"use strict";return window.location}.call(v,s,v,w),m!==void 0&&(w.exports=m)},6981:(w,v,s)=>{var m;m=function(){"use strict";return{guid:Date.now()}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},7661:(w,v,s)=>{var m;m=function(){"use strict";return/\?/}.call(v,s,v,w),m!==void 0&&(w.exports=m)},8853:(w,v,s)=>{var m,i;m=[s(8934),s(9523),s(7178)],i=function(n,p){"use strict";n.ajaxSettings.xhr=function(){try{return new window.XMLHttpRequest}catch(o){}};var c={0:200,1223:204},l=n.ajaxSettings.xhr();p.cors=!!l&&"withCredentials"in l,p.ajax=l=!!l,n.ajaxTransport(function(o){var u,h;if(p.cors||l&&!o.crossDomain)return{send:function(r,g){var d,f=o.xhr();if(f.open(o.type,o.url,o.async,o.username,o.password),o.xhrFields)for(d in o.xhrFields)f[d]=o.xhrFields[d];o.mimeType&&f.overrideMimeType&&f.overrideMimeType(o.mimeType),!o.crossDomain&&!r["X-Requested-With"]&&(r["X-Requested-With"]="XMLHttpRequest");for(d in r)f.setRequestHeader(d,r[d]);u=function(b){return function(){u&&(u=h=f.onload=f.onerror=f.onabort=f.ontimeout=f.onreadystatechange=null,b==="abort"?f.abort():b==="error"?typeof f.status!="number"?g(0,"error"):g(f.status,f.statusText):g(c[f.status]||f.status,f.statusText,(f.responseType||"text")!=="text"||typeof f.responseText!="string"?{binary:f.response}:{text:f.responseText},f.getAllResponseHeaders()))}},f.onload=u(),h=f.onerror=f.ontimeout=u("error"),f.onabort!==void 0?f.onabort=h:f.onreadystatechange=function(){f.readyState===4&&window.setTimeout(function(){u&&h()})},u=u("abort");try{f.send(o.hasContent&&o.data||null)}catch(b){if(u)throw b}},abort:function(){u&&u()}}})}.apply(v,m),i!==void 0&&(w.exports=i)},8468:(w,v,s)=>{var m,i;m=[s(8934),s(2853),s(4043),s(4015),s(4580)],i=function(n){"use strict";return n}.apply(v,m),i!==void 0&&(w.exports=i)},2853:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(7060),s(2941),s(8663),s(655)],i=function(n,p,c,l,o){"use strict";var u,h=n.expr.attrHandle;n.fn.extend({attr:function(r,g){return p(this,n.attr,r,g,arguments.length>1)},removeAttr:function(r){return this.each(function(){n.removeAttr(this,r)})}}),n.extend({attr:function(r,g,d){var f,b,y=r.nodeType;if(!(y===3||y===8||y===2)){if(typeof r.getAttribute=="undefined")return n.prop(r,g,d);if((y!==1||!n.isXMLDoc(r))&&(b=n.attrHooks[g.toLowerCase()]||(n.expr.match.bool.test(g)?u:void 0)),d!==void 0){if(d===null){n.removeAttr(r,g);return}return b&&"set"in b&&(f=b.set(r,d,g))!==void 0?f:(r.setAttribute(g,d+""),d)}return b&&"get"in b&&(f=b.get(r,g))!==null?f:(f=n.find.attr(r,g),f==null?void 0:f)}},attrHooks:{type:{set:function(r,g){if(!l.radioValue&&g==="radio"&&c(r,"input")){var d=r.value;return r.setAttribute("type",g),d&&(r.value=d),g}}}},removeAttr:function(r,g){var d,f=0,b=g&&g.match(o);if(b&&r.nodeType===1)for(;d=b[f++];)r.removeAttribute(d)}}),u={set:function(r,g,d){return g===!1?n.removeAttr(r,d):r.setAttribute(d,d),d}},n.each(n.expr.match.bool.source.match(/\w+/g),function(r,g){var d=h[g]||n.find.attr;h[g]=function(f,b,y){var T,_,P=b.toLowerCase();return y||(_=h[P],h[P]=T,T=d(f,b,y)!=null?P:null,h[P]=_),T}})}.apply(v,m),i!==void 0&&(w.exports=i)},4015:(w,v,s)=>{var m,i;m=[s(8934),s(4552),s(2134),s(8663),s(9081),s(8048)],i=function(n,p,c,l,o){"use strict";function u(r){return r.getAttribute&&r.getAttribute("class")||""}function h(r){return Array.isArray(r)?r:typeof r=="string"?r.match(l)||[]:[]}n.fn.extend({addClass:function(r){var g,d,f,b,y,T,_,P=0;if(c(r))return this.each(function(x){n(this).addClass(r.call(this,x,u(this)))});if(g=h(r),g.length){for(;d=this[P++];)if(b=u(d),f=d.nodeType===1&&" "+p(b)+" ",f){for(T=0;y=g[T++];)f.indexOf(" "+y+" ")<0&&(f+=y+" ");_=p(f),b!==_&&d.setAttribute("class",_)}}return this},removeClass:function(r){var g,d,f,b,y,T,_,P=0;if(c(r))return this.each(function(x){n(this).removeClass(r.call(this,x,u(this)))});if(!arguments.length)return this.attr("class","");if(g=h(r),g.length){for(;d=this[P++];)if(b=u(d),f=d.nodeType===1&&" "+p(b)+" ",f){for(T=0;y=g[T++];)for(;f.indexOf(" "+y+" ")>-1;)f=f.replace(" "+y+" "," ");_=p(f),b!==_&&d.setAttribute("class",_)}}return this},toggleClass:function(r,g){var d=typeof r,f=d==="string"||Array.isArray(r);return typeof g=="boolean"&&f?g?this.addClass(r):this.removeClass(r):c(r)?this.each(function(b){n(this).toggleClass(r.call(this,b,u(this),g),g)}):this.each(function(){var b,y,T,_;if(f)for(y=0,T=n(this),_=h(r);b=_[y++];)T.hasClass(b)?T.removeClass(b):T.addClass(b);else(r===void 0||d==="boolean")&&(b=u(this),b&&o.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||r===!1?"":o.get(this,"__className__")||""))})},hasClass:function(r){var g,d,f=0;for(g=" "+r+" ";d=this[f++];)if(d.nodeType===1&&(" "+p(u(d))+" ").indexOf(g)>-1)return!0;return!1}})}.apply(v,m),i!==void 0&&(w.exports=i)},4043:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(2941),s(655)],i=function(n,p,c){"use strict";var l=/^(?:input|select|textarea|button)$/i,o=/^(?:a|area)$/i;n.fn.extend({prop:function(u,h){return p(this,n.prop,u,h,arguments.length>1)},removeProp:function(u){return this.each(function(){delete this[n.propFix[u]||u]})}}),n.extend({prop:function(u,h,r){var g,d,f=u.nodeType;if(!(f===3||f===8||f===2))return(f!==1||!n.isXMLDoc(u))&&(h=n.propFix[h]||h,d=n.propHooks[h]),r!==void 0?d&&"set"in d&&(g=d.set(u,r,h))!==void 0?g:u[h]=r:d&&"get"in d&&(g=d.get(u,h))!==null?g:u[h]},propHooks:{tabIndex:{get:function(u){var h=n.find.attr(u,"tabindex");return h?parseInt(h,10):l.test(u.nodeName)||o.test(u.nodeName)&&u.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),c.optSelected||(n.propHooks.selected={get:function(u){var h=u.parentNode;return h&&h.parentNode&&h.parentNode.selectedIndex,null},set:function(u){var h=u.parentNode;h&&(h.selectedIndex,h.parentNode&&h.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this})}.apply(v,m),i!==void 0&&(w.exports=i)},2941:(w,v,s)=>{var m,i;m=[s(7792),s(9523)],i=function(n,p){"use strict";return function(){var c=n.createElement("input"),l=n.createElement("select"),o=l.appendChild(n.createElement("option"));c.type="checkbox",p.checkOn=c.value!=="",p.optSelected=o.selected,c=n.createElement("input"),c.value="t",c.type="radio",p.radioValue=c.value==="t"}(),p}.apply(v,m),i!==void 0&&(w.exports=i)},4580:(w,v,s)=>{var m,i;m=[s(8934),s(4552),s(2941),s(7060),s(2134),s(8048)],i=function(n,p,c,l,o){"use strict";var u=/\r/g;n.fn.extend({val:function(h){var r,g,d,f=this[0];return arguments.length?(d=o(h),this.each(function(b){var y;this.nodeType===1&&(d?y=h.call(this,b,n(this).val()):y=h,y==null?y="":typeof y=="number"?y+="":Array.isArray(y)&&(y=n.map(y,function(T){return T==null?"":T+""})),r=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],(!r||!("set"in r)||r.set(this,y,"value")===void 0)&&(this.value=y))})):f?(r=n.valHooks[f.type]||n.valHooks[f.nodeName.toLowerCase()],r&&"get"in r&&(g=r.get(f,"value"))!==void 0?g:(g=f.value,typeof g=="string"?g.replace(u,""):g==null?"":g)):void 0}}),n.extend({valHooks:{option:{get:function(h){var r=n.find.attr(h,"value");return r!=null?r:p(n.text(h))}},select:{get:function(h){var r,g,d,f=h.options,b=h.selectedIndex,y=h.type==="select-one",T=y?null:[],_=y?b+1:f.length;for(b<0?d=_:d=y?b:0;d<_;d++)if(g=f[d],(g.selected||d===b)&&!g.disabled&&(!g.parentNode.disabled||!l(g.parentNode,"optgroup"))){if(r=n(g).val(),y)return r;T.push(r)}return T},set:function(h,r){for(var g,d,f=h.options,b=n.makeArray(r),y=f.length;y--;)d=f[y],(d.selected=n.inArray(n.valHooks.option.get(d),b)>-1)&&(g=!0);return g||(h.selectedIndex=-1),b}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(h,r){if(Array.isArray(r))return h.checked=n.inArray(n(h).val(),r)>-1}},c.checkOn||(n.valHooks[this].get=function(h){return h.getAttribute("value")===null?"on":h.value})})}.apply(v,m),i!==void 0&&(w.exports=i)},8924:(w,v,s)=>{var m,i;m=[s(8934),s(8082),s(2134),s(8663)],i=function(n,p,c,l){"use strict";function o(u){var h={};return n.each(u.match(l)||[],function(r,g){h[g]=!0}),h}return n.Callbacks=function(u){u=typeof u=="string"?o(u):n.extend({},u);var h,r,g,d,f=[],b=[],y=-1,T=function(){for(d=d||u.once,g=h=!0;b.length;y=-1)for(r=b.shift();++y<f.length;)f[y].apply(r[0],r[1])===!1&&u.stopOnFalse&&(y=f.length,r=!1);u.memory||(r=!1),h=!1,d&&(r?f=[]:f="")},_={add:function(){return f&&(r&&!h&&(y=f.length-1,b.push(r)),function P(x){n.each(x,function(E,A){c(A)?(!u.unique||!_.has(A))&&f.push(A):A&&A.length&&p(A)!=="string"&&P(A)})}(arguments),r&&!h&&T()),this},remove:function(){return n.each(arguments,function(P,x){for(var E;(E=n.inArray(x,f,E))>-1;)f.splice(E,1),E<=y&&y--}),this},has:function(P){return P?n.inArray(P,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return d=b=[],f=r="",this},disabled:function(){return!f},lock:function(){return d=b=[],!r&&!h&&(f=r=""),this},locked:function(){return!!d},fireWith:function(P,x){return d||(x=x||[],x=[P,x.slice?x.slice():x],b.push(x),h||T()),this},fire:function(){return _.fireWith(this,arguments),this},fired:function(){return!!g}};return _},n}.apply(v,m),i!==void 0&&(w.exports=i)},8934:(w,v,s)=>{var m,i;m=[s(3727),s(8045),s(3623),s(3932),s(1780),s(5431),s(5949),s(7763),s(9694),s(4194),s(3),s(9523),s(2134),s(9031),s(1224),s(8082)],i=function(n,p,c,l,o,u,h,r,g,d,f,b,y,T,_,P){"use strict";var x="3.6.0",E=function(I,R){return new E.fn.init(I,R)};E.fn=E.prototype={jquery:x,constructor:E,length:0,toArray:function(){return c.call(this)},get:function(I){return I==null?c.call(this):I<0?this[I+this.length]:this[I]},pushStack:function(I){var R=E.merge(this.constructor(),I);return R.prevObject=this,R},each:function(I){return E.each(this,I)},map:function(I){return this.pushStack(E.map(this,function(R,C){return I.call(R,C,R)}))},slice:function(){return this.pushStack(c.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(E.grep(this,function(I,R){return(R+1)%2}))},odd:function(){return this.pushStack(E.grep(this,function(I,R){return R%2}))},eq:function(I){var R=this.length,C=+I+(I<0?R:0);return this.pushStack(C>=0&&C<R?[this[C]]:[])},end:function(){return this.prevObject||this.constructor()},push:o,sort:n.sort,splice:n.splice},E.extend=E.fn.extend=function(){var I,R,C,D,M,B,k=arguments[0]||{},G=1,H=arguments.length,$=!1;for(typeof k=="boolean"&&($=k,k=arguments[G]||{},G++),typeof k!="object"&&!y(k)&&(k={}),G===H&&(k=this,G--);G<H;G++)if((I=arguments[G])!=null)for(R in I)D=I[R],!(R==="__proto__"||k===D)&&($&&D&&(E.isPlainObject(D)||(M=Array.isArray(D)))?(C=k[R],M&&!Array.isArray(C)?B=[]:!M&&!E.isPlainObject(C)?B={}:B=C,M=!1,k[R]=E.extend($,B,D)):D!==void 0&&(k[R]=D));return k},E.extend({expando:"jQuery"+(x+Math.random()).replace(/\D/g,""),isReady:!0,error:function(I){throw new Error(I)},noop:function(){},isPlainObject:function(I){var R,C;return!I||r.call(I)!=="[object Object]"?!1:(R=p(I),R?(C=g.call(R,"constructor")&&R.constructor,typeof C=="function"&&d.call(C)===f):!0)},isEmptyObject:function(I){var R;for(R in I)return!1;return!0},globalEval:function(I,R,C){_(I,{nonce:R&&R.nonce},C)},each:function(I,R){var C,D=0;if(A(I))for(C=I.length;D<C&&R.call(I[D],D,I[D])!==!1;D++);else for(D in I)if(R.call(I[D],D,I[D])===!1)break;return I},makeArray:function(I,R){var C=R||[];return I!=null&&(A(Object(I))?E.merge(C,typeof I=="string"?[I]:I):o.call(C,I)),C},inArray:function(I,R,C){return R==null?-1:u.call(R,I,C)},merge:function(I,R){for(var C=+R.length,D=0,M=I.length;D<C;D++)I[M++]=R[D];return I.length=M,I},grep:function(I,R,C){for(var D,M=[],B=0,k=I.length,G=!C;B<k;B++)D=!R(I[B],B),D!==G&&M.push(I[B]);return M},map:function(I,R,C){var D,M,B=0,k=[];if(A(I))for(D=I.length;B<D;B++)M=R(I[B],B,C),M!=null&&k.push(M);else for(B in I)M=R(I[B],B,C),M!=null&&k.push(M);return l(k)},guid:1,support:b}),typeof Symbol=="function"&&(E.fn[Symbol.iterator]=n[Symbol.iterator]),E.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(I,R){h["[object "+R+"]"]=R.toLowerCase()});function A(I){var R=!!I&&"length"in I&&I.length,C=P(I);return y(I)||T(I)?!1:C==="array"||R===0||typeof R=="number"&&R>0&&R-1 in I}return E}.apply(v,m),i!==void 0&&(w.exports=i)},1224:(w,v,s)=>{var m,i;m=[s(7792)],i=function(n){"use strict";var p={type:!0,src:!0,nonce:!0,noModule:!0};function c(l,o,u){u=u||n;var h,r,g=u.createElement("script");if(g.text=l,o)for(h in p)r=o[h]||o.getAttribute&&o.getAttribute(h),r&&g.setAttribute(h,r);u.head.appendChild(g).parentNode.removeChild(g)}return c}.apply(v,m),i!==void 0&&(w.exports=i)},7163:(w,v,s)=>{var m,i;m=[s(8934),s(8082),s(2134)],i=function(n,p,c){"use strict";var l=function(o,u,h,r,g,d,f){var b=0,y=o.length,T=h==null;if(p(h)==="object"){g=!0;for(b in h)l(o,u,b,h[b],!0,d,f)}else if(r!==void 0&&(g=!0,c(r)||(f=!0),T&&(f?(u.call(o,r),u=null):(T=u,u=function(_,P,x){return T.call(n(_),x)})),u))for(;b<y;b++)u(o[b],h,f?r:r.call(o[b],b,u(o[b],h)));return g?o:T?u.call(o):y?u(o[0],h):d};return l}.apply(v,m),i!==void 0&&(w.exports=i)},1133:(w,v)=>{var s,m;s=[],m=function(){"use strict";var i=/^-ms-/,n=/-([a-z])/g;function p(l,o){return o.toUpperCase()}function c(l){return l.replace(i,"ms-").replace(n,p)}return c}.apply(v,s),m!==void 0&&(w.exports=m)},8048:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(2134),s(5250),s(1764)],i=function(n,p,c,l){"use strict";var o,u=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,h=n.fn.init=function(r,g,d){var f,b;if(!r)return this;if(d=d||o,typeof r=="string")if(r[0]==="<"&&r[r.length-1]===">"&&r.length>=3?f=[null,r,null]:f=u.exec(r),f&&(f[1]||!g))if(f[1]){if(g=g instanceof n?g[0]:g,n.merge(this,n.parseHTML(f[1],g&&g.nodeType?g.ownerDocument||g:p,!0)),l.test(f[1])&&n.isPlainObject(g))for(f in g)c(this[f])?this[f](g[f]):this.attr(f,g[f]);return this}else return b=p.getElementById(f[2]),b&&(this[0]=b,this.length=1),this;else return!g||g.jquery?(g||d).find(r):this.constructor(g).find(r);else{if(r.nodeType)return this[0]=r,this.length=1,this;if(c(r))return d.ready!==void 0?d.ready(r):r(n)}return n.makeArray(r,this)};return h.prototype=n.fn,o=n(p),h}.apply(v,m),i!==void 0&&(w.exports=i)},70:(w,v,s)=>{var m,i;m=[s(8934),s(7730),s(655)],i=function(n,p){"use strict";var c=function(o){return n.contains(o.ownerDocument,o)},l={composed:!0};return p.getRootNode&&(c=function(o){return n.contains(o.ownerDocument,o)||o.getRootNode(l)===o.ownerDocument}),c}.apply(v,m),i!==void 0&&(w.exports=i)},7060:(w,v,s)=>{var m;m=function(){"use strict";function i(n,p){return n.nodeName&&n.nodeName.toLowerCase()===p.toLowerCase()}return i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},2889:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(5250),s(3360),s(1622)],i=function(n,p,c,l,o){"use strict";return n.parseHTML=function(u,h,r){if(typeof u!="string")return[];typeof h=="boolean"&&(r=h,h=!1);var g,d,f;return h||(o.createHTMLDocument?(h=p.implementation.createHTMLDocument(""),g=h.createElement("base"),g.href=p.location.href,h.head.appendChild(g)):h=p),d=c.exec(u),f=!r&&[],d?[h.createElement(d[1])]:(d=l([u],h,f),f&&f.length&&n(f).remove(),n.merge([],d.childNodes))},n.parseHTML}.apply(v,m),i!==void 0&&(w.exports=i)},461:(w,v,s)=>{var m,i;m=[s(8934)],i=function(n){"use strict";return n.parseXML=function(p){var c,l;if(!p||typeof p!="string")return null;try{c=new window.DOMParser().parseFromString(p,"text/xml")}catch(o){}return l=c&&c.getElementsByTagName("parsererror")[0],(!c||l)&&n.error("Invalid XML: "+(l?n.map(l.childNodes,function(o){return o.textContent}).join(`
`):p)),c},n.parseXML}.apply(v,m),i!==void 0&&(w.exports=i)},5703:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(3442),s(6525)],i=function(n,p){"use strict";var c=n.Deferred();n.fn.ready=function(o){return c.then(o).catch(function(u){n.readyException(u)}),this},n.extend({isReady:!1,readyWait:1,ready:function(o){(o===!0?--n.readyWait:n.isReady)||(n.isReady=!0,!(o!==!0&&--n.readyWait>0)&&c.resolveWith(p,[n]))}}),n.ready.then=c.then;function l(){p.removeEventListener("DOMContentLoaded",l),window.removeEventListener("load",l),n.ready()}p.readyState==="complete"||p.readyState!=="loading"&&!p.documentElement.doScroll?window.setTimeout(n.ready):(p.addEventListener("DOMContentLoaded",l),window.addEventListener("load",l))}.apply(v,m),i!==void 0&&(w.exports=i)},3442:(w,v,s)=>{var m,i;m=[s(8934)],i=function(n){"use strict";n.readyException=function(p){window.setTimeout(function(){throw p})}}.apply(v,m),i!==void 0&&(w.exports=i)},4552:(w,v,s)=>{var m,i;m=[s(8663)],i=function(n){"use strict";function p(c){var l=c.match(n)||[];return l.join(" ")}return p}.apply(v,m),i!==void 0&&(w.exports=i)},1622:(w,v,s)=>{var m,i;m=[s(7792),s(9523)],i=function(n,p){"use strict";return p.createHTMLDocument=function(){var c=n.implementation.createHTMLDocument("").body;return c.innerHTML="<form></form><form></form>",c.childNodes.length===2}(),p}.apply(v,m),i!==void 0&&(w.exports=i)},8082:(w,v,s)=>{var m,i;m=[s(5949),s(7763)],i=function(n,p){"use strict";function c(l){return l==null?l+"":typeof l=="object"||typeof l=="function"?n[p.call(l)]||"object":typeof l}return c}.apply(v,m),i!==void 0&&(w.exports=i)},5250:(w,v,s)=>{var m;m=function(){"use strict";return/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},8515:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(1133),s(7060),s(6871),s(618),s(5057),s(3122),s(5410),s(610),s(7432),s(3781),s(4405),s(3997),s(8048),s(5703),s(655)],i=function(n,p,c,l,o,u,h,r,g,d,f,b,y,T){"use strict";var _=/^(none|table(?!-c[ea]).+)/,P=/^--/,x={position:"absolute",visibility:"hidden",display:"block"},E={letterSpacing:"0",fontWeight:"400"};function A(C,D,M){var B=o.exec(D);return B?Math.max(0,B[2]-(M||0))+(B[3]||"px"):D}function I(C,D,M,B,k,G){var H=D==="width"?1:0,$=0,j=0;if(M===(B?"border":"content"))return 0;for(;H<4;H+=2)M==="margin"&&(j+=n.css(C,M+h[H],!0,k)),B?(M==="content"&&(j-=n.css(C,"padding"+h[H],!0,k)),M!=="margin"&&(j-=n.css(C,"border"+h[H]+"Width",!0,k))):(j+=n.css(C,"padding"+h[H],!0,k),M!=="padding"?j+=n.css(C,"border"+h[H]+"Width",!0,k):$+=n.css(C,"border"+h[H]+"Width",!0,k));return!B&&G>=0&&(j+=Math.max(0,Math.ceil(C["offset"+D[0].toUpperCase()+D.slice(1)]-G-j-$-.5))||0),j}function R(C,D,M){var B=r(C),k=!y.boxSizingReliable()||M,G=k&&n.css(C,"boxSizing",!1,B)==="border-box",H=G,$=d(C,D,B),j="offset"+D[0].toUpperCase()+D.slice(1);if(u.test($)){if(!M)return $;$="auto"}return(!y.boxSizingReliable()&&G||!y.reliableTrDimensions()&&l(C,"tr")||$==="auto"||!parseFloat($)&&n.css(C,"display",!1,B)==="inline")&&C.getClientRects().length&&(G=n.css(C,"boxSizing",!1,B)==="border-box",H=j in C,H&&($=C[j])),$=parseFloat($)||0,$+I(C,D,M||(G?"border":"content"),H,B,$)+"px"}return n.extend({cssHooks:{opacity:{get:function(C,D){if(D){var M=d(C,"opacity");return M===""?"1":M}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(C,D,M,B){if(!(!C||C.nodeType===3||C.nodeType===8||!C.style)){var k,G,H,$=c(D),j=P.test(D),K=C.style;if(j||(D=T($)),H=n.cssHooks[D]||n.cssHooks[$],M!==void 0){if(G=typeof M,G==="string"&&(k=o.exec(M))&&k[1]&&(M=f(C,D,k),G="number"),M==null||M!==M)return;G==="number"&&!j&&(M+=k&&k[3]||(n.cssNumber[$]?"":"px")),!y.clearCloneStyle&&M===""&&D.indexOf("background")===0&&(K[D]="inherit"),(!H||!("set"in H)||(M=H.set(C,M,B))!==void 0)&&(j?K.setProperty(D,M):K[D]=M)}else return H&&"get"in H&&(k=H.get(C,!1,B))!==void 0?k:K[D]}},css:function(C,D,M,B){var k,G,H,$=c(D),j=P.test(D);return j||(D=T($)),H=n.cssHooks[D]||n.cssHooks[$],H&&"get"in H&&(k=H.get(C,!0,M)),k===void 0&&(k=d(C,D,B)),k==="normal"&&D in E&&(k=E[D]),M===""||M?(G=parseFloat(k),M===!0||isFinite(G)?G||0:k):k}}),n.each(["height","width"],function(C,D){n.cssHooks[D]={get:function(M,B,k){if(B)return _.test(n.css(M,"display"))&&(!M.getClientRects().length||!M.getBoundingClientRect().width)?g(M,x,function(){return R(M,D,k)}):R(M,D,k)},set:function(M,B,k){var G,H=r(M),$=!y.scrollboxSize()&&H.position==="absolute",j=$||k,K=j&&n.css(M,"boxSizing",!1,H)==="border-box",W=k?I(M,D,k,K,H):0;return K&&$&&(W-=Math.ceil(M["offset"+D[0].toUpperCase()+D.slice(1)]-parseFloat(H[D])-I(M,D,"border",!1,H)-.5)),W&&(G=o.exec(B))&&(G[3]||"px")!=="px"&&(M.style[D]=B,B=n.css(M,D)),A(M,B,W)}}}),n.cssHooks.marginLeft=b(y.reliableMarginLeft,function(C,D){if(D)return(parseFloat(d(C,"marginLeft"))||C.getBoundingClientRect().left-g(C,{marginLeft:0},function(){return C.getBoundingClientRect().left}))+"px"}),n.each({margin:"",padding:"",border:"Width"},function(C,D){n.cssHooks[C+D]={expand:function(M){for(var B=0,k={},G=typeof M=="string"?M.split(" "):[M];B<4;B++)k[C+h[B]+D]=G[B]||G[B-2]||G[0];return k}},C!=="margin"&&(n.cssHooks[C+D].set=A)}),n.fn.extend({css:function(C,D){return p(this,function(M,B,k){var G,H,$={},j=0;if(Array.isArray(B)){for(G=r(M),H=B.length;j<H;j++)$[B[j]]=n.css(M,B[j],!1,G);return $}return k!==void 0?n.style(M,B,k):n.css(M,B)},C,D,arguments.length>1)}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},3781:(w,v,s)=>{var m;m=function(){"use strict";function i(n,p){return{get:function(){if(n()){delete this.get;return}return(this.get=p).apply(this,arguments)}}}return i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},7432:(w,v,s)=>{var m,i;m=[s(8934),s(6871)],i=function(n,p){"use strict";function c(l,o,u,h){var r,g,d=20,f=h?function(){return h.cur()}:function(){return n.css(l,o,"")},b=f(),y=u&&u[3]||(n.cssNumber[o]?"":"px"),T=l.nodeType&&(n.cssNumber[o]||y!=="px"&&+b)&&p.exec(n.css(l,o));if(T&&T[3]!==y){for(b=b/2,y=y||T[3],T=+b||1;d--;)n.style(l,o,T+y),(1-g)*(1-(g=f()/b||.5))<=0&&(d=0),T=T/g;T=T*2,n.style(l,o,T+y),u=u||[]}return u&&(T=+T||+b||0,r=u[1]?T+(u[1]+1)*u[2]:+u[2],h&&(h.unit=y,h.start=T,h.end=r)),r}return c}.apply(v,m),i!==void 0&&(w.exports=i)},610:(w,v,s)=>{var m,i;m=[s(8934),s(70),s(3151),s(618),s(3122),s(4405)],i=function(n,p,c,l,o,u){"use strict";function h(r,g,d){var f,b,y,T,_=r.style;return d=d||o(r),d&&(T=d.getPropertyValue(g)||d[g],T===""&&!p(r)&&(T=n.style(r,g)),!u.pixelBoxStyles()&&l.test(T)&&c.test(g)&&(f=_.width,b=_.minWidth,y=_.maxWidth,_.minWidth=_.maxWidth=_.width=T,T=d.width,_.width=f,_.minWidth=b,_.maxWidth=y)),T!==void 0?T+"":T}return h}.apply(v,m),i!==void 0&&(w.exports=i)},3997:(w,v,s)=>{var m,i;m=[s(7792),s(8934)],i=function(n,p){"use strict";var c=["Webkit","Moz","ms"],l=n.createElement("div").style,o={};function u(r){for(var g=r[0].toUpperCase()+r.slice(1),d=c.length;d--;)if(r=c[d]+g,r in l)return r}function h(r){var g=p.cssProps[r]||o[r];return g||(r in l?r:o[r]=u(r)||r)}return h}.apply(v,m),i!==void 0&&(w.exports=i)},2365:(w,v,s)=>{var m,i;m=[s(8934),s(655)],i=function(n){"use strict";n.expr.pseudos.hidden=function(p){return!n.expr.pseudos.visible(p)},n.expr.pseudos.visible=function(p){return!!(p.offsetWidth||p.offsetHeight||p.getClientRects().length)}}.apply(v,m),i!==void 0&&(w.exports=i)},8516:(w,v,s)=>{var m,i;m=[s(8934),s(9081),s(5626)],i=function(n,p,c){"use strict";var l={};function o(h){var r,g=h.ownerDocument,d=h.nodeName,f=l[d];return f||(r=g.body.appendChild(g.createElement(d)),f=n.css(r,"display"),r.parentNode.removeChild(r),f==="none"&&(f="block"),l[d]=f,f)}function u(h,r){for(var g,d,f=[],b=0,y=h.length;b<y;b++)d=h[b],d.style&&(g=d.style.display,r?(g==="none"&&(f[b]=p.get(d,"display")||null,f[b]||(d.style.display="")),d.style.display===""&&c(d)&&(f[b]=o(d))):g!=="none"&&(f[b]="none",p.set(d,"display",g)));for(b=0;b<y;b++)f[b]!=null&&(h[b].style.display=f[b]);return h}return n.fn.extend({show:function(){return u(this,!0)},hide:function(){return u(this)},toggle:function(h){return typeof h=="boolean"?h?this.show():this.hide():this.each(function(){c(this)?n(this).show():n(this).hide()})}}),u}.apply(v,m),i!==void 0&&(w.exports=i)},4405:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(7730),s(9523)],i=function(n,p,c,l){"use strict";return function(){function o(){if(!!T){y.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",T.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",c.appendChild(y).appendChild(T);var _=window.getComputedStyle(T);h=_.top!=="1%",b=u(_.marginLeft)===12,T.style.right="60%",d=u(_.right)===36,r=u(_.width)===36,T.style.position="absolute",g=u(T.offsetWidth/3)===12,c.removeChild(y),T=null}}function u(_){return Math.round(parseFloat(_))}var h,r,g,d,f,b,y=p.createElement("div"),T=p.createElement("div");!T.style||(T.style.backgroundClip="content-box",T.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle=T.style.backgroundClip==="content-box",n.extend(l,{boxSizingReliable:function(){return o(),r},pixelBoxStyles:function(){return o(),d},pixelPosition:function(){return o(),h},reliableMarginLeft:function(){return o(),b},scrollboxSize:function(){return o(),g},reliableTrDimensions:function(){var _,P,x,E;return f==null&&(_=p.createElement("table"),P=p.createElement("tr"),x=p.createElement("div"),_.style.cssText="position:absolute;left:-11111px;border-collapse:separate",P.style.cssText="border:1px solid",P.style.height="1px",x.style.height="9px",x.style.display="block",c.appendChild(_).appendChild(P).appendChild(x),E=window.getComputedStyle(P),f=parseInt(E.height,10)+parseInt(E.borderTopWidth,10)+parseInt(E.borderBottomWidth,10)===P.offsetHeight,c.removeChild(_)),f}}))}(),l}.apply(v,m),i!==void 0&&(w.exports=i)},5057:(w,v,s)=>{var m;m=function(){"use strict";return["Top","Right","Bottom","Left"]}.call(v,s,v,w),m!==void 0&&(w.exports=m)},3122:(w,v,s)=>{var m;m=function(){"use strict";return function(i){var n=i.ownerDocument.defaultView;return(!n||!n.opener)&&(n=window),n.getComputedStyle(i)}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},5626:(w,v,s)=>{var m,i;m=[s(8934),s(70)],i=function(n,p){"use strict";return function(c,l){return c=l||c,c.style.display==="none"||c.style.display===""&&p(c)&&n.css(c,"display")==="none"}}.apply(v,m),i!==void 0&&(w.exports=i)},3151:(w,v,s)=>{var m,i;m=[s(5057)],i=function(n){"use strict";return new RegExp(n.join("|"),"i")}.apply(v,m),i!==void 0&&(w.exports=i)},618:(w,v,s)=>{var m,i;m=[s(8308)],i=function(n){"use strict";return new RegExp("^("+n+")(?!px)[a-z%]+$","i")}.apply(v,m),i!==void 0&&(w.exports=i)},5410:(w,v,s)=>{var m;m=function(){"use strict";return function(i,n,p){var c,l,o={};for(l in n)o[l]=i.style[l],i.style[l]=n[l];c=p.call(i);for(l in n)i.style[l]=o[l];return c}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},1786:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(1133),s(9081),s(2109)],i=function(n,p,c,l,o){"use strict";var u=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,h=/[A-Z]/g;function r(d){return d==="true"?!0:d==="false"?!1:d==="null"?null:d===+d+""?+d:u.test(d)?JSON.parse(d):d}function g(d,f,b){var y;if(b===void 0&&d.nodeType===1)if(y="data-"+f.replace(h,"-$&").toLowerCase(),b=d.getAttribute(y),typeof b=="string"){try{b=r(b)}catch(T){}o.set(d,f,b)}else b=void 0;return b}return n.extend({hasData:function(d){return o.hasData(d)||l.hasData(d)},data:function(d,f,b){return o.access(d,f,b)},removeData:function(d,f){o.remove(d,f)},_data:function(d,f,b){return l.access(d,f,b)},_removeData:function(d,f){l.remove(d,f)}}),n.fn.extend({data:function(d,f){var b,y,T,_=this[0],P=_&&_.attributes;if(d===void 0){if(this.length&&(T=o.get(_),_.nodeType===1&&!l.get(_,"hasDataAttrs"))){for(b=P.length;b--;)P[b]&&(y=P[b].name,y.indexOf("data-")===0&&(y=c(y.slice(5)),g(_,y,T[y])));l.set(_,"hasDataAttrs",!0)}return T}return typeof d=="object"?this.each(function(){o.set(this,d)}):p(this,function(x){var E;if(_&&x===void 0)return E=o.get(_,d),E!==void 0||(E=g(_,d),E!==void 0)?E:void 0;this.each(function(){o.set(this,d,x)})},null,f,arguments.length>1,null,!0)},removeData:function(d){return this.each(function(){o.remove(this,d)})}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},7172:(w,v,s)=>{var m,i;m=[s(8934),s(1133),s(8663),s(2238)],i=function(n,p,c,l){"use strict";function o(){this.expando=n.expando+o.uid++}return o.uid=1,o.prototype={cache:function(u){var h=u[this.expando];return h||(h={},l(u)&&(u.nodeType?u[this.expando]=h:Object.defineProperty(u,this.expando,{value:h,configurable:!0}))),h},set:function(u,h,r){var g,d=this.cache(u);if(typeof h=="string")d[p(h)]=r;else for(g in h)d[p(g)]=h[g];return d},get:function(u,h){return h===void 0?this.cache(u):u[this.expando]&&u[this.expando][p(h)]},access:function(u,h,r){return h===void 0||h&&typeof h=="string"&&r===void 0?this.get(u,h):(this.set(u,h,r),r!==void 0?r:h)},remove:function(u,h){var r,g=u[this.expando];if(g!==void 0){if(h!==void 0)for(Array.isArray(h)?h=h.map(p):(h=p(h),h=h in g?[h]:h.match(c)||[]),r=h.length;r--;)delete g[h[r]];(h===void 0||n.isEmptyObject(g))&&(u.nodeType?u[this.expando]=void 0:delete u[this.expando])}},hasData:function(u){var h=u[this.expando];return h!==void 0&&!n.isEmptyObject(h)}},o}.apply(v,m),i!==void 0&&(w.exports=i)},2238:(w,v,s)=>{var m;m=function(){"use strict";return function(i){return i.nodeType===1||i.nodeType===9||!+i.nodeType}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},9081:(w,v,s)=>{var m,i;m=[s(7172)],i=function(n){"use strict";return new n}.apply(v,m),i!==void 0&&(w.exports=i)},2109:(w,v,s)=>{var m,i;m=[s(7172)],i=function(n){"use strict";return new n}.apply(v,m),i!==void 0&&(w.exports=i)},6525:(w,v,s)=>{var m,i;m=[s(8934),s(2134),s(3623),s(8924)],i=function(n,p,c){"use strict";function l(h){return h}function o(h){throw h}function u(h,r,g,d){var f;try{h&&p(f=h.promise)?f.call(h).done(r).fail(g):h&&p(f=h.then)?f.call(h,r,g):r.apply(void 0,[h].slice(d))}catch(b){g.apply(void 0,[b])}}return n.extend({Deferred:function(h){var r=[["notify","progress",n.Callbacks("memory"),n.Callbacks("memory"),2],["resolve","done",n.Callbacks("once memory"),n.Callbacks("once memory"),0,"resolved"],["reject","fail",n.Callbacks("once memory"),n.Callbacks("once memory"),1,"rejected"]],g="pending",d={state:function(){return g},always:function(){return f.done(arguments).fail(arguments),this},catch:function(b){return d.then(null,b)},pipe:function(){var b=arguments;return n.Deferred(function(y){n.each(r,function(T,_){var P=p(b[_[4]])&&b[_[4]];f[_[1]](function(){var x=P&&P.apply(this,arguments);x&&p(x.promise)?x.promise().progress(y.notify).done(y.resolve).fail(y.reject):y[_[0]+"With"](this,P?[x]:arguments)})}),b=null}).promise()},then:function(b,y,T){var _=0;function P(x,E,A,I){return function(){var R=this,C=arguments,D=function(){var B,k;if(!(x<_)){if(B=A.apply(R,C),B===E.promise())throw new TypeError("Thenable self-resolution");k=B&&(typeof B=="object"||typeof B=="function")&&B.then,p(k)?I?k.call(B,P(_,E,l,I),P(_,E,o,I)):(_++,k.call(B,P(_,E,l,I),P(_,E,o,I),P(_,E,l,E.notifyWith))):(A!==l&&(R=void 0,C=[B]),(I||E.resolveWith)(R,C))}},M=I?D:function(){try{D()}catch(B){n.Deferred.exceptionHook&&n.Deferred.exceptionHook(B,M.stackTrace),x+1>=_&&(A!==o&&(R=void 0,C=[B]),E.rejectWith(R,C))}};x?M():(n.Deferred.getStackHook&&(M.stackTrace=n.Deferred.getStackHook()),window.setTimeout(M))}}return n.Deferred(function(x){r[0][3].add(P(0,x,p(T)?T:l,x.notifyWith)),r[1][3].add(P(0,x,p(b)?b:l)),r[2][3].add(P(0,x,p(y)?y:o))}).promise()},promise:function(b){return b!=null?n.extend(b,d):d}},f={};return n.each(r,function(b,y){var T=y[2],_=y[5];d[y[1]]=T.add,_&&T.add(function(){g=_},r[3-b][2].disable,r[3-b][3].disable,r[0][2].lock,r[0][3].lock),T.add(y[3].fire),f[y[0]]=function(){return f[y[0]+"With"](this===f?void 0:this,arguments),this},f[y[0]+"With"]=T.fireWith}),d.promise(f),h&&h.call(f,f),f},when:function(h){var r=arguments.length,g=r,d=Array(g),f=c.call(arguments),b=n.Deferred(),y=function(T){return function(_){d[T]=this,f[T]=arguments.length>1?c.call(arguments):_,--r||b.resolveWith(d,f)}};if(r<=1&&(u(h,b.done(y(g)).resolve,b.reject,!r),b.state()==="pending"||p(f[g]&&f[g].then)))return b.then();for(;g--;)u(f[g],y(g),b.reject);return b.promise()}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},1009:(w,v,s)=>{var m,i;m=[s(8934),s(6525)],i=function(n){"use strict";var p=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;n.Deferred.exceptionHook=function(c,l){window.console&&window.console.warn&&c&&p.test(c.name)&&window.console.warn("jQuery.Deferred exception: "+c.message,c.stack,l)}}.apply(v,m),i!==void 0&&(w.exports=i)},7722:(w,v,s)=>{var m,i;m=[s(8934),s(7060),s(1133),s(8082),s(2134),s(9031),s(3623),s(7982),s(8138)],i=function(n,p,c,l,o,u,h){"use strict";var r=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;n.proxy=function(g,d){var f,b,y;if(typeof d=="string"&&(f=g[d],d=g,g=f),!!o(g))return b=h.call(arguments,2),y=function(){return g.apply(d||this,b.concat(h.call(arguments)))},y.guid=g.guid=g.guid||n.guid++,y},n.holdReady=function(g){g?n.readyWait++:n.ready(!0)},n.isArray=Array.isArray,n.parseJSON=JSON.parse,n.nodeName=p,n.isFunction=o,n.isWindow=u,n.camelCase=c,n.type=l,n.now=Date.now,n.isNumeric=function(g){var d=n.type(g);return(d==="number"||d==="string")&&!isNaN(g-parseFloat(g))},n.trim=function(g){return g==null?"":(g+"").replace(r,"")}}.apply(v,m),i!==void 0&&(w.exports=i)},7982:(w,v,s)=>{var m,i;m=[s(8934),s(7178),s(7881)],i=function(n){"use strict";n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(p,c){n.fn[c]=function(l){return this.on(c,l)}})}.apply(v,m),i!==void 0&&(w.exports=i)},8138:(w,v,s)=>{var m,i;m=[s(8934),s(7881),s(1045)],i=function(n){"use strict";n.fn.extend({bind:function(p,c,l){return this.on(p,null,c,l)},unbind:function(p,c){return this.off(p,null,c)},delegate:function(p,c,l,o){return this.on(c,p,l,o)},undelegate:function(p,c,l){return arguments.length===1?this.off(p,"**"):this.off(c,p||"**",l)},hover:function(p,c){return this.mouseenter(p).mouseleave(c||p)}}),n.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(p,c){n.fn[c]=function(l,o){return arguments.length>0?this.on(c,null,l,o):this.trigger(c)}})}.apply(v,m),i!==void 0&&(w.exports=i)},5126:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(9031),s(8515)],i=function(n,p,c){"use strict";return n.each({Height:"height",Width:"width"},function(l,o){n.each({padding:"inner"+l,content:o,"":"outer"+l},function(u,h){n.fn[h]=function(r,g){var d=arguments.length&&(u||typeof r!="boolean"),f=u||(r===!0||g===!0?"margin":"border");return p(this,function(b,y,T){var _;return c(b)?h.indexOf("outer")===0?b["inner"+l]:b.document.documentElement["client"+l]:b.nodeType===9?(_=b.documentElement,Math.max(b.body["scroll"+l],_["scroll"+l],b.body["offset"+l],_["offset"+l],_["client"+l])):T===void 0?n.css(b,y,f):n.style(b,y,T,f)},o,d?r:void 0,d)}})}),n}.apply(v,m),i!==void 0&&(w.exports=i)},7429:(w,v,s)=>{var m,i;m=[s(8934),s(1133),s(7792),s(2134),s(6871),s(8663),s(5057),s(5626),s(7432),s(9081),s(8516),s(8048),s(1387),s(6525),s(8482),s(2632),s(8515),s(8314)],i=function(n,p,c,l,o,u,h,r,g,d,f){"use strict";var b,y,T=/^(?:toggle|show|hide)$/,_=/queueHooks$/;function P(){y&&(c.hidden===!1&&window.requestAnimationFrame?window.requestAnimationFrame(P):window.setTimeout(P,n.fx.interval),n.fx.tick())}function x(){return window.setTimeout(function(){b=void 0}),b=Date.now()}function E(D,M){var B,k=0,G={height:D};for(M=M?1:0;k<4;k+=2-M)B=h[k],G["margin"+B]=G["padding"+B]=D;return M&&(G.opacity=G.width=D),G}function A(D,M,B){for(var k,G=(C.tweeners[M]||[]).concat(C.tweeners["*"]),H=0,$=G.length;H<$;H++)if(k=G[H].call(B,M,D))return k}function I(D,M,B){var k,G,H,$,j,K,W,te,ae="width"in M||"height"in M,me=this,Q={},ve=D.style,Ee=D.nodeType&&r(D),We=d.get(D,"fxshow");B.queue||($=n._queueHooks(D,"fx"),$.unqueued==null&&($.unqueued=0,j=$.empty.fire,$.empty.fire=function(){$.unqueued||j()}),$.unqueued++,me.always(function(){me.always(function(){$.unqueued--,n.queue(D,"fx").length||$.empty.fire()})}));for(k in M)if(G=M[k],T.test(G)){if(delete M[k],H=H||G==="toggle",G===(Ee?"hide":"show"))if(G==="show"&&We&&We[k]!==void 0)Ee=!0;else continue;Q[k]=We&&We[k]||n.style(D,k)}if(K=!n.isEmptyObject(M),!(!K&&n.isEmptyObject(Q))){ae&&D.nodeType===1&&(B.overflow=[ve.overflow,ve.overflowX,ve.overflowY],W=We&&We.display,W==null&&(W=d.get(D,"display")),te=n.css(D,"display"),te==="none"&&(W?te=W:(f([D],!0),W=D.style.display||W,te=n.css(D,"display"),f([D]))),(te==="inline"||te==="inline-block"&&W!=null)&&n.css(D,"float")==="none"&&(K||(me.done(function(){ve.display=W}),W==null&&(te=ve.display,W=te==="none"?"":te)),ve.display="inline-block")),B.overflow&&(ve.overflow="hidden",me.always(function(){ve.overflow=B.overflow[0],ve.overflowX=B.overflow[1],ve.overflowY=B.overflow[2]})),K=!1;for(k in Q)K||(We?"hidden"in We&&(Ee=We.hidden):We=d.access(D,"fxshow",{display:W}),H&&(We.hidden=!Ee),Ee&&f([D],!0),me.done(function(){Ee||f([D]),d.remove(D,"fxshow");for(k in Q)n.style(D,k,Q[k])})),K=A(Ee?We[k]:0,k,me),k in We||(We[k]=K.start,Ee&&(K.end=K.start,K.start=0))}}function R(D,M){var B,k,G,H,$;for(B in D)if(k=p(B),G=M[k],H=D[B],Array.isArray(H)&&(G=H[1],H=D[B]=H[0]),B!==k&&(D[k]=H,delete D[B]),$=n.cssHooks[k],$&&"expand"in $){H=$.expand(H),delete D[k];for(B in H)B in D||(D[B]=H[B],M[B]=G)}else M[k]=G}function C(D,M,B){var k,G,H=0,$=C.prefilters.length,j=n.Deferred().always(function(){delete K.elem}),K=function(){if(G)return!1;for(var ae=b||x(),me=Math.max(0,W.startTime+W.duration-ae),Q=me/W.duration||0,ve=1-Q,Ee=0,We=W.tweens.length;Ee<We;Ee++)W.tweens[Ee].run(ve);return j.notifyWith(D,[W,ve,me]),ve<1&&We?me:(We||j.notifyWith(D,[W,1,0]),j.resolveWith(D,[W]),!1)},W=j.promise({elem:D,props:n.extend({},M),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},B),originalProperties:M,originalOptions:B,startTime:b||x(),duration:B.duration,tweens:[],createTween:function(ae,me){var Q=n.Tween(D,W.opts,ae,me,W.opts.specialEasing[ae]||W.opts.easing);return W.tweens.push(Q),Q},stop:function(ae){var me=0,Q=ae?W.tweens.length:0;if(G)return this;for(G=!0;me<Q;me++)W.tweens[me].run(1);return ae?(j.notifyWith(D,[W,1,0]),j.resolveWith(D,[W,ae])):j.rejectWith(D,[W,ae]),this}}),te=W.props;for(R(te,W.opts.specialEasing);H<$;H++)if(k=C.prefilters[H].call(W,D,te,W.opts),k)return l(k.stop)&&(n._queueHooks(W.elem,W.opts.queue).stop=k.stop.bind(k)),k;return n.map(te,A,W),l(W.opts.start)&&W.opts.start.call(D,W),W.progress(W.opts.progress).done(W.opts.done,W.opts.complete).fail(W.opts.fail).always(W.opts.always),n.fx.timer(n.extend(K,{elem:D,anim:W,queue:W.opts.queue})),W}return n.Animation=n.extend(C,{tweeners:{"*":[function(D,M){var B=this.createTween(D,M);return g(B.elem,D,o.exec(M),B),B}]},tweener:function(D,M){l(D)?(M=D,D=["*"]):D=D.match(u);for(var B,k=0,G=D.length;k<G;k++)B=D[k],C.tweeners[B]=C.tweeners[B]||[],C.tweeners[B].unshift(M)},prefilters:[I],prefilter:function(D,M){M?C.prefilters.unshift(D):C.prefilters.push(D)}}),n.speed=function(D,M,B){var k=D&&typeof D=="object"?n.extend({},D):{complete:B||!B&&M||l(D)&&D,duration:D,easing:B&&M||M&&!l(M)&&M};return n.fx.off?k.duration=0:typeof k.duration!="number"&&(k.duration in n.fx.speeds?k.duration=n.fx.speeds[k.duration]:k.duration=n.fx.speeds._default),(k.queue==null||k.queue===!0)&&(k.queue="fx"),k.old=k.complete,k.complete=function(){l(k.old)&&k.old.call(this),k.queue&&n.dequeue(this,k.queue)},k},n.fn.extend({fadeTo:function(D,M,B,k){return this.filter(r).css("opacity",0).show().end().animate({opacity:M},D,B,k)},animate:function(D,M,B,k){var G=n.isEmptyObject(D),H=n.speed(M,B,k),$=function(){var j=C(this,n.extend({},D),H);(G||d.get(this,"finish"))&&j.stop(!0)};return $.finish=$,G||H.queue===!1?this.each($):this.queue(H.queue,$)},stop:function(D,M,B){var k=function(G){var H=G.stop;delete G.stop,H(B)};return typeof D!="string"&&(B=M,M=D,D=void 0),M&&this.queue(D||"fx",[]),this.each(function(){var G=!0,H=D!=null&&D+"queueHooks",$=n.timers,j=d.get(this);if(H)j[H]&&j[H].stop&&k(j[H]);else for(H in j)j[H]&&j[H].stop&&_.test(H)&&k(j[H]);for(H=$.length;H--;)$[H].elem===this&&(D==null||$[H].queue===D)&&($[H].anim.stop(B),G=!1,$.splice(H,1));(G||!B)&&n.dequeue(this,D)})},finish:function(D){return D!==!1&&(D=D||"fx"),this.each(function(){var M,B=d.get(this),k=B[D+"queue"],G=B[D+"queueHooks"],H=n.timers,$=k?k.length:0;for(B.finish=!0,n.queue(this,D,[]),G&&G.stop&&G.stop.call(this,!0),M=H.length;M--;)H[M].elem===this&&H[M].queue===D&&(H[M].anim.stop(!0),H.splice(M,1));for(M=0;M<$;M++)k[M]&&k[M].finish&&k[M].finish.call(this);delete B.finish})}}),n.each(["toggle","show","hide"],function(D,M){var B=n.fn[M];n.fn[M]=function(k,G,H){return k==null||typeof k=="boolean"?B.apply(this,arguments):this.animate(E(M,!0),k,G,H)}}),n.each({slideDown:E("show"),slideUp:E("hide"),slideToggle:E("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(D,M){n.fn[D]=function(B,k,G){return this.animate(M,B,k,G)}}),n.timers=[],n.fx.tick=function(){var D,M=0,B=n.timers;for(b=Date.now();M<B.length;M++)D=B[M],!D()&&B[M]===D&&B.splice(M--,1);B.length||n.fx.stop(),b=void 0},n.fx.timer=function(D){n.timers.push(D),n.fx.start()},n.fx.interval=13,n.fx.start=function(){y||(y=!0,P())},n.fx.stop=function(){y=null},n.fx.speeds={slow:600,fast:200,_default:400},n}.apply(v,m),i!==void 0&&(w.exports=i)},8314:(w,v,s)=>{var m,i;m=[s(8934),s(3997),s(8515)],i=function(n,p){"use strict";function c(l,o,u,h,r){return new c.prototype.init(l,o,u,h,r)}n.Tween=c,c.prototype={constructor:c,init:function(l,o,u,h,r,g){this.elem=l,this.prop=u,this.easing=r||n.easing._default,this.options=o,this.start=this.now=this.cur(),this.end=h,this.unit=g||(n.cssNumber[u]?"":"px")},cur:function(){var l=c.propHooks[this.prop];return l&&l.get?l.get(this):c.propHooks._default.get(this)},run:function(l){var o,u=c.propHooks[this.prop];return this.options.duration?this.pos=o=n.easing[this.easing](l,this.options.duration*l,0,1,this.options.duration):this.pos=o=l,this.now=(this.end-this.start)*o+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),u&&u.set?u.set(this):c.propHooks._default.set(this),this}},c.prototype.init.prototype=c.prototype,c.propHooks={_default:{get:function(l){var o;return l.elem.nodeType!==1||l.elem[l.prop]!=null&&l.elem.style[l.prop]==null?l.elem[l.prop]:(o=n.css(l.elem,l.prop,""),!o||o==="auto"?0:o)},set:function(l){n.fx.step[l.prop]?n.fx.step[l.prop](l):l.elem.nodeType===1&&(n.cssHooks[l.prop]||l.elem.style[p(l.prop)]!=null)?n.style(l.elem,l.prop,l.now+l.unit):l.elem[l.prop]=l.now}}},c.propHooks.scrollTop=c.propHooks.scrollLeft={set:function(l){l.elem.nodeType&&l.elem.parentNode&&(l.elem[l.prop]=l.now)}},n.easing={linear:function(l){return l},swing:function(l){return .5-Math.cos(l*Math.PI)/2},_default:"swing"},n.fx=c.prototype.init,n.fx.step={}}.apply(v,m),i!==void 0&&(w.exports=i)},8393:(w,v,s)=>{var m,i;m=[s(8934),s(655),s(7429)],i=function(n){"use strict";n.expr.pseudos.animated=function(p){return n.grep(n.timers,function(c){return p===c.elem}).length}}.apply(v,m),i!==void 0&&(w.exports=i)},7881:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(7730),s(2134),s(8663),s(8104),s(3623),s(2238),s(9081),s(7060),s(8048),s(655)],i=function(n,p,c,l,o,u,h,r,g,d){"use strict";var f=/^([^.]*)(?:\.(.+)|)/;function b(){return!0}function y(){return!1}function T(E,A){return E===_()==(A==="focus")}function _(){try{return p.activeElement}catch(E){}}function P(E,A,I,R,C,D){var M,B;if(typeof A=="object"){typeof I!="string"&&(R=R||I,I=void 0);for(B in A)P(E,B,I,R,A[B],D);return E}if(R==null&&C==null?(C=I,R=I=void 0):C==null&&(typeof I=="string"?(C=R,R=void 0):(C=R,R=I,I=void 0)),C===!1)C=y;else if(!C)return E;return D===1&&(M=C,C=function(k){return n().off(k),M.apply(this,arguments)},C.guid=M.guid||(M.guid=n.guid++)),E.each(function(){n.event.add(this,A,C,R,I)})}n.event={global:{},add:function(E,A,I,R,C){var D,M,B,k,G,H,$,j,K,W,te,ae=g.get(E);if(!!r(E))for(I.handler&&(D=I,I=D.handler,C=D.selector),C&&n.find.matchesSelector(c,C),I.guid||(I.guid=n.guid++),(k=ae.events)||(k=ae.events=Object.create(null)),(M=ae.handle)||(M=ae.handle=function(me){return typeof n!="undefined"&&n.event.triggered!==me.type?n.event.dispatch.apply(E,arguments):void 0}),A=(A||"").match(o)||[""],G=A.length;G--;)B=f.exec(A[G])||[],K=te=B[1],W=(B[2]||"").split(".").sort(),K&&($=n.event.special[K]||{},K=(C?$.delegateType:$.bindType)||K,$=n.event.special[K]||{},H=n.extend({type:K,origType:te,data:R,handler:I,guid:I.guid,selector:C,needsContext:C&&n.expr.match.needsContext.test(C),namespace:W.join(".")},D),(j=k[K])||(j=k[K]=[],j.delegateCount=0,(!$.setup||$.setup.call(E,R,W,M)===!1)&&E.addEventListener&&E.addEventListener(K,M)),$.add&&($.add.call(E,H),H.handler.guid||(H.handler.guid=I.guid)),C?j.splice(j.delegateCount++,0,H):j.push(H),n.event.global[K]=!0)},remove:function(E,A,I,R,C){var D,M,B,k,G,H,$,j,K,W,te,ae=g.hasData(E)&&g.get(E);if(!(!ae||!(k=ae.events))){for(A=(A||"").match(o)||[""],G=A.length;G--;){if(B=f.exec(A[G])||[],K=te=B[1],W=(B[2]||"").split(".").sort(),!K){for(K in k)n.event.remove(E,K+A[G],I,R,!0);continue}for($=n.event.special[K]||{},K=(R?$.delegateType:$.bindType)||K,j=k[K]||[],B=B[2]&&new RegExp("(^|\\.)"+W.join("\\.(?:.*\\.|)")+"(\\.|$)"),M=D=j.length;D--;)H=j[D],(C||te===H.origType)&&(!I||I.guid===H.guid)&&(!B||B.test(H.namespace))&&(!R||R===H.selector||R==="**"&&H.selector)&&(j.splice(D,1),H.selector&&j.delegateCount--,$.remove&&$.remove.call(E,H));M&&!j.length&&((!$.teardown||$.teardown.call(E,W,ae.handle)===!1)&&n.removeEvent(E,K,ae.handle),delete k[K])}n.isEmptyObject(k)&&g.remove(E,"handle events")}},dispatch:function(E){var A,I,R,C,D,M,B=new Array(arguments.length),k=n.event.fix(E),G=(g.get(this,"events")||Object.create(null))[k.type]||[],H=n.event.special[k.type]||{};for(B[0]=k,A=1;A<arguments.length;A++)B[A]=arguments[A];if(k.delegateTarget=this,!(H.preDispatch&&H.preDispatch.call(this,k)===!1)){for(M=n.event.handlers.call(this,k,G),A=0;(C=M[A++])&&!k.isPropagationStopped();)for(k.currentTarget=C.elem,I=0;(D=C.handlers[I++])&&!k.isImmediatePropagationStopped();)(!k.rnamespace||D.namespace===!1||k.rnamespace.test(D.namespace))&&(k.handleObj=D,k.data=D.data,R=((n.event.special[D.origType]||{}).handle||D.handler).apply(C.elem,B),R!==void 0&&(k.result=R)===!1&&(k.preventDefault(),k.stopPropagation()));return H.postDispatch&&H.postDispatch.call(this,k),k.result}},handlers:function(E,A){var I,R,C,D,M,B=[],k=A.delegateCount,G=E.target;if(k&&G.nodeType&&!(E.type==="click"&&E.button>=1)){for(;G!==this;G=G.parentNode||this)if(G.nodeType===1&&!(E.type==="click"&&G.disabled===!0)){for(D=[],M={},I=0;I<k;I++)R=A[I],C=R.selector+" ",M[C]===void 0&&(M[C]=R.needsContext?n(C,this).index(G)>-1:n.find(C,this,null,[G]).length),M[C]&&D.push(R);D.length&&B.push({elem:G,handlers:D})}}return G=this,k<A.length&&B.push({elem:G,handlers:A.slice(k)}),B},addProp:function(E,A){Object.defineProperty(n.Event.prototype,E,{enumerable:!0,configurable:!0,get:l(A)?function(){if(this.originalEvent)return A(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[E]},set:function(I){Object.defineProperty(this,E,{enumerable:!0,configurable:!0,writable:!0,value:I})}})},fix:function(E){return E[n.expando]?E:new n.Event(E)},special:{load:{noBubble:!0},click:{setup:function(E){var A=this||E;return u.test(A.type)&&A.click&&d(A,"input")&&x(A,"click",b),!1},trigger:function(E){var A=this||E;return u.test(A.type)&&A.click&&d(A,"input")&&x(A,"click"),!0},_default:function(E){var A=E.target;return u.test(A.type)&&A.click&&d(A,"input")&&g.get(A,"click")||d(A,"a")}},beforeunload:{postDispatch:function(E){E.result!==void 0&&E.originalEvent&&(E.originalEvent.returnValue=E.result)}}}};function x(E,A,I){if(!I){g.get(E,A)===void 0&&n.event.add(E,A,b);return}g.set(E,A,!1),n.event.add(E,A,{namespace:!1,handler:function(R){var C,D,M=g.get(this,A);if(R.isTrigger&1&&this[A]){if(M.length)(n.event.special[A]||{}).delegateType&&R.stopPropagation();else if(M=h.call(arguments),g.set(this,A,M),C=I(this,A),this[A](),D=g.get(this,A),M!==D||C?g.set(this,A,!1):D={},M!==D)return R.stopImmediatePropagation(),R.preventDefault(),D&&D.value}else M.length&&(g.set(this,A,{value:n.event.trigger(n.extend(M[0],n.Event.prototype),M.slice(1),this)}),R.stopImmediatePropagation())}})}return n.removeEvent=function(E,A,I){E.removeEventListener&&E.removeEventListener(A,I)},n.Event=function(E,A){if(!(this instanceof n.Event))return new n.Event(E,A);E&&E.type?(this.originalEvent=E,this.type=E.type,this.isDefaultPrevented=E.defaultPrevented||E.defaultPrevented===void 0&&E.returnValue===!1?b:y,this.target=E.target&&E.target.nodeType===3?E.target.parentNode:E.target,this.currentTarget=E.currentTarget,this.relatedTarget=E.relatedTarget):this.type=E,A&&n.extend(this,A),this.timeStamp=E&&E.timeStamp||Date.now(),this[n.expando]=!0},n.Event.prototype={constructor:n.Event,isDefaultPrevented:y,isPropagationStopped:y,isImmediatePropagationStopped:y,isSimulated:!1,preventDefault:function(){var E=this.originalEvent;this.isDefaultPrevented=b,E&&!this.isSimulated&&E.preventDefault()},stopPropagation:function(){var E=this.originalEvent;this.isPropagationStopped=b,E&&!this.isSimulated&&E.stopPropagation()},stopImmediatePropagation:function(){var E=this.originalEvent;this.isImmediatePropagationStopped=b,E&&!this.isSimulated&&E.stopImmediatePropagation(),this.stopPropagation()}},n.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},n.event.addProp),n.each({focus:"focusin",blur:"focusout"},function(E,A){n.event.special[E]={setup:function(){return x(this,E,T),!1},trigger:function(){return x(this,E),!0},_default:function(){return!0},delegateType:A}}),n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(E,A){n.event.special[E]={delegateType:A,bindType:A,handle:function(I){var R,C=this,D=I.relatedTarget,M=I.handleObj;return(!D||D!==C&&!n.contains(C,D))&&(I.type=M.origType,R=M.handler.apply(this,arguments),I.type=A),R}}}),n.fn.extend({on:function(E,A,I,R){return P(this,E,A,I,R)},one:function(E,A,I,R){return P(this,E,A,I,R,1)},off:function(E,A,I){var R,C;if(E&&E.preventDefault&&E.handleObj)return R=E.handleObj,n(E.delegateTarget).off(R.namespace?R.origType+"."+R.namespace:R.origType,R.selector,R.handler),this;if(typeof E=="object"){for(C in E)this.off(C,A,E[C]);return this}return(A===!1||typeof A=="function")&&(I=A,A=void 0),I===!1&&(I=y),this.each(function(){n.event.remove(this,E,I,A)})}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},6611:(w,v,s)=>{var m,i;m=[s(8934),s(9081),s(8266),s(7881),s(1045)],i=function(n,p,c){"use strict";return c.focusin||n.each({focus:"focusin",blur:"focusout"},function(l,o){var u=function(h){n.event.simulate(o,h.target,n.event.fix(h))};n.event.special[o]={setup:function(){var h=this.ownerDocument||this.document||this,r=p.access(h,o);r||h.addEventListener(l,u,!0),p.access(h,o,(r||0)+1)},teardown:function(){var h=this.ownerDocument||this.document||this,r=p.access(h,o)-1;r?p.access(h,o,r):(h.removeEventListener(l,u,!0),p.remove(h,o))}}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},8266:(w,v,s)=>{var m,i;m=[s(9523)],i=function(n){"use strict";return n.focusin="onfocusin"in window,n}.apply(v,m),i!==void 0&&(w.exports=i)},1045:(w,v,s)=>{var m,i;m=[s(8934),s(7792),s(9081),s(2238),s(9694),s(2134),s(9031),s(7881)],i=function(n,p,c,l,o,u,h){"use strict";var r=/^(?:focusinfocus|focusoutblur)$/,g=function(d){d.stopPropagation()};return n.extend(n.event,{trigger:function(d,f,b,y){var T,_,P,x,E,A,I,R,C=[b||p],D=o.call(d,"type")?d.type:d,M=o.call(d,"namespace")?d.namespace.split("."):[];if(_=R=P=b=b||p,!(b.nodeType===3||b.nodeType===8)&&!r.test(D+n.event.triggered)&&(D.indexOf(".")>-1&&(M=D.split("."),D=M.shift(),M.sort()),E=D.indexOf(":")<0&&"on"+D,d=d[n.expando]?d:new n.Event(D,typeof d=="object"&&d),d.isTrigger=y?2:3,d.namespace=M.join("."),d.rnamespace=d.namespace?new RegExp("(^|\\.)"+M.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,d.result=void 0,d.target||(d.target=b),f=f==null?[d]:n.makeArray(f,[d]),I=n.event.special[D]||{},!(!y&&I.trigger&&I.trigger.apply(b,f)===!1))){if(!y&&!I.noBubble&&!h(b)){for(x=I.delegateType||D,r.test(x+D)||(_=_.parentNode);_;_=_.parentNode)C.push(_),P=_;P===(b.ownerDocument||p)&&C.push(P.defaultView||P.parentWindow||window)}for(T=0;(_=C[T++])&&!d.isPropagationStopped();)R=_,d.type=T>1?x:I.bindType||D,A=(c.get(_,"events")||Object.create(null))[d.type]&&c.get(_,"handle"),A&&A.apply(_,f),A=E&&_[E],A&&A.apply&&l(_)&&(d.result=A.apply(_,f),d.result===!1&&d.preventDefault());return d.type=D,!y&&!d.isDefaultPrevented()&&(!I._default||I._default.apply(C.pop(),f)===!1)&&l(b)&&E&&u(b[D])&&!h(b)&&(P=b[E],P&&(b[E]=null),n.event.triggered=D,d.isPropagationStopped()&&R.addEventListener(D,g),b[D](),d.isPropagationStopped()&&R.removeEventListener(D,g),n.event.triggered=void 0,P&&(b[E]=P)),d.result}},simulate:function(d,f,b){var y=n.extend(new n.Event,b,{type:d,isSimulated:!0});n.event.trigger(y,null,f)}}),n.fn.extend({trigger:function(d,f){return this.each(function(){n.event.trigger(d,f,this)})},triggerHandler:function(d,f){var b=this[0];if(b)return n.event.trigger(d,f,b,!0)}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},692:(w,v,s)=>{var m,i,m,i;m=[s(8934)],i=function(n){"use strict";m=[],i=function(){return n}.apply(v,m),i!==void 0&&(w.exports=i)}.apply(v,m),i!==void 0&&(w.exports=i)},4278:(w,v,s)=>{var m,i;m=[s(8934)],i=function(n){"use strict";var p=window.jQuery,c=window.$;n.noConflict=function(l){return window.$===n&&(window.$=c),l&&window.jQuery===n&&(window.jQuery=p),n},typeof noGlobal=="undefined"&&(window.jQuery=window.$=n)}.apply(v,m),i!==void 0&&(w.exports=i)},4002:(w,v,s)=>{var m,i;m=[s(8934),s(655),s(8482),s(8924),s(6525),s(1009),s(5703),s(1786),s(1387),s(6572),s(8468),s(7881),s(6611),s(2632),s(8123),s(5594),s(8515),s(2365),s(5385),s(7178),s(8853),s(5488),s(7533),s(4581),s(461),s(2889),s(7429),s(8393),s(5356),s(5126),s(7722),s(692),s(4278)],i=function(n){"use strict";return n}.apply(v,m),i!==void 0&&(w.exports=i)},2632:(w,v,s)=>{var m,i;m=[s(8934),s(70),s(3932),s(2134),s(1780),s(8104),s(7163),s(9422),s(8950),s(5219),s(2455),s(7162),s(3360),s(8771),s(9081),s(2109),s(2238),s(1224),s(7060),s(8048),s(8482),s(655),s(7881)],i=function(n,p,c,l,o,u,h,r,g,d,f,b,y,T,_,P,x,E,A){"use strict";var I=/<script|<style|<link/i,R=/checked\s*(?:[^=]|=\s*.checked.)/i,C=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function D(j,K){return A(j,"table")&&A(K.nodeType!==11?K:K.firstChild,"tr")&&n(j).children("tbody")[0]||j}function M(j){return j.type=(j.getAttribute("type")!==null)+"/"+j.type,j}function B(j){return(j.type||"").slice(0,5)==="true/"?j.type=j.type.slice(5):j.removeAttribute("type"),j}function k(j,K){var W,te,ae,me,Q,ve,Ee;if(K.nodeType===1){if(_.hasData(j)&&(me=_.get(j),Ee=me.events,Ee)){_.remove(K,"handle events");for(ae in Ee)for(W=0,te=Ee[ae].length;W<te;W++)n.event.add(K,ae,Ee[ae][W])}P.hasData(j)&&(Q=P.access(j),ve=n.extend({},Q),P.set(K,ve))}}function G(j,K){var W=K.nodeName.toLowerCase();W==="input"&&u.test(j.type)?K.checked=j.checked:(W==="input"||W==="textarea")&&(K.defaultValue=j.defaultValue)}function H(j,K,W,te){K=c(K);var ae,me,Q,ve,Ee,We,gt=0,Nt=j.length,Dt=Nt-1,Ct=K[0],$t=l(Ct);if($t||Nt>1&&typeof Ct=="string"&&!T.checkClone&&R.test(Ct))return j.each(function(qe){var Ft=j.eq(qe);$t&&(K[0]=Ct.call(this,qe,Ft.html())),H(Ft,K,W,te)});if(Nt&&(ae=y(K,j[0].ownerDocument,!1,j,te),me=ae.firstChild,ae.childNodes.length===1&&(ae=me),me||te)){for(Q=n.map(f(ae,"script"),M),ve=Q.length;gt<Nt;gt++)Ee=ae,gt!==Dt&&(Ee=n.clone(Ee,!0,!0),ve&&n.merge(Q,f(Ee,"script"))),W.call(j[gt],Ee,gt);if(ve)for(We=Q[Q.length-1].ownerDocument,n.map(Q,B),gt=0;gt<ve;gt++)Ee=Q[gt],g.test(Ee.type||"")&&!_.access(Ee,"globalEval")&&n.contains(We,Ee)&&(Ee.src&&(Ee.type||"").toLowerCase()!=="module"?n._evalUrl&&!Ee.noModule&&n._evalUrl(Ee.src,{nonce:Ee.nonce||Ee.getAttribute("nonce")},We):E(Ee.textContent.replace(C,""),Ee,We))}return j}function $(j,K,W){for(var te,ae=K?n.filter(K,j):j,me=0;(te=ae[me])!=null;me++)!W&&te.nodeType===1&&n.cleanData(f(te)),te.parentNode&&(W&&p(te)&&b(f(te,"script")),te.parentNode.removeChild(te));return j}return n.extend({htmlPrefilter:function(j){return j},clone:function(j,K,W){var te,ae,me,Q,ve=j.cloneNode(!0),Ee=p(j);if(!T.noCloneChecked&&(j.nodeType===1||j.nodeType===11)&&!n.isXMLDoc(j))for(Q=f(ve),me=f(j),te=0,ae=me.length;te<ae;te++)G(me[te],Q[te]);if(K)if(W)for(me=me||f(j),Q=Q||f(ve),te=0,ae=me.length;te<ae;te++)k(me[te],Q[te]);else k(j,ve);return Q=f(ve,"script"),Q.length>0&&b(Q,!Ee&&f(j,"script")),ve},cleanData:function(j){for(var K,W,te,ae=n.event.special,me=0;(W=j[me])!==void 0;me++)if(x(W)){if(K=W[_.expando]){if(K.events)for(te in K.events)ae[te]?n.event.remove(W,te):n.removeEvent(W,te,K.handle);W[_.expando]=void 0}W[P.expando]&&(W[P.expando]=void 0)}}}),n.fn.extend({detach:function(j){return $(this,j,!0)},remove:function(j){return $(this,j)},text:function(j){return h(this,function(K){return K===void 0?n.text(this):this.empty().each(function(){(this.nodeType===1||this.nodeType===11||this.nodeType===9)&&(this.textContent=K)})},null,j,arguments.length)},append:function(){return H(this,arguments,function(j){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var K=D(this,j);K.appendChild(j)}})},prepend:function(){return H(this,arguments,function(j){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var K=D(this,j);K.insertBefore(j,K.firstChild)}})},before:function(){return H(this,arguments,function(j){this.parentNode&&this.parentNode.insertBefore(j,this)})},after:function(){return H(this,arguments,function(j){this.parentNode&&this.parentNode.insertBefore(j,this.nextSibling)})},empty:function(){for(var j,K=0;(j=this[K])!=null;K++)j.nodeType===1&&(n.cleanData(f(j,!1)),j.textContent="");return this},clone:function(j,K){return j=j==null?!1:j,K=K==null?j:K,this.map(function(){return n.clone(this,j,K)})},html:function(j){return h(this,function(K){var W=this[0]||{},te=0,ae=this.length;if(K===void 0&&W.nodeType===1)return W.innerHTML;if(typeof K=="string"&&!I.test(K)&&!d[(r.exec(K)||["",""])[1].toLowerCase()]){K=n.htmlPrefilter(K);try{for(;te<ae;te++)W=this[te]||{},W.nodeType===1&&(n.cleanData(f(W,!1)),W.innerHTML=K);W=0}catch(me){}}W&&this.empty().append(K)},null,j,arguments.length)},replaceWith:function(){var j=[];return H(this,arguments,function(K){var W=this.parentNode;n.inArray(this,j)<0&&(n.cleanData(f(this)),W&&W.replaceChild(K,this))},j)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(j,K){n.fn[j]=function(W){for(var te,ae=[],me=n(W),Q=me.length-1,ve=0;ve<=Q;ve++)te=ve===Q?this:this.clone(!0),n(me[ve])[K](te),o.apply(ae,te.get());return this.pushStack(ae)}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},8123:(w,v,s)=>{var m,i;m=[s(7178)],i=function(n){"use strict";return n._evalUrl=function(p,c,l){return n.ajax({url:p,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(o){n.globalEval(o,c,l)}})},n._evalUrl}.apply(v,m),i!==void 0&&(w.exports=i)},3360:(w,v,s)=>{var m,i;m=[s(8934),s(8082),s(70),s(9422),s(8950),s(5219),s(2455),s(7162)],i=function(n,p,c,l,o,u,h,r){"use strict";var g=/<|&#?\w+;/;function d(f,b,y,T,_){for(var P,x,E,A,I,R,C=b.createDocumentFragment(),D=[],M=0,B=f.length;M<B;M++)if(P=f[M],P||P===0)if(p(P)==="object")n.merge(D,P.nodeType?[P]:P);else if(!g.test(P))D.push(b.createTextNode(P));else{for(x=x||C.appendChild(b.createElement("div")),E=(l.exec(P)||["",""])[1].toLowerCase(),A=u[E]||u._default,x.innerHTML=A[1]+n.htmlPrefilter(P)+A[2],R=A[0];R--;)x=x.lastChild;n.merge(D,x.childNodes),x=C.firstChild,x.textContent=""}for(C.textContent="",M=0;P=D[M++];){if(T&&n.inArray(P,T)>-1){_&&_.push(P);continue}if(I=c(P),x=h(C.appendChild(P),"script"),I&&r(x),y)for(R=0;P=x[R++];)o.test(P.type||"")&&y.push(P)}return C}return d}.apply(v,m),i!==void 0&&(w.exports=i)},2455:(w,v,s)=>{var m,i;m=[s(8934),s(7060)],i=function(n,p){"use strict";function c(l,o){var u;return typeof l.getElementsByTagName!="undefined"?u=l.getElementsByTagName(o||"*"):typeof l.querySelectorAll!="undefined"?u=l.querySelectorAll(o||"*"):u=[],o===void 0||o&&p(l,o)?n.merge([l],u):u}return c}.apply(v,m),i!==void 0&&(w.exports=i)},7162:(w,v,s)=>{var m,i;m=[s(9081)],i=function(n){"use strict";function p(c,l){for(var o=0,u=c.length;o<u;o++)n.set(c[o],"globalEval",!l||n.get(l[o],"globalEval"))}return p}.apply(v,m),i!==void 0&&(w.exports=i)},8771:(w,v,s)=>{var m,i;m=[s(7792),s(9523)],i=function(n,p){"use strict";return function(){var c=n.createDocumentFragment(),l=c.appendChild(n.createElement("div")),o=n.createElement("input");o.setAttribute("type","radio"),o.setAttribute("checked","checked"),o.setAttribute("name","t"),l.appendChild(o),p.checkClone=l.cloneNode(!0).cloneNode(!0).lastChild.checked,l.innerHTML="<textarea>x</textarea>",p.noCloneChecked=!!l.cloneNode(!0).lastChild.defaultValue,l.innerHTML="<option></option>",p.option=!!l.lastChild}(),p}.apply(v,m),i!==void 0&&(w.exports=i)},8950:(w,v,s)=>{var m;m=function(){"use strict";return/^$|^module$|\/(?:java|ecma)script/i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},9422:(w,v,s)=>{var m;m=function(){"use strict";return/<([a-z][^\/\0>\x20\t\r\n\f]*)/i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},5219:(w,v,s)=>{var m,i;m=[s(8771)],i=function(n){"use strict";var p={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};return p.tbody=p.tfoot=p.colgroup=p.caption=p.thead,p.th=p.td,n.option||(p.optgroup=p.option=[1,"<select multiple='multiple'>","</select>"]),p}.apply(v,m),i!==void 0&&(w.exports=i)},5356:(w,v,s)=>{var m,i;m=[s(8934),s(7163),s(7730),s(2134),s(618),s(610),s(3781),s(4405),s(9031),s(8048),s(8515),s(655)],i=function(n,p,c,l,o,u,h,r,g){"use strict";return n.offset={setOffset:function(d,f,b){var y,T,_,P,x,E,A,I=n.css(d,"position"),R=n(d),C={};I==="static"&&(d.style.position="relative"),x=R.offset(),_=n.css(d,"top"),E=n.css(d,"left"),A=(I==="absolute"||I==="fixed")&&(_+E).indexOf("auto")>-1,A?(y=R.position(),P=y.top,T=y.left):(P=parseFloat(_)||0,T=parseFloat(E)||0),l(f)&&(f=f.call(d,b,n.extend({},x))),f.top!=null&&(C.top=f.top-x.top+P),f.left!=null&&(C.left=f.left-x.left+T),"using"in f?f.using.call(d,C):R.css(C)}},n.fn.extend({offset:function(d){if(arguments.length)return d===void 0?this:this.each(function(T){n.offset.setOffset(this,d,T)});var f,b,y=this[0];if(!!y)return y.getClientRects().length?(f=y.getBoundingClientRect(),b=y.ownerDocument.defaultView,{top:f.top+b.pageYOffset,left:f.left+b.pageXOffset}):{top:0,left:0}},position:function(){if(!!this[0]){var d,f,b,y=this[0],T={top:0,left:0};if(n.css(y,"position")==="fixed")f=y.getBoundingClientRect();else{for(f=this.offset(),b=y.ownerDocument,d=y.offsetParent||b.documentElement;d&&(d===b.body||d===b.documentElement)&&n.css(d,"position")==="static";)d=d.parentNode;d&&d!==y&&d.nodeType===1&&(T=n(d).offset(),T.top+=n.css(d,"borderTopWidth",!0),T.left+=n.css(d,"borderLeftWidth",!0))}return{top:f.top-T.top-n.css(y,"marginTop",!0),left:f.left-T.left-n.css(y,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var d=this.offsetParent;d&&n.css(d,"position")==="static";)d=d.offsetParent;return d||c})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(d,f){var b=f==="pageYOffset";n.fn[d]=function(y){return p(this,function(T,_,P){var x;if(g(T)?x=T:T.nodeType===9&&(x=T.defaultView),P===void 0)return x?x[f]:T[_];x?x.scrollTo(b?x.pageXOffset:P,b?P:x.pageYOffset):T[_]=P},d,y,arguments.length)}}),n.each(["top","left"],function(d,f){n.cssHooks[f]=h(r.pixelPosition,function(b,y){if(y)return y=u(b,f),o.test(y)?n(b).position()[f]+"px":y})}),n}.apply(v,m),i!==void 0&&(w.exports=i)},1387:(w,v,s)=>{var m,i;m=[s(8934),s(9081),s(6525),s(8924)],i=function(n,p){"use strict";return n.extend({queue:function(c,l,o){var u;if(c)return l=(l||"fx")+"queue",u=p.get(c,l),o&&(!u||Array.isArray(o)?u=p.access(c,l,n.makeArray(o)):u.push(o)),u||[]},dequeue:function(c,l){l=l||"fx";var o=n.queue(c,l),u=o.length,h=o.shift(),r=n._queueHooks(c,l),g=function(){n.dequeue(c,l)};h==="inprogress"&&(h=o.shift(),u--),h&&(l==="fx"&&o.unshift("inprogress"),delete r.stop,h.call(c,g,r)),!u&&r&&r.empty.fire()},_queueHooks:function(c,l){var o=l+"queueHooks";return p.get(c,o)||p.access(c,o,{empty:n.Callbacks("once memory").add(function(){p.remove(c,[l+"queue",o])})})}}),n.fn.extend({queue:function(c,l){var o=2;return typeof c!="string"&&(l=c,c="fx",o--),arguments.length<o?n.queue(this[0],c):l===void 0?this:this.each(function(){var u=n.queue(this,c,l);n._queueHooks(this,c),c==="fx"&&u[0]!=="inprogress"&&n.dequeue(this,c)})},dequeue:function(c){return this.each(function(){n.dequeue(this,c)})},clearQueue:function(c){return this.queue(c||"fx",[])},promise:function(c,l){var o,u=1,h=n.Deferred(),r=this,g=this.length,d=function(){--u||h.resolveWith(r,[r])};for(typeof c!="string"&&(l=c,c=void 0),c=c||"fx";g--;)o=p.get(r[g],c+"queueHooks"),o&&o.empty&&(u++,o.empty.add(d));return d(),h.promise(l)}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},6572:(w,v,s)=>{var m,i;m=[s(8934),s(1387),s(7429)],i=function(n){"use strict";return n.fn.delay=function(p,c){return p=n.fx&&n.fx.speeds[p]||p,c=c||"fx",this.queue(c,function(l,o){var u=window.setTimeout(l,p);o.stop=function(){window.clearTimeout(u)}})},n.fn.delay}.apply(v,m),i!==void 0&&(w.exports=i)},4338:(w,v,s)=>{var m,i;m=[s(8934),s(9414)],i=function(n,p){"use strict";n.find=p,n.expr=p.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=p.uniqueSort,n.text=p.getText,n.isXMLDoc=p.isXML,n.contains=p.contains,n.escapeSelector=p.escape}.apply(v,m),i!==void 0&&(w.exports=i)},655:(w,v,s)=>{var m,i;m=[s(4338)],i=function(){"use strict"}.apply(v,m),i!==void 0&&(w.exports=i)},5385:(w,v,s)=>{var m,i;m=[s(8934),s(8082),s(8104),s(2134),s(8048),s(8482),s(4043)],i=function(n,p,c,l){"use strict";var o=/\[\]$/,u=/\r?\n/g,h=/^(?:submit|button|image|reset|file)$/i,r=/^(?:input|select|textarea|keygen)/i;function g(d,f,b,y){var T;if(Array.isArray(f))n.each(f,function(_,P){b||o.test(d)?y(d,P):g(d+"["+(typeof P=="object"&&P!=null?_:"")+"]",P,b,y)});else if(!b&&p(f)==="object")for(T in f)g(d+"["+T+"]",f[T],b,y);else y(d,f)}return n.param=function(d,f){var b,y=[],T=function(_,P){var x=l(P)?P():P;y[y.length]=encodeURIComponent(_)+"="+encodeURIComponent(x==null?"":x)};if(d==null)return"";if(Array.isArray(d)||d.jquery&&!n.isPlainObject(d))n.each(d,function(){T(this.name,this.value)});else for(b in d)g(b,d[b],f,T);return y.join("&")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var d=n.prop(this,"elements");return d?n.makeArray(d):this}).filter(function(){var d=this.type;return this.name&&!n(this).is(":disabled")&&r.test(this.nodeName)&&!h.test(d)&&(this.checked||!c.test(d))}).map(function(d,f){var b=n(this).val();return b==null?null:Array.isArray(b)?n.map(b,function(y){return{name:f.name,value:y.replace(u,`\r
`)}}):{name:f.name,value:b.replace(u,`\r
`)}}).get()}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},8482:(w,v,s)=>{var m,i;m=[s(8934),s(8045),s(5431),s(1721),s(2495),s(8020),s(7060),s(8048),s(1764),s(655)],i=function(n,p,c,l,o,u,h){"use strict";var r=/^(?:parents|prev(?:Until|All))/,g={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(f){var b=n(f,this),y=b.length;return this.filter(function(){for(var T=0;T<y;T++)if(n.contains(this,b[T]))return!0})},closest:function(f,b){var y,T=0,_=this.length,P=[],x=typeof f!="string"&&n(f);if(!u.test(f)){for(;T<_;T++)for(y=this[T];y&&y!==b;y=y.parentNode)if(y.nodeType<11&&(x?x.index(y)>-1:y.nodeType===1&&n.find.matchesSelector(y,f))){P.push(y);break}}return this.pushStack(P.length>1?n.uniqueSort(P):P)},index:function(f){return f?typeof f=="string"?c.call(n(f),this[0]):c.call(this,f.jquery?f[0]:f):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(f,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(f,b))))},addBack:function(f){return this.add(f==null?this.prevObject:this.prevObject.filter(f))}});function d(f,b){for(;(f=f[b])&&f.nodeType!==1;);return f}return n.each({parent:function(f){var b=f.parentNode;return b&&b.nodeType!==11?b:null},parents:function(f){return l(f,"parentNode")},parentsUntil:function(f,b,y){return l(f,"parentNode",y)},next:function(f){return d(f,"nextSibling")},prev:function(f){return d(f,"previousSibling")},nextAll:function(f){return l(f,"nextSibling")},prevAll:function(f){return l(f,"previousSibling")},nextUntil:function(f,b,y){return l(f,"nextSibling",y)},prevUntil:function(f,b,y){return l(f,"previousSibling",y)},siblings:function(f){return o((f.parentNode||{}).firstChild,f)},children:function(f){return o(f.firstChild)},contents:function(f){return f.contentDocument!=null&&p(f.contentDocument)?f.contentDocument:(h(f,"template")&&(f=f.content||f),n.merge([],f.childNodes))}},function(f,b){n.fn[f]=function(y,T){var _=n.map(this,b,y);return f.slice(-5)!=="Until"&&(T=y),T&&typeof T=="string"&&(_=n.filter(T,_)),this.length>1&&(g[f]||n.uniqueSort(_),r.test(f)&&_.reverse()),this.pushStack(_)}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},1764:(w,v,s)=>{var m,i;m=[s(8934),s(5431),s(2134),s(8020),s(655)],i=function(n,p,c,l){"use strict";function o(u,h,r){return c(h)?n.grep(u,function(g,d){return!!h.call(g,d,g)!==r}):h.nodeType?n.grep(u,function(g){return g===h!==r}):typeof h!="string"?n.grep(u,function(g){return p.call(h,g)>-1!==r}):n.filter(h,u,r)}n.filter=function(u,h,r){var g=h[0];return r&&(u=":not("+u+")"),h.length===1&&g.nodeType===1?n.find.matchesSelector(g,u)?[g]:[]:n.find.matches(u,n.grep(h,function(d){return d.nodeType===1}))},n.fn.extend({find:function(u){var h,r,g=this.length,d=this;if(typeof u!="string")return this.pushStack(n(u).filter(function(){for(h=0;h<g;h++)if(n.contains(d[h],this))return!0}));for(r=this.pushStack([]),h=0;h<g;h++)n.find(u,d[h],r);return g>1?n.uniqueSort(r):r},filter:function(u){return this.pushStack(o(this,u||[],!1))},not:function(u){return this.pushStack(o(this,u||[],!0))},is:function(u){return!!o(this,typeof u=="string"&&l.test(u)?n(u):u||[],!1).length}})}.apply(v,m),i!==void 0&&(w.exports=i)},1721:(w,v,s)=>{var m,i;m=[s(8934)],i=function(n){"use strict";return function(p,c,l){for(var o=[],u=l!==void 0;(p=p[c])&&p.nodeType!==9;)if(p.nodeType===1){if(u&&n(p).is(l))break;o.push(p)}return o}}.apply(v,m),i!==void 0&&(w.exports=i)},8020:(w,v,s)=>{var m,i;m=[s(8934),s(655)],i=function(n){"use strict";return n.expr.match.needsContext}.apply(v,m),i!==void 0&&(w.exports=i)},2495:(w,v,s)=>{var m;m=function(){"use strict";return function(i,n){for(var p=[];i;i=i.nextSibling)i.nodeType===1&&i!==n&&p.push(i);return p}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},3:(w,v,s)=>{var m,i;m=[s(4194)],i=function(n){"use strict";return n.call(Object)}.apply(v,m),i!==void 0&&(w.exports=i)},3727:(w,v,s)=>{var m;m=function(){"use strict";return[]}.call(v,s,v,w),m!==void 0&&(w.exports=m)},5949:(w,v,s)=>{var m;m=function(){"use strict";return{}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},7792:(w,v,s)=>{var m;m=function(){"use strict";return window.document}.call(v,s,v,w),m!==void 0&&(w.exports=m)},7730:(w,v,s)=>{var m,i;m=[s(7792)],i=function(n){"use strict";return n.documentElement}.apply(v,m),i!==void 0&&(w.exports=i)},3932:(w,v,s)=>{var m,i;m=[s(3727)],i=function(n){"use strict";return n.flat?function(p){return n.flat.call(p)}:function(p){return n.concat.apply([],p)}}.apply(v,m),i!==void 0&&(w.exports=i)},4194:(w,v,s)=>{var m,i;m=[s(9694)],i=function(n){"use strict";return n.toString}.apply(v,m),i!==void 0&&(w.exports=i)},8045:(w,v,s)=>{var m;m=function(){"use strict";return Object.getPrototypeOf}.call(v,s,v,w),m!==void 0&&(w.exports=m)},9694:(w,v,s)=>{var m,i;m=[s(5949)],i=function(n){"use strict";return n.hasOwnProperty}.apply(v,m),i!==void 0&&(w.exports=i)},5431:(w,v,s)=>{var m,i;m=[s(3727)],i=function(n){"use strict";return n.indexOf}.apply(v,m),i!==void 0&&(w.exports=i)},2134:(w,v,s)=>{var m;m=function(){"use strict";return function(n){return typeof n=="function"&&typeof n.nodeType!="number"&&typeof n.item!="function"}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},9031:(w,v,s)=>{var m;m=function(){"use strict";return function(n){return n!=null&&n===n.window}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},8308:(w,v,s)=>{var m;m=function(){"use strict";return/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source}.call(v,s,v,w),m!==void 0&&(w.exports=m)},1780:(w,v,s)=>{var m,i;m=[s(3727)],i=function(n){"use strict";return n.push}.apply(v,m),i!==void 0&&(w.exports=i)},8104:(w,v,s)=>{var m;m=function(){"use strict";return/^(?:checkbox|radio)$/i}.call(v,s,v,w),m!==void 0&&(w.exports=m)},6871:(w,v,s)=>{var m,i;m=[s(8308)],i=function(n){"use strict";return new RegExp("^(?:([+-])=|)("+n+")([a-z%]*)$","i")}.apply(v,m),i!==void 0&&(w.exports=i)},8663:(w,v,s)=>{var m;m=function(){"use strict";return/[^\x20\t\r\n\f]+/g}.call(v,s,v,w),m!==void 0&&(w.exports=m)},3623:(w,v,s)=>{var m,i;m=[s(3727)],i=function(n){"use strict";return n.slice}.apply(v,m),i!==void 0&&(w.exports=i)},9523:(w,v,s)=>{var m;m=function(){"use strict";return{}}.call(v,s,v,w),m!==void 0&&(w.exports=m)},7763:(w,v,s)=>{var m,i;m=[s(5949)],i=function(n){"use strict";return n.toString}.apply(v,m),i!==void 0&&(w.exports=i)},5594:(w,v,s)=>{var m,i;m=[s(8934),s(2134),s(8048),s(2632),s(8482)],i=function(n,p){"use strict";return n.fn.extend({wrapAll:function(c){var l;return this[0]&&(p(c)&&(c=c.call(this[0])),l=n(c,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&l.insertBefore(this[0]),l.map(function(){for(var o=this;o.firstElementChild;)o=o.firstElementChild;return o}).append(this)),this},wrapInner:function(c){return p(c)?this.each(function(l){n(this).wrapInner(c.call(this,l))}):this.each(function(){var l=n(this),o=l.contents();o.length?o.wrapAll(c):l.append(c)})},wrap:function(c){var l=p(c);return this.each(function(o){n(this).wrapAll(l?c.call(this,o):c)})},unwrap:function(c){return this.parent(c).not("body").each(function(){n(this).replaceWith(this.childNodes)}),this}}),n}.apply(v,m),i!==void 0&&(w.exports=i)},6486:function(w,v,s){w=s.nmd(w);var m;/**
* @license
* Lodash <https://lodash.com/>
* Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
* Released under MIT license <https://lodash.com/license>
* Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
* Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
*/(function(){var i,n="4.17.21",p=200,c="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",l="Expected a function",o="Invalid `variable` option passed into `_.template`",u="__lodash_hash_undefined__",h=500,r="__lodash_placeholder__",g=1,d=2,f=4,b=1,y=2,T=1,_=2,P=4,x=8,E=16,A=32,I=64,R=128,C=256,D=512,M=30,B="...",k=800,G=16,H=1,$=2,j=3,K=1/0,W=9007199254740991,te=17976931348623157e292,ae=0/0,me=4294967295,Q=me-1,ve=me>>>1,Ee=[["ary",R],["bind",T],["bindKey",_],["curry",x],["curryRight",E],["flip",D],["partial",A],["partialRight",I],["rearg",C]],We="[object Arguments]",gt="[object Array]",Nt="[object AsyncFunction]",Dt="[object Boolean]",Ct="[object Date]",$t="[object DOMException]",qe="[object Error]",Ft="[object Function]",Je="[object GeneratorFunction]",et="[object Map]",Wt="[object Number]",Fn="[object Null]",Et="[object Object]",Kt="[object Promise]",yn="[object Proxy]",Ot="[object RegExp]",lt="[object Set]",ft="[object String]",In="[object Symbol]",ni="[object Undefined]",en="[object WeakMap]",yi="[object WeakSet]",tt="[object ArrayBuffer]",tn="[object DataView]",Ht="[object Float32Array]",fe="[object Float64Array]",Z="[object Int8Array]",de="[object Int16Array]",_e="[object Int32Array]",ne="[object Uint8Array]",ge="[object Uint8ClampedArray]",ce="[object Uint16Array]",Te="[object Uint32Array]",Ce=/\b__p \+= '';/g,ke=/\b(__p \+=) '' \+/g,Re=/(__e\(.*?\)|\b__t\)) \+\n'';/g,xe=/&(?:amp|lt|gt|quot|#39);/g,Fe=/[&<>"']/g,$e=RegExp(xe.source),rt=RegExp(Fe.source),_t=/<%-([\s\S]+?)%>/g,Ve=/<%([\s\S]+?)%>/g,vt=/<%=([\s\S]+?)%>/g,O=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,U=/^\w*$/,V=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,ie=/[\\^$.*+?()[\]{}|]/g,Y=RegExp(ie.source),re=/^\s+/,se=/\s/,be=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,Pe=/\{\n\/\* \[wrapped with (.+)\] \*/,Me=/,? & /,Le=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,He=/[()=,{}\[\]\/\s]/,Ye=/\\(\\)?/g,at=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,Oe=/\w*$/,Pt=/^[-+]0x[0-9a-f]+$/i,It=/^0b[01]+$/i,ye=/^\[object .+?Constructor\]$/,pe=/^0o[0-7]+$/i,Se=/^(?:0|[1-9]\d*)$/,we=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,Ne=/($^)/,ot=/['\n\r\u2028\u2029\\]/g,Be="\\ud800-\\udfff",Gt="\\u0300-\\u036f",En="\\ufe20-\\ufe2f",Pn="\\u20d0-\\u20ff",xn=Gt+En+Pn,mt="\\u2700-\\u27bf",ht="a-z\\xdf-\\xf6\\xf8-\\xff",Sr="\\xac\\xb1\\xd7\\xf7",Mo="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",Lo="\\u2000-\\u206f",ii=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",Oo="A-Z\\xc0-\\xd6\\xd8-\\xde",Ho="\\ufe0e\\ufe0f",ko=Sr+Mo+Lo+ii,Er="['\u2019]",op="["+Be+"]",Fo="["+ko+"]",Li="["+xn+"]",Bo="\\d+",sp="["+mt+"]",jo="["+ht+"]",Go="[^"+Be+ko+Bo+mt+ht+Oo+"]",Pr="\\ud83c[\\udffb-\\udfff]",ap="(?:"+Li+"|"+Pr+")",Uo="[^"+Be+"]",wr="(?:\\ud83c[\\udde6-\\uddff]){2}",Ar="[\\ud800-\\udbff][\\udc00-\\udfff]",ri="["+Oo+"]",qo="\\u200d",$o="(?:"+jo+"|"+Go+")",pp="(?:"+ri+"|"+Go+")",Wo="(?:"+Er+"(?:d|ll|m|re|s|t|ve))?",Ko="(?:"+Er+"(?:D|LL|M|RE|S|T|VE))?",Vo=ap+"?",zo="["+Ho+"]?",lp="(?:"+qo+"(?:"+[Uo,wr,Ar].join("|")+")"+zo+Vo+")*",up="\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])",cp="\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])",Yo=zo+Vo+lp,dp="(?:"+[sp,wr,Ar].join("|")+")"+Yo,fp="(?:"+[Uo+Li+"?",Li,wr,Ar,op].join("|")+")",mp=RegExp(Er,"g"),hp=RegExp(Li,"g"),_r=RegExp(Pr+"(?="+Pr+")|"+fp+Yo,"g"),gp=RegExp([ri+"?"+jo+"+"+Wo+"(?="+[Fo,ri,"$"].join("|")+")",pp+"+"+Ko+"(?="+[Fo,ri+$o,"$"].join("|")+")",ri+"?"+$o+"+"+Wo,ri+"+"+Ko,cp,up,Bo,dp].join("|"),"g"),yp=RegExp("["+qo+Be+xn+Ho+"]"),vp=/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,bp=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"],Tp=-1,Tt={};Tt[Ht]=Tt[fe]=Tt[Z]=Tt[de]=Tt[_e]=Tt[ne]=Tt[ge]=Tt[ce]=Tt[Te]=!0,Tt[We]=Tt[gt]=Tt[tt]=Tt[Dt]=Tt[tn]=Tt[Ct]=Tt[qe]=Tt[Ft]=Tt[et]=Tt[Wt]=Tt[Et]=Tt[Ot]=Tt[lt]=Tt[ft]=Tt[en]=!1;var bt={};bt[We]=bt[gt]=bt[tt]=bt[tn]=bt[Dt]=bt[Ct]=bt[Ht]=bt[fe]=bt[Z]=bt[de]=bt[_e]=bt[et]=bt[Wt]=bt[Et]=bt[Ot]=bt[lt]=bt[ft]=bt[In]=bt[ne]=bt[ge]=bt[ce]=bt[Te]=!0,bt[qe]=bt[Ft]=bt[en]=!1;var Sp={\u00C0:"A",\u00C1:"A",\u00C2:"A",\u00C3:"A",\u00C4:"A",\u00C5:"A",\u00E0:"a",\u00E1:"a",\u00E2:"a",\u00E3:"a",\u00E4:"a",\u00E5:"a",\u00C7:"C",\u00E7:"c",\u00D0:"D",\u00F0:"d",\u00C8:"E",\u00C9:"E",\u00CA:"E",\u00CB:"E",\u00E8:"e",\u00E9:"e",\u00EA:"e",\u00EB:"e",\u00CC:"I",\u00CD:"I",\u00CE:"I",\u00CF:"I",\u00EC:"i",\u00ED:"i",\u00EE:"i",\u00EF:"i",\u00D1:"N",\u00F1:"n",\u00D2:"O",\u00D3:"O",\u00D4:"O",\u00D5:"O",\u00D6:"O",\u00D8:"O",\u00F2:"o",\u00F3:"o",\u00F4:"o",\u00F5:"o",\u00F6:"o",\u00F8:"o",\u00D9:"U",\u00DA:"U",\u00DB:"U",\u00DC:"U",\u00F9:"u",\u00FA:"u",\u00FB:"u",\u00FC:"u",\u00DD:"Y",\u00FD:"y",\u00FF:"y",\u00C6:"Ae",\u00E6:"ae",\u00DE:"Th",\u00FE:"th",\u00DF:"ss",\u0100:"A",\u0102:"A",\u0104:"A",\u0101:"a",\u0103:"a",\u0105:"a",\u0106:"C",\u0108:"C",\u010A:"C",\u010C:"C",\u0107:"c",\u0109:"c",\u010B:"c",\u010D:"c",\u010E:"D",\u0110:"D",\u010F:"d",\u0111:"d",\u0112:"E",\u0114:"E",\u0116:"E",\u0118:"E",\u011A:"E",\u0113:"e",\u0115:"e",\u0117:"e",\u0119:"e",\u011B:"e",\u011C:"G",\u011E:"G",\u0120:"G",\u0122:"G",\u011D:"g",\u011F:"g",\u0121:"g",\u0123:"g",\u0124:"H",\u0126:"H",\u0125:"h",\u0127:"h",\u0128:"I",\u012A:"I",\u012C:"I",\u012E:"I",\u0130:"I",\u0129:"i",\u012B:"i",\u012D:"i",\u012F:"i",\u0131:"i",\u0134:"J",\u0135:"j",\u0136:"K",\u0137:"k",\u0138:"k",\u0139:"L",\u013B:"L",\u013D:"L",\u013F:"L",\u0141:"L",\u013A:"l",\u013C:"l",\u013E:"l",\u0140:"l",\u0142:"l",\u0143:"N",\u0145:"N",\u0147:"N",\u014A:"N",\u0144:"n",\u0146:"n",\u0148:"n",\u014B:"n",\u014C:"O",\u014E:"O",\u0150:"O",\u014D:"o",\u014F:"o",\u0151:"o",\u0154:"R",\u0156:"R",\u0158:"R",\u0155:"r",\u0157:"r",\u0159:"r",\u015A:"S",\u015C:"S",\u015E:"S",\u0160:"S",\u015B:"s",\u015D:"s",\u015F:"s",\u0161:"s",\u0162:"T",\u0164:"T",\u0166:"T",\u0163:"t",\u0165:"t",\u0167:"t",\u0168:"U",\u016A:"U",\u016C:"U",\u016E:"U",\u0170:"U",\u0172:"U",\u0169:"u",\u016B:"u",\u016D:"u",\u016F:"u",\u0171:"u",\u0173:"u",\u0174:"W",\u0175:"w",\u0176:"Y",\u0177:"y",\u0178:"Y",\u0179:"Z",\u017B:"Z",\u017D:"Z",\u017A:"z",\u017C:"z",\u017E:"z",\u0132:"IJ",\u0133:"ij",\u0152:"Oe",\u0153:"oe",\u0149:"'n",\u017F:"s"},Ep={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Pp={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"},wp={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Ap=parseFloat,_p=parseInt,Jo=typeof s.g=="object"&&s.g&&s.g.Object===Object&&s.g,Ip=typeof self=="object"&&self&&self.Object===Object&&self,Bt=Jo||Ip||Function("return this")(),Xo=v&&!v.nodeType&&v,vi=Xo&&!0&&w&&!w.nodeType&&w,Zo=vi&&vi.exports===Xo,Ir=Zo&&Jo.process,ln=function(){try{var J=vi&&vi.require&&vi.require("util").types;return J||Ir&&Ir.binding&&Ir.binding("util")}catch(oe){}}(),Qo=ln&&ln.isArrayBuffer,es=ln&&ln.isDate,ts=ln&&ln.isMap,ns=ln&&ln.isRegExp,is=ln&&ln.isSet,rs=ln&&ln.isTypedArray;function nn(J,oe,ee){switch(ee.length){case 0:return J.call(oe);case 1:return J.call(oe,ee[0]);case 2:return J.call(oe,ee[0],ee[1]);case 3:return J.call(oe,ee[0],ee[1],ee[2])}return J.apply(oe,ee)}function xp(J,oe,ee,Ie){for(var Ke=-1,pt=J==null?0:J.length;++Ke<pt;){var Mt=J[Ke];oe(Ie,Mt,ee(Mt),J)}return Ie}function un(J,oe){for(var ee=-1,Ie=J==null?0:J.length;++ee<Ie&&oe(J[ee],ee,J)!==!1;);return J}function Rp(J,oe){for(var ee=J==null?0:J.length;ee--&&oe(J[ee],ee,J)!==!1;);return J}function os(J,oe){for(var ee=-1,Ie=J==null?0:J.length;++ee<Ie;)if(!oe(J[ee],ee,J))return!1;return!0}function Bn(J,oe){for(var ee=-1,Ie=J==null?0:J.length,Ke=0,pt=[];++ee<Ie;){var Mt=J[ee];oe(Mt,ee,J)&&(pt[Ke++]=Mt)}return pt}function Oi(J,oe){var ee=J==null?0:J.length;return!!ee&&oi(J,oe,0)>-1}function xr(J,oe,ee){for(var Ie=-1,Ke=J==null?0:J.length;++Ie<Ke;)if(ee(oe,J[Ie]))return!0;return!1}function St(J,oe){for(var ee=-1,Ie=J==null?0:J.length,Ke=Array(Ie);++ee<Ie;)Ke[ee]=oe(J[ee],ee,J);return Ke}function jn(J,oe){for(var ee=-1,Ie=oe.length,Ke=J.length;++ee<Ie;)J[Ke+ee]=oe[ee];return J}function Rr(J,oe,ee,Ie){var Ke=-1,pt=J==null?0:J.length;for(Ie&&pt&&(ee=J[++Ke]);++Ke<pt;)ee=oe(ee,J[Ke],Ke,J);return ee}function Dp(J,oe,ee,Ie){var Ke=J==null?0:J.length;for(Ie&&Ke&&(ee=J[--Ke]);Ke--;)ee=oe(ee,J[Ke],Ke,J);return ee}function Dr(J,oe){for(var ee=-1,Ie=J==null?0:J.length;++ee<Ie;)if(oe(J[ee],ee,J))return!0;return!1}var Np=Nr("length");function Cp(J){return J.split("")}function Mp(J){return J.match(Le)||[]}function ss(J,oe,ee){var Ie;return ee(J,function(Ke,pt,Mt){if(oe(Ke,pt,Mt))return Ie=pt,!1}),Ie}function Hi(J,oe,ee,Ie){for(var Ke=J.length,pt=ee+(Ie?1:-1);Ie?pt--:++pt<Ke;)if(oe(J[pt],pt,J))return pt;return-1}function oi(J,oe,ee){return oe===oe?Wp(J,oe,ee):Hi(J,as,ee)}function Lp(J,oe,ee,Ie){for(var Ke=ee-1,pt=J.length;++Ke<pt;)if(Ie(J[Ke],oe))return Ke;return-1}function as(J){return J!==J}function ps(J,oe){var ee=J==null?0:J.length;return ee?Mr(J,oe)/ee:ae}function Nr(J){return function(oe){return oe==null?i:oe[J]}}function Cr(J){return function(oe){return J==null?i:J[oe]}}function ls(J,oe,ee,Ie,Ke){return Ke(J,function(pt,Mt,yt){ee=Ie?(Ie=!1,pt):oe(ee,pt,Mt,yt)}),ee}function Op(J,oe){var ee=J.length;for(J.sort(oe);ee--;)J[ee]=J[ee].value;return J}function Mr(J,oe){for(var ee,Ie=-1,Ke=J.length;++Ie<Ke;){var pt=oe(J[Ie]);pt!==i&&(ee=ee===i?pt:ee+pt)}return ee}function Lr(J,oe){for(var ee=-1,Ie=Array(J);++ee<J;)Ie[ee]=oe(ee);return Ie}function Hp(J,oe){return St(oe,function(ee){return[ee,J[ee]]})}function us(J){return J&&J.slice(0,ms(J)+1).replace(re,"")}function rn(J){return function(oe){return J(oe)}}function Or(J,oe){return St(oe,function(ee){return J[ee]})}function bi(J,oe){return J.has(oe)}function cs(J,oe){for(var ee=-1,Ie=J.length;++ee<Ie&&oi(oe,J[ee],0)>-1;);return ee}function ds(J,oe){for(var ee=J.length;ee--&&oi(oe,J[ee],0)>-1;);return ee}function kp(J,oe){for(var ee=J.length,Ie=0;ee--;)J[ee]===oe&&++Ie;return Ie}var Fp=Cr(Sp),Bp=Cr(Ep);function jp(J){return"\\"+wp[J]}function Gp(J,oe){return J==null?i:J[oe]}function si(J){return yp.test(J)}function Up(J){return vp.test(J)}function qp(J){for(var oe,ee=[];!(oe=J.next()).done;)ee.push(oe.value);return ee}function Hr(J){var oe=-1,ee=Array(J.size);return J.forEach(function(Ie,Ke){ee[++oe]=[Ke,Ie]}),ee}function fs(J,oe){return function(ee){return J(oe(ee))}}function Gn(J,oe){for(var ee=-1,Ie=J.length,Ke=0,pt=[];++ee<Ie;){var Mt=J[ee];(Mt===oe||Mt===r)&&(J[ee]=r,pt[Ke++]=ee)}return pt}function ki(J){var oe=-1,ee=Array(J.size);return J.forEach(function(Ie){ee[++oe]=Ie}),ee}function $p(J){var oe=-1,ee=Array(J.size);return J.forEach(function(Ie){ee[++oe]=[Ie,Ie]}),ee}function Wp(J,oe,ee){for(var Ie=ee-1,Ke=J.length;++Ie<Ke;)if(J[Ie]===oe)return Ie;return-1}function Kp(J,oe,ee){for(var Ie=ee+1;Ie--;)if(J[Ie]===oe)return Ie;return Ie}function ai(J){return si(J)?zp(J):Np(J)}function vn(J){return si(J)?Yp(J):Cp(J)}function ms(J){for(var oe=J.length;oe--&&se.test(J.charAt(oe)););return oe}var Vp=Cr(Pp);function zp(J){for(var oe=_r.lastIndex=0;_r.test(J);)++oe;return oe}function Yp(J){return J.match(_r)||[]}function Jp(J){return J.match(gp)||[]}var Xp=function J(oe){oe=oe==null?Bt:Fi.defaults(Bt.Object(),oe,Fi.pick(Bt,bp));var ee=oe.Array,Ie=oe.Date,Ke=oe.Error,pt=oe.Function,Mt=oe.Math,yt=oe.Object,kr=oe.RegExp,Zp=oe.String,cn=oe.TypeError,Bi=ee.prototype,Qp=pt.prototype,pi=yt.prototype,ji=oe["__core-js_shared__"],Gi=Qp.toString,dt=pi.hasOwnProperty,el=0,hs=function(){var e=/[^.]+$/.exec(ji&&ji.keys&&ji.keys.IE_PROTO||"");return e?"Symbol(src)_1."+e:""}(),Ui=pi.toString,tl=Gi.call(yt),nl=Bt._,il=kr("^"+Gi.call(dt).replace(ie,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),qi=Zo?oe.Buffer:i,Un=oe.Symbol,$i=oe.Uint8Array,gs=qi?qi.allocUnsafe:i,Wi=fs(yt.getPrototypeOf,yt),ys=yt.create,vs=pi.propertyIsEnumerable,Ki=Bi.splice,bs=Un?Un.isConcatSpreadable:i,Ti=Un?Un.iterator:i,zn=Un?Un.toStringTag:i,Vi=function(){try{var e=Qn(yt,"defineProperty");return e({},"",{}),e}catch(t){}}(),rl=oe.clearTimeout!==Bt.clearTimeout&&oe.clearTimeout,ol=Ie&&Ie.now!==Bt.Date.now&&Ie.now,sl=oe.setTimeout!==Bt.setTimeout&&oe.setTimeout,zi=Mt.ceil,Yi=Mt.floor,Fr=yt.getOwnPropertySymbols,al=qi?qi.isBuffer:i,Ts=oe.isFinite,pl=Bi.join,ll=fs(yt.keys,yt),Lt=Mt.max,Ut=Mt.min,ul=Ie.now,cl=oe.parseInt,Ss=Mt.random,dl=Bi.reverse,Br=Qn(oe,"DataView"),Si=Qn(oe,"Map"),jr=Qn(oe,"Promise"),li=Qn(oe,"Set"),Ei=Qn(oe,"WeakMap"),Pi=Qn(yt,"create"),Ji=Ei&&new Ei,ui={},fl=ei(Br),ml=ei(Si),hl=ei(jr),gl=ei(li),yl=ei(Ei),Xi=Un?Un.prototype:i,wi=Xi?Xi.valueOf:i,Es=Xi?Xi.toString:i;function L(e){if(At(e)&&!ze(e)&&!(e instanceof it)){if(e instanceof dn)return e;if(dt.call(e,"__wrapped__"))return Pa(e)}return new dn(e)}var ci=function(){function e(){}return function(t){if(!wt(t))return{};if(ys)return ys(t);e.prototype=t;var a=new e;return e.prototype=i,a}}();function Zi(){}function dn(e,t){this.__wrapped__=e,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=i}L.templateSettings={escape:_t,evaluate:Ve,interpolate:vt,variable:"",imports:{_:L}},L.prototype=Zi.prototype,L.prototype.constructor=L,dn.prototype=ci(Zi.prototype),dn.prototype.constructor=dn;function it(e){this.__wrapped__=e,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=me,this.__views__=[]}function vl(){var e=new it(this.__wrapped__);return e.__actions__=Jt(this.__actions__),e.__dir__=this.__dir__,e.__filtered__=this.__filtered__,e.__iteratees__=Jt(this.__iteratees__),e.__takeCount__=this.__takeCount__,e.__views__=Jt(this.__views__),e}function bl(){if(this.__filtered__){var e=new it(this);e.__dir__=-1,e.__filtered__=!0}else e=this.clone(),e.__dir__*=-1;return e}function Tl(){var e=this.__wrapped__.value(),t=this.__dir__,a=ze(e),S=t<0,N=a?e.length:0,F=Cu(0,N,this.__views__),q=F.start,z=F.end,X=z-q,le=S?z:q-1,ue=this.__iteratees__,he=ue.length,Ae=0,De=Ut(X,this.__takeCount__);if(!a||!S&&N==X&&De==X)return Ks(e,this.__actions__);var Ge=[];e:for(;X--&&Ae<De;){le+=t;for(var Ze=-1,Ue=e[le];++Ze<he;){var nt=ue[Ze],st=nt.iteratee,an=nt.type,Yt=st(Ue);if(an==$)Ue=Yt;else if(!Yt){if(an==H)continue e;break e}}Ge[Ae++]=Ue}return Ge}it.prototype=ci(Zi.prototype),it.prototype.constructor=it;function Yn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Sl(){this.__data__=Pi?Pi(null):{},this.size=0}function El(e){var t=this.has(e)&&delete this.__data__[e];return this.size-=t?1:0,t}function Pl(e){var t=this.__data__;if(Pi){var a=t[e];return a===u?i:a}return dt.call(t,e)?t[e]:i}function wl(e){var t=this.__data__;return Pi?t[e]!==i:dt.call(t,e)}function Al(e,t){var a=this.__data__;return this.size+=this.has(e)?0:1,a[e]=Pi&&t===i?u:t,this}Yn.prototype.clear=Sl,Yn.prototype.delete=El,Yn.prototype.get=Pl,Yn.prototype.has=wl,Yn.prototype.set=Al;function Rn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function _l(){this.__data__=[],this.size=0}function Il(e){var t=this.__data__,a=Qi(t,e);if(a<0)return!1;var S=t.length-1;return a==S?t.pop():Ki.call(t,a,1),--this.size,!0}function xl(e){var t=this.__data__,a=Qi(t,e);return a<0?i:t[a][1]}function Rl(e){return Qi(this.__data__,e)>-1}function Dl(e,t){var a=this.__data__,S=Qi(a,e);return S<0?(++this.size,a.push([e,t])):a[S][1]=t,this}Rn.prototype.clear=_l,Rn.prototype.delete=Il,Rn.prototype.get=xl,Rn.prototype.has=Rl,Rn.prototype.set=Dl;function Dn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Nl(){this.size=0,this.__data__={hash:new Yn,map:new(Si||Rn),string:new Yn}}function Cl(e){var t=cr(this,e).delete(e);return this.size-=t?1:0,t}function Ml(e){return cr(this,e).get(e)}function Ll(e){return cr(this,e).has(e)}function Ol(e,t){var a=cr(this,e),S=a.size;return a.set(e,t),this.size+=a.size==S?0:1,this}Dn.prototype.clear=Nl,Dn.prototype.delete=Cl,Dn.prototype.get=Ml,Dn.prototype.has=Ll,Dn.prototype.set=Ol;function Jn(e){var t=-1,a=e==null?0:e.length;for(this.__data__=new Dn;++t<a;)this.add(e[t])}function Hl(e){return this.__data__.set(e,u),this}function kl(e){return this.__data__.has(e)}Jn.prototype.add=Jn.prototype.push=Hl,Jn.prototype.has=kl;function bn(e){var t=this.__data__=new Rn(e);this.size=t.size}function Fl(){this.__data__=new Rn,this.size=0}function Bl(e){var t=this.__data__,a=t.delete(e);return this.size=t.size,a}function jl(e){return this.__data__.get(e)}function Gl(e){return this.__data__.has(e)}function Ul(e,t){var a=this.__data__;if(a instanceof Rn){var S=a.__data__;if(!Si||S.length<p-1)return S.push([e,t]),this.size=++a.size,this;a=this.__data__=new Dn(S)}return a.set(e,t),this.size=a.size,this}bn.prototype.clear=Fl,bn.prototype.delete=Bl,bn.prototype.get=jl,bn.prototype.has=Gl,bn.prototype.set=Ul;function Ps(e,t){var a=ze(e),S=!a&&ti(e),N=!a&&!S&&Vn(e),F=!a&&!S&&!N&&hi(e),q=a||S||N||F,z=q?Lr(e.length,Zp):[],X=z.length;for(var le in e)(t||dt.call(e,le))&&!(q&&(le=="length"||N&&(le=="offset"||le=="parent")||F&&(le=="buffer"||le=="byteLength"||le=="byteOffset")||Ln(le,X)))&&z.push(le);return z}function ws(e){var t=e.length;return t?e[Xr(0,t-1)]:i}function ql(e,t){return dr(Jt(e),Xn(t,0,e.length))}function $l(e){return dr(Jt(e))}function Gr(e,t,a){(a!==i&&!Tn(e[t],a)||a===i&&!(t in e))&&Nn(e,t,a)}function Ai(e,t,a){var S=e[t];(!(dt.call(e,t)&&Tn(S,a))||a===i&&!(t in e))&&Nn(e,t,a)}function Qi(e,t){for(var a=e.length;a--;)if(Tn(e[a][0],t))return a;return-1}function Wl(e,t,a,S){return qn(e,function(N,F,q){t(S,N,a(N),q)}),S}function As(e,t){return e&&An(t,kt(t),e)}function Kl(e,t){return e&&An(t,Zt(t),e)}function Nn(e,t,a){t=="__proto__"&&Vi?Vi(e,t,{configurable:!0,enumerable:!0,value:a,writable:!0}):e[t]=a}function Ur(e,t){for(var a=-1,S=t.length,N=ee(S),F=e==null;++a<S;)N[a]=F?i:Po(e,t[a]);return N}function Xn(e,t,a){return e===e&&(a!==i&&(e=e<=a?e:a),t!==i&&(e=e>=t?e:t)),e}function fn(e,t,a,S,N,F){var q,z=t&g,X=t&d,le=t&f;if(a&&(q=N?a(e,S,N,F):a(e)),q!==i)return q;if(!wt(e))return e;var ue=ze(e);if(ue){if(q=Lu(e),!z)return Jt(e,q)}else{var he=qt(e),Ae=he==Ft||he==Je;if(Vn(e))return Ys(e,z);if(he==Et||he==We||Ae&&!N){if(q=X||Ae?{}:ma(e),!z)return X?Pu(e,Kl(q,e)):Eu(e,As(q,e))}else{if(!bt[he])return N?e:{};q=Ou(e,he,z)}}F||(F=new bn);var De=F.get(e);if(De)return De;F.set(e,q),qa(e)?e.forEach(function(Ue){q.add(fn(Ue,t,a,Ue,e,F))}):Ga(e)&&e.forEach(function(Ue,nt){q.set(nt,fn(Ue,t,a,nt,e,F))});var Ge=le?X?po:ao:X?Zt:kt,Ze=ue?i:Ge(e);return un(Ze||e,function(Ue,nt){Ze&&(nt=Ue,Ue=e[nt]),Ai(q,nt,fn(Ue,t,a,nt,e,F))}),q}function Vl(e){var t=kt(e);return function(a){return _s(a,e,t)}}function _s(e,t,a){var S=a.length;if(e==null)return!S;for(e=yt(e);S--;){var N=a[S],F=t[N],q=e[N];if(q===i&&!(N in e)||!F(q))return!1}return!0}function Is(e,t,a){if(typeof e!="function")throw new cn(l);return Ci(function(){e.apply(i,a)},t)}function _i(e,t,a,S){var N=-1,F=Oi,q=!0,z=e.length,X=[],le=t.length;if(!z)return X;a&&(t=St(t,rn(a))),S?(F=xr,q=!1):t.length>=p&&(F=bi,q=!1,t=new Jn(t));e:for(;++N<z;){var ue=e[N],he=a==null?ue:a(ue);if(ue=S||ue!==0?ue:0,q&&he===he){for(var Ae=le;Ae--;)if(t[Ae]===he)continue e;X.push(ue)}else F(t,he,S)||X.push(ue)}return X}var qn=ea(wn),xs=ea($r,!0);function zl(e,t){var a=!0;return qn(e,function(S,N,F){return a=!!t(S,N,F),a}),a}function er(e,t,a){for(var S=-1,N=e.length;++S<N;){var F=e[S],q=t(F);if(q!=null&&(z===i?q===q&&!sn(q):a(q,z)))var z=q,X=F}return X}function Yl(e,t,a,S){var N=e.length;for(a=Xe(a),a<0&&(a=-a>N?0:N+a),S=S===i||S>N?N:Xe(S),S<0&&(S+=N),S=a>S?0:Wa(S);a<S;)e[a++]=t;return e}function Rs(e,t){var a=[];return qn(e,function(S,N,F){t(S,N,F)&&a.push(S)}),a}function jt(e,t,a,S,N){var F=-1,q=e.length;for(a||(a=ku),N||(N=[]);++F<q;){var z=e[F];t>0&&a(z)?t>1?jt(z,t-1,a,S,N):jn(N,z):S||(N[N.length]=z)}return N}var qr=ta(),Ds=ta(!0);function wn(e,t){return e&&qr(e,t,kt)}function $r(e,t){return e&&Ds(e,t,kt)}function tr(e,t){return Bn(t,function(a){return On(e[a])})}function Zn(e,t){t=Wn(t,e);for(var a=0,S=t.length;e!=null&&a<S;)e=e[_n(t[a++])];return a&&a==S?e:i}function Ns(e,t,a){var S=t(e);return ze(e)?S:jn(S,a(e))}function Vt(e){return e==null?e===i?ni:Fn:zn&&zn in yt(e)?Nu(e):$u(e)}function Wr(e,t){return e>t}function Jl(e,t){return e!=null&&dt.call(e,t)}function Xl(e,t){return e!=null&&t in yt(e)}function Zl(e,t,a){return e>=Ut(t,a)&&e<Lt(t,a)}function Kr(e,t,a){for(var S=a?xr:Oi,N=e[0].length,F=e.length,q=F,z=ee(F),X=1/0,le=[];q--;){var ue=e[q];q&&t&&(ue=St(ue,rn(t))),X=Ut(ue.length,X),z[q]=!a&&(t||N>=120&&ue.length>=120)?new Jn(q&&ue):i}ue=e[0];var he=-1,Ae=z[0];e:for(;++he<N&&le.length<X;){var De=ue[he],Ge=t?t(De):De;if(De=a||De!==0?De:0,!(Ae?bi(Ae,Ge):S(le,Ge,a))){for(q=F;--q;){var Ze=z[q];if(!(Ze?bi(Ze,Ge):S(e[q],Ge,a)))continue e}Ae&&Ae.push(Ge),le.push(De)}}return le}function Ql(e,t,a,S){return wn(e,function(N,F,q){t(S,a(N),F,q)}),S}function Ii(e,t,a){t=Wn(t,e),e=va(e,t);var S=e==null?e:e[_n(hn(t))];return S==null?i:nn(S,e,a)}function Cs(e){return At(e)&&Vt(e)==We}function eu(e){return At(e)&&Vt(e)==tt}function tu(e){return At(e)&&Vt(e)==Ct}function xi(e,t,a,S,N){return e===t?!0:e==null||t==null||!At(e)&&!At(t)?e!==e&&t!==t:nu(e,t,a,S,xi,N)}function nu(e,t,a,S,N,F){var q=ze(e),z=ze(t),X=q?gt:qt(e),le=z?gt:qt(t);X=X==We?Et:X,le=le==We?Et:le;var ue=X==Et,he=le==Et,Ae=X==le;if(Ae&&Vn(e)){if(!Vn(t))return!1;q=!0,ue=!1}if(Ae&&!ue)return F||(F=new bn),q||hi(e)?ca(e,t,a,S,N,F):Ru(e,t,X,a,S,N,F);if(!(a&b)){var De=ue&&dt.call(e,"__wrapped__"),Ge=he&&dt.call(t,"__wrapped__");if(De||Ge){var Ze=De?e.value():e,Ue=Ge?t.value():t;return F||(F=new bn),N(Ze,Ue,a,S,F)}}return Ae?(F||(F=new bn),Du(e,t,a,S,N,F)):!1}function iu(e){return At(e)&&qt(e)==et}function Vr(e,t,a,S){var N=a.length,F=N,q=!S;if(e==null)return!F;for(e=yt(e);N--;){var z=a[N];if(q&&z[2]?z[1]!==e[z[0]]:!(z[0]in e))return!1}for(;++N<F;){z=a[N];var X=z[0],le=e[X],ue=z[1];if(q&&z[2]){if(le===i&&!(X in e))return!1}else{var he=new bn;if(S)var Ae=S(le,ue,X,e,t,he);if(!(Ae===i?xi(ue,le,b|y,S,he):Ae))return!1}}return!0}function Ms(e){if(!wt(e)||Bu(e))return!1;var t=On(e)?il:ye;return t.test(ei(e))}function ru(e){return At(e)&&Vt(e)==Ot}function ou(e){return At(e)&&qt(e)==lt}function su(e){return At(e)&&vr(e.length)&&!!Tt[Vt(e)]}function Ls(e){return typeof e=="function"?e:e==null?Qt:typeof e=="object"?ze(e)?ks(e[0],e[1]):Hs(e):np(e)}function zr(e){if(!Ni(e))return ll(e);var t=[];for(var a in yt(e))dt.call(e,a)&&a!="constructor"&&t.push(a);return t}function au(e){if(!wt(e))return qu(e);var t=Ni(e),a=[];for(var S in e)S=="constructor"&&(t||!dt.call(e,S))||a.push(S);return a}function Yr(e,t){return e<t}function Os(e,t){var a=-1,S=Xt(e)?ee(e.length):[];return qn(e,function(N,F,q){S[++a]=t(N,F,q)}),S}function Hs(e){var t=uo(e);return t.length==1&&t[0][2]?ga(t[0][0],t[0][1]):function(a){return a===e||Vr(a,e,t)}}function ks(e,t){return fo(e)&&ha(t)?ga(_n(e),t):function(a){var S=Po(a,e);return S===i&&S===t?wo(a,e):xi(t,S,b|y)}}function nr(e,t,a,S,N){e!==t&&qr(t,function(F,q){if(N||(N=new bn),wt(F))pu(e,t,q,a,nr,S,N);else{var z=S?S(ho(e,q),F,q+"",e,t,N):i;z===i&&(z=F),Gr(e,q,z)}},Zt)}function pu(e,t,a,S,N,F,q){var z=ho(e,a),X=ho(t,a),le=q.get(X);if(le){Gr(e,a,le);return}var ue=F?F(z,X,a+"",e,t,q):i,he=ue===i;if(he){var Ae=ze(X),De=!Ae&&Vn(X),Ge=!Ae&&!De&&hi(X);ue=X,Ae||De||Ge?ze(z)?ue=z:xt(z)?ue=Jt(z):De?(he=!1,ue=Ys(X,!0)):Ge?(he=!1,ue=Js(X,!0)):ue=[]:Mi(X)||ti(X)?(ue=z,ti(z)?ue=Ka(z):(!wt(z)||On(z))&&(ue=ma(X))):he=!1}he&&(q.set(X,ue),N(ue,X,S,F,q),q.delete(X)),Gr(e,a,ue)}function Fs(e,t){var a=e.length;if(!!a)return t+=t<0?a:0,Ln(t,a)?e[t]:i}function Bs(e,t,a){t.length?t=St(t,function(F){return ze(F)?function(q){return Zn(q,F.length===1?F[0]:F)}:F}):t=[Qt];var S=-1;t=St(t,rn(je()));var N=Os(e,function(F,q,z){var X=St(t,function(le){return le(F)});return{criteria:X,index:++S,value:F}});return Op(N,function(F,q){return Su(F,q,a)})}function lu(e,t){return js(e,t,function(a,S){return wo(e,S)})}function js(e,t,a){for(var S=-1,N=t.length,F={};++S<N;){var q=t[S],z=Zn(e,q);a(z,q)&&Ri(F,Wn(q,e),z)}return F}function uu(e){return function(t){return Zn(t,e)}}function Jr(e,t,a,S){var N=S?Lp:oi,F=-1,q=t.length,z=e;for(e===t&&(t=Jt(t)),a&&(z=St(e,rn(a)));++F<q;)for(var X=0,le=t[F],ue=a?a(le):le;(X=N(z,ue,X,S))>-1;)z!==e&&Ki.call(z,X,1),Ki.call(e,X,1);return e}function Gs(e,t){for(var a=e?t.length:0,S=a-1;a--;){var N=t[a];if(a==S||N!==F){var F=N;Ln(N)?Ki.call(e,N,1):eo(e,N)}}return e}function Xr(e,t){return e+Yi(Ss()*(t-e+1))}function cu(e,t,a,S){for(var N=-1,F=Lt(zi((t-e)/(a||1)),0),q=ee(F);F--;)q[S?F:++N]=e,e+=a;return q}function Zr(e,t){var a="";if(!e||t<1||t>W)return a;do t%2&&(a+=e),t=Yi(t/2),t&&(e+=e);while(t);return a}function Qe(e,t){return go(ya(e,t,Qt),e+"")}function du(e){return ws(gi(e))}function fu(e,t){var a=gi(e);return dr(a,Xn(t,0,a.length))}function Ri(e,t,a,S){if(!wt(e))return e;t=Wn(t,e);for(var N=-1,F=t.length,q=F-1,z=e;z!=null&&++N<F;){var X=_n(t[N]),le=a;if(X==="__proto__"||X==="constructor"||X==="prototype")return e;if(N!=q){var ue=z[X];le=S?S(ue,X,z):i,le===i&&(le=wt(ue)?ue:Ln(t[N+1])?[]:{})}Ai(z,X,le),z=z[X]}return e}var Us=Ji?function(e,t){return Ji.set(e,t),e}:Qt,mu=Vi?function(e,t){return Vi(e,"toString",{configurable:!0,enumerable:!1,value:_o(t),writable:!0})}:Qt;function hu(e){return dr(gi(e))}function mn(e,t,a){var S=-1,N=e.length;t<0&&(t=-t>N?0:N+t),a=a>N?N:a,a<0&&(a+=N),N=t>a?0:a-t>>>0,t>>>=0;for(var F=ee(N);++S<N;)F[S]=e[S+t];return F}function gu(e,t){var a;return qn(e,function(S,N,F){return a=t(S,N,F),!a}),!!a}function ir(e,t,a){var S=0,N=e==null?S:e.length;if(typeof t=="number"&&t===t&&N<=ve){for(;S<N;){var F=S+N>>>1,q=e[F];q!==null&&!sn(q)&&(a?q<=t:q<t)?S=F+1:N=F}return N}return Qr(e,t,Qt,a)}function Qr(e,t,a,S){var N=0,F=e==null?0:e.length;if(F===0)return 0;t=a(t);for(var q=t!==t,z=t===null,X=sn(t),le=t===i;N<F;){var ue=Yi((N+F)/2),he=a(e[ue]),Ae=he!==i,De=he===null,Ge=he===he,Ze=sn(he);if(q)var Ue=S||Ge;else le?Ue=Ge&&(S||Ae):z?Ue=Ge&&Ae&&(S||!De):X?Ue=Ge&&Ae&&!De&&(S||!Ze):De||Ze?Ue=!1:Ue=S?he<=t:he<t;Ue?N=ue+1:F=ue}return Ut(F,Q)}function qs(e,t){for(var a=-1,S=e.length,N=0,F=[];++a<S;){var q=e[a],z=t?t(q):q;if(!a||!Tn(z,X)){var X=z;F[N++]=q===0?0:q}}return F}function $s(e){return typeof e=="number"?e:sn(e)?ae:+e}function on(e){if(typeof e=="string")return e;if(ze(e))return St(e,on)+"";if(sn(e))return Es?Es.call(e):"";var t=e+"";return t=="0"&&1/e==-K?"-0":t}function $n(e,t,a){var S=-1,N=Oi,F=e.length,q=!0,z=[],X=z;if(a)q=!1,N=xr;else if(F>=p){var le=t?null:Iu(e);if(le)return ki(le);q=!1,N=bi,X=new Jn}else X=t?[]:z;e:for(;++S<F;){var ue=e[S],he=t?t(ue):ue;if(ue=a||ue!==0?ue:0,q&&he===he){for(var Ae=X.length;Ae--;)if(X[Ae]===he)continue e;t&&X.push(he),z.push(ue)}else N(X,he,a)||(X!==z&&X.push(he),z.push(ue))}return z}function eo(e,t){return t=Wn(t,e),e=va(e,t),e==null||delete e[_n(hn(t))]}function Ws(e,t,a,S){return Ri(e,t,a(Zn(e,t)),S)}function rr(e,t,a,S){for(var N=e.length,F=S?N:-1;(S?F--:++F<N)&&t(e[F],F,e););return a?mn(e,S?0:F,S?F+1:N):mn(e,S?F+1:0,S?N:F)}function Ks(e,t){var a=e;return a instanceof it&&(a=a.value()),Rr(t,function(S,N){return N.func.apply(N.thisArg,jn([S],N.args))},a)}function to(e,t,a){var S=e.length;if(S<2)return S?$n(e[0]):[];for(var N=-1,F=ee(S);++N<S;)for(var q=e[N],z=-1;++z<S;)z!=N&&(F[N]=_i(F[N]||q,e[z],t,a));return $n(jt(F,1),t,a)}function Vs(e,t,a){for(var S=-1,N=e.length,F=t.length,q={};++S<N;){var z=S<F?t[S]:i;a(q,e[S],z)}return q}function no(e){return xt(e)?e:[]}function io(e){return typeof e=="function"?e:Qt}function Wn(e,t){return ze(e)?e:fo(e,t)?[e]:Ea(ut(e))}var yu=Qe;function Kn(e,t,a){var S=e.length;return a=a===i?S:a,!t&&a>=S?e:mn(e,t,a)}var zs=rl||function(e){return Bt.clearTimeout(e)};function Ys(e,t){if(t)return e.slice();var a=e.length,S=gs?gs(a):new e.constructor(a);return e.copy(S),S}function ro(e){var t=new e.constructor(e.byteLength);return new $i(t).set(new $i(e)),t}function vu(e,t){var a=t?ro(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.byteLength)}function bu(e){var t=new e.constructor(e.source,Oe.exec(e));return t.lastIndex=e.lastIndex,t}function Tu(e){return wi?yt(wi.call(e)):{}}function Js(e,t){var a=t?ro(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.length)}function Xs(e,t){if(e!==t){var a=e!==i,S=e===null,N=e===e,F=sn(e),q=t!==i,z=t===null,X=t===t,le=sn(t);if(!z&&!le&&!F&&e>t||F&&q&&X&&!z&&!le||S&&q&&X||!a&&X||!N)return 1;if(!S&&!F&&!le&&e<t||le&&a&&N&&!S&&!F||z&&a&&N||!q&&N||!X)return-1}return 0}function Su(e,t,a){for(var S=-1,N=e.criteria,F=t.criteria,q=N.length,z=a.length;++S<q;){var X=Xs(N[S],F[S]);if(X){if(S>=z)return X;var le=a[S];return X*(le=="desc"?-1:1)}}return e.index-t.index}function Zs(e,t,a,S){for(var N=-1,F=e.length,q=a.length,z=-1,X=t.length,le=Lt(F-q,0),ue=ee(X+le),he=!S;++z<X;)ue[z]=t[z];for(;++N<q;)(he||N<F)&&(ue[a[N]]=e[N]);for(;le--;)ue[z++]=e[N++];return ue}function Qs(e,t,a,S){for(var N=-1,F=e.length,q=-1,z=a.length,X=-1,le=t.length,ue=Lt(F-z,0),he=ee(ue+le),Ae=!S;++N<ue;)he[N]=e[N];for(var De=N;++X<le;)he[De+X]=t[X];for(;++q<z;)(Ae||N<F)&&(he[De+a[q]]=e[N++]);return he}function Jt(e,t){var a=-1,S=e.length;for(t||(t=ee(S));++a<S;)t[a]=e[a];return t}function An(e,t,a,S){var N=!a;a||(a={});for(var F=-1,q=t.length;++F<q;){var z=t[F],X=S?S(a[z],e[z],z,a,e):i;X===i&&(X=e[z]),N?Nn(a,z,X):Ai(a,z,X)}return a}function Eu(e,t){return An(e,co(e),t)}function Pu(e,t){return An(e,da(e),t)}function or(e,t){return function(a,S){var N=ze(a)?xp:Wl,F=t?t():{};return N(a,e,je(S,2),F)}}function di(e){return Qe(function(t,a){var S=-1,N=a.length,F=N>1?a[N-1]:i,q=N>2?a[2]:i;for(F=e.length>3&&typeof F=="function"?(N--,F):i,q&&zt(a[0],a[1],q)&&(F=N<3?i:F,N=1),t=yt(t);++S<N;){var z=a[S];z&&e(t,z,S,F)}return t})}function ea(e,t){return function(a,S){if(a==null)return a;if(!Xt(a))return e(a,S);for(var N=a.length,F=t?N:-1,q=yt(a);(t?F--:++F<N)&&S(q[F],F,q)!==!1;);return a}}function ta(e){return function(t,a,S){for(var N=-1,F=yt(t),q=S(t),z=q.length;z--;){var X=q[e?z:++N];if(a(F[X],X,F)===!1)break}return t}}function wu(e,t,a){var S=t&T,N=Di(e);function F(){var q=this&&this!==Bt&&this instanceof F?N:e;return q.apply(S?a:this,arguments)}return F}function na(e){return function(t){t=ut(t);var a=si(t)?vn(t):i,S=a?a[0]:t.charAt(0),N=a?Kn(a,1).join(""):t.slice(1);return S[e]()+N}}function fi(e){return function(t){return Rr(ep(Qa(t).replace(mp,"")),e,"")}}function Di(e){return function(){var t=arguments;switch(t.length){case 0:return new e;case 1:return new e(t[0]);case 2:return new e(t[0],t[1]);case 3:return new e(t[0],t[1],t[2]);case 4:return new e(t[0],t[1],t[2],t[3]);case 5:return new e(t[0],t[1],t[2],t[3],t[4]);case 6:return new e(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new e(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var a=ci(e.prototype),S=e.apply(a,t);return wt(S)?S:a}}function Au(e,t,a){var S=Di(e);function N(){for(var F=arguments.length,q=ee(F),z=F,X=mi(N);z--;)q[z]=arguments[z];var le=F<3&&q[0]!==X&&q[F-1]!==X?[]:Gn(q,X);if(F-=le.length,F<a)return aa(e,t,sr,N.placeholder,i,q,le,i,i,a-F);var ue=this&&this!==Bt&&this instanceof N?S:e;return nn(ue,this,q)}return N}function ia(e){return function(t,a,S){var N=yt(t);if(!Xt(t)){var F=je(a,3);t=kt(t),a=function(z){return F(N[z],z,N)}}var q=e(t,a,S);return q>-1?N[F?t[q]:q]:i}}function ra(e){return Mn(function(t){var a=t.length,S=a,N=dn.prototype.thru;for(e&&t.reverse();S--;){var F=t[S];if(typeof F!="function")throw new cn(l);if(N&&!q&&ur(F)=="wrapper")var q=new dn([],!0)}for(S=q?S:a;++S<a;){F=t[S];var z=ur(F),X=z=="wrapper"?lo(F):i;X&&mo(X[0])&&X[1]==(R|x|A|C)&&!X[4].length&&X[9]==1?q=q[ur(X[0])].apply(q,X[3]):q=F.length==1&&mo(F)?q[z]():q.thru(F)}return function(){var le=arguments,ue=le[0];if(q&&le.length==1&&ze(ue))return q.plant(ue).value();for(var he=0,Ae=a?t[he].apply(this,le):ue;++he<a;)Ae=t[he].call(this,Ae);return Ae}})}function sr(e,t,a,S,N,F,q,z,X,le){var ue=t&R,he=t&T,Ae=t&_,De=t&(x|E),Ge=t&D,Ze=Ae?i:Di(e);function Ue(){for(var nt=arguments.length,st=ee(nt),an=nt;an--;)st[an]=arguments[an];if(De)var Yt=mi(Ue),pn=kp(st,Yt);if(S&&(st=Zs(st,S,N,De)),F&&(st=Qs(st,F,q,De)),nt-=pn,De&&nt<le){var Rt=Gn(st,Yt);return aa(e,t,sr,Ue.placeholder,a,st,Rt,z,X,le-nt)}var Sn=he?a:this,kn=Ae?Sn[e]:e;return nt=st.length,z?st=Wu(st,z):Ge&&nt>1&&st.reverse(),ue&&X<nt&&(st.length=X),this&&this!==Bt&&this instanceof Ue&&(kn=Ze||Di(kn)),kn.apply(Sn,st)}return Ue}function oa(e,t){return function(a,S){return Ql(a,e,t(S),{})}}function ar(e,t){return function(a,S){var N;if(a===i&&S===i)return t;if(a!==i&&(N=a),S!==i){if(N===i)return S;typeof a=="string"||typeof S=="string"?(a=on(a),S=on(S)):(a=$s(a),S=$s(S)),N=e(a,S)}return N}}function oo(e){return Mn(function(t){return t=St(t,rn(je())),Qe(function(a){var S=this;return e(t,function(N){return nn(N,S,a)})})})}function pr(e,t){t=t===i?" ":on(t);var a=t.length;if(a<2)return a?Zr(t,e):t;var S=Zr(t,zi(e/ai(t)));return si(t)?Kn(vn(S),0,e).join(""):S.slice(0,e)}function _u(e,t,a,S){var N=t&T,F=Di(e);function q(){for(var z=-1,X=arguments.length,le=-1,ue=S.length,he=ee(ue+X),Ae=this&&this!==Bt&&this instanceof q?F:e;++le<ue;)he[le]=S[le];for(;X--;)he[le++]=arguments[++z];return nn(Ae,N?a:this,he)}return q}function sa(e){return function(t,a,S){return S&&typeof S!="number"&&zt(t,a,S)&&(a=S=i),t=Hn(t),a===i?(a=t,t=0):a=Hn(a),S=S===i?t<a?1:-1:Hn(S),cu(t,a,S,e)}}function lr(e){return function(t,a){return typeof t=="string"&&typeof a=="string"||(t=gn(t),a=gn(a)),e(t,a)}}function aa(e,t,a,S,N,F,q,z,X,le){var ue=t&x,he=ue?q:i,Ae=ue?i:q,De=ue?F:i,Ge=ue?i:F;t|=ue?A:I,t&=~(ue?I:A),t&P||(t&=~(T|_));var Ze=[e,t,N,De,he,Ge,Ae,z,X,le],Ue=a.apply(i,Ze);return mo(e)&&ba(Ue,Ze),Ue.placeholder=S,Ta(Ue,e,t)}function so(e){var t=Mt[e];return function(a,S){if(a=gn(a),S=S==null?0:Ut(Xe(S),292),S&&Ts(a)){var N=(ut(a)+"e").split("e"),F=t(N[0]+"e"+(+N[1]+S));return N=(ut(F)+"e").split("e"),+(N[0]+"e"+(+N[1]-S))}return t(a)}}var Iu=li&&1/ki(new li([,-0]))[1]==K?function(e){return new li(e)}:Ro;function pa(e){return function(t){var a=qt(t);return a==et?Hr(t):a==lt?$p(t):Hp(t,e(t))}}function Cn(e,t,a,S,N,F,q,z){var X=t&_;if(!X&&typeof e!="function")throw new cn(l);var le=S?S.length:0;if(le||(t&=~(A|I),S=N=i),q=q===i?q:Lt(Xe(q),0),z=z===i?z:Xe(z),le-=N?N.length:0,t&I){var ue=S,he=N;S=N=i}var Ae=X?i:lo(e),De=[e,t,a,S,N,ue,he,F,q,z];if(Ae&&Uu(De,Ae),e=De[0],t=De[1],a=De[2],S=De[3],N=De[4],z=De[9]=De[9]===i?X?0:e.length:Lt(De[9]-le,0),!z&&t&(x|E)&&(t&=~(x|E)),!t||t==T)var Ge=wu(e,t,a);else t==x||t==E?Ge=Au(e,t,z):(t==A||t==(T|A))&&!N.length?Ge=_u(e,t,a,S):Ge=sr.apply(i,De);var Ze=Ae?Us:ba;return Ta(Ze(Ge,De),e,t)}function la(e,t,a,S){return e===i||Tn(e,pi[a])&&!dt.call(S,a)?t:e}function ua(e,t,a,S,N,F){return wt(e)&&wt(t)&&(F.set(t,e),nr(e,t,i,ua,F),F.delete(t)),e}function xu(e){return Mi(e)?i:e}function ca(e,t,a,S,N,F){var q=a&b,z=e.length,X=t.length;if(z!=X&&!(q&&X>z))return!1;var le=F.get(e),ue=F.get(t);if(le&&ue)return le==t&&ue==e;var he=-1,Ae=!0,De=a&y?new Jn:i;for(F.set(e,t),F.set(t,e);++he<z;){var Ge=e[he],Ze=t[he];if(S)var Ue=q?S(Ze,Ge,he,t,e,F):S(Ge,Ze,he,e,t,F);if(Ue!==i){if(Ue)continue;Ae=!1;break}if(De){if(!Dr(t,function(nt,st){if(!bi(De,st)&&(Ge===nt||N(Ge,nt,a,S,F)))return De.push(st)})){Ae=!1;break}}else if(!(Ge===Ze||N(Ge,Ze,a,S,F))){Ae=!1;break}}return F.delete(e),F.delete(t),Ae}function Ru(e,t,a,S,N,F,q){switch(a){case tn:if(e.byteLength!=t.byteLength||e.byteOffset!=t.byteOffset)return!1;e=e.buffer,t=t.buffer;case tt:return!(e.byteLength!=t.byteLength||!F(new $i(e),new $i(t)));case Dt:case Ct:case Wt:return Tn(+e,+t);case qe:return e.name==t.name&&e.message==t.message;case Ot:case ft:return e==t+"";case et:var z=Hr;case lt:var X=S&b;if(z||(z=ki),e.size!=t.size&&!X)return!1;var le=q.get(e);if(le)return le==t;S|=y,q.set(e,t);var ue=ca(z(e),z(t),S,N,F,q);return q.delete(e),ue;case In:if(wi)return wi.call(e)==wi.call(t)}return!1}function Du(e,t,a,S,N,F){var q=a&b,z=ao(e),X=z.length,le=ao(t),ue=le.length;if(X!=ue&&!q)return!1;for(var he=X;he--;){var Ae=z[he];if(!(q?Ae in t:dt.call(t,Ae)))return!1}var De=F.get(e),Ge=F.get(t);if(De&&Ge)return De==t&&Ge==e;var Ze=!0;F.set(e,t),F.set(t,e);for(var Ue=q;++he<X;){Ae=z[he];var nt=e[Ae],st=t[Ae];if(S)var an=q?S(st,nt,Ae,t,e,F):S(nt,st,Ae,e,t,F);if(!(an===i?nt===st||N(nt,st,a,S,F):an)){Ze=!1;break}Ue||(Ue=Ae=="constructor")}if(Ze&&!Ue){var Yt=e.constructor,pn=t.constructor;Yt!=pn&&"constructor"in e&&"constructor"in t&&!(typeof Yt=="function"&&Yt instanceof Yt&&typeof pn=="function"&&pn instanceof pn)&&(Ze=!1)}return F.delete(e),F.delete(t),Ze}function Mn(e){return go(ya(e,i,_a),e+"")}function ao(e){return Ns(e,kt,co)}function po(e){return Ns(e,Zt,da)}var lo=Ji?function(e){return Ji.get(e)}:Ro;function ur(e){for(var t=e.name+"",a=ui[t],S=dt.call(ui,t)?a.length:0;S--;){var N=a[S],F=N.func;if(F==null||F==e)return N.name}return t}function mi(e){var t=dt.call(L,"placeholder")?L:e;return t.placeholder}function je(){var e=L.iteratee||Io;return e=e===Io?Ls:e,arguments.length?e(arguments[0],arguments[1]):e}function cr(e,t){var a=e.__data__;return Fu(t)?a[typeof t=="string"?"string":"hash"]:a.map}function uo(e){for(var t=kt(e),a=t.length;a--;){var S=t[a],N=e[S];t[a]=[S,N,ha(N)]}return t}function Qn(e,t){var a=Gp(e,t);return Ms(a)?a:i}function Nu(e){var t=dt.call(e,zn),a=e[zn];try{e[zn]=i;var S=!0}catch(F){}var N=Ui.call(e);return S&&(t?e[zn]=a:delete e[zn]),N}var co=Fr?function(e){return e==null?[]:(e=yt(e),Bn(Fr(e),function(t){return vs.call(e,t)}))}:Do,da=Fr?function(e){for(var t=[];e;)jn(t,co(e)),e=Wi(e);return t}:Do,qt=Vt;(Br&&qt(new Br(new ArrayBuffer(1)))!=tn||Si&&qt(new Si)!=et||jr&&qt(jr.resolve())!=Kt||li&&qt(new li)!=lt||Ei&&qt(new Ei)!=en)&&(qt=function(e){var t=Vt(e),a=t==Et?e.constructor:i,S=a?ei(a):"";if(S)switch(S){case fl:return tn;case ml:return et;case hl:return Kt;case gl:return lt;case yl:return en}return t});function Cu(e,t,a){for(var S=-1,N=a.length;++S<N;){var F=a[S],q=F.size;switch(F.type){case"drop":e+=q;break;case"dropRight":t-=q;break;case"take":t=Ut(t,e+q);break;case"takeRight":e=Lt(e,t-q);break}}return{start:e,end:t}}function Mu(e){var t=e.match(Pe);return t?t[1].split(Me):[]}function fa(e,t,a){t=Wn(t,e);for(var S=-1,N=t.length,F=!1;++S<N;){var q=_n(t[S]);if(!(F=e!=null&&a(e,q)))break;e=e[q]}return F||++S!=N?F:(N=e==null?0:e.length,!!N&&vr(N)&&Ln(q,N)&&(ze(e)||ti(e)))}function Lu(e){var t=e.length,a=new e.constructor(t);return t&&typeof e[0]=="string"&&dt.call(e,"index")&&(a.index=e.index,a.input=e.input),a}function ma(e){return typeof e.constructor=="function"&&!Ni(e)?ci(Wi(e)):{}}function Ou(e,t,a){var S=e.constructor;switch(t){case tt:return ro(e);case Dt:case Ct:return new S(+e);case tn:return vu(e,a);case Ht:case fe:case Z:case de:case _e:case ne:case ge:case ce:case Te:return Js(e,a);case et:return new S;case Wt:case ft:return new S(e);case Ot:return bu(e);case lt:return new S;case In:return Tu(e)}}function Hu(e,t){var a=t.length;if(!a)return e;var S=a-1;return t[S]=(a>1?"& ":"")+t[S],t=t.join(a>2?", ":" "),e.replace(be,`{
/* [wrapped with `+t+`] */
`)}function ku(e){return ze(e)||ti(e)||!!(bs&&e&&e[bs])}function Ln(e,t){var a=typeof e;return t=t==null?W:t,!!t&&(a=="number"||a!="symbol"&&Se.test(e))&&e>-1&&e%1==0&&e<t}function zt(e,t,a){if(!wt(a))return!1;var S=typeof t;return(S=="number"?Xt(a)&&Ln(t,a.length):S=="string"&&t in a)?Tn(a[t],e):!1}function fo(e,t){if(ze(e))return!1;var a=typeof e;return a=="number"||a=="symbol"||a=="boolean"||e==null||sn(e)?!0:U.test(e)||!O.test(e)||t!=null&&e in yt(t)}function Fu(e){var t=typeof e;return t=="string"||t=="number"||t=="symbol"||t=="boolean"?e!=="__proto__":e===null}function mo(e){var t=ur(e),a=L[t];if(typeof a!="function"||!(t in it.prototype))return!1;if(e===a)return!0;var S=lo(a);return!!S&&e===S[0]}function Bu(e){return!!hs&&hs in e}var ju=ji?On:No;function Ni(e){var t=e&&e.constructor,a=typeof t=="function"&&t.prototype||pi;return e===a}function ha(e){return e===e&&!wt(e)}function ga(e,t){return function(a){return a==null?!1:a[e]===t&&(t!==i||e in yt(a))}}function Gu(e){var t=gr(e,function(S){return a.size===h&&a.clear(),S}),a=t.cache;return t}function Uu(e,t){var a=e[1],S=t[1],N=a|S,F=N<(T|_|R),q=S==R&&a==x||S==R&&a==C&&e[7].length<=t[8]||S==(R|C)&&t[7].length<=t[8]&&a==x;if(!(F||q))return e;S&T&&(e[2]=t[2],N|=a&T?0:P);var z=t[3];if(z){var X=e[3];e[3]=X?Zs(X,z,t[4]):z,e[4]=X?Gn(e[3],r):t[4]}return z=t[5],z&&(X=e[5],e[5]=X?Qs(X,z,t[6]):z,e[6]=X?Gn(e[5],r):t[6]),z=t[7],z&&(e[7]=z),S&R&&(e[8]=e[8]==null?t[8]:Ut(e[8],t[8])),e[9]==null&&(e[9]=t[9]),e[0]=t[0],e[1]=N,e}function qu(e){var t=[];if(e!=null)for(var a in yt(e))t.push(a);return t}function $u(e){return Ui.call(e)}function ya(e,t,a){return t=Lt(t===i?e.length-1:t,0),function(){for(var S=arguments,N=-1,F=Lt(S.length-t,0),q=ee(F);++N<F;)q[N]=S[t+N];N=-1;for(var z=ee(t+1);++N<t;)z[N]=S[N];return z[t]=a(q),nn(e,this,z)}}function va(e,t){return t.length<2?e:Zn(e,mn(t,0,-1))}function Wu(e,t){for(var a=e.length,S=Ut(t.length,a),N=Jt(e);S--;){var F=t[S];e[S]=Ln(F,a)?N[F]:i}return e}function ho(e,t){if(!(t==="constructor"&&typeof e[t]=="function")&&t!="__proto__")return e[t]}var ba=Sa(Us),Ci=sl||function(e,t){return Bt.setTimeout(e,t)},go=Sa(mu);function Ta(e,t,a){var S=t+"";return go(e,Hu(S,Ku(Mu(S),a)))}function Sa(e){var t=0,a=0;return function(){var S=ul(),N=G-(S-a);if(a=S,N>0){if(++t>=k)return arguments[0]}else t=0;return e.apply(i,arguments)}}function dr(e,t){var a=-1,S=e.length,N=S-1;for(t=t===i?S:t;++a<t;){var F=Xr(a,N),q=e[F];e[F]=e[a],e[a]=q}return e.length=t,e}var Ea=Gu(function(e){var t=[];return e.charCodeAt(0)===46&&t.push(""),e.replace(V,function(a,S,N,F){t.push(N?F.replace(Ye,"$1"):S||a)}),t});function _n(e){if(typeof e=="string"||sn(e))return e;var t=e+"";return t=="0"&&1/e==-K?"-0":t}function ei(e){if(e!=null){try{return Gi.call(e)}catch(t){}try{return e+""}catch(t){}}return""}function Ku(e,t){return un(Ee,function(a){var S="_."+a[0];t&a[1]&&!Oi(e,S)&&e.push(S)}),e.sort()}function Pa(e){if(e instanceof it)return e.clone();var t=new dn(e.__wrapped__,e.__chain__);return t.__actions__=Jt(e.__actions__),t.__index__=e.__index__,t.__values__=e.__values__,t}function Vu(e,t,a){(a?zt(e,t,a):t===i)?t=1:t=Lt(Xe(t),0);var S=e==null?0:e.length;if(!S||t<1)return[];for(var N=0,F=0,q=ee(zi(S/t));N<S;)q[F++]=mn(e,N,N+=t);return q}function zu(e){for(var t=-1,a=e==null?0:e.length,S=0,N=[];++t<a;){var F=e[t];F&&(N[S++]=F)}return N}function Yu(){var e=arguments.length;if(!e)return[];for(var t=ee(e-1),a=arguments[0],S=e;S--;)t[S-1]=arguments[S];return jn(ze(a)?Jt(a):[a],jt(t,1))}var Ju=Qe(function(e,t){return xt(e)?_i(e,jt(t,1,xt,!0)):[]}),Xu=Qe(function(e,t){var a=hn(t);return xt(a)&&(a=i),xt(e)?_i(e,jt(t,1,xt,!0),je(a,2)):[]}),Zu=Qe(function(e,t){var a=hn(t);return xt(a)&&(a=i),xt(e)?_i(e,jt(t,1,xt,!0),i,a):[]});function Qu(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:Xe(t),mn(e,t<0?0:t,S)):[]}function ec(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:Xe(t),t=S-t,mn(e,0,t<0?0:t)):[]}function tc(e,t){return e&&e.length?rr(e,je(t,3),!0,!0):[]}function nc(e,t){return e&&e.length?rr(e,je(t,3),!0):[]}function ic(e,t,a,S){var N=e==null?0:e.length;return N?(a&&typeof a!="number"&&zt(e,t,a)&&(a=0,S=N),Yl(e,t,a,S)):[]}function wa(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var N=a==null?0:Xe(a);return N<0&&(N=Lt(S+N,0)),Hi(e,je(t,3),N)}function Aa(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var N=S-1;return a!==i&&(N=Xe(a),N=a<0?Lt(S+N,0):Ut(N,S-1)),Hi(e,je(t,3),N,!0)}function _a(e){var t=e==null?0:e.length;return t?jt(e,1):[]}function rc(e){var t=e==null?0:e.length;return t?jt(e,K):[]}function oc(e,t){var a=e==null?0:e.length;return a?(t=t===i?1:Xe(t),jt(e,t)):[]}function sc(e){for(var t=-1,a=e==null?0:e.length,S={};++t<a;){var N=e[t];S[N[0]]=N[1]}return S}function Ia(e){return e&&e.length?e[0]:i}function ac(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var N=a==null?0:Xe(a);return N<0&&(N=Lt(S+N,0)),oi(e,t,N)}function pc(e){var t=e==null?0:e.length;return t?mn(e,0,-1):[]}var lc=Qe(function(e){var t=St(e,no);return t.length&&t[0]===e[0]?Kr(t):[]}),uc=Qe(function(e){var t=hn(e),a=St(e,no);return t===hn(a)?t=i:a.pop(),a.length&&a[0]===e[0]?Kr(a,je(t,2)):[]}),cc=Qe(function(e){var t=hn(e),a=St(e,no);return t=typeof t=="function"?t:i,t&&a.pop(),a.length&&a[0]===e[0]?Kr(a,i,t):[]});function dc(e,t){return e==null?"":pl.call(e,t)}function hn(e){var t=e==null?0:e.length;return t?e[t-1]:i}function fc(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var N=S;return a!==i&&(N=Xe(a),N=N<0?Lt(S+N,0):Ut(N,S-1)),t===t?Kp(e,t,N):Hi(e,as,N,!0)}function mc(e,t){return e&&e.length?Fs(e,Xe(t)):i}var hc=Qe(xa);function xa(e,t){return e&&e.length&&t&&t.length?Jr(e,t):e}function gc(e,t,a){return e&&e.length&&t&&t.length?Jr(e,t,je(a,2)):e}function yc(e,t,a){return e&&e.length&&t&&t.length?Jr(e,t,i,a):e}var vc=Mn(function(e,t){var a=e==null?0:e.length,S=Ur(e,t);return Gs(e,St(t,function(N){return Ln(N,a)?+N:N}).sort(Xs)),S});function bc(e,t){var a=[];if(!(e&&e.length))return a;var S=-1,N=[],F=e.length;for(t=je(t,3);++S<F;){var q=e[S];t(q,S,e)&&(a.push(q),N.push(S))}return Gs(e,N),a}function yo(e){return e==null?e:dl.call(e)}function Tc(e,t,a){var S=e==null?0:e.length;return S?(a&&typeof a!="number"&&zt(e,t,a)?(t=0,a=S):(t=t==null?0:Xe(t),a=a===i?S:Xe(a)),mn(e,t,a)):[]}function Sc(e,t){return ir(e,t)}function Ec(e,t,a){return Qr(e,t,je(a,2))}function Pc(e,t){var a=e==null?0:e.length;if(a){var S=ir(e,t);if(S<a&&Tn(e[S],t))return S}return-1}function wc(e,t){return ir(e,t,!0)}function Ac(e,t,a){return Qr(e,t,je(a,2),!0)}function _c(e,t){var a=e==null?0:e.length;if(a){var S=ir(e,t,!0)-1;if(Tn(e[S],t))return S}return-1}function Ic(e){return e&&e.length?qs(e):[]}function xc(e,t){return e&&e.length?qs(e,je(t,2)):[]}function Rc(e){var t=e==null?0:e.length;return t?mn(e,1,t):[]}function Dc(e,t,a){return e&&e.length?(t=a||t===i?1:Xe(t),mn(e,0,t<0?0:t)):[]}function Nc(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===i?1:Xe(t),t=S-t,mn(e,t<0?0:t,S)):[]}function Cc(e,t){return e&&e.length?rr(e,je(t,3),!1,!0):[]}function Mc(e,t){return e&&e.length?rr(e,je(t,3)):[]}var Lc=Qe(function(e){return $n(jt(e,1,xt,!0))}),Oc=Qe(function(e){var t=hn(e);return xt(t)&&(t=i),$n(jt(e,1,xt,!0),je(t,2))}),Hc=Qe(function(e){var t=hn(e);return t=typeof t=="function"?t:i,$n(jt(e,1,xt,!0),i,t)});function kc(e){return e&&e.length?$n(e):[]}function Fc(e,t){return e&&e.length?$n(e,je(t,2)):[]}function Bc(e,t){return t=typeof t=="function"?t:i,e&&e.length?$n(e,i,t):[]}function vo(e){if(!(e&&e.length))return[];var t=0;return e=Bn(e,function(a){if(xt(a))return t=Lt(a.length,t),!0}),Lr(t,function(a){return St(e,Nr(a))})}function Ra(e,t){if(!(e&&e.length))return[];var a=vo(e);return t==null?a:St(a,function(S){return nn(t,i,S)})}var jc=Qe(function(e,t){return xt(e)?_i(e,t):[]}),Gc=Qe(function(e){return to(Bn(e,xt))}),Uc=Qe(function(e){var t=hn(e);return xt(t)&&(t=i),to(Bn(e,xt),je(t,2))}),qc=Qe(function(e){var t=hn(e);return t=typeof t=="function"?t:i,to(Bn(e,xt),i,t)}),$c=Qe(vo);function Wc(e,t){return Vs(e||[],t||[],Ai)}function Kc(e,t){return Vs(e||[],t||[],Ri)}var Vc=Qe(function(e){var t=e.length,a=t>1?e[t-1]:i;return a=typeof a=="function"?(e.pop(),a):i,Ra(e,a)});function Da(e){var t=L(e);return t.__chain__=!0,t}function zc(e,t){return t(e),e}function fr(e,t){return t(e)}var Yc=Mn(function(e){var t=e.length,a=t?e[0]:0,S=this.__wrapped__,N=function(F){return Ur(F,e)};return t>1||this.__actions__.length||!(S instanceof it)||!Ln(a)?this.thru(N):(S=S.slice(a,+a+(t?1:0)),S.__actions__.push({func:fr,args:[N],thisArg:i}),new dn(S,this.__chain__).thru(function(F){return t&&!F.length&&F.push(i),F}))});function Jc(){return Da(this)}function Xc(){return new dn(this.value(),this.__chain__)}function Zc(){this.__values__===i&&(this.__values__=$a(this.value()));var e=this.__index__>=this.__values__.length,t=e?i:this.__values__[this.__index__++];return{done:e,value:t}}function Qc(){return this}function e0(e){for(var t,a=this;a instanceof Zi;){var S=Pa(a);S.__index__=0,S.__values__=i,t?N.__wrapped__=S:t=S;var N=S;a=a.__wrapped__}return N.__wrapped__=e,t}function t0(){var e=this.__wrapped__;if(e instanceof it){var t=e;return this.__actions__.length&&(t=new it(this)),t=t.reverse(),t.__actions__.push({func:fr,args:[yo],thisArg:i}),new dn(t,this.__chain__)}return this.thru(yo)}function n0(){return Ks(this.__wrapped__,this.__actions__)}var i0=or(function(e,t,a){dt.call(e,a)?++e[a]:Nn(e,a,1)});function r0(e,t,a){var S=ze(e)?os:zl;return a&&zt(e,t,a)&&(t=i),S(e,je(t,3))}function o0(e,t){var a=ze(e)?Bn:Rs;return a(e,je(t,3))}var s0=ia(wa),a0=ia(Aa);function p0(e,t){return jt(mr(e,t),1)}function l0(e,t){return jt(mr(e,t),K)}function u0(e,t,a){return a=a===i?1:Xe(a),jt(mr(e,t),a)}function Na(e,t){var a=ze(e)?un:qn;return a(e,je(t,3))}function Ca(e,t){var a=ze(e)?Rp:xs;return a(e,je(t,3))}var c0=or(function(e,t,a){dt.call(e,a)?e[a].push(t):Nn(e,a,[t])});function d0(e,t,a,S){e=Xt(e)?e:gi(e),a=a&&!S?Xe(a):0;var N=e.length;return a<0&&(a=Lt(N+a,0)),br(e)?a<=N&&e.indexOf(t,a)>-1:!!N&&oi(e,t,a)>-1}var f0=Qe(function(e,t,a){var S=-1,N=typeof t=="function",F=Xt(e)?ee(e.length):[];return qn(e,function(q){F[++S]=N?nn(t,q,a):Ii(q,t,a)}),F}),m0=or(function(e,t,a){Nn(e,a,t)});function mr(e,t){var a=ze(e)?St:Os;return a(e,je(t,3))}function h0(e,t,a,S){return e==null?[]:(ze(t)||(t=t==null?[]:[t]),a=S?i:a,ze(a)||(a=a==null?[]:[a]),Bs(e,t,a))}var g0=or(function(e,t,a){e[a?0:1].push(t)},function(){return[[],[]]});function y0(e,t,a){var S=ze(e)?Rr:ls,N=arguments.length<3;return S(e,je(t,4),a,N,qn)}function v0(e,t,a){var S=ze(e)?Dp:ls,N=arguments.length<3;return S(e,je(t,4),a,N,xs)}function b0(e,t){var a=ze(e)?Bn:Rs;return a(e,yr(je(t,3)))}function T0(e){var t=ze(e)?ws:du;return t(e)}function S0(e,t,a){(a?zt(e,t,a):t===i)?t=1:t=Xe(t);var S=ze(e)?ql:fu;return S(e,t)}function E0(e){var t=ze(e)?$l:hu;return t(e)}function P0(e){if(e==null)return 0;if(Xt(e))return br(e)?ai(e):e.length;var t=qt(e);return t==et||t==lt?e.size:zr(e).length}function w0(e,t,a){var S=ze(e)?Dr:gu;return a&&zt(e,t,a)&&(t=i),S(e,je(t,3))}var A0=Qe(function(e,t){if(e==null)return[];var a=t.length;return a>1&&zt(e,t[0],t[1])?t=[]:a>2&&zt(t[0],t[1],t[2])&&(t=[t[0]]),Bs(e,jt(t,1),[])}),hr=ol||function(){return Bt.Date.now()};function _0(e,t){if(typeof t!="function")throw new cn(l);return e=Xe(e),function(){if(--e<1)return t.apply(this,arguments)}}function Ma(e,t,a){return t=a?i:t,t=e&&t==null?e.length:t,Cn(e,R,i,i,i,i,t)}function La(e,t){var a;if(typeof t!="function")throw new cn(l);return e=Xe(e),function(){return--e>0&&(a=t.apply(this,arguments)),e<=1&&(t=i),a}}var bo=Qe(function(e,t,a){var S=T;if(a.length){var N=Gn(a,mi(bo));S|=A}return Cn(e,S,t,a,N)}),Oa=Qe(function(e,t,a){var S=T|_;if(a.length){var N=Gn(a,mi(Oa));S|=A}return Cn(t,S,e,a,N)});function Ha(e,t,a){t=a?i:t;var S=Cn(e,x,i,i,i,i,i,t);return S.placeholder=Ha.placeholder,S}function ka(e,t,a){t=a?i:t;var S=Cn(e,E,i,i,i,i,i,t);return S.placeholder=ka.placeholder,S}function Fa(e,t,a){var S,N,F,q,z,X,le=0,ue=!1,he=!1,Ae=!0;if(typeof e!="function")throw new cn(l);t=gn(t)||0,wt(a)&&(ue=!!a.leading,he="maxWait"in a,F=he?Lt(gn(a.maxWait)||0,t):F,Ae="trailing"in a?!!a.trailing:Ae);function De(Rt){var Sn=S,kn=N;return S=N=i,le=Rt,q=e.apply(kn,Sn),q}function Ge(Rt){return le=Rt,z=Ci(nt,t),ue?De(Rt):q}function Ze(Rt){var Sn=Rt-X,kn=Rt-le,ip=t-Sn;return he?Ut(ip,F-kn):ip}function Ue(Rt){var Sn=Rt-X,kn=Rt-le;return X===i||Sn>=t||Sn<0||he&&kn>=F}function nt(){var Rt=hr();if(Ue(Rt))return st(Rt);z=Ci(nt,Ze(Rt))}function st(Rt){return z=i,Ae&&S?De(Rt):(S=N=i,q)}function an(){z!==i&&zs(z),le=0,S=X=N=z=i}function Yt(){return z===i?q:st(hr())}function pn(){var Rt=hr(),Sn=Ue(Rt);if(S=arguments,N=this,X=Rt,Sn){if(z===i)return Ge(X);if(he)return zs(z),z=Ci(nt,t),De(X)}return z===i&&(z=Ci(nt,t)),q}return pn.cancel=an,pn.flush=Yt,pn}var I0=Qe(function(e,t){return Is(e,1,t)}),x0=Qe(function(e,t,a){return Is(e,gn(t)||0,a)});function R0(e){return Cn(e,D)}function gr(e,t){if(typeof e!="function"||t!=null&&typeof t!="function")throw new cn(l);var a=function(){var S=arguments,N=t?t.apply(this,S):S[0],F=a.cache;if(F.has(N))return F.get(N);var q=e.apply(this,S);return a.cache=F.set(N,q)||F,q};return a.cache=new(gr.Cache||Dn),a}gr.Cache=Dn;function yr(e){if(typeof e!="function")throw new cn(l);return function(){var t=arguments;switch(t.length){case 0:return!e.call(this);case 1:return!e.call(this,t[0]);case 2:return!e.call(this,t[0],t[1]);case 3:return!e.call(this,t[0],t[1],t[2])}return!e.apply(this,t)}}function D0(e){return La(2,e)}var N0=yu(function(e,t){t=t.length==1&&ze(t[0])?St(t[0],rn(je())):St(jt(t,1),rn(je()));var a=t.length;return Qe(function(S){for(var N=-1,F=Ut(S.length,a);++N<F;)S[N]=t[N].call(this,S[N]);return nn(e,this,S)})}),To=Qe(function(e,t){var a=Gn(t,mi(To));return Cn(e,A,i,t,a)}),Ba=Qe(function(e,t){var a=Gn(t,mi(Ba));return Cn(e,I,i,t,a)}),C0=Mn(function(e,t){return Cn(e,C,i,i,i,t)});function M0(e,t){if(typeof e!="function")throw new cn(l);return t=t===i?t:Xe(t),Qe(e,t)}function L0(e,t){if(typeof e!="function")throw new cn(l);return t=t==null?0:Lt(Xe(t),0),Qe(function(a){var S=a[t],N=Kn(a,0,t);return S&&jn(N,S),nn(e,this,N)})}function O0(e,t,a){var S=!0,N=!0;if(typeof e!="function")throw new cn(l);return wt(a)&&(S="leading"in a?!!a.leading:S,N="trailing"in a?!!a.trailing:N),Fa(e,t,{leading:S,maxWait:t,trailing:N})}function H0(e){return Ma(e,1)}function k0(e,t){return To(io(t),e)}function F0(){if(!arguments.length)return[];var e=arguments[0];return ze(e)?e:[e]}function B0(e){return fn(e,f)}function j0(e,t){return t=typeof t=="function"?t:i,fn(e,f,t)}function G0(e){return fn(e,g|f)}function U0(e,t){return t=typeof t=="function"?t:i,fn(e,g|f,t)}function q0(e,t){return t==null||_s(e,t,kt(t))}function Tn(e,t){return e===t||e!==e&&t!==t}var $0=lr(Wr),W0=lr(function(e,t){return e>=t}),ti=Cs(function(){return arguments}())?Cs:function(e){return At(e)&&dt.call(e,"callee")&&!vs.call(e,"callee")},ze=ee.isArray,K0=Qo?rn(Qo):eu;function Xt(e){return e!=null&&vr(e.length)&&!On(e)}function xt(e){return At(e)&&Xt(e)}function V0(e){return e===!0||e===!1||At(e)&&Vt(e)==Dt}var Vn=al||No,z0=es?rn(es):tu;function Y0(e){return At(e)&&e.nodeType===1&&!Mi(e)}function J0(e){if(e==null)return!0;if(Xt(e)&&(ze(e)||typeof e=="string"||typeof e.splice=="function"||Vn(e)||hi(e)||ti(e)))return!e.length;var t=qt(e);if(t==et||t==lt)return!e.size;if(Ni(e))return!zr(e).length;for(var a in e)if(dt.call(e,a))return!1;return!0}function X0(e,t){return xi(e,t)}function Z0(e,t,a){a=typeof a=="function"?a:i;var S=a?a(e,t):i;return S===i?xi(e,t,i,a):!!S}function So(e){if(!At(e))return!1;var t=Vt(e);return t==qe||t==$t||typeof e.message=="string"&&typeof e.name=="string"&&!Mi(e)}function Q0(e){return typeof e=="number"&&Ts(e)}function On(e){if(!wt(e))return!1;var t=Vt(e);return t==Ft||t==Je||t==Nt||t==yn}function ja(e){return typeof e=="number"&&e==Xe(e)}function vr(e){return typeof e=="number"&&e>-1&&e%1==0&&e<=W}function wt(e){var t=typeof e;return e!=null&&(t=="object"||t=="function")}function At(e){return e!=null&&typeof e=="object"}var Ga=ts?rn(ts):iu;function ed(e,t){return e===t||Vr(e,t,uo(t))}function td(e,t,a){return a=typeof a=="function"?a:i,Vr(e,t,uo(t),a)}function nd(e){return Ua(e)&&e!=+e}function id(e){if(ju(e))throw new Ke(c);return Ms(e)}function rd(e){return e===null}function od(e){return e==null}function Ua(e){return typeof e=="number"||At(e)&&Vt(e)==Wt}function Mi(e){if(!At(e)||Vt(e)!=Et)return!1;var t=Wi(e);if(t===null)return!0;var a=dt.call(t,"constructor")&&t.constructor;return typeof a=="function"&&a instanceof a&&Gi.call(a)==tl}var Eo=ns?rn(ns):ru;function sd(e){return ja(e)&&e>=-W&&e<=W}var qa=is?rn(is):ou;function br(e){return typeof e=="string"||!ze(e)&&At(e)&&Vt(e)==ft}function sn(e){return typeof e=="symbol"||At(e)&&Vt(e)==In}var hi=rs?rn(rs):su;function ad(e){return e===i}function pd(e){return At(e)&&qt(e)==en}function ld(e){return At(e)&&Vt(e)==yi}var ud=lr(Yr),cd=lr(function(e,t){return e<=t});function $a(e){if(!e)return[];if(Xt(e))return br(e)?vn(e):Jt(e);if(Ti&&e[Ti])return qp(e[Ti]());var t=qt(e),a=t==et?Hr:t==lt?ki:gi;return a(e)}function Hn(e){if(!e)return e===0?e:0;if(e=gn(e),e===K||e===-K){var t=e<0?-1:1;return t*te}return e===e?e:0}function Xe(e){var t=Hn(e),a=t%1;return t===t?a?t-a:t:0}function Wa(e){return e?Xn(Xe(e),0,me):0}function gn(e){if(typeof e=="number")return e;if(sn(e))return ae;if(wt(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=wt(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=us(e);var a=It.test(e);return a||pe.test(e)?_p(e.slice(2),a?2:8):Pt.test(e)?ae:+e}function Ka(e){return An(e,Zt(e))}function dd(e){return e?Xn(Xe(e),-W,W):e===0?e:0}function ut(e){return e==null?"":on(e)}var fd=di(function(e,t){if(Ni(t)||Xt(t)){An(t,kt(t),e);return}for(var a in t)dt.call(t,a)&&Ai(e,a,t[a])}),Va=di(function(e,t){An(t,Zt(t),e)}),Tr=di(function(e,t,a,S){An(t,Zt(t),e,S)}),md=di(function(e,t,a,S){An(t,kt(t),e,S)}),hd=Mn(Ur);function gd(e,t){var a=ci(e);return t==null?a:As(a,t)}var yd=Qe(function(e,t){e=yt(e);var a=-1,S=t.length,N=S>2?t[2]:i;for(N&&zt(t[0],t[1],N)&&(S=1);++a<S;)for(var F=t[a],q=Zt(F),z=-1,X=q.length;++z<X;){var le=q[z],ue=e[le];(ue===i||Tn(ue,pi[le])&&!dt.call(e,le))&&(e[le]=F[le])}return e}),vd=Qe(function(e){return e.push(i,ua),nn(za,i,e)});function bd(e,t){return ss(e,je(t,3),wn)}function Td(e,t){return ss(e,je(t,3),$r)}function Sd(e,t){return e==null?e:qr(e,je(t,3),Zt)}function Ed(e,t){return e==null?e:Ds(e,je(t,3),Zt)}function Pd(e,t){return e&&wn(e,je(t,3))}function wd(e,t){return e&&$r(e,je(t,3))}function Ad(e){return e==null?[]:tr(e,kt(e))}function _d(e){return e==null?[]:tr(e,Zt(e))}function Po(e,t,a){var S=e==null?i:Zn(e,t);return S===i?a:S}function Id(e,t){return e!=null&&fa(e,t,Jl)}function wo(e,t){return e!=null&&fa(e,t,Xl)}var xd=oa(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Ui.call(t)),e[t]=a},_o(Qt)),Rd=oa(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Ui.call(t)),dt.call(e,t)?e[t].push(a):e[t]=[a]},je),Dd=Qe(Ii);function kt(e){return Xt(e)?Ps(e):zr(e)}function Zt(e){return Xt(e)?Ps(e,!0):au(e)}function Nd(e,t){var a={};return t=je(t,3),wn(e,function(S,N,F){Nn(a,t(S,N,F),S)}),a}function Cd(e,t){var a={};return t=je(t,3),wn(e,function(S,N,F){Nn(a,N,t(S,N,F))}),a}var Md=di(function(e,t,a){nr(e,t,a)}),za=di(function(e,t,a,S){nr(e,t,a,S)}),Ld=Mn(function(e,t){var a={};if(e==null)return a;var S=!1;t=St(t,function(F){return F=Wn(F,e),S||(S=F.length>1),F}),An(e,po(e),a),S&&(a=fn(a,g|d|f,xu));for(var N=t.length;N--;)eo(a,t[N]);return a});function Od(e,t){return Ya(e,yr(je(t)))}var Hd=Mn(function(e,t){return e==null?{}:lu(e,t)});function Ya(e,t){if(e==null)return{};var a=St(po(e),function(S){return[S]});return t=je(t),js(e,a,function(S,N){return t(S,N[0])})}function kd(e,t,a){t=Wn(t,e);var S=-1,N=t.length;for(N||(N=1,e=i);++S<N;){var F=e==null?i:e[_n(t[S])];F===i&&(S=N,F=a),e=On(F)?F.call(e):F}return e}function Fd(e,t,a){return e==null?e:Ri(e,t,a)}function Bd(e,t,a,S){return S=typeof S=="function"?S:i,e==null?e:Ri(e,t,a,S)}var Ja=pa(kt),Xa=pa(Zt);function jd(e,t,a){var S=ze(e),N=S||Vn(e)||hi(e);if(t=je(t,4),a==null){var F=e&&e.constructor;N?a=S?new F:[]:wt(e)?a=On(F)?ci(Wi(e)):{}:a={}}return(N?un:wn)(e,function(q,z,X){return t(a,q,z,X)}),a}function Gd(e,t){return e==null?!0:eo(e,t)}function Ud(e,t,a){return e==null?e:Ws(e,t,io(a))}function qd(e,t,a,S){return S=typeof S=="function"?S:i,e==null?e:Ws(e,t,io(a),S)}function gi(e){return e==null?[]:Or(e,kt(e))}function $d(e){return e==null?[]:Or(e,Zt(e))}function Wd(e,t,a){return a===i&&(a=t,t=i),a!==i&&(a=gn(a),a=a===a?a:0),t!==i&&(t=gn(t),t=t===t?t:0),Xn(gn(e),t,a)}function Kd(e,t,a){return t=Hn(t),a===i?(a=t,t=0):a=Hn(a),e=gn(e),Zl(e,t,a)}function Vd(e,t,a){if(a&&typeof a!="boolean"&&zt(e,t,a)&&(t=a=i),a===i&&(typeof t=="boolean"?(a=t,t=i):typeof e=="boolean"&&(a=e,e=i)),e===i&&t===i?(e=0,t=1):(e=Hn(e),t===i?(t=e,e=0):t=Hn(t)),e>t){var S=e;e=t,t=S}if(a||e%1||t%1){var N=Ss();return Ut(e+N*(t-e+Ap("1e-"+((N+"").length-1))),t)}return Xr(e,t)}var zd=fi(function(e,t,a){return t=t.toLowerCase(),e+(a?Za(t):t)});function Za(e){return Ao(ut(e).toLowerCase())}function Qa(e){return e=ut(e),e&&e.replace(we,Fp).replace(hp,"")}function Yd(e,t,a){e=ut(e),t=on(t);var S=e.length;a=a===i?S:Xn(Xe(a),0,S);var N=a;return a-=t.length,a>=0&&e.slice(a,N)==t}function Jd(e){return e=ut(e),e&&rt.test(e)?e.replace(Fe,Bp):e}function Xd(e){return e=ut(e),e&&Y.test(e)?e.replace(ie,"\\$&"):e}var Zd=fi(function(e,t,a){return e+(a?"-":"")+t.toLowerCase()}),Qd=fi(function(e,t,a){return e+(a?" ":"")+t.toLowerCase()}),ef=na("toLowerCase");function tf(e,t,a){e=ut(e),t=Xe(t);var S=t?ai(e):0;if(!t||S>=t)return e;var N=(t-S)/2;return pr(Yi(N),a)+e+pr(zi(N),a)}function nf(e,t,a){e=ut(e),t=Xe(t);var S=t?ai(e):0;return t&&S<t?e+pr(t-S,a):e}function rf(e,t,a){e=ut(e),t=Xe(t);var S=t?ai(e):0;return t&&S<t?pr(t-S,a)+e:e}function of(e,t,a){return a||t==null?t=0:t&&(t=+t),cl(ut(e).replace(re,""),t||0)}function sf(e,t,a){return(a?zt(e,t,a):t===i)?t=1:t=Xe(t),Zr(ut(e),t)}function af(){var e=arguments,t=ut(e[0]);return e.length<3?t:t.replace(e[1],e[2])}var pf=fi(function(e,t,a){return e+(a?"_":"")+t.toLowerCase()});function lf(e,t,a){return a&&typeof a!="number"&&zt(e,t,a)&&(t=a=i),a=a===i?me:a>>>0,a?(e=ut(e),e&&(typeof t=="string"||t!=null&&!Eo(t))&&(t=on(t),!t&&si(e))?Kn(vn(e),0,a):e.split(t,a)):[]}var uf=fi(function(e,t,a){return e+(a?" ":"")+Ao(t)});function cf(e,t,a){return e=ut(e),a=a==null?0:Xn(Xe(a),0,e.length),t=on(t),e.slice(a,a+t.length)==t}function df(e,t,a){var S=L.templateSettings;a&&zt(e,t,a)&&(t=i),e=ut(e),t=Tr({},t,S,la);var N=Tr({},t.imports,S.imports,la),F=kt(N),q=Or(N,F),z,X,le=0,ue=t.interpolate||Ne,he="__p += '",Ae=kr((t.escape||Ne).source+"|"+ue.source+"|"+(ue===vt?at:Ne).source+"|"+(t.evaluate||Ne).source+"|$","g"),De="//# sourceURL="+(dt.call(t,"sourceURL")?(t.sourceURL+"").replace(/\s/g," "):"lodash.templateSources["+ ++Tp+"]")+`
`;e.replace(Ae,function(Ue,nt,st,an,Yt,pn){return st||(st=an),he+=e.slice(le,pn).replace(ot,jp),nt&&(z=!0,he+=`' +
__e(`+nt+`) +
'`),Yt&&(X=!0,he+=`';
`+Yt+`;
__p += '`),st&&(he+=`' +
((__t = (`+st+`)) == null ? '' : __t) +
'`),le=pn+Ue.length,Ue}),he+=`';
`;var Ge=dt.call(t,"variable")&&t.variable;if(!Ge)he=`with (obj) {
`+he+`
}
`;else if(He.test(Ge))throw new Ke(o);he=(X?he.replace(Ce,""):he).replace(ke,"$1").replace(Re,"$1;"),he="function("+(Ge||"obj")+`) {
`+(Ge?"":`obj || (obj = {});
`)+"var __t, __p = ''"+(z?", __e = _.escape":"")+(X?`, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
`:`;
`)+he+`return __p
}`;var Ze=tp(function(){return pt(F,De+"return "+he).apply(i,q)});if(Ze.source=he,So(Ze))throw Ze;return Ze}function ff(e){return ut(e).toLowerCase()}function mf(e){return ut(e).toUpperCase()}function hf(e,t,a){if(e=ut(e),e&&(a||t===i))return us(e);if(!e||!(t=on(t)))return e;var S=vn(e),N=vn(t),F=cs(S,N),q=ds(S,N)+1;return Kn(S,F,q).join("")}function gf(e,t,a){if(e=ut(e),e&&(a||t===i))return e.slice(0,ms(e)+1);if(!e||!(t=on(t)))return e;var S=vn(e),N=ds(S,vn(t))+1;return Kn(S,0,N).join("")}function yf(e,t,a){if(e=ut(e),e&&(a||t===i))return e.replace(re,"");if(!e||!(t=on(t)))return e;var S=vn(e),N=cs(S,vn(t));return Kn(S,N).join("")}function vf(e,t){var a=M,S=B;if(wt(t)){var N="separator"in t?t.separator:N;a="length"in t?Xe(t.length):a,S="omission"in t?on(t.omission):S}e=ut(e);var F=e.length;if(si(e)){var q=vn(e);F=q.length}if(a>=F)return e;var z=a-ai(S);if(z<1)return S;var X=q?Kn(q,0,z).join(""):e.slice(0,z);if(N===i)return X+S;if(q&&(z+=X.length-z),Eo(N)){if(e.slice(z).search(N)){var le,ue=X;for(N.global||(N=kr(N.source,ut(Oe.exec(N))+"g")),N.lastIndex=0;le=N.exec(ue);)var he=le.index;X=X.slice(0,he===i?z:he)}}else if(e.indexOf(on(N),z)!=z){var Ae=X.lastIndexOf(N);Ae>-1&&(X=X.slice(0,Ae))}return X+S}function bf(e){return e=ut(e),e&&$e.test(e)?e.replace(xe,Vp):e}var Tf=fi(function(e,t,a){return e+(a?" ":"")+t.toUpperCase()}),Ao=na("toUpperCase");function ep(e,t,a){return e=ut(e),t=a?i:t,t===i?Up(e)?Jp(e):Mp(e):e.match(t)||[]}var tp=Qe(function(e,t){try{return nn(e,i,t)}catch(a){return So(a)?a:new Ke(a)}}),Sf=Mn(function(e,t){return un(t,function(a){a=_n(a),Nn(e,a,bo(e[a],e))}),e});function Ef(e){var t=e==null?0:e.length,a=je();return e=t?St(e,function(S){if(typeof S[1]!="function")throw new cn(l);return[a(S[0]),S[1]]}):[],Qe(function(S){for(var N=-1;++N<t;){var F=e[N];if(nn(F[0],this,S))return nn(F[1],this,S)}})}function Pf(e){return Vl(fn(e,g))}function _o(e){return function(){return e}}function wf(e,t){return e==null||e!==e?t:e}var Af=ra(),_f=ra(!0);function Qt(e){return e}function Io(e){return Ls(typeof e=="function"?e:fn(e,g))}function If(e){return Hs(fn(e,g))}function xf(e,t){return ks(e,fn(t,g))}var Rf=Qe(function(e,t){return function(a){return Ii(a,e,t)}}),Df=Qe(function(e,t){return function(a){return Ii(e,a,t)}});function xo(e,t,a){var S=kt(t),N=tr(t,S);a==null&&!(wt(t)&&(N.length||!S.length))&&(a=t,t=e,e=this,N=tr(t,kt(t)));var F=!(wt(a)&&"chain"in a)||!!a.chain,q=On(e);return un(N,function(z){var X=t[z];e[z]=X,q&&(e.prototype[z]=function(){var le=this.__chain__;if(F||le){var ue=e(this.__wrapped__),he=ue.__actions__=Jt(this.__actions__);return he.push({func:X,args:arguments,thisArg:e}),ue.__chain__=le,ue}return X.apply(e,jn([this.value()],arguments))})}),e}function Nf(){return Bt._===this&&(Bt._=nl),this}function Ro(){}function Cf(e){return e=Xe(e),Qe(function(t){return Fs(t,e)})}var Mf=oo(St),Lf=oo(os),Of=oo(Dr);function np(e){return fo(e)?Nr(_n(e)):uu(e)}function Hf(e){return function(t){return e==null?i:Zn(e,t)}}var kf=sa(),Ff=sa(!0);function Do(){return[]}function No(){return!1}function Bf(){return{}}function jf(){return""}function Gf(){return!0}function Uf(e,t){if(e=Xe(e),e<1||e>W)return[];var a=me,S=Ut(e,me);t=je(t),e-=me;for(var N=Lr(S,t);++a<e;)t(a);return N}function qf(e){return ze(e)?St(e,_n):sn(e)?[e]:Jt(Ea(ut(e)))}function $f(e){var t=++el;return ut(e)+t}var Wf=ar(function(e,t){return e+t},0),Kf=so("ceil"),Vf=ar(function(e,t){return e/t},1),zf=so("floor");function Yf(e){return e&&e.length?er(e,Qt,Wr):i}function Jf(e,t){return e&&e.length?er(e,je(t,2),Wr):i}function Xf(e){return ps(e,Qt)}function Zf(e,t){return ps(e,je(t,2))}function Qf(e){return e&&e.length?er(e,Qt,Yr):i}function em(e,t){return e&&e.length?er(e,je(t,2),Yr):i}var tm=ar(function(e,t){return e*t},1),nm=so("round"),im=ar(function(e,t){return e-t},0);function rm(e){return e&&e.length?Mr(e,Qt):0}function om(e,t){return e&&e.length?Mr(e,je(t,2)):0}return L.after=_0,L.ary=Ma,L.assign=fd,L.assignIn=Va,L.assignInWith=Tr,L.assignWith=md,L.at=hd,L.before=La,L.bind=bo,L.bindAll=Sf,L.bindKey=Oa,L.castArray=F0,L.chain=Da,L.chunk=Vu,L.compact=zu,L.concat=Yu,L.cond=Ef,L.conforms=Pf,L.constant=_o,L.countBy=i0,L.create=gd,L.curry=Ha,L.curryRight=ka,L.debounce=Fa,L.defaults=yd,L.defaultsDeep=vd,L.defer=I0,L.delay=x0,L.difference=Ju,L.differenceBy=Xu,L.differenceWith=Zu,L.drop=Qu,L.dropRight=ec,L.dropRightWhile=tc,L.dropWhile=nc,L.fill=ic,L.filter=o0,L.flatMap=p0,L.flatMapDeep=l0,L.flatMapDepth=u0,L.flatten=_a,L.flattenDeep=rc,L.flattenDepth=oc,L.flip=R0,L.flow=Af,L.flowRight=_f,L.fromPairs=sc,L.functions=Ad,L.functionsIn=_d,L.groupBy=c0,L.initial=pc,L.intersection=lc,L.intersectionBy=uc,L.intersectionWith=cc,L.invert=xd,L.invertBy=Rd,L.invokeMap=f0,L.iteratee=Io,L.keyBy=m0,L.keys=kt,L.keysIn=Zt,L.map=mr,L.mapKeys=Nd,L.mapValues=Cd,L.matches=If,L.matchesProperty=xf,L.memoize=gr,L.merge=Md,L.mergeWith=za,L.method=Rf,L.methodOf=Df,L.mixin=xo,L.negate=yr,L.nthArg=Cf,L.omit=Ld,L.omitBy=Od,L.once=D0,L.orderBy=h0,L.over=Mf,L.overArgs=N0,L.overEvery=Lf,L.overSome=Of,L.partial=To,L.partialRight=Ba,L.partition=g0,L.pick=Hd,L.pickBy=Ya,L.property=np,L.propertyOf=Hf,L.pull=hc,L.pullAll=xa,L.pullAllBy=gc,L.pullAllWith=yc,L.pullAt=vc,L.range=kf,L.rangeRight=Ff,L.rearg=C0,L.reject=b0,L.remove=bc,L.rest=M0,L.reverse=yo,L.sampleSize=S0,L.set=Fd,L.setWith=Bd,L.shuffle=E0,L.slice=Tc,L.sortBy=A0,L.sortedUniq=Ic,L.sortedUniqBy=xc,L.split=lf,L.spread=L0,L.tail=Rc,L.take=Dc,L.takeRight=Nc,L.takeRightWhile=Cc,L.takeWhile=Mc,L.tap=zc,L.throttle=O0,L.thru=fr,L.toArray=$a,L.toPairs=Ja,L.toPairsIn=Xa,L.toPath=qf,L.toPlainObject=Ka,L.transform=jd,L.unary=H0,L.union=Lc,L.unionBy=Oc,L.unionWith=Hc,L.uniq=kc,L.uniqBy=Fc,L.uniqWith=Bc,L.unset=Gd,L.unzip=vo,L.unzipWith=Ra,L.update=Ud,L.updateWith=qd,L.values=gi,L.valuesIn=$d,L.without=jc,L.words=ep,L.wrap=k0,L.xor=Gc,L.xorBy=Uc,L.xorWith=qc,L.zip=$c,L.zipObject=Wc,L.zipObjectDeep=Kc,L.zipWith=Vc,L.entries=Ja,L.entriesIn=Xa,L.extend=Va,L.extendWith=Tr,xo(L,L),L.add=Wf,L.attempt=tp,L.camelCase=zd,L.capitalize=Za,L.ceil=Kf,L.clamp=Wd,L.clone=B0,L.cloneDeep=G0,L.cloneDeepWith=U0,L.cloneWith=j0,L.conformsTo=q0,L.deburr=Qa,L.defaultTo=wf,L.divide=Vf,L.endsWith=Yd,L.eq=Tn,L.escape=Jd,L.escapeRegExp=Xd,L.every=r0,L.find=s0,L.findIndex=wa,L.findKey=bd,L.findLast=a0,L.findLastIndex=Aa,L.findLastKey=Td,L.floor=zf,L.forEach=Na,L.forEachRight=Ca,L.forIn=Sd,L.forInRight=Ed,L.forOwn=Pd,L.forOwnRight=wd,L.get=Po,L.gt=$0,L.gte=W0,L.has=Id,L.hasIn=wo,L.head=Ia,L.identity=Qt,L.includes=d0,L.indexOf=ac,L.inRange=Kd,L.invoke=Dd,L.isArguments=ti,L.isArray=ze,L.isArrayBuffer=K0,L.isArrayLike=Xt,L.isArrayLikeObject=xt,L.isBoolean=V0,L.isBuffer=Vn,L.isDate=z0,L.isElement=Y0,L.isEmpty=J0,L.isEqual=X0,L.isEqualWith=Z0,L.isError=So,L.isFinite=Q0,L.isFunction=On,L.isInteger=ja,L.isLength=vr,L.isMap=Ga,L.isMatch=ed,L.isMatchWith=td,L.isNaN=nd,L.isNative=id,L.isNil=od,L.isNull=rd,L.isNumber=Ua,L.isObject=wt,L.isObjectLike=At,L.isPlainObject=Mi,L.isRegExp=Eo,L.isSafeInteger=sd,L.isSet=qa,L.isString=br,L.isSymbol=sn,L.isTypedArray=hi,L.isUndefined=ad,L.isWeakMap=pd,L.isWeakSet=ld,L.join=dc,L.kebabCase=Zd,L.last=hn,L.lastIndexOf=fc,L.lowerCase=Qd,L.lowerFirst=ef,L.lt=ud,L.lte=cd,L.max=Yf,L.maxBy=Jf,L.mean=Xf,L.meanBy=Zf,L.min=Qf,L.minBy=em,L.stubArray=Do,L.stubFalse=No,L.stubObject=Bf,L.stubString=jf,L.stubTrue=Gf,L.multiply=tm,L.nth=mc,L.noConflict=Nf,L.noop=Ro,L.now=hr,L.pad=tf,L.padEnd=nf,L.padStart=rf,L.parseInt=of,L.random=Vd,L.reduce=y0,L.reduceRight=v0,L.repeat=sf,L.replace=af,L.result=kd,L.round=nm,L.runInContext=J,L.sample=T0,L.size=P0,L.snakeCase=pf,L.some=w0,L.sortedIndex=Sc,L.sortedIndexBy=Ec,L.sortedIndexOf=Pc,L.sortedLastIndex=wc,L.sortedLastIndexBy=Ac,L.sortedLastIndexOf=_c,L.startCase=uf,L.startsWith=cf,L.subtract=im,L.sum=rm,L.sumBy=om,L.template=df,L.times=Uf,L.toFinite=Hn,L.toInteger=Xe,L.toLength=Wa,L.toLower=ff,L.toNumber=gn,L.toSafeInteger=dd,L.toString=ut,L.toUpper=mf,L.trim=hf,L.trimEnd=gf,L.trimStart=yf,L.truncate=vf,L.unescape=bf,L.uniqueId=$f,L.upperCase=Tf,L.upperFirst=Ao,L.each=Na,L.eachRight=Ca,L.first=Ia,xo(L,function(){var e={};return wn(L,function(t,a){dt.call(L.prototype,a)||(e[a]=t)}),e}(),{chain:!1}),L.VERSION=n,un(["bind","bindKey","curry","curryRight","partial","partialRight"],function(e){L[e].placeholder=L}),un(["drop","take"],function(e,t){it.prototype[e]=function(a){a=a===i?1:Lt(Xe(a),0);var S=this.__filtered__&&!t?new it(this):this.clone();return S.__filtered__?S.__takeCount__=Ut(a,S.__takeCount__):S.__views__.push({size:Ut(a,me),type:e+(S.__dir__<0?"Right":"")}),S},it.prototype[e+"Right"]=function(a){return this.reverse()[e](a).reverse()}}),un(["filter","map","takeWhile"],function(e,t){var a=t+1,S=a==H||a==j;it.prototype[e]=function(N){var F=this.clone();return F.__iteratees__.push({iteratee:je(N,3),type:a}),F.__filtered__=F.__filtered__||S,F}}),un(["head","last"],function(e,t){var a="take"+(t?"Right":"");it.prototype[e]=function(){return this[a](1).value()[0]}}),un(["initial","tail"],function(e,t){var a="drop"+(t?"":"Right");it.prototype[e]=function(){return this.__filtered__?new it(this):this[a](1)}}),it.prototype.compact=function(){return this.filter(Qt)},it.prototype.find=function(e){return this.filter(e).head()},it.prototype.findLast=function(e){return this.reverse().find(e)},it.prototype.invokeMap=Qe(function(e,t){return typeof e=="function"?new it(this):this.map(function(a){return Ii(a,e,t)})}),it.prototype.reject=function(e){return this.filter(yr(je(e)))},it.prototype.slice=function(e,t){e=Xe(e);var a=this;return a.__filtered__&&(e>0||t<0)?new it(a):(e<0?a=a.takeRight(-e):e&&(a=a.drop(e)),t!==i&&(t=Xe(t),a=t<0?a.dropRight(-t):a.take(t-e)),a)},it.prototype.takeRightWhile=function(e){return this.reverse().takeWhile(e).reverse()},it.prototype.toArray=function(){return this.take(me)},wn(it.prototype,function(e,t){var a=/^(?:filter|find|map|reject)|While$/.test(t),S=/^(?:head|last)$/.test(t),N=L[S?"take"+(t=="last"?"Right":""):t],F=S||/^find/.test(t);!N||(L.prototype[t]=function(){var q=this.__wrapped__,z=S?[1]:arguments,X=q instanceof it,le=z[0],ue=X||ze(q),he=function(nt){var st=N.apply(L,jn([nt],z));return S&&Ae?st[0]:st};ue&&a&&typeof le=="function"&&le.length!=1&&(X=ue=!1);var Ae=this.__chain__,De=!!this.__actions__.length,Ge=F&&!Ae,Ze=X&&!De;if(!F&&ue){q=Ze?q:new it(this);var Ue=e.apply(q,z);return Ue.__actions__.push({func:fr,args:[he],thisArg:i}),new dn(Ue,Ae)}return Ge&&Ze?e.apply(this,z):(Ue=this.thru(he),Ge?S?Ue.value()[0]:Ue.value():Ue)})}),un(["pop","push","shift","sort","splice","unshift"],function(e){var t=Bi[e],a=/^(?:push|sort|unshift)$/.test(e)?"tap":"thru",S=/^(?:pop|shift)$/.test(e);L.prototype[e]=function(){var N=arguments;if(S&&!this.__chain__){var F=this.value();return t.apply(ze(F)?F:[],N)}return this[a](function(q){return t.apply(ze(q)?q:[],N)})}}),wn(it.prototype,function(e,t){var a=L[t];if(a){var S=a.name+"";dt.call(ui,S)||(ui[S]=[]),ui[S].push({name:t,func:a})}}),ui[sr(i,_).name]=[{name:"wrapper",func:i}],it.prototype.clone=vl,it.prototype.reverse=bl,it.prototype.value=Tl,L.prototype.at=Yc,L.prototype.chain=Jc,L.prototype.commit=Xc,L.prototype.next=Zc,L.prototype.plant=e0,L.prototype.reverse=t0,L.prototype.toJSON=L.prototype.valueOf=L.prototype.value=n0,L.prototype.first=L.prototype.head,Ti&&(L.prototype[Ti]=Qc),L},Fi=Xp();Bt._=Fi,m=function(){return Fi}.call(v,s,v,w),m!==i&&(w.exports=m)}).call(this)},7874:()=>{(function(w){var v="\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b",s={pattern:/(^(["']?)\w+\2)[ \t]+\S.*/,lookbehind:!0,alias:"punctuation",inside:null},m={bash:s,environment:{pattern:RegExp("\\$"+v),alias:"constant"},variable:[{pattern:/\$?\(\([\s\S]+?\)\)/,greedy:!0,inside:{variable:[{pattern:/(^\$\(\([\s\S]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,operator:/--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,greedy:!0,inside:{variable:/^\$\(|^`|\)$|`$/}},{pattern:/\$\{[^}]+\}/,greedy:!0,inside:{operator:/:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,punctuation:/[\[\]]/,environment:{pattern:RegExp("(\\{)"+v),lookbehind:!0,alias:"constant"}}},/\$(?:\w+|[#?*!@$])/],entity:/\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/};w.languages.bash={shebang:{pattern:/^#!\s*\/.*/,alias:"important"},comment:{pattern:/(^|[^"{\\$])#.*/,lookbehind:!0},"function-name":[{pattern:/(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,lookbehind:!0,alias:"function"},{pattern:/\b[\w-]+(?=\s*\(\s*\)\s*\{)/,alias:"function"}],"for-or-select":{pattern:/(\b(?:for|select)\s+)\w+(?=\s+in\s)/,alias:"variable",lookbehind:!0},"assign-left":{pattern:/(^|[\s;|&]|[<>]\()\w+(?=\+?=)/,inside:{environment:{pattern:RegExp("(^|[\\s;|&]|[<>]\\()"+v),lookbehind:!0,alias:"constant"}},alias:"variable",lookbehind:!0},string:[{pattern:/((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,lookbehind:!0,greedy:!0,inside:m},{pattern:/((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,lookbehind:!0,greedy:!0,inside:{bash:s}},{pattern:/(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,lookbehind:!0,greedy:!0,inside:m},{pattern:/(^|[^$\\])'[^']*'/,lookbehind:!0,greedy:!0},{pattern:/\$'(?:[^'\\]|\\[\s\S])*'/,greedy:!0,inside:{entity:m.entity}}],environment:{pattern:RegExp("\\$?"+v),alias:"constant"},variable:m.variable,function:{pattern:/(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,lookbehind:!0},keyword:{pattern:/(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,lookbehind:!0},builtin:{pattern:/(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,lookbehind:!0,alias:"class-name"},boolean:{pattern:/(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,lookbehind:!0},"file-descriptor":{pattern:/\B&\d\b/,alias:"important"},operator:{pattern:/\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,inside:{"file-descriptor":{pattern:/^\d/,alias:"important"}}},punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,number:{pattern:/(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,lookbehind:!0}},s.inside=w.languages.bash;for(var i=["comment","function-name","for-or-select","assign-left","string","environment","function","keyword","builtin","boolean","file-descriptor","operator","punctuation","number"],n=m.variable[1].inside,p=0;p<i.length;p++)n[i[p]]=w.languages.bash[i[p]];w.languages.shell=w.languages.bash})(Prism)},57:()=>{(function(w){function v(o){return RegExp("(^(?:"+o+"):[ 	]*(?![ 	]))[^]+","i")}w.languages.http={"request-line":{pattern:/^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,inside:{method:{pattern:/^[A-Z]+\b/,alias:"property"},"request-target":{pattern:/^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,lookbehind:!0,alias:"url",inside:w.languages.uri},"http-version":{pattern:/^(\s)HTTP\/[\d.]+/,lookbehind:!0,alias:"property"}}},"response-status":{pattern:/^HTTP\/[\d.]+ \d+ .+/m,inside:{"http-version":{pattern:/^HTTP\/[\d.]+/,alias:"property"},"status-code":{pattern:/^(\s)\d+(?=\s)/,lookbehind:!0,alias:"number"},"reason-phrase":{pattern:/^(\s).+/,lookbehind:!0,alias:"string"}}},header:{pattern:/^[\w-]+:.+(?:(?:\r\n?|\n)[ \t].+)*/m,inside:{"header-value":[{pattern:v(/Content-Security-Policy/.source),lookbehind:!0,alias:["csp","languages-csp"],inside:w.languages.csp},{pattern:v(/Public-Key-Pins(?:-Report-Only)?/.source),lookbehind:!0,alias:["hpkp","languages-hpkp"],inside:w.languages.hpkp},{pattern:v(/Strict-Transport-Security/.source),lookbehind:!0,alias:["hsts","languages-hsts"],inside:w.languages.hsts},{pattern:v(/[^:]+/.source),lookbehind:!0}],"header-name":{pattern:/^[^:]+/,alias:"keyword"},punctuation:/^:/}}};var s=w.languages,m={"application/javascript":s.javascript,"application/json":s.json||s.javascript,"application/xml":s.xml,"text/xml":s.xml,"text/html":s.html,"text/css":s.css,"text/plain":s.plain},i={"application/json":!0,"application/xml":!0};function n(o){var u=o.replace(/^[a-z]+\//,""),h="\\w+/(?:[\\w.-]+\\+)+"+u+"(?![+\\w.-])";return"(?:"+o+"|"+h+")"}var p;for(var c in m)if(m[c]){p=p||{};var l=i[c]?n(c):c;p[c.replace(/\//g,"-")]={pattern:RegExp("("+/content-type:\s*/.source+l+/(?:(?:\r\n?|\n)[\w-].*)*(?:\r(?:\n|(?!\n))|\n)/.source+")"+/[^ \t\w-][\s\S]*/.source,"i"),lookbehind:!0,inside:m[c]}}p&&w.languages.insertBefore("http","header",p)})(Prism)},4277:()=>{Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},Prism.languages.webmanifest=Prism.languages.json},366:()=>{Prism.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest=Prism.languages.python,Prism.languages.py=Prism.languages.python},5660:(w,v,s)=>{var m=typeof window!="undefined"?window:typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope?self:{};/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */var i=function(n){var p=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,c=0,l={},o={manual:n.Prism&&n.Prism.manual,disableWorkerMessageHandler:n.Prism&&n.Prism.disableWorkerMessageHandler,util:{encode:function P(x){return x instanceof u?new u(x.type,P(x.content),x.alias):Array.isArray(x)?x.map(P):x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(P){return Object.prototype.toString.call(P).slice(8,-1)},objId:function(P){return P.__id||Object.defineProperty(P,"__id",{value:++c}),P.__id},clone:function P(x,E){E=E||{};var A,I;switch(o.util.type(x)){case"Object":if(I=o.util.objId(x),E[I])return E[I];A={},E[I]=A;for(var R in x)x.hasOwnProperty(R)&&(A[R]=P(x[R],E));return A;case"Array":return I=o.util.objId(x),E[I]?E[I]:(A=[],E[I]=A,x.forEach(function(C,D){A[D]=P(C,E)}),A);default:return x}},getLanguage:function(P){for(;P;){var x=p.exec(P.className);if(x)return x[1].toLowerCase();P=P.parentElement}return"none"},setLanguage:function(P,x){P.className=P.className.replace(RegExp(p,"gi"),""),P.classList.add("language-"+x)},currentScript:function(){if(typeof document=="undefined")return null;if("currentScript"in document&&1<2)return document.currentScript;try{throw new Error}catch(A){var P=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(A.stack)||[])[1];if(P){var x=document.getElementsByTagName("script");for(var E in x)if(x[E].src==P)return x[E]}return null}},isActive:function(P,x,E){for(var A="no-"+x;P;){var I=P.classList;if(I.contains(x))return!0;if(I.contains(A))return!1;P=P.parentElement}return!!E}},languages:{plain:l,plaintext:l,text:l,txt:l,extend:function(P,x){var E=o.util.clone(o.languages[P]);for(var A in x)E[A]=x[A];return E},insertBefore:function(P,x,E,A){A=A||o.languages;var I=A[P],R={};for(var C in I)if(I.hasOwnProperty(C)){if(C==x)for(var D in E)E.hasOwnProperty(D)&&(R[D]=E[D]);E.hasOwnProperty(C)||(R[C]=I[C])}var M=A[P];return A[P]=R,o.languages.DFS(o.languages,function(B,k){k===M&&B!=P&&(this[B]=R)}),R},DFS:function P(x,E,A,I){I=I||{};var R=o.util.objId;for(var C in x)if(x.hasOwnProperty(C)){E.call(x,C,x[C],A||C);var D=x[C],M=o.util.type(D);M==="Object"&&!I[R(D)]?(I[R(D)]=!0,P(D,E,null,I)):M==="Array"&&!I[R(D)]&&(I[R(D)]=!0,P(D,E,C,I))}}},plugins:{},highlightAll:function(P,x){o.highlightAllUnder(document,P,x)},highlightAllUnder:function(P,x,E){var A={callback:E,container:P,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};o.hooks.run("before-highlightall",A),A.elements=Array.prototype.slice.apply(A.container.querySelectorAll(A.selector)),o.hooks.run("before-all-elements-highlight",A);for(var I=0,R;R=A.elements[I++];)o.highlightElement(R,x===!0,A.callback)},highlightElement:function(P,x,E){var A=o.util.getLanguage(P),I=o.languages[A];o.util.setLanguage(P,A);var R=P.parentElement;R&&R.nodeName.toLowerCase()==="pre"&&o.util.setLanguage(R,A);var C=P.textContent,D={element:P,language:A,grammar:I,code:C};function M(k){D.highlightedCode=k,o.hooks.run("before-insert",D),D.element.innerHTML=D.highlightedCode,o.hooks.run("after-highlight",D),o.hooks.run("complete",D),E&&E.call(D.element)}if(o.hooks.run("before-sanity-check",D),R=D.element.parentElement,R&&R.nodeName.toLowerCase()==="pre"&&!R.hasAttribute("tabindex")&&R.setAttribute("tabindex","0"),!D.code){o.hooks.run("complete",D),E&&E.call(D.element);return}if(o.hooks.run("before-highlight",D),!D.grammar){M(o.util.encode(D.code));return}if(x&&n.Worker){var B=new Worker(o.filename);B.onmessage=function(k){M(k.data)},B.postMessage(JSON.stringify({language:D.language,code:D.code,immediateClose:!0}))}else M(o.highlight(D.code,D.grammar,D.language))},highlight:function(P,x,E){var A={code:P,grammar:x,language:E};if(o.hooks.run("before-tokenize",A),!A.grammar)throw new Error('The language "'+A.language+'" has no grammar.');return A.tokens=o.tokenize(A.code,A.grammar),o.hooks.run("after-tokenize",A),u.stringify(o.util.encode(A.tokens),A.language)},tokenize:function(P,x){var E=x.rest;if(E){for(var A in E)x[A]=E[A];delete x.rest}var I=new g;return d(I,I.head,P),r(P,I,x,I.head,0),b(I)},hooks:{all:{},add:function(P,x){var E=o.hooks.all;E[P]=E[P]||[],E[P].push(x)},run:function(P,x){var E=o.hooks.all[P];if(!(!E||!E.length))for(var A=0,I;I=E[A++];)I(x)}},Token:u};n.Prism=o;function u(P,x,E,A){this.type=P,this.content=x,this.alias=E,this.length=(A||"").length|0}u.stringify=function P(x,E){if(typeof x=="string")return x;if(Array.isArray(x)){var A="";return x.forEach(function(M){A+=P(M,E)}),A}var I={type:x.type,content:P(x.content,E),tag:"span",classes:["token",x.type],attributes:{},language:E},R=x.alias;R&&(Array.isArray(R)?Array.prototype.push.apply(I.classes,R):I.classes.push(R)),o.hooks.run("wrap",I);var C="";for(var D in I.attributes)C+=" "+D+'="'+(I.attributes[D]||"").replace(/"/g,"&quot;")+'"';return"<"+I.tag+' class="'+I.classes.join(" ")+'"'+C+">"+I.content+"</"+I.tag+">"};function h(P,x,E,A){P.lastIndex=x;var I=P.exec(E);if(I&&A&&I[1]){var R=I[1].length;I.index+=R,I[0]=I[0].slice(R)}return I}function r(P,x,E,A,I,R){for(var C in E)if(!(!E.hasOwnProperty(C)||!E[C])){var D=E[C];D=Array.isArray(D)?D:[D];for(var M=0;M<D.length;++M){if(R&&R.cause==C+","+M)return;var B=D[M],k=B.inside,G=!!B.lookbehind,H=!!B.greedy,$=B.alias;if(H&&!B.pattern.global){var j=B.pattern.toString().match(/[imsuy]*$/)[0];B.pattern=RegExp(B.pattern.source,j+"g")}for(var K=B.pattern||B,W=A.next,te=I;W!==x.tail&&!(R&&te>=R.reach);te+=W.value.length,W=W.next){var ae=W.value;if(x.length>P.length)return;if(!(ae instanceof u)){var me=1,Q;if(H){if(Q=h(K,te,P,G),!Q||Q.index>=P.length)break;var gt=Q.index,ve=Q.index+Q[0].length,Ee=te;for(Ee+=W.value.length;gt>=Ee;)W=W.next,Ee+=W.value.length;if(Ee-=W.value.length,te=Ee,W.value instanceof u)continue;for(var We=W;We!==x.tail&&(Ee<ve||typeof We.value=="string");We=We.next)me++,Ee+=We.value.length;me--,ae=P.slice(te,Ee),Q.index-=te}else if(Q=h(K,0,ae,G),!Q)continue;var gt=Q.index,Nt=Q[0],Dt=ae.slice(0,gt),Ct=ae.slice(gt+Nt.length),$t=te+ae.length;R&&$t>R.reach&&(R.reach=$t);var qe=W.prev;Dt&&(qe=d(x,qe,Dt),te+=Dt.length),f(x,qe,me);var Ft=new u(C,k?o.tokenize(Nt,k):Nt,$,Nt);if(W=d(x,qe,Ft),Ct&&d(x,W,Ct),me>1){var Je={cause:C+","+M,reach:$t};r(P,x,E,W.prev,te,Je),R&&Je.reach>R.reach&&(R.reach=Je.reach)}}}}}}function g(){var P={value:null,prev:null,next:null},x={value:null,prev:P,next:null};P.next=x,this.head=P,this.tail=x,this.length=0}function d(P,x,E){var A=x.next,I={value:E,prev:x,next:A};return x.next=I,A.prev=I,P.length++,I}function f(P,x,E){for(var A=x.next,I=0;I<E&&A!==P.tail;I++)A=A.next;x.next=A,A.prev=x,P.length-=I}function b(P){for(var x=[],E=P.head.next;E!==P.tail;)x.push(E.value),E=E.next;return x}if(!n.document)return n.addEventListener&&(o.disableWorkerMessageHandler||n.addEventListener("message",function(P){var x=JSON.parse(P.data),E=x.language,A=x.code,I=x.immediateClose;n.postMessage(o.highlight(A,o.languages[E],E)),I&&n.close()},!1)),o;var y=o.util.currentScript();y&&(o.filename=y.src,y.hasAttribute("data-manual")&&(o.manual=!0));function T(){o.manual||o.highlightAll()}if(!o.manual){var _=document.readyState;_==="loading"||_==="interactive"&&y&&y.defer?document.addEventListener("DOMContentLoaded",T):window.requestAnimationFrame?window.requestAnimationFrame(T):window.setTimeout(T,16)}return o}(m);w.exports&&(w.exports=i),typeof s.g!="undefined"&&(s.g.Prism=i),i.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},i.languages.markup.tag.inside["attr-value"].inside.entity=i.languages.markup.entity,i.languages.markup.doctype.inside["internal-subset"].inside=i.languages.markup,i.hooks.add("wrap",function(n){n.type==="entity"&&(n.attributes.title=n.content.replace(/&amp;/,"&"))}),Object.defineProperty(i.languages.markup.tag,"addInlined",{value:function(p,c){var l={};l["language-"+c]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:i.languages[c]},l.cdata=/^<!\[CDATA\[|\]\]>$/i;var o={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:l}};o["language-"+c]={pattern:/[\s\S]+/,inside:i.languages[c]};var u={};u[p]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return p}),"i"),lookbehind:!0,greedy:!0,inside:o},i.languages.insertBefore("markup","cdata",u)}}),Object.defineProperty(i.languages.markup.tag,"addAttribute",{value:function(n,p){i.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+n+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[p,"language-"+p],inside:i.languages[p]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),i.languages.html=i.languages.markup,i.languages.mathml=i.languages.markup,i.languages.svg=i.languages.markup,i.languages.xml=i.languages.extend("markup",{}),i.languages.ssml=i.languages.xml,i.languages.atom=i.languages.xml,i.languages.rss=i.languages.xml,function(n){var p=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;n.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+p.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+p.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+p.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:p,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},n.languages.css.atrule.inside.rest=n.languages.css;var c=n.languages.markup;c&&(c.tag.addInlined("style","css"),c.tag.addAttribute("style","css"))}(i),i.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},i.languages.javascript=i.languages.extend("clike",{"class-name":[i.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),i.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,i.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:i.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:i.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:i.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:i.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:i.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),i.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:i.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),i.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),i.languages.markup&&(i.languages.markup.tag.addInlined("script","javascript"),i.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),i.languages.js=i.languages.javascript,function(){if(typeof i=="undefined"||typeof document=="undefined")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var n="Loading\u2026",p=function(y,T){return"\u2716 Error "+y+" while fetching file: "+T},c="\u2716 Error: File does not exist or is empty",l={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},o="data-src-status",u="loading",h="loaded",r="failed",g="pre[data-src]:not(["+o+'="'+h+'"]):not(['+o+'="'+u+'"])';function d(y,T,_){var P=new XMLHttpRequest;P.open("GET",y,!0),P.onreadystatechange=function(){P.readyState==4&&(P.status<400&&P.responseText?T(P.responseText):P.status>=400?_(p(P.status,P.statusText)):_(c))},P.send(null)}function f(y){var T=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(y||"");if(T){var _=Number(T[1]),P=T[2],x=T[3];return P?x?[_,Number(x)]:[_,void 0]:[_,_]}}i.hooks.add("before-highlightall",function(y){y.selector+=", "+g}),i.hooks.add("before-sanity-check",function(y){var T=y.element;if(T.matches(g)){y.code="",T.setAttribute(o,u);var _=T.appendChild(document.createElement("CODE"));_.textContent=n;var P=T.getAttribute("data-src"),x=y.language;if(x==="none"){var E=(/\.(\w+)$/.exec(P)||[,"none"])[1];x=l[E]||E}i.util.setLanguage(_,x),i.util.setLanguage(T,x);var A=i.plugins.autoloader;A&&A.loadLanguages(x),d(P,function(I){T.setAttribute(o,h);var R=f(T.getAttribute("data-range"));if(R){var C=I.split(/\r\n?|\n/g),D=R[0],M=R[1]==null?C.length:R[1];D<0&&(D+=C.length),D=Math.max(0,Math.min(D-1,C.length)),M<0&&(M+=C.length),M=Math.max(0,Math.min(M,C.length)),I=C.slice(D,M).join(`
`),T.hasAttribute("data-start")||T.setAttribute("data-start",String(D+1))}_.textContent=I,i.highlightElement(_)},function(I){T.setAttribute(o,r),_.textContent=I})}}),i.plugins.fileHighlight={highlight:function(T){for(var _=(T||document).querySelectorAll(g),P=0,x;x=_[P++];)i.highlightElement(x)}};var b=!1;i.fileHighlight=function(){b||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),b=!0),i.plugins.fileHighlight.highlight.apply(this,arguments)}}()},7129:(w,v)=>{"use strict";var s=Object.prototype.hasOwnProperty,m;function i(l){try{return decodeURIComponent(l.replace(/\+/g," "))}catch(o){return null}}function n(l){try{return encodeURIComponent(l)}catch(o){return null}}function p(l){for(var o=/([^=?#&]+)=?([^&]*)/g,u={},h;h=o.exec(l);){var r=i(h[1]),g=i(h[2]);r===null||g===null||r in u||(u[r]=g)}return u}function c(l,o){o=o||"";var u=[],h,r;typeof o!="string"&&(o="?");for(r in l)if(s.call(l,r)){if(h=l[r],!h&&(h===null||h===m||isNaN(h))&&(h=""),r=n(r),h=n(h),r===null||h===null)continue;u.push(r+"="+h)}return u.length?o+u.join("&"):""}v.stringify=c,v.parse=p},7418:w=>{"use strict";w.exports=function(s,m){if(m=m.split(":")[0],s=+s,!s)return!1;switch(m){case"http":case"ws":return s!==80;case"https":case"wss":return s!==443;case"ftp":return s!==21;case"gopher":return s!==70;case"file":return!1}return s!==0}},4564:(w,v,s)=>{"use strict";var m=s(7418),i=s(7129),n=/^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,p=/[\n\r\t]/g,c=/^[A-Za-z][A-Za-z0-9+-.]*:\/\//,l=/:\d+$/,o=/^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,u=/^[a-zA-Z]:/;function h(x){return(x||"").toString().replace(n,"")}var r=[["#","hash"],["?","query"],function(E,A){return f(A.protocol)?E.replace(/\\/g,"/"):E},["/","pathname"],["@","auth",1],[NaN,"host",void 0,1,1],[/:(\d*)$/,"port",void 0,1],[NaN,"hostname",void 0,1,1]],g={hash:1,query:1};function d(x){var E;typeof window!="undefined"?E=window:typeof s.g!="undefined"?E=s.g:typeof self!="undefined"?E=self:E={};var A=E.location||{};x=x||A;var I={},R=typeof x,C;if(x.protocol==="blob:")I=new T(unescape(x.pathname),{});else if(R==="string"){I=new T(x,{});for(C in g)delete I[C]}else if(R==="object"){for(C in x)C in g||(I[C]=x[C]);I.slashes===void 0&&(I.slashes=c.test(x.href))}return I}function f(x){return x==="file:"||x==="ftp:"||x==="http:"||x==="https:"||x==="ws:"||x==="wss:"}function b(x,E){x=h(x),x=x.replace(p,""),E=E||{};var A=o.exec(x),I=A[1]?A[1].toLowerCase():"",R=!!A[2],C=!!A[3],D=0,M;return R?C?(M=A[2]+A[3]+A[4],D=A[2].length+A[3].length):(M=A[2]+A[4],D=A[2].length):C?(M=A[3]+A[4],D=A[3].length):M=A[4],I==="file:"?D>=2&&(M=M.slice(2)):f(I)?M=A[4]:I?R&&(M=M.slice(2)):D>=2&&f(E.protocol)&&(M=A[4]),{protocol:I,slashes:R||f(I),slashesCount:D,rest:M}}function y(x,E){if(x==="")return E;for(var A=(E||"/").split("/").slice(0,-1).concat(x.split("/")),I=A.length,R=A[I-1],C=!1,D=0;I--;)A[I]==="."?A.splice(I,1):A[I]===".."?(A.splice(I,1),D++):D&&(I===0&&(C=!0),A.splice(I,1),D--);return C&&A.unshift(""),(R==="."||R==="..")&&A.push(""),A.join("/")}function T(x,E,A){if(x=h(x),x=x.replace(p,""),!(this instanceof T))return new T(x,E,A);var I,R,C,D,M,B,k=r.slice(),G=typeof E,H=this,$=0;for(G!=="object"&&G!=="string"&&(A=E,E=null),A&&typeof A!="function"&&(A=i.parse),E=d(E),R=b(x||"",E),I=!R.protocol&&!R.slashes,H.slashes=R.slashes||I&&E.slashes,H.protocol=R.protocol||E.protocol||"",x=R.rest,(R.protocol==="file:"&&(R.slashesCount!==2||u.test(x))||!R.slashes&&(R.protocol||R.slashesCount<2||!f(H.protocol)))&&(k[3]=[/(.*)/,"pathname"]);$<k.length;$++){if(D=k[$],typeof D=="function"){x=D(x,H);continue}C=D[0],B=D[1],C!==C?H[B]=x:typeof C=="string"?(M=C==="@"?x.lastIndexOf(C):x.indexOf(C),~M&&(typeof D[2]=="number"?(H[B]=x.slice(0,M),x=x.slice(M+D[2])):(H[B]=x.slice(M),x=x.slice(0,M)))):(M=C.exec(x))&&(H[B]=M[1],x=x.slice(0,M.index)),H[B]=H[B]||I&&D[3]&&E[B]||"",D[4]&&(H[B]=H[B].toLowerCase())}A&&(H.query=A(H.query)),I&&E.slashes&&H.pathname.charAt(0)!=="/"&&(H.pathname!==""||E.pathname!=="")&&(H.pathname=y(H.pathname,E.pathname)),H.pathname.charAt(0)!=="/"&&f(H.protocol)&&(H.pathname="/"+H.pathname),m(H.port,H.protocol)||(H.host=H.hostname,H.port=""),H.username=H.password="",H.auth&&(M=H.auth.indexOf(":"),~M?(H.username=H.auth.slice(0,M),H.username=encodeURIComponent(decodeURIComponent(H.username)),H.password=H.auth.slice(M+1),H.password=encodeURIComponent(decodeURIComponent(H.password))):H.username=encodeURIComponent(decodeURIComponent(H.auth)),H.auth=H.password?H.username+":"+H.password:H.username),H.origin=H.protocol!=="file:"&&f(H.protocol)&&H.host?H.protocol+"//"+H.host:"null",H.href=H.toString()}function _(x,E,A){var I=this;switch(x){case"query":typeof E=="string"&&E.length&&(E=(A||i.parse)(E)),I[x]=E;break;case"port":I[x]=E,m(E,I.protocol)?E&&(I.host=I.hostname+":"+E):(I.host=I.hostname,I[x]="");break;case"hostname":I[x]=E,I.port&&(E+=":"+I.port),I.host=E;break;case"host":I[x]=E,l.test(E)?(E=E.split(":"),I.port=E.pop(),I.hostname=E.join(":")):(I.hostname=E,I.port="");break;case"protocol":I.protocol=E.toLowerCase(),I.slashes=!A;break;case"pathname":case"hash":if(E){var R=x==="pathname"?"/":"#";I[x]=E.charAt(0)!==R?R+E:E}else I[x]=E;break;case"username":case"password":I[x]=encodeURIComponent(E);break;case"auth":var C=E.indexOf(":");~C?(I.username=E.slice(0,C),I.username=encodeURIComponent(decodeURIComponent(I.username)),I.password=E.slice(C+1),I.password=encodeURIComponent(decodeURIComponent(I.password))):I.username=encodeURIComponent(decodeURIComponent(E))}for(var D=0;D<r.length;D++){var M=r[D];M[4]&&(I[M[1]]=I[M[1]].toLowerCase())}return I.auth=I.password?I.username+":"+I.password:I.username,I.origin=I.protocol!=="file:"&&f(I.protocol)&&I.host?I.protocol+"//"+I.host:"null",I.href=I.toString(),I}function P(x){(!x||typeof x!="function")&&(x=i.stringify);var E,A=this,I=A.host,R=A.protocol;R&&R.charAt(R.length-1)!==":"&&(R+=":");var C=R+(A.protocol&&A.slashes||f(A.protocol)?"//":"");return A.username?(C+=A.username,A.password&&(C+=":"+A.password),C+="@"):A.password?(C+=":"+A.password,C+="@"):A.protocol!=="file:"&&f(A.protocol)&&!I&&A.pathname!=="/"&&(C+="@"),(I[I.length-1]===":"||l.test(A.hostname)&&!A.port)&&(I+=":"),C+=I+A.pathname,E=typeof A.query=="object"?x(A.query):A.query,E&&(C+=E.charAt(0)!=="?"?"?"+E:E),A.hash&&(C+=A.hash),C}T.prototype={set:_,toString:P},T.extractProtocol=b,T.location=d,T.trimLeft=h,T.qs=i,w.exports=T}},Co={};function ct(w){var v=Co[w];if(v!==void 0)return v.exports;var s=Co[w]={id:w,loaded:!1,exports:{}};return rp[w].call(s.exports,s,s.exports,ct),s.loaded=!0,s.exports}ct.n=w=>{var v=w&&w.__esModule?()=>w.default:()=>w;return ct.d(v,{a:v}),v},ct.d=(w,v)=>{for(var s in v)ct.o(v,s)&&!ct.o(w,s)&&Object.defineProperty(w,s,{enumerable:!0,get:v[s]})},ct.g=function(){if(typeof globalThis=="object")return globalThis;try{return this||new Function("return this")()}catch(w){if(typeof window=="object")return window}}(),ct.o=(w,v)=>Object.prototype.hasOwnProperty.call(w,v),ct.nmd=w=>(w.paths=[],w.children||(w.children=[]),w);var sm={};(()=>{var Ht;"use strict";var w=ct(4002),v=ct.n(w),s=ct(6486),m=ct(7154),i=ct.n(m),n=ct(177),p=ct.n(n),c=ct(9737),l=ct(6278),o=ct(6927),u=ct(3497),h=ct(7814),r=ct(5660),g=ct.n(r),d=ct(7874),f=ct(4277),b=ct(57),y=ct(366),T=ct(4564);function _(fe){for(var Z=[],de=0;de<fe.length;){var _e=fe[de];if(_e==="*"||_e==="+"||_e==="?"){Z.push({type:"MODIFIER",index:de,value:fe[de++]});continue}if(_e==="\\"){Z.push({type:"ESCAPED_CHAR",index:de++,value:fe[de++]});continue}if(_e==="{"){Z.push({type:"OPEN",index:de,value:fe[de++]});continue}if(_e==="}"){Z.push({type:"CLOSE",index:de,value:fe[de++]});continue}if(_e===":"){for(var ne="",ge=de+1;ge<fe.length;){var ce=fe.charCodeAt(ge);if(ce>=48&&ce<=57||ce>=65&&ce<=90||ce>=97&&ce<=122||ce===95){ne+=fe[ge++];continue}break}if(!ne)throw new TypeError("Missing parameter name at "+de);Z.push({type:"NAME",index:de,value:ne}),de=ge;continue}if(_e==="("){var Te=1,Ce="",ge=de+1;if(fe[ge]==="?")throw new TypeError('Pattern cannot start with "?" at '+ge);for(;ge<fe.length;){if(fe[ge]==="\\"){Ce+=fe[ge++]+fe[ge++];continue}if(fe[ge]===")"){if(Te--,Te===0){ge++;break}}else if(fe[ge]==="("&&(Te++,fe[ge+1]!=="?"))throw new TypeError("Capturing groups are not allowed at "+ge);Ce+=fe[ge++]}if(Te)throw new TypeError("Unbalanced pattern at "+de);if(!Ce)throw new TypeError("Missing pattern at "+de);Z.push({type:"PATTERN",index:de,value:Ce}),de=ge;continue}Z.push({type:"CHAR",index:de,value:fe[de++]})}return Z.push({type:"END",index:de,value:""}),Z}function P(fe,Z){Z===void 0&&(Z={});for(var de=_(fe),_e=Z.prefixes,ne=_e===void 0?"./":_e,ge="[^"+R(Z.delimiter||"/#?")+"]+?",ce=[],Te=0,Ce=0,ke="",Re=function(Y){if(Ce<de.length&&de[Ce].type===Y)return de[Ce++].value},xe=function(Y){var re=Re(Y);if(re!==void 0)return re;var se=de[Ce],be=se.type,Pe=se.index;throw new TypeError("Unexpected "+be+" at "+Pe+", expected "+Y)},Fe=function(){for(var Y="",re;re=Re("CHAR")||Re("ESCAPED_CHAR");)Y+=re;return Y};Ce<de.length;){var $e=Re("CHAR"),rt=Re("NAME"),_t=Re("PATTERN");if(rt||_t){var Ve=$e||"";ne.indexOf(Ve)===-1&&(ke+=Ve,Ve=""),ke&&(ce.push(ke),ke=""),ce.push({name:rt||Te++,prefix:Ve,suffix:"",pattern:_t||ge,modifier:Re("MODIFIER")||""});continue}var vt=$e||Re("ESCAPED_CHAR");if(vt){ke+=vt;continue}ke&&(ce.push(ke),ke="");var O=Re("OPEN");if(O){var Ve=Fe(),U=Re("NAME")||"",V=Re("PATTERN")||"",ie=Fe();xe("CLOSE"),ce.push({name:U||(V?Te++:""),pattern:U&&!V?ge:V,prefix:Ve,suffix:ie,modifier:Re("MODIFIER")||""});continue}xe("END")}return ce}function x(fe,Z){return E(P(fe,Z),Z)}function E(fe,Z){Z===void 0&&(Z={});var de=C(Z),_e=Z.encode,ne=_e===void 0?function(Ce){return Ce}:_e,ge=Z.validate,ce=ge===void 0?!0:ge,Te=fe.map(function(Ce){if(typeof Ce=="object")return new RegExp("^(?:"+Ce.pattern+")$",de)});return function(Ce){for(var ke="",Re=0;Re<fe.length;Re++){var xe=fe[Re];if(typeof xe=="string"){ke+=xe;continue}var Fe=Ce?Ce[xe.name]:void 0,$e=xe.modifier==="?"||xe.modifier==="*",rt=xe.modifier==="*"||xe.modifier==="+";if(Array.isArray(Fe)){if(!rt)throw new TypeError('Expected "'+xe.name+'" to not repeat, but got an array');if(Fe.length===0){if($e)continue;throw new TypeError('Expected "'+xe.name+'" to not be empty')}for(var _t=0;_t<Fe.length;_t++){var Ve=ne(Fe[_t],xe);if(ce&&!Te[Re].test(Ve))throw new TypeError('Expected all "'+xe.name+'" to match "'+xe.pattern+'", but got "'+Ve+'"');ke+=xe.prefix+Ve+xe.suffix}continue}if(typeof Fe=="string"||typeof Fe=="number"){var Ve=ne(String(Fe),xe);if(ce&&!Te[Re].test(Ve))throw new TypeError('Expected "'+xe.name+'" to match "'+xe.pattern+'", but got "'+Ve+'"');ke+=xe.prefix+Ve+xe.suffix;continue}if(!$e){var vt=rt?"an array":"a string";throw new TypeError('Expected "'+xe.name+'" to be '+vt)}}return ke}}function A(fe,Z){var de=[],_e=G(fe,de,Z);return I(_e,de,Z)}function I(fe,Z,de){de===void 0&&(de={});var _e=de.decode,ne=_e===void 0?function(ge){return ge}:_e;return function(ge){var ce=fe.exec(ge);if(!ce)return!1;for(var Te=ce[0],Ce=ce.index,ke=Object.create(null),Re=function(Fe){if(ce[Fe]===void 0)return"continue";var $e=Z[Fe-1];$e.modifier==="*"||$e.modifier==="+"?ke[$e.name]=ce[Fe].split($e.prefix+$e.suffix).map(function(rt){return ne(rt,$e)}):ke[$e.name]=ne(ce[Fe],$e)},xe=1;xe<ce.length;xe++)Re(xe);return{path:Te,index:Ce,params:ke}}}function R(fe){return fe.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function C(fe){return fe&&fe.sensitive?"":"i"}function D(fe,Z){if(!Z)return fe;for(var de=/\((?:\?<(.*?)>)?(?!\?)/g,_e=0,ne=de.exec(fe.source);ne;)Z.push({name:ne[1]||_e++,prefix:"",suffix:"",modifier:"",pattern:""}),ne=de.exec(fe.source);return fe}function M(fe,Z,de){var _e=fe.map(function(ne){return G(ne,Z,de).source});return new RegExp("(?:"+_e.join("|")+")",C(de))}function B(fe,Z,de){return k(P(fe,de),Z,de)}function k(fe,Z,de){de===void 0&&(de={});for(var _e=de.strict,ne=_e===void 0?!1:_e,ge=de.start,ce=ge===void 0?!0:ge,Te=de.end,Ce=Te===void 0?!0:Te,ke=de.encode,Re=ke===void 0?function(Y){return Y}:ke,xe="["+R(de.endsWith||"")+"]|$",Fe="["+R(de.delimiter||"/#?")+"]",$e=ce?"^":"",rt=0,_t=fe;rt<_t.length;rt++){var Ve=_t[rt];if(typeof Ve=="string")$e+=R(Re(Ve));else{var vt=R(Re(Ve.prefix)),O=R(Re(Ve.suffix));if(Ve.pattern)if(Z&&Z.push(Ve),vt||O)if(Ve.modifier==="+"||Ve.modifier==="*"){var U=Ve.modifier==="*"?"?":"";$e+="(?:"+vt+"((?:"+Ve.pattern+")(?:"+O+vt+"(?:"+Ve.pattern+"))*)"+O+")"+U}else $e+="(?:"+vt+"("+Ve.pattern+")"+O+")"+Ve.modifier;else $e+="("+Ve.pattern+")"+Ve.modifier;else $e+="(?:"+vt+O+")"+Ve.modifier}}if(Ce)ne||($e+=Fe+"?"),$e+=de.endsWith?"(?="+xe+")":"$";else{var V=fe[fe.length-1],ie=typeof V=="string"?Fe.indexOf(V[V.length-1])>-1:V===void 0;ne||($e+="(?:"+Fe+"(?="+xe+"))?"),ie||($e+="(?="+Fe+"|"+xe+")")}return new RegExp($e,C(de))}function G(fe,Z,de){return fe instanceof RegExp?D(fe,Z):Array.isArray(fe)?M(fe,Z,de):B(fe,Z,de)}class H{hydrate(Z,de){const _e=Z,ne=new T(Z),ge=[];return G(ne.pathname,ge),ge.forEach(ce=>{Z=Z.replace(":"+ce.name,encodeURIComponent(de[ce.name]))}),Z+=Z.indexOf("?")===-1?"?":"&",Object.keys(de).forEach(ce=>{_e.indexOf(":"+ce)===-1&&(Z+=ce+"="+encodeURIComponent(de[ce])+"&")}),Z.replace(/[?&]$/,"")}}function $(){v()(".sample-request-send").off("click"),v()(".sample-request-send").on("click",function(fe){fe.preventDefault();const Z=v()(this).parents("article"),de=Z.data("group"),_e=Z.data("name"),ne=Z.data("version");te(de,_e,ne,v()(this).data("type"))}),v()(".sample-request-clear").off("click"),v()(".sample-request-clear").on("click",function(fe){fe.preventDefault();const Z=v()(this).parents("article"),de=Z.data("group"),_e=Z.data("name"),ne=Z.data("version");ae(de,_e,ne)})}function j(fe){return fe.replace(/{(.+?)}/g,":$1")}function K(fe,Z){const de=fe.find(".sample-request-url").val(),_e=new H,ne=j(de);return _e.hydrate(ne,Z)}function W(fe){const Z={};["header","query","body"].forEach(_e=>{const ne={};try{fe.find(v()(`[data-family="${_e}"]:visible`)).each((ge,ce)=>{const Te=ce.dataset.name;let Ce=ce.value;if(ce.type==="checkbox")if(ce.checked)Ce="on";else return!0;if(!Ce&&!ce.dataset.optional&&ce.type!=="checkbox")return v()(ce).addClass("border-danger"),!0;ne[Te]=Ce})}catch(ge){return}Z[_e]=ne});const de=fe.find(v()('[data-family="body-json"]'));return de.is(":visible")?(Z.body=de.val(),Z.header["Content-Type"]="application/json"):Z.header["Content-Type"]="multipart/form-data",Z}function te(fe,Z,de,_e){const ne=v()(`article[data-group="${fe}"][data-name="${Z}"][data-version="${de}"]`),ge=W(ne),ce={};if(ce.url=K(ne,ge.query),ce.headers=ge.header,ce.headers["Content-Type"]==="application/json")ce.data=ge.body;else if(ce.headers["Content-Type"]==="multipart/form-data"){const ke=new FormData;for(const[Re,xe]of Object.entries(ge.body))ke.append(Re,xe);ce.data=ke,ce.processData=!1,(_e==="get"||_e==="delete")&&delete ce.headers["Content-Type"]}ce.type=_e,ce.success=Te,ce.error=Ce,v().ajax(ce),ne.find(".sample-request-response").fadeTo(200,1),ne.find(".sample-request-response-json").html("Loading...");function Te(ke,Re,xe){let Fe;try{Fe=JSON.parse(xe.responseText),Fe=JSON.stringify(Fe,null,4)}catch($e){Fe=xe.responseText}ne.find(".sample-request-response-json").text(Fe),g().highlightAll()}function Ce(ke,Re,xe){let Fe="Error "+ke.status+": "+xe,$e;try{$e=JSON.parse(ke.responseText),$e=JSON.stringify($e,null,4)}catch(rt){$e=ke.responseText}$e&&(Fe+=`
`+$e),ne.find(".sample-request-response").is(":visible")&&ne.find(".sample-request-response").fadeTo(1,.1),ne.find(".sample-request-response").fadeTo(250,1),ne.find(".sample-request-response-json").text(Fe),g().highlightAll()}}function ae(fe,Z,de){const _e=v()('article[data-group="'+fe+'"][data-name="'+Z+'"][data-version="'+de+'"]');_e.find(".sample-request-response-json").html(""),_e.find(".sample-request-response").hide(),_e.find(".sample-request-input").each((ge,ce)=>{ce.value=ce.placeholder!==ce.dataset.name?ce.placeholder:""});const ne=_e.find(".sample-request-url");ne.val(ne.prop("defaultValue"))}const Wt={ca:{"Allowed values:":"Valors permesos:","Compare all with predecessor":"Comparar tot amb versi\xF3 anterior","compare changes to:":"comparar canvis amb:","compared to":"comparat amb","Default value:":"Valor per defecte:",Description:"Descripci\xF3",Field:"Camp",General:"General","Generated with":"Generat amb",Name:"Nom","No response values.":"Sense valors en la resposta.",optional:"opcional",Parameter:"Par\xE0metre","Permission:":"Permisos:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3 d'exemple","show up to version:":"mostrar versi\xF3:","Size range:":"Tamany de rang:",Type:"Tipus",url:"url"},cs:{"Allowed values:":"Povolen\xE9 hodnoty:","Compare all with predecessor":"Porovnat v\u0161e s p\u0159edchoz\xEDmi verzemi","compare changes to:":"porovnat zm\u011Bny s:","compared to":"porovnat s","Default value:":"V\xFDchoz\xED hodnota:",Description:"Popis",Field:"Pole",General:"Obecn\xE9","Generated with":"Vygenerov\xE1no pomoc\xED",Name:"N\xE1zev","No response values.":"Nebyly vr\xE1ceny \u017E\xE1dn\xE9 hodnoty.",optional:"voliteln\xE9",Parameter:"Parametr","Permission:":"Opr\xE1vn\u011Bn\xED:",Response:"Odpov\u011B\u010F",Send:"Odeslat","Send a Sample Request":"Odeslat uk\xE1zkov\xFD po\u017Eadavek","show up to version:":"zobrazit po verzi:","Size range:":"Rozsah velikosti:",Type:"Typ",url:"url"},de:{"Allowed values:":"Erlaubte Werte:","Compare all with predecessor":"Vergleiche alle mit ihren Vorg\xE4ngern","compare changes to:":"vergleiche \xC4nderungen mit:","compared to":"verglichen mit","Default value:":"Standardwert:",Description:"Beschreibung",Field:"Feld",General:"Allgemein","Generated with":"Erstellt mit",Name:"Name","No response values.":"Keine R\xFCckgabewerte.",optional:"optional",Parameter:"Parameter","Permission:":"Berechtigung:",Response:"Antwort",Send:"Senden","Send a Sample Request":"Eine Beispielanfrage senden","show up to version:":"zeige bis zur Version:","Size range:":"Gr\xF6\xDFenbereich:",Type:"Typ",url:"url"},es:{"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Comparar todo con versi\xF3n anterior","compare changes to:":"comparar cambios con:","compared to":"comparado con","Default value:":"Valor por defecto:",Description:"Descripci\xF3n",Field:"Campo",General:"General","Generated with":"Generado con",Name:"Nombre","No response values.":"Sin valores en la respuesta.",optional:"opcional",Parameter:"Par\xE1metro","Permission:":"Permisos:",Response:"Respuesta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3n de ejemplo","show up to version:":"mostrar a versi\xF3n:","Size range:":"Tama\xF1o de rango:",Type:"Tipo",url:"url"},en:{},fr:{"Allowed values:":"Valeurs autoris\xE9es :",Body:"Corps","Compare all with predecessor":"Tout comparer avec ...","compare changes to:":"comparer les changements \xE0 :","compared to":"comparer \xE0","Default value:":"Valeur par d\xE9faut :",Description:"Description",Field:"Champ",General:"G\xE9n\xE9ral","Generated with":"G\xE9n\xE9r\xE9 avec",Header:"En-t\xEAte",Headers:"En-t\xEAtes",Name:"Nom","No response values.":"Aucune valeur de r\xE9ponse.","No value":"Aucune valeur",optional:"optionnel",Parameter:"Param\xE8tre",Parameters:"Param\xE8tres","Permission:":"Permission :","Query Parameter(s)":"Param\xE8tre(s) de la requ\xEAte","Query Parameters":"Param\xE8tres de la requ\xEAte","Request Body":"Corps de la requ\xEAte",required:"requis",Response:"R\xE9ponse",Send:"Envoyer","Send a Sample Request":"Envoyer une requ\xEAte repr\xE9sentative","show up to version:":"Montrer \xE0 partir de la version :","Size range:":"Ordre de grandeur :",Type:"Type",url:"url"},it:{"Allowed values:":"Valori permessi:","Compare all with predecessor":"Confronta tutto con versioni precedenti","compare changes to:":"confronta modifiche con:","compared to":"confrontato con","Default value:":"Valore predefinito:",Description:"Descrizione",Field:"Campo",General:"Generale","Generated with":"Creato con",Name:"Nome","No response values.":"Nessun valore di risposta.",optional:"opzionale",Parameter:"Parametro","Permission:":"Permessi:",Response:"Risposta",Send:"Invia","Send a Sample Request":"Invia una richiesta di esempio","show up to version:":"mostra alla versione:","Size range:":"Intervallo dimensione:",Type:"Tipo",url:"url"},nl:{"Allowed values:":"Toegestane waarden:","Compare all with predecessor":"Vergelijk alle met voorgaande versie","compare changes to:":"vergelijk veranderingen met:","compared to":"vergelijk met","Default value:":"Standaard waarde:",Description:"Omschrijving",Field:"Veld",General:"Algemeen","Generated with":"Gegenereerd met",Name:"Naam","No response values.":"Geen response waardes.",optional:"optioneel",Parameter:"Parameter","Permission:":"Permissie:",Response:"Antwoorden",Send:"Sturen","Send a Sample Request":"Stuur een sample aanvragen","show up to version:":"toon tot en met versie:","Size range:":"Maatbereik:",Type:"Type",url:"url"},pl:{"Allowed values:":"Dozwolone warto\u015Bci:","Compare all with predecessor":"Por\xF3wnaj z poprzednimi wersjami","compare changes to:":"por\xF3wnaj zmiany do:","compared to":"por\xF3wnaj do:","Default value:":"Warto\u015B\u0107 domy\u015Blna:",Description:"Opis",Field:"Pole",General:"Generalnie","Generated with":"Wygenerowano z",Name:"Nazwa","No response values.":"Brak odpowiedzi.",optional:"opcjonalny",Parameter:"Parametr","Permission:":"Uprawnienia:",Response:"Odpowied\u017A",Send:"Wy\u015Blij","Send a Sample Request":"Wy\u015Blij przyk\u0142adowe \u017C\u0105danie","show up to version:":"poka\u017C do wersji:","Size range:":"Zakres rozmiaru:",Type:"Typ",url:"url"},pt:{"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Compare todos com antecessores","compare changes to:":"comparar altera\xE7\xF5es com:","compared to":"comparado com","Default value:":"Valor padr\xE3o:",Description:"Descri\xE7\xE3o",Field:"Campo",General:"Geral","Generated with":"Gerado com",Name:"Nome","No response values.":"Sem valores de resposta.",optional:"opcional",Parameter:"Par\xE2metro","Permission:":"Permiss\xE3o:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar um Exemplo de Pedido","show up to version:":"aparecer para a vers\xE3o:","Size range:":"Faixa de tamanho:",Type:"Tipo",url:"url"},ro:{"Allowed values:":"Valori permise:","Compare all with predecessor":"Compar\u0103 toate cu versiunea precedent\u0103","compare changes to:":"compar\u0103 cu versiunea:","compared to":"comparat cu","Default value:":"Valoare implicit\u0103:",Description:"Descriere",Field:"C\xE2mp",General:"General","Generated with":"Generat cu",Name:"Nume","No response values.":"Nici o valoare returnat\u0103.",optional:"op\u021Bional",Parameter:"Parametru","Permission:":"Permisiune:",Response:"R\u0103spuns",Send:"Trimite","Send a Sample Request":"Trimite o cerere de prob\u0103","show up to version:":"arat\u0103 p\xE2n\u0103 la versiunea:","Size range:":"Interval permis:",Type:"Tip",url:"url"},ru:{"Allowed values:":"\u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F:","Compare all with predecessor":"\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0439 \u0432\u0435\u0440\u0441\u0438\u0435\u0439","compare changes to:":"\u0441\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441:","compared to":"\u0432 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0438 \u0441","Default value:":"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E:",Description:"\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",Field:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",General:"\u041E\u0431\u0449\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F","Generated with":"\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E",Name:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435","No response values.":"\u041D\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043E\u0442\u0432\u0435\u0442\u0430.",optional:"\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439",Parameter:"\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440","Permission:":"\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E:",Response:"\u041E\u0442\u0432\u0435\u0442",Send:"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C","Send a Sample Request":"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441","show up to version:":"\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0440\u0441\u0438\u044E:","Size range:":"\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F:",Type:"\u0422\u0438\u043F",url:"URL"},tr:{"Allowed values:":"\u0130zin verilen de\u011Ferler:","Compare all with predecessor":"T\xFCm\xFCn\xFC \xF6ncekiler ile kar\u015F\u0131la\u015Ft\u0131r","compare changes to:":"de\u011Fi\u015Fiklikleri kar\u015F\u0131la\u015Ft\u0131r:","compared to":"kar\u015F\u0131la\u015Ft\u0131r","Default value:":"Varsay\u0131lan de\u011Fer:",Description:"A\xE7\u0131klama",Field:"Alan",General:"Genel","Generated with":"Olu\u015Fturan",Name:"\u0130sim","No response values.":"D\xF6n\xFC\u015F verisi yok.",optional:"opsiyonel",Parameter:"Parametre","Permission:":"\u0130zin:",Response:"D\xF6n\xFC\u015F",Send:"G\xF6nder","Send a Sample Request":"\xD6rnek istek g\xF6nder","show up to version:":"bu versiyona kadar g\xF6ster:","Size range:":"Boyut aral\u0131\u011F\u0131:",Type:"Tip",url:"url"},vi:{"Allowed values:":"Gi\xE1 tr\u1ECB ch\u1EA5p nh\u1EADn:","Compare all with predecessor":"So s\xE1nh v\u1EDBi t\u1EA5t c\u1EA3 phi\xEAn b\u1EA3n tr\u01B0\u1EDBc","compare changes to:":"so s\xE1nh s\u1EF1 thay \u0111\u1ED5i v\u1EDBi:","compared to":"so s\xE1nh v\u1EDBi","Default value:":"Gi\xE1 tr\u1ECB m\u1EB7c \u0111\u1ECBnh:",Description:"Ch\xFA th\xEDch",Field:"Tr\u01B0\u1EDDng d\u1EEF li\u1EC7u",General:"T\u1ED5ng quan","Generated with":"\u0110\u01B0\u1EE3c t\u1EA1o b\u1EDFi",Name:"T\xEAn","No response values.":"Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 tr\u1EA3 v\u1EC1.",optional:"T\xF9y ch\u1ECDn",Parameter:"Tham s\u1ED1","Permission:":"Quy\u1EC1n h\u1EA1n:",Response:"K\u1EBFt qu\u1EA3",Send:"G\u1EEDi","Send a Sample Request":"G\u1EEDi m\u1ED9t y\xEAu c\u1EA7u m\u1EABu","show up to version:":"hi\u1EC3n th\u1ECB phi\xEAn b\u1EA3n:","Size range:":"K\xEDch c\u1EE1:",Type:"Ki\u1EC3u",url:"li\xEAn k\u1EBFt"},zh:{"Allowed values:":"\u5141\u8BB8\u503C:",Body:"\u8BF7\u6C42\u4F53","Compare all with predecessor":"\u4E0E\u6240\u6709\u4E4B\u524D\u7684\u7248\u672C\u6BD4\u8F83","compare changes to:":"\u5C06\u5F53\u524D\u7248\u672C\u4E0E\u6307\u5B9A\u7248\u672C\u6BD4\u8F83:","compared to":"\u76F8\u6BD4\u4E8E","Default value:":"\u9ED8\u8BA4\u503C:",Description:"\u63CF\u8FF0",Field:"\u5B57\u6BB5",General:"\u6982\u8981","Generated with":"\u6784\u5EFA\u4E8E",Name:"\u540D\u79F0","No response values.":"\u65E0\u8FD4\u56DE\u503C.",optional:"\u53EF\u9009",Parameter:"\u53C2\u6570",Parameters:"\u53C2\u6570",Headers:"\u8BF7\u6C42\u5934","Permission:":"\u6743\u9650:",Response:"\u8FD4\u56DE",required:"\u5FC5\u9700\u7684",Send:"\u53D1\u9001","Send a Sample Request":"\u53D1\u9001\u793A\u4F8B\u8BF7\u6C42","show up to version:":"\u663E\u793A\u6307\u5B9A\u7248\u672C:","Size range:":"\u53D6\u503C\u8303\u56F4:",Type:"\u7C7B\u578B",url:"\u5730\u5740"}},Fn=((Ht=window.navigator.language)!=null?Ht:"en-GB").toLowerCase().substr(0,2);let Et=Wt[Fn]?Wt[Fn]:Wt.en;function Kt(fe){const Z=Et[fe];return Z===void 0?fe:Z}function yn(fe){Et=Wt[fe]}const{defaultsDeep:Ot}=s,lt=(fe,Z)=>{const de=(_e,ne,ge,ce)=>({[ne]:ge+1<ce.length?_e:Z});return fe.reduceRight(de,{})},ft=fe=>{let Z={};return fe.forEach(de=>{const _e=lt(de[0].split("."),de[1]);Z=Ot(Z,_e)}),In(Z)};function In(fe){return JSON.stringify(fe,null,4)}function ni(fe){const Z=[];return fe.forEach(de=>{let _e;switch(de.type.toLowerCase()){case"string":_e=de.defaultValue||"";break;case"boolean":_e=Boolean(de.defaultValue)||!1;break;case"number":_e=parseInt(de.defaultValue||0,10);break;case"date":_e=de.defaultValue||new Date().toLocaleDateString(window.navigator.language);break}Z.push([de.field,_e])}),ft(Z)}var en=ct(2027);class yi extends en{constructor(Z){super(),this.testMode=Z}diffMain(Z,de,_e,ne){return super.diff_main(this._stripHtml(Z),this._stripHtml(de),_e,ne)}diffPrettyHtml(Z){const de=[],_e=/&/g,ne=/</g,ge=/>/g,ce=/\n/g;for(let Te=0;Te<Z.length;Te++){const Ce=Z[Te][0],Re=Z[Te][1].replace(_e,"&amp;").replace(ne,"&lt;").replace(ge,"&gt;").replace(ce,"&para;<br>");switch(Ce){case en.DIFF_INSERT:de[Te]="<ins>"+Re+"</ins>";break;case en.DIFF_DELETE:de[Te]="<del>"+Re+"</del>";break;case en.DIFF_EQUAL:de[Te]="<span>"+Re+"</span>";break}}return de.join("")}diffCleanupSemantic(Z){return this.diff_cleanupSemantic(Z)}_stripHtml(Z){if(this.testMode)return Z;const de=document.createElement("div");return de.innerHTML=Z,de.textContent||de.innerText||""}}function tt(){p().registerHelper("markdown",function(ne){return ne&&(ne=ne.replace(/((\[(.*?)\])?\(#)((.+?):(.+?))(\))/mg,function(ge,ce,Te,Ce,ke,Re,xe){const Fe=Ce||Re+"/"+xe;return'<a href="#api-'+Re+"-"+xe+'">'+Fe+"</a>"}),ne)}),p().registerHelper("setInputType",function(ne){switch(ne){case"File":case"Email":case"Color":case"Number":case"Date":return ne[0].toLowerCase()+ne.substring(1);case"Boolean":return"checkbox";default:return"text"}});let fe;p().registerHelper("startTimer",function(ne){return fe=new Date,""}),p().registerHelper("stopTimer",function(ne){return console.log(new Date-fe),""}),p().registerHelper("__",function(ne){return Kt(ne)}),p().registerHelper("cl",function(ne){return console.log(ne),""}),p().registerHelper("underscoreToSpace",function(ne){return ne.replace(/(_+)/g," ")}),p().registerHelper("removeDblQuotes",function(ne){return ne.replace(/"/g,"")}),p().registerHelper("assign",function(ne){if(arguments.length>0){const ge=typeof arguments[1];let ce=null;(ge==="string"||ge==="number"||ge==="boolean")&&(ce=arguments[1]),p().registerHelper(ne,function(){return ce})}return""}),p().registerHelper("nl2br",function(ne){return de(ne)}),p().registerHelper("ifCond",function(ne,ge,ce,Te){switch(ge){case"==":return ne==ce?Te.fn(this):Te.inverse(this);case"===":return ne===ce?Te.fn(this):Te.inverse(this);case"!=":return ne!=ce?Te.fn(this):Te.inverse(this);case"!==":return ne!==ce?Te.fn(this):Te.inverse(this);case"<":return ne<ce?Te.fn(this):Te.inverse(this);case"<=":return ne<=ce?Te.fn(this):Te.inverse(this);case">":return ne>ce?Te.fn(this):Te.inverse(this);case">=":return ne>=ce?Te.fn(this):Te.inverse(this);case"&&":return ne&&ce?Te.fn(this):Te.inverse(this);case"||":return ne||ce?Te.fn(this):Te.inverse(this);default:return Te.inverse(this)}});const Z={};p().registerHelper("subTemplate",function(ne,ge){Z[ne]||(Z[ne]=p().compile(document.getElementById("template-"+ne).innerHTML));const ce=Z[ne],Te=v().extend({},this,ge.hash);return new(p()).SafeString(ce(Te))}),p().registerHelper("toLowerCase",function(ne){return ne&&typeof ne=="string"?ne.toLowerCase():""}),p().registerHelper("splitFill",function(ne,ge,ce){const Te=ne.split(ge);return new Array(Te.length).join(ce)+Te[Te.length-1]});function de(ne){return(""+ne).replace(/(?:^|<\/pre>)[^]*?(?:<pre>|$)/g,ge=>ge.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,"$1<br>$2"))}p().registerHelper("each_compare_list_field",function(ne,ge,ce){const Te=ce.hash.field,Ce=[];ne&&ne.forEach(function(Re){const xe=Re;xe.key=Re[Te],Ce.push(xe)});const ke=[];return ge&&ge.forEach(function(Re){const xe=Re;xe.key=Re[Te],ke.push(xe)}),_e("key",Ce,ke,ce)}),p().registerHelper("each_compare_keys",function(ne,ge,ce){const Te=[];ne&&Object.keys(ne).forEach(function(Re){const xe={};xe.value=ne[Re],xe.key=Re,Te.push(xe)});const Ce=[];return ge&&Object.keys(ge).forEach(function(Re){const xe={};xe.value=ge[Re],xe.key=Re,Ce.push(xe)}),_e("key",Te,Ce,ce)}),p().registerHelper("body2json",function(ne,ge){return ni(ne)}),p().registerHelper("each_compare_field",function(ne,ge,ce){return _e("field",ne,ge,ce)}),p().registerHelper("each_compare_title",function(ne,ge,ce){return _e("title",ne,ge,ce)}),p().registerHelper("reformat",function(ne,ge){if(ge==="json")try{return JSON.stringify(JSON.parse(ne.trim()),null,"    ")}catch(ce){}return ne}),p().registerHelper("showDiff",function(ne,ge,ce){let Te="";if(ne===ge)Te=ne;else{if(!ne)return ge;if(!ge)return ne;const Ce=new yi,ke=Ce.diffMain(ge,ne);Ce.diffCleanupSemantic(ke),Te=Ce.diffPrettyHtml(ke),Te=Te.replace(/&para;/gm,"")}return ce==="nl2br"&&(Te=de(Te)),Te});function _e(ne,ge,ce,Te){const Ce=[];let ke=0;ge&&ge.forEach(function(Fe){let $e=!1;if(ce&&ce.forEach(function(rt){if(Fe[ne]===rt[ne]){const _t={typeSame:!0,source:Fe,compare:rt,index:ke};Ce.push(_t),$e=!0,ke++}}),!$e){const rt={typeIns:!0,source:Fe,index:ke};Ce.push(rt),ke++}}),ce&&ce.forEach(function(Fe){let $e=!1;if(ge&&ge.forEach(function(rt){rt[ne]===Fe[ne]&&($e=!0)}),!$e){const rt={typeDel:!0,compare:Fe,index:ke};Ce.push(rt),ke++}});let Re="";const xe=Ce.length;for(const Fe in Ce)parseInt(Fe,10)===xe-1&&(Ce[Fe]._last=!0),Re=Re+Te.fn(Ce[Fe]);return Re}}document.addEventListener("DOMContentLoaded",()=>{tn(),$(),g().highlightAll()});function tn(){var It;let fe=[{type:"post",url:"/:teamspace/permissions",title:"Assign permissions",name:"createPermission",group:"Account_Permission",description:"<p>Assign account level permission to a user</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"user",description:"<p>User to assign permissions to</p>"},{group:"Request body",type:"String[]",optional:!1,field:"permissions",description:"<p>List of account level permissions</p>"}]}},success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"user",description:"<p>User</p>"},{group:"200",type:"String[]",optional:!1,field:"permissions",description:"<p>Account Level Permission types</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
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
}`,type:"post"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"delete",url:"/:teamspace/permissions/:user",title:"Revoke permissions",name:"deletePermission",group:"Account_Permission",description:"<p>Revoke all permissions from a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User to delete</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/permissions/alice HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"get",url:"/:teamspace/permissions",title:"List all permissions",name:"listPermissions",group:"Account_Permission",description:"<p>Get a list of all account permission objects for a teamspace</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"user",description:"<p>User</p>"},{group:"200",type:"String[]",optional:!1,field:"permissions",description:"<p>Account level permissions</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/permissions HTTP/1.1",type:"get"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"put",url:"/:teamspace/permissions/:user",title:"Update permissions",name:"updatePermission",group:"Account_Permission",description:"<p>Update permissions assignment for a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User to update</p>"}],"Request body":[{group:"Request body",type:"String[]",optional:!1,field:"permissions",description:"<p>List of account level permissions</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"String[]",optional:!1,field:"permissions",description:"<p>List of account level permissions</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PUT /acme/permissions/alice HTTP/1.1
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"put"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"post",url:"/forgot-password",title:"Forgot password",name:"forgotPassword",group:"Account",description:"<p>Send a password reset link to account's e-mail.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"username",description:"<p>Account username</p>"},{group:"Parameter",type:"String",optional:!1,field:"email",description:"<p>E-mail address registered with account</p>"}]}},examples:[{title:"Example usage (with username):",content:`POST /forgot-password HTTP/1.1
{
	"username: "alice"
}`,type:"get"},{title:"Example usage (with e-mail):",content:`POST /forgot-password HTTP/1.1
{
	"email: "alice@acme.co.uk"
}`,type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/:user/avatar",title:"Get avatar",name:"getAvatar",group:"Account",description:"<p>Get user avatar.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"avatar",description:"<p>User Avatar Image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"json"}]},error:{fields:{"404":[{group:"404",optional:!1,field:"USER_DOES_NOT_HAVE_AVATAR",description:"<p>User does not have an avatar</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 404 Not Found
{
	"message": "User does not have an avatar",
	"status": 404,
	"code": "USER_DOES_NOT_HAVE_AVATAR",
	"place": "GET /alice/avatar"
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice/avatar HTTP/1.1",type:"put"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/:user.json",title:"List account information",name:"listInfo",group:"Account",description:"<p>Account information and list of projects grouped by teamspace that the user has access to.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object[]",optional:!1,field:"accounts",description:"<p>User account</p>"},{group:"200",type:"Object",optional:!1,field:"billingInfo",description:"<p>Billing information</p>"},{group:"200",type:"String",optional:!1,field:"email",description:"<p>User e-mail address</p>"},{group:"200",type:"String",optional:!1,field:"firstName",description:"<p>First name</p>"},{group:"200",type:"String",optional:!1,field:"lastName",description:"<p>Surname</p>"},{group:"200",type:"Boolean",optional:!1,field:"hasAvatar",description:"<p>True if user account has an avatar</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
			"_id": "Producer
		}
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice.json HTTP/1.1",type:"delete"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"put",url:"/:user/password",title:"Reset password",name:"resetPassword",group:"Account",description:"<p>Reset user account password. New password must be different.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User account</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"oldPassword",description:"<p>Old password</p>"},{group:"Request body",type:"String",optional:!1,field:"newPassword",description:"<p>New password</p>"},{group:"Request body",type:"String",optional:!1,field:"token",description:"<p>Password reset token</p>"}]}},success:{fields:{"200":[{group:"200",optional:!1,field:"account",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"TOKEN_INVALID",description:"<p>Token is invalid or has expired</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 400 Bad Request
{
	"message":"Token is invalid or expired",
	"status":400,
	"code":"TOKEN_INVALID",
	"value":59,
	"place": "PUT /alice/password"
}`,type:"json"}]},examples:[{title:"Example usage (with old password):",content:`PUT /alice/password HTTP/1.1
{
	"oldPassword":"AW96B6",
	"newPassword":"TrustNo1"
}`,type:"post"},{title:"Example usage (with token):",content:`PUT /alice/password HTTP/1.1
{
	"token":"1234567890",
	"newPassword":"TrustNo1"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user",title:"Sign up",name:"signUp",group:"Account",description:"<p>Sign up for a new user account.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>New account username to register</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"password",description:"<p>Password</p>"},{group:"Request body",type:"String",optional:!1,field:"email",description:"<p>Valid e-mail address</p>"},{group:"Request body",type:"String",optional:!1,field:"firstName",description:"<p>First name</p>"},{group:"Request body",type:"String",optional:!1,field:"lastName",description:"<p>Surname</p>"},{group:"Request body",type:"String",optional:!1,field:"company",description:"<p>Company</p>"},{group:"Request body",type:"String",optional:!1,field:"jobTitle",description:"<p>Job title</p>"},{group:"Request body",type:"String",optional:!1,field:"countryCode",description:"<p>ISO 3166-1 alpha-2</p>"},{group:"Request body",type:"String",optional:!1,field:"captcha",description:"<p>Google reCAPTCHA response token</p>"}]}},success:{fields:{"200":[{group:"200",optional:!1,field:"account",description:"<p>New Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"SIGN_UP_PASSWORD_MISSING",description:"<p>Password is missing</p>"}]},examples:[{title:"Error-Response",content:`
HTTP/1.1 400 Bad Request
{
	"message": "Password is missing",
	"status": 400,
	"code": "SIGN_UP_PASSWORD_MISSING",
	"value": 57,
	"place": "POST /nabile"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /alice HTTP/1.1
{
	"email":"alice@acme.co.uk",
	"password":"AW96B6",
	"firstName":"Alice",
	"lastName":"Allen",
	"company":"Acme Corporation",
	"countryCode":"GB",
	"jobTitle":"CEO",
	"captcha":"1234567890qwertyuiop"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"put",url:"/:user",title:"Update user account",name:"updateUser",group:"Account",description:"<p>Update account information.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>Account username</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"email",description:"<p>Valid e-mail address</p>"},{group:"Request body",type:"String",optional:!1,field:"firstName",description:"<p>First name</p>"},{group:"Request body",type:"String",optional:!1,field:"lastName",description:"<p>Surname</p>"}]}},success:{fields:{"200":[{group:"200",optional:!1,field:"account",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PUT /alice HTTP/1.1
{
	"email":"alice@3drepo.org",
	"firstName":"Alice",
	"lastName":"Anderson"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user/avatar",title:"Upload avatar",name:"uploadAvatar",group:"Account",description:"<p>Upload a new avatar image. Only multipart form data content type will be accepted.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User</p>"}],"Request body":[{group:"Request body",type:"File",optional:!1,field:"file",description:"<p>Image to upload</p>"}]}},examples:[{title:"Example usage:",content:`POST /alice/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf

------WebKitFormBoundaryN8dwXAkcO1frCHLf
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<binary content>
------WebKitFormBoundaryN8dwXAkcO1frCHLf--`,type:"put"}],success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"status",description:"<p>Status of Avatar upload.</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user/verify",title:"Verify",name:"verify",group:"Account",description:"<p>Verify an account after signing up.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>Account username</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"token",description:"<p>Account verification token</p>"}]}},success:{fields:{"200":[{group:"200",optional:!1,field:"account",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"ALREADY_VERIFIED",description:"<p>User already verified</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 400 Bad Request
{
	"message": "Already verified",
	"status": 400,
	"code": "ALREADY_VERIFIED",
	"value": 60,
	"place": "POST /alice/verify"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /alice/verify HTTP/1.1
{
	"token":"1234567890"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/login",title:"Get current username",name:"checkLogin",group:"Authentication",description:"<p>Get the username of the logged in user.</p>",success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"username",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`GET /login HTTP/1.1
{}`,type:"get"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"post",url:"/login",title:"Login",name:"login",group:"Authentication",description:"<p>3D Repo account login. Logging in generates a token that can be used for cookie-based authentication. To authentication subsequent API calls using cookie-based authentication, simply put the following into the HTTP header: <code>Cookie: connect.sid=:sessionId</code></p> <p>NOTE: If you use a modern browser\u2019s XMLHttpRequest object to make API calls, you don\u2019t need to take care of the authentication process after calling /login.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"username",description:"<p>Account username</p>"},{group:"Request body",type:"String",optional:!1,field:"password",description:"<p>Account password</p>"}]}},success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"username",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
set-cookie:connect.sid=12345678901234567890;
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /login HTTP/1.1
{
	"username": "alice",
	"password": "AW96B6"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"post",url:"/logout",title:"Logout",name:"logout",group:"Authentication",description:"<p>Invalidate the authenticated session.</p>",success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"username",description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /logout HTTP/1.1
{}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"get",url:"/version",title:"Application version",name:"printVersion",group:"D_Repo",description:"<p>Show current application version.</p>",success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"VERSION",description:"<p>API service version</p>"},{group:"200",type:"String",optional:!1,field:"unity",description:"<p>Unity viewer version</p>"},{group:"200",type:"String",optional:!1,field:"navis",description:"<p>Autodesk Navisworks version</p>"},{group:"200",type:"String",optional:!1,field:"unitydll",description:"<p>Unity viewer version</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"3D_Repo"},{type:"post",url:"/:teamspace/:model/revision(/master/head|/:revId)/groups",title:"Create group",name:"createGroup",group:"Groups",description:"<p>Add a group to the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
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
}`,type:"post"},{title:"Example usage (/:revId)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1
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
	]
}`,type:"post"}],success:{examples:[{title:"Success-Response (normal group)",content:`HTTP/1.1 200 OK
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
}`,type:"json"},{title:"Success-Response (smart group)",content:`HTTP/1.1 200 OK
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
	]
}`,type:"json"}],fields:{"200":[{group:"200",type:"String",optional:!1,field:"author",description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"delete",url:"/:teamspace/:model/groups?ids=[GROUPS]",title:"Delete groups",name:"deleteGroups",group:"Groups",description:"<p>Delete groups.</p>",parameter:{fields:{Query:[{group:"Query",type:"String",optional:!1,field:"GROUPS",description:"<p>Comma separated list of group IDs</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"status",description:"<p>Group deletion result (success|ERROR CODE)</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/groups?ids=00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003 HTTP/1.1",type:"delete"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/groups/export",title:"Export Groups",name:"exportGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ExportFederationGroups</p>",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/groups/export",title:"Import Groups",name:"exportGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ImportFederationGroups</p>",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision(/master/head|/:revId)/groups/:groupId?[query]",title:"Find group",name:"findGroup",group:"Groups",description:"<p>Find a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",description:"<p>Flag that returns IFC GUIDs for group elements</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000004?ifcguids=true HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"},{title:"Success-Response (with IFC GUIDs)",content:`HTTP/1.1 200 OK
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
	],
	"updatedAt":1552128300000,
	"updatedBy":"alice",
	"_id":"00000000-0000-0000-0000-000000000004"
}`,type:"json"}],fields:{"200":[{group:"200",type:"String",optional:!1,field:"author",description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revision(/master/head/|/:revId)/groups?[query]",title:"List all groups",name:"listGroups",group:"Groups",description:"<p>List all groups associated with the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",description:"<p>Flag that returns IFC GUIDs for group elements</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noIssues",description:"<p>Flag that hides groups for issues</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noRisks",description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noViews",description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object[]",optional:!1,field:"objects",description:"<p>List of group objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1",type:"get"},{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1",type:"get"},{title:"Example usage (no issue/risk groups)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?noIssues=true&noRisks=true HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?ifcguids=true HTTP/1.1",type:"get"}],version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"put",url:"/:teamspace/:model/revision(/master/head|/:revId)/groups/:groupId/",title:"Update group",name:"updateGroup",group:"Groups",description:"<p>Update a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"},{title:"Example usage (/:revId)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}],fields:{"200":[{group:"200",type:"String",optional:!1,field:"author",description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"get",url:"/:teamspace/:model/revisions.json",title:"List all revisions",name:"listRevisions",group:"History",description:"<p>List all revisions for a model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"Revisions",description:"<p>object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
		"_id":"00000000-0000-0000-0000-000000000001",
		"author":"alice",
		"timestamp":"2009-06-06T00:00:00.000Z",
		"name":"00000000-0000-0000-0000-000000000001",
		"branch":"master"
	}
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revisions.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"get",url:"/:teamspace/:model/revisions/:branch.json",title:"List all revisions by branch",name:"listRevisionsByBranch",group:"History",description:"<p>List all model revisions from a branch.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"branch",description:"<p>Name of revision branch</p>"}]}},success:{fields:{"200":[{group:"200",optional:!1,field:"Revisions",description:"<p>object for a branch</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revisions/staging.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"patch",url:"/:teamspace/:model/revisions/:id",title:"Update revision status",name:"updateRevisionStatus",group:"History",description:"<p>Update the status of revision, setting it to void/active</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"id",description:"<p>Unique Revision ID or tag</p>"}]},examples:[{title:"Input",content:`{
   "void": true
}`,type:"json"}]},success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"post",url:"/:teamspace/invitations",title:"Create/Update invitation",name:"createInvitation",group:"Invitations",description:"<p>It creates or updates an invitation with the permissions  and a job assigned to the invited email</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"email",description:"<p>The email to which the invitation will be sent</p>"},{group:"Request body",type:"String",optional:!1,field:"job",description:"<p>An existing job for the teamspace</p>"},{group:"Request body",type:"Permissions",optional:!1,field:"permissions",description:"<p>Valid permissions for the invited. If there is a teamspace_admin: true the rest of the permissions for that teamspace are ignored.</p>"}],"Request body: Permisssions":[{group:"Request body: Permisssions",type:"Boolean",optional:!0,field:"teamspace_admin",description:"<p>Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.</p>"},{group:"Request body: Permisssions",type:"ProjectPermissions[]",optional:!0,field:"projects",description:"<p>Permissions for projects and their models.</p>"}],"Request body: ProjectPermissions":[{group:"Request body: ProjectPermissions",type:"String",optional:!1,field:"project",description:"<p>The id of the project in which the project permissions will be applied for the invited user.</p>"},{group:"Request body: ProjectPermissions",type:"Boolean",optional:!0,field:"project_admin",description:"<p>Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.</p>"},{group:"Request body: ProjectPermissions",type:"ModelPermissions[]",optional:!0,field:"models",description:"<p>An array indicating the permissions for the models.</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",description:"<p>The id of the model that will have the permission applied for the invited user.</p>"},{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"permission",description:"<p>The type of permission applied for the invited user. Valid values are 'viewer', 'commenter' or 'collaborator'</p>"}]}},examples:[{title:"Example usage (with projects and models, permissions):",content:`POST /teamSpace1/invitations HTTP/1.1
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
	}`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"get",url:"/:teamspace/invitations",title:"Get invitations list",name:"getInvitations",group:"Invitations",description:"<p>It returns a list of invitations with their permissions and their jobs.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/invitations HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
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
          "project": "Bim Logo",
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
          "project": "Bim Logo",
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
]`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"delete",url:"/:teamspace/invitations/:email",title:"Revokes an invitation",name:"removeInvitation",group:"Invitations",description:"<p>It revokes an invitation for a teamspace</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"email",description:"<p>Email of the user invitation that you wish to revoke</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/invitations/invited@enterprise.com HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"get",url:"/:teamspace/invoices",title:"List all invoices",name:"listInvoices",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},description:"<p>List all invoices if available, to current logged in user.</p>",success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"Invoice",description:"<p>Object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	{
	"_id":"invoice_ID",
	"invoiceNo":"AA-111",
	"nextPaymentAmount":00,
	"taxAmount":0,
	"amount":00,
	"currency":"GBP",
	"transactionId":"transaction_ID",
	"gateway":"GATEWAY_PROVIDER",
	"billingAgreementId":"billing_agreement_ID",
	"periodEnd":"2018-06-03",
	"periodStart":"2018-05-04",
	  "info":
		{
		  "vat":"",
		  "countryCode":"AO",
		  "postalCode":"SW11 1BQ",
		  "city":"London",
		  "line2":"1 Street Road",
		  "line1":"London",
		  "company":"Comapny",
		  "lastName":"User Lastname",
		  "firstName":"User Firstname",
		  "_id":"invoice_ID",
		  "countryName":"United Kingdom"
		},
	 "nextPaymentDate":"2018-06-04",
	 "createdAt":"04-05-2018 15:59",
	 "__v":0,"state":"complete",
	 "items":
		[{
			 "name":"pricingPlanName",
			"currency":"GBP",
			"amount":00,
			"taxAmount":0,
			"_id":"invoice_ID",
			"description":"Advance License (from 2018)",
			"id":"invoice_ID"},
			  {
				"name":"pricingPlanName",
				"currency":"GBP",
				"amount":29,
				"taxAmount":0,
				"_id":"invoice_ID",
				"description":"This is a dummy invoice for use with API Documentation",
				"id":"invoice_ID"
		}],
				"type":"invoice",
				"proRata":false,
				"pending":false,
				"unitPrice":"29.00",
				"B2B_EU":false,
				"taxPercentage":0,
				"createdAtDate":"2018-05-04",
				"netAmount":00
	}
]`,type:"json"}]},error:{fields:{"401":[{group:"401",optional:!1,field:"NOT_AUTHORIZED",description:"<p>Not Authorized</p>"}]},examples:[{title:"Error-Response",content:`
HTTP/1.1 401 Not Authorized
{
	"message":"Not Authorized",
	"status":401,"code":
	"NOT_AUTHORIZED",
	"value":9,
	"place":"GET /nabile/subscriptions"
}`,type:"json"}]},version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"get",url:"/:teamspace/invoices/:invoiceNo.html",title:"Render invoices as HTML",name:"renderInvoice",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"invoiceNo",description:"<p>Invoice number to render.</p>"}]}},description:"<p>Render a HTML web page of the requested invoice.</p>",version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"get",url:"/:teamspace/invoices/:invoiceNo.pdf",title:"Render invoices as PDF",name:"renderInvoicePDF",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",optional:!1,field:"invoiceNo.pdf",description:"<p>Invoice to render.</p>"}]}},description:"<p>Render out a PDF version of the requested invocie.</p>",version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"post",url:"/:teamspace/:model/issues/:issueId/resources",title:"Attach resources to an issue",name:"attachResource",group:"Issues",description:"<p>Attaches file or url resources to an issue. If the type of the resource is file it should be send as multipart/form-data. Both types at the same time cant be sent. So in order to attach files and urls it should be done with two different requests.</p> <p>This method triggers a chat event</p>",parameter:{fields:{"Request body file resource (multipart/form-data)":[{group:"Request body file resource (multipart/form-data)",type:"File[]",optional:!1,field:"files",description:"<p>The array of files to be attached</p>"},{group:"Request body file resource (multipart/form-data)",type:"String[]",optional:!1,field:"names",description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"}],"Request body url resource":[{group:"Request body url resource",type:"String[]",optional:!1,field:"urls",description:"<p>The array of urls to be attached</p>"},{group:"Request body url resource",type:"String[]",optional:!1,field:"names",description:"<p>The names of the urls; it should have the same length as the url field</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}]}},success:{examples:[{title:"Success example result after two files has been uploaded",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"post",url:"/:teamspace/:model/issues/:issueId/comments",title:"Add comment to issue",name:"commentIssue",group:"Issues",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"comment",description:"<p>Comment text</p>"},{group:"Request body",type:"Viewpoint",optional:!0,field:"viewpoint",description:"<p>The viewpoint associated with the comment</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[3]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]},examples:[{title:"PAYLOAD",content:`{
  "comment": "This is a commment",
  "viewpoint": {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],\u2026}
}`,type:"json"}]},success:{examples:[{title:"Success",content:` HTTP/1.1 200 OK
{
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
    comment: "This is a commment",
    created: 1558534690327,
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
    owner: "username",
    viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],\u2026}
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"400",description:"<p>Comment with no text</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/comments",title:"Deletes an comment from an issue",name:"commentIssue",group:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"Json",optional:!1,field:"PAYLOAD",description:"<p>The data with the comment guid to be deleted.</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}]},examples:[{title:"PAYLOAD",content:`{
   guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}]},success:{examples:[{title:"Success",content:` HTTP/1.1 200 OK
{
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"401",description:"<p>Not authorized, when the user is not the owner</p>"},{group:"Error 4xx",optional:!1,field:"400",description:"<p>Issue comment sealed, when the user is trying to delete a comment that is sealed</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/resources",title:"Detach a resource from an issue",name:"detachResource",group:"Issues",description:"<p>Detachs a resource from an issue. If the issue is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",description:"<p>The resource id to be detached</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
   "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
   "size":2509356,
   "issueIds":[
   ],
   "name":"football.gif",
   "user":"teamSpace1",
   "createdAt":1561973996462
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"get",url:"/:teamspace/:model/issues/:issueId",title:"Get issue",name:"findIssue",group:"Issues",description:"<p>Find an issue with the requested Issue ID.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object",optional:!1,field:"issue",description:"<p>The Issue matching the Issue ID</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"ISSUE_NOT_FOUND",description:"<p>Issue not found</p>"}]},examples:[{title:"HTTP/1.1 404 Not Found",content:`HTTP/1.1 404 Not Found
{
	 "place": "GET /issues/:issueId",
	 "status": 500,
	 "message": "Issue not found",
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.bcfzip",title:"Download issues BCF file",name:"getIssuesBCF",group:"Issues",description:"<p>Download issues as a BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Get Issues BCF zip file by revision ID",name:"getIssuesBCFTRid",group:"Issues",description:"<p>Get Issues BCF export based on revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshot.png",title:"Get issue viewpoint screenshot",name:"getScreenshot",group:"Issues",description:"<p>Get an issue viewpoint screenshot.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshotSmall.png",title:"Get smaller version of Issue screenshot",name:"getScreenshotSmall",group:"Issues",success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"Issue",description:"<p>Screenshot.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/thumbnail.png",title:"Get issue thumbnail",name:"getThumbnail",group:"Issues",description:"<p>Retrieve screenshot thumbnail image for requested issue.</p>",success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"thumbnail",description:"<p>Thumbnail image</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues.bcfzip",title:"Import BCF file",name:"importBCF",group:"Issues",description:"<p>Upload issues BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues?[query]",title:"List Issues",name:"listIssues",group:"Issues",description:"<p>List all issues for model.</p>",success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues",title:"List Issues by revision ID",name:"listIssuesByRevision",group:"Issues",description:"<p>Get all issues related to specific revision ID.</p>",success:{fields:{"200":[{group:"200",type:"Object",optional:!1,field:"Issues",description:"<p>Object</p>"}]},examples:[{title:"Success-Response",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues",title:"Create issue",name:"newIssue",group:"Issues",description:"<p>Creates a new issue.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>The name of the issue</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",description:"<p>The roles assigned to the issue. Even though its an array (this is for future support of multiple assigned jobs), currently it has one or none elements correspoing to the available jobs in the teamaspace.</p>"},{group:"Request body",type:"String",optional:!1,field:"status",description:"<p>The status of the issue. It can have a value of &quot;open&quot;,&quot;in progress&quot;,&quot;for approval&quot;, &quot;void&quot; or &quot;closed&quot;.</p>"},{group:"Request body",type:"String",optional:!1,field:"priority",description:"<p>The priority of the issue. It can have a value of &quot;none&quot;, String&quot;low&quot;, &quot;medium&quot; or &quot;high&quot;.</p>"},{group:"Request body",type:"String",optional:!1,field:"topic_type",description:"<p>Type of the issue. It's value has to be one of the defined topic_types for the model. See <a href='#api-Model-createModel'>here</a> for more details.</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",description:"<p>The viewpoint of the issue, defining the position of the camera and the screenshot for that position.</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",description:"<p>The description of the created issue</p>"},{group:"Request body",type:"Number[3]",optional:!1,field:"position",description:"<p>The vector defining the pin of the issue. If the pin doesnt has an issue its an empty array.</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[3]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"post",url:"/:teamspace/:model/revision/:revId/issues",title:"Create issue on revision",name:"newIssueRev",group:"Issues",description:'<p>Creates a new issue for a particular revision. See <a href="#api-Issues-newIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Post Issues BCF zip file by revision ID",name:"postIssuesBCF",group:"Issues",description:"<p>Upload Issues BCF file using current revision ID.</p>",success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"status",description:"<p>&quot;ok&quot; on success</p>"}]},examples:[{title:"Success-Response:",content:`HTTP
{
	"status":"ok"
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.html",title:"Issues response into as HTML",name:"renderIssuesHTML",group:"Issues",description:"<p>Render all Issues into a HTML webpage, response is rendered HTML.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.html",title:"Issues response into as HTML by revision ID",name:"renderIssuesHTMLRid",group:"Issues",description:"<p>Render all Issues into a HTML webpage based on current revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}]}}},{type:"patch",url:"/:teamspace/:model/issues/:issueId",title:"Update issue",name:"updateIssue",group:"Issues",description:"<p>Updates an issue. It takes the part of the issue that can be updated. The system will create a system comment within the issue describing which values were changed. The user needs to be the teamspace administrator, the project administrator, has the same job as the creator of the issue, or has the issue assigned. In the case that the issue has been assigned to the user, the user cannot change it to the &quot;closed&quot; status.</p> <p>If the issue is being updated to assigned to a job and the status of the issue has the value &quot;for_approval&quot;, then the status of the issue is automatically changed to &quot;in_progress&quot;.</p> <p>If the user is changing the issue to the &quot;for_approval&quot; status, the issue will be assigned to the job that the creator of the issue.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"[]String",optional:!0,field:"assigned_roles",description:"<p>Job roles assigned to the issue</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",description:"<p>Description of issue</p>"},{group:"Request body",type:"String",optional:!0,field:"status",description:"<p>The status of issue (values: &quot;open&quot;, &quot;in progress&quot;, &quot;for approval&quot;, &quot;closed&quot;)</p>"},{group:"Request body",type:"String",optional:!0,field:"topic_type",description:"<p>Topic type of issue (see <a href='#api-Model-createModel'>here</a> for available types)</p>"},{group:"Request body",type:"[3]Number",optional:!0,field:"position",description:"<p>Vector defining the pin position of the issue; empty if the issue has no pin</p>"},{group:"Request body",type:"Number",optional:!0,field:"due_date",description:"<p>Due date timestamp for the issue</p>"},{group:"Request body",type:"String",optional:!0,field:"priority",description:"<p>The priority of the issue (values: &quot;none&quot;, &quot;low&quot;, &quot;medium&quot;, &quot;high&quot;)</p>"},{group:"Request body",type:"Number",optional:!0,field:"scale",description:"<p>The scale factor of the issue</p>"},{group:"Request body",type:"Viewpoint",optional:!0,field:"viewpoint",description:"<p>The viewpoint and screenshot of the issue</p>"},{group:"Request body",type:"Number",optional:!0,field:"viewCount",description:"<p>The viewcount of the issue</p>"},{group:"Request body",type:"Object",optional:!0,field:"extras",description:"<p>A field containing any extras that wanted to be saved in the issue (typically used by BCF)</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[3]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e HTTP/1.1
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
}`,type:"json"}],fields:{"200":[{group:"200",type:"Object",optional:!1,field:"Updated",description:"<p>Issue Object.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"patch",url:"/:teamspace/:model/revision/:revId/issues/:issueId",title:"Update issue on revision",name:"updateIssueRev",group:"Issues",description:'<p>Updates an issue for a particular revision. See <a href="#api-Issues-updateIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/jobs/:jobId/:user",title:"Assign a job",name:"addUserToJob",group:"Jobs",description:"<p>Assign a job to a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",optional:!1,field:"jobId",description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>User</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"POST /acme/jobs/Job1/alice HTTP/1.1",type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"post",url:"/:teamspace/jobs",title:"Create a new job",name:"createJob",group:"Jobs",description:"<p>Create a new job on teamspace.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"_id",description:"<p>Name of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"color",description:"<p>Colour of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	_id:"Job4",
	color:"#ffff00"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/jobs HTTP/1.1
{
	_id:"Job4",
	color:"#ffff00"
}`,type:"post"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"delete",url:"/:teamspace/jobs/:jobId",title:"Delete a job",name:"deleteJob",group:"Jobs",description:"<p>Delete a job from teamspace.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/jobs/Job 1 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"get",url:"/:teamspace/myJob",title:"Get user job",name:"getUserJob",group:"Jobs",description:"<p>Get job assigned to current user.</p>",examples:[{title:"Example usage:",content:"GET /acme/myJob HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	_id":"Job1",
	"color":"ff00000"
}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs/colors",title:"List colours",name:"listColors",group:"Jobs",description:"<p>List job colours.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"String[]",optional:!1,field:"colors",description:"<p>List of job colours</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	"#ff0000",
	"#00ff00",
	"#0000ff"
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs/colors HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs",title:"List all jobs",name:"listJobs",group:"Jobs",description:"<p>List of all jobs defined in teamspace.</p>",success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"put",url:"/:teamspace/jobs/:jobId",title:"Update job",name:"updateJob",group:"Jobs",description:"<p>Update job.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"_id",description:"<p>Name of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"color",description:"<p>Colour of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:`PUT /acme/jobs/Job1 HTTP/1.1
{
	_id:"Renamed Job",
	color:"#00ffff"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"get",url:"/:teamspace/:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here admin layer",name:"getHereAdminOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps administrative labels overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/hereadminlabeloverlay/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here aerial tile",name:"getHereAerialMapsTile",group:"Maps",description:"<p>Retrieve a Here Maps aerial map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/hereaerial/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/hereinfo",title:"Here Maps options",name:"getHereBaseInfo",group:"Maps",description:"<p>Get Here Maps service options.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/ HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<response>
	<maps>
		<map region="all" id="newest" />
	</maps>
	<resolutions>
		<resolution id="512" height="512" width="512" />
	</resolutions>
	<formats>
		<format encoding="png" bbp="24" id="png" />
	</formats>
	<schemes>
		<scheme id="normal.day" />
		<scheme id="normal.night" />
	</schemes>
	<style id="alps">
		<scheme id="normal.day" />
		<scheme id="normal.night" />
	</style>
	<style id="minis">
		<scheme id="normal.day" />
		<scheme id="carnav.day.grey" />
	</style>
	<tiletypes>
		<tiletype id="maptile" />
		<tiletype id="basetile" />
	</tiletypes>
	<languages>
		<language id="ARA" />
		<language id="CHI" />
		<language id="ENG" />
		<language id="GER" />
		<language id="SPA" />
	</languages>
	<zoomLevels min="0" max="20" />
</response>`,type:"xml"}]},version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/maps/herebuildings/:lat/:long/tile.json",title:"Here building elevation",name:"getHereBuildingsFromLongLat",group:"Maps",description:"<p>Retrieve building elevation information from Here Maps.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"Number",optional:!1,field:"lat",description:"<p>Latitude</p>"},{group:"Parameter",type:"Number",optional:!1,field:"long",description:"<p>Longitude</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herebuildings/51.524575/-0.139088/tile.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"Rows":[
		{
			"BUILDING_ID":"700567270",
			"FACE_ID":"700567270",
			"FEATURE_TYPE":"2005700",
			"HEIGHT":"22",
			"GROUND_CLEARANCE":null,
			"CF_ID":"1400645341",
			"HAS_3DLM":"N",
			"NAME":null,
			"LAT":"5150745,9,-12,-4,10,-5,2",
			"LON":"-14284,18,14,-9,-12,-9,-2",
			"INNER_LAT":null,
			"INNER_LON":null
		},
		{
			"BUILDING_ID":"700567273",
			"FACE_ID":"700567273",
			"FEATURE_TYPE":"2005700",
			"HEIGHT":"11",
			"GROUND_CLEARANCE":null,
			"CF_ID":"1400645344",
			"HAS_3DLM":"N",
			"NAME":null,
			"LAT":"5150742,-12,-4,-4,11,5,4",
			"LON":"-14252,14,-9,-8,-14,8,9",
			"INNER_LAT":null,
			"INNER_LON":null
		}
	]
}`,type:"json"}]},version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>"},{type:"get",url:"/:teamspace/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here grey tile",name:"getHereGreyTile",group:"Maps",description:"<p>Retrieve a Here Maps grey map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heregrey/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here transit (grey) tile",name:"getHereGreyTransitTile",group:"Maps",description:"<p>Retrieve a Here Maps grey transit map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heregreytransit/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here hybrid tile",name:"getHereHybridTile",group:"Maps",description:"<p>Retrieve a Here Maps hybrid map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herehybrid/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here label layer",name:"getHereLabelOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps label overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herelabeloverlay/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here line & label layer",name:"getHereLineLabelOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps line and label overlay tile image of street lines, city centre labels, and item labels.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herelinelabeloverlay/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/here/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here map tile",name:"getHereMapsTile",group:"Maps",description:"<p>Retrieve a Here Maps map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/here/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here POI tile",name:"getHerePOITile",group:"Maps",description:"<p>Retrieve a Here Maps point-of-interest (POI) map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herepoi/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here terrain tile",name:"getHereTerrainTile",group:"Maps",description:"<p>Retrieve a Here Maps terrain map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/hereterrain/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here toll zone tile",name:"getHereTollZoneTile",group:"Maps",description:"<p>Retrieve a Here Maps toll zone map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretollzone/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here traffic layer",name:"getHereTrafficFlowTile",group:"Maps",description:"<p>Retrieve a Here Maps traffic flow overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretrafficflow/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"},{group:"Query",type:"String",optional:!0,field:"min_traffic_congestion",description:"<p>Specifies the minimum traffic congestion level to use for rendering traffic flow (free, heavy, queuing, blocked)</p>"},{group:"Query",type:"DateTime",optional:!0,field:"time",description:"<p>Date and time for showing historical traffic patterns</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here traffic tile",name:"getHereTrafficTile",group:"Maps",description:"<p>Retrieve a Here Maps traffic map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretraffic/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"},{group:"Query",type:"String",optional:!0,field:"min_traffic_congestion",description:"<p>Specifies the minimum traffic congestion level to use for rendering traffic flow (free, heavy, queuing, blocked)</p>"},{group:"Query",type:"DateTime",optional:!0,field:"time",description:"<p>Date and time for showing historical traffic patterns</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here truck restrictions layer",name:"getHereTruckRestrictionsOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps truck restrictions overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruckoverlay/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png?[query]",title:"Here truck restrictions tile",name:"getHereTruckRestrictionsTile",group:"Maps",description:"<p>Retrieve a Here Maps truck restrictions map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruck/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"congestion",description:"<p>Flag that enables congestion and environmental zone display</p>"},{group:"Query",type:"String",optional:!0,field:"lg",description:"<p>MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"lg2",description:"<p>Secondary MARC three-letter language code for labels</p>"},{group:"Query",type:"String",optional:!0,field:"pois",description:"<p>Mask for Here Maps POIs categories</p>"},{group:"Query",type:"Number",optional:!0,field:"ppi",description:"<p>Tile resolution in pixels per inch (72, 250, 320, 500)</p>"},{group:"Query",type:"String",optional:!0,field:"pview",description:"<p>Render map boundaries based on internal or local views</p>"},{group:"Query",type:"String",optional:!0,field:"style",description:"<p>Select style used to render map tile</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/osm/:zoomLevel/:gridx/:gridy.png",title:"OSM map tile",name:"getOSMTile",group:"Maps",description:"<p>Retrieve an Open Street Map (OSM) map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/osm/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps",title:"List maps",name:"listMaps",group:"Maps",description:"<p>List the available geographic information system (GIS) sources and map layers.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object[]",optional:!1,field:"maps",description:"<p>List of available map objects</p>"}],"Map object":[{group:"Map object",type:"String",optional:!1,field:"name",description:"<p>Name of map provider</p>"},{group:"Map object",type:"Object[]",optional:!1,field:"layers",description:"<p>List of available map layer objects</p>"}],"Layer object":[{group:"Layer object",type:"String",optional:!1,field:"name",description:"<p>Name of map layer</p>"},{group:"Layer object",type:"String",optional:!1,field:"source",description:"<p>Map source identifier</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"maps":[
		{
			"name":"Open Street Map",
			"layers":[
				{
					"name":"Map Tiles",
					"source":"OSM"
				}
			]
		},
		{
			"name":"Here",
			"layers":[
				{
					"name":"Map Tiles",
					"source":"HERE"
				},
				{
					"name":"Traffic Flow",
					"source":"HERE_TRAFFIC_FLOW"
				},
				{
					"name":"Truck Restrictions",
					"source":"HERE_TRUCK_OVERLAY"
				}
			]
		}
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/4DTaskSequence.json",title:"Get All metadata for 4D Sequence Tags",name:"getAllIdsWith4DSequenceTag",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/4DTaskSequence.json",title:"Get All metadata with 4D Sequence Tags by revision",name:"getAllIdsWith4DSequenceTagRev",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/all.json",title:"Get all metadata",name:"getAllMetadata",group:"Meta",description:"<p>Get all objects in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/all.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/all.json",title:"Get all metadata by revision",name:"getAllMetadataByRev",group:"Meta",description:"<p>Get all tree objects with their metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to get metadata from</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata",name:"getIdsWithMetadataField",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key (in the latest revision). It also returns the metadata value for that key.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey",description:"<p>Unique metadata key</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/findObjsWith/IsLandmarked.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata",name:"getIdsWithMetadataFieldByRev",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key from a particular revision. See more details <a href='#api-Meta-getIdsWithMetadataField'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to get metadata from</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey",description:"<p>Unique meta key</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/meta/:id.json",title:"Get metadata",name:"getMetadataById",group:"Meta",description:"<p>Get all metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",optional:!1,field:"id",description:"<p>Meta Unique ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/meta/keys",title:"Get array of metadata fields",name:"getMetadataFields",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/keys HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
   "AboveGround",
   "BuildingID",
   "IFC GUID",
   "IFC Type",
   "IsLandmarked",
   "IsPermanentID",
   "NumberOfStoreys",
   "OccupancyType",
   "Reference"
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"post",url:"/:teamspace/:model/revision(/master/head/|/:revId)/meta/rules",title:"Filter metadata by rules",name:"queryMetadataByRules",group:"Meta",description:"<p>Get all objects matching filter rules in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"meshids",description:"<p>Flag that returns Mesh IDs for matching rule queries</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/rules HTTP/1.1
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
]`,type:"post"},{title:"Example usage (/:revId)",content:"POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/00000000-0000-0000-0000-000000000001/meta/rules HTTP/1.1",type:"post"},{title:"Example usage (mesh IDs)",content:"POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/rules?meshids=true HTTP/1.1",type:"post"}],success:{examples:[{title:"Success (metadata):",content:`{
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
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"patch",url:"/:teamspace/models/permissions",title:"Batch update model permissions",name:"batchUpdateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace.</p>"}],"Request body":[{group:"Request body",type:"ModelPermissions[]",optional:!1,field:"BODY",description:"<p>List of model permissions</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Request body: ModelPermissions",type:"Permission[]",optional:!1,field:"permissions",description:"<p>List of user permissions</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /acme/models/permissions HTTP/1.1
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
]`,type:"patch"}],success:{examples:[{title:"Success:",content:`{
   status: "ok"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/model",title:"Create a model",name:"createModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"project",description:"<p>Name of project in which the model will be created</p>"},{group:"Request body",type:"String",optional:!1,field:"modelName",description:"<p>Name of the model to be created</p>"},{group:"Request body",type:"String",optional:!1,field:"unit",description:"<p>The unit in which the model is specified</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",description:"<p>A description of the model</p>"},{group:"Request body",type:"String",optional:!0,field:"code",description:"<p>A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers</p>"},{group:"Request body",type:"String",optional:!1,field:"type",description:"<p>The type of the model</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/model HTTP/1.1
{
   project: "classic project",
   modelName: "awesomeModel",
   unit: "ft",
   desc: "This is an awesome model!",
   code: "awe12",
   type: "Mechanical"
}`,type:"post"}],success:{examples:[{title:"Success:",content:`{
   account: "teamSpace1",
   model: "17d09947-368e-4748-877f-d105842c6681",
   name: "awesomeModel",
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
   setting: {
      type: "Mechanical",
      desc: "",
      name: "awesomeModel",
      _id: "17d09947-368e-4748-877f-d105842c6681",
      subModels: [],
      surveyPoints: [],
      properties: {
         unit: "ft"
      },
      permissions: [],
      status: "ok"
   }
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"delete",url:"/:teamspace/:model",title:"Delete Model.",name:"deleteModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to delete.</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/17d09947-368e-4748-877f-d105842c6681 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success:",content:`{
   "account": "teamSpace1",
   "model": "17d09947-368e-4748-877f-d105842c6681"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/download/latest",title:"Download model",name:"downloadModel",group:"Model",description:"<p>It returns the model file using the latest revision.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to download.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/download/latest HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (with headers):",content:`
HTTP/1.1 200 OK
X-Powered-By: Express
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Length: 11964
Content-Disposition: attachment;filename=3DrepoBIM_blocks.obj
set-cookie: connect.sid=s%3Ax4mDfLE-NqmPUO5tSSxPAyMjgov6YRge.bVSUoML3obJNp1XuObpbtXY44RjgEhJtsTz%2FwhwIckE; Domain=local.3drepo.io; Path=/; Expires=Tue, 27 Aug 2019 12:18:34 GMT; HttpOnly
Date: Tue, 27 Aug 2019 11:18:34 GMT
Connection: keep-alive

/***** FILE CONTENTS ******\\`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/settings/heliSpeed",title:"Get model heli speed",name:"getHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The modelId to get Heli speed for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{"heliSpeed":1}',type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/idMap.json",title:"Get ID map",name:"getIdMap",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model id to Get ID Map for.</p>"}]}},examples:[{title:"Example usage (federation):",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/idMap.json HTTP/1.1",type:"get"},{title:"Example usage (model):",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idMap.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (federation):",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/idToMeshes.json",title:"Get ID to meshes",name:"getIdToMeshes",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get ID Meshes for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idToMeshes.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   mainTree: {
      a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: [
         "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
      ],
      33c36fee-622d-46a5-8be1-a1bd295aa7d1: [
         "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
      ]
   },
   subModels: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.json.mpc",title:"Get JSON Mpc",name:"getJsonMpc",group:"Model",description:"<p>Get the unity bundle mpc json file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>id of the model to get JSON Mpc for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",description:"<p>id of the json.mpc file</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/modelProperties.json",title:"Get model properties",name:"getModelProperties",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get properties for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/modelProperties.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
   properties: {
      hiddenNodes: []
   },
   subModels: []
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model.json",title:"Get model settings",name:"getModelSetting",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"Object",optional:!1,field:"model",description:"<p>The modelId to get settings for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/fulltree.json",title:"Get tree",name:"getModelTree",group:"Model",description:"<p>Returns the full tree for the model</p>",examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/fulltree.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/model/permissions?models=[MODELS]",title:"Get multiple models permissions",name:"getMultipleModelsPermissions",group:"Model",description:"<p>Gets the permissions of a list of models</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace.</p>"}],Query:[{group:"Query",type:"String[]",optional:!1,field:"MODELS",description:"<p>An array of model ids.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/models/permissions?models=5ce7dd19-1252-4548-a9c9-4a5414f2e0c5,3549ddf6-885d-4977-87f1-eeac43a0e818 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idMap.json",title:"Get tree path by revision",name:"getRevIdMap",group:"Model",description:"<p>Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to ID map for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idToMeshes.json",title:"Get ID Meshes by revision",name:"getRevIdToMeshes",group:"Model",description:"<p>Get ID Meshes by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/modelProperties.json",title:"Get model properties by revision",name:"getRevModelProperties",group:"Model",description:"<p>Get model properties by revision. See more details <a href='#api-Model-getModelProperties'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/fulltree.json",title:"Get tree by revision",name:"getRevModelTree",group:"Model",description:"<p>Get full tree by revision. See more details <a href='#api-Model-getModelTree'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get Tree for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/srcAssets.json",title:"Get revision's src assets",name:"getRevSrcAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>The revision of the model to get src assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/4d48e3de-1c87-4fdf-87bf-d92c224eb3fe/srcAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/unityAssets.json",title:"Get revision's unity assets",name:"getRevUnityAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>The revision of the model to get unity assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.src.mpc",title:"Get Model in SRC representation",name:"getSRC",group:"Model",description:"<p>Get a mesh presented in SRC format.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",description:"<p>id of the SRC file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/permissions",title:"Get model permissions",name:"getSingleModelPermissions",group:"Model",description:"<p>Gets the permissions of a model</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get Permission for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/permissions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/srcAssets.json",title:"Get Src assets for the master branch",name:"getSrcAssets",group:"Model",description:"<p>Get the lastest model's version src assets</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/master/head/srcAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/subModelRevisions",title:"Get submodel revisions by rev",name:"getSubModelRevisionsByRev",group:"Model",description:"<p>In a federation it returns the submodels revisions of a particular federation revision. See more details <a href='#api-Model-getSubRevisionModels'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get properties for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/subModelRevisions",title:"Get submodels revisions",name:"getSubRevisionModels",group:"Model",description:"<p>In a federation it returns the submodels revisions of the latest federation revision.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get properties for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/subModelRevisions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/tree_path.json",title:"Get tree paths",name:"getTreePath",group:"Model",description:"<p>Returns the full tree path for the model and if the model is a federation of it submodels. These tree paths have the path to get to every object in the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get tree path for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/tree_path.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/tree_path.json",title:"Get tree path by revision",name:"getTreePathByRevision",group:"Model",description:"<p>Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to get tree path for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/unityAssets.json",title:"Get unity assets",name:"getUnityAssets",group:"Model",description:"<p>Get the lastest model's version unity assets</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.unity3d",title:"Get Unity Bundle",name:"getUnityBundle",group:"Model",description:"<p>Gets an actual unity bundle file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",description:"<p>id of the unity bundle</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload/ms-chunking",title:"Initialise MS chunking request",name:"initChunking",group:"Model",description:"<p>Initiate model revision data for MS Logic Apps chunked upload.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model id to upload.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"filename",description:"<p>Filename of content to upload</p>"},{group:"Request body",type:"String",optional:!1,field:"tag",description:"<p>Tag name for new revision</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",description:"<p>Description for new revision</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"importAnimations",description:"<p>Whether to import animations within a sequence</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking HTTP/1.1
{
	"filename": "structure.ifc",
	"tag": "rev001",
	"desc": "Revision 2"
}`,type:"post"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"corID": "00000000-0000-1111-2222-333333333333"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/searchtree.json?searchString=[searchString]",title:"Search model tree",name:"searchModelTree",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to use.</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"searchString",description:"<p>The string to use for search tree objects</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/searchtree.json?searchString=fou HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/searchtree.json?searchString=[searchString]",title:"Search model tree by revision",name:"searchModelTreeRev",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param. See more details <a href='#api-Model-searchModelTree'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",description:"<p>Revision to use.</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"searchString",description:"<p>The string to use for search tree objects</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/heliSpeed",title:"Update model heli speed",name:"updateHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to Update Heli speed.</p>"}],"Request body":[{group:"Request body",type:"Number",optional:!1,field:"heliSpeed",description:"<p>The value of the speed that will replace the heli speed.</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1
{"heliSpeed":3}`,type:"put"}],success:{examples:[{title:"Success:",content:"{}",type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model",title:"Update Federated Model",name:"updateModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Federated Model ID to update</p>"}],"Request body":[{group:"Request body",type:"[]Submodel",optional:!1,field:"subModels",description:"<p>Information on the models that are going to get federated</p>"}],"Request body: SubModel":[{group:"Request body: SubModel",type:"String",optional:!1,field:"database",description:"<p>The teamspace name which the model belongs to</p>"},{group:"Request body: SubModel",type:"String",optional:!1,field:"model",description:"<p>The model id to be federated</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5 HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/:model/permissions",title:"Update model permissions",name:"updateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"Permission[]",optional:!1,field:"BODY",description:"<p>List of user permissions</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage (add user permission):",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/models/permissions",title:"Update multiple models permissions",name:"updateMultiplePermissions",group:"Model",deprecated:{content:"use now (#Model:batchUpdateModelPermissions)"},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace.</p>"}],"Request body":[{group:"Request body",type:"[]ModelPermissions",optional:!1,field:"BODY",description:"<p>Its an array with a list of model ids and their permissions.</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",description:"<p>The model id of the model that will have their permission changed. If it's a federation the entry in the response corresponding with the model will have the 'federated' field set to true.</p>"},{group:"Request body: ModelPermissions",type:"[]Permission",optional:!1,field:"permissions",description:"<p>An array indicating the new permissions.</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/models/permissions HTTP/1.1
[
   {
      model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
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
      ]
   }
]`,type:"post"}],success:{examples:[{title:"Success:",content:`[
   {
      name: "Full Logo ",
      federate: true,
      model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
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
            permission: "collaborator"
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
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/permissions",title:"Update model permissions",name:"updatePermissions",group:"Model",deprecated:{content:"use now (#Model:updateModelPermissions)"},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model id of the model to be updated</p>"}],"Request body":[{group:"Request body",type:"[]Permissions",optional:!1,field:"BODY",description:"<p>Its an array with a list of users and their permission type.</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/permissions HTTP/1.1
[
   {
      user: "viewerTeamspace1Model1JobA",
      permission: "collaborator"
   },
   {
      user: "commenterTeamspace1Model1JobA",
      permission: "viewer"
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
]`,type:"post"}],success:{examples:[{title:"Success:",content:`{
   _id: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
   timestamp: "2019-05-02T16:17:14.000Z",
   type: "Architectural",
   desc: "",
   name: "pipes",
   subModels: [],
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
         permission: "collaborator"
      },
      {
         user: "commenterTeamspace1Model1JobA",
         permission: "viewer"
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/",title:"Update Model Settings",name:"updateSettings",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model to update Settings.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Name of the model to be created</p>"},{group:"Request body",type:"String",optional:!1,field:"unit",description:"<p>The unit in which the model is specified</p>"},{group:"Request body",type:"String",optional:!1,field:"code",description:"<p>A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers</p>"},{group:"Request body",type:"String",optional:!1,field:"type",description:"<p>The type of the model</p>"},{group:"Request body",type:"Number",optional:!1,field:"angleFromNorth",description:"<p>GIS bearing angle</p>"},{group:"Request body",type:"Number",optional:!1,field:"elevation",description:"<p>GIS elevation</p>"},{group:"Request body",type:"[]SurveyPoint",optional:!1,field:"surveyPoints",description:"<p>an array containing GIS surveypoints</p>"}],"Request body: SurveyPoint":[{group:"Request body: SurveyPoint",type:"Number[]",optional:!1,field:"position",description:"<p>an array representing a three dimensional coordinate</p>"},{group:"Request body: SurveyPoint",type:"Number[]",optional:!1,field:"latLong",description:"<p>an array representing a two dimensional coordinate for latitude and logitude</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/:model/upload/ms-chunking/:corID",title:"Upload model chunk",name:"uploadChunk",group:"Model",description:"<p>Upload model chunk for Microsoft Logic Apps.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID to upload</p>"},{group:"Parameter",type:"String",optional:!1,field:"corID",description:"<p>Upload correlation ID</p>"}],"Request header":[{group:"Request header",type:"String",optional:!1,field:"Content-Range",description:"<p>Byte range for the current content chunk, including the starting value, ending value, and the total content size, for example: &quot;bytes 0-1023/10100&quot;</p>"},{group:"Request header",type:"String",optional:!1,field:"Content-Type",description:"<p>Type of chunked content</p>"},{group:"Request header",type:"String",optional:!1,field:"Content-Length",description:"<p>Length of size in bytes of the current chunk</p>"}],"Request body: Attachment":[{group:"Request body: Attachment",type:"binary",optional:!1,field:"FILE",description:"<p>the file to be uploaded</p>"}]}},success:{fields:{"200":[{group:"200",type:"String",optional:!1,field:"Range",description:"<p>Byte range for content that has been received by the endpoint, for example: &quot;bytes=0-1023&quot;</p>"},{group:"200",type:"Number",optional:!0,field:"x-ms-chunk-size",description:"<p>Suggested chunk size in bytes</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"Range": "bytes=0-1023",
	"x-ms-chunk-size": 1024
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PATCH /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking/00000000-0000-1111-2222-333333333333 HTTP/1.1

header: {
	"Content-Range": "bytes 0-1023/10100",
	"Content-Type": "application/octet-stream",
	"Content-Length": "bytes=1024"
}

body: {
	"file": <FILE CHUNK CONTENTS>
}`,type:"patch"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload/ms-chunking/:corID",title:"Start MS chunking upload",name:"uploadChunksStart",group:"Model",description:"<p>Start chunked model upload for Microsoft Logic Apps. Max chunk size defined as 52,428,800 bytes (52 MB) based on https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-limits-and-config?tabs=azure-portal</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID to upload</p>"},{group:"Parameter",type:"String",optional:!1,field:"corID",description:"<p>Upload correlation ID</p>"}],"Request header":[{group:"Request header",type:"String",optional:!1,field:"x-ms-transfer-mode",description:"<p>Indicates that the content is uploaded in chunks; value=&quot;chunked&quot;</p>"},{group:"Request header",type:"Number",optional:!1,field:"x-ms-content-length",description:"<p>The entire content size in bytes before chunking</p>"}]}},success:{fields:{"200":[{group:"200",type:"Number",optional:!0,field:"x-ms-chunk-size",description:"<p>Suggested chunk size in bytes</p>"},{group:"200",type:"String",optional:!1,field:"Location",description:"<p>The URL location where to send the HTTP PATCH messages</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"x-ms-chunk-size": 1024,
	"Location": "/teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking/00000000-0000-1111-2222-333333333333"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking/00000000-0000-1111-2222-333333333333 HTTP/1.1

header: {
	"x-ms-transfer-mode": "chunked",
	"x-ms-content-length": 10100
}`,type:"post"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload",title:"Upload Model.",name:"uploadModel",group:"Model",description:"<p>It uploads a model file and creates a new revision for that model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model id to upload.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",description:"<p>the tag name for the new revision</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",description:"<p>the description for the new revision</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"importAnimations",description:"<p>whether to import animations within a sequence</p>"}],"Request body: Attachment":[{group:"Request body: Attachment",type:"binary",optional:!1,field:"FILE",description:"<p>the file to be uploaded</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundarySos0xligf1T8Sy8I

------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="file"; filename="3DrepoBIM.obj"
Content-Type: application/octet-stream

<binary content>
------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="tag"

rev1
------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="desc"

el paso
------WebKitFormBoundarySos0xligf1T8Sy8I-- *`,type:"post"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"delete",url:"/notifications",title:"Delete All notification",name:"deleteAllNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"delete",url:"/notifications/:id",title:"Delete a notification",name:"deleteNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",optional:!1,field:"id",description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications/:id",title:"Get a notification",name:"getNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications",title:"Get all notifications",name:"getNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications/:id",title:"Patch a notification",name:"patchNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications",title:"Patch all the user notifications",name:"patchNotification",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"post",url:"/:teamspace/permission-templates",title:"Create a template",name:"createTemplate",group:"PermissionTemplate",description:"<p>Create a permission template.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",description:"<p>Template name</p>"},{group:"Request body",type:"String[]",optional:!1,field:"permissions",description:"<p>List of model level permissions</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"String",optional:!1,field:"_id",description:"<p>Template name</p>"},{group:"Success 200",type:"String[]",optional:!1,field:"permissions",description:"<p>List of model level permissions</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"Template1",
	"permissions":[
		"view_model"
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/permission-templates HTTP/1.1
{
	"_id":"Template1",
	"permissions":[
		"view_model"
	]
}`,type:"post"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>"},{type:"delete",url:"/:teamspace/permission-templates/:permissionId",title:"Delete a template",name:"deleteTemplate",group:"PermissionTemplate",description:"<p>Delete a permission template.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"permissionId",description:"<p>Permission ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/permission-templates/Template1 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>"},{type:"get",url:"/:teamspace/:model/permission-templates",title:"List all model templates",name:"listModelTemplates",group:"PermissionTemplate",description:"<p>Get a list of model permission templates. Intended for users that have <code>manage_model_permission</code> privileges.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/permission-templates HTTP/1.1",type:"get"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>",success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]}},{type:"get",url:"/:teamspace/permission-templates",title:"Get all templates",name:"listTemplates",group:"PermissionTemplate",description:"<p>Get a list of teamspace permission templates.</p>",examples:[{title:"Example usage:",content:"GET /acme/permission-templates HTTP/1.1",type:"get"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]}},{type:"get",url:"/plans",title:"List all Plans",name:"listPlans",group:"Plan",version:"0.0.0",filename:"plan.js",groupTitle:"Plan"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model where the presentation is taking place</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",description:"<p>The code that users need to join in order to get the viewpoint.</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/stream",title:"Streams a viewpoint",name:"streamPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",description:"<p>The code that users need to join in order to get the viewpoint.</p>"}],"Request body":[{group:"Request body",type:"StreamingViewpoint",optional:!1,field:"The",description:"<p>viewpoint</p>"}]}},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"post",url:"/:teamspace/projects",title:"Create project",name:"createProject",group:"Project",description:"<p>It creates a project. The name of the project is required.</p>",permission:[{name:"canCreateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>The name of the project to be created</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/projects HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"delete",url:"/:teamspace/projects/:project",title:"Delete project",name:"deleteProject",group:"Project",description:"<p>Deletes a project, including all the models and federations inside of it.</p>",permission:[{name:"canDeleteProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",description:"<p>Project to delete</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects/:project/models",title:"List models of the project",name:"listModels",group:"Project",description:"<p>It returns a list of models .</p>",permission:[{name:"canListProjects"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",description:"<p>The name of the project to list models</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"name",description:"<p>Filters models by name</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects/Bim%20Logo/models?name=log HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
  {
    "_id": "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
    "federate": true,
    "desc": "",
    "name": "Full Logo",
    "__v": 17,
    "timestamp": "2019-05-02T16:17:37.902Z",
    "type": "Federation",
    "subModels": [
      {
        "database": "teamSpace1",
        "model": "b1fceab8-b0e9-4e45-850b-b9888efd6521",
        "name": "block"
      },
      {
        "database": "teamSpace1",
        "model": "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
        "name": "letters"
      },
      {
        "database": "teamSpace1",
        "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
        "name": "pipes"
      }
    ],
    "surveyPoints": [
      {
        "position": [
          0,
          0,
          0
        ],
        "latLong": [
          -34.459127,
          0
        ]
      }
    ],
    "properties": {
      "unit": "mm",
      "topicTypes": [
        {
          "label": "Clash",
          "value": "clash"
        },
        {
          "label": "Diff",
          "value": "diff"
        },
        {
          "label": "RFI",
          "value": "rfi"
        },
        {
          "label": "Risk",
          "value": "risk"
        },
        {
          "label": "H&S",
          "value": "hs"
        },
        {
          "label": "Design",
          "value": "design"
        },
        {
          "label": "Constructibility",
          "value": "constructibility"
        },
        {
          "label": "GIS",
          "value": "gis"
        },
        {
          "label": "For information",
          "value": "for_information"
        },
        {
          "label": "VR",
          "value": "vr"
        }
      ]
    },
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
    "status": "ok",
    "id": "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
    "model": "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
    "account": "teamSpace1",
    "headRevisions": {
    }
  }
]	 *`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects/:project",title:"Get project",name:"listProject",group:"Project",description:"<p>Get the details of a project; name, user permissions, modelids.</p>",permission:[{name:"canViewProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",description:"<p>Project name to be queried</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects",title:"List projects",name:"listProjects",group:"Project",description:"<p>It returns a list of projects with their permissions and model ids.</p>",permission:[{name:"canListProjects"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"patch",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProject",group:"Project",description:"<p>Update project properties (name, permissions)</p>",permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",description:"<p>Name of project</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"name",description:"<p>Project name</p>"},{group:"Request body",type:"ProjectPermission[]",optional:!0,field:"permissions",description:"<p>List of user permissions</p>"}],"Type: ProjectPermission":[{group:"Type: ProjectPermission",type:"String",optional:!1,field:"user",description:"<p>Username of user</p>"},{group:"Type: ProjectPermission",type:"String[]",optional:!1,field:"permissions",description:"<p>List of user privileges</p>"}]}},examples:[{title:"Example usage (update permissions):",content:`PATCH /acme/ProjectAnvil HTTP/1.1
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
         user: "bob",
         permissions: [
            "admin_project"
         ]
      }
   ]
}`,type:"patch"}],success:{examples:[{title:"Success-Response:",content:`{
   status: "ok"
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"put",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProjectPut",group:"Project",description:"<p>It updates a project. The name can be changed and the permissions as well as the permissions of users</p>",deprecated:{content:"use now (#Project:updateProject)"},permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",description:"<p>The name of the project to update</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>The name of the project to be created</p>"},{group:"Request body",type:"[]Permission",optional:!1,field:"permissions",description:"<p>The permissions for each user from the project</p>"}],"Request body: Permissions":[{group:"Request body: Permissions",type:"String",optional:!1,field:"user",description:"<p>The username of the user to have it permission changed</p>"},{group:"Request body: Permissions",type:"String[]",optional:!1,field:"permissions",description:"<p>An array of permissions for the user to be assigned</p>"}]}},examples:[{title:"Example usage update permissions:",content:`PUT /teamSpace1/Classic%20project HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/:model/resources/:resourceId",title:"Get resource file",name:"getResource",group:"Resources",description:"<p>Is the URL for downloading the resource file identified by the resourceId.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"resourceId",description:"<p>The Id of the resource</p>"}]}},version:"0.0.0",filename:"resources.js",groupTitle:"Resources"},{type:"post",url:"/:teamspace/:model/risks/:riskId/resources",title:"Attach resources to a risk",name:"attachResourceRisk",group:"Risks",description:"<p>Attaches file or URL resources to a risk. If the type of the resource is file it should be sent as multipart/form-data. Both types at the same time cannot be sent. So in order to attach files and URLs it should be done with two different requests.</p> <p>This method triggers a chat event</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}],"Request body file resource (multipart/form-data)":[{group:"Request body file resource (multipart/form-data)",type:"File[]",optional:!1,field:"files",description:"<p>The array of files to be attached</p>"},{group:"Request body file resource (multipart/form-data)",type:"String[]",optional:!1,field:"names",description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"}],"Request body URL resource":[{group:"Request body URL resource",type:"String[]",optional:!1,field:"urls",description:"<p>The array of URLs to be attached</p>"},{group:"Request body URL resource",type:"String[]",optional:!1,field:"names",description:"<p>The names of the URLs; it should have the same length as the URL field</p>"}]}},success:{examples:[{title:"Success example result after two files has been uploaded",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model/risks/:riskId/comments",title:"Add a comment",name:"commentRisk",group:"Risks",description:"<p>Create a comment in a risk.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",description:"<p>Risk ID</p>"},{group:"Request body",type:"String",optional:!1,field:"rev_id",description:"<p>Revision ID</p>"},{group:"Request body",type:"String",optional:!1,field:"comment",description:"<p>Comment text</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint object</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"String",optional:!1,field:"guid",description:"<p>Comment ID</p>"},{group:"Success 200",type:"Number",optional:!1,field:"created",description:"<p>Comment creation timestamp</p>"},{group:"Success 200",type:"String",optional:!1,field:"owner",description:"<p>Comment owner</p>"},{group:"Success 200",type:"String",optional:!1,field:"comment",description:"<p>Comment text</p>"},{group:"Success 200",type:"Object",optional:!1,field:"viewpoint",description:"<p>Viewpoint object</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"post"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"delete",url:"/:teamspace/:model/risks/:riskId/comments",title:"Delete a comment",name:"deleteComment",group:"Risks",description:"<p>Delete a risk comment.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"guid",description:"<p>Comment ID</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}},examples:[{title:"Example usage:",content:`DELETE /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"delete"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/resources",title:"Detach a resource from a risk",name:"detachResourceRisk",group:"Risks",description:"<p>Detachs a resource from a risk. If the risk is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",description:"<p>The resource id to be detached</p>"}]}},success:{examples:[{title:"{",content:`
{
   "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
   "size":2509356,
   "riskIds":[
   ],
   "name":"football.gif",
   "user":"teamSpace1",
   "createdAt":1561973996462
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/mitigations/criteria",title:"Get mitigation criteria",name:"findMitigationCriteria",group:"Risks",description:"<p>Returns all mitigations criteria from mitigation suggestions.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/mitigations/criteria HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"mitigation.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/mitigations",title:"Find mitigation suggestions",name:"findMitigationSuggestions",group:"Risks",description:"<p>Returns a list of suggestions for risk mitigation based on given criteria.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"associated_activity",description:"<p>Risk associated activity</p>"},{group:"Request body",type:"String",optional:!0,field:"category",description:"<p>Risk category</p>"},{group:"Request body",type:"String",optional:!0,field:"element",description:"<p>Risk element type</p>"},{group:"Request body",type:"String",optional:!0,field:"location_desc",description:"<p>Risk location description</p>"},{group:"Request body",type:"String",optional:!0,field:"risk_factor",description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!0,field:"scope",description:"<p>Risk construction scope</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/mitigations HTTP/1.1
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
]`,type:"json"}]},version:"0.0.0",filename:"mitigation.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/:model/risks/:riskId",title:"Get a risk",name:"findRiskById",group:"Risks",description:"<p>Retrieve a risk. The response includes all comments and screenshot URLs.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object",optional:!1,field:"risk",description:"<p>The Issue matching the Issue ID</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/screenshot.png",title:"Get risk screenshot",name:"getScreenshot",group:"Risks",description:"<p>Retrieve a risk screenshot image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Screenshot image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshot.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/screenshotSmall.png",title:"Get low-res screenshot",name:"getScreenshotSmall",group:"Risks",description:"<p>Retrieve a low-resolution risk screenshot image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Small screenshot image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshotSmall.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/risks/:riskId/thumbnail.png",title:"Get risk thumbnail",name:"getThumbnail",group:"Risks",description:"<p>Retrieve a risk thumbnail image.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",description:"<p>Thumbnail image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}]}}},{type:"get",url:"/:teamspace/:model[/revision/:revId]/risks",title:"List all risks",name:"listRisks",group:"Risks",description:"<p>Retrieve all model risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Number",optional:!0,field:"updatedSince",description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",description:"<p>Array of issue ids to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"categories",description:"<p>Array of categories to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"mitigationStatus",description:"<p>Array of mitigation status to filter for</p>"},{group:"Query",type:"Number[]",optional:!0,field:"likelihoods",description:"<p>Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"consequences",description:"<p>Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLikelihoods",description:"<p>Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"levelOfRisks",description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualConsequences",description:"<p>Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLevelOfRisks",description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object[]",optional:!1,field:"risks",description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"get",url:"/:teamspace/:model[/revision/:revId]/risks.html",title:"Render risks as HTML",name:"renderRisksHTML",group:"Risks",description:"<p>Retrieve HTML page of all risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"ids",description:"<p>Risk IDs to show</p>"}]}},success:{fields:{"200":[{group:"200",type:"Object[]",optional:!1,field:"risks",description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<html page>`,type:"html"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model[/revision/:revId]/risks",title:"Create a risk",name:"storeRisk",group:"Risks",description:"<p>Create a model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Risk name</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",description:"<p>Risk owner</p>"},{group:"Request body",type:"String",optional:!1,field:"associated_activity",description:"<p>Associated activity</p>"},{group:"Request body",type:"String",optional:!1,field:"category",description:"<p>Category</p>"},{group:"Request body",type:"Number",optional:!1,field:"consequence",description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",description:"<p>Risk description</p>"},{group:"Request body",type:"String",optional:!1,field:"element",description:"<p>Element type</p>"},{group:"Request body",type:"Number",optional:!1,field:"likelihood",description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"location_desc",description:"<p>Location description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_status",description:"<p>Treatment status</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_desc",description:"<p>Treatment summary</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_detail",description:"<p>Treatment detailed description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_stage",description:"<p>Treatment stage</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_type",description:"<p>Treatment type</p>"},{group:"Request body",type:"Number[3]",optional:!1,field:"position",description:"<p>Risk pin coordinates</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_consequence",description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_likelihood",description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"residual_risk",description:"<p>Residual risk</p>"},{group:"Request body",type:"String",optional:!1,field:"risk_factor",description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!1,field:"scope",description:"<p>Construction scope</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>Right vector of viewpoint indicating the direction of right in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>Up vector of viewpoint indicating the direction of up in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>Position vector indicates where in the world the viewpoint is positioned</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>Vector indicating where in the world the viewpoint is looking at</p>"},{group:"Type: Viewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>Vector indicating the direction the viewpoint is looking at in relative coordinates</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"Number[3]",optional:!1,field:"color",description:"<p>RGB colour values</p>"},{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"patch",url:"/:teamspace/:model[/revision/:revId]/risks/:riskId",title:"Update risk",name:"updateRisk",group:"Risks",description:"<p>Update model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",description:"<p>Risk ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Risk name</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",description:"<p>Risk owner</p>"},{group:"Request body",type:"String",optional:!1,field:"associated_activity",description:"<p>Associated activity</p>"},{group:"Request body",type:"String",optional:!1,field:"category",description:"<p>Category</p>"},{group:"Request body",type:"Number",optional:!1,field:"consequence",description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",description:"<p>Risk description</p>"},{group:"Request body",type:"String",optional:!1,field:"element",description:"<p>Element type</p>"},{group:"Request body",type:"Number",optional:!1,field:"likelihood",description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"location_desc",description:"<p>Location description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_status",description:"<p>Treatment status</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_desc",description:"<p>Treatment summary</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_detail",description:"<p>Treatment detailed description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_stage",description:"<p>Treatment stage</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_type",description:"<p>Treatment type</p>"},{group:"Request body",type:"Number[3]",optional:!1,field:"position",description:"<p>Risk pin coordinates</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_consequence",description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_likelihood",description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"residual_risk",description:"<p>Residual risk</p>"},{group:"Request body",type:"String",optional:!1,field:"risk_factor",description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!1,field:"scope",description:"<p>Construction scope</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model/sequences",title:"Create custom sequence",name:"createSequence",group:"Sequences",description:"<p>Create custom sequence for model.</p>",examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Create one or more activities",name:"createSequenceActivities",group:"Sequences",description:"<p>Creates a sequence activity tree.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"Activity[]",optional:!1,field:"activity",description:"<p>An array of the activity tree that will be created</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"overwrite",description:"<p>This flag indicates whether the request will replace the currently stored activities or just added at the end of the currently stored activities array. If not present it will be considered as false.</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Type: Activity":[{group:"Type: Activity",type:"String",optional:!1,field:"name",description:"<p>The name of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"startDate",description:"<p>The starting timestamp date of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"endDate",description:"<p>The ending timestamp date of the activity</p>"},{group:"Type: Activity",type:"Object",optional:!0,field:"resources",description:"<p>The resources asoociated with the activity</p>"},{group:"Type: Activity",type:"KeyValue[]",optional:!0,field:"data",description:"<p>An array of key value pairs with metadata for the activity</p>"},{group:"Type: Activity",type:"Activity[]",optional:!0,field:"subActivities",description:"<p>An array of activities that will be children of the activity</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
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
}`,type:"post"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceID/legend",title:"Delete legend",name:"deleteLegend",group:"Sequences",description:"<p>Delete the legend associated to this sequence</p>",examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceID",title:"Delete sequence",name:"deleteSequence",group:"Sequences",description:"<p>Delete the custom sequence by ID</p>",examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"deleteSequenceActivity",group:"Sequences",description:"<p>Delete a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"editSequenceActivity",group:"Sequences",description:"<p>Edits a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"name",description:"<p>The name of the activity</p>"},{group:"Request body",type:"Number",optional:!0,field:"startDate",description:"<p>The starting timestamp date of the activity</p>"},{group:"Request body",type:"Number",optional:!0,field:"endDate",description:"<p>The ending timestamp date of the activity</p>"},{group:"Request body",type:"String",optional:!0,field:"parent",description:"<p>The parent id if it has one. This parent must exist previously</p>"},{group:"Request body",type:"Object",optional:!0,field:"resources",description:"<p>The resources asoociated with the activity</p>"},{group:"Request body",type:"KeyValue[]",optional:!0,field:"data",description:"<p>An array of key value pairs with metadata for the activity</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1
{
   "name":"Renamed activity"
}`,type:"patch"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceID/legend",title:"get the legend",name:"getLegend",group:"Sequences",description:"<p>Get the legend for this sequence</p>",examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	  "Building works": "#aabbcc"
	  "Temporary works": "#ffffff66"
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/sequences/:sequenceID",title:"Get sequence",name:"getSequence",group:"Sequences",description:"<p>Get sequence by ID</p>",examples:[{title:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Get all activities",name:"getSequenceActivities",group:"Sequences",description:"<p>Get all sequence activities.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:`GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Get activity",name:"getSequenceActivityDetail",group:"Sequences",description:"<p>Get sequence activity details.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",description:"<p>Activity ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/00000000-0000-0002-0001-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/state/:stateId",title:"Get state",name:"getSequenceState",group:"Sequences",description:"<p>Get state of model in sequence.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"stateId",description:"<p>State unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/state/00000000-0000-0000-0001-000000000002 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
	]`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences",title:"List all sequences",name:"listSequences",group:"Sequences",description:"<p>List all sequences associated with the model.</p>",parameter:{fields:{Query:[{group:"Query",type:"String",optional:!0,field:"rev_id",description:"<p>Revision unique ID</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences HTTP/1.1",type:"get"},{title:"Example usage (with revision)",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences?rev_id=00000000-0000-0000-0000-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceID/legend",title:"Add/Update legend",name:"updateLegend",group:"Sequences",description:"<p>Update/add a legend to this sequence</p>",examples:[{title:"Example usage",content:"PUT /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"put"},{title:"Example usage:",content:`{
	  "Building works": "#aabbcc"
	  "Temporary works": "#ffffff66"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}}},{type:"patch",url:"/:teamspace/:model/sequences/:sequenceID",title:"Update a sequence",name:"updateSequence",group:"Sequences",description:"<p>Update a sequence (note: currently only name chance is supported</p>",examples:[{title:"Example usage",content:"PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"patch"},{title:"Example usage:",content:`{
	  "name": "Building works"
}`,type:"patch"}],parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>The new name of the sequence</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/subscriptions",title:"List subscriptions",name:"listSubscriptions",group:"Subscription",description:"<p>List all subscriptions for current user if applicable.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/subscriptions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},error:{fields:{"401":[{group:"401",optional:!1,field:"NOT_AUTHORIZED",description:"<p>Not Authorized</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 401 Not Authorized
{
	"message":"Not Authorized",
	"status":401,"code":
	"NOT_AUTHORIZED",
	"value":9,
	"place":"GET /teamSpace1/subscriptions"
}`,type:"json"}]},version:"0.0.0",filename:"subscriptions.js",groupTitle:"Subscription"},{type:"post",url:"/:teamspace/members",title:"Add a team member",name:"addTeamMember",group:"Teamspace",description:"<p>Adds a user to a teamspace and assign it a job.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"job",description:"<p>The job that the users going to have assigned</p>"},{group:"Request body",type:"String",optional:!1,field:"user",description:"<p>The username of the user to become a member</p>"},{group:"Request body",type:"String[]",optional:!1,field:"permissions",description:"<p>The permisions to be assigned to the member it can be an empty array or have a &quot;teamspace_admin&quot; value.</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/members HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members/search/:searchString",title:"Search for non-members",name:"findUsersWithoutMembership",group:"Teamspace",description:"<p>It returns a list of users that dont belong to the teamspace and that their usernames matches partially with the string and if entered an email it only matches if the string is the entire email address.</p> <p>In the result it's included their username, first name, last name, company and roles in other teamspaces.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"search",description:"<p>Search string provided to find member</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members/search/project HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK

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
]`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/addOns",title:"get enabled add ons",name:"getAddOns",group:"Teamspace",description:"<p>view the list of addOns enabled on this teamspace</p>",permission:[{name:"teamspace member"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success",content:`{
  vrEnabled: true,
  hereEnabled: true
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/billingInfo",title:"Get billing info",name:"getBillingInfo",group:"Teamspace",description:"<p>It returns the teamspace billing info.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/billingInfo HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   vat: "GB 365684514",
   line1: "10 Downing Street",
   postalCode: "SW1A 2AA",
   city: "London",
   company: "Teamspace one",
   countryCode: "GB",
   lastName: "Voorhees",
   firstName: "Jason"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members/:user",title:"Get member's info",name:"getMemberInfo",group:"Teamspace",description:"<p>It returns the teamspace's member small info .</p>",permission:[{name:"teamSpaceMember"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>The username of the user you wish to query</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   user: "viewerTeamspace1Model1JobB",
   firstName: "Alice",
   lastName: "Stratford",
   company: "Teamspace one",
   job: {"_id": "Job1", color: "#FFFFFF"}
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members",title:"Get members list",name:"getMemberList",group:"Teamspace",description:"<p>It returns a list of members identifying which of them are teamspace administrators, and their jobs.</p>",permission:[{name:"teamSpaceMember"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
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
<Risk mitigations CSV file>`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/quota",title:"Get Quota Information",name:"getQuotaInfo",group:"Teamspace",description:"<p>It returns the quota information. Each teamspace has a space limit and a limit of collaborators. The values returned are  space used (both these values are in bytes) and the collaborator limit. If spaceLimit or collaboratorLimit are nulled it means that there are no space limit/member limit.</p>",permission:[{name:"teamSpaceAdmin"}],examples:[{title:"Example usage:",content:"GET /teamSpace1/quota HTTP/1.1",type:"get"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"delete",url:"/:teamspace/members/:user",title:"Remove from the teamspace",name:"removeTeamMember",group:"Teamspace",description:"<p>Removes a user from the teampspace.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",description:"<p>Username of the member to remove</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   user: "viewerTeamspace1Model1JobB",
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"patch",url:"/:teamspace/settings",title:"Update teamspace settings",name:"updateTeamspaceSettings",group:"Teamspace",description:"<p>Update teamspace settings.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String[]",optional:!0,field:"riskCategories",description:"<p>List of risk categories</p>"},{group:"Request body",type:"String[]",optional:!0,field:"topicTypes",description:"<p>List of issue topic types</p>"}],"Risk category":[{group:"Risk category",type:"String",optional:!1,field:"value",description:"<p>Value of risk category</p>"},{group:"Risk category",type:"String",optional:!1,field:"label",description:"<p>Label for risk category</p>"}],"Topic type":[{group:"Topic type",type:"String",optional:!1,field:"value",description:"<p>Value of topic type</p>"},{group:"Topic type",type:"String",optional:!1,field:"label",description:"<p>Label for topic type</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage",content:`PUT /acme/settings HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"post",url:"/:teamspace/settings/mitigations.csv",title:"Upload mitigations file",name:"uploadMitigationsFile",group:"Teamspace",description:"<p>Upload a risk mitigations CSV file to a teamspace.</p>",examples:[{title:"Example usage",content:`POST /acme/settings/mitigations.csv HTTP/1.1
<Risk mitigations CSV file>`,type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"ok"
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/:model/textures/:textureId",title:"Get texture map",name:"getTexture",group:"Texture",description:"<p>Returns the texture map with the given UID</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Name of the model containing the texture</p>"},{group:"Parameter",type:"String",optional:!1,field:"UID",description:"<p>of the texture to download</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/84b5f0e0-a27d-11eb-ac9d-a531015f5294/textures/c9df3159-295c-4714-8b54-63dc715b1125 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (with headers):",content:`
HTTP/1.1 200 OK
X-Powered-By: Express
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: image/png;
Date: Wed, 21 Apr 2021 10:59:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked

/***** FILE CONTENTS ******\\`,type:"png"}]},version:"0.0.0",filename:"model.js",groupTitle:"Texture"},{type:"get",url:"/starredMeta",title:"Gets the starred metadata tags for the logged user",description:"<p>This endpoint returns the starred metadata tags. You can manage the starred metadata in the frontend from BIM (i) icon in the viewer.</p>",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
[
   "material",
   "color",
   "base offset"
]`,type:"json"}]},name:"GetStarredMetadataTags",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/starredModels",title:"Gets the starred models for the logged user",name:"GetStarredModels",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredMeta",title:"Replaces the whole starred metadata tags array for the logged user",name:"SetMetadataTags",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",optional:!0,field:"String",description:"<p>(Request body) An array of tags to be starred</p>"}]},examples:[{title:"Input",content:`   [
   	"material",
	  	"color"
	  ]`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredModels",title:"Sets the whole starred models for the logged user",name:"SetStarredModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",optional:!0,field:"String",description:"<p>An array of models to be starred, belong to the teamspace</p>"}]},examples:[{title:"Input",content:`   {
    	"user1": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"],
    	"user2": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
	  }`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredMeta",title:"Adds a starred metadata tag for the logged user",name:"StarMetadataTags",group:"User",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",description:"<p>The tag to be starred</p>"}]},examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredModels",title:"Adds a starred models for the logged user",name:"StarModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>teamspace where model resides</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>model ID  to add</p>"}]},examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredMeta",title:"removes a starred metadata tag for the logged user if the tag exists",name:"UnstarMetadataTags",group:"User",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",description:"<p>The tag to be starred</p>"}]},examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredModels",title:"removes a starred models for the logged user if the tag exists",name:"UnstarModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>teamspace where model resides</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>model ID  to remove</p>"}]},examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/apikey",title:"Deletes the current apikey for the logged user",name:"deleteApiKey_HTTP/1.1_200_OK_{}",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/apikey",title:"Generates an apikey for the logged user",name:"generateApiKey",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   apiKey:"20f947a673dce5419ce187ca7998a68f"
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/me",title:"Gets the profile for the logged user",name:"getProfile",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   username: "jasonv",
   firstName: "Jason",
   lastName: "Voorhees",
   email: "jason@vorhees.com",
   hasAvatar: true
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/:teamspace/:model/viewpoints/",title:"Create view",name:"createView",group:"Views",description:"<p>Create a new view.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Name of view</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint</p>"},{group:"Request body",type:"String",optional:!1,field:"screenshot",description:"<p>Screenshot</p>"},{group:"Request body",type:"String",optional:!0,field:"clippingPlanes",description:"<p>List of clipping planes</p>"}],"Request body: screenshot":[{group:"Request body: screenshot",type:"String",optional:!1,field:"base64",description:"<p>Screenshot image in base64</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
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
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"delete",url:"/:teamspace/:model/viewpoints/:viewId",title:"Delete view",name:"deleteView",group:"Views",description:"<p>Delete a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints/:viewId",title:"Get view",name:"findView",group:"Views",description:"<p>Retrieve a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>The right vector of the viewpoint indicating the direction of right in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>The up vector of the viewpoint indicating the direction of up in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>The position vector indicates where in the world the viewpoint is positioned.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>The vector indicating where in the world the viewpoint is looking at.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>The vector indicating where is the viewpoint is looking at in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"png"}],fields:{"View object":[{group:"View object",type:"String",optional:!1,field:"_id",description:"<p>View ID</p>"},{group:"View object",type:"String",optional:!1,field:"name",description:"<p>Name of view</p>"},{group:"View object",type:"String",optional:!1,field:"thumbnail",description:"<p>Thumbnail image</p>"},{group:"View object",type:"ResultViewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint properties</p>"},{group:"View object",type:"Number[]",optional:!1,field:"clippingPlanes",description:"<p>[DEPRECATED] Array of clipping planes</p>"},{group:"View object",type:"Object",optional:!1,field:"screenshot",description:"<p>[DEPRECATED] Screenshot object</p>"}]}},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints/:viewId/thumbnail.png",title:"Get view thumbnail",name:"getThumbnail",group:"Views",description:"<p>Retrieve a view's thumbnail image.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000/thumbnail.png HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints",title:"List all views",name:"listViews",group:"Views",description:"<p>List all model views.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object[]",optional:!1,field:"views",description:"<p>List of view objects</p>"}],"View object":[{group:"View object",type:"String",optional:!1,field:"_id",description:"<p>View ID</p>"},{group:"View object",type:"String",optional:!1,field:"name",description:"<p>Name of view</p>"},{group:"View object",type:"String",optional:!1,field:"thumbnail",description:"<p>Thumbnail image</p>"},{group:"View object",type:"ResultViewpoint",optional:!1,field:"viewpoint",description:"<p>Viewpoint properties</p>"},{group:"View object",type:"Number[]",optional:!1,field:"clippingPlanes",description:"<p>[DEPRECATED] Array of clipping planes</p>"},{group:"View object",type:"Object",optional:!1,field:"screenshot",description:"<p>[DEPRECATED] Screenshot object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1",type:"get"}],version:"0.0.0",filename:"view.js",groupTitle:"Views",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"right",description:"<p>The right vector of the viewpoint indicating the direction of right in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"up",description:"<p>The up vector of the viewpoint indicating the direction of up in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"position",description:"<p>The position vector indicates where in the world the viewpoint is positioned.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"look_at",description:"<p>The vector indicating where in the world the viewpoint is looking at.</p>"},{group:"Type: ResultViewpoint",type:"Number[3]",optional:!1,field:"view_dir",description:"<p>The vector indicating where is the viewpoint is looking at in relative coordinates.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number[3]",optional:!1,field:"normal",description:"<p>The normal of the plane defined for the clipping plane</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"put",url:"/:teamspace/:model/viewpoints/:viewId",title:"Update view",name:"updateView",group:"Views",description:"<p>Update a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",description:"<p>Name of view</p>"}]}},examples:[{title:"Example usage:",content:`PUT /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
{
	"name":"NewName"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000001"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"}];const Z={name:"Acme project",version:"4.23.1",description:"REST Api",sampleUrl:!1,defaultVersion:"0.0.0",apidoc:"0.3.0",generator:{name:"apidoc",time:"Tue Apr 05 2022 19:43:59 GMT+0100 (British Summer Time)",url:"https://apidocjs.com",version:"0.51.0"}};tt();const de=p().compile(v()("#template-header").html()),_e=p().compile(v()("#template-footer").html()),ne=p().compile(v()("#template-article").html()),ge=p().compile(v()("#template-compare-article").html()),ce=p().compile(v()("#template-generator").html()),Te=p().compile(v()("#template-project").html()),Ce=p().compile(v()("#template-sections").html()),ke=p().compile(v()("#template-sidenav").html()),Re={aloneDisplay:!1,showRequiredLabels:!1,withGenerator:!0,withCompare:!0};Z.template=Object.assign(Re,(It=Z.template)!=null?It:{}),Z.template.forceLanguage&&yn(Z.template.forceLanguage);const xe=(0,s.groupBy)(fe,ye=>ye.group),Fe={};v().each(xe,(ye,pe)=>{Fe[ye]=(0,s.groupBy)(pe,Se=>Se.name)});const $e=[];v().each(Fe,(ye,pe)=>{let Se=[];v().each(pe,(we,Ne)=>{const ot=Ne[0].title;ot&&Se.push(ot.toLowerCase()+"#~#"+we)}),Se.sort(),Z.order&&(Se=Oe(Se,Z.order,"#~#")),Se.forEach(we=>{const ot=we.split("#~#")[1];pe[ot].forEach(Be=>{$e.push(Be)})})}),fe=$e;let rt={};const _t={};let Ve={};Ve[Z.version]=1,v().each(fe,(ye,pe)=>{rt[pe.group]=1,_t[pe.group]=pe.groupTitle||pe.group,Ve[pe.version]=1}),rt=Object.keys(rt),rt.sort(),Z.order&&(rt=Pt(_t,Z.order)),Ve=Object.keys(Ve),Ve.sort(i().compare),Ve.reverse();const vt=[];rt.forEach(ye=>{vt.push({group:ye,isHeader:!0,title:_t[ye]});let pe="";fe.forEach(Se=>{Se.group===ye&&(pe!==Se.name?vt.push({title:Se.title,group:ye,name:Se.name,type:Se.type,version:Se.version,url:Se.url}):vt.push({title:Se.title,group:ye,hidden:!0,name:Se.name,type:Se.type,version:Se.version,url:Se.url}),pe=Se.name)})});function O(ye,pe,Se){let we=!1;if(!pe)return we;const Ne=pe.match(/<h(1|2).*?>(.+?)<\/h(1|2)>/gi);return Ne&&Ne.forEach(function(ot){const Be=ot.substring(2,3),Gt=ot.replace(/<.+?>/g,""),En=ot.match(/id="api-([^-]+)(?:-(.+))?"/),Pn=En?En[1]:null,xn=En?En[2]:null;Be==="1"&&Gt&&Pn&&(ye.splice(Se,0,{group:Pn,isHeader:!0,title:Gt,isFixed:!0}),Se++,we=!0),Be==="2"&&Gt&&Pn&&xn&&(ye.splice(Se,0,{group:Pn,name:xn,isHeader:!1,title:Gt,isFixed:!1,version:"1.0"}),Se++)}),we}let U;if(Z.header&&(U=O(vt,Z.header.content,0),U||vt.unshift({group:"_header",isHeader:!0,title:Z.header.title==null?Kt("General"):Z.header.title,isFixed:!0})),Z.footer){const ye=vt.length;U=O(vt,Z.footer.content,vt.length),!U&&Z.footer.title!=null&&vt.splice(ye,0,{group:"_footer",isHeader:!0,title:Z.footer.title,isFixed:!0})}const V=Z.title?Z.title:"apiDoc: "+Z.name+" - "+Z.version;v()(document).attr("title",V),v()("#loader").remove();const ie={nav:vt};v()("#sidenav").append(ke(ie)),v()("#generator").append(ce(Z)),(0,s.extend)(Z,{versions:Ve}),v()("#project").append(Te(Z)),Z.header&&v()("#header").append(de(Z.header)),Z.footer&&(v()("#footer").append(_e(Z.footer)),Z.template.aloneDisplay&&document.getElementById("api-_footer").classList.add("hide"));const Y={};let re="";rt.forEach(function(ye){const pe=[];let Se="",we={},Ne=ye,ot="";Y[ye]={},fe.forEach(function(Be){ye===Be.group&&(Se!==Be.name?(fe.forEach(function(Gt){ye===Gt.group&&Be.name===Gt.name&&(Object.prototype.hasOwnProperty.call(Y[Be.group],Be.name)||(Y[Be.group][Be.name]=[]),Y[Be.group][Be.name].push(Gt.version))}),we={article:Be,versions:Y[Be.group][Be.name]}):we={article:Be,hidden:!0,versions:Y[Be.group][Be.name]},Z.sampleUrl&&Z.sampleUrl===!0&&(Z.sampleUrl=window.location.origin),Z.url&&we.article.url.substr(0,4).toLowerCase()!=="http"&&(we.article.url=Z.url+we.article.url),He(we,Be),Be.groupTitle&&(Ne=Be.groupTitle),Be.groupDescription&&(ot=Be.groupDescription),pe.push({article:ne(we),group:Be.group,name:Be.name,aloneDisplay:Z.template.aloneDisplay}),Se=Be.name)}),we={group:ye,title:Ne,description:ot,articles:pe,aloneDisplay:Z.template.aloneDisplay},re+=Ce(we)}),v()("#sections").append(re),Z.template.aloneDisplay||(document.body.dataset.spy="scroll",v()("body").scrollspy({target:"#scrollingNav"})),v()(".form-control").on("focus change",function(){v()(this).removeClass("border-danger")}),v()(".sidenav").find("a").on("click",function(ye){ye.preventDefault();const pe=this.getAttribute("href");if(Z.template.aloneDisplay){const Se=document.querySelector(".sidenav > li.active");Se&&Se.classList.remove("active"),this.parentNode.classList.add("active")}else{const Se=document.querySelector(pe);Se&&v()("html,body").animate({scrollTop:Se.offsetTop},400)}window.location.hash=pe});function se(ye){let pe=!1;return v().each(ye,Se=>{pe=pe||(0,s.some)(ye[Se],we=>we.type)}),pe}function be(){v()('button[data-toggle="popover"]').popover().click(function(pe){pe.preventDefault()});const ye=v()("#version strong").html();if(v()("#sidenav li").removeClass("is-new"),Z.template.withCompare&&v()("#sidenav li[data-version='"+ye+"']").each(function(){const pe=v()(this).data("group"),Se=v()(this).data("name"),we=v()("#sidenav li[data-group='"+pe+"'][data-name='"+Se+"']").length,Ne=v()("#sidenav li[data-group='"+pe+"'][data-name='"+Se+"']").index(v()(this));(we===1||Ne===we-1)&&v()(this).addClass("is-new")}),v()(".nav-tabs-examples a").click(function(pe){pe.preventDefault(),v()(this).tab("show")}),v()(".nav-tabs-examples").find("a:first").tab("show"),v()(".sample-request-content-type-switch").change(function(){v()(this).val()==="body-form-data"?(v()("#sample-request-body-json-input-"+v()(this).data("id")).hide(),v()("#sample-request-body-form-input-"+v()(this).data("id")).show()):(v()("#sample-request-body-form-input-"+v()(this).data("id")).hide(),v()("#sample-request-body-json-input-"+v()(this).data("id")).show())}),Z.template.aloneDisplay&&(v()(".show-group").click(function(){const pe="."+v()(this).attr("data-group")+"-group",Se="."+v()(this).attr("data-group")+"-article";v()(".show-api-group").addClass("hide"),v()(pe).removeClass("hide"),v()(".show-api-article").addClass("hide"),v()(Se).removeClass("hide")}),v()(".show-api").click(function(){const pe=this.getAttribute("href").substring(1),Se=document.getElementById("version").textContent.trim(),we=`.${this.dataset.name}-article`,Ne=`[id="${pe}-${Se}"]`,ot=`.${this.dataset.group}-group`;v()(".show-api-group").addClass("hide"),v()(ot).removeClass("hide"),v()(".show-api-article").addClass("hide");let Be=v()(we);v()(Ne).length&&(Be=v()(Ne).parent()),Be.removeClass("hide"),pe.match(/_(header|footer)/)&&document.getElementById(pe).classList.remove("hide")})),Z.template.aloneDisplay||v()("body").scrollspy("refresh"),Z.template.aloneDisplay){const pe=window.location.hash;if(pe!=null&&pe.length!==0){const Se=document.getElementById("version").textContent.trim(),we=document.querySelector(`li .${pe.slice(1)}-init`),Ne=document.querySelector(`li[data-version="${Se}"] .show-api.${pe.slice(1)}-init`);let ot=we;Ne&&(ot=Ne),ot.click()}}}function Pe(ye){typeof ye=="undefined"?ye=v()("#version strong").html():v()("#version strong").html(ye),v()("article").addClass("hide"),v()("#sidenav li:not(.nav-fixed)").addClass("hide");const pe={};document.querySelectorAll("article[data-version]").forEach(Se=>{const we=Se.dataset.group,Ne=Se.dataset.name,ot=Se.dataset.version,Be=we+Ne;!pe[Be]&&i().lte(ot,ye)&&(pe[Be]=!0,document.querySelector(`article[data-group="${we}"][data-name="${Ne}"][data-version="${ot}"]`).classList.remove("hide"),document.querySelector(`#sidenav li[data-group="${we}"][data-name="${Ne}"][data-version="${ot}"]`).classList.remove("hide"),document.querySelector(`#sidenav li.nav-header[data-group="${we}"]`).classList.remove("hide"))}),v()("article[data-version]").each(function(Se){const we=v()(this).data("group");v()("section#api-"+we).removeClass("hide"),v()("section#api-"+we+" article:visible").length===0?v()("section#api-"+we).addClass("hide"):v()("section#api-"+we).removeClass("hide")})}if(Pe(),v()("#versions li.version a").on("click",function(ye){ye.preventDefault(),Pe(v()(this).html())}),v()("#compareAllWithPredecessor").on("click",Le),v()("article .versions li.version a").on("click",Me),v().urlParam=function(ye){const pe=new RegExp("[\\?&amp;]"+ye+"=([^&amp;#]*)").exec(window.location.href);return pe&&pe[1]?pe[1]:null},v().urlParam("compare")&&v()("#compareAllWithPredecessor").trigger("click"),window.location.hash){const ye=decodeURI(window.location.hash);v()(ye).length>0&&v()("html,body").animate({scrollTop:parseInt(v()(ye).offset().top)},0)}v()("#scrollingNav .sidenav-search input.search").focus(),v()('[data-action="filter-search"]').on("keyup",ye=>{const pe=ye.currentTarget.value.toLowerCase();v()(".sidenav").find("a.nav-list-item").each((Se,we)=>{v()(we).show(),we.innerText.toLowerCase().includes(pe)||v()(we).hide()})}),v()("span.search-reset").on("click",function(){v()("#scrollingNav .sidenav-search input.search").val("").focus(),v()(".sidenav").find("a.nav-list-item").show()});function Me(ye){ye.preventDefault();const pe=v()(this).parents("article"),Se=v()(this).html(),we=pe.find(".version"),Ne=we.find("strong").html();we.find("strong").html(Se);const ot=pe.data("group"),Be=pe.data("name"),Gt=pe.data("version"),En=pe.data("compare-version");if(En!==Se&&!(!En&&Gt===Se)){if(En&&Y[ot][Be][0]===Se||Gt===Se)at(ot,Be,Gt);else{let Pn={},xn={};v().each(Fe[ot][Be],function(Lo,ii){ii.version===Gt&&(Pn=ii),ii.version===Se&&(xn=ii)});const mt={article:Pn,compare:xn,versions:Y[ot][Be]};mt.article.id=mt.article.group+"-"+mt.article.name+"-"+mt.article.version,mt.article.id=mt.article.id.replace(/\./g,"_"),mt.compare.id=mt.compare.group+"-"+mt.compare.name+"-"+mt.compare.version,mt.compare.id=mt.compare.id.replace(/\./g,"_");let ht=Pn;ht.parameter&&ht.parameter.fields&&(mt._hasTypeInParameterFields=se(ht.parameter.fields)),ht.error&&ht.error.fields&&(mt._hasTypeInErrorFields=se(ht.error.fields)),ht.success&&ht.success.fields&&(mt._hasTypeInSuccessFields=se(ht.success.fields)),ht.info&&ht.info.fields&&(mt._hasTypeInInfoFields=se(ht.info.fields)),ht=xn,mt._hasTypeInParameterFields!==!0&&ht.parameter&&ht.parameter.fields&&(mt._hasTypeInParameterFields=se(ht.parameter.fields)),mt._hasTypeInErrorFields!==!0&&ht.error&&ht.error.fields&&(mt._hasTypeInErrorFields=se(ht.error.fields)),mt._hasTypeInSuccessFields!==!0&&ht.success&&ht.success.fields&&(mt._hasTypeInSuccessFields=se(ht.success.fields)),mt._hasTypeInInfoFields!==!0&&ht.info&&ht.info.fields&&(mt._hasTypeInInfoFields=se(ht.info.fields));const Sr=ge(mt);pe.after(Sr),pe.next().find(".versions li.version a").on("click",Me),v()("#sidenav li[data-group='"+ot+"'][data-name='"+Be+"'][data-version='"+Ne+"']").addClass("has-modifications"),pe.remove()}g().highlightAll()}}function Le(ye){ye.preventDefault(),v()("article:visible .versions").each(function(){const Se=v()(this).parents("article").data("version");let we=null;v()(this).find("li.version a").each(function(){v()(this).html()<Se&&!we&&(we=v()(this))}),we&&we.trigger("click")})}function He(ye,pe){ye.id=ye.article.group+"-"+ye.article.name+"-"+ye.article.version,ye.id=ye.id.replace(/\./g,"_"),pe.header&&pe.header.fields&&(ye._hasTypeInHeaderFields=se(pe.header.fields)),pe.parameter&&pe.parameter.fields&&(ye._hasTypeInParameterFields=se(pe.parameter.fields)),pe.error&&pe.error.fields&&(ye._hasTypeInErrorFields=se(pe.error.fields)),pe.success&&pe.success.fields&&(ye._hasTypeInSuccessFields=se(pe.success.fields)),pe.info&&pe.info.fields&&(ye._hasTypeInInfoFields=se(pe.info.fields)),ye.template=Z.template}function Ye(ye,pe,Se){let we={};v().each(Fe[ye][pe],function(ot,Be){Be.version===Se&&(we=Be)});const Ne={article:we,versions:Y[ye][pe]};return He(Ne,we),ne(Ne)}function at(ye,pe,Se){const we=v()("article[data-group='"+ye+"'][data-name='"+pe+"']:visible"),Ne=Ye(ye,pe,Se);we.after(Ne),we.next().find(".versions li.version a").on("click",Me),v()("#sidenav li[data-group='"+ye+"'][data-name='"+pe+"'][data-version='"+Se+"']").removeClass("has-modifications"),we.remove()}function Oe(ye,pe,Se){const we=[];return pe.forEach(function(Ne){Se?ye.forEach(function(ot){const Be=ot.split(Se);(Be[0]===Ne||Be[1]===Ne)&&we.push(ot)}):ye.forEach(function(ot){ot===Ne&&we.push(Ne)})}),ye.forEach(function(Ne){we.indexOf(Ne)===-1&&we.push(Ne)}),we}function Pt(ye,pe){const Se=[];return pe.forEach(we=>{Object.keys(ye).forEach(Ne=>{ye[Ne].replace(/_/g," ")===we&&Se.push(Ne)})}),Object.keys(ye).forEach(we=>{Se.indexOf(we)===-1&&Se.push(we)}),Se}be()}})()})();
