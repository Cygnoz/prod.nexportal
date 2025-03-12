import Button from "../../../components/ui/Button";
import { useEffect, useRef, useState } from "react";
import useApi from "../../../Hooks/useApi";
import Input from "../../../components/form/Input";
import { endPoints } from "../../../services/apiEndpoints";

import toast from "react-hot-toast";
import { achievements, themes } from "../../../Interfaces/Praise";
import { useResponse } from "../../../context/ResponseContext";


type Props = {
  onClose: () => void;
}


const PraiseForm = ({ onClose }: Props) => {

  const { request: getUsers } = useApi('get', 3002)
  const { request: addPraise } = useApi('post', 3004)
  // const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [prise, setPrise] = useState({
    usersId: "", achievement: "", theme: "", notes: "",
  })

  const [allUsers, setAllUsers] = useState<any>([]);


  const getAllUsers = async () => {
    const url = endPoints.GET_USERS
    try {
      const { response, error } = await getUsers(url)
      console.log(response)
      console.log(error)
      if (response && !error) {


        // setAllUsers(response.data.AllUsers);
        setAllUsers(response.data.AllUsers);
      } else {
        console.log(error)
      }

    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  // console.log(allUsers);
  console.log(prise);


  const [selectedTheme, setSelectedTheme] = useState<any | null>(0);
const {setPostLoading}=useResponse()
  const handleThemeSelect = (index: number) => {
    setSelectedTheme(index);
    setPrise((prevState) => ({
      ...prevState,
      theme: themes[index].name,
    }));
  };

  const [selectBg, setSelectedBg] = useState<any | null>(0)

  const handleBgSelect = (index: number) => {
    setSelectedBg(index);
    setPrise((prevState) => ({
      ...prevState,
      achievement: achievements[index].name,
    }));
  };
  const validateForm = () => {
    if (!prise.usersId) {
      toast.error("Please select a user.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      setPostLoading(true)
      const { response, error } = await addPraise(endPoints.PRAISE, prise);

      if (response && !error) {
        toast.success(response.data.message);
        onClose();

      } else {
        toast.error(error.response?.data?.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error submitting data:", err);
      toast.error("An unexpected error occurred.");
    }
    finally{
      setPostLoading(false)
    }
  };



  // const ribbonBg = comfetti;


  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchValue = search.toLowerCase();

    const sortedUsers = allUsers
      .filter((user: any) =>
        user.userName.toLowerCase().includes(searchValue)
      )
      .sort((a: any, b: any) => {
        const aStartsWith = a.userName.toLowerCase().startsWith(searchValue);
        const bStartsWith = b.userName.toLowerCase().startsWith(searchValue);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.userName.localeCompare(b.userName);
      });

    setFilteredUsers(sortedUsers);
  }, [search, allUsers]);



  return (
    <div>
      <div className="p-8 bg-white rounded-2xl border border-[#E7E7ED]">
  <div>
    <div className="flex justify-between">
      <div className="space-y-2">
        <h3 className="text-[#303F58] font-bold text-lg">Send Praise</h3>
      </div>
      <p onClick={onClose} className="text-3xl cursor-pointer">&times;</p>
    </div>
    <p className="text-sm sm:text-base">To</p>
    <div className="relative" ref={dropdownRef}>
      {/* Input Field */}
      <Input
        className="w-full sm:w-[672px] h-[40px] px-3 my-2 border border-gray-300 rounded-lg"
        type="text"
        placeholder="Search by name..."
        value={search}
        onFocus={() => setShowDropdown(true)}
        onChange={(event) => setSearch(event.target.value)}
        style={{ appearance: "none" }}
        required
      />
      {/* Role Display */}
      {selectedUser && <p className="text-gray-600 mt-1 text-sm sm:text-base">Role: {selectedUser.role}</p>}
      {/* Custom Dropdown */}
      {showDropdown && (
        <div
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md max-h-[200px] overflow-y-auto z-10 custom-scrollbar"
          style={{ width: "100%" }}
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: any) => (
              <div
                key={user._id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setSearch(user.userName);
                  setSelectedUser(user); // Set the selected user
                  setPrise((prevData: any) => ({
                    ...prevData,
                    usersId: user._id,
                    role: user.role,
                  }));
                  setShowDropdown(false);
                }}
              >
                {user.userName} ({user.role})
              </div>
            ))
          ) : (
            <div className="px-3 text-center text-red-500 font-bold py-5">
              No Users Found
            </div>
          )}
        </div>
      )}
    </div>
  </div>

  <div className="flex flex-wrap gap-4 mt-6 cursor-pointer">
    {achievements.map((achievement, index) => (
      <div
        key={index}
        onClick={() => handleBgSelect(index)}
        className={`${selectBg === index ? "border-2 border-blue-500" : "border border-gray-300"} 
        bg-[#F3F3F3] rounded-2xl w-fit h-11 p-3 flex gap-2 items-center`}
      >
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gradient-to-r from-[#EDE7FB] to-[#B5DBDB]">
          {achievement.icon}
        </div>
        <p className="text-[#495160] text-xs font-normal">{achievement.name}</p>
      </div>
    ))}
  </div>

  <p className="my-3 text-sm sm:text-base">Select Background</p>

  <div className="flex  mb-6 gap-2 flex-wrap cursor-pointer">
    {themes.map((item, index) => (
      <div
        key={index}
        onClick={() => handleThemeSelect(index)}
        className={`${selectedTheme === index ? "border-2 border-blue-500" : "border border-gray-300"} 
        ${item.bgColor} rounded-2xl w-36 h-12 p-3 flex gap-2 justify-center items-center`}
      >
        <p className="text-center text-[#495160] text-xs font-normal">{item.name}</p>
      </div>
    ))}
  </div>

  <div className="bg-[#F3F3F3] border border-[#EAECF0] rounded-2xl p-6">
    <p className="gap-2 my-2 text-sm sm:text-base">Add Notes</p>
    <div className="bg-[#FFFFFFA1] rounded-lg">
      <textarea
        onChange={(e) => setPrise((prevData: any) => ({
          ...prevData,
          notes: e.target.value,
        }))}
        className="w-full min-h-28 rounded-lg outline-none p-3 text-[#2C3E50A3] text-xs sm:text-sm font-normal"
        name=""
        id=""
      />
    </div>
  </div>

  <div className="w-full bg-white flex justify-end gap-2 mt-4">
    <Button variant="tertiary" onClick={onClose} className="h-8 text-sm sm:text-base border rounded-lg" size="lg">
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmit} className="h-8 text-sm sm:text-base border rounded-lg" size="lg">
      Send
    </Button>
  </div>
</div>

    </div >
  )
}

export default PraiseForm