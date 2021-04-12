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
function ChatInput({ messageType, directMessageId }: ChatInputProps): JSX.Element {
  const [messageContent, setMessageContent] = useState<string>('');
  const {
    myPlayerID,
    emitMessage,
    currentLocation,
    userName,
    players,
    directMessageChains,
  } = useCoveyAppState();
  const video = useMaybeVideo();
  const canSendMessage = messageContent && messageContent.length;

  let toUserName: string | null = null;
  if (directMessageId) {
    const directMessageChain = directMessageChains[directMessageId];
    if (directMessageChain && directMessageChain.participants) {
      const toParticipant = directMessageChain.participants.filter(
        participant => participant.userId !== myPlayerID,
      )[0];
      toUserName = toParticipant.userName;
    } else {
      const participantIds = directMessageId.split(':');
      const toId = participantIds.filter(id => id !== myPlayerID)[0];
      const toPlayer: Player | undefined = players.find(
        (playerToCheck: Player) => playerToCheck.id === toId,
      );
      if (toPlayer) {
        toUserName = toPlayer.userName;
      }
    }
  }

  // sends the message to the socket
  const handleSendMessage = useCallback(
    (e): void => {
      // typescript yells at us if we don't ensure that properties on myPlayer exist
      e.preventDefault();
      if (canSendMessage) {
        const messageToSend: Message = {
          userId: myPlayerID,
          fromUserName: userName,
          toUserName,
          timestamp: Date.now(),
          location: currentLocation,
          messageContent,
          type: messageType,
          directMessageId,
        };
        emitMessage(messageToSend);
        setMessageContent('');
      }
    },
    [
      canSendMessage,
      myPlayerID,
      toUserName,
      directMessageId,
      messageType,
      emitMessage,
      messageContent,
      setMessageContent,
      currentLocation,
      userName,
    ],
  );

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
        handleSendMessage(e);
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

export default ChatInput;
