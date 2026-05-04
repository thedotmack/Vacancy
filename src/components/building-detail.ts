/**
 * Phase 2 stub for the building detail overlay.
 *
 * Phase 3 owns the real implementation of this module — it will REPLACE
 * this file wholesale. Do not extend the stub: any work on the overlay
 * belongs in Phase 3.
 *
 * The forward import contract is:
 *   export function mountBuildingDetail(gate: string): void;
 *   export function unmountBuildingDetail(): void;
 *
 * Until Phase 3 ships, mount is a no-op (logs to console for visibility)
 * and unmount is a no-op.
 */

export function mountBuildingDetail(gate: string): void {
  // Phase 3 will render the detail overlay here.
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('[phase-2 stub] mountBuildingDetail', gate);
  }
}

export function unmountBuildingDetail(): void {
  // Phase 3 will tear down the detail overlay here.
}
