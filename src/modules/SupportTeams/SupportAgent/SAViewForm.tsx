import { useEffect, useState } from "react"
import BankIcon from "../../../assets/icons/BankIcon"
import BloodGroupIcon from "../../../assets/icons/BloodGroupIcon"
import CalenderDays from "../../../assets/icons/CalenderDays"
import EmailIcon from "../../../assets/icons/EmailIcon"
import LocationIcon from "../../../assets/icons/LocationIcon"
import PhoneIcon from "../../../assets/icons/PhoneIcon"
import RegionIcon from "../../../assets/icons/RegionIcon"
import UserIcon from "../../../assets/icons/UserIcon"
import { endPoints } from "../../../services/apiEndpoints"
import { useParams } from "react-router-dom"
import useApi from "../../../Hooks/useApi"

type Props = {
    onClose: () => void;
}

const SAViewForm = ({ onClose }: Props) => {

    const {request: getaSA}=useApi('get',3003)
    const {id} =useParams()
    const [data, setData] = useState<{
      saData:any;}>
      ({saData:[]})
   
   
    const getASA= async()=>{
        try{
            const {response,error}= await getaSA(`${endPoints.SUPPORT_AGENT}/${id}`);
                  if(response && !error){
                    setData((prevData)=>({
                      ...prevData,
                      saData:response.data
                    }))
                  }
                  else{
                    console.error(error.response.data.message)
                  }
        }
        catch(err){
            console.error("Error fetching data", err)
        }
    }

    useEffect(()=>{
        getASA()
    },[id])

    console.log(data);
    
   
   
    return (
        <div>
            <div className="p-5 bg-white rounded shadow-md  ">
                <div className="flex justify-between items-center">
                    <div className="px-2 ">
                        <h1 className="font-bold text-sm">Support Agent Info</h1>
                        <p className="text-xs mt-2 font-normal text-[#8F99A9]">Surround yourself with people who support you</p>

                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900 font-bold "
                    >
                        <p className="text-xl">&times;</p>
                    </button>

                </div>



                <div className="grid grid-cols-12 gap-2 p-2">
                    {/* Table Section */}
                    <div className="col-span-12 md:col-span-3 my-2">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-60">
                            <h1 className="text-sm font-semibold my-2">Basic Details</h1>
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]" >Name</h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{data.saData?.user?.userName ? data.saData?.user?.userName:'N/A'}</p>

                            </div>

                            <hr />


                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Age</h3>

                            <div className="flex">
                                <CalenderDays color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2 ">{data.saData?.age ? data.saData?.age: 'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Blood Group</h3>
                            <div className="flex">
                                <BloodGroupIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.bloodGroup ?data.saData?.bloodGroup:'N/A' }</p>

                            </div>

                        </div>

                    </div>
                    <div className="col-span-12 md:col-span-4 my-2">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-60">
                            <h1 className="text-sm font-semibold my-2">Contact Information</h1>
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Address</h3>
                            <div className="flex">
                                <LocationIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.address?.street1 ?data.saData?.address?.street1:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone</h3>
                            <div className="flex">
                                <PhoneIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.user?.phoneNo ? data.saData?.user?.phoneNo:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]"> Email Address</h3>
                            <div className="flex">
                                <EmailIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.personalEmail ? data.saData?.personalEmail:'N/A'}</p>

                            </div>
                        </div>

                    </div>

                    <div className="col-span-12 md:col-span-5 my-2">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-60">
                            <h1 className="text-sm font-semibold my-2">Identification and Employment Details</h1>
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Adhar Number</h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{data.saData?.adhaarNo ? data.saData?.adhaarNo:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Pan Number</h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{data.saData?.panNo ?data.saData?.panNo :'N/A' }</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Date Of Joining</h3>

                            <div className="flex">
                                <CalenderDays color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2 ">{data.saData?.dateOfJoining? new Date(data.saData.dateOfJoining).toLocaleDateString() : 'N/A'}</p>

                            </div>
                        </div>

                    </div>


                </div>

                <div className="grid grid-cols-12 gap-2">
                    {/* Table Section */}
                    <div className="col-span-12 md:col-span-7 my-2">
                        <div className="p-4  mx-1 bg-[#F3EEE7] h-[342px]">
                            <h1 className="text-sm font-semibold my-2">Bank Information</h1>
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Name</h3>
                            <div className="flex">
                                <BankIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.bankDetails?.bankName ? data.saData?.bankDetails?.bankName:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Branch</h3>
                            <div className="flex">
                                <BankIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.bankDetails?.bankBranch?data.saData?.bankDetails?.bankBranch:'N/A'}</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Bank Account number</h3>
                            <div className="flex">
                                <PhoneIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.bankDetails?.bankAccountNo?data.saData?.bankDetails?.bankAccountNo:'N/A'}</p>

                            </div>

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">IFSC Code</h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{data.saData?.bankDetails?.ifscCode?data.saData?.bankDetails?.ifscCode:'N/A'}</p>

                            </div>

                        </div>

                    </div>
                    <div className="col-span-12 md:col-span-5 my-1">
                        <div className="p-4 mx-1 bg-[#F3EEE7] h-[342px]">
                            <h1 className="text-sm font-semibold my-2">Company Information</h1>
                            {/* <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company Id</h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">PKLK2827</p>

                            </div> */}

                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]" >Work Mail</h3>
                            <div className="flex">
                                <EmailIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.workEmail?data.saData?.workEmail:'N/A'}</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]"> Work Phone</h3>
                            <div className="flex">
                                <PhoneIcon size={20} />
                                <p className="text-sm font-semibold ms-2">{data.saData?.workPhone?data.saData?.workPhone:'N/A'}</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Role </h3>
                            <div className="flex">
                                <UserIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">Support Agent</p>

                            </div>
                            <hr />
                            <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Region</h3>

                            <div className="flex">
                                <RegionIcon color="#4B5C79" />
                                <p className="text-sm font-semibold ms-2">{data.saData?.region?.regionCode?data.saData?.region?.regionCode:'N/A'}</p>

                            </div>
                        </div>

                    </div>




                </div>


            </div>
        </div>
    )
}

export default SAViewForm