import { useNavigate, useParams } from "react-router-dom"
import ChevronRight from "../../../../assets/icons/ChevronRight"
import bg from "../../../../assets/image/bgPay.jpeg";
import RupeeIcon from "../../../../assets/icons/RupeeIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
import CalenderDays from "../../../../assets/icons/CalenderDays";
import Timer from "../../../../assets/icons/Timer";
import IndianRupeeIcon from "../../../../assets/icons/IndianRupeeIcon";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/form/Input";
import { useRegularApi } from "../../../../context/ApiContext";
import NoImage from "../../../../components/ui/NoImage";
import { useEffect, useState } from "react";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import toast from "react-hot-toast";
import Modal from "../../../../components/modal/Modal";
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import { useResponse } from "../../../../context/ResponseContext";
type Props = {

}

const PayrollAwApp = ({ }: Props) => {
      const {id}=useParams()
          const {refreshContext,payrollViewDetails}=useRegularApi()
          const {setPostLoading}=useResponse()
    const navigate = useNavigate()
    const {request:editPayroll}=useApi('put',3002);
     useEffect(()=>{
              if(id){
                  refreshContext({payrollViewId:id})
              }
          },[id,refreshContext])
          const [comments,setComments]=useState<any>('')
          const [isModalOpen,setIsModalOpen]=useState(false)
          const handleModalToggle=()=>{
            setIsModalOpen((prev)=>!prev)
          }

        

          const handleEditPayroll = async() => {
            const editBody={
             payRollStatus:'Approval Granted',
              comments
            }
             
            try {
              setPostLoading(true)
               const  { response, error } = await editPayroll(`${endPoints.PAYROLL}/${id}`, editBody);
                if (response) {
                  toast.success(response.data.message);
                    navigate(`/payroll-view3/${id}`)
                  
                } else if (error) {
                  toast.error(error?.response?.data?.message || "An error occurred");
                }
              } catch (err) {
                console.error("Submission Error:", err);
                toast.error("Something went wrong. Please try again.");
              }finally{
                setPostLoading(false)
              }
        }
          
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
 className="flex flex-wrap justify-between items-center gap-3 px-3 bg-cover rounded-xl w-full bg-no-repeat"          style={{

            backgroundImage: `url(${bg})`, // Use the imported image
          }}
        >

         
            {/* Left Section: Area Icon and Details */}

          
        
            <div className="flex items-center gap-2 mt-2 w-full sm:w-auto mb-2 sm:mb-0">
            {payrollViewDetails?.staffId?.user?.userImage? <img
                    src={payrollViewDetails?.staffId?.user?.userImage ||'N/A'}

                    alt="Profile"
                    className="w-12 rounded-full h-12 object-cover"
                  />:
                  <NoImage roundedSize={40} iconSize={25} />
                  }
                
                <p className="text-[#303F58] text- font-bold w-fit">{payrollViewDetails?.staffId?.user?.userName ||'N/A'}</p>
              </div>

              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                              <div className="w-full sm:w-auto">
                  <p className="text-xs font-medium text-[#4B5C79] py-2  flex">
                    <UserIcon color="#768294" />
                    Role
                  </p>

                  <h3 className="text-sm font-bold text-[#303F58] w-fit">
                  {payrollViewDetails?.staffId?.user?.role}
                  </h3>
                </div>
                <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>                <div className="w-full sm:w-auto">
                <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <CalenderDays color="#768294" size={16} />
        Date Of Joining
      </p>
                  <p className="text-sm font-bold text-[#303F58]">
                  {payrollViewDetails?.createdAt
    ?payrollViewDetails?.createdAt.split('T')[0].split('-').reverse().join('-')
    : 'N/A'}
                  </p>
                </div>
                <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>                <div className="w-full sm:w-auto">
                <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Working Days
      </p>
                  <p className="text-sm font-bold text-[#303F58]">
                    287
                  </p>
                </div>
                <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>                <div className="w-full sm:w-auto">
                <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Present Days
      </p>
                  <p className="text-sm font-bold text-[#303F58]">
                    232
                  </p>
                </div>
                <div className="border-r border-[#DADADA] h-10 mx-3 sm:mx-4 hidden sm:block"></div>                <div className="w-full sm:w-auto">
                <p className="text-xs font-medium text-[#4B5C79] py-1 whitespace-nowrap flex">
        <Timer color="#768294" />
        Leave Days
      </p>
                  <p className="text-sm font-bold text-[#303F58]">
                    55
                  </p>
                </div>
              </div>

                <div className="bg-gradient-to-r my-3 from-[#820000] to-[#2C353B] text-white rounded-lg p-2 w-52 shadow-lg">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-2 mb-2">
      <RupeeIcon size={28} />
      <p className="text-lg font-semibold">Total Earnings</p>
    </div>

                  {/* Amount */}
                  <p className="text-xl font-bold text-center">₹ {payrollViewDetails?.totalSalary}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mt-1">Basic Salary + Commission</p>
                </div>
              

            
        

        </div>


      
      <div className="my-2">
        <h1 className="text-base font-bold text-[#303F58]">Total Earning Details</h1>
      </div>

      <div className="bg-white p-3 rounded-lg">
   <div className="flex gap-4 flex-wrap sm:flex-nowrap md:flex-wrap">
      
      <div className="bg-gradient-to-r from-[#E3E6D5] to-[#F7E7CE] w-full sm:w-auto flex items-center justify-center p-4 rounded-lg shadow-md">
         <div className="text-center sm:text-left">
            <div className="ml-9">
               <IndianRupeeIcon size={16} />
            </div>
            <p className="text-sm text-gray-600 font-medium">Basic Salary</p>
            <p className="text-2xl font-bold">₹ {payrollViewDetails?.basicSalary}</p>
         </div>
      </div>

      <div className="bg-[#F6F5F4] w-full sm:w-auto flex flex-col justify-center p-4 rounded-lg shadow-md flex-1">
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="border-r">
               <p className="text-xs text-[#4B5C79]">
                  <span>%</span><br /> Commission Profile Name
               </p>
               <p className="font-bold text-sm text-[#303F58]">
                  {payrollViewDetails?.commissionProfile?.profileName || 'N/A'}
               </p>
            </div>
            <div className="border-r">
               <p className="text-xs text-[#4B5C79]">Threshold Licenses</p>
               <p className="font-bold text-sm text-[#303F58]">
                  {payrollViewDetails?.commissionProfile?.thresholdLicense || '0'}
               </p>
            </div>
            <div className="border-r">
               <p className="text-xs text-[#4B5C79]">Commission Point</p>
               <p className="font-bold text-sm text-[#303F58]">
                  {payrollViewDetails?.commissionProfile?.commissionPoint || '0'}
               </p>
            </div>
            <div>
               <p className="text-xs text-[#4B5C79]">Recurring Point</p>
               <p className="font-bold text-sm text-[#303F58]">
                  {payrollViewDetails?.commissionProfile?.recurringPoint || '0'}
               </p>
            </div>
         </div>
      </div>

      <div className="bg-[#F1F4E4] w-full sm:w-auto flex items-center justify-center p-2 rounded-lg shadow-md">
         <div className="text-center sm:text-left">
            <div className="ml-8">
               <UserIcon color="#768294" />
            </div>
            <p className="text-xs text-[#303F58] font-medium my-1">Total Licenses</p>
            <p className="text-sm text-[#303F58] font-bold">{payrollViewDetails?.totalLicenses || '0'}</p>
         </div>
      </div>

      <div className="bg-[#F1F4E4] w-full sm:w-auto flex items-center justify-center p-1 rounded-lg shadow-md">
         <div className="text-center sm:text-left">
            <div className="ml-[60px]">
               <UserIcon color="#768294" />
            </div>
            <p className="text-xs text-[#303F58] font-medium my-1">Total Recurring Licenses</p>
            <p className="text-sm text-[#303F58] font-bold">{payrollViewDetails?.recurringLicenses || '0'}</p>
         </div>
      </div>
   </div>
</div>


            <div className="bg-white font-bold text-base mt-2 rounded-lg">
                <div className="bg-white p-2 shadow-md rounded-lg">
                    <h1 className="text-base font-bold mb-4">Payroll Details</h1>
                    <div className="grid grid-cols-12 bg-[#FBFBFB] p-2">
                        <div className="col-span-6">
                            <h1 className=" text-xs font-semibold text-[#4B5C79]">Basic Salary</h1>
                           <div className="mt-3">
                           <div className="flex items-center">
                                <h1><RupeeIcon color="black" size={16} /></h1>
                                <h1 className="text-base text-[#303F58] font-bold" >{payrollViewDetails?.basicSalary ||'0'}</h1>
                            </div>
                            {payrollViewDetails?.totalSalaryReason&&<div className="flex mt-2">
                                <h1 className="text-[#948B7C] text-xs font-semibold">Note:</h1>
                                <h1 className="text-[#4B5C79] text-xs font-light ms-2">
                                {payrollViewDetails?.totalSalaryReason ||''}
                                </h1>

                            </div>}

                            </div>   

                               <div className="mt-6">
                               <h1 className=" text-xs font-semibold text-[#4B5C79]">Recurring Amount</h1>
                           <div className="flex mt-3 items-center">
                                <h1><RupeeIcon color="black" size={16} /></h1>
                                <h1 className="text-base text-[#303F58] font-bold" >{payrollViewDetails?.recuringAmount ||0}</h1>
                            </div>
                            {payrollViewDetails?.recuringAmountReason &&<div className="flex mt-2">
                                <h1 className="text-[#948B7C] text-xs font-semibold">Note:</h1>
                                <h1 className="text-[#4B5C79] text-xs font-light ms-2">
                                {payrollViewDetails?.recuringAmountReason ||''}
                                </h1>

                            </div>}

                            </div>                    
                             </div>
                             <div className="col-span-6">
                            <h1 className=" text-xs font-semibold text-[#4B5C79]">New License Earnings</h1>
                           <div className="mt-3">
                           <div className="flex items-center">
                                <h1><RupeeIcon color="black" size={16} /></h1>
                                <h1 className="text-base text-[#303F58] font-bold" >{payrollViewDetails?.newLicenseEarnings ||0}</h1>
                            </div>
                            {payrollViewDetails?.newLicenseEarningsReason&&<div className="flex mt-2">
                                <h1 className="text-[#948B7C] text-xs font-semibold">Note:</h1>
                                <h1 className="text-[#4B5C79] text-xs font-light ms-2"> {payrollViewDetails?.newLicenseEarningsReason ||''}</h1>
                            </div>}

                            </div>   

                               <div className="mt-6">
                               <h1 className=" text-xs font-semibold text-[#4B5C79]">Travel Allowance</h1>
                           <div className="flex mt-3 items-center">
                                <h1><RupeeIcon color="black" size={16} /></h1>
                                <h1 className="text-base text-[#303F58] font-bold" >{payrollViewDetails?.TravelAllowance ||0}</h1>
                            </div>
                           {payrollViewDetails?.TravelAllowanceReason&& <div className="flex mt-2">
                                <h1 className="text-[#948B7C] text-xs font-semibold">Note:</h1>
                                <h1 className="text-[#4B5C79] text-xs font-light ms-2">{payrollViewDetails?.TravelAllowanceReason ||''}</h1>

                            </div>}

                            </div>                    
                             </div>

                    </div>

                    <div className="mt-4 p-4">
                        <Input onChange={(e)=>setComments(e.target.value)} type="text" placeholder="comments" label="Add Comments"/>
                    </div>

                    <div className="mt-3 p-2">
                    <hr />

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


            </div>
            <div className="flex justify-end gap-2 mt-3 pb-2 h-64">
                <Button onClick={()=>navigate('/payroll')} variant="tertiary" className="w-36 h-10 justify-center text-sm rounded-lg text-[#565148] font-medium">Cancel</Button>
                 <Button onClick={handleModalToggle} variant="primary" className="w-36 h-10 justify-center text-sm rounded-lg text-[#FEFDF9] font-medium">Approve</Button>
            </div>
            <Modal        className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" 
 align="center" open={isModalOpen} onClose={ handleModalToggle}>
    <ConfirmModal
      action={handleEditPayroll}
      prompt={`Are you sure want to approve this payroll?`}
      onClose={handleModalToggle}
    />
  </Modal>
        </>
    )
}

export default PayrollAwApp
