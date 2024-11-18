interface Props {
  color?: string;
  width?: number;
  height?: number;
}

const SettingsIcon= ({ color, width = 18, height = 20 }:Props) => {
  return (
    <svg width={width} height={height} viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.18334 1.66699H8.81667C8.37464 1.66699 7.95072 1.84259 7.63816 2.15515C7.3256 2.46771 7.15 2.89163 7.15 3.33366V3.48366C7.1497 3.77593 7.07255 4.06298 6.92628 4.31602C6.78002 4.56906 6.56978 4.77919 6.31667 4.92533L5.95834 5.13366C5.70497 5.27994 5.41756 5.35695 5.125 5.35695C4.83244 5.35695 4.54503 5.27994 4.29167 5.13366L4.16667 5.06699C3.78422 4.84638 3.32987 4.78653 2.90334 4.90058C2.47681 5.01464 2.11296 5.29327 1.89167 5.67533L1.70833 5.99199C1.48772 6.37444 1.42787 6.8288 1.54192 7.25532C1.65598 7.68185 1.93461 8.0457 2.31667 8.26699L2.44167 8.35033C2.69356 8.49575 2.90302 8.70457 3.04921 8.95602C3.1954 9.20747 3.27325 9.4928 3.275 9.78366V10.2087C3.27617 10.5023 3.19971 10.7911 3.05337 11.0457C2.90703 11.3004 2.69601 11.5118 2.44167 11.6587L2.31667 11.7337C1.93461 11.955 1.65598 12.3188 1.54192 12.7453C1.42787 13.1719 1.48772 13.6262 1.70833 14.0087L1.89167 14.3253C2.11296 14.7074 2.47681 14.986 2.90334 15.1001C3.32987 15.2141 3.78422 15.1543 4.16667 14.9337L4.29167 14.867C4.54503 14.7207 4.83244 14.6437 5.125 14.6437C5.41756 14.6437 5.70497 14.7207 5.95834 14.867L6.31667 15.0753C6.56978 15.2215 6.78002 15.4316 6.92628 15.6846C7.07255 15.9377 7.1497 16.2247 7.15 16.517V16.667C7.15 17.109 7.3256 17.5329 7.63816 17.8455C7.95072 18.1581 8.37464 18.3337 8.81667 18.3337H9.18334C9.62536 18.3337 10.0493 18.1581 10.3618 17.8455C10.6744 17.5329 10.85 17.109 10.85 16.667V16.517C10.8503 16.2247 10.9275 15.9377 11.0737 15.6846C11.22 15.4316 11.4302 15.2215 11.6833 15.0753L12.0417 14.867C12.295 14.7207 12.5824 14.6437 12.875 14.6437C13.1676 14.6437 13.455 14.7207 13.7083 14.867L13.8333 14.9337C14.2158 15.1543 14.6701 15.2141 15.0967 15.1001C15.5232 14.986 15.887 14.7074 16.1083 14.3253L16.2917 14.0003C16.5123 13.6179 16.5721 13.1635 16.4581 12.737C16.344 12.3105 16.0654 11.9466 15.6833 11.7253L15.5583 11.6587C15.304 11.5118 15.093 11.3004 14.9466 11.0457C14.8003 10.7911 14.7238 10.5023 14.725 10.2087V9.79199C14.7238 9.49831 14.8003 9.20953 14.9466 8.9549C15.093 8.70027 15.304 8.48883 15.5583 8.34199L15.6833 8.26699C16.0654 8.0457 16.344 7.68185 16.4581 7.25532C16.5721 6.8288 16.5123 6.37444 16.2917 5.99199L16.1667 5.91699C15.9127 5.7706 15.6252 5.69363 15.2821 5.79302C14.939 5.89242 14.649 6.16468 14.4667 6.50033"
        stroke={color ? color : "#F7E7CE"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SettingsIcon;
