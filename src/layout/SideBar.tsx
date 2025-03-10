import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../assets/icons/DashboardIcon";
import BillBizz from "../assets/logo/BillBizzLogo.png";
import { useUser } from "../context/UserContext";
import { sidebarIcons, sidebarRoutes } from "../types/rolePermissions";
import { getSidebarOptions } from "../util/getSidebarOptions";

const Sidebar = ({ setSearchValue, sidebarRef }: { setSearchValue: React.Dispatch<React.SetStateAction<string>>, sidebarRef: React.RefObject<HTMLDivElement> }) => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Return early if no user role
  if (!user?.role) {
    return <div>Please log in to access the sidebar.</div>;
  }

  const sidebarOptions = getSidebarOptions(user?.role);

  // Check if the current path starts with a specific route
  const isActiveRoute = (route: string) => location.pathname.startsWith(route);
  const isCMSRoute = location.pathname.startsWith("/cms");

  // Check if the current route is in settings
  const isSettingsRoute = location.pathname.startsWith("/settings");


  return (
    <aside
      ref={sidebarRef} // Pass the ref to the sidebar
      className="sidebar bg-primary min-h-screen overflow-y-auto hide-scrollbar w-[13%]   pb-2"
    >
      <div className="flex p-5 items-center gap-3">
        <img src={BillBizz} alt="billbizz logo" className="w-6" />
        <h1 className="text-secondary">NEX PORTAL</h1>
      </div>

      <Link onClick={() => setSearchValue("")} to="/dashboard">
        <div className="mt-4 pl-1">
          <div
            className={`min-w-[150px] me-1 px-3 py-2 rounded-3xl items-center flex gap-3 ${isActiveRoute('/dashboard') ? 'bg-[#5A0000] active' : ''
              }`}
          >
            <DashboardIcon />
            <h3 className="text-secondary text-sm font-medium">Dashboard</h3>
          </div>
        </div>
      </Link>

      {/* Settings Tab Styling */}

      {sidebarOptions &&
        Object.entries(sidebarOptions).map(([category, options]) =>
          options.length > 0 ? (
            <div key={category} className="sidebar-category pl-4">
              <h3 className="text-[#d8cab6] text-xs mb-2 mt-3 cursor-default">
                {category}
              </h3>
              <ul>
                {options.map((option) => {
                  const Icon = sidebarIcons[option];
                  const route = sidebarRoutes[option];
                  return (
                    <li
                      key={option}
                      onClick={() => {
                        navigate(route);
                        setSearchValue("");
                      }}
                      className={`text-secondary text-sm my-2 cursor-pointer -ml-3 min-w-[150px] me-1 font-medium px-3 py-2 rounded-3xl items-center flex ${isActiveRoute(route) || (route.startsWith("/settings") && isSettingsRoute) ? 'bg-[#5A0000] active' :
                          isActiveRoute(route) || (route.startsWith("/cms") && isCMSRoute) ? 'bg-[#5A0000] active' :

                            ''
                        }`}
                    >
                      <div className="flex gap-3 items-center">
                        <Icon />
                        <p>{option}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null
        )}

    </aside>
  );
};

export default Sidebar;
