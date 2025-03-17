//import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../components/form/Input";
//import Select from "../../../components/form/Select";
import Button from "../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Select from "../../components/form/Select";
import { useEffect, useRef, useState } from "react";
import { endPoints } from "../../services/apiEndpoints";
import useApi from "../../Hooks/useApi";
import toast from "react-hot-toast";
import { TicketsData } from "../../Interfaces/Tickets";
import { useUser } from "../../context/UserContext";
import { useRegularApi } from "../../context/ApiContext";
import { socket } from "../../context/SocketContext";
import { useResponse } from "../../context/ResponseContext";
import ProductLogo from "../../components/ui/ProductLogo";

type Props = {
  onClose: () => void;
  editId?: string;
};

const validationSchema = Yup.object({
  customerId: Yup.string().required("Request is required"),
  supportAgentId: Yup.string().required("Agent is required"),
  subject: Yup.string().required("subject is required"),

  priority: Yup.string().required("Priority is required"),
});

function TicketsForm({ onClose, editId }: Props) {
  const { user } = useUser();
  const {regionId,dropDownSA,refreshContext}=useRegularApi()
  const { request: addTickets } = useApi("post", 3004);
  const { request: editTickets } = useApi("put", 3004);
  const { request: getAllRequestor } = useApi("get", 3004);
  const { request: getTicket } = useApi("get", 3004);
  const [allrequestor, setAllRequestor] = useState<any[]>([]);
  const [allSa,setAllSa]=useState<any[]>([])
  // const [data, setData] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
  } = useForm<TicketsData>({
    resolver: yupResolver(validationSchema),
  });

  // const onSubmit: SubmitHandler<TicketsData> = (data) => {
  //   console.log("Form Data:", data);
  // };

  const handleInputChange = (field: keyof TicketsData) => {
    clearErrors(field); // Clear the error for the specific field when the user starts typing
  };
  // Reset the file input value
  if (fileInputRef?.current) {
    fileInputRef.current.value = ""; // Clear the input field
  }

  console.log("sa",dropDownSA);
  

  const Priority = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];

  const Status = [
    { label: "Open", value: "Open" },
    { label: "In progress", value: "In progress" },
    { label: "Resolved", value: "Resolved" },
  ];
  const {setPostLoading}=useResponse()
  const onSubmit: SubmitHandler<TicketsData> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    console.log("Form Data", data);
     const senderData:any=allrequestor.filter((request)=>request.value===watch("customerId"))
    try {
      setPostLoading(true)
      const fun = editId ? editTickets : addTickets; // Select the appropriate function based on editId
      let response, error;
      if (editId) {
        // Call updateLead if editId exists (editing a lead)
        ({ response, error } = await fun(
          `${endPoints.TICKETS}/${editId}`,
          data
        ));
        
        socket.emit("EditForClient",senderData?.email)
      } else {
        // Call addLead if editId does not exist (adding a new lead)
        ({ response, error } = await fun(endPoints.TICKETS, data));
      }
      console.log("Response:", response);
      console.log("Error:", error);

      if (response && !error) {
        // console.log(response.data);
        if(editId){
          socket.emit('EditAssignedTickets',response?.data?.userId)
        }
        toast.success(response.data.message); // Show success toast
        onClose(); // Close the form/modal
      } else {
        toast.error(error.response?.data?.message || "An error occurred."); // Show error toast
      }
    } catch (err) {
      console.error("Error submitting tickets data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
    finally{
      setPostLoading(false)
    }
  };

  const getRequestors = async () => {
    try {
      const { response, error } = await getAllRequestor(endPoints.REQUESTOR);
      console.log("res", response);

      if (response && !error) {
        console.log("loce", response?.data);
      
        const transformRequest =
          response?.data?.data
            ?.filter((request: any) =>
              regionId ? request?.regionId === regionId : true
            )
            ?.map((request: any) => ({
              label: `${request?.firstName} (${request?.customerId})`,
              value: String(request?._id),
              email: request?.email,
              product:request?.project
            })) || [];
      
        setAllRequestor(transformRequest);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getRequestors();
  
    let saList: any = []; // Initialize as an empty array
  
    if (user?.role === "Supervisor") {
      saList =
        dropDownSA
          ?.filter((drop: any) => drop.region === regionId)
          .map((sa: any) => ({
            label: (
              <div className="flex justify-between items-center">
                <p>
                  <strong>{sa?.userName}</strong>
                </p>
                <div className="px-2 py-1 bg-primary rounded-lg text-white">
                  Unresolved <b className="text-yellow-200">{sa?.unsolvedTickets}</b>
                </div>
              </div>
            ),
            value: sa?._id,
            unsolvedTickets: sa?.unsolvedTickets ?? 0, // Ensure it's a number for sorting
          }))
          .sort((a: any, b: any) => a.unsolvedTickets - b.unsolvedTickets) || []; // Sort by unsolved tickets (ascending)
    } else {
      saList =
        dropDownSA
          ?.map((sa: any) => ({
            label: (
              <div className="flex justify-between items-center">
                <p>
                  <strong>{sa?.userName}</strong>
                </p>
                <div className="px-2 py-1 bg-primary rounded-lg text-white">
                  Unresolved <b className="text-yellow-200">{sa?.unsolvedTickets}</b>
                </div>
              </div>
            ),
            value: sa?._id,
            unsolvedTickets: sa?.unsolvedTickets ?? 0,
          }))
          .sort((a: any, b: any) => a.unsolvedTickets - b.unsolvedTickets) || []; // Sort by unsolved tickets (ascending)
    }
  
    setAllSa(saList); // Set the sorted `saList`
  
    if (user?.role === "Support Agent") {
      const loggedInSA: any = dropDownSA?.find((sa: any) => sa?._id === user?.userId);
      console.log("loggedIn", loggedInSA);
      setValue("supportAgentId", loggedInSA?._id);
    }
  }, [dropDownSA]);
  
  
  

  

 

  const setFormValues = (data: TicketsData) => {
    console.log(data);

    Object.keys(data).forEach((key) => {
      setValue(key as keyof TicketsData, data[key as keyof TicketsData]);
    });
  };

  const getOneTickets = async () => {
    try {
      const { response, error } = await getTicket(
        `${endPoints.TICKETS}/${editId}`
      );
      if (response && !error) {
        const Ticket = response.data; // Return the fetched data
        console.log("Fetched Tickets data:", Ticket);
        // Assuming you want to extract specific fields from the fetched Ticket data
        const filteredData = {
          ...Ticket,
          customerId: Ticket?.customerId?._id,
          supportAgentId: Ticket?.supportAgentId?._id
        };
  
        setFormValues(filteredData); // Update the form values with the filtered data
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Ticket data:", error);
      }
    } catch (err) {
      console.error("Error fetching Ticket data:", err);
    }
  };
  

  useEffect(() => {
    getOneTickets();
    refreshContext({dropdown:true})
  }, [editId]);

  useEffect(()=>{
    setValue("project",allrequestor.find((req) => req.value === watch("customerId"))?.product)
  },[watch("customerId")])

  return (
    <div>
      <div className="p-2 space-y-1 text-[#4B5C79] py-2 w-[100%]">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg">
              {editId ? "Edit" : "Create"} Tickets
            </h3>
            <p className="text-[11px] text-[#8F99A9] mt-1">
              {editId
                ? "Edit the details of the Tickets."
                : "Fill in the details to create a new Ticket."}
            </p>
          </div>
          <p onClick={onClose} className="text-3xl cursor-pointer">
            &times;
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className=" my-2">
              <div className="mx-3 gap-4 space-y-2 ">
                <Select
                  required
                  label="Requestor"
                  placeholder="Search Name"
                  value={watch("customerId")}
                  error={errors.customerId?.message}
                  options={allrequestor}
                  onChange={(selectedValue) => {
                    handleInputChange("customerId");
                    setValue("customerId", selectedValue);
                  }}
                />
              {watch('customerId')&&<>
                <label
                            className="block text-sm mb-2 font-normal text-deepStateBlue"
                          >
                            <p>Product</p>
                          </label>
                  <div className=" w-full h-[42px] flex  items-center gap-2 ps-2  bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg">
                                <ProductLogo size={8} projectName={allrequestor.find((req) => req.value === watch("customerId"))?.product}/>
                                <p className="text-[#0B1320]">{allrequestor.find((req) => req.value === watch("customerId"))?.product}</p>
                      </div>
              </>}
                <Input
                  required
                  label="Subject"
                  type="text"
                  placeholder="A brief title or summary of the issue"
                  error={errors.subject?.message}
                  {...register("subject")}
                  onChange={() => handleInputChange("subject")}
                />
                <Input
                  label="Description"
                  type="text"
                  placeholder="Detailed explanation of the issue or request"
                  {...register("description")}
                />
                <Select
                  readOnly={user?.role == "Support Agent" ? true : false}
                  required
                  value={watch("supportAgentId")}
                  label="Assigned To"
                  placeholder="Select Agent"
                  error={errors.supportAgentId?.message}
                  options={allSa}
                  onChange={(selectedValue) => {
                    handleInputChange("supportAgentId");
                    setValue("supportAgentId", selectedValue);
                  }}
                  from="ticket"
                />

                <div
                  className={` ${
                    editId ? "grid grid-cols-2 gap-2" : "w-full"
                  } `}
                >
                  {editId ? (
                    // Show both inputs when editing
                    <>
                      <Select
                        required
                        label="Priority"
                        value={watch("priority")}
                        placeholder="Choose Priority"
                        error={errors.priority?.message}
                        options={Priority}
                        onChange={(selectedValue) => {
                          handleInputChange("priority");
                          setValue("priority", selectedValue);
                        }}
                      />
                      <Select
                        label="Status"
                        value={watch("status")}
                        placeholder="Choose Status"
                        error={errors.status?.message} // Ensure the correct error field is used
                        options={Status}
                        onChange={(selectedValue) => {
                          handleInputChange("status");
                          setValue("status", selectedValue);
                        }}
                      />
                    </>
                  ) : (
                    // Show only the Priority input when adding
                    <Select
                      required
                      label="Priority"
                      value={watch("priority")}
                      placeholder="Choose Priority"
                      error={errors.priority?.message}
                      options={Priority}
                      onChange={(selectedValue) => {
                        handleInputChange("priority");
                        setValue("priority", selectedValue);
                      }}
                    />
                  )}
                </div>

                <div className=" flex justify-end gap-2 pt-3  pb-2">
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
    </div>
  );
}

export default TicketsForm;