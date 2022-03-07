import { muiTheme } from 'storybook-addon-material-ui'
import { theme } from '@/v5/ui/themes/theme';
import { ThemeProvider } from "styled-components";
import { withThemesProvider } from "storybook-addon-styled-component-theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    transformSource: source => source.replace(/WithStyles\(ForwardRef\(/g, "").replace(/\)\)/g, ""),
  },
}

export const decorators = [
	muiTheme([theme]),
  withThemesProvider([theme])
];
