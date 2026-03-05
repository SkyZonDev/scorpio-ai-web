"use client";

import { useState } from "react";
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
	const [copied, setCopied] = useState(false);

	const xName = players.X?.name ?? "Joueur X";
	const oName =
		players.O?.name ?? (mode === "pve" ? "Scorpio AI" : "En attente…");

	const isMyTurn = playerSymbol === current_turn;
	const winnerName = winner === "X" ? xName : winner === "O" ? oName : null;

	const copyInvite = () => {
		if (inviteUrl) {
			navigator.clipboard.writeText(inviteUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div
			style={{
				width: "100%",
				maxWidth: "360px",
				display: "flex",
				flexDirection: "column",
				gap: "12px",
			}}
		>
			{/* Player cards */}
			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
			>
				{(["X", "O"] as const).map((sym) => {
					const pName = sym === "X" ? xName : oName;
					const isActive = status === "playing" && current_turn === sym;
					const isMe = playerSymbol === sym;
					const isX = sym === "X";

					return (
						<div
							key={sym}
							style={{
								padding: "12px 14px",
								border: "2px solid #1c1917",
								background: isActive ? "#1c1917" : "#faf7f0",
								color: isActive ? "#faf7f0" : "#1c1917",
								boxShadow: isActive ? "3px 3px 0 #7c756f" : "2px 2px 0 #c5bfb9",
								transform: isX ? "rotate(-0.5deg)" : "rotate(0.5deg)",
								transition: "all 0.15s",
							}}
						>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<span
									style={{
										fontSize: "32px",
										fontWeight: 700,
										lineHeight: 1,
										color: isActive ? "#faf7f0" : isX ? "#c23b22" : "#2d5a8e",
										display: "inline-block",
										transform: isX ? "rotate(-4deg)" : "rotate(3deg)",
									}}
								>
									{isX ? "×" : "○"}
								</span>
								<div style={{ minWidth: 0 }}>
									<p
										style={{
											fontSize: "20px",
											fontWeight: 700,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											lineHeight: 1.2,
										}}
									>
										{pName}
										{isMe && (
											<span
												style={{
													marginLeft: "6px",
													fontSize: "14px",
													opacity: 0.5,
													fontWeight: 400,
												}}
											>
												(vous)
											</span>
										)}
									</p>
									{isActive && (
										<p
											style={{
												fontSize: "14px",
												opacity: 0.7,
												marginTop: "2px",
											}}
										>
											joue…
										</p>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Status message */}
			<div
				style={{
					padding: "14px 16px",
					border: "2px dashed #1c1917",
					background: "transparent",
					textAlign: "center",
					minHeight: "56px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{status === "waiting" && inviteUrl ? (
					<div
						style={{
							width: "100%",
							display: "flex",
							flexDirection: "column",
							gap: "8px",
						}}
					>
						<p style={{ fontSize: "16px", color: "#7c756f" }}>
							Partagez ce lien au second joueur :
						</p>
						<div style={{ display: "flex", gap: "8px" }}>
							<input
								readOnly
								value={inviteUrl}
								style={{
									flex: 1,
									background: "transparent",
									border: "none",
									borderBottom: "1px solid #1c1917",
									padding: "4px 0",
									fontSize: "13px",
									fontFamily: "'Courier New', monospace",
									color: "#1c1917",
									outline: "none",
									minWidth: 0,
								}}
							/>
							<button
								type="button"
								onClick={copyInvite}
								style={{
									padding: "4px 12px",
									border: "2px solid #1c1917",
									background: copied ? "#1c1917" : "transparent",
									color: copied ? "#faf7f0" : "#1c1917",
									fontSize: "16px",
									fontFamily: "inherit",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.15s",
									whiteSpace: "nowrap",
									flexShrink: 0,
								}}
							>
								{copied ? "✓ Copié" : "Copier"}
							</button>
						</div>
					</div>
				) : status === "playing" ? (
					<p style={{ fontSize: "20px", color: "#1c1917" }}>
						{isMyTurn ? (
							<span style={{ fontWeight: 700 }}>✨ À vous de jouer !</span>
						) : (
							<span style={{ color: "#7c756f" }}>
								En attente de{" "}
								<span style={{ color: "#1c1917", fontWeight: 700 }}>
									{current_turn === "X" ? xName : oName}
								</span>
								…
							</span>
						)}
					</p>
				) : status === "finished" ? (
					<p style={{ fontSize: "24px", fontWeight: 700 }}>
						{winner === "Draw" ? (
							<span style={{ color: "#7c756f" }}>🤝 Match nul !</span>
						) : (
							<span style={{ color: "#1c1917" }}>🏆 {winnerName} gagne !</span>
						)}
					</p>
				) : null}
			</div>

			{/* Replay */}
			{status === "finished" && (
				<PressButton onClick={onReset}>Rejouer →</PressButton>
			)}
		</div>
	);
}

function PressButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: React.ReactNode;
}) {
	const [pressed, setPressed] = useState(false);
	return (
		<button
			type="button"
			onClick={onClick}
			onMouseDown={() => setPressed(true)}
			onMouseUp={() => setPressed(false)}
			onMouseLeave={() => setPressed(false)}
			style={{
				width: "100%",
				padding: "13px",
				fontSize: "22px",
				fontWeight: 700,
				fontFamily: "inherit",
				border: "2px solid #1c1917",
				background: "#1c1917",
				color: "#faf7f0",
				cursor: "pointer",
				boxShadow: pressed ? "1px 1px 0 #7c756f" : "4px 4px 0 #7c756f",
				transform: pressed ? "translate(3px, 3px)" : "none",
				transition: "box-shadow 0.08s, transform 0.08s",
				borderRadius: "2px",
			}}
		>
			{children}
		</button>
	);
}
