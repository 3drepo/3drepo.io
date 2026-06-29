# CD workflows (build, deploy, destroy)

Continuous deployment of 3drepo.io runs on GitHub Actions. It replaces the old
Azure DevOps pipelines that previously lived in `.azure/`.

| Workflow | File | What it does |
| --- | --- | --- |
| Deploy 3drepo.io | [`buildAndDeploy.yml`](./buildAndDeploy.yml) | Builds + pushes the Docker image and runs `helm upgrade --install`. |
| Destroy 3drepo.io instance | [`destroy.yml`](./destroy.yml) | Runs `helm uninstall` to tear a branch deployment down. |
| Chat Operations Dispatch | [`chatOperations.yml`](./chatOperations.yml) | Turns `/deploy` and `/destroy` PR comments into the dispatch events the two workflows above listen for. |

The Docker build context lives in [`docker/3drepo.io/`](../../docker/3drepo.io).

## How to deploy

There are two ways a deploy happens:

- **Automatically** – every push (merge) to `master` or `staging` builds and
  deploys that branch. Nothing to do.
- **On demand (per PR)** – comment **`/deploy`** on the pull request. Only users
  with **write access or above** can do this. The instance comes up at
  `https://<branch-name>.dev.3drepo.io` (the branch name is lowercased and
  non-alphanumeric characters become `-`, e.g. `ISSUE_1234` → `issue-1234`).

Fork PRs are refused, because deploying uses registry and cluster secrets.

## How to destroy

- **Automatically** – closing/merging the PR tears its deployment down
  ([`onPRClose.yml`](./onPRClose.yml) dispatches the destroy workflow).
- **On demand** – comment **`/destroy`** on the pull request.

`master` and `staging` are protected: the destroy workflow refuses to remove
those releases even if asked.

## Per-branch deploy overrides

Because deploys are driven by `repository_dispatch`, GitHub always runs the
**workflow definition from the default branch (`master`)** — so editing
`buildAndDeploy.yml` on a feature branch has no effect on a `/deploy`.

To still tune a branch's deployment (the equivalent of the old Azure
`customHelmOverride`), edit [`.github/deploy/overrides.env`](../deploy/overrides.env)
**on your branch**. The deploy job checks out your branch and reads that file,
so the values take effect and show up in the PR diff for review. You can set:

- `HELM_CHART_VERSION` – the chart version to deploy.
- `CUSTOM_HELM_OVERRIDE` – extra comma-delimited `helm --set` overrides, e.g.
  `config.APP_QUEUE_DNS=issue-xxx-rabbitmq,config.ADDITIONAL_CONFIG=hello`.
