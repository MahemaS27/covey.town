import { Button, Textarea } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
import Player from '../../classes/Player';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';
import './ChatInput.css';

interface ChatInputProps {
  messageType: MessageType;
  directMessageId: string | null;
}

// an input for sending messages from frontend to the socket
export default function ChatInput({ messageType, directMessageId }: ChatInputProps): JSX.Element {
  const [messageContent, setMessageContent] = useState<string>('');
  const { myPlayerID, emitMessage, players } = useCoveyAppState();
  const myPlayer: Player | undefined = players.find(
    (playerToCheck: Player) => playerToCheck.id === myPlayerID,
  );
  const video = useMaybeVideo();

  const canSendMessage = messageContent && messageContent.length;

  // sends the message to the socket
  const handleSendMessage = useCallback((): void => {
    // typescript yells at us if we don't ensure that properties on myPlayer exist
    if (canSendMessage && myPlayer && myPlayer.location) {
      const messageToSend: Message = {
        userId: myPlayerID,
        userName: myPlayer.userName,
        timestamp: Date.now(),
        location: myPlayer.location,
        messageContent,
        type: messageType,
        directMessageId,
      };
      emitMessage(messageToSend);
      setMessageContent('');
    }
  }, [
    canSendMessage,
    myPlayer,
    myPlayerID,
    directMessageId,
    messageType,
    emitMessage,
    messageContent,
    setMessageContent,
  ]);

  // updates content to what exists within the textarea
  const handleContentUpdate = useCallback(
    e => {
      const inputValue = e.target.value;
      setMessageContent(inputValue);
    },
    [setMessageContent],
  );

  // prevents keyboard events in game when textarea is in focus
  const handleOnFocus = useCallback(() => {
    video?.pauseGame();
  }, [video]);

  // restores keyboard events in game when textarea loses focus
  const handleOnBlur = useCallback(() => {
    video?.unPauseGame();
  }, [video]);

  // allows sending of events on enter press so long as shift
  // isn't also pressed
  const handlePressEnter = useCallback(
    e => {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  return (
    <form onSubmit={handleSendMessage} data-testid='chat-form'>
      <div className='chat-input-wrapper'>
        <div className='text-area'>
          <Textarea
            onKeyDown={handlePressEnter}
            onChange={handleContentUpdate}
            value={messageContent}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            height='100px'
            resize='none'
            data-testid='textarea-component'
            id='message-to-send'
            aria-label='Send a message...'
            placeholder='Send a message...'
            borderRadius='0'
            className='text-area'
          />
        </div>
        <div className='button'>
          <Button
            bg='lightblue'
            borderRadius='0'
            height='100px'
            disabled={!canSendMessage}
            type='submit'>
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
