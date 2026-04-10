import Clock from "@/components/Clock";
import Quote from "@/components/Quote";
import Weather from "@/components/Weather";
import TaskList from "@/components/TaskList";

export default function Home() {
  return (
    <>
      <div className="bg-mesh" />
      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <Clock />
        <Quote />
        <Weather />
        <TaskList />
        <footer className="mt-4 text-center">
          <p className="text-muted/30 text-xs tracking-wider">
            Personal Dashboard
          </p>
        </footer>
      </main>
    </>
  );
}
