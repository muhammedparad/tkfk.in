'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Question } from '@/types';
import { 
  HelpCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  Search, 
  Database, 
  BookOpen, 
  Layers, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeBank, setActiveBank] = useState<'previous' | 'current'>('previous');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  const [form, setForm] = useState<Omit<Question, 'id'>>({
    question_text: '',
    question_text_ml: '',
    option_a: '',
    option_a_ml: '',
    option_b: '',
    option_b_ml: '',
    option_c: '',
    option_c_ml: '',
    option_d: '',
    option_d_ml: '',
    correct_option: 'A',
    category: 'Gandhi History',
    difficulty: 'MEDIUM',
    explanation: ''
  });

  const loadQuestions = async (bankToLoad = activeBank) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?bank=${bankToLoad}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : (data.questions || []));
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(activeBank);
  }, [activeBank]);

  const handleBankChange = (bank: 'previous' | 'current') => {
    setActiveBank(bank);
  };

  const handleOpenAdd = () => {
    setEditingQ(null);
    setForm({
      question_text: '',
      question_text_ml: '',
      option_a: '',
      option_a_ml: '',
      option_b: '',
      option_b_ml: '',
      option_c: '',
      option_c_ml: '',
      option_d: '',
      option_d_ml: '',
      correct_option: 'A',
      category: 'Gandhi History',
      difficulty: 'MEDIUM',
      explanation: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQ(q);
    setForm({
      question_text: q.question_text,
      question_text_ml: q.question_text_ml || '',
      option_a: q.option_a,
      option_a_ml: q.option_a_ml || '',
      option_b: q.option_b,
      option_b_ml: q.option_b_ml || '',
      option_c: q.option_c,
      option_c_ml: q.option_c_ml || '',
      option_d: q.option_d,
      option_d_ml: q.option_d_ml || '',
      correct_option: q.correct_option || 'A',
      category: q.category || 'Gandhi History',
      difficulty: q.difficulty || 'MEDIUM',
      explanation: q.explanation || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQ) {
        await fetch('/api/admin/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQ.id, ...form })
        });
      } else {
        await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      await loadQuestions(activeBank);
      setShowModal(false);
    } catch (err) {
      alert('Failed to save question');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      await loadQuestions(activeBank);
    } catch {
      alert('Failed to delete question');
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase().trim();
    return questions.filter(item => {
      const matchEn = item.question_text?.toLowerCase().includes(q);
      const matchMl = item.question_text_ml?.toLowerCase().includes(q);
      const matchOptA = item.option_a?.toLowerCase().includes(q) || item.option_a_ml?.toLowerCase().includes(q);
      const matchOptB = item.option_b?.toLowerCase().includes(q) || item.option_b_ml?.toLowerCase().includes(q);
      const matchOptC = item.option_c?.toLowerCase().includes(q) || item.option_c_ml?.toLowerCase().includes(q);
      const matchOptD = item.option_d?.toLowerCase().includes(q) || item.option_d_ml?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      return matchEn || matchMl || matchOptA || matchOptB || matchOptC || matchOptD || matchCat;
    });
  }, [questions, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Question Banks & Curriculum Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between previous original session questions and make-up questions with full bilingual support
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadQuestions(activeBank)}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question</span>
            </button>
          </div>
        </div>

        {/* Question Bank Selection Banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Select Question Bank</h3>
                <p className="text-[11px] text-slate-500">Admin toggle to inspect and test across examination versions</p>
              </div>
            </div>

            {/* Bank Switcher Buttons */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleBankChange('previous')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBank === 'previous'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Previous Original Bank (4:00 PM)</span>
                <span className="text-[10px] bg-purple-900/40 text-purple-100 px-1.5 py-0.2 rounded-full ml-1">50 Qs</span>
              </button>

              <button
                type="button"
                onClick={() => handleBankChange('current')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBank === 'current'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Re-conduct Bank (7:00 PM)</span>
                <span className="text-[10px] bg-emerald-900/40 text-emerald-100 px-1.5 py-0.2 rounded-full ml-1">50 Qs</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-extrabold">Active View:</span>
              <span>
                {activeBank === 'previous'
                  ? 'Original 50 module questions from 4:00 PM Session (Available exclusively for Admin testing & inspection)'
                  : 'Re-conduct 50 bilingual questions from 7:00 PM Session'}
              </span>
            </div>
            <span className="text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
              {questions.length} Questions Loaded
            </span>
          </div>
        </div>

        {/* Questions Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions in English or Malayalam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredQuestions.length} of {questions.length} questions
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question (English & Malayalam)</th>
                  <th className="p-3">Options</th>
                  <th className="p-3">Correct Key</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredQuestions.map((q, idx) => (
                  <tr key={q.id || idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>

                    <td className="p-3 max-w-md space-y-1">
                      <div className="font-bold text-slate-900 text-xs">{q.question_text}</div>
                      {q.question_text_ml && (
                        <div className="text-[11px] text-emerald-800 font-medium">{q.question_text_ml}</div>
                      )}
                    </td>

                    <td className="p-3 max-w-xs space-y-0.5 text-[11px]">
                      <div className={q.correct_option === 'A' ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}>
                        <strong>A:</strong> {q.option_a}
                      </div>
                      <div className={q.correct_option === 'B' ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}>
                        <strong>B:</strong> {q.option_b}
                      </div>
                      <div className={q.correct_option === 'C' ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}>
                        <strong>C:</strong> {q.option_c}
                      </div>
                      <div className={q.correct_option === 'D' ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}>
                        <strong>D:</strong> {q.option_d}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-extrabold text-xs">
                        {q.correct_option}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                        {q.category || 'General'}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                        title="Edit question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No questions found matching the search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingQ ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text (English)</label>
                <textarea
                  required
                  rows={2}
                  value={form.question_text}
                  onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text (Malayalam - Optional)</label>
                <textarea
                  rows={2}
                  value={form.question_text_ml || ''}
                  onChange={(e) => setForm({ ...form, question_text_ml: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option A (English)</label>
                  <input
                    required
                    type="text"
                    value={form.option_a}
                    onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option A (Malayalam)</label>
                  <input
                    type="text"
                    value={form.option_a_ml || ''}
                    onChange={(e) => setForm({ ...form, option_a_ml: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option B (English)</label>
                  <input
                    required
                    type="text"
                    value={form.option_b}
                    onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option B (Malayalam)</label>
                  <input
                    type="text"
                    value={form.option_b_ml || ''}
                    onChange={(e) => setForm({ ...form, option_b_ml: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option C (English)</label>
                  <input
                    required
                    type="text"
                    value={form.option_c}
                    onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option C (Malayalam)</label>
                  <input
                    type="text"
                    value={form.option_c_ml || ''}
                    onChange={(e) => setForm({ ...form, option_c_ml: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option D (English)</label>
                  <input
                    required
                    type="text"
                    value={form.option_d}
                    onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option D (Malayalam)</label>
                  <input
                    type="text"
                    value={form.option_d_ml || ''}
                    onChange={(e) => setForm({ ...form, option_d_ml: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={form.correct_option}
                    onChange={(e) => setForm({ ...form, correct_option: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
