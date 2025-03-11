import BankIcon from "../../../../assets/icons/BankIcon";
import BloodGroupIcon from "../../../../assets/icons/BloodGroupIcon";
import CalenderDays from "../../../../assets/icons/CalenderDays";
import EmailIcon from "../../../../assets/icons/EmailIcon";
import LocationIcon from "../../../../assets/icons/LocationIcon";
import PhoneIcon from "../../../../assets/icons/PhoneIcon";
import RegionIcon from "../../../../assets/icons/RegionIcon";
import UserIcon from "../../../../assets/icons/UserIcon";

type Props = {
  onClose: () => void;
  bdaData:any
}




const BDAViewForm: React.FC<Props> = ({ onClose,bdaData }) => {
 // console.log(bdaData);
  return (
    <div>
     <div className="p-5 bg-white rounded shadow-md">
  <div className="flex justify-between items-center">
    <div className="px-2">
      <h1 className="font-bold text-sm">BDA Info</h1>
      <p className="text-xs mt-2 font-normal text-[#8F99A9]">Growth is the only constant, let's chase it together</p>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="text-gray-600 hover:text-gray-900 font-bold"
    >
      <p className="text-xl">&times;</p>
    </button>
  </div>

  <div className="grid grid-cols-12 gap-2 p-2">
    {/* Table Section */}
    <div className="col-span-12 sm:col-span-3 my-2">
      <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
        <h1 className="text-sm font-semibold my-2">Basic Details</h1>
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Name</h3>
        <div className="flex">
          <UserIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.user.userName}</p>
        </div>

        <hr />

        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Age</h3>

        <div className="flex">
          <CalenderDays color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.age ? bdaData.age : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Blood Group</h3>
        <div className="flex">
          <BloodGroupIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.bloodGroup ? bdaData.bloodGroup : 'N/A'}</p>
        </div>
      </div>
    </div>

    <div className="col-span-12 sm:col-span-4 my-2">
      <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
        <h1 className="text-sm font-semibold my-2">Contact Information</h1>
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Address</h3>
        <div className="flex">
          <LocationIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.address.street1 ? bdaData.address.street1 : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone</h3>
        <div className="flex">
          <PhoneIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.user.phoneNo ? bdaData.user.phoneNo : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Email Address</h3>
        <div className="flex">
          <EmailIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.user.email ? bdaData.user.email : 'N/A'}</p>
        </div>
      </div>
    </div>

    <div className="col-span-12 sm:col-span-5 my-2">
      <div className="p-4 mx-1 bg-[#F3EEE7] h-60">
        <h1 className="text-sm font-semibold my-2">Identification and Employment Details</h1>
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Adhar Number</h3>
        <div className="flex">
          <UserIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.adhaarNo ? bdaData.adhaarNo : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Pan Number</h3>
        <div className="flex">
          <UserIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.panNo ? bdaData.panNo : 'N/A'}</p>
        </div>
        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Date Of Joining</h3>

        <div className="flex">
          <CalenderDays color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{new Date(bdaData.dateOfJoining).toLocaleDateString("en-GB")}</p>
        </div>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-12 gap-2">
    {/* Table Section */}
    <div className="col-span-12 sm:col-span-7 my-2">
      <div className="p-4 mx-1 bg-[#F3EEE7] h-[342px]">
        <h1 className="text-sm font-semibold my-2">Bank Information</h1>
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Name</h3>
        <div className="flex">
          <BankIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.bankDetails.bankName ? bdaData.bankDetails.bankName : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Branch</h3>
        <div className="flex">
          <BankIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.bankDetails.bankBranch ? bdaData.bankDetails.bankBranch : 'N/A'}</p>
        </div>
        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Account number</h3>
        <div className="flex">
          <PhoneIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.bankDetails.bankAccountNo ? bdaData.bankDetails.bankAccountNo : 'N/A'}</p>
        </div>

        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">IFSC Code</h3>
        <div className="flex">
          <UserIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.bankDetails.ifscCode ? bdaData.bankDetails.ifscCode : 'N/A'}</p>
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
          <p className="text-sm font-semibold ms-2">{bdaData.workEmail ? bdaData.workEmail : 'N/A'}</p>
        </div>
        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Work Phone</h3>
        <div className="flex">
          <PhoneIcon size={20} />
          <p className="text-sm font-semibold ms-2">{bdaData.workPhone ? bdaData.workPhone : 'N/A'}</p>
        </div>
        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Role</h3>
        <div className="flex">
          <UserIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">BDA</p>
        </div>
        <hr />
        <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Region</h3>

        <div className="flex">
          <RegionIcon color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{bdaData.region.regionCode ? bdaData.region.regionCode : 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  )
}

export default BDAViewForm