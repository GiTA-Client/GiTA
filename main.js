const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;


const path = require('path');
const url = require('url');

let welcomeWindow;

function createWelcomeWindow() {
    welcomeWindow = new BrowserWindow({
        width: 700,
        height: 600,
        frame: false,
        resizable: false,
        titleBarStyle: 'customButtonsOnHover',
        "node-integration": true
    });

    welcomeWindow.loadURL(url.format({
        pathname: path.join(__dirname, './welcome.html'),
        protocol: 'file:',
        slashes: true
    }));

    welcomeWindow.on('welcomeWindowClosed', function () {
        welcomeWindow = null;
    });
}

app.on('ready', createWelcomeWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWelcomeWindow();
    }
});

ipcMain.on('open-main-window', () => {
    var screenElectron = electron.screen;
    var mainScreen = screenElectron.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    mainWidth = Math.ceil(dimensions.width * .95);
    mainHeight = Math.ceil(dimensions.height * .95);

    mainWindow = new BrowserWindow({
        width: mainWidth,
        height: mainHeight,
        "node-integration": true,
        draggable: false,
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
});
