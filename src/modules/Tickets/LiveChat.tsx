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
import SAImage from "../../assets/image/SAImage.png";
import CygnozLogo from "../../assets/image/CygnozLogo.png";
import NoImage from "../../components/ui/NoImage";

import ArrowRight from "../../assets/icons/ArrowRight";
import { useUser } from "../../context/UserContext";
import NoRecords from "../../components/ui/NoRecords";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import UploadsViewModal from "./UploadsViewModal";
import Modal from "../../components/modal/Modal";
import { useSocket } from "../../context/SocketContext";
import TickMark from "../../assets/icons/TickMark";

type Props = {};

const LiveChat = ({}: Props) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const [initialCurrentRoom, setInitialCurrentRoom] = useState<any>(null);
  const { request: getClientChats } = useApi("get", 3004);
  const { request: getChatHistory } = useApi("get", 3004);
  const [loading, setLoading] = useState(false);
  const [isModal, setIsModal] = useState(false);

  // const [isOnline,setIsOnline]=useState(false)
  const textareaRef: any = useRef(null);
  // const [content, setContent] = useState<string>("");
  const Priority = [
    { label: "Low", color: "#4CAF50" }, // Green for Low priority
    { label: "Medium", color: "#FFC107" }, // Yellow/Amber for Medium priority
    { label: "High", color: "#F44336" }, // Red for High priority
  ];
  const Status = [
    { label: "Open", color: "#60A5FA" }, // Blue (Indicates a new issue)
    { label: "Resolved", color: "#A78BFA" }, // Violet (Indicates resolution)
    { label: "In progress", color: "#FACC15" }, // Yellow (Indicates work in progress)
    { label: "Closed", color: "#34D399" }, // Green (Indicates finalization)
  ];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const chatBoxRef: any = useRef(null);

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
        setInitialCurrentRoom(Tickets);
        getClientHistory(Tickets?.customerId?.email);
        return Tickets;
      } else {
        // Handle the error case if needed (for example, log the error)
        console.error("Error fetching Tickets data:", error);
      }
    } catch (err) {
      console.error("Error fetching Tickets data:", err);
    }
  };

  const handleModalToggle = () => {
    setIsModal((prev) => !prev);
  };

  useEffect(() => {
    if (ticketData && id) {
      socket.emit("joinRoom", id, ticketData?.supportAgentId?.user?._id);
      socket.on("roomUsers", (users) => {
        console.log("Users in room:", users);
        if (users.length > 1) {
          console.log("Both users are in the room");
          // setIsOnline(true)
          setMessages((prevMessages) =>
            prevMessages.map((msg: any) =>
              msg.receiverId?._id === ticketData?.customerId?._id
                ? { ...msg, isRead: true }
                : msg
            )
          );

          // socket.emit("markAsRead",ticketData?.supportAgentId?.user?._id,id)
        } else {
          // setIsOnline(false)
        }
      });

      const handleNewMessage = (newMessage: any) => {
        setMessages((prev) => [...prev, newMessage]);
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.emit("leaveRoom", {
          ticketId: id,
          userId: ticketData?.supportAgentId?.user?._id,
        });
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [id, ticketData]);

  const getClientHistory = async (customerMail?: string) => {
    setLoading(true); // Start loading
  
    try {
      const { response, error } = await getClientChats(
        `${endPoints.CHATS_LEAD}/${customerMail}`
      );
  
      if (response?.data?.data) {
        let filteredChatHistory = response.data.data;
  
        console.log("Initial Response:", filteredChatHistory);
  
        // Sort history by updatedAt (descending)
        filteredChatHistory = filteredChatHistory.sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
  
        // Find the current room by ID
        const currentRoom = filteredChatHistory.find(
          (history: any) => history?.ticketDetails?._id === id
        );
  
        let updatedHistory = [];
  
        if (currentRoom) {
          // Remove current room from the list
          const remainingHistory = filteredChatHistory.filter(
            (history: any) => history?.ticketDetails?._id !== id
          );
  
          updatedHistory = [currentRoom, ...remainingHistory];
          console.log("Updated Chat History:", updatedHistory);
        } else {
          updatedHistory = filteredChatHistory;
        }
  
        setClientHistory(updatedHistory);
      } else {
        console.log("Error in initial API call:", error?.response?.data || error);
      }
    } catch (err) {
      console.error("Error fetching client history:", err);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  

  useEffect(() => {
    getOneTicket();
    getChatHis();
  }, [id]);
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const getChatHis = async () => {
    try {
      const { response, error } = await getChatHistory(
        `${endPoints.CHAT_HISTORY}/${id}`
      );
      if (response && !error) {
        setMessages(response.data?.data?.reverse());
      }
    } catch (err) {
      console.log("er", err);
    }
  };

  //  useEffect(()=>{
  //  if(isOnline){
  //   getChatHis()
  //  }
  //  },[isOnline])

  console.log("ticket", ticketData);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const plainText = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }).trim();
    if (message.trim() && message.length > 0 && socket) {
      socket.emit("sendMessage", {
        ticketId: id,
        senderId: ticketData?.supportAgentId?.user?._id,
        receiverId: ticketData?.customerId?.email,
        message,
        role:"Agent"
      });
      if (messages.length == 1) {
        getClientHistory(ticketData?.customerId?.email);
      }
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "19px"; // Reset height to auto
      }
    }
  };

  function formatTime(isoString: any) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}.${formattedMinutes} ${ampm}`;
  }

  const handleInput = (e: any) => {
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

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents adding a new line
      handleSubmit(e); // Manually trigger the form submission
    }
  };
  const handleRoomClicked = (history?: any) => {
    if (messages.length > 0) {
      if (!history) return; // Handle undefined case
      setMessage("");
      const { ticketDetails, messages = [] } = history; // Ensure messages is defined
      setMessages([]); // Clear previous messages
      setTimeout(() => {
        setMessages([...messages].reverse()); // Set new messages
      }, 0);

      setTicketData(ticketDetails);
      if (messages.length == 1) {
        getClientHistory(ticketData?.customerId?.email);
      }
    } else {
      toast.error("Please start chat with this Client!");
    }
  };

  console.log("messages", messages);

  return (
    <>
      <div className="h-auto">
        <div className="grid grid-cols-12 bg-white shadow-md  h-full rounded-md">
          <div className="col-span-2 p-2  h-full">
            <div className="flex items-center text-[16px] my-2 space-x-2">
              <p
                onClick={() => navigate("/ticket")}
                className="font-bold cursor-pointer  text-[#820000] "
              >
                Ticket
              </p>
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

            {ticketData?.choice?.length > 0 &&
              ticketData.choice.map((txt: any, index: number) => {
                if (!txt || Object.keys(txt).length === 0) return null; // Skip if empty or invalid

                const [key, rawValue] = Object.entries(txt)[0];
                if (!key) return null;

                const value = String(rawValue);

                return (
                  <div key={index}>
                    <hr />
                    <div className="mt-3 my-2">
                      <h2 className="mt-2 font-normal text-sm">{key}</h2>
                      <h1 className="mt-3 font-normal text-sm text-[#4B5C79]">
                        {value}
                      </h1>
                    </div>
                  </div>
                );
              })}

{Array.isArray(ticketData?.text) && ticketData.text.length > 0 &&
  ticketData.text.map((txt: any, index: number) => {
    if (!txt || Object.keys(txt).length === 0) return null; // Skip if txt is empty or invalid

    const entries = Object.entries(txt);
    if (entries.length === 0) return null; // Extra safety check

    const [key, rawValue] = entries[0];
    const value = String(rawValue ?? ''); // Handle undefined/null values safely

    return (
      <div key={index}>
        <hr />
        <div className="mt-3 my-2">
          <h2 className="mt-2 font-normal text-sm">{key}</h2>
          <h1 className="mt-3 font-normal text-sm text-[#4B5C79]">
            {value}
          </h1>
        </div>
      </div>
    );
  })}


            {ticketData?.uploads.length > 0 && (
              <>
                <hr />
                <Button
                  variant="primary"
                  className="h-8 text-sm border rounded-lg mt-2"
                  size="lg"
                  onClick={handleModalToggle}
                >
                  Uploads
                </Button>
              </>
            )}
          </div>

          <div className="col-span-7 h-full flex flex-col justify-between   border">
            {/* Header */}
            <div className="border-b p-2 flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-800">
                {ticketData?.subject}
              </h1>
              {/* <div className="flex items-center space-x-2">
  <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
  <p>{isOnline ? "Online" : "Offline"}</p>
</div> */}

              <div className="mt-3 my-2">
                <div className="flex items-center">
                  {Status.map((status) => {
                    if (status.label === ticketData?.status) {
                      return (
                        <div key={status.label} className="flex items-center">
                          <h1
                            style={{ backgroundColor: status.color }}
                            className="py-1 px-2 rounded-md font-normal text-sm text-[#0f0f0f]"
                          >
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
            <div
              ref={chatBoxRef}
              className={`p-2 space-y-4 h-[68vh] scroll-smooth overflow-auto hide-scrollbar`}
            >
              {messages.map((msg, index: any) => (
                <div
                  key={index} // Using ticketId as key to avoid issues with duplicate chatId
                  className={`flex ${
                    msg.senderId?.role === "Support Agent"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="flex flex-col">
                    {msg.senderId?.role === "Support Agent" ? (
                      <div className="flex gap-2 items-center justify-end w-full">
                        <div className="flex justify-end items-center gap-2">
                          <p className="text-xs text-gray-500  ">
                            {formatTime(msg?.createdAt)}
                          </p>
                          <div className="bg-[#787878] h-2 w-2 rounded-full" />

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
                          <img
                            src={SAImage}
                            className="w-8 h-8 rounded-full "
                            alt=""
                          />
                        )}
                      </div>
                    ) : (
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
                          <div className="bg-[#787878] h-2 w-2 rounded-full" />
                          <p className="text-xs text-gray-500  ">
                            {formatTime(msg?.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div
                      className={`ml-4 flex ${
                        msg.senderId?.role === "Support Agent"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`mt-1  text-sm rounded-xl text-gray-700 ${
                          msg.senderId?.role === "Support Agent"
                            ? "bg-[#E3E6D580] me-3  rounded-tr-none text-start px-2 py-1"
                            : "bg-[#EEEEEE80]  me-6  rounded-tl-none p-2"
                        }`}
                        style={{
                          overflowWrap: "break-word", // Ensures long words break to the next line
                          wordBreak: "break-word", // Additional support for word breaking
                          maxWidth: "100%", // Prevents horizontal overflow
                        }}
                      >
                        <p> {msg.message}</p>
                        {msg.senderId?.role === "Support Agent" && (
                          <div className="flex items-center justify-end space-x-1">
                            {msg?.isRead ? (
                              <TickMark isRead={true} />
                            ) : (
                              <TickMark isRead={false} />
                            )}
                          </div>
                        )}
                      </div>
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
            <form
              onSubmit={handleSubmit}
              className="border rounded-md   bg-white flex items-center gap-2 p-3"
            >
              <img src={CygnozLogo} className="w-[22px]" alt="" />

              <textarea
                ref={textareaRef}
                value={message}
                readOnly={
                  ticketData?.status === "Closed" ||
                  user?.role !== "Support Agent" ||
                  initialCurrentRoom?._id !== ticketData?._id
                }
                onKeyDown={handleKeyDown}
                onChange={(e) => handleInput(e)}
                className="text-black w-full text-sm focus:outline-none overflow-x-auto resize-none hide-scrollbar"
                placeholder="Type Something..."
                rows={1}
              />
              <div className="flex space-x-2 items-center">
                {/* <Mic/> */}
                <button
                  type="submit"
                  className="w-10 h-10 flex items-center justify-center rounded-full  bg-gradient-to-r from-[#5A0000] to-[#A80000] "
                >
                  <ArrowRight color="white" size={15} />
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
              <h1 className="mt-2 text-sm font-semibold mb-2">
                Interaction History
              </h1>
              <div
                className={`ps-2 ${
                  clientHistory?.length > 5 &&
                  "custom-scrollbar overflow-y-scroll"
                } h-96`}
              >
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
                ) : // Actual content when data is loaded
                clientHistory.length > 0 ? (
                  clientHistory?.map((history, index) => {
                    const { ticketDetails } = history;
                    const { updatedAt, subject, status } = ticketDetails;

                    // Format the date and time
                    const date = new Date(updatedAt).toLocaleDateString();
                    const time = new Date(updatedAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    );

                    const isSelected =
                      ticketData._id === history?.ticketDetails?._id;

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
                          <p className="ml-3 font-semibold text-xs">
                            {subject}
                          </p>
                          <button
                            className="px-3 py-1 text-sm rounded flex justify-between items-center gap-2"
                            style={{
                              backgroundColor:
                                Status.find((s) => s.label === status)?.color ||
                                "#e5e7eb",
                              color: "#0f0f0f",
                            }}
                          >
                            {status}
                            {initialCurrentRoom?._id ===
                              history?.ticketDetails?._id && (
                              <p className="h-3 animate-pulse w-3 rounded-full bg-red-500"></p>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
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
      <Modal open={isModal} onClose={handleModalToggle}>
        <UploadsViewModal
          onClose={handleModalToggle}
          data={ticketData?.uploads}
        />
      </Modal>
    </>
  );
};

export default LiveChat;