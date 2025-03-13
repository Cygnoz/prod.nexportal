import { useEffect, useState } from "react"
import Button from "../../components/ui/Button"
import UserIcon from "../../assets/icons/UserIcon"
import EmailIcon from "../../assets/icons/EmailIcon"
import RegionIcon from "../../assets/icons/RegionIcon"
import ProfilePhotoIcon from "../../assets/icons/ProfilePhotoIcon"
import CompanyIdIcon from "../../assets/icons/CompanyIdIcon"
import LogoTitleIcon from "../../assets/icons/LogoTitleIcon"
import DesignationIcon from "../../assets/icons/DesignationIcon"
import AddressIcon from "../../assets/icons/AddressIcon"
// import companyInfoIcon from "../../assets/icons/companyInfoIcon"
import CompanyLogoIcon from "../../assets/icons/CompanyLogoIcon"
// import cygnoz from '../../assets/image/cygnoz.com.png'
// import profile from '../../assets/image/AvatarImg.png'
import PhoneIcon from "../../assets/icons/PhoneIcon"
// import LocationIcon from "../../assets/icons/LocationIcon"
// import previewFront from '../../assets/image/preview-card-front.png'
// import previewBack from '../../assets/image/preview-card-back.png'
import { Layout1Front, Layout2Front, Layout3Front, Layout1Back, Layout2Back, Layout3Back } from "../../components/ui/BSLayout"
import useApi from "../../Hooks/useApi"
import { endPoints } from "../../services/apiEndpoints"
import toast from "react-hot-toast"
import { useRegularApi } from "../../context/ApiContext"
import { useResponse } from "../../context/ResponseContext"
// 
type Props = {}

function BusinessCard({ }: Props) {
    const tabs = ["Layout", "Content"]
    const { request: addBusinessCard } = useApi('put', 3003)
    // const [bcardData, setBcardData] = useState<any>(null)
    const { businessCardData, refreshContext } = useRegularApi()
    useEffect(() => {
        refreshContext({ businessCard: true })
    }, [])

    const [toggleStates, setToggleStates] = useState<any>({});
    const { setPostLoading } = useResponse()
    const layoutToggle = {
        "profilePhoto": true,
        "companyLogo": true,
        "name": true,
        "employeeId": true,
        "email": true,
        "logoTitle": true,
        "designation": true,
        "region": true,
        "address": true,
        "phoneNo": true,
        "companyInfo": true,
    }

    // Toggle handler for individual item
    const handleToggle = (item: string) => {
        setToggleStates((prev: any) => ({
            ...prev,
            [item]: !prev[item]

        }));
    };

    const [activeTab, setActiveTab] = useState<string>("Layout");
    type LayoutKeys = "Layout1" | "Layout2" | "Layout3";
    interface LayoutProps {
        toggleState?: Record<string, boolean>;
        role?: any;
        staffData?: any;
    }
    // Define the layoutComponents object with proper types
    const layoutComponents: Record<
        LayoutKeys,
        { Front: React.FC<LayoutProps>; Back: React.FC<LayoutProps> }
    > = {
        Layout1: {
            Front: Layout1Front,
            Back: Layout1Back,
        },
        Layout2: {
            Front: Layout2Front,
            Back: Layout2Back,
        },
        Layout3: {
            Front: Layout3Front,
            Back: Layout3Back,
        },
    };

    const [activeLayout, setActiveLayout] = useState<LayoutKeys>("Layout1");
    const { Front: ActiveFront, Back: ActiveBack } = layoutComponents[activeLayout];


    const handleSubmit = async () => {
        const bCardData = {
            layout: activeLayout,
            ...toggleStates
        }
        console.log(bCardData);
        try {
            setPostLoading(true)
            const { response, error } = await addBusinessCard(endPoints.BUSINESSCARD, bCardData)
            console.log(response, "res");
            console.log(error, "err");
            if (response && !error) {
                console.log(response.data);
                toast.success(response.data.message)
                refreshContext({ businessCard: true })
            }
            else {
                console.log(error.response.data.message);
                toast.error(error.response.data.message)
            }
        }
        catch (err) {
            console.error(err, "Error submiting bcard data")
        }
        finally {
            setPostLoading(false)
        }
    }

    useEffect(() => {
        if (businessCardData) {
            const { layout, ...toggles } = businessCardData;

            setActiveLayout(layout);
            setToggleStates({
                "profilePhoto": toggles?.profilePhoto,
                "companyLogo": toggles?.companyLogo,
                "name": toggles?.name,
                "employeeId": toggles?.employeeId,
                "email": toggles?.email,
                "logoTitle": toggles?.logoTitle,
                "designation": toggles?.designation,
                "region": toggles?.region,
                "address": toggles?.address,
                "phoneNo": toggles?.phoneNo,
                "companyInfo": toggles?.companyInfo,
            });
        }
    }, []);
    //   console.log(businessCardData);



    return (
        <>

            <div className="mb-4">
                <p className="text-[#303F58] text-lg font-bold">Business Card</p>
                <p className="text-ashGray text-sm">
                    Store and manage business contact details.
                </p>
            </div>
            <div className="flex gap-24 bg-[#FEFBF8] rounded-xl px-4 py-2 text-base font-bold border-b border-gray-200">
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`cursor-pointer py-2 px-[16px] ${activeTab === tab
                            ? "text-[#303F58] text-sm font-bold border-b-2 shadow-lg rounded-md border-[#97998E]"
                            : "text-gray-400"
                            }`}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12">
                <div className="col-span-12 sm:col-span-8">
                    <div className="me-4 p-2 bg-[#FFFFFF] rounded-lg mt-4 mb-6">

                        {activeTab === "Layout" && (
                            <div>
                                <div className="flex justify-between mt-4">
                                    <p className="my-2 text-[#303F58] text-base font-bold">Select Template</p>
                                    <div className="flex items-center border bg-[#FFFFFF] rounded-lg w-full md:w-80 h-9 px-3 my-2">
                                        <input
                                            type="text"
                                            placeholder="Search template"
                                            className="flex-grow outline-none text-sm text-[#8F99A9]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 p-2">
                                    <div>
                                        <button
                                            className={`p-2 ${activeLayout === "Layout1" ? "bg-[#FFFFFF] border border-[#820000] rounded-2xl" : "bg-[#FFFFFF]"}`}
                                            onClick={() => setActiveLayout("Layout1")}
                                        >
                                            <Layout1Front toggleState={layoutToggle} />
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            className={`p-2 ${activeLayout === "Layout2" ? "bg-[#FFFFFF] border border-[#820000] rounded-2xl" : "bg-[#FFFFFF]"}`}
                                            onClick={() => setActiveLayout("Layout2")}
                                        >
                                            <Layout2Front toggleState={layoutToggle} />
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            className={`p-2 ${activeLayout === "Layout3" ? "bg-[#FFFFFF] border border-[#820000] rounded-2xl" : "bg-[#FFFFFF]"}`}
                                            onClick={() => setActiveLayout("Layout3")}
                                        >
                                            <Layout3Front toggleState={layoutToggle} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeTab === "Content" && (
                            <div>
                                <div className="">
                                    <div className="p-3">
                                        <p className="text-[#303F58] text-base font-bold">Edit Details</p>
                                        <p className="text-[#8F99A9] text-xs font-normal my-1">A preview of the business card with dynamically changing visibility of fields</p>
                                    </div>
                                    <hr />

                                    <div>
                                        <div className="flex p-3 justify-between">
                                            <div className="flex gap-4">
                                                <div className="py-2">
                                                    <ProfilePhotoIcon color="#768294" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[#4B5C79] text-sm font-medium">Profile Photo</p>
                                                    <p className="text-[#B0B0B0] text-sm font-normal">Update your profilePhoto for display within the application.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["profilePhoto"]}
                                                        onChange={() => handleToggle("profilePhoto")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2
                                                            peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                            peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                            peer-checked:after:border-white after:content-[''] after:absolute 
                                                            after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                            after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}

                                                    ></div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <CompanyLogoIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Company Logo</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Picture</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["companyLogo"]}
                                                        onChange={() => handleToggle("companyLogo")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <UserIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Name</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Name</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["name"]}
                                                        onChange={() => handleToggle("name")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <CompanyIdIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Employee ID</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable ID</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["employeeId"]}
                                                        onChange={() => handleToggle("employeeId")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <EmailIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Email</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Email</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["email"]}
                                                        onChange={() => handleToggle("email")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <LogoTitleIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Logo Title</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Title</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["logoTitle"]}
                                                        onChange={() => handleToggle("logoTitle")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <DesignationIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Designation</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Designation</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["designation"]}
                                                        onChange={() => handleToggle("designation")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <RegionIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Region Name</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Region</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["region"]}
                                                        onChange={() => handleToggle("region")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <AddressIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Personal Address</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Address</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["address"]}
                                                        onChange={() => handleToggle("address")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <PhoneIcon color="#768294" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Phone Number</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Phone Number</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["phoneNo"]}
                                                        onChange={() => handleToggle("phoneNo")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex p-4 gap-4">
                                            <div className="py-2">
                                                <CompanyLogoIcon color="#768294" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[#4B5C79] text-sm font-medium">Company Info</p>
                                                <p className="text-[#B0B0B0] text-sm font-normal">Enable/Disable Info</p>
                                            </div>
                                            <div className="ml-auto justify-end">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value=""
                                                        className="sr-only peer"
                                                        checked={toggleStates["companyInfo"]}
                                                        onChange={() => handleToggle("companyInfo")}
                                                    />
                                                    <div
                                                        className={`w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-2 
                                                                     peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                                                     peer-checked:bg-gray-700 peer-checked:after:translate-x-full 
                                                                     peer-checked:after:border-white after:content-[''] after:absolute 
                                                                    after:top-1 after:left-1 after:bg-white after:border-gray-300 
                                                                     after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
                                                    ></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="col-span-12 sm:col-span-4 ">
    <div className="p-4 bg-[#F5F9FC] rounded-lg mt-4">
        <p className="my-2 text-[#000000] text-base font-medium">Preview</p>
        <div className="my-3">
            <ActiveFront toggleState={toggleStates} />
        </div>
        <div>
            <ActiveBack toggleState={toggleStates} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 my-4 justify-between">
            <Button variant="tertiary" className="w-full sm:w-28 h-10">
                <p className="ms-6">Cancel</p>
            </Button>
            <Button onClick={handleSubmit} variant="primary" className="w-full sm:w-32 h-10">
                <p className="ms-9">Save</p>
            </Button>
        </div>
    </div>
</div>


            </div>


        </>
    )
}

export default BusinessCard