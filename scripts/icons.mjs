/* Icônes de l'application (écran d'accueil du téléphone), faites à partir du portrait de ROULIAN dans la banque :
   public/icons/ n'est pas versionné, il est refait par `npm run sprites`. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'public', 'assets', 'characters', 'roulian', 'portrait.webp');
const OUT = join(ROOT, 'public', 'icons');

/** Fond violet, cadre jaune et noir façon pixel, portrait au centre. */
function frame(size, inset) {
  const b = Math.round(size * 0.035);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#1a1030"/>
    <rect x="${inset - 2 * b}" y="${inset - 2 * b}" width="${size - 2 * inset + 4 * b}" height="${size - 2 * inset + 4 * b}" fill="#1a1030"/>
    <rect x="${inset - b}" y="${inset - b}" width="${size - 2 * inset + 2 * b}" height="${size - 2 * inset + 2 * b}" fill="#ffd23f"/>
    <rect x="${inset}" y="${inset}" width="${size - 2 * inset}" height="${size - 2 * inset}" fill="#3d2a6b"/>
  </svg>`;
  return Buffer.from(svg);
}

async function icon(size, name, inset) {
  const inner = size - 2 * inset;
  const face = await sharp(SRC).resize(inner, inner, { fit: 'cover', position: 'top' }).png().toBuffer();
  await sharp(frame(size, inset))
    .composite([{ input: face, left: inset, top: inset }])
    .png()
    .toFile(join(OUT, name));
}

export async function makeIcons() {
  mkdirSync(OUT, { recursive: true });
  await icon(192, 'icon-192.png', 18);
  await icon(512, 'icon-512.png', 48);
  // « maskable » : le système peut rogner jusqu'à 20 % du bord
  await icon(512, 'maskable-512.png', 110);
  await icon(180, 'apple-touch-icon.png', 16);
  await icon(64, 'favicon.png', 6);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) await makeIcons();
