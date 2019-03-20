import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import { COLOR } from '../../../../styles';

export const StyledIconButton = styled(IconButton)`
	&.toolbarButton, &.panelButton {
    color: ${(props: any) => props.active ? COLOR.SUNGLOW : COLOR.WHITE};
    padding: 10px;

    &:hover {
      background-color: transparent;
    }
  }

  &.toolbarButton {
    &:hover {
      background-color: transparent;
    }
  }

  &.panelButton {
    background-color: ${COLOR.REGENT_GRAY};
    box-shadow: 0 3px 3px ${COLOR.BLACK_16};
    margin-bottom: 20px;

    &:hover {
      background-color: ${COLOR.REGENT_GRAY};
    }
  }
` as any;
