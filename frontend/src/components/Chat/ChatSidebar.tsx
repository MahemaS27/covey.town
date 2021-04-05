import { Button, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Tooltip } from '@chakra-ui/react';
import React, { useCallback, useMemo, useState } from 'react';
import { MessageType } from '../../classes/MessageChain';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatContainer from './ChatContainer';
import './ChatSidebar.css';
import DirectMessageSelect from './DirectMessageSelect';

export default function ChatSidebar(): JSX.Element {
  const [isViewingDirectChatContainer, setIsViewingDirectChatContainer] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [chatName, setChatName] = useState<string>('Direct Chats');
  const { townMessageChain, proximityMessageChain, directMessageChains } = useCoveyAppState();
  const numberUnviewedTownMessages = townMessageChain.numberUnviewed;
  const numberUnviewedProximityMessages = proximityMessageChain.numberUnviewed;
  const numberUnviewedDirectMessages = Object.values(directMessageChains).reduce(
    (acc, currentChain) => acc + currentChain.numberUnviewed,
    0,
  );

  const onTownChatSelect = useCallback(() => {
    setChatName('Town Chat');
    setIsViewingDirectChatContainer(false);
  }, [setChatName]);
  const onProximityChatSelect = useCallback(() => {
    setChatName('Proximity Chat');
    setIsViewingDirectChatContainer(false);
  }, [setChatName]);
  const onDirectChatSelect = useCallback(() => setChatName('Direct Chats'), [setChatName]);
  const onDirectChatOpen = useCallback(userName => setChatName(`Direct Chat with ${userName}`), [
    setChatName,
  ]);

  const townMessageNotifs = useMemo(() => {
    if (!numberUnviewedTownMessages) {
      return null;
    }
    return (
      <Tag size='sm' data-testid='town-notifs' textAlign='center' marginLeft='5px' bg='lightblue'>
        {numberUnviewedTownMessages}
      </Tag>
    );
  }, [numberUnviewedTownMessages]);

  const proximityMessageNotifs = useMemo(() => {
    if (!numberUnviewedProximityMessages) {
      return null;
    }
    return (
      <Tag
        data-testid='proximity-notifs'
        size='sm'
        textAlign='center'
        marginLeft='5px'
        bg='lightblue'>
        {numberUnviewedProximityMessages}
      </Tag>
    );
  }, [numberUnviewedProximityMessages]);

  const directMessageNotifs = useMemo(() => {
    if (!numberUnviewedDirectMessages) {
      return null;
    }
    return (
      <Tag size='sm' data-testid='direct-notifs' textAlign='center' marginLeft='5px' bg='lightblue'>
        {numberUnviewedDirectMessages}
      </Tag>
    );
  }, [numberUnviewedDirectMessages]);

  const handleReturnToSelect = useCallback(() => {
    if (isViewingDirectChatContainer) {
      setIsViewingDirectChatContainer(false);
      onDirectChatSelect();
    }
  }, [isViewingDirectChatContainer, setIsViewingDirectChatContainer, onDirectChatSelect]);

  const directMessageTab = isViewingDirectChatContainer ? 'All Direct Chats' : 'Direct Chats';

  const handleToggleExpandCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  const collapseExpandButton = useMemo(() => {
    const messageCount =
      numberUnviewedDirectMessages + numberUnviewedProximityMessages + numberUnviewedTownMessages;
    const messageCountToRender = messageCount > 100 ? '100+' : messageCount;
    const messageLabel = messageCount === 1 ? 'Message' : 'Messages';
    let symbol;
    if (isCollapsed) {
      symbol = '‹';
    } else {
      symbol = '›';
    }
    return (
      <Button
        data-testid='collapse-expand-button'
        onClick={handleToggleExpandCollapse}
        bg='lightblue'
        className='collapse-button'>
        <span
          style={{
            fontSize: '30px',
            paddingBottom: '5px',
            paddingRight: isCollapsed ? '5px' : undefined,
          }}>
          {symbol}
        </span>
        {isCollapsed ? ` ${messageCountToRender} ${messageLabel}` : null}
      </Button>
    );
  }, [
    handleToggleExpandCollapse,
    isCollapsed,
    numberUnviewedTownMessages,
    numberUnviewedProximityMessages,
    numberUnviewedDirectMessages,
  ]);

  const chatSidebarContent = useMemo(
    () => (
      <div className='sidebar-content' data-testid='sidebar-content'>
        <div className='sidebar-header' data-testid='sidebar-header'>
          {collapseExpandButton}
          <Tooltip label={chatName}>{` ${chatName}`}</Tooltip>
        </div>
        <Tabs isLazy isFitted variant='enclosed' defaultIndex={0} size='md'>
          <TabList>
            <Tab
              data-testid='direct-chat-tab'
              onClick={isViewingDirectChatContainer ? handleReturnToSelect : onDirectChatSelect}>
              {isViewingDirectChatContainer ? <span className='back-arrow'>‹</span> : null}
              {directMessageTab}
              {directMessageNotifs}
            </Tab>
            <Tab data-testid='town-chat-tab' onClick={onTownChatSelect}>
              Town Chat
              {townMessageNotifs}
            </Tab>
            <Tab data-testid='proximity-chat-tab' onClick={onProximityChatSelect}>
              Proximity Chat
              {proximityMessageNotifs}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel padding='0'>
              <DirectMessageSelect
                setIsViewingChatContainer={setIsViewingDirectChatContainer}
                isViewingChatContainer={isViewingDirectChatContainer}
                onDirectChatOpen={onDirectChatOpen}
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
    ),
    [
      isViewingDirectChatContainer,
      directMessageTab,
      handleReturnToSelect,
      setIsViewingDirectChatContainer,
      directMessageNotifs,
      townMessageNotifs,
      proximityMessageNotifs,
      collapseExpandButton,
      chatName,
      onTownChatSelect,
      onProximityChatSelect,
      onDirectChatSelect,
      onDirectChatOpen,
    ],
  );

  const collapsedChatSidebarContent = <>{collapseExpandButton}</>;

  return (
    <div className={`chat-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {isCollapsed ? collapsedChatSidebarContent : chatSidebarContent}
    </div>
  );
}
