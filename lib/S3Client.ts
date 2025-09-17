import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
export const S3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: false,
});
