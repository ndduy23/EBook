using System.ComponentModel.DataAnnotations;

namespace BookDb.Models
{
    /// <summary>
    /// Thực thể Category (Lĩnh vực/Danh mục)
    /// </summary>
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation property - nhiều-nhiều với Document
        public ICollection<DocumentCategory> DocumentCategories { get; set; } = new List<DocumentCategory>();
    }

    /// <summary>
    /// Bảng trung gian cho quan hệ nhiều-nhiều Document-Category
    /// </summary>
    public class DocumentCategory
    {
        [Key]
        public int Id { get; set; }

        public int DocumentId { get; set; }
        public Document? Document { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}