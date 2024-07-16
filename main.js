const { app, BrowserWindow } = require('electron');
const path = require('path');

app.on('ready', () => {
  
    console.log('L\'application est prête');

    require('./scripts/loading.js');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
 
        require('./scripts/loading.js');
    }
});