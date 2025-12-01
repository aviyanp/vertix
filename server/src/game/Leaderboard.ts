// Leaderboard - Score tracking and sorting

import type { LeaderboardEntry, Team } from "../types/index.ts";
import { Player } from "../entities/Player.ts";

/**
 * Leaderboard - Tracks and sorts player scores
 */
export class Leaderboard {
	private entries: Map<number, LeaderboardEntry>;
	private sortedEntries: LeaderboardEntry[];
	private isDirty: boolean;

	constructor() {
		this.entries = new Map();
		this.sortedEntries = [];
		this.isDirty = true;
	}

	/**
	 * Add or update a player's entry
	 */
	public updatePlayer(player: Player): void {
		const entry: LeaderboardEntry = {
			index: player.index,
			name: player.name,
			score: player.score,
			kills: player.kills,
			deaths: player.deaths,
			team: player.team,
		};

		this.entries.set(player.index, entry);
		this.isDirty = true;
	}

	/**
	 * Remove a player from the leaderboard
	 */
	public removePlayer(playerIndex: number): void {
		this.entries.delete(playerIndex);
		this.isDirty = true;
	}

	/**
	 * Get sorted entries
	 */
	public getSorted(): LeaderboardEntry[] {
		if (this.isDirty) {
			this.sortedEntries = Array.from(this.entries.values()).sort(
				(a, b) => b.score - a.score
			);
			this.isDirty = false;
		}
		return this.sortedEntries;
	}

	/**
	 * Get top N entries
	 */
	public getTop(count: number): LeaderboardEntry[] {
		return this.getSorted().slice(0, count);
	}

	/**
	 * Get player's rank (1-indexed)
	 */
	public getPlayerRank(playerIndex: number): number {
		const sorted = this.getSorted();
		const index = sorted.findIndex((e) => e.index === playerIndex);
		return index === -1 ? -1 : index + 1;
	}

	/**
	 * Get player's entry
	 */
	public getPlayerEntry(playerIndex: number): LeaderboardEntry | undefined {
		return this.entries.get(playerIndex);
	}

	/**
	 * Get entries sorted by team
	 */
	public getSortedByTeam(): {
		red: LeaderboardEntry[];
		blue: LeaderboardEntry[];
		other: LeaderboardEntry[];
	} {
		const sorted = this.getSorted();
		return {
			red: sorted.filter((e) => e.team === "red"),
			blue: sorted.filter((e) => e.team === "blue"),
			other: sorted.filter((e) => e.team === ""),
		};
	}

	/**
	 * Get team total score
	 */
	public getTeamScore(team: Team): number {
		return Array.from(this.entries.values())
			.filter((e) => e.team === team)
			.reduce((sum, e) => sum + e.score, 0);
	}

	/**
	 * Get team total kills
	 */
	public getTeamKills(team: Team): number {
		return Array.from(this.entries.values())
			.filter((e) => e.team === team)
			.reduce((sum, e) => sum + e.kills, 0);
	}

	/**
	 * Get top player
	 */
	public getTopPlayer(): LeaderboardEntry | undefined {
		return this.getSorted()[0];
	}

	/**
	 * Get team MVP
	 */
	public getTeamMVP(team: Team): LeaderboardEntry | undefined {
		const sorted = this.getSorted();
		return sorted.find((e) => e.team === team);
	}

	/**
	 * Get entry count
	 */
	public getCount(): number {
		return this.entries.size;
	}

	/**
	 * Get all entries (unsorted)
	 */
	public getAllEntries(): LeaderboardEntry[] {
		return Array.from(this.entries.values());
	}

	/**
	 * Clear the leaderboard
	 */
	public clear(): void {
		this.entries.clear();
		this.sortedEntries = [];
		this.isDirty = true;
	}

	/**
	 * Reset all scores (but keep players)
	 */
	public resetScores(): void {
		for (const entry of this.entries.values()) {
			entry.score = 0;
			entry.kills = 0;
			entry.deaths = 0;
		}
		this.isDirty = true;
	}

	/**
	 * Serialize for network transmission
	 */
	public toJSON(): LeaderboardEntry[] {
		return this.getSorted();
	}

	/**
	 * Get compact leaderboard for updates
	 * Format: [[index, score, kills, deaths], ...]
	 */
	public toCompactArray(): number[][] {
		return this.getSorted().map((e) => [e.index, e.score, e.kills, e.deaths]);
	}

	/**
	 * Get game-end stats
	 */
	public getGameStats(): {
		entries: LeaderboardEntry[];
		redTeamScore: number;
		blueTeamScore: number;
		mvp: LeaderboardEntry | undefined;
		redMVP: LeaderboardEntry | undefined;
		blueMVP: LeaderboardEntry | undefined;
	} {
		return {
			entries: this.getSorted(),
			redTeamScore: this.getTeamScore("red"),
			blueTeamScore: this.getTeamScore("blue"),
			mvp: this.getTopPlayer(),
			redMVP: this.getTeamMVP("red"),
			blueMVP: this.getTeamMVP("blue"),
		};
	}
}
