"use client";

import { HTTPError } from "ky";
import { useCallback, useEffect, useRef, useState } from "react";
import GameBoard from "@/components/GameBoard";
import GameSetup from "@/components/GameSetup";
import GameStatus from "@/components/GameStatus";
import { api } from "@/lib/api";
import type { Game } from "@/types/game";

type Phase = "setup" | "playing";

// Dérive l'URL WebSocket depuis NEXT_PUBLIC_API_URL
const WS_BASE = (
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/^http/, "ws");

// Délai de reconnexion en ms (croissance exponentielle, max 10s)
const RECONNECT_DELAYS = [500, 1000, 2000, 4000, 8000, 10000];

export default function MorpionPage() {
	const [phase, setPhase] = useState<Phase>("setup");
	const [game, setGame] = useState<Game | null>(null);
	const [playerToken, setPlayerToken] = useState<string | null>(null);
	const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
	const [inviteUrl, setInviteUrl] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [wsReady, setWsReady] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const attemptRef = useRef(0);
	const gameIdRef = useRef<string | null>(null); // stable ref pour la reconnexion

	// ── WebSocket ───────────────────────────────────────────────

	const disconnectWS = useCallback(() => {
		if (reconnectRef.current) {
			clearTimeout(reconnectRef.current);
			reconnectRef.current = null;
		}
		if (wsRef.current) {
			wsRef.current.onclose = null; // évite la reconnexion automatique
			wsRef.current.close();
			wsRef.current = null;
		}
		setWsReady(false);
		attemptRef.current = 0;
	}, []);

	const connectWS = useCallback(
		(gameId: string) => {
			disconnectWS();
			gameIdRef.current = gameId;
			attemptRef.current = 0;

			const open = () => {
				const ws = new WebSocket(`${WS_BASE}/ws/${gameId}`);
				wsRef.current = ws;

				ws.onopen = () => {
					setWsReady(true);
					attemptRef.current = 0;
				};

				ws.onmessage = (ev) => {
					try {
						const msg = JSON.parse(ev.data as string);
						if (msg.type === "state") {
							setGame(msg.game as Game);
							if (msg.game.status === "finished") disconnectWS();
						}
					} catch {
						/* ignore */
					}
				};

				ws.onerror = () => setWsReady(false);

				ws.onclose = () => {
					setWsReady(false);
					// Reconnexion automatique (si la partie est toujours active)
					const delay =
						RECONNECT_DELAYS[
							Math.min(attemptRef.current, RECONNECT_DELAYS.length - 1)
						];
					attemptRef.current++;
					reconnectRef.current = setTimeout(() => {
						if (gameIdRef.current) open();
					}, delay);
				};
			};

			open();
		},
		[disconnectWS],
	);

	// Ping keep-alive toutes les 25s pour éviter les timeouts serveur
	useEffect(() => {
		const id = setInterval(() => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send("ping");
			}
		}, 25_000);
		return () => clearInterval(id);
	}, []);

	// Nettoyage au démontage
	useEffect(() => () => disconnectWS(), [disconnectWS]);

	// ── Créer une partie ─────────────────────────────────────────

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
			connectWS(res.game.game_id); // WS pour PvE ET PvP
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Rejoindre une partie ─────────────────────────────────────

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
			connectWS(res.game.game_id);
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Jouer un coup ────────────────────────────────────────────

	const handleMove = async (row: number, col: number) => {
		if (!game || !playerToken) return;
		setLoading(true);
		setError(null);
		try {
			// La réponse REST donne un retour immédiat ;
			// le WS broadcast confirme (et met à jour l'adversaire en PvP)
			const { game: updated } = await api.makeMove(
				game.game_id,
				playerToken,
				row,
				col,
			);
			setGame(updated);
			if (updated.status === "finished") disconnectWS();
		} catch (e) {
			setError(await extractError(e));
		} finally {
			setLoading(false);
		}
	};

	// ── Reset ────────────────────────────────────────────────────

	const handleReset = () => {
		disconnectWS();
		setPhase("setup");
		setGame(null);
		setPlayerToken(null);
		setPlayerSymbol(null);
		setInviteUrl(undefined);
		setError(null);
	};

	// ── Render ───────────────────────────────────────────────────

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
