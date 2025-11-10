using BookDb.Models;

namespace BookDb.Repositories.Interfaces
{
 public interface IDocumentPageRepository : IGenericRepository<DocumentPage>
 {
 Task<DocumentPage?> GetByIdWithDocumentAsync(int id);
 Task<List<DocumentPage>> GetPagesByDocumentIdAsync(int documentId);
 Task<List<DocumentPage>> GetPagesWithBookmarksAsync(int documentId);
 }
}
