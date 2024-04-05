import ChatsNav from "@/app/components/chatsNavigation/ChatsNav";
import styles from "./page.module.scss";
import ChatSpace from "@/app/components/chatSpace/ChatSpace";

export default function Home() {
  return (
    <main className={styles.main}>
      <ChatsNav />
      <hr />
      <ChatSpace />
    </main>
  );
}
