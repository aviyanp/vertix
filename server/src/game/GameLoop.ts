// Game Loop - Server tick/update loop at 30 TICKS PER SECOND

import { SERVER_CONFIG } from "../config/gameConfig.ts";

export type TickCallback = (
	deltaTime: number,
	tickCount: number,
	elapsedTime: number
) => void;

/**
 * GameLoop - Server tick/update loop at 30 ticks per second
 */
export class GameLoop {
	private intervalId: ReturnType<typeof setInterval> | null;
	private tickCount: number;
	private startTime: number;
	private lastTickTime: number;
	private tickRate: number;
	private tickInterval: number;
	private callbacks: TickCallback[];
	private running: boolean;

	constructor(tickRate: number = SERVER_CONFIG.TICK_RATE) {
		this.intervalId = null;
		this.tickCount = 0;
		this.startTime = 0;
		this.lastTickTime = 0;
		this.tickRate = tickRate;
		this.tickInterval = 1000 / tickRate;
		this.callbacks = [];
		this.running = false;
	}

	/**
	 * Add a tick callback
	 */
	public addCallback(callback: TickCallback): void {
		this.callbacks.push(callback);
	}

	/**
	 * Remove a tick callback
	 */
	public removeCallback(callback: TickCallback): void {
		const index = this.callbacks.indexOf(callback);
		if (index !== -1) {
			this.callbacks.splice(index, 1);
		}
	}

	/**
	 * Start the game loop
	 */
	public start(): void {
		if (this.running) return;

		this.running = true;
		this.startTime = Date.now();
		this.lastTickTime = this.startTime;
		this.tickCount = 0;

		this.intervalId = setInterval(() => {
			this.tick();
		}, this.tickInterval);
	}

	/**
	 * Stop the game loop
	 */
	public stop(): void {
		if (!this.running) return;

		this.running = false;
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	/**
	 * Pause the game loop
	 */
	public pause(): void {
		this.stop();
	}

	/**
	 * Resume the game loop
	 */
	public resume(): void {
		if (!this.running) {
			this.lastTickTime = Date.now();
			this.start();
		}
	}

	/**
	 * Execute a single tick
	 */
	private tick(): void {
		const currentTime = Date.now();
		const deltaTime = (currentTime - this.lastTickTime) / 1000; // Convert to seconds
		const elapsedTime = currentTime - this.startTime;

		this.tickCount++;
		this.lastTickTime = currentTime;

		// Execute all callbacks
		for (const callback of this.callbacks) {
			try {
				callback(deltaTime, this.tickCount, elapsedTime);
			} catch (error) {
				console.error("Error in game loop callback:", error);
			}
		}
	}

	/**
	 * Get current tick count
	 */
	public getTickCount(): number {
		return this.tickCount;
	}

	/**
	 * Get elapsed time since start (ms)
	 */
	public getElapsedTime(): number {
		return Date.now() - this.startTime;
	}

	/**
	 * Get tick rate
	 */
	public getTickRate(): number {
		return this.tickRate;
	}

	/**
	 * Get tick interval
	 */
	public getTickInterval(): number {
		return this.tickInterval;
	}

	/**
	 * Check if running
	 */
	public isRunning(): boolean {
		return this.running;
	}

	/**
	 * Set tick rate (requires restart to take effect)
	 */
	public setTickRate(tickRate: number): void {
		this.tickRate = tickRate;
		this.tickInterval = 1000 / tickRate;

		// Restart if running
		if (this.running) {
			this.stop();
			this.start();
		}
	}

	/**
	 * Get time until next tick
	 */
	public getTimeUntilNextTick(): number {
		if (!this.running) return 0;
		const elapsed = Date.now() - this.lastTickTime;
		return Math.max(0, this.tickInterval - elapsed);
	}

	/**
	 * Force an immediate tick
	 */
	public forceTick(): void {
		this.tick();
	}

	/**
	 * Reset the game loop
	 */
	public reset(): void {
		this.stop();
		this.tickCount = 0;
		this.startTime = 0;
		this.lastTickTime = 0;
	}
}
