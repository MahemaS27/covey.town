/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import React from 'react';
import MessageChain, { Message, MessageType } from '../../classes/MessageChain';
import Player, { UserLocation } from '../../classes/Player';
import TownsServiceClient from '../../classes/TownsServiceClient';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import ChatInput from './ChatInput';

const mockPause = jest.fn();
const mockUnpause = jest.fn();
const mockEmitMessage = jest.fn();
jest.mock('../../classes/TownsServiceClient');
jest.mock('../../classes/Video/Video');
jest.mock('../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext.ts', () => ({
  __esModule: true, // this property makes it work
  default: () => ({ pauseGame: mockPause, unPauseGame: mockUnpause }),
}));

const sampleLocation: UserLocation = {
  x: 2,
  y: 3,
  rotation: 'front',
  moving: false,
};

const samplePlayers: Array<Player> = [
  new Player('123', 'test from', sampleLocation),
  new Player('321', 'test to', sampleLocation),
];

function wrappedChatInput(isDisabled = false, directMessageChains = {}, players = samplePlayers) {
  return (
    <ChakraProvider>
      <CoveyAppContext.Provider
        value={{
          nearbyPlayers: { nearbyPlayers: [] },
          players,
          myPlayerID: '123',
          currentTownID: '',
          currentTownIsPubliclyListed: false,
          currentTownFriendlyName: '',
          sessionToken: '',
          userName: 'test from',
          socket: null,
          currentLocation: sampleLocation,
          emitMovement: () => {},
          emitMessage: mockEmitMessage,
          resetUnviewedMessages: () => {},
          apiClient: new TownsServiceClient(),
          townMessageChain: new MessageChain(),
          proximityMessageChain: new MessageChain(),
          directMessageChains,
        }}>
        <ChatInput
          messageType={MessageType.DirectMessage}
          directMessageId='123:321'
          isDisabled={isDisabled}
        />
      </CoveyAppContext.Provider>
    </ChakraProvider>
  );
}

describe('ChatInput', () => {
  afterEach(() => {
    mockEmitMessage.mockReset();
    mockPause.mockReset();
    mockUnpause.mockReset();
  });
  it('renders a textarea and a disabled button', () => {
    const renderData = render(wrappedChatInput());
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    const sendButton = renderData.getByText('Send').closest('button');
    expect(sendButton).toBeTruthy();
    expect(textArea).toBeTruthy();
    if (sendButton) expect(sendButton.disabled).toBeTruthy();
    if (textArea) expect(textArea.disabled).toBeFalsy();
  });
  it('renders a disabled textarea and a disabled button if isDisabled prop is true', () => {
    const renderData = render(wrappedChatInput(true));
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    const sendButton = renderData.getByText('Send').closest('button');
    expect(sendButton).toBeTruthy();
    expect(textArea).toBeTruthy();
    if (sendButton) expect(sendButton.disabled).toBeTruthy();
    if (textArea) expect(textArea.disabled).toBeTruthy();
  });
  it('enables send button when user begins to type', () => {
    const renderData = render(wrappedChatInput());
    fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
      target: { value: 'new value' },
    });
    const sendButton = renderData.getByText('Send').closest('button');
    expect(sendButton).toBeTruthy();
    if (sendButton) expect(sendButton.disabled).toBeFalsy();
  });
  it('enables send button when user begins to type', () => {
    const renderData = render(wrappedChatInput());
    fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
      target: { value: 'new value' },
    });
    const sendButton = renderData.getByText('Send').closest('button');
    expect(sendButton).toBeTruthy();
    if (sendButton) expect(sendButton.disabled).toBeFalsy();
  });
  it('sends a message on submit when no chain has started yet', () => {
    const renderData = render(wrappedChatInput());
    fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
      target: { value: 'new value' },
    });
    fireEvent.submit(renderData.getByTestId('chat-form'));
    expect(mockEmitMessage).toHaveBeenCalledWith({
      userId: '123',
      fromUserName: 'test from',
      toUserName: 'test to',
      timestamp: expect.any(Number),
      location: sampleLocation,
      messageContent: 'new value',
      type: MessageType.DirectMessage,
      directMessageId: '123:321',
    });
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    if (textArea) expect(textArea.value).toBe('');
  });

  describe('when a message chain has started', () => {
    const mockPlayerArray = mock<Array<Player>>();
    const startingMessage: Message = {
      fromUserName: 'test from',
      toUserName: 'test to',
      userId: '123',
      location: { x: 1, y: 2, rotation: 'front', moving: false },
      messageContent: "Omg I'm a test",
      timestamp: Date.now(),
      type: MessageType.DirectMessage,
      directMessageId: '123:321',
    };
    const messageChain = new MessageChain(startingMessage);

    it('sends a message on submit without checking the list of players', () => {
      const renderData = render(
        wrappedChatInput(false, { '123:321': messageChain }, mockPlayerArray),
      );
      fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
        target: { value: 'new value' },
      });
      fireEvent.submit(renderData.getByTestId('chat-form'));
      expect(mockPlayerArray.find).not.toHaveBeenCalled();
      expect(mockEmitMessage).toHaveBeenCalledWith({
        userId: '123',
        fromUserName: 'test from',
        toUserName: 'test to',
        timestamp: expect.any(Number),
        location: sampleLocation,
        messageContent: 'new value',
        type: MessageType.DirectMessage,
        directMessageId: '123:321',
      });

      const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
      if (textArea) expect(textArea.value).toBe('');
    });
  });

  it('sends a message on enter', () => {
    const renderData = render(wrappedChatInput());
    fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
      target: { value: 'new value' },
    });
    fireEvent.keyDown(renderData.getByTestId('textarea-component'), {
      key: 'Enter',
      keyCode: 13,
    });
    expect(mockEmitMessage).toHaveBeenCalledWith({
      userId: '123',
      fromUserName: 'test from',
      toUserName: 'test to',
      timestamp: expect.any(Number),
      location: sampleLocation,
      messageContent: 'new value',
      type: MessageType.DirectMessage,
      directMessageId: '123:321',
    });
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    if (textArea) expect(textArea.value).toBe('');
  });
});
