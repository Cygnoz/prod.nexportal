
import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
import 'quill/dist/quill.snow.css';
import NumberListIcon from '../../../assets/icons/NumberListIcon';
import BulletListIcon from '../../../assets/icons/BulletListIcon';
import BoldIcon from '../../../assets/icons/BoldIcon';
import ItalicIcon from '../../../assets/icons/ItalicIcon';
import UnderlineIcon from '../../../assets/icons/UnderlineIcon';
import StrikeThroughIcon from '../../../assets/icons/StrikeThroughIcon';
import EmojiIcon from '../../../assets/icons/EmojiIcon';
import useApi from '../../../Hooks/useApi';
import { EventFormData, Post } from '../../../Interfaces/CMS';
import { endPoints } from '../../../services/apiEndpoints';
import Button from '../../../components/ui/Button';
import Chevronleft from '../../../assets/icons/Chevronleft';
import MenueDotsIcon from '../../../assets/icons/MenueDotsIcon';
import Input from '../../../components/form/Input';
import { useResponse } from '../../../context/ResponseContext';

type Props = {};

function CreateEvent({ }: Props) {

    const { id } = useParams()

    const icons = Quill.import('ui/icons');

    const OrderedListIconHTML = ReactDOMServer.renderToStaticMarkup(<NumberListIcon color='#4B5C79' />);
    const BulletListIconHTML = ReactDOMServer.renderToStaticMarkup(<BulletListIcon color='#4B5C79' />);
    const boldIconHTML = ReactDOMServer.renderToStaticMarkup(<BoldIcon size={12} color='#4B5C79' />);
    const ItalicIconHTML = ReactDOMServer.renderToStaticMarkup(<ItalicIcon color='#4B5C79' />);
    const UnderlineIconHTML = ReactDOMServer.renderToStaticMarkup(<UnderlineIcon color='#4B5C79' />);
    const StrikeIconHTML = ReactDOMServer.renderToStaticMarkup(<StrikeThroughIcon color='#4B5C79' />);
    const EmojiIconHTML = ReactDOMServer.renderToStaticMarkup(<EmojiIcon color='#4B5C79' />);

    icons['list-ordered'] = OrderedListIconHTML;
    icons['list-bullet'] = BulletListIconHTML;
    icons['bold'] = boldIconHTML;
    icons['italic'] = ItalicIconHTML;
    icons['underline'] = UnderlineIconHTML;
    icons['strike'] = StrikeIconHTML;
    icons['emoji'] = EmojiIconHTML;

    const [quillValue, setQuillValue] = useState('');

    const { request: addPost } = useApi('post', 3001)
    const { request: getAPost } = useApi('get', 3001)
    const { request: editPost } = useApi('put', 3001)
    const location = useLocation();
    const {cmsMenu}=useResponse()
    const previousData = location.state || {};

    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }], // Font family & size
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Ordered & bullet lists
            ['emoji'],
        ],
        'emoji-toolbar': true,
        'emoji-textarea': false,
        'emoji-shortname': true,
    };
    const formats = [
        'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'emoji'
    ];
    const navigate = useNavigate()


    const [showOptions, setShowOptions] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Function to handle click events outside the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionClick = (action: string) => {
        setShowOptions(false); // Hide dropdown after selection
        if (action === "draft") {
            toast.success("Saved as draft");
        } else if (action === "trash") {
            toast.success("Moved to trash");
        }
    };


    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const files = Array.from(event.target.files);
        const base64Images = await Promise.all(files.map(file =>
            new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            })
        ));

        const updatedImages = [...images, ...base64Images];
        setImages(updatedImages);
        setValue("image", updatedImages);
    };


    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        setValue("image", updatedImages);
    };




    // First, update your validation schema to match your interface
    const validationSchema = Yup.object().shape({
        title: Yup.string().required("Category Name is required"),

    });

    // Then use the resolver
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<EventFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            postType: "Event",
            project: cmsMenu.selectedData,
            content: quillValue
        }
    });

    useEffect(() => {
        reset((prev) => ({
            ...prev, // Keep existing defaults
            ...previousData, // Override with previousData
        }));
    }, [previousData, reset]);


    const getOnePost = async () => {
        const { response, error } = await getAPost(`${endPoints.POSTS}/${id}`)
        if (response && !error) {
            console.log("editresponse", response?.data.data);
            setFormValues(response?.data.data)
            setQuillValue(response?.data.data.content)
        }
    }

    useEffect(() => {

        setValue("postType", "Events");
        setValue("project", "BillBizz");
        setValue("content", quillValue);

        if (id) {
            getOnePost();
        }
    }, [setValue, id, quillValue]);






    const setFormValues = (data: Post) => {
        Object.keys(data).forEach((key) => {
            setValue(key as keyof Post, data[key as keyof Post]);
        });
        if (data.image && data.image.length > 0) {
            setImages(data.image); // Update the images state with existing images
        }
    };

    const {setPostLoading}=useResponse()


    const onSubmit = async (data: Post) => {
        console.log("Submitted Data:", data);

        try {
            setPostLoading(true)
            const endPoint =
                id
                    ? `${endPoints.POSTS}/${id}`
                    :
                    endPoints.POSTS;

            const { response, error } =
                id
                    ? await editPost(endPoint, data)

                    :
                    await addPost(endPoint, data);
            if (response && !error) {
                toast.success(response.data.message);
                reset()
                setTimeout(() => {
                    navigate("/cms/events");
                }, 1000)
            } else {
                toast.error(error?.response?.data?.message || "An error occurred");
            }
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Please try again later.");
        }
        finally{
            setPostLoading(false)
        }
    };

    return (
        <div>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div className='bg-white p-3 rounded-lg grid grid-cols-3'>

                    <Button onClick={() => navigate(-1)} variant='tertiary' size='sm' className='text-xs border border-[#565148] w-20'>
                        <Chevronleft /> Back
                    </Button>
                    <div>


                    </div>
                    <div className='flex gap-2 justify-end'>
                        <Button variant='tertiary' size='sm' className='text-xs border border-[#565148] w-12'>Save</Button>
                        <Button onClick={handleSubmit(onSubmit)} size='sm' className='text-xs border border-[#565148] w-16'>Publish</Button>

                        <button onClick={() => setShowOptions(!showOptions)}>
                            <MenueDotsIcon />
                        </button>

                        {showOptions && (
                            <div className="absolute right-6 top-[25%] mt-2 w-40 bg-white border rounded shadow-lg">
                                <ul className="py-1">
                                    <li
                                        onClick={() => handleOptionClick("draft")}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Save as Draft
                                    </li>
                                    <li
                                        onClick={() => handleOptionClick("trash")}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Move to Trash
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className='w-full mt-6 flex-1' style={{ display: 'flex', flexDirection: 'column' }}>

                    <Input
                        type='text'
                        placeholder='Add Post Title...'
                        className='w-full p-2 border outline-none border-gray-300 rounded-lg text-[#4B5C79] text-lg font-semibold'
                        required
                        error={errors.title?.message}
                        {...register("title")}

                    />


                    <div className="pt-2 ">
                        <label className="block mb-4 p-2 border rounded-lg cursor-pointer bg-gray-200 hover:bg-gray-300 text-center">
                            Upload Images
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>

                        <div className="grid grid-cols-3 gap-4">
                            {images.map((src, index) => (
                                <div key={index} className="relative">
                                    <img src={src} alt={`upload-${index}`} className="w-full h-44 object-cover rounded-lg" />
                                    <button
                                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                                        onClick={() => removeImage(index)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '16px' }} className='bg-white p-2 rounded-lg'>
                        <ReactQuill
                            value={quillValue}
                            onChange={setQuillValue}
                            placeholder="Write your message here..."
                            className="quill-editor"
                            theme="snow"
                            modules={modules}
                            formats={formats}
                        />
                    </div>
                </div>

            </div>

        </div>

    );
}

export default CreateEvent;