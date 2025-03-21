import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data, convertTextToSpeech } from "./data/resource";
import { Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  convertTextToSpeech,
});

backend.convertTextToSpeech.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["polly:StartSpeechSynthesisTask"],
    resources: ["*"],
  })
);

new PolicyStatement({
  actions: ["polly:SynthesizeSpeech"],
  resources: ["*"],
  conditions: {
    // Optional: Restrict to specific voices
    StringEquals: {
      "polly:VoiceId": ["Joanna", "Matthew"],
    },
    // Optional: Add rate limiting
    NumericLessThanEquals: {
      "polly:RequestCharacters": 3000,
    },
  },
});
