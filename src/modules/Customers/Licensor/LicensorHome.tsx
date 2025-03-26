import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/modal/Modal";
import HomeCard from "../../../components/ui/HomeCards";
import Table from "../../../components/ui/Table";
import CalenderDays from "../../../assets/icons/CalenderDays";
import PackageMinus from "../../../assets/icons/PackageMinus";
import Boxes from "../../../assets/icons/Boxes";
import Package from "../../../assets/icons/Package";
import AddLicenser from "./LicenserForm";
import { useNavigate } from "react-router-dom";
import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { LicenserData } from "../../../Interfaces/Licenser";
import { useResponse } from "../../../context/ResponseContext";
import { useUser } from "../../../context/UserContext";
import ProductLogo from "../../../components/ui/ProductLogo";


const LicensorHome = () => {
  const { loading, setLoading } = useResponse();
  const {user}=useUser()
  const {regionId ,areaId,customersCounts,refreshContext}=useRegularApi()
  const {request:getAllLicenser}=useApi('get',3001)
   const [allLicenser, setAllLicenser] = useState<LicenserData[]>([]);
   const [orignalLicenser,setOriginalLicenser]=useState<LicenserData[]>([])
    const navigate=useNavigate()

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId,setEditId] = useState('');


    const handleEdit=(id:any)=>{
      handleModalToggle()
      setEditId(id)
    }

    const handleModalToggle = () => {
        setIsModalOpen((prev) => !prev);
    getLicensers();
    refreshContext({customerCounts:true})
      };
       const handleView=(id:any)=>{
        navigate(`/licenser/${id}`)
      }
    
      const getLicensers=async()=>{
       
          try{
            setLoading(true)
            const {response,error}=await getAllLicenser(endPoints.LICENSER)
            console.log("res",response);
            console.log("err",error);
            if(response && !error){
              console.log(response.data);
             const transformLicense= response.data.licensers?.map((license:any) => ({
                ...license,
                startDate: license.startDate
                ? new Date(license.startDate).toLocaleDateString("en-GB")
                : "N/A",
                endDate: license.endDate
                ? new Date(license.endDate).toLocaleDateString("en-GB")
                : "N/A",
                licenserId:license.customerId
               
              })) || [];
             setAllLicenser(transformLicense)
             setOriginalLicenser(transformLicense)
            }
          }catch(err){
            console.log(err);
          }finally{
            setLoading(false)
          }
      }

      
      const BillBizz = "BillBizz";
      const SewNex = "SewNex";
      const SaloNex = "SaloNex";
      const NexD = "6NexD";
      const All=""
      const Active = "Active";
      const Expired = "Expired";
      const Renewal ="Pending Renewal"
      const Deactive="Deactive"
      const sort = [
        {
          sortHead: "By product",
          sortList: [
            {
              label: 'All',
              icon: '',
              action: () => handleFilter({ options: All }),
            },
            {
              label: BillBizz,
              icon: <ProductLogo projectName={BillBizz} size={6} />,
              action: () => handleFilter({ options: BillBizz }),
            },
            {
              label: SewNex,
              icon: <ProductLogo projectName={SewNex} size={6} />,
              action: () => handleFilter({ options: SewNex }),
            },
            {
              label: SaloNex,
              icon: <ProductLogo projectName={SaloNex} size={6} />,
              action: () => handleFilter({ options: SaloNex }),
            },
            {
              label: NexD,
              icon: <ProductLogo projectName={NexD} size={6} />,
              action: () => handleFilter({ options: NexD }),
            },
          ],
        },
        {
          sortHead: "By status",
          sortList: [
            {
              label: 'All',
              icon: '',
              action: () => handleFilter({ options: All }),
            },
            {
              label: Active,
              icon: '',
              action: () => handleFilter({ options: Active }),
            },
            {
              label: Expired,
              icon: '',
              action: () => handleFilter({ options: Expired }),
            },
            {
              label:Renewal,
              icon: '',
              action: () => handleFilter({ options:Renewal }),
            },
            {
              label:Deactive,
              icon: '',
              action: () => handleFilter({ options:Deactive }),
            },
          ],
        },
      ];
      
    
      
      const handleFilter = ({ options }: { options: string }) => {
        if (options === All) {
          // Reset to show all trials
          setAllLicenser(orignalLicenser);
          return;
        }
      
        // Check if the option is a product filter
        const isProductFilter = [BillBizz, SewNex, SaloNex, NexD].includes(options);
        
        // Check if the option is a status filter
        const isStatusFilter = [ Renewal,Active,Expired,Deactive].includes(options);
      
        if (isProductFilter) {
          const filteredTrials = orignalLicenser.filter(trial => 
            trial.project?.toLowerCase() === options.toLowerCase()
          );
          setAllLicenser(filteredTrials);
        } else if (isStatusFilter) {
          const filteredTrials = orignalLicenser.filter((trial:any) => 
            trial.licensorStatus?.toLowerCase() === options.toLowerCase()
          );
          setAllLicenser(filteredTrials);
        }
      }; 
        
        useEffect(()=>{
          getLicensers()
          refreshContext({customerCounts:true})
        },[])

        useEffect(()=>{
          if(isModalOpen){
          refreshContext({customerCounts:true})
          }else{
            getLicensers()
          }
        },[isModalOpen])
      

      // Data for HomeCards
  const homeCardData = [
    { icon: <Boxes />, number: customersCounts?.totalLicensers, title: "Total Licenser",iconFrameColor:'#51BFDA',iconFrameBorderColor:'#C1E7F1CC' },
    { icon: <CalenderDays />, number: customersCounts?.licensersToday, title: "Licenser Today",iconFrameColor:'#1A9CF9',iconFrameBorderColor:'#BBD8EDCC' },
    { icon: <Package />, number: customersCounts?.activeLicensers, title: "Active Licenser",iconFrameColor:'#D786DD',iconFrameBorderColor:'#FADDFCCC' },
    { icon: <PackageMinus />, number: customersCounts?.expiredLicensers, title: "Expired Licenser",iconFrameColor:'#30B777',iconFrameBorderColor:'#B3F0D3CC' },
  ];



        // Define the columns with strict keys
        const columns: { key: any; label: string }[] = [
          { key: "licenserId", label: "Licenser Id" },
          { key: "firstName", label: "Licenser Name" },
          { key: "project", label: "Product" },
          { key: "planName", label: "Plan" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "licensorStatus", label: "Status" },
         ];
  return (
    <>
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>

     
         <h1 className="text-[#303F58] text-xl font-bold">Licenser</h1>
         <p className="text-ashGray text-sm max-sm:hidden">
      Grants legal permission to use a product, service, or brand. 
            </p>
         </div>

        {!(user?.role=="Supervisor" || user?.role=="Support Agent")&&<Button variant="primary" size="sm" onClick={()=>{
        handleModalToggle()
        setEditId('')

      }}>
        <span className="text-xl font-bold">+</span> Create Licenser
        </Button>}
      </div>

      {/* HomeCards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 mt-2">
        {homeCardData.map((card, index) => (
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
        <Table<LicenserData> data={allLicenser} columns={columns} headerContents={{
          title:'Licenser Details',
          search:{placeholder:'Search Licensor...'},
          sort: sort
        }}
        actionList={[
            { label: 'edit', function: handleEdit},
            { label: 'view', function: handleView },
          ]}  
          loading={loading}
          />
      </div>

   
    </div>
       {/* Modal Section */}
       <Modal open={isModalOpen} onClose={handleModalToggle}  className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%]">
        <AddLicenser regionId={regionId}  editId={editId} areaId={areaId} onClose={handleModalToggle} />
      </Modal>
      
    </>
  )
}

export default LicensorHome;