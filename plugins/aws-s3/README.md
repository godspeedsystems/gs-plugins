# AWS S3 Plugin Documentation

## Overview

The `AWS S3 Plugin` extends the functionality of the Godspeed framework to work with AWS S3. It provides a streamlined interface for interacting with the Amazon S3 service, offering functionalities such as listing objects, uploading objects, downloading objects, and deleting objects in an S3 bucket.

## Configuration

To use the `AWS S3 Plugin`, you need to provide AWS configurations, including the Access Key, Secret Key, AWS Region, and S3 bucket name. These configurations can be set using environment variables.

### Environment Variables

The plugin utilizes environment variables to securely pass AWS configuration:

- **`AWS_ACCESS_KEY_ID`**: Your AWS access key.
- **`AWS_SECRET_ACCESS_KEY`**: Your AWS secret access key.
- **`AWS_REGION`**: AWS region of your S3 bucket, e.g., "us-west-1".
- **`AWS_S3_BUCKET_NAME`**: The name of your S3 bucket.

Ensure to add `.env` to your `.gitignore` to keep sensitive information out of version control. Here's an example of how to define these environment variables in a `.env` file:

```dotenv
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name

```

## Here's how you can use the AWS S3 Plugin to perform various S3 operations:

```
// Import the AWS S3 Plugin and necessary classes
import AWSS3DataSource from "./AWSS3DataSource";

// Create an instance of the AWS S3 Plugin with the provided configurations
const s3Plugin = new AWSS3DataSource({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
}, process.env.AWS_S3_BUCKET_NAME);

// Listing objects in the S3 bucket
const list = await s3Plugin.execute({ operation: 'list' });

// Uploading an object to the S3 bucket
const uploadResponse = await s3Plugin.execute({
  operation: 'upload',
  Key: "test.txt",
  Body: "Hello World",
  ContentType: 'text/plain'
});

// Downloading an object from the S3 bucket
const downloadResponse = await s3Plugin.execute({
  operation: 'download',
  Key: "test.txt"
});

// Deleting an object from the S3 bucket
const deleteResponse = await s3Plugin.execute({
  operation: 'delete',
  Key: "test.txt"
});

```

## Error Handling

Errors are returned as objects with a message key. Always check for errors when carrying out operations. For example:

```try {
  const result = await s3Plugin.execute({
    operation: 'list'
  });

  if (result.message) {
    // Handle success
  } else {
    // Handle the result data
    console.log(result);
  }
} catch (error) {
  console.error("Error:", error.message);
}
```

For optimal security, especially in a production setting, make sure environment variables are kept safe. Employ tools and services that focus on secrets management to store and retrieve your AWS credentials securely.
