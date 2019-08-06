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

import ReactLiveChat from 'react-livechat';
import { clientConfigService } from '../../../services/clientConfig';

interface IProps {
	currentUser: any;
}

export class LiveChat extends React.PureComponent<IProps, any> {
	public setNameAndMail = () => {
		try {
			const {firstName, lastName, email } = this.props.currentUser;
			if (!email) {
				return;
			}

			const name = `${firstName || ''} ${lastName || ''}`.trim();
			// @ts-ignore
			window.LC_API.set_visitor_name(name);
			// @ts-ignore
			window.LC_API.set_visitor_email(email);
		} catch (e) {
			console.debug('Livechat api error: ' + e);
		}
	}

	public componentDidUpdate(prevProps) {
		// @ts-ignore
		window.LC_API = window.LC_API || {};
		// @ts-ignore
		window.LC_API.on_after_load = this.setNameAndMail;

		// @ts-ignore
		if (Boolean(window.LC_API.set_visitor_email)) { // This is in case the chat was available before the email
			this.setNameAndMail();						// in this case  the setNameAndEmail must be ran again
		}

	}

	public render() {
		const haveLicense: boolean = Boolean(clientConfigService.liveChatLicense);
		return (<>{haveLicense && <ReactLiveChat license={clientConfigService.liveChatLicense} />}</>);
	}
}
