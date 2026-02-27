import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, ChevronDown, ChevronUp, Minus, Maximize2,
  Paperclip, Smile, Link2, AtSign, AlertCircle, Loader2
} from 'lucide-react';
import { mailService } from '../../services/MailService';
import { useToast } from '../../hooks/useToast.jsx';

// ── Email chip (To/Cc field) ─────────────────────────────────────────────────
const EmailChip = ({ email, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-[12px] font-semibold rounded-lg border border-slate-200 leading-none">
    {email}
    <button
      onClick={onRemove}
      className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-red-400 hover:text-white flex items-center justify-center transition-colors"
    >
      <X className="w-2 h-2" />
    </button>
  </span>
);

// ── Email Input with chips ───────────────────────────────────────────────────
const EmailInput = ({ label, emails, onChange, placeholder }) => {
  const [inputVal, setInputVal] = useState('');

  const addEmail = useCallback((val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (isValid && !emails.includes(trimmed)) {
      onChange([...emails, trimmed]);
    }
    setInputVal('');
  }, [emails, onChange]);

  const handleKey = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addEmail(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && emails.length > 0) {
      onChange(emails.slice(0, -1));
    }
  };

  return (
    <div className="flex items-start gap-2 px-4 py-2.5 border-b border-slate-100 min-h-[44px]">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pt-1.5 w-6 flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5 flex-1 items-center">
        {emails.map(e => (
          <EmailChip key={e} email={e} onRemove={() => onChange(emails.filter(x => x !== e))} />
        ))}
        <input
          type="email"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addEmail(inputVal)}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] text-[13px] font-medium text-slate-800 placeholder:text-slate-300 bg-transparent outline-none"
        />
      </div>
    </div>
  );
};

// ── Main ComposeModal ────────────────────────────────────────────────────────
const ComposeModal = ({ onClose, defaultTo = '', defaultSubject = '' }) => {
  const { showToast } = useToast();
  const [toEmails, setToEmails]     = useState(defaultTo ? [defaultTo] : []);
  const [ccEmails, setCcEmails]     = useState([]);
  const [showCc, setShowCc]         = useState(false);
  const [subject, setSubject]       = useState(defaultSubject);
  const [body, setBody]             = useState('');
  const [isSending, setIsSending]   = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sendError, setSendError]   = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!isMinimized) bodyRef.current?.focus();
  }, [isMinimized]);

  const canSend = toEmails.length > 0 && subject.trim() && body.trim() && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    setSendError(null);
    setIsSending(true);

    try {
      const result = await mailService.sendEmail({
        to: toEmails,
        cc: ccEmails,
        subject,
        body,
      });

      if (result?.success) {
        showToast({ message: `✅ Email sent to ${toEmails.join(', ')}`, type: 'success' });
        onClose();
      } else {
        throw new Error(result?.error || 'Unknown send error');
      }
    } catch (err) {
      const msg = err.message || 'Failed to send email';
      setSendError(msg);
      showToast({ message: `❌ ${msg}`, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-[200] w-72 bg-slate-900 text-white rounded-t-2xl shadow-2xl flex items-center justify-between px-5 py-3 cursor-pointer"
        onClick={() => setIsMinimized(false)}>
        <span className="text-[12px] font-black uppercase tracking-widest truncate">
          {subject || 'New Message'}
        </span>
        <div className="flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-[200] w-[560px] max-h-[620px] bg-white rounded-t-2xl shadow-[0_-8px_60px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 rounded-t-2xl flex-shrink-0">
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white">New Message</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-shrink-0">
        <EmailInput label="To" emails={toEmails} onChange={setToEmails} placeholder="recipient@email.com" />

        {/* CC Toggle */}
        <div className="flex items-center justify-end px-4 py-1">
          <button onClick={() => setShowCc(v => !v)}
            className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors">
            Cc {showCc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showCc && (
          <EmailInput label="Cc" emails={ccEmails} onChange={setCcEmails} placeholder="cc@email.com" />
        )}

        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest w-6 flex-shrink-0">Re</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Compose your message..."
          className="w-full h-full min-h-[220px] px-5 py-4 text-[14px] font-medium text-slate-800 placeholder:text-slate-300 bg-transparent outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Error */}
      {sendError && (
        <div className="mx-4 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-red-600">{sendError}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all" title="Attach file">
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all" title="Insert link">
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all" title="Mention">
            <AtSign className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all" title="Emoji">
            <Smile className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
            canSend
              ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20 hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          {isSending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-primary" />
          )}
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ComposeModal;
