// src/features/regions/NewRegionForm.tsx
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import { AreaData } from "../../../Interfaces/Area";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";

interface RegionData {
  label: string;
  value: string;
}

interface NewAreaProps {
  onClose: () => void; // Prop for handling modal close
  editId?: any;
  regionId?:any
}

const validationSchema = Yup.object({
  areaName: Yup.string().required("Area name is required"),
  // areaCode: Yup.string().required("Area code is required"),
  region: Yup.string().required("Region is required"),
});

const AreaForm: React.FC<NewAreaProps> = ({ onClose,editId,regionId }) => {
  const {request:addArea}=useApi('post',3003)
  const {request:editArea}=useApi('put',3003)
  const {dropdownRegions,refreshContext}=useRegularApi()
  const {request:getArea}=useApi('get',3003)
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<AreaData>({
    resolver: yupResolver(validationSchema),
  });
  const {setPostLoading}=useResponse()
 

  

  const onSubmit: SubmitHandler<AreaData> =async (data) => {
    console.log(data);
    try {
      setPostLoading(true)
      const apiCall = editId ? editArea : addArea;
      const { response, error } = await apiCall(
        editId ? `${endPoints.AREA}/${editId}` : endPoints.AREA,
        data
      );
      if (response && !error) {
        toast.success(response.data.message);
        onClose();
      } else {
        toast.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error submitting region data:", err);
      toast.error("An unexpected error occurred.");
    }finally{
      setPostLoading(false)
    }
  };

  

  useEffect(()=>{
    const filteredRegions:any = dropdownRegions?.map((region: any) => ({
      label: region.regionName,
      value: String(region._id), // Ensure `value` is a string
    }));
    setRegionData(filteredRegions)
    if(regionId){
      setValue("region",regionId)
    }
  },[dropdownRegions,regionId])

  const setFormValues = (data: AreaData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof AreaData, data[key as keyof AreaData]);
    });
  };

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const { response, error } = await getArea(`${endPoints.AREA}/${editId}`);
          if (response && !error) {
            const { area } = response.data;
            const regionValue = {
              label: area?.region?.regionName,
              value: String(area?.region?._id),
            };
  
            setFormValues({
              ...area,
              region: regionValue.value, // Set region as { label, value }
            });
          } else {
            toast.error(error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching region data:", err);
        }
      })();
    }
    refreshContext({dropdown:true})
  }, [editId]);
  

 const handleInputChange = (field: keyof AreaData) => {
     clearErrors(field); // Clear the error for the specific field when the user starts typing
   };
  
  


  // console.log(editRegionValue);
  
  

  return (
    <div className="p-5 bg-white rounded shadow-md space-y-3">
      {/* Close button */}
      <div className="flex justify-between">
        <div>
          <h3 className="text-[#303F58] font-bold text-lg">{editId ? "Edit" : "Create"} Area</h3>
          <p className="text-[11px] text-[#8F99A9] mt-1">
          {editId
              ? "Edit the details of the existing area."
              : "Fill in the details to create a new area."}
          </p>
        </div>
        <p onClick={onClose} className="text-3xl cursor-pointer">
          &times;
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          required
          label="Area Name"
          placeholder="Enter Area Name"
          error={errors.areaName?.message}
          {...register("areaName")}
        />

    
        <Select
          required
          label="Region"
          placeholder="Select Region"
          readOnly={regionId?true:false}
          value={watch("region")}
          error={errors.region?.message}
          options={regionData}
          onChange={(selectedValue) => {
            // Update the country value and clear the state when country changes
            setValue("region", selectedValue);
            handleInputChange("region");
          }}
        />
        <Input
          placeholder="Enter Description"
          label="Description"
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="flex gap-2 justify-end mt-4">
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
};

export default AreaForm;
