import { useState } from 'react'
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import frame from "../../../assets/image/Categoryframe.png"
import AddCategoryModal from './AddCategoryModal';
import AddArticleModal from './AddArticleModal';

type Props = { page: string }

function KnowledgeCatogeries({ page }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const tableHeadings = ["Category Name", "Action"]
  const tableSubHeadings = ["Category Name", "Category Name", "Action"]
  const tableArticleHeadings = ["Category Name", "Category Name", "Sub Category", "Action"]

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
            page === "base" ? <AddCategoryModal page='base' /> :
              page === "sub" ? <AddCategoryModal page='sub' />
                : page === "article" ? <AddArticleModal /> : ""
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
                <tr>
                  <td className='text-center flex justify-center items-center'>
                    <div className='flex gap-2 my-1'>
                      <img src={frame} alt="" />
                      <p className='pt-1 '>name</p>
                    </div>
                  </td>

                  <td className='text-center py-2'>
                    <div className='flex items-center justify-center gap-2'>

                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Edit
                      </Button>
                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>

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
                <tr>
                  <td className='text-center flex justify-center items-center'>
                    <div className='flex gap-2 my-1'>
                      <img src={frame} alt="" />
                      <p className='pt-1 '>name</p>
                    </div>
                  </td>
                  <td className='text-center  items-center'>
                    cc
                  </td>

                  <td className='text-center py-2'>
                    <div className='flex items-center justify-center gap-2'>

                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Edit
                      </Button>
                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>

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
                <tr>
                  <td className='text-center flex justify-center items-center'>
                    <div className='flex gap-2 my-1'>
                      <img src={frame} alt="" />
                      <p className='pt-1 '>name</p>
                    </div>
                  </td>
                  <td className='text-center  items-center'>
                    cc
                  </td>
                  <td className='text-center  items-center'>
                    cc
                  </td>

                  <td className='text-center py-2'>
                    <div className='flex items-center justify-center gap-2'>

                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Edit
                      </Button>
                      <Button variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>

              </tbody>

            </table>
          }

        </div>
      </div>
    </div>
  )
}

export default KnowledgeCatogeries
