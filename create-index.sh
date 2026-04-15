#!/bin/bash

# Script para crear index.html necesario para el despliegue

echo "Creando index.html para despliegue..."

cat > index.html << 'HTML'
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
HTML

echo "✅ index.html creado exitosamente"
echo ""
echo "Ahora puedes ejecutar:"
echo "  vercel"
echo ""
echo "O hacer el build local con:"
echo "  pnpm run build"
