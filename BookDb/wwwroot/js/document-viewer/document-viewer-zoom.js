window.DocViewerZoom = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        zoom: function (delta) {
            const newScale = STATE.scale + delta;

            if (newScale < 0.5 || newScale > 3) {
                window.DocViewerUI.showToast('⚠️ Đã đạt giới hạn zoom', 'warning');
                return;
            }

            STATE.scale = newScale;
            window.DocViewerUI.updateZoomDisplay();

            // Re-render based on file type
            if (CONFIG.fileExt === 'pdf') {
                window.DocViewerPDF.renderPage(STATE.currentPage);
            } else {
                // For non-PDF, adjust font size
                const viewer = document.getElementById('genericViewer');
                if (viewer) {
                    viewer.style.fontSize = (STATE.scale * 15) + 'px';
                }
            }
        }
    };
})();