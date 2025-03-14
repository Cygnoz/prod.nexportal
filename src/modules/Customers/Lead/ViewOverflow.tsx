import { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Button from "../../../components/ui/Button";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
// import { BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis, Bar } from "recharts";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, ResponsiveContainer, } from 'recharts';
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { months, years } from "../../../components/list/MonthYearList";
import NoRecords from "../../../components/ui/NoRecords";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  leadData?: any;
  getOneLead: () => void;
};

const ViewOverflow = ({ leadData, getOneLead }: Props) => {
  const { request: editLead } = useApi("put", 3001);
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ["New", "Contacted", "In Progress", "Lost", "Won"];
  const [lead, setLead] = useState<any>();
  const dropdownRef = useRef(null);
  const { request: leadEngagementOverTime } = useApi('get', 3001)
  const {setPostLoading}=useResponse()
 
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [selectedData, setSelectedDate] = useState<string>("");
  
  // **Update `selectedData` whenever month/year changes**
  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
    setSelectedDate(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);
  
  const getLeadEngagement = async () => {
    try {
      if (!leadData?._id || !selectedData) return; // Prevent API call if leadData is missing
  
      const endPoint = `${endPoints.LEAD_OVERTIME}/${leadData._id}?date=${selectedData}`;
  
      const { response, error } = await leadEngagementOverTime(endPoint);
  
      if (response && !error) {
        const engagementData = response.data.engagementData || {};
  
        // **Ensure numeric conversion for counts**
        const transformedData = Object.keys(engagementData).map((key) => ({
          name: key,
          count: Number(engagementData[key]) || 0,
        }));
  
        setChartData(transformedData);
      } else {
        console.error("API Error:", error?.response?.data?.message || error);
        setChartData([]); // Reset chart data on error
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setChartData([]); // Reset chart data on error
    }
  };
  
  // **Fetch data only after `selectedData` is updated**
  useEffect(() => {
    if (selectedData) {
      getLeadEngagement();
    }
  }, [leadData, selectedData]);
  
  


  const getStatusClass = (status: string | undefined) => {
    const statusMap: { [key: string]: { bgColor: string; textColor: string } } = {
      New: { bgColor: "bg-blue-500", textColor: "text-white" },
      Contacted: { bgColor: "bg-cyan-800", textColor: "text-white" },
      'In Progress': { bgColor: "bg-yellow-300", textColor: "text-black" },

      Lost: { bgColor: "bg-red-500", textColor: "text-white" },
      Won: { bgColor: "bg-green-500", textColor: "text-white" },
    };
    return statusMap[status!] || { bgColor: "bg-gray-200", textColor: "text-gray-700" };
  };

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const selectStatus = (status: string) => {
    setLead((prev: any) => ({ ...prev, leadStatus: status }));
  };


  const handleClickOutside = (event: any) => {
    const current: any = dropdownRef.current
    if (current && !current.contains(event.target)) {
      setIsOpen(false);
      setLead((prev: any) => ({ ...prev, leadStatus: leadData?.leadStatus }));
    }

  };
console.log('lead',lead);

  const handleSave = async () => {
    try {
      setPostLoading(true)
      const { response, error } = await editLead(`${endPoints.LEAD}/${leadData._id}`, lead);

      if (response && !error) {
        toast.success("Lead Status Updated Successfully");
        toggleDropdown();
        getOneLead();
      } else {
        console.error("Error:", error);
      }
    } catch (err) {
      console.error(err);
    }
    finally{
      setPostLoading(false)
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [leadData]);

  useEffect(() => {
    if (leadData) {
      setLead(leadData)
    }
  }, [leadData]);

  // const data = [
  //   { name: 'Calls', uv: 4000, pv: 2400, amt: 2400 },
  //   { name: 'Mails', uv: 3000, pv: 1398, amt: 2210 },
  //   { name: 'Meetings', uv: 2000, pv: 9800, amt: 2290 },
  //   { name: 'Chats', uv: 2780, pv: 3908, amt: 2000 },
  //   { name: 'Documents', uv: 1890, pv: 4800, amt: 2181 },
  // ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  // const normalizedData = data.map(item => ({
  //   ...item,
  //   uv: item.uv / 160, // Normalize uv values
  // }));

  // const [selectedActivity, setSelectedActivity] = useState({ label: 'Current Month', value: '' });
  // const handleActivitySelection = (selectedOption: any) => {
  //   setSelectedActivity(selectedOption);
  // };

  // const activityOptions = [
  //   { label: 'Previous Month', value: 'previousMonth' },
  //   { label: 'Q1', value: 'q1' },
  //   { label: 'Q2', value: 'q2' },
  //   { label: 'Q3', value: 'q3' },
  // ];


  const renderStep = (step: number, label: string, activeStatuses: string[]) => {
    const isActive = activeStatuses.includes(lead?.leadStatus);
    const { bgColor, textColor } = isActive ? getStatusClass(lead?.leadStatus) : getStatusClass('');

    return (
      <>
        <div className={`w-8 h-10 border-x ${bgColor} ${label === 'New' && 'rounded-s-3xl'}`}>
          <p className={`text-center text-sm font-bold mt-[9px] ${textColor}`}>{step}</p>
        </div>
        <div className={`w-40 h-10 ${bgColor} ${label === 'Won' || label === 'Lost' ? 'rounded-e-3xl' : ''}  border}`}>
          <p className={`text-center text-sm font-bold mt-2 ${textColor}`}>{label}</p>
        </div>
      </>
    );
  };

  return (
    <div>
<div className="w-full h-auto rounded-lg bg-[#FFFFFF] mt-4">
    <div className="flex flex-col md:flex-row items-center p-5 gap-6">
    <p className="text-[#14181B] text-base font-medium w-full md:w-auto">Lifecycle Stage</p>
    <div className="relative inline-block text-left w-full md:w-auto">
      <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
        <p className="text-[#820000] text-sm font-medium">Lead Status</p>
        <ChevronDown size={16} color="#820000" />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-50 w-full sm:w-56 md:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2"
        >
          <div className="py-1">
            {statuses.map((status: any) => (
              <div
                key={status}
                className={`px-4 py-2 text-sm flex items-center justify-between font-medium cursor-pointer ${lead?.leadStatus === status ? "bg-[#FEFBF8]" : ""}`}
                onClick={() => selectStatus(status)}
              >
                <p>{status}</p>
                {lead?.leadStatus === status && <p>✔</p>}
              </div>
            ))}
          </div>
          <Button onClick={handleSave} size="md" className="h-5 w-20 flex justify-center text-sm ms-auto">
            <p>Save</p>
          </Button>
        </div>
      )}
    </div>
  </div>

  <div className="flex justify-center items-center mt-2 ">
  <div className="flex flex-wrap justify-center w-full mx:md:gap-2">
    {renderStep(1, "New", ["New", "Contacted", "In Progress", "Won", "Lost"])}
    {renderStep(2, "Contacted", ["Contacted", "In Progress", "Won", "Lost"])}
    {renderStep(3, "In Progress", ["In Progress", "Won", "Lost"])}
    {renderStep(4, lead?.leadStatus == 'Lost' ? 'Lost' : 'Won', [lead?.leadStatus == 'Lost' ? 'Lost' : 'Won'])}
  </div>
</div>



  <div className="p-3 bg-white w-full space-y-2 rounded-lg mt-4">
    <div className="flex flex-col md:flex-row justify-between mb-6">
      <h2 className="font-bold p-2 w-full md:w-auto">Lead Engagement Over Time</h2>
      <div className="flex flex-col md:flex-row gap-3 md:mt-0">
       
        <SelectDropdown
          setSelectedValue={setSelectedYear}
          selectedValue={selectedYear}
          filteredData={years}
          width="w-full sm:w-44 md:w-44"
        />
         <SelectDropdown
          setSelectedValue={setSelectedMonth}
          selectedValue={selectedMonth}
          filteredData={newMonthList}
          width="w-full sm:w-44 md:w-44"
        />
      </div>
    </div>

    <div className="-ms-6">
      {chartData.length === 0 || chartData.every((data) => data.count === 0) ? (
        <NoRecords text="No Lead Found" parentHeight="320px" />
      ) : (
        <ResponsiveContainer width="100%" minHeight={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} ticks={[0, 5, 10, 15, 20, 25]} domain={[0, 25]} />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
</div>


    </div>
  );
};

export default ViewOverflow;
