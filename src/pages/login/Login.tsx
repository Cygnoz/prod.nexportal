// File path: src/pages/Login.tsx
import { useEffect, useState } from 'react';
import Button from "../../components/ui/Button";
import Eye from '../../assets/icons/Eye';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { useNavigate } from 'react-router-dom';
import useApi from '../../Hooks/useApi';
import { endPoints } from '../../services/apiEndpoints';
import toast  from 'react-hot-toast';
import axios from 'axios';
import LoginBgRight from './LoginBgRight';

type Props = {}

function Login({}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { request: CheckLogin } = useApi("post", 3003);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (event: React.FormEvent) => {
    console.log("dssddd");
    
    event.preventDefault();
    setIsLoading(true);
    setError(""); // Reset the error message
    // navigate("/otp", { state: { email } });
    try {
      // Call the login API
      const result = await CheckLogin(endPoints.LOGIN, { email, password });
     
      // Log the result for debugging purposes
      console.log("Login response:", result);
  
      if (result?.response) {
        // Login is successful
        const successMessage = result.response?.data?.message || 'Login successful! Redirecting...';
        toast.success(successMessage);
  
        // Navigate to the OTP page, passing email as state
        navigate("/otp", { state: { email } });
      } else if (result?.error) {
        // Handle login failure
        const errorMessage = result.error?.response?.data?.message || "Invalid email or password";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Handle unexpected scenarios where neither response nor error is returned
        const fallbackMessage = "Unexpected error occurred. Please try again.";
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } catch (error) {
      // Handle exceptions (e.g., network issues)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const fallbackMessage = "An error occurred. Please try again.";
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  useEffect(()=>{
    sessionStorage.clear()
  },[])
  

  return (
    <div   className="h-[100vh] max-md:h-auto grid grid-cols-2 max-md:grid-cols-1   text-[#303F58]">
      <div className="flex justify-center items-center bg-white max-md:h-[100vh]">
        <div className='mx-2'>
          <p className="text-textColor font-bold text-4xl">Login into your account</p>
          <p className="text-dropdownText mt-2 text-sm font-normal">Enter your credentials to access your account</p>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="text-dropdownText text-sm">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-3 text-sm w-[100%] rounded-md text-start mt-1.5 bg-white border border-inputBorder h-[39px] leading-tight focus:outline-none focus:bg-white focus:border-darkRed"
                  placeholder="Enter Email"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-dropdownText text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-3 text-sm w-[100%] rounded-md text-start mt-1.5 bg-white border border-inputBorder h-[39px] leading-tight focus:outline-none focus:bg-white focus:border-darkRed"
                    placeholder="Password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="focus:outline-none mt-1"
                    >
                      {showPassword ? (
                        <EyeOffIcon color='#4B5C79'/>
                      ) : (
                        <Eye color='#4B5C79'/>
                      
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-center">
              <Button type="submit" className="px-[45%] mt-7" >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Right side with the bgImage */}
    
      
      <LoginBgRight/>
  
     
    </div>
  )
}

export default Login;
