"use client";

import { useState } from "react";

interface Props {
	onCreateGame: (
		mode: "pve" | "pvp",
		name: string,
		difficulty: number,
	) => Promise<void>;
	onJoinGame: (gameId: string, name: string) => Promise<void>;
	loading: boolean;
}

export default function GameSetup({
	onCreateGame,
	onJoinGame,
	loading,
}: Props) {
	const [tab, setTab] = useState<"create" | "join">("create");
	const [mode, setMode] = useState<"pve" | "pvp">("pve");
	const [name, setName] = useState("");
	const [difficulty, setDiff] = useState(3);
	const [joinId, setJoinId] = useState("");

	const DIFFICULTIES = [
		{ value: 1, label: "Facile", emoji: "🌱" },
		{ value: 2, label: "Moyen", emoji: "⚡" },
		{ value: 3, label: "Impossible", emoji: "💀" },
	];

	const handleSubmit = async () => {
		if (tab === "create") {
			await onCreateGame(mode, name || "Joueur", difficulty);
		} else {
			await onJoinGame(joinId.trim(), name || "Joueur 2");
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			{/* Tabs */}
			<div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
				{(["create", "join"] as const).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						className={`flex-1 py-3 text-sm font-semibold transition-all ${
							tab === t
								? "bg-violet-600 text-white"
								: "text-white/40 hover:text-white/70 hover:bg-white/5"
						}`}
					>
						{t === "create" ? "Créer une partie" : "Rejoindre"}
					</button>
				))}
			</div>

			<div className="space-y-4">
				{/* Nom du joueur */}
				<div>
					<label
						htmlFor="playerName"
						className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5"
					>
						Votre prénom
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={tab === "join" ? "Joueur 2" : "Joueur"}
						className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
					/>
				</div>

				{tab === "create" ? (
					<>
						{/* Mode */}
						<div>
							<label
								htmlFor="gameMode"
								className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5"
							>
								Mode de jeu
							</label>
							<div className="grid grid-cols-2 gap-3">
								{(["pve", "pvp"] as const).map((m) => (
									<button
										key={m}
										type="button"
										onClick={() => setMode(m)}
										className={`py-3 rounded-lg border font-semibold text-sm transition-all ${
											mode === m
												? "border-violet-500 bg-violet-500/20 text-violet-300"
												: "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
										}`}
									>
										{m === "pve" ? "🤖  vs IA" : "👥  vs Ami"}
									</button>
								))}
							</div>
						</div>

						{/* Difficulté (PvE uniquement) */}
						{mode === "pve" && (
							<div>
								<label
									htmlFor="difficulty"
									className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5"
								>
									Difficulté
								</label>
								<div className="grid grid-cols-3 gap-2">
									{DIFFICULTIES.map((d) => (
										<button
											key={d.value}
											type="button"
											onClick={() => setDiff(d.value)}
											className={`py-3 rounded-lg border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
												difficulty === d.value
													? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
													: "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
											}`}
										>
											<span className="text-lg">{d.emoji}</span>
											{d.label}
										</button>
									))}
								</div>
							</div>
						)}
					</>
				) : (
					/* Rejoindre : ID de partie */
					<div>
						<label
							htmlFor="partyID"
							className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5"
						>
							ID ou lien de la partie
						</label>
						<input
							type="text"
							value={joinId}
							onChange={(e) => {
								// Accepte l'URL complète ou juste l'ID
								const val = e.target.value;
								const match = val.match(/games\/([^/]+)\/join/);
								setJoinId(match ? match[1] : val);
							}}
							placeholder="a1b2c3d4 ou colle le lien complet"
							className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition font-mono text-sm"
						/>
					</div>
				)}

				{/* Bouton */}
				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading || (tab === "join" && !joinId.trim())}
					className="w-full py-3.5 rounded-xl font-bold text-base bg-linear-to-r from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
				>
					{loading
						? "Chargement…"
						: tab === "create"
							? "Lancer la partie"
							: "Rejoindre"}
				</button>
			</div>
		</div>
	);
}
