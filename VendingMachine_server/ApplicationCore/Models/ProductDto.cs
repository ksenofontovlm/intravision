namespace VendingMachine.ApplicationCore.Models
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public int BrandId { get; set; }
        public BrandDto Brand { get; set; }
    }
}
