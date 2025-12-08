using BookDb.Models;

namespace BookDb.Repository.Implementations
{
 // Compatibility interfaces that extend the canonical ones in BookDb.Repositories.Interfaces
 public interface IGenericRepository<T> : Repositories.Interfaces.IGenericRepository<T> where T : class { }

 public interface IDocumentRepository : Repositories.Interfaces.IDocumentRepository { }

 public interface IDocumentPageRepository : Repositories.Interfaces.IDocumentPageRepository { }

 public interface IRefreshTokenRepository : Interfaces.IRefreshTokenRepository { }
}
