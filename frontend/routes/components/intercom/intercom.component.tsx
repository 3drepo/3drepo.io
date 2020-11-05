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
import React from 'react';

import { IntercomProvider, useIntercom } from 'react-use-intercom';
import { clientConfigService } from '../../../services/clientConfig';

interface IProps {
	currentUser: any;
}

export class Intercom extends React.PureComponent<IProps, any> {
	public setNameAndMail = () => {
		try {
			const {firstName, lastName, email } = this.props.currentUser;

			if (!email) {
				return;
			}

			const name = `${firstName || ''} ${lastName || ''}`.trim();
			// @ts-ignore
			window.intercomSettings = {
				app_id: clientConfigService.intercomLicense,
				name: name, // Full name
				email: email, // Email address
				user_id: email // current_user_id
			}
			
		} catch (e) {
			console.debug('Intercom api error: ' + e);
		}
	}

// //Set your APP_ID
// var APP_ID = "APP_ID";
// var current_user_email = "sartre@existentialist.com";
// var current_user_name = "Jean Paul Sartre";
// var current_user_id = "1940";

// window.intercomSettings = {
//     app_id: APP_ID,
//     name: current_user_name, // Full name
//     email: current_user_email, // Email address
//     user_id: current_user_id // current_user_id
//   };

	public componentDidUpdate(prevProps) {
		// @ts-ignore
		window.intercomSettings = window.intercomSettings || {};

		// @ts-ignore
		if (!Boolean(window.intercomSettings)) { // This is in case the chat was available before the email
			this.setNameAndMail();						// in this case  the setNameAndEmail must be ran again
		}
	}

	public render() {
		const haveLicense: boolean = Boolean(clientConfigService.intercomLicense);
		const IntercomPage = () => { 
			const { boot, shutdown, hide, show, update } = useIntercom();
			return <div></div>
		}
		return (<>{haveLicense && <IntercomProvider appId={clientConfigService.intercomLicense} autoBoot>
			<IntercomPage />
		</IntercomProvider>}</>);
	}
}
