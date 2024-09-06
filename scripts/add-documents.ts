import fs from "node:fs/promises";
import * as cheerio from "cheerio";
import { meilisearch } from "./libs/melisearch";

const jsonl = await fs.readFile(
	"./output/crawled/2024-09-06T14:08:19.962Z.jsonl",
	"utf-8",
);
const documents = jsonl
	.split("\n")
	.filter((s) => s.trim().length > 0)
	.map((line) => JSON.parse(line))
	.filter((document) =>
		document.url.includes("https://syllabus.sfc.keio.ac.jp/courses/"),
	)

	.map((document) => {
		const { content } = document;
		const courseId = document.url
			.match(/courses\/(.*)/)?.[1]
			.replace("?locale=", "_");
		const $ = cheerio.load(content);
		const title = $("span.title").text().trim();
		const body = $(".detail-info").text().trim();
		const schedule = $(".syllabus-info dl")
			.filter(
				(_, dl) =>
					$(dl).text().includes("Day of Week") ||
					$(dl).text().includes("曜日・時限"),
			)
			.map((_, dl) => {
				const dd = $(dl).find("dd");
				return dd
					.text()
					.trim()
					.split(",")
					.map((s) => s.trim());
			})
			.get();

		return {
			course_id: courseId,
			title,
			description: body,
			schedules: schedule,
		};
	});

const index = await meilisearch.getIndex("syllabus");

console.log(`Adding ${documents.length} documents to meilisearch...`);
const task = await index.addDocuments(documents);
console.log(`Task ${task.taskUid} created`);
await index.waitForTask(task.taskUid);
console.log(`Task ${task.taskUid} completed`);
