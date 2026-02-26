// Document Viewer PDF Module
window.DocViewerPDF = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load PDF document
        loadPDF: async function () {
            // Validate file URL
            if (!CONFIG || !CONFIG.fileUrl) {
                console.error('DocViewerPDF: No fileUrl provided in configuration.');
                const errEl = document.getElementById('errorMessage');
                if (errEl) {
                    errEl.textContent = 'No document specified.';
                    errEl.style.display = 'block';
                }
                return;
            }

            // Show loading indicator if present
            const loadingEl = document.getElementById('loadingIndicator');
            if (loadingEl) loadingEl.style.display = 'block';

            // Ensure pdf.js worker is configured
            try {
                if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
                    if (CONFIG.workerSrc) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.workerSrc;
                    } else if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        // Fallback to pdfjs-dist default CDN (version-agnostic). It's better to set CONFIG.workerSrc in production.
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.338/pdf.worker.min.js';
                    }
                }
            } catch (wErr) {
                console.warn('DocViewerPDF: could not set pdfjs workerSrc', wErr);
            }

            try {
                // Provide flexibility: allow CONFIG.getDocumentOptions to pass extra options
                const getDocOptions = Object.assign({ url: CONFIG.fileUrl }, CONFIG.getDocumentOptions || {});

                const loadingTask = pdfjsLib.getDocument(getDocOptions);
                const pdfDoc = await loadingTask.promise;

                STATE.pdfDoc = pdfDoc;
                STATE.totalPages = pdfDoc.numPages || 0;
                STATE.currentPage = 1;
                // Ensure a sensible scale
                if (!STATE.scale || typeof STATE.scale !== 'number') STATE.scale = CONFIG.defaultScale || 1.25;

                // Update UI
                const pageCountEl = document.getElementById('pageCount');
                if (pageCountEl) pageCountEl.textContent = STATE.totalPages;

                const canvas = document.getElementById('pdfCanvas');
                if (canvas) canvas.style.display = 'block';
                // Do not render text layer: hide if present
                const textLayer = document.getElementById('textLayer');
                if (textLayer) textLayer.style.display = 'none';
                const highlightLayer = document.getElementById('highlightLayer');
                if (highlightLayer) highlightLayer.style.display = 'block';

                // If configured to skip rendering, do not render the page
                if (CONFIG && CONFIG.render === false) {
                    // Hide canvas and highlight layers to avoid any rendering
                    if (canvas) canvas.style.display = 'none';
                    if (textLayer) textLayer.style.display = 'none';
                    if (highlightLayer) highlightLayer.style.display = 'none';

                    // Optionally generate thumbnails but ignore errors
                    try {
                        if (window.DocViewerThumbnails && typeof window.DocViewerThumbnails.generatePDFThumbnails === 'function') {
                            await window.DocViewerThumbnails.generatePDFThumbnails();
                        }
                    } catch (thumbErr) {
                        console.warn('DocViewerPDF: thumbnail generation failed', thumbErr);
                    }

                    return;
                }

                // Render first page
                await this.renderPage(STATE.currentPage);

                // Generate thumbnails, ignore errors so viewer still works
                try {
                    if (window.DocViewerThumbnails && typeof window.DocViewerThumbnails.generatePDFThumbnails === 'function') {
                        await window.DocViewerThumbnails.generatePDFThumbnails();
                    }
                } catch (thumbErr) {
                    console.warn('DocViewerPDF: thumbnail generation failed', thumbErr);
                }
            } catch (err) {
                console.error('DocViewerPDF: failed to load PDF', err);
                const errEl = document.getElementById('errorMessage');
                if (errEl) {
                    errEl.textContent = 'Failed to load document.';
                    errEl.style.display = 'block';
                }
            } finally {
                if (loadingEl) loadingEl.style.display = 'none';
            }
        },

        // Render PDF page
        renderPage: async function (pageNum) {
            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            const highlightLayer = document.getElementById('highlightLayer');

            const page = await STATE.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: STATE.scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            // Text layer rendering disabled per user request
            // Position highlight layer
            if (highlightLayer) {
                highlightLayer.style.width = canvas.width + 'px';
                highlightLayer.style.height = canvas.height + 'px';
            }

            window.DocViewerHighlight.renderHighlights();
            window.DocViewerUI.updatePageInfo();

            // Re-apply search highlight if needed
            setTimeout(() => {
                const queryEl = document.getElementById('searchInput');
                const query = queryEl ? queryEl.value.trim() : '';
                if (query && STATE.currentSearchIndex >= 0 &&
                    STATE.searchResults[STATE.currentSearchIndex] &&
                    STATE.searchResults[STATE.currentSearchIndex].page === STATE.currentPage) {
                    window.DocViewerSearch.highlightSearchInViewer(query);
                }
            }, 150);
        }
    };
})();