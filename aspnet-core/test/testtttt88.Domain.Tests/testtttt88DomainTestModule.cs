using Volo.Abp.Modularity;

namespace testtttt88;

[DependsOn(
    typeof(testtttt88DomainModule),
    typeof(testtttt88TestBaseModule)
)]
public class testtttt88DomainTestModule : AbpModule
{

}
