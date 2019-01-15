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

import * as React from 'react';
import { isEqual } from 'lodash';

import { PreviewDetails } from '../../../../../components/previewDetails/previewDetails.component';
import { Log } from '../../../../../components/log/log.component';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { prepareRisk } from '../../../../../../helpers/risks';
import { Container } from './riskDetails.styles';

interface IProps {
	jobs: any[];
	risk: any;
}

interface IState {
	risk: any;
}

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		risk: {} as any
	};

	public setPreparedRisk = () => {
		const risk = prepareRisk(this.props.risk, this.props.jobs);
		this.setState({ risk });
	}

	public componentDidMount() {
		const risk = prepareRisk(this.props.risk);
		this.setState({ risk });
	}

	public componentDidUpdate(prevProps) {
		const riskDataChanged = !isEqual(this.props.risk, prevProps.risk);
		if (riskDataChanged) {
			this.setPreparedRisk();
		}
	}

	public renderLogListItem = (item) => {

	}

	public renderLogList = renderWhenTrue(() => (<div />));

	public render() {
		const { risk } = this.state;

		return (
			<Container>
				<PreviewDetails {...risk} />
				{/* <Log /> */}
			</Container>
		);
	}
}
