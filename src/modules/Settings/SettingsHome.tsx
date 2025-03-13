import { FC, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Chevronleft from "../../assets/icons/Chevronleft";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";

// Custom hook to check for screen size
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

interface SettingsHomeProps {
  initialSidebarList?: { name: string; path: string }[];
  setHeaderSearchValue?: any;
}

const SettingsHome: FC<SettingsHomeProps> = ({
  initialSidebarList = [
    { name: "User", path: "/settings/users" },
    { name: "UserLog", path: "/settings/user-log" },
    { name: "Business Card", path: "/settings/business-card" },
    { name: "Worker Commission", path: "/settings/worker-commission" },
  ],
  setHeaderSearchValue,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredSidebar, setFilteredSidebar] = useState(initialSidebarList);
  const [currentPage, setCurrentPage] = useState(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const isMobile = useMediaQuery("(max-width: 1024px)"); // Media query for small/medium screens

  const handleBack = () => navigate(-1);

  useEffect(() => {
    setFilteredSidebar(
      initialSidebarList.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue, initialSidebarList]);

  const handleSideBarTab = (path: string) => {
    setHeaderSearchValue && setHeaderSearchValue("");
    setCurrentPage(path);
    navigate(path);

    if (isMobile) {
      setIsSidebarOpen(false); // Only close sidebar on mobile/tablet
    }
  };

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  return (
    <div className="pb-12 flex h-full text-[#303F58]">
      {/* Sidebar */}
      <div
        className={`bg-white fixed p-6 overflow-y-auto hide-scrollbar transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-60 sm:w-40 w-48 h-screen z-50`}
      >
        <div className="mb-3">
          <Button variant="tertiary" size="sm" onClick={handleBack}>
            <Chevronleft size={10} />
            <p className="text-[#565148] text-sm font-medium">Back</p>
          </Button>
        </div>
        <p className="text-lg font-bold mb-3">Settings</p>

        <div className="mb-2">
          <SearchBar
            bg="#1C1C140A"
            placeholder="Search"
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />
        </div>

        {filteredSidebar.length > 0 ? (
          filteredSidebar.map((item) => (
            <p
              key={item.path}
              onClick={() => handleSideBarTab(item.path)}
              className={`${
                currentPage === item.path ? "text-[#820000]" : "text-[#303F58]"
              } text-sm font-semibold p-2 cursor-pointer`}
            >
              {item.name}
            </p>
          ))
        ) : (
          <p className="text-red-500 text-sm font-bold text-center mt-6">
            No sidebar found!
          </p>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-[15rem] lg:ml-60 sm:ml-40" : "ml-0"
        } w-full p-5 overflow-y-auto hide-scrollbar relative`}
      >
        <div className="lg:hidden mb-4">
          <button
            className="p-2 bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsHome;
