import { Headline, StyledForm, StyledGrid } from '@/v4/routes/teamspaceSettings/teamspaceSettings.styles';
import styled from 'styled-components';

export const V5TeamspaceSettingsOverrides = styled.div`
	${StyledForm} {
		.MuiAutocomplete-popper {
			display: none;
		}
		${StyledGrid}:first-of-type {
			display: none;
		}
		${Headline} {
			${({ theme }) => theme.typography.h2};
			color: ${({ theme }) => theme.palette.secondary.main};
		}
	}
`;
