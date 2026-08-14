import { deflateSync } from 'node:zlib';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const NAVY = [4, 31, 51];
const WHITE = [237, 244, 248];
const MUTED = [174, 195, 208];

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let current = value;
  for (let bit = 0; bit < 8; bit += 1) current = (current & 1) ? (0xedb88320 ^ (current >>> 1)) : (current >>> 1);
  return current >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const encodePng = (width, height, pixels) => {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 3 + 1);
    raw[rowOffset] = 0;
    pixels.copy(raw, rowOffset + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
};

const canvas = (width, height, color = NAVY) => {
  const pixels = Buffer.alloc(width * height * 3);
  for (let index = 0; index < width * height; index += 1) {
    pixels[index * 3] = color[0];
    pixels[index * 3 + 1] = color[1];
    pixels[index * 3 + 2] = color[2];
  }
  const setPixel = (x, y, nextColor) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= width || iy >= height) return;
    const offset = (iy * width + ix) * 3;
    pixels[offset] = nextColor[0];
    pixels[offset + 1] = nextColor[1];
    pixels[offset + 2] = nextColor[2];
  };
  const disc = (cx, cy, radius, nextColor) => {
    const r2 = radius * radius;
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
      for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) setPixel(x, y, nextColor);
      }
    }
  };
  const line = (x1, y1, x2, y2, thickness, nextColor) => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      disc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, nextColor);
    }
  };
  const ring = (cx, cy, radius, thickness, nextColor) => {
    const outer = radius + thickness / 2;
    const inner = Math.max(0, radius - thickness / 2);
    const outer2 = outer * outer;
    const inner2 = inner * inner;
    for (let y = Math.floor(cy - outer); y <= Math.ceil(cy + outer); y += 1) {
      for (let x = Math.floor(cx - outer); x <= Math.ceil(cx + outer); x += 1) {
        const distance = (x - cx) ** 2 + (y - cy) ** 2;
        if (distance <= outer2 && distance >= inner2) setPixel(x, y, nextColor);
      }
    }
  };
  return { width, height, pixels, setPixel, disc, line, ring };
};

const drawAnchor = (surface, cx, cy, size) => {
  const scale = size / 1024;
  const stroke = Math.max(4, 30 * scale);
  surface.ring(cx, cy, 390 * scale, Math.max(3, 12 * scale), MUTED);
  surface.ring(cx, cy - 242 * scale, 65 * scale, stroke, WHITE);
  surface.line(cx, cy - 175 * scale, cx, cy + 170 * scale, stroke, WHITE);
  surface.line(cx - 145 * scale, cy - 77 * scale, cx + 145 * scale, cy - 77 * scale, stroke, WHITE);
  surface.line(cx, cy + 168 * scale, cx - 220 * scale, cy + 80 * scale, stroke, WHITE);
  surface.line(cx, cy + 168 * scale, cx + 220 * scale, cy + 80 * scale, stroke, WHITE);
  surface.line(cx - 220 * scale, cy + 80 * scale, cx - 280 * scale, cy + 10 * scale, stroke, WHITE);
  surface.line(cx + 220 * scale, cy + 80 * scale, cx + 280 * scale, cy + 10 * scale, stroke, WHITE);
};

const writeCanvas = (path, surface) => writeFileSync(path, encodePng(surface.width, surface.height, surface.pixels));

mkdirSync('assets', { recursive: true });

const icon = canvas(1024, 1024);
drawAnchor(icon, 512, 512, 860);
writeCanvas('assets/icon.png', icon);
copyFileSync('assets/icon.png', 'assets/adaptive-icon.png');

const splash = canvas(1284, 2778);
drawAnchor(splash, 642, 1220, 560);
writeCanvas('assets/splash.png', splash);

const favicon = canvas(64, 64);
drawAnchor(favicon, 32, 32, 56);
writeCanvas('assets/favicon.png', favicon);

console.log('Brand assets generated: assets/icon.png, assets/adaptive-icon.png, assets/splash.png, assets/favicon.png');
