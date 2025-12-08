// Document Viewer Main Initialization
window.DocViewerMain = (function () {
    'use strict';

    return {
        // Initialize the viewer
        init: async function (fileUrl, fileExt, documentId) {
            // Initialize configuration
            window.DocViewerConfig.init(fileUrl, fileExt, documentId);

            // Setup event listeners
            this.setupEventListeners();

            // Set initial pagination UI
            document.getElementById('paginationMode').value = window.DocViewerConfig.get('paginationMode');
            document.getElementById('charsPerPage').value = window.DocViewerConfig.get('charsPerPage');

            // Load document
            await this.loadDocument();

            // Load bookmarks
            window.DocViewerBookmarks.loadBookmarks();
        },

        // Load document based on file type
        loadDocument: async function () {
            window.DocViewerUI.showLoading('Đang tải tài liệu...');

            try {
                const fileExt = window.DocViewerConfig.get('fileExt');

                switch (fileExt) {
                    case 'pdf':
                        await window.DocViewerPDF.loadPDF();
                        break;
                    case 'txt':
                        await window.DocViewerText.loadText();
                        break;
                    case 'doc':
                    case 'docx':
                        await window.DocViewerDocx.loadDocx();
                        break;
                    case 'xls':
                    case 'xlsx':
                        await window.DocViewerExcel.loadExcel();
                        break;
                    default:
                        throw new Error('Unsupported file format');
                }

                window.DocViewerUI.hideLoading();
                window.DocViewerUI.showToast('✅ Tải tài liệu thành công', 'success');
            } catch (error) {
                console.error('Error loading document:', error);
                window.DocViewerUI.hideLoading();
                window.DocViewerUI.showToast('❌ Không thể tải tài liệu', 'error');
            }
        },

        // Setup all event listeners
        setupEventListeners: function () {
            this.setupSidebarEvents();
            this.setupToolbarEvents();
            this.setupContentEvents();
            this.setupSearchEvents();
            this.setupKeyboardEvents();
            this.setupBeforeUnload();
        },

        // Setup sidebar events
        setupSidebarEvents: function () {
            document.querySelectorAll('.sidebar-tab').forEach(tab => {
                tab.addEventListener('click', function () {
                    const target = this.dataset.tab;

                    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.style.display = pane.dataset.content === target ? 'block' : 'none';
                    });
                });
            });
        },

        // Setup toolbar events
        setupToolbarEvents: function () {
            document.getElementById('toggleSidebar').onclick = () => {
                document.getElementById('sidebar').classList.toggle('collapsed');
            };

            document.getElementById('prevPage').onclick = () => {
                const currentPage = window.DocViewerConfig.getState('currentPage');
                window.DocViewerNavigation.changePage(currentPage - 1);
            };

            document.getElementById('nextPage').onclick = () => {
                const currentPage = window.DocViewerConfig.getState('currentPage');
                window.DocViewerNavigation.changePage(currentPage + 1);
            };

            document.getElementById('pageNum').onchange = function () {
                window.DocViewerNavigation.changePage(parseInt(this.value));
            };

            document.getElementById('zoomIn').onclick = () => window.DocViewerZoom.zoom(0.25);
            document.getElementById('zoomOut').onclick = () => window.DocViewerZoom.zoom(-0.25);
            document.getElementById('fitWidth').onclick = () => {
                window.DocViewerConfig.setState('scale', 1.5);
                window.DocViewerZoom.zoom(0);
            };

            document.getElementById('searchBtn').onclick = () => {
                document.getElementById('searchPanel').classList.toggle('active');
                document.getElementById('searchInput').focus();
            };

            document.getElementById('highlightBtn').onclick = () => {
                window.DocViewerHighlight.toggleHighlightMode();
            };

            document.getElementById('editBtn').onclick = () => {
                window.DocViewerEdit.toggleEditMode();
            };

            document.getElementById('downloadBtn').onclick = () => {
                window.open(window.DocViewerConfig.get('fileUrl'), '_blank');
            };

            document.getElementById('printBtn').onclick = () => {
                window.print();
            };

            document.getElementById('paginationMode').onchange = function () {
                window.DocViewerConfig.set('paginationMode', this.value);
                window.DocViewerText.applyPagination();
                window.DocViewerNavigation.renderCurrentAfterRepaginate();
            };

            document.getElementById('charsPerPage').onchange = function () {
                const v = parseInt(this.value);
                if (!isNaN(v) && v >= 100) {
                    window.DocViewerConfig.set('charsPerPage', v);
                    if (window.DocViewerConfig.get('paginationMode') === 'chars') {
                        window.DocViewerText.applyPagination();
                        window.DocViewerNavigation.renderCurrentAfterRepaginate();
                    }
                }
            };
        },

        // Setup content area events
        setupContentEvents: function () {
            document.getElementById('contentArea').addEventListener('mouseup', function () {
                if (window.DocViewerConfig.getState('isHighlightMode')) {
                    window.DocViewerBookmarks.createBookmark();
                }
            });

            const pdfTextLayer = document.getElementById('textLayer');
            if (pdfTextLayer) {
                pdfTextLayer.addEventListener('mouseup', function () {
                    if (!window.DocViewerConfig.getState('isHighlightMode')) return;
                    setTimeout(() => {
                        window.DocViewerBookmarks.createBookmark();
                    }, 10);
                });
            }
        },

        // Setup search events
        setupSearchEvents: function () {
            document.getElementById('closeSearch').onclick = () => {
                document.getElementById('searchPanel').classList.remove('active');
            };

            document.getElementById('searchExecute').onclick = () => {
                window.DocViewerSearch.performSearch();
            };

            document.getElementById('searchInput').onkeypress = (e) => {
                if (e.key === 'Enter') window.DocViewerSearch.performSearch();
            };
        },

        // Setup keyboard shortcuts
        setupKeyboardEvents: function () {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'f') {
                        e.preventDefault();
                        document.getElementById('searchBtn').click();
                    } else if (e.key === 's') {
                        e.preventDefault();
                        if (window.DocViewerConfig.getState('isEditMode')) {
                            window.DocViewerEdit.saveEdits();
                        }
                    }
                } else if (e.key === 'ArrowLeft') {
                    const currentPage = window.DocViewerConfig.getState('currentPage');
                    window.DocViewerNavigation.changePage(currentPage - 1);
                } else if (e.key === 'ArrowRight') {
                    const currentPage = window.DocViewerConfig.getState('currentPage');
                    window.DocViewerNavigation.changePage(currentPage + 1);
                }
            });
        },

        // Setup before unload warning
        setupBeforeUnload: function () {
            window.addEventListener('beforeunload', (e) => {
                if (window.DocViewerConfig.getState('isEditMode')) {
                    e.preventDefault();
                    e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?';
                }
            });
        }
    };
})();