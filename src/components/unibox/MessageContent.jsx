import React, { useState, memo, useMemo, useRef, useEffect } from 'react';
import { 
  Archive, 
  Trash2, 
  Star, 
  MoreHorizontal,
  Reply,
  Forward,
  Paperclip,
  Download,
  ChevronDown,
  X,
  Send,
  FileText,
  Image,
  File,
  ExternalLink,
  Mail,
  User,
  Clock,
  MoreVertical,
  Undo2
} from 'lucide-react';
import StatusDropdown from './StatusDropdown';

// Format file size helper
const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
};

// Get file icon and color based on extension
const getFileIcon = (filename = '', mimeType = '') => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(ext) || mimeType.includes('pdf')) {
        return { icon: FileText, bg: 'bg-red-50', text: 'text-red-500', label: 'PDF' };
    }
    if (['doc', 'docx'].includes(ext) || mimeType.includes('word')) {
        return { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-500', label: ext.toUpperCase() };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('excel')) {
        return { icon: FileText, bg: 'bg-green-50', text: 'text-green-500', label: ext.toUpperCase() };
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimeType.includes('image')) {
        return { icon: Image, bg: 'bg-purple-50', text: 'text-purple-500', label: ext.toUpperCase() };
    }
    return { icon: File, bg: 'bg-gray-50', text: 'text-gray-500', label: ext.toUpperCase() || 'FILE' };
};

const EmailBody = memo(({ bodyHtml, bodyText }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (iframeRef.current && bodyHtml) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            
            if (!doc) return;

            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-size: 14px; 
                            line-height: 1.6; 
                            color: #1f2937; 
                            margin: 0; 
                            padding: 0;
                            word-wrap: break-word;
                            background-color: transparent;
                        }
                        a { color: #b2f40e; font-weight: 600; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                        table { max-width: 100%; }
                        blockquote { 
                            border-left: 4px solid #f3f4f6; 
                            padding-left: 16px; 
                            margin-left: 0;
                            color: #6b7280; 
                        }
                        .email-container { padding: 20px; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        ${bodyHtml}
                    </div>
                </body>
                </html>
            `);
            doc.close();

            // Resizing logic with fallback
            const updateHeight = () => {
                const height = doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 200;
                iframe.style.height = (height + 20) + 'px';
            };

            const resizeObserver = new ResizeObserver(updateHeight);
            if (doc.documentElement) resizeObserver.observe(doc.documentElement);

            // Immediate fallback
            setTimeout(updateHeight, 100);

            return () => resizeObserver.disconnect();
        }
    }, [bodyHtml]);

    if (bodyHtml) {
        return (
            <iframe
                ref={iframeRef}
                title="Email Content"
                className="w-full border-0 transition-all duration-500"
                sandbox="allow-same-origin"
                style={{ height: '200px', background: 'transparent' }}
            />
        );
    }

    if (bodyText) {
        return (
            <div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap px-1">
                {bodyText}
            </div>
        );
    }

    return (
        <div className="text-sm text-slate-400 italic py-10 text-center">
            No message content available
        </div>
    );
});

const AttachmentItem = memo(({ attachment }) => {
    const fileInfo = getFileIcon(attachment.filename || attachment.name, attachment.mimeType);
    const FileIcon = fileInfo.icon;

    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-xl ${fileInfo.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-6`}>
                <FileIcon className={`w-6 h-6 ${fileInfo.text}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate">
                    {attachment.filename || attachment.name || 'Unnamed File'}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                    {attachment.sizeFormatted || formatFileSize(attachment.size)} • {fileInfo.label}
                </p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-slate-100 transition-all">
                <Download className="w-4 h-4 text-slate-500" />
            </button>
        </div>
    );
});

const ComposeReply = memo(({ onClose, replyTo, subject, mode = 'reply' }) => {
    const [body, setBody] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSend = () => {
        if (!body.trim()) return;
        console.log(`[${mode.toUpperCase()}] Sending...`);
        setBody('');
        onClose();
    };

    return (
        <div className="flex flex-col bg-white rounded-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ease-out z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                        {mode === 'reply' ? (
                            <Reply className="w-3.5 h-3.5 text-primary" />
                        ) : (
                            <Forward className="w-3.5 h-3.5 text-primary" />
                        )}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 block mb-0.5">
                            Drafting Message
                        </span>
                        <span className="text-[13px] font-bold text-slate-900">
                            {mode === 'reply' ? `To: ${replyTo}` : `Forwarding: ${subject}`}
                        </span>
                    </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-xl hover:bg-white hover:text-red-500 transition-all group"
                >
                    <X className="w-4 h-4 text-slate-400 group-hover:rotate-90 transition-transform" />
                </button>
            </div>
            
            {/* Body */}
            <div className="p-1">
                <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={mode === 'reply' ? 'Type your reply here...' : 'Add context for this forward...'}
                    className="w-full px-6 py-5 text-[14px] font-medium text-slate-800 resize-none focus:outline-none min-h-[220px] bg-transparent placeholder:text-slate-300"
                />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95">
                        <Paperclip className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95">
                        <Image className="w-4.5 h-4.5" />
                    </button>
                </div>
                <button
                    onClick={handleSend}
                    disabled={!body.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Send className="w-4 h-4 text-primary" />
                    Send Message
                </button>
            </div>
        </div>
    );
});

const MessageContent = memo(({ activeMessage, selectedIds = [], onUpdateStatus, onArchive, onDelete, onRestore, onToggleStar, activeFilter }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [replyMode, setReplyMode] = useState(null); // 'reply' | 'forward' | null

    const attachments = useMemo(() => {
        if (!activeMessage) return [];
        return activeMessage.attachments || [];
    }, [activeMessage]);

    // Track scroll height to manage background transitions
    const scrollRef = useRef(null);

    if (!activeMessage) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#fcfdfe] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent opacity-50" />
                <div className="relative text-center max-w-sm px-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 rounded-[3rem] bg-white shadow-2xl shadow-slate-200 flex items-center justify-center mx-auto mb-8 rotate-3">
                        <Mail className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Focus Mode</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Select a conversation from the list to view the full thread and take action.
                    </p>
                </div>
            </div>
        );
    }

    const { sender, sender_email, subject, body_html, body_text, snippet, date, isStarred, status, labels } = activeMessage;

    const initials = sender 
        ? sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : (sender_email ? sender_email[0].toUpperCase() : '?');

    return (
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
            {/* Top Action Bar - Premium Sticky */}
            <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between flex-shrink-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-2xl mr-2">
                        <button 
                            onClick={() => onArchive(selectedIds.length > 0 ? selectedIds : [activeMessage.id])}
                            className="p-2.5 rounded-xl hover:bg-white hover:text-slate-900 text-slate-500 transition-all shadow-none hover:shadow-sm"
                            title="Archive"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2.5 rounded-xl hover:bg-white hover:text-red-500 text-slate-500 transition-all hover:shadow-sm"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onToggleStar(selectedIds.length > 0 ? selectedIds : [activeMessage.id])}
                            className={`p-2.5 rounded-xl transition-all hover:shadow-sm ${
                                isStarred 
                                    ? 'bg-white text-amber-500' 
                                    : 'hover:bg-white text-slate-500 hover:text-amber-500'
                            }`}
                            title={isStarred ? 'Unstar' : 'Star'}
                        >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Restore button — only visible in Trash */}
                    {activeFilter === 'trash' && (
                        <div className="flex bg-emerald-50 p-1 rounded-2xl mr-2 border border-emerald-100">
                            <button
                                onClick={() => onRestore(selectedIds.length > 0 ? selectedIds : [activeMessage.id])}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                                title="Restore to Inbox"
                            >
                                <Undo2 className="w-3.5 h-3.5" />
                                Restore
                            </button>
                        </div>
                    )}

                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button 
                            onClick={() => setReplyMode(replyMode === 'reply' ? null : 'reply')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                replyMode === 'reply' 
                                    ? 'bg-slate-900 text-white shadow-lg' 
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                            }`}
                        >
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                        </button>
                        <button 
                            onClick={() => setReplyMode(replyMode === 'forward' ? null : 'forward')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                replyMode === 'forward' 
                                    ? 'bg-slate-900 text-white shadow-lg' 
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                            }`}
                        >
                            <Forward className="w-3.5 h-3.5" />
                            Forward
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusDropdown 
                        currentStatus={status}
                        onStatusChange={(newStatus) => onUpdateStatus(activeMessage.id, newStatus)}
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-white">
                <div className="max-w-4xl mx-auto px-10 py-12">
                    {/* Subject Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            {labels && labels.filter(l => !['INBOX', 'UNREAD'].includes(l)).map(label => (
                                <span key={label} className="text-[10px] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md uppercase tracking-[0.1em]">
                                    {label}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-8">
                            {subject || 'No Subject'}
                        </h1>

                        {/* Sender Info Bar */}
                        <div className="flex items-center justify-between p-2 pl-2 pr-6 rounded-[2rem] bg-slate-50 border border-slate-100 group">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-3xl bg-slate-900 flex items-center justify-center text-sm font-black text-primary shadow-lg shadow-slate-900/10">
                                    {initials}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-slate-900 group-hover:text-black transition-colors">
                                        {sender || 'Unknown Sender'}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {sender_email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {date || 'Just now'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Email Message Content Wrapper */}
                    <div className="relative mb-12 min-h-[400px]">
                        <EmailBody bodyHtml={body_html} bodyText={body_text || snippet} />
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6 px-1">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                </div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Attached Files ({attachments.length})
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attachments.map((att, idx) => (
                                    <AttachmentItem key={att.id || idx} attachment={att} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Action Footer in Flow */}
                    {!replyMode && (
                        <div className="py-12 border-t border-slate-50 text-center">
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">End of Thread</p>
                            <div className="flex items-center justify-center gap-4">
                                <button 
                                  onClick={() => setReplyMode('reply')}
                                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                                >
                                    <Reply className="w-3.5 h-3.5" />
                                    Reply Fast
                                </button>
                                <button 
                                  onClick={() => setReplyMode('forward')}
                                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                                >
                                    <Forward className="w-3.5 h-3.5" />
                                    Forward
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Overlay - Fixed at the bottom of the column */}
            {replyMode && (
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-50">
                    <div className="pointer-events-auto max-w-4xl mx-auto">
                        <ComposeReply 
                            mode={replyMode}
                            replyTo={sender_email || sender || ''}
                            subject={subject || ''}
                            onClose={() => setReplyMode(null)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Overlay */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-red-50 flex items-center justify-center mb-8 rotate-12 mx-auto">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Move to Trash?</h3>
                            <p className="text-slate-500 font-medium">This conversation will be hidden from your inbox but available in the Trash folder.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    onDelete(selectedIds.length > 0 ? selectedIds : [activeMessage.id]);
                                    setShowDeleteConfirm(false);
                                }}
                                className="w-full py-4 bg-red-500 text-white font-black text-[13px] uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
                            >
                                Confirm Delete
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full py-4 bg-slate-100 text-slate-500 font-black text-[13px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default MessageContent;
