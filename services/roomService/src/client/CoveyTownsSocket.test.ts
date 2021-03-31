import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import * as TestUtils from './TestUtils';

import { MessageType, UserLocation } from '../CoveyTypes';
import TownsServiceClient from './TownsServiceClient';
import addTownRoutes from '../router/towns';
import Player from '../types/Player';

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string
};

describe('TownServiceApiSocket', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  async function createTownForTesting(friendlyNameToUse?: string, isPublic = false): Promise<TestTownData> {
    const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
      `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    server.close();
    TestUtils.cleanupSockets();
  });
  afterEach(() => {
    TestUtils.cleanupSockets();
  });
  it('Rejects invalid CoveyTownIDs, even if otherwise valid session token', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, nanoid());
    await socketDisconnected;
  });
  it('Rejects invalid session tokens, even if otherwise valid town id', async () => {
    const town = await createTownForTesting();
    await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected} = TestUtils.createSocketClient(server, nanoid(), town.coveyTownID);
    await socketDisconnected;
  });
  it('Dispatches movement updates to all clients in the same town', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData3 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const socketSender = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID).socket;
    const {playerMoved} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {playerMoved: playerMoved2} = TestUtils.createSocketClient(server, joinData3.coveySessionToken, town.coveyTownID);
    const newLocation: UserLocation = {x: 100, y: 100, moving: true, rotation: 'back'};
    socketSender.emit('playerMovement', newLocation);
    const [movedPlayer, otherMovedPlayer]= await Promise.all([playerMoved, playerMoved2]);
    expect(movedPlayer.location).toMatchObject(newLocation);
    expect(otherMovedPlayer.location).toMatchObject(newLocation);
  });
  it('Dispatches town messages to all clients in the same town, including the client who sent the message', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData3 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socket, messageReceived} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {messageReceived: messageReceived2} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {messageReceived: messageReceived3} = TestUtils.createSocketClient(server, joinData3.coveySessionToken, town.coveyTownID);
    const message = TestUtils.createMessageForTesting(MessageType.TownMessage, new Player(nanoid()));
    socket.emit('messageSent', message);
    const [firstMessage, secondMessage, thirdMessage] = await Promise.all([messageReceived, messageReceived2, messageReceived3]);
    expect(firstMessage).toMatchObject(message);
    expect(secondMessage).toMatchObject(message);
    expect(thirdMessage).toMatchObject(message);
  });
  it('Dispatches proximity messages to all nearby clients in the same town, including the client who sent the message', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData3 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socket: movementSocket} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {socket: messageSocket, messageReceived, playerMoved} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {messageReceived: messageReceived2, playerMoved: playerMoved2} = TestUtils.createSocketClient(server, joinData3.coveySessionToken, town.coveyTownID);

    const newLocation: UserLocation = {x: 100, y: 100, moving: true, rotation: 'back'};
    movementSocket.emit('playerMovement', newLocation); // moves first client out of range for proximity chat
    await Promise.all([playerMoved, playerMoved2]); // makes sure that other two clients register this movement

    // message will be originating from a mew Player's starting location, which is the same place that the second and third clients are located at
    const message = TestUtils.createMessageForTesting(MessageType.ProximityMessage, new Player(nanoid())); 
    messageSocket.emit('messageSent', message);
    const [firstMessage, secondMessage] = await Promise.all([messageReceived, messageReceived2]); // It should therefore be received by these two clients
    expect(firstMessage).toMatchObject(message);
    expect(secondMessage).toMatchObject(message);
    // sadly no way of checking that the first client will NOT receive the message. However, if you modify this test to try 
    // and await a messageReceived promise from it, the test will timeout.
  });
  it('Dispatches direct messages to the specified client in the same town, including the client who sent the message', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socket, messageReceived} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);

    const message = TestUtils.createDirectMessageForTesting( joinData2.currentPlayers[0]._id , joinData2.currentPlayers[1]._id );
    // emit the direct message action from socket
    socket.emit('messageSent', message);
    // message should be received by the second player
    const [receivedMessage] = await Promise.all([messageReceived]);
    expect(receivedMessage).toMatchObject(message);
  })
  it('Invalidates the user session after disconnection', async () => {
    // This test will timeout if it fails - it will never reach the expectation
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socket, socketConnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    await socketConnected;
    socket.close();
    const {socket: secondTryWithSameToken, socketDisconnected: secondSocketDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    await secondSocketDisconnected;
    expect(secondTryWithSameToken.disconnected).toBe(true);
  });
  it('Informs all new players when a player joins', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketConnected, newPlayerJoined} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {
      socketConnected: connectPromise2,
      newPlayerJoined: newPlayerPromise2,
    } = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2]);
    const newJoinerName = nanoid();

    await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: newJoinerName});
    expect((await newPlayerJoined)._userName).toBe(newJoinerName);
    expect((await newPlayerPromise2)._userName).toBe(newJoinerName);

  });
  
  it('Informs all players when a player disconnects', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const userWhoLeaves = nanoid();
    const joinDataWhoLeaves = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: userWhoLeaves});
    const {socketConnected, playerDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {socketConnected: connectPromise2, playerDisconnected: playerDisconnectPromise2} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {socket: socketWhoLeaves, socketConnected: connectPromise3} = TestUtils.createSocketClient(server, joinDataWhoLeaves.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2, connectPromise3]);
    socketWhoLeaves.close();
    expect((await playerDisconnected)._userName).toBe(userWhoLeaves);
    expect((await playerDisconnectPromise2)._userName).toBe(userWhoLeaves);

  });
  it('Informs all players when the town is destroyed', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected, socketConnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {socketDisconnected: disconnectPromise2, socketConnected: connectPromise2} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2]);
    await apiClient.deleteTown({coveyTownID: town.coveyTownID, coveyTownPassword: town.townUpdatePassword});
    await Promise.all([socketDisconnected, disconnectPromise2]);
  });
});
