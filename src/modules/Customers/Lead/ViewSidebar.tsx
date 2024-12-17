import { useState } from "react"
import CalenderRound from "../../../assets/icons/CalenderRound"
import DeltaTech from "../../../assets/icons/DeltaTech"
import EditIcon from "../../../assets/icons/EditIcon"
import EmailIcon from "../../../assets/icons/EmailIcon"
import EmailRoundIcon from "../../../assets/icons/EmailRoundIcon"
import PhoneRingIcon from "../../../assets/icons/PhoneRingIcon"
import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon"
import profileImage from '../../../assets/image/AvatarImg.png'
import BackgroundImage from '../../../assets/image/LeadView.jpg'
import Modal from "../../../components/modal/Modal"
// import LeadViewInfo from "./View/LeadViewInfo"
import UserIcon from "../../../assets/icons/UserIcon"
import ConvertModal from "../../../components/modal/ConvertionModal/CovertLicenser"
import LeadForm from "./LeadForm"
import LeadViewInfo from "./ViewModals/LeadViewInfo"
import DeActivateIcon from "../../../assets/icons/DeActivateIcon"

type Props = {
  leadData:any
  getLead:()=>void
}

const ViewSidebar = ({ leadData,getLead}: Props) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState({
    editLead:false,
    viewLead:false
  });
  const [convLicModalOpen, setConvLicModalOpen] = useState(false);


  const handleModalToggle = (editLead=false, viewLead=false) => {
    
    setIsModalOpen((prevState:any )=> ({
        ...prevState,
        editLead: editLead,
        viewLead: viewLead
    }));
    getLead()
}



  const covertModalToggle = () => {
    setConvLicModalOpen((prev) => !prev);
  }
 
  const getStatusClass = (status: string | undefined) => {
      switch (status) {
        case "New":
          return "bg-blue-500 text-white py-1 px-2 w-fit rounded-full";
        case "Contacted":
          return "bg-cyan-800 text-white py-1 px-2 rounded-full";
        case "In progress":
          return "bg-yellow-100 text-black py-1 px-2 rounded-full";
        case "Proposal":
          return "bg-violet-300 text-black py-1 px-2 rounded-full";
        case "Lost":
          return "bg-red-500 text-white py-1 px-2 rounded-full";
        case "Won":
          return "bg-green-500 text-white  py-1 px-2 w-fit rounded-full";
    default:
          return "";
      }
    };

  return (
    <div>
      <div className="h-fit w-fit bg-cover rounded-xl p-6" style={{ backgroundImage: `url(${BackgroundImage})` }}>
       
        <div className={`${getStatusClass(leadData?.leadStatus)}  flex items-center gap-2  w-fit ms-auto `}>
        <div className={`w-2 h-2 -mt-[2px] ${leadData?.leadStatus=='In progress' ||leadData?.leadStatus=='Proposal'?'bg-black':'bg-white'} rounded-full`}></div>
         <p className="text-sm">{leadData?.leadStatus}</p>
        </div>
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            {leadData?.image?<img
              src={leadData?.image} // Replace with the actual image URL
              alt="Profile"
              className="w-full h-full object-cover"
            />:
            <p className="w-full h-full    bg-black rounded-full flex justify-center items-center">
                <UserIcon color="white" size={35} />
          </p>
            }
          </div>
          <div className="mb-3 mt-3">
            <p className="text-[#FFFFFF] text-xs font-semibold mb-3">{leadData?.firstName}{leadData?.lastName&&leadData?.lastName}</p>
            <p className="text-[#FFFFFF] text-xs font-normal">Lead ID <span className="text-xs font-bold ms-3">LD-001</span></p>
          </div>
        </div>

        <div className="flex gap-4 my-4 ms-4">
          <EmailIcon color="#FFFFFF" size={16} />
          <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.email}</p>
        </div>
        <div className="flex gap-4 mb-2 ms-4">
          <PhoneRingIcon color="#FFFFFF" size={16} />
          <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.phone}</p>
        </div>
        <div className="flex gap-4 mb-2 ms-4">
          <DeltaTech size={16} />
          <p className="text-[#FFFFFF] text-xs font-normal">{leadData?.companyName?leadData.companyName:'N/A'}</p>
        </div>
        <div className="flex gap-4 ms-4 my-4">
          <p className="text-[#FFFFFF] text-xs font-normal">Region</p>
          <p className="text-[#FFFFFF] text-xs font-bold">{leadData?.regionDetails.regionName?leadData?.regionDetails.regionName:'N/A'}</p>
        </div>
        <div className="flex gap-4 mb-4 ms-4">
          <p className="text-[#FFFFFF] text-xs font-normal">Area</p>
          <p className="text-[#FFFFFF] text-xs font-bold ms-3">{leadData?.areaDetails.areaName?leadData?.areaDetails.areaName:'N/A'}</p>
        </div>

        <div className="flex w-60 h-20 px-6 py-4 gap-5 rounded-xl bg-[#FFFFFF33] mx-4">

          <div>
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <EmailRoundIcon size={18} color="#F0D5A0" />
                   </div>
                    </div>
                 
            <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">Email</p>
          </div>
          <div className="cursor-pointer" onClick={()=>handleModalToggle(true,false)} >
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <EditIcon size={18} color="#F0D5A0" />
                   </div>
                    </div>
            <p className="text-[#FFF9F9] text-[10px] font-medium mt-1 ms-2">Edit</p>
          </div>
          <div onClick={()=>handleModalToggle(false,true)}>
            <div className="cursor-pointer">            
            <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <ViewRoundIcon size={18} color="#B6D6FF" />
                   </div>
                    </div>
            </div>
            <p className="text-[#FFF9F9] text-[10px] font-medium ms-1 mt-1">View</p>
          </div>
          <div className="cursor-pointer">
          <div className="rounded-full bg-[#C4A25D4D] h-9 w-9 border border-white">
                   <div className="ms-2 mt-2">
                   <DeActivateIcon size={18} color="#D52B1E4D" />
                   </div>
                    </div>
            <p className="text-[#FFF9F9] text-[10px] font-medium mt-1">Delete</p>
          </div>

        </div>
        <div className="flex gap-2 rounded-xl bg-[#FFFFFF33] w-60 py-3 px-2 h-14 my-4 mx-4">
          <div className="px-2 ms-6"><CalenderRound size={32} /></div>
          <p className="mt-2 text-[#FFFFFF] text-xs font-medium">View Calender</p>
        </div>
        {leadData?.leadStatus==='Won'&&<div className="rounded-lg w-60 bg-[#820000] h-12 py-3 px-3 mb-4 mx-4" onClick={covertModalToggle} >
          <p className="text-center text-[#FEFDF9] text-base font-medium">Converted to Trail</p>
        </div>}
        <hr />
        <div className="p-4">
          <p className="text-[#FFFFFF] text-xs font-normal mb-2">Assigned BDA</p>
          <div className="flex gap-2">
            <div className="rounded-full w-7 h-7 overflow-hidden">
              <img src={profileImage} alt="" />
            </div>
            <p className="text-[#FFFFFF] text-xs font-bold py-2 px-1">{leadData?.bdaDetails?.bdaName?leadData?.bdaDetails?.bdaName:'N/A'}</p>
          </div>
        </div>

      </div>
      {/* Graph */}
      <div>Graph</div>

      {/* Modal controlled by state */}
      
      <Modal open={isModalOpen.viewLead} onClose={()=>handleModalToggle()} className="w-[35%]">
        <LeadViewInfo leadData={leadData} onClose={()=>handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.editLead} onClose={()=>handleModalToggle()} className="w-[50%]">
        <LeadForm editId={leadData?._id} onClose={()=>handleModalToggle()} />
      </Modal>

      <Modal open={convLicModalOpen} align="center" onClose={covertModalToggle} className="w-[30%]">
        <ConvertModal onClose={covertModalToggle} type="lead" />
      </Modal>

    </div>
  )
}

export default ViewSidebar