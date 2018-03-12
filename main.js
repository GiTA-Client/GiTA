const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');

let mainWindow;

function createWindow() {
    welcomeWindow = new BrowserWindow({
        width: 700, height: 600,
        frame: false, "node-integration": true
    });

    welcomeWindow.loadURL(url.format({
        pathname: path.join(__dirname, './welcome.html'),
        protocol: 'file:',
        slashes: true
    }));

    welcomeWindow.on('closed', function () {
        welcomeWindow = null;
    });

    mainWindow = new BrowserWindow({
        width: 1400, height: 1200,
        "node-integration": true, draggable: false,
        frame: true
    });

    mainWindow.setMenu(null);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './mainview.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
