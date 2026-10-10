// Unit test for Cover Spread Geometry and Artwork Layout Detection

import assert from 'node:assert';

// Import from compiled or transpile via tsx/node
// Or test directly with equivalent JS logic or load via ts-node/tsx:
async function runTests() {
  console.log('Testing Cover Spread Calculations...');

  // Test 1: A5 Paperback, 120 pages, 80 GSM Natural White
  // Trim: 148 x 210 mm
  // Caliper: 0.048 mm/page
  // Spine: 120 * 0.048 + 0.5 = 6.26 => 6.3 mm
  // Total trim spread width: 2 * 148 + 6.3 = 302.3 mm
  // Total spread with 3mm bleed: 302.3 + 6 = 308.3 mm
  // Height with bleed: 210 + 6 = 216 mm
  const { calculateCoverSpreadDimensions, detectArtworkLayout } = await import('./lib/coverSpread.ts');

  const calc1 = calculateCoverSpreadDimensions({
    pageCount: 120,
    size: 'a5-portrait',
    paper: 'natural-white',
    binding: 'paperback',
  });

  console.log('Test 1 (A5 Paperback 120pp):', {
    trim: `${calc1.trimWidthMm}x${calc1.trimHeightMm}`,
    spine: calc1.spineWidthMm,
    totalWithBleed: `${calc1.totalSpreadWithBleedWidthMm}x${calc1.totalSpreadWithBleedHeightMm}`,
    panels: {
      back: calc1.backWidthPercent.toFixed(1) + '%',
      spine: calc1.spineWidthPercent.toFixed(1) + '%',
      front: calc1.frontWidthPercent.toFixed(1) + '%',
    },
  });

  assert.strictEqual(calc1.trimWidthMm, 148);
  assert.strictEqual(calc1.trimHeightMm, 210);
  assert.strictEqual(calc1.spineWidthMm, 6.3);
  assert.strictEqual(calc1.totalSpreadWithBleedWidthMm, 308.3);
  assert.strictEqual(calc1.totalSpreadWithBleedHeightMm, 216);
  assert(Math.abs(calc1.backWidthPercent - calc1.frontWidthPercent) < 0.001, 'Front and back should be equal');

  // Test 2: A4 Hardcover, 300 pages, 130 GSM Art Matte
  // Trim: 210 x 297 mm
  // Caliper: 0.065 mm/page
  // Hardcover allowance: 3.5 mm
  // Spine: 300 * 0.065 + 3.5 = 19.5 + 3.5 = 23 mm
  // Total trim spread width: 2 * 210 + 23 = 443 mm
  // Total spread with bleed: 443 + 6 = 449 mm
  // Height with bleed: 297 + 6 = 303 mm
  const calc2 = calculateCoverSpreadDimensions({
    pageCount: 300,
    size: 'a4-portrait',
    paper: 'art-matte',
    binding: 'hardcover',
  });

  console.log('Test 2 (A4 Hardcover 300pp Art Matte):', {
    trim: `${calc2.trimWidthMm}x${calc2.trimHeightMm}`,
    spine: calc2.spineWidthMm,
    totalWithBleed: `${calc2.totalSpreadWithBleedWidthMm}x${calc2.totalSpreadWithBleedHeightMm}`,
  });

  assert.strictEqual(calc2.trimWidthMm, 210);
  assert.strictEqual(calc2.trimHeightMm, 297);
  assert.strictEqual(calc2.spineWidthMm, 23);
  assert.strictEqual(calc2.totalSpreadWithBleedWidthMm, 449);
  assert.strictEqual(calc2.totalSpreadWithBleedHeightMm, 303);

  // Test 3: Dynamic spine scaling with page counts (never fixed spine)
  const calc3a = calculateCoverSpreadDimensions({ pageCount: 50, binding: 'paperback' });
  const calc3b = calculateCoverSpreadDimensions({ pageCount: 200, binding: 'paperback' });
  const calc3c = calculateCoverSpreadDimensions({ pageCount: 500, binding: 'paperback' });
  console.log('Test 3 (Dynamic spine widths):', {
    '50pp': calc3a.spineWidthMm + 'mm',
    '200pp': calc3b.spineWidthMm + 'mm',
    '500pp': calc3c.spineWidthMm + 'mm',
  });
  assert(calc3a.spineWidthMm < calc3b.spineWidthMm, 'Spine should increase with pages');
  assert(calc3b.spineWidthMm < calc3c.spineWidthMm, 'Spine should increase with pages');

  // Test 4: Artwork layout detection
  // Wide full-wrap image: 900x580 -> aspect ratio 1.55
  const layoutWrap = detectArtworkLayout(900, 580, 1);
  console.log('Test 4a (Full wrap image):', layoutWrap);
  assert.strictEqual(layoutWrap.layout, 'full-wrap');

  // Portrait front-cover-only image: 400x600 -> aspect ratio 0.67
  const layoutFront = detectArtworkLayout(400, 600, 1);
  console.log('Test 4b (Front only image):', layoutFront);
  assert.strictEqual(layoutFront.layout, 'front-only');

  // Multi-page PDF: 3 pages
  const layoutMulti = detectArtworkLayout(600, 400, 3);
  console.log('Test 4c (Multi-page PDF):', layoutMulti);
  assert.strictEqual(layoutMulti.layout, 'multi-page');

  console.log('\n✓ ALL COVER SPREAD & DETECTION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
