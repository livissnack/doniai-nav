/**
 * Build / extract Univer IDocumentData from plain text (docx import via mammoth).
 */

export function textToDocumentData(text, name = 'Document') {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  // Univer: paragraph ends with \r, document ends with \n
  let dataStream = ''
  const paragraphs = []
  for (const line of lines) {
    dataStream += line
    paragraphs.push({ startIndex: dataStream.length })
    dataStream += '\r'
  }
  dataStream += '\n'

  return {
    id: `doc_${Date.now()}`,
    title: String(name || 'Document'),
    body: {
      dataStream,
      textRuns: [],
      paragraphs,
      sectionBreaks: [{ startIndex: dataStream.length - 1 }],
    },
    documentStyle: {
      pageSize: { width: 595.3, height: 841.9 },
      marginTop: 72,
      marginBottom: 72,
      marginLeft: 72,
      marginRight: 72,
      renderConfig: {
        vertexAngle: 0,
        centerAngle: 0,
      },
    },
  }
}

export function documentDataToPlainText(snapshot) {
  const stream = snapshot?.body?.dataStream || ''
  return String(stream)
    .replace(/\r/g, '\n')
    .replace(/\n+$/, '')
}

export async function arrayBufferToDocumentData(buf, fileName = 'Document.docx') {
  const mammoth = (await import('mammoth')).default
  const result = await mammoth.extractRawText({ arrayBuffer: buf })
  const title = String(fileName || 'Document').replace(/\.[^.]+$/, '') || 'Document'
  return textToDocumentData(result.value || '', title)
}

export async function documentSnapshotToDocxBlob(snapshot, fileName = 'document.docx') {
  const { Document, Packer, Paragraph, TextRun } = await import('docx')
  const text = documentDataToPlainText(snapshot)
  const paragraphs = text.split(/\n/).map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || '', size: 24 })],
      }),
  )
  if (!paragraphs.length) {
    paragraphs.push(new Paragraph({ children: [new TextRun('')] }))
  }
  const doc = new Document({
    title: fileName,
    sections: [{ children: paragraphs }],
  })
  if (typeof Packer.toBlob === 'function') {
    return Packer.toBlob(doc)
  }
  const buffer = await Packer.toBuffer(doc)
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
