=== Steps
== To Upload: 
Images uploaded to MediaIngress bucket via web ui, desktop ui or others.
When the MediaIngress bucket detects a new image, it triggers the ProcessImage Lambda function.
The ProcessImage Lambda function processes the image and uploads the processed images to the ProcessedMedia bucket.
The ProcessImage Lambda function also creates an entry in the ProcessedImageMetadata table for the processed image.

== When a user visits a gallery:
The gallery web page makes a request to the GetImagesForParticipant Lambda function.
The GetImagesForParticipant Lambda function retrieves the images for the given participant code from the ProcessedImageMetadata table.
The GetImagesForParticipant Lambda function returns the images to the gallery web page.
The gallery web page displays the images to the user via their Thumbnail and Fullsize URLs.

=== Notes for next phase
Lambdas and endpoints need creating for the following:
- Updating detected codes manually
- Clearing the MediaIngress bucket & ProcessedMedia bucket to restart uploading images.
- Reprocessing the entire MediaIngress bucket
- Deleting data for a single image:
- - Deletes the image from the MediaIngress bucket
- - Deletes the processed images from the ProcessedMedia bucket
- - Deletes the entry from the ProcessedImageMetadata table



=== Projects

== StackInstanceDeploy - AWS CDK project for deploying an instance of the stack for a given race
- Creates the following resources:
    Gallery - Container for running the Sveltekit Gallery application.
    - This will potentially be hot-swappable with other gallery implementations for themeing.
    ECR - Elastic Container Registry for storing the Gallery container image.
    MediaIngress - S3 Bucket for original photographs
    ProcessedMedia - S3 Bucket for processed photographs
    ProcessedImageMetadata - DynamoDB table for storing metadata about processed images.
    LProcessImage - Lambda function that processes images uploaded to MediaIngress bucket, outputting to ProcessedMedia bucket.
    - Scans the images for participant codes.
    - Applies any overlays to the image
    - Creates a max 2000x2000 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates a max 500x500 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates an entry in the ProcessedImageMetadata table for each image containing:
    - - Detected participant codes
    - - Thumbnail URL
    - - Fullsize URL
    LGetImagesForParticipant - Lambda function that retrieves images for a given participant code from the ProcessedImageMetadata table.
    - LoadBalancer - Load balancer for routing traffic to the Gallery container.
    - Listener - Listener for the LoadBalancer that routes traffic to the Gallery container.
    - TargetGroup - Target group for the LoadBalancer that routes traffic to the Gallery container.
    - ListenerRule - Listener rule for the LoadBalancer that routes traffic to the Gallery container.
    - APCluster - ECS Cluster for running the Gallery container.
    - APService - ECS Service for running the Gallery container.
    - APTaskDefinition - ECS Task Definition for running the Gallery container.
    - - Contains the container definition for the Gallery container.
    

