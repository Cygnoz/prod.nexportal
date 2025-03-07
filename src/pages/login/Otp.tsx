import React, { useState, useRef, useEffect } from 'react';
import Button from "../../components/ui/Button";
import { useNavigate, useLocation } from 'react-router-dom';
import toast  from 'react-hot-toast';
import axios from 'axios';
import useApi from '../../Hooks/useApi';
import { endPoints } from '../../services/apiEndpoints';
import LoginBgRight from './LoginBgRight';
import { useUser } from '../../context/UserContext';

type Props = {}

function Otp({}: Props) {
  const {setUser}=useUser()
  const navigate = useNavigate();
  const location = useLocation();
  const { request: verifyOtp } = useApi("post", 3003);
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Extract email from location state or set a default for testing purposes
  const email = location.state?.email || '';

  useEffect(()=>{
    if(!email){
      navigate('*')
    }
  },[email])

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Handle OTP change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < inputRefs.length - 1) {
        inputRefs[index + 1].current?.focus();
      }
    } else if (value === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  // Handle backspace key for OTP inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0) {
          inputRefs[index - 1].current?.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle OTP paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteOtp = pasteData.split('');
      setOtp(pasteOtp);
      pasteOtp.forEach((digit, index) => {
        if (inputRefs[index].current) {
          inputRefs[index].current!.value = digit;
        }
      });
      inputRefs[5].current?.focus();
    }
    e.preventDefault();
  };

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // setRole('superAdmin')
    // navigate('/dashboard');
    const enteredOtp = otp.join('');
    try {
      // Send the OTP verification request
      const result = await verifyOtp(endPoints.GET_OTP, { email, otp: enteredOtp });
  
      if (result?.response) {
        // OTP verified successfully
        const successMessage = result.response.data?.message || 'OTP verified successfully!';
        sessionStorage.setItem('authToken', result.response.data.token);
        console.log("user",result.response.data.user);
        
        setUser(result.response.data.user)
        setTimeout(() => {
          setIsLoading(false)
          navigate('/dashboard')
        }, 2000);
        setTimeout(() => {
          toast.success(successMessage);
        }, 1000);
        // Save the token and update the authentication state
      } else {
        // Handle error response
        const errorMessage = result.error?.response?.data?.message || 'OTP verification failed.';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false)
        // setTimeout(() => {
        //   navigate('/')
        // }, 1000);
      }
    } catch (error) {
      // Handle exceptions (e.g., network errors)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const fallbackMessage = 'OTP verification failed. Please try again.';
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    }
  };
  

  return (
    <div className="h-[100vh] max-md:h-auto grid grid-cols-2 max-md:grid-cols-1 text-[#303F58]">
      {/* Left Side */}
      <div className=" flex justify-center items-center bg-white max-md:h-[100vh]">
      <div className='max-md:mx-2'>
          <p className="text-textColor font-bold text-4xl">Get Started now</p>
          <p className="text-dropdownText mt-2 text-sm font-normal">Enter your OTP to access your account</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* OTP Input Section */}
            <div className="mt-4 space-y-2">
              <label htmlFor="otp" className="text-dropdownText text-sm block">
                Enter OTP
              </label>
              <div className="flex justify-between w-full gap-2">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp${index}`}
                    id={`otp${index}`}
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={inputRefs[index]}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    className="text-sm w-[60px] max-[420px]:w-[50px] rounded-md text-center mt-1.5 bg-white border border-inputBorder h-[47px] focus:outline-none focus:bg-white focus:border-darkRed"
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {/* Submit Button */}
              <div className="flex justify-center mx-2">
                <Button type="submit" className="px-[45%] mt-7">
                  {isLoading ? 'Verifying...' : 'Submit'}
                </Button>
              </div>
            </div>
          </form>
        </div>
        </div>

      {/* Right Side with Background Image */}
    <LoginBgRight/>
    </div>
  );
}

export default Otp;
