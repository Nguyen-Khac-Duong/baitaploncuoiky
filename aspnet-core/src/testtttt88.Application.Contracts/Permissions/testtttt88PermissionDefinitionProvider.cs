using testtttt88.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace testtttt88.Permissions;

public class testtttt88PermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(testtttt88Permissions.GroupName, L("Permission:testtttt88"));

        var sanPhamPermission = myGroup.AddPermission(testtttt88Permissions.SanPhams.Default, L("Permission:SanPhams"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Create, L("Permission:SanPhams.Create"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Edit, L("Permission:SanPhams.Edit"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Delete, L("Permission:SanPhams.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<testtttt88Resource>(name);
    }
}
