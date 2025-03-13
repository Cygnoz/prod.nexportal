import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Boxes from "../../../assets/icons/Boxes";
import CalenderDays from "../../../assets/icons/CalenderDays";
import PackageCheck from "../../../assets/icons/PackageCheck";
import PackageMinus from "../../../assets/icons/PackageMinus";
import ConvertModal from "../../../components/modal/ConvertionModal/CovertLicenser";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import useApi from "../../../Hooks/useApi";
import { LeadData } from "../../../Interfaces/Lead";
import { endPoints } from "../../../services/apiEndpoints";
import ImportLeadModal from "./ImportLeadModal";
//import LeadForm from "./LeadForm";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";
import LeadForm from "./LeadForm";

type Props = {};

function LeadHome({}: Props) {
  const {regionId ,areaId,refreshContext,customersCounts}=useRegularApi()
  const { request: getAllLeads } = useApi("get", 3001);
  const { setCustomerData,loading, setLoading } = useResponse();
  const [allLead, setAllLead] = useState<LeadData[]>([]);
  const { request: getLead } = useApi("get", 3001);
  const [editId, setEditId] = useState("");
  const navigate = useNavigate();

  

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
    import: false,
    convert: false,
    leadForm: false,
  });

  // Function to toggle modal visibility
  const handleModalToggle = (
    isImport = false,
    convert = false,
    leadForm = false
  ) => {
    setIsModalOpen((prev) => ({
      ...prev,
      import: isImport, // Updated key with new parameter name
      convert: convert,
      leadForm: leadForm,
    }));
  };

  const handleView = (id: any) => {
    navigate(`/lead/${id}`);
  };

  const handleEdit = (id: any) => {
    setEditId(id);
    handleModalToggle(false, false, true);
  };

  const getLeads = async () => {
   
    try {
      setLoading(true);
      const { response, error } = await getAllLeads(endPoints.LEADS);
      if (response && !error) {
        console.log(response.data.leads);
        const transformLead =
          response.data.leads?.map((lead: any) => ({
            ...lead,
            leadName: `${lead.firstName} ${lead.lastName ? lead.lastName : ""}`,
            leadImage: lead?.image,
            leadId: lead?.customerId,
          })) || [];
        setAllLead(transformLead);
      }
    } catch (err) {
      console.log(err);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getLeads();
    refreshContext({customerCounts:true})
  }, []);

  useEffect(()=>{
    if(isModalOpen.leadForm){
     refreshContext({customerCounts:true})
    }else{
      getLeads();
    }
  },[isModalOpen])

  const homeCardData = [
    {
      icon: <Boxes />,
      number: customersCounts?.totalLeads,
      title: "Total Leads",
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <CalenderDays />,
      number: customersCounts?.leadsToday,
      title: "Leads Today",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <PackageCheck />,
      number: customersCounts?.convertedLeads,
      title: "Converted Leads",
      iconFrameColor: "#FCB23E",
      iconFrameBorderColor: "#FDE3BBCC",
    },
    {
      icon: <PackageMinus />,
      number: customersCounts?.leadsLost,
      title: "Leads Lost",
      iconFrameColor: "#30B777",
      iconFrameBorderColor: "#B3F0D3CC",
    },
  ];

  const handleConvert = async (id: any) => {
    handleModalToggle(false, true, false);
    try {
      const { response, error } = await getLead(`${endPoints.LEAD}/${id}`);
      if (response && !error) {
        const Lead = response.data; // Return the fetched data
        console.log("Fetched Lead data:", Lead);
        setCustomerData(Lead);
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Lead data:", error);
      }
    } catch (err) {
      console.error("Error fetching Lead data:", err);
    }
  };

  // Define the columns with strict keys
  // Define the columns with strict keys for LeadData
  const columns: { key: any; label: any }[] = [
    { key: "leadId", label: "Lead ID" },
    { key: "leadName", label: "Lead Name" },
    { key: "phone", label: "Phone Number" },
    { key: "", label: "Product" },
    { key: "convert", label: handleConvert },
    { key: "leadStatus", label: "Status" },
  ];

  return (
    <>
      <div className="text-[#303F58] space-y-4">
        <div className="flex justify-between items-center">
        <div>
         <h1 className="text-[#303F58] text-xl font-bold">Lead</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          A potential client or customer showing interest in your business. 
            </p>
         </div>
          <div className="flex gap-2">
            <Button
              variant="tertiary"
              className="border border-[#565148]"
              size="sm"
              onClick={() => handleModalToggle(true, false, false)}
            >
              <p className="">
                <span className="text-xl font-bold ">+ </span>Import Lead
              </p>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleModalToggle(false, false, true);
                setEditId("");
              }}
            >
              <span className="text-xl font-bold">+</span>Create Lead
            </Button>
          </div>
        </div>
        {/* HomeCards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 mt-2">
          {homeCardData?.map((card, index) => (
            <HomeCard
              iconFrameColor={card.iconFrameColor}
              iconFrameBorderColor={card.iconFrameBorderColor}
              key={index}
              icon={card.icon}
              number={card.number}
              title={card.title}
            />
          ))}
        </div>

        {/* Table Section */}
        <div>
          <Table<LeadData>
            data={allLead}
            columns={columns}
            headerContents={{
              title: "Lead Details",
              search: { placeholder: "Search Leads..." },
           
            }}
            actionList={[
              { label: "view", function: handleView },
              { label: "edit", function: handleEdit },
            ]}
            loading={loading}
          />
        </div>
      </div>
      {/* Modal controlled by state */}
      <Modal open={isModalOpen.leadForm} onClose={() => handleModalToggle()}   className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]   max-sm:overflow-auto">
        <LeadForm editId={editId}  regionId={regionId} areaId={areaId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.import}
       className="w-[40%] max-sm:w-[90%] max-md:w-[70%] "
        onClose={() => handleModalToggle()}
      >
        <ImportLeadModal onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.convert}
        align="center"
        onClose={() => handleModalToggle()}
        className="w-[30%]"
      >
        <ConvertModal
          onClose={() => handleModalToggle()}
          type="lead"
        />
      </Modal>
    </>
  );
}

export default LeadHome;
