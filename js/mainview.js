const contributionOS = require('os');
const contributionPty = require('node-pty');
const Config = require('electron-config');
const ipcRenderer = require('electron').ipcRenderer;

const config = new Config();
const GIT_PATH = config.get('path');
let outputFolderPath =  " " + GIT_PATH + "/.gita/output";
let runGitstatsCommand = "lib/gitastats/gitstats " + GIT_PATH + outputFolderPath + "\n";


feather.replace()
setTimeout(generateContribution(), 0);

$('.frame').mousedown(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
});
$('.frame').not(".maximized").resizable({
    alsoResize: ".active .content",
    minWidth: 50,
    minHeight: 59
}).draggable({
    handle: ".topbar"
});

$('.swatches span').click(function () {
    let color = $(this).attr("class");
    $(this).parent().parent().attr("class", "topbar").addClass(color);
});

$('.maxbtn').click(function () {
    $(this).parent().parent().toggleClass("maximized");
});

$('.xbtn').click(function () {
    $(this).parent().parent().remove();
});

function generateContribution () {
    let shell = process.env[contributionOS.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

    let ptyProcess = contributionPty.spawn(shell, [], {
        name: 'xterm-color',
        cwd: process.cwd(),
        env: process.env
    });
    ptyProcess.write(runGitstatsCommand);
}

document.getElementById('contributionviewicon').onclick = () => {
    ipcRenderer.send('open-contribution-window');
}

const webviews = document.querySelectorAll('webview');
webviews.forEach(wv => wv.addEventListener('console-message', (e) => {
  console.log(e.message)
}));
