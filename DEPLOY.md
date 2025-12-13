# Deploying to AWS with Amplify Gen 2

This guide shows how to host the app (frontend + Express API) and provision S3 storage using **AWS Amplify Gen 2**. No Elastic Beanstalk is required. If you want Postgres in AWS, create an external Amazon RDS instance and point the app to it via environment variables.

---

## Prerequisites

- An AWS account with Amplify enabled.
- Amplify CLI v12+ installed locally (`npm i -g @aws-amplify/cli`).
- Node.js 20.x installed locally (matches the build image in `amplify.yml`).
- GitHub repository connected or accessible so Amplify Hosting can pull your code.
- (Optional) An Amazon RDS PostgreSQL instance if you want AWS-managed Postgres.

## Step 1: Clone and install locally

```bash
git clone <repository-url>
cd Director-Letters
npm install
```

## Step 2: Configure Amplify locally (one time)

Amplify Gen 2 uses code-defined backend resources (see `amplify/backend.ts`). The repo already defines an S3 bucket named `letters` with authenticated write access and guest read access.

```bash
# If you have not initialized Amplify in this repo on your machine
amplify pull --appId <your-app-id> --envName <env>
# or create a new environment
amplify init
```

## Step 3: Provision backend storage

Push the defined storage resource to your Amplify environment:

```bash
npx ampx backend push
```

This creates the S3 bucket and policies specified in `amplify/storage/resource.ts`.

## Step 4: Configure environment variables

In the Amplify console, open your app > **Backend environments** > **Environment variables** and set:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – point to your Postgres instance (Amazon RDS or another reachable Postgres server).
- Any additional secrets your Express server expects.

These variables are injected during the build defined in `amplify.yml`.

## Step 5: Connect the repository and deploy

1. In the Amplify console, choose **New app** > **Host web app** and connect your GitHub repository.
2. Select the branch to deploy (e.g., `work` or `main`).
3. Amplify will use `amplify.yml` to build both backend (`ampx pipeline-deploy`) and frontend assets. The Express server is built alongside the Vite frontend.
4. After the first deployment, Amplify provides a default domain. You can add custom domains under **Domain management**.

## Step 6: Ongoing updates

- Push commits to the connected branch; Amplify rebuilds and redeploys automatically.
- Backend changes (e.g., storage rules) are codified in the `amplify/` folder and deployed via the same pipeline.
- Use the S3 bucket for storing letter HTML uploads; dropdown metadata remains in Postgres.

## Optional: Creating Amazon RDS PostgreSQL

If you need AWS-managed Postgres (instead of a self-hosted database):

1. Create a PostgreSQL instance in Amazon RDS.
2. Ensure the security group allows inbound traffic from Amplify build/hosting IPs or place both in a VPC with proper rules.
3. Update the Amplify environment variables with the RDS endpoint, port, user, password, and database name.
4. Run database migrations from your local machine or a CI job targeting the RDS instance (`npm run migrate`).

---

## DNS and domains

Manage custom domains in Amplify **Domain management**. Route 53 and ACM handle DNS and TLS when you connect domains through Amplify; no Elastic Beanstalk steps are needed.
