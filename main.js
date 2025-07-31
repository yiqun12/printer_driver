const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false // 默认不显示窗口
  });

  // 加载URL
  mainWindow.loadURL('http://localhost:3001/');
  
  // 创建系统托盘
  tray = new Tray(path.join(__dirname, 'icon.png')); // 需要添加一个图标文件
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '显示窗口', 
      click: () => mainWindow.show() 
    },
    { 
      label: '退出', 
      click: () => app.quit() 
    }
  ]);
  
  tray.setToolTip('7Dollar Printer Driver');
  tray.setContextMenu(contextMenu);
  
  // 点击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow.show();
  });
  
  // 窗口关闭时只是隐藏
  mainWindow.on('close', (event) => {
    if(!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

// 确保只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,激活第一个实例的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
