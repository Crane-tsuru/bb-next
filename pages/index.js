import { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "../components/fire";
import Head from "next/head";
import Link from 'next/link';
import classes from "../styles/Home.module.css"

const db = firebase.firestore();

export default function Home() {
  const mydata = [];
  const mydata2 = [];

  const [data, setData] = useState(mydata);
  const [data2, setData2] = useState(mydata2);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState("");
  const [flag, setFlag] = useState(false);
  const [num, setNum] = useState(0);
  const [replyFlag, setReplyFlag] = useState(false);

  const onChangeName = (e) => {
    setName(e.target.value); //nameに投稿者の名前を代入
  };
  const onChangeText = (e) => {
    setText(e.target.value); //textに投稿文を代入
  };
  const onChangeReplyName = (e) => {
    setReplyName(e.target.value); //nameに返信者の名前を代入
  };
  const onChangeReplyText = (e) => {
    setReplyText(e.target.value); //textに返信文を代入
  };

  //Firebaseに投稿文を追加.その後useEffect起動
  const addText = (e) => {
    if (name.length === 0 || text.length === 0) {
      setMessage(
        "未入力エラーです"
      );
    } else {
      const ob = {
        name: name,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        id: db.collection("mydata").doc(),
        reply: false,
      };
  
      ob.id.set(ob).then(() => {     
        setText("");//テキストボックスをクリア
        setFlag(!flag);
        setMessage("投稿しました");
      });
    }
  };

  //返信ボタンが押されたらreplyフィールドを反転、idを保存.その後useEffect起動
  const ReplyBotton = (id, reply) => { 
    if (reply) {
      id.update({
        reply: false,
      }).then(() => {
        setReplyFlag(!replyFlag);
        setFlag(!flag);
      });
    } else {
      id.update({
        reply: true,
      }).then(() => {
        setReplyFlag(!replyFlag);
        setFlag(!flag);
      });
    }
    setReplyId(id);
  };

  //Firebaseに返信文を追加
  const addReplyText = (e) => {
    const ob = {
      name: replyName,
      text: replyText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      id: replyId,
    };

    ob.id
      .collection("replyText")
      .add(ob) 
      .then(() => {
        setReplyText("");//テキストボックスをクリア
        setFlag(!flag);
        setMessage("返信しました");
      });
  };

  //初回とflagが変わったときに実行（表示の更新）
  useEffect(() => {   
    mydata.length = 0;
    mydata2.length = 0;
    let replyBotton = true;

    //mydataコレクションのドキュメントを取得.投稿時間で昇順にソート.
    db.collection("mydata")
      .orderBy("timestamp", "asc")
      .get()
      .then(async(snapshot) => {
        
        for await(const document of snapshot.docs) {
          const doc = document.data(); //docにフィールドの情報がまとめられたオブジェクトを代入

          if (replyBotton) {
            if (doc.reply) replyBotton = false; //replyフィールドがtrueだったら次の投稿からmydata2にpush
            mydata.push(
              <div>
                <div>
                  名前:{doc.name}　
                  {new Date(doc.timestamp?.toDate()).toLocaleString()}　
                  <button onClick={() => ReplyBotton(doc.id, doc.reply)}>
                    返信
                  </button>
                </div>
                <div>{doc.text}</div>
              </div>
            );
          } else {
            mydata2.push(
              <div>
                <div>
                  名前:{doc.name}　
                  {new Date(doc.timestamp?.toDate()).toLocaleString()}　
                  <button onClick={() => ReplyBotton(doc.id, doc.reply)}>
                    返信
                  </button>
                </div>
                <div>{doc.text}</div>
              </div>
            );
          }
        
          const snapshot2 = await doc.id
            .collection("replyText")
            .orderBy("timestamp", "asc")
            .get();
            
              snapshot2.forEach((document2) => {
                const doc2 = document2.data();

                if (replyBotton) {
                  if (doc.reply) replyBotton = false;
                  mydata.push(
                    <div>
                      <div>
                        ＞＞名前:{doc2.name}　
                        {new Date(doc2.timestamp?.toDate()).toLocaleString()}　
                      </div>
                      <div>　　{doc2.text}</div>
                    </div>
                  );
                } else {
                  mydata2.push(
                    <div>
                      <div>
                        ＞＞名前:{doc2.name}　
                        {new Date(doc2.timestamp?.toDate()).toLocaleString()}　
                      </div>
                      <div>　　{doc2.text}</div>
                    </div>
                  );
                }
              }); //forEach(document2)

              setData(mydata); //mydataをdataに代入
              setData2(mydata2); //mydataをdataに代入
              setMessage(
                "質問などあればお書きください"
              );
              setNum((prev) => prev + 1)

        }; //forEach(document)
      }); //snapshot
      
  }, [flag]);

  return (
    <div>
      <Head>
        <title>C0deWeb班掲示板</title>
        <meta name="description" content="名工大プログラミング部C0deのWeb班が制作した質問掲示板です。"  />
      </Head>
      <h2 className={classes.title}>C0de Web班掲示板 {message}</h2>
      <Link href="/blog">
        Web班のブログへ
      </Link>

      <table>
        <thead>
          <tr>{data}</tr>
        </thead>
      </table>

      {replyFlag && (
        <div>
          <p>
            お名前　
            <input
              type="text"
              value={replyName}
              maxLength="20"
              onChange={onChangeReplyName}
            />
          </p>
          <p>
            返信内容　
            <textarea className={classes.textarea} value={text} onChange={onChangeReplyText} rows="4" cols="50" maxLength="400"/>
          </p>
          <button onClick={addReplyText}>返信する</button>
        </div>
      )}

      <table>
        <thead>
          <tr>{data2}</tr>
        </thead>
      </table>

      <p>
        お名前　
        <input
          type="text"
          value={name}
          maxLength="20"
          onChange={onChangeName}
        />
      </p>
      <p>
        投稿内容　
        <textarea className={classes.textarea} value={text} onChange={onChangeText} rows="4" cols="50" maxLength="400"/>
      </p>
      <button onClick={addText}>投稿する</button>
    </div>
  );
}
