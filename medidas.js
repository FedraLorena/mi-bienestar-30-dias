(() => {
 // Referencias de cocina, separadas del catálogo editable y de la nutrición.
 // Cada entrada: gramos por medida, singular, plural, preparación, fracción.
 const cup=(g,state='')=>[g,'taza','tazas',state,8];
 const spoon=(g,state='rasa')=>[g,'cucharada','cucharadas',state,4];
 const tsp=(g,state='rasa')=>[g,'cucharadita','cucharaditas',state,8];
 const unit=(g,one,many,state='')=>[g,one,many,state,4];
 const table={
  aceite:tsp(4.5,''), agua:cup(240,'de 240 ml'), ajo:unit(3,'diente','dientes'),
  acelga:cup(36,'de hojas crudas, sin compactar'), arrozC:cup(195,'de arroz cocido'),
  atun:spoon(15,'de atún escurrido'), avena:spoon(6,'rasa de avena seca'),
  banana:unit(118,'banana mediana','bananas medianas','sin cáscara'),
  batata:unit(130,'batata de referencia','batatas de referencia','en crudo'),
  brocoli:cup(91,'de brócoli crudo picado'), canela:tsp(2.6),
  cebolla:unit(110,'cebolla mediana','cebollas medianas'),
  chia:spoon(12,'rasa'), durazno:unit(150,'durazno mediano','duraznos medianos','sin carozo'),
  espinaca:cup(30,'de hojas crudas, sin compactar'), frutilla:cup(152,'de frutillas en mitades'),
  garbanzo:cup(164,'de garbanzos cocidos y escurridos'), harina:spoon(8,'rasa, sin compactar'),
  huevo:unit(50,'huevo grande','huevos grandes','sin cáscara'),
  leche:cup(244), lechuga:cup(36,'de hojas crudas picadas'),
  lenteja:cup(198,'de lentejas cocidas y escurridas'), limon:tsp(5,'de jugo'),
  mandarina:unit(88,'mandarina mediana','mandarinas medianas','sin cáscara'),
  mani:spoon(9,''), manzana:unit(182,'manzana mediana','manzanas medianas','sin centro'),
  morron:unit(119,'morrón mediano','morrones medianos','sin semillas'),
  naranja:unit(131,'naranja mediana','naranjas medianas','sin cáscara'),
  nuez:unit(2,'mitad de nuez','mitades de nuez'),
  oregano:tsp(1), palta:unit(150,'palta de referencia','paltas de referencia','sin piel ni carozo'),
  pan:unit(32,'rebanada','rebanadas','de pan integral'),
  papa:unit(173,'papa mediana','papas medianas','en crudo'),
  pepino:cup(104,'de pepino crudo en rodajas'), pera:unit(178,'pera mediana','peras medianas','sin centro'),
  pimenton:tsp(2.3), poroto:cup(172,'de porotos cocidos y escurridos'),
  repollo:cup(70,'de repollo crudo rallado'), ricota:spoon(14,'de queso cottage'),
  tomate:unit(91,'tomate chico','tomates chicos','en crudo'),
  tomatera:spoon(15,'de salsa'), vinagre:tsp(5,''), yogur:cup(245),
  zanahoria:unit(61,'zanahoria mediana','zanahorias medianas','en crudo'),
  zapallito:unit(196,'zucchini mediano','zucchinis medianos','en crudo'),
  zapallo:cup(140,'de zapallo crudo en cubos'),mozzarella:spoon(7,'de mozzarella rallada')
 };
 const omitted={
  pollo:'El peso de la pechuga cambia según el corte.',
  carne:'El volumen cambia según cuánto se compacte la carne picada.',
  pescado:'El peso de cada filete cambia según el corte y el grosor.',
  pasta:'El volumen en seco cambia según la forma de los fideos.',
  portobello:'El tamaño de cada portobello varía; no se asume un número de unidades.'
 };
 const fractions={3:'⅛',6:'¼',8:'⅓',9:'⅜',12:'½',15:'⅝',16:'⅔',18:'¾',21:'⅞'};
 function measure(id,grams){
  const row=table[id];
  if(!row||!Number.isFinite(grams)||grams<=0)return '';
  let [g,singular,plural,state,res]=row;
  if(id==='aceite')res=4;
  if(id==='nuez'||id==='ajo')res=2;
  const amount=grams/g;
  // Las cantidades pequeñas de líquidos se leen mejor en cucharadas medidoras.
  if(['leche','agua','yogur'].includes(id)&&amount<0.375){
   const small=spoon(g/16,'');
   [g,singular,plural,state,res]=small;
  }
  const exact=grams/g*24;
  const grid=res===8?[0,3,6,8,9,12,15,16,18,21,24]:res===4?[0,6,8,12,16,18,24]:[0,12,24];
  const base=Math.floor(exact/24)*24;
  const rounded=base+grid.reduce((best,n)=>Math.abs(base+n-exact)<Math.abs(base+best-exact)?n:best,0);
  if(rounded<=0||Math.abs(rounded-exact)/exact>.25)return '';
  const whole=Math.floor(rounded/24),rest=rounded%24;
  const amountLabel=whole&&rest?whole+' '+fractions[rest]:String(whole||fractions[rest]);
  const sizeLabel=state?' '+(rounded>24?state.replace(/^rasa\b/,'rasas'):state):'';
  const eggHelp=id==='huevo'&&rest?'; batí el huevo antes de dividirlo':'';
  return amountLabel+' '+(rounded<=24?singular:plural)+sizeLabel+eggHelp;
 }
 globalThis.BIEN_MEASURES={measure,omitted};
})();
