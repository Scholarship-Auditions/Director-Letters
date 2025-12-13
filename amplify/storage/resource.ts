import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "letters",
  access: (allow) => ({
    "letters/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write"]),
    ],
  }),
});
