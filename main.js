const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;
const path = require('path');
const url = require('url');

let welcomeWindow;
let mainWindow;
let contributionWindow;

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

function createMainWindow() {
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
}

function createContributionWindow() {
    let screenElectron = electron.screen;
    let mainScreen = screenElectron.getPrimaryDisplay();
    let dimensions = mainScreen.size;
    contributionWidth = Math.ceil(dimensions.width * .75);
    contributionHeight = Math.ceil(dimensions.height * .75);

    contributionWindow = new BrowserWindow({
        width: contributionWidth,
        height: contributionHeight,
        "node-integration": true,
        draggable: true,
        frame: true
    });

    contributionWindow.setMenu(null);

    contributionWindow.loadURL(url.format({
        pathname: path.join(__dirname, './output/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    contributionWindow.on('closed', function () {
        contributionWindow = null;
    });
}

ipcMain.on('open-contribution-window', () => {
    createContributionWindow();
});

ipcMain.on('open-main-window', () => {
    createMainWindow();
});

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
