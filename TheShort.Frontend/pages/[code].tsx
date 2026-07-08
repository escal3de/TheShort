import type { GetServerSideProps } from "next";

const API_URL = process.env.API_URL || "http://localhost:5192";

type Props =
  | { redirect: { destination: string; permanent: true } }
  | { notFound: true };

const SHORT_CODE_RE = /^[a-zA-Z0-9]{6}$/;

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const code = params?.code as string;
  if (!code || !SHORT_CODE_RE.test(code)) return { notFound: true };

  try {
    const res = await fetch(`${API_URL}/api/short-links/${code}`);
    if (!res.ok) return { notFound: true };

    const data = await res.json();
    return {
      redirect: {
        destination: data.sourceUrl,
        permanent: true,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default function RedirectPage() {
  return null;
}
