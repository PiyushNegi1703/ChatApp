"use client";

import React, { createRef, use, useRef } from "react";
import styles from "./chatSpace.module.scss";
import { useEffect, useState } from "react";
import socket from "@/socket";
import useRoomStore from "@/app/stores/roomStore";
import useUserStore, { User } from "@/app/stores/userStore";
import Image from "next/image";
import image from "@/public/channels4_profile.jpg";
import { toaster } from "@/app/utils";
import useUsersStore from "@/app/stores/usersStore";
import Notification from "../notification/Notification";

type MessageObj = {
  _id: string;
  content: string;
  sender: string;
  chat: string;
  createdAt: string;
};

const ChatSpace = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<MessageObj>>([]);
  const [chatUser, setChatUser] = useState<User>();
  const { currentRoom, rooms } = useRoomStore();
  const { users } = useUsersStore();
  const { user } = useUserStore();

  useEffect(() => {
    socket.on("connect", () => {
      toaster("success", "Ready to Chat");
      socket.emit("active", user?._id);
    });

    return () => {
      socket.on("disconnect", () => {
        toaster("error", "Disconnected! can not send messages");
      });
    };
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      const resp = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URI + "/messages",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            chatId: currentRoom ? currentRoom._id : "",
          },
        }
      );

      const data = await resp.json();

      if (!data.msg) {
        setMessages(data.messages);
      } else {
        toaster("error", data.msg);
      }
    }

    if (currentRoom) {
      fetchMessages();
    }
  }, [currentRoom]);

  socket.on("recieve_message", (msg: MessageObj) => {
    setMessages([...messages, msg]);
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function postMessage(msg: string) {
    const resp = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URI + "/chats/update",
      {
        method: "POST",
        body: JSON.stringify({
          content: msg,
          roomid: currentRoom?.room,
          userid: user?._id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await resp.json();

    if (!data.msg) {
      setMessages([...messages, data.message]);
      socket.emit("send_message", {
        input: data.message,
        id: currentRoom?.room,
      });
      setInput("");
    } else {
      toaster("error", data.msg);
    }
  }

  function handleClick() {
    if (input.length > 0) {
      postMessage(input);
    } else {
      toaster("error", "Message can't be empty");
    }
  }

  const display = function (e: MessageObj, i: number) {
    return (
      <div
        key={i}
        className={e.sender == user?._id ? styles.sent : styles.recieved}
      >
        {e.content}
      </div>
    );
  };

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleClick();
    }
  }

  function handleErrorClick() {
    toaster("error", "Please select a room");
  }

  useEffect(() => {
    if (user && currentRoom && users) {
      const userId = currentRoom.users.find((e) => e != user._id);
      setChatUser(users.find((usr) => usr._id == userId));
    }
  }, [currentRoom, users, user]);

  return (
    <div className={styles.wrapper}>
      {user && (
        <div className={styles.headerContainer}>
          {/* <h1>Chat Space</h1> */}
          <h1>Hi, {user.f_name}</h1>
          <div className={styles.profileContainer}>
            <Notification />
            <Image src={user.pic} alt="" width={50} height={50} />
          </div>
        </div>
      )}
      {currentRoom ? (
        <div className={styles.container}>
          {chatUser && (
            <div className={styles.chatInfo}>
              <Image src={chatUser.pic} alt="" width={50} height={50} />
              <h3 style={{ color: "black" }}>{chatUser.f_name}</h3>
            </div>
          )}

          <hr className={styles.infoDivider} />

          <div className={styles.chatsContainer}>
            {messages && messages.map(display)}
          </div>

          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type something here"
              onChange={handleChange}
              value={input}
              onKeyDown={handleKeyPress}
            />
            <button onClick={currentRoom ? handleClick : handleErrorClick}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div>Lets start chatting</div>
      )}
    </div>
  );
};

export default ChatSpace;
