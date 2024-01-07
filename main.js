const { app, BrowserWindow } = require('electron');
// const path = require('path');
// const childProcess = require('child_process');

let mainWindow;

app.on('ready', () => {
  // Create a new Electron window
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  // mainWindow.loadFile('index.html'); // Load your Electron app interface
  mainWindow.maximize()

    // mainWindow.loadURL('https://eatify-22231.web.app/account#code?store=demo');
    mainWindow.loadURL('http://localhost:3000');


  // Handle app window closed
  mainWindow.on('closed', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});