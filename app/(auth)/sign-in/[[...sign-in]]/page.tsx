import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8">
        <div className="max-w-md mx-auto w-full">
          {/* YNLINKS Logo - Left corner, larger */}
          <div className="mb-8">
            <div className="relative w-14 h-14">
              <Image
                src="/logoYnLinks.jpeg"
                alt="YNLINKS"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Heading - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black">Welcome back</h1>
            <p className="text-gray-500 mt-1">Sign in to your YNLINKS account</p>
          </div>

          {/* Original Clerk SignIn Form */}
          <SignIn />
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/image.png"
          alt="Sign In"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}