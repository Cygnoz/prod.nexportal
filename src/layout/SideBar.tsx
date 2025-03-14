import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../assets/icons/DashboardIcon";
import BillBizz from "../assets/logo/BillBizzLogo.png";
import { useUser } from "../context/UserContext";
import { sidebarIcons, sidebarRoutes } from "../types/rolePermissions";
import { getSidebarOptions } from "../util/getSidebarOptions";
import { useResponse } from "../context/ResponseContext";


const Sidebar = ({ setSearchValue, sidebarRef }: { setSearchValue: React.Dispatch<React.SetStateAction<string>>, sidebarRef: React.RefObject<HTMLDivElement> }) => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const {setDrawerOpen,isDrawerOpen}=useResponse()
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
    <>
       <aside
      ref={sidebarRef} // Pass the ref to the sidebar
      className="sidebar max-lg:hidden bg-[#21282C] min-h-screen overflow-y-auto hide-scrollbar w-[13%]   pb-2"
    >
      <div className="flex p-5 items-center gap-3">
        <img src={BillBizz} alt="billbizz logo" className="w-6" />
        <h1 className="text-secondary">NEX PORTAL</h1>
      </div>

      <Link onClick={() => setSearchValue("")} to="/dashboard">
        <div className="mt-4 pl-1">
          <div
            className={`min-w-[150px] me-1 px-3 py-2 rounded-3xl items-center flex gap-3 ${isActiveRoute('/dashboard') ? 'bg-[#384A55] active' : ''
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
                      className={`text-secondary text-sm my-2 cursor-pointer -ml-3 min-w-[150px] me-1 font-medium px-3 py-2 rounded-3xl items-center flex ${isActiveRoute(route) || (route.startsWith("/settings") && isSettingsRoute) ? 'bg-[#384A55] active' :
                          isActiveRoute(route) || (route.startsWith("/cms") && isCMSRoute) ? 'bg-[#384A55] active' :

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

    <div>
      

      {/* Sidebar Drawer */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 -left-1 h-full bg-[#21282C] min-h-screen overflow-y-auto hide-scrollbar w-[250px] pb-2 transition-transform duration-300 ease-in-out z-40 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        <p onClick={()=>setDrawerOpen(false)} className="text-3xl text-white cursor-pointer absolute right-2 top-2">&times;</p>
        <div className="flex p-5 items-center gap-3">
          <img src={BillBizz} alt="billbizz logo" className="w-6" />
          <h1 className="text-secondary">NEX PORTAL</h1>
        </div>

        <Link onClick={() => 
        {
          setSearchValue("")
          setDrawerOpen(false);
        }

        } to="/dashboard">
          <div className="mt-4 pl-1">
            <div
              className={`min-w-[150px] me-1 px-3 py-2 rounded-3xl items-center flex gap-3 ${
                isActiveRoute("/dashboard") ? "bg-[#384A55] active" : ""
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
              <div key={category} className="sidebar-category pl-4 z-40" >
                <h3 className="text-[#d8cab6] text-xs mb-2 mt-3 cursor-default">{category}</h3>
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
                          setDrawerOpen(false); // Close drawer on click
                        }}
                        className={`text-secondary text-sm my-2 cursor-pointer -ml-3 min-w-[150px] me-1 font-medium px-3 py-2 rounded-3xl items-center flex ${
                          isActiveRoute(route) ||
                          (route.startsWith("/settings") && isSettingsRoute) ||
                          (route.startsWith("/cms") && isCMSRoute)
                            ? "bg-[#384A55] active"
                            : ""
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

      {/* Overlay (optional, click to close sidebar) */}
      {isDrawerOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}
    </div>
    </>
  );
};

export default Sidebar;
