import  { useState } from 'react'
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import CreateNotModal from './CreateNotModal';

type Props = {}

function NotificationHome({ }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const tableHeadings = ["Title", "Recipients", "Status", "Action"]
    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-[#303F58] text-xl font-bold">Notifiaction</h1>
               <CreateNotModal/>
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
                            <tr>
                                <td className='text-center'>
                                    name
                                </td>
                                <td className='text-center'>
                                    name
                                </td>
                                <td className='text-center flex items-center justify-center'>
                                    <p className='bg-[#D4F8D3] p-2 w-20 my-1 rounded-lg'>
                                        Sended
                                    </p>
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
                </div>
            </div>
        </div>
    )
}

export default NotificationHome