// Main process

const { app, BrowserWindow } = require('electron');
const path = require('path');

const ipc = require('./ipc');

const isProduction = process.env.APP_ENV !== 'development';

let win;

function isMacOS() {
  return process.platform === 'darwin';
}

function createWindow () {
  win = new BrowserWindow({
    width: isProduction ? 600 : 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preloader.js')
    }
  });

  win.loadFile(path.join(__dirname, 'public', 'views', 'index.html'));

  if (!isProduction) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMacOS()) {
    app.quit();
  }
});

ipc.init();
