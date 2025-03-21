

import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import 'quill-emoji';
import ReactDOMServer from 'react-dom/server';
import BoldIcon from '../../../../assets/icons/BoldIcon';
import ItalicIcon from '../../../../assets/icons/ItalicIcon';
import UnderlineIcon from '../../../../assets/icons/UnderlineIcon';
import LinkIcon from '../../../../assets/icons/LinkIcon';
import EmojiIcon from '../../../../assets/icons/EmojiIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/form/Input';
import StrikeThroughIcon from '../../../../assets/icons/StrikeThroughIcon';
import NumberListIcon from '../../../../assets/icons/NumberListIcon';
import BulletListIcon from '../../../../assets/icons/BulletListIcon';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useParams } from 'react-router-dom';
import { LeadNoteData } from '../../../../Interfaces/LeadNote';
import { SubmitHandler, useForm } from 'react-hook-form';
import useApi from '../../../../Hooks/useApi';
import { endPoints } from '../../../../services/apiEndpoints';
import toast from 'react-hot-toast';
import { useResponse } from '../../../../context/ResponseContext';
import 'quill-emoji/dist/quill-emoji.css';
import 'quill-emoji'; 
type Props = {
  onClose: () => void;
  editId?: any;
}


const validationSchema = Yup.object().shape({
  activityType: Yup.string(), // Ensure it's validated as "Meeting".
  leadId: Yup.string(),
  relatedTo: Yup.string().required("Related To is required"),
  noteMembers: Yup.string(),
  note: Yup.string().required("Note is required"),
});

const NotesForm = ({ onClose, editId }: Props) => {
  const [quillValue, setQuillValue] = useState<any>();
  const { request: addLeadNote } = useApi('post', 3001)
  const { request: getLeadNote } = useApi("get", 3001);
  const { request: editLeadNote } = useApi("put", 3001);

const {setPostLoading}=useResponse()
  const { id } = useParams()
  console.log(id);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    watch,
  } = useForm<LeadNoteData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      activityType: "Note",
      leadId: id
    }
  });

  console.log(errors);



  const icons = Quill.import('ui/icons');
  const OrderedListIconHTML = ReactDOMServer.renderToStaticMarkup(<NumberListIcon color='#4B5C79' />);
  const BulletListIconHTML = ReactDOMServer.renderToStaticMarkup(<BulletListIcon color='#4B5C79' />);
  const boldIconHTML = ReactDOMServer.renderToStaticMarkup(<BoldIcon size={12} color='#4B5C79' />);
  const ItalicIconHTML = ReactDOMServer.renderToStaticMarkup(<ItalicIcon color='#4B5C79' />);
  const UnderlineIconHTML = ReactDOMServer.renderToStaticMarkup(<UnderlineIcon color='#4B5C79' />);
  const StrikeIconHTML = ReactDOMServer.renderToStaticMarkup(<StrikeThroughIcon color='#4B5C79' />);
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



  const modules = {
    toolbar: [
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Add ordered and bullet lists
      ['bold', 'italic', 'underline', 'strike'],
      ['link'],
      [{ 'emoji': true }],
    ],
    'emoji-toolbar': true,
    'emoji-textarea': false,
    'emoji-shortname': true,
  };

  const setFormValues = (data: LeadNoteData) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof LeadNoteData, data[key as keyof LeadNoteData]);
    });

    // Set Quill value when editing
    if (data.note) {
      setQuillValue(data.note);
    }
  };

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const { response, error } = await getLeadNote(`${endPoints.LEAD_ACTIVITY}/${editId}`);
          if (response && !error) {
            console.log(response.data.activity);

            setFormValues(response.data.activity);
          } else {
            console.log(error.response.data.message);
          }
        } catch (err) {
          console.error("Error fetching notes data:", err);
        }
      })();
    }
  }, [editId]);

  //console.log("dd",watch());


  const onSubmit: SubmitHandler<LeadNoteData> = async (data: any, event) => {
    event?.preventDefault(); // Prevent default form submission behavior
    console.log("Data", data);
    try {
      setPostLoading(true)
      const apiCall = editId ? editLeadNote : addLeadNote;
      const { response, error } = await apiCall(editId ? `${endPoints.LEAD_ACTIVITY}/${editId}` : endPoints.LEAD_ACTIVITY, data);
      if (response && !error) {
        console.log(response.data);
        toast.success(response.data.message)
        onClose();
      } else {
        console.log(error.data.message);

      }
    } catch (err) {
      console.error("Error submitting lead note data:", err);
      toast.error("An unexpected error occurred."); // Handle unexpected errors
    }
    finally{
      setPostLoading(false)
    }
  };


  useEffect(() => {
    if (quillValue !== undefined) {
      setValue("note", quillValue);
    }
  }, [quillValue, setValue]);

  console.log("darssss", errors);


  return (
    <div>
      <div className='p-4'>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold text-deepStateBlue ">
              {editId ? "Edit" : "Add"} Note
            </h1>
          </div>
          <div>
            <p onClick={onClose} className="text-3xl cursor-pointer">&times;</p>
          </div>

        </div>
        <form className='my-4' >
          <div className="flex gap-2 w-full"  >
            <p className='text-[#4B5C79] text-sm font-normal -mt-1'>Related to: </p>

            <Input
              {...register("relatedTo")}
              value={watch("relatedTo")}
              placeholder='Anjela John'
              type="text"
              className="w-full flex text-[#303F58] text-xs font-semibold outline-none items-center"
            />
            {errors.relatedTo && (
              <p className="text-red-500 text-xs mt-1">{errors.relatedTo.message}</p>
            )}

          </div>
          <div className='w-full h-[400px] my-4'>
            <ReactQuill
              value={quillValue || watch("note") || ""}
              onChange={setQuillValue}
              placeholder="Start typing. @mention people to notify them"
              className="quill-editor h-[300px] text-[#4B5C79] text-sm font-normal outline-none"
              theme="snow"
              modules={modules}
            />
            {errors.note && (
              <p className="text-red-500 text-xs mt-1">{errors.note.message}</p>
            )}

          </div>
          <div className='mt-1 flex justify-end'>
            <Button onClick={handleSubmit(onSubmit)} type="submit" className='w-16 h-9 ms-2' variant='primary' size='sm'>Done</Button>
          </div>
        </form>



      </div>

    </div>
  )
}

export default NotesForm