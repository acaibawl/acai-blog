import type { Peer, Message } from 'crossws';

// 接続ユーザー(peer)単位にRealtime APIのセッションを管理
const connections: { [id: string]: Peer } = {};

export default defineWebSocketHandler({
  open(peer: Peer) {
    console.log('----------------shelterSocket----------------');
    console.log(`[peer] Connection opened: ${peer.toString()}`);
    connections[peer.id] = peer;
    // 全員に入室したことを通知する
    // Object.values(connections).forEach((peer) => {
    //   peer.send(JSON.stringify({ name: 'system', body: `Welcome ${peer.toString()}!` }));
    // });
  },
  message(peer: Peer, message: Message) {
    console.log(`[peer] Message received: ${message.toString()}`);
    const { name = 'system', body = '' } = JSON.parse(message.toString());
    // メッセージを受け取ったら、全てのユーザーにブロードキャスト
    Object.values(connections).forEach((peer) => {
      peer.send(JSON.stringify({ name, body }));
    });
  },
  close(peer: Peer) {
    console.log(`[peer] Connection closed: ${peer.toString()}`);
    connections[peer.id].close();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete connections[peer.id];
    console.log(`[peer] Connection closed: ${peer.toString()}`);
  },
});
