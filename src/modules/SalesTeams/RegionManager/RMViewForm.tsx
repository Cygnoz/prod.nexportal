import { useEffect, useState } from "react";
import BankIcon from "../../../assets/icons/BankIcon";
import BloodGroupIcon from "../../../assets/icons/BloodGroupIcon";
import CalenderDays from "../../../assets/icons/CalenderDays";
import EmailIcon from "../../../assets/icons/EmailIcon";
import LocationIcon from "../../../assets/icons/LocationIcon";
import PhoneIcon from "../../../assets/icons/PhoneIcon";
import RegionIcon from "../../../assets/icons/RegionIcon";
import UserIcon from "../../../assets/icons/UserIcon";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";


type Props = {
  onClose: () => void;
  id?:string
}




const RMViewForm: React.FC<Props> = ({ onClose,id }) => {


  const { request: getaRM } = useApi('get', 3002)



  const [data, setData] = useState<{
    rmData: any;
  }>
    ({ rmData: [] })


  const getARM = async () => {
    try {
      const { response, error } = await getaRM(`${endPoints.GET_ALL_RM}/${id}`);
      if (response && !error) {
        setData((prevData) => ({
          ...prevData,
          rmData: response.data
        }))
      }
      else {
        console.error(error.response.data.message)
      }
    }
    catch (err) {
      console.error("Error fetching RM data:", err);
    }
  }

  useEffect(() => {
    getARM();
  }, [id])
  console.log(data);






  return (
    <div>
    <div className="p-5 bg-white rounded shadow-md">
      <div className="flex justify-between items-center">
        <div className="px-2">
          <h1 className="font-bold text-sm">Region Manager Info</h1>
          <p className="text-xs mt-2 font-normal text-[#8F99A9]">A manager is not a person who can do the work better than his men</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
        >
          &times;
        </button>
      </div>
  
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2">
        {/* Table Section */}
        <div className="col-span-12 sm:col-span-3 my-2">
          <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
            <h1 className="text-sm font-semibold my-2">Basic Details</h1>
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Name</h3>
            <div className="flex">
              <UserIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.user?.userName || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Age</h3>
            <div className="flex">
              <CalenderDays color="#4B5C79" />
              <p className="text-sm font-semibold ms-2 ">{data.rmData?.regionManager?.age || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Blood Group</h3>
            <div className="flex">
              <BloodGroupIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.bloodGroup || 'N/A'}</p>
            </div>
          </div>
        </div>
  
        <div className="col-span-12 sm:col-span-4 my-2">
          <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
            <h1 className="text-sm font-semibold my-2">Contact Information</h1>
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Address</h3>
            <div className="flex">
              <LocationIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.address?.street1 || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone</h3>
            <div className="flex">
              <PhoneIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.user?.phoneNo || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Email Address</h3>
            <div className="flex">
              <EmailIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
  
        <div className="col-span-12 sm:col-span-5 my-2">
          <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
            <h1 className="text-sm font-semibold my-2">Identification and Employment Details</h1>
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Adhar Number</h3>
            <div className="flex">
              <UserIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.adhaarNo || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Pan Number</h3>
            <div className="flex">
              <UserIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.panNo || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Date Of Joining</h3>
            <div className="flex">
              <CalenderDays color="#4B5C79" />
              <p className="text-sm font-semibold ms-2 ">{data.rmData?.regionManager?.dateOfJoining ? new Date(data.rmData?.regionManager?.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
  
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Table Section */}
        <div className="col-span-12 sm:col-span-7 my-2">
          <div className="p-4 mx-1 bg-[#F3EEE7] h-[342px]">
            <h1 className="text-sm font-semibold my-2">Bank Information</h1>
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Name</h3>
            <div className="flex">
              <BankIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.bankDetails?.bankName || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Branch</h3>
            <div className="flex">
              <BankIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.bankDetails?.bankBranch || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Account Number</h3>
            <div className="flex">
              <PhoneIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.bankDetails?.bankAccountNo || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">IFSC Code</h3>
            <div className="flex">
              <UserIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.bankDetails?.ifscCode || 'N/A'}</p>
            </div>
          </div>
        </div>
  
        <div className="col-span-12 sm:col-span-5 my-1">
          <div className="p-4 mx-1 bg-[#F3EEE7] h-[342px]">
            <h1 className="text-sm font-semibold my-2">Company Information</h1>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Work Mail</h3>
            <div className="flex">
              <EmailIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.workEmail || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Work Phone</h3>
            <div className="flex">
              <PhoneIcon size={20} />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.workPhone || 'N/A'}</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Role</h3>
            <div className="flex">
              <UserIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">Regional Manager</p>
            </div>
            <hr />
            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Region</h3>
            <div className="flex">
              <RegionIcon color="#4B5C79" />
              <p className="text-sm font-semibold ms-2">{data.rmData?.regionManager?.region?.regionCode || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  )
}

export default RMViewForm