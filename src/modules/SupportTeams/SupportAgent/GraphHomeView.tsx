import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
// import profileImage from '../../../assets/image/AvatarImg.png';
import { months, years } from '../../../components/list/MonthYearList';
import NoRecords from '../../../components/ui/NoRecords';
import RatingStar from '../../../components/ui/RatingStar';
import SelectDropdown from '../../../components/ui/SelectDropdown';
import useApi from '../../../Hooks/useApi';
import { endPoints } from '../../../services/apiEndpoints';
import UserIcon from '../../../assets/icons/UserIcon';
import No_Data_found from '../../../assets/image/NO_DATA.png'

type Props = {
  id: any
  getData: any
}

const GraphHomeView = ({ id, getData }: Props) => {
  // const iId=id?id:id
  const { request: getTicketOvertime } = useApi('get', 3003);
  const { request: getFeedback } = useApi('get', 3004);

  const [chartData, setChartData] = useState([]);
  const [feedData, setFeedData] = useState<any>([])
  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);
  const [newMonthList, setNewMonthList] = useState<any>([]);

  const [selectedData, setSelectedData] = useState<string>("");

  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    const monthIndex = String(months.findIndex((m) => m.value === selectedMonth.value) + 1).padStart(2, "0");
    setSelectedData(`${selectedYear.value}-${monthIndex}`);
  }, [selectedMonth, selectedYear]);


  const getOvertime = async () => {
    try {
      const endPoint = `${endPoints.GET_TICKETS}/overtime/${id}?date=${selectedData}`;


      const { response, error } = await getTicketOvertime(endPoint);
      //console.log('API Response:', response);

      if (response && !error) {
        //console.log(endPoint);
        // Transform data to match chart format
        const transformedData = response.data.ticketsOverTime.map((item: any) => ({

          name: item.date, // X-axis label
          count: item.ticketCount, // Y-axis value
        }));

        setChartData(transformedData);
      } else {
        console.log(error.response.data.message);
        // setChartData([]); // Reset if error
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Call API whenever selectedMonth or selectedYear changes
  useEffect(() => {
    getOvertime();
  }, [selectedData]);


  const getfeedback = async () => {
    try {
      const endPoint = `${endPoints.FEEDBACK}/${getData?.saData?.user?._id}`;
      const { response, error } = await getFeedback(endPoint);
      console.log('API Response:', response);
      if (response && !error) {
        //console.log(endPoint);
        console.log(response.data);
        setFeedData(response.data)
      } else {
        console.log(error.response.data.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };


  // Call API whenever selectedMonth or selectedYear changes
  useEffect(() => {
    if (getData?.saData?.user?._id) {
      getfeedback();
    }
  }, [getData?.saData?.user?._id]);



  return (
    <div>
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-9">
          <div className="py-1 bg-white mt-2 rounded-lg">
            <div className="py-1 ms-2 flex justify-between mt-3 px-4 gap-4 m-2">
              <h2 className='font-bold'>Tickets OverTime</h2>
              <div className="flex gap-1">
                <SelectDropdown
                  setSelectedValue={setSelectedMonth}
                  selectedValue={selectedMonth}
                  filteredData={newMonthList}
                  searchPlaceholder="Search Month"
                  width="w-44"
                />
                <SelectDropdown
                  setSelectedValue={setSelectedYear}
                  selectedValue={selectedYear}
                  filteredData={years}
                  searchPlaceholder="Search Year"
                  width="w-44"
                />
              </div>
            </div>

            <div className="mt-3 p-2 gap-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" minHeight={400}>
                  <LineChart
                    width={900}
                    height={450}
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#e2b0ff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoRecords imgSize={70} textSize="md" parentHeight="380px" />
              )}
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="p-3 bg-[#FFFFFF] gap-4 mt-2 rounded-lg">
            <p className="text-[#303F58] font-semibold text-base">Customer Feedback</p>

            {feedData?.feedbacks?.length > 0 ? (
              feedData.feedbacks.map((feedback: any) => (
                <div key={feedback._id} className="bg-[#F5F9FC] p-4 gap-3 w-full h-fit rounded-lg my-4">
                  <div className="flex justify-between">
                    <p className="mb-2 text-[#303F58] font-bold text-xs">
                      {feedback.ticketId?.subject || "No Subject"}
                    </p>
                    <p className="mb-2 text-[#303F58] font-bold text-xs">{feedback.ticketId?.ticketId || "N/A"}</p>
                  </div>

                  <div className="flex gap-4 mb-2 items-center">
                    <div className="rounded-full w-7 h-7 overflow-hidden">
                      {/* <img src={feedback.customerId?.image || "default-avatar.png"} alt="User" /> */}
                      {feedback.customerId?.image ? (
                        <img
                          className="w-8 h-8 rounded-full"
                          src={feedback.customerId?.image}
                          alt="User"
                        />
                      ) : (
                        <p className="w-8 h-8 bg-black rounded-full flex justify-center items-center">
                          <UserIcon color="white" size={18} />
                        </p>
                      )}
                    </div>
                    <p className="text-[#303F58] text-xs font-medium">
                      {feedback.customerId?.firstName || "Anonymous"}
                    </p>
                    <RatingStar size={16} count={Number(feedback.starCount) || 0} />
                  </div>

                  <p className="text-[#4B5C79] font-normal text-xs">
                    {feedback.feedback || "No feedback provided."}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex justify-center flex-col items-center h-full">
                <img width={70} src={No_Data_found} alt="No Data Found" />
                <p className="font-bold text-red-700">No Achievements Found!</p>
              </div>
            )}
          </div>
        </div>


      </div>

    </div>
  )
}

export default GraphHomeView