# Download Protected View-Only Files from Google Drive

This repository provides a simple script to download protected or view-only files from Google Drive. The script leverages the jsPDF library to capture images displayed in a preview and compiles them into a downloadable PDF file.

## Features
- Works with view-only or protected Google Drive files.
- Converts images from the preview into a downloadable PDF.
- Supports Google Chrome, Firefox, Microsoft Edge, and Apple Safari.

## Usage

1. Open or Preview Any view-only or protected files from google drive on your web browser.

2. Open Developer Console.
    If you are previewing in Google Chrome or Firefox
    Press Shift + Ctrl + J ( on Windows / Linux) or Option + ⌘  + J (on Mac)
    If you are previewing in Microsoft Edge
    Press Shift + Ctrl + I
    If you are previewing in Apple Safari
    Press Option + ⌘ + C
    Then you will find yourself inside the developer tools.

3.  Navigate to the "Console" tab.

4.  Type `'allow pasting'` (with quotes) and press Enter.

4.  Paste below code and press Enter:

        (function() {
          const IMG_SELECTOR = 'img[src^="blob:"]';

          const getPages = function() {
            const images = [...document.querySelectorAll(IMG_SELECTOR)];
            if(images.length === 0) {
              throw new Error("No images found");
            }
            const firstPage = images[0].parentElement;
            const className = firstPage.className;
            if(!className || className.match(/\s/)) {
              throw new Error("Couldn't identify CSS class name of page placeholders");
            }

            return [...firstPage.parentElement.querySelectorAll(`:scope > .${CSS.escape(className)}`)];
          }

          const buildPDF = async function() {
            let pdf;

            // Generate a PDF from images with "blob:" sources.
            for(const page of getPages()) {
              const img = await getImage(page);
              const width = img.naturalWidth;
              const height = img.naturalHeight;

              if(!pdf) {
                pdf = new jsPDF({ unit: 'px', format: [width, height] });
              }
              else {
                pdf.addPage([width, height]);
              }

              const canvasElement = document.createElement('canvas');
              const con = canvasElement.getContext("2d");
              canvasElement.width = width;
              canvasElement.height = height;
              con.drawImage(img, 0, 0, width, height);
              const imgData = canvasElement.toDataURL("image/jpeg", 1.0);
              pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
            }

            return pdf;
          };

          // Get the image on the specified page if it's already loaded, or wait for it to load
          const getImage = async function(page) {
            const img = page.querySelector(IMG_SELECTOR) || await loadImage(page);
            if(img.complete) {
              return img;
            }
            return new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = (e) => reject(e);
            });
          };

          // Scroll to the page and wait for the image to load
          const loadImage = function(page) {
            return new Promise((resolve, _reject) => {
              const mutationCallback = (_, observer) => {
                const img = page.querySelector(IMG_SELECTOR);
                if(img) {
                  observer.disconnect();
                  resolve(img);
                }
              };
              new MutationObserver(mutationCallback).observe(page, { childList: true, attributes: true, subtree: true });
              page.scrollIntoView();
            });
          }

          const downloadPDF = function() {
            buildPDF()
              .then(pdf => {
                pdf.save("download.pdf");
              })
              .catch((e) => {
                console.log(e);
                alert(e);
              });
          }

          let trustedURL;
          if (window.trustedTypes && trustedTypes.createPolicy) {
              const policy = trustedTypes.createPolicy('myPolicy', {
                  createScriptURL: (input) => {
                      return input;
                  }
              });
              trustedURL = policy.createScriptURL('https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js');
          } else {
              trustedURL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js';
          }

          // Load the jsPDF library using the trusted URL.
          const jspdf = document.createElement("script");
          jspdf.onload = downloadPDF;
          jspdf.src = trustedURL;
          document.body.appendChild(jspdf);
        })();

5. Now, the pdf file start to download. This might take a few minutes depending on the file size.

## Disclaimer
This script is intended for educational purposes only. Please respect copyright laws and the terms of service of Google Drive.
