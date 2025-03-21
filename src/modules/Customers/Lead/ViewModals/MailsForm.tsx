import ReactQuill from "react-quill";
import ExternalLinkIcon from "../../../../assets/icons/ExternalLinkIcon";
import BoldIcon from "../../../../assets/icons/BoldIcon";
import ItalicIcon from "../../../../assets/icons/ItalicIcon";
import UnderlineIcon from "../../../../assets/icons/UnderlineIcon";
import LinkIcon from "../../../../assets/icons/LinkIcon";
import EmojiIcon from "../../../../assets/icons/EmojiIcon";
import { useEffect, useState } from "react";
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import 'quill-emoji';
import ReactDOMServer from 'react-dom/server';
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/form/Input";
import NumberListIcon from "../../../../assets/icons/NumberListIcon";
import BulletListIcon from "../../../../assets/icons/BulletListIcon";
import StrikeThroughIcon from "../../../../assets/icons/StrikeThroughIcon";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LeadEmailData } from "../../../../Interfaces/LeadEmail";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import { useParams } from "react-router-dom";
import UserIcon from "../../../../assets/icons/UserIcon";
import { useUser } from "../../../../context/UserContext";
import { useResponse } from "../../../../context/ResponseContext";
import 'quill-emoji/dist/quill-emoji.css';
import 'quill-emoji'; // This automatically registers it, no need to manually register.


type Props = {
  onClose: () => void;
  leadData:any;
}

const validationSchema = Yup.object().shape({
    activityType: Yup.string(), // Ensure it's validated as "Meeting".
    leadId: Yup.string(),
    emailTo: Yup.string(),
    emailFrom: Yup.string(),
    emailSubject: Yup.string().required("Email subject is required"),
    emailFile: Yup.string(),
    emailMessage: Yup.string(),
});

const MailsForm = ({ onClose , leadData}: Props) => {

      const { id } = useParams()
      //console.log(id);
      const {user} =useUser()
    //  console.log(user);
       const {setPostLoading}=useResponse()
    const {
      handleSubmit,
      register,
      setValue,
      formState: { errors },
      watch,
  } = useForm<LeadEmailData>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        activityType: "email",
        leadId: id,
        emailFrom:user?.userName
    }
    });
  
    console.log(errors);
        
  const icons = Quill.import('ui/icons');

  const OrderedListIconHTML = ReactDOMServer.renderToStaticMarkup(<NumberListIcon color='#4B5C79' />);
  const BulletListIconHTML = ReactDOMServer.renderToStaticMarkup(<BulletListIcon color='#4B5C79' />);
  const boldIconHTML = ReactDOMServer.renderToStaticMarkup(<BoldIcon size={12} color='#4B5C79' />);
  const ItalicIconHTML = ReactDOMServer.renderToStaticMarkup(<ItalicIcon color='#4B5C79' />);
  const UnderlineIconHTML = ReactDOMServer.renderToStaticMarkup(<UnderlineIcon color='#4B5C79' />);
  const StrikeIconHTML = ReactDOMServer.renderToStaticMarkup( <StrikeThroughIcon color='#4B5C79' /> );
  const LinkIconHTML = ReactDOMServer.renderToStaticMarkup(<LinkIcon color='#4B5C79' />);
  const EmojiIconHTML = ReactDOMServer.renderToStaticMarkup(<EmojiIcon color='#4B5C79' />);

  icons['list-ordered'] = OrderedListIconHTML;
  icons['list-bullet'] = BulletListIconHTML;
  icons['bold'] = boldIconHTML;
  icons['italic'] = ItalicIconHTML;
  icons['underline'] = UnderlineIconHTML;
  icons['strike'] = StrikeIconHTML;
  icons['link'] = LinkIconHTML;
  icons['emoji'] = EmojiIconHTML;

  const [quillValue, setQuillValue] = useState<any>();
  const {request: addLeadMail}=useApi('post',3001)

  const modules = {
    toolbar: [
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Add ordered and bullet lists
      ['bold', 'italic', 'underline', 'strike'],
      ['link',],
      [{ 'emoji': true }],
    ],
    'emoji-toolbar': true,
    'emoji-textarea': false,
    'emoji-shortname': true,
  };

  const onSubmit: SubmitHandler<LeadEmailData> = async (data,event) => {
    event?.preventDefault()
    console.log("Data", data);
    try {
      setPostLoading(true)
      const {response , error} = await addLeadMail(endPoints.LEAD_ACTIVITY, data)
      console.log(response);
      console.log(error);
            
      if (response && !error) {
        console.log(response.data);
        toast.success(response.data.message)
        onClose()
        
      } else {
        console.log(error.respone.data.message);
        toast.error(error.respone.data.message)
        
      }
    } catch (err) {
      console.error("Error submitting lead mail data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
    finally{
      setPostLoading(false)
    }
  };

console.log(quillValue);

useEffect(() => {
  if (quillValue !== undefined) {
    setValue("emailMessage", quillValue);
  }
}, [quillValue, setValue]);

console.log("er",watch());



  return (
    <div>
     <div className="w-full  mx-auto rounded-2xl">
  <div className="flex flex-col md:flex-row justify-between items-center bg-[#71736B] rounded-t-lg">
    <div className="space-y-2 p-4">
      <h3 className="text-[#FFFEFB] font-bold text-sm">Create Mails</h3>
    </div>
    <div className="flex items-center gap-2 p-4">
      <div className="mt-1 cursor-pointer">
        <ExternalLinkIcon size={20} />
      </div>
      <div>
        <p onClick={onClose} className="text-2xl text-[#FFFEFB] cursor-pointer">&times;</p>
      </div>
    </div>
  </div>

  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <p className="mt-3 text-[#303F58] text-xs font-semibold ms-2">To</p>
      <div className="w-full sm:w-60 h-10 bg-[#EAEEF5] rounded-[50px] flex items-center p-2">
        <div className="rounded-full w-6 h-6 overflow-hidden mx-1 mt-[1%]">
          {leadData?.image ? (
            <img
              src={leadData?.image} // Replace with the actual image URL
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="w-6 h-6 bg-black rounded-full flex justify-center items-center">
              <UserIcon color="white" size={16} />
            </p>
          )}
        </div>
        <p className="text-black text-xs font-semibold">{leadData?.email}</p>
      </div>
    </div>

    <p className="text-end px-6 -mt-11">Cc <span className="ms-2">Bcc</span></p>

    <Input
      {...register("emailSubject")}
      value={watch("emailSubject")}
      placeholder="Your Subject Title"
      type="text"
      className="text-[#303F58] text-sm font-semibold outline-none w-full sm:w-[493px] px-4 mt-6"
    />
    {errors.emailSubject && (
      <p className="text-red-500 text-xs mt-1">{errors.emailSubject.message}</p>
    )}

    <hr className="my-2" />

    <div className="w-full h-[300px] px-6 mt-6">
      <ReactQuill
        value={quillValue}
        onChange={setQuillValue}
        placeholder="Write here your message..."
        className="quill-editor h-[250px] text-[#4B5C79] text-sm font-normal"
        theme="snow"
        modules={modules}
      />
    </div>

    <div className="flex m-5 justify-end cursor-pointer">
      <Button className="w-16 h-9 cursor-pointer" variant="primary" type="submit" size="sm">Done</Button>
    </div>
  </form>
</div>

    </div>
  )
}

export default MailsForm