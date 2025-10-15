# Deploying to AWS with Elastic Beanstalk

This guide will walk you through the process of deploying this application to AWS using Elastic Beanstalk and setting up a PostgreSQL database with Amazon RDS.

---

## IMPORTANT: Initial Database Setup

When you first create your AWS RDS database, it is completely empty. You **must** run the `schema.sql` script to create the necessary tables (`users`, `letters`, etc.) before the application will work. The easiest way to do this is with a graphical tool like `pgAdmin`.

### Step 1: Download and Install pgAdmin

*   Download and install the free `pgAdmin` tool from the [official website](https://www.pgadmin.org/download/).

### Step 2: Connect to Your AWS RDS Database

1.  Open pgAdmin.
2.  Right-click on "Servers" in the left-hand browser panel and select "Register" > "Server...".
3.  In the "General" tab, give your server a name (e.g., "AWS RDS").
4.  Switch to the "Connection" tab and fill in the following details:
    *   **Host name/address:** Your RDS database endpoint (you can find this in the AWS RDS console).
    *   **Port:** `5432`
    *   **Maintenance database:** `postgres`
    *   **Username:** The master username you created for your database.
    *   **Password:** The password you created for your database.
5.  Click **Save**. pgAdmin will now connect to your database.

### Step 3: Run the Schema Script

1.  In pgAdmin, with your server selected, click the "Tools" menu and select "Query Tool".
2.  This will open a new query editor panel.
3.  Open the `schema.sql` file from this project on your local computer and copy its entire contents.
4.  Paste the contents into the pgAdmin query editor.
5.  Click the "Execute/Run" button (it looks like a lightning bolt icon).

This will create all the necessary tables and sample data in your database. Your application should now be fully functional.

---

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

## Connecting Multiple GoDaddy Domains

If you own multiple domains (e.g., `directorsletters.com` and `directorletters.com`) and want them both to lead to your application, the best practice is to choose one as your **primary domain** and have the other permanently redirect to it. This is crucial for good SEO and a consistent user experience.

This guide will walk you through setting `directorsletters.com` as the primary domain and making `directorletters.com` redirect to it.

### Part 1: Configure the Primary Domain (`directorsletters.com`)

Follow these steps to point your main domain to your Elastic Beanstalk application.

#### Step 1.1: Create a Hosted Zone in AWS Route 53

1.  In the AWS Console, go to **Route 53**.
2.  Click **Create hosted zone**.
3.  Enter your primary domain name (e.g., `directorsletters.com`).
4.  Select **Public hosted zone**.
5.  Click **Create hosted zone**.

#### Step 1.2: Update Nameservers in GoDaddy

1.  After creating the hosted zone, Route 53 will give you four **NS (Name Server)** records. Copy these server names.
2.  Log in to your **GoDaddy account**.
3.  Go to your domain list and select your primary domain.
4.  Find the DNS management section and click "Change" under Nameservers.
5.  Select "I'll use my own nameservers" and paste the four server names you copied from Route 53.
6.  Save your changes. **Note:** It can take up to 48 hours for these changes to fully propagate across the internet.

#### Step 1.3: Get an SSL/TLS Certificate

1.  In the AWS Console, go to **AWS Certificate Manager (ACM)**.
2.  Click **Request a certificate** and choose **Request a public certificate**.
3.  For the domain name, add both your root domain and a wildcard for subdomains:
    *   `directorsletters.com`
    *   `*.directorsletters.com`
4.  Choose **DNS validation**.
5.  Click **Request**. ACM will now ask you to create CNAME records in Route 53 to prove you own the domain. Since Route 53 is now managing your DNS, you can simply click the "Create records in Route 53" button, and ACM will do it for you.
6.  Wait for the certificate status to change from "Pending validation" to **"Issued"**.

#### Step 1.4: Configure Elastic Beanstalk Load Balancer

1.  Go to your **Elastic Beanstalk** environment.
2.  In the left menu, go to **Configuration**.
3.  Find the **Load balancer** category and click **Edit**.
4.  Click **Add listener**.
5.  Set the **Port** to `443` and the **Protocol** to `HTTPS`.
6.  Select the SSL certificate you just created from the dropdown.
7.  Click **Add**, then **Apply** at the bottom of the page. This will update your environment.

#### Step 1.5: Point Your Domain to Elastic Beanstalk

1.  Go back to the **Route 53** console and select the hosted zone for your primary domain.
2.  Click **Create record**.
3.  Leave the record name blank (for the root domain).
4.  Select **Record type: A**.
5.  Enable the **Alias** toggle.
6.  For the endpoint, choose **Alias to Elastic Beanstalk environment** and select your environment (`directors-letters-env`).
7.  Click **Create record**.
8.  **Repeat these steps** to create another `A` record, but this time set the record name to `www`. This will ensure `www.directorsletters.com` also works.

Your primary domain is now configured!

### Part 2: Configure the Secondary Domain (`directorletters.com`) for Redirection

Follow these steps to make your second domain automatically redirect to your primary domain.

#### Step 2.1: Create an S3 Bucket for Redirection

1.  In the AWS Console, go to **S3**.
2.  Click **Create bucket**.
3.  The **Bucket name** must be the **exact name** of your secondary domain (e.g., `directorletters.com`).
4.  Choose the AWS Region for your bucket.
5.  **Uncheck "Block all public access"** and acknowledge that you are making the bucket public.
6.  Click **Create bucket**.

#### Step 2.2: Configure Bucket for Website Redirection

1.  Go into the S3 bucket you just created and click the **Properties** tab.
2.  Scroll to the bottom and find **Static website hosting**. Click **Edit**.
3.  Enable static website hosting.
4.  Select **Redirect requests for an object**.
5.  For the **Host name**, enter the full URL of your primary domain (e.g., `www.directorsletters.com`).
6.  For the **Protocol**, select `https`.
7.  Click **Save changes**.

#### Step 2.3: Set Up Route 53 and GoDaddy for the Secondary Domain

1.  Follow the same steps as **1.1 and 1.2** for your secondary domain:
    *   Create a **new hosted zone** in Route 53 for `directorletters.com`.
    *   Copy the four new nameservers.
    *   Update the nameservers in your GoDaddy account for this second domain.

#### Step 2.4: Point the Secondary Domain to the S3 Bucket

1.  Go to the Route 53 hosted zone for your **secondary domain**.
2.  Click **Create record**.
3.  Leave the record name blank.
4.  Select **Record type: A**.
5.  Enable the **Alias** toggle.
6.  For the endpoint, choose **Alias to S3 website endpoint** and select the S3 bucket you created for redirection.
7.  Click **Create record**.
8.  **Repeat** for the `www` subdomain, also pointing it to the same S3 bucket.

After these steps are complete and the DNS changes have propagated, anyone visiting your secondary domain will be automatically redirected to your primary domain.

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

---

## Troubleshooting: 504 Gateway Timeout / ETIMEDOUT Error

If your application fails to load and you see a `504 Gateway Timeout` error, or if your logs show `Error: connect ETIMEDOUT`, it almost always means your Elastic Beanstalk application cannot connect to your RDS database due to a security group misconfiguration.

Follow these steps to fix it:

### Step 1: Find your Elastic Beanstalk Security Group

1.  Navigate to the **EC2** service in the AWS Console.
2.  In the left menu, under "Network & Security," click **Security Groups**.
3.  Use the search bar to find the security group for your Elastic Beanstalk environment. It will usually have a name like `awseb-e-naddepcrbg-stack-AWSEBSecurityGroup-...`.
4.  Copy the **Group ID** (it will look like `sg-0123456789abcdef0`).

### Step 2: Add an Inbound Rule to your Database Security Group

1.  Navigate to the **RDS** service in the AWS Console.
2.  In the left menu, click **Databases** and select your database.
3.  Go to the **Connectivity & security** tab.
4.  Under "VPC security groups," click on the active security group. This will take you back to the EC2 security group console.
5.  With the database security group selected, click the **Inbound rules** tab at the bottom, then click **Edit inbound rules**.
6.  Click **Add rule**.
7.  For **Type**, select **PostgreSQL** (this will automatically set the port to 5432).
8.  For **Source**, select **Custom** and paste the **Group ID** of your Elastic Beanstalk security group that you copied in Step 1.
9.  Click **Save rules**.

This change will take effect almost immediately. Your application should now be able to connect to the database, and the timeout errors will be resolved. You may need to restart the application environment from the Elastic Beanstalk console for the changes to apply.