// Document Viewer Bookmarks Module
window.DocViewerBookmarks = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Load bookmarks from localStorage
        loadBookmarks: function () {
            const stored = localStorage.getItem(`bookmarks_${CONFIG.documentId}`);
            STATE.bookmarks = stored ? JSON.parse(stored) : [];
            this.displayBookmarks();
        },

        // Save bookmarks to localStorage
        saveBookmarks: function () {
            localStorage.setItem(`bookmarks_${CONFIG.documentId}`, JSON.stringify(STATE.bookmarks));
            this.displayBookmarks();
        },

        // Create new bookmark
        createBookmark: function () {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (!text) {
                window.DocViewerUI.showToast('Vui lòng chọn văn bản để bookmark', 'warning');
                return;
            }

            const bookmark = {
                id: Date.now(),
                page: STATE.currentPage,
                text: text.substring(0, 200),
                timestamp: new Date().toISOString()
            };

            // For PDF, capture bounding rect
            if (CONFIG.fileExt === 'pdf') {
                try {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const canvasRect = document.getElementById('pdfCanvas').getBoundingClientRect();

                    bookmark.rect = {
                        x: Math.max(0, rect.left - canvasRect.left),
                        y: Math.max(0, rect.top - canvasRect.top),
                        width: rect.width,
                        height: rect.height
                    };
                } catch (e) {
                    console.warn('Could not compute rect for PDF selection', e);
                }
            }

            STATE.bookmarks.push(bookmark);
            this.saveBookmarks();
            window.DocViewerUI.showToast('✅ Đã lưu bookmark', 'success');

            selection.removeAllRanges();
        },

        // Delete bookmark
        deleteBookmark: function (id) {
            if (!confirm('Xóa bookmark này?')) return;

            STATE.bookmarks = STATE.bookmarks.filter(b => b.id !== id);
            this.saveBookmarks();
            window.DocViewerUI.showToast('🗑️ Đã xóa bookmark', 'info');

            // Update highlights in viewer
            if (CONFIG.fileExt === 'pdf') {
                window.DocViewerHighlight.renderHighlights();
            } else {
                window.DocViewerNavigation.changePage(STATE.currentPage);
            }
        },

        // Display bookmarks
        displayBookmarks: function () {
            const container = document.getElementById('bookmarksContainer');

            if (STATE.bookmarks.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Chưa có bookmark</p>';
                return;
            }

            container.innerHTML = STATE.bookmarks.map(b => `
                <div class="bookmark-item" onclick="window.DocViewerNavigation.changePage(${b.page})">
                    <div class="bookmark-title">
                        <span>Bookmark ${STATE.bookmarks.indexOf(b) + 1}</span>
                        <span class="bookmark-delete" onclick="event.stopPropagation(); window.DocViewerBookmarks.deleteBookmark(${b.id})">
                            <i class="bi bi-trash"></i>
                        </span>
                    </div>
                    <div class="bookmark-text">${window.DocViewerUtils.escapeHtml(b.text)}</div>
                    <div class="bookmark-meta">
                        <i class="bi bi-file-earmark"></i> Trang ${b.page} •
                        ${new Date(b.timestamp).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            `).join('');
        }
    };
})();