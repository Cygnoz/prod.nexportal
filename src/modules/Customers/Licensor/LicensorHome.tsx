import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/modal/Modal";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import UserIcon from "../../../assets/icons/UserIcon";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import RegionIcon from "../../../assets/icons/RegionIcon";
import CalenderDays from "../../../assets/icons/CalenderDays";
import PackageMinus from "../../../assets/icons/PackageMinus";
import Boxes from "../../../assets/icons/Boxes";
import Package from "../../../assets/icons/Package";
import TrialIcon from "../../../assets/icons/TrialIcon";
import LeadIcon from "../../../assets/icons/LeadIcon";
import AddLicenser from "./LicenserForm";
import { useNavigate } from "react-router-dom";
import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { LicenserData } from "../../../Interfaces/Licenser";
import { useResponse } from "../../../context/ResponseContext";
import { useUser } from "../../../context/UserContext";


const LicensorHome = () => {
  const { loading, setLoading } = useResponse();
  const {user}=useUser()
  const {regionId ,areaId,customersCounts,refreshContext}=useRegularApi()
  const {request:getAllLicenser}=useApi('get',3001)
   const [allLicenser, setAllLicenser] = useState<LicenserData[]>([]);
   
    const navigate=useNavigate()

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId,setEditId] = useState('');


    const handleEdit=(id:any)=>{
      handleModalToggle()
      setEditId(id)
    }

    const handleModalToggle = () => {
        setIsModalOpen((prev) => !prev);
    getLicensers();
    refreshContext({customerCounts:true})
      };
       const handleView=(id:any)=>{
        navigate(`/licenser/${id}`)
      }
    
      const getLicensers=async()=>{
       
          try{
            setLoading(true)
            const {response,error}=await getAllLicenser(endPoints.LICENSER)
            console.log("res",response);
            console.log("err",error);
            if(response && !error){
              console.log(response.data);
             const transformLicense= response.data.licensers?.map((license:any) => ({
                ...license,
                startDate: license.startDate
                ? new Date(license.startDate).toLocaleDateString("en-GB")
                : "N/A",
                endDate: license.endDate
                ? new Date(license.endDate).toLocaleDateString("en-GB")
                : "N/A",
                licenserId:license.customerId
               
              })) || [];
             setAllLicenser(transformLicense)
            }
          }catch(err){
            console.log(err);
          }finally{
            setLoading(false)
          }
      }
        
        useEffect(()=>{
          getLicensers()
          refreshContext({customerCounts:true})
        },[])

        useEffect(()=>{
          if(isModalOpen){
          refreshContext({customerCounts:true})
          }else{
            getLicensers()
          }
        },[isModalOpen])
      

      // Data for HomeCards
  const homeCardData = [
    { icon: <Boxes />, number: customersCounts?.totalLicensers, title: "Total Licenser",iconFrameColor:'#51BFDA',iconFrameBorderColor:'#C1E7F1CC' },
    { icon: <CalenderDays />, number: customersCounts?.licensersToday, title: "Licenser Today",iconFrameColor:'#1A9CF9',iconFrameBorderColor:'#BBD8EDCC' },
    { icon: <Package />, number: customersCounts?.activeLicensers, title: "Active Licenser",iconFrameColor:'#D786DD',iconFrameBorderColor:'#FADDFCCC' },
    { icon: <PackageMinus />, number: customersCounts?.expiredLicensers, title: "Expired Licenser",iconFrameColor:'#30B777',iconFrameBorderColor:'#B3F0D3CC' },
  ];



        // Define the columns with strict keys
        const columns: { key: any; label: string }[] = [
          { key: "licenserId", label: "Licenser Id" },
          { key: "firstName", label: "Licenser Name" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "expiredStatus", label: "Status" },
         ];
  return (
    <>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>

     
         <h1 className="text-[#303F58] text-xl font-bold">Licenser</h1>
         <p className="text-ashGray text-sm max-sm:hidden">
      Grants legal permission to use a product, service, or brand. 
            </p>
         </div>

        {!(user?.role=="Supervisor" || user?.role=="Support Agent")&&<Button variant="primary" size="sm" onClick={()=>{
        handleModalToggle()
        setEditId('')

      }}>
        <span className="text-xl font-bold">+</span> Create Licenser
        </Button>}
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
        <Table<LicenserData> data={allLicenser} columns={columns} headerContents={{
          title:'Licenser Details',
          search:{placeholder:'Search Licensor...'},
          sort: [
                {
                  sortHead: "Status",
                  sortList: [
                    { label: "All", icon: <UserIcon size={14} color="#4B5C79"/> },
                    { label: "Active", icon: <TrialIcon width={16} height={16} color="#4B5C79"/> },
                    { label: "Expired", icon: <AreaManagerIcon size={14} color="#4B5C79"/> },
                    { label: "Pending Renewal", icon: <CalenderDays size={14} color="#4B5C79"/> }
                  ]
                },
                {
                    sortHead: "License",
                    sortList: [
                      { label: "All", icon: <UserIcon size={14} color="#4B5C79"/> },
                      { label: "Pro", icon: <RegionIcon size={14} color="#4B5C79"/> },
                      { label: "Basic", icon: <LeadIcon width={18} color="#4B5C79"/> },
                      { label: "Enterprise", icon: <CalenderDays size={14} color="#4B5C79"/> }
                    ]
                  },
          ]
        }}
        actionList={[
            { label: 'edit', function: handleEdit},
            { label: 'view', function: handleView },
          ]}  
          loading={loading}
          />
      </div>

   
    </div>
       {/* Modal Section */}
       <Modal open={isModalOpen} onClose={handleModalToggle}  className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[600px]   max-sm:overflow-auto">
        <AddLicenser regionId={regionId}  editId={editId} areaId={areaId} onClose={handleModalToggle} />
      </Modal>
      
    </>
  )
}

export default LicensorHome;