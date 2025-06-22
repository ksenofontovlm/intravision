using Microsoft.EntityFrameworkCore;
using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;

namespace VendingMachine.Infrastructure.DAL.Repositories
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(VendingMachineDbContext context) : base(context) { }

        public async Task<Order?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task RemoveOrderItemAsync(int orderId, int productId)
        {
            var order = await GetByIdWithDetailsAsync(orderId);
            if (order == null)
                throw new InvalidOperationException("Заказ не найден");

            var item = order.OrderItems.FirstOrDefault(oi => oi.ProductId == productId);
            if (item != null)
            {
                order.OrderItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateOrderAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
