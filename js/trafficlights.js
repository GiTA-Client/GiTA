const pty = require('node-pty');
const os = require('os');
const Config = require('electron-config');

const config = new Config();
const GIT_PATH = config.get('path');

const trafficlightpath = "res/pics/traffic-lights-";

const cmdStart = "echo '<<<GITA_CMD_START>>>';";
const historyIgnore = "history -d $(history | tail -n 1);";
const cmdUpdateEnd = "echo '<<<GITA_MCMD_END>>>';\n";
const cmdMergeEnd = "echo '<<<GITA_UCMD_END>>>';\n";

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

let isMergeError = false;
let isUpdateError = false;

function resetVars() {
    cmdOut = "";
    cmdWrite = true;
}

ptyProcess.on('data', function(data) {
    if (data.match("<<<GITA_UCMD_END>>>\r\n")) {
        cmdWrite = false;
        gitUpdateCallback();
    } else if (data.match("<<<GITA_MCMD_END>>>\r\n")) {
        cmdWrite = false;
        gitMergeConflictCallback();
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
    cmdOut = "";
    ptyProcess.write(cmdStart + branchUpdateCheck + historyIgnore + cmdUpdateEnd);
}

function gitUpdateCallback() {
    if (cmdOut != "") {
        body.style.background = "var(--yellow)";
        trafficLightsIcon.src = trafficlightpath + "yellow.png";
        isUpdateError = true;
    } else {
        isUpdateError = false;
    }
    gitMergeConflictCheck();
}

function gitMergeConflictCheck() {
    cmdOut = "";
    ptyProcess.write(cmdStart + stashCmd + mergeSimulateCmd + restoreStashCmd + historyIgnore + cmdMergeEnd);
}

function gitMergeConflictCallback() {
    if (cmdOut != "") {
        body.style.background = "var(--red)";
        trafficLightsIcon.src = trafficlightpath + "red.png";
        isMergeError = true;
    } else {
        isMergeError = false;
    }
    setGreenIfSafe();
}

function setGreenIfSafe() {
    if (!isUpdateError && !isMergeError) {
        body.style.background = "var(--green)";
        trafficLightsIcon.src = trafficlightpath + "green.png";
    }
    setTimeout(gitUpdateCheck, 2000);
}

gitUpdateCheck();
