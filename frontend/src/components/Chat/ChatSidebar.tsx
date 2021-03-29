import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useState } from 'react';
import { MessageType } from '../../classes/MessageChain';
import ChatContainer from './ChatContainer';
import './ChatSidebar.css';
import DirectMessageSelect from './DirectMessageSelect';

export default function ChatSidebar(): JSX.Element {
  const [isViewingDirectChatContainer, setIsViewingDirectChatContainer] = useState<boolean>(false);

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
        <TabList mb='1em'>
          <Tab onClick={isViewingDirectChatContainer ? handleReturnToSelect : undefined}>
            {directMessageTab}
          </Tab>
          <Tab>Town Chat</Tab>
          <Tab>Proximity Chat</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DirectMessageSelect
              setIsViewingChatContainer={setIsViewingDirectChatContainer}
              isViewingChatContainer={isViewingDirectChatContainer}
            />
          </TabPanel>
          <TabPanel>
            <ChatContainer chainType={MessageType.TownMessage} directMessageID=''/>
          </TabPanel>
          <TabPanel>
            <ChatContainer chainType={MessageType.ProximityMessage} directMessageID=''/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
