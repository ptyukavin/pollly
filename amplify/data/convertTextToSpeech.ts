import { Schema } from "./resource";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

import outputs from "../../amplify_outputs.json";

export const handler: Schema["convertTextToSpeech"]["functionHandler"] = async (
  event
) => {
  // Initialize the Polly client with default credentials
  const client = new PollyClient();
  console.log("event >>> ", event);

  const bucketName = outputs.storage.bucket_name;

  if (!bucketName) {
    throw new Error(
      "Storage bucket name is not configured in environment variables"
    );
  }

  console.log("bucketName >>> ", bucketName);

  const getFileName = (uri: string) => {
    return uri.substring(uri.lastIndexOf("/") + 1);
  };

  const task = new StartSpeechSynthesisTaskCommand({
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: event.arguments.text,
    TextType: "text",
    VoiceId: "Amy",
    OutputS3BucketName: bucketName,
    OutputS3KeyPrefix: "public/",
  });

  const result = await client.send(task);

  // Clean up the URI to return just the file key

  return getFileName(result.SynthesisTask?.OutputUri ?? "") ?? "";
};
