# addPdfWithImage

A small Node.js script that programmatically embeds images into an existing PDF using `pdf-lib`.

## Tech Stack

- Node.js
- [pdf-lib](https://pdf-lib.js.org/)

## Installation

```sh
git clone https://github.com/andreattamatheus/addPdfWithImage
cd addPdfWithImage
npm install
```

## Usage

Place your source PDF and images (`image_1.png`, `image_2.png`) in the expected folders (`arts/`, `images/`), then run:

```sh
node index.js
```

The script loads the PDF, ensures a second page exists, and embeds the images onto it, writing the result to an output file.

## Contact

Matheus Andreatta — [@andreattamatheus](https://github.com/andreattamatheus)
