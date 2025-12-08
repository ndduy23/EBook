// Document Viewer Configuration Module
window.DocViewerConfig = (function () {
    'use strict';

    return {
        // Configuration object
        config: {
            fileUrl: '',
            fileExt: '',
            documentId: 0,
            itemsPerPage: 50,
            maxBookmarks: 100,
            paginationMode: 'items', // 'items' or 'chars'
            charsPerPage: 2000
        },

        // State object
        state: {
            currentPage: 1,
            totalPages: 0,
            scale: 1.5,
            content: [],
            bookmarks: [],
            searchResults: [],
            currentSearchIndex: -1,
            isHighlightMode: false,
            isEditMode: false,
            pdfDoc: null,
            rawText: null,
            rawDocxHtml: null,
            rawExcelWorkbook: null
        },

        // Initialize configuration
        init: function (fileUrl, fileExt, documentId) {
            this.config.fileUrl = fileUrl;
            this.config.fileExt = fileExt;
            this.config.documentId = documentId;

            // Initialize PDF.js
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            return this;
        },

        // Get config value
        get: function (key) {
            return this.config[key];
        },

        // Set config value
        set: function (key, value) {
            this.config[key] = value;
            return this;
        },

        // Get state value
        getState: function (key) {
            return this.state[key];
        },

        // Set state value
        setState: function (key, value) {
            this.state[key] = value;
            return this;
        }
    };
})();