/**
 * Convert SheetJS workbook <-> Univer IWorkbookData (client-side, no Pro server).
 */

function cellValueType(v) {
  if (typeof v === 'boolean') return 3
  if (typeof v === 'number') return 2
  return 1
}

export function sheetJsToUniverData(XLSX, workbook, name = 'Workbook') {
  const sheets = {}
  const sheetOrder = []

  for (const sheetName of workbook.SheetNames || []) {
    const id = `sheet_${sheetOrder.length + 1}`
    sheetOrder.push(id)
    const ws = workbook.Sheets[sheetName] || {}
    const ref = ws['!ref']
    const range = ref
      ? XLSX.utils.decode_range(ref)
      : { s: { r: 0, c: 0 }, e: { r: 29, c: 9 } }

    const cellData = {}
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = ws[addr]
        if (!cell || cell.v === undefined || cell.v === null) continue
        if (!cellData[R]) cellData[R] = {}
        const entry = {
          v: cell.v,
          t: cellValueType(cell.v),
        }
        if (cell.f) entry.f = String(cell.f).startsWith('=') ? String(cell.f) : `=${cell.f}`
        cellData[R][C] = entry
      }
    }

    sheets[id] = {
      id,
      name: sheetName,
      cellData,
      rowCount: Math.max(100, range.e.r + 40),
      columnCount: Math.max(26, range.e.c + 10),
    }
  }

  if (!sheetOrder.length) {
    const id = 'sheet_1'
    sheetOrder.push(id)
    sheets[id] = {
      id,
      name: 'Sheet1',
      cellData: {},
      rowCount: 100,
      columnCount: 26,
    }
  }

  return {
    id: `wb_${Date.now()}`,
    name,
    appVersion: '3.0.0',
    locale: 'zhCN',
    styles: {},
    sheetOrder,
    sheets,
  }
}

export function univerDataToSheetJs(XLSX, snapshot) {
  const workbook = XLSX.utils.book_new()
  const order = snapshot?.sheetOrder || Object.keys(snapshot?.sheets || {})
  for (const sheetId of order) {
    const sheet = snapshot.sheets?.[sheetId]
    if (!sheet) continue
    const cellData = sheet.cellData || {}
    let maxR = 0
    let maxC = 0
    Object.keys(cellData).forEach((rKey) => {
      const r = Number(rKey)
      if (!Number.isFinite(r)) return
      maxR = Math.max(maxR, r)
      const row = cellData[rKey] || {}
      Object.keys(row).forEach((cKey) => {
        const c = Number(cKey)
        if (Number.isFinite(c)) maxC = Math.max(maxC, c)
      })
    })

    const aoa = []
    for (let r = 0; r <= maxR; r++) {
      const rowArr = []
      const row = cellData[r] || cellData[String(r)] || {}
      for (let c = 0; c <= maxC; c++) {
        const cell = row[c] || row[String(c)]
        if (!cell) {
          rowArr.push('')
          continue
        }
        if (cell.f) {
          rowArr.push({ t: 'n', f: String(cell.f).replace(/^=/, ''), v: cell.v })
        } else {
          rowArr.push(cell.v ?? '')
        }
      }
      aoa.push(rowArr)
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa.length ? aoa : [['']])
    const safeName = String(sheet.name || sheetId).slice(0, 31) || 'Sheet'
    XLSX.utils.book_append_sheet(workbook, ws, safeName)
  }
  if (!workbook.SheetNames.length) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([[]]), 'Sheet1')
  }
  return workbook
}

export async function arrayBufferToUniverData(buf, fileName = 'Workbook') {
  const XLSX = await import('xlsx')
  const lower = String(fileName || '').toLowerCase()
  let workbook
  if (lower.endsWith('.csv')) {
    const text = new TextDecoder().decode(buf)
    workbook = XLSX.read(text, { type: 'string' })
  } else {
    workbook = XLSX.read(buf, { type: 'array' })
  }
  return {
    XLSX,
    workbook,
    data: sheetJsToUniverData(XLSX, workbook, fileName.replace(/\.[^.]+$/, '') || 'Workbook'),
  }
}

export async function univerSnapshotToXlsxBlob(snapshot, fileName = 'workbook.xlsx') {
  const XLSX = await import('xlsx')
  const workbook = univerDataToSheetJs(XLSX, snapshot)
  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
