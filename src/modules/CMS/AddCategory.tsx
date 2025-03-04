import { useState } from 'react'
import Button from '../../components/ui/Button';
import Modal from '../../components/modal/Modal';
import Input from '../../components/form/Input';

type Props = { page?: string }

function AddCategory({ page }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    return (
        <div>
            {
                page === "blog" ?
                    <Button onClick={openModal}
                        // variant={`${page === "blog" || page === "news" ? "primary" : "tertiary"}`}

                        variant={"primary"}

                        className="border border-[#565148]" size="sm"                >
                        <span className="font-bold text-xl">+</span>
                        Create Category
                    </Button> :

                    <Button onClick={openModal}
                        // variant={`${page === "blog" || page === "news" ? "primary" : "tertiary"}`}

                        variant={"tertiary"}

                        className="border border-[#565148]" size="sm"                >
                        <span className="font-bold text-xl">+</span>
                        Create Category
                    </Button>

            }



            <Modal open={isModalOpen} onClose={closeModal} className="w-[50%] bg-[#E7E7ED] text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">Add Category</h1>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <form className="w-full">
                        <div className="grid grid-cols-1 gap-2 p-2">
                            <Input
                                placeholder="Enter Category Name"
                                label="Category Name"
                                required
                            />
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

export default AddCategory


