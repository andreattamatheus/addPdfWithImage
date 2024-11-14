const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const pdfDirectory = "arts";

async function addImagesToPDF(filePath, outputFilePath) {
  // Load the existing PDF
  const existingPdfBytes = fs.readFileSync(filePath);

  // Load the images you want to add
  const image1Bytes = fs.readFileSync("images/image_1.png");
  const image2Bytes = fs.readFileSync("images/image_2.png");

  // Create a PDFDocument instance from the existing PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Ensure there is a second page; if not, add one
  if (pdfDoc.getPageCount() < 2) {
    pdfDoc.addPage();
  }

  // Get the first and second pages
  const firstPage = pdfDoc.getPage(0);
  const secondPage = pdfDoc.getPage(1);

  const { width: secondPageWidth, height: secondPageHeight } =
    secondPage.getSize();

  // Embed both images in the PDF document
  const pngImage1 = await pdfDoc.embedPng(image1Bytes);
  const pngImage2 = await pdfDoc.embedPng(image2Bytes);

  const border = 10; // 10px from the right

  //IMAGE 1
  // Set dimensions for the images
  const image1Width = 75;
  const image1Height = 54;

  // Calculate position (bottom right corner)
  const xPositionImage1 = secondPageWidth - image1Width - border;
  const yPositionImage1 = 40; // 10px from the bottom

  // IMAGE 2
  const image2Width = 150; // Width for the second image
  const image2Height = 75;

  const xPositionImage2 = border + 10; // 10px from the left
  const yPositionImage2 = 350;

  // Add ass_2.png to the first page at the top left
  firstPage.drawImage(pngImage2, {
    x: xPositionImage1,
    y: yPositionImage1,
    width: image1Width,
    height: image1Height,
  });

  // Add ass_1.png to the second page at the bottom right
  secondPage.drawImage(pngImage1, {
    x: xPositionImage2,
    y: yPositionImage2,
    width: image2Width,
    height: image2Height,
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(outputFilePath, pdfBytes);
}

async function processAllPDFsInFolder() {
  // Read the directory
  const files = fs.readdirSync(pdfDirectory);

  // Process each PDF file in the folder
  for (const file of files) {
    const filePath = path.join(pdfDirectory, file);

    // Check if the file is a PDF
    if (path.extname(file).toLowerCase() === ".pdf") {
      const outputFilePath = path.join(pdfDirectory, `modified_${file}`);
      console.log(`Processing ${file}...`);

      // Call addImagesToPDF for each PDF file
      await addImagesToPDF(filePath, outputFilePath);
      console.log(`Saved modified PDF as ${outputFilePath}`);
    }
  }
}

processAllPDFsInFolder().catch(console.error);
