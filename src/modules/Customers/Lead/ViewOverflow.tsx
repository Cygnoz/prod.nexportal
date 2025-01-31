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

type Props = {
  leadData?: any;
  getOneLead: () => void;
};

const ViewOverflow = ({ leadData, getOneLead }: Props) => {
  const { request: editLead } = useApi("put", 3001);
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ["New", "Contacted", "Inprogress", "Lost", "Won"];
  const [lead, setLead] = useState<any>();
  const dropdownRef = useRef(null);
  const { request: leadEngagementOverTime } = useApi('get', 3001)
  const [selectedMonth, setSelectedMonth] = useState<any>(months[0]);
  const [selectedYear, setSelectedYear] = useState<any>(years[years.length - 1])
  const [selectedData, setSelectedDate] = useState<string>(`${selectedYear.value}-1`);
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    // Convert month name to number (1-12)
    const monthIndex = months.findIndex((m) => m.value === selectedMonth.value) + 1;
    setSelectedDate(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);
  // const formatDate = (date: any) => {
  //   // Convert "2024-08-05" to "Aug 05"
  //   const options: any = { month: "short", day: "2-digit" };
  //   return new Date(date).toLocaleDateString("en-US", options);
  // };

  const getStatusClass = (status: string | undefined) => {
    const statusMap: { [key: string]: { bgColor: string; textColor: string } } = {
      New: { bgColor: "bg-blue-500", textColor: "text-white" },
      Contacted: { bgColor: "bg-cyan-800", textColor: "text-white" },
      Inprogress: { bgColor: "bg-yellow-100", textColor: "text-black" },

      Lost: { bgColor: "bg-red-500", textColor: "text-white" },
      Won: { bgColor: "bg-green-500", textColor: "text-white" },
    };
    return statusMap[status!] || { bgColor: "bg-gray-200", textColor: "text-gray-700" };
  };

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const selectStatus = (status: string) => {
    setLead((prev: any) => ({ ...prev, leadStatus: status }));
  };


  const getLeadEngagement = async () => {
    try {
      const endPoint = `${endPoints.LEADS}/${leadData?._id}/engagement?date=${selectedData}`
      console.log(endPoint);

      const { response, error } = await leadEngagementOverTime(endPoint)
      console.log('res', response);
      console.log('err', error);
      if (response && !error) {
        console.log(response.data);
        // const transformedData= response.data
        // const { date, engagementData } = response.data;

        // Transform `engagementData` object into an array for the chart
        // const transformedData = Object.keys(engagementData).map((key) => ({
        //   name: date[key], // X-axis labels (Mail, Meeting, Task, Note)
        //   count: engagementData[key] as number, // Y-axis values
        // }));

        const transformedData = Object.keys(response.data.engagementData).map((key) => ({
          name: key, // The key name (Mail, Meeting, Task, Note)
          count: response.data.engagementData[key], // Corresponding value
        }));

        setChartData(transformedData);
        console.log("data", transformedData);
      }
      else {
        console.log(error.response.data.message);

      }
    }
    catch (err) {
      console.error('error', err)
    }
  }
  useEffect(() => {
    getLeadEngagement()
  }, [leadData])


  const handleClickOutside = (event: any) => {
    const current: any = dropdownRef.current
    if (current && !current.contains(event.target)) {
      setIsOpen(false);
      setLead((prev: any) => ({ ...prev, leadStatus: leadData?.leadStatus }));
    }

  };

  const handleSave = async () => {
    try {
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
      <div className="w-full h-40 rounded-lg bg-[#FFFFFF] mt-4">
        <div className="flex items-center p-5 gap-6">
          <p className="text-[#14181B] text-base font-medium">Lifecycle Stage</p>
          <div className="relative inline-block text-left">
            <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
              <p className="text-[#820000] text-sm font-medium">Lead Status</p>
              <ChevronDown size={16} color="#820000" />
            </div>

            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute -right-16 mt-2 z-50  w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2"
              >
                <div className="py-1">
                  {statuses.map((status) => (
                    <div
                      key={status}
                      className={`px-4 py-2 text-sm flex items-center justify-between font-medium cursor-pointer ${lead?.leadStatus === status ? "bg-[#FEFBF8]" : ""
                        }`}
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

        <div className="flex justify-center items-center mt-2">
          <div className="flex h-10 items-center">
            {renderStep(1, "New", ["New", "Contacted", "Inprogress", "Won", "Lost"])}
            {renderStep(2, "Contacted", ["Contacted", "Inprogress", "Won", "Lost"])}
            {renderStep(3, "Inprogress", ["Inprogress", "Won", "Lost"])}
            {/* {renderStep(4, "Lost", ["Won", "Lost"])} */}
            {renderStep(4, lead?.leadStatus == 'Lost' ? 'Lost' : 'Won', [lead?.leadStatus == 'Lost' ? 'Lost' : 'Won'])}
          </div>
        </div>

        <div className="p-3 bg-white w-full space-y-2 rounded-lg mt-4">
          <div className="flex justify-between mb-6">
            <h2 className="font-bold p-2">Lead Engagement Over Time</h2>
            <div className="flex gap-1">
              <label htmlFor="month-select"></label>

              <SelectDropdown
                setSelectedValue={setSelectedMonth}
                selectedValue={selectedMonth}
                filteredData={months}
                // placeholder='Select Month'
                // searchPlaceholder="Search Month"
                width="w-44"
              />
              <SelectDropdown
                setSelectedValue={setSelectedYear}
                selectedValue={selectedYear}
                filteredData={years}
                // placeholder='Select Year'
                // searchPlaceholder="Search Year"
                width="w-44"
              />
            </div>
          </div>
          <div className="-ms-6">
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
          </div>
        </div>



      </div>
    </div>
  );
};

export default ViewOverflow;
