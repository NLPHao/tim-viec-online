"use client";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="site-container page-content">
      <section className="surface empty-state">
        <h1>Chưa tải được hồ sơ</h1>
        <p>Vui lòng thử lại sau.</p>
        <Button onClick={reset}>Thử lại</Button>
      </section>
    </main>
  );
}
