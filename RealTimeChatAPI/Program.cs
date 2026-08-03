using System.Reflection;
using RealTimeChatAPI;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPresentation(builder.Configuration)
    .AddApplication()
    .AddDatabase(builder.Configuration);

builder.Services.AddOpenApi();
builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.ApplyMigrations();
}

app.UseExceptionHandler();

app.MapEndpoints();

app.UseHttpsRedirection();

app.Run();
