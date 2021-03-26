import { render } from '@testing-library/react';
import React from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
import SingleMessage from './SingleMessage';

const sampleMessage: Message = {
  userName: 'sampleName',
  userId: '123',
  timestamp: 1616797320000,
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

describe('SingleMessage', () => {
  it('renders message when message is sent by the player', () => {
    const renderData = render(<SingleMessage message={sampleMessage} myPlayerID='123' />);
    renderData.getByTestId('sent-from-us');
    renderData.getByText(sampleMessage.userName);
    renderData.getByText('3/26/2021 10:22 PM');
    renderData.getByTestId('first-spacer');
    renderData.getByText(sampleMessage.messageContent);
    expect(renderData.queryByTestId(/second-spacer/i)).toBeNull();
    renderData.unmount();
  });

  it('renders message when message is sent by a different player', () => {
    const renderData = render(<SingleMessage message={sampleMessage} myPlayerID='321' />);
    renderData.getByTestId('sent-from-them');
    renderData.getByText(sampleMessage.userName);
    renderData.getByText('3/26/2021 10:22 PM');
    renderData.getByTestId('second-spacer');
    renderData.getByText(sampleMessage.messageContent);
    expect(renderData.queryByTestId(/first-spacer/i)).toBeNull();
    renderData.unmount();
  });
});
