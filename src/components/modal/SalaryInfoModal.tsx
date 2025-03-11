import React from 'react';
import PayrollTable from '../../modules/Expense/Payroll/PayrollTable';


interface Props {
  onClose: () => void;
  salaryDetails: any;
}

const SalaryInfoModal: React.FC<Props> = ({ onClose, salaryDetails }) => {
 // console.log(salaryDetails);
  
  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'payRollStatus', label: 'Payslip Status' },
    { key: 'totalSalary', label: 'Total Salary' },
  ];

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <div className="px-2">
          <h1 className="font-bold text-sm">Salary Information</h1>
          <p className="text-xs mt-2 font-normal text-[#8F99A9]">
            Growth is the only constant, let's chase it together
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>
      </div>
      <div className="flex flex-wrap justify-between p-2 border rounded-lg bg-gray-100 mt-3">
  <div className="w-full sm:w-auto mb-2 sm:mb-0">
    <p className="text-[#8F99A9] text-xs font-medium">Salary Amount</p>
    <p className="font-bold text-xs text-[#303F58]">₹ {salaryDetails?.basicSalary || "0"}</p>
  </div>
  <div className="w-full sm:w-auto mb-2 sm:mb-0">
    <p className="text-[#8F99A9] text-xs font-medium">No of License</p>
    <p className="font-bold text-xs text-[#303F58]">{salaryDetails?.licenserCount || "0"}</p>
  </div>
  <div className="w-full sm:w-auto">
    <p className="text-[#8F99A9] text-xs font-medium">No of Recurring Licenses</p>
    <p className="font-bold text-xs text-[#303F58]">{salaryDetails?.totalRenewalCount || "0"}</p>
  </div>
</div>

      <div className="mt-2">
        <PayrollTable 
        data={salaryDetails.payrollRecords} 
        columns={columns} 
        noAction />


      {/* <div className="mt-4 flex justify-between">
        <h2 className="text-sm font-bold mt-2 ms-2">Activity Timeline</h2>
        <div className="relative">
          <SearchBar
            placeholder="Search Category"
            searchValue=""
            onSearchChange={() => { setSearch }}
          />
        </div>
      </div> */}


      {/* <div className="mt-4 pl-2 space-y-6 relative">
        <div className="absolute left-7 top-0 bottom-0 w-1 bg-gray-200"></div>
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-lg z-10 ${activity.type === "salary" ? "bg-[#A7D2EF]" : "bg-[#A7EFAC]"
                    }`}
                >
                  {activity.type === "salary" ? <CoinsIcon size={24} /> : <ClockIcon size={22} />}
                </div>
                <p className="font-semibold text-xs text-[#303F58]">{activity.title}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <p className="font-semibold text-xs text-[#303F58]">{activity.date}, {activity.time}</p>
                <button onClick={() => setExpanded(expanded === activity.id ? null : activity.id)}>
                  <ChevronDown color="#303F58" />
                </button>
              </div>
            </div>

            {expanded === activity.id && (
              <div className="mt-4 ml-2 p-3 bg-red-100 font-semibold text-xs text-[#303F58] rounded-lg w-full">
                {activity.details}
              </div>
            )}
          </div>
        ))}
      </div> */}
    </div>
    </div>
  );
};

export default SalaryInfoModal;
