import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import AddCategoryModal from './AddCategoryModal';
import AddArticleModal from './AddArticleModal';
import toast from 'react-hot-toast';
import { endPoints } from '../../../services/apiEndpoints';
import useApi from '../../../Hooks/useApi';
import { Category, } from '../../../Interfaces/CMS';
import AddSubCategoryModal from './AddSubCategoryModal';
import { useResponse } from '../../../context/ResponseContext';
import NoRecords from '../../../components/ui/NoRecords';
import ConfirmModal from '../ConfirmModal';


export interface SubCategory {
  image?: string;
  subCategoryName: string;
  order?: string;
  categoryName: {
    categoryName: string;
  };
  description?: string;
  _id?: string
}

interface Article {
  _id: string;
  title: string;
  category: {
    _id: string;
    categoryName: string;
  };
  subCategory: {
    _id: string;
    subCategoryName: string;
  };
}

type Props = { page: string }


function KnowledgeCatogeries({ page }: Props) {
  const tableHeadings = ["Category Name", "Action"]
  const tableSubHeadings = ["Category Name", "Category Name", "Action"]
  const tableArticleHeadings = ["Arrticle Name", "Category Name", "Sub Category", "Action"]

  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  console.log(loading);
  const { cmsMenu } = useResponse()
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<SubCategory[]>([]);
  const [articleData, setArticleData] = useState<Article[]>([]);

  // Filtered data states
  const [filteredCategoryData, setFilteredCategoryData] = useState<Category[]>([]);
  const [filteredSubCategoryData, setFilteredSubCategoryData] = useState<SubCategory[]>([]);
  const [filteredArticleData, setFilteredArticleData] = useState<Article[]>([]);

  const { request: getAll } = useApi('get', 3001)


  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setConfirmModalOpen(true);
  };
  // Function to get all data based on the page
  const getAllData = async () => {
    setLoading(true);
    try {
      // ✅ Dynamically set endpoint based on page
      const url =
        page === "base"
          ? `${endPoints.CATEGORY}?categoryType=KnowledgeBase&project=${cmsMenu.selectedData}`
          : page === "sub"
            ? `${endPoints.SUBCATEGORY}?project=${cmsMenu.selectedData}`
            : `${endPoints.ARTICLE}?project=${cmsMenu.selectedData}`;
      // ✅ Make the API call
      const { response, error } = await getAll(url);

      if (response && !error) {
        // ✅ Dynamically set state based on page
        if (page === "base") {
          console.log("Category", response?.data.data);

          setCategoryData(response?.data?.data.reverse());
          setFilteredCategoryData(response?.data?.data);
        } else if (page === "sub") {
          console.log("Sub", response?.data.data);

          setSubCategoryData(response?.data?.data.reverse());
          setFilteredSubCategoryData(response?.data?.data);
        } else if (page === "article") {
          console.log("articles", response?.data.data);
          setArticleData(response?.data?.data.reverse());
          setFilteredArticleData(response?.data?.data);
        }
      } else {
        console.error(`Error fetching ${page} data:`, error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Ensure this runs when the page changes
  useEffect(() => {
    setCategoryData([])
    setFilteredCategoryData([])
    setSubCategoryData([])
    setFilteredArticleData([])
    setArticleData([])
    setFilteredArticleData([])
    getAllData();
  }, [page, cmsMenu.selectedData]);



  useEffect(() => {
    if (page === "base") {
      setFilteredCategoryData(
        categoryData?.filter((item) =>
          item.categoryName.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    } else if (page === "sub") {
      setFilteredSubCategoryData(
        subCategoryData?.filter((item) =>
          item.subCategoryName.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    } else if (page === "article") {
      setFilteredArticleData(
        articleData?.filter((item) =>
          item.title.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [searchValue, categoryData, subCategoryData, articleData, page]);


  // Filter categories locally when searchValue changes

  const { request: deleteItem } = useApi('delete', 3001)

  const handleDelete = async (id: string) => {
    try {

      const url =
        page === "base"
          ? `${endPoints.CATEGORY}/${id}`
          : page === "sub"
            ? `${endPoints.SUBCATEGORY}/${id}`
            : `${endPoints.ARTICLE}/${id}`;

      // ✅ Make the API call
      const { response, error } = await deleteItem(url);
      if (!error && response) {
        toast.success(response.data.message);
        getAllData()
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
          {page === "base" ? "Category" :
            page === "sub" ? " Sub Categbory" :
              page === "article" ? "Articles" : ""
          }</h1>
        <div className="flex gap-2">
          {
            page === "base" ? <AddCategoryModal fetchData={getAllData} /> :
              page === "sub" ? <AddSubCategoryModal fetchData={getAllData} />
                : page === "article" ? <AddArticleModal fetchData={getAllData} /> : ""
          }
        </div>
      </div>

      <div className="bg-white p-3 my-3">
        <div className="flex gap-20">
          <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
        </div>
        <div className="w-full">
          {
            page === "base" &&
            <table className='w-full my-4'>
              <thead>
                <tr>
                  {tableHeadings.map((head, index) => (
                    <th className='bg-[#F6F6F6] py-2' key={index}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {
                  loading ? (
                    <tr>
                      <td className="text-center text-gray-500 py-4">
                        Loading categories...
                      </td>
                    </tr>
                  ) : (
                    filteredCategoryData.length > 0 ? (
                      filteredCategoryData.map((category) => (
                        <tr key={category._id}>
                          <td className="text-center">{category.categoryName}</td>
                          <td className="text-center py-2">
                            <div className="flex items-center justify-center gap-2">
                              <AddCategoryModal fetchData={getAllData} id={`${category._id}`} />
                              <Button
                                onClick={() => category._id && confirmDelete(category._id)}
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-center py-2" colSpan={tableSubHeadings.length}>
                          <NoRecords text="No Categories Available" textSize="md" imgSize={60} />
                        </td>
                      </tr>
                    )
                  )
                }


              </tbody>

            </table>
          }
          {
            page === "sub" &&
            <div className="w-full overflow-x-auto">  {/* Added scroll container */}
              <table className="w-full my-4 table-auto">
                <thead>
                  <tr>
                    {tableSubHeadings.map((head, index) => (
                      <th className="bg-[#F6F6F6] py-2 px-4" key={index}>  {/* Added padding here */}
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-center text-gray-500 py-4" colSpan={tableSubHeadings.length}>
                        Loading sub-categories...
                      </td>
                    </tr>
                  ) : (
                    filteredSubCategoryData.length > 0 ? (
                      filteredSubCategoryData.map((category) => (
                        <tr key={category._id}>
                          <td className="text-center py-2 px-4">{category.subCategoryName}</td>  {/* Added padding here */}
                          <td className="text-center py-2 px-4">{category.categoryName?.categoryName}</td>  {/* Added padding here */}
                          <td className="text-center py-2 px-4">  {/* Added padding here */}
                            <div className="flex items-center justify-center gap-2">
                              <AddSubCategoryModal fetchData={getAllData} id={`${category._id}`} />
                              <Button
                                onClick={() => category._id && confirmDelete(category._id)}
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-center py-2" colSpan={tableSubHeadings.length}>
                          <NoRecords text="No Sub categories Available" textSize="md" imgSize={60} />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

          }
          {
            page === "article" &&
            <div className="w-full overflow-x-auto">  {/* Wrapper for horizontal scroll */}
              <table className="w-full my-4 table-auto">
                <thead>
                  <tr>
                    {tableArticleHeadings.map((head, index) => (
                      <th className="bg-[#F6F6F6] py-2 px-4" key={index}>  {/* Added padding here */}
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-center text-gray-500 py-4" colSpan={tableArticleHeadings.length}>
                        Loading articles...
                      </td>
                    </tr>
                  ) : (
                    filteredArticleData.length > 0 ? (
                      filteredArticleData.map((category) => (
                        <tr key={category._id}>
                          <td className="text-center py-2 px-4">{category.title}</td>  {/* Added padding here */}
                          <td className="text-center py-2 px-4">{category.category?.categoryName}</td>  {/* Added padding here */}
                          <td className="text-center py-2 px-4">{category.subCategory?.subCategoryName}</td>  {/* Added padding here */}
                          <td className="text-center py-2 px-4">  {/* Added padding here */}
                            <div className="flex items-center justify-center gap-2">
                              <AddArticleModal fetchData={getAllData} id={`${category._id}`} />
                              <Button
                                onClick={() => category._id && confirmDelete(category._id)}
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-center py-2" colSpan={tableArticleHeadings.length}>
                          <NoRecords text="No Articles Available" textSize="md" imgSize={60} />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

          }

        </div>
      </div>
    </div>
  )
}

export default KnowledgeCatogeries
