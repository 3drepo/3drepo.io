import {UnityUtil} from './unity-util';

if (window && !window.UnityUtil) {
	(window as any).UnityUtil = UnityUtil;
}
