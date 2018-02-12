const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');
const KeyCode = require('keycode-js');

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

xterm.open(document.getElementById('terminal'));
fit.fit(xterm);

xterm.on('data', (data) => {
    // Check user command after pressing enter
    if (data.charCodeAt(0) === KeyCode.KEY_RETURN) {
        let lineIdx = xterm.buffer.y + xterm.buffer.ybase;
        let currLine = xterm.buffer.lines._array[lineIdx];

        currLine = currLine.map((arrElement) => {
            return arrElement[1];
        }).join("");

        if (inputChecker(currLine) == true) {
            ptyProcess.write(data);
        }
    } else { // If user didn't press enter, pass the input to the shell
        ptyProcess.write(data);
    }
});

// Send the shell output to the front end
ptyProcess.on('data', (data) => {
    xterm.write(data);
});
