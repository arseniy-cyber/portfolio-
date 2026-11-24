/* Lumo Sites — original glTF materials, scene hierarchy and manufacturer-authored
   fold animation. No mesh-splitting, colour overrides or geometry substitutes.
   WebGL1 shader works in Opera GX and low-end GPUs; static images remain fallback. */
(()=>{'use strict';
const C=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),S=x=>{x=C(x);return x*x*(3-2*x)};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const wraps=[...document.querySelectorAll('[data-gltf-scene]')];if(!wraps.length)return;
const types={phone:{center:[0,.06,0],scale:25.0},macbook:{center:[0,.115,0],scale:19.2},brick:{center:[.56,9.926,.35],scale:.18},airliner:{center:[0,3.5,0],scale:1},orbit:{center:[0,0,0],scale:1.75}};
function parseB64(b64){let arr;if(b64 instanceof ArrayBuffer)arr=new Uint8Array(b64);else{const raw=atob(b64);arr=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);}const v=new DataView(arr.buffer);if(v.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB');const size=v.getUint32(12,true);const json=JSON.parse(new TextDecoder().decode(arr.subarray(20,20+size)));return {json,bytes:arr,binStart:20+size+8};}
function M(){return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);}
function MM(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function INV(a){const out=M(),m=a;const b00=m[0]*m[5]-m[1]*m[4],b01=m[0]*m[6]-m[2]*m[4],b02=m[0]*m[7]-m[3]*m[4],b03=m[1]*m[6]-m[2]*m[5],b04=m[1]*m[7]-m[3]*m[5],b05=m[2]*m[7]-m[3]*m[6],b06=m[8]*m[13]-m[9]*m[12],b07=m[8]*m[14]-m[10]*m[12],b08=m[8]*m[15]-m[11]*m[12],b09=m[9]*m[14]-m[10]*m[13],b10=m[9]*m[15]-m[11]*m[13],b11=m[10]*m[15]-m[11]*m[14];let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(Math.abs(det)<1e-12)return M();det=1/det;
 out[0]=(m[5]*b11-m[6]*b10+m[7]*b09)*det;out[1]=(m[2]*b10-m[1]*b11-m[3]*b09)*det;out[2]=(m[13]*b05-m[14]*b04+m[15]*b03)*det;out[3]=(m[10]*b04-m[9]*b05-m[11]*b03)*det;
 out[4]=(m[6]*b08-m[4]*b11-m[7]*b07)*det;out[5]=(m[0]*b11-m[2]*b08+m[3]*b07)*det;out[6]=(m[14]*b02-m[12]*b05-m[15]*b01)*det;out[7]=(m[8]*b05-m[10]*b02+m[11]*b01)*det;
 out[8]=(m[4]*b10-m[5]*b08+m[7]*b06)*det;out[9]=(m[1]*b08-m[0]*b10-m[3]*b06)*det;out[10]=(m[12]*b04-m[13]*b02+m[15]*b00)*det;out[11]=(m[9]*b02-m[8]*b04-m[11]*b00)*det;
 out[12]=(m[5]*b07-m[4]*b09-m[6]*b06)*det;out[13]=(m[0]*b09-m[1]*b07+m[2]*b06)*det;out[14]=(m[13]*b01-m[12]*b03-m[14]*b00)*det;out[15]=(m[8]*b03-m[9]*b01+m[10]*b00)*det;return out;}
function quatMatrix(q){let[x,y,z,w]=q;const a=M(),x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
 a[0]=1-(yy+zz);a[1]=xy+wz;a[2]=xz-wy;a[4]=xy-wz;a[5]=1-(xx+zz);a[6]=yz+wx;a[8]=xz+wy;a[9]=yz-wx;a[10]=1-(xx+yy);return a;}
function TRS(t=[0,0,0],q=[0,0,0,1],s=[1,1,1]){const a=quatMatrix(q);for(let c=0;c<3;c++)for(let r=0;r<3;r++)a[c*4+r]*=s[c];a[12]=t[0];a[13]=t[1];a[14]=t[2];return a;}
function move(x,y,z){const a=M();a[12]=x;a[13]=y;a[14]=z;return a;}
function scale(s){const a=M();a[0]=a[5]=a[10]=s;return a;}
function rotateX(a){return quatMatrix([Math.sin(a/2),0,0,Math.cos(a/2)]);}function rotateY(a){return quatMatrix([0,Math.sin(a/2),0,Math.cos(a/2)]);}function rotateZ(a){return quatMatrix([0,0,Math.sin(a/2),Math.cos(a/2)]);}
function perspective(aspect,n=.1,zoom=1){const f=zoom/Math.tan(43*Math.PI/360),far=180;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0]);}
function slerp(q,r,t){let cos=q.reduce((sum,c,i)=>sum+c*r[i],0),b=[...r];if(cos<0){cos=-cos;b=b.map(v=>-v);}if(cos>.9995){const a=q.map((v,i)=>v+(b[i]-v)*t);const d=Math.hypot(...a);return a.map(x=>x/d);}const a=Math.acos(C(cos,-1,1)),s=Math.sin(a);return q.map((v,i)=>v*Math.sin((1-t)*a)/s+b[i]*Math.sin(t*a)/s);}
function shader(gl,kind,src){const sh=gl.createShader(kind);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
function prog(gl){const vs=`precision highp float;
attribute vec3 aPosition,aNormal;attribute vec2 aUV;attribute vec4 aColor,aJoint,aWeight;
uniform mat4 uProject,uPlacement,uNode,uBones[4];uniform float uHasSkin;
varying vec2 vUV;varying vec3 vNormal,vViewPos;varying vec4 vColor;
void main(){vec4 v=vec4(aPosition,1.);vec3 n=aNormal;
if(uHasSkin>.5){mat4 skin=aWeight.x*uBones[int(aJoint.x)]+aWeight.y*uBones[int(aJoint.y)]+aWeight.z*uBones[int(aJoint.z)]+aWeight.w*uBones[int(aJoint.w)];v=skin*v;n=mat3(skin)*n;}
vec4 w=uPlacement*uNode*v;vViewPos=w.xyz;vNormal=mat3(uPlacement*uNode)*n;vUV=aUV;vColor=aColor;gl_Position=uProject*w;}`;
const fs=`precision mediump float;varying vec2 vUV;varying vec3 vNormal,vViewPos;varying vec4 vColor;
uniform sampler2D uTexture;uniform vec4 uColor;uniform vec3 uTint;uniform float uScreen,uOpaque;uniform float uUseTexture,uMetallic,uRoughness,uOpacity;
void main(){vec4 tex=mix(vec4(1.),texture2D(uTexture,vUV),uUseTexture);vec4 base=tex*uColor*vColor; base.rgb*=uTint;
if(uOpaque>.5)base.a=1.;if(base.a<.075)discard;vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-.45,.75,.7));vec3 l2=normalize(vec3(.83,-.08,.6));vec3 v=normalize(-vViewPos);float d=max(dot(n,l),0.),d2=max(dot(n,l2),0.);
float expn=mix(70.,9.,uRoughness);float spec=pow(max(dot(n,normalize(l+v)),0.),expn)*(.15+.42*uMetallic);
float rim=pow(1.-abs(dot(n,v)),2.4);vec3 col=base.rgb*(.86+.47*d+.16*d2)+vec3(.92,.96,.97)*spec+base.rgb*rim*.10;col=mix(col,base.rgb*1.06,uScreen);
gl_FragColor=vec4(col,base.a*uOpacity);}`;
const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
function loadGlb(gl,b64,kind){const {json:g,bytes,binStart}=parseB64(b64),v=new DataView(bytes.buffer);const ncomp={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};const component={5120:['getInt8',1],5121:['getUint8',1],5122:['getInt16',2],5123:['getUint16',2],5125:['getUint32',4],5126:['getFloat32',4]};const cache={};
function access(id){if(cache[id])return cache[id];const a=g.accessors[id],view=g.bufferViews[a.bufferView],comps=ncomp[a.type],ct=a.componentType,read=component[ct],off=binStart+(view.byteOffset||0)+(a.byteOffset||0),stride=view.byteStride||comps*read[1];const out=new Float32Array(a.count*comps);for(let i=0;i<a.count;i++)for(let j=0;j<comps;j++){let x=v[read[0]](off+i*stride+j*read[1],true);if(a.normalized){if(ct===5121)x/=255;else if(ct===5123)x/=65535;else if(ct===5120)x=Math.max(-1,x/127);else if(ct===5122)x=Math.max(-1,x/32767);}out[i*comps+j]=x;}return cache[id]=out;}
const locs={},p=prog(gl);for(const a of ['aPosition','aNormal','aUV','aColor','aJoint','aWeight'])locs[a]=gl.getAttribLocation(p,a);for(const u of ['uProject','uPlacement','uNode','uBones','uHasSkin','uTexture','uColor','uTint','uScreen','uUseTexture','uMetallic','uRoughness','uOpacity','uOpaque'])locs[u]=gl.getUniformLocation(p,u==='uBones'?'uBones[0]':u);
const ext=gl.getExtension('OES_element_index_uint');const meshes=[];
function arrayBuffer(arr){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);return b;}
for(const mesh of g.meshes){const parts=[];for(const primitive of mesh.primitives){const count=g.accessors[primitive.attributes.POSITION].count;const attrs={};for(const [key,attrName,n,def] of [['POSITION','aPosition',3,[0,0,0]],['NORMAL','aNormal',3,[0,0,1]],['TEXCOORD_0','aUV',2,[0,0]],['COLOR_0','aColor',4,[1,1,1,1]],['JOINTS_0','aJoint',4,[0,0,0,0]],['WEIGHTS_0','aWeight',4,[1,0,0,0]]]){let a;if(primitive.attributes[key]!==undefined){a=access(primitive.attributes[key]);if(key==='COLOR_0'&&a.length===count*3){const b=new Float32Array(count*4);for(let i=0;i<count;i++){b.set(a.subarray(3*i,3*i+3),4*i);b[4*i+3]=1;}a=b;}}else{a=new Float32Array(count*n);for(let i=0;i<count;i++)a.set(def,i*n);}if(key==='COLOR_0'&&a.length===count*4){for(let vi=0;vi<count;vi++)a[vi*4+3]=1;}attrs[attrName]={buffer:arrayBuffer(a),n};}
let raw=primitive.indices===undefined?Array.from({length:count},(_,i)=>i):access(primitive.indices);let type=gl.UNSIGNED_SHORT,idx=Uint16Array.from(raw);
let maxIndex=0;for(const value of raw)if(value>maxIndex)maxIndex=value;
if(maxIndex>65535){if(!ext)throw Error('32-bit indices require OES_element_index_uint');idx=Uint32Array.from(raw);type=gl.UNSIGNED_INT;}
const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
parts.push({attrs,index:ib,count:idx.length,type,mat:primitive.material||0,mode:primitive.mode||4});}meshes.push(parts);}
// glTF image buffers are embedded in the source asset, so no network and no CORS.
const filterExt=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
function tuneTexture(w,h){if((w&(w-1))===0&&(h&(h-1))===0){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}if(filterExt){const cap=gl.getParameter(filterExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)||1;gl.texParameterf(gl.TEXTURE_2D,filterExt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,cap));}}
const imgs=g.images||[];const imagesCaptured=[];const imagePromises=imgs.map(async (img,imgIndex)=>{const view=g.bufferViews[img.bufferView];const offset=binStart+(view.byteOffset||0),raw=bytes.slice(offset,offset+view.byteLength);const blob=new Blob([raw],{type:img.mimeType||'image/png'}),url=URL.createObjectURL(blob);try{const el=new Image();await new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;el.src=url});imagesCaptured[imgIndex]=el;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,el);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);tuneTexture(el.naturalWidth,el.naturalHeight);return t;}finally{URL.revokeObjectURL(url);}});
const brickVariants=[];const fallbackTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,fallbackTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
// Flat alpha decals are rendered with the *same model/world transform* as the
// actual scanned brick, in centimetres above the broad face. They are not cards.
const decalWords=['Обсуждение','Договорённость','Дизайн','Разработка','Проверка','Публикация'];
const decals=[];
if(kind==='brick'){
 for(const word of decalWords){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const cx=c.getContext('2d');
  cx.clearRect(0,0,1024,256);cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='rgba(42,27,19,.89)';
  let font=145;do{cx.font=`800 ${font}px Georgia,system-ui,Arial`;if(cx.measureText(word).width<910)break;font-=5;}while(font>50);
  cx.fillText(word,512,137);
  cx.globalCompositeOperation='destination-out';for(let i=0;i<1300;i++){const x=(i*197+17)%1009,y=(i*331+83)%254;cx.fillRect(x,y,(i%5===0?3:1),(i%7===0?3:1));}
  cx.globalCompositeOperation='source-over';const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  decals.push(tex);
 }
}
const decalQuad=(kind==='brick')?(()=>{
 const v=kind==='brick'?[3.54,1.8,-1.95, 3.54,18.1,-1.95, 3.54,18.1,2.55, 3.54,1.8,2.55]:[-.1508,.0063,-.1087, .1508,.0063,-.1087, .1508,.2137,-.1087, -.1508,.2137,-.1087];
 const attrib={aPosition:[v,3],aNormal:[Array(4).fill([0,0,1]).flat(),3],aUV:[[0,1,1,1,1,0,0,0],2],aColor:[Array(4).fill([1,1,1,1]).flat(),4],aJoint:[Array(16).fill(0),4],aWeight:[Array(4).fill([1,0,0,0]).flat(),4]};
 const attrs={};for(const [key,[array,n]] of Object.entries(attrib))attrs[key]={buffer:arrayBuffer(new Float32Array(array)),n};
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
 return {attrs,index:ib,count:6,type:gl.UNSIGNED_SHORT};
})():null;
// MacBook LCD is overridden with a sharper external screen texture for better fit and readability.
const screenTex=null;const screenPromise=Promise.resolve();
const phoneTex={};
const phoneTexPromise=kind==='phone'?Promise.all(['outer','inner'].map(which=>new Promise((resolve,reject)=>{
 const im=new Image();im.onload=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);tuneTexture(im.naturalWidth,im.naturalHeight);phoneTex[which]=t;resolve();};
 im.onerror=reject;im.src=window.LUMO_PHONE_SCREEN_IMAGES[which];
}))):Promise.resolve();
const nodes=g.nodes.map(node=>({name:node.name,mesh:node.mesh,skin:node.skin,children:node.children||[],baseT:node.translation||[0,0,0],baseQ:node.rotation||[0,0,0,1],baseS:node.scale||[1,1,1],baseM:node.matrix||null}));
const roots=g.scenes[g.scene||0].nodes;const parents={};nodes.forEach((n,i)=>n.children.forEach(j=>parents[j]=i));
const animations=(g.animations||[]).flatMap(a=>a.channels.map(ch=>{const sam=a.samplers[ch.sampler];return {node:ch.target.node,path:ch.target.path,times:access(sam.input),vals:access(sam.output),width:ncomp[g.accessors[sam.output].type],interp:sam.interpolation||'LINEAR'};}));
const skinData=(g.skins||[]).map(s=>({joints:s.joints,ibms:Array.from({length:s.joints.length},(_,i)=>access(s.inverseBindMatrices).slice(i*16,(i+1)*16))}));
const world=nodes.map(M);const textureRef=(g.textures||[]).map(x=>x.source);
function frame(time){const tx=nodes.map(n=>[...n.baseT]),rot=nodes.map(n=>[...n.baseQ]),sca=nodes.map(n=>[...n.baseS]);for(const a of animations){const times=a.times,amount=a.width;let k=0;while(k<times.length-2 && time>times[k+1])k++;const fr=C((time-times[k])/Math.max(.000001,times[k+1]-times[k]));const x=Array.from(a.vals.slice(k*amount,k*amount+amount)),y=Array.from(a.vals.slice((k+1)*amount,(k+2)*amount));const value=a.path==='rotation'?slerp(x,y,fr):x.map((p,i)=>p+(y[i]-p)*fr);if(a.path==='translation')tx[a.node]=value;if(a.path==='rotation')rot[a.node]=value;if(a.path==='scale')sca[a.node]=value;}
function walk(id,p){const n=nodes[id],animated=animations.some(a=>a.node===id),local=n.baseM&&!animated?new Float32Array(n.baseM):TRS(tx[id],rot[id],sca[id]);world[id]=MM(p,local);n.children.forEach(c=>walk(c,world[id]));}roots.forEach(root=>walk(root,M()));}
function render(place,proj,time,fade=1,tint=0){frame(time);gl.useProgram(p);gl.uniformMatrix4fv(locs.uProject,false,proj);gl.uniformMatrix4fv(locs.uPlacement,false,place);gl.uniform1i(locs.uTexture,0);gl.uniform1f(locs.uOpacity,kind==='brick'?1:fade);gl.uniform1f(locs.uOpaque,(kind==='brick'||kind==='phone'||kind==='airliner')?1:0);
 const palettes=[[1,1,1],[.92,.91,.90],[1.05,1.035,1.02],[.97,.96,.94],[.91,.89,.87],[1.025,1.015,1],[.945,.935,.925]];
 gl.uniform3fv(locs.uTint,new Float32Array(palettes[tint]||palettes[0]));gl.uniform1f(locs.uScreen,0);
for(let pass=0;pass<(kind==='phone'?2:1);pass++){if(kind==='phone'){if(pass===0){gl.disable(gl.BLEND);gl.depthMask(true)}else{gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ONE);gl.depthMask(false)}}for(let i=0;i<nodes.length;i++){const node=nodes[i];if(node.mesh===undefined)continue;gl.uniformMatrix4fv(locs.uNode,false,world[i]);
if(node.skin!==undefined){const s=skinData[node.skin],inv=INV(world[i]),flat=new Float32Array(64);for(let j=0;j<4;j++){const jm=j<s.joints.length?MM(MM(inv,world[s.joints[j]]),s.ibms[j]):M();flat.set(jm,j*16);}gl.uniformMatrix4fv(locs.uBones,false,flat);gl.uniform1f(locs.uHasSkin,1);}else{gl.uniform1f(locs.uHasSkin,0);}
for(const prim of meshes[node.mesh]){const mat=g.materials?.[prim.mat]||{},pbr=mat.pbrMetallicRoughness||{},col=pbr.baseColorFactor||[1,1,1,1];if(!mat.alphaMode || mat.alphaMode==='OPAQUE'){col[3]=1;}const matName=mat.name||'';if(kind==='phone'){const overlay=mat.alphaMode==='BLEND';if(overlay!==(pass===1))continue;gl.uniform1f(locs.uOpaque,overlay?0:1);}const phoneSide=kind==='phone'?(matName==='C_SW_Screen_Outer'?'outer':matName==='C_StarWhite_Screen_Inner'?'inner':null):null;
 gl.uniform4fv(locs.uColor,new Float32Array(phoneSide?[1,1,1,1]:kind==='orbit'?[.39,.19,.21,1]:col));gl.uniform1f(locs.uScreen,phoneSide?1:(matName==='Lumo_Integrated_LCD'?1:(kind==='phone'&&matName==='C_SW_Apple'?.35:0)));gl.uniform1f(locs.uMetallic,kind==='orbit'?.62:pbr.metallicFactor??0);gl.uniform1f(locs.uRoughness,kind==='orbit'?.34:pbr.roughnessFactor??.62);
const textId=pbr.baseColorTexture?.index;const imgId=textId!==undefined?textureRef[textId]:undefined;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,phoneSide?phoneTex[phoneSide]:((kind==='brick'&&tint>0&&imgId===0&&brickVariants[tint-1]?brickVariants[tint-1]:(imgId===undefined?fallbackTex:loadedImages[imgId]||fallbackTex))));gl.uniform1f(locs.uUseTexture,(kind!=='orbit'&&(phoneSide||imgId!==undefined||matName==='Lumo_Integrated_LCD'))?1:0);
for(const [attribute,o] of Object.entries(prim.attrs)){const loc=locs[attribute];if(loc<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,o.buffer);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,o.n,gl.FLOAT,false,0,0);}
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,prim.index);gl.drawElements(gl.TRIANGLES,prim.count,prim.type,0);
}}}if(kind==='phone'){gl.depthMask(true);gl.disable(gl.BLEND)} }
function renderDecal(place,proj,wordIndex,opacity=1){
 if(!decalQuad)return;
 gl.useProgram(p);gl.uniformMatrix4fv(locs.uProject,false,proj);gl.uniformMatrix4fv(locs.uPlacement,false,place);gl.uniformMatrix4fv(locs.uNode,false,M());
 gl.uniform1f(locs.uHasSkin,0);gl.uniform4fv(locs.uColor,new Float32Array([1,1,1,1]));gl.uniform1f(locs.uMetallic,0);gl.uniform1f(locs.uRoughness,1);gl.uniform1f(locs.uOpacity,opacity);gl.uniform1f(locs.uOpaque,0);gl.uniform3fv(locs.uTint,new Float32Array([1,1,1]));gl.uniform1f(locs.uScreen,kind==='macbook'?1:0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,kind==='macbook'?screenTex:decals[wordIndex]);gl.uniform1i(locs.uTexture,0);gl.uniform1f(locs.uUseTexture,1);
 gl.disable(gl.CULL_FACE);gl.depthMask(false);if(kind==='macbook')gl.disable(gl.DEPTH_TEST);else gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 for(const [attribute,o] of Object.entries(decalQuad.attrs)){const loc=locs[attribute];if(loc<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,o.buffer);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,o.n,gl.FLOAT,false,0,0);}
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,decalQuad.index);gl.drawElements(gl.TRIANGLES,decalQuad.count,decalQuad.type,0);
 gl.depthMask(true);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);
}
let loadedImages=[];return {render,renderDecal,ready:Promise.all([...imagePromises,screenPromise,phoneTexPromise]).then(images=>{loadedImages=images.slice(0,imagePromises.length);
if(kind==='brick'&&imagesCaptured[0]){
 const im=imagesCaptured[0],w=Math.min(1024,im.naturalWidth),h=Math.min(1024,im.naturalHeight);
 for(let variant=0;variant<6;variant++){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);
  // Every brick retains its original photo-scan but gets its own abrasion map.
  let seed=variant*829+191;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  x.globalCompositeOperation='multiply';x.fillStyle=['rgba(210,166,128,.11)','rgba(170,113,95,.12)','rgba(233,199,149,.11)','rgba(143,99,81,.10)','rgba(227,175,145,.11)','rgba(184,126,94,.12)'][variant];x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over';
  for(let i=0;i<4100;i++){const px=random()*w,py=random()*h,r=.4+random()*2.5;x.fillStyle=random()>.55?'rgba(56,41,29,.20)':'rgba(248,224,187,.23)';x.fillRect(px,py,r*(1+random()*4),r*.56);}
  for(let i=0;i<145;i++){const px=random()*w,py=random()*h;x.strokeStyle=random()>.45?'rgba(39,27,20,.27)':'rgba(240,222,180,.19)';x.lineWidth=1+random()*1.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+(random()-.5)*70,py+(random()-.5)*18);x.stroke();}
  // Sparse uneven abrasions and broad chalky scuffs; never alter alpha channel.
  for(let j=0;j<38;j++){const xx=random()*w,yy=random()*h,rx=3+random()*21,ry=1+random()*6;
   x.save();x.translate(xx,yy);x.rotate((random()-.5)*1.4);x.globalAlpha=.12+random()*.17;
   x.fillStyle=random()>.42?'#e5c9ad':'#382822';x.beginPath();x.ellipse(0,0,rx,ry,0,0,Math.PI*2);x.fill();x.restore();}
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);brickVariants.push(tex);
 }
}
}),count:meshes.reduce((n,m)=>n+m.length,0),animations:animations.length,hasSkin:!!skinData.length};}
const monitors=[];function start(wrap){const canvas=wrap.querySelector('canvas'),kind=wrap.dataset.gltfScene;let gl;
try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,preserveDrawingBuffer:kind==='orbit',powerPreference:'high-performance'})||canvas.getContext('experimental-webgl',{alpha:true,antialias:true,depth:true,preserveDrawingBuffer:kind==='orbit'});if(!gl)throw Error('WebGL unavailable');gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);if(kind==='airliner')gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);const item={kind,wrap,canvas,gl,ready:false,visible:false,geometry:null,error:null};monitors.push(item);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();item.ready=false;wrap.classList.remove('has-webgl');wrap.dataset.glError='context lost';});item.geometry=loadGlb(gl,window.LUMO_ORIGINAL_GLB[kind],kind);item.geometry.ready.then(()=>{item.ready=true;if(kind!=='phone')wrap.classList.add('has-webgl');if(kind==='airliner'){const fallback=wrap.querySelector('.plane-fallback');if(fallback)fallback.style.opacity='0';}document.dispatchEvent(new CustomEvent('lumo-scene-ready',{detail:{kind,ok:true}}));requestFrame();}).catch(err=>{item.error=err.message;document.dispatchEvent(new CustomEvent('lumo-scene-ready',{detail:{kind,ok:false}}));console.warn(kind,err)});}
catch(err){wrap.dataset.glError=err.message;console.warn('3D unavailable:',kind,err.message);}
}
wraps.forEach(start);
const ob=new IntersectionObserver(entries=>{for(const e of entries){const item=monitors.find(t=>t.wrap===e.target);if(item)item.visible=e.isIntersecting;}requestFrame();},{rootMargin:'350px'});monitors.forEach(item=>ob.observe(item.wrap));
let raf=0,mouseX=0,mouseY=0,dragYaw=0,dragPitch=0,dragging=false,macDragYaw=0,macDragPitch=0,macVisibleYaw=0,macVelocity=0,macHeld=false;
const phoneCanvas=document.querySelector('[data-gltf-scene=phone] canvas');
if(phoneCanvas){let lastX=0,lastY=0;phoneCanvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;phoneCanvas.setPointerCapture(e.pointerId);phoneCanvas.classList.add('is-dragging');});phoneCanvas.addEventListener('pointermove',e=>{if(!dragging)return;dragYaw+=((e.clientX-lastX)/Math.max(200,phoneCanvas.clientWidth))*3.2;dragPitch=Math.max(-.56,Math.min(.56,dragPitch+(e.clientY-lastY)/Math.max(220,phoneCanvas.clientHeight)*1.02));lastX=e.clientX;lastY=e.clientY;requestFrame();});const end=()=>{dragging=false;phoneCanvas.classList.remove('is-dragging');};phoneCanvas.addEventListener('pointerup',end);phoneCanvas.addEventListener('pointercancel',end);phoneCanvas.addEventListener('lostpointercapture',end);}
// Drag MacBook model directly; vertical gestures on touch remain native page scroll.
// V10.17: unlimited 360-degree MacBook rotation, smooth inertia and native vertical touch scrolling.
// Horizontal drag is deliberately distinguished from a vertical page swipe.
const macCanvas=document.querySelector('[data-gltf-scene=macbook] canvas');
if(macCanvas){let pointerId=null,startX=0,startY=0,prevX=0,prevT=0,mode='pending';
 const finish=e=>{if(pointerId!==null&&e&&e.pointerId!==pointerId)return;
  if(mode==='rotate'){
   try{if(macCanvas.hasPointerCapture(pointerId))macCanvas.releasePointerCapture(pointerId)}catch(_){}
  }
  macHeld=false;pointerId=null;mode='pending';macCanvas.classList.remove('is-dragging');requestFrame();
 };
 macCanvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;
  pointerId=e.pointerId;startX=prevX=e.clientX;startY=e.clientY;prevT=performance.now();mode=e.pointerType==='touch'?'pending':'rotate';macVelocity=0;macHeld=true;
  if(mode==='rotate'){try{macCanvas.setPointerCapture(e.pointerId)}catch(_){};macCanvas.classList.add('is-dragging')}
 });
 macCanvas.addEventListener('pointermove',e=>{if(pointerId!==e.pointerId||!macHeld)return;
  const dx=e.clientX-prevX,dy=e.clientY-startY;
  if(mode==='pending'){
   if(Math.hypot(e.clientX-startX,dy)<9)return;
   if(Math.abs(dy)>Math.abs(e.clientX-startX)*1.12){finish(e);return;}
   mode='rotate';try{macCanvas.setPointerCapture(e.pointerId)}catch(_){};macCanvas.classList.add('is-dragging');
  }
  const dt=Math.max(9,performance.now()-prevT);
  const delta=dx/Math.max(175,macCanvas.clientWidth)*Math.PI*2.35;
  macDragYaw+=delta;macVelocity=Math.max(-.075,Math.min(.075,delta*(16/dt)));
  if(e.pointerType==='mouse')macDragPitch=Math.max(-.32,Math.min(.32,macDragPitch+(e.clientY-startY)/Math.max(300,macCanvas.clientHeight)*.012));
  prevX=e.clientX;prevT=performance.now();requestFrame();
 },{passive:true});
 macCanvas.addEventListener('pointerup',finish);macCanvas.addEventListener('pointercancel',finish);macCanvas.addEventListener('lostpointercapture',finish);
}
addEventListener('pointermove',e=>{mouseX=(e.clientX/innerWidth-.5)*2;mouseY=(e.clientY/innerHeight-.5)*2;requestFrame();},{passive:true});addEventListener('scroll',requestFrame,{passive:true});addEventListener('resize',requestFrame,{passive:true});document.addEventListener('lumo-cinema-update',requestFrame);
function requestFrame(){if(!raf)raf=requestAnimationFrame(draw);}
function draw(t){raf=0;let activity=false;
 if(!macHeld&&Math.abs(macVelocity)>.00014){macDragYaw+=macVelocity;macVelocity*=.935;activity=true;}
 const yawGap=macDragYaw-macVisibleYaw;macVisibleYaw+=yawGap*(reduce?1:.14);
 if(Math.abs(yawGap)>.0005)activity=true;
 for(const item of monitors){if(!item.ready||!item.visible||document.hidden||(item.wrap.closest('.scene')&&!item.wrap.closest('.scene').classList.contains('is-active')))continue;const {canvas,gl,kind,wrap,geometry}=item;const r=wrap.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);let dpr=Math.min(matchMedia('(max-width:760px)').matches?1.5:1.65,devicePixelRatio||1);if((navigator.hardwareConcurrency||8)<=4)dpr=Math.min(dpr,1.1);const budget=kind==='brick'?1900000:kind==='phone'?1700000:kind==='airliner'?1500000:1650000;dpr=Math.max(1,Math.min(dpr,Math.sqrt(budget/(w*h))));if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const scene=wrap.closest('.chapter')||document.querySelector('#lx-experience')||wrap;const sr=scene.getBoundingClientRect();const span=Math.max(1,sr.height-innerHeight);let progress=C(-sr.top/span);if(kind==='phone'&&Number.isFinite(window.LUMO_CINEMA_PROGRESS))progress=C((window.LUMO_CINEMA_PROGRESS-.575)/.072);if(kind==='airliner'&&Number.isFinite(window.LUMO_CINEMA_PROGRESS))progress=C((window.LUMO_CINEMA_PROGRESS-.696)/.15);if(kind==='orbit'&&Number.isFinite(window.LUMO_CINEMA_PROGRESS))progress=C((window.LUMO_CINEMA_PROGRESS-.850)/.082);
 if(kind==='brick'||kind==='phone'||kind==='macbook'){
   if(item.smoothedProgress===undefined)item.smoothedProgress=progress;
   const delta=progress-item.smoothedProgress;item.smoothedProgress+=delta*(reduce?1:(kind==='phone'?.095:kind==='macbook'?.13:.155));
   if(Math.abs(delta)>.0009)activity=true;else item.smoothedProgress=progress;progress=item.smoothedProgress;
 }
 const smooth=S(progress);const model=types[kind];
let yaw=.38+progress*.52+mouseX*.065, pitch=-.10+mouseY*.035, x=0, y=-.07,z=-8.4;
if(kind==='phone'){const narrow=matchMedia('(max-width:700px)').matches;yaw=(narrow?2.94:2.58)+progress*(narrow?.19:.8)+mouseX*.05+dragYaw;pitch=(narrow?-.035:-.09)+dragPitch;x=0;y=.02;z=narrow?-6.15:-7.15;}
if(kind==='macbook'){yaw=.025+progress*.12+mouseX*.018+macVisibleYaw;pitch=-.025+progress*.02+macDragPitch;const aspect=Math.max(.68,w/Math.max(1,h));z=-Math.max(10.8,2.8+3.75/(.39*aspect));y=-.025;}
if(kind==='brick'){yaw=.18+progress*.16;pitch=.14;y=0;z=-8.1;}
if(kind==='orbit'){yaw=.46+progress*Math.PI*2;pitch=-.12+Math.sin(progress*Math.PI*2)*.15;x=0;y=0;z=-8.3;model.scale=1.85;}
if(kind==='airliner'){const p=window.LUMO_CINEMA_PROGRESS||0; const a=S((p-.692)/.125),center=S((p-.660)/.116),distance=106*Math.pow(18.64/106,a); yaw=1.34*(1-S((p-.680)/.113));pitch=.11*(1-center); const aspect=w/h/Math.max(1,w/h/2.25); const narrow=matchMedia('(max-width:700px), (pointer:coarse) and (max-height:600px)').matches;const halfWidth=distance*Math.tan(43*Math.PI/360)*aspect;
// 32 world units safely contain the aircraft's rotated bounding sphere.
// Translate the entire model outside the frustum before the first visible frame.
x=-(narrow?((distance+32)*Math.tan(43*Math.PI/360)*aspect+32):1.30*halfWidth)*(1-center); y=-2.6*(1-center); z=-distance;model.scale=1;}
let base=MM(move(x,y,z),MM(rotateZ(kind==='airliner'?.20*(1-S(((window.LUMO_CINEMA_PROGRESS||0)-.660)/.135)):0),MM(rotateY(yaw),MM(rotateX(pitch),MM(scale(model.scale),move(-model.center[0],-model.center[1],-model.center[2]))))));
if(kind==='airliner'){
 const matrix=MM(perspective(w/h,.025,Math.max(1,w/h/2.25)),base);
 const project=(px,py,pz)=>{
  const point=[px,py,pz,1],screen=[0,0,0,0];
  for(let row=0;row<4;row++)for(let col=0;col<4;col++)screen[row]+=matrix[col*4+row]*point[col];
  const denom=screen[3]||1;
  return {x:.5+.5*screen[0]/denom,y:.5-.5*screen[1]/denom};
 };
 window.LUMO_AIRLINER_ENGINE_POINTS=[-5.9,5.9].map(x=>{const a=project(x,1.66,.05),b=project(x,1.66,-7);return {...a,tailX:b.x,tailY:b.y}});
 window.LUMO_UPDATE_TRAILS?.(window.LUMO_AIRLINER_ENGINE_POINTS);
}
if(kind==='brick'){
 // Six actual photo-scanned glTF bricks compose an asymmetric ascending sculpture.
 // A single smoothed timeline, not six abrupt wall-cell pop-ins.
 const labels=wrap.querySelectorAll('.real-brick__label');const wall=wrap.querySelector('.real-brick__labels');
 const resting=[[-1.52,-1.04,-.015,-.006],[0,-1.03,0,.008],[1.52,-1.05,.015,-.009],[-.765,-.255,.012,.004],[.765,-.25,-.018,-.007],[0,.54,0,.005]];
 for(let i=0;i<6;i++){
   const begin=.03+i*.067;
   const arrive=S((progress-begin)/.49);
   if(arrive<=.0001){if(labels[i])labels[i].style.opacity='0';continue;}
   const [tx,ty,tz,angle]=resting[i];
   const lift=1-arrive;
   const settle=Math.sin(Math.min(1,Math.max(0,(progress-begin)/.49))*Math.PI*2.7)*Math.exp(-8*Math.max(0,(progress-begin)/.49));const wobble=(i>=3?Math.sin(progress*10+i*.7)*.026:0)*S((progress-.70)/.20)*(1-S((progress-.90)/.10));const shiftx=tx+lift*(i%2?1.15:-1.15)+wobble,shifty=ty+lift*(i%3===0?1.16:-1.04)+settle*.08;
   const depth=z+tz+lift*.75;
   const tilt=angle+lift*(i%2?-.06:.06)+wobble*.85;
   const motionImpulse=C((progress-(item.previousProgress??progress))*8,-.045,.045);const sway=arrive*(Math.sin(progress*5.3+i*.42)*.017+motionImpulse*(i>=3?1.10:.45))*Math.sin(Math.PI*S((progress-.12)/.88));const orient=MM(rotateZ(sway*(i>=3?1.3:.36)),MM(rotateY(tilt),quatMatrix([-.5,-.5,-.5,.5])));
   const placement=MM(move(shiftx,shifty,depth),MM(rotateY(yaw),MM(rotateX(pitch),MM(scale(model.scale*.47),MM(orient,move(-model.center[0],-model.center[1],-model.center[2]))))));
   geometry.render(placement,perspective(w/h),0,1,i+1);geometry.renderDecal(placement,perspective(w/h),i,1);
   if(labels[i]){labels[i].style.left=(C(.5+shiftx/7.6)*100)+'%';labels[i].style.top=(C(.5-shifty/6.5)*100)+'%';labels[i].style.opacity=String(arrive);}
 }
 if(wall)wall.style.opacity='1';item.previousProgress=progress;
}else{
 // Use the exact 'open-close' glTF animation, including skinned display and connected hinge.
 const time=kind==='phone'?(window.LUMO_CINEMA_PROGRESS>=.653?0:2*(1-S(smooth))):0;
 if(kind==='phone')window.LUMO_PHONE_POSE={animationTime:time,opening:1-time/2};
 if(kind==='phone'||kind==='airliner')gl.disable(gl.BLEND);
 geometry.render(base,kind==='airliner'?perspective(w/h,.025,Math.max(1,w/h/2.25)):perspective(w/h),time,1);
 if(kind==='phone'&&!wrap.classList.contains('has-webgl'))wrap.classList.add('has-webgl');
}
/* On-demand frames: stop drawing the unchanged three 3D scenes when the page is idle. */
}
if(activity)raf=requestAnimationFrame(draw);
}
window.LUMO_3D_DEBUG=()=>monitors.map(x=>({scene:x.kind,ready:x.ready,visible:x.visible,error:x.error,primitives:x.geometry?.count,animationChannels:x.geometry?.animations,skinned:x.geometry?.hasSkin}));
})();
