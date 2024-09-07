import { checkRippleElements } from "./modules/ripples.js";

export function initializeModules() {
    console.log("(MODULES) Initializing...");

    checkRippleElements();

    console.log("(MODULES) Done!");
}