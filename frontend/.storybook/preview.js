import { muiTheme } from 'storybook-addon-material-ui5'
import { theme } from '@/v5/ui/themes/theme';
import { withThemesProvider } from "storybook-addon-styled-component-theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
  docs: {
    transformSource: source => source.replace(/WithStyles\(ForwardRef\(/g, "").replace(/\)\)/g, ""),
  },
}

export const decorators = [
	muiTheme([theme]),
  withThemesProvider([theme])
];
