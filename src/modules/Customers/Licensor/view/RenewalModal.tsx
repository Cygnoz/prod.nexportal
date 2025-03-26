import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import Input from "../../../../components/form/Input";
import Button from "../../../../components/ui/Button";
import useApi from "../../../../Hooks/useApi";
import toast from "react-hot-toast";
import { endPoints } from "../../../../services/apiEndpoints";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResponse } from "../../../../context/ResponseContext";
import { useAllService } from "../../../../components/function/allServicesFilter";
import ProductLogo from "../../../../components/ui/ProductLogo";
import NoRecords from "../../../../components/ui/NoRecords";
type Props = {
  onClose: () => void;
  id?: string;
  project: string;
  state:string
  clientId:string
};
interface Renewal {
  startingDate: string;
  newEndDate: string;
  licenserId?: string;
  project?: string;
  salesAccountId?: string;
  depositAccountId?: string;
  taxGroup?: string;
  sellingPrice?: string;
  placeOfSupply?: string;
  plan?: string;
  planName?: string;
  clientId?:string
}

function RenewalModal({ onClose, id, project,state,clientId }: Props) {
  const { request: renewal } = useApi("post", 3001);
  const navigate = useNavigate();
  const { setPostLoading } = useResponse();
  const {request:getAllAccount}=useApi('get',3001)
  const [selectedPlan, setSelectedPlan] = useState<any>("");
  const [planError, setPlanError] = useState<string | null>(null);
  const validationSchema = Yup.object({
    startingDate: Yup.string().required("First name is required"),
    newEndDate: Yup.string().required("First name is required"),
  });
  const allSerives = useAllService(project);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Renewal>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      project,
      placeOfSupply:state,
      clientId
    },
  });
  const startingDate = watch("startingDate");

   const getAllAccounts=async()=>{
      try{
        const {response,error}=await getAllAccount(endPoints.GET_ALL_ACCOUNTS)
        if(response &&!error){
          console.log("all",response);
          setValue("depositAccountId",response.data?.depositAccount[0]?._id)
        }else{
          console.log("er",error);
          
        }
      }catch(err){
        console.log("err",err);
        
      }
    }

  const onSubmit: SubmitHandler<Renewal> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission
    console.log("Form Data", data);

    try {
      setPostLoading(true);
      const { response, error } = await renewal(endPoints.RENEW, data);
      if (response && !error) {
        toast.success(response.data.message);
        onClose();
        navigate("/licenser");
      } else {
        console.log("error", error);
        toast.error(error.response.data.message);
      }
    } catch (err) {
      console.log("err", err);
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    setValue("licenserId", id);
    getAllAccounts()
  }, [id]);

  const calculateEndDate = (startDate:any, duration:any) => {
    if (!startDate || !duration) return "";
    const date = new Date(startDate);
    const [value, unit] = duration.split(" ");

    if (unit.toLowerCase().includes("month")) {
      date.setMonth(date.getMonth() + parseInt(value, 10));
    } else if (unit.toLowerCase().includes("year")) {
      date.setFullYear(date.getFullYear() + parseInt(value, 10));
    }

    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Update newEndDate when startingDate or selectedPlan changes
  useEffect(() => {
    if (startingDate && selectedPlan?.duration) {
      const newEndDate = calculateEndDate(startingDate, selectedPlan.duration);
      setValue("newEndDate", newEndDate);
    }
  }, [startingDate, selectedPlan, setValue]);
   useEffect(()=>{
        if(selectedPlan){
          setValue("plan",selectedPlan?._id)
          setValue("planName",selectedPlan?.itemName)
          setValue("salesAccountId",selectedPlan?.salesAccountId?._id)
          setValue("taxGroup",selectedPlan?.taxRate)
          setValue("sellingPrice",selectedPlan?.sellingPrice)    
        }
      },[selectedPlan])
  

  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-[#303F58] font-bold text-lg">Renew Licenser</p>
        <p onClick={onClose} className="text-3xl cursor-pointer">
          &times;
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input
          label="Starting Date"
          required
          type="date"
          placeholder="Starting Date"
          error={errors.startingDate?.message}
          {...register("startingDate")}
          readOnly
          value={
            watch("startingDate")
              ? watch("startingDate")
              : new Date().toISOString().split("T")[0]
          } // Sets current date as default
        />
        <div className="flex flex-col">
          <h2 className="text-[12px] mb-2">
            Select a Purchase Plan <span className="text-red-500">*</span>
          </h2>

          {allSerives?.length > 0 ? (
            <div className="mb-2 overflow-x-auto hide-scrollbar">
              <div
                onClick={() => setSelectedPlan("")}
                className="grid gap-4 w-max"
                style={{
                  gridTemplateColumns: `repeat(${allSerives.length}, minmax(160px, 1fr))`,
                }}
              >
                {allSerives.map((plan: any) => (
                  <div
                    key={plan._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer bg-[#F5F5F5] transition-all ${
                      selectedPlan._id === plan._id
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPlanError("");
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between mb-2">
                        <ProductLogo projectName={project} />
                        <input
                          type="radio"
                          name="purchasePlan"
                          checked={selectedPlan._id === plan._id}
                          onChange={() => {
                            setSelectedPlan(plan);
                            setPlanError("");
                          }}
                          className="mt-2 w-5 cursor-pointer"
                        />
                      </div>
                      <h3 className="text-sm font-normal text-[#0B1320]">
                        {plan.itemName}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <p className="text-xs font-normal text-[#768294]">
                          Duration
                        </p>
                        <p className="text-sm font-normal text-[#0B1320] ">
                          {plan.duration}
                        </p>
                        <p className="text-xs font-normal text-[#768294]">
                          Price
                        </p>
                        <p className="text-sm font-semibold text-[#0B1320]">
                          ₹{plan.sellingPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoRecords
              text="No purchase plan available"
              textSize="xs"
              imgSize={50}
            />
          )}

          {/* Show error message if no plan is selected */}
          {planError && (
            <p className="text-red-500 text-sm mt-1">{planError}</p>
          )}
        </div>
        <Input
          label="Ending Date"
          required
          type="date"
          readOnly
          placeholder="Starting Date"
          error={errors.newEndDate?.message}
          {...register("newEndDate")}
        />
        <div className="bottom-0 left-0 w-full pt-2 ps-2 bg-white flex gap-2 justify-end">
          <Button
            variant="tertiary"
            className="h-8 text-sm border rounded-lg"
            size="xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="h-8 text-sm border rounded-lg"
            size="xl"
            type="submit"
          >
            Done
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RenewalModal;
