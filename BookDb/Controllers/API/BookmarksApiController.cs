using BookDb.Models;
using BookDb.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookDb.Controllers.Api
{
    [Route("api/bookmarks")]
    [ApiController]
    [Authorize]
    public class BookmarksApiController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;
        private readonly ILogger<BookmarksApiController> _logger;

        public BookmarksApiController(
            IBookmarkService bookmarkService,
            ILogger<BookmarksApiController> logger)
        {
            _bookmarkService = bookmarkService;
            _logger = logger;
        }

        // GET: api/bookmarks
        [HttpGet]
        public async Task<IActionResult> GetBookmarks([FromQuery] string? search)
        {
            try
            {
                var bookmarks = await _bookmarkService.GetBookmarksAsync(search);

                return Ok(new
                {
                    success = true,
                    data = bookmarks.Select(b => new
                    {
                        b.Id,
                        b.DocumentId,
                        DocumentTitle = b.Document?.Title ?? "Unknown",
                        b.PageNumber,
                        b.Title,
                        b.Url,
                        CreatedAt = b.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                    }),
                    count = bookmarks.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookmarks");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra" });
            }
        }

        // GET: api/bookmarks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookmark(int id)
        {
            try
            {
                var bookmark = await _bookmarkService.GetBookmarkByIdAsync(id);

                if (bookmark == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bookmark" });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        bookmark.Id,
                        bookmark.DocumentId,
                        DocumentTitle = bookmark.Document?.Title ?? "Unknown",
                        bookmark.PageNumber,
                        bookmark.Title,
                        bookmark.Url,
                        CreatedAt = bookmark.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookmark {BookmarkId}", id);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra" });
            }
        }

        // GET: api/bookmarks/check
        [HttpGet("check")]
        public async Task<IActionResult> CheckBookmark([FromQuery] int documentId, [FromQuery] int pageNumber)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var bookmark = await _bookmarkService.GetBookmarkForPageAsync(documentId, pageNumber, userId);

                return Ok(new
                {
                    exists = bookmark != null,
                    bookmarkId = bookmark?.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking bookmark");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra" });
            }
        }

        // POST: api/bookmarks/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateBookmark([FromBody] CreateBookmarkDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var result = await _bookmarkService.CreateBookmarkAsync(
                    model.DocumentId,
                    model.PageNumber,
                    model.Title,
                    model.Url ?? string.Empty,
                    userId);

                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.ErrorMessage });
                }

                return Ok(new
                {
                    success = true,
                    message = "Đã thêm bookmark thành công",
                    bookmarkId = result.BookmarkId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bookmark");
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra" });
            }
        }

        // DELETE: api/bookmarks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBookmark(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole(Models.Roles.Admin);

                var success = await _bookmarkService.DeleteBookmarkAsync(id, userId, isAdmin);

                if (!success)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bookmark hoặc không có quyền" });
                }

                return Ok(new { success = true, message = "Đã xóa bookmark" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting bookmark {BookmarkId}", id);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra" });
            }
        }
    }

    public class CreateBookmarkDto
    {
        public int DocumentId { get; set; }
        public int PageNumber { get; set; }
        public string? Title { get; set; }
        public string? Url { get; set; }
    }
}