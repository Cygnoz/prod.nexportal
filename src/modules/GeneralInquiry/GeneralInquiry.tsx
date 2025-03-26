import Notebook from "../../assets/icons/Notebook";
import Table from "../../components/ui/Table";
import { useResponse } from "../../context/ResponseContext";
import { GeneralInquiryData } from "../../Interfaces/GeneralInquiry";
import useApi from "../../Hooks/useApi";
import { useEffect, useState } from "react";
import { endPoints } from "../../services/apiEndpoints";
import Modal from "../../components/modal/Modal";
import GeneralInquiryView from "./GeneralInquiryView";

type Props = {}

const GeneralInquiry = ({ }: Props) => {

    // const navigate = useNavigate();
    // const { cmsMenu } = useResponse()
    const { loading, setLoading } = useResponse();
    const { request: getAllData } = useApi("get", 3001);
    const [getData, setGetData] = useState([]);

    const columns: { key: any; label: string }[] = [
        { key: "firstName", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phoneNo", label: "Phone Number" },
        { key: "project", label: "Product" }, // Changed from "status" to "project"
        { key: "subject", label: "Subject" },
        { key: 'message', label: 'Message' },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewId, setViewId] = useState('')
    const handleView = (id?: any) => {
        setViewId(id)
        setIsModalOpen((prev) => !prev);
    };


    const handleGetContact = async () => {
        try {
            setLoading(true)
            const { response, error } = await getAllData(`${endPoints.GENERAL_INQUIRY}`)
            console.log('res', response);
            console.log('err', error);
            if (response && !error) {
                console.log(response.data);
                setGetData(response.data.contacts)
            }
            else {
                console.log(error.respone.data.message);

            }
        }
        catch (err) {
            console.log('error occured', err);

        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        handleGetContact()
    }, [])
    return (
        <div>
            <div>
                <p className="text-[#303F58] text-xl font-bold">General Inquiries</p>

                <div>
                    <Table<GeneralInquiryData>
                        data={getData}
                        columns={columns}
                        headerContents={{
                            search: { placeholder: "Search Inquiries" },
                            sort: [
                                {
                                    sortHead: "By Category",
                                    sortList: [
                                        {
                                            label: "Sort by Code",
                                            icon: <Notebook size={14} color="#4B5C79" />,
                                            // action: () => handleFilter({ options: code }),
                                        },
                                    ],
                                },
                            ],
                        }}
                        actionList={[
                            { label: "view", function: handleView },
                        ]}
                        loading={loading}
                    />
                </div>
            </div>
            <Modal open={isModalOpen} onClose={handleView} className="w-[50%]">
                <GeneralInquiryView id={viewId}  onClose={handleView} />
            </Modal>
        </div>
    )
}

export default GeneralInquiry