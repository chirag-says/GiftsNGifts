import React, { useContext, useState } from 'react';
import { Admincontext } from '../../Components/context/admincontext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const { backendurl, setatoken } = useContext(Admincontext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const { data } = await axios.post(backendurl + '/api/seller/register', {
          name,
          email,
          password,
          nickName,
        });

        if (data.success) {
          localStorage.setItem('stoken', data.token);
          localStorage.setItem('name', data.name);
          setatoken(data.token);
          toast.success('Registered successfully');
          navigate('/seller-profile');
        } else {
          toast.error(data.message || 'Registration failed');
        }
      } else {
        const { data } = await axios.post(backendurl + '/api/seller/login', {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem('stoken', data.token);
          localStorage.setItem('name', data.user.name);
          localStorage.setItem('nick name', data.user.nickName);
          setatoken(data.token);
          toast.success('Logged in successfully');
          navigate('/');
        } else {
          toast.error(data.message || 'Login failed');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen flex items-center justify-center !px-11 bg-gradient-to-br from-white to-gray-100"
    >
      <div className="!w-full max-w-lg bg-white rounded-xl shadow-xl p-10 animate-fade-in transition-all duration-300 ease-in-out">
        <h2 className="text-3xl font-[600] text-center text-black mb-8">
          {isRegister ? 'Create Seller Account' : 'Seller Login'}
        </h2>

        {isRegister && (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-gray-800 font-medium">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-gray-800 font-medium">Brand Name</label>
              <input
                type="text"
                required
                placeholder="Your seller brand"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-gray-800 font-medium">Email Address</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-800 font-medium">Password</label>
          <input
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-md font-semibold transition"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>

        <p className="text-center mt-6 text-sm text-gray-700">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-black font-medium cursor-pointer underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </form>
  );
}

export default Login;
