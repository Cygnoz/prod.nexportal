import Button from "../../../../components/ui/Button";
import bgpicturee from "../../../../assets/image/Group 629978 (1).png";

//import { useState } from "react";

type Props = {
  onClose: () => void;
  trialStatus?:any
  setTrialStatus?:any
  handleScrollTop:()=>void
};

const ResumePauseTrail = ({ onClose,trialStatus,setTrialStatus,handleScrollTop}: Props) => {
  // const [isPaused, setIsPaused] = useState(false);

  // const handlePauseToggle = () => {
  //   setIsPaused((prev) => !prev);
  // };

 

  return (
    <div className="p-2 bg-white rounded shadow-md space-y-2">
      <div className="p-2 space-y-1 text-[#4B5C79] py-2 w-[100%]">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-[#303F58] font-bold text-lg">
              Pause Trail Confirmation
            </h3>
            <p className="text-[11px] text-[#8F99A9] mt-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt.
            </p>
          </div>
          <p onClick={onClose} className="text-3xl cursor-pointer">
            &times;
          </p>
        </div>

        <div>
          <div className=" my-2">
            <div className="flex justify-center">
              <img className="h-44 w-64 " src={bgpicturee} alt="" />
            </div>
              <p className="font-semibold text-[#4B5C79] text-sm my-3">
                Pausing this trial will restrict all user activities until
                resumed. Are you sure want to proceed?
              </p>
            
          </div>
        </div>
        <div className=" flex justify-end gap-2 mt-3 pb-2 me-3">
          <Button
            variant="tertiary"
            className="h-8 text-sm border rounded-lg"
            size="lg"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="h-8 text-sm border rounded-lg"
            size="lg"
            type="submit"
            onClick={()=>{
              setTrialStatus((prev:any)=>!prev)
              onClose()
              handleScrollTop()
            }}
          >
            {trialStatus?'Resume':'Pause'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumePauseTrail;
