using System.Reflection;
using RealTimeChatAPI;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPresentation(builder.Configuration)
    .AddApplication()
    .AddDatabase(builder.Configuration);

builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.ApplyMigrations();
}

app.UseExceptionHandler();

app.MapEndpoints();

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
