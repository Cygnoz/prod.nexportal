import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  id?: string;
  from: "Payroll" | "Expense";
};

interface ExpenseAccData {
  fromAccount: string;
  toAccount: string;
  paymentMode: string;
}

function PayModal({ onClose, id, from }: Props) {
  const validationSchema = Yup.object({
    fromAccount: Yup.string().required("From account is required"),
    paymentMode: Yup.string().required("Payment mode is required"),
    toAccount: Yup.string().required("To account is required"),
  });

  const navigate = useNavigate();
  const { accountsList, refreshContext } = useRegularApi();
  const [expenseAccounts, setExpenseAccounts] = useState<any>({
    paidThrough: [],
    expenseAccount: [],
  });

  const { request: payExpense } = useApi("put", 3002);
  const { request: payPayroll } = useApi("put", 3002);
  const {
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<ExpenseAccData>({
    resolver: yupResolver(validationSchema),
  });

  const {setPostLoading}=useResponse()
  const onSubmit: SubmitHandler<ExpenseAccData> = async (data) => {
    try {
      setPostLoading(true)
      let functions: () => Promise<any>;

      if (from === "Expense") {
        functions = () => payExpense(`${endPoints.PAY_EXPENSE}/${id}`, data);
      } else {
        functions = () => payPayroll(`${endPoints.PAY_PAYROLL}/${id}`, data);
      }
      const { response, error } = await functions();
      if (response && !error) {
        toast.success(response.data.message);
        if (from === "Expense") {
            navigate(`/expense-paid/${id}`);
        }else{
            navigate(`/payroll-slip/${id}`)
            
        }
        
      } else {
        console.log("err", error);
      }
    } catch (err) {
      console.log("err", err);
    }
    finally{
      setPostLoading(false)
    }
  };

  const handleInputChange = (field: keyof ExpenseAccData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  console.log("sdsad", accountsList);

  useEffect(() => {
    refreshContext({ accountsList: true });
    if (accountsList) {
      const paidThrough =
        accountsList.ExpenseAccount?.map((pay: any) => ({
          label: pay?.accountName,
          value: pay?._id,
        })) || [];

      const expenseAccount =
        accountsList?.paidThroughAccount?.map((pay: any) => ({
          label: pay?.accountName,
          value: pay?._id,
        })) || [];

      setExpenseAccounts((prev: any) => ({
        ...prev,
        paidThrough,
        expenseAccount,
      }));
    }
  }, [accountsList]);

  const paymentMode = [
    { value: "Cash", label: "Cash" },
    { value: "Bank", label: "Bank" },
  ];
  const toAccount = [{ value: "679c57f2fb0228937ffe1062", label: "Salaries" }];

  useEffect(()=>{
    if(from=="Payroll"){
        setValue("toAccount",'679c57f2fb0228937ffe1062')
    }
  },[from])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center ">
        <h1 className="font-bold text-lg">
          Add {from === "Payroll" ? "Payroll" : "Expense"} Account Info
        </h1>
        <p className="cursor-pointer text-2xl" onClick={onClose}>
          &times;
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2">
        <Select
          required
          label="From Account(Paid Through)"
          placeholder="Select From Account"
          value={watch("fromAccount")}
          error={errors.fromAccount?.message}
          options={expenseAccounts.paidThrough}
          onChange={(selectedValue) => {
            // Update the country value and clear the state when country changes
            setValue("fromAccount", selectedValue);
            handleInputChange("fromAccount");
          }}
        />
        <Select
          required
          readOnly={from == "Expense" ? false : true}
          label="To Account"
          placeholder="Select To Account"
          value={
             watch("toAccount") 
          }
          error={errors.toAccount?.message}
          options={from == "Expense" ? expenseAccounts.paidThrough : toAccount}
          onChange={(selectedValue) => {
            // Update the country value and clear the state when country changes
            setValue("toAccount", selectedValue);
            handleInputChange("toAccount");
          }}
        />
        <Select
          required
          label="Payment Mode"
          placeholder="Select Payment Mode"
          value={watch("paymentMode")}
          error={errors.paymentMode?.message}
          options={paymentMode}
          onChange={(selectedValue) => {
            // Update the country value and clear the state when country changes
            setValue("paymentMode", selectedValue);
            handleInputChange("paymentMode");
          }}
        />
        <div className="flex justify-end gap-2 pt-4">
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
            Done
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PayModal;
