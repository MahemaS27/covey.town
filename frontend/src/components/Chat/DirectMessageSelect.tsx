import { Box, Button } from '@chakra-ui/react';
import React from 'react';
// import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';

interface DirectMessageSelectProps {
  isViewingChatContainer: boolean;
  setIsViewingChatContainer: (isViewingChatContainer: boolean) => void;
}
export default function DirectMessageSelect({
  isViewingChatContainer,
  setIsViewingChatContainer,
}: DirectMessageSelectProps): JSX.Element {
  if (isViewingChatContainer) {
    return <ChatContainer />;
  }
  return (
    <div>
      Started:
      <Box>
        userName
        <Button onClick={() => setIsViewingChatContainer(true)}>Continue Chat</Button>
      </Box>
      Not Started:
      <Box>
        userName2
        <Button onClick={() => setIsViewingChatContainer(true)}>Start Chat</Button>
      </Box>
    </div>
  );
}
