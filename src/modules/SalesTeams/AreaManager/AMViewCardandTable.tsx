import { useNavigate } from "react-router-dom";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import Licensor from "../../../assets/icons/Licensor";
import Table from "../../../components/ui/Table"
import ViewCard from "../../../components/ui/ViewCard";

interface AMViewData {
  BDAname: string;
  leadAssigned: string;
  conversionRate: string;
  status: string;
  area: string;
}

type Props = {
  bdaDetails:Array<any>;
  insideAmData: any;
  loading?:boolean
}

const AMViewCardandTable = ({bdaDetails ,  insideAmData,loading}: Props) => {

  //console.log(bdaDetails);
  

  const navigate= useNavigate()
  const handleView = (id: any) => {
    if (id) {
       navigate(`/bda/${id}`)
    }
  }

  

  const viewCardData = [
    // { icon: <UserIcon />, number: "189", title: "Total Area Manager", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },
    { icon: <AreaManagerIcon />, number: insideAmData?.totalBdaCount || 0, title: "Total BDA's", iconFrameColor: '#D786DD', iconFrameBorderColor: '#FADDFCCC' },
    { icon: <LeadsCardIcon />, number:  insideAmData?.totalLeads || 0, title: "Total Leads", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },

  ];

  const SecondCard = [
    { icon: <Licensor />, number: insideAmData?.totalLicensers || 0, title: "Total Licensers", iconFrameColor: '#D786DD', iconFrameBorderColor: '#FADDFCCC' },
    { icon: <LeadsCardIcon />, number:  insideAmData?.areaManagerDetails?.areaManagerConversionRate  || 0, title: "Lead Conversion rate", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },

  ];
  // const ThirdCard = [
  //   // { icon: <LeadsCardIcon />, number: "147", title: "Lead Conversion rate", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },
  //   { icon: <Licensor />, number: "147", title: "Closed Licenses", iconFrameColor: '#DD8686', iconFrameBorderColor: '#E9CBCBCC' },
  // ];

  // Data for the table
  // const data: AMViewData[] = [
  //   { BDAname: "Devid Billie", leadAssigned: "45", conversionRate: "32%", status: "New", area: "Area 2", },
  //   { BDAname: "Sudeep Kumar", leadAssigned: "45", conversionRate: "32%", status: "New", area: "Area 2", },
  //   { BDAname: "Kathryn Murphy", leadAssigned: "45", conversionRate: "32%", status: "New", area: "Area 2", },
  //   { BDAname: "Darrell Steward", leadAssigned: "45", conversionRate: "32%", status: "New", area: "Area 2", },
  // ];
  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "bdaName", label: "BDA Name" },
    { key: "leadsAssigned", label: "Leads Assigned" },
    { key: "bdaConversionRate", label: "Conversion Rate" },
    { key: "status", label: "Status" },
    { key: "areaName", label: "Area" },
  ];
  //console.log(bdaDetails);
  

  const bdaData =bdaDetails.map((bda:any)=>({
    ...bda,
    bdaName:bda.bdaName,
    leadsAssigned:bda.leadsAssigned,
    bdaConversionRate:bda.bdaConversionRate,
    status:bda.status?bda.status:'N/A',
    areaName:bda.areaName,
    _id:bda.bdaId
  }))


  return (

    <div>
   <div className="grid grid-cols-12 gap-2">
  {/* Cards Section */}
  <div className="col-span-12 md:col-span-4">
    <div className="flex gap-3 py-2 justify-between mt-4">
      {viewCardData.map((card, index) => (
        <ViewCard
          iconFrameColor={card.iconFrameColor}
          iconFrameBorderColor={card.iconFrameBorderColor}
          key={index}
          icon={card.icon}
          number={card.number}
          title={card.title}
        />
      ))}
    </div>
    <div className="flex gap-3 py-2 justify-between mt-2">
      {SecondCard.map((card, index) => (
        <ViewCard
          iconFrameColor={card.iconFrameColor}
          iconFrameBorderColor={card.iconFrameBorderColor}
          key={index}
          icon={card.icon}
          number={card.number}
          title={card.title}
        />
      ))}
    </div>
  </div>

  {/* Table Section */}
  <div className="col-span-12 md:col-span-8">
    <div className=" py-2 mt-4">
      <Table<AMViewData> 
        data={bdaData} 
        columns={columns} 
        headerContents={{
          title: "BDA's",
          search: { placeholder: 'Search BDA by Name' },
        }}
        actionList={[
          { label: 'view', function: handleView },
        ]}
        noPagination
        maxHeight="300px"
        loading={loading}
      />
    </div>
  </div>
</div>

    </div>
  )
}

export default AMViewCardandTable