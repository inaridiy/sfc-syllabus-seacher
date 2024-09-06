import { meilisearch } from "./libs/melisearch";

const version = await meilisearch.getVersion();
console.log(`Connected to Meilisearch ${version.pkgVersion}`);

const { results: indexesToCheck } = await meilisearch.getIndexes();

const isIndexExist = indexesToCheck.some((i) => i.uid === "syllabus");

if (!isIndexExist) {
	const task = await meilisearch.createIndex("syllabus", {
		primaryKey: "course_id",
	});
	await meilisearch.waitForTask(task.taskUid);
}

console.log("Index created");

const { results: indexes } = await meilisearch.getIndexes();
const index = indexes.find((i) => i.uid === "syllabus");

if (!index) throw new Error("Index not found");

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

const addEmbeddingsTask = await index.updateSettings({
	searchableAttributes: ["course_id", "title", "description", "schedules"],
	filterableAttributes: ["course_id", "schedules"],
	embedders: {
		default: {
			source: "openAi",
			apiKey: process.env.OPENAI_API_KEY,
			model: "text-embedding-3-large",
			dimensions: 1536,
		},
		small: {
			source: "openAi",
			apiKey: process.env.OPENAI_API_KEY,
			model: "text-embedding-3-small",
			dimensions: 1536,
		},
	},
});

await meilisearch.waitForTask(addEmbeddingsTask.taskUid);
console.log("Embeddings added");
