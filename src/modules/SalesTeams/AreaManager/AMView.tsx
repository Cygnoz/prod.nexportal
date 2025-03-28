// import Licensers from "../../../components/ui/Licensers";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { VictoryLabel, VictoryPie, VictoryTheme } from 'victory';
import AwardIcon from "../../../assets/icons/AwardIcon";
import ChevronRight from "../../../assets/icons/ChevronRight";
import CommissionRoundIcon from "../../../assets/icons/CommissionRoundIcon";
import DeActivateIcon from "../../../assets/icons/DeActivateIcon";
import EditIcon from "../../../assets/icons/EditIcon";
import SalaryRoundIcon from "../../../assets/icons/SalaryRoundIcon";
import Trash from "../../../assets/icons/Trash";
import UserIcon from '../../../assets/icons/UserIcon';
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon";
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon";
import BackgroundView from '../../../assets/image/AMView.png';
import { months, years } from "../../../components/list/MonthYearList";
import CommissionModal from "../../../components/modal/CommissionModal";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import Modal from "../../../components/modal/Modal";
import SalaryInfoModal from "../../../components/modal/SalaryInfoModal";
import LicensersTable from '../../../components/ui/LicensersTable';
import NoRecords from "../../../components/ui/NoRecords";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { useUser } from "../../../context/UserContext";
import useApi from '../../../Hooks/useApi';
import ProgressBar from "../../../pages/Dashboard/Graphs/ProgressBar";
import { endPoints } from '../../../services/apiEndpoints';
import AMForm from './AMForm';
import AMViewAward from './AMViewAward';
import AMViewCardandTable from "./AMViewCardandTable";
import AMViewForm from "./AMViewForm";


// import AMViewAward from './AMViewAward';
// import SearchBar from "../../../components/ui/SearchBar";
interface AMData {
  name: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
}
interface InsideAmData {
  totalLeads: number;
}

type Props = {
  staffId?: any

}

const AMView = ({ staffId }: Props) => {

  const { user } = useUser()
  const [insideAmData, setInsideAmData] = useState<InsideAmData | null>(null);
  const topRef = useRef<HTMLDivElement>(null);


  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState({
    editAM: false,
    viewAM: false,
    awardAM: false,
    confirm: false,
    deactiveAM: false,
    salaryInfoAM: false,
    commissionAM: false,
  });

  const handleModalToggle = (editAM = false, viewAM = false, awardAM = false, confirm = false, deactiveAM = false, salaryInfoAM = false, commissionAM = false) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editAM: editAM,
      viewAM: viewAM,
      awardAM: awardAM,
      confirm: confirm,
      deactiveAM: deactiveAM,
      salaryInfoAM: salaryInfoAM,
      commissionAM: commissionAM
    }));
  }

  const { request: getaAM } = useApi('get', 3002)
  const { id } = useParams()
  const iId = staffId ? staffId : id
  const { request: deleteaAM } = useApi('delete', 3002)
  const { request: deactivateAM } = useApi('put', 3002)
  const [getData, setGetData] = useState<{
    amData: any;
  }>
    ({ amData: [] })


  const { request: LeadsConverted } = useApi("get", 3002);
  const { request: SalaryInfo } = useApi("get", 3002);

  const [chartData, setChartData] = useState<any[]>([]);

  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<string>("");
  const [salaryDetails, setSalaryDetails] = useState<any>('')

  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
    setSelectedData(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);

  const getPerformers = async () => {
    try {
      const endPoint = `${endPoints.LEADS_CONVERTED}/${iId}?date=${selectedData}`;
      const { response, error } = await LeadsConverted(endPoint);

      if (response && response.data) {
        const transformedData = response.data.convertedOverTime.map((item: any) => {
          // Create a new Date object from the ISO date string
          const dateObj = new Date(item.date);
          // Format the date as 'dd-mm-yyyy'
          const formattedDate = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
          return {
            date: formattedDate,
            conversionCount: item.conversionCount,
          };
        });
        setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error");
        setChartData([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // console.log(chartData);


  useEffect(() => {
    if (selectedData) {
      getPerformers();
    }
  }, [selectedData]);



  const getSalary = async () => {
    try {
      const { response, error } = await SalaryInfo(`${endPoints.SALARY_INFO}/${iId}`);
      // console.log(response);
      // console.log(error);

      // console.log(error);
      if (response && !error) {
        //console.log("Ss",response.data);
        setSalaryDetails(response.data)



        // setChartData(response.data);
      } else {
        console.error("Error:", error?.data || "Unknown error");

      }
    } catch (err) {
      console.error(err);
    }
  };







  const getAAM = async () => {
    try {
      // setLoading(true)
      const { response, error } = await getaAM(`${endPoints.GET_ALL_AM}/${iId}`);
      if (response && !error) {
        console.log("res", response.data);

        setGetData((prevData) => ({
          ...prevData,
          amData: response.data
        }))
      }
      else {
        console.error(error.response.data.message)
      }
    }
    catch (err) {
      console.error("Error fetching AM data:", err);
    } finally {
      // setLoading(false)
    }
  }
 
  // console.log(getData);



  const handleDelete = async () => {
    try {
      const { response, error } = await deleteaAM(`${endPoints.GET_ALL_AM}/${iId}`);
      if (response) {
        toast.success(response.data.message);
        navigate("/area-manager");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the Area Manager.");
    }
  };


  const navigate = useNavigate()

  const handleView = (id: any) => {
    if (id) {
      navigate(`/licenser/${id}`)
    }
    console.log(id);
  }



  const columns: { key: any; label: string }[] = [
    { key: "firstName", label: "Name" },
    { key: "licensorStatus", label: "Status" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
  ];
  const { request: getInsideAM } = useApi('get', 3002);
  const [bdaDetails, setBdaDetails] = useState([]);
  const [licenserDetails, setLicenserDetails] = useState([]);

  const [pieData, setPieData] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const getInsideViewAM = async () => {
    try {
      // setLoading(true)
      const { response, error } = await getInsideAM(`${endPoints.AM}/${iId}/details`);
      if (response && !error) {
        if (staffId) {
          sessionStorage.setItem("staffLocalityId", response?.data?.areaManagerDetails?.areaId)
        }
        setInsideAmData(response.data);
        // Extract bdaDetails and licenserDetails separately
        setBdaDetails(response.data.bdaDetails || []);
        const licenserData = response.data.licenserDetails || []
        const leadlicenserData = response.data.leadStatusDetails || []
        const processData = licenserData.map((item: any) => ({
          ...item,
          firstName: item.firstName,
          licensorStatus: item.licensorStatus,
          startDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A',
          endDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'

        }))


        setLicenserDetails(processData);

        // Function to map index to color
        const getColorForIndex = (index: number) => {
          const colors = ['#1B6C75', '#30B777', '#6ABAF3', '#7CD5AB', '#00B5B5'];
          return colors[index] || '#808080'; // Default color for out-of-bounds index
        };




        // Dynamically map leadlicenserData to updatedRoles
        const updatedRoles = leadlicenserData.map((statusDetail: any, index: any) => ({
          name: statusDetail.status || "Unknown", // Fallback for missing status
          Count: statusDetail.count ?? 0,         // Use Count, default to 0 if missing
          color: getColorForIndex(index),         // Assign colors based on index
        }));

        console.log("updateedRole", updatedRoles);

        if (updatedRoles.length > 0) {
          setRoles(updatedRoles)
        } else {
          console.error("No roles to update. Check leadlicenserData.");
        }

        // Filter out roles with Count 0 and create pie chart data
        const pieChartData = updatedRoles
          .filter((role: any) => role.Count > 0) // Only include roles with Count > 0
          .map((role: any) => ({
            x: role.name,
            y: role.Count,
            color: role.color,
          }));

        // Update state
        setRoles(updatedRoles);
        setPieData(pieChartData);


        console.log("das", pieChartData);




      } else {
        console.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error fetching AM data:", err);
    } finally {
      // setLoading(false)
    }
  };






  //console.log(pieData);

  console.log("Inside AM Data:", insideAmData);
  //console.log("BDA Details:", bdaDetails);
  //console.log("Licenser Details:", licenserDetails);
  //console.log("lead status", leadStatusDetails);

  const topPerformingBDA = bdaDetails.map((bda: any) => ({
    CR: parseFloat(bda?.bdaConversionRate),
    name: bda?.bdaName,
  }));

  const handleDeactivate = async () => {
    const body = {
      status: getData?.amData?.status === 'Active' ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactivateAM(`${endPoints.DEACTIVATE_AM}/${iId}`, body)
      console.log(response, 'res');
      console.log(error, 'err message');
      if (response && !error) {
        console.log(response.data);
        toast.success(response.data.message)
        navigate('/area-manager')
      }
      else {
        console.log(error?.response?.data?.message);
        toast.error(error?.response?.data?.message)
      }
    }
    catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the lead.");
    }
  }




  const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FFC107', '#673AB7', '#3F51B5', '#00BCD4', '#8BC34A'];

  useEffect(() => {
    if(iId){
      getAAM();
      getSalary()
      getInsideViewAM();
    }
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [iId])

  return (
    <div ref={topRef}>
      <div className="flex items-center text-[16px] my-2 space-x-2">
        <p onClick={() => navigate('/area-manager')} className="font-bold cursor-pointer text-[#820000] ">AM</p>
        <ChevronRight color="#4B5C79" size={18} />
        <p className="font-bold text-[#303F58] ">{getData.amData?.user?.userName ? getData.amData?.user?.userName : 'N/A'}</p>
      </div>
      <div className="rounded-xl p-2 flex md:flex-row flex-col items-center bg-cover" style={{ backgroundImage: `url(${BackgroundView})` }}>
        {/* Profile Section */}
        <div className="flex md:flex-row flex-col items-center md:space-x-6 w-full">
          {/* Profile Picture */}
          <div className="bg-gray-300 rounded-full overflow-hidden w-16 h-16">
            {getData.amData?.user?.userImage && getData.amData?.user?.userImage.length > 500 ? (
              <img className="w-full h-full object-cover" src={getData.amData?.user?.userImage} alt="Profile" />
            ) : (
              <div className="w-full h-full bg-black flex justify-center items-center rounded-full">
                <UserIcon color="white" size={22} />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="w-full">
            <h1 className="text-[#FFFEFB] text-lg md:text-2xl font-normal text-center md:text-left">
              {getData.amData?.user?.userName || 'N/A'}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
              {/* Contact Info */}
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="border-b md:border-r md:border-b-0 p-2 text-center md:text-left">
                  <p className="text-[#D4D4D4] text-xs font-medium">Contact Number</p>
                  <p className="text-[#FFFFFF] text-sm font-medium">{getData.amData?.user?.phoneNo || 'N/A'}</p>
                </div>
                <div className="border-b md:border-r md:border-b-0 p-2 text-center md:text-left">
                  <p className="text-[#D4D4D4] text-xs font-medium">Email</p>
                  <p className="text-[#FFFFFF] text-sm font-medium">{getData.amData?.user?.email || 'N/A'}</p>
                </div>
                <div className="p-2 text-center md:text-left">
                  <p className="text-[#D4D4D4] text-xs font-medium">Area</p>
                  <p onClick={() => navigate(`/areas/${getData.amData?.area?._id}`)} className="text-[#FFFFFF] text-sm font-medium underline cursor-pointer">
                    {getData.amData?.area?.areaCode || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Role & Employee Info */}
              <div className="flex flex-col md:flex-row md:space-x-4 md:-mt-16 md:ms-8">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <p className="text-[#D4D4D4] text-xs font-medium">Role</p>
                  <p className="text-[#FFFFFF] text-sm font-medium">Area Manager</p>
                </div>
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <p className="text-[#D4D4D4] text-xs font-medium">Employee ID</p>
                  <p className="text-[#FFFFFF] text-sm font-medium">{getData.amData?.user?.employeeId || 'N/A'}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[#D4D4D4] text-xs font-medium">Joining Date</p>
                  <p className="text-[#FFFFFF] text-sm font-medium">
                    {getData.amData?.dateOfJoining ? new Date(getData.amData?.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Actions - Mobile Grid, Desktop Flex */}
        <div className="grid grid-cols-3 md:flex md:justify-end gap-4 mt-2 md:mt-0 w-full">
          {[
            { label: 'Edit Profile', icon: <EditIcon size={18} color="#C4A25D" />, action: () => handleModalToggle(true, false, false, false, false) },
            { label: 'View Details', icon: <ViewRoundIcon size={18} color="#B6D6FF" />, action: () => handleModalToggle(false, true, false, false, false) },
            { label: 'Awards', icon: <AwardIcon size={18} color="#B6FFD7" />, action: () => handleModalToggle(false, false, true, false, false) },
            {
              label: getData?.amData?.status === "Active" ? "Deactivate" : "Activate",
              icon: getData?.amData?.status === "Active" ?
                <DeActivateIcon size={18} color="#D52B1E4D" /> :
                <UserRoundCheckIcon size={20} color="#D52B1E4D" />,
              action: () => handleModalToggle(false, false, false, false, true)
            },
            { label: 'Delete', icon: <Trash size={18} color="#BC3126" />, action: () => handleModalToggle(false, false, false, true, false) },
            { label: 'Salary Info', icon: <SalaryRoundIcon size={18} color="#B6D6FF" />, action: () => handleModalToggle(false, false, false, false, false, true, false) },
            { label: 'Commission', icon: <CommissionRoundIcon size={18} color="#B6FFFF" />, action: () => handleModalToggle(false, false, false, false, false, false, true) }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div onClick={item.action} className="w-8 h-8 rounded-full cursor-pointer">
                <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white flex justify-center items-center">
                  {item.icon}
                </div>
              </div>
              <p className="text-center text-[#D4D4D4] text-xs font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>


      <div className="mt-4">
        {user?.role === 'Area Manager' && <ProgressBar />}
      </div>

      {/* Card & table */}
      <AMViewCardandTable  bdaDetails={bdaDetails} insideAmData={insideAmData} />
      {/* Charts */}

      <div className="grid grid-cols-12 mb-5 gap-4">
  {/* Lead Status Section */}
  <div className="col-span-12 md:col-span-4 h-full">
    <div className="bg-white rounded-lg w-full h-full p-3">
      <h1 className="text-[#303F58] text-lg font-bold z-10">Lead status distribution</h1>
      {roles.filter(role => role.Count > 0).length > 0 ? (
        <div className="-mt-1 relative">
          <div className='absolute top-[35%] left-[38%] z-20 text-center -mt-7'>
            <p className='text-xl font-semibold ms-4'>{insideAmData?.totalLeads || 0}</p>
            <p className='text-xs ms-4'>Total Leads</p>
          </div>
          <VictoryPie
            innerRadius={48}
            padAngle={4}
            data={pieData}
            categories={{
              y: roles.map(role => role.name),
            }}
            theme={VictoryTheme.clean}
            labels={({ datum }) => `${((datum.y / roles.reduce((acc, role) => acc + role.Count, 0)) * 100).toFixed(1)}%`}
            labelComponent={<VictoryLabel style={{ fill: '#303F58', fontSize: 15, marginLeft: -50 }} />}
            style={{
              data: {
                fill: ({ datum }) => datum.color,
              },
            }}
          />
          <div className='flex justify-center'>
            <div className="space-y-3">
              {roles?.map((role) => (
                <div key={role.name} className="flex items-center gap-20 w-64 justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: role.color }} />
                    <span className="text-gray-800 font-medium text-xs">{role.name}</span>
                  </div>
                  <span className="text-gray-600 text-xs">{role.Count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <NoRecords imgSize={70} textSize="md" parentHeight="380px" />
      )}
    </div>
  </div>

  {/* Top Performing BDAs Section */}
  <div className="col-span-12 md:col-span-8">
    <div className="p-3 bg-white w-full space-y-2 rounded-lg">
      <p className="text-[#303F58] text-lg font-bold">Top performing BDA's</p>
      <p className="text-[#4B5C79] text-xs font-normal">
        Based on lead Conversion Performance Metric
      </p>

      <div className="mt-2 custom-scrollbar" style={{ overflowX: 'auto' }}>
        {/* Wrapper for dynamic width */}
        <div style={{ width: '100%' }} className="-ms-4 mt-3">
          <ResponsiveContainer width="100%" minHeight={380}>
            <BarChart data={topPerformingBDA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickFormatter={(value) => `${value}%`} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar barSize={30} dataKey="CR" radius={10}>
                {topPerformingBDA?.map((entry: any, index: any) => (
                  <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
</div>


      <div>
        <LicensersTable<AMData>
          data={licenserDetails}
          columns={columns}
          headerContents={{
            title: 'Licensers',
            search: { placeholder: 'Search License by Name or Holder Name' },
          }}
          handleView={handleView}
        />
      </div>
      {/* Graph */}
      <div className="flex flex-col md:flex-row gap-3 py-2 mt-6">
  <div className="py-3 bg-white p-2 w-full">
    <div className="flex flex-col md:flex-row justify-between">
      <div>
        <h1 className="text-lg font-bold">Leads Converted by Area Manager Over Time</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mt-3 md:mt-0">
        <SelectDropdown
          setSelectedValue={setSelectedYear}
          selectedValue={selectedYear}
          filteredData={years}
          searchPlaceholder="Search Years"
          width="w-full md:w-44"
        />
        <SelectDropdown
          setSelectedValue={setSelectedMonth}
          selectedValue={selectedMonth}
          filteredData={newMonthList}
          searchPlaceholder="Search Months"
          width="w-full md:w-44"
        />
      </div>
    </div>

    <div className="mt-5 w-full">
      {chartData.length > 0 && chartData.some((data) => data.conversionCount > 0) ? (
        <ResponsiveContainer width="100%" minHeight={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="conversionCount"
              stroke="#8884d8"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <NoRecords text="No Leads Found" parentHeight="320px" />
      )}
    </div>
  </div>
</div>


      <Modal open={isModalOpen.editAM} onClose={() => handleModalToggle()} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]  max-sm:overflow-auto">
        <AMForm editId={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.viewAM} onClose={() => handleModalToggle()} className="w-[50%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto">
        <AMViewForm id={iId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.awardAM} onClose={() => handleModalToggle()} align='right'  className="w-[25%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[35%] mx-auto ">
        <AMViewAward getData={getData} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
       className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this Area manager?"
          onClose={() => handleModalToggle()}
        />
      </Modal>

      <Modal
        open={isModalOpen.deactiveAM}
        align="center"
        onClose={() => handleModalToggle()}
       className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            getData?.amData?.status === "Active"
              ? "Are you sure want to deactivate this AM?"
              : "Are you sure want to activate this AM?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>
      <Modal open={isModalOpen.salaryInfoAM} onClose={() => handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
        <SalaryInfoModal salaryDetails={salaryDetails} onClose={() => handleModalToggle()} />
      </Modal>

      <Modal open={isModalOpen.commissionAM} onClose={() => handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
        <CommissionModal id={id} onClose={() => handleModalToggle()} />
      </Modal>




    </div>
  )
}

export default AMView;