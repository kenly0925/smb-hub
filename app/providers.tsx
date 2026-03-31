"use client";

import { Prototype1DemoProvider } from "@/components/prototype1/demo-provider";
import { FloatingDemoMenu } from "@/components/prototype2/floating-demo-menu";
import { Prototype2DemoProvider } from "@/components/prototype2/demo-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Prototype1DemoProvider>
      <Prototype2DemoProvider>
        {children}
        <FloatingDemoMenu />
      </Prototype2DemoProvider>
    </Prototype1DemoProvider>
  );
}
