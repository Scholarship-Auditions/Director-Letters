import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  LetterWriter: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated(),
    ]),
  LetterRecipient: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated(),
    ]),
  LetterCategory: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated(),
    ]),
  Letter: a
    .model({
      title: a.string().required(),
      content: a.string(),
      writerId: a.string().required(),
      writerName: a.string().required(),
      recipientId: a.string().required(),
      recipientName: a.string().required(),
      categoryId: a.string().required(),
      categoryName: a.string().required(),
      s3Key: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
