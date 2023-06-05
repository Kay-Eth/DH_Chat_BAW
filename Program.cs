using BawChat.Hubs;
using BawChat.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ChatDbContext>(
    dbContextOptions => dbContextOptions.UseSqlite(
        builder.Configuration.GetConnectionString("Database")
    )
);

builder.Services.AddIdentity<IdentityUser<Guid>, IdentityRole<Guid>>(opt =>
{
    opt.User.RequireUniqueEmail = true;

    opt.Password.RequiredLength = 4;
    opt.Password.RequireDigit = false;
    opt.Password.RequireLowercase = false;
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequiredUniqueChars = 0;
})
    .AddEntityFrameworkStores<ChatDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthorization();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => {
        builder.Configuration.Bind("JwtSettings", options);
    });

builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = new PathString("/Index");
    builder.Configuration.Bind("CookieSettings", options);
});

builder.Services.AddScoped<IDbRepository, SqliteDbRepository>();

// Add services to the container.
builder.Services.AddRazorPages(options => {
    options.Conventions.AuthorizePage("/Chat");
});
builder.Services.AddSignalR();

var app = builder.Build();

app.UseAuthentication();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub");

app.Run();