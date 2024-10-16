# Bulk Image Resizer Backend Assesment

This repository contains the codebase and documentation for a **Bulk Image Resizer Backend**. The system is designed to efficiently process and compress images based on input provided through a CSV file.

## Overview

The system performs the following tasks:

1. **Input**: Accepts a CSV file containing the following columns:
   - **Serial Number**: Unique identifier for each product.
   - **Product Name**: Name of the product associated with the images.
   - **Image URLs**: Comma-separated list of image URLs to be processed.

2. **Asynchronous Processing**: Compresses the images to 50% of their original quality, making sure while one file is being processed, the other files are not blocked. This ensures that the system can handle large batches of images efficiently.

3. **Output**: Generates a new CSV file with the same structure, but with an additional column for the URLs of the compressed images.

4. **API Endpoints**:
   - **Upload API**: Accepts the input CSV, validates its format, and returns a unique request ID.
   - **Status API**: Allows users to check the processing status of their images using the request ID.

5. **Callback**: If the user provides a callback URL, the system will send a POST request to the callback URL with the status of the image processing.


## Hosting and Documentation Links

- **API Endpoint**: [https://imageprocessingapi.shahbaz42.live](https://imageprocessingapi.shahbaz42.live)
>The servers are hosted on **AWS EC2** using **Docker** and **Docker Compose** to run API server and multiple workers. API server lies behind **Nginx**.

- **Postman Documentation**: [API Documentation](https://documenter.getpostman.com/view/38015276/2sAXjM2qbW)

## Architecture

![alt text](<https://shahbaz-bucket.s3.ap-south-1.amazonaws.com/Bulk+image+Processing+Server+(2).jpg>)

The architecture employs BullMQ for managing job queues. The system creates and processes tasks asynchronously, ensuring smooth and efficient execution without overloading the servers.

1. **Efficient Task Management**: The architecture handles task distribution among workers, ensuring that jobs are processed asynchronously without blocking the system. This allows for better resource utilization and quicker processing times.

2. **Scalability**: The architecture supports horizontal scaling, enabling the system to add more workers as the workload increases. This ensures the architecture can handle a large volume of tasks without performance degradation.

3. **Reliability and Fault Tolerance**:  Even if a few workers are down, jobs are automatically re-queued and picked up by other available workers, ensuring continuous processing without data loss or significant delays.


## Components

### 1. API server

The API server is a Node.js backend with TypeScript that handles incoming requests, validates the input CSV, and assigns tasks to the worker servers. Its functionalities include:

- **CSV Validation**: The API server ensures that the incoming CSV file is correctly formatted, containing the required columns like Serial Number, Product Name, and Input Image URLs. It also checks for any malformed data and provides appropriate error messages if validation fails.

- **Storage** : The API server stores the CSV file in AWS S3 as well as information about request and parsed input/output CSV files in database.

- **Task Creation in Queue**: Upon successful validation, and job creation the API server creates jobs in Queues for asynchronous processing.

- **Request ID Generation**: After assigning tasks, the API server generates a unique request ID for the batch of images being processed. This ID is returned to the client, allowing them to track the progress of the image processing.

- **Status API**: The API server provides an endpoint where users can query the status of their image processing jobs using the request ID. The status could indicate whether the task is pending, in progress, completed, or failed.

- **Webhook Integration**: The API server is responsible for triggering webhooks to notify external systems or clients when the processing of all images is complete. This can be used for further automation or to update the client system.


### 2. Stateless worker servers

The stateless worker servers are responsible for processing the image-related tasks that are placed in the queue by the API server. Their functionalities include:

- **Image Processing**: The worker servers asynchronously process each image by downloading it from the provided URL, compressing it to 50% of its original quality, and then uploading the processed image to AWS S3.

- **Task Execution**: Each worker server picks up tasks from the queue independently, processes the images, and updates the database with the output image URLs. Since the workers are stateless, they do not retain any information between tasks, making them highly scalable and resilient.

- **Error Handling and Retry Mechanism**: The workers include error handling mechanisms to manage issues like failed downloads.

- **Scalability**: Stateless design allows multiple worker instances to be scaled up or down based on the load, ensuring efficient processing even as the number of tasks increases.


## How to Run the Project

### Prerequisites

Make sure you have the following tools installed:

- NodeJS v20.13.1
- Docker
- Docker Compose
- Redis (for development)

### 1. Cloning the Repository 

Clone the repository using the following command:

```bash
git clone git@github.com:shahbaz42/bip.git
```

### 2. Setting Up image-processing-api Server

Create a `.env` file for image-processing-api server with the following environment variables:
```
NODE_ENV=dev
PORT=8000
DB_URI=
REDIS_HOST=
REDIS_PORT=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_ACCESS_KEY_SECRET=
S3_BUCKET_NAME=
S3_BUCKET_URL=
```
> Make sure to put REDIS_HOST=redis when deploying with docker-compose

### 3. Setting Up image-processing-worker server

1. Create a `.env` file for image-processing-worker server with the following environment variables:

```
NODE_ENV=dev
PORT=8001
REDIS_HOST=
REDIS_PORT=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_ACCESS_KEY_SECRET=
S3_BUCKET_NAME=
S3_BUCKET_URL=
```
> If you set NODE_ENV=dev the api will send the API will send a detailed traceback of errors, providing more information for debugging purposes.. 

### 4. Running the Servers

1. Set number of workers to deploy from [here](https://github.com/shahbaz42/bip/blob/031cb758969b7154bde32103baa93c8e9045a9a9/docker-compose.yml#L35) (docker-compose.yml)

2. Run the following command to start the servers:

```bash
docker-compose up
```

3. The servers will be running on the following ports:

- **image-processing-api Server**: `http://localhost:5858`


## Codebase Cleanliness & Organization

The codebase is designed with cleanliness and organization in mind:

- Loosely coupled modular codebase with components that can be easily swapped. 
- Usage of interfaces for connecting components and index.ts for exporting objects. 
- Short and readable code in controllers, with services and utility functions for code optimization.
- Organized database-related code with models and repositories for easy database swapping. 
- Docstring comments and TypeScript interfaces for clarity.
- Minimal usage of `any` type and adherence to strict types.
- Consistent response and error format for a better understanding of API responses.

## Edge cases and features:
- If an image link is broken or can't be downloaded for some reason, it will be kept in its exact position.
- The ordering of image links in the input and output remains the same.
- Proper validation of the CSV file with helpful validation messages, mentioning the row, column, and issue.
- Configurable CSV validation that can be easily adjusted as needed.
