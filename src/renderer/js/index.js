import { updateAccountList } from "./modules/accounts.js";
import { addAccountModal } from "./modules/modals.js";

document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.getElementById("create");
    const minimize = document.getElementById("minimize");
    const quit = document.getElementById("quit");

    createButton.addEventListener("click", () => {
        addAccountModal();
    });

    minimize.addEventListener("click", () => {
        window.electronAPI.minimize();
    });

    quit.addEventListener("click", () => {
        window.electronAPI.quit();
    });

    updateAccountList();
});
