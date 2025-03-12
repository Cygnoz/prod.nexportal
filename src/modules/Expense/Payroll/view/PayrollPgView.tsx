import { useNavigate, useParams } from "react-router-dom"
import ChevronRight from "../../../../assets/icons/ChevronRight"
import bg from "../../../../assets/image/bgPay.jpeg";
import RupeeIcon from "../../../../assets/icons/RupeeIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
import CalenderDays from "../../../../assets/icons/CalenderDays";
import Timer from "../../../../assets/icons/Timer";
import IndianRupeeIcon from "../../../../assets/icons/IndianRupeeIcon";
import Input from "../../../../components/form/Input";
import EditIcon from "../../../../assets/icons/EditIcon";
import Button from "../../../../components/ui/Button";
import { useEffect, useState } from "react";
import { useRegularApi } from "../../../../context/ApiContext";
import NoImage from "../../../../components/ui/NoImage";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import toast from "react-hot-toast";
import Modal from "../../../../components/modal/Modal";
import ConfirmModal from "../../../../components/modal/ConfirmModal";
type Props = {

}

const PayrollPgView = ({ }: Props) => {
  const {id}=useParams()
  const {refreshContext,payrollViewDetails}=useRegularApi()
  const [isEditing, setIsEditing] = useState(false);
  const {request:editPayroll}=useApi('put',3002);
  const [isModalOpen,setIsModalOpen]=useState(false)
  const handleModalToggle=()=>{
    setIsModalOpen((prev)=>!prev)
  }
  const [reasons,setReasons]=useState({
    totalSalaryReason:'',
    TravelAllowanceReason:'',
    newLicenseEarningsReason:'',
    recuringAmountReason:""
  })
  
  const handleEdit = () => { setIsEditing(true); };
  const handleCancel = () => { setIsEditing(false); };
   useEffect(()=>{
          if(id){
              refreshContext({payrollViewId:id})
          }
      },[id,refreshContext])

      console.log("payrol",payrollViewDetails);
      
    //   const handleStatusChange=(status:string)=>{
    //     setUpdatedData({
    //         ...expenseViewDetails,
    //         status
    //     })
    //     if(status=="Rejected" &&comment===''){
    //         toast.error('Please enter rejection reason on comment field')
    //     }else{
    //         setUpdatedData({
    //             ...expenseViewDetails,
    //             status,
    //             comment
    //         })
    //     handleModalToggle(false,true)
    //     }
    // }    
    const handleEditPayroll = async() => {
      const editBody={
        payRollStatus:'Awaiting Approval',
        totalSalaryReason:reasons?.totalSalaryReason,
        TravelAllowanceReason:reasons?.TravelAllowanceReason,
        newLicenseEarningsReason:reasons?.newLicenseEarningsReason,
        recuringAmountReason:reasons?.recuringAmountReason,
      }
       
      try {
         const  { response, error } = await editPayroll(`${endPoints.PAYROLL}/${id}`, editBody);
          if (response) {
            toast.success(response.data.message);
              navigate(`/payroll-view2/${id}`)
            
          } else if (error) {
            toast.error(error?.response?.data?.message || "An error occurred");
          }
        } catch (err) {
          console.error("Submission Error:", err);
          toast.error("Something went wrong. Please try again.");
        }
  }
    const navigate = useNavigate()
  return (
    <>
      <div className="flex items-center text-[16px] space-x-2 mb-4">
        <p onClick={() => navigate('/payroll')} className="font-bold cursor-pointer text-[#820000]">Payroll</p>
        <ChevronRight color="#4B5C79" size={18} />
        <p className="font-bold text-[#303F58]">
          {payrollViewDetails?.payRollId ||'N/A'}
        </p>
      </div>


   
      <div
  className="flex flex-wrap justify-between items-center gap-3 px-3 bg-cover rounded-xl w-full bg-no-repeat"
  style={{ backgroundImage: `url(${bg})` }}
>
  {/* Left Section: Area Icon and Details */}
  <div className="flex items-center gap-2 mt-2 w-full sm:w-auto mb-2 sm:mb-0">
    {payrollViewDetails?.staffId?.user?.userImage ? (
      <img
        src={payrollViewDetails?.staffId?.user?.userImage || 'N/A'}
        alt="Profile"
        className="w-12 rounded-full h-12 object-cover"
      />
    ) : (
      <NoImage roundedSize={40} iconSize={25} />
    )}
    <p className="text-[#303F58] text-sm font-bold w-fit">
      {payrollViewDetails?.staffId?.user?.userName || 'N/A'}
    </p>
  </div>

  <div className="flex flex-wrap gap-4 w-full sm:w-auto">
    <div className="w-full sm:w-auto">
      <p className="text-xs font-medium text-[#4B5C79] py-1 flex">
        <UserIcon color="#768294" />
        Role
      </p>
      <h3 className="text-sm font-bold text-[#303F58]">
        {payrollViewDetails?.staffId?.user?.role || 'N/A'}
      </h3>
    </div>

    {/* Border div - Hidden on mobile screens */}
    <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>

    <div className="w-full sm:w-auto">
      <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <CalenderDays color="#768294" size={16} />
        Date Of Joining
      </p>
      <p className="text-sm font-bold text-[#303F58]">
        {payrollViewDetails?.staffId?.dateOfJoining
          ? payrollViewDetails?.staffId?.dateOfJoining.split('T')[0].split('-').reverse().join('-')
          : 'N/A'}
      </p>
    </div>

    {/* Border div - Hidden on mobile screens */}
    <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>

    <div className="w-full sm:w-auto">
      <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Working Days
      </p>
      <p className="text-sm font-bold text-[#303F58]">287</p>
    </div>

    {/* Border div - Hidden on mobile screens */}
    <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>

    <div className="w-full sm:w-auto">
      <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Present Days
      </p>
      <p className="text-sm font-bold text-[#303F58]">232</p>
    </div>

    {/* Border div - Hidden on mobile screens */}
    <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>

    <div className="w-full sm:w-auto">
      <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Leave Days
      </p>
      <p className="text-sm font-bold text-[#303F58]">55</p>
    </div>
  </div>

  <div className="bg-gradient-to-r my-2 from-[#820000] to-[#2C353B] text-white rounded-lg p-2 w-full sm:w-52 shadow-lg mt-3 sm:mt-0">
    <div className="flex items-center gap-2 mb-2">
      <RupeeIcon size={28} />
      <p className="text-lg font-semibold">Total Earnings</p>
    </div>
    <p className="text-xl font-bold text-center">₹ {payrollViewDetails?.totalSalary || 'N/A'}</p>
    <p className="text-sm text-gray-300 mt-1">Basic Salary + Commission</p>
  </div>
</div>



<div className="my-2">
  <h1 className="text-base font-bold text-[#303F58]">Total Earning Details</h1>
</div>

<div className="bg-white p-3 rounded-lg">
  <div className="flex gap-4 flex-wrap sm:flex-nowrap">
    {/* Basic Salary */}
    <div className="bg-gradient-to-r from-[#E3E6D5] to-[#F7E7CE] flex items-center justify-center p-4 rounded-lg shadow-md w-full sm:w-auto">
      <div className="text-center">
        <div className="ml-9">
          <IndianRupeeIcon size={16} />
        </div>
        <p className="text-sm text-gray-600 font-medium">Basic Salary</p>
        <p className="text-2xl font-bold">₹ {payrollViewDetails?.basicSalary}</p>
      </div>
    </div>

    {/* Commission Details */}
    <div className="bg-[#F6F5F4] flex flex-col justify-center p-4 rounded-lg shadow-md flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="border-r">
          <p className="text-xs text-[#4B5C79]">Commission Profile Name</p>
          <p className="font-bold text-sm text-[#303F58]">
            {payrollViewDetails?.commissionProfile?.profileName || 'No Commission'}
          </p>
        </div>
        <div className="border-r">
          <p className="text-xs text-[#4B5C79]">Threshold Licenses</p>
          <p className="font-bold text-sm text-[#303F58]">
            {payrollViewDetails?.commissionProfile?.thresholdLicense || 0}
          </p>
        </div>
        <div className="border-r">
          <p className="text-xs text-[#4B5C79]">Commission Point</p>
          <p className="font-bold text-sm text-[#303F58]">
            {payrollViewDetails?.commissionProfile?.commissionPoint || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#4B5C79]">Recurring Point</p>
          <p className="font-bold text-sm text-[#303F58]">
            {payrollViewDetails?.commissionProfile?.recurringPoint || 0}
          </p>
        </div>
      </div>
    </div>

    {/* Total Licenses */}
    <div className="bg-[#F1F4E4] flex items-center justify-center p-2 rounded-lg shadow-md">
      <div className="text-center">
        <div className="ml-8">
          <UserIcon color="#768294" />
        </div>
        <p className="text-xs text-[#303F58] font-medium my-1">Total Licenses</p>
        <p className="text-sm text-[#303F58] font-bold">{payrollViewDetails?.totalLicenses}</p>
      </div>
    </div>

    {/* Total Recurring Licenses */}
    <div className="bg-[#F1F4E4] flex items-center justify-center p-1 rounded-lg shadow-md">
      <div className="text-center">
        <div className="ml-[60px]">
          <UserIcon color="#768294" />
        </div>
        <p className="text-xs text-[#303F58] font-medium my-1">Total Recurring Licenses</p>
        <p className="text-sm text-[#303F58] font-bold">
          {payrollViewDetails?.recurringLicenses}
        </p>
      </div>
    </div>
  </div>
</div>

<div className="bg-white font-bold text-base mt-2 rounded-lg">
  <h1 className="p-2">Payroll Details</h1>
  <div className="p-4 gap-2 space-y-2">
    <div className={`items-center gap-2 grid ${isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <Input
        label="Basic Salary"
        placeholder={`₹${payrollViewDetails?.basicSalary}` || 'N/A'}
        disabled={!isEditing}
      />
      {isEditing && (
        <Input
          onChange={(e) => setReasons({ ...reasons, totalSalaryReason: e.target.value })}
          label="Reason"
          placeholder="Provide a reason for changes"
        />
      )}
    </div>
    <div className={`items-center gap-2 grid ${isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <Input
        label="New License Earnings"
        placeholder={`₹${payrollViewDetails?.newLicenseEarnings}` || 'N/A'}
        disabled={!isEditing}
      />
      {isEditing && (
        <Input
          onChange={(e) => setReasons({ ...reasons, newLicenseEarningsReason: e.target.value })}
          label="Reason"
          placeholder="Provide a reason for changes"
        />
      )}
    </div>
    <div className={`items-center gap-2 grid ${isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <Input
        label="Recurring Amount"
        placeholder={`₹${payrollViewDetails?.recuringAmount}` || 'N/A'}
        disabled={!isEditing}
      />
      {isEditing && (
        <Input
          onChange={(e) => setReasons({ ...reasons, recuringAmountReason: e.target.value })}
          label="Reason"
          placeholder="Provide a reason for changes"
        />
      )}
    </div>
    <div className={`items-center gap-2 grid ${isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <Input
        label="Travel Allowance"
        placeholder={`₹${payrollViewDetails?.TravelAllowance}` || 'N/A'}
        disabled={!isEditing}
      />
      {isEditing && (
        <Input
          onChange={(e) => setReasons({ ...reasons, TravelAllowanceReason: e.target.value })}
          label="Reason"
          placeholder="Provide a reason for changes"
        />
      )}
    </div>
  </div>

  <div className="p-2 me-2 flex justify-end gap-4">
    {!isEditing ? (
      <Button
        variant="tertiary"
        onClick={handleEdit}
        className="w-fit h-10 justify-center text-sm rounded-lg text-[#565148] font-medium"
      >
        <EditIcon color="#565148" size={16} />
        Add Reason
      </Button>
    ) : (
      <>
        <Button
          onClick={handleCancel}
          variant="tertiary"
          className="w-28 h-10 justify-center text-sm rounded-lg text-[#565148] font-medium"
        >
          Cancel
        </Button>
      </>
    )}
  </div>

  <div className="p-4 rounded-lg">
    <div className="flex justify-end gap-3 p-4 text-xl bg-[#FDF8F0]">
      <p>Total amount:</p>
      <div className="flex items-center">
        <p>₹</p>
        <p>{payrollViewDetails?.totalSalary}</p>
      </div>
    </div>
  </div>
</div>

<div className="flex justify-end gap-2 mt-3 pb-2 h-64">
  <Button
    onClick={() => navigate('/payroll')}
    variant="tertiary"
    className="w-36 h-10 justify-center text-sm rounded-lg text-[#565148] font-medium"
  >
    Cancel
  </Button>
  <Button
    onClick={handleModalToggle}
    variant="primary"
    className="w-36 h-10 justify-center text-sm rounded-lg text-[#FEFDF9] font-medium"
  >
    Submit
  </Button>
</div>



      <Modal className="w-[30%]" align="center" open={isModalOpen} onClose={ handleModalToggle}>
    <ConfirmModal
      action={handleEditPayroll}
      prompt={`Are you sure want to submit this payroll?`}
      onClose={handleModalToggle}
    />
  </Modal>
    </>
  )
}

export default PayrollPgView
