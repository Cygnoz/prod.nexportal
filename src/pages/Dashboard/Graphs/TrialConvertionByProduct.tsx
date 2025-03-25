import { FC, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
//   LabelList,
} from "recharts";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { 
    // months,
     years } from "../../../components/list/MonthYearList";
import NoRecords from "../../../components/ui/NoRecords";
import ProductLogo from "../../../components/ui/ProductLogo";

type Props = {};

const TrialConversionByProduct: FC<Props> = () => {
//   const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
//   const currentMonth = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear());
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];

//   const [selectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  
  const [chartData] = useState<any[]>([
    {
      name: 'BillBizz',
      converted: 80000,
      notConverted: 20000,
    },
    {
      name: 'SewNex',
      converted: 75000,
      notConverted: 25000,
    },
    {
      name: 'SaloNex',
      converted: 60000,
      notConverted: 40000,
    },
    {
      name: '6NexD',
      converted: 90000,
      notConverted: 10000,
    }
  ]);

  // Custom renderer for XAxis ticks
  const renderCustomizedTick = ({ x, y, payload }: any) => {
    return (
      <foreignObject x={x - 24} y={y} width={80} height={60}>
        <div className="flex items-center justify-center h-full gap-1">
          <ProductLogo projectName={payload.value} size={6}/>
          <p className="text-xs text-center">{payload.value}</p>
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="bg-white p-3 rounded-lg w-full mx-auto">
      <div className="p-2 space-y-2 flex flex-col sm:flex-row sm:justify-between">
        <h1 className="text-lg font-bold">Trial Conversion Rate by Products</h1>
        <div className="flex space-x-2">
          <SelectDropdown
            setSelectedValue={setSelectedYear}
            selectedValue={selectedYear}
            filteredData={years}
            searchPlaceholder="Search Years"
            width="w-44"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 ms-2 mt-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#7CD5AB]"></div>
          <span className="text-sm">Converted Licenser</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#6ABAF3]"></div>
          <span className="text-sm">Not Converted</span>
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
             barGap={0} // Set to 0 for no gap between bars of different groups
             barCategoryGap="20%" // Gap between categories
             stackOffset="expand" // Optional: if you want percentage stacking
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
                 backgroundColor: '#fff',
                 borderRadius: '6px',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
               }}
               itemStyle={{ color: '#333' }}
               labelStyle={{ fontWeight: 'bold' }}
             />
              <Bar 
               dataKey="notConverted" 
               name="Not Converted" 
               fill="#6ABAF3" 
               stackId="1" // Same stackId as above for stacking
               radius={[0, 0, 0, 0]} // Only round bottom corners
               maxBarSize={120}
             />
             <Bar 
               dataKey="converted" 
               name="Converted" 
               fill="#7CD5AB" 
               stackId="1" // Same stackId for stacking
               radius={[4, 4, 0, 0]} 
               maxBarSize={120}
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

export default TrialConversionByProduct;