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

	const label: React.CSSProperties = {
		display: "block",
		fontSize: "13px",
		color: "#9c9086",
		textTransform: "uppercase",
		letterSpacing: "0.08em",
		marginBottom: "8px",
	};

	const sketchInput: React.CSSProperties = {
		width: "100%",
		background: "transparent",
		border: "none",
		borderBottom: "2px solid #1c1917",
		padding: "6px 0",
		fontSize: "24px",
		fontFamily: "inherit",
		color: "#1c1917",
		outline: "none",
		boxSizing: "border-box",
	};

	return (
		<div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
			{/* Tabs */}
			<div
				style={{
					display: "flex",
					borderBottom: "2px solid #1c1917",
					marginBottom: "28px",
				}}
			>
				{(["create", "join"] as const).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						style={{
							flex: 1,
							padding: "10px 0",
							fontSize: "20px",
							fontWeight: 700,
							fontFamily: "inherit",
							background: tab === t ? "#1c1917" : "transparent",
							color: tab === t ? "#faf7f0" : "#9c9086",
							border: "none",
							borderBottom: tab === t ? "2px solid #1c1917" : "none",
							cursor: "pointer",
							transition: "all 0.15s",
							marginBottom: tab === t ? "-2px" : "0",
						}}
					>
						{t === "create" ? "Créer une partie" : "Rejoindre"}
					</button>
				))}
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
				{/* Nom */}
				<div>
					<label htmlFor="name" style={label}>
						Votre prénom
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={tab === "join" ? "Joueur 2" : "Joueur"}
						style={sketchInput}
					/>
				</div>

				{tab === "create" ? (
					<>
						{/* Mode */}
						<div>
							<label htmlFor="gamemode" style={label}>
								Mode de jeu
							</label>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "10px",
								}}
							>
								{(["pve", "pvp"] as const).map((m) => (
									<SketchButton
										key={m}
										active={mode === m}
										onClick={() => setMode(m)}
									>
										{m === "pve" ? "🤖  vs IA" : "👥  vs Ami"}
									</SketchButton>
								))}
							</div>
						</div>

						{/* Difficulté */}
						{mode === "pve" && (
							<div>
								<label htmlFor="difficulty" style={label}>
									Difficulté
								</label>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: "8px",
									}}
								>
									{DIFFICULTIES.map((d) => (
										<SketchButton
											key={d.value}
											active={difficulty === d.value}
											onClick={() => setDiff(d.value)}
											column
										>
											<span style={{ fontSize: "24px" }}>{d.emoji}</span>
											{d.label}
										</SketchButton>
									))}
								</div>
							</div>
						)}
					</>
				) : (
					<div>
						<label htmlFor="partyId" style={label}>
							ID ou lien de la partie
						</label>
						<input
							type="text"
							value={joinId}
							onChange={(e) => {
								const val = e.target.value;
								const match = val.match(/games\/([^/]+)\/join/);
								setJoinId(match ? match[1] : val);
							}}
							placeholder="a1b2c3d4 ou colle le lien"
							style={{
								...sketchInput,
								fontFamily: "'Courier New', monospace",
								fontSize: "18px",
							}}
						/>
					</div>
				)}

				{/* Submit */}
				<SketchButton
					onClick={handleSubmit}
					disabled={loading || (tab === "join" && !joinId.trim())}
					primary
				>
					{loading
						? "Chargement…"
						: tab === "create"
							? "Lancer la partie →"
							: "Rejoindre →"}
				</SketchButton>
			</div>
		</div>
	);
}

/* ── Reusable sketch-style button ── */
interface BtnProps {
	active?: boolean;
	primary?: boolean;
	disabled?: boolean;
	column?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
}

function SketchButton({
	active,
	primary,
	disabled,
	column,
	onClick,
	children,
}: BtnProps) {
	const [pressed, setPressed] = useState(false);

	const base: React.CSSProperties = {
		display: "flex",
		flexDirection: column ? "column" : "row",
		alignItems: "center",
		justifyContent: "center",
		gap: "4px",
		padding: primary ? "14px" : "12px",
		fontSize: "20px",
		fontWeight: primary ? 700 : 600,
		fontFamily: "inherit",
		border: "2px solid #1c1917",
		borderRadius: "2px",
		cursor: disabled ? "not-allowed" : "pointer",
		transition: "box-shadow 0.08s, transform 0.08s",
		userSelect: "none",
		opacity: disabled ? 0.35 : 1,
		width: primary ? "100%" : undefined,
		...(primary
			? {
					background: "#1c1917",
					color: "#faf7f0",
					boxShadow: pressed ? "1px 1px 0 #7c756f" : "4px 4px 0 #7c756f",
					transform: pressed ? "translate(3px, 3px)" : "none",
				}
			: active
				? {
						background: "#1c1917",
						color: "#faf7f0",
						boxShadow: "2px 2px 0 #7c756f",
					}
				: {
						background: "transparent",
						color: "#1c1917",
						boxShadow: "2px 2px 0 #c5bfb9",
					}),
	};

	return (
		<button
			type="button"
			style={base}
			onClick={!disabled ? onClick : undefined}
			onMouseDown={() => !disabled && setPressed(true)}
			onMouseUp={() => setPressed(false)}
			onMouseLeave={() => setPressed(false)}
		>
			{children}
		</button>
	);
}
