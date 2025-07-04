const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server/app');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'SwitchBot App',
    icon: path.join(__dirname, 'client/build', 'switchbot.ico'),
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111924', 
      symbolColor: '#fff', 
      height: 32
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
}


autoUpdater.autoDownload = false;

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-message', 'Update available. Downloading...');
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-message', 'Update downloaded. It will be installed on restart.');
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-message', `Update error: ${err == null ? "unknown" : err.message}`);
});


app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('update-message', 'Checking for updates...');
    autoUpdater.checkForUpdates();
  });
});

expressApp.listen(8089, () => {
  console.log('Desktop Express server running on http://localhost:8089');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

