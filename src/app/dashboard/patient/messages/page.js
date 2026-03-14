'use client';

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '@/components/Toast';

export default function PatientMessages() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Compose form state
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch doctors for compose dropdown
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMessages();
    fetchDoctors();

    const socket = io('http://localhost:3001');
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [msg, ...prev]);
      toast.info('New Message received! 💬');
    });

    return () => socket.disconnect();
  }, [fetchMessages, fetchDoctors, toast]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiverId || !content) return toast.error('Please select a recipient and enter a message');

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, subject, content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      toast.success('Message sent!');
      setShowCompose(false);
      setReceiverId('');
      setSubject('');
      setContent('');
      // message will be added via socket or we can refetch
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages 💬</h2>
          <p className="text-gray-500 text-sm mt-1">Communications from your care team.</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
        >
          + New Message
        </button>
      </div>

      {showCompose && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Compose Message</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">To</label>
              <select
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              >
                <option value="">Select Doctor...</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                placeholder="Brief subject"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Message</label>
              <textarea
                rows="4"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500">No messages yet. Send a message to your doctor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {messages.map((msg) => {
            const dateStr = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <div
                key={msg._id}
                onClick={() => markAsRead(msg._id, msg.isRead)}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!msg.isRead ? 'bg-teal-50/30' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 shrink-0">
                  {msg.senderName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.senderName}</p>
                    <span className="text-xs text-gray-400 shrink-0">{dateStr}</span>
                  </div>
                  <p className={`text-sm mb-1 ${!msg.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {msg.subject || 'Message'}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!msg.isRead && <div className="w-2 h-2 rounded-full bg-teal-500 mt-2" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                    title="Delete Message"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
