import { useForm, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import Files from "../../../assets/icons/Files";
import PlusCircle from "../../../assets/icons/PlusCircle";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import CheckIcon from "../../../assets/icons/CheckIcon";
import DownloadIcon from "../../../assets/icons/DownloadIcon";
import Trash from "../../../assets/icons/Trash";
import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
// import bcardback from "../../../assets/image/Business-card-back.png";
// import idcard from "../../../assets/image/ID-card 1.png";
// import ViewIcon from "../../../assets/icons/ViewIcon";
// import bcardfront from "../../../assets/image/Business-card-front.png";
import useApi from "../../../Hooks/useApi";
import { RMData } from "../../../Interfaces/RM";
import CustomPhoneInput from "../../../components/form/CustomPhone";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useRegularApi } from "../../../context/ApiContext";
import InputPasswordEye from "../../../components/form/InputPasswordEye";
import { StaffTabsList } from "../../../components/list/StaffTabsList";
import Modal from "../../../components/modal/Modal";
import IdBcardModal from "../../../components/modal/IdBcardModal";
import RegionForm from "../../Sales R&A/Region/RegionForm";
import WCommissionForm from "../../Users/WorkerCommision/WCommissionForm";
import { useResponse } from "../../../context/ResponseContext";
// import { get } from "lodash";
// import Modal from "../../../components/modal/Modal";
// import AMViewBCard from "../../../components/modal/IdCardView/AMViewBCard";
// import AMIdCardView from "../../../components/modal/IdCardView/AMIdCardView";

interface RMProps {
  onClose: () => void;
  editId?: string;

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

const RMForm: React.FC<RMProps> = ({ onClose, editId }) => {
  const { request: addRM } = useApi("post", 3002);
  const { dropdownRegions, dropDownWC, allCountries, refreshContext } = useRegularApi();
  const { request: editRM } = useApi("put", 3002);
  const { request: getRM } = useApi("get", 3002);
  const { request: checkRm } = useApi("get", 3002);
  const [submit, setSubmit] = useState(false);
  const { setPostLoading } = useResponse()
  const [data, setData] = useState<{
    regions: { label: string; value: string }[];
    wc: { label: string; value: string }[];
    country: { label: string; value: string }[];
    state: { label: string; value: string }[];
  }>({ wc: [], country: [], state: [], regions: [] });

  const tabs = [
    "Personal Information",
    "Company Information",
    "Upload Files",
    "Bank Information",
    // "ID & Business Card",
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    trigger,
    setValue,
    watch,
  } = useForm<RMData>({
    resolver: yupResolver(editId ? editValidationSchema : addValidationSchema),
  });

  // console.log("watch",watch());



  const [empId, setEmpId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState({
    idCard: false,
    region: false,
    commission: false
  });

  const handleModalToggle = (idCard = false, region = false, commission = false) => {
    setIsModalOpen((prev) => ({
      ...prev,
      idCard: idCard,
      region: region,
      commission: commission
    }));
    refreshContext({ dropdown: true })
  };


  const [staffData, setStaffData] = useState<any>(null);
  const onSubmit: SubmitHandler<RMData> = async (data, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    console.log("data", data);

    if (!submit) {
      console.warn("Submit flag is not set. Skipping submission.");
      return;
    }
    try {
      setPostLoading(true)
      const endpoint = editId
        ? `${endPoints.GET_ALL_RM}/${editId}`
        : endPoints.RM; // Determine endpoint based on editId
      const fun = editId ? editRM : addRM; // Determine function based on editId

      const { response, error } = await fun(endpoint, data);
      if (response && !error) {
        console.log("Response:", response.data);
        const { employeeId, region } = response.data
        const staffDetails = {
          ...watch(),
          regionName: region?.regionName,
          employeeId: editId ? empId : employeeId
        }
        // staffData=response.data
        setStaffData(staffDetails)
        //  console.log("staff",staffData);       
        toast.success(response.data.message); // Show success toast
        handleModalToggle(true, false, false)
      } else if (error) {
        console.error("Error:", error.response || error.message);
        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred.";
        toast.error(errorMessage); // Show error toast
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
    finally {
      setPostLoading(false)
    }
  };

  const checkRM = async () => {
    try {
      const { response, error } = await checkRm(
        `${endPoints.CHECK_RM}/${watch("region")}`
      );
      // console.log("res", response);
      // console.log("err", error);

      if (response && !error) {
        return true;
      } else {
        if (
          error?.response?.data?.message ===
          "Region is already assigned to another Region Manager. Try adding another region."
        ) {
          return false;
        } else {
          return true;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0 && activeTab === "Bank Information") {
      let firstErrorField = Object.keys(errors)[0];

      // Handle nested errors like address.street1
      if (errors.address?.street1) {
        firstErrorField = "address.street1";
      }
      const tabIndex: any = StaffTabsList.findIndex((tab) =>
        tab.validationField.includes(firstErrorField)
      );

      if (tabIndex >= 0) {
        setActiveTab(tabs[tabIndex]);
      }

      const errorrs: any = errors;
      Object.keys(errorrs).forEach((field) => {
        console.log(`${field}: ${errorrs[field]?.message}`);
      });

      // If the error is related to the 'address.street1' field
      if (errorrs["address"] && errorrs["address"].street1) {
        toast.error(errorrs["address"].street1.message);
      } else if (firstErrorField) {
        toast.error(errorrs[firstErrorField]?.message);
      }
    }
  }, [errors]);

  console.log("err", errors);


  const handleNext = async (tab: string) => {
    const currentIndex = tabs.indexOf(activeTab);
    let fieldsToValidate: any[] = [];
    let canProceed = true; // Default to true, modify if checkRM fails

    if (tab === "Personal Information") {
      fieldsToValidate = ["userName", "phoneNo", "personalEmail", "address.street1"];
    } else if (tab === "Company Information") {
      fieldsToValidate = [
        !editId && "email",
        !editId && "password",
        !editId && "confirmPassword",
        "region",
        "workEmail",
        "salaryAmount"
      ];
      if (!editId) {
        const rmCheck = await checkRM(); // Call checkRM function

        if (!rmCheck) {
          canProceed = false;
          // Replace with your preferred method for showing a message
          toast.error(
            "Region is already assigned to another Region Manager. Try adding another region."
          );
        }
      }
    }

    // Validate fields only if canProceed is true
    const isValid =
      !editId && canProceed && fieldsToValidate.length
        ? await trigger(fieldsToValidate)
        : true;

    // If validation passes and we can proceed, move to the next tab
    if (isValid && canProceed && currentIndex < tabs.length - 1) {
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

  const handleInputChange = (field: keyof RMData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

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
        country.states.map((state: any) => ({
          label: state,
          value: state,
        }))
      );
      setData((prevData: any) => ({ ...prevData, state: transformedStates }));
    }
  }, [watch("country"), allCountries]);

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

  const setFormValues = (data: RMData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof RMData, data[key as keyof RMData]);
    });
  };

  const getOneRM = async () => {
    try {
      const { response, error } = await getRM(
        `${endPoints.GET_ALL_RM}/${editId}`
      );
      if (response && !error) {
        const RM: any = response.data.regionManager; // Return the fetched data
        console.log("Fetched RM data:", RM);
        setEmpId(RM.user?.employeeId)
        const { user, _id, ...rm } = RM;
        const transformedRM = RM
          ? {
            ...rm,
            dateOfJoining: new Date(RM.dateOfJoining)
              .toISOString()
              .split("T")[0],
            userName: user?.userName,
            phoneNo: user?.phoneNo,
            email: user?.email,
            userImage: user?.userImage,
            region: RM.region?._id,
            commission: RM.commission?._id,
          }
          : null;

        console.log("Transformed RM data:", transformedRM);

        setFormValues(transformedRM);
        // setStaffData(transformedRM)
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching RM data:", error);
      }
    } catch (err) {
      console.error("Error fetching RM data:", err);
    }
  };

  useEffect(() => {
    if (editId) {
      getOneRM();
    }
    refreshContext({ dropdown: true })
  }, [editId]); // Trigger the effect when editId changes

  return (
    <>
      <div className="p-5 bg-white rounded shadow-md hide-scrollbar h-fit">
        <div className="flex justify-between items-center mb-4 flex-wrap">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg sm:text-lg md:text-lg">
              {editId ? "Edit" : "Create"} Region Manager
            </h3>
            <p className="text-[11px] text-[#8F99A9] mt-1 sm:text-sm md:text-base">
              {editId
                ? "Edit the details of the region manager."
                : "Fill in the details to create a new region manager."}
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
        <div className="flex gap-8 items-center justify-center text-base font-bold my-5 flex-wrap">
          {tabs.map((tab, index) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer py-3 px-[16px] ${activeTab === tab
                  ? "text-deepStateBlue border-b-2 border-secondary2"
                  : "text-gray-600"
                } sm:px-4 md:px-6`}
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

                <div className="col-span-12 sm:col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder="Enter Full Name"
                    value={watch("userName")}
                    label="Full Name"
                    error={errors.userName?.message}
                    onChange={(e) => {
                      handleInputChange("userName");
                      setValue("userName", e.target.value);
                    }}
                  />
                  <Input
                    placeholder="Enter Email Address"
                    label="Email Address"
                    error={errors.personalEmail?.message}
                    value={watch("personalEmail")}
                    onChange={(e) => {
                      setValue("personalEmail", e.target.value);
                      handleInputChange("personalEmail");
                    }}
                  />
                  <CustomPhoneInput
                    label="Phone Number"
                    required
                    error={errors.phoneNo?.message}
                    placeholder="Enter phone number"
                    value={watch("phoneNo")} // Watch phone field for changes
                    onChange={(value) => {
                      handleInputChange("phoneNo");
                      setValue("phoneNo", value); // Update the value of the phone field in React Hook Form
                    }}
                  />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      setValue("state", ""); // Reset state when country changes
                      handleInputChange("country");
                    }}
                    options={data.country}
                  />

                  <Select
                    placeholder={
                      data.state.length === 0
                        ? "Choose Country"
                        : "Select State"
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
                    } // Sets current date as defau
                  />
                </div>
              </div>
            )}

{activeTab === "Company Information" && (
  <>
    {!editId && (
      <>
        <h1 className="text-xs font-semibold">
          Set Login Credentials
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
          <Input
            required
            placeholder="Enter Email"
            label="Email"
            value={watch("email")}
            error={errors.email?.message}
            onChange={(e) => {
              handleInputChange("email");
              setValue("email", e.target.value);
            }}
          />
          <InputPasswordEye
            label={editId ? "New Password" : "Password"}
            required
            value={watch("password")}
            placeholder="Enter your password"
            error={errors.password?.message}
            onChange={(e) => {
              handleInputChange("password");
              setValue("password", e.target.value);
            }}
          />
          <InputPasswordEye
            label="Confirm Password"
            required
            value={watch("confirmPassword")}
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            onChange={(e) => {
              handleInputChange("confirmPassword");
              setValue("confirmPassword", e.target.value);
            }}
          />
        </div>
      </>
    )}

    <div>
      <hr />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
      <Input
        placeholder="Enter Work Email"
        label="Work Email"
        error={errors.workEmail?.message}
        value={watch("workEmail")}
        onChange={(e) => {
          setValue("workEmail", e.target.value);
          handleInputChange("workEmail");
        }}
      />
      <CustomPhoneInput
        label="Work phone"
        error={errors.workPhone?.message}
        value={watch("workPhone")}
        placeholder="Enter phone number"
        onChange={(value) => {
          handleInputChange("workPhone");
          setValue("workPhone", value);
        }}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
      <Select
        required
        placeholder="Select Region"
        label="Select Region"
        value={watch("region")}
        onChange={(selectedValue) => {
          setValue("region", selectedValue);
          handleInputChange("region");
        }}
        error={errors.region?.message}
        options={data.regions}
        addButtonLabel="Add Region "
        addButtonFunction={handleModalToggle}
        totalParams={2}
        paramsPosition={2}
      />

      <Select
        label="Choose Commission Profile"
        placeholder="Commission Profile"
        value={watch("commission")}
        onChange={(selectedValue) => {
          setValue("commission", selectedValue);
          handleInputChange("commission");
        }}
        error={errors.commission?.message}
        options={data.wc}
        addButtonLabel="Add Commission"
        addButtonFunction={handleModalToggle}
        totalParams={3}
        paramsPosition={3}
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
  </>
)}


{activeTab === "Upload Files" && (
  <div>
    <h6 className="font-bold text-sm text-[#303F58]">
      Upload ID Proofs
    </h6>
    <p className="font-normal my-1 text-[#8F99A9] text-xs">
      Please Upload Your Scanned Adhaar and Pan card files
    </p>

    <div className="border-2 mt-6 border-dashed h-[145px] rounded-lg bg-[#f5f5f5] text-[#4B5C79] flex items-center justify-center flex-col">
      <PlusCircle color="#4B5C79" size={25} />
      <p className="font-medium text-xs mt-2">
        Drag & Drop or Click to Choose Files
      </p>
      <p className="text-xs mt-1 font-medium">
        Max file size: 5 MB
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
      {/* Uploaded Files */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex w-full items-center space-x-4">
          <div className="flex items-center justify-center">
            <Files />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Adhaar</p>
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
            <p className="text-sm font-medium text-gray-700">Pancard</p>
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
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      label="Bank Account No"
      type="number"
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
                      onClick={() => handleModalToggle(true, false)}
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
                      onClick={() => handleModalToggle(false, true)}
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
                onClick={() => {
                  setSubmit(true);
                }}
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
      {/* <Modal
        open={isModalOpen.viewBusinesscard}
        onClose={() => handleModalToggle()}
        className="w-[35%]"
      >
        <AMViewBCard onClose={() => handleModalToggle()} />
      </Modal>
      <Modal
        open={isModalOpen.viewIdcard}
        onClose={() => handleModalToggle()}
        className="w-[35%]"
      >
        <AMIdCardView onClose={() => handleModalToggle()} />
      </Modal> */}
      <Modal className="w-[60%]" open={isModalOpen.idCard} onClose={() => handleModalToggle()}>
        <IdBcardModal
          parentOnClose={onClose}
          onClose={() => handleModalToggle()}
          role="Region Manager"
          staffData={staffData}
        />
      </Modal>
      <Modal open={isModalOpen.region} onClose={() => handleModalToggle()} className="w-[35%]">
        <RegionForm onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.commission} onClose={() => handleModalToggle()} className="w-[35%]">
        <WCommissionForm onClose={() => handleModalToggle()} />
      </Modal>
    </>
  );
};

export default RMForm;