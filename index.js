// Import required modules
const updateElectronApp = require("update-electron-app");
const electronReload = require("electron-reloader");
const {menubar} = require("menubar");
const path = require("path");
const {app, nativeImage, Tray, Menu, globalShortcut, shell} = require("electron");
const contextMenu = require("electron-context-menu");

// Initialize update-electron-app
updateElectronApp();

// Try to require electron-reloader, but don't throw an error if it fails
try {
    electronReload(module);
} catch {
}

// Create a native image from the app's icon
const appIcon = nativeImage.createFromPath(
    path.join(__dirname, "images/newiconTemplate.png")
);

function isOSX() {
    return process.platform === "darwin";
}

// Wait for the app to be ready
app.on("ready", () => {

    // Create a tray icon using the app's icon
    const tray = new Tray(appIcon);

    // Create a menubar using the tray icon and other options
    const mb = menubar({
        browserWindow: {
            icon: appIcon,
            transparent: path.join(__dirname, "images/iconApp.png"),
            webPreferences: {
                webviewTag: true,
                // nativeWindowOpen: true,
            },
            minWidth: 400,
            width: 500,
            height: 650,
        },
        tray,
        showOnAllWorkspaces: false,
        preloadWindow: true,
        showDockIcon: false,
        icon: appIcon,
    });

    // When the menubar is ready, set up the app
    mb.on("ready", () => {
        // Get the window object from the menubar
        const {window} = mb;

        // Set the window to always be on top
        window.setAlwaysOnTop(true, "floating", 1);

        // On macOS, hide the dock icon; on other platforms, set the taskbar icon to be hidden
        if (isOSX()) {
            app.dock.hide();
        } else {
            window.setSkipTaskbar(true);
        }

        const contextMenuTemplate = [
            // Add links to the GitHub repo and Vince's Twitter
            {
                label: "Quit",
                accelerator: "CommandOrControl+Q",
                click: () => {
                    app.quit();
                },
            },
            {
                label: "Reload",
                accelerator: "CommandOrControl+R",
                click: () => {
                    window.reload();
                },
            },
            {
                label: "Open ChatGPT in browser",
                click: () => {
                    shell.openExternal("https://chat.openai.com/chat");
                },
            },
            {
                type: "separator",
            },
            {
                label: "View on GitHub",
                click: () => {
                    shell.openExternal("https://github.com/mmeggs2/chatgpt-electron");
                },
            },
        ];

        // When the tray icon is right-clicked, show the context menu
        tray.on("right-click", () => {
            mb.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate));
        });

        // When the tray icon is clicked, check if the Ctrl or Meta key is pressed. If it is, show the context menu; otherwise, do nothing
        tray.on("click", (e) => {
            e.ctrlKey || e.metaKey
                ? mb.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate))
                : null;
        });

        // Create an empty menu
        const menu = new Menu();

        // Register a global shortcut to toggle the visibility of the window
        globalShortcut.register("CommandOrControl+Shift+g", () => {
            if (window.isVisible()) {
                mb.hideWindow();
            } else {
                mb.showWindow();
                // On macOS, also show the app in the dock
                if (isOSX()) {
                    mb.app.show();
                }
                // Focus the app
                mb.app.focus();
            }
        });

        // Set the application menu to the empty menu we created
        Menu.setApplicationMenu(menu);

        // window.webContents.openDevTools();
    });

    // Set context menu options for webview elements
    app.on("web-contents-created", (e, contents) => {
        // If the element is a webview, set up the context menu and handle external links
        if (contents.getType() == "webview") {
            contents.on("new-window", (e, url) => {
                e.preventDefault();
                shell.openExternal(url);
            });
            contextMenu({
                window: contents,
            });

            // On macOS, register the Command+C, Command+V, and Command+X shortcuts for copying, pasting, and cutting, respectively
            contents.on("before-input-event", (event, input) => {
                if (input.type === "keyDown") {
                    const {control, meta, key} = input;
                    if (!control && !meta) {
                        return;
                    } else if (key === "q") {
                        app.quit();
                    } else if (key === "r") {
                        contents.reload();
                    } else if (isOSX()) {
                        if (key === "c") {
                            contents.copy();
                        } else if (key === "v") {
                            contents.paste();
                        } else if (key === "a") {
                            contents.selectAll();
                        } else if (key === "z") {
                            contents.undo();
                        } else if (key === "y") {
                            contents.redo();
                        }
                    }
                }
            });
        }
    });

    if (process.platform == "darwin") {
        // restore focus to previous app on hiding
        mb.on("after-hide", () => {
            mb.app.hide();
        });
    }

    // prevent background flickering
    app.commandLine.appendSwitch(
        "disable-backgrounding-occluded-windows",
        "true"
    );
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (!isOSX()) {
        app.quit();
    }
});
