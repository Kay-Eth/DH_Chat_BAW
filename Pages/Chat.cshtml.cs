using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatModel : PageModel
{
    private readonly ILogger<ChatModel> _logger;

    public ChatModel(ILogger<ChatModel> logger)
    {
        _logger = logger;

        
    }

    public IActionResult OnGet()
    {
        if (!HttpContext.User.Identity!.IsAuthenticated)
        {
            return Redirect("/Front/Index");
        }
        return Page();
    }
}
