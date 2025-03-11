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

  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<SubCategory[]>([]);
  const [articleData, setArticleData] = useState<Article[]>([]);

  // Filtered data states
  const [filteredCategoryData, setFilteredCategoryData] = useState<Category[]>([]);
  const [filteredSubCategoryData, setFilteredSubCategoryData] = useState<SubCategory[]>([]);
  const [filteredArticleData, setFilteredArticleData] = useState<Article[]>([]);

  const { request: getAll } = useApi('get', 3001)

  // Function to get all data based on the page
  const getAllData = async () => {
    setLoading(true);
    try {
      // ✅ Dynamically set endpoint based on page
      const url =
        page === "base"
          ? `${endPoints.CATEGORY}?categoryType=Knowledge Base`
          : page === "sub"
            ? `${endPoints.SUBCATEGORY}`
            : `${endPoints.ARTICLE}`;

      // ✅ Make the API call
      const { response, error } = await getAll(url);

      if (response && !error) {
        // ✅ Dynamically set state based on page
        if (page === "base") {
          console.log("Category", response?.data.data);

          setCategoryData(response?.data?.data);
          setFilteredCategoryData(response?.data?.data);
        } else if (page === "sub") {
          console.log("Sub", response?.data.data);

          setSubCategoryData(response?.data?.data);
          setFilteredSubCategoryData(response?.data?.data);
        } else if (page === "article") {
          console.log("articles", response?.data.data);
          setArticleData(response?.data?.data);
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
    getAllData();
  }, [page]);



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
                        <td className="text-center py-2">
                          No categories available
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
            <table className='w-full my-4'>
              <thead>
                <tr>
                  {tableSubHeadings.map((head, index) => (
                    <th className='bg-[#F6F6F6] py-2' key={index}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {
                  loading ? (
                    <tr>
                      <td className="text-center text-gray-500 py-4">
                        Loading sub-categories...
                      </td>
                    </tr>
                  ) : (
                    filteredSubCategoryData.length > 0 ? (
                      filteredSubCategoryData.map((category) => (
                        <tr key={category._id}>
                          <td className="text-center">{category.subCategoryName}</td>
                          <td className="text-center">{category.categoryName?.categoryName}</td>
                          <td className="text-center py-2">
                            <div className="flex items-center justify-center gap-2">
                              <AddSubCategoryModal fetchData={getAllData} id={`${category._id}`} />
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
                        <td className="text-center py-2">
                          No sub-categories available
                        </td>
                      </tr>
                    )
                  )
                }

              </tbody>

            </table>
          }
          {
            page === "article" &&
            <table className='w-full my-4'>
              <thead>
                <tr>
                  {tableArticleHeadings.map((head, index) => (
                    <th className='bg-[#F6F6F6] py-2' key={index}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {
                  loading ? (
                    <tr>
                      <td className="text-center text-gray-500 py-4">
                        Loading articles...
                      </td>
                    </tr>
                  ) : (
                    filteredArticleData.length > 0 ? (
                      filteredArticleData.map((category) => (
                        <tr key={category._id}>
                          <td className="text-center">{category.title}</td>
                          <td className="text-center">{category.category?.categoryName}</td>
                          <td className="text-center">{category.subCategory?.subCategoryName}</td>
                          <td className="text-center py-2">
                            <div className="flex items-center justify-center gap-2">
                              <AddArticleModal fetchData={getAllData} id={`${category._id}`} />
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
                        <td  className="text-center py-2">
                          No articles available
                        </td>
                      </tr>
                    )
                  )
                }


              </tbody>

            </table>
          }

        </div>
      </div>
    </div>
  )
}

export default KnowledgeCatogeries
