using VendingMachine.ApplicationCore.DomModels;

namespace VendingMachine.ApplicationCore.Interfaces.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetFilteredProductsAsync(int? brandId, decimal? minPrice, decimal? maxPrice);
    }
}
