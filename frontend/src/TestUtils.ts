import { nanoid } from 'nanoid';
import MessageChain, { Message, MessageType } from './classes/MessageChain';

export function createMessageForTesting(
  type: MessageType,
  player1Id: string,
  player2Id?: string,
  timestamp?: number,
): Message {
  let directMessageID = null;
  let toUserName = null;
  if (player2Id) {
    directMessageID = [player1Id, player2Id].sort().join(':');
    toUserName = nanoid();
  }
  return {
    fromUserName: nanoid(),
    toUserName,
    userId: player1Id,
    location: { x: 1, y: 2, rotation: 'front', moving: false },
    messageContent: "Omg I'm a test",
    timestamp: timestamp || Date.now(),
    type,
    directMessageId: directMessageID,
  };
}

export function createMessageChainForTesting(startingMessage: Message): MessageChain {
  if (startingMessage.type === MessageType.DirectMessage) {
    return new MessageChain(startingMessage);
  }
  return new MessageChain().addMessage(startingMessage);
}
