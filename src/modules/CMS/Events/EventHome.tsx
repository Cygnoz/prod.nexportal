import { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { Category, Post } from "../../../Interfaces/CMS";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import NewCategory from "./NewCategoryModal";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import Modal from "../../../components/modal/Modal";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import Input from "../../../components/form/Input";
import TextArea from "../../../components/form/TextArea";
import { useNavigate } from "react-router-dom";
import NoRecords from "../../../components/ui/NoRecords";
import { useResponse } from "../../../context/ResponseContext";
import ConfirmModal from "../ConfirmModal";

type Props = {}


function EventHome({ }: Props) {
    const [editId, setEditId] = useState("")
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("published");
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [postData, setPostData] = useState<Post[]>([]);
    const [filteredData, setFilteredData] = useState<Post[]>([]);
    const [eventType, setEventType] = useState("online");
    const { request: getAllCategory } = useApi('get', 3001)
    const { request: getAllPost } = useApi('get', 3001)
    const { request: getAPost } = useApi('get', 3001)
    const [draftPosts, setDraftPosts] = useState<Post[]>([]);
    const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
    const [trashPosts, setTrashPosts] = useState<Post[]>([]);


    const location = useNavigate()
    const { cmsMenu } = useResponse()
    const [eventData, setEventData] = useState({
        category: "",
        meetingDate: "",
        startTime: "",
        endTime: "",
        meetingLink: "",
        meetingType: "",
        venueName: "",
        address: "",
        postStatus: ""
    });


    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleContinue = () => {
        if (editId) {
            location(`/cms/events/editevent/${editId}`, { state: eventData });

        } else {
            location("/cms/events/newevent", { state: eventData });
        }
        console.log("event data", eventData);
    };

    useEffect(() => {
        setEventData((prevData) => ({
            ...prevData,
            category: selectedCategory,
            meetingType: eventType,
        }))
    }, [selectedCategory, eventType, editId])

    useEffect(() => {
        if (editId) {
            const getOnePost = async () => {
                const { response, error } = await getAPost(`${endPoints.POSTS}/${editId}`)
                if (response && !error) {
                    console.log("editresponse", response?.data.data);
                    const data = response?.data.data;
                    const body = {
                        ...data,
                        category: data?.category?._id,  // Store category ID
                    }
                    setSelectedCategory(data?.category?._id)
                    setEventData(body)

                }
            }
            getOnePost()
        }
    }, [editId])

    const HandleEditClick = (id: string) => {
        setEditId(id);
        openModal()
    }

    console.log(filteredData);



    const [loading, setLoading] = useState(false); // Add loading state

    const getAllPosts = async () => {
        setLoading(true); // Start loading
        try {
            const { response, error } = await getAllPost(`${endPoints.GET_ALL_POSTS}?postType=Events&project=${cmsMenu.selectedData}`);

            if (response && !error) {
                console.log("response", response.data.data);
                setPostData(response?.data.data);
                setFilteredData(response.data.data);

                const posts = response?.data?.data;
                console.log("response", posts);

                // Set all data
                setPostData(posts);
                // setFilteredData(posts);

                // Separate posts based on postStatus
                const draftData = posts.filter((item: any) => item.postStatus === "Draft");
                const publishedData = posts.filter((item: any) => item.postStatus === "Published");
                const TrashData = posts.filter((item: any) => item.postStatus === "Trash");

                // Set filtered data in separate states
                setDraftPosts(draftData);
                setPublishedPosts(publishedData);
                setTrashPosts(TrashData);


            } else {
                console.error("Error fetching posts:", error);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false); // Stop loading
        }
    };


    useEffect(() => {
        setFilteredData(
            searchValue.trim()
                ? postData.filter((post) =>
                    post.title.toLowerCase().includes(searchValue.toLowerCase())
                )
                : postData
        );
    }, [searchValue, postData]);

    useEffect(() => {
        getAllPosts(); // Fetch data once when component mounts
    }, []);

    const timeAgo = (dateString: any) => {
        if (!dateString) return "Unknown time";
        const postTime = moment(dateString);
        if (!postTime.isValid()) return "Invalid date";
        return postTime.fromNow();
    };

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {

        setModalOpen(false);
    };

    const getCategory = async () => {
        const { response, error } = await getAllCategory(`${endPoints.CATEGORY}?categoryType=Events&project=${cmsMenu.selectedData}`)
        if (response && !error) {
            console.log("response", response.data.data);
            setCategoryData(response?.data.data)
        }
    }
    useEffect(() => {
        getCategory(); // Fetch data once when component mounts
    }, []);

    const CategoryOptions = categoryData.map((category) => ({
        label: category.categoryName, // Display name in dropdown
        value: category._id, // Store _id as value
    }));


    // Handle category selection
    const handleOptionSelection = (selectedOption: { label: string; value: string }) => {
        setSelectedCategory(selectedOption.value); // Store _id in state
    };
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setConfirmModalOpen(true);
    };


    const { request: editPost } = useApi('put', 3001)

    const handleDelete = async (id: string) => {
        console.log("ID to delete:", id); // Log the ID

        // Find the post to update from formData
        const updatedPost = postData.find((item) => item._id === id);

        if (!updatedPost) {
            console.error("Post not found!");
            toast.error("Post not found!");
            return;
        }

        // Update only the postStatus to "Trash"
        const updatedData = {
            ...updatedPost,
            postStatus: "Trash",
        };

        console.log("Updated data to submit:", updatedData); // Log to check update

        try {
            const endPoint = `${endPoints.POSTS}/${id}`;

            // Send only the updated post, not the whole array
            const { response, error } = await editPost(endPoint, updatedData);

            if (response && !error) {
                toast.success(response.data.message);
                getAllPosts()
            } else {
                toast.error(error?.response?.data?.message || "An error occurred");
            }
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Please try again later.");
        }
    };






    // try {
    //     const url = `${endPoints.POSTS}/${id}`;
    //     const { response, error } = await deletePost(url);
    //     if (!error && response) {
    //         toast.success(response.data.message);
    //         getAllPosts()
    //     } else {
    //         toast.error(error.response.data.message);
    //     }
    // } catch (error) {
    //     toast.error("Error in fetching .");
    //     console.error("Error in fetching ", error);
    // }

    return (
        <div>
            <div>
                <div className="flex justify-between items-center flex-col sm:flex-row">
                    <h1 className="text-[#303F58] text-xl font-bold">Posts</h1>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <NewCategory fetchAllCategory={getCategory} />
                        <Button onClick={openModal} variant="primary" size="sm">
                            <span className="font-bold text-xl">+</span>
                            Create New Post
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-3 my-3">
                    <div className="flex flex-col sm:flex-row gap-5 mb-4">
                        <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                        <div className="flex gap-2 w-full sm:w-[23%]">
                            {/* Your dropdown or other filters could go here */}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-5 mb-4">
                        <div className="w-full sm:w-36">
                            <p onClick={() => setActiveTab("published")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "published" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                                Published({publishedPosts.length})
                            </p>
                            {activeTab === "published" && <div className="w-36 bg-[#97998E] h-[3px]"></div>}
                        </div>
                        <div className="w-full sm:w-36">
                            <p onClick={() => setActiveTab("draft")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "draft" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                                Draft({draftPosts.length})
                            </p>
                            {activeTab === "draft" && <div className="w-36 bg-[#97998E] h-[3px]"></div>}
                        </div>
                        <div className="w-full sm:w-36">
                            <p onClick={() => setActiveTab("trash")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "trash" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                                Trash({trashPosts.length})
                            </p>
                            {activeTab === "trash" && <div className="w-36 bg-[#97998E] h-[3px]"></div>}
                        </div>
                    </div>

                    <div>
                        {activeTab === "published" && (
                            <div>
                                {loading ? (
                                    <p className="text-center text-gray-500">Loading posts...</p>
                                ) : publishedPosts.length > 0 ? (
                                    publishedPosts.map((data) => (
                                        <div key={data._id} className="flex flex-col sm:flex-row justify-between m-5">
                                            <div className="flex gap-4 w-full sm:w-auto">
                                                {data.image && data.image.length > 0 && (
                                                    <img src={data.image[0]} alt={data.title} className="w-16 h-16 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-[14px]">{data.title}</p>
                                                    {data.updatedAt && (
                                                        <p className="text-[#768294] flex gap-2 text-[12px]">
                                                            {timeAgo(data.updatedAt)}
                                                            <div className="bg-[#768294] mt-1 rounded-full w-2 h-2"></div>
                                                            <span>admin</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-5 mt-2 sm:mt-0">
                                                <Button
                                                    onClick={() => data._id && HandleEditClick(data._id)}
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    onClick={() => data._id && confirmDelete(data._id)}
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                >
                                                    Delete
                                                </Button>
                                                <ConfirmModal
                                                    open={isConfirmModalOpen}
                                                    onClose={() => setConfirmModalOpen(false)}
                                                    onConfirm={() => {
                                                        if (deleteId) {
                                                            handleDelete?.(deleteId); // Call the delete function
                                                            setConfirmModalOpen(false); // Close the modal after deletion
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <NoRecords text="No Postes Available" textSize="md" imgSize={60} />
                                )}
                            </div>
                        )}
                        {activeTab === "draft" && (
                            <div>
                                {loading ? (
                                    <p className="text-center text-gray-500">Loading posts...</p>
                                ) : draftPosts.length > 0 ? (
                                    draftPosts.map((data) => (
                                        <div key={data._id} className="flex flex-col sm:flex-row justify-between m-5">
                                            <div className="flex gap-4 w-full sm:w-auto">
                                                {data.image && data.image.length > 0 && (
                                                    <img src={data.image[0]} alt={data.title} className="w-16 h-16 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-[14px]">{data.title}</p>
                                                    {data.updatedAt && (
                                                        <p className="text-[#768294] flex gap-2 text-[12px]">
                                                            {timeAgo(data.updatedAt)}
                                                            <div className="bg-[#768294] mt-1 rounded-full w-2 h-2"></div>
                                                            <span>admin</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-5 mt-2 sm:mt-0">
                                                <Button
                                                    onClick={() => data._id && HandleEditClick(data._id)}
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    onClick={() => data._id && confirmDelete(data._id)}
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                >
                                                    Delete
                                                </Button>
                                                <ConfirmModal
                                                    open={isConfirmModalOpen}
                                                    onClose={() => setConfirmModalOpen(false)}
                                                    onConfirm={() => {
                                                        if (deleteId) {
                                                            handleDelete?.(deleteId); // Call the delete function
                                                            setConfirmModalOpen(false); // Close the modal after deletion
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <NoRecords text="No Postes Available" textSize="md" imgSize={60} />
                                )}
                            </div>
                        )}
                        {activeTab === "trash" && (
                            <div>
                                {loading ? (
                                    <p className="text-center text-gray-500">Loading posts...</p>
                                ) : trashPosts.length > 0 ? (
                                    trashPosts.map((data) => (
                                        <div key={data._id} className="flex flex-col sm:flex-row justify-between m-5">
                                            <div className="flex gap-4 w-full sm:w-auto">
                                                {data.image && data.image.length > 0 && (
                                                    <img src={data.image[0]} alt={data.title} className="w-16 h-16 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-[14px]">{data.title}</p>
                                                    {data.updatedAt && (
                                                        <p className="text-[#768294] flex gap-2 text-[12px]">
                                                            {timeAgo(data.updatedAt)}
                                                            <div className="bg-[#768294] mt-1 rounded-full w-2 h-2"></div>
                                                            <span>admin</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-5 mt-2 sm:mt-0">
                                                <Button
                                                    onClick={() => data._id && HandleEditClick(data._id)}
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>



                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <NoRecords text="No Postes Available" textSize="md" imgSize={60} />
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <Modal open={isModalOpen} onClose={closeModal} className="w-[90%] sm:w-[30%] bg-[#F7F7F7] text-start px-7 py-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-md font-bold text-deepStateBlue">Event Details</h1>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                    >
                        &times;
                    </button>
                </div>
                <div className="py-5">
                    <p className="py-1 text-sm">
                        Select Category
                    </p>
                    <SelectDropdown
                        filteredData={CategoryOptions} // Pass formatted category options
                        selectedValue={CategoryOptions.find(option => option.value === selectedCategory)} // Ensure selected option is displayed
                        setSelectedValue={handleOptionSelection}
                        placeholder="Select Category"
                        width="w-[100%]"
                    />
                </div>
                <div>

                    <p className="text-[#768294] mb-2 text-[14px] font-semibold">
                        Select Event Date & Time
                    </p>
                    <Input
                        label="Select Date"
                        type="date"
                        name="meetingDate"
                        value={eventData.meetingDate}
                        onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-2 py-2">
                        <Input
                            label="Start Time"
                            type="time"
                            value={eventData.startTime}
                            onChange={handleChange}
                            name="startTime"
                        />
                        <Input
                            label="End time"
                            type="time"
                            value={eventData.endTime}
                            onChange={handleChange}
                            name="endTime"
                        />


                    </div>
                </div>
                <div>
                    <h2 className="text-[#768294] mb-2 text-[14px] font-semibold">Select Event Type</h2>
                    <div className="flex gap-3">
                        <div>
                            <input
                                type="radio"
                                name="eventType"
                                value="online"
                                checked={eventType === "online"}
                                onChange={() => setEventType("online")}
                            />

                            <label className="ms-2">
                                Online
                            </label>
                        </div>
                        <div>

                            <input
                                type="radio"
                                name="eventType"
                                value="offline"
                                checked={eventType === "offline"}
                                onChange={() => setEventType("offline")}
                            />
                            <label className="ms-2">
                                Offline
                            </label>
                        </div>
                    </div>

                    {eventType === "online" && (
                        <div className="pt-3">

                            <TextArea
                                placeholder="Enter meeting link"
                                label="Meeting Link"
                                value={eventData.meetingLink}
                                onChange={handleChange}
                                name="meetingLink" />
                        </div>
                    )}

                    {eventType === "offline" && (
                        <div className="pt-3">

                            <Input
                                placeholder="Enter Venue"
                                label="Venue"
                                value={eventData.venueName}
                                onChange={handleChange}
                                name="venueName"

                            />
                            <div className="mt-2">

                                <TextArea
                                    placeholder="Enter Adress"
                                    label="Adress"
                                    name="address"
                                    value={eventData.address}
                                    onChange={handleChange} />
                            </div>
                        </div>
                    )}
                </div>


                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={closeModal} variant="secondary" className="text-sm h-10 font-semibold">
                        Cancel
                    </Button>
                    {
                        selectedCategory &&

                        <Button
                            className="h-10 text-sm"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                    }

                </div>
            </Modal>
        </div>
    )
}

export default EventHome
