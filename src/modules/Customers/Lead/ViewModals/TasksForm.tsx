import Input from "../../../../components/form/Input"
import Select from "../../../../components/form/Select"
import Button from "../../../../components/ui/Button"
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LeadTaskData } from "../../../../Interfaces/LeadTask";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useResponse } from "../../../../context/ResponseContext";

type Props = {
  onClose: () => void;
  editId?: any;
}


const validationSchema = Yup.object().shape({
  leadId: Yup.string(),
  activityType: Yup.string(), // Ensure it's validated as "Meeting".
  taskTitle: Yup.string().required("Task Tittle is required"),
  taskDescription: Yup.string(),
  taskType: Yup.string(),
  dueDate: Yup.string(),
  time: Yup.string(),
  taskStatus: Yup.string()
});


const TasksForm = ({ onClose, editId }: Props) => {

  const { request: editLeadTask } = useApi("put", 3001);
  const { request: addLeadTask } = useApi("post", 3001);
  const { request: getLeadTask } = useApi("get", 3001);
  const { id } = useParams();

  const {
    handleSubmit,
    register,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadTaskData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      activityType: "Task",
      leadId: id,
    },
  });

  // Function to set form values
  const setFormValues = (data: LeadTaskData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof LeadTaskData, data[key as keyof LeadTaskData]);
    });
  };

  // Fetch task details when editing
  useEffect(() => {
    if (editId) {
      console.log("editId:", editId);
      (async () => {
        try {
          const { response, error } = await getLeadTask(`${endPoints.LEAD_ACTIVITY}/${editId}`);
          if (response && !error) {
            console.log("Task Data:", response.data.activity);
            setFormValues(response.data.activity); // Set form values
          } else {
            console.error("API Error:", error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching task data:", err);
        }
      })();
    }
  }, [editId]); // Depend on editId

  // Handle input change
  const handleInputChange = (field: keyof LeadTaskData) => {
    clearErrors(field);
  };
  const { setPostLoading } = useResponse()
  // Handle form submission
  const onSubmit: SubmitHandler<LeadTaskData> = async (data: LeadTaskData, event) => {
    event?.preventDefault();
    console.log("Submitting Data:", data);

    try {
      setPostLoading(true)
      const apiCall = editId ? editLeadTask : addLeadTask;
      const { response, error } = await apiCall(
        editId ? `${endPoints.LEAD_ACTIVITY}/${editId}` : endPoints.LEAD_ACTIVITY,
        data
      );

      if (response && !error) {
        console.log("API Response:", response.data);
        toast.success(response.data.message);
        onClose(); // Close modal after success
      } else {
        console.error("API Error:", error?.data?.message);
        toast.error(error?.data?.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Error submitting lead task data:", err);
      toast.error("An unexpected error occurred.");
    }
    finally {
      setPostLoading(false)
    }
  };
  // const onSubmit: SubmitHandler<LeadTaskData> = async (data: any, event) => {


  //     event?.preventDefault(); // Prevent default form submission behavior
  //     console.log("Data", data);
  //     // if (submit) {
  //     try {
  //         const { response, error } = await addLeadTask(endPoints.LEAD_ACTIVITY, data)
  //         console.log(response);
  //         console.log(error);

  //         if (response && !error) {
  //             console.log(response.data)
  //             toast.success(response.data.message); // Show success toast
  //             onClose(); // Close the form/modal
  //         } else {
  //             console.log(error.response.data.message);
  //             toast.error(error.response.data.message); // Show error toast
  //         }
  //     } catch (err) {
  //         console.error("Error submitting lead task data:", err);
  //         toast.error("An unexpected error occurred."); // Handle unexpected errors
  //     }
  // }

  return (
    <div>
      <div className="h-fit w-full rounded-lg">

        <div className="flex justify-between items-center mb-4 flex-wrap p-2">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg"> {editId ? "Edit" : "Add"} Task</h3>
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
          <div className="p-3 max-w-full mx-auto">
            <div className="space-y-2">
              {/* Task Title */}
              <Input
                label="Task Title"
                placeholder=""
                value={watch("taskTitle")}
                {...register("taskTitle")}
                required
              />
              {errors.taskTitle && (
                <p className="text-red-500 text-xs mt-1">{errors.taskTitle.message}</p>
              )}

              {/* Task Description */}
              <p className="text-[#303F58] text-sm font-normal">Task Description</p>
              <textarea
                className="w-full border border-[#CECECE] p-2 rounded-lg h-18 resize-none"
                {...register("taskDescription")}
                value={watch("taskDescription")}
                placeholder="Enter task details..."
              />

              {/* Form Fields (Task Type, Date, Time, Task Status) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Task Type */}
                <Select
                  label="Task Type"
                  value={watch("taskType")}
                  onChange={(selectedValue) => {
                    setValue("taskType", selectedValue);
                    handleInputChange("taskType");
                  }}
                  options={[
                    { value: "Normal", label: "Normal" },
                    { value: "Urgent", label: "Urgent" },
                  ]}
                />

                {/* Due Date */}
                <Input
                  type="date"
                  label="Date"
                  {...register("dueDate")}
                  value={watch("dueDate") || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setValue("dueDate", e.target.value)}
                />

                {/* Time */}
                {/* <Input
        label="Time"
        placeholder="Enter Time"
        {...register("time")}
        value={watch("time")}
      /> */}

                <Input
                  label="Time"
                  type="time"
                  {...register("time")}
                  value={watch("time")}
                  name="Enter Time"
                  onChange={(e) => setValue("time", e.target.value)}
                />

                {/* Task Status */}
                <Select
                  label="Task Status"
                  placeholder="Select status"
                  value={watch("taskStatus")}
                  onChange={(selectedValue) => {
                    setValue("taskStatus", selectedValue);
                    handleInputChange("taskStatus");
                  }}
                  options={[
                    { value: "In Progress", label: "In Progress" },
                    { value: "Pending", label: "Pending" },
                    { value: "Completed", label: "Completed" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className=" flex justify-end gap-2 px-4 my-4">
            <Button
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
            >
              Save
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default TasksForm