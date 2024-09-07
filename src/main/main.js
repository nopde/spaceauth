const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron/main");
const { dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");
const fs = require("node:fs");
const jsonfile = require("jsonfile");
const { authenticator } = require("otplib");

const filePath = path.join(app.getPath("appData"), "spaceauth", "accounts.json");

let mainWindow;
let tray;
const gotTheLock = app.requestSingleInstanceLock();

const iconPath = path.join(app.getAppPath(), "assets/icon.ico");
const img = nativeImage.createFromPath(iconPath);

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        icon: img,
        webPreferences: {
            devTools: false,
            zoomFactor: 1.0,
            preload: path.join(app.getAppPath(), "src/preload/preload.js")
        }
    });

    mainWindow.loadFile(path.join(app.getAppPath(), "src/renderer/index.html"));
}

function loadAccounts() {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(filePath, (err, obj) => {
            if (err) reject(err);
            resolve(obj || {});
        });
    });
}

function saveAccounts(accounts) {
    return new Promise((resolve, reject) => {
        jsonfile.writeFile(filePath, accounts, { spaces: 4 }, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

if (!gotTheLock) {
    app.quit();
}
else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send("reset-scroll");
        }
    });

    app.whenReady().then(() => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(filePath, "{}", (err) => {
                    if (err) throw err;
                });
            }
        });

        createWindow();

        mainWindow.on("show", () => {
            mainWindow.webContents.zoomFactor = 1.0;
            mainWindow.webContents.send("reset-scroll");
        });

        autoUpdater.on("update-available", (event) => {
            const dialogOpts = {
                type: "info",
                buttons: ["Download now", "Remind me later"],
                title: "SpaceAuth Updater",
                detail: "A new version is available."
            }

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    autoUpdater.downloadUpdate();
                }
            });
        });

        autoUpdater.on("update-downloaded", (event) => {
            const dialogOpts = {
                type: "info",
                buttons: ["Install now", "Install later"],
                title: "SpaceAuth Updater",
                detail: "A new version has been downloaded. Restart the application to apply the updates."
            }

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    autoUpdater.quitAndInstall(isSilent = false, isForceRunAfter = true);
                    mainWindow.destroy();
                }
            });
        });

        autoUpdater.autoDownload = false;
        autoUpdater.checkForUpdates();

        mainWindow.on("close", function (event) {
            event.preventDefault();
            mainWindow.hide();
        });

        tray = new Tray(img);

        const contextMenu = Menu.buildFromTemplate([
            { label: `SpaceAuth (v${app.getVersion()})`, enabled: false, icon: img.resize({ width: 16, height: 16 }) },
            { type: "separator" },
            { label: "Show", click: function () { mainWindow.show(); } },
            {
                label: "Check for updates", click: async function () {
                    const result = await autoUpdater.checkForUpdates();
                    const latestVersion = result["updateInfo"]["version"];

                    if (app.getVersion() === latestVersion) {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["OK"],
                            title: "SpaceAuth Updater",
                            detail: "You are using the latest version of SpaceAuth."
                        });
                    }
                }
            },
            { type: "separator" },
            { label: "Quit SpaceAuth", click: function () { mainWindow.destroy(); app.quit(); } }
        ]);

        tray.setContextMenu(contextMenu);

        tray.on("click", () => {
            mainWindow.show();
        });

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });

        ipcMain.handle("create-account", async (event, accountData) => {
            try {
                const accounts = await loadAccounts();
                accounts[accountData.name] = accountData;
                await saveAccounts(accounts);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle("delete-account", async (event, accountName) => {
            try {
                const accounts = await loadAccounts();
                delete accounts[accountName];
                await saveAccounts(accounts);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle("generate-otp", (event, secret) => {
            try {
                const otp = authenticator.generate(secret);
                const isValid = authenticator.check(otp, secret);

                if (isValid) {
                    return otp;
                }
            } catch (error) {
                console.error("Error generating OTP:", error);
                return "Error";
            }
        });

        ipcMain.handle("load-accounts", (event) => {
            return loadAccounts();
        });

        ipcMain.handle("quit", (event) => {
            app.quit();
        });

        ipcMain.handle("minimize", (event) => {
            mainWindow.minimize();
        });
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});