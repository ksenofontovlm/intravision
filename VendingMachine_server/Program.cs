using Microsoft.EntityFrameworkCore;
using VendingMachine.ApplicationCore.DomModels;
using VendingMachine.ApplicationCore.Interfaces.Repositories;
using VendingMachine.ApplicationCore.Interfaces.Services;
using VendingMachine.Infrastructure.BLL.Services;
using VendingMachine.Infrastructure.DAL.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<VendingMachineDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("VendingMachineDb")));


#region DI

#region Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<ICoinRepository, CoinRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
#endregion


#region Services
builder.Services.AddScoped<IVendingMachineService, VendingMachineService>();
#endregion

#endregion

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
