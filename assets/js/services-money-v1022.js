/* Lumo Sites V10.22 — true GLB money mesh and isolated 2-sided service cards.
 * Model: "stacks of money" by hmzabanna, CC BY 4.0.
 * https://sketchfab.com/3d-models/stacks-of-money-3c9de90c6dc94b989b27d8de2341f1ac
 * The source GLB and author credit are preserved in assets/models/.
 * No external libraries, no network dependencies beyond the local .glb asset. */
(() => {
 'use strict';
 const cards=[...document.querySelectorAll('.price-page-v1022 .price-card')];
 if(!cards.length)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const canvases=cards.map(c=>c.querySelector('.money-stage__canvas'));
 const DEBUG={cards:cards.length,loaded:false,draws:0,flips:0,errors:[],visible:0};
 window.LUMO_MONEY_DEBUG=()=>({...DEBUG});

 // Flip controls are on the actual faces, never overlay the whole card.
 cards.forEach(card=>{
  const open=card.querySelector('.price-card__flip--front');
  const close=card.querySelector('.price-card__flip--back');
  const flip=(turn)=>{
   if(card.classList.contains('is-flipped')===turn)return;
   card.classList.toggle('is-flipped',turn);
   card.setAttribute('data-flipped',String(turn));
   open.tabIndex=turn?-1:0;
   close.tabIndex=turn?0:-1;
   open.setAttribute('aria-hidden',String(turn));
   close.setAttribute('aria-hidden',String(!turn));
   DEBUG.flips++;
  };
  open.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();flip(true);});
  close.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();flip(false);});
  card.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&card.classList.contains('is-flipped')){
    e.preventDefault();flip(false);open.focus({preventScroll:true});
   }
  });
  close.tabIndex=-1;
  close.setAttribute('aria-hidden','true');
  open.setAttribute('aria-hidden','false');
  card.dataset.flipped='false';
 });

 function extractGLB(buffer){
  const v=new DataView(buffer),raw=new Uint8Array(buffer);
  if(v.getUint32(0,true)!==0x46546c67)throw Error('Invalid money GLB header');
  const chunkSize=v.getUint32(12,true);
  const json=JSON.parse(new TextDecoder().decode(raw.subarray(20,20+chunkSize)));
  const bin=20+chunkSize+8;
  const ncomp={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
  function accessor(id){
   const a=json.accessors[id],view=json.bufferViews[a.bufferView];
   const components=ncomp[a.type],type=a.componentType;
   const byteWidth=type===5126||type===5125?4:type===5123?2:1;
   const stride=view.byteStride||components*byteWidth;
   const offset=bin+(view.byteOffset||0)+(a.byteOffset||0);
   const result=new Float32Array(a.count*components);
   for(let i=0;i<a.count;i++){
    for(let j=0;j<components;j++){
     const off=offset+i*stride+j*byteWidth;
     const num=type===5126?v.getFloat32(off,true):type===5125?v.getUint32(off,true):type===5123?v.getUint16(off,true):v.getUint8(off);
     result[i*components+j]=num;
    }
   }
   return result;
  }
  const primitive=json.meshes[0].primitives[0];
  const position=accessor(primitive.attributes.POSITION);
  const normal=accessor(primitive.attributes.NORMAL);
  const uv=accessor(primitive.attributes.TEXCOORD_0);
  const idx=Uint16Array.from(accessor(primitive.indices));
  const view=json.bufferViews[json.images[0].bufferView];
  const start=bin+(view.byteOffset||0);
  const image=new Blob([raw.slice(start,start+view.byteLength)],{type:json.images[0].mimeType||'image/jpeg'});
  return {position,normal,uv,idx,image};
 }
 const vert=`attribute vec3 aPosition,aNormal;attribute vec2 aUV;
 uniform mat4 uProjection;uniform float uRotation,uPitch;
 varying vec2 vUV;varying vec3 vNorm;varying vec3 vPosition;
 void main(){
  vec3 p=aPosition/111.0;vec3 n=aNormal;
  float c=cos(uRotation),s=sin(uRotation);
  p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);
  n=vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c);
  float x=cos(uPitch),y=sin(uPitch);
  p=vec3(p.x,p.y*x-p.z*y,p.y*y+p.z*x);
  n=vec3(n.x,n.y*x-n.z*y,n.y*y+n.z*x);
  vUV=aUV;vNorm=n;vPosition=p;
  gl_Position=uProjection*vec4(p.x,p.y,p.z-4.15,1.0);
 }`;
 const frag=`precision mediump float;
 uniform sampler2D uTexture;
 varying vec2 vUV;varying vec3 vNorm;varying vec3 vPosition;
 void main(){
  vec3 albedo=texture2D(uTexture,vUV).rgb;
  vec3 normal=normalize(vNorm);
  // Soft overhead reflection, kept intentionally weak to preserve detail.
  float key=max(dot(normal,normalize(vec3(-.42,.69,.67))),0.0);
  float fill=max(dot(normal,normalize(vec3(.74,.15,-.2))),0.0);
  // An invisible warm light is placed *beneath* the bills. Each fragment
  // receives light according to its surface direction and distance.
  vec3 lampPos=vec3(.30,-1.28,1.75);
  vec3 lightVec=lampPos-vPosition;
  float distanceToLamp=length(lightVec);
  vec3 lampDir=lightVec/max(distanceToLamp,.001);
  float diffuse=max(dot(normal,lampDir),0.0);
  float falloff=1.0/(1.0+.65*distanceToLamp*distanceToLamp);
  float beam=pow(max(dot(lampDir,normalize(vec3(.1,-.20,1.0))),0.0),2.0);
  float warmLight=diffuse*falloff*(.7+.3*beam);
  // The amber highlights follow the material, rather than forming a halo.
  vec3 lighting=vec3(.63)+vec3(.22)*key+vec3(.08)*fill;
  lighting+=vec3(1.00,.77,.42)*warmLight*1.85;
  vec3 reflectDir=reflect(-lampDir,normal);
  float glint=pow(max(dot(reflectDir,vec3(0.0,0.0,1.0)),0.0),21.0)*falloff;
  vec3 color=albedo*lighting+vec3(.76,.58,.33)*glint*.10;
  color=color/(vec3(1.0)+max(color-vec3(.85),vec3(0.0))*.35);
  gl_FragColor=vec4(color,1.0);
 }`;
 function shader(gl,type,source){
  const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
  return s;
 }
 function program(gl){
  const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,vert));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,frag));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
 }
 function projection(aspect){
  const f=1/Math.tan(41*Math.PI/360),n=.1,far=35;
  return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+n)/(n-far),-1, 0,0,2*far*n/(n-far),0]);
 }
 function createRenderer(canvas,mesh,decoded,index){
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,preserveDrawingBuffer:false,powerPreference:'low-power'});
  if(!gl)throw Error('WebGL unavailable');
  const p=program(gl);
  gl.useProgram(p);
  const loc={};
  for(const key of ['aPosition','aNormal','aUV'])loc[key]=gl.getAttribLocation(p,key);
  for(const key of ['uProjection','uRotation','uPitch','uTexture'])loc[key]=gl.getUniformLocation(p,key);
  function attribute(name,data,size){
   const buff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buff);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
   gl.enableVertexAttribArray(loc[name]);gl.vertexAttribPointer(loc[name],size,gl.FLOAT,false,0,0);
  }
  attribute('aPosition',mesh.position,3);attribute('aNormal',mesh.normal,3);attribute('aUV',mesh.uv,2);
  const indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.idx,gl.STATIC_DRAW);
  const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  // 1024px source is sufficient for a small phone card while saving 75% GPU texture RAM.
  let source=decoded;
  if(window.innerWidth<780 && decoded.width>1024){
   const small=document.createElement('canvas');small.width=small.height=1024;
   small.getContext('2d').drawImage(decoded,0,0,1024,1024);source=small;
  }
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  const aniso=gl.getExtension('EXT_texture_filter_anisotropic');
  if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  gl.uniform1i(loc.uTexture,0);
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  function draw(timestamp){
   const r=canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;
   const dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<780?1.5:1.75);
   const width=Math.max(2,Math.round(r.width*dpr)),height=Math.max(2,Math.round(r.height*dpr));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height)}
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const t=reduce?0:timestamp*0.001;
   const phase=index*.73;
   const yaw=-0.22 + Math.sin(t*.58+phase)*0.92;
   gl.uniformMatrix4fv(loc.uProjection,false,projection(width/height));
   gl.uniform1f(loc.uRotation,yaw);
   gl.uniform1f(loc.uPitch,.17+.045*Math.sin(phase+t*.28));
   gl.drawElements(gl.TRIANGLES,mesh.idx.length,gl.UNSIGNED_SHORT,0);
   if(!canvas.closest('.money-stage').classList.contains('money-stage--ready'))canvas.closest('.money-stage').classList.add('money-stage--ready');
   DEBUG.draws++;
  }
  return {draw,canvas,gl};
 }
 async function prepareImage(blob){
  const url=URL.createObjectURL(blob);
  try{const img=new Image();img.src=url;await img.decode();return img;}
  finally{URL.revokeObjectURL(url);}
 }
 async function start(){
  try{
   const response=await fetch('assets/models/stacks-of-money.glb');if(!response.ok)throw Error(`Money model HTTP ${response.status}`);
   const mesh=extractGLB(await response.arrayBuffer());const decoded=await prepareImage(mesh.image);
   const renderers=[];
   canvases.forEach((canvas,i)=>{
    try{const entry=createRenderer(canvas,mesh,decoded,i);renderers.push({...entry,card:cards[i],visible:false});}
    catch(e){DEBUG.errors.push(`card ${i}: ${String(e.message||e)}`);canvas.closest('.money-stage')?.classList.add('money-stage--unsupported');}
   });
   const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const entry=renderers.find(r=>r.card===e.target);if(entry)entry.visible=e.isIntersecting;});},{rootMargin:'140px 0px',threshold:.01});
   renderers.forEach(r=>observer.observe(r.card));
   DEBUG.loaded=renderers.length>0;
   let last=0;
   const tick=timestamp=>{
    requestAnimationFrame(tick);
    if(document.hidden)return;
    const gap=window.innerWidth<780?32:24;
    if(timestamp-last<gap)return;
    last=timestamp;
    DEBUG.visible=0;
    for(const r of renderers){
     if(!r.visible||r.card.classList.contains('is-flipped'))continue;
     DEBUG.visible++;
     try{r.draw(timestamp)}catch(e){DEBUG.errors.push(String(e.message||e));r.visible=false;}
    }
   };
   requestAnimationFrame(tick);
  }catch(e){DEBUG.errors.push(String(e.message||e));
   canvases.forEach(c=>c.closest('.money-stage')?.classList.add('money-stage--unsupported'));
  }
 }
 if('IntersectionObserver' in window)start();else DEBUG.errors.push('IntersectionObserver unavailable');
})();
