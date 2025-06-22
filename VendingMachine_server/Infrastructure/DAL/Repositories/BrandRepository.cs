using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;

namespace VendingMachine.Infrastructure.DAL.Repositories
{
    public class BrandRepository : Repository<Brand>, IBrandRepository
    {
        public BrandRepository(VendingMachineDbContext context) : base(context) { }
    }
}
