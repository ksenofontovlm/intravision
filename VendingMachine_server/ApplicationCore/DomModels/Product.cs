using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VendingMachine.ApplicationCore.DomModels
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int QuantityInStock { get; set; }

        [Required]
        public int BrandId { get; set; }

        [ForeignKey("BrandId")]
        public Brand Brand { get; set; }
    }
}
