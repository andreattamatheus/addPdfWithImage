# Stamp PDFs

A browser-based tool for stamping one or more images (logo, signature, watermark, etc.) onto a batch of PDFs. Position the stamp once by dragging it on a live preview, then apply it to every PDF you upload — no server, no file leaves your browser.

Originally a small Node.js script; rebuilt as a React app so it's usable from any device without installing anything.

## Features

- Upload multiple PDFs and multiple stamp images (PNG/JPG) at once
- Drag-to-position each stamp on a live page preview (position is stored as a percentage of the page, so it works correctly across PDFs of different sizes)
- Choose whether a stamp applies to the first page, last page, or every page
- Adjustable stamp size
- Progress bar while processing a batch
- One PDF downloads directly; multiple PDFs download as a zip
- 100% client-side — files are processed in your browser via `pdf-lib` / `pdfjs-dist` and never uploaded anywhere

## Tech Stack

- React + Vite
- [pdf-lib](https://pdf-lib.js.org/) — reading/writing PDFs
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — page preview rendering
- JSZip + FileSaver — batch download

## Running locally

```sh
git clone https://github.com/andreattamatheus/addPdfWithImage
cd addPdfWithImage
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

The output in `dist/` is fully static and can be hosted anywhere (Vercel, Netlify, GitHub Pages, etc.). `vite.config.js`'s `base` is set to `/tools/stamp-pdfs/` to match its current deployment at [tools.regradesign.com](https://tools.regradesign.com/tools/stamp-pdfs/) — change it (or pass `--base`) if you're hosting it at a different path.

## Contact

Matheus Andreatta — [@andreattamatheus](https://github.com/andreattamatheus)
