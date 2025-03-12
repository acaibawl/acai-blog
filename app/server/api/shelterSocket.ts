import type { Peer, Message } from 'crossws';

// 接続ユーザー(peer)単位にRealtime APIのセッションを管理
const connections: { [id: string]: Peer } = {};

export default defineWebSocketHandler({
  open(peer: Peer) {
    connections[peer.id] = peer;
  },
  message(peer: Peer, message: Message) {
    const { name = 'system', body = '' } = JSON.parse(message.toString());
    // メッセージを受け取ったら、全てのユーザーにブロードキャスト
    Object.values(connections).forEach((peer) => {
      peer.send(JSON.stringify({ name, body }));
    });
  },
  close(peer: Peer) {
    if (connections[peer.id]) {
      connections[peer.id].close();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete connections[peer.id];
    }
  },
});
