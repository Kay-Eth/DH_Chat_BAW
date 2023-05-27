using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

[Authorize]
public class ChatModel : PageModel
{
    public const string VIEW_DATA_MY_USERNAME_KEY = "my_username";
    public const string VIEW_DATA_RECEIVER_USERNAME_KEY = "receiver_username";
    public const string VIEW_DATA_CHAT_ID_KEY = "chat_id";

    private readonly ILogger<ChatModel> _logger;
    private readonly UserManager<IdentityUser<Guid>> _userManager;


    public ChatModel(
        UserManager<IdentityUser<Guid>> userManager,
        ILogger<ChatModel> logger
    )
    {
        _logger = logger;
        _userManager = userManager;
    }

    public async Task<IActionResult> OnGet()
    {
        _logger.LogInformation("Start");

        if (!HttpContext.User.Identity!.IsAuthenticated)
        {
            
            return Redirect("/Front/Index");
        }

        _logger.LogInformation("Test");

        object? receiverUsernameObj;
        if (!TempData.TryGetValue(NewChatModel.TEMP_DATA_RECEIVER_USER_NAME_KEY, out receiverUsernameObj))
        {
            _logger.LogInformation("Temp Empty");
            return RedirectToPage("NewChat");
        }
        string receiverUsername = receiverUsernameObj as string ?? "";
        _logger.LogInformation(receiverUsername);

        var result = await _userManager.FindByNameAsync(receiverUsername);
        if (result == null)
        {
            _logger.LogInformation("Redirect");
            return RedirectToPage("NewChat");
        }
        else
        {
            _logger.LogInformation("Correct");
            ViewData[VIEW_DATA_CHAT_ID_KEY] = "Kopytko";
            return Page();
        }
    }
}
