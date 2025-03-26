import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import { Terms } from '../../../Interfaces/CMS';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
import toast from 'react-hot-toast';
import useApi from '../../../Hooks/useApi';
import { endPoints } from '../../../services/apiEndpoints';
import { useResponse } from '../../../context/ResponseContext';

type Props = { id?: string, fetchData?: () => void }

function AddTerms({ id, fetchData }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const options = Array.from({ length: 30 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString(),
    }));


    const { request: addTerm } = useApi('post', 3001)
    const { request: getATerm } = useApi('get', 3001)
    const { request: editTerm } = useApi('put', 3001)
    const {cmsMenu}=useResponse()

    const validationSchema = Yup.object().shape({
        termTitle: Yup.string().required("Title is required"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<Terms>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            type: "TermsAndConditions", //  Set default type
            project:cmsMenu.seletedData
        }
    });

    const handleOrderChange = (value: string) => {
        setValue("order", value); // Directly update form state
    };

    useEffect(() => {
        setValue("type", "TermsAndConditions")
        setValue("project",cmsMenu.selectedData)
    }, [setValue])

    const getOneTerms = async () => {
        const { response, error } = await getATerm(`${endPoints.TERMS}/${id}`)
        if (response && !error) {
            console.log("editresponse", response?.data.term);
            setFormValues(response?.data.term)
        }
    }


    const setFormValues = (data: Terms) => {
        Object.keys(data).forEach((key) => {
            setValue(key as keyof Terms, data[key as keyof Terms]);
        });
    };

    useEffect(() => {
        if (id) {
            getOneTerms()
        }
    }, [])

    const {setPostLoading}=useResponse()

    const onSubmit = async (data: Terms) => {
        console.log("Submitted Data:", data);

        try {
            setPostLoading(true)
            const endPoint =
                id
                    ? `${endPoints.TERMS}/${id}`
                    :
                    endPoints.TERMS;

            const { response, error } =
                id
                    ? await editTerm(endPoint, data)

                    :
                    await addTerm(endPoint, data);

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
        finally{
            setPostLoading(false)
        }
    };
    return (
        <div>
            {
                id ?
                    <Button variant="tertiary"
                        onClick={openModal}
                        className="border border-[#565148] h-8 text-[15px]" size="sm"                >
                        Edit
                    </Button>
                    :

                    <Button onClick={openModal}
                        className="border border-[#565148]" size="sm"                >
                        <span className="font-bold text-xl">+</span>
                        Add Terms
                    </Button>
            }


            <Modal open={isModalOpen} onClose={closeModal} className="sm:w-[50%] w-[90%]  text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">Add Terms</h1>
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
                                label=" Terms Title"
                                required
                                error={errors.termTitle?.message}
                                {...register("termTitle")}
                            />
                            <div className="my-2">
                                <Select
                                    label="Select Order"
                                    options={options}
                                    value={watch("order")} // Get value from form state
                                    onChange={handleOrderChange}
                                />
                            </div>
                            <Input
                                placeholder="Enter Description"
                                label="TermDescription"
                                error={errors.termDescription?.message}
                                {...register("termDescription")}
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

export default AddTerms


