"use client";

import { Circle, X } from "lucide-react";
import type { Game } from "@/types/game";

interface Props {
	game: Game;
	playerSymbol: "X" | "O" | null;
	onMove: (row: number, col: number) => Promise<void>;
	loading: boolean;
}

const WINNING_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8], // rows
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8], // cols
	[0, 4, 8],
	[2, 4, 6], // diags
];

/** Normalise le plateau en tableau plat de 9 cases (API peut renvoyer 2D ou plat). */
function normalizeBoard(board: string[] | string[][]): string[] {
	if (board.length === 0) return Array(9).fill(" ");
	const first = board[0];
	if (Array.isArray(first)) {
		// format 2D [[row0], [row1], [row2]]
		return (board as string[][]).flat().slice(0, 9);
	}
	return (board as string[]).slice(0, 9);
}

function getWinningCells(board: string[]): Set<number> {
	for (const line of WINNING_LINES) {
		const [a, b, c] = line;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return new Set(line);
		}
	}
	return new Set();
}

export default function GameBoard({
	game,
	playerSymbol,
	onMove,
	loading,
}: Props) {
	const { board: rawBoard, status, current_turn } = game;
	const board = normalizeBoard(rawBoard as string[] | string[][]);
	const winCells =
		status === "finished" ? getWinningCells(board) : new Set<number>();

	const canPlay =
		status === "playing" && playerSymbol === current_turn && !loading;

	const cells = Array.from({ length: 9 }, (_, idx) => ({
		idx,
		value: (board[idx] ?? " ").trim() || " ",
	}));

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="grid grid-cols-3 gap-2 p-2 w-fit">
				{cells.map(({ idx, value: cell }) => {
					const row = Math.floor(idx / 3) + 1;
					const col = (idx % 3) + 1;
					const isEmpty = cell === " ";
					const isWinCell = winCells.has(idx);
					const isPlayable = canPlay && isEmpty;

					return (
						<button
							key={idx}
							type="button"
							disabled={!isPlayable}
							onClick={() => isPlayable && onMove(row, col)}
							aria-label={
								isEmpty
									? `Case ${row}-${col}, vide`
									: `Case ${row}-${col}, ${cell}`
							}
							aria-disabled={!isPlayable}
							className={[
								"w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 text-4xl sm:text-5xl font-black transition-all duration-200 flex items-center justify-center relative overflow-hidden min-w-0",
								isWinCell
									? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.4)]"
									: "border-white/10 bg-white/5",
								isPlayable
									? "hover:bg-white/10 hover:border-white/30 cursor-pointer hover:scale-105 active:scale-95"
									: "cursor-default",
							].join(" ")}
						>
							{cell === "X" && (
								<span
									className={`${
										isWinCell ? "text-yellow-300" : "text-violet-400"
									} drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]`}
									aria-hidden
								>
									<X />
								</span>
							)}
							{cell === "O" && (
								<span
									className={`${
										isWinCell ? "text-yellow-300" : "text-cyan-400"
									} drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]`}
									aria-hidden
								>
									<Circle />
								</span>
							)}
							{isEmpty && isPlayable && (
								<span className="text-white/10 text-2xl sm:text-3xl opacity-0 hover:opacity-100 transition-opacity select-none pointer-events-none">
									{playerSymbol === "X" ? "×" : "○"}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
