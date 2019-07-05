import { IS_MAINTENANCE } from './constants/environment';

if (IS_MAINTENANCE) {
	document.getElementById('maintenanceMode').style.display = 'block';
	document.getElementById('app').style.display = 'none';
}
