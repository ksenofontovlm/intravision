using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Models;

namespace VendingMachine.ApplicationCore.Interfaces.Services
{
    public interface IVendingMachineService
    {
        Task<IEnumerable<Product>> GetProductsAsync(int? brandId, decimal? minPrice, decimal? maxPrice);
        Task<(decimal MinPrice, decimal MaxPrice)> GetPriceRangeAsync(int? brandId);
        Task<IEnumerable<Brand>> GetBrandsAsync();
        Task<IEnumerable<Coin>> GetCoinsAsync();
        Task<bool> IsMachineBusyAsync();
        Task LockMachineAsync();
        Task UnlockMachineAsync();
        Task<Order> CreateOrderAsync(List<CartItem> cartItems);
        Task UpdateCartItemAsync(int orderId, CartItem cartItem);
        Task RemoveCartItemAsync(int orderId, int productId);
        Task<bool> ProcessPaymentAsync(int orderId, Dictionary<decimal, int> insertedCoins);
        Task<Order?> GetOrderDetailsAsync(int orderId);
        Task<Dictionary<decimal, int>> CalculateChangeAsync(decimal change);
        Task ImportProductsFromExcelAsync(Stream fileStream);
        Task UpdateProductStockAsync(int productId, int newQuantity);
    }
}
