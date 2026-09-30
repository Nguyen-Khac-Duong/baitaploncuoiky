using testtttt88.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace testtttt88.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(testtttt88EntityFrameworkCoreModule),
    typeof(testtttt88ApplicationContractsModule)
    )]
public class testtttt88DbMigratorModule : AbpModule
{
}
