import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./SideBar";
import SettingsSidebar from "../modules/Settings/SettingsHome"; // New Sidebar for settings
import { Outlet, useLocation } from "react-router-dom";
import CMSHome from "../modules/CMS/CMSHome";
import billbizFrame from '../assets/image/billbizzframeCms.png'
import billbizlogo from '../assets/icons/BillBizzIcon.tsx.svg'
import SewnexFrame from '../assets/image/SewnexFramme.png'
import SalonexFrame from '../assets/image/SalonexFrame.png'
import SixNexFrame from '../assets/image/sixNexdframe.png'
import SixNexlogo from '../assets/icons/SixNexDIcon.svg'
import CmsProductDropDown from "../modules/CMS/CmsProductDropDown";
import { useResponse } from "../context/ResponseContext";
import SewnexIcon from "../assets/icons/SewnexIcon";
import SalonexIcon from "../assets/icons/SalonexIcon";
 

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
   // Fixed variable name
  const {cmsMenu}=useResponse()
  // This function handles setting the data from the child component
  


  return (
    <div className="flex h-screen relative text-[#303F58]">
      {/* Sidebar */}

      {cmsMenu. IsCMSMenuOpen&&<p className="absolute bottom-[230px] left-56">
      <CmsProductDropDown />
      </p>}
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
            {/* <div className="ms-5">            <CardDropDown setSelectData={handleSelectData} />            </div> */}
            {
              cmsMenu.selectedData === "BillBizz" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${billbizFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">Billbizz Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <img src={billbizlogo} className="w-14" alt="" />
                  </div>
                </div>
              ) : cmsMenu.selectedData === "SewNex" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${SewnexFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">Sewnex Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <SewnexIcon />
                  </div>
                </div>

              ) : cmsMenu.selectedData === "SaloNex" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${SalonexFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">Salonex Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <SalonexIcon/>
                  </div>
                </div>
              ) : cmsMenu.selectedData === "6NexD" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${SixNexFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">6Nexd Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <img src={SixNexlogo} className="w-14" alt="" />
                  </div>
                </div>
              ) : null
            }


            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar on the left */}

                <CMSHome />
            

              {/* Main content on the right */}
              <div className="flex-1 overflow-y-auto hide-scrollbar px-6 max-lg:px-3 pt-4 max-lg:pt-2">
                <Outlet />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4 max-lg:px-3 max-lg:pt-2">
            {!isSettingsRoute && <Outlet />}
          </div>
        )}
      </div>

    </div>
  );
};

export default Layout;
