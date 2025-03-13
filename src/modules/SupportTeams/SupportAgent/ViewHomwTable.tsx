import { useEffect, useState } from "react"
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon"
import CalenderDays from "../../../assets/icons/CalenderDays"
import RegionIcon from "../../../assets/icons/RegionIcon"
import UserIcon from "../../../assets/icons/UserIcon"
import No_Data_found from '../../../assets/image/NO_DATA.png'
import useApi from "../../../Hooks/useApi"
import { endPoints } from "../../../services/apiEndpoints"
import SAViewTable from "./SAViewTable"

type Props = {
  getData: any
  tickets: { openTickets: any[]; closedTickets: any[] };
}

const ViewHomwTable = ({ getData, tickets }: Props) => {
  const { request: getaAWARD } = useApi('get', 3004)
 
  const [getAwards, setGetDatas] = useState<any>([])
  const tabs = ["Open Tickets", "Closed Tickets"] as const;
  type TabType = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<TabType>("Open Tickets");
  

  ///console.log(id);
  console.log(getData);
  console.log(getData?.saData);


  
  const getAward = async()=>{
    try{
      const endPoint= `${endPoints.GET_ONE_PRAISE}/${getData?.saData?.user?._id}`
      const {response, error}=await getaAWARD(endPoint)
      console.log('res',response);
      console.log('err',error);
      console.log('endpoint',endPoint);
      if(response && !error){
        console.log(response.data);
         setGetDatas(response.data.praises)
      }      
      else{
        console.error(error.response.data.message)
      }
    }
    catch(err){
      console.error("Error fetching AWARDS data:", err);
    }
  }

 useEffect(()=>{
  if(getData?.saData?.user?._id){
    getAward()
  }
 },[getData?.saData?.user?._id])

 console.log('getawards',getAwards);
 

  const openData = tickets.openTickets.map((ticket, index) => ({
    ticketNo: index + 1, // Assign a unique number if not provided
    name: ticket.companyName || "N/A",
    organisationId: ticket.organizationId || "N/A",
    issue: ticket.subject || "N/A",
    priority: ticket.priority || "N/A",
    status: ticket.status || "N/A",
  }));

  const closedData = tickets.closedTickets.map((ticket, index) => ({
    ...ticket,
    ticketNo: index + 1, // Assign a unique number if not provided
    name: ticket.companyName || "N/A",
    organisationId: ticket.organizationId || "N/A",
    issue: ticket.subject || "N/A",
    priority: ticket.priority || "N/A",
    status: ticket.status || "N/A",

  }))
  // Define the columns with strict keys
  const Opencolumns: { key: keyof typeof openData[0]; label: string }[] = [
    { key: "ticketNo", label: "Ticket Number" },
    { key: "name", label: "Organization Name" },
    { key: "organisationId", label: "Organization Id" },
    { key: "issue", label: "Issue" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
  ];

  const Closedcolumns: { key: keyof typeof closedData[0]; label: string }[] = [
    { key: "ticketNo", label: "Ticket Number" },
    { key: "name", label: "Organization Name" },
    { key: "organisationId", label: "Organization Id" },
    { key: "issue", label: "Issue" },
    { key: "customerFeedback", label: "Customer Feedback" },
    // { key: "status", label: "Status" },
  ];
  

  return (
    <div>
     <div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-9">
    {/* Table Section */}
    <div className="mt-3 gap-4 hide-scrollbar">
      <SAViewTable
        data={activeTab === "Open Tickets" ? openData : closedData}
        columns={activeTab === "Open Tickets" ? Opencolumns : Closedcolumns}
        headerContents={{
          title: "Tickets",
          search: { placeholder: "Search" },
          sort: [
            {
              sortHead: "Filter",
              sortList: [
                {
                  label: "Sort by Organization Name",
                  icon: <UserIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by Organization ID",
                  icon: <RegionIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by Priority",
                  icon: <AreaManagerIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by Status",
                  icon: <CalenderDays size={14} color="#4B5C79" />,
                },
              ],
            },
          ],
        }}
        noAction
        maxHeight="290px"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  </div>

  <div className="col-span-12 md:col-span-3">
    <div className="p-3 bg-[#FFFFFF] gap-4 mt-3 rounded-lg">
      <p className="text-[#303F58] font-semibold text-base">Achievements and Awards</p>
      <div className={`h-96 ${getAwards.length > 3 ? 'overflow-y-scroll custom-scrollbar' : ''}`}>
        {getAwards?.length > 0 ? (
          getAwards.map((praises: any) => (
            <div key={praises?.id} className="bg-[#F5F9FC] p-4 gap-3 h-auto rounded-lg my-3">
              <p className="bg-[#9DF6B42E] w-fit h-7 p-2 rounded-xl mb-3 text-[#303F58] font-semibold text-xs">
                {praises?.achievement}
              </p>
              <div className="flex gap-4 mb-3">
                {praises?.userDetails?.userImage ? (
                  <img className="w-8 h-8 rounded-full" src={praises?.userDetails?.userImage} alt="User" />
                ) : (
                  <p className="w-8 h-8 bg-black rounded-full flex justify-center items-center">
                    <UserIcon color="white" size={18} />
                  </p>
                )}
                <p className="mb-2 text-[#4B5C79] text-xs font-normal mt-1">{praises?.notes}</p>
              </div>
              <p className="text-[#303F58] font-normal text-xs">
                Date Received:{" "}
                <span className="font-bold">
                  {praises?.openingDate ? new Date(praises?.openingDate).toLocaleDateString() : "N/A"}
                </span>
              </p>
            </div>
          ))
        ) : (
          <div className="flex justify-center flex-col items-center h-full">
            <img width={70} src={No_Data_found} alt="No Data Found" />
            <p className="font-bold text-red-700">No Achievements Found!</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

    </div>
  )
}

export default ViewHomwTable