import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Table from "../../../components/ui/Table";
import { useNavigate } from "react-router-dom";
import useApi from "../../../Hooks/useApi";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { endPoints } from "../../../services/apiEndpoints";
import { months, years } from "../../../components/list/MonthYearList";
import NoRecords from "../../../components/ui/NoRecords";



interface TrailTableData {
  trailId: string;
  leadName: string;
  currentStatus: string;
  startDate: string;
  status: string;
}

type Props = {
  bdaData?: any;
  loading?:boolean
};

const GraphTable = ({ bdaData,loading }: Props) => {
  //console.log("hhh",bdaData);
  const { request: getConvertionBda } = useApi("get", 3002);

  const navigate = useNavigate();
  // const id=bdaData?bdaData:id
  
  const [chartData, setChartData] = useState([]);
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [selectedData, setSelectedDate] = useState<string>(`${selectedYear.value}-${currentMonth}-1`);

  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    // Convert month name to number (1-12)
    const monthIndex = months.findIndex((m) => m.value === selectedMonth.value) + 1;
    setSelectedDate(`${selectedYear.value}-${monthIndex}-1`);
  }, [selectedMonth, selectedYear]);
  const handleView = (id: any) => {
    navigate(`/trial/${id}`);
  };

  



  const getConvertion = async () => {
    try {
      const endPoint = `${endPoints.BDA}/${bdaData.bdaDetails.bda._id}/trial-conversions?date=${selectedData}`;
      const { response, error } = await getConvertionBda(endPoint);
      //console.log(endPoint);

      if (response && !error) {
        // Transform API data to chart data format
        const transformedData = response.data.trialConvertedOverTime.map((item: any) => ({
          name: formatDate(item.date), // Format the date to match "Jan 05"
          CR: item.conversionCount,   // Use the conversionCount value for the chart
        }));
        // console.log(response.data);

        setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error occurred");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getConvertion();
  }, [selectedData, bdaData]);
  //console.log(allMonths);

  const formatDate = (date: any) => {
    // Convert "2024-08-05" to "Aug 05"
    const options: any = { month: "short", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "customerId", label: "Trail ID" },
    { key: "leadName", label: "Lead Name" },
    { key: "trialStatus", label: "Current Status" },
    // { key: "status", label: "Priority" },
    { key: "startDate", label: "Start Date" },
  ];

  // const datass = {
  //  CurrentMonth: [
  //     { name: "Jan 05", Area1: 10, Area2: 20, Area3: 40, Area4: 70, Area5: 80 },
  //     { name: "Jan 10", Area1: 15, Area2: 25, Area3: 35, Area4: 60, Area5: 85 },
  //     { name: "Jan 15", Area1: 12, Area2: 22, Area3: 45, Area4: 40, Area5: 75 },
  //     { name: "Jan 20", Area1: 18, Area2: 28, Area3: 50, Area4: 55, Area5: 90 },
  //     { name: "Jan 25", Area1: 20, Area2: 35, Area3: 60, Area4: 65, Area5: 78 },
  //     { name: "Jan 30", Area1: 15, Area2: 25, Area3: 55, Area4: 58, Area5: 82 },
  //   ],
  //   PreviousMonth: [
  //     { name: "Feb 05", Area1: 20, Area2: 30, Area3: 60, Area4: 50, Area5: 40 },
  //     { name: "Feb 10", Area1: 25, Area2: 35, Area3: 55, Area4: 65, Area5: 70 },
  //     { name: "Feb 15", Area1: 22, Area2: 32, Area3: 75, Area4: 45, Area5: 60 },
  //     { name: "Feb 20", Area1: 28, Area2: 38, Area3: 70, Area4: 55, Area5: 50 },
  //     { name: "Feb 25", Area1: 30, Area2: 45, Area3: 80, Area4: 65, Area5: 60 },
  //     { name: "Feb 28", Area1: 25, Area2: 35, Area3: 75, Area4: 60, Area5: 70 },
  //   ],
  //   Q1: [
  //     { name: "Jan 05", Area1: 10, Area2: 20, Area3: 40, Area4: 70, Area5: 80 },
  //     { name: "Jan 10", Area1: 15, Area2: 25, Area3: 35, Area4: 60, Area5: 85 },
  //     { name: "Jan 15", Area1: 12, Area2: 22, Area3: 45, Area4: 40, Area5: 75 },
  //     { name: "Jan 20", Area1: 18, Area2: 28, Area3: 50, Area4: 55, Area5: 90 },
  //     { name: "Jan 25", Area1: 20, Area2: 35, Area3: 60, Area4: 65, Area5: 78 },
  //     { name: "Jan 30", Area1: 15, Area2: 25, Area3: 55, Area4: 58, Area5: 82 },
  //   ],
  //   Q2: [
  //     { name: "Feb 05", Area1: 20, Area2: 30, Area3: 60, Area4: 50, Area5: 40 },
  //     { name: "Feb 10", Area1: 25, Area2: 35, Area3: 55, Area4: 65, Area5: 70 },
  //     { name: "Feb 15", Area1: 22, Area2: 32, Area3: 75, Area4: 45, Area5: 60 },
  //     { name: "Feb 20", Area1: 28, Area2: 38, Area3: 70, Area4: 55, Area5: 50 },
  //     { name: "Feb 25", Area1: 30, Area2: 45, Area3: 80, Area4: 65, Area5: 60 },
  //     { name: "Feb 28", Area1: 25, Area2: 35, Area3: 75, Area4: 60, Area5: 70 },
  //   ],
  //   Q3: [
  //     { name: "Jan 05", Area1: 10, Area2: 20, Area3: 40, Area4: 70, Area5: 80 },
  //     { name: "Jan 10", Area1: 15, Area2: 25, Area3: 35, Area4: 60, Area5: 85 },
  //     { name: "Jan 15", Area1: 12, Area2: 22, Area3: 45, Area4: 40, Area5: 75 },
  //     { name: "Jan 20", Area1: 18, Area2: 28, Area3: 50, Area4: 55, Area5: 90 },
  //     { name: "Jan 25", Area1: 20, Area2: 35, Area3: 60, Area4: 65, Area5: 78 },
  //     { name: "Jan 30", Area1: 15, Area2: 25, Area3: 55, Area4: 58, Area5: 82 },
  //   ],
  //   Q4: [
  //     { name: "Feb 05", Area1: 20, Area2: 30, Area3: 60, Area4: 50, Area5: 40 },
  //     { name: "Feb 10", Area1: 25, Area2: 35, Area3: 55, Area4: 65, Area5: 70 },
  //     { name: "Feb 15", Area1: 22, Area2: 32, Area3: 75, Area4: 45, Area5: 60 },
  //     { name: "Feb 20", Area1: 28, Area2: 38, Area3: 70, Area4: 55, Area5: 50 },
  //     { name: "Feb 25", Area1: 30, Area2: 45, Area3: 80, Area4: 65, Area5: 60 },
  //     { name: "Feb 28", Area1: 25, Area2: 35, Area3: 75, Area4: 60, Area5: 70 },
  //   ],

  // };

  // const datas = [
  //   {
  //     name: "Jan 05",
  //     CR:"10"
  //   },
  //   {
  //     name: "Jan 10",
  //     CR:"10"
  //   },
  //   {
  //     name: "Jan 15",
  //    CR:"10"
  //   },
  //   {
  //     name: "Jan 20",
  //    CR:"10"
  //   },
  //   {
  //     name: "Jan 25",
  //     CR:"10"
  //   },
  //   {
  //     name: "Jan 30",
  //     CR:"10"
  //   },
  // ];


  return (
    <div>
   <div className="grid grid-cols-12 gap-4 mb-2">
  <div className="col-span-12 sm:col-span-5">
    <div className="py-3 bg-white p-2 rounded-lg">
      <div className="py-1 ms-2 flex justify-between items-center">
        <h2 className="font-bold">Trial Converted By BDA Overtime</h2>
        <div className="flex flex-col md:flex-row gap-3 mt-3 md:mt-0">
  
  <SelectDropdown
    setSelectedValue={setSelectedYear}
    selectedValue={selectedYear}
    filteredData={years}
    searchPlaceholder="Search Year"
    width="w-28" // Adjust width as needed
  />
  <SelectDropdown
    setSelectedValue={setSelectedMonth}
    selectedValue={selectedMonth}
    filteredData={newMonthList}
    searchPlaceholder="Search Month"
    width="w-28" // Adjust width to fit nicely
  />
</div>

      </div>
      <div className="mt-5">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" minHeight={330}>
            <LineChart
              width={510}
              height={330}
              data={chartData} // Use transformed data
              margin={{
                top: 5,
                right: 30,
                left: 2,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="CR" // Match the CR field in your data
                stroke="#e2b0ff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <NoRecords parentHeight="320px" />
        )}
      </div>
    </div>
  </div>
  <div className="col-span-12 sm:col-span-7">
    <div className="">
      <Table<TrailTableData>
        data={bdaData?.TransformedTrial}
        columns={columns}
        headerContents={{
          title: "Current Trails handled by BDA",
          search: { placeholder: "Search Trial Name" },
        }}
        actionList={[{ label: "view", function: handleView }]}
        maxHeight="325px"
        loading={loading}
      />
    </div>
  </div>
</div>


    </div>
  );
};

export default GraphTable;
