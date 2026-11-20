<script lang="ts">
	import { onMount } from "svelte";
	import type { sprays } from "../../sprays.ts";

	interface Props {
		spray: (typeof sprays)[number];
	}

	const props: Props = $props();

	let anchor: HTMLSpanElement;
	let pos = $state<{ x: number; y: number } | null>(null);

	// portaled to <body>: the loadout list clips overflow, and .menuCard's
	// transform makes position:fixed resolve against the card, not the viewport
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}

	function show() {
		const rect = anchor.parentElement?.getBoundingClientRect();
		if (!rect) return;
		pos = {
			x: Math.min(rect.right + 8, window.innerWidth - 110),
			y: Math.max(4, rect.top + rect.height / 2 - 50),
		};
	}
	function hide() {
		pos = null;
	}

	onMount(() => {
		const parent = anchor.parentElement;
		parent?.addEventListener("mouseenter", show);
		parent?.addEventListener("mouseleave", hide);
		return () => {
			parent?.removeEventListener("mouseenter", show);
			parent?.removeEventListener("mouseleave", hide);
		};
	});
</script>

<span bind:this={anchor} style="display:none"></span>
{#if pos}
	<div class="hoverTooltip fixedTip" use:portal style:left={`${pos.x}px`} style:top={`${pos.y}px`}>
		<img class="sprayDisplayImage" src={(props.spray as { image?: string }).image ?? `/images/sprays/${props.spray.id}.png`}>
	</div>
{/if}

<style>
	.hoverTooltip {
		width: 90px;
		height: 90px;
	}
	.fixedTip {
		display: block;
		position: fixed;
		pointer-events: none;
	}
</style>
