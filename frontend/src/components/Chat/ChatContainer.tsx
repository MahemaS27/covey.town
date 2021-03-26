import React from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
import './ChatContainer.css';
import SingleMessage from './SingleMessage';

// delete when real messages exist
const sampleMessage: Message = {
  userName: 'sampleName',
  userId: '123',
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
  directMessageId: undefined,
};

export default function ChatContainer(): JSX.Element {
  return (
    <div className='chat-container'>
      <div className='scrollable-messages'>
        {/* delete these when real messages replace them */}
        <SingleMessage message={sampleMessage} myPlayerID='231' />
        <SingleMessage message={sampleMessage} myPlayerID='12' />
        <SingleMessage message={sampleMessage} myPlayerID='123' />
        <SingleMessage message={sampleMessage} myPlayerID='123' />
        <SingleMessage message={sampleMessage} myPlayerID='12' />
        <SingleMessage message={sampleMessage} myPlayerID='33' />
        <SingleMessage message={sampleMessage} myPlayerID='123' />
        <SingleMessage message={sampleMessage} myPlayerID='123' />
      </div>
      <div className='chat-input'>input goes here</div>
    </div>
  );
}
