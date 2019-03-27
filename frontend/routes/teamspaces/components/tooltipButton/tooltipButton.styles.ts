import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import { COLOR } from '../../../../styles';

export const StyledIconButton = styled(IconButton)`
  &.panelButton {
    background-color: ${(props: any) => props.active ? COLOR.PRIMARY_MAIN : COLOR.REGENT_GRAY};
    color: ${COLOR.WHITE};

    &:hover {
      background-color: ${(props: any) => props.active ? COLOR.PRIMARY_MAIN : COLOR.REGENT_GRAY};
    }
  }

	&.toolbarButton {
    background-color: ${COLOR.REGENT_GRAY};
    color: ${(props: any) => props.active ? COLOR.SUNGLOW : COLOR.WHITE};
    padding: 10px;

    &:hover {
      background-color: ${COLOR.REGENT_GRAY};
    }
  }

  &.panelButton, &.toolbarSubButton {
    box-shadow: 0 3px 3px ${COLOR.BLACK_16};
    margin-bottom: 20px;
  }

  &.toolbarSubButton {
    margin-bottom: 10px;

    &:hover {
      background-color: ${COLOR.REGENT_GRAY};
    }
  }

  &.toolbarSubButton, &.toolbarButton {
    height: 40px;
    width: 40px;
    font-size: 1rem;

    svg {
      font-size: 20px;
    }
  }

  &.toolbarSpecificButton {
    background-color: ${COLOR.SUNGLOW};

    &:hover {
      background-color: ${COLOR.SUNGLOW};
    }
  }

  &:hover {
    cursor: pointer;
  }
` as any;
