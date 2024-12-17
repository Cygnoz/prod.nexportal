
type Props = {
    size?:number;
    color?:string;
}

const AwardIcon = ({size=32, color="white"}: Props) => {
  return (
<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.00016 8.00033L7.3335 9.33366L10.0002 6.66699M2.5668 5.74706C2.46949 5.30874 2.48443 4.85295 2.61023 4.42195C2.73604 3.99095 2.96863 3.59869 3.28644 3.28154C3.60425 2.96439 3.997 2.73262 4.42827 2.60772C4.85953 2.48282 5.31535 2.46883 5.75346 2.56706C5.9946 2.18992 6.3268 1.87956 6.71943 1.66458C7.11206 1.4496 7.55249 1.33691 8.00013 1.33691C8.44776 1.33691 8.8882 1.4496 9.28083 1.66458C9.67346 1.87956 10.0057 2.18992 10.2468 2.56706C10.6856 2.46841 11.1422 2.48233 11.5741 2.60753C12.0061 2.73274 12.3994 2.96515 12.7174 3.28316C13.0354 3.60117 13.2678 3.99444 13.393 4.42639C13.5182 4.85834 13.5321 5.31494 13.4335 5.75372C13.8106 5.99486 14.121 6.32706 14.3359 6.71969C14.5509 7.11232 14.6636 7.55276 14.6636 8.00039C14.6636 8.44802 14.5509 8.88846 14.3359 9.28109C14.121 9.67372 13.8106 10.0059 13.4335 10.2471C13.5317 10.6852 13.5177 11.141 13.3928 11.5723C13.2679 12.0035 13.0361 12.3963 12.719 12.7141C12.4018 13.0319 12.0096 13.2645 11.5786 13.3903C11.1476 13.5161 10.6918 13.531 10.2535 13.4337C10.0126 13.8123 9.68018 14.124 9.28688 14.3399C8.89358 14.5559 8.45215 14.6691 8.00346 14.6691C7.55478 14.6691 7.11335 14.5559 6.72004 14.3399C6.32674 14.124 5.99429 13.8123 5.75346 13.4337C5.31535 13.5319 4.85953 13.518 4.42827 13.3931C3.997 13.2682 3.60425 13.0364 3.28644 12.7192C2.96863 12.4021 2.73604 12.0098 2.61023 11.5788C2.48443 11.1478 2.46949 10.692 2.5668 10.2537C2.18677 10.0132 1.87374 9.68051 1.65683 9.28653C1.43992 8.89256 1.32617 8.45013 1.32617 8.00039C1.32617 7.55065 1.43992 7.10822 1.65683 6.71425C1.87374 6.32027 2.18677 5.98756 2.5668 5.74706Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  )
}

export default AwardIcon