import React from 'react';
import ChatSelectTabs from './ChatSelectTabs';
import './ChatSidebar.css';

export default function ChatSidebar(): JSX.Element {
  return (
    <div className='chat-sidebar'>
      <div className='sidebar-header'>Chat</div>
      <ChatSelectTabs/>
    </div>
  );
}
