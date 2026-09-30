using Volo.Abp.Modularity;

namespace testtttt88;

[DependsOn(
    typeof(testtttt88ApplicationModule),
    typeof(testtttt88DomainTestModule)
)]
public class testtttt88ApplicationTestModule : AbpModule
{

}
