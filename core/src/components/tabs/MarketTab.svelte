<script lang="ts">
	import { onMount } from "svelte";
	import { st } from "../../state.svelte.ts";
	import { getItemRarityColor } from "../../utils.ts";
	import CosmeticTooltip from "./CosmeticTooltip.svelte";
	import SprayTooltip from "./SprayTooltip.svelte";
	import { sprays } from "../../sprays.ts";
	import type { Camo, Hat, Shirt } from "../../types.ts";

	type MarketItem =
		| { type: "hat" | "shirt" | "camo"; id: number; name: string; chance: number; price: number; sellPrice: number; owned: boolean }
		| { type: "spray"; id: number; name: string; price: number; sellPrice: number; owned: boolean };

	let market = $state<{ kr: number; items: MarketItem[] } | null>(null);
	let feedback = $state("");
	let tab = $state<"hat" | "shirt" | "camo" | "spray">("hat");

	function refresh() {
		st.socket?.emit("getMarketData");
	}

	onMount(() => {
		const sock = st.socket;
		if (!sock) return;
		const onData = (data: { kr: number; items: MarketItem[] } | null) => {
			market = data;
		};
		const onResult = (r: { success: boolean; error?: string; kr?: number }) => {
			feedback = r.success ? "" : (r.error ?? "Failed");
			if (r.success) feedback = "";
		};
		sock.on("marketData", onData);
		sock.on("marketResult", onResult);
		refresh();
		return () => {
			sock.off("marketData", onData);
			sock.off("marketResult", onResult);
		};
	});

	const filtered = $derived((market?.items ?? []).filter((i) => i.type === tab));

	function itemForTooltip(item: MarketItem) {
		if (item.type === "spray") return sprays.find((s) => s.id === item.id);
		const list = item.type === "hat" ? st.cosmetics.hats : item.type === "shirt" ? st.cosmetics.shirts : st.cosmetics.camos[0];
		return (list as (Hat | Shirt | Camo)[]).find((i) => i.id === item.id);
	}

	function buy(item: MarketItem) {
		feedback = "";
		st.socket?.emit("marketBuy", { type: item.type, id: item.id });
	}
	function sell(item: MarketItem) {
		feedback = "";
		st.socket?.emit("marketSell", { type: item.type, id: item.id });
	}
</script>

<div class="marketPanel">
	<div class="marketHeader">
		<span>MARKETPLACE</span>
		<span class="krBalance">{market ? `${market.kr.toLocaleString()} KR` : ""}</span>
	</div>
	{#if !st.loggedIn}
		<p class="marketHint">Log in to buy and sell cosmetics.</p>
	{:else}
		<div class="marketTabs">
			{#each ["hat", "shirt", "camo", "spray"] as t}
				<button class="marketTabBtn" class:activeTab={tab === t} onclick={() => (tab = t as typeof tab)}>
					{t.toUpperCase()}S
				</button>
			{/each}
		</div>
		{#if feedback}<div class="marketError">{feedback}</div>{/if}
		<div class="marketList">
			{#each filtered as item}
				{@const tip = itemForTooltip(item)}
				<div class="marketItem">
					<span
						class="marketName"
						style:color={item.type === "spray" ? "#2e3031" : getItemRarityColor((item as { chance?: number }).chance ?? 0)}
					>
						{item.name}
						{#if tip && item.type !== "spray"}
							<CosmeticTooltip type={item.type} item={tip as Hat & Shirt & Camo} />
						{/if}
						{#if tip && item.type === "spray"}
							<SprayTooltip spray={tip as (typeof sprays)[number]} />
						{/if}
					</span>
					{#if item.owned}
						<span class="ownedTag">OWNED</span>
						<button class="marketBtn sellBtn" onclick={() => sell(item)}>SELL +{item.sellPrice} KR</button>
					{:else}
						<span class="marketPrice">{item.price} KR</span>
						<button
							class="marketBtn"
							disabled={market !== null && market.kr < item.price}
							onclick={() => buy(item)}
						>
							BUY
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.marketPanel { min-width: 340px; max-width: 460px; }
	.marketHeader {
		display: flex; justify-content: space-between; align-items: center;
		font-size: 18px; letter-spacing: 1px; margin-bottom: 8px;
	}
	.krBalance { color: #ffd100; }
	.marketHint { color: #d8d8d8; font-size: 13px; }
	.marketTabs { display: flex; gap: 4px; margin-bottom: 8px; }
	.marketTabBtn {
		background: #2b2b2b; color: #d8d8d8; border: 1px solid #444;
		padding: 4px 12px; cursor: pointer; font-size: 12px;
	}
	.marketTabBtn.activeTab { background: #4a4a4a; color: #fff; border-color: #ffd100; }
	.marketList { max-height: 320px; overflow-y: auto; }
	.marketItem {
		display: flex; align-items: center; gap: 8px;
		padding: 5px 4px; border-bottom: 1px solid rgba(255,255,255,0.08);
		font-size: 13px;
	}
	.marketName { flex: 1; cursor: default; }
	.marketPrice { color: #ffd100; font-size: 12px; white-space: nowrap; }
	.ownedTag { font-size: 10px; opacity: 0.8; }
	.marketBtn {
		background: #2f6b2f; color: #fff; border: none;
		padding: 4px 10px; cursor: pointer; font-size: 11px;
	}
	.marketBtn:disabled { background: #444; color: #999; cursor: not-allowed; }
	.sellBtn { background: #6b3a2f; }
	.marketError { color: #ff6b6b; font-size: 12px; margin-bottom: 6px; }
</style>
