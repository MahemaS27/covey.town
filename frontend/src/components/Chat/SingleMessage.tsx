import { Tooltip } from '@chakra-ui/react';
import moment from 'moment';
import React from 'react';
import { Message } from '../../classes/MessageChain';
import './SingleMessage.css';

interface SingleMessageProps {
  message: Message;
  myPlayerID: string;
}
export default function SingleMessage({ message, myPlayerID }: SingleMessageProps): JSX.Element {
  const { userId, fromUserName, messageContent, timestamp } = message;
  const formattedTimestamp = moment(timestamp).calendar();
  const isSentFromUs = userId === myPlayerID;
  const className = isSentFromUs ? 'sent-from-us' : 'sent-from-them';
  const lastFourDigits = userId.slice(-4);
  const userNameToRender = `${fromUserName}#${lastFourDigits}`;

  return (
    <div data-testid={className} className={`message-container ${className}`}>
      {isSentFromUs && <div data-testid='first-spacer' className='spacer first-spacer' />}
      <div className='message-content'>
        <div className='message-details'>
          <div className='message-username'>
            <Tooltip label={userNameToRender}>{userNameToRender}</Tooltip>
          </div>
          <div className='message-timestamp'>{formattedTimestamp}</div>
        </div>
        {messageContent}
      </div>
      {!isSentFromUs && <div data-testid='second-spacer' className='spacer second-spacer' />}
    </div>
  );
}
