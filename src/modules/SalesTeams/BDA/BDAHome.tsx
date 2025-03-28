import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import { BDAData } from "../../../Interfaces/BDA";
import AreaIcon from "../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import Licensor from "../../../assets/icons/Licensor";
import RegionIcon from "../../../assets/icons/RegionIcon";
import TrialIcon from "../../../assets/icons/TrialIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import { endPoints } from "../../../services/apiEndpoints";
import BDAForm from "./BDAForm";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";



const BDAHome = () => {
  const {regionId ,areaId }=useRegularApi()
  const { request: getAllBDA } = useApi("get", 3002);
  const [allBDA, setAllBDA] = useState<any>([]);
  const {loading,setLoading}=useResponse()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };
  const navigate = useNavigate();

  const handleView = (id: any) => {
    navigate(`/bda/${id}`);
  };

  const handleEdit = (id: any) => {
    setEditId(id);
    handleModalToggle()
  };

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaManagerIcon />,
      number: allBDA?.res?.totalBda,
      title: "Total BDA'S",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <LeadsCardIcon />,
      number: allBDA?.res?.totalLead,
      title: "Total Leads (Handled by BDA'S)",
      iconFrameColor: "#9C75D3",
      iconFrameBorderColor: "#DAC9F1",
    },
    {
      icon: <TrialIcon width={26} height={26} />,
      number:allBDA?.res?.totalTrial,
      title: "Total Trails (Handled by BDA'S)",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <Licensor />,
      number: allBDA?.res?.totalLicensors,
      title: "Total Licensers(Handled by BDA'S)",
      iconFrameColor: "#8695DD",
      iconFrameBorderColor: "#CAD1F1CC",
    },
  ];

  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "user.employeeId", label: "BDA ID" },
    { key: "userName", label: "Name" },
    { key: "loginEmail", label: "Email Address" },
    { key: "user.phoneNo", label: "Phone No" },
    { key: "regionName", label: "Region" },
    { key: "areaName", label: "Area" },
    { key: "dateOfJoining", label: "Date of joining" },
    { key: "status", label: "Status" },
  ];

  const getBDAs = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllBDA(endPoints.BDA);
      if (response && !error) {
        console.log("res",response.data);
        const {bda,...res}=response.data
        const transformedBDA =
          response.data.bda?.map((bda:any) => ({
            ...bda,
            dateOfJoining: bda.dateOfJoining
              ? new Date(bda.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A",
            loginEmail:bda.user?.email,
            userName:bda?.user?.userName,
            userImage:bda?.user?.userImage,
            regionName:bda?.region?.regionName,
            areaName:bda?.area?.areaName
          })) || [];
          const bdaData={transformedBDA,res}
        setAllBDA(bdaData);
        
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
    getBDAs();
  }, []);

  useEffect(()=>{
    if(!isModalOpen){
      getBDAs();
    }
  },[isModalOpen])
  
  const name = "Name";
        const email = "Email";
        const region = "Region";
        const area ="Area";
      
        const handleFilter = ({ options }: { options: string }) => {
          const sortedAms =
            [...allBDA.transformedBDA].sort((a, b) => {
              if (options === "Name") {
                return a?.userName?.localeCompare(b?.userName);
              } else if (options === "Region") {
                return a?.regionName?.localeCompare(b?.regionName);
              } else if (options === "Email") {
                return a?.loginEmail?.localeCompare(b?.loginEmail);
              } else if (options === "Area") {
                return a?.areaName?.localeCompare(b?.areaName);
              }
              return 0;
            });
        
          // Update only the transformedBDA property
          setAllBDA((prev:any) => ({
            ...prev,
            transformedBDA: sortedAms,
          }));
        };
        
  
  return (
    <>
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">BDA</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          Identifies opportunities and builds relationships to drive business growth. 
            </p>
         </div>
        <Button variant="primary" size="sm" onClick={()=>{
          handleModalToggle()
          setEditId('')
        }}>
          <span className="font-bold text-xl">+</span> Create BDA
        </Button>
      </div>

     <div className="space-y-4">
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
        <Table<BDAData>
          data={allBDA?.transformedBDA===undefined?[]:allBDA?.transformedBDA}
          columns={columns}
          headerContents={{
            // title:'Region',
            search: {
              placeholder:
                "Search BDA....",
            },
            sort: [
              {
                sortHead: "Filter",
                sortList: [
                  { label: "Sort by Name", icon: <UserIcon size={14} color="#4B5C79"/>, action: () => handleFilter({ options: name }), },
                  { label: "Sort by Region", icon: <RegionIcon size={14} color="#4B5C79"/>, action: () => handleFilter({ options: region }), },
                  { label: "Sort by Area", icon: <AreaIcon size={14} color="#4B5C79"/>, action: () => handleFilter({ options: area }), },
                  { label: "Sort by Email", icon: <EmailIcon size={14} color="#4B5C79"/>, action: () => handleFilter({ options: email }), }
                ]
              },
            ],
          }}
          actionList={[
            { label: "view", function: handleView },
            { label: "edit", function: handleEdit },
          ]}
          loading={loading}
        />
      </div>
     </div>

      {/* Modal Section */}
      
    </div>
    <Modal open={isModalOpen} onClose={handleModalToggle} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]   max-sm:overflow-auto">
    <BDAForm editId={editId} regionId={regionId} areaId={areaId} onClose={handleModalToggle} />
  </Modal>
  </>
  );
};

export default BDAHome;
