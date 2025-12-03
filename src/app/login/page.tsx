
import Header from "@/app/components/header";
import LoginForm from "@/components/login-form";
import Footer from "@/app/components/footer";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <div className="flex min-h-[80vh] items-center justify-center p-4">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
