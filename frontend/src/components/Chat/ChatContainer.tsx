import React from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
import './ChatContainer.css';
import SingleMessage from './SingleMessage';

// delete when real messages exist
const sampleMessage: Message = {
  userName: 'sampleName',
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
  directMessageID: string | undefined;
  chainType: MessageType;
}

export default function ChatContainer({
  directMessageID,
  chainType,
}: ChatContainerProps): JSX.Element {
  // optional passing of an direct message chain ID, depends on chain type
  // if new DM - wait until first input to create the new DM chain -- using the id that was given as a prop
  // eventually useCoveyAppState to connect to messages

  const finalSentence = (chainType === MessageType.DirectMessage) ? `you want ${directMessageID}` : '';
  return <div className='chat-container'>
    <div className='scrollable-messages'>
      {/* delete these when real messages replace them */}
      Chat type is {chainType}. No one has sent a message yet. {finalSentence}
      <SingleMessage message={sampleMessage} myPlayerID='23124' />
      <SingleMessage message={sampleMessage} myPlayerID='122342' />
      <SingleMessage message={sampleMessage} myPlayerID='33333' />
      <SingleMessage message={sampleMessage} myPlayerID='123234' />
      <SingleMessage message={sampleMessage} myPlayerID='122325' />
      <SingleMessage message={sampleMessage} myPlayerID='33333' />
      <SingleMessage message={sampleMessage} myPlayerID='123235' />
      <SingleMessage message={sampleMessage} myPlayerID='33333' />
    </div>
    <div className='chat-input'>input goes here</div>
  </div>;
}
