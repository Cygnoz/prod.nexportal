
type Props = {
    size?:number;
    color?:string;
}

const LogoutIcon = ({size=14, color}: Props) => {
  return (
<svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 13H2.33333C1.97971 13 1.64057 12.8595 1.39052 12.6095C1.14048 12.3594 1 12.0203 1 11.6667V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H5M9.66667 10.3333L13 7M13 7L9.66667 3.66667M13 7H5" 
stroke={color?color:"#768294"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  )
}

export default LogoutIcon