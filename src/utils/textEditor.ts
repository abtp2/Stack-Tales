export const insertHtmlList = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  listType: "ul" | "ol"
): void => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);

  const listContent = selectedText || "List item";
  const htmlList = `<${listType}>\n  <li>${listContent}</li>\n</${listType}>`;
  const newText = beforeText + htmlList + afterText;
  textarea.value = newText;
  
  const newCursorPos = start + `<${listType}>\n  <li>`.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos + listContent.length);
  textarea.focus();
  
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

export const insertText = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  before: string,
  after: string
): void => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);
  const newText = beforeText + before + selectedText + after + afterText;
  textarea.value = newText;
  
  const newCursorPos = selectedText 
    ? start + before.length + selectedText.length + after.length
    : start + before.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
  
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};
