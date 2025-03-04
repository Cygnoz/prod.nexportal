import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import frame from "../../../assets/image/Categoryframe.png"
import TextArea from '../../../components/form/TextArea';

type Props = {}

function CreateNotModal({ }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("all");

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
        Create Notification
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
                      Upload  Image
                    </p>
                  </div>
                </label>

              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 p-2">
              <Input
                placeholder="Enter Category Name"
                label=" Title"
                required
              />
              <p className='text-sm mt-2'>Select Licenser</p>
              <div className='flex gap-5'>
                <div>
                  <input
                    type="radio"
                    id="all"
                    name="licenseType"
                    value="all"
                    checked={selectedOption === "all"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <label className='ps-2' htmlFor="all">All</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="single"
                    name="licenseType"
                    value="single"
                    checked={selectedOption === "single"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <label className='ps-2' htmlFor="single">Single Licensers</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="multiple"
                    name="licenseType"
                    value="multiple"
                    checked={selectedOption === "multiple"}
                    className=""
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <label className='ps-2 ' htmlFor="multiple">Multiple Licensers</label>
                </div>
              </div>
              <div className="mt-4">
                {selectedOption === "single" && (
                  <Select
                    options={options}
                  />
                )}
                {selectedOption === "multiple" && (
                  <div className='border border-1 rounded-lg p-3'>
                    <p className='bg-[#F2F2F2] rounded-lg p-2 w-28 h-9 text-[13px] flex justify-between'>Peter <button className=''>&times;</button></p>
                  </div>
                )}
              </div>

              <TextArea
                label='Body'
                placeholder='Write Licenses Message' />
              <div>
                <Button
                  className="border border-[#565148] flex items-center justify-center text-[15px] w-full" variant="tertiary"            >
                  Send Now
                </Button>
              </div>
              <p className='text-center text-[#768294]'>OR</p>
              <p className='py-1 text-[#768294]'>Schedule for</p>
              <div className='grid grid-cols-2 gap-5'>
                <Input
                  type='date'
                  label='Select Date'
                  className='w-full' />
                <Input
                  type='text'
                  label='Time'
                  placeholder='Enter Time'
                  className='w-full' />
              </div>


            </div>
            <div className="flex justify-end gap-2 mt-3 pb-2 me-2">
              <Button
                variant="tertiary"
                className="h-8 text-sm border rounded-lg"
                size="lg"
                onClick={closeModal}
              >
                Save as Draft
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

export default CreateNotModal