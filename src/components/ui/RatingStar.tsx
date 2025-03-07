import React from 'react';
import StarFilled from '../../assets/icons/StarFilled';
import StarNotFilled from '../../assets/icons/StarNotfilled';
import StarHalfFilled from '../../assets/icons/StarHalfFilledIcon'; // Add a half-filled star icon

type Props = {
  count: number; // Allow decimal values
  size?: number;
};

const RatingStar: React.FC<Props> = ({ count = 0, size = 24 }) => {
  const totalStars = 5;
  const fullStars = Math.floor(count);
  const hasHalfStar = count % 1 !== 0; // Check if there's a fractional part

  return (
    <div className='flex items-center gap-2'>
      {Array.from({ length: totalStars }, (_, index) => {
        if (index < fullStars) {
          return <StarFilled size={size} key={index} />;
        } else if (index === fullStars && hasHalfStar) {
          return <StarHalfFilled size={size} key={index} />;
        } else {
          return <StarNotFilled size={size} key={index} />;
        }
      })}
    </div>
  );
};

export default RatingStar;
