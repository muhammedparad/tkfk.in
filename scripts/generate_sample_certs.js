const sharp = require('sharp');
const fs = require('fs');

const testCases = [
  { id: 'TKFK26-680020', name: 'MUHAMMED RAFI E' },
  { id: 'TKFK26-544046', name: 'MUHAMMED SWALIH K' },
  { id: 'TKFK26-998840', name: 'Kadeejath Jamseela C H' },
  { id: 'TKFK26-951610', name: 'Muhammed Mikdad' },
  { id: 'TKFK26-371033', name: 'Ahmad Ameen' },
  { id: 'TKFK26-111111', name: 'Fathimath Zuhra Mohamed Ali' }
];

async function generateAllTests() {
  const templatePath = 'public/certificate/certificate_template.jpeg';

  for (let i = 0; i < testCases.length; i++) {
    const { id, name } = testCases[i];

    // Format Name:
    const formattedName = name.trim();
    // Dynamic font sizing based on length:
    let fontSize = 62;
    if (formattedName.length > 24) fontSize = 50;
    if (formattedName.length > 30) fontSize = 42;

    const svgOverlay = `
    <svg width="2560" height="1809" viewBox="0 0 2560 1809" xmlns="http://www.w3.org/2000/svg">
      <style>
        .pid-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 32px;
          font-weight: 700;
          fill: #222222;
          letter-spacing: 0.5px;
        }
        .name-text {
          font-family: 'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: ${fontSize}px;
          font-weight: 800;
          fill: #432912;
          letter-spacing: 1.5px;
          text-anchor: middle;
        }
      </style>

      <!-- Participant ID -->
      <text x="640" y="312" class="pid-text">${id}</text>

      <!-- Participant Name: Centered horizontally over the underline (span 404 to 1704, center=1054), baseline y=996 (line at y=1023) -->
      <text x="1054" y="996" class="name-text">${formattedName.toUpperCase()}</text>
    </svg>
    `;

    const outName = `public/certificate/test_sample_${i+1}.png`;
    await sharp(templatePath)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .png()
      .toFile(outName);

    console.log('Generated:', outName, 'for', id, name);
  }
}
generateAllTests();
