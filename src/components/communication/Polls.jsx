import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { formatDateTR } from '../../utils/currency';
import { 
  Vote, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Users, 
  X,
  PieChart,
  Check
} from 'lucide-react';

export const Polls = () => {
  const { 
    buildingData, 
    activeBuildingId, 
    userRole, 
    session,
    currentResident,
    refreshBuildingData 
  } = useAuth();

  const polls = buildingData?.polls || [];
  const flats = buildingData?.flats || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Evet, onaylıyorum', 'Hayır, katılmıyorum', 'Fiyat teklifi görülsün']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  // Oy kullanacak daire ID'si (Sakin ise kendi dairesi, yönetici/denetçi ise test amaçlı seçebilir)
  const voterFlatId = currentResident ? currentResident.id : session?.flatId || 'flat_1';

  const handleVote = async (pollId, optionId) => {
    try {
      await storage.votePoll(activeBuildingId, pollId, optionId, voterFlatId);
      await refreshBuildingData();
    } catch (err) {
      alert('Oy kullanılırken hata: ' + err.message);
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (text, index) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) {
      alert('Lütfen anket sorusunu ve en az 2 geçerli seçeneği giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storage.addPoll(activeBuildingId, {
        question: question.trim(),
        options: validOptions,
      });

      await refreshBuildingData();
      setQuestion('');
      setOptions(['Evet, onaylıyorum', 'Hayır, katılmıyorum', 'Fiyat teklifi görülsün']);
      setIsModalOpen(false);
    } catch (err) {
      alert('Anket oluşturulurken hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoll = async (poll) => {
    if (window.confirm(`"${poll.question}" anketini silmek istediğinizden emin misiniz?`)) {
      await storage.deletePoll(activeBuildingId, poll.id);
      await refreshBuildingData();
    }
  };

  return (
    <div className="space-y-4">
      {/* BAŞLIK & ANKET AÇ BUTONU */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-600" />
            Apartman Karar Anketleri
          </h3>
          <p className="text-xs text-slate-500">Ortak kararlar, tadilat ve iyileştirme oylamaları (Her daire 1 oy)</p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Anket Aç</span>
          </button>
        )}
      </div>

      {/* ANKET LİSTESİ */}
      {polls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
          Aktif veya geçmiş bir anket bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            // Toplam Oy Sayısı
            const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);

            // Mevcut kullanıcının dairesi kime oy vermiş?
            const userVotedOption = poll.options.find((opt) =>
              (opt.votes || []).includes(String(voterFlatId))
            );

            return (
              <div
                key={poll.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      Karar Oylaması
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1.5">
                      {poll.question}
                    </h4>
                  </div>

                  {isManagerOrAdmin && (
                    <button
                      onClick={() => handleDeletePoll(poll)}
                      className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"
                      title="Anketi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* SEÇENEKLER VE OY ÇUBUKLARI */}
                <div className="space-y-2.5">
                  {poll.options.map((opt) => {
                    const voteCount = opt.votes?.length || 0;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isSelectedByMe = userVotedOption?.id === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVote(poll.id, opt.id)}
                        className={`relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden ${
                          isSelectedByMe
                            ? 'border-purple-600 bg-purple-50/40 shadow-sm ring-1 ring-purple-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Arka Plan Yüzdelik İlerleme Çubuğu */}
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-500 opacity-20 pointer-events-none ${
                            isSelectedByMe ? 'bg-purple-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>

                        <div className="relative flex items-center justify-between gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelectedByMe ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelectedByMe && <Check className="w-3 h-3" />}
                            </div>

                            <span className={`font-semibold truncate ${isSelectedByMe ? 'text-purple-900' : 'text-slate-800'}`}>
                              {opt.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-medium text-slate-500">
                              {voteCount} Oy
                            </span>
                            <span className="font-black text-xs sm:text-sm text-slate-900 min-w-[36px] text-right">
                              %{percentage}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ALT BİLGİ */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Toplam <strong>{totalVotes} / {flats.length} daire</strong> oy kullandı
                  </span>
                  <span>{formatDateTR(poll.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YENİ ANKET AÇMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Vote className="w-5 h-5 text-purple-600" />
                Yeni Karar Anketi Başlat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Anket Sorusu / Konusu *</label>
                <textarea
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Örn: Otoparka araç tanıma sistemi kurulsun mu?"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Seçenekler</span>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[11px] text-purple-600 font-bold hover:underline"
                    >
                      + Seçenek Ekle
                    </button>
                  )}
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(e.target.value, idx)}
                        placeholder={`Seçenek ${idx + 1}`}
                        required
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  Anketi Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Polls;
