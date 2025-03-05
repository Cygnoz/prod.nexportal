import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../assets/icons/Bell";
import Settings from "../assets/icons/Settings";
import { NavList } from "../components/list/NavLists";
import SearchBar from "../components/ui/SearchBar";
import UserModal from "./Logout/UserModal";
import { useRegularApi } from "../context/ApiContext";
import { useUser } from "../context/UserContext";
// import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { useResponse } from "../context/ResponseContext";
import useApi from "../Hooks/useApi";
import { endPoints } from "../services/apiEndpoints";

interface HeaderProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  scrollToActiveTab: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchValue,
  setSearchValue,
  scrollToActiveTab,
}) => {
  const { allTicketsCount,
    //  refreshContext 
    } = useRegularApi();
  const { user } = useUser();
  // const location=useLocation()
  const {socket,notification,setNotification}=useSocket()
  const unassignedTickets = allTicketsCount?.allUnassigned ?? 0;
  const {request:getUnused}=useApi('get',3004)
  const {unAssignedTicketCount,setUnAssignedTicketCount}=useResponse()
  const [unusedCount,setUnusedCout]=useState<number>(0)
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [filteredNavList, setFilteredNavList] = useState<any[]>([]); // Ensure it's an array
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const filtered = NavList.filter(
      (route) =>
        route.label.trim().toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredNavList(filtered);
    setFocusedIndex(-1); // Reset focus index on new search
  }, [searchValue]);

  const handleSelect = (route: any) => {
    setDropdownVisible(false);
    setSearchValue(route.key);
    navigate(`/${route.key}`);
    scrollToActiveTab();
  };

  const getUnusedTickets=async()=>{
    try{
      const {response,error}=await getUnused(`${endPoints.UNUSED_TICKETS}/${user?.id}`)
      console.log("rew",response?.data);
      
      if(response &&!error){
        setUnusedCout(response.data?.unusedTickets)
      }else{
        console.log("err",error);
        
      }
    }catch(err){
      console.log("er",err);
      
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!dropdownVisible) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex < filteredNavList.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredNavList.length - 1
        );
        break;

      case "Enter":
        if (focusedIndex >= 0) {
          handleSelect(filteredNavList[focusedIndex]);
        }
        break;

      case "Escape":
        setDropdownVisible(false);
        break;
    }
  };

  // Auto-scroll to the focused item
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedItem = dropdownRef.current.children[focusedIndex] as HTMLElement;
      if (focusedItem) {
        focusedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    // const socket = io(AGENT_SOCKET_URL, {
    //   path: "/nexsell-tickets/socket.io/",
    //   transports: ["websocket", "polling"],
    //   withCredentials: true,
    // });
    // const socket=io(AGENT_SOCKET_URL)

    // socket.on("ticketCount", (count: any) => {
    //   console.log(count);
    //   refreshContext({ tickets: true });
    // });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  useEffect(() => {
    if (!user?.id) return;
    getUnusedTickets()
    console.log("uuu", user.id);
    socket.emit("joinNotificationRoom", user.id);
  
    const handleUnreadCountUpdate = (count: number) => {
      console.log("count", count);
      setNotification(count);
    };
  
    const  handleUnAssigned = (count:any) => {
        // setNotification((prev: number) => prev + (allTick.totalTickets ?? 0));
        setUnAssignedTicketCount(count)
    };
    
    const  handleAllTicket = (count:any) => {
      // setNotification((prev: number) => prev + (allTick.totalTickets ?? 0));
      setNotification((prev: number) => prev + count.unusedTickets);
  };

    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("getAllUnAssignedTicketCount", handleUnAssigned);
    socket.on("getUnusedTicketCount", handleAllTicket);
    return () => {
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("getAllUnAssignedTicketCount",  handleUnAssigned);
      socket.off("getUnusedTicketCount", handleAllTicket);
    };
  }, [user]);
  
  console.log("notification",notification);
  
  
  return (
    <div
      className="p-4 flex items-center gap-2 w-full border-b border-b-[#DADEE5] header-container"
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-[68%]" ref={searchBarRef}>
        <SearchBar
          placeholder="Search modules"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          setDropdownVisible={setDropdownVisible}
        />
        {dropdownVisible && (
          <ul
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border max-h-96 overflow-y-auto custom-scrollbar border-gray-300 rounded shadow"
          >
            {filteredNavList.length === 0 ? (
              <li className="px-4 py-2 text-red-500 text-center font-bold">
                No module found!
              </li>
            ) : (
              filteredNavList.map((route, index) => (
                <li
                  key={route.key}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                    focusedIndex === index ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleSelect(route)}
                >
                  {route.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="flex ms-14 justify-center items-center gap-2 cursor-pointer" />
      <div className="flex items-center gap-4 ml-auto cursor-pointer">
        <div
          onClick={() => navigate("/settings/users")}
          className="tooltip"
          data-tooltip="Settings"
        >
          <p className="w-[34px] h-[34px] border border-[#E7E8EB] bg-[#FFFFFF] rounded-full flex justify-center items-center">
            <Settings color="#768294" />
          </p>
        </div>
        <div
          onClick={() => navigate("/ticket")}
          className="tooltip relative cursor-pointer"
          data-tooltip="Notification"
        >
          {user?.role === "Support Agent" && (notification > 0 ||unusedCount>0) ? (
  <div className="h-5 w-5 absolute rounded-full -top-2 bg-red-600 text-white flex items-center justify-center">
    <p className="text-xs font-semibold">{notification?notification:notification+unusedCount}</p>
  </div>
) : (user?.role === "Support Admin" ||
    user?.role === "Supervisor" ||
    user?.role === "Super Admin") &&
  (unassignedTickets > 0 || unAssignedTicketCount > 0) ? (
  <div className="h-5 w-5 absolute rounded-full -top-2 bg-red-600 text-white flex items-center justify-center">
    <p className="text-xs font-semibold">
      {unAssignedTicketCount ? unAssignedTicketCount : unassignedTickets}
    </p>
  </div>
) : null}

          <p className="w-[34px] h-[34px] border border-[#E7E8EB] bg-[#FFFFFF] rounded-full flex justify-center items-center">
            <Bell />
          </p>
        </div>
        <UserModal />
      </div>
    </div>
  );
};

export default Header;
