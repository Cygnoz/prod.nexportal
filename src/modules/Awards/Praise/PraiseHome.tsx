import { useEffect, useState } from "react"
import Modal from "../../../components/modal/Modal"
import Button from "../../../components/ui/Button"
import PraiseForm from "./PraiseForm"
import comfetti from '../../../assets/image/confetti.png'

import { themes } from "../../../Interfaces/Praise"
import { achievements } from "../../../Interfaces/Praise"
import { endPoints } from "../../../services/apiEndpoints"
import useApi from "../../../Hooks/useApi"
import NoRecords from "../../../components/ui/NoRecords"
import partyPopper from '../../../assets/image/partyPopper.png'
import BackgroundImage from "../../../assets/image/banner-praisal.png"
type Props = {}

const PraiseHome = ({ }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { request: getAllPraise } = useApi('get', 3004)
  const [allPraise, setAllPraise] = useState<any[]>([])

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
    getPraises()
  };

  // const [allPraise, setAllPraise] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const getPraises = async () => {
    //setIsLoading(true); // Set loading to true before fetching data
    const url = endPoints.GET_ALL_PRAISE;

    try {
      const { response, error } = await getAllPraise(url);
      if (response && !error) {
        console.log("Praises:", response.data.praises);
        setAllPraise(response.data.praises.reverse());
      

      } else {
        console.log("Error fetching praises:", error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
    setIsLoading(false); // Ensure loading is set to false after fetching
    }
  };

  useEffect(() => {
    getPraises();
  }, []);



  const renderSkelton = () => (
    <div className="w-full  p-4 bg-gray-100 rounded-lg shadow-md">

      <div className="flex items-center  gap-2 mb-2">
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-300 rounded-lg animate-pulse"></div>
        <div className=" text-right flex items-center justify-end  ms-auto ">
          <div className="h-4 w-20 bg-gray-300 rounded-lg inline-block animate-pulse"></div>
          <div className="h-3 w-16 bg-gray-300 rounded-lg inline-block  animate-pulse"></div>
        </div>
      </div>


      <div className="flex justify-center py-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-2 text-center">
        <div className="h-6 w-32 bg-gray-300 rounded-lg mx-auto animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-300 rounded-lg mx-auto animate-pulse"></div>
        <div className="h-4 w-40 bg-gray-300 rounded-lg mx-auto animate-pulse"></div>
      </div>

      <div className="mt-4 text-right flex items-center justify-end  ms-auto">
        <div className="h-4 w-20 bg-gray-300 rounded-lg inline-block animate-pulse"></div>
        <div className="h-3 w-16 bg-gray-300 rounded-lg inline-block  animate-pulse"></div>
      </div>

    </div>
  )

  return (
    <>
     <div className="h-[950px] mb-5">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
         <h1 className="text-[#303F58] text-xl font-bold">Praise</h1>
          <p className="text-ashGray text-sm max-sm:hidden">
          Recognition or appreciation for achievements and contributions. 
            </p>
         </div>
          <Button variant="primary" size="sm" onClick={handleModalToggle}>
            <span className="font-bold text-xl">+</span> Create Praise
          </Button>
        </div>

  <div className="mt-8">
    <div
      className="grid grid-cols-1 sm:grid-cols-12 relative rounded-b-2xl gap-6 bg-cover"
      style={{
        backgroundImage: `url(${BackgroundImage})`, // Use the imported image
      }}
    >
      <div className="col-span-1 sm:col-span-6 ms-14 mt-6">
        <p className="my-3 text-[#303F58] text-base font-semibold">
          Send Praise to Team
        </p>
        <p className="mb-4 text-[#8A8B8B] text-base font-normal mt-7">
          Celebrate the outstanding <br /> contributions of your team and <br />
          colleagues, fostering a positive and <br /> collaborative work environment.
        </p>
      </div>

      <div className="mt-5 absolute right-[30%] top-24 sm:right-10 sm:top-24">
        <Button onClick={handleModalToggle} className="rounded-lg w-40 h-8">
          <p className="ms-7">Send Praise</p>
        </Button>
      </div>
    </div>
  </div>

  <div>
    <div className="py-4">
      <p className="text-[#303F58] text-base font-bold">Praise History</p>
    </div>

    {isLoading ? (
      // Show Skeleton Loader while data is loading
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="mb-4">{renderSkelton()}</div>
        ))}
      </div>
    ) : allPraise.length > 0 ? (
      // Render Praise Cards
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
        {allPraise.map((praise) => (
           <div
           key={praise.id || praise.userId}
           className={`${themes.find((theme) => theme.name === praise.theme)?.bgColor || ''} 
             rounded-lg justify-between w-full h-52 relative`}
         >
            <div className="flex justify-between">
              <div className="bg-[#F3F3F3] rounded-2xl w-fit h-12 p-3 ms-4 mt-4 flex gap-2">
              <div className="bg-[#EDE7FB] rounded-full w-8 h-8 -mt-1">
                <div className="p-[6px] ms-[2px]">
                  {achievements.find((achievement) => achievement.name === praise.achievement)?.icon || ''}
                </div>
              </div>
                <div>
                  <p className="text-center">
                    {achievements.find((achievement) => achievement.name === praise.achievement)?.name || ''}
                  </p>
                </div>
              </div>
              <div className="-ms-16 top-0 right-0">
              <img className="w-full h-48 -rotate-90 opacity-30" src={comfetti} alt="Confetti" />
              <img className="w-20 h-20 -mt-24 ms-10 opacity-30" src={partyPopper} alt="" />
            </div>
            <div className="p-8">
              <p className="text-[#000000] text-sm font-normal my-1">{praise.achievement}</p>
              <p className="text-[#000000] text-sm font-semibold mb-1">{praise.userDetails[0]?.userName}</p>
              <p className="text-[#000000] text-sm font-normal mb-1">{praise.notes}</p>
            </div>
            </div>
            <div className="flex justify-between px-8 -mt-4">
              <p className="text-[#000000] text-sm font-normal">
                {praise.openingDate ? new Date(praise?.openingDate).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-[#000000] text-sm font-normal">From {praise.userId}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      // Show No Data Found when fetching is complete but no praises exist (Centered)
      <div className="flex items-center justify-center min-h-[500px]">
        <NoRecords text="No Praise Found" parentHeight="430px" imgSize={90} textSize="lg" />
      </div>
    )}
  </div>
</div>

      {/* Modal Section */}
      <Modal  open={isModalOpen} onClose={handleModalToggle} className="w-[65%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]  max-sm:h-[500px]  max-sm:overflow-auto">
        <PraiseForm onClose={handleModalToggle} />
      </Modal>
    </>

  )
}

export default PraiseHome 