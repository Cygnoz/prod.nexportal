import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../components/form/Input";
import PrefixInput from "../../../components/form/PrefixInput";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CustomPhoneInput from "../../../components/form/CustomPhone";
import Trash from "../../../assets/icons/Trash";
import { useEffect, useRef, useState } from "react";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { LeadData } from "../../../Interfaces/Lead";
import { useRegularApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  editId?:string
  regionId?:any
  areaId?:any
  
};
interface RegionData {
  label: string;
  value: string;
}




const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  email: Yup.string()
    .email("Invalid email format"),
  phone: Yup.string().required("Phone is required"),
  regionId:Yup.string().required('Region is required'),
  areaId:Yup.string().required('Area is required'),
  bdaId:Yup.string().required('Bda is required'),
  leadSource:Yup.string().required('Lead Source is required'),
   project:Yup.string().required('Product name is required'),
});

function TrialForm({ onClose ,editId,regionId,areaId}: Props) {
  const {user}=useUser()
 // const {request:addLead}=useApi('post',3001)
  const {request:editLead}=useApi('put',3001)
  const {request:getLead}=useApi('get',3001)
      const [regionData, setRegionData] = useState<RegionData[]>([]);
      const [areaData, setAreaData] = useState<any[]>([]);
const {setPostLoading}=useResponse()
  const {dropdownRegions,dropDownAreas,dropDownBdas,refreshContext}=useRegularApi()
  const [data, setData] = useState<{
    regions: { label: string; value: string }[];
    areas: { label: string; value: string }[];
    bdas:{ label: string; value: string }[];
  }>({ regions: [], areas: [],bdas:[] });
  
  

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue
  } = useForm<LeadData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      salutation: "Mr.", // Default value for salutation
    },
  });

  const onSubmit: SubmitHandler<LeadData> = async (data, event) => {
    console.log("Submitted data:", data);
  
    event?.preventDefault(); // Prevent default form submission behavior
  
    try {
      setPostLoading(true)
      if (editId) {
        // Call ediLead only if editId exists
        const { response, error } = await editLead(`${endPoints.LEAD}/${editId}`, data);
  
        console.log("Response:", response);
        console.log("Error:", error);
  
        if (response && !error) {
          toast.success(response.data.message); // Show success toast
          onClose(); // Close the form/modal
        } else {
          toast.error(error.response.data.message); // Show error toast
        }
      } else {
        toast.error("Edit ID is missing. Cannot edit the Trail."); // Handle missing editId
      }
    } catch (err) {
      console.error("Error editing Trail data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
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

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click propagation
 
    // Clear the image value
    setValue("image","")
 
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

  const handleInputChange = (field: keyof LeadData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  useEffect(() => {
    // Map the regions into the required format for regions data
    const filteredRegions:any = dropdownRegions?.map((region: any) => ({
      label: region.regionName,
      value: String(region._id), // Ensure `value` is a string
    }));


  setRegionData(filteredRegions)
 if(regionId){
    setValue("regionId",regionId)
    setValue("areaId",areaId)
    
  }
},[dropdownRegions,regionId])


  
   // UseEffect for updating areas based on selected region
   useEffect(() => {
    const filteredAreas = dropDownAreas?.filter(
      (area: any) => area?.region=== watch("regionId")
    );
    const transformedAreas:any = filteredAreas?.map((area: any) => ({
      label: area.areaName,
      value: String(area._id),
    }));
    setAreaData(transformedAreas)
    if(regionId && areaId){
      setValue("regionId",regionId)
      setValue("areaId",areaId)
      }

  
  }, [watch("regionId"), dropDownAreas,areaId,regionId]);
  
console.log(watch("regionId"));


  // UseEffect for updating regions
  useEffect(() => {
    const filteredBDA = dropDownBdas?.filter(
      (bda: any) => bda?.area === watch("areaId")
    );
    const transformedBda:any = filteredBDA?.map((bda: any) => ({
      value: String(bda?._id),
      label: bda?.userName,
    }));

    console.log(transformedBda);
    
    
    // Update the state without using previous `data` state
    setData((prevData:any) => ({
      ...prevData,
      bdas: transformedBda,
    }));
  }, [dropDownBdas,watch("areaId")]);



  
   
  const setFormValues = (data: LeadData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof LeadData, data[key as keyof LeadData]);
    });
    console.log(watch("firstName"));
    
    console.log(watch("areaId"));
    console.log(watch("regionId"));
  };

  const getOneLead = async () => {
    try {
      const { response, error } = await getLead(`${endPoints.LEAD}/${editId}`);
      if (response && !error) {
        const Lead = response.data; // Return the fetched data
        console.log("Fetched Lead data:", Lead);
  
       
  
        setFormValues(Lead);
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error('Error fetching Lead data:', error);
      }
    } catch (err) {
      console.error('Error fetching Lead data:', err);
    }
  };


  useEffect(()=>{
    if(user?.role=="BDA"){
      const filteredBDA:any = dropDownBdas?.find(
        (bda: any) => bda?._id === user?.userId
      );
      setValue("areaId", filteredBDA?.area || "");
        setValue("regionId", filteredBDA?.region || "");
        setValue("bdaId", filteredBDA?._id || "");
        
    }
  },[user,dropDownBdas])
  

  useEffect(() => {
    getOneLead()
    refreshContext({dropdown:true})
  }, [editId,user]);


 
  

  return (
    <div className="px-5 py-3 space-y-6 text-[#4B5C79]">
       <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold text-deepStateBlue ">
            {editId?'Edit':'Create'} Trial
          </h1>
          <p className="text-ashGray text-sm">
          {`Use this form to ${
              editId ? "edit an existing Trail" : "add a new Lead"
            } details. Please fill in the required information`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-12 gap-2"
      >
        <div className="col-span-2 ">
          <label className="cursor-pointer text-center flex justify-center" htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <ImagePlaceHolder uploadedImage={watch("image")} />
          </label>
          {watch('image') && (
        <div
          onClick={handleRemoveImage} // Remove image handler
          className="flex justify-center  items-center"
        >
          <div  className="border-2 cursor-pointer rounded-full h-7 w-7 flex justify-center items-center -ms-2 mt-2">
           <Trash color="red" size={16}/>
          </div>
        </div>
      )}
        </div>
        <div className="col-span-10">
          <div className="grid grid-cols-2 gap-4">
            <PrefixInput
              required
              label="Enter your name"
              selectName="salutation"
              inputName="firstName"
              selectValue={watch("salutation")} // Dynamic select binding
              inputValue={watch("firstName")} // Dynamic input binding
              options={salutation}
              placeholder="Enter your name"
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
              onChange={() => handleInputChange("lastName")}
            />
           <Input

                label="Email Address"
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
                {...register("email")}
                onChange={() => handleInputChange("email")}
              />
            <CustomPhoneInput
              required
              label="Phone Number"
              name="phone"
              error={errors.phone?.message}
              placeholder="Enter phone number"
              value={watch("phone")} // Watch phone field for changes
              onChange={(value) => {
                handleInputChange("phone");
                setValue("phone", value); // Update the value of the phone field in React Hook Form
              }}
            />

            <Input
              label="Website"
              placeholder="Enter Website URL"
              {...register("website")}
            />
            <Select
                required
                label="Lead Source"
                placeholder="Enter Lead Source"
                value={watch("leadSource")}
                onChange={(selectedValue) => {
                  setValue("leadSource", selectedValue);
                  handleInputChange("leadSource");
                }}
                error={errors.leadSource?.message}
                options={[
                  { label: "Social Media", value: "Social Media" },
                  { label: "Website", value: "Website" },
                  { label: "Refferal", value: "Refferal" },
                  { label: "Events", value: "Events" },
                  { label: "Others", value: "Others" },
                ]}
              />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
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
            />
            <Select
            readOnly={areaId || user?.role === "BDA"}
              required
                  label="Select Area"
                  placeholder={watch("regionId")?"Select Area":"Select Region"}
                  value={watch("areaId")}
                  onChange={(selectedValue) => {
                    setValue("areaId", selectedValue); // Manually update the region value
                    setValue("bdaId","")
                    handleInputChange("areaId");
                  }}
                  error={errors.areaId?.message}
                  options={areaData}
            />
            <Select
              readOnly={user?.role=="BDA"?true:false}
              required
                  label="Assigned BDA"
                  placeholder={watch("areaId")?"Select BDA":"Select Area"}
                  value={watch("bdaId")}
                  onChange={(selectedValue) => {
                    setValue("bdaId", selectedValue); // Manually update the region value
                    handleInputChange("bdaId");
                  }}
                  error={errors.bdaId?.message}
                  options={data.bdas}
            />
          </div>
        </div>
        <div className="col-span-12 grid grid-cols-12 gap-4 mt-6">
          
          <div className="col-span-8">
            <Input
              label="Company Name"
              placeholder="Enter Company Name"
              {...register("companyName")}
            />
          </div>
          <div className="col-span-4">
          <CustomPhoneInput
              label="Company Phone"
              name="companyPhone"
              error={errors.companyPhone?.message}
              placeholder="Enter phone number"
              value={watch("companyPhone")} // Watch phone field for changes
              onChange={(value) => {
                handleInputChange("companyPhone");
                setValue("companyPhone", value); // Update the value of the phone field in React Hook Form
              }}
            />
          </div>
          <div className="col-span-8">
            <Input
              label="Company Address"
              placeholder="Enter Company Address"
              {...register("companyAddress")}
            />
          </div>
          <div className="col-span-4">
            <Input
              placeholder="Enter Pin Code"
              label="Pin Code"
              type="number"
              {...register("pinCode")}
            />
          </div>
        </div>
        <div className="col-span-12 flex justify-end gap-2 mt-8">
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

export default TrialForm;
