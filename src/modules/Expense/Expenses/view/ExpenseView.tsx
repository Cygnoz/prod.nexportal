import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import ChevronRight from "../../../../assets/icons/ChevronRight"
import ConfirmModal from "../../../../components/modal/ConfirmModal"
import Modal from "../../../../components/modal/Modal"
import Button from "../../../../components/ui/Button"
import { useRegularApi } from "../../../../context/ApiContext"
import useApi from "../../../../Hooks/useApi"
import { endPoints } from "../../../../services/apiEndpoints"
import ExpenseViewImage from "./ExpenseViewImage"

type Props = {
    
}

const ExpenseView = ({ }: Props) => {
    const {id}=useParams()
    const {refreshContext,expenseViewDetails}=useRegularApi()
    const [updatedData,setUpdatedData]=useState<any>('')
    const [comment,setComment]=useState<any>('')
    const {request:editExpense}=useApi('put',3002)
    useEffect(()=>{
        if(id){
            refreshContext({expenseViewId:id})
        }
    },[id,refreshContext])

    const [isModalOpen,setIsModalOpen]=useState({
        billPreview:false,
        confirm:false
    })
    const handleModalToggle = (
        billPreview = false,
        confirm = false
      ) => {
        setIsModalOpen((prev) => ({
          ...prev,
          billPreview,
          confirm // Updated key with new parameter name
        }));
    }

    const handleStatusChange=(status:string)=>{
        setUpdatedData({
            ...expenseViewDetails,
            status
        })
        if(status=="Rejected" &&comment===''){
            toast.error('Please enter rejection reason on comment field')
        }else{
            setUpdatedData({
                ...expenseViewDetails,
                status,
                comment
            })
        handleModalToggle(false,true)
        }
    }

    console.log("ecss",expenseViewDetails);
    const handleEdit = async() => {
       
        try {
           const  { response, error } = await editExpense(`${endPoints.EXPENSE}/${id}`, updatedData);
            if (response) {
              toast.success(response.data.message);
              if(updatedData?.status==='Rejected'){
                navigate('/expense')
              }else{
                navigate(`/expense-granted/${id}`)
              }
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
            <div className="flex items-center text-[16px] space-x-2">
                <p
                    onClick={() => navigate("/expense")}
                    className="font-bold cursor-pointer text-[#820000] "
                >
                    Expense
                </p>
                <ChevronRight color="#4B5C79" size={18} />
                <p className="font-bold text-[#303F58] ">{expenseViewDetails?.expenseName}</p>
            </div>

            <div className="w-full bg-[#FFFFFF] mt-4 p-6 rounded-2xl gap-6">
    <div className="flex flex-wrap gap-4 items-center">
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">{expenseViewDetails?.expenseName}</p>
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">{expenseViewDetails?.category?.categoryName}</p>
        <button className="justify-center text-[#FFFFFF] font-medium text-xs bg-[#C4A25D] rounded-md w-32 h-5">{expenseViewDetails?.status}</button>
    </div>

    <div className="flex gap-4 py-2">
        <p className="text-[#4B5C79] text-sm font-semibold">Expense:</p>
        <p className="text-[#4B5C79] text-sm font-semibold">
            {expenseViewDetails?.createdAt
                ? expenseViewDetails.createdAt.split('T')[0].split('-').reverse().join('-')
                : ''}
        </p>
    </div>

    <div className="bg-gradient-to-r from-[#E3E6D5] to-[#F7E7CE] px-5 py-4 rounded-lg flex justify-between items-center">
        <p className="text-[#495160] text-sm font-semibold">Expense Amount</p>
        <p className="text-[#495160] text-lg font-bold">Rs.{expenseViewDetails?.amount}</p>
    </div>

    <div className="flex justify-between items-center flex-wrap">
        <div className="flex flex-col gap-3 w-full sm:w-auto">
            <p className="text-[#818894] text-sm font-semibold">Expense Account</p>
            <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.expenseAccount}</p>
        </div>
        <div className="flex flex-col gap-3 py-2 w-full sm:w-auto">
            <div className="flex gap-5">
                <p className="text-[#818894] text-sm font-semibold text-center w-full sm:w-auto">Added By</p>
                <p className="text-[#818894] text-sm font-semibold text-center w-full sm:w-auto">Role</p>
            </div>

            <div className="flex gap-7">
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.addedBy?.userName}</p>
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.addedBy?.role}</p>
            </div>
        </div>
    </div>

    {expenseViewDetails?.image && (
        <div className="bg-[#FFFFFF] border border-[#E7E7E7] p-4 rounded-lg gap-2 flex justify-between flex-wrap">
            <div className="flex gap-1">
                <div>
                    <img className="w-9 h-9" src={expenseViewDetails?.image} alt="" />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0B0B0B] text-xs font-semibold">Bill.jpg</p>
                </div>
            </div>

            <div>
                <p onClick={() => handleModalToggle(true, false)} className="cursor-pointer underline text-[#820000] text-xs font-semibold mt-1">View</p>
            </div>
        </div>
    )}

    <p className="gap-2 my-2 text-sm font-normal text-[#303F58]">Comments</p>
    <div className="border border-[#CECECE] rounded-md">
        <textarea
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-16 rounded-md outline-none p-3 text-[#818894] text-xs font-normal"
            placeholder="Enter Comments"
        />
    </div>

    <div className="my-3">
        <p className="text-[#303F58] text-xs font-medium mb-1">Note</p>
        <p className="text-[#4B5C79] text-xs font-normal">{expenseViewDetails?.note}</p>
    </div>

    <div className="flex justify-end gap-2 mt-6 pb-2 flex-wrap">
        <Button
            variant="tertiary"
            className="w-36 h-10 justify-center text-sm rounded-lg text-[#565148] font-medium border border-[#585953]"
            size="lg"
            onClick={() => navigate('/expense')}
        >
            Cancel
        </Button>
        <Button
            variant="failure"
            className="w-36 h-10 justify-center text-sm rounded-lg text-[#585953] font-medium bg-[#FCFFED] border border-[#585953]"
            size="lg"
            onClick={() => { handleStatusChange('Rejected') }}
        >
            Reject
        </Button>
        <Button
            className="w-36 h-10 justify-center text-sm rounded-lg text-[#FEFDF9] font-medium border border-[#585953] bg-green-500"
            size="lg"
            type="submit"
            variant="success"
            onClick={() => handleStatusChange('Approval Granted')}
        >
            Approve
        </Button>
    </div>
</div>

        <Modal open={isModalOpen.billPreview} onClose={() => handleModalToggle()}className="w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]">
            <ExpenseViewImage onClose={() => handleModalToggle()} image={expenseViewDetails?.image}/>
         </Modal>
         <Modal className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" align="center" open={isModalOpen.confirm} onClose={() => handleModalToggle()}>
    <ConfirmModal
      action={handleEdit}
      prompt={`Are you sure want to ${updatedData?.status==='Rejected'?'reject':'approve'} this expense?`}
      onClose={() => handleModalToggle()}
    />
  </Modal>
        </>
    )
}

export default ExpenseView