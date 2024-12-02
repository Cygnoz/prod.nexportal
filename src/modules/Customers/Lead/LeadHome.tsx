import { useState } from "react";
import Boxes from "../../../assets/icons/Boxes";
import CalenderDays from "../../../assets/icons/CalenderDays";
import Package from "../../../assets/icons/Package";
import PackageCheck from "../../../assets/icons/PackageCheck";
import PackageMinus from "../../../assets/icons/PackageMinus";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import LeadForm from './LeadForm'
import { useNavigate } from "react-router-dom";

type Props = {}

function LeadHome({}: Props) {
  const navigate=useNavigate()
  const [id,setId]=useState({
    edit:'',
    delete:''
  })
  interface LeadData {
    leadID: string;
    leadName: string;
    phoneNumber: string;
    emailAddress: string;
    source: string;
    status: string;
  }

   // State to manage modal visibility
   const [isModalOpen, setIsModalOpen] = useState(false);
   // Function to toggle modal visibility
   const handleModalToggle = () => {
     setIsModalOpen((prev) => !prev);
   };

   const handleEditDeleteView=(editId?:any,viewId?:any,deleteId?:any)=>{
    if(viewId){
      navigate(`/leadView/${viewId}`)
    }else if(editId){
      console.log(editId)
      setId({...id,edit:editId})
    }else{
      console.log(deleteId)
      setId({...id,delete:deleteId})
    }
  }

   const homeCardData = [
    { icon: <CalenderDays  />, number: "110", title: "Leads Today",iconFrameColor:'#1A9CF9',iconFrameBorderColor:'#BBD8EDCC' },
    { icon: <Package/>, number: "56", title: "Closed Leads",iconFrameColor:'#D786DD',iconFrameBorderColor:'#FADDFCCC' },
    { icon: <PackageCheck />, number: "100", title: "Converted Leads",iconFrameColor:'#FCB23E',iconFrameBorderColor:'#FDE3BBCC' },
    { icon: <Boxes />, number: "526", title: "Total Leads",iconFrameColor:'#51BFDA',iconFrameBorderColor:'#C1E7F1CC' },
    { icon: <PackageMinus  />, number: "147", title: "Leads Lost",iconFrameColor:'#30B777',iconFrameBorderColor:'#B3F0D3CC' },
  ];

 // Data for the table
const leadData: LeadData[] = [
  { leadID: "BDA12345", leadName: "Anjela John", phoneNumber: "(406) 555-0120", emailAddress: "danten@mail.ru", source: "Website", status: "New"},
  { leadID: "BDA12345", leadName: "Kristin Watson", phoneNumber: "(480) 555-0103", emailAddress: "warn@mail.ru", source: "Referral", status: "Contacted"},
  { leadID: "BDA12345", leadName: "Jacob Jones", phoneNumber: "(208) 555-0112", emailAddress: "irnabela@gmail.com", source: "Website", status: "Closed"},
  { leadID: "BDA12345", leadName: "Wade Warren", phoneNumber: "(702) 555-0122", emailAddress: "tinest@mail.ru", source: "Event", status: "Closed"},
  { leadID: "BDA12345", leadName: "Jacob Jones", phoneNumber: "(208) 555-0112", emailAddress: "irnabela@gmail.com", source: "Website", status: "Closed" },
  { leadID: "BDA12345", leadName: "Devon Lane", phoneNumber: "(308) 555-0121", emailAddress: "qmaho@mail.ru", source: "Website", status: "New" },
  { leadID: "BDA12345", leadName: "Kathryn Murphy", phoneNumber: "(406) 555-0120", emailAddress: "danten@mail.ru", source: "Website", status: "New" },
  { leadID: "BDA12346", leadName: "Mason Edwards", phoneNumber: "(512) 555-0133", emailAddress: "masonedwards@mail.com", source: "Referral", status: "Contacted" },
  { leadID: "BDA12347", leadName: "Lily Anderson", phoneNumber: "(315) 555-0144", emailAddress: "lily.anderson@mail.com", source: "Website", status: "New" },
  { leadID: "BDA12348", leadName: "Oliver Hall", phoneNumber: "(401) 555-0155", emailAddress: "oliverhall@mail.com", source: "Event", status: "New" },
  { leadID: "BDA12349", leadName: "Sophia Lee", phoneNumber: "(216) 555-0166", emailAddress: "sophia.lee@mail.com", source: "Referral", status: "Closed" },
  { leadID: "BDA12350", leadName: "Ethan Clark", phoneNumber: "(334) 555-0177", emailAddress: "ethan.clark@mail.com", source: "Website", status: "Contacted"},
  { leadID: "BDA12351", leadName: "Isabella Carter", phoneNumber: "(518) 555-0188", emailAddress: "isabella.carter@mail.com", source: "Website", status: "New" },
  { leadID: "BDA12352", leadName: "Henry Thomas", phoneNumber: "(609) 555-0199", emailAddress: "henry.thomas@mail.com", source: "Event", status: "Closed" },
  { leadID: "BDA12353", leadName: "Ava Jackson", phoneNumber: "(202) 555-0200", emailAddress: "ava.jackson@mail.com", source: "Website", status: "Contacted"},
  { leadID: "BDA12354", leadName: "Lucas Wright", phoneNumber: "(703) 555-0211", emailAddress: "lucas.wright@mail.com", source: "Referral", status: "Closed"},
];

  // Define the columns with strict keys
  // Define the columns with strict keys for LeadData
const columns: { key: keyof LeadData; label: string }[] = [
  { key: "leadID", label: "Lead ID" },
  { key: "leadName", label: "Lead Name" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "emailAddress", label: "Email Address" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
];

  return (
    <div className="text-[#303F58] space-y-4">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Lead</h1>
      <Button variant="primary"  size="sm" onClick={handleModalToggle}>
        <span className="text-xl font-bold">+</span>Create Lead
      </Button>
      </div>
      {/* HomeCards Section */}
      <div className="flex gap-3 py-2 justify-between">
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
  data={leadData}
  columns={columns}
  headerContents={{
    title: "Lead Details",
    search: { placeholder: "Search Leads" },
    // sort: [
    //   {
    //     sortHead: "Sort",
    //     sortList: [
    //       { label: "Sort by Name", icon: <CalenderDays size={14} color="#4B5C79"/> },
    //       { label: "Sort by Age", icon: <Package size={14} color="#4B5C79"/> },
    //       { label: "Sort by Name", icon: <CalenderDays size={14} color="#4B5C79"/> },
    //       { label: "Sort by Age", icon: <Package size={14} color="#4B5C79"/> }
    //     ]
    //   },
    //   {
    //     sortHead: "Filter",
    //     sortList: [
    //       { label: "Sort by Date", icon: <PackageCheck size={14} color="#4B5C79"/> },
    //       { label: "Sort by Status", icon: <Boxes size={14} color="#4B5C79"/> }
    //     ]
    //   }
    // ]
  }}
  actionList={[
    { label: 'edit', function:handleEditDeleteView },
    { label: 'delete', function: handleEditDeleteView },
    { label: 'view', function: handleEditDeleteView },
  ]}
/>
      </div>
      {/* Modal controlled by state */}
      <Modal open={isModalOpen} onClose={handleModalToggle}>
      <LeadForm  onClose={handleModalToggle}/>
      </Modal>
    </div>
  )
}

export default LeadHome