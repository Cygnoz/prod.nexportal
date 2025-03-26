// import { useState } from "react";
// import Button from "../../../components/ui/Button";
// import Modal from "../../../components/modal/Modal";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
// import UserIcon from "../../../assets/icons/UserIcon";
// import RegionIcon from "../../../assets/icons/RegionIcon";
// import CalenderDays from "../../../assets/icons/CalenderDays";
import CalenderDays from "../../../assets/icons/CalenderDays";
import Boxes from "../../../assets/icons/Boxes";
import PackageMinus from "../../../assets/icons/PackageMinus";
import CalenderMultiple from "../../../assets/icons/CalenderMultiple";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import { useEffect, useState } from "react";
import { LeadData } from "../../../Interfaces/Lead";
import { useRegularApi } from "../../../context/ApiContext";
import Modal from "../../../components/modal/Modal";
import TrialForm from "./TrialForm";
import { useResponse } from "../../../context/ResponseContext";
import ProductLogo from "../../../components/ui/ProductLogo";




  
const TrialHome = () => {
  const {regionId ,areaId,customersCounts,refreshContext}=useRegularApi()
  const [editId, setEditId] = useState("");
  const {loading,setLoading}=useResponse()
  const {request:getAllTrial}=useApi('get',3001)
  const [allTrials,setAllTrials]=useState<LeadData[]>([])
  const [orignalTrial,setOriginalTrial]=useState<LeadData[]>([])
   const navigate=useNavigate()

   
  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({

    leadForm: false,
  });

  // Function to toggle modal visibility
  const handleModalToggle = (
   
    leadForm = false
  ) => {
    setIsModalOpen((prev) => ({
      ...prev,
     
      leadForm: leadForm,
    }));
  };
    
      const handleView=(id:any)=>{
        navigate(`/trial/${id}`)
      }
    
      
  const handleEdit = (id: any) => {
    setEditId(id);
    handleModalToggle(true);
  };

      // Data for HomeCards
  const homeCardData = [
    { icon: <CalenderDays />, number: customersCounts?.activeTrials, title: "Active Trials",iconFrameColor:'#1A9CF9',iconFrameBorderColor:'#BBD8EDCC' },
    { icon: <CalenderMultiple size={40} />, number: customersCounts?.extendedTrials, title: "Extended Trials",iconFrameColor:'#D786DD',iconFrameBorderColor:'#FADDFCCC' },
    { icon: <Boxes />, number: customersCounts?.convertedTrials, title: "Converted Trails",iconFrameColor:'#51BFDA',iconFrameBorderColor:'#C1E7F1CC' },
    { icon: <PackageMinus />, number: customersCounts?.expiredTrials, title: "Expired Trails",iconFrameColor:'#30B777',iconFrameBorderColor:'#B3F0D3CC' },
  ];

  const getTrials=async()=>{
    setLoading(true)
    try{
      const {response,error}=await getAllTrial(endPoints.TRIAL)
      console.log("res",response);
      console.log("err",error);
      
      
      if(response && !error){
        console.log("res",response);
      console.log("err",error);
        const transformLicense= response.data.trial?.map((trial:any) => ({
          ...trial,
          startDate: trial.startDate
          ? new Date(trial.startDate).toLocaleDateString("en-GB")
          : "N/A",
          endDate: trial.endDate
          ? new Date(trial.endDate).toLocaleDateString("en-GB")
          : "N/A",
          bdaName:trial?.bdaId?.user?.userName 
        })) || [];
       setAllTrials(transformLicense)
       setOriginalTrial(transformLicense)
      }else{
        console.log(error.response.data.message);
      }
    }catch(err){
      console.log(err);
    }finally{
      setLoading(false)
    }
  }
      
        // Define the columns with strict keys
        // Define the columns with strict keys for LeadData
      const columns: { key:  any; label: any }[] = [
        { key: "customerId", label: "Trial ID" },
        { key: "trialStatus", label: "Trial Status" },
        { key: "project", label: "Product" },
        { key: "firstName", label: "Customer Name" },
        { key: "startDate", label: "Trial Start Date" },
        { key: "endDate", label: "Trial End Date" },
        { key: "bdaName", label: "Assigned BDA" },
      ];
    
      const BillBizz = "BillBizz";
      const SewNex = "SewNex";
      const SaloNex = "SaloNex";
      const NexD = "6NexD";
      const All=""
      const Hold = "Hold";
      const InProgress = "In progress";
      const Extended = "Extended";
      
      const sort = [
        {
          sortHead: "By product",
          sortList: [
            {
              label: 'All',
              icon: '',
              action: () => handleFilter({ options: All }),
            },
            {
              label: BillBizz,
              icon: <ProductLogo projectName={BillBizz} size={6} />,
              action: () => handleFilter({ options: BillBizz }),
            },
            {
              label: SewNex,
              icon: <ProductLogo projectName={SewNex} size={6} />,
              action: () => handleFilter({ options: SewNex }),
            },
            {
              label: SaloNex,
              icon: <ProductLogo projectName={SaloNex} size={6} />,
              action: () => handleFilter({ options: SaloNex }),
            },
            {
              label: NexD,
              icon: <ProductLogo projectName={NexD} size={6} />,
              action: () => handleFilter({ options: NexD }),
            },
          ],
        },
        {
          sortHead: "By status",
          sortList: [
            {
              label: 'All',
              icon: '',
              action: () => handleFilter({ options: All }),
            },
            {
              label: Hold,
              icon: '',
              action: () => handleFilter({ options: Hold }),
            },
            {
              label: InProgress,
              icon: '',
              action: () => handleFilter({ options: InProgress }),
            },
            {
              label:Extended,
              icon: '',
              action: () => handleFilter({ options:Extended }),
            },
          ],
        },
      ];
      
    
      
      const handleFilter = ({ options }: { options: string }) => {
        if (options === All) {
          // Reset to show all trials
          setAllTrials(orignalTrial);
          return;
        }
      
        // Check if the option is a product filter
        const isProductFilter = [BillBizz, SewNex, SaloNex, NexD].includes(options);
        
        // Check if the option is a status filter
        const isStatusFilter = [InProgress, Hold, Extended].includes(options);
      
        if (isProductFilter) {
          const filteredTrials = orignalTrial.filter(trial => 
            trial.project?.toLowerCase() === options.toLowerCase()
          );
          setAllTrials(filteredTrials);
        } else if (isStatusFilter) {
          const filteredTrials = orignalTrial.filter(trial => 
            trial.trialStatus?.toLowerCase() === options.toLowerCase()
          );
          setAllTrials(filteredTrials);
        }
      };  
      
 

  useEffect(()=>{
    getTrials()
    refreshContext({customerCounts:true})
  },[])

  useEffect(()=>{
    if(isModalOpen.leadForm){
    refreshContext({customerCounts:true})
    }else{
      getTrials()
    }
  },[isModalOpen])

  console.log("aaa",allTrials);
  
  
  
  return (
    <>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">Trial</h1>
          <p className="text-ashGray text-sm">
          A temporary access period to evaluate a product or service. 
            </p>
         </div>

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
        <Table<LeadData> data={allTrials} columns={columns} headerContents={{
          title:'Trial Details',
          search:{placeholder:'Search Trials...'},
          sort:sort
        }}
        actionList={[
            { label: 'view', function: handleView },
            { label: 'edit', function: handleEdit },
        ]} 

          loading={loading}
          />
      </div>
    </div>
    <Modal open={isModalOpen.leadForm} onClose={() => handleModalToggle()}>
        <TrialForm editId={editId}  regionId={regionId} areaId={areaId} onClose={() => handleModalToggle()} />
      </Modal>
    </>
  )
}

export default TrialHome;