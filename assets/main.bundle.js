(()=>{var Xo={9746:(P,h,i)=>{const l=Symbol("SemVer ANY");class r{static get ANY(){return l}constructor(g,d){if(d=n(d),g instanceof r){if(g.loose===!!d.loose)return g;g=g.value}g=g.trim().split(/\s+/).join(" "),o("comparator",g,d),this.options=d,this.loose=!!d.loose,this.parse(g),this.semver===l?this.value="":this.value=this.operator+this.semver.version,o("comp",this)}parse(g){const d=this.options.loose?p[m.COMPARATORLOOSE]:p[m.COMPARATOR],c=g.match(d);if(!c)throw new TypeError(`Invalid comparator: ${g}`);this.operator=c[1]!==void 0?c[1]:"",this.operator==="="&&(this.operator=""),c[2]?this.semver=new u(c[2],this.options.loose):this.semver=l}toString(){return this.value}test(g){if(o("Comparator.test",g,this.options.loose),this.semver===l||g===l)return!0;if(typeof g=="string")try{g=new u(g,this.options)}catch(d){return!1}return f(g,this.operator,this.semver,this.options)}intersects(g,d){if(!(g instanceof r))throw new TypeError("a Comparator is required");return this.operator===""?this.value===""?!0:new v(g.value,d).test(this.value):g.operator===""?g.value===""?!0:new v(this.value,d).test(g.semver):(d=n(d),d.includePrerelease&&(this.value==="<0.0.0-0"||g.value==="<0.0.0-0")||!d.includePrerelease&&(this.value.startsWith("<0.0.0")||g.value.startsWith("<0.0.0"))?!1:!!(this.operator.startsWith(">")&&g.operator.startsWith(">")||this.operator.startsWith("<")&&g.operator.startsWith("<")||this.semver.version===g.semver.version&&this.operator.includes("=")&&g.operator.includes("=")||f(this.semver,"<",g.semver,d)&&this.operator.startsWith(">")&&g.operator.startsWith("<")||f(this.semver,">",g.semver,d)&&this.operator.startsWith("<")&&g.operator.startsWith(">")))}}P.exports=r;const n=i(525),{safeRe:p,t:m}=i(6920),f=i(8453),o=i(9874),u=i(1966),v=i(3573)},3573:(P,h,i)=>{class l{constructor(F,H){if(H=p(H),F instanceof l)return F.loose===!!H.loose&&F.includePrerelease===!!H.includePrerelease?F:new l(F.raw,H);if(F instanceof m)return this.raw=F.value,this.set=[[F]],this.format(),this;if(this.options=H,this.loose=!!H.loose,this.includePrerelease=!!H.includePrerelease,this.raw=F.trim().split(/\s+/).join(" "),this.set=this.raw.split("||").map(K=>this.parseRange(K.trim())).filter(K=>K.length),!this.set.length)throw new TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){const K=this.set[0];if(this.set=this.set.filter(U=>!y(U[0])),this.set.length===0)this.set=[K];else if(this.set.length>1){for(const U of this.set)if(U.length===1&&T(U[0])){this.set=[U];break}}}this.format()}format(){return this.range=this.set.map(F=>F.join(" ").trim()).join("||").trim(),this.range}toString(){return this.range}parseRange(F){const K=((this.options.includePrerelease&&c)|(this.options.loose&&b))+":"+F,U=n.get(K);if(U)return U;const Z=this.options.loose,ie=Z?u[v.HYPHENRANGELOOSE]:u[v.HYPHENRANGE];F=F.replace(ie,G(this.options.includePrerelease)),f("hyphen replace",F),F=F.replace(u[v.COMPARATORTRIM],s),f("comparator trim",F),F=F.replace(u[v.TILDETRIM],g),f("tilde trim",F),F=F.replace(u[v.CARETTRIM],d),f("caret trim",F);let ue=F.split(" ").map(Se=>A(Se,this.options)).join(" ").split(/\s+/).map(Se=>k(Se,this.options));Z&&(ue=ue.filter(Se=>(f("loose invalid filter",Se,this.options),!!Se.match(u[v.COMPARATORLOOSE])))),f("range list",ue);const J=new Map,be=ue.map(Se=>new m(Se,this.options));for(const Se of be){if(y(Se))return[Se];J.set(Se.value,Se)}J.size>1&&J.has("")&&J.delete("");const Ae=[...J.values()];return n.set(K,Ae),Ae}intersects(F,H){if(!(F instanceof l))throw new TypeError("a Range is required");return this.set.some(K=>_(K,H)&&F.set.some(U=>_(U,H)&&K.every(Z=>U.every(ie=>Z.intersects(ie,H)))))}test(F){if(!F)return!1;if(typeof F=="string")try{F=new o(F,this.options)}catch(H){return!1}for(let H=0;H<this.set.length;H++)if(W(this.set[H],F,this.options))return!0;return!1}}P.exports=l;const r=i(8108),n=new r,p=i(525),m=i(9746),f=i(9874),o=i(1966),{safeRe:u,t:v,comparatorTrimReplace:s,tildeTrimReplace:g,caretTrimReplace:d}=i(6920),{FLAG_INCLUDE_PRERELEASE:c,FLAG_LOOSE:b}=i(1924),y=L=>L.value==="<0.0.0-0",T=L=>L.value==="",_=(L,F)=>{let H=!0;const K=L.slice();let U=K.pop();for(;H&&K.length;)H=K.every(Z=>U.intersects(Z,F)),U=K.pop();return H},A=(L,F)=>(f("comp",L,F),L=B(L,F),f("caret",L),L=I(L,F),f("tildes",L),L=R(L,F),f("xrange",L),L=D(L,F),f("stars",L),L),E=L=>!L||L.toLowerCase()==="x"||L==="*",I=(L,F)=>L.trim().split(/\s+/).map(H=>N(H,F)).join(" "),N=(L,F)=>{const H=F.loose?u[v.TILDELOOSE]:u[v.TILDE];return L.replace(H,(K,U,Z,ie,ue)=>{f("tilde",L,K,U,Z,ie,ue);let J;return E(U)?J="":E(Z)?J=`>=${U}.0.0 <${+U+1}.0.0-0`:E(ie)?J=`>=${U}.${Z}.0 <${U}.${+Z+1}.0-0`:ue?(f("replaceTilde pr",ue),J=`>=${U}.${Z}.${ie}-${ue} <${U}.${+Z+1}.0-0`):J=`>=${U}.${Z}.${ie} <${U}.${+Z+1}.0-0`,f("tilde return",J),J})},B=(L,F)=>L.trim().split(/\s+/).map(H=>C(H,F)).join(" "),C=(L,F)=>{f("caret",L,F);const H=F.loose?u[v.CARETLOOSE]:u[v.CARET],K=F.includePrerelease?"-0":"";return L.replace(H,(U,Z,ie,ue,J)=>{f("caret",L,U,Z,ie,ue,J);let be;return E(Z)?be="":E(ie)?be=`>=${Z}.0.0${K} <${+Z+1}.0.0-0`:E(ue)?Z==="0"?be=`>=${Z}.${ie}.0${K} <${Z}.${+ie+1}.0-0`:be=`>=${Z}.${ie}.0${K} <${+Z+1}.0.0-0`:J?(f("replaceCaret pr",J),Z==="0"?ie==="0"?be=`>=${Z}.${ie}.${ue}-${J} <${Z}.${ie}.${+ue+1}-0`:be=`>=${Z}.${ie}.${ue}-${J} <${Z}.${+ie+1}.0-0`:be=`>=${Z}.${ie}.${ue}-${J} <${+Z+1}.0.0-0`):(f("no pr"),Z==="0"?ie==="0"?be=`>=${Z}.${ie}.${ue}${K} <${Z}.${ie}.${+ue+1}-0`:be=`>=${Z}.${ie}.${ue}${K} <${Z}.${+ie+1}.0-0`:be=`>=${Z}.${ie}.${ue} <${+Z+1}.0.0-0`),f("caret return",be),be})},R=(L,F)=>(f("replaceXRanges",L,F),L.split(/\s+/).map(H=>w(H,F)).join(" ")),w=(L,F)=>{L=L.trim();const H=F.loose?u[v.XRANGELOOSE]:u[v.XRANGE];return L.replace(H,(K,U,Z,ie,ue,J)=>{f("xRange",L,K,U,Z,ie,ue,J);const be=E(Z),Ae=be||E(ie),Se=Ae||E(ue),Xe=Se;return U==="="&&Xe&&(U=""),J=F.includePrerelease?"-0":"",be?U===">"||U==="<"?K="<0.0.0-0":K="*":U&&Xe?(Ae&&(ie=0),ue=0,U===">"?(U=">=",Ae?(Z=+Z+1,ie=0,ue=0):(ie=+ie+1,ue=0)):U==="<="&&(U="<",Ae?Z=+Z+1:ie=+ie+1),U==="<"&&(J="-0"),K=`${U+Z}.${ie}.${ue}${J}`):Ae?K=`>=${Z}.0.0${J} <${+Z+1}.0.0-0`:Se&&(K=`>=${Z}.${ie}.0${J} <${Z}.${+ie+1}.0-0`),f("xRange return",K),K})},D=(L,F)=>(f("replaceStars",L,F),L.trim().replace(u[v.STAR],"")),k=(L,F)=>(f("replaceGTE0",L,F),L.trim().replace(u[F.includePrerelease?v.GTE0PRE:v.GTE0],"")),G=L=>(F,H,K,U,Z,ie,ue,J,be,Ae,Se,Xe)=>(E(K)?H="":E(U)?H=`>=${K}.0.0${L?"-0":""}`:E(Z)?H=`>=${K}.${U}.0${L?"-0":""}`:ie?H=`>=${H}`:H=`>=${H}${L?"-0":""}`,E(be)?J="":E(Ae)?J=`<${+be+1}.0.0-0`:E(Se)?J=`<${be}.${+Ae+1}.0-0`:Xe?J=`<=${be}.${Ae}.${Se}-${Xe}`:L?J=`<${be}.${Ae}.${+Se+1}-0`:J=`<=${J}`,`${H} ${J}`.trim()),W=(L,F,H)=>{for(let K=0;K<L.length;K++)if(!L[K].test(F))return!1;if(F.prerelease.length&&!H.includePrerelease){for(let K=0;K<L.length;K++)if(f(L[K].semver),L[K].semver!==m.ANY&&L[K].semver.prerelease.length>0){const U=L[K].semver;if(U.major===F.major&&U.minor===F.minor&&U.patch===F.patch)return!0}return!1}return!0}},1966:(P,h,i)=>{const l=i(9874),{MAX_LENGTH:r,MAX_SAFE_INTEGER:n}=i(1924),{safeRe:p,t:m}=i(6920),f=i(525),{compareIdentifiers:o}=i(3853);class u{constructor(s,g){if(g=f(g),s instanceof u){if(s.loose===!!g.loose&&s.includePrerelease===!!g.includePrerelease)return s;s=s.version}else if(typeof s!="string")throw new TypeError(`Invalid version. Must be a string. Got type "${typeof s}".`);if(s.length>r)throw new TypeError(`version is longer than ${r} characters`);l("SemVer",s,g),this.options=g,this.loose=!!g.loose,this.includePrerelease=!!g.includePrerelease;const d=s.trim().match(g.loose?p[m.LOOSE]:p[m.FULL]);if(!d)throw new TypeError(`Invalid Version: ${s}`);if(this.raw=s,this.major=+d[1],this.minor=+d[2],this.patch=+d[3],this.major>n||this.major<0)throw new TypeError("Invalid major version");if(this.minor>n||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>n||this.patch<0)throw new TypeError("Invalid patch version");d[4]?this.prerelease=d[4].split(".").map(c=>{if(/^[0-9]+$/.test(c)){const b=+c;if(b>=0&&b<n)return b}return c}):this.prerelease=[],this.build=d[5]?d[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(s){if(l("SemVer.compare",this.version,this.options,s),!(s instanceof u)){if(typeof s=="string"&&s===this.version)return 0;s=new u(s,this.options)}return s.version===this.version?0:this.compareMain(s)||this.comparePre(s)}compareMain(s){return s instanceof u||(s=new u(s,this.options)),o(this.major,s.major)||o(this.minor,s.minor)||o(this.patch,s.patch)}comparePre(s){if(s instanceof u||(s=new u(s,this.options)),this.prerelease.length&&!s.prerelease.length)return-1;if(!this.prerelease.length&&s.prerelease.length)return 1;if(!this.prerelease.length&&!s.prerelease.length)return 0;let g=0;do{const d=this.prerelease[g],c=s.prerelease[g];if(l("prerelease compare",g,d,c),d===void 0&&c===void 0)return 0;if(c===void 0)return 1;if(d===void 0)return-1;if(d===c)continue;return o(d,c)}while(++g)}compareBuild(s){s instanceof u||(s=new u(s,this.options));let g=0;do{const d=this.build[g],c=s.build[g];if(l("build compare",g,d,c),d===void 0&&c===void 0)return 0;if(c===void 0)return 1;if(d===void 0)return-1;if(d===c)continue;return o(d,c)}while(++g)}inc(s,g,d){switch(s){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",g,d);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",g,d);break;case"prepatch":this.prerelease.length=0,this.inc("patch",g,d),this.inc("pre",g,d);break;case"prerelease":this.prerelease.length===0&&this.inc("patch",g,d),this.inc("pre",g,d);break;case"major":(this.minor!==0||this.patch!==0||this.prerelease.length===0)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(this.patch!==0||this.prerelease.length===0)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":this.prerelease.length===0&&this.patch++,this.prerelease=[];break;case"pre":{const c=Number(d)?1:0;if(!g&&d===!1)throw new Error("invalid increment argument: identifier is empty");if(this.prerelease.length===0)this.prerelease=[c];else{let b=this.prerelease.length;for(;--b>=0;)typeof this.prerelease[b]=="number"&&(this.prerelease[b]++,b=-2);if(b===-1){if(g===this.prerelease.join(".")&&d===!1)throw new Error("invalid increment argument: identifier already exists");this.prerelease.push(c)}}if(g){let b=[g,c];d===!1&&(b=[g]),o(this.prerelease[0],g)===0?isNaN(this.prerelease[1])&&(this.prerelease=b):this.prerelease=b}break}default:throw new Error(`invalid increment argument: ${s}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}P.exports=u},9816:(P,h,i)=>{const l=i(1954),r=(n,p)=>{const m=l(n.trim().replace(/^[=v]+/,""),p);return m?m.version:null};P.exports=r},8453:(P,h,i)=>{const l=i(7855),r=i(1485),n=i(5814),p=i(4815),m=i(6841),f=i(586),o=(u,v,s,g)=>{switch(v){case"===":return typeof u=="object"&&(u=u.version),typeof s=="object"&&(s=s.version),u===s;case"!==":return typeof u=="object"&&(u=u.version),typeof s=="object"&&(s=s.version),u!==s;case"":case"=":case"==":return l(u,s,g);case"!=":return r(u,s,g);case">":return n(u,s,g);case">=":return p(u,s,g);case"<":return m(u,s,g);case"<=":return f(u,s,g);default:throw new TypeError(`Invalid operator: ${v}`)}};P.exports=o},648:(P,h,i)=>{const l=i(1966),r=i(1954),{safeRe:n,t:p}=i(6920),m=(f,o)=>{if(f instanceof l)return f;if(typeof f=="number"&&(f=String(f)),typeof f!="string")return null;o=o||{};let u=null;if(!o.rtl)u=f.match(o.includePrerelease?n[p.COERCEFULL]:n[p.COERCE]);else{const b=o.includePrerelease?n[p.COERCERTLFULL]:n[p.COERCERTL];let y;for(;(y=b.exec(f))&&(!u||u.index+u[0].length!==f.length);)(!u||y.index+y[0].length!==u.index+u[0].length)&&(u=y),b.lastIndex=y.index+y[1].length+y[2].length;b.lastIndex=-1}if(u===null)return null;const v=u[2],s=u[3]||"0",g=u[4]||"0",d=o.includePrerelease&&u[5]?`-${u[5]}`:"",c=o.includePrerelease&&u[6]?`+${u[6]}`:"";return r(`${v}.${s}.${g}${d}${c}`,o)};P.exports=m},8879:(P,h,i)=>{const l=i(1966),r=(n,p,m)=>{const f=new l(n,m),o=new l(p,m);return f.compare(o)||f.compareBuild(o)};P.exports=r},2597:(P,h,i)=>{const l=i(2606),r=(n,p)=>l(n,p,!0);P.exports=r},2606:(P,h,i)=>{const l=i(1966),r=(n,p,m)=>new l(n,m).compare(new l(p,m));P.exports=r},4094:(P,h,i)=>{const l=i(1954),r=(n,p)=>{const m=l(n,null,!0),f=l(p,null,!0),o=m.compare(f);if(o===0)return null;const u=o>0,v=u?m:f,s=u?f:m,g=!!v.prerelease.length;if(!!s.prerelease.length&&!g)return!s.patch&&!s.minor?"major":v.patch?"patch":v.minor?"minor":"major";const c=g?"pre":"";return m.major!==f.major?c+"major":m.minor!==f.minor?c+"minor":m.patch!==f.patch?c+"patch":"prerelease"};P.exports=r},7855:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)===0;P.exports=r},5814:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)>0;P.exports=r},4815:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)>=0;P.exports=r},1913:(P,h,i)=>{const l=i(1966),r=(n,p,m,f,o)=>{typeof m=="string"&&(o=f,f=m,m=void 0);try{return new l(n instanceof l?n.version:n,m).inc(p,f,o).version}catch(u){return null}};P.exports=r},6841:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)<0;P.exports=r},586:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)<=0;P.exports=r},8480:(P,h,i)=>{const l=i(1966),r=(n,p)=>new l(n,p).major;P.exports=r},6812:(P,h,i)=>{const l=i(1966),r=(n,p)=>new l(n,p).minor;P.exports=r},1485:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(n,p,m)!==0;P.exports=r},1954:(P,h,i)=>{const l=i(1966),r=(n,p,m=!1)=>{if(n instanceof l)return n;try{return new l(n,p)}catch(f){if(!m)return null;throw f}};P.exports=r},8163:(P,h,i)=>{const l=i(1966),r=(n,p)=>new l(n,p).patch;P.exports=r},8883:(P,h,i)=>{const l=i(1954),r=(n,p)=>{const m=l(n,p);return m&&m.prerelease.length?m.prerelease:null};P.exports=r},5304:(P,h,i)=>{const l=i(2606),r=(n,p,m)=>l(p,n,m);P.exports=r},9215:(P,h,i)=>{const l=i(8879),r=(n,p)=>n.sort((m,f)=>l(f,m,p));P.exports=r},2088:(P,h,i)=>{const l=i(3573),r=(n,p,m)=>{try{p=new l(p,m)}catch(f){return!1}return p.test(n)};P.exports=r},865:(P,h,i)=>{const l=i(8879),r=(n,p)=>n.sort((m,f)=>l(m,f,p));P.exports=r},5575:(P,h,i)=>{const l=i(1954),r=(n,p)=>{const m=l(n,p);return m?m.version:null};P.exports=r},4487:(P,h,i)=>{const l=i(6920),r=i(1924),n=i(1966),p=i(3853),m=i(1954),f=i(5575),o=i(9816),u=i(1913),v=i(4094),s=i(8480),g=i(6812),d=i(8163),c=i(8883),b=i(2606),y=i(5304),T=i(2597),_=i(8879),A=i(865),E=i(9215),I=i(5814),N=i(6841),B=i(7855),C=i(1485),R=i(4815),w=i(586),D=i(8453),k=i(648),G=i(9746),W=i(3573),L=i(2088),F=i(2389),H=i(6698),K=i(752),U=i(8187),Z=i(924),ie=i(8713),ue=i(17),J=i(8408),be=i(8146),Ae=i(1095),Se=i(7606);P.exports={parse:m,valid:f,clean:o,inc:u,diff:v,major:s,minor:g,patch:d,prerelease:c,compare:b,rcompare:y,compareLoose:T,compareBuild:_,sort:A,rsort:E,gt:I,lt:N,eq:B,neq:C,gte:R,lte:w,cmp:D,coerce:k,Comparator:G,Range:W,satisfies:L,toComparators:F,maxSatisfying:H,minSatisfying:K,minVersion:U,validRange:Z,outside:ie,gtr:ue,ltr:J,intersects:be,simplifyRange:Ae,subset:Se,SemVer:n,re:l.re,src:l.src,tokens:l.t,SEMVER_SPEC_VERSION:r.SEMVER_SPEC_VERSION,RELEASE_TYPES:r.RELEASE_TYPES,compareIdentifiers:p.compareIdentifiers,rcompareIdentifiers:p.rcompareIdentifiers}},1924:P=>{const h="2.0.0",l=Number.MAX_SAFE_INTEGER||9007199254740991,r=16,n=256-6,p=["major","premajor","minor","preminor","patch","prepatch","prerelease"];P.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:r,MAX_SAFE_BUILD_LENGTH:n,MAX_SAFE_INTEGER:l,RELEASE_TYPES:p,SEMVER_SPEC_VERSION:h,FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}},9874:P=>{const h=typeof process=="object"&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...i)=>console.error("SEMVER",...i):()=>{};P.exports=h},3853:P=>{const h=/^[0-9]+$/,i=(r,n)=>{const p=h.test(r),m=h.test(n);return p&&m&&(r=+r,n=+n),r===n?0:p&&!m?-1:m&&!p?1:r<n?-1:1},l=(r,n)=>i(n,r);P.exports={compareIdentifiers:i,rcompareIdentifiers:l}},8108:P=>{class h{constructor(){this.max=1e3,this.map=new Map}get(l){const r=this.map.get(l);if(r!==void 0)return this.map.delete(l),this.map.set(l,r),r}delete(l){return this.map.delete(l)}set(l,r){if(!this.delete(l)&&r!==void 0){if(this.map.size>=this.max){const p=this.map.keys().next().value;this.delete(p)}this.map.set(l,r)}return this}}P.exports=h},525:P=>{const h=Object.freeze({loose:!0}),i=Object.freeze({}),l=r=>r?typeof r!="object"?h:r:i;P.exports=l},6920:(P,h,i)=>{const{MAX_SAFE_COMPONENT_LENGTH:l,MAX_SAFE_BUILD_LENGTH:r,MAX_LENGTH:n}=i(1924),p=i(9874);h=P.exports={};const m=h.re=[],f=h.safeRe=[],o=h.src=[],u=h.t={};let v=0;const s="[a-zA-Z0-9-]",g=[["\\s",1],["\\d",n],[s,r]],d=b=>{for(const[y,T]of g)b=b.split(`${y}*`).join(`${y}{0,${T}}`).split(`${y}+`).join(`${y}{1,${T}}`);return b},c=(b,y,T)=>{const _=d(y),A=v++;p(b,A,y),u[b]=A,o[A]=y,m[A]=new RegExp(y,T?"g":void 0),f[A]=new RegExp(_,T?"g":void 0)};c("NUMERICIDENTIFIER","0|[1-9]\\d*"),c("NUMERICIDENTIFIERLOOSE","\\d+"),c("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${s}*`),c("MAINVERSION",`(${o[u.NUMERICIDENTIFIER]})\\.(${o[u.NUMERICIDENTIFIER]})\\.(${o[u.NUMERICIDENTIFIER]})`),c("MAINVERSIONLOOSE",`(${o[u.NUMERICIDENTIFIERLOOSE]})\\.(${o[u.NUMERICIDENTIFIERLOOSE]})\\.(${o[u.NUMERICIDENTIFIERLOOSE]})`),c("PRERELEASEIDENTIFIER",`(?:${o[u.NUMERICIDENTIFIER]}|${o[u.NONNUMERICIDENTIFIER]})`),c("PRERELEASEIDENTIFIERLOOSE",`(?:${o[u.NUMERICIDENTIFIERLOOSE]}|${o[u.NONNUMERICIDENTIFIER]})`),c("PRERELEASE",`(?:-(${o[u.PRERELEASEIDENTIFIER]}(?:\\.${o[u.PRERELEASEIDENTIFIER]})*))`),c("PRERELEASELOOSE",`(?:-?(${o[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[u.PRERELEASEIDENTIFIERLOOSE]})*))`),c("BUILDIDENTIFIER",`${s}+`),c("BUILD",`(?:\\+(${o[u.BUILDIDENTIFIER]}(?:\\.${o[u.BUILDIDENTIFIER]})*))`),c("FULLPLAIN",`v?${o[u.MAINVERSION]}${o[u.PRERELEASE]}?${o[u.BUILD]}?`),c("FULL",`^${o[u.FULLPLAIN]}$`),c("LOOSEPLAIN",`[v=\\s]*${o[u.MAINVERSIONLOOSE]}${o[u.PRERELEASELOOSE]}?${o[u.BUILD]}?`),c("LOOSE",`^${o[u.LOOSEPLAIN]}$`),c("GTLT","((?:<|>)?=?)"),c("XRANGEIDENTIFIERLOOSE",`${o[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),c("XRANGEIDENTIFIER",`${o[u.NUMERICIDENTIFIER]}|x|X|\\*`),c("XRANGEPLAIN",`[v=\\s]*(${o[u.XRANGEIDENTIFIER]})(?:\\.(${o[u.XRANGEIDENTIFIER]})(?:\\.(${o[u.XRANGEIDENTIFIER]})(?:${o[u.PRERELEASE]})?${o[u.BUILD]}?)?)?`),c("XRANGEPLAINLOOSE",`[v=\\s]*(${o[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[u.XRANGEIDENTIFIERLOOSE]})(?:${o[u.PRERELEASELOOSE]})?${o[u.BUILD]}?)?)?`),c("XRANGE",`^${o[u.GTLT]}\\s*${o[u.XRANGEPLAIN]}$`),c("XRANGELOOSE",`^${o[u.GTLT]}\\s*${o[u.XRANGEPLAINLOOSE]}$`),c("COERCEPLAIN",`(^|[^\\d])(\\d{1,${l}})(?:\\.(\\d{1,${l}}))?(?:\\.(\\d{1,${l}}))?`),c("COERCE",`${o[u.COERCEPLAIN]}(?:$|[^\\d])`),c("COERCEFULL",o[u.COERCEPLAIN]+`(?:${o[u.PRERELEASE]})?(?:${o[u.BUILD]})?(?:$|[^\\d])`),c("COERCERTL",o[u.COERCE],!0),c("COERCERTLFULL",o[u.COERCEFULL],!0),c("LONETILDE","(?:~>?)"),c("TILDETRIM",`(\\s*)${o[u.LONETILDE]}\\s+`,!0),h.tildeTrimReplace="$1~",c("TILDE",`^${o[u.LONETILDE]}${o[u.XRANGEPLAIN]}$`),c("TILDELOOSE",`^${o[u.LONETILDE]}${o[u.XRANGEPLAINLOOSE]}$`),c("LONECARET","(?:\\^)"),c("CARETTRIM",`(\\s*)${o[u.LONECARET]}\\s+`,!0),h.caretTrimReplace="$1^",c("CARET",`^${o[u.LONECARET]}${o[u.XRANGEPLAIN]}$`),c("CARETLOOSE",`^${o[u.LONECARET]}${o[u.XRANGEPLAINLOOSE]}$`),c("COMPARATORLOOSE",`^${o[u.GTLT]}\\s*(${o[u.LOOSEPLAIN]})$|^$`),c("COMPARATOR",`^${o[u.GTLT]}\\s*(${o[u.FULLPLAIN]})$|^$`),c("COMPARATORTRIM",`(\\s*)${o[u.GTLT]}\\s*(${o[u.LOOSEPLAIN]}|${o[u.XRANGEPLAIN]})`,!0),h.comparatorTrimReplace="$1$2$3",c("HYPHENRANGE",`^\\s*(${o[u.XRANGEPLAIN]})\\s+-\\s+(${o[u.XRANGEPLAIN]})\\s*$`),c("HYPHENRANGELOOSE",`^\\s*(${o[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[u.XRANGEPLAINLOOSE]})\\s*$`),c("STAR","(<|>)?=?\\s*\\*"),c("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),c("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")},17:(P,h,i)=>{const l=i(8713),r=(n,p,m)=>l(n,p,">",m);P.exports=r},8146:(P,h,i)=>{const l=i(3573),r=(n,p,m)=>(n=new l(n,m),p=new l(p,m),n.intersects(p,m));P.exports=r},8408:(P,h,i)=>{const l=i(8713),r=(n,p,m)=>l(n,p,"<",m);P.exports=r},6698:(P,h,i)=>{const l=i(1966),r=i(3573),n=(p,m,f)=>{let o=null,u=null,v=null;try{v=new r(m,f)}catch(s){return null}return p.forEach(s=>{v.test(s)&&(!o||u.compare(s)===-1)&&(o=s,u=new l(o,f))}),o};P.exports=n},752:(P,h,i)=>{const l=i(1966),r=i(3573),n=(p,m,f)=>{let o=null,u=null,v=null;try{v=new r(m,f)}catch(s){return null}return p.forEach(s=>{v.test(s)&&(!o||u.compare(s)===1)&&(o=s,u=new l(o,f))}),o};P.exports=n},8187:(P,h,i)=>{const l=i(1966),r=i(3573),n=i(5814),p=(m,f)=>{m=new r(m,f);let o=new l("0.0.0");if(m.test(o)||(o=new l("0.0.0-0"),m.test(o)))return o;o=null;for(let u=0;u<m.set.length;++u){const v=m.set[u];let s=null;v.forEach(g=>{const d=new l(g.semver.version);switch(g.operator){case">":d.prerelease.length===0?d.patch++:d.prerelease.push(0),d.raw=d.format();case"":case">=":(!s||n(d,s))&&(s=d);break;case"<":case"<=":break;default:throw new Error(`Unexpected operation: ${g.operator}`)}}),s&&(!o||n(o,s))&&(o=s)}return o&&m.test(o)?o:null};P.exports=p},8713:(P,h,i)=>{const l=i(1966),r=i(9746),{ANY:n}=r,p=i(3573),m=i(2088),f=i(5814),o=i(6841),u=i(586),v=i(4815),s=(g,d,c,b)=>{g=new l(g,b),d=new p(d,b);let y,T,_,A,E;switch(c){case">":y=f,T=u,_=o,A=">",E=">=";break;case"<":y=o,T=v,_=f,A="<",E="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(m(g,d,b))return!1;for(let I=0;I<d.set.length;++I){const N=d.set[I];let B=null,C=null;if(N.forEach(R=>{R.semver===n&&(R=new r(">=0.0.0")),B=B||R,C=C||R,y(R.semver,B.semver,b)?B=R:_(R.semver,C.semver,b)&&(C=R)}),B.operator===A||B.operator===E||(!C.operator||C.operator===A)&&T(g,C.semver))return!1;if(C.operator===E&&_(g,C.semver))return!1}return!0};P.exports=s},1095:(P,h,i)=>{const l=i(2088),r=i(2606);P.exports=(n,p,m)=>{const f=[];let o=null,u=null;const v=n.sort((c,b)=>r(c,b,m));for(const c of v)l(c,p,m)?(u=c,o||(o=c)):(u&&f.push([o,u]),u=null,o=null);o&&f.push([o,null]);const s=[];for(const[c,b]of f)c===b?s.push(c):!b&&c===v[0]?s.push("*"):b?c===v[0]?s.push(`<=${b}`):s.push(`${c} - ${b}`):s.push(`>=${c}`);const g=s.join(" || "),d=typeof p.raw=="string"?p.raw:String(p);return g.length<d.length?g:p}},7606:(P,h,i)=>{const l=i(3573),r=i(9746),{ANY:n}=r,p=i(2088),m=i(2606),f=(d,c,b={})=>{if(d===c)return!0;d=new l(d,b),c=new l(c,b);let y=!1;e:for(const T of d.set){for(const _ of c.set){const A=v(T,_,b);if(y=y||A!==null,A)continue e}if(y)return!1}return!0},o=[new r(">=0.0.0-0")],u=[new r(">=0.0.0")],v=(d,c,b)=>{if(d===c)return!0;if(d.length===1&&d[0].semver===n){if(c.length===1&&c[0].semver===n)return!0;b.includePrerelease?d=o:d=u}if(c.length===1&&c[0].semver===n){if(b.includePrerelease)return!0;c=u}const y=new Set;let T,_;for(const w of d)w.operator===">"||w.operator===">="?T=s(T,w,b):w.operator==="<"||w.operator==="<="?_=g(_,w,b):y.add(w.semver);if(y.size>1)return null;let A;if(T&&_){if(A=m(T.semver,_.semver,b),A>0)return null;if(A===0&&(T.operator!==">="||_.operator!=="<="))return null}for(const w of y){if(T&&!p(w,String(T),b)||_&&!p(w,String(_),b))return null;for(const D of c)if(!p(w,String(D),b))return!1;return!0}let E,I,N,B,C=_&&!b.includePrerelease&&_.semver.prerelease.length?_.semver:!1,R=T&&!b.includePrerelease&&T.semver.prerelease.length?T.semver:!1;C&&C.prerelease.length===1&&_.operator==="<"&&C.prerelease[0]===0&&(C=!1);for(const w of c){if(B=B||w.operator===">"||w.operator===">=",N=N||w.operator==="<"||w.operator==="<=",T){if(R&&w.semver.prerelease&&w.semver.prerelease.length&&w.semver.major===R.major&&w.semver.minor===R.minor&&w.semver.patch===R.patch&&(R=!1),w.operator===">"||w.operator===">="){if(E=s(T,w,b),E===w&&E!==T)return!1}else if(T.operator===">="&&!p(T.semver,String(w),b))return!1}if(_){if(C&&w.semver.prerelease&&w.semver.prerelease.length&&w.semver.major===C.major&&w.semver.minor===C.minor&&w.semver.patch===C.patch&&(C=!1),w.operator==="<"||w.operator==="<="){if(I=g(_,w,b),I===w&&I!==_)return!1}else if(_.operator==="<="&&!p(_.semver,String(w),b))return!1}if(!w.operator&&(_||T)&&A!==0)return!1}return!(T&&N&&!_&&A!==0||_&&B&&!T&&A!==0||R||C)},s=(d,c,b)=>{if(!d)return c;const y=m(d.semver,c.semver,b);return y>0?d:y<0||c.operator===">"&&d.operator===">="?c:d},g=(d,c,b)=>{if(!d)return c;const y=m(d.semver,c.semver,b);return y<0?d:y>0||c.operator==="<"&&d.operator==="<="?c:d};P.exports=f},2389:(P,h,i)=>{const l=i(3573),r=(n,p)=>new l(n,p).set.map(m=>m.map(f=>f.value).join(" ").trim().split(" "));P.exports=r},924:(P,h,i)=>{const l=i(3573),r=(n,p)=>{try{return new l(n,p).range||"*"}catch(m){return null}};P.exports=r},4912:()=>{+function(P){"use strict";var h=".dropdown-backdrop",i='[data-toggle="dropdown"]',l=function(f){P(f).on("click.bs.dropdown",this.toggle)};l.VERSION="3.4.1";function r(f){var o=f.attr("data-target");o||(o=f.attr("href"),o=o&&/#[A-Za-z]/.test(o)&&o.replace(/.*(?=#[^\s]*$)/,""));var u=o!=="#"?P(document).find(o):null;return u&&u.length?u:f.parent()}function n(f){f&&f.which===3||(P(h).remove(),P(i).each(function(){var o=P(this),u=r(o),v={relatedTarget:this};u.hasClass("open")&&(f&&f.type=="click"&&/input|textarea/i.test(f.target.tagName)&&P.contains(u[0],f.target)||(u.trigger(f=P.Event("hide.bs.dropdown",v)),!f.isDefaultPrevented()&&(o.attr("aria-expanded","false"),u.removeClass("open").trigger(P.Event("hidden.bs.dropdown",v)))))}))}l.prototype.toggle=function(f){var o=P(this);if(!o.is(".disabled, :disabled")){var u=r(o),v=u.hasClass("open");if(n(),!v){"ontouchstart"in document.documentElement&&!u.closest(".navbar-nav").length&&P(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(P(this)).on("click",n);var s={relatedTarget:this};if(u.trigger(f=P.Event("show.bs.dropdown",s)),f.isDefaultPrevented())return;o.trigger("focus").attr("aria-expanded","true"),u.toggleClass("open").trigger(P.Event("shown.bs.dropdown",s))}return!1}},l.prototype.keydown=function(f){if(!(!/(38|40|27|32)/.test(f.which)||/input|textarea/i.test(f.target.tagName))){var o=P(this);if(f.preventDefault(),f.stopPropagation(),!o.is(".disabled, :disabled")){var u=r(o),v=u.hasClass("open");if(!v&&f.which!=27||v&&f.which==27)return f.which==27&&u.find(i).trigger("focus"),o.trigger("click");var s=" li:not(.disabled):visible a",g=u.find(".dropdown-menu"+s);if(g.length){var d=g.index(f.target);f.which==38&&d>0&&d--,f.which==40&&d<g.length-1&&d++,~d||(d=0),g.eq(d).trigger("focus")}}}};function p(f){return this.each(function(){var o=P(this),u=o.data("bs.dropdown");u||o.data("bs.dropdown",u=new l(this)),typeof f=="string"&&u[f].call(o)})}var m=P.fn.dropdown;P.fn.dropdown=p,P.fn.dropdown.Constructor=l,P.fn.dropdown.noConflict=function(){return P.fn.dropdown=m,this},P(document).on("click.bs.dropdown.data-api",n).on("click.bs.dropdown.data-api",".dropdown form",function(f){f.stopPropagation()}).on("click.bs.dropdown.data-api",i,l.prototype.toggle).on("keydown.bs.dropdown.data-api",i,l.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",l.prototype.keydown)}(jQuery)},4856:()=>{+function(P){"use strict";var h=function(r,n){this.init("popover",r,n)};if(!P.fn.tooltip)throw new Error("Popover requires tooltip.js");h.VERSION="3.4.1",h.DEFAULTS=P.extend({},P.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),h.prototype=P.extend({},P.fn.tooltip.Constructor.prototype),h.prototype.constructor=h,h.prototype.getDefaults=function(){return h.DEFAULTS},h.prototype.setContent=function(){var r=this.tip(),n=this.getTitle(),p=this.getContent();if(this.options.html){var m=typeof p;this.options.sanitize&&(n=this.sanitizeHtml(n),m==="string"&&(p=this.sanitizeHtml(p))),r.find(".popover-title").html(n),r.find(".popover-content").children().detach().end()[m==="string"?"html":"append"](p)}else r.find(".popover-title").text(n),r.find(".popover-content").children().detach().end().text(p);r.removeClass("fade top bottom left right in"),r.find(".popover-title").html()||r.find(".popover-title").hide()},h.prototype.hasContent=function(){return this.getTitle()||this.getContent()},h.prototype.getContent=function(){var r=this.$element,n=this.options;return r.attr("data-content")||(typeof n.content=="function"?n.content.call(r[0]):n.content)},h.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};function i(r){return this.each(function(){var n=P(this),p=n.data("bs.popover"),m=typeof r=="object"&&r;!p&&/destroy|hide/.test(r)||(p||n.data("bs.popover",p=new h(this,m)),typeof r=="string"&&p[r]())})}var l=P.fn.popover;P.fn.popover=i,P.fn.popover.Constructor=h,P.fn.popover.noConflict=function(){return P.fn.popover=l,this}}(jQuery)},2208:()=>{+function(P){"use strict";function h(r,n){this.$body=P(document.body),this.$scrollElement=P(r).is(document.body)?P(window):P(r),this.options=P.extend({},h.DEFAULTS,n),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",P.proxy(this.process,this)),this.refresh(),this.process()}h.VERSION="3.4.1",h.DEFAULTS={offset:10},h.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},h.prototype.refresh=function(){var r=this,n="offset",p=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),P.isWindow(this.$scrollElement[0])||(n="position",p=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var m=P(this),f=m.data("target")||m.attr("href"),o=/^#./.test(f)&&P(f);return o&&o.length&&o.is(":visible")&&[[o[n]().top+p,f]]||null}).sort(function(m,f){return m[0]-f[0]}).each(function(){r.offsets.push(this[0]),r.targets.push(this[1])})},h.prototype.process=function(){var r=this.$scrollElement.scrollTop()+this.options.offset,n=this.getScrollHeight(),p=this.options.offset+n-this.$scrollElement.height(),m=this.offsets,f=this.targets,o=this.activeTarget,u;if(this.scrollHeight!=n&&this.refresh(),r>=p)return o!=(u=f[f.length-1])&&this.activate(u);if(o&&r<m[0])return this.activeTarget=null,this.clear();for(u=m.length;u--;)o!=f[u]&&r>=m[u]&&(m[u+1]===void 0||r<m[u+1])&&this.activate(f[u])},h.prototype.activate=function(r){this.activeTarget=r,this.clear();var n=this.selector+'[data-target="'+r+'"],'+this.selector+'[href="'+r+'"]',p=P(n).parents("li").addClass("active");p.parent(".dropdown-menu").length&&(p=p.closest("li.dropdown").addClass("active")),p.trigger("activate.bs.scrollspy")},h.prototype.clear=function(){P(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};function i(r){return this.each(function(){var n=P(this),p=n.data("bs.scrollspy"),m=typeof r=="object"&&r;p||n.data("bs.scrollspy",p=new h(this,m)),typeof r=="string"&&p[r]()})}var l=P.fn.scrollspy;P.fn.scrollspy=i,P.fn.scrollspy.Constructor=h,P.fn.scrollspy.noConflict=function(){return P.fn.scrollspy=l,this},P(window).on("load.bs.scrollspy.data-api",function(){P('[data-spy="scroll"]').each(function(){var r=P(this);i.call(r,r.data())})})}(jQuery)},9954:()=>{+function(P){"use strict";var h=function(n){this.element=P(n)};h.VERSION="3.4.1",h.TRANSITION_DURATION=150,h.prototype.show=function(){var n=this.element,p=n.closest("ul:not(.dropdown-menu)"),m=n.data("target");if(m||(m=n.attr("href"),m=m&&m.replace(/.*(?=#[^\s]*$)/,"")),!n.parent("li").hasClass("active")){var f=p.find(".active:last a"),o=P.Event("hide.bs.tab",{relatedTarget:n[0]}),u=P.Event("show.bs.tab",{relatedTarget:f[0]});if(f.trigger(o),n.trigger(u),!(u.isDefaultPrevented()||o.isDefaultPrevented())){var v=P(document).find(m);this.activate(n.closest("li"),p),this.activate(v,v.parent(),function(){f.trigger({type:"hidden.bs.tab",relatedTarget:n[0]}),n.trigger({type:"shown.bs.tab",relatedTarget:f[0]})})}}},h.prototype.activate=function(n,p,m){var f=p.find("> .active"),o=m&&P.support.transition&&(f.length&&f.hasClass("fade")||!!p.find("> .fade").length);function u(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),n.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),o?(n[0].offsetWidth,n.addClass("in")):n.removeClass("fade"),n.parent(".dropdown-menu").length&&n.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),m&&m()}f.length&&o?f.one("bsTransitionEnd",u).emulateTransitionEnd(h.TRANSITION_DURATION):u(),f.removeClass("in")};function i(n){return this.each(function(){var p=P(this),m=p.data("bs.tab");m||p.data("bs.tab",m=new h(this)),typeof n=="string"&&m[n]()})}var l=P.fn.tab;P.fn.tab=i,P.fn.tab.Constructor=h,P.fn.tab.noConflict=function(){return P.fn.tab=l,this};var r=function(n){n.preventDefault(),i.call(P(this),"show")};P(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',r).on("click.bs.tab.data-api",'[data-toggle="pill"]',r)}(jQuery)},9898:()=>{+function(P){"use strict";var h=["sanitize","whiteList","sanitizeFn"],i=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],l=/^aria-[\w-]*$/i,r={"*":["class","dir","id","lang","role",l],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},n=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,p=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function m(s,g){var d=s.nodeName.toLowerCase();if(P.inArray(d,g)!==-1)return P.inArray(d,i)!==-1?Boolean(s.nodeValue.match(n)||s.nodeValue.match(p)):!0;for(var c=P(g).filter(function(T,_){return _ instanceof RegExp}),b=0,y=c.length;b<y;b++)if(d.match(c[b]))return!0;return!1}function f(s,g,d){if(s.length===0)return s;if(d&&typeof d=="function")return d(s);if(!document.implementation||!document.implementation.createHTMLDocument)return s;var c=document.implementation.createHTMLDocument("sanitization");c.body.innerHTML=s;for(var b=P.map(g,function(R,w){return w}),y=P(c.body).find("*"),T=0,_=y.length;T<_;T++){var A=y[T],E=A.nodeName.toLowerCase();if(P.inArray(E,b)===-1){A.parentNode.removeChild(A);continue}for(var I=P.map(A.attributes,function(R){return R}),N=[].concat(g["*"]||[],g[E]||[]),B=0,C=I.length;B<C;B++)m(I[B],N)||A.removeAttribute(I[B].nodeName)}return c.body.innerHTML}var o=function(s,g){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",s,g)};o.VERSION="3.4.1",o.TRANSITION_DURATION=150,o.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0},sanitize:!0,sanitizeFn:null,whiteList:r},o.prototype.init=function(s,g,d){if(this.enabled=!0,this.type=s,this.$element=P(g),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&P(document).find(P.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var c=this.options.trigger.split(" "),b=c.length;b--;){var y=c[b];if(y=="click")this.$element.on("click."+this.type,this.options.selector,P.proxy(this.toggle,this));else if(y!="manual"){var T=y=="hover"?"mouseenter":"focusin",_=y=="hover"?"mouseleave":"focusout";this.$element.on(T+"."+this.type,this.options.selector,P.proxy(this.enter,this)),this.$element.on(_+"."+this.type,this.options.selector,P.proxy(this.leave,this))}}this.options.selector?this._options=P.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},o.prototype.getDefaults=function(){return o.DEFAULTS},o.prototype.getOptions=function(s){var g=this.$element.data();for(var d in g)g.hasOwnProperty(d)&&P.inArray(d,h)!==-1&&delete g[d];return s=P.extend({},this.getDefaults(),g,s),s.delay&&typeof s.delay=="number"&&(s.delay={show:s.delay,hide:s.delay}),s.sanitize&&(s.template=f(s.template,s.whiteList,s.sanitizeFn)),s},o.prototype.getDelegateOptions=function(){var s={},g=this.getDefaults();return this._options&&P.each(this._options,function(d,c){g[d]!=c&&(s[d]=c)}),s},o.prototype.enter=function(s){var g=s instanceof this.constructor?s:P(s.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),P(s.currentTarget).data("bs."+this.type,g)),s instanceof P.Event&&(g.inState[s.type=="focusin"?"focus":"hover"]=!0),g.tip().hasClass("in")||g.hoverState=="in"){g.hoverState="in";return}if(clearTimeout(g.timeout),g.hoverState="in",!g.options.delay||!g.options.delay.show)return g.show();g.timeout=setTimeout(function(){g.hoverState=="in"&&g.show()},g.options.delay.show)},o.prototype.isInStateTrue=function(){for(var s in this.inState)if(this.inState[s])return!0;return!1},o.prototype.leave=function(s){var g=s instanceof this.constructor?s:P(s.currentTarget).data("bs."+this.type);if(g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),P(s.currentTarget).data("bs."+this.type,g)),s instanceof P.Event&&(g.inState[s.type=="focusout"?"focus":"hover"]=!1),!g.isInStateTrue()){if(clearTimeout(g.timeout),g.hoverState="out",!g.options.delay||!g.options.delay.hide)return g.hide();g.timeout=setTimeout(function(){g.hoverState=="out"&&g.hide()},g.options.delay.hide)}},o.prototype.show=function(){var s=P.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(s);var g=P.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(s.isDefaultPrevented()||!g)return;var d=this,c=this.tip(),b=this.getUID(this.type);this.setContent(),c.attr("id",b),this.$element.attr("aria-describedby",b),this.options.animation&&c.addClass("fade");var y=typeof this.options.placement=="function"?this.options.placement.call(this,c[0],this.$element[0]):this.options.placement,T=/\s?auto?\s?/i,_=T.test(y);_&&(y=y.replace(T,"")||"top"),c.detach().css({top:0,left:0,display:"block"}).addClass(y).data("bs."+this.type,this),this.options.container?c.appendTo(P(document).find(this.options.container)):c.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var A=this.getPosition(),E=c[0].offsetWidth,I=c[0].offsetHeight;if(_){var N=y,B=this.getPosition(this.$viewport);y=y=="bottom"&&A.bottom+I>B.bottom?"top":y=="top"&&A.top-I<B.top?"bottom":y=="right"&&A.right+E>B.width?"left":y=="left"&&A.left-E<B.left?"right":y,c.removeClass(N).addClass(y)}var C=this.getCalculatedOffset(y,A,E,I);this.applyPlacement(C,y);var R=function(){var w=d.hoverState;d.$element.trigger("shown.bs."+d.type),d.hoverState=null,w=="out"&&d.leave(d)};P.support.transition&&this.$tip.hasClass("fade")?c.one("bsTransitionEnd",R).emulateTransitionEnd(o.TRANSITION_DURATION):R()}},o.prototype.applyPlacement=function(s,g){var d=this.tip(),c=d[0].offsetWidth,b=d[0].offsetHeight,y=parseInt(d.css("margin-top"),10),T=parseInt(d.css("margin-left"),10);isNaN(y)&&(y=0),isNaN(T)&&(T=0),s.top+=y,s.left+=T,P.offset.setOffset(d[0],P.extend({using:function(C){d.css({top:Math.round(C.top),left:Math.round(C.left)})}},s),0),d.addClass("in");var _=d[0].offsetWidth,A=d[0].offsetHeight;g=="top"&&A!=b&&(s.top=s.top+b-A);var E=this.getViewportAdjustedDelta(g,s,_,A);E.left?s.left+=E.left:s.top+=E.top;var I=/top|bottom/.test(g),N=I?E.left*2-c+_:E.top*2-b+A,B=I?"offsetWidth":"offsetHeight";d.offset(s),this.replaceArrow(N,d[0][B],I)},o.prototype.replaceArrow=function(s,g,d){this.arrow().css(d?"left":"top",50*(1-s/g)+"%").css(d?"top":"left","")},o.prototype.setContent=function(){var s=this.tip(),g=this.getTitle();this.options.html?(this.options.sanitize&&(g=f(g,this.options.whiteList,this.options.sanitizeFn)),s.find(".tooltip-inner").html(g)):s.find(".tooltip-inner").text(g),s.removeClass("fade in top bottom left right")},o.prototype.hide=function(s){var g=this,d=P(this.$tip),c=P.Event("hide.bs."+this.type);function b(){g.hoverState!="in"&&d.detach(),g.$element&&g.$element.removeAttr("aria-describedby").trigger("hidden.bs."+g.type),s&&s()}if(this.$element.trigger(c),!c.isDefaultPrevented())return d.removeClass("in"),P.support.transition&&d.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(o.TRANSITION_DURATION):b(),this.hoverState=null,this},o.prototype.fixTitle=function(){var s=this.$element;(s.attr("title")||typeof s.attr("data-original-title")!="string")&&s.attr("data-original-title",s.attr("title")||"").attr("title","")},o.prototype.hasContent=function(){return this.getTitle()},o.prototype.getPosition=function(s){s=s||this.$element;var g=s[0],d=g.tagName=="BODY",c=g.getBoundingClientRect();c.width==null&&(c=P.extend({},c,{width:c.right-c.left,height:c.bottom-c.top}));var b=window.SVGElement&&g instanceof window.SVGElement,y=d?{top:0,left:0}:b?null:s.offset(),T={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:s.scrollTop()},_=d?{width:P(window).width(),height:P(window).height()}:null;return P.extend({},c,T,_,y)},o.prototype.getCalculatedOffset=function(s,g,d,c){return s=="bottom"?{top:g.top+g.height,left:g.left+g.width/2-d/2}:s=="top"?{top:g.top-c,left:g.left+g.width/2-d/2}:s=="left"?{top:g.top+g.height/2-c/2,left:g.left-d}:{top:g.top+g.height/2-c/2,left:g.left+g.width}},o.prototype.getViewportAdjustedDelta=function(s,g,d,c){var b={top:0,left:0};if(!this.$viewport)return b;var y=this.options.viewport&&this.options.viewport.padding||0,T=this.getPosition(this.$viewport);if(/right|left/.test(s)){var _=g.top-y-T.scroll,A=g.top+y-T.scroll+c;_<T.top?b.top=T.top-_:A>T.top+T.height&&(b.top=T.top+T.height-A)}else{var E=g.left-y,I=g.left+y+d;E<T.left?b.left=T.left-E:I>T.right&&(b.left=T.left+T.width-I)}return b},o.prototype.getTitle=function(){var s,g=this.$element,d=this.options;return s=g.attr("data-original-title")||(typeof d.title=="function"?d.title.call(g[0]):d.title),s},o.prototype.getUID=function(s){do s+=~~(Math.random()*1e6);while(document.getElementById(s));return s},o.prototype.tip=function(){if(!this.$tip&&(this.$tip=P(this.options.template),this.$tip.length!=1))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},o.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},o.prototype.enable=function(){this.enabled=!0},o.prototype.disable=function(){this.enabled=!1},o.prototype.toggleEnabled=function(){this.enabled=!this.enabled},o.prototype.toggle=function(s){var g=this;s&&(g=P(s.currentTarget).data("bs."+this.type),g||(g=new this.constructor(s.currentTarget,this.getDelegateOptions()),P(s.currentTarget).data("bs."+this.type,g))),s?(g.inState.click=!g.inState.click,g.isInStateTrue()?g.enter(g):g.leave(g)):g.tip().hasClass("in")?g.leave(g):g.enter(g)},o.prototype.destroy=function(){var s=this;clearTimeout(this.timeout),this.hide(function(){s.$element.off("."+s.type).removeData("bs."+s.type),s.$tip&&s.$tip.detach(),s.$tip=null,s.$arrow=null,s.$viewport=null,s.$element=null})},o.prototype.sanitizeHtml=function(s){return f(s,this.options.whiteList,this.options.sanitizeFn)};function u(s){return this.each(function(){var g=P(this),d=g.data("bs.tooltip"),c=typeof s=="object"&&s;!d&&/destroy|hide/.test(s)||(d||g.data("bs.tooltip",d=new o(this,c)),typeof s=="string"&&d[s]())})}var v=P.fn.tooltip;P.fn.tooltip=u,P.fn.tooltip.Constructor=o,P.fn.tooltip.noConflict=function(){return P.fn.tooltip=v,this}}(jQuery)},2189:P=>{var h=function(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32},i=-1,l=1,r=0;h.Diff=function(n,p){return[n,p]},h.prototype.diff_main=function(n,p,m,f){typeof f=="undefined"&&(this.Diff_Timeout<=0?f=Number.MAX_VALUE:f=new Date().getTime()+this.Diff_Timeout*1e3);var o=f;if(n==null||p==null)throw new Error("Null input. (diff_main)");if(n==p)return n?[new h.Diff(r,n)]:[];typeof m=="undefined"&&(m=!0);var u=m,v=this.diff_commonPrefix(n,p),s=n.substring(0,v);n=n.substring(v),p=p.substring(v),v=this.diff_commonSuffix(n,p);var g=n.substring(n.length-v);n=n.substring(0,n.length-v),p=p.substring(0,p.length-v);var d=this.diff_compute_(n,p,u,o);return s&&d.unshift(new h.Diff(r,s)),g&&d.push(new h.Diff(r,g)),this.diff_cleanupMerge(d),d},h.prototype.diff_compute_=function(n,p,m,f){var o;if(!n)return[new h.Diff(l,p)];if(!p)return[new h.Diff(i,n)];var u=n.length>p.length?n:p,v=n.length>p.length?p:n,s=u.indexOf(v);if(s!=-1)return o=[new h.Diff(l,u.substring(0,s)),new h.Diff(r,v),new h.Diff(l,u.substring(s+v.length))],n.length>p.length&&(o[0][0]=o[2][0]=i),o;if(v.length==1)return[new h.Diff(i,n),new h.Diff(l,p)];var g=this.diff_halfMatch_(n,p);if(g){var d=g[0],c=g[1],b=g[2],y=g[3],T=g[4],_=this.diff_main(d,b,m,f),A=this.diff_main(c,y,m,f);return _.concat([new h.Diff(r,T)],A)}return m&&n.length>100&&p.length>100?this.diff_lineMode_(n,p,f):this.diff_bisect_(n,p,f)},h.prototype.diff_lineMode_=function(n,p,m){var f=this.diff_linesToChars_(n,p);n=f.chars1,p=f.chars2;var o=f.lineArray,u=this.diff_main(n,p,!1,m);this.diff_charsToLines_(u,o),this.diff_cleanupSemantic(u),u.push(new h.Diff(r,""));for(var v=0,s=0,g=0,d="",c="";v<u.length;){switch(u[v][0]){case l:g++,c+=u[v][1];break;case i:s++,d+=u[v][1];break;case r:if(s>=1&&g>=1){u.splice(v-s-g,s+g),v=v-s-g;for(var b=this.diff_main(d,c,!1,m),y=b.length-1;y>=0;y--)u.splice(v,0,b[y]);v=v+b.length}g=0,s=0,d="",c="";break}v++}return u.pop(),u},h.prototype.diff_bisect_=function(n,p,m){for(var f=n.length,o=p.length,u=Math.ceil((f+o)/2),v=u,s=2*u,g=new Array(s),d=new Array(s),c=0;c<s;c++)g[c]=-1,d[c]=-1;g[v+1]=0,d[v+1]=0;for(var b=f-o,y=b%2!=0,T=0,_=0,A=0,E=0,I=0;I<u&&!(new Date().getTime()>m);I++){for(var N=-I+T;N<=I-_;N+=2){var B=v+N,C;N==-I||N!=I&&g[B-1]<g[B+1]?C=g[B+1]:C=g[B-1]+1;for(var R=C-N;C<f&&R<o&&n.charAt(C)==p.charAt(R);)C++,R++;if(g[B]=C,C>f)_+=2;else if(R>o)T+=2;else if(y){var w=v+b-N;if(w>=0&&w<s&&d[w]!=-1){var D=f-d[w];if(C>=D)return this.diff_bisectSplit_(n,p,C,R,m)}}}for(var k=-I+A;k<=I-E;k+=2){var w=v+k,D;k==-I||k!=I&&d[w-1]<d[w+1]?D=d[w+1]:D=d[w-1]+1;for(var G=D-k;D<f&&G<o&&n.charAt(f-D-1)==p.charAt(o-G-1);)D++,G++;if(d[w]=D,D>f)E+=2;else if(G>o)A+=2;else if(!y){var B=v+b-k;if(B>=0&&B<s&&g[B]!=-1){var C=g[B],R=v+C-B;if(D=f-D,C>=D)return this.diff_bisectSplit_(n,p,C,R,m)}}}}return[new h.Diff(i,n),new h.Diff(l,p)]},h.prototype.diff_bisectSplit_=function(n,p,m,f,o){var u=n.substring(0,m),v=p.substring(0,f),s=n.substring(m),g=p.substring(f),d=this.diff_main(u,v,!1,o),c=this.diff_main(s,g,!1,o);return d.concat(c)},h.prototype.diff_linesToChars_=function(n,p){var m=[],f={};m[0]="";function o(g){for(var d="",c=0,b=-1,y=m.length;b<g.length-1;){b=g.indexOf(`
`,c),b==-1&&(b=g.length-1);var T=g.substring(c,b+1);(f.hasOwnProperty?f.hasOwnProperty(T):f[T]!==void 0)?d+=String.fromCharCode(f[T]):(y==u&&(T=g.substring(c),b=g.length),d+=String.fromCharCode(y),f[T]=y,m[y++]=T),c=b+1}return d}var u=4e4,v=o(n);u=65535;var s=o(p);return{chars1:v,chars2:s,lineArray:m}},h.prototype.diff_charsToLines_=function(n,p){for(var m=0;m<n.length;m++){for(var f=n[m][1],o=[],u=0;u<f.length;u++)o[u]=p[f.charCodeAt(u)];n[m][1]=o.join("")}},h.prototype.diff_commonPrefix=function(n,p){if(!n||!p||n.charAt(0)!=p.charAt(0))return 0;for(var m=0,f=Math.min(n.length,p.length),o=f,u=0;m<o;)n.substring(u,o)==p.substring(u,o)?(m=o,u=m):f=o,o=Math.floor((f-m)/2+m);return o},h.prototype.diff_commonSuffix=function(n,p){if(!n||!p||n.charAt(n.length-1)!=p.charAt(p.length-1))return 0;for(var m=0,f=Math.min(n.length,p.length),o=f,u=0;m<o;)n.substring(n.length-o,n.length-u)==p.substring(p.length-o,p.length-u)?(m=o,u=m):f=o,o=Math.floor((f-m)/2+m);return o},h.prototype.diff_commonOverlap_=function(n,p){var m=n.length,f=p.length;if(m==0||f==0)return 0;m>f?n=n.substring(m-f):m<f&&(p=p.substring(0,m));var o=Math.min(m,f);if(n==p)return o;for(var u=0,v=1;;){var s=n.substring(o-v),g=p.indexOf(s);if(g==-1)return u;v+=g,(g==0||n.substring(o-v)==p.substring(0,v))&&(u=v,v++)}},h.prototype.diff_halfMatch_=function(n,p){if(this.Diff_Timeout<=0)return null;var m=n.length>p.length?n:p,f=n.length>p.length?p:n;if(m.length<4||f.length*2<m.length)return null;var o=this;function u(_,A,E){for(var I=_.substring(E,E+Math.floor(_.length/4)),N=-1,B="",C,R,w,D;(N=A.indexOf(I,N+1))!=-1;){var k=o.diff_commonPrefix(_.substring(E),A.substring(N)),G=o.diff_commonSuffix(_.substring(0,E),A.substring(0,N));B.length<G+k&&(B=A.substring(N-G,N)+A.substring(N,N+k),C=_.substring(0,E-G),R=_.substring(E+k),w=A.substring(0,N-G),D=A.substring(N+k))}return B.length*2>=_.length?[C,R,w,D,B]:null}var v=u(m,f,Math.ceil(m.length/4)),s=u(m,f,Math.ceil(m.length/2)),g;if(!v&&!s)return null;s?v?g=v[4].length>s[4].length?v:s:g=s:g=v;var d,c,b,y;n.length>p.length?(d=g[0],c=g[1],b=g[2],y=g[3]):(b=g[0],y=g[1],d=g[2],c=g[3]);var T=g[4];return[d,c,b,y,T]},h.prototype.diff_cleanupSemantic=function(n){for(var p=!1,m=[],f=0,o=null,u=0,v=0,s=0,g=0,d=0;u<n.length;)n[u][0]==r?(m[f++]=u,v=g,s=d,g=0,d=0,o=n[u][1]):(n[u][0]==l?g+=n[u][1].length:d+=n[u][1].length,o&&o.length<=Math.max(v,s)&&o.length<=Math.max(g,d)&&(n.splice(m[f-1],0,new h.Diff(i,o)),n[m[f-1]+1][0]=l,f--,f--,u=f>0?m[f-1]:-1,v=0,s=0,g=0,d=0,o=null,p=!0)),u++;for(p&&this.diff_cleanupMerge(n),this.diff_cleanupSemanticLossless(n),u=1;u<n.length;){if(n[u-1][0]==i&&n[u][0]==l){var c=n[u-1][1],b=n[u][1],y=this.diff_commonOverlap_(c,b),T=this.diff_commonOverlap_(b,c);y>=T?(y>=c.length/2||y>=b.length/2)&&(n.splice(u,0,new h.Diff(r,b.substring(0,y))),n[u-1][1]=c.substring(0,c.length-y),n[u+1][1]=b.substring(y),u++):(T>=c.length/2||T>=b.length/2)&&(n.splice(u,0,new h.Diff(r,c.substring(0,T))),n[u-1][0]=l,n[u-1][1]=b.substring(0,b.length-T),n[u+1][0]=i,n[u+1][1]=c.substring(T),u++),u++}u++}},h.prototype.diff_cleanupSemanticLossless=function(n){function p(T,_){if(!T||!_)return 6;var A=T.charAt(T.length-1),E=_.charAt(0),I=A.match(h.nonAlphaNumericRegex_),N=E.match(h.nonAlphaNumericRegex_),B=I&&A.match(h.whitespaceRegex_),C=N&&E.match(h.whitespaceRegex_),R=B&&A.match(h.linebreakRegex_),w=C&&E.match(h.linebreakRegex_),D=R&&T.match(h.blanklineEndRegex_),k=w&&_.match(h.blanklineStartRegex_);return D||k?5:R||w?4:I&&!B&&C?3:B||C?2:I||N?1:0}for(var m=1;m<n.length-1;){if(n[m-1][0]==r&&n[m+1][0]==r){var f=n[m-1][1],o=n[m][1],u=n[m+1][1],v=this.diff_commonSuffix(f,o);if(v){var s=o.substring(o.length-v);f=f.substring(0,f.length-v),o=s+o.substring(0,o.length-v),u=s+u}for(var g=f,d=o,c=u,b=p(f,o)+p(o,u);o.charAt(0)===u.charAt(0);){f+=o.charAt(0),o=o.substring(1)+u.charAt(0),u=u.substring(1);var y=p(f,o)+p(o,u);y>=b&&(b=y,g=f,d=o,c=u)}n[m-1][1]!=g&&(g?n[m-1][1]=g:(n.splice(m-1,1),m--),n[m][1]=d,c?n[m+1][1]=c:(n.splice(m+1,1),m--))}m++}},h.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/,h.whitespaceRegex_=/\s/,h.linebreakRegex_=/[\r\n]/,h.blanklineEndRegex_=/\n\r?\n$/,h.blanklineStartRegex_=/^\r?\n\r?\n/,h.prototype.diff_cleanupEfficiency=function(n){for(var p=!1,m=[],f=0,o=null,u=0,v=!1,s=!1,g=!1,d=!1;u<n.length;)n[u][0]==r?(n[u][1].length<this.Diff_EditCost&&(g||d)?(m[f++]=u,v=g,s=d,o=n[u][1]):(f=0,o=null),g=d=!1):(n[u][0]==i?d=!0:g=!0,o&&(v&&s&&g&&d||o.length<this.Diff_EditCost/2&&v+s+g+d==3)&&(n.splice(m[f-1],0,new h.Diff(i,o)),n[m[f-1]+1][0]=l,f--,o=null,v&&s?(g=d=!0,f=0):(f--,u=f>0?m[f-1]:-1,g=d=!1),p=!0)),u++;p&&this.diff_cleanupMerge(n)},h.prototype.diff_cleanupMerge=function(n){n.push(new h.Diff(r,""));for(var p=0,m=0,f=0,o="",u="",v;p<n.length;)switch(n[p][0]){case l:f++,u+=n[p][1],p++;break;case i:m++,o+=n[p][1],p++;break;case r:m+f>1?(m!==0&&f!==0&&(v=this.diff_commonPrefix(u,o),v!==0&&(p-m-f>0&&n[p-m-f-1][0]==r?n[p-m-f-1][1]+=u.substring(0,v):(n.splice(0,0,new h.Diff(r,u.substring(0,v))),p++),u=u.substring(v),o=o.substring(v)),v=this.diff_commonSuffix(u,o),v!==0&&(n[p][1]=u.substring(u.length-v)+n[p][1],u=u.substring(0,u.length-v),o=o.substring(0,o.length-v))),p-=m+f,n.splice(p,m+f),o.length&&(n.splice(p,0,new h.Diff(i,o)),p++),u.length&&(n.splice(p,0,new h.Diff(l,u)),p++),p++):p!==0&&n[p-1][0]==r?(n[p-1][1]+=n[p][1],n.splice(p,1)):p++,f=0,m=0,o="",u="";break}n[n.length-1][1]===""&&n.pop();var s=!1;for(p=1;p<n.length-1;)n[p-1][0]==r&&n[p+1][0]==r&&(n[p][1].substring(n[p][1].length-n[p-1][1].length)==n[p-1][1]?(n[p][1]=n[p-1][1]+n[p][1].substring(0,n[p][1].length-n[p-1][1].length),n[p+1][1]=n[p-1][1]+n[p+1][1],n.splice(p-1,1),s=!0):n[p][1].substring(0,n[p+1][1].length)==n[p+1][1]&&(n[p-1][1]+=n[p+1][1],n[p][1]=n[p][1].substring(n[p+1][1].length)+n[p+1][1],n.splice(p+1,1),s=!0)),p++;s&&this.diff_cleanupMerge(n)},h.prototype.diff_xIndex=function(n,p){var m=0,f=0,o=0,u=0,v;for(v=0;v<n.length&&(n[v][0]!==l&&(m+=n[v][1].length),n[v][0]!==i&&(f+=n[v][1].length),!(m>p));v++)o=m,u=f;return n.length!=v&&n[v][0]===i?u:u+(p-o)},h.prototype.diff_prettyHtml=function(n){for(var p=[],m=/&/g,f=/</g,o=/>/g,u=/\n/g,v=0;v<n.length;v++){var s=n[v][0],g=n[v][1],d=g.replace(m,"&amp;").replace(f,"&lt;").replace(o,"&gt;").replace(u,"&para;<br>");switch(s){case l:p[v]='<ins style="background:#e6ffe6;">'+d+"</ins>";break;case i:p[v]='<del style="background:#ffe6e6;">'+d+"</del>";break;case r:p[v]="<span>"+d+"</span>";break}}return p.join("")},h.prototype.diff_text1=function(n){for(var p=[],m=0;m<n.length;m++)n[m][0]!==l&&(p[m]=n[m][1]);return p.join("")},h.prototype.diff_text2=function(n){for(var p=[],m=0;m<n.length;m++)n[m][0]!==i&&(p[m]=n[m][1]);return p.join("")},h.prototype.diff_levenshtein=function(n){for(var p=0,m=0,f=0,o=0;o<n.length;o++){var u=n[o][0],v=n[o][1];switch(u){case l:m+=v.length;break;case i:f+=v.length;break;case r:p+=Math.max(m,f),m=0,f=0;break}}return p+=Math.max(m,f),p},h.prototype.diff_toDelta=function(n){for(var p=[],m=0;m<n.length;m++)switch(n[m][0]){case l:p[m]="+"+encodeURI(n[m][1]);break;case i:p[m]="-"+n[m][1].length;break;case r:p[m]="="+n[m][1].length;break}return p.join("	").replace(/%20/g," ")},h.prototype.diff_fromDelta=function(n,p){for(var m=[],f=0,o=0,u=p.split(/\t/g),v=0;v<u.length;v++){var s=u[v].substring(1);switch(u[v].charAt(0)){case"+":try{m[f++]=new h.Diff(l,decodeURI(s))}catch(c){throw new Error("Illegal escape in diff_fromDelta: "+s)}break;case"-":case"=":var g=parseInt(s,10);if(isNaN(g)||g<0)throw new Error("Invalid number in diff_fromDelta: "+s);var d=n.substring(o,o+=g);u[v].charAt(0)=="="?m[f++]=new h.Diff(r,d):m[f++]=new h.Diff(i,d);break;default:if(u[v])throw new Error("Invalid diff operation in diff_fromDelta: "+u[v])}}if(o!=n.length)throw new Error("Delta length ("+o+") does not equal source text length ("+n.length+").");return m},h.prototype.match_main=function(n,p,m){if(n==null||p==null||m==null)throw new Error("Null input. (match_main)");return m=Math.max(0,Math.min(m,n.length)),n==p?0:n.length?n.substring(m,m+p.length)==p?m:this.match_bitap_(n,p,m):-1},h.prototype.match_bitap_=function(n,p,m){if(p.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var f=this.match_alphabet_(p),o=this;function u(C,R){var w=C/p.length,D=Math.abs(m-R);return o.Match_Distance?w+D/o.Match_Distance:D?1:w}var v=this.Match_Threshold,s=n.indexOf(p,m);s!=-1&&(v=Math.min(u(0,s),v),s=n.lastIndexOf(p,m+p.length),s!=-1&&(v=Math.min(u(0,s),v)));var g=1<<p.length-1;s=-1;for(var d,c,b=p.length+n.length,y,T=0;T<p.length;T++){for(d=0,c=b;d<c;)u(T,m+c)<=v?d=c:b=c,c=Math.floor((b-d)/2+d);b=c;var _=Math.max(1,m-c+1),A=Math.min(m+c,n.length)+p.length,E=Array(A+2);E[A+1]=(1<<T)-1;for(var I=A;I>=_;I--){var N=f[n.charAt(I-1)];if(T===0?E[I]=(E[I+1]<<1|1)&N:E[I]=(E[I+1]<<1|1)&N|((y[I+1]|y[I])<<1|1)|y[I+1],E[I]&g){var B=u(T,I-1);if(B<=v)if(v=B,s=I-1,s>m)_=Math.max(1,2*m-s);else break}}if(u(T+1,m)>v)break;y=E}return s},h.prototype.match_alphabet_=function(n){for(var p={},m=0;m<n.length;m++)p[n.charAt(m)]=0;for(var m=0;m<n.length;m++)p[n.charAt(m)]|=1<<n.length-m-1;return p},h.prototype.patch_addContext_=function(n,p){if(p.length!=0){if(n.start2===null)throw Error("patch not initialized");for(var m=p.substring(n.start2,n.start2+n.length1),f=0;p.indexOf(m)!=p.lastIndexOf(m)&&m.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)f+=this.Patch_Margin,m=p.substring(n.start2-f,n.start2+n.length1+f);f+=this.Patch_Margin;var o=p.substring(n.start2-f,n.start2);o&&n.diffs.unshift(new h.Diff(r,o));var u=p.substring(n.start2+n.length1,n.start2+n.length1+f);u&&n.diffs.push(new h.Diff(r,u)),n.start1-=o.length,n.start2-=o.length,n.length1+=o.length+u.length,n.length2+=o.length+u.length}},h.prototype.patch_make=function(n,p,m){var f,o;if(typeof n=="string"&&typeof p=="string"&&typeof m=="undefined")f=n,o=this.diff_main(f,p,!0),o.length>2&&(this.diff_cleanupSemantic(o),this.diff_cleanupEfficiency(o));else if(n&&typeof n=="object"&&typeof p=="undefined"&&typeof m=="undefined")o=n,f=this.diff_text1(o);else if(typeof n=="string"&&p&&typeof p=="object"&&typeof m=="undefined")f=n,o=p;else if(typeof n=="string"&&typeof p=="string"&&m&&typeof m=="object")f=n,o=m;else throw new Error("Unknown call format to patch_make.");if(o.length===0)return[];for(var u=[],v=new h.patch_obj,s=0,g=0,d=0,c=f,b=f,y=0;y<o.length;y++){var T=o[y][0],_=o[y][1];switch(!s&&T!==r&&(v.start1=g,v.start2=d),T){case l:v.diffs[s++]=o[y],v.length2+=_.length,b=b.substring(0,d)+_+b.substring(d);break;case i:v.length1+=_.length,v.diffs[s++]=o[y],b=b.substring(0,d)+b.substring(d+_.length);break;case r:_.length<=2*this.Patch_Margin&&s&&o.length!=y+1?(v.diffs[s++]=o[y],v.length1+=_.length,v.length2+=_.length):_.length>=2*this.Patch_Margin&&s&&(this.patch_addContext_(v,c),u.push(v),v=new h.patch_obj,s=0,c=b,g=d);break}T!==l&&(g+=_.length),T!==i&&(d+=_.length)}return s&&(this.patch_addContext_(v,c),u.push(v)),u},h.prototype.patch_deepCopy=function(n){for(var p=[],m=0;m<n.length;m++){var f=n[m],o=new h.patch_obj;o.diffs=[];for(var u=0;u<f.diffs.length;u++)o.diffs[u]=new h.Diff(f.diffs[u][0],f.diffs[u][1]);o.start1=f.start1,o.start2=f.start2,o.length1=f.length1,o.length2=f.length2,p[m]=o}return p},h.prototype.patch_apply=function(n,p){if(n.length==0)return[p,[]];n=this.patch_deepCopy(n);var m=this.patch_addPadding(n);p=m+p+m,this.patch_splitMax(n);for(var f=0,o=[],u=0;u<n.length;u++){var v=n[u].start2+f,s=this.diff_text1(n[u].diffs),g,d=-1;if(s.length>this.Match_MaxBits?(g=this.match_main(p,s.substring(0,this.Match_MaxBits),v),g!=-1&&(d=this.match_main(p,s.substring(s.length-this.Match_MaxBits),v+s.length-this.Match_MaxBits),(d==-1||g>=d)&&(g=-1))):g=this.match_main(p,s,v),g==-1)o[u]=!1,f-=n[u].length2-n[u].length1;else{o[u]=!0,f=g-v;var c;if(d==-1?c=p.substring(g,g+s.length):c=p.substring(g,d+this.Match_MaxBits),s==c)p=p.substring(0,g)+this.diff_text2(n[u].diffs)+p.substring(g+s.length);else{var b=this.diff_main(s,c,!1);if(s.length>this.Match_MaxBits&&this.diff_levenshtein(b)/s.length>this.Patch_DeleteThreshold)o[u]=!1;else{this.diff_cleanupSemanticLossless(b);for(var y=0,T,_=0;_<n[u].diffs.length;_++){var A=n[u].diffs[_];A[0]!==r&&(T=this.diff_xIndex(b,y)),A[0]===l?p=p.substring(0,g+T)+A[1]+p.substring(g+T):A[0]===i&&(p=p.substring(0,g+T)+p.substring(g+this.diff_xIndex(b,y+A[1].length))),A[0]!==i&&(y+=A[1].length)}}}}}return p=p.substring(m.length,p.length-m.length),[p,o]},h.prototype.patch_addPadding=function(n){for(var p=this.Patch_Margin,m="",f=1;f<=p;f++)m+=String.fromCharCode(f);for(var f=0;f<n.length;f++)n[f].start1+=p,n[f].start2+=p;var o=n[0],u=o.diffs;if(u.length==0||u[0][0]!=r)u.unshift(new h.Diff(r,m)),o.start1-=p,o.start2-=p,o.length1+=p,o.length2+=p;else if(p>u[0][1].length){var v=p-u[0][1].length;u[0][1]=m.substring(u[0][1].length)+u[0][1],o.start1-=v,o.start2-=v,o.length1+=v,o.length2+=v}if(o=n[n.length-1],u=o.diffs,u.length==0||u[u.length-1][0]!=r)u.push(new h.Diff(r,m)),o.length1+=p,o.length2+=p;else if(p>u[u.length-1][1].length){var v=p-u[u.length-1][1].length;u[u.length-1][1]+=m.substring(0,v),o.length1+=v,o.length2+=v}return m},h.prototype.patch_splitMax=function(n){for(var p=this.Match_MaxBits,m=0;m<n.length;m++)if(!(n[m].length1<=p)){var f=n[m];n.splice(m--,1);for(var o=f.start1,u=f.start2,v="";f.diffs.length!==0;){var s=new h.patch_obj,g=!0;for(s.start1=o-v.length,s.start2=u-v.length,v!==""&&(s.length1=s.length2=v.length,s.diffs.push(new h.Diff(r,v)));f.diffs.length!==0&&s.length1<p-this.Patch_Margin;){var d=f.diffs[0][0],c=f.diffs[0][1];d===l?(s.length2+=c.length,u+=c.length,s.diffs.push(f.diffs.shift()),g=!1):d===i&&s.diffs.length==1&&s.diffs[0][0]==r&&c.length>2*p?(s.length1+=c.length,o+=c.length,g=!1,s.diffs.push(new h.Diff(d,c)),f.diffs.shift()):(c=c.substring(0,p-s.length1-this.Patch_Margin),s.length1+=c.length,o+=c.length,d===r?(s.length2+=c.length,u+=c.length):g=!1,s.diffs.push(new h.Diff(d,c)),c==f.diffs[0][1]?f.diffs.shift():f.diffs[0][1]=f.diffs[0][1].substring(c.length))}v=this.diff_text2(s.diffs),v=v.substring(v.length-this.Patch_Margin);var b=this.diff_text1(f.diffs).substring(0,this.Patch_Margin);b!==""&&(s.length1+=b.length,s.length2+=b.length,s.diffs.length!==0&&s.diffs[s.diffs.length-1][0]===r?s.diffs[s.diffs.length-1][1]+=b:s.diffs.push(new h.Diff(r,b))),g||n.splice(++m,0,s)}}},h.prototype.patch_toText=function(n){for(var p=[],m=0;m<n.length;m++)p[m]=n[m];return p.join("")},h.prototype.patch_fromText=function(n){var p=[];if(!n)return p;for(var m=n.split(`
`),f=0,o=/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;f<m.length;){var u=m[f].match(o);if(!u)throw new Error("Invalid patch string: "+m[f]);var v=new h.patch_obj;for(p.push(v),v.start1=parseInt(u[1],10),u[2]===""?(v.start1--,v.length1=1):u[2]=="0"?v.length1=0:(v.start1--,v.length1=parseInt(u[2],10)),v.start2=parseInt(u[3],10),u[4]===""?(v.start2--,v.length2=1):u[4]=="0"?v.length2=0:(v.start2--,v.length2=parseInt(u[4],10)),f++;f<m.length;){var s=m[f].charAt(0);try{var g=decodeURI(m[f].substring(1))}catch(d){throw new Error("Illegal escape in patch_fromText: "+g)}if(s=="-")v.diffs.push(new h.Diff(i,g));else if(s=="+")v.diffs.push(new h.Diff(l,g));else if(s==" ")v.diffs.push(new h.Diff(r,g));else{if(s=="@")break;if(s!=="")throw new Error('Invalid patch mode "'+s+'" in: '+g)}f++}}return p},h.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0},h.patch_obj.prototype.toString=function(){var n,p;this.length1===0?n=this.start1+",0":this.length1==1?n=this.start1+1:n=this.start1+1+","+this.length1,this.length2===0?p=this.start2+",0":this.length2==1?p=this.start2+1:p=this.start2+1+","+this.length2;for(var m=["@@ -"+n+" +"+p+` @@
`],f,o=0;o<this.diffs.length;o++){switch(this.diffs[o][0]){case l:f="+";break;case i:f="-";break;case r:f=" ";break}m[o+1]=f+encodeURI(this.diffs[o][1])+`
`}return m.join("").replace(/%20/g," ")},P.exports=h,P.exports.diff_match_patch=h,P.exports.DIFF_DELETE=i,P.exports.DIFF_INSERT=l,P.exports.DIFF_EQUAL=r},2334:function(P){/**!

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

*/(function(h,i){P.exports=i()})(this,function(){return function(h){function i(r){if(l[r])return l[r].exports;var n=l[r]={exports:{},id:r,loaded:!1};return h[r].call(n.exports,n,n.exports,i),n.loaded=!0,n.exports}var l={};return i.m=h,i.c=l,i.p="",i(0)}([function(h,i,l){"use strict";function r(){var A=T();return A.compile=function(E,I){return v.compile(E,I,A)},A.precompile=function(E,I){return v.precompile(E,I,A)},A.AST=o.default,A.Compiler=v.Compiler,A.JavaScriptCompiler=g.default,A.Parser=u.parser,A.parse=u.parse,A.parseWithoutProcessing=u.parseWithoutProcessing,A}var n=l(1).default;i.__esModule=!0;var p=l(2),m=n(p),f=l(84),o=n(f),u=l(85),v=l(90),s=l(91),g=n(s),d=l(88),c=n(d),b=l(83),y=n(b),T=m.default.create,_=r();_.create=r,y.default(_),_.Visitor=c.default,_.default=_,i.default=_,h.exports=i.default},function(h,i){"use strict";i.default=function(l){return l&&l.__esModule?l:{default:l}},i.__esModule=!0},function(h,i,l){"use strict";function r(){var A=new f.HandlebarsEnvironment;return d.extend(A,f),A.SafeString=u.default,A.Exception=s.default,A.Utils=d,A.escapeExpression=d.escapeExpression,A.VM=b,A.template=function(E){return b.template(E,A)},A}var n=l(3).default,p=l(1).default;i.__esModule=!0;var m=l(4),f=n(m),o=l(77),u=p(o),v=l(6),s=p(v),g=l(5),d=n(g),c=l(78),b=n(c),y=l(83),T=p(y),_=r();_.create=r,T.default(_),_.default=_,i.default=_,h.exports=i.default},function(h,i){"use strict";i.default=function(l){if(l&&l.__esModule)return l;var r={};if(l!=null)for(var n in l)Object.prototype.hasOwnProperty.call(l,n)&&(r[n]=l[n]);return r.default=l,r},i.__esModule=!0},function(h,i,l){"use strict";function r(A,E,I){this.helpers=A||{},this.partials=E||{},this.decorators=I||{},o.registerDefaultHelpers(this),u.registerDefaultDecorators(this)}var n=l(1).default;i.__esModule=!0,i.HandlebarsEnvironment=r;var p=l(5),m=l(6),f=n(m),o=l(10),u=l(70),v=l(72),s=n(v),g=l(73),d="4.7.8";i.VERSION=d;var c=8;i.COMPILER_REVISION=c;var b=7;i.LAST_COMPATIBLE_COMPILER_REVISION=b;var y={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1",7:">= 4.0.0 <4.3.0",8:">= 4.3.0"};i.REVISION_CHANGES=y;var T="[object Object]";r.prototype={constructor:r,logger:s.default,log:s.default.log,registerHelper:function(A,E){if(p.toString.call(A)===T){if(E)throw new f.default("Arg not supported with multiple helpers");p.extend(this.helpers,A)}else this.helpers[A]=E},unregisterHelper:function(A){delete this.helpers[A]},registerPartial:function(A,E){if(p.toString.call(A)===T)p.extend(this.partials,A);else{if(typeof E=="undefined")throw new f.default('Attempting to register a partial called "'+A+'" as undefined');this.partials[A]=E}},unregisterPartial:function(A){delete this.partials[A]},registerDecorator:function(A,E){if(p.toString.call(A)===T){if(E)throw new f.default("Arg not supported with multiple decorators");p.extend(this.decorators,A)}else this.decorators[A]=E},unregisterDecorator:function(A){delete this.decorators[A]},resetLoggedPropertyAccesses:function(){g.resetLoggedProperties()}};var _=s.default.log;i.log=_,i.createFrame=p.createFrame,i.logger=s.default},function(h,i){"use strict";function l(y){return v[y]}function r(y){for(var T=1;T<arguments.length;T++)for(var _ in arguments[T])Object.prototype.hasOwnProperty.call(arguments[T],_)&&(y[_]=arguments[T][_]);return y}function n(y,T){for(var _=0,A=y.length;_<A;_++)if(y[_]===T)return _;return-1}function p(y){if(typeof y!="string"){if(y&&y.toHTML)return y.toHTML();if(y==null)return"";if(!y)return y+"";y=""+y}return g.test(y)?y.replace(s,l):y}function m(y){return!y&&y!==0||!(!b(y)||y.length!==0)}function f(y){var T=r({},y);return T._parent=y,T}function o(y,T){return y.path=T,y}function u(y,T){return(y?y+".":"")+T}i.__esModule=!0,i.extend=r,i.indexOf=n,i.escapeExpression=p,i.isEmpty=m,i.createFrame=f,i.blockParams=o,i.appendContextPath=u;var v={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;","=":"&#x3D;"},s=/[&<>"'`=]/g,g=/[&<>"'`=]/,d=Object.prototype.toString;i.toString=d;var c=function(y){return typeof y=="function"};c(/x/)&&(i.isFunction=c=function(y){return typeof y=="function"&&d.call(y)==="[object Function]"}),i.isFunction=c;var b=Array.isArray||function(y){return!(!y||typeof y!="object")&&d.call(y)==="[object Array]"};i.isArray=b},function(h,i,l){"use strict";function r(m,f){var o=f&&f.loc,u=void 0,v=void 0,s=void 0,g=void 0;o&&(u=o.start.line,v=o.end.line,s=o.start.column,g=o.end.column,m+=" - "+u+":"+s);for(var d=Error.prototype.constructor.call(this,m),c=0;c<p.length;c++)this[p[c]]=d[p[c]];Error.captureStackTrace&&Error.captureStackTrace(this,r);try{o&&(this.lineNumber=u,this.endLineNumber=v,n?(Object.defineProperty(this,"column",{value:s,enumerable:!0}),Object.defineProperty(this,"endColumn",{value:g,enumerable:!0})):(this.column=s,this.endColumn=g))}catch(b){}}var n=l(7).default;i.__esModule=!0;var p=["description","fileName","lineNumber","endLineNumber","message","name","number","stack"];r.prototype=new Error,i.default=r,h.exports=i.default},function(h,i,l){h.exports={default:l(8),__esModule:!0}},function(h,i,l){var r=l(9);h.exports=function(n,p,m){return r.setDesc(n,p,m)}},function(h,i){var l=Object;h.exports={create:l.create,getProto:l.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:l.getOwnPropertyDescriptor,setDesc:l.defineProperty,setDescs:l.defineProperties,getKeys:l.keys,getNames:l.getOwnPropertyNames,getSymbols:l.getOwnPropertySymbols,each:[].forEach}},function(h,i,l){"use strict";function r(E){f.default(E),u.default(E),s.default(E),d.default(E),b.default(E),T.default(E),A.default(E)}function n(E,I,N){E.helpers[I]&&(E.hooks[I]=E.helpers[I],N||delete E.helpers[I])}var p=l(1).default;i.__esModule=!0,i.registerDefaultHelpers=r,i.moveHelperToHooks=n;var m=l(11),f=p(m),o=l(12),u=p(o),v=l(65),s=p(v),g=l(66),d=p(g),c=l(67),b=p(c),y=l(68),T=p(y),_=l(69),A=p(_)},function(h,i,l){"use strict";i.__esModule=!0;var r=l(5);i.default=function(n){n.registerHelper("blockHelperMissing",function(p,m){var f=m.inverse,o=m.fn;if(p===!0)return o(this);if(p===!1||p==null)return f(this);if(r.isArray(p))return p.length>0?(m.ids&&(m.ids=[m.name]),n.helpers.each(p,m)):f(this);if(m.data&&m.ids){var u=r.createFrame(m.data);u.contextPath=r.appendContextPath(m.data.contextPath,m.name),m={data:u}}return o(p,m)})},h.exports=i.default},function(h,i,l){"use strict";var r=l(13).default,n=l(43).default,p=l(55).default,m=l(60).default,f=l(1).default;i.__esModule=!0;var o=l(5),u=l(6),v=f(u);i.default=function(s){s.registerHelper("each",function(g,d){function c(R,w,D){A&&(A.key=R,A.index=w,A.first=w===0,A.last=!!D,E&&(A.contextPath=E+R)),_+=b(g[R],{data:A,blockParams:o.blockParams([g[R],R],[E+R,null])})}if(!d)throw new v.default("Must pass iterator to #each");var b=d.fn,y=d.inverse,T=0,_="",A=void 0,E=void 0;if(d.data&&d.ids&&(E=o.appendContextPath(d.data.contextPath,d.ids[0])+"."),o.isFunction(g)&&(g=g.call(this)),d.data&&(A=o.createFrame(d.data)),g&&typeof g=="object")if(o.isArray(g))for(var I=g.length;T<I;T++)T in g&&c(T,T,T===g.length-1);else if(typeof r=="function"&&g[n]){for(var N=[],B=p(g),C=B.next();!C.done;C=B.next())N.push(C.value);g=N;for(var I=g.length;T<I;T++)c(T,T,T===g.length-1)}else(function(){var R=void 0;m(g).forEach(function(w){R!==void 0&&c(R,T-1),R=w,T++}),R!==void 0&&c(R,T-1,!0)})();return T===0&&(_=y(this)),_})},h.exports=i.default},function(h,i,l){h.exports={default:l(14),__esModule:!0}},function(h,i,l){l(15),l(42),h.exports=l(21).Symbol},function(h,i,l){"use strict";var r=l(9),n=l(16),p=l(17),m=l(18),f=l(20),o=l(24),u=l(19),v=l(27),s=l(28),g=l(30),d=l(29),c=l(31),b=l(36),y=l(37),T=l(38),_=l(39),A=l(32),E=l(26),I=r.getDesc,N=r.setDesc,B=r.create,C=b.get,R=n.Symbol,w=n.JSON,D=w&&w.stringify,k=!1,G=d("_hidden"),W=r.isEnum,L=v("symbol-registry"),F=v("symbols"),H=typeof R=="function",K=Object.prototype,U=m&&u(function(){return B(N({},"a",{get:function(){return N(this,"a",{value:7}).a}})).a!=7})?function(fe,xe,Te){var Oe=I(K,xe);Oe&&delete K[xe],N(fe,xe,Te),Oe&&fe!==K&&N(K,xe,Oe)}:N,Z=function(fe){var xe=F[fe]=B(R.prototype);return xe._k=fe,m&&k&&U(K,fe,{configurable:!0,set:function(Te){p(this,G)&&p(this[G],fe)&&(this[G][fe]=!1),U(this,fe,E(1,Te))}}),xe},ie=function(fe){return typeof fe=="symbol"},ue=function(fe,xe,Te){return Te&&p(F,xe)?(Te.enumerable?(p(fe,G)&&fe[G][xe]&&(fe[G][xe]=!1),Te=B(Te,{enumerable:E(0,!1)})):(p(fe,G)||N(fe,G,E(1,{})),fe[G][xe]=!0),U(fe,xe,Te)):N(fe,xe,Te)},J=function(fe,xe){_(fe);for(var Te,Oe=y(xe=A(xe)),mt=0,Ut=Oe.length;Ut>mt;)ue(fe,Te=Oe[mt++],xe[Te]);return fe},be=function(fe,xe){return xe===void 0?B(fe):J(B(fe),xe)},Ae=function(fe){var xe=W.call(this,fe);return!(xe||!p(this,fe)||!p(F,fe)||p(this,G)&&this[G][fe])||xe},Se=function(fe,xe){var Te=I(fe=A(fe),xe);return!Te||!p(F,xe)||p(fe,G)&&fe[G][xe]||(Te.enumerable=!0),Te},Xe=function(fe){for(var xe,Te=C(A(fe)),Oe=[],mt=0;Te.length>mt;)p(F,xe=Te[mt++])||xe==G||Oe.push(xe);return Oe},dt=function(fe){for(var xe,Te=C(A(fe)),Oe=[],mt=0;Te.length>mt;)p(F,xe=Te[mt++])&&Oe.push(F[xe]);return Oe},bt=function(fe){if(fe!==void 0&&!ie(fe)){for(var xe,Te,Oe=[fe],mt=1,Ut=arguments;Ut.length>mt;)Oe.push(Ut[mt++]);return xe=Oe[1],typeof xe=="function"&&(Te=xe),!Te&&T(xe)||(xe=function(tt,Me){if(Te&&(Me=Te.call(this,tt,Me)),!ie(Me))return Me}),Oe[1]=xe,D.apply(w,Oe)}},At=u(function(){var fe=R();return D([fe])!="[null]"||D({a:fe})!="{}"||D(Object(fe))!="{}"});H||(R=function(){if(ie(this))throw TypeError("Symbol is not a constructor");return Z(g(arguments.length>0?arguments[0]:void 0))},o(R.prototype,"toString",function(){return this._k}),ie=function(fe){return fe instanceof R},r.create=be,r.isEnum=Ae,r.getDesc=Se,r.setDesc=ue,r.setDescs=J,r.getNames=b.get=Xe,r.getSymbols=dt,m&&!l(41)&&o(K,"propertyIsEnumerable",Ae,!0));var Rt={for:function(fe){return p(L,fe+="")?L[fe]:L[fe]=R(fe)},keyFor:function(fe){return c(L,fe)},useSetter:function(){k=!0},useSimple:function(){k=!1}};r.each.call("hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),function(fe){var xe=d(fe);Rt[fe]=H?xe:Z(xe)}),k=!0,f(f.G+f.W,{Symbol:R}),f(f.S,"Symbol",Rt),f(f.S+f.F*!H,"Object",{create:be,defineProperty:ue,defineProperties:J,getOwnPropertyDescriptor:Se,getOwnPropertyNames:Xe,getOwnPropertySymbols:dt}),w&&f(f.S+f.F*(!H||At),"JSON",{stringify:bt}),s(R,"Symbol"),s(Math,"Math",!0),s(n.JSON,"JSON",!0)},function(h,i){var l=h.exports=typeof window!="undefined"&&window.Math==Math?window:typeof self!="undefined"&&self.Math==Math?self:Function("return this")();typeof __g=="number"&&(__g=l)},function(h,i){var l={}.hasOwnProperty;h.exports=function(r,n){return l.call(r,n)}},function(h,i,l){h.exports=!l(19)(function(){return Object.defineProperty({},"a",{get:function(){return 7}}).a!=7})},function(h,i){h.exports=function(l){try{return!!l()}catch(r){return!0}}},function(h,i,l){var r=l(16),n=l(21),p=l(22),m="prototype",f=function(o,u,v){var s,g,d,c=o&f.F,b=o&f.G,y=o&f.S,T=o&f.P,_=o&f.B,A=o&f.W,E=b?n:n[u]||(n[u]={}),I=b?r:y?r[u]:(r[u]||{})[m];b&&(v=u);for(s in v)g=!c&&I&&s in I,g&&s in E||(d=g?I[s]:v[s],E[s]=b&&typeof I[s]!="function"?v[s]:_&&g?p(d,r):A&&I[s]==d?function(N){var B=function(C){return this instanceof N?new N(C):N(C)};return B[m]=N[m],B}(d):T&&typeof d=="function"?p(Function.call,d):d,T&&((E[m]||(E[m]={}))[s]=d))};f.F=1,f.G=2,f.S=4,f.P=8,f.B=16,f.W=32,h.exports=f},function(h,i){var l=h.exports={version:"1.2.6"};typeof __e=="number"&&(__e=l)},function(h,i,l){var r=l(23);h.exports=function(n,p,m){if(r(n),p===void 0)return n;switch(m){case 1:return function(f){return n.call(p,f)};case 2:return function(f,o){return n.call(p,f,o)};case 3:return function(f,o,u){return n.call(p,f,o,u)}}return function(){return n.apply(p,arguments)}}},function(h,i){h.exports=function(l){if(typeof l!="function")throw TypeError(l+" is not a function!");return l}},function(h,i,l){h.exports=l(25)},function(h,i,l){var r=l(9),n=l(26);h.exports=l(18)?function(p,m,f){return r.setDesc(p,m,n(1,f))}:function(p,m,f){return p[m]=f,p}},function(h,i){h.exports=function(l,r){return{enumerable:!(1&l),configurable:!(2&l),writable:!(4&l),value:r}}},function(h,i,l){var r=l(16),n="__core-js_shared__",p=r[n]||(r[n]={});h.exports=function(m){return p[m]||(p[m]={})}},function(h,i,l){var r=l(9).setDesc,n=l(17),p=l(29)("toStringTag");h.exports=function(m,f,o){m&&!n(m=o?m:m.prototype,p)&&r(m,p,{configurable:!0,value:f})}},function(h,i,l){var r=l(27)("wks"),n=l(30),p=l(16).Symbol;h.exports=function(m){return r[m]||(r[m]=p&&p[m]||(p||n)("Symbol."+m))}},function(h,i){var l=0,r=Math.random();h.exports=function(n){return"Symbol(".concat(n===void 0?"":n,")_",(++l+r).toString(36))}},function(h,i,l){var r=l(9),n=l(32);h.exports=function(p,m){for(var f,o=n(p),u=r.getKeys(o),v=u.length,s=0;v>s;)if(o[f=u[s++]]===m)return f}},function(h,i,l){var r=l(33),n=l(35);h.exports=function(p){return r(n(p))}},function(h,i,l){var r=l(34);h.exports=Object("z").propertyIsEnumerable(0)?Object:function(n){return r(n)=="String"?n.split(""):Object(n)}},function(h,i){var l={}.toString;h.exports=function(r){return l.call(r).slice(8,-1)}},function(h,i){h.exports=function(l){if(l==null)throw TypeError("Can't call method on  "+l);return l}},function(h,i,l){var r=l(32),n=l(9).getNames,p={}.toString,m=typeof window=="object"&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],f=function(o){try{return n(o)}catch(u){return m.slice()}};h.exports.get=function(o){return m&&p.call(o)=="[object Window]"?f(o):n(r(o))}},function(h,i,l){var r=l(9);h.exports=function(n){var p=r.getKeys(n),m=r.getSymbols;if(m)for(var f,o=m(n),u=r.isEnum,v=0;o.length>v;)u.call(n,f=o[v++])&&p.push(f);return p}},function(h,i,l){var r=l(34);h.exports=Array.isArray||function(n){return r(n)=="Array"}},function(h,i,l){var r=l(40);h.exports=function(n){if(!r(n))throw TypeError(n+" is not an object!");return n}},function(h,i){h.exports=function(l){return typeof l=="object"?l!==null:typeof l=="function"}},function(h,i){h.exports=!0},function(h,i){},function(h,i,l){h.exports={default:l(44),__esModule:!0}},function(h,i,l){l(45),l(51),h.exports=l(29)("iterator")},function(h,i,l){"use strict";var r=l(46)(!0);l(48)(String,"String",function(n){this._t=String(n),this._i=0},function(){var n,p=this._t,m=this._i;return m>=p.length?{value:void 0,done:!0}:(n=r(p,m),this._i+=n.length,{value:n,done:!1})})},function(h,i,l){var r=l(47),n=l(35);h.exports=function(p){return function(m,f){var o,u,v=String(n(m)),s=r(f),g=v.length;return s<0||s>=g?p?"":void 0:(o=v.charCodeAt(s),o<55296||o>56319||s+1===g||(u=v.charCodeAt(s+1))<56320||u>57343?p?v.charAt(s):o:p?v.slice(s,s+2):(o-55296<<10)+(u-56320)+65536)}}},function(h,i){var l=Math.ceil,r=Math.floor;h.exports=function(n){return isNaN(n=+n)?0:(n>0?r:l)(n)}},function(h,i,l){"use strict";var r=l(41),n=l(20),p=l(24),m=l(25),f=l(17),o=l(49),u=l(50),v=l(28),s=l(9).getProto,g=l(29)("iterator"),d=!([].keys&&"next"in[].keys()),c="@@iterator",b="keys",y="values",T=function(){return this};h.exports=function(_,A,E,I,N,B,C){u(E,A,I);var R,w,D=function(U){if(!d&&U in L)return L[U];switch(U){case b:return function(){return new E(this,U)};case y:return function(){return new E(this,U)}}return function(){return new E(this,U)}},k=A+" Iterator",G=N==y,W=!1,L=_.prototype,F=L[g]||L[c]||N&&L[N],H=F||D(N);if(F){var K=s(H.call(new _));v(K,k,!0),!r&&f(L,c)&&m(K,g,T),G&&F.name!==y&&(W=!0,H=function(){return F.call(this)})}if(r&&!C||!d&&!W&&L[g]||m(L,g,H),o[A]=H,o[k]=T,N)if(R={values:G?H:D(y),keys:B?H:D(b),entries:G?D("entries"):H},C)for(w in R)w in L||p(L,w,R[w]);else n(n.P+n.F*(d||W),A,R);return R}},function(h,i){h.exports={}},function(h,i,l){"use strict";var r=l(9),n=l(26),p=l(28),m={};l(25)(m,l(29)("iterator"),function(){return this}),h.exports=function(f,o,u){f.prototype=r.create(m,{next:n(1,u)}),p(f,o+" Iterator")}},function(h,i,l){l(52);var r=l(49);r.NodeList=r.HTMLCollection=r.Array},function(h,i,l){"use strict";var r=l(53),n=l(54),p=l(49),m=l(32);h.exports=l(48)(Array,"Array",function(f,o){this._t=m(f),this._i=0,this._k=o},function(){var f=this._t,o=this._k,u=this._i++;return!f||u>=f.length?(this._t=void 0,n(1)):o=="keys"?n(0,u):o=="values"?n(0,f[u]):n(0,[u,f[u]])},"values"),p.Arguments=p.Array,r("keys"),r("values"),r("entries")},function(h,i){h.exports=function(){}},function(h,i){h.exports=function(l,r){return{value:r,done:!!l}}},function(h,i,l){h.exports={default:l(56),__esModule:!0}},function(h,i,l){l(51),l(45),h.exports=l(57)},function(h,i,l){var r=l(39),n=l(58);h.exports=l(21).getIterator=function(p){var m=n(p);if(typeof m!="function")throw TypeError(p+" is not iterable!");return r(m.call(p))}},function(h,i,l){var r=l(59),n=l(29)("iterator"),p=l(49);h.exports=l(21).getIteratorMethod=function(m){if(m!=null)return m[n]||m["@@iterator"]||p[r(m)]}},function(h,i,l){var r=l(34),n=l(29)("toStringTag"),p=r(function(){return arguments}())=="Arguments";h.exports=function(m){var f,o,u;return m===void 0?"Undefined":m===null?"Null":typeof(o=(f=Object(m))[n])=="string"?o:p?r(f):(u=r(f))=="Object"&&typeof f.callee=="function"?"Arguments":u}},function(h,i,l){h.exports={default:l(61),__esModule:!0}},function(h,i,l){l(62),h.exports=l(21).Object.keys},function(h,i,l){var r=l(63);l(64)("keys",function(n){return function(p){return n(r(p))}})},function(h,i,l){var r=l(35);h.exports=function(n){return Object(r(n))}},function(h,i,l){var r=l(20),n=l(21),p=l(19);h.exports=function(m,f){var o=(n.Object||{})[m]||Object[m],u={};u[m]=f(o),r(r.S+r.F*p(function(){o(1)}),"Object",u)}},function(h,i,l){"use strict";var r=l(1).default;i.__esModule=!0;var n=l(6),p=r(n);i.default=function(m){m.registerHelper("helperMissing",function(){if(arguments.length!==1)throw new p.default('Missing helper: "'+arguments[arguments.length-1].name+'"')})},h.exports=i.default},function(h,i,l){"use strict";var r=l(1).default;i.__esModule=!0;var n=l(5),p=l(6),m=r(p);i.default=function(f){f.registerHelper("if",function(o,u){if(arguments.length!=2)throw new m.default("#if requires exactly one argument");return n.isFunction(o)&&(o=o.call(this)),!u.hash.includeZero&&!o||n.isEmpty(o)?u.inverse(this):u.fn(this)}),f.registerHelper("unless",function(o,u){if(arguments.length!=2)throw new m.default("#unless requires exactly one argument");return f.helpers.if.call(this,o,{fn:u.inverse,inverse:u.fn,hash:u.hash})})},h.exports=i.default},function(h,i){"use strict";i.__esModule=!0,i.default=function(l){l.registerHelper("log",function(){for(var r=[void 0],n=arguments[arguments.length-1],p=0;p<arguments.length-1;p++)r.push(arguments[p]);var m=1;n.hash.level!=null?m=n.hash.level:n.data&&n.data.level!=null&&(m=n.data.level),r[0]=m,l.log.apply(l,r)})},h.exports=i.default},function(h,i){"use strict";i.__esModule=!0,i.default=function(l){l.registerHelper("lookup",function(r,n,p){return r&&p.lookupProperty(r,n)})},h.exports=i.default},function(h,i,l){"use strict";var r=l(1).default;i.__esModule=!0;var n=l(5),p=l(6),m=r(p);i.default=function(f){f.registerHelper("with",function(o,u){if(arguments.length!=2)throw new m.default("#with requires exactly one argument");n.isFunction(o)&&(o=o.call(this));var v=u.fn;if(n.isEmpty(o))return u.inverse(this);var s=u.data;return u.data&&u.ids&&(s=n.createFrame(u.data),s.contextPath=n.appendContextPath(u.data.contextPath,u.ids[0])),v(o,{data:s,blockParams:n.blockParams([o],[s&&s.contextPath])})})},h.exports=i.default},function(h,i,l){"use strict";function r(f){m.default(f)}var n=l(1).default;i.__esModule=!0,i.registerDefaultDecorators=r;var p=l(71),m=n(p)},function(h,i,l){"use strict";i.__esModule=!0;var r=l(5);i.default=function(n){n.registerDecorator("inline",function(p,m,f,o){var u=p;return m.partials||(m.partials={},u=function(v,s){var g=f.partials;f.partials=r.extend({},g,m.partials);var d=p(v,s);return f.partials=g,d}),m.partials[o.args[0]]=o.fn,u})},h.exports=i.default},function(h,i,l){"use strict";i.__esModule=!0;var r=l(5),n={methodMap:["debug","info","warn","error"],level:"info",lookupLevel:function(p){if(typeof p=="string"){var m=r.indexOf(n.methodMap,p.toLowerCase());p=m>=0?m:parseInt(p,10)}return p},log:function(p){if(p=n.lookupLevel(p),typeof console!="undefined"&&n.lookupLevel(n.level)<=p){var m=n.methodMap[p];console[m]||(m="log");for(var f=arguments.length,o=Array(f>1?f-1:0),u=1;u<f;u++)o[u-1]=arguments[u];console[m].apply(console,o)}}};i.default=n,h.exports=i.default},function(h,i,l){"use strict";function r(b){var y=o(null);y.constructor=!1,y.__defineGetter__=!1,y.__defineSetter__=!1,y.__lookupGetter__=!1;var T=o(null);return T.__proto__=!1,{properties:{whitelist:s.createNewLookupObject(T,b.allowedProtoProperties),defaultValue:b.allowProtoPropertiesByDefault},methods:{whitelist:s.createNewLookupObject(y,b.allowedProtoMethods),defaultValue:b.allowProtoMethodsByDefault}}}function n(b,y,T){return p(typeof b=="function"?y.methods:y.properties,T)}function p(b,y){return b.whitelist[y]!==void 0?b.whitelist[y]===!0:b.defaultValue!==void 0?b.defaultValue:(m(y),!1)}function m(b){c[b]!==!0&&(c[b]=!0,d.default.log("error",'Handlebars: Access has been denied to resolve the property "'+b+`" because it is not an "own property" of its parent.
You can add a runtime option to disable the check or this warning:
See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details`))}function f(){u(c).forEach(function(b){delete c[b]})}var o=l(74).default,u=l(60).default,v=l(1).default;i.__esModule=!0,i.createProtoAccessControl=r,i.resultIsAllowed=n,i.resetLoggedProperties=f;var s=l(76),g=l(72),d=v(g),c=o(null)},function(h,i,l){h.exports={default:l(75),__esModule:!0}},function(h,i,l){var r=l(9);h.exports=function(n,p){return r.create(n,p)}},function(h,i,l){"use strict";function r(){for(var m=arguments.length,f=Array(m),o=0;o<m;o++)f[o]=arguments[o];return p.extend.apply(void 0,[n(null)].concat(f))}var n=l(74).default;i.__esModule=!0,i.createNewLookupObject=r;var p=l(5)},function(h,i){"use strict";function l(r){this.string=r}i.__esModule=!0,l.prototype.toString=l.prototype.toHTML=function(){return""+this.string},i.default=l,h.exports=i.default},function(h,i,l){"use strict";function r(R){var w=R&&R[0]||1,D=I.COMPILER_REVISION;if(!(w>=I.LAST_COMPATIBLE_COMPILER_REVISION&&w<=I.COMPILER_REVISION)){if(w<I.LAST_COMPATIBLE_COMPILER_REVISION){var k=I.REVISION_CHANGES[D],G=I.REVISION_CHANGES[w];throw new E.default("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+k+") or downgrade your runtime to an older version ("+G+").")}throw new E.default("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+R[1]+").")}}function n(R,w){function D(L,F,H){H.hash&&(F=_.extend({},F,H.hash),H.ids&&(H.ids[0]=!0)),L=w.VM.resolvePartial.call(this,L,F,H);var K=_.extend({},H,{hooks:this.hooks,protoAccessControl:this.protoAccessControl}),U=w.VM.invokePartial.call(this,L,F,K);if(U==null&&w.compile&&(H.partials[H.name]=w.compile(L,R.compilerOptions,w),U=H.partials[H.name](F,K)),U!=null){if(H.indent){for(var Z=U.split(`
`),ie=0,ue=Z.length;ie<ue&&(Z[ie]||ie+1!==ue);ie++)Z[ie]=H.indent+Z[ie];U=Z.join(`
`)}return U}throw new E.default("The partial "+H.name+" could not be compiled when running in runtime-only mode")}function k(L){function F(ie){return""+R.main(W,ie,W.helpers,W.partials,K,Z,U)}var H=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],K=H.data;k._setup(H),!H.partial&&R.useData&&(K=u(L,K));var U=void 0,Z=R.useBlockParams?[]:void 0;return R.useDepths&&(U=H.depths?L!=H.depths[0]?[L].concat(H.depths):H.depths:[L]),(F=v(R.main,F,W,H.depths||[],K,Z))(L,H)}if(!w)throw new E.default("No environment passed to template");if(!R||!R.main)throw new E.default("Unknown template object: "+typeof R);R.main.decorator=R.main_d,w.VM.checkRevision(R.compiler);var G=R.compiler&&R.compiler[0]===7,W={strict:function(L,F,H){if(!(L&&F in L))throw new E.default('"'+F+'" not defined in '+L,{loc:H});return W.lookupProperty(L,F)},lookupProperty:function(L,F){var H=L[F];return H==null||Object.prototype.hasOwnProperty.call(L,F)||C.resultIsAllowed(H,W.protoAccessControl,F)?H:void 0},lookup:function(L,F){for(var H=L.length,K=0;K<H;K++){var U=L[K]&&W.lookupProperty(L[K],F);if(U!=null)return L[K][F]}},lambda:function(L,F){return typeof L=="function"?L.call(F):L},escapeExpression:_.escapeExpression,invokePartial:D,fn:function(L){var F=R[L];return F.decorator=R[L+"_d"],F},programs:[],program:function(L,F,H,K,U){var Z=this.programs[L],ie=this.fn(L);return F||U||K||H?Z=p(this,L,ie,F,H,K,U):Z||(Z=this.programs[L]=p(this,L,ie)),Z},data:function(L,F){for(;L&&F--;)L=L._parent;return L},mergeIfNeeded:function(L,F){var H=L||F;return L&&F&&L!==F&&(H=_.extend({},F,L)),H},nullContext:d({}),noop:w.VM.noop,compilerInfo:R.compiler};return k.isTop=!0,k._setup=function(L){if(L.partial)W.protoAccessControl=L.protoAccessControl,W.helpers=L.helpers,W.partials=L.partials,W.decorators=L.decorators,W.hooks=L.hooks;else{var F=_.extend({},w.helpers,L.helpers);s(F,W),W.helpers=F,R.usePartial&&(W.partials=W.mergeIfNeeded(L.partials,w.partials)),(R.usePartial||R.useDecorators)&&(W.decorators=_.extend({},w.decorators,L.decorators)),W.hooks={},W.protoAccessControl=C.createProtoAccessControl(L);var H=L.allowCallsToHelperMissing||G;N.moveHelperToHooks(W,"helperMissing",H),N.moveHelperToHooks(W,"blockHelperMissing",H)}},k._child=function(L,F,H,K){if(R.useBlockParams&&!H)throw new E.default("must pass block params");if(R.useDepths&&!K)throw new E.default("must pass parent depths");return p(W,L,R[L],F,0,H,K)},k}function p(R,w,D,k,G,W,L){function F(H){var K=arguments.length<=1||arguments[1]===void 0?{}:arguments[1],U=L;return!L||H==L[0]||H===R.nullContext&&L[0]===null||(U=[H].concat(L)),D(R,H,R.helpers,R.partials,K.data||k,W&&[K.blockParams].concat(W),U)}return F=v(D,F,R,L,k,W),F.program=w,F.depth=L?L.length:0,F.blockParams=G||0,F}function m(R,w,D){return R?R.call||D.name||(D.name=R,R=D.partials[R]):R=D.name==="@partial-block"?D.data["partial-block"]:D.partials[D.name],R}function f(R,w,D){var k=D.data&&D.data["partial-block"];D.partial=!0,D.ids&&(D.data.contextPath=D.ids[0]||D.data.contextPath);var G=void 0;if(D.fn&&D.fn!==o&&function(){D.data=I.createFrame(D.data);var W=D.fn;G=D.data["partial-block"]=function(L){var F=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];return F.data=I.createFrame(F.data),F.data["partial-block"]=k,W(L,F)},W.partials&&(D.partials=_.extend({},D.partials,W.partials))}(),R===void 0&&G&&(R=G),R===void 0)throw new E.default("The partial "+D.name+" could not be found");if(R instanceof Function)return R(w,D)}function o(){return""}function u(R,w){return w&&"root"in w||(w=w?I.createFrame(w):{},w.root=R),w}function v(R,w,D,k,G,W){if(R.decorator){var L={};w=R.decorator(w,L,D,k&&k[0],G,W,k),_.extend(w,L)}return w}function s(R,w){c(R).forEach(function(D){var k=R[D];R[D]=g(k,w)})}function g(R,w){var D=w.lookupProperty;return B.wrapHelper(R,function(k){return _.extend({lookupProperty:D},k)})}var d=l(79).default,c=l(60).default,b=l(3).default,y=l(1).default;i.__esModule=!0,i.checkRevision=r,i.template=n,i.wrapProgram=p,i.resolvePartial=m,i.invokePartial=f,i.noop=o;var T=l(5),_=b(T),A=l(6),E=y(A),I=l(4),N=l(10),B=l(82),C=l(73)},function(h,i,l){h.exports={default:l(80),__esModule:!0}},function(h,i,l){l(81),h.exports=l(21).Object.seal},function(h,i,l){var r=l(40);l(64)("seal",function(n){return function(p){return n&&r(p)?n(p):p}})},function(h,i){"use strict";function l(r,n){if(typeof r!="function")return r;var p=function(){var m=arguments[arguments.length-1];return arguments[arguments.length-1]=n(m),r.apply(this,arguments)};return p}i.__esModule=!0,i.wrapHelper=l},function(h,i){"use strict";i.__esModule=!0,i.default=function(l){(function(){typeof globalThis!="object"&&(Object.prototype.__defineGetter__("__magic__",function(){return this}),__magic__.globalThis=__magic__,delete Object.prototype.__magic__)})();var r=globalThis.Handlebars;l.noConflict=function(){return globalThis.Handlebars===l&&(globalThis.Handlebars=r),l}},h.exports=i.default},function(h,i){"use strict";i.__esModule=!0;var l={helpers:{helperExpression:function(r){return r.type==="SubExpression"||(r.type==="MustacheStatement"||r.type==="BlockStatement")&&!!(r.params&&r.params.length||r.hash)},scopedId:function(r){return/^\.|this\b/.test(r.original)},simpleId:function(r){return r.parts.length===1&&!l.helpers.scopedId(r)&&!r.depth}}};i.default=l,h.exports=i.default},function(h,i,l){"use strict";function r(b,y){if(b.type==="Program")return b;o.default.yy=c,c.locInfo=function(_){return new c.SourceLocation(y&&y.srcName,_)};var T=o.default.parse(b);return T}function n(b,y){var T=r(b,y),_=new v.default(y);return _.accept(T)}var p=l(1).default,m=l(3).default;i.__esModule=!0,i.parseWithoutProcessing=r,i.parse=n;var f=l(86),o=p(f),u=l(87),v=p(u),s=l(89),g=m(s),d=l(5);i.parser=o.default;var c={};d.extend(c,g)},function(h,i){"use strict";i.__esModule=!0;var l=function(){function r(){this.yy={}}var n={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,partialBlock:12,content:13,COMMENT:14,CONTENT:15,openRawBlock:16,rawBlock_repetition0:17,END_RAW_BLOCK:18,OPEN_RAW_BLOCK:19,helperName:20,openRawBlock_repetition0:21,openRawBlock_option0:22,CLOSE_RAW_BLOCK:23,openBlock:24,block_option0:25,closeBlock:26,openInverse:27,block_option1:28,OPEN_BLOCK:29,openBlock_repetition0:30,openBlock_option0:31,openBlock_option1:32,CLOSE:33,OPEN_INVERSE:34,openInverse_repetition0:35,openInverse_option0:36,openInverse_option1:37,openInverseChain:38,OPEN_INVERSE_CHAIN:39,openInverseChain_repetition0:40,openInverseChain_option0:41,openInverseChain_option1:42,inverseAndProgram:43,INVERSE:44,inverseChain:45,inverseChain_option0:46,OPEN_ENDBLOCK:47,OPEN:48,mustache_repetition0:49,mustache_option0:50,OPEN_UNESCAPED:51,mustache_repetition1:52,mustache_option1:53,CLOSE_UNESCAPED:54,OPEN_PARTIAL:55,partialName:56,partial_repetition0:57,partial_option0:58,openPartialBlock:59,OPEN_PARTIAL_BLOCK:60,openPartialBlock_repetition0:61,openPartialBlock_option0:62,param:63,sexpr:64,OPEN_SEXPR:65,sexpr_repetition0:66,sexpr_option0:67,CLOSE_SEXPR:68,hash:69,hash_repetition_plus0:70,hashSegment:71,ID:72,EQUALS:73,blockParams:74,OPEN_BLOCK_PARAMS:75,blockParams_repetition_plus0:76,CLOSE_BLOCK_PARAMS:77,path:78,dataName:79,STRING:80,NUMBER:81,BOOLEAN:82,UNDEFINED:83,NULL:84,DATA:85,pathSegments:86,SEP:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,0],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function(m,f,o,u,v,s,g){var d=s.length-1;switch(v){case 1:return s[d-1];case 2:this.$=u.prepareProgram(s[d]);break;case 3:this.$=s[d];break;case 4:this.$=s[d];break;case 5:this.$=s[d];break;case 6:this.$=s[d];break;case 7:this.$=s[d];break;case 8:this.$=s[d];break;case 9:this.$={type:"CommentStatement",value:u.stripComment(s[d]),strip:u.stripFlags(s[d],s[d]),loc:u.locInfo(this._$)};break;case 10:this.$={type:"ContentStatement",original:s[d],value:s[d],loc:u.locInfo(this._$)};break;case 11:this.$=u.prepareRawBlock(s[d-2],s[d-1],s[d],this._$);break;case 12:this.$={path:s[d-3],params:s[d-2],hash:s[d-1]};break;case 13:this.$=u.prepareBlock(s[d-3],s[d-2],s[d-1],s[d],!1,this._$);break;case 14:this.$=u.prepareBlock(s[d-3],s[d-2],s[d-1],s[d],!0,this._$);break;case 15:this.$={open:s[d-5],path:s[d-4],params:s[d-3],hash:s[d-2],blockParams:s[d-1],strip:u.stripFlags(s[d-5],s[d])};break;case 16:this.$={path:s[d-4],params:s[d-3],hash:s[d-2],blockParams:s[d-1],strip:u.stripFlags(s[d-5],s[d])};break;case 17:this.$={path:s[d-4],params:s[d-3],hash:s[d-2],blockParams:s[d-1],strip:u.stripFlags(s[d-5],s[d])};break;case 18:this.$={strip:u.stripFlags(s[d-1],s[d-1]),program:s[d]};break;case 19:var c=u.prepareBlock(s[d-2],s[d-1],s[d],s[d],!1,this._$),b=u.prepareProgram([c],s[d-1].loc);b.chained=!0,this.$={strip:s[d-2].strip,program:b,chain:!0};break;case 20:this.$=s[d];break;case 21:this.$={path:s[d-1],strip:u.stripFlags(s[d-2],s[d])};break;case 22:this.$=u.prepareMustache(s[d-3],s[d-2],s[d-1],s[d-4],u.stripFlags(s[d-4],s[d]),this._$);break;case 23:this.$=u.prepareMustache(s[d-3],s[d-2],s[d-1],s[d-4],u.stripFlags(s[d-4],s[d]),this._$);break;case 24:this.$={type:"PartialStatement",name:s[d-3],params:s[d-2],hash:s[d-1],indent:"",strip:u.stripFlags(s[d-4],s[d]),loc:u.locInfo(this._$)};break;case 25:this.$=u.preparePartialBlock(s[d-2],s[d-1],s[d],this._$);break;case 26:this.$={path:s[d-3],params:s[d-2],hash:s[d-1],strip:u.stripFlags(s[d-4],s[d])};break;case 27:this.$=s[d];break;case 28:this.$=s[d];break;case 29:this.$={type:"SubExpression",path:s[d-3],params:s[d-2],hash:s[d-1],loc:u.locInfo(this._$)};break;case 30:this.$={type:"Hash",pairs:s[d],loc:u.locInfo(this._$)};break;case 31:this.$={type:"HashPair",key:u.id(s[d-2]),value:s[d],loc:u.locInfo(this._$)};break;case 32:this.$=u.id(s[d-1]);break;case 33:this.$=s[d];break;case 34:this.$=s[d];break;case 35:this.$={type:"StringLiteral",value:s[d],original:s[d],loc:u.locInfo(this._$)};break;case 36:this.$={type:"NumberLiteral",value:Number(s[d]),original:Number(s[d]),loc:u.locInfo(this._$)};break;case 37:this.$={type:"BooleanLiteral",value:s[d]==="true",original:s[d]==="true",loc:u.locInfo(this._$)};break;case 38:this.$={type:"UndefinedLiteral",original:void 0,value:void 0,loc:u.locInfo(this._$)};break;case 39:this.$={type:"NullLiteral",original:null,value:null,loc:u.locInfo(this._$)};break;case 40:this.$=s[d];break;case 41:this.$=s[d];break;case 42:this.$=u.preparePath(!0,s[d],this._$);break;case 43:this.$=u.preparePath(!1,s[d],this._$);break;case 44:s[d-2].push({part:u.id(s[d]),original:s[d],separator:s[d-1]}),this.$=s[d-2];break;case 45:this.$=[{part:u.id(s[d]),original:s[d]}];break;case 46:this.$=[];break;case 47:s[d-1].push(s[d]);break;case 48:this.$=[];break;case 49:s[d-1].push(s[d]);break;case 50:this.$=[];break;case 51:s[d-1].push(s[d]);break;case 58:this.$=[];break;case 59:s[d-1].push(s[d]);break;case 64:this.$=[];break;case 65:s[d-1].push(s[d]);break;case 70:this.$=[];break;case 71:s[d-1].push(s[d]);break;case 78:this.$=[];break;case 79:s[d-1].push(s[d]);break;case 82:this.$=[];break;case 83:s[d-1].push(s[d]);break;case 86:this.$=[];break;case 87:s[d-1].push(s[d]);break;case 90:this.$=[];break;case 91:s[d-1].push(s[d]);break;case 94:this.$=[];break;case 95:s[d-1].push(s[d]);break;case 98:this.$=[s[d]];break;case 99:s[d-1].push(s[d]);break;case 100:this.$=[s[d]];break;case 101:s[d-1].push(s[d])}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{15:[2,48],17:39,18:[2,48]},{20:41,56:40,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:44,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:45,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:41,56:48,64:42,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:49,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,50]},{72:[1,35],86:51},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:52,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:53,38:55,39:[1,57],43:56,44:[1,58],45:54,47:[2,54]},{28:59,43:60,44:[1,58],47:[2,56]},{13:62,15:[1,20],18:[1,61]},{33:[2,86],57:63,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:64,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:65,47:[1,66]},{30:67,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:68,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:69,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:70,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:74,33:[2,80],50:71,63:72,64:75,65:[1,43],69:73,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,79]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,50]},{20:74,53:80,54:[2,84],63:81,64:75,65:[1,43],69:82,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:83,47:[1,66]},{47:[2,55]},{4:84,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:85,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:86,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:87,47:[1,66]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:74,33:[2,88],58:88,63:89,64:75,65:[1,43],69:90,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:91,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:92,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,31:93,33:[2,60],63:94,64:75,65:[1,43],69:95,70:76,71:77,72:[1,78],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,66],36:96,63:97,64:75,65:[1,43],69:98,70:76,71:77,72:[1,78],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,22:99,23:[2,52],63:100,64:75,65:[1,43],69:101,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:74,33:[2,92],62:102,63:103,64:75,65:[1,43],69:104,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,105]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:106,72:[1,107],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,108],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,109]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:55,39:[1,57],43:56,44:[1,58],45:111,46:110,47:[2,76]},{33:[2,70],40:112,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,113]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:74,63:115,64:75,65:[1,43],67:114,68:[2,96],69:116,70:76,71:77,72:[1,78],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,117]},{32:118,33:[2,62],74:119,75:[1,120]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:121,74:122,75:[1,120]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,123]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,124]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,108]},{20:74,63:125,64:75,65:[1,43],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:74,33:[2,72],41:126,63:127,64:75,65:[1,43],69:128,70:76,71:77,72:[1,78],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,129]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,130]},{33:[2,63]},{72:[1,132],76:131},{33:[1,133]},{33:[2,69]},{15:[2,12],18:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:134,74:135,75:[1,120]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,137],77:[1,136]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,138]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],54:[2,55],56:[2,20],60:[2,57],73:[2,81],82:[2,85],86:[2,18],90:[2,89],101:[2,53],104:[2,93],110:[2,19],111:[2,77],116:[2,97],119:[2,63],122:[2,69],135:[2,75],136:[2,32]},parseError:function(m,f){throw new Error(m)},parse:function(m){function f(){var W;return W=o.lexer.lex()||1,typeof W!="number"&&(W=o.symbols_[W]||W),W}var o=this,u=[0],v=[null],s=[],g=this.table,d="",c=0,b=0,y=0;this.lexer.setInput(m),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,typeof this.lexer.yylloc=="undefined"&&(this.lexer.yylloc={});var T=this.lexer.yylloc;s.push(T);var _=this.lexer.options&&this.lexer.options.ranges;typeof this.yy.parseError=="function"&&(this.parseError=this.yy.parseError);for(var A,E,I,N,B,C,R,w,D,k={};;){if(I=u[u.length-1],this.defaultActions[I]?N=this.defaultActions[I]:(A!==null&&typeof A!="undefined"||(A=f()),N=g[I]&&g[I][A]),typeof N=="undefined"||!N.length||!N[0]){var G="";if(!y){D=[];for(C in g[I])this.terminals_[C]&&C>2&&D.push("'"+this.terminals_[C]+"'");G=this.lexer.showPosition?"Parse error on line "+(c+1)+`:
`+this.lexer.showPosition()+`
Expecting `+D.join(", ")+", got '"+(this.terminals_[A]||A)+"'":"Parse error on line "+(c+1)+": Unexpected "+(A==1?"end of input":"'"+(this.terminals_[A]||A)+"'"),this.parseError(G,{text:this.lexer.match,token:this.terminals_[A]||A,line:this.lexer.yylineno,loc:T,expected:D})}}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+I+", token: "+A);switch(N[0]){case 1:u.push(A),v.push(this.lexer.yytext),s.push(this.lexer.yylloc),u.push(N[1]),A=null,E?(A=E,E=null):(b=this.lexer.yyleng,d=this.lexer.yytext,c=this.lexer.yylineno,T=this.lexer.yylloc,y>0&&y--);break;case 2:if(R=this.productions_[N[1]][1],k.$=v[v.length-R],k._$={first_line:s[s.length-(R||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(R||1)].first_column,last_column:s[s.length-1].last_column},_&&(k._$.range=[s[s.length-(R||1)].range[0],s[s.length-1].range[1]]),B=this.performAction.call(k,d,b,c,this.yy,N[1],v,s),typeof B!="undefined")return B;R&&(u=u.slice(0,-1*R*2),v=v.slice(0,-1*R),s=s.slice(0,-1*R)),u.push(this.productions_[N[1]][0]),v.push(k.$),s.push(k._$),w=g[u[u.length-2]][u[u.length-1]],u.push(w);break;case 3:return!0}}return!0}},p=function(){var m={EOF:1,parseError:function(f,o){if(!this.yy.parser)throw new Error(f);this.yy.parser.parseError(f,o)},setInput:function(f){return this._input=f,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var f=this._input[0];this.yytext+=f,this.yyleng++,this.offset++,this.match+=f,this.matched+=f;var o=f.match(/(?:\r\n?|\n).*/g);return o?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),f},unput:function(f){var o=f.length,u=f.split(/(?:\r\n?|\n)/g);this._input=f+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-o-1),this.offset-=o;var v=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),u.length-1&&(this.yylineno-=u.length-1);var s=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:u?(u.length===v.length?this.yylloc.first_column:0)+v[v.length-u.length].length-u[0].length:this.yylloc.first_column-o},this.options.ranges&&(this.yylloc.range=[s[0],s[0]+this.yyleng-o]),this},more:function(){return this._more=!0,this},less:function(f){this.unput(this.match.slice(f))},pastInput:function(){var f=this.matched.substr(0,this.matched.length-this.match.length);return(f.length>20?"...":"")+f.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var f=this.match;return f.length<20&&(f+=this._input.substr(0,20-f.length)),(f.substr(0,20)+(f.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var f=this.pastInput(),o=new Array(f.length+1).join("-");return f+this.upcomingInput()+`
`+o+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var f,o,u,v,s;this._more||(this.yytext="",this.match="");for(var g=this._currentRules(),d=0;d<g.length&&(u=this._input.match(this.rules[g[d]]),!u||o&&!(u[0].length>o[0].length)||(o=u,v=d,this.options.flex));d++);return o?(s=o[0].match(/(?:\r\n?|\n).*/g),s&&(this.yylineno+=s.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:s?s[s.length-1].length-s[s.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],f=this.performAction.call(this,this.yy,this,g[v],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),f||void 0):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var f=this.next();return typeof f!="undefined"?f:this.lex()},begin:function(f){this.conditionStack.push(f)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(f){this.begin(f)}};return m.options={},m.performAction=function(f,o,u,v){function s(g,d){return o.yytext=o.yytext.substring(g,o.yyleng-d+g)}switch(u){case 0:if(o.yytext.slice(-2)==="\\\\"?(s(0,1),this.begin("mu")):o.yytext.slice(-1)==="\\"?(s(0,1),this.begin("emu")):this.begin("mu"),o.yytext)return 15;break;case 1:return 15;case 2:return this.popState(),15;case 3:return this.begin("raw"),15;case 4:return this.popState(),this.conditionStack[this.conditionStack.length-1]==="raw"?15:(s(5,9),"END_RAW_BLOCK");case 5:return 15;case 6:return this.popState(),14;case 7:return 65;case 8:return 68;case 9:return 19;case 10:return this.popState(),this.begin("raw"),23;case 11:return 55;case 12:return 60;case 13:return 29;case 14:return 47;case 15:return this.popState(),44;case 16:return this.popState(),44;case 17:return 34;case 18:return 39;case 19:return 51;case 20:return 48;case 21:this.unput(o.yytext),this.popState(),this.begin("com");break;case 22:return this.popState(),14;case 23:return 48;case 24:return 73;case 25:return 72;case 26:return 72;case 27:return 87;case 28:break;case 29:return this.popState(),54;case 30:return this.popState(),33;case 31:return o.yytext=s(1,2).replace(/\\"/g,'"'),80;case 32:return o.yytext=s(1,2).replace(/\\'/g,"'"),80;case 33:return 85;case 34:return 82;case 35:return 82;case 36:return 83;case 37:return 84;case 38:return 81;case 39:return 75;case 40:return 77;case 41:return 72;case 42:return o.yytext=o.yytext.replace(/\\([\\\]])/g,"$1"),72;case 43:return"INVALID";case 44:return 5}},m.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]+?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/],m.conditions={mu:{rules:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[6],inclusive:!1},raw:{rules:[3,4,5],inclusive:!1},INITIAL:{rules:[0,1,44],inclusive:!0}},m}();return n.lexer=p,r.prototype=n,n.Parser=r,new r}();i.default=l,h.exports=i.default},function(h,i,l){"use strict";function r(){var s=arguments.length<=0||arguments[0]===void 0?{}:arguments[0];this.options=s}function n(s,g,d){g===void 0&&(g=s.length);var c=s[g-1],b=s[g-2];return c?c.type==="ContentStatement"?(b||!d?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(c.original):void 0:d}function p(s,g,d){g===void 0&&(g=-1);var c=s[g+1],b=s[g+2];return c?c.type==="ContentStatement"?(b||!d?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(c.original):void 0:d}function m(s,g,d){var c=s[g==null?0:g+1];if(c&&c.type==="ContentStatement"&&(d||!c.rightStripped)){var b=c.value;c.value=c.value.replace(d?/^\s+/:/^[ \t]*\r?\n?/,""),c.rightStripped=c.value!==b}}function f(s,g,d){var c=s[g==null?s.length-1:g-1];if(c&&c.type==="ContentStatement"&&(d||!c.leftStripped)){var b=c.value;return c.value=c.value.replace(d?/\s+$/:/[ \t]+$/,""),c.leftStripped=c.value!==b,c.leftStripped}}var o=l(1).default;i.__esModule=!0;var u=l(88),v=o(u);r.prototype=new v.default,r.prototype.Program=function(s){var g=!this.options.ignoreStandalone,d=!this.isRootSeen;this.isRootSeen=!0;for(var c=s.body,b=0,y=c.length;b<y;b++){var T=c[b],_=this.accept(T);if(_){var A=n(c,b,d),E=p(c,b,d),I=_.openStandalone&&A,N=_.closeStandalone&&E,B=_.inlineStandalone&&A&&E;_.close&&m(c,b,!0),_.open&&f(c,b,!0),g&&B&&(m(c,b),f(c,b)&&T.type==="PartialStatement"&&(T.indent=/([ \t]+$)/.exec(c[b-1].original)[1])),g&&I&&(m((T.program||T.inverse).body),f(c,b)),g&&N&&(m(c,b),f((T.inverse||T.program).body))}}return s},r.prototype.BlockStatement=r.prototype.DecoratorBlock=r.prototype.PartialBlockStatement=function(s){this.accept(s.program),this.accept(s.inverse);var g=s.program||s.inverse,d=s.program&&s.inverse,c=d,b=d;if(d&&d.chained)for(c=d.body[0].program;b.chained;)b=b.body[b.body.length-1].program;var y={open:s.openStrip.open,close:s.closeStrip.close,openStandalone:p(g.body),closeStandalone:n((c||g).body)};if(s.openStrip.close&&m(g.body,null,!0),d){var T=s.inverseStrip;T.open&&f(g.body,null,!0),T.close&&m(c.body,null,!0),s.closeStrip.open&&f(b.body,null,!0),!this.options.ignoreStandalone&&n(g.body)&&p(c.body)&&(f(g.body),m(c.body))}else s.closeStrip.open&&f(g.body,null,!0);return y},r.prototype.Decorator=r.prototype.MustacheStatement=function(s){return s.strip},r.prototype.PartialStatement=r.prototype.CommentStatement=function(s){var g=s.strip||{};return{inlineStandalone:!0,open:g.open,close:g.close}},i.default=r,h.exports=i.default},function(h,i,l){"use strict";function r(){this.parents=[]}function n(v){this.acceptRequired(v,"path"),this.acceptArray(v.params),this.acceptKey(v,"hash")}function p(v){n.call(this,v),this.acceptKey(v,"program"),this.acceptKey(v,"inverse")}function m(v){this.acceptRequired(v,"name"),this.acceptArray(v.params),this.acceptKey(v,"hash")}var f=l(1).default;i.__esModule=!0;var o=l(6),u=f(o);r.prototype={constructor:r,mutating:!1,acceptKey:function(v,s){var g=this.accept(v[s]);if(this.mutating){if(g&&!r.prototype[g.type])throw new u.default('Unexpected node type "'+g.type+'" found when accepting '+s+" on "+v.type);v[s]=g}},acceptRequired:function(v,s){if(this.acceptKey(v,s),!v[s])throw new u.default(v.type+" requires "+s)},acceptArray:function(v){for(var s=0,g=v.length;s<g;s++)this.acceptKey(v,s),v[s]||(v.splice(s,1),s--,g--)},accept:function(v){if(v){if(!this[v.type])throw new u.default("Unknown type: "+v.type,v);this.current&&this.parents.unshift(this.current),this.current=v;var s=this[v.type](v);return this.current=this.parents.shift(),!this.mutating||s?s:s!==!1?v:void 0}},Program:function(v){this.acceptArray(v.body)},MustacheStatement:n,Decorator:n,BlockStatement:p,DecoratorBlock:p,PartialStatement:m,PartialBlockStatement:function(v){m.call(this,v),this.acceptKey(v,"program")},ContentStatement:function(){},CommentStatement:function(){},SubExpression:n,PathExpression:function(){},StringLiteral:function(){},NumberLiteral:function(){},BooleanLiteral:function(){},UndefinedLiteral:function(){},NullLiteral:function(){},Hash:function(v){this.acceptArray(v.pairs)},HashPair:function(v){this.acceptRequired(v,"value")}},i.default=r,h.exports=i.default},function(h,i,l){"use strict";function r(T,_){if(_=_.path?_.path.original:_,T.path.original!==_){var A={loc:T.path.loc};throw new y.default(T.path.original+" doesn't match "+_,A)}}function n(T,_){this.source=T,this.start={line:_.first_line,column:_.first_column},this.end={line:_.last_line,column:_.last_column}}function p(T){return/^\[.*\]$/.test(T)?T.substring(1,T.length-1):T}function m(T,_){return{open:T.charAt(2)==="~",close:_.charAt(_.length-3)==="~"}}function f(T){return T.replace(/^\{\{~?!-?-?/,"").replace(/-?-?~?\}\}$/,"")}function o(T,_,A){A=this.locInfo(A);for(var E=T?"@":"",I=[],N=0,B=0,C=_.length;B<C;B++){var R=_[B].part,w=_[B].original!==R;if(E+=(_[B].separator||"")+R,w||R!==".."&&R!=="."&&R!=="this")I.push(R);else{if(I.length>0)throw new y.default("Invalid path: "+E,{loc:A});R===".."&&N++}}return{type:"PathExpression",data:T,depth:N,parts:I,original:E,loc:A}}function u(T,_,A,E,I,N){var B=E.charAt(3)||E.charAt(2),C=B!=="{"&&B!=="&",R=/\*/.test(E);return{type:R?"Decorator":"MustacheStatement",path:T,params:_,hash:A,escaped:C,strip:I,loc:this.locInfo(N)}}function v(T,_,A,E){r(T,A),E=this.locInfo(E);var I={type:"Program",body:_,strip:{},loc:E};return{type:"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:I,openStrip:{},inverseStrip:{},closeStrip:{},loc:E}}function s(T,_,A,E,I,N){E&&E.path&&r(T,E);var B=/\*/.test(T.open);_.blockParams=T.blockParams;var C=void 0,R=void 0;if(A){if(B)throw new y.default("Unexpected inverse block on decorator",A);A.chain&&(A.program.body[0].closeStrip=E.strip),R=A.strip,C=A.program}return I&&(I=C,C=_,_=I),{type:B?"DecoratorBlock":"BlockStatement",path:T.path,params:T.params,hash:T.hash,program:_,inverse:C,openStrip:T.strip,inverseStrip:R,closeStrip:E&&E.strip,loc:this.locInfo(N)}}function g(T,_){if(!_&&T.length){var A=T[0].loc,E=T[T.length-1].loc;A&&E&&(_={source:A.source,start:{line:A.start.line,column:A.start.column},end:{line:E.end.line,column:E.end.column}})}return{type:"Program",body:T,strip:{},loc:_}}function d(T,_,A,E){return r(T,A),{type:"PartialBlockStatement",name:T.path,params:T.params,hash:T.hash,program:_,openStrip:T.strip,closeStrip:A&&A.strip,loc:this.locInfo(E)}}var c=l(1).default;i.__esModule=!0,i.SourceLocation=n,i.id=p,i.stripFlags=m,i.stripComment=f,i.preparePath=o,i.prepareMustache=u,i.prepareRawBlock=v,i.prepareBlock=s,i.prepareProgram=g,i.preparePartialBlock=d;var b=l(6),y=c(b)},function(h,i,l){"use strict";function r(){}function n(y,T,_){if(y==null||typeof y!="string"&&y.type!=="Program")throw new s.default("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+y);T=T||{},"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var A=_.parse(y,T),E=new _.Compiler().compile(A,T);return new _.JavaScriptCompiler().compile(E,T)}function p(y,T,_){function A(){var N=_.parse(y,T),B=new _.Compiler().compile(N,T),C=new _.JavaScriptCompiler().compile(B,T,void 0,!0);return _.template(C)}function E(N,B){return I||(I=A()),I.call(this,N,B)}if(T===void 0&&(T={}),y==null||typeof y!="string"&&y.type!=="Program")throw new s.default("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+y);T=g.extend({},T),"data"in T||(T.data=!0),T.compat&&(T.useDepths=!0);var I=void 0;return E._setup=function(N){return I||(I=A()),I._setup(N)},E._child=function(N,B,C,R){return I||(I=A()),I._child(N,B,C,R)},E}function m(y,T){if(y===T)return!0;if(g.isArray(y)&&g.isArray(T)&&y.length===T.length){for(var _=0;_<y.length;_++)if(!m(y[_],T[_]))return!1;return!0}}function f(y){if(!y.path.parts){var T=y.path;y.path={type:"PathExpression",data:!1,depth:0,parts:[T.original+""],original:T.original+"",loc:T.loc}}}var o=l(74).default,u=l(1).default;i.__esModule=!0,i.Compiler=r,i.precompile=n,i.compile=p;var v=l(6),s=u(v),g=l(5),d=l(84),c=u(d),b=[].slice;r.prototype={compiler:r,equals:function(y){var T=this.opcodes.length;if(y.opcodes.length!==T)return!1;for(var _=0;_<T;_++){var A=this.opcodes[_],E=y.opcodes[_];if(A.opcode!==E.opcode||!m(A.args,E.args))return!1}T=this.children.length;for(var _=0;_<T;_++)if(!this.children[_].equals(y.children[_]))return!1;return!0},guid:0,compile:function(y,T){return this.sourceNode=[],this.opcodes=[],this.children=[],this.options=T,this.stringParams=T.stringParams,this.trackIds=T.trackIds,T.blockParams=T.blockParams||[],T.knownHelpers=g.extend(o(null),{helperMissing:!0,blockHelperMissing:!0,each:!0,if:!0,unless:!0,with:!0,log:!0,lookup:!0},T.knownHelpers),this.accept(y)},compileProgram:function(y){var T=new this.compiler,_=T.compile(y,this.options),A=this.guid++;return this.usePartial=this.usePartial||_.usePartial,this.children[A]=_,this.useDepths=this.useDepths||_.useDepths,A},accept:function(y){if(!this[y.type])throw new s.default("Unknown type: "+y.type,y);this.sourceNode.unshift(y);var T=this[y.type](y);return this.sourceNode.shift(),T},Program:function(y){this.options.blockParams.unshift(y.blockParams);for(var T=y.body,_=T.length,A=0;A<_;A++)this.accept(T[A]);return this.options.blockParams.shift(),this.isSimple=_===1,this.blockParams=y.blockParams?y.blockParams.length:0,this},BlockStatement:function(y){f(y);var T=y.program,_=y.inverse;T=T&&this.compileProgram(T),_=_&&this.compileProgram(_);var A=this.classifySexpr(y);A==="helper"?this.helperSexpr(y,T,_):A==="simple"?(this.simpleSexpr(y),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("blockValue",y.path.original)):(this.ambiguousSexpr(y,T,_),this.opcode("pushProgram",T),this.opcode("pushProgram",_),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},DecoratorBlock:function(y){var T=y.program&&this.compileProgram(y.program),_=this.setupFullMustacheParams(y,T,void 0),A=y.path;this.useDecorators=!0,this.opcode("registerDecorator",_.length,A.original)},PartialStatement:function(y){this.usePartial=!0;var T=y.program;T&&(T=this.compileProgram(y.program));var _=y.params;if(_.length>1)throw new s.default("Unsupported number of partial arguments: "+_.length,y);_.length||(this.options.explicitPartialContext?this.opcode("pushLiteral","undefined"):_.push({type:"PathExpression",parts:[],depth:0}));var A=y.name.original,E=y.name.type==="SubExpression";E&&this.accept(y.name),this.setupFullMustacheParams(y,T,void 0,!0);var I=y.indent||"";this.options.preventIndent&&I&&(this.opcode("appendContent",I),I=""),this.opcode("invokePartial",E,A,I),this.opcode("append")},PartialBlockStatement:function(y){this.PartialStatement(y)},MustacheStatement:function(y){this.SubExpression(y),y.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},Decorator:function(y){this.DecoratorBlock(y)},ContentStatement:function(y){y.value&&this.opcode("appendContent",y.value)},CommentStatement:function(){},SubExpression:function(y){f(y);var T=this.classifySexpr(y);T==="simple"?this.simpleSexpr(y):T==="helper"?this.helperSexpr(y):this.ambiguousSexpr(y)},ambiguousSexpr:function(y,T,_){var A=y.path,E=A.parts[0],I=T!=null||_!=null;this.opcode("getContext",A.depth),this.opcode("pushProgram",T),this.opcode("pushProgram",_),A.strict=!0,this.accept(A),this.opcode("invokeAmbiguous",E,I)},simpleSexpr:function(y){var T=y.path;T.strict=!0,this.accept(T),this.opcode("resolvePossibleLambda")},helperSexpr:function(y,T,_){var A=this.setupFullMustacheParams(y,T,_),E=y.path,I=E.parts[0];if(this.options.knownHelpers[I])this.opcode("invokeKnownHelper",A.length,I);else{if(this.options.knownHelpersOnly)throw new s.default("You specified knownHelpersOnly, but used the unknown helper "+I,y);E.strict=!0,E.falsy=!0,this.accept(E),this.opcode("invokeHelper",A.length,E.original,c.default.helpers.simpleId(E))}},PathExpression:function(y){this.addDepth(y.depth),this.opcode("getContext",y.depth);var T=y.parts[0],_=c.default.helpers.scopedId(y),A=!y.depth&&!_&&this.blockParamIndex(T);A?this.opcode("lookupBlockParam",A,y.parts):T?y.data?(this.options.data=!0,this.opcode("lookupData",y.depth,y.parts,y.strict)):this.opcode("lookupOnContext",y.parts,y.falsy,y.strict,_):this.opcode("pushContext")},StringLiteral:function(y){this.opcode("pushString",y.value)},NumberLiteral:function(y){this.opcode("pushLiteral",y.value)},BooleanLiteral:function(y){this.opcode("pushLiteral",y.value)},UndefinedLiteral:function(){this.opcode("pushLiteral","undefined")},NullLiteral:function(){this.opcode("pushLiteral","null")},Hash:function(y){var T=y.pairs,_=0,A=T.length;for(this.opcode("pushHash");_<A;_++)this.pushParam(T[_].value);for(;_--;)this.opcode("assignToHash",T[_].key);this.opcode("popHash")},opcode:function(y){this.opcodes.push({opcode:y,args:b.call(arguments,1),loc:this.sourceNode[0].loc})},addDepth:function(y){y&&(this.useDepths=!0)},classifySexpr:function(y){var T=c.default.helpers.simpleId(y.path),_=T&&!!this.blockParamIndex(y.path.parts[0]),A=!_&&c.default.helpers.helperExpression(y),E=!_&&(A||T);if(E&&!A){var I=y.path.parts[0],N=this.options;N.knownHelpers[I]?A=!0:N.knownHelpersOnly&&(E=!1)}return A?"helper":E?"ambiguous":"simple"},pushParams:function(y){for(var T=0,_=y.length;T<_;T++)this.pushParam(y[T])},pushParam:function(y){var T=y.value!=null?y.value:y.original||"";if(this.stringParams)T.replace&&(T=T.replace(/^(\.?\.\/)*/g,"").replace(/\//g,".")),y.depth&&this.addDepth(y.depth),this.opcode("getContext",y.depth||0),this.opcode("pushStringParam",T,y.type),y.type==="SubExpression"&&this.accept(y);else{if(this.trackIds){var _=void 0;if(!y.parts||c.default.helpers.scopedId(y)||y.depth||(_=this.blockParamIndex(y.parts[0])),_){var A=y.parts.slice(1).join(".");this.opcode("pushId","BlockParam",_,A)}else T=y.original||T,T.replace&&(T=T.replace(/^this(?:\.|$)/,"").replace(/^\.\//,"").replace(/^\.$/,"")),this.opcode("pushId",y.type,T)}this.accept(y)}},setupFullMustacheParams:function(y,T,_,A){var E=y.params;return this.pushParams(E),this.opcode("pushProgram",T),this.opcode("pushProgram",_),y.hash?this.accept(y.hash):this.opcode("emptyHash",A),E},blockParamIndex:function(y){for(var T=0,_=this.options.blockParams.length;T<_;T++){var A=this.options.blockParams[T],E=A&&g.indexOf(A,y);if(A&&E>=0)return[T,E]}}}},function(h,i,l){"use strict";function r(c){this.value=c}function n(){}function p(c,b,y,T,_){var A=b.popStack(),E=y.length;for(c&&E--;T<E;T++)A=b.nameLookup(A,y[T],_);return c?[b.aliasable("container.strict"),"(",A,", ",b.quotedString(y[T]),", ",JSON.stringify(b.source.currentLocation)," )"]:A}var m=l(60).default,f=l(1).default;i.__esModule=!0;var o=l(4),u=l(6),v=f(u),s=l(5),g=l(92),d=f(g);n.prototype={nameLookup:function(c,b){return this.internalNameLookup(c,b)},depthedLookup:function(c){return[this.aliasable("container.lookup"),"(depths, ",JSON.stringify(c),")"]},compilerInfo:function(){var c=o.COMPILER_REVISION,b=o.REVISION_CHANGES[c];return[c,b]},appendToBuffer:function(c,b,y){return s.isArray(c)||(c=[c]),c=this.source.wrap(c,b),this.environment.isSimple?["return ",c,";"]:y?["buffer += ",c,";"]:(c.appendToBuffer=!0,c)},initializeBuffer:function(){return this.quotedString("")},internalNameLookup:function(c,b){return this.lookupPropertyFunctionIsUsed=!0,["lookupProperty(",c,",",JSON.stringify(b),")"]},lookupPropertyFunctionIsUsed:!1,compile:function(c,b,y,T){this.environment=c,this.options=b,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!T,this.name=this.environment.name,this.isChild=!!y,this.context=y||{decorators:[],programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.blockParams=[],this.compileChildren(c,b),this.useDepths=this.useDepths||c.useDepths||c.useDecorators||this.options.compat,this.useBlockParams=this.useBlockParams||c.useBlockParams;var _=c.opcodes,A=void 0,E=void 0,I=void 0,N=void 0;for(I=0,N=_.length;I<N;I++)A=_[I],this.source.currentLocation=A.loc,E=E||A.loc,this[A.opcode].apply(this,A.args);if(this.source.currentLocation=E,this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new v.default("Compile completed with content left on stack");this.decorators.isEmpty()?this.decorators=void 0:(this.useDecorators=!0,this.decorators.prepend(["var decorators = container.decorators, ",this.lookupPropertyFunctionVarDeclaration(),`;
`]),this.decorators.push("return fn;"),T?this.decorators=Function.apply(this,["fn","props","container","depth0","data","blockParams","depths",this.decorators.merge()]):(this.decorators.prepend(`function(fn, props, container, depth0, data, blockParams, depths) {
`),this.decorators.push(`}
`),this.decorators=this.decorators.merge()));var B=this.createFunctionContext(T);if(this.isChild)return B;var C={compiler:this.compilerInfo(),main:B};this.decorators&&(C.main_d=this.decorators,C.useDecorators=!0);var R=this.context,w=R.programs,D=R.decorators;for(I=0,N=w.length;I<N;I++)w[I]&&(C[I]=w[I],D[I]&&(C[I+"_d"]=D[I],C.useDecorators=!0));return this.environment.usePartial&&(C.usePartial=!0),this.options.data&&(C.useData=!0),this.useDepths&&(C.useDepths=!0),this.useBlockParams&&(C.useBlockParams=!0),this.options.compat&&(C.compat=!0),T?C.compilerOptions=this.options:(C.compiler=JSON.stringify(C.compiler),this.source.currentLocation={start:{line:1,column:0}},C=this.objectLiteral(C),b.srcName?(C=C.toStringWithSourceMap({file:b.destName}),C.map=C.map&&C.map.toString()):C=C.toString()),C},preamble:function(){this.lastContext=0,this.source=new d.default(this.options.srcName),this.decorators=new d.default(this.options.srcName)},createFunctionContext:function(c){var b=this,y="",T=this.stackVars.concat(this.registers.list);T.length>0&&(y+=", "+T.join(", "));var _=0;m(this.aliases).forEach(function(I){var N=b.aliases[I];N.children&&N.referenceCount>1&&(y+=", alias"+ ++_+"="+I,N.children[0]="alias"+_)}),this.lookupPropertyFunctionIsUsed&&(y+=", "+this.lookupPropertyFunctionVarDeclaration());var A=["container","depth0","helpers","partials","data"];(this.useBlockParams||this.useDepths)&&A.push("blockParams"),this.useDepths&&A.push("depths");var E=this.mergeSource(y);return c?(A.push(E),Function.apply(this,A)):this.source.wrap(["function(",A.join(","),`) {
  `,E,"}"])},mergeSource:function(c){var b=this.environment.isSimple,y=!this.forceBuffer,T=void 0,_=void 0,A=void 0,E=void 0;return this.source.each(function(I){I.appendToBuffer?(A?I.prepend("  + "):A=I,E=I):(A&&(_?A.prepend("buffer += "):T=!0,E.add(";"),A=E=void 0),_=!0,b||(y=!1))}),y?A?(A.prepend("return "),E.add(";")):_||this.source.push('return "";'):(c+=", buffer = "+(T?"":this.initializeBuffer()),A?(A.prepend("return buffer + "),E.add(";")):this.source.push("return buffer;")),c&&this.source.prepend("var "+c.substring(2)+(T?"":`;
`)),this.source.merge()},lookupPropertyFunctionVarDeclaration:function(){return`
      lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    }
    `.trim()},blockValue:function(c){var b=this.aliasable("container.hooks.blockHelperMissing"),y=[this.contextName(0)];this.setupHelperArgs(c,0,y);var T=this.popStack();y.splice(1,0,T),this.push(this.source.functionCall(b,"call",y))},ambiguousBlockValue:function(){var c=this.aliasable("container.hooks.blockHelperMissing"),b=[this.contextName(0)];this.setupHelperArgs("",0,b,!0),this.flushInline();var y=this.topStack();b.splice(1,0,y),this.pushSource(["if (!",this.lastHelper,") { ",y," = ",this.source.functionCall(c,"call",b),"}"])},appendContent:function(c){this.pendingContent?c=this.pendingContent+c:this.pendingLocation=this.source.currentLocation,this.pendingContent=c},append:function(){if(this.isInline())this.replaceStack(function(b){return[" != null ? ",b,' : ""']}),this.pushSource(this.appendToBuffer(this.popStack()));else{var c=this.popStack();this.pushSource(["if (",c," != null) { ",this.appendToBuffer(c,void 0,!0)," }"]),this.environment.isSimple&&this.pushSource(["else { ",this.appendToBuffer("''",void 0,!0)," }"])}},appendEscaped:function(){this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"),"(",this.popStack(),")"]))},getContext:function(c){this.lastContext=c},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(c,b,y,T){var _=0;T||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(c[_++])),this.resolvePath("context",c,_,b,y)},lookupBlockParam:function(c,b){this.useBlockParams=!0,this.push(["blockParams[",c[0],"][",c[1],"]"]),this.resolvePath("context",b,1)},lookupData:function(c,b,y){c?this.pushStackLiteral("container.data(data, "+c+")"):this.pushStackLiteral("data"),this.resolvePath("data",b,0,!0,y)},resolvePath:function(c,b,y,T,_){var A=this;if(this.options.strict||this.options.assumeObjects)return void this.push(p(this.options.strict&&_,this,b,y,c));for(var E=b.length;y<E;y++)this.replaceStack(function(I){var N=A.nameLookup(I,b[y],c);return T?[" && ",N]:[" != null ? ",N," : ",I]})},resolvePossibleLambda:function(){this.push([this.aliasable("container.lambda"),"(",this.popStack(),", ",this.contextName(0),")"])},pushStringParam:function(c,b){this.pushContext(),this.pushString(b),b!=="SubExpression"&&(typeof c=="string"?this.pushString(c):this.pushStackLiteral(c))},emptyHash:function(c){this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}")),this.pushStackLiteral(c?"undefined":"{}")},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:{},types:[],contexts:[],ids:[]}},popHash:function(){var c=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push(this.objectLiteral(c.ids)),this.stringParams&&(this.push(this.objectLiteral(c.contexts)),this.push(this.objectLiteral(c.types))),this.push(this.objectLiteral(c.values))},pushString:function(c){this.pushStackLiteral(this.quotedString(c))},pushLiteral:function(c){this.pushStackLiteral(c)},pushProgram:function(c){c!=null?this.pushStackLiteral(this.programExpression(c)):this.pushStackLiteral(null)},registerDecorator:function(c,b){var y=this.nameLookup("decorators",b,"decorator"),T=this.setupHelperArgs(b,c);this.decorators.push(["fn = ",this.decorators.functionCall(y,"",["fn","props","container",T])," || fn;"])},invokeHelper:function(c,b,y){var T=this.popStack(),_=this.setupHelper(c,b),A=[];y&&A.push(_.name),A.push(T),this.options.strict||A.push(this.aliasable("container.hooks.helperMissing"));var E=["(",this.itemsSeparatedBy(A,"||"),")"],I=this.source.functionCall(E,"call",_.callParams);this.push(I)},itemsSeparatedBy:function(c,b){var y=[];y.push(c[0]);for(var T=1;T<c.length;T++)y.push(b,c[T]);return y},invokeKnownHelper:function(c,b){var y=this.setupHelper(c,b);this.push(this.source.functionCall(y.name,"call",y.callParams))},invokeAmbiguous:function(c,b){this.useRegister("helper");var y=this.popStack();this.emptyHash();var T=this.setupHelper(0,c,b),_=this.lastHelper=this.nameLookup("helpers",c,"helper"),A=["(","(helper = ",_," || ",y,")"];this.options.strict||(A[0]="(helper = ",A.push(" != null ? helper : ",this.aliasable("container.hooks.helperMissing"))),this.push(["(",A,T.paramsInit?["),(",T.paramsInit]:[],"),","(typeof helper === ",this.aliasable('"function"')," ? ",this.source.functionCall("helper","call",T.callParams)," : helper))"])},invokePartial:function(c,b,y){var T=[],_=this.setupParams(b,1,T);c&&(b=this.popStack(),delete _.name),y&&(_.indent=JSON.stringify(y)),_.helpers="helpers",_.partials="partials",_.decorators="container.decorators",c?T.unshift(b):T.unshift(this.nameLookup("partials",b,"partial")),this.options.compat&&(_.depths="depths"),_=this.objectLiteral(_),T.push(_),this.push(this.source.functionCall("container.invokePartial","",T))},assignToHash:function(c){var b=this.popStack(),y=void 0,T=void 0,_=void 0;this.trackIds&&(_=this.popStack()),this.stringParams&&(T=this.popStack(),y=this.popStack());var A=this.hash;y&&(A.contexts[c]=y),T&&(A.types[c]=T),_&&(A.ids[c]=_),A.values[c]=b},pushId:function(c,b,y){c==="BlockParam"?this.pushStackLiteral("blockParams["+b[0]+"].path["+b[1]+"]"+(y?" + "+JSON.stringify("."+y):"")):c==="PathExpression"?this.pushString(b):c==="SubExpression"?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:n,compileChildren:function(c,b){for(var y=c.children,T=void 0,_=void 0,A=0,E=y.length;A<E;A++){T=y[A],_=new this.compiler;var I=this.matchExistingProgram(T);if(I==null){this.context.programs.push("");var N=this.context.programs.length;T.index=N,T.name="program"+N,this.context.programs[N]=_.compile(T,b,this.context,!this.precompile),this.context.decorators[N]=_.decorators,this.context.environments[N]=T,this.useDepths=this.useDepths||_.useDepths,this.useBlockParams=this.useBlockParams||_.useBlockParams,T.useDepths=this.useDepths,T.useBlockParams=this.useBlockParams}else T.index=I.index,T.name="program"+I.index,this.useDepths=this.useDepths||I.useDepths,this.useBlockParams=this.useBlockParams||I.useBlockParams}},matchExistingProgram:function(c){for(var b=0,y=this.context.environments.length;b<y;b++){var T=this.context.environments[b];if(T&&T.equals(c))return T}},programExpression:function(c){var b=this.environment.children[c],y=[b.index,"data",b.blockParams];return(this.useBlockParams||this.useDepths)&&y.push("blockParams"),this.useDepths&&y.push("depths"),"container.program("+y.join(", ")+")"},useRegister:function(c){this.registers[c]||(this.registers[c]=!0,this.registers.list.push(c))},push:function(c){return c instanceof r||(c=this.source.wrap(c)),this.inlineStack.push(c),c},pushStackLiteral:function(c){this.push(new r(c))},pushSource:function(c){this.pendingContent&&(this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation)),this.pendingContent=void 0),c&&this.source.push(c)},replaceStack:function(c){var b=["("],y=void 0,T=void 0,_=void 0;if(!this.isInline())throw new v.default("replaceStack on non-inline");var A=this.popStack(!0);if(A instanceof r)y=[A.value],b=["(",y],_=!0;else{T=!0;var E=this.incrStack();b=["((",this.push(E)," = ",A,")"],y=this.topStack()}var I=c.call(this,y);_||this.popStack(),T&&this.stackSlot--,this.push(b.concat(I,")"))},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var c=this.inlineStack;this.inlineStack=[];for(var b=0,y=c.length;b<y;b++){var T=c[b];if(T instanceof r)this.compileStack.push(T);else{var _=this.incrStack();this.pushSource([_," = ",T,";"]),this.compileStack.push(_)}}},isInline:function(){return this.inlineStack.length},popStack:function(c){var b=this.isInline(),y=(b?this.inlineStack:this.compileStack).pop();if(!c&&y instanceof r)return y.value;if(!b){if(!this.stackSlot)throw new v.default("Invalid stack pop");this.stackSlot--}return y},topStack:function(){var c=this.isInline()?this.inlineStack:this.compileStack,b=c[c.length-1];return b instanceof r?b.value:b},contextName:function(c){return this.useDepths&&c?"depths["+c+"]":"depth"+c},quotedString:function(c){return this.source.quotedString(c)},objectLiteral:function(c){return this.source.objectLiteral(c)},aliasable:function(c){var b=this.aliases[c];return b?(b.referenceCount++,b):(b=this.aliases[c]=this.source.wrap(c),b.aliasable=!0,b.referenceCount=1,b)},setupHelper:function(c,b,y){var T=[],_=this.setupHelperArgs(b,c,T,y),A=this.nameLookup("helpers",b,"helper"),E=this.aliasable(this.contextName(0)+" != null ? "+this.contextName(0)+" : (container.nullContext || {})");return{params:T,paramsInit:_,name:A,callParams:[E].concat(T)}},setupParams:function(c,b,y){var T={},_=[],A=[],E=[],I=!y,N=void 0;I&&(y=[]),T.name=this.quotedString(c),T.hash=this.popStack(),this.trackIds&&(T.hashIds=this.popStack()),this.stringParams&&(T.hashTypes=this.popStack(),T.hashContexts=this.popStack());var B=this.popStack(),C=this.popStack();(C||B)&&(T.fn=C||"container.noop",T.inverse=B||"container.noop");for(var R=b;R--;)N=this.popStack(),y[R]=N,this.trackIds&&(E[R]=this.popStack()),this.stringParams&&(A[R]=this.popStack(),_[R]=this.popStack());return I&&(T.args=this.source.generateArray(y)),this.trackIds&&(T.ids=this.source.generateArray(E)),this.stringParams&&(T.types=this.source.generateArray(A),T.contexts=this.source.generateArray(_)),this.options.data&&(T.data="data"),this.useBlockParams&&(T.blockParams="blockParams"),T},setupHelperArgs:function(c,b,y,T){var _=this.setupParams(c,b,y);return _.loc=JSON.stringify(this.source.currentLocation),_=this.objectLiteral(_),T?(this.useRegister("options"),y.push("options"),["options=",_]):y?(y.push(_),""):_}},function(){for(var c="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" "),b=n.RESERVED_WORDS={},y=0,T=c.length;y<T;y++)b[c[y]]=!0}(),n.isValidJavaScriptVariableName=function(c){return!n.RESERVED_WORDS[c]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(c)},i.default=n,h.exports=i.default},function(h,i,l){"use strict";function r(o,u,v){if(m.isArray(o)){for(var s=[],g=0,d=o.length;g<d;g++)s.push(u.wrap(o[g],v));return s}return typeof o=="boolean"||typeof o=="number"?o+"":o}function n(o){this.srcFile=o,this.source=[]}var p=l(60).default;i.__esModule=!0;var m=l(5),f=void 0;try{}catch(o){}f||(f=function(o,u,v,s){this.src="",s&&this.add(s)},f.prototype={add:function(o){m.isArray(o)&&(o=o.join("")),this.src+=o},prepend:function(o){m.isArray(o)&&(o=o.join("")),this.src=o+this.src},toStringWithSourceMap:function(){return{code:this.toString()}},toString:function(){return this.src}}),n.prototype={isEmpty:function(){return!this.source.length},prepend:function(o,u){this.source.unshift(this.wrap(o,u))},push:function(o,u){this.source.push(this.wrap(o,u))},merge:function(){var o=this.empty();return this.each(function(u){o.add(["  ",u,`
`])}),o},each:function(o){for(var u=0,v=this.source.length;u<v;u++)o(this.source[u])},empty:function(){var o=this.currentLocation||{start:{}};return new f(o.start.line,o.start.column,this.srcFile)},wrap:function(o){var u=arguments.length<=1||arguments[1]===void 0?this.currentLocation||{start:{}}:arguments[1];return o instanceof f?o:(o=r(o,this,u),new f(u.start.line,u.start.column,this.srcFile,o))},functionCall:function(o,u,v){return v=this.generateList(v),this.wrap([o,u?"."+u+"(":"(",v,")"])},quotedString:function(o){return'"'+(o+"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(o){var u=this,v=[];p(o).forEach(function(g){var d=r(o[g],u);d!=="undefined"&&v.push([u.quotedString(g),":",d])});var s=this.generateList(v);return s.prepend("{"),s.add("}"),s},generateList:function(o){for(var u=this.empty(),v=0,s=o.length;v<s;v++)v&&u.add(","),u.add(r(o[v],this));return u},generateArray:function(o){var u=this.generateList(o);return u.prepend("["),u.add("]"),u}},i.default=n,h.exports=i.default}])})},9978:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(1382),i(9091),i(5780),i(1628),i(1205),i(9340),i(1074),i(3985),i(6599),i(3040)],r=function(n,p,m,f,o,u,v){"use strict";var s=/%20/g,g=/#.*$/,d=/([?&])_=[^&]*/,c=/^(.*?):[ \t]*([^\r\n]*)$/mg,b=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,y=/^(?:GET|HEAD)$/,T=/^\/\//,_={},A={},E="*/".concat("*"),I=p.createElement("a");I.href=o.href;function N(D){return function(k,G){typeof k!="string"&&(G=k,k="*");var W,L=0,F=k.toLowerCase().match(f)||[];if(m(G))for(;W=F[L++];)W[0]==="+"?(W=W.slice(1)||"*",(D[W]=D[W]||[]).unshift(G)):(D[W]=D[W]||[]).push(G)}}function B(D,k,G,W){var L={},F=D===A;function H(K){var U;return L[K]=!0,n.each(D[K]||[],function(Z,ie){var ue=ie(k,G,W);if(typeof ue=="string"&&!F&&!L[ue])return k.dataTypes.unshift(ue),H(ue),!1;if(F)return!(U=ue)}),U}return H(k.dataTypes[0])||!L["*"]&&H("*")}function C(D,k){var G,W,L=n.ajaxSettings.flatOptions||{};for(G in k)k[G]!==void 0&&((L[G]?D:W||(W={}))[G]=k[G]);return W&&n.extend(!0,D,W),D}function R(D,k,G){for(var W,L,F,H,K=D.contents,U=D.dataTypes;U[0]==="*";)U.shift(),W===void 0&&(W=D.mimeType||k.getResponseHeader("Content-Type"));if(W){for(L in K)if(K[L]&&K[L].test(W)){U.unshift(L);break}}if(U[0]in G)F=U[0];else{for(L in G){if(!U[0]||D.converters[L+" "+U[0]]){F=L;break}H||(H=L)}F=F||H}if(F)return F!==U[0]&&U.unshift(F),G[F]}function w(D,k,G,W){var L,F,H,K,U,Z={},ie=D.dataTypes.slice();if(ie[1])for(H in D.converters)Z[H.toLowerCase()]=D.converters[H];for(F=ie.shift();F;)if(D.responseFields[F]&&(G[D.responseFields[F]]=k),!U&&W&&D.dataFilter&&(k=D.dataFilter(k,D.dataType)),U=F,F=ie.shift(),F){if(F==="*")F=U;else if(U!=="*"&&U!==F){if(H=Z[U+" "+F]||Z["* "+F],!H){for(L in Z)if(K=L.split(" "),K[1]===F&&(H=Z[U+" "+K[0]]||Z["* "+K[0]],H)){H===!0?H=Z[L]:Z[L]!==!0&&(F=K[0],ie.unshift(K[1]));break}}if(H!==!0)if(H&&D.throws)k=H(k);else try{k=H(k)}catch(ue){return{state:"parsererror",error:H?ue:"No conversion from "+U+" to "+F}}}}return{state:"success",data:k}}return n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:o.href,type:"GET",isLocal:b.test(o.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":E,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(D,k){return k?C(C(D,n.ajaxSettings),k):C(n.ajaxSettings,D)},ajaxPrefilter:N(_),ajaxTransport:N(A),ajax:function(D,k){typeof D=="object"&&(k=D,D=void 0),k=k||{};var G,W,L,F,H,K,U,Z,ie,ue,J=n.ajaxSetup({},k),be=J.context||J,Ae=J.context&&(be.nodeType||be.jquery)?n(be):n.event,Se=n.Deferred(),Xe=n.Callbacks("once memory"),dt=J.statusCode||{},bt={},At={},Rt="canceled",fe={readyState:0,getResponseHeader:function(Te){var Oe;if(U){if(!F)for(F={};Oe=c.exec(L);)F[Oe[1].toLowerCase()+" "]=(F[Oe[1].toLowerCase()+" "]||[]).concat(Oe[2]);Oe=F[Te.toLowerCase()+" "]}return Oe==null?null:Oe.join(", ")},getAllResponseHeaders:function(){return U?L:null},setRequestHeader:function(Te,Oe){return U==null&&(Te=At[Te.toLowerCase()]=At[Te.toLowerCase()]||Te,bt[Te]=Oe),this},overrideMimeType:function(Te){return U==null&&(J.mimeType=Te),this},statusCode:function(Te){var Oe;if(Te)if(U)fe.always(Te[fe.status]);else for(Oe in Te)dt[Oe]=[dt[Oe],Te[Oe]];return this},abort:function(Te){var Oe=Te||Rt;return G&&G.abort(Oe),xe(0,Oe),this}};if(Se.promise(fe),J.url=((D||J.url||o.href)+"").replace(T,o.protocol+"//"),J.type=k.method||k.type||J.method||J.type,J.dataTypes=(J.dataType||"*").toLowerCase().match(f)||[""],J.crossDomain==null){K=p.createElement("a");try{K.href=J.url,K.href=K.href,J.crossDomain=I.protocol+"//"+I.host!=K.protocol+"//"+K.host}catch(Te){J.crossDomain=!0}}if(J.data&&J.processData&&typeof J.data!="string"&&(J.data=n.param(J.data,J.traditional)),B(_,J,k,fe),U)return fe;Z=n.event&&J.global,Z&&n.active++===0&&n.event.trigger("ajaxStart"),J.type=J.type.toUpperCase(),J.hasContent=!y.test(J.type),W=J.url.replace(g,""),J.hasContent?J.data&&J.processData&&(J.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&(J.data=J.data.replace(s,"+")):(ue=J.url.slice(W.length),J.data&&(J.processData||typeof J.data=="string")&&(W+=(v.test(W)?"&":"?")+J.data,delete J.data),J.cache===!1&&(W=W.replace(d,"$1"),ue=(v.test(W)?"&":"?")+"_="+u.guid+++ue),J.url=W+ue),J.ifModified&&(n.lastModified[W]&&fe.setRequestHeader("If-Modified-Since",n.lastModified[W]),n.etag[W]&&fe.setRequestHeader("If-None-Match",n.etag[W])),(J.data&&J.hasContent&&J.contentType!==!1||k.contentType)&&fe.setRequestHeader("Content-Type",J.contentType),fe.setRequestHeader("Accept",J.dataTypes[0]&&J.accepts[J.dataTypes[0]]?J.accepts[J.dataTypes[0]]+(J.dataTypes[0]!=="*"?", "+E+"; q=0.01":""):J.accepts["*"]);for(ie in J.headers)fe.setRequestHeader(ie,J.headers[ie]);if(J.beforeSend&&(J.beforeSend.call(be,fe,J)===!1||U))return fe.abort();if(Rt="abort",Xe.add(J.complete),fe.done(J.success),fe.fail(J.error),G=B(A,J,k,fe),!G)xe(-1,"No Transport");else{if(fe.readyState=1,Z&&Ae.trigger("ajaxSend",[fe,J]),U)return fe;J.async&&J.timeout>0&&(H=window.setTimeout(function(){fe.abort("timeout")},J.timeout));try{U=!1,G.send(bt,xe)}catch(Te){if(U)throw Te;xe(-1,Te)}}function xe(Te,Oe,mt,Ut){var tt,Me,de,Ce,we,X=Oe;U||(U=!0,H&&window.clearTimeout(H),G=void 0,L=Ut||"",fe.readyState=Te>0?4:0,tt=Te>=200&&Te<300||Te===304,mt&&(Ce=R(J,fe,mt)),!tt&&n.inArray("script",J.dataTypes)>-1&&n.inArray("json",J.dataTypes)<0&&(J.converters["text script"]=function(){}),Ce=w(J,Ce,fe,tt),tt?(J.ifModified&&(we=fe.getResponseHeader("Last-Modified"),we&&(n.lastModified[W]=we),we=fe.getResponseHeader("etag"),we&&(n.etag[W]=we)),Te===204||J.type==="HEAD"?X="nocontent":Te===304?X="notmodified":(X=Ce.state,Me=Ce.data,de=Ce.error,tt=!de)):(de=X,(Te||!X)&&(X="error",Te<0&&(Te=0))),fe.status=Te,fe.statusText=(Oe||X)+"",tt?Se.resolveWith(be,[Me,X,fe]):Se.rejectWith(be,[fe,X,de]),fe.statusCode(dt),dt=void 0,Z&&Ae.trigger(tt?"ajaxSuccess":"ajaxError",[fe,J,tt?Me:de]),Xe.fireWith(be,[fe,X]),Z&&(Ae.trigger("ajaxComplete",[fe,J]),--n.active||n.event.trigger("ajaxStop")))}return fe},getJSON:function(D,k,G){return n.get(D,k,G,"json")},getScript:function(D,k){return n.get(D,void 0,k,"script")}}),n.each(["get","post"],function(D,k){n[k]=function(G,W,L,F){return m(W)&&(F=F||L,L=W,W=void 0),n.ajax(n.extend({url:G,type:k,dataType:F,data:W,success:L},n.isPlainObject(G)&&G))}}),n.ajaxPrefilter(function(D){var k;for(k in D.headers)k.toLowerCase()==="content-type"&&(D.contentType=D.headers[k]||"")}),n}.apply(h,l),r!==void 0&&(P.exports=r)},4139:(P,h,i)=>{var l,r;l=[i(8411),i(1382),i(1628),i(1205),i(9978)],r=function(n,p,m,f){"use strict";var o=[],u=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var v=o.pop()||n.expando+"_"+m.guid++;return this[v]=!0,v}}),n.ajaxPrefilter("json jsonp",function(v,s,g){var d,c,b,y=v.jsonp!==!1&&(u.test(v.url)?"url":typeof v.data=="string"&&(v.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&u.test(v.data)&&"data");if(y||v.dataTypes[0]==="jsonp")return d=v.jsonpCallback=p(v.jsonpCallback)?v.jsonpCallback():v.jsonpCallback,y?v[y]=v[y].replace(u,"$1"+d):v.jsonp!==!1&&(v.url+=(f.test(v.url)?"&":"?")+v.jsonp+"="+d),v.converters["script json"]=function(){return b||n.error(d+" was not called"),b[0]},v.dataTypes[0]="json",c=window[d],window[d]=function(){b=arguments},g.always(function(){c===void 0?n(window).removeProp(d):window[d]=c,v[d]&&(v.jsonpCallback=s.jsonpCallback,o.push(d)),b&&p(c)&&c(b[0]),b=c=void 0}),"script"})}.apply(h,l),r!==void 0&&(P.exports=r)},9165:(P,h,i)=>{var l,r;l=[i(8411),i(9266),i(1382),i(3814),i(9978),i(2569),i(7957),i(4553)],r=function(n,p,m){"use strict";n.fn.load=function(f,o,u){var v,s,g,d=this,c=f.indexOf(" ");return c>-1&&(v=p(f.slice(c)),f=f.slice(0,c)),m(o)?(u=o,o=void 0):o&&typeof o=="object"&&(s="POST"),d.length>0&&n.ajax({url:f,type:s||"GET",dataType:"html",data:o}).done(function(b){g=arguments,d.html(v?n("<div>").append(n.parseHTML(b)).find(v):b)}).always(u&&function(b,y){d.each(function(){u.apply(this,g||[b.responseText,y,b])})}),this}}.apply(h,l),r!==void 0&&(P.exports=r)},8498:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(9978)],r=function(n,p){"use strict";n.ajaxPrefilter(function(m){m.crossDomain&&(m.contents.script=!1)}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(m){return n.globalEval(m),m}}}),n.ajaxPrefilter("script",function(m){m.cache===void 0&&(m.cache=!1),m.crossDomain&&(m.type="GET")}),n.ajaxTransport("script",function(m){if(m.crossDomain||m.scriptAttrs){var f,o;return{send:function(u,v){f=n("<script>").attr(m.scriptAttrs||{}).prop({charset:m.scriptCharset,src:m.url}).on("load error",o=function(s){f.remove(),o=null,s&&v(s.type==="error"?404:200,s.type)}),p.head.appendChild(f[0])},abort:function(){o&&o()}}}})}.apply(h,l),r!==void 0&&(P.exports=r)},5780:(P,h,i)=>{var l;l=function(){"use strict";return window.location}.call(h,i,h,P),l!==void 0&&(P.exports=l)},1628:(P,h,i)=>{var l;l=function(){"use strict";return{guid:Date.now()}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},1205:(P,h,i)=>{var l;l=function(){"use strict";return/\?/}.call(h,i,h,P),l!==void 0&&(P.exports=l)},4895:(P,h,i)=>{var l,r;l=[i(8411),i(107),i(9978)],r=function(n,p){"use strict";n.ajaxSettings.xhr=function(){try{return new window.XMLHttpRequest}catch(o){}};var m={0:200,1223:204},f=n.ajaxSettings.xhr();p.cors=!!f&&"withCredentials"in f,p.ajax=f=!!f,n.ajaxTransport(function(o){var u,v;if(p.cors||f&&!o.crossDomain)return{send:function(s,g){var d,c=o.xhr();if(c.open(o.type,o.url,o.async,o.username,o.password),o.xhrFields)for(d in o.xhrFields)c[d]=o.xhrFields[d];o.mimeType&&c.overrideMimeType&&c.overrideMimeType(o.mimeType),!o.crossDomain&&!s["X-Requested-With"]&&(s["X-Requested-With"]="XMLHttpRequest");for(d in s)c.setRequestHeader(d,s[d]);u=function(b){return function(){u&&(u=v=c.onload=c.onerror=c.onabort=c.ontimeout=c.onreadystatechange=null,b==="abort"?c.abort():b==="error"?typeof c.status!="number"?g(0,"error"):g(c.status,c.statusText):g(m[c.status]||c.status,c.statusText,(c.responseType||"text")!=="text"||typeof c.responseText!="string"?{binary:c.response}:{text:c.responseText},c.getAllResponseHeaders()))}},c.onload=u(),v=c.onerror=c.ontimeout=u("error"),c.onabort!==void 0?c.onabort=v:c.onreadystatechange=function(){c.readyState===4&&window.setTimeout(function(){u&&v()})},u=u("abort");try{c.send(o.hasContent&&o.data||null)}catch(b){if(u)throw b}},abort:function(){u&&u()}}})}.apply(h,l),r!==void 0&&(P.exports=r)},5549:(P,h,i)=>{var l,r;l=[i(8411),i(6439),i(5933),i(9142),i(7065)],r=function(n){"use strict";return n}.apply(h,l),r!==void 0&&(P.exports=r)},6439:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(9773),i(5581),i(9091),i(4553)],r=function(n,p,m,f,o){"use strict";var u,v=n.expr.attrHandle;n.fn.extend({attr:function(s,g){return p(this,n.attr,s,g,arguments.length>1)},removeAttr:function(s){return this.each(function(){n.removeAttr(this,s)})}}),n.extend({attr:function(s,g,d){var c,b,y=s.nodeType;if(!(y===3||y===8||y===2)){if(typeof s.getAttribute=="undefined")return n.prop(s,g,d);if((y!==1||!n.isXMLDoc(s))&&(b=n.attrHooks[g.toLowerCase()]||(n.expr.match.bool.test(g)?u:void 0)),d!==void 0){if(d===null){n.removeAttr(s,g);return}return b&&"set"in b&&(c=b.set(s,d,g))!==void 0?c:(s.setAttribute(g,d+""),d)}return b&&"get"in b&&(c=b.get(s,g))!==null?c:(c=n.find.attr(s,g),c==null?void 0:c)}},attrHooks:{type:{set:function(s,g){if(!f.radioValue&&g==="radio"&&m(s,"input")){var d=s.value;return s.setAttribute("type",g),d&&(s.value=d),g}}}},removeAttr:function(s,g){var d,c=0,b=g&&g.match(o);if(b&&s.nodeType===1)for(;d=b[c++];)s.removeAttribute(d)}}),u={set:function(s,g,d){return g===!1?n.removeAttr(s,d):s.setAttribute(d,d),d}},n.each(n.expr.match.bool.source.match(/\w+/g),function(s,g){var d=v[g]||n.find.attr;v[g]=function(c,b,y){var T,_,A=b.toLowerCase();return y||(_=v[A],v[A]=T,T=d(c,b,y)!=null?A:null,v[A]=_),T}})}.apply(h,l),r!==void 0&&(P.exports=r)},9142:(P,h,i)=>{var l,r;l=[i(8411),i(9266),i(1382),i(9091),i(9192),i(9340)],r=function(n,p,m,f,o){"use strict";function u(s){return s.getAttribute&&s.getAttribute("class")||""}function v(s){return Array.isArray(s)?s:typeof s=="string"?s.match(f)||[]:[]}n.fn.extend({addClass:function(s){var g,d,c,b,y,T;return m(s)?this.each(function(_){n(this).addClass(s.call(this,_,u(this)))}):(g=v(s),g.length?this.each(function(){if(c=u(this),d=this.nodeType===1&&" "+p(c)+" ",d){for(y=0;y<g.length;y++)b=g[y],d.indexOf(" "+b+" ")<0&&(d+=b+" ");T=p(d),c!==T&&this.setAttribute("class",T)}}):this)},removeClass:function(s){var g,d,c,b,y,T;return m(s)?this.each(function(_){n(this).removeClass(s.call(this,_,u(this)))}):arguments.length?(g=v(s),g.length?this.each(function(){if(c=u(this),d=this.nodeType===1&&" "+p(c)+" ",d){for(y=0;y<g.length;y++)for(b=g[y];d.indexOf(" "+b+" ")>-1;)d=d.replace(" "+b+" "," ");T=p(d),c!==T&&this.setAttribute("class",T)}}):this):this.attr("class","")},toggleClass:function(s,g){var d,c,b,y,T=typeof s,_=T==="string"||Array.isArray(s);return m(s)?this.each(function(A){n(this).toggleClass(s.call(this,A,u(this),g),g)}):typeof g=="boolean"&&_?g?this.addClass(s):this.removeClass(s):(d=v(s),this.each(function(){if(_)for(y=n(this),b=0;b<d.length;b++)c=d[b],y.hasClass(c)?y.removeClass(c):y.addClass(c);else(s===void 0||T==="boolean")&&(c=u(this),c&&o.set(this,"__className__",c),this.setAttribute&&this.setAttribute("class",c||s===!1?"":o.get(this,"__className__")||""))}))},hasClass:function(s){var g,d,c=0;for(g=" "+s+" ";d=this[c++];)if(d.nodeType===1&&(" "+p(u(d))+" ").indexOf(g)>-1)return!0;return!1}})}.apply(h,l),r!==void 0&&(P.exports=r)},5933:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(5581),i(4553)],r=function(n,p,m){"use strict";var f=/^(?:input|select|textarea|button)$/i,o=/^(?:a|area)$/i;n.fn.extend({prop:function(u,v){return p(this,n.prop,u,v,arguments.length>1)},removeProp:function(u){return this.each(function(){delete this[n.propFix[u]||u]})}}),n.extend({prop:function(u,v,s){var g,d,c=u.nodeType;if(!(c===3||c===8||c===2))return(c!==1||!n.isXMLDoc(u))&&(v=n.propFix[v]||v,d=n.propHooks[v]),s!==void 0?d&&"set"in d&&(g=d.set(u,s,v))!==void 0?g:u[v]=s:d&&"get"in d&&(g=d.get(u,v))!==null?g:u[v]},propHooks:{tabIndex:{get:function(u){var v=n.find.attr(u,"tabindex");return v?parseInt(v,10):f.test(u.nodeName)||o.test(u.nodeName)&&u.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),m.optSelected||(n.propHooks.selected={get:function(u){var v=u.parentNode;return v&&v.parentNode&&v.parentNode.selectedIndex,null},set:function(u){var v=u.parentNode;v&&(v.selectedIndex,v.parentNode&&v.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this})}.apply(h,l),r!==void 0&&(P.exports=r)},5581:(P,h,i)=>{var l,r;l=[i(8543),i(107)],r=function(n,p){"use strict";return function(){var m=n.createElement("input"),f=n.createElement("select"),o=f.appendChild(n.createElement("option"));m.type="checkbox",p.checkOn=m.value!=="",p.optSelected=o.selected,m=n.createElement("input"),m.value="t",m.type="radio",p.radioValue=m.value==="t"}(),p}.apply(h,l),r!==void 0&&(P.exports=r)},7065:(P,h,i)=>{var l,r;l=[i(8411),i(9266),i(5581),i(9773),i(1382),i(9340)],r=function(n,p,m,f,o){"use strict";var u=/\r/g;n.fn.extend({val:function(v){var s,g,d,c=this[0];return arguments.length?(d=o(v),this.each(function(b){var y;this.nodeType===1&&(d?y=v.call(this,b,n(this).val()):y=v,y==null?y="":typeof y=="number"?y+="":Array.isArray(y)&&(y=n.map(y,function(T){return T==null?"":T+""})),s=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],(!s||!("set"in s)||s.set(this,y,"value")===void 0)&&(this.value=y))})):c?(s=n.valHooks[c.type]||n.valHooks[c.nodeName.toLowerCase()],s&&"get"in s&&(g=s.get(c,"value"))!==void 0?g:(g=c.value,typeof g=="string"?g.replace(u,""):g==null?"":g)):void 0}}),n.extend({valHooks:{option:{get:function(v){var s=n.find.attr(v,"value");return s!=null?s:p(n.text(v))}},select:{get:function(v){var s,g,d,c=v.options,b=v.selectedIndex,y=v.type==="select-one",T=y?null:[],_=y?b+1:c.length;for(b<0?d=_:d=y?b:0;d<_;d++)if(g=c[d],(g.selected||d===b)&&!g.disabled&&(!g.parentNode.disabled||!f(g.parentNode,"optgroup"))){if(s=n(g).val(),y)return s;T.push(s)}return T},set:function(v,s){for(var g,d,c=v.options,b=n.makeArray(s),y=c.length;y--;)d=c[y],(d.selected=n.inArray(n.valHooks.option.get(d),b)>-1)&&(g=!0);return g||(v.selectedIndex=-1),b}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(v,s){if(Array.isArray(s))return v.checked=n.inArray(n(v).val(),s)>-1}},m.checkOn||(n.valHooks[this].get=function(v){return v.getAttribute("value")===null?"on":v.value})})}.apply(h,l),r!==void 0&&(P.exports=r)},3682:(P,h,i)=>{var l,r;l=[i(8411),i(8519),i(1382),i(9091)],r=function(n,p,m,f){"use strict";function o(u){var v={};return n.each(u.match(f)||[],function(s,g){v[g]=!0}),v}return n.Callbacks=function(u){u=typeof u=="string"?o(u):n.extend({},u);var v,s,g,d,c=[],b=[],y=-1,T=function(){for(d=d||u.once,g=v=!0;b.length;y=-1)for(s=b.shift();++y<c.length;)c[y].apply(s[0],s[1])===!1&&u.stopOnFalse&&(y=c.length,s=!1);u.memory||(s=!1),v=!1,d&&(s?c=[]:c="")},_={add:function(){return c&&(s&&!v&&(y=c.length-1,b.push(s)),function A(E){n.each(E,function(I,N){m(N)?(!u.unique||!_.has(N))&&c.push(N):N&&N.length&&p(N)!=="string"&&A(N)})}(arguments),s&&!v&&T()),this},remove:function(){return n.each(arguments,function(A,E){for(var I;(I=n.inArray(E,c,I))>-1;)c.splice(I,1),I<=y&&y--}),this},has:function(A){return A?n.inArray(A,c)>-1:c.length>0},empty:function(){return c&&(c=[]),this},disable:function(){return d=b=[],c=s="",this},disabled:function(){return!c},lock:function(){return d=b=[],!s&&!v&&(c=s=""),this},locked:function(){return!!d},fireWith:function(A,E){return d||(E=E||[],E=[A,E.slice?E.slice():E],b.push(E),v||T()),this},fire:function(){return _.fireWith(this,arguments),this},fired:function(){return!!g}};return _},n}.apply(h,l),r!==void 0&&(P.exports=r)},8411:(P,h,i)=>{var l,r;l=[i(2283),i(2332),i(5950),i(8305),i(7298),i(4733),i(8320),i(4122),i(1402),i(2122),i(8928),i(107),i(1382),i(7346),i(2710),i(8519)],r=function(n,p,m,f,o,u,v,s,g,d,c,b,y,T,_,A){"use strict";var E="3.7.1",I=/HTML$/i,N=function(C,R){return new N.fn.init(C,R)};N.fn=N.prototype={jquery:E,constructor:N,length:0,toArray:function(){return m.call(this)},get:function(C){return C==null?m.call(this):C<0?this[C+this.length]:this[C]},pushStack:function(C){var R=N.merge(this.constructor(),C);return R.prevObject=this,R},each:function(C){return N.each(this,C)},map:function(C){return this.pushStack(N.map(this,function(R,w){return C.call(R,w,R)}))},slice:function(){return this.pushStack(m.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(N.grep(this,function(C,R){return(R+1)%2}))},odd:function(){return this.pushStack(N.grep(this,function(C,R){return R%2}))},eq:function(C){var R=this.length,w=+C+(C<0?R:0);return this.pushStack(w>=0&&w<R?[this[w]]:[])},end:function(){return this.prevObject||this.constructor()},push:o,sort:n.sort,splice:n.splice},N.extend=N.fn.extend=function(){var C,R,w,D,k,G,W=arguments[0]||{},L=1,F=arguments.length,H=!1;for(typeof W=="boolean"&&(H=W,W=arguments[L]||{},L++),typeof W!="object"&&!y(W)&&(W={}),L===F&&(W=this,L--);L<F;L++)if((C=arguments[L])!=null)for(R in C)D=C[R],!(R==="__proto__"||W===D)&&(H&&D&&(N.isPlainObject(D)||(k=Array.isArray(D)))?(w=W[R],k&&!Array.isArray(w)?G=[]:!k&&!N.isPlainObject(w)?G={}:G=w,k=!1,W[R]=N.extend(H,G,D)):D!==void 0&&(W[R]=D));return W},N.extend({expando:"jQuery"+(E+Math.random()).replace(/\D/g,""),isReady:!0,error:function(C){throw new Error(C)},noop:function(){},isPlainObject:function(C){var R,w;return!C||s.call(C)!=="[object Object]"?!1:(R=p(C),R?(w=g.call(R,"constructor")&&R.constructor,typeof w=="function"&&d.call(w)===c):!0)},isEmptyObject:function(C){var R;for(R in C)return!1;return!0},globalEval:function(C,R,w){_(C,{nonce:R&&R.nonce},w)},each:function(C,R){var w,D=0;if(B(C))for(w=C.length;D<w&&R.call(C[D],D,C[D])!==!1;D++);else for(D in C)if(R.call(C[D],D,C[D])===!1)break;return C},text:function(C){var R,w="",D=0,k=C.nodeType;if(!k)for(;R=C[D++];)w+=N.text(R);return k===1||k===11?C.textContent:k===9?C.documentElement.textContent:k===3||k===4?C.nodeValue:w},makeArray:function(C,R){var w=R||[];return C!=null&&(B(Object(C))?N.merge(w,typeof C=="string"?[C]:C):o.call(w,C)),w},inArray:function(C,R,w){return R==null?-1:u.call(R,C,w)},isXMLDoc:function(C){var R=C&&C.namespaceURI,w=C&&(C.ownerDocument||C).documentElement;return!I.test(R||w&&w.nodeName||"HTML")},merge:function(C,R){for(var w=+R.length,D=0,k=C.length;D<w;D++)C[k++]=R[D];return C.length=k,C},grep:function(C,R,w){for(var D,k=[],G=0,W=C.length,L=!w;G<W;G++)D=!R(C[G],G),D!==L&&k.push(C[G]);return k},map:function(C,R,w){var D,k,G=0,W=[];if(B(C))for(D=C.length;G<D;G++)k=R(C[G],G,w),k!=null&&W.push(k);else for(G in C)k=R(C[G],G,w),k!=null&&W.push(k);return f(W)},guid:1,support:b}),typeof Symbol=="function"&&(N.fn[Symbol.iterator]=n[Symbol.iterator]),N.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(C,R){v["[object "+R+"]"]=R.toLowerCase()});function B(C){var R=!!C&&"length"in C&&C.length,w=A(C);return y(C)||T(C)?!1:w==="array"||R===0||typeof R=="number"&&R>0&&R-1 in C}return N}.apply(h,l),r!==void 0&&(P.exports=r)},2710:(P,h,i)=>{var l,r;l=[i(8543)],r=function(n){"use strict";var p={type:!0,src:!0,nonce:!0,noModule:!0};function m(f,o,u){u=u||n;var v,s,g=u.createElement("script");if(g.text=f,o)for(v in p)s=o[v]||o.getAttribute&&o.getAttribute(v),s&&g.setAttribute(v,s);u.head.appendChild(g).parentNode.removeChild(g)}return m}.apply(h,l),r!==void 0&&(P.exports=r)},6756:(P,h,i)=>{var l,r;l=[i(8411),i(8519),i(1382)],r=function(n,p,m){"use strict";var f=function(o,u,v,s,g,d,c){var b=0,y=o.length,T=v==null;if(p(v)==="object"){g=!0;for(b in v)f(o,u,b,v[b],!0,d,c)}else if(s!==void 0&&(g=!0,m(s)||(c=!0),T&&(c?(u.call(o,s),u=null):(T=u,u=function(_,A,E){return T.call(n(_),E)})),u))for(;b<y;b++)u(o[b],v,c?s:s.call(o[b],b,u(o[b],v)));return g?o:T?u.call(o):y?u(o[0],v):d};return f}.apply(h,l),r!==void 0&&(P.exports=r)},9758:(P,h)=>{var i,l;i=[],l=function(){"use strict";var r=/^-ms-/,n=/-([a-z])/g;function p(f,o){return o.toUpperCase()}function m(f){return f.replace(r,"ms-").replace(n,p)}return m}.apply(h,i),l!==void 0&&(P.exports=l)},9340:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(1382),i(3894),i(8269)],r=function(n,p,m,f){"use strict";var o,u=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,v=n.fn.init=function(s,g,d){var c,b;if(!s)return this;if(d=d||o,typeof s=="string")if(s[0]==="<"&&s[s.length-1]===">"&&s.length>=3?c=[null,s,null]:c=u.exec(s),c&&(c[1]||!g))if(c[1]){if(g=g instanceof n?g[0]:g,n.merge(this,n.parseHTML(c[1],g&&g.nodeType?g.ownerDocument||g:p,!0)),f.test(c[1])&&n.isPlainObject(g))for(c in g)m(this[c])?this[c](g[c]):this.attr(c,g[c]);return this}else return b=p.getElementById(c[2]),b&&(this[0]=b,this.length=1),this;else return!g||g.jquery?(g||d).find(s):this.constructor(g).find(s);else{if(s.nodeType)return this[0]=s,this.length=1,this;if(m(s))return d.ready!==void 0?d.ready(s):s(n)}return n.makeArray(s,this)};return v.prototype=n.fn,o=n(p),v}.apply(h,l),r!==void 0&&(P.exports=r)},5194:(P,h,i)=>{var l,r;l=[i(8411),i(7623),i(685)],r=function(n,p){"use strict";var m=function(o){return n.contains(o.ownerDocument,o)},f={composed:!0};return p.getRootNode&&(m=function(o){return n.contains(o.ownerDocument,o)||o.getRootNode(f)===o.ownerDocument}),m}.apply(h,l),r!==void 0&&(P.exports=r)},9773:(P,h,i)=>{var l;l=function(){"use strict";function r(n,p){return n.nodeName&&n.nodeName.toLowerCase()===p.toLowerCase()}return r}.call(h,i,h,P),l!==void 0&&(P.exports=l)},3814:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(3894),i(7414),i(203)],r=function(n,p,m,f,o){"use strict";return n.parseHTML=function(u,v,s){if(typeof u!="string")return[];typeof v=="boolean"&&(s=v,v=!1);var g,d,c;return v||(o.createHTMLDocument?(v=p.implementation.createHTMLDocument(""),g=v.createElement("base"),g.href=p.location.href,v.head.appendChild(g)):v=p),d=m.exec(u),c=!s&&[],d?[v.createElement(d[1])]:(d=f([u],v,c),c&&c.length&&n(c).remove(),n.merge([],d.childNodes))},n.parseHTML}.apply(h,l),r!==void 0&&(P.exports=r)},1074:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";return n.parseXML=function(p){var m,f;if(!p||typeof p!="string")return null;try{m=new window.DOMParser().parseFromString(p,"text/xml")}catch(o){}return f=m&&m.getElementsByTagName("parsererror")[0],(!m||f)&&n.error("Invalid XML: "+(f?n.map(f.childNodes,function(o){return o.textContent}).join(`
`):p)),m},n.parseXML}.apply(h,l),r!==void 0&&(P.exports=r)},1791:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(1114),i(6599)],r=function(n,p){"use strict";var m=n.Deferred();n.fn.ready=function(o){return m.then(o).catch(function(u){n.readyException(u)}),this},n.extend({isReady:!1,readyWait:1,ready:function(o){(o===!0?--n.readyWait:n.isReady)||(n.isReady=!0,!(o!==!0&&--n.readyWait>0)&&m.resolveWith(p,[n]))}}),n.ready.then=m.then;function f(){p.removeEventListener("DOMContentLoaded",f),window.removeEventListener("load",f),n.ready()}p.readyState==="complete"||p.readyState!=="loading"&&!p.documentElement.doScroll?window.setTimeout(n.ready):(p.addEventListener("DOMContentLoaded",f),window.addEventListener("load",f))}.apply(h,l),r!==void 0&&(P.exports=r)},1114:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";n.readyException=function(p){window.setTimeout(function(){throw p})}}.apply(h,l),r!==void 0&&(P.exports=r)},9266:(P,h,i)=>{var l,r;l=[i(9091)],r=function(n){"use strict";function p(m){var f=m.match(n)||[];return f.join(" ")}return p}.apply(h,l),r!==void 0&&(P.exports=r)},203:(P,h,i)=>{var l,r;l=[i(8543),i(107)],r=function(n,p){"use strict";return p.createHTMLDocument=function(){var m=n.implementation.createHTMLDocument("").body;return m.innerHTML="<form></form><form></form>",m.childNodes.length===2}(),p}.apply(h,l),r!==void 0&&(P.exports=r)},8519:(P,h,i)=>{var l,r;l=[i(8320),i(4122)],r=function(n,p){"use strict";function m(f){return f==null?f+"":typeof f=="object"||typeof f=="function"?n[p.call(f)]||"object":typeof f}return m}.apply(h,l),r!==void 0&&(P.exports=r)},3894:(P,h,i)=>{var l;l=function(){"use strict";return/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i}.call(h,i,h,P),l!==void 0&&(P.exports=l)},9229:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(9758),i(9773),i(403),i(945),i(8064),i(1483),i(3934),i(1821),i(9617),i(5748),i(3629),i(541),i(5744),i(9340),i(1791),i(4553)],r=function(n,p,m,f,o,u,v,s,g,d,c,b,y,T,_){"use strict";var A=/^(none|table(?!-c[ea]).+)/,E={position:"absolute",visibility:"hidden",display:"block"},I={letterSpacing:"0",fontWeight:"400"};function N(R,w,D){var k=o.exec(w);return k?Math.max(0,k[2]-(D||0))+(k[3]||"px"):w}function B(R,w,D,k,G,W){var L=w==="width"?1:0,F=0,H=0,K=0;if(D===(k?"border":"content"))return 0;for(;L<4;L+=2)D==="margin"&&(K+=n.css(R,D+s[L],!0,G)),k?(D==="content"&&(H-=n.css(R,"padding"+s[L],!0,G)),D!=="margin"&&(H-=n.css(R,"border"+s[L]+"Width",!0,G))):(H+=n.css(R,"padding"+s[L],!0,G),D!=="padding"?H+=n.css(R,"border"+s[L]+"Width",!0,G):F+=n.css(R,"border"+s[L]+"Width",!0,G));return!k&&W>=0&&(H+=Math.max(0,Math.ceil(R["offset"+w[0].toUpperCase()+w.slice(1)]-W-H-F-.5))||0),H+K}function C(R,w,D){var k=g(R),G=!T.boxSizingReliable()||D,W=G&&n.css(R,"boxSizing",!1,k)==="border-box",L=W,F=c(R,w,k),H="offset"+w[0].toUpperCase()+w.slice(1);if(u.test(F)){if(!D)return F;F="auto"}return(!T.boxSizingReliable()&&W||!T.reliableTrDimensions()&&f(R,"tr")||F==="auto"||!parseFloat(F)&&n.css(R,"display",!1,k)==="inline")&&R.getClientRects().length&&(W=n.css(R,"boxSizing",!1,k)==="border-box",L=H in R,L&&(F=R[H])),F=parseFloat(F)||0,F+B(R,w,D||(W?"border":"content"),L,k,F)+"px"}return n.extend({cssHooks:{opacity:{get:function(R,w){if(w){var D=c(R,"opacity");return D===""?"1":D}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(R,w,D,k){if(!(!R||R.nodeType===3||R.nodeType===8||!R.style)){var G,W,L,F=m(w),H=v.test(w),K=R.style;if(H||(w=_(F)),L=n.cssHooks[w]||n.cssHooks[F],D!==void 0){if(W=typeof D,W==="string"&&(G=o.exec(D))&&G[1]&&(D=b(R,w,G),W="number"),D==null||D!==D)return;W==="number"&&!H&&(D+=G&&G[3]||(n.cssNumber[F]?"":"px")),!T.clearCloneStyle&&D===""&&w.indexOf("background")===0&&(K[w]="inherit"),(!L||!("set"in L)||(D=L.set(R,D,k))!==void 0)&&(H?K.setProperty(w,D):K[w]=D)}else return L&&"get"in L&&(G=L.get(R,!1,k))!==void 0?G:K[w]}},css:function(R,w,D,k){var G,W,L,F=m(w),H=v.test(w);return H||(w=_(F)),L=n.cssHooks[w]||n.cssHooks[F],L&&"get"in L&&(G=L.get(R,!0,D)),G===void 0&&(G=c(R,w,k)),G==="normal"&&w in I&&(G=I[w]),D===""||D?(W=parseFloat(G),D===!0||isFinite(W)?W||0:G):G}}),n.each(["height","width"],function(R,w){n.cssHooks[w]={get:function(D,k,G){if(k)return A.test(n.css(D,"display"))&&(!D.getClientRects().length||!D.getBoundingClientRect().width)?d(D,E,function(){return C(D,w,G)}):C(D,w,G)},set:function(D,k,G){var W,L=g(D),F=!T.scrollboxSize()&&L.position==="absolute",H=F||G,K=H&&n.css(D,"boxSizing",!1,L)==="border-box",U=G?B(D,w,G,K,L):0;return K&&F&&(U-=Math.ceil(D["offset"+w[0].toUpperCase()+w.slice(1)]-parseFloat(L[w])-B(D,w,"border",!1,L)-.5)),U&&(W=o.exec(k))&&(W[3]||"px")!=="px"&&(D.style[w]=k,k=n.css(D,w)),N(D,k,U)}}}),n.cssHooks.marginLeft=y(T.reliableMarginLeft,function(R,w){if(w)return(parseFloat(c(R,"marginLeft"))||R.getBoundingClientRect().left-d(R,{marginLeft:0},function(){return R.getBoundingClientRect().left}))+"px"}),n.each({margin:"",padding:"",border:"Width"},function(R,w){n.cssHooks[R+w]={expand:function(D){for(var k=0,G={},W=typeof D=="string"?D.split(" "):[D];k<4;k++)G[R+s[k]+w]=W[k]||W[k-2]||W[0];return G}},R!=="margin"&&(n.cssHooks[R+w].set=N)}),n.fn.extend({css:function(R,w){return p(this,function(D,k,G){var W,L,F={},H=0;if(Array.isArray(k)){for(W=g(D),L=k.length;H<L;H++)F[k[H]]=n.css(D,k[H],!1,W);return F}return G!==void 0?n.style(D,k,G):n.css(D,k)},R,w,arguments.length>1)}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},3629:(P,h,i)=>{var l;l=function(){"use strict";function r(n,p){return{get:function(){if(n()){delete this.get;return}return(this.get=p).apply(this,arguments)}}}return r}.call(h,i,h,P),l!==void 0&&(P.exports=l)},5748:(P,h,i)=>{var l,r;l=[i(8411),i(403)],r=function(n,p){"use strict";function m(f,o,u,v){var s,g,d=20,c=v?function(){return v.cur()}:function(){return n.css(f,o,"")},b=c(),y=u&&u[3]||(n.cssNumber[o]?"":"px"),T=f.nodeType&&(n.cssNumber[o]||y!=="px"&&+b)&&p.exec(n.css(f,o));if(T&&T[3]!==y){for(b=b/2,y=y||T[3],T=+b||1;d--;)n.style(f,o,T+y),(1-g)*(1-(g=c()/b||.5))<=0&&(d=0),T=T/g;T=T*2,n.style(f,o,T+y),u=u||[]}return u&&(T=+T||+b||0,s=u[1]?T+(u[1]+1)*u[2]:+u[2],v&&(v.unit=y,v.start=T,v.end=s)),s}return m}.apply(h,l),r!==void 0&&(P.exports=r)},9617:(P,h,i)=>{var l,r;l=[i(8411),i(5194),i(8088),i(945),i(3934),i(8064),i(8919),i(541)],r=function(n,p,m,f,o,u,v,s){"use strict";function g(d,c,b){var y,T,_,A,E=u.test(c),I=d.style;return b=b||o(d),b&&(A=b.getPropertyValue(c)||b[c],E&&A&&(A=A.replace(v,"$1")||void 0),A===""&&!p(d)&&(A=n.style(d,c)),!s.pixelBoxStyles()&&f.test(A)&&m.test(c)&&(y=I.width,T=I.minWidth,_=I.maxWidth,I.minWidth=I.maxWidth=I.width=A,A=b.width,I.width=y,I.minWidth=T,I.maxWidth=_)),A!==void 0?A+"":A}return g}.apply(h,l),r!==void 0&&(P.exports=r)},5744:(P,h,i)=>{var l,r;l=[i(8543),i(8411)],r=function(n,p){"use strict";var m=["Webkit","Moz","ms"],f=n.createElement("div").style,o={};function u(s){for(var g=s[0].toUpperCase()+s.slice(1),d=m.length;d--;)if(s=m[d]+g,s in f)return s}function v(s){var g=p.cssProps[s]||o[s];return g||(s in f?s:o[s]=u(s)||s)}return v}.apply(h,l),r!==void 0&&(P.exports=r)},1896:(P,h,i)=>{var l,r;l=[i(8411),i(4553)],r=function(n){"use strict";n.expr.pseudos.hidden=function(p){return!n.expr.pseudos.visible(p)},n.expr.pseudos.visible=function(p){return!!(p.offsetWidth||p.offsetHeight||p.getClientRects().length)}}.apply(h,l),r!==void 0&&(P.exports=r)},4213:(P,h,i)=>{var l,r;l=[i(8411),i(9192),i(4385)],r=function(n,p,m){"use strict";var f={};function o(v){var s,g=v.ownerDocument,d=v.nodeName,c=f[d];return c||(s=g.body.appendChild(g.createElement(d)),c=n.css(s,"display"),s.parentNode.removeChild(s),c==="none"&&(c="block"),f[d]=c,c)}function u(v,s){for(var g,d,c=[],b=0,y=v.length;b<y;b++)d=v[b],d.style&&(g=d.style.display,s?(g==="none"&&(c[b]=p.get(d,"display")||null,c[b]||(d.style.display="")),d.style.display===""&&m(d)&&(c[b]=o(d))):g!=="none"&&(c[b]="none",p.set(d,"display",g)));for(b=0;b<y;b++)c[b]!=null&&(v[b].style.display=c[b]);return v}return n.fn.extend({show:function(){return u(this,!0)},hide:function(){return u(this)},toggle:function(v){return typeof v=="boolean"?v?this.show():this.hide():this.each(function(){m(this)?n(this).show():n(this).hide()})}}),u}.apply(h,l),r!==void 0&&(P.exports=r)},541:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(7623),i(107)],r=function(n,p,m,f){"use strict";return function(){function o(){if(T){y.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",T.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",m.appendChild(y).appendChild(T);var _=window.getComputedStyle(T);v=_.top!=="1%",b=u(_.marginLeft)===12,T.style.right="60%",d=u(_.right)===36,s=u(_.width)===36,T.style.position="absolute",g=u(T.offsetWidth/3)===12,m.removeChild(y),T=null}}function u(_){return Math.round(parseFloat(_))}var v,s,g,d,c,b,y=p.createElement("div"),T=p.createElement("div");T.style&&(T.style.backgroundClip="content-box",T.cloneNode(!0).style.backgroundClip="",f.clearCloneStyle=T.style.backgroundClip==="content-box",n.extend(f,{boxSizingReliable:function(){return o(),s},pixelBoxStyles:function(){return o(),d},pixelPosition:function(){return o(),v},reliableMarginLeft:function(){return o(),b},scrollboxSize:function(){return o(),g},reliableTrDimensions:function(){var _,A,E,I;return c==null&&(_=p.createElement("table"),A=p.createElement("tr"),E=p.createElement("div"),_.style.cssText="position:absolute;left:-11111px;border-collapse:separate",A.style.cssText="box-sizing:content-box;border:1px solid",A.style.height="1px",E.style.height="9px",E.style.display="block",m.appendChild(_).appendChild(A).appendChild(E),I=window.getComputedStyle(A),c=parseInt(I.height,10)+parseInt(I.borderTopWidth,10)+parseInt(I.borderBottomWidth,10)===A.offsetHeight,m.removeChild(_)),c}}))}(),f}.apply(h,l),r!==void 0&&(P.exports=r)},1483:(P,h,i)=>{var l;l=function(){"use strict";return["Top","Right","Bottom","Left"]}.call(h,i,h,P),l!==void 0&&(P.exports=l)},3934:(P,h,i)=>{var l;l=function(){"use strict";return function(r){var n=r.ownerDocument.defaultView;return(!n||!n.opener)&&(n=window),n.getComputedStyle(r)}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},4385:(P,h,i)=>{var l,r;l=[i(8411),i(5194)],r=function(n,p){"use strict";return function(m,f){return m=f||m,m.style.display==="none"||m.style.display===""&&p(m)&&n.css(m,"display")==="none"}}.apply(h,l),r!==void 0&&(P.exports=r)},8088:(P,h,i)=>{var l,r;l=[i(1483)],r=function(n){"use strict";return new RegExp(n.join("|"),"i")}.apply(h,l),r!==void 0&&(P.exports=r)},8064:(P,h,i)=>{var l;l=function(){"use strict";return/^--/}.call(h,i,h,P),l!==void 0&&(P.exports=l)},945:(P,h,i)=>{var l,r;l=[i(210)],r=function(n){"use strict";return new RegExp("^("+n+")(?!px)[a-z%]+$","i")}.apply(h,l),r!==void 0&&(P.exports=r)},1821:(P,h,i)=>{var l;l=function(){"use strict";return function(r,n,p){var m,f,o={};for(f in n)o[f]=r.style[f],r.style[f]=n[f];m=p.call(r);for(f in n)r.style[f]=o[f];return m}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},7076:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(9758),i(9192),i(7814)],r=function(n,p,m,f,o){"use strict";var u=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,v=/[A-Z]/g;function s(d){return d==="true"?!0:d==="false"?!1:d==="null"?null:d===+d+""?+d:u.test(d)?JSON.parse(d):d}function g(d,c,b){var y;if(b===void 0&&d.nodeType===1)if(y="data-"+c.replace(v,"-$&").toLowerCase(),b=d.getAttribute(y),typeof b=="string"){try{b=s(b)}catch(T){}o.set(d,c,b)}else b=void 0;return b}return n.extend({hasData:function(d){return o.hasData(d)||f.hasData(d)},data:function(d,c,b){return o.access(d,c,b)},removeData:function(d,c){o.remove(d,c)},_data:function(d,c,b){return f.access(d,c,b)},_removeData:function(d,c){f.remove(d,c)}}),n.fn.extend({data:function(d,c){var b,y,T,_=this[0],A=_&&_.attributes;if(d===void 0){if(this.length&&(T=o.get(_),_.nodeType===1&&!f.get(_,"hasDataAttrs"))){for(b=A.length;b--;)A[b]&&(y=A[b].name,y.indexOf("data-")===0&&(y=m(y.slice(5)),g(_,y,T[y])));f.set(_,"hasDataAttrs",!0)}return T}return typeof d=="object"?this.each(function(){o.set(this,d)}):p(this,function(E){var I;if(_&&E===void 0)return I=o.get(_,d),I!==void 0||(I=g(_,d),I!==void 0)?I:void 0;this.each(function(){o.set(this,d,E)})},null,c,arguments.length>1,null,!0)},removeData:function(d){return this.each(function(){o.remove(this,d)})}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},4172:(P,h,i)=>{var l,r;l=[i(8411),i(9758),i(9091),i(8149)],r=function(n,p,m,f){"use strict";function o(){this.expando=n.expando+o.uid++}return o.uid=1,o.prototype={cache:function(u){var v=u[this.expando];return v||(v={},f(u)&&(u.nodeType?u[this.expando]=v:Object.defineProperty(u,this.expando,{value:v,configurable:!0}))),v},set:function(u,v,s){var g,d=this.cache(u);if(typeof v=="string")d[p(v)]=s;else for(g in v)d[p(g)]=v[g];return d},get:function(u,v){return v===void 0?this.cache(u):u[this.expando]&&u[this.expando][p(v)]},access:function(u,v,s){return v===void 0||v&&typeof v=="string"&&s===void 0?this.get(u,v):(this.set(u,v,s),s!==void 0?s:v)},remove:function(u,v){var s,g=u[this.expando];if(g!==void 0){if(v!==void 0)for(Array.isArray(v)?v=v.map(p):(v=p(v),v=v in g?[v]:v.match(m)||[]),s=v.length;s--;)delete g[v[s]];(v===void 0||n.isEmptyObject(g))&&(u.nodeType?u[this.expando]=void 0:delete u[this.expando])}},hasData:function(u){var v=u[this.expando];return v!==void 0&&!n.isEmptyObject(v)}},o}.apply(h,l),r!==void 0&&(P.exports=r)},8149:(P,h,i)=>{var l;l=function(){"use strict";return function(r){return r.nodeType===1||r.nodeType===9||!+r.nodeType}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},9192:(P,h,i)=>{var l,r;l=[i(4172)],r=function(n){"use strict";return new n}.apply(h,l),r!==void 0&&(P.exports=r)},7814:(P,h,i)=>{var l,r;l=[i(4172)],r=function(n){"use strict";return new n}.apply(h,l),r!==void 0&&(P.exports=r)},6599:(P,h,i)=>{var l,r;l=[i(8411),i(1382),i(5950),i(3682)],r=function(n,p,m){"use strict";function f(v){return v}function o(v){throw v}function u(v,s,g,d){var c;try{v&&p(c=v.promise)?c.call(v).done(s).fail(g):v&&p(c=v.then)?c.call(v,s,g):s.apply(void 0,[v].slice(d))}catch(b){g.apply(void 0,[b])}}return n.extend({Deferred:function(v){var s=[["notify","progress",n.Callbacks("memory"),n.Callbacks("memory"),2],["resolve","done",n.Callbacks("once memory"),n.Callbacks("once memory"),0,"resolved"],["reject","fail",n.Callbacks("once memory"),n.Callbacks("once memory"),1,"rejected"]],g="pending",d={state:function(){return g},always:function(){return c.done(arguments).fail(arguments),this},catch:function(b){return d.then(null,b)},pipe:function(){var b=arguments;return n.Deferred(function(y){n.each(s,function(T,_){var A=p(b[_[4]])&&b[_[4]];c[_[1]](function(){var E=A&&A.apply(this,arguments);E&&p(E.promise)?E.promise().progress(y.notify).done(y.resolve).fail(y.reject):y[_[0]+"With"](this,A?[E]:arguments)})}),b=null}).promise()},then:function(b,y,T){var _=0;function A(E,I,N,B){return function(){var C=this,R=arguments,w=function(){var k,G;if(!(E<_)){if(k=N.apply(C,R),k===I.promise())throw new TypeError("Thenable self-resolution");G=k&&(typeof k=="object"||typeof k=="function")&&k.then,p(G)?B?G.call(k,A(_,I,f,B),A(_,I,o,B)):(_++,G.call(k,A(_,I,f,B),A(_,I,o,B),A(_,I,f,I.notifyWith))):(N!==f&&(C=void 0,R=[k]),(B||I.resolveWith)(C,R))}},D=B?w:function(){try{w()}catch(k){n.Deferred.exceptionHook&&n.Deferred.exceptionHook(k,D.error),E+1>=_&&(N!==o&&(C=void 0,R=[k]),I.rejectWith(C,R))}};E?D():(n.Deferred.getErrorHook?D.error=n.Deferred.getErrorHook():n.Deferred.getStackHook&&(D.error=n.Deferred.getStackHook()),window.setTimeout(D))}}return n.Deferred(function(E){s[0][3].add(A(0,E,p(T)?T:f,E.notifyWith)),s[1][3].add(A(0,E,p(b)?b:f)),s[2][3].add(A(0,E,p(y)?y:o))}).promise()},promise:function(b){return b!=null?n.extend(b,d):d}},c={};return n.each(s,function(b,y){var T=y[2],_=y[5];d[y[1]]=T.add,_&&T.add(function(){g=_},s[3-b][2].disable,s[3-b][3].disable,s[0][2].lock,s[0][3].lock),T.add(y[3].fire),c[y[0]]=function(){return c[y[0]+"With"](this===c?void 0:this,arguments),this},c[y[0]+"With"]=T.fireWith}),d.promise(c),v&&v.call(c,c),c},when:function(v){var s=arguments.length,g=s,d=Array(g),c=m.call(arguments),b=n.Deferred(),y=function(T){return function(_){d[T]=this,c[T]=arguments.length>1?m.call(arguments):_,--s||b.resolveWith(d,c)}};if(s<=1&&(u(v,b.done(y(g)).resolve,b.reject,!s),b.state()==="pending"||p(c[g]&&c[g].then)))return b.then();for(;g--;)u(c[g],y(g),b.reject);return b.promise()}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},5850:(P,h,i)=>{var l,r;l=[i(8411),i(6599)],r=function(n){"use strict";var p=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;n.Deferred.exceptionHook=function(m,f){window.console&&window.console.warn&&m&&p.test(m.name)&&window.console.warn("jQuery.Deferred exception: "+m.message,m.stack,f)}}.apply(h,l),r!==void 0&&(P.exports=r)},6353:(P,h,i)=>{var l,r;l=[i(8411),i(9773),i(9758),i(8519),i(1382),i(7346),i(5950),i(6962),i(2738)],r=function(n,p,m,f,o,u,v){"use strict";var s=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;n.proxy=function(g,d){var c,b,y;if(typeof d=="string"&&(c=g[d],d=g,g=c),!!o(g))return b=v.call(arguments,2),y=function(){return g.apply(d||this,b.concat(v.call(arguments)))},y.guid=g.guid=g.guid||n.guid++,y},n.holdReady=function(g){g?n.readyWait++:n.ready(!0)},n.isArray=Array.isArray,n.parseJSON=JSON.parse,n.nodeName=p,n.isFunction=o,n.isWindow=u,n.camelCase=m,n.type=f,n.now=Date.now,n.isNumeric=function(g){var d=n.type(g);return(d==="number"||d==="string")&&!isNaN(g-parseFloat(g))},n.trim=function(g){return g==null?"":(g+"").replace(s,"$1")}}.apply(h,l),r!==void 0&&(P.exports=r)},6962:(P,h,i)=>{var l,r;l=[i(8411),i(9978),i(8926)],r=function(n){"use strict";n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(p,m){n.fn[m]=function(f){return this.on(m,f)}})}.apply(h,l),r!==void 0&&(P.exports=r)},2738:(P,h,i)=>{var l,r;l=[i(8411),i(8926),i(3985)],r=function(n){"use strict";n.fn.extend({bind:function(p,m,f){return this.on(p,null,m,f)},unbind:function(p,m){return this.off(p,null,m)},delegate:function(p,m,f,o){return this.on(m,p,f,o)},undelegate:function(p,m,f){return arguments.length===1?this.off(p,"**"):this.off(m,p||"**",f)},hover:function(p,m){return this.on("mouseenter",p).on("mouseleave",m||p)}}),n.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(p,m){n.fn[m]=function(f,o){return arguments.length>0?this.on(m,null,f,o):this.trigger(m)}})}.apply(h,l),r!==void 0&&(P.exports=r)},4041:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(7346),i(9229)],r=function(n,p,m){"use strict";return n.each({Height:"height",Width:"width"},function(f,o){n.each({padding:"inner"+f,content:o,"":"outer"+f},function(u,v){n.fn[v]=function(s,g){var d=arguments.length&&(u||typeof s!="boolean"),c=u||(s===!0||g===!0?"margin":"border");return p(this,function(b,y,T){var _;return m(b)?v.indexOf("outer")===0?b["inner"+f]:b.document.documentElement["client"+f]:b.nodeType===9?(_=b.documentElement,Math.max(b.body["scroll"+f],_["scroll"+f],b.body["offset"+f],_["offset"+f],_["client"+f])):T===void 0?n.css(b,y,c):n.style(b,y,T,c)},o,d?s:void 0,d)}})}),n}.apply(h,l),r!==void 0&&(P.exports=r)},2512:(P,h,i)=>{var l,r;l=[i(8411),i(9758),i(8543),i(1382),i(403),i(9091),i(1483),i(4385),i(5748),i(9192),i(4213),i(9340),i(1801),i(6599),i(2569),i(7957),i(9229),i(4560)],r=function(n,p,m,f,o,u,v,s,g,d,c){"use strict";var b,y,T=/^(?:toggle|show|hide)$/,_=/queueHooks$/;function A(){y&&(m.hidden===!1&&window.requestAnimationFrame?window.requestAnimationFrame(A):window.setTimeout(A,n.fx.interval),n.fx.tick())}function E(){return window.setTimeout(function(){b=void 0}),b=Date.now()}function I(w,D){var k,G=0,W={height:w};for(D=D?1:0;G<4;G+=2-D)k=v[G],W["margin"+k]=W["padding"+k]=w;return D&&(W.opacity=W.width=w),W}function N(w,D,k){for(var G,W=(R.tweeners[D]||[]).concat(R.tweeners["*"]),L=0,F=W.length;L<F;L++)if(G=W[L].call(k,D,w))return G}function B(w,D,k){var G,W,L,F,H,K,U,Z,ie="width"in D||"height"in D,ue=this,J={},be=w.style,Ae=w.nodeType&&s(w),Se=d.get(w,"fxshow");k.queue||(F=n._queueHooks(w,"fx"),F.unqueued==null&&(F.unqueued=0,H=F.empty.fire,F.empty.fire=function(){F.unqueued||H()}),F.unqueued++,ue.always(function(){ue.always(function(){F.unqueued--,n.queue(w,"fx").length||F.empty.fire()})}));for(G in D)if(W=D[G],T.test(W)){if(delete D[G],L=L||W==="toggle",W===(Ae?"hide":"show"))if(W==="show"&&Se&&Se[G]!==void 0)Ae=!0;else continue;J[G]=Se&&Se[G]||n.style(w,G)}if(K=!n.isEmptyObject(D),!(!K&&n.isEmptyObject(J))){ie&&w.nodeType===1&&(k.overflow=[be.overflow,be.overflowX,be.overflowY],U=Se&&Se.display,U==null&&(U=d.get(w,"display")),Z=n.css(w,"display"),Z==="none"&&(U?Z=U:(c([w],!0),U=w.style.display||U,Z=n.css(w,"display"),c([w]))),(Z==="inline"||Z==="inline-block"&&U!=null)&&n.css(w,"float")==="none"&&(K||(ue.done(function(){be.display=U}),U==null&&(Z=be.display,U=Z==="none"?"":Z)),be.display="inline-block")),k.overflow&&(be.overflow="hidden",ue.always(function(){be.overflow=k.overflow[0],be.overflowX=k.overflow[1],be.overflowY=k.overflow[2]})),K=!1;for(G in J)K||(Se?"hidden"in Se&&(Ae=Se.hidden):Se=d.access(w,"fxshow",{display:U}),L&&(Se.hidden=!Ae),Ae&&c([w],!0),ue.done(function(){Ae||c([w]),d.remove(w,"fxshow");for(G in J)n.style(w,G,J[G])})),K=N(Ae?Se[G]:0,G,ue),G in Se||(Se[G]=K.start,Ae&&(K.end=K.start,K.start=0))}}function C(w,D){var k,G,W,L,F;for(k in w)if(G=p(k),W=D[G],L=w[k],Array.isArray(L)&&(W=L[1],L=w[k]=L[0]),k!==G&&(w[G]=L,delete w[k]),F=n.cssHooks[G],F&&"expand"in F){L=F.expand(L),delete w[G];for(k in L)k in w||(w[k]=L[k],D[k]=W)}else D[G]=W}function R(w,D,k){var G,W,L=0,F=R.prefilters.length,H=n.Deferred().always(function(){delete K.elem}),K=function(){if(W)return!1;for(var ie=b||E(),ue=Math.max(0,U.startTime+U.duration-ie),J=ue/U.duration||0,be=1-J,Ae=0,Se=U.tweens.length;Ae<Se;Ae++)U.tweens[Ae].run(be);return H.notifyWith(w,[U,be,ue]),be<1&&Se?ue:(Se||H.notifyWith(w,[U,1,0]),H.resolveWith(w,[U]),!1)},U=H.promise({elem:w,props:n.extend({},D),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},k),originalProperties:D,originalOptions:k,startTime:b||E(),duration:k.duration,tweens:[],createTween:function(ie,ue){var J=n.Tween(w,U.opts,ie,ue,U.opts.specialEasing[ie]||U.opts.easing);return U.tweens.push(J),J},stop:function(ie){var ue=0,J=ie?U.tweens.length:0;if(W)return this;for(W=!0;ue<J;ue++)U.tweens[ue].run(1);return ie?(H.notifyWith(w,[U,1,0]),H.resolveWith(w,[U,ie])):H.rejectWith(w,[U,ie]),this}}),Z=U.props;for(C(Z,U.opts.specialEasing);L<F;L++)if(G=R.prefilters[L].call(U,w,Z,U.opts),G)return f(G.stop)&&(n._queueHooks(U.elem,U.opts.queue).stop=G.stop.bind(G)),G;return n.map(Z,N,U),f(U.opts.start)&&U.opts.start.call(w,U),U.progress(U.opts.progress).done(U.opts.done,U.opts.complete).fail(U.opts.fail).always(U.opts.always),n.fx.timer(n.extend(K,{elem:w,anim:U,queue:U.opts.queue})),U}return n.Animation=n.extend(R,{tweeners:{"*":[function(w,D){var k=this.createTween(w,D);return g(k.elem,w,o.exec(D),k),k}]},tweener:function(w,D){f(w)?(D=w,w=["*"]):w=w.match(u);for(var k,G=0,W=w.length;G<W;G++)k=w[G],R.tweeners[k]=R.tweeners[k]||[],R.tweeners[k].unshift(D)},prefilters:[B],prefilter:function(w,D){D?R.prefilters.unshift(w):R.prefilters.push(w)}}),n.speed=function(w,D,k){var G=w&&typeof w=="object"?n.extend({},w):{complete:k||!k&&D||f(w)&&w,duration:w,easing:k&&D||D&&!f(D)&&D};return n.fx.off?G.duration=0:typeof G.duration!="number"&&(G.duration in n.fx.speeds?G.duration=n.fx.speeds[G.duration]:G.duration=n.fx.speeds._default),(G.queue==null||G.queue===!0)&&(G.queue="fx"),G.old=G.complete,G.complete=function(){f(G.old)&&G.old.call(this),G.queue&&n.dequeue(this,G.queue)},G},n.fn.extend({fadeTo:function(w,D,k,G){return this.filter(s).css("opacity",0).show().end().animate({opacity:D},w,k,G)},animate:function(w,D,k,G){var W=n.isEmptyObject(w),L=n.speed(D,k,G),F=function(){var H=R(this,n.extend({},w),L);(W||d.get(this,"finish"))&&H.stop(!0)};return F.finish=F,W||L.queue===!1?this.each(F):this.queue(L.queue,F)},stop:function(w,D,k){var G=function(W){var L=W.stop;delete W.stop,L(k)};return typeof w!="string"&&(k=D,D=w,w=void 0),D&&this.queue(w||"fx",[]),this.each(function(){var W=!0,L=w!=null&&w+"queueHooks",F=n.timers,H=d.get(this);if(L)H[L]&&H[L].stop&&G(H[L]);else for(L in H)H[L]&&H[L].stop&&_.test(L)&&G(H[L]);for(L=F.length;L--;)F[L].elem===this&&(w==null||F[L].queue===w)&&(F[L].anim.stop(k),W=!1,F.splice(L,1));(W||!k)&&n.dequeue(this,w)})},finish:function(w){return w!==!1&&(w=w||"fx"),this.each(function(){var D,k=d.get(this),G=k[w+"queue"],W=k[w+"queueHooks"],L=n.timers,F=G?G.length:0;for(k.finish=!0,n.queue(this,w,[]),W&&W.stop&&W.stop.call(this,!0),D=L.length;D--;)L[D].elem===this&&L[D].queue===w&&(L[D].anim.stop(!0),L.splice(D,1));for(D=0;D<F;D++)G[D]&&G[D].finish&&G[D].finish.call(this);delete k.finish})}}),n.each(["toggle","show","hide"],function(w,D){var k=n.fn[D];n.fn[D]=function(G,W,L){return G==null||typeof G=="boolean"?k.apply(this,arguments):this.animate(I(D,!0),G,W,L)}}),n.each({slideDown:I("show"),slideUp:I("hide"),slideToggle:I("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(w,D){n.fn[w]=function(k,G,W){return this.animate(D,k,G,W)}}),n.timers=[],n.fx.tick=function(){var w,D=0,k=n.timers;for(b=Date.now();D<k.length;D++)w=k[D],!w()&&k[D]===w&&k.splice(D--,1);k.length||n.fx.stop(),b=void 0},n.fx.timer=function(w){n.timers.push(w),n.fx.start()},n.fx.interval=13,n.fx.start=function(){y||(y=!0,A())},n.fx.stop=function(){y=null},n.fx.speeds={slow:600,fast:200,_default:400},n}.apply(h,l),r!==void 0&&(P.exports=r)},4560:(P,h,i)=>{var l,r;l=[i(8411),i(5744),i(9229)],r=function(n,p){"use strict";function m(f,o,u,v,s){return new m.prototype.init(f,o,u,v,s)}n.Tween=m,m.prototype={constructor:m,init:function(f,o,u,v,s,g){this.elem=f,this.prop=u,this.easing=s||n.easing._default,this.options=o,this.start=this.now=this.cur(),this.end=v,this.unit=g||(n.cssNumber[u]?"":"px")},cur:function(){var f=m.propHooks[this.prop];return f&&f.get?f.get(this):m.propHooks._default.get(this)},run:function(f){var o,u=m.propHooks[this.prop];return this.options.duration?this.pos=o=n.easing[this.easing](f,this.options.duration*f,0,1,this.options.duration):this.pos=o=f,this.now=(this.end-this.start)*o+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),u&&u.set?u.set(this):m.propHooks._default.set(this),this}},m.prototype.init.prototype=m.prototype,m.propHooks={_default:{get:function(f){var o;return f.elem.nodeType!==1||f.elem[f.prop]!=null&&f.elem.style[f.prop]==null?f.elem[f.prop]:(o=n.css(f.elem,f.prop,""),!o||o==="auto"?0:o)},set:function(f){n.fx.step[f.prop]?n.fx.step[f.prop](f):f.elem.nodeType===1&&(n.cssHooks[f.prop]||f.elem.style[p(f.prop)]!=null)?n.style(f.elem,f.prop,f.now+f.unit):f.elem[f.prop]=f.now}}},m.propHooks.scrollTop=m.propHooks.scrollLeft={set:function(f){f.elem.nodeType&&f.elem.parentNode&&(f.elem[f.prop]=f.now)}},n.easing={linear:function(f){return f},swing:function(f){return .5-Math.cos(f*Math.PI)/2},_default:"swing"},n.fx=m.prototype.init,n.fx.step={}}.apply(h,l),r!==void 0&&(P.exports=r)},5547:(P,h,i)=>{var l,r;l=[i(8411),i(4553),i(2512)],r=function(n){"use strict";n.expr.pseudos.animated=function(p){return n.grep(n.timers,function(m){return p===m.elem}).length}}.apply(h,l),r!==void 0&&(P.exports=r)},8926:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(7623),i(1382),i(9091),i(8404),i(5950),i(8149),i(9192),i(9773),i(9340),i(4553)],r=function(n,p,m,f,o,u,v,s,g,d){"use strict";var c=/^([^.]*)(?:\.(.+)|)/;function b(){return!0}function y(){return!1}function T(A,E,I,N,B,C){var R,w;if(typeof E=="object"){typeof I!="string"&&(N=N||I,I=void 0);for(w in E)T(A,w,I,N,E[w],C);return A}if(N==null&&B==null?(B=I,N=I=void 0):B==null&&(typeof I=="string"?(B=N,N=void 0):(B=N,N=I,I=void 0)),B===!1)B=y;else if(!B)return A;return C===1&&(R=B,B=function(D){return n().off(D),R.apply(this,arguments)},B.guid=R.guid||(R.guid=n.guid++)),A.each(function(){n.event.add(this,E,B,N,I)})}n.event={global:{},add:function(A,E,I,N,B){var C,R,w,D,k,G,W,L,F,H,K,U=g.get(A);if(s(A))for(I.handler&&(C=I,I=C.handler,B=C.selector),B&&n.find.matchesSelector(m,B),I.guid||(I.guid=n.guid++),(D=U.events)||(D=U.events=Object.create(null)),(R=U.handle)||(R=U.handle=function(Z){return typeof n!="undefined"&&n.event.triggered!==Z.type?n.event.dispatch.apply(A,arguments):void 0}),E=(E||"").match(o)||[""],k=E.length;k--;)w=c.exec(E[k])||[],F=K=w[1],H=(w[2]||"").split(".").sort(),F&&(W=n.event.special[F]||{},F=(B?W.delegateType:W.bindType)||F,W=n.event.special[F]||{},G=n.extend({type:F,origType:K,data:N,handler:I,guid:I.guid,selector:B,needsContext:B&&n.expr.match.needsContext.test(B),namespace:H.join(".")},C),(L=D[F])||(L=D[F]=[],L.delegateCount=0,(!W.setup||W.setup.call(A,N,H,R)===!1)&&A.addEventListener&&A.addEventListener(F,R)),W.add&&(W.add.call(A,G),G.handler.guid||(G.handler.guid=I.guid)),B?L.splice(L.delegateCount++,0,G):L.push(G),n.event.global[F]=!0)},remove:function(A,E,I,N,B){var C,R,w,D,k,G,W,L,F,H,K,U=g.hasData(A)&&g.get(A);if(!(!U||!(D=U.events))){for(E=(E||"").match(o)||[""],k=E.length;k--;){if(w=c.exec(E[k])||[],F=K=w[1],H=(w[2]||"").split(".").sort(),!F){for(F in D)n.event.remove(A,F+E[k],I,N,!0);continue}for(W=n.event.special[F]||{},F=(N?W.delegateType:W.bindType)||F,L=D[F]||[],w=w[2]&&new RegExp("(^|\\.)"+H.join("\\.(?:.*\\.|)")+"(\\.|$)"),R=C=L.length;C--;)G=L[C],(B||K===G.origType)&&(!I||I.guid===G.guid)&&(!w||w.test(G.namespace))&&(!N||N===G.selector||N==="**"&&G.selector)&&(L.splice(C,1),G.selector&&L.delegateCount--,W.remove&&W.remove.call(A,G));R&&!L.length&&((!W.teardown||W.teardown.call(A,H,U.handle)===!1)&&n.removeEvent(A,F,U.handle),delete D[F])}n.isEmptyObject(D)&&g.remove(A,"handle events")}},dispatch:function(A){var E,I,N,B,C,R,w=new Array(arguments.length),D=n.event.fix(A),k=(g.get(this,"events")||Object.create(null))[D.type]||[],G=n.event.special[D.type]||{};for(w[0]=D,E=1;E<arguments.length;E++)w[E]=arguments[E];if(D.delegateTarget=this,!(G.preDispatch&&G.preDispatch.call(this,D)===!1)){for(R=n.event.handlers.call(this,D,k),E=0;(B=R[E++])&&!D.isPropagationStopped();)for(D.currentTarget=B.elem,I=0;(C=B.handlers[I++])&&!D.isImmediatePropagationStopped();)(!D.rnamespace||C.namespace===!1||D.rnamespace.test(C.namespace))&&(D.handleObj=C,D.data=C.data,N=((n.event.special[C.origType]||{}).handle||C.handler).apply(B.elem,w),N!==void 0&&(D.result=N)===!1&&(D.preventDefault(),D.stopPropagation()));return G.postDispatch&&G.postDispatch.call(this,D),D.result}},handlers:function(A,E){var I,N,B,C,R,w=[],D=E.delegateCount,k=A.target;if(D&&k.nodeType&&!(A.type==="click"&&A.button>=1)){for(;k!==this;k=k.parentNode||this)if(k.nodeType===1&&!(A.type==="click"&&k.disabled===!0)){for(C=[],R={},I=0;I<D;I++)N=E[I],B=N.selector+" ",R[B]===void 0&&(R[B]=N.needsContext?n(B,this).index(k)>-1:n.find(B,this,null,[k]).length),R[B]&&C.push(N);C.length&&w.push({elem:k,handlers:C})}}return k=this,D<E.length&&w.push({elem:k,handlers:E.slice(D)}),w},addProp:function(A,E){Object.defineProperty(n.Event.prototype,A,{enumerable:!0,configurable:!0,get:f(E)?function(){if(this.originalEvent)return E(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[A]},set:function(I){Object.defineProperty(this,A,{enumerable:!0,configurable:!0,writable:!0,value:I})}})},fix:function(A){return A[n.expando]?A:new n.Event(A)},special:{load:{noBubble:!0},click:{setup:function(A){var E=this||A;return u.test(E.type)&&E.click&&d(E,"input")&&_(E,"click",!0),!1},trigger:function(A){var E=this||A;return u.test(E.type)&&E.click&&d(E,"input")&&_(E,"click"),!0},_default:function(A){var E=A.target;return u.test(E.type)&&E.click&&d(E,"input")&&g.get(E,"click")||d(E,"a")}},beforeunload:{postDispatch:function(A){A.result!==void 0&&A.originalEvent&&(A.originalEvent.returnValue=A.result)}}}};function _(A,E,I){if(!I){g.get(A,E)===void 0&&n.event.add(A,E,b);return}g.set(A,E,!1),n.event.add(A,E,{namespace:!1,handler:function(N){var B,C=g.get(this,E);if(N.isTrigger&1&&this[E]){if(C)(n.event.special[E]||{}).delegateType&&N.stopPropagation();else if(C=v.call(arguments),g.set(this,E,C),this[E](),B=g.get(this,E),g.set(this,E,!1),C!==B)return N.stopImmediatePropagation(),N.preventDefault(),B}else C&&(g.set(this,E,n.event.trigger(C[0],C.slice(1),this)),N.stopPropagation(),N.isImmediatePropagationStopped=b)}})}return n.removeEvent=function(A,E,I){A.removeEventListener&&A.removeEventListener(E,I)},n.Event=function(A,E){if(!(this instanceof n.Event))return new n.Event(A,E);A&&A.type?(this.originalEvent=A,this.type=A.type,this.isDefaultPrevented=A.defaultPrevented||A.defaultPrevented===void 0&&A.returnValue===!1?b:y,this.target=A.target&&A.target.nodeType===3?A.target.parentNode:A.target,this.currentTarget=A.currentTarget,this.relatedTarget=A.relatedTarget):this.type=A,E&&n.extend(this,E),this.timeStamp=A&&A.timeStamp||Date.now(),this[n.expando]=!0},n.Event.prototype={constructor:n.Event,isDefaultPrevented:y,isPropagationStopped:y,isImmediatePropagationStopped:y,isSimulated:!1,preventDefault:function(){var A=this.originalEvent;this.isDefaultPrevented=b,A&&!this.isSimulated&&A.preventDefault()},stopPropagation:function(){var A=this.originalEvent;this.isPropagationStopped=b,A&&!this.isSimulated&&A.stopPropagation()},stopImmediatePropagation:function(){var A=this.originalEvent;this.isImmediatePropagationStopped=b,A&&!this.isSimulated&&A.stopImmediatePropagation(),this.stopPropagation()}},n.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},n.event.addProp),n.each({focus:"focusin",blur:"focusout"},function(A,E){function I(N){if(p.documentMode){var B=g.get(this,"handle"),C=n.event.fix(N);C.type=N.type==="focusin"?"focus":"blur",C.isSimulated=!0,B(N),C.target===C.currentTarget&&B(C)}else n.event.simulate(E,N.target,n.event.fix(N))}n.event.special[A]={setup:function(){var N;if(_(this,A,!0),p.documentMode)N=g.get(this,E),N||this.addEventListener(E,I),g.set(this,E,(N||0)+1);else return!1},trigger:function(){return _(this,A),!0},teardown:function(){var N;if(p.documentMode)N=g.get(this,E)-1,N?g.set(this,E,N):(this.removeEventListener(E,I),g.remove(this,E));else return!1},_default:function(N){return g.get(N.target,A)},delegateType:E},n.event.special[E]={setup:function(){var N=this.ownerDocument||this.document||this,B=p.documentMode?this:N,C=g.get(B,E);C||(p.documentMode?this.addEventListener(E,I):N.addEventListener(A,I,!0)),g.set(B,E,(C||0)+1)},teardown:function(){var N=this.ownerDocument||this.document||this,B=p.documentMode?this:N,C=g.get(B,E)-1;C?g.set(B,E,C):(p.documentMode?this.removeEventListener(E,I):N.removeEventListener(A,I,!0),g.remove(B,E))}}}),n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(A,E){n.event.special[A]={delegateType:E,bindType:E,handle:function(I){var N,B=this,C=I.relatedTarget,R=I.handleObj;return(!C||C!==B&&!n.contains(B,C))&&(I.type=R.origType,N=R.handler.apply(this,arguments),I.type=E),N}}}),n.fn.extend({on:function(A,E,I,N){return T(this,A,E,I,N)},one:function(A,E,I,N){return T(this,A,E,I,N,1)},off:function(A,E,I){var N,B;if(A&&A.preventDefault&&A.handleObj)return N=A.handleObj,n(A.delegateTarget).off(N.namespace?N.origType+"."+N.namespace:N.origType,N.selector,N.handler),this;if(typeof A=="object"){for(B in A)this.off(B,E,A[B]);return this}return(E===!1||typeof E=="function")&&(I=E,E=void 0),I===!1&&(I=y),this.each(function(){n.event.remove(this,A,I,E)})}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},3985:(P,h,i)=>{var l,r;l=[i(8411),i(8543),i(9192),i(8149),i(1402),i(1382),i(7346),i(8926)],r=function(n,p,m,f,o,u,v){"use strict";var s=/^(?:focusinfocus|focusoutblur)$/,g=function(d){d.stopPropagation()};return n.extend(n.event,{trigger:function(d,c,b,y){var T,_,A,E,I,N,B,C,R=[b||p],w=o.call(d,"type")?d.type:d,D=o.call(d,"namespace")?d.namespace.split("."):[];if(_=C=A=b=b||p,!(b.nodeType===3||b.nodeType===8)&&!s.test(w+n.event.triggered)&&(w.indexOf(".")>-1&&(D=w.split("."),w=D.shift(),D.sort()),I=w.indexOf(":")<0&&"on"+w,d=d[n.expando]?d:new n.Event(w,typeof d=="object"&&d),d.isTrigger=y?2:3,d.namespace=D.join("."),d.rnamespace=d.namespace?new RegExp("(^|\\.)"+D.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,d.result=void 0,d.target||(d.target=b),c=c==null?[d]:n.makeArray(c,[d]),B=n.event.special[w]||{},!(!y&&B.trigger&&B.trigger.apply(b,c)===!1))){if(!y&&!B.noBubble&&!v(b)){for(E=B.delegateType||w,s.test(E+w)||(_=_.parentNode);_;_=_.parentNode)R.push(_),A=_;A===(b.ownerDocument||p)&&R.push(A.defaultView||A.parentWindow||window)}for(T=0;(_=R[T++])&&!d.isPropagationStopped();)C=_,d.type=T>1?E:B.bindType||w,N=(m.get(_,"events")||Object.create(null))[d.type]&&m.get(_,"handle"),N&&N.apply(_,c),N=I&&_[I],N&&N.apply&&f(_)&&(d.result=N.apply(_,c),d.result===!1&&d.preventDefault());return d.type=w,!y&&!d.isDefaultPrevented()&&(!B._default||B._default.apply(R.pop(),c)===!1)&&f(b)&&I&&u(b[w])&&!v(b)&&(A=b[I],A&&(b[I]=null),n.event.triggered=w,d.isPropagationStopped()&&C.addEventListener(w,g),b[w](),d.isPropagationStopped()&&C.removeEventListener(w,g),n.event.triggered=void 0,A&&(b[I]=A)),d.result}},simulate:function(d,c,b){var y=n.extend(new n.Event,b,{type:d,isSimulated:!0});n.event.trigger(y,null,c)}}),n.fn.extend({trigger:function(d,c){return this.each(function(){n.event.trigger(d,c,this)})},triggerHandler:function(d,c){var b=this[0];if(b)return n.event.trigger(d,c,b,!0)}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},336:(P,h,i)=>{var l,r,l,r;l=[i(8411)],r=function(n){"use strict";l=[],r=function(){return n}.apply(h,l),r!==void 0&&(P.exports=r)}.apply(h,l),r!==void 0&&(P.exports=r)},2155:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";var p=window.jQuery,m=window.$;n.noConflict=function(f){return window.$===n&&(window.$=m),f&&window.jQuery===n&&(window.jQuery=p),n},typeof noGlobal=="undefined"&&(window.jQuery=window.$=n)}.apply(h,l),r!==void 0&&(P.exports=r)},2726:(P,h,i)=>{var l,r;l=[i(8411),i(4553),i(2569),i(3682),i(6599),i(5850),i(1791),i(7076),i(1801),i(981),i(5549),i(8926),i(7957),i(1580),i(5868),i(9229),i(1896),i(3040),i(9978),i(4895),i(8498),i(4139),i(9165),i(1074),i(3814),i(2512),i(5547),i(7651),i(4041),i(6353),i(336),i(2155)],r=function(n){"use strict";return n}.apply(h,l),r!==void 0&&(P.exports=r)},7957:(P,h,i)=>{var l,r;l=[i(8411),i(5194),i(8305),i(1382),i(7298),i(8404),i(6756),i(211),i(1193),i(1044),i(4143),i(759),i(7414),i(4773),i(9192),i(7814),i(8149),i(2710),i(9773),i(9340),i(2569),i(4553),i(8926)],r=function(n,p,m,f,o,u,v,s,g,d,c,b,y,T,_,A,E,I,N){"use strict";var B=/<script|<style|<link/i,C=/checked\s*(?:[^=]|=\s*.checked.)/i,R=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function w(H,K){return N(H,"table")&&N(K.nodeType!==11?K:K.firstChild,"tr")&&n(H).children("tbody")[0]||H}function D(H){return H.type=(H.getAttribute("type")!==null)+"/"+H.type,H}function k(H){return(H.type||"").slice(0,5)==="true/"?H.type=H.type.slice(5):H.removeAttribute("type"),H}function G(H,K){var U,Z,ie,ue,J,be,Ae;if(K.nodeType===1){if(_.hasData(H)&&(ue=_.get(H),Ae=ue.events,Ae)){_.remove(K,"handle events");for(ie in Ae)for(U=0,Z=Ae[ie].length;U<Z;U++)n.event.add(K,ie,Ae[ie][U])}A.hasData(H)&&(J=A.access(H),be=n.extend({},J),A.set(K,be))}}function W(H,K){var U=K.nodeName.toLowerCase();U==="input"&&u.test(H.type)?K.checked=H.checked:(U==="input"||U==="textarea")&&(K.defaultValue=H.defaultValue)}function L(H,K,U,Z){K=m(K);var ie,ue,J,be,Ae,Se,Xe=0,dt=H.length,bt=dt-1,At=K[0],Rt=f(At);if(Rt||dt>1&&typeof At=="string"&&!T.checkClone&&C.test(At))return H.each(function(fe){var xe=H.eq(fe);Rt&&(K[0]=At.call(this,fe,xe.html())),L(xe,K,U,Z)});if(dt&&(ie=y(K,H[0].ownerDocument,!1,H,Z),ue=ie.firstChild,ie.childNodes.length===1&&(ie=ue),ue||Z)){for(J=n.map(c(ie,"script"),D),be=J.length;Xe<dt;Xe++)Ae=ie,Xe!==bt&&(Ae=n.clone(Ae,!0,!0),be&&n.merge(J,c(Ae,"script"))),U.call(H[Xe],Ae,Xe);if(be)for(Se=J[J.length-1].ownerDocument,n.map(J,k),Xe=0;Xe<be;Xe++)Ae=J[Xe],g.test(Ae.type||"")&&!_.access(Ae,"globalEval")&&n.contains(Se,Ae)&&(Ae.src&&(Ae.type||"").toLowerCase()!=="module"?n._evalUrl&&!Ae.noModule&&n._evalUrl(Ae.src,{nonce:Ae.nonce||Ae.getAttribute("nonce")},Se):I(Ae.textContent.replace(R,""),Ae,Se))}return H}function F(H,K,U){for(var Z,ie=K?n.filter(K,H):H,ue=0;(Z=ie[ue])!=null;ue++)!U&&Z.nodeType===1&&n.cleanData(c(Z)),Z.parentNode&&(U&&p(Z)&&b(c(Z,"script")),Z.parentNode.removeChild(Z));return H}return n.extend({htmlPrefilter:function(H){return H},clone:function(H,K,U){var Z,ie,ue,J,be=H.cloneNode(!0),Ae=p(H);if(!T.noCloneChecked&&(H.nodeType===1||H.nodeType===11)&&!n.isXMLDoc(H))for(J=c(be),ue=c(H),Z=0,ie=ue.length;Z<ie;Z++)W(ue[Z],J[Z]);if(K)if(U)for(ue=ue||c(H),J=J||c(be),Z=0,ie=ue.length;Z<ie;Z++)G(ue[Z],J[Z]);else G(H,be);return J=c(be,"script"),J.length>0&&b(J,!Ae&&c(H,"script")),be},cleanData:function(H){for(var K,U,Z,ie=n.event.special,ue=0;(U=H[ue])!==void 0;ue++)if(E(U)){if(K=U[_.expando]){if(K.events)for(Z in K.events)ie[Z]?n.event.remove(U,Z):n.removeEvent(U,Z,K.handle);U[_.expando]=void 0}U[A.expando]&&(U[A.expando]=void 0)}}}),n.fn.extend({detach:function(H){return F(this,H,!0)},remove:function(H){return F(this,H)},text:function(H){return v(this,function(K){return K===void 0?n.text(this):this.empty().each(function(){(this.nodeType===1||this.nodeType===11||this.nodeType===9)&&(this.textContent=K)})},null,H,arguments.length)},append:function(){return L(this,arguments,function(H){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var K=w(this,H);K.appendChild(H)}})},prepend:function(){return L(this,arguments,function(H){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var K=w(this,H);K.insertBefore(H,K.firstChild)}})},before:function(){return L(this,arguments,function(H){this.parentNode&&this.parentNode.insertBefore(H,this)})},after:function(){return L(this,arguments,function(H){this.parentNode&&this.parentNode.insertBefore(H,this.nextSibling)})},empty:function(){for(var H,K=0;(H=this[K])!=null;K++)H.nodeType===1&&(n.cleanData(c(H,!1)),H.textContent="");return this},clone:function(H,K){return H=H==null?!1:H,K=K==null?H:K,this.map(function(){return n.clone(this,H,K)})},html:function(H){return v(this,function(K){var U=this[0]||{},Z=0,ie=this.length;if(K===void 0&&U.nodeType===1)return U.innerHTML;if(typeof K=="string"&&!B.test(K)&&!d[(s.exec(K)||["",""])[1].toLowerCase()]){K=n.htmlPrefilter(K);try{for(;Z<ie;Z++)U=this[Z]||{},U.nodeType===1&&(n.cleanData(c(U,!1)),U.innerHTML=K);U=0}catch(ue){}}U&&this.empty().append(K)},null,H,arguments.length)},replaceWith:function(){var H=[];return L(this,arguments,function(K){var U=this.parentNode;n.inArray(this,H)<0&&(n.cleanData(c(this)),U&&U.replaceChild(K,this))},H)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(H,K){n.fn[H]=function(U){for(var Z,ie=[],ue=n(U),J=ue.length-1,be=0;be<=J;be++)Z=be===J?this:this.clone(!0),n(ue[be])[K](Z),o.apply(ie,Z.get());return this.pushStack(ie)}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},1580:(P,h,i)=>{var l,r;l=[i(9978)],r=function(n){"use strict";return n._evalUrl=function(p,m,f){return n.ajax({url:p,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(o){n.globalEval(o,m,f)}})},n._evalUrl}.apply(h,l),r!==void 0&&(P.exports=r)},7414:(P,h,i)=>{var l,r;l=[i(8411),i(8519),i(5194),i(211),i(1193),i(1044),i(4143),i(759)],r=function(n,p,m,f,o,u,v,s){"use strict";var g=/<|&#?\w+;/;function d(c,b,y,T,_){for(var A,E,I,N,B,C,R=b.createDocumentFragment(),w=[],D=0,k=c.length;D<k;D++)if(A=c[D],A||A===0)if(p(A)==="object")n.merge(w,A.nodeType?[A]:A);else if(!g.test(A))w.push(b.createTextNode(A));else{for(E=E||R.appendChild(b.createElement("div")),I=(f.exec(A)||["",""])[1].toLowerCase(),N=u[I]||u._default,E.innerHTML=N[1]+n.htmlPrefilter(A)+N[2],C=N[0];C--;)E=E.lastChild;n.merge(w,E.childNodes),E=R.firstChild,E.textContent=""}for(R.textContent="",D=0;A=w[D++];){if(T&&n.inArray(A,T)>-1){_&&_.push(A);continue}if(B=m(A),E=v(R.appendChild(A),"script"),B&&s(E),y)for(C=0;A=E[C++];)o.test(A.type||"")&&y.push(A)}return R}return d}.apply(h,l),r!==void 0&&(P.exports=r)},4143:(P,h,i)=>{var l,r;l=[i(8411),i(9773)],r=function(n,p){"use strict";function m(f,o){var u;return typeof f.getElementsByTagName!="undefined"?u=f.getElementsByTagName(o||"*"):typeof f.querySelectorAll!="undefined"?u=f.querySelectorAll(o||"*"):u=[],o===void 0||o&&p(f,o)?n.merge([f],u):u}return m}.apply(h,l),r!==void 0&&(P.exports=r)},759:(P,h,i)=>{var l,r;l=[i(9192)],r=function(n){"use strict";function p(m,f){for(var o=0,u=m.length;o<u;o++)n.set(m[o],"globalEval",!f||n.get(f[o],"globalEval"))}return p}.apply(h,l),r!==void 0&&(P.exports=r)},4773:(P,h,i)=>{var l,r;l=[i(8543),i(107)],r=function(n,p){"use strict";return function(){var m=n.createDocumentFragment(),f=m.appendChild(n.createElement("div")),o=n.createElement("input");o.setAttribute("type","radio"),o.setAttribute("checked","checked"),o.setAttribute("name","t"),f.appendChild(o),p.checkClone=f.cloneNode(!0).cloneNode(!0).lastChild.checked,f.innerHTML="<textarea>x</textarea>",p.noCloneChecked=!!f.cloneNode(!0).lastChild.defaultValue,f.innerHTML="<option></option>",p.option=!!f.lastChild}(),p}.apply(h,l),r!==void 0&&(P.exports=r)},1193:(P,h,i)=>{var l;l=function(){"use strict";return/^$|^module$|\/(?:java|ecma)script/i}.call(h,i,h,P),l!==void 0&&(P.exports=l)},211:(P,h,i)=>{var l;l=function(){"use strict";return/<([a-z][^\/\0>\x20\t\r\n\f]*)/i}.call(h,i,h,P),l!==void 0&&(P.exports=l)},1044:(P,h,i)=>{var l,r;l=[i(4773)],r=function(n){"use strict";var p={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};return p.tbody=p.tfoot=p.colgroup=p.caption=p.thead,p.th=p.td,n.option||(p.optgroup=p.option=[1,"<select multiple='multiple'>","</select>"]),p}.apply(h,l),r!==void 0&&(P.exports=r)},7651:(P,h,i)=>{var l,r;l=[i(8411),i(6756),i(7623),i(1382),i(945),i(9617),i(3629),i(541),i(7346),i(9340),i(9229),i(4553)],r=function(n,p,m,f,o,u,v,s,g){"use strict";return n.offset={setOffset:function(d,c,b){var y,T,_,A,E,I,N,B=n.css(d,"position"),C=n(d),R={};B==="static"&&(d.style.position="relative"),E=C.offset(),_=n.css(d,"top"),I=n.css(d,"left"),N=(B==="absolute"||B==="fixed")&&(_+I).indexOf("auto")>-1,N?(y=C.position(),A=y.top,T=y.left):(A=parseFloat(_)||0,T=parseFloat(I)||0),f(c)&&(c=c.call(d,b,n.extend({},E))),c.top!=null&&(R.top=c.top-E.top+A),c.left!=null&&(R.left=c.left-E.left+T),"using"in c?c.using.call(d,R):C.css(R)}},n.fn.extend({offset:function(d){if(arguments.length)return d===void 0?this:this.each(function(T){n.offset.setOffset(this,d,T)});var c,b,y=this[0];if(y)return y.getClientRects().length?(c=y.getBoundingClientRect(),b=y.ownerDocument.defaultView,{top:c.top+b.pageYOffset,left:c.left+b.pageXOffset}):{top:0,left:0}},position:function(){if(this[0]){var d,c,b,y=this[0],T={top:0,left:0};if(n.css(y,"position")==="fixed")c=y.getBoundingClientRect();else{for(c=this.offset(),b=y.ownerDocument,d=y.offsetParent||b.documentElement;d&&(d===b.body||d===b.documentElement)&&n.css(d,"position")==="static";)d=d.parentNode;d&&d!==y&&d.nodeType===1&&(T=n(d).offset(),T.top+=n.css(d,"borderTopWidth",!0),T.left+=n.css(d,"borderLeftWidth",!0))}return{top:c.top-T.top-n.css(y,"marginTop",!0),left:c.left-T.left-n.css(y,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var d=this.offsetParent;d&&n.css(d,"position")==="static";)d=d.offsetParent;return d||m})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(d,c){var b=c==="pageYOffset";n.fn[d]=function(y){return p(this,function(T,_,A){var E;if(g(T)?E=T:T.nodeType===9&&(E=T.defaultView),A===void 0)return E?E[c]:T[_];E?E.scrollTo(b?E.pageXOffset:A,b?A:E.pageYOffset):T[_]=A},d,y,arguments.length)}}),n.each(["top","left"],function(d,c){n.cssHooks[c]=v(s.pixelPosition,function(b,y){if(y)return y=u(b,c),o.test(y)?n(b).position()[c]+"px":y})}),n}.apply(h,l),r!==void 0&&(P.exports=r)},1801:(P,h,i)=>{var l,r;l=[i(8411),i(9192),i(6599),i(3682)],r=function(n,p){"use strict";return n.extend({queue:function(m,f,o){var u;if(m)return f=(f||"fx")+"queue",u=p.get(m,f),o&&(!u||Array.isArray(o)?u=p.access(m,f,n.makeArray(o)):u.push(o)),u||[]},dequeue:function(m,f){f=f||"fx";var o=n.queue(m,f),u=o.length,v=o.shift(),s=n._queueHooks(m,f),g=function(){n.dequeue(m,f)};v==="inprogress"&&(v=o.shift(),u--),v&&(f==="fx"&&o.unshift("inprogress"),delete s.stop,v.call(m,g,s)),!u&&s&&s.empty.fire()},_queueHooks:function(m,f){var o=f+"queueHooks";return p.get(m,o)||p.access(m,o,{empty:n.Callbacks("once memory").add(function(){p.remove(m,[f+"queue",o])})})}}),n.fn.extend({queue:function(m,f){var o=2;return typeof m!="string"&&(f=m,m="fx",o--),arguments.length<o?n.queue(this[0],m):f===void 0?this:this.each(function(){var u=n.queue(this,m,f);n._queueHooks(this,m),m==="fx"&&u[0]!=="inprogress"&&n.dequeue(this,m)})},dequeue:function(m){return this.each(function(){n.dequeue(this,m)})},clearQueue:function(m){return this.queue(m||"fx",[])},promise:function(m,f){var o,u=1,v=n.Deferred(),s=this,g=this.length,d=function(){--u||v.resolveWith(s,[s])};for(typeof m!="string"&&(f=m,m=void 0),m=m||"fx";g--;)o=p.get(s[g],m+"queueHooks"),o&&o.empty&&(u++,o.empty.add(d));return d(),v.promise(f)}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},981:(P,h,i)=>{var l,r;l=[i(8411),i(1801),i(2512)],r=function(n){"use strict";return n.fn.delay=function(p,m){return p=n.fx&&n.fx.speeds[p]||p,m=m||"fx",this.queue(m,function(f,o){var u=window.setTimeout(f,p);o.stop=function(){window.clearTimeout(u)}})},n.fn.delay}.apply(h,l),r!==void 0&&(P.exports=r)},4553:(P,h,i)=>{var l,r;l=[i(8411),i(9773),i(2283),i(8543),i(4733),i(1402),i(7507),i(7298),i(5950),i(9518),i(1338),i(9619),i(8919),i(107),i(685),i(7410)],r=function(n,p,m,f,o,u,v,s,g,d,c,b,y,T){"use strict";var _=f,A=s;(function(){var E,I,N,B,C,R=A,w,D,k,G,W,L=n.expando,F=0,H=0,K=ye(),U=ye(),Z=ye(),ie=ye(),ue=function(j,V){return j===V&&(C=!0),0},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",be="(?:\\\\[\\da-fA-F]{1,6}"+b+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",Ae="\\["+b+"*("+be+")(?:"+b+"*([*^$|!~]?=)"+b+`*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(`+be+"))|)"+b+"*\\]",Se=":("+be+`)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|`+Ae+")*)|.*)\\)|)",Xe=new RegExp(b+"+","g"),dt=new RegExp("^"+b+"*,"+b+"*"),bt=new RegExp("^"+b+"*([>+~]|"+b+")"+b+"*"),At=new RegExp(b+"|>"),Rt=new RegExp(Se),fe=new RegExp("^"+be+"$"),xe={ID:new RegExp("^#("+be+")"),CLASS:new RegExp("^\\.("+be+")"),TAG:new RegExp("^("+be+"|[*])"),ATTR:new RegExp("^"+Ae),PSEUDO:new RegExp("^"+Se),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+b+"*(even|odd|(([+-]|)(\\d*)n|)"+b+"*(?:([+-]|)"+b+"*(\\d+)|))"+b+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+b+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+b+"*((?:-\\d)?\\d*)"+b+"*\\)|)(?=[^-]|$)","i")},Te=/^(?:input|select|textarea|button)$/i,Oe=/^h\d$/i,mt=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Ut=/[+~]/,tt=new RegExp("\\\\[\\da-fA-F]{1,6}"+b+"?|\\\\([^\\r\\n\\f])","g"),Me=function(j,V){var Q="0x"+j.slice(1)-65536;return V||(Q<0?String.fromCharCode(Q+65536):String.fromCharCode(Q>>10|55296,Q&1023|56320))},de=function(){ot()},Ce=wt(function(j){return j.disabled===!0&&p(j,"fieldset")},{dir:"parentNode",next:"legend"});function we(){try{return w.activeElement}catch(j){}}try{R.apply(m=g.call(_.childNodes),_.childNodes),m[_.childNodes.length].nodeType}catch(j){R={apply:function(V,Q){A.apply(V,g.call(Q))},call:function(V){A.apply(V,g.call(arguments,1))}}}function X(j,V,Q,ee){var se,ve,Ee,De,Pe,$e,re,ne=V&&V.ownerDocument,pe=V?V.nodeType:9;if(Q=Q||[],typeof j!="string"||!j||pe!==1&&pe!==9&&pe!==11)return Q;if(!ee&&(ot(V),V=V||w,k)){if(pe!==11&&(Pe=mt.exec(j)))if(se=Pe[1]){if(pe===9)if(Ee=V.getElementById(se)){if(Ee.id===se)return R.call(Q,Ee),Q}else return Q;else if(ne&&(Ee=ne.getElementById(se))&&X.contains(V,Ee)&&Ee.id===se)return R.call(Q,Ee),Q}else{if(Pe[2])return R.apply(Q,V.getElementsByTagName(j)),Q;if((se=Pe[3])&&V.getElementsByClassName)return R.apply(Q,V.getElementsByClassName(se)),Q}if(!ie[j+" "]&&(!G||!G.test(j))){if(re=j,ne=V,pe===1&&(At.test(j)||bt.test(j))){for(ne=Ut.test(j)&&et(V.parentNode)||V,(ne!=V||!T.scope)&&((De=V.getAttribute("id"))?De=n.escapeSelector(De):V.setAttribute("id",De=L)),$e=Ht(j),ve=$e.length;ve--;)$e[ve]=(De?"#"+De:":scope")+" "+Lt($e[ve]);re=$e.join(",")}try{return R.apply(Q,ne.querySelectorAll(re)),Q}catch(oe){ie(j,!0)}finally{De===L&&V.removeAttribute("id")}}}return Fn(j.replace(y,"$1"),V,Q,ee)}function ye(){var j=[];function V(Q,ee){return j.push(Q+" ")>I.cacheLength&&delete V[j.shift()],V[Q+" "]=ee}return V}function me(j){return j[L]=!0,j}function ge(j){var V=w.createElement("fieldset");try{return!!j(V)}catch(Q){return!1}finally{V.parentNode&&V.parentNode.removeChild(V),V=null}}function ke(j){return function(V){return p(V,"input")&&V.type===j}}function Ue(j){return function(V){return(p(V,"input")||p(V,"button"))&&V.type===j}}function Ge(j){return function(V){return"form"in V?V.parentNode&&V.disabled===!1?"label"in V?"label"in V.parentNode?V.parentNode.disabled===j:V.disabled===j:V.isDisabled===j||V.isDisabled!==!j&&Ce(V)===j:V.disabled===j:"label"in V?V.disabled===j:!1}}function qe(j){return me(function(V){return V=+V,me(function(Q,ee){for(var se,ve=j([],Q.length,V),Ee=ve.length;Ee--;)Q[se=ve[Ee]]&&(Q[se]=!(ee[se]=Q[se]))})})}function et(j){return j&&typeof j.getElementsByTagName!="undefined"&&j}function ot(j){var V,Q=j?j.ownerDocument||j:_;return Q==w||Q.nodeType!==9||!Q.documentElement||(w=Q,D=w.documentElement,k=!n.isXMLDoc(w),W=D.matches||D.webkitMatchesSelector||D.msMatchesSelector,D.msMatchesSelector&&_!=w&&(V=w.defaultView)&&V.top!==V&&V.addEventListener("unload",de),T.getById=ge(function(ee){return D.appendChild(ee).id=n.expando,!w.getElementsByName||!w.getElementsByName(n.expando).length}),T.disconnectedMatch=ge(function(ee){return W.call(ee,"*")}),T.scope=ge(function(){return w.querySelectorAll(":scope")}),T.cssHas=ge(function(){try{return w.querySelector(":has(*,:jqfake)"),!1}catch(ee){return!0}}),T.getById?(I.filter.ID=function(ee){var se=ee.replace(tt,Me);return function(ve){return ve.getAttribute("id")===se}},I.find.ID=function(ee,se){if(typeof se.getElementById!="undefined"&&k){var ve=se.getElementById(ee);return ve?[ve]:[]}}):(I.filter.ID=function(ee){var se=ee.replace(tt,Me);return function(ve){var Ee=typeof ve.getAttributeNode!="undefined"&&ve.getAttributeNode("id");return Ee&&Ee.value===se}},I.find.ID=function(ee,se){if(typeof se.getElementById!="undefined"&&k){var ve,Ee,De,Pe=se.getElementById(ee);if(Pe){if(ve=Pe.getAttributeNode("id"),ve&&ve.value===ee)return[Pe];for(De=se.getElementsByName(ee),Ee=0;Pe=De[Ee++];)if(ve=Pe.getAttributeNode("id"),ve&&ve.value===ee)return[Pe]}return[]}}),I.find.TAG=function(ee,se){return typeof se.getElementsByTagName!="undefined"?se.getElementsByTagName(ee):se.querySelectorAll(ee)},I.find.CLASS=function(ee,se){if(typeof se.getElementsByClassName!="undefined"&&k)return se.getElementsByClassName(ee)},G=[],ge(function(ee){var se;D.appendChild(ee).innerHTML="<a id='"+L+"' href='' disabled='disabled'></a><select id='"+L+"-\r\\' disabled='disabled'><option selected=''></option></select>",ee.querySelectorAll("[selected]").length||G.push("\\["+b+"*(?:value|"+J+")"),ee.querySelectorAll("[id~="+L+"-]").length||G.push("~="),ee.querySelectorAll("a#"+L+"+*").length||G.push(".#.+[+~]"),ee.querySelectorAll(":checked").length||G.push(":checked"),se=w.createElement("input"),se.setAttribute("type","hidden"),ee.appendChild(se).setAttribute("name","D"),D.appendChild(ee).disabled=!0,ee.querySelectorAll(":disabled").length!==2&&G.push(":enabled",":disabled"),se=w.createElement("input"),se.setAttribute("name",""),ee.appendChild(se),ee.querySelectorAll("[name='']").length||G.push("\\["+b+"*name"+b+"*="+b+`*(?:''|"")`)}),T.cssHas||G.push(":has"),G=G.length&&new RegExp(G.join("|")),ue=function(ee,se){if(ee===se)return C=!0,0;var ve=!ee.compareDocumentPosition-!se.compareDocumentPosition;return ve||(ve=(ee.ownerDocument||ee)==(se.ownerDocument||se)?ee.compareDocumentPosition(se):1,ve&1||!T.sortDetached&&se.compareDocumentPosition(ee)===ve?ee===w||ee.ownerDocument==_&&X.contains(_,ee)?-1:se===w||se.ownerDocument==_&&X.contains(_,se)?1:B?o.call(B,ee)-o.call(B,se):0:ve&4?-1:1)}),w}X.matches=function(j,V){return X(j,null,null,V)},X.matchesSelector=function(j,V){if(ot(j),k&&!ie[V+" "]&&(!G||!G.test(V)))try{var Q=W.call(j,V);if(Q||T.disconnectedMatch||j.document&&j.document.nodeType!==11)return Q}catch(ee){ie(V,!0)}return X(V,w,null,[j]).length>0},X.contains=function(j,V){return(j.ownerDocument||j)!=w&&ot(j),n.contains(j,V)},X.attr=function(j,V){(j.ownerDocument||j)!=w&&ot(j);var Q=I.attrHandle[V.toLowerCase()],ee=Q&&u.call(I.attrHandle,V.toLowerCase())?Q(j,V,!k):void 0;return ee!==void 0?ee:j.getAttribute(V)},X.error=function(j){throw new Error("Syntax error, unrecognized expression: "+j)},n.uniqueSort=function(j){var V,Q=[],ee=0,se=0;if(C=!T.sortStable,B=!T.sortStable&&g.call(j,0),d.call(j,ue),C){for(;V=j[se++];)V===j[se]&&(ee=Q.push(se));for(;ee--;)c.call(j,Q[ee],1)}return B=null,j},n.fn.uniqueSort=function(){return this.pushStack(n.uniqueSort(g.apply(this)))},I=n.expr={cacheLength:50,createPseudo:me,match:xe,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(j){return j[1]=j[1].replace(tt,Me),j[3]=(j[3]||j[4]||j[5]||"").replace(tt,Me),j[2]==="~="&&(j[3]=" "+j[3]+" "),j.slice(0,4)},CHILD:function(j){return j[1]=j[1].toLowerCase(),j[1].slice(0,3)==="nth"?(j[3]||X.error(j[0]),j[4]=+(j[4]?j[5]+(j[6]||1):2*(j[3]==="even"||j[3]==="odd")),j[5]=+(j[7]+j[8]||j[3]==="odd")):j[3]&&X.error(j[0]),j},PSEUDO:function(j){var V,Q=!j[6]&&j[2];return xe.CHILD.test(j[0])?null:(j[3]?j[2]=j[4]||j[5]||"":Q&&Rt.test(Q)&&(V=Ht(Q,!0))&&(V=Q.indexOf(")",Q.length-V)-Q.length)&&(j[0]=j[0].slice(0,V),j[2]=Q.slice(0,V)),j.slice(0,3))}},filter:{TAG:function(j){var V=j.replace(tt,Me).toLowerCase();return j==="*"?function(){return!0}:function(Q){return p(Q,V)}},CLASS:function(j){var V=K[j+" "];return V||(V=new RegExp("(^|"+b+")"+j+"("+b+"|$)"))&&K(j,function(Q){return V.test(typeof Q.className=="string"&&Q.className||typeof Q.getAttribute!="undefined"&&Q.getAttribute("class")||"")})},ATTR:function(j,V,Q){return function(ee){var se=X.attr(ee,j);return se==null?V==="!=":V?(se+="",V==="="?se===Q:V==="!="?se!==Q:V==="^="?Q&&se.indexOf(Q)===0:V==="*="?Q&&se.indexOf(Q)>-1:V==="$="?Q&&se.slice(-Q.length)===Q:V==="~="?(" "+se.replace(Xe," ")+" ").indexOf(Q)>-1:V==="|="?se===Q||se.slice(0,Q.length+1)===Q+"-":!1):!0}},CHILD:function(j,V,Q,ee,se){var ve=j.slice(0,3)!=="nth",Ee=j.slice(-4)!=="last",De=V==="of-type";return ee===1&&se===0?function(Pe){return!!Pe.parentNode}:function(Pe,$e,re){var ne,pe,oe,Ie,Fe,Ne=ve!==Ee?"nextSibling":"previousSibling",pt=Pe.parentNode,St=De&&Pe.nodeName.toLowerCase(),Ct=!re&&!De,gt=!1;if(pt){if(ve){for(;Ne;){for(oe=Pe;oe=oe[Ne];)if(De?p(oe,St):oe.nodeType===1)return!1;Fe=Ne=j==="only"&&!Fe&&"nextSibling"}return!0}if(Fe=[Ee?pt.firstChild:pt.lastChild],Ee&&Ct){for(pe=pt[L]||(pt[L]={}),ne=pe[j]||[],Ie=ne[0]===F&&ne[1],gt=Ie&&ne[2],oe=Ie&&pt.childNodes[Ie];oe=++Ie&&oe&&oe[Ne]||(gt=Ie=0)||Fe.pop();)if(oe.nodeType===1&&++gt&&oe===Pe){pe[j]=[F,Ie,gt];break}}else if(Ct&&(pe=Pe[L]||(Pe[L]={}),ne=pe[j]||[],Ie=ne[0]===F&&ne[1],gt=Ie),gt===!1)for(;(oe=++Ie&&oe&&oe[Ne]||(gt=Ie=0)||Fe.pop())&&!((De?p(oe,St):oe.nodeType===1)&&++gt&&(Ct&&(pe=oe[L]||(oe[L]={}),pe[j]=[F,gt]),oe===Pe)););return gt-=se,gt===ee||gt%ee===0&&gt/ee>=0}}},PSEUDO:function(j,V){var Q,ee=I.pseudos[j]||I.setFilters[j.toLowerCase()]||X.error("unsupported pseudo: "+j);return ee[L]?ee(V):ee.length>1?(Q=[j,j,"",V],I.setFilters.hasOwnProperty(j.toLowerCase())?me(function(se,ve){for(var Ee,De=ee(se,V),Pe=De.length;Pe--;)Ee=o.call(se,De[Pe]),se[Ee]=!(ve[Ee]=De[Pe])}):function(se){return ee(se,0,Q)}):ee}},pseudos:{not:me(function(j){var V=[],Q=[],ee=Tt(j.replace(y,"$1"));return ee[L]?me(function(se,ve,Ee,De){for(var Pe,$e=ee(se,null,De,[]),re=se.length;re--;)(Pe=$e[re])&&(se[re]=!(ve[re]=Pe))}):function(se,ve,Ee){return V[0]=se,ee(V,null,Ee,Q),V[0]=null,!Q.pop()}}),has:me(function(j){return function(V){return X(j,V).length>0}}),contains:me(function(j){return j=j.replace(tt,Me),function(V){return(V.textContent||n.text(V)).indexOf(j)>-1}}),lang:me(function(j){return fe.test(j||"")||X.error("unsupported lang: "+j),j=j.replace(tt,Me).toLowerCase(),function(V){var Q;do if(Q=k?V.lang:V.getAttribute("xml:lang")||V.getAttribute("lang"))return Q=Q.toLowerCase(),Q===j||Q.indexOf(j+"-")===0;while((V=V.parentNode)&&V.nodeType===1);return!1}}),target:function(j){var V=window.location&&window.location.hash;return V&&V.slice(1)===j.id},root:function(j){return j===D},focus:function(j){return j===we()&&w.hasFocus()&&!!(j.type||j.href||~j.tabIndex)},enabled:Ge(!1),disabled:Ge(!0),checked:function(j){return p(j,"input")&&!!j.checked||p(j,"option")&&!!j.selected},selected:function(j){return j.parentNode&&j.parentNode.selectedIndex,j.selected===!0},empty:function(j){for(j=j.firstChild;j;j=j.nextSibling)if(j.nodeType<6)return!1;return!0},parent:function(j){return!I.pseudos.empty(j)},header:function(j){return Oe.test(j.nodeName)},input:function(j){return Te.test(j.nodeName)},button:function(j){return p(j,"input")&&j.type==="button"||p(j,"button")},text:function(j){var V;return p(j,"input")&&j.type==="text"&&((V=j.getAttribute("type"))==null||V.toLowerCase()==="text")},first:qe(function(){return[0]}),last:qe(function(j,V){return[V-1]}),eq:qe(function(j,V,Q){return[Q<0?Q+V:Q]}),even:qe(function(j,V){for(var Q=0;Q<V;Q+=2)j.push(Q);return j}),odd:qe(function(j,V){for(var Q=1;Q<V;Q+=2)j.push(Q);return j}),lt:qe(function(j,V,Q){var ee;for(Q<0?ee=Q+V:Q>V?ee=V:ee=Q;--ee>=0;)j.push(ee);return j}),gt:qe(function(j,V,Q){for(var ee=Q<0?Q+V:Q;++ee<V;)j.push(ee);return j})}},I.pseudos.nth=I.pseudos.eq;for(E in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})I.pseudos[E]=ke(E);for(E in{submit:!0,reset:!0})I.pseudos[E]=Ue(E);function ht(){}ht.prototype=I.filters=I.pseudos,I.setFilters=new ht;function Ht(j,V){var Q,ee,se,ve,Ee,De,Pe,$e=U[j+" "];if($e)return V?0:$e.slice(0);for(Ee=j,De=[],Pe=I.preFilter;Ee;){(!Q||(ee=dt.exec(Ee)))&&(ee&&(Ee=Ee.slice(ee[0].length)||Ee),De.push(se=[])),Q=!1,(ee=bt.exec(Ee))&&(Q=ee.shift(),se.push({value:Q,type:ee[0].replace(y," ")}),Ee=Ee.slice(Q.length));for(ve in I.filter)(ee=xe[ve].exec(Ee))&&(!Pe[ve]||(ee=Pe[ve](ee)))&&(Q=ee.shift(),se.push({value:Q,type:ve,matches:ee}),Ee=Ee.slice(Q.length));if(!Q)break}return V?Ee.length:Ee?X.error(j):U(j,De).slice(0)}function Lt(j){for(var V=0,Q=j.length,ee="";V<Q;V++)ee+=j[V].value;return ee}function wt(j,V,Q){var ee=V.dir,se=V.next,ve=se||ee,Ee=Q&&ve==="parentNode",De=H++;return V.first?function(Pe,$e,re){for(;Pe=Pe[ee];)if(Pe.nodeType===1||Ee)return j(Pe,$e,re);return!1}:function(Pe,$e,re){var ne,pe,oe=[F,De];if(re){for(;Pe=Pe[ee];)if((Pe.nodeType===1||Ee)&&j(Pe,$e,re))return!0}else for(;Pe=Pe[ee];)if(Pe.nodeType===1||Ee)if(pe=Pe[L]||(Pe[L]={}),se&&p(Pe,se))Pe=Pe[ee]||Pe;else{if((ne=pe[ve])&&ne[0]===F&&ne[1]===De)return oe[2]=ne[2];if(pe[ve]=oe,oe[2]=j(Pe,$e,re))return!0}return!1}}function fn(j){return j.length>1?function(V,Q,ee){for(var se=j.length;se--;)if(!j[se](V,Q,ee))return!1;return!0}:j[0]}function dn(j,V,Q){for(var ee=0,se=V.length;ee<se;ee++)X(j,V[ee],Q);return Q}function wn(j,V,Q,ee,se){for(var ve,Ee=[],De=0,Pe=j.length,$e=V!=null;De<Pe;De++)(ve=j[De])&&(!Q||Q(ve,ee,se))&&(Ee.push(ve),$e&&V.push(De));return Ee}function kn(j,V,Q,ee,se,ve){return ee&&!ee[L]&&(ee=kn(ee)),se&&!se[L]&&(se=kn(se,ve)),me(function(Ee,De,Pe,$e){var re,ne,pe,oe,Ie=[],Fe=[],Ne=De.length,pt=Ee||dn(V||"*",Pe.nodeType?[Pe]:Pe,[]),St=j&&(Ee||!V)?wn(pt,Ie,j,Pe,$e):pt;if(Q?(oe=se||(Ee?j:Ne||ee)?[]:De,Q(St,oe,Pe,$e)):oe=St,ee)for(re=wn(oe,Fe),ee(re,[],Pe,$e),ne=re.length;ne--;)(pe=re[ne])&&(oe[Fe[ne]]=!(St[Fe[ne]]=pe));if(Ee){if(se||j){if(se){for(re=[],ne=oe.length;ne--;)(pe=oe[ne])&&re.push(St[ne]=pe);se(null,oe=[],re,$e)}for(ne=oe.length;ne--;)(pe=oe[ne])&&(re=se?o.call(Ee,pe):Ie[ne])>-1&&(Ee[re]=!(De[re]=pe))}}else oe=wn(oe===De?oe.splice(Ne,oe.length):oe),se?se(null,De,oe,$e):R.apply(De,oe)})}function Ft(j){for(var V,Q,ee,se=j.length,ve=I.relative[j[0].type],Ee=ve||I.relative[" "],De=ve?1:0,Pe=wt(function(ne){return ne===V},Ee,!0),$e=wt(function(ne){return o.call(V,ne)>-1},Ee,!0),re=[function(ne,pe,oe){var Ie=!ve&&(oe||pe!=N)||((V=pe).nodeType?Pe(ne,pe,oe):$e(ne,pe,oe));return V=null,Ie}];De<se;De++)if(Q=I.relative[j[De].type])re=[wt(fn(re),Q)];else{if(Q=I.filter[j[De].type].apply(null,j[De].matches),Q[L]){for(ee=++De;ee<se&&!I.relative[j[ee].type];ee++);return kn(De>1&&fn(re),De>1&&Lt(j.slice(0,De-1).concat({value:j[De-2].type===" "?"*":""})).replace(y,"$1"),Q,De<ee&&Ft(j.slice(De,ee)),ee<se&&Ft(j=j.slice(ee)),ee<se&&Lt(j))}re.push(Q)}return fn(re)}function Hn(j,V){var Q=V.length>0,ee=j.length>0,se=function(ve,Ee,De,Pe,$e){var re,ne,pe,oe=0,Ie="0",Fe=ve&&[],Ne=[],pt=N,St=ve||ee&&I.find.TAG("*",$e),Ct=F+=pt==null?1:Math.random()||.1,gt=St.length;for($e&&(N=Ee==w||Ee||$e);Ie!==gt&&(re=St[Ie])!=null;Ie++){if(ee&&re){for(ne=0,!Ee&&re.ownerDocument!=w&&(ot(re),De=!k);pe=j[ne++];)if(pe(re,Ee||w,De)){R.call(Pe,re);break}$e&&(F=Ct)}Q&&((re=!pe&&re)&&oe--,ve&&Fe.push(re))}if(oe+=Ie,Q&&Ie!==oe){for(ne=0;pe=V[ne++];)pe(Fe,Ne,Ee,De);if(ve){if(oe>0)for(;Ie--;)Fe[Ie]||Ne[Ie]||(Ne[Ie]=v.call(Pe));Ne=wn(Ne)}R.apply(Pe,Ne),$e&&!ve&&Ne.length>0&&oe+V.length>1&&n.uniqueSort(Pe)}return $e&&(F=Ct,N=pt),Fe};return Q?me(se):se}function Tt(j,V){var Q,ee=[],se=[],ve=Z[j+" "];if(!ve){for(V||(V=Ht(j)),Q=V.length;Q--;)ve=Ft(V[Q]),ve[L]?ee.push(ve):se.push(ve);ve=Z(j,Hn(se,ee)),ve.selector=j}return ve}function Fn(j,V,Q,ee){var se,ve,Ee,De,Pe,$e=typeof j=="function"&&j,re=!ee&&Ht(j=$e.selector||j);if(Q=Q||[],re.length===1){if(ve=re[0]=re[0].slice(0),ve.length>2&&(Ee=ve[0]).type==="ID"&&V.nodeType===9&&k&&I.relative[ve[1].type]){if(V=(I.find.ID(Ee.matches[0].replace(tt,Me),V)||[])[0],V)$e&&(V=V.parentNode);else return Q;j=j.slice(ve.shift().value.length)}for(se=xe.needsContext.test(j)?0:ve.length;se--&&(Ee=ve[se],!I.relative[De=Ee.type]);)if((Pe=I.find[De])&&(ee=Pe(Ee.matches[0].replace(tt,Me),Ut.test(ve[0].type)&&et(V.parentNode)||V))){if(ve.splice(se,1),j=ee.length&&Lt(ve),!j)return R.apply(Q,ee),Q;break}}return($e||Tt(j,re))(ee,V,!k,Q,!V||Ut.test(j)&&et(V.parentNode)||V),Q}T.sortStable=L.split("").sort(ue).join("")===L,ot(),T.sortDetached=ge(function(j){return j.compareDocumentPosition(w.createElement("fieldset"))&1}),n.find=X,n.expr[":"]=n.expr.pseudos,n.unique=n.uniqueSort,X.compile=Tt,X.select=Fn,X.setDocument=ot,X.tokenize=Ht,X.escape=n.escapeSelector,X.getText=n.text,X.isXML=n.isXMLDoc,X.selectors=n.expr,X.support=n.support,X.uniqueSort=n.uniqueSort})()}.apply(h,l),r!==void 0&&(P.exports=r)},685:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";n.contains=function(p,m){var f=m&&m.parentNode;return p===f||!!(f&&f.nodeType===1&&(p.contains?p.contains(f):p.compareDocumentPosition&&p.compareDocumentPosition(f)&16))}}.apply(h,l),r!==void 0&&(P.exports=r)},7410:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";var p=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function m(f,o){return o?f==="\0"?"\uFFFD":f.slice(0,-1)+"\\"+f.charCodeAt(f.length-1).toString(16)+" ":"\\"+f}n.escapeSelector=function(f){return(f+"").replace(p,m)}}.apply(h,l),r!==void 0&&(P.exports=r)},3040:(P,h,i)=>{var l,r;l=[i(8411),i(8519),i(8404),i(1382),i(9340),i(2569),i(5933)],r=function(n,p,m,f){"use strict";var o=/\[\]$/,u=/\r?\n/g,v=/^(?:submit|button|image|reset|file)$/i,s=/^(?:input|select|textarea|keygen)/i;function g(d,c,b,y){var T;if(Array.isArray(c))n.each(c,function(_,A){b||o.test(d)?y(d,A):g(d+"["+(typeof A=="object"&&A!=null?_:"")+"]",A,b,y)});else if(!b&&p(c)==="object")for(T in c)g(d+"["+T+"]",c[T],b,y);else y(d,c)}return n.param=function(d,c){var b,y=[],T=function(_,A){var E=f(A)?A():A;y[y.length]=encodeURIComponent(_)+"="+encodeURIComponent(E==null?"":E)};if(d==null)return"";if(Array.isArray(d)||d.jquery&&!n.isPlainObject(d))n.each(d,function(){T(this.name,this.value)});else for(b in d)g(b,d[b],c,T);return y.join("&")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var d=n.prop(this,"elements");return d?n.makeArray(d):this}).filter(function(){var d=this.type;return this.name&&!n(this).is(":disabled")&&s.test(this.nodeName)&&!v.test(d)&&(this.checked||!m.test(d))}).map(function(d,c){var b=n(this).val();return b==null?null:Array.isArray(b)?n.map(b,function(y){return{name:c.name,value:y.replace(u,`\r
`)}}):{name:c.name,value:b.replace(u,`\r
`)}}).get()}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},2569:(P,h,i)=>{var l,r;l=[i(8411),i(2332),i(4733),i(8811),i(3617),i(2998),i(9773),i(9340),i(8269),i(4553)],r=function(n,p,m,f,o,u,v){"use strict";var s=/^(?:parents|prev(?:Until|All))/,g={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(c){var b=n(c,this),y=b.length;return this.filter(function(){for(var T=0;T<y;T++)if(n.contains(this,b[T]))return!0})},closest:function(c,b){var y,T=0,_=this.length,A=[],E=typeof c!="string"&&n(c);if(!u.test(c)){for(;T<_;T++)for(y=this[T];y&&y!==b;y=y.parentNode)if(y.nodeType<11&&(E?E.index(y)>-1:y.nodeType===1&&n.find.matchesSelector(y,c))){A.push(y);break}}return this.pushStack(A.length>1?n.uniqueSort(A):A)},index:function(c){return c?typeof c=="string"?m.call(n(c),this[0]):m.call(this,c.jquery?c[0]:c):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(c,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(c,b))))},addBack:function(c){return this.add(c==null?this.prevObject:this.prevObject.filter(c))}});function d(c,b){for(;(c=c[b])&&c.nodeType!==1;);return c}return n.each({parent:function(c){var b=c.parentNode;return b&&b.nodeType!==11?b:null},parents:function(c){return f(c,"parentNode")},parentsUntil:function(c,b,y){return f(c,"parentNode",y)},next:function(c){return d(c,"nextSibling")},prev:function(c){return d(c,"previousSibling")},nextAll:function(c){return f(c,"nextSibling")},prevAll:function(c){return f(c,"previousSibling")},nextUntil:function(c,b,y){return f(c,"nextSibling",y)},prevUntil:function(c,b,y){return f(c,"previousSibling",y)},siblings:function(c){return o((c.parentNode||{}).firstChild,c)},children:function(c){return o(c.firstChild)},contents:function(c){return c.contentDocument!=null&&p(c.contentDocument)?c.contentDocument:(v(c,"template")&&(c=c.content||c),n.merge([],c.childNodes))}},function(c,b){n.fn[c]=function(y,T){var _=n.map(this,b,y);return c.slice(-5)!=="Until"&&(T=y),T&&typeof T=="string"&&(_=n.filter(T,_)),this.length>1&&(g[c]||n.uniqueSort(_),s.test(c)&&_.reverse()),this.pushStack(_)}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},8269:(P,h,i)=>{var l,r;l=[i(8411),i(4733),i(1382),i(2998),i(4553)],r=function(n,p,m,f){"use strict";function o(u,v,s){return m(v)?n.grep(u,function(g,d){return!!v.call(g,d,g)!==s}):v.nodeType?n.grep(u,function(g){return g===v!==s}):typeof v!="string"?n.grep(u,function(g){return p.call(v,g)>-1!==s}):n.filter(v,u,s)}n.filter=function(u,v,s){var g=v[0];return s&&(u=":not("+u+")"),v.length===1&&g.nodeType===1?n.find.matchesSelector(g,u)?[g]:[]:n.find.matches(u,n.grep(v,function(d){return d.nodeType===1}))},n.fn.extend({find:function(u){var v,s,g=this.length,d=this;if(typeof u!="string")return this.pushStack(n(u).filter(function(){for(v=0;v<g;v++)if(n.contains(d[v],this))return!0}));for(s=this.pushStack([]),v=0;v<g;v++)n.find(u,d[v],s);return g>1?n.uniqueSort(s):s},filter:function(u){return this.pushStack(o(this,u||[],!1))},not:function(u){return this.pushStack(o(this,u||[],!0))},is:function(u){return!!o(this,typeof u=="string"&&f.test(u)?n(u):u||[],!1).length}})}.apply(h,l),r!==void 0&&(P.exports=r)},8811:(P,h,i)=>{var l,r;l=[i(8411)],r=function(n){"use strict";return function(p,m,f){for(var o=[],u=f!==void 0;(p=p[m])&&p.nodeType!==9;)if(p.nodeType===1){if(u&&n(p).is(f))break;o.push(p)}return o}}.apply(h,l),r!==void 0&&(P.exports=r)},2998:(P,h,i)=>{var l,r;l=[i(8411),i(4553)],r=function(n){"use strict";return n.expr.match.needsContext}.apply(h,l),r!==void 0&&(P.exports=r)},3617:(P,h,i)=>{var l;l=function(){"use strict";return function(r,n){for(var p=[];r;r=r.nextSibling)r.nodeType===1&&r!==n&&p.push(r);return p}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},8928:(P,h,i)=>{var l,r;l=[i(2122)],r=function(n){"use strict";return n.call(Object)}.apply(h,l),r!==void 0&&(P.exports=r)},2283:(P,h,i)=>{var l;l=function(){"use strict";return[]}.call(h,i,h,P),l!==void 0&&(P.exports=l)},8320:(P,h,i)=>{var l;l=function(){"use strict";return{}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},8543:(P,h,i)=>{var l;l=function(){"use strict";return window.document}.call(h,i,h,P),l!==void 0&&(P.exports=l)},7623:(P,h,i)=>{var l,r;l=[i(8543)],r=function(n){"use strict";return n.documentElement}.apply(h,l),r!==void 0&&(P.exports=r)},8305:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.flat?function(p){return n.flat.call(p)}:function(p){return n.concat.apply([],p)}}.apply(h,l),r!==void 0&&(P.exports=r)},2122:(P,h,i)=>{var l,r;l=[i(1402)],r=function(n){"use strict";return n.toString}.apply(h,l),r!==void 0&&(P.exports=r)},2332:(P,h,i)=>{var l;l=function(){"use strict";return Object.getPrototypeOf}.call(h,i,h,P),l!==void 0&&(P.exports=l)},1402:(P,h,i)=>{var l,r;l=[i(8320)],r=function(n){"use strict";return n.hasOwnProperty}.apply(h,l),r!==void 0&&(P.exports=r)},4733:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.indexOf}.apply(h,l),r!==void 0&&(P.exports=r)},1382:(P,h,i)=>{var l;l=function(){"use strict";return function(n){return typeof n=="function"&&typeof n.nodeType!="number"&&typeof n.item!="function"}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},7346:(P,h,i)=>{var l;l=function(){"use strict";return function(n){return n!=null&&n===n.window}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},210:(P,h,i)=>{var l;l=function(){"use strict";return/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source}.call(h,i,h,P),l!==void 0&&(P.exports=l)},7507:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.pop}.apply(h,l),r!==void 0&&(P.exports=r)},7298:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.push}.apply(h,l),r!==void 0&&(P.exports=r)},8404:(P,h,i)=>{var l;l=function(){"use strict";return/^(?:checkbox|radio)$/i}.call(h,i,h,P),l!==void 0&&(P.exports=l)},403:(P,h,i)=>{var l,r;l=[i(210)],r=function(n){"use strict";return new RegExp("^(?:([+-])=|)("+n+")([a-z%]*)$","i")}.apply(h,l),r!==void 0&&(P.exports=r)},9091:(P,h,i)=>{var l;l=function(){"use strict";return/[^\x20\t\r\n\f]+/g}.call(h,i,h,P),l!==void 0&&(P.exports=l)},8919:(P,h,i)=>{var l,r;l=[i(9619)],r=function(n){"use strict";return new RegExp("^"+n+"+|((?:^|[^\\\\])(?:\\\\.)*)"+n+"+$","g")}.apply(h,l),r!==void 0&&(P.exports=r)},5950:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.slice}.apply(h,l),r!==void 0&&(P.exports=r)},9518:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.sort}.apply(h,l),r!==void 0&&(P.exports=r)},1338:(P,h,i)=>{var l,r;l=[i(2283)],r=function(n){"use strict";return n.splice}.apply(h,l),r!==void 0&&(P.exports=r)},107:(P,h,i)=>{var l;l=function(){"use strict";return{}}.call(h,i,h,P),l!==void 0&&(P.exports=l)},4122:(P,h,i)=>{var l,r;l=[i(8320)],r=function(n){"use strict";return n.toString}.apply(h,l),r!==void 0&&(P.exports=r)},9619:(P,h,i)=>{var l;l=function(){"use strict";return"[\\x20\\t\\r\\n\\f]"}.call(h,i,h,P),l!==void 0&&(P.exports=l)},5868:(P,h,i)=>{var l,r;l=[i(8411),i(1382),i(9340),i(7957),i(2569)],r=function(n,p){"use strict";return n.fn.extend({wrapAll:function(m){var f;return this[0]&&(p(m)&&(m=m.call(this[0])),f=n(m,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&f.insertBefore(this[0]),f.map(function(){for(var o=this;o.firstElementChild;)o=o.firstElementChild;return o}).append(this)),this},wrapInner:function(m){return p(m)?this.each(function(f){n(this).wrapInner(m.call(this,f))}):this.each(function(){var f=n(this),o=f.contents();o.length?o.wrapAll(m):f.append(m)})},wrap:function(m){var f=p(m);return this.each(function(o){n(this).wrapAll(f?m.call(this,o):m)})},unwrap:function(m){return this.parent(m).not("body").each(function(){n(this).replaceWith(this.childNodes)}),this}}),n}.apply(h,l),r!==void 0&&(P.exports=r)},2543:function(P,h,i){P=i.nmd(P);var l;/**
* @license
* Lodash <https://lodash.com/>
* Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
* Released under MIT license <https://lodash.com/license>
* Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
* Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
*/(function(){var r,n="4.17.21",p=200,m="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",f="Expected a function",o="Invalid `variable` option passed into `_.template`",u="__lodash_hash_undefined__",v=500,s="__lodash_placeholder__",g=1,d=2,c=4,b=1,y=2,T=1,_=2,A=4,E=8,I=16,N=32,B=64,C=128,R=256,w=512,D=30,k="...",G=800,W=16,L=1,F=2,H=3,K=1/0,U=9007199254740991,Z=17976931348623157e292,ie=0/0,ue=4294967295,J=ue-1,be=ue>>>1,Ae=[["ary",C],["bind",T],["bindKey",_],["curry",E],["curryRight",I],["flip",w],["partial",N],["partialRight",B],["rearg",R]],Se="[object Arguments]",Xe="[object Array]",dt="[object AsyncFunction]",bt="[object Boolean]",At="[object Date]",Rt="[object DOMException]",fe="[object Error]",xe="[object Function]",Te="[object GeneratorFunction]",Oe="[object Map]",mt="[object Number]",Ut="[object Null]",tt="[object Object]",Me="[object Promise]",de="[object Proxy]",Ce="[object RegExp]",we="[object Set]",X="[object String]",ye="[object Symbol]",me="[object Undefined]",ge="[object WeakMap]",ke="[object WeakSet]",Ue="[object ArrayBuffer]",Ge="[object DataView]",qe="[object Float32Array]",et="[object Float64Array]",ot="[object Int8Array]",ht="[object Int16Array]",Ht="[object Int32Array]",Lt="[object Uint8Array]",wt="[object Uint8ClampedArray]",fn="[object Uint16Array]",dn="[object Uint32Array]",wn=/\b__p \+= '';/g,kn=/\b(__p \+=) '' \+/g,Ft=/(__e\(.*?\)|\b__t\)) \+\n'';/g,Hn=/&(?:amp|lt|gt|quot|#39);/g,Tt=/[&<>"']/g,Fn=RegExp(Hn.source),j=RegExp(Tt.source),V=/<%-([\s\S]+?)%>/g,Q=/<%([\s\S]+?)%>/g,ee=/<%=([\s\S]+?)%>/g,se=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,ve=/^\w*$/,Ee=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,De=/[\\^$.*+?()[\]{}|]/g,Pe=RegExp(De.source),$e=/^\s+/,re=/\s/,ne=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,pe=/\{\n\/\* \[wrapped with (.+)\] \*/,oe=/,? & /,Ie=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,Fe=/[()=,{}\[\]\/\s]/,Ne=/\\(\\)?/g,pt=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,St=/\w*$/,Ct=/^[-+]0x[0-9a-f]+$/i,gt=/^0b[01]+$/i,st=/^\[object .+?Constructor\]$/,nt=/^0o[0-7]+$/i,fi=/^(?:0|[1-9]\d*)$/,Es=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,or=/($^)/,Vn=/['\n\r\u2028\u2029\\]/g,Pr="\\ud800-\\udfff",Zo="\\u0300-\\u036f",Qo="\\ufe20-\\ufe2f",ep="\\u20d0-\\u20ff",Ps=Zo+Qo+ep,_s="\\u2700-\\u27bf",ws="a-z\\xdf-\\xf6\\xf8-\\xff",tp="\\xac\\xb1\\xd7\\xf7",np="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",rp="\\u2000-\\u206f",ip=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",Is="A-Z\\xc0-\\xd6\\xd8-\\xde",xs="\\ufe0e\\ufe0f",Rs=tp+np+rp+ip,di="['\u2019]",sp="["+Pr+"]",Ds="["+Rs+"]",_r="["+Ps+"]",Cs="\\d+",ap="["+_s+"]",Ns="["+ws+"]",Ms="[^"+Pr+Rs+Cs+_s+ws+Is+"]",mi="\\ud83c[\\udffb-\\udfff]",op="(?:"+_r+"|"+mi+")",Ls="[^"+Pr+"]",hi="(?:\\ud83c[\\udde6-\\uddff]){2}",gi="[\\ud800-\\udbff][\\udc00-\\udfff]",zn="["+Is+"]",Os="\\u200d",ks="(?:"+Ns+"|"+Ms+")",pp="(?:"+zn+"|"+Ms+")",Hs="(?:"+di+"(?:d|ll|m|re|s|t|ve))?",Fs="(?:"+di+"(?:D|LL|M|RE|S|T|VE))?",Bs=op+"?",js="["+xs+"]?",lp="(?:"+Os+"(?:"+[Ls,hi,gi].join("|")+")"+js+Bs+")*",up="\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])",cp="\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])",Gs=js+Bs+lp,fp="(?:"+[ap,hi,gi].join("|")+")"+Gs,dp="(?:"+[Ls+_r+"?",_r,hi,gi,sp].join("|")+")",mp=RegExp(di,"g"),hp=RegExp(_r,"g"),yi=RegExp(mi+"(?="+mi+")|"+dp+Gs,"g"),gp=RegExp([zn+"?"+Ns+"+"+Hs+"(?="+[Ds,zn,"$"].join("|")+")",pp+"+"+Fs+"(?="+[Ds,zn+ks,"$"].join("|")+")",zn+"?"+ks+"+"+Hs,zn+"+"+Fs,cp,up,Cs,fp].join("|"),"g"),yp=RegExp("["+Os+Pr+Ps+xs+"]"),vp=/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,bp=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"],Ap=-1,ft={};ft[qe]=ft[et]=ft[ot]=ft[ht]=ft[Ht]=ft[Lt]=ft[wt]=ft[fn]=ft[dn]=!0,ft[Se]=ft[Xe]=ft[Ue]=ft[bt]=ft[Ge]=ft[At]=ft[fe]=ft[xe]=ft[Oe]=ft[mt]=ft[tt]=ft[Ce]=ft[we]=ft[X]=ft[ge]=!1;var ct={};ct[Se]=ct[Xe]=ct[Ue]=ct[Ge]=ct[bt]=ct[At]=ct[qe]=ct[et]=ct[ot]=ct[ht]=ct[Ht]=ct[Oe]=ct[mt]=ct[tt]=ct[Ce]=ct[we]=ct[X]=ct[ye]=ct[Lt]=ct[wt]=ct[fn]=ct[dn]=!0,ct[fe]=ct[xe]=ct[ge]=!1;var Tp={\u00C0:"A",\u00C1:"A",\u00C2:"A",\u00C3:"A",\u00C4:"A",\u00C5:"A",\u00E0:"a",\u00E1:"a",\u00E2:"a",\u00E3:"a",\u00E4:"a",\u00E5:"a",\u00C7:"C",\u00E7:"c",\u00D0:"D",\u00F0:"d",\u00C8:"E",\u00C9:"E",\u00CA:"E",\u00CB:"E",\u00E8:"e",\u00E9:"e",\u00EA:"e",\u00EB:"e",\u00CC:"I",\u00CD:"I",\u00CE:"I",\u00CF:"I",\u00EC:"i",\u00ED:"i",\u00EE:"i",\u00EF:"i",\u00D1:"N",\u00F1:"n",\u00D2:"O",\u00D3:"O",\u00D4:"O",\u00D5:"O",\u00D6:"O",\u00D8:"O",\u00F2:"o",\u00F3:"o",\u00F4:"o",\u00F5:"o",\u00F6:"o",\u00F8:"o",\u00D9:"U",\u00DA:"U",\u00DB:"U",\u00DC:"U",\u00F9:"u",\u00FA:"u",\u00FB:"u",\u00FC:"u",\u00DD:"Y",\u00FD:"y",\u00FF:"y",\u00C6:"Ae",\u00E6:"ae",\u00DE:"Th",\u00FE:"th",\u00DF:"ss",\u0100:"A",\u0102:"A",\u0104:"A",\u0101:"a",\u0103:"a",\u0105:"a",\u0106:"C",\u0108:"C",\u010A:"C",\u010C:"C",\u0107:"c",\u0109:"c",\u010B:"c",\u010D:"c",\u010E:"D",\u0110:"D",\u010F:"d",\u0111:"d",\u0112:"E",\u0114:"E",\u0116:"E",\u0118:"E",\u011A:"E",\u0113:"e",\u0115:"e",\u0117:"e",\u0119:"e",\u011B:"e",\u011C:"G",\u011E:"G",\u0120:"G",\u0122:"G",\u011D:"g",\u011F:"g",\u0121:"g",\u0123:"g",\u0124:"H",\u0126:"H",\u0125:"h",\u0127:"h",\u0128:"I",\u012A:"I",\u012C:"I",\u012E:"I",\u0130:"I",\u0129:"i",\u012B:"i",\u012D:"i",\u012F:"i",\u0131:"i",\u0134:"J",\u0135:"j",\u0136:"K",\u0137:"k",\u0138:"k",\u0139:"L",\u013B:"L",\u013D:"L",\u013F:"L",\u0141:"L",\u013A:"l",\u013C:"l",\u013E:"l",\u0140:"l",\u0142:"l",\u0143:"N",\u0145:"N",\u0147:"N",\u014A:"N",\u0144:"n",\u0146:"n",\u0148:"n",\u014B:"n",\u014C:"O",\u014E:"O",\u0150:"O",\u014D:"o",\u014F:"o",\u0151:"o",\u0154:"R",\u0156:"R",\u0158:"R",\u0155:"r",\u0157:"r",\u0159:"r",\u015A:"S",\u015C:"S",\u015E:"S",\u0160:"S",\u015B:"s",\u015D:"s",\u015F:"s",\u0161:"s",\u0162:"T",\u0164:"T",\u0166:"T",\u0163:"t",\u0165:"t",\u0167:"t",\u0168:"U",\u016A:"U",\u016C:"U",\u016E:"U",\u0170:"U",\u0172:"U",\u0169:"u",\u016B:"u",\u016D:"u",\u016F:"u",\u0171:"u",\u0173:"u",\u0174:"W",\u0175:"w",\u0176:"Y",\u0177:"y",\u0178:"Y",\u0179:"Z",\u017B:"Z",\u017D:"Z",\u017A:"z",\u017C:"z",\u017E:"z",\u0132:"IJ",\u0133:"ij",\u0152:"Oe",\u0153:"oe",\u0149:"'n",\u017F:"s"},Sp={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ep={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"},Pp={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},_p=parseFloat,wp=parseInt,Us=typeof i.g=="object"&&i.g&&i.g.Object===Object&&i.g,Ip=typeof self=="object"&&self&&self.Object===Object&&self,Nt=Us||Ip||Function("return this")(),$s=h&&!h.nodeType&&h,pr=$s&&!0&&P&&!P.nodeType&&P,Ws=pr&&pr.exports===$s,vi=Ws&&Us.process,Qt=function(){try{var z=pr&&pr.require&&pr.require("util").types;return z||vi&&vi.binding&&vi.binding("util")}catch(ae){}}(),Ks=Qt&&Qt.isArrayBuffer,qs=Qt&&Qt.isDate,Vs=Qt&&Qt.isMap,zs=Qt&&Qt.isRegExp,Ys=Qt&&Qt.isSet,Js=Qt&&Qt.isTypedArray;function Vt(z,ae,te){switch(te.length){case 0:return z.call(ae);case 1:return z.call(ae,te[0]);case 2:return z.call(ae,te[0],te[1]);case 3:return z.call(ae,te[0],te[1],te[2])}return z.apply(ae,te)}function xp(z,ae,te,Re){for(var We=-1,it=z==null?0:z.length;++We<it;){var It=z[We];ae(Re,It,te(It),z)}return Re}function en(z,ae){for(var te=-1,Re=z==null?0:z.length;++te<Re&&ae(z[te],te,z)!==!1;);return z}function Rp(z,ae){for(var te=z==null?0:z.length;te--&&ae(z[te],te,z)!==!1;);return z}function Xs(z,ae){for(var te=-1,Re=z==null?0:z.length;++te<Re;)if(!ae(z[te],te,z))return!1;return!0}function In(z,ae){for(var te=-1,Re=z==null?0:z.length,We=0,it=[];++te<Re;){var It=z[te];ae(It,te,z)&&(it[We++]=It)}return it}function wr(z,ae){var te=z==null?0:z.length;return!!te&&Yn(z,ae,0)>-1}function bi(z,ae,te){for(var Re=-1,We=z==null?0:z.length;++Re<We;)if(te(ae,z[Re]))return!0;return!1}function yt(z,ae){for(var te=-1,Re=z==null?0:z.length,We=Array(Re);++te<Re;)We[te]=ae(z[te],te,z);return We}function xn(z,ae){for(var te=-1,Re=ae.length,We=z.length;++te<Re;)z[We+te]=ae[te];return z}function Ai(z,ae,te,Re){var We=-1,it=z==null?0:z.length;for(Re&&it&&(te=z[++We]);++We<it;)te=ae(te,z[We],We,z);return te}function Dp(z,ae,te,Re){var We=z==null?0:z.length;for(Re&&We&&(te=z[--We]);We--;)te=ae(te,z[We],We,z);return te}function Ti(z,ae){for(var te=-1,Re=z==null?0:z.length;++te<Re;)if(ae(z[te],te,z))return!0;return!1}var Cp=Si("length");function Np(z){return z.split("")}function Mp(z){return z.match(Ie)||[]}function Zs(z,ae,te){var Re;return te(z,function(We,it,It){if(ae(We,it,It))return Re=it,!1}),Re}function Ir(z,ae,te,Re){for(var We=z.length,it=te+(Re?1:-1);Re?it--:++it<We;)if(ae(z[it],it,z))return it;return-1}function Yn(z,ae,te){return ae===ae?Kp(z,ae,te):Ir(z,Qs,te)}function Lp(z,ae,te,Re){for(var We=te-1,it=z.length;++We<it;)if(Re(z[We],ae))return We;return-1}function Qs(z){return z!==z}function ea(z,ae){var te=z==null?0:z.length;return te?Pi(z,ae)/te:ie}function Si(z){return function(ae){return ae==null?r:ae[z]}}function Ei(z){return function(ae){return z==null?r:z[ae]}}function ta(z,ae,te,Re,We){return We(z,function(it,It,ut){te=Re?(Re=!1,it):ae(te,it,It,ut)}),te}function Op(z,ae){var te=z.length;for(z.sort(ae);te--;)z[te]=z[te].value;return z}function Pi(z,ae){for(var te,Re=-1,We=z.length;++Re<We;){var it=ae(z[Re]);it!==r&&(te=te===r?it:te+it)}return te}function _i(z,ae){for(var te=-1,Re=Array(z);++te<z;)Re[te]=ae(te);return Re}function kp(z,ae){return yt(ae,function(te){return[te,z[te]]})}function na(z){return z&&z.slice(0,aa(z)+1).replace($e,"")}function zt(z){return function(ae){return z(ae)}}function wi(z,ae){return yt(ae,function(te){return z[te]})}function lr(z,ae){return z.has(ae)}function ra(z,ae){for(var te=-1,Re=z.length;++te<Re&&Yn(ae,z[te],0)>-1;);return te}function ia(z,ae){for(var te=z.length;te--&&Yn(ae,z[te],0)>-1;);return te}function Hp(z,ae){for(var te=z.length,Re=0;te--;)z[te]===ae&&++Re;return Re}var Fp=Ei(Tp),Bp=Ei(Sp);function jp(z){return"\\"+Pp[z]}function Gp(z,ae){return z==null?r:z[ae]}function Jn(z){return yp.test(z)}function Up(z){return vp.test(z)}function $p(z){for(var ae,te=[];!(ae=z.next()).done;)te.push(ae.value);return te}function Ii(z){var ae=-1,te=Array(z.size);return z.forEach(function(Re,We){te[++ae]=[We,Re]}),te}function sa(z,ae){return function(te){return z(ae(te))}}function Rn(z,ae){for(var te=-1,Re=z.length,We=0,it=[];++te<Re;){var It=z[te];(It===ae||It===s)&&(z[te]=s,it[We++]=te)}return it}function xr(z){var ae=-1,te=Array(z.size);return z.forEach(function(Re){te[++ae]=Re}),te}function Wp(z){var ae=-1,te=Array(z.size);return z.forEach(function(Re){te[++ae]=[Re,Re]}),te}function Kp(z,ae,te){for(var Re=te-1,We=z.length;++Re<We;)if(z[Re]===ae)return Re;return-1}function qp(z,ae,te){for(var Re=te+1;Re--;)if(z[Re]===ae)return Re;return Re}function Xn(z){return Jn(z)?zp(z):Cp(z)}function pn(z){return Jn(z)?Yp(z):Np(z)}function aa(z){for(var ae=z.length;ae--&&re.test(z.charAt(ae)););return ae}var Vp=Ei(Ep);function zp(z){for(var ae=yi.lastIndex=0;yi.test(z);)++ae;return ae}function Yp(z){return z.match(yi)||[]}function Jp(z){return z.match(gp)||[]}var Xp=function z(ae){ae=ae==null?Nt:Rr.defaults(Nt.Object(),ae,Rr.pick(Nt,bp));var te=ae.Array,Re=ae.Date,We=ae.Error,it=ae.Function,It=ae.Math,ut=ae.Object,xi=ae.RegExp,Zp=ae.String,tn=ae.TypeError,Dr=te.prototype,Qp=it.prototype,Zn=ut.prototype,Cr=ae["__core-js_shared__"],Nr=Qp.toString,lt=Zn.hasOwnProperty,el=0,oa=function(){var e=/[^.]+$/.exec(Cr&&Cr.keys&&Cr.keys.IE_PROTO||"");return e?"Symbol(src)_1."+e:""}(),Mr=Zn.toString,tl=Nr.call(ut),nl=Nt._,rl=xi("^"+Nr.call(lt).replace(De,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Lr=Ws?ae.Buffer:r,Dn=ae.Symbol,Or=ae.Uint8Array,pa=Lr?Lr.allocUnsafe:r,kr=sa(ut.getPrototypeOf,ut),la=ut.create,ua=Zn.propertyIsEnumerable,Hr=Dr.splice,ca=Dn?Dn.isConcatSpreadable:r,ur=Dn?Dn.iterator:r,Bn=Dn?Dn.toStringTag:r,Fr=function(){try{var e=Wn(ut,"defineProperty");return e({},"",{}),e}catch(t){}}(),il=ae.clearTimeout!==Nt.clearTimeout&&ae.clearTimeout,sl=Re&&Re.now!==Nt.Date.now&&Re.now,al=ae.setTimeout!==Nt.setTimeout&&ae.setTimeout,Br=It.ceil,jr=It.floor,Ri=ut.getOwnPropertySymbols,ol=Lr?Lr.isBuffer:r,fa=ae.isFinite,pl=Dr.join,ll=sa(ut.keys,ut),xt=It.max,Ot=It.min,ul=Re.now,cl=ae.parseInt,da=It.random,fl=Dr.reverse,Di=Wn(ae,"DataView"),cr=Wn(ae,"Map"),Ci=Wn(ae,"Promise"),Qn=Wn(ae,"Set"),fr=Wn(ae,"WeakMap"),dr=Wn(ut,"create"),Gr=fr&&new fr,er={},dl=Kn(Di),ml=Kn(cr),hl=Kn(Ci),gl=Kn(Qn),yl=Kn(fr),Ur=Dn?Dn.prototype:r,mr=Ur?Ur.valueOf:r,ma=Ur?Ur.toString:r;function M(e){if(Et(e)&&!Ke(e)&&!(e instanceof Ze)){if(e instanceof nn)return e;if(lt.call(e,"__wrapped__"))return go(e)}return new nn(e)}var tr=function(){function e(){}return function(t){if(!vt(t))return{};if(la)return la(t);e.prototype=t;var a=new e;return e.prototype=r,a}}();function $r(){}function nn(e,t){this.__wrapped__=e,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=r}M.templateSettings={escape:V,evaluate:Q,interpolate:ee,variable:"",imports:{_:M}},M.prototype=$r.prototype,M.prototype.constructor=M,nn.prototype=tr($r.prototype),nn.prototype.constructor=nn;function Ze(e){this.__wrapped__=e,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=ue,this.__views__=[]}function vl(){var e=new Ze(this.__wrapped__);return e.__actions__=$t(this.__actions__),e.__dir__=this.__dir__,e.__filtered__=this.__filtered__,e.__iteratees__=$t(this.__iteratees__),e.__takeCount__=this.__takeCount__,e.__views__=$t(this.__views__),e}function bl(){if(this.__filtered__){var e=new Ze(this);e.__dir__=-1,e.__filtered__=!0}else e=this.clone(),e.__dir__*=-1;return e}function Al(){var e=this.__wrapped__.value(),t=this.__dir__,a=Ke(e),S=t<0,x=a?e.length:0,O=Nu(0,x,this.__views__),$=O.start,q=O.end,Y=q-$,le=S?q:$-1,ce=this.__iteratees__,he=ce.length,_e=0,Le=Ot(Y,this.__takeCount__);if(!a||!S&&x==Y&&Le==Y)return Fa(e,this.__actions__);var Be=[];e:for(;Y--&&_e<Le;){le+=t;for(var ze=-1,je=e[le];++ze<he;){var Je=ce[ze],Qe=Je.iteratee,Xt=Je.type,Gt=Qe(je);if(Xt==F)je=Gt;else if(!Gt){if(Xt==L)continue e;break e}}Be[_e++]=je}return Be}Ze.prototype=tr($r.prototype),Ze.prototype.constructor=Ze;function jn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Tl(){this.__data__=dr?dr(null):{},this.size=0}function Sl(e){var t=this.has(e)&&delete this.__data__[e];return this.size-=t?1:0,t}function El(e){var t=this.__data__;if(dr){var a=t[e];return a===u?r:a}return lt.call(t,e)?t[e]:r}function Pl(e){var t=this.__data__;return dr?t[e]!==r:lt.call(t,e)}function _l(e,t){var a=this.__data__;return this.size+=this.has(e)?0:1,a[e]=dr&&t===r?u:t,this}jn.prototype.clear=Tl,jn.prototype.delete=Sl,jn.prototype.get=El,jn.prototype.has=Pl,jn.prototype.set=_l;function yn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function wl(){this.__data__=[],this.size=0}function Il(e){var t=this.__data__,a=Wr(t,e);if(a<0)return!1;var S=t.length-1;return a==S?t.pop():Hr.call(t,a,1),--this.size,!0}function xl(e){var t=this.__data__,a=Wr(t,e);return a<0?r:t[a][1]}function Rl(e){return Wr(this.__data__,e)>-1}function Dl(e,t){var a=this.__data__,S=Wr(a,e);return S<0?(++this.size,a.push([e,t])):a[S][1]=t,this}yn.prototype.clear=wl,yn.prototype.delete=Il,yn.prototype.get=xl,yn.prototype.has=Rl,yn.prototype.set=Dl;function vn(e){var t=-1,a=e==null?0:e.length;for(this.clear();++t<a;){var S=e[t];this.set(S[0],S[1])}}function Cl(){this.size=0,this.__data__={hash:new jn,map:new(cr||yn),string:new jn}}function Nl(e){var t=ni(this,e).delete(e);return this.size-=t?1:0,t}function Ml(e){return ni(this,e).get(e)}function Ll(e){return ni(this,e).has(e)}function Ol(e,t){var a=ni(this,e),S=a.size;return a.set(e,t),this.size+=a.size==S?0:1,this}vn.prototype.clear=Cl,vn.prototype.delete=Nl,vn.prototype.get=Ml,vn.prototype.has=Ll,vn.prototype.set=Ol;function Gn(e){var t=-1,a=e==null?0:e.length;for(this.__data__=new vn;++t<a;)this.add(e[t])}function kl(e){return this.__data__.set(e,u),this}function Hl(e){return this.__data__.has(e)}Gn.prototype.add=Gn.prototype.push=kl,Gn.prototype.has=Hl;function ln(e){var t=this.__data__=new yn(e);this.size=t.size}function Fl(){this.__data__=new yn,this.size=0}function Bl(e){var t=this.__data__,a=t.delete(e);return this.size=t.size,a}function jl(e){return this.__data__.get(e)}function Gl(e){return this.__data__.has(e)}function Ul(e,t){var a=this.__data__;if(a instanceof yn){var S=a.__data__;if(!cr||S.length<p-1)return S.push([e,t]),this.size=++a.size,this;a=this.__data__=new vn(S)}return a.set(e,t),this.size=a.size,this}ln.prototype.clear=Fl,ln.prototype.delete=Bl,ln.prototype.get=jl,ln.prototype.has=Gl,ln.prototype.set=Ul;function ha(e,t){var a=Ke(e),S=!a&&qn(e),x=!a&&!S&&On(e),O=!a&&!S&&!x&&sr(e),$=a||S||x||O,q=$?_i(e.length,Zp):[],Y=q.length;for(var le in e)(t||lt.call(e,le))&&!($&&(le=="length"||x&&(le=="offset"||le=="parent")||O&&(le=="buffer"||le=="byteLength"||le=="byteOffset")||Sn(le,Y)))&&q.push(le);return q}function ga(e){var t=e.length;return t?e[Ui(0,t-1)]:r}function $l(e,t){return ri($t(e),Un(t,0,e.length))}function Wl(e){return ri($t(e))}function Ni(e,t,a){(a!==r&&!un(e[t],a)||a===r&&!(t in e))&&bn(e,t,a)}function hr(e,t,a){var S=e[t];(!(lt.call(e,t)&&un(S,a))||a===r&&!(t in e))&&bn(e,t,a)}function Wr(e,t){for(var a=e.length;a--;)if(un(e[a][0],t))return a;return-1}function Kl(e,t,a,S){return Cn(e,function(x,O,$){t(S,x,a(x),$)}),S}function ya(e,t){return e&&hn(t,Dt(t),e)}function ql(e,t){return e&&hn(t,Kt(t),e)}function bn(e,t,a){t=="__proto__"&&Fr?Fr(e,t,{configurable:!0,enumerable:!0,value:a,writable:!0}):e[t]=a}function Mi(e,t){for(var a=-1,S=t.length,x=te(S),O=e==null;++a<S;)x[a]=O?r:ds(e,t[a]);return x}function Un(e,t,a){return e===e&&(a!==r&&(e=e<=a?e:a),t!==r&&(e=e>=t?e:t)),e}function rn(e,t,a,S,x,O){var $,q=t&g,Y=t&d,le=t&c;if(a&&($=x?a(e,S,x,O):a(e)),$!==r)return $;if(!vt(e))return e;var ce=Ke(e);if(ce){if($=Lu(e),!q)return $t(e,$)}else{var he=kt(e),_e=he==xe||he==Te;if(On(e))return Ga(e,q);if(he==tt||he==Se||_e&&!x){if($=Y||_e?{}:ao(e),!q)return Y?Eu(e,ql($,e)):Su(e,ya($,e))}else{if(!ct[he])return x?e:{};$=Ou(e,he,q)}}O||(O=new ln);var Le=O.get(e);if(Le)return Le;O.set(e,$),ko(e)?e.forEach(function(je){$.add(rn(je,t,a,je,e,O))}):Lo(e)&&e.forEach(function(je,Je){$.set(Je,rn(je,t,a,Je,e,O))});var Be=le?Y?Qi:Zi:Y?Kt:Dt,ze=ce?r:Be(e);return en(ze||e,function(je,Je){ze&&(Je=je,je=e[Je]),hr($,Je,rn(je,t,a,Je,e,O))}),$}function Vl(e){var t=Dt(e);return function(a){return va(a,e,t)}}function va(e,t,a){var S=a.length;if(e==null)return!S;for(e=ut(e);S--;){var x=a[S],O=t[x],$=e[x];if($===r&&!(x in e)||!O($))return!1}return!0}function ba(e,t,a){if(typeof e!="function")throw new tn(f);return Sr(function(){e.apply(r,a)},t)}function gr(e,t,a,S){var x=-1,O=wr,$=!0,q=e.length,Y=[],le=t.length;if(!q)return Y;a&&(t=yt(t,zt(a))),S?(O=bi,$=!1):t.length>=p&&(O=lr,$=!1,t=new Gn(t));e:for(;++x<q;){var ce=e[x],he=a==null?ce:a(ce);if(ce=S||ce!==0?ce:0,$&&he===he){for(var _e=le;_e--;)if(t[_e]===he)continue e;Y.push(ce)}else O(t,he,S)||Y.push(ce)}return Y}var Cn=qa(mn),Aa=qa(Oi,!0);function zl(e,t){var a=!0;return Cn(e,function(S,x,O){return a=!!t(S,x,O),a}),a}function Kr(e,t,a){for(var S=-1,x=e.length;++S<x;){var O=e[S],$=t(O);if($!=null&&(q===r?$===$&&!Jt($):a($,q)))var q=$,Y=O}return Y}function Yl(e,t,a,S){var x=e.length;for(a=Ve(a),a<0&&(a=-a>x?0:x+a),S=S===r||S>x?x:Ve(S),S<0&&(S+=x),S=a>S?0:Fo(S);a<S;)e[a++]=t;return e}function Ta(e,t){var a=[];return Cn(e,function(S,x,O){t(S,x,O)&&a.push(S)}),a}function Mt(e,t,a,S,x){var O=-1,$=e.length;for(a||(a=Hu),x||(x=[]);++O<$;){var q=e[O];t>0&&a(q)?t>1?Mt(q,t-1,a,S,x):xn(x,q):S||(x[x.length]=q)}return x}var Li=Va(),Sa=Va(!0);function mn(e,t){return e&&Li(e,t,Dt)}function Oi(e,t){return e&&Sa(e,t,Dt)}function qr(e,t){return In(t,function(a){return En(e[a])})}function $n(e,t){t=Mn(t,e);for(var a=0,S=t.length;e!=null&&a<S;)e=e[gn(t[a++])];return a&&a==S?e:r}function Ea(e,t,a){var S=t(e);return Ke(e)?S:xn(S,a(e))}function Bt(e){return e==null?e===r?me:Ut:Bn&&Bn in ut(e)?Cu(e):Wu(e)}function ki(e,t){return e>t}function Jl(e,t){return e!=null&&lt.call(e,t)}function Xl(e,t){return e!=null&&t in ut(e)}function Zl(e,t,a){return e>=Ot(t,a)&&e<xt(t,a)}function Hi(e,t,a){for(var S=a?bi:wr,x=e[0].length,O=e.length,$=O,q=te(O),Y=1/0,le=[];$--;){var ce=e[$];$&&t&&(ce=yt(ce,zt(t))),Y=Ot(ce.length,Y),q[$]=!a&&(t||x>=120&&ce.length>=120)?new Gn($&&ce):r}ce=e[0];var he=-1,_e=q[0];e:for(;++he<x&&le.length<Y;){var Le=ce[he],Be=t?t(Le):Le;if(Le=a||Le!==0?Le:0,!(_e?lr(_e,Be):S(le,Be,a))){for($=O;--$;){var ze=q[$];if(!(ze?lr(ze,Be):S(e[$],Be,a)))continue e}_e&&_e.push(Be),le.push(Le)}}return le}function Ql(e,t,a,S){return mn(e,function(x,O,$){t(S,a(x),O,$)}),S}function yr(e,t,a){t=Mn(t,e),e=uo(e,t);var S=e==null?e:e[gn(an(t))];return S==null?r:Vt(S,e,a)}function Pa(e){return Et(e)&&Bt(e)==Se}function eu(e){return Et(e)&&Bt(e)==Ue}function tu(e){return Et(e)&&Bt(e)==At}function vr(e,t,a,S,x){return e===t?!0:e==null||t==null||!Et(e)&&!Et(t)?e!==e&&t!==t:nu(e,t,a,S,vr,x)}function nu(e,t,a,S,x,O){var $=Ke(e),q=Ke(t),Y=$?Xe:kt(e),le=q?Xe:kt(t);Y=Y==Se?tt:Y,le=le==Se?tt:le;var ce=Y==tt,he=le==tt,_e=Y==le;if(_e&&On(e)){if(!On(t))return!1;$=!0,ce=!1}if(_e&&!ce)return O||(O=new ln),$||sr(e)?ro(e,t,a,S,x,O):Ru(e,t,Y,a,S,x,O);if(!(a&b)){var Le=ce&&lt.call(e,"__wrapped__"),Be=he&&lt.call(t,"__wrapped__");if(Le||Be){var ze=Le?e.value():e,je=Be?t.value():t;return O||(O=new ln),x(ze,je,a,S,O)}}return _e?(O||(O=new ln),Du(e,t,a,S,x,O)):!1}function ru(e){return Et(e)&&kt(e)==Oe}function Fi(e,t,a,S){var x=a.length,O=x,$=!S;if(e==null)return!O;for(e=ut(e);x--;){var q=a[x];if($&&q[2]?q[1]!==e[q[0]]:!(q[0]in e))return!1}for(;++x<O;){q=a[x];var Y=q[0],le=e[Y],ce=q[1];if($&&q[2]){if(le===r&&!(Y in e))return!1}else{var he=new ln;if(S)var _e=S(le,ce,Y,e,t,he);if(!(_e===r?vr(ce,le,b|y,S,he):_e))return!1}}return!0}function _a(e){if(!vt(e)||Bu(e))return!1;var t=En(e)?rl:st;return t.test(Kn(e))}function iu(e){return Et(e)&&Bt(e)==Ce}function su(e){return Et(e)&&kt(e)==we}function au(e){return Et(e)&&li(e.length)&&!!ft[Bt(e)]}function wa(e){return typeof e=="function"?e:e==null?qt:typeof e=="object"?Ke(e)?Ra(e[0],e[1]):xa(e):Yo(e)}function Bi(e){if(!Tr(e))return ll(e);var t=[];for(var a in ut(e))lt.call(e,a)&&a!="constructor"&&t.push(a);return t}function ou(e){if(!vt(e))return $u(e);var t=Tr(e),a=[];for(var S in e)S=="constructor"&&(t||!lt.call(e,S))||a.push(S);return a}function ji(e,t){return e<t}function Ia(e,t){var a=-1,S=Wt(e)?te(e.length):[];return Cn(e,function(x,O,$){S[++a]=t(x,O,$)}),S}function xa(e){var t=ts(e);return t.length==1&&t[0][2]?po(t[0][0],t[0][1]):function(a){return a===e||Fi(a,e,t)}}function Ra(e,t){return rs(e)&&oo(t)?po(gn(e),t):function(a){var S=ds(a,e);return S===r&&S===t?ms(a,e):vr(t,S,b|y)}}function Vr(e,t,a,S,x){e!==t&&Li(t,function(O,$){if(x||(x=new ln),vt(O))pu(e,t,$,a,Vr,S,x);else{var q=S?S(ss(e,$),O,$+"",e,t,x):r;q===r&&(q=O),Ni(e,$,q)}},Kt)}function pu(e,t,a,S,x,O,$){var q=ss(e,a),Y=ss(t,a),le=$.get(Y);if(le){Ni(e,a,le);return}var ce=O?O(q,Y,a+"",e,t,$):r,he=ce===r;if(he){var _e=Ke(Y),Le=!_e&&On(Y),Be=!_e&&!Le&&sr(Y);ce=Y,_e||Le||Be?Ke(q)?ce=q:Pt(q)?ce=$t(q):Le?(he=!1,ce=Ga(Y,!0)):Be?(he=!1,ce=Ua(Y,!0)):ce=[]:Er(Y)||qn(Y)?(ce=q,qn(q)?ce=Bo(q):(!vt(q)||En(q))&&(ce=ao(Y))):he=!1}he&&($.set(Y,ce),x(ce,Y,S,O,$),$.delete(Y)),Ni(e,a,ce)}function Da(e,t){var a=e.length;if(a)return t+=t<0?a:0,Sn(t,a)?e[t]:r}function Ca(e,t,a){t.length?t=yt(t,function(O){return Ke(O)?function($){return $n($,O.length===1?O[0]:O)}:O}):t=[qt];var S=-1;t=yt(t,zt(He()));var x=Ia(e,function(O,$,q){var Y=yt(t,function(le){return le(O)});return{criteria:Y,index:++S,value:O}});return Op(x,function(O,$){return Tu(O,$,a)})}function lu(e,t){return Na(e,t,function(a,S){return ms(e,S)})}function Na(e,t,a){for(var S=-1,x=t.length,O={};++S<x;){var $=t[S],q=$n(e,$);a(q,$)&&br(O,Mn($,e),q)}return O}function uu(e){return function(t){return $n(t,e)}}function Gi(e,t,a,S){var x=S?Lp:Yn,O=-1,$=t.length,q=e;for(e===t&&(t=$t(t)),a&&(q=yt(e,zt(a)));++O<$;)for(var Y=0,le=t[O],ce=a?a(le):le;(Y=x(q,ce,Y,S))>-1;)q!==e&&Hr.call(q,Y,1),Hr.call(e,Y,1);return e}function Ma(e,t){for(var a=e?t.length:0,S=a-1;a--;){var x=t[a];if(a==S||x!==O){var O=x;Sn(x)?Hr.call(e,x,1):Ki(e,x)}}return e}function Ui(e,t){return e+jr(da()*(t-e+1))}function cu(e,t,a,S){for(var x=-1,O=xt(Br((t-e)/(a||1)),0),$=te(O);O--;)$[S?O:++x]=e,e+=a;return $}function $i(e,t){var a="";if(!e||t<1||t>U)return a;do t%2&&(a+=e),t=jr(t/2),t&&(e+=e);while(t);return a}function Ye(e,t){return as(lo(e,t,qt),e+"")}function fu(e){return ga(ar(e))}function du(e,t){var a=ar(e);return ri(a,Un(t,0,a.length))}function br(e,t,a,S){if(!vt(e))return e;t=Mn(t,e);for(var x=-1,O=t.length,$=O-1,q=e;q!=null&&++x<O;){var Y=gn(t[x]),le=a;if(Y==="__proto__"||Y==="constructor"||Y==="prototype")return e;if(x!=$){var ce=q[Y];le=S?S(ce,Y,q):r,le===r&&(le=vt(ce)?ce:Sn(t[x+1])?[]:{})}hr(q,Y,le),q=q[Y]}return e}var La=Gr?function(e,t){return Gr.set(e,t),e}:qt,mu=Fr?function(e,t){return Fr(e,"toString",{configurable:!0,enumerable:!1,value:gs(t),writable:!0})}:qt;function hu(e){return ri(ar(e))}function sn(e,t,a){var S=-1,x=e.length;t<0&&(t=-t>x?0:x+t),a=a>x?x:a,a<0&&(a+=x),x=t>a?0:a-t>>>0,t>>>=0;for(var O=te(x);++S<x;)O[S]=e[S+t];return O}function gu(e,t){var a;return Cn(e,function(S,x,O){return a=t(S,x,O),!a}),!!a}function zr(e,t,a){var S=0,x=e==null?S:e.length;if(typeof t=="number"&&t===t&&x<=be){for(;S<x;){var O=S+x>>>1,$=e[O];$!==null&&!Jt($)&&(a?$<=t:$<t)?S=O+1:x=O}return x}return Wi(e,t,qt,a)}function Wi(e,t,a,S){var x=0,O=e==null?0:e.length;if(O===0)return 0;t=a(t);for(var $=t!==t,q=t===null,Y=Jt(t),le=t===r;x<O;){var ce=jr((x+O)/2),he=a(e[ce]),_e=he!==r,Le=he===null,Be=he===he,ze=Jt(he);if($)var je=S||Be;else le?je=Be&&(S||_e):q?je=Be&&_e&&(S||!Le):Y?je=Be&&_e&&!Le&&(S||!ze):Le||ze?je=!1:je=S?he<=t:he<t;je?x=ce+1:O=ce}return Ot(O,J)}function Oa(e,t){for(var a=-1,S=e.length,x=0,O=[];++a<S;){var $=e[a],q=t?t($):$;if(!a||!un(q,Y)){var Y=q;O[x++]=$===0?0:$}}return O}function ka(e){return typeof e=="number"?e:Jt(e)?ie:+e}function Yt(e){if(typeof e=="string")return e;if(Ke(e))return yt(e,Yt)+"";if(Jt(e))return ma?ma.call(e):"";var t=e+"";return t=="0"&&1/e==-K?"-0":t}function Nn(e,t,a){var S=-1,x=wr,O=e.length,$=!0,q=[],Y=q;if(a)$=!1,x=bi;else if(O>=p){var le=t?null:Iu(e);if(le)return xr(le);$=!1,x=lr,Y=new Gn}else Y=t?[]:q;e:for(;++S<O;){var ce=e[S],he=t?t(ce):ce;if(ce=a||ce!==0?ce:0,$&&he===he){for(var _e=Y.length;_e--;)if(Y[_e]===he)continue e;t&&Y.push(he),q.push(ce)}else x(Y,he,a)||(Y!==q&&Y.push(he),q.push(ce))}return q}function Ki(e,t){return t=Mn(t,e),e=uo(e,t),e==null||delete e[gn(an(t))]}function Ha(e,t,a,S){return br(e,t,a($n(e,t)),S)}function Yr(e,t,a,S){for(var x=e.length,O=S?x:-1;(S?O--:++O<x)&&t(e[O],O,e););return a?sn(e,S?0:O,S?O+1:x):sn(e,S?O+1:0,S?x:O)}function Fa(e,t){var a=e;return a instanceof Ze&&(a=a.value()),Ai(t,function(S,x){return x.func.apply(x.thisArg,xn([S],x.args))},a)}function qi(e,t,a){var S=e.length;if(S<2)return S?Nn(e[0]):[];for(var x=-1,O=te(S);++x<S;)for(var $=e[x],q=-1;++q<S;)q!=x&&(O[x]=gr(O[x]||$,e[q],t,a));return Nn(Mt(O,1),t,a)}function Ba(e,t,a){for(var S=-1,x=e.length,O=t.length,$={};++S<x;){var q=S<O?t[S]:r;a($,e[S],q)}return $}function Vi(e){return Pt(e)?e:[]}function zi(e){return typeof e=="function"?e:qt}function Mn(e,t){return Ke(e)?e:rs(e,t)?[e]:ho(at(e))}var yu=Ye;function Ln(e,t,a){var S=e.length;return a=a===r?S:a,!t&&a>=S?e:sn(e,t,a)}var ja=il||function(e){return Nt.clearTimeout(e)};function Ga(e,t){if(t)return e.slice();var a=e.length,S=pa?pa(a):new e.constructor(a);return e.copy(S),S}function Yi(e){var t=new e.constructor(e.byteLength);return new Or(t).set(new Or(e)),t}function vu(e,t){var a=t?Yi(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.byteLength)}function bu(e){var t=new e.constructor(e.source,St.exec(e));return t.lastIndex=e.lastIndex,t}function Au(e){return mr?ut(mr.call(e)):{}}function Ua(e,t){var a=t?Yi(e.buffer):e.buffer;return new e.constructor(a,e.byteOffset,e.length)}function $a(e,t){if(e!==t){var a=e!==r,S=e===null,x=e===e,O=Jt(e),$=t!==r,q=t===null,Y=t===t,le=Jt(t);if(!q&&!le&&!O&&e>t||O&&$&&Y&&!q&&!le||S&&$&&Y||!a&&Y||!x)return 1;if(!S&&!O&&!le&&e<t||le&&a&&x&&!S&&!O||q&&a&&x||!$&&x||!Y)return-1}return 0}function Tu(e,t,a){for(var S=-1,x=e.criteria,O=t.criteria,$=x.length,q=a.length;++S<$;){var Y=$a(x[S],O[S]);if(Y){if(S>=q)return Y;var le=a[S];return Y*(le=="desc"?-1:1)}}return e.index-t.index}function Wa(e,t,a,S){for(var x=-1,O=e.length,$=a.length,q=-1,Y=t.length,le=xt(O-$,0),ce=te(Y+le),he=!S;++q<Y;)ce[q]=t[q];for(;++x<$;)(he||x<O)&&(ce[a[x]]=e[x]);for(;le--;)ce[q++]=e[x++];return ce}function Ka(e,t,a,S){for(var x=-1,O=e.length,$=-1,q=a.length,Y=-1,le=t.length,ce=xt(O-q,0),he=te(ce+le),_e=!S;++x<ce;)he[x]=e[x];for(var Le=x;++Y<le;)he[Le+Y]=t[Y];for(;++$<q;)(_e||x<O)&&(he[Le+a[$]]=e[x++]);return he}function $t(e,t){var a=-1,S=e.length;for(t||(t=te(S));++a<S;)t[a]=e[a];return t}function hn(e,t,a,S){var x=!a;a||(a={});for(var O=-1,$=t.length;++O<$;){var q=t[O],Y=S?S(a[q],e[q],q,a,e):r;Y===r&&(Y=e[q]),x?bn(a,q,Y):hr(a,q,Y)}return a}function Su(e,t){return hn(e,ns(e),t)}function Eu(e,t){return hn(e,io(e),t)}function Jr(e,t){return function(a,S){var x=Ke(a)?xp:Kl,O=t?t():{};return x(a,e,He(S,2),O)}}function nr(e){return Ye(function(t,a){var S=-1,x=a.length,O=x>1?a[x-1]:r,$=x>2?a[2]:r;for(O=e.length>3&&typeof O=="function"?(x--,O):r,$&&jt(a[0],a[1],$)&&(O=x<3?r:O,x=1),t=ut(t);++S<x;){var q=a[S];q&&e(t,q,S,O)}return t})}function qa(e,t){return function(a,S){if(a==null)return a;if(!Wt(a))return e(a,S);for(var x=a.length,O=t?x:-1,$=ut(a);(t?O--:++O<x)&&S($[O],O,$)!==!1;);return a}}function Va(e){return function(t,a,S){for(var x=-1,O=ut(t),$=S(t),q=$.length;q--;){var Y=$[e?q:++x];if(a(O[Y],Y,O)===!1)break}return t}}function Pu(e,t,a){var S=t&T,x=Ar(e);function O(){var $=this&&this!==Nt&&this instanceof O?x:e;return $.apply(S?a:this,arguments)}return O}function za(e){return function(t){t=at(t);var a=Jn(t)?pn(t):r,S=a?a[0]:t.charAt(0),x=a?Ln(a,1).join(""):t.slice(1);return S[e]()+x}}function rr(e){return function(t){return Ai(Vo(qo(t).replace(mp,"")),e,"")}}function Ar(e){return function(){var t=arguments;switch(t.length){case 0:return new e;case 1:return new e(t[0]);case 2:return new e(t[0],t[1]);case 3:return new e(t[0],t[1],t[2]);case 4:return new e(t[0],t[1],t[2],t[3]);case 5:return new e(t[0],t[1],t[2],t[3],t[4]);case 6:return new e(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new e(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var a=tr(e.prototype),S=e.apply(a,t);return vt(S)?S:a}}function _u(e,t,a){var S=Ar(e);function x(){for(var O=arguments.length,$=te(O),q=O,Y=ir(x);q--;)$[q]=arguments[q];var le=O<3&&$[0]!==Y&&$[O-1]!==Y?[]:Rn($,Y);if(O-=le.length,O<a)return Qa(e,t,Xr,x.placeholder,r,$,le,r,r,a-O);var ce=this&&this!==Nt&&this instanceof x?S:e;return Vt(ce,this,$)}return x}function Ya(e){return function(t,a,S){var x=ut(t);if(!Wt(t)){var O=He(a,3);t=Dt(t),a=function(q){return O(x[q],q,x)}}var $=e(t,a,S);return $>-1?x[O?t[$]:$]:r}}function Ja(e){return Tn(function(t){var a=t.length,S=a,x=nn.prototype.thru;for(e&&t.reverse();S--;){var O=t[S];if(typeof O!="function")throw new tn(f);if(x&&!$&&ti(O)=="wrapper")var $=new nn([],!0)}for(S=$?S:a;++S<a;){O=t[S];var q=ti(O),Y=q=="wrapper"?es(O):r;Y&&is(Y[0])&&Y[1]==(C|E|N|R)&&!Y[4].length&&Y[9]==1?$=$[ti(Y[0])].apply($,Y[3]):$=O.length==1&&is(O)?$[q]():$.thru(O)}return function(){var le=arguments,ce=le[0];if($&&le.length==1&&Ke(ce))return $.plant(ce).value();for(var he=0,_e=a?t[he].apply(this,le):ce;++he<a;)_e=t[he].call(this,_e);return _e}})}function Xr(e,t,a,S,x,O,$,q,Y,le){var ce=t&C,he=t&T,_e=t&_,Le=t&(E|I),Be=t&w,ze=_e?r:Ar(e);function je(){for(var Je=arguments.length,Qe=te(Je),Xt=Je;Xt--;)Qe[Xt]=arguments[Xt];if(Le)var Gt=ir(je),Zt=Hp(Qe,Gt);if(S&&(Qe=Wa(Qe,S,x,Le)),O&&(Qe=Ka(Qe,O,$,Le)),Je-=Zt,Le&&Je<le){var _t=Rn(Qe,Gt);return Qa(e,t,Xr,je.placeholder,a,Qe,_t,q,Y,le-Je)}var cn=he?a:this,_n=_e?cn[e]:e;return Je=Qe.length,q?Qe=Ku(Qe,q):Be&&Je>1&&Qe.reverse(),ce&&Y<Je&&(Qe.length=Y),this&&this!==Nt&&this instanceof je&&(_n=ze||Ar(_n)),_n.apply(cn,Qe)}return je}function Xa(e,t){return function(a,S){return Ql(a,e,t(S),{})}}function Zr(e,t){return function(a,S){var x;if(a===r&&S===r)return t;if(a!==r&&(x=a),S!==r){if(x===r)return S;typeof a=="string"||typeof S=="string"?(a=Yt(a),S=Yt(S)):(a=ka(a),S=ka(S)),x=e(a,S)}return x}}function Ji(e){return Tn(function(t){return t=yt(t,zt(He())),Ye(function(a){var S=this;return e(t,function(x){return Vt(x,S,a)})})})}function Qr(e,t){t=t===r?" ":Yt(t);var a=t.length;if(a<2)return a?$i(t,e):t;var S=$i(t,Br(e/Xn(t)));return Jn(t)?Ln(pn(S),0,e).join(""):S.slice(0,e)}function wu(e,t,a,S){var x=t&T,O=Ar(e);function $(){for(var q=-1,Y=arguments.length,le=-1,ce=S.length,he=te(ce+Y),_e=this&&this!==Nt&&this instanceof $?O:e;++le<ce;)he[le]=S[le];for(;Y--;)he[le++]=arguments[++q];return Vt(_e,x?a:this,he)}return $}function Za(e){return function(t,a,S){return S&&typeof S!="number"&&jt(t,a,S)&&(a=S=r),t=Pn(t),a===r?(a=t,t=0):a=Pn(a),S=S===r?t<a?1:-1:Pn(S),cu(t,a,S,e)}}function ei(e){return function(t,a){return typeof t=="string"&&typeof a=="string"||(t=on(t),a=on(a)),e(t,a)}}function Qa(e,t,a,S,x,O,$,q,Y,le){var ce=t&E,he=ce?$:r,_e=ce?r:$,Le=ce?O:r,Be=ce?r:O;t|=ce?N:B,t&=~(ce?B:N),t&A||(t&=~(T|_));var ze=[e,t,x,Le,he,Be,_e,q,Y,le],je=a.apply(r,ze);return is(e)&&co(je,ze),je.placeholder=S,fo(je,e,t)}function Xi(e){var t=It[e];return function(a,S){if(a=on(a),S=S==null?0:Ot(Ve(S),292),S&&fa(a)){var x=(at(a)+"e").split("e"),O=t(x[0]+"e"+(+x[1]+S));return x=(at(O)+"e").split("e"),+(x[0]+"e"+(+x[1]-S))}return t(a)}}var Iu=Qn&&1/xr(new Qn([,-0]))[1]==K?function(e){return new Qn(e)}:bs;function eo(e){return function(t){var a=kt(t);return a==Oe?Ii(t):a==we?Wp(t):kp(t,e(t))}}function An(e,t,a,S,x,O,$,q){var Y=t&_;if(!Y&&typeof e!="function")throw new tn(f);var le=S?S.length:0;if(le||(t&=~(N|B),S=x=r),$=$===r?$:xt(Ve($),0),q=q===r?q:Ve(q),le-=x?x.length:0,t&B){var ce=S,he=x;S=x=r}var _e=Y?r:es(e),Le=[e,t,a,S,x,ce,he,O,$,q];if(_e&&Uu(Le,_e),e=Le[0],t=Le[1],a=Le[2],S=Le[3],x=Le[4],q=Le[9]=Le[9]===r?Y?0:e.length:xt(Le[9]-le,0),!q&&t&(E|I)&&(t&=~(E|I)),!t||t==T)var Be=Pu(e,t,a);else t==E||t==I?Be=_u(e,t,q):(t==N||t==(T|N))&&!x.length?Be=wu(e,t,a,S):Be=Xr.apply(r,Le);var ze=_e?La:co;return fo(ze(Be,Le),e,t)}function to(e,t,a,S){return e===r||un(e,Zn[a])&&!lt.call(S,a)?t:e}function no(e,t,a,S,x,O){return vt(e)&&vt(t)&&(O.set(t,e),Vr(e,t,r,no,O),O.delete(t)),e}function xu(e){return Er(e)?r:e}function ro(e,t,a,S,x,O){var $=a&b,q=e.length,Y=t.length;if(q!=Y&&!($&&Y>q))return!1;var le=O.get(e),ce=O.get(t);if(le&&ce)return le==t&&ce==e;var he=-1,_e=!0,Le=a&y?new Gn:r;for(O.set(e,t),O.set(t,e);++he<q;){var Be=e[he],ze=t[he];if(S)var je=$?S(ze,Be,he,t,e,O):S(Be,ze,he,e,t,O);if(je!==r){if(je)continue;_e=!1;break}if(Le){if(!Ti(t,function(Je,Qe){if(!lr(Le,Qe)&&(Be===Je||x(Be,Je,a,S,O)))return Le.push(Qe)})){_e=!1;break}}else if(!(Be===ze||x(Be,ze,a,S,O))){_e=!1;break}}return O.delete(e),O.delete(t),_e}function Ru(e,t,a,S,x,O,$){switch(a){case Ge:if(e.byteLength!=t.byteLength||e.byteOffset!=t.byteOffset)return!1;e=e.buffer,t=t.buffer;case Ue:return!(e.byteLength!=t.byteLength||!O(new Or(e),new Or(t)));case bt:case At:case mt:return un(+e,+t);case fe:return e.name==t.name&&e.message==t.message;case Ce:case X:return e==t+"";case Oe:var q=Ii;case we:var Y=S&b;if(q||(q=xr),e.size!=t.size&&!Y)return!1;var le=$.get(e);if(le)return le==t;S|=y,$.set(e,t);var ce=ro(q(e),q(t),S,x,O,$);return $.delete(e),ce;case ye:if(mr)return mr.call(e)==mr.call(t)}return!1}function Du(e,t,a,S,x,O){var $=a&b,q=Zi(e),Y=q.length,le=Zi(t),ce=le.length;if(Y!=ce&&!$)return!1;for(var he=Y;he--;){var _e=q[he];if(!($?_e in t:lt.call(t,_e)))return!1}var Le=O.get(e),Be=O.get(t);if(Le&&Be)return Le==t&&Be==e;var ze=!0;O.set(e,t),O.set(t,e);for(var je=$;++he<Y;){_e=q[he];var Je=e[_e],Qe=t[_e];if(S)var Xt=$?S(Qe,Je,_e,t,e,O):S(Je,Qe,_e,e,t,O);if(!(Xt===r?Je===Qe||x(Je,Qe,a,S,O):Xt)){ze=!1;break}je||(je=_e=="constructor")}if(ze&&!je){var Gt=e.constructor,Zt=t.constructor;Gt!=Zt&&"constructor"in e&&"constructor"in t&&!(typeof Gt=="function"&&Gt instanceof Gt&&typeof Zt=="function"&&Zt instanceof Zt)&&(ze=!1)}return O.delete(e),O.delete(t),ze}function Tn(e){return as(lo(e,r,bo),e+"")}function Zi(e){return Ea(e,Dt,ns)}function Qi(e){return Ea(e,Kt,io)}var es=Gr?function(e){return Gr.get(e)}:bs;function ti(e){for(var t=e.name+"",a=er[t],S=lt.call(er,t)?a.length:0;S--;){var x=a[S],O=x.func;if(O==null||O==e)return x.name}return t}function ir(e){var t=lt.call(M,"placeholder")?M:e;return t.placeholder}function He(){var e=M.iteratee||ys;return e=e===ys?wa:e,arguments.length?e(arguments[0],arguments[1]):e}function ni(e,t){var a=e.__data__;return Fu(t)?a[typeof t=="string"?"string":"hash"]:a.map}function ts(e){for(var t=Dt(e),a=t.length;a--;){var S=t[a],x=e[S];t[a]=[S,x,oo(x)]}return t}function Wn(e,t){var a=Gp(e,t);return _a(a)?a:r}function Cu(e){var t=lt.call(e,Bn),a=e[Bn];try{e[Bn]=r;var S=!0}catch(O){}var x=Mr.call(e);return S&&(t?e[Bn]=a:delete e[Bn]),x}var ns=Ri?function(e){return e==null?[]:(e=ut(e),In(Ri(e),function(t){return ua.call(e,t)}))}:As,io=Ri?function(e){for(var t=[];e;)xn(t,ns(e)),e=kr(e);return t}:As,kt=Bt;(Di&&kt(new Di(new ArrayBuffer(1)))!=Ge||cr&&kt(new cr)!=Oe||Ci&&kt(Ci.resolve())!=Me||Qn&&kt(new Qn)!=we||fr&&kt(new fr)!=ge)&&(kt=function(e){var t=Bt(e),a=t==tt?e.constructor:r,S=a?Kn(a):"";if(S)switch(S){case dl:return Ge;case ml:return Oe;case hl:return Me;case gl:return we;case yl:return ge}return t});function Nu(e,t,a){for(var S=-1,x=a.length;++S<x;){var O=a[S],$=O.size;switch(O.type){case"drop":e+=$;break;case"dropRight":t-=$;break;case"take":t=Ot(t,e+$);break;case"takeRight":e=xt(e,t-$);break}}return{start:e,end:t}}function Mu(e){var t=e.match(pe);return t?t[1].split(oe):[]}function so(e,t,a){t=Mn(t,e);for(var S=-1,x=t.length,O=!1;++S<x;){var $=gn(t[S]);if(!(O=e!=null&&a(e,$)))break;e=e[$]}return O||++S!=x?O:(x=e==null?0:e.length,!!x&&li(x)&&Sn($,x)&&(Ke(e)||qn(e)))}function Lu(e){var t=e.length,a=new e.constructor(t);return t&&typeof e[0]=="string"&&lt.call(e,"index")&&(a.index=e.index,a.input=e.input),a}function ao(e){return typeof e.constructor=="function"&&!Tr(e)?tr(kr(e)):{}}function Ou(e,t,a){var S=e.constructor;switch(t){case Ue:return Yi(e);case bt:case At:return new S(+e);case Ge:return vu(e,a);case qe:case et:case ot:case ht:case Ht:case Lt:case wt:case fn:case dn:return Ua(e,a);case Oe:return new S;case mt:case X:return new S(e);case Ce:return bu(e);case we:return new S;case ye:return Au(e)}}function ku(e,t){var a=t.length;if(!a)return e;var S=a-1;return t[S]=(a>1?"& ":"")+t[S],t=t.join(a>2?", ":" "),e.replace(ne,`{
/* [wrapped with `+t+`] */
`)}function Hu(e){return Ke(e)||qn(e)||!!(ca&&e&&e[ca])}function Sn(e,t){var a=typeof e;return t=t==null?U:t,!!t&&(a=="number"||a!="symbol"&&fi.test(e))&&e>-1&&e%1==0&&e<t}function jt(e,t,a){if(!vt(a))return!1;var S=typeof t;return(S=="number"?Wt(a)&&Sn(t,a.length):S=="string"&&t in a)?un(a[t],e):!1}function rs(e,t){if(Ke(e))return!1;var a=typeof e;return a=="number"||a=="symbol"||a=="boolean"||e==null||Jt(e)?!0:ve.test(e)||!se.test(e)||t!=null&&e in ut(t)}function Fu(e){var t=typeof e;return t=="string"||t=="number"||t=="symbol"||t=="boolean"?e!=="__proto__":e===null}function is(e){var t=ti(e),a=M[t];if(typeof a!="function"||!(t in Ze.prototype))return!1;if(e===a)return!0;var S=es(a);return!!S&&e===S[0]}function Bu(e){return!!oa&&oa in e}var ju=Cr?En:Ts;function Tr(e){var t=e&&e.constructor,a=typeof t=="function"&&t.prototype||Zn;return e===a}function oo(e){return e===e&&!vt(e)}function po(e,t){return function(a){return a==null?!1:a[e]===t&&(t!==r||e in ut(a))}}function Gu(e){var t=oi(e,function(S){return a.size===v&&a.clear(),S}),a=t.cache;return t}function Uu(e,t){var a=e[1],S=t[1],x=a|S,O=x<(T|_|C),$=S==C&&a==E||S==C&&a==R&&e[7].length<=t[8]||S==(C|R)&&t[7].length<=t[8]&&a==E;if(!(O||$))return e;S&T&&(e[2]=t[2],x|=a&T?0:A);var q=t[3];if(q){var Y=e[3];e[3]=Y?Wa(Y,q,t[4]):q,e[4]=Y?Rn(e[3],s):t[4]}return q=t[5],q&&(Y=e[5],e[5]=Y?Ka(Y,q,t[6]):q,e[6]=Y?Rn(e[5],s):t[6]),q=t[7],q&&(e[7]=q),S&C&&(e[8]=e[8]==null?t[8]:Ot(e[8],t[8])),e[9]==null&&(e[9]=t[9]),e[0]=t[0],e[1]=x,e}function $u(e){var t=[];if(e!=null)for(var a in ut(e))t.push(a);return t}function Wu(e){return Mr.call(e)}function lo(e,t,a){return t=xt(t===r?e.length-1:t,0),function(){for(var S=arguments,x=-1,O=xt(S.length-t,0),$=te(O);++x<O;)$[x]=S[t+x];x=-1;for(var q=te(t+1);++x<t;)q[x]=S[x];return q[t]=a($),Vt(e,this,q)}}function uo(e,t){return t.length<2?e:$n(e,sn(t,0,-1))}function Ku(e,t){for(var a=e.length,S=Ot(t.length,a),x=$t(e);S--;){var O=t[S];e[S]=Sn(O,a)?x[O]:r}return e}function ss(e,t){if(!(t==="constructor"&&typeof e[t]=="function")&&t!="__proto__")return e[t]}var co=mo(La),Sr=al||function(e,t){return Nt.setTimeout(e,t)},as=mo(mu);function fo(e,t,a){var S=t+"";return as(e,ku(S,qu(Mu(S),a)))}function mo(e){var t=0,a=0;return function(){var S=ul(),x=W-(S-a);if(a=S,x>0){if(++t>=G)return arguments[0]}else t=0;return e.apply(r,arguments)}}function ri(e,t){var a=-1,S=e.length,x=S-1;for(t=t===r?S:t;++a<t;){var O=Ui(a,x),$=e[O];e[O]=e[a],e[a]=$}return e.length=t,e}var ho=Gu(function(e){var t=[];return e.charCodeAt(0)===46&&t.push(""),e.replace(Ee,function(a,S,x,O){t.push(x?O.replace(Ne,"$1"):S||a)}),t});function gn(e){if(typeof e=="string"||Jt(e))return e;var t=e+"";return t=="0"&&1/e==-K?"-0":t}function Kn(e){if(e!=null){try{return Nr.call(e)}catch(t){}try{return e+""}catch(t){}}return""}function qu(e,t){return en(Ae,function(a){var S="_."+a[0];t&a[1]&&!wr(e,S)&&e.push(S)}),e.sort()}function go(e){if(e instanceof Ze)return e.clone();var t=new nn(e.__wrapped__,e.__chain__);return t.__actions__=$t(e.__actions__),t.__index__=e.__index__,t.__values__=e.__values__,t}function Vu(e,t,a){(a?jt(e,t,a):t===r)?t=1:t=xt(Ve(t),0);var S=e==null?0:e.length;if(!S||t<1)return[];for(var x=0,O=0,$=te(Br(S/t));x<S;)$[O++]=sn(e,x,x+=t);return $}function zu(e){for(var t=-1,a=e==null?0:e.length,S=0,x=[];++t<a;){var O=e[t];O&&(x[S++]=O)}return x}function Yu(){var e=arguments.length;if(!e)return[];for(var t=te(e-1),a=arguments[0],S=e;S--;)t[S-1]=arguments[S];return xn(Ke(a)?$t(a):[a],Mt(t,1))}var Ju=Ye(function(e,t){return Pt(e)?gr(e,Mt(t,1,Pt,!0)):[]}),Xu=Ye(function(e,t){var a=an(t);return Pt(a)&&(a=r),Pt(e)?gr(e,Mt(t,1,Pt,!0),He(a,2)):[]}),Zu=Ye(function(e,t){var a=an(t);return Pt(a)&&(a=r),Pt(e)?gr(e,Mt(t,1,Pt,!0),r,a):[]});function Qu(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===r?1:Ve(t),sn(e,t<0?0:t,S)):[]}function e0(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===r?1:Ve(t),t=S-t,sn(e,0,t<0?0:t)):[]}function t0(e,t){return e&&e.length?Yr(e,He(t,3),!0,!0):[]}function n0(e,t){return e&&e.length?Yr(e,He(t,3),!0):[]}function r0(e,t,a,S){var x=e==null?0:e.length;return x?(a&&typeof a!="number"&&jt(e,t,a)&&(a=0,S=x),Yl(e,t,a,S)):[]}function yo(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=a==null?0:Ve(a);return x<0&&(x=xt(S+x,0)),Ir(e,He(t,3),x)}function vo(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=S-1;return a!==r&&(x=Ve(a),x=a<0?xt(S+x,0):Ot(x,S-1)),Ir(e,He(t,3),x,!0)}function bo(e){var t=e==null?0:e.length;return t?Mt(e,1):[]}function i0(e){var t=e==null?0:e.length;return t?Mt(e,K):[]}function s0(e,t){var a=e==null?0:e.length;return a?(t=t===r?1:Ve(t),Mt(e,t)):[]}function a0(e){for(var t=-1,a=e==null?0:e.length,S={};++t<a;){var x=e[t];S[x[0]]=x[1]}return S}function Ao(e){return e&&e.length?e[0]:r}function o0(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=a==null?0:Ve(a);return x<0&&(x=xt(S+x,0)),Yn(e,t,x)}function p0(e){var t=e==null?0:e.length;return t?sn(e,0,-1):[]}var l0=Ye(function(e){var t=yt(e,Vi);return t.length&&t[0]===e[0]?Hi(t):[]}),u0=Ye(function(e){var t=an(e),a=yt(e,Vi);return t===an(a)?t=r:a.pop(),a.length&&a[0]===e[0]?Hi(a,He(t,2)):[]}),c0=Ye(function(e){var t=an(e),a=yt(e,Vi);return t=typeof t=="function"?t:r,t&&a.pop(),a.length&&a[0]===e[0]?Hi(a,r,t):[]});function f0(e,t){return e==null?"":pl.call(e,t)}function an(e){var t=e==null?0:e.length;return t?e[t-1]:r}function d0(e,t,a){var S=e==null?0:e.length;if(!S)return-1;var x=S;return a!==r&&(x=Ve(a),x=x<0?xt(S+x,0):Ot(x,S-1)),t===t?qp(e,t,x):Ir(e,Qs,x,!0)}function m0(e,t){return e&&e.length?Da(e,Ve(t)):r}var h0=Ye(To);function To(e,t){return e&&e.length&&t&&t.length?Gi(e,t):e}function g0(e,t,a){return e&&e.length&&t&&t.length?Gi(e,t,He(a,2)):e}function y0(e,t,a){return e&&e.length&&t&&t.length?Gi(e,t,r,a):e}var v0=Tn(function(e,t){var a=e==null?0:e.length,S=Mi(e,t);return Ma(e,yt(t,function(x){return Sn(x,a)?+x:x}).sort($a)),S});function b0(e,t){var a=[];if(!(e&&e.length))return a;var S=-1,x=[],O=e.length;for(t=He(t,3);++S<O;){var $=e[S];t($,S,e)&&(a.push($),x.push(S))}return Ma(e,x),a}function os(e){return e==null?e:fl.call(e)}function A0(e,t,a){var S=e==null?0:e.length;return S?(a&&typeof a!="number"&&jt(e,t,a)?(t=0,a=S):(t=t==null?0:Ve(t),a=a===r?S:Ve(a)),sn(e,t,a)):[]}function T0(e,t){return zr(e,t)}function S0(e,t,a){return Wi(e,t,He(a,2))}function E0(e,t){var a=e==null?0:e.length;if(a){var S=zr(e,t);if(S<a&&un(e[S],t))return S}return-1}function P0(e,t){return zr(e,t,!0)}function _0(e,t,a){return Wi(e,t,He(a,2),!0)}function w0(e,t){var a=e==null?0:e.length;if(a){var S=zr(e,t,!0)-1;if(un(e[S],t))return S}return-1}function I0(e){return e&&e.length?Oa(e):[]}function x0(e,t){return e&&e.length?Oa(e,He(t,2)):[]}function R0(e){var t=e==null?0:e.length;return t?sn(e,1,t):[]}function D0(e,t,a){return e&&e.length?(t=a||t===r?1:Ve(t),sn(e,0,t<0?0:t)):[]}function C0(e,t,a){var S=e==null?0:e.length;return S?(t=a||t===r?1:Ve(t),t=S-t,sn(e,t<0?0:t,S)):[]}function N0(e,t){return e&&e.length?Yr(e,He(t,3),!1,!0):[]}function M0(e,t){return e&&e.length?Yr(e,He(t,3)):[]}var L0=Ye(function(e){return Nn(Mt(e,1,Pt,!0))}),O0=Ye(function(e){var t=an(e);return Pt(t)&&(t=r),Nn(Mt(e,1,Pt,!0),He(t,2))}),k0=Ye(function(e){var t=an(e);return t=typeof t=="function"?t:r,Nn(Mt(e,1,Pt,!0),r,t)});function H0(e){return e&&e.length?Nn(e):[]}function F0(e,t){return e&&e.length?Nn(e,He(t,2)):[]}function B0(e,t){return t=typeof t=="function"?t:r,e&&e.length?Nn(e,r,t):[]}function ps(e){if(!(e&&e.length))return[];var t=0;return e=In(e,function(a){if(Pt(a))return t=xt(a.length,t),!0}),_i(t,function(a){return yt(e,Si(a))})}function So(e,t){if(!(e&&e.length))return[];var a=ps(e);return t==null?a:yt(a,function(S){return Vt(t,r,S)})}var j0=Ye(function(e,t){return Pt(e)?gr(e,t):[]}),G0=Ye(function(e){return qi(In(e,Pt))}),U0=Ye(function(e){var t=an(e);return Pt(t)&&(t=r),qi(In(e,Pt),He(t,2))}),$0=Ye(function(e){var t=an(e);return t=typeof t=="function"?t:r,qi(In(e,Pt),r,t)}),W0=Ye(ps);function K0(e,t){return Ba(e||[],t||[],hr)}function q0(e,t){return Ba(e||[],t||[],br)}var V0=Ye(function(e){var t=e.length,a=t>1?e[t-1]:r;return a=typeof a=="function"?(e.pop(),a):r,So(e,a)});function Eo(e){var t=M(e);return t.__chain__=!0,t}function z0(e,t){return t(e),e}function ii(e,t){return t(e)}var Y0=Tn(function(e){var t=e.length,a=t?e[0]:0,S=this.__wrapped__,x=function(O){return Mi(O,e)};return t>1||this.__actions__.length||!(S instanceof Ze)||!Sn(a)?this.thru(x):(S=S.slice(a,+a+(t?1:0)),S.__actions__.push({func:ii,args:[x],thisArg:r}),new nn(S,this.__chain__).thru(function(O){return t&&!O.length&&O.push(r),O}))});function J0(){return Eo(this)}function X0(){return new nn(this.value(),this.__chain__)}function Z0(){this.__values__===r&&(this.__values__=Ho(this.value()));var e=this.__index__>=this.__values__.length,t=e?r:this.__values__[this.__index__++];return{done:e,value:t}}function Q0(){return this}function ec(e){for(var t,a=this;a instanceof $r;){var S=go(a);S.__index__=0,S.__values__=r,t?x.__wrapped__=S:t=S;var x=S;a=a.__wrapped__}return x.__wrapped__=e,t}function tc(){var e=this.__wrapped__;if(e instanceof Ze){var t=e;return this.__actions__.length&&(t=new Ze(this)),t=t.reverse(),t.__actions__.push({func:ii,args:[os],thisArg:r}),new nn(t,this.__chain__)}return this.thru(os)}function nc(){return Fa(this.__wrapped__,this.__actions__)}var rc=Jr(function(e,t,a){lt.call(e,a)?++e[a]:bn(e,a,1)});function ic(e,t,a){var S=Ke(e)?Xs:zl;return a&&jt(e,t,a)&&(t=r),S(e,He(t,3))}function sc(e,t){var a=Ke(e)?In:Ta;return a(e,He(t,3))}var ac=Ya(yo),oc=Ya(vo);function pc(e,t){return Mt(si(e,t),1)}function lc(e,t){return Mt(si(e,t),K)}function uc(e,t,a){return a=a===r?1:Ve(a),Mt(si(e,t),a)}function Po(e,t){var a=Ke(e)?en:Cn;return a(e,He(t,3))}function _o(e,t){var a=Ke(e)?Rp:Aa;return a(e,He(t,3))}var cc=Jr(function(e,t,a){lt.call(e,a)?e[a].push(t):bn(e,a,[t])});function fc(e,t,a,S){e=Wt(e)?e:ar(e),a=a&&!S?Ve(a):0;var x=e.length;return a<0&&(a=xt(x+a,0)),ui(e)?a<=x&&e.indexOf(t,a)>-1:!!x&&Yn(e,t,a)>-1}var dc=Ye(function(e,t,a){var S=-1,x=typeof t=="function",O=Wt(e)?te(e.length):[];return Cn(e,function($){O[++S]=x?Vt(t,$,a):yr($,t,a)}),O}),mc=Jr(function(e,t,a){bn(e,a,t)});function si(e,t){var a=Ke(e)?yt:Ia;return a(e,He(t,3))}function hc(e,t,a,S){return e==null?[]:(Ke(t)||(t=t==null?[]:[t]),a=S?r:a,Ke(a)||(a=a==null?[]:[a]),Ca(e,t,a))}var gc=Jr(function(e,t,a){e[a?0:1].push(t)},function(){return[[],[]]});function yc(e,t,a){var S=Ke(e)?Ai:ta,x=arguments.length<3;return S(e,He(t,4),a,x,Cn)}function vc(e,t,a){var S=Ke(e)?Dp:ta,x=arguments.length<3;return S(e,He(t,4),a,x,Aa)}function bc(e,t){var a=Ke(e)?In:Ta;return a(e,pi(He(t,3)))}function Ac(e){var t=Ke(e)?ga:fu;return t(e)}function Tc(e,t,a){(a?jt(e,t,a):t===r)?t=1:t=Ve(t);var S=Ke(e)?$l:du;return S(e,t)}function Sc(e){var t=Ke(e)?Wl:hu;return t(e)}function Ec(e){if(e==null)return 0;if(Wt(e))return ui(e)?Xn(e):e.length;var t=kt(e);return t==Oe||t==we?e.size:Bi(e).length}function Pc(e,t,a){var S=Ke(e)?Ti:gu;return a&&jt(e,t,a)&&(t=r),S(e,He(t,3))}var _c=Ye(function(e,t){if(e==null)return[];var a=t.length;return a>1&&jt(e,t[0],t[1])?t=[]:a>2&&jt(t[0],t[1],t[2])&&(t=[t[0]]),Ca(e,Mt(t,1),[])}),ai=sl||function(){return Nt.Date.now()};function wc(e,t){if(typeof t!="function")throw new tn(f);return e=Ve(e),function(){if(--e<1)return t.apply(this,arguments)}}function wo(e,t,a){return t=a?r:t,t=e&&t==null?e.length:t,An(e,C,r,r,r,r,t)}function Io(e,t){var a;if(typeof t!="function")throw new tn(f);return e=Ve(e),function(){return--e>0&&(a=t.apply(this,arguments)),e<=1&&(t=r),a}}var ls=Ye(function(e,t,a){var S=T;if(a.length){var x=Rn(a,ir(ls));S|=N}return An(e,S,t,a,x)}),xo=Ye(function(e,t,a){var S=T|_;if(a.length){var x=Rn(a,ir(xo));S|=N}return An(t,S,e,a,x)});function Ro(e,t,a){t=a?r:t;var S=An(e,E,r,r,r,r,r,t);return S.placeholder=Ro.placeholder,S}function Do(e,t,a){t=a?r:t;var S=An(e,I,r,r,r,r,r,t);return S.placeholder=Do.placeholder,S}function Co(e,t,a){var S,x,O,$,q,Y,le=0,ce=!1,he=!1,_e=!0;if(typeof e!="function")throw new tn(f);t=on(t)||0,vt(a)&&(ce=!!a.leading,he="maxWait"in a,O=he?xt(on(a.maxWait)||0,t):O,_e="trailing"in a?!!a.trailing:_e);function Le(_t){var cn=S,_n=x;return S=x=r,le=_t,$=e.apply(_n,cn),$}function Be(_t){return le=_t,q=Sr(Je,t),ce?Le(_t):$}function ze(_t){var cn=_t-Y,_n=_t-le,Jo=t-cn;return he?Ot(Jo,O-_n):Jo}function je(_t){var cn=_t-Y,_n=_t-le;return Y===r||cn>=t||cn<0||he&&_n>=O}function Je(){var _t=ai();if(je(_t))return Qe(_t);q=Sr(Je,ze(_t))}function Qe(_t){return q=r,_e&&S?Le(_t):(S=x=r,$)}function Xt(){q!==r&&ja(q),le=0,S=Y=x=q=r}function Gt(){return q===r?$:Qe(ai())}function Zt(){var _t=ai(),cn=je(_t);if(S=arguments,x=this,Y=_t,cn){if(q===r)return Be(Y);if(he)return ja(q),q=Sr(Je,t),Le(Y)}return q===r&&(q=Sr(Je,t)),$}return Zt.cancel=Xt,Zt.flush=Gt,Zt}var Ic=Ye(function(e,t){return ba(e,1,t)}),xc=Ye(function(e,t,a){return ba(e,on(t)||0,a)});function Rc(e){return An(e,w)}function oi(e,t){if(typeof e!="function"||t!=null&&typeof t!="function")throw new tn(f);var a=function(){var S=arguments,x=t?t.apply(this,S):S[0],O=a.cache;if(O.has(x))return O.get(x);var $=e.apply(this,S);return a.cache=O.set(x,$)||O,$};return a.cache=new(oi.Cache||vn),a}oi.Cache=vn;function pi(e){if(typeof e!="function")throw new tn(f);return function(){var t=arguments;switch(t.length){case 0:return!e.call(this);case 1:return!e.call(this,t[0]);case 2:return!e.call(this,t[0],t[1]);case 3:return!e.call(this,t[0],t[1],t[2])}return!e.apply(this,t)}}function Dc(e){return Io(2,e)}var Cc=yu(function(e,t){t=t.length==1&&Ke(t[0])?yt(t[0],zt(He())):yt(Mt(t,1),zt(He()));var a=t.length;return Ye(function(S){for(var x=-1,O=Ot(S.length,a);++x<O;)S[x]=t[x].call(this,S[x]);return Vt(e,this,S)})}),us=Ye(function(e,t){var a=Rn(t,ir(us));return An(e,N,r,t,a)}),No=Ye(function(e,t){var a=Rn(t,ir(No));return An(e,B,r,t,a)}),Nc=Tn(function(e,t){return An(e,R,r,r,r,t)});function Mc(e,t){if(typeof e!="function")throw new tn(f);return t=t===r?t:Ve(t),Ye(e,t)}function Lc(e,t){if(typeof e!="function")throw new tn(f);return t=t==null?0:xt(Ve(t),0),Ye(function(a){var S=a[t],x=Ln(a,0,t);return S&&xn(x,S),Vt(e,this,x)})}function Oc(e,t,a){var S=!0,x=!0;if(typeof e!="function")throw new tn(f);return vt(a)&&(S="leading"in a?!!a.leading:S,x="trailing"in a?!!a.trailing:x),Co(e,t,{leading:S,maxWait:t,trailing:x})}function kc(e){return wo(e,1)}function Hc(e,t){return us(zi(t),e)}function Fc(){if(!arguments.length)return[];var e=arguments[0];return Ke(e)?e:[e]}function Bc(e){return rn(e,c)}function jc(e,t){return t=typeof t=="function"?t:r,rn(e,c,t)}function Gc(e){return rn(e,g|c)}function Uc(e,t){return t=typeof t=="function"?t:r,rn(e,g|c,t)}function $c(e,t){return t==null||va(e,t,Dt(t))}function un(e,t){return e===t||e!==e&&t!==t}var Wc=ei(ki),Kc=ei(function(e,t){return e>=t}),qn=Pa(function(){return arguments}())?Pa:function(e){return Et(e)&&lt.call(e,"callee")&&!ua.call(e,"callee")},Ke=te.isArray,qc=Ks?zt(Ks):eu;function Wt(e){return e!=null&&li(e.length)&&!En(e)}function Pt(e){return Et(e)&&Wt(e)}function Vc(e){return e===!0||e===!1||Et(e)&&Bt(e)==bt}var On=ol||Ts,zc=qs?zt(qs):tu;function Yc(e){return Et(e)&&e.nodeType===1&&!Er(e)}function Jc(e){if(e==null)return!0;if(Wt(e)&&(Ke(e)||typeof e=="string"||typeof e.splice=="function"||On(e)||sr(e)||qn(e)))return!e.length;var t=kt(e);if(t==Oe||t==we)return!e.size;if(Tr(e))return!Bi(e).length;for(var a in e)if(lt.call(e,a))return!1;return!0}function Xc(e,t){return vr(e,t)}function Zc(e,t,a){a=typeof a=="function"?a:r;var S=a?a(e,t):r;return S===r?vr(e,t,r,a):!!S}function cs(e){if(!Et(e))return!1;var t=Bt(e);return t==fe||t==Rt||typeof e.message=="string"&&typeof e.name=="string"&&!Er(e)}function Qc(e){return typeof e=="number"&&fa(e)}function En(e){if(!vt(e))return!1;var t=Bt(e);return t==xe||t==Te||t==dt||t==de}function Mo(e){return typeof e=="number"&&e==Ve(e)}function li(e){return typeof e=="number"&&e>-1&&e%1==0&&e<=U}function vt(e){var t=typeof e;return e!=null&&(t=="object"||t=="function")}function Et(e){return e!=null&&typeof e=="object"}var Lo=Vs?zt(Vs):ru;function ef(e,t){return e===t||Fi(e,t,ts(t))}function tf(e,t,a){return a=typeof a=="function"?a:r,Fi(e,t,ts(t),a)}function nf(e){return Oo(e)&&e!=+e}function rf(e){if(ju(e))throw new We(m);return _a(e)}function sf(e){return e===null}function af(e){return e==null}function Oo(e){return typeof e=="number"||Et(e)&&Bt(e)==mt}function Er(e){if(!Et(e)||Bt(e)!=tt)return!1;var t=kr(e);if(t===null)return!0;var a=lt.call(t,"constructor")&&t.constructor;return typeof a=="function"&&a instanceof a&&Nr.call(a)==tl}var fs=zs?zt(zs):iu;function of(e){return Mo(e)&&e>=-U&&e<=U}var ko=Ys?zt(Ys):su;function ui(e){return typeof e=="string"||!Ke(e)&&Et(e)&&Bt(e)==X}function Jt(e){return typeof e=="symbol"||Et(e)&&Bt(e)==ye}var sr=Js?zt(Js):au;function pf(e){return e===r}function lf(e){return Et(e)&&kt(e)==ge}function uf(e){return Et(e)&&Bt(e)==ke}var cf=ei(ji),ff=ei(function(e,t){return e<=t});function Ho(e){if(!e)return[];if(Wt(e))return ui(e)?pn(e):$t(e);if(ur&&e[ur])return $p(e[ur]());var t=kt(e),a=t==Oe?Ii:t==we?xr:ar;return a(e)}function Pn(e){if(!e)return e===0?e:0;if(e=on(e),e===K||e===-K){var t=e<0?-1:1;return t*Z}return e===e?e:0}function Ve(e){var t=Pn(e),a=t%1;return t===t?a?t-a:t:0}function Fo(e){return e?Un(Ve(e),0,ue):0}function on(e){if(typeof e=="number")return e;if(Jt(e))return ie;if(vt(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=vt(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=na(e);var a=gt.test(e);return a||nt.test(e)?wp(e.slice(2),a?2:8):Ct.test(e)?ie:+e}function Bo(e){return hn(e,Kt(e))}function df(e){return e?Un(Ve(e),-U,U):e===0?e:0}function at(e){return e==null?"":Yt(e)}var mf=nr(function(e,t){if(Tr(t)||Wt(t)){hn(t,Dt(t),e);return}for(var a in t)lt.call(t,a)&&hr(e,a,t[a])}),jo=nr(function(e,t){hn(t,Kt(t),e)}),ci=nr(function(e,t,a,S){hn(t,Kt(t),e,S)}),hf=nr(function(e,t,a,S){hn(t,Dt(t),e,S)}),gf=Tn(Mi);function yf(e,t){var a=tr(e);return t==null?a:ya(a,t)}var vf=Ye(function(e,t){e=ut(e);var a=-1,S=t.length,x=S>2?t[2]:r;for(x&&jt(t[0],t[1],x)&&(S=1);++a<S;)for(var O=t[a],$=Kt(O),q=-1,Y=$.length;++q<Y;){var le=$[q],ce=e[le];(ce===r||un(ce,Zn[le])&&!lt.call(e,le))&&(e[le]=O[le])}return e}),bf=Ye(function(e){return e.push(r,no),Vt(Go,r,e)});function Af(e,t){return Zs(e,He(t,3),mn)}function Tf(e,t){return Zs(e,He(t,3),Oi)}function Sf(e,t){return e==null?e:Li(e,He(t,3),Kt)}function Ef(e,t){return e==null?e:Sa(e,He(t,3),Kt)}function Pf(e,t){return e&&mn(e,He(t,3))}function _f(e,t){return e&&Oi(e,He(t,3))}function wf(e){return e==null?[]:qr(e,Dt(e))}function If(e){return e==null?[]:qr(e,Kt(e))}function ds(e,t,a){var S=e==null?r:$n(e,t);return S===r?a:S}function xf(e,t){return e!=null&&so(e,t,Jl)}function ms(e,t){return e!=null&&so(e,t,Xl)}var Rf=Xa(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Mr.call(t)),e[t]=a},gs(qt)),Df=Xa(function(e,t,a){t!=null&&typeof t.toString!="function"&&(t=Mr.call(t)),lt.call(e,t)?e[t].push(a):e[t]=[a]},He),Cf=Ye(yr);function Dt(e){return Wt(e)?ha(e):Bi(e)}function Kt(e){return Wt(e)?ha(e,!0):ou(e)}function Nf(e,t){var a={};return t=He(t,3),mn(e,function(S,x,O){bn(a,t(S,x,O),S)}),a}function Mf(e,t){var a={};return t=He(t,3),mn(e,function(S,x,O){bn(a,x,t(S,x,O))}),a}var Lf=nr(function(e,t,a){Vr(e,t,a)}),Go=nr(function(e,t,a,S){Vr(e,t,a,S)}),Of=Tn(function(e,t){var a={};if(e==null)return a;var S=!1;t=yt(t,function(O){return O=Mn(O,e),S||(S=O.length>1),O}),hn(e,Qi(e),a),S&&(a=rn(a,g|d|c,xu));for(var x=t.length;x--;)Ki(a,t[x]);return a});function kf(e,t){return Uo(e,pi(He(t)))}var Hf=Tn(function(e,t){return e==null?{}:lu(e,t)});function Uo(e,t){if(e==null)return{};var a=yt(Qi(e),function(S){return[S]});return t=He(t),Na(e,a,function(S,x){return t(S,x[0])})}function Ff(e,t,a){t=Mn(t,e);var S=-1,x=t.length;for(x||(x=1,e=r);++S<x;){var O=e==null?r:e[gn(t[S])];O===r&&(S=x,O=a),e=En(O)?O.call(e):O}return e}function Bf(e,t,a){return e==null?e:br(e,t,a)}function jf(e,t,a,S){return S=typeof S=="function"?S:r,e==null?e:br(e,t,a,S)}var $o=eo(Dt),Wo=eo(Kt);function Gf(e,t,a){var S=Ke(e),x=S||On(e)||sr(e);if(t=He(t,4),a==null){var O=e&&e.constructor;x?a=S?new O:[]:vt(e)?a=En(O)?tr(kr(e)):{}:a={}}return(x?en:mn)(e,function($,q,Y){return t(a,$,q,Y)}),a}function Uf(e,t){return e==null?!0:Ki(e,t)}function $f(e,t,a){return e==null?e:Ha(e,t,zi(a))}function Wf(e,t,a,S){return S=typeof S=="function"?S:r,e==null?e:Ha(e,t,zi(a),S)}function ar(e){return e==null?[]:wi(e,Dt(e))}function Kf(e){return e==null?[]:wi(e,Kt(e))}function qf(e,t,a){return a===r&&(a=t,t=r),a!==r&&(a=on(a),a=a===a?a:0),t!==r&&(t=on(t),t=t===t?t:0),Un(on(e),t,a)}function Vf(e,t,a){return t=Pn(t),a===r?(a=t,t=0):a=Pn(a),e=on(e),Zl(e,t,a)}function zf(e,t,a){if(a&&typeof a!="boolean"&&jt(e,t,a)&&(t=a=r),a===r&&(typeof t=="boolean"?(a=t,t=r):typeof e=="boolean"&&(a=e,e=r)),e===r&&t===r?(e=0,t=1):(e=Pn(e),t===r?(t=e,e=0):t=Pn(t)),e>t){var S=e;e=t,t=S}if(a||e%1||t%1){var x=da();return Ot(e+x*(t-e+_p("1e-"+((x+"").length-1))),t)}return Ui(e,t)}var Yf=rr(function(e,t,a){return t=t.toLowerCase(),e+(a?Ko(t):t)});function Ko(e){return hs(at(e).toLowerCase())}function qo(e){return e=at(e),e&&e.replace(Es,Fp).replace(hp,"")}function Jf(e,t,a){e=at(e),t=Yt(t);var S=e.length;a=a===r?S:Un(Ve(a),0,S);var x=a;return a-=t.length,a>=0&&e.slice(a,x)==t}function Xf(e){return e=at(e),e&&j.test(e)?e.replace(Tt,Bp):e}function Zf(e){return e=at(e),e&&Pe.test(e)?e.replace(De,"\\$&"):e}var Qf=rr(function(e,t,a){return e+(a?"-":"")+t.toLowerCase()}),ed=rr(function(e,t,a){return e+(a?" ":"")+t.toLowerCase()}),td=za("toLowerCase");function nd(e,t,a){e=at(e),t=Ve(t);var S=t?Xn(e):0;if(!t||S>=t)return e;var x=(t-S)/2;return Qr(jr(x),a)+e+Qr(Br(x),a)}function rd(e,t,a){e=at(e),t=Ve(t);var S=t?Xn(e):0;return t&&S<t?e+Qr(t-S,a):e}function id(e,t,a){e=at(e),t=Ve(t);var S=t?Xn(e):0;return t&&S<t?Qr(t-S,a)+e:e}function sd(e,t,a){return a||t==null?t=0:t&&(t=+t),cl(at(e).replace($e,""),t||0)}function ad(e,t,a){return(a?jt(e,t,a):t===r)?t=1:t=Ve(t),$i(at(e),t)}function od(){var e=arguments,t=at(e[0]);return e.length<3?t:t.replace(e[1],e[2])}var pd=rr(function(e,t,a){return e+(a?"_":"")+t.toLowerCase()});function ld(e,t,a){return a&&typeof a!="number"&&jt(e,t,a)&&(t=a=r),a=a===r?ue:a>>>0,a?(e=at(e),e&&(typeof t=="string"||t!=null&&!fs(t))&&(t=Yt(t),!t&&Jn(e))?Ln(pn(e),0,a):e.split(t,a)):[]}var ud=rr(function(e,t,a){return e+(a?" ":"")+hs(t)});function cd(e,t,a){return e=at(e),a=a==null?0:Un(Ve(a),0,e.length),t=Yt(t),e.slice(a,a+t.length)==t}function fd(e,t,a){var S=M.templateSettings;a&&jt(e,t,a)&&(t=r),e=at(e),t=ci({},t,S,to);var x=ci({},t.imports,S.imports,to),O=Dt(x),$=wi(x,O),q,Y,le=0,ce=t.interpolate||or,he="__p += '",_e=xi((t.escape||or).source+"|"+ce.source+"|"+(ce===ee?pt:or).source+"|"+(t.evaluate||or).source+"|$","g"),Le="//# sourceURL="+(lt.call(t,"sourceURL")?(t.sourceURL+"").replace(/\s/g," "):"lodash.templateSources["+ ++Ap+"]")+`
`;e.replace(_e,function(je,Je,Qe,Xt,Gt,Zt){return Qe||(Qe=Xt),he+=e.slice(le,Zt).replace(Vn,jp),Je&&(q=!0,he+=`' +
__e(`+Je+`) +
'`),Gt&&(Y=!0,he+=`';
`+Gt+`;
__p += '`),Qe&&(he+=`' +
((__t = (`+Qe+`)) == null ? '' : __t) +
'`),le=Zt+je.length,je}),he+=`';
`;var Be=lt.call(t,"variable")&&t.variable;if(!Be)he=`with (obj) {
`+he+`
}
`;else if(Fe.test(Be))throw new We(o);he=(Y?he.replace(wn,""):he).replace(kn,"$1").replace(Ft,"$1;"),he="function("+(Be||"obj")+`) {
`+(Be?"":`obj || (obj = {});
`)+"var __t, __p = ''"+(q?", __e = _.escape":"")+(Y?`, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
`:`;
`)+he+`return __p
}`;var ze=zo(function(){return it(O,Le+"return "+he).apply(r,$)});if(ze.source=he,cs(ze))throw ze;return ze}function dd(e){return at(e).toLowerCase()}function md(e){return at(e).toUpperCase()}function hd(e,t,a){if(e=at(e),e&&(a||t===r))return na(e);if(!e||!(t=Yt(t)))return e;var S=pn(e),x=pn(t),O=ra(S,x),$=ia(S,x)+1;return Ln(S,O,$).join("")}function gd(e,t,a){if(e=at(e),e&&(a||t===r))return e.slice(0,aa(e)+1);if(!e||!(t=Yt(t)))return e;var S=pn(e),x=ia(S,pn(t))+1;return Ln(S,0,x).join("")}function yd(e,t,a){if(e=at(e),e&&(a||t===r))return e.replace($e,"");if(!e||!(t=Yt(t)))return e;var S=pn(e),x=ra(S,pn(t));return Ln(S,x).join("")}function vd(e,t){var a=D,S=k;if(vt(t)){var x="separator"in t?t.separator:x;a="length"in t?Ve(t.length):a,S="omission"in t?Yt(t.omission):S}e=at(e);var O=e.length;if(Jn(e)){var $=pn(e);O=$.length}if(a>=O)return e;var q=a-Xn(S);if(q<1)return S;var Y=$?Ln($,0,q).join(""):e.slice(0,q);if(x===r)return Y+S;if($&&(q+=Y.length-q),fs(x)){if(e.slice(q).search(x)){var le,ce=Y;for(x.global||(x=xi(x.source,at(St.exec(x))+"g")),x.lastIndex=0;le=x.exec(ce);)var he=le.index;Y=Y.slice(0,he===r?q:he)}}else if(e.indexOf(Yt(x),q)!=q){var _e=Y.lastIndexOf(x);_e>-1&&(Y=Y.slice(0,_e))}return Y+S}function bd(e){return e=at(e),e&&Fn.test(e)?e.replace(Hn,Vp):e}var Ad=rr(function(e,t,a){return e+(a?" ":"")+t.toUpperCase()}),hs=za("toUpperCase");function Vo(e,t,a){return e=at(e),t=a?r:t,t===r?Up(e)?Jp(e):Mp(e):e.match(t)||[]}var zo=Ye(function(e,t){try{return Vt(e,r,t)}catch(a){return cs(a)?a:new We(a)}}),Td=Tn(function(e,t){return en(t,function(a){a=gn(a),bn(e,a,ls(e[a],e))}),e});function Sd(e){var t=e==null?0:e.length,a=He();return e=t?yt(e,function(S){if(typeof S[1]!="function")throw new tn(f);return[a(S[0]),S[1]]}):[],Ye(function(S){for(var x=-1;++x<t;){var O=e[x];if(Vt(O[0],this,S))return Vt(O[1],this,S)}})}function Ed(e){return Vl(rn(e,g))}function gs(e){return function(){return e}}function Pd(e,t){return e==null||e!==e?t:e}var _d=Ja(),wd=Ja(!0);function qt(e){return e}function ys(e){return wa(typeof e=="function"?e:rn(e,g))}function Id(e){return xa(rn(e,g))}function xd(e,t){return Ra(e,rn(t,g))}var Rd=Ye(function(e,t){return function(a){return yr(a,e,t)}}),Dd=Ye(function(e,t){return function(a){return yr(e,a,t)}});function vs(e,t,a){var S=Dt(t),x=qr(t,S);a==null&&!(vt(t)&&(x.length||!S.length))&&(a=t,t=e,e=this,x=qr(t,Dt(t)));var O=!(vt(a)&&"chain"in a)||!!a.chain,$=En(e);return en(x,function(q){var Y=t[q];e[q]=Y,$&&(e.prototype[q]=function(){var le=this.__chain__;if(O||le){var ce=e(this.__wrapped__),he=ce.__actions__=$t(this.__actions__);return he.push({func:Y,args:arguments,thisArg:e}),ce.__chain__=le,ce}return Y.apply(e,xn([this.value()],arguments))})}),e}function Cd(){return Nt._===this&&(Nt._=nl),this}function bs(){}function Nd(e){return e=Ve(e),Ye(function(t){return Da(t,e)})}var Md=Ji(yt),Ld=Ji(Xs),Od=Ji(Ti);function Yo(e){return rs(e)?Si(gn(e)):uu(e)}function kd(e){return function(t){return e==null?r:$n(e,t)}}var Hd=Za(),Fd=Za(!0);function As(){return[]}function Ts(){return!1}function Bd(){return{}}function jd(){return""}function Gd(){return!0}function Ud(e,t){if(e=Ve(e),e<1||e>U)return[];var a=ue,S=Ot(e,ue);t=He(t),e-=ue;for(var x=_i(S,t);++a<e;)t(a);return x}function $d(e){return Ke(e)?yt(e,gn):Jt(e)?[e]:$t(ho(at(e)))}function Wd(e){var t=++el;return at(e)+t}var Kd=Zr(function(e,t){return e+t},0),qd=Xi("ceil"),Vd=Zr(function(e,t){return e/t},1),zd=Xi("floor");function Yd(e){return e&&e.length?Kr(e,qt,ki):r}function Jd(e,t){return e&&e.length?Kr(e,He(t,2),ki):r}function Xd(e){return ea(e,qt)}function Zd(e,t){return ea(e,He(t,2))}function Qd(e){return e&&e.length?Kr(e,qt,ji):r}function em(e,t){return e&&e.length?Kr(e,He(t,2),ji):r}var tm=Zr(function(e,t){return e*t},1),nm=Xi("round"),rm=Zr(function(e,t){return e-t},0);function im(e){return e&&e.length?Pi(e,qt):0}function sm(e,t){return e&&e.length?Pi(e,He(t,2)):0}return M.after=wc,M.ary=wo,M.assign=mf,M.assignIn=jo,M.assignInWith=ci,M.assignWith=hf,M.at=gf,M.before=Io,M.bind=ls,M.bindAll=Td,M.bindKey=xo,M.castArray=Fc,M.chain=Eo,M.chunk=Vu,M.compact=zu,M.concat=Yu,M.cond=Sd,M.conforms=Ed,M.constant=gs,M.countBy=rc,M.create=yf,M.curry=Ro,M.curryRight=Do,M.debounce=Co,M.defaults=vf,M.defaultsDeep=bf,M.defer=Ic,M.delay=xc,M.difference=Ju,M.differenceBy=Xu,M.differenceWith=Zu,M.drop=Qu,M.dropRight=e0,M.dropRightWhile=t0,M.dropWhile=n0,M.fill=r0,M.filter=sc,M.flatMap=pc,M.flatMapDeep=lc,M.flatMapDepth=uc,M.flatten=bo,M.flattenDeep=i0,M.flattenDepth=s0,M.flip=Rc,M.flow=_d,M.flowRight=wd,M.fromPairs=a0,M.functions=wf,M.functionsIn=If,M.groupBy=cc,M.initial=p0,M.intersection=l0,M.intersectionBy=u0,M.intersectionWith=c0,M.invert=Rf,M.invertBy=Df,M.invokeMap=dc,M.iteratee=ys,M.keyBy=mc,M.keys=Dt,M.keysIn=Kt,M.map=si,M.mapKeys=Nf,M.mapValues=Mf,M.matches=Id,M.matchesProperty=xd,M.memoize=oi,M.merge=Lf,M.mergeWith=Go,M.method=Rd,M.methodOf=Dd,M.mixin=vs,M.negate=pi,M.nthArg=Nd,M.omit=Of,M.omitBy=kf,M.once=Dc,M.orderBy=hc,M.over=Md,M.overArgs=Cc,M.overEvery=Ld,M.overSome=Od,M.partial=us,M.partialRight=No,M.partition=gc,M.pick=Hf,M.pickBy=Uo,M.property=Yo,M.propertyOf=kd,M.pull=h0,M.pullAll=To,M.pullAllBy=g0,M.pullAllWith=y0,M.pullAt=v0,M.range=Hd,M.rangeRight=Fd,M.rearg=Nc,M.reject=bc,M.remove=b0,M.rest=Mc,M.reverse=os,M.sampleSize=Tc,M.set=Bf,M.setWith=jf,M.shuffle=Sc,M.slice=A0,M.sortBy=_c,M.sortedUniq=I0,M.sortedUniqBy=x0,M.split=ld,M.spread=Lc,M.tail=R0,M.take=D0,M.takeRight=C0,M.takeRightWhile=N0,M.takeWhile=M0,M.tap=z0,M.throttle=Oc,M.thru=ii,M.toArray=Ho,M.toPairs=$o,M.toPairsIn=Wo,M.toPath=$d,M.toPlainObject=Bo,M.transform=Gf,M.unary=kc,M.union=L0,M.unionBy=O0,M.unionWith=k0,M.uniq=H0,M.uniqBy=F0,M.uniqWith=B0,M.unset=Uf,M.unzip=ps,M.unzipWith=So,M.update=$f,M.updateWith=Wf,M.values=ar,M.valuesIn=Kf,M.without=j0,M.words=Vo,M.wrap=Hc,M.xor=G0,M.xorBy=U0,M.xorWith=$0,M.zip=W0,M.zipObject=K0,M.zipObjectDeep=q0,M.zipWith=V0,M.entries=$o,M.entriesIn=Wo,M.extend=jo,M.extendWith=ci,vs(M,M),M.add=Kd,M.attempt=zo,M.camelCase=Yf,M.capitalize=Ko,M.ceil=qd,M.clamp=qf,M.clone=Bc,M.cloneDeep=Gc,M.cloneDeepWith=Uc,M.cloneWith=jc,M.conformsTo=$c,M.deburr=qo,M.defaultTo=Pd,M.divide=Vd,M.endsWith=Jf,M.eq=un,M.escape=Xf,M.escapeRegExp=Zf,M.every=ic,M.find=ac,M.findIndex=yo,M.findKey=Af,M.findLast=oc,M.findLastIndex=vo,M.findLastKey=Tf,M.floor=zd,M.forEach=Po,M.forEachRight=_o,M.forIn=Sf,M.forInRight=Ef,M.forOwn=Pf,M.forOwnRight=_f,M.get=ds,M.gt=Wc,M.gte=Kc,M.has=xf,M.hasIn=ms,M.head=Ao,M.identity=qt,M.includes=fc,M.indexOf=o0,M.inRange=Vf,M.invoke=Cf,M.isArguments=qn,M.isArray=Ke,M.isArrayBuffer=qc,M.isArrayLike=Wt,M.isArrayLikeObject=Pt,M.isBoolean=Vc,M.isBuffer=On,M.isDate=zc,M.isElement=Yc,M.isEmpty=Jc,M.isEqual=Xc,M.isEqualWith=Zc,M.isError=cs,M.isFinite=Qc,M.isFunction=En,M.isInteger=Mo,M.isLength=li,M.isMap=Lo,M.isMatch=ef,M.isMatchWith=tf,M.isNaN=nf,M.isNative=rf,M.isNil=af,M.isNull=sf,M.isNumber=Oo,M.isObject=vt,M.isObjectLike=Et,M.isPlainObject=Er,M.isRegExp=fs,M.isSafeInteger=of,M.isSet=ko,M.isString=ui,M.isSymbol=Jt,M.isTypedArray=sr,M.isUndefined=pf,M.isWeakMap=lf,M.isWeakSet=uf,M.join=f0,M.kebabCase=Qf,M.last=an,M.lastIndexOf=d0,M.lowerCase=ed,M.lowerFirst=td,M.lt=cf,M.lte=ff,M.max=Yd,M.maxBy=Jd,M.mean=Xd,M.meanBy=Zd,M.min=Qd,M.minBy=em,M.stubArray=As,M.stubFalse=Ts,M.stubObject=Bd,M.stubString=jd,M.stubTrue=Gd,M.multiply=tm,M.nth=m0,M.noConflict=Cd,M.noop=bs,M.now=ai,M.pad=nd,M.padEnd=rd,M.padStart=id,M.parseInt=sd,M.random=zf,M.reduce=yc,M.reduceRight=vc,M.repeat=ad,M.replace=od,M.result=Ff,M.round=nm,M.runInContext=z,M.sample=Ac,M.size=Ec,M.snakeCase=pd,M.some=Pc,M.sortedIndex=T0,M.sortedIndexBy=S0,M.sortedIndexOf=E0,M.sortedLastIndex=P0,M.sortedLastIndexBy=_0,M.sortedLastIndexOf=w0,M.startCase=ud,M.startsWith=cd,M.subtract=rm,M.sum=im,M.sumBy=sm,M.template=fd,M.times=Ud,M.toFinite=Pn,M.toInteger=Ve,M.toLength=Fo,M.toLower=dd,M.toNumber=on,M.toSafeInteger=df,M.toString=at,M.toUpper=md,M.trim=hd,M.trimEnd=gd,M.trimStart=yd,M.truncate=vd,M.unescape=bd,M.uniqueId=Wd,M.upperCase=Ad,M.upperFirst=hs,M.each=Po,M.eachRight=_o,M.first=Ao,vs(M,function(){var e={};return mn(M,function(t,a){lt.call(M.prototype,a)||(e[a]=t)}),e}(),{chain:!1}),M.VERSION=n,en(["bind","bindKey","curry","curryRight","partial","partialRight"],function(e){M[e].placeholder=M}),en(["drop","take"],function(e,t){Ze.prototype[e]=function(a){a=a===r?1:xt(Ve(a),0);var S=this.__filtered__&&!t?new Ze(this):this.clone();return S.__filtered__?S.__takeCount__=Ot(a,S.__takeCount__):S.__views__.push({size:Ot(a,ue),type:e+(S.__dir__<0?"Right":"")}),S},Ze.prototype[e+"Right"]=function(a){return this.reverse()[e](a).reverse()}}),en(["filter","map","takeWhile"],function(e,t){var a=t+1,S=a==L||a==H;Ze.prototype[e]=function(x){var O=this.clone();return O.__iteratees__.push({iteratee:He(x,3),type:a}),O.__filtered__=O.__filtered__||S,O}}),en(["head","last"],function(e,t){var a="take"+(t?"Right":"");Ze.prototype[e]=function(){return this[a](1).value()[0]}}),en(["initial","tail"],function(e,t){var a="drop"+(t?"":"Right");Ze.prototype[e]=function(){return this.__filtered__?new Ze(this):this[a](1)}}),Ze.prototype.compact=function(){return this.filter(qt)},Ze.prototype.find=function(e){return this.filter(e).head()},Ze.prototype.findLast=function(e){return this.reverse().find(e)},Ze.prototype.invokeMap=Ye(function(e,t){return typeof e=="function"?new Ze(this):this.map(function(a){return yr(a,e,t)})}),Ze.prototype.reject=function(e){return this.filter(pi(He(e)))},Ze.prototype.slice=function(e,t){e=Ve(e);var a=this;return a.__filtered__&&(e>0||t<0)?new Ze(a):(e<0?a=a.takeRight(-e):e&&(a=a.drop(e)),t!==r&&(t=Ve(t),a=t<0?a.dropRight(-t):a.take(t-e)),a)},Ze.prototype.takeRightWhile=function(e){return this.reverse().takeWhile(e).reverse()},Ze.prototype.toArray=function(){return this.take(ue)},mn(Ze.prototype,function(e,t){var a=/^(?:filter|find|map|reject)|While$/.test(t),S=/^(?:head|last)$/.test(t),x=M[S?"take"+(t=="last"?"Right":""):t],O=S||/^find/.test(t);x&&(M.prototype[t]=function(){var $=this.__wrapped__,q=S?[1]:arguments,Y=$ instanceof Ze,le=q[0],ce=Y||Ke($),he=function(Je){var Qe=x.apply(M,xn([Je],q));return S&&_e?Qe[0]:Qe};ce&&a&&typeof le=="function"&&le.length!=1&&(Y=ce=!1);var _e=this.__chain__,Le=!!this.__actions__.length,Be=O&&!_e,ze=Y&&!Le;if(!O&&ce){$=ze?$:new Ze(this);var je=e.apply($,q);return je.__actions__.push({func:ii,args:[he],thisArg:r}),new nn(je,_e)}return Be&&ze?e.apply(this,q):(je=this.thru(he),Be?S?je.value()[0]:je.value():je)})}),en(["pop","push","shift","sort","splice","unshift"],function(e){var t=Dr[e],a=/^(?:push|sort|unshift)$/.test(e)?"tap":"thru",S=/^(?:pop|shift)$/.test(e);M.prototype[e]=function(){var x=arguments;if(S&&!this.__chain__){var O=this.value();return t.apply(Ke(O)?O:[],x)}return this[a](function($){return t.apply(Ke($)?$:[],x)})}}),mn(Ze.prototype,function(e,t){var a=M[t];if(a){var S=a.name+"";lt.call(er,S)||(er[S]=[]),er[S].push({name:t,func:a})}}),er[Xr(r,_).name]=[{name:"wrapper",func:r}],Ze.prototype.clone=vl,Ze.prototype.reverse=bl,Ze.prototype.value=Al,M.prototype.at=Y0,M.prototype.chain=J0,M.prototype.commit=X0,M.prototype.next=Z0,M.prototype.plant=ec,M.prototype.reverse=tc,M.prototype.toJSON=M.prototype.valueOf=M.prototype.value=nc,M.prototype.first=M.prototype.head,ur&&(M.prototype[ur]=Q0),M},Rr=Xp();Nt._=Rr,l=function(){return Rr}.call(h,i,h,P),l!==r&&(P.exports=l)}).call(this)},7022:()=>{(function(P){var h="\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b",i={pattern:/(^(["']?)\w+\2)[ \t]+\S.*/,lookbehind:!0,alias:"punctuation",inside:null},l={bash:i,environment:{pattern:RegExp("\\$"+h),alias:"constant"},variable:[{pattern:/\$?\(\([\s\S]+?\)\)/,greedy:!0,inside:{variable:[{pattern:/(^\$\(\([\s\S]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,operator:/--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,greedy:!0,inside:{variable:/^\$\(|^`|\)$|`$/}},{pattern:/\$\{[^}]+\}/,greedy:!0,inside:{operator:/:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,punctuation:/[\[\]]/,environment:{pattern:RegExp("(\\{)"+h),lookbehind:!0,alias:"constant"}}},/\$(?:\w+|[#?*!@$])/],entity:/\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/};P.languages.bash={shebang:{pattern:/^#!\s*\/.*/,alias:"important"},comment:{pattern:/(^|[^"{\\$])#.*/,lookbehind:!0},"function-name":[{pattern:/(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,lookbehind:!0,alias:"function"},{pattern:/\b[\w-]+(?=\s*\(\s*\)\s*\{)/,alias:"function"}],"for-or-select":{pattern:/(\b(?:for|select)\s+)\w+(?=\s+in\s)/,alias:"variable",lookbehind:!0},"assign-left":{pattern:/(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,inside:{environment:{pattern:RegExp("(^|[\\s;|&]|[<>]\\()"+h),lookbehind:!0,alias:"constant"}},alias:"variable",lookbehind:!0},parameter:{pattern:/(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,alias:"variable",lookbehind:!0},string:[{pattern:/((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,lookbehind:!0,greedy:!0,inside:l},{pattern:/((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,lookbehind:!0,greedy:!0,inside:{bash:i}},{pattern:/(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,lookbehind:!0,greedy:!0,inside:l},{pattern:/(^|[^$\\])'[^']*'/,lookbehind:!0,greedy:!0},{pattern:/\$'(?:[^'\\]|\\[\s\S])*'/,greedy:!0,inside:{entity:l.entity}}],environment:{pattern:RegExp("\\$?"+h),alias:"constant"},variable:l.variable,function:{pattern:/(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,lookbehind:!0},keyword:{pattern:/(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,lookbehind:!0},builtin:{pattern:/(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,lookbehind:!0,alias:"class-name"},boolean:{pattern:/(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,lookbehind:!0},"file-descriptor":{pattern:/\B&\d\b/,alias:"important"},operator:{pattern:/\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,inside:{"file-descriptor":{pattern:/^\d/,alias:"important"}}},punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,number:{pattern:/(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,lookbehind:!0}},i.inside=P.languages.bash;for(var r=["comment","function-name","for-or-select","assign-left","parameter","string","environment","function","keyword","builtin","boolean","file-descriptor","operator","punctuation","number"],n=l.variable[1].inside,p=0;p<r.length;p++)n[r[p]]=P.languages.bash[r[p]];P.languages.sh=P.languages.bash,P.languages.shell=P.languages.bash})(Prism)},7839:()=>{(function(P){P.languages.diff={coord:[/^(?:\*{3}|-{3}|\+{3}).*$/m,/^@@.*@@$/m,/^\d.*$/m]};var h={"deleted-sign":"-","deleted-arrow":"<","inserted-sign":"+","inserted-arrow":">",unchanged:" ",diff:"!"};Object.keys(h).forEach(function(i){var l=h[i],r=[];/^\w+$/.test(i)||r.push(/\w+/.exec(i)[0]),i==="diff"&&r.push("bold"),P.languages.diff[i]={pattern:RegExp("^(?:["+l+`].*(?:\r
?|
|(?![\\s\\S])))+`,"m"),alias:r,inside:{line:{pattern:/(.)(?=[\s\S]).*(?:\r\n?|\n)?/,lookbehind:!0},prefix:{pattern:/[\s\S]/,alias:/\w+/.exec(i)[0]}}}}),Object.defineProperty(P.languages.diff,"PREFIXES",{value:h})})(Prism)},4784:()=>{(function(P){function h(o){return RegExp("(^(?:"+o+"):[ 	]*(?![ 	]))[^]+","i")}P.languages.http={"request-line":{pattern:/^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,inside:{method:{pattern:/^[A-Z]+\b/,alias:"property"},"request-target":{pattern:/^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,lookbehind:!0,alias:"url",inside:P.languages.uri},"http-version":{pattern:/^(\s)HTTP\/[\d.]+/,lookbehind:!0,alias:"property"}}},"response-status":{pattern:/^HTTP\/[\d.]+ \d+ .+/m,inside:{"http-version":{pattern:/^HTTP\/[\d.]+/,alias:"property"},"status-code":{pattern:/^(\s)\d+(?=\s)/,lookbehind:!0,alias:"number"},"reason-phrase":{pattern:/^(\s).+/,lookbehind:!0,alias:"string"}}},header:{pattern:/^[\w-]+:.+(?:(?:\r\n?|\n)[ \t].+)*/m,inside:{"header-value":[{pattern:h(/Content-Security-Policy/.source),lookbehind:!0,alias:["csp","languages-csp"],inside:P.languages.csp},{pattern:h(/Public-Key-Pins(?:-Report-Only)?/.source),lookbehind:!0,alias:["hpkp","languages-hpkp"],inside:P.languages.hpkp},{pattern:h(/Strict-Transport-Security/.source),lookbehind:!0,alias:["hsts","languages-hsts"],inside:P.languages.hsts},{pattern:h(/[^:]+/.source),lookbehind:!0}],"header-name":{pattern:/^[^:]+/,alias:"keyword"},punctuation:/^:/}}};var i=P.languages,l={"application/javascript":i.javascript,"application/json":i.json||i.javascript,"application/xml":i.xml,"text/xml":i.xml,"text/html":i.html,"text/css":i.css,"text/plain":i.plain},r={"application/json":!0,"application/xml":!0};function n(o){var u=o.replace(/^[a-z]+\//,""),v="\\w+/(?:[\\w.-]+\\+)+"+u+"(?![+\\w.-])";return"(?:"+o+"|"+v+")"}var p;for(var m in l)if(l[m]){p=p||{};var f=r[m]?n(m):m;p[m.replace(/\//g,"-")]={pattern:RegExp("("+/content-type:\s*/.source+f+/(?:(?:\r\n?|\n)[\w-].*)*(?:\r(?:\n|(?!\n))|\n)/.source+")"+/[^ \t\w-][\s\S]*/.source,"i"),lookbehind:!0,inside:l[m]}}p&&P.languages.insertBefore("http","header",p)})(Prism)},2514:()=>{Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},Prism.languages.webmanifest=Prism.languages.json},2342:()=>{Prism.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/},Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest=Prism.languages.python,Prism.languages.py=Prism.languages.python},9445:()=>{(function(){if(typeof Prism=="undefined"||typeof document=="undefined")return;if(!Prism.plugins.toolbar){console.warn("Copy to Clipboard plugin loaded before Toolbar plugin.");return}function P(n,p){n.addEventListener("click",function(){i(p)})}function h(n){var p=document.createElement("textarea");p.value=n.getText(),p.style.top="0",p.style.left="0",p.style.position="fixed",document.body.appendChild(p),p.focus(),p.select();try{var m=document.execCommand("copy");setTimeout(function(){m?n.success():n.error()},1)}catch(f){setTimeout(function(){n.error(f)},1)}document.body.removeChild(p)}function i(n){navigator.clipboard?navigator.clipboard.writeText(n.getText()).then(n.success,function(){h(n)}):h(n)}function l(n){window.getSelection().selectAllChildren(n)}function r(n){var p={copy:"Copy","copy-error":"Press Ctrl+C to copy","copy-success":"Copied!","copy-timeout":5e3},m="data-prismjs-";for(var f in p){for(var o=m+f,u=n;u&&!u.hasAttribute(o);)u=u.parentElement;u&&(p[f]=u.getAttribute(o))}return p}Prism.plugins.toolbar.registerButton("copy-to-clipboard",function(n){var p=n.element,m=r(p),f=document.createElement("button");f.className="copy-to-clipboard-button",f.setAttribute("type","button");var o=document.createElement("span");return f.appendChild(o),v("copy"),P(f,{getText:function(){return p.textContent},success:function(){v("copy-success"),u()},error:function(){v("copy-error"),setTimeout(function(){l(p)},1),u()}}),f;function u(){setTimeout(function(){v("copy")},m["copy-timeout"])}function v(s){o.textContent=m[s],f.setAttribute("data-copy-state",s)}})})()},8347:()=>{(function(){if(typeof Prism!="undefined"){var P=/^diff-([\w-]+)/i,h=/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g,i=RegExp(/(?:__|[^\r\n<])*(?:\r\n?|\n|(?:__|[^\r\n<])(?![^\r\n]))/.source.replace(/__/g,function(){return h.source}),"gi"),l=!1;Prism.hooks.add("before-sanity-check",function(r){var n=r.language;P.test(n)&&!r.grammar&&(r.grammar=Prism.languages[n]=Prism.languages.diff)}),Prism.hooks.add("before-tokenize",function(r){!l&&!Prism.languages.diff&&!Prism.plugins.autoloader&&(l=!0,console.warn("Prism's Diff Highlight plugin requires the Diff language definition (prism-diff.js).Make sure the language definition is loaded or use Prism's Autoloader plugin."));var n=r.language;P.test(n)&&!Prism.languages[n]&&(Prism.languages[n]=Prism.languages.diff)}),Prism.hooks.add("wrap",function(r){var n,p;if(r.language!=="diff"){var m=P.exec(r.language);if(!m)return;n=m[1],p=Prism.languages[n]}var f=Prism.languages.diff&&Prism.languages.diff.PREFIXES;if(f&&r.type in f){var o=r.content.replace(h,""),u=o.replace(/&lt;/g,"<").replace(/&amp;/g,"&"),v=u.replace(/(^|[\r\n])./g,"$1"),s;p?s=Prism.highlight(v,p,n):s=Prism.util.encode(v);var g=new Prism.Token("prefix",f[r.type],[/\w+/.exec(r.type)[0]]),d=Prism.Token.stringify(g,r.language),c=[],b;for(i.lastIndex=0;b=i.exec(s);)c.push(d+b[0]);/(?:^|[\r\n]).$/.test(u)&&c.push(d),r.content=c.join(""),p&&r.classes.push("language-"+n)}})}})()},301:()=>{(function(){if(typeof Prism=="undefined"||typeof document=="undefined")return;var P=[],h={},i=function(){};Prism.plugins.toolbar={};var l=Prism.plugins.toolbar.registerButton=function(p,m){var f;if(typeof m=="function"?f=m:f=function(o){var u;return typeof m.onClick=="function"?(u=document.createElement("button"),u.type="button",u.addEventListener("click",function(){m.onClick.call(this,o)})):typeof m.url=="string"?(u=document.createElement("a"),u.href=m.url):u=document.createElement("span"),m.className&&u.classList.add(m.className),u.textContent=m.text,u},p in h){console.warn('There is a button with the key "'+p+'" registered already.');return}P.push(h[p]=f)};function r(p){for(;p;){var m=p.getAttribute("data-toolbar-order");if(m!=null)return m=m.trim(),m.length?m.split(/\s*,\s*/g):[];p=p.parentElement}}var n=Prism.plugins.toolbar.hook=function(p){var m=p.element.parentNode;if(!(!m||!/pre/i.test(m.nodeName))&&!m.parentNode.classList.contains("code-toolbar")){var f=document.createElement("div");f.classList.add("code-toolbar"),m.parentNode.insertBefore(f,m),f.appendChild(m);var o=document.createElement("div");o.classList.add("toolbar");var u=P,v=r(p.element);v&&(u=v.map(function(s){return h[s]||i})),u.forEach(function(s){var g=s(p);if(g){var d=document.createElement("div");d.classList.add("toolbar-item"),d.appendChild(g),o.appendChild(d)}}),f.appendChild(o)}};l("label",function(p){var m=p.element.parentNode;if(!(!m||!/pre/i.test(m.nodeName))&&m.hasAttribute("data-label")){var f,o,u=m.getAttribute("data-label");try{o=document.querySelector("template#"+u)}catch(v){}return o?f=o.content:(m.hasAttribute("data-url")?(f=document.createElement("a"),f.href=m.getAttribute("data-url")):f=document.createElement("span"),f.textContent=u),f}}),Prism.hooks.add("complete",n)})()},8848:(P,h,i)=>{var l=typeof window!="undefined"?window:typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope?self:{};/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */var r=function(n){var p=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,m=0,f={},o={manual:n.Prism&&n.Prism.manual,disableWorkerMessageHandler:n.Prism&&n.Prism.disableWorkerMessageHandler,util:{encode:function A(E){return E instanceof u?new u(E.type,A(E.content),E.alias):Array.isArray(E)?E.map(A):E.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(A){return Object.prototype.toString.call(A).slice(8,-1)},objId:function(A){return A.__id||Object.defineProperty(A,"__id",{value:++m}),A.__id},clone:function A(E,I){I=I||{};var N,B;switch(o.util.type(E)){case"Object":if(B=o.util.objId(E),I[B])return I[B];N={},I[B]=N;for(var C in E)E.hasOwnProperty(C)&&(N[C]=A(E[C],I));return N;case"Array":return B=o.util.objId(E),I[B]?I[B]:(N=[],I[B]=N,E.forEach(function(R,w){N[w]=A(R,I)}),N);default:return E}},getLanguage:function(A){for(;A;){var E=p.exec(A.className);if(E)return E[1].toLowerCase();A=A.parentElement}return"none"},setLanguage:function(A,E){A.className=A.className.replace(RegExp(p,"gi"),""),A.classList.add("language-"+E)},currentScript:function(){if(typeof document=="undefined")return null;if("currentScript"in document&&1<2)return document.currentScript;try{throw new Error}catch(N){var A=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(N.stack)||[])[1];if(A){var E=document.getElementsByTagName("script");for(var I in E)if(E[I].src==A)return E[I]}return null}},isActive:function(A,E,I){for(var N="no-"+E;A;){var B=A.classList;if(B.contains(E))return!0;if(B.contains(N))return!1;A=A.parentElement}return!!I}},languages:{plain:f,plaintext:f,text:f,txt:f,extend:function(A,E){var I=o.util.clone(o.languages[A]);for(var N in E)I[N]=E[N];return I},insertBefore:function(A,E,I,N){N=N||o.languages;var B=N[A],C={};for(var R in B)if(B.hasOwnProperty(R)){if(R==E)for(var w in I)I.hasOwnProperty(w)&&(C[w]=I[w]);I.hasOwnProperty(R)||(C[R]=B[R])}var D=N[A];return N[A]=C,o.languages.DFS(o.languages,function(k,G){G===D&&k!=A&&(this[k]=C)}),C},DFS:function A(E,I,N,B){B=B||{};var C=o.util.objId;for(var R in E)if(E.hasOwnProperty(R)){I.call(E,R,E[R],N||R);var w=E[R],D=o.util.type(w);D==="Object"&&!B[C(w)]?(B[C(w)]=!0,A(w,I,null,B)):D==="Array"&&!B[C(w)]&&(B[C(w)]=!0,A(w,I,R,B))}}},plugins:{},highlightAll:function(A,E){o.highlightAllUnder(document,A,E)},highlightAllUnder:function(A,E,I){var N={callback:I,container:A,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};o.hooks.run("before-highlightall",N),N.elements=Array.prototype.slice.apply(N.container.querySelectorAll(N.selector)),o.hooks.run("before-all-elements-highlight",N);for(var B=0,C;C=N.elements[B++];)o.highlightElement(C,E===!0,N.callback)},highlightElement:function(A,E,I){var N=o.util.getLanguage(A),B=o.languages[N];o.util.setLanguage(A,N);var C=A.parentElement;C&&C.nodeName.toLowerCase()==="pre"&&o.util.setLanguage(C,N);var R=A.textContent,w={element:A,language:N,grammar:B,code:R};function D(G){w.highlightedCode=G,o.hooks.run("before-insert",w),w.element.innerHTML=w.highlightedCode,o.hooks.run("after-highlight",w),o.hooks.run("complete",w),I&&I.call(w.element)}if(o.hooks.run("before-sanity-check",w),C=w.element.parentElement,C&&C.nodeName.toLowerCase()==="pre"&&!C.hasAttribute("tabindex")&&C.setAttribute("tabindex","0"),!w.code){o.hooks.run("complete",w),I&&I.call(w.element);return}if(o.hooks.run("before-highlight",w),!w.grammar){D(o.util.encode(w.code));return}if(E&&n.Worker){var k=new Worker(o.filename);k.onmessage=function(G){D(G.data)},k.postMessage(JSON.stringify({language:w.language,code:w.code,immediateClose:!0}))}else D(o.highlight(w.code,w.grammar,w.language))},highlight:function(A,E,I){var N={code:A,grammar:E,language:I};if(o.hooks.run("before-tokenize",N),!N.grammar)throw new Error('The language "'+N.language+'" has no grammar.');return N.tokens=o.tokenize(N.code,N.grammar),o.hooks.run("after-tokenize",N),u.stringify(o.util.encode(N.tokens),N.language)},tokenize:function(A,E){var I=E.rest;if(I){for(var N in I)E[N]=I[N];delete E.rest}var B=new g;return d(B,B.head,A),s(A,B,E,B.head,0),b(B)},hooks:{all:{},add:function(A,E){var I=o.hooks.all;I[A]=I[A]||[],I[A].push(E)},run:function(A,E){var I=o.hooks.all[A];if(!(!I||!I.length))for(var N=0,B;B=I[N++];)B(E)}},Token:u};n.Prism=o;function u(A,E,I,N){this.type=A,this.content=E,this.alias=I,this.length=(N||"").length|0}u.stringify=function A(E,I){if(typeof E=="string")return E;if(Array.isArray(E)){var N="";return E.forEach(function(D){N+=A(D,I)}),N}var B={type:E.type,content:A(E.content,I),tag:"span",classes:["token",E.type],attributes:{},language:I},C=E.alias;C&&(Array.isArray(C)?Array.prototype.push.apply(B.classes,C):B.classes.push(C)),o.hooks.run("wrap",B);var R="";for(var w in B.attributes)R+=" "+w+'="'+(B.attributes[w]||"").replace(/"/g,"&quot;")+'"';return"<"+B.tag+' class="'+B.classes.join(" ")+'"'+R+">"+B.content+"</"+B.tag+">"};function v(A,E,I,N){A.lastIndex=E;var B=A.exec(I);if(B&&N&&B[1]){var C=B[1].length;B.index+=C,B[0]=B[0].slice(C)}return B}function s(A,E,I,N,B,C){for(var R in I)if(!(!I.hasOwnProperty(R)||!I[R])){var w=I[R];w=Array.isArray(w)?w:[w];for(var D=0;D<w.length;++D){if(C&&C.cause==R+","+D)return;var k=w[D],G=k.inside,W=!!k.lookbehind,L=!!k.greedy,F=k.alias;if(L&&!k.pattern.global){var H=k.pattern.toString().match(/[imsuy]*$/)[0];k.pattern=RegExp(k.pattern.source,H+"g")}for(var K=k.pattern||k,U=N.next,Z=B;U!==E.tail&&!(C&&Z>=C.reach);Z+=U.value.length,U=U.next){var ie=U.value;if(E.length>A.length)return;if(!(ie instanceof u)){var ue=1,J;if(L){if(J=v(K,Z,A,W),!J||J.index>=A.length)break;var Xe=J.index,be=J.index+J[0].length,Ae=Z;for(Ae+=U.value.length;Xe>=Ae;)U=U.next,Ae+=U.value.length;if(Ae-=U.value.length,Z=Ae,U.value instanceof u)continue;for(var Se=U;Se!==E.tail&&(Ae<be||typeof Se.value=="string");Se=Se.next)ue++,Ae+=Se.value.length;ue--,ie=A.slice(Z,Ae),J.index-=Z}else if(J=v(K,0,ie,W),!J)continue;var Xe=J.index,dt=J[0],bt=ie.slice(0,Xe),At=ie.slice(Xe+dt.length),Rt=Z+ie.length;C&&Rt>C.reach&&(C.reach=Rt);var fe=U.prev;bt&&(fe=d(E,fe,bt),Z+=bt.length),c(E,fe,ue);var xe=new u(R,G?o.tokenize(dt,G):dt,F,dt);if(U=d(E,fe,xe),At&&d(E,U,At),ue>1){var Te={cause:R+","+D,reach:Rt};s(A,E,I,U.prev,Z,Te),C&&Te.reach>C.reach&&(C.reach=Te.reach)}}}}}}function g(){var A={value:null,prev:null,next:null},E={value:null,prev:A,next:null};A.next=E,this.head=A,this.tail=E,this.length=0}function d(A,E,I){var N=E.next,B={value:I,prev:E,next:N};return E.next=B,N.prev=B,A.length++,B}function c(A,E,I){for(var N=E.next,B=0;B<I&&N!==A.tail;B++)N=N.next;E.next=N,N.prev=E,A.length-=B}function b(A){for(var E=[],I=A.head.next;I!==A.tail;)E.push(I.value),I=I.next;return E}if(!n.document)return n.addEventListener&&(o.disableWorkerMessageHandler||n.addEventListener("message",function(A){var E=JSON.parse(A.data),I=E.language,N=E.code,B=E.immediateClose;n.postMessage(o.highlight(N,o.languages[I],I)),B&&n.close()},!1)),o;var y=o.util.currentScript();y&&(o.filename=y.src,y.hasAttribute("data-manual")&&(o.manual=!0));function T(){o.manual||o.highlightAll()}if(!o.manual){var _=document.readyState;_==="loading"||_==="interactive"&&y&&y.defer?document.addEventListener("DOMContentLoaded",T):window.requestAnimationFrame?window.requestAnimationFrame(T):window.setTimeout(T,16)}return o}(l);P.exports&&(P.exports=r),typeof i.g!="undefined"&&(i.g.Prism=r),r.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},r.languages.markup.tag.inside["attr-value"].inside.entity=r.languages.markup.entity,r.languages.markup.doctype.inside["internal-subset"].inside=r.languages.markup,r.hooks.add("wrap",function(n){n.type==="entity"&&(n.attributes.title=n.content.replace(/&amp;/,"&"))}),Object.defineProperty(r.languages.markup.tag,"addInlined",{value:function(p,m){var f={};f["language-"+m]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:r.languages[m]},f.cdata=/^<!\[CDATA\[|\]\]>$/i;var o={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:f}};o["language-"+m]={pattern:/[\s\S]+/,inside:r.languages[m]};var u={};u[p]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return p}),"i"),lookbehind:!0,greedy:!0,inside:o},r.languages.insertBefore("markup","cdata",u)}}),Object.defineProperty(r.languages.markup.tag,"addAttribute",{value:function(n,p){r.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+n+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[p,"language-"+p],inside:r.languages[p]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}}),r.languages.html=r.languages.markup,r.languages.mathml=r.languages.markup,r.languages.svg=r.languages.markup,r.languages.xml=r.languages.extend("markup",{}),r.languages.ssml=r.languages.xml,r.languages.atom=r.languages.xml,r.languages.rss=r.languages.xml,function(n){var p=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;n.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+p.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+p.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+p.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+p.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:p,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},n.languages.css.atrule.inside.rest=n.languages.css;var m=n.languages.markup;m&&(m.tag.addInlined("style","css"),m.tag.addAttribute("style","css"))}(r),r.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},r.languages.javascript=r.languages.extend("clike",{"class-name":[r.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),r.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,r.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:r.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:r.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:r.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:r.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:r.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),r.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:r.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}}),r.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}}),r.languages.markup&&(r.languages.markup.tag.addInlined("script","javascript"),r.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript")),r.languages.js=r.languages.javascript,function(){if(typeof r=="undefined"||typeof document=="undefined")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var n="Loading\u2026",p=function(y,T){return"\u2716 Error "+y+" while fetching file: "+T},m="\u2716 Error: File does not exist or is empty",f={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},o="data-src-status",u="loading",v="loaded",s="failed",g="pre[data-src]:not(["+o+'="'+v+'"]):not(['+o+'="'+u+'"])';function d(y,T,_){var A=new XMLHttpRequest;A.open("GET",y,!0),A.onreadystatechange=function(){A.readyState==4&&(A.status<400&&A.responseText?T(A.responseText):A.status>=400?_(p(A.status,A.statusText)):_(m))},A.send(null)}function c(y){var T=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(y||"");if(T){var _=Number(T[1]),A=T[2],E=T[3];return A?E?[_,Number(E)]:[_,void 0]:[_,_]}}r.hooks.add("before-highlightall",function(y){y.selector+=", "+g}),r.hooks.add("before-sanity-check",function(y){var T=y.element;if(T.matches(g)){y.code="",T.setAttribute(o,u);var _=T.appendChild(document.createElement("CODE"));_.textContent=n;var A=T.getAttribute("data-src"),E=y.language;if(E==="none"){var I=(/\.(\w+)$/.exec(A)||[,"none"])[1];E=f[I]||I}r.util.setLanguage(_,E),r.util.setLanguage(T,E);var N=r.plugins.autoloader;N&&N.loadLanguages(E),d(A,function(B){T.setAttribute(o,v);var C=c(T.getAttribute("data-range"));if(C){var R=B.split(/\r\n?|\n/g),w=C[0],D=C[1]==null?R.length:C[1];w<0&&(w+=R.length),w=Math.max(0,Math.min(w-1,R.length)),D<0&&(D+=R.length),D=Math.max(0,Math.min(D,R.length)),B=R.slice(w,D).join(`
`),T.hasAttribute("data-start")||T.setAttribute("data-start",String(w+1))}_.textContent=B,r.highlightElement(_)},function(B){T.setAttribute(o,s),_.textContent=B})}}),r.plugins.fileHighlight={highlight:function(T){for(var _=(T||document).querySelectorAll(g),A=0,E;E=_[A++];)r.highlightElement(E)}};var b=!1;r.fileHighlight=function(){b||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),b=!0),r.plugins.fileHighlight.highlight.apply(this,arguments)}}()}},Ss={};function rt(P){var h=Ss[P];if(h!==void 0)return h.exports;var i=Ss[P]={id:P,loaded:!1,exports:{}};return Xo[P].call(i.exports,i,i.exports,rt),i.loaded=!0,i.exports}rt.n=P=>{var h=P&&P.__esModule?()=>P.default:()=>P;return rt.d(h,{a:h}),h},rt.d=(P,h)=>{for(var i in h)rt.o(h,i)&&!rt.o(P,i)&&Object.defineProperty(P,i,{enumerable:!0,get:h[i]})},rt.g=function(){if(typeof globalThis=="object")return globalThis;try{return this||new Function("return this")()}catch(P){if(typeof window=="object")return window}}(),rt.o=(P,h)=>Object.prototype.hasOwnProperty.call(P,h),rt.nmd=P=>(P.paths=[],P.children||(P.children=[]),P);var am={};(()=>{var tt;"use strict";var P=rt(2726),h=rt.n(P),i=rt(2543),l=rt(4487),r=rt.n(l),n=rt(2334),p=rt.n(n),m=rt(4912),f=rt(9898),o=rt(4856),u=rt(2208),v=rt(9954),s=rt(8848),g=rt.n(s),d=rt(7022),c=rt(7839),b=rt(2514),y=rt(4784),T=rt(2342),_=rt(301),A=rt(9445),E=rt(8347);class I{hydrate(de,Ce){const we=new URL(de,typeof window=="undefined"?"https://dummy.base":window.location.origin),X={};we.pathname.split("/").forEach((ye,me)=>{if(ye.charAt(0)===":"){const ge=ye.slice(1);typeof Ce[ge]!="undefined"&&(we.pathname=we.pathname.replace(ye,encodeURIComponent(Ce[ge])),X[ge]=Ce[ge])}});for(const ye in Ce)(typeof X[ye]=="undefined"||we.searchParams.has(ye))&&we.searchParams.set(ye,Ce[ye]);return we.toString()}}function N(){h()(".sample-request-send").off("click"),h()(".sample-request-send").on("click",function(Me){Me.preventDefault();const de=h()(this).parents("article"),Ce=de.data("group"),we=de.data("name"),X=de.data("version");w(Ce,we,X,h()(this).data("type"))}),h()(".sample-request-clear").off("click"),h()(".sample-request-clear").on("click",function(Me){Me.preventDefault();const de=h()(this).parents("article"),Ce=de.data("group"),we=de.data("name"),X=de.data("version");D(Ce,we,X)})}function B(Me){return Me.replace(/{(.+?)}/g,":$1")}function C(Me,de){const Ce=Me.find(".sample-request-url").val(),we=new I,X=B(Ce);return we.hydrate(X,de)}function R(Me){const de={};["header","query","body"].forEach(we=>{const X={};try{Me.find(h()(`[data-family="${we}"]:visible`)).each((ye,me)=>{const ge=me.dataset.name;let ke=me.value;if(me.type==="checkbox")if(me.checked)ke="on";else return!0;if(!ke&&!me.dataset.optional&&me.type!=="checkbox")return h()(me).addClass("border-danger"),!0;X[ge]=ke})}catch(ye){return}de[we]=X});const Ce=Me.find(h()('[data-family="body-json"]'));return Ce.is(":visible")?(de.body=Ce.val(),de.header["Content-Type"]="application/json"):de.header["Content-Type"]="multipart/form-data",de}function w(Me,de,Ce,we){const X=h()(`article[data-group="${Me}"][data-name="${de}"][data-version="${Ce}"]`),ye=R(X),me={};if(me.url=C(X,ye.query),me.headers=ye.header,me.headers["Content-Type"]==="application/json")me.data=ye.body;else if(me.headers["Content-Type"]==="multipart/form-data"){const Ue=new FormData;for(const[Ge,qe]of Object.entries(ye.body))Ue.append(Ge,qe);me.data=Ue,me.processData=!1,delete me.headers["Content-Type"],me.contentType=!1}me.type=we,me.success=ge,me.error=ke,h().ajax(me),X.find(".sample-request-response").fadeTo(200,1),X.find(".sample-request-response-json").html("Loading...");function ge(Ue,Ge,qe){let et;try{et=JSON.parse(qe.responseText),et=JSON.stringify(et,null,4)}catch(ot){et=qe.responseText}X.find(".sample-request-response-json").text(et),g().highlightAll()}function ke(Ue,Ge,qe){let et="Error "+Ue.status+": "+qe,ot;try{ot=JSON.parse(Ue.responseText),ot=JSON.stringify(ot,null,4)}catch(ht){ot=Ue.responseText}ot&&(et+=`
`+ot),X.find(".sample-request-response").is(":visible")&&X.find(".sample-request-response").fadeTo(1,.1),X.find(".sample-request-response").fadeTo(250,1),X.find(".sample-request-response-json").text(et),g().highlightAll()}}function D(Me,de,Ce){const we=h()('article[data-group="'+Me+'"][data-name="'+de+'"][data-version="'+Ce+'"]');we.find(".sample-request-response-json").html(""),we.find(".sample-request-response").hide(),we.find(".sample-request-input").each((ye,me)=>{me.value=me.placeholder!==me.dataset.name?me.placeholder:""});const X=we.find(".sample-request-url");X.val(X.prop("defaultValue"))}const k={"Allowed values:":"Valors permesos:","Compare all with predecessor":"Comparar tot amb versi\xF3 anterior","compare changes to:":"comparar canvis amb:","compared to":"comparat amb","Default value:":"Valor per defecte:",Description:"Descripci\xF3",Field:"Camp",General:"General","Generated with":"Generat amb",Name:"Nom","No response values.":"Sense valors en la resposta.",optional:"opcional",Parameter:"Par\xE0metre","Permission:":"Permisos:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3 d'exemple","show up to version:":"mostrar versi\xF3:","Size range:":"Tamany de rang:","Toggle navigation":"Canvia la navegaci\xF3",Type:"Tipus",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Premeu Ctrl+C per copiar","copied!":"Copiat!"},G={"Allowed values:":"Povolen\xE9 hodnoty:","Compare all with predecessor":"Porovnat v\u0161e s p\u0159edchoz\xEDmi verzemi","compare changes to:":"porovnat zm\u011Bny s:","compared to":"porovnat s","Default value:":"V\xFDchoz\xED hodnota:",Description:"Popis",Field:"Pole",General:"Obecn\xE9","Generated with":"Vygenerov\xE1no pomoc\xED",Name:"N\xE1zev","No response values.":"Nebyly vr\xE1ceny \u017E\xE1dn\xE9 hodnoty.",optional:"voliteln\xE9",Parameter:"Parametr","Permission:":"Opr\xE1vn\u011Bn\xED:",Response:"Odpov\u011B\u010F",Send:"Odeslat","Send a Sample Request":"Odeslat uk\xE1zkov\xFD po\u017Eadavek","show up to version:":"zobrazit po verzi:","Size range:":"Rozsah velikosti:","Toggle navigation":"P\u0159epnout navigaci",Type:"Typ",url:"url",Copy:"Kop\xEDrovat","Press Ctrl+C to copy":"Stisknut\xEDm kombinace kl\xE1ves Ctrl+C zkop\xEDrujte","copied!":"Zkop\xEDrovan\xFD!"},W={"Allowed values:":"Erlaubte Werte:","Compare all with predecessor":"Vergleiche alle mit ihren Vorg\xE4ngern","compare changes to:":"vergleiche \xC4nderungen mit:","compared to":"verglichen mit","Default value:":"Standardwert:",Description:"Beschreibung",Field:"Feld",General:"Allgemein","Generated with":"Erstellt mit",Name:"Name","No response values.":"Keine R\xFCckgabewerte.",optional:"optional",Parameter:"Parameter","Permission:":"Berechtigung:",Response:"Antwort",Send:"Senden","Send a Sample Request":"Eine Beispielanfrage senden","show up to version:":"zeige bis zur Version:","Size range:":"Gr\xF6\xDFenbereich:","Toggle navigation":"Navigation ein-/ausblenden",Type:"Typ",url:"url",Copy:"Kopieren","Press Ctrl+C to copy":"Dr\xFCcken Sie Ctrl+C zum kopieren","Copied!":"Kopiert!"},L={"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Comparar todo con versi\xF3n anterior","compare changes to:":"comparar cambios con:","compared to":"comparado con","Default value:":"Valor por defecto:",Description:"Descripci\xF3n",Field:"Campo",General:"General","Generated with":"Generado con",Name:"Nombre","No response values.":"Sin valores en la respuesta.",optional:"opcional",Parameter:"Par\xE1metro","Permission:":"Permisos:",Response:"Respuesta",Send:"Enviar","Send a Sample Request":"Enviar una petici\xF3n de ejemplo","show up to version:":"mostrar a versi\xF3n:","Size range:":"Tama\xF1o de rango:","Toggle navigation":"Alternar navegaci\xF3n",Type:"Tipo",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Presione Ctrl+C para copiar","copied!":"\xA1Copiado!"},F={"Allowed values:":"Valeurs autoris\xE9es :",Body:"Corps","Compare all with predecessor":"Tout comparer avec ...","compare changes to:":"comparer les changements \xE0 :","compared to":"comparer \xE0","Default value:":"Valeur par d\xE9faut :",Description:"Description",Field:"Champ",General:"G\xE9n\xE9ral","Generated with":"G\xE9n\xE9r\xE9 avec",Header:"En-t\xEAte",Headers:"En-t\xEAtes",Name:"Nom","No response values.":"Aucune valeur de r\xE9ponse.","No value":"Aucune valeur",optional:"optionnel",Parameter:"Param\xE8tre",Parameters:"Param\xE8tres","Permission:":"Permission :","Query Parameter(s)":"Param\xE8tre(s) de la requ\xEAte","Query Parameters":"Param\xE8tres de la requ\xEAte","Request Body":"Corps de la requ\xEAte",required:"requis",Response:"R\xE9ponse",Send:"Envoyer","Send a Sample Request":"Envoyer une requ\xEAte repr\xE9sentative","show up to version:":"Montrer \xE0 partir de la version :","Size range:":"Ordre de grandeur :","Toggle navigation":"Basculer la navigation",Type:"Type",url:"url",Copy:"Copier","Press Ctrl+C to copy":"Appuyez sur Ctrl+C pour copier","copied!":"Copi\xE9!"},H={"Allowed values:":"Valori permessi:","Compare all with predecessor":"Confronta tutto con versioni precedenti","compare changes to:":"confronta modifiche con:","compared to":"confrontato con","Default value:":"Valore predefinito:",Description:"Descrizione",Field:"Campo",General:"Generale","Generated with":"Creato con",Name:"Nome","No response values.":"Nessun valore di risposta.",optional:"opzionale",Parameter:"Parametro","Permission:":"Permessi:",Response:"Risposta",Send:"Invia","Send a Sample Request":"Invia una richiesta di esempio","show up to version:":"mostra alla versione:","Size range:":"Intervallo dimensione:","Toggle navigation":"Attiva/disattiva la navigazione",Type:"Tipo",url:"url",Copy:"Copiare","Press Ctrl+C to copy":"Premere CTRL+C per copiare","copied!":"Copiato!"},K={"Allowed values:":"Toegestane waarden:","Compare all with predecessor":"Vergelijk alle met voorgaande versie","compare changes to:":"vergelijk veranderingen met:","compared to":"vergelijk met","Default value:":"Standaard waarde:",Description:"Omschrijving",Field:"Veld",General:"Algemeen","Generated with":"Gegenereerd met",Name:"Naam","No response values.":"Geen response waardes.",optional:"optioneel",Parameter:"Parameter","Permission:":"Permissie:",Response:"Antwoorden",Send:"Sturen","Send a Sample Request":"Stuur een sample aanvragen","show up to version:":"toon tot en met versie:","Size range:":"Maatbereik:","Toggle navigation":"Navigatie in-/uitschakelen",Type:"Type",url:"url",Copy:"Kopi\xEBren","Press Ctrl+C to copy":"Druk op Ctrl+C om te kopi\xEBren","copied!":"Gekopieerd!"},U={"Allowed values:":"Dozwolone warto\u015Bci:","Compare all with predecessor":"Por\xF3wnaj z poprzednimi wersjami","compare changes to:":"por\xF3wnaj zmiany do:","compared to":"por\xF3wnaj do:","Default value:":"Warto\u015B\u0107 domy\u015Blna:",Description:"Opis",Field:"Pole",General:"Generalnie","Generated with":"Wygenerowano z",Name:"Nazwa","No response values.":"Brak odpowiedzi.",optional:"opcjonalny",Parameter:"Parametr","Permission:":"Uprawnienia:",Response:"Odpowied\u017A",Send:"Wy\u015Blij","Send a Sample Request":"Wy\u015Blij przyk\u0142adowe \u017C\u0105danie","show up to version:":"poka\u017C do wersji:","Size range:":"Zakres rozmiaru:","Toggle navigation":"Prze\u0142\u0105cz nawigacj\u0119",Type:"Typ",url:"url",Copy:"Kopiowa\u0107","Press Ctrl+C to copy":"Naci\u015Bnij Ctrl+C, aby skopiowa\u0107","copied!":"Kopiowane!"},Z={"Allowed values:":"Valores permitidos:","Compare all with predecessor":"Compare todos com antecessores","compare changes to:":"comparar altera\xE7\xF5es com:","compared to":"comparado com","Default value:":"Valor padr\xE3o:",Description:"Descri\xE7\xE3o",Field:"Campo",General:"Geral","Generated with":"Gerado com",Name:"Nome","No response values.":"Sem valores de resposta.",optional:"opcional",Parameter:"Par\xE2metro","Permission:":"Permiss\xE3o:",Response:"Resposta",Send:"Enviar","Send a Sample Request":"Enviar um Exemplo de Pedido","show up to version:":"aparecer para a vers\xE3o:","Size range:":"Faixa de tamanho:","Toggle navigation":"Alternar navega\xE7\xE3o",Type:"Tipo",url:"url",Copy:"Copiar","Press Ctrl+C to copy":"Pressione Ctrl+C para copiar","copied!":"Copiado!"},ie={"Allowed values:":"Valori permise:","Compare all with predecessor":"Compar\u0103 toate cu versiunea precedent\u0103","compare changes to:":"compar\u0103 cu versiunea:","compared to":"comparat cu","Default value:":"Valoare implicit\u0103:",Description:"Descriere",Field:"C\xE2mp",General:"General","Generated with":"Generat cu",Name:"Nume","No response values.":"Nici o valoare returnat\u0103.",optional:"op\u021Bional",Parameter:"Parametru","Permission:":"Permisiune:",Response:"R\u0103spuns",Send:"Trimite","Send a Sample Request":"Trimite o cerere de prob\u0103","show up to version:":"arat\u0103 p\xE2n\u0103 la versiunea:","Size range:":"Interval permis:","Toggle navigation":"Comutarea navig\u0103rii",Type:"Tip",url:"url",Copy:"Copie","Press Ctrl+C to copy":"Ap\u0103sa\u021Bi Ctrl+C pentru a copia","copied!":"Copiat!"},ue={"Allowed values:":"\u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F:","Compare all with predecessor":"\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0439 \u0432\u0435\u0440\u0441\u0438\u0435\u0439","compare changes to:":"\u0441\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0441:","compared to":"\u0432 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0438 \u0441","Default value:":"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E:",Description:"\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",Field:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",General:"\u041E\u0431\u0449\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F","Generated with":"\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E",Name:"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435","No response values.":"\u041D\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043E\u0442\u0432\u0435\u0442\u0430.",optional:"\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439",Parameter:"\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440","Permission:":"\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E:",Response:"\u041E\u0442\u0432\u0435\u0442",Send:"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C","Send a Sample Request":"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441","show up to version:":"\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0440\u0441\u0438\u044E:","Size range:":"\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F:","Toggle navigation":"\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438",Type:"\u0422\u0438\u043F",url:"URL",Copy:"\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C","Press Ctrl+C to copy":"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 Ctrl+C, \u0447\u0442\u043E\u0431\u044B \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C","copied!":"\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!"},J={"Allowed values:":"\u0130zin verilen de\u011Ferler:","Compare all with predecessor":"T\xFCm\xFCn\xFC \xF6ncekiler ile kar\u015F\u0131la\u015Ft\u0131r","compare changes to:":"de\u011Fi\u015Fiklikleri kar\u015F\u0131la\u015Ft\u0131r:","compared to":"kar\u015F\u0131la\u015Ft\u0131r","Default value:":"Varsay\u0131lan de\u011Fer:",Description:"A\xE7\u0131klama",Field:"Alan",General:"Genel","Generated with":"Olu\u015Fturan",Name:"\u0130sim","No response values.":"D\xF6n\xFC\u015F verisi yok.",optional:"opsiyonel",Parameter:"Parametre","Permission:":"\u0130zin:",Response:"D\xF6n\xFC\u015F",Send:"G\xF6nder","Send a Sample Request":"\xD6rnek istek g\xF6nder","show up to version:":"bu versiyona kadar g\xF6ster:","Size range:":"Boyut aral\u0131\u011F\u0131:","Toggle navigation":"Navigasyonu de\u011Fi\u015Ftir",Type:"Tip",url:"url",Copy:"Kopya etmek","Press Ctrl+C to copy":"Kopyalamak i\xE7in Ctrl+C tu\u015Flar\u0131na bas\u0131n","copied!":"Kopya -lanan!"},be={"Allowed values:":"Gi\xE1 tr\u1ECB ch\u1EA5p nh\u1EADn:","Compare all with predecessor":"So s\xE1nh v\u1EDBi t\u1EA5t c\u1EA3 phi\xEAn b\u1EA3n tr\u01B0\u1EDBc","compare changes to:":"so s\xE1nh s\u1EF1 thay \u0111\u1ED5i v\u1EDBi:","compared to":"so s\xE1nh v\u1EDBi","Default value:":"Gi\xE1 tr\u1ECB m\u1EB7c \u0111\u1ECBnh:",Description:"Ch\xFA th\xEDch",Field:"Tr\u01B0\u1EDDng d\u1EEF li\u1EC7u",General:"T\u1ED5ng quan","Generated with":"\u0110\u01B0\u1EE3c t\u1EA1o b\u1EDFi",Name:"T\xEAn","No response values.":"Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 tr\u1EA3 v\u1EC1.",optional:"T\xF9y ch\u1ECDn",Parameter:"Tham s\u1ED1","Permission:":"Quy\u1EC1n h\u1EA1n:",Response:"K\u1EBFt qu\u1EA3",Send:"G\u1EEDi","Send a Sample Request":"G\u1EEDi m\u1ED9t y\xEAu c\u1EA7u m\u1EABu","show up to version:":"hi\u1EC3n th\u1ECB phi\xEAn b\u1EA3n:","Size range:":"K\xEDch c\u1EE1:","Toggle navigation":"Chuy\u1EC3n \u0111\u1ED5i \u0111i\u1EC1u h\u01B0\u1EDBng",Type:"Ki\u1EC3u",url:"li\xEAn k\u1EBFt",Copy:"B\u1EA3n sao","Press Ctrl+C to copy":"Nh\u1EA5n Ctrl+C \u0111\u1EC3 sao ch\xE9p","copied!":"Sao ch\xE9p!"},Ae={"Allowed values:":"\u5141\u8BB8\u503C:",Body:"\u8BF7\u6C42\u4F53","Compare all with predecessor":"\u4E0E\u6240\u6709\u4E4B\u524D\u7684\u7248\u672C\u6BD4\u8F83","compare changes to:":"\u5C06\u5F53\u524D\u7248\u672C\u4E0E\u6307\u5B9A\u7248\u672C\u6BD4\u8F83:","compared to":"\u76F8\u6BD4\u4E8E","Default value:":"\u9ED8\u8BA4\u503C:",DEPRECATED:"\u5F03\u7528",Description:"\u63CF\u8FF0","Error 4xx":"\u8BF7\u6C42\u5931\u8D25\uFF084xx\uFF09",Field:"\u5B57\u6BB5","Filter...":"\u7B5B\u9009\u2026",General:"\u6982\u8981","Generated with":"\u6784\u5EFA\u4E8E",Header:"\u8BF7\u6C42\u5934",Headers:"\u8BF7\u6C42\u5934",Name:"\u540D\u79F0","No response values.":"\u65E0\u8FD4\u56DE\u503C.","No value":"\u7A7A\u503C",optional:"\u53EF\u9009",Parameter:"\u53C2\u6570",Parameters:"\u53C2\u6570","Permission:":"\u6743\u9650:","Query Parameter(s)":"\u67E5\u8BE2\u53C2\u6570","Query Parameters":"\u67E5\u8BE2\u53C2\u6570","Request Body":"\u8BF7\u6C42\u6570\u636E",required:"\u5FC5\u9700",Reset:"\u91CD\u7F6E",Response:"\u8FD4\u56DE",Send:"\u53D1\u9001","Send a Sample Request":"\u53D1\u9001\u793A\u4F8B\u8BF7\u6C42","show up to version:":"\u663E\u793A\u6307\u5B9A\u7248\u672C:","Size range:":"\u53D6\u503C\u8303\u56F4:","Success 200":"\u8BF7\u6C42\u6210\u529F\uFF08200\uFF09","Toggle navigation":"\u5207\u63DB\u5C0E\u822A",Type:"\u7C7B\u578B",url:"\u5730\u5740",Copy:"\u590D\u5236\u6587\u672C","Press Ctrl+C to copy":"\u6309Ctrl+C\u590D\u5236","copied!":"\u6587\u672C\u5DF2\u590D\u5236!"},Se={ca:k,cn:Ae,cs:G,de:W,es:L,en:{},fr:F,it:H,nl:K,pl:U,pt:Z,pt_br:Z,ro:ie,ru:ue,tr:J,vi:be,zh:Ae,zh_cn:Ae},Xe=((tt=window.navigator.language)!=null?tt:"en-GB").toLowerCase().substr(0,2);let dt=Se[Xe]?Se[Xe]:Se.en;function bt(Me){const de=dt[Me];return de===void 0?Me:de}function At(Me){if(!Object.prototype.hasOwnProperty.call(Se,Me))throw new Error(`Invalid value for language setting! Available values are ${Object.keys(Se).join(",")}`);dt=Se[Me]}const Rt=Me=>{let de={};const Ce=(ye,me)=>me.split(".").reduce((ge,ke)=>{if(ge){if(ge[ke])return ge[ke];if(Array.isArray(ge)&&ge[0]&&ge[0][ke])return ge[0][ke]}return null},ye),we=(ye,me,ge)=>{ye?Array.isArray(ye)?ye.length?ye[0][me]=ge:ye.push({[me]:ge}):ye[me]=ge:de[me]=ge};Me.forEach(ye=>{const{parentNode:me,field:ge,type:ke}=ye[0],Ue=me?Ce(de,me.path):void 0,Ge=Ue?ge.substring(me.path.length+1):ge,qe=ke.indexOf("[]")!==-1;ke.indexOf("Object")!==-1?we(Ue,Ge,qe?[]:{}):we(Ue,Ge,qe?[]:ye[1])});const X=Object.keys(de);return X.length===1&&Me[0][0].optional&&(de=de[X[0]]),fe(de)};function fe(Me){return JSON.stringify(Me,null,4)}function xe(Me){const de=[];return Me.forEach(Ce=>{let we;switch(Ce.type.toLowerCase()){case"string":we=Ce.defaultValue||"";break;case"boolean":we=Boolean(Ce.defaultValue)||!1;break;case"number":we=parseInt(Ce.defaultValue||0,10);break;case"date":we=Ce.defaultValue||new Date().toLocaleDateString(window.navigator.language);break}de.push([Ce,we])}),Rt(de)}var Te=rt(2189);class Oe extends Te{constructor(de){super(),this.testMode=de}diffMain(de,Ce,we,X){return super.diff_main(this._stripHtml(de),this._stripHtml(Ce),we,X)}diffLineMode(de,Ce){const we=this.diff_linesToChars_(de,Ce),X=we.chars1,ye=we.chars2,me=we.lineArray,ge=super.diff_main(X,ye,!1);return this.diff_charsToLines_(ge,me),ge}diffPrettyHtml(de){const Ce=[],we=/&/g,X=/</g,ye=/>/g,me=/\n/g;for(let ge=0;ge<de.length;ge++){const ke=de[ge][0],Ge=de[ge][1].replace(we,"&amp;").replace(X,"&lt;").replace(ye,"&gt;").replace(me,"&para;<br>");switch(ke){case Te.DIFF_INSERT:Ce[ge]="<ins>"+Ge+"</ins>";break;case Te.DIFF_DELETE:Ce[ge]="<del>"+Ge+"</del>";break;case Te.DIFF_EQUAL:Ce[ge]="<span>"+Ge+"</span>";break}}return Ce.join("")}diffPrettyCode(de){const Ce=[],we=/\n/g;for(let X=0;X<de.length;X++){const ye=de[X][0],me=de[X][1],ge=me.match(we)?"":`
`;switch(ye){case Te.DIFF_INSERT:Ce[X]=me.replace(/^(.)/gm,"+ $1")+ge;break;case Te.DIFF_DELETE:Ce[X]=me.replace(/^(.)/gm,"- $1")+ge;break;case Te.DIFF_EQUAL:Ce[X]=me.replace(/^(.)/gm,"  $1");break}}return Ce.join("")}diffCleanupSemantic(de){return this.diff_cleanupSemantic(de)}_stripHtml(de){if(this.testMode)return de;const Ce=document.createElement("div");return Ce.innerHTML=de,Ce.textContent||Ce.innerText||""}}function mt(){p().registerHelper("markdown",function(X){return X&&(X=X.replace(/((\[(.*?)\])?\(#)((.+?):(.+?))(\))/mg,function(ye,me,ge,ke,Ue,Ge,qe){const et=ke||Ge+"/"+qe;return'<a href="#api-'+Ge+"-"+qe+'">'+et+"</a>"}),X)}),p().registerHelper("setInputType",function(X){switch(X){case"File":case"Email":case"Color":case"Number":case"Date":return X[0].toLowerCase()+X.substring(1);case"Boolean":return"checkbox";default:return"text"}});let Me;p().registerHelper("startTimer",function(X){return Me=new Date,""}),p().registerHelper("stopTimer",function(X){return console.log(new Date-Me),""}),p().registerHelper("__",function(X){return bt(X)}),p().registerHelper("cl",function(X){return console.log(X),""}),p().registerHelper("underscoreToSpace",function(X){return X.replace(/(_+)/g," ")}),p().registerHelper("removeDblQuotes",function(X){return X.replace(/"/g,"")}),p().registerHelper("assign",function(X){if(arguments.length>0){const ye=typeof arguments[1];let me=null;(ye==="string"||ye==="number"||ye==="boolean")&&(me=arguments[1]),p().registerHelper(X,function(){return me})}return""}),p().registerHelper("nl2br",function(X){return Ce(X)}),p().registerHelper("ifNotObject",function(X,ye){return X&&X.indexOf("Object")!==0?ye.fn(this):ye.inverse(this)}),p().registerHelper("ifCond",function(X,ye,me,ge){switch(ye){case"==":return X==me?ge.fn(this):ge.inverse(this);case"===":return X===me?ge.fn(this):ge.inverse(this);case"!=":return X!=me?ge.fn(this):ge.inverse(this);case"!==":return X!==me?ge.fn(this):ge.inverse(this);case"<":return X<me?ge.fn(this):ge.inverse(this);case"<=":return X<=me?ge.fn(this):ge.inverse(this);case">":return X>me?ge.fn(this):ge.inverse(this);case">=":return X>=me?ge.fn(this):ge.inverse(this);case"&&":return X&&me?ge.fn(this):ge.inverse(this);case"||":return X||me?ge.fn(this):ge.inverse(this);default:return ge.inverse(this)}});const de={};p().registerHelper("subTemplate",function(X,ye){de[X]||(de[X]=p().compile(document.getElementById("template-"+X).innerHTML));const me=de[X],ge=h().extend({},this,ye.hash);return new(p()).SafeString(me(ge))}),p().registerHelper("toLowerCase",function(X){return X&&typeof X=="string"?X.toLowerCase():""}),p().registerHelper("dot2bracket",function(X){const{parentNode:ye,field:me,isArray:ge}=X;let ke="";if(ye){let Ue=X;do{const Ge=Ue.parentNode;Ge.isArray&&(ke=`[]${ke}`),Ge.parentNode?ke=`[${Ge.field.substring(Ge.parentNode.path.length+1)}]${ke}`:ke=Ge.field+ke,Ue=Ue.parentNode}while(Ue.parentNode);ke+=`[${me.substring(ye.path.length+1)}]`}else ke=me,ge&&(ke+="[]");return ke}),p().registerHelper("nestObject",function(X){const{parentNode:ye,field:me}=X;return ye?"&nbsp;&nbsp;".repeat(ye.path.split(".").length)+me.substring(ye.path.length+1):me});function Ce(X){return(""+X).replace(/(?:^|<\/pre>)[^]*?(?:<pre>|$)/g,ye=>ye.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,"$1<br>$2"))}p().registerHelper("each_compare_list_field",function(X,ye,me){const ge=me.hash.field,ke=[];X&&X.forEach(function(Ge){const qe=Ge;qe.key=Ge[ge],ke.push(qe)});const Ue=[];return ye&&ye.forEach(function(Ge){const qe=Ge;qe.key=Ge[ge],Ue.push(qe)}),we("key",ke,Ue,me)}),p().registerHelper("each_compare_keys",function(X,ye,me){const ge=[];X&&Object.keys(X).forEach(function(Ge){const qe={};qe.value=X[Ge],qe.key=Ge,ge.push(qe)});const ke=[];return ye&&Object.keys(ye).forEach(function(Ge){const qe={};qe.value=ye[Ge],qe.key=Ge,ke.push(qe)}),we("key",ge,ke,me)}),p().registerHelper("body2json",function(X,ye){return xe(X)}),p().registerHelper("each_compare_field",function(X,ye,me){return we("field",X,ye,me)}),p().registerHelper("each_compare_title",function(X,ye,me){return we("title",X,ye,me)}),p().registerHelper("reformat",function(X,ye){if(ye==="json")try{return JSON.stringify(JSON.parse(X.trim()),null,"    ")}catch(me){}return X}),p().registerHelper("showDiff",function(X,ye,me){let ge="";if(X===ye)ge=X;else{if(!X)return ye;if(!ye)return X;const ke=new Oe;if(me==="code"){const Ue=ke.diffLineMode(ye,X);ge=ke.diffPrettyCode(Ue)}else{const Ue=ke.diffMain(ye,X);ke.diffCleanupSemantic(Ue),ge=ke.diffPrettyHtml(Ue),ge=ge.replace(/&para;/gm,""),me==="nl2br"&&(ge=Ce(ge))}}return ge});function we(X,ye,me,ge){const ke=[];let Ue=0;ye&&ye.forEach(function(et){let ot=!1;if(me&&me.forEach(function(ht){if(et[X]===ht[X]){const Ht={typeSame:!0,source:et,compare:ht,index:Ue};ke.push(Ht),ot=!0,Ue++}}),!ot){const ht={typeIns:!0,source:et,index:Ue};ke.push(ht),Ue++}}),me&&me.forEach(function(et){let ot=!1;if(ye&&ye.forEach(function(ht){ht[X]===et[X]&&(ot=!0)}),!ot){const ht={typeDel:!0,compare:et,index:Ue};ke.push(ht),Ue++}});let Ge="";const qe=ke.length;for(const et in ke)parseInt(et,10)===qe-1&&(ke[et]._last=!0),Ge=Ge+ge.fn(ke[et]);return Ge}}document.addEventListener("DOMContentLoaded",()=>{Ut(),N(),g().highlightAll()});function Ut(){var $e;let Me=[{type:"get",url:"/version",title:"Application version",name:"printVersion",group:"3D_Repo",description:"<p>Show current application version.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"VERSION",isArray:!1,description:"<p>API service version</p>"},{group:"200",type:"String",optional:!1,field:"unity",isArray:!1,description:"<p>Unity viewer version</p>"},{group:"200",type:"String",optional:!1,field:"navis",isArray:!1,description:"<p>Autodesk Navisworks version</p>"},{group:"200",type:"String",optional:!1,field:"unitydll",isArray:!1,description:"<p>Unity viewer version</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"3D_Repo"},{type:"post",url:"/:teamspace/permissions",title:"Assign permissions",name:"createPermission",group:"Account_Permission",description:"<p>Assign account level permission to a user</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to assign permissions to</p>"},{group:"Request body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}]}},success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"},{group:"200",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>Account Level Permission types</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
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
}`,type:"post"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"delete",url:"/:teamspace/permissions/:user",title:"Revoke permissions",name:"deletePermission",group:"Account_Permission",description:"<p>Revoke all permissions from a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to delete</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/permissions/alice HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/permissions HTTP/1.1",type:"get"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"put",url:"/:teamspace/permissions/:user",title:"Update permissions",name:"updatePermission",group:"Account_Permission",description:"<p>Update permissions assignment for a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User to update</p>"}],"Request body":[{group:"Request body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of account level permissions</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PUT /acme/permissions/alice HTTP/1.1
{
	"permissions": [
		"teamspace_admin"
	]
}`,type:"put"}],version:"0.0.0",filename:"accountPermission.js",groupTitle:"Account_Permission"},{type:"post",url:"/forgot-password",title:"Forgot password",name:"forgotPassword",group:"Account",description:"<p>Send a password reset link to account's e-mail.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"username",isArray:!1,description:"<p>Account username</p>"},{group:"Parameter",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>E-mail address registered with account</p>"}]}},examples:[{title:"Example usage (with username):",content:`POST /forgot-password HTTP/1.1
{
	"username: "alice"
}`,type:"get"},{title:"Example usage (with e-mail):",content:`POST /forgot-password HTTP/1.1
{
	"email: "alice@acme.co.uk"
}`,type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/:user/avatar",title:"Get avatar",name:"getAvatar",group:"Account",description:"<p>Get user avatar.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"}]}},success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"avatar",isArray:!1,description:"<p>User Avatar Image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"json"}]},error:{fields:{404:[{group:"404",optional:!1,field:"USER_DOES_NOT_HAVE_AVATAR",isArray:!1,description:"<p>User does not have an avatar</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 404 Not Found
{
	"message": "User does not have an avatar",
	"status": 404,
	"code": "USER_DOES_NOT_HAVE_AVATAR",
	"place": "GET /alice/avatar"
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice/avatar HTTP/1.1",type:"put"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/:user.json",title:"List account information",name:"listInfo",group:"Account",description:"<p>Account information and list of projects grouped by teamspace that the user has access to.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"accounts",isArray:!0,description:"<p>User account</p>"},{group:"200",type:"Object",optional:!1,field:"billingInfo",isArray:!1,description:"<p>Billing information</p>"},{group:"200",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>User e-mail address</p>"},{group:"200",type:"String",optional:!1,field:"firstName",isArray:!1,description:"<p>First name</p>"},{group:"200",type:"String",optional:!1,field:"lastName",isArray:!1,description:"<p>Surname</p>"},{group:"200",type:"Boolean",optional:!1,field:"hasAvatar",isArray:!1,description:"<p>True if user account has an avatar</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /alice.json HTTP/1.1",type:"delete"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"put",url:"/:user/password",title:"Reset password",name:"resetPassword",group:"Account",description:"<p>Reset user account password. New password must be different.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User account</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"oldPassword",isArray:!1,description:"<p>Old password</p>"},{group:"Request body",type:"String",optional:!1,field:"newPassword",isArray:!1,description:"<p>New password</p>"},{group:"Request body",type:"String",optional:!1,field:"token",isArray:!1,description:"<p>Password reset token</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"account",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"TOKEN_INVALID",isArray:!1,description:"<p>Token is invalid or has expired</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 400 Bad Request
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
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user",title:"Sign up",name:"signUp",group:"Account",description:"<p>Sign up for a new user account.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>New account username to register</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"password",isArray:!1,description:"<p>Password</p>"},{group:"Request body",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>Valid e-mail address</p>"},{group:"Request body",type:"String",optional:!1,field:"firstName",isArray:!1,description:"<p>First name</p>"},{group:"Request body",type:"String",optional:!1,field:"lastName",isArray:!1,description:"<p>Surname</p>"},{group:"Request body",type:"String",optional:!1,field:"company",isArray:!1,description:"<p>Company</p>"},{group:"Request body",type:"String",optional:!1,field:"jobTitle",isArray:!1,description:"<p>Job title</p>"},{group:"Request body",type:"String",optional:!1,field:"countryCode",isArray:!1,description:"<p>ISO 3166-1 alpha-2</p>"},{group:"Request body",type:"String",optional:!1,field:"captcha",isArray:!1,description:"<p>Google reCAPTCHA response token</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"account",isArray:!1,description:"<p>New Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"SIGN_UP_PASSWORD_MISSING",isArray:!1,description:"<p>Password is missing</p>"}]},examples:[{title:"Error-Response",content:`
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
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"put",url:"/:user",title:"Update user account",name:"updateUser",group:"Account",description:"<p>Update account information.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>Account username</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>Valid e-mail address</p>"},{group:"Request body",type:"String",optional:!1,field:"firstName",isArray:!1,description:"<p>First name</p>"},{group:"Request body",type:"String",optional:!1,field:"lastName",isArray:!1,description:"<p>Surname</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"account",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`PUT /alice HTTP/1.1
{
	"email":"alice@3drepo.org",
	"firstName":"Alice",
	"lastName":"Anderson"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user/avatar",title:"Upload avatar",name:"uploadAvatar",group:"Account",description:"<p>Upload a new avatar image. Only multipart form data content type will be accepted.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"}],"Request body":[{group:"Request body",type:"File",optional:!1,field:"file",isArray:!1,description:"<p>Image to upload</p>"}]}},examples:[{title:"Example usage:",content:`POST /alice/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf

------WebKitFormBoundaryN8dwXAkcO1frCHLf
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<binary content>
------WebKitFormBoundaryN8dwXAkcO1frCHLf--`,type:"put"}],success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"status",isArray:!1,description:"<p>Status of Avatar upload.</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"post",url:"/:user/verify",title:"Verify",name:"verify",group:"Account",description:"<p>Verify an account after signing up.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>Account username</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"token",isArray:!1,description:"<p>Account verification token</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"account",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"account":"alice"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"ALREADY_VERIFIED",isArray:!1,description:"<p>User already verified</p>"}]},examples:[{title:"Error-Response",content:`HTTP/1.1 400 Bad Request
{
	"message": "Already verified",
	"status": 400,
	"code": "ALREADY_VERIFIED",
	"value": 60,
	"place": "POST /alice/verify"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /alice/verify HTTP/1.1
{
	"token":"1234567890"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Account"},{type:"get",url:"/login",title:"Get current username",name:"checkLogin",group:"Authentication",description:"<p>Get the username of the logged in user.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"username",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`GET /login HTTP/1.1
{}`,type:"get"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"post",url:"/login",title:"Login",name:"login",group:"Authentication",description:"<p>3D Repo account login. Logging in generates a token that can be used for cookie-based authentication. To authentication subsequent API calls using cookie-based authentication, simply put the following into the HTTP header: <code>Cookie: connect.sid=:sessionId</code></p> <p>NOTE: If you use a modern browser\u2019s XMLHttpRequest object to make API calls, you don\u2019t need to take care of the authentication process after calling /login.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"username",isArray:!1,description:"<p>Account username</p>"},{group:"Request body",type:"String",optional:!1,field:"password",isArray:!1,description:"<p>Account password</p>"}]}},success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"username",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
set-cookie:connect.sid=12345678901234567890;
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /login HTTP/1.1
{
	"username": "alice",
	"password": "AW96B6"
}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"post",url:"/logout",title:"Logout",name:"logout",group:"Authentication",description:"<p>Invalidate the authenticated session.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"username",isArray:!1,description:"<p>Account username</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"username": "alice"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /logout HTTP/1.1
{}`,type:"post"}],version:"0.0.0",filename:"auth.js",groupTitle:"Authentication"},{type:"post",url:"/:teamspace/:model/revision(/master/head|/:revId)/groups",title:"Create group",name:"createGroup",group:"Groups",description:"<p>Add a group to the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
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
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{name:"deleteGroups",group:"Groups",description:"<p>Delete groups.</p>",parameter:{fields:{Query:[{group:"Query",type:"String",optional:!1,field:"GROUPS",isArray:!1,description:"<p>Comma separated list of group IDs</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>Group deletion result (success|ERROR CODE)</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"json"}]},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/groups?ids=00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003 HTTP/1.1",type:"delete"}],type:"",url:"",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/groups/export",title:"Export Groups",name:"exportGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ExportFederationGroups</p>",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{name:"findGroup",group:"Groups",description:"<p>Find a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000004?ifcguids=true HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}],fields:{200:[{group:"200",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"200",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"200",type:"Number",optional:!1,field:"createdAt",isArray:!1,description:"<p>Group creation timestamp in milliseconds</p>"},{group:"200",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"200",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"200",type:"Object[]",optional:!1,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"200",type:"Number[]",optional:!1,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"},{group:"200",type:"Number",optional:!1,field:"updatedAt",isArray:!1,description:"<p>Group update timestamp in milliseconds</p>"},{group:"200",type:"Number",optional:!1,field:"updatedBy",isArray:!1,description:"<p>Username of last user to amend group</p>"},{group:"200",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Unique ID of group</p>"}]}},type:"",url:"",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"post",url:"/:teamspace/:model/groups/import",title:"Import Groups",name:"importGroups",group:"Groups",description:"<p>This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ImportFederationGroups</p>",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{name:"listGroups",group:"Groups",description:"<p>List all groups associated with the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"ifcguids",isArray:!1,description:"<p>Flag that returns IFC GUIDs for group elements</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noIssues",isArray:!1,description:"<p>Flag that hides groups for issues</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noRisks",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Boolean",optional:!0,field:"noViews",isArray:!1,description:"<p>Flag that hides groups for risks</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of group objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage (/master/head)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1",type:"get"},{title:"Example usage (/:revId)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1",type:"get"},{title:"Example usage (no issue/risk groups)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?noIssues=true&noRisks=true HTTP/1.1",type:"get"},{title:"Example usage (with IFC GUIDs)",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?ifcguids=true HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"group.js",groupTitle:"Groups",groupDescription:"<p>A grouping of model elements. Groups can either comprise of a set of manually defined elements or rules (smart group) that define the criteria for its elements.</p>"},{type:"put",url:"/:teamspace/:model/revision(/master/head|/:revId)/groups/:groupId/",title:"Update group",name:"updateGroup",group:"Groups",description:"<p>Update a group.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"groupId",isArray:!1,description:"<p>Group ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"author",isArray:!1,description:"<p>Username of group creator</p>"},{group:"Request body",type:"Number[]",optional:!1,field:"color",isArray:!0,description:"<p>RGB colour values</p>"},{group:"Request body",type:"String",optional:!1,field:"description",isArray:!1,description:"<p>Group description</p>"},{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Group name</p>"},{group:"Request body",type:"Object[]",optional:!1,field:"objects",isArray:!0,description:"<p>List of objects in group</p>"},{group:"Request body",type:"Object[]",optional:!0,field:"rules",isArray:!0,description:"<p>List of rules in group</p>"},{group:"Request body",type:"Number[]",optional:!0,field:"transformation",isArray:!0,description:"<p>Flat 16 element array representation of 4x4 transformation matrix</p>"}]}},examples:[{title:"Example usage (/master/head)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"},{title:"Example usage (/:revId)",content:"PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revisions.json HTTP/1.1",type:"get"}],version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"get",url:"/:teamspace/:model/revisions/:branch.json",title:"List all revisions by branch",name:"listRevisionsByBranch",group:"History",description:"<p>List all model revisions from a branch.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"branch",isArray:!1,description:"<p>Name of revision branch</p>"}]}},success:{fields:{200:[{group:"200",optional:!1,field:"Revisions",isArray:!1,description:"<p>object for a branch</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
{}`,type:"json"}]},version:"0.0.0",filename:"history.js",groupTitle:"History"},{type:"post",url:"/:teamspace/invitations",title:"Create/Update invitation",name:"createInvitation",group:"Invitations",description:"<p>It creates or updates an invitation with the permissions  and a job assigned to the invited email</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"email",isArray:!1,description:"<p>The email to which the invitation will be sent</p>"},{group:"Request body",type:"String",optional:!1,field:"job",isArray:!1,description:"<p>An existing job for the teamspace</p>"},{group:"Request body",type:"Permissions",optional:!1,field:"permissions",isArray:!1,description:"<p>Valid permissions for the invited. If there is a teamspace_admin: true the rest of the permissions for that teamspace are ignored.</p>"}],"Request body: Permisssions":[{group:"Request body: Permisssions",type:"Boolean",optional:!0,field:"teamspace_admin",isArray:!1,description:"<p>Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.</p>"},{group:"Request body: Permisssions",type:"ProjectPermissions[]",optional:!0,field:"projects",isArray:!0,description:"<p>Permissions for projects and their models.</p>"}],"Request body: ProjectPermissions":[{group:"Request body: ProjectPermissions",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>The id of the project in which the project permissions will be applied for the invited user.</p>"},{group:"Request body: ProjectPermissions",type:"Boolean",optional:!0,field:"project_admin",isArray:!1,description:"<p>Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.</p>"},{group:"Request body: ProjectPermissions",type:"ModelPermissions[]",optional:!0,field:"models",isArray:!0,description:"<p>An array indicating the permissions for the models.</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The id of the model that will have the permission applied for the invited user.</p>"},{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"permission",isArray:!1,description:"<p>The type of permission applied for the invited user. Valid values are 'viewer', 'commenter' or 'collaborator'</p>"}]}},examples:[{title:"Example usage (with projects and models, permissions):",content:`POST /teamSpace1/invitations HTTP/1.1
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
{}`,type:"json"}]},version:"0.0.0",filename:"invitations.js",groupTitle:"Invitations"},{type:"get",url:"/:teamspace/invoices",title:"List all invoices",name:"listInvoices",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},description:"<p>List all invoices if available, to current logged in user.</p>",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Invoice",isArray:!1,description:"<p>Object</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},error:{fields:{401:[{group:"401",optional:!1,field:"NOT_AUTHORIZED",isArray:!1,description:"<p>Not Authorized</p>"}]},examples:[{title:"Error-Response",content:`
HTTP/1.1 401 Not Authorized
{
	"message":"Not Authorized",
	"status":401,"code":
	"NOT_AUTHORIZED",
	"value":9,
	"place":"GET /nabile/subscriptions"
}`,type:"json"}]},version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"get",url:"/:teamspace/invoices/:invoiceNo.html",title:"Render invoices as HTML",name:"renderInvoice",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"invoiceNo",isArray:!1,description:"<p>Invoice number to render.</p>"}]}},description:"<p>Render a HTML web page of the requested invoice.</p>",version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"get",url:"/:teamspace/invoices/:invoiceNo.pdf",title:"Render invoices as PDF",name:"renderInvoicePDF",group:"Invoice",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",optional:!1,field:"invoiceNo.pdf",isArray:!1,description:"<p>Invoice to render.</p>"}]}},description:"<p>Render out a PDF version of the requested invocie.</p>",version:"0.0.0",filename:"invoice.js",groupTitle:"Invoice"},{type:"post",url:"/:teamspace/:model/issues/:issueId/resources",title:"Attach resources to an issue",name:"attachResource",group:"Issues",description:"<p>Attaches file or url resources to an issue. If the type of the resource is file it should be send as multipart/form-data. Both types at the same time cant be sent. So in order to attach files and urls it should be done with two different requests.</p> <p>This method triggers a chat event</p>",parameter:{fields:{"Request body file resource (multipart/form-data)":[{group:"Request body file resource (multipart/form-data)",type:"File[]",optional:!1,field:"files",isArray:!0,description:"<p>The array of files to be attached</p>"},{group:"Request body file resource (multipart/form-data)",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"}],"Request body url resource":[{group:"Request body url resource",type:"String[]",optional:!1,field:"urls",isArray:!0,description:"<p>The array of urls to be attached</p>"},{group:"Request body url resource",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the urls; it should have the same length as the url field</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}},success:{examples:[{title:"Success example result after two files has been uploaded",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"post",url:"/:teamspace/:model/issues/:issueId/comments",title:"Add comment to issue",name:"commentIssue",group:"Issues",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"},{group:"Request body",type:"Viewpoint",optional:!0,field:"viewpoint",isArray:!1,description:"<p>The viewpoint associated with the comment</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]},examples:[{title:"PAYLOAD",content:`{
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
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",isArray:!1,description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>Comment with no text</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/comments",title:"Deletes an comment from an issue",name:"commentIssue",group:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"Json",optional:!1,field:"PAYLOAD",isArray:!1,description:"<p>The data with the comment guid to be deleted.</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]},examples:[{title:"PAYLOAD",content:`{
   guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}]},success:{examples:[{title:"Success",content:` HTTP/1.1 200 OK
{
    guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"404",isArray:!1,description:"<p>Issue not found</p>"},{group:"Error 4xx",optional:!1,field:"401",isArray:!1,description:"<p>Not authorized, when the user is not the owner</p>"},{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>Issue comment sealed, when the user is trying to delete a comment that is sealed</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"delete",url:"/:teamspace/:model/issues/:issueId/resources",title:"Detach a resource from an issue",name:"detachResource",group:"Issues",description:"<p>Detachs a resource from an issue. If the issue is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>The resource id to be detached</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
   "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
   "size":2509356,
   "issueIds":[
   ],
   "name":"football.gif",
   "user":"teamSpace1",
   "createdAt":1561973996462
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"get",url:"/:teamspace/:model/issues/:issueId",title:"Get issue",name:"findIssue",group:"Issues",description:"<p>Find an issue with the requested Issue ID.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object",optional:!1,field:"issue",isArray:!1,description:"<p>The Issue matching the Issue ID</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.bcfzip",title:"Download issues BCF file",name:"getIssuesBCF",group:"Issues",description:"<p>Download issues as a BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Get Issues BCF zip file by revision ID",name:"getIssuesBCFTRid",group:"Issues",description:"<p>Get Issues BCF export based on revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshot.png",title:"Get issue viewpoint screenshot",name:"getScreenshot",group:"Issues",description:"<p>Get an issue viewpoint screenshot.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",isArray:!1,description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshotSmall.png",title:"Get smaller version of Issue screenshot",name:"getScreenshotSmall",group:"Issues",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Issue",isArray:!1,description:"<p>Screenshot.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"viewpointId",isArray:!1,description:"<p>Viewpoint ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues/:issueId/thumbnail.png",title:"Get issue thumbnail",name:"getThumbnail",group:"Issues",description:"<p>Retrieve screenshot thumbnail image for requested issue.</p>",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"thumbnail",isArray:!1,description:"<p>Thumbnail image</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues.bcfzip",title:"Import BCF file",name:"importBCF",group:"Issues",description:"<p>Upload issues BCF file.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{name:"listIssues",group:"Issues",description:"<p>List all issues for model.</p>",success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},type:"",url:"",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",isArray:!1,description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",isArray:!0,description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",isArray:!0,description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",isArray:!0,description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",isArray:!0,description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues",title:"List Issues by revision ID",name:"listIssuesByRevision",group:"Issues",description:"<p>Get all issues related to specific revision ID.</p>",success:{fields:{200:[{group:"200",type:"Object",optional:!1,field:"Issues",isArray:!1,description:"<p>Object</p>"}]},examples:[{title:"Success-Response",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"convertCoords",isArray:!1,description:"<p>Convert coordinates to user space</p>"},{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue IDs to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>Array of topic types to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"status",isArray:!0,description:"<p>Array of status to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"priorities",isArray:!0,description:"<p>Array of priorities to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"owners",isArray:!0,description:"<p>Array of owners to filter</p>"},{group:"Query",type:"String[]",optional:!0,field:"assignedRoles",isArray:!0,description:"<p>Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.</p>"}]}}},{type:"post",url:"/:teamspace/:model/issues",title:"Create issue",name:"newIssue",group:"Issues",description:"<p>Creates a new issue.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the issue</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>The roles assigned to the issue. Even though its an array (this is for future support of multiple assigned jobs), currently it has one or none elements correspoing to the available jobs in the teamaspace.</p>"},{group:"Request body",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>The status of the issue. It can have a value of &quot;open&quot;,&quot;in progress&quot;,&quot;for approval&quot;, &quot;void&quot; or &quot;closed&quot;.</p>"},{group:"Request body",type:"String",optional:!1,field:"priority",isArray:!1,description:"<p>The priority of the issue. It can have a value of &quot;none&quot;, String&quot;low&quot;, &quot;medium&quot; or &quot;high&quot;.</p>"},{group:"Request body",type:"String",optional:!1,field:"topic_type",isArray:!1,description:"<p>Type of the issue. It's value has to be one of the defined topic_types for the model. See <a href='#api-Model-createModel'>here</a> for more details.</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>The viewpoint of the issue, defining the position of the camera and the screenshot for that position.</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>The description of the created issue</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"post",url:"/:teamspace/:model/revision/:revId/issues",title:"Create issue on revision",name:"newIssueRev",group:"Issues",description:'<p>Creates a new issue for a particular revision. See <a href="#api-Issues-newIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/revision/:revId/issues.bcfzip",title:"Post Issues BCF zip file by revision ID",name:"postIssuesBCF",group:"Issues",description:"<p>Upload Issues BCF file using current revision ID.</p>",success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"status",isArray:!1,description:"<p>&quot;ok&quot; on success</p>"}]},examples:[{title:"Success-Response:",content:`HTTP
{
	"status":"ok"
}`,type:"json"}]},version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/issues.html",title:"Issues response into as HTML",name:"renderIssuesHTML",group:"Issues",description:"<p>Render all Issues into a HTML webpage, response is rendered HTML.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/:revId/issues.html",title:"Issues response into as HTML by revision ID",name:"renderIssuesHTMLRid",group:"Issues",description:"<p>Render all Issues into a HTML webpage based on current revision ID.</p>",version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"patch",url:"/:teamspace/:model/issues/:issueId",title:"Update issue",name:"updateIssue",group:"Issues",description:"<p>Updates an issue. It takes the part of the issue that can be updated. The system will create a system comment within the issue describing which values were changed. The user needs to be the teamspace administrator, the project administrator, has the same job as the creator of the issue, or has the issue assigned. In the case that the issue has been assigned to the user, the user cannot change it to the &quot;closed&quot; status.</p> <p>If the issue is being updated to assigned to a job and the status of the issue has the value &quot;for_approval&quot;, then the status of the issue is automatically changed to &quot;in_progress&quot;.</p> <p>If the user is changing the issue to the &quot;for_approval&quot; status, the issue will be assigned to the job that the creator of the issue.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"[]String",optional:!0,field:"assigned_roles",isArray:!0,description:"<p>Job roles assigned to the issue</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",isArray:!1,description:"<p>Description of issue</p>"},{group:"Request body",type:"String",optional:!0,field:"status",isArray:!1,description:"<p>The status of issue (values: &quot;open&quot;, &quot;in progress&quot;, &quot;for approval&quot;, &quot;closed&quot;)</p>"},{group:"Request body",type:"String",optional:!0,field:"topic_type",isArray:!1,description:"<p>Topic type of issue (see <a href='#api-Model-createModel'>here</a> for available types)</p>"},{group:"Request body",type:"Number",optional:!0,field:"due_date",isArray:!1,description:"<p>Due date timestamp for the issue</p>"},{group:"Request body",type:"String",optional:!0,field:"priority",isArray:!1,description:"<p>The priority of the issue (values: &quot;none&quot;, &quot;low&quot;, &quot;medium&quot;, &quot;high&quot;)</p>"},{group:"Request body",type:"Number",optional:!0,field:"scale",isArray:!1,description:"<p>The scale factor of the issue</p>"},{group:"Request body",type:"Viewpoint",optional:!0,field:"viewpoint",isArray:!1,description:"<p>The viewpoint and screenshot of the issue</p>"},{group:"Request body",type:"Number",optional:!0,field:"viewCount",isArray:!1,description:"<p>The viewcount of the issue</p>"},{group:"Request body",type:"Object",optional:!0,field:"extras",isArray:!1,description:"<p>A field containing any extras that wanted to be saved in the issue (typically used by BCF)</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e HTTP/1.1
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
}`,type:"json"}],fields:{200:[{group:"200",type:"Object",optional:!1,field:"Updated",isArray:!1,description:"<p>Issue Object.</p>"}]}},version:"0.0.0",filename:"issue.js",groupTitle:"Issues"},{type:"patch",url:"/:teamspace/:model/revision/:revId/issues/:issueId",title:"Update issue on revision",name:"updateIssueRev",group:"Issues",description:'<p>Updates an issue for a particular revision. See <a href="#api-Issues-updateIssue">here</a> for more details.</p>',version:"0.0.0",filename:"issue.js",groupTitle:"Issues",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"issueId",isArray:!1,description:"<p>Issue ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"revId",isArray:!1,description:"<p>Revision ID</p>"}]}}},{type:"post",url:"/:teamspace/jobs/:jobId/:user",title:"Assign a job",name:"addUserToJob",group:"Jobs",description:"<p>Assign a job to a user.</p>",parameter:{fields:{Parameter:[{group:"Parameter",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>User</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"POST /acme/jobs/Job1/alice HTTP/1.1",type:"post"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"post",url:"/:teamspace/jobs",title:"Create a new job",name:"createJob",group:"Jobs",description:"<p>Create a new job on teamspace.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	_id:"Job4",
	color:"#ffff00"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /acme/jobs HTTP/1.1
{
	_id:"Job4",
	color:"#ffff00"
}`,type:"post"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"delete",url:"/:teamspace/jobs/:jobId",title:"Delete a job",name:"deleteJob",group:"Jobs",description:"<p>Delete a job from teamspace.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/jobs/Job 1 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{type:"get",url:"/:teamspace/myJob",title:"Get user job",name:"getUserJob",group:"Jobs",description:"<p>Get job assigned to current user.</p>",examples:[{title:"Example usage:",content:"GET /acme/myJob HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	_id":"Job1",
	"color":"ff00000"
}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs/colors",title:"List colours",name:"listColors",group:"Jobs",description:"<p>List job colours.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"String[]",optional:!1,field:"colors",isArray:!0,description:"<p>List of job colours</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
[
	"#ff0000",
	"#00ff00",
	"#0000ff"
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs/colors HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/:teamspace/jobs",title:"List all jobs",name:"listJobs",group:"Jobs",description:"<p>List of all jobs defined in teamspace.</p>",success:{fields:{"Job object":[{group:"Job object",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Job object",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/jobs HTTP/1.1",type:"get"}],version:"0.0.0",filename:"job.js",groupTitle:"Jobs",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"put",url:"/:teamspace/jobs/:jobId",title:"Update job",name:"updateJob",group:"Jobs",description:"<p>Update job.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"jobId",isArray:!1,description:"<p>Job ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Name of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"color",isArray:!1,description:"<p>Colour of job</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:`PUT /acme/jobs/Job1 HTTP/1.1
{
	_id:"Renamed Job",
	color:"#00ffff"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"job.js",groupTitle:"Jobs"},{name:"getHereAerialMapsTile",group:"Maps",description:"<p>Retrieve a Here Maps aerial map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/hereaerial/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
</response>`,type:"xml"}]},version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/maps/herebuildings/:lat/:long/tile.json",title:"Here building elevation",name:"getHereBuildingsFromLongLat",group:"Maps",description:"<p>Retrieve building elevation information from Here Maps.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"Number",optional:!1,field:"lat",isArray:!1,description:"<p>Latitude</p>"},{group:"Parameter",type:"Number",optional:!1,field:"long",isArray:!1,description:"<p>Longitude</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herebuildings/51.524575/-0.139088/tile.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>"},{name:"getHereGreyTile",group:"Maps",description:"<p>Retrieve a Here Maps grey map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heregrey/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereHybridTile",group:"Maps",description:"<p>Retrieve a Here Maps hybrid map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herehybrid/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereLabelOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps label overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herelabeloverlay/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereMapsTile",group:"Maps",description:"<p>Retrieve a Here Maps map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/here/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHerePOITile",group:"Maps",description:"<p>Retrieve a Here Maps point-of-interest (POI) map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/herepoi/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTerrainTile",group:"Maps",description:"<p>Retrieve a Here Maps terrain map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/hereterrain/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTollZoneTile",group:"Maps",description:"<p>Retrieve a Here Maps toll zone map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretollzone/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTrafficFlowTile",group:"Maps",description:"<p>Retrieve a Here Maps traffic flow overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretrafficflow/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTrafficTile",group:"Maps",description:"<p>Retrieve a Here Maps traffic map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretraffic/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTruckRestrictionsOverlayTile",group:"Maps",description:"<p>Retrieve a Here Maps truck restrictions overlay tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruckoverlay/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{name:"getHereTruckRestrictionsTile",group:"Maps",description:"<p>Retrieve a Here Maps truck restrictions map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruck/17/65485/43574.png HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps/osm/:zoomLevel/:gridx/:gridy.png",title:"OSM map tile",name:"getOSMTile",group:"Maps",description:"<p>Retrieve an Open Street Map (OSM) map tile image.</p>",examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps/osm/17/65485/43574.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"Number",optional:!1,field:"zoomLevel",isArray:!1,description:"<p>Zoom level</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridx",isArray:!1,description:"<p>Longitudinal (X) grid reference</p>"},{group:"Parameter",type:"Number",optional:!1,field:"gridy",isArray:!1,description:"<p>Latitudinal (Y) grid reference</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"png",optional:!1,field:"image",isArray:!1,description:"<p>Map tile image</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<binary image>`,type:"png"}]}},{type:"get",url:"/:teamspace/:model/maps",title:"List maps",name:"listMaps",group:"Maps",description:"<p>List the available geographic information system (GIS) sources and map layers.</p>",success:{fields:{"Success 200":[{group:"Success 200",type:"Object[]",optional:!1,field:"maps",isArray:!0,description:"<p>List of available map objects</p>"}],"Map object":[{group:"Map object",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of map provider</p>"},{group:"Map object",type:"Object[]",optional:!1,field:"layers",isArray:!0,description:"<p>List of available map layer objects</p>"}],"Layer object":[{group:"Layer object",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of map layer</p>"},{group:"Layer object",type:"String",optional:!1,field:"source",isArray:!1,description:"<p>Map source identifier</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/maps HTTP/1.1",type:"get"}],version:"0.0.0",filename:"maps.js",groupTitle:"Maps",groupDescription:"<p>Geographic information system (GIS) resources from Open Street Maps (OSM) and Here are supported. Please note that an app_id and app_code from Here are required to access Here resources.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/4DTaskSequence.json",title:"Get All metadata for 4D Sequence Tags",name:"getAllIdsWith4DSequenceTag",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/4DTaskSequence.json",title:"Get All metadata with 4D Sequence Tags by revision",name:"getAllIdsWith4DSequenceTagRev",group:"Meta",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/all.json?filter=:filter",title:"Get all metadata",name:"getAllMetadata",group:"Meta",description:"<p>Get all objects in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"filter",isArray:!1,description:"<p>(optional) properties to filter for, comma separated</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/all.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/all.json?filter=:filter",title:"Get all metadata by revision",name:"getAllMetadataByRev",group:"Meta",description:"<p>Get all tree objects with their metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to get metadata from</p>"},{group:"Parameter",type:"String",optional:!1,field:"filter",isArray:!1,description:"<p>(optional) properties to filter for, comma separated</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata",name:"getIdsWithMetadataField",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key (in the latest revision). It also returns the metadata value for that key.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey",isArray:!1,description:"<p>Unique metadata key</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/findObjsWith/IsLandmarked.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json",title:"Get ids by metadata",name:"getIdsWithMetadataFieldByRev",group:"Meta",description:"<p>Get ids of tree objects which has a particular metadata key from a particular revision. See more details <a href='#api-Meta-getIdsWithMetadataField'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to get metadata from</p>"},{group:"Parameter",type:"String",optional:!1,field:"metaKey",isArray:!1,description:"<p>Unique meta key</p>"}]}},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"get",url:"/:teamspace/:model/meta/:id.json",title:"Get metadata",name:"getMetadataById",group:"Meta",description:"<p>Get all metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",optional:!1,field:"id",isArray:!1,description:"<p>Meta Unique ID</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"post",url:"/:teamspace/:model/revision(/master/head/|/:revId)/meta/rules?filter=:filter",title:"Filter metadata by rules",name:"queryMetadataByRules",group:"Meta",description:"<p>Get all objects matching filter rules in the tree with their metadata.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"filter",isArray:!1,description:"<p>(optional) properties to filter for, comma separated</p>"}],Query:[{group:"Query",type:"Boolean",optional:!0,field:"meshids",isArray:!1,description:"<p>Flag that returns Mesh IDs for matching rule queries</p>"}]}},examples:[{title:"Example usage (/master/head)",content:`POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/rules HTTP/1.1
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
]`,type:"json"}]},version:"0.0.0",filename:"meta.js",groupTitle:"Meta"},{type:"patch",url:"/:teamspace/models/permissions",title:"Batch update model permissions",name:"batchUpdateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace.</p>"}],"Request body":[{group:"Request body",type:"ModelPermissions[]",optional:!1,field:"BODY",isArray:!0,description:"<p>List of model permissions</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Request body: ModelPermissions",type:"Permission[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of user permissions</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /acme/models/permissions HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/model",title:"Create a model",name:"createModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Name of project in which the model will be created</p>"},{group:"Request body",type:"String",optional:!1,field:"modelName",isArray:!1,description:"<p>Name of the model to be created</p>"},{group:"Request body",type:"String",optional:!1,field:"unit",isArray:!1,description:"<p>The unit in which the model is specified</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",isArray:!1,description:"<p>A description of the model</p>"},{group:"Request body",type:"String",optional:!0,field:"code",isArray:!1,description:"<p>A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers</p>"},{group:"Request body",type:"String",optional:!1,field:"type",isArray:!1,description:"<p>The type of the model</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/model HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"delete",url:"/:teamspace/:model",title:"Delete Model.",name:"deleteModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to delete.</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /teamSpace1/17d09947-368e-4748-877f-d105842c6681 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success:",content:`{
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

/***** FILE CONTENTS ******\\`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/settings/heliSpeed",title:"Get model heli speed",name:"getHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The modelId to get Heli speed for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{"heliSpeed":1}',type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/idMap.json",title:"Get ID map",name:"getIdMap",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model id to Get ID Map for.</p>"}]}},examples:[{title:"Example usage (federation):",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/idMap.json HTTP/1.1",type:"get"},{title:"Example usage (model):",content:"GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idMap.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success (federation):",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.json.mpc",title:"Get JSON Mpc",name:"getJsonMpc",group:"Model",description:"<p>Get the unity bundle mpc json file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model to get JSON Mpc for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",isArray:!1,description:"<p>id of the json.mpc file</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model.json",title:"Get model settings",name:"getModelSetting",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"Object",optional:!1,field:"model",isArray:!1,description:"<p>The modelId to get settings for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{name:"getMultipleModelsPermissions",group:"Model",description:"<p>Gets the permissions of a list of models</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace.</p>"}],Query:[{group:"Query",type:"String[]",optional:!1,field:"MODELS",isArray:!0,description:"<p>An array of model ids.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/models/permissions?models=5ce7dd19-1252-4548-a9c9-4a5414f2e0c5,3549ddf6-885d-4977-87f1-eeac43a0e818 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},type:"",url:"",version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/repoAssets.json",title:"Get unity assets",name:"getRepoAssets",group:"Model",description:"<p>Get the lastest model's version assets. If RepoBundles are available, they are returned, otherwise AssetBundles are returned.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/repoAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.repobundle",title:"Get RepoBundle by Id",name:"getRepoBundle",group:"Model",description:"<p>Gets an actual Repo Bundle file containing a set of assets. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",isArray:!1,description:"<p>id of the repo bundle file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idMap.json",title:"Get tree path by revision",name:"getRevIdMap",group:"Model",description:"<p>Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to ID map for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/idToMeshes.json",title:"Get ID Meshes by revision",name:"getRevIdToMeshes",group:"Model",description:"<p>Get ID Meshes by revision. See more details <a href='#api-Model-getTreePath'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/modelProperties.json",title:"Get model properties by revision",name:"getRevModelProperties",group:"Model",description:"<p>Get model properties by revision. See more details <a href='#api-Model-getModelProperties'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/fulltree.json",title:"Get tree by revision",name:"getRevModelTree",group:"Model",description:"<p>Get full tree by revision. See more details <a href='#api-Model-getModelTree'>here</a>.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get Tree for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:rev/srcAssets.json",title:"Get revision's src assets",name:"getRevSrcAssets",group:"Model",description:"<p>Get the model's assets but of a particular revision</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model to get src assets for</p>"}]}},examples:[{title:"Example usage:",content:"GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/4d48e3de-1c87-4fdf-87bf-d92c224eb3fe/srcAssets.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.src.mpc",title:"Get Model in SRC representation",name:"getSRC",group:"Model",description:"<p>Get a mesh presented in SRC format.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",isArray:!1,description:"<p>id of the SRC file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/permissions",title:"Get model permissions",name:"getSingleModelPermissions",group:"Model",description:"<p>Gets the permissions of a model</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get Permission for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/permissions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/:revId/subModelRevisions",title:"Get submodel revisions by rev",name:"getSubModelRevisionsByRev",group:"Model",description:"<p>In a federation it returns the submodels revisions of a particular federation revision. See more details <a href='#api-Model-getSubRevisionModels'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get properties for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/subModelRevisions",title:"Get submodels revisions",name:"getSubRevisionModels",group:"Model",description:"<p>In a federation it returns the submodels revisions of the latest federation revision.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get properties for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/subModelRevisions HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.texture",title:"Get a Texture by Id",name:"getTexture",group:"Model",description:"<p>Gets a texture by id. The id may be provided from a number of sources but most likely will be given in a mappings material properties. The metadata of the texture is provided in the response headers.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",isArray:!1,description:"<p>id of the texture file.</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/tree_path.json",title:"Get tree paths",name:"getTreePath",group:"Model",description:"<p>Returns the full tree path for the model and if the model is a federation of it submodels. These tree paths have the path to get to every object in the model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to get tree path for.</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/tree_path.json HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/revision/master/head/unityAssets.json",title:"Get unity assets",name:"getUnityAssets",group:"Model",description:"<p>Get the lastest model's version unity assets</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model Id to get unity assets for.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>The revision of the model</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/assetsMeta HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
    superMeshes: [
         {
              _id: "<uuid string>",
             nVertices: 123,
             nFaces: 123,
             nUVChannels: 123,
             boundingBox: [[1, 2, 3], [3,4, 5]]
         },
    ]
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"get",url:"/:teamspace/:model/:uid.unity3d",title:"Get Unity Bundle",name:"getUnityBundle",group:"Model",description:"<p>Gets an actual unity bundle file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>id of the model</p>"},{group:"Parameter",type:"String",optional:!1,field:"uid",isArray:!1,description:"<p>id of the unity bundle</p>"}]}},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload/ms-chunking",title:"Initialise MS chunking request",name:"initChunking",group:"Model",description:"<p>Initiate model revision data for MS Logic Apps chunked upload.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model id to upload.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"filename",isArray:!1,description:"<p>Filename of content to upload</p>"},{group:"Request body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>Tag name for new revision</p>"},{group:"Request body",type:"String",optional:!0,field:"desc",isArray:!1,description:"<p>Description for new revision</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"importAnimations",isArray:!1,description:"<p>Whether to import animations within a sequence</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking HTTP/1.1
{
	"filename": "structure.ifc",
	"tag": "rev001",
	"desc": "Revision 2"
}`,type:"post"}],success:{examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"corID": "00000000-0000-1111-2222-333333333333"
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{name:"searchModelTree",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"searchString",isArray:!1,description:"<p>The string to use for search tree objects</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/searchtree.json?searchString=fou HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]`,type:"json"}]},type:"",url:"",version:"0.0.0",filename:"model.js",groupTitle:"Model"},{name:"searchModelTreeRev",group:"Model",description:"<p>Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param. See more details <a href='#api-Model-searchModelTree'>here</a></p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to use.</p>"},{group:"Parameter",type:"String",optional:!1,field:"rev",isArray:!1,description:"<p>Revision to use.</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"searchString",isArray:!1,description:"<p>The string to use for search tree objects</p>"}]}},type:"",url:"",version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/heliSpeed",title:"Update model heli speed",name:"updateHeliSpeed",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to Update Heli speed.</p>"}],"Request body":[{group:"Request body",type:"Number",optional:!1,field:"heliSpeed",isArray:!1,description:"<p>The value of the speed that will replace the heli speed.</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1
{"heliSpeed":3}`,type:"put"}],success:{examples:[{title:"Success:",content:"{}",type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model",title:"Update Federated Model",name:"updateModel",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Federated Model ID to update</p>"}],"Request body":[{group:"Request body",type:"[]Submodel",optional:!1,field:"subModels",isArray:!0,description:"<p>Information on the models that are going to get federated</p>"}],"Request body: SubModel":[{group:"Request body: SubModel",type:"String",optional:!1,field:"database",isArray:!1,description:"<p>The teamspace name which the model belongs to</p>"},{group:"Request body: SubModel",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id to be federated</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5 HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/:model/permissions",title:"Update model permissions",name:"updateModelPermissions",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"Permission[]",optional:!1,field:"BODY",isArray:!0,description:"<p>List of user permissions</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage (add user permission):",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/models/permissions",title:"Update multiple models permissions",name:"updateMultiplePermissions",group:"Model",deprecated:{content:"use now (#Model:batchUpdateModelPermissions)"},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace.</p>"}],"Request body":[{group:"Request body",type:"[]ModelPermissions",optional:!1,field:"BODY",isArray:!0,description:"<p>Its an array with a list of model ids and their permissions.</p>"}],"Request body: ModelPermissions":[{group:"Request body: ModelPermissions",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id of the model that will have their permission changed. If it's a federation the entry in the response corresponding with the model will have the 'federated' field set to true.</p>"},{group:"Request body: ModelPermissions",type:"[]Permission",optional:!1,field:"permissions",isArray:!0,description:"<p>An array indicating the new permissions.</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/models/permissions HTTP/1.1
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
]`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/permissions",title:"Update model permissions",name:"updatePermissions",group:"Model",deprecated:{content:"use now (#Model:updateModelPermissions)"},parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id of the model to be updated</p>"}],"Request body":[{group:"Request body",type:"[]Permissions",optional:!1,field:"BODY",isArray:!0,description:"<p>Its an array with a list of users and their permission type.</p>"}],"Request body: Permission":[{group:"Request body: Permission",type:"string",optional:!1,field:"user",isArray:!1,description:"<p>User ID</p>"},{group:"Request body: Permission",type:"string",optional:!1,field:"permission",isArray:!1,description:"<p>Permission type ('viewer'|'commenter'|'collaborator'|'').</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/permissions HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"put",url:"/:teamspace/:model/settings/",title:"Update Model Settings",name:"updateSettings",group:"Model",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model to update Settings.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of the model to be created</p>"},{group:"Request body",type:"String",optional:!1,field:"unit",isArray:!1,description:"<p>The unit in which the model is specified</p>"},{group:"Request body",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers</p>"},{group:"Request body",type:"String",optional:!1,field:"type",isArray:!1,description:"<p>The type of the model</p>"},{group:"Request body",type:"Number",optional:!1,field:"angleFromNorth",isArray:!1,description:"<p>GIS bearing angle</p>"},{group:"Request body",type:"Number",optional:!1,field:"elevation",isArray:!1,description:"<p>GIS elevation</p>"},{group:"Request body",type:"[]SurveyPoint",optional:!1,field:"surveyPoints",isArray:!0,description:"<p>an array containing GIS surveypoints</p>"}],"Request body: SurveyPoint":[{group:"Request body: SurveyPoint",type:"Number[]",optional:!1,field:"position",isArray:!0,description:"<p>an array representing a three dimensional coordinate</p>"},{group:"Request body: SurveyPoint",type:"Number[]",optional:!1,field:"latLong",isArray:!0,description:"<p>an array representing a two dimensional coordinate for latitude and logitude</p>"}]}},examples:[{title:"Example usage:",content:`PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"patch",url:"/:teamspace/:model/upload/ms-chunking/:corID",title:"Upload model chunk",name:"uploadChunk",group:"Model",description:"<p>Upload model chunk for Microsoft Logic Apps.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID to upload</p>"},{group:"Parameter",type:"String",optional:!1,field:"corID",isArray:!1,description:"<p>Upload correlation ID</p>"}],"Request header":[{group:"Request header",type:"String",optional:!1,field:"Content-Range",isArray:!1,description:"<p>Byte range for the current content chunk, including the starting value, ending value, and the total content size, for example: &quot;bytes 0-1023/10100&quot;</p>"},{group:"Request header",type:"String",optional:!1,field:"Content-Type",isArray:!1,description:"<p>Type of chunked content</p>"},{group:"Request header",type:"String",optional:!1,field:"Content-Length",isArray:!1,description:"<p>Length of size in bytes of the current chunk</p>"}],"Request body: Attachment":[{group:"Request body: Attachment",type:"binary",optional:!1,field:"FILE",isArray:!1,description:"<p>the file to be uploaded</p>"}]}},success:{fields:{200:[{group:"200",type:"String",optional:!1,field:"Range",isArray:!1,description:"<p>Byte range for content that has been received by the endpoint, for example: &quot;bytes=0-1023&quot;</p>"},{group:"200",type:"Number",optional:!0,field:"x-ms-chunk-size",isArray:!1,description:"<p>Suggested chunk size in bytes</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
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
}`,type:"patch"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload/ms-chunking/:corID",title:"Start MS chunking upload",name:"uploadChunksStart",group:"Model",description:"<p>Start chunked model upload for Microsoft Logic Apps. Max chunk size defined as 52,428,800 bytes (52 MB) based on https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-limits-and-config?tabs=azure-portal</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID to upload</p>"},{group:"Parameter",type:"String",optional:!1,field:"corID",isArray:!1,description:"<p>Upload correlation ID</p>"}],"Request header":[{group:"Request header",type:"String",optional:!1,field:"x-ms-transfer-mode",isArray:!1,description:"<p>Indicates that the content is uploaded in chunks; value=&quot;chunked&quot;</p>"},{group:"Request header",type:"Number",optional:!1,field:"x-ms-content-length",isArray:!1,description:"<p>The entire content size in bytes before chunking</p>"}]}},success:{fields:{200:[{group:"200",type:"Number",optional:!0,field:"x-ms-chunk-size",isArray:!1,description:"<p>Suggested chunk size in bytes</p>"},{group:"200",type:"String",optional:!1,field:"Location",isArray:!1,description:"<p>The URL location where to send the HTTP PATCH messages</p>"}]},examples:[{title:"Success-Response:",content:`HTTP/1.1 200 OK
{
	"x-ms-chunk-size": 1024,
	"Location": "/teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking/00000000-0000-1111-2222-333333333333"
}`,type:"json"}]},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload/ms-chunking/00000000-0000-1111-2222-333333333333 HTTP/1.1

header: {
	"x-ms-transfer-mode": "chunked",
	"x-ms-content-length": 10100
}`,type:"post"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"post",url:"/:teamspace/:model/upload",title:"Upload Model.",name:"uploadModel",group:"Model",description:"<p>It uploads a model file and creates a new revision for that model.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model id to upload.</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>the tag name for the new revision</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>the description for the new revision</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"importAnimations",isArray:!1,description:"<p>whether to import animations within a sequence</p>"}],"Request body: Attachment":[{group:"Request body: Attachment",type:"binary",optional:!1,field:"FILE",isArray:!1,description:"<p>the file to be uploaded</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload HTTP/1.1
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
------WebKitFormBoundarySos0xligf1T8Sy8I-- *`,type:"post"}],version:"0.0.0",filename:"model.js",groupTitle:"Model"},{type:"delete",url:"/notifications",title:"Delete All notification",name:"deleteAllNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"delete",url:"/notifications/:id",title:"Delete a notification",name:"deleteNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications/:id",title:"Get a notification",name:"getNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/notifications",title:"Get all notifications",name:"getNotifications",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications/:id",title:"Patch a notification",name:"patchNotification",group:"Notification",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"id",isArray:!1,description:"<p>Unique Notification ID</p>"}]}},version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"patch",url:"/notifications",title:"Patch all the user notifications",name:"patchNotification",group:"Notification",version:"0.0.0",filename:"notification.js",groupTitle:"Notification"},{type:"get",url:"/:teamspace/:model/permission-templates",title:"List all model templates",name:"listModelTemplates",group:"PermissionTemplate",description:"<p>Get a list of model permission templates. Intended for users that have <code>manage_model_permission</code> privileges.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/permission-templates HTTP/1.1",type:"get"}],version:"0.0.0",filename:"permissionTemplate.js",groupTitle:"Permission Template",groupDescription:"<p>Permission template is a grouping of model level permissions. An ID is assigned to it as well. They are viewer, commenter, and collaborator.</p> <p>Three default permission templates are created by default. They are viewer, commenter, and collaborator.</p>",success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]}},{type:"get",url:"/plans",title:"List all Plans",name:"listPlans",group:"Plan",version:"0.0.0",filename:"plan.js",groupTitle:"Plan"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/start",title:"Starts a presentation session and returns the presentation code",name:"startPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>The code that users need to join in order to get the viewpoint.</p>"}]}},examples:[{title:"Example usage:",content:"POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:'{ code: "aASnk" }',type:"json"}]},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"put",url:"/:teamspace/:model/presentation/:code/stream",title:"Streams a viewpoint",name:"streamPresentation",group:"Presentation",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>The teamspace where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model where the presentation is taking place</p>"},{group:"Parameter",type:"String",optional:!1,field:"code",isArray:!1,description:"<p>The code that users need to join in order to get the viewpoint.</p>"}],"Request body":[{group:"Request body",type:"StreamingViewpoint",optional:!1,field:"The",isArray:!1,description:"<p>viewpoint</p>"}]}},version:"0.0.0",filename:"presentation.js",groupTitle:"Presentation"},{type:"post",url:"/:teamspace/projects",title:"Create project",name:"createProject",group:"Project",description:"<p>It creates a project. The name of the project is required.</p>",permission:[{name:"canCreateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the project to be created</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/projects HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects/:project/models",title:"List models of the project",name:"listModels",group:"Project",description:"<p>It returns a list of models .</p>",permission:[{name:"canListProjects"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>The name of the project to list models</p>"}],Query:[{group:"Query",type:"String",optional:!0,field:"name",isArray:!1,description:"<p>Filters models by name</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects/Bim%20Logo/models?name=log HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`[
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
]	 *`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/projects/:project",title:"Get project",name:"listProject",group:"Project",description:"<p>Get the details of a project; name, user permissions, modelids.</p>",permission:[{name:"canViewProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Project name to be queried</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1",type:"get"}],success:{examples:[{title:"Success:",content:`{
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
]`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"patch",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProject",group:"Project",description:"<p>Update project properties (name, permissions)</p>",permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>Name of project</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"name",isArray:!1,description:"<p>Project name</p>"},{group:"Request body",type:"ProjectPermission[]",optional:!0,field:"permissions",isArray:!0,description:"<p>List of user permissions</p>"}],"Type: ProjectPermission":[{group:"Type: ProjectPermission",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>Username of user</p>"},{group:"Type: ProjectPermission",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>List of user privileges</p>"}]}},examples:[{title:"Example usage (update permissions):",content:`PATCH /acme/ProjectAnvil HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"put",url:"/:teamspace/projects/:project",title:"Update project",name:"updateProjectPut",group:"Project",description:"<p>It updates a project. The name can be changed and the permissions as well as the permissions of users</p>",deprecated:{content:"use now (#Project:updateProject)"},permission:[{name:"canUpdateProject"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of the teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"project",isArray:!1,description:"<p>The name of the project to update</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the project to be created</p>"},{group:"Request body",type:"[]Permission",optional:!1,field:"permissions",isArray:!0,description:"<p>The permissions for each user from the project</p>"}],"Request body: Permissions":[{group:"Request body: Permissions",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>The username of the user to have it permission changed</p>"},{group:"Request body: Permissions",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>An array of permissions for the user to be assigned</p>"}]}},examples:[{title:"Example usage update permissions:",content:`PUT /teamSpace1/Classic%20project HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"project.js",groupTitle:"Project"},{type:"get",url:"/:teamspace/:model/resources/:resourceId",title:"Get resource file",name:"getResource",group:"Resources",description:"<p>Is the URL for downloading the resource file identified by the resourceId.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"resourceId",isArray:!1,description:"<p>The Id of the resource</p>"}]}},version:"0.0.0",filename:"resources.js",groupTitle:"Resources"},{type:"post",url:"/:teamspace/:model/risks/:riskId/resources",title:"Attach resources to a risk",name:"attachResourceRisk",group:"Risks",description:"<p>Attaches file or URL resources to a risk. If the type of the resource is file it should be sent as multipart/form-data. Both types at the same time cannot be sent. So in order to attach files and URLs it should be done with two different requests.</p> <p>This method triggers a chat event</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Request body file resource (multipart/form-data)":[{group:"Request body file resource (multipart/form-data)",type:"File[]",optional:!1,field:"files",isArray:!0,description:"<p>The array of files to be attached</p>"},{group:"Request body file resource (multipart/form-data)",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the files; it should have the same length as the files field and should include the file extension</p>"}],"Request body URL resource":[{group:"Request body URL resource",type:"String[]",optional:!1,field:"urls",isArray:!0,description:"<p>The array of URLs to be attached</p>"},{group:"Request body URL resource",type:"String[]",optional:!1,field:"names",isArray:!0,description:"<p>The names of the URLs; it should have the same length as the URL field</p>"}]}},success:{examples:[{title:"Success example result after two files has been uploaded",content:`
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
]`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model/risks/:riskId/comments",title:"Add a comment",name:"commentRisk",group:"Risks",description:"<p>Create a comment in a risk.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>Risk ID</p>"},{group:"Request body",type:"String",optional:!1,field:"rev_id",isArray:!1,description:"<p>Revision ID</p>"},{group:"Request body",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint object</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}},success:{fields:{"Success 200":[{group:"Success 200",type:"String",optional:!1,field:"guid",isArray:!1,description:"<p>Comment ID</p>"},{group:"Success 200",type:"Number",optional:!1,field:"created",isArray:!1,description:"<p>Comment creation timestamp</p>"},{group:"Success 200",type:"String",optional:!1,field:"owner",isArray:!1,description:"<p>Comment owner</p>"},{group:"Success 200",type:"String",optional:!1,field:"comment",isArray:!1,description:"<p>Comment text</p>"},{group:"Success 200",type:"Object",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint object</p>"}]},examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
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
}`,type:"post"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"delete",url:"/:teamspace/:model/risks/:riskId/comments",title:"Delete a comment",name:"deleteComment",group:"Risks",description:"<p>Delete a risk comment.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"guid",isArray:!1,description:"<p>Comment ID</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}},examples:[{title:"Example usage:",content:`DELETE /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"delete"}],success:{examples:[{title:"Success-Response.",content:`HTTP/1.1 200 OK
{
	"guid":"00000000-0000-0000-0000-000000000007",
}`,type:"json"}]},version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"delete",url:"/:teamspace/:model/risks/:riskId/resources",title:"Detach a resource from a risk",name:"detachResourceRisk",group:"Risks",description:"<p>Detachs a resource from a risk. If the risk is the last entity the resources has been attached to it also deletes the resource from the system. This method triggers a chat event .</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"_id",isArray:!1,description:"<p>The resource id to be detached</p>"}]}},success:{examples:[{title:"{",content:`
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
<binary image>`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png HTTP/1.1",type:"get"}],version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}]}}},{name:"listRisks",group:"Risks",description:"<p>Retrieve all model risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"Number",optional:!0,field:"updatedSince",isArray:!1,description:"<p>Only return issues that has been updated since this value (in epoch value)</p>"},{group:"Query",type:"Number[]",optional:!0,field:"numbers",isArray:!0,description:"<p>Array of issue numbers to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"ids",isArray:!0,description:"<p>Array of issue ids to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"categories",isArray:!0,description:"<p>Array of categories to filter for</p>"},{group:"Query",type:"String[]",optional:!0,field:"mitigationStatus",isArray:!0,description:"<p>Array of mitigation status to filter for</p>"},{group:"Query",type:"Number[]",optional:!0,field:"likelihoods",isArray:!0,description:"<p>Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"consequences",isArray:!0,description:"<p>Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLikelihoods",isArray:!0,description:"<p>Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"levelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualConsequences",isArray:!0,description:"<p>Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"},{group:"Query",type:"Number[]",optional:!0,field:"residualLevelOfRisks",isArray:!0,description:"<p>Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"json"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{name:"renderRisksHTML",group:"Risks",description:"<p>Retrieve HTML page of all risks.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],Query:[{group:"Query",type:"String",optional:!1,field:"ids",isArray:!1,description:"<p>Risk IDs to show</p>"}]}},success:{fields:{200:[{group:"200",type:"Object[]",optional:!1,field:"risks",isArray:!0,description:"<p>Risk objects</p>"}]},examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
<html page>`,type:"html"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1",type:"get"},{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1",type:"get"}],type:"",url:"",version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{name:"storeRisk",group:"Risks",description:"<p>Create a model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Request body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Request body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Request body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Request body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Request body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Request body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint</p>"}],"Type: Viewpoint":[{group:"Type: Viewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>Vector indicating the near plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>Vector indicating the far plane</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>Angle of the field of view</p>"},{group:"Type: Viewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>Aspect ratio of the fustrum</p>"},{group:"Type: Viewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>Clipping planes associated with the viewpoint</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group ID generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"highlighted_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group definition for those objects (this shouldnt be use simultaneously with highlighted_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"hidden_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects (this shouldnt be use simultaneously with hidden_group_id)</p>"},{group:"Type: Viewpoint",type:"Group",optional:!0,field:"shown_group",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the definition of the group to hold those objects (this shouldnt be use simultaneously with shown_group_id)</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"override_groups",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups with one group for each colour</p>"},{group:"Type: Viewpoint",type:"Group[]",optional:!0,field:"transformation_groups",isArray:!0,description:"<p>List of groups with transformations</p>"},{group:"Type: Viewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: Viewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: Viewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Base64 string representing the screenshot associated with the viewpoint</p>"}],"Type: Group":[{group:"Type: Group",type:"ModelObjects",optional:!1,field:"objects",isArray:!1,description:"<p>List of objects in group</p>"}],"Type: ModelObjects":[{group:"Type: ModelObjects",type:"String",optional:!1,field:"account",isArray:!1,description:"<p>The account that has the model which contains the objects</p>"},{group:"Type: ModelObjects",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>The model id that contains the objects</p>"},{group:"Type: ModelObjects",type:"String[]",optional:!1,field:"shared_ids",isArray:!0,description:"<p>The shared ids of objects to be selected</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
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
}`,type:"json"}]},type:"",url:"",version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{name:"updateRisk",group:"Risks",description:"<p>Update model risk.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!0,field:"revId",isArray:!1,description:"<p>Revision ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"riskId",isArray:!1,description:"<p>Risk ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Risk name</p>"},{group:"Request body",type:"String[]",optional:!1,field:"assigned_roles",isArray:!0,description:"<p>Risk owner</p>"},{group:"Request body",type:"String",optional:!1,field:"associated_activity",isArray:!1,description:"<p>Associated activity</p>"},{group:"Request body",type:"String",optional:!1,field:"category",isArray:!1,description:"<p>Category</p>"},{group:"Request body",type:"Number",optional:!1,field:"consequence",isArray:!1,description:"<p>Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"desc",isArray:!1,description:"<p>Risk description</p>"},{group:"Request body",type:"String",optional:!1,field:"element",isArray:!1,description:"<p>Element type</p>"},{group:"Request body",type:"Number",optional:!1,field:"likelihood",isArray:!1,description:"<p>Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"location_desc",isArray:!1,description:"<p>Location description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_status",isArray:!1,description:"<p>Treatment status</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_desc",isArray:!1,description:"<p>Treatment summary</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_detail",isArray:!1,description:"<p>Treatment detailed description</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_stage",isArray:!1,description:"<p>Treatment stage</p>"},{group:"Request body",type:"String",optional:!1,field:"mitigation_type",isArray:!1,description:"<p>Treatment type</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_consequence",isArray:!1,description:"<p>Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"Number",optional:!1,field:"residual_likelihood",isArray:!1,description:"<p>Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)</p>"},{group:"Request body",type:"String",optional:!1,field:"residual_risk",isArray:!1,description:"<p>Residual risk</p>"},{group:"Request body",type:"String",optional:!1,field:"risk_factor",isArray:!1,description:"<p>Risk factor</p>"},{group:"Request body",type:"String",optional:!1,field:"scope",isArray:!1,description:"<p>Construction scope</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint</p>"}]}},examples:[{title:"Example usage:",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
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
}`,type:"json"}]},type:"",url:"",version:"0.0.0",filename:"risk.js",groupTitle:"SafetiBase Risks"},{type:"post",url:"/:teamspace/:model/sequences",title:"Create custom sequence",name:"createSequence",group:"Sequences",description:"<p>Create custom sequence for model.</p>",examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"post",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Create one or more activities",name:"createSequenceActivities",group:"Sequences",description:"<p>Creates a sequence activity tree.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"Activity[]",optional:!1,field:"activity",isArray:!0,description:"<p>An array of the activity tree that will be created</p>"},{group:"Request body",type:"Boolean",optional:!0,field:"overwrite",isArray:!1,description:"<p>This flag indicates whether the request will replace the currently stored activities or just added at the end of the currently stored activities array. If not present it will be considered as false.</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: Activity":[{group:"Type: Activity",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The name of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"startDate",isArray:!1,description:"<p>The starting timestamp date of the activity</p>"},{group:"Type: Activity",type:"Number",optional:!1,field:"endDate",isArray:!1,description:"<p>The ending timestamp date of the activity</p>"},{group:"Type: Activity",type:"Object",optional:!0,field:"resources",isArray:!1,description:"<p>The resources asoociated with the activity</p>"},{group:"Type: Activity",type:"KeyValue[]",optional:!0,field:"data",isArray:!0,description:"<p>An array of key value pairs with metadata for the activity</p>"},{group:"Type: Activity",type:"Activity[]",optional:!0,field:"subActivities",isArray:!0,description:"<p>An array of activities that will be children of the activity</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",isArray:!1,description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",isArray:!1,description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`POST /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
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
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceID",title:"Delete sequence",name:"deleteSequence",group:"Sequences",description:"<p>Delete the custom sequence by ID</p>",examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"delete",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"deleteSequenceActivity",group:"Sequences",description:"<p>Delete a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",isArray:!1,description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceId/activities/:activityId",title:"Edit an activity",name:"editSequenceActivity",group:"Sequences",description:"<p>Edits a sequence activity.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"activityId",isArray:!1,description:"<p>The activity unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!0,field:"name",isArray:!1,description:"<p>The name of the activity</p>"},{group:"Request body",type:"Number",optional:!0,field:"startDate",isArray:!1,description:"<p>The starting timestamp date of the activity</p>"},{group:"Request body",type:"Number",optional:!0,field:"endDate",isArray:!1,description:"<p>The ending timestamp date of the activity</p>"},{group:"Request body",type:"String",optional:!0,field:"parent",isArray:!1,description:"<p>The parent id if it has one. This parent must exist previously</p>"},{group:"Request body",type:"Object",optional:!0,field:"resources",isArray:!1,description:"<p>The resources asoociated with the activity</p>"},{group:"Request body",type:"KeyValue[]",optional:!0,field:"data",isArray:!0,description:"<p>An array of key value pairs with metadata for the activity</p>"}],"Type: KeyValue":[{group:"Type: KeyValue",type:"String",optional:!1,field:"key",isArray:!1,description:"<p>The key of the pair</p>"},{group:"Type: KeyValue",type:"Any",optional:!1,field:"value",isArray:!1,description:"<p>The value of the pair</p>"}]}},examples:[{title:"Example usage",content:`PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1
{
   "name":"Renamed activity"
}`,type:"patch"}],success:{examples:[{title:"Success-Response",content:"HTTP/1.1 200 OK",type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"get",url:"/:teamspace/:model/sequences/:sequenceID/legend",title:"get the legend",name:"getLegend",group:"Sequences",description:"<p>Get the legend for this sequence</p>",examples:[{title:"Example usage",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	  "Building works": "#aabbcc"
	  "Temporary works": "#ffffff66"
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/sequences/:sequenceID",title:"Get sequence",name:"getSequence",group:"Sequences",description:"<p>Get sequence by ID</p>",examples:[{title:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",content:"GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"get",url:"/:teamspace/:model/sequences/:sequenceId/activities",title:"Get all activities",name:"getSequenceActivities",group:"Sequences",description:"<p>Get all sequence activities.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"sequenceId",isArray:!1,description:"<p>Sequence unique ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage",content:`GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
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
]`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences"},{type:"put",url:"/:teamspace/:model/sequences/:sequenceID/legend",title:"Add/Update legend",name:"updateLegend",group:"Sequences",description:"<p>Update/add a legend to this sequence</p>",examples:[{title:"Example usage",content:"PUT /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1",type:"put"},{title:"Example usage:",content:`{
	  "Building works": "#aabbcc"
	  "Temporary works": "#ffffff66"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{}`,type:"json"}]},version:"0.0.0",filename:"sequence.js",groupTitle:"Sequences",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}}},{type:"patch",url:"/:teamspace/:model/sequences/:sequenceID",title:"Update a sequence",name:"updateSequence",group:"Sequences",description:"<p>Update a sequence (note: currently only name chance is supported</p>",examples:[{title:"Example usage",content:"PATCH /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1",type:"patch"},{title:"Example usage:",content:`{
	  "name": "Building works"
}`,type:"patch"}],parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>The new name of the sequence</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
}`,type:"json"}]},version:"0.0.0",filename:"subscriptions.js",groupTitle:"Subscription"},{type:"post",url:"/:teamspace/members",title:"Add a team member",name:"addTeamMember",group:"Teamspace",description:"<p>Adds a user to a teamspace and assign it a job.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"job",isArray:!1,description:"<p>The job that the users going to have assigned</p>"},{group:"Request body",type:"String",optional:!1,field:"user",isArray:!1,description:"<p>The username of the user to become a member</p>"},{group:"Request body",type:"String[]",optional:!1,field:"permissions",isArray:!0,description:"<p>The permisions to be assigned to the member it can be an empty array or have a &quot;teamspace_admin&quot; value.</p>"}]}},examples:[{title:"Example usage:",content:`POST /teamSpace1/members HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"get",url:"/:teamspace/members/search/:searchString",title:"Search for non-members",name:"findUsersWithoutMembership",group:"Teamspace",description:"<p>It returns a list of users that dont belong to the teamspace and that their usernames matches partially with the string and if entered an email it only matches if the string is the entire email address.</p> <p>In the result it's included their username, first name, last name, company and roles in other teamspaces.</p>",permission:[{name:"teamSpaceAdmin"}],parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"search",isArray:!1,description:"<p>Search string provided to find member</p>"}]}},examples:[{title:"Example usage:",content:"GET /teamSpace1/members/search/project HTTP/1.1",type:"get"}],success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK

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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace"},{type:"patch",url:"/:teamspace/settings",title:"Update teamspace settings",name:"updateTeamspaceSettings",group:"Teamspace",description:"<p>Update teamspace settings.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String[]",optional:!0,field:"riskCategories",isArray:!0,description:"<p>List of risk categories</p>"},{group:"Request body",type:"String[]",optional:!0,field:"topicTypes",isArray:!0,description:"<p>List of issue topic types</p>"}],"Risk category":[{group:"Risk category",type:"String",optional:!1,field:"value",isArray:!1,description:"<p>Value of risk category</p>"},{group:"Risk category",type:"String",optional:!1,field:"label",isArray:!1,description:"<p>Label for risk category</p>"}],"Topic type":[{group:"Topic type",type:"String",optional:!1,field:"value",isArray:!1,description:"<p>Value of topic type</p>"},{group:"Topic type",type:"String",optional:!1,field:"label",isArray:!1,description:"<p>Label for topic type</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}},examples:[{title:"Example usage",content:`PUT /acme/settings HTTP/1.1
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
}`,type:"json"}]},version:"0.0.0",filename:"teamspace.js",groupTitle:"Teamspace",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"}]}}},{type:"get",url:"/starredMeta",title:"Gets the starred metadata tags for the logged user",description:"<p>This endpoint returns the starred metadata tags. You can manage the starred metadata in the frontend from BIM (i) icon in the viewer.</p>",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
[
   "material",
   "color",
   "base offset"
]`,type:"json"}]},name:"GetStarredMetadataTags",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/starredModels",title:"Gets the starred models for the logged user",name:"GetStarredModels",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredMeta",title:"Replaces the whole starred metadata tags array for the logged user",name:"SetMetadataTags",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",optional:!0,field:"String",isArray:!1,description:"<p>(Request body) An array of tags to be starred</p>"}]},examples:[{title:"Input",content:`   [
   	"material",
	  	"color"
	  ]`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"put",url:"/starredModels",title:"Sets the whole starred models for the logged user",name:"SetStarredModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",optional:!0,field:"String",isArray:!1,description:"<p>An array of models to be starred, belong to the teamspace</p>"}]},examples:[{title:"Input",content:`   {
    	"user1": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"],
    	"user2": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
	  }`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredMeta",title:"Adds a starred metadata tag for the logged user",name:"StarMetadataTags",group:"User",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>The tag to be starred</p>"}]},examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/starredModels",title:"Adds a starred models for the logged user",name:"StarModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>teamspace where model resides</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>model ID  to add</p>"}]},examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredMeta",title:"removes a starred metadata tag for the logged user if the tag exists",name:"UnstarMetadataTags",group:"User",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"tag",isArray:!1,description:"<p>The tag to be starred</p>"}]},examples:[{title:"Input",content:`{
  "tag": "material"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/starredModels",title:"removes a starred models for the logged user if the tag exists",name:"UnstarModels",group:"User",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>teamspace where model resides</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>model ID  to remove</p>"}]},examples:[{title:"Input",content:`{
  "teamspace": "user1",
  "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
}`,type:"json"}]},success:{examples:[{title:"Success",content:`   HTTP/1.1 200 OK
	  {}`,type:"json"}]},error:{fields:{"Error 4xx":[{group:"Error 4xx",optional:!1,field:"400",isArray:!1,description:"<p>BadRequest The request was malformed</p>"}]}},version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"delete",url:"/apikey",title:"Deletes the current apikey for the logged user",name:"deleteApiKey_HTTP/1.1_200_OK_{}",group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/apikey",title:"Generates an apikey for the logged user",name:"generateApiKey",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   apiKey:"20f947a673dce5419ce187ca7998a68f"
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"get",url:"/me",title:"Gets the profile for the logged user",name:"getProfile",success:{examples:[{title:"Success",content:`HTTP/1.1 200 OK
{
   username: "jasonv",
   firstName: "Jason",
   lastName: "Voorhees",
   email: "jason@vorhees.com",
   hasAvatar: true
}`,type:"json"}]},group:"User",version:"0.0.0",filename:"user.js",groupTitle:"User"},{type:"post",url:"/:teamspace/:model/viewpoints/",title:"Create view",name:"createView",group:"Views",description:"<p>Create a new view.</p>",parameter:{fields:{"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"},{group:"Request body",type:"Viewpoint",optional:!1,field:"viewpoint",isArray:!1,description:"<p>Viewpoint</p>"},{group:"Request body",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>Screenshot</p>"},{group:"Request body",type:"String",optional:!0,field:"clippingPlanes",isArray:!1,description:"<p>List of clipping planes</p>"}],"Request body: screenshot":[{group:"Request body: screenshot",type:"String",optional:!1,field:"base64",isArray:!1,description:"<p>Screenshot image in base64</p>"}],Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:`POST /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
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
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"delete",url:"/:teamspace/:model/viewpoints/:viewId",title:"Delete view",name:"deleteView",group:"Views",description:"<p>Delete a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}]}},examples:[{title:"Example usage:",content:"DELETE /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000 HTTP/1.1",type:"delete"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"status":"success"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"},{type:"get",url:"/:teamspace/:model/viewpoints/:viewId",title:"Get view",name:"findView",group:"Views",description:"<p>Retrieve a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1",type:"get"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
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
]`,type:"png"}]},examples:[{title:"Example usage:",content:"GET /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1",type:"get"}],version:"0.0.0",filename:"view.js",groupTitle:"Views",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Type: ResultViewpoint":[{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"near",isArray:!1,description:"<p>The vector indicating the near plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"far",isArray:!1,description:"<p>The vector indicating the far plane.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"fov",isArray:!1,description:"<p>The angle of the field of view.</p>"},{group:"Type: ResultViewpoint",type:"Number",optional:!1,field:"aspect_ratio",isArray:!1,description:"<p>The aspect ratio of the fustrum.</p>"},{group:"Type: ResultViewpoint",type:"ClippingPlane[]",optional:!0,field:"clippingPlanes",isArray:!0,description:"<p>the clipping planes associated with the viewpoint</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"highlighted_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more highlighted objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"hidden_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more hidden objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!0,field:"shown_group_id",isArray:!1,description:"<p>If the viewpoint is associated with one or more shown objects from the model this field has the value of a group id generated to hold those objects</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"override_group_ids",isArray:!0,description:"<p>If the viewpoint has one or more objects with colour override this field has an array of groups ids with one group for each colour</p>"},{group:"Type: ResultViewpoint",type:"String[]",optional:!0,field:"transformation_group_ids",isArray:!0,description:"<p>List of group IDs with transformations</p>"},{group:"Type: ResultViewpoint",type:"Boolean",optional:!1,field:"hide_IFC",isArray:!1,description:"<p>A flag to hide the IFC</p>"},{group:"Type: ResultViewpoint",type:"String",optional:!1,field:"screenshot",isArray:!1,description:"<p>A string in base64 representing the screenshot associated with the viewpoint</p>"}],"Type: ClippingPlane":[{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"distance",isArray:!1,description:"<p>The distance for the clipping plane to the origin</p>"},{group:"Type: ClippingPlane",type:"Number",optional:!1,field:"clipDirection",isArray:!1,description:"<p>The direction to the clipping plane will cut the model; above or below the plane. Possible values: 1 , -1.</p>"}]}}},{type:"put",url:"/:teamspace/:model/viewpoints/:viewId",title:"Update view",name:"updateView",group:"Views",description:"<p>Update a view.</p>",parameter:{fields:{Parameter:[{group:"Parameter",type:"String",optional:!1,field:"viewId",isArray:!1,description:"<p>View ID</p>"},{group:"Parameter",type:"String",optional:!1,field:"teamspace",isArray:!1,description:"<p>Name of teamspace</p>"},{group:"Parameter",type:"String",optional:!1,field:"model",isArray:!1,description:"<p>Model ID</p>"}],"Request body":[{group:"Request body",type:"String",optional:!1,field:"name",isArray:!1,description:"<p>Name of view</p>"}]}},examples:[{title:"Example usage:",content:`PUT /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
{
	"name":"NewName"
}`,type:"put"}],success:{examples:[{title:"Success-Response",content:`HTTP/1.1 200 OK
{
	"_id":"00000000-0000-0000-0000-000000000001"
}`,type:"png"}]},version:"0.0.0",filename:"view.js",groupTitle:"Views"}];const de={name:"Acme project",version:"5.11.0",description:"REST Api",sampleUrl:!1,defaultVersion:"0.0.0",apidoc:"0.3.0",generator:{name:"apidoc",time:"Fri Jun 21 2024 17:05:28 GMT+0100 (British Summer Time)",url:"https://apidocjs.com",version:"1.2.0"}};mt();const Ce=p().compile(h()("#template-header").html()),we=p().compile(h()("#template-footer").html()),X=p().compile(h()("#template-article").html()),ye=p().compile(h()("#template-compare-article").html()),me=p().compile(h()("#template-generator").html()),ge=p().compile(h()("#template-project").html()),ke=p().compile(h()("#template-sections").html()),Ue=p().compile(h()("#template-sidenav").html()),Ge={aloneDisplay:!1,showRequiredLabels:!1,withGenerator:!0,withCompare:!0};de.template=Object.assign(Ge,($e=de.template)!=null?$e:{}),de.template.forceLanguage&&At(de.template.forceLanguage);const qe=(0,i.groupBy)(Me,re=>re.group),et={};h().each(qe,(re,ne)=>{et[re]=(0,i.groupBy)(ne,pe=>pe.name)});const ot=[];h().each(et,(re,ne)=>{let pe=[];h().each(ne,(oe,Ie)=>{const Fe=Ie[0].title;Fe&&pe.push(Fe.toLowerCase()+"#~#"+oe)}),pe.sort(),de.order&&(pe=De(pe,de.order,"#~#")),pe.forEach(oe=>{const Fe=oe.split("#~#")[1];ne[Fe].forEach(Ne=>{ot.push(Ne)})})}),Me=ot;let ht={};const Ht={};let Lt={};Lt[de.version]=1,h().each(Me,(re,ne)=>{ht[ne.group]=1,Ht[ne.group]=ne.groupTitle||ne.group,Lt[ne.version]=1}),ht=Object.keys(ht),ht.sort(),de.order&&(ht=Pe(Ht,de.order)),Lt=Object.keys(Lt),Lt.sort(r().compare),Lt.reverse();const wt=[];ht.forEach(re=>{wt.push({group:re,isHeader:!0,title:Ht[re]});let ne="";Me.forEach(pe=>{pe.group===re&&(ne!==pe.name?wt.push({title:pe.title,group:re,name:pe.name,type:pe.type,version:pe.version,url:pe.url}):wt.push({title:pe.title,group:re,hidden:!0,name:pe.name,type:pe.type,version:pe.version,url:pe.url}),ne=pe.name)})});function fn(re,ne,pe){let oe=!1;if(!ne)return oe;const Ie=ne.match(/<h(1|2).*?>(.+?)<\/h(1|2)>/gi);return Ie&&Ie.forEach(function(Fe){const Ne=Fe.substring(2,3),pt=Fe.replace(/<.+?>/g,""),St=Fe.match(/id="api-([^-]+)(?:-(.+))?"/),Ct=St?St[1]:null,gt=St?St[2]:null;Ne==="1"&&pt&&Ct&&(re.splice(pe,0,{group:Ct,isHeader:!0,title:pt,isFixed:!0}),pe++,oe=!0),Ne==="2"&&pt&&Ct&&gt&&(re.splice(pe,0,{group:Ct,name:gt,isHeader:!1,title:pt,isFixed:!1,version:"1.0"}),pe++)}),oe}let dn;if(de.header&&(dn=fn(wt,de.header.content,0),dn||wt.unshift({group:"_header",isHeader:!0,title:de.header.title==null?bt("General"):de.header.title,isFixed:!0})),de.footer){const re=wt.length;dn=fn(wt,de.footer.content,wt.length),!dn&&de.footer.title!=null&&wt.splice(re,0,{group:"_footer",isHeader:!0,title:de.footer.title,isFixed:!0})}const wn=de.title?de.title:"apiDoc: "+de.name+" - "+de.version;h()(document).attr("title",wn),h()("#loader").remove();const kn={nav:wt};h()("#sidenav").append(Ue(kn)),h()("#generator").append(me(de)),(0,i.extend)(de,{versions:Lt}),h()("#project").append(ge(de)),de.header&&h()("#header").append(Ce(de.header)),de.footer&&(h()("#footer").append(we(de.footer)),de.template.aloneDisplay&&document.getElementById("api-_footer").classList.add("hide"));const Ft={};let Hn="";ht.forEach(function(re){const ne=[];let pe="",oe={},Ie=re,Fe="";Ft[re]={},Me.forEach(function(Ne){re===Ne.group&&(pe!==Ne.name?(Me.forEach(function(pt){re===pt.group&&Ne.name===pt.name&&(Object.prototype.hasOwnProperty.call(Ft[Ne.group],Ne.name)||(Ft[Ne.group][Ne.name]=[]),Ft[Ne.group][Ne.name].push(pt.version))}),oe={article:Ne,versions:Ft[Ne.group][Ne.name]}):oe={article:Ne,hidden:!0,versions:Ft[Ne.group][Ne.name]},de.sampleUrl&&de.sampleUrl===!0&&(de.sampleUrl=window.location.origin),de.url&&oe.article.url.substr(0,4).toLowerCase()!=="http"&&(oe.article.url=de.url+oe.article.url),se(oe,Ne),Ne.groupTitle&&(Ie=Ne.groupTitle),Ne.groupDescription&&(Fe=Ne.groupDescription),ne.push({article:X(oe),group:Ne.group,name:Ne.name,aloneDisplay:de.template.aloneDisplay}),pe=Ne.name)}),oe={group:re,title:Ie,description:Fe,articles:ne,aloneDisplay:de.template.aloneDisplay},Hn+=ke(oe)}),h()("#sections").append(Hn),de.template.aloneDisplay||(document.body.dataset.spy="scroll",h()("body").scrollspy({target:"#scrollingNav"})),h()(".form-control").on("focus change",function(){h()(this).removeClass("border-danger")}),h()(".sidenav").find("a").on("click",function(re){re.preventDefault();const ne=this.getAttribute("href");if(de.template.aloneDisplay){const pe=document.querySelector(".sidenav > li.active");pe&&pe.classList.remove("active"),this.parentNode.classList.add("active")}else{const pe=document.querySelector(ne);pe&&h()("html,body").animate({scrollTop:pe.offsetTop},400)}window.location.hash=ne});function Tt(re){let ne=!1;return h().each(re,pe=>{ne=ne||(0,i.some)(re[pe],oe=>oe.type)}),ne}function Fn(){h()('button[data-toggle="popover"]').popover().click(function(ne){ne.preventDefault()});const re=h()("#version strong").html();if(h()("#sidenav li").removeClass("is-new"),de.template.withCompare&&h()("#sidenav li[data-version='"+re+"']").each(function(){const ne=h()(this).data("group"),pe=h()(this).data("name"),oe=h()("#sidenav li[data-group='"+ne+"'][data-name='"+pe+"']").length,Ie=h()("#sidenav li[data-group='"+ne+"'][data-name='"+pe+"']").index(h()(this));(oe===1||Ie===oe-1)&&h()(this).addClass("is-new")}),h()(".nav-tabs-examples a").click(function(ne){ne.preventDefault(),h()(this).tab("show")}),h()(".nav-tabs-examples").find("a:first").tab("show"),h()(".sample-request-content-type-switch").change(function(){h()(this).val()==="body-form-data"?(h()("#sample-request-body-json-input-"+h()(this).data("id")).hide(),h()("#sample-request-body-form-input-"+h()(this).data("id")).show()):(h()("#sample-request-body-form-input-"+h()(this).data("id")).hide(),h()("#sample-request-body-json-input-"+h()(this).data("id")).show())}),de.template.aloneDisplay&&(h()(".show-group").click(function(){const ne="."+h()(this).attr("data-group")+"-group",pe="."+h()(this).attr("data-group")+"-article";h()(".show-api-group").addClass("hide"),h()(ne).removeClass("hide"),h()(".show-api-article").addClass("hide"),h()(pe).removeClass("hide")}),h()(".show-api").click(function(){const ne=this.getAttribute("href").substring(1),pe=document.getElementById("version").textContent.trim(),oe=`.${this.dataset.name}-article`,Ie=`[id="${ne}-${pe}"]`,Fe=`.${this.dataset.group}-group`;h()(".show-api-group").addClass("hide"),h()(Fe).removeClass("hide"),h()(".show-api-article").addClass("hide");let Ne=h()(oe);h()(Ie).length&&(Ne=h()(Ie).parent()),Ne.removeClass("hide"),ne.match(/_(header|footer)/)&&document.getElementById(ne).classList.remove("hide")})),de.template.aloneDisplay||h()("body").scrollspy("refresh"),de.template.aloneDisplay){const ne=decodeURI(window.location.hash);if(ne!=null&&ne.length!==0){const pe=document.getElementById("version").textContent.trim(),oe=document.querySelector(`li .${ne.slice(1)}-init`),Ie=document.querySelector(`li[data-version="${pe}"] .show-api.${ne.slice(1)}-init`);let Fe=oe;Ie&&(Fe=Ie),Fe.click()}}}function j(re){typeof re=="undefined"?re=h()("#version strong").html():h()("#version strong").html(re),h()("article").addClass("hide"),h()("#sidenav li:not(.nav-fixed)").addClass("hide");const ne={};document.querySelectorAll("article[data-version]").forEach(pe=>{const oe=pe.dataset.group,Ie=pe.dataset.name,Fe=pe.dataset.version,Ne=oe+Ie;!ne[Ne]&&r().lte(Fe,re)&&(ne[Ne]=!0,document.querySelector(`article[data-group="${oe}"][data-name="${Ie}"][data-version="${Fe}"]`).classList.remove("hide"),document.querySelector(`#sidenav li[data-group="${oe}"][data-name="${Ie}"][data-version="${Fe}"]`).classList.remove("hide"),document.querySelector(`#sidenav li.nav-header[data-group="${oe}"]`).classList.remove("hide"))}),h()("article[data-version]").each(function(pe){const oe=h()(this).data("group");h()("section#api-"+oe).removeClass("hide"),h()("section#api-"+oe+" article:visible").length===0?h()("section#api-"+oe).addClass("hide"):h()("section#api-"+oe).removeClass("hide")})}if(j(),h()("#versions li.version a").on("click",function(re){re.preventDefault(),j(h()(this).html())}),h()("#compareAllWithPredecessor").on("click",ee),h()("article .versions li.version a").on("click",Q),h().urlParam=function(re){const ne=new RegExp("[\\?&amp;]"+re+"=([^&amp;#]*)").exec(window.location.href);return ne&&ne[1]?ne[1]:null},h().urlParam("compare")&&h()("#compareAllWithPredecessor").trigger("click"),window.location.hash){const re=decodeURI(window.location.hash);h()(re).length>0&&h()("html,body").animate({scrollTop:parseInt(h()(re).offset().top)},0)}document.querySelector('[data-toggle="offcanvas"]').addEventListener("click",function(){const re=document.querySelector(".row-offcanvas");re&&re.classList.toggle("active")}),h()("#scrollingNav .sidenav-search input.search").focus(),h()('[data-action="filter-search"]').on("keyup",V(re=>{const ne=re.currentTarget.value.toLowerCase();h()(".sidenav a.nav-list-item").filter((pe,oe)=>h()(oe).toggle(h()(oe).text().toLowerCase().indexOf(ne)>-1))},200)),h()("span.search-reset").on("click",function(){h()("#scrollingNav .sidenav-search input.search").val("").focus(),h()(".sidenav").find("a.nav-list-item").show()});function V(re,ne){let pe=null;return(...oe)=>{clearTimeout(pe),pe=setTimeout(re.bind(this,...oe),ne||0)}}function Q(re){re.preventDefault();const ne=h()(this).parents("article"),pe=h()(this).html(),oe=ne.find(".version"),Ie=oe.find("strong").html();oe.find("strong").html(pe);const Fe=ne.data("group"),Ne=ne.data("name"),pt=ne.data("version"),St=ne.data("compare-version");if(St!==pe&&!(!St&&pt===pe)){if(St&&Ft[Fe][Ne][0]===pe||pt===pe)Ee(Fe,Ne,pt);else{let Ct={},gt={};h().each(et[Fe][Ne],function(or,Vn){Vn.version===pt&&(Ct=Vn),Vn.version===pe&&(gt=Vn)});const st={article:Ct,compare:gt,versions:Ft[Fe][Ne]};st.article.id=st.article.group+"-"+st.article.name+"-"+st.article.version,st.article.id=st.article.id.replace(/\./g,"_"),st.compare.id=st.compare.group+"-"+st.compare.name+"-"+st.compare.version,st.compare.id=st.compare.id.replace(/\./g,"_");let nt=Ct;nt.header&&nt.header.fields&&(st._hasTypeInHeaderFields=Tt(nt.header.fields)),nt.parameter&&nt.parameter.fields&&(st._hasTypeInParameterFields=Tt(nt.parameter.fields)),nt.error&&nt.error.fields&&(st._hasTypeInErrorFields=Tt(nt.error.fields)),nt.success&&nt.success.fields&&(st._hasTypeInSuccessFields=Tt(nt.success.fields)),nt.info&&nt.info.fields&&(st._hasTypeInInfoFields=Tt(nt.info.fields)),nt=gt,st._hasTypeInHeaderFields!==!0&&nt.header&&nt.header.fields&&(st._hasTypeInHeaderFields=Tt(nt.header.fields)),st._hasTypeInParameterFields!==!0&&nt.parameter&&nt.parameter.fields&&(st._hasTypeInParameterFields=Tt(nt.parameter.fields)),st._hasTypeInErrorFields!==!0&&nt.error&&nt.error.fields&&(st._hasTypeInErrorFields=Tt(nt.error.fields)),st._hasTypeInSuccessFields!==!0&&nt.success&&nt.success.fields&&(st._hasTypeInSuccessFields=Tt(nt.success.fields)),st._hasTypeInInfoFields!==!0&&nt.info&&nt.info.fields&&(st._hasTypeInInfoFields=Tt(nt.info.fields));const fi=ye(st);ne.after(fi),ne.next().find(".versions li.version a").on("click",Q),h()("#sidenav li[data-group='"+Fe+"'][data-name='"+Ne+"'][data-version='"+Ie+"']").addClass("has-modifications"),ne.remove()}Fn(),g().highlightAll()}}function ee(re){re.preventDefault(),h()("article:visible .versions").each(function(){const pe=h()(this).parents("article").data("version");let oe=null;h()(this).find("li.version a").each(function(){h()(this).html()<pe&&!oe&&(oe=h()(this))}),oe&&oe.trigger("click")})}function se(re,ne){re.id=re.article.group+"-"+re.article.name+"-"+re.article.version,re.id=re.id.replace(/\./g,"_"),ne.header&&ne.header.fields&&(re._hasTypeInHeaderFields=Tt(ne.header.fields)),ne.parameter&&ne.parameter.fields&&(re._hasTypeInParameterFields=Tt(ne.parameter.fields)),ne.error&&ne.error.fields&&(re._hasTypeInErrorFields=Tt(ne.error.fields)),ne.success&&ne.success.fields&&(re._hasTypeInSuccessFields=Tt(ne.success.fields)),ne.info&&ne.info.fields&&(re._hasTypeInInfoFields=Tt(ne.info.fields)),re.template=de.template}function ve(re,ne,pe){let oe={};h().each(et[re][ne],function(Fe,Ne){Ne.version===pe&&(oe=Ne)});const Ie={article:oe,versions:Ft[re][ne]};return se(Ie,oe),X(Ie)}function Ee(re,ne,pe){const oe=h()("article[data-group='"+re+"'][data-name='"+ne+"']:visible"),Ie=ve(re,ne,pe);oe.after(Ie),oe.next().find(".versions li.version a").on("click",Q),h()("#sidenav li[data-group='"+re+"'][data-name='"+ne+"'][data-version='"+pe+"']").removeClass("has-modifications"),oe.remove()}function De(re,ne,pe){const oe=[];return ne.forEach(function(Ie){pe?re.forEach(function(Fe){const Ne=Fe.split(pe);(Ne[0]===Ie||Ne[1]===Ie)&&oe.push(Fe)}):re.forEach(function(Fe){Fe===Ie&&oe.push(Ie)})}),re.forEach(function(Ie){oe.indexOf(Ie)===-1&&oe.push(Ie)}),oe}function Pe(re,ne){const pe=[];return ne.forEach(oe=>{Object.keys(re).forEach(Ie=>{re[Ie].replace(/_/g," ")===oe&&pe.push(Ie)})}),Object.keys(re).forEach(oe=>{pe.indexOf(oe)===-1&&pe.push(oe)}),pe}Fn()}})()})();
