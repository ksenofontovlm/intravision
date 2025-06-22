using System.ComponentModel.DataAnnotations;

namespace VendingMachine.ApplicationCore.DomModels
{
    public class Brand
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        //[JsonIgnore]
        public ICollection<Product> Products { get; set; }
    }
}
