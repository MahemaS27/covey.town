import assert from 'assert';
import { io } from "socket.io-client";
import { Message } from "./classes/MessageChain";
import Player, { ServerPlayer, UserLocation } from "./classes/Player";
import { TownJoinResponse } from "./classes/TownsServiceClient";
import Video from './classes/Video/Video';
import { CoveyAppUpdate } from "./reducer";

export async function GameController(
    initData: TownJoinResponse,
    dispatchAppUpdate: (update: CoveyAppUpdate) => void,
  ) {
    // Now, set up the game sockets
    const gamePlayerID = initData.coveyUserID;
    const sessionToken = initData.coveySessionToken;
    const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(url);
    const video = Video.instance();
    assert(video);
    const roomName = video.townFriendlyName;
    assert(roomName);
  
    const socket = io(url, { auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
    socket.on('newPlayer', (player: ServerPlayer) => {
      dispatchAppUpdate({
        action: 'addPlayer',
        player: Player.fromServerPlayer(player),
      });
    });
    socket.on('playerMoved', (player: ServerPlayer) => {
      if (player._id !== gamePlayerID) {
        dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
      }
    });
    socket.on('playerDisconnect', (player: ServerPlayer) => {
      dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
    });
    socket.on('disconnect', () => {
      dispatchAppUpdate({ action: 'disconnect' });
    });
    socket.on('messageReceived', (message: Message) => {
      dispatchAppUpdate({ action: 'messageReceived', message });
    });
    const emitMovement = (location: UserLocation) => {
      socket.emit('playerMovement', location);
      dispatchAppUpdate({ action: 'weMoved', location });
    };
    const emitMessage = (message: Message) => {
      socket.emit('messageSent', message);
      // don't need to update the app with the sent message, the socket will emit messageReceived back to us
      // and we update it then  
    };
  
    dispatchAppUpdate({
      action: 'doConnect',
      data: {
        sessionToken,
        userName: video.userName,
        townFriendlyName: roomName,
        townID: video.coveyTownID,
        myPlayerID: gamePlayerID,
        townIsPubliclyListed: video.isPubliclyListed,
        emitMovement,
        emitMessage,
        socket,
        players: initData.currentPlayers.map(sp => Player.fromServerPlayer(sp)),
      },
    });
    return true;
  }