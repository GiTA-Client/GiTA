const contributionOS = require('os');
const contributionPty = require('node-pty');
const Config = require('electron-config');
const ipcRenderer = require('electron').ipcRenderer;

feather.replace()

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


document.getElementById('contributionviewicon').onclick = () => {
    // Initialize a shell process
    let shell = process.env[contributionOS.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

    let ptyProcess = contributionPty.spawn(shell, [], {
        name: 'xterm-color',
        cwd: process.cwd(),
        env: process.env
    });

    const config = new Config();
    const GIT_PATH = config.get('path');
    let runGitstatsCommand = "lib/gitastats/gitstats " + GIT_PATH + " .gita/output\n";

    ptyProcess.write(runGitstatsCommand);
    setTimeout(ipcRenderer.send('open-contribution-window'), 3000);
}
