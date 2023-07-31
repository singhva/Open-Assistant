import { withoutRole } from "src/lib/auth";
import { createApiClient } from "src/lib/oasst_client_factory";
import { getBackendUserCore } from "src/lib/users";

/**
 * Returns the set of valid labels that can be applied to messages.
 */
const handler = withoutRole("banned", async (req, res, token) => {

    const { messageIds: message_ids } = req.body;

    const client = await createApiClient(token);
    const user = await getBackendUserCore(token.sub);
    const messages = await client.fetch_messages(message_ids as string[], user);
    res.status(200).json(messages);
});

export default handler;
