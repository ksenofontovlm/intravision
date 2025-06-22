using Microsoft.EntityFrameworkCore;

namespace VendingMachine.ApplicationCore.DomModels
{
    public class VendingMachineDbContext : DbContext
    {
        public VendingMachineDbContext(DbContextOptions<VendingMachineDbContext> options)
            : base(options)
        {
        }

        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Coin> Coins { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Brand)
                .WithMany(b => b.Products)
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed initial data
            modelBuilder.Entity<Brand>().HasData(
                new Brand { Id = 1, Name = "Coca-Cola" },
                new Brand { Id = 2, Name = "Pepsi" },
                new Brand { Id = 3, Name = "Sprite" },
                new Brand { Id = 4, Name = "Fanta" }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Coca-Cola Classic", Price = 80.00m, QuantityInStock = 50, BrandId = 1 },
                new Product { Id = 2, Name = "Coca-Cola Zero", Price = 80.00m, QuantityInStock = 40, BrandId = 1 },
                new Product { Id = 3, Name = "Pepsi", Price = 75.00m, QuantityInStock = 60, BrandId = 2 },
                new Product { Id = 4, Name = "Pepsi Max", Price = 75.00m, QuantityInStock = 30, BrandId = 2 },
                new Product { Id = 5, Name = "Sprite", Price = 70.00m, QuantityInStock = 45, BrandId = 3 },
                new Product { Id = 6, Name = "Sprite Zero", Price = 70.00m, QuantityInStock = 20, BrandId = 3 },
                new Product { Id = 7, Name = "Fanta Orange", Price = 85.00m, QuantityInStock = 50, BrandId = 4 },
                new Product { Id = 8, Name = "Fanta Pineapple", Price = 85.00m, QuantityInStock = 25, BrandId = 4 }
            );

            modelBuilder.Entity<Coin>().HasData(
                new Coin { Id = 1, Denomination = 1.00m, Quantity = 100 },
                new Coin { Id = 2, Denomination = 2.00m, Quantity = 100 },
                new Coin { Id = 3, Denomination = 5.00m, Quantity = 50 },
                new Coin { Id = 4, Denomination = 10.00m, Quantity = 50 }
            );
        }
    }
}
