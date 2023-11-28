export enum MsgType {
    INFO,
    USER,
}

export interface Message {
    type: MsgType
    username: string
    data: string
}