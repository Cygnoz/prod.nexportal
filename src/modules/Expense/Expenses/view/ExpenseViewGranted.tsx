import { useNavigate, useParams } from "react-router-dom";
import ChevronRight from "../../../../assets/icons/ChevronRight";
// import EmailIcon from "../../../../assets/icons/EmailIcon";
// import VectorIcon from "../../../../assets/icons/VectorIcon";
import Button from "../../../../components/ui/Button";
import cygnoz from "../../../../assets/image/cygnozzzz.png";
import { useEffect, useState } from "react";
import { useRegularApi } from "../../../../context/ApiContext";
import Modal from "../../../../components/modal/Modal";
import PayModal from "../../Modal/PayModal";

type Props = {};

const ExpenseViewGranted = ({}: Props) => {
    const { id } = useParams();
    const { refreshContext, expenseViewDetails } = useRegularApi();
    const navigate = useNavigate();
    const [isModalOpen,setIsModalOpen]=useState(false)
    const handleModalToggle=()=>{
        setIsModalOpen((prev)=>!prev)
    }
    useEffect(() => {
        if (id) {
            refreshContext({ expenseViewId: id });
        }
    }, [id, refreshContext]);
    
    return (
        <div>
            <div>
                <div className="flex items-center text-[16px] space-x-2 mb-4">
                    <p onClick={() => navigate('/expense')} className="font-bold cursor-pointer text-[#820000]">
                        Expense
                    </p>
                    <ChevronRight color="#4B5C79" size={18} />
                    <p className="font-bold text-[#303F58]">{expenseViewDetails?.expenseName || "Expense Details"}</p>
                </div>

                {/* Header Section */}
                <header className="flex justify-between items-center border-b pb-4 bg-white p-3 rounded-lg">
                    <h1 className="text-xl font-semibold">{expenseViewDetails?.expenseName || "Expense Details"}</h1>
                </header>

                {/* Expense Slip Section */}
                <div className="bg-gray-100 flex flex-col items-center p-6">
    <div className="w-full max-w-4xl bg-white shadow-md rounded-lg">
        <div className="bg-[#EFEFEF] p-4 shadow-md rounded-md">
            <div className="flex flex-col md:flex-row justify-between mt-5">
                <p className="text-2xl font-semibold">Expense Payslip</p>
                <p className="font-normal text-xs text-[#5E6470] text-right">
                    Cygnoz Innovations Private Limited,<br />
                    NGO Quarters, Kakkanad Kochi, Kerala, India<br />
                    Phone: +91 9544431166<br />
                    Email: notify@cygnoz.com
                </p>
            </div>

            <section className="mt-6">
                <div className="mt-4 bg-gray-50 p-4 rounded-md shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Employee Name</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.addedBy?.userName || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Employee ID</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.addedBy?.employeeId || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Role</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.addedBy?.role || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 my-8 gap-4">
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Expense Name</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.expenseName || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Expense Account</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.expenseAccount || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Category</p>
                            <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.category?.categoryName || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-1">
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Date</p>
                            <p className="text-[#1A1C21] text-xs font-semibold">{expenseViewDetails?.createdAt ? expenseViewDetails.createdAt.split("T")[0].split("-").reverse().join("-") : "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Payment Mode</p>
                            <p className="text-[#1A1C21] text-xs font-semibold">{expenseViewDetails?.paymentMode || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Remark</p>
                            <p className="text-[#5E6470] text-xs font-normal">{expenseViewDetails?.note || "No remarks provided"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#5E6470] font-medium">Amount</p>
                            <p className="text-[#1A1C21] text-xs font-semibold">&#8377; {expenseViewDetails?.amount || "0.00"}</p>
                        </div>
                    </div>

                  
                      <div className="flex justify-end gap-4 mt-4">
                                   <div className="flex flex-col justify-center text-center">
                                        <p className="text-xs text-[#5E6470] font-medium ">Approved By</p>
                                        <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.approvedBy?.userName || "N/A"}</p>
                                       
                                    </div>
                                    <div className="flex flex-col justify-center text-center">
                                    <p className="text-xs text-[#5E6470] font-medium ">Approved Date</p>
                                    <p className="text-xs font-semibold text-[#1A1C21]">{expenseViewDetails?.updatedAt ? expenseViewDetails.updatedAt.split("T")[0].split("-").reverse().join("-") : "N/A"}</p>

                                    </div>
                                   </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <img src={cygnoz} alt="Cygnoz Logo" className="w-28 h-8" />
                </div>
            </section>
        </div>
    </div>
</div>

                {/* Buttons */}
                <div className="flex gap-4 justify-end mb-4">
                    <Button variant="tertiary" size="md" className="h-10 w-32 justify-center" onClick={() => navigate('/expense')}>
                        Cancel
                    </Button>
                    <Button onClick={handleModalToggle} variant="primary" size="md" className="h-10 w-32 justify-center">
                        Pay
                    </Button>
                </div>
            </div>
            <Modal className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"  align="center" open={isModalOpen} onClose={handleModalToggle}>
                <PayModal from="Expense" id={id} onClose={handleModalToggle}/>
                </Modal>
        </div>
    );
};

export default ExpenseViewGranted;
