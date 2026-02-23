import React from 'react';
import { Clock, LogOut, Edit, BarChart3, Calendar } from 'lucide-react';
import { Button } from './ui/button';

interface SlackButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'default' | 'danger';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function SlackButton({ children, onClick, variant = 'default', icon, fullWidth = true }: SlackButtonProps) {
  const baseStyles = "h-9 rounded text-sm font-medium transition-colors";
  
  const variantStyles = {
    primary: "bg-[#007a5a] hover:bg-[#006548] text-white",
    default: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300",
    danger: "bg-white hover:bg-red-50 text-red-600 border border-gray-300"
  };

  return (
    <Button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2`}
    >
      {icon}
      {children}
    </Button>
  );
}

interface SlackMessageProps {
  avatar?: string;
  botName: string;
  timestamp: string;
  children: React.ReactNode;
}

export function SlackMessage({ avatar, botName, timestamp, children }: SlackMessageProps) {
  return (
    <div className="flex gap-2 p-4 hover:bg-gray-50">
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          {avatar || "🤖"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-[15px] text-gray-900">{botName}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-[15px] text-gray-900 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SlackBlockCardProps {
  children: React.ReactNode;
}

export function SlackBlockCard({ children }: SlackBlockCardProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white mb-2">
      {children}
    </div>
  );
}

interface SlackDividerProps {}

export function SlackDivider({}: SlackDividerProps) {
  return <div className="border-t border-gray-200 my-3" />;
}

interface SlackFieldProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function SlackField({ label, value, variant = 'default' }: SlackFieldProps) {
  const variantColors = {
    default: 'text-gray-900',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${variantColors[variant]}`}>{value}</span>
    </div>
  );
}

interface SlackSectionProps {
  title?: string;
  text?: string;
  children?: React.ReactNode;
}

export function SlackSection({ title, text, children }: SlackSectionProps) {
  return (
    <div className="py-2">
      {title && <h3 className="font-bold text-[15px] text-gray-900 mb-2">{title}</h3>}
      {text && <p className="text-[15px] text-gray-700 leading-relaxed mb-2">{text}</p>}
      {children}
    </div>
  );
}

interface SlackActionsProps {
  children: React.ReactNode;
}

export function SlackActions({ children }: SlackActionsProps) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {children}
    </div>
  );
}
