import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          Lexicon Master
        </h1>
        <p className="text-center text-lg mb-8">
          Master Your Vocabulary, Analyze Your Text
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/auth/register"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/auth/login"
            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}
