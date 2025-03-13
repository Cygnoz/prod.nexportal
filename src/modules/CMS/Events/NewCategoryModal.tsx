import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
import toast from 'react-hot-toast';
import useApi from '../../../Hooks/useApi';
import { Category } from '../../../Interfaces/CMS';
import { endPoints } from '../../../services/apiEndpoints';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';

type Props = { page?: string, id?: string, fetchAllCategory?: () => void }

function NewCategory({ page, id, fetchAllCategory }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState<string | undefined>(id);

    const openModal = () => {
        // Reset form when opening modal
        reset();
        // Set current ID when opening modal
        setCurrentId(id);
        setModalOpen(true);
    };
    

    const closeModal = () => {
        reset();
        setModalOpen(false);
    };

    const { request: addCategory } = useApi('post', 3001)
    const { request: getACategory } = useApi('get', 3001)
    const { request: editCategory } = useApi('put', 3001)

    const validationSchema = Yup.object().shape({
        categoryName: Yup.string().required("Category Name is required"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<Category>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            categoryType: "Events"
        }
    });

    const getOneCategory = async (categoryId: string) => {
        try {
            const { response, error } = await getACategory(`${endPoints.CATEGORY}/${categoryId}`);
            if (response && !error) {
                console.log("editresponse", response?.data.data);
                setFormValues(response?.data.data);
            } else {
                toast.error(error?.response?.data?.message || "Failed to fetch category data");
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            toast.error("Failed to load category data");
        }
    };

    // Set category type based on page prop
    useEffect(() => {
        setValue("categoryType", "Events");

    }, [setValue, page]);

    // Fetch category data when modal opens and we have an ID
    useEffect(() => {
        if (isModalOpen && currentId) {
            getOneCategory(currentId);
        }
    }, [isModalOpen, currentId]);

    const setFormValues = (data: Category) => {
        Object.keys(data).forEach((key) => {
            setValue(key as keyof Category, data[key as keyof Category]);
        });
    };

    const onSubmit = async (data: Category) => {
        console.log("Submitted Data:", data);

        try {
            const endPoint = currentId
                ? `${endPoints.CATEGORY}/${currentId}`
                : endPoints.CATEGORY;

            const { response, error } = currentId
                ? await editCategory(endPoint, data)
                : await addCategory(endPoint, data);

            if (response && !error) {
                toast.success(response.data.message);
                if (fetchAllCategory) {
                    fetchAllCategory();
                }
                reset();
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
                    </Button> :
                    <Button
                        onClick={openModal}
                        variant={"tertiary"}
                        className="border border-[#565148]"
                        size="sm"
                    >
                        <span className="font-bold text-xl">+</span>
                        Create Category
                    </Button>
            }

            <Modal open={isModalOpen} onClose={closeModal} className="w-[90%] sm:w-[50%] bg-[#E7E7ED] text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">
                            {currentId ? "Edit Category" : "Add Category"}
                        </h1>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-2 p-2">
                            <Input
                                placeholder="Enter Category Name"
                                label="Category Name"
                                required
                                error={errors.categoryName?.message}
                                {...register("categoryName")}
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

export default NewCategory