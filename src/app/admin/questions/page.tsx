'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Question } from '@/types';
import { HelpCircle, Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  const [form, setForm] = useState<Omit<Question, 'id'>>({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    category: 'Gandhi History',
    difficulty: 'MEDIUM',
    explanation: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/questions');
        if (res.ok) {
          const data = await res.json();
          setQuestions(Array.isArray(data) ? data : (data.questions || []));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingQ(null);
    setForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
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
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
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
      const listRes = await fetch('/api/admin/questions');
      if (listRes.ok) setQuestions(await listRes.json());
      setShowModal(false);
    } catch (err) {
      alert('Failed to save question');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      const listRes = await fetch('/api/admin/questions');
      if (listRes.ok) setQuestions(await listRes.json());
    } catch {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Quiz Question Management ({questions.length})</h1>
            <p className="text-xs text-slate-500">Correct options are stored exclusively server-side</p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question Text</th>
                  <th className="p-3">Options</th>
                  <th className="p-3">Correct Option</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900 max-w-xs">{q.question_text}</td>
                    <td className="p-3 text-[11px] text-slate-600 space-y-0.5">
                      <div>A: {q.option_a}</div>
                      <div>B: {q.option_b}</div>
                      <div>C: {q.option_c}</div>
                      <div>D: {q.option_d}</div>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        {q.correct_option}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{q.category}</td>
                    <td className="p-3 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingQ ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Question Text</label>
                  <textarea
                    required
                    rows={3}
                    value={form.question_text}
                    onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Option A</label>
                    <input
                      type="text"
                      required
                      value={form.option_a}
                      onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Option B</label>
                    <input
                      type="text"
                      required
                      value={form.option_b}
                      onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Option C</label>
                    <input
                      type="text"
                      required
                      value={form.option_c}
                      onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Option D</label>
                    <input
                      type="text"
                      required
                      value={form.option_d}
                      onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Correct Option (SECRET)</label>
                    <select
                      value={form.correct_option}
                      onChange={(e) => setForm({ ...form, correct_option: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-emerald-50 text-emerald-800 outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Save Question
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
