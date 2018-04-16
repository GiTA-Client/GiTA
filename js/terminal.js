const remote = require('electron').remote;

const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');
const KeyCode = require('keycode-js');
const messagebus = remote.require('./js/messagebus');

// Initialize a shell process
let shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

let ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cwd: process.cwd(),
    env: process.env
});

// Initialize the front end for the shell process
let xterm = new Terminal({
    cursorBlink: true,
});

let commandToExecute = null;
let errorMessage = null;
let isBlocked = false;
let receiveCount = -1;

/**
 * Handle messages from the messagebus
 *
 * @param {string} message Received message
 */
function handleMessage(message) {
    if (message === "block") {
        isBlocked = true;
    }
    receiveCount += 1;
    runCommand();
}

messagebus.subscribe(handleMessage, "terminal");

xterm.open(document.getElementById('terminal'));
fit.fit(xterm);

xterm.on('data', (data) => {
    if (receiveCount > -1) return;
    // Check user command after pressing enter
    if (data.charCodeAt(0) === KeyCode.KEY_RETURN) {
        let lineIdx = xterm.buffer.y + xterm.buffer.ybase;
        let currLine = xterm.buffer.lines._array[lineIdx];

        commandToExecute = currLine.map((arrElement) => {
            return arrElement[1];
        }).join("");

        receiveCount += 1;
        messagebus.sendMessage(commandToExecute, "command");
    } else { // If user didn't press enter, pass the input to the shell
        ptyProcess.write(data);
    }
});

/**
 * Run command queued up in commandToExecute, if safe.
 * Print error otherwise.
 */
function runCommand() {
    if (receiveCount < 1) return;
    if (!isBlocked) {
        ptyProcess.write('\n');
    } else {
        let backspaces = Array(commandToExecute.length).join('\b');
        ptyProcess.write(backspaces)
        errorMessage = '\n\rError';
        isBlocked = false;
    }
    receiveCount = -1;
}

// Send the shell output to the front end
ptyProcess.on('data', (data) => {
    xterm.write(data);
    if (errorMessage) {
        xterm.write(errorMessage);
        errorMessage = null;
        ptyProcess.write('\n');
    }
});
