/**
 * Standalone page of one SciML card: fills its relation slots (profile, nearby
 * cards, cards of the other type) from `cards.json` and adds a link back to the
 * task map under the title. The card is the `cards.json` entry whose `url` is this
 * page's path; none matching throws.
 */

import { fillRelations, loadCards } from "./sciml-map.js";

const MAP_URL = "/sciml-for-physics/#the-tasks";

const cards = await loadCards();
const card = cards.find((c) => c.url === location.pathname);
if (!card) throw new Error(`card-page: no card in cards.json for ${location.pathname}`);

const main = document.querySelector("main");
fillRelations(main, card, cards);

// Back link under the title head
const back = document.createElement("p");
back.className = "card-back";
back.innerHTML = `<a href="${MAP_URL}">← Back to the task map</a>`;
main.querySelector(".sec-head").after(back);
