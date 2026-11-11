(() => {
'use strict';
const {BIEN_ENGINE:E,BIEN_FOODS:F,BIEN_CONTENT:C}=globalThis;
if(!E||!F||!C)throw Error('Mi Bienestar: faltan los datos o el motor de la aplicación.');
const R=C.recipes;
const M=BIEN_MEASURES,T=BIEN_TAI_GUIDE;
const photos=globalThis.BIEN_RECIPE_PHOTOS??{};
const $=s=>document.querySelector(s), main=$('#main'), dialog=$('#modal');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=1)=>v===null||v===''||v===undefined?'—':new Intl.NumberFormat('es-AR',{maximumFractionDigits:d}).format(v);
const date=(s,long=false)=>new Intl.DateTimeFormat('es-AR',{timeZone:'UTC',day:'numeric',month:long?'long':'short',...(long?{year:'numeric'}:{})}).format(new Date(s+'T00:00:00Z'));
const names=['Energía','Carbohidratos','Proteínas','Grasas','Fibra'],units=['kcal','g','g','g','g'];
const nav=[['inicio','⌂','Hoy'],['plan','▦','Plan de comidas'],['recetas','▤','Recetario'],['diario','✎','Diario'],['taichi','❋','Taichí'],['evolucion','↗','Mi evolución'],['compras','✓','Lista de compras'],['perfil','◉','Mi perfil']];
let s, selected, week=0, recipeFilter='', recipeType='', recipeLimit=12, chair=false, timer;
try {const raw=localStorage.getItem(E.key);s=raw?E.parse(raw):E.fresh();}
catch {s=E.fresh();$('#storage-warning').textContent='No pude leer el guardado anterior. Si tenés un respaldo, podés recuperarlo desde Mi perfil.';}
const cycle=()=>E.active(s), today=()=>E.current(cycle()), day=()=>E.getDay(cycle(),selected), edit=()=>E.editDay(cycle(),selected);
const cookingPeople=()=>s.profile.people||1;
selected=today();week=Math.floor((selected-1)/7);
function save(){try{localStorage.setItem(E.key,E.snapshot(s));return true;}catch{$('#storage-warning').textContent='No se pudo guardar en el navegador. Exportá un respaldo antes de cerrar.';return false;}}
function toast(t){const e=dialog.open?$('#dialog-status'):$('#toast');e.textContent=t;e.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>{e.classList.remove('visible');e.textContent='';},2800);}
function commit(message){const saved=save();render();if(saved&&message)toast(message);}
function action(a,label,cls='btn secondary',attrs=''){return '<button type="button" class="'+cls+'" data-action="'+a+'" '+attrs+'>'+label+'</button>';}
const link=(p,label,cls='btn secondary')=>'<a class="'+cls+'" href="#'+p+'">'+label+'</a>';
const opt=(v,l,sel)=>'<option value="'+esc(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+esc(l)+'</option>';
const options=(a,sel)=>a.map(([v,l])=>opt(v,l,sel)).join('');
const inp=(name,val='',attrs='')=>'<input name="'+name+'" value="'+esc(val)+'" '+attrs+'>';
const field=(name,label,val='',attrs='')=>'<label>'+label+inp(name,val,attrs)+'</label>';
const ta=(name,label,val='',max=600)=>'<label>'+label+'<textarea name="'+name+'" maxlength="'+max+'" rows="2">'+esc(val)+'</textarea></label>';
const select=(name,label,opts,sel)=>'<label>'+label+'<select name="'+name+'">'+options(opts,sel)+'</select></label>';
const slots=(name='slot',value=0)=>select(name,'Momento del día',C.slots.map((x,i)=>[i,x]),value);
const num=(step='any',min=0,max=100000)=>'type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="'+step+'"';
const heading=(tag,title,desc='')=>'<div class="page-head"><span class="kicker">'+tag+'</span><h1>'+title+'</h1>'+(desc?'<p>'+desc+'</p>':'')+'</div>';
const section=(title,side='')=>'<div class="section-head"><h2>'+title+'</h2>'+side+'</div>';
const empty=t=>'<p class="empty">'+t+'</p>';
const pill=(t,c='')=>'<span class="pill '+c+'">'+t+'</span>';
const chosen=()=>date(E.offset(cycle().start,selected-1));
const dayPicker=()=>'<div class="day-picker"><button type="button" data-action="prev" aria-label="Día anterior" '+(selected===1?'disabled':'')+'>‹</button><label><span class="sr">Día del programa</span><select data-control="day">'+options(Array.from({length:30},(_,i)=>[i+1,'Día '+(i+1)+' · '+date(E.offset(cycle().start,i))]),selected)+'</select></label><button type="button" data-action="next" aria-label="Día siguiente" '+(selected===30?'disabled':'')+'>›</button></div>';
function nutrient(n){return '<dl class="nutrients">'+names.map((k,i)=>'<div><dt>'+k+'</dt><dd>'+fmt(n.values[i],i?1:0)+(n.values[i]===null?'':' <small>'+units[i]+(n.missing[i]?' · parcial':'')+'</small>')+'</dd></div>').join('')+'</dl>';}
const water=()=>day().water+day().entries.reduce((a,e)=>a+(e.water||0),0);
const countDays=c=>Object.values(c.days).filter(d=>d.entries.some(e=>e.kind!=='drink')).length;
const weights=c=>Object.entries(c.days).filter(([,d])=>d.weight!==null).sort((a,b)=>+a[0]-+b[0]);
const latest=()=>s.cycles.flatMap(c=>weights(c).map(([n,d])=>[E.offset(c.start,+n-1),d.weight])).sort((a,b)=>a[0].localeCompare(b[0])).at(-1)?.[1];
function currentLine(){
 const n=E.dayNumber(cycle().start);
 return n<1?'Ciclo programado para el '+date(cycle().start):n>30?'Ciclo de 30 días finalizado':'Día '+n+' de 30';
}
function mealCards(){
 return '<div class="meal-grid">'+E.menu(cycle(),selected).map((id,i)=>id?'<article class="meal card">'+foodArt(R[id],'meal')+'<div class="meal-body"><span class="kicker">'+C.slots[i]+'</span><h3>'+esc(R[id].name)+'</h3><span class="muted">'+R[id].min+' min · 1 porción'+(R[id].optionalItems?(cycle().mealOptions?.[selected]?.[i]?.mozzarella?' · con mozzarella':' · sin mozzarella'):'')+'</span></div><div class="meal-buttons">'+action('recipe','Ver receta','btn text','data-id="'+id+'" data-slot="'+i+'"')+action('swap','Cambiar','btn subtle','data-slot="'+i+'"')+'</div></article>':'<article class="meal card optional"><span class="meal-icon sand" aria-hidden="true">✿</span><div class="meal-body"><span class="kicker">'+C.slots[i]+'</span><h3>Sin colación planificada</h3></div>'+action('swap','Elegir una','btn subtle','data-slot="'+i+'"')+'</article>').join('')+'</div>';
}
function metrics(){
 const n=E.totals(day()), last=latest();
 return '<div class="metrics"><article class="card stat"><span class="stat-icon sage">↗</span><span>Peso inicial</span><strong>'+fmt(s.profile.weight===''?'':Number(s.profile.weight))+' <small>'+(s.profile.weight!==''?'kg':'')+'</small></strong><a href="#perfil">Mi perfil</a></article><article class="card stat"><span class="stat-icon peach">◇</span><span>Último peso</span><strong>'+fmt(last)+' <small>'+(last?'kg':'')+'</small></strong><a href="#evolucion">Ver registros</a></article><article class="card stat"><span class="stat-icon blue">◈</span><span>Agua registrada</span><strong>'+fmt(water(),0)+' <small>ml</small></strong>'+action('water','+ 250 ml','btn text')+'</article><article class="card stat"><span class="stat-icon lilac">✦</span><span>Energía registrada</span><strong>'+fmt(n.values[0],0)+' <small>'+(n.values[0]===null?'':n.missing[0]?'kcal · parcial':'kcal')+'</small></strong><a href="#diario">Ver diario</a></article></div>';
}
function home(){
 selected=today();
 const n=E.dayNumber(cycle().start), elapsed=Math.min(30,Math.max(0,n)), sess=C.sessions[selected-1];
 return '<section class="hero"><div class="hero-copy">'+pill('✦ &nbsp; '+currentLine(),'white')+'<h1>Un día a la vez.</h1><p>Organizá tus comidas, registrá lo que elegiste y encontrá un momento para moverte.</p><div class="hero-actions">'+link('diario','＋ Registrar lo que comí','btn primary')+link('recetas','Ver mis recetas ↗','btn hero-secondary')+'</div></div><img src="bienestar.svg" alt="" width="420" height="260"></section>'+
 '<section class="card progress-card"><div><span class="kicker">TU CICLO DE 30 DÍAS</span><strong>'+elapsed+' de 30 días en el calendario</strong></div><progress value="'+elapsed+'" max="30" aria-label="Días del ciclo"></progress><a href="#evolucion">Mi evolución ↗</a></section>'+metrics()+
 '<div class="home-grid"><section>'+section('Menú de hoy',link('plan','Ver calendario →','btn text'))+'<p class="muted intro">Planificado · '+chosen()+'</p>'+mealCards()+'</section>'+
 '<aside class="stack"><section class="card side-card"><span class="kicker">CONSUMO REAL</span><h2>Lo que registraste</h2>'+nutrient(E.totals(day()))+'<p class="muted">'+(day().entries.length?'Estimaciones de las entradas del diario.':'Todavía no hay entradas en el diario de este día.')+'</p>'+link('diario','Abrir el diario →','btn text')+'</section>'+
 '<section class="card tai-preview"><span class="kicker">MOVIMIENTO SUAVE</span><h2>Taichí de hoy</h2><h3>'+esc(sess.name)+'</h3><p>'+duration(sess)+' min · '+(day().done?'Práctica registrada':'Con opción en silla')+'</p>'+link('taichi','Ver práctica →','btn secondary')+'</section></aside></div>';
}
function calendar(){
 const first=new Date(cycle().start+'T00:00:00Z').getUTCDay(), gap=(first+6)%7;
 return '<div class="calendar card">'+['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(t=>'<span class="cal-label">'+t+'</span>').join('')+'<span class="cal-gap" aria-hidden="true" data-gap="'+gap+'"></span>'+Array.from({length:30},(_,i)=>{const d=i+1,dt=E.offset(cycle().start,i);return '<button type="button" data-action="calendar" data-day="'+d+'" aria-pressed="'+(selected===d)+'" aria-label="Día '+d+' del programa, '+date(dt)+'"><strong>'+d+'</strong><small>'+date(dt)+'</small>'+(E.getDay(cycle(),d).entries.length?' <span aria-label="Con registros">•</span>':'')+'</button>';}).join('')+'</div>';
}
function plan(){
 const ids=E.menu(cycle(),selected).slice(0,4);
 const ns=ids.map((id,i)=>E.recipeNutrition(E.mealRecipe(cycle(),selected,i)));
 const combined=E.sum(ns.map(n=>n.values));
 combined.missing=combined.missing.map((m,i)=>m+ns.reduce((a,n)=>a+n.missing[i],0));
 return heading('ORGANIZACIÓN','Plan de comidas','Elegí un día para ver sus platos o cambiar una receta.')+calendar()+section('Menú · Día '+selected,dayPicker())+'<p class="muted intro">'+chosen()+' · Las porciones de referencia se pueden adaptar.</p>'+mealCards()+'<details class="card pad spaced"><summary>Estimación del menú planificado</summary>'+nutrient(combined)+'<p class="muted">Una porción de cada comida principal. La colación es opcional. Estos valores no se suman al diario hasta que registres una comida.</p></details>';
}
const tags={des:'Desayuno',mer:'Merienda',sal:'Almuerzo o cena',col:'Colación'};
const fold=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderRecipeCards(){
 const list=Object.values(R).filter(r=>(!recipeType||r.type===recipeType)&&fold(r.name+' '+r.items.map(([k])=>F[k].name).join(' ')).includes(fold(recipeFilter)));
 return (list.length?'<div class="recipe-grid">'+list.slice(0,recipeLimit).map(r=>'<article class="card recipe-tile">'+foodArt(r)+'<div><span class="kicker">'+tags[r.type]+' · '+r.min+' min</span><h3>'+esc(r.name)+'</h3>'+action('recipe','Ver receta →','btn text','data-id="'+r.id+'"')+'</div></article>').join('')+'</div>':empty('No hay recetas para esa búsqueda.'))+(list.length>recipeLimit?action('more-recipes','Ver más recetas','btn secondary wide'):'');
}
function recipes(){return heading('COCINA CASERA','Recetario','Ideas para preparar con ingredientes habituales en Argentina.')+'<div class="toolbar"><label>Buscar receta<input type="search" data-control="recipe-search" placeholder="Por ejemplo, lentejas" value="'+esc(recipeFilter)+'"></label><label>Tipo de comida<select data-control="recipe-type">'+options([['','Todas'],...Object.entries(tags)],recipeType)+'</select></label></div><div id="recipe-results">'+renderRecipeCards()+'</div>';}
const dishShapes={
 des:'<path d="M38 47h72c-4 24-16 32-36 32S42 71 38 47Z" fill="#d88c67"/><ellipse cx="74" cy="46" rx="36" ry="10" fill="#ffe1a8"/><path d="M66 29c-8-8 7-9 1-18m15 16c-7-6 5-9 1-15" stroke="#8b6553" stroke-width="2" fill="none"/>',
 mer:'<path d="M40 38h47v24a15 15 0 0 1-15 15H55a15 15 0 0 1-15-15Z" fill="#a68ab9"/><path d="M88 43h6a9 9 0 1 1 0 18h-7" fill="none" stroke="#a68ab9" stroke-width="4"/><ellipse cx="63" cy="39" rx="23" ry="5" fill="#eee0ef"/><circle cx="104" cy="66" r="12" fill="#d6a072"/>',
 col:'<path d="M74 43c-8 1-17-14-28-3-14 14 0 38 13 37 7-1 9-3 15 0 14 4 29-28 15-39-6-5-10 0-15 5Z" fill="#c97967"/><path d="M71 41c-1-9 1-14 7-20m-4 13c10-11 17-7 20-6-5 7-11 9-20 6Z" fill="#7b9c75" stroke="#587758" stroke-width="2"/><ellipse cx="105" cy="68" rx="10" ry="7" fill="#af8656"/>',
 sal:'<path d="M45 53q11-28 30-7t20 16q-19 19-50-9Z" fill="#70a17c"/><path d="M69 61q12-19 26-12t7 17q-12 14-33-5Z" fill="#e5a275"/><circle cx="61" cy="58" r="6" fill="#e8ca76"/><circle cx="85" cy="41" r="5" fill="#bf705f"/>'
};
function photoCredit(p){
 return '<p class="photo-credit">'+(p.note?esc(p.note)+' ':'')+'Foto: <a href="'+esc(p.source)+'" rel="noreferrer">'+esc(p.author)+'</a> · '+(p.licenseUrl?'<a href="'+esc(p.licenseUrl)+'" rel="noreferrer">'+esc(p.license)+'</a>':esc(p.license))+' · '+esc(p.creditChange ?? 'JPEG optimizado')+'.</p>';
}
function foodArt(r,view='tile'){
 const p=photos[r.id],color={des:'peach',mer:'lilac',col:'sand',sal:'sage'}[r.type];
 const fallback='<div class="dish-fallback"'+(p?' hidden':'')+'><svg viewBox="0 0 148 94" aria-hidden="true"><ellipse cx="74" cy="53" rx="49" ry="34" fill="#fbf9f0"/><ellipse cx="74" cy="53" rx="39" ry="27" fill="none" stroke="#dadacb"/>'+dishShapes[r.type]+'</svg><span>Ilustración temporal</span></div>';
 const img=p?'<img class="dish-image" src="img/recetas/'+esc(p.file)+'" alt="'+esc(p.alt)+'" '+(view==='meal'||view==='tile'?'loading="lazy" ':'')+'decoding="async">':'';
 const zoom=p&&view==='detail'?action('photo-zoom','Ampliar foto','btn secondary photo-zoom','data-id="'+r.id+'"'):'';
 return '<figure class="dish-photo dish-'+view+' '+color+'" data-dish-photo><div class="dish-frame">'+img+fallback+'</div>'+(zoom?'<figcaption>'+zoom+photoCredit(p)+'</figcaption>':p&&view==='large'?'<figcaption>'+photoCredit(p)+'</figcaption>':'')+'</figure>';
}
function show(title,body){dialog.innerHTML='<div class="modal-head"><h2 id="modal-title">'+title+'</h2>'+action('close','×','close','aria-label="Cerrar"')+'</div><div class="modal-body"><div id="dialog-status" role="status" aria-live="polite"></div>'+body+'</div>';if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
const close=()=>dialog.close();
function optionalCheckbox(r,checked=false,control=''){
 return r?.optionalItems?'<label class="check"><input type="checkbox" name="mozzarella" '+(control?'data-control="'+control+'" ':'')+(checked?'checked':'')+'> Incluir mozzarella (20 g por porción)</label>':'';
}
function ingredientAmount(id,grams,unit){
 const homeMeasure=M.measure(id,grams);
 return fmt(grams)+' '+unit+(homeMeasure?' (aprox. '+homeMeasure+')':'');
}
function recipeDialog(id,serves=cookingPeople(),mozzarella=false){
 const r=E.recipeVariant(R[id],mozzarella),n=E.recipeNutrition(r);
 show(esc(r.name),foodArt(r,'detail')+'<p class="muted">'+r.min+' min aprox. · La receta base rinde '+r.serves+' porción.</p>'+(r.timeNote?'<p class="muted">'+esc(r.timeNote)+'</p>':'')+'<form data-form="serves" data-id="'+id+'" class="inline"><label>Porciones para cocinar'+inp('serves',serves,num(1,1,30)+' required')+'</label>'+optionalCheckbox(r,mozzarella,'recipe-mozzarella')+'</form><h3>Ingredientes</h3><p class="muted kitchen-note">Las equivalencias son orientativas: taza medidora de 240 ml, cucharada de 15 ml y cucharadita de 5 ml. Las medidas pueden variar por tamaño, marca o corte. Si solo aparece el peso, usalo como referencia.</p><ul class="ingredients" aria-live="polite">'+r.items.map(([k,g])=>{const unit=k==='agua'?'ml':'g';return '<li><span>'+esc(F[k].name)+'</span><strong data-grams="'+(g/r.serves)+'" data-unit="'+unit+'" data-food="'+k+'">'+esc(ingredientAmount(k,g*serves/r.serves,unit))+'</strong></li>';}).join('')+'</ul>'+(r.optionalItems&&!mozzarella?'<p class="muted">Mozzarella opcional: <strong data-grams="20" data-unit="g" data-food="mozzarella">'+esc(ingredientAmount('mozzarella',20*serves,'g'))+'</strong>; no incluida en esta estimación.</p>':'')+(r.extras?'<p class="muted">'+esc(r.extras)+'</p>':'')+'<h3>Preparación</h3><ol class="steps">'+r.steps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol><h3>Estimación por porción</h3>'+nutrient(n)+'<p class="muted">Valores de referencia según los ingredientes en las cantidades indicadas. No se recalculan por cocción ni sustituciones de texto.</p><p><strong>Alternativa:</strong> '+esc(r.swap)+'</p><p><strong>Preparación y conservación:</strong> '+esc(r.tip)+'</p>'+link('fuentes','Cómo se calcula →','btn text')+
 '<h3>Registrar lo que comí</h3><form data-form="recipe-log" data-id="'+id+'" class="stack">'+select('slot','Momento del día',C.slots.map((name,i)=>[i,name]),r.type==='sal'?1:r.type==='mer'?2:r.type==='col'?4:0)+field('servings','Porciones consumidas',1,num(.25,.25,30)+' required')+optionalCheckbox(r,mozzarella)+'<button class="btn primary">Agregar al diario de Día '+selected+'</button></form>');
}
function journal(){
 const d=day(),menu=E.menu(cycle(),selected);
 return heading('REGISTRO PERSONAL','Diario de comidas','Registrá lo que efectivamente comiste y tomaste.')+section('Día '+selected+' · '+chosen(),dayPicker())+
 '<div class="journal-grid"><section class="card pad"><h2>Registrar una comida</h2><p class="muted">Usá el menú o agregá tus propios alimentos.</p><form data-form="planned" class="form-grid">'+select('slot','Menú planificado',C.slots.map((x,i)=>[i,x+' · '+(menu[i]?R[menu[i]].name:'Sin receta')]),0)+field('servings','Porciones consumidas',1,num(.25,.25,30)+' required')+'<div id="planned-optional">'+optionalCheckbox(R[menu[0]],cycle().mealOptions?.[selected]?.[0]?.mozzarella)+'</div><button class="btn primary">Registrar del menú</button></form><div class="button-row">'+action('food','＋ Buscar alimento','btn secondary')+action('custom','＋ Comida diferente','btn secondary')+action('catalog','Editar catálogo','btn text')+'</div></section>'+
 '<section class="card pad"><h2>Agua y bebidas</h2><strong class="big">'+fmt(water(),0)+' <small>ml de agua</small></strong><form data-form="water" class="inline">'+field('ml','Vasos o cantidad (ml)',250,num(1,1,10000)+' required')+'<button class="btn secondary">Agregar agua</button></form><div class="button-row">'+action('drink','Registrar otra bebida')+action('undo-water','Restar agua','btn text')+'</div></section></div>'+
 '<section class="card pad spaced"><h2>Consumido · totales estimados</h2>'+nutrient(E.totals(d))+(d.entries.length?'<ul class="rows">'+d.entries.map(e=>'<li><div><strong>'+esc(e.name)+'</strong><small>'+esc(C.slots[e.slot])+' · '+esc(e.detail)+' · '+(e.kind==='plan'?'Del menú':e.kind==='drink'?'Bebida':'Registro propio')+'</small></div><span>'+fmt(e.n[0],0)+(e.n[0]===null?'':' kcal')+'</span>'+action('remove-entry','Quitar','btn text','data-id="'+esc(e.id)+'"')+'</li>').join('')+'</ul>':empty('Aún no registraste comidas ni otras bebidas para este día.'))+'</section>'+
 '<section class="card pad spaced"><h2>Observaciones</h2><form data-form="note">'+ta('note','¿Querés dejar una nota?',d.note,2000)+'<button class="btn secondary">Guardar nota</button></form></section>';
}
function foodCatalog(drink){return {...Object.fromEntries(Object.entries(F).filter(([,f])=>!drink||f.liquid)),...Object.fromEntries(Object.entries(s.catalog).filter(([,f])=>!drink||f.liquid))};}
function listFoods(drink,q=''){
 const cats=foodCatalog(drink);
 return Object.entries(cats).filter(([,f])=>fold(f.name).includes(fold(q))).sort((a,b)=>a[1].name.localeCompare(b[1].name,'es'));
}
function foodDialog(drink=false){
 show(drink?'Registrar una bebida':'Agregar un alimento','<form data-form="item" data-drink="'+(+drink)+'" class="stack"><label>Buscar en el catálogo<input type="search" data-control="food-search" placeholder="'+(drink?'Por ejemplo, té':'Por ejemplo, pan integral')+'"></label><label>Alimento<select name="food" required data-control="food-id">'+options(listFoods(drink).map(([k,f])=>[k,f.name]))+'</select></label><div class="form-grid">'+field('qty','Cantidad',1,num(.01,.01,20000)+' required')+'<label>Medida<select name="measure" required></select></label>'+slots()+'</div><div id="item-preview" aria-live="polite"></div><button class="btn primary">Agregar al diario</button></form>');
 setMeasures();
}
function setMeasures(){const f=dialog.querySelector('form'),food=foodCatalog(f.dataset.drink==='1')[f.elements.food.value];f.elements.measure.innerHTML=food?options([['g','Gramos'],...(food.liquid?[['ml','Mililitros (aprox.)']]:[]),...Object.keys(food.measures).map(k=>[k,k])],food.liquid?'ml':'g'):'';previewItem();}
function previewItem(){const f=dialog.querySelector('form'),food=foodCatalog(f.dataset.drink==='1')[f.elements.food.value];try{const ent=E.itemEntry(food,+f.elements.qty.value,f.elements.measure.value,0);$('#item-preview').innerHTML=nutrient(E.sum([ent.n]));}catch{$('#item-preview').textContent='Elegí un alimento y una cantidad para ver la estimación.';}}
const nutritionFields=()=>names.map((x,i)=>field('n'+i,x+' ('+units[i]+')','',num(.01,0,10000))).join('');
function customDialog(){
 show('Registrar una comida diferente','<form data-form="custom" class="stack">'+field('name','Nombre de la comida','','required maxlength="140"')+slots()+field('qty','Porciones consumidas',1,num(.25,.25,30)+' required')+'<p class="muted">Si conocés los valores por porción, ingresalos acá. Los campos vacíos quedan como no disponibles.</p><div class="form-grid">'+nutritionFields()+'</div><button class="btn primary">Guardar comida</button></form>');
}
function catalogDialog(id=''){
 const f=s.catalog[id];
 show('Catálogo editable','<p class="muted">Agregá alimentos de tu etiqueta o fuente de confianza. Los valores son por 100 g (o por 100 ml en bebidas).</p>'+(Object.keys(s.catalog).length?'<ul class="rows">'+Object.entries(s.catalog).map(([k,x])=>'<li><strong>'+esc(x.name)+'</strong>'+action('catalog','Editar','btn text','data-id="'+esc(k)+'"')+action('catalog-delete','Quitar','btn text','data-id="'+esc(k)+'"')+'</li>').join('')+'</ul>':'')+'<form data-form="catalog" data-id="'+esc(id)+'" class="stack">'+field('name','Nombre',f?.name,'required maxlength="140"')+'<label class="check"><input type="checkbox" name="liquid" '+(f?.liquid?'checked':'')+'> Es una bebida (ml ≈ g para el cálculo)</label><div class="form-grid">'+names.map((x,i)=>field('n'+i,x+' ('+units[i]+')',f?.n[i],num(.01,0,10000))).join('')+field('label','Medida casera (opcional)',Object.keys(f?.measures??{})[0],'maxlength="50" placeholder="Ej. rebanada"')+field('grams','Gramos por medida',Object.values(f?.measures??{})[0],num(.01,.01,10000))+'</div><button class="btn primary">'+(f?'Guardar cambios':'Agregar al catálogo')+'</button></form>');
}
function duration(session){return Number(s.profile.minutes)||session.min;}
const taiPhases=['Inicio','Movimiento','Final'];
function taiMove(id,i){
 const frames=T.frames(id,chair);
 const demo=T.demonstration(id,chair);
 const resource=demo
  ? '<div class="tai-resource"><p><strong>Tramo sugerido '+esc(demo.range)+'</strong> · '+(chair?'En silla':'De pie')+'</p><p>'+esc(demo.note)+'</p><a class="btn primary" href="'+esc(demo.url)+'" target="_blank" rel="noopener noreferrer">Ver demostración en video</a><p class="muted"><a href="'+esc(T.source)+'" target="_blank" rel="noopener noreferrer">Torbay and South Devon NHS Foundation Trust</a> · Título en inglés, sin narración. Requiere conexión.</p></div>'
  : '<p class="muted tai-resource">Demostración específica pendiente.</p>';
 return '<article class="card pad tai-move" data-move="'+id+'"><span class="kicker">MOVIMIENTO '+(i+1)+'</span><h3>'+esc(C.movements[id][0])+'</h3><ol class="tai-sequence">'+frames.map(({text},j)=>'<li class="tai-frame"><div class="tai-frame-text"><h4><span>'+(j+1)+'</span> '+taiPhases[j]+'</h4><p>'+esc(text)+'</p></div></li>').join('')+'</ol>'+resource+'</article>';
}
function tai(){
 const t=C.sessions[selected-1],d=day();
 return heading('MOVIMIENTO SUAVE','Taichí','Prácticas breves para principiantes, con una versión en silla.')+section('Práctica '+selected+' de 30',dayPicker())+
 '<section class="card pad tai-banner"><div><span class="kicker">'+duration(t)+' MIN · '+(chair?'EN SILLA':'DE PIE')+'</span><h2>'+esc(t.name)+'</h2><p>Respirá con naturalidad, sin retener el aire ni forzar el ritmo. Hacé movimientos pequeños y pausá cuando lo necesites.</p><div class="button-row">'+action('chair',chair?'Ver de pie':'Ver en silla')+action('tai-done',d.done?'✓ Completada · desmarcar':'Marcar como completada','btn primary')+'</div></div></section>'+
 '<p class="notice">Elegí un piso despejado y usá una silla firme, sin ruedas. Frená si aparece dolor, mareo o pérdida del equilibrio. Si tenés limitaciones médicas o de equilibrio, consultá antes de empezar. La práctica no reemplaza las indicaciones de actividad de tu equipo de salud.</p>'+
 '<p class="muted tai-key">La guía escrita funciona sin conexión. Si hay video, mirá solo el tramo señalado: la demostración no reemplaza la práctica del día.</p>'+
 '<div class="tai-moves">'+[...t.moves,...(t.moves.at(-1)==='cierre'?[]:['cierre'])].map(taiMove).join('')+'</div>';
}
function lineChart(values,label){
 const nums=values.filter(v=>v!==null);
 if(!nums.length)return empty('Todavía no hay registros para este gráfico.');
 const min=Math.min(...nums),max=Math.max(...nums),lo=min===max?min-1:min,hi=min===max?max+1:max;
 const x=i=>25+i*520/29,y=v=>104-(v-lo)/(hi-lo)*82;
 const dots=values.flatMap((v,i)=>v===null?[]:[[x(i),y(v),v,i]]);
 return '<svg class="chart" viewBox="0 0 570 135" role="img" aria-label="'+esc(label)+': '+dots.map(([, ,v,i])=>'día '+(i+1)+', '+fmt(v)).join('; ')+'"><path d="M25 22H545M25 63H545M25 104H545" class="gridline"/><polyline points="'+dots.map(([a,b])=>a+','+b).join(' ')+'" class="trend"/>'+dots.map(([a,b,v,i])=>'<circle cx="'+a+'" cy="'+b+'" r="4"><title>Día '+(i+1)+' · '+fmt(v)+'</title></circle>').join('')+'<text x="25" y="126">Día 1</text><text x="510" y="126">Día 30</text></svg>';
}
function calendarTrack(label,predicate){return '<div class="track"><span>'+label+'</span><div>'+Array.from({length:30},(_,i)=>'<span class="'+(predicate(E.getDay(cycle(),i+1))?'on':'')+'" title="Día '+(i+1)+': '+(predicate(E.getDay(cycle(),i+1))?'con registro':'sin registro')+'"></span>').join('')+'</div></div>';}
function evolution(){
 const days=Array.from({length:30},(_,i)=>E.getDay(cycle(),i+1));
 const data=days.map(E.totals), n=Number(main.dataset.chart||0);
 const cy=cycle(), glucose=Object.entries(cy.days).sort((a,b)=>+b[0]-+a[0]).flatMap(([i,d])=>d.glucose.map(g=>[i,g]));
 const done=days.filter(d=>d.done||d.activity).length;
 return heading('SEGUIMIENTO','Mi evolución','Consultá tus registros del ciclo. Podés anotar el peso semanalmente o cuando lo prefieras.')+
 '<div class="toolbar">'+cycleSelect()+dayPicker()+'</div><div class="journal-grid">'+
 '<section class="card pad"><h2>Peso registrado</h2>'+lineChart(days.map(d=>d.weight),'Peso en kg')+
 '<form data-form="weight" class="inline">'+field('weight','Peso del día '+selected+' (kg)',day().weight,num(.1,.1,1000)+' required')+'<button class="btn secondary">Guardar peso</button></form>'+(weights(cy).length?'<details><summary>Ver registros de peso</summary><ul class="rows">'+weights(cy).map(([i,d])=>'<li><span>Día '+i+' · '+date(E.offset(cy.start,+i-1))+' · '+fmt(d.weight)+' kg</span>'+action('remove-weight','Quitar','btn text','data-day="'+i+'"')+'</li>').join('')+'</ul></details>':'')+'</section>'+
 '<section class="card pad"><h2>Nutrientes registrados</h2><label>Mostrar<select data-control="chart">'+options(names.map((x,i)=>[i,x+' ('+units[i]+')']),n)+'</select></label>'+lineChart(data.map(x=>x.values[n]),names[n]+' en '+units[n])+'<p class="muted">Los puntos muestran los valores disponibles. '+(data.some(x=>x.missing[n])?'Hay días con totales parciales.':'Los días sin datos no tienen punto.')+'</p></section></div>'+
 '<section class="card pad spaced"><h2>Hábitos del ciclo</h2>'+calendarTrack('Comidas · '+countDays(cy)+' días',d=>d.entries.some(e=>e.kind!=='drink'))+calendarTrack('Actividad · '+done+' días',d=>d.done||d.activity)+calendarTrack('Días con algún registro',d=>d.entries.length||d.water||d.done||d.activity||d.weight!==null||d.glucose.length||d.note)+'<p class="muted">Cada cuadrado representa un día. Los verdes señalan registros.</p><form data-form="activity" class="inline">'+field('activity','Otra actividad · Día '+selected,day().activity,'maxlength="200" placeholder="Ej. Caminata suave, 15 min"')+'<button class="btn secondary">Guardar actividad</button></form></section>'+
 '<section class="card pad spaced"><h2>Glucemia, si la medís</h2><p class="muted">Guardá tus mediciones de referencia en mg/dl. La app no interpreta resultados ni indica cambios de medicación.</p><form data-form="glucose" class="form-grid">'+field('value','Medición del día '+selected+' (mg/dl)','',num(1,1,2000)+' required')+select('context','Momento',[['En ayunas','En ayunas'],['Después de comer','Después de comer']])+field('timing','Hora o tiempo desde la comida','','maxlength="120" placeholder="Ej. 2 h después"')+'<button class="btn secondary">Agregar medición</button></form>'+(glucose.length?'<ul class="rows">'+glucose.map(([i,g])=>'<li><div><strong>'+fmt(g.value)+' mg/dl</strong><small>Día '+i+' · '+esc(g.context)+(g.timing?' · '+esc(g.timing):'')+'</small></div>'+action('remove-glucose','Quitar','btn text','data-day="'+i+'" data-id="'+esc(g.id)+'"')+'</li>').join('')+'</ul>':'')+'</section>';
}
function shopping(){
 const rows=E.weekShopping(cycle(),week,cookingPeople());
 return heading('ORGANIZACIÓN SEMANAL','Lista de compras','Se genera con el menú vigente. Las colaciones opcionales quedan fuera; podés agregarlas a mano.')+
 '<div class="toolbar"><label>Semana del ciclo<select data-control="week">'+options(Array.from({length:5},(_,i)=>[i,'Semana '+(i+1)+' · días '+(i*7+1)+'–'+Math.min(i*7+7,30)]),week)+'</select></label>'+pill('Para '+cookingPeople()+' persona(s)')+action('shop-edit','＋ Agregar producto','btn primary')+'</div>'+
 '<div class="shop-grid">'+C.categories.map((cat,i)=>{const list=rows.filter(x=>x.cat===i);return '<section class="card pad"><h2>'+cat+'</h2>'+(list.length?'<ul class="rows">'+list.map(x=>'<li><label class="check"><input type="checkbox" data-control="shop-check" data-id="'+esc(x.id)+'" '+(x.checked?'checked':'')+'><span>'+esc(x.name)+'<small>'+fmt(x.qty)+' '+esc(x.unit)+'</small></span></label>'+action('shop-edit','Editar','btn text','data-id="'+esc(x.id)+'"')+'</li>').join('')+'</ul>':empty('Sin ingredientes para esta categoría.'))+'</section>';}).join('')+'</div>'+
 '<p class="muted">Pesos comestibles; las legumbres y el arroz que dicen «cocido» figuran en ese estado. Las cantidades editadas se mantienen hasta restaurarlas.</p>'+action('shop-reset','Restaurar lista de la semana','btn subtle');
}
function cycleSelect(){return '<label>Ciclo<select data-control="cycle">'+options(s.cycles.map(c=>[c.id,'Desde el '+date(c.start,true)]),s.active)+'</select></label>';}
function profile(){
 const p=s.profile;
 return heading('PREFERENCIAS Y PRIVACIDAD','Mi perfil','Completá lo que te sea útil. Solo se guarda en este navegador.')+
 '<section class="card pad"><h2>Datos personales</h2><form data-form="profile" class="stack" autocomplete="off"><div class="form-grid">'+field('weight','Peso inicial (kg)',p.weight,num(.1,.1,1000))+field('height','Estatura (cm)',p.height,num(.1,1,300))+field('age','Edad',p.age,num(1,18,120))+field('country','País',p.country,'maxlength="100"')+field('diagnosis','Diagnóstico informado',p.diagnosis,'maxlength="200"')+field('medicine','Medicación informada',p.medicine,'maxlength="200"')+'</div><h3>Preferencias</h3><div class="form-grid">'+ta('preferences','Preferencias alimentarias',p.preferences)+ta('dislikes','Alimentos que no te gustan',p.dislikes)+ta('allergies','Alergias o intolerancias',p.allergies)+field('people','Personas para cocinar',p.people,num(1,1,30)+' placeholder="1 si lo dejás vacío"')+field('cook','Tiempo para cocinar (min)',p.cook,num(1,1,600))+select('activity','Nivel de actividad',[['','Sin especificar'],['Bajo','Bajo'],['Moderado','Moderado'],['Alto','Alto']],p.activity)+field('minutes','Taichí · duración preferida (min)',p.minutes,num(1,2,15)+' placeholder="Usar duración de cada sesión"')+'</div><p class="muted">Las preferencias quedan como referencia al elegir recetas. El menú no filtra alérgenos: revisá los ingredientes antes de cocinar. La cantidad de personas ajusta las recetas y compras.</p><button class="btn primary">Guardar perfil</button></form></section>'+
 '<section class="card pad spaced"><h2>Ciclos del programa</h2><div class="toolbar">'+cycleSelect()+'</div><form data-form="start" class="inline">'+field('start','Fecha de inicio del ciclo',cycle().start,'type="date" required')+'<button class="btn secondary">Cambiar fecha</button></form><form data-form="new-cycle" class="inline">'+field('start','Inicio de un ciclo nuevo',E.iso(),'type="date" required')+'<button class="btn secondary">Empezar nuevo ciclo</button></form><p class="muted">Los ciclos anteriores quedan disponibles. Si cambiás la fecha de un ciclo, sus registros siguen asociados al mismo número de día.</p></section>'+
 '<section class="card pad spaced"><h2>Copia de seguridad</h2><p>La copia contiene tus registros y datos de salud. Guardala en un lugar privado. Al importar se reemplaza lo guardado en esta app.</p><div class="button-row">'+action('export','Exportar respaldo','btn secondary')+'<label class="btn secondary file-label">Elegir archivo para importar<input type="file" data-control="import" accept=".json,application/json"></label></div></section>';
}
function sources(){return heading('TRANSPARENCIA','Fuentes y privacidad','Cómo se calcula la información y dónde se guardan tus registros.')+'<section class="card pad prose"><h2>Comidas y estimaciones</h2><p>El menú orientativo combina ingredientes comunes según las <a href="https://www.argentina.gob.ar/sites/default/files/bancos/2020-08/guias-alimentarias-para-la-poblacion-argentina.pdf" rel="noreferrer">Guías Alimentarias para la Población Argentina</a> y los criterios generales de <a href="https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html" rel="noreferrer">planificación de comidas de los CDC</a>. Las porciones son referencias culinarias; no hay objetivos de calorías ni de peso.</p><p>Las estimaciones suman energía, carbohidratos totales, proteínas, grasas y fibra de los ingredientes por 100 g de <a href="https://fdc.nal.usda.gov/download-datasets/" rel="noreferrer">USDA FoodData Central, SR Legacy 2018-04</a>. Varían según marca, corte, cocción y rendimiento. Las cantidades son de parte comestible en el estado indicado. Para merluza se usa pescado blanco (whiting) como aproximación; para bebidas la conversión ml a g es aproximada. Las medidas caseras son orientativas. Los datos faltantes aparecen como «—» o «parcial». El mate cebado queda sin datos comparables. El bowl nuevo agrega portobellos y mozzarella de USDA SR28; sus fichas originales están enlazadas a continuación.</p><details><summary>Ver fichas originales por alimento</summary><ul>'+Object.values(F).filter(f=>f.fdc||f.source).map(f=>'<li><a rel="noreferrer" href="'+esc(f.source??('https://fdc.nal.usda.gov/food-details/'+f.fdc+'/nutrients'))+'">'+esc(f.name)+'</a> · '+esc(f.description)+'</li>').join('')+'</ul></details><p>Los consejos de cocción y sobras se apoyan en <a href="https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures" rel="noreferrer">FoodSafety.gov</a>.</p><h2>Taichí</h2><p>Las secuencias son prácticas suaves inspiradas en movimientos básicos. Consultá la <a href="https://www.nccih.nih.gov/health/tai-chi-what-you-need-to-know" rel="noreferrer">guía del NCCIH sobre taichí y seguridad</a>. No sustituyen el seguimiento profesional ni son un tratamiento por sí solas.</p><h2>Tus datos</h2><p>No hay cuentas, analítica ni conexión a servidores para guardar registros. Se usa el almacenamiento local del navegador, separado por dirección y navegador. Si borrás los datos del sitio, perdés lo guardado. Exportá un respaldo antes de cambiar de navegador, dirección o dispositivo. Los enlaces de fuentes solo se abren al elegirlos.</p></section>';}
const pages={inicio:home,plan,recetas:recipes,diario:journal,taichi:tai,evolucion:evolution,compras:shopping,perfil:profile,fuentes:sources};
let route='';
function render(){
 const hash=location.hash.slice(1);
 route=Object.hasOwn(pages,hash)?hash:'inicio';
 const content=pages[route]();
 $('#nav').innerHTML=nav.map(([p,i,t])=>'<a href="#'+p+'" '+(route===p?'aria-current="page"':'')+'><span aria-hidden="true">'+i+'</span>'+t+'</a>').join('');
 $('#top-date').textContent=date(E.iso(),true);
 // Reemplazar el aviso de arranque solo una vez que la página esté lista.
 main.innerHTML=content;
}
function goDay(n){selected=Math.min(30,Math.max(1,+n));render();}
function editShop(id){
 const x=E.weekShopping(cycle(),week,cookingPeople()).find(a=>a.id===id);
 show(x?'Editar producto':'Agregar producto','<form data-form="shop" data-id="'+esc(id)+'" class="stack">'+(x&&!x.custom?'<strong>'+esc(x.name)+'</strong>':field('name','Producto',x?.name,'required maxlength="140"'))+'<div class="form-grid">'+field('qty','Cantidad',x?.qty,num(.01,0,10000000)+' required')+(x&&!x.custom?'<p>Unidad: g</p>':field('unit','Unidad',x?.unit??'g','maxlength="30" required')+select('cat','Categoría',C.categories.map((v,i)=>[i,v]),x?.cat??5))+'</div><button class="btn primary">Guardar producto</button>'+(x?action('shop-hide','Quitar de la lista','btn text','data-id="'+esc(id)+'"'):'')+'</form>');
}
const shopMap=()=>cycle().shopping[week]??(cycle().shopping[week]={});
const buttons={
 prev:()=>goDay(selected-1),next:()=>goDay(selected+1),calendar:b=>goDay(b.dataset.day),close,
 recipe:b=>recipeDialog(b.dataset.id,cookingPeople(),b.dataset.slot!==undefined&&!!cycle().mealOptions?.[selected]?.[b.dataset.slot]?.mozzarella),
 'photo-zoom':b=>{
  const id=b.dataset.id;
  if(!photos[id])return;
  const serves=Number(dialog.querySelector('[name="serves"]')?.value)||cookingPeople();
  const withMozzarella=dialog.querySelector('[name="mozzarella"]')?.checked;
  show(esc(R[id].name),foodArt(R[id],'large')+action('photo-back','← Volver a la receta','btn secondary','data-id="'+id+'" data-serves="'+serves+'" data-mozzarella="'+(withMozzarella?'1':'0')+'"'));
  dialog.querySelector('[data-action="photo-back"]')?.focus();
 },
 'photo-back':b=>{
  recipeDialog(b.dataset.id,Number(b.dataset.serves),b.dataset.mozzarella==='1');
  dialog.querySelector('[data-action="photo-zoom"]')?.focus();
 },
 swap:b=>{const i=+b.dataset.slot, list=Object.values(R).filter(r=>E.matches(r,i));show('Cambiar '+C.slots[i].toLowerCase(),'<form data-form="swap" data-slot="'+i+'" class="stack">'+select('recipe','Elegí una receta',list.map(r=>[r.id,r.name+' · '+r.min+' min']),E.menu(cycle(),selected)[i])+'<div id="swap-options">'+optionalCheckbox(R[E.menu(cycle(),selected)[i]],cycle().mealOptions?.[selected]?.[i]?.mozzarella)+'</div><p class="muted">Los registros de lo que ya comiste se conservan.</p><button class="btn primary">Actualizar menú</button>'+action('swap-reset','Restaurar receta original','btn text','data-slot="'+i+'"')+'</form>');},
 'swap-reset':b=>{delete cycle().swaps[selected]?.[b.dataset.slot];if(cycle().mealOptions?.[selected])delete cycle().mealOptions[selected][b.dataset.slot];close();commit('Se restauró el menú original.');},
 'more-recipes':()=>{recipeLimit+=12;$('#recipe-results').innerHTML=renderRecipeCards();},
 water:()=>{edit().water+=250;commit('Agregaste 250 ml de agua.');},
 'undo-water':()=>show('Restar agua','<form data-form="undo-water" class="inline">'+field('ml','Cantidad (ml)',250,num(1,1,10000)+' required')+'<button class="btn secondary">Restar del registro</button></form>'),
 food:()=>foodDialog(),drink:()=>foodDialog(true),custom:customDialog,catalog:b=>catalogDialog(b.dataset.id),
 'catalog-delete':b=>{delete s.catalog[b.dataset.id];commit('Se quitó del catálogo.');catalogDialog();},
 'remove-entry':b=>{const d=edit();d.entries=d.entries.filter(e=>e.id!==b.dataset.id);commit('Entrada eliminada.');},
 chair:()=>{chair=!chair;render();},
 'tai-done':()=>{const d=edit();d.done=!d.done;commit(d.done?'Práctica registrada.':'Práctica desmarcada.');},
 'remove-weight':b=>{E.editDay(cycle(),+b.dataset.day).weight=null;commit('Se quitó el peso registrado.');},
 'remove-glucose':b=>{const d=E.editDay(cycle(),+b.dataset.day);d.glucose=d.glucose.filter(g=>g.id!==b.dataset.id);commit('Medición eliminada.');},
 'shop-edit':b=>editShop(b.dataset.id??''),
 'shop-hide':b=>{const k=b.dataset.id,m=shopMap();if(m[k]?.custom)delete m[k];else m[k]={...m[k],hidden:true};close();commit('Se quitó el producto.');},
 'shop-reset':()=>show('Restaurar la lista','<p>Se borrarán las marcas y los cambios de esta semana para regenerarla a partir del menú.</p><form data-form="shop-reset"><button class="btn primary">Restaurar esta semana</button></form>'),
 export:()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([E.snapshot(s)],{type:'application/json'}));a.href=url;a.download='mi-bienestar-respaldo-'+E.iso()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Respaldo preparado.');}
};
function grab(fd){return Object.fromEntries(fd.entries());}
const readN=x=>names.map((_,i)=>x['n'+i]===''?null:+x['n'+i]);
let pendingImport,pendingStart;
const forms={
 serves:(x,f)=>recipeDialog(f.dataset.id,+x.serves,x.mozzarella==='on'),
 swap:(x,f)=>{E.change(cycle(),selected,+f.dataset.slot,x.recipe,x.mozzarella==='on');close();commit('Menú actualizado.');},
 planned:x=>{const slot=+x.slot,r=E.recipeVariant(R[E.menu(cycle(),selected)[slot]],x.mozzarella==='on');if(!r)throw Error('Elegí un momento con una receta planificada.');edit().entries.push(E.recipeEntry(r,+x.servings,slot));commit('Comida registrada.');},
 'recipe-log':(x,f)=>{const r=E.recipeVariant(R[f.dataset.id],x.mozzarella==='on'),entry=E.recipeEntry(r,+x.servings,+x.slot);entry.kind='custom';edit().entries.push(entry);close();commit('Comida registrada en el diario.');},
 water:x=>{edit().water+=+x.ml;commit('Agua registrada.');},
 'undo-water':x=>{edit().water=Math.max(0,day().water-(+x.ml));close();commit('Agua actualizada.');},
 note:x=>{edit().note=x.note;commit('Observaciones guardadas.');},
 item:(x,f)=>{const drink=f.dataset.drink==='1',food=foodCatalog(drink)[x.food];if(!food)throw Error('Elegí un alimento.');edit().entries.push(E.itemEntry({...food,water:x.food==='agua'},+x.qty,x.measure,+x.slot,drink?'drink':'food'));close();commit('Entrada registrada.');},
 custom:x=>{if(!x.name.trim())throw Error('Escribí un nombre para la comida.');edit().entries.push({id:E.id(),name:x.name.trim(),detail:x.qty+' porción(es)',kind:'custom',slot:+x.slot,n:E.scale(readN(x),+x.qty)});close();commit('Comida registrada.');},
 catalog:(x,f)=>{const a=x.label.trim();if(!x.name.trim()||Boolean(a)!==Boolean(x.grams)||['g','ml','__proto__','constructor','prototype'].includes(a))throw Error('Revisá el nombre y los dos campos de la medida casera.');s.catalog[f.dataset.id||E.id()]={name:x.name.trim(),n:readN(x),liquid:x.liquid==='on',measures:a?{[a]:+x.grams}:{}};commit('Catálogo actualizado.');catalogDialog();},
 weight:x=>{edit().weight=+x.weight;commit('Peso registrado.');},
 activity:x=>{edit().activity=x.activity;commit('Actividad guardada.');},
 glucose:x=>{edit().glucose.push({id:E.id(),value:+x.value,context:x.context,timing:x.timing});commit('Medición registrada.');},
 profile:x=>{s.profile={...x,people:x.people===''?'':+x.people};commit('Perfil guardado.');},
 start:x=>{if(!E.validDate(x.start))throw Error('Elegí una fecha válida.');pendingStart={id:cycle().id,start:x.start};show('Confirmar fecha de inicio','<p>El ciclo irá del '+date(x.start,true)+' al '+date(E.offset(x.start,29),true)+'. Tus registros seguirán asociados al mismo número de día.</p><form data-form="confirm-start"><button class="btn primary">Confirmar cambio de fecha</button></form>');},
 'confirm-start':()=>{if(!pendingStart||pendingStart.id!==cycle().id)return;cycle().start=pendingStart.start;pendingStart=null;selected=today();close();commit('Fecha de inicio actualizada.');},
 'new-cycle':x=>{if(!E.validDate(x.start))throw Error('Elegí una fecha válida.');const c=E.freshCycle(x.start);s.cycles.push(c);s.active=c.id;selected=today();week=0;commit('Nuevo ciclo creado.');},
 shop:(x,f)=>{const k=f.dataset.id||E.id(),m=shopMap();m[k]={...m[k],qty:+x.qty};if(x.name!==undefined){if(!x.name.trim()||!x.unit.trim())throw Error('Ingresá un nombre y una unidad.');Object.assign(m[k],{id:k,name:x.name.trim(),unit:x.unit.trim(),cat:+x.cat,custom:true});}close();commit('Lista actualizada.');},
 'shop-reset':()=>{delete cycle().shopping[week];close();commit('Lista restaurada.');},
 import:()=>{if(!pendingImport)return;s=pendingImport;pendingImport=null;selected=today();week=Math.floor((selected-1)/7);close();commit('Respaldo importado.');}
};
document.addEventListener('error',e=>{
 const img=e.target;
 if(!img.matches?.('img.dish-image'))return;
 const figure=img.closest('[data-dish-photo]');
 if(!figure)return;
 img.hidden=true;
 figure.querySelector('.dish-fallback').hidden=false;
 const caption=figure.querySelector('figcaption');
 if(caption)caption.hidden=true;
},true);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');
 if(b&&Object.hasOwn(buttons,b.dataset.action)){try{buttons[b.dataset.action](b);}catch(err){toast(err.message);}return;}
 if(dialog.open&&e.target.closest('a[href^="#"]'))close();
});
document.addEventListener('submit',e=>{
 const f=e.target,k=f.dataset.form;
 if(!Object.hasOwn(forms,k))return;e.preventDefault();
 try{forms[k](grab(new FormData(f)),f);}catch(err){toast(err.message);}
});
document.addEventListener('input',e=>{
 const t=e.target,k=t.dataset.control;
 if(k==='recipe-search'){recipeFilter=t.value;recipeLimit=12;$('#recipe-results').innerHTML=renderRecipeCards();}
 if(k==='food-search'){const f=t.form;f.elements.food.innerHTML=options(listFoods(f.dataset.drink==='1',t.value).map(([i,v])=>[i,v.name]));setMeasures();}
 if(t.form?.dataset.form==='serves'&&t.validity.valid)dialog.querySelectorAll('[data-grams]').forEach(x=>{x.textContent=ingredientAmount(x.dataset.food,Number(x.dataset.grams)*Number(t.value),x.dataset.unit);});
 if(t.form?.dataset.form==='item'&&t.name==='qty')previewItem();
});
document.addEventListener('change',async e=>{
 const t=e.target,k=t.dataset.control;
 if(k==='recipe-mozzarella')recipeDialog(t.form.dataset.id,Number(t.form.elements.serves.value),t.checked);
 if(t.form?.dataset.form==='planned'&&t.name==='slot'){
  const slot=Number(t.value),r=R[E.menu(cycle(),selected)[slot]];
  $('#planned-optional').innerHTML=optionalCheckbox(r,cycle().mealOptions?.[selected]?.[slot]?.mozzarella);
 }
 if(t.form?.dataset.form==='swap'&&t.name==='recipe')$('#swap-options').innerHTML=optionalCheckbox(R[t.value]);
 if(k==='day')goDay(t.value);
 if(k==='recipe-type'){recipeType=t.value;recipeLimit=12;$('#recipe-results').innerHTML=renderRecipeCards();}
 if(k==='food-id')setMeasures();
 if(t.form?.dataset.form==='item'&&t.name==='measure')previewItem();
 if(k==='cycle'){s.active=t.value;selected=today();week=Math.floor((selected-1)/7);commit();}
 if(k==='week'){week=+t.value;render();}
 if(k==='chart'){main.dataset.chart=t.value;render();}
 if(k==='shop-check'){const m=shopMap(),i=t.dataset.id;m[i]={...m[i],checked:t.checked};save();}
 if(k==='import'&&t.files[0]){try{
  if(t.files[0].size>10000000)throw Error('El respaldo supera los 10 MB.');
  pendingImport=E.parse(await t.files[0].text());
  show('Importar respaldo','<p>Archivo válido con '+pendingImport.cycles.length+' ciclo(s). Si continuás, reemplazará los datos de esta aplicación en el navegador.</p><form data-form="import"><button class="btn primary">Confirmar importación</button></form>');
 }catch(err){toast('No se pudo importar: '+err.message);}t.value='';}
});
window.addEventListener('hashchange',()=>{if(dialog.open)close();render();window.scrollTo(0,0);main.focus({preventScroll:true});});
render();
})();
