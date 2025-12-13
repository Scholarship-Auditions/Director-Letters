import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // 1. Dropdown: Writers
  LetterWriter: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]), // ✅ Public Read
      allow.authenticated(), // ✅ Admin Write
    ]),

  // 2. Dropdown: Recipients
  LetterRecipient: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]), // ✅ Public Read
      allow.authenticated(), // ✅ Admin Write
    ]),

  // 3. Dropdown: Categories
  LetterCategory: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]), // ✅ Public Read
      allow.authenticated(), // ✅ Admin Write
    ]),

  // 4. Main Letter Model
  Letter: a
    .model({
      title: a.string().required(),
      content: a.string(),

      // Storing IDs and Names for easier display
      writerId: a.string().required(),
      writerName: a.string().required(),

      recipientId: a.string().required(),
      recipientName: a.string().required(),

      categoryId: a.string().required(),
      categoryName: a.string().required(),

      s3Key: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]), // ✅ Public needs to READ letters too!
      allow.authenticated(), // ✅ Admin has full access
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // ✅ This enables the API Key which stops the "Unauthorized" errors
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
      description: "Public Guest Access",
    },
  },
});
