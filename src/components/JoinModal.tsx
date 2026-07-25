import React, { useState } from 'react';
import { UserCheck, Mail, Briefcase, Sparkles, ShieldCheck, Building2, FolderGit2 } from 'lucide-react';
import type { UserProfile } from '../hooks/usePresence';

interface JoinModalProps {
  onJoin: (user: UserProfile) => void;
}

export function JoinModal({ onJoin }: JoinModalProps) {
  const [companyName, setCompanyName] = useState('Aideation Inc.');
  const [projectName, setProjectName] = useState('Real-Time Kanban Sync');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Lead Architect');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter your Company Name');
      return;
    }
    if (!projectName.trim()) {
      setError('Please enter your Project Name');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    if (!email.trim() || !email.toLowerCase().includes('@')) {
      setError('Please enter a valid Gmail address');
      return;
    }

    const stableId = 'usr_' + Math.random().toString(36).substring(2, 9);
    
    const profile: UserProfile = {
      id: stableId,
      companyName: companyName.trim(),
      projectName: projectName.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role
    };

    localStorage.setItem('aideation_user', JSON.stringify(profile));
    onJoin(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur shadow-2xl rounded-3xl max-w-lg w-full p-8 border border-slate-200/80 relative overflow-hidden">
        {/* Top visual accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500" />
        
        <div className="flex items-center space-x-2.5 text-indigo-600 mb-2 mt-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">Project Onboarding</span>
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Workspace Initialization</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
          Specify your Company & Project workspace so team members on the same board sync in real-time.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Step 1: Workspace Context (Company & Project) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-[11px] font-extrabold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Project Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kanban Engine"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Step 2: Personal Identity (Name, Gmail, Role) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tejas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Gmail Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. tejas@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace Role</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserProfile['role'])}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs cursor-pointer"
            >
              <option value="Lead Architect">Lead Architect</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Collaborative Board</span>
          </button>
        </form>
      </div>
    </div>
  );
}
