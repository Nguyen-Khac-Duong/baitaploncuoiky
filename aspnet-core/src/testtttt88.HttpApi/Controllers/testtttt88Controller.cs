using testtttt88.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace testtttt88.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class testtttt88Controller : AbpControllerBase
{
    protected testtttt88Controller()
    {
        LocalizationResource = typeof(testtttt88Resource);
    }
}
