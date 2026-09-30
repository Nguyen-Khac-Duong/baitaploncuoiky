using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using testtttt88.Data;
using Volo.Abp.DependencyInjection;

namespace testtttt88.EntityFrameworkCore;

public class EntityFrameworkCoretesttttt88DbSchemaMigrator
    : Itesttttt88DbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoretesttttt88DbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the testtttt88DbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<testtttt88DbContext>()
            .Database
            .MigrateAsync();
    }
}
