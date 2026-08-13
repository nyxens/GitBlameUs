/**
 * FEFO (First-Expired-First-Out) Inventory Queue Manager
 * Ensures oldest viable blood units are dispatched first to prevent expiration waste.
 */
export function sortUnitsForDispatch(units) {
  return [...units].sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  );
}

export function filterViableUnits(units) {
  const now = new Date();
  return units.filter(
    (unit) => unit.status === 'AVAILABLE' && new Date(unit.expirationDate) > now
  );
}
