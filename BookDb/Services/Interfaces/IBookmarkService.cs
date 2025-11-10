using BookDb.Models;

namespace BookDb.Services.Interfaces
{
    public interface IBookmarkService
    {
        Task<List<Bookmark>> GetBookmarksAsync(string? q);
        Task<Bookmark?> GetBookmarkByIdAsync(int id);
        // Overload: create bookmark by document page id (used by MVC controller and tests)
        Task<(bool Success, string? ErrorMessage, int? BookmarkId)> CreateBookmarkAsync(int documentPageId, string? title, string url, string? userId = null);
        // Overload: create bookmark by document id and page number (used by API controller)
        Task<(bool Success, string? ErrorMessage, int? BookmarkId)> CreateBookmarkAsync(int documentId, int pageNumber, string? title, string url, string? userId = null);
        Task<bool> DeleteBookmarkAsync(int id, string? userId = null, bool isAdmin = false);
        Task<Bookmark?> GetBookmarkForPageAsync(int documentId, int pageNumber, string? userId = null);

        // Helper to load a DocumentPage with related Document for bookmark creation
        Task<DocumentPage?> GetDocumentPageForBookmarkCreation(int documentPageId);
    }
}