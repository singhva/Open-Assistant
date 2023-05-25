import { Box, Button, Stack, Text, position } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { MessageTableEntry } from "src/components/Messages/MessageTableEntry";
import { Message } from "src/types/Conversation";

import { useState, useMemo } from "react";

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


export interface MessageConversationProps {
  messages: Message[];
  enableLink?: boolean;
  highlightLastMessage?: boolean;
  showCreatedDate?: boolean;
  showCheckboxes?: boolean;
}

export function MessageConversation({
  messages,
  enableLink,
  highlightLastMessage,
  showCreatedDate,
  showCheckboxes,
}: MessageConversationProps) {
  const { t } = useTranslation("message");

  const [selectedMessages, updateSelectedMessages] = useState<string[]>([]);

  const exportMessagesAsCSV = (messages: Message[], selectedMessages: string[]) => {
    const messagesToExport = messages.filter((message) => selectedMessages.includes(message.id));
    const messagesToExportAsCSV = arrayToCsv(messagesToExport);
    const fileToSave = new Blob([messagesToExportAsCSV], {
      type: 'text/csv'
    });

    // Save the file
    // Today's date and time
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    saveAs(fileToSave, `message-export-${date}.csv`);

  }

  const exportMessagesAsJSON = (messages: Message[], selectedMessages: string[]) => {
    const messagesToExport = messages.filter((message) => selectedMessages.includes(message.id));
    const fileToSave = new Blob([JSON.stringify(messagesToExport, null, 2)], {
      type: 'application/json'
    });

    // Save the file
    // Today's date and time
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    saveAs(fileToSave, `message-export-${date}.json`);

  }

  return (
    <Stack spacing="4" position="relative">
      {(showCheckboxes && selectedMessages.length > 0) && (
        <Box p={3} shadow='md' borderWidth='1px' borderRadius="md" display="flex" flexDirection="row" alignItems="center" gap="3">
          <Text fontSize="lg">Export {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''}  as</Text>
          <Button colorScheme="green" marginRight="2" onClick={() => { exportMessagesAsJSON(messages, selectedMessages) }}>JSON</Button>
          <Button colorScheme="green" onClick={() => { exportMessagesAsCSV(messages, selectedMessages) }}>CSV</Button>
        </Box>
      )}
      {messages.length === 0 ? (
        <Text>{t("no_messages")}</Text>
      ) : (
        messages.map((message, idx) => (
          <MessageTableEntry
            enabled={enableLink}
            message={message}
            key={message.id + message.frontend_message_id}
            highlight={highlightLastMessage && idx === messages.length - 1}
            showCreatedDate={showCreatedDate}
            showCheckbox={showCheckboxes}
            isChecked={selectedMessages.includes(message.id)}
            onCheck={(checked) => {
              if (checked) {
                updateSelectedMessages([...selectedMessages, message.id]);
              } else {
                updateSelectedMessages(selectedMessages.filter((id) => id !== message.id));
              }
            }}
          />
        ))
      )}
    </Stack>
  );
}
