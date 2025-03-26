import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/form/Input';
import toast from 'react-hot-toast';
import { endPoints } from '../../../services/apiEndpoints';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import useApi from '../../../Hooks/useApi';
import { Terms, LegalAndSecurity } from '../../../Interfaces/CMS';
import * as Yup from "yup";
import { useResponse } from '../../../context/ResponseContext';
import Select from '../../../components/form/Select';

type Props = { page?: string, id?: string, fetchData?: () => void }

function AddModal({ page, id, fetchData }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    reset()
    setModalOpen(false);
  };







  const { request: add } = useApi('post', 3001)
  const { request: getOneItem } = useApi('get', 3001)
  const { request: edit } = useApi('put', 3001)
  const { cmsMenu } = useResponse()

  const validationSchema = Yup.object().shape({
    termTitle: Yup.string().required("Title is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm<Terms>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type: page === "legal" ? "Legal Privacy" : "Security", // Set initial type based on page
      project: ''
    }
  });

  useEffect(() => {
    setValue("project", cmsMenu.selectedData)
    if (page === "legal") {
      setValue("type", "LegalPrivacy");
    } else if (page === "security") {
      setValue("type", "Security");
    }
  }, [page, setValue, cmsMenu]);




  const getOne = async () => {
    const { response, error } = await getOneItem(`${endPoints.TERMS}/${id}`)
    if (response && !error) {
      console.log("editresponse", response?.data.term);
      setFormValues(response?.data.term)
    }
  }


  const setFormValues = (data: LegalAndSecurity) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof LegalAndSecurity, data[key as keyof LegalAndSecurity]);
    });
  };

  useEffect(() => {
    if (id) {
      getOne()
    }
  }, [])
  const options = Array.from({ length: 30 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  const { setPostLoading } = useResponse()

  const onSubmit = async (data: LegalAndSecurity) => {
    console.log("Submitted Data:", data);

    try {
      setPostLoading(true)
      const endPoint =
        id
          ? `${endPoints.TERMS}/${id}`
          :
          endPoints.TERMS;

      const { response, error } =
        id
          ? await edit(endPoint, data)

          :
          await add(endPoint, data);

      if (response && !error) {
        toast.success(response.data.message);
        {
          fetchData &&
            fetchData();
        }
        reset()
        closeModal();
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPostLoading(false)
    }

  };
  const handleOrderChange = (value: string) => {
    setValue("order", value); // Directly update form state
  };

  return (
    <div>
      <div>
        {
          id ?
            <Button variant="tertiary" onClick={openModal}
              className="border border-[#565148] h-8 text-[15px]" size="sm"              >
              Edit
            </Button>
            :
            <Button onClick={openModal}
              className="border border-[#565148]" size="sm"                >
              <span className="font-bold text-xl">+</span>
              {
                page === "legal" ? "  Add Policy" : "Add Security"
              }
            </Button>
        }



        <Modal open={isModalOpen} onClose={closeModal} className="w-[90%] sm:w-[50%] text-start px-7 py-6">
          <div>
            <div className="flex justify-between items-center p-3">
              <h1 className="text-lg font-bold text-deepStateBlue">

                {id ?
                  `Edit ${page === "legal" ? "Policy" : "Security"}` :
                  `Add ${page === "legal" ? "Policy" : "Security"}`
                }
              </h1>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-600 text-3xl cursor-pointer hover:text-gray-900"
              >
                &times;
              </button>
            </div>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>

              <div className="grid grid-cols-1 gap-2 p-2">
                <Input
                  placeholder="Enter Category Name"
                  label=" Terms Title"
                  required
                  error={errors.termTitle?.message}
                  {...register("termTitle")}
                />
                <div className="my-2">
                  <Select
                    label="Select Order"
                    options={options}
                    value={watch("order")} // Get value from form state
                    onChange={handleOrderChange}
                  />
                </div>
                <Input
                  placeholder="Enter Description"
                  label="Term Description"
                  error={errors.termDescription?.message}
                  {...register("termDescription")}
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
    </div>
  )
}

export default AddModal