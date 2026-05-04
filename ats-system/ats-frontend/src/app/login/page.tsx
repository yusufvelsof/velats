'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { Eye, EyeOff, Loader2, ShieldCheck, Briefcase, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log("Login response:", response);
      console.log("Token:", response.data.access_token);
      
      localStorage.setItem('token', response.data.access_token);
      console.log("Token saved:", localStorage.getItem("token"));
      
      console.log("Redirecting to dashboard...");
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Branding & Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col items-start">
          <div className="mb-10">
            <div className="-ml-6 flex items-center">
              <Image src="/logo.png" alt="Velocity Logo" width={140} height={140} className="object-contain" priority />
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Hire faster, <br /> 
            <span className="text-blue-500">smarter</span>, and better.
          </h2>
          <p className="text-gray-400 text-lg max-w-md font-medium">
            The all-in-one platform to manage your hiring pipeline, candidates, and job postings with ease.
          </p>
        </div>

        <div className="relative z-10 flex flex-col space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center space-x-3 text-gray-300">
              <ShieldCheck className="text-blue-500" size={24} />
              <span className="text-sm font-semibold">Secure Portal</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Zap className="text-blue-500" size={24} />
              <span className="text-sm font-semibold">Real-time Sync</span>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} Velocity Software Solutions Pvt. Ltd.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-4 object-contain" priority />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 font-medium">Sign in to your administrator account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm border border-red-100 flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="font-bold mr-2">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                required
                className="w-full transition-all duration-200 !bg-white !text-black border-gray-300"
                placeholder="hr@velsof.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pr-12 transition-all duration-200 !bg-white !text-black border-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98] disabled:bg-gray-400 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Need assistance? <button className="text-gray-900 font-bold hover:underline">Contact Support</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
