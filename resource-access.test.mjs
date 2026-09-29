import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeResourceChanges,validateResourceInput,visibleResources,publishResource} from './resource-access.mjs';
const base = [{id:'one',type:'text',title:'Guía',content:'Contenido',visibility:'trainers'}];
test('preserva publicación del formador mientras admin cambia el título',()=>{
  const draft = [{...base[0],title:'Guía revisada'}];
  assert.deepEqual(mergeResourceChanges(base,draft,[{...base[0],visibility:'all'}]),[{...draft[0],visibility:'all'}]);
  assert.equal(base[0].visibility,'trainers');
});
test('no sobrescribe cambios incompatibles ni elimina un recurso editado por otra persona',()=>{
  assert.throws(()=>mergeResourceChanges(base,[{...base[0],title:'A'}],[{...base[0],title:'B'}]));
  assert.throws(()=>mergeResourceChanges(base,[],[{...base[0],visibility:'all'}]));
  assert.throws(()=>mergeResourceChanges(base,[{...base[0],title:'A'}],[]));
});
test('conserva adiciones simultáneas y acepta eliminaciones sin conflicto',()=>{
  const other = {id:'two',title:'Otro'};
  const added = {id:'three',title:'Nuevo'};
  assert.deepEqual(mergeResourceChanges(base,[...base,added],[...base,other]),[...base,other,added]);
  assert.deepEqual(mergeResourceChanges(base,[],base),[]);
  assert.deepEqual(mergeResourceChanges(base,base,[]),[]);
});
test('recursos antiguos sin id se migran solo si no han cambiado',()=>{
  const legacy = [{title:'Anterior'}];
  assert.deepEqual(mergeResourceChanges(legacy,[{id:'new',title:'Anterior'}],legacy),[{id:'new',title:'Anterior'}]);
  assert.throws(()=>mergeResourceChanges(legacy,[],[{title:'Cambio'}]));
});
test('valida rutas de repositorio, enlaces y campos vacíos',()=>{
  const file = {type:'file',title:'PDF',fileUrl:'archivos/soluciones.pdf'};
  assert.doesNotThrow(()=>validateResourceInput(file));
  assert.throws(()=>validateResourceInput({...file,title:' '}));
  assert.throws(()=>validateResourceInput({...file,fileUrl:''}));
  assert.throws(()=>validateResourceInput({...file,fileUrl:'archivos/../admin.html'}));
  assert.throws(()=>validateResourceInput({type:'text',title:'Nota',content:' '}));
  assert.throws(()=>validateResourceInput({type:'link',title:'Web',url:'javascript:alert(1)'}));
  assert.doesNotThrow(()=>validateResourceInput({type:'link',title:'Web',url:'https://example.org'}));
});
test('visibilidad y publicación restringida en el flujo de formadores',()=>{
  const resources = [...base,{id:'hidden',visibility:'hidden'},{id:'old'}];
  assert.deepEqual(visibleResources(resources).map(r=>r.id),['old']);
  assert.deepEqual(visibleResources(resources,'trainer').map(r=>r.id),['one','old']);
  const workshop = {resources,trainers:[{dni:'T'}],trainerSignatures:[{dni:'T',signed:true}]};
  assert.equal(publishResource(workshop,'T','one')[0].visibility,'all');
  assert.throws(()=>publishResource(workshop,'T','hidden'));
  assert.throws(()=>publishResource({...workshop,trainerSignatures:[]},'T','one'));
});


test('no detecta conflicto al migrar recursos antiguos con claves reordenadas',()=>{
  const original = [{title:'PDF',type:'file',url:'https://example.org/file',description:''}];
  const reread = [{description:'',url:'https://example.org/file',type:'file',title:'PDF'}];
  const draft = [{...original[0],id:'migrated',visibility:'trainers'}];
  assert.deepEqual(mergeResourceChanges(original,draft,reread),draft);
});
test('permite quitar un recurso aunque Firebase reordene sus campos',()=>{
  const original = [{id:'one',title:'Guía',visibility:'all'}];
  const reread = [{visibility:'all',title:'Guía',id:'one'}];
  assert.deepEqual(mergeResourceChanges(original,[],reread),[]);
});
test('el orden de claves anidadas no es un cambio, pero los valores sí',()=>{
  const original = [{id:'one',title:'Guía',metadata:{size:10,mime:'application/pdf'}}];
  const draft = [{...original[0],title:'Guía editada'}];
  const reread = [{metadata:{mime:'application/pdf',size:10},title:'Guía',id:'one'}];
  assert.equal(mergeResourceChanges(original,draft,reread)[0].title,'Guía editada');
  assert.throws(()=>mergeResourceChanges(original,[],[{...reread[0],metadata:{size:11,mime:'application/pdf'}}]));
});
