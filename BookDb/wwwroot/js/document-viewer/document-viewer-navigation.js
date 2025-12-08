// Document Viewer Navigation Module
window.DocViewerNavigation = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Change page
        changePage: async function (pageNum) {
            if (pageNum < 1 || pageNum > STATE.totalPages) {
                return;
            }

            STATE.currentPage = pageNum;
            document.getElementById('pageNum').value = pageNum;

            // Clear search highlights before rendering new page
            window.DocViewerSearch.clearSearchHighlights();

            // Render based on file type
            try {
                switch (CONFIG.fileExt) {
                    case 'pdf':
                        await window.DocViewerPDF.renderPage(pageNum);
                        break;
                    case 'txt':
                        window.DocViewerText.renderPage(pageNum);
                        break;
                    case 'doc':
                    case 'docx':
                        window.DocViewerDocx.renderPage(pageNum);
                        break;
                    case 'xls':
                    case 'xlsx':
                        window.DocViewerExcel.renderPage(pageNum);
                        break;
                }

                // Update thumbnails
                this.updateThumbnailSelection();
            } catch (error) {
                console.error('Error changing page:', error);
                window.DocViewerUI.showToast('❌ Không thể chuyển trang', 'error');
            }
        },

        // Update thumbnail selection
        updateThumbnailSelection: function () {
            document.querySelectorAll('.thumbnail-item').forEach((item, index) => {
                item.classList.toggle('active', index + 1 === STATE.currentPage);
            });
        },

        // Render current page after repagination
        renderCurrentAfterRepaginate: function () {
            // Ensure current page is within bounds
            if (STATE.currentPage > STATE.totalPages) {
                STATE.currentPage = Math.max(1, STATE.totalPages);
            }

            document.getElementById('pageNum').value = STATE.currentPage;
            this.changePage(STATE.currentPage);
        }
    };
})();