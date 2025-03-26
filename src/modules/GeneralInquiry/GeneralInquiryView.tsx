import { useEffect, useState } from "react"
import useApi from "../../Hooks/useApi"
import { useParams } from "react-router-dom"
import { endPoints } from "../../services/apiEndpoints"
import UserIcon from "../../assets/icons/UserIcon"
import EmailIcon from "../../assets/icons/EmailIcon"
import PhoneIcon from "../../assets/icons/PhoneIcon"
import CompanyIcon from "../../assets/icons/CompanyIcon"

type Props = {
    onClose: () => void;
}

const GeneralInquiryView = ({onClose}: Props) => {

    const {request:getAContact}=useApi('get',3001)
    const [getAData, setGetAData]=useState([])
    const {id}=useParams()
    const handleGetOne = async()=>{
        try{
            const {response,error}=await getAContact(`${endPoints.GENERAL_INQUIRY}/${id}`)
            console.log('res',response);
            console.log('err',error);
            console.log('id',id);
            
            if(response&& !error){
                console.log(response.data);
                // setGetAData(response.data.contacts)
            }
            else{
                console.log(error.respone.data.message);
                
            }
        }
        catch(err){
            console.log('error occured',err);
            
        }
    }
    useEffect(()=>{
        handleGetOne()
    },[])
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
    <div className="col-span-5">
    <div className="p-4 bg-[#F3EEE7] my-4">
      <h1 className="text-sm font-semibold text-[#303F58] my-2">Basic Details</h1>
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">First Name</h3>
      <div className="flex">
        <UserIcon color="#4B5C79" />
        <p className="text-sm font-semibold ms-2">Lesslie Alexander</p>
      </div>

      <hr className="my-4 border border-[#C3CAD5]" />
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Last Name</h3>
      <div className="flex">
        <UserIcon color="#4B5C79" />
        <p className="text-sm font-semibold ms-2 ">Vinod</p>
      </div>

      <hr className="my-4 border border-[#C3CAD5]" />
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Email</h3>
      <div className="flex">
        <EmailIcon size={20} />
        <p className="text-sm font-semibold ms-2">Lesslie@gmail.com</p>
      </div>
      <hr className="my-4 border border-[#C3CAD5]" />
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Phone Number</h3>
      <div className="flex">
        <PhoneIcon size={20} />
        <p className="text-sm font-semibold ms-2">9887678798</p>
      </div>
      <hr className="my-4 border border-[#C3CAD5]" />
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company</h3>
      <div className="flex">
        <CompanyIcon size={20} />
        <p className="text-sm font-semibold ms-2">Lesslie@gmail.com</p>
      </div>
      <hr className="my-4 border border-[#C3CAD5]" />
      <h3 className="text-xs font-semibold my-2 text-[#8F99A9]">Company Address</h3>
      <div className="flex">
        <CompanyIcon size={20} />
        <p className="text-sm font-semibold ms-2">1901 Thornridge Cir. Shiloh, Hawaii 81063</p>
      </div>
    </div>
    </div>
    <div className="col-span-7">
        <div className="bg-[#F2F4EB] p-4 rounded-lg my-4">
        <p className="my-2 text-sm font-semibold text-[#303F58]">Contact Information</p>
        <div>
            <p className="text-[#4B5C79] text-xs font-semibold">Subject</p>
            <p className="my-4 text-sm font-semibold text-[#303F58]">General Inquiry</p>
        </div>
        <hr className="my-2 border border-[#C3CAD5]" />
        <div className="my-3">
            <p className="text-[#4B5C79] text-xs font-semibold">Message</p>
            <p className="text-[#303F58] text-xs font-normal">Hello! I'm interested in learning more about your ERP software. Could you provide some details on its features and how it can benefit my business?</p>
        </div>
        </div>

        <div className="mt-4">
            <p className="text-[#303F58] text-xs font-normal">Inquiry From</p>
            <div className="bg-[#F5F5F5] rounded-md px-2 py-1 mt-2">
               <p className="text-[#0B1320] text-sm font-semibold">BillBizz</p>
            </div>
        </div>
    </div>
  </div>
</div>
    </div>
  )
}

export default GeneralInquiryView