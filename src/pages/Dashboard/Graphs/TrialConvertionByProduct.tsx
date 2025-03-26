import { FC, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { months, years } from "../../../components/list/MonthYearList";
import NoRecords from "../../../components/ui/NoRecords";
import ProductLogo from "../../../components/ui/ProductLogo";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";

const projectList = ["BillBizz", "SaloNex", "6NexD", "SewNex"];

const TrialConversionByProduct: FC = () => {
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentYearValue = String(new Date().getFullYear());

  const currentMonth = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYear = years.find((y) => y.value === currentYearValue) || years[0];

  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { request: getTrialConverted } = useApi("get", 3003);

  const fetchTrialConversionData = async () => {
    try {
      const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
      const selectedData = `${selectedYear.value}-${monthIndex}`;
  
      const endPoint = `${endPoints.PRODUCT_CONVERTION_RATE}?date=${selectedData}`;
      const { response, error } = await getTrialConverted(endPoint);
  
      if (response && !error) {
        const transformedData = response?.data?.data
          .filter((item:any) => projectList.includes(item.project))
          .map((item:any) => {
            const conversionRate = parseFloat(item.conversionRate.replace("%", ""));
            return {
              name: item.project,
              converted: conversionRate, // Keep as percentage
              notConverted: 100 - conversionRate, // Calculate remaining percentage
            };
          });
  
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setChartData([]);
    }
  };

  useEffect(() => {
    setNewMonthList(
      months.filter((m) => (selectedYear.value === currentYear.value ? m.value <= currentMonthValue : true))
    );
    fetchTrialConversionData();
  }, [selectedMonth, selectedYear]);

  const renderCustomizedTick = ({ x, y, payload }: any) => (
    <foreignObject x={x - 24} y={y} width={80} height={60}>
      <div className="flex items-center justify-center h-full gap-1">
        <ProductLogo projectName={payload.value} size={6} />
        <p className="text-xs text-center">{payload.value}</p>
      </div>
    </foreignObject>
  );

  return (
    <div className="bg-white p-3 rounded-lg w-full mx-auto">
      <div className="p-2 flex flex-col sm:flex-row sm:justify-between">
        <h1 className="text-lg font-bold">Trial Conversion Rate by Products</h1>
        <div className="flex space-x-2">
          <SelectDropdown setSelectedValue={setSelectedMonth} selectedValue={selectedMonth} filteredData={newMonthList} width="w-28" />
          <SelectDropdown setSelectedValue={setSelectedYear} selectedValue={selectedYear} filteredData={years} width="w-28" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 ms-2 mt-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#7CD5AB]"></div>
          <span className="text-sm">Converted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#6ABAF3]"></div>
          <span className="text-sm">Not Converted</span>
        </div>
      </div>

      <div className="mt-2 w-full h-64 sm:h-80 md:h-96">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={renderCustomizedTick} height={60} interval={0} />
              <YAxis tickFormatter={(tick) => `${tick}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "#333" }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar dataKey="notConverted" name="Not Converted" fill="#6ABAF3" stackId="1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="converted" name="Converted" fill="#7CD5AB" stackId="1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoRecords text="No Data Found" parentHeight="320px" />
        )}
      </div>
    </div>
  );
};

export default TrialConversionByProduct;