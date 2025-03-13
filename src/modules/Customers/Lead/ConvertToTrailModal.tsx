import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/modal/Modal';
import convertIMG from '../../../assets/image/Group.png'
import EyeOffIcon from '../../../assets/icons/EyeOffIcon';
import Eye from '../../../assets/icons/Eye';
import Input from '../../../components/form/Input';
import CustomPhoneInput from '../../../components/form/CustomPhone';
import Select from '../../../components/form/Select';
type Props = {}

function ConvertTrilaModal({ }: Props) {

    const [confirmModal, setConfirmModal] = useState(false);
    const [iscreationModal, setCreationModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const openConfirmModal = () => {
        setConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setConfirmModal(false);
    };
    const openCreationModal = () => {
        setConfirmModal(false)
        setCreationModal(true);
    };

    const closeCreationModal = () => {
        setConfirmModal(false)
        setCreationModal(false);
    };

    return (
        <div>
            <Button className='w-full flex  justify-center my-2' onClick={openConfirmModal}>
                Convert To Trial
            </Button>
            <Modal open={confirmModal} onClose={closeConfirmModal} className="w-[50%]  text-start px-7 py-6">
                <div>
                    <div className="flex justify-between items-center p-3">
                        <h1 className="text-lg font-bold text-deepStateBlue">Lead Conversion</h1>
                        <button
                            type="button"
                            onClick={closeConfirmModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <div className='flex justify-center items-center'>
                        <img src={convertIMG} className='' alt="" />
                    </div>
                    <p className='text-center p-5 text-[#4B5C79] text-sm font-semibold'>Are you sure you want to convert this lead into a trial? This action will move the lead to the trial module.</p>
                    <div className='flex justify-end gap-2 py-2'>
                        <Button
                            variant="tertiary"
                            className="h-9 text-sm border border-[#565148] rounded-lg"
                            onClick={closeConfirmModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="h-9 text-sm border rounded-lg"
                            onClick={openCreationModal}                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal open={iscreationModal} onClose={openCreationModal} className="w-[50%] text-start px-7 py-6 max-h-[90vh] overflow-y-auto scroll-smooth hide-scrollbar"
            >
                <div>
                    <div className="flex justify-between items-center py-3">
                        <div>

                            <h1 className="text-lg font-bold text-deepStateBlue">Organization Creation</h1>
                            <p></p>
                        </div>
                        <button
                            type="button"
                            onClick={closeCreationModal}
                            className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <div>
                        <div className="py-2">

                            <Input
                                label='Organization Name'
                                placeholder='Enter Name'
                                type='text'
                            />
                        </div>
                        <div className="py-2">
                            <Input
                                label='Email'
                                placeholder='Enter Email'
                                type='email'
                            />

                        </div>
                        <div className="py-2">

                            <Input
                                label='Organization Name'
                                placeholder='Enter Name'
                            />
                        </div>
                        <div className="py-2">

                            <CustomPhoneInput
                                label='Phone'
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-dropdownText text-sm">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="pl-3 text-sm w-[100%] rounded-md text-start mt-1.5 bg-white border border-inputBorder h-[39px] leading-tight focus:outline-none focus:bg-white focus:border-darkRed"
                                    placeholder="Password"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="focus:outline-none mt-1"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon color='#4B5C79' />
                                        ) : (
                                            <Eye color='#4B5C79' />

                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>
                        <div className='pt-2'>
                            <label htmlFor="password" className="text-dropdownText text-sm">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="pl-3 text-sm w-[100%] rounded-md text-start mt-1.5 bg-white border border-inputBorder h-[39px] leading-tight focus:outline-none focus:bg-white focus:border-darkRed"
                                    placeholder="Password"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="focus:outline-none mt-1"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon color='#4B5C79' />
                                        ) : (
                                            <Eye color='#4B5C79' />

                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="py-2">

                            <Select options={[]}
                                label='Product' />
                        </div>
                        <div className="py-2">

                            <Input
                                label='Start Date'
                                type='date'
                            />
                        </div>
                        <div className="py-2">

                            <Input
                                label='Ending date'
                                type='date'
                            />
                        </div>


                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button
                            variant="tertiary"
                            className="h-9 text-sm border border-[#565148] rounded-lg"
                            onClick={closeCreationModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="h-9 text-sm border rounded-lg"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}

export default ConvertTrilaModal