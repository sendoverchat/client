
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { ipcMain } = require('electron');

const latestAppURL = 'https://sendover.fr/static/app/latest/';

async function checkForUpdates(mainWindow) {
    try {
        await fetchAndUpdateFiles(mainWindow);
    } catch (error) {
        console.error('Initial update attempt failed:', error);
        setTimeout(async () => {
            try {
                await fetchAndUpdateFiles(mainWindow);
            } catch (err) {
                console.error('Second update attempt failed:', err);
                mainWindow.loadURL('https://sendover.fr/app');
            }
        }, 2000);
    }
}

async function fetchAndUpdateFiles(mainWindow) {
    const response = await axios.get(`${latestAppURL}package.json`);
    const latestFiles = response.data.files;

    for (const file of latestFiles) {
        await updateFile(file);
    }

    console.log('All files updated successfully.');
    mainWindow.loadURL('https://sendover.fr/app');
}

async function updateFile(file) {
    const url = `${latestAppURL}${file}`;
    const filePath = path.join(__dirname, '../pages', file);

    try {
        const response = await axios.get(url);
        await fs.outputFile(filePath, response.data);
        console.log(`Updated ${file}`);
    } catch (error) {
        console.error(`Error updating ${file}:`, error);
        throw error; 
    }
}

module.exports = {
    checkForUpdates,
};
