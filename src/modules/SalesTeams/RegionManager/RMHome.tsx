import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AreaIcon from "../../../assets/icons/AreaIcon";
import EmailIcon from "../../../assets/icons/EmailIcon";
import MutiUserIcon from "../../../assets/icons/MultiUserIcon";
import RegionIcon from "../../../assets/icons/RegionIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import { useRegularApi } from "../../../context/ApiContext";
import useApi from "../../../Hooks/useApi";
import { RMData } from "../../../Interfaces/RM";
import { endPoints } from "../../../services/apiEndpoints";
import AddRegionManager from "./RMForm";
import { useResponse } from "../../../context/ResponseContext";

const RMHome = () => {
  const { totalCounts,refreshContext } = useRegularApi();
  const { request: getRM } = useApi("get", 3002);
  const [allRms, setAllRms] = useState<any[]>([]);
  const {loading,setLoading}=useResponse()
  const navigate = useNavigate();

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // Function to toggle modal visibility
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleEdit = (id: any) => {
    handleModalToggle();
    setEditId(id);
  };
  const handleView = (id: any) => {
    navigate(`/region-manager/${id}`);
  };

  const getRMs = async () => {
    try {
      setLoading(true)
      const { response, error } = await getRM(endPoints.GET_ALL_RM); 
      if (response && !error) {
        const transformedRMss =
          response.data.regionManager?.map((region: any) => ({
            ...region,
            dateOfJoining: region.dateOfJoining
              ? new Date(region.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A",
            loginEmail: region?.user?.email,
            userName: region?.user?.userName,
            userImage:region?.user?.userImage,
            regionName: region?.region?.regionName,
          })) || [];
        setAllRms(transformedRMss);
      } else {
        console.log(error?.response?.data?.message || "Failed to fetch data.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred.");
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getRMs();
    refreshContext({counts:true})
  }, []);

  useEffect(()=>{
    if(isModalOpen){
      refreshContext({counts:true})
    }else{
      getRMs();
    }
  },[isModalOpen])

  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "userName", label: "Name" },
    { key: "loginEmail", label: "Email Address" },
    { key: "user.phoneNo", label: "Phone No" },
    { key: "regionName", label: "Region" },
    { key: "status", label: "Status" },
  ];

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <UserIcon />,
      number: totalCounts?.totalRegionManagers,
      title: "Total Regional Manager",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <AreaIcon />,
      number: totalCounts?.totalArea,
      title: "Total Area",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <UserIcon />,
      number: totalCounts?.totalAreaManagers,
      title: "Total Area Manager",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <MutiUserIcon />,
      number: totalCounts?.totalBdas,
      title: "Total BDA's",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
  ];

  const name = "Name";
  const email = "Email";
  const region = "Region";

  const handleFilter = ({ options }: { options: string }) => {
    if (options === "Name") {
      // Create a new sorted array to avoid mutating the original state
      const sortedRms = [...allRms].sort((a, b) =>
        b?.userName?.localeCompare(a?.userName)
      );
      setAllRms(sortedRms);
    } else if (options === "Region") {
      const sortedRms = [...allRms].sort((a, b) =>
        b?.regionName?.localeCompare(a?.regionName)
      );
      setAllRms(sortedRms);
    } else {
      const sortedRms = [...allRms].sort((a, b) =>
        b?.loginEmail?.localeCompare(a?.loginEmail)
      );
      setAllRms(sortedRms);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
        <div>
         <h1 className="text-[#303F58] text-xl font-bold">Region Manager</h1>
          <p className="text-ashGray text-sm">
          Oversees business operations and growth across multiple regions. 
            </p>
         </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              handleModalToggle();
              setEditId("");
            }}
          >
            <span className="font-bold text-xl">+</span> Create RM
          </Button>
        </div>

        <div className="flex gap-3 py-2 justify-between mt-6">
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

        {/* Table Section */}
        <div>
          <Table<RMData>
            data={allRms}
            columns={columns}
            headerContents={{
              search: { placeholder: "Search Region Manager..." },
              sort: [
                {
                  sortHead: "Filter",
                  sortList: [
                    {
                      label: "Sort by Name",
                      icon: <UserIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: name }),
                    },
                    {
                      label: "Sort by Region",
                      icon: <RegionIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: region }),
                    },
                    {
                      label: "Sort by Email",
                      icon: <EmailIcon size={14} color="#4B5C79" />,
                      action: () => handleFilter({ options: email }),
                    },
                  ],
                },
              ],
            }}
            actionList={[
              { label: "edit", function: handleEdit },
              { label: "view", function: handleView },
            ]}
            loading={loading}
          />
        </div>

        {/* Modal Section */}
      </div>
      {/* Modal controlled by state */}
      <Modal open={isModalOpen} onClose={handleModalToggle}>
        <AddRegionManager editId={editId} onClose={handleModalToggle} />
      </Modal>
    </>
  );
};

export default RMHome;
