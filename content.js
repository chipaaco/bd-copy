browser.runtime.onMessage.addListener((request) => {
  if (request.action === "copyContent") {
    const viewerDiv = document.querySelector('div.viewer');
    if (viewerDiv) {
      const html = viewerDiv.innerHTML; // or innerText for text
      navigator.clipboard.writeText(html).then(() => {
        console.log('HTML copiado al portapapeles');
      });
    }
  }
});
