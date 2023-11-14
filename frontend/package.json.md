### Dependencies

##### Trigger a warning
```json
{
	"dependencies": {
		"react-trello": "2.2.3", // no longer maintained apparently
		"react-truncate": "2.4.0", // no longer maintained and no viable alternative libraries
	}
}
```

##### Might no longer be needed
```json
{
	"dependencies": {
		"@date-io/dayjs": "1.1.0", // check if date-io or dayjs rely on this
		"typedoc": "0.17.7", // documentation generator for TypeScript projects, but doesn't seem to be used
	}
}
```

### Why resolutions?
```json
{
	"resolutions": {
		// This is required to use styled-components with MUI. Refer to this link
		// https://mui.com/material-ui/guides/styled-components/#with-yarn
		"@mui/styled-engine": "npm:@mui/styled-engine-sc@5.12.0"
	}
}
```
