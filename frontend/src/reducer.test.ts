import { nanoid } from 'nanoid';
import MessageChain, { MessageType } from './classes/MessageChain';
import Player from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';
import { CoveyAppState } from './CoveyTypes';
import { appStateReducer } from './reducer';
import { createMessageForTesting } from './TestUtils';

jest.mock('./classes/TownsServiceClient');

const createSampleAppState = (): CoveyAppState => ({
  nearbyPlayers: { nearbyPlayers: [] },
  players: [],
  myPlayerID: '123',
  currentTownFriendlyName: '',
  currentTownID: '',
  currentTownIsPubliclyListed: false,
  sessionToken: '',
  userName: '',
  socket: null,
  currentLocation: {
    x: 0,
    y: 0,
    rotation: 'front',
    moving: false,
  },
  emitMovement: () => {},
  emitMessage: () => {},
  resetUnviewedMessages: () => {},
  apiClient: new TownsServiceClient(),
  townMessageChain: new MessageChain(),
  proximityMessageChain: new MessageChain(),
  directMessageChains: {},
});

describe('reducer', () => {
  const player1Id = '123';
  const player2Id = '456';
  const directMessageId = '123:456';

  describe('messageReceived', () => {
    it('adds new messages to existing town message chain', () => {
      const messageToTest = createMessageForTesting(MessageType.TownMessage, nanoid());
      const message2ToTest = createMessageForTesting(MessageType.TownMessage, nanoid());
      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      expect(firstState.townMessageChain.messages.length).toBe(1);
      expect(firstState.townMessageChain.messages).toContain(messageToTest);
      const secondState = appStateReducer(firstState, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      expect(secondState.townMessageChain.messages.length).toBe(2);
    });

    it('adds new messages to existing proximity message chain', () => {
      const messageToTest = createMessageForTesting(MessageType.ProximityMessage, nanoid());
      const message2ToTest = createMessageForTesting(MessageType.ProximityMessage, nanoid());
      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      expect(firstState.proximityMessageChain.messages.length).toBe(1);
      expect(firstState.proximityMessageChain.messages).toContain(messageToTest);
      const secondState = appStateReducer(firstState, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      expect(secondState.proximityMessageChain.messages.length).toBe(2);
    });

    it('creates new message chain for direct message', () => {
      const messageToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      const messageChainToCheck = firstState.directMessageChains[directMessageId];
      expect(messageChainToCheck.messages.length).toBe(1);
      expect(messageChainToCheck.messages).toContain(messageToTest);
    });
    it('adds message to existing chain for direct message', () => {
      const messageToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const message2ToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      expect(firstState.directMessageChains[directMessageId].messages.length).toBe(1);
      const secondState = appStateReducer(firstState, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      expect(secondState.directMessageChains[directMessageId].messages.length).toBe(2);
    });

    it('adds message to correct chain for direct message', () => {
      const messageToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const messageInSecondChain = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        '789',
      );
      const messageInFirstChain = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );

      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      expect(firstState.directMessageChains[directMessageId].messages.length).toBe(1);

      const secondState = appStateReducer(firstState, {
        action: 'messageReceived',
        message: messageInSecondChain,
      });
      expect(secondState.directMessageChains['123:789'].messages.length).toBe(1);

      const thirdState = appStateReducer(secondState, {
        action: 'messageReceived',
        message: messageInFirstChain,
      });
      expect(thirdState.directMessageChains['123:789'].messages.length).toBe(1);
      expect(thirdState.directMessageChains[directMessageId].messages.length).toBe(2);
    });
  });
  describe('playerDisconnected', () => {
    it('sets direct messages with that player to inactive', () => {
      const messageToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const firstState = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });

      expect(firstState.directMessageChains[directMessageId].isActive).toBe(true);

      const secondState = appStateReducer(firstState, {
        action: 'playerDisconnect',
        player: new Player(player2Id, 'test user', {
          x: 0,
          y: 0,
          rotation: 'front',
          moving: false,
        }),
      });

      expect(secondState.directMessageChains[directMessageId].isActive).toBe(false);
    });
  });
  describe('resetUnviewedMessages', () => {
    it('resets the unviewed messages for a town message chain', () => {
      const messageToTest = createMessageForTesting(MessageType.TownMessage, nanoid());
      const message2ToTest = createMessageForTesting(MessageType.ProximityMessage, nanoid());
      const message3ToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );

      let state = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message3ToTest,
      });

      expect(state.townMessageChain.numberUnviewed).toBe(1);
      expect(state.proximityMessageChain.numberUnviewed).toBe(1);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(1);

      state = appStateReducer(state, {
        action: 'resetUnviewedMessages',
        messageType: MessageType.TownMessage,
      });
      expect(state.townMessageChain.numberUnviewed).toBe(0);
      expect(state.proximityMessageChain.numberUnviewed).toBe(1);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(1);
    });
    it('resets the unviewed messages for a proximity message chain', () => {
      const messageToTest = createMessageForTesting(MessageType.TownMessage, nanoid());
      const message2ToTest = createMessageForTesting(MessageType.ProximityMessage, nanoid());
      const message3ToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );

      let state = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message3ToTest,
      });

      expect(state.townMessageChain.numberUnviewed).toBe(1);
      expect(state.proximityMessageChain.numberUnviewed).toBe(1);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(1);

      state = appStateReducer(state, {
        action: 'resetUnviewedMessages',
        messageType: MessageType.ProximityMessage,
      });
      expect(state.townMessageChain.numberUnviewed).toBe(1);
      expect(state.proximityMessageChain.numberUnviewed).toBe(0);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(1);
    });

    it('resets the unviewed messages for a direct message chain', () => {
      const messageToTest = createMessageForTesting(MessageType.TownMessage, nanoid());
      const message2ToTest = createMessageForTesting(MessageType.ProximityMessage, nanoid());
      const message3ToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        player2Id,
      );
      const message4ToTest = createMessageForTesting(
        MessageType.DirectMessage,
        player1Id,
        '4321',
      );


      let state = appStateReducer(createSampleAppState(), {
        action: 'messageReceived',
        message: messageToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message2ToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message3ToTest,
      });
      state = appStateReducer(state, {
        action: 'messageReceived',
        message: message4ToTest,
      });


      expect(state.townMessageChain.numberUnviewed).toBe(1);
      expect(state.proximityMessageChain.numberUnviewed).toBe(1);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(1);

      state = appStateReducer(state, {
        action: 'resetUnviewedMessages',
        messageType: MessageType.DirectMessage,
        directMessageId,
      });
      expect(state.townMessageChain.numberUnviewed).toBe(1);
      expect(state.proximityMessageChain.numberUnviewed).toBe(1);
      expect(state.directMessageChains[directMessageId].numberUnviewed).toBe(0);
      expect(state.directMessageChains['123:4321'].numberUnviewed).toBe(1);
    });
  });
});
