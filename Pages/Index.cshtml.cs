using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BawChat.Pages;

public class IndexModel : PageModel
{
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

    public async Task<IActionResult> OnPost()
    {
        var userDb = await _userManager.FindByNameAsync(Username!);
        if (userDb == null)
            return BadRequest("Login attempt failed.");
        
        var result = await _signInManager.PasswordSignInAsync(userDb, Password!, false, lockoutOnFailure: false);
        if (result.Succeeded)
            return RedirectToPage("Chat");
        else
            return BadRequest("Login attempt failed.");
    }
}
