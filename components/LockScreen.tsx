import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LockScreenProps {
  onSuccess: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === 'HuongDiepp') {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div 
      id="lock-screen-container"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-[#a8c3d4] via-[#dbd6df] to-[#eec6c7] animate-in fade-in duration-700"
    >
      <div className="w-full max-w-sm px-6">
        <div 
          id="password-box"
          className={`bg-white/30 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-xl text-center transform transition-all duration-500 ${error ? 'animate-shake' : ''}`}
        >
          <form onSubmit={handleSubmit} className="relative group max-w-[280px] mx-auto">
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="enter password"
              autoFocus
              className={`w-full bg-white/40 border-none rounded-2xl py-3.5 pl-5 pr-14 focus:outline-none focus:ring-1 focus:ring-[#db88a4]/30 transition-all text-[#334155] placeholder:text-[#94a3b8]/50 placeholder:font-light placeholder:text-[13px] text-sm shadow-sm`}
            />
            <button
              id="submit-password-btn"
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#db88a4]/80 text-white rounded-xl hover:bg-[#db88a4] transition-all active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-8">
            <p className="text-[11px] text-[#64748b]/60 font-light tracking-wide">
              contact <span className="text-[#db88a4]/70">Huong Diep</span> for the password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
