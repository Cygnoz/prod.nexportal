import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import { SAData } from "../../../Interfaces/SA";
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
// import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import SupportAgentForm from "./SupportAgentForm";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";



  
const SupportAgentHome = () => {
  const {regionId  }=useRegularApi()
  const {loading,setLoading}=useResponse()
  const { request: getAllSA } = useApi("get", 3003);
  const [allSA, setAllSA] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [editId, setEditId] = useState('');

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleView = (id: any) => {
    navigate(`/support-agent/${id}`);
  };

  const handleEdit = (id: any) => {
    setEditId(id);
    handleModalToggle()
  };

  const [totalCounts, setTotalCounts] = useState({
    totalSupportAgents: 0,
    totalTickets: 0,
    totalResolvedTickets: 0,
    totalEscalatedTickets: 0, // Assuming escalated tickets can also be included if data is available
  });
  
  const getSAs = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllSA(endPoints.SUPPORT_AGENT);
      console.log("res", response);
      console.log("err", error);
      if (response && !error) {
        console.log(response);
  
        // Transform support agents
        const transformedSA =
          response.data?.supportAgent?.map((SA: any) => ({
            ...SA,
            dateOfJoining: SA.dateOfJoining
              ? new Date(SA.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A",
            loginEmail: SA?.user?.email,
            userName: SA?.user?.userName,
            userImage: SA?.user?.userImage,
            regionName: SA?.region?.regionName,
          })) || [];
        setAllSA(transformedSA);
  
        // Set total counts
        setTotalCounts({
          totalSupportAgents: response.data.totalSupportAgent || 0,
          totalTickets: response.data.totalTickets || 0,
          totalResolvedTickets: response.data.resolvedTickets || 0,
          totalEscalatedTickets: response.data.escalatedTickets || 0, // Adjust if your API includes this data
        });
  
        console.log(transformedSA);
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
    getSAs();
  }, []);

  useEffect(()=>{
    if(!isModalOpen){
      getSAs();
    }
  },[isModalOpen])
  
  // Updated homeCardData with dynamic values
  const homeCardData = [
    {
      icon: <UserIcon />,
      number: totalCounts?.totalSupportAgents,
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
      number: totalCounts?.totalEscalatedTickets,
      title: "Total Escalated Tickets",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <ResolvedTicket />,
      number: totalCounts?.totalResolvedTickets,
      title: "Total Resolved Tickets",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
  ];
  
  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "user.userName", label: "Name" },
    { key: "loginEmail", label: "Email Address" },
    { key: "user.phoneNo", label: "Phone No" },
    { key: "region.regionName", label: "Region" },
    { key: "status", label: "Status" },
  ];

  const name = "Name";
  const email = "Email";
  const region = "Region";

  const handleFilter = ({ options }: { options: string }) => {
    if (options === "Name") {
      // Create a new sorted array to avoid mutating the original state
      const sortedSAs = [...allSA].sort((a, b) =>
        b?.userName?.localeCompare(a?.userName)
      );
      setAllSA(sortedSAs);
    } else if (options === "Region") {
      const sortedSAs = [...allSA].sort((a, b) =>
        b?.regionName?.localeCompare(a?.regionName)
      );
      setAllSA(sortedSAs);
    } else {
      const sortedSAs = [...allSA].sort((a, b) =>
        b?.loginEmail?.localeCompare(a?.loginEmail)
      );
      setAllSA(sortedSAs)
    }
  };

  return (
    <>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">Support Agent</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          Assists customers by resolving inquiries and providing solutions.
            </p>
         </div>
        <Button variant="primary" size="sm" onClick={()=>{
          handleModalToggle()
          setEditId('')
        }}>
        <span className="font-bold text-xl">+</span> Create Support Agent
        </Button>
      </div>

      {/* HomeCards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 mt-2">
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
        <Table<SAData> data={allSA} columns={columns} headerContents={{
          title:'Support Agent Overview',
          search:{placeholder:'Search Support Agent...'},
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
                }
          ]
        }}
        actionList={[
          { label: 'edit', function:handleEdit },
          { label: 'view', function:handleView },
        ]}  
        loading={loading}
        />
      </div>

      {/* Modal Section */}
     
    </div>
     <Modal open={isModalOpen} onClose={handleModalToggle} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]   max-sm:overflow-auto">
     <SupportAgentForm  editId={editId}  regionId={regionId} onClose={handleModalToggle} />
   </Modal>
    </>
  )
}

export default SupportAgentHome;