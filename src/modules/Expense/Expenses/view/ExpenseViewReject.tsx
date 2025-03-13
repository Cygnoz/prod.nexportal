import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChevronRight from "../../../../assets/icons/ChevronRight";
import Modal from "../../../../components/modal/Modal";
import Button from "../../../../components/ui/Button";
import { useRegularApi } from "../../../../context/ApiContext";
import ExpenseViewImage from "./ExpenseViewImage";

const ExpenseViewReject = () => {
    const { id } = useParams();
    const { refreshContext, expenseViewDetails } = useRegularApi();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            refreshContext({ expenseViewId: id });
        }
    }, [id, refreshContext]);

    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen);
    };

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
            <div className="w-full bg-[#FFFFFF] p-6 rounded-2xl gap-6 mt-3">
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">{expenseViewDetails?.expenseName}</p>
        <p className="text-[#303F58] text-base font-semibold pr-3 border-r border-[#A3A9B3]">{expenseViewDetails?.category?.categoryName}</p>
        <Button className="justify-center text-[#FFFFFF] font-medium text-xs bg-[#C80024] rounded-md w-28 h-5">Rejected</Button>
    </div>

    <div className="flex gap-4 py-2">
        <p className="text-[#4B5C79] text-sm font-semibold">Expense:</p>
        <p className="text-[#4B5C79] text-sm font-semibold">
            {expenseViewDetails?.createdAt ? expenseViewDetails.createdAt.split('T')[0].split('-').reverse().join('-') : ''}
        </p>
    </div>

    <div className="bg-gradient-to-r from-[#E3E6D5] to-[#F7E7CE] px-5 py-4 rounded-lg flex justify-between items-center">
        <p className="text[#495160] text-sm font-semibold">Expense Amount</p>
        <p className="text[#495160] text-lg font-bold">Rs.{expenseViewDetails?.amount}</p>
    </div>

    <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
        <div className="flex flex-col gap-3">
            <p className="text-[#818894] text-sm font-semibold">Expense Account</p>
            <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.expenseAccount}</p>
        </div>
        
        <div className="flex flex-col gap-2 py-2">
            <div className="grid grid-cols-2 gap-10">
                <p className="text-[#818894] text-sm font-semibold text-center">Added By</p>
                <p className="text-[#818894] text-sm font-semibold text-center">Role</p>
            </div>
            <div className="grid grid-cols-2">
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.addedBy?.userName}</p>
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.addedBy?.role}</p>
            </div>
        </div>
    </div>

    {expenseViewDetails?.image && (
        <div className="bg-[#FFFFFF] border border-[#E7E7E7] p-4 rounded-lg gap-2 flex justify-between">
            <div className="flex gap-1">
                <div>
                    <img className="w-9 h-9" src={expenseViewDetails?.image} alt="" />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0B0B0B] text-xs font-semibold">Bill.jpg</p>
                </div>
            </div>
            <div>
                <p onClick={handleModalToggle} className="cursor-pointer underline text-[#820000] text-xs font-semibold mt-1">View</p>
            </div>
        </div>
    )}

    <div className="my-3">
        <p className="text-[#303F58] text-xs font-medium mb-1">Note</p>
        <p className="text-[#4B5C79] text-xs font-normal">{expenseViewDetails?.note || 'N/A'}</p>
    </div>

    <div className="flex flex-wrap md:flex-nowrap justify-between">
        <div className="my-3">
            <p className="text-red-500 text-sm font-bold mb-1">Reason</p>
            <p className="text-[#4B5C79] text-xs font-normal">{expenseViewDetails?.comment || 'N/A'}</p>
        </div>
        <div className="flex flex-col gap-3 py-2">
            <div className="flex gap-5">
                <p className="text-red-500 text-sm font-bold text-center w-full">Rejected By</p>
                <p className="text-red-500 text-sm font-bold text-center w-full">Role</p>
            </div>
            <div className="flex gap-7">
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.rejectedBy?.userName}</p>
                <p className="text-[#495160] text-sm font-bold">{expenseViewDetails?.rejectedBy?.role}</p>
            </div>
        </div>
    </div>

    <div className="flex justify-end gap-2 mt-6 pb-2">
        <Button
            variant="tertiary"
            className="w-36 h-10 justify-center text-sm rounded-lg text-[#565148] font-medium border border-[#585953]"
            size="lg"
            onClick={() => navigate('/expense')}
        >
            Cancel
        </Button>
    </div>
</div>




            <Modal open={isModalOpen} onClose={handleModalToggle} className="w-[35%]">
                <ExpenseViewImage onClose={handleModalToggle} image={expenseViewDetails?.image} />
            </Modal>
        </>
    );
};

export default ExpenseViewReject;
