import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import Input from "../../../../components/form/Input";
import Button from "../../../../components/ui/Button";
import useApi from "../../../../Hooks/useApi";
import toast from "react-hot-toast";
import { endPoints } from "../../../../services/apiEndpoints";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResponse } from "../../../../context/ResponseContext";
type Props = {
  onClose: () => void;
  id?:string
};
interface Renewal {
  startingDate: string;
  newEndDate: string;
  licenserId?: string;
}

function RenewalModal({ onClose,id }: Props) {
  const {request:renewal}=useApi('post',3001)
  const navigate=useNavigate()
  const {setPostLoading}=useResponse()
  const validationSchema = Yup.object({
    startingDate: Yup.string().required("First name is required"),
    newEndDate: Yup.string().required("First name is required"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<Renewal>({
    resolver: yupResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<Renewal> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission
    console.log("Form Data", data);

    try{
      setPostLoading(true)
      const {response,error}=await renewal(endPoints.RENEW,data)
      if(response && !error){
        toast.success(response.data.message)
        onClose()
        navigate('/licenser')
      }else{
        console.log("error",error);
        
      }
    }catch(err){
      console.log("err",err);
      
    }
    finally{
      setPostLoading(false)
    }
  };

  

  useEffect(()=>{
    setValue('licenserId',id)
  },[id])
 
  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <p className='text-[#303F58] font-bold text-lg'>Renew Licenser</p>
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
        <Input
          label="Ending Date"
          required
          type="date"
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
