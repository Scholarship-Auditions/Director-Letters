# Deploying to AWS with Elastic Beanstalk

This guide will walk you through the process of deploying this application to AWS using Elastic Beanstalk and setting up a PostgreSQL database with Amazon RDS.

## Prerequisites

*   An AWS account. If you don't have one, you can create one [here](https://aws.amazon.com/free/).
*   The AWS CLI installed and configured on your local machine. You can find instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html).
*   The Elastic Beanstalk CLI installed. You can find instructions [here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).

## Step 1: Create a PostgreSQL Database with Amazon RDS

1.  **Navigate to the RDS Dashboard:**
    *   Open the AWS Management Console and search for "RDS."
    *   Click on "Create database."

2.  **Configure the Database:**
    *   Choose "Standard create" and select "PostgreSQL."
    *   Choose a template. The "Free tier" is a good option for development and testing.
    *   Under "Settings," create a master username and password. **Remember these credentials.**
    *   Under "Connectivity," make sure "Public access" is set to "Yes." This will allow your Elastic Beanstalk application to connect to the database.
    *   Click "Create database."

3.  **Retrieve Database Credentials:**
    *   Once the database is created, click on its name to view the details.
    *   Under the "Connectivity & security" tab, you will find the **endpoint** and **port**. You will need these, along with the username and password you created, to configure your application.

## Step 2: Prepare the Application for Deployment

1.  **Initialize Elastic Beanstalk:**
    *   In your terminal, navigate to the root directory of the project.
    *   Run the following command:
        ```bash
        eb init -p "Node.js" --region <your-aws-region> directors-letters
        ```
        Replace `<your-aws-region>` with your desired AWS region (e.g., `us-east-2`).

2.  **Create an Environment:**
    *   Run the following command to create an environment and deploy the application:
        ```bash
        eb create directors-letters-env
        ```

## Step 3: Configure Environment Variables

1.  **Navigate to the Elastic Beanstalk Dashboard:**
    *   In the AWS Management Console, search for "Elastic Beanstalk."
    *   Click on your environment (`directors-letters-env`).

2.  **Set Environment Properties:**
    *   In the left-hand menu, click on "Configuration."
    *   Under "Software," click "Edit."
    *   Scroll down to "Environment properties" and add the following variables:
        *   `DB_HOST`: The endpoint of your RDS database.
        *   `DB_USER`: The master username for your database.
        *   `DB_PASSWORD`: The password you created for the database.
        *   `DB_DATABASE`: The name of the database (the default is `postgres`).
    *   Click "Apply."

## Step 4: Access Your Application

Once the environment has been updated, you can access your application by clicking the URL at the top of the Elastic Beanstalk dashboard.

## Additional Notes

*   **Database Schema:** You will need to manually create the necessary tables in your new RDS database. You can do this by connecting to the database with a tool like `psql` or a graphical client and running the SQL statements from the original project.
*   **Troubleshooting:** If you encounter issues, check the logs in the Elastic Beanstalk dashboard for more information.
*   **Security:** For a production environment, it is recommended to configure a VPC and security groups to restrict database access to only your Elastic Beanstalk instances. The instructions above with public access are for simplicity.