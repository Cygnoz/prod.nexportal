import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";
import SelectDropdown from "../../components/ui/SelectDropdown";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/modal/Modal";
import useApi from "../../Hooks/useApi";
import { Category, Post } from "../../Interfaces/CMS";
import { endPoints } from "../../services/apiEndpoints";
type Props = { page: string }
import moment from "moment";
import toast from "react-hot-toast";

function Posts({ page }: Props) {
    const [searchValue, setSearchValue] = useState("");
    // const [selectedOption, setSelectedOption] = useState("");
    const [activeTab, setActiveTab] = useState("published");
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [postData, setPostData] = useState<Post[]>([]);
    const [filteredData, setFilteredData] = useState<Post[]>([]);
    const { request: deletePost } = useApi('delete', 3001)

    const { request: getAllCategory } = useApi('get', 3001)
    const { request: getAllPost } = useApi('get', 3001)

    const [loading, setLoading] = useState(false); // Add loading state

    const getAllPosts = async () => {
        if (page !== "blogs" && page !== "news") {
            return;
        }

        setLoading(true); // Start loading
        const categoryType = page === "blogs" ? "Blogs" : "News";

        try {
            const { response, error } = await getAllPost(`${endPoints.GET_ALL_POSTS}?postType=${categoryType}`);

            if (response && !error) {
                console.log("response", response.data.data);
                setPostData(response?.data.data);
                setFilteredData(response.data.data);
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
    }, [page]);

    const timeAgo = (dateString: any) => {
        if (!dateString) return "Unknown time";
        const postTime = moment(dateString);
        if (!postTime.isValid()) return "Invalid date";
        return postTime.fromNow();
    };

    const navigate = useNavigate()
    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const getCategory = async () => {
        if (page !== "blogs" && page !== "news") {
            return;
        }
        const categoryType = page === "blogs" ? "Blogs" : "News";
        const { response, error } = await getAllCategory(`${endPoints.CATEGORY}?categoryType=${categoryType}`)
        if (response && !error) {
            console.log("response", response.data.data);
            setCategoryData(response?.data.data)
        }
    }
    useEffect(() => {
        getCategory(); // Fetch data once when component mounts
    }, [page]);

    const CategoryOptions = categoryData.map((category) => ({
        label: category.categoryName, // Display name in dropdown
        value: category._id, // Store _id as value
    }));


    // Handle category selection
    const handleOptionSelection = (selectedOption: { label: string; value: string }) => {
        setSelectedCategory(selectedOption.value); // Store _id in state
    };


    const handleDelete = async (id: string) => {
        try {
            const url = `${endPoints.POSTS}/${id}`;
            const { response, error } = await deletePost(url);
            if (!error && response) {
                toast.success(response.data.message);
                getAllPosts()
            } else {
                toast.error(error.response.data.message);
            }
        } catch (error) {
            toast.error("Error in fetching .");
            console.error("Error in fetching ", error);
        }
    }
    return (
        <div>
        <div className="flex justify-between items-center flex-col sm:flex-row">
            <h1 className="text-[#303F58] text-xl font-bold">Posts</h1>
            <div className="flex gap-2 mt-3 sm:mt-0">
                <AddCategory />
                <Button onClick={openModal} variant="primary" size="sm">
                    <span className="font-bold text-xl">+</span>
                    Create New Post
                </Button>
            </div>
        </div>
    
        <div className="bg-white p-3 my-3">
            <div className="flex flex-col sm:flex-row sm:gap-20">
                <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                <div className="flex gap-2 w-full sm:w-[23%]">
                    {/* SelectDropdown for category (commented out) */}
                </div>
            </div>
    
            <div className="flex gap-5 my-3 flex-wrap sm:flex-nowrap">
                <div className="w-full sm:w-36">
                    <p onClick={() => setActiveTab("published")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "published" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                        Published({postData.length})
                    </p>
                    {activeTab === "published" && <div className="w-full sm:w-36 bg-[#97998E] h-[3px]"></div>}
                </div>
                <div className="w-full sm:w-36">
                    <p onClick={() => setActiveTab("draft")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "draft" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                        Draft(0)
                    </p>
                    {activeTab === "draft" && <div className="w-full sm:w-36 bg-[#97998E] h-[3px]"></div>}
                </div>
                <div className="w-full sm:w-36">
                    <p onClick={() => setActiveTab("trash")} className={`text-center pb-1 font-bold cursor-pointer ${activeTab === "trash" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                        Trash(0)
                    </p>
                    {activeTab === "trash" && <div className="w-full sm:w-36 bg-[#97998E] h-[3px]"></div>}
                </div>
            </div>
    
            <div>
                {activeTab === "published" && (
                    <div>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading posts...</p>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((data) => (
                                <div key={data._id} className="flex justify-between m-5 flex-col sm:flex-row">
                                    <div className="flex gap-4">
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
                                    <div className="flex gap-5 mt-3 sm:mt-0">
                                        <Button
                                            onClick={() => navigate(`${page === "blogs" ? `/cms/blog/editpost/${data._id}` : `/cms/news/editpost/${data._id}`}`)}
                                            variant="tertiary"
                                            className="border border-[#565148] h-8 text-[15px]"
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => data._id && handleDelete(data._id)}
                                            variant="tertiary"
                                            className="border border-[#565148] h-8 text-[15px]"
                                            size="sm"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No Posts Available</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    
        <Modal open={isModalOpen} onClose={closeModal} className="w-[90%] sm:w-[30%] bg-[#F7F7F7] text-start px-7 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-md font-bold text-deepStateBlue">Choose Category</h1>
                <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                >
                    &times;
                </button>
            </div>
            <div className="py-5">
                <p className="py-2 text-sm">Select Category</p>
                <SelectDropdown
                    filteredData={CategoryOptions} // Pass formatted category options
                    selectedValue={CategoryOptions.find(option => option.value === selectedCategory)} // Ensure selected option is displayed
                    setSelectedValue={handleOptionSelection}
                    placeholder="Select Category"
                    width="w-[100%]"
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={closeModal} variant="secondary" className="text-sm h-10 font-semibold">
                    Cancel
                </Button>
                {selectedCategory && (
                    <Button
                        onClick={() => navigate(page === "blogs" ? "/cms/blog/newpost" : "/cms/news/newpost", { state: { selectedCategory } })}
                        className="h-10 text-sm"
                    >
                        Continue
                    </Button>
                )}
            </div>
        </Modal>
    </div>
    
    )
}

export default Posts
