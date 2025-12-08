// Document Viewer Excel Module
window.DocViewerExcel = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load Excel document
        loadExcel: async function () {
            window.DocViewerUI.showLoading('Đang tải tài liệu Excel...');

            try {
                const response = await fetch(CONFIG.fileUrl);
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                STATE.rawExcelWorkbook = workbook;

                // Convert each sheet to HTML
                const sheets = [];
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    sheets.push({
                        name: sheetName,
                        html: html
                    });
                });

                // Each sheet is a page
                STATE.content = sheets.map(s => s.html);
                STATE.totalPages = sheets.length;

                document.getElementById('pageCount').textContent = STATE.totalPages;
                document.getElementById('genericViewer').style.display = 'block';

                this.renderPage(1);
                window.DocViewerThumbnails.generateExcelThumbnails();
            } catch (error) {
                console.error('Error loading Excel:', error);
                throw error;
            }
        },

        // Render Excel page (sheet)
        renderPage: function (pageNum) {
            const viewer = document.getElementById('genericViewer');
            const sheetHtml = STATE.content[pageNum - 1] || '';
            const sheetName = STATE.rawExcelWorkbook ?
                STATE.rawExcelWorkbook.SheetNames[pageNum - 1] : `Sheet ${pageNum}`;

            viewer.innerHTML = `
                <div class="editable-content" id="editableContent">
                    <h4 style="margin-bottom: 20px; color: #333;">
                        <i class="bi bi-table"></i> ${window.DocViewerUtils.escapeHtml(sheetName)}
                    </h4>
                    <div style="overflow-x: auto;">
                        ${sheetHtml}
                    </div>
                </div>
            `;

            // Apply Excel table styling
            const tables = viewer.querySelectorAll('table');
            tables.forEach(table => {
                table.className = 'table table-bordered table-sm';
                table.style.fontSize = '13px';
            });

            window.DocViewerUI.updatePageInfo();

            // Re-apply search highlight
            const query = document.getElementById('searchInput').value.trim();
            if (query && STATE.currentSearchIndex >= 0 &&
                STATE.searchResults[STATE.currentSearchIndex] &&
                STATE.searchResults[STATE.currentSearchIndex].page === STATE.currentPage) {
                window.DocViewerSearch.highlightSearchInViewer(query);
            }
        }
    };
})();