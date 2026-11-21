// Shared, mutable motion flag read by the WebGL loops.
export const motionState = { on: true };

type Recolorable = { recolor: () => void };
export const recolorables = new Set<Recolorable>();
export const recolorAll = () => recolorables.forEach((r) => r.recolor());
