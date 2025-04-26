import { redirect } from "next/navigation";

export default async function InitPage() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/init`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to initialize database");
    }

    redirect("/");
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Database Initialization Failed
          </h1>
          <p className="text-red-500 mb-4">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </p>
          <p className="text-gray-600 text-sm">
            Please check your database connection settings and try again.
          </p>
        </div>
      </div>
    );
  }
}
