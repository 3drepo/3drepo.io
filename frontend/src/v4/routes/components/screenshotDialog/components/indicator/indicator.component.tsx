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
import { PureComponent, createRef } from 'react';
import { WindowEventListener } from '@/v4/helpers/windowEventListener';

import { StyledIndicator } from './indicator.styles';

interface IProps {
	color?: string;
	size: number;
}

export class Indicator extends PureComponent <IProps, any> {
	public indicatorRef = createRef();

	get indicatorElement() {
		return this.indicatorRef.current as HTMLElement;
	}

	public handleMouseMove = (event) => {
		const { left, top } = this.indicatorElement.parentElement.getBoundingClientRect();
		const offset = {
			x: event.clientX - left - this.indicatorElement.offsetWidth / 2,
			y: event.clientY - top - this.indicatorElement.offsetHeight / 2
		};
		this.indicatorElement.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
	}

	public render() {
		return (
			<>
				<WindowEventListener
					event='mousemove'
					onEventTriggered={this.handleMouseMove}
				/>
				<StyledIndicator {...this.props} ref={this.indicatorRef} />
			</>
		);
	}
}
