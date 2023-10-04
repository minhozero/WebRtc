import { Socket } from 'socket.io';
import { v4 as uuidV4 } from 'uuid';

const rooms: Record<string, string[]> = {};

interface IRoomParams {
    roomId: string;
    peerId: string;
}

export const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = uuidV4();
        rooms[roomId] = [];
        socket.emit('room-created', { roomId });
        console.log('user created the room!');
    }
    const joinRoom = ({ roomId, peerId }: IRoomParams) => {
        console.log('joinRoom :: peerId ', peerId);
        console.log('joinRoom :: roomId ', roomId);

        if (rooms[roomId]) {
            console.log("user joined the room!", roomId, peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
            socket.to(roomId).emit('user-joined', { peerId });
            console.log('rooms[roomId] :', rooms[roomId]);
            socket.emit('get-users', {
                roomId,
                participants: rooms[roomId],
            })
        }
        socket.on('disconnect', () => {
            console.log('user left the room', peerId);
            leaveRoom({ roomId, peerId });
        })
    };

    const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
        rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
        socket.to(roomId).emit('user-disconnected', peerId);
    };

    const startSharing = ({ peerId, roomId }: IRoomParams) => {
        socket.to(roomId).emit('user-started-sharing', peerId);
    };
    const stopSharing = (roomId: string) => {
        socket.to(roomId).emit('user-stopped-sharing');
    };

    socket.on('create-room', createRoom); // 방 생성
    socket.on('join-room', joinRoom); // 방 입장
    socket.on('start-sharing', startSharing);
    socket.on('stop-sharing', stopSharing);
}