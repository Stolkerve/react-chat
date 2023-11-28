"use client";

import { Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { CurrentUserContext } from "../hooks/userContext";

export default function Login({ socket }: { socket: Socket }) {
    const [loginLoading, setLoginLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [_, setUser] = useContext(CurrentUserContext)!;

    const navigate = useNavigate()
    
    useEffect(() => {
        socket.on("connect", () => {
            navigate("/chat")
        })
        socket.on("connect_error", (err) => {
            if (err.message === "Invalid username") {
                setLoginLoading(false);
                setUsername("")
                setErrorMsg("Nombre invalido o ya esta ocupado")
            }
        });

        return () => {
            socket.off("connect")
            socket.off("connect_error")
        };
    }, [])

    function handleSubmitlogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoginLoading(true);

        setUser({
            username
        })

        socket.auth = { username };
        socket.connect();
    }
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <Card>
                <h1 className="font-semibold text-2xl mb-3">
                    Bienvenido a React Chat
                </h1>
                <form onSubmit={handleSubmitlogin}>
                    <fieldset
                        disabled={loginLoading}
                        className="flex max-w-md flex-col gap-4"
                    >
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="username" value="Tu nombre de usuario" />
                            </div>
                            <TextInput
                                id="username"
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                required
                                maxLength={20}
                                minLength={2}
                            />
                        </div>
                        <Button type="submit">
                            {loginLoading ? (
                                <div className="flex items-center justify-between">
                                    <Spinner color="success" size="sm" />
                                    <span className="pl-3">Cargando...</span>
                                </div>
                            ) : (
                                <div>Ingresar</div>
                            )}
                        </Button>
                        <p className="font-medium text-red-500">{errorMsg}</p>
                    </fieldset>
                </form>
            </Card>
        </div>
    )
}