"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Turnstile } from "@/components/auth/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { validateSchoolEmail } from "@/lib/email";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    grade: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateSchoolEmail(form.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName,
              grade: form.grade,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! Complete your profile.");
        router.push("/settings");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        router.push("/vote");
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard glow className="p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-white">
          {mode === "login" ? "Welcome back" : `Join ${APP_NAME}`}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {mode === "login"
            ? "Sign in with your school email"
            : "Create your student account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="grade">Class / Grade</Label>
              <Input
                id="grade"
                required
                placeholder="e.g. 11A"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">School email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@edu.riga.lv/you@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <Turnstile onVerify={() => {}} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-white/50">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-violet-400 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have one?{" "}
            <Link href="/login" className="text-violet-400 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </GlassCard>
  );
}
