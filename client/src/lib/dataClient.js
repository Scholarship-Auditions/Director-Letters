import { generateClient } from "aws-amplify/data";
import { getUrl, uploadData } from "aws-amplify/storage";

export const dataClient = generateClient();

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
