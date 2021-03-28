import * as socket from 'socket.io-client';

import { Socket } from 'socket.io-client';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GameController } from './GameController';
import Video from './classes/Video/Video';
import { createMessageForTesting } from './TestUtils';
import { MessageType } from './classes/MessageChain';
jest.mock('./classes/Video/Video');

jest.mock('socket.io-client', () => ({
    io: () => ({
      on: jest.fn(),
      emit: jest.fn(),
    }),
  }));

  const mockVideoSetup = mock<Video>();
    
  Video.instance = () => {
      return mockVideoSetup;
  };

it('emits a message to the socket when a message is sent', async () => {
    const dispatchAppUpdate = jest.fn();
    const initData = {
        coveyUserID: "id",
        coveySessionToken: "token",
        providerVideoToken: "vid token",
        currentPlayers: [],
        friendlyName: "test town 123",
        isPubliclyListed: true,
    }  
    
    await GameController(initData, dispatchAppUpdate);
    
    const dispatchAppData = dispatchAppUpdate.mock.calls[0][0].data;
    const emitMessage = dispatchAppData.emitMessage;
    console.log(emitMessage)
    const socket = dispatchAppData.socket;
    const message = createMessageForTesting(MessageType.TownMessage, nanoid());

    emitMessage(message);
    expect(socket.emit).toBeCalledWith('messageSent', message);
});
