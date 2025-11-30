// Input Handler - Client input processing with server reconciliation

import type { PlayerInput, MovementInput, ShootInput } from "../types/index.ts";
import { SERVER_CONFIG } from "../config/gameConfig.ts";

/**
 * InputHandler - Processes and validates client inputs
 */
export class InputHandler {
	private inputBuffer: Map<string, PlayerInput[]>;
	private lastInputSequence: Map<string, number>;
	private maxBufferSize: number;

	constructor(maxBufferSize: number = SERVER_CONFIG.INPUT_BUFFER_SIZE) {
		this.inputBuffer = new Map();
		this.lastInputSequence = new Map();
		this.maxBufferSize = maxBufferSize;
	}

	/**
	 * Process movement input from client
	 */
	public processMovementInput(
		socketId: string,
		input: MovementInput
	): PlayerInput | null {
		// Validate input
		if (!this.validateMovementInput(input)) {
			return null;
		}

		// Check sequence number
		const lastSequence = this.lastInputSequence.get(socketId) || 0;
		if (input.isn <= lastSequence) {
			// Old input, ignore
			return null;
		}

		// Calculate delta time
		const now = Date.now();
		const delta = Math.min((now - input.ts) / 1000, 0.1); // Cap at 100ms

		const playerInput: PlayerInput = {
			hdt: input.hdt,
			vdt: input.vdt,
			ts: input.ts,
			isn: input.isn,
			s: input.s,
			delta: delta > 0 ? delta : 1 / SERVER_CONFIG.TICK_RATE,
		};

		// Buffer the input
		this.bufferInput(socketId, playerInput);

		// Update last sequence
		this.lastInputSequence.set(socketId, input.isn);

		return playerInput;
	}

	/**
	 * Validate movement input
	 */
	private validateMovementInput(input: MovementInput): boolean {
		// Check required fields
		if (
			input.hdt === undefined ||
			input.vdt === undefined ||
			input.isn === undefined
		) {
			return false;
		}

		// Validate horizontal delta (-1 to 1)
		if (input.hdt < -1 || input.hdt > 1) {
			return false;
		}

		// Validate vertical delta (-1 to 1)
		if (input.vdt < -1 || input.vdt > 1) {
			return false;
		}

		// Validate sequence number
		if (input.isn < 0) {
			return false;
		}

		return true;
	}

	/**
	 * Process shoot input from client
	 */
	public processShootInput(input: ShootInput): ShootInput | null {
		// Validate input
		if (!this.validateShootInput(input)) {
			return null;
		}

		return input;
	}

	/**
	 * Validate shoot input
	 */
	private validateShootInput(input: ShootInput): boolean {
		// Check required fields
		if (
			input.x === undefined ||
			input.y === undefined ||
			input.angle === undefined
		) {
			return false;
		}

		// Validate angle (0-360 or radians)
		if (typeof input.angle !== "number" || Number.isNaN(input.angle)) {
			return false;
		}

		return true;
	}

	/**
	 * Buffer an input for a player
	 */
	private bufferInput(socketId: string, input: PlayerInput): void {
		let buffer = this.inputBuffer.get(socketId);
		if (!buffer) {
			buffer = [];
			this.inputBuffer.set(socketId, buffer);
		}

		buffer.push(input);

		// Trim buffer if too large
		if (buffer.length > this.maxBufferSize) {
			buffer.shift();
		}
	}

	/**
	 * Get buffered inputs for a player
	 */
	public getBufferedInputs(socketId: string): PlayerInput[] {
		return this.inputBuffer.get(socketId) || [];
	}

	/**
	 * Clear buffered inputs for a player
	 */
	public clearBufferedInputs(socketId: string): void {
		this.inputBuffer.set(socketId, []);
	}

	/**
	 * Clear processed inputs up to a sequence number
	 */
	public clearProcessedInputs(socketId: string, upToIsn: number): void {
		const buffer = this.inputBuffer.get(socketId);
		if (buffer) {
			const filtered = buffer.filter((input) => input.isn > upToIsn);
			this.inputBuffer.set(socketId, filtered);
		}
	}

	/**
	 * Get last input sequence number for a player
	 */
	public getLastInputSequence(socketId: string): number {
		return this.lastInputSequence.get(socketId) || 0;
	}

	/**
	 * Remove a player from input tracking
	 */
	public removePlayer(socketId: string): void {
		this.inputBuffer.delete(socketId);
		this.lastInputSequence.delete(socketId);
	}

	/**
	 * Clear all input buffers
	 */
	public clear(): void {
		this.inputBuffer.clear();
		this.lastInputSequence.clear();
	}

	/**
	 * Get input buffer size for a player
	 */
	public getBufferSize(socketId: string): number {
		return this.inputBuffer.get(socketId)?.length || 0;
	}

	/**
	 * Get total buffered inputs across all players
	 */
	public getTotalBufferedInputs(): number {
		let total = 0;
		for (const buffer of this.inputBuffer.values()) {
			total += buffer.length;
		}
		return total;
	}
}
