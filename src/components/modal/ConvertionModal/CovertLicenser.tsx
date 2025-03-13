// Path: components/ConvertModal.tsx
import Button from "../../ui/Button";

import { useState } from "react";
import bgpicturee from "../../../assets/image/Group.png";
import Modal from "../Modal";
import OrganisationForm from "./OrganisationForm";

type Props = {
    onClose: () => void;
    type:"lead"|"trial";
    orgData?:any
};

function ConvertModal({ onClose, type,orgData, }: Props) {
    
    const [isCurrentModalOpen, setIsCurrentModalOpen] = useState(true);
    const [isNextModalOpen, setIsNextModalOpen] = useState(false);

    // Close the current modal and open the next one
    const handleConfirmClick = () => {
        setIsCurrentModalOpen(false);
        setIsNextModalOpen(true);
    };


    return (
        <>
            {/* Current Modal */}
            <Modal
                open={isCurrentModalOpen}
                align="center"
                onClose={onClose}
                 className="w-[40%] max-sm:w-[90%] max-md:w-[70%] "
            >
                <div className="p-2 bg-white rounded shadow-md space-y-2">
                    <div className="p-2 space-y-1 text-[#4B5C79] py-2 w-[100%]">
                        <div className="flex justify-between p-2">
                            <div>
                                <h3 className="text-[#303F58] font-bold text-lg">{type=='lead'?"Lead": "Trial"} Conversion</h3>
                            </div>
                            <p onClick={onClose} className="text-3xl cursor-pointer">
                                &times;
                            </p>
                        </div>

                        <div>
                            <div className="my-2">
                                <div className="flex flex-col items-center gap-7">
                                    <img
                                        className="h-44 w-32 "
                                        src={bgpicturee}
                                        alt="Background"
                                    />
                                    <p className="font-semibold text-[#4B5C79] text-sm my-3 text-center">
                                    Are you sure want to convert this {type=="lead"?'lead':'trial'} into a {type=="lead"?'trial':'licencer'}? <br /> This action will move the {type=="lead"?'lead':'trial'} to the {type=="lead"?'trial':'licencer'} module.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-3 pb-2 ">
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
                                type="button"
                                onClick={handleConfirmClick}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Next Modal */}
            <Modal
                open={isNextModalOpen}
                align="center"
                onClose={onClose}
                className="w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[80%] max-sm:h-[600px] sm:h-[600px] md:h-[700px]  max-sm:overflow-auto"
            >
                <OrganisationForm  orgData={orgData}  type={type} onClose={onClose} />
            </Modal>
        </>
    );
}

export default ConvertModal;
