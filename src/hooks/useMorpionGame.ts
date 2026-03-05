import { HTTPError } from "ky";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api";
import type { Game } from "@/types/game";

type Phase = "setup" | "playing";

const WS_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useMorpionGame() {
	const [phase, setPhase] = useState<Phase>("setup");
	const [game, setGame] = useState<Game | null>(null);
	const [playerToken, setPlayerToken] = useState<string | null>(null);
	const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
	const [inviteUrl, setInviteUrl] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [wsReady, setWsReady] = useState(false);

	const socketRef = useRef<Socket | null>(null);
	const gameIdRef = useRef<string | null>(null);

	const disconnectSocket = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}
		setWsReady(false);
		gameIdRef.current = null;
	}, []);

	const connectSocket = useCallback(
		(gameId: string) => {
			disconnectSocket();
			gameIdRef.current = gameId;

			const socket = io(WS_BASE, {
				path: "/socket.io",
				query: { gameId },
				reconnection: true,
				reconnectionAttempts: Infinity,
				reconnectionDelay: 500,
				reconnectionDelayMax: 10_000,
			});

			socketRef.current = socket;

			socket.on("connect", () => {
				setWsReady(true);
				socket.emit("join", { gameId });
			});

			socket.on("disconnect", () => setWsReady(false));

			socket.on("state", (payload: { game: Game }) => {
				setGame(payload.game);
				if (payload.game.status === "finished") disconnectSocket();
			});

			socket.on("connect_error", () => setWsReady(false));
		},
		[disconnectSocket],
	);

	useEffect(() => () => disconnectSocket(), [disconnectSocket]);

	const handleCreateGame = useCallback(
		async (mode: "pve" | "pvp", name: string, difficulty: number) => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.createGame(mode, name, difficulty);
				setGame(res.game);
				setPlayerToken(res.player_token);
				setPlayerSymbol("X");
				setInviteUrl(res.invite_url);
				setPhase("playing");
				connectSocket(res.game.game_id);
			} catch (e) {
				setError(await extractError(e));
			} finally {
				setLoading(false);
			}
		},
		[connectSocket],
	);

	const handleJoinGame = useCallback(
		async (gameId: string, name: string) => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.joinGame(gameId, name);
				setGame(res.game);
				setPlayerToken(res.player_token);
				setPlayerSymbol("O");
				setInviteUrl(undefined);
				setPhase("playing");
				connectSocket(res.game.game_id);
			} catch (e) {
				setError(await extractError(e));
			} finally {
				setLoading(false);
			}
		},
		[connectSocket],
	);

	const handleMove = useCallback(
		async (row: number, col: number) => {
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
				if (updated.status === "finished") disconnectSocket();
			} catch (e) {
				setError(await extractError(e));
			} finally {
				setLoading(false);
			}
		},
		[disconnectSocket, game, playerToken],
	);

	const handleReset = useCallback(() => {
		disconnectSocket();
		setPhase("setup");
		setGame(null);
		setPlayerToken(null);
		setPlayerSymbol(null);
		setInviteUrl(undefined);
		setError(null);
	}, [disconnectSocket]);

	return {
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
	};
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
