using BookDb.Models;

namespace BookDb.Services.Interfaces
{
 public interface IDocumentPageService
 {
 Task<DocumentPage?> GetPageByIdAsync(int id);
 Task<IEnumerable<DocumentPage>> GetPagesOfDocumentAsync(int documentId);
 Task CreatePageAsync(DocumentPage page);
 Task UpdatePageAsync(int id, string textContent);
 Task DeletePageAsync(int id);
 Task<IEnumerable<DocumentPage>> GetPagesWithBookmarksAsync(int documentId);
 }
}
