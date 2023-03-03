import { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "../components/fire";
import Head from "next/head";
import Link from "next/link";
import classes from "../styles/Home.module.css";

const db = firebase.firestore();

export default function Home() {
  const mydata = [];
  let replyArray = [];
  let index = -1;
  let replyCount = 0;
  const [data, setData] = useState(mydata);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [addIndex, setAddIndex] = useState(0);
  const [count, setCount] = useState(0);
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
      setMessage("未入力エラーです");
    } else {
      const ob = {
        name: name,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        id: db.collection("mydata").doc(),
        index: addIndex + 1,
      };

      ob.id.set(ob).then(() => {
        setText(""); //テキストボックスをクリア
        setFlag(!flag);
        setMessage("投稿しました");
      });
    }
  };

  //返信ボタンが押されたらreplyFlagを反転、idを保存、押された投稿よりも上にある投稿の数を数える
  const ReplyBotton = (id, Index) => {
    if (replyFlag) {
      setReplyFlag((prev) => !prev);
      setReplyId(id);
    } else {
      setReplyFlag((prev) => !prev);
      setReplyId(id);
    }

    replyCount = 0;
    for (let i = 0; i <= Index; i++) {
      replyCount += replyArray[i];
    }
    index = Index;
    setCount(index + replyCount + 1);
  };

  //Firebaseに返信文を追加
  const addReplyText = (e) => {
    if (name.length === 0 || text.length === 0) {
      setMessage("未入力エラーです");
    } else {
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
          setReplyText(""); //テキストボックスをクリア
          setFlag(!flag);
          setMessage("返信しました");
        });
    }
  };

  //初回とflagが変わったときに実行（表示の更新）
  useEffect(() => {
    mydata.length = 0;

    //mydataコレクションのドキュメントを取得.投稿時間で昇順にソート.
    db.collection("mydata")
      .orderBy("timestamp", "asc")
      .get()
      .then(async (snapshot) => {
        for await (const document of snapshot.docs) {
          const doc = document.data(); //docにフィールドの情報がまとめられたオブジェクトを代入

          index += 1;

          mydata.push(
            <div>
              <div>
                名前:{doc.name}　
                {new Date(doc.timestamp?.toDate()).toLocaleString()}　
                <button onClick={() => ReplyBotton(doc.id, doc.index)}>
                  返信
                </button>
              </div>
              <div>{doc.text}</div>
            </div>
          );
          if (!replyArray[index]) {
            replyArray[index] = 0;
          }

          //replyTextコレクションのドキュメント(返信内容)を取得.投稿時間で昇順にソート.
          const snapshot2 = await doc.id
            .collection("replyText")
            .orderBy("timestamp", "asc")
            .get();

          snapshot2.forEach((document2) => {
            const doc2 = document2.data();

            mydata.push(
              <div>
                <div>
                  ＞＞名前:{doc2.name}　
                  {new Date(doc2.timestamp?.toDate()).toLocaleString()}　
                </div>
                <div>　　{doc2.text}</div>
              </div>
            );

            if (replyArray[index]) { //replyArray[index]>=1の場合
              replyArray[index] += 1;
            } else { //replyArray[index]===0の場合            
              replyArray[index] = 1;
            }
          }); //forEach(document2)

          setData(mydata); //mydataをdataに代入
          setAddIndex(index);
          setMessage("質問などあればお書きください");
          setNum((prev) => prev + 1);
        } //forEach(document)
      }); //snapshot
  }, [flag]);

  return (
    <div>
      <Head>
        <title>C0deWeb班掲示板</title>
        <meta
          name="description"
          content="名工大プログラミング部C0deのWeb班が制作した質問掲示板です。"
        />
      </Head>
      <Link className={classes.link} href="/blog">
        Web班のブログへ
      </Link>
      <h2 className={classes.title}>C0de Web班掲示板 {message}</h2>

      {replyFlag ? (
        <table>
          <thead>
            <tr>{data.slice(0, count)}</tr>
          </thead>
        </table>
      ) : (
        <table>
          <thead>
            <tr>{data}</tr>
          </thead>
        </table>
      )}

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
            <textarea
              className={classes.textarea}
              value={replyText}
              onChange={onChangeReplyText}
              rows="4"
              cols="50"
              maxLength="400"
            />
          </p>
          <button onClick={addReplyText}>返信する</button>

          <table>
            <thead>
              <tr>{data.slice(count, data.length)}</tr>
            </thead>
          </table>
        </div>
      )}

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
        <textarea
          className={classes.textarea}
          value={text}
          onChange={onChangeText}
          rows="4"
          cols="50"
          maxLength="400"
        />
      </p>
      <button onClick={addText}>投稿する</button>
    </div>
  );
}
