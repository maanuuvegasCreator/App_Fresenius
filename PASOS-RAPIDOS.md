# 🚀 Despliegue Rápido - 3 Pasos

## Método Recomendado: GitHub + Vercel (5 minutos)

### 📋 Antes de empezar:
1. Ejecuta el script para crear el archivo necesario:
   ```bash
   ./create-index.sh
   ```

---

### Paso 1️⃣: Sube a GitHub

```bash
# Inicializa git (si no lo has hecho)
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Aplicación Thinkia Softphone lista para desplegar"

# Conecta con GitHub (reemplaza TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

**¿No tienes repositorio?** 
- Ve a https://github.com/new
- Crea uno llamado `thinkia-softphone`
- Copia la URL que te da

---

### Paso 2️⃣: Conecta con Vercel

1. Ve a **https://vercel.com**
2. Click en **"Sign Up"** → usa tu cuenta de GitHub
3. Click en **"Add New..."** → **"Project"**
4. Busca y selecciona tu repositorio `thinkia-softphone`
5. Click en **"Deploy"** (no cambies nada más)

---

### Paso 3️⃣: ¡Listo! 🎉

En 2-3 minutos tendrás tu URL:
**`https://thinkia-softphone.vercel.app`**

**Comparte esta URL con tu cliente** - puede abrirla en cualquier navegador.

---

## ⚡ Alternativa Súper Rápida: CLI

Si prefieres no usar GitHub:

```bash
# 1. Crea el index.html
./create-index.sh

# 2. Instala Vercel CLI (solo la primera vez)
npm install -g vercel

# 3. Despliega
vercel

# 4. Para producción
vercel --prod
```

Obtendrás la URL inmediatamente.

---

## 📱 Lo que puede hacer el cliente

✅ Abrir la aplicación en cualquier navegador  
✅ Navegar por todas las páginas  
✅ Probar todas las funcionalidades  
✅ Verla en móvil y escritorio  
✅ Compartir el enlace con otros  

**No necesita instalar nada** - solo abrir la URL.

---

## 🔄 Actualizar después

Si haces cambios:

**Con GitHub:**
```bash
git add .
git commit -m "Actualización"
git push
```
Vercel detecta el cambio y actualiza automáticamente.

**Con CLI:**
```bash
vercel --prod
```

---

## 🆘 ¿Problemas?

**Error al hacer build:**
```bash
# Instala las dependencias
pnpm install

# Prueba el build local
pnpm run build
```

**Vercel no encuentra el proyecto:**
- Asegúrate de que el repositorio sea público
- O dale permisos a Vercel en GitHub Settings

**Más ayuda:** Lee `GUIA-DESPLIEGUE-VERCEL.md` con instrucciones detalladas.
