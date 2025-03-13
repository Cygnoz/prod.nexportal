import { useNavigate, useParams } from "react-router-dom"
import ChevronRight from "../../../assets/icons/ChevronRight"
import HomeCard from "../../../components/ui/HomeCards";
import RegionIcon from "../../../assets/icons/RegionIcon";
import { useEffect, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ViewOverflow from "./ViewOverflow";
import ViewSidebar from "./ViewSidebar";
import EmailIcon from "../../../assets/icons/EmailIcon";
import PencilLine from "../../../assets/icons/PencilLine";
import CalenderDays from "../../../assets/icons/CalenderDays";
import Video from "../../../assets/icons/Video";
import ClipboardPenLine from "../../../assets/icons/ClipboardPenLine";
import ViewActivities from "./ViewActivity/ViewActivities";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { LeadData } from "../../../Interfaces/Lead";
import { useResponse } from "../../../context/ResponseContext";
import Modal from "../../../components/modal/Modal";
import MailsForm from "./ViewModals/MailsForm";
import TasksForm from "./ViewModals/TasksForm";
import NotesForm from "./ViewModals/NotesForm";
import MeetingForm from "./ViewModals/MeetingForm";
import Boxes from "../../../assets/icons/Boxes";

type Props = {}

function LeadView({ }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const { id } = useParams()
  const { request: getLead } = useApi('get', 3001)
  const [leadData, setLeadData] = useState<LeadData>()
  const { setCustomerData } = useResponse()
  const homeCardData = [
    // { icon: <ComputerTick />, number: "Warm", title: "Leads Today", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },
    { icon: <RegionIcon />, number: "Website", title: "Lead Source", iconFrameColor: '#D786DD', iconFrameBorderColor: '#FADDFCCC' },
    { icon: <Boxes />, number: "CSTMID-0023", title: "Lead Id", iconFrameColor: '#FCB23E', iconFrameBorderColor: '#FDE3BBCC' },
    // { icon: <LeadScoreIcon />, number: "High", title: "Total Leads", iconFrameColor: '#51BFDA', iconFrameBorderColor: '#C1E7F1CC' },
  ];

  const tabs = ["Overview", "Activities"]
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState({
    email: false,
    note: false,
    meeting: false,
    task: false,
  });
  const handleModalToggle = (email = false, note = false, meeting = false, task = false,) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      email: email,
      note: note,
      meeting: meeting,
      task: task,
    }));
    
  }


  const dropdownOptions = [
    {
      label: "Email",
      icon: <EmailIcon size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(true, false, false, false)
    },
    {
      label: "Note",
      icon: <PencilLine size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, true, false, false)
    },
    {
      label: "Meeting",
      icon: <Video size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, false, true, false)
    },
    {
      label: "Task",
      icon: <CalenderDays size={14} color="#4B5C79" />,
      onClick: () => handleModalToggle(false, false, false, true)
    },
    {
      label: "Proposal",
      icon: <ClipboardPenLine size={14} color="#4B5C79" />,
      onClick: () => console.log('Proposal selected') // Placeholder for any specific functionality
    },
  ];

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  })

  const getOneLead = async () => {
    try {
      const { response, error } = await getLead(`${endPoints.LEAD}/${id}`);
      if (response && !error) {
        const Lead = response.data; // Return the fetched data
        console.log("Fetched Lead data:", Lead);
        setLeadData(Lead)
        setCustomerData(Lead)
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error('Error fetching Lead data:', error);
      }
    } catch (err) {
      console.error('Error fetching Lead data:', err);
    }
  };

console.log(leadData);



  useEffect(() => {
    getOneLead()
  }, [id]);

  const navigate = useNavigate()



  return (
    <div ref={topRef}>
      <div className="flex items-center text-[16px] space-x-2">
        <p onClick={() => navigate('/lead')} className="font-bold cursor-pointer text-[#820000] ">Lead</p>
        <ChevronRight color="#4B5C79" size={18} />
        <p className="font-bold text-[#303F58] ">{leadData?.firstName}{leadData?.lastName && leadData?.lastName}</p>
      </div>

      <div className="grid grid-cols-12 mt-5">
      <div className="col-span-12 md:col-span-3">
  <ViewSidebar getLead={getOneLead} leadData={leadData} />
</div>


        <div className="col-span-12 md:ms-4 md:col-span-9 ">
          {/* HomeCards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 py-2 mt-2">
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



<div className="flex flex-wrap justify-between mt-5">
  <div className="flex gap-5 text-base bg-[#FFFFFF] rounded-xl font-bold border-b border-gray-200 flex-wrap">
    {tabs.map((tab) => (
      <div
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`cursor-pointer py-3 px-[16px] ${activeTab === tab
          ? "text-[#303F58] border-b-2 border-deepStateBlue"
          : "text-gray-400"
          }`}
      >
        {tab}
      </div>
    ))}
  </div>

  <div className="relative mt-3 sm:mt-0 ">
    <Button variant="primary" size="sm" onClick={() => setDropdownOpen(!dropdownOpen)}>
      <span className="">+</span> New Activity
      <ChevronDown size={20} color="#FEFDF9" />
    </Button>
    {dropdownOpen && (
      <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg w-40">
        {dropdownOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-2 text-sm cursor-pointer border-[#DFDFDF] border-b hover:bg-gray-100"
            onClick={() => {
              option.onClick(); // Trigger modal toggle or specific handler
              setDropdownOpen(false); // Close dropdown after selection
            }}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </div>
        ))}
      </div>
    )}
  </div>
</div>


          {activeTab === "Overview" && (
            <ViewOverflow getOneLead={getOneLead} leadData={leadData} />
          )}

          {activeTab === "Activities" && (
            <ViewActivities leadData={leadData} />
          )}



        </div>
      </div>
      <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen.email} onClose={() => handleModalToggle()}>
        <MailsForm leadData={leadData} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal            className="w-[45%] max-sm:w-[90%] max-md:w-[70%] max-sm:h-[600px] sm:h-[500px] md:h-[500px]  max-sm:overflow-auto"
 open={isModalOpen.meeting} onClose={() => handleModalToggle()}>
        <MeetingForm onClose={() => handleModalToggle()} />
      </Modal>

      <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen.note} onClose={() => handleModalToggle()}>
        <NotesForm onClose={() => handleModalToggle()} />
      </Modal>

      <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen.task} onClose={() => handleModalToggle()}>
        <TasksForm onClose={() => handleModalToggle()} />
      </Modal>


    </div>
    
  )
}

export default LeadView