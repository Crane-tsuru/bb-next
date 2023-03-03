import Head from "next/head";
import Link from 'next/link';
import { client } from "../libs/client";
import classes from '../components/BlogList.module.scss';

export default function Blog({ blog }) {
  return (
    <div className={classes.main}>
       <Head>
        <title>Web班のブログ</title>
        <meta name="description" content="名工大プログラミング部C0deのWeb班のブログです。"  />
      </Head>
        <Link className={classes.link} href="/">
        掲示板へ
      </Link>
      <ul>
        {blog.map((blog) => (
          <li key={blog.id}>
            <div className={classes.card}>
            <Link className={classes.link} href={`/blog/${blog.id}`}>{blog.title}</Link>　{new Date(blog.publishedAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// データをテンプレートに受け渡す部分の処理を記述します
export const getStaticProps = async () => {
  const data = await client.get({ endpoint: "blog" });

  return {
    props: {
      blog: data.contents,
    },
  };
};

