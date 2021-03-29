import { Socket } from 'socket.io-client';
import './App.css';
import MessageChain, { Message, MessageType } from './classes/MessageChain';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';
import { CoveyAppState, NearbyPlayers } from './CoveyTypes';

export type CoveyAppUpdate =
  | {
      action: 'doConnect';
      data: {
        userName: string;
        townFriendlyName: string;
        townID: string;
        townIsPubliclyListed: boolean;
        sessionToken: string;
        myPlayerID: string;
        socket: Socket;
        players: Player[];
        emitMovement: (location: UserLocation) => void;
        emitMessage: (message: Message) => void;
      };
    }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'messageReceived'; message: Message };

export function defaultAppState(): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
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
    apiClient: new TownsServiceClient(),
    townMessageChain: new MessageChain(),
    proximityMessageChain: new MessageChain(),
    directMessageChains: {},
  };
}
export function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
  const nextState = {
    sessionToken: state.sessionToken,
    currentTownFriendlyName: state.currentTownFriendlyName,
    currentTownID: state.currentTownID,
    currentTownIsPubliclyListed: state.currentTownIsPubliclyListed,
    myPlayerID: state.myPlayerID,
    players: state.players,
    currentLocation: state.currentLocation,
    nearbyPlayers: state.nearbyPlayers,
    userName: state.userName,
    socket: state.socket,
    emitMovement: state.emitMovement,
    emitMessage: state.emitMessage,
    apiClient: state.apiClient,
    townMessageChain: state.townMessageChain,
    proximityMessageChain: state.proximityMessageChain,
    directMessageChains: state.directMessageChains,
  };

  function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
    const isWithinCallRadius = (p: Player, location: UserLocation) => {
      if (p.location && location) {
        const dx = p.location.x - location.x;
        const dy = p.location.y - location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return { nearbyPlayers: players.filter(p => isWithinCallRadius(p, currentLocation)) };
  }

  function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
    if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length) return false;
    const ids1 = a1.nearbyPlayers.map(p => p.id).sort();
    const ids2 = a2.nearbyPlayers.map(p => p.id).sort();
    return !ids1.some((val, idx) => val !== ids2[idx]);
  }

  let updatePlayer;
  let directMessageIdToInactivate;
  let directMessageChainToInactivate;
  let directMessageChainToUpdate;
  switch (update.action) {
    case 'doConnect':
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      nextState.userName = update.data.userName;
      nextState.emitMovement = update.data.emitMovement;
      nextState.emitMessage = update.data.emitMessage;
      nextState.socket = update.data.socket;
      nextState.players = update.data.players;
      break;
    case 'addPlayer':
      nextState.players = nextState.players.concat([update.player]);
      break;
    case 'playerMoved':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.location = update.player.location;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'weMoved':
      nextState.currentLocation = update.location;
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }

      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter(player => player.id !== update.player.id);
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }

      // deactivate chats that include that player
      directMessageIdToInactivate = [nextState.myPlayerID, update.player.id].sort().join(':');
      directMessageChainToInactivate = nextState.directMessageChains[directMessageIdToInactivate];

      if (directMessageChainToInactivate) {
        directMessageChainToInactivate.isActive = false;
        nextState.directMessageChains[directMessageIdToInactivate] = directMessageChainToInactivate;
      }

      break;
    case 'disconnect':
      state.socket?.disconnect();
      return defaultAppState();
    case 'messageReceived':
      switch (update.message.type) {
        case MessageType.TownMessage:
          nextState.townMessageChain = nextState.townMessageChain.addMessage(update.message);
          break;
        case MessageType.ProximityMessage:
          nextState.proximityMessageChain = nextState.proximityMessageChain.addMessage(
            update.message,
          );
          break;
        default:
          if (update.message.directMessageId) {
            directMessageChainToUpdate =
              nextState.directMessageChains[update.message.directMessageId];
            nextState.directMessageChains[
              update.message.directMessageId
            ] = directMessageChainToUpdate
              ? directMessageChainToUpdate.addMessage(update.message)
              : new MessageChain(update.message);
          }
          break;
      }
      break;
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}
