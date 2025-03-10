import { useEffect, useState } from "react";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { months, years } from "../../../components/list/MonthYearList";
import TargetInfoModal from "../../../components/modal/TargetInfoModal";
import Modal from "../../../components/modal/Modal";
import { useUser } from "../../../context/UserContext";
import CheckIcon from "../../../assets/icons/CheckIcon";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi"; // Import NoRecords component

type Props = {};

const ProgressBar = ({}: Props) => {
  const { request: AllTarget } = useApi("get", 3004);
  const { user } = useUser();

  // State for storing API response
  const [chartData, setChartData] = useState({
    achievedTarget: 0,
    balanceTarget: 0,
    totalTarget: 0,
    percentage: 0,
  });

  console.log("sdfefe",chartData);
  

  // Get current month and year
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth = months.find((m) => m.value === currentMonthValue) || months[0];

  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(years[0]);
  // Format selected date as "YYYY-MM"
  const [selectedData, setSelectedData] = useState<string>(
    `${selectedYear.value}-${String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, '0')}`
  );
  useEffect(() => {
    // Convert month name to number (1-12) and ensure it's two digits
    setSelectedData(`${selectedYear.value}-${selectedMonth?.value}`);
  }, [selectedMonth, selectedYear]);

  const [isModalOpen, setIsModalOpen] = useState({ addInfo: false });

  // Calculate percentage dynamically
  const percentage = chartData.totalTarget ? (chartData.achievedTarget / chartData.totalTarget) * 100 : 0;

  // API Call to fetch target data
  const getTargets = async () => {
    try {
      const endPoint = `${endPoints.TARGET_ACHEIVED}/?month=${selectedData}`;
      console.log('endpoint',endPoint);
      
      const { response, error } = await AllTarget(endPoint);
      console.log("res",response?.data);
      console.log("err",response?.data);
      
      if (response && !error) {
        const { totalTarget, achievedTargets, balanceTarget } = response.data;

        setChartData({
          achievedTarget: achievedTargets,
          balanceTarget: balanceTarget,
          totalTarget: totalTarget,
          percentage: totalTarget > 0 ? (achievedTargets / totalTarget) * 100 : 0,
        });
      } else {
        console.error("Error:", error?.data || "Unknown error occurred");
        setChartData({
          achievedTarget: 0,
          balanceTarget: 0,
          totalTarget: 0,
          percentage: 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedData) {
      getTargets();
    }
  }, [selectedData]);

  return (
    <div className="p-6 mx-auto max-w-8xl bg-white rounded-lg w-full">
      <div className="p-2 flex justify-between">
        <h1 className="text-lg font-bold -mt-4">Target</h1>
        <div className="flex gap-4">
          {user?.role !== 'BDA' && (
            <h1
              onClick={() => setIsModalOpen({ addInfo: true })}
              className="mt-1 underline cursor-pointer text-red-600"
            >
              View Target Info
            </h1>
          )}
          <SelectDropdown setSelectedValue={setSelectedMonth}   selectedValue={selectedMonth} filteredData={months} searchPlaceholder="Search Months" width="w-44" />
          <SelectDropdown setSelectedValue={setSelectedYear}   selectedValue={selectedYear} filteredData={years} searchPlaceholder="Search Year" width="w-44" />

        </div>
      </div>

      <div className='flex -mt-6 ms-2'>
  <h1>{new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</h1>
</div>

      {/* Show NoRecords if no target data */}
      
        <>
          <div className="text-end">
            <h1 className="text-[#B7B7B7] text-xl font-medium">Goal: {chartData.totalTarget} Target</h1>
          </div>

          <div className="mb-4 flex justify-between items-center mt-8">
            <span className="text-gray-600 text-base font-medium">Achieved</span>
            <span className="text-green-600 font-bold">{chartData.achievedTarget} License</span>
          </div>

          <h1 className="text-3xl font-medium text-[#22593F]">{percentage.toFixed(2)}%</h1>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-4">
            <div
              className="absolute top-0 left-0 bg-[#22593F] h-4 rounded-full"
              style={{ width: `${percentage.toFixed(2)}%` }}
            ></div>

            {/* Floating Info Box */}
            <div
              className="absolute top-[-135px] bg-[#FAFAFA] border shadow-md rounded text-center p-3 -ms-16 transform translate-x-1/2"
              style={{ left: `calc(${percentage}% - 20px)` }}
            >
              <p className="text-xs font-normal">Achieved Target</p>
              <p className="text-base font-extrabold text-[#54B86D]">{chartData.achievedTarget} Target</p>
              <div className="flex bg-white p-3">
                <p className="text-xs font-normal">Balance</p>
                <p className="text-xs font-semibold text-[#9B3230]">{chartData.balanceTarget} Target</p>
              </div>
            </div>
          </div>

          {/* Tick Marks */}
          <div className="flex justify-between mt-2 text-sm text-gray-500 w-full relative">
            {[0, 10, 30, 60, 100].map((value) => (
              <div key={value} className="relative flex flex-col items-center -mt-12">
                {value !== 0 && <CheckIcon />}
                <div className="mt-10">
                  <span>{value}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-end text-gray-700 font-medium">
            Great progress! You’re {chartData.balanceTarget} Targets away from your goal.
          </p>
        </>
      

      <Modal open={isModalOpen.addInfo} onClose={() => setIsModalOpen({ addInfo: false })} className="w-[40%] h-[700px]" >
        <TargetInfoModal onClose={() => setIsModalOpen({ addInfo: false })} />
      </Modal>
    </div>
  );
};

export default ProgressBar;
