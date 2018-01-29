var os = require('os');
var pty = require('node-pty');
var Terminal = require('xterm').Terminal;
var fit = require('xterm/lib/addons/fit/fit').fit;

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

var ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: process.env
});

let xterm = new Terminal({
  cursorBlink: true,
  cols: 120,
  rows: 80
});

xterm.open(document.getElementById('terminal'));
fit(xterm);

xterm.on('data', (data) => {
  ptyProcess.write(data);
  console.log("xterm", data);
});

ptyProcess.on('data', (data) => {
  xterm.write(data);
  console.log("ptyprocess", data);
});
