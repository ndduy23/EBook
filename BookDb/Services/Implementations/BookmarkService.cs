using BookDb.Models;
using BookDb.Repositories.Interfaces;
using BookDb.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookDb.Services.Implementations
{
    public class BookmarkService : IBookmarkService
    {
        private readonly IBookmarkRepository _bookmarkRepo;
        private readonly IDocumentRepository _docRepo;
        private readonly IDocumentPageRepository _pageRepo;
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<BookmarkService> _logger;

        public BookmarkService(
            IBookmarkRepository bookmarkRepo,
            IDocumentRepository docRepo,
            IDocumentPageRepository pageRepo,
            AppDbContext context,
            INotificationService notificationService,
            ILogger<BookmarkService> logger)
        {
            _bookmarkRepo = bookmarkRepo;
            _docRepo = docRepo;
            _pageRepo = pageRepo;
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<List<Bookmark>> GetBookmarksAsync(string? q)
        {
            var query = _context.Bookmarks
                .Include(b => b.Document)
                .AsQueryable();

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(b =>
                    EF.Functions.Like(b.Title ?? "", $"%{q}%") ||
                    (b.Document != null && EF.Functions.Like(b.Document.Title, $"%{q}%")));
            }

            return await query
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // Create by document page id (MVC controller path)
        public async Task<(bool Success, string? ErrorMessage, int? BookmarkId)> CreateBookmarkAsync(
            int documentPageId,
            string? title,
            string url)
        {
            var page = await GetDocumentPageForBookmarkCreation(documentPageId);
            if (page == null)
            {
                return (false, "Trang không tồn tại.", null);
            }

            // Check existence
            var exists = await _bookmarkRepo.ExistsAsync(documentPageId);
            if (exists)
            {
                return (false, "Bookmark đã tồn tại cho trang này.", null);
            }

            var bookmarkTitle = title ?? $"{page.Document?.Title ?? "Tài liệu"} - Trang {page.PageNumber}";

            var bookmark = new Bookmark
            {
                DocumentPageId = documentPageId,
                DocumentId = page.DocumentId,
                PageNumber = page.PageNumber,
                Url = url,
                Title = bookmarkTitle,
                CreatedAt = DateTime.UtcNow
            };

            await _bookmarkRepo.AddAsync(bookmark);
            await _context.SaveChangesAsync();

            try
            {
                await _notificationService.NotifyBookmarkCreatedAsync(page.Document?.Title ?? "Tài liệu", page.PageNumber);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send bookmark created notification");
            }

            return (true, null, bookmark.Id);
        }

        // Create by documentId + pageNumber (API path)
        public async Task<(bool Success, string? ErrorMessage, int? BookmarkId)> CreateBookmarkAsync(
            int documentId,
            int pageNumber,
            string? title,
            string url)
        {
            // Check if document exists
            var doc = await _docRepo.GetByIdAsync(documentId);
            if (doc == null) return (false, "Tài liệu không tồn tại.", null);

            // Check existence
            var exists = await _context.Bookmarks.AnyAsync(b => b.DocumentId == documentId && b.PageNumber == pageNumber);
            if (exists) return (false, "Đã có bookmark cho trang này.", null);

            var bookmarkTitle = title ?? $"{doc.Title} - Trang {pageNumber}";

            var bookmark = new Bookmark
            {
                DocumentId = documentId,
                PageNumber = pageNumber,
                Url = url,
                Title = bookmarkTitle,
                CreatedAt = DateTime.UtcNow
            };

            await _bookmarkRepo.AddAsync(bookmark);
            await _context.SaveChangesAsync();

            try
            {
                await _notificationService.NotifyBookmarkCreatedAsync(doc.Title, pageNumber);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send bookmark created notification");
            }

            return (true, null, bookmark.Id);
        }

        public async Task<bool> DeleteBookmarkAsync(int id)
        {
            var bookmark = await _bookmarkRepo.GetByIdAsync(id);
            if (bookmark == null) return false;

            var bookmarkTitle = bookmark.Title ?? "Bookmark";

            _bookmarkRepo.Delete(bookmark);
            await _context.SaveChangesAsync();

            try
            {
                await _notificationService.NotifyBookmarkDeletedAsync(bookmarkTitle);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send bookmark deleted notification");
            }

            _logger.LogInformation("Bookmark deleted: {BookmarkTitle} (ID: {BookmarkId})", bookmarkTitle, id);

            return true;
        }

        public Task<Bookmark?> GetBookmarkByIdAsync(int id)
        {
            return _context.Bookmarks
                .Include(b => b.Document)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Bookmark?> GetBookmarkForPageAsync(int documentId, int pageNumber)
        {
            return await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.DocumentId == documentId && b.PageNumber == pageNumber);
        }

        public async Task<DocumentPage?> GetDocumentPageForBookmarkCreation(int documentPageId)
        {
            return await _context.DocumentPages
                .Include(p => p.Document)
                .FirstOrDefaultAsync(p => p.Id == documentPageId);
        }
    }
}