// Document Viewer UI Module
window.DocViewerUI = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        // Show loading overlay
        showLoading: function (message = 'Đang tải...') {
            const overlay = document.getElementById('loadingOverlay');
            const text = document.getElementById('loadingText');

            if (overlay && text) {
                text.textContent = message;
                overlay.style.display = 'flex';
            }
        },

        // Hide loading overlay
        hideLoading: function () {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        },

        // Show toast notification
        showToast: function (message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = 'toast-notification';

            const icons = {
                'info': 'ℹ️',
                'success': '✅',
                'warning': '⚠️',
                'error': '❌'
            };

            const colors = {
                'info': '#0dcaf0',
                'success': '#198754',
                'warning': '#ffc107',
                'error': '#dc3545'
            };

            toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">${icons[type] || icons.info}</span>
                    <span>${this.escapeHtml(message)}</span>
                </div>
            `;

            document.body.appendChild(toast);

            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        // Update page info
        updatePageInfo: function () {
            document.getElementById('pageNum').value = STATE.currentPage;
            document.getElementById('pageCount').textContent = STATE.totalPages;

            // Update navigation buttons
            const prevBtn = document.getElementById('prevPage');
            const nextBtn = document.getElementById('nextPage');

            if (prevBtn) prevBtn.disabled = STATE.currentPage <= 1;
            if (nextBtn) nextBtn.disabled = STATE.currentPage >= STATE.totalPages;
        },

        // Update zoom level display
        updateZoomDisplay: function () {
            const zoomDisplay = document.getElementById('zoomLevel');
            if (zoomDisplay) {
                zoomDisplay.textContent = Math.round(STATE.scale * 100) + '%';
            }
        },

        // Escape HTML
        escapeHtml: function (text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Show error message
        showError: function (message) {
            this.showToast(message, 'error');
        },

        // Show success message
        showSuccess: function (message) {
            this.showToast(message, 'success');
        },

        // Show warning message
        showWarning: function (message) {
            this.showToast(message, 'warning');
        },

        // Show info message
        showInfo: function (message) {
            this.showToast(message, 'info');
        }
    };
})();