/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import ReCAPTCHA from 'react-google-recaptcha';

import { Container } from './reCaptcha.styles';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
	sitekey: string;
}

interface IState {
	value: any[];
}

export class ReCaptcha extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public reCaptchaRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		this.setState({ value: this.props.value });
	}

	public handleChange = () => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: this.state.value,
					name: this.props.name
				}
			});
		}
	}

	public onReCaptchaChange = (value) => {
		this.setState({ value }, this.handleChange);
	}

	public render() {
		const { onBlur, sitekey } = this.props;

		return (
			<Container>
				<ReCAPTCHA
						onBlur={onBlur}
						sitekey={sitekey}
						onChange={this.onReCaptchaChange}
						ref={this.reCaptchaRef}
					/>
			</Container>
		);
	}
}
