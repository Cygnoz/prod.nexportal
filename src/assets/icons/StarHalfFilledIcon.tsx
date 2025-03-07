

type Props = {
  color?: string;
  size?: number;
};

const StarHalfFilledIcon = ({ color = '#FFCC00', size = 24 }: Props) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Half Filled Star */}
      <path
        d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.3275L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z"
        fill="#ECE6E6" /* Default empty star color */
        stroke="#ECE6E6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 1.5V13.3275L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z"
        fill={color} /* Half-filled with color */
        stroke="#FFCC00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StarHalfFilledIcon;
