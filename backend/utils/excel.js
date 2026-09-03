import ExcelJS from 'exceljs';

// Column order shared by both the export and the import parser,
// so a downloaded file can always be re-uploaded without changes.
export const INVENTORY_COLUMNS = [
  { header: 'Codigo', key: 'code', width: 16 },
  { header: 'Nombre', key: 'name', width: 32 },
  { header: 'Categoria', key: 'category', width: 20 },
  { header: 'Unidad', key: 'unit', width: 12 },
  { header: 'Cantidad', key: 'quantity', width: 14 },
  { header: 'Stock minimo', key: 'min_stock', width: 14 },
  { header: 'Precio unitario', key: 'unit_price', width: 16 },
  { header: 'Bodega / Ubicacion', key: 'warehouse_location', width: 22 },
  { header: 'Obra asignada', key: 'project_name', width: 22 },
  { header: 'Notas', key: 'notes', width: 30 },
  { header: 'Imagen (URL)', key: 'image_url', width: 40 },
];

export async function buildInventoryWorkbook(items) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Insulog S.A.S.';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Inventario');
  sheet.columns = INVENTORY_COLUMNS;

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B2A38' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  items.forEach((item) => {
    sheet.addRow({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_stock: item.min_stock,
      unit_price: item.unit_price,
      warehouse_location: item.warehouse_location,
      project_name: item.projects?.name || '',
      notes: item.notes,
      image_url: item.image_url || '',
    });
  });

  sheet.autoFilter = { from: 'A1', to: 'K1' };
  return workbook;
}

// Parses an uploaded workbook back into an array of plain inventory rows.
// Any row missing a code or name is skipped and reported back to the caller.
export async function parseInventoryWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error('The file does not contain any sheets');
  }

  const headerRow = sheet.getRow(1).values; // 1-indexed, first item is empty
  const headerMap = {};
  INVENTORY_COLUMNS.forEach((col) => {
    const colIndex = headerRow.findIndex(
      (value) => typeof value === 'string' && value.trim().toLowerCase() === col.header.toLowerCase()
    );
    if (colIndex !== -1) headerMap[col.key] = colIndex;
  });

  const rows = [];
  const skipped = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const getCell = (key) => {
      const idx = headerMap[key];
      if (idx === undefined) return null;
      const cell = row.values[idx];
      return cell === undefined || cell === null ? null : cell;
    };

    const code = getCell('code');
    const name = getCell('name');

    if (!code || !name) {
      skipped.push({ row: rowNumber, reason: 'Falta codigo o nombre' });
      return;
    }

    rows.push({
      code: String(code).trim(),
      name: String(name).trim(),
      category: getCell('category') ? String(getCell('category')).trim() : null,
      unit: getCell('unit') ? String(getCell('unit')).trim() : 'UND',
      quantity: Number(getCell('quantity')) || 0,
      min_stock: Number(getCell('min_stock')) || 0,
      unit_price: Number(getCell('unit_price')) || 0,
      warehouse_location: getCell('warehouse_location') ? String(getCell('warehouse_location')).trim() : null,
      notes: getCell('notes') ? String(getCell('notes')).trim() : null,
      image_url: getCell('image_url') ? String(getCell('image_url')).trim() : null,
    });
  });

  return { rows, skipped };
}
