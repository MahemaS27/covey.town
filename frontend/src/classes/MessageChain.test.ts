import { nanoid } from 'nanoid';
import { createMessageChainForTesting, createMessageForTesting } from '../TestUtils';
import MessageChain, { MessageType } from './MessageChain';

// tests for new message chain class
describe('MessageChain', () => {
  it('constructs a message chain', () => {});
  it('constructs message with number unviewed as 0 when given a message from the player', () => {
    const firstMessage = createMessageForTesting(MessageType.DirectMessage, '123', '321');
    const testChain = new MessageChain(firstMessage, '123');
    expect(testChain.numberUnviewed).toBe(0);
  });
  it('constructs message with number unviewed as 1 when given a message from other player', () => {
    const firstMessage = createMessageForTesting(MessageType.DirectMessage, '123', '321');
    const testChain = new MessageChain(firstMessage, '321');
    expect(testChain.numberUnviewed).toBe(1);
  });
  it('get messages', () => {
    const firstMessage = createMessageForTesting(MessageType.ProximityMessage, 'player1');
    const testChain = createMessageChainForTesting(firstMessage);
    expect(firstMessage).toBe(testChain.messages[0]);
  });
  it('get isActive', () => {
    const firstMessage = createMessageForTesting(MessageType.ProximityMessage, 'player1');
    const testChain = createMessageChainForTesting(firstMessage);
    expect(testChain.isActive).toBe(true);
  });
  it('set isActive', () => {
    const firstMessage = createMessageForTesting(MessageType.ProximityMessage, 'player1');
    const testChain = createMessageChainForTesting(firstMessage);
    expect(testChain.isActive).toBe(true);
    testChain.isActive = false;
    expect(testChain.isActive).toBe(false);
  });
  describe('get directMessageId', () => {
    it('should return undefined for MessageChain that is not direct', () => {
      const firstMessage = createMessageForTesting(MessageType.ProximityMessage, 'player1');
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.directMessageId).toBeUndefined();
    });
    it('should return a string id for a MessageChain containing DirectMessages', () => {
      const player1Id = '123';
      const player2Id = '321';
      const firstMessage = createMessageForTesting(MessageType.DirectMessage, player1Id, player2Id);
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.directMessageId).toBe(firstMessage.directMessageId);
      expect(testChain.directMessageId).toBe(`${player1Id}:${player2Id}`);
    });
  });
  describe('get participants', () => {
    it('should return undefined for MessageChain that is not direct', () => {
      const firstMessage = createMessageForTesting(MessageType.ProximityMessage, 'player1');
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.participants).toBeUndefined();
    });
    it('should return a string array for a MessageChain containing DirectMessages', () => {
      const player1Id = nanoid();
      const player2Id = nanoid();
      const firstMessage = createMessageForTesting(MessageType.DirectMessage, player1Id, player2Id);
      firstMessage.fromUserName = 'testFromUser';
      firstMessage.toUserName = 'testToUser';
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.participants?.length).toBe(2);
      expect(testChain.participants).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userName: firstMessage.fromUserName, userId: player1Id }),
          expect.objectContaining({ userName: firstMessage.toUserName, userId: player2Id }),
        ]),
      );
    });
  });
  describe('addMessage', () => {
    it('should not update unviewed count when message userId is equal to myPlayerId', () => {
      const player1Id = '123';
      const message = createMessageForTesting(MessageType.ProximityMessage, player1Id, '321');
      const testChain = new MessageChain();
      testChain.addMessage(message, player1Id);
      expect(testChain.numberUnviewed).toBe(0);
    });
    it('should update unviewed count when message userId is not equal to myPlayerId', () => {
      const player1Id = '321';
      const message = createMessageForTesting(MessageType.ProximityMessage, '123');
      const testChain = new MessageChain();
      testChain.addMessage(message, player1Id);
      expect(testChain.numberUnviewed).toBe(1);
    });
    it('should allow for message added to active MessageChain', () => {
      const player1Id = nanoid();
      const firstMessage = createMessageForTesting(MessageType.ProximityMessage, player1Id);
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.messages.length).toBe(1);
      const secondMessage = createMessageForTesting(MessageType.ProximityMessage, player1Id);
      testChain.addMessage(secondMessage);
      expect(testChain.messages.length).toBe(2);
      expect(secondMessage).toBe(testChain.messages[1]);
    });
    it('should not allow message to add to inactive chain', () => {
      const player1Id = nanoid();
      const firstMessage = createMessageForTesting(MessageType.ProximityMessage, player1Id);
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.messages.length).toBe(1);
      testChain.isActive = false;
      const secondMessage = createMessageForTesting(MessageType.ProximityMessage, player1Id);
      testChain.addMessage(secondMessage);
      expect(testChain.messages.length).toBe(1);
    });
    it('should allow for messages sent at same time to be added to MessageChain if each from different player', () => {
      const player1Id = nanoid();
      const player2Id = nanoid();
      const timestamp = Date.now();
      const firstMessage = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
        timestamp,
      );
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.messages.length).toBe(1);
      const secondMessage = createMessageForTesting(
        MessageType.DirectMessage,
        player2Id,
        player1Id,
        timestamp,
      );
      testChain.addMessage(secondMessage);
      expect(testChain.messages.length).toBe(2);
    });
    it('should not allow for duplicate message to be added to MessageChain', () => {
      const player1Id = nanoid();
      const firstMessage = createMessageForTesting(MessageType.ProximityMessage, player1Id);
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.messages.length).toBe(1);
      testChain.addMessage(firstMessage);
      expect(testChain.messages.length).toBe(1);
    });

    it('should not check for duplicates past older timestamps', () => {
      const player1Id = nanoid();
      const player2Id = nanoid();
      const timestamp = Date.now();
      const timestampOlder = Date.now() - 1;
      const firstMessage = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
        timestamp,
      );
      const testChain = createMessageChainForTesting(firstMessage);
      expect(testChain.messages.length).toBe(1);
      const secondMessage = createMessageForTesting(
        MessageType.DirectMessage,
        player2Id,
        player1Id,
        timestampOlder,
      );
      testChain.addMessage(secondMessage);
      testChain.addMessage(firstMessage);
      expect(testChain.messages.length).toBe(3);
    });
  });
});
