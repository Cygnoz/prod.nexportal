type Props = { isRead: boolean };

const TickMark = ({ isRead }: Props) => {
  return (
    <div >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* First tick (Always visible, darker gray for better contrast) */}
        <path
          d="M4 12L8 16L16 8"
          stroke={isRead ? "#0E78D8" : "#6C757D"} // Dark blue for read, darker gray for unread
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Second tick (Only visible when isRead is true, slightly shifted) */}
        {isRead && (
          <path
            d="M7 12L11 16L19 8"
            stroke="#0E78D8" // Dark blue for read
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export default TickMark;
