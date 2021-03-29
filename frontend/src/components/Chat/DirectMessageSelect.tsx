import {
    Box, Button, Heading, Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { MessageType } from '../../classes/MessageChain';
import Player from '../../classes/Player';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';

interface DirectMessageSelectProps {
    isViewingChatContainer: boolean;
    setIsViewingChatContainer: (isViewingChatContainer: boolean) => void;
}
export default function DirectMessageSelect({
    isViewingChatContainer,
    setIsViewingChatContainer,
}: DirectMessageSelectProps): JSX.Element {
    const { myPlayerID, players, directMessageChains } = useCoveyAppState();
    const [chosenDirectID, setDirectID] = useState<string>('');
    const playersWithChats: Player[] = [];
    const playersWithoutChats: Player[] = [];

    players.forEach((player) => {
        const directMessageId = [myPlayerID, player.id].sort().join(':');
        if (directMessageChains[directMessageId]) {
            playersWithChats.push(player);
        }
        else if (player.id !== myPlayerID) {
            playersWithoutChats.push(player);
        }
    })

    const handleChat = async (otherPlayerID: string) => {
        const directMessageId = [myPlayerID, otherPlayerID].sort().join(':');
        setDirectID(directMessageId);
        setIsViewingChatContainer(true);
    };

    if (isViewingChatContainer) {
        return <ChatContainer
            directMessageID={chosenDirectID}
            chainType={MessageType.DirectMessage}
        />;
    }
    return (
        <div>
            <Box>
                <Heading p="4" as="h3" size="md">Continue a Chat</Heading>
                <Table>
                    <Thead><Tr><Th>Player Name</Th><Th>Activity</Th></Tr></Thead>
                    <Tbody>
                        {playersWithChats.map((player) => (
                            <Tr key={player.id}>
                                <Td role='cell'>{player.userName} #{player.id.slice(-4)}</Td>
                                <Td role='cell'>
                                    <Button onClick={() => handleChat(player.id)}
                                    >Continue Chat</Button></Td></Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <Box>
                <Heading p="4" as="h3" size="md">Start a New Chat</Heading>
                <Table>
                    <Thead><Tr><Th>Player Name</Th><Th>Activity</Th></Tr></Thead>
                    <Tbody>
                        {playersWithoutChats.map((player) => (
                            <Tr key={player.id}>
                                <Td role='cell'>{player.userName} #{player.id.slice(-4)}</Td>
                                <Td role='cell'>
                                    <Button onClick={() => handleChat(player.id)}
                                    >Start Chat</Button></Td></Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </div>
    );
}
