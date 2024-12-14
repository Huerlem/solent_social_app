"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '../../firebase/firebaseFunctions';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName ] = useState ('');
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleNameChange = (e) => setName(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if(isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password, name);
            }
            //redirect to home page after successful login/registration
            router.push('/');
        } catch (error) {
            console.error('Failed to login!');
            alert('Failed to try to login!')
        }
    };

    const toggleLogin = () => {
        setIsLogin(!isLogin);
    };

    return (

        <div className="container mx-auto p-8 bg-purple-100 shadow-sm rounded-lg w-96 mt-10 md:mt-20">
            <h1 className="text-3xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={handleSubmit} className="mx-auto"> 
                {!isLogin && (
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-bold mb-2"></label>
                        <input 
                            type="text" 
                            id="name" 
                             placeholder='Name...'
                            value={name} 
                            onChange={handleNameChange} 
                            required 
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        />
                    </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-bold mb-2"></label>
                        <input 
                            type="email" 
                            id="email" 
                             placeholder='Email...'
                            value={email} 
                            onChange={handleEmailChange} 
                            required 
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        />
                        </div>
                        <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2"></label>
                        <input 
                            type="password" 
                            id="password" 
                             placeholder='Password...'
                            value={password} 
                            onChange={handlePasswordChange} 
                            required 
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        />
                        </div>
                        <div className="flex flex-col items-center justify-between">
                        <button 
                            type="submit" 
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                        </div>
                    </form>
                    <p className="text-center mt-6">
                        {isLogin ? 'Need to create an account?' : 'Already have an account?'}
                        <button 
                        onClick={toggleLogin} 
                        className="text-purple-500 hover:text-purple-700 font-bold"
                        >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
        </div>
    );
    
}