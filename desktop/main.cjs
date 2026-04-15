/**
 * Ventana de escritorio que carga la app en Vercel.
 *
 * URL por defecto o con variable de entorno:
 *   set THINKIA_APP_URL=https://tu-app.vercel.app/ && Thinkia-Fresenius.exe
 *
 * Si ves "Log in to Vercel": el proyecto tiene Deployment Protection activa.
 *   Opción A (recomendada): Vercel → Project → Settings → Deployment Protection
 *     y desactiva la protección en Preview, o usa la URL de Production pública.
 *   Opción B: en Vercel genera "Protection Bypass for Automation" y luego:
 *     set VERCEL_PROTECTION_BYPASS=tu_secreto && Thinkia-Fresenius.exe
 *     (también acepta THINKIA_VERCEL_BYPASS)
 */
const { app, BrowserWindow, shell, session } = require("electron");

const DEFAULT_APP_URL =
  "https://app-fresenius-ejw6yz3or-manuel-s-projects-f149b7e7.vercel.app/";

function bypassSecret() {
  return (process.env.VERCEL_PROTECTION_BYPASS || process.env.THINKIA_VERCEL_BYPASS || "").trim();
}

function startUrl() {
  const fromEnv = (process.env.THINKIA_APP_URL || "").trim();
  const base = fromEnv || DEFAULT_APP_URL;
  const secret = bypassSecret();
  if (!secret) return base;
  try {
    const u = new URL(base);
    u.searchParams.set("x-vercel-protection-bypass", secret);
    return u.toString();
  } catch {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}x-vercel-protection-bypass=${encodeURIComponent(secret)}`;
  }
}

/** Inyecta cabecera en todas las peticiones a Vercel (assets, API, navegación). */
function installVercelProtectionBypass() {
  const secret = bypassSecret();
  if (!secret) return;

  const filter = {
    urls: ["*://*.vercel.app/*", "*://*.vercel.dev/*"],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = { ...details.requestHeaders };
    headers["x-vercel-protection-bypass"] = secret;
    callback({ requestHeaders: headers });
  });
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
  installVercelProtectionBypass();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
