import type { GetServerSideProps } from "next";

const API_URL = process.env.API_URL || "http://localhost:5192";

type Props =
  | { redirect: { destination: string; permanent: true } }
  | { notFound: true };

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const code = params?.code as string;
  if (!code) return { notFound: true };

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
