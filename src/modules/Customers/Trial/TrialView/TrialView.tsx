import { useNavigate, useParams } from "react-router-dom";
import CalenderRound from "../../../../assets/icons/CalenderRound";
import ChevronRight from "../../../../assets/icons/ChevronRight";
import EditIcon from "../../../../assets/icons/EditIcon";
import EmailIcon from "../../../../assets/icons/EmailIcon";
import EmailRoundIcon from "../../../../assets/icons/EmailRoundIcon";
import PhoneRingIcon from "../../../../assets/icons/PhoneRingIcon";
import ViewRoundIcon from "../../../../assets/icons/ViewRoundIcon";
import profileImage from "../../../../assets/image/AvatarImg.png";
import BackgroundImage from "../../../../assets/image/LeadView.jpg";
import BuildingIcon from "../../../../assets/icons/BuildingIcon";
import Modal from "../../../../components/modal/Modal";
import TrialViewForm from "./TrialViewForm";
import { useEffect, useRef, useState } from "react";
// import ArrowRight from "../../../../assets/icons/ArrowRight"
import Button from "../../../../components/ui/Button";
import ExtentTrail from "./ExtentTrail";
import ConvertModal from "../../../../components/modal/ConvertionModal/CovertLicenser";
import ResumePauseTrail from "./ResumePauseTrail";
import rightArrow from "../../../../assets/image/right-arrow.png";
import CalenderModal from "./CalenderModal";
import DeActivateIcon from "../../../../assets/icons/DeActivateIcon";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import bgpicturee from "../../../../assets/image/resumeModalImg.png";
import CalenderPlus from "../../../../assets/icons/CalenderPlus";
import Pause from "../../../../assets/icons/Pause";
import ArrowBigDash from "../../../../assets/icons/ArrowBigDash";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import { useResponse } from "../../../../context/ResponseContext";
import CalenderClock from "../../../../assets/icons/CalenderClock";
import Timer from "../../../../assets/icons/Timer";
import Trash from "../../../../assets/icons/Trash";
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import toast from "react-hot-toast";
import NoRecords from "../../../../components/ui/NoRecords";
import NoImage from "../../../../components/ui/NoImage";
import { getStatusClass } from "../../../../components/ui/GetStatusClass";
import billbizzlogo from '../../../../assets/image/bilbizzprdLogo.png'
import LeadTrialProjectCardView from "../../../../components/ui/LeadTrialProectCardView";

type Props = {

};

const TrialView = ({ }: Props) => {
  // State to manage modal visibility
  const { request: getCustomerData } = useApi("get", 3001);
  const [isModalOpen, setIsModalOpen] = useState({
    editTrail: false,
    viewTrail: false,
    calender: false,
    confirm: false,
  });
  // const [editModalOpen, setEditModalOpen] = useState(false);
  const [extentModalOpen, setExtentModalOpen] = useState(false);
  const [conLicModalOpen, setConvLicModalOpen] = useState(false);
  const [pausModalOpen, setPausModalOpen] = useState(false);
  // const [calenderModalOpen, setCalenderModalOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { request: getTrial } = useApi("get", 3001);
  const { request: deleteTrail } = useApi('delete', 3001)
  const [trial, setTrial] = useState<any>([]);
  const handleScrollToTop = () => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const { setCustomerData, customerData } = useResponse();

  // Function to toggle modal visibility
  // const handleModalToggle = () => {
  //   setIsModalOpen((prev) => !prev);
  // };
  const handleModalToggle = (
    editTrail = false,
    viewTrail = false,
    calender = false,
    confirm = false
  ) => {
    setIsModalOpen((prevState) => ({
      ...prevState,
      editTrail,
      viewTrail,
      calender,
      confirm,
    }));
  };


  // const edtiModalToggle = () => {
  //   setEditModalOpen((prev) => !prev);
  // };

  const extentModalToggle = () => {
    setExtentModalOpen((prev) => !prev);
  };

  const covertModalToggle = () => {
    setConvLicModalOpen((prev) => !prev);
  };

  const pauseModalToggle = () => {
    setPausModalOpen((prev) => !prev);
  };

  // const calenderModalToggle = () => {
  //   setCalenderModalOpen((prev) => !prev);
  // };

  const { id } = useParams();
  function calculateDuration(endDate: any) {
    // Parse the date strings into Date objects
    const start: any = new Date();
    const end: any = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date format. Please use YYYY-MM-DD.";
    }

    // Ensure the end date is after or equal to the start date
    if (end < start) {
      return "End date must be after or the same as the start date.";
    }

    // Calculate the duration in days
    const durationInMilliseconds = end - start;
    const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);

    setCustomerData((prev: any) => ({ ...prev, duration: durationInDays.toFixed() }))
  }

  const getOneTrial = async () => {
    try {
      const { response, error } = await getTrial(
        `${endPoints.GET_TRIAL}/${customerData?.organizationId}`
      );
      if (response && !error) {
        const Trial = response.data; // Return the fetched data
        console.log("Fetched Trail data:", Trial);
        setTrial(Trial);
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Lead data:", error);
      }
    } catch (err) {
      console.error("Error fetching Lead data:", err);
    }
  };
  console.log(customerData);
  

  const getCustomer = async () => {
    try {
      const { response, error } = await getCustomerData(
        `${endPoints.LEAD}/${id}`
      );
      if (response && !error) {
        const Lead = response.data; // Return the fetched data
        console.log("Fetched Customer data:", Lead);
        setCustomerData(response.data);
        calculateDuration(response.data.endDate)
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Lead data:", error);
      }
    } catch (err) {
      console.error("Error fetching Lead data:", err);
    }
  };


  useEffect(() => {
    getCustomer();
  }, [id]);

  useEffect(() => {
    getOneTrial();
  }, [customerData])


  const handleDelete = async () => {
    try {
      const { response, error } = await deleteTrail(`${endPoints.LEAD}/${id}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/trial");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the trail.");
    }
  };

  const AreaRevData = [
    { name: "Area 001", pv: 74479, color: "#4caf50" }, // Green
    { name: "Area 002", pv: 56335, color: "#2196f3" }, // Blue
    { name: "Area 003", pv: 43887, color: "#ff9800" }, // Orange
    { name: "Area 004", pv: 19027, color: "#f44336" }, // Red
    { name: "Area 005", pv: 8142, color: "#9c27b0" }, // Purple
    { name: "Area 006", pv: 4918, color: "#3f51b5" }, // Blue
  ];

  const CustomizedAxisTick = ({ x, y, payload }: any) => {
    // Find the corresponding logo for the country

    return (
      <g transform={`translate(${x},${y})`}>
        <text y={2} fontSize={14} dy={3} textAnchor="end" fill="#666">
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomLabel = ({ x, y, width, value }: any) => (
    <text
      x={x + width + 10}
      y={y + 13}
      fontSize={10}
      textAnchor="start"
      fill="#000"
    >
      {value}
    </text>
  );

  const navigate = useNavigate();


  

  let data: any = {}
  data = { trial, customerData }


  const { request: getAllActivityTimeline } = useApi('get', 3001)
  const [activityData, setActivityData] = useState<any[]>([])

  const getActivityTimeline = async () => {
    try {
      const { response, error } = await getAllActivityTimeline(`${endPoints.ACTIVITY_TIMELINE}/${id}`)
      console.log(response, 'res');
      console.log(error, 'err');
      if (response && !error) {
        console.log(response.data);
        setActivityData(response.data.activities)
      }
      else {
        console.log(error.response.data.message);

      }

    }
    catch (err) {
      console.log(err, 'error');

    }
  }
  useEffect(() => {
    getActivityTimeline()
  }, [])


 

  return (
    <div>
      <div
        ref={mainContainerRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          position: "relative",
        }}
        className="mb-2 hide-scrollbar"
      >
        <div className="flex items-center text-[16px] space-x-2">
          <p
            onClick={() => navigate("/trial")}
            className="font-bold cursor-pointer text-[#820000] "
          >
            Trial
          </p>
          <ChevronRight color="#4B5C79" size={18} />
          <p className="font-bold text-[#303F58] ">{customerData?.firstName}</p>
        </div>

        {customerData?.trialStatus==="Hold" && (
          <div className="bg-[#F3E6E6] relative rounded-lg mt-2 ">
            <img
              className="h-24 w-48 top-4  right-7  absolute"
              src={bgpicturee}
              alt=""
            />
            <div className="p-3 flex justify-between">
              <div className="p-2">
                <h1 className="bg-gray-500 p-1 rounded-lg text-white text-xs font-semibold">
                  Trial On Hold
                </h1>
              </div>
              <div className="justify-end">
                <button
                  onClick={pauseModalToggle}
                  type="button"
                  className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900 me-auto"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="flex p-2">
              <h1 className="mt-2 ml-2">
                This trial is currently paused. No activities are allowed until
                resumed
              </h1>
              <Button onClick={pauseModalToggle} className="ml-96 h-10 -mt-2">
                Resume Trial
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 mt-5 gap-4">
          <div className="col-span-12 md:col-span-3 w-full ">
            <div
              className="h-fit w-full bg-cover rounded-xl p-6"
              style={{ backgroundImage: `url(${BackgroundImage})` }}
            >
              <div className="flex justify-end">
                <div className={`${getStatusClass(customerData?.trialStatus)}  flex items-center gap-2  w-fit ms-auto `}>
                  <div className={`w-2 h-2 -mt-[2px] ${customerData?.trialStatus == 'In Progress' || customerData?.trialStatus == 'Proposal' ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                  <p className="text-sm">{customerData?.trialStatus}</p>
                </div>
              </div>
              <div className="flex gap-4">
                {/* <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img
                    src={customerData?.image && customerData?.image > 20 ? customerData?.image : profileImage} // Replace with the actual image URL
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div> */}
                 
              {customerData?.image?.length > 50 ? (
                <img
                  src={customerData?.image} // Replace with the actual image URL
                  alt="Profile"
                  className=" object-cover w-10 h-10 rounded-full "
                />
              ) : (
                // <p className="w-full h-full    bg-black rounded-full flex justify-center items-center">
                //   <UserIcon color="white" size={35} />
                // </p>
                <NoImage iconSize={25} roundedSize={40}/>
              )}
           
                <div className="mb-3 ">
                  <p className="text-[#FFFFFF] text-xs font-semibold mb-3">
                    {customerData?.firstName}
                  </p>
                  <p className="text-[#FFFFFF] text-xs font-normal">

                    <span className="text-xs font-bold ">{customerData?.customerId}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 my-4 ">
                <BuildingIcon color="#FFFFFF" size={16} />
                <span className="text-[#FFFFFF] text-xs font-normal">
                  Organization
                </span>
                <div className="w-2 h-2 rounded-full mt-1 bg-white"></div>
                <span className="text-[#FFFFFF] text-xs font-normal">
                  {customerData?.organizationName}
                </span>
              </div>
              <div className="flex gap-4 my-4 ">
                <BuildingIcon color="#FFFFFF" size={16} />
                <span className="text-[#FFFFFF] text-xs font-normal">
                  Organization Id
                </span>
                <div className="w-2 h-2 rounded-full mt-1 bg-white"></div>
                <span className="text-[#FFFFFF] text-xs font-normal">
                  {customerData?.organizationId}
                </span>
              </div>

              <div className="my-8">
                <div className="flex gap-4 my-4 ">
                  <EmailIcon color="#FFFFFF" size={16} />
                  <p className="text-[#FFFFFF] text-xs font-normal">
                    {customerData?.email}
                  </p>
                </div>
                <div className="flex gap-4 mb-2">
                  <PhoneRingIcon color="#FFFFFF" size={16} />
                  <p className="text-[#FFFFFF] text-xs font-normal">
                    {customerData?.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 my-4 ">
                <CalenderClock color="#FFFFFF" size={16} />
                <span className="text-[#FFFFFF] text-xs font-normal">
                  Start Date
                </span>
                <div className="w-2 h-2 rounded-full mt-1 bg-white"></div>
                <span className="text-[#FFFFFF] text-xs font-normal">
                  {new Date(customerData?.startDate).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex gap-4 my-4 ">
                <CalenderClock color="#FFFFFF" size={16} />
                <span className="text-[#FFFFFF] text-xs font-normal">
                  End Date
                </span>
                <div className="w-2 h-2 rounded-full mt-1 bg-white"></div>
                <span className="text-[#FFFFFF] text-xs font-normal">
                  {new Date(customerData?.endDate).toLocaleDateString("en-GB")}
                </span>
              </div>

              <div className="flex gap-4 my-4  p-2 w-48 rounded-xl mt-7 bg-[#34B8A4]">
                <Timer color="#FFFFFF" size={16} />
                <span className="text-[#FFFFFF] text-xs font-normal">
                  Duration
                </span>
                <div className="w-2 h-2 rounded-full mt-1 bg-white"></div>
                <span className="text-[#FFFFFF] text-xs font-normal">
                  {customerData?.duration} Days
                </span>
              </div>

              <div className="my-4 mt-7">
                <div className="flex gap-4  my-3">
                  <p className="text-[#FFFFFF] text-xs font-normal">Region</p>
                  <p className="text-[#FFFFFF] text-xs font-bold">{customerData?.regionDetails?.regionName}</p>
                </div>
                <div className="flex gap-4 mb-4 ">
                  <p className="text-[#FFFFFF] text-xs font-normal">Area</p>
                  <p className="text-[#FFFFFF] text-xs font-bold ms-3">{customerData?.areaDetails?.areaName}</p>
                </div>
              </div>
              <LeadTrialProjectCardView projectName={customerData?.project}/>
              <div className="flex w-full justify-around  h-20 px-6 py-4 gap-5 rounded-xl bg-[#FFFFFF33]">
                <div>
                  <div className="rounded-full cursor-pointer bg-[#C4A25D4D] h-9 w-9 border border-white">
                    <div className="ms-2 mt-2">
                      <EmailRoundIcon size={18} color="#F0D5A0" />
                    </div>
                  </div>

                  <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">
                    Email
                  </p>
                </div>
                {/* <div onClick={() => handleModalToggle(true, false, false, false)}>
                <div className="rounded-full cursor-pointer bg-[#C4A25D4D] h-9 w-9 border border-white">
                  <div className="ms-2 mt-2">
                    <EditIcon size={18} color="#F0D5A0" />
                  </div>
                </div>
                <p className="text-[#FFF9F9] text-[10px] font-medium mt-1 ms-2">
                  Edit
                </p>
              </div> */}
                <div onClick={() => handleModalToggle(false, true, false, false)}>
                  <div className="rounded-full cursor-pointer bg-[#C4A25D4D] h-9 w-9 border border-white">
                    <div className="ms-2 mt-2">
                      <ViewRoundIcon size={18} color="#B6D6FF" />
                    </div>
                  </div>
                  <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">
                    View
                  </p>
                </div>
                <div >
                  <div className="rounded-full cursor-pointer ms-2  bg-[#C4A25D4D] h-9 w-9 border border-white">
                    <div className="ms-2 mt-2">
                      <DeActivateIcon size={18} color="#D52B1E4D" />
                    </div>
                  </div>
                  <p className="text-[#FFF9F9] text-center text-[10px] font-medium mt-1">
                    DeActivate
                  </p>
                </div>

                <div onClick={() => handleModalToggle(false, false, false, true)} className="cursor-pointer">
                  <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                    <div className="ms-2 mt-2">
                      <Trash size={18} color="red" />
                    </div>
                  </div>
                  <p className="text-[#FFF9F9] text-[10px] font-medium mt-1">
                    Delete
                  </p>
                </div>
              </div>
              <div
                onClick={() => handleModalToggle(false, false, true, false)}
                className="flex gap-2 rounded-xl w-full justify-center cursor-pointer  bg-[#FFFFFF33]  py-3 px-2 h-14 my-4"
              >
                <div className="px-2 ">
                  <CalenderRound size={32} />
                </div>
                <p className="mt-2 text-[#FFFFFF] text-xs font-medium">
                  View Calender
                </p>
              </div>

              <div className="grid grid-cols-2 cursor-pointer gap-2 my-2">
                <div className="w-full " onClick={extentModalToggle}>
                  <Button
                    className="w-full h-10 flex justify-center"
                    variant="tertiary"
                  >
                    <CalenderPlus size={16} color="#4B5C79" />
                    <p className="text-#565148 font-medium text-xs">
                      Extent Trial
                    </p>
                  </Button>
                </div>
                <div className="w-full" onClick={pauseModalToggle}>
                  <Button
                    className="w-full h-10 flex justify-center"
                    variant="secondary"
                  >
                    {customerData?.trialStatus==="Hold" ? (
                      <ArrowBigDash size={16} />
                    ) : (
                      <Pause size={16} />
                    )}
                    <p className="text-#585953 font-medium text-xs">
                      {customerData?.trialStatus==="Hold" ? "Resume" : "Pause"} Trial
                    </p>
                  </Button>
                </div>
              </div>

              <div
                className="rounded-lg w-full mt-4  bg-[#820000] h-12 py-3 px-3 mb-4 cursor-pointer"
                onClick={covertModalToggle}
              >
                <p className="text-center text-[#FEFDF9] text-base font-medium">
                  Converted to Licenser
                </p>
              </div>
              <hr />
              <div className="p-4">
                <p className="text-[#FFFFFF] text-xs font-normal mb-2">
                  Assigned BDA
                </p>
                <div className="flex gap-2">
                  <div className="rounded-full w-7 h-7 overflow-hidden">
                    <img src={profileImage} alt="" />
                  </div>
                  <p className="text-[#FFFFFF] text-xs font-bold py-2 px-1">
                    {customerData?.bdaDetails?.bdaName ? customerData?.bdaDetails?.bdaName : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 w-full md:h-[60%]  rounded-lg p-5 gap-5 bg-[#FFFFFF]">
            <h1 className="text-lg font-bold">Recent Activities</h1>
            {activityData.length > 0 ? (
              activityData.map((timeline: any) => (
                <div className="bg-[#F5F9FC] p-5 rounded-lg my-4">
                  <div className="ml-24 my-1 text-sm font-bold">
                    <p>{timeline?.description ? timeline?.description : 'N/A'}t</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="mt-2 w-11 h-11 bg-[#EBEFF4] rounded-full">
                      <img
                        className="w-6 h-6 ms-3 mt-[25%]"
                        src={rightArrow}
                        alt=""
                      />
                    </div>
                    <div className="w-3 h-3 mt-3 ml-6 bg-[#C8C8C8] rounded-full shadow-md"></div>

                    <div className="flex gap-2 mt-2 -ml-2">
                      <EditIcon size={20} />
                      <div className="w-32 h-8 p-2 bg-[#FFFFFF] flex -mt-2 rounded-2xl">
                        <div className="rounded-full w-5 h-5 overflow-hidden">
                          <img src={profileImage} alt="" />
                        </div>
                        <p className="text-[#4B5C79] text-xs font-medium ml-1">
                          {timeline?.userName ? timeline?.userName : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="w-3 h-3 mt-3 -ml-4 bg-[#C8C8C8] rounded-full shadow-md"></div>
                    <div className="mt-2 -ml-2">
                      <p className="text-[#4B5C79] text-xs font-medium">
                        {new Date(timeline?.createdAt).toLocaleString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="ms-24 -mt-1">
                    <p className="text-[#4B5C79] text-xs font-medium">
                      Details{" "}
                      <span className="text-[#4B5C79] text-sm font-bold">
                        {timeline?.taskTitle ? timeline?.taskTitle : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              ))) : (
              <div className="items-center">
                <NoRecords text="No Activities Found" parentHeight="450px" imgSize={90} textSize="md" />
              </div>
            )}


         
          </div>

          <div className="col-span-12 md:col-span-4">
  <div className="bg-white rounded-lg w-full p-3">
    <h1 className="text-lg font-bold mb-2">Feature Usage Progress</h1>

    <div className="ms-1">
      <ResponsiveContainer   width="100%" height={470}>
        <BarChart
          data={AreaRevData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <YAxis
            type="category"
            dataKey="name"
            tick={<CustomizedAxisTick />}
            tickLine={false}
            axisLine={{ stroke: "#000" }} // Y axis line
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: "transparent" }} // Remove X axis line
            tickLine={false} // Remove ticks on the X axis
          />
          <Tooltip />
          <Bar
            dataKey="pv"
            radius={[5, 5, 5, 5]}
            barSize={20}
            label={<CustomLabel />}
          >
            {AreaRevData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry?.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

        </div>

       

        <Modal
          open={isModalOpen.viewTrail}
          onClose={() => handleModalToggle()}
         className="w-[35%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto"
        >
          <TrialViewForm trialData={customerData} onClose={() => handleModalToggle()} />
        </Modal>


      
        <Modal
          open={extentModalOpen}
          align="center"
          onClose={extentModalToggle}
          className="w-[35%] max-sm:w-[90%] max-md:w-[70%] "
        >
          <ExtentTrail getCutomer={getCustomer} trialData={data} onClose={extentModalToggle} />
        </Modal>

        {/* Modal controlled by state */}
        <Modal
          open={conLicModalOpen}
          align="center"
          onClose={covertModalToggle}
          className="w-[30%]"
        >
          <ConvertModal  orgData={trial} onClose={covertModalToggle} type="trial" />
        </Modal>

        {/* Modal controlled by state */}
        <Modal
          open={pausModalOpen}
          align="center"
          onClose={pauseModalToggle}
          className="w-[35%] max-sm:w-[90%] max-md:w-[70%] "
        >
          <ResumePauseTrail
            handleScrollTop={handleScrollToTop}
            trialStatus={customerData?.trialStatus}
            onClose={pauseModalToggle}
          />
        </Modal>

        {/* Modal controlled by state */}
        <Modal
          open={isModalOpen.calender}
          align="center"
          onClose={() => handleModalToggle()}
           className="w-[65%] max-sm:w-[90%] max-md:w-[70%] max-sm:h-[500px] sm:h-[500px] md:h-[600px]  max-sm:overflow-auto"
        >
          <CalenderModal onClose={() => handleModalToggle()} />
        </Modal>
        <Modal
          open={isModalOpen.confirm}
          align="center"
          onClose={() => handleModalToggle()}
          className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
        >
          <ConfirmModal
            action={handleDelete}
            prompt="Are you sure want to delete this trial?"
            onClose={() => handleModalToggle()}
          />
        </Modal>

      </div>
    </div>

  );
};

export default TrialView;
