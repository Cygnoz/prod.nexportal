import React, { useEffect, useRef } from "react";
import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CustomPhoneInput from "../../../components/form/CustomPhone";
import InputPasswordEye from "../../../components/form/InputPasswordEye";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import toast from "react-hot-toast";
import Trash from "../../../assets/icons/Trash";
import { Role } from "../../../types/rolePermissions";
import { UserData } from "../../../Interfaces/User";
import { useUser } from "../../../context/UserContext";
import { useResponse } from "../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  editId?: any;
};

function UserForm({ onClose, editId }: Props) {

 const {setUser,user}=useUser()

 // Base schema for shared fields
const baseSchema = {
  userName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNo: Yup.string().required("Phone Number is required"), // Optional field
  role: Yup.string().required("Role is required"),
};

// Schema for "add" form with additional fields
const addValidationSchema = Yup.object({
  ...baseSchema,
  password: Yup.string()
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

// Schema for "edit" form with only shared fields
const editValidationSchema = Yup.object({
  ...baseSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { request: addUser } = useApi("post", 3002);
  const { request: editUser } = useApi("put", 3002);
  const {setPostLoading}=useResponse()
  const { request: getAUser } = useApi("get", 3002);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
  } = useForm<UserData>({
    resolver: yupResolver(editId ? editValidationSchema : addValidationSchema),
  });
  const setFormValues = (data: UserData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof UserData, data[key as keyof UserData]);
    });
  };

  const getOneUser = async () => {
    try {
      const { response, error } = await getAUser(`${endPoints.USER}/${editId}`);
      if (response && !error) {
        const res = response.data;
        console.log(res);

        setFormValues(res);
      }
    } catch (err) {
      console.log("Err", err);
    }
  };

  const onSubmit: SubmitHandler<UserData> = async (data, event) => {
    event?.preventDefault();
    console.log("Form Data:", data);
    try {
      setPostLoading(true)
      const fun = editId ? editUser : addUser;
      let response, error;

      if (editId) {
        ({ response, error } = await fun(`${endPoints.USER}/${editId}`, data));
       if(user?.id===data._id){
        const userEditedData:any={
          userName:data.userName,
          userImage:data.userImage,
          id:data._id,
          employeeId:data.employeeId,
          role:data?.role,
          email:data?.email,
          userId:user?.userId
        }
        setUser(userEditedData);
       }
      } else {
        ({ response, error } = await fun(endPoints.USER, data));
      }

      console.log(response);
      console.log(error);

      if (response && !error) {
        toast.success(response.data.message);
        onClose();
      } else {
        toast.error(error.response.data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred.");
    }
    finally{
      setPostLoading(false)
    }
  };

  const addRoles: { label: string; value: Role }[] = [
    { label: "Super Admin", value: "Super Admin" },
    { label: "Sales Admin", value: "Sales Admin" },
    { label: "Support Admin", value: "Support Admin" },
    { label: "Author", value: "Author" },
  ];
  const editRoles: { label: string; value: Role }[] = [
    { label: "Super Admin", value: "Super Admin" },
    { label: "Sales Admin", value: "Sales Admin" },
    { label: "Support Admin", value: "Support Admin" },
    { label: "Region Manager", value: "Region Manager" },
    { label: "Area Manager", value: "Area Manager" },
    { label: "BDA", value: "BDA" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Support Agent", value: "Support Agent" },
    { label: "Author", value: "Author" },
  ];

  const handleInputChange = (field: keyof UserData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };

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

    // Reset the file input value
    if (fileInputRef?.current) {
      fileInputRef.current.value = ""; // Clear the input field
    }
  };

  useEffect(() => {
    getOneUser();
  }, []);

  return (
    <div className="p-5 space-y-2 text-[#4B5C79] py-2">
     

      <div className="flex justify-between items-center mb-4 flex-wrap">
          <div>
          <h3 className="text-[#303F58] font-bold text-lg">
            {editId ? "Edit" : "Create"} User
          </h3>
          <p className="text-[11px] text-[#8F99A9] mt-1 max-sm:hidden">
            {`Use this form to ${
              editId ? "edit an existing user" : "add a new user"
            } details. Please fill in the required information`}
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12">

        <div className="col-span-12 sm:col-span-3 flex flex-col items-center">
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

          <div className="col-span-12 sm:col-span-9 my-2">
            <div className="mx-3 gap-4 space-y-2 max-w-lg">
              <Input
                label="Full Name"
                required
                type="text"
                placeholder="Enter Full Name"
                error={errors.userName?.message}
                {...register("userName")}
              />
              <Input
                label="Email Address"
                required
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
                {...register("email")}
              />
              <CustomPhoneInput
                label="Phone Number"
                required
                name="phoneNo"
                error={errors.phoneNo?.message}
                placeholder="Enter phone number"
                value={watch("phoneNo")} // Watch phone field for changes
                onChange={(value) => {
                  handleInputChange("phoneNo");
                  setValue("phoneNo", value); // Update the value of the phone field in React Hook Form
                }}
              />
          
                <>
                  <InputPasswordEye
                    label={editId?"New Password":"Password"}
                    required={editId?false:true}
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <InputPasswordEye
                    label="Confirm Password"
                    required={editId?false:true}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </>
              
              {!editId&&<Select
                required
                label="Role"
                value={watch("role")}
                placeholder={!editId ? "Select Role" : undefined}
                options={editId ? editRoles : addRoles}
                error={errors.role?.message}
                onChange={(selectedValue)=>{
                  setValue("role",selectedValue)
                  handleInputChange("role")
                }}
              />}
               <div className="flex justify-end gap-2 pt-3 pb-2 ">
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
            </div>
           
          </div>
        </div>
        
      </form>
    </div>
  );
}

export default UserForm;
