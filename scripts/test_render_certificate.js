const sharp = require('sharp');
const fs = require('fs');

async function testRender() {
  const templatePath = 'public/certificate/certificate_template.jpeg';
  const outputPath = 'public/certificate/test_generated_cert.png';

  const participantId = 'TKFK26-680020';
  const participantName = 'MUHAMMED RAFI E';

  // SVG overlay on top of 2560x1809
  // Participant ID:
  // "Participant ID:" is at x=406..619, y=290..313.
  // We place the ID value at x=640, y=312, font-size 28px, font-family Georgia/Cinzel/serif/sans-serif.
  // Name line:
  // Underline is from x=404 to x=1704 at y=1023. Center of line is x=1054.
  // Name baseline at y=995, font-size 56px, bold serif / Cinzel / Georgia.

  const svgOverlay = `
  <svg width="2560" height="1809" viewBox="0 0 2560 1809" xmlns="http://www.w3.org/2000/svg">
    <style>
      .pid-text {
        font-family: 'Times New Roman', Georgia, serif, sans-serif;
        font-size: 30px;
        font-weight: 700;
        fill: #3b2c1a;
        letter-spacing: 1px;
      }
      .name-text {
        font-family: 'Times New Roman', Georgia, 'Cinzel', serif;
        font-size: 58px;
        font-weight: 800;
        fill: #432912;
        letter-spacing: 2px;
        text-anchor: middle;
      }
    </style>

    <!-- Participant ID Value -->
    <text x="640" y="312" class="pid-text">${participantId}</text>

    <!-- Participant Name -->
    <text x="1054" y="995" class="name-text">${participantName.toUpperCase()}</text>
  </svg>
  `;

  await sharp(templatePath)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log('Successfully generated test certificate at:', outputPath);
}

testRender();
