import React, { useEffect } from 'react';
import { MessageType } from '../../classes/MessageChain';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import './ChatContainer.css';
import ChatInput from './ChatInput';
import SingleMessage from './SingleMessage';

interface ChatContainerProps {
  directMessageID: string | null;
  chainType: MessageType;
}

export default function ChatContainer({
  directMessageID,
  chainType,
}: ChatContainerProps): JSX.Element {
  const {
    resetUnviewedMessages,
    directMessageChains,
    townMessageChain,
    proximityMessageChain,
    myPlayerID,
  } = useCoveyAppState();

  const getMessageChain = () => {
    switch (chainType) {
      case MessageType.DirectMessage:
        if (directMessageID) {
          return directMessageChains[directMessageID];
        }
        return undefined;
      case MessageType.TownMessage:
        return townMessageChain;
      case MessageType.ProximityMessage:
        return proximityMessageChain;
      default:
        return undefined;
    }
  };

  const messageChain = getMessageChain();
  const messageChainNumberUnviewed = messageChain ? messageChain.numberUnviewed : 0;

  useEffect(() => {
    if (messageChainNumberUnviewed) {
      resetUnviewedMessages(chainType, directMessageID);
    }
  }, [messageChainNumberUnviewed, chainType, directMessageID, resetUnviewedMessages]);

  setTimeout(() => {
    const scrollableMessages = document.getElementById('scrollable-messages');
    if (scrollableMessages) scrollableMessages.scrollTop = scrollableMessages.scrollHeight;
  }, 50);

  if (!messageChain) {
    return (
      <div className='chat-container'>
        <div id='scrollable-messages' className='scrollable-messages' />
        <div className='chat-input'>
          <ChatInput
            messageType={chainType}
            directMessageId={directMessageID}
          />
        </div>
      </div>
    );
  }

  const chatInput = <div className='chat-input'>
    <ChatInput
      messageType={chainType}
      directMessageId={directMessageID}
    />
  </div>

  const disabledMessage = 'You can no longer message with this player, as they have disconnected.';


  return (
    <div className='chat-container'>
      <div id='scrollable-messages' className='scrollable-messages'>
        {messageChain.messages.map(message => (
          <SingleMessage key={message.timestamp} message={message} myPlayerID={myPlayerID} />
        ))}
      </div>
      <div className={`${messageChain.isActive ? 'active' : 'inactive'}`}>
        {messageChain.isActive ? chatInput : disabledMessage}
      </div>
    </div>
  );
}
