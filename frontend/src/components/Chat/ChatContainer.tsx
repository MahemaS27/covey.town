import React from 'react';
import MessageChain, { MessageType } from '../../classes/MessageChain';
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
