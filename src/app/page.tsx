import { LoginForm } from "@/components/auth/login/LoginForm";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-[90dvw] flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-[90dvw]">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
