/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { useEffect, useRef } from 'react';
import TicketPin from '@assets/icons/filled/pin_ticket-filled.svg';
import IssuePin from '@assets/icons/filled/pin_issue-filled.svg';
import RiskPin from '@assets/icons/filled/pin_risk-filled.svg';
import MarkerPin from '@assets/icons/filled/pin_marker-filled.svg';
import { PinIcon } from '@/v5/store/tickets/tickets.types';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { getEmbeddedPin } from './pinIcons.helper';
import { getTintFilter } from '@/v5/helpers/colors.helper';
import { RgbArray } from '@/v5/helpers/colors.helper';

const PinPerType = 
{
	// 'ISSUE': IssuePin,
	// 'RISK': RiskPin,
	// 'DEFAULT': TicketPin,
	// 'MARKER': MarkerPin,
};

export const Pin = ({ pinIcon, selected = false, colour }: { pinIcon: PinIcon | string, selected?: boolean, colour?: RgbArray }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const BuiltInIcon = PinPerType[pinIcon];
	const containerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (BuiltInIcon) return undefined;
		let mounted = true;
		(async () => {
			const embeddedSvg = await getEmbeddedPin(teamspace, pinIcon, selected);
			if (mounted && containerRef.current) {
				containerRef.current.innerHTML = embeddedSvg;
			}
		})();
		return () => { mounted = false; };
	}, [teamspace, pinIcon, selected]);

	if (BuiltInIcon) return (<BuiltInIcon />);

	// Custom (backend) pin icons are tinted with a CSS filter instead of
	// relying on internal SVG classes/ids, so they don't need to be
	// hand-authored with specific colourable parts.
	const style = colour ? { filter: getTintFilter(colour) } : undefined;
	return (<span ref={containerRef} style={style} />);
};