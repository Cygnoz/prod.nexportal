import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import frame from "../../../assets/image/Categoryframe.png"
import TextArea from '../../../components/form/TextArea';
import * as Yup from "yup";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NotificationFormData } from '../../../Interfaces/CMS';
import { LicenserData } from '../../../Interfaces/Licenser';
import useApi from '../../../Hooks/useApi';
import { endPoints } from '../../../services/apiEndpoints';
import toast from 'react-hot-toast';

type Props = { fetchData?: () => void, id?: string }

function CreateNotModal({ fetchData, id }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("all");
  const { request: getAllLicenser } = useApi('get', 3001)
  const [allLicenser, setAllLicenser] = useState<LicenserData[]>([]);
  const { request: addNotification } = useApi('post', 3001)
  const { request: getNotification } = useApi('get', 3001)
  const { request: editNotification } = useApi('put', 3001)


  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    reset()
    setModalOpen(false);
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    licensers: Yup.array()
      .of(Yup.string().required())
      .min(1, "At least one licenser is required")
      .required(), // This ensures `licensers` cannot be undefined
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,

  } = useForm<NotificationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      licensers: allLicenser.map((licenser: any) => licenser._id),
      status: "Draft", // Default status
      LicenserType: selectedOption
    },
  });

  useEffect(() => {
    setValue("LicenserType", selectedOption);
  }, [setValue, selectedOption])

  const getOneNotification = async () => {
    const { response, error } = await getNotification(`${endPoints.NOTIFICATION}/${id}`);
    if (error) {
      return;
    }
    if (response) {
      console.log("API Response:", response?.data?.notification);
      setFormValues(response?.data?.notification);
    }
  };


  const setFormValues = (data: NotificationFormData) => {
    console.log("Setting form values:", data);

    // Make sure to include all necessary fields when resetting
    const formData = {
      ...data,
      // Ensure licensers is properly set - if it exists in data, use it, otherwise use default
      licensers: data.licensers || allLicenser.map((licenser: any) => licenser._id)
    };

    if (data) {
      setSelectedOption(data.LicenserType ?? ""); // Use an empty string if undefined
    }


    // Set the selected option based on the licensers data
    if (data.licensers) {
      if (data.licensers.length === allLicenser.length) {
        setSelectedOption("all");
      } else if (data.licensers.length === 1) {
        setSelectedOption("single");
      } else {
        setSelectedOption("multiple");
      }
    }

    console.log("Resetting form with values:", formData);
    reset(formData); // This updates all fields in one go
  }




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


  const getLicensers = async () => {
    try {
      const { response, error } = await getAllLicenser(endPoints.LICENSER)
      if (response && !error) {
        console.log("licensers", response?.data.licensers
        );
        setAllLicenser(response?.data.licensers)
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getLicensers()
    if (id) {
      getOneNotification()
    }
  }, [])

  useEffect(() => {
    setValue("status", status);
  }, [status, setValue]);


  // Watch for selected licensers
  const selectedLicensers = watch("licensers", []);

  useEffect(() => {
    // This ensures the licensers field is populated on initial render
    if (selectedLicensers.length === 0 && allLicenser.length > 0) {
      const allLicenserIds = allLicenser.map((licenser: any) => licenser._id);
      setValue("licensers", allLicenserIds, { shouldValidate: true });
    }

  }, [allLicenser, setValue]);

  // Handle dropdown selection change
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    if (!selectedId) return;

    // If "single" is selected, replace the entire array with the new selection
    if (selectedOption === "single") {
      setValue("licensers", [selectedId], { shouldValidate: true });
    }
    // If "multiple" is selected, add to array if not already included
    else if (selectedOption === "multiple") {
      const updatedLicensers = selectedLicensers.includes(selectedId)
        ? selectedLicensers
        : [...selectedLicensers, selectedId];
      setValue("licensers", updatedLicensers, { shouldValidate: true });
    }
  };

  // Handle removing a selected licenser
  const removeLicenser = (id: string) => {
    const updatedLicensers = selectedLicensers.filter((licenserId) => licenserId !== id);
    setValue("licensers", updatedLicensers, { shouldValidate: true });
  };

  // Handle radio button selection change
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value;
    setSelectedOption(option);

    // When changing to "all", set all licenser IDs
    if (option === "all") {
      const allLicenserIds = allLicenser.map((licenser: any) => licenser._id);
      setValue("licensers", allLicenserIds, { shouldValidate: true });
    }
    // When changing to "single", clear the selection
    else if (option === "single") {
      setValue("licensers", [], { shouldValidate: true });
    }
    // When changing to "multiple", we can keep the current selection
  };

  // Form submission handler with different status options
  const handleFormSubmit = (status: string) => {
    return async () => {
      // Set the status based on which button was clicked
      setValue("status", status);

      // Get current form data
      const formData = watch();
      console.log("Form data before submit:", formData);

      // Directly call the API without form validation
      const endPoint = id ? `${endPoints.NOTIFICATION}/${id}` : endPoints.NOTIFICATION;

      const apiCall = id ? editNotification : addNotification;

      apiCall(endPoint, formData)
        .then(({ response, error }) => {
          console.log("response:", response || error);

          if (response && !error) {
            toast.success(response.data.message);
            fetchData && fetchData();
            reset();
            closeModal();
          } else {
            toast.error(error?.response?.data?.message || "An error occurred");
          }
        })
        .catch(error => {
          console.error("API call failed:", error);
          toast.error("Something went wrong. Please try again.");
        });
    };
  };

  return (
    <div>
      {
        id ?
          <Button variant="tertiary" onClick={openModal}
            className="border border-[#565148] h-8 text-[15px]" size="sm">
            Edit
          </Button>
          :
          <Button onClick={openModal}
            className="border border-[#565148]" size="sm"                >
            <span className="font-bold text-xl">+</span>
            Create Notification
          </Button>
      }

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        className="w-[50%] text-start px-7 py-6 max-h-[90vh] overflow-y-auto scroll-smooth hide-scrollbar"
      >
        <div>
          <div className="flex justify-between items-center p-3">
            <h1 className="text-lg font-bold text-deepStateBlue">
              {
                id ? "Edit Notification" : "Add Notification"
              }
            </h1>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
            >
              &times;
            </button>
          </div>
          <form className="w-full" >
            <div>
              <div className="col-span-2 flex flex-col items-center px-2">
                <label
                  className="cursor-pointer text-center border-2 w-full  border-dashed py-5"
                  htmlFor="file-upload"
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {watch("image") ? (
                    <div
                      className="flex justify-center  items-center"
                    >
                      <div className='flex justify-center'>
                        <img className='w-full h-40' src={watch("image")} alt="" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='flex justify-center'>

                        <img src={frame} alt="" />
                      </div>
                      <div className='mt-2'>
                        <p className='text-[#4B5C79] text-[12px] font-medium'>
                          Upload  Image
                        </p>
                      </div>
                    </div>

                  )}

                </label>

              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 p-2">
              <Input
                placeholder="Enter Category Name"
                label=" Title"
                required
                error={errors.title?.message}
                {...register("title")}
              />
              <p className='text-sm mt-2'>Select Licenser</p>
              <div className='flex gap-5'>
                <div>
                  <input
                    type="radio"
                    id="all"
                    name="licenseType"
                    value="all"
                    checked={selectedOption === "all"}
                    onChange={handleRadioChange}
                  />
                  <label className='ps-2' htmlFor="all">All</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="single"
                    name="licenseType"
                    value="single"
                    checked={selectedOption === "single"}
                    onChange={handleRadioChange}
                  />
                  <label className='ps-2' htmlFor="single">Single Licensers</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="multiple"
                    name="licenseType"
                    value="multiple"
                    checked={selectedOption === "multiple"}
                    onChange={handleRadioChange}
                  />
                  <label className='ps-2' htmlFor="multiple">Multiple Licensers</label>
                </div>
              </div>
              <div className="mb-1">
                <div className="mt-4">
                  {selectedOption === "single" && (
                    <div>
                      <label className="font-semibold">Select Licensers:</label>
                      <select
                        onChange={handleDropdownChange}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      >
                        <option value="">Select Licenser</option>
                        {allLicenser.map((data: any) => (
                          <option key={data._id} value={data._id}>
                            {data.firstName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedOption === "multiple" && (
                    <div className='border border-1 rounded-lg p-3'>
                      <div>
                        <label className="font-semibold">Select Licensers:</label>
                        <select
                          onChange={handleDropdownChange}
                          className="border border-gray-300 rounded px-3 py-2 w-full"
                        >
                          <option value="">Select Licenser</option>
                          {allLicenser.map((data: any) => (
                            <option key={data._id} value={data._id}>
                              {data.firstName}
                            </option>
                          ))}
                        </select>

                        {/* Show selected licensers */}
                        {selectedLicensers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedLicensers.map((id) => {
                              const licenser = allLicenser.find((data: any) => data._id === id);
                              return (
                                <div key={id} className="bg-gray-200 px-3 py-1 rounded flex items-center gap-2">
                                  <span>{licenser?.firstName}</span>
                                  <button
                                    type="button" // Important to prevent form submission
                                    onClick={() => removeLicenser(id)}
                                    className="text-red-500 font-bold"
                                  >
                                    X
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOption === "all" && (
                    <div className="bg-gray-200 px-3 py-1 rounded flex items-center">
                      <p className="font-semibold">All licensers selected ({allLicenser.length})</p>
                    </div>
                  )}
                </div>

                {/* Display any validation errors */}
                {errors.licensers && (
                  <p className="text-red-500 mt-1">{errors.licensers.message}</p>
                )}

              </div>

              <TextArea
                label='Body'
                placeholder='Write Licenses Message'
                error={errors.body?.message}
                {...register("body")} />
              <div>
                <Button
                  className="border border-[#565148] flex items-center justify-center h-10 text-[15px] w-full"
                  variant="tertiary"
                  onClick={handleSubmit(handleFormSubmit("Sended"))}
                >
                  Send Now
                </Button>
              </div>
              <p className='text-center text-[#768294]'>OR</p>
              <p className='py-1 text-[#768294]'>Schedule for</p>
              <div className='grid grid-cols-2 gap-5'>
                <Input
                  type='date'
                  label='Select Date'
                  className='w-full'
                  error={errors.date?.message}
                  {...register("date")} />
                <Input
                  type='time'
                  label='Time'
                  placeholder='Enter Time'
                  className='w-full'
                  error={errors.time?.message}
                  {...register("time")} />
              </div>


            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pb-2 me-2">
              <Button
                variant="tertiary"
                className="h-10 text-sm flex items-center justify-center rounded-lg border border-[#565148]"
                size="lg"
                onClick={handleSubmit(handleFormSubmit("Draft"))}
              >
                Save as Draft
              </Button>

              <Button
                className="h-10 text-sm flex items-center justify-center rounded-lg border border-[#565148]"
                size="lg"
                onClick={handleSubmit(handleFormSubmit("Scheduled"))}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default CreateNotModal