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
import {
  months,
  // months,
  years,
} from "../../../components/list/MonthYearList";
import NoRecords from "../../../components/ui/NoRecords";
import ProductLogo from "../../../components/ui/ProductLogo";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";

type Props = {};

const ProductComparison: FC<Props> = () => {
  const currentMonthValue = new Date().toLocaleString("default", {
    month: "2-digit",
  });
  const currentMonth: any =
    months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any =
    years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<string>(
    `${selectedYear.value}-${String(
      months.findIndex((m) => m.value === selectedMonth.value) + 1
    ).padStart(2, "0")}`
  );

  const { request: getProductComparison } = useApi("get", 3003);

  const [chartData] = useState<any[]>([
    {
      name: "BillBizz",
      lead: 12,
      trial: 5,
      licensor: 13,
    },
    {
      name: "SewNex",
      lead: 8,
      trial: 3,
      licensor: 10,
    },
    {
      name: "SaloNex",
      lead: 15,
      trial: 7,
      licensor: 9,
    },
    {
      name: "6NexD",
      lead: 6,
      trial: 2,
      licensor: 8,
    },
  ]);

  // Custom renderer for XAxis ticks
  const renderCustomizedTick = ({ x, y, payload }: any) => {
    return (
      <foreignObject x={x - 24} y={y} width={80} height={60}>
        <div className="flex  items-center justify-center h-full gap-1 ">
          <ProductLogo projectName={payload.value} size={6} />
          <p className="text-xs text-center">{payload.value}</p>
        </div>
      </foreignObject>
    );
  };

  const getPerformers = async () => {
    try {
      const endPoint = `${endPoints.PRODUCT_COMPARISON}?date=${selectedData}`;
      const { response, error } = await getProductComparison(endPoint);
      console.log("API Endpoint:", endPoint);
      console.log("response", response);
      console.log("error", error);

      if (response && !error) {
        // const transformedData = response.data.topPerformingAreaManagers.map((item: any) => ({
        //   name: item.user.userName,
        //   CR: parseFloat(item.conversionRate.replace("%", "")) // Convert "100.00%" to 100.00
        // }));
        // console.log("Transformed Data:", transformedData);
        // setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error occurred");
        // setChartData([])
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setNewMonthList(
      months.filter(
        (m) =>
          selectedYear.value === currentYear.value // If selected year is the current year
            ? m.value <= currentMonthValue // Show months up to the current month
            : true // Otherwise, show all months
      )
    );
    // Convert month name to number (1-12) and ensure it's two digits
    const monthIndex = String(
      months.findIndex((m) => m.value === selectedMonth.value) + 1
    ).padStart(2, "0");
    setSelectedData(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    getPerformers();
  }, []);

  return (
    <div className="bg-white p-3 rounded-lg w-full mx-auto">
      <div className="p-2 space-y-2 flex flex-col sm:flex-row sm:justify-between">
        <h1 className="text-lg font-bold">
          Product Comparison Chart By Customers
        </h1>
        <div className="flex space-x-2">
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 ms-2 mt-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#6ABAF3]"></div>
          <span className="text-sm">Lead</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#8695DD]"></div>
          <span className="text-sm">Trial</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#7CD5AB]"></div>
          <span className="text-sm">Licensor</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-2 w-full">
        <div className="w-full h-64 sm:h-80 md:h-96">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60, // Increased bottom margin to accommodate the logos
                }}
                barGap={-20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={renderCustomizedTick}
                  height={60} // Increased height for the XAxis
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "#333" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Bar
                  dataKey="lead"
                  name="Lead"
                  fill="#6ABAF3"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                />
                <Bar
                  dataKey="trial"
                  name="Trial"
                  fill="#8695DD"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                />
                <Bar
                  dataKey="licensor"
                  name="Licensor"
                  fill="#7CD5AB"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoRecords text="No Data Found" parentHeight="320px" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
