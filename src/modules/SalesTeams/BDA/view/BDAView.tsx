import LeadsCardIcon from "../../../../assets/icons/LeadsCardIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
 
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import useApi from "../../../../Hooks/useApi";
import { LeadData } from "../../../../Interfaces/Lead";
import AwardIcon from "../../../../assets/icons/AwardIcon";
import ChevronRight from "../../../../assets/icons/ChevronRight";
import DeActivateIcon from "../../../../assets/icons/DeActivateIcon";
import EditIcon from "../../../../assets/icons/EditIcon";
import Trash from "../../../../assets/icons/Trash";
import ViewRoundIcon from "../../../../assets/icons/ViewRoundIcon";
import backGroundView from '../../../../assets/image/BDAView.png';
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import Modal from "../../../../components/modal/Modal";
import LicensersTable from "../../../../components/ui/LicensersTable";
import NoRecords from "../../../../components/ui/NoRecords";
import Table from "../../../../components/ui/Table";
import ViewCard from "../../../../components/ui/ViewCard";
import { endPoints } from "../../../../services/apiEndpoints";
import BDAForm from "../BDAForm";
import GraphTable from "../GraphTable";
import BDAViewAward from "./BDAViewAward";
import BDAViewForm from "./BDAViewForm";
import UserRoundCheckIcon from "../../../../assets/icons/UserRoundCheckIcon";
import SalaryInfoModal from "../../../../components/modal/SalaryInfoModal";
import CommissionModal from "../../../../components/modal/CommissionModal";
import SalaryRoundIcon from "../../../../assets/icons/SalaryRoundIcon";
import CommissionRoundIcon from "../../../../assets/icons/CommissionRoundIcon";
import SelectDropdown from "../../../../components/ui/SelectDropdown";
import { useResponse } from "../../../../context/ResponseContext";
import ProgressBar from "../../../../pages/Dashboard/Graphs/ProgressBar";
import { useUser } from "../../../../context/UserContext";
import { months, years } from "../../../../components/list/MonthYearList";



interface Licencer {
  name: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  action: string;
}

interface BDAViewDetails {
  TransformedLead:[]
  TransformedLicenser:[]
  TransformedTrial:[]
  bdaDetails:any
  leadConversionData: [], 
}


type Props = {
  staffId?:string
}

const BDAView = ({staffId}: Props) => {

       const {user}=useUser()
       user?.role
  const {request:getBDAViewDetails}=useApi('get',3002)
  const {loading,setLoading}=useResponse()
  const topRef = useRef<HTMLDivElement>(null);
    
      useEffect(() => {
        // Scroll to the top of the referenced element
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }, []);
  const navigate=useNavigate()
  const {id}=useParams()
  const iId=staffId?staffId:id
  const {request:getBDA}=useApi('get',3002);
  const {request: deleteABda}=useApi('delete',3002);
  const {request: deactivateBDA}=useApi('put',3002);

  const [data, setData] = useState<{
    bdaData: any;
    bdaViewDetails: BDAViewDetails;
  }>({
    bdaData: {},
    bdaViewDetails: {
      TransformedLead: [],
      TransformedLicenser: [],
      TransformedTrial: [],
      bdaDetails:{},
      leadConversionData: [], 
    },
  });
  
  const viewCardData = [
    { icon: <LeadsCardIcon />, number: data.bdaViewDetails.bdaDetails?.totalLeadsAssigned? data.bdaViewDetails.bdaDetails?.totalLeadsAssigned:0, title: "Total Leads Assigned", iconFrameColor: '#DD9F86', iconFrameBorderColor: '#F6DCD2' },
    { icon: <UserIcon />, number:data.bdaViewDetails.bdaDetails?.totalLicensesSold?data.bdaViewDetails.bdaDetails?.totalLicensesSold:0, title: "Total Licenses Sold", iconFrameColor: '#1A9CF9', iconFrameBorderColor: '#BBD8EDCC' },
    { icon: <LeadsCardIcon />, number: "₹89,567", title: "Total Revenue Generated", iconFrameColor: '#9C75D3', iconFrameBorderColor: '#DAC9F1' },
    { icon: <LeadsCardIcon />, number:data.bdaViewDetails.bdaDetails?.pendingTasks?data.bdaViewDetails.bdaDetails?.pendingTasks:0, title: "Pending Tasks", iconFrameColor: '#9C75D3', iconFrameBorderColor: '#DAC9F1' },

  ];

  const [isModalOpen, setIsModalOpen] = useState({
    editBda: false,
    viewBda: false,
    awards:false,
    confirm:false,
    deactiveBda:false,
    salary:false,
    commission:false
  });

  // Function to toggle modal visibility
  const handleModalToggle = (editBda = false, viewBda = false,awards=false, confirm=false,deactiveBda=false,salary=false,commission=false) => {
    setIsModalOpen((prevState: any) => ({
      ...prevState,
      editBda: editBda,
      viewBda: viewBda,
      awards:awards,
      confirm:confirm,
      deactiveBda:deactiveBda,
      salary:salary,
      commission:commission
    }));
    getOneBDA();
  };
  const handleView=(id:any)=>{
    navigate(`/lead/${id}`)
   }

  const  handleLicenserView=(id:any)=>{
    navigate(`/licenser/${id}`)
  }

  const { request: SalaryInfo } = useApi("get", 3002);
  const[salaryDetails,setSalaryDetails]=useState<any>('')
  const { request: RenewalCount } = useApi("get", 3002);

  const [chartData, setChartData] = useState<any[]>([]);

  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];

  const [selectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [selectedData, setSelectedData] = useState<string>("");
  
  useEffect(() => {
    const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
    setSelectedData(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);
  
  const getPerformers = async () => {
    try {
      const endPoint = `${endPoints.RENEWAL_BDA}/${iId}/?year=${selectedData}`;
      console.log("Fetching Data:", endPoint);
      
      const { response, error } = await RenewalCount(endPoint);
  
      if (response && response.data) {
        console.log("API Data:", response.data);
  
        // Transform data to match the expected format
        const transformedData = response.data.data.map((item: any) => ({

          name: item.month,           // Month for X-axis
          renewalCount: item.renewalCount,  // Y-axis values
        }));
  
        setChartData(transformedData);
      } else {
        console.error("Error:", error?.data || "Unknown error");
        setChartData([]); // Set empty chart if error
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


  const getSalary = async () => {
    try {
      const { response, error } = await SalaryInfo(`${endPoints.SALARY_INFO}/${iId}`);
      console.log(response);
       console.log(error);
      
     // console.log(error);
      if (response && !error) {
       console.log("Ss",response.data);
       setSalaryDetails(response.data)
      
       
       
       // setChartData(response.data);
      } else {
        console.error("Error:", error?.data || "Unknown error");
        
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
  getSalary()
  }, [iId]);

 
  // Data for the table
 
  // Define the columns with strict keys
  const columns: { key:  any; label: string }[] = [
    { key: "customerId", label: "Lead ID" },
    { key: "leadName", label: "Lead Name" },
    { key: "phone", label: "Phone Number" },
    { key: "email", label: "Email Address" },
    { key: "createdAt", label: "Assigned Date" },
    { key: "leadStatus", label: "Status" },
  ];



  const licenserColumns: { key:any; label: string }[] = [
    { key: "firstName", label: "Name" },
    { key: "licensorStatus", label: "Status" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "action", label: "Action" }
  ];

  const handleDelete = async () => {
    try {
      const { response, error } = await deleteABda(`${endPoints.BDA}/${iId}`);
      console.log(response);
      console.log(error);
            
      if (response) {
        toast.success(response.data.message);
        navigate("/bda");
      } else {
        console.log(error?.response?.data?.message);        
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the BDA.");
    }
  };

  const handleDeactivate = async () => {
    const body = {
      status: data.bdaData?.status === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactivateBDA(`${endPoints.DEACTIVATE_BDA}/${iId}`, body);
      console.log(response);
      console.log(error, "error message");


      if (response) {
        toast.success(response.data.message);
        navigate("/bda");

      } else {
        console.log(error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the lead.");
    }
  };


  const getOneBDA = async () => {
    try {
      setLoading(true)
      const { response, error } = await getBDA(`${endPoints.BDA}/${iId}`);
      if (response && !error) {
        console.log(response.data);
        
        const BDA:any = response.data; // Return the fetched data
        console.log("Fetched BDA data:", BDA);
  
       setData((prev)=>({...prev,bdaData:BDA}))
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error('Error fetching BDA data:', error);
      }
    } catch (err) {
      console.error('Error fetching BDA data:', err);
    }finally{
      setLoading(false)
    }
  };
  
  const getBDAViewData = async () => {
    try {
      const { response, error } = await getBDAViewDetails(`${endPoints.BDA_DETAILS}/${iId}/customers`);
      if (response && !error) {
        console.log('res',response.data);        
        const { LeadDetails, LicenserDetails, TrialDetails, bdaDetails } = response.data;
        const TransformedLead = LeadDetails?.map((lead: any) => ({
          ...lead,
          createdAt: new Date(lead.createdAt).toLocaleDateString("en-GB"), // Format date
        }));
        const TransformedTrial=TrialDetails?.map((trial:any)=>({
          ...trial,
          startDate:new Date(trial.startDate).toLocaleDateString("en-GB")
        }))

        const TransformedLicenser=LicenserDetails?.map((license:any)=>({
          ...license,
          startDate:new Date(license.startDate).toLocaleDateString("en-GB"),
          endDate:new Date(license.startDate).toLocaleDateString("en-GB")
        }))
  
        // Transform leadByStatus into chart-compatible data with uppercase names
        const leadByStatus = bdaDetails?.leadByStatus || {};
        const leadConversionData = Object.keys(leadByStatus).map((key) => ({
          status: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
          value: leadByStatus[key], // Use the value (count) as 'uv'
        }));
  
        const TransformData = { 
          TransformedLead, 
          TransformedLicenser, 
          TransformedTrial,
          bdaDetails,
          leadConversionData // Add the transformed data for chart
        };
  
        setData((prev: any) => ({
          ...prev,
          bdaViewDetails: TransformData,
        }));
      } else {
        console.error("Error response from API:", error);
      }
    } catch (err) {
      console.error("Error fetching BDA view data:", err);
    }
  };
  
  
  
  useEffect(() => {
    getOneBDA()
    getBDAViewData()
  }, [iId]);

  const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FFC107', '#673AB7', '#3F51B5', '#00BCD4', '#8BC34A'];
  // const retentionData = [
  //   { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  //   { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  //   { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  //   { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  //   { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  //   { name: 'Jun', uv: 4000, pv: 2400, amt: 2400 },
  //   { name: 'Jul', uv: 3000, pv: 1398, amt: 2210 },
  //   { name: 'Aug', uv: 2000, pv: 9800, amt: 2290 },
  //   { name: 'Sep', uv: 2780, pv: 3908, amt: 2000 },
  //   { name: 'Oct', uv: 1890, pv: 4800, amt: 2181 },
  //   { name: 'Nov', uv: 2780, pv: 3908, amt: 2000 },
  //   { name: 'Dec', uv: 1890, pv: 4800, amt: 2181 },
  // ]
 
  // const normalizedData = retentionData.map(item => ({
  //   ...item,
  //   uv: item.uv / 160,
  // }))
  // const [selectedActivity, setSelectedActivity] = useState({ label: 'Current Month', value: '' });
  // const handleActivitySelection = (selectedOption: any) => {
  //   setSelectedActivity(selectedOption);
  // };
 
  // const activityOptions = [
  //   { label: 'Previous Month', value: 'previousMonth' },
  //   { label: 'Q1', value: 'q1' },
  //   { label: 'Q2', value: 'q2' },
  //   { label: 'Q3', value: 'q3' },
  // ];
 
 

  return (
    <>
    <div ref={topRef}>
       <div className="flex items-center text-[16px] my-2 space-x-2">
       <p onClick={()=>navigate('/bda')} className="font-bold cursor-pointer text-[#820000] ">BDA</p>
        <ChevronRight color="#4B5C79" size={18}/>
        <p className="font-bold text-[#303F58] ">{data.bdaData?.user?.userName}</p>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-2">
        <div className="">
            {viewCardData.map((card, index) => (
              <div className="mb-3">
              <ViewCard
                iconFrameColor={card.iconFrameColor}
                iconFrameBorderColor={card.iconFrameBorderColor}
                key={index}
                icon={card.icon}
                number={card.number}
                title={card.title}
              />
              </div>
            ))}
          </div>

        </div>
        <div className="col-span-6">
  <div className="p-3 bg-white w-full space-y-2 rounded-lg">
    <h2 className="font-bold">Lead By Status</h2>
    
    {data.bdaViewDetails?.leadConversionData?.some((item: any) => item.value > 0) ? (
  <>
  <h2>Converted Leads</h2>
    <h1 className="text-2xl font-medium">
      {data.bdaViewDetails?.bdaDetails?.leadByStatus?.converted || 0}
    </h1>

    <div className="-ms-7 mt-2">
      <BarChart width={690} height={360} data={data.bdaViewDetails?.leadConversionData || []}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="status" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar barSize={90} dataKey="value" radius={10}>
          {(data.bdaViewDetails?.leadConversionData || []).map((entry: any, index: number) => (
            <Cell key={`cell-${entry.status}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </div>
  </>
) : (
  <NoRecords text="No Lead Status Available" parentHeight="430px" imgSize={90} textSize="lg"/>
)}

  </div>
</div>

        <div className="col-span-4 rounded-xl bg-cover"  style={{backgroundImage:`url(${backGroundView})`}}>
          <div className="w-full h-96 p-4 rounded-xl">
            <div className="flex">
            <div className="w-14 h-14 rounded-full overflow-hidden">
          {data.bdaData?.user?.userImage && data.bdaData?.user?.userImage.length > 500  ?    (      
          <img
            src={data.bdaData?.user?.userImage} // Replace with the actual image URL
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="w-14 h-14 bg-black rounded-full flex justify-center items-center">
                <UserIcon color="white" size={40} />
          </p>)}
        </div>
          <p className="text-[#FFFEFB] text-2xl font-normal p-4">{data.bdaData?.user?.userName}</p>
            </div>
           <div className=" flex flex-col  mt-6 p-3 h-full">
            <div>
            <div className="flex   mb-6 ms-auto">
            <div className="border-r">
          <p className="mx-4 text-[#D4D4D4] text-xs font-medium">Contact Number</p>
          <p className="mx-4 text-[#FFFFFF] text-sm font-medium">{data.bdaData?.user?.phoneNo}</p>
        </div>
        <div>
          <p className="text-[#D4D4D4] text-xs font-medium mx-4">Email</p>
          <p className="text-[#FFFFFF] text-sm font-medium mx-4">{data.bdaData?.user?.email}</p>
        </div>
            </div>

            <div className="flex -mt-4 ms-auto mb-6">
            <div className="border-r">
          <p className="mx-4 text-[#D4D4D4] text-xs font-medium">Region</p>
          <p onClick={()=>navigate(`/regionView/${data.bdaData?.region?._id}`)} className="mx-4 underline cursor-pointer text-[#FFFFFF] text-sm font-normal">{data.bdaData?.region?.regionCode?data.bdaData?.region?.regionCode:'N/A'}</p>
        </div>
        <div>
          <p className="mx-4 text-[#D4D4D4] text-xs font-medium">Area</p>
          <p onClick={()=>navigate(`/areaView/${data.bdaData?.area?._id}`)} className="mx-4 underline cursor-pointer text-[#FFFFFF] text-sm font-normal">{data.bdaData?.area?.areaCode?data.bdaData?.area?.areaCode:'N/A'}</p>
        </div>
            </div>
            </div>


            <div className="flex gap-8 ms-6 my-8 space-x-8">
              <div>
                <p className="mb-1 text-[#D4D4D4] text-xs font-medium">Role</p>
                {/* <p>Employee ID</p> */}
                <p className="text-[#FFFFFF] text-sm font-medium">BDA</p>
              </div>
              <div>
                <p className="mb-1 text-[#D4D4D4] text-xs font-medium">Employee ID</p>
                <p className="text-[#FFFFFF] text-sm font-medium">{data.bdaData?.user?.employeeId}</p>
              </div>
              <div>
                <p className="mb-1 text-[#D4D4D4] text-xs font-medium">Joining Date</p>
                <p className="text-[#FFFFFF] text-sm font-medium">{new Date(data.bdaData.dateOfJoining).toLocaleDateString("en-GB")}</p>
              </div>
            </div>
            
            <div className="flex space-x-10 bottom-0 ">
            <div onClick={()=>handleModalToggle(true,false,false,false,false,false,false)} className="flex flex-col items-center cursor-pointer  space-y-1">
              <div className="w-8 h-8 mb-2  rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <EditIcon size={18} color="#F0D5A0" />
                   </div>
                    </div>
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium" >Edit Profile</p>
             </div>

            <div onClick={()=>handleModalToggle(false,true,false,false,false,false,false)} className="flex flex-col cursor-pointer  items-center space-y-1">
              <div className="w-8 h-8 mb-2 rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <ViewRoundIcon size={18} color="#B6D6FF" />
                   </div>
                    </div> 
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">View Details</p>
            </div>

            <div onClick={()=>handleModalToggle(false,false,true,false,false,false,false)} className="flex flex-col cursor-pointer items-center space-y-1">
              <div className="w-8 h-8 mb-2 rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <AwardIcon size={18} color="#B6FFD7" />
                   </div>
                    </div>
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">Awards</p>
            </div>

            <div onClick={()=>handleModalToggle(false,false,false,false,true,false,false)} className="flex flex-col  items-center space-y-1">
            <div className="w-8 h-8 mb-2 rounded-full cursor-pointer">
              {data.bdaData?.status === "Active" ?
                <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                  <div className="ms-2 mt-2">
                      <DeActivateIcon size={18} color="#D52B1E4D" />
                  </div>
                </div>
                :
                <div className="rounded-full bg-[#B6FFD7] h-9 w-9 border border-white">
                <div className="ms-2 mt-2">
                    <UserRoundCheckIcon size={20} color="#D52B1E4D" />
                </div>
              </div>

                  }

              </div>
              <p className="text-center text-[#D4D4D4] text-xs font-medium ms-2">
                {data.bdaData?.status === "Active" ? "Deactivate" : "Activate"}
              </p>
                          </div>

           

        </div>

        <div className="flex space-x-14 bottom-0  mt-4 ms-16">
        <div onClick={()=>handleModalToggle(false,false,false,true,false,false,false)} className="flex flex-col cursor-pointer items-center space-y-1">
              <div className="w-8 h-8 mb-2 rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <Trash size={18} color="#BC3126" />
                   </div>
                    </div>
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">Delete</p>
            </div>

            <div onClick={()=>handleModalToggle(false,false,false,false,false,true,false)} className="flex flex-col cursor-pointer  items-center space-y-1">
              <div className="w-8 h-8 mb-2 rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <SalaryRoundIcon size={18} color="#B6D6FF" />
                   </div>
                    </div> 
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">Salary Info</p>
            </div>
            <div onClick={()=>handleModalToggle(false,false,false,false,false,false,true)} className="flex flex-col cursor-pointer items-center space-y-1">
              <div className="w-8 h-8 mb-2 rounded-full">
              <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <CommissionRoundIcon size={18} color="#B6FFFF" />
                   </div>
                    </div>
              </div>
              <p className="text-center ms-3 text-[#D4D4D4] text-xs font-medium">Commission</p>
            </div>
        </div>
           </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
{user?.role === 'BDA' && <ProgressBar />}
</div>

        
     {/* Table Section */}
      <div className=" mt-4">
        <Table<LeadData> data={data.bdaViewDetails.TransformedLead} columns={columns} headerContents={{
          title: "Leads Details",
          search: { placeholder: 'Search Lead Details' },
        }}
        actionList={[
          { label: 'view', function: handleView },
        ]} 
        loading={loading}
        />
      </div>

      {/* Graph & Table */}
      <GraphTable loading={loading}  bdaData={data.bdaViewDetails}/>

        {/* Licenser Card */}
        <div>
        <LicensersTable<Licencer>
          data={data.bdaViewDetails.TransformedLicenser}
          columns={licenserColumns}
          headerContents={{
            title: 'Licensers',
            search: { placeholder: 'Search License by Name or Holder Name' },
          }}
          handleView={handleLicenserView}
        />
        
      </div>

      <div className="p-3 bg-white w-full space-y-2 rounded-lg mt-4">
    <div className="flex justify-between">
      <h2 className="font-bold p-2">License Renewal Count</h2>
      <SelectDropdown
        setSelectedValue={setSelectedYear}
        selectedValue={selectedYear}
        filteredData={years}
        searchPlaceholder="Search Years"
        width="w-44"
      />
    </div>

    <div className="-ms-6 px-5">
  {chartData.length > 0 && chartData.some((item) => item.renewalCount > 0) ? (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={chartData} margin={{ bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis 
          dataKey="name"  
          axisLine={false} 
          tickLine={false} 
          interval={0}  
          angle={0}   
          textAnchor="middle" 
          dy={10} 
        />

        <YAxis 
          axisLine={false} 
          tickLine={false} 
          ticks={[0, 5, 10, 15, 20, 25]} 
          domain={[0, 25]} 
        />

        <Tooltip />

        <Bar dataKey="renewalCount" radius={[10, 10, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    // ✅ Show "No Leads Found" when there is no retention rate (all values are 0)
    <NoRecords text="No Leads Found" parentHeight="320px" />
  )}
</div>


  </div>


    </div>
    <Modal open={isModalOpen.editBda} onClose={()=>handleModalToggle()}>
    <BDAForm editId={iId} onClose={()=>handleModalToggle()} />
  </Modal>

  <Modal align="right" className="w-[25%] me-16" open={isModalOpen.awards} onClose={()=>handleModalToggle()}>
        <BDAViewAward data={data} onClose={()=>handleModalToggle()} />
      </Modal>

      <Modal open={isModalOpen.viewBda} onClose={()=>handleModalToggle()}>
        <BDAViewForm bdaData={data.bdaData} onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%]"
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this BDA?"
          onClose={() => handleModalToggle()}
        />
      </Modal>    

            <Modal
        open={isModalOpen.deactiveBda}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            data.bdaData?.status === "Active"
              ? "Are you sure want to deactivate this BDA?"
              : "Are you sure want to activate this BDA?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>   
      <Modal open={isModalOpen.salary} onClose={()=>handleModalToggle()} className="w-[45%]">
    <SalaryInfoModal salaryDetails={salaryDetails} onClose={()=>handleModalToggle()} />
  </Modal>

  <Modal open={isModalOpen.commission} onClose={()=>handleModalToggle()} className="w-[45%]">
    <CommissionModal  onClose={()=>handleModalToggle()} />
  </Modal>


  </>
  )
}

export default BDAView