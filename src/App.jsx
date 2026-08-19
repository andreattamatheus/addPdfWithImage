import { useMemo, useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import StampCanvas from './components/StampCanvas'
import { stampPdf } from './lib/stampPdf'
import './App.css'

let nextStampId = 1

function App() {
  const [pdfFiles, setPdfFiles] = useState([])
  const [stamps, setStamps] = useState([])
  const [status, setStatus] = useState('idle') // idle | processing | done
  const [progress, setProgress] = useState(0)

  const referencePdf = pdfFiles[0] ?? null

  async function addStampImages(fileList) {
    const files = Array.from(fileList)
    const newStamps = await Promise.all(
      files.map(async (file) => {
        const imageBytes = await file.arrayBuffer()
        return {
          id: nextStampId++,
          name: file.name,
          imageBytes,
          imageKind: file.type === 'image/jpeg' ? 'jpg' : 'png',
          previewUrl: URL.createObjectURL(file),
          xPct: 70,
          yPct: 85,
          widthPct: 20,
          heightPct: 12,
          target: 'all',
        }
      }),
    )
    setStamps((prev) => [...prev, ...newStamps])
  }

  function updateStamp(id, patch) {
    setStamps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeStamp(id) {
    setStamps((prev) => prev.filter((s) => s.id !== id))
  }

  const canProcess = pdfFiles.length > 0 && stamps.length > 0 && status !== 'processing'

  async function processAll() {
    setStatus('processing')
    setProgress(0)

    const results = []
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i]
      const pdfBytes = await file.arrayBuffer()
      const outputBytes = await stampPdf(pdfBytes, stamps)
      results.push({ name: `stamped_${file.name}`, bytes: outputBytes })
      setProgress(Math.round(((i + 1) / pdfFiles.length) * 100))
    }

    if (results.length === 1) {
      saveAs(new Blob([results[0].bytes], { type: 'application/pdf' }), results[0].name)
    } else {
      const zip = new JSZip()
      for (const result of results) {
        zip.file(result.name, result.bytes)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'stamped-pdfs.zip')
    }

    setStatus('done')
  }

  const pdfCountLabel = useMemo(
    () => (pdfFiles.length === 1 ? '1 PDF' : `${pdfFiles.length} PDFs`),
    [pdfFiles.length],
  )

  return (
    <div className="app">
      <header>
        <h1>Carimbar PDFs</h1>
        <p>Solte suas imagens sobre um PDF, posicione uma vez e aplique o carimbo em todos os arquivos do lote — tudo no seu navegador, nada é enviado para lugar nenhum.</p>
      </header>

      <section className="panel">
        <h2>1. Adicione seus PDFs</h2>
        <label className="dropzone">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setPdfFiles(Array.from(e.target.files))}
          />
          {pdfFiles.length === 0 ? 'Clique para escolher um ou mais PDFs' : `${pdfCountLabel} selecionado(s)`}
        </label>
      </section>

      <section className="panel">
        <h2>2. Adicione as imagens do carimbo</h2>
        <label className="dropzone">
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={(e) => addStampImages(e.target.files)}
          />
          Clique para escolher imagens PNG/JPG
        </label>

        {stamps.length > 0 && (
          <ul className="stamp-list">
            {stamps.map((stamp) => (
              <li key={stamp.id} className="stamp-row">
                <img src={stamp.previewUrl} alt={stamp.name} className="stamp-thumb" />
                <span className="stamp-name">{stamp.name}</span>

                <label>
                  Aplicar em
                  <select
                    value={stamp.target}
                    onChange={(e) => updateStamp(stamp.id, { target: e.target.value })}
                  >
                    <option value="all">todas as páginas</option>
                    <option value="first">primeira página</option>
                    <option value="last">última página</option>
                  </select>
                </label>

                <label>
                  Tamanho %
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={Math.round(stamp.widthPct)}
                    onChange={(e) => {
                      const widthPct = Number(e.target.value)
                      updateStamp(stamp.id, { widthPct, heightPct: widthPct * (stamp.heightPct / stamp.widthPct) })
                    }}
                  />
                </label>

                <button type="button" onClick={() => removeStamp(stamp.id)} className="remove-btn">
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>3. Posicione os carimbos</h2>
        <p className="hint">Arraste cada imagem sobre a prévia abaixo. A posição é salva como porcentagem, então ela se aplica corretamente a todos os PDFs do lote, mesmo que o tamanho das páginas seja diferente.</p>
        <StampCanvas pdfFile={referencePdf} stamps={stamps} onChange={updateStamp} />
      </section>

      <section className="panel">
        <h2>4. Gerar</h2>
        <button type="button" className="primary-btn" disabled={!canProcess} onClick={processAll}>
          {status === 'processing' ? 'Processando…' : `Carimbar ${pdfCountLabel || 'PDFs'}`}
        </button>

        {status === 'processing' && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-label">{progress}%</span>
          </div>
        )}

        {status === 'done' && <p className="success">Pronto! O download deve ter começado.</p>}
      </section>
    </div>
  )
}

export default App
