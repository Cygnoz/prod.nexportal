import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,

  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Table from "../../../components/ui/Table";
import { useEffect, useState } from "react";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { months, years } from "../../../components/list/MonthYearList";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import NoRecords from "../../../components/ui/NoRecords";
// import { allYears } from "../../../components/list/YearList";
interface BDAData {
  employeeId: string;
  bdaName: string;
  phoneNo: string;
  emailAdrees: string;
  dateOfJoining: string;

  totalLeads: string;
  leadsClosed: string;
}
type Props = {

  totalBdas: Array<any>;
  getData: any
  loading?: boolean
};



const RMViewBDAandGraph = ({ getData, totalBdas, loading }: Props) => {
  const { request: TopPerformingAM } = useApi("get", 3002);

  const [chartData, setChartData] = useState([]);
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);

  const [selectedData, setSelectedData] = useState<string>(
    `${selectedYear.value}-${String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, '0')}`
  );
  const navigate = useNavigate()

  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    // Convert month name to number (1-12) and ensure it's two digits
    const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
    setSelectedData(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);




  const handleView = (id: any) => {
    if (id) {
      navigate(`/bda/${id}`)
    }
  };
  const getPerformers = async () => {
    try {
      const endPoint = `${endPoints.GET_ALL_RM}/${getData?.regionManager?._id}/areamanager?date=${selectedData}`;
      const { response, error } = await TopPerformingAM(endPoint);
      console.log("API Endpoint:", endPoint);
      console.log("response", response);
      console.log("error", error);

      if (response && !error) {
        const transformedData = response.data.topPerformingAreaManagers.map((item: any) => ({
          name: item.user.userName,
          CR: parseFloat(item.conversionRate.replace("%", "")) // Convert "100.00%" to 100.00
        }));

        console.log("Transformed Data:", transformedData);
        setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error occurred");
        setChartData([])
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedData) {
      getPerformers();
    }
  }, [getData, selectedData]);



  const CustomLegend = () => {
    return (
      <div
        className="justify-between mt-6"
        style={{ display: "flex", gap: "10px" }}
      >
        <span style={{ color: "#e2b0ff" }}>Area1</span>
        <span style={{ color: "#8884d8" }}>Area2</span>
        <span style={{ color: "#82ca9d" }}>Area3</span>
        <span style={{ color: "#d86a57" }}>Area4</span>
        <span style={{ color: "#6ab6ff" }}>Area5</span>
      </div>
    );
  };


  const conversionMonth = [
    { label: 'January', value: 'january' },
    { label: 'February', value: 'february' },
    { label: 'March', value: 'march' },
    { label: 'April', value: 'april' },
    { label: 'May', value: 'may' },
    { label: 'June', value: 'june' },
  ]

  const conversionYaer = [
    { label: '2020', value: '2020' },
    { label: '2021', value: '2021' },
    { label: '2022', value: '2022' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
  ]


  const datas = [
    {
      name: "Jan 05",
      Area1: 5673,
      Area2: 5993,
      Area3: 9466,
      Area4: 2677,
      Area5: 3778,
      amt: 9000,
    },
    {
      name: "Jan 10",
      Area1: 4563,
      Area2: 9467,
      Area3: 6628,
      Area4: 6738,
      Area5: 3368,
      amt: 9777,
    },
    {
      name: "Jan 15",
      Area1: 1298,
      Area2: 3773,
      Area3: 3783,
      Area4: 4800,
      Area5: 9367,
      amt: 8000,
    },
    {
      name: "Jan 20",
      Area1: 1890,
      Area2: 4098,
      Area3: 9753,
      Area4: 3667,
      Area5: 3372,
      amt: 6000,
    },
    {
      name: "Jan 25",
      Area1: 1890,
      Area2: 2800,
      Area3: 1890,
      Area4: 4400,
      Area5: 4800,
      amt: 2181,
    },
    {
      name: "Jan 30",
      Area1: 1890,
      Area2: 1800,
      Area3: 1800,
      Area4: 4800,
      Area5: 4300,
      amt: 2500,
    },
  ];

  // Define the columns with strict keys
  const columns: { key: keyof BDAData; label: string }[] = [
    { key: "employeeId", label: "Employee ID" },
    { key: "bdaName", label: "BDA Name" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "emailAdrees", label: "Email Address" },
    { key: "dateOfJoining", label: "Date of Joining" },
    { key: "totalLeads", label: "Total Leads" },
    { key: "leadsClosed", label: "Leads Closed" },
  ];

  const bdaData = totalBdas.map((bda: any) => ({
    ...bda,
    employeeId: bda.employeeId, // or any unique identifier
    bdaName: bda.userName || "N/A", // Adjust according to your data structure
    phoneNo: bda.phoneNo || "N/A",
    emailAdrees: bda.email || "N/A",
    dateOfJoining: bda.dateOfJoining
      ? new Date(bda.dateOfJoining).toLocaleDateString("en-GB")
      : "N/A",
    totalLeads: bda.totalLeads || 0,
    leadsClosed: bda.leadsClosed || 0,
  }));







  //console.log("BDA",bdaData);
  const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FFC107', '#673AB7', '#3F51B5', '#00BCD4', '#8BC34A'];


  return (
    <div>
      {/* Table Section */}
      <div>
        <Table<BDAData>
          data={bdaData}
          columns={columns}
          headerContents={{
            title: "BDA,S",
            search: {
              placeholder:
                "Search Invoice by client name, invoice number, or date",
            },
          }}
          actionList={[{ label: "view", function: handleView }]}
          loading={loading}
        />
      </div>

      {/* Graph Section*/}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-4">
  {/* Table Section */}
  <div className="col-span-12 sm:col-span-7">
    <div className="py-3 bg-white p-2">
      <div className="py-1 ms-2 flex justify-between">
        <h2 className="font-bold max-sm:text-xs">Monthly Sales Growth by Area</h2>
        <div className="flex gap-1">
          <label htmlFor="month-select"></label>
          <SelectDropdown
            selectedValue={conversionMonth}
            filteredData={conversionMonth}
            width="w-32"
          />
          <SelectDropdown
            selectedValue={conversionYaer}
            filteredData={conversionYaer}
            searchPlaceholder="Search Month"
            width="w-28"
          />
        </div>
      </div>
      <div className="mt-5">
        <ResponsiveContainer width="100%" minHeight={345}>
          <LineChart
            width={720}
            height={400}
            data={datas}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend content={<CustomLegend />} />
            <Line type="monotone" dataKey="Area1" stroke="#e2b0ff" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Area2" stroke="#8884d8" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Area3" stroke="#82ca9d" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Area4" stroke="#d86a57" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Area5" stroke="#6ab6ff" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  {/* RMViewAriaManagers Section */}
  <div className="col-span-12 sm:col-span-5">
    <div className="p-3 bg-white w-full space-y-2 rounded-lg ">
      <div className="flex justify-between">
        <div>
          <p className="text-[#303F58] text-lg font-bold max-sm:text-xs">
            Top performing Area Managers
          </p>
          <p className="text-[#4B5C79] text-xs font-normal mt-3 max-sm:hidden">
            Based on lead Conversion Performance Metric
          </p>
        </div>
        <div className="flex gap-1">
  <label htmlFor="month-select"></label>
  <SelectDropdown
    setSelectedValue={setSelectedMonth}
    selectedValue={selectedMonth}
    filteredData={newMonthList}
    width="w-32 sm:w-24 md:w-28" // Adjust the width for different screen sizes
  />
  <SelectDropdown
    setSelectedValue={setSelectedYear}
    selectedValue={selectedYear}
    filteredData={years}
    searchPlaceholder="Search Month"
    width="w-28 sm:w-20 md:w-24" // Adjust the width for different screen sizes
  />
</div>

      </div>

      <div className="mt-2 custom-scrollbar" style={{ overflowX: 'auto' }}>
        {/* Wrapper for dynamic width */}
        <div style={{ width: '100%' }} className="-ms-4 mt-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer minWidth="100%" minHeight={320}>
              <BarChart height={280} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar barSize={30} dataKey="CR" radius={10}>
                  {chartData?.map((entry: any, index: any) => (
                    <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoRecords parentHeight="320px" />
          )}
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default RMViewBDAandGraph;
