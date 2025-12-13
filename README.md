# Directors Letters

This is a web application for managing and viewing director's letters.

## Data storage overview

- **Letters**: Uploaded `.docx` files are converted to HTML and stored in an S3 bucket managed by Amplify Storage (`letterBucket`). A signed download URL is returned by the API for each letter. The rendered HTML is also persisted in Postgres for searchability.
- **Dropdown data**: Writers, recipients, and categories continue to live in Postgres tables (`letterwriters`, `letterrecipients`, `lettercategories`).

## Amplify footprint

- Amplify Gen 2 currently provisions **only** S3 storage for letters. The REST API continues to run in Express, so no Amplify API resource is required—frontend calls hit the existing `/api/...` endpoints directly.

## Running the Project Locally

To run this project locally, follow these steps:

1.  **Install Node.js:** If you don't have Node.js installed, download and install it from the official [Node.js website](https://nodejs.org/).

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```

5.  **Set up the database:**
    *   Install PostgreSQL on your local machine if you don't have it already.
    *   Create a new database and user for the application.
    *   Set the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` environment variables in a `.env` file or your shell.
6.  **Run database migrations:**
    ```bash
    npm run migrate
    ```
7.  **Start the server:**
    ```bash
    npm start
    ```
8.  Open your web browser and navigate to `http://localhost:3100`.

## Deploying to AWS

For instructions on how to deploy this application to AWS, see the [deployment guide](DEPLOY.md).