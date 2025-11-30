// Team Manager - Red/Blue team management, auto-balancing

import type { Team, PlayerState } from "../types/index.ts";
import { TEAM_CONFIG } from "../config/gameConfig.ts";
import { Player } from "../entities/Player.ts";

/**
 * TeamManager - Manages team assignments and balancing
 */
export class TeamManager {
	private redTeam: Set<number>;
	private blueTeam: Set<number>;
	private teamsEnabled: boolean;

	constructor(teamsEnabled: boolean = true) {
		this.redTeam = new Set();
		this.blueTeam = new Set();
		this.teamsEnabled = teamsEnabled;
	}

	/**
	 * Enable or disable teams
	 */
	public setTeamsEnabled(enabled: boolean): void {
		this.teamsEnabled = enabled;
		if (!enabled) {
			this.clearTeams();
		}
	}

	/**
	 * Check if teams are enabled
	 */
	public areTeamsEnabled(): boolean {
		return this.teamsEnabled;
	}

	/**
	 * Assign a player to a team (auto-balance)
	 */
	public assignTeam(player: Player): Team {
		if (!this.teamsEnabled) {
			player.setTeam("");
			return "";
		}

		const team = this.getAutoBalanceTeam();
		this.addToTeam(player, team);
		return team;
	}

	/**
	 * Get the team with fewer players (for auto-balance)
	 */
	public getAutoBalanceTeam(): Team {
		const redCount = this.redTeam.size;
		const blueCount = this.blueTeam.size;

		if (redCount < blueCount) {
			return TEAM_CONFIG.RED;
		} else if (blueCount < redCount) {
			return TEAM_CONFIG.BLUE;
		} else {
			// Equal teams, randomly assign
			return Math.random() < 0.5 ? TEAM_CONFIG.RED : TEAM_CONFIG.BLUE;
		}
	}

	/**
	 * Add a player to a specific team
	 */
	public addToTeam(player: Player, team: Team): void {
		// Remove from current team first
		this.removeFromTeam(player);

		if (team === TEAM_CONFIG.RED) {
			this.redTeam.add(player.index);
		} else if (team === TEAM_CONFIG.BLUE) {
			this.blueTeam.add(player.index);
		}

		player.setTeam(team);
	}

	/**
	 * Remove a player from their team
	 */
	public removeFromTeam(player: Player): void {
		this.redTeam.delete(player.index);
		this.blueTeam.delete(player.index);
	}

	/**
	 * Switch a player's team
	 */
	public switchTeam(player: Player): boolean {
		if (!this.teamsEnabled) return false;

		const currentTeam = player.team;
		const newTeam =
			currentTeam === TEAM_CONFIG.RED ? TEAM_CONFIG.BLUE : TEAM_CONFIG.RED;

		// Check if switching would cause too much imbalance
		const redCount = this.redTeam.size;
		const blueCount = this.blueTeam.size;

		if (currentTeam === TEAM_CONFIG.RED) {
			// Switching from red to blue
			if (blueCount - redCount >= TEAM_CONFIG.MAX_IMBALANCE - 1) {
				return false;
			}
		} else if (currentTeam === TEAM_CONFIG.BLUE) {
			// Switching from blue to red
			if (redCount - blueCount >= TEAM_CONFIG.MAX_IMBALANCE - 1) {
				return false;
			}
		}

		this.addToTeam(player, newTeam);
		return true;
	}

	/**
	 * Get a player's team
	 */
	public getPlayerTeam(playerIndex: number): Team {
		if (this.redTeam.has(playerIndex)) return TEAM_CONFIG.RED;
		if (this.blueTeam.has(playerIndex)) return TEAM_CONFIG.BLUE;
		return "";
	}

	/**
	 * Get red team player count
	 */
	public getRedTeamCount(): number {
		return this.redTeam.size;
	}

	/**
	 * Get blue team player count
	 */
	public getBlueTeamCount(): number {
		return this.blueTeam.size;
	}

	/**
	 * Get team counts
	 */
	public getTeamCounts(): { red: number; blue: number } {
		return {
			red: this.redTeam.size,
			blue: this.blueTeam.size,
		};
	}

	/**
	 * Check if teams are balanced
	 */
	public areTeamsBalanced(): boolean {
		return (
			Math.abs(this.redTeam.size - this.blueTeam.size) <=
			TEAM_CONFIG.MAX_IMBALANCE
		);
	}

	/**
	 * Get red team player indexes
	 */
	public getRedTeamPlayers(): number[] {
		return Array.from(this.redTeam);
	}

	/**
	 * Get blue team player indexes
	 */
	public getBlueTeamPlayers(): number[] {
		return Array.from(this.blueTeam);
	}

	/**
	 * Check if two players are on the same team
	 */
	public areOnSameTeam(playerIndex1: number, playerIndex2: number): boolean {
		if (!this.teamsEnabled) return false;

		const team1 = this.getPlayerTeam(playerIndex1);
		const team2 = this.getPlayerTeam(playerIndex2);

		return team1 !== "" && team1 === team2;
	}

	/**
	 * Check if two players are enemies
	 */
	public areEnemies(playerIndex1: number, playerIndex2: number): boolean {
		if (!this.teamsEnabled) return true;

		const team1 = this.getPlayerTeam(playerIndex1);
		const team2 = this.getPlayerTeam(playerIndex2);

		return team1 !== "" && team2 !== "" && team1 !== team2;
	}

	/**
	 * Clear all teams
	 */
	public clearTeams(): void {
		this.redTeam.clear();
		this.blueTeam.clear();
	}

	/**
	 * Balance teams (move players if needed)
	 */
	public balanceTeams(players: Player[]): Player[] {
		const moved: Player[] = [];

		if (!this.teamsEnabled) return moved;

		while (!this.areTeamsBalanced()) {
			const redCount = this.redTeam.size;
			const blueCount = this.blueTeam.size;

			if (redCount > blueCount + TEAM_CONFIG.MAX_IMBALANCE) {
				// Move from red to blue
				const playerToMove = this.findPlayerToMove(
					players,
					TEAM_CONFIG.RED
				);
				if (playerToMove) {
					this.addToTeam(playerToMove, TEAM_CONFIG.BLUE);
					moved.push(playerToMove);
				} else {
					break;
				}
			} else if (blueCount > redCount + TEAM_CONFIG.MAX_IMBALANCE) {
				// Move from blue to red
				const playerToMove = this.findPlayerToMove(
					players,
					TEAM_CONFIG.BLUE
				);
				if (playerToMove) {
					this.addToTeam(playerToMove, TEAM_CONFIG.RED);
					moved.push(playerToMove);
				} else {
					break;
				}
			} else {
				break;
			}
		}

		return moved;
	}

	/**
	 * Find a player to move from a team (lowest score)
	 */
	private findPlayerToMove(players: Player[], fromTeam: Team): Player | null {
		const teamPlayers = players.filter((p) => p.team === fromTeam);

		if (teamPlayers.length === 0) return null;

		// Find player with lowest score who is dead
		const deadPlayers = teamPlayers.filter((p) => p.dead);
		if (deadPlayers.length > 0) {
			return deadPlayers.reduce((min, p) =>
				p.score < min.score ? p : min
			);
		}

		// If no dead players, pick the lowest scoring player
		return teamPlayers.reduce((min, p) => (p.score < min.score ? p : min));
	}

	/**
	 * Serialize team data
	 */
	public toJSON(): {
		teamsEnabled: boolean;
		redTeam: number[];
		blueTeam: number[];
	} {
		return {
			teamsEnabled: this.teamsEnabled,
			redTeam: Array.from(this.redTeam),
			blueTeam: Array.from(this.blueTeam),
		};
	}
}
