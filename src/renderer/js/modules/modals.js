import { checkRippleElements } from "./ripples.js";
import { updateAccountList } from "./accounts.js";

function createModal(name, content) {
    const modalContainer = document.createElement("div");
    modalContainer.classList.add("modal-container");

    modalContainer.attachShadow({ mode: "open" });
    modalContainer.shadowRoot.innerHTML = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                user-select: none;
                font-family: "Inter", sans-serif;
                -webkit-font-smoothing: antialiased;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            :host {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, .8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                backdrop-filter: blur(15px);
                opacity: 0;
                animation: fadeIn .15s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            @keyframes modalGrow {
                to {
                    scale: 1;
                }
            }

            .modal {
                background-color: rgb(255, 255, 255, .15);
                border: 1px solid rgba(255, 255, 255, .1);
                border-radius: 10px;
                padding: 20px;
                padding-top: 0;
                min-width: 300px;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                scale: .9;
                animation: modalGrow .35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            .modal-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding-top: 20px;
                padding-bottom: 10px;
                margin-inline: -20px;
                padding-inline: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, .1);
                box-shadow: 0 0 5px rgb(0, 0, 0, .25);
            }

            .modal-title p {
                width: max-content;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break: keep-all;
                white-space: nowrap;
                font-size: 21px;
                font-weight: 500;
            }

            .modal-title button {
                position: relative;
                width: max-content;
                height: max-content;
                background-color: rgb(255, 255, 255, .1);
                border: none;
                padding: 10px 20px;
                border-radius: 999px;
                cursor: pointer;
                transition: background-color .1s cubic-bezier(0.25, 1, 0.5, 1);
            }

            .modal-title button:hover {
                background-color: rgb(255, 255, 255, .2);
            }

            .modal-content {
                padding: 10px;
                padding-top: 20px;
                font-size: 16px;
                font-weight: normal;
                max-height: 400px;
                overflow-y: auto;
            }
        </style>

        <div class="modal">
            <div class="modal-title">
                <p>${name}</p>

                <button ripple>Close</button>
            </div>
            <div class="modal-content"></div>
        </div>
    `;

    const modalContent = modalContainer.shadowRoot.querySelector(".modal-content");

    modalContent.attachShadow({ mode: "open" });
    modalContent.shadowRoot.innerHTML += `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Inter", sans-serif;
                user-select: none;
                -webkit-font-smoothing: antialiased;
            }

            :host {
                display: flex;
                gap: 10px;
            }

            button.modal-button {
                flex: 1 1;
                position: relative;
                background-color: rgb(255, 255, 255, .25);
                border: none;
                padding: 10px 20px;
                border-radius: 999px;
                cursor: pointer;
                transition: background-color .1s cubic-bezier(0.25, 1, 0.5, 1);
            }

            button.modal-button:hover {
                background-color: rgb(255, 255, 255, .35);
            }

            input.modal-input {
                flex: 1 1;
                background-color: transparent;
                box-shadow: 0 0 0 1px white;
                border: none;
                outline: none;
                padding: 10px 20px;
                border-radius: 999px;
                color: white;
                transition: all .15s cubic-bezier(0.25, 1, 0.5, 1);
            }

            input.modal-input:hover {
                background-color: rgba(255, 255, 255, .1);
            }

            input.modal-input:focus {
                background-color: rgba(255, 255, 255, .2);
                box-shadow: 0 0 0 2px white;
            }

            input.modal-input::placeholder {
                color: rgba(255, 255, 255, .75);
            }
        </style>
    `
    modalContent.shadowRoot.innerHTML += content;

    document.body.appendChild(modalContainer);

    const modal = modalContainer.shadowRoot.querySelector(".modal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalButton = modalTitle.querySelector("button");

    const callback = (root) => {
        checkRippleElements(root);
    }

    callback(modalContainer.shadowRoot);
    callback(modalContent.shadowRoot);

    modalContainer.addEventListener("close-modal", () => {
        const animation = modalContainer.animate([{ opacity: 0 }], { duration: 100, easing: "cubic-bezier(0.25, 1, 0.5, 1)", fill: "forwards" });

        animation.onfinish = () => {
            modalContainer.remove();
            modalContainer.dispatchEvent(new CustomEvent("ready-to-close"));
        }
    });

    modalButton.focus();

    modalButton.addEventListener("click", () => {
        modalContainer.dispatchEvent(new CustomEvent("close-modal"));
    });

    return modalContainer;
}

// Custom modals

export function addAccountModal() {
    const modalHTML = `
        <style>
            form {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
        </style>

        <form onsubmit="return false">
            <input class="modal-input" id="popup-account-name" type="text" placeholder="Account name" spellcheck="false" autocomplete="off" required>
            <input class="modal-input" id="popup-issuer-name" type="text" placeholder="Issuer name" spellcheck="false" autocomplete="off">
            <input class="modal-input" id="popup-secret" type="text" placeholder="Secret" spellcheck="false" autocomplete="off" required>
            <button id="popup-clipboard" class="modal-button" type="button" ripple>Get data from clipboard</div>
            <button id="popup-confirm" class="modal-button" type="submit" ripple>Confirm</button>
        </form>
    `;

    const title = "Add account";
    let modalContainer = createModal(title, modalHTML);

    const form = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("form");
    const clipboardButton = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("button#popup-clipboard");
    const accountNameInput = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("input#popup-account-name");
    const issuerNameInput = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("input#popup-issuer-name");
    const secretInput = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("input#popup-secret");

    clipboardButton.addEventListener("click", async () => {
        const otpParams = await window.electronAPI.processClipboardQR();
        const { secret, issuer } = otpParams;

        if (secret) {
            secretInput.value = secret;
        }
        if (issuer) {
            issuerNameInput.value = issuer;
        }
    });

    form.addEventListener("submit", event => {
        window.electronAPI.createAccount({ secret: secretInput.value, name: accountNameInput.value, issuer: issuerNameInput.value }).then(response => {
            if (response.success) {
                modalContainer.dispatchEvent(new CustomEvent("close-modal"));
                modalContainer.addEventListener("ready-to-close", () => {
                    updateAccountList();
                });
            } else {
                console.error("Error creating account:", response.error);
                modalContainer.dispatchEvent(new CustomEvent("close-modal"));
            }
        });
    });
}

export async function otpModal(secret) {
    const modalHTML = `
        <style>
            form {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            p {
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 5px;
            }

            button.modal-button {
                width: 100%;
            }
        </style>

        <form onsubmit="return false">
            <p></p>
            <button class="modal-button" ripple>
                <span>Copy</span>
            </button>
        </form>
    `;

    const title = `OTP Code`;
    let modalContainer = createModal(title, modalHTML);

    const otpCodeParagraph = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("p");
    const copyButton = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("button");
    const copyButtonSpan = copyButton.querySelector("span");

    const otpCode = await window.electronAPI.generateOtp(secret);

    otpCodeParagraph.textContent = otpCode;

    copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(otpCodeParagraph.textContent);

        copyButtonSpan.textContent = "Copied!";

        setTimeout(() => {
            copyButtonSpan.textContent = "Copy";
        }, 1000);
    });
}

export async function removeModal(accountName) {
    const modalHTML = `
        <style>
            form {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            p {
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 5px;
            }

            button.modal-button {
                width: 100%;
            }
        </style>

        <form onsubmit="return false">
            <button class="modal-button" ripple>Confirm</button>
        </form>
    `;

    const title = `Delete <span style="text-decoration: underline 1px; color: rgb(208, 188, 255)">${accountName}</span>`;
    let modalContainer = createModal(title, modalHTML);

    const confirmButton = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("button");

    confirmButton.addEventListener("click", async () => {
        await window.electronAPI.deleteAccount(accountName);

        window.electronAPI.deleteAccount(accountName).then(response => {
            modalContainer.dispatchEvent(new CustomEvent("close-modal"));
            modalContainer.addEventListener("ready-to-close", () => {
                updateAccountList();
            });
        });
    });
}