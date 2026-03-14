# S3 Avatar Upload Configuration

To support the avatar upload functionality via AWS S3 Presigned URLs, ensure the following environment variables are set in your `.env.local`:

```env
AWS_REGION=your_aws_region            # e.g., us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

## Bucket Policy
Ensure your S3 bucket allows public read access for the uploaded objects, or use CloudFront.
Ensure CORS is properly configured on the bucket to allow uploads from your frontend domain.

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": []
    }
]
```
