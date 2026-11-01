"use strict";
// Load the actual ordered scripts into an isolated lexical scope, without VM proxy overhead.
const runtime=require('../../tools/runtime.cjs');
function nativeRuntime(root, transform=source=>source){
  const nodes=new Map(),storage=new Map();
  function node(id=''){if(!nodes.has(id))nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{},children:[],classList:{toggle(){},add(){},remove(){}},setAttribute(){},append(){},appendChild(){},insertAdjacentHTML(_position,text){this.innerHTML+=text;},replaceChildren(){this.children=[];this.innerHTML='';},querySelectorAll(){return[];},addEventListener(){},click(){}});return nodes.get(id);}
  const document={currentScript:null,getElementById:node,querySelectorAll(){return[];},createElement:tag=>node('created-'+tag),createTextNode:text=>({textContent:text}),addEventListener(){},activeElement:{tagName:'BODY'},documentElement:{style:{setProperty(){}},removeAttribute(){},setAttribute(){}},head:{appendChild(){}}};
  const window=require('./annual-cases.cjs').mockBrowserWindow();
  const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))};
  const source=runtime.readData(root)+'\n'+transform(runtime.readEngine(root));
  return Function('window','document','console','setTimeout','setInterval','localStorage','alert','confirm',source+`
HL=1;AU='r';STAT.ev={};STAT.op={};STAT.choiceMonths=new Set();
return {run:runDevSimulation,snapshot:()=>({life:S,world:W,seed:RANDOM_SEED,rng:RANDOM_STATE})};`)(window,document,console,setTimeout,()=>{},localStorage,()=>{},()=>true);
}
module.exports={nativeRuntime};
