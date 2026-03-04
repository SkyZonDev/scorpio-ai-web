export interface GamePlayer {
	name: string;
}

export interface Game {
	game_id: string;
	mode: "pve" | "pvp";
	difficulty: number;
	board: string[]; // flat array [0..8]
	current_turn: "X" | "O";
	status: "waiting" | "playing" | "finished";
	winner: "X" | "O" | "Draw" | null;
	players: {
		X: GamePlayer;
		O: GamePlayer | null;
	};
}

export interface CreateGameResponse {
	player_token: string;
	invite_url?: string;
	game: Game;
}

export interface JoinGameResponse {
	player_token: string;
	game: Game;
}

export interface MoveResponse {
	game: Game;
}
export interface StateResponse {
	game: Game;
}
