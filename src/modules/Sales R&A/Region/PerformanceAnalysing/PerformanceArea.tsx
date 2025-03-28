import { useEffect, useState } from "react";
import Table from "../../../../components/ui/Table"
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import { useParams } from "react-router-dom";

type Props = {}
// Interface for the data structure
interface ColumnData {
    areaManager: string;
    area: string;
    noOfLicensers: number;
    status: string;
  }
  

function PerformanceArea({}: Props) {

  const {request:areaPerformance}=useApi('get',3003)
  const [performanceData, setPerformanceData]=useState([])
  const {id}=useParams()
  const getAreaPerformance= async()=>{
    try{
      const {response, error}=await areaPerformance(`${endPoints.AREA_PERFORMANCE}/${id}`)
      console.log(id);     
      console.log("res",response);
      console.log("err",error);
      if(response && !error){
        console.log(response.data);
        const transformedData= response.data?.map((item:any)=>({
          ...item,
          licenserCount:item?.licenserCount 
        }))
        console.log(transformedData);
        
        setPerformanceData(transformedData)
      }
      else{
        console.log(error.respone.data.message);       
      }
    }
    catch(err){
      console.error("error", err)
    }
  }
  useEffect(()=>{
    getAreaPerformance()
  },[])


    // Define the columns with strict keys
const columns: { key:  any; label: string }[] = [
    { key: "areaManager.userName", label: "Area Manager" },
    { key: "areaName", label: "Area" },
    { key: "licenserCount", label: "No. of Licensers" },
    // { key: "status", label: "Status" },
  ];

  // Sample data array matching the columns
// const data: Array<ColumnData> = [
//     {
//       areaManager: "John Doe",
//       area: "Downtown",
//       noOfLicensers: 15,
//       status: "Active",
//     },
//     {
//       areaManager: "Jane Smith",
//       area: "Uptown",
//       noOfLicensers: 10,
//       status: "Deactive",
//     },
//     {
//       areaManager: "Bob Brown",
//       area: "Midtown",
//       noOfLicensers: 12,
//       status: "Active",
//     },
//   ];
  
  return (
    <div>
         <Table<ColumnData>
  data={performanceData}
  columns={columns}
  headerContents={{
    title: "Performance By Area",
    search: { placeholder: "Search Area..." },
    // sort: [
    //   {
    //     sortHead: "Filter",
    //     sortList: [
    //       { label: "Sort by Name", icon: <UserIcon size={14} color="#4B5C79" /> },
    //       { label: "Sort by Region", icon: <RegionIcon size={14} color="#4B5C79" /> },
    //     ],
    //   },
    // ],
  }}
  noAction
/>
    </div>
  )
}

export default PerformanceArea