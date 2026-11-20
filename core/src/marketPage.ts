import { flushSync, mount } from "svelte";
import "../assets/main.css";
import MarketPage from "./components/MarketPage.svelte";

mount(MarketPage, {
	target: document.querySelector("#market-root")!,
});
flushSync();
