import { Box, Button, CircularProgress, Container, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
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
import { useState, useCallback } from "react";
import { Message } from "src/types/Conversation";
import { saveAs } from 'file-saver'

const arrayToCsv = (arr: Array<object>): string => {
  // Get the keys of the first object to use as column headers
  const columnHeaders = Object.keys(arr[0]);

  // Map each object in the array into a CSV row
  const rows = arr.map(obj =>
    // Map each key in the object to its value, then join them with commas
    columnHeaders.map(header =>
      // If the value contains a comma, quote it
      ("" + obj[header]).includes(",") ? `"${obj[header]}"` : obj[header]
    ).join(",")
  );

  // Join the column headers and the rows with newline characters to form the CSV
  return `${columnHeaders.join(",")}\n${rows.join("\n")}`;
}

const getMessages = async (messageIds: string[]) => {
  try {
    const response = await fetch(API_ROUTES.EXPORT_MESSAGES, {
      method: "POST",
      body: JSON.stringify({ messageIds }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const json = await response.json()

    // Every row of the JSON is a JSON string.  Convert to JSON object.
    const messages = json.map((message: string) => JSON.parse(message))
    return messages

  } catch (e) {
    console.error("Error while fetching messages", e)
  }
}

const MessagesDashboard = () => {
  const { t } = useTranslation(["message"]);
  const boxBgColor = useColorModeValue("white", "gray.800");
  const boxAccentColor = useColorModeValue("gray.200", "gray.900");

  const lang = useCurrentLocale();
  const [page, setPage] = useState<number>(1)
  const { data } = useSWRImmutable(API_ROUTES.RECENT_MESSAGES({ lang, page }), get, { revalidateOnMount: true });

  let messages: Message[] | undefined = data?.messages
  let totalMessages: number | undefined = data?.totalMessages

  const messagesPerPage: number = 10
  const totalPages: number = Math.ceil(totalMessages / messagesPerPage)

  const currentLanguage = useCurrentLocale();

  const [selectedMessageIds, updateSelectedMessages] = useState<string[]>([]);

  const exportSelectedMessagesAsJSON = useCallback(async () => {
    const messages = await getMessages(selectedMessageIds)

    const fileToSave = new Blob([JSON.stringify(messages, null, 2)], {
      type: 'application/json'
    });

    // Save the file
    // Today's date and time
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    saveAs(fileToSave, `message-export-${date}.json`);

  }, [selectedMessageIds])

  const exportSelectedMessagesAsCSV = useCallback(async () => {
    const messages = await getMessages(selectedMessageIds)

    const messagesToExportAsCSV = arrayToCsv(messages);
    const fileToSave = new Blob([messagesToExportAsCSV], {
      type: 'text/csv'
    });

    // Save the file
    // Today's date and time
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    saveAs(fileToSave, `message-export-${date}.csv`);


  }, [selectedMessageIds])

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
              <Container position="relative">
                {(selectedMessageIds.length > 0) && (
                  <Box pl={4} pt={2} pb={2} shadow='md' borderWidth='1px' borderRadius="md" display="flex" flexDirection="row" alignItems="center" backgroundColor={"white"} gap="3" position="absolute" zIndex="3" right="0" left="0">
                    <Text fontSize="lg">Export {selectedMessageIds.length} message{selectedMessageIds.length > 1 ? 's' : ''}  as</Text>
                    <Button colorScheme="green" marginRight="2" onClick={() => exportSelectedMessagesAsJSON()}>JSON</Button>
                    <Button colorScheme="green" onClick={() => exportSelectedMessagesAsCSV()}>CSV</Button>
                  </Box>
                )}
                <MessageConversation enableLink messages={messages} showCreatedDate showCheckboxes selectedMessageIds={selectedMessageIds} updateSelectedMessages={updateSelectedMessages} />
              </Container>
            ) : (
              <CircularProgress isIndeterminate />
            )}
            <Box pt="6" display="flex" alignItems="center" justifyContent={"space-between"}>
              <Button colorScheme="blue" isDisabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Text>Page {page} of {totalPages}</Text>
              <Button colorScheme="blue" isDisabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
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
