import Input from "../../../../components/form/Input";
import Select from "../../../../components/form/Select";
import Button from "../../../../components/ui/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LeadMeetingData } from "../../../../Interfaces/LeadMeeting";
import { SubmitHandler, useForm } from "react-hook-form";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useResponse } from "../../../../context/ResponseContext";
// import { useState } from "react";


type Props = {
  onClose: () => void;
  editId?: any;
}

const validationSchema = Yup.object().shape({
  leadId: Yup.string(),
  activityType: Yup.string(), // Ensure it's validated as "Meeting".
  meetingTitle: Yup.string().required("Meeting title is required"),
  addNotes: Yup.string(),
  meetingType: Yup.string(),
  dueDate: Yup.string(),
  timeFrom: Yup.string(),
  timeTo: Yup.string(),
  meetingLocation: Yup.string(),
  location: Yup.string(),
  landMark: Yup.string(),
});

const MeetingForm = ({ onClose, editId }: Props) => {
  const { request: getLeadMeeting } = useApi("get", 3001);
  const { request: editLeadMeeting } = useApi("put", 3001);
  const { request: addLeadMeeting } = useApi('post', 3001)

  const { id } = useParams()
  console.log(id);


  const {
    handleSubmit,
    register,
    clearErrors,
    setValue,
    formState: { errors },
    watch,
  } = useForm<LeadMeetingData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      activityType: "Meeting",
      leadId: id
    }
  });

  // Function to set form values
  const setFormValues = (data: LeadMeetingData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof LeadMeetingData, data[key as keyof LeadMeetingData]);
    });
  };
 const {setPostLoading}=useResponse()
  // Fetch task details when editing
  useEffect(() => {
    if (editId) {
      console.log("editId:", editId);
      (async () => {
        try {
          const { response, error } = await getLeadMeeting(`${endPoints.LEAD_ACTIVITY}/${editId}`);
          if (response && !error) {
            console.log("Meeting Data:", response.data.activity);
            setFormValues(response.data.activity); // Set form values
          } else {
            console.error("API Error:", error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching meeting data:", err);
        }
      })();
    }
  }, [editId]); // Depend on editId

  const handleInputChange = (field: keyof LeadMeetingData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };


  // const [submit, setSubmit]= useState(false)

  console.log(errors);


  const onSubmit: SubmitHandler<LeadMeetingData> = async (data: LeadMeetingData, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    console.log("Data", data);

    try {
      setPostLoading(true)
      const apiCall = editId ? editLeadMeeting : addLeadMeeting;

      const { response, error } = await apiCall(editId ? `${endPoints.LEAD_ACTIVITY}/${editId}` : endPoints.LEAD_ACTIVITY, data);
      // console.log(response);
      //  console.log(error);

      if (response && !error) {
        console.log(response.data);
        toast.success(response.data.message)
        onClose();
      } else {
        console.error("API Error:", error?.data?.message);
        toast.error(error?.data?.message || "Failed to update meeting");

      }
    } catch (err) {
      console.error("Error submitting lead meeting data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
    finally{
      setPostLoading(false)
    }
  }
  // };
  // console.log(submit);



  return (
    <div>
      <div className="h-fit w-full rounded-lg">
        <div className="flex justify-between">
          <div className="space-y-2 p-4">
            <h3 className="text-[#303F58] font-bold text-lg">  {editId ? "Edit" : "Create"} Meeting</h3>
          </div>
          <p onClick={onClose} className="text-3xl p-4 cursor-pointer">&times;</p>
        </div>


        <form onSubmit={handleSubmit(onSubmit)}>
          <div >
            <div className="space-y-4 px-4">
              <Input
                label=" Meeting Title"
                placeholder=""
                {...register("meetingTitle")}
                value={watch("meetingTitle")}
              />
              {/* <Input
                                label="Add Notes"
                                placeholder=""
                            /> */}
              <p className="text-[#303F58] text-sm font-normal">Meeting Notes</p>
              <textarea
                className="w-full border border-[#CECECE] p-1"
                {...register("meetingNotes")}
                value={watch("meetingNotes")}
              >

              </textarea>


              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <Select
                    label="Meeting Type"
                    placeholder="Select Type"
                    value={watch("meetingType")}
                    onChange={(selectedValue) => {
                      setValue("meetingType", selectedValue);
                      handleInputChange("meetingType");
                    }}
                    options={[
                      { value: "Urgent", label: "Urgent" },
                      { value: "Normal", label: "Normal" },
                    ]}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="date"
                    label="Date"
                    className=""
                    {...register("dueDate")}
                    value={watch("dueDate") || new Date().toISOString().split("T")[0]} // Ensure default date
                    onChange={(e) => setValue("dueDate", e.target.value)} // Update form state on change
                  />

                </div>
                <div className="col-span-3 flex">
                  <Input
                    label="Time"
                    placeholder="7:28"
                    {...register("timeFrom")}
                    value={watch("timeFrom")}
                  />
                  <p className="mt-9 ms-4">to</p>

                </div>
                {/* <div className="col-span-1">
                <p className="text-center mt-9">to</p>
            </div> */}
                <div className="col-span-3 mt-7">
                  <Input
                    label=""
                    placeholder="7:28 "
                    {...register("timeTo")}
                    value={watch("timeTo")}
                  />
                </div>
              </div>


              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Meeting Location"
                  placeholder="Select Place"
                  value={watch("meetingLocation")}
                  onChange={(selectedValue) => {
                    setValue("meetingLocation", selectedValue);
                    handleInputChange("meetingLocation");
                  }}
                  options={[
                    { value: "Thiruvanathapuram", label: "Thiruvanathapuram" },
                    { value: "Kochi", label: "Kochi" },
                    { value: "Kozhikode", label: "Kozhikode" },
                  ]}
                />
                <Input
                  label="Location"
                  placeholder="Enter Location"
                  {...register("location")}
                  value={watch("location")}
                />
                <Input
                  label="Landmark"
                  placeholder="Enter Landmark"
                  {...register("landMark")}
                  value={watch("landMark")}
                />
              </div>

            </div>
          </div>
          <div className=" flex justify-end gap-2 px-4 my-4">
            <Button
              onClick={onClose}
              variant="tertiary"
              className="h-8 text-sm border rounded-lg"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="h-8 text-sm border rounded-lg"
              size="lg"
              type="submit"
            // onClick={() => setSubmit(true)}
            >
              Save
            </Button>
          </div>
        </form>

      </div>
    </div>

  )
}

export default MeetingForm