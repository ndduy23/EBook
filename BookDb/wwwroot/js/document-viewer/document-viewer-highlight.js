window.DocViewerHighlight = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        toggleHighlightMode: function () {
            STATE.isHighlightMode = !STATE.isHighlightMode;
            const btn = document.getElementById('highlightBtn');

            if (btn) {
                btn.classList.toggle('active', STATE.isHighlightMode);
            }

            const textLayer = document.getElementById('textLayer');
            if (textLayer) {
                textLayer.classList.toggle('selectable', STATE.isHighlightMode);
            }

            // Enable or disable canvas selection for PDF
            if (CONFIG.fileExt === 'pdf') {
                this.enableCanvasSelection(STATE.isHighlightMode);
            }

            if (STATE.isHighlightMode) {
                window.DocViewerUI.showToast('📝 Chế độ highlight: Kéo để tạo bookmark (PDF) hoặc chọn văn bản (khác)', 'info');
            } else {
                window.DocViewerUI.showToast('Đã tắt chế độ highlight', 'info');
            }
        },

        renderHighlights: function () {
            if (CONFIG.fileExt !== 'pdf') return;

            const highlightLayer = document.getElementById('highlightLayer');
            if (!highlightLayer) return;

            highlightLayer.innerHTML = '';

            const pageBookmarks = STATE.bookmarks.filter(b => b.page === STATE.currentPage);

            pageBookmarks.forEach(bookmark => {
                if (bookmark.rect) {
                    const highlight = document.createElement('div');
                    highlight.style.position = 'absolute';
                    highlight.style.left = bookmark.rect.x + 'px';
                    highlight.style.top = bookmark.rect.y + 'px';
                    highlight.style.width = bookmark.rect.width + 'px';
                    highlight.style.height = bookmark.rect.height + 'px';
                    highlight.style.backgroundColor = 'rgba(255,255,0,0.3)';
                    highlight.style.pointerEvents = 'none';
                    highlightLayer.appendChild(highlight);
                }
            });
        },

        // Enable rectangular selection on the PDF canvas to create bookmarks
        enableCanvasSelection: function (enable) {
            const canvas = document.getElementById('pdfCanvas');
            const highlightLayer = document.getElementById('highlightLayer');
            if (!canvas || !highlightLayer) return;

            // Remove existing handlers if disabling
            if (!enable) {
                canvas.style.cursor = 'default';
                canvas.onmousedown = null;
                canvas.onmousemove = null;
                canvas.onmouseup = null;
                // Remove any temporary selection box
                const tmp = highlightLayer.querySelector('.tmp-selection-box');
                if (tmp) tmp.remove();
                return;
            }

            canvas.style.cursor = 'crosshair';

            let isDrawing = false;
            let startX =0, startY =0;
            let boxEl = null;

            canvas.onmousedown = function (e) {
                if (!STATE.isHighlightMode) return;
                isDrawing = true;
                const cRect = canvas.getBoundingClientRect();
                startX = e.clientX - cRect.left;
                startY = e.clientY - cRect.top;

                // Create temporary selection box
                boxEl = document.createElement('div');
                boxEl.className = 'tmp-selection-box';
                boxEl.style.position = 'absolute';
                boxEl.style.left = startX + 'px';
                boxEl.style.top = startY + 'px';
                boxEl.style.width = '0px';
                boxEl.style.height = '0px';
                boxEl.style.border = '2px dashed rgba(0,123,255,0.9)';
                boxEl.style.background = 'rgba(0,123,255,0.1)';
                boxEl.style.zIndex = '1000';
                boxEl.style.pointerEvents = 'none';
                highlightLayer.appendChild(boxEl);
            };

            canvas.onmousemove = function (e) {
                if (!isDrawing || !boxEl) return;
                const cRect = canvas.getBoundingClientRect();
                const curX = Math.max(0, Math.min(canvas.width, e.clientX - cRect.left));
                const curY = Math.max(0, Math.min(canvas.height, e.clientY - cRect.top));

                const left = Math.min(startX, curX);
                const top = Math.min(startY, curY);
                const width = Math.abs(curX - startX);
                const height = Math.abs(curY - startY);

                boxEl.style.left = left + 'px';
                boxEl.style.top = top + 'px';
                boxEl.style.width = width + 'px';
                boxEl.style.height = height + 'px';
            };
            
            canvas.onmouseup = function (e) {
                if (!isDrawing || !boxEl) return;
                isDrawing = false;

                const cRect = canvas.getBoundingClientRect();
                const endX = Math.max(0, Math.min(canvas.width, e.clientX - cRect.left));
                const endY = Math.max(0, Math.min(canvas.height, e.clientY - cRect.top));

                const left = Math.min(startX, endX);
                const top = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);

                // remove temporary box
                if (boxEl) boxEl.remove();
                boxEl = null;

                // Ignore tiny selections
                if (width <5 || height <5) return;

                const rect = { x: left, y: top, width: width, height: height };

                // Ask bookmarks module to create bookmark from rect
                if (window.DocViewerBookmarks && typeof window.DocViewerBookmarks.createBookmarkFromRect === 'function') {
                    window.DocViewerBookmarks.createBookmarkFromRect(rect);
                }
            };
        }
    };
})();