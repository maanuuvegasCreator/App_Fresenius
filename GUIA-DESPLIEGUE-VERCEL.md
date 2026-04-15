# 🚀 Guía Completa para Desplegar en Vercel

## Opción 1: Despliegue desde GitHub (MÁS FÁCIL)

### Paso 1: Subir el código a GitHub

1. Ve a https://github.com y crea una cuenta (si no tienes)
2. Crea un nuevo repositorio llamado `thinkia-softphone`
3. En tu computadora, abre una terminal en la carpeta del proyecto
4. Ejecuta estos comandos:

```bash
git init
git add .
git commit -m "Initial commit - Thinkia Softphone App"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/thinkia-softphone.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Haz clic en "Sign Up" y usa tu cuenta de GitHub
3. Haz clic en "Add New..." → "Project"
4. Selecciona el repositorio `thinkia-softphone`
5. **IMPORTANTE:** En la configuración del proyecto:
   - Framework Preset: **Vite**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
6. Haz clic en "Deploy"
7. ¡Espera 2-3 minutos y listo! 🎉

Tu aplicación estará en: `https://thinkia-softphone.vercel.app`

---

## Opción 2: Despliegue directo con Vercel CLI

### Preparación (solo una vez)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Crea el archivo de entrada manualmente:

Crea un archivo llamado `index.html` en la raíz del proyecto con este contenido:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thinkia - AI Contact Experience</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

3. Crea `src/main.tsx` con:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/fonts.css';
import './styles/theme.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Desplegar

Desde la carpeta del proyecto, ejecuta:

```bash
vercel
```

Sigue las instrucciones:
- `Set up and deploy "~/tu-proyecto"?` → **Y**
- `Which scope do you want to deploy to?` → Selecciona tu cuenta
- `Link to existing project?` → **N**
- `What's your project's name?` → `thinkia-softphone`
- `In which directory is your code located?` → `./` (presiona Enter)

Vercel detectará automáticamente que es un proyecto Vite y lo desplegará.

Al finalizar verás: `✅ Production: https://thinkia-softphone.vercel.app`

---

## Opción 3: Despliegue Manual (ZIP Upload)

1. Ve a https://vercel.com y crea una cuenta
2. Haz clic en "Add New..." → "Project"
3. Selecciona "Import Third-Party Git Repository" o usa el método de arrastre
4. Arrastra la carpeta completa del proyecto
5. Configura:
   - Framework: Vite
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
6. Deploy

---

## ⚙️ Configuración Adicional (Opcional)

### Dominio Personalizado

1. En Vercel, ve a tu proyecto
2. Settings → Domains
3. Agrega tu dominio (ej: `app.thinkia.com`)
4. Sigue las instrucciones para configurar el DNS

### Variables de Entorno

Si necesitas API keys en el futuro:
1. Settings → Environment Variables
2. Agrega las variables necesarias

---

## 📱 Compartir con el Cliente

Una vez desplegada, simplemente comparte la URL:

**URL de Producción:** `https://thinkia-softphone.vercel.app`

El cliente puede:
- Abrir la URL en cualquier navegador
- Navegar por todas las páginas
- Probar la aplicación completa
- Ver en móvil y desktop

---

## 🔄 Actualizar la Aplicación

### Si usaste GitHub:
```bash
git add .
git commit -m "Actualización"
git push
```
Vercel detectará el cambio y desplegará automáticamente.

### Si usaste CLI:
```bash
vercel --prod
```

---

## 🆘 Solución de Problemas

### Error: "No index.html found"
Asegúrate de crear el archivo `index.html` y `src/main.tsx` como se indica arriba.

### Error de build
Verifica que `package.json` tenga el script de build:
```json
"scripts": {
  "build": "vite build"
}
```

### La aplicación carga pero no funciona el routing
Verifica que `vercel.json` existe con la configuración de rewrites (ya está creado).

---

## ✅ Checklist Final

- [ ] Código subido a GitHub o preparado para CLI
- [ ] Archivo `index.html` creado
- [ ] Archivo `src/main.tsx` creado  
- [ ] Proyecto conectado en Vercel
- [ ] Build exitoso (verde en Vercel)
- [ ] URL funcionando correctamente
- [ ] Todas las rutas navegables
- [ ] URL compartida con el cliente

---

**¿Necesitas ayuda?** Contacta al soporte de Vercel o revisa la documentación en https://vercel.com/docs
