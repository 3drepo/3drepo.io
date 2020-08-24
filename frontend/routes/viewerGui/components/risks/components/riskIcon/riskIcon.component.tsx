import React from 'react';

import { Icon } from './riskIcon.styles';

// tslint:disable-next-line
const risksIconPath = 'M50,71.41c-1.52,0-3-1.09-4.12-3.08L27.1,35.67c-1.14-2-1.35-3.8-.58-5.12S29,28.5,31.25,28.5h37.5c2.29,0,4,.73,4.73,2.05s.56,3.14-.58,5.12L54.12,68.33C53,70.32,51.52,71.41,50,71.41Zm0-14.35a3.22,3.22,0,1,0,3.3,3.22A3.26,3.26,0,0,0,50,57.06Zm0-25a4.16,4.16,0,0,0-3.35,1.67c-1.61,2-2.06,5.46-1.22,9.26C46.49,47.79,48.15,53.5,50,53.5S53.51,47.79,54.57,43c.84-3.8.39-7.26-1.22-9.27A4.19,4.19,0,0,0,50,32.06Z';

export const RisksIcon = (props) => (
	<Icon viewBox="0 0 49.86 44.91" {...props}>
		<g>
			<path
				stroke="none"
				paintOrder="fill stroke markers"
				d={risksIconPath}
				transform="translate(-25.07 -27.5)"
			/>
		</g>
	</Icon>
);
