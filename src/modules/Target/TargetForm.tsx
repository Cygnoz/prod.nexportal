import { useEffect, useState } from "react";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { months, years } from "../../components/list/MonthYearList";
import Button from "../../components/ui/Button";
import { useRegularApi } from "../../context/ApiContext";
import useApi from "../../Hooks/useApi";
import { TargetData } from "../../Interfaces/Target";
import { endPoints } from "../../services/apiEndpoints";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useResponse } from "../../context/ResponseContext";
type Props = {
  onClose: () => void;
  type: "Region" | "Area" | "BDA";
  editId?: string;

};

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

const getValidationSchema = (type: string) => {
  return Yup.object().shape({
    month: Yup.string().required("Month is required"),
    year: Yup.string().required("Year is required"),
    target: Yup.number()
      .typeError("Target must be a number")
      .required("Target is required"),

    region: Yup.string().when([], (__, schema) =>
      type === "Region" ? schema.required("Region is required") : schema.notRequired()
    ),

    area: Yup.string().when([], (__, schema) =>
      type === "Area" ? schema.required("Area is required") : schema.notRequired()
    ),

    bda: Yup.string().when([], (__, schema) =>
      type === "BDA" ? schema.required("BDA is required") : schema.notRequired()
    ),
  });
};



const TargetForm = ({ onClose, type, editId }: Props) => {
  const { request: addTarget } = useApi('post', 3004)
  const { request: editTarget } = useApi("put", 3004);
  const { request: getTarget } = useApi('get', 3004)
  const { dropdownRegions, dropDownAreas, dropDownBdas, refreshContext } = useRegularApi();
  const [data, setData] = useState<{
    regions: { label: string; value: string }[];
    areas: { label: string; value: string }[];
    bdas: { label: string; value: string }[];
  }>({ regions: [], areas: [], bdas: [] });

const {setPostLoading}=useResponse()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
    setValue,
  } = useForm<TargetData>({
    resolver: yupResolver(getValidationSchema(type)),
    context: { type }, // Pass `type` for conditional validation
    // defaultValues: {
    //   year: String(currentYear),
    //   month: currentMonth,
    // },
  });


  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const { response, error } = await getTarget(`${endPoints.TARGET}/${editId}`);
          if (response && !error) {
            const target = response.data.target;
            setValue("month", target.month);
            setValue("year", target.year);
            setValue("target", target.target);
            if (type === "Region") {
              setValue("region", target.region?._id);
            } else if (type === "Area") {
              setValue("area", target.area?._id);
            } else if (type === "BDA") {
              setValue("bda", target.bda?._id);
            }

          } else {
            toast.error(error?.response?.data?.message || "Failed to fetch target data");
          }
        } catch (err) {
          console.error("Error fetching Target data:", err);
          toast.error("An unexpected error occurred.");
        }
      })();
    }
  }, [editId, type]);

  useEffect(() => {
    setValue("year", String(currentYear));
    setValue("month", currentMonth);
  }, [setValue]);

  // UseEffect for updating regions
  useEffect(() => {
    const filteredRegions = dropdownRegions?.map((region: any) => ({
      value: String(region._id),
      label: region.regionName,
    }));
    // Update the state without using previous `data` state
    setData((prevData: any) => ({
      ...prevData,
      regions: filteredRegions,
    }));
  }, [dropdownRegions]);


  // useEffect for updating areas
  useEffect(() => {
    let filteredAreas: any = [];
    const staffLocalityId = sessionStorage.getItem("staffLocalityId")
    if (staffLocalityId) {
      filteredAreas = dropDownAreas
        ?.filter((area: any) => area?.region === staffLocalityId) // Ensure region exists
        .map((area: any) => ({
          value: String(area?._id),
          label: area.areaName,
        }));
    } else {
      filteredAreas = dropDownAreas?.map((area: any) => ({
        value: String(area?._id),
        label: area.areaName,
      })) || [];
    }

    setData((prevData: any) => ({
      ...prevData,
      areas: filteredAreas,
    }));
  }, [dropDownAreas]);


  console.log("stafd", dropDownAreas);



  // useEffect for updating BDAs
  useEffect(() => {
    let filteredBdas: any = [];
    const staffLocalityId = sessionStorage.getItem("staffLocalityId")
    if (staffLocalityId) {
      filteredBdas = dropDownBdas
        ?.filter((bda: any) => bda?.area === staffLocalityId) // Ensure region exists
        .map((bda: any) => ({
          value: String(bda?._id),
          label: bda?.userName,
        }));
    } else {
      filteredBdas = dropDownBdas?.map((bda: any) => ({
        value: String(bda?._id),
        label: bda?.userName,
      }));
    }

    setData((prevData: any) => ({
      ...prevData,
      bdas: filteredBdas,
    }));
  }, [dropDownBdas]);



  useEffect(() => {
    setValue("targetType", type)
    refreshContext({ dropdown: true })
  }, []);





  const onSubmit: SubmitHandler<TargetData> = async (data, event) => {
    event?.preventDefault();
    console.log("Submitting Data:", data);

    try {
      setPostLoading(true)
      const apiCall = editId ? editTarget : addTarget; // Choose API based on editId existence
      const { response, error } = await apiCall(
        editId ? `${endPoints.TARGET}/${editId}` : endPoints.TARGET,
        data
      );

      // console.log("API URL:", editId ? `${endPoints.TARGET}/${editId}` : endPoints.TARGET);

      if (response && !error) {
        //console.log("Response Data:", response.data);
        toast.success(response.data.message); // Show success message
        onClose(); // Close the form after success
      } else {
        console.log("API Error:", error);
        toast.error(error?.response?.data?.error || "Failed to submit data");
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      toast.error("An unexpected error occurred.");
    }
    finally{
      setPostLoading(false)
    }
  };


  const handleInputChange = (field: keyof TargetData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  return (
    <div className="p-2">
      <div className="flex justify-between p-2">
        <h3 className="text-[#303F58] font-bold text-lg">
          {editId ? "Edit" : "Create"} Target For {type}
        </h3>
        <p onClick={onClose} className="text-3xl cursor-pointer">
          &times;
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-2">
            <div className="mx-3 gap-4 space-y-2 max-w-2xl">
              {/* Conditionally render the Select component based on the type */}
              {type === "Region" && (
                <Select
                  required
                  label="Region"
                  options={data.regions}
                  placeholder="Select Region"
                  error={errors.region?.message}

                  {...register("region")}
                  value={watch("region")}
                  onChange={(selectedValue) => {
                    // Update the country value and clear the state when country changes
                    setValue("region", selectedValue);
                    handleInputChange("region");
                  }}
                />
              )}

              {type === "Area" && (
                <Select
                  required
                  label="Area"
                  options={data.areas}
                  placeholder="Select Area"
                  error={errors.area?.message}
                  {...register("area")}
                  value={watch("area")}
                  onChange={(selectedValue) => {
                    // Update the country value and clear the state when country changes
                    setValue("area", selectedValue);
                    handleInputChange("area");
                  }}
                />
              )}

              {type === "BDA" && (
                <Select
                  required
                  label="BDA"
                  options={data.bdas}
                  placeholder="Select BDA"
                  error={errors.bda?.message}
                  {...register("bda")}
                  value={watch("bda")}
                  onChange={(selectedValue) => {
                    // Update the country value and clear the state when country changes
                    setValue("bda", selectedValue);
                    handleInputChange("bda");
                  }}
                />
              )}

              {/* Common fields for all types */}
              <Select
                required
                label="Month"
                options={months}
                placeholder="Select Month"
                error={errors.month?.message}
                {...register("month")}
                value={watch("month") || currentMonth}
                onChange={(selectedValue) => {
                  setValue("month", selectedValue);
                  clearErrors("month");
                }}
              />
              <Select
                required
                label="Year"
                options={years}
                placeholder="Select Year"
                error={errors.year?.message}
                {...register("year")}
                value={watch("year") || String(currentYear)}
                onChange={(selectedValue) => {
                  setValue("year", selectedValue);
                  clearErrors("year");
                }}
              />
              <Input
                required
                label="Target"
                type="number"
                placeholder="Enter target"
                error={errors.target?.message}
                {...register("target")}
              />
            </div>
          </div>


          <div className="flex justify-end gap-2 mt-3 pb-2 me-3">
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
    </div>
  );
};

export default TargetForm;