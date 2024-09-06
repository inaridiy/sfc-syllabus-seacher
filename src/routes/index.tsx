import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { meilisearch } from "@/lib/melisearch";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
	component: Index,
	validateSearch: (search: Record<string, unknown>) => ({
		p: Number(search.p ?? 1),
		q: String(search.q ?? ""),
	}),
	loaderDeps: ({ search }) => ({ p: search.p, q: search.q }),
	loader: async ({ deps }) => {
		const docs = await meilisearch.index("syllabus").search(deps.q, {
			hitsPerPage: 50,
			limit: 300,
			page: Number(deps.p),
			hybrid: { semanticRatio: 0.9, embedder: "small" },
		});

		return docs;
	},
});

function Index() {
	const deps = Route.useLoaderDeps();
	const data = Route.useLoaderData();
	const navigate = Route.useNavigate();

	const hasPrevious = deps.p > 1;
	const hasNext = deps.p < data.totalPages;

	const nextPage = () => {
		navigate({
			to: "/",
			search: {
				q: deps.q,
				p: deps.p + 1,
			},
		});
	};

	const previousPage = () => {
		navigate({
			to: "/",
			search: {
				q: deps.q,
				p: deps.p - 1,
			},
		});
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		navigate({
			to: "/",
			search: {
				q: e.target.value,
				p: 1,
			},
		});
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">SFC24 シラバス検索システム</h1>
			<div className="flex space-x-2 mb-4">
				<Input
					type="text"
					placeholder="本のタイトルまたは著者を入力"
					className="flex-grow"
					defaultValue={deps.q}
					onChange={handleSearch}
				/>
			</div>
			<div className="flex justify-between mb-4">
				<Button
					className="w-32 gap-2"
					variant="outline"
					disabled={!hasPrevious}
					onClick={previousPage}
				>
					Previous
				</Button>
				<Button
					className="w-24"
					variant="outline"
					disabled={!hasNext}
					onClick={nextPage}
				>
					Next
				</Button>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{data.hits.map((hit) => (
					<Card key={hit.id}>
						<CardHeader className="flex flex-row justify-between">
							<div>
								<CardTitle>{hit.title}</CardTitle>
								<CardDescription className="line-clamp-6 flex gap-2">
									<span className="font-semibold">
										{hit.course_id.slice(0, -3)}
									</span>
									<span className="font-semibold">
										{hit.schedules.join(" ")}
									</span>
								</CardDescription>
							</div>

							<Button asChild size="icon" variant="ghost" className="shrink-0">
								<a
									href={`https://syllabus.sfc.keio.ac.jp/courses/${hit.course_id.slice(0, -3)}`}
									target="_blank"
									rel="noreferrer"
								>
									<SquareArrowOutUpRight className="w-6 h-6" />
								</a>
							</Button>
						</CardHeader>
						<CardContent>
							<div className="line-clamp-6 text-sm">{hit.description}</div>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="flex justify-between mb-4">
				<Button
					className="w-24"
					variant="outline"
					disabled={!hasPrevious}
					onClick={previousPage}
				>
					Previous
				</Button>
				<Button
					className="w-24"
					variant="outline"
					disabled={!hasNext}
					onClick={nextPage}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
