import "./App.css";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { getUrl } from "aws-amplify/storage";
import { useState } from "react";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { fetchAuthSession } from "aws-amplify/auth";

const client = generateClient<Schema>();

type PollyReturnType = Schema["convertTextToSpeech"]["returnType"];

function App() {
  const [src, setSrc] = useState("");
  const [file, setFile] = useState<PollyReturnType>("");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playPollyStream = async () => {
    try {
      // Get credentials from Amplify
      const { credentials } = await fetchAuthSession();

      const pollyClient = new PollyClient({
        region: "eu-central-1", // make sure this matches your Amplify region
        credentials: credentials,
      });

      const command = new SynthesizeSpeechCommand({
        OutputFormat: "mp3",
        Text: "Hello World!",
        VoiceId: "Joanna",
        Engine: "neural",
      });

      const response = await pollyClient.send(command);

      if (response.AudioStream) {
        const audioBlob = new Blob(
          [await response.AudioStream.transformToByteArray()],
          {
            type: "audio/mpeg",
          }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        // Clean up previous audio element if it exists
        if (audio) {
          audio.pause();
          URL.revokeObjectURL(audio.src);
        }

        const newAudio = new Audio(audioUrl);
        setAudio(newAudio);

        newAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };

        await newAudio.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Rest of your component remains the same
  return (
    <div className="flex flex-col">
      <button
        onClick={async () => {
          const { data, errors } = await client.mutations.convertTextToSpeech({
            text: "Hello World!",
          });

          if (!errors && data) {
            setFile(data);
          } else {
            console.log(errors);
          }
        }}
      >
        Synth
      </button>
      <button
        onClick={async () => {
          const res = await getUrl({
            path: "public/" + file,
          });
          setSrc(res.url.toString());
        }}
      >
        Fetch audio
      </button>
      <button
        onClick={playPollyStream}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Play Stream
      </button>
      <a href={src}>Get audio file</a>
    </div>
  );
}

export default App;
