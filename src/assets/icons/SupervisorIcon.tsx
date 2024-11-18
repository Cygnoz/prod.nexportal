type Props = {
  color?: string;
  width?: number;
};

const SupervisorIcon = ({ color, width }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="24"
      viewBox="0 0 18 24"
      fill="none"
      stroke={color ? color : "currentColor"}
      strokeWidth={width ? width : 1.5}
    >
      <path
        d="M8.94219 8.61587C9.68627 8.61587 10.4136 8.39254 11.0323 7.97412C11.651 7.5557 12.1332 6.96098 12.4179 6.26517C12.7027 5.56936 12.7772 4.80371 12.632 4.06505C12.4869 3.32638 12.1286 2.64787 11.6024 2.11532C11.0763 1.58277 10.4059 1.2201 9.67615 1.07317C8.94636 0.92624 8.18992 1.00165 7.50248 1.28986C6.81504 1.57808 6.22748 2.06615 5.81409 2.69236C5.4007 3.31857 5.18005 4.0548 5.18005 4.80794C5.18005 5.81787 5.57642 6.78643 6.28196 7.50056C6.9875 8.21468 7.94441 8.61587 8.94219 8.61587ZM8.94219 1.84621C9.52092 1.84621 10.0867 2.01991 10.5678 2.34535C11.049 2.67079 11.4241 3.13335 11.6456 3.67453C11.867 4.21572 11.925 4.81122 11.8121 5.38574C11.6992 5.96026 11.4205 6.48799 11.0113 6.9022C10.602 7.3164 10.0807 7.59848 9.51304 7.71276C8.94544 7.82704 8.35709 7.76838 7.82242 7.54422C7.28774 7.32005 6.83075 6.94044 6.50922 6.45339C6.1877 5.96633 6.01608 5.39371 6.01608 4.80794C6.01608 4.02244 6.32437 3.26911 6.87312 2.71368C7.42187 2.15825 8.16614 1.84621 8.94219 1.84621Z"
        fill={color ? color : "#F7E7CE"}
        stroke={color ? color : "#F7E7CE"}
      />
      <path
        d="M2.05263 23H15.9474C16.2265 23 16.4943 22.9012 16.6917 22.7254C16.8891 22.5496 17 22.3111 17 22.0625V15.575C16.9989 14.3619 16.4573 13.1988 15.4942 12.3411C14.5311 11.4833 13.2252 11.001 11.8632 11H6.13684C4.77481 11.001 3.46888 11.4833 2.50578 12.3411C1.54267 13.1988 1.00112 14.3619 1 15.575V22.0625C1 22.3111 1.1109 22.5496 1.30831 22.7254C1.50572 22.9012 1.77346 23 2.05263 23ZM8.50316 13.55C8.66335 13.598 8.831 13.6233 9 13.625C9.16897 13.623 9.33656 13.5977 9.49684 13.55L10.6505 17.3L9 19.6663L7.34947 17.315L8.50316 13.55ZM9.8421 12.125C9.8421 12.3239 9.75338 12.5147 9.59546 12.6553C9.43753 12.796 9.22334 12.875 9 12.875C8.85225 12.8749 8.70715 12.8401 8.57925 12.7742C8.45135 12.7083 8.34517 12.6137 8.27136 12.4997C8.19755 12.3857 8.15872 12.2564 8.15876 12.1248C8.1588 11.9932 8.19771 11.864 8.27158 11.75H9.72842C9.80263 11.8639 9.84184 11.9933 9.8421 12.125ZM1.84211 15.575C1.84211 14.5605 2.29459 13.5876 3.1 12.8703C3.90542 12.153 4.99781 11.75 6.13684 11.75H7.37474C7.33835 11.8725 7.31856 11.9984 7.31579 12.125C7.31813 12.4991 7.47731 12.8588 7.7621 13.1338L6.49895 17.2587C6.48343 17.3083 6.47954 17.3602 6.4875 17.4112C6.49547 17.4621 6.51513 17.5111 6.54526 17.555L8.65053 20.555C8.68829 20.6093 8.74098 20.654 8.80361 20.6851C8.86624 20.7162 8.93674 20.7325 9.00842 20.7325C9.0801 20.7325 9.1506 20.7162 9.21323 20.6851C9.27586 20.654 9.32855 20.6093 9.36631 20.555L11.4716 17.555C11.5017 17.5111 11.5214 17.4621 11.5293 17.4112C11.5373 17.3602 11.5334 17.3083 11.5179 17.2587L10.2547 13.1338C10.5334 12.8566 10.6865 12.4971 10.6842 12.125C10.6814 11.9984 10.6617 11.8725 10.6253 11.75H11.8632C12.4271 11.75 12.9856 11.8489 13.5067 12.0412C14.0277 12.2334 14.5012 12.5151 14.9 12.8703C15.2988 13.2255 15.6151 13.6472 15.831 14.1112C16.0468 14.5753 16.1579 15.0727 16.1579 15.575V22.0625C16.1579 22.1122 16.1357 22.1599 16.0962 22.1951C16.0568 22.2302 16.0032 22.25 15.9474 22.25H2.05263C1.9968 22.25 1.94325 22.2302 1.90377 22.1951C1.86429 22.1599 1.84211 22.1122 1.84211 22.0625V15.575Z"
        fill={color ? color : "#F7E7CE"}
        stroke={color ? color : "#F7E7CE"}
        strokeWidth={0.7}
      />
    </svg>
  );
};

export default SupervisorIcon;
