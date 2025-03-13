import { useEffect, useState } from "react";
import useApi from "../../../Hooks/useApi";
import { UserData } from "../../../Interfaces/User";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { endPoints } from "../../../services/apiEndpoints";
import UserForm from "./UserForm";
import { useResponse } from "../../../context/ResponseContext";



const UserHome = () => {
  const {request:getUsers}=useApi('get',3002)
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const {loading,setLoading}=useResponse()
  const [editId,setEditId]=useState('')
  // State to manage modal visibility
 const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to toggle modal visibility
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    getAllUsers()
  };

  
  

  const handleEdit=(id:any)=>{
    setEditId(id)
     handleModalToggle()
  }

  const getAllUsers=async()=>{
    const url=endPoints.GET_USERS
    try{
      setLoading(true)
      const {response,error}=await getUsers(url)
      console.log(response)
      console.log(error)
      if(response && !error){
        // toast.success(response.data.message)
        setAllUsers(response.data.AllUsers.map((user:UserData)=>({
          ...user,
          type:(user.role=='Super Admin' ||user.role=='Sales Admin'||user.role=='Support Admin')?user.role:'User'
        })))
      }else{
        console.log(error)
      }

    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    getAllUsers()
  },[])


    // Define the columns with strict keys
    const columns: { key: keyof  UserData; label: string }[] = [
      // { key: "userImage", label: "User Image" }, 
      { key: "userName", label: "Name" },
      { key: "email", label: "Email Address" },
      { key: "phoneNo", label: "Phone No" },
      { key: "role", label: "Role" },
      { key: "type", label: "Type" },
    ];

    const name = "Name";
  const email = "Email";
  const role = "Role";

  const handleFilter = ({ options }: { options: string }) => {
    const roleOrder:any = {
      "Super Admin": 1,
      "Sales Admin": 2,
      "Support Admin": 3,
      "Region Manager": 4,
      "Area Manager": 5,
      BDA: 6,
      Supervisor: 7,
      "Support Agent": 8,
    };
    if (options === "Name") {
      // Create a new sorted array to avoid mutating the original state
      const sortedUsers = [...allUsers].sort((a, b) =>
        b?.userName?.localeCompare(a?.userName)
      );
      setAllUsers(sortedUsers);
    } else if (options === "Role") {
      // Sort based on custom Role order
      const sortedUsers = [...allUsers].sort(
        (a, b) => roleOrder[b?.role] - roleOrder[a?.role]
      );
      setAllUsers(sortedUsers);
     } else {
      const sortedUsers = [...allUsers].sort((a, b) =>
        b?.email?.localeCompare(a?.email)
      );
      setAllUsers(sortedUsers);
    }
  };

  return (
    <div>
         <div className="flex justify-between items-center">
         <div>
         <h1 className="text-[#303F58] text-xl font-bold">User</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          Manage system users and their access permissions.
            </p>
         </div>
     
      <Button variant="primary" size="sm" onClick={()=>{
        handleModalToggle()
        setEditId('')}
        }>
      <span className="text-xl font-bold">+</span> Create User
      </Button>

      {/* Modal controleed by state */}
      <Modal className="w-[40%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto" open={isModalOpen} onClose={handleModalToggle}>
      <UserForm editId={editId} onClose={handleModalToggle} />
      </Modal>
    </div>


       {/* Table Section */}
       <div className=" py-2 mt-3">
        <Table data={allUsers} columns={columns} headerContents={{
          
          search:{placeholder:'Search Users...'},
          sort: [
                {
                  sortHead: "Filter",
                  sortList: [
                    {
                      label: "Sort by Name",
                      icon: <UserIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: name }),
                    },
                    {
                      label: "Sort by Role",
                      icon: <AreaManagerIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: role }),
                    },
                    {
                      label: "Sort by Email",
                      icon: <EmailIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: email }),
                    },
                  ],
                }
          ]
        }}
        actionList={[
            { label: 'edit', function:handleEdit },
          ]}  
          loading={loading}
          />


      </div>

    </div>
   
    
  );
};

export default UserHome;
