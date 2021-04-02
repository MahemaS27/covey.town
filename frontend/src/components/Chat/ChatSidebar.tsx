import { Tab, TabList, TabPanel, TabPanels, Tabs, Tag } from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { MessageType } from '../../classes/MessageChain';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';
import './ChatSidebar.css';
import DirectMessageSelect from './DirectMessageSelect';

export default function ChatSidebar(): JSX.Element {
  const [isViewingDirectChatContainer, setIsViewingDirectChatContainer] = useState<boolean>(false);
  const { townMessageChain, proximityMessageChain, directMessageChains } = useCoveyAppState();
  const numberUnviewedTownMessages = townMessageChain.numberUnviewed;
  const numberUnviewedProximityMessages = proximityMessageChain.numberUnviewed;
  const numberUnviewedDirectMessages = Object.values(directMessageChains).reduce(
    (acc, currentChain) => acc + currentChain.numberUnviewed,
    0,
  );
  
  const townMessageNotifs = useMemo(() => {
    if (!numberUnviewedTownMessages) {
      return null;
    }
    return (
      <Tag size='sm' textAlign='center' marginLeft='5px' bg='lightblue'>
        {numberUnviewedTownMessages}
      </Tag>
    );
  }, [numberUnviewedTownMessages]);

  const proximityMessageNotifs = useMemo(() => {
    if (!numberUnviewedProximityMessages) {
      return null;
    }
    return (
      <Tag size='sm' textAlign='center' marginLeft='5px' bg='lightblue'>
        {numberUnviewedProximityMessages}
      </Tag>
    );
  }, [numberUnviewedProximityMessages]);

  const directMessageNotifs = useMemo(() => {
    if (!numberUnviewedDirectMessages) {
      return null;
    }
    return (
      <Tag size='sm' textAlign='center' marginLeft='5px' bg='lightblue'>
        {numberUnviewedDirectMessages}
      </Tag>
    );
  }, [numberUnviewedDirectMessages]);

  const handleReturnToSelect = () => {
    if (isViewingDirectChatContainer) {
      setIsViewingDirectChatContainer(false);
    }
  };

  const directMessageTab = isViewingDirectChatContainer ? 'All Direct Chats' : 'Direct Chats';

  return (
    <div className='chat-sidebar'>
      <div className='sidebar-header'>Chat</div>
      <Tabs isLazy isFitted variant='enclosed' defaultIndex={0} size='md'>
        <TabList>
          <Tab onClick={isViewingDirectChatContainer ? handleReturnToSelect : undefined}>
            {isViewingDirectChatContainer ? <span className='back-arrow'>‹</span> : null}
            {directMessageTab}
            {directMessageNotifs}
          </Tab>
          <Tab>
            Town Chat
            {townMessageNotifs}
          </Tab>
          <Tab>
            Proximity Chat
            {proximityMessageNotifs}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel padding='0'>
            <DirectMessageSelect
              setIsViewingChatContainer={setIsViewingDirectChatContainer}
              isViewingChatContainer={isViewingDirectChatContainer}
            />
          </TabPanel>
          <TabPanel padding='0'>
            <ChatContainer chainType={MessageType.TownMessage} directMessageID={null} />
          </TabPanel>
          <TabPanel padding='0'>
            <ChatContainer chainType={MessageType.ProximityMessage} directMessageID={null} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
