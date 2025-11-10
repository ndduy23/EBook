using System;
using System.ComponentModel.DataAnnotations;

namespace BookDb.Models
{
    public class Bookmark
    {
        [Key]
        public int Id { get; set; }

        // Link to DocumentPage (preferred by migrations and views)
        public int? DocumentPageId { get; set; }
        public DocumentPage? DocumentPage { get; set; }

        // Also keep DocumentId and PageNumber for services that use them
        public int? DocumentId { get; set; }
        public int? PageNumber { get; set; }
        public Document? Document { get; set; }

        [Required]
        public string Url { get; set; } = string.Empty;

        public string? Title { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}