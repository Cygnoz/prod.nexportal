import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import { AreaData } from "../../../Interfaces/Area";
import AreaIcon from "../../../assets/icons/AreaIcon";
import AreaManagerIcon from '../../../assets/icons/AreaMangerIcon';
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import Notebook from "../../../assets/icons/Notebook";
import RegionIcon from '../../../assets/icons/RegionIcon';
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
// import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import AreaForm from "./AreaForm";
import toast from "react-hot-toast";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";




const AreaHome = () => {
  const {regionId}=useRegularApi()
  const navigate=useNavigate()
  const [allAreas,setAllAreas]=useState<AreaData[]>([]);
  const {request:getAllArea}=useApi('get',3003)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId,setEditId]=useState('')
  const {loading,setLoading}=useResponse()
  
  
  // Function to toggle modal visibility
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleView=(id:any)=>{
    navigate(`/areas/${id}`)
  }
  const handleEdit=(id:any)=>{
    handleModalToggle()
    setEditId(id)
  }

  const [totalCounts, setTotalCounts] = useState({
    totalArea: 0,
    totalAreaManagers: 0,
    totalBda: 0,
    totalLeads: 0,
  });
  
  const getAreas = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllArea(endPoints.GET_AREAS);
  
      if (response && !error) {
        console.log(response);
  
        // Extract areas and transform data
        const transformedAreas = response.data.areas?.map((area: any) => ({
          ...area,
          createdAt: new Date(area.createdAt).toLocaleDateString("en-GB"), // Format date
          region: area?.region?.regionName,
        }));
        setAllAreas(transformedAreas);
  
        // Extract totals
        setTotalCounts({
          totalArea: response.data.totalArea || 0,
          totalAreaManagers: response.data.totalAreaManagers || 0,
          totalBda: response.data.totalBda || 0,
          totalLeads: response.data.totalLeads || 0,
        });
      } else {
        console.error(error?.response?.data?.message || "Failed to fetch data.");
      }
    } catch (err) {
      console.error("Error fetching areas:", err);
      toast.error("An unexpected error occurred.");
    }finally{
      setLoading(false)
    }
  };
  
  useEffect(() => {
    getAreas();
    // refreshContext({counts:true})
  }, []);

  useEffect(()=>{
    if(!isModalOpen){
      getAreas()
    }
  },[isModalOpen])
  
  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaIcon size={24} />,
      number: totalCounts.totalArea,
      title: "Total Area",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <UserIcon size={24} />,
      number: totalCounts.totalAreaManagers,
      title: "Total Area Manager",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <AreaManagerIcon size={24} />,
      number: totalCounts.totalBda,
      title: "Total BDA's",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <LeadsCardIcon size={40} />,
      number: totalCounts.totalLeads,
      title: "Total Leads",
      iconFrameColor: "#DD9F86",
      iconFrameBorderColor: "#F6DCD2",
    },
  ];
    


  // Define the columns with strict keys
  const columns: { key:any; label: string }[] = [
    { key: "areaCode", label: "Area Code" },
    { key: "areaName", label: "Area Name" },
    { key: "createdAt", label: "Created Date" },
    { key: "region", label: "Region" },
    { key: "status", label: "Status" },
  ];
  
  const name = "Name";
  const region = "Status";
  const code = "Code";

  const handleFilter = ({ options }: { options: string }) => {
    if (options === 'Name') {
      // Create a new sorted array to avoid mutating the original state
      const sortedAreas = [...allAreas].sort((a, b) =>b.areaName.localeCompare(a.areaName));
      setAllAreas(sortedAreas);
    }else if (options === 'Status') {
      const sortedAreas = [...allAreas].sort((a:any, b:any) => {
          // Prioritize status
          if (a.status === 'Active' && b.status !== 'Active') return 1;
          if (a.status !== 'Active' && b.status === 'Active') return -1;
  
          // If status is the same, sort by region
          return a.region.localeCompare(b.region);
      });
  
      setAllAreas(sortedAreas);
  }
  else {
      const sortedAreas = [...allAreas].sort((a:any, b:any) => {
        // Extract the numeric part of the regionCode
        const numA = parseInt(a.areaCode.split('-')[1], 10);
        const numB = parseInt(b.areaCode.split('-')[1], 10);
        
        // Sort in descending order
        return numB - numA;
      });
      setAllAreas(sortedAreas);
    }
  };
  
  return (
    <>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">Area</h1>
          <p className="text-ashGray text-sm">
          organizes specific areas within a region for better location-based management.  
            </p>
         </div>
        <Button variant="primary" size="sm" onClick={()=>{
          handleModalToggle()
          setEditId('')
        }}>
          <span className="font-bold text-xl">+</span> Create Area
        </Button>
      </div>

      {/* HomeCards Section */}
      <div className="flex gap-3 py-2 justify-between">
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
        <Table<AreaData> data={allAreas} columns={columns} headerContents={{
          title:"Area's",
          search:{placeholder:'Search Area...'},
          sort: [
            {
              sortHead: "Filter",
              sortList: [
                {
                  label: "Sort by Name",
                  icon: <AreaIcon size={14} color="#4B5C79" />,
                  action: () => handleFilter({ options: name }),
                },
                {
                  label: "Sort by Status",
                  icon: <RegionIcon size={14} color="#4B5C79" />,
                  action: () => handleFilter({ options: region }),
                },
                {
                  label: "Sort by Code",
                  icon: <Notebook size={14} color="#4B5C79" />,
                  action: () => handleFilter({ options: code }),
                },
              ],
            },
          ],
        }}
        actionList={[
          { label: 'edit', function:handleEdit },
          { label: 'view', function: handleView },
        ]}
        loading={loading}
         />
      </div>
      </div>
      {/* Modal Section */}
      <Modal open={isModalOpen} onClose={handleModalToggle} className="w-[35%]">
        <AreaForm regionId={regionId}  editId={editId} onClose={handleModalToggle} />
      </Modal>
    </>
  );
};

export default AreaHome;
