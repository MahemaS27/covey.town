import { Socket } from 'socket.io-client';
import MessageChain, { Message, MessageChainHash, MessageType } from './classes/MessageChain';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string;
  id: string;
};

export type UserProfile = {
  displayName: string;
  id: string;
};

export type NearbyPlayers = {
  nearbyPlayers: Player[];
};

export type CoveyAppState = {
  sessionToken: string;
  userName: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  myPlayerID: string;
  players: Player[];
  currentLocation: UserLocation;
  nearbyPlayers: NearbyPlayers;
  emitMovement: (location: UserLocation) => void;
  emitMessage: (message: Message) => void;
  resetUnviewedMessages: (messageType: MessageType, directMessageId: string | null) => void;
  socket: Socket | null;
  apiClient: TownsServiceClient;
  townMessageChain: MessageChain;
  proximityMessageChain: MessageChain;
  directMessageChains: MessageChainHash;
};
