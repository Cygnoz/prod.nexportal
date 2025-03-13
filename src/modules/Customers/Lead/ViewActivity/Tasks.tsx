// import Boxes from "../../../../assets/icons/Boxes"
// import PackageCheck from "../../../../assets/icons/PackageCheck"
import { useEffect, useState } from "react";
import useApi from "../../../../Hooks/useApi";
import TaskTable from "./TaskTable";
import { useParams } from "react-router-dom";
import { endPoints } from "../../../../services/apiEndpoints";
import { LeadEmailData } from "../../../../Interfaces/LeadEmail";
import Modal from "../../../../components/modal/Modal";
import TasksForm from "../ViewModals/TasksForm";
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import toast from "react-hot-toast";

type Props = {
  leadData:any
}

const Tasks = ({leadData}: Props) => {
  const [editId, setEditId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [taskData, setTaskData]=useState<any[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { request: deleteLead } = useApi("delete", 3001);
  const {request : getLeadTask}=useApi('get',3001)

  const handleModalToggle = (editId?: any) => {
    setIsModalOpen((prev) => !prev);
   
    setEditId(editId)

  };

  // Toggle Delete Confirmation Modal
  const handledeleteToggle = (taskId?: string) => {
    setDeleteOpen((prev) => !prev);
    if (taskId) {
      setDeleteId(taskId);
    }
  };


  const {id}=useParams()

  const getTask = async () => {
    try {
        const { response, error } = await getLeadTask(`${endPoints.GET_ALL_LEAD_ACTIVITIES}/${id}`);
       // console.log(response);
       // console.log(error);

        if (response && !error) {
           // console.log(response.data.activities);

            // Filter activities where activityType is 'Task' and transform them
            const transformedTask = response.data?.activities
                ?.filter((task: any) => task.activityType === 'Task') // Only include tasks
                ?.map((task: any) => ({
                    ...task,
                    taskTitle: task?.taskTitle,
                    taskDescription: task?.taskDescription,
                    dueDate: task?.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : "N/A",

                    taskType: task?.taskType,
                    time: task?.time,
                    bda:leadData?.bdaDetails?.bdaName
                    ? leadData?.bdaDetails?.bdaName
                    : "N/A"
                })) || [];

            // Update the state with the filtered and transformed tasks
            setTaskData(transformedTask);
        } else {
            console.log(error.response.data.message);
        }
    } catch (err) {
        console.log(err, "error message");
    }
};

      useEffect(()=>{
          getTask()
      },[])
     // console.log(taskData);
  
    // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "taskTitle", label: "Task" },
    { key: "dueDate", label: "Due Date" },
    { key: "bda", label: "BDA" },
   
  ];

  // Handle Delete Function
  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("No note selected for deletion.");
      return;
    }

    try {
      const { response, error } = await deleteLead(`${endPoints.LEAD_ACTIVITY}/${deleteId}`);
      if (response) {
        toast.success(response.data.message);
        setTaskData((prevNotes) => prevNotes.filter((task) => task._id !== deleteId));
        setDeleteOpen(false);
      } else {
        console.error("Delete Failed:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "Failed to delete the note.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete the note.");
    }
  };


  return (
    <div>
         <div>
        <TaskTable<LeadEmailData>
            data={taskData}
            columns={columns}
            headerContents={{
            title: "Tasks",
            search: { placeholder: "Search" },
            button:{
              buttonHead:"Add Task"
            },
            
            }}
            actionList={[
              { label: 'edit', function: handleModalToggle },
              { label: 'delete', function: handledeleteToggle },
             
            ]}
            getTask={getTask}
        />
    </div>
    <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen} onClose={handleModalToggle}>
        <TasksForm editId={editId} onClose={handleModalToggle} />
      </Modal>

      
      <Modal open={deleteOpen} align="center" onClose={() => handledeleteToggle()}  className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" >
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this note?"
          onClose={() => handledeleteToggle()}
        />
      </Modal>
    </div>
  )
}

export default Tasks