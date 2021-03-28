import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { io } from 'socket.io-client';
import './App.css';
import { Message } from './classes/MessageChain';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import { TownJoinResponse } from './classes/TownsServiceClient';
import Video from './classes/Video/Video';
import ChatSidebar from './components/Chat/ChatSidebar';
import Login from './components/Login/Login';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import UnsupportedBrowserWarning from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import WorldMap from './components/world/WorldMap';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import VideoContext from './contexts/VideoContext';
import { appStateReducer, CoveyAppUpdate, defaultAppState } from './reducer';

async function GameController(
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

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());

  const setupGameController = useCallback(
    async (initData: TownJoinResponse) => {
      await GameController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );
  const videoInstance = Video.instance();

  const { setOnDisconnect } = props;
  useEffect(() => {
    setOnDisconnect(() => async () => {
      // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    if (!appState.sessionToken) {
      return <Login doLogin={setupGameController} />;
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div className='world-and-overlay-container'>
          <WorldMap />
          <VideoOverlay preferredMode='fullwidth' />
        </div>
        <ChatSidebar />
      </div>
    );
  }, [setupGameController, appState.sessionToken, videoInstance]);
  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
          {page}
        </NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>
  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode='fullwidth' highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
