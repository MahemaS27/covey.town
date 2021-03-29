import { render } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import { Message, MessageType } from '../../classes/MessageChain';
import SingleMessage from './SingleMessage';

const sampleMessage: Message = {
  userName: 'sampleName',
  userId: '123456',
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
  directMessageId: null,
};

describe('SingleMessage', () => {
  it('renders message when message is sent by the player', () => {
    const renderData = render(<SingleMessage message={sampleMessage} myPlayerID='123456' />);
    renderData.getByTestId('sent-from-us');
    renderData.getByText(`${sampleMessage.userName}#3456`);
    renderData.getByText(moment(sampleMessage.timestamp).calendar());
    renderData.getByTestId('first-spacer');
    renderData.getByText(sampleMessage.messageContent);
    expect(renderData.queryByTestId(/second-spacer/i)).toBeNull();
    renderData.unmount();
  });

  it('renders message when message is sent by a different player', () => {
    const renderData = render(<SingleMessage message={sampleMessage} myPlayerID='453621' />);
    renderData.getByTestId('sent-from-them');
    renderData.getByText(`${sampleMessage.userName}#3456`);
    renderData.getByText(moment(sampleMessage.timestamp).calendar());
    renderData.getByTestId('second-spacer');
    renderData.getByText(sampleMessage.messageContent);
    expect(renderData.queryByTestId(/first-spacer/i)).toBeNull();
    renderData.unmount();
  });
});
