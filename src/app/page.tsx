"use client";

import { Caveat } from "next/font/google";
import GameBoard from "@/components/GameBoard";
import GameSetup from "@/components/GameSetup";
import GameStatus from "@/components/GameStatus";
import { useMorpionGame } from "@/hooks/useMorpionGame";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"] });

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
		<main
			className={caveat.className}
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "48px 16px",
				backgroundColor: "#faf7f0",
				backgroundImage: `
          repeating-linear-gradient(
            transparent,
            transparent 31px,
            rgba(100, 120, 200, 0.12) 31px,
            rgba(100, 120, 200, 0.12) 32px
          )
        `,
				color: "#1c1917",
				position: "relative",
			}}
		>
			{/* Margin line */}
			<div
				aria-hidden
				style={{
					position: "fixed",
					left: "72px",
					top: 0,
					bottom: 0,
					width: "1px",
					background: "rgba(200, 60, 60, 0.18)",
					pointerEvents: "none",
				}}
			/>

			<header style={{ marginBottom: "40px", textAlign: "center" }}>
				<div
					style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}
				>
					<h1
						style={{
							fontSize: "clamp(48px, 8vw, 72px)",
							fontWeight: 700,
							lineHeight: 1,
							color: "#1c1917",
							letterSpacing: "-0.01em",
						}}
					>
						Scorpio AI
					</h1>
					{phase === "playing" && (
						<span
							title={wsReady ? "Connexion temps réel active" : "Reconnexion…"}
							style={{
								width: "10px",
								height: "10px",
								borderRadius: "50%",
								border: "2px solid #1c1917",
								background: wsReady ? "#4caf50" : "#f5a623",
								display: "inline-block",
								flexShrink: 0,
								animation: wsReady ? "none" : "pulse 1s infinite",
							}}
						/>
					)}
				</div>
				<p
					style={{
						marginTop: "6px",
						fontSize: "20px",
						color: "#9c9086",
						fontStyle: "italic",
					}}
				>
					morpion · vs ia · vs ami
				</p>
			</header>

			{error && (
				<div
					style={{
						marginBottom: "24px",
						width: "100%",
						maxWidth: "440px",
						padding: "12px 16px",
						border: "2px solid #c23b22",
						background: "rgba(194, 59, 34, 0.06)",
						color: "#c23b22",
						fontSize: "18px",
						textAlign: "center",
					}}
				>
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
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "28px",
						width: "100%",
					}}
				>
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
						style={{
							background: "transparent",
							border: "none",
							fontSize: "18px",
							color: "#9c9086",
							cursor: "pointer",
							fontFamily: "inherit",
							textDecoration: "underline",
							textUnderlineOffset: "3px",
						}}
					>
						← Quitter la partie
					</button>
				</div>
			) : null}

			<style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
		</main>
	);
}
