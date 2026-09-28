// Pure updates applied to the latest workshop inside a Firestore transaction.
export function personChange(workshop, role, dni, action) {
  if (!['attendees','trainers'].includes(role) || !['remove','unsigned'].includes(action)) throw new Error('Acción inválida');
  const field = role === 'trainers' ? 'trainerSignatures' : 'assignments';
  const update = {[field]: (workshop[field] || []).filter(person => person.dni !== dni)};
  if (action === 'remove') {
    update[role] = (workshop[role] || []).filter(person => person.dni !== dni);
    if (role === 'attendees') update.numAttendees = update.attendees.length;
  }
  return update;
}

export function seatChange(workshop, seat, action) {
  const capacity = (workshop.rows - (workshop.rowAisles || []).length) * (workshop.cols - (workshop.colAisles || []).length);
  if (!Number.isInteger(seat) || seat < 1 || seat > capacity || !['block','release'].includes(action)) throw new Error('Puesto o acción inválidos');
  const blocked = new Set(workshop.blockedSeats || []);
  if (action === 'block') blocked.add(seat);
  else blocked.delete(seat);
  return {
    assignments: (workshop.assignments || []).filter(person => person.seat !== seat),
    blockedSeats: [...blocked].sort((a,b) => a-b)
  };
}
