/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Chip, Paper, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getRadius } from './kanbanBoard.styles';
import { Card } from './kanbanBoard.types';


const DefaultCardPaper = styled(Paper)(({ theme }) => ({
	borderRadius: getRadius(theme, 2),
	borderColor: theme.palette.divider,
	padding: theme.spacing(1.5),
	backgroundColor: theme.palette.background.paper,
	boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
}));

const DefaultCardContent = styled(Stack)(({ theme }) => ({
	gap: theme.spacing(1),
}));

const DefaultCardHeader = styled(Stack)(({ theme }) => ({
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: theme.spacing(1),
}));

const DefaultCardTitle = styled(Typography)({
	fontWeight: 700,
	minWidth: 0,
	overflowWrap: 'anywhere',
});

const DefaultCardLabel = styled(Chip)(({ theme }) => ({
	flexShrink: 0,
	borderRadius: getRadius(theme),
	fontWeight: 700,
	height: 24,
}));

const DefaultCardDescription = styled(Typography)({
	overflowWrap: 'anywhere',
});
    
export function DefaultCard(card: Card) {
	return (
		<DefaultCardPaper variant="outlined">
			<DefaultCardContent>
				<DefaultCardHeader>
					<DefaultCardTitle variant="subtitle2">
						{card.title}
					</DefaultCardTitle>
					<DefaultCardLabel label={card.label} size="small" />
				</DefaultCardHeader>
				<DefaultCardDescription variant="body2" color="text.secondary">
					{card.description}
				</DefaultCardDescription>
			</DefaultCardContent>
		</DefaultCardPaper>
	);
}
