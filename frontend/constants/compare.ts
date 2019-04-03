export const DIFF_COMPARE_TYPE = 'diff';
export const CLASH_COMPARE_TYPE = 'clash';

export const BASE_MODEL_TYPE = 'base';
export const TARGET_MODEL_TYPE = 'target';

export const COMPARE_TYPES = {
	[DIFF_COMPARE_TYPE]: {
		label: '3d diff',
		type: DIFF_COMPARE_TYPE
	},
	[CLASH_COMPARE_TYPE]: {
		label: 'Instant clash',
		type: CLASH_COMPARE_TYPE
	}
};

export const MODEL_TYPES = {
	[BASE_MODEL_TYPE]: BASE_MODEL_TYPE,
	[TARGET_MODEL_TYPE]: TARGET_MODEL_TYPE
};

export const COMPARE_TABS = {
	DIFF: '3d diff',
	CLASH: 'Instant clash'
};

export const RENDERING_TYPES = {
	BASE: 1,
	COMPARE: 2,
	TARGET: 3
};

export const RENDERING_TYPES_LIST = [
	{
		type: RENDERING_TYPES.BASE,
		label: 'Base'
	},
	{
		type: RENDERING_TYPES.COMPARE,
		label: 'Compare'
	},
	{
		type: RENDERING_TYPES.TARGET,
		label: 'Base'
	}
];

export const modelsMock = [
	{
		_id: 1,
		name: 'Lego_House_Structure',
		currentRevision: 101,
		baseRevision: 101,
		revisions: [{
			_id: 101,
			name: 'r2',
			timestamp: '2018-01-16T15:58:10.000Z'
		}]
	},
	{
		_id: 2,
		name: 'Lego_House_Landscape',
		currentRevision: 102,
		baseRevision: 102,
		revisions: [{
			_id: 102,
			timestamp: '2018-01-16T15:19:52.000Z'
		}]
	},
	{
		_id: 3,
		name: 'Lego_House_Architecture',
		currentRevision: 104,
		baseRevision: 104,
		revisions: [{
			_id: 103,
			name: 'r3',
			timestamp: '2018-01-16T16:02:54.000Z'
		}, {
			_id: 104,
			name: 'r2',
			timestamp: '2018-01-16T15:26:58.000Z'
		}, {
			_id: 105,
			name: 'r1',
			timestamp: '2018-01-16T15:19:01.000Z'
		}]
	},
	{
		_id: 4,
		name: 'Model name',
		currentRevision: 106,
		baseRevision: 106,
		revisions: [{
			_id: 106,
			name: 'Rev EEE',
			timestamp: '2018-01-18T15:26:58.000Z'
		}, {
			_id: 107,
			name: 'Rev FFF',
			timestamp: '2018-01-18T15:34:02.000Z'
		}]
	}, {
		_id: 5,
		name: 'Model name 2 with a veerrrrrry long name',
		currentRevision: 108,
		baseRevision: 108,
		revisions: [{
			_id: 108,
			name: 'Rev AAA',
			timestamp: '2018-01-24T10:00:00.000Z'
		}]
	}
];
