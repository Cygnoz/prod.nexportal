import { useEffect, useState } from "react";
import AreaIcon from "../../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../../assets/icons/AreaMangerIcon";
import CalenderDays from "../../../../assets/icons/CalenderDays";
import EditIcon from "../../../../assets/icons/EditIcon";
import RegionIcon from "../../../../assets/icons/RegionIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
// import person from "../../../assets/image/Ellipse 14 (3).png";
import { useNavigate, useParams } from "react-router-dom";
import No_Data_found from '../../../../assets/image/NO_DATA.png';
import Button from "../../../../components/ui/Button";
import HomeCard from "../../../../components/ui/HomeCards";
import SearchBar from "../../../../components/ui/SearchBar";
import Table from "../../../../components/ui/Table";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import TopPerformingAM from "./Graphs/TopPerformingAM";
import TopPerformingBDA from "./Graphs/TopPerformingBDA";
import { useResponse } from "../../../../context/ResponseContext";

interface TeamData {
  employeeID: string;
  bdaName: string;
  aasignedArea: string;
  phoneNumber: string;
  dateOfJoining: string;
}

type Props = {
  teamData?:any
  handleModalToggle:(editRegion:boolean, addArea:boolean,deleteRegion:boolean,editAm:boolean)=>void
  setData?:any
};
// Data for HomeCards

const RegionTeamView = ({teamData,handleModalToggle,setData}: Props) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const {request:getPerformance}=useApi("get",3003)
  const {loading,setLoading}=useResponse()
  const {id}=useParams()
  const navigate=useNavigate()
  const [topPerformance,setTopPerformance]=useState({
    areaMangers:"",
    bdas:""
  })
  const homeCardData = [
    {
      icon: <AreaIcon size={24} />,
      number: teamData?.totalTeamMembers ? teamData?.totalTeamMembers : '0',
      title: "Total Team Members",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
    {
      icon: <UserIcon />,
      number: teamData?.activeTeamMembers ? teamData?.activeTeamMembers : '0',
      title: "Active Team Members",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },

    {
      icon: <AreaManagerIcon />,
      number: teamData?.leadsAssigned ? teamData?.leadsAssigned : '0',
      title: "Leads Assigned",
      iconFrameColor: "#E07253",
      iconFrameBorderColor: "#F4D7CFCC",
    },

    {
      icon: <AreaManagerIcon />,
      number: "498",
      title: "Revenue Generated",
      iconFrameColor: "#DA8FE0",
      iconFrameBorderColor: "#F4D7CFCC",
    },
  ];


 
  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "employeeId", label: "Employee ID" },
    { key: "userName", label: "BDA Name" },
    { key: "areaName", label: "Assigned Area" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "dateOfJoining", label: "Date Of Joining" },
  ];

  
  const getPerformers=async()=>{
   try{
    setLoading(true)
    const {response,error}=await getPerformance(`${endPoints.TOP_PERFORMANCE}/${id}`)  
    if(response && !error){
      setTopPerformance((prev)=>({
        ...prev,
        areaMangers:response.data.areaManagers,
        bdas:response.data.bdas
      }))
    }
   }catch(err){
    console.log(err);
    
   }finally{
    setLoading(false)
   }
  }

  useEffect(()=>{
    getPerformers()
  },[id])

  
  
  
  return (
  
    <>

      <div className="bg-white p-3 mt-5 rounded-lg w-full">
        {/* HomeCards Section */}
        <div className="justify-between grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 mt-2">
          {homeCardData.map((card, index) => (
            <HomeCard
              iconFrameColor={card.iconFrameColor}
              iconFrameBorderColor={card.iconFrameBorderColor}
              key={index}
              icon={card.icon}
              bgColor="#F5F9FC"
              titleColor="#8392A9"
              number={card.number}
              title={card.title}
            />
          ))}
        </div>
      </div>
      <div className="bg-white my-4 h-72 px-3 w-full">
  <div className="flex justify-between">
    <h1 className="my-6 font-bold text-base">Area Managers</h1>
    <div className="mt-4">
      <SearchBar
        placeholder="Search Area Manager"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
    </div>
  </div>

  <div
    className="px-4 overflow-x-auto custom-scrollbar"
    style={{
      display: "flex",
      overflowX: "auto",
      maxHeight: "100%",
      scrollBehavior: "smooth",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {teamData?.areaManagers?.length > 0 ? (
      <div className="flex gap-4">
        {teamData.areaManagers.map((card: any, index: any) => (
          <div
            key={index}
            className="my-1 bg-[#F5F9FC] p-4 w-64 rounded-lg flex-shrink-0"
          >
            <div className="flex justify-between my-1">
              {card.user?.userImage ? (
                <img
                  className="w-10 h-10 rounded-full"
                  src={card.user?.userImage}
                  alt=""
                />
              ) : (
                <p className="w-10 h-10 bg-black rounded-full flex justify-center items-center">
                  <UserIcon color="white" size={22} />
                </p>
              )}
              <div
                onClick={() => {
                  handleModalToggle(false, false, false, true);
                  setData((prev: any) => ({ ...prev, amEditId: card._id }));
                }}
                className="bg-[#FFFFFF] w-6 h-6 rounded-lg p-1 border border-[#E7E8EB] cursor-pointer"
              >
                <EditIcon color="#C4A25D" size={14} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="font-bold text-sm">{card.user?.userName}</h1>
              <h1 className="font-medium my-1 text-xs text-center h-5 w-fit p-1 rounded-lg bg-[#30B777] text-white flex items-center justify-center">
                {card.area?.areaName}
              </h1>
            </div>
            <div className="flex gap-1 my-3">
              <p className="font-medium text-xs">{card.user?.email}</p>
              <div className="w-1 h-1 rounded-full bg-[#F9A51A] mt-1"></div>
              <p className="font-medium text-xs">{card.user?.phoneNo}</p>
            </div>
            <Button
              variant="tertiary"
              className="font-medium text-xs"
              size="sm"
              onClick={() => navigate(`/area-manager/${card._id}`)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex justify-center flex-col items-center h-full w-full mt-4">
        <img width={70} src={No_Data_found} alt="No Data Found" />
        <p className="font-bold text-red-700">No Area Manager Found</p>
      </div>
    )}
  </div>
</div>


      {/* Table Section */}
      <div>
        <Table<TeamData>
          data={teamData?.transformedBdas ?? []}
          columns={columns}
          headerContents={{
            title: "BDA,s",
            search: { placeholder: "Search BDA By NAme" },
            sort: [
              {
                sortHead: "Filter By Area",
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
          noAction
          noPagination
          maxHeight="350px"
          skeltonCount={9}
          loading={loading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full my-3">
  <TopPerformingAM graphData={topPerformance?.areaMangers?.length > 0 ? topPerformance?.areaMangers : []} />
  <TopPerformingBDA graphData={topPerformance?.bdas?.length > 0 ? topPerformance?.bdas : []} />
</div>

   </>
  );
};

export default RegionTeamView;
