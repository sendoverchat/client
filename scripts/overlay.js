const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let overlayWindow;

function createOverlayWindow() {
    if (overlayWindow) {
        return;
    }

    overlayWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        fullscreen: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    overlayWindow.loadFile(path.join(__dirname, '../pages/overlay.html'));

    overlayWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown') {
            overlayWindow.close();
        }
    });

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

app.whenReady().then(() => {
    globalShortcut.register('Shift+Tab', () => {
        createOverlayWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
