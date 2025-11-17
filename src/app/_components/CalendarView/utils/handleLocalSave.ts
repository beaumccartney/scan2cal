"use server";

import { error } from "console";
import React from "react";
import { db } from "~/server/db";
import { uploads } from "~/server/db/schema";

async function handleLocalSave(cal_ref) {
  const localev = cal_ref.current?.getApi();

  //   try {
  //
  //   } catch {
  //
  //   }

  if (!localev) {
    throw new error("Events not defined");
  }
  await db
    .insert(uploads)
    .values({ events_json: localev.getEvents().toString() });
}

export default handleLocalSave;
