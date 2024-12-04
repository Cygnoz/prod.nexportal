
type Props = {
    size?:number;
    color?:string;
}

const DeltaTech = ({size,color="white"}: Props) => {
  return (
<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3333 11.9999H12M8.00001 11.9999H8.66668M4.66668 11.9999H5.33334M1.33334 13.3333C1.33334 13.6869 1.47382 14.026 1.72387 14.2761C1.97392 14.5261 2.31305 14.6666 2.66668 14.6666H13.3333C13.687 14.6666 14.0261 14.5261 14.2762 14.2761C14.5262 14.026 14.6667 13.6869 14.6667 13.3333V5.33325L10 8.66659V5.33325L5.33334 8.66659V2.66659C5.33334 2.31296 5.19287 1.97382 4.94282 1.72378C4.69277 1.47373 4.35363 1.33325 4.00001 1.33325H2.66668C2.31305 1.33325 1.97392 1.47373 1.72387 1.72378C1.47382 1.97382 1.33334 2.31296 1.33334 2.66659V13.3333Z" stroke={color} stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  )
}

export default DeltaTech