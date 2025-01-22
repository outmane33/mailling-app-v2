import { useState } from "react";
import { LockKeyhole, Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Login = () => {
  const { isLogin, login } = useAuthStore();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formState);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5 bg-fixed bg-cover bg-center" />

      <div className="relative w-full max-w-md px-8 py-12 mx-4">
        {/* Decorative Elements */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-xl animate-pulse delay-700" />

        <div className="relative overflow-hidden backdrop-blur-sm border border-gray-800 bg-gray-900/70 rounded-2xl shadow-xl">
          <div className="p-8">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h1 className="text-sm uppercase text-blue-400 tracking-wider font-medium">
                Welcome Back
              </h1>
              <h2 className="text-3xl font-bold text-white">
                Login to Your Account
                <span className="inline-block animate-bounce text-blue-500 ml-1">
                  .
                </span>
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 ease-in-out text-white"
                      placeholder="you@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formState.password}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 ease-in-out text-white"
                      placeholder="••••••••"
                    />
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                ></a>
                <button
                  type="submit"
                  disabled={isLogin}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed
                           transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                           active:translate-y-0 flex items-center gap-2"
                >
                  {isLogin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
