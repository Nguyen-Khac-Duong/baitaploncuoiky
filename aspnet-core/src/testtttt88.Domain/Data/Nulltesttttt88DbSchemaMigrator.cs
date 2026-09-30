using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace testtttt88.Data;

/* This is used if database provider does't define
 * Itesttttt88DbSchemaMigrator implementation.
 */
public class Nulltesttttt88DbSchemaMigrator : Itesttttt88DbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
