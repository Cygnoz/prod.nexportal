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




  
const TrialHome = () => {
  const {regionId ,areaId,customersCounts,refreshContext}=useRegularApi()
  const [editId, setEditId] = useState("");
  const {loading,setLoading}=useResponse()
  const {request:getAllTrial}=useApi('get',3001)
  const [allTrials,setAllTrials]=useState<LeadData[]>([])
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

   
      
        // Define the columns with strict keys
        // Define the columns with strict keys for LeadData
      const columns: { key:  any; label: any }[] = [
        { key: "customerId", label: "Lead ID" },
        { key: "trialStatus", label: "Trial Status" },
        { key: "firstName", label: "Customer Name" },
        { key: "startDate", label: "Trial Start Date" },
        { key: "endDate", label: "Trial End Date" },
        { key: "bdaName", label: "Assigned BDA" },
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
      }else{
        console.log(error.response.data.message);
      }
    }catch(err){
      console.log(err);
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    getTrials()
    refreshContext({customerCounts:true})
  },[])

  useEffect(()=>{
    if(isModalOpen){
    refreshContext({customerCounts:true})
    }else{
      getTrials()
    }
  },[isModalOpen])

  
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
        <Table<LeadData> data={allTrials} columns={columns} headerContents={{
          title:'Trial Details',
          search:{placeholder:'Search Trials...'}
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