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
            <div className="w-full bg-white mt-4 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">
          {expenseViewDetails?.expenseName}
        </p>
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">
          {expenseViewDetails?.category?.categoryName}
        </p>
        <button className="bg-[#C4A25D] text-white text-xs font-medium rounded-md px-4 py-1">
          {expenseViewDetails?.status}
        </button>
      </div>

      <div className="flex gap-4 py-3">
        <p className="text-[#4B5C79] text-sm font-semibold">Expense Date:</p>
        <p className="text-[#4B5C79] text-sm font-semibold">
          {expenseViewDetails?.createdAt?.split('T')[0]?.split('-').reverse().join('-') || ''}
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#E3E6D5] to-[#F7E7CE] px-5 py-4 rounded-lg shadow-md flex justify-between items-center">
        <p className="text-[#495160] text-sm font-semibold">Expense Amount</p>
        <p className="text-[#495160] text-lg font-bold">Rs. {expenseViewDetails?.amount}</p>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4 my-4">
        <div>
          <p className="text-[#818894] text-sm font-semibold">Expense Account</p>
          <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.expenseAccount}</p>
        </div>
        <div>
          <p className="text-[#818894] text-sm font-semibold">Added By</p>
          <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.addedBy?.userName} ({expenseViewDetails?.addedBy?.role})</p>
        </div>
      </div>

      {expenseViewDetails?.image && (
        <div className="bg-white border border-[#E7E7E7] p-4 rounded-lg flex items-center gap-3">
          <img className="w-12 h-12 rounded-md" src={expenseViewDetails?.image} alt="Expense" />
          <p className="text-[#0B0B0B] text-xs font-semibold">Bill.jpg</p>
          <p 
            onClick={() => handleModalToggle(true, false)}
            className="cursor-pointer text-[#820000] text-xs font-semibold underline"
          >
            View
          </p>
        </div>
      )}

      <div className="my-3">
        <p className="text-[#303F58] text-sm font-normal">Comments</p>
        <textarea
          onChange={(e) => setComment(e.target.value)}
          className="w-full min-h-16 rounded-md outline-none p-3 border border-[#CECECE] text-[#818894] text-xs"
          placeholder="Enter Comments"
        />
      </div>

      <div className="my-3">
        <p className="text-[#303F58] text-xs font-medium mb-1">Note</p>
        <p className="text-[#4B5C79] text-xs font-normal">{expenseViewDetails?.note}</p>
      </div>

      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <Button
          variant="tertiary"
          className="w-36 h-10 text-sm rounded-lg border border-[#585953]"
          onClick={() => navigate('/expense')}
        >
          Cancel
        </Button>
        <Button
          variant="failure"
          className="w-36 h-10 text-sm rounded-lg bg-[#FCFFED] border border-[#585953]"
          onClick={() => handleStatusChange('Rejected')}
        >
          Reject
        </Button>
        <Button
          className="w-36 h-10 text-sm rounded-lg bg-green-500 text-white border border-[#585953]"
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