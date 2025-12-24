// main.js
const { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain } = require('electron');
const path = require('path');

let win;
let tray;
const isDev = !app.isPackaged;

function createWindow() {
win = new BrowserWindow({
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
  frame: false,
  width: 400,           // tune if your UI needs a bit more
  height: 520,
  useContentSize: true, // width/height are for the web contents, not including frame
  resizable: false,
  fullscreenable: false,
  movable: true,
  frame: false,         // <— removes native title bar + buttons
  transparent: false,   // keep false unless you’re doing fancy transparency
  backgroundColor: '#dba66b', // optional: match your app background color
  autoHideMenuBar: true,
  show: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  },
  title: "Barista’s Diary" // <— also sets the OS window title
});


  // Load your existing public/index.html
  win.loadFile(path.join(__dirname, 'public', 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  });

  // open external links in the OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'build', 'icon.png'); // add an icon later
  const image = nativeImage.createFromPath(iconPath);
  tray = new Tray(image.isEmpty() ? undefined : image); // allows running w/o icon during dev

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Window',
      click: () => {
        if (!win) return;
        win.isVisible() ? win.hide() : win.show();
      }
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: false,
      click: (item) => win?.setAlwaysOnTop(item.checked, 'floating')
    },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' }
  ]);
  tray.setToolTip('Drinks Widget');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win?.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else win?.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Simple IPC example
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.on('window:minimize', () => win?.minimize());
ipcMain.on('window:close', () => win?.close());
