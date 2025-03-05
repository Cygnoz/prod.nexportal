import React, { useEffect, useMemo, useState } from 'react'
import NextIcon from '../../../assets/icons/NextIcon'
import PreviousIcon from '../../../assets/icons/PreviousIcon'
import Input from '../../../components/form/Input'
import Select from '../../../components/form/Select'
import useApi from '../../../Hooks/useApi'
import { UserLog } from '../../../Interfaces/UserLog'
import { endPoints } from '../../../services/apiEndpoints'
import No_Data_found from "../../../assets/image/NO_DATA.png";
import { useResponse } from '../../../context/ResponseContext'
type Props = {}

function UserLogHome({}: Props) {
  const [sortMethods,setSortMethods]=useState({
    startingDate:new Date().toISOString().split("T")[0],
    endingDate:new Date().toISOString().split("T")[0],
    user:'',
    screen:'',
    action:''
  })
  const {request:getActivityLog}=useApi('get',3002)
  const {loading,setLoading}=useResponse()
  const [allUserLog,setAllUserLog]=useState<UserLog[]>([])

  const getAllActivityLog = async () => {
    try {
      setLoading(true)
      const { response, error } = await getActivityLog(endPoints.GET_ACTIVITY_LOGS);
      console.log("res", response);
      console.log("err", error);
  
      if (response && !error) {
        const logs = response?.data?.logs || [];
        
        const formattedLogs = logs.map((log: any) => {
          // Extract the timestamp and split it into date and time
          const timestamp = log.timestamp;
          const [date, time] = timestamp.split(" "); // Split into date and time
          
          return {
            ...log, // Retain all other properties
            date,    // Date part (27/11/24)
            time     // Time part (15:18:14 (IST))
          };
        });
  
        setAllUserLog(formattedLogs.reverse()); // Set the formatted logs in state
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }finally{
      setLoading(false)
    }
  };

  
  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  useEffect(()=>{
    getAllActivityLog()
  },[])

  const handleSorting = (name: string, value: any) => {
    setCurrentPage(1)
    setSortMethods((prev) => ({ ...prev, [name]: value }));
  };
  
  const filteredLogs = useMemo(() => {
    return allUserLog.filter((log) => {
      // Convert the log date (DD/MM/YY) to a Date object
      const logDateParts: any = log.date.split("/"); // Split the date into [DD, MM, YY]
      const filteredYear: any = `20${logDateParts[2]}`; // Ensure full year format
      const logDate = new Date(filteredYear, logDateParts[1] - 1, logDateParts[0]); // Convert to YYYY-MM-DD format
      logDate.setHours(0, 0, 0, 0); // Normalize time to midnight
  
      // Convert starting and ending dates to Date objects for comparison
      const startingDate = sortMethods.startingDate
        ? new Date(sortMethods.startingDate)
        : null;
      const endingDate = sortMethods.endingDate
        ? new Date(sortMethods.endingDate)
        : null;
  
      if (startingDate) startingDate.setHours(0, 0, 0, 0); // Normalize time
      if (endingDate) endingDate.setHours(0, 0, 0, 0); // Normalize time
  
      let isDateValid = true;
  
      // Handle date comparison for range and single dates
      if (startingDate && endingDate) {
        // Inclusive range: Match logs from starting date to ending date (inclusive)
        isDateValid = logDate >= startingDate && logDate <= endingDate;
      } else if (startingDate) {
        // If only starting date is selected, include logs on or after this date
        isDateValid = logDate >= startingDate;
      } else if (endingDate) {
        // If only ending date is selected, include logs on or before this date
        isDateValid = logDate <= endingDate;
      }
  
      // Filter by user, screen, and action
      const isUserValid = sortMethods.user ? log.userId?.role === sortMethods.user : true;
      const isScreenValid = sortMethods.screen ? log.screen === sortMethods.screen : true;
      const isActionValid = sortMethods.action ? log.action === sortMethods.action : true;
  
      return isDateValid && isUserValid && isScreenValid && isActionValid;
    });
  }, [allUserLog, sortMethods]);
  
  
  
  
  
  
  

  

      const columns: { key: keyof UserLog | string; label: string }[] = [
        { key: "screen", label: "Screen" },
        { key: "action", label: "Action" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "activity", label: "Remarks" },
      ];

      const actionColorMap: { [key: string]: string } = {
        Add: "text-green-500",         // A friendly and energetic green for "Add"
        Edit: "text-yellow-400",       // A softer yellow for "Edit" to avoid harshness
        Delete: "text-red-500",        // A clear red that conveys action but isn't too intense
        Login: "text-blue-600",        // A deeper blue for a professional feel for "Login"
        View: "text-teal-500",         // A soothing teal that aligns with a calm viewing action
        Logout: "text-red-800",       // A neutral gray for "Logout" to signify disconnection
        Convert: "text-emerald-600",   // A vibrant yet fresh emerald green for "Convert"
        Deactivate: "text-orange-500", // A bold but balanced orange for "Deactivate"
        Activate: "text-green-700",    // A darker green to indicate a confident "Activate" action
      };
      
      

      const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

     // Paginate the filtered data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };




  const actionList = [
    { label: 'Add', value: "Add" },
    { label: "Edit", value: "Edit" },
    { label: "Login", value: "Login" },
    { label: "View", value: "View" },
    { label: "Logout", value: "Logout" },
    { label: "Convert", value: "Convert" },
    { label: "Deactivate", value: "Deactivate" },
    { label: "Delete", value: "Delete" },
    { label: "Activate", value: "Activate" },
  ];

  const screenList = [
    { label: 'Lead', value: 'Lead' },
    { label: 'Support', value: 'Support' },
    { label: 'Licenser', value: 'Licenser' },
    { label: 'Area', value: 'Area' },
    { label: 'Login', value: 'Login' },
    { label: 'Logout', value: 'Logout' },
    { label: 'User', value: 'User' },
    { label: 'Region', value: 'Region' },
    { label: 'Ticket', value: 'Ticket' },
    { label: 'Payroll', value: 'Payroll' },
    { label: 'Prise', value: 'Prise' },
    { label: 'Area Manager', value: 'Area Manager' },
    { label: 'Commission', value: 'Commission' },
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Support Agent', value: 'Support Agent' },
    { label: 'Region Manager', value: 'Region Manager' },
    { label: 'BDA', value: 'BDA' },
    { label: 'Sales Admin', value: 'Sales Admin' },
    { label: 'Support Admin', value: 'Support Admin' },
  ];
  

  const usersList = [
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Sales Admin', value: 'Sales Admin' },
    { label: 'Support Admin', value: 'Support Admin' },
    { label: 'Region Manager', value: 'Region Manager' },
    { label: 'Area Manager', value: 'Area Manager' },
    { label: 'BDA', value: 'BDA' },
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Support Agent', value: 'Support Agent' }
  ];

  const renderSkeletonLoader = () => (
    <tr>
      <td colSpan={columns.length + 2}>
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-2 animate-pulse">
              {columns.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-6 w-full bg-gray-200 rounded-lg skeleton"
                ></div>
              ))}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
 
   
  
    
    

  return (
    <div className="text-[#303F58] space-y-4">
    <div>
         <h1 className="text-[#303F58] text-xl font-bold">User Log</h1>
          <p className="text-ashGray text-sm">
          Track and review user activity within the system. 
            </p>
         </div><div className="w-full bg-white rounded-lg p-4">
       <div  className='flex  items-center gap-2'>
       

<div className='grid grid-cols-5 items-center w-full gap-2 mb-4'>
  <div>
    <div className='mb-1 text-xs flex justify-between'>
    <p className='  text-blue-400'>Starting Date</p>
    {sortMethods?.startingDate.length>0&&<button onClick={()=>setSortMethods((prev)=>({...prev,startingDate:''}))} className='px-2 rounded-md bg-red-600  text-white'>Clear</button>}
    </div>
    <Input
      placeholder="Select from date"
      type='date'
      value={sortMethods.startingDate}
      onChange={(e) => handleSorting('startingDate', e.target.value)}
    />
  {/* <DatePicker
  selected={sortMethods.startingDate}
  onChange={(date:any) => handleSorting("startingDate", date)}
  dateFormat="dd-MM-yyyy"
/>; */}

  </div>
  
  <div>
  <div className='mb-1 text-xs flex justify-between'>
    <p className='  text-blue-400'>Ending Date</p>
    {sortMethods?.endingDate.length>0&&<button onClick={()=>setSortMethods((prev)=>({...prev,endingDate:''}))} className='px-2 rounded-md bg-red-600  text-white'>Clear</button>}
    </div>
    <Input
      placeholder="Select end date"
      type='date'
      value={sortMethods.endingDate}
      onChange={(e) => handleSorting('endingDate', e.target.value)}
    />
  </div>

  <div className='mt-5'>
    <Select
      value={sortMethods.user}
      onChange={(selectedValue) => handleSorting('user',selectedValue)}
      placeholder="Select User"
      options={usersList}
    />
  </div>

  <div className='mt-5'>
    <Select
      value={sortMethods.screen}
      onChange={(selectedValue) => handleSorting('screen', selectedValue)}
      placeholder="Select Screen"
      options={screenList}
    />
  </div>

  <div className='mt-5'>
    <Select
      value={sortMethods.action}
      onChange={(selectedValue) => handleSorting('action', selectedValue)}
      placeholder="Select Action"
      options={actionList}
    />
  </div>
</div>
        
        {/* <div className='p-[10px] rounded-lg flex justify-center items-center border  -mt-4'>
           <p><SearchIcon className="size-4 text-gray-200"/></p>
        </div> */}
       </div>
    
      <table className="w-full border-collapse border text-left">
        <thead>
          <tr>
            <th className="border p-4 bg-[#F6F9FC] text-sm text-center text-[#303F58] font-medium">
              SI No.
            </th>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="border p-4 bg-[#F6F9FC] text-sm text-center text-[#303F58] font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
  { loading ? (
              renderSkeletonLoader()
            ):filteredLogs?.length === 0 ?(
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center py-4 text-gray-500"
                >
                  <div className="flex justify-center flex-col items-center">
                    <img width={70} src={No_Data_found} alt="No Data Found" />
                    <p className="font-bold text-red-700">No Records Found!</p>
                  </div>
                </td>
              </tr>
            )
  :paginatedData.length > 0 ? (
    paginatedData.map((row, rowIndex) => (
      <tr key={rowIndex} className="hover:bg-gray-50">
        {/* Update SI No based on currentPage and rowsPerPage */}
        <td className="border-b border-gray-300 p-4 text-xs gap-2 text-[#4B5C79] font-medium bg-[#FFFFFF] text-center">
          { (currentPage - 1) * rowsPerPage + rowIndex + 1 }
        </td>
        {columns.map((col) => (
          <td
            key={String(col.key)}
            className="border border-gray-300 p-4 text-xs text-[#4B5C79] font-medium bg-[#FFFFFF] text-center"
          >
            <div className="flex justify-center">
              <p>
                {/* Accessing the value using getNestedValue if col.key is a string */}
                {typeof col.key === 'string' ? (
                  // Check if the key is "action" and apply color
                  col.key === 'action' ? (
                    <span className={actionColorMap[row[col.key]] || ""}>
                      {row[col.key]}
                    </span>
                  ) : (
                    getNestedValue(row, col.key)
                  )
                ) : (
                  row[col.key]
                )}
              </p>
            </div>
          </td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={columns.length + 2}
        className="text-center py-4 text-gray-500"
      >
        No results found.
      </td>
    </tr>
  )}
</tbody>

      </table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-[#71736B] font-medium flex gap-2">
          Showing {currentPage} of {totalPages || 1}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <PreviousIcon size={20} color="#71736B" />
            </button>
            <button className="border text-[#FFFFFF] bg-[#97998E] px-2 py-1">
              {currentPage}
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <NextIcon size={20} color="#71736B" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center text-[#71736B] font-medium text-xs">
          Rows per page
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded-md p-1 text-sm"
          >
            {[5, 10, 20, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
    </div>
  )
}

export default UserLogHome