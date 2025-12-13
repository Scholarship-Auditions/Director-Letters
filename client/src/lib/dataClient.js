import { generateClient } from "aws-amplify/data";
import { getUrl, uploadData } from "aws-amplify/storage";

// Use the identity pool auth mode by default so unauthenticated visitors can
// read public models (e.g., dropdown options) without hitting "Not Authorized"
// errors. Authenticated users continue to work for protected mutations.
export const dataClient = generateClient({ authMode: "identityPool" });

export const fetchOptionLists = async () => {
  const [writers, recipients, categories] = await Promise.all([
    dataClient.models.LetterWriter.list(),
    dataClient.models.LetterRecipient.list(),
    dataClient.models.LetterCategory.list(),
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
