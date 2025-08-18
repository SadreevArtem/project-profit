import localFont from "next/font/local";
import { useAuthStore } from "../../shared/stores/auth";
import { useEffect, useState } from "react";
import { useJwtToken } from "../../shared/hooks/useJwtToken";
import { Login } from "@/components/Login/Login";
import { AdminPanel } from "@/components/AdminPanel/AdminPanel";
import { GetStaticPropsContext } from "next";
import { UserPanel } from "@/components/UserPanel/UserPanel";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  };
}

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const [isClient, setIsClient] = useState(false);
  const isAuth = /^[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+$/.test(
    token
  );

  const { sub } = useJwtToken();
  const isAdmin = Number(sub) === 1;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} items-center justify-items-center min-h-screen`}
    >
      <main className="w-full">
        {!isAuth ? (
          <Login />
        ) : isAdmin ? (
          <AdminPanel title="PVB-Project Profit" />
        ) : (
          <UserPanel title="PVB-Project Profit" />
        )}
      </main>
      <footer className=""></footer>
    </div>
  );
}
