import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./SideBar";
import SettingsSidebar from "../modules/Settings/SettingsHome"; // New Sidebar for settings
import { Outlet, useLocation } from "react-router-dom";
import CMSHome from "../modules/CMS/CMSHome";
import CardDropDown from "../modules/CMS/CardDropDown";
import billbizFrame from '../assets/image/billbizzframeCms.png'
import billbizlogo from '../assets/image/bilbizzprdLogo.png'
import SewnexFrame from '../assets/image/SewnexFramme.png'
import Sewnexlogo from '../assets/image/SewnexLogo.png'
import SalonexFrame from '../assets/image/SalonexFrame.png'
import Salonexlogo from '../assets/image/Salonexlogo.png'
import SixNexFrame from '../assets/image/sixNexdframe.png'
import SixNexlogo from '../assets/image/sixNexdLogo.png'

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
  const [selectedData, setSelectedData] = useState("BillBizz"); // Fixed variable name

  // This function handles setting the data from the child component
  const handleSelectData = (name: string) => {
    setSelectedData(name); // Or however you want to structure your data
    console.log("selectedData", selectedData);

  };


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
            <div className="ms-5">            <CardDropDown setSelectData={handleSelectData} />            </div>
            {
              selectedData === "BillBizz" ? (
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
              ) : selectedData === "Sewnex" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${SewnexFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">Sewnex Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <img src={Sewnexlogo} className="w-14" alt="" />
                  </div>
                </div>

              ) : selectedData === "Salonex" ? (
                <div className="px-7 py-8 rounded-xl m-3 flex justify-between "
                  style={{ backgroundImage: `url(${SalonexFrame})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <div>
                    <p className="text-base text-[#FFFEFB] font-semibold">Salonex Content Management System</p>
                    <p className="text-xs font-normal text-[#E4E4E4] py-2">Content management system for manage Blog, News, Events, Knowledge Base and others for Billbizz</p>
                  </div>
                  <div>
                    <img src={Salonexlogo} className="w-14" alt="" />
                  </div>
                </div>
              ) : selectedData === "6Nexd" ? (
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
