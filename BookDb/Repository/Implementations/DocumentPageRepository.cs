using BookDb.Models;
using BookDb.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookDb.Repositories.Implementations
{
 public class DocumentPageRepository : GenericRepository<DocumentPage>, IDocumentPageRepository
 {
 public DocumentPageRepository(AppDbContext context) : base(context) { }

 public async Task<DocumentPage?> GetByIdWithDocumentAsync(int id)
 {
 return await _context.Set<DocumentPage>()
 .Include(p => p.Document)
 .Include(p => p.Bookmark)
 .FirstOrDefaultAsync(p => p.Id == id);
 }

 public async Task<List<DocumentPage>> GetPagesByDocumentIdAsync(int documentId)
 {
 return await _context.Set<DocumentPage>()
 .Where(p => p.DocumentId == documentId)
 .OrderBy(p => p.PageNumber)
 .ToListAsync();
 }

 public async Task<List<DocumentPage>> GetPagesWithBookmarksAsync(int documentId)
 {
 return await _context.Set<DocumentPage>()
 .Where(p => p.DocumentId == documentId)
 .Include(p => p.Bookmark)
 .OrderBy(p => p.PageNumber)
 .ToListAsync();
 }
 }
}
