import { createContext } from "react";
import { UserContext } from "../interfaces/user";

export const CurrentUserContext = createContext<[UserContext, React.Dispatch<React.SetStateAction<UserContext>>] | null>(null);