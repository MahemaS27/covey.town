/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import MessageChain, { MessageType } from '../../classes/MessageChain';
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
  x: 0,
  y: 0,
  rotation: 'front',
  moving: false,
};

function wrappedChatInput(props?: Object) {
  return (
    <ChakraProvider>
      <CoveyAppContext.Provider
        value={{
          nearbyPlayers: { nearbyPlayers: [] },
          players: [new Player('123', 'test', sampleLocation)],
          myPlayerID: '123',
          currentTownID: '',
          currentTownIsPubliclyListed: false,
          currentTownFriendlyName: '',
          sessionToken: '',
          userName: '',
          socket: null,
          currentLocation: sampleLocation,
          emitMovement: () => {},
          emitMessage: mockEmitMessage,
          apiClient: new TownsServiceClient(),
          townMessageChain: new MessageChain(),
          proximityMessageChain: new MessageChain(),
          directMessageChains: {},
        }}>
        <ChatInput
          messageType={MessageType.DirectMessage}
          directMessageId='123:321'
          isDisabled={undefined}
          {...props}
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
    const renderData = render(wrappedChatInput({ isDisabled: true }));
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
  it('sends a message on submit', () => {
    const renderData = render(wrappedChatInput());
    fireEvent.change(renderData.getByPlaceholderText('Send a message...'), {
      target: { value: 'new value' },
    });
    fireEvent.submit(renderData.getByTestId('chat-form'));
    expect(mockEmitMessage).toHaveBeenCalled();
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    if (textArea) expect(textArea.value).toBe('');
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
    expect(mockEmitMessage).toHaveBeenCalled();
    const textArea = renderData.getByPlaceholderText('Send a message...').closest('textarea');
    if (textArea) expect(textArea.value).toBe('');
  });
});
