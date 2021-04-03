import React, { useEffect } from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
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
    const scrollableMessages = document.getElementById('scrollable-messages');
    if (scrollableMessages) scrollableMessages.scrollTop = scrollableMessages.scrollHeight;
    return undefined;
  }, [messageChainNumberUnviewed, chainType, directMessageID, resetUnviewedMessages]);

  // optional passing of an direct message chain ID, depends on chain type
  // if new DM - wait until first input to create the new DM chain -- using the id that was given as a prop
  const { myPlayerID, directMessageChains, townMessageChain, proximityMessageChain, } = useCoveyAppState();
  let displayedChain: MessageChain | undefined;
  switch (chainType) {
    case 'DirectMessage': {
      if (directMessageID) {
        displayedChain = directMessageChains[directMessageID];
      }
      break;
    }
    case 'TownMessage': {
      displayedChain = townMessageChain;
      break;
    }
    default: {
      displayedChain = proximityMessageChain;
    }
  }

  if (!displayedChain) {
    return <div className='chat-container'>
        <div className='scrollable-messages'/>
      <div className='chat-input'>
        <ChatInput
          messageType={chainType}
          directMessageId={directMessageID}
          isDisabled={undefined}
        />
      </div>
    </div>;
  }
  return (
    <div className='chat-container'>
      <div className='scrollable-messages'>
        {displayedChain.messages.map(message => (
          <SingleMessage key={message.timestamp} message={message} myPlayerID={myPlayerID} />
        ))}
      </div>
      <div className='chat-input'>
        <ChatInput
          messageType={chainType}
          directMessageId={directMessageID}
          isDisabled={undefined}
        />
      </div>
    </div>
  );
}
