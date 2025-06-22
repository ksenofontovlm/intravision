using Microsoft.EntityFrameworkCore;
using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;

namespace VendingMachine.Infrastructure.DAL.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(VendingMachineDbContext context) : base(context) { }

        public async Task<IEnumerable<Product>> GetFilteredProductsAsync(int? brandId, decimal? minPrice, decimal? maxPrice)
        {
            var query = _context.Products.AsQueryable();

            if (brandId.HasValue && brandId.Value > 0)
                query = query.Where(p => p.BrandId == brandId.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            return await query.Include(p => p.Brand).ToListAsync();
        }
    }
}
