import { withoutRole } from "src/lib/auth";
import { getLanguageFromRequest } from "src/lib/languages";
import { createApiClient } from "src/lib/oasst_client_factory";

const handler = withoutRole("banned", async (req, res, token) => {
  const client = await createApiClient(token);
  const userLanguage = getLanguageFromRequest(req);
  const page = parseInt(req.query.page as string, 10) || 1;
  const messages = await client.fetch_recent_messages(userLanguage, page);
  res.status(200).json(messages);
});

export default handler;
