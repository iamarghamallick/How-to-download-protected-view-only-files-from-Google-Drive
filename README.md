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

4.  Paste below code and press Enter:

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
        let jspdf = document.createElement("script");
        jspdf.onload = function () {
            // Generate a PDF from images with "blob:" sources.
            let pdf = new jsPDF();
            let elements = document.getElementsByTagName("img");
            for (let i = 0; i < elements.length; i++) {
                let img = elements[i];
                if (!/^blob:/.test(img.src)) {
                    continue;
                }
                let canvasElement = document.createElement('canvas');
                let con = canvasElement.getContext("2d");
                canvasElement.width = img.width;
                canvasElement.height = img.height;
                con.drawImage(img, 0, 0, img.width, img.height);
                let imgData = canvasElement.toDataURL("image/jpeg", 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0);
                if (i !== elements.length - 1) {
                    pdf.addPage();
                }
            }
            pdf.save("download.pdf");
        };
        jspdf.src = trustedURL;
        document.body.appendChild(jspdf);

5. Now, the pdf file start to download. This might take a few minutes depending on the file size.

## Disclaimer
This script is intended for educational purposes only. Please respect copyright laws and the terms of service of Google Drive.