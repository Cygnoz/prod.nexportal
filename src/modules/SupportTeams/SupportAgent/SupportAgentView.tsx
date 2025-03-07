import { useEffect, useRef, useState } from "react";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import ChevronRight from "../../../assets/icons/ChevronRight";
import EscalatedTicket from "../../../assets/icons/EscalatedTicket";
import TicketCardIcon from "../../../assets/icons/TicketCardIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import HomeCard from "../../../components/ui/HomeCards";
import GraphHomeView from "./GraphHomeView";
import ViewHeader from "./ViewHeader";
import ViewHomwTable from "./ViewHomwTable";
import { endPoints } from "../../../services/apiEndpoints";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../../Hooks/useApi";

type Props = {
  staffId?:string
};

const SupportAgentView = ({staffId}: Props) => {
 
  const topRef = useRef<HTMLDivElement>(null);
    const {id}=useParams()
    const iId=staffId?staffId:id
      useEffect(() => {
        // Scroll to the top of the referenced element
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }, []);

      const { request: getInsideSADetails } = useApi('get', 3003);

const [tickets, setTickets] = useState({ openTickets: [], closedTickets: [] });
const [ticketsResolved, setTicketsResolved] = useState(0);
const [totalTickets, setTotalTickets] = useState(0);

const getInsideSA = async () => {
  try {
    const { response, error } = await getInsideSADetails(`${endPoints.SUPPORT_AGENT}/${iId}/details`);

    if (response && !error) {
      console.log(response.data);

      // Extract rewards and tickets
      const {  tickets, ticketsResolved, totalTickets } = response.data;

      // Set state for rewards and tickets
      setTickets(tickets || { openTickets: [], closedTickets: [] });
      setTicketsResolved(ticketsResolved || 0);
      setTotalTickets(totalTickets || 0);
    } else {
      console.log(error.response.data.message);
    }
  } catch (err) {
    console.log(err, "error");
  }
};

useEffect(() => {
  getInsideSA();
}, []);







  // Data for HomeCards
  const viewCardData = [
    {
      icon: <TicketCardIcon size={40} />,
      number: totalTickets, // Use totalTickets from state
      title: "Total Tickets",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <AreaManagerIcon />,
      number: tickets.openTickets.length, // Use the count of open tickets
      title: "Open Tickets",
      iconFrameColor: "#F9A51A",
      iconFrameBorderColor: "#FFF2DDCC",
    },
    {
      icon: <UserIcon />,
      number: ticketsResolved, // Use ticketsResolved from state
      title: "Resolved Tickets",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <EscalatedTicket />,
      number: tickets.closedTickets.length, // Use the count of closed tickets
      title: "Closed Tickets",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
  ];
  
  const { request: getaSA } = useApi("get", 3003);
  const [getData, setGetData] = useState<{
    saData: any;
  }>({ saData: [] });

  const getASA = async () => {
    try {
      const { response, error } = await getaSA(
        `${endPoints.SUPPORT_AGENT}/${iId}`
      );
      if (response && !error) {
        console.log("sdddd",response.data);
        
        setGetData((prevData) => ({
          ...prevData,
          saData: response.data,
        }));
      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };
  useEffect(() => {
    getASA();
  }, [iId]);

  const navigate=useNavigate()
  
  return (
    <div ref={topRef}>
      <div className="flex items-center text-[16px] my-2 space-x-2">
        <p onClick={()=>navigate('/support-agent')}  className="font-bold cursor-pointer text-[#820000] ">Support Agent</p>
        <ChevronRight color="#4B5C79" size={18} />
        <p className="font-bold text-[#303F58] ">
          {getData.saData?.user?.userName
            ? getData.saData?.user?.userName
            : "N/A"}
        </p>
      </div>
      <div>
        <ViewHeader id={iId}/>
      </div>

      {/* HomeCards Section */}
      <div className="flex gap-3 py-2 justify-between mt-6">
        {viewCardData.map((card, index) => (
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
      <div>
        <ViewHomwTable id={iId} getData={getData} tickets={tickets}  />
      </div>

      {/* Graph & feedback */}
      <div>
        <GraphHomeView id={iId} getData={getData}/>
      </div>
    </div>
  );
};

export default SupportAgentView;
