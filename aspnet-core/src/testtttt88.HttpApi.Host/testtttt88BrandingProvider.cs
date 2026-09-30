using Microsoft.Extensions.Localization;
using testtttt88.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace testtttt88;

[Dependency(ReplaceServices = true)]
public class testtttt88BrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<testtttt88Resource> _localizer;

    public testtttt88BrandingProvider(IStringLocalizer<testtttt88Resource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
