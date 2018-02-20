const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const { ipcMain } = require('electron')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({width: 700, height: 600,
        frame: false,"node-integration": true})

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'welcome.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})
