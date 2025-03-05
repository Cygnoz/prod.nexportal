import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CheckIcon from "../../../assets/icons/CheckIcon";
import DownloadIcon from "../../../assets/icons/DownloadIcon";
import Files from "../../../assets/icons/Files";
import PlusCircle from "../../../assets/icons/PlusCircle";
import Trash from "../../../assets/icons/Trash";
// import ViewIcon from "../../../assets/icons/ViewIcon";
// import bcardback from "../../../assets/image/Business-card-back.png";
// import bcardfront from "../../../assets/image/Business-card-front.png";
// import idcard from "../../../assets/image/ID-card 1.png";
import CustomPhoneInput from "../../../components/form/CustomPhone";
import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import useApi from "../../../Hooks/useApi";
import { BDAData } from "../../../Interfaces/BDA";
import { endPoints } from "../../../services/apiEndpoints";
import { useRegularApi } from "../../../context/ApiContext";
import InputPasswordEye from "../../../components/form/InputPasswordEye";
import { StaffTabsList } from "../../../components/list/StaffTabsList";
import Modal from "../../../components/modal/Modal";
// import AMViewBCard from "../../../components/modal/IdCardView/AMViewBCard";
// import AMIdCardView from "../../../components/modal/IdCardView/AMIdCardView";
import IdBcardModal from "../../../components/modal/IdBcardModal";
import AreaForm from "../../Sales R&A/Area/AreaForm";
import RegionForm from "../../Sales R&A/Region/RegionForm";
import WCommissionForm from "../../Users/WorkerCommision/WCommissionForm";

interface BDAProps {
  onClose: () => void; // Prop for handling modal close
  editId?: string;
  regionId?: any
  areaId?: any

}
interface RegionData {
  label: string;
  value: string;
}


const baseSchema = {
  userName: Yup.string().required("Full name is required"),
  phoneNo: Yup.string()
    .matches(/^\d+$/, "Phone number must contain only digits")
    .required("Phone number is required"),
  workEmail: Yup.string().email("Invalid work email"),
  personalEmail: Yup.string().email("Invalid personal email"),
  age: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  region: Yup.string().required("Region is required"),
  area: Yup.string().required("Area is required"),
  salaryAmount: Yup.string().required("Salary Amount is required"),
  address: Yup.object().shape({
    street1: Yup.string().required("Street 1 is required"),
    street2: Yup.string(), // Optional field
  }),

};

const addValidationSchema = Yup.object().shape({
  ...baseSchema,
  email: Yup.string().required("Email required").email("Invalid email"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const editValidationSchema = Yup.object().shape({
  ...baseSchema,
});

const BDAForm: React.FC<BDAProps> = ({ onClose, editId, regionId, areaId }) => {
  const { dropDownAreas, dropdownRegions, dropDownWC, allCountries,refreshContext } = useRegularApi();
  const { request: addBDA } = useApi("post", 3002);
  const { request: editBDA } = useApi("put", 3002);
  const { request: getBDA } = useApi("get", 3002);
  const [submit, setSubmit] = useState(false);

  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);

  const [data, setData] = useState<{
    regions: { label: string; value: string }[];
    areas: { label: string; value: string }[];
    wc: { label: string; value: string }[];
    country: { label: string; value: string }[];
    state: { label: string; value: string }[];
  }>({ regions: [], areas: [], wc: [], country: [], state: [] });
  // State to manage modal visibility
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<BDAData>({
    resolver: yupResolver(editId ? editValidationSchema : addValidationSchema),
  });
  const { request: checkBda } = useApi("put", 3002)

  const [empId,setEmpId]=useState('')
  const [isModalOpen, setIsModalOpen] = useState({
    idCard: false,
    region: false,
    area:false,
    commission: false
  });
  
  const handleModalToggle = (idCard = false, region = false,area = false,commission = false) => {
    setIsModalOpen((prev) => ({
      ...prev,
      idCard: idCard,
      region: region,
      area:area,
      commission: commission,
   
    }));
    refreshContext({dropdown:true})
  };
 

  const [staffData, setStaffData] = useState<any>(null);
  const onSubmit: SubmitHandler<BDAData> = async (data, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    if (submit) {
      try {
        const fun = editId ? editBDA : addBDA; // Select the appropriate function based on editId
        let response, error;

        if (editId) {
          // Call editBDA if editId exists
          ({ response, error } = await fun(`${endPoints.BDA}/${editId}`, data));
        } else {
          // Call addBDA if editId does not exist
          ({ response, error } = await fun(endPoints.BDA, data));
        }

        console.log("Response:", response);
        console.log("Error:", error);

        if (response && !error) {
          const {employeeId,region}=response.data
          const  staffDetails={
            ...watch(),
            regionName:region?.regionName,
            employeeId:editId?empId:employeeId
          }
          // staffData=response.data
          setStaffData(staffDetails)
          toast.success(response.data.message); // Show success toast
          handleModalToggle(true,false,false,false)
        } else {
          toast.error(error.response.data.message); // Show error toast
        }
      } catch (err) {
        console.error("Error submitting BDA data:", err);
        toast.error("An unexpected error occurred."); // Handle unexpected errors
      }
    }
  };

  const checkBDA = async () => {
    const region = watch("region");
    const area = watch("area");

    // Ensure values are defined
    if (!region && !area) return false;
    try {
      const body = {
        regionId: watch("region"),
        areaId: watch("area")
      }
      const { response, error } = await checkBda(endPoints.CHECK_BDA, body)
      console.log("res", response);
      console.log("err", error);


      if (response && !error) {
        return true
      } else {

        if (
          toast.error(error.response.data.message == 'Internal server error' ? 'Select region or area' : error.response.data.message)
        )

          if (error?.response?.data?.message === "Area Manager not found for the provided area." || "Region Manager not found for the provided region.") {
            return false
          } else {
            return true
          }
      }
    } catch (err) {
      console.log(err);

    }
  }

  const tabs = [
    "Personal Information",
    "Company Information",
    "Upload Files",
    "Bank Information",
    // "ID & Business Card",
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  const handleNext = async (tab: string) => {
    const currentIndex = tabs.indexOf(activeTab);
    let fieldsToValidate: any[] = [];
    let canProceed = true;

    if (tab === "Personal Information") {
      fieldsToValidate = ["userName", "phoneNo", "personalEmail", "address.street1"];
    } else if (tab === "Company Information") {
      fieldsToValidate = [
        ...(editId ? [] : ["email", "password", "confirmPassword"]),
        "region",
        "area",
        "workEmail",
        "salaryAmount"
      ];


      const amCheck = await checkBDA(); // Call checkAM function

      if (!amCheck && (watch("region") || watch("area"))) {
        canProceed = false;
      }

    }

    // Validate fields only if canProceed is true
    if (canProceed && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);

      // If validation fails, stop here
      if (!isValid) {

        return;
      }
    }

    // If validation passes and we can proceed, move to the next tab
    if (canProceed && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      clearErrors();
    }
  };
  const handleBack = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
    setSubmit(false);
  };
  const handleInputChange = (field: keyof BDAData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

  // // UseEffect for updating regions
  // useEffect(() => {
  //   const filteredRegions = dropdownRegions?.map((region: any) => ({
  //     value: String(region._id),
  //     label: region.regionName,
  //   }));
  //   // Update the state without using previous `data` state
  //   setData((prevData: any) => ({
  //     ...prevData,
  //     regions: filteredRegions,
  //   }));
  // }, [dropdownRegions]);

  useEffect(() => {
    // Map the regions into the required format for regions data
    const filteredRegions: any = dropdownRegions?.map((region: any) => ({
      label: region.regionName,
      value: String(region._id), // Ensure `value` is a string
    }));


    setRegionData(filteredRegions)
    if (regionId) {
      setValue("region", regionId)
      setValue("area", areaId)

    }
  }, [dropdownRegions, regionId])

  // UseEffect for updating areas based on selected region
  useEffect(() => {
    const filteredAreas = dropDownAreas?.filter(
      (area: any) => area?.region === watch("region")
    );
    const transformedAreas: any = filteredAreas?.map((area: any) => ({
      label: area.areaName,
      value: String(area._id),
    }));
    setAreaData(transformedAreas)
    if (regionId && areaId) {
      setValue("region", regionId)
      setValue("area", areaId)
    }


  }, [watch("region"), dropDownAreas, areaId, regionId]);

  console.log(watch("region"));

  // UseEffect for updating wc
  useEffect(() => {
    const filteredCommission = dropDownWC?.map((commission: any) => ({
      label: commission.profileName,
      value: String(commission._id),
    }));

    // Update wc
    setData((prevData: any) => ({
      ...prevData,
      wc: filteredCommission,
    }));
  }, [dropDownWC]);

  // UseEffect for updating countries
  useEffect(() => {
    const filteredCountry = allCountries?.map((country: any) => ({
      label: country.name,
      value: country.name,
    }));

    // Update country
    setData((prevData: any) => ({
      ...prevData,
      country: filteredCountry,
    }));
  }, [allCountries]);

  useEffect(() => {
    const filteredState = allCountries
      .filter((country: any) => country.name === watch("country"))
      .map((country: any) => country.states)
      .flat();
    const transformedState = filteredState.map((state: any) => ({
      label: state,
      value: String(state),
    }));

    // Update areas
    setData((prevData: any) => ({
      ...prevData,
      state: transformedState,
    }));
  }, [watch("country")]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue("userImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click propagation

    // Clear the leadImage value
    setValue("userImage", "");
  };

  const setFormValues = (data: BDAData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof BDAData, data[key as keyof BDAData]);
    });
  };

  const getOneBDA = async () => {
    try {
      const { response, error } = await getBDA(`${endPoints.BDA}/${editId}`);
      if (response && !error) {
        const BDA = response.data; // Return the fetched data
        console.log("Fetched BDA data:", BDA);
        setEmpId(BDA.user?.employeeId)
        const { user, _id, ...bda } = BDA;

        const transformedBDA = BDA
          ? {
            ...bda,
            dateOfJoining: new Date(BDA.dateOfJoining)
              .toISOString()
              .split("T")[0], // Format as 'YYYY-MM-DD'
            userName: user?.userName,
            phoneNo: user?.phoneNo,
            email: user?.email,
            userImage: user?.userImage,
            region: BDA.region?._id,
            area: BDA.area?._id,
            commission: BDA.commission?._id,
            employeeId:BDA?.employeeId
          }
          : null;

        console.log("Transformed BDA data:", transformedBDA);

        setFormValues(transformedBDA);
        // setStaffData(transformedBDA)
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching BDA data:", error);
      }
    } catch (err) {
      console.error("Error fetching BDA data:", err);
    }
  };

  useEffect(() => {
    getOneBDA();
    refreshContext({dropdown:true})
  }, [editId]); // Trigger the effect when editId changes

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0 && activeTab == "Bank Information") {
      // Get the first error field
      let firstErrorField = Object.keys(errors)[0];
      if (errors.address?.street1) {
        firstErrorField = "address.street1";
      }
      // Find the tab containing this field
      const tabIndex: any = StaffTabsList.findIndex((tab) =>
        tab.validationField.includes(firstErrorField)
      );

      // If a matching tab is found, switch to it
      if (tabIndex >= 0) {
        setActiveTab(tabs[tabIndex]);
      }
      const errorrs: any = errors
      // Log all errors
      Object.keys(errorrs).forEach((field) => {
        console.log(`${field}: ${errorrs[field]?.message}`);
      });

      // Show the first error message in a toast
      if (errorrs["address"] && errorrs["address"].street1) {
        toast.error(errorrs["address"].street1.message);
      } else if (firstErrorField) {
        toast.error(errorrs[firstErrorField]?.message);
      }
    }
  }, [errors]);

  return (
    <>
      <div className="p-5 bg-white rounded shadow-md">
        {/* Close button */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold text-deepStateBlue ">
              {editId ? "Edit" : "Create"} BDA
            </h1>
            <p className="text-ashGray text-sm">
              {`Use this form to ${editId ? "edit an existing BDA" : "add a new BDA"
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

        <div className="flex gap-8 items-center justify-center text-base font-bold my-5">
          {tabs.map((tab, index) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer py-3 px-[16px] ${activeTab === tab
                  ? "text-deepStateBlue border-b-2 border-secondary2"
                  : "text-gray-600"
                }`}
            >
              <p>
                {index < tabs.indexOf(activeTab) ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckIcon /> {tab}
                  </div>
                ) : (
                  tab
                )}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="transition-all duration-300"
            style={{ minHeight: "450px" }}
          >
            {activeTab === "Personal Information" && (
              <div className="grid grid-cols-12">
                <div className="col-span-2 flex flex-col items-center">
                  <label
                    className="cursor-pointer text-center"
                    htmlFor="file-upload"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <ImagePlaceHolder uploadedImage={watch("userImage")} />
                  </label>
                  {watch("userImage") && (
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

                <div className="grid grid-cols-2 gap-2 col-span-10">
                  <Input
                    required
                    placeholder="Enter Full Name"
                    value={watch("userName")}
                    label="Full Name"
                    error={errors.userName?.message}
                    onChange={(e) => {
                      handleInputChange("userName")
                      setValue("userName", e.target.value)
                    }}
                  />
                  <Input
                    placeholder="Enter Email Address"
                    label="Email Address"
                    error={errors.personalEmail?.message}
                    value={watch("personalEmail")}
                    onChange={(e) => {
                      setValue("personalEmail", e.target.value)
                      handleInputChange("personalEmail")
                    }}
                  />
                  <CustomPhoneInput
                    required
                    placeholder="Phone"
                    label="Phone"
                    error={errors.phoneNo?.message}
                    value={watch("phoneNo")} // Watch phone field for changes
                    onChange={(value) => {
                      handleInputChange("phoneNo");
                      setValue("phoneNo", value); // Update the value of the phone field in React Hook Form
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Enter Age"
                      label="Age"
                      type="number"
                      error={errors.age?.message}
                      {...register("age")}
                    />

                    <Input
                      label="Blood Group"
                      placeholder="Enter Blood Group"
                      error={errors.bloodGroup?.message}
                      {...register("bloodGroup")}
                    />
                  </div>
                  <Input
                    required
                    label="Address"
                    placeholder="Street 1"
                    error={errors.address?.street1?.message}
                    {...register("address.street1")}
                  />
                  <Input
                    label="Address"
                    placeholder="Street 2"
                    error={errors.address?.street2?.message}
                    {...register("address.street2")}
                  />
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
                    placeholder="Enter City"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                  <Input
                    label="Aadhaar No"
                    type="text"
                    placeholder="Enter Aadhaar Number"
                    {...register("adhaarNo", {
                      required: "Aadhaar number is required",
                      pattern: {
                        value: /^[0-9]{12}$/, 
                        message: "Aadhaar number must be exactly 12 digits",
                      },
                    })}

                    maxLength={12} // Restrict input length to 12 digits
                    onChange={(e) => {
                      const filteredValue = e.target.value.replace(/\D/g, ""); 
                      setValue("adhaarNo", filteredValue, { shouldValidate: true });
                    }}
                  />
                  <Input
                    label="PAN No"
                    type="text"
                    placeholder="Enter PAN Number"
                    {...register("panNo", {
                      required: "PAN number is required",
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN format (e.g., ABCDE1234F)",
                      },
                      validate: (value: any) => {
                        if (/[^A-Z0-9]/.test(value)) {
                          return "Special characters are not allowed!";
                        }
                        return true;
                      },
                    })}

                    maxLength={10} 
                    onChange={(e) => {
                      const filteredValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); 
                      setValue("panNo", filteredValue, { shouldValidate: true });
                    }}
                  />

                  <Input
                    type="date"
                    label="Date of Joining"
                    error={errors.dateOfJoining?.message}
                    {...register("dateOfJoining")}
                    value={
                      watch("dateOfJoining")
                        ? watch("dateOfJoining")
                        : new Date().toISOString().split("T")[0]
                    } // Sets current date as default
                  />
                </div>
              </div>
            )}

            {activeTab === "Company Information" && (
              <div>
                {!editId && (
                  <>
                    <p className="my-4 text-[#303F58] text-sm font-semibold">
                      {editId ? "Edit" : "Set"} Login Credential
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
                      <Input
                        required
                        placeholder="Enter Email"
                        label="Email"
                        value={watch("email")}
                        error={errors.email?.message}
                        onChange={(e) => {
                          handleInputChange("email")
                          setValue("email", e.target.value)
                        }}
                      />
                      <InputPasswordEye
                        label={editId ? "New Password" : "Password"}
                        required
                        value={watch("password")}
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        onChange={(e) => {
                          handleInputChange("password")
                          setValue("password", e.target.value)
                        }}
                      />
                      <InputPasswordEye
                        label="Confirm Password"
                        required
                        value={watch("confirmPassword")}
                        placeholder="Confirm your password"
                        error={errors.confirmPassword?.message}
                        onChange={(e) => {
                          handleInputChange("confirmPassword")
                          setValue("confirmPassword", e.target.value)
                        }}
                      />
                    </div>
                  </>
                )}
                <hr className="" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    placeholder="Enter Work Email"
                    label="Work Email"
                    error={errors.workEmail?.message}
                    value={watch("workEmail")}
                    onChange={(e) => {
                      setValue("workEmail", e.target.value)
                      handleInputChange("workEmail")
                    }}
                  />
                  <CustomPhoneInput
                    placeholder="Phone"
                    label="Work phone"
                    error={errors.workPhone?.message}
                    value={watch("workPhone")} // Watch phone field for changes
                    onChange={(value) => {
                      handleInputChange("workPhone");
                      setValue("workPhone", value); // Update the value of the phone field in React Hook Form
                    }}
                  />
                  <Select
                    required
                    placeholder="Select Region"
                    readOnly={regionId ? true : false}
                    label="Select Region"
                    value={watch("region")}
                    onChange={(selectedValue) => {
                      setValue("region", selectedValue); // Manually update the region value
                      handleInputChange("region");
                      setValue("area", "");
                    }}
                    error={errors.region?.message}
                    options={regionData}
                    addButtonLabel="Add Region"
                    addButtonFunction={handleModalToggle}
                    totalParams={2}
                    paramsPosition={2}
                  />
                  <Select
                    required
                    label="Select Area"
                    readOnly={areaId ? true : false}
                    placeholder={
                      areaData.length === 0
                        ? watch("region")?.length > 0
                          ? "No Area Found"
                          : "Select Region"
                        : "Select Area"
                    }
                    value={watch("area")}
                    onChange={(selectedValue) => {
                      setValue("area", selectedValue); // Manually update the region value
                      handleInputChange("area");
                    }}
                    error={errors.area?.message}
                    options={areaData}
                    addButtonLabel="Add Area"
                    addButtonFunction={handleModalToggle}
                    totalParams={3}
                    paramsPosition={3}
                  />
                  <Select
                    label="Choose Commission Profile"
                    placeholder="Commission Profile"
                    value={watch("commission")}
                    onChange={(selectedValue) => {
                      setValue("commission", selectedValue); // Manually update the commission value
                      handleInputChange("commission");
                    }}
                    error={errors.commission?.message}
                    options={data.wc}
                    addButtonLabel="Add Commission"
                    addButtonFunction={handleModalToggle}
                    totalParams={4}
                    paramsPosition={4}
                  />
                  <Input
                    placeholder="Enter Amount"
                    label="Salary Amount"
                    type="number"
                    error={errors.salaryAmount?.message}
                    {...register("salaryAmount")}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === "Upload Files" && (
              <div>
                <h6 className="font-bold text-sm text-[#303F58]">
                  Upload ID Proofs
                </h6>
                <p className="font-normal text-[#8F99A9] text-xs my-1 ">
                  Please Upload Your Scanned Adhaar and Pan card files
                </p>
                <div className="border-2 border-dashed h-[145px] rounded-lg bg-[#f5f5f5] text-[#4B5C79] flex items-center justify-center flex-col mt-6">
                  <PlusCircle color="#4B5C79" size={25} />
                  <p className="font-medium text-xs mt-2">
                    Drag & Drop or Click to Choose Files
                  </p>
                  <p className="text-xs mt-1 font-medium">Max file size: 5 MB</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  {/* Uploaded Files */}

                  <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex w-full items-center space-x-4">
                      <div className="flex items-center justify-center">
                        <Files />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Adhaar
                        </p>
                        <p className="text-xs text-gray-500">.PDF | 9.83MB</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <DownloadIcon size={20} />
                      <Trash size={20} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center">
                        <Files />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Pancard
                        </p>
                        <p className="text-xs text-gray-500">.PDF | 9.83MB</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <DownloadIcon size={20} />
                      <Trash size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "Bank Information" && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Enter Bank Name"
                    label="Bank Name"
                    error={errors.bankDetails?.bankName?.message}
                    {...register("bankDetails.bankName")}
                  />
                  <Input
                    placeholder="Enter Bank Branch"
                    label="Bank Branch"
                    error={errors.bankDetails?.bankBranch?.message}
                    {...register("bankDetails.bankBranch")}
                  />
                  <Input
                    placeholder="Enter Account No"
                    type="number"
                    label="Bank Account No"
                    error={errors.bankDetails?.bankAccountNo?.message}
                    {...register("bankDetails.bankAccountNo")}
                  />
                  <Input
                    placeholder="Enter IFSC Code"
                    label="IFSC Code"
                    error={errors.bankDetails?.ifscCode?.message}
                    {...register("bankDetails.ifscCode")}
                  />
                </div>
              </div>
            )}

            {/* {activeTab === "ID & Business Card" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F5F9FC] p-3 rounded-2xl">
                <p className="text-[#303F58] text-base font-bold">
                  Business Card
                </p>
                <p className="text-xs font-normal text-[#8F99A9] mt-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt
                </p>
                <img src={bcardfront} width={220} className="my-3" alt="" />
                <img src={bcardback} width={220} className="mb-3" alt="" />
                <div className="flex gap-3 justify-end">
                  <Button
                   onClick={()=>handleModalToggle(true, false)}
                    variant="tertiary"
                    size="sm"
                    className="text-xs text-[#565148] font-medium rounded-md"
                  >
                    <ViewIcon size="13" color="#565148" />
                    View
                  </Button>
                  <Button className="text-xs text-[#FEFDF9] font-medium" variant="primary" size="sm">
                <DownloadIcon size={13} color="#FFFFFF"/>Download</Button>
                </div>
              </div>
              <div className="bg-[#F5F9FC] p-3 rounded-2xl">
                <p className="text-[#303F58] text-base font-bold">ID Card</p>
                <p className="text-xs font-normal text-[#8F99A9] mt-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt
                </p>
                <img src={idcard} className="my-3" alt="" />
                <div className="flex gap-3 justify-end">
                  <Button
                   onClick={()=>handleModalToggle(false,true)}
                    variant="tertiary"
                    size="sm"
                    className="text-xs text-[#565148] font-medium rounded-md"
                  >
                    <ViewIcon size="13" color="#565148" />
                    View
                  </Button>
                  <Button className="text-xs text-[#FEFDF9] font-medium" variant="primary" size="sm">
                <DownloadIcon size={13} color="#FFFFFF"/>Download</Button>
                </div>
              </div>
            </div>
          )} */}
          </div>

          <div className="bottom-0 left-0 w-full bg-white flex justify-end gap-2 mt-3">
            {tabs.indexOf(activeTab) > 0 ? (
              <Button
                variant="tertiary"
                className="h-8 text-sm border rounded-lg"
                size="lg"
                onClick={handleBack}
              >
                Back
              </Button>
            ) : (
              <Button
                variant="tertiary"
                className="h-8 text-sm border rounded-lg"
                size="lg"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
            {tabs.indexOf(activeTab) === tabs.length - 1 ? (
              <Button
                variant="primary"
                className="h-8 text-sm border rounded-lg"
                size="lg"
                type="submit"
                onClick={() => setSubmit(true)}
              >
                Done
              </Button>
            ) : (
              <Button
                variant="primary"
                className="h-8 text-sm border rounded-lg"
                size="lg"
                onClick={() => handleNext(activeTab)}
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
      <Modal className="w-[60%]" open={isModalOpen.idCard} onClose={handleModalToggle}>
        <IdBcardModal
          parentOnClose={onClose}
          onClose={handleModalToggle}
          role="BDA"
          staffData={staffData} />
      </Modal>
      <Modal open={isModalOpen.area} onClose={()=>handleModalToggle()} className="w-[35%]">
        <AreaForm  onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.region} onClose={()=>handleModalToggle()} className="w-[35%]">
        <RegionForm  onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.commission} onClose={()=>handleModalToggle()} className="w-[35%]">
        <WCommissionForm  onClose={()=>handleModalToggle()} />
      </Modal>
    </>
  );
};

export default BDAForm;
