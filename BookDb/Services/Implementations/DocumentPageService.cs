using BookDb.Models;
using BookDb.Repositories.Interfaces;
using BookDb.Services.Interfaces;

namespace BookDb.Services.Implementations
{
 public class DocumentPageService : IDocumentPageService
 {
 private readonly IDocumentPageRepository _pageRepo;
 private readonly AppDbContext _context;
 private readonly INotificationService _notificationService;
 private readonly ILogger<DocumentPageService> _logger;

 public DocumentPageService(
 IDocumentPageRepository pageRepo,
 AppDbContext context,
 INotificationService notificationService,
 ILogger<DocumentPageService> logger)
 {
 _pageRepo = pageRepo;
 _context = context;
 _notificationService = notificationService;
 _logger = logger;
 }

 public Task<DocumentPage?> GetPageByIdAsync(int id)
 {
 return _pageRepo.GetByIdAsync(id);
 }

 public async Task<IEnumerable<DocumentPage>> GetPagesOfDocumentAsync(int documentId)
 {
 return await _pageRepo.GetPagesByDocumentIdAsync(documentId);
 }

 public async Task CreatePageAsync(DocumentPage page)
 {
 await _pageRepo.AddAsync(page);
 await _context.SaveChangesAsync();
 }

 public async Task UpdatePageAsync(int id, string textContent)
 {
 var page = await _pageRepo.GetByIdAsync(id);
 if (page == null) throw new KeyNotFoundException("Không tìm th?y trang tài li?u.");
 page.TextContent = textContent;
 _pageRepo.Update(page);
 await _context.SaveChangesAsync();
 try
 {
 await _notificationService.NotifyPageEditedAsync(page.DocumentId, page.Id);
 }
 catch (Exception ex)
 {
 _logger.LogWarning(ex, "Failed to notify about page edit");
 }
 }

 public async Task DeletePageAsync(int id)
 {
 var page = await _pageRepo.GetByIdAsync(id);
 if (page == null) throw new KeyNotFoundException("Không tìm th?y trang tài li?u.");
 _pageRepo.Delete(page);
 await _context.SaveChangesAsync();
 }

 public async Task<IEnumerable<DocumentPage>> GetPagesWithBookmarksAsync(int documentId)
 {
 return await _pageRepo.GetPagesWithBookmarksAsync(documentId);
 }
 }
}
