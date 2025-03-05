import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { RegionData } from "../../../Interfaces/Region";
import { useRegularApi } from "../../../context/ApiContext";
import { useResponse } from "../../../context/ResponseContext";

interface RegionFormProps {
  onClose: () => void;
  editId?: any;
}

const validationSchema = Yup.object({
  regionName: Yup.string().required("Region name is required"),
  // regionCode: Yup.string().required("Region code is required"),
  country: Yup.string().required("Country is required"),
});

const RegionForm: React.FC<RegionFormProps> = ({ onClose, editId }) => {
  const { allCountries } = useRegularApi();
  const {setPostLoading}=useResponse()
  const { request: addRegion } = useApi("post", 3003);
  const { request: editRegion } = useApi("put", 3003);
  const { request: getRegion } = useApi("get", 3003);
  const [countries, setCountries] = useState<[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<RegionData>({
    resolver: yupResolver(validationSchema),
  });

  const setFormValues = (data: RegionData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof RegionData, data[key as keyof RegionData]);
    });
  };

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const { response, error } = await getRegion(
            `${endPoints.REGION}/${editId}`
          );
          if (response && !error) {
            const {region}=response.data
            
            setFormValues(region);
          } else {
            toast.error(error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching region data:", err);
        }
      })();
    }
  }, [editId]);

  const onSubmit: SubmitHandler<RegionData> = async (data) => {
    console.log(data);

    try {
      setPostLoading(true)
      const apiCall = editId ? editRegion : addRegion;
      const { response, error } = await apiCall(
        editId ? `${endPoints.REGION}/${editId}` : endPoints.REGION,
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
  useEffect(() => {
    const filteredCountry = allCountries?.map((country: any) => ({
      label: country.name,
      value: country.name,
    }));
    setCountries(filteredCountry);
  }, [allCountries]);

  const handleInputChange = (field: keyof RegionData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  return (
    <div className="p-5 bg-white rounded shadow-md space-y-3">
      <div className="flex justify-between">
        <div>
          <h3 className="text-[#303F58] font-bold text-lg">
            {editId ? "Edit" : "Create"} Region
          </h3>
          <p className="text-[11px] text-[#8F99A9] mt-1">
            {editId
              ? "Edit the details of the existing region."
              : "Fill in the details to create a new region."}
          </p>
        </div>
        <p onClick={onClose} className="text-3xl cursor-pointer">
          &times;
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          required
          label="Region Name"
          placeholder="Enter Region Name"
          error={errors.regionName?.message}
          {...register("regionName")}
        />
        {/* <Input
          required
          placeholder="Enter Region Code"
          label="Region Code"
          error={errors.regionCode?.message}
          {...register("regionCode")}
        /> */}
        <Select
          placeholder="Select Country"
          required
          label="Country"
          error={errors.country?.message}
          value={watch("country")}
          onChange={(selectedValue) => {
            // Update the country value and clear the state when country changes
            setValue("country", selectedValue);
            handleInputChange("country");
          }}
          options={countries}
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

export default RegionForm;
