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
