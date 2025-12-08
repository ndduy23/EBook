// Document Viewer DOCX Module
window.DocViewerDocx = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load DOCX document
        loadDocx: async function () {
            window.DocViewerUI.showLoading('Đang tải tài liệu Word...');

            try {
                const response = await fetch(CONFIG.fileUrl);
                const arrayBuffer = await response.arrayBuffer();

                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value;

                // Store raw HTML
                STATE.rawDocxHtml = html;

                // Parse HTML into paragraphs
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const paragraphs = Array.from(doc.body.children).map(el => el.outerHTML);

                if (CONFIG.paginationMode === 'chars') {
                    const fullText = doc.body.textContent || '';
                    STATE.content = this.splitHtmlByChars(html, CONFIG.charsPerPage);
                } else {
                    STATE.content = window.DocViewerUtils.splitIntoPages(paragraphs, CONFIG.itemsPerPage);
                }

                STATE.totalPages = STATE.content.length;
                document.getElementById('pageCount').textContent = STATE.totalPages;
                document.getElementById('genericViewer').style.display = 'block';

                this.renderPage(1);
                window.DocViewerThumbnails.generateDocxThumbnails();
            } catch (error) {
                console.error('Error loading DOCX:', error);
                throw error;
            }
        },

        // Render DOCX page
        renderPage: function (pageNum) {
            const viewer = document.getElementById('genericViewer');
            const pageContent = STATE.content[pageNum - 1] || [];

            if (Array.isArray(pageContent)) {
                viewer.innerHTML = `
                    <div class="editable-content" id="editableContent">
                        ${pageContent.join('')}
                    </div>
                `;
            } else if (typeof pageContent === 'string') {
                viewer.innerHTML = `
                    <div class="editable-content" id="editableContent">
                        ${pageContent}
                    </div>
                `;
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

        // Split HTML by characters
        splitHtmlByChars: function (html, charsPerPage) {
            const pages = [];
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const fullText = doc.body.textContent || '';

            let i = 0;
            while (i < fullText.length) {
                const end = Math.min(i + charsPerPage, fullText.length);
                const chunk = fullText.substring(i, end);
                pages.push(`<pre>${window.DocViewerUtils.escapeHtml(chunk)}</pre>`);
                i = end;
            }

            return pages;
        },

        // Apply pagination
        applyPagination: function () {
            if (!STATE.rawDocxHtml) return;

            const parser = new DOMParser();
            const doc = parser.parseFromString(STATE.rawDocxHtml, 'text/html');

            if (CONFIG.paginationMode === 'chars') {
                const fullText = doc.body.textContent || '';
                STATE.content = this.splitHtmlByChars(STATE.rawDocxHtml, CONFIG.charsPerPage);
            } else {
                const paragraphs = Array.from(doc.body.children).map(el => el.outerHTML);
                STATE.content = window.DocViewerUtils.splitIntoPages(paragraphs, CONFIG.itemsPerPage);
            }

            STATE.totalPages = STATE.content.length;
            document.getElementById('pageCount').textContent = STATE.totalPages;

            if (STATE.currentPage > STATE.totalPages) {
                STATE.currentPage = Math.max(1, STATE.totalPages);
            }
            document.getElementById('pageNum').value = STATE.currentPage;
        }
    };
})();