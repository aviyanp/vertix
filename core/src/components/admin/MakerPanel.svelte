<script lang="ts">
	import { onMount } from "svelte";
	import { adminApi } from "../../adminApi.ts";

	let { onError }: { onError: (m: string) => void } = $props();

	type CustomItem = {
		rowid: number;
		id: number;
		type: string;
		name: string;
		chance: number;
		price: number | null;
		hide: boolean;
		image: string;
	};

	let customs = $state<CustomItem[]>([]);
	let mapCount = $state(0);
	let rotations = $state<Record<string, number[]>>({});
	const MODES = ["Free For All", "Team Deathmatch", "Hardpoint", "Lootcrate", "Sniper War", "Boss Hunt", "Zone War", "Rocket War", "Pyro War"];
	let status = $state("");

	async function refresh() {
		try {
			const data = await adminApi.get<{ customs: CustomItem[]; mapCount: number; rotations: Record<string, number[]> }>("/maker");
			customs = data.customs;
			mapCount = data.mapCount;
			rotations = data.rotations;
		} catch (e) {
			onError(e instanceof Error ? e.message : "load failed");
		}
	}
	onMount(refresh);

	// ---------- cosmetic creator ----------
	let cType = $state("hat");
	let cName = $state("");
	let cChance = $state(5);
	let cPrice = $state("");
	let cHide = $state(false);
	let cFile = $state<File | null>(null);
	let creating = $state(false);

	function readFile(f: File): Promise<string> {
		return new Promise((res, rej) => {
			const r = new FileReader();
			r.onload = () => res(String(r.result));
			r.onerror = () => rej(new Error("read failed"));
			r.readAsDataURL(f);
		});
	}

	async function createCosmetic() {
		if (!cFile) return onError("Pick an image first");
		creating = true;
		try {
			const png = await readFile(cFile);
			await adminApi.post("/customCosmetics", {
				type: cType,
				name: cName,
				chance: cChance,
				price: cPrice === "" ? null : Number(cPrice),
				hide: cHide,
				png,
			});
			status = `Created "${cName}"`;
			cName = "";
			cFile = null;
			await refresh();
		} catch (e) {
			onError(e instanceof Error ? e.message : "create failed");
		} finally {
			creating = false;
		}
	}

	async function deleteCosmetic(item: CustomItem) {
		if (!confirm(`Delete custom ${item.type} "${item.name}"?`)) return;
		try {
			await adminApi.del(`/customCosmetics/${item.rowid}`);
			await refresh();
		} catch (e) {
			onError(e instanceof Error ? e.message : "delete failed");
		}
	}

	// ---------- map maker (paint pixels → PNG tile map) ----------
	// palette mirrors setupMap's decode: black wall, green decor, yellow zone,
	// red/blue spawn points, anything else = floor
	const PALETTE = [
		{ label: "floor", color: "#ffffff" },
		{ label: "wall", color: "#000000" },
		{ label: "decor", color: "#00ff00" },
		{ label: "zone", color: "#ffff00" },
		{ label: "red", color: "#ff0000" },
		{ label: "blue", color: "#0000ff" },
	];
	let mapW = $state(24);
	let mapH = $state(24);
	let brush = $state(PALETTE[1]);
	let cells = $state<string[]>([]);
	let canvasEl: HTMLCanvasElement | undefined = $state();
	let painting = false;

	function resetGrid() {
		const w = Math.min(64, Math.max(8, mapW));
		const h = Math.min(64, Math.max(8, mapH));
		mapW = w;
		mapH = h;
		cells = Array.from({ length: w * h }, (_, i) => {
			const x = i % w;
			const y = Math.floor(i / w);
			return x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#000000" : "#ffffff";
		});
		draw();
	}
	resetGrid();

	function draw() {
		const ctx = canvasEl?.getContext("2d");
		if (!ctx) return;
		canvasEl!.width = mapW;
		canvasEl!.height = mapH;
		const img = ctx.createImageData(mapW, mapH);
		for (let i = 0; i < cells.length; i++) {
			const v = parseInt(cells[i].slice(1), 16);
			img.data[i * 4] = (v >> 16) & 255;
			img.data[i * 4 + 1] = (v >> 8) & 255;
			img.data[i * 4 + 2] = v & 255;
			img.data[i * 4 + 3] = 255;
		}
		ctx.putImageData(img, 0, 0);
	}
	$effect(() => {
		cells;
		draw();
	});

	function paint(e: MouseEvent) {
		const rect = canvasEl!.getBoundingClientRect();
		const x = Math.floor(((e.clientX - rect.left) / rect.width) * mapW);
		const y = Math.floor(((e.clientY - rect.top) / rect.height) * mapH);
		if (x < 0 || y < 0 || x >= mapW || y >= mapH) return;
		cells[y * mapW + x] = brush.color;
	}

	async function saveMap() {
		try {
			const png = canvasEl!.toDataURL("image/png");
			const res = await adminApi.post<{ mapIndex: number }>("/maps", { png });
			status = `Saved as map #${res.mapIndex} — add it to a rotation below`;
			await refresh();
		} catch (e) {
			onError(e instanceof Error ? e.message : "map save failed");
		}
	}

	// ---------- rotation editor ----------
	let rotEdits = $state<Record<string, string>>({});
	function rotValue(mode: string): string {
		return rotEdits[mode] ?? (rotations[mode]?.join(",") ?? "");
	}
	async function saveRotation(mode: string) {
		const raw = (rotEdits[mode] ?? rotValue(mode)).trim();
		try {
			if (!raw) {
				await adminApi.post("/modeMaps", { mode, maps: null });
				status = `${mode}: default rotation restored`;
			} else {
				const maps = raw.split(/[\s,]+/).map(Number);
				await adminApi.post("/modeMaps", { mode, maps });
				status = `${mode}: rotation saved`;
			}
			rotEdits[mode] = "";
			await refresh();
		} catch (e) {
			onError(e instanceof Error ? e.message : "rotation save failed");
		}
	}
</script>

<div class="panel">
	<h3>COSMETIC MAKER</h3>
	<p class="hint">Creates a real catalog item — droppable, ownable, marketable. IDs start at 10000.</p>
	<div class="row">
		<select bind:value={cType}>
			<option value="hat">hat</option>
			<option value="shirt">shirt</option>
			<option value="camo">camo</option>
			<option value="spray">spray</option>
		</select>
		<input placeholder="name" bind:value={cName} maxlength="40" />
		<input type="number" min="0" max="100" step="0.01" bind:value={cChance} title="rarity chance (higher = more common)" style="width:80px" />
		<input type="number" min="1" placeholder="KR price (blank = rarity)" bind:value={cPrice} style="width:140px" />
		<label><input type="checkbox" bind:checked={cHide} /> hidden</label>
		<input type="file" accept="image/*" onchange={(e) => (cFile = (e.target as HTMLInputElement).files?.[0] ?? null)} />
		<button onclick={createCosmetic} disabled={creating || !cName.trim() || !cFile}>CREATE</button>
	</div>

	{#if customs.length}
		<table>
			<thead><tr><th></th><th>id</th><th>type</th><th>name</th><th>chance</th><th>price</th><th></th></tr></thead>
			<tbody>
				{#each customs as item (item.rowid)}
					<tr>
						<td><img src={item.image} alt={item.name} style="width:32px;height:32px;image-rendering:pixelated" /></td>
						<td>{item.id}</td><td>{item.type}</td><td>{item.name}</td>
						<td>{item.chance}</td><td>{item.price ?? "auto"}</td>
						<td><button class="danger" onclick={() => deleteCosmetic(item)}>DEL</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<div class="panel">
	<h3>MAP MAKER</h3>
	<p class="hint">Each pixel = one tile. Black wall, green decor, yellow zone/objective, red/blue spawn, white floor. Border walls recommended.</p>
	<div class="row">
		<label>W <input type="number" min="8" max="64" bind:value={mapW} style="width:56px" /></label>
		<label>H <input type="number" min="8" max="64" bind:value={mapH} style="width:56px" /></label>
		<button onclick={resetGrid}>RESET GRID</button>
		{#each PALETTE as p (p.label)}
			<button class="swatch" class:sel={brush === p} style:background={p.color} title={p.label}
				onclick={() => (brush = p)}>{p.label}</button>
		{/each}
		<button class="primary" onclick={saveMap}>SAVE MAP</button>
	</div>
	<canvas
		bind:this={canvasEl}
		class="mapGrid"
		onmousedown={(e) => { painting = true; paint(e); }}
		onmousemove={(e) => painting && paint(e)}
		onmouseup={() => (painting = false)}
		onmouseleave={() => (painting = false)}
	></canvas>
	<p class="hint">Maps in pool: {mapCount} (indexes 0..{mapCount - 1})</p>
</div>

<div class="panel">
	<h3>MAP ROTATIONS</h3>
	<p class="hint">Comma-separated map indexes per mode. Empty = built-in default.</p>
	{#each MODES as mode (mode)}
		<div class="row">
			<span class="modeName">{mode}</span>
			<input placeholder="default" value={rotValue(mode)} oninput={(e) => (rotEdits[mode] = (e.target as HTMLInputElement).value)} />
			<button onclick={() => saveRotation(mode)}>SAVE</button>
		</div>
	{/each}
</div>

{#if status}<p class="status">{status}</p>{/if}

<style>
	.panel { background: #1b1d24; border: 1px solid #2e3138; padding: 14px; margin-bottom: 14px; }
	h3 { margin: 0 0 6px; color: #ffd100; font-size: 14px; letter-spacing: 1px; }
	.hint { color: #889; font-size: 11px; margin: 4px 0 10px; }
	.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
	input, select { background: #101216; color: #eee; border: 1px solid #3a3d44; padding: 5px 7px; font-size: 12px; }
	button { background: #2a2d36; color: #eee; border: 1px solid #3a3d44; padding: 5px 10px; font-size: 11px; cursor: pointer; }
	button:hover { background: #353945; }
	button.primary { background: #3d5a2a; border-color: #557a3a; }
	button.danger { background: #5a2a2a; border-color: #7a3a3a; }
	button.swatch { width: 52px; height: 24px; color: #fff; text-shadow: 0 0 3px #000; font-size: 9px; }
	button.swatch.sel { outline: 2px solid #ffd100; }
	.modeName { width: 130px; color: #ccc; font-size: 12px; }
	.mapGrid { width: 480px; max-width: 100%; image-rendering: pixelated; border: 1px solid #3a3d44; cursor: crosshair; display: block; }
	table { border-collapse: collapse; width: 100%; font-size: 12px; }
	td, th { border: 1px solid #2e3138; padding: 4px 8px; text-align: left; }
	.status { color: #7ec96a; font-size: 12px; }
</style>
