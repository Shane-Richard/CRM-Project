import { Zap, MessageSquare, CheckCircle, Clock, XCircle, AlertCircle, UserMinus, Rocket } from 'lucide-react';

export const LABEL_CONFIG = [
  { id: 'lead', label: 'Lead', icon: Zap, color: '#facc15', bgColor: 'bg-yellow-400', priorityScore: 5 },
  { id: 'interested', label: 'Interested', icon: MessageSquare, color: '#a855f7', bgColor: 'bg-purple-500', priorityScore: 7 },
  { id: 'meeting_booked', label: 'Meeting booked', icon: Clock, color: '#3b82f6', bgColor: 'bg-blue-500', priorityScore: 9 },
  { id: 'meeting_completed', label: 'Meeting completed', icon: CheckCircle, color: '#22c55e', bgColor: 'bg-green-500', priorityScore: 8 },
  { id: 'won', label: 'Won', icon: Rocket, color: '#b2f40e', bgColor: 'bg-[#b2f40e]', priorityScore: 10 },
  { id: 'out_of_office', label: 'Out of office', icon: Clock, color: '#60a5fa', bgColor: 'bg-blue-400', priorityScore: 3 },
  { id: 'wrong_person', label: 'Wrong person', icon: UserMinus, color: '#94a3b8', bgColor: 'bg-slate-400', priorityScore: 1 },
  { id: 'not_interested', label: 'Not interested', icon: XCircle, color: '#f87171', bgColor: 'bg-red-400', priorityScore: 2 },
  { id: 'lost', label: 'Lost', icon: AlertCircle, color: '#ef4444', bgColor: 'bg-red-600', priorityScore: 0 },
];
