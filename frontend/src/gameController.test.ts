import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { MessageType } from './classes/MessageChain';
import Video from './classes/Video/Video';
import GameController from './GameController';
import { createMessageForTesting } from './TestUtils';

jest.mock('./classes/Video/Video');

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
  }),
}));

const mockVideoSetup = mock<Video>();

Video.instance = () => mockVideoSetup;

describe('game controller', () => {
  // from https://stackoverflow.com/questions/48033841/test-process-env-with-jest
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('creates a listener for message received socket events', async () => {
    process.env.REACT_APP_TOWNS_SERVICE_URL = 'testurl.com';
    const dispatchAppUpdate = jest.fn();
    const initData = {
      coveyUserID: 'id',
      coveySessionToken: 'token',
      providerVideoToken: 'vid token',
      currentPlayers: [],
      friendlyName: 'test town 123',
      isPubliclyListed: true,
    };

    await GameController(initData, dispatchAppUpdate);

    const { socket } = dispatchAppUpdate.mock.calls[0][0].data;
    const message = createMessageForTesting(MessageType.TownMessage, nanoid());

    const messageReceived = socket.on.mock.calls[4][1];
    messageReceived(message);
    expect(dispatchAppUpdate).toHaveBeenCalledWith({ action: 'messageReceived', message });
  });
  it('emits a message to the socket when a message is sent', async () => {
    process.env.REACT_APP_TOWNS_SERVICE_URL = 'testurl.com';
    const dispatchAppUpdate = jest.fn();
    const initData = {
      coveyUserID: 'id',
      coveySessionToken: 'token',
      providerVideoToken: 'vid token',
      currentPlayers: [],
      friendlyName: 'test town 123',
      isPubliclyListed: true,
    };

    await GameController(initData, dispatchAppUpdate);

    const { emitMessage, socket } = dispatchAppUpdate.mock.calls[0][0].data;
    const message = createMessageForTesting(MessageType.TownMessage, nanoid());

    emitMessage(message);
    expect(socket.emit).toBeCalledWith('messageSent', message);
  });

  it('dispatches an update to the socket when a unviewed messages are reset', async () => {
    process.env.REACT_APP_TOWNS_SERVICE_URL = 'testurl.com';
    const dispatchAppUpdate = jest.fn();
    const initData = {
      coveyUserID: 'id',
      coveySessionToken: 'token',
      providerVideoToken: 'vid token',
      currentPlayers: [],
      friendlyName: 'test town 123',
      isPubliclyListed: true,
    };

    await GameController(initData, dispatchAppUpdate);

    const { resetUnviewedMessages } = dispatchAppUpdate.mock.calls[0][0].data;

    resetUnviewedMessages(MessageType.DirectMessage, '123:234');
    expect(dispatchAppUpdate).toBeCalledWith({
      action: 'resetUnviewedMessages',
      messageType: MessageType.DirectMessage,
      directMessageId: '123:234',
    });
  });
});
