using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookDb.Models
{
 public class DocumentPage
 {
 [Key]
 public int Id { get; set; }

 [Required]
 public int DocumentId { get; set; }

 public Document? Document { get; set; }

 [Required]
 public int PageNumber { get; set; }

 public string? TextContent { get; set; }

 public string? FilePath { get; set; }

 [MaxLength(100)]
 public string? ContentType { get; set; }

 // Each page may have one bookmark (based on migration unique index)
 public Bookmark? Bookmark { get; set; }
 }
}
