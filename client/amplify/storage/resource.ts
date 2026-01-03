import { defineStorage } from "@aws-amplify/backend";
export const storage = defineStorage({
  name: "directorLetters",
  access: (allow) => ({
    "letters/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});
