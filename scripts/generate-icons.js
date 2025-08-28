const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Crear directorio si no existe
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crear un SVG simple para Colorsitos
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#gradient)" />
  <circle cx="256" cy="200" r="60" fill="white" opacity="0.9" />
  <circle cx="180" cy="320" r="45" fill="white" opacity="0.8" />
  <circle cx="332" cy="320" r="45" fill="white" opacity="0.8" />
  <circle cx="256" cy="380" r="35" fill="white" opacity="0.7" />
  <text x="256" y="460" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">
    COLORSITOS
  </text>
</svg>
`;

async function generateIcons() {
  const sizes = [192, 512];

  console.log('Generando iconos PWA...');

  // Generar iconos cuadrados
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generado icon-${size}x${size}.png`);
  }

  // Generar icono para Apple touch
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generado apple-touch-icon.png');

  console.log('¡Iconos generados exitosamente!');
}

generateIcons().catch(console.error);