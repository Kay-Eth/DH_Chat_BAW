using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

[Authorize]
public class NewChatModel : PageModel
{
    public const string TEMP_DATA_RECEIVER_USER_NAME_KEY = "receiver_id";
    public const string VIEW_DATA_USER_NOT_FOUND_KEY = "not_found";
    public const string VIEW_DATA_USER_NOT_FOUND_MSG = "User not found";

    [BindProperty]
    public string? ReceiverUsername { get; set; }

    private readonly ILogger<NewChatModel> _logger;
    private readonly UserManager<IdentityUser<Guid>> _userManager;

    public NewChatModel(
        UserManager<IdentityUser<Guid>> userManager,
        ILogger<NewChatModel> logger
    ) {
        _userManager = userManager;
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

    public async Task<IActionResult> OnPost()
    {
        if (ReceiverUsername != null)
        {
            var result = await _userManager.FindByNameAsync(ReceiverUsername);
            if (result == null)
            {
                _logger.LogWarning("Invalid username: {ReceiverUsername}", ReceiverUsername);
                ViewData[VIEW_DATA_USER_NOT_FOUND_KEY] = VIEW_DATA_USER_NOT_FOUND_MSG;
                return Page();
            }
            else
            {
                TempData[TEMP_DATA_RECEIVER_USER_NAME_KEY] = ReceiverUsername;
                return RedirectToPage("Chat");
            }
        }
        else
        {
            return Page();
        }
    }
}
