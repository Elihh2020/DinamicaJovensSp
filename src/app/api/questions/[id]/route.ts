import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!numericId || isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM questions WHERE id = $1",
      [numericId]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Pergunta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Pergunta removida com sucesso",
    });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Erro ao deletar pergunta" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!numericId || isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    const { text, difficulty, type, answer, options, correctIndex } = body;

    const { rowCount, rows } = await pool.query(
      `
      UPDATE questions
      SET text = $1,
          difficulty = $2,
          type = $3,
          answer = $4,
          options = $5::jsonb,
          correct_index = $6,
          created_at = created_at
      WHERE id = $7
      RETURNING id, text, difficulty, type, answer, options, correct_index AS "correctIndex", created_at AS "createdAt"
      `,
      [
        text,
        difficulty,
        type,
        answer,
        options ? JSON.stringify(options) : null,
        correctIndex ?? null,
        numericId,
      ]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Pergunta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar pergunta" },
      { status: 500 }
    );
  }
}
