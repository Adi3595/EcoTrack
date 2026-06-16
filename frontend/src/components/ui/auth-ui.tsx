"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const loginData = new URLSearchParams();
      loginData.append("username", email);
      loginData.append("password", password);

      const response = await api.post("/auth/login", loginData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      
      const { access_token } = response.data;
      
      const userResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setAuth(access_token, userResponse.data);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" disabled={isLoading} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" disabled={isLoading} />
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await api.post("/auth/register", { full_name: name, email, password });
      
      const loginData = new URLSearchParams();
      loginData.append("username", email);
      loginData.append("password", password);
      
      const loginRes = await api.post("/auth/login", loginData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      const { access_token } = loginRes.data;
      
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setAuth(access_token, userRes.data);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" disabled={isLoading} /></div>
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" disabled={isLoading} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password" disabled={isLoading} />
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>{isLoading ? "Creating account..." : "Sign Up"}</Button>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const emailVal = formData.get("email") as string;
    setEmail(emailVal);
    
    try {
      await api.post("/auth/forgot-password", { email: emailVal });
      toast.success("Reset link sent! Please check your email.");
      onBack();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRequestReset} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email to receive a reset link</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} /></div>
        <Button type="submit" variant="default" className="mt-2" disabled={isLoading}>{isLoading ? "Sending..." : "Send Reset Link"}</Button>
        <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>Back to Sign In</Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle }: { isSignIn: boolean; onToggle: () => void; }) {
    const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    useEffect(() => {
        setView(isSignIn ? "signin" : "signup");
    }, [isSignIn]);

    const handleGoogleLogin = async () => {
        try {
            const { signInWithPopup } = await import("firebase/auth");
            const { auth, googleProvider } = await import("@/lib/firebase");
            
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            toast.info("Authenticating with EcoTrack backend...");
            
            const response = await api.post("/auth/google", { 
                email: user.email, 
                full_name: user.displayName || "Eco Warrior", 
                google_id: user.uid 
            });
            const { access_token } = response.data;
            const userResponse = await api.get("/auth/me", { headers: { Authorization: `Bearer ${access_token}` } });
            
            setAuth(access_token, userResponse.data);
            toast.success("Logged in with Google!");
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Firebase Google Auth error:", error);
            toast.error(error.message || "Google Auth failed");
        }
    };

    if (view === "forgot") {
        return <div className="mx-auto grid w-[350px] gap-2"><ForgotPasswordForm onBack={() => setView("signin")} /></div>;
    }

    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {view === "signin" ? (
                <>
                  <SignInForm />
                  <div className="text-center mt-[-10px] mb-4">
                    <Button variant="link" onClick={() => setView("forgot")} className="text-xs text-muted-foreground">Forgot your password?</Button>
                  </div>
                </>
            ) : <SignUpForm />}
            
            <div className="text-center text-sm">
                {view === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={onToggle}>
                    {view === "signin" ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button variant="outline" type="button" onClick={handleGoogleLogin}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=2560&auto=format&fit=crop",
        alt: "A beautiful forest landscape representing sustainability"
    },
    quote: {
        text: "Welcome Back! The journey to zero emissions continues.",
        author: "EcoTrack"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop",
        alt: "A vibrant, modern space for new eco-friendly beginnings"
    },
    quote: {
        text: "Join the movement. A new chapter in sustainability awaits.",
        author: "EcoTrack"
    }
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 bg-background">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
      </div>

      <div className="hidden md:block relative overflow-hidden bg-black">
        {/* Sign In Background - Always at bottom, slow zoom */}
        <div 
            className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
            style={{ backgroundImage: `url(${finalSignInContent.image.src})` }}
        />
        {/* Sign Up Background - Clip-path circular wipe on top, slow zoom */}
        <div 
            className="absolute inset-0 bg-cover bg-center animate-slow-zoom-reverse transition-all duration-[1200ms] ease-[cubic-bezier(0.645,0.045,0.355,1)]"
            style={{ 
              backgroundImage: `url(${finalSignUpContent.image.src})`,
              clipPath: !isSignIn ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)'
            }}
        />

        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        
        <div className="relative z-20 flex h-full flex-col items-center justify-end p-2 pb-6">
            <blockquote className="space-y-2 text-center text-foreground">
              <p className="text-lg font-medium text-white shadow-black drop-shadow-lg">
                “<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />”
              </p>
              <cite className="block text-sm font-light text-white/80 not-italic drop-shadow-md">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
