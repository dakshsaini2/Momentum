import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Lock, Mail, User as UserIcon } from "lucide-react";
import { api } from "../api";
import { useAuthStore } from "../stores/useAuthStore";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data?.data) {
        setAuth(res.data.data.user, res.data.data.tokens.accessToken);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-white border border-[#E6E8EC] rounded-[12px] p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-[8px] bg-[#176B5B] flex items-center justify-center mx-auto text-white shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-[#172033]">Create Momentum Account</h1>
          <p className="text-xs text-[#667085]">Join the intelligent productivity operating system.</p>
        </div>

        {error && (
          <div className="p-3 rounded-[6px] bg-[#FDECEC] border border-[#C94A4A]/20 text-[#C94A4A] text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="saas-input w-full pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saas-input w-full pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="saas-input w-full pl-9"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 text-xs shadow-xs flex items-center justify-center gap-2"
          >
            <span>{isLoading ? "Creating..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-center text-[#667085]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#176B5B] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
