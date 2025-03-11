import AreaManagerIcon from "../../../assets/icons/AreaMangerIcon";
import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon";
import LicenserCardIcon from "../../../assets/icons/LicenserCardIcon";
// import PhoneIcon from "../../../assets/icons/PhoneIcon";
import RupeeIcon from "../../../assets/icons/RupeeIcon";
// import Trophy from "../../../assets/icons/Trophy";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,

  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Boxes from "../../../assets/icons/Boxes";
// import profileImage from "../../../assets/image/AvatarImg.png";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  id: any;
};

interface AreaData {
  employeeId: string;
  bdaName: string;
  phoneNumber: string;
  emailAddress: string;
  dateOfJoining: string;
  totalLeads: string;
  leadsclosed: String;
}

const TeamOverview = ({ id }: Props) => {
  const { request: getTeamData } = useApi("get", 3003);
  const {loading,setLoading}=useResponse()
  const [teamData, setTeamData] = useState<any>();
  const handleEditDeleteView = (editId?: any, viewId?: any, deleteId?: any) => {
    if (viewId) {
      // navigate(`/areaView/${viewId}`)
      console.log(viewId);
    } else if (editId) {
      console.log(editId);
      // setId({...id,edit:editId})
    }
    console.log(deleteId);
  };

  // Data for HomeCards
  const homeCardData = [
    {
      icon: <AreaManagerIcon size={24} />,
      number: teamData ? teamData.statistics?.totalBdas : 0,
      title: "Total  BDA'S",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <LeadsCardIcon size={40} />,
      number: teamData ? teamData.statistics?.totalLeads : 0,
      title: "Total Lead's",
      iconFrameColor: "#DD9F86",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon: <Boxes />,
      number: teamData ? teamData.statistics?.totalLicensor : 0,
      title: "Total Licenser",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <LicenserCardIcon />,
      number: teamData ? teamData.statistics?.activeLicensor : 0,
      title: "Active License Count",
      iconFrameColor: "#8695DD",
      iconFrameBorderColor: "#CAD1F1CC",
    },
    {
      icon: <RupeeIcon size={20} />,
      number: "2898",
      title: "Revenue Generated",
      iconFrameColor: "#FCB23E",
      iconFrameBorderColor: "#FDE3BB",
    },
  ];
  
  // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "employeeId", label: "Employee ID" },
    { key: "userName", label: "BDA Name" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "email", label: "Email Address" },
    { key: "dateOfJoining", label: "Date Of Joining" },
    { key: "totalLeads", label: "Total leads" },
    { key: "leadsClosed", label: "Leads Closed" },
  ];

  const AreaRevData = [
    { name: "John ", pv: 74479, color: "#4caf50" }, // Green
    { name: "Emily", pv: 56335, color: "#2196f3" }, // Blue
    { name: "Michael ", pv: 43887, color: "#ff9800" }, // Orange
    { name: "Sophia ", pv: 19027, color: "#f44336" }, // Red
    { name: "David ", pv: 8142, color: "#9c27b0" }, // Purple
    { name: "Olivia", pv: 4918, color: "#3f51b5" }, // Blue
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

  // // Chart Data
  // const ChartData = [
  //   { name: "Page A", uv: 3900, avatar: profileImage },
  //   { name: "Page B", uv: 3000, avatar: profileImage },
  //   { name: "Page C", uv: 2000, avatar: profileImage },
  //   { name: "Page D", uv: 2780, avatar: profileImage },
  //   { name: "Page E", uv: 1890, avatar: profileImage },
  //   { name: "Page F", uv: 2390, avatar: profileImage },
  //   { name: "Page G", uv: 3490, avatar: profileImage },
  //   { name: "Page H", uv: 4000, avatar: profileImage },
  // ];

  // // Normalize the data
  // const maxValue = Math.max(...ChartData.map((entry) => entry?.uv));
  // const normalizedData = ChartData.map((entry) => ({
  //   ...entry,
  //   uv: (entry?.uv / maxValue) * 100,
  // }));

  // // Custom Bubble Component
  // const CustomBubble = (props: any) => {
  //   const { x, y } = props;

  //   if (x == null || y == null) return null;
  //   return (
  //     <div
  //       style={{
  //         position: "absolute",
  //         left: `${x - 4}px`,
  //         top: `${y - 8}px`,
  //         width: "8px",
  //         height: "8px",
  //         backgroundColor: "#30B777",
  //         borderRadius: "50%",
  //       }}
  //     />
  //   );
  // };

  // // Custom Bar Shape with Curved Top
  // const CustomBarWithCurve = (props: any) => {
  //   const { x, y, width, height, fill } = props;

  //   if (!x || !y || !width || !height) return null;

  //   const radius = width / 2;
  //   const gap = 2;

  //   return (
  //     <>
  //       <rect
  //         x={x}
  //         y={y + gap}
  //         width={width}
  //         height={height - radius - gap}
  //         fill={fill}
  //         rx={radius}
  //         ry={radius}
  //       />
  //       <circle
  //         cx={x + radius}
  //         cy={y - radius + gap}
  //         r={radius}
  //         fill="#30B777"
  //       />
  //     </>
  //   );
  // };



  const getTeamDetails = async () => {
    try {
      setLoading(true)
      const { response, error } = await getTeamData(
        `${endPoints.GET_AREAS}/${id}/overview`
      );
      if (response && !error) {
        console.log("resss",response.data);
        
        const {bdas,statistics}=response.data
        const filteredBdas=bdas.map((bda:any)=>({
          ...bda,
          dateOfJoining: bda.dateOfJoining
              ? new Date(bda.dateOfJoining).toLocaleDateString("en-GB")
              : "N/A"
        }))
        const team={filteredBdas,statistics}
        setTeamData(team)
      } else {
        console.log(error.response.data);
      }
    } catch (err) {
      console.log(err);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getTeamDetails();
  }, [id]);

  
  const topPerformingBDA = teamData?.filteredBdas.map((bda: any) => ({
    CR: parseFloat(bda?.bdaConversionRate),
    name: bda?.userName,
  }));
  
  const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FFC107', '#673AB7', '#3F51B5', '#00BCD4', '#8BC34A'];


  return (
    <div>
      {/* HomeCards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-2">
        {homeCardData.map((card, index) => (
          <HomeCard
            iconFrameColor={card.iconFrameColor}
            iconFrameBorderColor={card.iconFrameBorderColor}
            key={index}
            icon={card.icon}
            number={card.number}
            title={card.title}
          />
        ))}
      </div>

      {/* Table Section */}
      <div className="mt-2">
        <Table<AreaData>
          data={teamData?.filteredBdas}
          columns={columns}
          headerContents={{
            title: "BDA,s",
            search: { placeholder: "Search BDA By Name" },
          }}
          actionList={[{ label: "view", function: handleEditDeleteView }]}
          loading={loading}
        />
      </div>
      {/* Graph Section*/}
      <div className="grid grid-cols-1  md:grid-cols-12 sm:grid-cols-2 gap-3 mt-3 ">
      <div className="col-span-12 md:col-span-7 mb-4 w-full">
          <div className="bg-white rounded-lg w-full ">
            <div className="p-4 space-y-2">
              <h1 className="text-lg font-bold">
                Sales Revenue By Team Member
              </h1>
              <h2 className="text-md">Area 0234</h2>
              <h2 className="text-md font-medium text-2xl">₹ 76,789,87</h2>
            </div>
            <div>
            <ResponsiveContainer width="100%" minHeight={300}>
              <BarChart
                width={700}
                height={300}
                data={AreaRevData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={<CustomizedAxisTick />}
                  tickLine={false}
                  axisLine={{ stroke: "#000" }} // Y axis line
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: "transparent" }} // Remove X axis line
                  tickLine={false} // Remove ticks on the X axis
                />
                <Tooltip />
                <Bar
                  dataKey="pv"
                  radius={[5, 5, 5, 5]}
                  barSize={20}
                  label={<CustomLabel />}
                >
                  {AreaRevData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 w-full">

        <div className="p-3 bg-white w-full space-y-2 rounded-lg">
                <p className="text-[#303F58] text-lg font-bold">
                   Top performing BDA's
                 </p>
                 <p className="text-[#4B5C79] text-xs font-normal">
                   Based on lead Conversion Performance Metric
                 </p>
                  
                  <div className="mt-2 custom-scrollbar " style={{ overflowX: 'auto' }}>
                    {/* Wrapper for dynamic width */}
                    <div style={{ width: '100%' , height: '340px' }} className="-ms-4 mt-3">
                      <ResponsiveContainer width="100%" minHeight={340}>
                      <BarChart
                        data={topPerformingBDA}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false}   tickFormatter={(value) => `${value}%`} tickLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Bar barSize={30} dataKey="CR" radius={10}>
                         {topPerformingBDA?.map((entry: any, index: any) => (
                            <Cell key={`cell-${entry.name}`} fill={colors[index % colors?.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;
