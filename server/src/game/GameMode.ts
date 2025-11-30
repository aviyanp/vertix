// Game mode rules

import type { GameModeConfig, GameModeType, Team } from "../types/index.ts";
import { GAME_MODE_CONFIG } from "../config/gameConfig.ts";

/**
 * GameMode - Game mode rules and configuration
 */
export class GameMode {
	private config: GameModeConfig;
	private redScore: number;
	private blueScore: number;
	private hardpointController: Team | null;
	private hardpointProgress: number;
	private gameStartTime: number;

	constructor(modeType: GameModeType = "TDM") {
		this.config = { ...GAME_MODE_CONFIG[modeType] };
		this.redScore = 0;
		this.blueScore = 0;
		this.hardpointController = null;
		this.hardpointProgress = 0;
		this.gameStartTime = Date.now();
	}

	/**
	 * Get game mode configuration
	 */
	public getConfig(): GameModeConfig {
		return this.config;
	}

	/**
	 * Get game mode name
	 */
	public getName(): GameModeType {
		return this.config.name;
	}

	/**
	 * Check if teams are enabled
	 */
	public hasTeams(): boolean {
		return this.config.teams;
	}

	/**
	 * Get score to win
	 */
	public getScoreToWin(): number {
		return this.config.score;
	}

	/**
	 * Get team scores
	 */
	public getScores(): { red: number; blue: number } {
		return { red: this.redScore, blue: this.blueScore };
	}

	/**
	 * Get score for a team
	 */
	public getTeamScore(team: Team): number {
		if (team === "red") return this.redScore;
		if (team === "blue") return this.blueScore;
		return 0;
	}

	/**
	 * Add score to a team
	 */
	public addScore(team: Team, points: number): void {
		if (team === "red") {
			this.redScore += points;
		} else if (team === "blue") {
			this.blueScore += points;
		}
	}

	/**
	 * Set team score
	 */
	public setScore(team: Team, score: number): void {
		if (team === "red") {
			this.redScore = score;
		} else if (team === "blue") {
			this.blueScore = score;
		}
	}

	/**
	 * Check if game is over
	 */
	public isGameOver(): boolean {
		if (this.hasTeams()) {
			return (
				this.redScore >= this.config.score ||
				this.blueScore >= this.config.score
			);
		}
		return false;
	}

	/**
	 * Get winning team
	 */
	public getWinningTeam(): Team | null {
		if (!this.isGameOver()) return null;

		if (this.redScore >= this.config.score) return "red";
		if (this.blueScore >= this.config.score) return "blue";
		return null;
	}

	/**
	 * Get leading team
	 */
	public getLeadingTeam(): Team | null {
		if (!this.hasTeams()) return null;
		if (this.redScore > this.blueScore) return "red";
		if (this.blueScore > this.redScore) return "blue";
		return null;
	}

	/**
	 * Process a kill
	 */
	public processKill(
		killerTeam: Team,
		victimTeam: Team,
		isTeamKill: boolean
	): number {
		let points = 0;

		if (this.hasTeams()) {
			if (!isTeamKill) {
				points = 1;
				this.addScore(killerTeam, 1);
			}
		}

		return points;
	}

	/**
	 * Update hardpoint control (for Hardpoint mode)
	 */
	public updateHardpoint(
		controllingTeam: Team | null,
		deltaTime: number
	): void {
		if (this.config.name !== "Hardpoint") return;

		if (controllingTeam) {
			this.hardpointController = controllingTeam;
			this.hardpointProgress += deltaTime / 1000;

			// Award point every second of control
			if (this.hardpointProgress >= 1) {
				this.addScore(controllingTeam, Math.floor(this.hardpointProgress));
				this.hardpointProgress %= 1;
			}
		} else {
			this.hardpointController = null;
			this.hardpointProgress = 0;
		}
	}

	/**
	 * Process zone capture (for Zone War mode)
	 */
	public processZoneCapture(scoringTeam: Team): number {
		if (this.config.name !== "Zone War") return 0;

		this.addScore(scoringTeam, 1);
		return 1;
	}

	/**
	 * Get hardpoint controller
	 */
	public getHardpointController(): Team | null {
		return this.hardpointController;
	}

	/**
	 * Get hardpoint progress
	 */
	public getHardpointProgress(): number {
		return this.hardpointProgress;
	}

	/**
	 * Get game duration in milliseconds
	 */
	public getGameDuration(): number {
		return Date.now() - this.gameStartTime;
	}

	/**
	 * Get description for a team
	 */
	public getDescription(team: Team): string {
		if (team === "blue") {
			return this.config.desc2;
		}
		return this.config.desc1;
	}

	/**
	 * Reset game mode state
	 */
	public reset(): void {
		this.redScore = 0;
		this.blueScore = 0;
		this.hardpointController = null;
		this.hardpointProgress = 0;
		this.gameStartTime = Date.now();
	}

	/**
	 * Serialize for network
	 */
	public toJSON(): GameModeConfig & {
		redScore: number;
		blueScore: number;
	} {
		return {
			...this.config,
			redScore: this.redScore,
			blueScore: this.blueScore,
		};
	}

	/**
	 * Get available game modes
	 */
	public static getAvailableModes(): GameModeType[] {
		return ["TDM", "FFA", "Hardpoint", "Zone War"];
	}

	/**
	 * Get mode config by name
	 */
	public static getModeConfig(mode: GameModeType): GameModeConfig {
		return { ...GAME_MODE_CONFIG[mode] };
	}

	/**
	 * Check if mode name is valid
	 */
	public static isValidMode(mode: string): mode is GameModeType {
		return mode in GAME_MODE_CONFIG;
	}
}
