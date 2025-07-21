type TEnv = {
    aiBackendUrl: string;
    googleClientId: string;
    googleClientSecret: string;
    nextAuthSecret: string;
    mongodbName: string;
    mongodbUri: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsRegion: string;
    awsBucketName: string;
    convertApiToken: string;
}

export const env: TEnv = {
  aiBackendUrl: process.env.NEXT_PUBLIC_AI_BACKEND_URL || "NA",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "NA",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "NA",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "NA",
  mongodbName: process.env.MONGODB_NAME || "NA",
  mongodbUri: process.env.MONGODB_URI || "NA",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "NA",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "NA",
  awsRegion: process.env.AWS_REGION || "NA",
  awsBucketName: process.env.AWS_BUCKET_NAME || "NA",
  convertApiToken: process.env.CONVERT_API_TOKEN || "NA",
};
