
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const update = require('./scripts/update');

let mainWindow;
let tray;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, './src/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('./pages/loading.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

app.on('ready', async () => {
    createMainWindow();

    tray = new Tray(path.join(__dirname, './src/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => mainWindow.show(),
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            },
        },
    ]);

    tray.setToolTip('Sendover App');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });

    globalShortcut.register('Shift+Tab', () => {
   // plus tard
    });

    await update.checkForUpdates(mainWindow);
});

app.on('window-all-closed', () => {});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    } else {
        mainWindow.show();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
