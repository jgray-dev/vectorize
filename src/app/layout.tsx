import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import NavBar from "~/app/_components/NavBar";

export const metadata = {
  title: "Vectorize",
  description: "https://linkedin.com/in/jackson--gray/",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={"bg-black/80 text-white"}>
      <NavBar />
      {children}
      </body>
    </html>
  );
}
