<script lang="ts">
	import { onMount } from "svelte";
	import type { Camo, Hat, Shirt } from "../../types.ts";
	import { getItemRarityColor } from "../../utils.ts";

	type Props = (
		| { type: "hat"; item: Hat }
		| { type: "shirt"; item: Shirt }
		| { type: "camo"; item: Camo; weaponName?: string }
	) & { duplicate?: boolean };

	const props: Props = $props();
	const item = $derived(props.item);
	const type = $derived(props.type);

	let anchor: HTMLSpanElement;
	let pos = $state<{ x: number; y: number } | null>(null);

	// The loadout/market lists clip horizontally (overflow-x:hidden), so the old
	// absolute left:100% tooltip rendered but was never visible. A fixed tooltip
	// placed at the anchor's rect escapes that clipping entirely.
	function show() {
		const rect = anchor.parentElement?.getBoundingClientRect();
		if (!rect) return;
		pos = {
			x: Math.min(rect.right + 8, window.innerWidth - 270),
			y: Math.max(4, rect.top + rect.height / 2 - 80),
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
	<div class="hoverTooltip fixedTip" style:left={`${pos.x}px`} style:top={`${pos.y}px`}>
		<img class={`${type}DisplayImage`} src={`/images/${type}s/${item.id}/d.png`}>
		<div style:color={getItemRarityColor(item.chance)} style:font-size={"16px"} style:margin-top={"5px"}>{item.name}</div>
		<div style="color: #ffd100; font-size: 12px; margin-top: 0px">droprate {item.chance}%</div>
		<div style="font-size: 8px; color: #d8d8d8; margin-top: 1px">
			<i>
				{props.duplicate ? "Duplicate"
				  : type === "hat" ? "wearable"
				  : type === "shirt" ? "shirt"
				  : "weapon camo"}
			</i>
		</div>

		<div style="font-size: 12px; margin-top: 5px">
			{props.type === "camo" ? props.weaponName ?? "Unknown Weapon" : props.item.desc}
		</div>

		{#if "creator" in item && item.creator !== "EatMyApples"}
			<div style="font-size: 8px; color: #d8d8d8; margin-top: 5px"><i>Artist: {item.creator}</i></div>
		{/if}
	</div>
{/if}

<style>
	.fixedTip {
		display: block;
		position: fixed;
	}
</style>
