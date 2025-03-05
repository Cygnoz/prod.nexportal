import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import { SVData } from "../../../Interfaces/SV";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import EscalatedTicket from "../../../assets/icons/EscalatedTicket";
import RegionIcon from "../../../assets/icons/RegionIcon";
import ResolvedTicket from "../../../assets/icons/ResolvedTicket";
import TicketCardIcon from "../../../assets/icons/TicketCardIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import AddSupervisor from "./SupervisorForm";
import { useResponse } from "../../../context/ResponseContext";


const SupervisorHome = () => {
 
  const {totalCounts,refreshContext}=useRegularApi()
  const { request: getAllSV } = useApi("get", 3003);
  const [allSV, setAllSV] = useState<any[]>([]);
  const {loading,setLoading}=useResponse()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [editId, setEditId] = useState('');

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleView = (id: any) => {
    navigate(`/supervisor/${id}`);
  };

  const handleEdit = (id: any) => {
    setEditId(id);
    handleModalToggle()
  };

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaManagerIcon />,
      number: totalCounts?.totalSupervisors,
      title: "Total Supervisors",
      iconFrameColor: "#F9A51A",
      iconFrameBorderColor: "#FFF2DDCC",
    },
    {
      icon: <UserIcon />,
      number:totalCounts?.totalSupportAgents,
      title: "Total Support Agents",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <TicketCardIcon size={40} />,
      number: totalCounts?.totalTickets,
      title: "Total Tickets",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <EscalatedTicket />,
      number: "0",
      title: "Total Escalated Tickets",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <ResolvedTicket />,
      number: totalCounts?.resolvedTickets,
      title: "Total Resolved Tickets",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
  ];

  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "userName", label: "Name" },
    { key: "loginEmail", label: "Email Address" },
    { key: "user.phoneNo", label: "Phone No" },
    { key: "regionName", label: "Region" },
    { key: "status", label: "Status" },
  ];

  const getSVs = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllSV(endPoints.SUPER_VISOR);
      console.log(response);
      console.log(error);
      
      
      if (response && !error) {
        console.log(response);
        
        const transformedSV =
          response.data?.supervisor?.map((SV:any) => ({
            ...SV,
            dateOfJoining: SV?.dateOfJoining
              ? new Date(SV.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A",
              loginEmail: SV?.user?.email,
              userName: SV?.user?.userName,
              userImage:SV?.user?.userImage,
              regionName: SV?.region?.regionName,
          })) || [];
        setAllSV(transformedSV);
        console.log(transformedSV);
        
      } else {
        console.log(error?.response?.data?.message || "Failed to fetch data.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred.");
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getSVs();
  }, []);

  useEffect(()=>{
    if(isModalOpen){
      refreshContext({dropdown:true})
    }else{
      getSVs();
    }
  },[isModalOpen])

  const name = "Name";
  const email = "Email";
  const region = "Region";

  const handleFilter = ({ options }: { options: string }) => {
    if (options === "Name") {
      // Create a new sorted array to avoid mutating the original state
      const sortedSvs = [...allSV].sort((a, b) =>
        b?.userName?.localeCompare(a?.userName)
      );
      setAllSV(sortedSvs);
    } else if (options === "Region") {
      const sortedSvs = [...allSV].sort((a, b) =>
        b?.regionName?.localeCompare(a?.regionName)
      );
      setAllSV(sortedSvs);
    } else {
      const sortedSvs = [...allSV].sort((a, b) =>
        b?.loginEmail?.localeCompare(a?.loginEmail)
      );
      setAllSV(sortedSvs);
    }
  };

  return (
    <>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">Supervisor</h1>
          <p className="text-ashGray text-sm">
          Oversees team performance and ensures smooth operations.
            </p>
         </div>
        <Button variant="primary" size="sm" onClick={()=>{
          handleModalToggle()
          setEditId('')
        }}>
          <span className="font-bold text-xl">+</span> Create Supervisor
        </Button>
      </div>

      {/* HomeCards Section */}
      <div className="flex gap-3 py-2 justify-between mt-6">
        {homeCardData.map((card, index) => (
          <HomeCard
            iconFrameColor={card.iconFrameColor}
            iconFrameBorderColor={card.iconFrameBorderColor}
            key={index}
            icon={card.icon}
            number={card.number}
            title={card.title}
          />
        ))}
      </div>

      {/* Table Section */}
      <div>
        <Table<SVData>
          data={allSV}
          columns={columns}
          headerContents={{
            title: "Supervisor Overview",
            search: { placeholder: "Search Supervisor..." },
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
                    label: "Sort by Region",
                    icon: <RegionIcon size={14} color="#4B5C79" />,
                    action: () => handleFilter({ options: region }),
                  },
                  {
                    label: "Sort by Email",
                    icon: <EmailIcon size={14} color="#4B5C79" />,
                    action: () => handleFilter({ options: email }),
                  },
                ],
              },
            ],
          }}
          actionList={[
            { label: "edit", function: handleEdit },
            { label: "view", function: handleView },
          ]}
          loading={loading}
        />
      </div>

    
    </div>
      {/* Modal Section */}
      <Modal open={isModalOpen} onClose={handleModalToggle}>
        <AddSupervisor editId={editId} onClose={handleModalToggle} />
      </Modal>
    </>
  );
};

export default SupervisorHome;
