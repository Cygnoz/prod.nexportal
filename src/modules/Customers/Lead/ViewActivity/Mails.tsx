import { useEffect, useState } from "react";
import EmailIcon from "../../../../assets/icons/EmailIcon";
import Button from "../../../../components/ui/Button";
import profileImage from "../../../../assets/image/AvatarImg.png";
import Modal from "../../../../components/modal/Modal";
import MailsForm from "../ViewModals/MailsForm";
import SearchBar from "../../../../components/ui/SearchBar";
import useApi from "../../../../Hooks/useApi";
import { useParams } from "react-router-dom";
import { endPoints } from "../../../../services/apiEndpoints";
import NoRecords from "../../../../components/ui/NoRecords";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import DOMPurify from "dompurify"; 

type Props = {
  leadData: any;
};

const Mails = ({ leadData }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [mailData, setMailData] = useState<any[]>([]);
  const [expandedMailId, setExpandedMailId] = useState<any>(null); 

  const { request: getLeadMail } = useApi("get", 3001);
  const { id } = useParams();

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    getMail();
  };

  const getMail = async () => {
    try {
      const { response, error } = await getLeadMail(
        `${endPoints.GET_ALL_LEAD_ACTIVITIES}/${id}`
      );

      if (response && !error) {
        
        const taskActivities = response.data.activities.filter(
          (activity: any) => activity?.activityType === "Mail"
        );
       // console.log(taskActivities);

        setMailData(taskActivities.reverse());
      } else {
        console.log(error.response.data.message);
      }
    } catch (err) {
      console.log(err, "error message");
    }
  };

  useEffect(() => {
    getMail();
  }, []);

  const filteredMails = mailData?.filter((mail) =>
    mail.emailSubject?.toLowerCase().includes(searchValue.toLowerCase()) ||
    mail.emailFrom?.toLowerCase().includes(searchValue.toLowerCase()) ||
    leadData?.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    leadData?.lastName?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleExpandMail = (index:any) => {
    // Toggle expand/collapse based on index
    setExpandedMailId((prevIndex:any) => (prevIndex === index ? null : index));
  };
  return (
    <div>
 <div className="w-full h-fit rounded-lg p-5 gap-5 bg-[#FFFFFF]">
  <div className="flex flex-col md:flex-row justify-between gap-4">
    <div className="flex gap-6">
      <p className="text-[#303F58] text-sm font-bold p-2">Mails</p>
      <SearchBar
        placeholder="Search"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
    </div>

    <Button
      onClick={handleModalToggle}
      className="text-[#565148] text-base rounded-lg w-full sm:w-24 h-9 bg-[#FEFDFA] border-[#565148]"
      variant="secondary"
    >
      +<span className="text-xs">New Mail</span>
    </Button>
  </div>

  {filteredMails.length > 0 ? (
    filteredMails.map((mails, index) => (
      <div className="bg-[#FAFAFA] w-full h-fit rounded-xl my-5" key={mails.id || mails.emailSubject}>
        <div className="flex flex-col md:flex-row justify-between p-5">
          <div className="flex gap-3">
            <div className="bg-[#F3E6E6] rounded-full size-8 px-2 py-2">
              <EmailIcon color="#820000" size={18} />
            </div>
            <p className="mt-2 text-[#303F58] text-xs font-semibold">
              {mails?.emailSubject || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[#4B5C79] text-xs font-semibold mt-2">
              {new Date(mails?.updatedAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>

        <hr className="text-[#BBB6B6]" />

        <div className="flex flex-col md:flex-row justify-between p-5">
          <div className="flex gap-4 ms-2">
            <div className="flex gap-2">
              <p className="text-[#4B5C79] text-xs font-normal">From:</p>
              <div className="rounded-full w-5 h-5 overflow-hidden">
                <img src={profileImage} alt="" />
              </div>
              <p className="mt-[1%] text-[#303F58] text-xs font-semibold">
                {mails?.emailFrom || 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="text-[#4B5C79] text-xs font-normal">To:</p>
              <div className="rounded-full w-5 h-5 overflow-hidden">
                <img src={profileImage} alt="" />
              </div>
              <p className="mt-[1%] text-[#303F58] text-xs font-semibold">
                {leadData?.firstName} {leadData?.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleExpandMail(index)}
            className="focus:outline-none"
          >
            <ChevronDown
              size={20}
              color={expandedMailId === index ? "#303F58" : "#768296"}
            />
          </button>
        </div>

        {/* Expanded Email Content */}
        {expandedMailId === index && (
          <div
            className="p-5 bg-[#F9F9F9] rounded-lg text-[#4B5C79] text-sm"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(mails?.emailMessage || "N/A"),
            }}
          ></div>
        )}
      </div>
    ))
  ) : (
    <NoRecords text="No Mail Found" parentHeight="200px" imgSize={90} textSize="md" />
  )}
</div>


    <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen} onClose={handleModalToggle}>
      <MailsForm leadData={leadData} onClose={handleModalToggle} />
    </Modal>
  </div>
);
};

export default Mails;