/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { useEffect } from 'react';

// @ts-ignore
import { useIntercom, IntercomProvider } from 'react-use-intercom';
import { clientConfigService } from '../../../services/clientConfig';

interface IProps {
	currentUser: any;
}

const IntercomPage = (props: IProps) => {
	const {  boot, hardShutdown } = useIntercom();

	const setNameAndMail = () => {
		try {

			const {firstName, lastName, email, intercomHash } = props.currentUser;

			const name = `${firstName || ''} ${lastName || ''}`.trim();
			// @ts-ignore
			boot( {
					name, // Full name
					email, // Email address
					userHash: intercomHash
				}
			);

		} catch (e) {
			console.debug('Intercom api error: ' + e);
		}
	};

	useEffect(() => {
		if (props.currentUser?.email) {
			setNameAndMail();
		} else {
			hardShutdown();
		}
	}, [props.currentUser?.email]);

	return (<div />);
};

const {intercomLicense} = clientConfigService;
const haveLicense: boolean = Boolean(intercomLicense);
export const  Intercom = (props: IProps) =>
	(<>{haveLicense && <IntercomProvider appId={intercomLicense} > <IntercomPage {...props} /> </IntercomProvider>}</>);
