//import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../components/form/Input";
//import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { WCData } from "../../../Interfaces/WC";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  editId?:any;
};


const validationSchema = Yup.object({
  profileName: Yup.string().required("First name is required"),
  commissionPoint:  Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value)).required("commissionPoint is required"),
 recurringPoint: Yup.number()
  .nullable()
  .transform((value, originalValue) => (originalValue === "" ? null : value)).required("recurring point is required"),
  perPointValue: Yup.number()
  .nullable()
  .transform((value, originalValue) => (originalValue === "" ? null : value)).required("perPointValue is required"),
  thresholdLicense: Yup.number()
  .nullable()
  .transform((value, originalValue) => (originalValue === "" ? null : value)).required("thresholdLicense is required"),
});

function WCommissionForm({ onClose , editId }: Props) {
  const { request: addWC } = useApi('post', 3003);
  const { request: editWC } = useApi("put", 3003);
  const { request: getWC } = useApi("get", 3003);
  const {setPostLoading}=useResponse()
  const {
    register,
    handleSubmit,
    formState: { errors },
    
    setValue,

  } = useForm<WCData>({
    resolver: yupResolver(validationSchema),
  });

  const setFormValues = (data: WCData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof WCData, data[key as keyof WCData]);
    });
  };

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const { response, error } = await getWC(`${endPoints.WC}/${editId}`);
          if (response && !error) {
            setFormValues(response.data);
          } else {
            toast.error(error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching region data:", err);
        }
      })();
    }
  }, [editId]);

  const onSubmit: SubmitHandler<WCData> = async (data) => {

    // console.log( data);

    try {
      setPostLoading(true)
      const apiCall = editId ? editWC : addWC;
      const { response, error } = await apiCall(
        editId ? `${endPoints.WC}/${editId}`: endPoints.WC , data);
      // console.log("res", response);
      // console.log("err", error);
      
     if (response && !error) {
        toast.success(response.data.message);
        console.log(response.data);
        
        onClose();

      } else {
        toast.error(error.response.data.message);
      }

    } catch (err) {
      console.error("Error submitting worker commission  data:", err);
      toast.error("An unexpected error occurred.");

    }
    finally{
      setPostLoading(false)
    }
    
  };


  return (
    <div className="p-5 space-y-2 text-[#4B5C79] py-2 w-full">
      <div className="flex justify-between p-2">
        <div>
          <h3 className="text-[#303F58] font-bold text-lg">{editId ? "Edit" : "Create"} Commission Profile</h3>
          <p className="text-[11px] text-[#8F99A9] mt-1">
            {editId
              ? "Edit the details of the existing Commission Profile"
              : "Fill in the details to create a Commission Profile"}
          </p>
        </div>
        <p onClick={onClose} className="text-3xl cursor-pointer">
          &times;
        </p>
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      

          <div className=" my-2 w-full  gap-4 space-y-4">
        
              <Input
                required
                label="Profile Name"
                type="text"
                placeholder="Enter Profile Name"
                error={errors.profileName?.message}
                {...register("profileName")}
                // onChange={() => handleInputChange("profileName")}
              />
              <Input
                required
                label="Threshold No Of License"
                type="number"
                step="any"
                placeholder="Enter No Of License"
                error={errors.thresholdLicense?.message}
                {...register("thresholdLicense")}
              />
              <Input
                required
                label="Commission Pointt"
                type="number"
                step="any"
                placeholder="Enter CommissionPoint "
                error={errors.commissionPoint?.message}
                {...register("commissionPoint")}

              />
                <Input
                required
                label="Recurring Point"
                type="number"
                step="any"
                placeholder="Enter Recurring Point"
                error={errors.recurringPoint?.message}
                {...register("recurringPoint")}

              />
                <Input
                required
                label="Per PointValue"
                type="number"
                step="any"
                placeholder="Enter Point Value"
                error={errors.perPointValue?.message}
                {...register("perPointValue")}
                

              />
                <Input
               
                label="Remark"
                type="text"
                step="any"
                placeholder="Enter Amount"
                error={errors.remark?.message}
                {...register("remark")}

              />


           
     
        </div>
        <div className=" flex justify-end gap-2 mt-3 pb-2 ">
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
}

export default WCommissionForm;
