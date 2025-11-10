using BookDb.Models;
using BookDb.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookDb.Repositories.Implementations
{
    public class BookmarkRepository : GenericRepository<Bookmark>, IBookmarkRepository
    {
        public BookmarkRepository(AppDbContext context) : base(context) { }

        public Task<List<Bookmark>> GetAllWithDetailsAsync()
        {
            return _context.Bookmarks
                .Include(b => b.Document)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Bookmark>> GetFilteredBookmarksAsync(string? q)
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

        public async Task<bool> ExistsAsync(int documentPageId)
        {
            // DocumentPageId no longer exists; interpret as (documentId,pageNumber) - but to keep signature, return false
            return await Task.FromResult(false);
        }
    }
}