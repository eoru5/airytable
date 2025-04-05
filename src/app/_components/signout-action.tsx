"use server";

import { signOut } from "~/server/auth";

export default async function signOutAction() {
  await signOut();
}