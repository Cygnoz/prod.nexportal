import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketInProgress from "../../assets/icons/TicketInProgress";
import TicketOpenIcon from "../../assets/icons/TicketOpenIcon";
import TicketPendingIcon from "../../assets/icons/TicketPendingIcon";
import TicketSolvedIcon from "../../assets/icons/TicketSolvedIcon";
import billbizlogo from '../../assets/image/bilbizzprdLogo.png';
import Salonexlogo from '../../assets/image/Salonexlogo.png';
import Sewnexlogo from '../../assets/image/SewnexLogo.png';
import SixNexlogo from '../../assets/image/sixNexdLogo.png';
import Input from "../../components/form/Input";
import Modal from "../../components/modal/Modal";
import Button from "../../components/ui/Button";
import HomeCard from "../../components/ui/HomeCards";
import Table from "../../components/ui/Table";
import { useRegularApi } from "../../context/ApiContext";
import { useResponse } from "../../context/ResponseContext";
import { socket } from "../../context/SocketContext";
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
  requestor: string
}

function TicketsHome({ }: Props) {
  const { loading, setLoading } = useResponse()
  const { refreshContext } = useRegularApi()
  const { request: getAllTickets } = useApi("get", 3004);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const navigate = useNavigate();
  const [allTicketss, setAllTicketss] = useState({
    inprogress: 0,
    opened: 0,
    resolved: 0,
    closed: 0,
    all:0,
    billbizz:0,
    sewnex:0,
    salonex:0,
    sixnexd:0
  });

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
  };

  const handleView = (id: any) => {
    navigate(`/ticket/${id}`);
  };



  const getTickets = async () => {
    try {
      setLoading(true)
      const { response, error } = await getAllTickets(`${endPoints.GET_TICKETS}?project=${filter.activeProject}&date=${filter.date}`);
  
      if (response && !error) {
        console.log("res",response.data);
        
        const currentTime = new Date();
        const transformTicket = response.data?.tickets?.map((ticket: any) => ({
          ...ticket,
          requestor: ticket?.customerId?.firstName,
          name: ticket?.supportAgentId?.user?.userName,
          openingDate: ticket?.openingDate,
          timeAgo: calculateTimeAgo(new Date(ticket?.updatedAt ? ticket?.updatedAt : ticket?.openingDate), currentTime),
        })) || [];
        setAllTickets(transformTicket)
        setAllTicketss({
          inprogress: response.data?.statusCounts?.["In progress"] || 0, // Corrected key access
          closed: response.data?.statusCounts?.Closed || 0,
          opened: response.data?.statusCounts?.Open || 0,
          resolved: response.data?.statusCounts?.Resolved || 0,
          all:response.data?.tickets.length,
          billbizz:response.data?.ticketCountByProject?.BillBizz ||0,
          salonex:response.data?.ticketCountByProject?.SaloNex ||0,
          sewnex:response.data?.ticketCountByProject?.SewNex ||0,
          sixnexd:response.data?.ticketCountByProject?.['6NexD'] ||0,
        });
        
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  };




  const calculateTimeAgo = (date: Date, currentTime: Date) => {
    const diffInSeconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000) + 3;
    if (diffInSeconds == 0) return `Just now`
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
    let interval: any;
    let timeout: any;
    if (filteredTickets.length === 1) {
      timeout = setTimeout(() => {
        interval = setInterval(() => {
          setFilteredTickets((prevTickets) =>
            prevTickets.map((ticket) => ({
              ...ticket,
              timeAgo: calculateTimeAgo(new Date(ticket?.updatedAt ? ticket?.updatedAt : ticket?.openingDate), new Date()),
            }))
          );
        }, 1000); // Update every second
      }, 2000); // Delay execution by 2 seconds
    } else if (filteredTickets.length >= 2) {
      interval = setInterval(() => {
        setFilteredTickets((prevTickets) =>
          prevTickets.map((ticket) => ({
            ...ticket,
            timeAgo: calculateTimeAgo(new Date(ticket?.updatedAt ? ticket?.updatedAt : ticket?.openingDate), new Date()),
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






  // Add necessary dependencies

  useEffect(() => {
    const handleGetAllTickets = (allTick: any) => {
      const currentTime = new Date();
      const transformTicket = allTick?.tickets?.map((ticket: any) => ({
        ...ticket,
        requestor: ticket?.customerId?.firstName,
        name: ticket?.supportAgentId?.user?.userName,
        openingDate: ticket?.openingDate,
        timeAgo: calculateTimeAgo(new Date(ticket?.updatedAt ? ticket?.updatedAt : ticket?.openingDate), currentTime),
      })) || [];
      setFilteredTickets(transformTicket)
    };

    socket.on('getAllTickets', handleGetAllTickets);

    return () => {
      socket.off('getAllTickets', handleGetAllTickets);
    };
  }, []);



  // Define the columns with strict keys
  const columns: { key: keyof TicketsData; label: string }[] = [
    { key: "status", label: "Status" },
    { key: "subject", label: "Subject" },
    { key: "requestor", label: "Requestor" },
    { key: "requestor", label: "Plan" },
    { key: "priority", label: "Priority" },
    { key: "timeAgo", label: "Requested" },
  ];

  const requestor = "Requestor";
  const priority = "Priority";
  const status = "Status";


  const handleFilter = ({ options }: { options?: string }) => {
    // Define custom order for Priority and Status
    const priorityOrder: any = { High: 1, Medium: 2, Low: 3 };
    const statusOrder: any = { Open: 1, "In progress": 2, Resolved: 3 };

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

  const [filter, setFilter] = useState({
    date:'', // Sets today's date in YYYY-MM-DD format
    activeProject: ''
  });



  const handleProjectSelect=(project:string)=>{
    console.log("projext",project);
    
    setFilter((prev)=>({
      ...prev,
      activeProject:project
    }))
  }

  const sort = [
    {
      sortHead: "By Status",
      sortList: [
        {
          label: "All",
          icon: null, // Adding a placeholder for the required icon
          action: () => handleFilter({ options: requestor }),
        },
        {
          label: "Open",
          icon: null,
          action: () => handleFilter({ options: requestor }),
        },
        {
          label: "In progress",
          icon: null,
          action: () => handleFilter({ options: priority }),
        },
        {
          label: "Resolved",
          icon: null,
          action: () => handleFilter({ options: status }),
        },
        {
          label: "Closed",
          icon: null,
          action: () => handleFilter({ options: status }),
        },
      ],
    },
  ];
  
  

  // const ticketData = [
  //   { label: "Total Tickets", value: allTicketss?.totalTickets || 0 },
  //   { label: "Un Resolved Tickets", value: allTicketss?.unResolvedTickets || 0 },
  //   { label: "Un Assigned Tickets", value: allTicketss.unAssignedTickets || 0 },
  //   { label: "Resolved Tickets", value: allTicketss?.resolvedTickets || 0 },
  //   { label: "Closed Tickets", value: allTicketss?.closedTickets || 0 },
  // ];


  const filteredByPrd = [
    {
      title: "",
      count:allTicketss.all
    },
    {
      icon: billbizlogo,
      title: "BillBizz",
      count:allTicketss.billbizz
    },
    {
      icon: Sewnexlogo,
      title: "Sewnex",
      count:allTicketss.sewnex
    },
    {
      icon: Salonexlogo,
      title: "Salonex",
      count:allTicketss.salonex
    },
    {
      icon: SixNexlogo,
      title: "6Nexd",
      count:allTicketss.sixnexd
    },

  ]

  const homeCardData = [
    {
      icon: <TicketOpenIcon />,
      number: allTicketss?.opened || 0,
      title: "Open",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
    },
    {
      icon: <TicketInProgress />,
      title: "In progress",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss?.inprogress || 0,

    },
    {
      icon: <TicketPendingIcon />,
      title: "Resolved",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss.resolved || 0,

    },
    {
      icon: <TicketSolvedIcon />,
      title: "Closed",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss?.closed,

    },
  ];

  useEffect(() => {
    if (isModalOpen) {
      refreshContext({ tickets: true })
    } else {
      getTickets();
    }
  }, [isModalOpen])

  useEffect(()=>{
    getTickets()
  },[filter])



  return (
    <>
      <div className="text-[#303F58] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[#303F58] text-xl font-bold">Tickets</h1>
            <p className="text-ashGray text-sm max-sm:hidden">
              A record of a request or issue for tracking and resolution.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => {
            handleModalToggle()
            setEditId('')

          }}>
            <span className="text-xl font-bold">+</span>Create Tickets
          </Button>
        </div>

        <div className="grid grid-cols-2 ">
          <div className="">
            <Input
              type="date"
              value={filter.date}
              onChange={(e)=>setFilter((prev)=>({...prev,date:e.target.value}))}
              label="Filterd by Date"
              className="w-[60%] py-2 px-3 text-sm border rounded-[4px]  font-[400] h-9 text-[#495160]" />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-between pt-5">
  {filteredByPrd.map((item, index) => (
    <div
      key={index}
      onClick={() => handleProjectSelect(item.title)}
      className={`px-4 md:px-5 w-full md:w-fit h-12 rounded-2xl text-sm flex gap-2 items-center cursor-pointer ${
        filter.activeProject === item.title ? "bg-[#E2C5C5]" : "bg-white"
      }`}
    >
      {item.icon && <img src={item.icon} alt={item.title} className="w-5 h-5" />}
      <p>{item.title?item.title:'All'}</p>
      <p className="bg-[#ECD9D9] rounded-xl min-w-[2rem] h-7 px-2 flex items-center justify-center">
        <span>{item.count}</span>
      </p>
    </div>
  ))}
          </div>



        </div>


        

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2">
          {homeCardData?.map((card, index) => (
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
        <div className="col-span-9 w-[100%]">
          {/* Table Section */}
  
            <Table<TicketsData>
              data={filteredTickets && filteredTickets}
              columns={columns}
              headerContents={{
                title: "Ticket Details",
                search: { placeholder: "Search Tickets..." },
                sort:sort
              }}
              actionList={[
                { label: 'view', function: handleView },
                { label: 'edit', function: handleEdit },
              ]}
              from="ticket"
              loading={loading}
            />

         


        </div>

      </div>
      {/* Modal controlled by state */}
      <Modal className="w-[35%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen} onClose={handleModalToggle}>
        <CreateTickets editId={editId} onClose={handleModalToggle} />
      </Modal>
    </>
  );
}

export default TicketsHome;
