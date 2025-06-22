using VendingMachine.ApplicationCore.DomModels;

namespace VendingMachine.ApplicationCore.Interfaces.Repositories
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<Order?> GetByIdWithDetailsAsync(int id);
        Task UpdateOrderAsync(Order order);
        Task RemoveOrderItemAsync(int orderId, int productId);
    }

}
