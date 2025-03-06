//import ImagePlaceHolder from "../../../components/form/ImagePlaceHolder";
import Input from "../../../../components/form/Input";
//import Select from "../../../components/form/Select";
import Button from "../../../../components/ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Select from "../../../../components/form/Select";
import { useEffect } from "react";
import useApi from "../../../../Hooks/useApi";
import { endPoints } from "../../../../services/apiEndpoints";
import toast from "react-hot-toast";
import { useResponse } from "../../../../context/ResponseContext";
//import CustomPhoneInput from "../../../components/form/CustomPhone";
//import InputPasswordEye from "../../../components/form/InputPasswordEye";

type Props = {
    onClose: () => void;
    trialData?: any
    getCutomer: () => void
};

interface ExtentTrialData {
    duration: string;
    endDate?: string;
}

const validationSchema = Yup.object({
    duration: Yup.string().required("duration is required"),
});

function ExtentTrail({ onClose, trialData, getCutomer }: Props) {
    const { request: extendTrial } = useApi('post', 3001)
    const {setPostLoading}=useResponse()
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        clearErrors
    } = useForm<ExtentTrialData>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit: SubmitHandler<ExtentTrialData> = async (data) => {
        const body = {
            duration: data.duration
        }
        try {
            setPostLoading(true)
            const { response, error } = await extendTrial(`${endPoints.TRIAL}/${trialData?.customerData?._id}`, body)
            if (response && !error) {
                toast.success(response.data.message)
                onClose()
                getCutomer()
            } else {
                toast.error(error.response.data.message)
            }
        } catch (err) {
            console.log(err);

        }
        finally{
            setPostLoading(false)
          }
    };




    useEffect(() => {
        const duration = watch("duration"); // Get the current duration value
        console.log(duration);

        if (duration && trialData?.customerData?.endDate) {
            const startDate = new Date(trialData?.customerData?.endDate); // Convert endDate string to Date

            // Ensure startDate is a valid date
            if (!isNaN(startDate.getTime())) {
                const newEndDate = new Date(startDate);
                newEndDate.setDate(startDate.getDate() + parseInt(duration)); // Add duration days

                // Format newEndDate back to "YYYY-MM-DD"
                const formattedDate = newEndDate.toISOString().split("T")[0];
                console.log("dsds", formattedDate);

                setValue("endDate", formattedDate);
            } else {
                console.error("Invalid startDate:", trialData?.customerData?.endDate);
            }
        }
    }, [watch("duration"), trialData]);



    const handleInputChange = (field: keyof ExtentTrialData) => {
         clearErrors(field); // Clear the error for the specific field when the user starts typing
    };





    return (
        <div className="p-2 bg-white rounded shadow-md space-y-2">
            <div className="p-2 space-y-1 text-[#4B5C79] py-2 w-[100%]">
                <div className="flex justify-between p-2">
                    <div>
                        <h3 className="text-[#303F58] font-bold text-lg">Extent Trail</h3>
                        <p className="text-[11px] text-[#8F99A9] mt-1">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt.
                        </p>
                    </div>
                    <p onClick={onClose} className="text-3xl cursor-pointer">
                        &times;
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div >

                        <div className="my-2">
                            <div className="mx-3 gap-4 space-y-2 max-w-xl">
                                <Select
                                    label="Duration"
                                    required
                                    value={watch("duration")}
                                    placeholder="Select Duration"
                                    error={errors.duration?.message}
                                    options={[
                                        { value: "1", label: "1 day" },
                                        { value: "2", label: "2 days" },
                                        { value: "3", label: "3 days" },
                                        { value: "4", label: "4 days" },
                                        { value: "5", label: "5 days" },
                                        { value: "6", label: "6 days" },
                                        { value: "7", label: "7 days" },
                                    ]}
                                    onChange={(selectedValue)=>{
                                        handleInputChange("duration")
                                        setValue("duration",selectedValue)
                                    }}
                                />

                                <Input
                                    readOnly
                                    label="New End Date"
                                    type="date"
                                    value={watch("endDate") || ""}
                                    placeholder="Select Duration to calculate End Date"
                                    error={errors.endDate?.message}
                                    {...register("endDate")}
                                />
                            </div>
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
                        >
                            Extend
                        </Button>
                    </div>
                </form>

            </div>

        </div>

    );
}

export default ExtentTrail;
