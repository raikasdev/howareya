import { Navbar } from "~/components/navbar";
import { Hero } from "~/components/hero";

export default async function Home() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
