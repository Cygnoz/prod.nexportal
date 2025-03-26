import { useEffect, useState } from "react";
import SearchBar from "../../../components/ui/SearchBar";
import AddTerms from "./AddTermsModal";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { Terms } from "../../../Interfaces/CMS";
import { useResponse } from "../../../context/ResponseContext";
import NoRecords from "../../../components/ui/NoRecords";
import ConfirmModal from "../ConfirmModal";

type Props = {}

function Terms_Conditions({ }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state
    const [termsData, setTermsData] = useState<Terms[]>([]);
    const [filteredData, setFilteredData] = useState<Terms[]>([]);
    const {cmsMenu}=useResponse()
    const { request: getAllTerms } = useApi('get', 3001)
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setConfirmModalOpen(true);
    };
    const getTerms = async () => {
        setLoading(true); // Start loading

        try {
            const { response, error } = await getAllTerms(`${endPoints.TERMS}?type=TermsAndConditions&project=${cmsMenu.selectedData}`);

            if (response && !error) {
                console.log("API Response Data:", response?.data.terms);
                setTermsData(response?.data.terms);
                setFilteredData(response?.data.terms);
            } else {
                console.error("Error fetching :", error);
            }
        } catch (err) {
            console.error("Unexpected error :", err);
        }
        finally {
            setLoading(false); // Stop loading
        }
    };

    // Ensure this runs when the page changes
    useEffect(() => {
        getTerms();
    }, []);

    // Filter categories locally when searchValue changes
    useEffect(() => {
        setFilteredData(
            searchValue.trim()
                ? termsData.filter((terms) =>
                    terms.termTitle.toLowerCase().includes(searchValue.toLowerCase())
                )
                : termsData
        );
    }, [searchValue, termsData]); // Re-run filtering if data or search changes

    const { request: deleteCTerm } = useApi('delete', 3001)

    const handleDelete = async (id: string) => {
        try {
            const url = `${endPoints.TERMS}/${id}`;
            const { response, error } = await deleteCTerm(url);
            if (!error && response) {
                toast.success(response.data.message);
                getTerms()
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
                <h1 className="text-[#303F58] text-xl font-bold"> Terms & Conditions</h1>
                <AddTerms fetchData={getTerms}/>
            </div>
            <div className="bg-white p-3 my-3">
                <div className="flex gap-20">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />

                </div>
                <div className="p-5">
                    <h1 className="text-[#303F58] bg-[#F6F6F6] p-2 text-md font-semibold">Terms</h1>
                    {
                        loading ?
                            <p className="text-center text-gray-500">Loading posts...</p>
                            :
                            (
                                filteredData.length > 0 ?
                                    filteredData.map((data) => (
                                        <div className="flex justify-between p-3">
                                            <p>
                                                {data.termTitle}</p>
                                            <div className='flex items-center justify-center gap-2'>

                                                <AddTerms id={`${data._id}`} fetchData={getTerms} />
                                             
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
                                    )) :
                                    <p className="mt-3">
                                        <NoRecords text="No Terms and conditions Available"  textSize="md" imgSize={60}/>
                                    </p>
                            )
                    }
                </div>
                <div>
                </div>
            </div>



        </div>

    )
}

export default Terms_Conditions