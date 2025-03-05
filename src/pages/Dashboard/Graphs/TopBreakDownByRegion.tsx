import { VictoryLabel, VictoryPie, VictoryTheme } from "victory";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { useEffect, useState } from "react";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import No_Data_found from "../../../assets/image/NO_DATA.png";
import NoRecords from "../../../components/ui/NoRecords";

type Props = {
  allRegions?:any
}

function TopBreakDownByRegion({allRegions}: Props) {
  
  const { request: getConvertionRate } = useApi("get", 3003);
  const [roles, setRoles] = useState([
    { name: 'Regional Managers', count: 0, color: '#1B6C75' },
    { name: 'Area Managers', count: 0, color: '#30B777' },
    { name: 'BDA', count: 0, color: '#6ABAF3' },
    { name: 'Supervisors', count: 0, color: '#7CD5AB' },
    { name: 'Support Agent', count: 0, color: '#00B5B5' }
  ]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [getRegion, setGetRegion] = useState<any>();
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

  
  const getConvertion = async () => {
    try {
      const endPoint = selectedRegion.value.length>0 ? `${endPoints.TEAM_BREAK_DOWN}/${selectedRegion.value}` : endPoints.TEAM_BREAK_DOWN;
      const { response, error } = await getConvertionRate(endPoint);
      if (response && !error) {
        console.log("response",response.data);
        
        const { areaManager, bda, regionManager, supervisor, supportAgent } = response.data;

        // Update the roles array with the fetched data
        const updatedRoles = [
          { name: 'Regional Managers', count: regionManager, color: '#1B6C75' },
          { name: 'Area Managers', count: areaManager, color: '#30B777' },
          { name: 'BDA', count: bda, color: '#6ABAF3' },
          { name: 'Supervisors', count: supervisor, color: '#7CD5AB' },
          { name: 'Support Agent', count: supportAgent, color: '#00B5B5' }
        ];

        setRoles(updatedRoles);

        // Create pie data from the updated roles, excluding those with count 0
        const pieChartData = updatedRoles.filter(role => role.count > 0).map((role) => ({
          x: role.name,
          y: role.count,
          color: role.color
        }));

        setPieData(pieChartData);
      } else {
        console.error(error?.data);
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
      setGetRegion(filteredRegions);
    } else {
      console.warn("No regions found or data not yet loaded.");
    }
  };

  useEffect(() => {
    getConvertion();
    handleFetchRegions();
  }, [allRegions, selectedRegion]);

  const totalStaffCount = roles.reduce((acc, role) => acc + role.count, 0);

  return (
    <>
      <div className="bg-white min-h-[530px]  rounded-lg w-full -p-3">
        <div className="flex justify-between items-center p-3">
          <h1 className="text-[#303F58] text-lg font-bold ">Top Break Down By Region</h1>
          <SelectDropdown
            setSelectedValue={setSelectedRegion}
            selectedValue={selectedRegion}
            placeholder="All Regions"      
            filteredData={getRegion}
            searchPlaceholder="Search Region"
            width="w-44"
          />
        </div>

        {/* Only show the pie chart and breakdown if totalStaffCount > 0 */}
        {totalStaffCount > 0 ? (
 <div className="relative -mt-3">
 <VictoryPie
   innerRadius={55}
   padAngle={4}
   data={pieData}
   categories={{
     y: roles.map(role => role.name),
   }}
   theme={VictoryTheme.clean}
   labels={({ datum }) => `${((datum.y / totalStaffCount) * 100).toFixed(1)}%`}
   labelComponent={<VictoryLabel style={{ fill: '#303F58', fontSize: 15, marginLeft: -50 }} />}
   style={{
     data: {
       fill: ({ datum }) => datum.color,
     },
   }}
 />
 
 {/* Custom label in the center of the pie chart */}
 <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-[20%] z-20 text-center">
   <p className="text-xl font-semibold">{totalStaffCount}</p>
   <p className="text-md">Total Team</p>
 </div>

 <div className="flex justify-center pb-4 h-full">
   <div className="space-y-4">
     {roles.filter(role => role.count > 0).length > 0 ? (
       roles.filter(role => role.count > 0).map((role) => (
         <div key={role.name} className="flex items-center justify-between w-72 space-x-3">
           <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: role.color }} />
             <span className="text-gray-800 font-medium text-xs">{role.name}</span>
           </div>
           <span className="ml-auto text-gray-600 text-xs">{role.count}</span>
         </div>
       ))
     ) : (
       <div className="flex justify-center flex-col items-center">
         <img width={70} src={No_Data_found} alt="No Data Found" />
         <p className="font-bold text-red-700">No Records Found!</p>
       </div>
     )}
   </div>
 </div>
</div>


) : (
 
<NoRecords parentHeight="450px" imgSize={100} textSize="lg"/>
)}

      </div>
    </>
  );
}

export default TopBreakDownByRegion;
