"use client";

import { HTTPError } from "ky";
import { useCallback, useEffect, useRef, useState } from "react";
import GameBoard from "@/components/GameBoard";
import GameSetup from "@/components/GameSetup";
import GameStatus from "@/components/GameStatus";
import { api } from "@/lib/api";
import type { Game } from "@/types/game";

type Phase = "setup" | "playing";

export default function MorpionPage() {
	const [phase, setPhase] = useState<Phase>("setup");
	const [game, setGame] = useState<Game | null>(null);
	const [playerToken, setPlayerToken] = useState<string | null>(null);
	const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
	const [inviteUrl, setInviteUrl] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// ── Polling PvP ───────────────────────────────────────────
	const stopPolling = useCallback(() => {
		if (pollingRef.current) {
			clearInterval(pollingRef.current);
			pollingRef.current = null;
		}
	}, []);

	const startPolling = useCallback(
		(gameId: string) => {
			stopPolling();
			pollingRef.current = setInterval(async () => {
				try {
					const { game: updated } = await api.getState(gameId);
					setGame(updated);
					if (updated.status === "finished") stopPolling();
				} catch {
					// silently ignore polling errors
				}
			}, 1200);
		},
		[stopPolling],
	);

	useEffect(() => () => stopPolling(), [stopPolling]);

	// ── Créer une partie ──────────────────────────────────────
	const handleCreateGame = async (
		mode: "pve" | "pvp",
		name: string,
		difficulty: number,
	) => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.createGame(mode, name, difficulty);
			setGame(res.game);
			setPlayerToken(res.player_token);
			setPlayerSymbol("X");
			setInviteUrl(res.invite_url);
			setPhase("playing");

			if (mode === "pvp") startPolling(res.game.game_id);
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Rejoindre une partie ──────────────────────────────────
	const handleJoinGame = async (gameId: string, name: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.joinGame(gameId, name);
			setGame(res.game);
			setPlayerToken(res.player_token);
			setPlayerSymbol("O");
			setInviteUrl(undefined);
			setPhase("playing");
			startPolling(res.game.game_id);
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Jouer un coup ─────────────────────────────────────────
	const handleMove = async (row: number, col: number) => {
		if (!game || !playerToken) return;
		setLoading(true);
		setError(null);
		try {
			const { game: updated } = await api.makeMove(
				game.game_id,
				playerToken,
				row,
				col,
			);
			setGame(updated);
			if (updated.status === "finished") stopPolling();
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Reset ─────────────────────────────────────────────────
	const handleReset = () => {
		stopPolling();
		setPhase("setup");
		setGame(null);
		setPlayerToken(null);
		setPlayerSymbol(null);
		setInviteUrl(undefined);
		setError(null);
	};

	// ── Render ────────────────────────────────────────────────
	return (
		<main className="min-h-screen bg-[#0a0a12] text-white flex flex-col items-center justify-center px-4 py-12">
			{/* Header */}
			<header className="mb-10 text-center">
				<div className="inline-flex items-center gap-3 mb-2">
					<h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
						Scorpio AI
					</h1>
				</div>
				<p className="text-white/30 text-sm">
					Morpion · Joueur vs IA · Joueur vs Joueur
				</p>
			</header>

			{/* Erreur */}
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

// ── Helpers ───────────────────────────────────────────────────
async function extractError(e: unknown): Promise<string> {
	if (e instanceof HTTPError) {
		try {
			const body = await e.response.json<{ detail: string }>();
			return body.detail ?? "Erreur serveur.";
		} catch {
			return `Erreur ${e.response.status}`;
		}
	}
	return "Erreur réseau, vérifiez votre connexion.";
}
