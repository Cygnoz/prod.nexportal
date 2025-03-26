import { useEffect, useState } from "react"
import useApi from "../../Hooks/useApi"
import { endPoints } from "../../services/apiEndpoints"
import UserIcon from "../../assets/icons/UserIcon"
import EmailIcon from "../../assets/icons/EmailIcon"
import PhoneIcon from "../../assets/icons/PhoneIcon"
import CompanyIcon from "../../assets/icons/CompanyIcon"

type Props = {
  onClose: () => void;
  id: string
}

// Define the interface for your data
interface InquiryData {
  _id: string;
  project: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  companyName: string;
  companyAddress: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}



const GeneralInquiryView = ({ onClose, id }: Props) => {

  const { request: getAContact } = useApi('get', 3001)
  const [getAData, setGetAData] = useState<InquiryData | null>(null);

  const handleGetOne = async () => {
    try {
      const { response, error } = await getAContact(`${endPoints.GENERAL_INQUIRY}/${id}`)

      if (response && !error) {
        console.log(response.data.contact);

        setGetAData(response?.data?.contact)

      }
      else {
        console.log(error.respone.data.message);

      }
    }
    catch (err) {
      console.log('error occured', err);

    }
  }
  useEffect(() => {
    handleGetOne()
  }, [])
  return (
    <div>
      <div className="p-5 bg-white rounded shadow-md">
        <div className="flex justify-between items-center">
          <div className="px-2">
            <h1 className="font-bold text-sm">Inquiry Info</h1>
            <p className="text-xs mt-2 font-normal text-[#8F99A9]">Building strong connections, achieving regional goals.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">

            <>
              <div className="col-span-5">
                <div className="p-4 bg-[#F3EEE7] my-4">
                  <h1 className="text-sm font-semibold text-[#303F58] my-2">Basic Details</h1>
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">First Name</h3>
                  <div className="flex">
                    <UserIcon color="#4B5C79" />
                    <p className="text-sm font-semibold ms-2">{getAData?.firstName || "N/A"}</p>
                  </div>

                  <hr className="my-4 border border-[#C3CAD5]" />
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Last Name</h3>
                  <div className="flex">
                    <UserIcon color="#4B5C79" />
                    <p className="text-sm font-semibold ms-2">{getAData?.lastName || "N/A"}</p>
                  </div>

                  <hr className="my-4 border border-[#C3CAD5]" />
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Email</h3>
                  <div className="flex">
                    <EmailIcon size={20} />
                    <p className="text-sm font-semibold ms-2">{getAData?.email || "N/A"}</p>
                  </div>

                  <hr className="my-4 border border-[#C3CAD5]" />
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone Number</h3>
                  <div className="flex">
                    <PhoneIcon size={20} />
                    <p className="text-sm font-semibold ms-2">{getAData?.phoneNo || "N/A"}</p>
                  </div>

                  <hr className="my-4 border border-[#C3CAD5]" />
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company</h3>
                  <div className="flex">
                    <CompanyIcon size={20} />
                    <p className="text-sm font-semibold ms-2">{getAData?.companyName || "N/A"}</p>
                  </div>

                  <hr className="my-4 border border-[#C3CAD5]" />
                  <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company Address</h3>
                  <div className="flex">
                    <CompanyIcon size={20} />
                    <p className="text-sm font-semibold ms-2">{getAData?.companyAddress || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-7">
                <div className="bg-[#F2F4EB] p-4 rounded-lg my-4">
                  <p className="my-2 text-sm font-semibold text-[#303F58]">Contact Information</p>
                  <div>
                    <p className="text-[#4B5C79] text-xs font-semibold">Subject</p>
                    <p className="my-4 text-sm font-semibold text-[#303F58]">{getAData?.subject || "N/A"}</p>
                  </div>
                  <hr className="my-2 border border-[#C3CAD5]" />
                  <div className="my-3">
                    <p className="text-[#4B5C79] text-xs font-semibold">Message</p>
                    <p className="text-[#303F58] text-xs font-normal">{getAData?.message || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[#303F58] text-xs font-normal">Inquiry From</p>
                  <div className="bg-[#F5F5F5] rounded-md p-2  mt-2">
                    <p className="text-[#0B1320] text-sm font-semibold">{getAData?.project || "N/A"}</p>
                  </div>
                </div>
              </div>
            </>
        
        </div>
      </div>
    </div>
  )
}

export default GeneralInquiryView