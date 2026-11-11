(() => {
const foods=globalThis.BIEN_FOODS, {plan,recipes}=globalThis.BIEN_CONTENT;
const DAY=86400000, key='mi-bienestar-v1';
const profileDefaults={weight:'',height:'',age:'',country:'',diagnosis:'',medicine:'',preferences:'',dislikes:'',allergies:'',people:'',cook:'',activity:'',minutes:''};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(o,k)=>Object.hasOwn(o,k);
const id=()=>globalThis.crypto?.randomUUID?.()??Date.now().toString(36)+Math.random().toString(36).slice(2);
const iso=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const stamp=s=>Date.parse(s+'T00:00:00Z');
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(stamp(s))&&new Date(stamp(s)).toISOString().slice(0,10)===s;
const offset=(s,n)=>new Date(stamp(s)+n*DAY).toISOString().slice(0,10);
const dayNumber=(start,date=iso())=>Math.floor((stamp(date)-stamp(start))/DAY)+1;
const freshDay=()=>({entries:[],water:0,note:'',done:false,activity:'',weight:null,glucose:[]});
const freshCycle=(start=iso())=>({id:id(),start,days:{},swaps:{},shopping:{}});
const fresh=(start=iso())=>{const c=freshCycle(start);return {version:1,profile:{...profileDefaults},cycles:[c],active:c.id,catalog:{}};};
const active=s=>s.cycles.find(c=>c.id===s.active);
const current=(c,date=iso())=>Math.min(30,Math.max(1,dayNumber(c.start,date)));
const getDay=(c,d)=>c.days[d]??freshDay();
const editDay=(c,d)=>c.days[d]??(c.days[d]=freshDay());
const menu=(c,d)=>plan[d-1].map((x,i)=>c.swaps[d]?.[i]??x);
const matches=(recipe,slot)=>recipe.type===['des','sal','mer','sal','col'][slot];
function change(c,d,slot,rid,mozzarella=false){
  if(!Number.isInteger(d)||d<1||d>30||!Number.isInteger(slot)||slot<0||slot>4||!own(recipes,rid)||!matches(recipes[rid],slot)) throw Error('La receta no corresponde a esta comida.');
  (c.swaps[d]??={})[slot]=rid;
  if(recipes[rid].optionalItems){
   ((c.mealOptions??={})[d]??={})[slot]={mozzarella:!!mozzarella};
  }else if(c.mealOptions?.[d])delete c.mealOptions[d][slot];
}
function recipeVariant(r,mozzarella=false){
 if(!r?.optionalItems)return r;
 return {...r,items:[...r.items,...(mozzarella?r.optionalItems:[])],includedMozzarella:!!mozzarella};
}
const mealRecipe=(c,d,slot)=>recipeVariant(recipes[menu(c,d)[slot]],c.mealOptions?.[d]?.[slot]?.mozzarella);
function scale(n,f){return n.map(v=>v===null?null:v*f);}
function sum(rows){
 const values=Array(5).fill(null), missing=Array(5).fill(0);
 for(const row of rows)row.forEach((v,i)=>{if(v===null)missing[i]++;else values[i]=(values[i]??0)+v;});
 return {values,missing,count:rows.length};
}
function recipeNutrition(r){return sum(r.items.map(([k,g])=>scale(foods[k].n,g/100/r.serves)));}
function totals(day){return sum(day.entries.flatMap(e=>[e.n,...(e.unknown??[])]));}
function recipeEntry(r,servings,slot){
 const n=recipeNutrition(r);
 return {id:id(),name:r.name,detail:servings+' porción(es)'+(r.optionalItems?r.includedMozzarella?' · con mozzarella':' · sin mozzarella':''),kind:'plan',slot,n:scale(n.values,servings),unknown:n.missing.some(Boolean)?[n.missing.map(x=>x?null:0)]:[]};
}
function itemEntry(food,qty,measure,slot,kind='food'){
 const unit=measure==='g'||(measure==='ml'&&food.liquid)?1:food.measures[measure];
 if(!Number.isFinite(unit)||!Number.isFinite(qty)||qty<=0)throw Error('Ingresá una cantidad válida para esa medida.');
 return {id:id(),name:food.name,detail:qty+' '+measure+(unit===1?'':' (≈ '+(qty*unit).toFixed(1)+' g)'),kind,slot,n:scale(food.n,qty*unit/100),water:kind==='drink'&&food.water?qty*unit:0};
}
function weekShopping(c,w,people){
 const grouped={};
 for(let d=w*7+1;d<=Math.min(30,w*7+7);d++) for(let slot=0;slot<4;slot++) {
   const r=mealRecipe(c,d,slot);
   for(const [k,g] of r.items){if(k==='agua')continue;grouped[k]=(grouped[k]??0)+g*people/r.serves;}
 }
 const modifications=c.shopping[w]??{};
 return [...Object.entries(grouped).map(([id,g])=>({id,name:foods[id].name,cat:foods[id].cat,qty:g,unit:'g'})),...Object.values(modifications).filter(x=>x.custom)]
 .filter(x=>!modifications[x.id]?.hidden).map(x=>({...x,...modifications[x.id]})).sort((a,b)=>a.cat-b.cat||a.name.localeCompare(b.name,'es'));
}
function snapshot(s){return JSON.stringify(s,null,2);}
function parse(text){
 if(text.length>10000000)throw Error('El archivo supera el tamaño admitido.');
 const raw=JSON.parse(text);
 const arr=(a,max)=>Array.isArray(a)&&a.length<=max;
 const str=(v,m=300)=>typeof v==='string'&&v.length<=m;
 const n=(v,max=10000000)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
 const choice=(v,a)=>a.includes(v);
 const nut=v=>arr(v,5)&&v.length===5&&v.every(x=>x===null||n(x));
 const uid=v=>str(v,80)&&/^[\w-]+$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
 const map=(o,max,fn)=>object(o)&&Object.keys(o).length<=max&&Object.entries(o).every(([k,v])=>fn(k,v));
 const positive=(v,max)=>n(v,max)&&v>0;
 const index=(k,max,min=0)=>/^\d{1,2}$/.test(k)&&String(+k)===k&&+k>=min&&+k<=max;
 const entry=e=>object(e)&&uid(e.id)&&str(e.name)&&str(e.detail)&&choice(e.kind,['plan','food','drink','custom'])&&Number.isInteger(e.slot)&&e.slot>=0&&e.slot<5&&nut(e.n)&&(e.water===undefined||n(e.water))&&(e.unknown===undefined||(arr(e.unknown,5)&&e.unknown.every(nut)));
 const day=x=>object(x)&&arr(x.entries,1000)&&x.entries.every(entry)&&n(x.water)&&str(x.note,2000)&&typeof x.done==='boolean'&&str(x.activity,200)&&(x.weight===null||positive(x.weight,1000))&&arr(x.glucose,100)&&x.glucose.every(g=>object(g)&&uid(g.id)&&positive(g.value,2000)&&choice(g.context,['En ayunas','Después de comer'])&&str(g.timing,120));
 const shopping=(k,v)=>uid(k)&&object(v)&&['checked','hidden','custom'].every(x=>v[x]===undefined||typeof v[x]==='boolean')&&(!v.custom||v.id===k&&str(v.name)&&Number.isInteger(v.cat)&&v.cat>=0&&v.cat<6&&str(v.unit,30)&&n(v.qty))&&(v.qty===undefined||n(v.qty));
 const mealOptions=(k,v)=>index(k,30,1)&&map(v,5,(i,o)=>index(i,4)&&object(o)&&Object.keys(o).every(k=>k==='mozzarella')&&typeof o.mozzarella==='boolean');
 const cycle=c=>object(c)&&uid(c.id)&&validDate(c.start)&&map(c.days,30,(k,v)=>index(k,30,1)&&day(v))&&map(c.swaps,30,(k,v)=>index(k,30,1)&&map(v,5,(i,r)=>index(i,4)&&typeof r==='string'&&own(recipes,r)&&matches(recipes[r],+i)))&&map(c.shopping,5,(w,v)=>index(w,4)&&map(v,500,shopping))&&(c.mealOptions===undefined||map(c.mealOptions,30,mealOptions));
 const p=raw?.profile;
 const profile=object(p)&&Object.keys(p).every(k=>own(profileDefaults,k))&&Object.entries(p).every(([k,v])=>k==='people'?v===''||(Number.isInteger(v)&&v>=1&&v<=30):str(v,600)||n(v,1000));
 const catalog=(k,v)=>uid(k)&&object(v)&&str(v.name)&&nut(v.n)&&typeof v.liquid==='boolean'&&map(v.measures,10,(a,b)=>str(a,80)&&!['__proto__','constructor','prototype','g','ml'].includes(a)&&positive(b,10000));
 if(!object(raw)||raw.version!==1||!profile||!arr(raw.cycles,500)||!raw.cycles.length||!raw.cycles.every(cycle)||new Set(raw.cycles.map(c=>c.id)).size!==raw.cycles.length||!raw.cycles.some(c=>c.id===raw.active)||!map(raw.catalog,500,catalog))throw Error('El archivo no tiene el formato de un respaldo de Mi Bienestar.');
 raw.profile={...profileDefaults,...p};
 return raw;
}
globalThis.BIEN_ENGINE={key,profileDefaults,iso,validDate,offset,dayNumber,fresh,active,current,freshCycle,getDay,editDay,menu,matches,change,recipeVariant,mealRecipe,scale,sum,recipeNutrition,totals,recipeEntry,itemEntry,weekShopping,snapshot,parse,id};
})();
