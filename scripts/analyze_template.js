const sharp = require('sharp');
const fs = require('fs');

async function analyze() {
  const image = sharp('public/certificate/certificate_template.jpeg');
  const metadata = await image.metadata();
  console.log('Image Metadata:', metadata);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;

  // Let's find dark horizontal lines in the middle vertical region (between y = 600 and y = 1400)
  console.log('Searching for horizontal line...');
  let detectedLines = [];

  for (let y = 600; y < 1400; y++) {
    let darkPixelsInRow = 0;
    let startX = -1;
    let endX = -1;
    for (let x = 200; x < W - 200; x++) {
      const idx = (y * W + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 100) { // dark pixel
        darkPixelsInRow++;
        if (startX === -1) startX = x;
        endX = x;
      }
    }
    if (darkPixelsInRow > 500) {
      detectedLines.push({ y, darkPixelsInRow, startX, endX });
    }
  }
  console.log('Detected underline candidates count:', detectedLines.length);
  if (detectedLines.length > 0) {
    console.log('Underline details:', detectedLines);
  }

  // Check top-left text "Participant ID:"
  console.log('\nChecking "Participant ID:" bounding box:');
  for (let y = 200; y < 400; y += 1) {
    let darkCount = 0;
    let minX = W, maxX = 0;
    for (let x = 200; x < 900; x++) {
      const idx = (y * W + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 120) {
        darkCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (darkCount > 20) {
      console.log(`y=${y}: dark=${darkCount}, x=[${minX}, ${maxX}]`);
    }
  }
}
analyze();
