using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(PSW.Startup))]
namespace PSW
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
            ConfigureAuth(app);
        }
    }
}