import ArrowRight from "../../../../assets/icons/ArrowRight";
import Input from "../../../../components/form/Input";
import Button from "../../../../components/ui/Button";



type Props = {
    onClose: () => void;
};




const CalenderModal = ({onClose}: Props) => {

  return (
    <div>
    <div className="flex p-2 justify-between">
      <h1 className="font-medium text-sm">Calendar</h1>
      <div className="justify-end">
        <button
          type="button"
          className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900 me-auto"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  
    <div className="flex flex-col md:flex-row p-2 my-1">
      <Input placeholder="Search Date" className="mb-2 md:mb-0" />
      <div className="flex items-center ml-2">
        <h1>November</h1>
        <ArrowRight size={15} />
      </div>
      <div className="ml-auto">
        <Button size='sm'>Add Activity</Button>
      </div>
    </div>
  
    <div className="grid grid-cols-12">
      <div className="col-span-1">
        <div className="bg-[#F3E6E6] py-1">
          <p className="ms-4 mt-3 font-semibold text-base">GMT+7</p>
          <hr className="mt-3 ms-2" />
        </div>
        <div className="bg-[#FFFAFA] h-[560px] max-h-full pt-5 pb-4">
          {['09AM', '10AM', '11AM', '12PM', '01PM'].map((time, index) => (
            <div key={index} className="mt-20">
              <p className={`ms-4 ${index === 0 ? '-mt-10' : 'mt-5'} font-medium text-sm`}>{time}</p>
            </div>
          ))}
        </div>
      </div>
  
      <div className="col-span-11">
        <div className="bg-gray-100 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-white rounded-lg">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-[#F3E6E6] py-1">
              {['Mon 18', 'Tue 19', 'Wed 20', 'Thu 21', 'Fri 22', 'Sat 23', 'Sun 24'].map((day, index) => (
                <div key={index} className="text-center py-3 font-semibold text-gray-600">{day}</div>
              ))}
            </div>
  
            {[...Array(5)].map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {[...Array(7)].map((_, dayIndex) => (
                  <div key={dayIndex} className="h-28 border-r border-b border-gray-200 relative">
                    {(weekIndex === 1 && dayIndex === 1) || (weekIndex === 2 && dayIndex === 1) ? (
                      <div className="absolute top-2 left-2 right-2 bg-green-200 p-2 rounded-md text-sm text-gray-800">
                        <div className="font-bold">Meeting Scheduled</div>
                        <div className="text-xs">09:00 AM - 10:00 AM</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  )
}

export default CalenderModal