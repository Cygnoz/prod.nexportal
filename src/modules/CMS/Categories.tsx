import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import AddCategory from './AddCategory';
import useApi from '../../Hooks/useApi';
import { endPoints } from '../../services/apiEndpoints';
import { Category } from '../../Interfaces/CMS';
import toast from 'react-hot-toast';
 
type Props = { page?: string }
 
function Categories({ page }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const tableHeadings = ["Category Name", "Posts", "Action"]
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [filteredData, setFilteredData] = useState<Category[]>([]);
 
    const { request: getAllCategory } = useApi('get', 3001)
 
    const getCategory = async () => {
        if (page !== "blogs" && page !== "news") {
            console.warn("Invalid page type:", page);
            return;
        }
        try {
            const categoryType = page === "blogs" ? "Blogs" : "News";
            const { response, error } = await getAllCategory(`${endPoints.CATEGORY}?categoryType=${categoryType}`);
 
            if (response && !error) {
                console.log("API Response Data:", response.data.data);
                setCategoryData(response.data.data);
                setFilteredData(response.data.data);
            } else {
                console.error("Error fetching categories:", error);
            }
        } catch (err) {
            console.error("Unexpected error in getCategory:", err);
        }
    };
 
    // Ensure this runs when the page changes
    useEffect(() => {
        getCategory();
    }, [page]);
 
 
    // Filter categories locally when searchValue changes
    useEffect(() => {
        setFilteredData(
            searchValue.trim()
                ? categoryData.filter((category) =>
                    category.categoryName.toLowerCase().includes(searchValue.toLowerCase())
                )
                : categoryData
        );
    }, [searchValue, categoryData]); // Re-run filtering if data or search changes
 
    const { request: deleteCategory } = useApi('delete', 3001)
 
    const handleDelete = async (id: string) => {
        try {
            const url = `${endPoints.CATEGORY}/${id}`;
            const { response, error } = await deleteCategory(url);
            if (!error && response) {
                toast.success(response.data.message);
                getCategory()
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
            <div className="flex justify-between items-center">
                <h1 className="text-[#303F58] text-xl font-bold">
                    {page === "blogs" ? "Blog Category" : " News Category"
                    }
                </h1>
                {page === "blogs" ?
                    <AddCategory page='blogs' fetchAllCategory={getCategory} />
                    :
                    <AddCategory page='news' fetchAllCategory={getCategory} />
 
                }
            </div>
 
            <div className="bg-white p-3 my-3">
                <div className="flex gap-20">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                </div>
                <div className="w-full">
                    <table className='w-full my-4'>
                        <thead>
                            <tr>
                                {tableHeadings.map((head, index) => (
                                    <th className='bg-[#F6F6F6] py-2' key={index}>{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((category) => (
                                    <tr key={category._id}>
                                        <td className="text-center">{category.categoryName}</td>
                                        <td className="text-center">{category.categoryType}</td>
                                        <td className="text-center py-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <AddCategory fetchAllCategory={getCategory} id={`${category._id}`} />
                                                <Button
                                                    variant="tertiary"
                                                    className="border border-[#565148] h-8 text-[15px]"
                                                    size="sm"
                                                    onClick={() => category._id && handleDelete(category._id)}                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="text-center py-2">No categories available</td>
                                </tr>
                            )}
                        </tbody>
 
                    </table>
                </div>
            </div>
        </div>
    )
}
 
export default Categories