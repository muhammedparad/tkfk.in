const sharp = require('sharp');

async function findDarkestInRegion(x1, y1, x2, y2) {
  const { data, info } = await sharp('public/certificate/certificate_template.jpeg').raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  let minBrightness = 999;
  let minRGB = [];
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      const idx = (y * W + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const brightness = (r+g+b)/3;
      if (brightness < minBrightness) {
        minBrightness = brightness;
        minRGB = [r, g, b];
      }
    }
  }
  return { minBrightness, minRGB };
}

async function run() {
  const title = await findDarkestInRegion(400, 440, 1200, 700);
  console.log('Title text darkest color:', title);
  
  const pid = await findDarkestInRegion(406, 290, 619, 315);
  console.log('PID label darkest color:', pid);

  const certThat = await findDarkestInRegion(400, 800, 800, 900);
  console.log('Certify that text darkest color:', certThat);
}
run();
