import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC calculation
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc >>> 0, 8 + len);
    return buf;
  }

  // Table for CRC
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff);
  }

  // Raw image data: height scanlines, each begins with filter byte 0
  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      // Draw a nice teal medical cross in center
      const cx = width / 2;
      const cy = height / 2;
      const armW = width * 0.16;
      const armL = width * 0.5;
      const isCross = (Math.abs(x - cx) < armW / 2 && Math.abs(y - cy) < armL / 2) ||
                      (Math.abs(y - cy) < armW / 2 && Math.abs(x - cx) < armL / 2);
      
      if (isCross) {
        raw[offset++] = 255; // White
        raw[offset++] = 255;
        raw[offset++] = 255;
      } else {
        // Teal background (#0d9488 = 13, 148, 136)
        raw[offset++] = r;
        raw[offset++] = g;
        raw[offset++] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(raw);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Generate icons
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 13, 148, 136));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 13, 148, 136));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 13, 148, 136));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 13, 148, 136));
console.log('PWA PNG Icons generated successfully!');
