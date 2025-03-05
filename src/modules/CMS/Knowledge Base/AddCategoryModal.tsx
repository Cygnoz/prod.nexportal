import { useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import frame from "../../../assets/image/Categoryframe.png"
import Select from '../../../components/form/Select';
type Props = { page?: string }

function AddCategoryModal({ page }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const options = [
        { value: "a", label: "a" },
    ]
    return (
        <div>

            <Button onClick={openModal}
                className="border border-[#565148]" size="sm"                >
                <span className="font-bold text-xl">+</span>
                {
                    page === "base" ? "Create Category":
                    page === "sub" ? "Create Sub Category" : ""
                    
                }
            </Button>


            <Modal open={isModalOpen} onClose={closeModal} className="w-[50%]  text-start px-7 py-6">
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
                                    />
                                    <div className='flex justify-center'>

                                        <img src={frame} alt="" />
                                    </div>
                                    <div className='mt-2'>
                                        <p className='text-[#4B5C79] text-[12px] font-medium'>
                                            Upload Category Image
                                        </p>
                                    </div>
                                </label>

                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-2">
                            <Input
                                placeholder="Enter Category Name"
                                label="Category Name"
                                required
                            />
                                <Input
                                    placeholder="Choose Order"
                                    label="Choose Order"
                                />
                                {
                                    page === "sub" && 
                                    <Select
                                    label='Select Category'
                                    options={options} 
                                    />
                                }
                            <Input
                                placeholder="Enter Description"
                                label="Description"
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

export default AddCategoryModal


