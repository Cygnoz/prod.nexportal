import { useEffect, useRef, useState } from "react";
import AreaIcon from "../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import CalenderDays from "../../../assets/icons/CalenderDays";
import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import EditIcon from "../../../assets/icons/EditIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import RegionIcon from "../../../assets/icons/RegionIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon";
import Modal from "../../../components/modal/Modal";
import SuperVisorCards from "../../../components/ui/SuperVisorCards";
import Table from "../../../components/ui/Table";
import SuperVisorTicketsOverview from "./SuperVisorTicketsOverview";
import SuperVisorViewForm from "./SuperVisorViewForm";
// import SuperVisorCard from "../../../components/ui/SuperVisorCards"
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import AwardIcon from "../../../assets/icons/AwardIcon";
import CalenderMultiple from "../../../assets/icons/CalenderMultiple";
import ChevronRight from "../../../assets/icons/ChevronRight";
import PhoneIcon from "../../../assets/icons/PhoneIcon";
import Trash from "../../../assets/icons/Trash";
import Background from "../../../assets/image/1.png";
import person1 from "../../../assets/image/Ellipse 14.png";
import person2 from "../../../assets/image/Ellipse 43.png";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { endPoints } from "../../../services/apiEndpoints";
import SVViewAward from "./SVViewAward";
import SupervisorForm from "./SupervisorForm";
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon";
import { useResponse } from "../../../context/ResponseContext";
import CommissionRoundIcon from "../../../assets/icons/CommissionRoundIcon";
import SalaryRoundIcon from "../../../assets/icons/SalaryRoundIcon";
import CommissionModal from "../../../components/modal/CommissionModal";
import SalaryInfoModal from "../../../components/modal/SalaryInfoModal";
import RatingStar from "../../../components/ui/RatingStar";
import NoImage from "../../../components/ui/NoImage";
 
 
 
interface SupervisorData {
  memberID: string;
  supervisorName: string;
  ticketsResolved: string;
  time: string | number;
 
  rating: string;
}
 
type Props = {
  staffId?: string
};
 
const SuperVisorView = ({ staffId }: Props) => {
  const { request: SalaryInfo } = useApi("get", 3002);
  const[salaryDetails,setSalaryDetails]=useState<any>('')
  const { loading, setLoading } = useResponse()
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
    editSV: false,
    viewSV: false,
    awardSV: false,
    confirm: false,
    deactiveSv: false,
    salarySv:false,
    commissionSv:false,
  });
  const handleModalToggle = (
    editSV = false,
    viewSV = false,
    awardSV = false,
    confirm = false,
    deactiveSv = false,
    salarySv=false,
    commissionSv=false,
  ) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editSV: editSV,
      viewSV: viewSV,
      awardSV: awardSV,
      confirm: confirm,
      deactiveSv: deactiveSv,
      salarySv:salarySv,
      commissionSv:commissionSv
    }));
    getASV();
  };
 
 
  const { request: getInsideSv } = useApi('get', 3003);
  const [insideSvData, setInsideSvData] = useState<any>();
  const [supportAgentDetails, setSupportAgentDetails] = useState([]);
  const [ticketSummary, setTicketSummary] = useState<any>({});
 
 
  const { request: deleteaSV } = useApi('delete', 3003)
  const { request: deactivateSV } = useApi('put', 3003);
  const { request: getaSV } = useApi("get", 3003);
  const { id } = useParams();
  const iId = staffId ? staffId : id
  const [getData, setGetData] = useState<{
    svData: any;
  }>({ svData: [] });
  
  const supportAgents = insideSvData?.supportAgentDetails || [];

// Extract the last 4 images (or all if less than 4)
const agentImages = supportAgents
  .filter((agent:any) => agent.supportAgentImage !== "N/A") // Remove N/A images
  .slice(-4) // Get the last 4 valid images
  .map((agent:any, index:any) => (
    <img 
      key={index} 
      src={agent.supportAgentImage} 
      alt={`Agent-${index}`} 
      className="w-10 h-10 rounded-full border border-white bg-white"
    />
  ));

// Ensure there are at least 4 images by adding placeholders if needed
// while (agentImages.length < 4) {
//   agentImages.push(<NoImage key={`placeholder-${agentImages.length}`} className="w-10 h-10 rounded-full" />);
// }

  const getASV = async () => {
    try {
      setLoading(true)
      const { response, error } = await getaSV(
        `${endPoints.SUPER_VISOR}/${iId}`
      );
      if (response && !error) {
        setGetData((prevData) => ({
          ...prevData,
          svData: response.data,
        }));
      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching Super Visor data:", err);
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    getASV();
    getInsideViewSV();
  }, [iId]);
 
  const handleDelete = async () => {
    try {
      const { response, error } = await deleteaSV(`${endPoints.SUPER_VISOR}/${iId}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/supervisor");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the SuperVisor.");
    }
  };
 
 
  const getSalary = async () => {
    try {
      const { response, error } = await SalaryInfo(`${endPoints.SALARY_INFO}/${iId}`);
      console.log(response);
      // console.log(error);
     
     // console.log(error);
      if (response && !error) {
       console.log("Ss",response.data);
       setSalaryDetails(response.data)
     
       
       
       // setChartData(response.data);
      } else {
        console.error("Error:", error?.data || "Unknown error");
       
      }
    } catch (err) {
      console.error(err);
    }
  };
 
  useEffect(() => {
  getSalary()
  }, [iId]);
 
 
  const navigate = useNavigate()
 
  const handleDeactivate = async () => {
    const body = {
      status: getData.svData?.status === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactivateSV(`${endPoints.DEACTIVATE_SV}/${iId}`, body);
      console.log(response);
      console.log(error, "error message");
 
 
      if (response) {
        toast.success(response.data.message);
        navigate("/supervisor");
      } else {
        console.log(error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the supervisor.");
    }
  };
 
 
  const getInsideViewSV = async () => {
    try {
      const { response, error } = await getInsideSv(`${endPoints.SUPER_VISOR}/${iId}/details`);
 
      if (response && !error) {
        console.log(response.data);
        setInsideSvData(response.data);
 
        if (response.data) {
          setSupportAgentDetails(response.data.supportAgentDetails || []);
          setTicketSummary(response.data.ticketSummary || {});
        }
      } else {
        console.error(error.response?.data?.message || "Failed to fetch supervisor data.");
      }
    } catch (err) {
      console.error("Error fetching SV data:", err);
    }
  };
 
 
 
  // Data for HomeCards
  const SuperVisorCardData = [
    {
      icon: <AreaIcon size={24} />,
      number: insideSvData?.supervisorDetails?.totalSupportAgents || 0,
      title: "Total Agent Supervised",
      subTitle: "A good boss is a good teacher",
      images: agentImages
    },
    {
      icon: <UserIcon size={24} />,
      number: insideSvData?.supervisorDetails?.taskCompletionPercentage || "0%",
      title: "Tasks completed by the team",
      subTitle: "Mission accomplished",
    },
    // {
    //   icon: <UserIcon size={24} />,
    //   number: insideSvData?.supervisorDetails?.overallResolutionRate || "0%",
    //   title: "Overall resolution rate",
    //   subTitle: "Supervisor's efficiency in resolving assigned issues.",
    // },
    {
      icon: <UserIcon size={24} />,
      number: insideSvData?.supervisorDetails?.overallStarCountAverage || "0",
      rating: (
        <RatingStar
          size={22}
          count={parseFloat(insideSvData?.supervisorDetails?.overallStarCountAverage) || 0}
        />
      ),
      title: "Customer feedback",
      subTitle: "Customer satisfaction rating for tickets resolved by the team",
    },
  ];
  
 
 
 
  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "employeeId", label: "Member ID" },
    { key: "supportAgentName", label: "Name" },
    { key: "resolutionRate", label: "Resolution Rate"},
    { key: "completedTasks", label: "Closed Tickets"},
    { key: "starCount", label: "Rating"},
  ];

  const SVData = supportAgentDetails.map((support: any) => ({
    ...support,
    employeeId: support.employeeId || "N/A",
    supportAgentName: support.supportAgentName, // or any unique identifier
    resolvedTicketsCount: support.resolvedTicketsCount || 0, // Adjust according to your data structure
    _id:support.supportAgentId    
  }));
 
  console.log("sv",SVData);
  const handleView=(id?:string)=>{
    navigate(`/support-agent/${id}`)
  }

  return (
    <>
      <div ref={topRef}>
        <div className="flex items-center text-[16px] my-2 space-x-2">
          <p onClick={() => navigate('/supervisor')} className="font-bold cursor-pointer  text-[#820000] ">Supervisor</p>
          <ChevronRight color="#4B5C79" size={18} />
          <p className="font-bold text-[#303F58] ">
            {" "}
            {getData.svData?.user?.userName
              ? getData.svData?.user?.userName
              : "N/A"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">

        <div className="col-span-8 ">
    <div className="flex justify-between items-center flex-wrap">
      <h1 className="text-[#303F58] text-base font-bold">Assigned Team Overview</h1>
    </div>

    {/* HomeCards Section */}

    <div  className="grid grid-cols-1 sm:grid-cols-3  gap-3 py-2 mt-2">
  {SuperVisorCardData.map((card, index) => (
    <SuperVisorCards
      key={index}
      number={card.number}
      title={card.title}
      subTitle={card.subTitle}
      images={card.images}
      rating={card.rating}
    />
  ))}
</div>


    {/* Table Section */}
    <div className="overflow-x-auto">
      <Table<SupervisorData>
        data={SVData}
        columns={columns}
        headerContents={{
          title: "Support Team Members",
          search: { placeholder: "Search Support Agent" },
          sort: [
            {
              sortHead: "Filter",
              sortList: [
                {
                  label: "Sort by supervisorCode",
                  icon: <UserIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by Age",
                  icon: <RegionIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by supervisorCode",
                  icon: <AreaManagerIcon size={14} color="#4B5C79" />,
                },
                {
                  label: "Sort by Age",
                  icon: <CalenderDays size={14} color="#4B5C79" />,
                },
              ],
            },
          ],
        }}
        actionList={[
          { label: "view", function: handleView },
        ]}
        maxHeight="500px"
        skeltonCount={11}
        loading={loading}
      />
    </div>
        </div>
 
        <div
 className="col-span-4 bg-slate-200 w-fit sm:p-2 sm:mx-2 h-[750px] sm:h-[715px] sm:mt-[40px] -mt-5 p-2 rounded-lg bg-cover bg-center"  style={{
    backgroundImage: `url(${Background})`, // Use the imported image
  }}
>
  <div className="rounded-full flex flex-col sm:flex-row justify-between py-2">
    <div className="flex items-center">
      {getData.svData?.user?.userImage && getData.svData?.user?.userImage.length > 500 ? (
        <img
          className="w-16 h-16 rounded-full"
          src={getData.svData?.user?.userImage}
          alt=""
        />
      ) : (
        <p className="w-16 h-16 bg-black rounded-full flex justify-center items-center">
          <UserIcon color="white" size={35} />
        </p>
      )}
      <h2 className="font-medium text-sm text-white mt-5 sm:mt-0 sm:ms-3">
        {getData.svData?.user?.userName ? getData.svData?.user?.userName : "N/A"}
      </h2>
    </div>
    <p className="font-medium text-xs bg-[#D5DCB3] h-8 w-20 p-2 mt-4 rounded-2xl sm:ml-40">
      Supervisor
    </p>
  </div>
  <hr />

  <div className="p-3">
    <div className="flex py-3 text-white">
      <EmailIcon color="#FFFFFF" size={20} />
      <h3 className="text-xs font-medium mx-1 text-white">Email</h3>
    </div>
    <p className="text-sm font-normal text-white py-2">
      {getData.svData?.user?.email ? getData.svData?.user?.email : "N/A"}
    </p>
    <hr />

    <div className="flex py-3">
      <PhoneIcon size={20} />
      <h3 className="text-xs font-medium mx-1 text-white">Phone</h3>
    </div>
    <p className="text-sm font-normal text-white py-2">
      {getData.svData?.user?.phoneNo ? getData.svData?.user?.phoneNo : "N/A"}
    </p>
    <hr />

    <div className="flex py-3">
      <RegionIcon size={20} />
      <h3 className="text-xs font-medium mx-1 text-white">Region</h3>
    </div>
    <p className="text-sm font-normal text-white py-2">
      {getData.svData?.region?.regionCode ? getData.svData?.region?.regionCode : "N/A"}
    </p>
    <hr />

    <div className="flex py-3">
      <UserIcon size={20} />
      <h3 className="text-xs font-medium mx-1 text-white">Employee ID</h3>
    </div>
    <p className="text-sm font-normal text-white py-2">
      {getData.svData?.user?.employeeId ? getData.svData?.user?.employeeId : "N/A"}
    </p>
    <hr />

    <div className="flex py-3">
      <CalenderMultiple size={20} />
      <h3 className="text-xs font-medium mx-1 text-[#ffffff]">Joining Date</h3>
    </div>
    <p className="text-sm font-normal text-white py-2">
      {getData.svData?.dateOfJoining
        ? new Date(getData.svData.dateOfJoining).toLocaleDateString("en-GB")
        : "N/A"}
    </p>
    <hr />

    <div className="flex space-x-4 sm:space-x-10 mt-4  justify-center sm:justify-start">
      <div
        onClick={() =>
          handleModalToggle(true, false, false, false, false, false, false)
        }
        className="flex flex-col items-center cursor-pointer space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <EditIcon size={18} color="#F0D5A0" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">
          Edit Profile
        </p>
      </div>

      <div
        onClick={() =>
          handleModalToggle(false, true, false, false, false, false, false)
        }
        className="flex flex-col cursor-pointer items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <ViewRoundIcon size={18} color="#B6D6FF" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">
          View Details
        </p>
      </div>

      <div
        onClick={() =>
          handleModalToggle(false, false, true, false, false, false, false)
        }
        className="flex flex-col cursor-pointer items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <AwardIcon size={18} color="#B6FFD7" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">
          Awards
        </p>
      </div>

      <div
        onClick={() =>
          handleModalToggle(false, false, false, false, true, false, false)
        }
        className="flex flex-col items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
          {getData.svData?.status === "Active" ? (
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
        <p className="text-center text-[#D4D4D4] text-xs font-medium ms-2">
          {getData.svData?.status === "Active" ? "Deactivate" : "Activate"}
        </p>
      </div>
    </div>

    <div className="flex space-x-10 mt-2 justify-center sm:justify-start ms-8">

       <div
        onClick={() =>
          handleModalToggle(false, false, false, true, false, false, false)
        }
        className="flex flex-col cursor-pointer items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <Trash size={18} color="#BC3126" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">Delete</p>
       </div>

       <div
        onClick={() =>
          handleModalToggle(false, false, false, false, false, true, false)
        }
        className="flex flex-col cursor-pointer items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <SalaryRoundIcon size={18} color="#B6D6FF" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">
          Salary Info
        </p>
       </div>

       <div
        onClick={() =>
          handleModalToggle(false, false, false, false, false, false, true)
        }
        className="flex flex-col cursor-pointer items-center space-y-1"
      >
        <div className="w-8 h-8 mb-2 rounded-full">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
            <div className="ms-2 mt-2">
              <CommissionRoundIcon size={18} color="#B6FFFF" />
            </div>
          </div>
        </div>
        <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">
          Commission
        </p>
       </div>

    </div>
  </div>
</div>

        </div>
 
        {/* <SuperVisorTicketsOverview ticketSummary={ticketSummary} /> */}
        <SuperVisorTicketsOverview
          loading={loading}
          ticketSummary={ticketSummary}
          supportAgentDetails={supportAgentDetails}
          insideSvData={insideSvData} />
      </div>
 
      {/* Modal controlled by state */}
      <Modal open={isModalOpen.viewSV} onClose={() => handleModalToggle()} className="w-[50%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto">
        <SuperVisorViewForm id={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.editSV} onClose={() => handleModalToggle()} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]  max-sm:overflow-auto">
        <SupervisorForm editId={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.awardSV}
        onClose={() => handleModalToggle()}
        align="right"
        className="w-[25%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[35%] mx-auto "
      >
        <SVViewAward id={iId} getData={getData} onClose={() => handleModalToggle()} />
      </Modal >
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" 
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this Supervisor?"
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal
        open={isModalOpen.deactiveSv}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            getData.svData?.status === "Active"
              ? "Are you sure want to deactivate this Supervisor?"
              : "Are you sure want to activate this Supervisor?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal open={isModalOpen.salarySv} onClose={()=>handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
    <SalaryInfoModal salaryDetails={salaryDetails} onClose={()=>handleModalToggle()} />
  </Modal>
 
  <Modal open={isModalOpen.commissionSv} onClose={()=>handleModalToggle()}className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
    <CommissionModal id={iId}  onClose={()=>handleModalToggle()} />
  </Modal>
 
 
    </>
  );
};
 
export default SuperVisorView;