# Directors Letters

This is a web application for managing and viewing director's letters.

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