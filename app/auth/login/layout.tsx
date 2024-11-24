import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Veedence Accountability Coaching | AI-Powered Personal Growth Dashboard",
  description: "Log in to Veedence's AI-powered accountability coaching platform. Track your goals, uncover hidden potential, and experience a coach that remembers your journey and adjusts to your needs. Progress starts here!",
  keywords: "AI accountability coach, coaching dashboard, AI-powered personal growth, goal tracking, Veedence coaching login, milestone progress, personalized coaching platform",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
