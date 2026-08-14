import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { getDbInstance } from "./db.js";

const db = await getDbInstance();
const client = mongoose.connection.getClient();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "dummy_github_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy_github_secret",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_secret",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
