using Volo.Abp.Modularity;

namespace testtttt88;

/* Inherit from this class for your domain layer tests. */
public abstract class testtttt88DomainTestBase<TStartupModule> : testtttt88TestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
