// Chat Manager - Handle ALL chat, TEAM chat, system messages

import type { ChatMessage, ChatType, Team } from "../types/index.ts";
import { CHAT_CONFIG } from "../config/gameConfig.ts";

/**
 * ChatManager - Handles all chat functionality
 */
export class ChatManager {
	private messageHistory: ChatMessage[];
	private maxHistorySize: number;

	constructor(maxHistorySize: number = 100) {
		this.messageHistory = [];
		this.maxHistorySize = maxHistorySize;
	}

	/**
	 * Process a chat message
	 */
	public processMessage(
		senderIndex: number,
		message: string,
		type: ChatType,
		senderTeam: Team
	): ChatMessage | null {
		// Validate message
		if (!message || message.trim().length === 0) {
			return null;
		}

		// Sanitize message (remove HTML tags)
		let sanitizedMessage = message.replace(/(<([^>]+)>)/gi, "");

		// Limit message length
		sanitizedMessage = sanitizedMessage.substring(
			0,
			CHAT_CONFIG.MAX_MESSAGE_LENGTH
		);

		const chatMessage: ChatMessage = {
			senderIndex,
			message: sanitizedMessage,
			type,
			team: senderTeam,
			timestamp: Date.now(),
		};

		// Add to history
		this.addToHistory(chatMessage);

		return chatMessage;
	}

	/**
	 * Create a system message
	 */
	public createSystemMessage(message: string): ChatMessage {
		const chatMessage: ChatMessage = {
			senderIndex: -1,
			message,
			type: "ALL",
			team: "",
			timestamp: Date.now(),
		};

		this.addToHistory(chatMessage);
		return chatMessage;
	}

	/**
	 * Create a notification message
	 */
	public createNotification(message: string): ChatMessage {
		const chatMessage: ChatMessage = {
			senderIndex: -2, // Special index for notifications
			message,
			type: "ALL",
			team: "",
			timestamp: Date.now(),
		};

		this.addToHistory(chatMessage);
		return chatMessage;
	}

	/**
	 * Check if message should be sent to a player
	 */
	public shouldReceiveMessage(
		message: ChatMessage,
		receiverTeam: Team
	): boolean {
		// System messages go to everyone
		if (message.senderIndex < 0) {
			return true;
		}

		// ALL chat goes to everyone
		if (message.type === "ALL") {
			return true;
		}

		// TEAM chat only goes to same team
		if (message.type === "TEAM") {
			return message.team === receiverTeam;
		}

		return true;
	}

	/**
	 * Format message for network transmission
	 */
	public formatForNetwork(message: ChatMessage): [number, string] {
		return [message.senderIndex, message.message];
	}

	/**
	 * Add message to history
	 */
	private addToHistory(message: ChatMessage): void {
		this.messageHistory.push(message);

		// Trim history if too large
		if (this.messageHistory.length > this.maxHistorySize) {
			this.messageHistory.shift();
		}
	}

	/**
	 * Get message history
	 */
	public getHistory(count?: number): ChatMessage[] {
		if (count) {
			return this.messageHistory.slice(-count);
		}
		return [...this.messageHistory];
	}

	/**
	 * Get messages for a specific team
	 */
	public getTeamHistory(team: Team, count?: number): ChatMessage[] {
		const teamMessages = this.messageHistory.filter(
			(msg) =>
				msg.senderIndex < 0 || // System messages
				msg.type === "ALL" || // All chat
				msg.team === team // Same team
		);

		if (count) {
			return teamMessages.slice(-count);
		}
		return teamMessages;
	}

	/**
	 * Clear message history
	 */
	public clearHistory(): void {
		this.messageHistory = [];
	}

	/**
	 * Get message count
	 */
	public getMessageCount(): number {
		return this.messageHistory.length;
	}
}
