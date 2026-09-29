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
