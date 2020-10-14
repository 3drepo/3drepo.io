export const WebGLChecker = () => {
	if (!window.WebGLRenderingContext) {
		return 0;
	}

	const canvas = document.createElement('canvas');

	if (!canvas.getContext('webgl2')) {
		if (!canvas.getContext('experimental-webgl2')) {
			if (!canvas.getContext('webgl')) {
				if (!canvas.getContext('experimental-webgl')) {
					return 0;
				}
			}
			return 1;
		}
		return 2;
	}
	return 2;
};
