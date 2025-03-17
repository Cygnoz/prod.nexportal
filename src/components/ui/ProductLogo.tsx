import bilbizz from "../../assets/image/bilbizzprdLogo.png";
import salonex from "../../assets/image/Salonexlogo.png";
import sewnex from "../../assets/image/SewnexLogo.png";
import sixnexd from "../../assets/image/sixNexdLogo.png";
import NoImage from "./NoImage";
type Props = {
    projectName:string
    size?:number
}

function ProductLogo({projectName,size=10}: Props) {
    const projectImages: Record<string, string> = {
        BillBizz: bilbizz,
        SewNex: sewnex,
        SaloNex: salonex,
        "6NexD": sixnexd,
      };
    
      // Get the image based on projectName, default to an empty string if not found
      const projectImage = projectImages[projectName] || "";
  return (
    <>
    {
        projectName?
        <img src={projectImage} alt={projectName} className={` h-${size} w-${size} object-contain`} />:
        <NoImage />
    }
    </>
  )
}

export default ProductLogo