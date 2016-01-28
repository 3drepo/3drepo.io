module.exports = function(row){
	return `
		<div class="tac-row">
			<div class="tac-row-title">${row.title}</div>
			<div class="tac-row-content">${row.content}</div>
		</div>
	`;
}
