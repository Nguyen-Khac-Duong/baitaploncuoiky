using testtttt88.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace testtttt88.Permissions;

public class testtttt88PermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(testtttt88Permissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(testtttt88Permissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<testtttt88Resource>(name);
    }
}
