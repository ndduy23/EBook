// Document Viewer Thumbnails Module
window.DocViewerThumbnails = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Generate PDF thumbnails
        generatePDFThumbnails: async function () {
            const container = document.getElementById('pagesContainer');
            container.innerHTML = '<p class="text-muted text-center">Đang tạo thumbnails...</p>';

            const thumbnails = [];
            const scale = 0.3;

            for (let i = 1; i <= Math.min(STATE.totalPages, 20); i++) {
                try {
                    const page = await STATE.pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    }).promise;

                    thumbnails.push({
                        pageNum: i,
                        canvas: canvas
                    });
                } catch (error) {
                    console.error(`Error generating thumbnail for page ${i}:`, error);
                }
            }

            this.displayThumbnails(thumbnails);
        },

        // Generate text thumbnails
        generateTextThumbnails: function () {
            const container = document.getElementById('pagesContainer');
            const thumbnails = [];

            for (let i = 1; i <= Math.min(STATE.totalPages, 20); i++) {
                const pageContent = STATE.content[i - 1] || [];
                const text = Array.isArray(pageContent)
                    ? pageContent.join('\n').substring(0, 200)
                    : (pageContent || '').substring(0, 200);

                thumbnails.push({
                    pageNum: i,
                    text: text
                });
            }

            this.displayTextThumbnails(thumbnails);
        },

        // Generate DOCX thumbnails
        generateDocxThumbnails: function () {
            this.generateTextThumbnails();
        },

        // Generate Excel thumbnails
        generateExcelThumbnails: function () {
            const container = document.getElementById('pagesContainer');
            const thumbnails = [];

            if (STATE.rawExcelWorkbook) {
                STATE.rawExcelWorkbook.SheetNames.forEach((sheetName, index) => {
                    if (index < 20) {
                        thumbnails.push({
                            pageNum: index + 1,
                            text: sheetName
                        });
                    }
                });
            }

            this.displayTextThumbnails(thumbnails);
        },

        // Display canvas thumbnails
        displayThumbnails: function (thumbnails) {
            const container = document.getElementById('pagesContainer');

            if (thumbnails.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Không có thumbnails</p>';
                return;
            }

            container.innerHTML = thumbnails.map(t => `
                <div class="thumbnail-item" data-page="${t.pageNum}" 
                     onclick="window.DocViewerNavigation.changePage(${t.pageNum})">
                    <div id="thumb-canvas-${t.pageNum}"></div>
                    <div class="thumbnail-label">Trang ${t.pageNum}</div>
                </div>
            `).join('');

            // Append canvas elements
            thumbnails.forEach(t => {
                const thumbContainer = document.getElementById(`thumb-canvas-${t.pageNum}`);
                if (thumbContainer && t.canvas) {
                    t.canvas.className = 'thumbnail-canvas';
                    thumbContainer.appendChild(t.canvas);
                }
            });

            // Highlight current page
            this.updateSelection();
        },

        // Display text thumbnails
        displayTextThumbnails: function (thumbnails) {
            const container = document.getElementById('pagesContainer');

            if (thumbnails.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Không có thumbnails</p>';
                return;
            }

            container.innerHTML = thumbnails.map(t => `
                <div class="thumbnail-item" data-page="${t.pageNum}"
                     onclick="window.DocViewerNavigation.changePage(${t.pageNum})">
                    <div class="thumbnail-canvas" style="padding: 10px; background: white; 
                         border: 1px solid #ddd; min-height: 100px; font-size: 10px; 
                         overflow: hidden;">
                        ${window.DocViewerUtils.escapeHtml(t.text)}...
                    </div>
                    <div class="thumbnail-label">Trang ${t.pageNum}</div>
                </div>
            `).join('');

            this.updateSelection();
        },

        // Update thumbnail selection
        updateSelection: function () {
            document.querySelectorAll('.thumbnail-item').forEach((item, index) => {
                item.classList.toggle('active', index + 1 === STATE.currentPage);
            });
        }
    };
})();