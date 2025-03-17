import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ChevronRight from "../../../assets/icons/ChevronRight";
import ChevronUp from "../../../assets/icons/ChevronUp";
import EditIcon from "../../../assets/icons/EditIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import PhoneIcon from "../../../assets/icons/PhoneIcon";
import PlusCircleIcon from "../../../assets/icons/PlusCircleIcon";
import region from "../../../assets/image/Ellipse 14 (3).png";
import IndiaLogo from "../../../assets/image/IndiaLogo.png";
import SaudhiLogo from "../../../assets/image/SaudiLogo.png";
import UAELogo from "../../../assets/image/UAELogo.webp";
import Modal from "../../../components/modal/Modal";
import { endPoints } from "../../../services/apiEndpoints";
import AreaForm from "../Area/AreaForm";
import RegionAriaView from "./Area/RegionAriaView";
import RegionForm from "./RegionForm";
import RegionPerformanceView from "./PerformanceAnalysing/RegionPerformanceView";
import RegionTeamView from "./Team/RegionTeamView";
import UserIcon from "../../../assets/icons/UserIcon";
import Trash from "../../../assets/icons/Trash";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import type{ RegionView } from "../../../Interfaces/RegionView";
import AMForm from "../../SalesTeams/AreaManager/AMForm";
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon";
import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import { useResponse } from "../../../context/ResponseContext";


type Props = {};
const initialRegionAreaData: RegionView = {
  areas: [],
  regionManager: {
    userName: '',
    email: '',
    phoneNo: '',
    userImage:''
  },
  licensers:[],
  totalAreaManagers: 0,
  totalBdas: 0,
  totalLeadThisMonth: 0,
  totalLicensors: 0,
};

function RegionView({}: Props) {
 
  
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
 
  const { request: deleteRegion } = useApi("delete", 3003);
  const { request: deactivateRegion } = useApi("put", 3003);
  const {request:getAreaDetails}=useApi('get',3003)
  const {loading,setLoading}=useResponse()
  const [dropDown, setDropDown] = useState([]);
  const navigate=useNavigate()
  const [teamData, setTeamData] = useState<any>({})
  const { request: getTeam } = useApi('get', 3003)
  // Function to toggle dropdown state
  const handleDropdownToggle = (index: number) => {
    setDropDown((prev) => {
      const newState: any = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };
  const { id } = useParams();
  const { request: getRegion } = useApi("get", 3003);
  const [data, setData] = useState<{
    regionData: any;
    regionAreaData:RegionView,
    amEditId:string
  }>({ regionData: [], regionAreaData:initialRegionAreaData,amEditId:'' });

  const countyLogo = [
    { countryName: "India", countryLogo: IndiaLogo },
    { countryName: "Saudi Arabia", countryLogo: SaudhiLogo },
    { countryName: "United Arab Emirates", countryLogo: UAELogo },
  ];

  const tabs = ["Area", "Team", "Performance Analytics"];
  const [activeTab, setActiveTab] = useState<string>("Area");
  const getARegion = async () => {
    try {
      const { response, error } = await getRegion(`${endPoints.REGION}/${id}`);
      if (response && !error) {
        setData((prevData) => ({
          ...prevData,
          regionData: response.data,
        }));
       // console.log(response.data);
        
      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching region data:", err);
    }
  };



  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
    editRegion: false,
    addArea: false,
    deleteRegion:false,
    editAm:false,
    deactivateRegion:false,
  });

  // Function to toggle modal visibility
  const handleModalToggle = (editRegion = false, addArea = false,deleteRegion=false,editAm=false,deactivateRegion=false) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editRegion,
      addArea,
      deleteRegion,
      editAm,
      deactivateRegion
    }));
    getARegion();
    getAllTeam()
  };

  const countryLogoObject = countyLogo.find(
    (item) => item.countryName === data.regionData?.region?.country
  );

  const src = countryLogoObject ? countryLogoObject.countryLogo : region;

 

  
  const getRegionAreaData=async()=>{
    try{
      setLoading(true)
      const {response,error}=await getAreaDetails(`${endPoints.GET_REGIONS}/${id}/areas`)
      if(response && !error){
       setData((prev)=>({...prev,regionAreaData:response.data}))
        console.log(response.data);
        
      }else{
        console.log(error.response.data.message);
      }
    }catch(err){
      console.log("err",err);
      
    }finally{
      setLoading(false)
    }
  }
 
  const getAllTeam = async () => {
    try {
      const { response, error } = await getTeam(`${endPoints.GET_REGIONS}/${id}/details`);

      if (response && !error) {

        const { bdas = [], areaManagers = [], ...restData } = response?.data || {};

        const transformedBdas = bdas.map((team: any) => ({
          ...team,
          dateOfJoining: team.user?.dateOfJoining
            ? new Date(team.user?.dateOfJoining).toLocaleDateString("en-GB")
            : "N/A",
          phoneNo: team?.user?.PhoneNo,
          userName: team?.user?.userName,
          userImage: team?.user?.userImage,
          areaName: team?.area?.areaName,
          employeeId: team?.user?.employeeId,
        }));

        const transformedData = { transformedBdas, areaManagers, ...restData };
        setTeamData(transformedData);
      } else {
        console.log(error?.response?.data?.message || "Unknown error occurred");
      }
    } catch (err) {
      console.log(err);
    }
  };

  
  useEffect(() => {
    getARegion();
    getRegionAreaData();
    getAllTeam();
  }, [id]);


  const handleDelete = async () => {
    try {
      const { response, error } = await deleteRegion(`${endPoints.REGION}/${id}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/regions");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
        
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the lead.");
    }
  };



  const handleDeactivate = async () => {
    const body={
      status:data?.regionData?.region?.status==='Active'?'Deactive':'Active'
    }
    try {
      const { response, error } = await deactivateRegion(`${endPoints.DEACTIVATE_REGION}/${id}`,body);
      console.log(response);
      console.log(error, "error message");
      
      
      if (response) {
       toast.success(response.data.message);
       getARegion()
       navigate("/regions");
       
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
<div ref={topRef} className="h-full grid grid-cols-12">
{/* Sidebar */}
<div className="col-span-3 max-md:col-span-12 max-sm:col-span-12 h-full pe-2 sm:overflow-visible overflow-y-auto hide-scrollbar sm:max-h-[600px]">
  <div className="flex items-center text-[16px] space-x-2 mb-4">
    <p onClick={() => navigate('/regions')} className="font-bold cursor-pointer text-[#820000]">Region</p>
    <ChevronRight color="#4B5C79" size={18} />
    <p className="font-bold text-[#303F58]">
      {data.regionData?.region?.regionName}
    </p>
  </div>

  <div className="h-auto w-full bg-[#FFFFFF] rounded-lg p-3">
    <div className="space-y-2 flex flex-col justify-center items-center">
      <div className="rounded-full">
        <img className="w-16 h-16 rounded-full" src={region} alt="" />
      </div>
      <p className="font-bold text-[#303F58]">
        {data.regionData?.region?.regionName}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="border-r pe-3">
          <div className="w-fit flex justify-center items-center flex-col space-y-1">
            <p className="text-[#8F99A9] text-[10px]">Region Status</p>
            <h3
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                data?.regionData?.region?.status === "Active"
                  ? "bg-[#6AAF681A] text-[#6AAF68]"
                  : "bg-[#ff1d1d28] text-orange-500"
              }`}
            >
              <p className="text-[10px]">{data?.regionData?.region?.status}</p>
            </h3>
          </div>
        </div>

        <div className="ps-3">
          <div className="w-fit flex justify-center items-center flex-col space-y-1">
            <p className="text-[#8F99A9] text-[10px]">Country</p>
            <div className="flex justify-between items-center gap-1">
              <div className="rounded-full">
                <img className="w-4 h-4 rounded-full -mt-1" src={src} alt="" />
              </div>
              <p className="text-sm text-[#4B5C79]">
                {data.regionData?.region?.country === "United Arab Emirates"
                  ? "UAE"
                  : data.regionData?.region?.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="w-full" />

      <div className="flex justify-evenly items-center w-full text-[10px]">
        <div className="flex flex-col items-center space-y-1">
          <div
            onClick={() => handleModalToggle(true, false, false, false, false)}
            className="cursor-pointer w-8 h-8 mb-2 rounded-full"
          >
            <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
              <div className="ms-2 mt-2">
                <EditIcon size={18} color="#C4A25D" />
              </div>
            </div>
          </div>
          <p className="text-center font-medium text-xs">Edit</p>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <div
            onClick={() => handleModalToggle(false, true, false, false, false)}
            className="cursor-pointer w-8 h-8 mb-2 rounded-full"
          >
            <PlusCircleIcon size={35} color="#D52B1E4D" />
          </div>
          <p className="text-center font-medium text-xs ms-2">
            Add Area
          </p>
        </div>

        <div
          onClick={() => handleModalToggle(false, false, false, false, true)}
          className="flex flex-col items-center space-y-1 cursor-pointer"
        >
          <div className="w-8 h-8 mb-2 rounded-full">
            {data?.regionData?.region?.status === "Active" ? (
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                <div className="ms-2 mt-2">
                  <DeActivateIcon size={18} color="#D52B1E4D" />
                </div>
              </div>
            ) : (
              <div className="rounded-full bg-[#B6FFD7] h-9 w-9 border border-white">
                <div className="ms-2 mt-2">
                  <UserRoundCheckIcon size={20} color="#D52B1E4D" />
                </div>
              </div>
            )}
          </div>
          <p className="text-center font-medium text-xs ms-2">
            {data?.regionData?.region?.status === "Active"
              ? "Deactivate"
              : "Activate"}
          </p>
        </div>

        <div
          onClick={() => handleModalToggle(false, false, true, false, false)}
          className="cursor-pointer"
        >
          <div className="rounded-full bg-[#D52B1E26] h-9 w-9 border border-white mb-2">
            <div className="ms-2 mt-2">
              <Trash size={18} color="#BC3126" />
            </div>
          </div>
          <p className="text-center font-medium text-xs">Delete</p>
        </div>
      </div>

      {data?.regionData?.regionManager?.userName && (
        <>
          <hr className="w-full" />
          <div className="space-y-1 w-full text-xs mt-2">
            <p className="font-bold text-[12px]">Regional Manager Info</p>
            <p className="text-[#8F99A9]">Total RM</p>
            <p>1</p>
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full mt-2">
                <div className="flex items-center gap-1">
                  {data?.regionAreaData?.regionManager?.userImage &&
                  data?.regionAreaData?.regionManager?.userImage?.length > 500 ? (
                    <img
                      className="w-10 h-10 rounded-full"
                      src={data?.regionAreaData?.regionManager?.userImage}
                      alt="User Image"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-black rounded-full flex justify-center items-center">
                      <UserIcon color="white" size={22} />
                    </div>
                  )}
                  <div className="flex flex-col space-y-1">
                    <p className="text-[11px] text-[#8F99A9]">Name</p>
                    <p className="text-xs">
                      {data?.regionData?.regionManager.userName ?? 'N/A'}
                    </p>
                  </div>
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => handleDropdownToggle(1)}
                >
                  {dropDown[1] ? (
                    <ChevronUp size={18} color="#303F58" />
                  ) : (
                    <ChevronDown size={18} color="#303F58" />
                  )}
                </div>
              </div>

              {dropDown[1] && (
                <>
                  <div className="flex items-center gap-1 pt-2">
                    <div className="w-10 rounded-full flex justify-center items-center border h-10">
                      <EmailIcon size={18} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-[11px] text-[#8F99A9]">Email Address</p>
                      <p className="text-xs">
                        {data?.regionData?.regionManager.email ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <div className="w-10 rounded-full flex justify-center items-center border h-10">
                      <PhoneIcon size={18} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-[11px] text-[#8F99A9]">Phone Number</p>
                      <p className="text-xs">
                        {data?.regionData?.regionManager.phoneNo ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>

{/* Main Content */}
<div className="col-span-9 relative overflow-y-auto hide-scrollbar mb-4 max-lg:mt-10 max-sm:mt-2 max-md:mt-2 max-md:col-span-12 max-sm:col-span-12">
  <div style={{ zIndex: 5 }} className="flex gap-8 sticky top-0 bg-[#F6F6F6] text-base font-bold border-b w-full border-gray-200">
    {tabs.map((tab) => (
      <div
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`cursor-pointer py-3 px-[16px] ${activeTab === tab ? "text-deepStateBlue border-b-2 border-deepStateBlue bg-white" : "text-gray-600 bg-transparent"}`}
      >
        {tab}
      </div>
    ))}
  </div>

  <div style={{ zIndex: 2 }} className="absolute w-full">
    {activeTab === "Area" && <RegionAriaView loading={loading} regionAreaData={data.regionAreaData} regionData={data.regionData} />}
    {activeTab === "Team" && <RegionTeamView teamData={teamData} handleModalToggle={handleModalToggle} setData={setData} />}
    {activeTab === "Performance Analytics" && <RegionPerformanceView regionId={id} />}
  </div>
</div>

      </div>
      {/* Modal Section */}
      <Modal
        open={isModalOpen.editRegion}
        onClose={() => handleModalToggle()}
        className=" w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <RegionForm
          editId={id}
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal
        open={isModalOpen.addArea}
        onClose={() => handleModalToggle()}
        className="w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <AreaForm regionId={id}  onClose={() => handleModalToggle()} />
      </Modal>

      <Modal
        open={isModalOpen.deleteRegion}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this region?"
          onClose={() => handleModalToggle()}
        />
      </Modal>  

       <Modal
        open={isModalOpen.deactivateRegion}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            data?.regionData?.region?.status === "Active"
              ? "Are you sure want to deactivate this Region?"
              : "Are you sure want to activate this Region?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>        

      <Modal   open={isModalOpen.editAm} onClose={() => handleModalToggle()}>
     <AMForm editId={data.amEditId}  onClose={() => handleModalToggle()} />
   </Modal>       
    </>
  );
}

export default RegionView;
