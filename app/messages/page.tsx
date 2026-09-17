"use client";

import { useState } from "react";

type Message = {
  id: string;
  sender: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  avatarBg: string;
  avatarColor: string;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

const CONVERSATIONS: Message[] = [
  {
    id: "c1", sender: "Kwabena Asare", role: "Partner", time: "10:24 AM", unread: 2,
    avatarBg: "#EFF4FF", avatarColor: "#1d4ed8",
    preview: "Please review the new leave policy draft before the meeting.",
    messages: [
      { from: "them", text: "Good morning Yaa, can you send me the updated attendance report?", time: "09:05 AM" },
      { from: "me",   text: "Good morning! I'll have it ready by 10 AM.", time: "09:08 AM" },
      { from: "them", text: "Please review the new leave policy draft before the meeting.", time: "10:24 AM" },
    ],
  },
  {
    id: "c2", sender: "S.K. Boafo", role: "Managing Partner", time: "Yesterday", unread: 0,
    avatarBg: "#ECFDF5", avatarColor: "#059669",
    preview: "Thanks for sorting out the Agyeman leave documentation.",
    messages: [
      { from: "them", text: "Thanks for sorting out the Agyeman leave documentation.", time: "Yesterday 4:15 PM" },
      { from: "me",   text: "Happy to help. All filed and updated.", time: "Yesterday 4:20 PM" },
    ],
  },
  {
    id: "c3", sender: "Abena Asante", role: "Associate", time: "Yesterday", unread: 1,
    avatarBg: "#F5F3FF", avatarColor: "#7C3AED",
    preview: "Hi Yaa, I'd like to apply for annual leave next week.",
    messages: [
      { from: "them", text: "Hi Yaa, I'd like to apply for annual leave next week.", time: "Yesterday 2:10 PM" },
    ],
  },
  {
    id: "c4", sender: "Kojo Frimpong", role: "Partner", time: "Mon", unread: 0,
    avatarBg: "#FFFBEB", avatarColor: "#D97706",
    preview: "Can we schedule the Q3 performance review for end of month?",
    messages: [
      { from: "them", text: "Can we schedule the Q3 performance review for end of month?", time: "Mon 11:00 AM" },
      { from: "me",   text: "Of course — I'll send calendar invites today.", time: "Mon 11:15 AM" },
    ],
  },
  {
    id: "c5", sender: "Kofi Mensah", role: "Associate", time: "Fri", unread: 0,
    avatarBg: "#FFF5F5", avatarColor: "#DC2626",
    preview: "Received, thank you!",
    messages: [
      { from: "me",   text: "Your sick leave has been approved for today.", time: "Fri 8:30 AM" },
      { from: "them", text: "Received, thank you!", time: "Fri 8:35 AM" },
    ],
  },
];

export default function MessagesPage() {
  const [active, setActive] = useState(CONVERSATIONS[0].id);
  const [draft, setDraft] = useState("");

  const convo = CONVERSATIONS.find((c) => c.id === active)!;

  return (
    <div className="max-w-[1100px] h-[calc(100vh-140px)] min-h-[520px] flex rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-[#F1F5F9] flex flex-col">
        <div className="px-4 py-3.5 border-b border-[#F1F5F9]">
          <h2 className="text-[15px] font-bold text-[#0B2349]">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="w-full text-left px-4 py-3 border-b border-[#F8FAFC] transition-colors"
              style={active === c.id ? { background: "#EFF4FF" } : { background: "white" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.avatarBg, color: c.avatarColor }}>
                  {c.sender.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#1e293b] truncate">{c.sender}</p>
                    <span className="text-[11px] text-[#94A3B8] flex-shrink-0 ml-2">{c.time}</span>
                  </div>
                  <p className="text-[12px] text-[#94A3B8] truncate mt-0.5">{c.preview}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: "#0B2349" }}>{c.unread}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[#FAFBFC]">
        {/* Chat header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#F1F5F9] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: convo.avatarBg, color: convo.avatarColor }}>
            {convo.sender.split(" ").map((w) => w[0]).join("")}
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#1e293b]">{convo.sender}</p>
            <p className="text-[11px] text-[#94A3B8]">{convo.role}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {convo.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[70%]">
                <div className="rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed" style={m.from === "me" ? { background: "#0B2349", color: "white", borderBottomRightRadius: 4 } : { background: "white", color: "#1e293b", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  {m.text}
                </div>
                <p className={`text-[11px] text-[#94A3B8] mt-1 ${m.from === "me" ? "text-right" : "text-left"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-3.5 bg-white border-t border-[#F1F5F9]">
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] px-4 py-2.5 bg-[#FAFBFC]">
            <input
              type="text"
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "#0B2349" }}
              disabled={!draft.trim()}
              onClick={() => setDraft("")}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
