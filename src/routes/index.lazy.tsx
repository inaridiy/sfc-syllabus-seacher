import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<div className="p-2 text-red">
			<h3>SFCシラバス検索システム</h3>
		</div>
	);
}
