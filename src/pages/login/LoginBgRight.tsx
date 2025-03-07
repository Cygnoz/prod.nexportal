import LoginBack from "../../assets/image/LoginBack.jpg";
import LoginPie from '../../assets/image/LoginPie.png';
import LoginDash from '../../assets/image/LoginPortalDash.png';
type Props = {}

function LoginBgRight({}: Props) {
  return (
     <>
     <div style={{backgroundImage:`url(${LoginBack})`}}   className="bg-cover text-white flex justify-center items-center relative overflow-x-hidden max-md:hidden">
     <img src={LoginDash} alt="Dashboard preview" className=" w-[220px] h-[150px] right-10 top-72 rounded-xl absolute blur-sm"/>
     <img src={LoginPie} alt="Dashboard preview" className=" w-[92px] h-[85px]  left-32 top-[350px] rounded-lg absolute blur-sm"/>
        <div  className="flex flex-col items-start justify-center w-[82%] h-full p-8 ">
       
            <div className='ms-[14%]'>
          <h2 className="text-textColor font-semibold text-3xl leading-tight mt-6">Customer Success, Simplified</h2>
          <p className="text-textColor mt-3 text-sm pb-7">Empower your team to deliver exceptional customer experiences</p>
          <div className='relative mt-8'>
          <img src={LoginDash} alt="Dashboard preview" className=" w-[500px] h-[350px] rounded-xl"/>
          <img src={LoginPie} alt="Dashboard preview" className=" w-[170px] h-[160px] -bottom-9 left-10 rounded-lg absolute"/>
          
          {/* <img src={LoginNex} alt="Dashboard preview" className=" absolute w-[72px] h-[28px] -top-2 -right-2 rounded-lg"/> */}
          </div>
            </div>
         
        </div>
      </div>
     </>
  )
}

export default LoginBgRight