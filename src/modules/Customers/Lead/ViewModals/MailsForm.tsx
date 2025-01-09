import ReactQuill from "react-quill";
import ExternalLinkIcon from "../../../../assets/icons/ExternalLinkIcon";
import BoldIcon from "../../../../assets/icons/BoldIcon";
import ItalicIcon from "../../../../assets/icons/ItalicIcon";
import UnderlineIcon from "../../../../assets/icons/UnderlineIcon";
import LinkIcon from "../../../../assets/icons/LinkIcon";
import EmojiIcon from "../../../../assets/icons/EmojiIcon";
import { useState } from "react";
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


type Props = {
  onClose: () => void;
}

const validationSchema = Yup.object({
  activityType: Yup.string().required("Type is required"),
});

const MailsForm = ({ onClose }: Props) => {

    const {
      handleSubmit,
      register,
      // clearErrors,
    } = useForm<LeadEmailData>({
      resolver: yupResolver(validationSchema),
    });
  

  const Emoji = Quill.import('formats/emoji');
  Quill.register('modules/emoji', Emoji);
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

  const [value, setValue] = useState('');
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

  const onSubmit: SubmitHandler<LeadEmailData> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    console.log("Data", data);
    try {
      const {response , error} = await addLeadMail(endPoints.LEAD_ACTIVITY)
      console.log(response);
      console.log(error);
            
      if (response && !error) {
        console.log(response.data);
        
      } else {
        console.log(error.data.message);
        
      }
    } catch (err) {
      console.error("Error submitting lead mail data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
  };

  // const handleInputChange = (field: keyof LeadEmailData) => {
  //   clearErrors(field); // Clear the error for the specific field when the user starts typing
  // };


  return (
    <div>
      <div className="rounded-2xl">
        <div className="flex w-full justify-between bg-[#71736B] rounded-t-lg">
          <div className="space-y-2 p-4">
            <h3 className="text-[#FFFEFB] font-bold text-sm">Create Mails</h3>
          </div>
          <div className="flex gap-2 p-4">
            <div className="mt-1 cursor-pointer">
              <ExternalLinkIcon size={20} />
            </div>
            <div>
              <p onClick={onClose} className="text-2xl text-[#FFFEFB] cursor-pointer">&times;</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="mt-3 text-[#303F58] text-xs font-semibold ms-2">To</p>
          <Input 
            placeholder='Anjela John (anjela@gmail.com)'
            type="email"
            {...register("emailTo")}
            className="w-60 h-10 bg-[#EAEEF5] rounded-[50px] flex p-2 text-[#303F58] text-xs font-semibold text-center"
            />

          {/* <div className="w-60 h-10 bg-[#EAEEF5] rounded-[50px] flex p-2">
            <div className="rounded-full w-6 h-6 overflow-hidden ms-1 mt-[1%]">
              <img src={image} alt="" />
            </div>
            <p className="text-[#303F58] text-xs font-semibold mt-1">Anjela John (anjela@gmail.com)</p>

          </div> */}
        </div>
        <p className="text-end px-6 -mt-11">Cc <span className="ms-2">Bcc</span></p>


        {/* <p className="text-[#303F58] text-sm font-semibold p-4 ms-2 mt-2">Your Subject Title</p> */}
        <Input
        {...register("emailSubject")}
        placeholder="Your Subject Title"
        type="text"
        className="text-[#303F58] text-sm font-semibold outline-none w-[493px] px-4 mt-6"
        />

        <hr className="my-2" />

 
        <div className='w-full h-[300px] px-6 mt-6'>
          <ReactQuill
            value={value}
            onChange={setValue}
            placeholder="Write here your message..."
            className="quill-editor h-[250px]  text-[#4B5C79] text-sm font-normal"
            theme="snow"
            // {...register('emailText')}
            // onChange={() => handleInputChange("emailText")}
            modules={modules}
          />
        </div>

        <div className='m-5 flex justify-end'>
          <Button className="w-16 h-9" variant='primary' type="submit" size='sm'>Done</Button>
        </div>


      </div>
    </div>
  )
}

export default MailsForm