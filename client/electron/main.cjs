const { app, BrowserWindow, globalShortcut, Menu, screen, ipcMain, session } = require('electron');
const path = require('path');

// Allow media stream permissions without UI prompts
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'PreloadMediaEngagementData,AutoplayIgnoreWebAudio');

// Handle Quit Request from Renderer
ipcMain.on('app-quit', () => {
    app.exit(0);
});

// Switch to Admin Mode (Unlocked)
ipcMain.on('set-admin-mode', () => {
    if (mainWindow) {
        globalShortcut.unregisterAll();
        mainWindow.setKiosk(false);
        mainWindow.setFullScreen(false);
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setResizable(true);
        mainWindow.setMovable(true);
        mainWindow.setMinimizable(true);
        mainWindow.setClosable(true);
        mainWindow.setSkipTaskbar(false);
        mainWindow.setSize(1280, 800);
        mainWindow.center();
        mainWindow.setContentProtection(false);
    }
});

// Switch to Exam Mode (Locked)
ipcMain.on('set-exam-mode', () => {
    if (mainWindow) {
        mainWindow.setKiosk(true);
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setResizable(false);
        mainWindow.setMovable(false);
        mainWindow.setMinimizable(false);
        mainWindow.setClosable(false);
        mainWindow.setSkipTaskbar(true);
        mainWindow.setContentProtection(true);
        registerShortcuts();
    }
});

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) {
    app.quit();
}

let mainWindow;

function createSecureWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        kiosk: true,
        fullscreen: true,
        frame: false,
        alwaysOnTop: true,
        focusable: true,
        skipTaskbar: true,
        autoHideMenuBar: true, // Explicitly hide menu bar
        backgroundColor: '#0f1115',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
            devTools: false
        }
    });

    // Enforce full screen and hide everything
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setContentProtection(true);

    // Load the React app
    if (process.env.ELECTRON_START_URL) {
        mainWindow.loadURL(process.env.ELECTRON_START_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Prevent losing focus
    mainWindow.on('blur', () => {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isKiosk()) {
            mainWindow.focus();
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
    });

    // Prevent new windows (popups)
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Debugging path issues
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorDescription, errorCode);
    });
}

// Block System Shortcuts
function registerShortcuts() {
    globalShortcut.unregisterAll();

    const shortcuts = [
        'CommandOrControl+R',
        'CommandOrControl+Shift+R',
        'CommandOrControl+Shift+I',
        'CommandOrControl+W',
        'Alt+F4',
        'Alt+Tab',
        'Alt+Space',
        'Super+Tab',
        'Super+D',
        'Super+L',
        'Ctrl+Alt+Delete', // Note: Cannot be fully blocked by OS design, but handled via Kiosk
        'Super+Ctrl+Left',
        'Super+Ctrl+Right',
        'Super+Ctrl+D',
        'Super+Ctrl+F4',
        'PrintScreen', // Block Screenshot key
        'Alt+PrintScreen',
        'CommandOrControl+Shift+S' // Snipping tool
    ];

    shortcuts.forEach(shortcut => {
        globalShortcut.register(shortcut, () => {
            console.log(`Shortcut blocked: ${shortcut}`);
        });
    });
}

app.whenReady().then(() => {
    // Media Permissions
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications'];
        callback(allowedPermissions.includes(permission));
    });

    createSecureWindow();
    registerShortcuts();

    Menu.setApplicationMenu(null); // Remove top menu

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createSecureWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
