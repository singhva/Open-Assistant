import {
  Box,
  Kbd,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { MessageConversation } from "src/components/Messages/MessageConversation";
import { TrackedTextarea } from "src/components/Survey/TrackedTextarea";
import { TwoColumnsWithCards } from "src/components/Survey/TwoColumnsWithCards";
import { TaskSurveyProps } from "src/components/Tasks/Task";
import { TaskHeader } from "src/components/Tasks/TaskHeader";
import { getTypeSafei18nKey } from "src/lib/i18n";
import { TaskType } from "src/types/Task";
import { CreateTaskReply } from "src/types/TaskResponses";
import { CreateTaskType } from "src/types/Tasks";
import { Select } from "@chakra-ui/react";

const RenderedMarkdown = lazy(() => import("../Messages/RenderedMarkdown"));

export const CreateTask = ({
  task,
  taskType,
  isEditable,
  isDisabled,
  onReplyChanged,
  onValidityChanged,
  onSubmit,
}: TaskSurveyProps<CreateTaskType, CreateTaskReply>) => {
  const { t, i18n } = useTranslation(["tasks", "common"]);
  const cardColor = useColorModeValue("gray.50", "gray.800");
  const titleColor = useColorModeValue("gray.800", "gray.300");
  const tipColor = useColorModeValue("gray.600", "gray.400");
  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [category, setCategory] = useState("");
  const [isDesktop] = useMediaQuery("(min-width: 800px)");

  const textChangeHandler = (text: string) => {
    onReplyChanged({ text });
    const isTextBlank = !text || /^\s*$/.test(text);
    if (!isTextBlank) {
      onValidityChanged("VALID");
      setInputText(text);
    } else {
      onValidityChanged("INVALID");
      setInputText("");
    }
  };

  const responseTextHandler = (assistant_response: string) => {
    onReplyChanged({ assistant_response });
    const isTextBlank = !assistant_response || /^\s*$/.test(assistant_response);
    if (!isTextBlank) {
      onValidityChanged("VALID");
      setResponseText(assistant_response);
    } else {
      onValidityChanged("INVALID");
      setResponseText("");
    }
  };

  const categoryChanged = (event: Event) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const category = target.value
    onValidityChanged(!!category ? "VALID" : "INVALID")
    onReplyChanged({ category })
    setCategory(category);
  }

  const previewContent = useMemo(
    () => {

      const text = "**Prompt**: " + inputText + "\n\n**Response**: " + responseText + "\n\n**Category**: " + category

      return (
        <Suspense fallback={text}>
          <RenderedMarkdown markdown={text}></RenderedMarkdown>
        </Suspense>
      )
    },
    [inputText, responseText, category]
  );

  useEffect(() => {
    if (typeof window === undefined) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        onSubmit?.();
      }
    };

    window.addEventListener("keydown", handler, false);

    return () => {
      window.removeEventListener("keydown", handler, false);
    };
  }, [onSubmit]);

  return (
    <div data-cy="task" data-task-type="create-task">
      <TwoColumnsWithCards>
        <>
          <TaskHeader taskType={taskType} />
          {task.type !== TaskType.initial_prompt && (
            <Box mt="4" borderRadius="lg" bg={cardColor} className="p-3 sm:p-6">
              <MessageConversation messages={task.conversation.messages} highlightLastMessage />
            </Box>
          )}
        </>
        <>
          <Stack spacing="4">
            {!!i18n.exists(`tasks:${taskType.id}.instruction`) && (
              <Text fontSize="xl" fontWeight="bold" color={titleColor}>
                {t(getTypeSafei18nKey(`tasks:${taskType.id}.instruction`))}
              </Text>
            )}
            {isDesktop && (
              <Text color={tipColor}>
                {t(getTypeSafei18nKey(`tasks:${taskType.id}.shotcut_tip`)) + " "}
                {window.navigator.userAgent.indexOf("Mac") !== -1 ? (
                  <>
                    <Kbd>cmd</Kbd>+<Kbd>Enter</Kbd>
                  </>
                ) : (
                  <>
                    <Kbd>ctrl</Kbd> + <Kbd>Enter</Kbd>
                  </>
                )}
              </Text>
            )}
            {!isEditable ? (
              previewContent
            ) : (
              <Tabs isLazy>
                <TabList>
                  <Tab>{t("tab_write")}</Tab>
                  <Tab>{t("tab_preview")}</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p="0" pt="4">
                    <TrackedTextarea
                      text={inputText}
                      onTextChange={textChangeHandler}
                      thresholds={{ low: 20, medium: 40, goal: 50 }}
                      textareaProps={{
                        placeholder: t(getTypeSafei18nKey(`tasks:${taskType.id}.response_placeholder`)),
                        isDisabled,
                        minRows: 5,
                      }}
                    />


                    <TrackedTextarea
                      text={responseText}
                      onTextChange={responseTextHandler}
                      thresholds={{ low: 20, medium: 40, goal: 50 }}
                      textareaProps={{
                        placeholder: t(getTypeSafei18nKey(`tasks:${taskType.id}.supplied_response_placeholder`)),
                        isDisabled,
                        minRows: 5,
                      }}
                    />

                    <Select onChange={categoryChanged} maxW="fit-content" pt="4">
                      <option>Select a category</option>
                      <option>Hardcoded Option A</option>
                      <option>Hardcoded Option B</option>
                      <option>Hardcoded Option C</option>
                      <option>Hardcoded Option D</option>
                    </Select>


                  </TabPanel>
                  <TabPanel p="0" pt="4">
                    {previewContent}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </Stack>
        </>
      </TwoColumnsWithCards>
    </div>
  );
};
