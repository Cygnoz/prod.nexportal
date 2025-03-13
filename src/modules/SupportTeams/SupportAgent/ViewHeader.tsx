import { useEffect, useState } from "react"
import DeActivateIcon from "../../../assets/icons/DeActivateIcon"
import EditIcon from "../../../assets/icons/EditIcon"
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon"
import supportAgentbg from '../../../assets/image/SupportAgentView.png'
import Modal from "../../../components/modal/Modal"
import SupportAgentForm from "./SupportAgentForm"
import SAViewForm from "./SAViewForm"
import { useNavigate } from "react-router-dom"
import useApi from "../../../Hooks/useApi"
import { endPoints } from "../../../services/apiEndpoints"
import UserIcon from "../../../assets/icons/UserIcon"
import Trash from "../../../assets/icons/Trash"
import ConfirmModal from "../../../components/modal/ConfirmModal"
import toast from "react-hot-toast"
import UserRoundCheckIcon from "../../../assets/icons/UserRoundCheckIcon"
import SalaryInfoModal from "../../../components/modal/SalaryInfoModal"
import CommissionModal from "../../../components/modal/CommissionModal"
import SalaryRoundIcon from "../../../assets/icons/SalaryRoundIcon"
import CommissionRoundIcon from "../../../assets/icons/CommissionRoundIcon"

type Props = {
  id:any
}

const ViewHeader = ({id}: Props) => {
   const { request: SalaryInfo } = useApi("get", 3002);
    const[salaryDetails,setSalaryDetails]=useState<any>('')

    const [isModalOpen, setIsModalOpen] = useState({
        editSA:false,
        viewSA:false,
        confirm: false,
        deacivateSA:false,
        salaryInfoSA:false,
        commissionSA:false,
      });
    
      const handleModalToggle = (editSA=false, viewSA=false, confirm=false,deacivateSA=false, salaryInfoSA=false, commissionSA=false) => {
        setIsModalOpen((prevState:any )=> ({
            ...prevState,
            editSA: editSA,
            viewSA: viewSA,
            confirm: confirm,
            deacivateSA:deacivateSA,
            salaryInfoSA:salaryInfoSA,
            commissionSA:commissionSA
        }));
        getASA()
    }
    
    const {request:deleteaSA}=useApi('delete',3003)
    const {request: deactiveSA}=useApi('put',3003)
    const {request: getaSA}=useApi('get',3003)
    const [getData, setGetData] = useState<{
        saData:any;}>
      ({saData:[]})
  
  const getASA = async()=>{
    try{
const {response,error}= await getaSA(`${endPoints.SUPPORT_AGENT}/${id}`);
        if(response && !error){
          setGetData((prevData)=>({
            ...prevData,
            saData:response.data
          }))
        }
        else{
          console.error(error.response.data.message)
        }
    }
    catch(err){
        console.error("Error fetching data",err)
    }
  }
  useEffect(()=>{
    getASA();
  },[id])

  const getSalary = async () => {
    try {
      const { response, error } = await SalaryInfo(`${endPoints.SALARY_INFO}/${id}`);
      console.log(response);
      // console.log(error);
      
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
  }, [id]);



  const handleDelete = async () => {
    try {
      const { response, error } = await deleteaSA(`${endPoints.SUPPORT_AGENT}/${id}`); 
      if (response) {
        toast.success(response.data.message);
        navigate("/support-agent");
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the Support Agent.");
    }
  };
  
  const navigate = useNavigate()
  const handleDeactivate = async () => {
    const body = {
      status: getData.saData?.status === "Active" ? 'Deactive' : 'Active'
    }
    try {
      const { response, error } = await deactiveSA(`${endPoints.DEACTIVATE_SA}/${id}`, body);
      console.log(response);
      console.log(error, "error message");


      if (response) {
        toast.success(response.data.message);
        navigate("/support-agent");
      } else {
        console.log(error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Deactivate error:", err);
      toast.error("Failed to Deactivate the supervisor.");
    }
  };

    
  return (
     <div>
       <div className="w-full space-y-3">
  <div className="h-auto sm:h-[150px] relative flex flex-col bg-white rounded-lg overflow-hidden">
    {/* User Image */}
    {getData.saData?.user?.userImage && getData.saData?.user?.userImage.length > 500 ? (
      <img
        src={getData.saData?.user?.userImage}
        className="rounded-full absolute top-8 left-4 w-20 h-20 border-[3px] border-white"
        alt="User Image"
      />
    ) : (
      <p className="w-20 h-20 absolute top-8 left-4 bg-black rounded-full flex justify-center items-center">
        <UserIcon color="white" size={35} />
      </p>
    )}

    {/* Background Image */}
    <div
      className="h-[65px] bg-cover rounded-t-lg w-full flex justify-center"
      style={{ backgroundImage: `url(${supportAgentbg})` }}
    ></div>

    {/* User Info Section */}
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mt-20 sm:mt-[88px] px-4 gap-4">
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Support Agent", value: getData.saData?.user?.userName },
          { label: "Email", value: getData.saData?.user?.email },
          { label: "Phone", value: getData.saData?.user?.phoneNo },
          { label: "Employee ID", value: getData.saData?.user?.employeeId },
          {
            label: "Region",
            value: getData.saData?.region?.regionCode,
            onClick: () => navigate(`/regions/${getData.saData?.region?._id}`),
            clickable: true,
          },
          { label: "Assigned Supervisor", value: getData.saData?.supervisor?.name },
          {
            label: "Joining Date",
            value: getData.saData?.dateOfJoining
              ? new Date(getData.saData?.dateOfJoining).toLocaleDateString()
              : "N/A",
          },
        ].map((item, index) => (
          <div key={index} className="min-w-[120px]">
            <p className="text-[#8F99A9] text-xs font-medium mb-1">{item.label}</p>
            <p
              className={`text-[#303F58] text-xs font-medium ${item.clickable ? "underline cursor-pointer" : ""}`}
              onClick={item.onClick}
            >
              {item.value || "N/A"}
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center sm:justify-end gap-4">
        {[
          {
            label: "Edit Profile",
            icon: <EditIcon size={18} color="#4B5C79" />,
            onClick: () => handleModalToggle(true, false, false, false, false, false),
          },
          {
            label: "View Details",
            icon: <ViewRoundIcon size={18} color="#4B5C79" />,
            onClick: () => handleModalToggle(false, true, false, false, false, false),
          },
          {
            label: getData.saData?.status === "Active" ? "Deactivate" : "Activate",
            icon: getData.saData?.status === "Active" ? (
              <DeActivateIcon size={18} color="#D52B1E4D" />
            ) : (
              <UserRoundCheckIcon size={20} color="#D52B1E4D" />
            ),
            onClick: () => handleModalToggle(false, false, false, true, false, false),
          },
          {
            label: "Delete",
            icon: <Trash size={18} color="#BC3126" />,
            onClick: () => handleModalToggle(false, false, true, false, false, false),
          },
          {
            label: "Salary Info",
            icon: <SalaryRoundIcon size={18} color="#4B5C79" />,
            onClick: () => handleModalToggle(false, false, false, false, true, false),
          },
          {
            label: "Commission",
            icon: <CommissionRoundIcon size={18} color="#4B5C79" />,
            onClick: () => handleModalToggle(false, false, false, false, false, true),
          },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              onClick={item.onClick}
              className="w-9 h-9 mb-1 rounded-full cursor-pointer bg-[#C4A25D4D] border border-white flex items-center justify-center"
            >
              {item.icon}
            </div>
            <p className="text-center text-[#4B5C79] text-xs font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

        <Modal open={isModalOpen.editSA} onClose={()=>handleModalToggle()} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]  max-sm:overflow-auto">
        <SupportAgentForm editId={id}  onClose={()=>handleModalToggle()} />
      </Modal><Modal open={isModalOpen.viewSA} onClose={()=>handleModalToggle()} className="w-[50%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto">
        <SAViewForm onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.confirm}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" 
      >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this Supervisor?"
          onClose={() => handleModalToggle()}
        />
      </Modal>  
      <Modal
        open={isModalOpen.deacivateSA}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <ConfirmModal
          action={handleDeactivate}
          prompt={
            getData.saData?.status === "Active"
              ? "Are you sure want to deactivate this Support Agent?"
              : "Are you sure want to activate this Support Agent?"
          }
          onClose={() => handleModalToggle()}
        />
      </Modal>

      <Modal open={isModalOpen.salaryInfoSA} onClose={()=>handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
    <SalaryInfoModal salaryDetails={salaryDetails}  onClose={()=>handleModalToggle()} />
  </Modal>

  <Modal open={isModalOpen.commissionSA} onClose={()=>handleModalToggle()} className="w-[45%] max-sm:w-[90%] max-md:w-[70%] ">
    <CommissionModal id={id}  onClose={()=>handleModalToggle()} />
  </Modal>


    </div>
  )
}

export default ViewHeader