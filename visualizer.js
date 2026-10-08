// visualizer.js — renders one trace step as an SVG memory diagram

function renderTrace(cells, prevCells) {
  prevCells = prevCells || [];

  const LABEL_W = 82;             // px reserved for variable name labels
  const BOX_X   = LABEL_W + 8;   // left edge of value boxes (90)
  const BOX_W   = 88;            // width of a scalar/pointer box
  const BOX_H   = 44;            // height of any box row
  const ROW_H   = 68;            // vertical spacing between rows
  const PAD_TOP = 40;            // extra top padding gives room for above-array routing
  const SVG_W   = 460;

  const svgH = PAD_TOP + cells.length * ROW_H + 20;

  // row index lookup by cell id
  const rowOf = {};
  cells.forEach((c, i) => { rowOf[c.id] = i; });

  // previous-step cell lookup by id
  const prevOf = {};
  prevCells.forEach(c => { prevOf[c.id] = c; });

  const rowTop = i => PAD_TOP + i * ROW_H;
  const rowMid = i => PAD_TOP + i * ROW_H + BOX_H / 2;

  function hasChanged(cell) {
    const p = prevOf[cell.id];
    if (!p) return true;                       // newly introduced cell
    if (cell.type     !== p.type)     return true;
    if (cell.value    !== p.value)    return true;
    if (cell.pointsTo !== p.pointsTo) return true;
    if (cell.items && JSON.stringify(cell.items) !== JSON.stringify(p.items)) return true;
    return false;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const arrowParts = [];  // drawn first (underneath boxes)
  const boxParts   = [];  // drawn on top

  // ── Cell rows ────────────────────────────────────────────────────────────
  cells.forEach((cell, i) => {
    const top  = rowTop(i);
    const mid  = rowMid(i);
    const hit  = hasChanged(cell);
    const stroke = hit ? '#bb0000' : '#777';
    const sw     = hit ? 2 : 1;
    const fill   = hit ? '#fff4f4' : '#f9f9f9';

    // Variable name label (right-aligned into label column)
    boxParts.push(
      `<text x="${LABEL_W}" y="${mid + 5}" ` +
      `font-family="monospace" font-size="13" text-anchor="end" fill="#222">${esc(cell.label)}</text>`
    );

    if (cell.type === 'array') {
      // Horizontal sub-boxes for int arrays
      const n    = cell.items.length;
      const subW = Math.min(56, Math.floor(240 / n));
      cell.items.forEach((val, j) => {
        const sx = BOX_X + j * subW;
        boxParts.push(`<rect x="${sx}" y="${top}" width="${subW}" height="${BOX_H}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
        boxParts.push(
          `<text x="${sx + subW / 2}" y="${mid + 5}" ` +
          `font-family="monospace" font-size="13" text-anchor="middle" fill="#111">${val}</text>`
        );
      });

    } else if (cell.type === 'int') {
      boxParts.push(`<rect x="${BOX_X}" y="${top}" width="${BOX_W}" height="${BOX_H}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
      boxParts.push(
        `<text x="${BOX_X + BOX_W / 2}" y="${mid + 5}" ` +
        `font-family="monospace" font-size="14" text-anchor="middle" fill="#111">${cell.value}</text>`
      );

    } else {
      // ptr or ptr_null
      boxParts.push(`<rect x="${BOX_X}" y="${top}" width="${BOX_W}" height="${BOX_H}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
      const sym = cell.type === 'ptr_null' ? '?' : '&#9679;';  // ● or ?
      boxParts.push(
        `<text x="${BOX_X + BOX_W / 2}" y="${mid + 7}" ` +
        `font-family="monospace" font-size="18" text-anchor="middle" fill="#444">${sym}</text>`
      );
    }
  });

  // ── Arrows (pointer → pointee) ───────────────────────────────────────────
  // Default: exit right edge of source → route through right channel → enter left edge of target.
  // Array targets: approach from ABOVE into the top-center of arr[0] so the shaft
  //   never appears to pass through arr[1..n] (which would make the target ambiguous).
  // Boxes are drawn on top so arrowhead bodies that dip inside a box are hidden cleanly.

  // id→cell lookup for target-type detection
  const cellOf = {};
  cells.forEach(c => { cellOf[c.id] = c; });

  let slot = 0;
  cells.forEach((cell, i) => {
    if (cell.type !== 'ptr' || !cell.pointsTo) return;
    const j = rowOf[cell.pointsTo];
    if (j === undefined) return;

    const targetCell = cellOf[cell.pointsTo];
    const x0  = BOX_X + BOX_W;                    // exit: right edge of source
    const y0  = rowMid(i);
    const cx1 = BOX_X + BOX_W + 38 + slot * 22;  // routing column x

    let x3, y3, cpx2, cpy2;

    if (targetCell && targetCell.type === 'array') {
      // Enter the TOP-CENTER of arr[0] with a downward approach.
      // Keeps the visible shaft above the array row — no ambiguity about which element.
      const n    = targetCell.items.length;
      const subW = Math.min(56, Math.floor(240 / n));
      x3   = BOX_X + subW / 2;              // horizontal center of arr[0]
      y3   = rowTop(j);                     // top edge of arr[0]
      cpx2 = x3;                            // CP2 aligned above arr[0] — ensures downward tangent at end
      cpy2 = Math.max(rowTop(j) - 20, 5);  // 20 px above array (PAD_TOP=40 guarantees room)
    } else {
      // Scalar/pointer target: enter left-center as before
      x3   = BOX_X;
      y3   = rowMid(j);
      cpx2 = cx1;
      cpy2 = y3;
    }

    const hit   = hasChanged(cell);
    const color = hit ? '#bb0000' : '#0055cc';
    const mId   = hit ? 'ahr' : 'ahb';

    arrowParts.push(
      `<path d="M ${x0} ${y0} C ${cx1} ${y0}, ${cpx2} ${cpy2}, ${x3} ${y3}" ` +
      `fill="none" stroke="${color}" stroke-width="1.5" marker-end="url(#${mId})"/>`
    );
    slot++;
  });

  const defs = `<defs>
    <marker id="ahb" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#0055cc"/>
    </marker>
    <marker id="ahr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#bb0000"/>
    </marker>
  </defs>`;

  return (
    `<svg width="${SVG_W}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">` +
    defs +
    arrowParts.join('') +   // arrows under boxes
    boxParts.join('') +     // boxes on top (cover arrowhead bodies)
    `</svg>`
  );
}
