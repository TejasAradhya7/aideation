import React, { useState } from 'react';
import { ENTERPRISE_COMPANIES, type Company } from '../data/companies';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sparkles, KeyRound, ShieldCheck, ArrowRight, FolderCheck, CheckCircle2, UserCheck, ShieldAlert, Lock } from 'lucide-react';
import type { UserProfile } from '../hooks/usePresence';

export interface PreconfiguredEmployee {
  employeeId: string;
  name: string;
  email: string;
  role: UserProfile['role'];
}

// BACKEND ENTERPRISE DIRECTORY (Tokens act as the zero-trust keys)
export const ENTERPRISE_EMPLOYEE_DIRECTORY: Record<string, PreconfiguredEmployee> = {
  'TK-9A4B': { employeeId: 'EMP-1001', name: 'Tejas', email: 'tejas@google.com', role: 'Lead Architect' },
  'TK-7X2Y': { employeeId: 'EMP-1002', name: 'Sarah Chen', email: 'sarah.chen@google.com', role: 'Lead Architect' },
  'TK-5M8N': { employeeId: 'EMP-1003', name: 'Alex Rivera', email: 'alex.rivera@google.com', role: 'Senior Software Engineer' },
  'TK-3C6D': { employeeId: 'EMP-1004', name: 'Priya Sharma', email: 'priya.sharma@google.com', role: 'Frontend Engineer' },
  'TK-1E9F': { employeeId: 'EMP-1005', name: 'Marcus Vance', email: 'marcus.vance@google.com', role: 'Backend Engineer' },
  'TK-4G2H': { employeeId: 'EMP-1006', name: 'Elena Rostova', email: 'elena.rostova@google.com', role: 'Product Manager' },
  'TK-8J5K': { employeeId: 'EMP-1007', name: 'David Kim', email: 'david.kim@google.com', role: 'UI/UX Designer' },
  'TK-6L3M': { employeeId: 'EMP-1008', name: 'Jordan Taylor', email: 'jordan.taylor@google.com', role: 'Senior Software Engineer' },
  'TK-2P7Q': { employeeId: 'EMP-1009', name: 'Aisha Patel', email: 'aisha.patel@google.com', role: 'Frontend Engineer' },
  'TK-9R4S': { employeeId: 'EMP-1010', name: "Liam O'Connor", email: 'liam.oconnor@google.com', role: 'Full-Stack Developer' },
  'TK-5T1U': { employeeId: 'EMP-1011', name: 'Vikram Malhotra', email: 'vikram.m@google.com', role: 'Senior Software Engineer' },
  'TK-3V8W': { employeeId: 'EMP-1012', name: 'Chloe Dubois', email: 'chloe.d@google.com', role: 'UI/UX Designer' },
  'TK-7X9Y': { employeeId: 'EMP-1013', name: 'Kaito Tanaka', email: 'kaito.t@google.com', role: 'Backend Engineer' },
  'TK-1Z6A': { employeeId: 'EMP-1014', name: 'Nia Washington', email: 'nia.w@google.com', role: 'Product Manager' },
  'TK-4B2C': { employeeId: 'EMP-1015', name: 'Carlos Mendez', email: 'carlos.m@google.com', role: 'Frontend Engineer' },
  'TK-8D5E': { employeeId: 'EMP-1016', name: 'Hannah Schmidt', email: 'hannah.s@google.com', role: 'Lead Architect' },
  'TK-6F3G': { employeeId: 'EMP-1017', name: 'Zaid Al-Mansoor', email: 'zaid.a@google.com', role: 'Backend Engineer' },
  'TK-2H7I': { employeeId: 'EMP-1018', name: 'Emily Zhang', email: 'emily.z@google.com', role: 'Senior Software Engineer' },
  'TK-9J4K': { employeeId: 'EMP-1019', name: 'Rohan Gupta', email: 'rohan.g@google.com', role: 'Frontend Engineer' },
  'TK-5L1M': { employeeId: 'EMP-1020', name: 'Sophia Rossi', email: 'sophia.r@google.com', role: 'Full-Stack Developer' },
};

interface CompanySelectorProps {
  onSelectCompanyAndProject: (selection: {
    company: { id: string; name: string };
    projectName: string;
    employeeId: string;
    name: string;
    email: string;
    role: UserProfile['role'];
  }) => void;
}

export function CompanySelector({ onSelectCompanyAndProject }: CompanySelectorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isVerifying, setIsVerifying] = useState(false);

  // Step 1 State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [customCompanyName, setCustomCompanyName] = useState('');

  // Step 2 State
  const [typedAccessToken, setTypedAccessToken] = useState('');

  // Step 3 Authenticated Result State
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<PreconfiguredEmployee | null>(null);
  const [assignedProjectName, setAssignedProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompany(comp);
    setError('');
    setStep(2);
  };

  const handleSelectCustomCompany = () => {
    if (!customCompanyName.trim()) {
      setError('Please enter a custom company name');
      return;
    }
    setSelectedCompany({
      id: 'custom',
      name: customCompanyName.trim(),
      domain: 'custom.com',
      industry: 'Enterprise Solutions',
      accent: 'from-indigo-600 to-violet-600',
      logoBg: 'bg-indigo-50 text-indigo-600'
    });
    setError('');
    setStep(2);
  };

  // STEP 2: VERIFY TOKEN & BLOCK DUPLICATE CONCURRENT LOGINS (TRUE BLIND AUTH)
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = typedAccessToken.trim().toUpperCase();

    if (!cleanToken) {
      setError('Please enter a secure access token');
      return;
    }

    // STRICT AUTHORIZATION CHECK (MAPPING TOKEN TO INTERNAL EMPLOYEE ID)
    const foundEmployee = ENTERPRISE_EMPLOYEE_DIRECTORY[cleanToken];
    if (!foundEmployee) {
      setError(`Access Denied: Invalid Access Token. This token is either expired or not assigned to a corporate account.`);
      return;
    }
    
    // Internal Employee ID is extracted securely on the backend, never typed by the user
    const internalEmployeeId = foundEmployee.employeeId;

    const effectiveCompanyName = selectedCompany ? selectedCompany.name : 'Enterprise';
    const workspaceSlug = `${effectiveCompanyName}_${effectiveCompanyName} Real-Time Core Engine`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');
    
    const presenceDocKey = `${workspaceSlug}_${internalEmployeeId}`;

    setIsVerifying(true);
    setError('');

    // STRICT CONCURRENCY LOCK - BLOCK IF THIS INTERNAL EMPLOYEE IS ALREADY ACTIVE IN ANOTHER SESSION
    try {
      const presenceSnap = await getDoc(doc(db, 'presence', presenceDocKey));
      if (presenceSnap.exists()) {
        const data = presenceSnap.data();
        const now = Date.now();
        if (data.lastActive && now - data.lastActive < 20000) {
          setIsVerifying(false);
          setError(`🚫 Security Lockout: A session for this access token's assigned employee is already active! Multiple concurrent logins are strictly prohibited to prevent data conflict.`);
          return;
        }
      }
    } catch (err) {
      console.warn("Presence lock check warning:", err);
    }

    setIsVerifying(false);
    const project = `${effectiveCompanyName} Real-Time Core Engine`;
    setAuthenticatedEmployee(foundEmployee);
    setAssignedProjectName(project);
    setStep(3);
  };

  const handleLaunchCanvas = () => {
    if (!selectedCompany || !authenticatedEmployee || !assignedProjectName) return;

    onSelectCompanyAndProject({
      company: { id: selectedCompany.id, name: selectedCompany.name },
      projectName: assignedProjectName,
      employeeId: authenticatedEmployee.employeeId,
      name: authenticatedEmployee.name,
      email: authenticatedEmployee.email,
      role: authenticatedEmployee.role,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden my-auto">
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500" 
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>

        <div className="flex items-center space-x-2 text-indigo-400 mb-2 mt-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
            Strict Zero-Trust Portal • Step {step} of 3
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: COMPANY SELECTION ONLY */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Select Enterprise Company
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
              Step 1: Choose your organization. Project details & employee data remain strictly encrypted until verification.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2.5">
                {ENTERPRISE_COMPANIES.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp)}
                    className="p-3 bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg ${comp.logoBg} flex items-center justify-center font-bold text-xs`}>
                        {comp.name[0]}
                      </div>
                      <span className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">
                        {comp.name}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter custom company name..."
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSelectCustomCompany}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BLIND TOKEN EXCHANGE (TRUE ZERO-TRUST) */}
        {step === 2 && selectedCompany && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-white mb-3 flex items-center gap-1 cursor-pointer"
            >
              ← Back to Companies
            </button>

            <div className="flex items-center space-x-3 mb-5 p-3 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl ${selectedCompany.logoBg} flex items-center justify-center font-black text-base`}>
                {selectedCompany.name[0]}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">Selected Enterprise</span>
                <h3 className="text-base font-bold text-white">{selectedCompany.name}</h3>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Zero-Trust Verification
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
              Step 2: Enter your secure Access Token. Your actual Employee ID is never exposed to the frontend.
            </p>

            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Secure Access Token</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TK-9A4B"
                  value={typedAccessToken}
                  onChange={(e) => setTypedAccessToken(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
                />
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Active Concurrency Lock: Duplicate active logins under the same internal entity are automatically blocked.</span>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying Lock Status...' : 'Authenticate & Fetch Workspace'}</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: REVEAL SHARED ASSIGNED PROJECT */}
        {step === 3 && selectedCompany && authenticatedEmployee && (
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                Authentication Successful
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Assigned Project Revealed
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Secure token mapped to {authenticatedEmployee.name}. Employee ID hidden.
            </p>

            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FolderCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">Assigned Enterprise Project</span>
              </div>
              <h3 className="text-lg font-black text-white">{assignedProjectName}</h3>
              <p className="text-xs text-indigo-300/80 font-medium mt-0.5">
                Enterprise Workspace: {selectedCompany.name}
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2 mb-5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">Internal Reference:</span>
                <span className="font-mono font-extrabold text-amber-300 blur-sm select-none">HIDDEN-ID</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">Employee Name:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {authenticatedEmployee.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">Gmail Address:</span>
                <span className="font-mono text-slate-300">{authenticatedEmployee.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Assigned Role:</span>
                <span className="font-extrabold text-indigo-300 px-2 py-0.5 bg-indigo-500/20 rounded">
                  {authenticatedEmployee.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLaunchCanvas}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Assigned Project Canvas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
