import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Category } from '../../../Interfaces/CMS';
import useApi from '../../../Hooks/useApi';
import { endPoints } from '../../../services/apiEndpoints';
import NewCategory from './NewCategoryModal';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';

type Props = {}

function EventCategories({ }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const tableHeadings = ["Category Name", "Posts", "Action"]
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [filteredData, setFilteredData] = useState<Category[]>([]);

    const { request: getAllCategory } = useApi('get', 3001)

    const getCategory = async () => {

        try {
            const { response, error } = await getAllCategory(`${endPoints.CATEGORY}?categoryType=Events`);

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
    }, []);


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
            <div className="flex flex-col justify-between items-center sm:flex-row">
                <h1 className="text-[#303F58] text-xl font-bold">
                    Event Category
                </h1>
                <NewCategory fetchAllCategory={getCategory} />

            </div>

            <div className="bg-white p-3 my-3">
                <div className="flex gap-20">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                </div>
                <div className="w-full overflow-x-auto">
    <table className="w-full my-4 table-auto">
        <thead>
            <tr>
                {tableHeadings.map((head, index) => (
                    <th className="bg-[#F6F6F6] py-2 px-4" key={index}>{head}</th>  
                ))}
            </tr>
        </thead>
        <tbody>
            {filteredData.length > 0 ? (
                filteredData.map((category) => (
                    <tr key={category._id}>
                        <td className="text-center py-2 px-4">{category.categoryName}</td> {/* Added padding here */}
                        <td className="text-center py-2 px-4">{category.categoryType}</td> {/* Added padding here */}
                        <td className="text-center py-2 px-4"> {/* Added padding here */}
                            <div className="flex items-center justify-center gap-2">
                                <NewCategory fetchAllCategory={getCategory} id={`${category._id}`} />
                                <Button
                                    variant="tertiary"
                                    className="border border-[#565148] h-8 text-[15px]"
                                    size="sm"
                                    onClick={() => category._id && handleDelete(category._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td className="text-center py-2 px-4" colSpan={3}>No categories available</td> {/* Added padding here */}
                </tr>
            )}
        </tbody>
    </table>
</div>


            </div>
        </div>
    )
}

export default EventCategories