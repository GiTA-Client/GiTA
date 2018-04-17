const pty = require('node-pty');
const os = require('os');
const Config = require('electron-config');

const config = new Config();
const GIT_PATH = config.get('path');

const trafficlightpath = "res/pics/traffic-lights-";

const cmdStart = "echo '<<<GITA_CMD_START>>>';";
const historyIgnore = "history -d $(history | tail -n 1);";
const cmdEnd = "echo '<<<GITA_CMD_END>>>';\n";

const branchUpdateCheck = "git fetch &> /dev/null; git status | grep 'git pull';";

const stashCmd = "git stash &> /dev/null; git stash apply stash@{0} --index &> /dev/null;";
const mergeSimulateCmd = "git merge --no-commit 2>&1 | grep error; git reset --hard &> /dev/null;";
const restoreStashCmd = "git stash pop stash@{0} --index &> /dev/null;";

const cmdOutMatch = "<<<GITA_CMD_START>>>\r\n[^]*<<<GITA_CMD_END>>>";

let shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

let ptyProcess = pty.spawn(shell, [], {
    name: 'xterm',
    cwd: GIT_PATH,
    env: process.env
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let body = document.getElementsByTagName('body')[0];
let trafficLightsIcon = document.getElementById('trafficlights');

let cmdOut = null;
let cmdWrite = false;
let callback;

ptyProcess.on('data', function(data) {
    if (data.match("<<<GITA_CMD_END>>>\r\n")) {
        cmdWrite = false;
        callback();
    }
    if (cmdWrite) {
        cmdOut += data;
    }
    if (data.match("<<<GITA_CMD_START>>>\r\n")) {
        cmdOut = "";
        cmdWrite = true;
    }
});

function gitUpdateCheck() {
    callback = gitUpdateCallback;
    ptyProcess.write(cmdStart + branchUpdateCheck + historyIgnore + cmdEnd);
}

function gitUpdateCallback() {
    if (cmdOut != "") {
        body.style.background = "var(--yellow)";
        trafficLightsIcon.src = trafficlightpath + "yellow.png";
    }
}

function gitMergeConflictCheck() {
    callback = gitMergeConflictCallback;
    ptyProcess.write(cmdStart + stashCmd + mergeSimulateCmd + restoreStashCmd + historyIgnore + cmdEnd);
}

function gitMergeConflictCallback() {
    if (cmdOut != "") {
        body.style.background = "var(--red)";
        trafficLightsIcon.src = trafficlightpath + "red.png";
    }
}

// cmdOut.match("<<<GITA_CMD_START>>>[^]?[^]?<<<GITA_CMD_END>>>")[0]
