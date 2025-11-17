import { Plus } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
}

export const Header = ({ onNewChat }: HeaderProps) => {
  return (
    <header className="pt-6 pb-4 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#09C27E]">Wyvate</h1>
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white transition-all duration-200 border border-[#3a3a3a] hover:border-[#09C27E]"
          title="New Chat"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>
    </header>
  );
};
