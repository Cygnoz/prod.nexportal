import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
type Props = {}
import LetsIconPen from "../../assets/icons/LetsIconPen";
import HugeIcons from "../../assets/icons/HugeIcons";
import MingCute from "../../assets/icons/MingCute";
import PrivacyIcon from "../../assets/icons/PrivacyIcon";
import SecurityIcon from "../../assets/icons/SecurityIcon";
import EventIcon from "../../assets/icons/EventIcon";
import Menu from "../../assets/icons/Menu";

function CMSHome({ }: Props) {

  const initialSidebarList = [
    {
      name: "Blog",
      path: "/cms/blogs/posts",
      icon: <LetsIconPen />,
      subhead: [
        { subName: "Posts", subPath: "/cms/blogs/posts" },
        { subName: "Categories", subPath: "/cms/blogs/categories" },
      ],
    },
    {
      name: "News",
      path: "/cms/news/posts",
      icon: <HugeIcons />,
      subhead: [
        { subName: "Posts", subPath: "/cms/news/posts" },
        { subName: "Categories", subPath: "/cms/news/categories" },
      ],
    },
    {
      name: "Events",
      path: "/cms/events",
      icon: <EventIcon />,
      subhead: [
        { subName: "Posts", subPath: "/cms/events" },
        { subName: "Categories", subPath: "/cms/events/categories" },
      ],
    },
    {
      name: "Knowledge Base",
      path: "cms/knowledge/categories",
      icon: <LetsIconPen />,
      subhead: [
        { subName: "Categories", subPath: "/cms/knowledge/categories" },
        { subName: "Sub Categories", subPath: "/cms/knowledge/subcategories" },
        { subName: "Articles", subPath: "/cms/knowledge/articles" },
      ],
    },
    {
      name: "Terms & Condition",
      path: "/cms/terms",
      icon: <HugeIcons />,
      subhead: []
    },
    {
      name: "Notification",
      path: "/cms/notification",
      icon: <MingCute />,
      subhead: []
    },
    {
      name: "Legal Privacy",
      path: "/cms/legalprivacy",
      icon: <PrivacyIcon />,
      subhead: []
    },
    {
      name: "Security",
      path: "/cms/security",
      icon: <SecurityIcon />,
      subhead: []
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue] = useState<string>("");
  const [filteredSidebar, setFilteredSidebar] = useState(initialSidebarList);
  const [currentPage, setCurrentPage] = useState(location.pathname);

  // Mobile responsiveness: toggling the sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Update filtered sidebar based on search value
  useEffect(() => {
    setFilteredSidebar(
      initialSidebarList.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue]);

  // Update route and highlight tab
  const handleSideBarTab = (path: string) => {
    setCurrentPage(path);
    navigate(path);
    setIsSidebarVisible(false); // Close the sidebar after navigating
  };

  const handleSubSideBarTab = (path: string) => {
    setCurrentPage(path);
    navigate(path);
    setIsSidebarVisible(false); // Close the sidebar after navigating
  };

  // Effect to update currentPage when location changes
  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  // Detect screen width (for mobile responsiveness)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true); // Show sidebar by default on larger screens
      } else {
        setIsSidebarVisible(false); // Hide sidebar on mobile
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on initial load

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    
    <div className="overflow-y-auto scroll-smooth hide-scrollbar">
      <div onClick={handleMenuClick} className="flex items-center ">
        {/* Mobile Menu Icon */}
        <Menu size={24} />
      </div>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="w-64 rounded-xl p-5 my-4 ms-5 border-r bg-[#FFFFFF] max-h-[90vh]">
          {filteredSidebar.length > 0 ? (
            filteredSidebar.map((item) => (
              <div key={item.path} className="mb-2">
                {/* Main Head */}
                <p
                  onClick={() => handleSideBarTab(item.path)}
                  className={`p-2 text-[14px] font-semibold cursor-pointer text-[#820000] flex gap-2 `}
                >
                  <span className="pt-0.5">{item.icon}</span>
                  {item.name}
                </p>

                {/* Sub Heads */}
                {item.subhead.length > 0 && (
                  <div className="ml-7">
                    {item.subhead.map((sHead) => (
                      <p
                        key={sHead.subPath}
                        onClick={() => handleSubSideBarTab(sHead.subPath)}
                        className={`p-1 text-sm cursor-pointer ${currentPage === sHead.subPath
                          ? "text-[#303F58] font-semibold"
                          : "text-[#768294]"}`
                        }
                      >
                        {sHead.subName}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-red-500 text-sm font-bold text-center mt-6">
              No sidebar found!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CMSHome;
