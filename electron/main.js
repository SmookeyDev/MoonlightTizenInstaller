const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serviceProcess;

const isDev = !app.isPackaged;

function getServicePath() {
    if (isDev) {
        return path.join(__dirname, '..', 'client', 'services', 'tizenbrew-installer-service');
    }
    return path.join(process.resourcesPath, 'service');
}

function getIconPath() {
    if (isDev) {
        return path.join(__dirname, '..', 'client', 'ui', 'src', 'assets', 'moonlight-icon.png');
    }
    return path.join(process.resourcesPath, 'moonlight-icon.png');
}

function startService() {
    const servicePath = getServicePath();
    const serviceFile = isDev ? '.' : 'index.js';

    serviceProcess = spawn('node', [serviceFile], {
        cwd: servicePath,
        stdio: isDev ? 'inherit' : 'ignore',
        windowsHide: true,
        env: {
            ...process.env,
            UI_PATH: isDev
                ? path.join(__dirname, '..', 'client', 'ui', 'dist')
                : path.join(process.resourcesPath, 'ui')
        }
    });

    serviceProcess.on('error', (err) => {
        console.error('Failed to start service:', err);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: getIconPath(),
        autoHideMenuBar: true
    });

    // Wait for service to start then load the UI
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:8091/');
    }, 2000);

    // Open external links in system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://localhost')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('http://localhost')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startService();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (serviceProcess) {
        serviceProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (serviceProcess) {
        serviceProcess.kill();
    }
});
