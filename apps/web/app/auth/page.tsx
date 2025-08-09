import AuthForm from "../../components/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 pt-20 pb-12 relative">
      <div className="absolute inset-0 -z-10 hidden dark:block bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(79,70,229,0.15),transparent_55%)]" />
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Welcome to PredictX</h1>
        <AuthForm />
      </div>
    </div>
  );
}


