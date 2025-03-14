import { useEffect, useState } from "react";
import SearchBar from "../../../components/ui/SearchBar";
import AddModal from "./AddModal"
import toast from "react-hot-toast";
import { endPoints } from "../../../services/apiEndpoints";
import useApi from "../../../Hooks/useApi";
import { LegalAndSecurity } from "../../../Interfaces/CMS";
import Button from "../../../components/ui/Button";

type Props = { page: string }

function Home({ page }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const [termsData, setTermsData] = useState<LegalAndSecurity[]>([]);
  const [filteredData, setFilteredData] = useState<LegalAndSecurity[]>([]);

  const { request: getAll } = useApi('get', 3001)

  const getAllItems = async () => {
    if (page !== "legal" && page !== "security") {
      return;
    }
    setLoading(true); // Start loading
    try {

      const categoryType = page === "legal" ? "Legal Privacy" : "Security";
      const { response, error } = await getAll(`${endPoints.TERMS}?type=${categoryType}`)

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
    getAllItems();
  }, [page]);

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

  const { request: deleteItem } = useApi('delete', 3001)

  const handleDelete = async (id: string) => {
    try {
      const url = `${endPoints.TERMS}/${id}`;
      const { response, error } = await deleteItem(url);
      if (!error && response) {
        toast.success(response.data.message);
        getAllItems()
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
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-[#303F58] text-xl font-bold">
            {
              page === "legal" ? "Legal Privacy" : "Security Terms"
            }
          </h1>

          {page === "legal" ?
            <AddModal fetchData={getAllItems} page='legal' />
            :
            <AddModal fetchData={getAllItems} page='security' />

          }
        </div>
        <div className="bg-white p-3 my-3">
          <div className="flex gap-20">
            <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />

          </div>
          <div className="p-5 overflow-x-auto">
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

                          <AddModal id={`${data._id}`} fetchData={getAllItems} />
                          <Button variant="tertiary"
                            onClick={() => data._id && handleDelete(data._id)}

                            className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )) :
                    <p className="text-center text-gray-500">No Posts Available</p>

                )


            }

          </div>
        </div>



      </div>
    </div>
  )
}

export default Home