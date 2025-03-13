import { useEffect, useState } from "react";
import EditIcon from "../../../assets/icons/EditIcon";
import Trash from "../../../assets/icons/Trash";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import CategoryModal from "./CategoryModal";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import NoRecords from "../../../components/ui/NoRecords";
import { useRegularApi } from "../../../context/ApiContext";

type Props = {
    onClose: () => void;
}
const CategoryForm = ({ onClose }: Props) => {
    const {refreshContext,expenseCategories}=useRegularApi()
    const {request:deleteCategory}=useApi('delete',3002)
    const [editId, setEditId] = useState<string>("");
    const [searchValue, setSearchValue] = useState("");

    // Filter categories based on search input
    

// // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
    CategoryaddForm: false,
    confirm: false,
  });

  // Function to toggle modal visibility
  const handleModalToggle = (
    CategoryaddForm = false,
    confirm = false
  ) => {
    setIsModalOpen((prev) => ({
      ...prev,
      CategoryaddForm,
      confirm // Updated key with new parameter name
    }));
    refreshContext({expenseCategories:true})
  };

  useEffect(()=>{
   refreshContext({expenseCategories:true})
  },[])

  
  const handleEdit = (id: string) => {
    setEditId(id)
    handleModalToggle(true)
  }

  const filteredCategories = expenseCategories?.filter((category:any) =>
    category.categoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
    category.description.toLowerCase().includes(searchValue.toLowerCase())
);

  const handleDelete = async () => {
    try {
      const { response, error } = await deleteCategory(`${endPoints.EXPENSE_CATEGORY}/${editId}`);
      if (response && !error) {
        toast.success(response.data.message);
        refreshContext({expenseCategories:true})
      }else{
        toast.error(error?.response?.data?.message || "An error occurred");
      }

  }catch(error){
      console.log(error)
    }
  }
    return (
        <>
      <div className="p-3">
    <div className="flex justify-between items-center mb-4 px-3">
        <h1 className="text-base font-bold text-deepStateBlue">Category</h1>

        <button
            type="button"
            onClick={onClose}
            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
            &times;
        </button>
    </div>

    <div className="flex justify-between items-center mb-4 px-3 flex-wrap">
        <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <SearchBar
                placeholder="Search Category"
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />
        </div>

        <Button
            variant="primary"
            className="border border-[#565148] sm:w-auto w-full sm:text-sm text-xs py-2"
            size="sm"
            onClick={() => {
                handleModalToggle(true, false);
                setEditId("");
            }}
        >
            <p className="flex items-center justify-center">
                <span className="text-xl font-bold">+ </span>Add Category
            </p>
        </Button>
    </div>

    <div className={`min-h-[300px] ${expenseCategories?.length > 12 && 'overflow-y-scroll h-96 custom-scrollbar'}`}>
        {filteredCategories?.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4`}>
                {filteredCategories.map((category: any) => (
                    <div key={category._id} className="w-full">
                        <div className="border border-slate-200 min-h-16 bg-[#FFF8F1] text-textColor rounded-xl w-full h-auto p-3 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold">{category.categoryName}</h3>
                                <p className="text-xs font-normal">{category.description}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="cursor-pointer" onClick={() => handleEdit(category?._id)}>
                                    <EditIcon color="#768294" size={18} />
                                </div>
                                <div
                                    onClick={() => {
                                        handleModalToggle(false, true);
                                        setEditId(category._id);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Trash color="#ED2525" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <NoRecords parentHeight="300px" textSize="md" imgSize={70} />
        )}
    </div>
</div>

        <Modal open={isModalOpen.CategoryaddForm} onClose={() => handleModalToggle()}  className="w-[35%] max-sm:w-[90%] max-md:w-[70%] ">
        <CategoryModal editId={editId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" align="center" open={isModalOpen.confirm} onClose={() => handleModalToggle()}>
    <ConfirmModal
      action={handleDelete}
      prompt="Are you sure want to delete this category?"
      onClose={() => handleModalToggle()}
    />
  </Modal>
        </>
    )
}

export default CategoryForm