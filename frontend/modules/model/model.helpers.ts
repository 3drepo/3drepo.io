export const uploadFileStatuses = {
	ok: 'ok',
	failed: 'failed',
	queued: 'queued',
	uploading: 'uploading',
	processing: 'processing',
	uploaded: 'uploaded'
};

// 3drepo.io expects coordinates to come in the format (x, -z, -y)
export const changePositionFormat = (position) => [
	position[0], -1 * position[2], - 1 * position[1]
];
