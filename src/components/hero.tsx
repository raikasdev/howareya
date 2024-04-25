"use server";

import Link from "next/link";
import { LoginButton } from "~/components/login-button";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export const Hero = async () => {
  const session = await getServerAuthSession();

  return (
    <section className="container grid place-items-center gap-10 py-20 md:py-32 lg:grid-cols-2">
      <div className="space-y-6 text-center lg:text-start">
        <main className="text-5xl font-bold md:text-6xl">
          <h1 className="inline">
            Keep in contact with{" "}
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] bg-clip-text text-transparent">
              friends, family, co-workers
            </span>{" "}
            or just anyone using Cal.com
          </h1>
        </main>

        <p className="mx-auto text-xl text-gray-700 md:w-10/12 lg:mx-0">
          HowAreYa is a tool to automatically book meetings with your contacts
          every now and then. Just give us their link, meeting frequency,
          preferred time of day and we{"'"}ll take care of the rest.
        </p>

        <div className="space-y-4 md:space-x-4 md:space-y-0">
          <LoginButton session={session} />
          <Button className="max-w-screen w-64" variant="outline" asChild>
            <Link href="https://github.com/raikasdev/howareya">
              Source code
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10"></div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
