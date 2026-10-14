/* Flash Science — salvar, baixar e restaurar a jornada. Executa totalmente no dispositivo. */
(()=>{
'use strict';
const KEY='flash_science_standalone_v2';
const DAY1_KEY='flash_science_dia1_v1';
const SAVED_AT='flash_science_last_saved_at_v1';
const PHOTO_DB='flash_science_dia1_photos';
const PHOTO_BUCKET='memory';
const questionCount=35;
const $=id=>document.getElementById(id);
const make=(tag,attrs={},text='')=>{
 const el=document.createElement(tag);
 for(const [k,v] of Object.entries(attrs)){if(k==='class')el.className=v;else el.setAttribute(k,v);}
 if(text)el.textContent=text;
 return el;
};
const announce=(message)=>{
 const toast=$('toast');
 if(!toast){window.alert(message);return}
 toast.textContent=message;
 toast.classList.add('show');
 window.setTimeout(()=>toast.classList.remove('show'),3500);
};
const current=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}};
const validAnswer=v=>Number.isInteger(v)&&v>=0&&v<=3;
const totalAnswers=s=>s&&s.answers&&typeof s.answers==='object'
 ? new Set([...Object.entries(s.answers).filter(([i,a])=>/^(?:[0-9]|[12][0-9]|3[0-4])$/.test(i)&&validAnswer(a)).map(([i])=>i),...Object.entries(s.custom||{}).filter(([i,v])=>/^(?:[0-9]|[12][0-9]|3[0-4])$/.test(i)&&typeof v==='string'&&v.trim().length>=3).map(([i])=>i)]).size:0;
function stamp(){
 try{const d=localStorage.getItem(SAVED_AT);if(!d)return 'Salvamento automático ativo';const date=new Date(d);return Number.isFinite(date.getTime())?'Último salvamento: '+date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Salvamento automático ativo';}
 catch(_){return 'Armazenamento local indisponível'}
}
function updateStatus(){
 const s=current(),n=totalAnswers(s);
 const label=n+' de '+questionCount+' perguntas respondidas · '+stamp();
 if($('fsSaveStatus'))$('fsSaveStatus').textContent=label;
 if($('fsSaveInfo'))$('fsSaveInfo').textContent='● '+(n?'Jornada em andamento — '+n+'/'+questionCount:'Sua jornada ainda vai começar')+' · salvamento automático';
}
function saveNow(){
 const s=current();
 if(!s){announce('Comece sua jornada para salvar as respostas.');return}
 try{localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem(SAVED_AT,new Date().toISOString());updateStatus();announce('Sua jornada foi salva neste dispositivo.');}
 catch(_){announce('Não foi possível salvar neste navegador. Use Baixar backup para guardar suas respostas.');}
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=make('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function photoDB(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){resolve(null);return}
  const r=indexedDB.open(PHOTO_DB,1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(PHOTO_BUCKET))r.result.createObjectStore(PHOTO_BUCKET)};
  r.onsuccess=()=>resolve(r.result);
  r.onerror=()=>reject(r.error||Error('Não foi possível acessar as fotos'));
 });
}
async function getPhoto(){
 const db=await photoDB();if(!db)return null;
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(PHOTO_BUCKET,'readonly'),req=tx.objectStore(PHOTO_BUCKET).get('dia1');
  req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
 })}finally{db.close()}
}
async function putPhoto(blob){
 const db=await photoDB();if(!db)throw Error('Fotos indisponíveis neste aparelho');
 try{await new Promise((resolve,reject)=>{
  const tx=db.transaction(PHOTO_BUCKET,'readwrite');
  tx.objectStore(PHOTO_BUCKET).put(blob,'dia1');
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
 })}finally{db.close()}
}
function blobAsDataUrl(blob){
 return new Promise((resolve,reject)=>{
  const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);
 });
}
async function backup(){
 const s=current();
 if(!s){announce('Comece sua jornada primeiro.');return}
 const btn=$('fsBackupButton');
 if(btn)btn.disabled=true;
 try{
  let memory=null;
  try{memory=JSON.parse(localStorage.getItem(DAY1_KEY)||'null')}catch(_){}
  const data={app:'Flash Science',type:'jornada-completa',version:1,exportedAt:new Date().toISOString(),
   help:'Guarde em local privado: contém respostas pessoais e, se houver, foto do Dia 1.',
   journey:s,day1:{memory:memory,image:null}};
  let photoIncluded=false;
  try{
   const blob=await getPhoto();
   if(blob&&blob.size<=8*1024*1024){data.day1.image=await blobAsDataUrl(blob);photoIncluded=true}
  }catch(e){/* mantém jornada e texto mesmo sem a foto */}
  const iso=new Date().toISOString().slice(0,10);
  download(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),'flash-science-minha-jornada-'+iso+'.json');
  try{localStorage.setItem(SAVED_AT,new Date().toISOString())}catch(_){}
  updateStatus();
  announce(photoIncluded?'Backup baixado: respostas, Dia 1 e foto.':'Backup baixado. Se você registrou uma foto, confira também o backup do Dia 1.');
 }catch(_){announce('Não foi possível baixar. Confira as permissões de download do navegador.')}
 finally{if(btn)btn.disabled=false}
}
function cleanObject(obj,mode){
 const out={};
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return out;
 for(const [k,v] of Object.entries(obj)){
  if(!/^(?:[0-9]|[12][0-9]|3[0-4])$/.test(k))continue;
  if(mode==='answers'&&validAnswer(v))out[k]=v;
  else if(mode==='custom'&&typeof v==='string')out[k]=v.slice(0,1000);
  else if(mode==='notes'&&typeof v==='string')out[k]=v.slice(0,1000);
  else if(mode==='flags'&&typeof v==='boolean')out[k]=v;
 }
 return out;
}
function normalize(s){
 if(!s||typeof s!=='object'||Array.isArray(s))throw Error('Jornada inválida');
 const answers=cleanObject(s.answers,'answers');
 const goals=['mestrado','doutorado','explorar'];
 const topics=['saude','ambiente','indigenas','educacao','clima','biodiversidade','agro','humanas','linguagem','tecnologia','matematica'];
 const safeTopics=Array.isArray(s.topics)?s.topics.filter(t=>topics.includes(t)).slice(0,3):[];
 const custom=cleanObject(s.custom,'custom');
 const n=Object.keys(answers).filter(k=>!Object.prototype.hasOwnProperty.call(custom,k)).length+Object.values(custom).filter(v=>v.trim().length>=3).length;
 return {goal:goals.includes(s.goal)?s.goal:'mestrado',topics:safeTopics,
  name:typeof s.name==='string'?s.name.slice(0,40):'',
  answers:answers,custom:custom,answerVersion:s.answerVersion===2?2:1,notes:cleanObject(s.notes,'notes'),done:cleanObject(s.done,'flags'),
  kept:cleanObject(s.kept,'flags'),
  index:Number.isInteger(s.index)?Math.max(0,Math.min(34,s.index)):0,
  screen:n===35&&s.screen==='result'?'result':n||s.started?'journey':'landing',
  started:!!(s.started||n)};
}
async function restore(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const upload=$('fsRestoreInput');
 try{
  if(file.size>18*1024*1024)throw Error('Arquivo maior que 18 MB');
  const data=JSON.parse(await file.text());
  if(data.app!=='Flash Science'||data.type!=='jornada-completa'||data.version!==1)throw Error('Backup desconhecido');
  const next=normalize(data.journey);
  if(current()&&totalAnswers(current())&&!confirm('Restaurar vai substituir as respostas atuais neste dispositivo. Continuar?'))return;
  let photoIssue=false,photoBlob=null;
  if(data.day1&&data.day1.image!==null&&data.day1.image!==undefined){
   const raw=data.day1.image;
   if(typeof raw!=='string'||!/^data:image\/(?:jpeg|png|webp);base64,/.test(raw)||raw.length>12*1024*1024)throw Error('Imagem inválida');
   photoBlob=await(await fetch(raw)).blob();
   if(photoBlob.size>8*1024*1024)throw Error('Foto do Dia 1 muito grande');
  }
  if(photoBlob){try{await putPhoto(photoBlob)}catch(_){photoIssue=true}}
  // Só gravar após validar todos os campos. O módulo Dia 1 relê sua memória na atualização.
  localStorage.setItem(KEY,JSON.stringify(next));
  if(data.day1&&data.day1.memory&&typeof data.day1.memory==='object'){
   const m=data.day1.memory;
   const memo={date:/^\d{4}-\d{2}-\d{2}$/.test(m.date||'')?m.date:'',
    message:typeof m.message==='string'?m.message.slice(0,480):'',
    createdAt:typeof m.createdAt==='string'?m.createdAt.slice(0,40):''};
   localStorage.setItem(DAY1_KEY,JSON.stringify(memo));
  }
  localStorage.setItem(SAVED_AT,new Date().toISOString());
  if(photoIssue)window.alert('Respostas e texto do Dia 1 foram restaurados, mas a foto não pôde ser salva neste aparelho.');
  announce('Sua jornada foi restaurada. Retomando…');
  window.setTimeout(()=>window.location.reload(),450);
 }catch(err){announce('Não foi possível restaurar: '+(err instanceof SyntaxError?'arquivo JSON inválido.':err.message||'verifique o backup.'))}
 finally{if(upload)upload.value=''}
}
const nav=document.querySelector('.navright');
if(!nav)return;
const navBtn=make('button',{type:'button',id:'fsSaveOpen',class:'quiet fs-save-nav'},'↓ Salvar');
nav.insertBefore(navBtn,$('homeBtn'));
const dialog=make('dialog',{id:'fsSaveDialog',class:'fs-save-dialog','aria-labelledby':'fsSaveTitle'});
dialog.innerHTML=[
 '<div class="fs-save-top"><div><div class="eyebrow">SUA JORNADA, NO SEU RITMO</div><h2 id="fsSaveTitle">Não perca seu caminho.</h2></div><button type="button" id="fsSaveClose" class="quiet fs-close" aria-label="Fechar">×</button></div>',
 '<p class="fs-save-description">Suas respostas são guardadas automaticamente neste navegador. Você também pode salvar agora ou baixar um arquivo para continuar em outro aparelho.</p>',
 '<div class="fs-save-status" id="fsSaveStatus" role="status"></div>',
 '<div class="fs-save-actions">',
 '<button type="button" class="btn" id="fsSaveLocal">✓ Salvar neste aparelho</button>',
 '<button type="button" class="quiet" id="fsBackupButton">↓ Baixar backup (.json)</button>',
 '<label for="fsRestoreInput" class="quiet fs-restore-label">↑ Restaurar backup</label>',
 '</div>',
 '<input id="fsRestoreInput" class="visually-hidden" type="file" accept=".json,application/json">',
 '<p class="fs-save-note">O backup pode incluir suas reflexões pessoais e a foto do Dia 1. Guarde em local privado. Fechar a aba não apaga o progresso; limpar os dados do navegador pode apagá-lo.</p>'
].join('');
document.body.appendChild(dialog);
function open(){
 updateStatus();
 if(typeof dialog.showModal==='function')dialog.showModal();
 else{dialog.setAttribute('open','');}
}
function close(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}
navBtn.addEventListener('click',open);
$('fsSaveClose').addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
$('fsSaveLocal').addEventListener('click',saveNow);
$('fsBackupButton').addEventListener('click',backup);
$('fsRestoreInput').addEventListener('change',restore);
const sidebar=document.querySelector('#journey .side');
if(sidebar){
 const strip=make('div',{class:'fs-save-strip'});
 strip.innerHTML='<span id="fsSaveInfo" class="fs-save-info">● Salvamento automático</span><div class="fs-save-shortcuts"><button type="button" class="quiet" id="fsQuickSave">Salvar agora</button><button type="button" class="quiet" id="fsQuickBackup">↓ Baixar</button></div>';
 const stages=$('stages');sidebar.insertBefore(strip,stages);
 $('fsQuickSave').addEventListener('click',saveNow);
 $('fsQuickBackup').addEventListener('click',backup);
}
const resultActions=document.querySelector('.resultbuttons');
if(resultActions){
 const extra=make('button',{type:'button',class:'quiet',id:'fsResultBackup'},'↓ Backup para continuar depois');
 resultActions.insertBefore(extra,resultActions.firstChild);
 extra.addEventListener('click',backup);
}
const heroActions=document.querySelector('.heroactions');
if(heroActions){
 const restoreButton=make('button',{type:'button',class:'quiet',id:'fsHomeRestore'},'↑ Restaurar jornada');
 heroActions.appendChild(restoreButton);
 restoreButton.addEventListener('click',open);
}
// Atualize o contador depois de respostas, mudanças de etapa e reflexões.
['answers','nextBtn','prevBtn','stages','beginBtn','reflection'].forEach(id=>{
 const el=$(id);if(!el)return;
 el.addEventListener(id==='reflection'?'input':'click',()=>window.setTimeout(updateStatus,0));
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateStatus()});
updateStatus();
})();
