import Boxes from "../../../../assets/icons/Boxes";
import EmailIcon from "../../../../assets/icons/EmailIcon";
import LocationIcon from "../../../../assets/icons/LocationIcon";
import PhoneIcon from "../../../../assets/icons/PhoneIcon";
import UserIcon from "../../../../assets/icons/UserIcon";
import { LeadData } from "../../../../Interfaces/Lead";

type Props = {
    onClose: () => void;
    leadData:LeadData
}

const LeadViewInfo = ({ onClose,leadData }: Props) => {
    console.log(leadData);
    
    return (
        <div>
            <div className="p-5 bg-white rounded-xl shadow-md">
                <div className="flex justify-between items-center">
                    <div className="px-2 ">
                        <h1 className="font-bold text-sm">Lead Info</h1>
                        <p className="text-xs mt-2 font-normal text-[#8F99A9]">Leadership and learning are indispensable to each other</p>

                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900 me-6">
                        &times;
                    </button>

                </div>



                <div className="grid grid-cols-12 gap-4 p-2">
                    {/* Table Section */}
                    <div className="sm:col-span-5 col-span-12 my-2 ">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-60 rounded-md">
                            <h1 className="text-sm font-semibold my-2">Basic Details</h1>
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]" >Name</h3>
                            <div className="flex">
                                <UserIcon size={18} color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{leadData?.firstName}{leadData?.lastName&&leadData?.lastName}</p>
                            </div>

                            <hr />


                          

                           
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Lead ID</h3>
                            <div className="flex">
                                <Boxes color="#4B5C79" size={18} />
                                <p className="text-sm font-semibold ms-2">{leadData?.customerId ? leadData?.customerId:'N/A'}</p>

                            </div>

                        </div>

                    </div>
                    <div className="sm:col-span-7 col-span-12 my-2">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-60 rounded-md">
                            <h1 className="text-sm font-semibold my-2">Contact Information</h1>
                          

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone</h3>
                            <div className="flex">
                                <PhoneIcon size={16} />
                                <p className="text-sm font-semibold ms-2">{leadData?.phone}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]"> Email Address</h3>
                            <div className="flex">
                                <EmailIcon size={16} />
                                <p className="text-sm font-semibold ms-2">{leadData.email ? leadData.email :'N/A'}</p>

                            </div>
                        </div>

                    </div>



                </div>

                <div className="grid grid-cols-12 gap-2">
                    {/* Table Section */}
                    <div className="sm:col-span-7 col-span-12 my-2 ">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-fit rounded-md">
                            <h1 className="text-sm font-semibold my-2">Company Information</h1>
                           
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company Name</h3>
                            <div className="flex">
                                <EmailIcon size={16} />
                                <p className="text-sm font-semibold ms-2">{leadData?.companyName? leadData?.companyName:'N/A'}</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company Phone</h3>
                            <div className="flex">
                                <PhoneIcon size={16} />
                                <p className="text-sm font-semibold ms-2">{leadData?.companyPhone?leadData.companyPhone:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company address</h3>
                            <div className="flex">
                                <LocationIcon size={16} />
                                <p className="text-sm font-semibold ms-2">{leadData.companyAddress?leadData.companyAddress:'N/A'} </p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Region</h3>
                            <div className="flex">
                                <Boxes color="#4B5C79" size={18} />
                                <p className="text-sm font-semibold ms-2">{leadData?.regionDetails?.regionName?leadData?.regionDetails?.regionName:'N/A'}</p>

                            </div>

                        </div>

                    </div>
                    
                    <div className="sm:col-span-5 col-span-12 my-2 ">
            <div className="p-4  mx-1 bg-[#F3EEE7] h-80 rounded-md">
              <h1 className="text-sm font-semibold my-2"> Employment Details</h1>
              <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Website</h3>
              <div className="flex">
                <UserIcon color="#4B5C79"/>
                <p className="text-sm font-semibold ms-2">{leadData.website?leadData.website:'N/A'}</p>

              </div>
             
              <hr />
              <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Lead Source</h3>
              <div className="flex">
                <UserIcon color="#4B5C79"/>
                <p className="text-sm font-semibold ms-2">{leadData.leadSource?leadData.leadSource:'N/A'}</p>

              </div>
              <hr />
             
            </div>

          </div>





                </div>


            </div>
        </div>
    )
}

export default LeadViewInfo