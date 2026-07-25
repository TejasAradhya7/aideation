
import { Users, X, Building2, FolderGit2, Mail, CheckCircle2, LogOut } from 'lucide-react';
import type { UserProfile } from '../hooks/usePresence';

interface ActiveUsersModalProps {
  users: UserProfile[];
  currentUser?: UserProfile | null;
  onClose: () => void;
  onSwitchUser: () => void;
}

export function ActiveUsersModal({ users, currentUser, onClose, onSwitchUser }: ActiveUsersModalProps) {
  const getRoleBadgeStyle = (role: UserProfile['role']) => {
    switch (role) {
      case 'Lead Architect':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Frontend Engineer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Product Manager':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UI/UX Designer':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Workspace Collaborators</h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mt-0.5">
                <span className="flex items-center gap-1 text-indigo-600">
                  <Building2 className="w-3 h-3" />
                  {currentUser?.companyName || 'Aideation Inc.'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-violet-600">
                  <FolderGit2 className="w-3 h-3" />
                  {currentUser?.projectName || 'Kanban Engine'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collaborator List */}
        <div className="my-5 space-y-3 max-h-80 overflow-y-auto pr-1">
          {users.map((user, idx) => {
            const isMe = user.id === currentUser?.id;
            const initials = (user.name ?? '')
              .split(' ')
              .map((n) => n[0] || '')
              .join('')
              .toUpperCase()
              .substring(0, 2);

            return (
              <div 
                key={user.id || idx}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isMe ? 'bg-indigo-50/60 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0 relative">
                    {initials || "U"}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                      {isMe && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${getRoleBadgeStyle(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Scoped to {currentUser?.projectName || 'Project'}</span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('aideation_user');
              onSwitchUser();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
