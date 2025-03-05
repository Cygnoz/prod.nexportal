import BuildingIcon from "../../assets/icons/BuildingIcon";
import EmailIcon from "../../assets/icons/EmailIcon";
import PhoneIcon from "../../assets/icons/PhoneIcon";
// import Input from "../../components/form/Input";
// import pic from "../../assets/image/IndiaLogo.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../Hooks/useApi";
import { endPoints } from "../../services/apiEndpoints";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ChevronRight from "../../assets/icons/ChevronRight";
import SAImage from '../../assets/image/SAImage.png'
import CygnozLogo from '../../assets/image/CygnozLogo.png'
import NoImage from "../../components/ui/NoImage";

import 
io, 
{ Socket } from "socket.io-client";
import ArrowRight from "../../assets/icons/ArrowRight";
import { useUser } from "../../context/UserContext";
import NoRecords from "../../components/ui/NoRecords";
import toast from "react-hot-toast";
const AGENT_SOCKET_URL =import.meta.env.VITE_REACT_APP_TICKETS
type Props = {};


const LiveChat = ({}: Props) => {
  
  const {user}=useUser()
  const [initialCurrentRoom,setInitialCurrentRoom]=useState<any>(null)
  const [socket, setSocket] = useState<Socket | null>(null);
  const {request:getClientChats}=useApi('get',3004)
  const {request:getChatHistory}=useApi('get',3004)
  const [loading, setLoading] = useState(false); 
  const textareaRef:any = useRef(null);
  // const [content, setContent] = useState<string>("");
  const Priority = [
    { label: "Low", color: "#4CAF50" }, // Green for Low priority
    { label: "Medium", color: "#FFC107" }, // Yellow/Amber for Medium priority
    { label: "High", color: "#F44336" }, // Red for High priority
  ];
  const Status = [
    { label: "Open", color: "#60A5FA" }, // Green (Bright & Readable)
    { label: "Resolved", color: "#34D399" }, // Blue (Indicates Completion)
    { label: "In progress", color: "#FACC15" }, // Yellow (Indicates Work in Progress)
  ];
  

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [clientHistory,setClientHistory]=useState<any[]>([])
  const chatBoxRef:any = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const navigate = useNavigate();

  const { request: getaTicket } = useApi("get", 3004);
  const { id } = useParams();
  const [ticketData, setTicketData] = useState<any>();

  const getOneTicket = async () => {
    try {
      const { response, error } = await getaTicket(
        `${endPoints.TICKETS}/${id}`
      );
      if (response && !error) {
        const Tickets = response.data; // Return the fetched data
        console.log("tickets", Tickets);
        setTicketData(Tickets);
        setInitialCurrentRoom(Tickets)
        getClientHistory(Tickets?.customerId?._id);
        return Tickets
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Tickets data:", error);
      }
    } catch (err) {
      console.error("Error fetching Tickets data:", err);
    }
 
  };

  

  

  

 


  useEffect(() => {
    // const newSocket = io(AGENT_SOCKET_URL, {
    //   path: "/nexsell-tickets/socket.io/", // Ensure this matches your backend
    //   transports: ["websocket", "polling"], // Force WebSocket first
    //   withCredentials: true, // Include credentials if needed
    //   secure: true,
    // });
    const newSocket = io(AGENT_SOCKET_URL);
    setSocket(newSocket)
  
    newSocket.emit("joinRoom", id);
    
    newSocket.on("chatHistory", (chatHistory: any) => {
      setMessages(chatHistory);
    });
  
    newSocket.on("newMessage", (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
    });
  
    return () => {
      newSocket.disconnect();
    };
  
  }, [id, AGENT_SOCKET_URL]);
  


  

  // useEffect(() => {
  //   if (ticketData?.customerId?._id) {
     
  //   }
  // }, [ticketData,id]);


  // const getClientHistory = async (customerId?: any) => {
  //   setLoading(true); // Set loading to true before making the API call
  
  //   try {
  //     const { response, error } = await getClientChats(`${endPoints.CHATS_LEAD}/${customerId}`);
  //     console.log("res",response);
      
  //     if (response && !error) {
  //     setClientHistory(response?.data.data)
  //     } else {
  //       console.log("err", error.response.data);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching client history:", err);
  //   } finally {
  //     setLoading(false); // Set loading to false after the API call completes
  //   }
  // };

  const getClientHistory = async (customerId?: any) => {
    setLoading(true); // Set loading to true before making the API call
  
    try {
      const { response, error } = await getClientChats(`${endPoints.CHATS_LEAD}/${customerId}`);
      console.log("Initial Response:", response?.data.data);
  
      if (response && !error) {
        const chatHistory = await Promise.all(
          response?.data.data.map(async (item: any) => {
            // Check if ticketId is valid
            if (!item?.ticketId) {
              console.warn("Ticket ID is undefined or invalid for item:", item);
              return {
                ticketDetails: null,
                messages: item.messages || [],
              };
            }
  
            // Fetch ticket details
            console.log("Fetching ticket details for ticketId:", item?.ticketId);
            const { response, error } = await getaTicket(`${endPoints.TICKETS}/${item?.ticketId}`);
            if (error) {
              console.error("Error fetching ticket details for ticketId:", item?.ticketId, error);
              return {
                ticketDetails: null,
                messages: item.messages || [],
              };
            }
  
            console.log("Ticket details fetched successfully for ticketId:", item?.ticketId, response?.data);
            return {
              ticketDetails: response?.data,
              messages: item.messages || [],
            };
          })
        );
  
        console.log("Chat History Before Filtering:", chatHistory);
  
        // Filter out items with null ticketDetails
        const filteredChatHistory = chatHistory.filter(history => history.ticketDetails !== null);
  
        console.log("Filtered Chat History:", filteredChatHistory);
       
        // Find the current room
        const currentRoom = filteredChatHistory.find(history => history?.ticketDetails?._id === id);
        console.log("current",currentRoom);
        
  
        if (currentRoom) {
          // Remove the current room from the history and reverse the rest
          const remainingHistory = filteredChatHistory.filter(history => history?.ticketDetails?._id !== id).reverse();
  
          // Prepend the current room chat to the top of the reversed history
          const updatedHistory = [currentRoom, ...remainingHistory];
          console.log("Updated Chat History:", updatedHistory);
  
          // Update the state
          setClientHistory(updatedHistory);
        }else{
          setClientHistory(filteredChatHistory);
        }
        
       
      } else {
        console.log("Error in initial API call:", error?.response?.data);
      }
    } catch (err) {
      console.error("Error fetching client history:", err);
    } finally {
      setLoading(false); // Set loading to false after the API call completes
    }
  };


  
  
 

  useEffect(() => {
 getOneTicket();
    getChatHis()
  }, [id]);





  const getChatHis=async()=>{
    try{
      const {response,error}=await getChatHistory(`${endPoints.CHAT_HISTORY}/${id}`)      
      if(response && !error){
        setMessages(response.data?.data?.reverse())
        
      }
    }catch(err){
      console.log("er",err); 
      
    }
  }



  
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const plainText = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }).trim();
    if (message.trim()&&message.length > 0 && socket ) {
      socket.emit("sendMessage", {
        ticketId:id,
        senderId:ticketData?.supportAgentId?._id ,
        receiverId:ticketData?.customerId?.email,
        message,
      });
      if(messages.length==1){
        getClientHistory(ticketData?.customerId?._id);
      }
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "19px"; // Reset height to auto
 
      }
    }
  };

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  // }

  

  function formatTime(isoString:any) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}.${formattedMinutes} ${ampm}`;
}

const handleInput = (e:any) => {
  const textarea = e.target;
  textarea.style.height = "auto"; // Reset the height
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight); // Get the line height
  const maxHeight = lineHeight * 3; // Max height for 3 rows
  const minHeight = lineHeight * 1; // Min height for 1 row

  // Set the new height within bounds
  textarea.style.height = `${Math.min(
    Math.max(textarea.scrollHeight, minHeight),
    maxHeight
  )}px`;

  setMessage(textarea.value);
};

const handleKeyDown = (e:any) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevents adding a new line
    handleSubmit(e); // Manually trigger the form submission
  }
};
const handleRoomClicked = (history?: any) => {
  if(messages.length>0){
    if (!history) return; // Handle undefined case
    setMessage("")
     const { ticketDetails, messages = [] } = history; // Ensure messages is defined   
     setMessages([]); // Clear previous messages
     setTimeout(() => {
       setMessages([...messages].reverse()); // Set new messages
     }, 0);
   
     setTicketData(ticketDetails);
     if(messages.length==1){
      getClientHistory(ticketData?.customerId?._id);
    }
  }else{
    toast.error("Please start chat with this Client!")
  }
 
};



console.log("messages",messages);


  return (
    <>
      <div className="h-auto">
        <div className="grid grid-cols-12 bg-white shadow-md  h-full rounded-md">
          <div className="col-span-2 p-2  h-full">
          <div className="flex items-center text-[16px] my-2 space-x-2">
          <p onClick={()=>navigate('/ticket')}  className="font-bold cursor-pointer  text-[#820000] ">Ticket</p>
          <ChevronRight color="#4B5C79" size={18} />
          <div className="rounded-full flex items-center my-3 space-x-2">
              {ticketData?.customerId?.image ? (
                <img
                  className="w-6 h-6  rounded-full"
                  src={ticketData?.customerId?.image}
                  alt=""
                />
              ) : (
                <NoImage roundedSize={25} iconSize={14} />
              )}
              <h2 className="font-medium text-sm text-[#4B5C79]">
                {ticketData?.customerId?.firstName}
              </h2>
            </div>
        </div>
            
            <hr />
            <h1 className="font-normal text-[#303F58] text-sm mt-3">
              Assignee
            </h1>
            <div className="rounded-full  flex items-center my-3 space-x-2">
              {ticketData?.supportAgentId?.user?.userImage ? (
                <img
                  className="w-6 h-6 rounded-full"
                  src={ticketData?.supportAgentId?.user?.userImage}
                  alt=""
                />
              ) : (
                <NoImage roundedSize={25} iconSize={14} />
              )}

              <h2 className="font-medium text-sm   text-[#4B5C79]">
                {ticketData?.supportAgentId?.user?.userName}
              </h2>
            </div>

            <hr />
            <div className="mt-3 my-2">
              <h1 className="mt-2 font-normal text-sm">Desciption</h1>

              <h1 className="mt-3  font-normal text-sm text-[#4B5C79]">
                {ticketData?.description}
              </h1>
            </div>
            <hr />
            <div className="mt-3 my-2">
              <h1 className="mt-2 font-normal text-sm">Priority</h1>
              <div className="flex items-center">
                {Priority.map((priority) => {
                  if (priority.label === ticketData?.priority) {
                    return (
                      <div key={priority.label} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mt-3"
                          style={{ backgroundColor: priority.color }}
                        ></div>
                        <h1 className="mt-3 ml-2 font-normal text-sm text-[#4B5C79]">
                          {ticketData?.priority}
                        </h1>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
           
         
          </div>

          <div className="col-span-7 h-full flex flex-col justify-between   border">
           
             
                {/* Header */}
                <div className="border-b p-2 flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-800">
                  {ticketData?.subject}
                  </h1>
                  <div className="mt-3 my-2">
              <div className="flex items-center">
                {Status.map((status) => {
                  if (status.label === ticketData?.status) {
                    return (
                      <div key={status.label} className="flex items-center">
                       
                        <h1 style={{ backgroundColor: status.color }} className="py-1 px-2 rounded-md font-normal text-sm text-[#0f0f0f]">
                          {ticketData?.status}
                        </h1>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
             
            </div>
                </div>

                {/* Chat Box */}
                <div ref={chatBoxRef} className={`p-2 space-y-4 h-[68vh] scroll-smooth overflow-auto hide-scrollbar`}>
  {messages.map((msg,index:any) => (
    <div
    key={index} // Using ticketId as key to avoid issues with duplicate chatId
      className={`flex ${
        msg.senderId ===ticketData?.supportAgentId?._id ? "justify-end" : "justify-start"
      }`}
    >
    <div className="flex flex-col">
   {msg.senderId ===ticketData?.supportAgentId?._id?
    <div className="flex gap-2 items-center justify-end w-full">
    
      <div className="flex justify-end items-center gap-2">
          <p className="text-xs text-gray-500  ">
           {formatTime(msg?.createdAt)} 
          </p>
          <div className="bg-[#787878] h-2 w-2 rounded-full"/>

   
          <p className="text-sm font-bold text-[#4B5C79]">
            {ticketData?.supportAgentId?.user?.userName}
          </p>
         
        </div>
       
        {ticketData?.supportAgentId?.user?.userImage ? (
                <img
                  className="w-8 h-8 rounded-full"
                  src={ticketData?.supportAgentId?.user?.userImage}
                  alt=""
                />
              ) : (
                <img src={SAImage} className='w-8 h-8 rounded-full ' alt="" />
              )}
     </div>:
     <div className="flex gap-2 items-center">
   
   {ticketData?.customerId?.image ? (
                <img
                  className="w-6 h-6  rounded-full"
                  src={ticketData?.customerId?.image}
                  alt=""
                />
              ) : (
                <NoImage roundedSize={25} iconSize={14} />
              )}
      
      <div className="flex justify-end items-center gap-2">
          <p className="text-sm font-bold text-[#4B5C79]">
             {msg.senderId?.name}
          </p>
          <div className="bg-[#787878] h-2 w-2 rounded-full"/>
          <p className="text-xs text-gray-500  ">
          {formatTime(msg?.createdAt)}
          </p>
        </div>
     </div>
     }
     <div
  className={`ml-4 flex ${
    msg.senderId === ticketData?.supportAgentId?._id ?"justify-end" : "justify-start"
  }`}
>
  <p
    className={`mt-1 p-2 text-sm rounded-xl text-gray-700 ${
      msg.senderId === ticketData?.supportAgentId?._id
        ? "bg-[#E3E6D580] me-3  rounded-tr-none text-start"
        : "bg-[#EEEEEE80]  me-6  rounded-tl-none "
    }`}
    style={{
      overflowWrap: "break-word", // Ensures long words break to the next line
      wordBreak: "break-word", // Additional support for word breaking
      maxWidth: "100%",// Prevents horizontal overflow
    }}
  >
    {msg.message}
  </p>
</div>

    </div>
    </div>
  ))}
</div>


                {/* Reply Section */}
                {/* <form onSubmit={handleSubmit} className="border rounded-md p-3 bg-white flex items-end gap-2"> */}
  {/* Typing Area */}
 {/* <div className="w-[89%]">

   <ReactQuill
    placeholder="Type Something..."
    value={content}
    onChange={handleChange}
    className="w-full rounded-md flex-1"
    theme="snow"
    modules={{
      toolbar: "#custom-toolbar", // Attach custom toolbar
    }}
  />
   

  {/* Toolbar at the bottom */}
  {/* <div id="custom-toolbar" className="flex items-center p-2 space-x-2 border-t bg-gray-100">
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>
    <button className="ql-underline"></button>
    <button className="ql-strike"></button>
    <select className="ql-color"></select>
    <select className="ql-background"></select>
    <button className="ql-link"></button>
    <button className="ql-list" value="ordered"></button>
    <button className="ql-list" value="bullet"></button>
    
  </div> */}
 {/* </div> */} 
  {/* <Button
      variant="primary"
      className="h-10 px-4 text-white bg-red-800 rounded-md hover:bg-red-700 focus:outline-none"
      size="lg"
      type="submit"
    >
      Send
    </Button> */}
     <form onSubmit={handleSubmit} className="border rounded-md   bg-white flex items-center gap-2 p-3">
         
         <img src={CygnozLogo} className='w-[22px]' alt="" />
         
        
         <textarea
  ref={textareaRef}
  value={message}
  readOnly={ ticketData?.status === "Resolved" || user?.role !== "Support Agent" ||initialCurrentRoom?._id!==ticketData?._id}
  onKeyDown={handleKeyDown}
  onChange={(e) => handleInput(e)}
  className="text-black w-full text-sm focus:outline-none overflow-x-auto resize-none hide-scrollbar"
  placeholder="Type Something..."
  rows={1}
/>
         <div className='flex space-x-2 items-center'>
           {/* <Mic/> */}
         <button type='submit' className="w-10 h-10 flex items-center justify-center rounded-full  bg-gradient-to-r from-[#5A0000] to-[#A80000] ">
          <ArrowRight color='white' size={15}/>
    
          </button>
         </div>
       </form>
{/* </form> */}





             
            
          </div>

          <div className="col-span-3 p-3 ">
            <div className="rounded-full flex items-center my-3 space-x-2">
              {ticketData?.customerId?.image ? (
                <img
                  className="w-6 h-6  rounded-full"
                  src={ticketData?.customerId?.image}
                  alt=""
                />
              ) : (
                <NoImage roundedSize={25} iconSize={14} />
              )}
              <h2 className="font-medium text-sm text-[#4B5C79]">
                {ticketData?.customerId?.firstName}
              </h2>
            </div>
            <hr />
            <div className="mt-3 my-2">
              <div className="flex mt-2">
                <BuildingIcon size={16} />
                <h1 className="-mt-1 font-normal text-sm ms-2">Organization</h1>
              </div>
              <h1 className="mt-3 font-normal text-sm">
                {ticketData?.customerId?.organizationName
                  ? ticketData?.customerId?.organizationName
                  : "N/A"}
              </h1>
            </div>
            <hr />
            <div className="mt-3 my-2">
              <div className="flex mt-1">
                <EmailIcon size={16} />
                <h1 className=" font-normal text-sm ms-2">Email</h1>
              </div>
              <h1 className="mt-3 font-normal text-sm">
                {ticketData?.customerId?.email
                  ? ticketData?.customerId?.email
                  : "N/A"}
              </h1>
            </div>
            <hr />
            <div className="mt-3 my-2">
              <div className="flex mt-1">
                <PhoneIcon size={16} />
                <h1 className=" font-normal text-sm ms-2">Phone</h1>
              </div>
              <h1 className="mt-3 font-normal text-sm">
                {ticketData?.customerId?.phone
                  ? ticketData?.customerId?.phone
                  : "N/A"}
              </h1>
            </div>
            <hr />
            {/* <h1 className="mt-3 font-normal text-sm ">Notes</h1>
            <div className="mt-1">
              <Input />
            </div> */}

            <div>
  <h1 className="mt-2 text-sm font-semibold mb-2">Interaction History</h1>
  <div className={`ps-2 ${clientHistory?.length > 5 && 'custom-scrollbar overflow-y-scroll'} h-96`}>
  {loading ? (
    // Skeleton UI while loading
    Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="relative p-2 animate-pulse">
        <div className="absolute top-0 -ml-3 h-full border-l-2 border-gray-300"></div>
        <span className="absolute -left-4 top-0 h-3 w-3 bg-gray-300 rounded-full ml-2"></span>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 gap-4 ml-3 flex mt-2">
            <p className="font-normal text-xs bg-gray-300 h-4 w-16 rounded"></p>
            <p className="font-normal text-xs bg-gray-300 h-4 w-16 rounded"></p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="ml-3 font-semibold text-xs bg-gray-300 h-4 w-32 rounded"></p>
          <button className="px-3 py-1 text-sm bg-gray-300 rounded h-6 w-16"></button>
        </div>
      </div>
    ))
  ) : (
    // Actual content when data is loaded
    clientHistory.length>0?clientHistory?.map((history, index) => {
      const { ticketDetails } = history;
      const { createdAt, subject, status } = ticketDetails;

      // Format the date and time
      const date = new Date(createdAt).toLocaleDateString();
      const time = new Date(createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const isSelected = ticketData._id === history?.ticketDetails?._id;

      return (
        <div
          key={index}
          className={`relative cursor-pointer transition-colors duration-200 p-2 
            ${isSelected ? "bg-gray-200" : "hover:bg-gray-200"}`}
          onClick={() => handleRoomClicked(history)}
        >
          <div className="absolute top-0 -ml-3 h-full border-l-2 border-gray-300"></div>
          <span className="absolute -left-4 top-0 h-3 w-3 bg-red-700 rounded-full ml-2"></span>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 gap-4 ml-3 flex mt-2">
              <p className="font-normal text-xs">{date}</p>
              <p className="font-normal text-xs">{time}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="ml-3 font-semibold text-xs">{subject}</p>
            <button
              className="px-3 py-1 text-sm rounded flex justify-between items-center gap-2"
              style={{
                backgroundColor:
                  Status.find((s) => s.label === status)?.color || "#e5e7eb",
                color: "#0f0f0f",
              }}
            >
              {status}
              {initialCurrentRoom?._id === history?.ticketDetails?._id && (
                <p className="h-3 animate-pulse w-3 rounded-full bg-red-500"></p>
              )}
            </button>
          </div>
        </div>
      );
    }
  ):
  
    <NoRecords
    text="No History Found"
    parentHeight="360px"
    imgSize={70}
    textSize="sm"
  />
  )}
</div>
</div>

          </div>
        </div>
      </div>
    </>
  );
};

export default LiveChat;