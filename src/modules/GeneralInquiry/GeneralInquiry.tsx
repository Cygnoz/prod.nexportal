// import Notebook from "../../assets/icons/Notebook";
import Table from "../../components/ui/Table";
import { useResponse } from "../../context/ResponseContext";
import { GeneralInquiryData } from "../../Interfaces/GeneralInquiry";
import useApi from "../../Hooks/useApi";
import { useEffect, useState } from "react";
import { endPoints } from "../../services/apiEndpoints";
import Modal from "../../components/modal/Modal";
import GeneralInquiryView from "./GeneralInquiryView";
import ProductLogo from "../../components/ui/ProductLogo";

type Props = {}

const GeneralInquiry = ({ }: Props) => {

    // const navigate = useNavigate();
    // const { cmsMenu } = useResponse()
    const { loading, setLoading } = useResponse();
    const { request: getAllData } = useApi("get", 3001);
    const [getData, setGetData] = useState([]);
    const [filterData, setFilterData] = useState([]);

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
                console.log(response.data.contacts);
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

    const BillBizz = "BillBizz";
    const SewNex = "SewNex";
    const SaloNex = "SaloNex";
    const NexD = "6NexD";
    const All = ""

    const sort = [
        {
            sortHead: "By product",
            sortList: [
                {
                    label: 'All',
                    icon: '',
                    action: () => handleFilter({ options: All }),
                },
                {
                    label: BillBizz,
                    icon: <ProductLogo projectName={BillBizz} size={6} />,
                    action: () => handleFilter({ options: BillBizz }),
                },
                {
                    label: SewNex,
                    icon: <ProductLogo projectName={SewNex} size={6} />,
                    action: () => handleFilter({ options: SewNex }),
                },
                {
                    label: SaloNex,
                    icon: <ProductLogo projectName={SaloNex} size={6} />,
                    action: () => handleFilter({ options: SaloNex }),
                },
                {
                    label: NexD,
                    icon: <ProductLogo projectName={NexD} size={6} />,
                    action: () => handleFilter({ options: NexD }),
                },
            ],
        },
    ];

    const handleFilter = ({ options }: { options: string }) => {
        if (options === All) {
            // Show all data if "All" is selected
            setFilterData(getData);
            return;
        }
    
        // Check if the option is a product filter
        const isProductFilter = [BillBizz, SewNex, SaloNex, NexD].includes(options);
    
        if (isProductFilter) {
            const filteredTrials = getData.filter((data: any) => 
                data.project?.toLowerCase() === options.toLowerCase()
            );
            setFilterData(filteredTrials);
        }
    };

    useEffect(() => {
        setFilterData(getData);
    }, [getData]);
    
    
console.log("data",filterData);



return (
    <div>
        <div>
            <p className="text-[#303F58] text-xl font-bold">General Inquiries</p>

            <div>
                <Table<GeneralInquiryData>
                    data={filterData}
                    columns={columns}
                    headerContents={{
                        search: { placeholder: "Search Inquiries" },
                        sort: sort
                    }}
                    actionList={[
                        { label: "view", function: handleView },
                    ]}
                    loading={loading}
                />
            </div>
        </div>
        <Modal open={isModalOpen} onClose={handleView} className="w-[50%]">
            <GeneralInquiryView id={viewId} onClose={handleView} />
        </Modal>
    </div>
)
}

export default GeneralInquiry