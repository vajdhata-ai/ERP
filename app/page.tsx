import React from 'react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          VAJDHATA
        </h1>
        <p className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-400">
          SCHOOL ERP
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Coming Soon
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            A production-grade, multi-tenant school administration and learning management system.
          </p>
        </div>
        <p className="mt-12 text-xs text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Vajdhata. All rights reserved.
        </p>
      </div>
    </main>
  )
}
