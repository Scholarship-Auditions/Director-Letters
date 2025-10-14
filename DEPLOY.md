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

## Step 5: Automate Deployment with GitHub Actions

To automatically deploy your application to Elastic Beanstalk whenever you push changes to the `main` branch, you need to add your AWS credentials as secrets to your GitHub repository.

1.  **Create an IAM User in AWS:**
    *   It's a best practice to create a dedicated IAM user with programmatic access and the minimum required permissions to deploy to Elastic Beanstalk. Grant this user the `AWSElasticBeanstalkFullAccess` policy.
    *   When you create the user, you will get an **Access Key ID** and a **Secret Access Key**. **Save these securely.**

2.  **Add Secrets to Your GitHub Repository:**
    *   In your GitHub repository, go to "Settings" > "Secrets and variables" > "Actions."
    *   Click "New repository secret."
    *   Create two new secrets:
        *   `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID.
        *   `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key.

Once you have added these secrets, the GitHub Actions workflow will be able to securely connect to your AWS account and deploy your application.

---

## Deploying from the AWS Console (Manual)

If you prefer to deploy the application manually from the AWS Management Console instead of using the CLI or GitHub Actions, follow these steps.

### Step 1: Package Your Application

1.  On your local machine, select all the files and folders in the project's root directory **except for the `.git` folder and the `.github` folder.**
2.  Compress the selected files into a single `.zip` file. You can name it `directors-letters-deploy.zip`.

### Step 2: Create an Elastic Beanstalk Environment

1.  **Navigate to Elastic Beanstalk:**
    *   Open the AWS Management Console and search for "Elastic Beanstalk."
    *   Click on "Create Application."

2.  **Configure Application:**
    *   **Application name:** `directors-letters`
    *   Add any desired application tags.

3.  **Configure Environment:**
    *   **Environment name:** `directors-letters-env` (or another name of your choice).
    *   **Domain:** A unique domain will be auto-generated for you.
    *   **Platform:** Choose **Node.js**.
    *   **Platform branch and version:** You can select the latest recommended versions. Elastic Beanstalk will respect the `engines` setting in your `package.json`.

4.  **Upload Your Code:**
    *   Under "Application code," select "Upload your code."
    *   Click "Upload" and select the `.zip` file you created in Step 1.

5.  **Create Application:**
    *   Click "Create application." AWS will now provision the necessary resources and deploy your code. This process can take several minutes.

### Step 3: Configure Environment Variables

1.  **Navigate to Configuration:**
    *   Once your environment is running, go to the environment's page in the Elastic Beanstalk console.
    *   In the left-hand menu, click on "Configuration."

2.  **Edit Software Configuration:**
    *   Find the "Software" category and click "Edit."

3.  **Set Environment Properties:**
    *   Scroll down to the "Environment properties" section.
    *   Add the following variables, using the credentials from the RDS database you set up previously:
        *   `DB_HOST`: The endpoint of your RDS database.
        *   `DB_USER`: The master username for your database.
        *   `DB_PASSWORD`: The password you created for the database.
        *   `DB_DATABASE`: The name of the database (e.g., `postgres`).
    *   Click "Apply." This will trigger an environment update.

### Step 4: Access Your Application

Once the environment update is complete, you can access your live application by clicking the URL at the top of the Elastic Beanstalk dashboard. Remember that you will still need to set up the database schema manually as mentioned in the "Additional Notes" section.