export const calculateTotalMeshes = (nodes) => {
	return nodes.length ? nodes
		.map((x) => x.shared_ids.length)
		.reduce((acc, val) => acc + val) : 0;
};
