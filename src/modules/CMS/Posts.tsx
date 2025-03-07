import { useState } from "react";
import frame from "../../assets/image/PublishedImg.png"
import AddCategory from "./AddCategory";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";
import SelectDropdown from "../../components/ui/SelectDropdown";
import { Link } from "react-router-dom";
type Props = { page?: string }

function Posts({ 
    // page

 }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [activeTab, setActiveTab] = useState("published");

    const handleOptionSelection = () => {
        const value = "0"
        setSelectedOption(value)
    };
    const Options = [
        { label: 'All', value: 'all' },
    ];
    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-[#303F58] text-xl font-bold">Posts</h1>
                <div className="flex gap-2">
                    <AddCategory />
                    <Link to={'/cms/blog/newpost'}>
                        <Button variant="primary" size="sm"               >
                            <span className="font-bold text-xl">+</span>
                            Create New Post
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="bg-white p-3 my-3">
                <div className="flex gap-20">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                    <div className="flex gap-2 w-[16%]">
                        <p className="text-sm mt-3">
                            Filtered by
                        </p>
                        <SelectDropdown
                            filteredData={Options}
                            selectedValue={selectedOption}
                            setSelectedValue={handleOptionSelection}
                            placeholder="All"
                            width="w-20"
                        />
                    </div>
                </div>
                <div className="flex gap-5 my-3">
                    <div className="w-36">
                        <p onClick={() => setActiveTab("published")} className={`text-center pb-1  font-bold cursor-pointer ${activeTab === "published" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                            Published(0)
                        </p>
                        {
                            activeTab === "published" &&
                            <div className="w-36 bg-[#97998E] h-[3px]"></div>
                        }
                    </div>
                    <div className="w-36">
                        <p onClick={() => setActiveTab("draft")} className={`text-center pb-1  font-bold cursor-pointer ${activeTab === "draft" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                            Draft(0)
                        </p>
                        {
                            activeTab === "draft" &&
                            <div className="w-36 bg-[#97998E] h-[3px]"></div>
                        }
                    </div>
                    <div className="w-36">
                        <p onClick={() => setActiveTab("trash")} className={`text-center pb-1  font-bold cursor-pointer ${activeTab === "trash" ? "text-[#303F58]" : "text-[#71829c]"}`}>
                            Trash(0)
                        </p>
                        {
                            activeTab === "trash" &&
                            <div className="w-36 bg-[#97998E] h-[3px]"></div>
                        }
                    </div>
                </div>

                <div>
                    {
                        activeTab === "published" &&
                        <div className="flex justify-between m-5">
                            <div className="flex gap-4">
                                <img src={frame} alt="" />
                                <div className="">
                                    <p className="font-semibold text-[14px]">Post title</p>
                                    <p className="text-[#768294] flex gap-2 text-[12px]">52 Min ago <div className="bg-[#768294] mt-1 rounded-full w-2 h-2"></div> <span>admin</span></p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <Button variant="tertiary"
                                    className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                                    Edit
                                </Button>
                                <Button variant="tertiary"
                                    className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    }
                </div>

            </div>
        </div>
    )
}

export default Posts