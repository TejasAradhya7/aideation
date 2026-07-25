import React from 'react';
import { useTaskSync } from '../hooks/useTaskSync';
import { AlertCircle, CheckCircle2, Clock, UserCheck, Edit3 } from 'lucide-react';
import type { UserProfile } from '../hooks/usePresence';

interface TaskCardProps {
  taskId: string;
  title?: string;
  currentUser?: UserProfile | null;
  onActivityLog?: (action: string, taskTitle: string) => void;
}

export function TaskCard({ taskId, title = "Collaborative Task", currentUser, onActivityLog }: TaskCardProps) {
  const { task, updateTaskField, error, activeTypingUser } = useTaskSync(taskId, title);

  if (!task) {
    return (
      <div className="p-5 rounded-2xl shadow-sm bg-white border border-slate-100 animate-pulse flex flex-col justify-between h-52">
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div className="h-20 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateTaskField(
      {
        title: newTitle,
        lastEditedBy: currentUser ? {
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email
        } : undefined
      },
      currentUser?.name
    );
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDesc = e.target.value;
    updateTaskField(
      {
        description: newDesc,
        lastEditedBy: currentUser ? {
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email
        } : undefined
      },
      currentUser?.name
    );
    if (onActivityLog) {
      onActivityLog("Edited Description", task.title || title);
    }
  };

  const handleStatusToggle = (newStatus: 'todo' | 'in-progress' | 'done') => {
    const isMarkingDone = newStatus === 'done';
    
    updateTaskField(
      {
        status: newStatus,
        completedBy: isMarkingDone && currentUser ? {
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email
        } : (newStatus !== 'done' ? undefined : task.completedBy),
        lastEditedBy: currentUser ? {
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email
        } : undefined
      },
      currentUser?.name
    );

    if (onActivityLog) {
      onActivityLog(
        newStatus === 'done' ? 'Marked Task as DONE ✓' : `Moved Status to ${newStatus}`,
        task.title || title
      );
    }
  };

  return (
    <div className={`p-5 rounded-2xl shadow-sm border transition-all ${
      task.status === 'done' 
        ? 'bg-emerald-50/40 border-emerald-200/80' 
        : 'bg-white/90 backdrop-blur border-slate-200/80 hover:shadow-md'
    }`}>
      {error && (
        <div className="mb-3 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span><b>Offline-First Queue Active:</b> Using debounced local state.</span>
        </div>
      )}

      {/* GOOGLE DOCS STYLE LIVE TYPING INDICATOR */}
      {activeTypingUser && activeTypingUser !== currentUser?.name && (
        <div className="mb-2 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
          <Edit3 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
          <span>✍️ <b>{activeTypingUser}</b> is typing in real time...</span>
        </div>
      )}
      
      {/* Title & Status Selectors */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <input
          type="text"
          className="font-bold text-slate-800 text-base outline-none bg-transparent w-full border-b border-transparent focus:border-indigo-500 transition-colors py-0.5"
          value={task.title}
          onChange={handleTitleChange}
          placeholder="Task Title"
        />
        
        <select
          value={task.status || 'todo'}
          onChange={(e) => handleStatusToggle(e.target.value as any)}
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full border cursor-pointer outline-none transition-all ${
            task.status === 'done'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : task.status === 'in-progress'
              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done ✓</option>
        </select>
      </div>
      
      {/* Task Description */}
      <textarea
        className="w-full text-sm text-slate-600 outline-none resize-none h-20 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 focus:bg-white focus:border-indigo-400 transition-all placeholder:text-slate-300 mb-3"
        value={task.description || ""}
        onChange={handleDescriptionChange}
        placeholder="Add task details..."
      />

      {/* "DONE BY WHOM" Attribution Box */}
      {task.status === 'done' && task.completedBy && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-extrabold">Done By: </span>
              <span className="font-bold text-slate-800">{task.completedBy.name}</span>
              <span className="text-[10px] text-slate-500 ml-1 font-mono">({task.completedBy.employeeId})</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-200/60 rounded text-emerald-800">
            {task.completedBy.role}
          </span>
        </div>
      )}

      {/* Footer attribution */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
        {task.lastEditedBy ? (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium truncate max-w-[60%]">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">Edit by <b>{task.lastEditedBy.name}</b> ({task.lastEditedBy.employeeId})</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unedited</span>
        )}
        
        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>
            {task.lastUpdatedAt 
              ? `${task.lastUpdatedAt.toDate().toLocaleTimeString()}`
              : "Syncing..."}
          </span>
        </div>
      </div>
    </div>
  );
}
