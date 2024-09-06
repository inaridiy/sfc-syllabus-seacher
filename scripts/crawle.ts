// Add import of CheerioCrawler
import { RequestQueue, CheerioCrawler } from "crawlee";
import fs from "node:fs/promises";

const requestQueue = await RequestQueue.open();
await requestQueue.addRequest({
	url: "https://syllabus.sfc.keio.ac.jp/courses?button=&locale=ja&search%5Bsemester%5D=&search%5Bsfc_guide_title%5D=&search%5Bsub_semester%5D=&search%5Bsummary%5D=&search%5Bteacher_name%5D=&search%5Btitle%5D=&search%5Byear%5D=2024",
});

const timestamp = new Date().toISOString();
const outputFile = `./output/crawled/${timestamp}.jsonl`;
await fs.mkdir("./output/crawled", { recursive: true });

// Create the crawler and add the queue with our URL
// and a request handler to process the page.
const crawler = new CheerioCrawler({
	requestQueue,
	// The `$` argument is the Cheerio object
	// which contains parsed HTML of the website.
	async requestHandler({ $, request, enqueueLinks }) {
		// Extract <title> text with Cheerio.
		// See Cheerio documentation for API docs.
		const title = $("title").text();
		console.log(`The title of "${request.url}" is: ${title}.`);

		const course = { url: request.url, title, content: $("body").html() };
		await fs.appendFile(outputFile, `${JSON.stringify(course)}\n`);

		await enqueueLinks({
			globs: [
				"https://syllabus.sfc.keio.ac.jp/courses/*",
				"https://syllabus.sfc.keio.ac.jp/courses*",
			],
		});
	},
});

// Start the crawler and wait for it to finish
await crawler.run();
