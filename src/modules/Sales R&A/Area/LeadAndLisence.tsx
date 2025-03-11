import { useEffect, useState } from "react";
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import LicenserCardIcon from "../../../assets/icons/LicenserCardIcon";
import HomeCard from "../../../components/ui/HomeCards";
// import Licensers from "../../../components/ui/Licensers";
import Table from "../../../components/ui/Table";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import LicenserTable from "./LicenserTable";
import { useNavigate } from "react-router-dom";
import { useResponse } from "../../../context/ResponseContext";



interface AreaData {
    leadId: string;
    leadName: string;
    phoneNumber: string;
    emailAddress: string;
    source: string;
    assignedTo: string;
    status: string;
  }


  
type Props = {
  id:any
}

const LeadAndLisence = ({id}: Props) => {
    const [leadLicensorData,setLeadLicensorData]=useState<any>()
    const {loading,setLoading}=useResponse()
    const navigate=useNavigate()
    const handleView=(id:any)=>{
        navigate(`/lead/${id}`)
      }
    const {request:getLeadLicensor}=useApi('get',3003)
      // Data for HomeCards
      const homeCardData = [
        { 
            icon: <LeadsCardIcon size={40} />, 
            number: leadLicensorData?leadLicensorData?.leadConversionRate:0, 
            title: "Lead Conversion Rate", 
            iconFrameColor: "#DD9F86", 
            iconFrameBorderColor: "#FADDFCCC" 
        },
        {    icon: <LicenserCardIcon />, 
            number: leadLicensorData?leadLicensorData?.activeLicenses:0, 
            title: "Active licenses", 
            iconFrameColor: "#8695DD", 
            iconFrameBorderColor: "#CAD1F1CC" 
        },
        {    icon: <LicenserCardIcon />, 
          number: leadLicensorData?leadLicensorData?.expiredLicenses:0, 
          title: "Expired  licenses", 
          iconFrameColor: "#8695DD", 
          iconFrameBorderColor: "#CAD1F1CC" 
      },
        { 
          icon: <LeadsCardIcon size={40}/>, 
          number: "444", 
          title: "License Revenue", 
          iconFrameColor: "#DD9F86", 
          iconFrameBorderColor: "#F6DCD2" 
        },
    
      ];
      

      // Define the columns with strict keys
    const columns: { key: any; label: string }[] = [
        { key: "customerId", label: "Lead ID" },
        { key: "leadName", label: "Lead Name" },
        { key: "phone", label: "Phone Number" },
        { key: "email", label: "Email address" },
        { key: "leadSource", label: "Source" },
        { key: "bdaName", label: "Assigned To" },
        { key: "leadStatus", label: "Status" },
    ];

    const getLeadAndLicenser = async () => {
        try {
          setLoading(true)
          const { response, error } = await getLeadLicensor(
            `${endPoints.GET_AREAS}/${id}/lead`
          );
          if (response && !error) {
            const {leads,licensors,activeLicenses, expiredLicenses, leadConversionRate}=response.data
            const filteredlicesor=licensors.map((licensor:any)=>({
              ...licensor,
              endDate: licensor.endDate
                  ? new Date(licensor.endDate).toLocaleDateString("en-GB")
                  : "N/A",
              startDate:licensor.startDate
              ? new Date(licensor.startDate).toLocaleDateString("en-GB")
              : "N/A",
            }))
            const filtered={leads,filteredlicesor,activeLicenses, expiredLicenses, leadConversionRate}
           setLeadLicensorData(filtered)
          } else {
            console.log(error.response.data);
          }
        } catch (err) {
          console.log(err);
        }finally{
          setLoading(false)
        }
      };
    
      useEffect(() => {
        getLeadAndLicenser()
      }, [id]);
      

  return (
    <div>
          {/* HomeCards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-5 lg:grid-cols-4 py-2 gap-2">
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
        <Table<AreaData> data={leadLicensorData?.leads} columns={columns} headerContents={{
          title:"Lead Details",
          search:{placeholder:'Search Leads...'},
        //   sort: [
        //         {
        //           sortHead: "Filter",
        //           sortList: [
        //             { label: "Sort by Name", icon: <UserIcon size={14} color="#4B5C79"/> },
        //             { label: "Sort by Age", icon: <RegionIcon size={14} color="#4B5C79"/> },
        //             { label: "Sort by Name", icon: <AreaManagerIcon size={14} color="#4B5C79"/> },
        //             { label: "Sort by Age", icon: <CalenderDays size={14} color="#4B5C79"/> }
        //           ]
        //         }
        //   ]
        }}
        actionList={[
          
          { label: 'view', function: handleView },
        ]}
        loading={loading}
         />
      </div>

      <div className="my-4">
         {/* Licensers handled by BDA */}
       <LicenserTable licensor={leadLicensorData?.filteredlicesor}/>
      </div>

      
    </div>
  )
}

export default LeadAndLisence