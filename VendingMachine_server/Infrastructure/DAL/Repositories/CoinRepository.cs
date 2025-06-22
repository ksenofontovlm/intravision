using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;

namespace VendingMachine.Infrastructure.DAL.Repositories
{
    public class CoinRepository : Repository<Coin>, ICoinRepository
    {
        public CoinRepository(VendingMachineDbContext context) : base(context) { }
    }
}
