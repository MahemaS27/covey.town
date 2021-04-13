# DESIGN.md

## Message Lifecycle

![Design MD  4_11](https://user-images.githubusercontent.com/49101279/114626535-dbf65400-9c81-11eb-8d7a-816930fb9227.jpg)

We decided to follow the existing architecture of player movement as our model for how messages are sent. This involves having an event in a client (sending a message) trigger a socket emission that is received by the server, which then dispatches the event to relevant listeners corresponding to other clients. These listeners then emit the event to their clients. The clients receive the event and rerender the appropriate components.

This required modifying a decent amount of the existing classes on the backend, which are listed in the diagram above. We considered an alternative to the socket architecture, adding REST endpoints, but we decided to go with sockets as they are considerably faster and we wanted chat to be as instantaneous as possible.

We also modified the existing frontend architecture. We had to modify both the GameController and reducer, which were originally found in App.tsx. We wanted to test our changes, but that was impossible to do with these chunks of code in App.tsx, as Jest wouldn’t work with the JS Canvas import. We therefore decided to split GameController and reducer into their own files.

## React Components

![frontend components](https://user-images.githubusercontent.com/49101279/114627334-18767f80-9c83-11eb-9833-41ad6de040af.png)

We wanted a way to display all three forms of chat—Town Chat, Proximity Chat, and Direct Chat—without interrupting the game, as well as allow the user to seamlessly switch between these forms of chat. We therefore created a sidebar to the right of the game ( added to `App.tsx`) that uses `Tabs` (from the chakra library) to switch between Town Messages, Proximity Messages, and a `DirectMessageSelect`. The latter allows the player to select a user to communicate with in a Direct Chat. The Town Message and Proximity Message tabs lead directly to a `ChatContainer` —which contains all messages sent (`SingleMessage`) and an input to send new messages (`ChatInput`). From the `DirectMessageSelect`, players can open a chat container that displays all messages sent from their selected player and themselves. Moving hover or focus from the `ChatSidebar` restores all game controls. Many of these components retrieve data from the `CoveyAppState` to display content sent from the socket.

## Frontend Classes and Types

![Screen Shot 2021-04-13 at 5 51 40 PM](https://user-images.githubusercontent.com/49101279/114625882-e82de180-9c80-11eb-934d-aae549708931.png)

MessageType: used to differentiate our 3 chats
Message: responsibility of representing each message sent.

- Includes from and to so we can persist the showing of DirectMessages from players who have disconnected
  MessageChain: Represents each set of messages that each player has
- Has getters for messages, if the chain is active, participants (for direct message chains), and direct message ids (for direct message chain), and number of unviewed messages
- Has one class method for adding a message to the chain and one to clear notifications on that chain
  DirectMessageParticipant: Represents the relevant info of Players who are involved in a DirectMessageChain
- Each direct message chain would contain an array of 2 DirectMessageParticipants
  MessageChainHash: Used to store the complete collection of DirectMessageChains that a certain Player has started
- Makes accessing, checking for, and creating new direct conversations simpler
- Key-value pairs of directMessageId => MessageChain

## Backend Classes and Types

![Screen Shot 2021-04-13 at 5 57 29 PM](https://user-images.githubusercontent.com/49101279/114626449-b9fcd180-9c81-11eb-98a8-6fd5d539a9e7.png)

MessageType: used to differentiate between different types of messages
Message: represents the messages sent in each type of chat

- toUserName is only used if the MessageType is a DirectMessage
