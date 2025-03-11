import { FC, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { months, years } from "../../../components/list/MonthYearList";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import NoRecords from "../../../components/ui/NoRecords"; // Import the NoRecords component

type Props = {};

const TargetComparison: FC<Props> = () => {
  const { request: TopTarget } = useApi("get", 3004);

  const [chartData, setChartData] = useState<any[]>([]);

  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];

  const [selectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [selectedData, setSelectedData] = useState<string>(`${currentYear.value}-${currentMonth.value}`);

  useEffect(() => {
    setSelectedData(`${selectedYear.value}-${selectedMonth.value}`);
  }, [selectedMonth, selectedYear]);

  const getPerformers = async () => {
    try {
      const endPoint = `${endPoints.YEARLY_TARGETS}?year=${selectedData}`;
      const { response, error } = await TopTarget(endPoint);

      if (response && response.data) {
        const transformedData = response.data.data.map((item: any) => ({
          name: item.month,
          pv: item.achievedTargets || 0,
          uv: item.totalTarget || 0,
        }));

        setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error");
        setChartData([]); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedData) {
      getPerformers();
    }
  }, [selectedData]);

  return (
    <div className="bg-white p-3 rounded-lg w-full  mx-auto">
      <div className="p-2 space-y-2 flex flex-col sm:flex-row sm:justify-between">
        <h1 className="text-lg font-bold">Target Comparison Chart</h1>
        <SelectDropdown
          setSelectedValue={setSelectedYear}
          selectedValue={selectedYear}
          filteredData={years}
          searchPlaceholder="Search Years"
          width="w-44"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row sm:space-x-2  ms-2">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="w-4 h-4 rounded-full bg-[#E07253] shadow-lg"></div>
          <h1>Achieved Target</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#54B86D] shadow-lg"></div>
          <h1>Set Target</h1>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 w-full">
        <div className="w-full h-64 sm:h-80 md:h-96">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend content={() => null} />
                <Bar dataKey="pv" fill="#E07253" radius={6} activeBar={<Rectangle fill="#E07253" stroke="#E07253" />} />
                <Bar dataKey="uv" fill="#54B86D" radius={6} activeBar={<Rectangle fill="#54B86D" stroke="#54B86D" />} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoRecords text="No Target Found" parentHeight="320px" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetComparison;