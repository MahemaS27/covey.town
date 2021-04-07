import { Box, Button, Heading, Table, Tag, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React, { useState } from 'react';
import { DirectMessageParticipant, MessageType } from '../../classes/MessageChain';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';

interface DirectMessageSelectProps {
  isViewingChatContainer: boolean;
  setIsViewingChatContainer: (isViewingChatContainer: boolean) => void;
  onDirectChatOpen: (userName: string) => void;
}
export default function DirectMessageSelect({
  isViewingChatContainer,
  setIsViewingChatContainer,
  onDirectChatOpen,
}: DirectMessageSelectProps): JSX.Element {
  const { myPlayerID, players, directMessageChains } = useCoveyAppState();
  const [chosenDirectID, setDirectID] = useState<string>('');

  const chattedWithPlayers: string[] = [];
  const playersWithChats: DirectMessageParticipant[] = [];

  Object.values(directMessageChains).forEach(value => {
    if (value.participants) {
      const otherPlayer = value.participants.filter(
        participant => participant.userId !== myPlayerID,
      )[0];
      playersWithChats.push(otherPlayer);
      chattedWithPlayers.push(otherPlayer.userId);
    }
  });

  // don't want to direct chat with self
  chattedWithPlayers.push(myPlayerID);

  const playersWithoutChats = players.filter(
    playerToCheck => !chattedWithPlayers.includes(playerToCheck.id),
  );

  const handleChat = async (otherPlayerID: string, userName: string) => {
    const directMessageId = [myPlayerID, otherPlayerID].sort().join(':');
    setDirectID(directMessageId);
    setIsViewingChatContainer(true);
    onDirectChatOpen(userName);
  };

  const renderNotification = (participant: DirectMessageParticipant): JSX.Element | null => {
    const directMessageId = [participant.userId, myPlayerID].sort().join(':');
    const messageChain = directMessageChains[directMessageId];
    if (!messageChain) {
      return null;
    }
    if (messageChain.numberUnviewed < 1) {
      return null;
    }
    return (
      <Tag size='sm' textAlign='center' marginLeft='5px' bg='lightblue'>
        {messageChain.numberUnviewed}
      </Tag>
    );
  };

  if (isViewingChatContainer) {
    return <ChatContainer directMessageID={chosenDirectID} chainType={MessageType.DirectMessage} />;
  }
  return (
    <div>
      <Box>
        <Heading p='4' as='h3' size='md'>
          Continue a Chat
        </Heading>
        <Table>
          <Thead>
            <Tr>
              <Th>Player Name</Th>
              <Th>Activity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playersWithChats.map(participant => {
              const userName = `${participant.userName}#${participant.userId.slice(-4)}`;
              return (
                <Tr key={participant.userId}>
                  <Td role='cell'>
                    {participant.userName}#{participant.userId.slice(-4)}
                    {renderNotification(participant)}
                  </Td>
                  <Td role='cell'>
                    <Button onClick={() => handleChat(participant.userId, userName)}>Chat</Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <Box>
        <Heading p='4' as='h3' size='md'>
          Start a New Chat
        </Heading>
        <Table>
          <Thead>
            <Tr>
              <Th>Player Name</Th>
              <Th>Activity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playersWithoutChats.map(player => {
              const userName = `${player.userName}#${player.id.slice(-4)}`;
              return (
                <Tr key={player.id}>
                  <Td role='cell'>
                    {player.userName} #{player.id.slice(-4)}
                  </Td>
                  <Td role='cell'>
                    <Button onClick={() => handleChat(player.id, userName)}>Chat</Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </div>
  );
}
