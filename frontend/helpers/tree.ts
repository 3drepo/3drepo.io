export const calculateTotalMeshes = (nodes) => {
	return nodes && nodes.length ? nodes
		.map((node) => node.shared_ids ? node.shared_ids.length : 0)
		.reduce((acc, val) => acc + val, 0) : 0;
};
