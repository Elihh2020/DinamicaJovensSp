"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Difficulty, Question } from "../types";
import { Button } from "./Button";

interface QuestionFormProps {
  questions: Question[];
  onAdd: (question: Omit<Question, "id">) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onAdd,
  onBack,
  onDelete,
}) => {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);

  const [questionType, setQuestionType] = useState<"OPEN" | "MCQ">("OPEN");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  // UX: limpa campos quando trocar tipo
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
        answer: correctText, // compatível com seu GameRunner
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

  const deleteQuestion = (id: string) => {
    onDelete(id);
  };

  return (
    <div className="relative">
      <button
        onClick={onBack}
        className="p-3 hover:bg-slate-200 rounded-full transition-all group cursor-pointer"
        aria-label="Voltar"
        type="button"
      >
        <ArrowLeft
          size={32}
          className="group-hover:-translate-x-1 transition-transform cursor-pointer"
        />
      </button>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* CARD 1 */}
          <div className="w-full p-6 bg-white rounded-xl shadow-xl border border-slate-100 fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Cadastrar Nova Pergunta
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pergunta */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pergunta
                </label>
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
                <label className="block text-sm font-medium text-slate-700">
                  Tipo
                </label>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="qtype"
                      checked={questionType === "MCQ"}
                      onChange={() => setQuestionType("MCQ")}
                    />
                    <span className="text-slate-700 font-medium">
                      Múltipla escolha
                    </span>
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
                    <label className="block text-sm font-medium text-slate-700">
                      Alternativas (4)
                    </label>
                    <span className="text-xs text-slate-400">
                      Marque a alternativa correta
                    </span>
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
                          aria-label={`Marcar alternativa ${String.fromCharCode(
                            65 + idx
                          )} como correta`}
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
                          placeholder={`Alternativa ${String.fromCharCode(
                            65 + idx
                          )}`}
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resposta Correta
                  </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nível de Dificuldade
                </label>
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

          {/* CARD 2 */}
          <div className="w-full p-6 bg-white rounded-xl shadow-xl border border-slate-100 fade-in">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="p-2 bg-amber-100 rounded-lg text-amber-600">
                📋
              </span>
              Lista de Perguntas
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar mt-6">
              {questions.length === 0 ? (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 p-12 text-center rounded-2xl">
                  <p className="text-slate-400 italic">
                    Nenhuma pergunta cadastrada ainda.
                  </p>
                </div>
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start gap-4 group hover:shadow-md transition-shadow"
                  >
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                          q.difficulty === Difficulty.EASY
                            ? "bg-emerald-100 text-emerald-700"
                            : q.difficulty === Difficulty.MEDIUM
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                          {(q.type ?? "OPEN") === "MCQ" ? "Múltipla" : "Aberta"}
                        </span>
                      </div>

                      <p className="font-medium text-slate-800 line-clamp-2">
                        {q.text}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Excluir pergunta"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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
    </div>
  );
};
