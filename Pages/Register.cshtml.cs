using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

public class RegisterModel : PageModel
{
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

    public void OnGet()
    {

    }

    public async Task<IActionResult> OnPost()
    {
        var userDb = await _userManager.FindByEmailAsync(Email!);
        if (userDb != null)
            return BadRequest("Failed to create account.");

        var user = new IdentityUser<Guid>();
        user.Email = Email;
        user.UserName = Username;
        var result = await _userManager.CreateAsync(user, Password!);
        if (result.Succeeded)
        {
            ViewData["Success"] = "Success";
            return RedirectToPage("Index");
        }
        else
        {
            foreach (var error in result.Errors)
            {
                _logger.LogError(error.Description);
            }
            ViewData["Success"] = "Failure";
            return Page();
        }
    }
}
