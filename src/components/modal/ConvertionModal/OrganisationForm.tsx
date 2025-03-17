//import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../form/Input";
//import Select from "../../../components/form/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useResponse } from "../../../context/ResponseContext";
import useApi from "../../../Hooks/useApi";
import { Conversion } from "../../../Interfaces/Conversion";
import { endPoints } from "../../../services/apiEndpoints";
import CustomPhoneInput from "../../form/CustomPhone";
import InputPasswordEye from "../../form/InputPasswordEye";
import { useAllService } from "../../function/allServicesFilter";
import Button from "../../ui/Button";
import ProductLogo from "../../ui/ProductLogo";
import NoRecords from "../../ui/NoRecords";


type Props = {
  onClose: () => void;
  type?: "lead" | "trial";
  orgData?: any;
};

const validationSchema = Yup.object({
  organizationName: Yup.string().required("Organization name is required"),
  contactName: Yup.string().required("Contact name is required"),
  contactNum: Yup.string().required("Contact number is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Must be a valid email"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required")
});
const OrganisationForm = ({ onClose, type, orgData }: Props) => {
  
  
  const { customerData, setPostLoading } = useResponse();
  console.log("orgData",orgData);
 
  const [selectedPlan, setSelectedPlan] = useState({
    plan:'',
    planName:''
  });
  const { request: leadToTrial } = useApi("put", 3001);
  const { request: trialToLicenser } = useApi("put", 3001);
  const navigate = useNavigate();
  const allSerives:[]=useAllService(customerData?.project)
  console.log("cus",allSerives);
  const [planError, setPlanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<Conversion>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Conversion> = async (data) => {
    try {
      if (!selectedPlan.plan &&type=="trial") {
        setPlanError("Please select a purchase plan.");
        return;
      }else{
       
        const body={
          ...data,
          plan:selectedPlan.plan,
          planName:selectedPlan.planName
        }
        console.log("form",body);
        setPostLoading(true)
        const fun =
          type === "lead" ? leadToTrial : trialToLicenser;
  
        const customerId = customerData?._id;
        if (!customerId) {
          throw new Error("Customer ID is required");
        }
  
        const { response, error } = await fun(
          `${type === "lead"
            ? endPoints.TRIAL
            : endPoints.TRIALS
          }/${customerId}`,
          body
        );
  
        console.log("res", response);
        console.log("er", error)
  
        if (response && !error) {
          toast.success(
  
  
            response.data.message
          );
  
          navigate(type === "trial" ? "/licenser" : "/trial");
  
          onClose?.();
        } else {
          toast.error(
            error?.response?.data?.error.message||
            "An unexpected error occurred."
          );
        }
      }
     
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
      console.error(err);
    } finally {
      setPostLoading(false)
    }
  };





  const handleInputChange = (field: keyof Conversion) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  useEffect(() => {
    setValue("contactName", customerData?.firstName);
    setValue(
      "organizationName",
      customerData?.organizationName

    );
    setValue(
      "contactNum",
      orgData?.primaryContactNum
        ? orgData?.primaryContactNum
        : customerData?.phone
    );
    setValue(
      "email",
      orgData?.primaryContactEmail
        ? orgData?.primaryContactEmail
        : customerData?.email
    );
    setValue(
      "startDate",
      orgData?.startDate ? orgData?.startDate : customerData?.startDate
    );
    setValue(
      "endDate",
      orgData?.endDate ? orgData?.endDate : customerData?.endDate
    );
    if (type == "lead") {
      setValue("customerStatus", "Trial");
    }
  }, [orgData, customerData]);

  console.log("ors", orgData);
  console.log("cus", customerData);
  
  useEffect(() => {
    if (type === "lead" && watch("startDate")) {
      // Calculate 7 days after the startDate
      const calculatedEndDate = new Date(watch("startDate"));
      calculatedEndDate.setDate(calculatedEndDate.getDate() + 7);

      // Format the date to YYYY-MM-DD format (required for <input type="date">)
      const formattedEndDate = calculatedEndDate.toISOString().split("T")[0];

      // Set the calculated endDate in the form
      setValue("endDate", formattedEndDate);
      clearErrors("endDate");
    }
  }, [watch("startDate"), type, setValue]);

  console.log("er",planError);
  


  return (
    <div className="p-1 bg-white rounded shadow-md space-y-2 ">
      <div className="p-1 space-y-1 text-[#4B5C79] py-2 w-[100%]">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg">
              {" "}
              Organization Creation
            </h3>
            <p className="text-[11px] text-[#8F99A9] mt-1">
              To implement an organizational structure that aligns with your business goals
            </p>
          </div>
          <p onClick={onClose} className="text-3xl cursor-pointer">
            &times;
          </p>
        </div>
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          <div className=" my-2 max-h-[80vh] overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="mx-3 gap-4 space-y-2">
              <Input
                required
                readOnly={orgData ? true : false}
                label="Organization Name"
                type="text"
                placeholder="Enter Name"
                error={errors.organizationName?.message}
                {...register("organizationName")}
              />
              <Input
                required
                readOnly={orgData ? true : false}
                label="Email"
                type="text"
                placeholder="Enter Email"
                error={errors.email?.message}
                {...register("email")}
              />

              <CustomPhoneInput
                required
                isReadOnly={orgData ? true : false}
                label="Phone Number"
                name="phone"
                error={errors.contactNum?.message}
                placeholder="Enter phone number"
                value={watch("contactNum")} // Watch phone field for changes
                onChange={(value) => {
                  handleInputChange("contactNum");
                  setValue("contactNum", value); // Update the value of the phone field in React Hook Form
                }}
              />
              <InputPasswordEye
                required
                placeholder="Enter Password"
                label="New Password"
                error={errors.password?.message}
                {...register("password")}
              />
              <InputPasswordEye
                required
                placeholder="Re-enter Password"
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <label
            className="block text-sm mb-2 font-normal text-deepStateBlue"
          >
            <p>Product</p>
          </label>
              <div className=" w-full h-[42px] flex  items-center gap-2 ps-2  bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg">
                <ProductLogo size={8} projectName={customerData?.project}/>
                <p className="text-[#0B1320]">{customerData?.project}</p>
              </div>
              {
  type === "trial" && (
    <div className="flex flex-col">
  <h2 className="text-[12px] mb-2">Select a Purchase Plan <span className="text-red-500">*</span></h2>

  {allSerives?.length>0?<div  className="mb-2 overflow-x-auto hide-scrollbar">
    <div
    onClick={()=>setSelectedPlan({plan:"",planName:""})}
      className="grid gap-4 w-max"
      style={{
        gridTemplateColumns: `repeat(${allSerives.length}, minmax(160px, 1fr))`,
      }}
    >
      {allSerives.map((plan: any) => (
        <div
          key={plan._id}
          className={`p-4 border-2 rounded-lg cursor-pointer bg-[#F5F5F5] transition-all ${
            selectedPlan.plan === plan._id ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => {setSelectedPlan({plan:plan._id,planName:plan.itemName})
            setPlanError('')
          }}
        >
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <ProductLogo projectName={customerData?.project} />
              <input
                type="radio"
                name="purchasePlan"
                checked={selectedPlan.plan === plan._id}
                onChange={() =>{setSelectedPlan({plan:plan._id,planName:plan.itemName})
                  setPlanError('')
                }}
                className="mt-2 w-5 cursor-pointer"
              />
            </div>
            <h3 className="text-sm font-normal text-[#0B1320]">
              {plan.itemName}
            </h3>
            <div className="space-y-1 mt-2">
              <p className="text-xs font-normal text-[#768294]">Duration</p>
              <p className="text-sm font-normal text-[#0B1320] ">
                {plan.duration}
              </p>
              <p className="text-xs font-normal text-[#768294]">Price</p>
              <p className="text-sm font-semibold text-[#0B1320]">
                ₹{plan.sellingPrice}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>:
  <NoRecords text="No purchase plan available" textSize="xs" imgSize={50}/>
  }

  {/* Show error message if no plan is selected */}
  {planError && <p className="text-red-500 text-sm mt-1">{planError}</p>}
</div>

  )
}





              <Input
                required
                type="date"
                label="Start Date"
                error={errors.startDate?.message}
                {...register("startDate")}
              />

              <Input
                required
                type="date"
                label="End Date"
                value={watch("endDate")}
                error={errors.endDate?.message}
                {...register("endDate")}
              />
            </div>
          </div>

          <div className=" flex justify-end gap-2 mt-3 me-3">

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
    </div>
  );
};

export default OrganisationForm;
