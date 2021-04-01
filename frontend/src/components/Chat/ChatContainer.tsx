import React from 'react';
import MessageChain, { Message, MessageType } from '../../classes/MessageChain';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import './ChatContainer.css';
import ChatInput from './ChatInput';
import SingleMessage from './SingleMessage';

// delete when real messages exist
const sampleMessage: Message = {
  fromUserName: 'sampleName',
  toUserName: null,
  userId: '33333',
  timestamp: Date.now(),
  messageContent:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  type: MessageType.TownMessage,
  location: {
    x: 0,
    y: 0,
    rotation: 'front',
    moving: false,
  },
  directMessageId: null,
};

interface ChatContainerProps {
  // so for now- Town/Proximity will pass in undefined
  directMessageID: string | null;
  chainType: MessageType;
}

export default function ChatContainer({
  directMessageID,
  chainType,
}: ChatContainerProps): JSX.Element {
  // optional passing of an direct message chain ID, depends on chain type
  // if new DM - wait until first input to create the new DM chain -- using the id that was given as a prop
  // eventually useCoveyAppState to connect to messages
  const { myPlayerID, directMessageChains, townMessageChain, proximityMessageChain } = useCoveyAppState();
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
    </div>
  }
  return <div className='chat-container'>
    <div className='scrollable-messages'>
      {
        displayedChain.messages.map((message) => (
          <SingleMessage message={message} myPlayerID={myPlayerID} />
        ))
      }
    </div>
    <div className='chat-input'>
      <ChatInput
        messageType={chainType}
        directMessageId={directMessageID}
        isDisabled={undefined}
      />
    </div>
  </div>;
}
