/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import MessageChain, { MessageChainHash, MessageType } from '../../classes/MessageChain';
import Player, { UserLocation } from '../../classes/Player';
import TownsServiceClient from '../../classes/TownsServiceClient';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import { createMessageForTesting } from '../../TestUtils';
import ChatSidebar from './ChatSidebar';

jest.mock('../../classes/TownsServiceClient');
const sampleLocation: UserLocation = {
  x: 0,
  y: 0,
  rotation: 'front',
  moving: false,
};

function wrappedChatSidebar(
  townMessageChain: MessageChain = new MessageChain(),
  proximityMessageChain: MessageChain = new MessageChain(),
  directMessageChains: MessageChainHash = {},
) {
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
          emitMessage: () => {},
          resetUnviewedMessages: () => {},
          apiClient: new TownsServiceClient(),
          townMessageChain,
          proximityMessageChain,
          directMessageChains,
        }}>
        <ChatSidebar />
      </CoveyAppContext.Provider>
    </ChakraProvider>
  );
}

describe('ChatSidebar', () => {
  it('renders a collapsed sidebar', () => {
    const renderData = render(wrappedChatSidebar());
    const button = renderData.getByTestId('collapse-expand-button');
    expect(renderData.queryByTestId(/sidebar-content/i)).toBeNull();
    expect(button.textContent).toContain('0 Messages');
    expect(button.textContent).toContain('‹');
  });

  describe('after opening', () => {
    it('opens the sidebar', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      renderData.getByTestId('sidebar-content');
      const updatedButton = renderData.getByTestId('collapse-expand-button');
      expect(updatedButton.textContent).toContain('›');
    });

    it('defaults to direct chats', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      const header = renderData.getByTestId('sidebar-header');
      expect(header.textContent).toContain('Direct Chats');
    });

    it('switches to town chat', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      fireEvent.click(renderData.getByTestId('town-chat-tab'));
      const header = renderData.getByTestId('sidebar-header');
      expect(header.textContent).toContain('Town Chat');
    });

    it('switches to proximity chat', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      fireEvent.click(renderData.getByTestId('proximity-chat-tab'));
      const header = renderData.getByTestId('sidebar-header');
      expect(header.textContent).toContain('Proximity Chat');
    });

    it('switches back to direct chat', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      fireEvent.click(renderData.getByTestId('proximity-chat-tab'));
      let header = renderData.getByTestId('sidebar-header');
      expect(header.textContent).toContain('Proximity Chat');
      fireEvent.click(renderData.getByTestId('direct-chat-tab'));
      header = renderData.getByTestId('sidebar-header');
      expect(header.textContent).toContain('Direct Chat');
    });
  });

  describe('notifications', () => {
    it('will not render when all messages are viewed', () => {
      const renderData = render(wrappedChatSidebar());
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      expect(renderData.queryByTestId(/direct-notifs/i)).toBeNull();
      expect(renderData.queryByTestId(/town-notifs/i)).toBeNull();
      expect(renderData.queryByTestId(/proximity-notifs/i)).toBeNull();
    });
    it('properly renders when number unviewed counts are greater than 0', () => {
      const townMessageChain = new MessageChain();
      const townMessageForTesting = createMessageForTesting(MessageType.TownMessage, '123');
      const townMessageForTesting2 = createMessageForTesting(MessageType.TownMessage, '123');

      townMessageChain.addMessage(townMessageForTesting);
      townMessageChain.addMessage(townMessageForTesting2);

      const proximityMessageChain = new MessageChain();
      const proximityMessageForTesting = createMessageForTesting(
        MessageType.ProximityMessage,
        '123',
      );
      const proximityMessageForTesting2 = createMessageForTesting(
        MessageType.ProximityMessage,
        '123',
      );
      const proximityMessageForTesting3 = createMessageForTesting(
        MessageType.ProximityMessage,
        '123',
      );
      proximityMessageChain.addMessage(proximityMessageForTesting);
      proximityMessageChain.addMessage(proximityMessageForTesting2);
      proximityMessageChain.addMessage(proximityMessageForTesting3);
      
      const directMessageChain = new MessageChain();
      const directMessageForTesting = createMessageForTesting(
        MessageType.DirectMessage,
        '123',
        '231',
      );
      const directMessageForTesting2 = createMessageForTesting(
        MessageType.DirectMessage,
        '123',
        '231',
      );
      const directMessageForTesting3 = createMessageForTesting(
        MessageType.DirectMessage,
        '123',
        '231',
      );
      directMessageChain.addMessage(directMessageForTesting);
      directMessageChain.addMessage(directMessageForTesting2);
      directMessageChain.addMessage(directMessageForTesting3);
      const renderData = render(
        wrappedChatSidebar(townMessageChain, proximityMessageChain, {
          '123:321': directMessageChain,
          '352:234': directMessageChain,
        }),
      );
      const button = renderData.getByTestId('collapse-expand-button');
      fireEvent.click(button);
      expect(renderData.getByTestId('direct-notifs').textContent).toEqual('6');
      expect(renderData.getByTestId('town-notifs').textContent).toEqual('2');
      expect(renderData.getByTestId('proximity-notifs').textContent).toEqual('3');
    });
  });
});
