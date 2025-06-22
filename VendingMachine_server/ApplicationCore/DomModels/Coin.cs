using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VendingMachine.ApplicationCore.DomModels
{
    public class Coin
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Denomination { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
