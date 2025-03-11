import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";
import EditIcon from "../../../assets/icons/EditIcon";
import Trash from "../../../assets/icons/Trash";
import UserIcon from "../../../assets/icons/UserIcon";
import region from "../../../assets/image/Ellipse 14 (1).png";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import Modal from "../../../components/modal/Modal";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import AreaForm from "./AreaForm";
import LeadAndLisence from "./LeadAndLisence";
import ResendActivity from "./RecentActivity";
import TeamOverview from "./TeamOverview";
import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon";
import { useUser } from "../../../context/UserContext";

type Props = {};

const AreaView = ({ }: 
  Props) => {
    const {user}=useUser()
  user?.role

  const { request: deleteArea } = useApi('delete', 3003)
  const topRef = useRef<HTMLDivElement>(null);
  const { request: getActivities } = useApi("get", 3003);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [activityloading, setActivityLoading] = useState<boolean>(true);

  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const { id } = useParams();
  const navigate = useNavigate()
  const { request: getArea } = useApi('get', 3003)
  const { request: deactivationArea } = useApi('put', 3003)
  const [area, setArea] = useState<any>()
  const tabs = [
    "Team Overview",
    "Lead and License Data",
    "Recend Activity Feed",
  ];
  const [activeTab, setActiveTab] = useState<string>("Team Overview");
  const [isModalOpen, setIsModalOpen] = useState({
    editArea: false,
    deleteArea: false,
    deactivateArea: false,
    AddTarget:false
  });

  // Function to toggle modal visibility
  const handleModalToggle = (editArea = false, deleteArea = false, deactivateArea = false,AddTarget= false) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editArea,
      deleteArea,
      deactivateArea,
      AddTarget
    }));
    getAreas();
  getRecentActivities()
  };

  const getAreas = async () => {
    try {
      const { response, error } = await getArea(`${endPoints.AREA}/${id}`);
      if (response && !error) {
        setArea(response.data);
      } else {
        console.log(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching region data:", err);
    }
  };

  useEffect(() => {
    getAreas();
  }, [id]);

  const handleDelete = async () => {
    try {
      const { response, error } = await deleteArea(`${endPoints.AREA}/${id}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/areas");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");

      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the lead.");
    }
  };

  const getRecentActivities = async () => {
    try {
      const { response, error } = await getActivities(`${endPoints.RECENT_ACTIVITY}/${id}`);

      if (response && !error) {
        const modifiedData = response.data.map((item: any) => {
          const [day, month, year] = item.timestamp.split(" ")[0].split("/");
          const formattedDate: any = new Date(`${month}/${day}/${year}`);

          return {
            ...item,
            formattedDate: !isNaN(formattedDate)
              ? formattedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Invalid Date",
          };
        });

        setActivityData(modifiedData);
      } else {
        console.log(error.data.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    getRecentActivities();
  }, []);
  const handleDeactivate = async () => {
    const body={
      status:area?.area?.status==='Active'?'Deactive':'Active'
    }
    try {
      const { response, error } = await deactivationArea(`${endPoints.DEACTIVATE_AREA}/${id}`,body);
      console.log(response);
      console.log(error, "error message");
      
      
      if (response) {
       toast.success(response.data.message);
       getAreas()
       navigate("/areas");
       
      } else {
        console.log(error?.response?.data?.message);
        
        toast.error(error?.response?.data?.message  || "An error occurred");     
        
        
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the lead.");
    }
  };


  

    return (
    <>
      <div ref={topRef}>
        <div className="flex items-center text-[16px] my-2 space-x-2">
          <p onClick={() => navigate('/areas')} className="font-bold cursor-pointer  text-[#820000] ">Area</p>
          <ChevronRight color="#4B5C79" size={18} />
          <p className="font-bold text-[#303F58] ">{area?.area?.areaName}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Section */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-8">
          {/* Area Icon and Name */}
          <div className="flex items-center gap-2">
            <div className="bg-blue flex flex-col items-center justify-center rounded-full p-2">
              <img className="w-10 h-10" src={region} alt="" />
              <h2 className="font-bold text-sm sm:text-base line-clamp-1 break-words">
  {area?.area?.areaName}
</h2>
            </div>
            <div className="border-r border-[#DADADA] h-10 mx-4 hidden sm:block"></div>
          </div>

          {/* Area Status */}
          <div className="text-center">
            <p className="text-xs text-[#8F99A9]">Area status</p>
            <h3
              className={`p-2 rounded-full text-xs font-medium ${
                area?.area?.status === "Active" ? "bg-[#6AAF681A] text-[#6AAF68]" : "bg-[#6AAF681A] text-orange-500"
              }`}
            >
              {area?.area?.status}
            </h3>
          </div>

          <div className="border-r border-[#DADADA] h-10 mx-4 hidden sm:block"></div>

          {/* Area Code */}
          <div className="text-center">
            <p className="text-xs text-[#8F99A9]">Area Code</p>
            <p className="text-xs">{area?.area?.areaCode}</p>
          </div>

          <div className="border-r border-[#DADADA] h-10 mx-4 hidden sm:block"></div>

          {/* Region */}
          <div className="text-center">
            <p className="text-xs text-[#8F99A9]">Region</p>
            <p onClick={() => navigate(`/regions/${area?.area?.region?._id}`)} className="text-xs underline cursor-pointer">
              {area?.area?.region?.regionCode}
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-8 text-xs py-2">
<div>
    {/* Area Manager */}
    {area?.areaManagers[0] && (
    <div
      onClick={() => navigate(`/area-manager/${area?.areaManagers[0]._id}`)}
      className="flex items-center cursor-pointer sm:flex "
    >
      <p className="text-sm sm:me-5">Area Manager</p>
      <div className="flex flex-col items-center space-y-1">
        <div className="w-8 h-8 rounded-full">
          {area?.areaManagers[0]?.user?.userImage ? (
            <img
              className="w-10 h-9 rounded-full"
              src={area?.areaManagers[0]?.user?.userImage}
              alt=""
            />
          ) : (
            <p className="w-9 h-9 border border-[#E7E8EB] bg-black rounded-full flex justify-center items-center">
              <UserIcon color="white" />
            </p>
          )}
        </div>
        <p className="text-center">{area?.areaManagers[0]?.user?.userName}</p>
      </div>
    </div>
  )}
</div>


  {/* Edit Button */}
  <div onClick={() => handleModalToggle(true, false, false, false)} className="flex flex-col items-center space-y-1 cursor-pointer">
    <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white flex justify-center items-center">
      <EditIcon size={18} color="#C4A25D" />
    </div>
    <p className="text-center">Edit</p>
  </div>

  {/* Activate / Deactivate */}
  <div onClick={() => handleModalToggle(false, false, true, false)} className="flex flex-col items-center space-y-1 cursor-pointer">
    <div
      className="rounded-full h-9 w-9 border border-white flex justify-center items-center"
      style={{
        backgroundColor: area?.area?.status === "Active" ? "#C4A25D4D" : "#B6FFD7",
      }}
    >
      {area?.area?.status === "Active" ? (
        <DeActivateIcon size={18} color="#D52B1E4D" />
      ) : (
        <UserRoundCheckIcon size={20} color="#D52B1E4D" />
      )}
    </div>
    <p className="text-center">{area?.area?.status === "Active" ? "Deactivate" : "Activate"}</p>
  </div>

  {/* Delete Button */}
  <div onClick={() => handleModalToggle(false, true, false, false)} className="cursor-pointer">
    <div className="rounded-full bg-[#D52B1E4D] h-9 w-9 border border-white flex justify-center items-center">
      <Trash size={18} color="#BC3126" />
    </div>
    <p className="text-center font-medium">Delete</p>
  </div>
</div>

      </div>
    </div>
    <div className="flex gap-8 text-base font-bold my-5 border-b border-gray-200">
  {tabs.map((tab) => (
    <div
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`cursor-pointer py-3 px-[16px] 
        ${activeTab === tab
          ? "text-deepStateBlue border-b-2 border-deepStateBlue bg-white"
          : "text-gray-600 bg-transparent"
        } 
        text-sm md:text-base lg:text-lg`}  // responsive font sizes
    >
      {tab}
    </div>
  ))}
</div>


        {activeTab === "Team Overview" && <TeamOverview id={id} />}

        {activeTab === "Lead and License Data" && <LeadAndLisence id={id} />}

        {activeTab === "Recend Activity Feed" && <ResendActivity recentActData={activityData} loading={activityloading}/>}
      </div>
      <Modal open={isModalOpen.editArea} onClose={() => handleModalToggle()} className="w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]">
        <AreaForm editId={id} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.deleteArea}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this area?"
          onClose={() => handleModalToggle()}
        />
      </Modal>

      <Modal
        open={isModalOpen.deactivateArea}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            area?.area?.status === "Active"
              ? "Are you sure want to deactivate this area?"
              : "Are you sure want to activate this area?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>

    </>
  );
};

export default AreaView;
