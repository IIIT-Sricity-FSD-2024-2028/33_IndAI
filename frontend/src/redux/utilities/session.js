import { createAction } from "@reduxjs/toolkit";
export const sessionReset = createAction("session/reset");
export const sessionExpired = createAction("session/expired");
