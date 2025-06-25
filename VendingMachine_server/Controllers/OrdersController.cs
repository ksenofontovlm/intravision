using Microsoft.AspNetCore.Mvc;
using VendingMachine.ApplicationCore.Interfaces.Services;
using VendingMachine.ApplicationCore.Models;

namespace VendingMachine.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IVendingMachineService _vendingMachineService;

        public OrdersController(IVendingMachineService vendingMachineService)
        {
            _vendingMachineService = vendingMachineService;
        }

        [HttpGet("is-machine-busy")]
        public async Task<IActionResult> IsMachineBusy()
        {
            var isBusy = await _vendingMachineService.IsMachineBusyAsync();
            return Ok(new { IsBusy = isBusy });
        }

        [HttpPost("lock-machine")]
        public async Task<IActionResult> LockMachine()
        {
            await _vendingMachineService.LockMachineAsync();
            return Ok();
        }

        [HttpPost("unlock-machine")]
        public async Task<IActionResult> UnlockMachine()
        {
            await _vendingMachineService.UnlockMachineAsync();
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] List<CartItem> cartItems)
        {
            if (!cartItems.Any())
                return BadRequest("Корзина пуста");

            try
            {
                var order = await _vendingMachineService.CreateOrderAsync(cartItems);
                return Ok(new { OrderId = order.Id, TotalAmount = order.TotalAmount });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("coins")]
        public async Task<IActionResult> GetCoins()
        {
            var coins = await _vendingMachineService.GetCoinsAsync();
            return Ok(coins);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            try
            {
                var order = await _vendingMachineService.GetOrderDetailsAsync(orderId);
                if (order == null)
                    return NotFound("Заказ не найден");
                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка: {ex.Message}");
            }
        }

        [HttpPut("cart")]
        public async Task<IActionResult> UpdateCartItem([FromQuery] int orderId, [FromBody] CartItem cartItem)
        {
            try
            {
                if (cartItem == null || cartItem.ProductId <= 0 || cartItem.Quantity <= 0)
                {
                    return BadRequest("Некорректные данные в запросе: productId или quantity недействительны");
                }
                await _vendingMachineService.UpdateCartItemAsync(orderId, cartItem);
                return Ok("Корзина обновлена");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Внутренняя ошибка сервера", details = ex.Message });
            }
        }


        [HttpDelete("cart/{productId}")]
        public async Task<IActionResult> RemoveCartItem([FromQuery] int orderId, int productId)
        {
            try
            {
                await _vendingMachineService.RemoveCartItemAsync(orderId, productId);
                return Ok("Товар удален из корзины");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{orderId}/pay")]
        public async Task<IActionResult> ProcessPayment(int orderId, [FromBody] Dictionary<decimal, int> insertedCoins)
        {
            try
            {
                var success = await _vendingMachineService.ProcessPaymentAsync(orderId, insertedCoins);
                if (!success)
                    return BadRequest("Недостаточно средств для оплаты");

                var order = await _vendingMachineService.GetOrderDetailsAsync(orderId);
                var totalInserted = insertedCoins.Sum(c => c.Key * c.Value);
                var change = totalInserted - order.TotalAmount;
                var changeCoins = await _vendingMachineService.CalculateChangeAsync(change);

                if (changeCoins == null)
                    return BadRequest("Извините, в данный момент мы не можем продать вам товар по причине того, что автомат не может выдать вам нужную сдачу");

                return Ok(new
                {
                    Message = "Спасибо за вашу покупку, пожалуйста, возьмите вашу сдачу",
                    ChangeAmount = change,
                    ChangeCoins = changeCoins
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
