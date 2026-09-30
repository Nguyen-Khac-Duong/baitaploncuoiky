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
}
