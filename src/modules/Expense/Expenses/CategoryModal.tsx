import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../../../components/form/Input";
import Button from "../../../components/ui/Button";
import { endPoints} from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useResponse } from "../../../context/ResponseContext";

type CategoryFormData = {
  categoryName: string;
  description?: string;
};

type Props = {
  onClose: () => void;
  editId?: string;
};

const validationSchema = Yup.object().shape({
  categoryName: Yup.string().required("Category Name is required"),
});

const CategoryModal = ({ onClose,editId }: Props) => {
    const {request:addCategory}=useApi('post',3002)
    const {request:editCategory}=useApi('put',3002)
    const {request:getACategory}=useApi('get',3002)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CategoryFormData>({
    resolver: yupResolver(validationSchema),
  });

  const {setPostLoading}=useResponse()

  const onSubmit = async (data: CategoryFormData) => {
    console.log("Submitted Data:", data);

    try {
      setPostLoading(true)
        const endPoint = editId 
            ? `${endPoints.EXPENSE_CATEGORY}/${editId}` 
            : endPoints.EXPENSE_CATEGORY;

        const { response, error } = editId 
            ? await editCategory(endPoint, data) 
            : await addCategory(endPoint, data);

        if (response && !error) {
            toast.success(response.data.message);
            onClose();
        } else {
            toast.error(error?.response?.data?.message || "An error occurred");
        }
    } catch (error) {
        console.error("Error submitting category:", error);
        toast.error("Something went wrong. Please try again.");
    }
    finally{
      setPostLoading(false)
    }
};


   const setFormValues = (data: CategoryFormData) => {
      Object.keys(data).forEach((key) => {
        setValue(key as keyof CategoryFormData, data[key as keyof CategoryFormData]);
      });
    };

  const getOneCategory=async()=>{
    const {response,error}=await getACategory(`${endPoints.EXPENSE_CATEGORY}/${editId}`)
    if(response &&!error){
        console.log("response",response.data);
        
        setFormValues(response.data)
    }
  }

  useEffect(()=>{
    if(editId){
      getOneCategory()
    }
  },[editId])

  return (
    <div>
      <div className="flex justify-between items-center p-3">
        <h1 className="text-lg font-bold text-deepStateBlue">{editId?'Edit':'Add'} Category</h1>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-2 p-2">
          <Input
            placeholder="Enter Category Name"
            label="Category Name"
            required
            error={errors.categoryName?.message}
            {...register("categoryName")}
          />
          <Input
            placeholder="Enter Description"
            label="Description"
            {...register("description")}
          />
        </div>
        <div className="flex justify-end gap-2 mt-3 pb-2 me-2">
          <Button
            variant="tertiary"
            className="h-8 text-sm border rounded-lg"
            size="lg"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="h-8 text-sm border rounded-lg"
            size="lg"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryModal;
