import JSZip from 'jszip';
import { MATRIX_TEMPLATE } from '../data/template.js';

/**
 * Exporta una matriz como ZIP con:
 * - XLSX real (template Porvenir con todos los diseños y hojas)
 * - Carpeta Evidencias/ organizada por control
 */
export async function exportMatriz(project) {
  if (!project) return;

  const mainZip = new JSZip();

  // ── Cargar template base64 ──────────────────────────────────────
  const templateBytes = Uint8Array.from(atob(MATRIX_TEMPLATE), c => c.charCodeAt(0));
  const xlsxZip = await JSZip.loadAsync(templateBytes);

  // ── Leer XML internos del XLSX ──────────────────────────────────
  let sheetXml = await xlsxZip.file('xl/worksheets/sheet8.xml').async('string');
  let ssXml    = await xlsxZip.file('xl/sharedStrings.xml').async('string');

  const ssUniqMatch = ssXml.match(/uniqueCount="(\d+)"/);
  const ssCountMatch = ssXml.match(/count="(\d+)"/);
  let currentUnique = ssUniqMatch  ? parseInt(ssUniqMatch[1])  : 0;
  let currentCount  = ssCountMatch ? parseInt(ssCountMatch[1]) : 0;

  const newStrings  = [];
  const cellUpdates = [];

  // ── Por cada control: columna U = cumplimiento, V = evidencias ──
  (project.controls || []).forEach((ctrl, idx) => {
    const excelRow = idx + 9; // Row 9 = CT-001

    if (ctrl.compliance?.trim()) {
      cellUpdates.push({ row: excelRow, col: 'U', sIdx: currentUnique + newStrings.length });
      newStrings.push(ctrl.compliance);
    }

    const evs = (project.evidences || []).filter(e => e.controlId === ctrl.id);
    if (evs.length > 0) {
      const evText = evs.map((ev, ei) => {
        const fNames = ev.files?.length > 0 ? ev.files.map(f => f.name).join(', ') : '';
        return `Ev${ei + 1}: ${ev.description}${fNames ? ` [${fNames}]` : ''}`;
      }).join('\n');
      cellUpdates.push({ row: excelRow, col: 'V', sIdx: currentUnique + newStrings.length });
      newStrings.push(evText);
    }
  });

  // ── Actualizar sharedStrings.xml ────────────────────────────────
  if (newStrings.length > 0) {
    ssXml = ssXml.replace(/count="\d+"/,       `count="${currentCount  + newStrings.length}"`);
    ssXml = ssXml.replace(/uniqueCount="\d+"/, `uniqueCount="${currentUnique + newStrings.length}"`);
    const newSi = newStrings.map(s =>
      `<si><t xml:space="preserve">${s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      }</t></si>`
    ).join('');
    ssXml = ssXml.replace('</sst>', newSi + '</sst>');
  }

  // ── Actualizar sheet8.xml con celdas ────────────────────────────
  cellUpdates.forEach(upd => {
    const cellRef = upd.col + upd.row;
    const pat = `<c r="${cellRef}"`;
    const idx = sheetXml.indexOf(pat);

    if (idx >= 0) {
      const endSelf = sheetXml.indexOf('/>', idx);
      const endFull = sheetXml.indexOf('</c>', idx);

      if (endSelf >= 0 && (endFull < 0 || endSelf < endFull)) {
        const oldTag = sheetXml.substring(idx, endSelf + 2);
        const sm = oldTag.match(/s="(\d+)"/);
        const style = sm ? ` s="${sm[1]}"` : '';
        sheetXml = sheetXml.substring(0, idx)
          + `<c r="${cellRef}"${style} t="s"><v>${upd.sIdx}</v></c>`
          + sheetXml.substring(endSelf + 2);
      } else if (endFull >= 0) {
        const oldTag = sheetXml.substring(idx, endFull + 4);
        const sm = oldTag.match(/s="(\d+)"/);
        const style = sm ? ` s="${sm[1]}"` : '';
        sheetXml = sheetXml.substring(0, idx)
          + `<c r="${cellRef}"${style} t="s"><v>${upd.sIdx}</v></c>`
          + sheetXml.substring(endFull + 4);
      }
    } else {
      // Celda no existe — insertar al inicio de la fila
      const rowStart = `<row r="${upd.row}"`;
      const ri = sheetXml.indexOf(rowStart);
      if (ri >= 0) {
        const rowTagEnd = sheetXml.indexOf('>', ri);
        if (rowTagEnd >= 0) {
          sheetXml = sheetXml.substring(0, rowTagEnd + 1)
            + `<c r="${cellRef}" t="s"><v>${upd.sIdx}</v></c>`
            + sheetXml.substring(rowTagEnd + 1);
        }
      }
    }
  });

  // ── Reconstruir XLSX ────────────────────────────────────────────
  xlsxZip.file('xl/worksheets/sheet8.xml', sheetXml);
  xlsxZip.file('xl/sharedStrings.xml', ssXml);
  const modifiedXlsx = await xlsxZip.generateAsync({ type: 'arraybuffer' });

  const safeName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  mainZip.file(`MATRIZ_${safeName}.xlsx`, modifiedXlsx);

  // ── Carpeta de evidencias organizada por control ────────────────
  const evFolder = mainZip.folder('Evidencias');
  (project.controls || []).forEach(ctrl => {
    const evs = (project.evidences || []).filter(e => e.controlId === ctrl.id);
    if (!evs.length) return;

    const folderName = `${ctrl.code}_${(ctrl.causaBase || '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .substring(0, 40).trim()}`;
    const ctrlFolder = evFolder.folder(folderName);

    evs.forEach((ev, ei) => {
      let meta = `Control: ${ctrl.code} - ${ctrl.causaBase}\n`
               + `Evidencia: ${ev.description}\n`
               + `Tipo: ${ev.type}\n`
               + `Fecha: ${ev.date || ''}\n`
               + `Estado: ${ev.status}\n`;
      if (ev.reviewer) meta += `Revisor: ${ev.reviewer}\n`;
      if (ev.notes)    meta += `Notas: ${ev.notes}\n`;
      ctrlFolder.file(`Ev${ei + 1}_info.txt`, meta);

      (ev.files || []).forEach(f => {
        try {
          const b64 = f.data?.split(',')[1];
          if (b64) ctrlFolder.file(f.name || 'archivo', b64, { base64: true });
        } catch (e) {}
      });
    });
  });

  // ── Descargar ───────────────────────────────────────────────────
  const blob = await mainZip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${safeName}_Export.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
