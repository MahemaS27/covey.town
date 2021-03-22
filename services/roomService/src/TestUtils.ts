import { Message, MessageType } from './CoveyTypes';
import MessageChain from './types/MessageChain';
import Player from './types/Player';

export function createPlayerForTesting(): Player {
  return new Player('player 1');
}

export function createMessageForTesting(type: MessageType, player1: Player, player2id?: string): Message {
  const timestamp = Date.now().toString();
  let directMessageID;
  if (player2id) {
    directMessageID = `${player1.id}:${player2id}`;
  }
  return {
    user: {location: player1.location, userName: player1.userName, id: player1.id},
    messageContent: "Omg I'm a test",
    timestamp,
    type,
    directMessageId: directMessageID,
  };
}

export function createMessageChainForTesting(startingMessage: Message): MessageChain {
  return new MessageChain(startingMessage);
}
