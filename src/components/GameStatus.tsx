"use client";

import type { Game } from "@/types/game";

interface Props {
	game: Game;
	playerSymbol: "X" | "O" | null;
	inviteUrl?: string;
	onReset: () => void;
}

export default function GameStatus({
	game,
	playerSymbol,
	inviteUrl,
	onReset,
}: Props) {
	const { status, current_turn, winner, players, mode } = game;

	const xName = players.X?.name ?? "Joueur X";
	const oName =
		players.O?.name ?? (mode === "pve" ? "Scorpio AI" : "En attente…");

	const isMyTurn = playerSymbol === current_turn;

	const winnerName = winner === "X" ? xName : winner === "O" ? oName : null;

	const copyInvite = () => {
		if (inviteUrl) navigator.clipboard.writeText(inviteUrl);
	};

	return (
		<div className="w-full max-w-sm space-y-3">
			{/* Joueurs */}
			<div className="grid grid-cols-2 gap-3">
				{(["X", "O"] as const).map((sym) => {
					const name = sym === "X" ? xName : oName;
					const isActive = status === "playing" && current_turn === sym;
					const isMe = playerSymbol === sym;

					return (
						<div
							key={sym}
							className={[
								"rounded-xl border p-3 transition-all",
								isActive
									? sym === "X"
										? "border-violet-500 bg-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
										: "border-cyan-500 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
									: "border-white/10 bg-white/5",
							].join(" ")}
						>
							<div className="flex items-center gap-2">
								<span
									className={`text-2xl font-black ${
										sym === "X" ? "text-violet-400" : "text-cyan-400"
									}`}
								>
									{sym === "X" ? "×" : "○"}
								</span>
								<div className="min-w-0">
									<p className="text-white font-semibold text-sm truncate">
										{name}
										{isMe && (
											<span className="ml-1 text-xs text-white/30">(vous)</span>
										)}
									</p>
									{isActive && (
										<p className="text-xs text-white/40 animate-pulse">joue…</p>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Message état */}
			<div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center min-h-[52px] flex items-center justify-center">
				{status === "waiting" && inviteUrl ? (
					<div className="w-full space-y-2">
						<p className="text-white/60 text-sm">
							Partagez ce lien au second joueur :
						</p>
						<div className="flex gap-2">
							<input
								readOnly
								value={inviteUrl}
								className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs font-mono min-w-0"
							/>
							<button
								type="button"
								onClick={copyInvite}
								className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
							>
								Copier
							</button>
						</div>
					</div>
				) : status === "playing" ? (
					<p className="text-white/70 text-sm">
						{isMyTurn ? (
							<span className="text-white font-semibold">
								✨ À vous de jouer !
							</span>
						) : (
							<span>
								En attente de{" "}
								<span className="text-white font-semibold">
									{current_turn === "X" ? xName : oName}
								</span>
								…
							</span>
						)}
					</p>
				) : status === "finished" ? (
					<p className="font-bold text-lg">
						{winner === "Draw" ? (
							<span className="text-white/70">🤝 Match nul !</span>
						) : (
							<span className="text-yellow-300">
								🏆 {winnerName} remporte la partie !
							</span>
						)}
					</p>
				) : null}
			</div>

			{/* Bouton rejouer */}
			{status === "finished" && (
				<button
					type="button"
					onClick={onReset}
					className="w-full py-3 rounded-xl font-bold text-sm bg-linear-to-r from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500 active:scale-[0.98] transition-all"
				>
					Rejouer
				</button>
			)}
		</div>
	);
}
