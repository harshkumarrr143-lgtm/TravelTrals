import sharp from 'sharp';
import fs from 'fs';

async function processLogo() {
  const inputPath = 'public/traveltales-logo.jpg';
  const outputPath = 'public/traveltales-logo.png';

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // Look at corner pixels to determine background color
  // Corner (0,0):
  const r0 = data[0], g0 = data[1], b0 = data[2];
  console.log(`Background sample: R=${r0}, G=${g0}, B=${b0}`);

  // Create RGBA buffer
  const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    // Background is light sky blue / whitish (e.g. R > 195, G > 220, B > 235 or close to corner sample)
    // Distance to corner color:
    const dist = Math.sqrt((r - r0)**2 + (g - g0)**2 + (b - b0)**2);

    let alpha = 255;
    // If it's very close to background color or overall bright whitish-cyan
    if (dist < 45 || (r > 190 && g > 220 && b > 235) || (r > 230 && g > 235 && b > 240)) {
      alpha = 0;
    } else if (dist < 65) {
      // Soft antialiasing edge
      alpha = Math.round(((dist - 45) / 20) * 255);
    }

    rgbaBuffer[i * 4] = r;
    rgbaBuffer[i * 4 + 1] = g;
    rgbaBuffer[i * 4 + 2] = b;
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  await sharp(rgbaBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully created transparent logo:', outputPath);
}

// Also process site icon if it has an outer box
async function processIcon() {
  const inputPath = 'public/site-icon.jpg';
  const outputPath = 'public/site-icon.png';

  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const r0 = data[0], g0 = data[1], b0 = data[2];
  console.log(`Icon Background sample: R=${r0}, G=${g0}, B=${b0}`);

  const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    const dist = Math.sqrt((r - r0)**2 + (g - g0)**2 + (b - b0)**2);
    let alpha = 255;
    if (dist < 35 || (r > 240 && g > 240 && b > 240)) {
      alpha = 0;
    } else if (dist < 50) {
      alpha = Math.round(((dist - 35) / 15) * 255);
    }

    rgbaBuffer[i * 4] = r;
    rgbaBuffer[i * 4 + 1] = g;
    rgbaBuffer[i * 4 + 2] = b;
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  await sharp(rgbaBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully created transparent icon:', outputPath);
}

async function main() {
  await processLogo();
  await processIcon();
}

main().catch(console.error);
