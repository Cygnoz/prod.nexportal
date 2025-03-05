import { useNavigate, useParams } from "react-router-dom"
import ChevronRight from "../../../../assets/icons/ChevronRight"
import EmailIcon from "../../../../assets/icons/EmailIcon"
import VectorIcon from "../../../../assets/icons/VectorIcon"
import cygnoz from "../../../../assets/image/cygnozzzz.png";
import React, { useEffect } from "react";
import { useRegularApi } from "../../../../context/ApiContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
type Props = {}

const ExpenseViewPaid = ({ }: Props) => {
    const { id } = useParams();
        const { refreshContext, expenseViewDetails } = useRegularApi();
        const navigate = useNavigate();
    
        useEffect(() => {
            if (id) {
                refreshContext({ expenseViewId: id });
            }
        }, [id, refreshContext]);
        const printRef = React.useRef(null)

        const handleDownload = async () => {
          const content = printRef.current;
          if (!content) return;
      
          // Reduce scale for smaller size but clear image
          const canvas = await html2canvas(content, { scale: 10 });
          
          // Use JPEG format with compression to reduce size
          const data = canvas.toDataURL("image/jpeg", 0.8);
      
          const pdf = new jsPDF({
              orientation: "portrait",
              unit: "px",
              format: "a4"
          });
      
          // Auto-scale image based on page width
          const pageWidth = pdf.internal.pageSize.getWidth();
          const imgProps = pdf.getImageProperties(data);
          const pdfWidth = pageWidth - 40; // Leave some margin
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          const xPos = (pageWidth - pdfWidth) / 2; // Center horizontally
          const yPos = 20; // Position it near the top
      
          pdf.addImage(data, "JPEG", xPos, yPos, pdfWidth, pdfHeight);
          pdf.save("Expense_PaySlip.pdf");
      };
    return (
        <div>
            <div>
                <div>
                    <div className="flex items-center text-[16px] space-x-2 mb-4">
                        <p onClick={() => navigate('/expense')} className="font-bold cursor-pointer text-[#820000]">Expense</p>
                        <ChevronRight color="#4B5C79" size={18} />
                        <p className="font-bold text-[#303F58]">{expenseViewDetails?.expenseName || "Expense Details"}</p>
                    </div>
                    {/* Header Section */}
                    <header className="flex justify-between items-center border-b pb-4 bg-white p-3 rounded-lg">
                    <h1 className="text-xl font-semibold">{expenseViewDetails?.expenseName || "Expense Details"}</h1>
                        <div className="flex gap-2">
                            <button className="border px-4 py-2 rounded-md bg-[#FEFDFA] flex items-center">
                                <span className="p-1">
                                    <EmailIcon size={16} />
                                </span>
                                Send Mail
                            </button>
                            <button onClick={handleDownload} className="border px-4 py-2 rounded-md bg-[#FEFDFA] flex items-center">
                                <span className="p-1">
                                    <VectorIcon size={16} />
                                </span>
                                Print
                            </button>
                        </div>
                    </header>


                </div>

                <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
                    <div className="w-full max-w-4xl bg-white shadow-md rounded-lg">
                        <div ref={printRef} className="bg-[#EFEFEF] p-4  shadow-md rounded-md">
                            <div className="flex justify-between mt-5">
                                <p className="text-2xl font-semibold">Expense Payslip</p>
                                <p className="font-normal text-xs text-[#5E6470] text-right">
                                    CygnoNex Innovations Private Limited,
                                    <br />
                                    NGO Quarters, Kakkanad Kochi, Kerala, India
                                    <br />
                                    Phone: +91 9544431166
                                    <br />
                                    Email: notify@cygnonex.com
                                </p>
                            </div>
                            <div>
                            <section className="mt-6">
                                <div className="mt-4 bg-gray-50  p-4 rounded-md shadow-sm">
                                    {/* Expense Details */}
                                    <div className="grid grid-cols-5 gap-4">
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

                                    {/* Expense Type and Category */}
                                    <div className="grid grid-cols-5 my-8 gap-4">
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

                                  
                                    

                                    {/* Amount & Payment Details */}
                                    <div className="grid grid-cols-4 mb-1">
                                    <p className="text-xs text-[#5E6470] font-medium">Date</p>
                                        <p className="text-xs text-[#5E6470] font-medium">Payment Mode</p>
                                        <p className="text-xs text-[#5E6470] font-medium">Remark</p>
                                        <p className="text-xs text-[#5E6470] font-medium">Amount</p>
                                    </div>
                                    <hr />
                                    <div className="grid grid-cols-4 mt-1">
                                    <p className="text-[#1A1C21] text-xs font-semibold">{expenseViewDetails?.createdAt
                                                    ? expenseViewDetails.createdAt.split("T")[0].split("-").reverse().join("-")
                                                    : "N/A"}</p>
                                       
                                        <p className="text-[#1A1C21] text-xs font-semibold">{expenseViewDetails?.paymentMode || "N/A"}</p>
                                        <p className="text-[#5E6470] text-xs font-normal">{expenseViewDetails?.note || "No remarks provided"}</p>
                                        <p className="text-[#1A1C21] text-xs font-semibold">&#8377; {expenseViewDetails?.amount || "0.00"}</p>
                                    </div>

                                    {/* Approval Section */}
                                   <div className="flex justify-end gap-4 mt-4">
                                   <div className="flex flex-col justify-center text-center">
                                        <p className="text-xs text-[#5E6470] font-medium ">Approved By</p>
                                        <p className="text-xs font-semibold text-[#1A1C21] ">{expenseViewDetails?.approvedBy?.userName || "N/A"}</p>
                                       
                                    </div>
                                    <div className="flex flex-col justify-center text-center">
                                    <p className="text-xs text-[#5E6470] font-medium ">Approved Date</p>
                                        <p className="text-xs font-semibold text-[#1A1C21] ">{expenseViewDetails?.updatedAt
                                                    ? expenseViewDetails.updatedAt.split("T")[0].split("-").reverse().join("-")
                                                    : "N/A"}</p>
                                    </div>
                                   </div>
                                </div>

                                {/* Logo */}
                                <div className="mt-6 flex justify-center">
                                    <img src={cygnoz} alt="Cygnoz Logo" className="w-28 h-8" />
                                </div>
                            </section>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default ExpenseViewPaid