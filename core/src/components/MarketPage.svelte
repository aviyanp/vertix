<script lang="ts">
	import { onMount } from "svelte";
	import { getItemRarityColor } from "../utils.ts";

	type Item = {
		type: "hat" | "shirt" | "camo" | "spray";
		id: number;
		name: string;
		chance: number | null;
		image: string;
		officialPrice: number | null;
		sellPrice: number | null;
		minted: number;
		owners: number;
		lowestAsk: number | null;
	};
	type Listing = { type: string; id: number; serial: number; price: number; seller: string };
	type Mine = { type: string; id: number; serial: number; listedPrice: number | null };
	type MarketData = { kr: number; items: Item[]; listings: Listing[]; mine: Mine[] };

	let data = $state<MarketData | null>(null);
	let signedIn = $state(true);
	let loadError = $state("");
	let toast = $state("");
	let busy = $state(false);

	let tab = $state<"all" | Item["type"] | "mine">("all");
	let search = $state("");
	let sort = $state<"priceAsc" | "priceDesc" | "rare" | "minted">("priceAsc");
	let selected = $state<Item | null>(null);
	let askInputs = $state<Record<string, number>>({});

	async function load() {
		try {
			const res = await fetch("/api/market");
			if (!res.ok) throw new Error(await res.text());
			data = await res.json();
			const me = await fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
			signedIn = !!me?.username;
		} catch (e) {
			loadError = "Couldn't load the market.";
		}
	}
	onMount(load);

	async function trade(payload: Record<string, unknown>, done: string) {
		if (busy) return;
		busy = true;
		toast = "";
		try {
			const res = await fetch("/api/market/trade", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok || body.success === false) {
				toast = body.error ?? "Trade failed";
			} else {
				toast = done;
				await load();
			}
		} finally {
			busy = false;
		}
	}

	const rarityRank = (c: number | null) => (c === null ? 1 : c <= 1 ? 5 : c <= 6 ? 4 : c <= 18 ? 3 : c <= 45 ? 2 : 1);
	const color = (it: Item) => getItemRarityColor(it.chance ?? 20);
	const ownedKeys = $derived(new Set((data?.mine ?? []).map((m) => `${m.type}:${m.id}`)));
	const itemListings = (it: Item) => (data?.listings ?? []).filter((l) => l.type === it.type && l.id === it.id);

	const visible = $derived.by(() => {
		if (!data) return [];
		let rows = data.items;
		if (tab !== "all" && tab !== "mine") rows = rows.filter((i) => i.type === tab);
		const q = search.trim().toLowerCase();
		if (q) rows = rows.filter((i) => i.name.toLowerCase().includes(q));
		const key = (i: Item) => i.lowestAsk ?? i.officialPrice ?? Number.MAX_SAFE_INTEGER;
		rows = [...rows];
		if (sort === "priceAsc") rows.sort((a, b) => key(a) - key(b));
		else if (sort === "priceDesc") rows.sort((a, b) => key(b) - key(a));
		else if (sort === "rare") rows.sort((a, b) => rarityRank(b.chance) - rarityRank(a.chance));
		else rows.sort((a, b) => a.minted - b.minted);
		return rows;
	});

	const itemByKey = new Map<string, Item>();
	$effect(() => {
		for (const i of data?.items ?? []) itemByKey.set(`${i.type}:${i.id}`, i);
	});
	const mineRows = $derived(
		(data?.mine ?? [])
			.map((m) => ({ ...m, item: itemByKey.get(`${m.type}:${m.id}`) }))
			.filter((m) => m.item),
	);

	function fmt(n: number | null | undefined) {
		return n === null || n === undefined ? "—" : n.toLocaleString();
	}
</script>

<div class="page">
	<header class="topbar">
		<a class="brand" href="/">← VERTIX</a>
		<h1>MARKET</h1>
		<div class="balance">
			{#if signedIn}{fmt(data?.kr)} KR{:else}<a href="/">log in to trade</a>{/if}
		</div>
	</header>

	<nav class="controls">
		{#each ["all", "hat", "shirt", "camo", "spray", "mine"] as t}
			<button class="tab" class:active={tab === t} onclick={() => (tab = t as typeof tab)}>
				{t === "mine" ? "MY ITEMS" : t.toUpperCase() + (t === "all" ? "" : "S")}
			</button>
		{/each}
		<input class="search" placeholder="search…" bind:value={search} />
		<select class="sort" bind:value={sort}>
			<option value="priceAsc">price ↑</option>
			<option value="priceDesc">price ↓</option>
			<option value="rare">rarity</option>
			<option value="minted">scarcest</option>
		</select>
	</nav>

	{#if toast}<div class="toast">{toast}</div>{/if}
	{#if loadError}<div class="toast err">{loadError}</div>{/if}

	{#if !data}
		<div class="loading">loading market…</div>
	{:else if tab === "mine"}
		<section class="mineGrid">
			{#each mineRows as m}
				{@const key = `${m.type}:${m.id}:${m.serial}`}
				<div class="card">
					<img src={m.item!.image} alt={m.item!.name} loading="lazy" />
					<div class="name" style:color={color(m.item!)}>{m.item!.name} <span class="serial">#{m.serial}</span></div>
					<div class="meta">{m.item!.type}</div>
					{#if m.listedPrice !== null}
						<div class="price">listed {fmt(m.listedPrice)} KR</div>
						<button class="btn ghost" disabled={busy} onclick={() => trade({ action: "delist", type: m.type, id: m.id }, "Delisted")}>DELIST</button>
					{:else}
						<div class="listRow">
							<input type="number" min="1" placeholder="ask KR" bind:value={askInputs[key]} />
							<button class="btn" disabled={busy || !(askInputs[key] > 0)}
								onclick={() => trade({ action: "list", type: m.type, id: m.id, price: askInputs[key] }, "Listed")}>LIST</button>
						</div>
						{#if m.item!.sellPrice}
							<button class="btn ghost" disabled={busy}
								onclick={() => trade({ action: "sell", type: m.type, id: m.id }, `Sold for ${m.item!.sellPrice} KR`)}>
								SELL {fmt(m.item!.sellPrice)} KR
							</button>
						{/if}
					{/if}
				</div>
			{:else}
				<p class="empty">Nothing owned yet — win matches to earn KR and drops.</p>
			{/each}
		</section>
	{:else}
		<section class="grid">
			{#each visible as it (`${it.type}:${it.id}`)}
				<button class="card" class:selected={selected === it} onclick={() => (selected = selected === it ? null : it)}>
					<img src={it.image} alt={it.name} loading="lazy" />
					<div class="name" style:color={color(it)}>{it.name}</div>
					<div class="meta">{fmt(it.minted)} minted · {fmt(it.owners)} owner{it.owners === 1 ? "" : "s"}</div>
					<div class="priceRow">
						{#if it.lowestAsk !== null}<span class="ask">{fmt(it.lowestAsk)} KR</span><span class="tag">ask</span>{/if}
						<span class="official">{fmt(it.officialPrice)} KR</span>
					</div>
				</button>
				{#if selected === it}
					<div class="detail">
						<div class="detailHead">
							<img src={it.image} alt="" />
							<div>
								<div class="name" style:color={color(it)}>{it.name}</div>
								<div class="meta">{it.type} · {fmt(it.minted)} copies minted · {fmt(it.owners)} owners</div>
								<div class="meta">official {fmt(it.officialPrice)} KR · sells back {fmt(it.sellPrice)} KR</div>
							</div>
							{#if !ownedKeys.has(`${it.type}:${it.id}`) && signedIn}
								<button class="btn" disabled={busy}
									onclick={() => trade({ action: "buy", type: it.type, id: it.id }, `Minted ${it.name}`)}>
									MINT {fmt(it.officialPrice)} KR
								</button>
							{/if}
						</div>
						{#if itemListings(it).length}
							<table>
								<thead><tr><th>serial</th><th>seller</th><th>price</th><th></th></tr></thead>
								<tbody>
									{#each itemListings(it) as l}
										<tr>
											<td>#{l.serial}</td>
											<td>{l.seller}</td>
											<td>{fmt(l.price)} KR</td>
											<td>
												{#if signedIn}
													<button class="btn small" disabled={busy}
														onclick={() => trade({ action: "buyListing", type: l.type, id: l.id, serial: l.serial, price: l.price }, `Bought ${it.name} #${l.serial}`)}>BUY</button>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{:else}
							<p class="empty">No player listings — mint one at the official price.</p>
						{/if}
					</div>
				{/if}
			{/each}
		</section>
	{/if}
</div>

<style>
	/* main.css pins body overflow — the page scrolls in its own container */
	.page { max-width: 1100px; height: 100vh; height: 100dvh; overflow-y: auto; margin: 0 auto; padding: 16px; color: #e8e8e8; font-family: "mainFont"; }
	.topbar { display: flex; align-items: baseline; gap: 16px; }
	.brand { color: #9fd; text-decoration: none; }
	h1 { font-size: 22px; letter-spacing: 2px; flex: 1; margin: 0; }
	.balance { font-size: 15px; color: #ffd75e; }
	.controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 14px 0; }
	.tab { background: #1c1f22; color: #ccc; border: 1px solid #333; padding: 6px 10px; cursor: pointer; font-family: inherit; font-size: 12px; }
	.tab.active { border-color: #ffd75e; color: #ffd75e; }
	.search, .sort { background: #14171a; color: #eee; border: 1px solid #333; padding: 6px 8px; font-family: inherit; }
	.search { flex: 1; min-width: 140px; }
	.toast { background: #20341f; border: 1px solid #4a7a3f; padding: 8px 10px; margin-bottom: 10px; font-size: 13px; }
	.toast.err { background: #402020; border-color: #a05050; }
	.loading, .empty { color: #999; font-size: 13px; padding: 12px 0; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
	.mineGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
	.card { background: #17191c; border: 1px solid #2a2d30; padding: 10px; text-align: left; cursor: pointer; color: inherit; font-family: inherit; display: flex; flex-direction: column; gap: 5px; }
	.card.selected { border-color: #ffd75e; }
	.card img { width: 64px; height: 64px; object-fit: contain; image-rendering: pixelated; margin: 0 auto; }
	.name { font-size: 13px; }
	.serial { color: #9fd; font-size: 11px; }
	.meta { color: #888; font-size: 11px; }
	.priceRow { display: flex; justify-content: space-between; font-size: 12px; align-items: baseline; }
	.ask { color: #ffd75e; }
	.tag { color: #666; font-size: 9px; }
	.official { color: #ccc; margin-left: auto; }
	.detail { grid-column: 1 / -1; background: #131518; border: 1px solid #333; padding: 12px; }
	.detailHead { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
	.detailHead img { width: 72px; height: 72px; object-fit: contain; image-rendering: pixelated; }
	.detailHead .btn { margin-left: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 12px; }
	th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #242628; color: #ccc; }
	th { color: #888; font-size: 10px; text-transform: uppercase; }
	.btn { background: #2f6c33; color: #eaffea; border: 1px solid #4a9a4a; padding: 7px 12px; cursor: pointer; font-family: inherit; font-size: 12px; }
	.btn:disabled { opacity: 0.4; cursor: default; }
	.btn.ghost { background: #22262a; color: #ccc; border-color: #3a3d40; }
	.btn.small { padding: 4px 10px; }
	.listRow { display: flex; gap: 6px; }
	.listRow input { width: 70px; background: #14171a; color: #eee; border: 1px solid #333; padding: 5px; font-family: inherit; }
</style>
