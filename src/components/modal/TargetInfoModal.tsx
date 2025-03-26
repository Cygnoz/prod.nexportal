import { useEffect, useState } from "react";
import Table from "../ui/Table";
import { useUser } from "../../context/UserContext";
import { endPoints } from "../../services/apiEndpoints";
import { useRegularApi } from "../../context/ApiContext";
import useApi from "../../Hooks/useApi";




type Props = {
  onClose: () => void;
}


const TargetInfoModal = ({onClose}: Props) => {
  const { request: getAllTarget } = useApi('get', 3004)
  const [allTargets, setAllTargets] = useState<any>(null);
  const { refreshContext } = useRegularApi()
  const [loading,setLoading]=useState(false)

   const {user}=useUser()
   user?.role
   const tabs = ["Region", "Area", "BDA"] as const;

    const visibleTabs = (() => {
      switch (user?.role) {
        case "Super Admin":
          return tabs;
        case "Region Manager":
          return tabs.filter(tab => tab !== "Region");
        case "Area Manager":
          return tabs.filter(tab => tab === "BDA");
        default:
          return [];
      }
    })();
    
 
const getDefaultTab = (): TabType => {
  switch (user?.role) {
    case "Super Admin":
      return "Region";
    case "Region Manager":
      return "Area";
    case "Area Manager":
      return "BDA";
    default:
      return "Region"; // Fallback in case user role is undefined
  }
};
 
  type TabType = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());
  const getTargets = async () => {
    try {
      setLoading(true)
    
       const endpoint = `${endPoints.TARGET}`
      const { response, error } = await getAllTarget(endpoint)
     // console.log(endpoint);
      //console.log("res",response);
     // console.log("err",error);
      if (response && !error) {
        console.log("sss", response.data);

        setAllTargets(response.data)
      }
    } catch (err) {
      console.log(err);
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    getTargets()
    refreshContext({ customerCounts: true })
  }, [])

    
      const Regioncolumns = [
        { key: "region.regionName", label: "Region" },
        { key: "target", label: "Target" },
      ];
    
      const Areacolumns = [
        { key: "area.areaName", label: "Area" },
        { key: "target", label: "Target" },
      ];
    
      const BDAcolumns = [
        { key: "bda.user.userName", label: "BDA" }, // Update to match actual structure
        { key: "target", label: "Target" },
      ];
      

      const getDataByActiveTab = (tab: any) => {
        switch (tab) {
          case "Region":
            return allTargets?.region || [];
          case "Area":
            return allTargets?.area || [];
            case "BDA": // Change from "Bda" to "BDA"
            return allTargets?.bda || [];
          
          default:
            return [];
        }
      };
      const data = getDataByActiveTab(activeTab);
    
  return (
    <div className="p-3">
         <div className="mb-4 p-1 flex justify-between items-center">
                  <p className="text-[#303F58] text-lg font-bold ms-2">Target Info</p>
                  <button
            type="button"
            onClick={onClose}
            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
          >
            &times;
          </button>
                </div>
                <div className="flex gap-24 bg-[#FEFBF8] rounded-xl mx-3 px-4 py-1 text-base font-bold border-b border-gray-200">
          {visibleTabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer py-2 px-[16px] ${
                activeTab === tab
                  ? "text-[#303F58] text-sm font-bold border-b-2 shadow-lg rounded-md border-[#97998E]"
                  : "text-gray-400"
              }`}
            >
              {tab}
            </div>
          ))}
        
        </div>
        <div>
          <Table
            data={data}
            columns={
              activeTab === "Region"
                ? Regioncolumns
                : activeTab === "Area"
                  ? Areacolumns
                  : BDAcolumns
            }
            
            headerContents={{
              }}
            noAction
            loading={loading}
          />
        </div>
    </div>
  )
}

export default TargetInfoModal