import { initializeModules } from "../modules.js";
import { otpModal, removeModal } from "./modals.js";

export function updateAccountList() {
    const accountsContainer = document.querySelector(".accounts");

    window.electronAPI.loadAccounts().then(accounts => {
        accountsContainer.innerHTML = "";
        Object.keys(accounts).forEach(name => {
            const accountDiv = document.createElement("div");
            const hasIssuer = accounts[name].issuer;
            const issuerData = hasIssuer ? `<p class="account-issuer">${accounts[name].issuer}</p>` : ""
            accountDiv.toggleAttribute("ripple", true);
            accountDiv.className = "account";
            accountDiv.innerHTML = `
                <div class="account-info">
                    <p class="account-name">${name}</p>
                    ${issuerData}
                </div>
                <div class="account-controls">
                    <button class="delete-button" data-name="${name}" ripple>
                        <span class="fluent-icons">&#xE711</span>
                    </button>
                </div>
            `;
            accountDiv.addEventListener("click", () => {
                otpModal(accounts[name].secret);
            });
            accountsContainer.appendChild(accountDiv);
        });

        document.querySelectorAll(".delete-button").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();
                const accountName = button.getAttribute("data-name");
                
                removeModal(accountName);
            });
        });

        initializeModules();
    });
}