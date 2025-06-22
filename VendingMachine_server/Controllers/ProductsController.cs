using Microsoft.AspNetCore.Mvc;
using VendingMachine.ApplicationCore.Interfaces.Services;

namespace VendingMachine.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IVendingMachineService _vendingMachineService;

        public ProductsController(IVendingMachineService vendingMachineService)
        {
            _vendingMachineService = vendingMachineService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] int? brandId, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice)
        {
            var products = await _vendingMachineService.GetProductsAsync(brandId, minPrice, maxPrice);
            return Ok(products);
        }

        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _vendingMachineService.GetBrandsAsync();
            return Ok(brands);
        }

        [HttpGet("price-range")]
        public async Task<IActionResult> GetPriceRange([FromQuery] int? brandId)
        {
            var (minPrice, maxPrice) = await _vendingMachineService.GetPriceRangeAsync(brandId);
            return Ok(new { MinPrice = minPrice, MaxPrice = maxPrice });
        }


        [HttpPost("import")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не предоставлен");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Требуется файл формата .xlsx");

            try
            {
                using var stream = file.OpenReadStream();
                await _vendingMachineService.ImportProductsFromExcelAsync(stream);
                return Ok("Импорт товаров успешно завершен");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при импорте: {ex.Message}");
            }
        }

        [HttpPut("{productId}/stock")]
        public async Task<IActionResult> UpdateProductStock(int productId, [FromBody] int newQuantity)
        {
            if (newQuantity < 0)
                return BadRequest("Количество не может быть отрицательным");

            try
            {
                await _vendingMachineService.UpdateProductStockAsync(productId, newQuantity);
                return Ok("Количество товара обновлено");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }



    }
}
