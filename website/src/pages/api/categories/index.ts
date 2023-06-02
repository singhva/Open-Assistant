import { withoutRole } from "src/lib/auth";
import { getLanguageFromRequest } from "src/lib/languages";
import { createApiClient } from "src/lib/oasst_client_factory";

const handler = withoutRole("banned", async (req, res, token) => {
  const client = await createApiClient(token);
  const userLanguage = getLanguageFromRequest(req);
  const categories = await client.fetch_categories(userLanguage);
  res.status(200).json(categories);
});

export default handler;
