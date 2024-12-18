interface SuperVisorCardProps {
  title: string;
  subTitle: string;
  number: string | number;
  rating?: React.ReactNode;
  images?: React.ReactNode[]; // Array of images
}

const SuperVisorCards = ({
  title,
  subTitle,
  number,
  rating,
  images,
}: SuperVisorCardProps) => {
  return (
    <div className="flex justify-between items-start w-full p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
      {/* Title and Number */}
      <div>
        <h4 className="text-sm font-semibold text-[#303F58]">{title}</h4>
        <p className="text-xs font-medium text-[#8F99A9]">{subTitle}</p>
        <p className="text-[24px] mt-4 font-bold text-gray-900">{number}</p>
        {rating && <p className="ms-24 -mt-7">{rating}</p>}
        {images && (
        <div className="flex -space-x-2 justify-end ms-28 -mt-9">
          {images.map((image, index) => (
            <div key={index} className="w-10 h-10">
              {image}
            </div>
          ))}
        </div>
      )}

      </div>

      {/* Images Section */}
    </div>
  );
};

export default SuperVisorCards;
