using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

[Authorize]
public class ChatModel : PageModel
{
    public const string VIEW_DATA_MY_ID_KEY = "my_id";
    public const string VIEW_DATA_RECEIVER_ID_KEY = "receiver_id";

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
        if (!HttpContext.User.Identity!.IsAuthenticated)
            return Redirect("/Front/Index");

        object? receiverUsernameObj;
        if (!TempData.TryGetValue(NewChatModel.TEMP_DATA_RECEIVER_USER_NAME_KEY, out receiverUsernameObj))
            return RedirectToPage("NewChat");
        string receiverUsername = receiverUsernameObj as string ?? "";

        var result = await _userManager.FindByNameAsync(receiverUsername);
        if (result == null)
        {
            _logger.LogWarning("Invalid username: {ReceiverUsername}", receiverUsername);
            return RedirectToPage("NewChat");
        }
        else
        {
            var myUser = await _userManager.FindByNameAsync(HttpContext.User.Identity.Name!);
            
            ViewData[VIEW_DATA_MY_ID_KEY] = myUser!.Id;
            ViewData[VIEW_DATA_RECEIVER_ID_KEY] = result.Id.ToString();
            return Page();
        }
    }
}
