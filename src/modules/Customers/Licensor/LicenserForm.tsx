import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../components/form/Input";
import PrefixInput from "../../../components/form/PrefixInput";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CustomPhoneInput from "../../../components/form/CustomPhone";
import { LicenserData } from "../../../Interfaces/Licenser";
import useApi from "../../../Hooks/useApi";
import { useEffect, useRef, useState } from "react";
import { useRegularApi } from "../../../context/ApiContext";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import Trash from "../../../assets/icons/Trash";
import { useUser } from "../../../context/UserContext";
import InputPasswordEye from "../../../components/form/InputPasswordEye";
import Modal from "../../../components/modal/Modal";
import AreaForm from "../../Sales R&A/Area/AreaForm";
import RegionForm from "../../Sales R&A/Region/RegionForm";
import BDAForm from "../../SalesTeams/BDA/BDAForm";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  editId?: string;
  regionId?: any
  areaId?: any
};

interface RegionData {
  label: string;
  value: string;
}

const baseSchema ={
  firstName: Yup.string().required("First name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().required("Phone is required"),
 
 
  companyName: Yup.string().required("Company Name  is required"),
  regionId: Yup.string().required("Region is required"),
  areaId: Yup.string().required("Area is required"),
  bdaId: Yup.string().required("Bda is required"),
  startDate: Yup.string().required("StartDate is required"),
  endDate: Yup.string().required("EndDate is required"),
};

const addValidationSchema = Yup.object().shape({
  ...baseSchema,
  password: Yup.string()
  .required("Password is required"),
  confirmPassword: Yup.string()
  .oneOf([Yup.ref("password")], "Passwords must match")
  .required("Confirm Password is required"),
});

const editValidationSchema = Yup.object().shape({
  ...baseSchema,
});
function LicenserForm({ onClose, editId, regionId, areaId }: Props) {

  const { user } = useUser();
  const { request: addLicenser } = useApi("post", 3001);
  const { request: editLicenser } = useApi("put", 3001);
  const { request: getLicenser } = useApi("get", 3001);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);
const {setPostLoading}=useResponse()
  const { dropdownRegions, dropDownAreas, dropDownBdas, allCountries, refreshContext } =
    useRegularApi();
  const [data, setData] = useState<{
    regions: { label: string; value: string }[];
    areas: { label: string; value: string }[];
    bdas: { label: string; value: string }[];
    country: { label: string; value: string }[];
    state: { label: string; value: string }[];
  }>({ regions: [], areas: [], bdas: [], state: [], country: [] });

  // const [isOpenOrg,setIsOpenOrg]=useState(false)
  // const [licenserId,setLicenserId]=useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to format date to "dd-mm-yyyy"
// function formatDate(dateStr: string) {
//   const date = new Date(dateStr);
//   return date.toLocaleDateString("en-GB").split("/").join("-");
// }

// Function to get the first day of the current month
function getFirstDayOfMonth() {
  return new Date().toISOString().split("T")[0];
}

// Function to get the last day of the current month
function getLastDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}


  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
  } = useForm<LicenserData>({
    resolver: yupResolver(editId ? editValidationSchema : addValidationSchema),
    defaultValues: {
      salutation: "Mr.", // Default value for salutation
      startDate: getFirstDayOfMonth(), // Default Start Date
      endDate: getLastDayOfMonth(), // Default End Date
    },
  });

  useEffect(() => {
    const startDate = watch("startDate") || getFirstDayOfMonth();
    const endDate = watch("endDate");

    if (!endDate) {
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setDate(defaultEndDate.getDate() + 30); // Add 30 days

      setValue("endDate", defaultEndDate.toISOString().split("T")[0]);
    }
  }, [watch("startDate")]);

  const [isModalOpen, setIsModalOpen] = useState({

    region: false,
    area:false,
    bda:false
 
  });
  
  const handleModalToggle = ( region = false,area = false,bda = false) => {
    setIsModalOpen((prev) => ({
      ...prev,
      region: region,
      area:area,
      bda:bda
    }));
    refreshContext({dropdown:true})
  };
 


  const onSubmit: SubmitHandler<LicenserData> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission
    console.log("Form Data", data);

    try {
      setPostLoading(true)
      const fun = editId ? editLicenser : addLicenser; // Select function
      let response, error;

      if (editId) {
        ({ response, error } = await fun(
          `${endPoints.LICENSER}/${editId}`,
          data
        ));
      } else {
        ({ response, error } = await fun(endPoints.LICENSER, data));
      }

      console.log("Response:", response);
      console.log("Errors:", error);

      if (response && !error) {
        toast.success(response.data.message);
        onClose()
      } else {
        toast.error(error?.response?.data?.message);
      }
    } catch (err) {
      console.error("Error submitting license data:", err);
      toast.error("An unexpected error occurred.");
    }
    finally{
      setPostLoading(false)
    }
  };

  const salutation = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Ms.", label: "Ms." },
    { value: "Miss.", label: "Miss." },
    { value: "Dr.", label: "Dr." },
  ];
  // console.log(editId)

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click propagation

    // Clear the image value
    setValue("image", "");

    // Reset the file input value
    if (fileInputRef?.current) {
      fileInputRef.current.value = ""; // Clear the input field
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Map the regions into the required format for regions data
    const filteredRegions: any = dropdownRegions?.map((region: any) => ({
      label: region.regionName,
      value: String(region._id), // Ensure `value` is a string
    }));


    setRegionData(filteredRegions)
    if (regionId) {
      setValue("regionId", regionId)
      setValue("areaId", areaId)

    }
  }, [dropdownRegions, regionId])


  // UseEffect for updating areas based on selected region
  useEffect(() => {
    const filteredAreas = dropDownAreas?.filter(
      (area: any) => area?.region === watch("regionId")
    );
    const transformedAreas: any = filteredAreas?.map((area: any) => ({
      label: area.areaName,
      value: String(area._id),
    }));
    setAreaData(transformedAreas)
    if (regionId && areaId) {
      setValue("regionId", regionId)
      setValue("areaId", areaId)
    }


  }, [watch("regionId"), dropDownAreas, areaId, regionId]);



  // UseEffect for updating regions
  useEffect(() => {
    const filteredBDA = dropDownBdas?.filter(
      (bda: any) => bda?.area === watch("areaId")
    );
    const transformedBda: any = filteredBDA?.map((bda: any) => ({
      value: String(bda?._id),
      label: bda?.userName,
    }));

    // Update the state without using previous `data` state
    setData((prevData: any) => ({
      ...prevData,
      bdas: transformedBda,
    }));
  }, [dropDownBdas, watch("areaId")]);

  useEffect(() => {
    if (user?.role == "BDA") {
      const filteredBDA: any = dropDownBdas?.find(
        (bda: any) => bda?._id === user?.userId
      );
      setValue("areaId", filteredBDA?.area || "");
      setValue("regionId", filteredBDA?.region || "");
      setValue("bdaId", filteredBDA?._id || "");

    }
  }, [user, dropDownBdas])

  useEffect(() => {
    const filteredCountries = allCountries?.map((items: any) => ({
      label: items.name,
      value: String(items.name), // Ensure `value` is a string
    }));
    setData((prevData: any) => ({ ...prevData, country: filteredCountries }));
  }, [allCountries]);

  // // Effect to fetch and populate states based on selected country
  useEffect(() => {
    const selectedCountry = watch("country");
    if (selectedCountry) {
      const filteredStates = allCountries.filter(
        (country: any) => country.name === selectedCountry
      );

      const transformedStates = filteredStates.flatMap((country: any) =>
        country.states.map((states: any) => ({
          label: states,
          value: states,
        }))
      );
      setData((prevData: any) => ({ ...prevData, state: transformedStates }));
    }
  }, [watch("country"), allCountries]);

  const setFormValues = (data: LicenserData) => {
    console.log(data);

    Object.keys(data).forEach((key) => {
      setValue(key as keyof LicenserData, data[key as keyof LicenserData]);
    });
  };

  const getOneLicenser = async () => {
    try {
      const { response, error } = await getLicenser(
        `${endPoints.LICENSER}/${editId}`
      );
      if (response && !error) {
        const Licenser = response.data; // Return the fetched data
        console.log("Fetched Licenser data:", Licenser);
        const { licensers, ...filteredLicencers } = Licenser;
      //  console.log("sss",filteredLicencers);
        setFormValues(filteredLicencers);
        
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Lead data:", error);
      }
    } catch (err) {
      console.error("Error fetching Lead data:", err);
    }
  };


  
  useEffect(() => {
    getOneLicenser();
    refreshContext({ dropdown: true, countries: true })
    
  }, [editId]);

  const handleInputChange = (field: keyof LicenserData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

//   const startDate = watch("startDate") || new Date().toISOString().split("T")[0]; 
// const endDate = new Date(startDate);
// endDate.setDate(endDate.getDate() + 30); 

  return (
    <>
      <div className="px-5 py-3 bg-white rounded shadow-md">
       

        <div className="flex justify-between items-center mb-4 flex-wrap">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg sm:text-lg md:text-lg">
            {editId ? "Edit" : "Create"} Licenser
            </h3>
            <p className="text-ashGray text-sm hidden sm:block">
            {editId
                ? "Edit the details of the Licenser."
                : "Fill in the details to create a new Licenser."}
          </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900 mt-2 sm:mt-0"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-2 mt-3"
        >
         <div className="col-span-12 sm:col-span-2 flex flex-col items-center">
                  <label
                    className="cursor-pointer text-center"
                    htmlFor="file-upload"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    //   onChange={(e) => handleFileUpload(e)}
                    />
                   <ImagePlaceHolder uploadedImage={watch("image")} />
          </label>
          {watch('image') && (
                    <div
                      onClick={handleRemoveImage} // Remove image handler
                      className="flex "
                    >
                      <div className="border-2 cursor-pointer rounded-full h-7 w-7 flex justify-center items-center -ms-2 mt-2">
                        <Trash color="red" size={16} />
                      </div>
                    </div>
                  )}
                </div>
          <div className="col-span-12 sm:col-span-10">
            <div className="grid sm:grid-cols-3 col-span-12 gap-2">
              <PrefixInput
                required
                label="First Name"
                selectName="salutation"
                inputName="firstName"
                selectValue={watch("salutation")} // Dynamic select binding
                inputValue={watch("firstName")} // Dynamic input binding
                options={salutation}
                placeholder="Enter First Name"
                error={errors.firstName?.message} // Display error message if any
                onSelectChange={(e) => setValue("salutation", e.target.value)} // Update salutation value
                onInputChange={(e) => {
                  clearErrors("firstName"); // Clear error for input field
                  setValue("firstName", e.target.value); // Update firstName value
                }}
              />

              <Input
                label="Last Name"
                placeholder="Enter Last Name"
                error={errors.lastName?.message}
                {...register("lastName")}
              // onChange={() => handleInputChange("lastName")}
              />
              <CustomPhoneInput
                required
                label="Phone"
                name="phone"
                error={errors.phone?.message}
                placeholder="Enter Phone No"
                value={watch("phone")} // Watch phone field for changes
                onChange={(value) => {
                  handleInputChange("phone");
                  setValue("phone", value); // Update the value of the phone field in React Hook Form
                }}
              />
              </div>
               <div className={`grid ${editId?'sm:grid-cols-2 col-span-12':'sm:grid-cols-3 col-span-12'}  gap-2 mt-4`}>
              <Input
                required
                label="Email"
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
                {...register("email")}
              // onChange={() => handleInputChange("email")}
              />
              {editId ? (

                <InputPasswordEye
                  label="Change Password"
                 
                  placeholder="Enter Password"
                  error={errors?.password?.message}
                  {...register("password")}

                />
              ) : (

                <>
                  <InputPasswordEye
                    label="Password"
                    required
                    placeholder="Enter Password"
                    error={errors?.password?.message}
                    {...register("password")}
                  />
                  <InputPasswordEye
                    label="Confirm Password"
                    required
                    placeholder="Enter Password"
                    error={errors?.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </>
              )}
              
            </div>
        
            <div className="grid sm:grid-cols-3 col-span-12 gap-4 mt-4">
              <Select
                placeholder="Select Country"
                label="Country"
                error={errors.country?.message}
                value={watch("country")}
                onChange={(selectedValue) => {
                  // Update the country value and clear the state when country changes
                  setValue("country", selectedValue);
                  handleInputChange("country");
                  setValue("state", ""); // Reset state when country changes
                }}
                options={data.country}
              />
              <Select
                placeholder={
                  data.state.length === 0 ? "Choose Country" : "Select State"
                }
                value={watch("state")}
                onChange={(selectedValue) => {
                  setValue("state", selectedValue);
                  handleInputChange("state");
                }}
                label="State"
                error={errors.state?.message}
                options={data.state}
              />
              <Input
                label="City"
                placeholder="Enter City Name"
                error={errors.city?.message}
                {...register("city")}
              />
            </div>



             
             
          
           
            <div className="grid sm:grid-cols-2 col-span-12 gap-4 mt-4">
              

              

              <Input
                label="Address"
                placeholder="Address"
                error={errors.address?.message}
                {...register("address")}
              />
              
               <Input
                label="Company Name"
                required
                placeholder="Enter Company Name"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
            </div>
           
           {!editId &&<div className="grid sm:grid-cols-2 col-span-12 gap-4 my-4">
              <Input
                required
                label="Start Date"
                type="date"
                placeholder="Select Start Date"
                error={errors.startDate?.message}
                {...register("startDate")}
                value={
                  watch("startDate")
                    ? watch("startDate")
                    : new Date().toISOString().split("T")[0]
                } // Sets current date as defau
              />
              <Input
                required
                label="End Date"
                type="date"
                placeholder="Select End Date"
                error={errors.endDate?.message}
                {...register("endDate")}
              />
              
            </div>
}
            
           
              
              <div className=" gap-3 grid sm:grid-cols-3 col-span-12 my-4">
              <Select
                  readOnly={regionId || user?.role === "BDA"}

                  required
                  placeholder="Select Region"
                  label="Select Region"
                  value={watch("regionId")}
                  onChange={(selectedValue) => {
                    setValue("regionId", selectedValue); // Manually update the region value
                    handleInputChange("regionId");
                    setValue("areaId", "");
                    setValue("bdaId", "");
                  }}
                  error={errors.regionId?.message}
                  options={regionData}
                  addButtonLabel="Add Region"
                  addButtonFunction={handleModalToggle}
                  totalParams={1}
                  paramsPosition={1}
                />
                <Select
                  readOnly={areaId || user?.role === "BDA"}
                  required
                  label="Select Area"
                  placeholder={
                    watch("regionId") ? "Select Area" : "Select Region"
                  }
                  value={watch("areaId")}
                  onChange={(selectedValue) => {
                    setValue("areaId", selectedValue); // Manually update the region value
                    setValue("bdaId", "");
                    handleInputChange("areaId");
                  }}
                  error={errors.areaId?.message}
                  options={areaData}
                  addButtonLabel="Add Area"
                  addButtonFunction={handleModalToggle}
                  totalParams={2}
                  paramsPosition={2}
                />
                <Select
                  readOnly={user?.role == "BDA" ? true : false}
                  required
                  label="Assigned BDA"
                  placeholder={watch("areaId") ? "Select BDA" : "Select Area"}
                  value={watch("bdaId")}
                  onChange={(selectedValue) => {
                    setValue("bdaId", selectedValue); // Manually update the region value
                    handleInputChange("bdaId");
                  }}
                  error={errors.bdaId?.message}
                  options={data.bdas}
                  addButtonLabel="Add BDA"
                  addButtonFunction={handleModalToggle}
                  totalParams={3}
                  paramsPosition={3}
                />
     
            </div>
            <div className="bottom-0 left-0 w-full pt-3 ps-2  bg-white flex gap-2 justify-end">
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
          </div>
        </form>
      </div>
      <Modal open={isModalOpen.area} onClose={()=>handleModalToggle()} className="w-[35%] max-sm:w-[90%] max-md:w-[70%] ">
        <AreaForm  onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.region} onClose={()=>handleModalToggle()}className="w-[35%] max-sm:w-[90%] max-md:w-[70%] ">
        <RegionForm  onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.bda} onClose={()=>handleModalToggle()} className="w-[70%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]   max-sm:overflow-auto">
        <BDAForm  onClose={()=>handleModalToggle()} />
      </Modal>
    </>
  );
}

export default LicenserForm;
