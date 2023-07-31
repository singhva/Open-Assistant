import { Stack, Text } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { MessageTableEntry } from "src/components/Messages/MessageTableEntry";
import { Message } from "src/types/Conversation";

export interface MessageConversationProps {
  messages: Message[];
  enableLink?: boolean;
  highlightLastMessage?: boolean;
  showCreatedDate?: boolean;
  showCheckboxes?: boolean;
  selectedMessageIds?: string[];
  updateSelectedMessages?: (selectedMessageIds: string[]) => void;
}

export function MessageConversation({
  messages,
  enableLink,
  highlightLastMessage,
  showCreatedDate,
  showCheckboxes,
  selectedMessageIds,
  updateSelectedMessages,
}: MessageConversationProps) {
  const { t } = useTranslation("message");

  selectedMessageIds = selectedMessageIds || [];

  return (
    <Stack spacing="4" position="relative">
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
            isChecked={selectedMessageIds.includes(message.id)}
            onCheck={(checked) => {
              if (checked) {
                updateSelectedMessages([...selectedMessageIds, message.id]);
              } else {
                updateSelectedMessages(selectedMessageIds.filter((id) => id !== message.id));
              }
            }}
          />
        ))
      )}
    </Stack>
  );
}
