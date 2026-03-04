import ky from "ky";
import type {
	CreateGameResponse,
	JoinGameResponse,
	MoveResponse,
	StateResponse,
} from "@/types/game";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const client = ky.create({ prefixUrl: BASE });

export const api = {
	createGame: (mode: "pve" | "pvp", player_name: string, difficulty: number) =>
		client
			.post("games", { json: { mode, player_name, difficulty } })
			.json<CreateGameResponse>(),

	joinGame: (game_id: string, player_name: string) =>
		client
			.post(`games/${game_id}/join`, { json: { player_name } })
			.json<JoinGameResponse>(),

	makeMove: (game_id: string, player_token: string, row: number, col: number) =>
		client
			.post(`games/${game_id}/move`, { json: { player_token, row, col } })
			.json<MoveResponse>(),

	getState: (game_id: string) =>
		client.get(`games/${game_id}`).json<StateResponse>(),
};
