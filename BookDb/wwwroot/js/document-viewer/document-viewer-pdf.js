// Document Viewer PDF Module
window.DocViewerPDF = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load PDF document
        loadPDF: async function () {
            const pdfDoc = await pdfjsLib.getDocument(CONFIG.fileUrl).promise;
            STATE.pdfDoc = pdfDoc;
            STATE.totalPages = pdfDoc.numPages;

            document.getElementById('pageCount').textContent = STATE.totalPages;
            document.getElementById('pdfCanvas').style.display = 'block';
            document.getElementById('textLayer').style.display = 'block';
            document.getElementById('highlightLayer').style.display = 'block';

            await this.renderPage(1);
            await window.DocViewerThumbnails.generatePDFThumbnails();
        },

        // Render PDF page
        renderPage: async function (pageNum) {
            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            const textLayer = document.getElementById('textLayer');
            const highlightLayer = document.getElementById('highlightLayer');

            const page = await STATE.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: STATE.scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            // Render text layer
            textLayer.innerHTML = '';
            textLayer.style.width = canvas.width + 'px';
            textLayer.style.height = canvas.height + 'px';

            const textContent = await page.getTextContent();
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayer,
                viewport: viewport,
                textDivs: []
            });

            // Position highlight layer
            highlightLayer.style.width = canvas.width + 'px';
            highlightLayer.style.height = canvas.height + 'px';

            window.DocViewerHighlight.renderHighlights();
            window.DocViewerUI.updatePageInfo();

            // Re-apply search highlight if needed
            setTimeout(() => {
                const query = document.getElementById('searchInput').value.trim();
                if (query && STATE.currentSearchIndex >= 0 &&
                    STATE.searchResults[STATE.currentSearchIndex] &&
                    STATE.searchResults[STATE.currentSearchIndex].page === STATE.currentPage) {
                    window.DocViewerSearch.highlightSearchInViewer(query);
                }
            }, 150);
        }
    };
})();