
import RegisterForm from "@/components/register-form";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <RegisterForm />
      </div>
      </main>
      <Footer />
    </>
  );
}
