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

            if (STATE.isHighlightMode) {
                window.DocViewerUI.showToast('📝 Chế độ highlight: Chọn văn bản để tạo bookmark', 'info');
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
                    highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                    highlight.style.pointerEvents = 'none';
                    highlightLayer.appendChild(highlight);
                }
            });
        }
    };
})();