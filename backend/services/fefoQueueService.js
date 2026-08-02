/**
 * FEFO (First-Expired-First-Out) Inventory Queue Manager
 * Ensures oldest viable blood units are dispatched first to prevent expiration waste.
 */
export class FEFOQueueService {
  static sortUnitsForDispatch(units) {
    return [...units].sort(
      (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );
  }

  static filterViableUnits(units) {
    const now = new Date();
    return units.filter(
      (unit) => unit.status === 'AVAILABLE' && new Date(unit.expirationDate) > now
    );
  }
}
