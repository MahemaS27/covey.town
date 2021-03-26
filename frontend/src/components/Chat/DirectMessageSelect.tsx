import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';



export default function DirectMessageSelect(): JSX.Element {
    // const { apiClient } = useCoveyAppState();
    const [isViewingChatContainer, setIsViewingChatContainer] = useState<boolean>(false);

    if (isViewingChatContainer === true) {
        return <ChatContainer />;
    }
    return (<div>
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

