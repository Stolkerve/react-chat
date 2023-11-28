"use client";

import { Button, TextInput } from "flowbite-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Socket } from "socket.io-client";
import { Message, MsgType } from "../interfaces/message";
import { CurrentUserContext } from "../hooks/userContext";
import { useNavigate } from "react-router-dom";

export default function Chat({ socket }: { socket: Socket }) {
    const [{ username }, _] = useContext(CurrentUserContext)!;
    const [msgs, setMsgs] = useState<Message[]>([])
    const [users, setUsers] = useState<string[]>([])
    const [msgText, setMsgText] = useState("")
    const lastMsgRef = useRef<HTMLSpanElement>(null)
    const navigate = useNavigate()

    socket.on("chat-group", (data: Message) => {
        console.log("asd")
        setMsgs([...msgs, data])
    })
    socket.on("connect_error", (err) => {
        console.log(err.message);
    });

    socket.on("hello", (data: string) => {
        setUsers([...users, data])
        setMsgs(() => [...msgs, {
            data: `${data} se unio al chat!`,
            type: MsgType.INFO,
            username: ""
        }])
    })

    socket.on("bye", (data) => {
        console.log(data)
        users.splice(users.indexOf(data))
        setMsgs([...msgs, {
            data:  `${data} se retiro del chat!`,
            type: MsgType.INFO,
            username: ""
        }])
    })

    socket.on("users", (data: string[]) => {
        setUsers(data)
    })

    socket.on("disconnect", () => {
        navigate("/")
    })

    useEffect(() => {
        return () => {
            socket.off("chat-group")
            socket.off("connect_error")
            socket.off("hello")
            socket.off("bye")
            socket.off("users")
        }
    }, [])

    useEffect(() => {
        if (lastMsgRef) {
            lastMsgRef.current?.scrollIntoView({
                behavior: "smooth",
            })
        }
    }, [msgs])

    function handleSendMsg(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!msgText) {
            return
        }

        const msg: Message = { data: msgText, username: username, type: MsgType.USER }

        socket.emit("chat-group", msg)

        setMsgs([...msgs, msg])
        setMsgText("")
    }

    return (
        <>
            <div className="w-screen h-screen max-h-screen flex">
                <div className="max-w-[12.5rem] w-full bg-[#4b5563] overflow-y-scroll space-y-2">
                    <div>
                        <p className="px-2.5 py-1">
                            {username} (You)
                        </p>
                        <hr/>
                    </div>
                    {
                        users.map((user) => {
                            return (
                                user != username && <div>
                                    <p className="px-2.5 py-1">
                                        {user}
                                    </p>
                                    <hr/>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="w-full px-5 flex flex-col justify-between">
                    <ul className="flex flex-col mt-5 overflow-y-scroll">
                        {
                            msgs.map((msg, i) => <MsgBlob key={i} msg={msg} />)
                        }
                        <span ref={lastMsgRef} />
                    </ul>
                    <form className="py-5" onSubmit={handleSendMsg}>
                        <div className="flex items-center space-x-4">
                            <TextInput className="w-full" value={msgText} onChange={(e) => setMsgText(e.target.value)} />
                            <Button type="submit">
                                <FiSend className="h-5 w-5" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

function MsgBlob({ msg }: { msg: Message }) {
    const [{ username }, _] = useContext(CurrentUserContext)!;
    switch (msg.type) {
        case MsgType.INFO:
            return (
                <li className="flex justify-center mb-4">
                    <p className="ml-2 py-3 px-4 bg-blue-400 rounded-3xl text-white">
                        {msg.data}
                    </p>
                </li>
            )
        case MsgType.USER:
            return (
            <li className={`flex ${msg.username == username ? "justify-start" : "justify-end"} mb-4`}>
                <div className={`mr-2 py-3 px-4  ${msg.username == username ? "rounded-br-3xl bg-green-400" : "rounded-bl-3xl bg-gray-500"} rounded-tl-3xl rounded-tr-3xl text-white`}>
                   {msg.username != username && <p className="text-xs font-light">{msg.username}</p>}
                    <p>
                        {msg.data}
                    </p>
                </div>
            </li>
            )
    }
}