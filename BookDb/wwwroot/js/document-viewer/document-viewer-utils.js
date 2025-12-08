// Document Viewer Utilities Module
window.DocViewerUtils = (function () {
    'use strict';

    return {
        // Split array into pages
        splitIntoPages: function (items, itemsPerPage) {
            const pages = [];
            for (let i = 0; i < items.length; i += itemsPerPage) {
                pages.push(items.slice(i, i + itemsPerPage));
            }
            return pages;
        },

        // Escape HTML
        escapeHtml: function (text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Format file size
        formatFileSize: function (bytes) {
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 B';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        },

        // Format time
        formatTime: function (date) {
            const now = new Date();
            const diff = Math.floor((now - date) / 1000);

            if (diff < 60) return 'Vừa xong';
            if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;

            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        // Debounce function
        debounce: function (func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle: function (func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Deep clone object
        deepClone: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        // Check if element is in viewport
        isInViewport: function (element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Smooth scroll to element
        smoothScrollTo: function (element, duration = 500) {
            const start = window.pageYOffset;
            const target = element.getBoundingClientRect().top + start;
            const distance = target - start;
            const startTime = performance.now();

            function animation(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;

                window.scrollTo(0, start + distance * ease);

                if (progress < 1) {
                    requestAnimationFrame(animation);
                }
            }

            requestAnimationFrame(animation);
        },

        // Generate unique ID
        generateId: function () {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        // Parse query string
        parseQueryString: function (url) {
            const params = {};
            const queryString = url.split('?')[1];
            if (!queryString) return params;

            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });

            return params;
        },

        // Build query string
        buildQueryString: function (params) {
            return Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
        },

        // Check if mobile device
        isMobile: function () {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // Copy to clipboard
        copyToClipboard: function (text) {
            if (navigator.clipboard) {
                return navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    return Promise.resolve();
                } catch (err) {
                    return Promise.reject(err);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        },

        // Download file
        downloadFile: function (url, filename) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        // Print element
        printElement: function (element) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Print</title>');
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(element.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
})();