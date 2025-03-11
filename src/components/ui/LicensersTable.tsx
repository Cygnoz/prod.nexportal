import React, { useMemo, useState } from "react";
import NextIcon from "../../assets/icons/NextIcon";
import PreviousIcon from "../../assets/icons/PreviousIcon";
import UserIcon from "../../assets/icons/UserIcon";
import Button from "./Button";
import NoRecords from "./NoRecords";
import SearchBar from "./SearchBar";

const ImageAndLabel = [
  { key: "userName", imageKey: "userImage" },
  { key: "user.userName", imageKey: "user.userImage" },
  { key: "leadName", imageKey: "image" },
  { key: "firstName", imageKey: "image" },
];

interface TableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  headerContents: {
    title?: string;
    search?: { placeholder: string };
  };
  maxHeight?: string;
  handleView:(id:any)=>void 
  skeltonCount?:number;
  loading?:boolean;
}
const LicensersTable = <T extends object>({
  data,
  columns,
  headerContents,
  maxHeight,
  skeltonCount=5,
  loading,
  handleView
}: TableProps<T>) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  // const [noDataFound, setNoDataFound] = useState(false);
  // Filter data based on the search value
  const filteredData = useMemo(() => {
    return data?.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [data, searchValue]);


  

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData?.reverse().slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData?.length / rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Function to determine row styles based on `status`
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "New":
        return "bg-blue-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Contacted":
        return "bg-cyan-800 text-center text-white py-1 px-2 rounded-lg";
      case "In progress":
        return "bg-yellow-100 text-center text-black py-1 px-2 rounded-lg";
      case "In Progress":
        return "bg-yellow-100 text-center text-black py-1 px-2 rounded-lg";
      case "Proposal":
        return "bg-violet-300 text-center text-black py-1 px-2 rounded-lg";
      case "Lost":
        return "bg-red-500 text-center text-white py-1 px-2 rounded-lg";
      case "Closed":
        return "bg-gray-400 text-center text-white py-1 px-2 rounded-lg";
      case "Active":
        return "bg-green-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Converted":
        return "bg-purple-500 text-center text-white py-1 px-2 rounded-lg";
      case "Expired":
        return "bg-red-500 text-center text-white py-1 px-2 rounded-lg";
      case "Not Started":
        return "bg-orange-400 text-center text-white py-1 px-2 rounded-lg";
      case "Extended":
        return "bg-violet-500 text-center text-white py-1 px-2 rounded-lg";
      case "Pending Renewal":
        return "bg-orange-400 text-center text-white py-1 px-2 rounded-lg";
      case "Open":
        return "bg-green-400 text-center text-white py-1 px-2 rounded-lg";
      case "Pending":
        return "bg-yellow-400 text-center text-black py-1 px-2 rounded-lg";
      case "High":
        return "bg-red-500 text-center text-white py-1 px-2 w-fit rounded-lg";
      case "Medium":
        return "bg-orange-300 text-center text-white py-1 px-2 rounded-lg";
      case "Low":
        return "bg-green-300 text-center text-white py-1 px-2 rounded-lg";
      case "Won":
        return "bg-green-500 text-center text-white  py-1 px-2 w-fit rounded-lg";
      case "Resolved":
        return "bg-green-200 text-center text-black py-1 px-2 rounded-lg";
      case "Paid":
        return "bg-purple-200 text-center text-black py-1 px-2 rounded-lg";
      default:
        return "";
    }
  };

  function getNestedValue(obj: any, path: string): any {
    // If no dots in path, return the direct property value
    if (!path.includes(".")) {
      return obj?.[path];
    }
    // Otherwise, traverse the nested structure
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

 

  // Render table header
  const renderHeader = () => (
    <div
      className={`flex  ${headerContents.search && !headerContents.title
        ? "justify-start"
        : "justify-between"
        } items-center mb-4`}
    >
      {headerContents.title && (
        <h2 className="text-lg font-bold">{headerContents.title}</h2>
      )}
      {headerContents.search && (
        <div className={`w-[440px] ${headerContents.title && "ms-auto me-2"}`}>
          <SearchBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder={headerContents.search.placeholder}
          />
        </div>
      )}
    </div>
  );

  const renderImageAndLabel = (data: any) => {
    for (const { key, imageKey } of ImageAndLabel) {
      const keyValue = getNestedValue(data, key);
      const imageValue = getNestedValue(data, imageKey);
      if (keyValue) {
        if (imageValue && imageValue.length > 500) {
          return (
            <>
              <img
                src={`${imageValue}`}
                alt={keyValue}
                className="w-6 h-6 rounded-full bg"
              />
              <p>{keyValue}</p>
            </>
          );
        } else {
          return (
            <>
              <p className="w-6 h-6  bg-black rounded-full flex justify-center items-center">
                <UserIcon color="white" size={15} />
              </p>
              <p>{keyValue}</p>
            </>
          );
        }
      }
    }
    return "N/A";
  };

   const renderSkeletonLoader = () => (
      <tr>
        <td colSpan={columns?.length+1}>
          <div className="flex flex-col   gap-2 mt-2">
            {Array.from({ length: skeltonCount }).map((_, index) => (
              <div key={index} className="flex gap-2 animate-pulse">
                {columns.map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-6 w-full bg-gray-200 rounded-lg skeleton"
                  ></div>
                ))}
               
                  <div className="h-6 w-full bg-gray-200 skeleton"></div>
                
              </div>
            ))}
          </div>
        </td>
      </tr>
    );
  
    
    // useEffect(() => {
    //   const timeout = setTimeout(() => {
    //     if (data?.length === 0) {
    //       setNoDataFound(true);
    //     } else {
    //       setNoDataFound(false);
    //     }
    //   }, 3000);
    //   return () => clearTimeout(timeout);
    // }, [data]);

  return (
    <div className="w-full  bg-white rounded-lg p-4 mb-4">
      {renderHeader()}

      <div
        style={maxHeight ? { maxHeight: maxHeight, overflowY: "auto" } : {}}
        className={maxHeight ? "custom-scrollbar max-md:overflow-x-scroll" : "md:hide-scrollbar max-md:overflow-x-scroll"}
        >
        <table
          className={`w-full ${maxHeight && "table-fixed"
            }`}
        >
          <tbody>
          {loading ? (
              renderSkeletonLoader()
            ) : data?.length === 0 ? (
              // renderSkeletonLoader()
              <tr>
                <td
                  colSpan={columns?.length+1}
                  className="text-center py-4 text-gray-500"
                >
                  <NoRecords imgSize={70} textSize="md"/>
                </td>
              </tr>
            ) : 
            paginatedData?.length > 0 && (
              paginatedData?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-gray-50 z-10">
                  <td className="p-4 text-xs text-[#4B5C79] font-medium border-b-8 border-y-white bg-[#F7FBFE] rounded-lg">
                    {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                  </td>
                  {columns.map((col: any) => (
                    <td
                      key={String(col.key)}
                      className="p-4 text-xs text-[#4B5C79] font-medium border-b-8 border-y-white bg-[#F7FBFE]"
                    >
                      <div className={`flex justify-start items-center gap-2 ${col.key.toLowerCase().includes("status") ? 'justify-center' : 'justify-start'}`}>
                        {col.key === "plan" ? (
                          <p className="text-[#4B5C79] text-sm font-bold">
                            {getNestedValue(row, col.key) || "Null"}
                          </p>
                        ) : col.key === "name" ? (
                          <p className="text-[#4B5C79] text-sm font-normal">
                            {getNestedValue(row, col.key) || "Null"}
                          </p>
                        ) : col.key === "startDate" ? (
                          <span className="text-[#72829D] text-xs font-medium flex items-center gap-1">
                            Start Date
                            <div className="h-1 w-1 rounded-full bg-orange-400"></div>
                            {getNestedValue(row, col.key) || "Null"}
                          </span>
                        ) : col.key === "endDate" ? (
                          <span className="text-[#72829D] text-xs font-medium flex items-center gap-1">
                            End Date
                            <div className="h-1 w-1 rounded-full bg-orange-400"></div>
                            {getNestedValue(row, col.key) || "Null"}
                          </span>
                        ) 
                         :[
                          "userName",
                          "user.userName",
                          "leadName",
                          "firstName",
                        ].includes(col.key) ? (
                          renderImageAndLabel(row)
                        ) : col.key.toLowerCase().includes("status") ? (
                          <p  className={getStatusClass(row[col.key])}>
                            {row[col.key]}
                          </p>
                        ) : (
                          getNestedValue(row, col.key) 
                        )}
                      </div>
                    </td>
                  ))}

                  <td className="p-4 border-b-8 border-y-white bg-[#F7FBFE] rounded-lg">
                    <div className="flex justify-center gap-2">
                      <Button variant="tertiary" className="rounded-lg  h-8 border-[#585953]">
                        <p onClick={()=>handleView(row._id )}  className="text-[#585953] text-xs font-medium  px-1">View</p>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )
            }
          </tbody>
        </table>
      </div>


     { data&&data.length > 10 &&<div className="flex justify-between items-center mt-4">
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
      </div>}

    </div>
  );
};

export default LicensersTable;
