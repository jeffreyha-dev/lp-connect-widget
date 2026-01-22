"use client";

import CCPContainer from './components/CCPContainer';

export default function Home() {
  // TODO: Replace with environment variable or user input
  // Example: https://my-instance.my.connect.aws/ccp-v2/
  const CONNECT_INSTANCE_URL = process.env.NEXT_PUBLIC_CONNECT_INSTANCE_URL || "https://example.my.connect.aws/ccp-v2/";
  const CONNECT_REGION = process.env.NEXT_PUBLIC_CONNECT_REGION || "us-east-1";

  if (CONNECT_INSTANCE_URL.includes("example")) {
    console.warn("Using placeholder Connect Instance URL. Please configure NEXT_PUBLIC_CONNECT_INSTANCE_URL.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white">
      <div className="w-full h-full min-h-screen flex">
        {/* 
           Sidebar Widget Area (Simulating LivePerson Widget dimensions)
           In production, this might be the only content, but for dev we center it or fill.
           The widget usually runs in an iframe, so we treat the body as the container.
         */}
        <CCPContainer
          instanceUrl={CONNECT_INSTANCE_URL}
          region={CONNECT_REGION}
        />
      </div>
    </main>
  );
}
