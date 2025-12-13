const { S3Client } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const s3Client = new S3Client({ region });

module.exports = s3Client;
