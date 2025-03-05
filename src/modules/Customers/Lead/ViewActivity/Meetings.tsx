import { useEffect, useState } from "react"
import ClockIcon from "../../../../assets/icons/ClockIcon"
import MeetingIcon from "../../../../assets/icons/MeetingIcon"
import PanelTopIcon from "../../../../assets/icons/PanelTopIcon"
import Button from "../../../../components/ui/Button"
import Modal from "../../../../components/modal/Modal"
import MeetingForm from "../ViewModals/MeetingForm"
import SearchBar from "../../../../components/ui/SearchBar"
import useApi from "../../../../Hooks/useApi"
import { endPoints } from "../../../../services/apiEndpoints"
import { useParams } from "react-router-dom"
import PlaneIcon from "../../../../assets/icons/PlaneIcon"
import NoRecords from "../../../../components/ui/NoRecords"
import PencilLine from "../../../../assets/icons/PencilLine"
import Trash from "../../../../assets/icons/Trash"
import ConfirmModal from "../../../../components/modal/ConfirmModal"
import toast from "react-hot-toast"
import ChevronDown from "../../../../assets/icons/ChevronDown"
// import Calender from "../ViewModals/Calender"
import CalenderDays from "../../../../assets/icons/CalenderDays"

type Props = {}

const Meetings = ({ }: Props) => {
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    //  const [meetingData, setMeetingData] = useState<any[]>([]);

    // State to manage modal visibility
    const [isModalOpen, setIsModalOpen] = useState({
        addMeeting: false,
        addNotes: false,
    });

    // Function to toggle modal visibility
    const handleModalToggle = (
        addMeeting = false,
        addNotes = false,

    ) => {
        setIsModalOpen((prevState) => ({
            ...prevState,
            addMeeting,
            addNotes,
        }));

        // Fetch meetings only if the modal requires data refresh
        getMeeting()
    };

    const handleEdit = (id: string) => {
        setEditId(id); // Set the ID of the meeting to be edited
        handleModalToggle(true, false); // Open the meeting modal for editing
    };

    const [searchValue, setSearchValue] = useState<string>("");
    const [meetingData, setMeetingData] = useState<any[]>([]);

    // Filter meetings based on search input
    const filteredMeetings = meetingData.filter((meeting) =>
        meeting.meetingTitle?.toLowerCase().includes(searchValue.toLowerCase()) ||
        meeting.meetingType?.toLowerCase().includes(searchValue.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchValue.toLowerCase()) ||
        meeting.meetingLocation?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const { request: getLeadMeeting } = useApi("get", 3001);
    const { request: deleteMeeting } = useApi("delete", 3001);

    const { id } = useParams();

    // Toggle Delete Confirmation Modal
    const deleteModalToggle = (meetingId?: string) => {
        setDeleteOpen((prev) => !prev);
        if (meetingId) {
            setDeleteId(meetingId);
        }
    };

    const getMeeting = async () => {
        setIsLoading(true);
        try {
            const { response, error } = await getLeadMeeting(
                `${endPoints.GET_ALL_LEAD_ACTIVITIES}/${id}`
            );
            if (response && !error) {
                const taskActivities = response.data.activities.filter(
                    (activity: any) => activity?.activityType === "Meeting"
                );
                setMeetingData(taskActivities.reverse());
            } else {
                console.error(error.response.data.message);
            }
        } catch (err) {
            console.error("Error fetching meetings:", err);
        } finally {
            setIsLoading(false); // End loading
        }
    };

    useEffect(() => {
        getMeeting();
    }, []);

    // Handle Delete Function
    const handleDelete = async () => {
        if (!deleteId) {
            toast.error("No note selected for deletion.");
            return;
        }

        try {
            const { response, error } = await deleteMeeting(`${endPoints.LEAD_ACTIVITY}/${deleteId}`);
            if (response) {
                toast.success(response.data.message);
                setMeetingData((prevNotes) => prevNotes.filter((note) => note._id !== deleteId));
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

    // Handle ChevronDown toggle
    const toggleMeetingNotes = (meetingId: string) => {
        setExpandedMeetingId((prevId) => (prevId === meetingId ? null : meetingId));
    };

    return (
        <div>
            <div className="w-full h-fit rounded-lg p-5 gap-5 bg-[#FFFFFF]">
                <div className="flex justify-between">
                    <div className="flex gap-6">
                        <p className="text-[#303F58] text-sm font-bold p-2">Meetings</p>
                        <SearchBar
                            placeholder="Search"
                            searchValue={searchValue}
                            onSearchChange={setSearchValue} // Updates searchValue
                        />
                    </div>
                    <Button
                        onClick={() => {
                            handleModalToggle(true, false,)
                            setEditId("")
                        }}
                        className="text-[#565148] text-base rounded-lg w-fit h-9 bg-[#FEFDFA] border-[#565148]"
                        variant="secondary"
                    >
                        +<span className="text-xs">Add Meeting</span>
                    </Button>
                </div>



                {isLoading ? (
                    // Skeleton for loading state
                    <div>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse space-y-4 bg-gray-100 p-4 rounded-lg">
                                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-2/4"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredMeetings.length > 0 ? (
                    filteredMeetings.map((meeting) => (
                        <div
                            className="bg-[#FAFAFA] w-full h-fit rounded-xl my-5 py-3"
                            key={meeting.id || meeting.meetingTitle}
                        >
                            <div className="flex justify-between p-5">
                                <div className="flex gap-3">
                                    <PanelTopIcon size={36} />
                                    <p className="mt-2 text-[#303F58] text-xs font-semibold">
                                        {meeting?.dueDate
                                            ? new Date(meeting.dueDate).toLocaleDateString("en-GB") // en-GB formats as dd/mm/yyyy
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[#4B5C79] text-xs font-semibold">
                                        {new Date(meeting?.updatedAt).toLocaleString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between px-5 ms-4">
                                <div className="flex gap-2">
                                    <MeetingIcon />
                                    <p className="text-[#4B5C79] text-xs font-medium">
                                        Meeting Type:{" "}
                                        <span className="text-[#303F58] text-xs font-semibold">
                                            {meeting?.meetingType || "N/A"}
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-[#54B86DE0] w-fit h-6 py-1 px-4 rounded-2xl">
                                    <p className="text-[#FFFFFF] text-xs font-semibold">Scheduled</p>
                                </div>
                            </div>
                            <div className="my-3 px-5 ms-4 flex gap-2">
                                <CalenderDays color="#303F58" size={14} />
                                <p className="text-[#4B5C79] text-xs font-medium">
                                    Date:{" "}
                                    <span className="text-[#303F58] text-xs font-semibold">
                                        {meeting?.dueDate || "N/A"}
                                    </span>
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <div className="my-3 px-5 ms-4 flex gap-2">
                                    <ClockIcon size={14} />
                                    <p className="text-[#4B5C79] text-xs font-medium">
                                        Time:{" "}
                                        <span className="text-[#303F58] text-xs font-semibold">
                                            {meeting?.timeFrom || "N/A"} - {meeting?.timeTo || "N/A"}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex me-6 my-2">
                                    <div>
                                        <p className="my-3 text-xs font-medium text-[#4B5C79]">Notes</p>
                                    </div>
                                    {meeting.meetingNotes && ( // Render only if meetingNotes exist
                                        <button
                                            onClick={() => toggleMeetingNotes(meeting._id)}
                                            className="focus:outline-none"
                                        >
                                            <ChevronDown
                                                size={20}
                                                color={expandedMeetingId === meeting._id ? "#303F58" : "#768296"}
                                            />
                                        </button>
                                    )}
                                </div>

                            </div>
                            <div className="flex justify-between px-5 ms-4">
                                <div className="flex gap-2">
                                    <PlaneIcon size={14} />
                                    <p className="text-[#4B5C79] text-xs font-medium">
                                        Location:{" "}
                                        <span className="text-[#303F58] text-xs font-semibold">
                                            {meeting.location || "N/A"}, {meeting.meetingLocation || "N/A"}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-3">

                                    <div className="">
                                        <div
                                            className="ms-1 cursor-pointer"
                                            onClick={() => handleEdit(meeting._id)}
                                        >
                                            <PencilLine color="#303F58" size={16} />
                                        </div>
                                        <p className="text-[#303F58] text-xs font-normal mt-1">Edit</p>
                                    </div>
                                    <div className="cursor-pointer ms-2" onClick={() => deleteModalToggle(meeting?._id)}>
                                        <Trash color="#303F58" size={16} />
                                        <p className="text-[#303F58] text-xs font-normal mt-1 -ml-2">Delete</p>
                                    </div>

                                </div>

                            </div>
                            {/* Expanded Notes Section */}
                            {expandedMeetingId === meeting._id && meeting.meetingNotes && ( // Show section only if meetingNotes exist
                                <div className="p-2 mx-2 mt-3 px-7 bg-[#FFFF] rounded-lg text-[#4B5C79] text-sm">
                                    <p className="text-[#303F58] text-sm font-medium">Meeting Notes:</p>
                                    <p className="text-[#4B5C79] text-xs font-normal mt-2">
                                        {meeting?.meetingNotes || "N/A"}
                                    </p>
                                </div>
                            )}


                        </div>

                    ))
                ) : (
                    <NoRecords text="No Meeting Found" imgSize={90} textSize="md" />
                )}

            </div>

            {/* Modal controlled by state */}
            <Modal
                className="w-[45%]"
                open={isModalOpen.addMeeting}
                onClose={() => handleModalToggle()}
            >
                <MeetingForm editId={editId} onClose={() => handleModalToggle()} />
            </Modal>



            <Modal open={deleteOpen} align="center" onClose={() => deleteModalToggle()} className="w-[30%]">
                <ConfirmModal
                    action={handleDelete}
                    prompt="Are you sure want to delete this note?"
                    onClose={() => deleteModalToggle()}
                />
            </Modal>
        </div>
    );
};

export default Meetings;


