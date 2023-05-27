using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

public class RegisterModel : PageModel
{
    public const string VIEW_DATA_RESULT_MSG_KEY = "error";
    public const string REGISTER_SUCCESS_MSG = "Register attempt successfull.";
    public const string REGISTER_FAILED_MSG = "Register attempt failed.";

    [BindProperty]
    public string? Email { get; set; }

    [BindProperty]
    public string? Username { get; set; }

    [BindProperty]
    public string? Password { get; set; }

    private readonly ILogger<RegisterModel> _logger;
    private readonly UserManager<IdentityUser<Guid>> _userManager;
    private readonly SignInManager<IdentityUser<Guid>> _signInManager;


    public RegisterModel(
        UserManager<IdentityUser<Guid>> userManager,
        SignInManager<IdentityUser<Guid>> signInManager,
        ILogger<RegisterModel> logger
    ) {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    public async Task<IActionResult> OnPost()
    {
        var userDb = await _userManager.FindByEmailAsync(Email!);
        if (userDb != null)
        {
            ViewData[VIEW_DATA_RESULT_MSG_KEY] = REGISTER_FAILED_MSG;
        }

        var user = new IdentityUser<Guid>();
        user.Email = Email;
        user.UserName = Username;
        var result = await _userManager.CreateAsync(user, Password!);
        if (result.Succeeded)
        {
            TempData[IndexModel.TEMP_DATA_REGISTER_SUCCESS_KEY] = REGISTER_SUCCESS_MSG;
            return RedirectToPage("Index");
        }
        else
        {
            foreach (var error in result.Errors)
            {
                _logger.LogError(error.Description);
            }
            ViewData[VIEW_DATA_RESULT_MSG_KEY] = REGISTER_FAILED_MSG;
            return Page();
        }
    }
}
