import { generateClient } from "aws-amplify/data";
import { getUrl, uploadData } from "aws-amplify/storage";

// Default to API key auth for public reads. We explicitly opt into the Cognito
// user pool auth mode for any mutations so admins can manage data without
// hitting AppSync 401 errors when signed in.
export const dataClient = generateClient({ authMode: "apiKey" });

export const authModes = {
  read: { authMode: "apiKey" },
  write: { authMode: "userPool" },
};

export const fetchOptionLists = async () => {
  const [writers, recipients, categories] = await Promise.all([
    dataClient.models.LetterWriter.list(authModes.read),
    dataClient.models.LetterRecipient.list(authModes.read),
    dataClient.models.LetterCategory.list(authModes.read),
  ]);

  return {
    letterwriters: writers?.data ?? [],
    letterrecipients: recipients?.data ?? [],
    lettercategories: categories?.data ?? [],
  };
};

export const uploadLetterFile = async (file) => {
  if (!file) return null;

  const key = `letters/${Date.now()}-${file.name}`;
  const { result } = await uploadData({ key, data: file });
  return result?.key ?? key;
};

export const buildSignedLetterUrl = async (s3Key) => {
  if (!s3Key) return null;
  const { url } = await getUrl({ key: s3Key });
  return url?.toString() ?? null;
};
