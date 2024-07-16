const fs = require('fs');
const path = require('path');
const https = require('https');
const { BrowserWindow } = require('electron');

let loadingWindow;

function checkAndUpdateFiles() {
    let filesToUpdate = 0;
    let filesUpdated = 0;
    let serverAccessible = true;

    updateFilesInDirectory(path.join(__dirname, '../pages'));
    updateFilesInDirectory(path.join(__dirname, '../scripts'));

    function checkCompletion() {
        if (filesToUpdate === filesUpdated && serverAccessible) {
            console.log('All files processed. Closing window.');
            setTimeout(() => {
                loadingWindow.close();
                require('./page.js');
            }, 5000);
        }
    }

    function updateFilesInDirectory(directoryPath) {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error(`Error reading directory ${directoryPath}:`, err);
                return;
            }

            const fileNames = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile());

            fileNames.forEach(fileName => {
                filesToUpdate++;
                const fileUrl = `https://sendover.fr/static/app/latest/${fileName}`;
                const localFilePath = path.join(directoryPath, fileName);

                checkFileExists(fileUrl, (exists) => {
                    if (exists) {
                        downloadFile(fileUrl, localFilePath);
                    } else {
                        console.log(`File ${fileName} does not exist on the server.`);
                        filesUpdated++;
                        checkCompletion();
                    }
                });
            });
        });
    }

    function checkFileExists(url, callback) {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                callback(true);
            } else {
                serverAccessible = false;
                callback(false);
            }
        }).on('error', (err) => {
            console.error(`Error checking file at ${url}:`, err);
            serverAccessible = false;
            callback(false);
        });
    }

    function downloadFile(url, filePath) {
        https.get(url, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                if (data.includes('404') && data.includes('<!DOCTYPE html>')) {
                    console.log(`File ${path.basename(filePath)} not updated (404).`);
                } else {
                    const fileStream = fs.createWriteStream(filePath);
                    fileStream.write(data);
                    fileStream.close();
                    console.log(`File ${path.basename(filePath)} updated.`);
                }
                filesUpdated++;
                checkCompletion();
            });
        }).on('error', (err) => {
            console.error(`Error downloading file from ${url}:`, err);
        });
    }
}

checkAndUpdateFiles();

loadingWindow = new BrowserWindow({
    width: 390,
    height: 520,
    icon: path.join(__dirname, '../src/icon.png'),
    frame: false,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
});

loadingWindow.loadFile(path.join(__dirname, '../pages/loading.html'));
