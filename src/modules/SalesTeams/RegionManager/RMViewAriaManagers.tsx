// import LeadsCardIcon from "../../../assets/icons/LeadsCardIcon"
// import ViewRoundIcon from "../../../assets/icons/ViewRoundIcon"
// import Button from "../../../components/ui/Button"

import Button from "../../../components/ui/Button";
import No_Data_found from '../../../assets/image/NO_DATA.png'
import UserIcon from "../../../assets/icons/UserIcon";
import { useNavigate } from "react-router-dom";

type Props = {
  totalAreaManagers: Array<any>;};

const RMViewAriaManagers = ({totalAreaManagers}: Props) => {
  const navigate = useNavigate()
  return (
    <div>
  <div className="rounded-xl">
    <div>
      <h1 className="font-bold text-sm sticky top-0 bg-white pb-2 p-6">
        Area Managers
      </h1>
    </div>

    <div className="bg-white h-[370px] overflow-y-scroll hide-scrollbar">
      <div className="bg-white m-2">
        {totalAreaManagers.length === 0 ? (
          <div className="flex justify-center flex-col items-center h-full p-24">
            <img width={70} src={No_Data_found} alt="No Data Found" />
            <p className="font-bold text-red-700 text-center">No Result Found!</p>
          </div>
        ) : (
          totalAreaManagers.map((manager: any, index: number) => (
            <div key={index} className="flex justify-between bg-[#F5F9FC] p-3 rounded-lg my-2">
              <div className="flex gap-6 w-full">
                <div className="flex-shrink-0">
                  {manager.user?.userImage ? (
                    <img
                      className="w-8 h-8 rounded-full"
                      src={manager.user?.userImage}
                      alt=""
                    />
                  ) : (
                    <p className="w-8 h-8 bg-black rounded-full flex justify-center items-center">
                      <UserIcon color="white" size={20} />
                    </p>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-[#4B5C79] text-xs font-medium py-1">
                    {manager.user?.userName}
                  </p>
                  <div className="flex flex-wrap">
                    <p className="text-[#72829D] text-xs font-medium">
                      {manager.user?.email}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-[#F9A51A] mt-1 ms-2"></div>
                    <p className="text-[#72829D] text-xs font-medium ">
                      {manager.user?.phoneNo}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => navigate(`/area-manager/${manager?._id}`)}
                  variant="tertiary"
                  className="h-8 text-xs font-medium text-[#565148] border-[#565148]"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
</div>

   
  );
};

export default RMViewAriaManagers;
