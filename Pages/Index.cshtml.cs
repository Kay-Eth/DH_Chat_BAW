using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

public class IndexModel : PageModel
{
    public const string VIEW_DATA_ERROR_MSG_KEY = "error_message";
    public const string LOGIN_FAILED_MSG = "Login attempt failed.";

    public const string TEMP_DATA_REGISTER_SUCCESS_KEY = "register_success";

    [BindProperty]
    public string? Username { get; set; }

    [BindProperty]
    public string? Password { get; set; }

    private readonly ILogger<IndexModel> _logger;
    private readonly UserManager<IdentityUser<Guid>> _userManager;
    private readonly SignInManager<IdentityUser<Guid>> _signInManager;


    public IndexModel(
        UserManager<IdentityUser<Guid>> userManager,
        SignInManager<IdentityUser<Guid>> signInManager,
        ILogger<IndexModel> logger
    ) {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    public IActionResult OnGet()
    {
        if (HttpContext.User.Identity!.IsAuthenticated)
        {
            return Redirect("/NewChat");
        }
        return Page();
    }

    public async Task<IActionResult> OnPost()
    {
        ViewData.Remove(VIEW_DATA_ERROR_MSG_KEY);

        var userDb = await _userManager.FindByNameAsync(Username!);
        if (userDb == null)
        {
            ViewData[VIEW_DATA_ERROR_MSG_KEY] = LOGIN_FAILED_MSG;
            return Page();
        }
            
        var result = await _signInManager.PasswordSignInAsync(userDb, Password!, false, lockoutOnFailure: false);
        if (result.Succeeded)
            return RedirectToPage("NewChat");
        else
        {
            ViewData[VIEW_DATA_ERROR_MSG_KEY] = LOGIN_FAILED_MSG;
            return Page();
        }   
    }
}
