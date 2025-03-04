import { useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
type Props = {}

function AddTerms({ }: Props) {
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
                Add Terms
            </Button>


            <Modal open={isModalOpen} onClose={closeModal} className="w-[50%]  text-start px-7 py-6">
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
                    <form className="w-full">

                        <div className="grid grid-cols-1 gap-2 p-2">
                            <Input
                                placeholder="Enter Category Name"
                                label="Article Title"
                                required
                            />
                            <div className="my-2">
                                <Select
                                    label='Select Order'
                                    options={options}
                                />
                            </div>
                            <Input
                                placeholder="Enter Description"
                                label="TermDescription"
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


