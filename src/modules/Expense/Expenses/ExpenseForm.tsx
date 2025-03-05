import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import BillIcon from "../../../assets/icons/BillIcon";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import UploadIcon from "../../../assets/icons/UploadIcon";
import { useRegularApi } from "../../../context/ApiContext";
import { useEffect, useState } from "react";
import TextArea from "../../../components/form/TextArea";
import { ExpenseFormData } from "../../../Interfaces/ExpenseFormData";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";



type Props = {
  onClose: () => void;
  editId?: any;
};

const validationSchema = Yup.object().shape({
  expenseName: Yup.string().required("Expense Name is required"),
  expenseAccount: Yup.string().required("Expense Account is required"),
  date: Yup.string().required("Date is required"),
  amount: Yup.number()
    .typeError("Amount must be a valid number")
    .positive("Amount must be a positive number")
    .test("is-decimal", "Amount must be a valid decimal number", (value) =>
      value !== undefined && /^\d+(\.\d{1,2})?$/.test(value.toString()) // Allows up to 2 decimal places
    )
    .required("Amount is required"),
  category: Yup.string().required("Category is required"),
});


const ExpenseForm = ({ onClose, editId }: Props) => {
  const { expenseCategories, refreshContext } = useRegularApi();
  const [categoryList, setCategoryList] = useState<{ label: string; value: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<any>();
  const { request: addExpense } = useApi('post', 3002)
  const { request: getOneExpense } = useApi('get', 3002)
  const { request: editExpense } = useApi('put', 3002)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    refreshContext({ expenseCategories: true });
    if (expenseCategories && Array.isArray(expenseCategories)) {
      const categories = expenseCategories.map((category: any) => ({
        label: category.categoryName,
        value: category._id,
      }));
      setCategoryList(categories);
    }
  }, [expenseCategories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String: any = reader.result as string;
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    console.log("Submitted Data:", data);

    try {
      let response, error;
      if (editId) {
        ({ response, error } = await editExpense(`${endPoints.EXPENSE}/${editId}`, data));
      } else {
        ({ response, error } = await addExpense(endPoints.EXPENSE, data));
      }
      if (response) {
        toast.success(response.data.message);
        onClose();
      } else if (error) {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };


  const handleInputChange = (field: keyof ExpenseFormData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };
  const triggerFileInput = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  useEffect(() => {
    setImagePreview(watch("image"))
  }, [watch("image")])

  const setFormValues = (data: ExpenseFormData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof ExpenseFormData, data[key as keyof ExpenseFormData]);
    });
  };


  const getOneExpenses = async () => {
    const { response, error } = await getOneExpense(`${endPoints.EXPENSE}/${editId}`)
    if (response && !error) {
      const filteredResponse = {
        ...response.data,
        category: response.data?.category?._id,
        date: new Date(response.data.date).toISOString().split("T")[0]
      }
      setFormValues(filteredResponse)
    } else {
      console.log(error?.response?.data);
    }
  }

  useEffect(() => {
    if (editId) {
      getOneExpenses()
    }
  }, [editId])

  return (
    <div className="p-3">
      <div className="flex justify-between items-center">
        <h1 className="text-base font-bold text-deepStateBlue px-3">{editId ? 'Edit' : 'Add'} Expense</h1>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>
      </div>
      <div className="px-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xs text-[#303F58] font-normal my-2">Upload Receipt</h1>
          {imagePreview && (
            <button onClick={() => setValue("image", undefined)}
              className="px-2 text-xs rounded-md bg-red-600 text-white">
              Clear
            </button>
          )}
        </div>
        <div className="border-2 border-dashed border-gray-300 bg-[#FEFDFA] rounded-md p-3 text-center mb-4 w-full h-48 flex justify-center items-center flex-col">
          <label
            className="cursor-pointer text-center"
            htmlFor="file-upload"
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {imagePreview ?
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Uploaded receipt"
                  className="h-44 w-fit text-center  object-contain rounded-md"
                />
              </div>
              : <>
                <div className="flex justify-center my-3">
                  <BillIcon size={40} />
                </div>
                <p className="text-gray-600 text-xs font-semibold my-2">Upload Your Receipt</p>
                <div className="flex justify-center">

                  <Button onClick={triggerFileInput} >
                    <UploadIcon color="#FFFEFB" size={14} />
                    <p className="text-[#FEFDF9] text-xs font-medium">Upload File</p>
                  </Button>

                </div>
              </>}
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 p-3">
          <Input
            required
            type="text"
            label="Expense Name"
            placeholder="Enter Name"
            {...register("expenseName")}
            error={errors.expenseName?.message}
          />
          <Input
            required
            type="date"
            label="Date"
            placeholder="Select Date"
            {...register("date")}
            error={errors.date?.message}
            value={
              watch("date")
                ? watch("date")
                : new Date().toISOString().split("T")[0]
            }
          />
          <Input
            required
            type="text"
            label="Expense Account"
            placeholder="Enter account name"
            {...register("expenseAccount")}
            error={errors.expenseAccount?.message}
          />
          <Input
            required
            type="number"
            step="0.01" // Allows decimal values
            label="Amount"
            placeholder="Enter amount"
            {...register("amount")}
            error={errors.amount?.message}
          />
        </div>
        <div className="grid grid-cols-1 p-3">
          <Select
            required
            label="Category"
            placeholder="Select category"
            options={categoryList}
            {...register("category")}
            value={watch("category")}
            error={errors.category?.message}
            onChange={(selectedValue) => {
              // Update the country value and clear the state when country changes
              setValue("category", selectedValue);
              handleInputChange("category");
            }}
          />
          <div className="mt-3">

            <TextArea
              {...register("note")}
              label="Add Notes"
              placeholder="Enter any additional notes"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6 ">
            <Button variant="tertiary" className="h-8 text-sm border rounded-lg" size="lg" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="h-8 text-sm border rounded-lg" size="lg" type="submit">Submit</Button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ExpenseForm;
