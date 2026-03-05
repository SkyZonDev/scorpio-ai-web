"use client";

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
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

function normalizeBoard(board: string[] | string[][]): string[] {
	if (board.length === 0) return Array(9).fill(" ");
	const first = board[0];
	if (Array.isArray(first)) {
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

/** A single cell in the board */
function Cell({
	idx,
	value,
	isWin,
	isPlayable,
	playerSymbol,
	onPlay,
}: {
	idx: number;
	value: string;
	isWin: boolean;
	isPlayable: boolean;
	playerSymbol: "X" | "O" | null;
	onPlay: () => void;
}) {
	const row = Math.floor(idx / 3);
	const col = idx % 3;

	const cellStyle: React.CSSProperties = {
		width: "96px",
		height: "96px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		cursor: isPlayable ? "pointer" : "default",
		background: isWin ? "rgba(255, 210, 30, 0.5)" : "transparent",
		// Inner grid lines only
		borderRight: col < 2 ? "2.5px solid #1c1917" : "none",
		borderBottom: row < 2 ? "2.5px solid #1c1917" : "none",
		transition: "background 0.15s",
	};

	const isEmpty = value === " ";

	return (
		<button
			type="button"
			disabled={!isPlayable}
			onClick={isPlayable ? onPlay : undefined}
			aria-label={
				isEmpty
					? `Case ${row + 1}-${col + 1}, vide`
					: `Case ${row + 1}-${col + 1}, ${value}`
			}
			style={{
				...cellStyle,
				outline: "none",
				padding: 0,
				fontFamily: "inherit",
			}}
		>
			{value === "X" && (
				<span
					aria-hidden
					style={{
						fontSize: "52px",
						fontWeight: 700,
						lineHeight: 1,
						color: isWin ? "#1c1917" : "#c23b22",
						display: "inline-block",
						transform: "rotate(-5deg)",
						userSelect: "none",
					}}
				>
					×
				</span>
			)}
			{value === "O" && (
				<span
					aria-hidden
					style={{
						fontSize: "48px",
						fontWeight: 700,
						lineHeight: 1,
						color: isWin ? "#1c1917" : "#2d5a8e",
						display: "inline-block",
						transform: "rotate(4deg)",
						userSelect: "none",
					}}
				>
					○
				</span>
			)}
			{isEmpty && isPlayable && <HoverHint symbol={playerSymbol} />}
		</button>
	);
}

/** Ghost symbol shown on hover */
function HoverHint({ symbol }: { symbol: "X" | "O" | null }) {
	return (
		<span
			aria-hidden
			style={{
				fontSize: "40px",
				fontWeight: 700,
				lineHeight: 1,
				color: "rgba(28,25,23,0.1)",
				display: "inline-block",
				transform: symbol === "X" ? "rotate(-5deg)" : "rotate(4deg)",
				userSelect: "none",
				pointerEvents: "none",
				// Show only on hover via parent :hover — we use a CSS trick with opacity
				opacity: 0,
				transition: "opacity 0.15s",
			}}
			className="cell-hint"
		>
			{symbol === "X" ? "×" : "○"}
		</span>
	);
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

	return (
		<>
			<style>{`
        button:hover .cell-hint { opacity: 1 !important; }
      `}</style>
			<div
				style={{
					display: "inline-grid",
					gridTemplateColumns: "repeat(3, 96px)",
					// Slight paper warp feel
					transform: "rotate(-0.3deg)",
				}}
			>
				{Array.from({ length: 9 }, (i, idx) => {
					const raw = board[idx] ?? " ";
					const value = raw.trim() || " ";
					const isEmpty = value === " ";
					const isWin = winCells.has(idx);
					const isPlayable = canPlay && isEmpty;
					const row = Math.floor(idx / 3) + 1;
					const col = (idx % 3) + 1;

					return (
						<Cell
							key={`cell-${i}`}
							idx={idx}
							value={value}
							isWin={isWin}
							isPlayable={isPlayable}
							playerSymbol={playerSymbol}
							onPlay={() => isPlayable && onMove(row, col)}
						/>
					);
				})}
			</div>
		</>
	);
}
