let app = require('electron').remote;
let dialog = app.dialog;
let fs = require('fs');

const Config = require('electron-config');
const config = new Config();
const ipcRenderer = require('electron').ipcRenderer;

let tools = {
    getLineLength: function (el) {
        let x1 = el.getAttribute('x1');
        let x2 = el.getAttribute('x2');
        let y1 = el.getAttribute('y1');
        let y2 = el.getAttribute('y2');
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    },
    getCircleLength: function (el) {
        let radius = parseInt(el.getAttribute('r'));
        return 2 * Math.PI * radius;
    },
    setDashStyles: function (el, i, addDelay) {
        let type = el.tagName;
        let len = 0;
        let duration = .4;
        let delay = i * (duration - .1) + addDelay;
        if (type === 'line') {
            len = this.getLineLength(el) + 1;
        } else if (type === 'circle') {
            len = this.getCircleLength(el) + 1;
        } else if (type === 'path') {
            len = el.getTotalLength() + 1;
        }
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        el.style.animation = 'undash ' + duration + 's ' + delay + 's forwards';
    }
};

document.querySelectorAll('.middle').forEach(function (el, i) {
    tools.setDashStyles(el, parseInt(el.getAttribute('data-order')), 0);
});

document.querySelectorAll('.top').forEach(function (el, i) {
    tools.setDashStyles(el, i, 0);
});

document.querySelectorAll('.bottom').forEach(function (el, i) {
    tools.setDashStyles(el, i, 0);
});

document.querySelectorAll('.low-mid').forEach(function (el, i) {
    tools.setDashStyles(el, i, 3);
});

document.querySelectorAll('.middle').forEach(function (el, i) {
    tools.setDashStyles(el, parseInt(el.getAttribute('data-order')), 0);
});

document.querySelectorAll('.top').forEach(function (el, i) {
    tools.setDashStyles(el, i, 0);
});

document.querySelectorAll('.bottom').forEach(function (el, i) {
    tools.setDashStyles(el, i, 0);
});

document.querySelectorAll('.low-mid').forEach(function (el, i) {
    tools.setDashStyles(el, i, 3);
});

document.getElementById('openButton').onclick = () => {
    let path = dialog.showOpenDialog({
        properties: ['openDirectory', 'showHiddenFiles'],
    })
    if (path == undefined) {
        alert('Please select a valid folder!');
    } else {
        config.set('path', path);
        ipcRenderer.send('open-main-window');
    }
}
