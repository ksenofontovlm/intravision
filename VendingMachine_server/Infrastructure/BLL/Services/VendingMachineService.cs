using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;
using VendingMachine.ApplicationCore.Interfaces.Services;
using VendingMachine.ApplicationCore.Models;

namespace VendingMachine.Infrastructure.BLL.Services
{
    public class VendingMachineService : IVendingMachineService
    {
        private readonly IProductRepository _productRepository;
        private readonly IBrandRepository _brandRepository;
        private readonly ICoinRepository _coinRepository;
        private readonly IOrderRepository _orderRepository;
        private static readonly object _lock = new object();
        private static bool _isMachineBusy;

        public VendingMachineService(
            IProductRepository productRepository,
            IBrandRepository brandRepository,
            ICoinRepository coinRepository,
            IOrderRepository orderRepository)
        {
            _productRepository = productRepository;
            _brandRepository = brandRepository;
            _coinRepository = coinRepository;
            _orderRepository = orderRepository;
        }


        public async Task<IEnumerable<ProductDto>> GetProductsAsync(int? brandId, decimal? minPrice, decimal? maxPrice)
        {
            var products = await _productRepository.GetFilteredProductsAsync(brandId, minPrice, maxPrice);
            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                QuantityInStock = p.QuantityInStock,
                BrandId = p.BrandId,
                Brand = new BrandDto
                {
                    Id = p.Brand.Id,
                    Name = p.Brand.Name
                }
            }).ToList();
        }

        public async Task<(decimal MinPrice, decimal MaxPrice)> GetPriceRangeAsync(int? brandId)
        {
            var products = await _productRepository.GetFilteredProductsAsync(brandId, null, null);
            var minPrice = products.Any() ? products.Min(p => p.Price) : 0m;
            var maxPrice = products.Any() ? products.Max(p => p.Price) : 0m;
            return (minPrice, maxPrice);
        }

        public async Task<IEnumerable<BrandDto>> GetBrandsAsync()
        {
            var brands = await _brandRepository.GetAllAsync();
            return brands.Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name
            }).ToList();
        }

        public async Task<IEnumerable<Coin>> GetCoinsAsync()
        {
            return await _coinRepository.GetAllAsync();
        }

        public async Task<bool> IsMachineBusyAsync()
        {
            return await Task.FromResult(_isMachineBusy);
        }

        public async Task LockMachineAsync()
        {
            lock (_lock)
            {
                if (!_isMachineBusy)
                {
                    _isMachineBusy = true;
                }
            }
            await Task.CompletedTask;
        }

        public async Task UnlockMachineAsync()
        {
            lock (_lock)
            {
                _isMachineBusy = false;
            }
            await Task.CompletedTask;
        }

        public async Task<Order> GetOrderDetailsAsync(int orderId)
        {
            return await _orderRepository.GetByIdWithDetailsAsync(orderId);
        }

        public async Task<Order> CreateOrderAsync(List<CartItem> cartItems)
        {
            var order = new Order { OrderDate = DateTime.UtcNow, TotalAmount = 0m };
            var orderItems = new List<OrderItem>();

            foreach (var item in cartItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Продукт с ID {item.ProductId} не найден");
                }
                if (product.QuantityInStock < item.Quantity)
                    throw new InvalidOperationException($"Недостаточно товара на складе для продукта ID {item.ProductId}");

                order.TotalAmount += product.Price * item.Quantity;
                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    BrandName = product.Brand?.Name ?? "Неизвестный бренд",
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    Order = order
                });

                product.QuantityInStock -= item.Quantity;
                await _productRepository.UpdateAsync(product);
            }

            order.OrderItems = orderItems;
            await _orderRepository.AddAsync(order);
            return order;
        }


        public async Task UpdateCartItemAsync(int orderId, CartItem cartItem)
        {
            Console.WriteLine($"UpdateCartItemAsync: orderId={orderId}, productId={cartItem.ProductId}, quantity={cartItem.Quantity}");
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null)
            {
                Console.WriteLine($"Order not found: orderId={orderId}");
                throw new InvalidOperationException("Заказ не найден");
            }

            var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
            if (product == null)
            {
                Console.WriteLine($"Product not found: productId={cartItem.ProductId}");
                throw new InvalidOperationException($"Продукт с ID {cartItem.ProductId} не найден");
            }
            if (product.QuantityInStock < cartItem.Quantity)
            {
                Console.WriteLine($"Insufficient stock: productId={cartItem.ProductId}, requested={cartItem.Quantity}, available={product.QuantityInStock}");
                throw new InvalidOperationException($"Недостаточно товара на складе для продукта ID {cartItem.ProductId}");
            }
            //if (product.BrandId != 0 && product.Brand == null)
            //    throw new InvalidOperationException($"Продукт с ID {cartItem.ProductId} имеет недействительный BrandId");

            var existingItem = order.OrderItems.FirstOrDefault(oi => oi.ProductId == cartItem.ProductId);
            if (existingItem != null)
            {
                var oldQuantity = existingItem.Quantity;
                existingItem.Quantity = cartItem.Quantity;
                existingItem.UnitPrice = product.Price;
                order.TotalAmount += product.Price * (cartItem.Quantity - oldQuantity);
            }
            else
            {
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    BrandName = product.Brand?.Name ?? "Неизвестный бренд",
                    UnitPrice = product.Price,
                    Quantity = cartItem.Quantity,
                    OrderId = orderId
                });
                order.TotalAmount += product.Price * cartItem.Quantity;
            }

            product.QuantityInStock -= cartItem.Quantity;
            await _productRepository.UpdateAsync(product);
            await _orderRepository.UpdateOrderAsync(order);
            Console.WriteLine($"Cart updated: orderId={orderId}, productId={cartItem.ProductId}, newQuantity={cartItem.Quantity}");
        }

        public async Task<bool> ProcessPaymentAsync(int orderId, Dictionary<decimal, int> insertedCoins)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null) throw new InvalidOperationException("Заказ не найден");

            var totalInserted = insertedCoins.Sum(c => c.Key * c.Value);
            if (totalInserted < order.TotalAmount)
                return false;

            var change = totalInserted - order.TotalAmount;
            var availableCoins = await _coinRepository.GetAllAsync();
            var changeCoins = CalculateChange(change, availableCoins.ToList());
            if (changeCoins == null)
                throw new InvalidOperationException("Невозможно выдать сдачу");

            // Update coin quantities
            foreach (var coin in insertedCoins)
            {
                var dbCoin = availableCoins.FirstOrDefault(c => c.Denomination == coin.Key);
                if (dbCoin != null)
                {
                    dbCoin.Quantity += coin.Value;
                    await _coinRepository.UpdateAsync(dbCoin);
                }
            }

            foreach (var changeCoin in changeCoins)
            {
                var dbCoin = availableCoins.FirstOrDefault(c => c.Denomination == changeCoin.Key);
                if (dbCoin != null)
                {
                    dbCoin.Quantity -= changeCoin.Value;
                    await _coinRepository.UpdateAsync(dbCoin);
                }
            }

            return true;
        }

        private Dictionary<decimal, int> CalculateChange(decimal change, List<Coin> availableCoins)
        {
            var result = new Dictionary<decimal, int>();
            var sortedCoins = availableCoins.OrderByDescending(c => c.Denomination).ToList();
            decimal remaining = change;

            foreach (var coin in sortedCoins)
            {
                int count = (int)(remaining / coin.Denomination);
                if (count > coin.Quantity) count = coin.Quantity;
                if (count > 0)
                {
                    result[coin.Denomination] = count;
                    remaining -= count * coin.Denomination;
                }
            }

            return remaining == 0 ? result : null;
        }

        public async Task<Dictionary<decimal, int>> CalculateChangeAsync(decimal change)
        {
            var result = new Dictionary<decimal, int>();
            var availableCoins = await _coinRepository.GetAllAsync();
            var sortedCoins = availableCoins.OrderByDescending(c => c.Denomination).ToList();
            decimal remaining = change;

            foreach (var coin in sortedCoins)
            {
                int count = (int)(remaining / coin.Denomination);
                if (count > coin.Quantity) count = coin.Quantity;
                if (count > 0)
                {
                    result[coin.Denomination] = count;
                    remaining -= count * coin.Denomination;
                }
            }

            return remaining == 0 ? result : null;
        }

        public async Task ImportProductsFromExcelAsync(Stream fileStream)
        {
            using var package = new ExcelPackage(fileStream);
            var worksheet = package.Workbook.Worksheets[0];
            var rowCount = worksheet.Dimension.Rows;

            for (int row = 2; row <= rowCount; row++)
            {
                var name = worksheet.Cells[row, 1].Value?.ToString();
                var price = decimal.Parse(worksheet.Cells[row, 2].Value?.ToString());
                var quantity = int.Parse(worksheet.Cells[row, 3].Value?.ToString());
                var brandName = worksheet.Cells[row, 4].Value?.ToString();

                var brand = (await _brandRepository.FindAsync(b => b.Name == brandName)).FirstOrDefault();
                if (brand == null)
                {
                    brand = new Brand { Name = brandName };
                    await _brandRepository.AddAsync(brand);
                }

                var product = new Product
                {
                    Name = name,
                    Price = price,
                    QuantityInStock = quantity,
                    BrandId = brand.Id
                };

                await _productRepository.AddAsync(product);
            }
        }



        public async Task RemoveCartItemAsync(int orderId, int productId)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null)
                throw new InvalidOperationException("Заказ не найден");

            var item = order.OrderItems.FirstOrDefault(oi => oi.ProductId == productId);
            if (item != null)
            {
                order.TotalAmount -= item.UnitPrice * item.Quantity;
                var product = await _productRepository.GetByIdAsync(productId);
                product.QuantityInStock += item.Quantity;
                await _productRepository.UpdateAsync(product);
                await _orderRepository.RemoveOrderItemAsync(orderId, productId);
            }
        }


        public async Task UpdateProductStockAsync(int productId, int newQuantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                throw new InvalidOperationException("Товар не найден");

            product.QuantityInStock = newQuantity;
            await _productRepository.UpdateAsync(product);
        }
    }
}
