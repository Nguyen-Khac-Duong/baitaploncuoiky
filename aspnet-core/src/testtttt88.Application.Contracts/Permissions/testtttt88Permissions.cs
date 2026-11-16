namespace testtttt88.Permissions;

public static class testtttt88Permissions
{
    public const string GroupName = "testtttt88";

    // Quản lý quyền cho SanPham
    public static class SanPhams
    {
        public const string Default = GroupName + ".SanPhams";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    // Quản lý quyền cho DonHang
    public static class DonHangs
    {
        public const string Default = GroupName + ".DonHangs";
        public const string Create = Default + ".Create";
        public const string EditStatus = Default + ".EditStatus";
        public const string Delete = Default + ".Delete";
    }

    // Quản lý quyền cho Gian Hàng (CuaHang)
    public static class CuaHangs
    {
        public const string Default = GroupName + ".CuaHangs";
        public const string Manage = Default + ".Manage";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Approve = Default + ".Approve";
    }

    // Quản lý quyền cho Ví Gian Hàng & Quyết toán (ViCuaHang)
    public static class ViCuaHangs
    {
        public const string Default = GroupName + ".ViCuaHangs";
        public const string Manage = Default + ".Manage";
        public const string Payout = Default + ".Payout";
        public const string ApprovePayout = Default + ".ApprovePayout";
    }
}
