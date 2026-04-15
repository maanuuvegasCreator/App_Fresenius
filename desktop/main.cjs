/**
 * Ventana de escritorio que carga la app desplegada en Vercel.
 * URL por defecto = última versión indicada; se puede sobrescribir al lanzar:
 *   set THINKIA_APP_URL=https://otra-url.vercel.app/ && Thinkia-Fresenius.exe
 */
const { app, BrowserWindow, shell } = require("electron");

const DEFAULT_APP_URL =
  "https://app-fresenius-ejw6yz3or-manuel-s-projects-f149b7e7.vercel.app/";

function startUrl() {
  const fromEnv = (process.env.THINKIA_APP_URL || "").trim();
  return fromEnv || DEFAULT_APP_URL;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 840,
    minWidth: 1024,
    minHeight: 640,
    title: "Thinkia · Fresenius",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  win.once("ready-to-show", () => win.show());

  const url = startUrl();
  win.loadURL(url, { userAgent: `${win.webContents.getUserAgent()} ThinkiaDesktop/1.0` });

  win.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
