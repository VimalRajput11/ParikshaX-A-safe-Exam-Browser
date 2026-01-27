const { app, BrowserWindow, globalShortcut, Menu, screen, ipcMain, session } = require('electron');
const path = require('path');

// Allow media stream permissions without UI prompts
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
// Disable autoplay restrictions
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// Media stability switches
app.commandLine.appendSwitch('disable-features', 'PreloadMediaEngagementData,AutoplayIgnoreWebAudio');
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

// ... (rest of imports)

// Handle Quit Request from Renderer
// Handle Quit Request
ipcMain.on('app-quit', () => {
    app.exit(0);
});

// Switch to Admin Mode (Unlocked)
ipcMain.on('set-admin-mode', () => {
    if (mainWindow) {
        globalShortcut.unregisterAll(); // Unblock shortcuts in admin mode
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
    }
});

// Switch to Exam Mode (Locked)
ipcMain.on('set-exam-mode', () => {
    if (mainWindow) {
        registerShortcuts(); // Re-enable blocks
        mainWindow.setKiosk(true);
        mainWindow.setAlwaysOnTop(true);
        mainWindow.setResizable(false);
        mainWindow.setMovable(false);
        mainWindow.setMinimizable(false);
        mainWindow.setClosable(false);
        mainWindow.setSkipTaskbar(true);
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        mainWindow.setSize(width, height);
        mainWindow.setPosition(0, 0);
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
        closable: false,
        movable: false,
        resizable: false,
        minimizable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
            devTools: true // Enabled for dev debugging if needed, will be false in prod
        }
    });

    // Load the React app
    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
    mainWindow.loadURL(startUrl);

    // BLOCK ALL SHORTCUTS
    mainWindow.on('blur', () => {
        // Only return focus if we are in Exam/Kiosk mode
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isKiosk()) {
            mainWindow.focus();
        }
    });

    // Prevent new windows (popups)
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
}

// Block System Shortcuts
function registerShortcuts() {
    // Unregister first to avoid duplicates
    globalShortcut.unregisterAll();

    globalShortcut.register('CommandOrControl+R', () => { console.log('Reload blocked'); });
    globalShortcut.register('CommandOrControl+Shift+R', () => { console.log('Reload blocked'); });
    globalShortcut.register('CommandOrControl+Shift+I', () => { console.log('DevTools blocked'); });
    globalShortcut.register('Alt+F4', () => { console.log('Alt+F4 blocked'); });
    globalShortcut.register('Escape', () => { console.log('Escape blocked'); });

    // Block Virtual Desktop Switching (Windows)
    globalShortcut.register('Super+Ctrl+Left', () => { console.log('Desktop Switch Blocked'); });
    globalShortcut.register('Super+Ctrl+Right', () => { console.log('Desktop Switch Blocked'); });
    globalShortcut.register('Super+Ctrl+D', () => { console.log('New Desktop Blocked'); });
    globalShortcut.register('Super+Ctrl+F4', () => { console.log('Close Desktop Blocked'); });
    globalShortcut.register('Super+Tab', () => { console.log('Task View Blocked'); });

    // Navigation and Task switching
    globalShortcut.register('Alt+Tab', () => { console.log('Tab Switch Blocked'); });
    globalShortcut.register('Alt+Left', () => { console.log('Nav Blocked'); });
    globalShortcut.register('Alt+Right', () => { console.log('Nav Blocked'); });
}

app.whenReady().then(() => {
    // MEDIA PERMISSIONS HANDLER
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications', 'midi', 'clipboard-read'];
        if (allowedPermissions.includes(permission)) {
            return callback(true);
        }
        callback(false);
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        return true; // Allow all checks for the secure browser environment
    });

    createSecureWindow();
    registerShortcuts();

    Menu.setApplicationMenu(null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createSecureWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Unregister shortcuts on quit
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
