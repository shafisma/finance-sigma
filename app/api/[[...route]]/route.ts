import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import accounts from "./accounts";
import categories from "./categories";
import transactions from "./transactions";
import summary from "./summary";
import plaid from "./plaid";
import exportRoute from "./export"; // Import the new export route

const app = new Hono().basePath('/api');

const routes = app
    .route("/plaid", plaid)
    .route("/summary", summary)
    .route("/accounts", accounts)
    .route("/categories", categories)
    .route("/transactions", transactions)
    .route("/export", exportRoute) // Add the new export route

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
