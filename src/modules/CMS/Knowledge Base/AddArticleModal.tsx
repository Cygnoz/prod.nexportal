import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import frame from "../../../assets/image/Categoryframe.png"
import Select from '../../../components/form/Select';
import toast from 'react-hot-toast';
import { endPoints } from '../../../services/apiEndpoints';
import { Articles, Category, SubCategory } from '../../../Interfaces/CMS';
import useApi from '../../../Hooks/useApi';
type Props = { id?: string, fetchData?: () => void }
import * as Yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import TextArea from '../../../components/form/TextArea';

function AddArticleModal({ id, fetchData }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState<string | undefined>(id);
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [subCategoryData, setSubCategoryData] = useState<SubCategory[]>([]);


    const openModal = () => {
        // Reset form when opening modal
        reset();
        // Set current ID when opening modal
        setCurrentId(id);
        setModalOpen(true);
    };

    const closeModal = () => {
        reset()
        setModalOpen(false);
    };
    const categoryOptions = categoryData.map((data) => ({
        label: data.categoryName,
        value: data._id
    }))
    const SubcategoryOptions = subCategoryData.map((data) => ({
        label: data.subCategoryName,
        value: data._id
    }))

    const { request: add } = useApi('post', 3001)
    const { request: getOne } = useApi('get', 3001)
    const { request: edit } = useApi('put', 3001)


    const validationSchema = Yup.object().shape({
        title: Yup.string().required("Title Name is required"),
        category: Yup.string().required("Category is required"),
        subCategory: Yup.string().required("Sub Category is required"),


    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,

    } = useForm<Articles>({
        resolver: yupResolver(validationSchema),

    });


    useEffect(() => {
        getAllCategory(),
            getAllSubCategory()
    }, []);

    const handleCategoryChange = (value: string) => {
        setValue("category", value); // Directly update form state
    };
    const handleSubCategoryChange = (value: string) => {
        setValue("subCategory", value); // Directly update form state
    };



    const { request: getAll } = useApi('get', 3001)

    const getAllCategory = async () => {

        try {
            const { response, error } = await getAll(`${endPoints.CATEGORY}?categoryType=Knowledge Base`)


            if (response && !error) {
                console.log("API Response Data:", response?.data.data);
                setCategoryData(response?.data.data);
            } else {
                console.error("Error fetching :", error);
            }
        } catch (err) {
            console.error("Unexpected error :", err);
        }

    };
    const getAllSubCategory = async () => {

        try {
            const { response, error } = await getAll(`${endPoints.SUBCATEGORY}`)


            if (response && !error) {
                console.log("API Response Data:", response?.data.data);
                setSubCategoryData(response?.data.data);
            } else {
                console.error("Error fetching :", error);
            }
        } catch (err) {
            console.error("Unexpected error :", err);
        }

    };

    const getOneItem = async (categoryId: string) => {
        try {
            const { response, error } = await getOne(`${endPoints.ARTICLE}/${categoryId}`);
            if (response && !error) {
                console.log("editresponse", response?.data.data);
                const data = response?.data.data
                const body = {
                    ...data,
                    category: data?.category._id,
                    subCategory:data?.subCategory._id
                }
                setFormValues(body);

            } else {
                toast.error(error?.response?.data?.message || "Failed to fetch category data");
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            toast.error("Failed to load category data");
        }
    }

    useEffect(() => {
        if (isModalOpen && currentId) {
            getOneItem(currentId);
        }
    }, [isModalOpen, currentId]);

    const setFormValues = (data: any) => {
        Object.keys(data).forEach((key) => {
            setValue(key as keyof Articles, data[key as keyof Articles]);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setValue("image", base64String);
            };
            reader.readAsDataURL(file);
        }
    };


    const onSubmit = async (data: Articles) => {
        console.log("Submitted Data:", data);
        try {
            const endPoint =
                id
                    ? `${endPoints.ARTICLE}/${id}`
                    :
                    endPoints.ARTICLE;

            const { response, error } =
                id
                    ? await edit(endPoint, data)

                    :
                    await add(endPoint, data);

            if (response && !error) {
                toast.success(response.data.message);
                {
                    fetchData &&
                        fetchData();
                }
                reset()
                closeModal();
            } else {
                toast.error(error?.response?.data?.message || "An error occurred");
            }
        } catch (error) {
            console.error("Error submitting category:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            {
                id ?
                    <Button
                        onClick={openModal}
                        variant="tertiary"
                        className="border border-[#565148] h-8 text-[15px]"
                        size="sm"
                    >
                        Edit
                    </Button>
                    :
                    <Button onClick={openModal}
                        className="border border-[#565148]" size="sm"                >
                        <span className="font-bold text-xl">+</span>
                        Add Article
                    </Button>
            }


            <Modal open={isModalOpen} onClose={closeModal} className="w-[90%] sm:w-[50%] text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">Create Category</h1>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <form className="w-full">
                        <div>
                            <div className="col-span-2 flex flex-col items-center px-2">
                                <label
                                    className="cursor-pointer text-center border-2 w-full  border-dashed py-5"
                                    htmlFor="file-upload"
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {watch("image") ? (
                                        <div
                                            className="flex justify-center  items-center"
                                        >
                                            <div className='flex justify-center'>
                                                <img className='w-full h-40' src={watch("image")} alt="" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className='flex justify-center'>

                                                <img src={frame} alt="" />
                                            </div>
                                            <div className='mt-2'>
                                                <p className='text-[#4B5C79] text-[12px] font-medium'>
                                                    Upload  Image
                                                </p>
                                            </div>
                                        </div>

                                    )}

                                </label>

                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-2">
                            <Input
                                placeholder="Enter title"
                                label="Article Title"
                                required
                                error={errors.title?.message}
                                {...register("title")}
                            />
                            <div className="my-2">
                                <Select
                                    label='Select Category'
                                    options={categoryOptions}
                                    value={watch("category")} // Get value from form state
                                    onChange={handleCategoryChange}
                                />
                            </div>
                            <Select
                                label='Select Sub Category'
                                options={SubcategoryOptions}
                                value={watch("subCategory")} // Get value from form state
                                onChange={handleSubCategoryChange} />

                            <TextArea
                                label='Conetnt'
                                error={errors.content?.message}
                                {...register("content")}
                                placeholder='Enter content'

                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pb-2 me-2">
                            <Button
                                variant="tertiary"
                                className="h-8 text-sm border rounded-lg"
                                size="lg"
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="h-8 text-sm border rounded-lg"
                                size="lg"
                                onClick={handleSubmit(onSubmit)}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}

export default AddArticleModal


