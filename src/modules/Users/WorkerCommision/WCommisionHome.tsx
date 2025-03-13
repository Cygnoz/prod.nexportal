import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
 
import { useEffect, useState } from "react";
import CreateWCommission from "./WCommissionForm";
import useApi from "../../../Hooks/useApi";
import { WCData } from "../../../Interfaces/WC";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { useResponse } from "../../../context/ResponseContext";
 
const WCommisionHome = () => {
  const { request: getALLWC } = useApi("get", 3003);
  const { request: deleteWC } = useApi("delete", 3003);
  const [allWC, setAllWC] = useState<WCData[]>([]);
  const [editId, setEditId] = useState<string | null>(null);4
  const {loading,setLoading}=useResponse()
 
  // State to manage delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 
  // State to manage main modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  // Function to toggle main modal visibility
  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    getWC();
  };
 
  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
    handleDelete()
  };
 
  const closeDeleteModal = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };
 
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { response, error } = await deleteWC(`${endPoints.WC}/${deleteId}`);
      if (response && !error) {
        getWC(); // Refresh the list
        setAllWC((prev) => prev.filter((wc: any) => wc._id !== deleteId));
        
        
        toast.success(response.data.message || "Commission deleted successfully");
      
      } else {
        console.error(error);
        toast.error("Failed to delete commission");
      }
    } catch (err) {
      console.error("Error deleting commission:", err);
      toast.error("An error occurred while deleting commission");
    } finally {
      closeDeleteModal(); // Close delete modal after operation
    }
  };
 
  const handleEdit = (id: string) => {
    handleModalToggle();
    setEditId(id);
  };
 
  const getWC = async () => {
    try {
      setLoading(true)
      const { response, error } = await getALLWC(endPoints.WC);
      if (response && !error) {
        console.log(response.data.commissions);
       
        setAllWC(response.data.commissions);
       
      } else {
        // console.log(error);
      }
    } catch (err) {
      // console.log(err);
    }finally{
      setLoading(false)
    }
  };
 
  useEffect(() => {
    getWC();
  }, []);
 
 // console.log(getWC);
  
  // Define the columns with strict keys
  const columns: { key: keyof WCData; label: string }[] = [
    { key: "profileName", label: "ProfileName" },
    { key: "thresholdLicense", label: "Threshold License" },
    { key: "commissionPoint", label: "Commission Point" },
    { key: "recurringPoint", label: "Recurring Pointt" },
    { key: "perPointValue", label: "Per Point Value" },
  ];
 
  return (
    <div>
      <div className="flex justify-between items-center">
      <div>
         <h1 className="text-[#303F58] text-xl font-bold">Worker Commission</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          Set and track commission rates for workers. 
            </p>
         </div>
 
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            handleModalToggle();
            setEditId(null);
          }}
        >
          <span className="text-xl font-bold">+</span> Add Commission Profile
        </Button>
 
        {/* Main Modal */}
        <Modal
          open={isModalOpen}
         className="w-[40%] max-sm:w-[90%] max-sm:h-[600px] max-md:w-[70%] max-lg:w-[50%] max-sm:overflow-y-auto"
          onClose={handleModalToggle}
        >
          <CreateWCommission editId={editId} onClose={handleModalToggle} />
        </Modal>
      </div>
 
      {/* Table Section */}
      <div className="py-2 mt-3">
        <Table<WCData>
          data={allWC}
          columns={columns}
          headerContents={{
            search: { placeholder: "Search worker commission..." },
          }}
          actionList={[
            { label: "delete", function: openDeleteModal },
            { label: "edit", function: handleEdit },
          ]}
          loading={loading}
        />
      </div>
 
      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
       className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
        onClose={closeDeleteModal}
      >
       
          <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this commission?"
          onClose={() => closeDeleteModal()}
        />
      </Modal>
    </div>
  );
};
 
export default WCommisionHome;
 