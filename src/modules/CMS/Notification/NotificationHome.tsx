import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import CreateNotModal from './CreateNotModal';
import useApi from '../../../Hooks/useApi';
import { endPoints } from '../../../services/apiEndpoints';
import { NotificationFormData } from '../../../Interfaces/CMS';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

type Props = {}

function NotificationHome({ }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const tableHeadings = ["Title", "Recipients", "Status", "Action"]
    const [notifictionData, setNotificationData] = useState<NotificationFormData[]>([]);
    const [filteredData, setFilteredData] = useState<NotificationFormData[]>([]);


    const { request: getAllNot } = useApi('get', 3001)
    const { request: deleteNot } = useApi('delete', 3001)

    const [loading, setLoading] = useState(false); // Add loading state

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setConfirmModalOpen(true);
    };

    const getAllNotification = async () => {
        setLoading(true); // Start loading
        try {
            const { response, error } = await getAllNot(`${endPoints.NOTIFICATION}`);
            if (response && !error) {
                console.log("response", response.data.data);
                setNotificationData(response?.data.data);
                setFilteredData(response?.data.data);
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
                ? notifictionData.filter((data) =>
                    data.title.toLowerCase().includes(searchValue.toLowerCase())
                )
                : notifictionData
        );
    }, [searchValue, notifictionData]);

    useEffect(() => {
        getAllNotification()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const url = `${endPoints.NOTIFICATION}/${id}`;
            const { response, error } = await deleteNot(url);
            if (!error && response) {
                toast.success(response.data.message);
                getAllNotification()
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
                <h1 className="text-[#303F58] text-xl font-bold">Notifiaction</h1>
                <CreateNotModal fetchData={getAllNotification} />
            </div>

            <div className="bg-white p-3 my-3">
                <div className="flex gap-4 mb-4 flex-wrap">
                    <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
                </div>
                <div className="w-full overflow-x-auto"> {/* Enable horizontal scrolling when necessary */}
                    <table className="w-full my-4 table-auto">
                        <thead>
                            <tr>
                                {tableHeadings.map((head, index) => (
                                    <th
                                        className="bg-[#F6F6F6] py-2 text-center px-4 font-semibold"
                                        key={index}
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                loading ? (
                                    <tr>
                                        <td colSpan={tableHeadings.length} className="text-center text-gray-500 py-4">
                                            Loading Data...
                                        </td>
                                    </tr>
                                ) : filteredData?.length > 0 ? (
                                    filteredData.map((data) => (
                                        <tr key={data._id} className="hover:bg-[#F9F9F9]">
                                            <td className="text-center py-2 px-4">{data.title}</td>
                                            <td className="text-center py-2 px-4">name</td>
                                            <td className="text-center py-2 px-4 flex justify-center">
                                                <p
                                                    className={`p-2 w-24 my-1 text-sm rounded-lg ${data.status === "Scheduled"
                                                        ? "bg-[#FBE7E9]"
                                                        : data.status === "Draft"
                                                            ? "bg-[#EDE7FB]"
                                                            : data.status === "Sended"
                                                                ? "bg-[#D4F8D3]"
                                                                : ""
                                                        }`}
                                                >
                                                    {data.status}
                                                </p>
                                            </td>
                                            <td className="text-center py-2 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <CreateNotModal fetchData={getAllNotification} id={`${data._id}`} />

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
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={tableHeadings.length} className="text-center text-gray-500 py-4">
                                            No Data Available
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    )
}

export default NotificationHome