"use client";
import { FC, ChangeEvent, KeyboardEvent, CSSProperties, useMemo, memo } from "react";
import { LuArrowUp } from "react-icons/lu";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";

interface AIBoxProps {
  readonly style?: CSSProperties;
  readonly components: readonly ChatMessageType[];
  readonly aiLoading: boolean;
  readonly inputText: string;
  readonly handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  readonly handleSendMessage: () => void;
}

const AIBox: FC<AIBoxProps> = memo(({ 
  style, 
  components, 
  aiLoading, 
  inputText, 
  handleInputChange, 
  handleKeyPress, 
  handleSendMessage 
}) => {
  const chatMessages = useMemo(() => 
    components.map((comp) => (
      <ChatMessage 
        key={comp.id}
        id={comp.id}
        text={comp.text} 
        type={comp.type}
      />
    )), [components]);

  return (
    <div className={Styles.AIBox} style={style}>
      <div className={`${Styles.AIBoxMessageBox} overflow-none`} role="log" aria-live="polite">
        {components.length === 0 ? (
          <span className={Styles.AIBoxAIMessage}>
            <p>Hello, How can I assist you today?</p>
          </span>
        ) : (
          chatMessages
        )}
      </div>
      <div className={Styles.AIBoxInputBox}>
        <span
          style={{ display: aiLoading ? 'flex' : 'none' }}
          aria-hidden={!aiLoading}
          role="status"
          aria-label="AI is thinking">
          <p></p><p></p><p></p>
        </span>
        <input 
          type="text"
          placeholder="Type your message..." 
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={aiLoading}
          aria-label="Chat input"/>
        <button 
          onClick={handleSendMessage} 
          disabled={aiLoading || !inputText.trim()}
          aria-label="Send message"
          type="button">
          <LuArrowUp />
        </button>
      </div>
    </div>
  );
});

export default AIBox;