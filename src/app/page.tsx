"use client";

import React, { useEffect, useState } from "react";
import { AppState, Question, Difficulty, GameSettings } from "./types";
import { Button } from "./components/Button";
import { QuestionForm } from "./components/QuestionForm";
import { GameRunner } from "./components/GameSlide";
import { Header } from "./components/Header/header";

const STORAGE_KEY = "quiz_questions";

// ✅ tipo do filtro no jogo
type GameQuestionType = "ALL" | "OPEN" | "MCQ";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>("HOME");
  const [questions, setQuestions] = useState<Question[]>([]);

  // ✅ adicionamos questionType aqui
  const [gameSettings, setGameSettings] = useState<GameSettings & { questionType: GameQuestionType }>({
    difficulty: Difficulty.EASY,
    timerDuration: 10,
    questionType: "ALL",
  });

  // carrega do localStorage somente no client
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setQuestions(JSON.parse(saved));
    } catch (err) {
      console.warn("Falha ao ler perguntas do localStorage:", err);
      setQuestions([]);
    }
  }, []);

  // salva no localStorage somente no client
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (err) {
      console.warn("Falha ao salvar perguntas no localStorage:", err);
    }
  }, [questions]);

  const addQuestion = (newQ: Omit<Question, "id">) => {
    const question: Question = {
      ...newQ,
      id: crypto.randomUUID(),
    };
    setQuestions((prev) => [...prev, question]);
  };

  const startGame = () => {
    const count = questions.filter((q) => {
      const sameDifficulty = q.difficulty === gameSettings.difficulty;

      const qType = (q.type ?? "OPEN") as "OPEN" | "MCQ";

      const matchType =
        gameSettings.questionType === "ALL"
          ? true
          : qType === gameSettings.questionType;

      return sameDifficulty && matchType;
    }).length;

    if (count === 0) {
      const typeLabel =
        gameSettings.questionType === "ALL"
          ? " (Abertas + Múltiplas)"
          : gameSettings.questionType === "OPEN"
          ? " (Apenas Abertas)"
          : " (Apenas Múltiplas)";

      alert(
        `Não há perguntas cadastradas para este nível de dificuldade${typeLabel}!`
      );
      return;
    }

    setAppState("GAME");
  };

  // ✅ helper para mostrar contagem por dificuldade e tipo escolhido
  const countByDifficulty = (d: Difficulty) => {
    return questions.filter((q) => {
      const sameDifficulty = q.difficulty === d;
      const qType = (q.type ?? "OPEN") as "OPEN" | "MCQ";

      const matchType =
        gameSettings.questionType === "ALL"
          ? true
          : qType === gameSettings.questionType;

      return sameDifficulty && matchType;
    }).length;
  };

  //Cor dos botões de tipos de perguntas
  const typeButtonStyle = (active: boolean) =>
  active
    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner"
    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* ✅ Header agora controla o appState */}
      <Header
        onRegisterClick={() => setAppState("REGISTER")}
        onHomeClick={() => setAppState("HOME")}
      />

      {appState === "HOME" && (
        <main className="max-w-6xl mx-auto px-4 py-12 space-y-16 fade-in">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-black tracking-tighter text-indigo-900">
              Dinâmica{" "}
              <span className="text-indigo-600 italic underline decoration-wavy decoration-indigo-300">
                Fé para Vencer
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              "Jesus Cristo é o mesmo, ontem, hoje e eternamente" - Hebreus 13:8. Prepare-se para uma
              jornada de perguntas e respostas que fortalecerá sua fé e conhecimento bíblico!
            </p>
          </div>

          {/* CONFIGURAÇÃO DA DINÂMICA */}
          <section className="flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8 w-full max-w-[700px]">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">🎮</span>
                Configurar Dinâmica
              </h2>

              <div className="space-y-6">
                {/* ✅ NOVO: selecionar tipo de pergunta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Tipo de Perguntas
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setGameSettings({ ...gameSettings, questionType: "ALL" })}
                      className={`py-4 px-2 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                        typeButtonStyle(gameSettings.questionType === "ALL")
                      }`}
                    >
                      Todas
                      <span className="block text-xs font-normal mt-1">
                        (Abertas + Múltiplas)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGameSettings({ ...gameSettings, questionType: "OPEN" })}
                      className={`py-4 px-2 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                        typeButtonStyle(gameSettings.questionType === "OPEN")
                      }`}
                    >
                      Abertas
                      <span className="block text-xs font-normal mt-1">
                        (Texto)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGameSettings({ ...gameSettings, questionType: "MCQ" })}
                      className={`py-4 px-2 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                        typeButtonStyle(gameSettings.questionType === "MCQ")
                      }`}
                    >
                      Múltiplas
                      <span className="block text-xs font-normal mt-1">
                        (Alternativas)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Selecione a Dificuldade
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.values(Difficulty) as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setGameSettings({ ...gameSettings, difficulty: d })}
                        className={`py-4 px-2 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                          gameSettings.difficulty === d
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner"
                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                        <span className="block text-xs font-normal mt-1">
                          ({countByDifficulty(d)} itens)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Duração do Cronômetro
                  </label>
                  <div className="flex gap-4">
                    {[5, 10, 15].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setGameSettings({ ...gameSettings, timerDuration: t as 5 | 10 | 15 })
                        }
                        className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                          gameSettings.timerDuration === t
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full py-6 text-xl cursor-pointer"
                  onClick={startGame}
                >
                  Sortear perguntas
                </Button>

                {/* ✅ dica: mostra o filtro atual */}
                <div className="text-center text-sm text-slate-500">
                  Filtro atual:{" "}
                  <span className="font-bold text-slate-700">
                    {gameSettings.questionType === "ALL"
                      ? "Todas"
                      : gameSettings.questionType === "OPEN"
                      ? "Abertas"
                      : "Múltiplas"}
                  </span>
                  {" • "}
                  <span className="font-bold text-slate-700">
                    {gameSettings.difficulty === Difficulty.EASY
                      ? "Fácil"
                      : gameSettings.difficulty === Difficulty.MEDIUM
                      ? "Médio"
                      : "Difícil"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {appState === "REGISTER" && (
        <div className="py-12">
          <QuestionForm
            questions={questions}
            onAdd={addQuestion}
            onBack={() => setAppState("HOME")}
            onDelete={(id) => setQuestions((prev) => prev.filter((q) => q.id !== id))}
          />
        </div>
      )}

      {appState === "GAME" && (
        <GameRunner
          questions={questions}
          settings={gameSettings}
          onExit={() => setAppState("HOME")}
        />
      )}

      {/* Footer */}
      <footer className="py-10 text-center text-slate-400 text-sm">
        <p>Juntos nos venceremos</p>
      </footer>
    </div>
  );
};

export default App;
