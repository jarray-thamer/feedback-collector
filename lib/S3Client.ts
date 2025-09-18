import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
export const S3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
});
