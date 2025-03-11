import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VictoryLabel, VictoryPie, VictoryTheme } from "victory";
import AreaIcon from "../../../../assets/icons/AreaIcon";
import AreaManagerIcon from "../../../../assets/icons/AreaMangerIcon";
import LicenserCardIcon from "../../../../assets/icons/LicenserCardIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
import HomeCard from "../../../../components/ui/HomeCards";
import Table from "../../../../components/ui/Table";
import { regionAreaData, RegionView, regionLicenserData } from "../../../../Interfaces/RegionView";
import RRecentActivityView from "./RecentActivityView";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import { useEffect, useState } from "react";
import { months, years } from "../../../../components/list/MonthYearList";
import NoRecords from "../../../../components/ui/NoRecords";



type Props = {
  regionData?: any;
  regionAreaData?: RegionView;
  loading?: boolean
};

const RegionAriaView = ({ regionAreaData, loading }: Props) => {

  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  
  const navigate = useNavigate()
  const { request: getLeadSource } = useApi("get", 3003);
  const [pieData, setPieData] = useState<{ x: string; y: number; color: string }[]>([]);


  const areaHandleView = (id: any) => {
    navigate(`/areas/${id}`);
  };

  const licenserHandleView = (id: any) => {
    navigate(`/licenser/${id}`);
  };

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaIcon size={20} />,
      number: regionAreaData ? regionAreaData?.areas.length : 0,
      title: "Total Area's",
      iconFrameColor: "#DD9F86",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <UserIcon />,
      number: regionAreaData ? regionAreaData?.totalAreaManagers : 0,
      title: "Total AM",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },

    {
      icon: <AreaManagerIcon />,
      number: regionAreaData ? regionAreaData?.totalBdas : 0,
      title: "Total BDA's",
      iconFrameColor: "#E07253",
      iconFrameBorderColor: "#F4D7CFCC",
    },

    {
      icon: <AreaManagerIcon />,
      number: regionAreaData ? regionAreaData?.totalLeadThisMonth : 0,
      title: "New Leads This Month",
      iconFrameColor: "#DA8FE0",
      iconFrameBorderColor: "#F4D7CFCC",
    },

    {
      icon: <LicenserCardIcon />,
      number: regionAreaData ? regionAreaData?.totalLicensors : 0,
      title: "Open Licenses",
      iconFrameColor: "#8695DD",
      iconFrameBorderColor: "#CAD1F1CC",
    },
  ];


  const columns1: { key: any; label: string }[] = [
    { key: "customerId", label: "Licenser ID" },
    { key: "firstName", label: "Licenser Name" },
    { key: "leadSource", label: "Lead Source" },
    { key: "totalRevenue", label: "Total Revenue" },
    { key: "licensorStatus", label: "Status" },
  ];

  // Define the columns with strict keys
  const columns: { key: keyof regionAreaData; label: string }[] = [
    { key: "areaCode", label: "AreaCode" },
    { key: "areaName", label: "Area Name" },
    { key: "userName", label: "AreaManager" },
  ];

  const AreaRevData = [
    { name: "Area 001", pv: 74479, color: "#4caf50" }, // Green
    { name: "Area 002", pv: 56335, color: "#2196f3" }, // Blue
    { name: "Area 003", pv: 43887, color: "#ff9800" }, // Orange
    { name: "Area 004", pv: 19027, color: "#f44336" }, // Red
    { name: "Area 005", pv: 8142, color: "#9c27b0" }, // Purple
    { name: "Area 006", pv: 4918, color: "#3f51b5" }, // Blue
  ];
  const CustomizedAxisTick = ({ x, y, payload }: any) => {
    // Find the corresponding logo for the country

    return (
      <g transform={`translate(${x},${y})`}>
        <text y={2} fontSize={14} dy={3} textAnchor="end" fill="#666">
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomLabel = ({ x, y, width, value }: any) => (
    <text
      x={x + width + 10}
      y={y + 13}
      fontSize={10}
      textAnchor="start"
      fill="#000"
    >
      {value}
    </text>
  );

  
  const { id } = useParams()
  const getLeadSourceGraph = async () => {
    try {
      const { response, error } = await getLeadSource(
        `${endPoints.LEAD_SOURCE}/${id}?date=${currentYear.value}-${currentMonth.value}`
      );
      console.log("id", id);

      console.log("res", response);
      console.log("err", error);

      if (response && !error && response.data?.data) {
        // const leadData: Record<string, number> = response.data.data; // Explicitly type the response

        // setLeadSourceData(leadData);

        // Convert API data into pie chart format
        // const formattedPieData = Object.keys(leadData).map((key, index) => ({
        //   x: key,
        //   y: leadData[key],
        //   color: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"][index % 4], // Assign colors dynamically
        // }));
        const transformedData = Object.entries(response?.data?.data || {}) // Ensure it's an object
  .map(([key, value], index) => ({
    x: key,
    y: Number(value), // Ensure value is a number
    color: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"][index % 4], // Assign colors dynamically
  }))
  .filter((item) => item.y > 0); // Remove items with 0 value

setPieData(transformedData);


        // Convert API data into roles array
        // const formattedRoles = Object.keys(leadData).map((key, index) => ({
        //   name: key,
        //   count: leadData[key],
        //   color: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"][index % 4],
        // }));

        // setRoles(formattedRoles);
      } else {
        console.log(error?.response?.data?.message || "Error fetching data");
      }
    } catch (err) {
      console.error("Error message", err);
    }
  };

  useEffect(() => {
    getLeadSourceGraph();
  }, []);



  return (
    <div>
      <div className="bg-white  p-3 mt-5 rounded-lg">
        {/* HomeCards Section */}
        <div className="justify-between grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 py-2 mt-2">
          {homeCardData.map((card, index) => (
            <HomeCard
              iconFrameColor={card.iconFrameColor}
              iconFrameBorderColor={card.iconFrameBorderColor}
              key={index}
              icon={card.icon}
              bgColor="#F5F9FC"
              titleColor="#8392A9"
              number={card.number}
              title={card.title}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-5 ">
        <div className="col-span-8 max-md:col-span-8 max-sm:col-span-12">
          {/* Table Section */}
          <div>
            <Table<regionAreaData>
              data={regionAreaData?.areas ?? []} // Convert undefined to null
              columns={columns}
              headerContents={{
                title: "Areas",
                search: { placeholder: "Search Area By Name, Manager" },
              }}
              actionList={[{ label: "view", function: areaHandleView }]}
              noPagination
              maxHeight="380px"
              skeltonCount={9}
              loading={loading}
            />
          </div>
        </div>
        <div className="col-span-4 max-md:col-span-6 max-sm:col-span-12">
          <RRecentActivityView />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-5">
        <div className="col-span-8 max-md:col-span-6 max-sm:col-span-12">
          <div className="bg-white rounded-lg w-full">
            <div className="p-4 space-y-2">
              <h1 className="text-lg font-bold">Revenue By Area</h1>
              <h2 className="text-md">Area 0234</h2>
              <h2 className="text-md font-medium text-2xl">₹ 76,789,87</h2>
            </div>
            <div className="ms-1">
              <ResponsiveContainer width="100%" minHeight={400}>
                <BarChart
                  width={670}
                  height={400}
                  data={AreaRevData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={<CustomizedAxisTick />}
                    tickLine={false}
                    axisLine={{ stroke: '#000' }} // Y axis line
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    axisLine={{ stroke: 'transparent' }} // Remove X axis line
                    tickLine={false} // Remove ticks on the X axis
                  />
                  <Tooltip />
                  <Bar dataKey="pv" radius={[5, 5, 5, 5]} barSize={20} label={<CustomLabel />}>
                    {AreaRevData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-4 mb-4 max-md:col-span-6 max-sm:col-span-12">
          <div className="bg-white min-h-[530px] rounded-lg w-full -p-3">
            <h1 className="text-[#303F58] text-lg font-bold p-3">
              Leads Generated by Area by Source
            </h1>
            {pieData.length > 0 ? (
  <div className="-mt-3 relative">
    {/* Total Leads Count in Center */}
    <div className="absolute top-[32%] left-[39%] z-50 text-center">
      <p className="text-2xl font-bold">
        {pieData.reduce((acc, val) => acc + val.y, 0)}
      </p>
      <p className="text-md">Total Leads</p>
    </div>

    <div className="mt-4">
      {/* Victory Pie Chart */}
      <VictoryPie
        innerRadius={50}
        width={350}
        padAngle={4}
        data={pieData}
        theme={VictoryTheme.clean}
        labels={({ datum }) =>
          `${((datum.y / pieData.reduce((acc, item) => acc + item.y, 0)) * 100).toFixed(1)}%`
        }
        labelComponent={
          <VictoryLabel style={{ fill: "#303F58", fontSize: 15 }} />
        }
        style={{
          data: {
            fill: ({ datum }) => datum.color,
          },
        }}
      />

      {/* Legend for Pie Chart */}
      <div className="space-y-4 mx-10 mt-2">
        {pieData.map((role) => (
          <div
            key={role.x}
            className="flex items-center justify-between w-72 space-x-3"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span className="text-gray-800 font-medium text-xs">
                {role.x}
              </span>
            </div>
            <span className="ml-auto text-gray-600 text-xs">{role.y}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
) : (
  <NoRecords text="No Lead Source Found" parentHeight="320px" />
)}

          </div>
        </div>
      </div>

      {/* Table Section */}
      <div>
        <Table<regionLicenserData>
          data={regionAreaData?.licensers ?? []} // Convert undefined to null
          columns={columns1}
          headerContents={{
            title: "Licensers",
            search: { placeholder: "Search licenser..." },
          }}
          noPagination
          maxHeight="370px"
          actionList={[{ label: "view", function: licenserHandleView }]}
          skeltonCount={9}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default RegionAriaView;