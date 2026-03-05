"use client";

import GameBoard from "@/components/GameBoard";
import GameSetup from "@/components/GameSetup";
import GameStatus from "@/components/GameStatus";
import { useMorpionGame } from "@/hooks/useMorpionGame";

export default function MorpionPage() {
	const {
		phase,
		game,
		playerSymbol,
		inviteUrl,
		loading,
		error,
		wsReady,
		handleCreateGame,
		handleJoinGame,
		handleMove,
		handleReset,
	} = useMorpionGame();

	return (
		<main className="min-h-screen bg-[#0a0a12] text-white flex flex-col items-center justify-center px-4 py-12">
			<header className="mb-10 text-center">
				<div className="inline-flex items-center gap-3 mb-2">
					<h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
						Scorpio AI
					</h1>
					{/* Indicateur connexion WS */}
					{phase === "playing" && (
						<span
							title={wsReady ? "Connexion temps réel active" : "Reconnexion…"}
							className={`w-2 h-2 rounded-full transition-colors ${
								wsReady
									? "bg-green-400 shadow-[0_0_6px_#4ade80]"
									: "bg-yellow-400 animate-pulse"
							}`}
						/>
					)}
				</div>
				<p className="text-white/30 text-sm">
					Morpion · Joueur vs IA · Joueur vs Joueur
				</p>
			</header>

			{error && (
				<div className="mb-6 w-full max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm text-center">
					{error}
				</div>
			)}

			{phase === "setup" ? (
				<GameSetup
					onCreateGame={handleCreateGame}
					onJoinGame={handleJoinGame}
					loading={loading}
				/>
			) : game ? (
				<div className="flex flex-col items-center gap-6 w-full">
					<GameStatus
						game={game}
						playerSymbol={playerSymbol}
						inviteUrl={inviteUrl}
						onReset={handleReset}
					/>
					<GameBoard
						game={game}
						playerSymbol={playerSymbol}
						onMove={handleMove}
						loading={loading}
					/>
					<button
						type="button"
						onClick={handleReset}
						className="text-white/25 hover:text-white/50 text-sm transition mt-2"
					>
						← Quitter la partie
					</button>
				</div>
			) : null}
		</main>
	);
}
