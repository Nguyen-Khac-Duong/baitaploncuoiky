using testtttt88.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace testtttt88.Permissions;

public class testtttt88PermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(testtttt88Permissions.GroupName, L("Permission:testtttt88"));

        // SanPhams
        var sanPhamPermission = myGroup.AddPermission(testtttt88Permissions.SanPhams.Default, L("Permission:SanPhams"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Create, L("Permission:SanPhams.Create"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Edit, L("Permission:SanPhams.Edit"));
        sanPhamPermission.AddChild(testtttt88Permissions.SanPhams.Delete, L("Permission:SanPhams.Delete"));

        // DonHangs
        var donHangPermission = myGroup.AddPermission(testtttt88Permissions.DonHangs.Default, L("Permission:DonHangs"));
        donHangPermission.AddChild(testtttt88Permissions.DonHangs.Create, L("Permission:DonHangs.Create"));
        donHangPermission.AddChild(testtttt88Permissions.DonHangs.EditStatus, L("Permission:DonHangs.EditStatus"));
        donHangPermission.AddChild(testtttt88Permissions.DonHangs.Delete, L("Permission:DonHangs.Delete"));

        // CuaHangs
        var cuaHangPermission = myGroup.AddPermission(testtttt88Permissions.CuaHangs.Default, L("Permission:CuaHangs"));
        cuaHangPermission.AddChild(testtttt88Permissions.CuaHangs.Manage, L("Permission:CuaHangs.Manage"));
        cuaHangPermission.AddChild(testtttt88Permissions.CuaHangs.Create, L("Permission:CuaHangs.Create"));
        cuaHangPermission.AddChild(testtttt88Permissions.CuaHangs.Edit, L("Permission:CuaHangs.Edit"));
        cuaHangPermission.AddChild(testtttt88Permissions.CuaHangs.Delete, L("Permission:CuaHangs.Delete"));
        cuaHangPermission.AddChild(testtttt88Permissions.CuaHangs.Approve, L("Permission:CuaHangs.Approve"));

        // ViCuaHangs
        var viCuaHangPermission = myGroup.AddPermission(testtttt88Permissions.ViCuaHangs.Default, L("Permission:ViCuaHangs"));
        viCuaHangPermission.AddChild(testtttt88Permissions.ViCuaHangs.Manage, L("Permission:ViCuaHangs.Manage"));
        viCuaHangPermission.AddChild(testtttt88Permissions.ViCuaHangs.Payout, L("Permission:ViCuaHangs.Payout"));
        viCuaHangPermission.AddChild(testtttt88Permissions.ViCuaHangs.ApprovePayout, L("Permission:ViCuaHangs.ApprovePayout"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<testtttt88Resource>(name);
    }
}
