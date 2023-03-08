# Utility Suite
The utility script consist of a library of helpful commands to extract or update the data within the application.

To see the list of commands and how to run them, run `yarn run-script --help` on the [backend root folder](../../../)

## Scheduler
[The scheduler](./scheduler.js) is an executable script. Depending on the [configuration](scheduler.config.json), it will execute certain script(s) within the utility suite. It is designed to be hooked onto a job scheduler (e.g. `cron`) to be executed on a daily basis.

To run the scheduler with the default configuration, run the following on the [backend root folder](../../../):
````
yarn run-scheduled-task
````

You can also run the scheduler with a bespoke configuration by defining the config file path:
````
yarn run-scheduled-task --config <path_to_your_config_file>
````

### Scheduler configurations
The scheduler takes in a configuration in json format. The accepted properties are as follows:
- `daily` : executed everytime the scheduler runs
- `weekly`: executed every Sunday.
- `monthly`: executed on the first Sunday of every month.
- `emailOnFailure`: boolean flag to denote if an email should be sent upon error (default: true)

Each property takes an array of objects with the following properties:

| Field      | Optional | Description |
| ----------- | ----------- | ----------- |
| name      | No       | The name of the command, must match a command name from run-script |
| params   | Yes        | Parameters to pass into the command, this must match the params accepted by the `run()` function within the script |

An example:
````js
{
  "daily": [
    // This will clean up any files within the shared directory older than 14 days (using default params)
    { "name": "cleanUpSharedDir" }
  ],
  "weekly": [
    // This will remove incomplete revisions older than 5 days (instead of the 14 days default)
    {"name": "removeIncompleteRevisions", "params": [5]}
  ],
  "monthly": [
    // This will print out a report of all active licenses to C://dataOutput
    {"name": "allActiveLicenses", "params": ["C://dataOutput"]}
  ]
}
````

