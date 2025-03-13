import { useNavigate, useParams } from "react-router-dom";
import ChevronRight from "../../../../assets/icons/ChevronRight";
// import EmailIcon from "../../../../assets/icons/EmailIcon";
// import VectorIcon from "../../../../assets/icons/VectorIcon";
import cygnoz from "../../../../assets/image/cygnozzzz.png";
import Button from "../../../../components/ui/Button";
import { useRegularApi } from "../../../../context/ApiContext";
import { useEffect, useState } from "react";
import Modal from "../../../../components/modal/Modal";
import PayModal from "../../Modal/PayModal";

type Props = {};

const PayrollApproved = ({}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { refreshContext, payrollViewDetails } = useRegularApi();
  useEffect(() => {
    if (id) {
      refreshContext({ payrollViewId: id });
    }
  }, [id, refreshContext]);
  const [isModalOpen,setIsModalOpen]=useState(false)
      const handleModalToggle=()=>{
          setIsModalOpen((prev)=>!prev)
      }
  return (
    <div>
      <div>
        <div>
          <div className="flex items-center text-[16px] space-x-2 mb-4">
            <p
              onClick={() => navigate("/payroll")}
              className="font-bold cursor-pointer text-[#820000]"
            >
              Payroll
            </p>
            <ChevronRight color="#4B5C79" size={18} />
            <p className="font-bold text-[#303F58]">
              {" "}
              {payrollViewDetails?.payRollId || "N/A"}
            </p>
          </div>
          {/* Header Section */}
          <header className="flex justify-between items-center border-b pb-4 bg-white p-3 rounded-lg">
            <h1 className="text-xl font-semibold">
              {" "}
              {payrollViewDetails?.payRollId || "N/A"}
            </h1>
            {/* <div className="flex gap-2">
              <button className="border px-4 py-2 rounded-md bg-[#FEFDFA] flex items-center">
                <span className="p-1">
                  <EmailIcon size={16} />
                </span>
                Send Mail
              </button>
              <button className="border px-4 py-2 rounded-md bg-[#FEFDFA] flex items-center">
                <span className="p-1">
                  <VectorIcon size={16} />
                </span>
                Print
              </button>
            </div> */}
          </header>
        </div>

        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
          <div className="w-full max-w-4xl bg-white shadow-md rounded-lg">
            <div className="bg-[#EFEFEF] p-4  shadow-md rounded-md">
              <div className="flex justify-between mt-5">
                <p className="text-2xl font-semibold">Salary Pay Slip</p>
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
                  <div className="mt-4 bg-gray-50 p-4 rounded-md shadow-sm">
                    <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3">

                        <div>
                          <p className="text-xs font-medium">Employee Name</p>
                          <p className="text-xs font-semibold">
                            {payrollViewDetails?.staffId?.user?.userName ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Employee ID</p>
                          <p className="text-xs font-semibold">
                            {payrollViewDetails?.staffId?.user?.employeeId ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Payslip ID</p>
                          <p className="text-xs font-semibold">
                            {payrollViewDetails?.payRollId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Role</p>
                          <p className="text-xs font-semibold">
                            {payrollViewDetails?.staffId?.user?.role || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Generated Date</p>
                          <p className="text-xs font-semibold">
                            {" "}
                            {payrollViewDetails?.updatedAt
                              ? payrollViewDetails?.updatedAt
                                  .split("T")[0]
                                  .split("-")
                                  .reverse()
                                  .join("-")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Generated By</p>
                          <p className="text-xs font-semibold">
                            {payrollViewDetails?.generatedBy?.userName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-14 rounded-md">
                        <table className="w-full text-left">
                          <thead className="">
                            <tr className="border-t">
                              <th className="p-3 text-xs font-semibold text-[#5E6470]">
                                Detail
                              </th>
                              <th className="p-3 text-xs font-semibold text-[#5E6470] text-right">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="border-t">
                            {[
                              {
                                name: "Basic Salary",
                                amount: `₹${payrollViewDetails?.basicSalary}`,
                              },
                              {
                                name: "New License Earning",
                                amount: `₹${payrollViewDetails?.newLicenseEarnings}`,
                              },
                              {
                                name: "Recurring Amount",
                                amount: `₹${payrollViewDetails?.recuringAmount}`,
                              },
                              {
                                name: "Travel Allowance",
                                amount: `₹${payrollViewDetails?.TravelAllowance}`,
                              },
                            ].map((item, index) => (
                              <tr key={index} className="">
                                <td className="p-3 my-6 text-xs font-semibold">
                                  {item.name}
                                </td>
                                <td className="p-3 my-6 text-xs font-medium text-right">
                                  {item.amount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="border-t mt-9"></p>
                        <div className="mt-10 flex justify-between sm:justify-end gap-3 text-md font-bold my-5">
                        <p className="p-3 ">Total</p>
                        <p className="p-3">₹{payrollViewDetails?.totalSalary}</p>
                        </div>
                        <p className="border-t mt-10"></p>
                       {payrollViewDetails?.comments&& <div className="p-5">
                          <h3 className="text-xs font-semibold">Remarks</h3>
                          <p className="mt-2 text-xs font-medium">
                            {payrollViewDetails?.comments}
                          </p>
                        </div>}
                        <div className="flex justify-end items-center mt-14 gap-8">
                        <div className="flex gap-2 justify-center flex-col ">
                          <p className="text-xs text-[#5E6470] font-medium">
                            Approved by
                          </p>
                          <p className="text-xs font-semibold text-[#1A1C21]">
                            {payrollViewDetails?.approvedBy?.userName ||'N/A'}
                          </p>
                          
                        </div>
                        <div className="flex gap-2 justify-center flex-col my-1">
                        <p className="text-xs text-[#5E6470] font-medium">
                            Approved Date
                          </p>
                          <p className="text-xs font-semibold text-[#1A1C21]">
                          {payrollViewDetails?.updatedAt
                              ? payrollViewDetails?.updatedAt
                                  .split("T")[0]
                                  .split("-")
                                  .reverse()
                                  .join("-")
                              : "N/A"}
                          </p>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <img
                      src={cygnoz}
                      alt="Cygnoz Logo"
                      className="w-auto h-auto"
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-end mb-4">
          <Button
            onClick={() => navigate("/payroll")}
            variant="tertiary"
            size="md"
            className="h-10 w-32 justify-center"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="h-10 w-32 justify-center"
            onClick={handleModalToggle}
          >
            Pay
          </Button>
        </div>
      </div>
      <Modal         className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" 
 align="center" open={isModalOpen} onClose={handleModalToggle}>
                <PayModal from="Payroll" id={id} onClose={handleModalToggle}/>
      </Modal>
    </div>
  );
};

export default PayrollApproved;
