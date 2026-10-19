export const getSelectionTextOffset = (editor: HTMLElement, node: Node, offset: number) => {
	const range = document.createRange();
	range.selectNodeContents(editor);
	range.setEnd(node, offset);
	return range.toString().length;
};

const getTextNodeAtOffset = (editor: HTMLElement, offset: number): [Node, number] => {
	const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	let remaining = offset;

	while (node) {
		const length = node.textContent?.length || 0;
		if (remaining <= length) return [node, remaining];
		remaining -= length;
		node = walker.nextNode();
	}

	return [editor, editor.childNodes.length];
};

export const restoreSelection = (editor: HTMLElement, startOffset: number, endOffset: number) => {
	const selection = window.getSelection();
	if (!selection) return;

	const [startNode, startNodeOffset] = getTextNodeAtOffset(editor, startOffset);
	const [endNode, endNodeOffset] = getTextNodeAtOffset(editor, endOffset);
	const range = document.createRange();
	range.setStart(startNode, startNodeOffset);
	range.setEnd(endNode, endNodeOffset);
	selection.removeAllRanges();
	selection.addRange(range);
};
