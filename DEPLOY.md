# Guía de Despliegue - Aplicación Thinkia

## Opción 1: Desplegar con Vercel (Recomendado)

1. Crear cuenta en https://vercel.com
2. Instalar Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Desde la carpeta del proyecto, ejecutar:
   ```bash
   vercel
   ```
4. Seguir las instrucciones en pantalla
5. Tu aplicación estará disponible en una URL pública tipo: https://tu-app.vercel.app

## Opción 2: Desplegar con Netlify

1. Crear cuenta en https://netlify.com
2. Instalar Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
3. Ejecutar:
   ```bash
   netlify deploy
   ```

## Opción 3: Compartir código

1. Comprimir la carpeta completa del proyecto
2. Enviar al cliente el archivo ZIP
3. El cliente deberá instalar Node.js y ejecutar:
   ```bash
   pnpm install
   pnpm run dev
   ```

## Nota Importante

Esta es una aplicación web de React, NO un archivo de Figma. 
No se puede exportar como prototipo de Figma.
