import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import CalenderDays from "../../../assets/icons/CalenderDays";
import RegionIcon from "../../../assets/icons/RegionIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import SuperVisorCards from "../../../components/ui/SuperVisorCards";
import Table from "../../../components/ui/Table";
import person1 from "../../../assets/image/Ellipse 14.png";
import person2 from "../../../assets/image/Ellipse 43.png";
import { useNavigate } from "react-router-dom";



interface SupervisorData {
    ticketsNumber: string;
    supportAgent:string;
    status: string;
    issue: string;
    Priority:string;
   
  }
// type Props = {
//   ticketSummary:any;
// }

// const SuperVisorTicketsOverview = ({ticketSummary}: Props) => {

    // const handleEditDeleteView=(editId?:any,viewId?:any,deleteId?:any)=>{
    //     if(viewId){
         
    //       //navigate(`/supervisor/${viewId}`)
    //       console.log(viewId);
    //     }else if(editId){
    //       console.log(editId)
    //       // setId({...id,edit:editId})
    //     }else{
    //       console.log(deleteId)
    //       // setId({...id,delete:deleteId})
    //     }
    //   }

type Props = {
  supportAgentDetails:any
  ticketSummary:any
  insideSvData:any
  loading?:boolean
}
  
const SuperVisorTicketsOverview = ({supportAgentDetails,ticketSummary,insideSvData,loading}: Props) => {
  const navigate=useNavigate()
  console.log(insideSvData);
  
  const handleView = (id:any) => {
    if (id) {
      navigate(`/ticket/${id}`);
      console.log(id);
       }
};
 
 

      const SuperVisorCardData = [
        {
            
          number: ticketSummary?.totalTickets || 0,
            title: "Total Tickets",
            subTitle: "Lorem ipsum dolor sit amet consectetur.",
            images: [
              <img src={person1} alt="person1" className="w-10 h-10 rounded-full" />,
              <img src={person2} alt="person2" className="w-10 h-10 rounded-full" />,
              <img src={person1} alt="person3" className="w-10 h-10 rounded-full" />,
              <img src={person2} alt="person4" className="w-10 h-10 rounded-full" />,
          ],
        },
        {
          
          number: ticketSummary?.openTickets || 0,
            title: "Open Tickets",
            subTitle: "In Percentage"
        },
        {
            
          number: ticketSummary?.resolvedTickets || 0,
            title: "Tickets Resolved",
            subTitle: "customer satisfaction rating for tickets resolved by the team"
        },
    
    ];
    
      

        // Define the columns with strict keys
        const columns: { key: any; label: string }[] = [
          { key: "ticketId", label: "Tickets Number" },
          { key: "supportAgentName", label: "Support Agent" },
          { key: "status", label: "Status" },
          { key: "subject", label: "Subject" },
          { key: "priority", label: "Priority" },
      

        ];
        const updatedTicketDetails = supportAgentDetails.flatMap((support: any) =>
          (Array.isArray(support.ticketDetails) ? support.ticketDetails : []).map((ticket: any) => ({
            subject: ticket.subject || "N/A",
            priority: ticket.priority || "N/A",
            status: ticket.status || "N/A",
            ticketId: ticket.ticketId || "N/A",
            _id:ticket._id,
            supportAgentName: support.supportAgentName, // Keeping only the required fields
          }))
        );
        
        console.log("Updated Ticket Details:", updatedTicketDetails);
        
        

        

  return (
    <div>
         <div className="grid grid-cols-12 gap-3 mt-2">
  <div className="col-span-12 md:col-span-8">
    {/* Table Section */}
    <div>
      <Table<SupervisorData> 
        data={updatedTicketDetails} 
        columns={columns} 
        headerContents={{
          title: 'Tickets Overview',
          search: { placeholder: 'Search Tickets' },
          sort: [
            {
              sortHead: "Filter",
              sortList: [
                { label: "Sort by supervisorCode", icon: <UserIcon size={14} color="#4B5C79" /> },
                { label: "Sort by Age", icon: <RegionIcon size={14} color="#4B5C79" /> },
                { label: "Sort by supervisorCode", icon: <AreaManagerIcon size={14} color="#4B5C79" /> },
                { label: "Sort by Age", icon: <CalenderDays size={14} color="#4B5C79" /> }
              ]
            }
          ]
        }}
        actionList={[{ label: 'view', function: handleView }]}
        maxHeight="300px"
        loading={loading}
      />
    </div>
  </div>
  
  <div className="col-span-12 md:col-span-4 -mt-4 sm:mt-0 md:mt-0">
  {/* HomeCards Section */}
  <div className="grid gap-4">
    {SuperVisorCardData.map((card, index) => (
      <SuperVisorCards
        key={index}
        number={card.number}
        title={card.title}
        subTitle={card.subTitle}
        images={card.images}
      />
    ))}
  </div>
</div>

</div>


    </div>
  )
}

export default SuperVisorTicketsOverview