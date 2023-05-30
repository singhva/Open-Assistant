import { Box, Button, CircularProgress, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { DashboardLayout } from "src/components/Layout";
import { MessageConversation } from "src/components/Messages/MessageConversation";
import { get } from "src/lib/api";
import useSWRImmutable from "swr/immutable";
export { getStaticProps } from "src/lib/defaultServerSideProps";
import UserMessageConversation from "src/components/UserMessageConversation";
import { useCurrentLocale } from "src/hooks/locale/useCurrentLocale";
import { getLocaleDisplayName } from "src/lib/languages";
import { API_ROUTES } from "src/lib/routes";
import { useState } from "react";

const MessagesDashboard = () => {
  const { t } = useTranslation(["message"]);
  const boxBgColor = useColorModeValue("white", "gray.800");
  const boxAccentColor = useColorModeValue("gray.200", "gray.900");

  const lang = useCurrentLocale();
  const [page, setPage] = useState<number>(0)
  const { data: messages } = useSWRImmutable(API_ROUTES.RECENT_MESSAGES({ lang, page }), get, { revalidateOnMount: true });

  const currentLanguage = useCurrentLocale();

  return (
    <>
      <Head>
        <title>Messages - Open Assistant</title>
        <meta name="description" content="Chat with Open Assistant and provide feedback." />
      </Head>
      <SimpleGrid columns={[1, 1, 1, 1, 1, 2]} gap={4}>
        <Box>
          <Text className="text-2xl font-bold" pb="4">
            {t("recent_messages", {
              language: getLocaleDisplayName(currentLanguage),
            })}
          </Text>
          <Box
            backgroundColor={boxBgColor}
            boxShadow="base"
            dropShadow={boxAccentColor}
            borderRadius="xl"
            className="p-6 shadow-sm"
          >
            {messages ? (
              <MessageConversation enableLink messages={messages} showCreatedDate showCheckboxes />
            ) : (
              <CircularProgress isIndeterminate />
            )}
            <Box pt="6" display="flex" alignItems="center" justifyContent={"space-between"}>
              <Button colorScheme="blue" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button colorScheme="blue" onClick={() => setPage(page + 1)}>Next</Button>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text className="text-2xl font-bold" pb="4">
            {t("your_recent_messages")}
          </Text>
          <Box
            backgroundColor={boxBgColor}
            boxShadow="base"
            dropShadow={boxAccentColor}
            borderRadius="xl"
            className="p-6 shadow-sm"
          >
            <UserMessageConversation />
          </Box>
        </Box>
      </SimpleGrid>
    </>
  );
};

MessagesDashboard.getLayout = DashboardLayout;

export default MessagesDashboard;
