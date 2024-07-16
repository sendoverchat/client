const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, '../src/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            autoHideMenuBar: true, 
            
            contextIsolation: false,
            webSecurity: false,
            enableRemoteModule: false, 
        },
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL('https://sendover.fr/app');

    mainWindow.webContents.on('did-finish-load', () => {
        require('./overlay.js');
        mainWindow.webContents.executeJavaScript(`
            if (!document.cookie.split('; ').find(row => row.startsWith('theme='))) {
                document.cookie = 'theme=dark; path=/; SameSite=Lax';
            }
        `).then(() => {
            console.log('Dark theme cookie is set if it was not present.');
        }).catch(err => console.error(err));
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

app.whenReady().then(() => {
    createTray();
    createWindow();
});

function createTray() {
    tray = new Tray(path.join(__dirname, '../src/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Sendover Application');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
