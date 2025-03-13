import BloodGroupIcon from "../../../../assets/icons/BloodGroupIcon";
import Boxes from "../../../../assets/icons/Boxes";
import BuildingIcon from "../../../../assets/icons/BuildingIcon";
import EmailIcon from "../../../../assets/icons/EmailIcon";
import LocationIcon from "../../../../assets/icons/LocationIcon";
import PhoneIcon from "../../../../assets/icons/PhoneIcon";
import UserIcon from "../../../../assets/icons/UserIcon";

type Props = {
  onClose: () => void;
  trialData?: any;
};

const TrialViewForm = ({ onClose, trialData }: Props) => {
  console.log(trialData);
  
  return (
    <div className="p-5 bg-white rounded shadow-md">
    <div className="flex justify-between items-center">
      <div className="px-2">
        <h1 className="font-bold text-sm">Trial Info</h1>
        <p className="text-xs mt-2 font-normal text-[#8F99A9]">
          A true test is not without challenges.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-600 hover:text-gray-900 font-bold"
      >
        <p className="text-xl">&times;</p>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
      <div className="p-4 bg-[#F3EEE7] rounded-lg">
        <h1 className="text-sm font-semibold mb-4">Basic Details</h1>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#8F99A9]">Name</h3>
          <div className="flex items-center mt-1">
            <UserIcon color="#4B5C79" />
            <p className="text-sm font-semibold ms-2">{trialData?.firstName || 'N/A'}</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#8F99A9]">Organization Name</h3>
          <div className="flex items-center mt-1">
            <BuildingIcon color="#4B5C79" size={14} />
            <p className="text-sm font-semibold ms-2">{trialData?.organizationName || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#8F99A9]">Trial ID</h3>
          <div className="flex items-center mt-1">
            <BloodGroupIcon size={20} />
            <p className="text-sm font-semibold ms-2">{trialData?.customerId || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#F3EEE7] rounded-lg">
        <h1 className="text-sm font-semibold mb-4">Contact Information</h1>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#8F99A9]">Phone</h3>
          <div className="flex items-center mt-1">
            <PhoneIcon size={20} />
            <p className="text-sm font-semibold ms-2">{trialData?.phone || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#8F99A9]">Email Address</h3>
          <div className="flex items-center mt-1">
            <EmailIcon size={20} />
            <p className="text-sm font-semibold ms-2">{trialData?.email || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-4 p-4 bg-[#F3EEE7] rounded-lg">
      <h1 className="text-sm font-semibold mb-4">Company Information</h1>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#8F99A9]">Company ID</h3>
        <div className="flex items-center mt-1">
          <UserIcon color="#4B5C79" size={20} />
          <p className="text-sm font-semibold ms-2">{trialData?.organizationId || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#8F99A9]">Company Name</h3>
        <div className="flex items-center mt-1">
          <BuildingIcon size={20} />
          <p className="text-sm font-semibold ms-2">{trialData?.companyName || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#8F99A9]">Company Phone</h3>
        <div className="flex items-center mt-1">
          <PhoneIcon size={20} />
          <p className="text-sm font-semibold ms-2">{trialData?.companyPhone || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#8F99A9]">Company Address</h3>
        <div className="flex items-center mt-1">
          <LocationIcon size={20} />
          <p className="text-sm font-semibold ms-2">{trialData?.companyAddress || 'N/A'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[#8F99A9]">Region</h3>
        <div className="flex items-center mt-1">
          <Boxes color="#4B5C79" />
          <p className="text-sm font-semibold ms-2">{trialData?.regionDetails?.regionName || 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default TrialViewForm;
