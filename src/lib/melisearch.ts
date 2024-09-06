import { Meilisearch } from "meilisearch";

export const meilisearch = new Meilisearch({
	host: "http://localhost:7700",
	apiKey: "meili-master-key",
});
