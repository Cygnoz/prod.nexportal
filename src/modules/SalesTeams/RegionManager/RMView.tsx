import { useEffect, useRef, useState } from "react";
import AreaIcon from "../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import EditIcon from "../../../assets/icons/EditIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon";
import Modal from "../../../components/modal/Modal";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import RMViewAriaManagers from "./RMViewAriaManagers";
import RMViewBDAandGraph from "./RMViewBDAandGraph";
import RMViewForm from "./RMViewForm";
import BackgroundImage from "../../../assets/image/6.png";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { useNavigate, useParams } from "react-router-dom";
import AwardIcon from "../../../assets/icons/AwardIcon";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import RMForm from "./RMForm";
import RMViewAward from "./RMViewAward";
import Trash from "../../../assets/icons/Trash";
import toast from "react-hot-toast";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon";
import { useResponse } from "../../../context/ResponseContext";
import ProgressBar from "../../../pages/Dashboard/Graphs/ProgressBar";
import { useUser } from "../../../context/UserContext";
import SalaryInfoModal from "../../../components/modal/SalaryInfoModal";
import CommissionModal from "../../../components/modal/CommissionModal";
import SalaryRoundIcon from "../../../assets/icons/SalaryRoundIcon";
import CommissionRoundIcon from "../../../assets/icons/CommissionRoundIcon";
type Props = {
  staffId?: string
};
interface AreaData {
  areaCode: string;
  areaName: string;
  region: string;
  areaManagers: string;
}

const RMView = ({ staffId }: Props) => {
  const { user } = useUser()

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
    editRM: false,
    viewRM: false,
    awardRM: false,
    confirm: false,
    deactiveRM: false,
    salaryInfoRM: false,
    commissionRM: false,
  });
  const handleModalToggle = (
    editRM = false,
    viewRM = false,
    awardRM = false,
    confirm = false,
    deactiveRM = false,
    salaryInfoRM = false,
    commissionRM = false,
  ) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editRM: editRM,
      viewRM: viewRM,
      awardRM: awardRM,
      confirm: confirm,
      deactiveRM: deactiveRM,
      salaryInfoRM: salaryInfoRM,
      commissionRM: commissionRM
    }));
  };
  const { request: SalaryInfo } = useApi("get", 3002);
  const[salaryDetails,setSalaryDetails]=useState<any>('')
  const { request: getaRM } = useApi("get", 3002);
  const { request: deleteaRM } = useApi("delete", 3002)
  const { loading, setLoading } = useResponse()
  const { id } = useParams();
const iId = staffId || id; // More concise fallback

// Add validation
if (!iId) {
  console.error("No ID provided - both staffId prop and URL param are missing");
  // You might want to handle this case (redirect, show error, etc.)
}
  
  const [getData, setGetData] = useState<{
    rmData: any;
  }>({ rmData: [] });

  const getARM = async () => {
    try {
      setLoading(true)
      const { response, error } = await getaRM(`${endPoints.GET_ALL_RM}/${iId}`);
      if (response && !error) {
        if(staffId){
          sessionStorage.setItem("staffLocalityId",response?.data?.regionManager?.region?._id)
        }
        setGetData((prevData) => ({
          ...prevData,
          rmData: response.data,
        }));
      } else {
        // console.error(error.response.data.message);
      }
    } catch (err) {
      // console.error("Error fetching AM data:", err);
    } finally {
      setLoading(false)
    }
  };
 
 

  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { response, error } = await deleteaRM(`${endPoints.GET_ALL_RM}/${iId}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/region-manager");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      // console.error("Delete error:", err);
      toast.error("Failed to delete the Region Manager.");
    }
  };



  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaIcon size={24} />,
      number: getData?.rmData?.totalCounts?.totalAreaManaged,
      title: "Total Area",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <UserIcon size={24} />,
      number: getData?.rmData?.totalCounts?.totalAreaManagers,
      title: "Total Area Manager",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <AreaManagerIcon size={24} />,
      number: getData?.rmData?.totalCounts?.totalBdas,
      title: "Total BDA's",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
  ];



  const { request: getRMInsiIde } = useApi('get', 3002)
  const [totalAreaManaged, setTotalAreaManaged] = useState([]);
  const [totalAreaManagers, setTotalAreaManagers] = useState([]);
  const [totalBdas, setTotalBdas] = useState([]);
  const { request: deactivateRM } = useApi('put', 3002)
 

  const getSalary = async () => {
    try {
      const { response, error } = await SalaryInfo(`${endPoints.SALARY_INFO}/${iId}`);
      // console.log(response);
      //  console.log(error);
      
     // console.log(error);
      if (response && !error) {
      //  console.log("Ss",response.data);
       setSalaryDetails(response.data)
      
       
       
       // setChartData(response.data);
      } else {
        // console.error("Error:", error?.data || "Unknown error");
        
      }
    } catch (err) {
      // console.error(err);
    }
  };
  



  const getRMInsiIdes = async () => {
    try {
      const { response, error } = await getRMInsiIde(`${endPoints.RM}/${iId}/details`);
      // console.log(response, "res");
      // console.log(error, "err");

      if (response && !error) {
        const data = response.data;
        // console.log("Datas",data);
        
        // console.log("dTAA", data.totalBdas);



        // Set the values for each key separately
        const rawData = response.data.totalAreaManaged || [];
        const processedData = rawData.map((item: any) => ({
          areaCode: item.areaCode,
          areaName: item.areaName,
          region: item.region || "N/A", // Default to "N/A" if region is missing
          areaManagers: item.areaManagerName, // Assuming areaManagerName is a single name
        }));
        setTotalAreaManaged(processedData);
        setTotalAreaManagers(data.totalAreaManagers || []);
        setTotalBdas(data.totalBdas || []);
      } else {
        // console.log(error.response.data.message);
      }
    } catch (err) {
      // console.log(err, "error");
    }
  };


  // For debugging
  console.log("rmViewData", getData.rmData);

  const handleDeactivate = async () => {
    const body = {
      status: getData?.rmData?.regionManager?.status === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactivateRM(`${endPoints.DEACTIVATE_RM}/${iId}`, body);
      // console.log(response);
      // console.log(error, "error message");  
      if (response) {
        toast.success(response.data.message);
        getARM()
        navigate("/region-manager");

      } else {
        // console.log(error?.response?.data?.message);

        toast.error(error?.response?.data?.message || "An error occurred");


      }
    } catch (err) {
      // console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the lead.");
    }
  };

   // Define the columns with strict keys
   const columns: { key: any; label: string }[] = [
    { key: "areaCode", label: "Area Code" },
    { key: "areaName", label: "Area Name" },
    // { key: "region", label: "Region" },
    { key: "areaManagers", label: "Area Managers" },
  ];

  useEffect(() => {
    if(iId){
      getARM();
      getSalary();
      getRMInsiIdes();
    }
  }, [iId]);

  return (
    <>
      <div ref={topRef}>
      <div className="flex items-center text-[16px] my-2 space-x-2">
  <p
    onClick={() => navigate("/region-manager")}
    className="font-bold cursor-pointer text-[#820000] hover:text-[#5e0000]"
    aria-label="Navigate to Region Manager page"
  >
    RM
  </p>
  <ChevronRight color="#4B5C79" size={18} />
  <p className="font-bold text-[#303F58]">
    {getData?.rmData?.regionManager?.user?.userName
      ? getData?.rmData?.regionManager?.user?.userName
      : "N/A"}
  </p>
</div>


        <div className="col-span-12 flex items-center justify-between">
          <div
            className="grid grid-cols-12 gap-3 bg-cover rounded-xl p-2 w-full"
            style={{
              backgroundImage: `url(${BackgroundImage})`, // Use the imported image
            }}
          >
<div className="sm:col-span-4 col-span-12">
  <div>
    {/* Left Section: Area Icon and Details */}
    <div className="flex flex-col sm:flex-row gap-4 text-white">
      <div className="flex items-center gap-4 sm:gap-2 sm:flex-col">
        <div className="w-25 h-25 bg-blue py-2 flex items-center justify-center rounded-full">
          {getData?.rmData?.regionManager?.user?.userImage &&
          getData?.rmData?.regionManager?.user?.userImage.length > 500 ? (
            <img
              className="w-16 h-16 rounded-full"
              src={getData?.rmData?.regionManager?.user?.userImage}
              alt={`${getData?.rmData?.regionManager?.user?.userName}'s profile`}
            />
          ) : (
            <p className="w-16 h-16 bg-black rounded-full flex justify-center items-center">
              <UserIcon color="white" size={34} />
            </p>
          )}
        </div>
        <h2 className="font-normal text-2xl py-2 sm:text-center">
          {getData?.rmData?.regionManager?.user?.userName || "N/A"}
        </h2>
      </div>
    </div>

    {/* Centered Contact Info Section */}
    <div className="flex flex-col sm:flex-row gap-4 py-4 text-white justify-center items-center">
      {/* Contact Number */}
      <div className="flex flex-col items-center sm:items-start">
        <p className="text-xs font-medium text-[#8F99A9]">Contact Number</p>
        <h3 className="text-sm font-medium">
          {getData?.rmData?.regionManager?.user?.phoneNo || "N/A"}
        </h3>
      </div>

      {/* Divider (Hidden on Small Screens) */}
      <div className="hidden sm:block border-r border-[#DADADA] h-10 mx-4"></div>

      {/* Email */}
      <div className="flex flex-col items-center sm:items-start">
        <p className="text-xs font-medium text-[#8F99A9]">Email</p>
        <p className="text-sm font-medium">
          {getData?.rmData?.regionManager?.user?.email || "N/A"}
        </p>
      </div>

      {/* Divider (Hidden on Small Screens) */}
      <div className="hidden sm:block border-r border-[#DADADA] h-10 mx-4"></div>

      {/* Region */}
      <div className="cursor-pointer flex flex-col items-center sm:items-start">
        <p className="text-xs font-medium text-[#8F99A9]">Region</p>
        <p
          onClick={() =>
            navigate(`/regions/${getData?.rmData?.regionManager?.region?._id}`)
          }
          className="text-[#FFFFFF] text-sm font-medium underline"
        >
          {getData?.rmData?.regionManager?.region?.regionCode || "N/A"}
        </p>
      </div>
    </div>
  </div>
</div>



            <div className="col-span01"></div>

            <div className="sm:col-span-7 col-span-12  rounded-xl">
  <div className="rounded-xl">
  <div className="flex flex-col sm:flex-row justify-between  ml-2 text-[10px] py-2 text-white">
  {/* Manager Info Section */}
  <div className="flex  items-center gap-5  sm:mt-0">
  {/* Role Section */}
  <div className="flex flex-col items-center  text-left sm:text-end">
    <p className="text-xs text-[#D4D4D4] py-2">Role</p>
    <h3 className="text-xs">Regional Manager</h3>
  </div>

  {/* Employee ID Section */}
  <div className="fflex flex-col items-center  text-left sm:text-center">
    <p className="text-xs text-[#D4D4D4] py-2">Employee Id</p>
    <p className="text-xs">
      {getData?.rmData?.regionManager?.user?.employeeId || "N/A"}
    </p>
  </div>

  {/* Joining Date Section */}
  <div className="flex flex-col items-center  text-left sm:text-center">
    <p className="text-xs text-[#D4D4D4] py-2">Joining Date</p>
    <p className="text-xs">
      {getData?.rmData?.regionManager?.dateOfJoining
        ? new Date(getData.rmData.regionManager.dateOfJoining).toLocaleDateString("en-GB")
        : "N/A"}
    </p>
  </div>
</div>


  {/* Action Buttons Section */}
  <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-center sm:justify-end mt-6 sm:mt-0">
    {[
      {
        label: "Edit Profile",
        icon: <EditIcon size={18} color="#F0D5A0" />,
        onClick: () => handleModalToggle(true, false, false, false, false, false, false),
      },
      {
        label: "View Details",
        icon: <ViewRoundIcon size={18} color="#B6D6FF" />,
        onClick: () => handleModalToggle(false, true, false, false, false, false, false),
      },
      {
        label: "Awards",
        icon: <AwardIcon size={18} color="#B6FFD7" />,
        onClick: () => handleModalToggle(false, false, true, false, false, false, false),
      },
      {
        label: getData?.rmData?.regionManager?.status === "Active" ? "Deactivate" : "Activate",
        icon:
          getData?.rmData?.regionManager?.status === "Active" ? (
            <DeActivateIcon size={18} color="#D52B1E4D" />
          ) : (
            <UserRoundCheckIcon size={20} color="#D52B1E4D" />
          ),
        onClick: () => handleModalToggle(false, false, false, false, true, false, false),
      },
      {
        label: "Delete",
        icon: <Trash size={18} color="#BC3126" />,
        onClick: () => handleModalToggle(false, false, false, true, false, false, false),
      },
      {
        label: "Salary Info",
        icon: <SalaryRoundIcon size={18} color="#B6D6FF" />,
        onClick: () => handleModalToggle(false, false, false, false, false, true, false),
      },
      {
        label: "Commission",
        icon: <CommissionRoundIcon size={18} color="#B6FFFF" />,
        onClick: () => handleModalToggle(false, false, false, false, false, false, true),
      },
    ].map((button, index) => (
      <div
        key={index}
        className="flex flex-col items-center space-y-1 w-[80px] sm:w-auto cursor-pointer"
        onClick={button.onClick}
      >
        <div className="w-9 h-9 rounded-full border border-white bg-[#C4A25D4D] flex items-center justify-center">
          {button.icon}
        </div>
        <p className="text-center">{button.label}</p>
      </div>
    ))}
  </div>
</div>


    {/* HomeCards Section */}
    <div className="flex flex-col sm:flex-row gap-3 py-2 justify-between mt-4">
      {homeCardData.map((card, index) => (
        <HomeCard
          iconFrameColor={card.iconFrameColor}
          iconFrameBorderColor={card.iconFrameBorderColor}
          key={index}
          icon={card.icon}
          bgColor="transparent"
          titleColor="#D4D4D4"
          numberColor="#FFFFFF"
          number={card.number}
          title={card.title}
          border="white"
        />
      ))}
    </div>
  </div>
</div>

          </div>
        </div>

        <div className="mt-4">
          {user?.role === 'Region Manager' && <ProgressBar />}
        </div>


        <div className="grid grid-cols-12 gap-3">
  {/* Table Section */}
  <div className="col-span-12 md:col-span-7 py-1">
    <div>
      <Table<AreaData>
        data={totalAreaManaged}
        columns={columns}
        headerContents={{
          title: "Total Area Managed",
        }}
        noAction
        noPagination
        maxHeight="345px"
        loading={loading}
      />
    </div>
  </div>

  {/* RMViewAriaManagers Section */}
  <div className="col-span-12 md:col-span-5 py-1">
    <RMViewAriaManagers totalAreaManagers={totalAreaManagers} />
  </div>
</div>

        <div>
          <RMViewBDAandGraph getData={getData.rmData} loading={loading} totalBdas={totalBdas} />
        </div>
      </div>
      {/* Modal controlled by state */}
      <Modal
  open={isModalOpen.viewRM}
  onClose={() => handleModalToggle()}
  className="w-[50%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto"
>
  <RMViewForm id={iId} onClose={() => handleModalToggle()} />
</Modal>

      <Modal open={isModalOpen.editRM} onClose={() => handleModalToggle()}  className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]  max-sm:overflow-auto">
        <RMForm editId={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.awardRM}
        onClose={() => handleModalToggle()}
        align="right"
      className="w-[25%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[35%] mx-auto "
      >
        <RMViewAward getData={getData} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
         className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this Region manager?"
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal
        open={isModalOpen.deactiveRM}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            getData?.rmData?.regionManager?.status === "Active"
              ? "Are you sure want to deactivate this RM?"
              : "Are you sure want to activate this RM?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal open={isModalOpen.salaryInfoRM} onClose={() => handleModalToggle()}  className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
        <SalaryInfoModal salaryDetails={salaryDetails} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal open={isModalOpen.commissionRM} onClose={() => handleModalToggle()}  className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
        <CommissionModal id={iId} onClose={() => handleModalToggle()} />
      </Modal>


    </>
  );
};

export default RMView;
