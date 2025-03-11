import { useEffect, useState } from "react";
import ChevronDown from "../../assets/icons/ChevronDown";
import SearchBar from "../ui/SearchBar";
import ArrowUpIcon from "../../assets/icons/ArrowUpIcon";
import TicketCheck from "../../assets/icons/TicketCheck";
import BookCheckIcon from "../../assets/icons/BookCheckIcon";
import useApi from "../../Hooks/useApi";
import { endPoints } from "../../services/apiEndpoints";
import NoRecords from "../ui/NoRecords";


type Props = {
  onClose: () => void;
  id:any
}
// const activities = [
//   {
//     id: 1,
//     title: "Salary paid to Darrell Steward",
//     date: "27, Oct 2024",
//     time: "10:32 AM",
//     type: "salary",
//     details: "Darrel received his monthly salary of ₹12,000 for October 2024, paid via direct deposit on the 27th."
//   },
//   {
//     id: 2,
//     title: "Paid Overtime work payment of ₹ 500",
//     date: "02, Oct 2024",
//     time: "11:11 AM",
//     type: "overtime",
//     details: "Overtime payment processed for extra working hours."
//   },
//   {
//     id: 3,
//     title: "Paid Overtime work payment of ₹ 500",
//     date: "02, Oct 2024",
//     time: "11:11 AM",
//     type: "increase",
//     details: "Overtime payment processed for extra working hours."
//   },
//   {
//     id: 4,
//     title: "Paid Overtime work payment of ₹ 500",
//     date: "02, Oct 2024",
//     time: "11:11 AM",
//     type: "overtime",
//     details: "Overtime payment processed for extra working hours."
//   },
// ];

const CommissionModal = ({ onClose,id }: Props) => {
  const [search, setSearch] = useState("");
  console.log("sea",search);
  
  const {request:getCommission}=useApi('get',3002)
  const [commission,setCommission]=useState<any>()
  const [recentActivities,setRecentActivities]=useState<[]>([])
  const [expanded, setExpanded] = useState<number | null>(null);
  // const filteredActivities = activities.filter((activity) =>
  //   activity.title.toLowerCase().includes(search.toLowerCase())
  // );
  const getCommissionDatas=async()=>{
    try {
      const {response,error} = await getCommission(`${endPoints.WCS}/${id}`);
     if(response &&!error){
      console.log("res",response.data)
      setCommission(response?.data?.commissionProfile)
      setRecentActivities(response?.data.recentActivities)
     }else{
      console.log("er",error)
     }
    } catch (error) {
      console.error(error); 
    }
  }
  useEffect(()=>{
   if(id){
     getCommissionDatas()
   }  
  },[id])
  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <div className="px-2 ">
          <h1 className="font-bold text-sm">Commission Profile</h1>
          <p className="text-xs mt-2 font-normal text-[#8F99A9]"> Growth is the only constant, let's chase it together</p>

        </div>
        {/* <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-900 font-bold "
                >
                    <p className="text-xl">&times;</p>
                </button> */}
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>

      </div>
      <div className="flex flex-wrap justify-between p-4 border rounded-lg bg-gray-100 mt-3">
  <div className="w-full sm:w-auto mb-2 sm:mb-0">
    <p className="text-[#8F99A9] text-xs font-medium">Commission</p>
    <p className="font-bold text-xs text-[#303F58]">{commission?.profileName || "N/A"}</p>
  </div>
  <div className="w-full sm:w-auto mb-2 sm:mb-0">
    <p className="text-[#8F99A9] text-xs font-medium">Commission point</p>
    <p className="font-bold text-xs text-[#303F58]">{commission?.commissionPoint || 0}</p>
  </div>
  <div className="w-full sm:w-auto mb-2 sm:mb-0">
    <p className="text-[#8F99A9] text-xs font-medium">No of threshold</p>
    <p className="font-bold text-xs text-[#303F58]">{commission?.thresholdLicense || 0}</p>
  </div>
  <div className="w-full sm:w-auto">
    <p className="text-[#8F99A9] text-xs font-medium">Recurring Point</p>
    <p className="font-bold text-xs text-[#303F58]">{commission?.recurringPoint || 0}</p>
  </div>
</div>

      {/* Activity Timeline */}
      <div className="mt-4 flex justify-between">
        <h2 className="text-sm font-bold mt-2 ms-2">Activity Timeline</h2>
        <div className="relative">
          <SearchBar
            placeholder="Search Category"
            searchValue=""
            onSearchChange={() => { setSearch }}
          />
        </div>
      </div>

      <div className="mt-4 pl-2 space-y-6 relative">
  {recentActivities.length > 0 ? (
    <>
      <div className="absolute left-7 top-0 bottom-0 w-1 bg-gray-200"></div>
      {recentActivities.map((activity: any, index: any) => {
        const timestamp = activity?.timestamp; // Example: "11/02/25 18:20:34 (IST)"
        let datePart = "";
        let timePart = "";

        if (timestamp) {
          const [date, timeWithZone] = timestamp.split(" ");
          const time = timeWithZone?.split("(")[0]?.trim();

          const formatTime = (timeStr: any) => {
            const [hours, minutes, seconds] = timeStr.split(":");
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
            return `${formattedHour}:${minutes}:${seconds} ${ampm}`;
          };

          datePart = date;
          timePart = time ? formatTime(time) : "";
        }

        return (
          <div key={index} className="relative">
            {/* Main Activity Line */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full text-white text-lg z-10 bg-[#A7EFAC]">
                  {activity.type === "salary" ? (
                    <ArrowUpIcon size={14} />
                  ) : activity.type === "overtime" ? (
                    <TicketCheck color="#303F58" />
                  ) : (
                    <BookCheckIcon size={18} />
                  )}
                </div>
                <p className="font-semibold text-xs text-[#303F58]">
                  {activity.details}
                </p>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <p className="font-semibold text-xs text-[#303F58]">
                  {datePart} {timePart}
                </p>
                <button
                   onClick={() =>
                    setExpanded(expanded === index ? null : index)
                  }
                >
                  <ChevronDown color="#303F58" />
                </button>
              </div>
            </div>
        
            {/* Expanded Section */}
            {expanded === index && (
              <div className="mt-4 ml-2 p-3 bg-red-100 font-semibold text-xs text-[#303F58] rounded-lg w-full">
                {activity.details}
              </div>
            )}
          </div>
        );
        
      })}
    </>
  ) : (
    <NoRecords imgSize={60} textSize="md" text="No Activities found" />
  )}
</div>



    </div>
  )
}

export default CommissionModal