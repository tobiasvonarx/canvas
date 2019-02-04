const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 600,
    title: 'canvas',
    titleBarStyle: 'hidden',
    resizable: true
    //webPreferences: {
    //  nodeIntegration: false//,
      //preload: path.join(__dirname, 'preload.js')
    //}
  });
  win.setBackgroundColor('#333333');
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
