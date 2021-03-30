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
        <TabList>
          <Tab onClick={isViewingDirectChatContainer ? handleReturnToSelect : undefined}>
            {isViewingDirectChatContainer ? <span className='back-arrow'>‹</span> : null}
            {directMessageTab}
          </Tab>
          <Tab>Town Chat</Tab>
          <Tab>Proximity Chat</Tab>
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
