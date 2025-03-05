import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./SideBar";
import SettingsSidebar from "../modules/Settings/SettingsHome"; // New Sidebar for settings
import { Outlet, useLocation } from "react-router-dom";
import CMSHome from "../modules/CMS/CMSHome";

const Layout = () => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState<string>("");
  const sidebarRef: any = useRef<HTMLDivElement>(null);

  const scrollToActiveTab = () => {
    if (sidebarRef.current) {
      const activeTab = sidebarRef.current.querySelector(".active");
      if (activeTab) {
        sidebarRef.current.scrollTop =
          activeTab.offsetTop - 100 - sidebarRef.current.offsetTop;
      }
    }
  };

  useEffect(() => {
    scrollToActiveTab();
  }, [location]);

  // Check if current route starts with "/settings"
  const isSettingsRoute = location.pathname.startsWith("/settings");
  const isCMSRoute = location.pathname.startsWith("/cms");

  return (
    <div className="flex h-screen text-[#303F58]">
      {/* Sidebar */}


      <Sidebar sidebarRef={sidebarRef} setSearchValue={setSearchValue} />

      {/* Main Content (Header + Outlet) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          scrollToActiveTab={scrollToActiveTab}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />

        {isSettingsRoute && (
          <SettingsSidebar setHeaderSearchValue={setSearchValue} />
        )}

        {isCMSRoute ? (
          <>
            <h1 className="text-[#303F58] text-xl font-bold px-3 m-2">Content Management System</h1>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar on the left */}

              <div className="w-64 rounded-xl p-5 my-4 ms-5 border-r bg-[#FFFFFF]">
                <CMSHome />
              </div>

              {/* Main content on the right */}
              <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4">
                <Outlet />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4">
            {!isSettingsRoute && <Outlet />}
          </div>
        )}
      </div>

    </div>
  );
};

export default Layout;
