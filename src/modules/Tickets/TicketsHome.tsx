import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../../assets/icons/Bell";
import Notebook from "../../assets/icons/Notebook";
import UserIcon from "../../assets/icons/UserIcon";
import Modal from "../../components/modal/Modal";
import Button from "../../components/ui/Button";
import SortBy from "../../components/ui/SortBy";
import Table from "../../components/ui/Table";
import useApi from "../../Hooks/useApi";
import { TicketsData as BaseTicketsData } from "../../Interfaces/Tickets";
import { endPoints } from "../../services/apiEndpoints";
import CreateTickets from "./TicketsForm";

type Props = {};

// Extend TicketsData to include the additional fields
interface TicketsData extends BaseTicketsData {
  name: string;
  timeAgo: string;
  openingDate: string;
}

function TicketsHome({ }: Props) {
  const { request: getAllTickets } = useApi("get", 3004);
 const [allTickets, setAllTickets] = useState<any[]>([]);
 const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const navigate = useNavigate();
  const [activeLabel, setActiveLabel] = useState<string | null>('Total Tickets');

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState("");

  const handleEdit = (id: any) => {
    handleModalToggle();
    setEditId(id);
  };

  // Function to toggle modal visibility
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    getTickets();
  };

  const handleView = (id: any) => {
    navigate(`/ticket/${id}`);
  };

  const [allTicketss, setAllTicketss] = useState({
    unResolvedTickets: 0,
    resolvedTickets: 0,
    totalTickets: 0,
  });
  
  const getTickets = async () => {
    try {
      const { response, error } = await getAllTickets(endPoints.GET_TICKETS);
  
      if (response && !error) {
        const currentTime = new Date();
  
        // Extract ticket data and other metrics
        
        const transformTicket = response.data?.tickets?.map((ticket: any) => ({
          ...ticket,
          name: ticket?.supportAgentId?.user?.userName,
          openingDate: ticket?.openingDate,
          timeAgo: calculateTimeAgo(new Date(ticket?.openingDate), currentTime),
        })) || [];
        setAllTickets(transformTicket)
        setAllTicketss({
          
          unResolvedTickets: response.data?.unResolvedTickets || 0,
          resolvedTickets: response.data?.resolvedTickets || 0,
          totalTickets: response.data?.totalTickets || 0,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  
  
  
  const calculateTimeAgo = (date: Date, currentTime: Date) => {
    const diffInSeconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000)+3;
    if(diffInSeconds==0) return `Just now`
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Inside the TicketsHome component:
  useEffect(() => {
    setFilteredTickets(allTickets)
    let interval:any;
    let timeout:any;
    if (filteredTickets.length === 1) {
      timeout = setTimeout(() => {
        interval = setInterval(() => {
          setFilteredTickets((prevTickets) =>
            prevTickets.map((ticket) => ({
              ...ticket,
              timeAgo: calculateTimeAgo(new Date(ticket.openingDate), new Date()),
            }))
          );
        }, 1000); // Update every second
      }, 2000); // Delay execution by 2 seconds
    } else if (filteredTickets.length >= 2) {
      interval = setInterval(() => {
        setFilteredTickets((prevTickets) =>
          prevTickets.map((ticket) => ({
            ...ticket,
            timeAgo: calculateTimeAgo(new Date(ticket.openingDate), new Date()),
          }))
        );
      }, 1000); // Update every second
    }
  
    // Cleanup function to clear timeout and interval
    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [allTickets]); // Re-run when allTickets changes
  
  

useEffect(() => {
  getTickets(); // Fetch tickets initially when the component mounts
}, []);


const handleSort = (type: string) => {
  let sortedTickets = [];
  setActiveLabel(type);
  switch (type) {
    case "Total Tickets":
      sortedTickets = allTickets; // All tickets
      break;
    case "Unresolved Tickets":
      sortedTickets = allTickets.filter(ticket => ticket.status !== "Resolved");
      break;
    case "Unassigned Tickets":
      sortedTickets = allTickets.filter(
        ticket => !ticket.supportAgentId || ticket.supportAgentId === undefined
      );
      break;
    case "Solved Tickets":
      sortedTickets = allTickets.filter(ticket => ticket.status === "Resolved");
      break;
    default:
      sortedTickets = allTickets;
  }

  setFilteredTickets(sortedTickets); // Update the filtered list
};







 

  // Define the columns with strict keys
  const columns: { key: keyof TicketsData; label: string }[] = [
    { key: "status", label: "Status" },
    { key: "subject", label: "Subject" },
    { key: "name", label: "Requestor" },
    { key: "priority", label: "Priority" },
    { key: "timeAgo", label: "Requested" },
  ];

  const requestor = "Requestor";
  const priority = "Priority";
  const status = "Status";

  const handleFilter = ({ options }: { options: string }) => {
    // Define custom order for Priority and Status
    const priorityOrder:any = { High: 1, Medium: 2, Low: 3 };
    const statusOrder:any = { Open: 1, "In progress": 2, Resolved: 3 };
  
    if (options === "Requestor") {
      // Sort alphabetically by requestor name
      const sortedTickets = [...filteredTickets].sort((a, b) =>
        b?.name?.localeCompare(a?.name)
      );
      setAllTickets(sortedTickets);
    } else if (options === "Priority") {
      // Sort based on custom Priority order
      const sortedTickets = [...filteredTickets].sort(
        (a, b) => priorityOrder[b?.priority] - priorityOrder[a?.priority]
      );
      setAllTickets(sortedTickets);
    } else if (options === "Status") {
      // Sort based on custom Status order
      const sortedTickets = [...filteredTickets].sort(
        (a, b) => statusOrder[b?.status] - statusOrder[a?.status]
      );
      setFilteredTickets(sortedTickets);
    }
  };
  

  const sort = {
    sortHead: "Sort",
    sortList: [
      {
        label: "Sort by Name",
        icon: <UserIcon size={14} color="#4B5C79" />,
        action: () => handleFilter({ options: requestor }),
      },
      {
        label: "Sort by Priority",
        icon: <Notebook size={14} color="#4B5C79" />,
        action: () => handleFilter({ options: priority }),
      },
      {
        label: "Sort by Status",
        icon: <Bell size={14} color="#4B5C79" />,
        action: () => handleFilter({ options: status }),
      },
    ],
  };

 
  const ticketData = [
    { label: "Total Tickets", value: allTicketss?.totalTickets || 0 },
    { label: "Unresolved Tickets", value: allTicketss?.unResolvedTickets || 0 },
    { label: "Unassigned Tickets", value: 0 },
    { label: "Solved Tickets", value: allTicketss?.resolvedTickets || 0 },
  ];
  

  console.log("allti",allTicketss);
  

 
  

  return (
    <>
       <div className="text-[#303F58] space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[#303F58] text-xl font-bold">Tickets</h1>
          <Button variant="primary" size="sm" onClick={() => {
            handleModalToggle()
            setEditId('')

          }}>
            <span className="text-xl font-bold">+</span>Create Tickets
          </Button>
        </div>


        <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 cursor-pointer">
  {ticketData.map((item, index) => (
    <div
      key={index}
      onClick={() => handleSort(item.label)}
      className={`flex justify-between py-4 px-3 ${item.label===activeLabel ? " bg-[#E7EDF2]" : ""}`}
    >
      <p>{item.label}</p>
      <p>{item.value}</p>
    </div>
  ))}
</div>

          <div className="col-span-9 w-[100%]">
            {/* Table Section */}
            <div >
              <div className="flex justify-between p-3">
                <h1 className="text-xl font-bold">Unsolved Tickets</h1>
                <SortBy sort={sort} />
              </div>
              <Table<TicketsData>
                data={filteredTickets&&filteredTickets}
                columns={columns}
                headerContents={{
                  title: "Ticket Details",
                  search: { placeholder: "Search Tickets..." },

                }}
                actionList={[
                  { label: 'view', function: handleView },
                  { label: 'edit', function: handleEdit },
                ]}
                from="ticket"
              />

            </div>


          </div>
        </div>

      </div>
      {/* Modal controlled by state */}
      <Modal className="w-[35%]" open={isModalOpen} onClose={handleModalToggle}>
        <CreateTickets editId={editId} onClose={handleModalToggle} />
      </Modal>
    </>
  );
}

export default TicketsHome;
