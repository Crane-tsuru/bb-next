import Head from "next/head";
import Link from 'next/link';
import { client } from '../../libs/client';
import classes from '../../components/Blog.module.scss';

export default function BlogId({ blog }) {
  return (
    <main className={classes.main}>
      <Head>
        <title>{blog.title}</title>
        <meta name="description" content="名工大プログラミング部C0deのWeb班のブログです。"  />
      </Head>
        <Link className={classes.link} href="/blog">
        戻る
      </Link>
      <h1 className={classes.title}>{blog.title}</h1>
      <p className={classes.publishedAt}>{new Date(blog.publishedAt).toLocaleDateString()}</p>
      <div
        dangerouslySetInnerHTML={{
          __html: `${blog.body}`,
        }}
        className={classes.post}
      />
    </main>
  );
}
// 静的生成のためのパスを指定します
export const getStaticPaths = async () => {
  const data = await client.get({ endpoint: "blog" });

  const paths = data.contents.map((content) => `/blog/${content.id}`);
  return { paths, fallback: false };
};

// データをテンプレートに受け渡す部分の処理を記述します
export const getStaticProps = async (context) => {
  const id = context.params.id;
  const data = await client.get({ endpoint: "blog", contentId: id });

  return {
    props: {
      blog: data,
    },
  };
};