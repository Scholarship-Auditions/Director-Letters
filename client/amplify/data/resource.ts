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

  // 4. Poem Model (separate pool)
  Poem: a
    .model({
      title: a.string().required(),       // e.g. "One Believing Adult"
      content: a.string().required(),     // Rich HTML from Quill
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.authenticated(),
    ]),

  // 5. Advertisement Model (separate pool)
  Advertisement: a
    .model({
      image: a.string().required(),       // S3 key for uploaded image
      linkText: a.string().required(),    // Display text for the link
      linkUrl: a.string().required(),     // URL the link points to
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.authenticated(),
    ]),

  // 6. Main Letter Model
  Letter: a
    .model({
      title: a.string().required(),       // Rich HTML from Quill

      // Email Section
      emailContent: a.string(),           // Rich HTML from Quill

      // References to separate pools
      poemId: a.string(),                 // Reference to Poem model
      advertisementId: a.string(),        // Reference to Advertisement model

      // Filtering fields
      writerId: a.string().required(),
      writerName: a.string().required(),
      recipientId: a.string().required(),
      recipientName: a.string().required(),
      categoryId: a.string().required(),
      categoryName: a.string().required(),
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
