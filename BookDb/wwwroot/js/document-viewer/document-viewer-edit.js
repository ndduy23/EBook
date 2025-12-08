window.DocViewerEdit = (function () {
    'use strict';

    const CONFIG = window.DocViewerConfig.config;
    const STATE = window.DocViewerConfig.state;

    return {
        toggleEditMode: function () {
            if (CONFIG.fileExt === 'pdf') {
                window.DocViewerUI.showToast('❌ Không thể chỉnh sửa file PDF', 'error');
                return;
            }

            STATE.isEditMode = !STATE.isEditMode;
            const btn = document.getElementById('editBtn');

            if (btn) {
                btn.classList.toggle('active', STATE.isEditMode);
            }

            const editableContent = document.getElementById('editableContent');
            if (editableContent) {
                editableContent.contentEditable = STATE.isEditMode;

                if (STATE.isEditMode) {
                    editableContent.style.border = '2px dashed #0d6efd';
                    editableContent.style.minHeight = '400px';
                    window.DocViewerUI.showToast('✏️ Chế độ chỉnh sửa: Nhấn Ctrl+S để lưu', 'info');
                } else {
                    editableContent.style.border = 'none';
                }
            }
        },

        saveEdits: function () {
            if (!STATE.isEditMode) return;

            const editableContent = document.getElementById('editableContent');
            if (!editableContent) return;

            const newContent = editableContent.innerText || editableContent.textContent;

            // Update current page content
            if (CONFIG.fileExt === 'txt') {
                STATE.content[STATE.currentPage - 1] = newContent.split('\n');
            } else {
                STATE.content[STATE.currentPage - 1] = editableContent.innerHTML;
            }

            window.DocViewerUI.showToast('✅ Đã lưu thay đổi (chỉ trong session)', 'success');
        }
    };
})();