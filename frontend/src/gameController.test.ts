import { mock, mockReset,  } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io-client';
import { GameController } from './GameController';

describe('game controller', () => {
    const mockSocket = mock<Socket>();
})