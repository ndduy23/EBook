// Document Viewer Text Module
window.DocViewerText = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load text document
        loadText: async function () {
            window.DocViewerUI.showLoading('Đang tải văn bản...');
            const response = await fetch(CONFIG.fileUrl);
            const text = await response.text();

            // Store raw text for re-pagination
            STATE.rawText = text;

            this.applyPagination();

            document.getElementById('genericViewer').style.display = 'block';
            document.getElementById('pageCount').textContent = STATE.totalPages;

            this.renderPage(1);
            window.DocViewerThumbnails.generateTextThumbnails();
        },

        // Render text page
        renderPage: function (pageNum) {
            const viewer = document.getElementById('genericViewer');
            const pageContent = STATE.content[pageNum - 1] || '';

            if (typeof pageContent === 'string') {
                viewer.innerHTML = `
                    <div class="editable-content" id="editableContent">
                        <pre>${window.DocViewerUtils.escapeHtml(pageContent)}</pre>
                    </div>
                `;
            } else if (Array.isArray(pageContent)) {
                viewer.innerHTML = `
                    <div class="editable-content" id="editableContent">
                        <pre>${window.DocViewerUtils.escapeHtml(pageContent.join('\n'))}</pre>
                    </div>
                `;
            } else {
                viewer.innerHTML = '<div class="editable-content" id="editableContent"></div>';
            }

            window.DocViewerUI.updatePageInfo();

            // Re-apply search highlight
            const query = document.getElementById('searchInput').value.trim();
            if (query && STATE.currentSearchIndex >= 0 &&
                STATE.searchResults[STATE.currentSearchIndex] &&
                STATE.searchResults[STATE.currentSearchIndex].page === STATE.currentPage) {
                window.DocViewerSearch.highlightSearchInViewer(query);
            }
        },

        // Apply pagination
        applyPagination: function () {
            if (!STATE.rawText) {
                STATE.content = [];
                STATE.totalPages = 0;
                return;
            }

            if (CONFIG.paginationMode === 'chars') {
                STATE.content = this.splitTextByChars(STATE.rawText, CONFIG.charsPerPage);
            } else {
                const lines = STATE.rawText.split('\n');
                STATE.content = window.DocViewerUtils.splitIntoPages(lines, CONFIG.itemsPerPage);
            }

            STATE.totalPages = STATE.content.length;
            document.getElementById('pageCount').textContent = STATE.totalPages;

            if (STATE.currentPage > STATE.totalPages) {
                STATE.currentPage = Math.max(1, STATE.totalPages);
            }
            document.getElementById('pageNum').value = STATE.currentPage;
        },

        // Split text by characters
        splitTextByChars: function (text, charsPerPage) {
            const pages = [];
            if (!text) return pages;

            let i = 0;
            while (i < text.length) {
                let end = i + charsPerPage;
                if (end >= text.length) {
                    pages.push(text.substring(i));
                    break;
                }

                let slice = text.substring(i, end);
                const nextChar = text.charAt(end);

                if (nextChar && nextChar !== ' ' && nextChar !== '\n') {
                    const lastSpace = slice.lastIndexOf(' ');
                    if (lastSpace > Math.floor(charsPerPage * 0.4)) {
                        end = i + lastSpace;
                        slice = text.substring(i, end);
                    }
                }

                pages.push(slice);
                i = end;

                while (i < text.length && (text.charAt(i) === ' ' || text.charAt(i) === '\n')) i++;
            }

            return pages;
        }
    };
})();