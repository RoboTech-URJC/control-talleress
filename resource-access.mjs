import { normalizeResourceUrl } from './resource-paths.mjs';
export function visibility(resource) {
  return resource.visibility === undefined ? 'all' : resource.visibility;
}
export function visibleResources(resources = [], role = 'attendee') {
  return resources.filter(r => visibility(r) === 'all' || (role === 'trainer' && visibility(r) === 'trainers'));
}
export function publishResource(workshop, dni, resourceId) {
  if (!(workshop.trainers || []).some(p => p.dni === dni) ||
      !(workshop.trainerSignatures || []).some(p => p.dni === dni && p.signed)) throw new Error('Debes estar inscrito y haber firmado como formador.');
  const resource = (workshop.resources || []).find(r => r.id === resourceId);
  if (!resource || !['trainers','all'].includes(visibility(resource))) throw new Error('El recurso ya no está disponible para formadores.');
  return (workshop.resources || []).map(r => r.id === resourceId ? {...r, visibility:'all'} : r);
}


// Firestore maps may arrive with their keys in a different order on each read.
// Compare values, not JSON serialization; array order still matters.
export function sameResourceValue(a, b) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => sameResourceValue(value, b[index]));
  }
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && sameResourceValue(a[key], b[key]));
}

// Merge independent edits, but never silently overwrite an edit to the same field.
export function mergeResourceChanges(base, draft, current) {
  const equal = sameResourceValue;
  const conflict = () => { throw new Error('Otro usuario ha cambiado este mismo recurso. Tus cambios siguen en el editor; revisa la versión actual antes de sustituirlos.'); };
  if (base.some(r => !r.id)) {
    if (!equal(base,current)) conflict();
    return draft;
  }
  const original = new Map(base.map(r => [r.id,r]));
  const edited = new Map(draft.map(r => [r.id,r]));
  const live = new Map(current.map(r => [r.id,r]));
  const result = [];
  for (const resource of current) {
    const before = original.get(resource.id);
    if (!before) { result.push(resource); continue; }
    const after = edited.get(resource.id);
    if (!after) { if (!equal(before,resource)) conflict(); continue; }
    const merged = {...resource};
    for (const key of new Set([...Object.keys(before),...Object.keys(after)])) {
      if (equal(before[key],after[key])) continue;
      if (!equal(before[key],resource[key]) && !equal(after[key],resource[key])) conflict();
      if (after[key] === undefined) delete merged[key]; else merged[key] = after[key];
    }
    result.push(merged);
  }
  for (const resource of draft) {
    if (!original.has(resource.id)) {
      if (live.has(resource.id)) conflict();
      result.push(resource);
    } else if (!live.has(resource.id) && !equal(original.get(resource.id),resource)) conflict();
  }
  return result;
}

export function validateResourceInput({type,title,url,content,fileUrl}) {
  if (!title.trim()) throw new Error('Escribe un título para el recurso.');
  if (type === 'text' && !content.trim()) throw new Error('Escribe el contenido del texto.');
  if (type === 'link' || type === 'file') normalizeResourceUrl(type === 'file' ? fileUrl : url);
}
