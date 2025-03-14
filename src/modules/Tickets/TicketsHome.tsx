import { useCallback, useEffect, useState } from "react";
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
import { useUser } from "../../context/UserContext";
import { useRegularApi } from "../../context/ApiContext";
import { useResponse } from "../../context/ResponseContext";
import { socket } from "../../context/SocketContext";
import HomeCard from "../../components/ui/HomeCards";
import TicketOpenIcon from "../../assets/icons/TicketOpenIcon";
import TicketInProgress from "../../assets/icons/TicketInProgress";
import TicketPendingIcon from "../../assets/icons/TicketPendingIcon";
import TicketSolvedIcon from "../../assets/icons/TicketSolvedIcon";
import Input from "../../components/form/Input";
import billbizlogo from '../../assets/image/bilbizzprdLogo.png'
import Sewnexlogo from '../../assets/image/SewnexLogo.png'
import Salonexlogo from '../../assets/image/Salonexlogo.png'
import SixNexlogo from '../../assets/image/sixNexdLogo.png'


type Props = {};

// Extend TicketsData to include the additional fields
interface TicketsData extends BaseTicketsData {
  name: string;
  timeAgo: string;
  openingDate: string;
  requestor: string
}

function TicketsHome({ }: Props) {
  const { user } = useUser()
  const { loading, setLoading } = useResponse()
  const { allTicketsCount, refreshContext } = useRegularApi()
  const unassignedTickets = allTicketsCount?.allUnassigned ?? 0;
  const unresolveTickets = allTicketsCount?.allTickets ?? 0
  const { request: getAllTickets } = useApi("get", 3004);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [filterWorking, setFilterWorking] = useState<boolean>(false)
  const navigate = useNavigate();
  const [allTicketss, setAllTicketss] = useState({
    unResolvedTickets: 0,
    resolvedTickets: 0,
    totalTickets: 0,
    unAssignedTickets: 0,
    closedTickets: 0
  });
  const [activeLabel, setActiveLabel] = useState<any>(null);

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
      const { response, error } = await getAllTickets(endPoints.GET_TICKETS);

      if (response && !error) {
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
          unResolvedTickets: response.data?.unresolvedTickets || 0,
          resolvedTickets: response.data?.solvedTickets || 0,
          unAssignedTickets: response.data?.unassignedTickets || 0,
          totalTickets: response.data?.totalTickets || 0,
          closedTickets: response.data?.closedTickets || 0
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




  useEffect(() => {
    if (unassignedTickets == 0) {
      getTickets()
      refreshContext({ tickets: true })
    }
  }, [unassignedTickets])


  const handleSort = useCallback(
    (type: string) => {
      let sortedTickets = [];
      setActiveLabel(type);
      setFilterWorking(false)
      setFilteredTickets(allTickets)
      switch (type) {
        case "Total Tickets":
          sortedTickets = allTickets; // All tickets
          break;
        case "Un Resolved Tickets":
          sortedTickets = allTickets.filter(ticket => ticket.status !== "Resolved" && ticket.status !== "Closed");
          break;
        case "Un Assigned Tickets":
          sortedTickets = allTickets.filter(
            ticket => !ticket.supportAgentId || ticket.supportAgentId === undefined
          );
          break;
        case "Resolved Tickets":
          sortedTickets = allTickets.filter(ticket => ticket.status === "Resolved");
          break;
        case "Closed Tickets":
          sortedTickets = allTickets.filter(ticket => ticket.status === "Closed");
          break;
        default:
          sortedTickets = allTickets;
      }

      setFilteredTickets(sortedTickets); // Update the filtered list
    },
    [allTickets] // Dependencies for the callback
  );

  useEffect(() => {

    if (!filterWorking) {
      if (user?.role !== "Support Agent" && unassignedTickets > 0) {
        handleSort("Un Assigned Tickets");
      } else if (user?.role === "Support Agent" && unresolveTickets > 0) {
        handleSort("Un Resolved Tickets");
      } else {
        handleSort('Total Tickets')
      }
    }

  }, [user?.role, unassignedTickets, unresolveTickets, handleSort]); // Add necessary dependencies

  useEffect(() => {
    const handleGetAllTickets = (allTick: any) => {
      console.log("tick", allTick);
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
    handleSort(activeLabel)
    setFilterWorking(true)
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

  console.log("filter", filteredTickets);


  const sort = {
    sortHead: "Sort",
    sortList: [
      {
        label: "Sort by Reque",
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

  // const ticketData = [
  //   { label: "Total Tickets", value: allTicketss?.totalTickets || 0 },
  //   { label: "Un Resolved Tickets", value: allTicketss?.unResolvedTickets || 0 },
  //   { label: "Un Assigned Tickets", value: allTicketss.unAssignedTickets || 0 },
  //   { label: "Resolved Tickets", value: allTicketss?.resolvedTickets || 0 },
  //   { label: "Closed Tickets", value: allTicketss?.closedTickets || 0 },
  // ];


  const filteredByPrd = [
    {
      title: "All",
    },
    {
      icon: billbizlogo,
      title: "BillBizz",
    },
    {
      icon: Sewnexlogo,
      title: "Sewnex",
    },
    {
      icon: Salonexlogo,
      title: "Salonex",
    },
    {
      icon: SixNexlogo,
      title: "SixNexd",
    },

  ]

  const homeCardData = [
    {
      icon: <TicketOpenIcon />,
      number: allTicketss?.totalTickets || 0,
      title: "Open",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
    },
    {
      icon: <TicketInProgress />,
      title: "Leads Today",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss?.unResolvedTickets || 0,

    },
    {
      icon: <TicketPendingIcon />,
      title: "Converted Leads",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss.unAssignedTickets || 0,

    },
    {
      icon: <TicketSolvedIcon />,
      title: "Leads Lost",
      iconFrameColor: "#DCACB1",
      iconFrameBorderColor: "#DCACB1",
      number: allTicketss?.closedTickets,

    },
  ];

  useEffect(() => {
    if (isModalOpen) {
      refreshContext({ tickets: true })
    } else {
      getTickets();
    }
  }, [isModalOpen])



  return (
    <>
      <div className="text-[#303F58] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[#303F58] text-xl font-bold">Tickets</h1>
            <p className="text-ashGray text-sm">
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

        <div className="grid grid-cols-2">
          <div className="">
            <Input
              type="date"
              label="Filterd by Date"
              className="w-[60%] py-2 px-3 text-sm border rounded-[4px]  font-[400] h-9 text-[#495160]" />
          </div>
          <div className="flex gap-2 justify-between pt-5">
            {
              filteredByPrd.map((item, index) => (
                <div key={index} className="bg-white px-5 h-12 rounded-2xl text-sm flex gap-2 items-center">
                  {
                    item.icon && <img src={item.icon} alt="" className="w-5 h-5" />
                  }
                  <p>{item.title}</p>
                </div>
              ))
            }
          </div>
        </div>


        <div className="grid grid-cols-12 gap-3">
          {/* <div className="col-span-3 cursor-pointer">
            {ticketData.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSort(item.label)}
                className={`flex justify-between py-4 px-3 ${item.label === activeLabel ? " bg-[#E7EDF2]" : ""}`}
              >
                <p>{item.label}</p>
                <p>{item.value}</p>
              </div>
            ))}
          </div> */}

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 mt-2">
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
          <div >
            <div className="flex justify-between p-3">
              <h1 className="text-xl font-bold">{activeLabel}</h1>
              <SortBy sort={sort} />
            </div>
            <Table<TicketsData>
              data={filteredTickets && filteredTickets}
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
              loading={loading}
            />

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
