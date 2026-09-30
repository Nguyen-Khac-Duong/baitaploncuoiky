using System;
using System.Collections.Generic;
using System.Text;
using testtttt88.Localization;
using Volo.Abp.Application.Services;

namespace testtttt88;

/* Inherit your application services from this class.
 */
public abstract class testtttt88AppService : ApplicationService
{
    protected testtttt88AppService()
    {
        LocalizationResource = typeof(testtttt88Resource);
    }
}
