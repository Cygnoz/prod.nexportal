import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import frame from "../../../assets/image/Categoryframe.png"
import Select from '../../../components/form/Select';
import useApi from '../../../Hooks/useApi';
import { useForm } from 'react-hook-form';
import { Category, SubCategory, } from '../../../Interfaces/CMS';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
import { endPoints } from '../../../services/apiEndpoints';
import toast from 'react-hot-toast';

type Props = { page?: string, id?: string, fetchData?: () => void }

function AddSubCategoryModal({ id, fetchData }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState<string | undefined>(id);
    const [responseData, setResponseData] = useState<Category[]>([]);


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
    const options = responseData.map((data) => ({
        label: data.categoryName,
        value: data._id
    }))

    const { request: add } = useApi('post', 3001)
    const { request: getOne } = useApi('get', 3001)
    const { request: edit } = useApi('put', 3001)


    const validationSchema = Yup.object().shape({
        subCategoryName: Yup.string().required("Category Name is required"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,

    } = useForm<SubCategory>({
        resolver: yupResolver(validationSchema),

    });


    useEffect(() => {
        getAllItems()
    }, []);

    const handleChange = (value: string) => {
        setValue("categoryName", value); // Directly update form state
    };



    const { request: getAll } = useApi('get', 3001)

    const getAllItems = async () => {

        try {
            const { response, error } = await getAll(`${endPoints.CATEGORY}?categoryType=Knowledge Base`)


            if (response && !error) {
                console.log("API Response Data:", response?.data.data);
                setResponseData(response?.data.data);
            } else {
                console.error("Error fetching :", error);
            }
        } catch (err) {
            console.error("Unexpected error :", err);
        }

    };

    const getOneItem = async (categoryId: string) => {
        try {
            const { response, error } = await getOne(`${endPoints.SUBCATEGORY}/${categoryId}`);
            if (response && !error) {
                console.log("editresponse", response?.data.data);
                const data = response?.data.data;
                const body = {
                    ...data,
                    categoryName: data?.categoryName._id,
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
            setValue(key as keyof SubCategory, data[key as keyof SubCategory]);
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


    const onSubmit = async (data: SubCategory) => {
        console.log("Submitted Data:", data);
        try {
            const endPoint =
                id
                    ? `${endPoints.SUBCATEGORY}/${id}`
                    :
                    endPoints.SUBCATEGORY;

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
                        Create Sub Category
                    </Button>
            }


            <Modal open={isModalOpen} onClose={closeModal} className=" w-[90%] sm:w-[50%] text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">Create Sub Category</h1>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
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
                                placeholder="Enter Category Name"
                                label="Category Name"
                                required
                                error={errors.subCategoryName?.message}
                                {...register("subCategoryName")}
                            />


                            <Input
                                placeholder="Enter Order Number"
                                label="Select Order"
                                type='number'
                                error={errors.order?.message}
                                {...register("order")}

                            />
                            <Select
                                label='Select Category'
                                options={options}
                                value={watch("categoryName")} // Get value from form state
                                onChange={handleChange}
                            />
                            <Input
                                placeholder="Enter Description"
                                label="Description"
                                {...register("description")}
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
                                type="submit"
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

export default AddSubCategoryModal


