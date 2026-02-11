"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Difficulty, Question } from "../types";
import { Button } from "./Button";

interface QuestionFormProps {
  questions: Question[];
  onAdd: (question: Omit<Question, "id">) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

type QType = "OPEN" | "MCQ";

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onAdd,
  onBack,
  onDelete,
}) => {
  // ====== CADASTRO ======
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);

  const [questionType, setQuestionType] = useState<QType>("OPEN");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  // ====== LISTA (FILTROS) ======
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedListType, setSelectedListType] = useState<QType>("OPEN"); // ✅ NOVO: aba "Abertas" ou "Múltiplas"

  // ====== MODAL EXCLUSÃO ======
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; text: string } | null>(null);

  const requestDelete = (q: Question) => {
    setPendingDelete({ id: q.id, text: q.text });
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  // ====== UX: limpa campos quando trocar tipo no cadastro ======
  useEffect(() => {
    if (questionType === "OPEN") {
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
    } else {
      setAnswer("");
    }
  }, [questionType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const qText = text.trim();
    if (!qText) return;

    if (questionType === "MCQ") {
      const trimmedOptions = options.map((o) => o.trim());

      if (trimmedOptions.some((o) => !o)) {
        alert("Preencha todas as alternativas (A, B, C e D).");
        return;
      }

      const correctText = trimmedOptions[correctIndex];

      onAdd({
        text: qText,
        difficulty,
        type: "MCQ",
        options: trimmedOptions,
        correctIndex,
        answer: correctText, // compatível com GameRunner (ele usa answer pra comparar)
      });

      // reset
      setText("");
      setAnswer("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setQuestionType("OPEN");
      return;
    }

    // OPEN
    const aText = answer.trim();
    if (!aText) return;

    onAdd({
      text: qText,
      answer: aText,
      difficulty,
      type: "OPEN",
    });

    // reset
    setText("");
    setAnswer("");
    setQuestionType("OPEN");
  };

  // ====== CONTADORES / FILTROS (LISTA) ======
  const levels = useMemo(() => Object.values(Difficulty) as Difficulty[], []);

  const totalAll = questions.length;

  const totalAllOpen = useMemo(
    () => questions.filter((q) => (q.type ?? "OPEN") === "OPEN").length,
    [questions]
  );

  const totalAllMcq = useMemo(
    () => questions.filter((q) => (q.type ?? "OPEN") === "MCQ").length,
    [questions]
  );

  // contadores por dificuldade, mas considerando o tipo selecionado na lista
  const getCountsForLevelByType = (level: Difficulty, type: QType) => {
    const list = questions.filter((q) => q.difficulty === level && (q.type ?? "OPEN") === type);
    return { total: list.length };
  };

  // lista filtrada: por tipo (aba) + por dificuldade
  const filteredQuestions = useMemo(() => {
    return questions.filter(
      (q) =>
        q.difficulty === selectedDifficulty &&
        (q.type ?? "OPEN") === selectedListType
    );
  }, [questions, selectedDifficulty, selectedListType]);

  const selectedCounts = useMemo(() => {
    return getCountsForLevelByType(selectedDifficulty, selectedListType);
  }, [questions, selectedDifficulty, selectedListType]);

  const difficultyLabel =
    selectedDifficulty === Difficulty.EASY
      ? "Fácil"
      : selectedDifficulty === Difficulty.MEDIUM
      ? "Médio"
      : "Difícil";

  const buttonStyle = (level: Difficulty, active: boolean) => {
    if (!active) return "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300";

    if (level === Difficulty.EASY) return "border-emerald-600 bg-emerald-50 text-emerald-700";
    if (level === Difficulty.MEDIUM) return "border-amber-600 bg-amber-50 text-amber-700";
    return "border-rose-600 bg-rose-50 text-rose-700";
  };

  const typeTabStyle = (active: boolean) =>
    active
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300";

  return (
    <div className="relative">
      <button
        onClick={onBack}
        className="p-3 hover:bg-slate-200 rounded-full transition-all group cursor-pointer"
        aria-label="Voltar"
        type="button"
      >
        <ArrowLeft size={32} className="group-hover:-translate-x-1 transition-transform cursor-pointer" />
      </button>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ================== CARD 1 (CADASTRO) ================== */}
          <div className="w-full p-6 bg-white rounded-xl shadow-xl border border-slate-100 fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Cadastrar Nova Pergunta</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pergunta */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pergunta</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-25"
                  placeholder="Digite a pergunta aqui..."
                  required
                />
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-3">
                <label className="block text-sm font-medium text-slate-700">Tipo</label>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="qtype"
                      checked={questionType === "MCQ"}
                      onChange={() => setQuestionType("MCQ")}
                    />
                    <span className="text-slate-700 font-medium">Múltipla escolha</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="qtype"
                      checked={questionType === "OPEN"}
                      onChange={() => setQuestionType("OPEN")}
                    />
                    <span className="text-slate-700 font-medium">Aberta</span>
                  </label>
                </div>
              </div>

              {/* MCQ: alternativas */}
              {questionType === "MCQ" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="block text-sm font-medium text-slate-700">Alternativas (4)</label>
                    <span className="text-xs text-slate-400">Marque a alternativa correta</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          className="cursor-pointer"
                          aria-label={`Marcar alternativa ${String.fromCharCode(65 + idx)} como correta`}
                        />

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...options];
                            next[idx] = e.target.value;
                            setOptions(next);
                          }}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPEN: resposta */}
              {questionType === "OPEN" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resposta Correta</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Qual é a resposta?"
                    required
                  />
                </div>
              )}

              {/* Dificuldade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nível de Dificuldade</label>
                <div className="flex gap-4">
                  {(Object.values(Difficulty) as Difficulty[]).map((level) => (
                    <label key={level} className="flex-1">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={() => setDifficulty(level)}
                        className="sr-only peer"
                      />
                      <div className="text-center py-3 rounded-lg border-2 border-slate-100 cursor-pointer transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:border-slate-200">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full cursor-pointer">
                Adicionar à Dinâmica
              </Button>
            </form>
          </div>

          {/* ================== CARD 2 (LISTA) ================== */}
          <div className="w-full p-6 bg-white rounded-xl shadow-xl border border-slate-100 fade-in">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="p-2 bg-amber-100 rounded-lg text-amber-600">📋</span>
                Lista de Perguntas
              </h2>

              {/* Total geral */}
              <div className="text-right">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </div>
                <div className="text-2xl font-black text-slate-800">{totalAll}</div>
              </div>
            </div>

            {/* chips (mantidos) */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                Abertas: {totalAllOpen}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                Múltiplas: {totalAllMcq}
              </span>
            </div>

            {/* ✅ NOVO: botões para selecionar o TIPO que controla as dificuldades e a lista */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedListType("OPEN")}
                className={`rounded-2xl border-2 p-3 transition-all cursor-pointer ${typeTabStyle(
                  selectedListType === "OPEN"
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wide text-sm">Abertas</span>
                  <span className="text-lg font-black">{totalAllOpen}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedListType("MCQ")}
                className={`rounded-2xl border-2 p-3 transition-all cursor-pointer ${typeTabStyle(
                  selectedListType === "MCQ"
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wide text-sm">Múltiplas</span>
                  <span className="text-lg font-black">{totalAllMcq}</span>
                </div>
              </button>
            </div>

            {/* Abas (botões) de dificuldade - agora filtradas pelo tipo selecionado */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {levels.map((level) => {
                const counts = getCountsForLevelByType(level, selectedListType);
                const active = selectedDifficulty === level;

                const label =
                  level === Difficulty.EASY ? "Fácil" : level === Difficulty.MEDIUM ? "Médio" : "Difícil";

                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`rounded-2xl border-2 p-3 transition-all text-left cursor-pointer ${buttonStyle(
                      level,
                      active
                    )}`}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm uppercase tracking-wide">{label}</span>
                      <span className="text-lg font-black">{counts.total}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Resumo (mantém design, mas agora é do tipo selecionado) */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selecionado:
                </span>
                <span className="text-sm font-black text-slate-800">
                  {selectedListType === "OPEN" ? "Abertas" : "Múltiplas"} • {difficultyLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200">
                  Total: {selectedCounts.total}
                </span>
              </div>
            </div>

            {/* Lista filtrada (tipo + dificuldade) */}
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar mt-6">
              {filteredQuestions.length === 0 ? (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 p-12 text-center rounded-2xl">
                  <p className="text-slate-400 italic">
                    Nenhuma pergunta cadastrada para{" "}
                    {selectedListType === "OPEN" ? "Abertas" : "Múltiplas"} • {difficultyLabel}.
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start gap-4 group hover:shadow-md transition-shadow"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            q.difficulty === Difficulty.EASY
                              ? "bg-emerald-100 text-emerald-700"
                              : q.difficulty === Difficulty.MEDIUM
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                          {(q.type ?? "OPEN") === "MCQ" ? "Múltipla" : "Aberta"}
                        </span>
                      </div>

                      <p className="font-medium text-slate-800 line-clamp-2">{q.text}</p>
                    </div>

                    <button
                      onClick={() => requestDelete(q)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      aria-label="Excluir pergunta"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EXCLUSÃO */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={cancelDelete}
            aria-label="Fechar modal"
          />

          {/* modal */}
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 z-10">
            <h3 id="confirm-title" className="text-xl font-black text-slate-900">
              Excluir pergunta?
            </h3>

            <p className="mt-2 text-slate-600">
              Tem certeza que deseja excluir esta pergunta? Essa ação não pode ser desfeita.
            </p>

            {pendingDelete?.text && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-700 line-clamp-3">{pendingDelete.text}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black hover:bg-rose-500 transition cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
