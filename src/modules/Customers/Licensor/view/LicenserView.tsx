import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import CalenderClock from "../../../../assets/icons/CalenderClock";
import ChevronRight from "../../../../assets/icons/ChevronRight";
import DeActivateIcon from "../../../../assets/icons/DeActivateIcon";
import EditIcon from "../../../../assets/icons/EditIcon";
import RegionIcon from "../../../../assets/icons/RegionIcon";
import RupeeIcon from "../../../../assets/icons/RupeeIcon";
import TicketCheck from "../../../../assets/icons/TicketCheck";
// import Trash from "../../../../assets/icons/Trash";
import UserIcon from "../../../../assets/icons/UserIcon";
import ViewRoundIcon from "../../../../assets/icons/ViewRoundIcon";
import licenserImg from '../../../../assets/image/LicenserView.jpeg';
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import Modal from "../../../../components/modal/Modal";
import HomeCard from "../../../../components/ui/HomeCards";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import LicenserForm from "../LicenserForm";
import LicenserViewForm from "./LicenserViewForm";
import PaymentTable from "./PaymentTable";
import RecentActivityView from "./RecenetActivity";
import SupportTicketTable from "./SupportTicketTable";
import { getStatusClass } from "../../../../components/ui/GetStatusClass";
import { useResponse } from "../../../../context/ResponseContext";
import RenewalModal from "./RenewalModal";
import UserRoundCheckIcon from "../../../../assets/icons/UserRoundCheckIcon";
import billbizzlogo from '../../../../assets/image/bilbizzprdLogo.png'
import ProductLogo from "../../../../components/ui/ProductLogo";

type Props = {
};

function LicenserView({ }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the top of the referenced element
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const { request: deleteLicenser } = useApi("delete", 3001);
  const { request: deactiveLicenser } = useApi('put', 3001)
  const { request: getaLicenser } = useApi('get', 3001)
  const { id } = useParams();
  const [licenseData, setLicenseData] = useState<any>()

  const [isModalOpen, setIsModalOpen] = useState({
    editLicenser: false,
    viewLicenser: false,
    confirm: false,
    renewalLicenser: false,
    deacivateLicenser: false,

  });
  const handleModalToggle = (

    editLicenser = false,
    viewLicenser = false,
    confirm = false,
    renewalLicenser = false,
    deacivateLicenser = false,


  ) => {
    setIsModalOpen((prevState) => ({
      ...prevState,
      editLicenser,
      viewLicenser,
      confirm,
      renewalLicenser,
      deacivateLicenser
    }));
    getOneLicenser()
    // if (getLead) getLead(); // Safeguard
  };


  const getOneLicenser = async () => {
    try {
      const { response, error } = await getaLicenser(`${endPoints.LICENSER}/${id}`);
      if (response && !error) {
        const Licenser = response.data; // Return the fetched data
        console.log("Fetched Licenser data:", Licenser);
        const { licensers, ...filteredLicencers } = Licenser
        setLicenseData(filteredLicencers);
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error('Error fetching Lead data:', error);
      }
    } catch (err) {
      console.error('Error fetching Lead data:', err);
    }
  };

  useEffect(() => {
    getOneLicenser()
  }, [id]);

  console.log("ssss", licenseData);


  const handleDelete = async () => {
    try {
      const { response, error } = await deleteLicenser(`${endPoints.LEAD}/${id}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/licenser");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the licenser.");
    }
  };

  const handleDeactivate = async () => {

    const body = {
      status: licenseData?.expiredStatus === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactiveLicenser(`${endPoints.DEACTIVATE_LICENSER}/${id}`, body);
      console.log('res', response);
      console.log("error message", error);

      console.log('body', body);

      if (response) {
        console.log('respondse', response.data);

        toast.success(response.data.message);
        navigate("/licenser");
      } else {
        console.log('error', error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the supervisor.");
    }
  };


  const { request: getInsideLicenser } = useApi('get', 3001);
  const [insideLicenserData, setInsideLicenserData] = useState<any>();
  const [recentActivities, setRecentActivities] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const { loading, setLoading } = useResponse()
  const getInsideViewLICENSER = async () => {
    try {
      setLoading(true)
      const { response, error } = await getInsideLicenser(`${endPoints.LICENSER}/${id}/details`);

      if (response && !error) {
        console.log(response.data);
        setInsideLicenserData(response.data);

        // Extract recentActivities & supportTickets
        if (response.data.licenserDetails) {
          setRecentActivities(response.data.licenserDetails.recentActivities || []);
          setSupportTickets(response.data.licenserDetails.supportTickets || []);
        }

      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching LICENSER data:", err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getInsideViewLICENSER();
  }, [id]);

  console.log("Licenser Data:", insideLicenserData);
  console.log("Recent Activities:", recentActivities);
  console.log("Support Tickets:", supportTickets);





  // Function to toggle modal visibility


  const homeCardData = [
    {
      icon: <RupeeIcon size={50} />,
      number: "₹75,9788",
      title: "Revenue",
      iconFrameColor: "#F9A51A",
      iconFrameBorderColor: "#FFF2DDCC",
    },
    {
      icon: <TicketCheck />,
      number: insideLicenserData?.licenserDetails?.openTickets || 0,
      title: "Open Tickets",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <RegionIcon size={24} />,
      number: insideLicenserData?.licenserDetails?.closedTickets || 0,
      title: "Closed Tickets",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <RegionIcon size={24} />,
      number: insideLicenserData?.licenserDetails?.startDate
        ? new Date(insideLicenserData.licenserDetails.startDate)
          .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
          .toUpperCase()
        : "N/A",
      title: "Start Date",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },

    {
      icon: <RegionIcon size={24} />,
      number: insideLicenserData?.licenserDetails?.endDate
        ? new Date(insideLicenserData.licenserDetails.endDate)
          .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
          .toUpperCase()
        : "N/A",
      title: "End Date",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
  ];
  const licenser: { key: any; label: string }[] = [
    { key: licenseData?.firstName, label: "Licenser Name" },
    { key: licenseData?.phone, label: "Phone" },
    {
      key: licenseData?.startDate ? new Date(licenseData.startDate).toLocaleDateString('en-GB') : null,
      label: "Starting Date"
    },
    {
      key: licenseData?.endDate ? new Date(licenseData.endDate).toLocaleDateString('en-GB') : null,
      label: "Ending Date"
    },
    { key: licenseData?.bdaDetails?.bdaName, label: "BDA" },
    { key: licenseData?.regionDetails?.regionName, label: "Region" },
    { key: licenseData?.areaDetails?.areaName, label: "Area" },
    { key: licenseData?.email, label: "Email" },
  ];

  const projectGradients: Record<string, string> = {
    BillBizz: "bg-gradient-to-br from-[#820000] to-[#2C353B]",
    SewNex: "bg-gradient-to-br from-[#007B7B] to-[#001515]",
    "6NexD": "bg-gradient-to-br from-[#1E90FF] to-[#0B355D]",
    SaloNex: "bg-gradient-to-br from-[#C67581] to-[#2E1317]",
  };
  const navigate = useNavigate()
  return (
    <>
      <div ref={topRef} className="text-[#4B5C79] space-y-2 mb-5">
        <div className="flex items-center text-[16px]  space-x-2 mb-4">
          <p onClick={() => navigate('/licenser')} className="font-bold cursor-pointer text-[#820000]">Licenser</p>
          <ChevronRight color="#4B5C79" size={18} />
          <p className="font-bold text-[#303F58]">{licenseData?.firstName}</p>
        </div>
        {/* HomeCards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 py-2 mt-2">
          {homeCardData.map((card, index) => (
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

        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-[24%] space-y-3">
            <div className="w-full grid grid-cols-12 gap-3 bg-white p-3 h-[130px] rounded-lg border shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="col-span-2 flex justify-center">
                <div
                  className="flex-shrink-0 flex justify-center items-center w-[40px] h-[40px] rounded-lg"
                  style={{
                    backgroundColor: '#DD3F3F',
                    border: `3px solid #FADDFCCC`,
                  }}
                >
                  <CalenderClock size={24} />
                </div>
              </div>

              <div className="col-span-10 flex flex-col justify-between h-full space-y-2">
                <p>Licenser Alert</p>

                {licenseData?.licensorStatus === "Expired" ? (
                  <>
                    <p className="text-[#E04F52] text-[16px] font-semibold">The Licenser has been expired</p>
                    <div
                      onClick={() => handleModalToggle(false, false, false, true, false)}
                      className={`${getStatusClass(licenseData?.licensorStatus)} flex items-center gap-2 w-fit ms-auto cursor-pointer`}
                    >
                      <p className="text-sm">Renew</p>
                    </div>
                  </>
                ) : null}

                {(licenseData?.licensorStatus === "Pending Renewal" || licenseData?.licensorStatus === "Active") && (
                  <>
                    <div className="flex items-start gap-2">
                      {/* Status Badge */}
                      <div className={`${getStatusClass(licenseData?.licensorStatus)} flex items-center ms-auto gap-2 w-fit`}>
                        <p className="text-sm">{licenseData?.licensorStatus}</p>
                      </div>

                      {/* End Date & Days Left */}
                      <div>
                        <p className="text-[#E04F52] text-[16px] font-semibold">
                          {licenseData?.endDate ? new Date(licenseData.endDate).toLocaleDateString("en-GB") : "No end date available"}
                        </p>
                        <p className="text-[#4B5C79] text-[14px] font-normal">
                          {licenseData?.endDate
                            ? `${Math.ceil((new Date(licenseData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                            : "No end date available"}
                        </p>
                      </div>
                    </div>

                    {/* Renew Button for "Pending Renewal" */}
                    {licenseData?.licensorStatus === "Pending Renewal" && (
                      <div
                        onClick={() => handleModalToggle(false, false, false, true, false)}
                        className={`${getStatusClass(licenseData?.licensorStatus)} flex items-center gap-2 w-fit ms-auto cursor-pointer`}
                      >
                        <p className="text-sm">Renew</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
          <div className={`gap-4 p-4 rounded-xl my-4 ${projectGradients[licenseData?.project]}`}>
    <div className="flex justify-between">
      <div className="flex gap-4">
        <ProductLogo projectName={licenseData?.project}/>
        <div>
          <p className="text-[#D6D6D6] text-xs font-normal">Plan</p>
          <p className="text-[#F3F3F3] text-xs font-normal">{licenseData?.planName}</p>
        </div>
      </div>
      <div>
        <p className="text-[#D6D6D6] text-xs font-normal">Duration</p>
        <p className="text-[#F3F3F3] text-xs font-normal">3 Months</p>
      </div>
    </div>
    <hr className="my-2" />
    <div>
      <p className="text-[#D6D6D6] text-xs font-normal">Price</p>
      <p className="text-[#F3F3F3] text-xs font-normal">₹25,000</p>
    </div>
  </div>
</div>

            <RecentActivityView insideLicenserData={insideLicenserData} recentActivities={recentActivities} />
          </div>

          <div className="w-full md:w-[86%] space-y-3">
            <div className="relative flex flex-col bg-white rounded-lg h-auto md:h-[130px]">
              {/* Profile Image or Default Icon */}
              {licenseData?.image && licenseData?.image > 50 ? (
                <img
                  src={licenseData?.image}
                  className="rounded-full absolute top-8 left-5 border-2 border-white bg-slate-500 w-[50px] h-[50px] md:w-[61px] md:h-[61px]"
                />
              ) : (
                <p className="rounded-full absolute top-8 left-5 border-2 flex items-center justify-center border-white bg-black w-[50px] h-[50px] md:w-[61px] md:h-[61px]">
                  <UserIcon color="white" size={30} />
                </p>
              )}

              {/* Background Image and Header Section */}
              <div
                className="h-[70px] bg-cover rounded-t-lg w-full flex justify-end md:h-[70px]"
                style={{ backgroundImage: `url(${licenserImg})` }}
              >
                <div className="flex pt-2 me-3">
                  {/* Edit Profile */}
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      onClick={() => handleModalToggle(true, false, false)}
                      className="w-6 h-6 mb-2 cursor-pointer rounded-full border-white"
                    >
                      <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                        <div className="ms-2 mt-2">
                          <EditIcon size={18} color="#F0D5A0" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center font-medium text-white text-[10px] ms-3">Edit Profile</p>
                  </div>

                  {/* View Details */}
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      onClick={() => handleModalToggle(false, true, false)}
                      className="w-6 h-6 mb-2 rounded-full cursor-pointer"
                    >
                      <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                        <div className="ms-2 mt-2">
                          <ViewRoundIcon size={18} color="#B6D6FF" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center font-medium text-white text-[10px] ms-3">View Details</p>
                  </div>

                  {/* Activate / Deactivate */}
                  <div onClick={() => handleModalToggle(false, false, false, false, true)} className="flex flex-col items-center">
                    <div className="w-8 h-8 mb-1 rounded-full cursor-pointer">
                      {licenseData?.expiredStatus === "Active" ? (
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
                    <p className="text-center font-medium text-[#4B5C79] text-xs ms-2">
                      {licenseData?.expiredStatus === "Active" ? "Deactivate" : "Activate"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Licenser Details */}
              <div className="py-3 bg-white rounded-b-lg px-2">
                <div className="flex justify-end flex-wrap items-end gap-x-6 gap-y-2">
                  {licenser.map((data) => (
                    <div className="text-[12px] md:text-[14px] flex flex-col text-left space-y-1" key={data.key}>
                      <p className="text-[#8F99A9]">{data.label}</p>
                      <p className="text-[#303F58] font-medium">{data.key}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SupportTicketTable supportTickets={supportTickets} loading={loading} />
            <PaymentTable />
          </div>
        </div>


      </div>
      {/* Modal controlled by state */}
      <Modal open={isModalOpen.viewLicenser} onClose={() => handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto">
        <LicenserViewForm onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.editLicenser} onClose={() => handleModalToggle()} className="w-[60%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto">
        <LicenserForm editId={id} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.confirm} align="center" onClose={() => handleModalToggle()} className="w-[30%]">
        <ConfirmModal prompt="Are you sure want to delete this licenser?" action={handleDelete} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.renewalLicenser} onClose={() => handleModalToggle()} className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]">
        <RenewalModal id={id} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal
        open={isModalOpen.deacivateLicenser}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            licenseData?.expiredStatus === "Active"
              ? "Are you sure want to deactivate this Licenser?"
              : "Are you sure want to activate this Licenser?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>
    </>
  );
}

export default LicenserView;
