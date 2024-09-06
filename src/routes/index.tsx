import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { meilisearch } from "@/lib/melisearch";

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

	console.log(data);

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
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{data.hits.map((hit) => (
					<Card key={hit.id}>
						<CardHeader>
							<CardTitle>{hit.title}</CardTitle>
							<CardDescription className="line-clamp-6">
								{hit.description}
							</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
