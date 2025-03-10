import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AreaIcon from "../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import Licensor from "../../../assets/icons/Licensor";
import RegionIcon from "../../../assets/icons/RegionIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
// import { useRegularApi } from "../../../context/ApiContext";
import useApi from "../../../Hooks/useApi";
import { AMData } from "../../../Interfaces/AM";
import { endPoints } from "../../../services/apiEndpoints";
import AMForm from "./AMForm";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";




const AMHome = () => {
   const {regionId }=useRegularApi()
  const { request: getAllAM } = useApi('get', 3002)
  const [allAM, setAllAM] = useState<any[]>([]);
  const {loading,setLoading}=useResponse()
  const [editId, setEditId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalCounts, setTotalCounts] = useState({
    totalAreaManagers: 0,
    totalBda: 0,
    totalLeads: 0,
    totalLicensors: 0,
  });

  const navigate = useNavigate()

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };


  const handleView = (id: any) => {
    navigate(`/area-manager/${id}`)
  }

  const handleEdit = (id: any) => {
    setEditId(id)
    handleModalToggle()
  }

  const getAM = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllAM(endPoints.GET_ALL_AM);

      if (response && !error) {
        // Extracting and transforming area manager data
        const transformedAreas =
          response.data.areaManagers?.map((am: any) => ({
            ...am,
            dateOfJoining: am.dateOfJoining
              ? new Date(am.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A",
            loginEmail: am?.user?.email,
            userName: am?.user?.userName,
            userImage: am?.user?.userImage,
            regionName: am?.region?.regionName,
            areaName: am?.area?.areaName,
          })) || [];
        setAllAM(transformedAreas);

        // Extracting total counts
        setTotalCounts({
          totalAreaManagers: response.data.totalAreaManagers || 0,
          totalBda: response.data.totalBda || 0,
          totalLeads: response.data.totalLeads || 0,
          totalLicensors: response.data.totalLicensors || 0,
        });
      } else {
        console.error(error?.response?.data?.message || "Failed to fetch data.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred.");
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getAM();
  }, []);

  useEffect(()=>{
    if(!isModalOpen){
      getAM()
    }
  },[isModalOpen])

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <UserIcon />,
      number: totalCounts.totalAreaManagers,
      title: "Total Area Manager",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <AreaManagerIcon />,
      number: totalCounts.totalBda,
      title: "Total BDA's",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <LeadsCardIcon />,
      number: totalCounts.totalLeads,
      title: "Total Leads",
      iconFrameColor: "#9C75D3",
      iconFrameBorderColor: "#DAC9F1",
    },
    {
      icon: <Licensor />,
      number: totalCounts.totalLicensors,
      title: "Total Licensers",
      iconFrameColor: "#8695DD",
      iconFrameBorderColor: "#CAD1F1CC",
    },
  ];

  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "userName", label: "Name" },
    { key: "loginEmail", label: "Email Address" },
    { key: "user.phoneNo", label: "Phone No" },
    { key: "regionName", label: "Region" },
    { key: "areaName", label: "Area" },
    { key: "status", label: "Status" },
  ];

  const name = "Name";
  const email = "Email";
  const region = "Region";
  const area = "Area";

  const handleFilter = ({ options }: { options: string }) => {
    if (options === "Name") {
      // Create a new sorted array to avoid mutating the original state
      const sortedAms = [...allAM].sort((a, b) =>
        b?.userName?.localeCompare(a?.userName)
      );
      setAllAM(sortedAms);
    } else if (options === "Region") {
      const sortedAms = [...allAM].sort((a, b) =>
        b?.regionName?.localeCompare(a?.regionName)
      );
      setAllAM(sortedAms)
    } else if (options == 'Email') {
      const sortedAms = [...allAM].sort((a, b) =>
        b?.loginEmail?.localeCompare(a?.loginEmail)
      );
      setAllAM(sortedAms);
    } else {
      const sortedAms = [...allAM].sort((a, b) =>
        b?.areaName?.localeCompare(a?.areaName)
      );
      setAllAM(sortedAms);
    }
  };


  return (
    <div>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
         <h1 className="text-[#303F58] text-xl font-bold">Area Manager</h1>
          <p className="text-ashGray text-sm">
          Manages and optimizes business activities within a specific area. 
            </p>
         </div>

          <Button variant="primary" size="sm" onClick={() => {
            handleModalToggle()
            setEditId('')
          }}>
            <span className="font-bold text-xl">+</span> Create AM
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
          <Table<AMData> data={allAM} columns={columns} headerContents={{
            // title:'Region',
            search: { placeholder: 'Search Area Manager....' },
            sort: [
              {
                sortHead: "Filter",
                sortList: [
                  { label: "Sort by Name", icon: <UserIcon size={14} color="#4B5C79" />, action: () => handleFilter({ options: name }), },
                  { label: "Sort by Region", icon: <RegionIcon size={14} color="#4B5C79" />, action: () => handleFilter({ options: region }), },
                  { label: "Sort by Area", icon: <AreaIcon size={14} color="#4B5C79" />, action: () => handleFilter({ options: area }), },
                  { label: "Sort by Email", icon: <EmailIcon size={14} color="#4B5C79" />, action: () => handleFilter({ options: email }), }
                ]
              }
            ]
          }}
            actionList={[
              { label: 'edit', function: handleEdit },
              { label: 'view', function: handleView },
            ]}
          loading={loading}
          />

        </div>
      </div>
      {/* Modal Section */}
      <Modal className="" open={isModalOpen} onClose={handleModalToggle}>
        <AMForm editId={editId}  regionId={regionId}  onClose={handleModalToggle} />
      </Modal>
    </div>

  )
}

export default AMHome