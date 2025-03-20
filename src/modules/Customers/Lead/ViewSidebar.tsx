import { useEffect, useState } from "react";
// import CalenderRound from "../../../assets/icons/CalenderRound";
import DeltaTech from "../../../assets/icons/DeltaTech";
import EditIcon from "../../../assets/icons/EditIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import EmailRoundIcon from "../../../assets/icons/EmailRoundIcon";
import PhoneRingIcon from "../../../assets/icons/PhoneRingIcon";
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon";
import profileImage from "../../../assets/image/AvatarImg.png";
import BackgroundImage from "../../../assets/image/LeadView.jpg";
import Modal from "../../../components/modal/Modal";
// import LeadViewInfo from "./View/LeadViewInfo"
import UserIcon from "../../../assets/icons/UserIcon";
import ConvertModal from "../../../components/modal/ConvertionModal/CovertLicenser";
import LeadForm from "./LeadForm";
import LeadViewInfo from "./ViewModals/LeadViewInfo";
// import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { VictoryLabel, VictoryPie, VictoryTheme } from "victory";
import Trash from "../../../assets/icons/Trash";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import Calender from "./ViewModals/Calender";
import { getStatusClass } from "../../../components/ui/GetStatusClass";
import NoRecords from "../../../components/ui/NoRecords";
import LeadTrialProjectCardView from "../../../components/ui/LeadTrialProectCardView";
type Props = {
  leadData: any;
  getLead: () => void;
};

const ViewSidebar = ({ leadData, getLead }: Props) => {
  const { request: deleteLead } = useApi("delete", 3001);
  const { request: breakDownByRegion } = useApi('get', 3001);
  const [breakDownData, setBreakDownData] = useState(null);
  const [piechartData, setPiechartData] = useState<{ x: string; y: number; color: string }[]>([]);
  const { request: getAllActivityTimeline } = useApi('get', 3001);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState({
    editLead: false,
    viewLead: false,
    calender: false,
    confirm: false,
  });
  const [convLicModalOpen, setConvLicModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleModalToggle = (
    editLead = false,
    viewLead = false,
    calender = false,
    confirm = false
  ) => {
    setIsModalOpen((prevState) => ({
      ...prevState,
      editLead,
      viewLead,
      calender,
      confirm,
    }));

    if (getLead) getLead(); // Safeguard
  };

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const { response, error } = await getAllActivityTimeline(`${endPoints.ACTIVITY_TIMELINE}/${leadData?._id}`);
        console.log('activityleee',response);
        console.log('err',error);
        
        if (response && !error) {
          setActivityData(response.data.activities || []);
        } else {
          console.error('API Error:', error.response?.data?.message || error.message);
          window.location.reload(); // Refresh page to fetch data again
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        window.location.reload(); // Refresh page to fetch data again
      }
    };
  
    fetchTimelineData();
  }, [leadData?._id]);

  // const roles = [
  //   { name: "Chats", count: 50, color: "#1B6C75" },
  //   { name: "Meetings", count: 30, color: "#30B777" },
  //   { name: "Calls", count: 80, color: "#6ABAF3" },
  //   { name: "Email", count: 65, color: "#00B5B5" },
  // ];

  // const pieData = roles.map((role) => ({
  //   x: role.name,
  //   y: role.count,
  //   color: role.color,
  // }));

  const covertModalToggle = () => {
    setConvLicModalOpen((prev) => !prev);
  };



  const handleDelete = async () => {
    try {
      const { response, error } = await deleteLead(`${endPoints.LEAD}/${leadData._id}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/lead");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the lead.");
    }
  };


  const getBreakDownRegion = async () => {
    try {
      const { response, error } = await breakDownByRegion(`${endPoints.LEADS}/${leadData?._id}`);
      // console.log("id", leadData?._id);
      //console.log("response", response);
      // console.log("err", error);

      if (response && !error) {
        // console.log(response.data);

        setBreakDownData(response.data.engagementData);

        // Convert engagementData to pieData format
        const transformedData = Object.entries(response.data.engagementData)
          .map(([key, value], index) => ({
            x: key,
            y: value as number, // Explicitly casting value as number
            color: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"][index % 4], // Assign colors dynamically
          }))
          .filter((item) => item.y > 0); // Remove entries with 0 value

        // console.log("transformedData", transformedData);
        setPiechartData(transformedData);
      } else {
        console.log(error.message);
      }
    } catch (err) {
      console.error("error message", err);
    }
  };


  useEffect(() => {
    if (leadData) {
      getBreakDownRegion();
    }
  }, [leadData]);


  console.log(breakDownData);


  return (
    <>
      <div className="space-y-4 mb-2">
        <div className="space-y-4 mb-2">
          <div className="h-fit w-full bg-cover rounded-xl p-6" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className={`${getStatusClass(leadData?.leadStatus)} flex items-center gap-2 w-fit ms-auto`}>
              <div className={`w-2 h-2 -mt-[2px] ${leadData?.leadStatus == "In progress" || leadData?.leadStatus == "Proposal" ? "bg-black" : "bg-white"} rounded-full`}></div>
              <p className="text-sm">{leadData?.leadStatus}</p>
            </div>

            <div className="flex gap-4 w-full flex-wrap">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                {leadData?.image?.length > 50 ? (
                  <img src={leadData?.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <p className="w-full h-full bg-black rounded-full flex justify-center items-center">
                    <UserIcon color="white" size={35} />
                  </p>
                )}
              </div>
              <div className="mb-3 mt-3">
                <p className="text-[#FFFFFF] text-xs font-semibold mb-3">{leadData?.firstName} {leadData?.lastName && leadData?.lastName}</p>
                <p className="text-[#FFFFFF] text-xs font-normal">Lead ID <span className="text-xs font-bold ms-3">{leadData?.customerId}</span></p>
              </div>
            </div>

            <div className="flex gap-4 my-4">
              <EmailIcon color="#FFFFFF" size={16} />
              <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.email ? leadData?.email : 'N/A'}</p>
            </div>
            <div className="flex gap-4 mb-2">
              <PhoneRingIcon color="#FFFFFF" size={16} />
              <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.phone}</p>
            </div>
            <div className="flex gap-4 mb-2">
              <DeltaTech size={16} />
              <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.companyName ? leadData.companyName : "N/A"}</p>
            </div>

            <div className="flex gap-4 my-4">
              <p className="text-[#FFFFFF] text-xs font-normal">Region</p>
              <p className="text-[#FFFFFF] text-xs font-bold">{leadData?.regionDetails?.regionName || "N/A"}</p>
            </div>
            <div className="flex gap-4 mb-4">
              <p className="text-[#FFFFFF] text-xs font-normal">Area</p>
              <p className="text-[#FFFFFF] text-xs font-bold">{leadData?.areaDetails?.areaName || "N/A"}</p>
            </div>
           <LeadTrialProjectCardView projectName={leadData?.project}/>
            <div className="flex w-full justify-between h-20 px-6 py-4 gap-6 rounded-xl bg-[#FFFFFF33]">
              <div>
                <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                  <div className="ms-2 mt-2">
                    <EmailRoundIcon size={18} color="#F0D5A0" />
                  </div>
                </div>
                <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">Email</p>
              </div>
              <div className="cursor-pointer" onClick={() => handleModalToggle(true, false, false, false)}>
                <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                  <div className="ms-2 mt-2">
                    <EditIcon size={18} color="#F0D5A0" />
                  </div>
                </div>
                <p className="text-[#FFF9F9] text-[10px] font-medium mt-1 ms-2">Edit</p>
              </div>
              <div onClick={() => handleModalToggle(false, true, false, false)}>
                <div className="cursor-pointer">
                  <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                    <div className="ms-2 mt-2">
                      <ViewRoundIcon size={18} color="#B6D6FF" />
                    </div>
                  </div>
                </div>
                <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">View</p>
              </div>
              <div onClick={() => handleModalToggle(false, false, false, true)} className="cursor-pointer">
                <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                  <div className="ms-2 mt-2">
                    <Trash size={18} color="red" />
                  </div>
                </div>
                <p className="text-[#FFF9F9] text-[10px] font-medium mt-1">Delete</p>
              </div>
            </div>

            {/* <div onClick={() => handleModalToggle(false, false, true, false)} className="flex gap-2 rounded-xl bg-[#FFFFFF33] w-full justify-center cursor-pointer py-3 px-2 h-14 my-4">
              <div className="px-2">
                <CalenderRound size={32} />
              </div>
              <p className="mt-2 text-[#FFFFFF] text-xs font-medium">View Calender</p>
            </div> */}

            {leadData?.leadStatus === "Won" && (
              <div className="rounded-lg cursor-pointer w-full bg-[#820000] h-12 py-3 px-3 mb-4" onClick={covertModalToggle}>
                <p className="text-center text-[#FEFDF9] text-base font-medium">Converted to Trail</p>
              </div>
            )}
            <hr className="mt-3"/>

            <div className="p-4 ">
              <p className="text-[#FFFFFF] text-xs font-normal mb-2">Assigned BDA</p>
              <div className="flex gap-2">
                <div className="rounded-full w-7 h-7 overflow-hidden">
                  <img src={profileImage} alt="" />
                </div>
                <p className="text-[#FFFFFF] text-xs font-bold py-2 px-1">{leadData?.bdaDetails?.bdaName || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="bg-white h-fit pb-7 rounded-lg w-full p-3">
          <h1 className="text-[#303F58] text-lg font-bold p-3">Top Breakdown By Region</h1>
          <div className="-mt-3">
            {piechartData.length > 0 ? (
              <>
                <VictoryPie
                  innerRadius={40}
                  padAngle={4}
                  width={300}
                  data={piechartData}
                  theme={VictoryTheme.clean}
                  labels={({ datum }) =>
                    `${((datum.y / piechartData.reduce((acc, item) => acc + item.y, 0)) * 100).toFixed(1)}%`
                  }
                  labelComponent={<VictoryLabel style={{ fill: "#303F58", fontSize: 15 }} />}
                  style={{
                    data: {
                      fill: ({ datum }) => datum.color,
                    },
                  }}
                />
                <div className="flex justify-center mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:w-full w-72 gap-3">
                      {piechartData.map((item) => (
                        <div key={item.x} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-800 font-medium text-xs">{item.x}</span>
                          <span className="ml-auto text-gray-600 text-xs">{item.y}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <NoRecords text="No Records Found" parentHeight="320px" />
            )}
          </div>
        </div>


        {/* Modal controlled by state */}
      </div>
      <Modal
        open={isModalOpen.viewLead}
        onClose={() => handleModalToggle()}
         className="w-[35%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto"
      >
        <LeadViewInfo leadData={leadData} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.editLead}
        onClose={() => handleModalToggle()}
        className="w-[60%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto"
      >
        <LeadForm editId={leadData?._id} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.calender}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[65%] max-sm:w-[90%] max-md:w-[70%] max-sm:h-[500px] sm:h-[500px] md:h-[600px]  max-sm:overflow-auto"
      >
        <Calender data={activityData} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal
        open={convLicModalOpen}
        align="center"
        onClose={covertModalToggle}
           className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConvertModal onClose={covertModalToggle} type="lead" />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
          className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this lead?"
          onClose={() => handleModalToggle()}
        />
      </Modal>
    </>
  );
};

export default ViewSidebar;