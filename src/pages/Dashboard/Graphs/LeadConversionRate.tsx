import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useApi from "../../../Hooks/useApi";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { endPoints } from "../../../services/apiEndpoints";

type Props = {
  allRegions?:any
};

function LeadConversionRate({allRegions,}: Props) {
  const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FFC107', '#673AB7', '#3F51B5', '#00BCD4', '#8BC34A'];
  const { request: getConvertionRate } = useApi("get", 3003);


  
  

  const [getRegion, setGetRegion] = useState<any>()
  // const { refreshContext}=useRegularApi()
  const [chartData, setChartData] = useState<any>(); // State to store the chart data
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

  const getConvertion = async () => {
    try {
      const endPoint = selectedRegion ? `${endPoints.CONVERSION_RATE}/${selectedRegion.value}` : endPoints.CONVERSION_RATE;
      const { response, error } = await getConvertionRate(endPoint);

      if (response && !error) {
        // Transform the response data to match chart format
        const {areas,regionConversionRate}=response.data
        const transformedArea = areas.map((area: any) => ({
          name: area.areaName,
          CR: parseFloat(area.conversionRate) || 0, // Ensure the conversionRate is a number
        }));
        const filteredData={transformedArea,regionConversionRate}
      
      setChartData(filteredData)
      } else {
        // console.error(error.data);
      }
    } catch (err) {
      console.error(err);
    }
  };


  

  const handleFetchRegions = () => {
    if (allRegions && allRegions.length > 0) {
      const filteredRegions = allRegions.map((region: any) => ({
        value: String(region._id),
        label: region.regionName,
        country: region?.country,
      }));
      setGetRegion(filteredRegions)
    } else {
      console.warn("No regions found or data not yet loaded.");
    }
  };

  useEffect(() => {
    getConvertion();
    handleFetchRegions();
  }, [allRegions, selectedRegion]);

  return (
    <>
      <div className="p-3 bg-white w-full space-y-2 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Lead Conversion Rate per Region</h2>

          <SelectDropdown
            setSelectedValue={setSelectedRegion}
            selectedValue={selectedRegion}
            filteredData={getRegion}
            searchPlaceholder="Search Region"
            width="w-44"
          />
        </div>
        <h3 className="text-sm">{selectedRegion?.country}</h3>
        <h1 className="text-2xl font-medium">
          {chartData?.regionConversionRate || "0"} 
        </h1>

        <div className=" mt-2 custom-scrollbar" style={{ overflowX: 'auto' }}>
      {/* Add wrapper for the chart */}
      <div style={{ width: '100%' }} className="-ms-7">
  {/* Ensure enough space for all bars */}
  <ResponsiveContainer minWidth={950} minHeight={280}>
    <BarChart     
      data={chartData?.transformedArea}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" axisLine={false} tickLine={false} />
      <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
      <Tooltip />
      <Bar barSize={55} dataKey="CR" radius={10}>
        {chartData?.transformedArea?.map((entry:any, index:any) => (
          <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

    </div>


      </div>
    </>
  );
}

export default LeadConversionRate;
