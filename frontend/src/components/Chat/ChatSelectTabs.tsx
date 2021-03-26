import React from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import DirectMessageSelect from './DirectMessageSelect';
import ChatContainer from './ChatContainer';

export default function ChatSelectTabs(): JSX.Element {
  return (
    <Tabs isFitted variant='enclosed' defaultIndex={0} size="md">
      <TabList mb='1em'>
        <Tab>All Direct Chats</Tab>
        <Tab>Town Chat</Tab>
        <Tab>Proximity Chat</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <DirectMessageSelect/>
        </TabPanel>
        <TabPanel>
          <ChatContainer/>
        </TabPanel>
        <TabPanel>
          <ChatContainer/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

