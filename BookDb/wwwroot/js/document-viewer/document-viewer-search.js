// Document Viewer Search Module
window.DocViewerSearch = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Perform search
        performSearch: async function () {
            const query = document.getElementById('searchInput').value.trim().toLowerCase();
            const resultsDiv = document.getElementById('searchResults');

            if (!query) {
                resultsDiv.innerHTML = '<p class="text-muted text-center">Nhập từ khóa để tìm kiếm</p>';
                return;
            }

            resultsDiv.innerHTML = '<p class="text-muted text-center">Đang tìm kiếm...</p>';
            STATE.searchResults = [];

            if (CONFIG.fileExt === 'pdf') {
                await this.searchPDF(query);
            } else {
                this.searchGeneric(query);
            }

            this.displaySearchResults(query);
        },

        // Search in PDF
        searchPDF: async function (query) {
            for (let i = 1; i <= STATE.totalPages; i++) {
                const page = await STATE.pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const text = textContent.items.map(item => item.str).join(' ');

                if (text.toLowerCase().includes(query)) {
                    const index = text.toLowerCase().indexOf(query);
                    const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100));
                    STATE.searchResults.push({ page: i, context });
                }
            }
        },

        // Search in generic content
        searchGeneric: function (query) {
            STATE.content.forEach((pageContent, index) => {
                const text = Array.isArray(pageContent) ? pageContent.join(' ') : (pageContent || '');
                if (text.toLowerCase().includes(query)) {
                    const idx = text.toLowerCase().indexOf(query);
                    const context = text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 100));
                    STATE.searchResults.push({ page: index + 1, context });
                }
            });
        },

        // Display search results
        displaySearchResults: function (query) {
            const resultsDiv = document.getElementById('searchResults');

            if (STATE.searchResults.length === 0) {
                resultsDiv.innerHTML = '<p class="text-muted text-center">Không tìm thấy kết quả</p>';
            } else {
                resultsDiv.innerHTML = STATE.searchResults.map((result, index) => `
                    <div class="search-result-item" onclick="window.DocViewerSearch.gotoSearchResult(${index})">
                        <strong>Trang ${result.page}</strong>
                        <div class="search-result-context">...${window.DocViewerUtils.escapeHtml(result.context)}...</div>
                    </div>
                `).join('');

                // Automatically go to first result
                this.gotoSearchResult(0);
            }
        },

        // Go to search result
        gotoSearchResult: function (index) {
            window.DocViewerNavigation.changePage(STATE.searchResults[index].page);
            STATE.currentSearchIndex = index;

            document.querySelectorAll('.search-result-item').forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });

            // Wait for page rendering then apply highlight
            setTimeout(() => {
                const query = document.getElementById('searchInput').value.trim();
                if (query) this.highlightSearchInViewer(query);
            }, 200);
        },

        // Clear search highlights
        clearSearchHighlights: function () {
            const textLayer = document.getElementById('textLayer');
            if (textLayer) {
                const marks = textLayer.querySelectorAll('mark');
                marks.forEach(m => {
                    const parent = m.parentNode;
                    if (parent) parent.replaceChild(document.createTextNode(m.textContent), m);
                });
            }

            const generic = document.getElementById('genericViewer');
            if (generic) {
                const marksG = generic.querySelectorAll('mark');
                marksG.forEach(m => {
                    const parent = m.parentNode;
                    if (parent) parent.replaceChild(document.createTextNode(m.textContent), m);
                });
            }
        },

        // Highlight occurrences in viewer
        highlightSearchInViewer: function (query) {
            if (!query) return;
            const q = query.toLowerCase();
            this.clearSearchHighlights();

            if (CONFIG.fileExt === 'pdf') {
                this.highlightInPDF(query, q);
            } else {
                this.highlightInGeneric(query, q);
            }
        },

        // Highlight in PDF text layer
        highlightInPDF: function (query, q) {
            const textLayer = document.getElementById('textLayer');
            if (!textLayer) return;

            const spans = Array.from(textLayer.querySelectorAll('span'));
            spans.forEach(span => {
                const text = span.textContent || '';
                const lower = text.toLowerCase();
                if (lower.includes(q)) {
                    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
                    span.innerHTML = text.replace(regex, match => `<mark>${match}</mark>`);
                }
            });
        },

        // Highlight in generic viewer
        highlightInGeneric: function (query, q) {
            const viewer = document.getElementById('genericViewer');
            if (!viewer) return;

            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');

            function walk(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.nodeValue;
                    if (!text) return;
                    if (text.toLowerCase().includes(q)) {
                        const frag = document.createDocumentFragment();
                        let lastIndex = 0;

                        text.replace(regex, (match, offset) => {
                            if (offset > lastIndex) {
                                frag.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
                            }
                            const mark = document.createElement('mark');
                            mark.textContent = match;
                            frag.appendChild(mark);
                            lastIndex = offset + match.length;
                        });

                        if (lastIndex < text.length) {
                            frag.appendChild(document.createTextNode(text.substring(lastIndex)));
                        }
                        node.parentNode.replaceChild(frag, node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes &&
                    node.tagName.toLowerCase() !== 'script' &&
                    node.tagName.toLowerCase() !== 'style' &&
                    node.tagName.toLowerCase() !== 'mark') {
                    const children = Array.from(node.childNodes);
                    children.forEach(child => walk(child));
                }
            }

            walk(viewer);
        }
    };
})();