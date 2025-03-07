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
    getARM();
  };
  const { request: SalaryInfo } = useApi("get", 3002);
  const[salaryDetails,setSalaryDetails]=useState<any>('')
  const { request: getaRM } = useApi("get", 3002);
  const { request: deleteaRM } = useApi("delete", 3002)
  const { loading, setLoading } = useResponse()
  const { id } = useParams();
  const iId = staffId ? staffId : id
  const [getData, setGetData] = useState<{
    rmData: any;
  }>({ rmData: [] });

  const getARM = async () => {
    try {
      setLoading(true)
      const { response, error } = await getaRM(`${endPoints.GET_ALL_RM}/${iId}`);
      console.log("dssd",response?.data);
      if (response && !error) {
        if(staffId){
          sessionStorage.setItem("staffLocalityId",response?.data?.regionManager?.region?._id)
        }
        setGetData((prevData) => ({
          ...prevData,


          rmData: response.data,
        }));
        
        

      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching AM data:", err);
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    getARM();
  }, [iId]);


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
      console.error("Delete error:", err);
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
      console.log(response);
       console.log(error);
      
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



  const getRMInsiIdes = async () => {
    try {
      const { response, error } = await getRMInsiIde(`${endPoints.RM}/${iId}/details`);
      console.log(response, "res");
      console.log(error, "err");

      if (response && !error) {
        const data = response.data;
        console.log("Datas",data);
        
        console.log("dTAA", data.totalBdas);



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
        console.log(error.response.data.message);
      }
    } catch (err) {
      console.log(err, "error");
    }
  };

  useEffect(() => {
    getRMInsiIdes();
  }, []);

  // For debugging
  console.log("rmViewData", getData.rmData);

  const handleDeactivate = async () => {
    const body = {
      status: getData?.rmData?.regionManager?.status === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactivateRM(`${endPoints.DEACTIVATE_RM}/${iId}`, body);
      console.log(response);
      console.log(error, "error message");  
      if (response) {
        toast.success(response.data.message);
        getARM()
        navigate("/region-manager");

      } else {
        console.log(error?.response?.data?.message);

        toast.error(error?.response?.data?.message || "An error occurred");


      }
    } catch (err) {
      console.error("Deactivate error:", err);
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


  return (
    <>
      <div ref={topRef}>
        <div className="flex items-center text-[16px] my-2 space-x-2">
          <p
            onClick={() => navigate("/region-manager")}
            className="font-bold cursor-pointer text-[#820000] "
          >
            RM
          </p>
          <ChevronRight color="#4B5C79" size={18} />
          <p className="font-bold text-[#303F58] ">
            {getData?.rmData?.regionManager?.user?.userName
              ? getData?.rmData?.regionManager?.user?.userName
              : "N/A"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl ">
          <div
            className="grid grid-cols-12 gap-3 bg-cover rounded-xl p-2 w-full"
            style={{
              backgroundImage: `url(${BackgroundImage})`, // Use the imported image
            }}
          >
            <div className="col-span-4">
              <div>
                {/* Left Section: Area Icon and Details */}

                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-25 h-25 bg-blue ms-2 py-2 items-center justify-center rounded-full ">
                      {getData?.rmData?.regionManager?.user?.userImage && getData?.rmData?.regionManager?.user?.userImage.length > 500 ? (
                        <img
                          className="w-16 h-16 rounded-full"
                          src={getData?.rmData?.regionManager?.user?.userImage}
                          alt=""
                        />
                      ) : (
                        <p className="w-16 h-16    bg-black rounded-full flex justify-center items-center">
                          <UserIcon color="white" size={34} />
                        </p>
                      )}
                      <h2 className="font-normal text-center text-2xl py-2">
                        {getData?.rmData?.regionManager?.user?.userName
                          ? getData?.rmData?.regionManager?.user?.userName
                          : "N/A"}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="flex ms-4 gap-2 py-2 text-white">
                  <div className="">
                    <p className="text-xs font-medium text-[#8F99A9] py-2">
                      Contact Number
                    </p>
                    <h3 className="text-sm font-medium">
                      {getData?.rmData?.regionManager?.user?.phoneNo
                        ? getData?.rmData?.regionManager?.user?.phoneNo
                        : "N/A"}
                    </h3>
                  </div>
                  <div className="border-r border-[#DADADA] h-10 me-4"></div>
                  <div className="">
                    <p className="text-xs font-medium text-[#8F99A9] py-2">
                      Email
                    </p>
                    <p className="text-sm font-medium">
                      {getData?.rmData?.regionManager?.user?.email
                        ? getData?.rmData?.regionManager?.user?.email
                        : "N/A"}
                    </p>
                  </div>
                  <div className="border-r border-[#DADADA] h-10 me-4 "></div>
                  <div className="cursor-pointer">
                    <p className="text-xs font-medium text-[#8F99A9] py-2">
                      Region
                    </p>
                    <p
                      onClick={() =>
                        navigate(`/regions/${getData?.rmData?.regionManager?.region?._id}`)
                      }
                      className=" text-[#FFFFFF] text-sm font-medium underline"
                    >
                      {getData?.rmData?.regionManager?.region?.regionCode
                        ? getData?.rmData?.regionManager?.region?.regionCode
                        : "N/A"}
                    </p>{" "}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span01"></div>

            <div className="col-span-7 m-2">
              <div>
                <div className="flex  justify-between  gap-4 -ms-14  text-[10px] py-2  text-white">
                  {/* Right Section: Managers and Actions */}

                  <div className="flex -me-2  mt-2">
                    {/* Sales Managers */}
                    <div className=" text-end w-48">
                      <p className="text-xs text-[#D4D4D4] py-2">Role</p>
                      <h3 className="text-xs">Regional Manager</h3>
                    </div>

                    <div className="text-center w-24">
                      <p className="text-xs text-[#D4D4D4] py-2">Employee Id</p>
                      <p className="text-xs">
                        {getData?.rmData?.regionManager?.user?.employeeId
                          ? getData?.rmData?.regionManager?.user?.employeeId
                          : "N/A"}
                      </p>
                    </div>

                    <div className="text-center w-24">
                      <p className="text-xs text-[#D4D4D4] py-2">
                        Joining Date
                      </p>
                      <p className="text-xs">
                        {getData?.rmData?.regionManager?.dateOfJoining
                          ? new Date(getData.rmData.regionManager.dateOfJoining).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col w-fit items-center space-y-1">
                      <div
                        onClick={() => handleModalToggle(true, false, false, false, false, false, false)}
                        className="w-8 h-8 mb-2 rounded-full cursor-pointer"
                      >
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2">
                            <EditIcon size={18} color="#F0D5A0" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">Edit Profile</p>
                    </div>

                    <div className="flex flex-col  items-center space-y-1">
                      <div
                        onClick={() => handleModalToggle(false, true, false, false, false, false, false)}
                        className="w-8 h-8 mb-2 rounded-full cursor-pointer"
                      >
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2">
                            <ViewRoundIcon size={18} color="#B6D6FF" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">View Details</p>
                    </div>

                    <div className="flex flex-col   items-center space-y-1">
                      <div
                        onClick={() => handleModalToggle(false, false, true, false, false, false, false)}
                        className="w-8 h-8 mb-2 rounded-full cursor-pointer"
                      >
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2">
                            <AwardIcon size={18} color="#B6FFD7" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">Awards</p>
                    </div>

                    <div onClick={() => handleModalToggle(false, false, false, false, true, false, false)} className="flex flex-col -ms-2 items-center space-y-1">
                      <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
                        {getData?.rmData?.regionManager?.status === "Active" ?
                          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                            <div className="ms-2 mt-2">
                              <DeActivateIcon size={18} color="#D52B1E4D" />
                            </div>
                          </div>
                          :
                          <div className="rounded-full bg-[#B6FFD7] h-9 w-9 border border-white">
                            <div className="ms-2 mt-2">
                              <UserRoundCheckIcon size={20} color="#D52B1E4D" />
                            </div>
                          </div>

                        }

                      </div>
                      <p className="text-center ms-2">
                        {getData?.rmData?.regionManager?.status === "Active" ? "Deactivate" : "Activate"}
                      </p>
                    </div>

                    <div onClick={() => handleModalToggle(false, false, false, true, false, false, false)} className="flex flex-col -ms-2 items-center space-y-1">
                      <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2 ">
                            <Trash size={18} color="#BC3126" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">Delete</p>
                    </div>
                    <div onClick={() => handleModalToggle(false, false, false, false, false, true, false)} className="flex flex-col -ms-2 items-center space-y-1">
                      <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2 ">
                            <SalaryRoundIcon size={18} color="#B6D6FF" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">Saalry Info</p>
                    </div>
                    <div onClick={() => handleModalToggle(false, false, false, false, false, false ,true)} className="flex flex-col -ms-2 items-center space-y-1">
                      <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
                        <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                          <div className="ms-2 mt-2 ">
                            <CommissionRoundIcon size={18} color="#B6FFFF" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center ms-3">Commission</p>
                    </div>
                  </div>
                </div>
                {/* HomeCards Section */}

                <div className="flex gap-3 py-2 justify-between mt-4">
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
                      border='white'
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
          <div className="col-span-7 py-6 ">
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
          <div className="col-span-5 py-6">
            <RMViewAriaManagers totalAreaManagers={totalAreaManagers} />
          </div>
        </div>

        <div>
          <RMViewBDAandGraph getData={getData.rmData} loading={loading} totalBdas={totalBdas} />
        </div>
      </div>
      {/* Modal controlled by state */}
      <Modal open={isModalOpen.viewRM} onClose={() => handleModalToggle()}>
        <RMViewForm id={iId}  onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.editRM} onClose={() => handleModalToggle()}>
        <RMForm editId={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.awardRM}
        onClose={() => handleModalToggle()}
        align="right"
        className="w-[25%] me-16"
      >
        <RMViewAward getData={getData} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%]"
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
        className="w-[30%]"
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
      <Modal open={isModalOpen.salaryInfoRM} onClose={() => handleModalToggle()}>
        <SalaryInfoModal salaryDetails={salaryDetails} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal open={isModalOpen.commissionRM} onClose={() => handleModalToggle()} className="w-[45%]">
        <CommissionModal id={iId} onClose={() => handleModalToggle()} />
      </Modal>


    </>
  );
};

export default RMView;
