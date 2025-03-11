import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import LeadConvertionRateRegion from './Graphs/LeadConvertionRateRegion';
import PerformanceArea from './PerformanceArea';
import useApi from '../../../../Hooks/useApi';
import { useEffect, useState } from 'react';
import { months, years } from '../../../../components/list/MonthYearList';
import { endPoints } from '../../../../services/apiEndpoints';
import SelectDropdown from '../../../../components/ui/SelectDropdown';
import NoRecords from '../../../../components/ui/NoRecords';

type Props = {
  regionId: any
}

const RegionPerformanceView = ({regionId}: Props) => {
  //const { id } = useParams()

  const { request: TrialConverted } = useApi("get", 3003);
  const [chartData, setChartData] = useState<any[]>([]);
  const [areaNames, setAreaNames] = useState<any[]>([]); // Store area names separately
  
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<string>(
    `${currentYear.value}-${currentMonth.value}`
  );
  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    // Convert month name to number (1-12) and ensure it's two digits
    setSelectedData(`${selectedYear.value}-${selectedMonth.value}`);
  }, [selectedMonth, selectedYear]);

 
  
  
  const getPerformers = async () => {
    try {
      // const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
      // const formattedDate = `${selectedYear.value}-${monthIndex}`; // Ensure YYYY-MM format
      const endPoint = `${endPoints.TRIAL_CONVERTION_RATE}/${regionId}?date=${selectedData}`;
//    console.log("Fetching data for:", formattedDate); // ✅ Debugging
      console.log("API Endpoint:", endPoint); // ✅ Debugging
  
      const { response, error } = await TrialConverted(endPoint);
  
      if (response && response.data) {
        console.log("API Response:", response.data); // ✅ Debugging API response
  
        const trialConvertedOverTime = response.data. trialConvertedOverTime|| {};
        const areaNames = Object.keys(trialConvertedOverTime);
        setAreaNames(areaNames);
  
        const allDates = new Set<string>();
        areaNames.forEach((area) => {
          trialConvertedOverTime[area]?.forEach((entry: any) => {
            allDates.add(entry.date);
          });
        });
  
        const sortedDates = Array.from(allDates).sort();
        const formattedData = sortedDates.map((date) => {
          const entry: any = { name: date };
  
          areaNames.forEach((area) => {
            const areaData = trialConvertedOverTime[area]?.find((d: any) => d.date === date);
            entry[area] = areaData ? areaData.conversionCount : 0;
          });
  
          return entry;
        });
  
        setChartData(formattedData.length > 0 ? formattedData : []);
      } else {
        console.error("Error:", error?.data || "Unknown error");
        setChartData([]);
        setAreaNames([]);
      }
    } catch (err) {
      console.error(err);
      setChartData([]);
      setAreaNames([]);
    }
  };
  
  

  
  
  
  useEffect(() => {
    if (selectedData) {
      getPerformers();
    }
  }, [selectedData,regionId]);



  return (
    <div className='flex flex-col space-y-3 mt-2'>
      <PerformanceArea/>
    <LeadConvertionRateRegion/>
    <div className="bg-white w-full p-2">
    <div className="flex justify-between">
      <h1 className=" font-bold sm:text-lg md:text-xl">Trial converted over time</h1>
      <div className="flex gap-1">
        <SelectDropdown 
        setSelectedValue={setSelectedYear} 
        selectedValue={selectedYear}
         filteredData={years} 
         searchPlaceholder="Search Years" 
         width="w-44" 
         />
        <SelectDropdown 
        setSelectedValue={setSelectedMonth}
         selectedValue={selectedMonth} 
         filteredData={newMonthList} 
         searchPlaceholder="Search Months" 
         width="w-44" 
         />
      </div>
    </div>

    <div className="mt-5">
      {chartData.length > 0 ? (
        <ResponsiveContainer minWidth={1000} minHeight={400}>
        <LineChart width={1000} height={400} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
  <CartesianGrid strokeDasharray="3 3" vertical={false} />
  <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 25, right: 20 }} />
  <YAxis axisLine={false} tickLine={false} />
  <Tooltip />
  <Legend />

  {areaNames.map((area, index) => (
    <Line
      key={area}
      type="monotone"
      dataKey={area} // Use actual area name instead of "Area1"
      stroke={["#e2b0ff", "#8884d8", "#82ca9d", "#d86a57", "#6ab6ff"][index % 5]}
      strokeWidth={3}
      dot={false}
    />
  ))}
</LineChart>


        </ResponsiveContainer>
      ) : (
        <NoRecords imgSize={70} textSize="md" parentHeight="380px" />
      )}
    </div>
  </div>
    </div>
  )
}

export default RegionPerformanceView